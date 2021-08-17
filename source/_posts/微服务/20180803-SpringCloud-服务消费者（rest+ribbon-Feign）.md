在上一篇文章，讲了服务的注册和发现。在微服务架构中，业务都会被拆分成一个独立的服务，服务与服务的通讯是基于http restful的。Spring cloud有两种服务调用方式，一种是ribbon+restTemplate，另一种是feign。
### 一、ribbon简介
>Ribbon is a client side load balancer which gives you a lot of control over the behaviour of HTTP and TCP clients. Feign already uses Ribbon, so if you are using @FeignClient then this section also applies.
—–摘自官网

eureka是一个客户端发现的注册中心，所以需要客户端具备负载均衡的能力，而ribbon就是一个负载均衡客户端，可以很好的控制htt和tcp的一些行为。Feign默认集成了ribbon。

ribbon 已经默认实现了这些配置bean：
* IClientConfig ribbonClientConfig: DefaultClientConfigImpl
* IRule ribbonRule: ZoneAvoidanceRule
* IPing ribbonPing: NoOpPing
* ServerList ribbonServerList: ConfigurationBasedServerList
* ServerListFilter ribbonServerListFilter: ZonePreferenceServerListFilter
* ILoadBalancer ribbonLoadBalancer: ZoneAwareLoadBalancer

### 二、建一个服务消费者端
**2.1** 这一篇文章基于上一篇文章的工程，启动eureka-server 工程；启动service-hi工程，它的端口为8081；将service-hi的配置文件的端口改为8082,并启动，这时你会发现：service-hi在eureka-server注册了2个实例，这就相当于一个小的集群。

![idea多实例.png](https://upload-images.jianshu.io/upload_images/12637001-a7a59e025b490e65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![服务注册多实例.png](https://upload-images.jianshu.io/upload_images/12637001-de903327ce913c4e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**2.2** 重新新建一个spring-boot工程，取名为：eureka-consumer;
在它的pom.xml和上一个差不多，多引一个`spring-cloud-starter-netflix-ribbon`库即可

**2.3**同样的在启动类添加@EnableDiscoveryClient注解表明自己是个eureka客户端。  并且向程序的ioc注入一个bean: restTemplate;并通过@LoadBalanced注解表明这个restRemplate开启负载均衡的功能。
```
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class ServiceConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceConsumerApplication.class, args);
    }

    @Bean
    @LoadBalanced
    RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
```
配置文件如下：
```
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/,http://localhost:8762/eureka/,http://localhost:8763/eureka/
server:
  port: 8083
spring:
  application:
    name: service-ribbon
```
**2.4** 写一个服务类HelloService，通过之前注入ioc容器的restTemplate来消费service-hi服务的“/hi”接口，在这里我们直接用的程序名替代了具体的url地址，在ribbon中它会根据服务名来选择具体的服务实例，根据服务实例在请求的时候会用具体的url替换掉服务名，代码如下：
```
@Service
public class HelloService {

    @Autowired
    private RestTemplate restTemplate;

    public String hiService(String name){
        return restTemplate.getForObject("http://service-hi/hi?name="+name,String.class);
    }

}
```
**2.5** 最后写一个controller测试，在controller中用调用HelloService 的方法，代码如下：
```
@RestController
public class HelloController {

    @Autowired
    private HelloService helloService;

    @GetMapping("/hi_ribbon")
    public String hi_ribbon(String name){
        return helloService.hiService(name);
    }
}
```
在浏览器上多次访问[http://localhost: 8083/hi_ribbon?name= springcloud](http://localhost:8083/hi_ribbon?name=springcloud)，浏览器交替显示：
>hi springcloud,i am from port:8081
  hi springcloud,i am from port:8082

这说明当我们通过调用restTemplate.getForObject(“[http://SERVICE-HI/hi?name=](http://service-hi/hi?name=)“+name,String.class)方法时，已经做了负载均衡，访问了不同的端口的服务实例。

### 三、此时架构
![image.png](https://upload-images.jianshu.io/upload_images/12637001-da915fb52c27dd2b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 四、Feign简介
Feign是一个声明式的伪Http客户端，它使得写Http客户端变得更简单。使用Feign，只需要创建一个接口并注解。它具有可插拔的注解特性，可使用Feign 注解和JAX-RS注解。Feign支持可插拔的编码器和解码器。Feign默认集成了Ribbon，并和Eureka结合，默认实现了负载均衡的效果。

简而言之：
* Feign 采用的是基于接口的注解
* Feign 整合了ribbon，具有负载均衡的能力
* 整合了Hystrix，具有熔断的能力
