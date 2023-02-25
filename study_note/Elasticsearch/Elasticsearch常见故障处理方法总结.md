# Elasticsearch常见故障处理方法总结

#### 总结

* **集群red/yellow:分片问题**
  * 分片自动分配达到重试次数5次,处于no_attempt
* **集群CPU使用率高:通过获取`hot_threads`信息来确认什么线程在消耗CPU**
  * 查询请求导致CPU使用率高:优化查询;通过慢日志确认查询慢的索引;集群升配扩容
  * 写入请求导致CPU高
  * segment过多,索引的性能变的很差:在业务低峰期进行强制合并,减少segment

* **集群负载不均:**
  * shard分配不均,shard大小和数量不规范:重新分配shard
  * 集群存在磁盘高水位节点,当磁盘水位达到90%,es会把该节点上的部分shard迁移到其他节点,这种情况,很容易出现个别节点被分配较多的索引,造成请求的热点:清理旧数据,扩容
  * segment大小不均: force merge
    * 检查索引是否存在某个shard查询时间比其他shard长
    * 查询时指定\_primary和\_replica,查看主、副shard查询消耗的时间
  * 存在典型的冷热数据需求场景
* **集群崩溃:**
  * 处于无主状态,无法自我恢复
    * CPU使用率处于瓶颈,重启集群并切断流量(无效)
    * HDD磁盘,元数据同步刷盘效率非常低,使元数据变更卡住较长时间:开启异步落盘
    * 延长发现主节点的间隔时间
  * 负载太高
* **bulk reject(写入拒绝率) / search reject(查询拒绝率):**
  * 检查bulk请求的body是否合理,单个bulk请求的大小在10mb以内合理,过大会导致单个bulk请求处理时间过长,导致队列排满;过小,导致bulk请求数过多,导致队列排满
  * QPS过高,达到集群最高承受
  * 检查shard大小、分布是否合理:分片数据量过大,可能会引起bulk reject
  * 检查reject是否在同一个节点,指定routing,routing设计不合理,就一个值,导致写入拒绝
* **索引分片损坏**
* **OOM,触发熔断**
  * 配置太低,负载太高
  * JVM使用率高,通过适当降低读写、清理内存等方法降低负载
    * 清理fielddata cache
    * 清理segment
* **Elasticsearch " Request cannot be executed; I/O reactor status:"**
  * 客户端文件句柄耗尽
  * 并发连接es的客户端太多
  * 客户端连接es后长时间没有数据读写又没有及时close然后下次有数据读写又复用同一个连接
  * es负载太高

#### unassigned分片问题可能的原因

1）INDEX_CREATED：由于创建索引的API导致未分配。

2）CLUSTER_RECOVERED ：由于完全集群恢复导致未分配。

3）INDEX_REOPENED ：由于打开open或关闭close一个索引导致未分配。

4）DANGLING_INDEX_IMPORTED ：由于导入dangling索引的结果导致未分配。

5）NEW_INDEX_RESTORED ：由于恢复到新索引导致未分配。

6）EXISTING_INDEX_RESTORED ：由于恢复到已关闭的索引导致未分配。

7）REPLICA_ADDED：由于显式添加副本分片导致未分配。

8）ALLOCATION_FAILED ：由于分片分配失败导致未分配。

9）NODE_LEFT ：由于承载该分片的节点离开集群导致未分配。

10）REINITIALIZED ：由于当分片从开始移动到初始化时导致未分配（例如，使用影子shadow副本分片）。

11）REROUTE_CANCELLED ：作为显式取消重新路由命令的结果取消分配。

12）REALLOCATED_REPLICA ：确定更好的副本位置被标定使用，导致现有的副本分配被取消，出现未分配。

### 一.分片未分配

#### 1.问题现象:

* 分片未分配

可能原因

* 磁盘空间不足:没有磁盘空间来分配分片
* 分片数限制:每个节点的分片数量过多,在创建新索引或删除某些节点且系统找不到它们的位置时很常见
* JVM或内存限制:一些版本在内存不足时可以限制分片分配
* 路由或分配规则:通用高可用云或大型复杂系统会遇到

#### 2.定位过程

* 查看**Unassigned Shards**原因: `curl 'localhost:9200/_cluster/allocation/explain?pretty'`

```
#错误内容
* shard has execeeded the maximum number of retries [5] on failed allocation attempts
* failed to create shard
```

* 查看**fd**情况: `curl -XGET http://localhost:9200/_nodes/stats/process?`,fd情况正常
* 查看es日志:`cat elasticsearch.log |grep -i "allocation_status"`

#### 3.问题原因

* shard 自动分配 已经达到最大重试次数5次，仍然失败了，所以导致"shard的分配状态已经是：no_attempt"

#### 4.解决方案

`curl -XPOST http://localhost:9200/_cluster/reroute?retry_failed=true`

#### 5.改进建议



### 二.

#### 1.问题现象:



#### 2.定位过程



#### 3.问题原因



#### 4.解决方案



#### 5.改进建议



