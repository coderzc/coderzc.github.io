####  1.subList(l,r)  是左闭右开 例如：subList(1,3) 截取的是下标为1和2两个元素


#### 2.subList() 返回对象是RandomAccessSubList不可序列化的实例化
https://stackoverflow.com/questions/26568205/resolve-a-java-util-arraylistsublist-notserializable-exception
![](https://upload-images.jianshu.io/upload_images/12637001-955b421ecaf7cff6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/600)

#### 3.切记不要这么写：list = (LinkedList) list.subList(0, 2);
***否则程序会这样报复你：java.util.SubList cannot be cast to java.util.LinkedList*** 
***向下转型的前提是你要先是那个类***

#### 总结：list = new ArrayList(list.subList(0, 2)); 这么写总没错啦～
