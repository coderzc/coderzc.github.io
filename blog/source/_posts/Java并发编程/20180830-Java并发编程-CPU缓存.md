### 一. 什么是CPU的缓存
CPU与高速缓存通过快速通道直接相连，而高速缓存和主存通过数据总线相连

CPU cache出现的原因：CPU的频率太快了。快到主存跟不上，这样在处理器时钟周期内。CPU常常需要等待主存，浪费资源。所以cache的出现，是为了缓解CPU和主存之间速度不匹配的问题
（结钩：cpu → cache → memory）
![image.png](https://upload-images.jianshu.io/upload_images/12637001-d58c39b7782153b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**CPU cache远小于主存还有什么意义：**
1. 时间局部性：如果某个数据被访问，那么在不久的将来很可能再次被访问
2. 空间局部 性：如果某个数据被访问。那么与它相邻的数据很快也会被访问

### 二. 缓存一致性协议（MESI）
用于保证多个CPU cache 之间缓存共享数据的一致
![image.png](https://upload-images.jianshu.io/upload_images/12637001-96efae7b06218890.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 三.CPU乱序执行优化（指令重排）

 ![image.png](https://upload-images.jianshu.io/upload_images/12637001-c025dc92bcca2a1f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
