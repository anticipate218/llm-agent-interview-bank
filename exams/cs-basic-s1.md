# 编程与计算机基础 · 模拟笔试卷

> 满分 110 分　｜　建议用时 90 分钟　｜　随机种子 1　｜　答案见同目录 `cs-basic-s1-answers.md`

## 一、单选题（每题 2 分，共 30 分）

**1.** 关系型数据库（如 MySQL InnoDB）的索引普遍采用 B+ 树，而不是二叉搜索树、哈希表或 B 树。下列解释中最准确的是：

- A. B+ 树的查找时间复杂度是 O(1)，比二叉搜索树的 O(log n) 更快，所以被普遍采用
- B. B+ 树把数据同时存放在内部节点和叶子节点，查询可以在内部节点提前结束，所以比 B 树更快
- C. B+ 树扇出大、树很矮，查找只需访问少量页；数据都在叶子层且叶子相连，适合范围查询
- D. 哈希索引同样能高效支持等值查询和范围查询，B+ 树被普遍采用只是因为实现更简单、更成熟

**2.** 推理集群内部用 gRPC 把生成的 token 从推理服务推给网关：网关发出一次请求，推理服务持续返回多条消息，直到生成结束。这种调用方式对应 gRPC 的：

- A. 一元调用（unary RPC）
- B. 客户端流式调用（client streaming RPC）
- C. 服务端流式调用（server streaming RPC）
- D. 双向流式调用（bidirectional streaming RPC）

**3.** Linux 容器的两大基础机制中，namespace 和 cgroups 分别负责：

- A. namespace 隔离进程能「看到」什么（进程号、网络、挂载点等）；cgroups 限制并统计能「用」多少资源（CPU、内存、IO 等）
- B. namespace 限制资源用量（CPU、内存），cgroups 隔离进程看到的视图（进程号、网络、挂载点）
- C. namespace 负责镜像的分层存储（把只读层与可写层叠加成根文件系统），cgroups 负责容器之间的网络转发与端口映射
- D. namespace 让每个容器运行在独立的内核实例上，cgroups 负责对容器内的数据做加密，并审计每个进程的访问记录

**4.** 关于 CPython 的内存回收机制，下列说法正确的是：

- A. 执行 `del x` 会立即释放 x 所指对象的内存，无论是否还有其他名字或容器引用这个对象
- B. 对象之间一旦形成循环引用就永远不会被回收，只能由程序员手动打破循环，否则必然内存泄漏
- C. 引用计数降为 0 时立即回收；处理不了的循环引用，由分代的循环垃圾回收器定期检测并回收
- D. 调用 `gc.collect()` 会回收所有占用内存较大的对象，包括那些仍被变量引用着的对象

**5.** 5 节点的 Raft 集群（S1～S5），S1 是任期 3 的 Leader。网络分区把集群分成 {S1, S2} 和 {S3, S4, S5} 两部分，客户端仍不断向 S1 发送写请求。下列描述正确的是：

- A. {S3, S4, S5} 一侧会以更高的任期（如 4）选出新 Leader 并继续提交；S1 的新写入凑不够多数派，无法提交，分区恢复后 S1 退位，这些日志被覆盖
- B. S1 仍是合法的 Leader，在本侧继续接收并提交新的写入；S3～S5 会一直等待 S1 的心跳，不发起选举；分区恢复后，两侧的日志按任期大小合并
- C. 两侧都会选出 Leader：S1 继续担任任期 3 的 Leader，{S3, S4, S5} 选出任期 4 的 Leader，两边各自提交写入，形成脑裂，分区恢复后需要人工合并数据
- D. 任何一侧都凑不齐全部 5 个节点，整个集群停止接受写入，直到分区恢复后由任期最大的节点继续担任 Leader

**6.** 微调一个预训练模型时，只想训练新加的分类头 `model.head`，冻结骨干网络 `model.backbone`。下列做法中**既正确、又能节省计算与显存**的是：

- A. 对骨干调用 `model.backbone.eval()`，eval 模式会关闭这部分参数的梯度计算
- B. 骨干参数的 requires_grad 保持为 True，只把 head 的参数交给优化器，并在每次 step 后把骨干的 `.grad` 清零
- C. 对骨干的参数调用 `requires_grad_(False)`，只把仍需要梯度的参数交给优化器
- D. 把整个前向计算（骨干和分类头）都包在 `torch.no_grad()` 中，这样骨干不会算梯度，分类头的梯度仍会正常计算

**7.** 协程之间切换的开销远小于线程切换，最主要的原因是：

- A. 切换在用户态由程序主动让出完成，只需保存少量上下文，不经过内核调度
- B. 运行时会把每个协程绑定到独立的 CPU 核上执行，协程之间并行运行，几乎不需要切换
- C. 协程切换同样由内核完成，但内核为协程维护了专用的轻量级运行队列，跳过了完整的调度流程
- D. 协程不保存寄存器和局部变量，每次恢复都从函数开头重新执行，所以切换几乎没有开销

**8.** 表 users 有 3 个用户（id = 1、2、3）；表 orders(uid, status) 有三行：(1, 'paid')、(1, 'refund')、(2, 'refund')。需求是「列出所有用户，以及他们已支付的订单状态，没有则为 NULL」。下面两条查询分别返回几行？

```sql
-- Q1
SELECT u.id, o.status FROM users u
LEFT JOIN orders o ON u.id = o.uid AND o.status = 'paid';

-- Q2
SELECT u.id, o.status FROM users u
LEFT JOIN orders o ON u.id = o.uid
WHERE o.status = 'paid';
```

- A. Q1 返回 1 行，Q2 返回 3 行；Q2 才满足需求，Q1 过滤掉了没有付款的用户
- B. 两条都返回 3 行，结果完全相同，条件写在 ON 还是 WHERE 中没有区别
- C. Q1 返回 3 行，满足需求；Q2 只返回 1 行，效果相当于内连接
- D. Q1 返回 4 行，Q2 返回 1 行；两条都不满足需求，应改用 INNER JOIN

**9.** 下面的函数中，外层循环让 `i` 依次取 1、2、4、8……，内层循环执行 `i` 次。它的时间复杂度（紧确界）是：

```python
def f(n):
    total, i = 0, 1
    while i < n:
        for _ in range(i):
            total += 1
        i *= 2
    return total
```

- A. $\Theta(\log n)$
- B. $\Theta(n\log n)$
- C. $\Theta(n)$
- D. $\Theta(n^2)$

**10.** 某 Agent 框架在循环中为每个工具注册处理函数：

```python
handlers = {}
for name in ["search", "calc", "weather"]:
    handlers[name] = lambda args: call_tool(name, args)
```

上线后发现，无论模型调用哪个工具，实际执行的都是 weather。下列修改中**能**修复问题的是：

- A. 把 lambda 改成在循环体内用 def 定义的函数：`def h(args): return call_tool(name, args)`，再注册 h
- B. 在循环体的第一行加一句 `name = name`，让每次迭代都重新绑定一次变量
- C. 把 handlers 从字典改成列表，按工具的下标保存和查找处理函数
- D. 改成 `handlers[name] = functools.partial(call_tool, name)`，在注册时就把当前的 name 绑定进去

**11.** 某 LLM 网关服务运行几天后无法再建立新连接，日志中出现「Too many open files」。`ss -tan` 显示有数千个连接处于 `CLOSE_WAIT` 状态，对端都是上游的模型服务。最可能的原因是：

- A. 网关是主动关闭方，连接在等待 2MSL 期间不断堆积，把本地临时端口和文件描述符都占满了
- B. 上游已发来 FIN，网关代码却没有调用 close()（如异常分支漏关连接），连接停在被动关闭的半途
- C. 上游模型服务的 SYN 队列与 accept 队列都已溢出，网关发起的新握手无法完成，半开连接越积越多
- D. 网关与上游之间丢失了大量 ACK，连接卡在三次握手的最后一步，迟迟进入不了 ESTABLISHED 状态

**12.** Basic Paxos 中，提案者以编号 n 发出 prepare 请求，收到了多数接受者的承诺（promise）。其中一个承诺附带「我已接受过编号 7、值为 X 的提案」，另一个附带「已接受过编号 9、值为 Y 的提案」，其余承诺没有附带已接受的提案。提案者原本想提议的值是 Z。第二阶段它应当发出的 accept 请求是：

- A. (n, Z)：附带的已接受值互不一致，说明还没有值被选定，提案者可以坚持原值
- B. (n, X)：应采用最早被接受的值，它最可能已被多数派接受
- C. (n, Y)：必须采用承诺中编号最大的已接受提案的值
- D. (9, Y)：沿用编号最大的已接受提案的编号和值，以免与它冲突

**13.** 关于 PyTorch 2.x 中的 `optimizer.zero_grad()`，下列说法正确的是：

- A. 它把每个参数的 `.grad` 原地填充为 0，所以之后再访问 `p.grad` 一定会得到一个与参数同形状的全 0 张量
- B. 它会把参数本身清零，所以必须在 `optimizer.step()` 之后、下一次前向之前调用
- C. 默认 `set_to_none=True`：把 `.grad` 设为 None 而不是填 0，优化器会跳过 grad 为 None 的参数
- D. 它只清空优化器内部的动量等状态，参数的 `.grad` 需要另外调用 `model.zero_grad()` 才能清空

**14.** 前端用 `const es = new EventSource(url); es.onmessage = handler;` 接收流式输出（只注册了 `onmessage`）。服务端发出下面的字节流（每行以换行结尾）后，连接意外中断：

```text
: ping

id: 41
data: {"delta": "你好"}

event: usage
data: {"total_tokens": 12}

id: 42

data: 第一行
data: 第二行

data: {"delta": "还没写完
```

（最后一行之后没有空行。）`handler` 一共被调用几次？浏览器自动重连时，请求头 `Last-Event-ID` 的值是多少？

- A. `handler` 被调用 2 次（两行 data 合并为一次事件）；重连时 Last-Event-ID 为 42
- B. `handler` 被调用 3 次（usage 事件同样会触发 onmessage）；重连时 Last-Event-ID 为 42
- C. `handler` 被调用 4 次（连接中断时，最后那段不完整的数据也会被派发）；重连时 Last-Event-ID 为 42
- D. `handler` 被调用 2 次；重连时 Last-Event-ID 为 41，因为只有带 data 的事件块才会更新事件 ID

**15.** 一个使用 glibc malloc 的服务处理完一批大请求后，释放了大量 64 KiB 左右的内存块，进程的 RSS（常驻物理内存）却几乎没有下降，过一段时间也没有回落。下列解释最合理的是：

- A. free() 会立即通过 munmap 把整块内存归还给操作系统，RSS 没降，说明这些块其实没被释放，存在泄漏
- B. 这些块小于 mmap 阈值，是从堆或 arena 中切分的；释放后通常留在分配器的空闲链表里复用，难以归还给系统
- C. Linux 按进程的历史峰值保留物理页，进程曾经分配过的物理页要等到进程退出才会被系统回收
- D. RSS 统计的是进程映射过的虚拟地址空间总大小（含已释放的部分），本来就不会因 free 而下降

## 二、多选题（每题 3 分，共 15 分）

**16.** 关于排序算法，下列说法**正确**的有：

- A. 比较排序最坏至少需要 Ω(n log n) 次比较；计数排序能做到 O(n + k)，因为它不靠比较决定顺序
- B. 堆排序是稳定排序：建堆和调整时只交换父子节点，相等元素之间不会发生交换
- C. 快速排序平均 O(n log n)、最坏 O(n²)；改为随机选取枢轴后，最坏时间复杂度也降为 O(n log n)
- D. 插入排序即使在近乎有序的输入上也需要 O(n²) 次比较，所以 Timsort 等工程实现都弃用了它
- E. 归并排序是稳定的，最坏时间复杂度为 O(n log n)，但通常需要 O(n) 的额外空间

**17.** 关于 HTTP/2，下列说法**正确**的有：

- A. HTTP/2 协议本身并不强制使用 TLS，但主流浏览器只支持基于 TLS 的 HTTP/2
- B. 采用二进制分帧，一个连接上可以交错传输多个流的帧，实现多路复用
- C. 用 HPACK 压缩请求头和响应头，重复出现的头部字段可以只传一个索引
- D. 彻底解决了队头阻塞问题，包括 TCP 层的队头阻塞
- E. 服务端推送（Server Push）如今被主流浏览器广泛使用，是 HTTP/2 提升性能的主要手段

**18.** 关于 Python 的多进程（`multiprocessing`、`ProcessPoolExecutor`），下列说法**正确**的有：

- A. 默认启动方式：Windows、macOS 为 spawn；其他 POSIX 平台在 3.13 及以前为 fork，3.14 起改为 forkserver
- B. 子进程对全局变量的修改会自动同步回父进程：fork 后父子进程共享同一块物理内存，写入对双方都可见
- C. 提交给进程池的函数和参数要经 pickle 发给子进程，lambda、嵌套函数这类按名字找不到的函数不能直接提交
- D. spawn 启动的子进程会重新导入主模块，因此创建进程的代码要放在 `__main__` 判断之下
- E. 进程池最适合大量粒度很细的小任务（如每次只做一次加法），任务拆得越碎，各进程负载越均衡，越能发挥多核优势

**19.** 关于字符串匹配算法，下列说法**正确**的有：

- A. Aho-Corasick 自动机一次扫描即可同时查找多个模式串，适合敏感词过滤
- B. KMP 的前缀函数（失配表）同时取决于模式串和文本，每换一段文本都要重新计算
- C. Rabin-Karp 用滚动哈希 O(1) 更新窗口哈希值，哈希相等时仍需逐字符核对，最坏 O(nm)
- D. KMP 匹配时文本指针从不回退，在长为 n 的文本中查找长为 m 的模式串共需 O(n + m)
- E. Trie 前缀树上的一次查询，时间与词典中单词的数量成正比，词典越大查询越慢

**20.** 关于 epoll 的水平触发（LT）与边缘触发（ET），下列说法**正确**的有：

- A. 多个线程等待同一个 epoll 实例时，可用 EPOLLONESHOT 让一个 fd 的事件只交给一个线程，处理完要重新启用
- B. 边缘触发应当配合阻塞模式的 fd 使用：循环读到没有数据时，线程会在 read 上等待新数据到来，不会空转
- C. 水平触发会对同一个就绪事件反复通知、挤占处理时间，更容易漏掉新事件，所以高性能服务器只能使用边缘触发
- D. 水平触发下，只要 fd 的接收缓冲区里还有数据没读完，每次调用 epoll_wait 都会再次报告它就绪
- E. 边缘触发只在状态变化时通知一次，收到通知后要循环读到 EAGAIN，否则剩余数据可能再也得不到通知

## 三、判断题（每题 1 分，共 10 分）

**21.** WordCount 中的 Reduce（对计数求和）可以直接复用为 Combiner。同理，计算每个 key 的平均值时，也可以把「求平均」的 Reduce 直接复用为 Combiner，先在 Map 端求局部平均，以减少 Shuffle 的数据量。

（　　）

**22.** TCP 发送方在任一时刻能发出、但尚未被确认的数据量，同时受接收方通告的窗口（rwnd，用于流量控制）和发送方自己维护的拥塞窗口（cwnd，用于拥塞控制）限制，取二者中的较小值。

（　　）

**23.** MySQL InnoDB 的默认隔离级别是可重复读（REPEATABLE READ），而 PostgreSQL 的默认隔离级别是读已提交（READ COMMITTED）。

（　　）

**24.** 使用「非阻塞 socket + epoll」的程序，按经典的 IO 模型划分仍然属于同步 IO：epoll 只告诉你哪个 fd 可读，把数据从内核缓冲区拷贝到用户缓冲区的过程，仍然由调用 read 的线程自己完成。

（　　）

**25.** 想取每个用户最新的一条记录时，可以直接在同一层查询中写 `WHERE ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY ts DESC) = 1`，或者给窗口函数起别名后在同一层的 WHERE 中引用这个别名。

（　　）

**26.** 最终一致性只保证「如果不再有新的写入，所有副本最终会收敛到相同的值」。因此，一个满足最终一致性的系统，如果写入从不停止，就可能始终不存在所有副本完全相同的时刻。

（　　）

**27.** 从 Python 3.7 起，生成器函数体内抛出且未被捕获的 StopIteration 都会被转换成 RuntimeError，而不是让迭代悄悄结束；想提前结束一个生成器，应该使用 `return`。

（　　）

**28.** WebSocket 规定客户端发往服务端的帧必须做掩码处理，目的是对数据加密、防止链路上的窃听，所以使用 `ws://` 而不是 `wss://` 也能保证数据的机密性。

（　　）

**29.** `itertools.groupby` 只把**相邻**且键相同的元素分为一组，所以想按某个键对全部数据分组时，通常要先按同一个键排序。例如 `[(k, len(list(g))) for k, g in groupby("aabba")]` 的结果是 `[('a', 2), ('b', 2), ('a', 1)]`。

（　　）

**30.** 自定义类只重写了 `__eq__`、没有定义 `__hash__` 时，Python 会把这个类的 `__hash__` 设为 None，它的实例因此不能放进 set 或作为 dict 的键；如果需要可哈希，必须保证「相等的对象哈希值相同」。

（　　）

## 四、代码输出题（每题 3 分，共 9 分）

**31.** 下面的表中 bonus 列含有 NULL。三条聚合查询的输出是什么？

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE t(dept TEXT, bonus INT);
INSERT INTO t VALUES ('a', 100), ('a', NULL), ('b', NULL), ('b', 200), ('b', 200);
""")
print(db.execute("SELECT COUNT(*), COUNT(bonus), COUNT(DISTINCT bonus), "
                 "ROUND(AVG(bonus), 2) FROM t").fetchone())
print(db.execute("SELECT SUM(bonus), COUNT(bonus) FROM t WHERE dept = 'c'").fetchone())
print(db.execute("SELECT dept, AVG(bonus), ROUND(AVG(COALESCE(bonus, 0)), 1) "
                 "FROM t GROUP BY dept ORDER BY dept").fetchall())
```

**32.** TCP 是字节流：发送方的两次 `send` 可能被接收方一次读到，一条消息也可能被拆成几次才读完（俗称「粘包」「拆包」）。下面的代码用「4 字节长度前缀」给消息分帧，并模拟接收方收到被任意切开的字节块。输出是什么？

```python
import struct

def pack(msg: bytes) -> bytes:
    return struct.pack(">I", len(msg)) + msg      # 4 字节大端长度 + 消息体

def unpack_stream(chunks):
    buf, out = b"", []
    for c in chunks:
        buf += c
        while len(buf) >= 4:
            n = struct.unpack(">I", buf[:4])[0]
            if len(buf) < 4 + n:
                break
            out.append(buf[4:4 + n].decode())
            buf = buf[4 + n:]
    return out, len(buf)

data = pack(b"hi") + pack(b"tcp") + pack(b"")
print(len(data))
print(unpack_stream([data[:5], data[5:9], data[9:]]))
print(unpack_stream([data[:7]]))
```

**33.** 下面的代码从一个较大的张量中只取出最后一行保存。输出是什么？

```python
import torch

logits = torch.zeros(1000, 1000)          # 假设这是一次前向得到的大张量
last = logits[-1]                         # 只想保留最后一行
print(last.numel() * last.element_size())
print(last.untyped_storage().nbytes())
kept = logits[-1].clone()
print(kept.untyped_storage().nbytes())
```

## 五、代码改错题（每题 6 分，共 6 分）

**34.** RAG 检索到若干文本片段，每个片段有 token 数和相关性分数。要在 token 预算内选出一些片段（每个最多选一次），使总分最大。下面用一维数组实现的 0/1 背包算出的结果有时偏大，请找出 bug 并修正。

```python
def best_score(chunks, budget):
    """chunks: [(token 数, 分数), ...]，每个片段最多选一次；返回预算内的最高总分"""
    dp = [0] * (budget + 1)                # dp[c]：已考虑的片段在 c 个 token 内的最高总分
    for cost, score in chunks:
        for c in range(cost, budget + 1):
            dp[c] = max(dp[c], dp[c - cost] + score)
    return dp[budget]
```

## 六、编程题（每题 12 分，共 24 分）

**35.** 用 `threading` 的锁与条件变量实现一个线程安全的有界阻塞队列（不得使用 `queue.Queue`）：

```python
class BoundedQueue:
    def __init__(self, capacity: int): ...
    def put(self, item, timeout=None) -> bool: ...
    def get(self, timeout=None): ...
    def __len__(self) -> int: ...
```

- `capacity <= 0` 时抛出 `ValueError`；队列先进先出；
- `put`：队列满时阻塞，直到有空位后放入并返回 `True`；给定 `timeout`（秒）且超时仍满时，返回 `False`；
- `get`：队列空时阻塞，直到有数据后取出并返回；给定 `timeout` 且超时仍空时，抛出 `TimeoutError`；
- 多个生产者、多个消费者并发调用时，数据不丢不重。

**36.** 统计 Agent 日志中被调用得最多的工具名。实现：

```python
def top_k_frequent(words: list[str], k: int) -> list[str]: ...
```

- 返回出现次数最多的 `k` 个词，按次数从高到低排列，次数相同时按字典序升序；不同的词少于 `k` 个时全部返回；`k <= 0` 时返回空列表；
- 设共有 $n$ 个词、$m$ 个不同的词，要求时间复杂度为 $O(n+m\log k)$：维护大小不超过 `k` 的堆，不要对全部 $m$ 个词排序，也不要直接调用 `heapq.nlargest` / `heapq.nsmallest`。

示例：`top_k_frequent(["rag", "agent", "rag", "llm", "agent", "rag", "tool"], 2) == ["rag", "agent"]`。

## 七、简答题（每题 8 分，共 16 分）

**37.** 请比较进程、线程、协程：它们分别是什么的单位，由谁调度，切换开销有多大，各自适合什么场景？以「同时调用几百个大模型 API 并等待返回」为例，说明你会怎么选。

**38.** 互斥锁、信号量、条件变量有什么区别？各自适合解决什么问题？请结合一个调用大模型 API 的批处理服务举例说明，并说出使用它们时的常见错误。
