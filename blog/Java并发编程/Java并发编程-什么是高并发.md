最近想把并发编程系统的学一下，于是参考慕课网视频边学边写博客，记录一下。

基本概念：
* **并发**：同时拥有两个或多个现场，如果出现在单核处理器上运行,多个线程将交替地换入或换出内存，这些线程是同时“存在”的，每个线程都处于执行过程中的某个状态。如果在多核处理器上，程序中的每个线程都将分配到一个处理器核心上，此时则成为 ***并行***
* **高并发**：高并发（High Concurrency）是互联网分布式系统架构设计中必须考虑因素之一，它通常指，通过设计保证系统能够**同时并行处理**很多请求

![基础知识.png](https://upload-images.jianshu.io/upload_images/12637001-09a7a98b8c724672.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![并发线程安全处理.png](https://upload-images.jianshu.io/upload_images/12637001-3016e15c6c7df571.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


![高并发处理手段.png](https://upload-images.jianshu.io/upload_images/12637001-7f2f6a6fa7729dcf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
