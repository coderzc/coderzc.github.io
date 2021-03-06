### 什么是线程安全性
线程安全性：当多个线程访问某个类时，不管运行时采用**何种调度方式**或者这些线程将被如何交替执行，并且在主调代码中**不需要任何额外的同步或协同**，这个类都能表现出**正确的行为**，那么就称这个类是线程安全的。

### 并发中三个特性（解决线程安全问题的主要关注点）
* 原子性：提供了互斥操作，**同一时刻只允许一个线程**对共享资源进行操作
* 可见性：当一个线程修改了共享变量的值，其他线程可以**立即得知这个修改**
* 有序性：一个线程观察其他线程指令的执行顺序，由于**指令重排序**的存在，该观察结果一般是**无序**的

### 原子性
###### JDK提供了Atomic包来实现原子性（CAS）
>CAS（compareAndSwap）：一个原子操作有三个操作数，V为变量的内存位置，A为期望的旧职，B为要跟新的新值。CAS执行时，当且仅当v取出主内存中变量的当前值与A相等时，处理器才会用新值B去更新V的值，否在不执行更新。

CAS存在的问题：CAS虽然很高效的解决原子操作，但是CAS仍然存在三大问题。ABA问题，循环时间长开销大和只能保证一个共享变量的原子操作
1.  ABA问题。因为CAS需要在操作值的时候检查下值有没有发生变化，如果没有发生变化则更新，但是如果一个值原来是A，变成了B，又变成了A，那么使用CAS进行检查时会发现它的值没有发生变化，但是实际上却变化了。ABA问题的解决思路就是使用版本号。在变量前面追加上版本号，每次变量更新的时候把版本号加一，那么A－B－A 就会变成1A-2B－3A。
关于ABA问题参考文档: http://blog.hesey.net/2011/09/resolve-aba-by-atomicstampedreference.html

2. 循环时间长开销大。自旋CAS如果长时间不成功，会给CPU带来非常大的执行开销。如果JVM能支持处理器提供的pause指令那么效率会有一定的提升，pause指令有两个作用，第一它可以延迟流水线执行指令（de-pipeline）,使CPU不会消耗过多的执行资源，延迟的时间取决于具体实现的版本，在一些处理器上延迟时间是零。第二它可以避免在退出循环的时候因内存顺序冲突（memory order violation）而引起CPU流水线被清空（CPU pipeline flush），从而提高CPU的执行效率。

3. 只能保证一个共享变量的原子操作。当对一个共享变量执行操作时，我们可以使用循环CAS的方式来保证原子操作，但是对多个共享变量操作时，循环CAS就无法保证操作的原子性，这个时候就可以用锁，或者有一个取巧的办法，就是把多个共享变量合并成一个共享变量来操作。比如有两个共享变量i＝2,j=a，合并一下ij=2a，然后用CAS来操作ij。从Java1.5开始JDK提供了AtomicReference类来保证引用对象之间的原子性，你可以把多个变量放在一个对象里来进行CAS操作。
* AtomicXXX: CAS、Unsafe.compareAndSwapInt、AtomicReference（操作对象）、AtomicIntegerFieldUpdater、LongAdder、AtomicStampedReference

* LongAdder在AtomicLong的基础上将单点的更新压力分散到各个节点，在低并发的时候通过对base的直接更新可以很好的保障和AtomicLong的性能基本保持一致，而在高并发的时候通过分散提高了性能。
缺点是LongAdder在统计的时候如果有并发更新，可能导致统计的数据有误差。

* AtomicStampedReference 解决ABA问题。这个类的compareAndSet方法作用是首先检查当前引用是否等于预期引用，并且当前标志是否等于预期标志，如果全部相等，则以原子方式将该引用和该标志的值设置为给定的更新值。

 ###### synchronized（依赖jvm）
一种同步锁，修饰对象有四种
* 修饰this：同步范围大括号括起来的代码，作用于**调用对象**
* 修饰方法：同步范围整个方法，作用于**调用对象**
* 修饰静态方法：同步范围整个静态方法，作用于**所有对象**
* 修饰类class：同步范围大括号括起来的代码，作用于**所有对象**

*synchronized 不会被继承*

 ###### Lock （依赖特殊CPU指令，代码实现，ReentrantLock）

###### 原子性总结：
synchronized: 不可中断的锁，适合竞争不激烈，代码可读性好
Lock: 可中断锁，竞争激烈时能维持常态
Atomic: 竞争激烈时刻维持常态，比Lock性能好；但只能同步一个值

### 可见性
导致共享变量在线程间不可见的原因：
* 线程交叉执行
* 指令重排序结合线程交叉执行
* 共享变量更新后的值没有在工作内存与主存间及时更新

JMM关于synchronized 两条规则：
1. 线程解锁前，必须把共享变量的最新值刷新到主内存
2. 线程解锁时，将清空工作内存中共享变量的值，从而使用共享变量时需要从主内存中重新读取最新的值（注意加速解锁是同一把锁）

JMM关于volatitle两条规则：
1. 对volatile变量写操作时，会在写操作后加入一条store指令，将本地内存中的共享变量的值刷新到主内存
2.  对volatile变量读操作时，会在读操作前加入一条load指令，从主内存中读取共享变量

### 有序性
禁止指令重排序
