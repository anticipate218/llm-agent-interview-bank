# 代码改错题（68 道）

| 编号 | 题目 | 难度 | 考频 |
|---|---|---|---|
| [AGT-APP-041](../AGT/APP.md#AGT-APP-041) | 下面是数据分析 Agent 的一个查询工具：模型调用它时传入 tool_args（由… | 进阶 | ★★ |
| [AGT-BASE-015](../AGT/BASE.md#AGT-BASE-015) | 下面是评估者-优化者循环的实现。调用方的约定是：返回通过评估的稿件；若 max_ro… | 进阶 | ★★ |
| [AGT-BASE-042](../AGT/BASE.md#AGT-BASE-042) | 下面是一个最小的 Agent 循环：llm(messages) 返回 {"final… | 进阶 | ★★ |
| [AGT-FW-018](../AGT/FW.md#AGT-FW-018) | 下面用纯 Python 模拟 LangGraph 的 interrupt 语义：节点… | 挑战 | ★★ |
| [AGT-HARNESS-027](../AGT/HARNESS.md#AGT-HARNESS-027) | 下面的函数负责把模型给出的路径解析到沙箱根目录之内，越界则拒绝。它有安全漏洞：模型传… | 进阶 | ★★ |
| [AGT-MEM-012](../AGT/MEM.md#AGT-MEM-012) | 下面的 compact 在对话过长时，把较早的消息交给摘要函数压成一条摘要，最近 k… | 进阶 | ★★ |
| [AGT-MULTI-030](../AGT/MULTI.md#AGT-MULTI-030) | 下面是一个长任务执行器：每完成一步就把输出原子地写进 JSON 检查点，进程重启后从… | 进阶 | ★★ |
| [AGT-PLAN-031](../AGT/PLAN.md#AGT-PLAN-031) | 下面是一个顺序执行计划的简化执行器：tasks 按 tid 升序排列，参数中形如 "… | 进阶 | ★★ |
| [AGT-PROMPT-006](../AGT/PROMPT.md#AGT-PROMPT-006) | 下面的函数为情感分类构造少样本提示。使用中发现：模型明显偏向输出某一个标签，而且对待… | 进阶 | ★★ |
| [AGT-PROMPT-020](../AGT/PROMPT.md#AGT-PROMPT-020) | 下面的函数调用模型抽取结构化信息：输出解析失败或校验不通过时重试，最多 max_tr… | 进阶 | ★★★ |
| [AGT-PROTO-018](../AGT/PROTO.md#AGT-PROTO-018) | 下面是一个最小 MCP stdio 服务端的消息循环（参数 stdout 就是连接 … | 挑战 | ★★ |
| [AGT-PROTO-071](../AGT/PROTO.md#AGT-PROTO-071) | 下面是一个 MCP 客户端（2026-07-28 版）处理多轮往返请求（MRTR）的… | 挑战 | ★★ |
| [AGT-REFL-023](../AGT/REFL.md#AGT-REFL-023) | 下面是一个 Reflexion 循环：actor(memory) 根据记忆生成一个函… | 进阶 | ★★ |
| [AGT-RL-009](../AGT/RL.md#AGT-RL-009) | 下面是多轮 Agent RL 中带回合级优势的策略梯度 loss：每个回合算出一个优… | 挑战 | ★★ |
| [AGT-TOOL-036](../AGT/TOOL.md#AGT-TOOL-036) | 下面的函数把 OpenAI 风格的流式增量（已简化为扁平字典）拼回完整的工具调用列表… | 进阶 | ★★ |
| [ALN-GRPO-034](../ALN/GRPO.md#ALN-GRPO-034) | 下面是 GRPO 逐 token loss 的实现，其中 k3_kl 应计算 \ma… | 挑战 | ★★ |
| [ALN-RL-006](../ALN/RL.md#ALN-RL-006) | 下面是 REINFORCE 损失的实现：先计算每一步的 reward-to-go G… | 进阶 | ★★ |
| [ALN-RLHF-014](../ALN/RLHF.md#ALN-RLHF-014) | 下面的奖励模型在训练时使用右侧补齐（right padding）的 batch。训练… | 进阶 | ★★★ |
| [CS-ALGO-007](../CS/ALGO.md#CS-ALGO-007) | 下面的函数求字符串中不含重复字符的最长子串长度。它在 "abcabcbb"、"pww… | 基础 | ★★★ |
| [CS-ALGO-011](../CS/ALGO.md#CS-ALGO-011) | 显存为 80 GB 的卡上，模型权重占 14 GB，每条序列的 KV Cache 占… | 进阶 | ★★ |
| [CS-ALGO-017](../CS/ALGO.md#CS-ALGO-017) | 下面的函数从检索结果中取得分最高的 k 篇文档。上线后偶发崩溃，报错 TypeErr… | 进阶 | ★★ |
| [CS-ALGO-023](../CS/ALGO.md#CS-ALGO-023) | 下面的函数判断一棵二叉树是否是二叉搜索树（左子树所有节点都小于根，右子树所有节点都大… | 基础 | ★★★ |
| [CS-ALGO-035](../CS/ALGO.md#CS-ALGO-035) | RAG 检索到若干文本片段，每个片段有 token 数和相关性分数。要在 token… | 进阶 | ★★ |
| [CS-ALGO-046](../CS/ALGO.md#CS-ALGO-046) | 下面的洗牌函数被用来打乱评测题目中选项的顺序，以消除位置偏差。统计发现某些排列出现得… | 进阶 | ★★ |
| [CS-DIST-028](../CS/DIST.md#CS-DIST-028) | 下面是基于 Redis 的分布式锁，其中 FakeRedis 在单进程内模拟了用到的… | 进阶 | ★★★ |
| [CS-OS-012](../CS/OS.md#CS-OS-012) | 下面的转账函数在压测中偶尔会让两个线程永久卡住：一个线程执行 transfer(x,… | 进阶 | ★★★ |
| [CS-PY-006](../CS/PY.md#CS-PY-006) | 下面计算两个字符串最长公共子序列（LCS）长度的函数，对一些输入会算出偏大的结果，例… | 进阶 | ★★ |
| [CS-PY-008](../CS/PY.md#CS-PY-008) | 下面是一个多轮对话 Agent 的会话类。上线后发现不同用户之间「串话」：新用户的第… | 基础 | ★★★ |
| [CS-PY-022](../CS/PY.md#CS-PY-022) | 下面用 contextlib.contextmanager 写的上下文管理器从连接池… | 进阶 | ★★ |
| [CS-PY-033](../CS/PY.md#CS-PY-033) | 下面的 fetch 被取消时会关闭连接做清理。调用方用 asyncio.wait_f… | 挑战 | ★★ |
| [CS-PY-047](../CS/PY.md#CS-PY-047) | 下面的函数最多调用 fn 三次，全部失败时希望抛出 RuntimeError，并用 … | 进阶 | ★★ |
| [CS-SQL-013](../CS/SQL.md#CS-SQL-013) | 用户资料变更日志表 profile_log(id INTEGER PRIMARY K… | 进阶 | ★★★ |
| [CS-SQL-030](../CS/SQL.md#CS-SQL-030) | 下面的下单逻辑先读库存、在应用层判断，再写回新库存。为了在测试中稳定复现并发问题，读… | 进阶 | ★★★ |
| [CS-TORCH-005](../CS/TORCH.md#CS-TORCH-005) | 下面的回归训练中，模型输出形状为 (N, 1)，标签 y 的形状为 (N,)。训练能… | 进阶 | ★★★ |
| [CS-TORCH-008](../CS/TORCH.md#CS-TORCH-008) | 多头注意力中，split_heads 把 (B, T, Hd) 拆成 (B, H, … | 进阶 | ★★★ |
| [CS-TORCH-017](../CS/TORCH.md#CS-TORCH-017) | 下面用手写参数训练线性回归，运行时在更新参数的那一行报错 TypeError: un… | 进阶 | ★★★ |
| [CS-TORCH-024](../CS/TORCH.md#CS-TORCH-024) | 微调时想冻结骨干网络中的 BatchNorm 统计量，让 BN 一直使用预训练得到的… | 挑战 | ★★ |
| [CS-TORCH-028](../CS/TORCH.md#CS-TORCH-028) | 下面的训练循环能跑通、不报错，但参数从不更新，loss 纹丝不动。请找出原因并修正。 | 基础 | ★★★ |
| [CS-TORCH-042](../CS/TORCH.md#CS-TORCH-042) | 下面的验证函数在每个 epoch 结束时计算验证集的平均 loss。在 GPU 上运… | 进阶 | ★★★ |
| [EVL-AGENT-008](../EVL/AGENT.md#EVL-AGENT-008) | 下面的函数用于估计 pass@k：每道题采样 n 次、成功 c 次，估计「独立尝试 … | 进阶 | ★★ |
| [EVL-LLM-022](../EVL/LLM.md#EVL-LLM-022) | 下面的函数用 LLM 评审做成对比较，为了抵消位置偏差，每对回答交换顺序各评一次。上… | 进阶 | ★★ |
| [FND-DL-007](../FND/DL.md#FND-DL-007) | 下面是线性层 P=XW+b 接均方误差损失 L=\mathrm{mean}((P-Y… | 进阶 | ★★★ |
| [FND-MATH-030](../FND/MATH.md#FND-MATH-030) | 下面的函数根据 logits z 和 0/1 标签 y 逐元素计算二元交叉熵。它在 … | 进阶 | ★★ |
| [FND-OPT-010](../FND/OPT.md#FND-OPT-010) | 下面的函数为模型创建优化器，意图是：对矩阵类权重做 AdamW 式的（解耦）权重衰减… | 进阶 | ★★★ |
| [INF-KERNEL-011](../INF/KERNEL.md#INF-KERNEL-011) | 下面是单个 query 的 online softmax 加权求和（流式读入每个 k… | 挑战 | ★★ |
| [INF-KV-014](../INF/KV.md#INF-KV-014) | 下面是一个分页 KV 分配器的简化实现，fork 用于并行采样：子序列共享父序列的全… | 进阶 | ★★ |
| [INF-QUANT-025](../INF/QUANT.md#INF-QUANT-025) | 下面是一个简化版的 GPTQ（不分块、不用 Cholesky）：按列依次量化，并把每… | 挑战 | ★ |
| [INF-SCHED-017](../INF/SCHED.md#INF-SCHED-017) | 下面的函数在 KV 块不足时按「后到先抢」的原则抢占请求（重算模式：直接丢弃被抢占请… | 进阶 | ★★ |
| [INF-SPEC-007](../INF/SPEC.md#INF-SPEC-007) | 下面是单个草稿 token 的投机采样实现：草稿从 q 中采样一个 token，以 … | 挑战 | ★★★ |
| [LLM-ARCH-018](../LLM/ARCH.md#LLM-ARCH-018) | 下面是一个 RMSNorm 实现。它在 FP32 下测试正常，但模型用 FP16 推… | 进阶 | ★★ |
| [LLM-ATTN-008](../LLM/ATTN.md#LLM-ATTN-008) | 下面的因果注意力实现有一个 bug，导致输出与标准实现不一致。请指出问题并修正。 | 进阶 | ★★★ |
| [LLM-DEC-012](../LLM/DEC.md#LLM-DEC-012) | 下面是 CTRL 式重复惩罚的实现，目标是降低已出现过的 token 的概率（pen… | 进阶 | ★★ |
| [LLM-TOK-031](../LLM/TOK.md#LLM-TOK-031) | 下面的字节级 BPE 编码函数在多数文本上看起来正常，但有时与训练时的切分不一致。请… | 进阶 | ★★ |
| [RAG-CHUNK-011](../RAG/CHUNK.md#RAG-CHUNK-011) | 下面的滑动窗口切块函数有两个问题：一是某些输入下会产出被前一块完全覆盖的冗余块；二是… | 进阶 | ★★ |
| [RAG-EVAL-003](../RAG/EVAL.md#RAG-EVAL-003) | 下面的 nDCG@k 实现有一个 bug，会让漏召回的系统得到虚高的分数。grade… | 进阶 | ★★ |
| [RAG-QUERY-019](../RAG/QUERY.md#RAG-QUERY-019) | 下面的代码把重排后的资料编号（从 [1] 开始）拼进提示词；模型回答后，resolv… | 进阶 | ★★ |
| [SEC-AGENT-008](../SEC/AGENT.md#SEC-AGENT-008) | 某邮件 Agent 的发送工具要求「只能发给公司域 corp.example（含其子… | 进阶 | ★★ |
| [SEC-AGENT-009](../SEC/AGENT.md#SEC-AGENT-009) | 客服 Agent 有两个发票工具：args 是模型生成的工具参数，session 是… | 进阶 | ★★★ |
| [SEC-AGENT-037](../SEC/AGENT.md#SEC-AGENT-037) | 下面是 Agent 抓取工具的 SSRF 校验与抓取逻辑：resolve(host)… | 挑战 | ★★ |
| [SEC-DEF-014](../SEC/DEF.md#SEC-DEF-014) | 下面是某 Agent 运行时合并值标签的函数：每个标签是 (sources, rea… | 进阶 | ★★ |
| [SEC-DEF-022](../SEC/DEF.md#SEC-DEF-022) | 客服 Agent 的工具 find_orders 由模型生成参数，其中 custom… | 进阶 | ★★★ |
| [SEC-INJ-020](../SEC/INJ.md#SEC-INJ-020) | 下面的函数把不可信文本包裹在边界标记之间，再拼进提示词，同时返回边界标识 tag，供… | 进阶 | ★★ |
| [SEC-REL-031](../SEC/REL.md#SEC-REL-031) | 某 Agent 平台把每次工具调用写入审计日志。每条记录保存上一条的哈希 prev … | 进阶 | ★★ |
| [TRN-DATA-021](../TRN/DATA.md#TRN-DATA-021) | 下面的函数用于把中文文本中的手机号和 18 位身份证号替换成占位符。测试发现它会把身… | 进阶 | ★★ |
| [TRN-DIST-012](../TRN/DIST.md#TRN-DIST-012) | 下面的函数用来估算 ZeRO 各阶段每张卡的模型状态。用它复现 ZeRO 论文的算例… | 进阶 | ★★ |
| [TRN-MEM-026](../TRN/MEM.md#TRN-MEM-026) | 下面的函数接收 loss 放大 scale 倍后反向得到的 FP16 梯度，负责还原… | 进阶 | ★★ |
| [TRN-PT-002](../TRN/PT.md#TRN-PT-002) | 下面是预训练代码中计算语言模型损失的函数。用它训练时，训练 loss 很快降到接近 … | 进阶 | ★★★ |
| [TRN-SFT-015](../TRN/SFT.md#TRN-SFT-015) | 下面的函数把若干条样本补齐成一个 batch（简化起见，示例中所有真实 token … | 进阶 | ★★★ |
