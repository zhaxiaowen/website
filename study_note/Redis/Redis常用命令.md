# Redis常用命令

#### 常用指令

```yaml
info memory
info stats
dbsize        	#查看key数量
exists key    	#检查key是否存在
get key	      	#查询key
del key 	 	#删除key

persist key   	#清除键的过期时间
ttl key			#查看键剩余时间,单位s >=0:剩余的过期时间  -1:未设置过期时间  -2:键不存在
pttl key		#查看键剩余时间,单位ms >=0:剩余的过期时间  -1:未设置过期时间  -2:键不存在

expire test 10	#设置10s过期
expire test 1520953200 #指定过期时间,1520953200为日期时间戳

type key		#查看键的数据结构类型
randomkey 		#随机返回一个key
数据刷新到磁盘:SAVE,直接调用rdbSve阻塞主线程;BGSAVE,fork子线程,子线程调用rdbSave
strlen test:判断字符串长度 ; # list--llen , hash--hlen, set--scard, sorted set--zcard;
redis-cli monitor #查询执行过的指令

client list 	#查看当前连接的ip与端口
client kill ip:port #断开连接
BGSAVE 			#手动持久化

redis-cli -a root -h 10.244.2.46 role  #查看redis节点的角色（master/slave）
```

#### 动态修改配置

```yaml
CONFIG SET parameter value  #此命令可以动态调整redis服务器的配置而无需重启
CONFIG GET parameter #查看所匹配的配置参数

config set maxmemory 5gb;  config get maxmemory   #临时调大内存
config rewrite:将配置持久化到内存
例:
CONFIG SET requirepass 123456
CONFIG GET requirepass
CONFIG GET *
```

#### 慢查询

```yaml
#慢查询发生在执行命令阶段
#客户端超时不一定是慢查询,但慢查询是客户端超时的一个可能因素
config set slowlog-log-slower-than 5000(us)
SLOWLOG LEN #查看慢日志的记录条数
SLOWLOG GET [n] #查看慢日志的n条记录
```

#### ![img](https://cdn.nlark.com/yuque/0/2021/png/21484941/1627006128164-42040856-f3cf-40ce-9834-dda5658950c3.png)

- 1=日志的唯一标识符
- 2=被记录命令的执行时间点，以 UNIX 时间戳格式表示

- 3=查询执行时间，以微秒为单位。例子中命令使用54毫秒。
- 4= 执行的命令，以数组的形式排列。完整命令是config get *。

#### 大key

```yaml
redis-cli -p 10030 --bigkeys -i 0.1
```



```yaml
抓trace: strace -f -T -tt -p 9085
lsof -p 9085
查看磁盘iopidstat -d 1
延迟时间:Redis-cli --latency -h 127.0.0.1 -p 6379
客户端连接数:info clients #redis默认允许客户端连接的最大数量10000,若是连接数超过5000,可能会影响性能
查看客户端最大连接数:config get maxclients #这个数字应该设置为预期连接数峰值的110%到150之间，Redis会拒绝并立刻关闭新来的连接
内存碎片率:没有足够的连续的内存分配,不得不分配多个不连续的小的内存快来存储,一般来说,碎片率稍微大于1是合理的,大于1.5,就说明redis消耗了实际需要物理内存的150%,其中50%是内存碎片率;若是低于1,说明redis内存分配超出了物理内存,操作系统正在进行内存交换.内存交换会引起非常明显的响应延迟
```

#### Cluster

```plain
redis-cli -h 127.0.0.1 -a 123456 cluster info
redis-cli -h 127.0.0.1 -a 123456 cluster nodes    #查看节点状态,以及对应的槽位
redis-cli -h 127.0.0.1 -a 123456 info replication
redis-cli -h 127.0.0.1 -a 123456 cluster slots    #查看主从节点关系和操作信息；显示当前的集群状态，以数组形式展示

redis-cli -h 127.0.0.1 -p 6379 -a 123456 --stat		#查看某个分片的requests流量均衡情况；一般超过12W需要告警

cluster failover  #手动故障转移,切换主从(只能发给从节点)
cluster keyslot name  #返回"name"key对应的槽位

```

#### redis_exporter

```plain
./redis_exporter -redis.addr redis://192.168.50.100:16379 -redis.password "redis"
```

