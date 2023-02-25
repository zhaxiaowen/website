# 

1. [redis原理及问题,JAVA,HTTP,中间件相关问题](https://blog.csdn.net/xiaofeng10330111/category_8448193.html)
2. TCP/IP:小林code网络篇
3. [kafka:石臻臻杂货铺](https://www.szzdzhp.com/kafka/)
4. [k8s](https://mp.weixin.qq.com/s?__biz=MzI0MDQ4MTM5NQ==&mid=2247514668&idx=1&sn=26e13d69f4011de314633aabef955fce&chksm=e918df30de6f56265e5b6b716d7b79f72c52fb940d5114bbe7e261c1a4c026309de006d908c4&scene=178&cur_album_id=1790435592028160001#rd)
5. [web运维](https://www.it610.com/article/1445576746060525568.htm)
6. 高并发
6. [lvs](https://www.cnblogs.com/skychen1218/p/13327965.html)
6. [es1](https://www.cnblogs.com/kevingrace/p/6298022.html)
6. [es2](https://www.cnblogs.com/kevingrace/p/10682264.html)



### SRE

* 如何保证服务稳定性

* 如何做好容量规划

  > 容量规划是以当前的性能作为基线,来决定你需要什么及什么时候需要
  >
  > 单台服务器的最大QPS,集群的QPS,需要扩容吗?扩多少?

  * 收集指标:通过测试了解当前服务的数据指标,QPS,时延等
  * 明确目标:对外承诺的服务质量,比如说3000QPS,响应时间小于200ms
  * 趋势预测:根据历史数据,判断未来的业务增长速率,是否会达到集群的瓶颈,提前做好准备

* 如何定位问题

* 系统设计

  * 高可用性:多副本,弹性扩缩容
  * 能承受并发量:比如单台的QPS,可以从容量规划方面说

### 个人相关

* 职业规划
* 离职原因

### 生产相关

* 公司架构
* 遇到过的生产故障

### 你有什么问题

* 岗位的职责,日常工作内容是什么（即日常做哪些工作，协调沟通方面以及要面对的问题）

* 业务目前部署在哪里,自建机房,还是腾讯云这种,后续有切k8s的计划吗?

* 如何处理技术负债（技术负债这件事，如果能积极面对和解决，对个人和企业的提升都是有很大帮助的，但如果不重视这件事，那么工作的推进是比较心累的）？

* 作为领导,你更希望手下的组员,在工作态度或技能方面,有哪些需求

* 

* 版本发布流程,是否有灰度,A/B等;是否严格按发版流程执行(判断流程是否全面合理清晰,避免流程混乱带来的很多问题)

* 新业务的上线,运维是在哪个环节开始参与的
  * 需求评审阶段就介入,还是在准备上线时介入
  
* 一些重要系统的变更,是否有评审环节

* 是否有在职培训、技术经验业务分享等（职级晋升、快速融入、个人的非物质收益等）？

  

### 系统相关

- uptime命令中load average字段后的3个数字代表什么？如何判断系统整体负载的高低？
  - 一分钟内,五分钟内,十五分钟内的系统平均负载;
  - load 是一定时间内计算机有多少个活跃任务,也就是说是计算机的任务执行队列的长度,cpu计算的队列,所以一般认为CPU核数的就是load值的上线。
- 如何查看某个进程的CPU、内存和负载情况？
  - 通常我们使用top命令去交互查看系统负载信息。
- free命令中shared  buff/cache  available 这3个字段是什么意思？
  - shared 多进程使用的共享内存;
  - buff/cache 读写缓存内存,这部分内存是当空闲来用的,当free内存不足时,linux内核会将此内存释放;
  - available 是可以被程序所使用的物理内存;
- 描述下在linux中给一个文件授予 644权限是什么意思？
  - 644 即〔当前用户读和写权限,〔群组用户〕读权限,〔其它〕读权限。
- linux中如何禁止一个用户通过shell登录？
  - 使用命令或者通过修改/etc/passwd文件的用户shell部分为/sbin/nologin 即可实现。
- 如何观察当前系统的网络使用情况？
  - 使用iftop等工具。
- 如何追踪A主机到B主机过程中的丢包情况？
  - traceroute、mtr, 或者其他双端带宽测试工具。
- linux 系统中ID为0是什么用户？
  - root
- 怎么统计当前系统中的活跃连接数？
  - netstat -na|grep ESTABLISHED|wc -l
- time_wait 状态处于TCP连接中的那个位置？
  - 客户端发出FIN请求服务端断连, 服务器未发送ack+fin确认。

#### 问题

| 浏览器输入一个url到整个页面显示出来经历了哪些过程？ | https://blog.csdn.net/weixin_34348174/article/details/93722583 |
| --------------------------------------------------- | ------------------------------------------------------------ |
| 死锁产生的原因及解决方法                            | https://zhuanlan.zhihu.com/p/108169678                       |
| 线程和进程的区别是什么？                            | https://www.zhihu.com/question/25532384                      |
| 内存管理:虚拟内存的优点                             | 小林code                                                     |

## k8s

#### 容器和主机部署的区别--(待完善)

* 容器

#### k8s有哪些组件,具体的功能是什么

* master节点
  * kubectl:客户端命令行工具,整个k8s集群的操作入口
  * api server:资源操作的唯一入口,提供认证、授权、访问控制、API注册和发现等机制
  * controller manager:负责维护集群的状态,故障检测、自动扩展、滚动更新
  * scheduler:负责资源的调度,按照预定的调度策略将pod调度到响应的node节点上
  * etcd:担任数据中心,保存了整个群集的状态
* node节点:
  * kubelet:负责维护pod的生命周期,同时也负责Volume和网络的管理,运行在所有的节点上,当scheduler确定某个node上运行pod后,将pod的具体信息发送给节点的kubelet,kubelet根据信息创建和运行容器,并向master返回运行状态;容器状态不对时,kubelet会杀死pod,重新创建pod
  * kube-proxy:运行在所有节点上,为service提供cluster内部的服务发现和负载均衡(外界服务,service接收到请求后就是通过kube-proxy来转发到pod上的)
  * container-runtime:负责管理运行容器的软件
  * pod:集群里最小的单位,每个pod里面可以运行一个或多个container

#### 镜像下载策略

* Always:镜像标签为latest时,总是从指定的仓库中获取镜像
* Never:禁止从仓库下载镜像,只能使用本地已有的镜像
* IfNotPresent:仅本地没有对应镜像时,才下载
* 默认的镜像策略:当镜像标签是latest时,默认策略是Always;当镜像标签是自定义时,默认策略是IfNotPresent

### Pod相关

#### pod有哪些状态

* pending:处在这个状态的pod可能正在写etcd,调度或者pull镜像或者启动容器
* running
* succeeded:所有的容器已经正常的执行后退出,并且不会重启
* failed:至少有一个容器因为失败而终止,返回状态码非0
* unknown:api server无法正常获取pod状态信息,可能是无法与pod所在的工作节点的kubelet通信导致的

#### Pod的详细状态说明

| 状态                                  | 描述                          |
| ------------------------------------- | ----------------------------- |
| CrashLoopBackOff                      | 容器退出,kubelet正在将它重启  |
| InvalidImageName                      | 无法解析镜像名称              |
| ImageInspectError                     | 无法校验镜像                  |
| ErrImageNeverPull                     | 策略禁止拉取镜像              |
| ImagePullBackOff                      | 正在重试拉取镜像              |
| RegistryUnavailable                   | 连接不到镜像中心              |
| ErrImagePull                          | 通用的拉取镜像出错            |
| CreateContainerConfigError            | 不能创建kubelet使用的容器配置 |
| CreateContainerError                  | 创建容器失败                  |
| m.internalLifecycle.PreStartContainer | 执行hook报错                  |
| ContainersNotInitialized              | 容器没有初始化完毕            |
| ContainersNotRead                     | 容器没有准备完毕              |
| ContainerCreating                     | 容器创建中                    |
| PodInitializing                       | pod 初始化中                  |
| DockerDaemonNotReady                  | docker还没有完全启动          |
| NetworkPluginNotReady                 | 网络插件还没有完全启动        |



#### pod的创建过程

* 客户端提交pod的配置信息给kube-apiserver
* apiserver收到指令后,通知controller-manager创建一个资源对象
* controller-manager通过api-server将pod的配置信息存储到etcd
* kube-secheduler检测到pod信息会开始调度预选,先过滤掉不符合pod资源需求的node,然后开始调度调优,然后将pod的资源配置发送给node的kubelet
* kubelet根据scheduler发来的资源配置创建pod,pod创建成功后,将pod的运行信息返回给scheduler,scheduler将返回的pod状态信息存储到etcd

#### pod优雅关闭的过程

1. 用户发出删除 pod 命令
2. K8S 会给旧POD发送SIGTERM信号；将 pod 标记为“Terminating”状态；pod 被视为“dead”状态，此时将不会有新的请求到达旧的pod；
3. 并且等待宽限期（terminationGracePeriodSeconds 参数定义，默认情况下30秒）这么长的时间
4. 第三步同时运行，监控到 pod 对象为“Terminating”状态的同时启动 pod 关闭过程
5. 第三步同时进行，endpoints 控制器监控到 pod 对象关闭，将pod与service匹配的 endpoints 列表中删除
6. 如果 pod 中定义了 preStop 处理程序，则 pod 被标记为“Terminating”状态时以同步的方式启动执行；若宽限期结束后，preStop 仍未执行结束，第二步会重新执行并额外获得一个2秒的小宽限期(最后的宽限期，所以定义prestop 注意时间,和terminationGracePeriodSeconds 参数配合使用),
7. Pod 内对象的容器收到 TERM 信号
8. 宽限期结束之后，若存在任何一个运行的进程，pod 会收到 SIGKILL 信号
9. Kubelet 请求 API Server 将此 Pod 资源宽限期设置为0从而完成删除操作



* 发起删除一个Pod命令(发送**TERM**信号给pod)后系统默认给30s的宽限期,API-server标记这个pod对象为**Terminating**状态
* kubectl发下pod状态为**Terminating**则尝试关闭pod,如果有定义的**preStop**钩子,可多给2s宽限期
* Controller Manager将Pod从svc的endpoint移除
* 宽限期到则发送**TERM**信号,API server删除pod的API对象,同时告诉kubectl删除pod资源对象
* pod在宽限期还未关闭,则再发送SIGKILL强制关闭
* 执行强制删除后,API server不再等待来自kubelet终止Pod的确认信号

#### 强制删除StatefulSet的Pod,可能会出现什么问题:

* 强制删除不会等待kubelet对Pod已终止的确认消息,无论强制删除是否成功杀死pod,都会立即从API server中释放该pod名字
* 从而可能导致正在运行pod的重复

#### pod的重启策略

* Always:容器失效时,kubelet自动重启容器
* OnFailure:容器终止运行,且退出码不为0时重启
* Nerver:永不重启
  * 不同控制器的重启策略限制如下:
    * RC和DaemonSet:必须设置为Aalways,需要保证容器持续运行
    * Job:OnFailure或Never:确保容器执行完后不再重启

#### 静态Pod

> 正常情况Pod是由Master统一管理,指定,分配的.静态Pod就是不接收Master的管理,在指定node上当**kuelet**启动时,会自动启动所定义的静态Pod
>
> 静态Pod由特定节点上的kubelet进程管理,不通过**apiserver**,无法与常用的**deployment**或者**Daemonset**关联

* 为什么能看到静态Pod:
  * **kubelet**会为每个它管理的静态Pod,调用api-server在k8s的apiserver上创建一个镜像Pod,所以可查询,进入pod,但是不能通过apiserver控制pod(例如不能删除)
* 普通pod失败自愈和静态pod有什么区别
  * 普通pod用工作负载资源来创建和管理多个pod.资源的控制器能处理副本的管理、上线,并在pod失效时提供自愈能力
  * 静态pod在特定的节点运行,完全由kubelet进行监督自愈
* 删除静态pod:只能再配置目录下删除yaml文件,如果用kubectl删除,静态pod会进入pending,然后被kubelet重启
* 静态pod的作用
  * 可以预防误删除,可以用来部署一些核心组件,保障应用服务总是运行稳定数量和提供稳定服务
  * **kube-scheduler** **kube-apiserver** **kube-controller-manager** **etcd**都是用静态pod部署的

### RC和RS

#### 作用:

* 用来控制副本数量,保证pod以我们指定的副本数运行
* 确保pod健康:当pod不健康或无法提供服务时,RC会杀死不健康的pod,重新创建
* 弹性伸缩:通过RC动态扩缩容
* 滚动升级

#### RC和RS的区别:

* RS支持集合式的selector,RC只支持等式
* RS比RC有更强大的筛选能力

#### 注意事项

* 要确保RS标签选择器的唯一性;如果多个RS的标签选择规则重复,可能导致RS无法判断pod是否为自己创建,造成同一个pod被多个RS接管
* .spec.template.metadata.labels的值必须与spec.selector值相匹配,否则会被API拒绝

#### 标签Pod和可识别标签副本集ReplicaSet先后创建顺序不同,会造成什么影响

* 无论RS何时创建,一旦创建,会将自己标签能识别的所有Pod纳入管理,遵循RS规约定义的副本数,开启平衡机制

#### RS缩容算法策略

> 缩容时,rs会对所有可用的pod进行一次权重排序,剔除最不利于系统高可用、稳定运行的Pod

1. 优先剔除peding且不可调度的pod
2. 如果设置了**controller.kubernetes.io/pod-deletion-cost**注解,则注解值较小的优先被剔除
3. 所处节点上副本个数较多的pod优先于所处节点上副本较少者被剔除
4. 如果Pod创建时间不同,最近创建的pod优先于早前创建的pod被剔除

### Service相关

#### Service是什么 

* pod每次重启,其IP地址都会变化,这使得pod间通信,或者外部通信变得困难,service提供一个访问pod的固定入口
* service的endpoint绑定了一组相同配置的pod,通过负载均衡的方式把请求分配到不同的pod上

#### Service负载均衡策略

* RoundRobin:默认轮询模式
* SessionAffinity:基于客户端ip地址进行会话保持

#### Service应用

* endpoint

  * 用来记录一个service对应的所有pod的访问地址,存储在etcd中,就是service关联的pod的ip地址和端口
  * service配置了selector,endpoint controller才会自动创建对应的endpoint对象,否则不会生产endpoint对象

* 没有selector的Service

  * 使用k8s集群外部的数据库
  * 希望服务执行另一个namespace中或其他集群中的服务
  * 正在将工作负载迁移到k8s集群

* ExternalName

  * 没有selector,也没有定义port和endpoint,对于运行在集群外的服务,通过返回该外部服务的别名这种方式来提供服务

  * ```
    kind: Service
    apiVersion: v1
    metadata:
      name: my-service
      namespace: prod
    spec:
      type: ExternalName
      externalName: my.database.example.com
      
    当请求my-service.prod.svc.cluster时,集群的DNS服务将返回一个my.database.example.com的CNAME记录
    ```

* Headless service

  * 不需要或不想要负载均衡,指定spec.ClusterIP: None来创建Headless Service
  * 对这类service不会分配ClusterIP,kube-proxy不会处理它们,不会为它们进行负载均衡和路由;DNS如何实现自动配置,依赖于Service是否定义了selector
  * 配置selector的,endpoint控制器在API中创建了endpoints记录,并且修改DNS配置返回A记录,通过这个地址直达后端Pod

* externalIPs

  * *my-service*可以在80.11.12.10:80上被客户端访问

  * ```
    kind: Service
    apiVersion: v1
    metadata:
      name: my-service
    spec:
      selector:
        app: MyApp
      ports:
        - name: http
          protocol: TCP
          port: 80
          targetPort: 9376
      externalIPs: 
        - 80.11.12.10
    ```

### Ingress

#### Ingress --(待完善)

* ingress和ingress controller结合实现了一个完整的ingress负载均衡器
* ingress controller基于ingress规则将客户端请求直接转发到service对应的后端endpoint上,从而跳过了kube-proxy的转发功能
* ingress controller+ingress规则--->service

#### nginx ingress的原理本质是什么*(原理还不知道)*

* ingress controller通过和api server交互,动态的去感知集群中ingress规则变化
* 然后按照自定义的规则,生成一段nginx配置
* 再写到nginx-ingress-controller的pod里,这个pod里运行着一个nginx服务,控制器会把生成的nginx配置写入/etc/nginx.conf中
* 然后reload一下使配置生效,以此达到域名分配和动态更新的问题

### 健康检查

#### 健康检查--资源探针:

* LivenessProbe:存活探针,失败的话杀掉pod,并根据容器的重启策略做出相应的处理

* ReadinessProbe:可读性探针,ready检测,失败的话从service的endpoint列表中删除pod的ip

* startupProbe:为了防止服务因初始化时间较长,被上面2种探针kill,用来定义初始化时间的

* 设置控制时间

  * initialDelaySeconds:初始第一次探测间隔时间,防止应用还没起来就被健康检查失败
  * periodSeconds:检查间隔,多久执行probe检查,默认10s
  * timeoutSeconds:检查超时时间,探测应用timeout后为失败
  * successThreshold:成功探测阈值,默认探测一次为健康正常

* 探测方法

  * ExecAction:在容器中执行一条命令,状态码为0则健康

  * TcpSocketAction:与容器的某个pod建立连接

  * HttpGetAction:通过向容器IP地址的某个指定端口的指定path发送GET请求,响应码为2xx或3xx即健康

* 探测结果:
  * Success:服务正常
  * Failure:探测到服务不正常
  * Unknown:通常是没有定义探针检测,默认成功

### 权限管理和安全

#### RBAC

* role定义在一个namespace中,clusterrole可以跨namespace
* rolebinding适用于某个namespace授权;clusterrolebinding适用于集群范围的授权

### 网络

#### kube-proxy iptables原理

* iptables模式下的kube-proxy不再起到Proxy的作用,作用是:通过API Server的Watch接口实时跟踪Service与Endpoint的变更信息,并更新到iptalbes规则,Client的请求流量通过iptables的NAT机制"直接路由"到目标pod

#### kube-proxy ipvs原理

* IPVS用于高性能负载均衡,使用更高效的Hash表,允许几乎无限的规模扩张,被kube-proxy采纳为最新模式
* IPVS使用iptables的扩展ipset,而不是直接调用iptables来生产规则链,iptable规则链是一个线性的数据结构,ipset是带索引的数据结构,因此当规则多时,可以高效的查找和匹配

#### ipvs为啥比iptables效率高

* IPVS和iptables同样基于Netfilter
* IPVS采用hash表;iptables采用一条条的规则列表
* iptables又是为防火墙设计的,集群数量越多,iptables规则就越多,而iptables的规则是从上到下匹配的,所以效率就越低
* 因此当service数量达到一定规模时,hash表的速度优势就显现出来了,从而提高了service的服务性能
* 优势:
  * 为大集群提供了更好的可扩展性和性能
  * 支持比iptables更复杂的负载均衡算法(最小负载,最少连接,加权等)
  * 支持服务器健康检查和连接重试等功能
  * 可以统统修改ipset的集合

#### calico和flannel的区别--(待完善)

* flannel:简单,使用居多,基于Vxlan技术(叠加网络+二层隧道),不支持网络策略
* Calico:较复杂,使用率低于flannel:也可以支持隧道网络,但是是三层隧道(IPIP),支持网络策略
* Calico项目既能够独立的为k8s集群提供网络解决方案和网络策略,也能与flannel结合在一起,由flannel提供网络解决方案,而calico仅用于提供网络策略

#### 不同node上的pod之间的通信流程*--(待完善)*

* pod的ip由flannel统一分配,通信也走flannal网桥
* 每个node上都有个flannal0虚拟网卡,用于跨node通信,
* 跨节点通信时,发送端数据会从docker0路由到flannel0虚拟网卡,接收到数据会从flannel0路由到docker0

#### k8s集群外流量怎么访问pod --(待完善)

* NodePort:会在所有节点上监听同一个端口,比如30000,访问节点的流量都会被重定向到对应的service上

#### 为什么NetworkPolicy不用限制serviceIP却又能生效？

* 防火墙策略重来不会遇到clusterIP,因为在到达防火墙策略前,clusterIP都已经被转成podIP了
  * 在pod中使用clusterIP访问另一个pod时，防火墙策略的应用是在所在主机的FORWARD点，而把clusterIP转成podIP是在之前的PREROUTING点就完成了
  * 在主机中使用clusterIP访问一个pod时，防火墙策略的应用是在主机的OUTPUT点，而把clusterIP转成podIP也是在OUTPUT点

### 存储

#### storageclass,pv,pvc

* PVC:定义一个持久化属性,比如存储的大小,读写权限等
* PV:具体的Volume
* storageclass:充当PV的模板,不用再手动创建PV了
* 流程:pod-->pvc-->storageclass(provisioner)-->pv,pvc绑定pv

#### PV的生命周期

* Available:可用状态,还未绑定PVC
* Bound:已绑定PVC
* Released:绑定的PVC已经删除,资源已释放,但还没被集群回收
* Failed:资源回收失败

#### k8s数据持久化

* EmptyDir:yaml没有指定要挂载宿主机的哪个目录,直接由pod内部映射到宿主机上.同个pod里的不同contianer共享同一个持久化目录,
* HostPath:将宿主机的目录挂载到容器内部,增加了pod与节点的耦合度
* PV

### Scheduler

* 调度算法
  * 预选:输入所有节点,输出满足预选条件的节点,过滤掉不符合的node.节点的资源不足或者不满足预选策略则无法通过预选
  * 优选:根据优先策略为通过预选的Node进行打分排名,选择得分最高的Node:例如:资源越服务员,负载越小的node可能具有越高的排名

### 工作原理

#### k8s集群节点需要关机维护,怎么操作

* pod驱逐:kubectl drain <node_name>
* 确认node上已无pod,并且被驱逐的pod已经正常运行在其他node上
* 关机维护
* 维护完成开机
* 解除node节点不可调度:kubectl uncordon node
* 使用节点标签测试node是否可以被正常调度

#### 更新策略

* Recreate Deployment:在创建出新的pod前杀掉所有已存在的pod

* Rolling Update Deployment:

  * MaxSurge:用来指定升级过程中可以超过期望pod数量的最大个数,可以是一个绝对值(5),或者Pod数量的百分比(10%),默认值是1;启动更新时,会立即扩容10%,待新Pod ready后,旧的pod缩容

  * MaxUnavailable:指定升级过程中不可用Pod的最大数量,可以是一个绝对值(5),或者Pod数量的百分比(10%),计算百分比的绝对值向下取整,为0时,默认为1;启动更新时,会先缩容到90%,新的Pod ready后,旧的副本再缩容,确保在升级时所有时刻可以用的Pod数量至少是90%



#### 常用的标签分类

* 版本类标签（release）：stable（稳定版）、canary（[金丝雀](https://www.zhihu.com/search?q=金丝雀&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2307372651})版本，可以将其称之为测试版中的测试版）、beta（测试版）；
* 环境类标签（environment）：dev（开发）、qa（测试）、production（生产）、op（运维）；
* 应用类（app）：ui、as、pc、sc；
* 架构类（tier）：frontend（前端）、backend（后端）、cache（缓存）；
* 分区标签（partition）：customerA（客户A）、customerB（客户B）；
* 品控级别（Track）：daily（每天）、weekly（每周）。

#### k8s是怎么进行注册的 --(待完善)

* pod启动后会加载当前环境所有service的信息,以便不同pod根据service名进行通信
* 服务发现是根据DNS服务实现的





### [灰度](https://cloud.tencent.com/document/product/457/48877)

#### Nginx ingress实现金丝雀发布

> 金丝雀发布场景主要取决于业务流量切分的策略,Ningx Ingress支持基于Header,Cookie,和服务权重3种流量切分的策略,都需要部署2个版本的service和deployment

##### 基于Header的流量切分

```
 # 仅将带有名为Region且值为cd或sz的请求头的请求转发给当前的Canary Ingress
 # curl -H "Host: canary.example.com" -H "Region: cd" http://EXTERNAL-IP
 annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "Region"
    nginx.ingress.kubernetes.io/canary-by-header-pattern: "cd|sz"
  name: nginx-canary
```

##### 基于Cookie的流量切分

```
 # 仅将带有名为"user_from_cd"的Cookie的请求转发给当前Canary Ingress
 # curl -s -H "Host: canary.example.com" --cookie "user_from_cd=always" http://EXTERNAL-IP
 annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-cookie: "user_from_cd"
```

##### 基于服务权重的流量切分

```
 # for i in {1..10}; do curl -H "Host: canary.example.com" http://EXTERNAL-IP; done;
 annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
```

#### 蓝绿发布和灰度发布

> 蓝绿发布:给2个集群的deployment设置不同的labels标签(version=v1 / version=v2),通过service选择对应的labels,切换流量到对应的集群
>
> 灰度发布:2个集群部署不同的deployment,service同时选中2个版本的deployment,然后通过控制deployment的副本数(类似副本多的权重就搞),来控制流量



### 常见的一些问题

#### 为什么Kubernetes放弃DNS轮询，而依赖代理模式将入站流量转发到后端呢

1. DNS不遵守记录TTL,在TTL值到期后,依然对结果进行缓存
2. 有些应用程序仅执行一次DNS查找,但是却会无限期的缓存结果
3. 即时应用和库进行了适当的重新解析,DNS记录上的TTL值低或为0也可能会给DNS带来高负载

### 容器化遇到的问题

#### Nginx

* keepalived字段未设置
* work对应的cpu设置有问题,资源隔离问题

#### uat环境资源配置问题:

* cmdb上配置的cpu:memory,有1:1,1:2,或者其他配置,而服务器购买的配置也混乱,集群资源使用不合理,cpu使用率已经90%,而内存还有20G左右

#### 服务无法及时下线:

* pod优雅关闭时调用prestop钩子,从注册中心及时下线
