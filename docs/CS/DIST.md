# CS-DIST · 分布式系统

> 所属大类：编程与计算机基础　｜　题量：31

分布式系统的一致性、共识、分片与常用中间件。

**考点覆盖**：CAP定理（2） · BASE与最终一致性（3） · 一致性模型（6） · Raft选举（4） · Raft日志复制（5） · Paxos直觉（2） · 一致性哈希（3） · 分布式事务（3） · 消息队列（3） · MapReduce（2） · 分布式锁（2） · 分布式追踪（2）

**题型**：[单选题（9）](#单选题) · [多选题（5）](#多选题) · [判断题（3）](#判断题) · [填空题（1）](#填空题) · [计算题（3）](#计算题) · [代码输出题（3）](#代码输出题) · [代码改错题（1）](#代码改错题) · [编程题（1）](#编程题) · [简答题（2）](#简答题) · [场景分析题（3）](#场景分析题)

---

## 单选题

<a name="CS-DIST-001"></a>

### CS-DIST-001　基础 · 考频 ★★★

关于 CAP 定理，下列说法正确的是：

- **A.** 分布式系统可以放弃 P、选择 CA：例如跨两个机房部署、采用异步复制的 MySQL 主从集群，平时既一致又可用
- **B.** CAP 中的 C 与 ACID 中的 C 含义相同，都指数据在操作前后满足完整性约束（如余额不为负、外键有效）
- **C.** 分区发生时，只能在「拒绝部分请求以保证线性一致」与「继续响应但可能返回旧数据」之间取舍；无分区时二者可兼得
- **D.** 选择 CP 的系统即使没有发生分区，每次读写也要等多数派确认，因而可用性明显低于 AP 系统

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：CAP 讨论的是「网络分区发生时」的取舍。

Gilbert 和 Lynch（2002）给出的形式化定义中：C 是线性一致性（任何读都能读到最近一次完成的写）；A 是每个未故障的节点收到请求后，都必须在有限时间内给出非错误的响应；P 是网络可以任意丢失节点间的消息。分区时，被隔离一侧的节点要么拒绝服务（保 C），要么用本地可能过时的数据响应（保 A）。

- A 错：跨机房的网络分区无法避免，分布式系统不能「放弃 P」，所谓 CA 只对单机系统有意义。异步复制的主从集群在主库故障切换时还可能丢失已确认的写入，连 C 都谈不上。
- B 错：ACID 的 C 指事务前后满足业务约束（如余额不为负）；CAP 的 C 指多副本的读写表现得像只有一个副本，二者完全不同。
- D 错：没有分区时 CP 系统同样可用，它的代价主要是延迟（要等多数派确认），这正是 PACELC 补充的内容。

Brewer 在 2012 年的回顾文章中也指出，「三选二」的说法有误导性：分区很少发生，设计者应在分区期间明确取舍，并在分区恢复后修复不一致。

<sub>考点：CAP定理　｜　出处：Gilbert & Lynch, Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services (SIGACT News, 2002)；Brewer, CAP Twelve Years Later: How the "Rules" Have Changed (IEEE Computer, 2012)</sub>

</details>

---

<a name="CS-DIST-006"></a>

### CS-DIST-006　挑战 · 考频 ★★

单个寄存器 x 的初值为 0。客户端 A 在 t = 1 发起「写 x = 1」，t = 2 收到成功响应；客户端 B 在 t = 3 发起「读 x」，t = 4 得到返回值 0。之后再无其他操作。关于这段执行历史，下列判断正确的是：

- **A.** 满足线性一致性：读和写来自不同客户端，线性一致性只约束同一客户端内的操作顺序
- **B.** 不满足线性一致性，但满足顺序一致性：把 B 的读排在 A 的写之前即可
- **C.** 既不满足线性一致性，也不满足顺序一致性：写已经成功返回，任何合法顺序中的读都必须看到 1
- **D.** 满足线性一致性：写操作可以在 t = 4 之后才真正生效，读返回 0 并不矛盾

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：线性一致性要求尊重真实时间的先后，顺序一致性只要求尊重每个客户端自己的操作顺序。

- **线性一致性**：每个操作都要在它的发起与返回之间的某个时刻「瞬间生效」。A 的写在 [1, 2] 内生效，B 的读在 [3, 4] 内生效，读一定排在写之后，必须返回 1。返回 0 违反了线性一致性。
- **顺序一致性**：只要存在一个全局顺序，既保持每个客户端内部的操作顺序，又让每次读返回在它之前最近一次写入的值即可，不要求符合真实时间。顺序「B 读 → A 写」中，读返回初值 0，完全合法。

- A 错：线性一致性对**所有**客户端中时间上不重叠的操作都有先后约束；「只约束同一客户端内的顺序」描述的是顺序一致性。
- C 错：顺序一致性不要求尊重真实时间，可以把读排在写之前，此时读到 0 完全合法；读到旧值只违反了实时约束。
- D 错：A 在 t = 2 已收到成功响应，写的生效时刻不能晚于 t = 2。

**对比**：如果 B 先读到 1、再读到 0（中间没有其他写入），就连顺序一致性也违反了，因为 B 自己的两次读必须按程序顺序排列。工程上，「从库读到旧值」正是不满足线性一致性的典型表现。

<sub>考点：一致性模型　｜　出处：Herlihy & Wing, Linearizability: A Correctness Condition for Concurrent Objects (ACM TOPLAS, 1990)；Lamport, How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs (IEEE Transactions on Computers, 1979)</sub>

</details>

---

<a name="CS-DIST-009"></a>

### CS-DIST-009　进阶 · 考频 ★★★

5 节点的 Raft 集群（S1～S5），S1 是任期 3 的 Leader。网络分区把集群分成 {S1, S2} 和 {S3, S4, S5} 两部分，客户端仍不断向 S1 发送写请求。下列描述正确的是：

- **A.** {S3, S4, S5} 一侧会以更高的任期（如 4）选出新 Leader 并继续提交；S1 的新写入凑不够多数派，无法提交，分区恢复后 S1 退位，这些日志被覆盖
- **B.** S1 仍是合法的 Leader，在本侧继续接收并提交新的写入；S3～S5 会一直等待 S1 的心跳，不发起选举；分区恢复后，两侧的日志按任期大小合并
- **C.** 两侧都会选出 Leader：S1 继续担任任期 3 的 Leader，{S3, S4, S5} 选出任期 4 的 Leader，两边各自提交写入，形成脑裂，分区恢复后需要人工合并数据
- **D.** 任何一侧都凑不齐全部 5 个节点，整个集群停止接受写入，直到分区恢复后由任期最大的节点继续担任 Leader

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：Raft 靠「多数派」防止脑裂。5 个节点的多数是 3，只有 {S3, S4, S5} 一侧能选主和提交。

- 多数派一侧：S3～S5 收不到 S1 的心跳，选举超时后有节点把任期加到 4，获得 3 票当选，继续服务；
- 少数派一侧：S1 不会立刻知道自己已被取代，仍以任期 3 的 Leader 自居，接收写入并复制给 S2，但只有 2 个副本，永远无法提交，客户端会一直等到超时；
- 分区恢复：S1 收到任期 4 的消息后立即退回 Follower；它和 S2 上任期 3 的未提交日志与新 Leader 冲突，会被删除并替换。客户端超时后要重试，最好带上唯一的请求 ID，让状态机去重，避免某次其实已经成功的写入被执行两次。

- B 错：S1 凑不够多数派，不能提交任何新日志；S3～S5 收不到心跳就会发起选举。
- C 错：少数派一侧选不出新 Leader，S1 虽然自认为是 Leader 却不能提交，不会出现两边都提交的情况。
- D 错：多数派一侧可以正常服务，Raft 不要求全部节点在线。

**延伸**：S1 这样的旧 Leader 如果直接用本地数据响应读请求，可能返回过期的数据。Raft 论文给出的办法是：处理只读请求前先与多数派交换一次心跳，确认自己仍是 Leader；或者依赖租约，但这要求时钟偏差有界。

<sub>考点：Raft选举、Raft日志复制　｜　出处：Ongaro & Ousterhout, In Search of an Understandable Consensus Algorithm (USENIX ATC 2014), https://raft.github.io/raft.pdf</sub>

</details>

---

<a name="CS-DIST-012"></a>

### CS-DIST-012　挑战 · 考频 ★★

5 节点的 Raft 集群中，新当选的 Leader（任期 4）发现自己日志的索引 2 处是一条任期 2 的日志，而且已经复制到了包括自己在内的 3 个节点上。关于这条日志，下列说法正确的是：

- **A.** 它已经存在于多数节点上，Leader 可以立即把 commitIndex 推进到 2，并应用到状态机
- **B.** 新 Leader 不能提交前任留下的日志，应当把它删除，并通知客户端用新任期重新提交这次写入
- **C.** 只有把它复制到全部 5 个节点上，Raft 才会提交它；在此之前不允许选出新的 Leader
- **D.** 不能仅凭副本过半提交它；要等任期 4 的某条日志复制到多数节点后，它才随之被间接提交

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：Raft 只通过「数副本」提交**当前任期**的日志，之前任期的日志随之间接提交。

**为什么旧任期的日志「过半」还不安全**（论文图 8 的情形）：任期 2 的日志 X 复制到了 3 个节点，但如果此时 Leader 崩溃，另一个最后一条日志任期为 3 的节点仍可能当选：比较日志新旧时先看最后一条的任期，3 > 2，持有 X 的节点也会认为它更新而投票给它。它当选后会用自己的日志覆盖 X，「已提交」的日志就丢了。

**为什么提交本任期的日志就安全了**：一旦任期 4 的某条日志复制到多数节点，任何新候选人想当选，都要拿到这些节点中至少一个的票，而这个节点的最后任期至少是 4，只会投给同样包含这条日志的候选人；由日志匹配性质，包含它就包含它之前的全部日志，包括 X。所以新 Leader 上任时通常立即追加一条空操作（no-op）日志，让旧任期的日志尽快随它一起提交。

- A 错：这正是上面描述的不安全做法。
- B 错：前任留下的日志可以被提交，只是要等本任期的日志提交时一起被间接提交；而且 Leader 只追加、从不删除自己的日志，这条日志也可能早已被前任 Leader 提交。
- C 错：Raft 不要求复制到全部节点，也不会因此阻止选举。论文提到某些情形下可以安全地提交旧日志（如已复制到所有节点），但 Raft 为了简单统一采用保守规则。

**no-op 日志的另一个作用**：新 Leader 只有提交了本任期的日志，才能确知哪些日志已经提交，从而正确处理只读请求。

<sub>考点：Raft日志复制　｜　出处：Ongaro & Ousterhout, In Search of an Understandable Consensus Algorithm, §5.4.2 与 §8, https://raft.github.io/raft.pdf</sub>

</details>

---

<a name="CS-DIST-015"></a>

### CS-DIST-015　进阶 · 考频 ★

Basic Paxos 中，提案者以编号 n 发出 prepare 请求，收到了多数接受者的承诺（promise）。其中一个承诺附带「我已接受过编号 7、值为 X 的提案」，另一个附带「已接受过编号 9、值为 Y 的提案」，其余承诺没有附带已接受的提案。提案者原本想提议的值是 Z。第二阶段它应当发出的 accept 请求是：

- **A.** (n, Z)：附带的已接受值互不一致，说明还没有值被选定，提案者可以坚持原值
- **B.** (n, X)：应采用最早被接受的值，它最可能已被多数派接受
- **C.** (n, Y)：必须采用承诺中编号最大的已接受提案的值
- **D.** (9, Y)：沿用编号最大的已接受提案的编号和值，以免与它冲突

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：第二阶段的值不能自由选择。只要多数派的承诺中带有已接受的提案，就必须采用其中**编号最大**的那个提案的值；只有所有承诺都没有附带已接受的提案时，才能用自己的值。

**直觉**：某个值可能已经被「选定」（被多数接受者接受）了，只是提案者不知道。设值 v 以编号 m 被选定，那么任何一个多数派中都至少有一个接受者接受过编号不小于 m 的提案；Paxos 又保证编号在 m 与 n 之间的提案值都是 v（归纳）。所以多数派的承诺中编号最大的已接受提案，其值一定是 v。采用它，新提案就不会推翻已选定的值。

- A 错：已接受的值互不一致，并不说明还没有值被选定；坚持 Z 可能推翻已经选定的 Y，破坏「只选定一个值」的安全性。
- B 错：编号 7 的 X 可能早已被编号更大的提案取代，「最早」没有意义。
- D 错：accept 请求必须使用本轮 prepare 的编号 n。接受者已承诺不再接受小于 n 的提案，用 9 发出会被拒绝。

**两个阶段的分工**：第一阶段（prepare / promise）既是「抢占」（让接受者承诺不再接受更小编号的提案），也是「学习」（获知可能已被选定的值）；第二阶段（accept / accepted）才真正提议值。

<sub>考点：Paxos直觉　｜　出处：Lamport, Paxos Made Simple (2001), https://lamport.azurewebsites.net/pubs/paxos-simple.pdf</sub>

</details>

---

<a name="CS-DIST-019"></a>

### CS-DIST-019　基础 · 考频 ★★

一致性哈希中，让每台物理机在环上占据多个虚拟节点。关于虚拟节点，下列说法正确的是：

- **A.** 虚拟节点只是环上的若干编号，数量从 100 加到 10 万也几乎没有额外开销，越多负载越均衡
- **B.** 虚拟节点在环上的位置固定不变，增删物理节点时只需改写虚拟节点到物理机的映射，不必迁移数据
- **C.** 同一个 key 会同时落在属于不同物理机的多个虚拟节点上，因此虚拟节点顺带实现了多副本存储
- **D.** 各机器分到的区间总长更接近平均值；机器下线时，负载会分散给多台机器，而不是全压给顺时针的下一台

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：虚拟节点解决的是「节点少时负载不均」和「故障时负载集中」两个问题。

- 每台机器只有一个位置时，各段区间的长度随机性很大。一个模拟实验中，5 台机器、每台 1 个虚拟节点时，最忙机器的负载约为平均值的 1.95 倍；每台 100 个时降到约 1.13 倍；
- 一台机器下线时，它的许多小段区间分别交给各自顺时针方向的下一个虚拟节点，而这些虚拟节点属于不同的机器，负载被摊开；
- 还可以按机器的性能分配虚拟节点的数量，实现加权。

- A 错：虚拟节点越多，环占用的内存、成员变更时的计算量和元数据同步量就越大，通常每台几十到几百个就足够了。
- B 错：虚拟节点换了归属，它负责的那段区间的数据就必须搬到新的物理机上；迁移量仍约为 1/(N+1)，只是更均匀地分散到了多台机器上。
- C 错：一个 key 仍只映射到环上的一个位置（顺时针方向的第一个虚拟节点）；多副本需要另外的机制，例如沿环顺时针选出多台**不同的物理机**作为副本（Dynamo 的偏好列表）。

<sub>考点：一致性哈希　｜　出处：DeCandia et al., Dynamo (SOSP 2007)</sub>

</details>

---

<a name="CS-DIST-020"></a>

### CS-DIST-020　基础 · 考频 ★★★

两阶段提交（2PC）中，所有参与者都在第一阶段投了「同意」：已经写好准备日志，并锁住了相关资源。此时协调者在发出第二阶段的决定之前崩溃，而且长时间无法恢复。参与者此时的处境是：

- **A.** 参与者等待超时后可以自行回滚：没有收到提交命令，说明协调者还没来得及作出提交决定
- **B.** 参与者处于「不确定」状态，既不能自行提交也不能自行回滚，只能持锁等协调者恢复或向其他参与者打听结果
- **C.** 参与者可以自行提交：自己已投同意、准备日志也已落盘，协调者只可能作出提交的决定
- **D.** 参与者会通过超时自动选举出新的协调者，由它读取各参与者的准备日志后完成第二阶段，整个过程对业务透明、不会阻塞

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：这就是 2PC 的阻塞问题。

投了「同意」的参与者已经放弃了单方面回滚的权利：协调者可能已经决定提交，并通知了部分参与者。它也不能自行提交：协调者可能因为某个参与者超时而决定回滚，而这个参与者并不知道其他人的投票。所以它只能保持「准备好」的状态并持有锁，等待协调者恢复。

参与者之间互相询问可以缓解：如果有人已经收到了决定，或者有人投了反对票、还没投票，就能据此作出决定；但如果所有存活的参与者都处于不确定状态，仍然只能等待。

- A 错：协调者可能已经决定提交并通知了其他参与者，单方面回滚会造成不一致。
- C 错：参与者通常不知道别人的投票；即使都同意，协调者也可能因为超时决定回滚。
- D 错：这是基于共识的提交协议（例如用 Paxos 或 Raft 复制协调者的决定）才有的能力，标准 2PC 没有。

**应对**：用共识协议复制协调者的状态，Google Spanner 就是在 Paxos 组之上运行 2PC；三阶段提交（3PC）在只有节点崩溃、没有网络分区的假设下不阻塞，但发生分区时可能不一致，实际很少使用；更常见的是在业务层面避免跨服务的强一致事务，改用 TCC、Saga、本地消息表等最终一致的方案。另外，2PC 要求资源从准备阶段一直锁到第二阶段结束，并发性能也较差。

<sub>考点：分布式事务　｜　出处：Corbett et al., Spanner: Google's Globally-Distributed Database (OSDI 2012)</sub>

</details>

---

<a name="CS-DIST-023"></a>

### CS-DIST-023　基础 · 考频 ★★★

某消费者从 Kafka 拉取一批消息，逐条调用大模型生成摘要并写入数据库。关于提交消费位点（offset）的时机，下列说法正确的是：

- **A.** 先提交再处理，崩溃时未处理完的消息会丢失（至多一次）；先处理再提交，崩溃后会重复消费（至少一次），需要幂等
- **B.** 先处理、再同步提交位点（commitSync 成功后才拉取下一批），就能做到恰好一次，处理逻辑不必幂等
- **C.** 开启自动提交（enable.auto.commit=true）后，Kafka 会在每条消息处理成功之后才提交它的位点
- **D.** 位点默认只保存在消费者进程的内存里，消费者重启后会按 auto.offset.reset 从 topic 的开头重新消费

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：提交位点与处理消息之间没有原子性，二者的先后决定了投递语义。

- 先提交后处理：位点已经前进，处理中途崩溃，这些消息不会再被消费，即「至多一次」；
- 先处理后提交：处理完成、提交之前崩溃，重启后从上次提交的位点重新消费，即「至少一次」。写库时按消息 ID 或业务主键去重（唯一索引、upsert），才能做到「效果上恰好一次」。

- B 错：同步提交只保证提交成功后才继续，处理完成与提交位点之间的崩溃窗口依然存在，重启后会重复处理。
- C 错：自动提交是在后台按时间间隔（`auto.commit.interval.ms`，默认 5 秒）提交 poll 已经返回过的位点，Kafka 并不知道业务是否处理成功。若把消息交给其他线程异步处理，位点可能先于处理完成被提交，崩溃时就会丢消息。
- D 错：消费者组的位点由 Kafka 保存（内部 topic `__consumer_offsets`），重启后从最后一次提交的位点继续；只有找不到已提交的位点时，才按 `auto.offset.reset` 决定从最早还是最新的位置开始。

**Agent 场景**：大模型调用又慢又贵，重复消费意味着重复付费，所以除了幂等写库，还可以在调用模型之前先检查这条消息是否已经处理过。

<sub>考点：消息队列　｜　出处：Apache Kafka 文档：Consumer Configs，https://kafka.apache.org/41/configuration/consumer-configs/</sub>

</details>

---

<a name="CS-DIST-031"></a>

### CS-DIST-031　基础 · 考频 ★★

在追踪系统中查看一条 trace 时，发现子 span（工具服务处理请求）的开始时间比父 span（Agent 编排服务发起调用）的开始时间还早了 30 ms。最可能的原因与正确的处理方式是：

- **A.** 上报过程中丢失了真正的父 span，子 span 被错误地挂到了别的父 span 下，这条 trace 应该直接丢弃
- **B.** 两台机器的本地时钟有偏差；父子关系应以 parent_span_id 为准，展示时可把子 span 校正到父 span 范围内
- **C.** 工具服务在收到请求前就已开始处理，说明调用链上存在预取或推测执行，这是正常现象，保持原样展示即可
- **D.** 应当把所有 span 的时间戳统一改为追踪后端收到 span 的时刻，所有时间都出自同一个时钟，就不会再有偏差

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：跨机器比较时间戳不可靠，调用链的结构要由 ID 之间的引用关系决定。

- 各台机器的时钟即使经过 NTP 同步也仍有偏差，通常在毫秒量级，网络抖动大或配置不当时更大，30 ms 的「穿越」完全可能是时钟偏差；
- 同一个 span 的开始和结束都在同一台机器上测量，它的**时长**是可靠的；但两台机器之间的**先后**不能用时间戳判断，这正是 Lamport 逻辑时钟要解决的问题；
- trace_id 把一次请求的所有 span 串在一起，parent_span_id 指明父子关系，即使时间戳错乱也能正确还原调用树。一些追踪系统在展示时会根据父子关系做时钟偏差校正。

- A 错：parent_span_id 指向的父 span 就是发起调用的那个，父子关系没有错，数据本身也没有问题，只是时钟不同步。
- C 错：子 span 由父服务的调用触发，不可能在调用发出之前开始。
- D 错：后端收到 span 的时刻还叠加了批量上报、网络传输和排队延迟，误差更大，而且会丢失真实的耗时。

**延伸**：分析耗时时，比较父 span 中「发起调用到收到响应」的时长与子 span 的时长，差值约等于网络往返和排队时间，这个差值不受时钟偏差的影响。

<sub>考点：分布式追踪</sub>

</details>

---

## 多选题

<a name="CS-DIST-002"></a>

### CS-DIST-002　进阶 · 考频 ★★

关于 CAP 的延伸 PACELC，以及常见系统的取舍，下列说法**正确**的有：

- **A.** AP 系统放弃了线性一致性，副本之间只能各自为政，无法提供最终一致或读己之写这类较弱的保证
- **B.** 配置中心、选主、分布式锁这类元数据服务（如 etcd、ZooKeeper）通常选择 AP，因为它们必须永远可写
- **C.** PACELC：发生分区时在可用性与一致性之间取舍；否则（正常运行时）在延迟与一致性之间取舍
- **D.** Abadi 把默认配置下的 Dynamo、Cassandra、Riak 归为 PA/EL：分区时保可用，平时为低延迟也放松一致性
- **E.** 写入要同步复制到多数副本才返回成功的系统，即使没有发生网络分区，也要为一致性付出额外的写延迟

<details>
<summary>答案与解析</summary>

**答案：CDE**

**解析：**

**结论**：C、D、E 正确。

- A 错：AP 系统通常仍提供最终一致性，还可以加上读己之写、单调读等会话级保证，或用版本向量、CRDT 合并冲突。
- B 错：这类服务读到错误的配置、或同时出现两个主，比暂时不可用更危险，所以通常选择 CP：etcd 基于 Raft，ZooKeeper 基于 ZAB，少数派一侧会拒绝写入。
- C 对：PACELC 由 Abadi 在 2012 年提出：PAC 指分区（Partition）时在可用性与一致性之间取舍，ELC 指否则（Else）在延迟（Latency）与一致性之间取舍，补充了 CAP 没有覆盖的「正常运行时」的权衡。
- D 对：文中还把 VoltDB/H-Store、Megastore 这类完全 ACID 的系统归为 PC/EC。注意这些标签描述的是默认配置，许多系统的一致性级别可以调节，例如 Cassandra 可以按请求选择 ONE、QUORUM、ALL。
- E 对：同步复制要等多数副本确认，至少多一次跨节点往返；跨地域部署时这部分延迟可达几十到上百毫秒。这就是 EC（平时也选一致）的代价。

<sub>考点：CAP定理、一致性模型　｜　出处：Abadi, Consistency Tradeoffs in Modern Distributed Database System Design (IEEE Computer, 2012), https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf</sub>

</details>

---

<a name="CS-DIST-008"></a>

### CS-DIST-008　进阶 · 考频 ★

三个副本 R1、R2、R3 用向量时钟（依次记录 R1、R2、R3 的计数）标记同一个 key 的不同版本：V1 = [2, 1, 0]，V2 = [2, 2, 0]，V3 = [1, 3, 1]，V4 = [3, 1, 1]。下列说法**正确**的有：

- **A.** 向量时钟的长度是固定的，与参与写入的节点数无关，节点再多也不会增加每个版本携带的元数据
- **B.** V1 发生在 V2 之前（V1 → V2），V2 可以直接覆盖 V1
- **C.** 向量时钟能准确判断两个事件有无因果关系；Lamport 时钟只保证「有因果则时间戳更小」，反之不成立
- **D.** V2 与 V3 是并发写入，不能随意丢弃其一，应保留两个版本交给应用合并，或按约定规则（如最后写入者胜）解决
- **E.** V4 与 V2 同样是并发写入：V4 的分量之和虽然更大，但它的第二个分量比 V2 小

<details>
<summary>答案与解析</summary>

**答案：BCDE**

**解析：**

**结论**：B、C、D、E 正确。

**比较规则**：$V\le W$ 当且仅当每个分量都满足 $V[i]\le W[i]$。若 $V\le W$ 且 $V\ne W$，则 V 发生在 W 之前；两个方向都不成立时，二者并发。

- A 错：向量的长度等于参与写入的节点数，节点越多越长。Dynamo 论文提到，向量时钟的项数超过阈值时会删掉最旧的项，代价是可能误判因果关系。
- B 对：[2, 1, 0] 的每个分量都不大于 [2, 2, 0]，V1 → V2，V2 包含了 V1 的全部历史，可以覆盖。
- C 对：这正是向量时钟多付出 O(节点数) 的空间所换来的能力。
- D 对：[2, 2, 0] 与 [1, 3, 1] 互不小于等于（第一个分量 2 > 1，第二个分量 2 < 3），是并发写入，属于真正的冲突。Dynamo 的做法是把冲突的版本都返回给客户端，由业务合并，例如购物车取并集。
- E 对：[3, 1, 1] 与 [2, 2, 0] 互不小于等于（第一个分量 3 > 2，第二个分量 1 < 2），也是并发的。分量之和说明不了先后，不能因为 V4 的分量之和更大就让它覆盖 V2。

<sub>考点：一致性模型　｜　出处：DeCandia et al., Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)</sub>

</details>

---

<a name="CS-DIST-013"></a>

### CS-DIST-013　进阶 · 考频 ★★

关于 Raft 的日志复制，下列说法**正确**的有：

- **A.** Follower 发现已有条目与 Leader 的条目冲突（索引相同、任期不同）时，删除该条目及其后的所有条目，再追加
- **B.** AppendEntries 携带前一条日志的索引和任期；Follower 找不到任期匹配的条目就拒绝，Leader 递减 nextIndex 后重试
- **C.** 日志匹配性质：只要两个节点的日志在同一个索引处都有条目，这两个条目以及它们之前的所有条目就都相同，与任期无关
- **D.** 一条日志只要写入 Leader 本地磁盘就算已提交，Leader 可以立即回复客户端成功，之后再异步复制给各个 Follower
- **E.** Leader 发现自己的日志与多数 Follower 不一致时，会删除自己的冲突条目，以多数派的日志为准，再继续向其他节点复制

<details>
<summary>答案与解析</summary>

**答案：AB**

**解析：**

**结论**：A、B 正确。

- A 对：冲突的条目一定没有提交（已提交的日志必然存在于新 Leader 的日志中），所以删除是安全的。
- B 对：这是 AppendEntries 的一致性检查。论文还提到一种优化：Follower 拒绝时返回冲突条目的任期以及该任期的第一个索引，Leader 可以一次跳过整个任期的冲突条目。
- C 错：日志匹配性质的前提是该索引处两个条目的**任期相同**，只是索引相同不够。例如旧 Leader 在某个索引写入、但没来得及复制出去的条目，与新 Leader 在同一索引写入的条目任期不同、内容也可能不同，这正是 Follower 要删除冲突条目的原因。这一性质由两点保证：同一任期内 Leader 在一个索引上最多创建一条日志，且日志位置不会改变；一致性检查则像归纳法一样，保证每次追加成功时前面的日志也都相同。
- D 错：日志复制到多数节点后才算提交。只写本地就回复成功，Leader 一旦崩溃，这条日志可能被新 Leader 覆盖，客户端却以为写入成功了。
- E 错：Leader 只追加、从不删除或覆盖自己的日志（Leader Append-Only），总是让 Follower 向自己看齐。选举限制保证了 Leader 一定拥有全部已提交的日志。

<sub>考点：Raft日志复制　｜　出处：Ongaro & Ousterhout, In Search of an Understandable Consensus Algorithm, §5.3, https://raft.github.io/raft.pdf</sub>

</details>

---

<a name="CS-DIST-021"></a>

### CS-DIST-021　进阶 · 考频 ★★★

关于分布式事务的几种常见方案，下列说法**正确**的有：

- **A.** 本地消息表把业务数据与待发消息写进同一个本地事务，再由后台任务可靠投递，下游需要幂等消费
- **B.** 2PC 的准备阶段只检查资源是否充足、并不加锁，锁在第二阶段才获取，因此并发性能与 Saga 相当
- **C.** Saga 把长事务拆成一串本地事务，每一步配有补偿操作；补偿机制同时保证了隔离性，其他事务看不到中间状态
- **D.** 采用本地消息表后，后台任务确认发送成功才把消息标记为已发送，因此消息恰好投递一次，下游不必去重
- **E.** TCC 拆成 Try（检查并预留资源）、Confirm（使用预留）、Cancel（释放预留）三个接口，靠业务层面的「预留」实现隔离

<details>
<summary>答案与解析</summary>

**答案：AE**

**解析：**

**结论**：A、E 正确。

- A 对：业务数据与消息表在同一个本地事务中写入，保证「业务成功则消息一定会发出」；投递任务扫描消息表发送，失败就重试，因此是至少一次投递，下游要按消息 ID 或业务主键去重。
- B 错：2PC 的参与者在准备阶段就要锁住资源，并一直持有到第二阶段结束，期间其他事务只能等待；再加上协调者故障时的阻塞问题，并发性能明显差于 Saga。
- C 错：Saga 每一步都直接提交本地事务，失败时按逆序执行补偿。补偿只保证最终回到业务上一致的状态，并不提供隔离性：中间状态对外可见（例如机票已订、酒店未订），其他事务可能读到并据此行动，需要用语义锁、可交换的更新等手段缓解。
- D 错：投递任务可能在消息发送成功、但还没标记为已发送时崩溃，重启后会再发一次，所以只能做到至少一次。
- E 对：例如扣款时，Try 冻结金额、Confirm 扣除冻结的金额、Cancel 解冻。Try 已经把资源「占住」，其他事务用不了这部分资源，这就是业务层面的隔离。代价是改造量大，每个参与者都要实现三个接口，并处理空回滚、悬挂、幂等等问题。

**选型参考**：参与者少、要求强一致、都在支持 XA 的数据库体系内，可以用 2PC；资金类、需要预留资源的用 TCC；跨多个外部系统的长流程用 Saga；「本地写成功后通知其他服务」这类异步场景用本地消息表加幂等消费。

<sub>考点：分布式事务</sub>

</details>

---

<a name="CS-DIST-024"></a>

### CS-DIST-024　进阶 · 考频 ★★★

关于 Kafka 的分区、消费者组与消息顺序，下列说法**正确**的有：

- **A.** 只要消费者是单线程的，按 poll 返回的顺序逐条处理，就能按全局顺序消费整个 topic 的消息
- **B.** Kafka 只保证分区内有序；要让同一会话的消息按顺序处理，应以会话 ID 作为 key，使它们落到同一分区
- **C.** 关闭幂等、开启重试且 max.in.flight.requests.per.connection 大于 1 时，重试可能让分区内的消息乱序
- **D.** 同一个消费者组中，消费者实例数多于分区数时，多出来的实例分不到分区，起不到加速作用
- **E.** 把 topic 的分区数从 8 增加到 16 后，Kafka 会按一致性哈希只迁移少量 key，相同 key 的消息仍落在原来的分区

<details>
<summary>答案与解析</summary>

**答案：BCD**

**解析：**

**结论**：B、C、D 正确。

- A 错：多个分区的消息到达消费者的先后取决于拉取和分区分配，单线程也得不到全局顺序；要全局有序只能用单个分区，并牺牲并行度。
- B 对：Kafka 只在分区内保证顺序（按追加顺序写入、按位点顺序读取），跨分区没有全局顺序。以会话 ID 作为 key，默认分区器对 key 做哈希来选分区，同一会话的消息就会在同一分区内有序。
- C 对：发往同一分区的两个批次，第一个失败重试、第二个先成功，就会乱序。开启幂等生产者后，Broker 按序列号去重并保证顺序，此时同时在途的请求数最多可以到 5；较新版本的 Java 客户端默认开启幂等。
- D 对：一个分区在同一时刻只分配给组内的一个消费者，消费者数超过分区数时，多余的实例拿不到分区。要提高并行度，要么增加分区，要么在实例内部并发处理。
- E 错：默认分区器不是一致性哈希，分区由「key 的哈希 % 分区数」决定，分区数变了，同一个 key 可能落到别的分区（已写入的消息也不会迁移）。扩容前后，同一会话的新旧消息分在两个分区，可能被乱序处理。依赖 key 顺序的 topic，最好一开始就预留足够的分区。

<sub>考点：消息队列　｜　出处：Apache Kafka 文档：Producer Configs，https://kafka.apache.org/41/configuration/producer-configs/</sub>

</details>

---

## 判断题

<a name="CS-DIST-003"></a>

### CS-DIST-003　进阶 · 考频 ★★

最终一致性只保证「如果不再有新的写入，所有副本最终会收敛到相同的值」。因此，一个满足最终一致性的系统，如果写入从不停止，就可能始终不存在所有副本完全相同的时刻。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。Vogels 对最终一致性的经典表述是：如果某个对象不再有新的更新，最终所有访问都会返回最后一次更新的值。这个定义只约束「停止写入之后」的行为：既不保证收敛需要多长时间，也不保证写入持续进行时各副本会在某一时刻完全一致；收敛之前读到旧值，也符合定义。

BASE（基本可用 Basically Available、软状态 Soft state、最终一致 Eventually consistent）是 AP 路线的工程概括。实践中复制延迟通常在毫秒到秒级，而且可以测量；工程上还会补充更强的保证：
- 会话保证：读己之写、单调读、单调写；
- 冲突处理：最后写入者胜（依赖时钟，可能丢失写入）、版本向量加应用层合并、CRDT 等。

所以听到一个系统「最终一致」时，还应追问：不一致窗口有多大？冲突怎样解决？客户端可能看到哪些异常？

<sub>考点：BASE与最终一致性　｜　出处：Vogels, Eventually Consistent (Communications of the ACM, 2009)</sub>

</details>

---

<a name="CS-DIST-010"></a>

### CS-DIST-010　进阶 · 考频 ★★

Raft 选举中，候选人 A 的最后一条日志是（任期 2，索引 9），投票者 B 的最后一条日志是（任期 3，索引 7）。因为 A 的日志更长，B 会认为 A 的日志「至少和自己一样新」，在本任期还没投过票的情况下把票投给 A。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。Raft 比较日志新旧时先比**最后一条日志的任期**，任期大的更新；只有最后一条的任期相同时，才比日志长度。B 的最后任期是 3，大于 A 的 2，所以 B 的日志更新，B 会拒绝投票。

**为什么这样设计**：任期 3 的那条日志可能已经提交（复制到了多数节点）。如果只看长度，A 可能当选，而 A 的日志中没有这条已提交的日志，就会把它覆盖掉，违反「已提交的日志永不丢失」。A 在索引 8、9 处多出来的条目来自更早的任期 2，很可能是旧 Leader 没来得及提交的日志，再长也说明不了什么。

**为什么能保证安全**：已提交的日志存在于多数节点上，候选人当选需要多数票，两个多数派至少有一个公共节点；这个节点只会投票给日志不比自己旧的候选人，所以当选者一定包含全部已提交的日志（Leader 完整性）。

<sub>考点：Raft选举　｜　出处：Ongaro & Ousterhout, In Search of an Understandable Consensus Algorithm, §5.4.1, https://raft.github.io/raft.pdf</sub>

</details>

---

<a name="CS-DIST-026"></a>

### CS-DIST-026　基础 · 考频 ★★

WordCount 中的 Reduce（对计数求和）可以直接复用为 Combiner。同理，计算每个 key 的平均值时，也可以把「求平均」的 Reduce 直接复用为 Combiner，先在 Map 端求局部平均，以减少 Shuffle 的数据量。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。Combiner 的输出还会交给 Reduce 再处理一次，所以只有满足交换律和结合律的聚合（求和、计数、最大值、最小值）才能直接把 Reduce 复用为 Combiner。平均值不满足：一个 Map 任务上的值为 1、2，另一个上为 3，局部平均为 1.5 和 3，再求平均得 2.25，而真实的平均值是 2。

**正确做法**：让 Map 和 Combiner 输出（和, 个数）二元组，Combiner 分别累加两个分量，Reduce 最后做一次除法。

**原则**：MapReduce 论文指出，Combiner 用于 Reduce 函数满足交换律和结合律的场合；Hadoop 的文档也说明 Combiner 可能被执行零次、一次或多次。所以 Combiner 必须是「可有可无」的优化，执行与否、执行几次都不能改变最终结果。

<sub>考点：MapReduce　｜　出处：Dean & Ghemawat, MapReduce: Simplified Data Processing on Large Clusters (OSDI 2004), §4.3</sub>

</details>

---

## 填空题

<a name="CS-DIST-017"></a>

### CS-DIST-017　进阶 · 考频 ★★★

用取模哈希 `hash(key) % N` 把大量 key 均匀地分到 N 台缓存节点上（哈希值可视为均匀分布）。集群从 10 台扩到 11 台时，约有 ____% 的 key 需要换节点（保留一位小数）；改用一致性哈希（虚拟节点足够多、负载均匀）时，理想情况下约有 ____% 的 key 需要迁移（保留一位小数），而且这些 key 全部迁往 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 90.9 / 90.9%；(2) 9.1 / 9.1%；(3) 新加入的节点 / 新节点 / 新增的节点 / 第 11 台节点

**解析：**

**取模哈希**：一个 key 不需要迁移，当且仅当 $h\bmod10=h\bmod11$。对每个余数 $r\in[0,9]$，同时满足 $h\equiv r\pmod{10}$ 与 $h\equiv r\pmod{11}$ 的 $h$ 在每连续 110 个数中恰好出现一次（中国剩余定理），所以每 110 个哈希值中只有 10 个不动，迁移比例为 $10/11\approx90.9\%$。一般地，N 台扩到 N + 1 台要迁移 $N/(N+1)$ 的 key；一个模拟实验中，4 台扩到 5 台迁移了 80%，正好是 4/5。

**一致性哈希**：新节点在环上接管若干段区间，负载均匀时它分到总量的 $1/11\approx9.1\%$。只有落在这些区间里的 key 需要迁移，而且都迁往新节点，原有节点之间不互相搬数据。缩容时同理，只有下线节点上的 key 迁往环上的后继节点。

**工程意义**：缓存集群若用取模哈希，扩容一台机器几乎会让所有 key 失效，大量请求瞬间穿透到后端数据库；一致性哈希把影响限制在约 $1/(N+1)$。

<sub>考点：一致性哈希　｜　出处：Karger et al., Consistent Hashing and Random Trees (STOC 1997)</sub>

</details>

---

## 计算题

<a name="CS-DIST-004"></a>

### CS-DIST-004　进阶 · 考频 ★★

某 Dynamo 风格的存储为每个 key 保存 N = 5 个副本：写入要等 W 个副本确认才算成功，读取要等 R 个副本响应，再取其中版本最新的值。

(1) 要保证读写的副本集合一定有交集（R + W > N），W = 3 时 R 至少取多少？此时写、读各自最多能容忍几个副本不可用？
(2) 为了让写入延迟最低而取 W = 1，R 要取多少才能保证读写有交集？代价是什么？
(3) 若 N = 3、W = 2、R = 1，读一定能读到最近一次成功的写入吗？

<details>
<summary>答案与解析</summary>

**答案：(1) R ≥ 3，写、读各能容忍 2 个副本不可用；(2) R = 5，读取不能容忍任何副本不可用，读延迟取决于最慢的副本；(3) 不能保证，因为 R + W = N，读到的副本可能恰好不在写入集合中**

**解析：**

**原理**：W 个副本上有新值，R 个副本被读到。若 $R+W>N$，两个集合至少共享一个副本，读结果中就一定包含最新的值（按版本号取最新）。

**(1)** $R>N-W=2$，最小取 R = 3。写入只要 3 个副本确认，最多容忍 $N-W=2$ 个不可用；读取只要 3 个副本响应，同样最多容忍 $N-R=2$ 个不可用。

**(2)** $R>5-1=4$，R = 5，要读全部副本：任何一个副本故障，读就失败；任何一个副本变慢，读就变慢。这是把代价从写转移到了读，只适合写多读少的场景。常见的折中是 N = 3、W = 2、R = 2。

**(3)** $R+W=3=N$，两个集合可能不相交：写入落在副本 1、2，读取恰好只读到副本 3，读到旧值。

**注意**：即使 $R+W>N$，也不等于线性一致。例如 Dynamo 为提高可用性采用「宽松仲裁」（sloppy quorum），故障时把写入临时交给环上的其他节点暂存（hinted handoff），读写集合可能不相交；此外还有并发写入、部分副本写入失败却没有回滚、依赖时钟的「最后写入者胜」等边界情况。

<sub>考点：BASE与最终一致性、一致性模型　｜　出处：DeCandia et al., Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)</sub>

</details>

---

<a name="CS-DIST-007"></a>

### CS-DIST-007　进阶 · 考频 ★★

三个进程 P1、P2、P3 使用 Lamport 逻辑时钟，初值都为 0。规则：每发生一个本地事件或发送事件，时钟先加 1，消息携带发送事件的时间戳；接收消息时，时钟置为 max(本地时钟, 消息时间戳) + 1。各进程的事件依次为：

- P1：a 本地事件；b 向 P2 发送 m1；c 本地事件；d 接收 m3
- P2：e 接收 m1；f 向 P3 发送 m2；g 本地事件
- P3：h 本地事件；i 本地事件；j 接收 m2；k 向 P1 发送 m3

(1) 求 b、e、j、d 的时间戳。
(2) C(c) < C(j)，能否据此断定 c 发生在 j 之前（c → j）？
(3) 要按时间戳把所有事件排成全序时，时间戳相同的 g 和 j 谁在前？

<details>
<summary>答案与解析</summary>

**答案：(1) b = 2，e = 3，j = 5，d = 7；(2) 不能，c 与 j 之间没有因果链，二者是并发的；(3) 按（时间戳, 进程编号）排序，g（5, P2）排在 j（5, P3）之前**

**解析：**

**(1) 逐个计算**
- P1：a = 1，b = 2（m1 携带 2），c = 3；
- P2：e = max(0, 2) + 1 = 3，f = 4（m2 携带 4），g = 5；
- P3：h = 1，i = 2，j = max(2, 4) + 1 = 5，k = 6（m3 携带 6）；
- P1：d = max(3, 6) + 1 = 7。

**(2)** Lamport 时钟只保证「若 x → y，则 C(x) < C(y)」，反过来不成立。c 之后、收到 m3 之前，P1 没有再向别的进程发消息，所以从 c 到 j 不存在由「进程内先后」和「消息收发」连成的因果链，c 与 j 是并发的，C(c) = 3 < C(j) = 5 只是巧合。判断因果关系需要向量时钟：c 的向量时钟为 [3, 0, 0]，j 为 [2, 2, 3]，互不小于等于，说明并发。

**(3)** 有因果关系的事件时间戳一定不同，所以时间戳相同的事件必然并发，可以用进程编号打破平局，得到一个与因果顺序一致的全序。Lamport 正是用这种全序实现了分布式互斥。

**工程意义**：不同机器的物理时钟有偏差，不能靠时间戳判断事件的先后；需要因果顺序时用逻辑时钟或向量时钟。Raft 的任期也可以看作一种逻辑时钟。

<sub>考点：一致性模型　｜　出处：Lamport, Time, Clocks, and the Ordering of Events in a Distributed System (Communications of the ACM, 1978)</sub>

</details>

---

<a name="CS-DIST-014"></a>

### CS-DIST-014　挑战 · 考频 ★★

5 节点的 Raft 集群，Leader 的当前任期为 5，日志中索引 1～8 的条目任期依次为：1, 1, 2, 4, 4, 5, 5, 5。Leader 记录的各 Follower 的 matchIndex 为：S2 = 8，S3 = 5，S4 = 7，S5 = 3（Leader 自己视为已复制到 8），当前 commitIndex = 3。

(1) Leader 可以把 commitIndex 推进到多少？
(2) 若 S4 的 matchIndex 只有 5（其他不变），commitIndex 是多少？索引 4、5 已经复制到多数节点，为什么不能提交？

<details>
<summary>答案与解析</summary>

**答案：(1) 7；(2) 仍为 3。索引 4、5 是任期 4 的日志，不能靠复制数提交，要等任期 5 的某条日志复制到多数节点后才被间接提交**

**解析：**

**规则**（Raft 论文图 2）：若存在 N > commitIndex，多数节点的 matchIndex ≥ N，且 log[N] 的任期等于当前任期，则令 commitIndex = N，取满足条件的最大 N。

**(1)** 五个节点的复制进度为 {8, 8, 5, 7, 3}，多数为 3 个。
- N = 8：只有 2 个节点 ≥ 8，不够；
- N = 7：有 3 个节点 ≥ 7（Leader、S2、S4），且 log[7] 的任期为 5，等于当前任期，可以提交。

所以 commitIndex = 7，索引 4～7 一起提交（其中 4、5 是间接提交）。

**(2)** 进度为 {8, 8, 5, 5, 3}：
- N = 6、7、8：≥ N 的节点只有 2 个，不够；
- N = 5、4：有 4 个节点 ≥ 5，副本数过半，但 log[5]、log[4] 的任期是 4，不等于当前任期 5，不能提交。

所以 commitIndex 仍为 3。这正是「不能靠数副本提交旧任期日志」的规则：只有等索引 6 及之后的任期 5 日志复制到多数节点，4、5 才会随之提交。

**速算**：把所有节点的 matchIndex 降序排列，第 3 个（多数派的最后一个）值 M 就是已复制到多数节点的最大索引。若 log[M] 的任期等于当前任期，就推进到 M；否则不推进，因为日志中的任期单调不减，比 M 小的索引任期只会更小。

<sub>考点：Raft日志复制　｜　出处：Ongaro & Ousterhout, In Search of an Understandable Consensus Algorithm, Figure 2, https://raft.github.io/raft.pdf</sub>

</details>

---

## 代码输出题

<a name="CS-DIST-011"></a>

### CS-DIST-011　进阶 · 考频 ★★

下面是 Raft 投票者处理 RequestVote 请求的简化逻辑（省略了重置选举计时器与持久化）。同一个投票者依次收到 6 个请求，输出是什么？

```python
def handle_request_vote(state, req):
    """state：投票者的 current_term、voted_for、last_log=(任期, 索引)
    req：候选人的 term、candidate、last_log。返回 (是否投票, 处理后的任期)"""
    if req["term"] < state["current_term"]:
        return False, state["current_term"]
    if req["term"] > state["current_term"]:              # 见到更大的任期：更新任期、清空投票
        state["current_term"], state["voted_for"] = req["term"], None
    up_to_date = req["last_log"] >= state["last_log"]     # 元组比较：先比任期，再比索引
    if state["voted_for"] in (None, req["candidate"]) and up_to_date:
        state["voted_for"] = req["candidate"]
        return True, state["current_term"]
    return False, state["current_term"]

s = {"current_term": 5, "voted_for": None, "last_log": (4, 10)}
for term, cand, last in [(5, "B", (4, 9)), (5, "C", (4, 10)), (5, "D", (5, 1)),
                         (4, "E", (9, 99)), (6, "D", (5, 1)), (6, "C", (5, 2))]:
    ok, t = handle_request_vote(s, {"term": term, "candidate": cand, "last_log": last})
    print(cand, ok, t)
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
B False 5
C True 5
D False 5
E False 5
D True 6
C False 6
```

**解析：**

投票者的初始状态：任期 5、尚未投票、最后一条日志为（4, 10）。逐个分析：
1. B：任期相同；B 的最后日志（4, 9）比（4, 10）短，不够新，拒绝；
2. C：（4, 10）与自己相同，算「至少一样新」，且本任期还没投票，投给 C，`voted_for` 记为 C；
3. D：最后日志（5, 1）的任期更大，比自己新，但本任期已经投给了 C，拒绝。**每个任期只投一票**；
4. E：任期 4 小于 5，是过时的请求，无论日志多新都直接拒绝；
5. D（任期 6）：任期更大，投票者先把任期更新为 6、清空投票记录，而 D 的日志足够新，投票；
6. C（任期 6）：任期 6 的票已经投给了 D，拒绝。

**要点**：`current_term` 和 `voted_for` 必须在回复之前持久化到磁盘。否则节点投票后崩溃重启，会忘记自己投过票，可能在同一任期再投给另一个候选人，选出两个 Leader。真实实现中，投出选票的同时还要重置自己的选举计时器。

<sub>考点：Raft选举　｜　出处：Ongaro & Ousterhout, In Search of an Understandable Consensus Algorithm, Figure 2, https://raft.github.io/raft.pdf</sub>

</details>

---

<a name="CS-DIST-027"></a>

### CS-DIST-027　进阶 · 考频 ★★

下面用几行 Python 模拟 MapReduce 的 WordCount：3 个 Map 任务、2 个 Reducer，Map 端使用 Combiner，分区函数为 `crc32(词) % R`。已知 `crc32("llm")` 为偶数，`crc32("agent")`、`crc32("rag")`、`crc32("tool")` 都为奇数。输出是什么？

```python
import zlib
from collections import Counter, defaultdict

splits = ["agent llm agent rag", "rag rag llm", "tool agent llm"]   # 3 个 Map 任务的输入
R = 2                                                              # 2 个 Reducer
plain = combined = 0
reducers = defaultdict(Counter)
for text in splits:
    pairs = [(w, 1) for w in text.split()]           # Map：每个词输出 (词, 1)
    plain += len(pairs)
    local = Counter()
    for w, c in pairs:                               # Combiner：在 Map 端先局部求和
        local[w] += c
    combined += len(local)
    for w, c in local.items():                       # Shuffle：按 crc32(词) % R 送往 Reducer
        reducers[zlib.crc32(w.encode()) % R][w] += c
print(plain, combined)
for r in sorted(reducers):
    print(r, sorted(reducers[r].items()))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
10 8
0 [('llm', 3)]
1 [('agent', 3), ('rag', 3), ('tool', 1)]
```

**解析：**

- **Map**：三个分片分别产生 4、3、3 个 (词, 1)，没有 Combiner 时要通过网络传输 10 条；
- **Combiner**：每个分片内先合并相同的词：第一个分片得到 agent×2、llm、rag 共 3 条；第二个 rag×2、llm 共 2 条；第三个 tool、agent、llm 共 3 条，合计 8 条；
- **Shuffle**：同一个词无论来自哪个 Map 任务，都由分区函数送往同一个 Reducer：llm 去 0 号，其余去 1 号；
- **Reduce**：0 号得到 llm = 1 + 1 + 1 = 3；1 号得到 agent = 2 + 1 = 3，rag = 1 + 2 = 3，tool = 1。

本例只省下 2 条，而真实语料中的高频词在每个分片里都会出现成千上万次，Combiner 能把 Shuffle 的数据量减少几个数量级。

**工程细节**：分区函数必须在所有 Map 任务上给出相同的结果，所以要用 crc32、MD5 这类稳定哈希，不能用 Python 内置的 `hash()`。热门 key 会让单个 Reducer 特别慢（数据倾斜），可以给 key 加随机前缀打散，再分两阶段聚合。

<sub>考点：MapReduce　｜　出处：Dean & Ghemawat, MapReduce: Simplified Data Processing on Large Clusters (OSDI 2004)</sub>

</details>

---

<a name="CS-DIST-030"></a>

### CS-DIST-030　进阶 · 考频 ★★

下面的代码模拟 Agent 服务处理一个请求：先把 trace_id 写进上下文变量，再用几种方式调用工具。在 CPython 3.13（默认构建）下运行，输出是什么？

```python
import asyncio
import contextvars
from concurrent.futures import ThreadPoolExecutor

trace_id = contextvars.ContextVar("trace_id", default="-")
pool = ThreadPoolExecutor(max_workers=1)

def tool_call(name):                       # 在工作线程中执行的同步工具
    return f"{name}:{trace_id.get()}"

async def child():
    seen = trace_id.get()
    trace_id.set("t-child")                # 只修改这个任务自己的上下文副本
    return seen

async def handle(req_id):
    trace_id.set(f"t-{req_id}")
    loop = asyncio.get_running_loop()
    a = await loop.run_in_executor(pool, tool_call, "search")
    b = await asyncio.to_thread(tool_call, "calc")
    c = await loop.run_in_executor(pool, contextvars.copy_context().run, tool_call, "fetch")
    d = await asyncio.create_task(child())
    print([a, b, c, d, trace_id.get()])

asyncio.run(handle(7))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
['search:-', 'calc:t-7', 'fetch:t-7', 't-7', 't-7']
```

**解析：**

`contextvars` 为每个执行上下文保存一份变量值。asyncio 的每个任务都运行在自己的上下文中，创建任务时会复制当前上下文。

- a：`loop.run_in_executor` 只是把函数交给线程池执行，**不会**传递上下文。工作线程有自己的上下文，`trace_id` 取默认值 `"-"`，这次工具调用的日志与 trace 断开了；
- b：`asyncio.to_thread` 会把当前上下文复制给工作线程（文档明确说明），所以能读到 `t-7`；
- c：用 `contextvars.copy_context().run` 包装函数，它在线程里运行于复制来的上下文中，同样能读到；
- d：`create_task` 创建子任务时复制了当前上下文，子任务读到 `t-7`；子任务中的 `set("t-child")` 只修改了它自己的副本；
- 最后一项：父任务里的 `trace_id` 仍是 `t-7`，没有被子任务改掉。

**结论**：跨线程时上下文不会自动传递，要么用 `asyncio.to_thread`，要么显式地用 `copy_context().run`。OpenTelemetry 的 Python SDK 同样用 contextvars 保存当前 span，所以这条规则直接决定了 trace 会不会「断链」。跨进程、跨服务时，则要把 trace 上下文写进请求头（W3C 的 `traceparent`）或消息头。

**版本差异**：Python 3.14 增加了 `sys.flags.thread_inherit_context` 标志，自由线程（free-threaded）构建默认开启，新线程会复制启动它时的上下文。线程池的工作线程是在提交任务时按需创建的，复制的是创建那一刻的上下文，之后一直沿用，可能把第一个请求的 trace_id 带进后续的请求。所以无论哪个版本，都应显式传递上下文。

<sub>考点：分布式追踪　｜　出处：Python 文档：contextvars 与 asyncio.to_thread，https://docs.python.org/3/library/asyncio-task.html#asyncio.to_thread；Python 3.14 命令行文档 -X thread_inherit_context，https://docs.python.org/3/using/cmdline.html</sub>

</details>

---

## 代码改错题

<a name="CS-DIST-028"></a>

### CS-DIST-028　进阶 · 考频 ★★★

下面是基于 Redis 的分布式锁，其中 `FakeRedis` 在单进程内模拟了用到的几条 Redis 命令（它本身没有问题）。线上偶尔出现两个 Worker 同时执行同一个任务的情况。请找出 `RedisLock` 中的 bug 并修正。

```python
import uuid


class FakeRedis:
    """只模拟本题用到的命令；now 是可以手动推进的时钟（秒）"""
    def __init__(self):
        self.data, self.now = {}, 0.0

    def _alive(self, key):
        v = self.data.get(key)
        if v is not None and v[1] <= self.now:       # 已过期：惰性删除
            del self.data[key]
            v = None
        return v

    def set_nx_px(self, key, value, ttl):             # 相当于 SET key value NX PX ttl
        if self._alive(key):
            return False
        self.data[key] = (value, self.now + ttl)
        return True

    def get(self, key):
        v = self._alive(key)
        return v[0] if v else None

    def delete(self, key):
        self.data.pop(key, None)

    def compare_and_delete(self, key, expected):      # 相当于用 Lua 脚本原子地「比较后删除」
        v = self._alive(key)
        if v and v[0] == expected:
            del self.data[key]
            return True
        return False


class RedisLock:
    def __init__(self, redis, key, ttl):
        self.redis, self.key, self.ttl = redis, key, ttl
        self.token = str(uuid.uuid4())                # 每个持锁者独有的随机值

    def acquire(self):
        return self.redis.set_nx_px(self.key, self.token, self.ttl)

    def release(self):
        self.redis.delete(self.key)
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：`release` 直接删除 key，没有确认锁是否还属于自己。A 的执行时间超过了 TTL，锁已自动过期并被 B 获得；A 结束后调用 `release`，删掉的其实是 B 的锁，C 随即也能加锁成功，B、C 同时持锁，同一个任务被执行两次。

**修正**：释放时检查锁的值是否等于自己加锁时写入的随机 token，并且「比较 + 删除」必须是一个原子操作（Redis 中用 Lua 脚本实现；Redis 8.4 起也可以用 `DELEX key IFEQ token`）：

```python
def release(self):
    return self.redis.compare_and_delete(self.key, self.token)
```

注意不能写成「先 `get` 比较、再 `delete`」两步：两步之间锁可能恰好过期并被别人获得，仍然会误删。

**修正后的代码：**

```python
import uuid


class FakeRedis:
    """只模拟本题用到的命令；now 是可以手动推进的时钟（秒）"""
    def __init__(self):
        self.data, self.now = {}, 0.0

    def _alive(self, key):
        v = self.data.get(key)
        if v is not None and v[1] <= self.now:       # 已过期：惰性删除
            del self.data[key]
            v = None
        return v

    def set_nx_px(self, key, value, ttl):             # 相当于 SET key value NX PX ttl
        if self._alive(key):
            return False
        self.data[key] = (value, self.now + ttl)
        return True

    def get(self, key):
        v = self._alive(key)
        return v[0] if v else None

    def delete(self, key):
        self.data.pop(key, None)

    def compare_and_delete(self, key, expected):      # 相当于用 Lua 脚本原子地「比较后删除」
        v = self._alive(key)
        if v and v[0] == expected:
            del self.data[key]
            return True
        return False


class RedisLock:
    def __init__(self, redis, key, ttl):
        self.redis, self.key, self.ttl = redis, key, ttl
        self.token = str(uuid.uuid4())                # 每个持锁者独有的随机值

    def acquire(self):
        return self.redis.set_nx_px(self.key, self.token, self.ttl)

    def release(self):
        return self.redis.compare_and_delete(self.key, self.token)
```

**解析：**

加锁用的 `SET key token NX PX ttl` 是原子的：只在 key 不存在时写入，同时设置过期时间，防止持锁者崩溃后锁永远不被释放。随机 token 相当于给锁签了名，只有签名匹配才能释放。

但即使释放写对了，**锁过期本身**仍可能让两个客户端「同时认为自己持锁」：A 在长时间的 GC 停顿后醒来，并不知道锁已过期，还会继续操作共享资源。因此：
- 任务可能超过 TTL 时，持锁者要在执行过程中定期续期（同样要校验 token）；
- 对正确性要求高的场景，在锁之外再加围栏令牌（fencing token）：每次加锁拿到一个单调递增的编号，存储端拒绝编号更小的写入；
- Redis 主从切换时，锁可能因异步复制而丢失（Redis 官方文档明确指出了这一点），对正确性要求极高的锁应使用 etcd、ZooKeeper 这类基于共识协议的服务。

<sub>考点：分布式锁　｜　出处：Redis 文档：Distributed Locks with Redis，https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/</sub>

</details>

---

## 编程题

<a name="CS-DIST-018"></a>

### CS-DIST-018　进阶 · 考频 ★★

实现带虚拟节点的一致性哈希环，并支持为 key 选出多个副本节点（类似 Dynamo 的偏好列表）：

```python
import hashlib

def h(s: str) -> int:                      # 稳定哈希，必须使用这个函数
    return int.from_bytes(hashlib.md5(s.encode()).digest()[:8], "big")

class HashRing:
    def __init__(self, nodes=(), vnodes: int = 100): ...
    def add(self, node: str) -> None: ...
    def remove(self, node: str) -> None: ...
    def lookup(self, key: str, n: int = 1) -> list[str]: ...
```

- 每个物理节点 `node` 在环上放置 `vnodes` 个虚拟节点，位置为 `h(f"{node}#{i}")`，i 取 0 到 vnodes − 1；
- `lookup`：从位置 `h(key)` 出发，顺时针找到第一个位置**大于** `h(key)` 的虚拟节点（越过最大位置就回到开头），它所属的物理节点是第一个副本；继续顺时针走，跳过已选中的物理节点，直到选出 n 个不同的物理节点。n 超过物理节点数时返回全部物理节点；环为空时返回空列表；
- 重复添加同一个节点抛出 `ValueError`，删除不存在的节点抛出 `KeyError`；
- 查找第一个副本的时间为 O(log V)，V 为虚拟节点总数。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import bisect
import hashlib


def h(s: str) -> int:
    return int.from_bytes(hashlib.md5(s.encode()).digest()[:8], "big")


class HashRing:
    def __init__(self, nodes=(), vnodes: int = 100):
        self.vnodes = vnodes
        self.ring = []                         # 排好序的虚拟节点位置
        self.owner = {}                        # 位置 -> 物理节点
        self.nodes = set()
        for node in nodes:
            self.add(node)

    def add(self, node: str) -> None:
        if node in self.nodes:
            raise ValueError(f"节点已存在：{node}")
        self.nodes.add(node)
        for i in range(self.vnodes):
            pos = h(f"{node}#{i}")
            bisect.insort(self.ring, pos)
            self.owner[pos] = node

    def remove(self, node: str) -> None:
        self.nodes.remove(node)                # 节点不存在时抛出 KeyError
        for i in range(self.vnodes):
            pos = h(f"{node}#{i}")
            self.ring.pop(bisect.bisect_left(self.ring, pos))
            del self.owner[pos]

    def lookup(self, key: str, n: int = 1) -> list[str]:
        if not self.ring:
            return []
        n = min(n, len(self.nodes))
        i = bisect.bisect_right(self.ring, h(key))   # 第一个位置大于 h(key) 的虚拟节点
        out = []
        while len(out) < n:                    # 继续顺时针走，跳过已选中的物理节点
            node = self.owner[self.ring[i % len(self.ring)]]
            if node not in out:
                out.append(node)
            i += 1
        return out
```

**测试用例：**

```python
from collections import Counter

def oracle(nodes, vnodes, key, n):             # 暴力：把所有虚拟节点排序后顺时针扫描
    pts = sorted((h(f"{x}#{i}"), x) for x in nodes for i in range(vnodes))
    hk = h(key)
    start = next((j for j, (p, _) in enumerate(pts) if p > hk), 0)
    out = []
    for j in range(len(pts)):
        x = pts[(start + j) % len(pts)][1]
        if x not in out:
            out.append(x)
    return out[:n]

nodes = ["gpu-a", "gpu-b", "gpu-c", "gpu-d"]
ring = HashRing(nodes, vnodes=50)
keys = [f"session:{i}" for i in range(3000)]
for k in keys[:300]:
    for n in (1, 2, 3, 4, 6):
        assert ring.lookup(k, n) == oracle(nodes, 50, k, n)
assert HashRing().lookup("x") == []
assert len(ring.lookup("x", 10)) == 4

before = {k: ring.lookup(k, 3) for k in keys}
ring.add("gpu-e")
after = {k: ring.lookup(k, 3) for k in keys}
moved = [k for k in keys if before[k][0] != after[k][0]]
assert all(after[k][0] == "gpu-e" for k in moved)         # 主节点变化的 key 都去了新节点
assert 0.1 < len(moved) / len(keys) < 0.3                  # 理想值为 1/5
for k in keys:                                             # 去掉新节点后，副本顺序与扩容前一致
    rest = [x for x in after[k] if x != "gpu-e"]
    assert rest == before[k][:len(rest)]
ring.remove("gpu-e")
assert all(ring.lookup(k, 3) == before[k] for k in keys)   # 缩容后映射完全复原

for bad, exc in ((lambda: ring.add("gpu-a"), ValueError), (lambda: ring.remove("gpu-x"), KeyError)):
    try:
        bad()
        raise AssertionError("应抛出异常")
    except exc:
        pass

def spread(vnodes):                                        # 最忙节点负载 / 平均负载
    r = HashRing(nodes + ["gpu-e"], vnodes=vnodes)
    cnt = Counter(r.lookup(f"k{i}")[0] for i in range(20000))
    return max(cnt.values()) / (20000 / 5)
assert spread(200) < 1.3 and spread(200) < spread(1)
```

**解析：**

**思路**：
1. 环用一个有序列表保存所有虚拟节点的位置，再用字典记录「位置 → 物理节点」；
2. 查找时用 `bisect_right` 二分出第一个大于 `h(key)` 的位置，下标越界时对环长取模，回到开头；
3. 需要多个副本时继续顺时针走，跳过重复的物理节点。每个物理节点有很多虚拟节点，相邻的几个位置常常属于同一台机器，必须去重，否则多个「副本」会落在同一台机器上，失去容灾的意义。

**为什么必须用稳定哈希**：Python 内置的 `hash()` 对字符串加了随机盐，不同进程、每次重启的结果都不同，各个客户端会算出不同的环。

**测试验证的性质**：
- 扩容只影响新节点：主节点发生变化的 key 全部迁往新节点；
- 副本列表稳定：去掉新节点后，其余副本的顺序与扩容前一致，所以扩容最多让每个 key 的副本集合换掉一个节点；
- 缩容后映射完全复原；虚拟节点越多，负载越均匀。

**复杂度**：查找主节点 O(log V)。用有序列表实现时，添加一个物理节点要插入 vnodes 个位置，每次插入 O(V)；可以换成平衡树或跳表，降到 O(log V)。

<sub>考点：一致性哈希　｜　出处：DeCandia et al., Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)</sub>

</details>

---

## 简答题

<a name="CS-DIST-016"></a>

### CS-DIST-016　进阶 · 考频 ★★

Raft 常被认为比 Paxos 更容易理解和实现。请从问题分解、Leader 的角色、日志的组织方式三个角度比较二者；再说明 Basic Paxos 的「活锁」是怎样发生的，工程上如何避免。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **问题分解**：Raft 把共识拆成领导选举、日志复制、安全性三个相对独立的子问题（另有成员变更、日志压缩），每个子问题都有明确的规则和对应的 RPC（RequestVote、AppendEntries）。Basic Paxos 只解决「对单个值达成一致」，要实现复制日志需要 Multi-Paxos，而 Multi-Paxos 的许多工程细节在原始论文中没有完整给出，各家实现差异很大。
2. **Leader 的角色**：Raft 是强 Leader 模型，所有写入都经过 Leader，日志只从 Leader 流向 Follower；选举时要求候选人的日志足够新，新 Leader 不需要再从别的节点补齐已提交的日志。Basic Paxos 中任何提案者都可以发起提案，Multi-Paxos 才引入一个固定的提案者（Leader）作为优化。
3. **日志的组织**：Raft 的日志连续、不留空洞，条目保留创建时的任期号，利用日志匹配性质只需比较「前一条的索引和任期」就能检查一致性。Multi-Paxos 允许每个日志槽位独立决议，可能出现空洞，需要额外的机制填补。
4. **活锁**：两个提案者交替用更大的编号发起 prepare：p 完成第一阶段后，q 用更大的编号完成第一阶段，接受者承诺不再接受 p 的编号，p 的 accept 被拒；p 再用更大的编号重来，又让 q 的 accept 失败……如此循环，可能永远选不出值。**避免方法**：选出唯一的「主提案者」（Leader）负责提案；选主本身依赖随机化超时或退避（FLP 不可能性结果表明，异步系统中要保证进展就必须借助随机性或超时）。Raft 用随机化的选举超时解决选票被瓜分的问题，本质相同。
5. **共同点**：二者都依赖「任意两个多数派必有交集」，安全性不依赖时钟，只有活性依赖超时。

**评分要点（共 10 分）：**

- 说明 Raft 把问题拆成选举、复制、安全等子问题，而 Basic Paxos 只决定单个值、Multi-Paxos 细节缺失（2 分）
- 对比强 Leader 与任意提案者，指出日志只从 Leader 流向 Follower（2 分）
- 对比 Raft 日志连续无空洞与 Multi-Paxos 按槽位独立决议（2 分）
- 讲清活锁的成因（编号交替抢占）以及通过选主、随机化超时来避免（3 分）
- 指出二者都依赖多数派交集，安全性不依赖时钟（1 分）

**讲解：**

**常见失分点**：把活锁说成死锁或脑裂；认为 Paxos 不能实现日志复制；以为 Raft 不需要多数派或者靠时钟保证安全；只会说「Raft 更简单」，讲不出简单在哪里。高分回答应能落到具体机制上：Raft 通过选举限制保证新 Leader 天然包含全部已提交日志，省去了 Paxos 中提案者在第一阶段「学习」已接受值的复杂度。

<sub>考点：Paxos直觉、Raft选举、Raft日志复制　｜　出处：Ongaro & Ousterhout, In Search of an Understandable Consensus Algorithm, https://raft.github.io/raft.pdf；Lamport, Paxos Made Simple §2.4</sub>

</details>

---

<a name="CS-DIST-022"></a>

### CS-DIST-022　挑战 · 考频 ★★

TCC 模式落地时常遇到「幂等」「空回滚」「悬挂」三个问题。请分别说明它们是什么、在什么情况下出现，以及怎样处理；最后以「下单时 Try 冻结用户 100 元余额」为例说明不处理的后果。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **幂等**
   - 现象：网络超时后，事务协调者会重试二阶段的 Confirm 或 Cancel，同一个分支的二阶段可能被执行多次；
   - 处理：用「全局事务 ID + 分支 ID」作为幂等键，在事务控制表中记录分支状态（已 Try、已 Confirm、已 Cancel），重复调用时发现状态已完成就直接返回成功。
2. **空回滚**
   - 现象：Try 请求在网络中丢失或超时，参与者根本没有执行 Try，协调者却判定失败并调用了 Cancel。此时没有任何预留可以释放；
   - 处理：Cancel 先查控制表，没有 Try 记录就视为空回滚，直接返回成功，同时插入一条「已取消」的记录（用于防悬挂）。
3. **悬挂**
   - 现象：Try 请求因网络拥塞迟到，在 Cancel（空回滚）完成之后才到达参与者并执行，预留了资源，但全局事务已经结束，再也不会有 Confirm 或 Cancel 来处理它，资源被永久占住；
   - 处理：执行 Try 之前检查控制表，如果该分支已经是「已取消」，就拒绝执行 Try。
4. **实现要点**：控制表的读写与业务操作放在同一个本地事务中，并对（全局事务 ID, 分支 ID）建唯一索引，防止并发请求同时通过检查。Seata 的 TCC Fence 机制正是用事务控制表（tcc_fence_log）实现这三项防护的。
5. **不处理的后果**（Try 冻结 100 元）：
   - 不做幂等：Confirm 重试两次，余额被扣两次 100 元；
   - 不处理空回滚：Cancel 去「解冻」一笔并不存在的冻结，可能把用户的其他冻结金额错误地解冻，或因找不到记录而不断报错重试；
   - 不处理悬挂：迟到的 Try 冻结了 100 元，订单却早已取消，这 100 元永远无法解冻。

**评分要点（共 10 分）：**

- 说明幂等问题的成因（二阶段重试）与处理方法（幂等键加状态记录）（3 分）
- 说明空回滚的成因（Try 未执行就收到 Cancel）与处理方法（无 Try 记录则直接返回成功并记录）（3 分）
- 说明悬挂的成因（Try 晚于 Cancel 到达）与处理方法（Try 前检查是否已取消）（3 分）
- 提到控制表与业务操作在同一本地事务中，或给出不处理时的具体后果（1 分）

**讲解：**

**常见失分点**：把空回滚和悬挂混为一谈（空回滚是「没 Try 先 Cancel」，悬挂是「Cancel 之后又来了 Try」）；只说「加幂等」，却说不出幂等键和状态记录怎么设计；忘了控制表必须和业务操作在同一个本地事务中，否则检查与执行之间仍有并发漏洞。三个问题的根源都是网络的不确定性：请求可能丢失、重复、乱序到达。

<sub>考点：分布式事务　｜　出处：Seata 博客：Alibaba Seata Resolves Idempotence, Dangling, and Empty Rollback Issues in TCC Mode，https://seata.apache.org/blog/seata-tcc-fence/</sub>

</details>

---

## 场景分析题

<a name="CS-DIST-005"></a>

### CS-DIST-005　进阶 · 考频 ★★

某 Agent 产品把用户的长期记忆存在一主两从的数据库中，采用异步复制：写入走主库，读取随机分配到两个从库以分担压力。用户在对话中说「以后都用英文回复我」，Agent 写入记忆成功；用户紧接着发出下一句话，Agent 却仍然用中文回复。日志显示写入和读取都成功了。偶尔还有用户反映，某个设置「刷新一次出现、再刷新又消失」。请分析原因，给出几种解决方案并比较取舍。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 原因**
- 异步复制：主库写入成功后，从库要经过一段复制延迟才能看到新值；下一轮请求读从库，读到了旧值；
- 这违反了「读己之写」（read-your-writes）：用户自己刚写入的数据，自己下一次读必须能读到；
- 「刷新一次出现、再刷新又消失」违反的是「单调读」：两次读打到复制进度不同的两个从库，先读到新值、后读到旧值；
- 系统整体仍是最终一致的，复制追上之后就正常了，所以问题是间歇性的。

**2. 方案与取舍**
- **关键数据读主库**：用户记忆、权限这类「读到旧值就会出错」的数据直接读主库；或者在用户写入后的一小段时间内（如 10 秒）把他的读请求路由到主库。代价：主库压力变大，跨地域部署时延迟更高；
- **按复制位点读**：写入后返回版本号或日志位点，保存在会话里；读请求带上它，只有复制进度已经追上该位点的从库才能服务，否则等待或改读主库。代价：实现复杂，需要从库暴露复制进度；
- **会话粘滞**：同一会话固定读同一个从库，能保证单调读；但这个从库仍可能落后，单独使用不能保证读己之写；
- **在应用层直接使用刚写入的值**：Agent 写入记忆后，同时把它放进当前会话的状态，下一轮直接从会话状态读取，绕开复制延迟。对 Agent 场景最简单有效，但要处理会话状态与数据库之间的一致；
- **同步复制或仲裁读写**：写入等从库确认（同步或半同步复制），或使用 $R+W>N$ 的仲裁读写。代价是写延迟增加、可用性下降。

**3. 验证与监控**：监控从库的复制延迟；在测试环境注入复制延迟，复现「写后立即读」的场景，确认修复有效。

**评分要点（共 10 分）：**

- 指出异步复制延迟导致从库读到旧值（2 分）
- 点明违反了读己之写，并识别出「时有时无」是违反单调读（2 分）
- 给出至少三种方案，如读主、按复制位点读、会话粘滞、应用层会话状态、同步复制或仲裁读写（4 分）
- 说明各方案的代价，或给出监控与验证方法（2 分）

**讲解：**

**常见失分点**：把问题归咎于「数据库写入失败」或「缓存没刷新」，没有想到主从复制延迟；只说「改成强一致」，说不出具体做法与代价；混淆会话粘滞与读己之写（粘滞只保证单调读）。这类题的关键是把现象对应到具体的一致性保证，再按「哪些数据需要哪种保证」分级处理，而不是全部改成强一致。

<sub>考点：一致性模型、BASE与最终一致性</sub>

</details>

---

<a name="CS-DIST-025"></a>

### CS-DIST-025　进阶 · 考频 ★★★

某 Agent 平台用 Kafka 分发「文档解析 + 摘要」任务：topic 有 12 个分区，消费者组有 12 个实例，每个实例内部用 asyncio 同时处理 20 条消息，每条消息要调用一次大模型（平均 3 秒）。某天上游批量导入，生产速率从平时的每秒 50 条涨到每秒 400 条，持续了两个小时，积压（lag）超过 200 万条且仍在增长。监控还显示，其中一个分区的位点已经一个小时没有前进。请分析原因，并给出短期止血和长期改进方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 容量分析**：消费能力约为 12 × 20 ÷ 3 s = 80 条/秒，平时 50 条/秒够用；高峰时每秒净增约 400 − 80 = 320 条，两小时积压约 230 万条，与监控吻合。

**2. 某个分区不前进的常见原因**
- 毒消息：某条消息（如超大文档、格式异常）每次处理都失败或超时，被不断重试，后面的消息全被堵住（队头阻塞）；
- 两次 poll 之间的处理时间超过 `max.poll.interval.ms`：消费者被判定失联、踢出消费组，触发反复的重平衡，分区在实例之间来回漂移；
- 实例本身卡死（死锁、连接池耗尽），或被某个热点 key 拖慢。
排查时看该分区所属实例的日志、重平衡记录，以及卡住位置上的那条消息。

**3. 短期止血**
- 处理毒消息：重试若干次后写入死信队列并跳过，让位点继续前进；
- 提高消费能力：实例数已经等于分区数，再加实例没有用；可以提高实例内的并发度，但先确认大模型的限流额度还有余量，否则只会换来大量 429 错误；
- 转储扩分区：起一个「搬运」消费者，把积压消息快速转发到分区更多（如 96 个）的临时 topic，再用更多实例并行处理；
- 隔离与降级：把批量导入与在线请求分开（单独的 topic 或消费组），优先保障在线任务；批量任务改用更便宜、更快的模型，或推迟到低峰期处理。

**4. 长期改进**
- 按流量类型拆分 topic；按 lag 自动扩缩容，并为分区数留出余量（分区数是消费并行度的上限）；
- 生产端限流与背压：批量导入按配额匀速写入；
- 实例内并发处理时，按分区记录「已连续完成的最大位点」再提交，既能并发又不丢消息；
- 幂等消费：按任务 ID 去重，因为重试和重平衡都会导致重复消费；
- 监控告警：分区级 lag、单条处理耗时、死信数量、某分区位点长时间不前进。

**评分要点（共 10 分）：**

- 算出消费能力约 80 条/秒，说明积压来自生产速率远超消费能力（2 分）
- 分析分区卡住的原因：毒消息队头阻塞、超过 max.poll.interval.ms 导致重平衡、实例卡死等（2 分）
- 给出短期措施：毒消息进死信队列、在大模型限流允许范围内提高并发、转储到更多分区、隔离批量流量（3 分）
- 给出长期改进：拆分 topic、按 lag 扩缩容、生产端限流、并发消费时有序提交位点、幂等消费（2 分）
- 指出加实例受分区数限制，提高并发受大模型限流与成本约束（1 分）

**讲解：**

**常见失分点**：张口就说「加消费者」，没意识到消费者数不能超过分区数；忽略大模型的限流，盲目提高并发；跳过毒消息时直接丢弃、不留存证；并发处理时提前提交位点导致丢消息；没有区分短期止血与长期治理。好的回答会先用数字算清楚消费能力缺口，再对症下药。

<sub>考点：消息队列　｜　出处：Apache Kafka 文档：Consumer Configs，https://kafka.apache.org/41/configuration/consumer-configs/</sub>

</details>

---

<a name="CS-DIST-029"></a>

### CS-DIST-029　挑战 · 考频 ★★★

某 Agent 平台每天凌晨由定时任务给所有用户生成并发送日报。为了防止多个实例重复发送，团队用 Redis 实现了分布式锁：执行 `SET lock:daily-report <实例ID> NX PX 60000` 抢锁，抢到的实例执行任务，结束后用 `DEL` 释放锁。上线后仍出现了几次「用户收到两份日报」。排查发现：某次任务执行了 3 分钟；另有一次，Redis 主节点宕机、发生了主从切换。请分析可能导致重复发送的原因，并给出改进方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 原因分析**
- **锁过期而任务未结束**：TTL 是 60 秒，任务却跑了 3 分钟。第 60 秒锁自动过期，另一个实例抢到锁、从头开始发送，两份日报由此而来；
- **误删他人的锁**：用 `DEL` 释放时不校验持有者。第一个实例结束时删掉的是第二个实例的锁，第三个实例又能抢到，重复可能不止一次；
- **主从切换丢锁**：Redis 主从复制是异步的。锁刚写入主库、还没同步到从库时主库宕机，从库被提升为主库后没有这把锁，另一个实例就能再次抢到。Redis 官方文档明确指出基于主从切换的方案无法保证互斥；
- **进程停顿与时钟**：长时间的 GC 停顿、虚拟机暂停，会让持锁者在锁过期后「醒来」继续执行；Redis 的过期判断不基于单调时钟，服务器时间被调整也可能让锁提前失效。

**2. 改进方案**
- **续期**：持锁期间由后台线程定期延长 TTL（校验 token 后再续期）；续期失败说明锁已经丢失，任务应立即停止；
- **安全释放**：加锁时写入随机 token，释放时用 Lua 脚本原子地「比较 token 后删除」；
- **围栏令牌**：锁服务每次发放单调递增的编号，写「发送记录」时带上编号，存储端拒绝更小的编号，使过期的持锁者无法再写入；
- **对正确性要求高时换用 CP 的协调服务**：etcd 的租约、ZooKeeper 的临时顺序节点，基于共识协议，不会因主从切换丢锁（Redlock 的安全性在业界仍有争议）；
- **业务幂等兜底（最关键）**：把任务拆成「每个用户每天一份」的发送单元，用（用户 ID, 日期）建唯一约束的发送记录，发送前先原子地插入记录，插入失败说明已经发过。这样即使锁失效、两个实例同时执行，每个用户也只会收到一份。锁只用来减少重复劳动，正确性由幂等保证；
- **监控**：记录每次持锁的实例、token 和耗时，任务耗时接近 TTL 时告警。

**评分要点（共 10 分）：**

- 指出 TTL 小于任务执行时间导致锁过期、被其他实例抢到（2 分）
- 指出主从异步复制在切换时会丢锁（2 分）
- 指出 DEL 不校验持有者会误删他人的锁，或提到 GC 停顿、时钟问题（1 分）
- 给出续期与校验 token 的原子释放（2 分）
- 提出围栏令牌或改用 etcd、ZooKeeper 等基于共识的服务（1 分）
- 提出以业务幂等（如用户加日期的唯一约束）作为最终保障（2 分）

**讲解：**

**常见失分点**：只想到「把 TTL 调大」，没意识到 TTL 调多大都可能被更长的停顿超过；不知道主从切换会丢锁；把分布式锁当成正确性的唯一保障，没有在业务层做幂等。面试中的高分思路是：锁负责「效率」（尽量避免重复劳动），幂等负责「正确性」（重复执行也不出错），对正确性要求极高时再加围栏令牌或换用基于共识的协调服务。

<sub>考点：分布式锁　｜　出处：Redis 文档：Distributed Locks with Redis，https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/；Kleppmann, How to do distributed locking (2016), https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html</sub>

</details>

---
