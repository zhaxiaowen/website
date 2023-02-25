# ES

### ES集群主分片未分配

1.测试环境es集群red状态
1.1 检查节点数正常
1.2 /data/es/logs/pbs-elk.log 报erp-java1-uat-2021-04-24索引相关
1.3 通过查找索引 curl -XGET -u elastic:elastic http://10.120.3.7:9200/_cat/indices|grep red
1.4 查看所有主分片副分片数curl -XGET -u elastic:elastic http://10.120.3.7:9200/_cat/indices?v |grep erp-java1-uat-2021-04-24
1.5 过滤主分片未分配索引
(curl -XGET -u elastic:elastic http://10.120.3.7:9200/_cat/shards?h=index,shard,prirep,state,unassigned.reason| grep UNASSIGNED)
1.6 查看未分配主分片原因 curl -XGET -u elastic:elastic http://10.120.3.7:9200/_cluster/allocation/explain?pretty
2.原因提示 [failed to obtain in-memory shard lock]无法获取内存碎片锁(分片未正常清理或关闭),并且注意到“分配尝试失败"尝试了5次都没成功.
2.1 
2.3 解决办法: 需要重新触发分配
POST /_cluster/reroute?retry_failed

### ES hot_thread

[hot_thread](https://mp.weixin.qq.com/s?__biz=MzI2NDY1MTA3OQ==&mid=2247485529&idx=1&sn=3f1b91fcd75301109e375368435fdb16&chksm=eaa82071dddfa96737cd9cc2f838f59036851e1a9d4f7f3c56edf5adf0a1b4a2c281060b7c8a&scene=21#wechat_redirect)

### es+kafka堆积

[ES明明还没到瓶颈，可为啥kafka中有大量消息堆积呢](https://cloud.tencent.com/developer/article/1626561)

### es上云案例

https://www.cnblogs.com/qcloud1001/p/13451127.html

### es生产环境索引扩分片

https://note.youdao.com/web/#/file/recent/note/626E40128A7F4D6E861EEB97DDA729FF/

### kibana监控数据断点问题

[kibana所有监控数据断点问题](https://cloud.tencent.com/developer/article/1618912)
