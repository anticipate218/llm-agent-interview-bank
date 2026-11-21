# 代码填空题（45 道）

| 编号 | 题目 | 难度 | 考频 |
|---|---|---|---|
| [AGT-BASE-016](../AGT/BASE.md#AGT-BASE-016) | 补全一个通用的「带门控的提示链」执行器：每一步的输入是上一步的输出；每一步执行后用门… | 基础 | ★★ |
| [AGT-BASE-043](../AGT/BASE.md#AGT-BASE-043) | 把 ReAct 循环改写成显式状态机：THINK（调用模型）→ ACT（执行工具）→… | 进阶 | ★★ |
| [AGT-FW-008](../AGT/FW.md#AGT-FW-008) | LangGraph 中消息列表常用的 reducer add_messages 按消… | 进阶 | ★★ |
| [AGT-PLAN-009](../AGT/PLAN.md#AGT-PLAN-009) | 补全 ToT 的 BFS 搜索：每一层由生成器 propose 扩展出全部候选；若候… | 进阶 | ★★ |
| [AGT-PROTO-029](../AGT/PROTO.md#AGT-PROTO-029) | Host 通过 MCP 从多个 Server 拿到工具列表后，要转换成 OpenAI… | 进阶 | ★★ |
| [AGT-RL-006](../AGT/RL.md#AGT-RL-006) | 把一段 ChatML 格式的多轮 Agent 对话（system / user / … | 进阶 | ★★★ |
| [AGT-TOOL-041](../AGT/TOOL.md#AGT-TOOL-041) | 多模型网关需要把 OpenAI Chat Completions 风格的工具定义、t… | 进阶 | ★★ |
| [ALN-GRPO-026](../ALN/GRPO.md#ALN-GRPO-026) | 补全 GSPO 序列级重要性比的计算：s_i=\exp\Big(\frac{1}{y… | 进阶 | ★★ |
| [ALN-PO-007](../ALN/PO.md#ALN-PO-007) | 补全 DPO 损失。输入是 batch 内每条 chosen / rejected … | 基础 | ★★★ |
| [ALN-RL-035](../ALN/RL.md#ALN-RL-035) | 补全 PPO 的裁剪策略损失（对 token 取平均）。logp 是当前策略对已采样… | 进阶 | ★★★ |
| [CS-ALGO-004](../CS/ALGO.md#CS-ALGO-004) | 给定整数数组 nums（元素可正、可负、可为 0）和整数 k，统计和恰好等于 k 的… | 进阶 | ★★★ |
| [CS-ALGO-027](../CS/ALGO.md#CS-ALGO-027) | 知识库中同一个实体常有多个别名。给定若干「同义」对，凡是能通过同义关系传递连通的名字… | 进阶 | ★★ |
| [CS-ALGO-028](../CS/ALGO.md#CS-ALGO-028) | 规划器生成的任务依赖图如果有环，任务就永远无法开始。为了让模型修正计划，需要把具体的… | 进阶 | ★★ |
| [CS-ALGO-036](../CS/ALGO.md#CS-ALGO-036) | 用 O(n\log n) 的方法求最长递增子序列的长度：tails[i] 保存所有长… | 进阶 | ★★★ |
| [CS-ALGO-038](../CS/ALGO.md#CS-ALGO-038) | 用前缀树（Trie）实现敏感词打码：从左到右扫描文本，在每个位置找最长的敏感词，用等… | 基础 | ★★ |
| [CS-PY-014](../CS/PY.md#CS-PY-014) | 补全一个带参数的重试装饰器：最多调用被装饰函数 times 次；只对 excepti… | 进阶 | ★★★ |
| [CS-SQL-011](../CS/SQL.md#CS-SQL-011) | 表 daily(day, tokens) 记录每天的 token 用量。补全 SQL… | 进阶 | ★★ |
| [CS-TORCH-019](../CS/TORCH.md#CS-TORCH-019) | 补全梯度累积的训练循环：每处理 accum 个 micro-batch 更新一次参数… | 进阶 | ★★★ |
| [CS-TORCH-032](../CS/TORCH.md#CS-TORCH-032) | 补全一个使用 FP16 混合精度并带梯度裁剪的训练 step。为了能在 CPU 上运… | 进阶 | ★★ |
| [ENG-OBS-021](../ENG/OBS.md#ENG-OBS-021) | 下面是一个按非劣效判定的发布门禁：diffs 是回归集上每题「新版本得分 − 旧版本… | 进阶 | ★★ |
| [ENG-STAB-010](../ENG/STAB.md#ENG-STAB-010) | 下面用 contextvars 实现 deadline 在调用链中的传播（用列表 c… | 进阶 | ★★ |
| [FND-ML-040](../FND/ML.md#FND-ML-040) | 用 SVD 实现 PCA：X 形状为 (n, d)，返回降到 k 维的投影、主成分方… | 进阶 | ★★ |
| [FND-NLP-009](../FND/NLP.md#FND-NLP-009) | 补全 Skip-gram 负采样（SGNS）对一个（中心词, 上下文词）正例对的损失… | 进阶 | ★★ |
| [FND-NLP-019](../FND/NLP.md#FND-NLP-019) | 补全 Bahdanau 加性注意力：用解码器上一时刻的隐状态 s 与编码器各位置的隐… | 进阶 | ★★ |
| [FND-OPT-022](../FND/OPT.md#FND-OPT-022) | 补全按全局 L2 范数裁剪梯度的函数：grads 是各参数梯度（numpy 数组）组… | 进阶 | ★★ |
| [INF-KERNEL-010](../INF/KERNEL.md#INF-KERNEL-010) | FlashDecoding 把一个 query 要看的 KV 切成多段并行计算：每段… | 进阶 | ★★ |
| [INF-KV-013](../INF/KV.md#INF-KV-013) | 分页 KV 池的形状为 (num_blocks, block_size, d)，一条… | 基础 | ★★ |
| [INF-QUANT-010](../INF/QUANT.md#INF-QUANT-010) | 补全对称分组量化函数：权重形状为 (out, in)，沿输入维每 group 个元素… | 进阶 | ★★ |
| [INF-QUANT-046](../INF/QUANT.md#INF-QUANT-046) | 补全 2:4 剪枝的掩码函数：按 Wanda 得分 W_{ij}\cdot\X_j\… | 进阶 | ★ |
| [INF-SERVE-021](../INF/SERVE.md#INF-SERVE-021) | 下面用一个字符级状态机描述格式「1～3 位数字 + %」（如 7%、42%、100%… | 进阶 | ★★ |
| [LLM-ARCH-023](../LLM/ARCH.md#LLM-ARCH-023) | 补全 SwiGLU 前馈层的 forward。命名与 Hugging Face 的 … | 基础 | ★★ |
| [LLM-ATTN-009](../LLM/ATTN.md#LLM-ATTN-009) | GQA 中，KV 头数少于 Query 头数，计算注意力前需要把每个 KV 头复制给… | 进阶 | ★★★ |
| [LLM-DEC-027](../LLM/DEC.md#LLM-DEC-027) | 补全一个最小的约束贪心解码器：目标格式是「1～3 位、不以 0 开头的十进制整数」，… | 进阶 | ★★ |
| [LLM-MM-002](../LLM/MM.md#LLM-MM-002) | 补全 ViT 的 patch 切分函数：输入 (B, C, H, W)，输出 (B,… | 进阶 | ★★ |
| [LLM-MOE-019](../LLM/MOE.md#LLM-MOE-019) | 补全 DeepSeek-V3 式「无辅助损失负载均衡」的路由函数与偏置更新函数：偏置… | 进阶 | ★★ |
| [LLM-NEW-014](../LLM/NEW.md#LLM-NEW-014) | 补全多 token 预测（MTP）的标签构造：共有 n 个预测头，第 k 个头（k=… | 进阶 | ★★ |
| [LLM-POS-014](../LLM/POS.md#LLM-POS-014) | 补全 Hugging Face 风格的 RoPE 实现：第 i 维与第 i+d/2 … | 进阶 | ★★★ |
| [LLM-TOK-030](../LLM/TOK.md#LLM-TOK-030) | 补全基于词频表的 BPE 训练中的两个核心函数：get_pair_counts 统计… | 进阶 | ★★ |
| [RAG-ADV-011](../RAG/ADV.md#RAG-ADV-011) | 按 CRAG 的规则补全动作判定函数：只要有一篇文档的分数严格高于上阈值，就判为 c… | 进阶 | ★ |
| [RAG-EMB-005](../RAG/EMB.md#RAG-EMB-005) | 补全带批内负例的 InfoNCE 实现：q、d 的形状均为 (B, D)，q[i] … | 进阶 | ★★★ |
| [RAG-RETR-020](../RAG/RETR.md#RAG-RETR-020) | 补全 RRF 融合函数：rankings 是多路召回的结果，每一路是按相关性降序排列… | 进阶 | ★★★ |
| [TRN-ADAPT-013](../TRN/ADAPT.md#TRN-ADAPT-013) | 扩充词表后，用「新 token 在旧分词器下切出的子词向量的平均值」初始化新 tok… | 进阶 | ★★ |
| [TRN-DIST-022](../TRN/DIST.md#TRN-DIST-022) | Megatron-LM 把输出层按词表维切到 TP 组的各张卡上。为了不把 b\ti… | 挑战 | ★★ |
| [TRN-PT-031](../TRN/PT.md#TRN-PT-031) | 补全 WSD（Warmup-Stable-Decay）学习率函数：前 warmup … | 进阶 | ★★ |
| [TRN-SFT-014](../TRN/SFT.md#TRN-SFT-014) | 补全 SFT 样本构造与损失计算：只有 assistant 回合的正文与结束符计入 … | 进阶 | ★★★ |
