# Nginx原理

> 服务端就称为nginx的上游 ; 浏览器就称为nginx的下游

master进程的作用:

* 管理worker进程:接收来自外界的信号,向各worker进程发送信号
* 监控worker进程的运行状态:当worker进程退出后,会自动重新启动新的worker进程

worker进程处理请求的步骤:

* 在master进程里,先建立好需要listen的socket(listenfd)之后,再fork出多个worker进程.所有worker进程的listenfd会在新连接到来时变得可读
* 为保证只有一个进程处理该连接,所有worker进程在注册listenfd读事件前抢accept_mutex,抢到互斥锁的那个进程注册listenfd读事件,在读事件里调用accept接收该连接
* worker进程在accept这个连接后,就开始读取请求,解析请求,处理请求,产生数据,返回客户端,断开连接

进程模型的优点:

* 独立进程,不需要加锁,省掉了锁带来的开销
* 进程之间独立,不互相影响

nginx的异步非阻塞:

* 阻塞模式:事件没准备好,马上返回eagain,过会再来检查,知道事件准备好.缺点:需要不时的检查事件的状态,带来不必要的开销
* 异步非阻塞模式:同时监控多个事件,调用他们是阻塞的但可以设置超时时间,在超时时间内,如果有事件准备好了,就返回
* 当事件没准备好时,放到epoll里,事件准备好了,返回,去读写,当读写返回EAGAIN时,再次加入到epoll







































































#### Nginx请求处理流程

![img](https://cdn.nlark.com/yuque/0/2021/png/21484941/1624872686602-a0df0adc-8633-4260-8702-71a802fd910a.png)

#### Nginx进程结构

- master进程 :管理worker进程
- worker进程: 处理请求

- cache manager: 缓存的管理
- cache loader: 缓存的载入

- 进程间使用共享内存实现通讯

#### Nginx reload

1. 向master进程发送reload命令
2. master进程校验配置语法是否正确

3. master进程打开新的监听端口
4. master进程用新配置启动新的worker子进程

5. master进程向老worker子进程发送QUIT进程
6. 老worker进程关闭监听句柄,处理完当前连接后结束进程

#### 优雅的关闭

- 主要针对http请求
- 一种是正常关闭;另一种是时间达到worker_shutdown_timeout,强制关闭

#### TLS/SSL

- 加密层是7层网络模型的"表示层"加密,实现数据加密
- 对称加密:将明文和秘钥做异或操作,得到密文;将密文和秘钥做异或操作,得到明文

- 加密性能优化:小文件多:握手影响性能,主要考虑非堆成加密算法,优化RSA加密算法  大文件多:主要考虑对称加密,aes加密算法替换成更有效的算法,密码强大更小些

#### HTTP请求处理时的11个阶段

![img](https://cdn.nlark.com/yuque/0/2021/png/21484941/1624957985505-ff086635-24eb-413f-9f0d-1aac19c40ca4.png)

#### 状态返回码

![img](https://cdn.nlark.com/yuque/0/2021/png/21484941/1624966147119-ac787bb2-81f7-4ad6-9d1c-583430e6b7b0.png)

#### rewrite指令

![img](https://cdn.nlark.com/yuque/0/2021/png/21484941/1624967513758-a23683db-7f3e-457d-9478-5e49b0453e81.png)

#### location匹配规则

![img](https://cdn.nlark.com/yuque/0/2021/png/21484941/1624968660566-92f9555c-7a47-4327-addc-576c6992b104.png)
