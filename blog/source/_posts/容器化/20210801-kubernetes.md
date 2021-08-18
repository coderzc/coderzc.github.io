## 1. kubernetes 起源与发展

![20210512181906](https://gitee.com/coderzc/blogimage/raw/master/20210513152302.png)

### 1.1 kubernetes 起源

- Kubernetes最初源于谷歌内部的Borg，Kubernetes 的最初目标是为应用的容器化编排部署提供一个最小化的平台，包含几个基本功能：
  1. 将应用水平扩容到多个集群
  2. 为扩容的实例提供负载均衡的策略
  3. 提供基本的健康检查和自愈能力
  4. 实现任务的统一调度

### 1.2 kubernetes 发展

- 2014年6月 谷歌云计算专家Eric Brewer在旧金山的发布会为这款新的开源工具揭牌。
- 2015年7月22日K8S迭代到 v1.0并在OSCON大会上正式对外公布。
- 为了建立容器编排领域的标准和规范，Google、RedHat 等开源基础设施领域玩家们，在 2015 年共同牵头发起了名为 CNCF（Cloud Native Computing Foundation）的基金会。Kubernetes 成为 CNCF 最核心的项目。发起成员：AT&T, Box, Cisco, Cloud Foundry Foundation, CoreOS, Cycle Computing, Docker, eBay, Goldman Sachs, Google, Huawei, IBM, Intel, Joyent, Kismatic, Mesosphere, Red Hat, Switch SUPERNAP, Twitter, Univa, VMware and Weaveworks。
- 2018年，超过 1700 开发者成为 Kubernetes 项目社区贡献者，全球有 500 多场沙龙。国内出现大量基于 Kubernetes 的创业公司。
- 2020 年，Kubernetes 项目已经成为贡献者仅次于 Linux 项目的第二大开源项目。成为了业界容器编排的事实标准，各大厂商纷纷宣布支持 Kubernetes 作为容器编排的方案。

## 2. 为什么需要kubernetes

### 2.1 传统的容器编排痛点

容器技术虽然解决了应用和基础设施异构的问题，让应用可以做到一次构建，多次部署，但在复杂的微服务场景，单靠 Docker 技术还不够，它仍然有以下问题没有解决：

- 集成和编排微服务模块
- 提供按需自动扩容，缩容能力
- 故障自愈
- 集群内的通信

### 2.2 Kubernetes 能解决的问题

- 按需的垂直扩容，新的服务器(node)能够轻易的增加或删除
- 按需的水平扩容，容器实例能够轻松扩容，缩容
- 副本控制器，你不用担心副本的状态
- 服务发现和路由
- 自动部署和回滚，如果应用状态错误，可以实现自动回滚

### 2.3 什么时候使用 Kubernetes？

- 当你的应用是微服务架构
- 开发者需要快速部署自己的新功能到测试环境进行验证
- 降低硬件资源成本，提高使用率

### 2.4 什么时候不适合使用 Kubernetes

- 应用是轻量级的单体应用，没有高并发的需求
- 团队文化不适应变革

## 3. Kubernetes 架构与核心概念

![Components of Kubernetes](https://gitee.com/coderzc/blogimage/raw/master/20210513152213.svg)

### 3.1 主控制节点组件

主控制节点组件对集群做出全局决策(比如调度)，以及检测和响应集群事件（例如，当不满足部署的 replicas 字段时，启动新的 pod）。

主控制节点组件可以在集群中的任何节点上运行。 然而，为了简单起见，设置脚本通常会在同一个计算机上启动所有主控制节点组件，并且不会在此计算机上运行用户容器。

- apiserver
  主节点上负责提供 Kubernetes API 服务的组件；它是 Kubernetes 控制面的前端组件。
- etcd
  etcd 是兼具一致性和高可用性的键值数据库，可以作为保存 Kubernetes 所有集群数据的后台数据库。

- kube-scheduler
  主节点上的组件，该组件监视那些新创建的未指定运行节点的 Pod，并选择节点让 Pod 在上面运行。
  调度决策考虑的因素包括单个 Pod 和 Pod 集合的资源需求、硬件/软件/策略约束、亲和性和反亲和性规范、数据位置、工作负载间的干扰和最后时限。
- kube-controller-manager
  在主节点上运行控制器的组件。
  从逻辑上讲，每个控制器都是一个单独的进程，但是为了降低复杂性，它们都被编译到同一个可执行文件，并在一个进程中运行。这些控制器包括:
      1. 节点控制器（Node Controller）: 负责在节点出现故障时进行通知和响应。
      2. 副本控制器（Replication Controller）: 负责为系统中的每个副本控制器对象维护正确数量的 Pod。
      3. 终端控制器（Endpoints Controller）: 填充终端(Endpoints)对象(即加入 Service 与 Pod)。
      4. 服务帐户和令牌控制器（Service Account & Token Controllers），为新的命名空间创建默认帐户和 API 访问令牌.

### 3.2 从节点组件

节点组件在每个节点上运行，维护运行的 Pod 并提供 Kubernetes 运行环境。

- kubelet 
  一个在集群中每个节点上运行的代理。它保证容器都运行在 Pod 中。kubelet 接收一组通过各类机制提供给它的 PodSpecs，确保这些 PodSpecs 中描述的容器处于运行状态且健康。kubelet 不会管理不是由 Kubernetes 创建的容器。
- kube-proxy
  kube-proxy 是集群中每个节点上运行的网络代理,实现 Kubernetes Service 概念的一部分。
  kube-proxy 维护节点上的网络规则。这些网络规则允许从集群内部或外部的网络会话与 Pod 进行网络通信。
- 容器运行时（Container Runtime）
  容器运行环境是负责运行容器的软件。
  Kubernetes 支持多个容器运行环境: Docker、 containerd、cri-o、 rktlet 以及任何实现 Kubernetes CRI (容器运行环境接口)。

### 3.3 插件（Addons）

- Kubeadm 

  Kubeadm 是Kubernetes的自动化部署工具，降低了部署难度，提高效率。

- Kubectl 

  Kubectl 是Kubernetes集群管理工具相当于客户端。

- DNS
  尽管其他插件都并非严格意义上的必需组件，但几乎所有 Kubernetes 集群都应该有集群 DNS， 因为很多示例都需要 DNS 服务。

- Web 界面（仪表盘）
  Dashboard 是K ubernetes 集群的通用的、基于 Web 的用户界面。 它使用户可以管理集群中运行的应用程序以及集群本身并进行故障排除。

- 容器资源监控
  容器资源监控 将关于容器的一些常见的时间序列度量值保存到一个集中的数据库中，并提供用于浏览这些数据的界面。

- 集群层面日志
  集群层面日志 机制负责将容器的日志数据 保存到一个集中的日志存储中，该存储能够提供搜索和浏览接口。

## 4. 初始化基础环境

```shell
# 下载yum 源
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

# 清除缓存
yum clean all

# 安装基本软件包
yum install wget net‐tools vim bash‐comp* ‐y

#配置 K8S的阿里云yum源
cat >>/etc/yum.repos.d/kubernetes.repo <<EOF
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

# 配置 Docker yum源
wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo

# 清除缓存
yum clean all

# 设置hosts
vim /etc/hosts
 192.168.99.101 master
 192.168.99.102 node1
 192.168.99.103 node2

# 关闭防火墙
systemctl stop firewalld
systemctl disable firewalld

# 关闭 SeLinux
setenforce 0
sed -i "s/SELINUX=enforcing/SELINUX=disabled/g" /etc/selinux/config

# 关闭 swap
swapoff -a
yes | cp /etc/fstab /etc/fstab_bak
cat /etc/fstab_bak |grep -v swap > /etc/fstab

# 将桥接的IPv4流量传递到iptables的链
modprobe br_netfilter
echo "1" >/proc/sys/net/bridge/bridge-nf-call-iptables
vi /etc/sysctl.d/k8s.conf 
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1

# 安装并启动 docker
yum install -y docker-ce.x86_64 docker-ce-cli.x86_64 containerd.io.x86_64

# 更换 docker 镜像源
mkdir /etc/docker

cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": ["https://registry.cn-hangzhou.aliyuncs.com"],
  "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF

# 重启docker
systemctl daemon-reload
# 开机自启
systemctl enable docker 
systemctl restart docker

# 如果报网络错误可能是没有成功建立docker网卡，可以手动创建
`failed to start daemon: Error initializing network controller: list bridge addresses failed: PredefinedLocalScopeDefaultNetworks List:`
ip link add name docker0 type bridge
ip addr add dev docker0 172.1.0.1/16

# 安装kubelet、kubeadm、kubectl
yum install -y kubelet-1.15.10 kubeadm-1.15.10 kubectl-1.15.10

# 启动 kubelet
systemctl enable kubelet && systemctl start kubelet
```

## 5. 初始化 Master

```shell
# 初始化K8s主节点
kubeadm init --kubernetes-version=1.15.10 \
--apiserver-advertise-address=${master_ip} \
--image-repository registry.aliyuncs.com/google_containers \
--service-cidr=10.1.0.0/16 \
--pod-network-cidr=10.244.0.0/16

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 安装网络插件 Flannel
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

# 查看K8s状态
kubectl get node
	NAME     STATUS   ROLES    AGE   VERSION
	master   Ready    master   14m   v1.15.10
	
# 故障排查 ！！！
# kubelet 启动失败 报错：Failed to start ContainerManager failed to get rootfs info: unable to find data in memory cache
vim /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf 添加下面环境变量
Environment="KUBELET_CONFIG_ARGS=--config=/var/lib/kubelet/config.yaml --feature-gates=\"LocalStorageCapacityIsolation=false,SupportNodePidsLimit=false,SupportPodPidsLimit=false\""

# Failed to update stats for container "/kubepods.slice/kubepods-burstable.slice": failure - /sys/fs/cgroup/cpuacct/kubepods.slice/kubepods-burstable.slice/cpuacct.stat
cat >/etc/systemd/system/kubelet.service.d/11-cgroups.conf<<EOF
[Service]
CPUAccounting=true
MemoryAccounting=true
EOF

并在刚才那个环境变量上追加参数：
Environment="KUBELET_CONFIG_ARGS=--runtime-cgroups=/systemd/system.slice --kubelet-cgroups=/systemd/system.slice"

# 然后重启 kubelet
systemctl daemon-reload && systemctl restart kubelet
```

## 6. 初始化 WorkerNode

```shell
# 拷贝 admin.conf 到 wokerNode
scp /etc/kubernetes/admin.conf root@node1:/etc/kubernetes/

# 配置 Kubeconfig 环境变量
echo "export KUBECONFIG=/etc/kubernetes/admin.conf" >> ~/.bash_profile
source ~/.bash_profile

# 如果是克隆的 master 机器, 需要清理 master 环境网络
kubeadm reset
systemctl stop kubelet
systemctl stop docker
rm -rf /var/lib/cni/
rm -rf /var/lib/kubelet/*
rm -rf /var/cni/
ifconfig cni0 down
ifconfig flannel.1 down
ifconfig docker0 down
ip link delete cni0
ip link delete flannel.1
systemctl start docker
systemctl start kubelet

# 否则安装 Flannel 网络插件
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

# 将master节点下面 /etc/cni/net.d/下面的所有文件拷贝到node节点上
mkdir -p /etc/cni/net.d/
# 在 master
scp /etc/cni/net.d/* root@${node_ip}:/etc/cni/net.d/

# 在 master 生成token
kubeadm token create --print-join-command
> kubeadm join ${master_ip}:6443 --token 56peeh.gx8l6z1vwo04usrb     --discovery-token-ca-cert-hash sha256:3ba111312aee9e77ca7939f8336db665b01ea3f457bee501117810b2d8ccfe3c

# 在wokerNode上执行这个join
kubeadm join ${master_ip}:6443 --token 56peeh.gx8l6z1vwo04usrb     --discovery-token-ca-cert-hash sha256:3ba111312aee9e77ca7939f8336db665b01ea3f457bee501117810b2d8ccfe3c

# 查看集群状态
kubectl get nodes
	NAME     STATUS   ROLES    AGE     VERSION
	master   Ready    master   15m     v1.15.10
	node1    Ready    <none>   9m41s   v1.15.10
```

## 7. 安装 *Kubernetes Dashboard*

```shell
# 安装 Kubernetes Dashboard 根据 CRD，使用http免密登录
kubectl apply -f https://github.com/coderzc/coderzc.github.io/tree/master/blog/%E5%AE%B9%E5%99%A8%E5%8C%96/recommended.yaml

# 显示 admin 的 token
kubectl -n kube-system describe $(kubectl -n kube-system get secret -n kube-system -o name | grep namespace) | grep token
```

## 8. Pod 

*Pod* 是可以在 Kubernetes 中创建和管理的、最小的可部署的计算单元。

*Pod* （就像在鲸鱼荚或者豌豆荚中）是一组（一个或多个） [容器](https://kubernetes.io/zh/docs/concepts/overview/what-is-kubernetes/#why-containers)； 这些容器共享存储、网络、以及怎样运行这些容器的声明。 Pod 中的内容总是并置（colocated）的并且一同调度，在共享的上下文中运行。 Pod 所建模的是特定于应用的“逻辑主机”，其中包含一个或多个应用容器， 这些容器是相对紧密的耦合在一起的。 在非云环境中，在相同的物理机或虚拟机上运行的应用类似于 在同一逻辑主机上运行的云应用。

除了应用容器，Pod 还可以包含在 Pod 启动期间运行的 [Init 容器](https://kubernetes.io/zh/docs/concepts/workloads/pods/init-containers/)。 你也可以在集群中支持[临时性容器](https://kubernetes.io/zh/docs/concepts/workloads/pods/ephemeral-containers/) 的情况下，为调试的目的注入临时性容器。

详细介绍：https://kubernetes.io/zh/docs/concepts/workloads/pods

