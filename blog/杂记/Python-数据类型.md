### 1.数字类型(number)
- int
- float
```python
>>> type(1)
int

>>> type(1.0)
float

>>> type(1+0.1)
float

>>> type(1+1.0)
float

>>> type(1/2)
float

>>> type(1//2)
int
```
/ 是浮点运算
// 是取整运算

- 进制转换
```python
#二进制
>>> 0b10   
2

#八进制
>>> 0o10
8

#十六进制
>>> 0x10
16

#转化为二进制
>>> bin(10)
'0b1010'

#转化为十进制
>>> int(0b111)
7

#转化为八进制
>>> oct(0b111)
'0o7'

#转化为十六进制
>>> hex(0o7777)
'0xfff'
```

- bool 布尔类型
`True` `False`   注意大小写
```python
>>> type(True)
bool

>>> int(True)
1
>>> int(False)
0

>>> bool(1)
True
>>> bool(0)
False

>>> bool(2.2) # 非零就是True
True
>>> bool(-1.1)
True
>>> bool(0) 
False

>>> bool('')
False

>>> bool([1,2,3])
True
>>> bool([])
False

>>> bool({1,2,3})
True
>>> bool({})
False

>>> bool(None)
False
```

- 复数
  36j

### 2.字符串类型(string)
```python
>>> type('1')
str

>>>"let's go"
"let's go"

# 多行文本
>>> '''
... swdwd
... dwd
... dwd
... '''
'\nswdwd\ndwd\ndwd\n'

>>>'helo\
world'
'helloworld'

#原始字符串，不解析转移字符串
>>> print(r'c:\northwind\northwest')
c:\northwind\northwest
```

#### 2.2字符串运算
```python
>>> 'hello'+'world'
'helloworld'

>>> "hello"*3
'hellohellohello'

>>> 'hello world'[0]
'h'

#倒数选取
>>> 'hello world'[-1]
'd'

>>> 'hello world'[0:5]
'hello'

>>> 'hello world'[6:-1]
'worl'

>>> 'hello world'[6:]
'world'
```
