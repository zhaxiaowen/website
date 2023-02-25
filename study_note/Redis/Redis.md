# Redis

[redis cluster原理+基本使用+运维注意事项](https://blog.csdn.net/xiaofeng10330111/article/details/90384502?ops_request_misc=%7B%22request%5Fid%22%3A%22163653146816780265451858%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fblog.%22%7D&request_id=163653146816780265451858&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~first_rank_v2~rank_v29-5-90384502.pc_v2_rank_blog_default&utm_term=redis+cluster&spm=1018.2226.3001.4450)

#### 监控项

```yaml
进程状态
内存使用率
redis连接数超过90%
redis key的数量过多
从库复制发生中断
redis周期5分钟内驱逐数大于1
主从连接异常
CPU使用率
出口流量大于100M
```

#### redis启用密码认证

1. redis启用密码认证一定要requirepass和masterauth同时设置。
2. 如果主节点设置了requirepass登录验证，在主从切换，slave在和master做数据同步的时候首先需要发送一个ping的消息给主节点判断主节点是否存活，再监听主节点的端口是否联通，发送数据同步等都会用到master的登录密码，否则无法登录，log会出现相应的报错。也就是说slave的masterauth和master的requirepass是对应的，所以建议redis启用密码时将各个节点的masterauth和requirepass设置为相同的密码，降低运维成本。当然设置为不同也是可以的，注意slave节点masterauth和master节点requirepass的对应关系就行。
3. masterauth作用：主要是针对master对应的slave节点设置的，在slave节点数据同步的时候用到。
4. requirepass作用：对登录权限做限制，redis每个节点的requirepass可以是独立、不同的。

#### 1.数据分布方案

> 虚拟槽分区,一致性hash+虚拟节点;CRC16(key) % 16384

##### 优点

1. 解耦数据和节点之间的关系,简化了扩缩容难度
2. 节点自身维护槽的映射关系,不需要客户端或代理服务维护槽分区元数据

##### 缺点

1. key批量操作支持有限,映射为不同slot值的key由于执行mset,mget等操作可能存在于多个节点而不被支持
2. key事务操作支持有限,key分布在不同节点上时无法使用事务功能
3. 不能将一个大的键值对象映射到不同的节点上
4. 只能使用db0
5. 从节点只能复制主节点,不支持嵌套树桩复制结构

#### 2.节点通信

> 分布式存储中需要提供维护节点元数据的机制,如节点负责哪些数据,是否出现故障等.常见的有P2P和集中式
>
> redis集群采用P2P的Gossip(流言)协议,原理是节点彼此不断通信交换信息,一段时间后所有节点都会知道集群完整的信息

##### a.Gossip

常见的Gossip消息:ping、pong、meet、fail

* pong:当接收到ping,meet消息,作为响应消息回复给发送方,确认消息正常通信.pong内部封装了自身状态数据
* meet:用于通知新节点加入.
* ping:集群内最频繁的消息,每个节点每秒向多个其他节点发送ping消息,用于检测节点是否在线和交换彼此状态信息,ping消息封装了自身节点和部分节点的状态数据
* fail:当节点判定集群内另一个节点下线,会向集群内广播一个fail消息,其他节点接收到fail消息后会把对应节点更新为下线状态

##### b.消息格式

* 消息头:包含了发送节点关键信息,如节点id、槽映射、节点标识(主从角色)
* 消息体:定义发送消息的数据,ping、meet、pong都是消息体数据

##### c.节点选择

* Gossip协议需要兼顾信息交换实时性和成本开销

![img](https://img-blog.csdnimg.cn/20190525160736570.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3hpYW9mZW5nMTAzMzAxMTE=,size_16,color_FFFFFF,t_70)

* 消息交换的成本主要在单位时间选择发送消息的节点数量和每个节点携带的数据量

#### 3.请求路由与集群客户端的选择

##### a.请求重定向

* 集群模式下,redis接收任何键相关命令时,首先计算键的槽位,再根据槽找到对应的节点,如果节点是自身,则处理键命令;否则,回复MOVED重定向错误,通知客户端请求正确的节点,这个过程称为`MOVED重定向`
* 节点对于不属于它的键命令只回复重定向响应,并不负责转发
* 这种客户端每次执行键命令都要重定向才能找到要执行命令的节点,额外增加了IO开销,因此客户端都采用另一种实现`Smart`

##### b.Smart客户端原理

> Smart客户端通过在内部维护slot->node的映射关系,本地就可以实现键到节点的查找,减少IO,MOVED重定向负责协助Smart客户端更新slot->node映射

![img](https://img-blog.csdnimg.cn/20190526151056763.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3hpYW9mZW5nMTAzMzAxMTE=,size_16,color_FFFFFF,t_70)

##### c.ASK重定向

> ASK重定向是发生在slot迁移过程中,迁移过程中,可能存在一部分数据在源节点,一部分数据在目标节点

* 客户端根据本地slot缓存发送命令到源节点,如果存在键对象,直接返回结果
* 如果键对象不存在,则可能存在于目标节点,这时源节点会回复ASK重定向异常
* 客户端从ASK重定向异常提取出目标节点信息,发送asking命令到目标节点打开客户端连接标识,再执行键命令.存在则执行,不存在则返回不存在

![img](https://img-blog.csdnimg.cn/20190526155656569.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3hpYW9mZW5nMTAzMzAxMTE=,size_16,color_FFFFFF,t_70)



##### d.ASK和MOVED区别

> ASK和MOVED虽然都是对客户端的重定向,但是有着本质区别
>
> ASK重定向说明集群在进行slot迁移,客户端无法知道迁移什么时候完成,因此只能是临时性重定向,不更新slots缓存
>
> MOVED重定向说明键对应的槽已经明确指定到新节点,因此需要更新slots缓存

#### 4.故障转移及注意事项

##### a.故障发现

* 通过ping/pong通信发现故障
* 客观下线:半数以上持有槽的主节点都标记某节点主观下线,如果持有槽的主节点故障,需要为该节点进行故障转移

##### b.故障恢复

> 当从节点通过内部定时任务发现自身复制的主节点进入客观下线时,将会触发故障恢复流程

`资格检查--准备选举时间--发起选举--选举投票--替换主节点`

资格检查:

* 每个从节点检查与故障主节点的断线时间
* 超过cluster-node-timeout * cluster-slave-validity-factor取消资格
* cluster-slave-validity-factor:默认10s

准备选举时间:

* 当从节点符合故障转移资格后,更新触发故障选举的时间,只有到达该时间后才能执行后续流程
* 采用延迟触发机制,主要是通过对多个从节点使用不同的延迟选举时间来支持优先级问题
* 复制偏移量越大说明从节点延迟越低,就具有更高的优先级.所有的从节点中复制偏移量最大的将提前触发故障选举流程

发起选举:

* 1.更新配置纪元,每个主节点自身维护一个配置纪元标志当前主节点的版本,从节点复制主节点的配置纪元;整个集群维护一个全局的配置纪元;执行cluster info可以查看配置纪元信息;在选从的时候需要选择一个纪元数最大的从
* 2.广播选举消息:在集群内广播选举消息,并记录已发送过消息的状态,保证该从节点在一个配置纪元内只能发起一次选举

选举投票:

* 只有持有哈希槽的主节点才能投票,只要有一个从节点获得N/2 +1的选票即胜出
* 投票作废:每个配置纪元代表一次选举周期,在开始投票之后的cluster-node-timeout * 2时间内,从节点没有获取足够数量的投票,则本次选举作废;从节点对配置纪元自增并发起下一轮投票,直到选举成功

替换主节点

* 从节点收集到足够的选票,触发替换主节点操作
* 当前从节点取消复制变为主节点
* 执行clusterDelSlot撤销故障主节点槽位,执行clusterAddSlot把这些槽位派给自己
* 向集群广播自己的pong消息,通知集群内所有的节点当前从节点变为主节点,并接管的槽位信息

##### 5.慢查询

> 慢查询日志就是系统在命令执行前后计算每条命令的执行时间,当超过预设值,就将这条命令的相关信息(慢查询ID,发生时间戳,耗时,命令)记录下来
>
> 慢查询只记录命令执行时间,并不包括命令排队时间和网络传输时间











### Redis-cluster性能优化

#### 1.优化Gossip协议

```
每个节点每秒需要发送ping消息的数量=1+10*num（node.pong_received>cluster_node_timeout/2），因此 cluster_node_timeout参数对消息发送的节点数量影响非常大。
当我们的带宽资源紧张时，可以适当调大这个参数，如从默认15秒改为30秒来降低带宽占用率。
过度调大cluster_node_timeout会影响消息交换的频率从而影响故障转移、槽信息更新、新节点发现的速度。
需要根据业务容忍度和资源消耗进行平衡，同时整个集群消息总交换量也跟节点数成正比。
```



