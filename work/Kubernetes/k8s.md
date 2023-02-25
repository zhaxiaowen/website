# k8s 

#### k8s中的资源对象

* apiVersion:创建该对象所使用的kubernetes API版本
* kind:想要创建的对象类型
* metadata:帮助识别对象唯一性的数据,包括`name` `UID` `namespace`字段

* `spec`字段:必须提供,用来描述该对象的期望状态,以及关于对象的基本信息 

* Annotation:可以将kubernetes资源对象关联到任意的非标识性元数据


#### metadata.label和template.metadata.label:

* metadata.label是作用在kind对象上的,比如说deployment,那这个标签是打在deployment上的
* template.metadata.label是打在pod上的,

### 一. service

> 为什么service ip不能ping?

* 来源:
  * serviceIP是serviceController生成的,参数--service-cluster-ip-range string 会配置在controller-manager上,serviceController会在这个参数指定的cidr范围内取一个ip
* 原因:
  * serviceIP是虚拟的地址,没有分配给任何网络接口,当数据包传输时不会把这个IP作为数据包的源IP和目的IP
  * kube-proxy在iptables模式下,这个IP没有被设置在任何的网络设备上,ping这个IP的时候,没有任何的网络协议栈会回应这个IP
  * 在iptables模式时,clusterIP会在iptables的PREROUTING链里面用于nat转换规则中,而在ipvs模式下,会使用ipvs模式的ipvs规则转换中
  * 在ipvs模式下,所有的clusterIP会被设置在node上的kube-ipvs0的虚拟网卡上,所以是ping通

1. endpoint

   * 用来记录一个service对应的所有pod的访问地址,存储在etcd中,就是service关联的pod的ip地址和端口
   * service配置了selector,endpoint controller才会自动创建对应的endpoint对象,否则不会生成endpoint对象

2. 没有selector的Service

   * 使用k8s集群外部的数据库
   * 希望服务执行另一个namespace中或其他集群中的服务
   * 正在将工作负载迁移到k8s集群

3. ExternalName

   * 没有selector,也没有定义port和endpoint,对于运行在集群外的服务,通过返回该外部服务的别名这种方式来提供服务

     ```
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

4. Headless service

   * 不需要或不想要负载均衡,指定spec.ClusterIP: None来创建Headless Service
   * 对这类service不会分配ClusterIP,kube-proxy不会处理它们,不会为它们进行负载均衡和路由;DNS如何实现自动配置,依赖于Service是否定义了selector
   * 配置selector的,endpoint控制器在API中创建了endpoints记录,并且修改DNS配置返回A记录,通过这个地址直达后端Pod

5. externalIPs

   * *my-service*可以在80.11.12.10:80上被客户端访问

     ```
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

### [二. configMap使用](https://www.bbsmax.com/A/kvJ3NoVwzg/)

1. items字段使用:

* 不想以key名作为配置文件名可以引入​​items​​​ 字段，在其中逐个指定要用相对路径​​path​​替换的key
* 只有items下的key对应的文件会被挂载到容器中

```
  volumes:
    - name: config-volume
      configMap:
        name: cm-demo1
        items:
        - key: mysql.conf
          path: path/to/msyql.conf
```

2. valueFrom:映射一个key值,与configMapKeyRef搭配使用
3. envFrom:把ConfigMap的所有键值对都映射到Pod的环境变量中去,与configMapRef搭配使用

### [三. HPA](https://zhuanlan.zhihu.com/p/368865741)

* autoscaling/v1:只支持CPU一个指标的弹性伸缩
* autoscaling/v2beta1:支持自定义指标
* autoscaling/v2beat2:支持外部指标

1. metrics指标
   * averageUtilization:当整体资源超过这个百分比,会扩容
   * averageValue:指标的平均值超过这个值,扩容
   * Value:当指标的值超过这个value时,扩容
2. HPA算法
   * 期望副本数=当前副本数 * (当前指标 / 期望指标)
   * 当前指标200m,目标设定100m,200/100=2,副本数翻倍
   * 当前指标50m,目标设定100m,50/100=0.5,副本数减半
   * 如果比例接近1.0(根据--horizontal-pod-autoscaler-tolerance参数全局配置的容忍值,默认0.1),不扩容

2. 冷却/延迟支持
   * 防抖动功能
   * --horizontal-pod-autoscaler-downscale-stabilization:设置缩容冷却时间窗口长度.水平pod扩缩容能够记住过去建议的负载规模,并仅对此事件窗口内的最大规模执行操作.默认5min
3. 扩所策略:平滑的操作
   * behavior字段可以指定一个或多个扩缩策略

4. HPA存在的问题:基于指标的弹性有滞后效应,因为弹性控制器操作的链路过长
   * 应用指标数据已经超出阈值
   * HPA定期执行指标收集滞后效应
   * HPA控制Deployment进行扩容的时间
   * Pod调度,运行时启动挂载存储和网络的时间
   * 应用启动到服务就绪的时间
   * 很可能在突发流量出现时,还没完成弹性扩容,既有的服务实例已经被流量击垮

```
apiVersion: autoscaling/v2beta2
  kind: HorizontalPodAutoscaler
  metadata:
    name: web
    namespace: default
  spec:
    behavior: 
      scaleDown:   # 缩容速度策略
        policies: 
          periodSeconds:  15  # 每15s最多缩减currentReplicas * 100%个副本
          type: Percent
          value: 100
        stabilizationWindowSeconds: 300  # 且缩容后的最终副本不得低于过去300s内计算的历史副本数的最大值
      scaleUp: 	# 扩容速度策略
        policies:
        - type: Percent # 每15s翻倍
          value: 100
          periodSeconds: 15
        - type: Pods	# 每15s新增4个副本
          value: 4
          periodSeconds: 15
        selectPolicy: Max   # 上面2种情况取最大值:max(2* currentReplicas,4)
        stabilizationWindowSeconds: 0
    maxReplicas: 10   # 最大多少副本
    minReplicas: 1		# 最少副本数
    scaleTargetRef: 	# 需要动态伸缩的目标
      apiVersion: apps/v1
      kind: Deployment
      name: d1
    metrics: 
    - type: Resource 
      resource:  #伸缩对象Pod的指标.target.type只支持Utilization和AveragevALUE类型
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
    - type: ContainerResource
      containerResource:	# 伸缩对象下的container的cpu和memory指标,只支持Utilization和AverageValue
        container: C1
        name: memory
        target:
          type: AverageValue
          averageValue: 300Mi
    - type: Pods
      pods:		# 指的是伸缩对象pod的指标,数据需要第三方的adapter指标,只允许AverageValue类型的阈值
        metric:
          name: Pods_second 
          selector: 
          - matchExpressions: 
            - key: zone
              operator: In
              values: 
              - foo
              - bar
        target:
          type: AverageValue
          averageValue: 1k
    - type: External
      external:	# k8s外部的指标,第三方adapter提供,只支持value和AverageValue类型的阈值
        metric:
          name: External_second
          selector: "queue=worker_tasks"
        target:
          type: Value
          value: 20
    - type: Object
      object:
        describedObject:
          apiVersion: networking.k8s.io/v1beta1
          kind: Ingress
          name: main-route
        metric:
          name: ingress_test
        target:
          type: Value
          value: 2k
```

### 四. VPA

* 纵向扩容pod,但是要重建pod
* 社区有说法是可以修改requests,但是一直没合进去

### 五.网络原理

#### [docker](https://blog.csdn.net/qq_41688840/article/details/108708415)

* 默认bridge桥接网络: docker自身生产一个veth pair(虚拟网卡对)一端放在docker0网桥上,一端放在容器内部
* 共享宿主机Host的网络: 容器直接使用宿主机的的网络栈以及端口port范围
* container共享模式: 指定容器与另外某个已存在的容器共享它的网络.k8s里的pause容器,其他容器通过共享pause容器的网络栈,实现与外部Pod进行通信,通过localhost进行Pod内部的container的通信
* none模式: 此模式只给容器分配隔离的network namespace,不会分配网卡,ip地址等.k8s网络插件是基于此做的网络分配,插件分配ip地址、网卡给pause容器

#### 总结

* k8s网络插件负责管理ip地址分配以及veth pair(虚拟网卡对)以及网桥连接工作,pause容器采用docker的none网络模式,网络插件再将ip和veth虚拟网卡分配给pod的pause容器,其他的容器再采用共享container的网络模式来共享这个pause的网络即可与外界进行通信

#### [pod内部的容器如何通信](https://blog.csdn.net/weixin_41947378/article/details/110749413?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166065926816780366590319%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=166065926816780366590319&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~first_rank_ecpm_v1~rank_v31_ecpm-8-110749413-null-null.nonecase&utm_term=k8s&spm=1018.2226.3001.4450)

#### 同节点的pod是如何通信的

* pod通过pause容器的veth连接到宿主机的docker0虚拟网桥上,同节点的pod就是通过docker0这个虚拟网桥通信的
* flannel插件有2种网卡,**cni0** 负责本节点的,**flannel.1**负责跨节点

#### 不同节点的pod是如何通信的

* pod的ip由flannel统一分配,通信也走flannal网桥
* 每个node上都有个flannal0虚拟网卡,用于跨node通信,
* 跨节点通信时,发送端数据会从docker0路由到flannel0虚拟网卡,接收到数据会从flannel0路由到docker0

##### 路由路径

1. Kubectl get pod -n monitor -o wide :查看两个通信的Pod的ip
2. **netstat -rn** 查看路由表
3. node间通信是通过flannel网桥处理的,flannel会在etcd中查找pod所在Node节点的ip
4. 目的节点的flannel收到数据包后,去除flanneld加上的头部,将原始的数据包发送到宿主机的网络栈
5. **route -n**,根据路由表将包转发给docker0网桥上,docker0网桥再将数据包转给对应pod

#### pod如何对外提供服务

* 将物理机的端口和pod做映射,访问物理机的ip+端口,转发到pod,可以使用iptabels的配置规则实现数据包转发

* 共享pause容器的网络栈,通过veth0虚拟网卡通信,直接通过localhost相互访问

#### 为什么NetworkPolicy不用限制serviceIP却又能生效？

* 防火墙策略重来不会遇到clusterIP,因为在到达防火墙策略前,clusterIP都已经被转成podIP了
  * 在pod中使用clusterIP访问另一个pod时，防火墙策略的应用是在所在主机的FORWARD点，而把clusterIP转成podIP是在之前的PREROUTING点就完成了
  * 在主机中使用clusterIP访问一个pod时，防火墙策略的应用是在主机的OUTPUT点，而把clusterIP转成podIP也是在OUTPUT点

#### 误解

1. 相对于直接访问podIP，使用clusterIP来访问因为多一次转发，会慢一些；
   - 其实只是在发送的过程中修改了数据包的目标地址，两者走的转发路径是一模一样的，没有因为使用clusterIP而多一跳，当然因为要做nat会有一些些影响，但影响不大
2. 使用nodeport因为比clusterIP又多一次转发，所以更慢；
   - 没有，nodeport是一次直接就转成了podIP，并没有先转成clusterIP再转成podIP。



#### DNS解析方式

```
servicename.namespace.svc.cluster.local
```

#### Pod名称格式

```
${deployment-name}-${template-hash}-${random-suffix}
```

#### StatefulSet

* StatefulSet中每个Pod的DNS格式为`statefulSetName-{0..N-1}.serviceName.namespace.svc.cluster.local`
* 例:kubectl exec redis-cluster-0 -n wiseco -- hostname -f  # 查看pod的dns 



### [k8s部署应用,故障排查思路](https://www.cnblogs.com/rancherlabs/p/12330916.html)

[k8s故障诊断流程](https://cloud.tencent.com/developer/article/1899950)

1. Deploymenr:创建名为Pods的应用程序副本的方法
2. Service:内部负载局衡器,将流量路由到Pods
3. Ingress:将流量从集群外部流向Service

#### 故障排查思路

> Pod是否正在运行
>
> Service是否将流量路由到Pod
>
> 检查Ingress是否正确配置

#### 0.退出状态码

> kubectl describe pod  ;查看State字段,ExitCode即程序退出的状态码,正常退出为0

* 退出状态码必须在0-255之间
* 外界中断将程序退出的时候状态码在129-255区间(操作系统给程序发送中断信号,例:kill-9等)
* 程序自身原因导致的异常退出,状态码在1-128区间

#### 1.常见Pod错误

> 启动错误

```
ImagePullBackoff
ImageInspectError
ErrImagePull
ErrImageNeverPull
RegistryUnavailable
InvalidImageName
```

> 运行错误

```
CrashLoopBackOff: 可能是应用程序存在错误,导致无法启动;错误配置了容器;liveness探针失败次数太多
RunContainerError
KillContainerError
VerifyNonRootError
RunInitContainerError: 通常是错误配置导致,比如安装一个不存在的volume;将只读volume安装为可读写
CreatePodSandboxError
ConfigPodSandboxError
KillPodSandboxError
SetupNetworkError
TeardownNetworkErro
```

* 例:CrashLoopBackOff
  1. 获取describe pod,主要看event事件:`kubectl describe pod es-0 -n logging` 
  2. 观察pod日志:`kubectl logs es-0 -n logging`
  3. 查看liveness探针,可能是pod因`liveness`探测器未返回成功而崩溃,再看`describe pod `

#### 2.排查Service故障

1. 主要查看service是否与pod绑定:` kubectl describe svc redis-exporter -n wiseco|grep "Endpoints" `
2. 测试端口:`kubectl port-forward es-0 9200:9200 -n logging`

#### 3.k8s - Annotations

##### TODO:可以只在service上加,因为service-endpoints最终也会落到pod上

>  kubernetes-pods

* prometheus.io/scrape，为true则会将pod作为监控目标
* prometheus.io/path，默认为/metrics
* prometheus.io/port , 端口

> kubernetes-service-endpoints

- prometheus.io/scrape，为true则会将pod作为监控目标
- prometheus.io/path，默认为/metrics
- prometheus.io/port , 端口
- prometheus.io/scheme 默认http，如果为了安全设置了https，此处需要改为https

#### 4.抓包方法

> https://zhuanlan.zhihu.com/p/372567807
>
> https://blog.csdn.net/chongdang2813/article/details/100863010

### [容器中获取Pod信息](https://blog.csdn.net/lsx_3/article/details/124399768)(https://www.cnblogs.com/cocowool/p/kubernetes_get_metadata.html)

* 环境变量:将pod或容器信息设置为容器的环境变量
* volume挂载:将pod或容器信息以文件的形式挂载到容器内部

```
通过fieldRef设定的元数据如下:
metadata.name：Pod名称
metadata.namespace： Pod所在的命名空间名称
metadata.uid：Pod的UID （Kubernetes 1.8.0 +）
metadata.labels[‘<KEY>’]：Pod某个Label的值，通过KEY进行引用
metadata.annotations[‘<KEY>’]：Pod某个Annotation的值，通过KEY进行引用

Pod元数据信息可以设置为容器内的环境变量:
status.podIP：Pod的IP地址
spec.serviceAccountName：Pod使用的ServiceAccount名称
spec.nodeName：Pod所在Node的名称 （Kubernetes 1.4.0 +）
status.hostIP：Pod所在Node的IP地址 （Kubernetes 1.7.0 +）

```

### 调度策略

* Predicate算法:筛选符合条件的node

| GeneralPredicates           | 包含3项基本检查:节点,端口,规则                               |
| --------------------------- | ------------------------------------------------------------ |
| **NoDiskConflict**          | 检查Node是否可以满足Pod对硬盘的需求                          |
| **NoVolumeZoneConflict**    | 单集群跨AZ部署时，检查node所在的zone是否能满足Pod对硬盘的需求 |
| **PodToleratesNodeTaints**  | 检查Pod是否能够容忍node上所有的taints                        |
| **CheckNodeMemoryPressure** | 当Pod QoS为besteffort时，检查node剩余内存量，排除内存压力过大的node |
| **MatchInterPodAffinity**   | 检查node是否满足pod的亲和性、反亲和性需求                    |

* Priority算法:给剩余的node评分,挑选最优的节点

| **LeastRequestedPriority**     | 按node计算资源(CPU/MEM)剩余量排序，挑选最空闲的node          |
| ------------------------------ | ------------------------------------------------------------ |
| **BalancedResourceAllocation** | 补充LeastRequestedPriority，在cpu和mem的剩余量取平衡         |
| SelectorSpreadPriority         | 同一个Service/RC下的Pod尽可能的分散在集群中。Node上运行的同个Service/RC下的Pod数目越少，分数越高。 |
| **NodeAffinityPriority**       | 按soft(preferred) NodeAffinity规则匹配情况排序，规则命中越多，分数越高 |
| **TaintTolerationPriority**    | 按pod tolerations与node taints的匹配情况排序，越多的taints不匹配，分数越低 |
| **InterPodAffinityPriority**   | 按soft(preferred) Pod Affinity/Anti-Affinity规则匹配情况排序，规则命中越多，分数越高 |



#### 限流:[NetworkPolicy网络插件](https://blog.csdn.net/xixihahalelehehe/article/details/108422856)

* 基于源IP的访问控制:
  * 限制Pod的进/出流量
  * 白名单
* Pod网络隔离的一层抽象
  * lable selector
  * namespace selector
  * port
  * CIDR
