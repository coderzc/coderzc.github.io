### 安装 etcd CRD 和 hugegraph-computer CRD

```bash
kubectl apply -f https://raw.githubusercontent.com/hugegraph/hugegraph-computer/master/computer-k8s-operator/manifest/etcd-operator-crd.v1beta1.yaml

kubectl apply -f https://raw.githubusercontent.com/hugegraph/hugegraph-computer/master/computer-k8s-operator/manifest/hugegraph-computer-crd.v1beta1.yaml
```

### 安装 operator (包括etcd-operator 和 hugegraph-computer-operator)

```bash
kubectl apply -f https://raw.githubusercontent.com/hugegraph/hugegraph-computer/master/computer-k8s-operator/manifest/hugegraph-computer-operator.yaml
```

### 等待 operator 部署完毕

```bash
kubectl get pod -n hugegraph-computer-operator-system

NAME                                                              READY   STATUS    RESTARTS   AGE
hugegraph-computer-operator-controller-manager-58c5545949-jqvzl   1/1     Running   0          15h
hugegraph-computer-operator-etcd-28lm67jxk5                       1/1     Running   0          15h
hugegraph-computer-operator-etcd-d42dwrq4ht                       1/1     Running   0          15h
hugegraph-computer-operator-etcd-mpcbt5kh2m                       1/1     Running   0          15h
hugegraph-computer-operator-etcd-operator-5597f97b4d-lxs98        1/1     Running   0          15h
```

### 提交任务

```yaml
cat <<EOF | kubectl apply --filename -
apiVersion: hugegraph.baidu.com/v1
kind: HugeGraphComputerJob
metadata:
  namespace: hugegraph-computer-system
  name: &jobName pagerank-test123
spec:
  jobId: *jobName
  algorithmName: PageRank
  image: hugegraph/hugegraph-computer-based-algorithm:latest # 算法镜像 url
  jarFile: /opt/jars/computer-algorithm-based.jar # 算法jar在镜像中的路径
  pullPolicy: Always
  workerInstances: 50
  computerConf:
    algorithm.params_class: com.baidu.hugegraph.computer.algorithm.rank.pagerank.PageRankParams
    hugegraph.url: http://${hugegraph-server-host}:${hugegraph-server-port} # hugegraph server url
    job.partitions_count: "50"
    hugegraph.name: "hugegraph"
EOF
```

### 查看任务

```bash
kubectl get hcjob -n hugegraph-computer-system
```

### 查看运行时日志

```bash
# 查看运行时 master 日志
kubectl logs -l component=pagerank-test123-master -n hugegraph-computer-system

# 查看运行时 worker 日志
kubectl logs -l component=pagerank-test123-worker -n hugegraph-computer-system
```

### 查看 任务失败时最后500 日志 (仅会保存1小时)

```bash
kubectl get event --field-selector reason=ComputerJobFailed --field-selector involvedObject.name=pagerank-test123 -n hugegraph-computer-system
```

### 查看任务成功事件 (仅会保存1小时)

```bash
kubectl get event --field-selector reason=ComputerJobSucceed --field-selector involvedObject.name=pagerank-test123 -n hugegraph-computer-system
```

### 生成 kubeconfig

```bash
USERNAME="hugegraph-computer-driver-test"
NAMESPACE="hugegraph-computer-system"
KUBESERVER="https://127.0.0.1:6443"

(umask 077; openssl genrsa -out ${USERNAME}.key 2048)
openssl req -new -key ${USERNAME}.key -out ${USERNAME}.csr -subj "/O=hugegraph/CN=${USERNAME}"
openssl x509 -req -in ${USERNAME}.csr -CA /etc/kubernetes/pki/ca.crt -CAkey /etc/kubernetes/pki/ca.key -CAcreateserial -out ${USERNAME}.crt -days 3650

kubectl config set-cluster kubernetes --certificate-authority=/etc/kubernetes/ssl/ca.pem --server=${KUBESERVER} --kubeconfig=kube.kubeconfig
kubectl config set-credentials ${USERNAME} --client-certificate=${USERNAME}.crt --client-key=${USERNAME}.key --embed-certs=true --kubeconfig=kube.kubeconfig
kubectl config set-context ${USERNAME}@kubernetes --cluster=kubernetes --user=${USERNAME} --kubeconfig=kube.kubeconfig
kubectl config use-context ${USERNAME}@kubernetes --kubeconfig=kube.kubeconfig

cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: ${NAMESPACE}
  name: hugegraph-computer-driver
rules:
  - apiGroups:
      - ""
    resources:
      - pods
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - ""
    resources:
      - pods/log
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - hugegraph.baidu.com
    resources:
      - hugegraphcomputerjobs
    verbs:
      - create
      - delete
      - get
      - list
      - patch
      - update
      - watch
  - apiGroups:
      - ""
    resources:
      - events
    verbs:
      - create
      - delete
      - get
      - list
      - patch
      - update
      - watch
  - apiGroups:
      - ""
    resources:
      - events/status
    verbs:
      - get
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: ${NAMESPACE}
  name: hugegraph-computer-driver-rolebinding
roleRef:
  kind: Role
  name: hugegraph-computer-driver
  apiGroup: ""
subjects:
  - kind: User
    name: ${USERNAME}
    apiGroup: ""
EOF
```

