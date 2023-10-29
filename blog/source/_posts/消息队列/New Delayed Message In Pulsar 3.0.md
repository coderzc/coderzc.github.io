# New Delayed Message In Pulsar 3.0

# 什么是延迟消息

我们先考虑这样一个场景，在电商系统中，当用户下单后我们希望如果30分钟未支付自动关闭订单，那么我应该如何实现这个需求呢，一个很容易想到的方案是轮询，我们可以创建一个定时任务每隔1分钟去扫描订单表，查出那些超过30分钟未支付的订单，然后关闭它们。这个方案有两个问题，一是定时任务有一个1分钟的时间间隔，所有关闭订单的时间不够精准，二是我们需要频繁的对订单表进行扫描订单表，这对数据库的压力比较大，那有没有不需要扫表就可以实现这个功能的方法呢。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292220321.png" alt="image-20231029222027410" style="zoom:50%;" />

我们其实可以考虑使用消息队列的delayed message的功能，用户下单后向MQ中发送一条delay 30 分钟的延迟消息其中包含订单ID，订单服务在30分钟后将收到这条消息，并从该消息中解析出订单ID，然后判断该订单是否已经完成了支付，如果还未完成了支付则关闭该订单。这就是delayed message 一个常见的应用。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292221006.png" alt="Untitled" style="zoom:50%;" />

Pulsar 在 2.4.0 中首次引入了延迟消息传递的功能，Pulsar中的延迟delayed message功能与上面的提到的消息队列中的延迟消息基本一致，但是有两点需要注意。

1. Pulsar 支持的是任意时间粒度的延迟消息投递，它可以跨度很大，1s或半年，这不同于开源 RocketMQ 只支持固定时间粒度的延迟消息；

2. Pulsar支持在一个Topic中，既有延迟消息，也有非延迟消息。

下图展示了 Pulsar 中延迟消息的具体过程：Producer 发送了m1-m5 5条消息，其中m2是普通消息，m1/m3/m4/m5 是具有不同延迟时间的延迟消息，Consumer 将立即收到m2这条普通消息。然后在10s后收到m5, 2分钟后收到m1和m4，然后在1年后收到m1。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292221083.png" alt="Untitled" style="zoom:50%;" />

# 如何使用 Pulsar 延迟消息

首先，在 Pulsar 中发送延迟消息也比较简单，Producer 在发送消息时可以使用 deliverAfter 和 deliverAt 两种方式来发送延迟消息。其中 deliverAt 可以指定具体的时间戳表示延迟到未来某一时刻交付该消息；deliverAfter 可以指定在当前多长时间后交付该消息。两种方式的本质是一样的，对于deliverAfter，Client 会计算出到期的时间戳送到 Broker。

1. **deliverAt send**

   ```java
   producer.newMessage()
   				.deliverAt(long timestamp)
   				.send();
   ```

   

2. **deliverAfter send**

   ```java
   producer.newMessage()
   				.deliverAfter(long time, TimeUnit unit)
   				.send();
   ```

   

此外，对于 Consumer 端使用方法则与接受普通消息一样，但有一点需要注意 Consumer 的 subscriptionType 必须是 Shared，这是由于delayed message 将破坏消息的交付顺序，而 Exclusive/Failover 模式需要保证消息的顺序性。

```java
Consumer<byte[]> Consumer = newPulsarClient.newConsumer();
		.topic("my-topic")
		.subscriptionType(SubscriptionType.Shared)
		.subscribe();
```

# 延迟消息在Pulsar中是如何工作的

当 Broker 收到一条延迟消息，broker 不会立即投递它而是先把它加入到 Delayed Delivery Tracker 中，Delayed Delivery Tracker 使用堆外内存维护了一个优先级队列，这个优先级队列中存放的是延迟消息的索引，index由三个 Long 值组成，分别是 Timestamp｜LedgerId | EntryId, 这些 delayed index 在优先级队列中根据到期时间进行堆排序，到期时间最短的会放在头上，时间越长越靠后。

当 Consumer 在消费时， Dispacter 会先去 Delayed Delivery Tracker 检查是否有到期需要投递的消息，如果有到期的消息，则从 Tracker 中拿出对应的 index，然后根据index中的 LedgerID 和 EntryID 读取到对应的消息发送给消费者；如果没有到期的消息，则直接交付后面的正常的消息。

此外，如果集群出现 Broker 宕机或者 Topic 的 ownership 转移，Pulsar 会重建 DelayedDeliveryTracker 中的 delayed index 队列，来保证延迟投递的消息能够正常工作。

![Untitled](https://gitee.com/coderzc/blogimage/raw/master/202310292221687.png)

# Pulsar 延迟消息的挑战

尽管 Pulsar 的延迟消息实现方法在简单性和效率方面表现出色，并且对 Pulsar 内核的侵入性较小，但我们也发现了Pulsar之前的延迟消息实现方法无法支持大规模的延迟消息使用。主要有以下两个原因：

1. delayed index 优先级队列被内存限制

Pulsar 的延迟消息实现存在内存限制。由于 delayed index 是维护在内存中的，这对于大规模的延迟消息使用来说可能会成为一个瓶颈。随着延迟消息数量的增加，需要消耗更多的内存资源来维护delayed index，最终中会导致 broker 内存不足发生 out of memory 异常。尽管我们可以通过增加 Topic 的 Partition 数量来使得这些 delayed index 分发到多个 Broker 中，但这并不能改变使用大量 Broker 内存的事实。

2. 高昂的 delayed index 重建开销

当集群出现 Broker 宕机或者 Topic 的 ownership 转移时，Pulsar 需要重建 delayed index 队列，这需要读取Topic上的所有延迟消息，对于持有大规模延迟消息Topic，它的重建时间可能会非常长，甚至达到小时级别。只要订阅处于延迟重建索引的情况下，消费者就无法消费该Topic的消息；这将带来更多的消费者不可用时间。

为了解决这些限制，社区在 Pulsar 3.0 中引入了一种新的延迟消息机制。 对于新延迟消息设计有两个目标：

1. 使得延迟消息的规模可以不受内存限制。
2. 支持 delayed index 快照来避免高昂的 delayed index 重建开销。

# 新版延迟消息的设计

首先，为了保持兼容性和平滑的升级/降级，新的延迟消息机制将尽可能不破坏之前生产和消息流程，但是重新设计并实现了一个 Bucket-Based Delayed Delivery Tracker 来代替之前的 In-Memory Delayed Delivery Tracker，我们来看一下这个 Bucket-Based Delayed Delivery Tracker 里都做了什么。

在新的实现中，Bucket-Based Delayed Delivery Tracker 将根据 Ledger 的维度将所有的 delayed index 拆分成多个 Bucket，一个 Bucket 包含1个或多个 Ledger的延迟消息的索引，并将这些 Bucket 存储到 Bookkeeper 上， 一个 Bucket 将存储在一个 Ledger 上。需要注意的是生成的这些 Bucket 和 Ledger一样是不可变的，一旦 Bucket 封闭将其将变为只读模式，不可以在写入或更新里面的数据。这将使得我们不需要频繁的修改 Bucket 内的数据来减少IO操作带来的开销。当一个 Bucket 封闭后它将生成一个 Bucket Snapshot 保存到 Bookkeeper 中，并将 Bucket 的存储位置信息放到这个订阅所关联的 Cursor Properties 中，例如 `BUCKET_1_2:90` 表示 Ledger1-Ledger2 这个范围内的delayed index存放在Ledger90 这个 Ledger 上。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292221594.png" alt="image-20231020192645388" style="zoom: 33%;" />

然后我们再来看一下每个 Bucket 内部的结构，Tracker 将每一个 bucket 中的 delayed index 按照时间范围拆分为多个 segment, 每个 segment 只包含这个Bucket 所持有的 index 的一小段，Tracker 只需加载每一个Bucket 中最先到期的那个segment到内存中，而把其余的 index 保留在磁盘上。与之前的实现类似在 Tacker 中存在一个共享的优先级队列，每一个 Bukctet 的 segment 会加载到这个共享的优先级队列中进行排序，当 Consumer 消费时， Dispacter 则会从这个共享的索引优先级队列中获取到期的delayed index。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292221796.png" alt="image-20231020194025388" style="zoom:33%;" />

那么每一个Bucket是如何生成的呢，在 Tracker 中还存在一个特殊的 Bucket - LastMutableBucket, 所有加入 Tracker 的 delayed index 会先放入到 LastMutableBucket 中的优先级队列中，当 LastMutableBucket 存放的 delayed index 数量达到阈值后，Tracker 将生成一个不可变的 Bucket，并将  LastMutableBucket 中的 delayed index 按照时间范围拆分成多个 segment 后移动到新的 Bucket 中，然后将这个 Bucket 持久化到 Bookkeeper 中。

后面 Tracker 还可以继续复用这个 LastMutableBucket 来接受新产生的 delayed index。不过这里有一点需要注意的是，在 LastMutableBucket 未封闭前，如果有到期的消息该怎么，因为 Dispacter 只会从共享的索引优先级队列中检查是否有到期的消息。为了使得这些到期的消息可以及时交付，Tracker 会在 Dispacter 获取到期的 delayed index 之前，将 LastMutableBucket 中所有已经到期的 delayed index 移动到共享的索引优先级队列中。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292222439.png" alt="image-20231024102326915" style="zoom:33%;" />

我们再来看一下 Bucket 在 Bookkeeper 上的存储格式，如下图所示一个 Bucket Snapshot 将使用一个 Ledger，Ledger 的第一个 Entry 存放的是这个 Bucket 的 metadata_list， list中的每一条对应一个 segment 的 metadata，这个 metadata 由 delayed_index_bit_map、max_schedule_timestamp、max_schedule_timestamp组成，其中 max_schedule_timestamp 用于查找第一个快照段，在恢复延迟消息索引时，如果快照段中的所有消息都达到传递时间，则存储桶将跳过快照段（因为代理可以将消息直接分发给消费者）。delayed_index_bit_map 用于检查消息 ID 是否存在于存储桶中。它记录每个快照段的延迟消息索引的 BitSet。当 Dispatcher 重放消息时，它将根据 delayed_index_bit_map 根据来跳过那些已经存在 Tracker 中的消息

从 Entry 1开始每一个Entry 存放一个 segment，每一个Entry内是由delayed index 组成的有序列表，最前面的 Entry 存放的最先到期的 segment，越往后到期时间则越长。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292222600.png" alt="image-20231024160419020" style="zoom:33%;" />

我们还应该清理掉不需要的 Bucket Snapshot ，当发生以下情况时，我们应该删除存 Bucket Snapshot:

1. 当 Bucket 中快照的所有延迟消息都被调度时，Tracker 将删除该Bucket Snapshot。

2. Merge Bukcets， Tracker 将删除旧的 Buckets。

3. 当订阅被删除或Topic被删除时。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292222220.png" alt="image-20231027145722890" style="zoom:33%;" />

此外，如果不限制 Bucket 的数量的话，由于每一个 Bucket 都将消耗掉一个 Ledger，最终 Ledger 将变得非常多这将使得 Bookkeeper 的 Compaction 变得困难，所以我们也需要去 merge Buckets，当一个新的 Bucket 被创建后 Tracker 将检查当前 Bucket 的数量是否达到上限，如果达到上限则将选取两个相邻的 Bucket 进行 merge 并在merge 后删除旧的 Bucket 同时更新 Cursor Properties 中的 Bucket list 信息。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292222153.png" alt="image-20231027150151406" style="zoom:33%;" />

# 延迟消息性能测试

### 测试环境

为了表明新版延迟消息相较于之前的版本提升了多少，我们还对两个版本的延迟消息的实现做了性能测试。我们使用了 [StreamNative Cloud](https://streamnative.io/book-a-demo) 最小规格的集群作为测试环境并使用 Apache Pulsar 3.0.4 作为测试镜像。将单位转换为标准单位后的显示如下：

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292222859.png" alt="image-20231027151630258" style="zoom:33%;" />

### 测试步骤

使用 Pulsar-Perf Producer 向同一个 Topic 中发送了 100 Mil 延迟时间随机的的延迟消息 (最短的延迟时间是48h)，同时使用 Pulsar-Perf Consumer 从该 Topic 中消费消息，并记录 Direct Memory 内存使用量。下面是我们使用的测试命令。

**Command Producer**:

```bash
bin/pulsar-perf produce persistent://public/default/delayed-message -dr 172800,173400 -m 100000000 -r 1000
```

**Command Consumer**:

```bash
bin/pulsar-perf consume persistent://public/default/delayed-message -ss subs -st Shared -r 10000
```

### 测试结果

##### Direct Memory Usage

随着 Topic 中持有的延迟消息数量增加，我们注意到 In-Memory 延迟消息的实现会消耗大量的 Direct Memory。当延迟消息数量达到 35Mil 时，Direct Memory 的消耗量已经达到了 847MB，并导致了 Out of Memory (OOM) 错误。这导致 Broker 无法再承载更多的延迟消息。相比之下，Bucket-Based 的延迟消息实现在 Direct Memory 的消耗方面表现更好，始终保持较低的水平，并且可以容纳全部的 100Mil 延迟消息。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292225269.png" alt="image-20231027152113812" style="zoom:33%;" />

##### Recovery Time

我们在 Topic 延迟消息达到最大值时，主动 Kill了Broker Pod，来观察延迟消息的恢复时间，我们发现在 In-Memory 的延迟消息的实现中Broker 恢复 **35Mil** 的延迟消息用了 **6120s**, 而在 Bucket-Based 的延迟消息的实现中，Broker 恢复 **100Mil** 的延迟消息只用了 **90s**, Bucket-Based 的实现相较于之前的 In-Memory 实现大约有2个数量级的加速作用。

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292225266.png" alt="image-20231027153120056" style="zoom:33%;" />

### 结论

从测试结果我们可以得到两个结论

1. 全新的 Bucket-Based 的延迟消息机制不受内存限制，它允许用户持有大规模延迟消息。

2. 当集群出现 Broker 宕机或者 Topic 的 ownership 转移时，Bucket-Based 的新延迟消息机制显着减少了延迟消息的恢复时间，从而大大缩短了Consumer不可用的时间。

# 如何在Pulsar中开启新版延迟消息

如果你想使用新版延迟消息功能，首先你需要升级到Pulsar 3.0+，然后只需要将 `delayedDeliveryTrackerFactoryClassName` 设置为 `org.apache.pulsar.broker.delayed.BucketDelayedDeliveryTrackerFactory` 即可. 

关于新版延迟消息还有一些参数需要调优详细请参看考 PIP-195: https://github.com/apache/pulsar/issues/16763

<img src="https://gitee.com/coderzc/blogimage/raw/master/202310292225799.png" alt="image-20231027155213510" style="zoom:33%;" />