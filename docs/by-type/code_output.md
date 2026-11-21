# 代码输出题（130 道）

| 编号 | 题目 | 难度 | 考频 |
|---|---|---|---|
| [AGT-APP-029](../AGT/APP.md#AGT-APP-029) | 下面的代码模拟视觉 Agent 点击前的命中测试（取包含该点、且层级 z 最大的元素… | 进阶 | ★★ |
| [AGT-BASE-019](../AGT/BASE.md#AGT-BASE-019) | 下面的代码模拟了一个带多种终止条件的 Agent 循环（policy(step) 代… | 进阶 | ★★ |
| [AGT-FW-007](../AGT/FW.md#AGT-FW-007) | 下面用纯 Python 模拟 LangGraph 的 reducer 合并：log … | 进阶 | ★★ |
| [AGT-FW-028](../AGT/FW.md#AGT-FW-028) | 下面模拟 AutoGen 0.4 风格的可组合终止条件：a b 表示任一满足即停，a… | 进阶 | ★★ |
| [AGT-HARNESS-008](../AGT/HARNESS.md#AGT-HARNESS-008) | 下面是一个仿 SWE-agent 的文件查看器：一次只显示 window 行，带行号… | 进阶 | ★★ |
| [AGT-MEM-037](../AGT/MEM.md#AGT-MEM-037) | 下面用链式块哈希模拟服务商的前缀缓存：每 4 个 token 为一块，每块的哈希都包… | 进阶 | ★★ |
| [AGT-MULTI-014](../AGT/MULTI.md#AGT-MULTI-014) | 下面是一个简化的共享黑板：每种条目有必填字段和唯一写者，条目只追加不覆盖，按类型分别… | 进阶 | ★★ |
| [AGT-PLAN-007](../AGT/PLAN.md#AGT-PLAN-007) | 下面实现了带提前停止的 Self-Consistency 投票（None 表示该路径… | 进阶 | ★★ |
| [AGT-PLAN-017](../AGT/PLAN.md#AGT-PLAN-017) | 下面是文本版 ReAct 解析 Action 的片段。模型这一步的输出 out 里「… | 基础 | ★★ |
| [AGT-PROMPT-022](../AGT/PROMPT.md#AGT-PROMPT-022) | 团队用 Python 的 str.format 渲染提示词模板。下面的代码输出是什么… | 进阶 | ★★ |
| [AGT-PROTO-014](../AGT/PROTO.md#AGT-PROTO-014) | 下面的代码模拟 MCP 客户端（2026-07-28 版）的读循环：客户端此前发出了… | 进阶 | ★★ |
| [AGT-REFL-022](../AGT/REFL.md#AGT-REFL-022) | 下面用确定性的假模型模拟 Reflexion：actor 只有在记忆里看到对应教训时… | 进阶 | ★★ |
| [AGT-RL-026](../AGT/RL.md#AGT-RL-026) | ExpeL 让 LLM 对比成功与失败的轨迹，用四种操作维护一个跨任务的规则库：AD… | 进阶 | ★★ |
| [AGT-TOOL-039](../AGT/TOOL.md#AGT-TOOL-039) | 下面的执行器对可重试错误（限流、5xx）重试，对确定性错误（参数校验失败）不重试。m… | 进阶 | ★★ |
| [AGT-TOOL-040](../AGT/TOOL.md#AGT-TOOL-040) | 模拟「服务端已经下单、但响应超时」的情况：第一次请求会创建订单，然后抛出超时；客户端… | 进阶 | ★★ |
| [ALN-GRPO-020](../ALN/GRPO.md#ALN-GRPO-020) | 一组两个回答：回答 0 答对、长 2 个 token；回答 1 答错、长 6 个 t… | 进阶 | ★★ |
| [ALN-PO-009](../ALN/PO.md#ALN-PO-009) | DPO 训练的第一步，策略与参考模型参数完全相同。下面的代码在这种情况下分别取 β … | 进阶 | ★★ |
| [ALN-REASON-018](../ALN/REASON.md#ALN-REASON-018) | 对同一道题采样 7 个回答，抽取出最终答案，并用奖励模型给每个回答打分。下面的代码分… | 进阶 | ★★ |
| [ALN-RL-016](../ALN/RL.md#ALN-RL-016) | 下面用 PyTorch 对一个三分类 softmax 策略做一次 REINFORCE… | 进阶 | ★★ |
| [ALN-RLHF-035](../ALN/RLHF.md#ALN-RLHF-035) | 下面的代码对一个右补齐的 batch 做优势白化：先比较「把 padding 也算进… | 进阶 | ★★ |
| [ALN-RWD-014](../ALN/RWD.md#ALN-RWD-014) | 用奖励模型做 best-of-4 选答，并加一个长度惩罚：回答超出 200 个 to… | 进阶 | ★★ |
| [ALN-RWD-019](../ALN/RWD.md#ALN-RWD-019) | 用 3 个奖励模型给 3 个候选回答打分，分别用三种方式聚合：均值、最小值（最坏情况… | 进阶 | ★★ |
| [CS-ALGO-014](../CS/ALGO.md#CS-ALGO-014) | 下面用单调栈计算：对每一天，还要再等几天 P99 时延才会出现更高的值（之后不再出现… | 进阶 | ★★ |
| [CS-ALGO-032](../CS/ALGO.md#CS-ALGO-032) | 下面的代码分别用「出堆即确定」的 Dijkstra 和 Bellman-Ford 计… | 进阶 | ★★ |
| [CS-ALGO-042](../CS/ALGO.md#CS-ALGO-042) | 下面的代码对检索结果做两次排序，再用一次元组键排序。输出是什么？（Python 的 … | 基础 | ★★ |
| [CS-DIST-011](../CS/DIST.md#CS-DIST-011) | 下面是 Raft 投票者处理 RequestVote 请求的简化逻辑（省略了重置选举… | 进阶 | ★★ |
| [CS-DIST-027](../CS/DIST.md#CS-DIST-027) | 下面用几行 Python 模拟 MapReduce 的 WordCount：3 个 … | 进阶 | ★★ |
| [CS-DIST-030](../CS/DIST.md#CS-DIST-030) | 下面的代码模拟 Agent 服务处理一个请求：先把 trace_id 写进上下文变量… | 进阶 | ★★ |
| [CS-NET-008](../CS/NET.md#CS-NET-008) | 下面的代码按 RTT 粒度模拟一个简化的 TCP Reno 拥塞窗口（单位：MSS）… | 进阶 | ★ |
| [CS-NET-009](../CS/NET.md#CS-NET-009) | TCP 是字节流：发送方的两次 send 可能被接收方一次读到，一条消息也可能被拆成… | 进阶 | ★★ |
| [CS-OS-003](../CS/OS.md#CS-OS-003) | 下面的代码先用一个线程、再用两个子进程分别执行 work。counter 是普通的全… | 基础 | ★★ |
| [CS-PY-003](../CS/PY.md#CS-PY-003) | 下面的代码中，+=、a = a + ... 和 append 交替作用在同一个名字上… | 进阶 | ★★★ |
| [CS-PY-004](../CS/PY.md#CS-PY-004) | 下面的配置字典中，两个键引用了同一个列表。分别做浅拷贝和深拷贝后再修改，输出是什么？ | 挑战 | ★★ |
| [CS-PY-007](../CS/PY.md#CS-PY-007) | 下面的函数有两个默认参数：一个调用了函数，另一个是列表。输出是什么？ | 进阶 | ★★★ |
| [CS-PY-010](../CS/PY.md#CS-PY-010) | 下面两行分别用列表推导式和生成器表达式批量创建 lambda，然后遍历并调用。输出是… | 挑战 | ★★★ |
| [CS-PY-013](../CS/PY.md#CS-PY-013) | 下面用两个带参数的装饰器修饰同一个函数，并用 log 记录各个环节的发生顺序。输出是… | 进阶 | ★★ |
| [CS-PY-017](../CS/PY.md#CS-PY-017) | 下面的代码对同一个生成器先用 in 判断，再转成列表、再求和。输出是什么？ | 进阶 | ★★★ |
| [CS-PY-018](../CS/PY.md#CS-PY-018) | 下面的外层生成器通过 yield from 委托给内层生成器，调用方用 send()… | 挑战 | ★★ |
| [CS-PY-021](../CS/PY.md#CS-PY-021) | 下面在一条 with 语句中使用了两个上下文管理器，第一个会吞掉异常。输出是什么？ | 进阶 | ★★ |
| [CS-PY-032](../CS/PY.md#CS-PY-032) | 下面的代码先用 create_task 创建一个任务，再用 gather 并发运行另… | 进阶 | ★★★ |
| [CS-PY-039](../CS/PY.md#CS-PY-039) | 下面的 Key 类按字段 v 实现了 __eq__ 与 __hash__。把它的实例… | 挑战 | ★★ |
| [CS-PY-045](../CS/PY.md#CS-PY-045) | 下面三个函数都在 try 中 return，又带有 finally。输出是什么？ | 挑战 | ★★ |
| [CS-PY-049](../CS/PY.md#CS-PY-049) | 下面的代码关闭了自动的循环垃圾回收，用弱引用观察对象是否已被回收。输出是什么？ | 进阶 | ★★ |
| [CS-SQL-001](../CS/SQL.md#CS-SQL-001) | 两张表的连接键都有重复值和 NULL。下面三条查询分别返回多少行？输出是什么？ | 进阶 | ★★★ |
| [CS-SQL-003](../CS/SQL.md#CS-SQL-003) | 下面的表中 bonus 列含有 NULL。三条聚合查询的输出是什么？ | 基础 | ★★★ |
| [CS-SQL-005](../CS/SQL.md#CS-SQL-005) | 需求是「找出从未下过单的用户」。orders 表中有一条 uid 为 NULL 的脏… | 挑战 | ★★ |
| [CS-SQL-008](../CS/SQL.md#CS-SQL-008) | 下面用窗口函数计算累计金额，第 2 天有两笔记录。注意两种累计写法的区别。输出是什么… | 挑战 | ★★ |
| [CS-SQL-020](../CS/SQL.md#CS-SQL-020) | 下面在 logs 表上建了联合索引 (user_id, day, model)，用 … | 进阶 | ★★★ |
| [CS-SQL-027](../CS/SQL.md#CS-SQL-027) | 下面的转账函数先给收款方加钱、再给付款方扣钱，余额列有 CHECK (bal = 0… | 进阶 | ★★ |
| [CS-TORCH-001](../CS/TORCH.md#CS-TORCH-001) | 下面的代码分别用 torch.from_numpy 和 torch.tensor 从… | 基础 | ★★ |
| [CS-TORCH-007](../CS/TORCH.md#CS-TORCH-007) | 下面的代码查看转置、contiguous() 以及按行、按列切片后的步长与连续性。输… | 进阶 | ★★★ |
| [CS-TORCH-011](../CS/TORCH.md#CS-TORCH-011) | 下面的计算中，一条路径经过 detach()，另一条没有；同时对中间结果 y 调用了… | 进阶 | ★★ |
| [CS-TORCH-014](../CS/TORCH.md#CS-TORCH-014) | 下面对四种计算的结果做原地修改后再反向传播。每一行输出 ok 还是 error？ | 挑战 | ★★ |
| [CS-TORCH-020](../CS/TORCH.md#CS-TORCH-020) | 下面的模块用四种方式保存了张量或子模块。输出是什么？ | 进阶 | ★★ |
| [CS-TORCH-025](../CS/TORCH.md#CS-TORCH-025) | 下面用 nn.CrossEntropyLoss 计算 3 个样本、4 个类别的损失，… | 进阶 | ★★★ |
| [CS-TORCH-036](../CS/TORCH.md#CS-TORCH-036) | 下面不需要启动分布式环境，直接给 DistributedSampler 指定副本数和… | 进阶 | ★★ |
| [CS-TORCH-043](../CS/TORCH.md#CS-TORCH-043) | 下面的代码从一个较大的张量中只取出最后一行保存。输出是什么？ | 挑战 | ★★ |
| [ENG-DESIGN-022](../ENG/DESIGN.md#ENG-DESIGN-022) | 下面的代码按意图对 100 条客服轨迹做切片统计（1 表示成功，0 表示失败）。输出… | 进阶 | ★★ |
| [ENG-OBS-005](../ENG/OBS.md#ENG-OBS-005) | 下面的代码把一条 Agent trace 的 span 按父子关系打印成树，并汇总 … | 进阶 | ★★ |
| [ENG-STAB-026](../ENG/STAB.md#ENG-STAB-026) | 下面的工作流把每次状态变化追加写入事件日志，进程崩溃重启后通过重放日志决定下一步：若… | 进阶 | ★★ |
| [ENG-STAB-035](../ENG/STAB.md#ENG-STAB-035) | 下面是一个简化的熔断器：closed 时统计最近 4 次调用，样本达到 4 次且失败… | 挑战 | ★★ |
| [EVL-AGENT-015](../EVL/AGENT.md#EVL-AGENT-015) | 下面的判分函数仿照 GAIA 官方判分脚本的规则（简化版，省略了列表答案）：标准答案… | 进阶 | ★★ |
| [EVL-AGENT-023](../EVL/AGENT.md#EVL-AGENT-023) | 某 τ-bench 风格的评测中，每个任务独立运行 4 次，每次运行记录三个检查结果… | 进阶 | ★★ |
| [EVL-LLM-009](../EVL/LLM.md#EVL-LLM-009) | 下面是一个简化的数学题判分脚本：先从回答中抽取答案（优先取 \boxed{} 中的内… | 进阶 | ★★ |
| [EVL-LLM-016](../EVL/LLM.md#EVL-LLM-016) | 三个模型循环相克：A 赢 B 三次、B 赢 C 三次、C 赢 A 三次，每个模型都是… | 进阶 | ★★ |
| [EVL-LLM-028](../EVL/LLM.md#EVL-LLM-028) | Min-K% Prob 用「一段文本中最低的 k% 个 token 对数概率的平均值… | 进阶 | ★★ |
| [FND-DL-010](../FND/DL.md#FND-DL-010) | 下面的代码用 autograd 计算 4 种激活函数在 x=-1,0,2 处的导数（… | 进阶 | ★★ |
| [FND-DL-013](../FND/DL.md#FND-DL-013) | 下面的代码让 1000 个样本通过 20 层 512\to512 的「线性层 + R… | 进阶 | ★★ |
| [FND-DL-020](../FND/DL.md#FND-DL-020) | 下面的代码对一个新建的 BatchNorm1d（默认 momentum = 0.1、… | 进阶 | ★★★ |
| [FND-DL-025](../FND/DL.md#FND-DL-025) | 下面的代码对全 1 向量分别在训练模式和推理模式下应用 Dropout(p=0.25… | 基础 | ★★ |
| [FND-DL-035](../FND/DL.md#FND-DL-035) | 下面的代码比较 F.cross_entropy 的正确用法（传入 logits）与常… | 进阶 | ★★ |
| [FND-DL-037](../FND/DL.md#FND-DL-037) | 下面的计算图中，x 被使用了两次。输出是什么？ | 进阶 | ★★★ |
| [FND-MATH-008](../FND/MATH.md#FND-MATH-008) | 下面的代码对一个 2\times2 对称矩阵反复做「乘矩阵再归一化」。输出是什么？ | 进阶 | ★ |
| [FND-MATH-024](../FND/MATH.md#FND-MATH-024) | 目标分布 p 是双峰的。下面的代码比较两个候选分布：cover 把概率摊开、覆盖两个… | 挑战 | ★★ |
| [FND-MATH-029](../FND/MATH.md#FND-MATH-029) | 下面的代码分别用朴素方法和「先减最大值」的方法计算 softmax 与 log-su… | 基础 | ★★★ |
| [FND-ML-036](../FND/ML.md#FND-ML-036) | 下面的代码在一维数据上，从两组不同的初始中心运行 K-means（K=2），输出最终… | 进阶 | ★★ |
| [FND-NLP-004](../FND/NLP.md#FND-NLP-004) | 下面的代码比较「狗咬人」与「人咬狗」在两种特征下的余弦相似度：只用 unigram … | 基础 | ★★ |
| [FND-NLP-016](../FND/NLP.md#FND-NLP-016) | 下面的代码构造了一个 2 层、双向、batch_first=True 的 LSTM。… | 进阶 | ★★ |
| [FND-NLP-040](../FND/NLP.md#FND-NLP-040) | 下面的代码把 BIO 标签序列解析成实体片段，并比较 token 级准确率与实体级的… | 进阶 | ★★ |
| [FND-OPT-003](../FND/OPT.md#FND-OPT-003) | 下面的代码用 4 种学习率对 f(x)=x^2 做 10 步梯度下降（初始 x=1）… | 基础 | ★★ |
| [FND-OPT-026](../FND/OPT.md#FND-OPT-026) | 下面是一个早停函数，返回「停止时的 epoch」与「最佳 epoch」（epoch … | 基础 | ★★ |
| [INF-BASE-034](../INF/BASE.md#INF-BASE-034) | 字节级 BPE 中，一个汉字的 UTF-8 字节可能被拆进相邻的两个 token。下… | 进阶 | ★★ |
| [INF-KERNEL-008](../INF/KERNEL.md#INF-KERNEL-008) | FlashAttention 处理因果注意力时，可以跳过整块都位于「未来」的 K、V… | 进阶 | ★ |
| [INF-KERNEL-034](../INF/KERNEL.md#INF-KERNEL-034) | 共享内存有 32 个 bank，连续的 32 位字依次落在连续的 bank 上。一个… | 进阶 | ★ |
| [INF-KV-018](../INF/KV.md#INF-KV-018) | vLLM 风格的前缀缓存中，请求结束后其块的引用计数归零，进入「可淘汰队列」（内容仍… | 进阶 | ★★ |
| [INF-KV-031](../INF/KV.md#INF-KV-031) | 下面的代码用一个玩具例子比较两种 KV 淘汰策略：H2O 式（保留最近的 token… | 进阶 | ★ |
| [INF-QUANT-029](../INF/QUANT.md#INF-QUANT-029) | 下面的代码用一组 8 个权重演示 AWQ 的缩放：下标 2 的输入通道激活很大（显著… | 挑战 | ★★ |
| [INF-SCHED-006](../INF/SCHED.md#INF-SCHED-006) | 下面的代码用最简模型比较静态批与连续批：8 个请求同时到达，batch 上限 4，每… | 进阶 | ★★ |
| [INF-SPEC-006](../INF/SPEC.md#INF-SPEC-006) | 下面的代码实现了投机采样的一轮验证（词表大小为 3，草稿长度为 2）。为了让结果确定… | 进阶 | ★★ |
| [LLM-ARCH-017](../LLM/ARCH.md#LLM-ARCH-017) | 下面的代码比较 LayerNorm 与 RMSNorm（都不带可学习参数）在输入整体… | 进阶 | ★★ |
| [LLM-ARCH-034](../LLM/ARCH.md#LLM-ARCH-034) | 下面的代码构造了一个只有 Embedding 和输出层的模型，分别在不共享、共享权重… | 进阶 | ★★ |
| [LLM-ARCH-049](../LLM/ARCH.md#LLM-ARCH-049) | Prefix LM 让前缀（如提示部分）内部双向可见，生成部分保持因果。下面的代码为… | 基础 | ★ |
| [LLM-ATTN-007](../LLM/ATTN.md#LLM-ATTN-007) | 下面的代码对全 0 的打分矩阵施加因果掩码后做 Softmax，输出是什么？ | 进阶 | ★★ |
| [LLM-ATTN-016](../LLM/ATTN.md#LLM-ATTN-016) | 带 KV Cache 的解码中，本步有 T_q=2 个新 token 作为 quer… | 进阶 | ★★ |
| [LLM-ATTN-047](../LLM/ATTN.md#LLM-ATTN-047) | 下面的代码分别用「直接求指数」和「先减去最大值」两种方式计算 Softmax。输出是… | 基础 | ★★ |
| [LLM-DEC-023](../LLM/DEC.md#LLM-DEC-023) | 下面用一张固定的 logits 表模拟模型，做贪心解码，并实现「最小生成长度」和「最… | 进阶 | ★★ |
| [LLM-DEC-029](../LLM/DEC.md#LLM-DEC-029) | 下面的代码以不同顺序做浮点加法。输出是什么？ | 基础 | ★★ |
| [LLM-MM-037](../LLM/MM.md#LLM-MM-037) | DDPM 的前向加噪过程有闭式解：x_t=\sqrt{\bar\alpha_t}\,… | 进阶 | ★★ |
| [LLM-MOE-005](../LLM/MOE.md#LLM-MOE-005) | 下面的代码对 3 个 token、4 个专家的路由 logits 做 top-2 选… | 进阶 | ★★ |
| [LLM-NEW-002](../LLM/NEW.md#LLM-NEW-002) | 下面的代码用一个标量 SSM（\bar A=0.5，\bar B=1，C=2）分别按… | 进阶 | ★★ |
| [LLM-POS-002](../LLM/POS.md#LLM-POS-002) | 下面的代码计算原始 Transformer 正弦位置编码（d=64）中不同位置之间的… | 进阶 | ★★ |
| [LLM-POS-016](../LLM/POS.md#LLM-POS-016) | 下面的代码把几个位置编号直接存成 BF16。输出是什么？这对 RoPE 的实现有什么… | 进阶 | ★★ |
| [LLM-POS-045](../LLM/POS.md#LLM-POS-045) | Qwen2.5-VL 把视频的时间位置编号与绝对时间对齐：每 temporal_pa… | 进阶 | ★ |
| [LLM-TOK-003](../LLM/TOK.md#LLM-TOK-003) | 下面的代码用同一组子词，分别按 BPE 的「按规则先后重放」和 WordPiece … | 进阶 | ★★ |
| [LLM-TOK-019](../LLM/TOK.md#LLM-TOK-019) | 下面的代码模拟分词器对特殊 token 的两种处理：allow_special=Tr… | 进阶 | ★★ |
| [LLM-TOK-022](../LLM/TOK.md#LLM-TOK-022) | 下面的代码分别模拟「从左往右每 3 位一段」（类似 cl100k_base 预切分中… | 基础 | ★★ |
| [RAG-ADV-016](../RAG/ADV.md#RAG-ADV-016) | 下面用一个玩具检索器对比「单次检索」与「迭代检索」（每一跳把新找到的证据拼进查询，作… | 进阶 | ★★ |
| [RAG-ADV-027](../RAG/ADV.md#RAG-ADV-027) | LLM 为「华东区订单的总金额」生成了 SQL q1，参考答案是人工编写的 q2。下… | 进阶 | ★★ |
| [RAG-CHUNK-010](../RAG/CHUNK.md#RAG-CHUNK-010) | 下面的代码比较两种固定长度切块的写法（块大小 4、重叠 1），输出是什么？ | 进阶 | ★★ |
| [RAG-EMB-014](../RAG/EMB.md#RAG-EMB-014) | 下面的代码对比向量未归一化与归一化时，内积、余弦、L2 距离给出的排序。输出是什么？ | 进阶 | ★★ |
| [RAG-QUERY-016](../RAG/QUERY.md#RAG-QUERY-016) | 为了缓解 Lost in the Middle，有的系统会把重排后的资料重新排列：最… | 进阶 | ★★ |
| [RAG-RETR-005](../RAG/RETR.md#RAG-RETR-005) | 下面的代码计算 BM25 的词频项（IDF 记为 1）。输出是什么？ | 进阶 | ★★★ |
| [RAG-RETR-029](../RAG/RETR.md#RAG-RETR-029) | 下面的代码分别用 ColBERT 的 MaxSim，以及「mean pooling … | 进阶 | ★★ |
| [RAG-RETR-034](../RAG/RETR.md#RAG-RETR-034) | 下面的代码用 MMR 从 4 个候选中选出 3 个，其中候选 0 与候选 1 内容几… | 进阶 | ★★ |
| [SEC-AGENT-026](../SEC/AGENT.md#SEC-AGENT-026) | 长期记忆中的每条记录都标明了直接来源 src，以及它是由哪些已有记录推断而来的 fr… | 进阶 | ★★ |
| [SEC-INJ-025](../SEC/INJ.md#SEC-INJ-025) | 某关键词过滤器在检测前先对输入做 NFKC 归一化。下面的代码分别处理一段全角字母写… | 进阶 | ★★ |
| [TRN-ADAPT-017](../TRN/ADAPT.md#TRN-ADAPT-017) | 下面的代码计算教师模型的 logits 在不同温度下的 softmax 分布。输出是… | 基础 | ★★ |
| [TRN-ADAPT-033](../TRN/ADAPT.md#TRN-ADAPT-033) | 蒸馏时，学生的表达能力往往不足以复现教师的完整分布。下面的代码用一族「单峰」分布（学… | 挑战 | ★★ |
| [TRN-DATA-038](../TRN/DATA.md#TRN-DATA-038) | 三种语言的数据量分别为英文 900B、中文 90B、斯瓦希里语 10B token。… | 进阶 | ★★ |
| [TRN-DIST-019](../TRN/DIST.md#TRN-DIST-019) | 下面的代码在单进程中模拟 2 路张量并行，用求和模拟 all-reduce。输出是什… | 进阶 | ★★ |
| [TRN-DIST-034](../TRN/DIST.md#TRN-DIST-034) | 上下文并行把一条长度为 16 的序列分给 4 张卡，先切成 8 个块（每块 2 个 … | 进阶 | ★ |
| [TRN-MEM-008](../TRN/MEM.md#TRN-MEM-008) | 下面的代码模拟 Adam 二阶矩的滑动平均更新（\beta_2=0.999，新的 g… | 进阶 | ★★ |
| [TRN-MEM-017](../TRN/MEM.md#TRN-MEM-017) | 下面的代码用 torch.finfo 查看 FP16 与 BF16 的机器精度和范围… | 进阶 | ★★ |
| [TRN-MEM-021](../TRN/MEM.md#TRN-MEM-021) | 下面的代码把同一组数分别转换成 FP8 的 E4M3 与 E5M2 格式再转回 FP… | 进阶 | ★ |
| [TRN-PEFT-006](../TRN/PEFT.md#TRN-PEFT-006) | 下面的代码模拟 LoRA 的初始化、训练后的合并。输出是什么？ | 进阶 | ★★ |
| [TRN-PEFT-019](../TRN/PEFT.md#TRN-PEFT-019) | 下面的代码用对称 4 bit absmax 量化一组含离群值的权重，比较「整组一个缩… | 进阶 | ★ |
| [TRN-PT-007](../TRN/PT.md#TRN-PT-007) | 下面的代码分别从「真实 token 的概率」和「均匀分布的 logits」计算交叉熵… | 基础 | ★★ |
| [TRN-PT-023](../TRN/PT.md#TRN-PT-023) | 假设模型每个 token 的正确率 p 随规模平滑提升，一道题的答案有 10 个 t… | 进阶 | ★★ |
| [TRN-SFT-009](../TRN/SFT.md#TRN-SFT-009) | 下面的代码检查「推理时的提示」是否为「训练序列」的前缀。输出是什么？ | 进阶 | ★★ |
| [TRN-SFT-021](../TRN/SFT.md#TRN-SFT-021) | 下面的代码为两条打包在一起的样本构造注意力掩码和 position ids。输出是什… | 进阶 | ★★ |
