本SpringCloud系列文章参考《深入理解Spring Cloud与微服务构建》 这本书的作者的博客编写，感谢这位作者。      [方志朋的博客](https://blog.csdn.net/forezp)
原文地址：https://blog.csdn.net/forezp/article/details/70148833/

###一、创建服务注册中心
**1.1 首先创建一个maven主工程。**
首先创建一个主Maven工程，在其pom文件引入依赖，spring Boot版本为2.0.4.RELEASE，Spring Cloud版本为Finchley.SR1。
除了SpringBoot主要引入的maven库`spring-cloud-starter-netflix-eureka-server`，这是Eureka服务端。pom文件如下：

```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.zc</groupId>
    <artifactId>eurekaserver</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>eurekaserver</name>
    <description>Demo project for Spring Boot</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.4.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <java.version>1.8</java.version>
        <spring-cloud.version>Finchley.SR1</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>


</project>

```
**1.2 启动这个服务注册中心，**只需在SpringBoot启动类添加@EnableEurekaServer注解。
```
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaserverApplication.class, args);
    }
}
```
**1.3 完成配置文件** eureka是一个高可用的组件，它没有后端缓存，每一个实例注册之后需要向注册中心发送心跳（因此可以在内存中完成），在默认情况下erureka server也是一个eureka client ,必须要指定一个 server。eureka server的配置文件appication.yml：
```yml
server:
  port: 8761
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8762/eureka/,http://localhost:8763/eureka/
    register-with-eureka: false
    fetch-registry: false
  server:
    enable-self-preservation: false
spring:
  application:
    name: eureka
```
*这里通过eureka.client. register-with-eureka：false和fetch-registry：false来表明自己是一个eureka server.   通过eureka.server .enable-self-preservation=false 关闭自我保护当服务长时间连接不到则将他从注册中心移除（生产环境不建议关闭）*

**2.5 eureka server 监控界面**，启动工程,打开浏览器访问： 
[http://localhost:8761](http://localhost:8761/) ,界面如下：
![image.png](https://upload-images.jianshu.io/upload_images/12637001-4b7eb1baf1e235d8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

###二、创建服务提供者
当client向server注册时，它会提供一些元数据，例如主机和端口，URL，主页等。Eureka server 从每个client实例接收心跳消息。 如果心跳超时，则通常将该实例从注册server中删除。
创建过程同server类似,创建完pom.xml如下：
```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.zc</groupId>
    <artifactId>eurekaclient</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>eurekaclient</name>
    <description>Demo project for Spring Boot</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.4.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <java.version>1.8</java.version>
        <spring-cloud.version>Finchley.SR1</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```
*客户端记得要添加`spring-boot-starter-web`这个库，否则跑不起来*

然后也是通过`@EnableDiscoveryClient`注解表明自己是个eurekaclient
```
@SpringBootApplication
@EnableDiscoveryClient
@RestController
public class EurekaclientApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaclientApplication.class, args);
    }


    @Value("${server.port}")
    String port;

    @RequestMapping("/hi")
    public String home(@RequestParam(value = "name", defaultValue = "forezp") String name) {
        return "hi " + name + " ,i am from port:" + port;
    }

}

```

最后完成配置，将自己注册到eureka服务注册中心，application.yml配置文件如下：
```yml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/,http://localhost:8762/eureka/,http://localhost:8763/eureka/
spring:
  application:
    name: service-hi
server:
  port: 8081
```

**需要指明spring.application.name,这个很重要，这在以后的服务与服务之间相互调用一般都是根据这个name ,然后你能看到注册中心我写了三个这是因为，我开了三个eurekaserver它们之间还要相互注册**
启动工程，打开[http://localhost:8761](http://localhost:8761/) ，即eureka server 的网址：
![](https://upload-images.jianshu.io/upload_images/12637001-d5a12c70726ce86f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
你会发现一个服务已经注册在服务中了，服务名为SERVICE-HI ,端口为8081

这时打开 http://localhost:8081/hi?name=springcloud ，你会在浏览器上看到 :
>hi springcloud ,i am from port:8081


###三、服务发现
这还没很好理解，暂时引用大佬的博文
https://blog.csdn.net/mr_seaturtle_/article/details/77618403
