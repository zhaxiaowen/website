# Elasticsearch常用命令

#### [elasticsearch运维指南](https://cloud.tencent.com/developer/article/1836799)

[es集群运维常用命令](https://cloud.tencent.com/developer/article/1910980)

[es运维文档](https://jiangxl.blog.csdn.net/article/details/117066251?spm=1001.2014.3001.5502)

[常见故障总结](https://www.cnblogs.com/qcloud1001/p/13755469.html)

## 一、CRUD

#### 常用查询指令

```yaml
GET /_cat/nodes?v
查看索引信息:	GET /_cat/indices?v
GET /_cat/indices?v&h=health,status,index
只查看数据：GET twitter/_source/1
GET /test4/user/_search?q=name:"zzz"

批量查找: 
GET _mget
{
  "docs": [
    {
      "_index": "twitter",
      "_id": 1
    },
    {
      "_index": "twitter",
      "_id": 2
    }
  ]
}
或
GET twitter/_doc/_mget
{
	"ids":["1","2"]
}

查询索引的输入文档: POST twitter/_search
查询数据条数: GET twitter/_count
通过 _source 来定义返回想要的字段：
{
  "hits" : {
    "total" : {
      "value" : 6,
      "relation" : "eq"
    }
  }
}
不返回_source信息
GET bank_account/_search
{
  "_source":false,
  "query":{
    "match_all": {
      "user":"xxx"
    }
  }
}
查询结果不需要score:
GET twitter/_search
{
  "query": {
    "bool": {
      "filter": {
        "term": {
          "city.keyword": "北京"
        }
      }
    }
  }
}

matchquery默认的操作是OR：,会去匹配朝/阳/区/老/贾/这几个字；以设置参数 minimum_should_match 来设置至少匹配的 term
GET twitter/_search
{
  "query": {
    "match": {
      "user": {
        "query": "朝阳区-老贾",
        "operator": "or"
      }
    }
  }
}
想知道得出查询结果的原因,可以添加:  "explain": true
GET twitter/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "city": "北京"
          }
        },
        {
          "match": {
            "age": "30"
          }
        }
      ]
    }
  },
  "explain": true
}
```

#### 查询

```plain
#指定doc_id查询
GET twitter/doc/1
#指定值查询；zhaoxw:字段值
GET twitter/_search?q=zhaoxw
#指定字段和值查询;name:字段名；zhaoxw:字段值
GET twitter/_search?q=name:zhaoxw
#以QueryDSL查询
GET twitter/_search
{
	"query": {
  	"match":{
    	"age": 20
      }
  }
}

#shard分布情况
GET _cat/shards?v
GET _cat/shards/"index-name"?v
#segment分布情况
GET _cat/segments?v
GET _cat/segments/"index-name"?v
```

#### 检测index/doc_id是否存在

```yaml
检测doc_id是否存在:	HEAD twitter/_doc/1
检测索引是否存在: HEAD twitter
```

#### 批处理

```yaml
POST _bulk
{ "index" : { "_index" : "twitter", "_id": 1} }
{"user":"双榆树-张三","message":"今儿天气不错啊，出去转转去","uid":2,"age":20,"city":"北京","province":"北京","country":"中国","address":"中国北京市海淀区","location":{"lat":"39.970718","lon":"116.325747"}}
{ "index" : { "_index" : "twitter", "_id": 2 }}
{"user":"东城区-老刘","message":"出发，下一站云南！","uid":3,"age":30,"city":"北京","province":"北京","country":"中国","address":"中国北京市东城区台基厂三条3号","location":{"lat":"39.904313","lon":"116.412754"}}
建议:批处理1000-5000个文档,总有效负载在5MB-15MB,性能最佳
```

#### 查询修改

```yaml
POST twitter/_update_by_query
{
  "query": {
    "match": {
      "user": "GB"
    }
  },
  "script": {
    "source": "ctx._source.city = params.city;ctx._source.province = params.province;ctx._source.country = params.country",
    "lang": "painless",
    "params": {
      "city": "上海",
      "province": "上海",
      "country": "中国"
    }
  }
}
```

#### 模板

```plain
#定义一个模板
PUT /_template/<index-template>
例：
PUT _template/logs_template
{
  "index_patterns": "logs-*",
  "order": 1, 
  "settings": {
    "number_of_shards": 4,
    "number_of_replicas": 1
  },
  "mappings": { 
    "properties": {
      "@timestamp": {
        "type": "date"
      }
    }
  }
}
创建索引：PUT logs-2019-03-01
查看索引模板：GET _template/logs_template
删除索引模板：DELETE _template/logs_template
```



#### 起别名

```plain
POST _alias
{
	"actions":[
  	"add":{
    	"index": "twitter",
      "alias": "twitter-1"
    }
  ]
}
```

## 二、API命令

### cat-API

#### 小技巧tips

```plain
V:显示表头   #GET _cat/allocation?v
help:显示命令返回的参数说明    #GET _cat/allocation?help
h:选择要显示的列    #GET _cat/health?v&h=epoch,cluster
format:设置返回的内容格式，支持json,yaml,text,smile,cbor   #GET _cat/health?format=json
sort:排序   #GET _cat/indices?v&s=docs.count:desc,store.size:asc
						_cat/shards?v&s=store
&:多个参数一起使用   #GET _cat/indices?v&s=store.size:desc
```

#### aliases

```plain
GET _cat/aliases?v  显示别名、过滤器、路由信息

alias:别名
index:索引名
filter:过滤器
routing.index:索引路由
routing.search:搜索路由
is_write_index:写索引
```

#### allocation

```plain
GET _cat/allocation?v  #显示每个节点分片数量、占用空间

shards:节点承载的分片数量
disk.indices:索引占用的空间大小
disk.used:节点所在集群已使用的磁盘大小
disk.avail:节点可用空间大小
disk.total:节点总空间大小
disk.percent:节点磁盘占用百分比
host:节点host
ip:节点ip
node:节点名称
```

#### count

```plain
GET _cat/count?v  #查看索引文档的数量

epoch:自标准时间（1970-01-01 00:00:00）以来的秒数
timestamp:时分秒，utc市区
count:文档总数
```

#### health

```plain
GET _cat/health?v  #查看集群监控状况

cluster:集群名称
status:集群状态
node.total:节点总数
node.data:数据节点总数
shards:分片总数
pri:主分片总数
relo:复制节点总数
init:初始化节点总数
unassign:未分配分片总数
pending_tasks:待定任务总数
max_task_wait_time:等待最长任务的等待时间
active_shards_percent:活动分片百分比
```

#### indices

```plain
GET _cat/indices?v  #查看索引信息

health:索引健康状态
status:索引的开启状态
index:索引名称
uuid:索引uuid
pri:索引主分片数
rep:索引副本分片数量
docs.count:索引中文档总数
docs.deleted:索引中删除状态的文档
sotre.size:主分片+副本分片的大小
pri.store.size:主分片的大小
```

#### master：

```plain
GET _/cat/master?v  #显示master节点信息
```

#### nodeattrs

```plain
GET _cat/nodeattrs?v  #显示node节点属性

attr:属性描述
value:属性值
```

#### nodes

```plain
GET _cat/nodes?v  #显示node节点信息

heap.percent:堆内存占用百分比
ram.percent:内存占用百分比
cpu:cpu占用百分比
node.role:node节点的角色
master:是否是master节点
```

#### pending_tasks

```plain
GET _cat/pending_tasks?v  #显示正在等待的任务

insertOrder:任务插入顺序
timeInQueue:任务排队了多长时间
priority:任务优先级
source:任务源
```

#### plugins

```plain
GET _cat/plugings?v  #显示节点上的插件
```

#### recovery

```plain
GET _cat/recovery?v #显示正在进行和先前完成的索引碎片恢复的视图
```

#### segments

```plain
GET _cat/segments?v  #显示分片中的分段信息

index:索引名称
shard:分片名称
prirep:主分片还是副本分片
segment:segments段名
greneration:分段生成
docs.count:段中的文档数
```

#### shards

```plain
GET _cat/shards?v   #显示索引分片信息

prirep:分片状态
state:分片状态
docs:该分片存放的文档数
store:该分片占用的存储空间大小
node:该分片所在的节点名称
```

#### thread_pool

```plain
GET _cat/thread_pool?v  #显示线程池信息
GET _cat/thread_pool?v&h=id,name,active,rejected,completed,size,type&pretty&s=type

active:活跃线程数
queue:当前队列中的任务数
rejected:被拒绝的任务数
```

#### templates

```plain
GET _cat/templates?v  #显示模板信息

name:模板名称
index_patterns:模板匹配规则
order:模板优先级
version:模板版本
```

### cluster-API

#### health

```yaml
GET _cluster/health?pretty  #查看集群监控状态
```

#### settings

```plain
GET _cluster/settings?pretty=true  #获取集群配置
# transient:临时调整集群配置,重启后失效
# persistent:永久调整集群配置
auto_create_index: 自动创建索引开关

```

#### stats

```plain
GET _cluster/stats   #集群统计信息，如jvm、内存、cpu
GET _cluster/stats/nodes/<node_id>
```

#### state

```yaml
GET _cluster/state?pretty=true #查看集群完整的状态信息
GET _cluster/state/index?pretty=true #查看集群"index-name"信息 

GET /_nodes/stats/process? #可以显示每个node的role属于(data/ingest/master),显示open_file_descriptors、max_file_descriptors数量
```

## delete

```yaml
DELETE index-name  #删除索引
POST index-name/_close  #关闭索引
POST index-name/_open   #开启索引
```

## 三、运维常用API

#### 索引settings

```plain
https://segmentfault.com/a/1190000037730202 :
集群中Shards分配与恢复
集群中Shards rebalance

PUT /index-name/_settings  {"index":{"number_of_replicas":1}}   #调整分片索引
PUT /index-name/_settings  {"index":{"refresh_interval" : "30s"}} #调整索引refresh频率
PUT /index-name/_settings  {"index":{"translog.durability" : "async","translog.flush_threshold_size":"1gb"}}  #调整索引translog flush策略


GET /_cluster/settings?include_defaults&flat_settings   #查看断路器
```



