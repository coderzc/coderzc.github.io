### @Autowired 与@Resource的区别
* @Autowired与@Resource都可以用来装配bean. 都可以写在字段上,或写在setter方法上。
*  @Autowired默认按类型装配（这个注解是属业spring的），默认情况下必须要求依赖对象必须存在，如果要允许null值，可以设置它的required属性为false，如：@Autowired(required=false) ，如果我们想使用名称装配可以结合@Qualifier注解进行使用，如下：
```java
@Autowired
@Qualifier("myServiceImpl")
private MyService myservice;
```
* @Resource（这个注解属于J2EE的），默认按照名称进行装配，名称可以通过name属性进行指定，如果没有指定name属性，当注解写在字段上时，默认取字段名进行安装名称查找，如果注解写在setter方法上默认取属性名进行装配。当找不到与名称匹配的bean时才按照类型进行装配。**但是需要注意的是，如果name属性一旦指定，就只会按照名称进行装配**。
* @Autowired是根据类型进行自动装配的。如果当Spring上下文中存在不止一个MyService类型的bean时，就会抛出BeanCreationException异常;如果Spring上下文中不存在MyService类型的bean，也会抛出BeanCreationException异常。我们可以使用@Qualifier配合@Autowired来解决这些问题。
* 新补充：原本以为之前的理解已经完整了，直到我发现有一种特殊情况@Autowired也能正常注入，就是有一个实现类指定id为"myService"。所以应该是：@Autowired也是先按照name 装配，其实和@Resource一样，只不过@Autowired只能取字段名进行装配，不能单独指定要装配的name而已

#### Spring对Bean的name默认生成规则
Spring对注解形式的bean的名字的默认处理就是将类名首字母小写，再拼接后面的字符，还有另外的一个特殊处理：**当类的名字是以两个或以上的大写字母开头的话，bean的名字会与类名保持一致例如：
BKYInfoServcie.java------>@Service("BKYInfoServcie")**
