# Elasticsearch

#### [ES博客教程](https://elasticstack.blog.csdn.net/article/details/102728604)

#### [吃透Elasticsearch 堆内存]( https://blog.csdn.net/zpf_940810653842/article/details/102785970)

#### [为什么Java进程使用的内存(RSS)比Heap Size大](https://blog.csdn.net/flyingnet/article/details/108491460)

#### 优化

```yaml
应用方面：
1._source只存储需要的字段
2.开启字段store 属性true,会有单独的存储空间为这个字段做存储，这个存储是独立于_source;能提高查询效率

Indexing Buffer:索引缓冲区参数设置
断路器和fielddata
```

#### 遇到性能问题，排查思路

```plain
实例：https://blog.51cto.com/u_15060469/2681020
    看日志，是否有字段类型不匹配，是否有脏数据。
    看CPU使用情况，集群是否异构
    客户端是怎样的配置？使用的bulk 还是单条插入
    查看线程堆栈，查看耗时最久的方法调用
    确定集群类型：ToB还是ToC，是否允许有少量数据丢失？
    针对ToB等实时性不高的集群减少副本增加刷新时间
    index buffer优化 translog优化，滚动重启集群
   
GET /_cat/thread_pool/?v  
GET /_cat/thread_pool/?v&h=id,name,active,rejected,completed,size,type&pretty&s=type
# name:代表某种线程池（写入，检索，刷新等）
# type:代表线程数类型
```

#### reject：拒绝请求

```plain
https://cloud.tencent.com/developer/article/1797226
现象：es集群拒绝索引写入请求
原因：通常，这表明一个或多个节点无法跟上索引 / 删除 / 更新 / 批量请求的数量，从而导致在该节点上建立队列且队列逐渐累积。
		 一旦索引队列超过队列的设置的最大值（如 elasticsearch.yml 定义的值或者默认值），则该节点将开始拒绝索引请求。
排查方法：检查线程池状态，查明索引拒绝是否总是在同一节点上发生，还是分布在所有节点上。
GET /_cat/thread_pool?v

如果 reject 仅发生在特定的数据节点上，那么您可能会遇到负载平衡或分片问题。
如果 reject 与高 CPU 利用率相关联，那么通常这是 JVM 垃圾回收的结果，而 JVM 垃圾回收又是由配置或查询相关问题引起的。
如果集群上有大量分片，则可能存在过度分片的问题。
如果观察到节点上的队列拒绝，但监控发现 CPU 未达到饱和，则磁盘写入速度可能存在问题。
```

### Elasticsearch

#### 1.集群角色

* master node:主节点,控制整个集群的元数据处理,比如索引的新增、删除、分片路由分配等

* master-eligible节点:合格节点,该节点可以参加选举主节点,成为master节点
* data节点:数据节点,es集群的性能取决于该节点
* coordinate node:协调节点,接收客户端请求,将请求转发给data节点,再把data节点返回的结果进行整合、排序,将最终结果返回给客户端
* ingest节点:数据前置处理转换节点,致辞pipeline管道设置,可以使用ingest对数据进行过滤、转换等操作

#### 2.写入过程

> 写入过程分为同步过程和异步过程

##### 1.同步过程

1. 将操作记录写到translog中
2. 根据数据生成相应的数据结构,写入内存buffer
3. 数据同步到replica shard中.完成后coordinate响应结果
4. es定期做segment merge,将多个小的segment合并成一个大的segment

##### 2.异步过程

1. 内存buffer --> OS cache,refresh过程
2. segment file --> 落盘,flush过程,持久化

#### 3.索引分片数修改

> 重建索引,有2种方式,一种是在现有索引上重建,一种是在其他索引上重建

缩减分片有2种方式

1. [通过reindex api重建索引](https://blog.csdn.net/litianxiang_kaola/article/details/103981412)
2. [通过shrink api重建索引](https://www.cnblogs.com/qingzhongli/p/15566286.html)(效率高,但执行步骤复杂)

##### 使用_alias通过reindex实现不停机重建索引

```
1.定义mapping
2.设置别名
3.操作均通过别名执行
4.新建索引
5.reindex api重建索引
6.切换别名
```

##### 使用shrink api缩减分片数量

```
# 前置条件 
1.索引必须是只读
2.索引每个主分片必须在同一个节点上
3.索引的健康状态是绿色

变更
1.删除副本、分配所有主分片到同一节点、禁止写入。
2.第一步执行完成后,使用_shrink index API 接口来对索引进行缩减  #缩减后的分片数量必须能让原来整除;可以先将副本设为0,提高效率
3.缩减完成,设置副本数,删除旧索引,追加别名

```

增加分片数有2种方式

1. 通过reindex api,同上
2. [通过es split切分主分片数](https://blog.csdn.net/u014646662/article/details/103579425)

#### unassigned分片问题可能的原因

1）INDEX_CREATED：由于创建索引的API导致未分配。

2）CLUSTER_RECOVERED ：由于完全集群恢复导致未分配。

3）INDEX_REOPENED ：由于打开或关闭一个索引导致未分配。

4）DANGLING_INDEX_IMPORTED ：由于导入dangling索引的结果导致未分配。

5）NEW_INDEX_RESTORED ：由于恢复到新索引导致未分配。

6）EXISTING_INDEX_RESTORED ：由于恢复到已关闭的索引导致未分配。

7）REPLICA_ADDED：由于显式添加副本分片导致未分配。

8）ALLOCATION_FAILED ：由于分片分配失败导致未分配。

9）NODE_LEFT ：由于承载该分片的节点离开集群导致未分配。

10）REINITIALIZED ：由于当分片从开始移动到初始化时导致未分配（例如，使用影子shadow副本分片）。

11）REROUTE_CANCELLED ：作为显式取消重新路由命令的结果取消分配。

12）REALLOCATED_REPLICA ：确定更好的副本位置被标定使用，导致现有的副本分配被取消，出现未分配。