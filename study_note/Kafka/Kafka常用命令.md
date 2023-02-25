# Kafka常用命令

[kafka运维指令](https://www.szzdzhp.com/kafka/op/op-for-kafka-all.html)

### 常用指令

```
# 查看所有topic详情
./kafka-topics.sh --zookeeper 192.168.50.100:2181 --describe
```

```
#kafka常用命令
=========================创建topic=================================
kafka-topics.sh  --create  --bootstrap-server $1:9092   --replication-factor n --partitions n --topic name

=========================删除topic=================================
kafka-topics.sh  --delete  --bootstrap-server $1:9092  --topic name

=========================topic详情=================================
kafka-topics.sh --bootstrap-server $1:9092  --describe  --topic name

=========================列出topic=================================
kafka-topics.sh  --bootstrap-server $1:9092 --list|grep

=========================查看topic消息=============================
kafka-console-consumer.sh -bootstrap-server $1:9092  --topic name  [--from-beginning]

=========================列出消费者组==============================
kafka-consumer-groups.sh --bootstrap-server $1:9092 --list|grep

=========================查看消费者组详情==========================
kafka-consumer-groups.sh --bootstrap-server $1:9092 --describe  --group groupName

=========================删除消费者组===============================
kafka-consumer-groups.sh --bootstrap-server $1:9092  --delete --group groupName

=========================生产者手动发送消息========================
kafka-console-producer.sh --broker-list $1:9092 --topic name

```



#### kafka-topics.sh

```yaml
# 启动kafka
/usr/local/kafka/bin/zookeeper-server-start.sh /usr/local/kafka/config/zookeeper.properties &
/usr/local/kafka/bin/kafka-server-start.sh /usr/local/kafka/config/server.properties &

# 停止kafka
/usr/local/kafka/bin/zookeeper-server-stop.sh /usr/local/kafka/config/zookeeper.properties 
/usr/local/kafka/bin/kafka-server-stop.sh /usr/local/kafka/config/server.properties 

rm -rf /tmp/kafka-logs/  && rm -rf /tmp/zookeeper/

# 创建topic
./kafka-topics.sh --create --bootstrap-server 192.168.50.100:9092 --replication-factor 3 --partitions 1 --topic my-replicated-topic 

# 删除topic
./kafka-topics.sh --bootstrap-server  127.0.0.1:9092 --delete --topic my-replicated-topic (支持正则匹配："my-.*")

# 查看有多少topic
./kafka-topics.sh --bootstrap-server 127.0.0.1:9092  --list

# 查看所有topic的详细信息
./kafka-topics.sh --bootstrap-server 192.168.50.100:9092 --describe

# 查看指定topic信息
./kafka-topics.sh --describe --bootstrap-server 127.0.0.1:9092 --topic myreplicated-topic
 
# 查看指定topic的详细信息
 ./kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --topic uat0 --describe --exclude-internal
 
# 查看所有topic信息
./kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --topic ".*?" --describe --exclude-internal
  
 # 查看kafka版本
 ./kafka-configs.sh --describe --bootstrap-server 127.0.0.1:9092 --version
 
 # 手动触发平衡
 ./kafka-preferred-replica-election.sh --zookeeper localhost:2181/openlogs
  
# 查看指定topic磁盘信息
./kafka-log-dirs.sh --describe --bootstrap-server 127.0.0.1:9092 --topic-list fat0

# 查看指定broker磁盘信息
./kafka-log-dirs.sh --describe --bootstrap-server 127.0.0.1:9092 --topic-list fat0 --broker-list 1

# topic扩分区
./kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --alter --topic test1 --partitions 4

# 批量扩分区
./kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --alter --topic ".*?" --partitions 4
```



#### 扩/缩副本

```yaml
# 生成推荐配置脚本
move-json-file.json
{
  "topics": [
    {"topic": "test2"}
  ],
  "version": 1
}

./kafka-reassign-partitions.sh  --bootstrap-server 192.168.50.100:9092 --topics-to-move-json-file move-json-file.json --broker-list "0,1,2" --generate

# 执行json文件
按需修改：reassignment-json-file.json，扩容是在move-json-file.json生成的基础上，修改replicas和log_dirs，缩容也是
{
	"version": 1,
	"partitions": [{
		"topic": "test2",
		"partition": 2,
		"replicas": [2,0],
		"log_dirs": ["any","any"]
	}, {
		"topic": "test2",
		"partition": 1,
		"replicas": [1,2],
		"log_dirs": ["any","any"]
	}, {
		"topic": "test2",
		"partition": 0,
		"replicas": [0,1],
        "log_dirs": ["any","any"]
	}]
}
执行修改副本命令
./kafka-reassign-partitions.sh --bootstrap-server 192.168.50.100:9092  --reassignment-json-file reassignment-json-file.json --execute
```

#### topic迁移

```yaml
# 生成推荐配置脚本
move-json-file.json
{
  "topics": [
    {"topic": "test2"}
  ],
  "version": 1
}

./kafka-reassign-partitions.sh  --bootstrap-server 192.168.50.100:9092 --topics-to-move-json-file move-json-file.json --broker-list "0,1,2" --generate

# 确定迁移方案
reassignment-json-file.json
{"version":1,"partitions":[{"topic":"test5","partition":0,"replicas":[1],"log_dirs":["any"]}]}

#执行迁移命令
./kafka-reassign-partitions.sh --bootstrap-server 192.168.50.100:9092  --reassignment-json-file reassignment-json-file.json --execute

# 查看迁移状态
Reassignment of partition [topicA,4] is still in progress # 转移中
Reassignment of partition [topicB,2] completed successfully # 转移结束

./kafka-reassign-partitions.sh --bootstrap-server 192.168.50.100:9092  --reassignment-json-file reassignment-json-file.json --verify
```

#### 

#### kafka-consumer-groups

```plain
# 查看所有消费组
./kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 --list

# 查看指定消费组消费情况：
./kafka-consumer-groups.sh --describe --bootstrap-server 127.0.0.1:9092 --group test

# 查看kafka topic 数据信息
./kafka-console-consumer.sh  --bootstrap-server 127.0.0.1:9092 --group test --topic fat0

# 查看消费者状态信息
./kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 --describe --state --group test 

# 从头重放topic的消息
kafka-console-consumer.sh --bootstrap-server 172.19.67.2:9092  --topic wsWangYueChe-wangyueche-Map-inner --from-beginning --from-beginning

# 删除group
./kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 --group ka-waybill-route --delete

# 查看topic 指定分区offset的最大/最小值: -1表示最大,-2表示最小
/kafka-run-class.sh kafka.tools.GetOffsetShell --broker-list 127.0.0.1:9092 --topic ka_tms_waybill_dat --time -2

# 修改kafka topic offset为最初偏移量  注意：Offset-group必须是非活跃状态，退出消费。
./kafka-consumer-groups --bootstrap-server 127.0.0.1:9092 --group offset-group --topic test2 --reset-offsets --to-earliest --execute

# 修改kafka topic offset为任意偏移量
./kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 --group offset-group --topic test2 --reset-offsets --to-offset 8 --execute

# 修改kafka topic offset到指定时间（未测试）
./kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 --group offset-group --topic test2 --reset-offsets --to-datetime "2021-6-26T00:00:00.000" --execute
# Kafka在kerberbos认证下查看与修改topic offset
https://www.cnblogs.com/xwg168/p/14452602.html
```

#### kafka-dump-log.sh

```plain
#查看Log文件
./kafka-dump-log.sh --files /data/kafka/data/kafkadata1/fat0-0/00000000000143631049.log

# 查看log文件具体信息
./kafka-dump-log.sh --files /data/kafka/data/kafkadata1/fat0-0/00000000000143631049.log --print-data-log

# 查看index文件具体信息
./kafka-dump-log.sh --files /data/kafka/data/kafkadata1/fat0-0/00000000000143631049.index

# 查看timeindex文件
./kafka-dump-log.sh --files /data/kafka/data/kafkadata1/fat0-0/00000000000158541573.timeindex
```

### 常用指令(zookeeper)

```yaml
# 列出所有topic
./kafka-topics.sh --list --zookeeper localhost:2181/openlogs  #openlogs是存在zookeeper的位置,可以在server.properties文件的zookeeper.connect参数看到

# 删除topic
1) ./kafka-topics.sh --zookeeper localhost:2181/openlogs --topic test --delete
2) ./kafka-run-class.sh kafka.admin.DeleteTopicCommand --zookeeper localhost:2181 --topic test 

# 查看指定topic
./kafka-topics.sh --describe --zookeeper localhost:2181/openlogs --topic test

# 增加topic的partition
./kafka-topics.sh --zookeeper localhost:2181/openlogs --alter --topic test --partitions 3
```

