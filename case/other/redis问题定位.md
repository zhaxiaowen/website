# redis问题定位

#### 1.网络/延迟故障

* 查看参数设置:CONFIG GET timeout   ;CONFIG GET  tcp-keepalive ; CONFIG GET tcp-backlog; CONFIG GET maxclients
* 查看当前连接数:
* 查看磁盘I/O情况: iostat -x -k 1
* 查看系统ipv4参数配置: sysctl -a|egrep -i "net.ipv4.tcp_fin_timeout|net.ipv4.tcp_keepalive_time|net.ipv4.tcp_max_tw_buckets"

