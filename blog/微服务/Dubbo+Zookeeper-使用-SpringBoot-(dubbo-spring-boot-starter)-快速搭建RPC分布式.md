### 一.安装并启动Zookeeper
看看这篇博文吧，我就不赘述了 https://blog.csdn.net/lisongjia123/article/details/78639242

### 二.创建公共接口
1. 新建一个maven项目
![image.png](https://upload-images.jianshu.io/upload_images/12637001-cf697b2473f0b77b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 创建接口：

```java
package com.zc.dubbo.service;

public interface DemoService {
    String sayHello(String name);
}

```
3. 把项目打包成jar包
![打包](https://upload-images.jianshu.io/upload_images/12637001-e38c5f50cafa5ed6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![jar包](https://upload-images.jianshu.io/upload_images/12637001-0af0fa356e257b47.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 三.创建服务提供者
1. 先创建一个空的springboot项目,加入`dubbo-spring-boot-starter`依赖
```xml
      <dependency>
            <groupId>com.alibaba.boot</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
            <version>RELEASE</version>
        </dependency>
```
2. 导入之前生成的公共接口jar包（不会导入自行百度）
![image.png](https://upload-images.jianshu.io/upload_images/12637001-09287d9d3319f8c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3.实现公共接口，并添加dubbo的@service**（注意不是spring的service注解，看导包）**
实现类：
```java
package com.zc.dubboprovider.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.zc.dubbo.service.DemoService;

@Service
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
            return "Hello, " + name + " (from Spring Boot)";
    }
}


```
4. 配置文件
先把properties文件修改为yml文件（习惯使用yml文件，也可不改）
```yml
#dubbo协议
dubbo:
  protocol:
    id: dubbo
    name: dubbo
    port: 12345
    status: server
#注册中心地址
  registry:
    address: zookeeper://localhost:2181
#dubbo应用名
  application:
    name: dubbo-provider-demo
```
5. 在启动类上开启dubbo服务并扫描服务类
```java
package com.zc.dubboprovider;

import com.alibaba.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableDubbo(scanBasePackages = "com.zc.dubboprovider.service.impl")
public class DubboProviderApplication {

    public static void main(String[] args) {
        SpringApplication.run(DubboProviderApplication.class, args);
    }
}
```
6. 启动生产者

### 四.创建服务消费者
1. 同样新建springboot项目，加入`dubbo-spring-boot-starter`依赖，消费者要测试访问所以加入web依赖：
```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>com.alibaba.boot</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
            <version>RELEASE</version>
        </dependency>
```
2. 导入公共接口的依赖

3. 配置文件
```yml
server:
  port: 8080

dubbo:
  protocol:
    id: dubbo
    name: dubbo

  registry:
    address: zookeeper://localhost:2181

  application:
    name: dubbo-consumer-demo
```

4. 编写controller类，**并使用dubbo的 @Reference 注入公共接口，dubbo会自动去注册中心找相应服务的生产者，并通过dubbo协议调用相应方法**
```java
package com.zc.dubboconsumer.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.zc.dubbo.service.DemoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class DemoController {
    @Reference
    private DemoService demoService;

    @RequestMapping("/sayHello")
    public String sayHello(@RequestParam String name) {
        return demoService.sayHello(name);
    }
}

```
5.在启动类上开启dubbo并扫描controller类（不加也可以，因为加了@RestController Spring会自动扫描相应的类,但有时不会加载 @Reference，最好写上）

```java
package com.zc.dubboconsumer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableDubbo(scanBasePackages = "com.zc.dubboconsumer.controller")
public class DubboConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DubboConsumerApplication.class, args);
    }
}
```
6. 启动消费者，并访问 http://localhost:8080/sayHello?name=dubbo
![image.png](https://upload-images.jianshu.io/upload_images/12637001-f00c6289ceab1d43.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**成功调用到生产者的服务**

### 五. 使用dubbo-admin监控服务
请查看这篇博文，就是个管理界面，搭起来然后把服务注册中心地址换成自己的就行了https://www.jianshu.com/p/3d619740883c

这是最终效果，生产者和消费者都能看到了
![dubbo-admin.png](https://upload-images.jianshu.io/upload_images/12637001-eaf08772ee35efba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
