# 计算题（237 道）

| 编号 | 题目 | 难度 | 考频 |
|---|---|---|---|
| [AGT-APP-004](../AGT/APP.md#AGT-APP-004) | 某 Python 仓库约 30 万行代码，平均每行约 10 个 token。编码 A… | 进阶 | ★★ |
| [AGT-APP-014](../AGT/APP.md#AGT-APP-014) | 对同一个 issue 独立采样 6 个候选补丁，每个候选正确的概率为 0.35。现有… | 挑战 | ★★ |
| [AGT-APP-043](../AGT/APP.md#AGT-APP-043) | 某候选人的简历上写着：「评审 Agent 准确率 43.8%」。复核的数据如下：在 … | 进阶 | ★★ |
| [AGT-APP-048](../AGT/APP.md#AGT-APP-048) | 某告警排障 Agent 在 1,000 条历史告警上做回放评测（每条告警都有复盘确认… | 进阶 | ★ |
| [AGT-BASE-017](../AGT/BASE.md#AGT-BASE-017) | 用 5 个侧重点不同的审查提示词并行投票，判断一段代码是否有安全漏洞。为简化计算，假… | 挑战 | ★★ |
| [AGT-BASE-018](../AGT/BASE.md#AGT-BASE-018) | 某 Agent 的首轮上下文（系统提示词 + 工具定义 + 用户输入）约 6K to… | 挑战 | ★★★ |
| [AGT-FW-029](../AGT/FW.md#AGT-FW-029) | 一个 4 个 Agent 的群聊采用「由模型选择发言者」的方式：每一轮先调用一次模型… | 进阶 | ★★ |
| [AGT-HARNESS-004](../AGT/HARNESS.md#AGT-HARNESS-004) | 某编码 Agent 每次编辑文件时有 8% 的概率引入语法错误，一个任务平均需要 1… | 进阶 | ★★ |
| [AGT-HARNESS-026](../AGT/HARNESS.md#AGT-HARNESS-026) | 某 Agent 平台高峰期有 3000 个并发会话，每个会话运行在一个 Firecr… | 进阶 | ★★ |
| [AGT-MEM-001](../AGT/MEM.md#AGT-MEM-001) | 一个编码 Agent 的系统提示词与工具定义共 12K token；每一步追加的工具… | 进阶 | ★★ |
| [AGT-MEM-023](../AGT/MEM.md#AGT-MEM-023) | 某 Generative Agents 式的记忆流在第 30 个游戏小时收到一次查询… | 挑战 | ★★ |
| [AGT-MEM-036](../AGT/MEM.md#AGT-MEM-036) | 某客服 Agent 每次请求的提示词由两部分组成：前面是系统提示词与工具定义，共 2… | 挑战 | ★★ |
| [AGT-MEM-050](../AGT/MEM.md#AGT-MEM-050) | 某编码 Agent 使用上下文窗口为 200K token 的模型（本题 1K 按 … | 进阶 | ★★ |
| [AGT-MULTI-005](../AGT/MULTI.md#AGT-MULTI-005) | 某合同质检任务有两种方案： - 单 Agent：每单模型成本 0.30 美元，成功率… | 进阶 | ★★ |
| [AGT-MULTI-016](../AGT/MULTI.md#AGT-MULTI-016) | 5 个 Agent 对一批是非题（答案只有「是 / 否」）各自独立作答后多数投票。每… | 挑战 | ★★ |
| [AGT-MULTI-024](../AGT/MULTI.md#AGT-MULTI-024) | 某调研任务拆成如下子任务（括号内为耗时）： - 规划（2 分钟）； - 检索 A（6… | 挑战 | ★★ |
| [AGT-PLAN-006](../AGT/PLAN.md#AGT-PLAN-006) | 某模型单条推理路径答对的概率为 0.6；答错时错误答案五花八门，可以认为任意两条错误… | 挑战 | ★★ |
| [AGT-PLAN-037](../AGT/PLAN.md#AGT-PLAN-037) | 同一个多跳问答任务需要调用 4 次搜索工具。按下列假设，分别计算 ReAct 和 R… | 进阶 | ★★ |
| [AGT-PROMPT-030](../AGT/PROMPT.md#AGT-PROMPT-030) | 某应用每次请求都带有 8,000 token 的固定前缀（系统提示词 + 少样本示例… | 进阶 | ★★ |
| [AGT-PROMPT-035](../AGT/PROMPT.md#AGT-PROMPT-035) | 在同一个 300 条的评测集上比较两版提示词：旧版答对 240 条。逐条对比发现：旧… | 挑战 | ★ |
| [AGT-PROTO-002](../AGT/PROTO.md#AGT-PROTO-002) | 某公司有 6 个 AI 应用（IDE 插件、客服助手、数据分析 Agent 等），需… | 基础 | ★★ |
| [AGT-PROTO-040](../AGT/PROTO.md#AGT-PROTO-040) | 某 Agent 安装了 40 个技能。每个技能的元数据（name + descrip… | 进阶 | ★★ |
| [AGT-PROTO-044](../AGT/PROTO.md#AGT-PROTO-044) | 任务「客户 C42 有几笔退款中的订单，共多少钱」： - 两种方式的固定前缀（系统提… | 挑战 | ★★ |
| [AGT-REFL-021](../AGT/REFL.md#AGT-REFL-021) | 一个编码 Agent 每次独立生成一份代码，正确的概率为 0.4。用验证器把关：正确… | 挑战 | ★★ |
| [AGT-RL-018](../AGT/RL.md#AGT-RL-018) | 一条 4 回合轨迹的逐回合奖励为 r=[0,\ -0.1,\ 0,\ 1]（第 2 … | 挑战 | ★★ |
| [AGT-RL-020](../AGT/RL.md#AGT-RL-020) | 同步训练中，一个 step 要等 512 条 Agent 轨迹全部完成。其中 90%… | 进阶 | ★★ |
| [ALN-GRPO-002](../ALN/GRPO.md#ALN-GRPO-002) | 用 GRPO 训练代码模型，奖励设计为：通过的单元测试比例（0～1），编译或运行崩溃… | 进阶 | ★★★ |
| [ALN-GRPO-014](../ALN/GRPO.md#ALN-GRPO-014) | 某步更新中，三个 token 的优势都为正，旧策略下的概率分别为 \pi_{\tex… | 进阶 | ★★ |
| [ALN-GRPO-017](../ALN/GRPO.md#ALN-GRPO-017) | 二值奖励、组大小 G=8。若某题单次采样的正确率为 p，则一组「全对或全错」（优势全… | 进阶 | ★★ |
| [ALN-GRPO-042](../ALN/GRPO.md#ALN-GRPO-042) | 一条回答的 4 个 token，推理引擎采样时给出的概率 \mu，以及训练引擎（同一… | 进阶 | ★★ |
| [ALN-GRPO-046](../ALN/GRPO.md#ALN-GRPO-046) | 异步 RL 中，某个 token 由落后 3 个版本的权重采样，行为策略给它的概率为… | 挑战 | ★★ |
| [ALN-PO-003](../ALN/PO.md#ALN-PO-003) | 某提示词只有三条候选回答，参考模型的概率为 \pi_{\text{ref}}=[0.… | 挑战 | ★★ |
| [ALN-PO-006](../ALN/PO.md#ALN-PO-006) | DPO 训练中的某个样本：\beta=0.2；策略对 chosen 的序列对数概率 … | 进阶 | ★★★ |
| [ALN-PO-024](../ALN/PO.md#ALN-PO-024) | 设 h 为两条回答相对参考模型的对数概率比之差（同 DPO）。DPO 取 \beta… | 挑战 | ★★ |
| [ALN-PO-028](../ALN/PO.md#ALN-PO-028) | ORPO 中 P_\theta(y\mid x) 取逐 token 平均对数概率的指… | 进阶 | ★ |
| [ALN-PO-030](../ALN/PO.md#ALN-PO-030) | SimPO 中，某样本 chosen 回答 50 个 token，序列对数概率之和为… | 进阶 | ★★ |
| [ALN-REASON-017](../ALN/REASON.md#ALN-REASON-017) | 某模型在一道题上单次采样的正确率 p=0.2，各次采样相互独立。 (1) 若有完美的… | 进阶 | ★★ |
| [ALN-REASON-026](../ALN/REASON.md#ALN-REASON-026) | 某推理模型部署后，单个请求的解码速度约为 40 token/s（忽略 prefill… | 进阶 | ★★ |
| [ALN-RL-009](../ALN/RL.md#ALN-RL-009) | 某状态 s 下，策略对三个候选 token 的概率为 \pi=[0.5,\ 0.3,… | 进阶 | ★★ |
| [ALN-RL-011](../ALN/RL.md#ALN-RL-011) | 一个两状态 MDP，\gamma=0.9，没有终止状态： - 在 s_1 有两个动作… | 进阶 | ★★ |
| [ALN-RL-019](../ALN/RL.md#ALN-RL-019) | 一个两臂老虎机，策略为 \pi=\mathrm{softmax}(\theta_1,… | 挑战 | ★★ |
| [ALN-RL-023](../ALN/RL.md#ALN-RL-023) | 一条轨迹共 4 步，即时奖励 r=[0,0,0,1]，第 4 步后回合结束；crit… | 进阶 | ★★★ |
| [ALN-RL-034](../ALN/RL.md#ALN-RL-034) | PPO 中单个 token 的目标为 \min\big(\rho A,\ \math… | 进阶 | ★★★ |
| [ALN-RLHF-009](../ALN/RLHF.md#ALN-RLHF-009) | 奖励模型给同一提示词下的两条回答 A、B 打分：r_A=2.0，r_B=0.5。按 … | 基础 | ★★★ |
| [ALN-RLHF-019](../ALN/RLHF.md#ALN-RLHF-019) | 一条 4 个 token 的回答，各 token 的 \log\pi_{\text{… | 进阶 | ★★ |
| [ALN-RLHF-027](../ALN/RLHF.md#ALN-RLHF-027) | 一条 3 个 token 的回答，逐 token 的 \log\pi_{\text{… | 进阶 | ★★ |
| [ALN-RLHF-028](../ALN/RLHF.md#ALN-RLHF-028) | 用 PPO 做 RLHF，Actor、Critic、奖励模型、参考模型都是 8B 参… | 进阶 | ★★★ |
| [ALN-RLHF-043](../ALN/RLHF.md#ALN-RLHF-043) | 某 GRPO 训练任务在 32 张 GPU 上同步共卡（colocate）运行：每一… | 挑战 | ★★ |
| [ALN-RWD-008](../ALN/RWD.md#ALN-RWD-008) | 用 PRM 在 best-of-N 中挑选答案。PRM 对每一步给出「该步正确」的概… | 进阶 | ★★ |
| [ALN-RWD-032](../ALN/RWD.md#ALN-RWD-032) | 用一个逐条打分的生成式奖励模型，给同一提示词下的两个回答 A、B 打分：每次采样先写… | 进阶 | ★ |
| [CS-ALGO-002](../CS/ALGO.md#CS-ALGO-002) | 某动态数组初始容量为 1；存满后再追加元素时，先申请一块容量为原来 2 倍的新空间，… | 进阶 | ★★ |
| [CS-ALGO-005](../CS/ALGO.md#CS-ALGO-005) | 预训练数据抓取要对约 10^8 个 URL 判重，计划用 Bloom 过滤器：位数组… | 进阶 | ★★ |
| [CS-DIST-004](../CS/DIST.md#CS-DIST-004) | 某 Dynamo 风格的存储为每个 key 保存 N = 5 个副本：写入要等 W … | 进阶 | ★★ |
| [CS-DIST-007](../CS/DIST.md#CS-DIST-007) | 三个进程 P1、P2、P3 使用 Lamport 逻辑时钟，初值都为 0。规则：每发… | 进阶 | ★★ |
| [CS-DIST-014](../CS/DIST.md#CS-DIST-014) | 5 节点的 Raft 集群，Leader 的当前任期为 5，日志中索引 1～8 的条… | 挑战 | ★★ |
| [CS-NET-004](../CS/NET.md#CS-NET-004) | 某 Linux 上的压测脚本用短连接调用同一个 API 地址（同一个目标 IP 和端… | 进阶 | ★★ |
| [CS-NET-007](../CS/NET.md#CS-NET-007) | 两个机房之间有一条 1 Gbps 的专线，RTT 为 80 ms，要用单个 TCP … | 挑战 | ★★ |
| [CS-NET-019](../CS/NET.md#CS-NET-019) | 某 LLM 网关用 httpx 调用上游模型 API（HTTP/1.1，流式输出）。… | 进阶 | ★★ |
| [CS-OS-011](../CS/OS.md#CS-OS-011) | 系统有 3 类资源 R1、R2、R3，4 个进程 P0～P3。当前的分配情况、最大需… | 挑战 | ★★ |
| [CS-OS-021](../CS/OS.md#CS-OS-021) | (1) 32 位虚拟地址空间，页大小 4 KiB，每个页表项 4 字节。若使用单级页… | 进阶 | ★★ |
| [CS-OS-025](../CS/OS.md#CS-OS-025) | 某伙伴系统管理一块 1024 KiB 的连续内存，初始全部空闲。分配时总是取能满足请… | 进阶 | ★ |
| [CS-SQL-017](../CS/SQL.md#CS-SQL-017) | 估算 InnoDB 主键索引（B+ 树）的高度。假设：页大小为 16 KB（按 16… | 进阶 | ★★ |
| [ENG-DESIGN-010](../ENG/DESIGN.md#ENG-DESIGN-010) | 某企业办公助手：日活 120 万，人均每天发起 3 个任务，峰值 QPS 是日均的 … | 进阶 | ★★★ |
| [ENG-DESIGN-011](../ENG/DESIGN.md#ENG-DESIGN-011) | 某公司内部的 Coding Agent 平台每天处理 6,000 个任务。每个任务平… | 挑战 | ★★ |
| [ENG-DESIGN-013](../ENG/DESIGN.md#ENG-DESIGN-013) | 某数据分析 Agent：日活 8,000 人，人均每天提 12 个问题；每个问题调用… | 进阶 | ★★★ |
| [ENG-DESIGN-014](../ENG/DESIGN.md#ENG-DESIGN-014) | 某客服 Agent 每天约 10 万个会话，成功率 80%。成功会话平均花费 0.0… | 进阶 | ★★ |
| [ENG-DESIGN-028](../ENG/DESIGN.md#ENG-DESIGN-028) | 某客服 Agent 只有两类意图。下跌前：查询类占流量 70%，成功率 90%；售后… | 挑战 | ★★ |
| [ENG-DESIGN-047](../ENG/DESIGN.md#ENG-DESIGN-047) | 某审核流水线每天处理 1,000 万条内容，采用三层漏斗： - 第一层（哈希与规则）… | 挑战 | ★★ |
| [ENG-OBS-015](../ENG/OBS.md#ENG-OBS-015) | 某 Agent 的两个提示词版本在相同流量下各运行了 1 万个任务：v1 总花费 8… | 进阶 | ★★ |
| [ENG-OBS-023](../ENG/OBS.md#ENG-OBS-023) | Agent 当前的任务成功率约为 80%。新版本以金丝雀方式接收 5% 的流量，全站… | 进阶 | ★★★ |
| [ENG-OBS-025](../ENG/OBS.md#ENG-OBS-025) | 某 A/B 实验按用户 50/50 随机分流。一周后，A 组有 10,200 个用户… | 挑战 | ★★ |
| [ENG-OBS-029](../ENG/OBS.md#ENG-OBS-029) | 某 Agent 服务的 SLO 是「30 天内 99.9% 的任务成功完成」，每月约… | 进阶 | ★★★ |
| [ENG-PERF-002](../ENG/PERF.md#ENG-PERF-002) | 某工单分类任务每次调用的输入约 1500 token，最终只输出一个约 20 tok… | 进阶 | ★★★ |
| [ENG-PERF-004](../ENG/PERF.md#ENG-PERF-004) | 某厂商的 Prompt Caching 计费规则（以下为假设，与 Anthropic… | 进阶 | ★★★ |
| [ENG-PERF-009](../ENG/PERF.md#ENG-PERF-009) | 某客服问答每天 100 万次请求，每次调用大模型的平均成本为 0.002 美元。计划… | 挑战 | ★★ |
| [ENG-PERF-012](../ENG/PERF.md#ENG-PERF-012) | 某任务采用级联方案：先调用小模型（相对成本 0.1），再用校验器检查（相对成本 0.… | 挑战 | ★★★ |
| [ENG-PERF-024](../ENG/PERF.md#ENG-PERF-024) | 某业务每天处理 20 亿个 token（输入输出合计，比例稳定），有两个方案（价格与… | 进阶 | ★★★ |
| [ENG-STAB-002](../ENG/STAB.md#ENG-STAB-002) | 一个 Agent 任务平均要调用模型和工具共 30 次，每次调用的成功率为 99%，… | 进阶 | ★★ |
| [ENG-STAB-008](../ENG/STAB.md#ENG-STAB-008) | 一个交互式 Agent 请求的端到端 deadline 是 45 s。各类调用的超时… | 进阶 | ★★★ |
| [ENG-STAB-011](../ENG/STAB.md#ENG-STAB-011) | 某客户端采用带 full jitter 的指数退避：第 n 次重试（n 从 0 开始… | 进阶 | ★★★ |
| [ENG-STAB-029](../ENG/STAB.md#ENG-STAB-029) | 某 API 入口按租户用令牌桶限流：补充速率 r=10 个/s，桶容量 b=50，每… | 进阶 | ★★★ |
| [EVL-AGENT-007](../EVL/AGENT.md#EVL-AGENT-007) | 某评测集有 3 道题，每道题独立采样 n=5 次，成功次数分别为 c=5、2、0。用… | 进阶 | ★★★ |
| [EVL-AGENT-012](../EVL/AGENT.md#EVL-AGENT-012) | 两个客服 Agent 在同一批任务上的平均成功率都是 75%。A 的失败集中在固定的… | 进阶 | ★★★ |
| [EVL-LLM-014](../EVL/LLM.md#EVL-LLM-014) | 按 Elo 公式 E_A=\dfrac{1}{1+10^{(R_B-R_A)/400… | 基础 | ★★★ |
| [EVL-LLM-020](../EVL/LLM.md#EVL-LLM-020) | 用 G-Eval 的方式给两份摘要按 1～5 分打分。评审模型输出各分数 token… | 进阶 | ★★ |
| [EVL-LLM-024](../EVL/LLM.md#EVL-LLM-024) | 用 LLM 评审比较新模型 A 与旧模型 B 的 200 对回答，每对交换顺序各评一… | 挑战 | ★★ |
| [EVL-LLM-031](../EVL/LLM.md#EVL-LLM-031) | 用 lm-evaluation-harness 风格的似然打分评测一道选择题：分别计… | 进阶 | ★★ |
| [FND-DL-004](../FND/DL.md#FND-DL-004) | 一个小网络：输入 x=(1,2)（行向量），隐藏层 h=\mathrm{ReLU}(… | 进阶 | ★★★ |
| [FND-DL-012](../FND/DL.md#FND-DL-012) | 一个深层 MLP 的每个隐藏层都是 1024\to1024 的全连接层，后接 ReL… | 进阶 | ★★ |
| [FND-DL-027](../FND/DL.md#FND-DL-027) | ResNet 的第一层卷积：输入为 224\times224\times3 的图像，… | 进阶 | ★★ |
| [FND-MATH-004](../FND/MATH.md#FND-MATH-004) | 某矩阵 W 的全部非零奇异值为 10, 6, 3, 1。用截断 SVD 得到它的最佳… | 进阶 | ★★ |
| [FND-MATH-015](../FND/MATH.md#FND-MATH-015) | 某问答系统约 4% 的回答含有幻觉。一个幻觉检测器能标记出 90% 的幻觉回答（召回… | 基础 | ★★★ |
| [FND-MATH-023](../FND/MATH.md#FND-MATH-023) | 在 3 个类别上，真实分布 p=(\tfrac12,\tfrac12,0)，模型分布… | 基础 | ★★★ |
| [FND-MATH-027](../FND/MATH.md#FND-MATH-027) | 用 X、Y 分别表示两个模型对同一道题是否答对（1 为答对）。在一个大评测集上统计得… | 进阶 | ★ |
| [FND-ML-008](../FND/ML.md#FND-ML-008) | 设计矩阵各列正交且单位化（X^\top X=I），普通最小二乘的解为 \hat w^… | 进阶 | ★★ |
| [FND-ML-013](../FND/ML.md#FND-ML-013) | 一个二分类模型在 1000 个测试样本上的混淆矩阵为：TP = 40，FP = 10… | 基础 | ★★★ |
| [FND-ML-019](../FND/ML.md#FND-ML-019) | 某模型对 7 个样本的打分如下：正样本 3 个，得分为 0.9、0.7、0.4；负样… | 进阶 | ★★★ |
| [FND-ML-027](../FND/ML.md#FND-ML-027) | 某节点有 10 个样本（5 正 5 负），有两种候选划分： - 划分 A：左子节点（… | 进阶 | ★★ |
| [FND-ML-030](../FND/ML.md#FND-ML-030) | 用 XGBoost 做二分类（对数损失）。当前模型对某节点内 4 个样本的原始得分（… | 挑战 | ★★ |
| [FND-ML-039](../FND/ML.md#FND-ML-039) | 对一个 5 维数据集做 PCA，协方差矩阵（按 1/n 归一化）的特征值从大到小为 … | 基础 | ★★ |
| [FND-NLP-005](../FND/NLP.md#FND-NLP-005) | 用 TF-IDF 给一篇文档提取关键词。文档分词后为：「苹果 苹果 手机 发布 的 … | 基础 | ★★ |
| [FND-NLP-011](../FND/NLP.md#FND-NLP-011) | 用下面 3 句训练语料估计一个 bigram（二元）语言模型，句首、句尾分别加 <s… | 进阶 | ★★ |
| [FND-NLP-033](../FND/NLP.md#FND-NLP-033) | 两条参考译文：R1 = 「the cat is on the mat」（6 个词），… | 挑战 | ★★★ |
| [FND-OPT-002](../FND/OPT.md#FND-OPT-002) | 用梯度下降最小化二次函数 f(w)=\frac12(100w_1^2+w_2^2)，… | 进阶 | ★★ |
| [FND-OPT-007](../FND/OPT.md#FND-OPT-007) | 某参数的梯度在每一步都恒为 g=2，忽略 \epsilon。 (1) 用 Adagr… | 进阶 | ★ |
| [FND-OPT-008](../FND/OPT.md#FND-OPT-008) | Adam 的超参数为 \beta_1=0.9、\beta_2=0.999、学习率 \… | 进阶 | ★★★ |
| [FND-OPT-015](../FND/OPT.md#FND-OPT-015) | 某次训练共 100000 步，学习率调度为：前 2000 步从 0 线性升到峰值 3… | 进阶 | ★★ |
| [FND-OPT-020](../FND/OPT.md#FND-OPT-020) | 某模型只有两组参数，一次反向后的梯度为：A 组 (3,4)，B 组 (12)。阈值为… | 基础 | ★★ |
| [INF-BASE-006](../INF/BASE.md#INF-BASE-006) | 一次压测中只有两个流式请求： - 请求 A 输出 11 个 token，相邻 tok… | 进阶 | ★★ |
| [INF-BASE-015](../INF/BASE.md#INF-BASE-015) | 只考虑 Decode 阶段的线性层（以读取权重为主，忽略激活与 KV 的读写），ba… | 挑战 | ★★ |
| [INF-BASE-017](../INF/BASE.md#INF-BASE-017) | DeepSeek-V3 使用 MLA：每层 128 个注意力头，每个 token 只… | 挑战 | ★ |
| [INF-BASE-019](../INF/BASE.md#INF-BASE-019) | Llama-3-8B（约 8.03B 参数，BF16 权重约 16.06 GB；每个… | 进阶 | ★★★ |
| [INF-BASE-022](../INF/BASE.md#INF-BASE-022) | Mixtral 8×7B 共 32 层，每层 8 个专家，每个 token 选 2 … | 挑战 | ★★ |
| [INF-BASE-024](../INF/BASE.md#INF-BASE-024) | Llama-3-70B（约 70.6B 参数，BF16）用 4 张 H100 SXM… | 挑战 | ★★ |
| [INF-BASE-027](../INF/BASE.md#INF-BASE-027) | 某服务的 Prefill 有效速度约 12500 token/s，Decode 的 … | 进阶 | ★★ |
| [INF-BASE-037](../INF/BASE.md#INF-BASE-037) | MBU（Model Bandwidth Utilization）=（每步需要读取的权… | 进阶 | ★★ |
| [INF-BASE-044](../INF/BASE.md#INF-BASE-044) | 一批 8 个请求做静态批处理的 Prefill，提示词长度分别为 120、150、2… | 进阶 | ★★ |
| [INF-KERNEL-003](../INF/KERNEL.md#INF-KERNEL-003) | 标准（朴素）注意力的实现分三步：计算 S=QK^\top 写回 HBM；读出 S 做… | 进阶 | ★★ |
| [INF-KERNEL-013](../INF/KERNEL.md#INF-KERNEL-013) | 对单个注意力头，序列长度 N=8192，头维度 d=128。只计注意力中的矩阵乘（每… | 进阶 | ★★ |
| [INF-KERNEL-019](../INF/KERNEL.md#INF-KERNEL-019) | FlashAttention-3 论文指出：H100 SXM5 的 FP16 矩阵乘… | 挑战 | ★ |
| [INF-KERNEL-022](../INF/KERNEL.md#INF-KERNEL-022) | 在 H100（132 个 SM）上用 Llama-3-8B（32 个 Query 头… | 进阶 | ★★ |
| [INF-KERNEL-024](../INF/KERNEL.md#INF-KERNEL-024) | SwiGLU 的激活部分计算 y=\mathrm{SiLU}(g)\odot u，其… | 基础 | ★★ |
| [INF-KERNEL-027](../INF/KERNEL.md#INF-KERNEL-027) | 某小模型 Decode 一步需要依次发射 300 个 kernel，CPU 发射每个… | 进阶 | ★★ |
| [INF-KERNEL-033](../INF/KERNEL.md#INF-KERNEL-033) | A100（计算能力 8.0）每个 SM 的资源上限为：最多 64 个活跃 warp（… | 进阶 | ★ |
| [INF-KV-004](../INF/KV.md#INF-KV-004) | 用 vLLM 在 H100 上部署 Llama-3-8B（BF16；32 层、8 个… | 进阶 | ★★★ |
| [INF-KV-007](../INF/KV.md#INF-KV-007) | 某服务把 max_tokens 统一设为 2048，请求的提示词平均 500 tok… | 进阶 | ★★ |
| [INF-KV-020](../INF/KV.md#INF-KV-020) | 一个 Agent 任务共调用模型 10 次。第 1 次的提示词为 8000 toke… | 进阶 | ★★★ |
| [INF-KV-027](../INF/KV.md#INF-KV-027) | Llama-3-8B 每个 token 的 KV 共有 2\times32\time… | 进阶 | ★★ |
| [INF-KV-034](../INF/KV.md#INF-KV-034) | Agent 会话在等待工具返回期间，其 32K（32768）token 的 KV（L… | 进阶 | ★★ |
| [INF-KV-037](../INF/KV.md#INF-KV-037) | 设想把 Llama-3-8B 的结构（32 层、8 个 KV 头、头维度 128，约… | 挑战 | ★★ |
| [INF-QUANT-002](../INF/QUANT.md#INF-QUANT-002) | 对向量 x=[0.8,\ -2.54,\ 0.033,\ 1.5] 做逐张量（整个向… | 进阶 | ★★★ |
| [INF-QUANT-019](../INF/QUANT.md#INF-QUANT-019) | SmoothQuant 为每个输入通道 j 取 s_j=\maxX_j^{\alph… | 进阶 | ★★ |
| [INF-QUANT-034](../INF/QUANT.md#INF-QUANT-034) | Llama-3-70B 约 70.55B 参数，其中词嵌入与 lm_head 各约 … | 进阶 | ★★★ |
| [INF-QUANT-036](../INF/QUANT.md#INF-QUANT-036) | Llama-3-8B（BF16 权重 16.06 GB；每个 token 的 KV … | 进阶 | ★★ |
| [INF-SCHED-002](../INF/SCHED.md#INF-SCHED-002) | batch 上限为 4。4 个请求同时到达，输出长度分别为 10、50、100、50… | 基础 | ★★ |
| [INF-SCHED-011](../INF/SCHED.md#INF-SCHED-011) | 某服务的单步耗时模型为：t=5\ \text{ms}+0.02\ \text{ms}… | 进阶 | ★★★ |
| [INF-SCHED-016](../INF/SCHED.md#INF-SCHED-016) | Llama-3-8B 部署在 H100 上。某请求的提示词 1000 token，生… | 挑战 | ★ |
| [INF-SCHED-020](../INF/SCHED.md#INF-SCHED-020) | 按 VTC 的思路做多租户公平调度（简化版）： - 服务完一个请求，其租户的计数器增… | 进阶 | ★ |
| [INF-SCHED-023](../INF/SCHED.md#INF-SCHED-023) | PD 分离部署 Llama-3-70B（80 层、64 个 Query 头、8 个 … | 进阶 | ★★ |
| [INF-SCHED-024](../INF/SCHED.md#INF-SCHED-024) | 某业务峰值 20 req/s，平均输入 2000 token、输出 250 toke… | 进阶 | ★★ |
| [INF-SERVE-010](../INF/SERVE.md#INF-SERVE-010) | 在一台笔记本上用 llama.cpp 运行 13B 模型的 Q4_0 版本：模型共 … | 进阶 | ★★ |
| [INF-SERVE-012](../INF/SERVE.md#INF-SERVE-012) | Llama-3-70B（80 层，BF16 权重约 141 GB）在 H100（显存… | 挑战 | ★★ |
| [INF-SERVE-027](../INF/SERVE.md#INF-SERVE-027) | 某 8B 对话服务的流量画像：峰值 40 QPS；平均每个请求输入 2000 tok… | 挑战 | ★★★ |
| [INF-SERVE-028](../INF/SERVE.md#INF-SERVE-028) | 自部署推理服务：每张 H100 的成本按每小时 2.5 美元计；按当前负载压测，单卡… | 进阶 | ★★ |
| [INF-SERVE-040](../INF/SERVE.md#INF-SERVE-040) | Qwen3-235B-A22B 的公开配置：总参数约 235B（其中各层专家约 22… | 挑战 | ★★★ |
| [INF-SERVE-041](../INF/SERVE.md#INF-SERVE-041) | DeepSeek-V3 总参数约 671B，其中路由专家约 654B，其余（MLA … | 挑战 | ★★★ |
| [INF-SPEC-004](../INF/SPEC.md#INF-SPEC-004) | 某投机解码配置中，草稿 token 的接受率 \alpha=0.7（假设各位置的接受… | 进阶 | ★★★ |
| [INF-SPEC-005](../INF/SPEC.md#INF-SPEC-005) | 为一个 70B 目标模型挑选独立草稿模型，草稿长度 \gamma=4（接受相互独立，… | 挑战 | ★★ |
| [INF-SPEC-025](../INF/SPEC.md#INF-SPEC-025) | Llama-3-8B（约 8\times10^9 参数，BF16 权重 16 GB）… | 进阶 | ★★ |
| [LLM-ARCH-025](../LLM/ARCH.md#LLM-ARCH-025) | Llama-2-7B 的配置：词表 V=32000，d=4096，32 层，32 个… | 进阶 | ★★★ |
| [LLM-ARCH-028](../LLM/ARCH.md#LLM-ARCH-028) | Llama-3-8B（参数量 8.03\times10^9）预训练约用了 15T t… | 进阶 | ★★ |
| [LLM-ARCH-029](../LLM/ARCH.md#LLM-ARCH-029) | 用 Llama-2-7B（N=6.74\times10^9，32 层，d=4096）… | 挑战 | ★ |
| [LLM-ARCH-033](../LLM/ARCH.md#LLM-ARCH-033) | 用 Llama-3-8B（词表 V=128256，d=4096）做 SFT，单条序列… | 进阶 | ★★ |
| [LLM-ARCH-037](../LLM/ARCH.md#LLM-ARCH-037) | Korthikanti 等（2022）给出 GPT 式 Transformer 层在… | 挑战 | ★ |
| [LLM-ATTN-006](../LLM/ATTN.md#LLM-ATTN-006) | Llama-2-7B 使用 MHA：32 层，32 个头，每头维度 128，KV C… | 进阶 | ★★★ |
| [LLM-ATTN-023](../LLM/ATTN.md#LLM-ATTN-023) | DeepSeek-V3 共 61 层、每层 128 个注意力头，采用 MLA：每层每… | 进阶 | ★★ |
| [LLM-ATTN-029](../LLM/ATTN.md#LLM-ATTN-029) | 某模型每层 32 个注意力头，打分矩阵用 FP16 存储。若用不分块的朴素实现，对一… | 进阶 | ★★ |
| [LLM-ATTN-030](../LLM/ATTN.md#LLM-ATTN-030) | 估算一层 Transformer 的前向 FLOPs：线性部分（Q、K、V、O 投影… | 挑战 | ★ |
| [LLM-ATTN-034](../LLM/ATTN.md#LLM-ATTN-034) | Gemma 3 采用「每 5 个局部滑动窗口层配 1 个全局注意力层」的交替结构，局… | 进阶 | ★ |
| [LLM-DEC-002](../LLM/DEC.md#LLM-DEC-002) | 某一步的 logits 为 (2,\ 1,\ 0)。分别计算温度 T=0.5、1、2… | 进阶 | ★★★ |
| [LLM-DEC-009](../LLM/DEC.md#LLM-DEC-009) | 某一步的 logits 为 (3,\ 2,\ 1,\ 0)，设置温度 T=2、top… | 挑战 | ★★ |
| [LLM-DEC-016](../LLM/DEC.md#LLM-DEC-016) | 一个两步生成的例子：第 1 步，token A、B、C 的概率为 0.5、0.4、0… | 进阶 | ★★★ |
| [LLM-DEC-025](../LLM/DEC.md#LLM-DEC-025) | 一个玩具语言模型只生成两个 token：第 1 个 token 为 A 的概率 0.… | 挑战 | ★★ |
| [LLM-MM-001](../LLM/MM.md#LLM-MM-001) | ViT-B/16 把 224×224 的 RGB 图像切成 16×16 的 patc… | 基础 | ★★★ |
| [LLM-MM-015](../LLM/MM.md#LLM-MM-015) | 比较三种处理图像分辨率的方式下，进入语言模型的视觉 token 数： (1) Qwe… | 进阶 | ★★★ |
| [LLM-MM-019](../LLM/MM.md#LLM-MM-019) | Qwen2-VL 处理视频时：每秒采样 2 帧；用时间深度为 2 的 3D 卷积，把… | 挑战 | ★★ |
| [LLM-MM-028](../LLM/MM.md#LLM-MM-028) | 神经音频编解码器（audio tokenizer）用残差向量量化（RVQ）把语音变成… | 进阶 | ★★ |
| [LLM-MM-034](../LLM/MM.md#LLM-MM-034) | 用 CHAIR 指标评估模型 A 的图像描述中的物体幻觉（下表列出每张图真实存在的物… | 进阶 | ★ |
| [LLM-MM-039](../LLM/MM.md#LLM-MM-039) | Stable Diffusion 一类的潜空间扩散模型先用 VAE 把图像在空间上下… | 进阶 | ★★ |
| [LLM-MODEL-017](../LLM/MODEL.md#LLM-MODEL-017) | DeepSeek-V3 技术报告给出：每训练 1T token 需要 18 万（18… | 进阶 | ★★★ |
| [LLM-MOE-002](../LLM/MOE.md#LLM-MOE-002) | Mixtral 8×7B 的公开配置：32 层，d=4096；32 个 Query … | 进阶 | ★★★ |
| [LLM-MOE-008](../LLM/MOE.md#LLM-MOE-008) | 一个 4 专家、top-1 路由的 MoE 层，某批次统计到：实际分配比例 f=(0… | 进阶 | ★★★ |
| [LLM-MOE-023](../LLM/MOE.md#LLM-MOE-023) | 一个 MoE 层用 8 张卡做专家并行，每张卡放 8 个专家。某一步 dispatc… | 挑战 | ★★ |
| [LLM-MOE-025](../LLM/MOE.md#LLM-MOE-025) | 某 MoE 模型每层有 256 个路由专家，每个 token 激活 8 个。Deco… | 挑战 | ★★ |
| [LLM-NEW-006](../LLM/NEW.md#LLM-NEW-006) | 某模型共 32 层，每层 32 个头，头维度 d=128，用 BF16 存储。比较两… | 进阶 | ★★ |
| [LLM-NEW-010](../LLM/NEW.md#LLM-NEW-010) | Jamba（2024 年 3 月）共 32 层，注意力层与 Mamba 层之比为 1… | 进阶 | ★★ |
| [LLM-NEW-017](../LLM/NEW.md#LLM-NEW-017) | NSA 在 64K（65536）长度下解码时，每个 query 需要读取：压缩分支的… | 基础 | ★ |
| [LLM-NEW-021](../LLM/NEW.md#LLM-NEW-021) | 在手机上本地运行一个 3B 参数的语言模型。假设手机可用的内存带宽约为 60 GB/… | 基础 | ★★ |
| [LLM-POS-017](../LLM/POS.md#LLM-POS-017) | RoPE 第 i 对维度的频率为 \theta_i=\mathrm{base}^{-… | 进阶 | ★★ |
| [LLM-POS-023](../LLM/POS.md#LLM-POS-023) | 头维度 d=128 的 RoPE 模型在长度 L=4096 上训练，第 i 对维度（… | 挑战 | ★ |
| [LLM-POS-028](../LLM/POS.md#LLM-POS-028) | NTK-aware 缩放不改位置、只放大 RoPE 的 base，目标是：最高频维度… | 挑战 | ★★ |
| [LLM-POS-032](../LLM/POS.md#LLM-POS-032) | 某模型头维度 d=128、RoPE base =10^6、原始训练长度 L=3276… | 挑战 | ★ |
| [LLM-TOK-002](../LLM/TOK.md#LLM-TOK-002) | 用字符级 BPE 在下面的小语料上训练。规则：只在词内合并、不跨词，不加词尾标记；每… | 进阶 | ★★★ |
| [LLM-TOK-012](../LLM/TOK.md#LLM-TOK-012) | 某模型隐藏维度 d=4096，各层注意力与 FFN 的参数合计 6.5\times1… | 挑战 | ★★ |
| [LLM-TOK-027](../LLM/TOK.md#LLM-TOK-027) | 扩充词表时要为新 token 初始化输出层向量（某 token 的 logit = … | 挑战 | ★★ |
| [RAG-ADV-004](../RAG/ADV.md#RAG-ADV-004) | 估算 GraphRAG 的索引成本（价格为假设值）。语料共 100 万 token，… | 挑战 | ★ |
| [RAG-ADV-018](../RAG/ADV.md#RAG-ADV-018) | 用 Contextual Retrieval 为一篇 8,000 token 的文档… | 进阶 | ★ |
| [RAG-BASE-006](../RAG/BASE.md#RAG-BASE-006) | 某知识库共 12 万 token。输入价格按 2.5 美元 / 百万 token 计… | 进阶 | ★★ |
| [RAG-BASE-026](../RAG/BASE.md#RAG-BASE-026) | 某 RAG 系统一次请求的各环节耗时如下： - 查询改写（调用一次 LLM）：300… | 挑战 | ★★ |
| [RAG-CHUNK-006](../RAG/CHUNK.md#RAG-CHUNK-006) | 一篇 10,000 token 的文档按固定长度切块：块大小 512 token，相… | 进阶 | ★★ |
| [RAG-CHUNK-007](../RAG/CHUNK.md#RAG-CHUNK-007) | 某知识库共约 2 亿 token。方案一：块大小 400 token、重叠 80；方… | 进阶 | ★★ |
| [RAG-EMB-006](../RAG/EMB.md#RAG-EMB-006) | 某个问题与 4 个候选文档的余弦相似度为：正例 0.70，难负例 0.65，两个易负… | 进阶 | ★★ |
| [RAG-EMB-021](../RAG/EMB.md#RAG-EMB-021) | 知识库有 5,000 万个块。方案一：使用 3,072 维 float32 向量；方… | 进阶 | ★★ |
| [RAG-EMB-027](../RAG/EMB.md#RAG-EMB-027) | 对 1,000 万个 1,024 维 float32 向量做暴力内积检索。(1) 单… | 挑战 | ★★ |
| [RAG-EMB-029](../RAG/EMB.md#RAG-EMB-029) | 为 1 亿个 768 维向量建立 IVF 索引，nlist = 65,536，假设各… | 进阶 | ★★ |
| [RAG-EMB-033](../RAG/EMB.md#RAG-EMB-033) | 1 亿个 768 维 float32 向量，用 PQ 压缩：m=96 段（每段 8 … | 挑战 | ★★ |
| [RAG-EMB-036](../RAG/EMB.md#RAG-EMB-036) | 为 1,000 万个 768 维 float32 向量建 HNSW 索引，M = 1… | 进阶 | ★★ |
| [RAG-EMB-041](../RAG/EMB.md#RAG-EMB-041) | 知识库共有 8,000 万个块，要从旧 Embedding 模型（768 维）迁移到… | 进阶 | ★★ |
| [RAG-EVAL-002](../RAG/EVAL.md#RAG-EVAL-002) | 某查询的检索结果按名次为 [d7, d2, d5, d1, d9]。标注的相关文档及… | 进阶 | ★★★ |
| [RAG-EVAL-010](../RAG/EVAL.md#RAG-EVAL-010) | RAGAS 的上下文精确率（context precision）定义为： \math… | 进阶 | ★★ |
| [RAG-EVAL-018](../RAG/EVAL.md#RAG-EVAL-018) | 为了校准一个判断「回答是否忠实」的 LLM 评审，团队请人工标注了 200 条回答，… | 进阶 | ★★ |
| [RAG-QUERY-022](../RAG/QUERY.md#RAG-QUERY-022) | 为拒答阈值做标定。评测集有 200 道可回答的题和 100 道知识库中没有答案的题。… | 进阶 | ★★ |
| [RAG-RETR-004](../RAG/RETR.md#RAG-RETR-004) | 语料共 N=5 篇文档，平均长度 avgdl = 10 个词。查询为「VPN 证书」… | 挑战 | ★★★ |
| [RAG-RETR-018](../RAG/RETR.md#RAG-RETR-018) | 三路召回各返回 top-5（按名次从高到低）： - 向量检索：A、B、C、D、E -… | 进阶 | ★★★ |
| [RAG-RETR-023](../RAG/RETR.md#RAG-RETR-023) | 向量路返回：A 0.82、B 0.80、C 0.78（余弦）；BM25 路返回：C … | 进阶 | ★★ |
| [RAG-RETR-027](../RAG/RETR.md#RAG-RETR-027) | 某 Cross-Encoder 在 GPU 上每次前向处理一批 32 个（问题，文档… | 进阶 | ★★ |
| [SEC-AGENT-017](../SEC/AGENT.md#SEC-AGENT-017) | 某 Agent 被注入后，试图通过回答里的 Markdown 图片外泄一位用户的收件… | 基础 | ★★ |
| [SEC-AGENT-042](../SEC/AGENT.md#SEC-AGENT-042) | 某邮件助手 Agent 每一步约消耗 25,000 个输入 token 和 500 … | 进阶 | ★★ |
| [SEC-DEF-005](../SEC/DEF.md#SEC-DEF-005) | 某 Agent 有三道概率性防线：输入注入分类器、模型层的指令层级训练、输出护栏模型… | 进阶 | ★★ |
| [SEC-DEF-027](../SEC/DEF.md#SEC-DEF-027) | 某防御配置在 300 次相互独立的注入尝试中，攻击成功 0 次。 (1) 能否据此说… | 挑战 | ★ |
| [SEC-DEF-029](../SEC/DEF.md#SEC-DEF-029) | 某团队在同一评测集上比较两种防御配置。评测集包含 200 个正常任务，以及 400 … | 进阶 | ★★ |
| [SEC-INJ-006](../SEC/INJ.md#SEC-INJ-006) | Anthropic 在 2025 年 8 月公布的浏览器 Agent 红队数据中，加… | 进阶 | ★★ |
| [SEC-INJ-027](../SEC/INJ.md#SEC-INJ-027) | 某注入检测分类器在内部评测集上的召回率为 95%，误报率（把正常输入判为攻击的比例）… | 进阶 | ★★★ |
| [SEC-REL-013](../SEC/REL.md#SEC-REL-013) | 某多分类模型在 20 条验证样本上的预测，按最高类别的置信度分到 5 个等宽箱中（另… | 挑战 | ★★ |
| [SEC-REL-016](../SEC/REL.md#SEC-REL-016) | 在同一份 100 题的知识问答评测上： - 模型 A 从不拒答：答对 60 题，答错… | 进阶 | ★★ |
| [TRN-ADAPT-004](../TRN/ADAPT.md#TRN-ADAPT-004) | 团队要对一个 7B 基座模型做领域继续预训练：领域语料 40B token，计划让通… | 进阶 | ★★ |
| [TRN-ADAPT-019](../TRN/ADAPT.md#TRN-ADAPT-019) | 计划离线保存教师模型的输出，在 10B token 的语料上做 logits 蒸馏。… | 进阶 | ★ |
| [TRN-DATA-011](../TRN/DATA.md#TRN-DATA-011) | FineWeb 的 MinHash 去重使用 5-gram、共 112 个哈希函数，… | 挑战 | ★★★ |
| [TRN-DATA-024](../TRN/DATA.md#TRN-DATA-024) | 计划用 2T token 预训练一个模型，各数据源（已去重、过滤）的可用量与计划采样… | 进阶 | ★★ |
| [TRN-DIST-005](../TRN/DIST.md#TRN-DIST-005) | 用环形（Ring）AllReduce 同步一个 7B 模型的 BF16 梯度（共 7… | 进阶 | ★★★ |
| [TRN-DIST-020](../TRN/DIST.md#TRN-DIST-020) | 用 TP=8 训练 Llama-2-70B（80 层，隐藏维度 h=8192），mi… | 进阶 | ★★ |
| [TRN-DIST-026](../TRN/DIST.md#TRN-DIST-026) | 某模型用 TP=8、PP=8 训练，全局 batch 固定为 1024 条序列，mi… | 进阶 | ★★ |
| [TRN-DIST-040](../TRN/DIST.md#TRN-DIST-040) | 用 1024 张卡训练一个 175B 模型：TP=8、PP=8、DP=16，混合精度… | 进阶 | ★★ |
| [TRN-DIST-045](../TRN/DIST.md#TRN-DIST-045) | 某个上万卡的预训练任务平均每 3 小时发生一次导致任务中断的故障（MTBF M=18… | 挑战 | ★ |
| [TRN-MEM-004](../TRN/MEM.md#TRN-MEM-004) | 单张 80 GB 的 GPU（按 1 GB = 10^9 字节计），忽略激活与临时缓… | 基础 | ★★ |
| [TRN-MEM-005](../TRN/MEM.md#TRN-MEM-005) | 某 1.5B 参数的模型：隐藏维度 h=1536，28 层，词表 V=151936。… | 挑战 | ★★ |
| [TRN-MEM-010](../TRN/MEM.md#TRN-MEM-010) | 以 Llama-2-7B（32 层，h=4096）为例，按「每层激活约 34sbh … | 进阶 | ★★★ |
| [TRN-MEM-025](../TRN/MEM.md#TRN-MEM-025) | 用 PyTorch GradScaler 做 FP16 训练：初始 scale 为 … | 进阶 | ★★ |
| [TRN-MEM-032](../TRN/MEM.md#TRN-MEM-032) | 用 ZeRO-Offload 在单张 A100 上训练一个 13B 模型：每步把 F… | 挑战 | ★★ |
| [TRN-PEFT-005](../TRN/PEFT.md#TRN-PEFT-005) | Llama-3-8B 共 32 层，隐藏维度 4096，MLP 中间维度 14336… | 进阶 | ★★★ |
| [TRN-PEFT-032](../TRN/PEFT.md#TRN-PEFT-032) | 某平台要为 100 个客户各定制一个 Llama-2-7B（约 6.74B 参数）。… | 基础 | ★★ |
| [TRN-PEFT-036](../TRN/PEFT.md#TRN-PEFT-036) | Llama-2-13B 共 13,015,864,320 个参数：40 层，隐藏维度… | 进阶 | ★★ |
| [TRN-PT-005](../TRN/PT.md#TRN-PT-005) | 某模型在一份英文验证集上的平均交叉熵损失为 2.0 nat/token（自然对数），… | 基础 | ★★★ |
| [TRN-PT-012](../TRN/PT.md#TRN-PT-012) | 团队有 1000 张 H100（BF16 稠密峰值约 989 TFLOPS），可以连… | 进阶 | ★★★ |
| [TRN-PT-013](../TRN/PT.md#TRN-PT-013) | Chinchilla 用参数化损失 L(N,D)=E+\dfrac{A}{N^{\a… | 挑战 | ★ |
| [TRN-PT-016](../TRN/PT.md#TRN-PT-016) | 假设实验表明下面两个方案能达到相同的模型质量：方案 A 为 70B 参数、训练 1.… | 挑战 | ★★ |
| [TRN-PT-019](../TRN/PT.md#TRN-PT-019) | Llama 2 论文报告：70B 模型预训练了 2T token，消耗约 172 万… | 进阶 | ★★ |
