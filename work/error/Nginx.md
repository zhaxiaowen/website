# Nginx

### Nginx报499,5xx

1. 查看nginx**请求流量状态，没有增加，反而减少；不是流量突增导致故障**
2. **查看nginx响应时间监控（rpcdfe.latency）,响应时间变长**

3. **查看nginx upstream响应时间；响应时间边长，猜测后端upstream响应时间拖住nginx,导致nginx出现请求流量异常**
4. **top查看cpu，发现nginx worker cpu比较高；** 主要开销在free,malloc,json解析上面  

### CLB替换,需要加载nginx

1. nginx的域名解析直接依赖宿主机/etc/resolv.conf配置声明的DNS服务器
2. nginx无视TTL并缓存DNS记录,直到下一次重启或配置重载,至于域名解析,nginx启动时就对 `img.ffutop.com` 进行了解析
3. 临时解决方法:nginx -s reload
4. NGINX 对 DNS TTL 的非标实现，对 IP 频繁发生变更的服务是无法接受的;NGINX 提供了标准实现，通过提供 `resolver` 指令声明 DNS 服务器地址，NGINX 将在 DNS 记录 TTL 到期后，重新解析域名。

​	

### [修改nginx属主和属组导致故障](nginx 关于client_max_body_size client_body_buffer_size配置)

#### 背景:业务容器化过程中,有同事不小心rm -rf 了所有upstream配置,为了防止再次出现这种情况,用ansible备份nginx的所有conf文件

#### 操作:因为ansible只免密了carapp用户,而nginx是用nginx用户启动的,然后修改了所有nginx目录的属主和属组,导致线上故障

#### 故障原因:client_body_buffer_size

* nginx分配给请求数据的buffer大小,如果请求的数据小于client_body_buffer_size,直接将数据先存储在内存中;如果请求的值大于client_body_buffer_size小于client_max_body_size,就会将数据先存储到临时文件中,存储在client_body_temp指定的路径中
* 所以配置的client_body_temp路径,一定让执行的nginx用户组有读写权限,否则,当传输的数据大于client_body_buffer_size,写进临时文件失败会报错

