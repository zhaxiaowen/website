# helm部署

#### helm安装jenkins

```
helm search repo jenkins
helm pull bitnami/jenkins
vim values.yaml
存储方式:storageClass: "course-nfs-storage"
暴露端口:修改nodePorts参数
helm install jenkins
```

