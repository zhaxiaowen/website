# Kafka常见故障处理

[Kafka实战宝典：一文带解决Kafka常见故障处理](https://cloud.tencent.com/developer/article/1632139)

#### rebalance[https://zhuanlan.zhihu.com/p/141930794]

* 订阅 Topic 的分区数发生变化。
* 订阅的 Topic 个数发生变化。
* 消费组内成员个数发生变化。例如有新的 consumer 实例加入该消费组或者离开组。

#### 堆积

* rebalance导致堆积:处理好rebalance
* 消费者异常:处理好消费者
* 生产者



#### 重新消费数据



#### ISR列表频繁Expanding(扩大), Shinking(缩小)

* 原因:可能是单个分区的数据量过大导致部分分区的follower无法及时备份,或者follower无法及时同步足够的消息以满足ISR判定条件,从而被shinking清除出ISR列表,瞬间又追上复制速度,从而expanding加入ISR列表
* 解决方法:修改kafka配置文件,增加单个broker的复制数据的线程数,降低ISR列表判定条件(时长+条数)



#### java.io.IOException Connection to xx was disconnected before the response was read 

* 原因:集群中有broker节点不正常或负载过高,其他broker节点同步该节点数据的线程即会报这种错误,因此这类问题通常伴随replicaFetcherThread线程shutdown日志
* 解决:查看其他节点是否有类似报错,是否都指向固定kafka节点,若指向同一broker,则表明数据同步线程无法读取该节点的消息,该节点存在问题,查看节点iostat是否存在读写瓶颈

#### broker运行日志大量topic不存在报错,导致节点不可用

* 原因:该集群存在topic被删除,但有发端仍使用该topic发送数据,检查broker的配置项:delete.topic.enable auto.create.topics.enable

#### 单partition消费僵死

* 某个topic的单个partition数据无法消费,其他partition可以消费,消费集群整体无异常,重启消费者解决;后续增加对所有partition的消费情况监控

