# 判断题（366 道）

| 编号 | 题目 | 难度 | 考频 |
|---|---|---|---|
| [AGT-APP-011](../AGT/APP.md#AGT-APP-011) | 模型生成的 unified diff 经常因为 hunk 头里的行数与实际内容不符而… | 进阶 | ★★ |
| [AGT-APP-017](../AGT/APP.md#AGT-APP-017) | Agentless 中的「Agentless」意思是整个流程不使用大模型，而是依靠静… | 基础 | ★★ |
| [AGT-APP-021](../AGT/APP.md#AGT-APP-021) | 核查 Deep Research 报告的引用时，重点是确认每条引用的链接真实存在、能… | 基础 | ★★★ |
| [AGT-APP-026](../AGT/APP.md#AGT-APP-026) | 浏览器 Agent 把页面精简成带编号的可交互元素列表交给模型。这些编号在每次观察时… | 基础 | ★★ |
| [AGT-APP-037](../AGT/APP.md#AGT-APP-037) | 客服 Agent 调用退款工具之前，让模型再做一轮「这笔退款是否符合政策」的自我核对… | 进阶 | ★★ |
| [AGT-BASE-003](../AGT/BASE.md#AGT-BASE-003) | 某客服机器人接入了 Function Calling：每轮根据用户问题最多调用一次查… | 基础 | ★★★ |
| [AGT-BASE-006](../AGT/BASE.md#AGT-BASE-006) | 在 Anthropic 的划分里，工作流与 Agent 都属于智能体系统（agent… | 基础 | ★★ |
| [AGT-BASE-012](../AGT/BASE.md#AGT-BASE-012) | 并行化（分段）与编排者-工作者在拓扑上很像，区别在于：分段的子任务由中心 LLM 根… | 进阶 | ★★ |
| [AGT-BASE-020](../AGT/BASE.md#AGT-BASE-020) | 在 Agent 循环中，模型不再请求工具、给出最终回答，就表示任务已经成功完成；因此… | 基础 | ★★★ |
| [AGT-BASE-030](../AGT/BASE.md#AGT-BASE-030) | 提示链（prompt chaining）的核心取舍，是用多次 LLM 调用带来的额外… | 基础 | ★★ |
| [AGT-FW-004](../AGT/FW.md#AGT-FW-004) | LangGraph 是 LangChain 的升级版，必须依赖 LangChain … | 基础 | ★★ |
| [AGT-FW-012](../AGT/FW.md#AGT-FW-012) | LangGraph 的 InMemorySaver 只适合开发和测试；如果把它带上生… | 基础 | ★★ |
| [AGT-FW-014](../AGT/FW.md#AGT-FW-014) | LangGraph 的时间旅行相当于「撤销」：从某个旧检查点回放后，该检查点之后已经… | 基础 | ★★ |
| [AGT-FW-023](../AGT/FW.md#AGT-FW-023) | 在 OpenAI Agents SDK 中，只要入口 Agent 配置了输入护栏，转… | 进阶 | ★★ |
| [AGT-FW-026](../AGT/FW.md#AGT-FW-026) | Google ADK 的 ParallelAgent 中，各子 Agent 共享同一… | 进阶 | ★ |
| [AGT-FW-034](../AGT/FW.md#AGT-FW-034) | ChatDev 按瀑布模型把软件开发拆成设计、编码、测试、文档等阶段，串成「聊天链」… | 基础 | ★ |
| [AGT-HARNESS-003](../AGT/HARNESS.md#AGT-HARNESS-003) | mini-swe-agent 的 Agent 类只有约 100 行、只给模型一个 b… | 进阶 | ★★ |
| [AGT-HARNESS-013](../AGT/HARNESS.md#AGT-HARNESS-013) | Claude Code 的检查点以文件编辑工具做出的修改为追踪对象：只被 Bash … | 基础 | ★★ |
| [AGT-HARNESS-020](../AGT/HARNESS.md#AGT-HARNESS-020) | 在项目的 CLAUDE.md 里写明「禁止 push 到 main 分支」，就能保证… | 基础 | ★★★ |
| [AGT-HARNESS-031](../AGT/HARNESS.md#AGT-HARNESS-031) | Claude Code 中可以用带 YAML 头的 Markdown 文件定义子 A… | 基础 | ★★ |
| [AGT-HARNESS-033](../AGT/HARNESS.md#AGT-HARNESS-033) | Voyager 的技能库与 Agent Skills（SKILL.md 加脚本）本质… | 进阶 | ★★ |
| [AGT-HARNESS-041](../AGT/HARNESS.md#AGT-HARNESS-041) | 既然 lint、测试等事后检查能确定性地发现违规，Harness 中就不必再在 AG… | 进阶 | ★★ |
| [AGT-HARNESS-044](../AGT/HARNESS.md#AGT-HARNESS-044) | 在 Spec 驱动开发中，实现阶段如果发现规格有遗漏或错误，合理的做法是先修改规格（… | 基础 | ★★ |
| [AGT-MEM-008](../AGT/MEM.md#AGT-MEM-008) | 采用「只保留最近 N 轮」的滑动窗口时，系统提示词始终位于最前面，所以每轮丢弃最旧的… | 进阶 | ★★ |
| [AGT-MEM-015](../AGT/MEM.md#AGT-MEM-015) | 清理旧工具输出是一种「可恢复」的压缩：只要保留文件路径、URL、查询语句等重新获取的… | 基础 | ★★ |
| [AGT-MEM-029](../AGT/MEM.md#AGT-MEM-029) | Mem0 式记忆层中已有记忆「喜欢喝咖啡」，用户说：「最近胃不好，我已经戒咖啡了。」… | 进阶 | ★★ |
| [AGT-MEM-038](../AGT/MEM.md#AGT-MEM-038) | Prompt Caching 命中时，模型处理的输入内容与不使用缓存时完全相同，因此… | 基础 | ★★ |
| [AGT-MEM-040](../AGT/MEM.md#AGT-MEM-040) | 用户先说「我喜欢跑步」，后来又说「我最近迷上了游泳」。由于两条信息都属于「爱好」，记… | 基础 | ★★ |
| [AGT-MEM-042](../AGT/MEM.md#AGT-MEM-042) | 用户行使删除权时，除了原始对话和从中抽取的事实，用到了其数据的摘要、反思和组织级统计… | 进阶 | ★★ |
| [AGT-MEM-051](../AGT/MEM.md#AGT-MEM-051) | 记忆管理可以看作上下文工程的一部分：长期记忆决定把哪些信息写到上下文之外、何时再取回… | 进阶 | ★★ |
| [AGT-MULTI-004](../AGT/MULTI.md#AGT-MULTI-004) | Anthropic 的多 Agent 研究系统在内部评测上明显优于单 Agent，其… | 进阶 | ★★ |
| [AGT-MULTI-011](../AGT/MULTI.md#AGT-MULTI-011) | 层级式多 Agent（总编排者 → 小组长 → 工作者）中，层数越多，每个编排者直接… | 基础 | ★★ |
| [AGT-MULTI-017](../AGT/MULTI.md#AGT-MULTI-017) | 多数投票能提升准确率，前提是各 Agent 的错误相互独立；如果 5 个 Agent… | 基础 | ★★★ |
| [AGT-MULTI-032](../AGT/MULTI.md#AGT-MULTI-032) | 外部服务不支持幂等键时，Agent 在崩溃恢复中没有办法确认「创建工单」「发送通知」… | 进阶 | ★★ |
| [AGT-MULTI-034](../AGT/MULTI.md#AGT-MULTI-034) | 在多 Agent 系统中用悲观锁保护共享资源时，锁必须带超时：Agent 一次推理可… | 基础 | ★★ |
| [AGT-PLAN-002](../AGT/PLAN.md#AGT-PLAN-002) | Wei 等人（2022）的思维链论文发现，CoT 提示对各种规模的模型都有明显提升，… | 进阶 | ★★ |
| [AGT-PLAN-004](../AGT/PLAN.md#AGT-PLAN-004) | 把 Self-Consistency 的采样温度设为 0，可以保证每条推理路径都是模… | 基础 | ★★ |
| [AGT-PLAN-014](../AGT/PLAN.md#AGT-PLAN-014) | ReAct 相比 CoT 的优势，来自「思考—行动—观察」循环让模型可以多次复核自己… | 进阶 | ★★ |
| [AGT-PLAN-019](../AGT/PLAN.md#AGT-PLAN-019) | ReWOO 中，Worker 得到的工具观察不会回流给规划器重新规划。因此如果计划中… | 进阶 | ★★ |
| [AGT-PLAN-022](../AGT/PLAN.md#AGT-PLAN-022) | 在 LLMCompiler 式执行器中，若规定计划里的每个任务只能引用编号比自己小的… | 进阶 | ★★ |
| [AGT-PLAN-046](../AGT/PLAN.md#AGT-PLAN-046) | Plan 模式的「只读」约束应当由运行时的权限层强制执行（例如规划阶段拒绝文件编辑类… | 进阶 | ★★ |
| [AGT-PROMPT-002](../AGT/PROMPT.md#AGT-PROMPT-002) | 在提示词开头写上「你是一位资深的法律顾问」这类角色设定，就足以让模型稳定地输出符合要… | 基础 | ★★ |
| [AGT-PROMPT-010](../AGT/PROMPT.md#AGT-PROMPT-010) | Turpin 等（2023）在少样本示例中把正确选项都安排成 (A)，模型因此更倾向… | 进阶 | ★★ |
| [AGT-PROMPT-016](../AGT/PROMPT.md#AGT-PROMPT-016) | 使用 OpenAI 的 JSON 模式（response_format 设为 {"t… | 基础 | ★★ |
| [AGT-PROMPT-026](../AGT/PROMPT.md#AGT-PROMPT-026) | 系统提示词对终端用户不可见，因此可以把数据库口令、内部 API 密钥等敏感信息写进系… | 基础 | ★★ |
| [AGT-PROMPT-032](../AGT/PROMPT.md#AGT-PROMPT-032) | DeepSeek-R1 的论文观察到，少样本提示会降低 R1 的表现，因此建议使用零… | 进阶 | ★★ |
| [AGT-PROTO-005](../AGT/PROTO.md#AGT-PROTO-005) | 按 MCP 的设计原则，Server 只能看到 Host 通过请求发给它的内容，既看… | 基础 | ★★ |
| [AGT-PROTO-009](../AGT/PROTO.md#AGT-PROTO-009) | 只要客户端通过 Roots 告诉 MCP Server 可以操作的目录，Server… | 进阶 | ★★ |
| [AGT-PROTO-021](../AGT/PROTO.md#AGT-PROTO-021) | 「Streamable HTTP 就是 SSE」：在这种传输下，服务端对每个 POS… | 基础 | ★★ |
| [AGT-PROTO-026](../AGT/PROTO.md#AGT-PROTO-026) | MCP Server 校验 Bearer 令牌时，确认签名有效、未过期就可以接受请求… | 进阶 | ★★ |
| [AGT-PROTO-028](../AGT/PROTO.md#AGT-PROTO-028) | 不支持原生 Function Calling 的模型，同样可以使用 MCP Serv… | 基础 | ★★ |
| [AGT-PROTO-038](../AGT/PROTO.md#AGT-PROTO-038) | A2A 的设计原则之一是「Agent 不透明」：协作双方不需要共享内部的记忆、工具和… | 基础 | ★★ |
| [AGT-PROTO-048](../AGT/PROTO.md#AGT-PROTO-048) | MCP 规范定义了大模型输出工具调用时使用的 JSON 格式，因此只要各家模型都接入… | 基础 | ★★★ |
| [AGT-PROTO-052](../AGT/PROTO.md#AGT-PROTO-052) | A2A 官方文档把两者的分工概括为：MCP 让单个 Agent 更「深」（接入工具与… | 进阶 | ★★ |
| [AGT-PROTO-053](../AGT/PROTO.md#AGT-PROTO-053) | 把几个少样本示例写进某个 Agent Skill 的 SKILL.md，与把它们直接… | 进阶 | ★★★ |
| [AGT-PROTO-065](../AGT/PROTO.md#AGT-PROTO-065) | 按 MCP 2026-07-28 版规范，Server 处理 tools/call … | 进阶 | ★★ |
| [AGT-PROTO-072](../AGT/PROTO.md#AGT-PROTO-072) | 按 MCP 2026-07-28 版规范，客户端一旦用 subscriptions/… | 基础 | ★★ |
| [AGT-REFL-012](../AGT/REFL.md#AGT-REFL-012) | 让模型多反思几轮总没有坏处：最坏的情况也只是多花一点钱，答案不会变差。 | 基础 | ★★★ |
| [AGT-REFL-013](../AGT/REFL.md#AGT-REFL-013) | Reflexion 的整个过程都不更新模型参数：它把失败经验以自然语言的形式写入记忆… | 基础 | ★★ |
| [AGT-REFL-014](../AGT/REFL.md#AGT-REFL-014) | Self-Refine 比较擅长改进文风、格式和约束满足（如更简洁、覆盖指定要点），… | 进阶 | ★★ |
| [AGT-RL-004](../AGT/RL.md#AGT-RL-004) | 在 Agentic RL 中，PPO、GRPO 都在 token 上计算 log-p… | 进阶 | ★★ |
| [AGT-RL-008](../AGT/RL.md#AGT-RL-008) | 对环境返回的 observation token 做 loss mask 之后，这些… | 基础 | ★★ |
| [AGT-RL-022](../AGT/RL.md#AGT-RL-022) | 即使训练端与推理端使用完全相同的模型权重，推理引擎（如 vLLM、SGLang）与训… | 进阶 | ★★ |
| [AGT-RL-024](../AGT/RL.md#AGT-RL-024) | 在工具增强的 RL 中，RL 阶段的主要收获是让模型学会工具的调用格式；何时调用、查… | 基础 | ★★ |
| [AGT-RL-029](../AGT/RL.md#AGT-RL-029) | 拒绝采样微调可以看作只用正样本、优势恒为 1 的策略梯度：它会提高成功轨迹的概率，但… | 进阶 | ★★ |
| [AGT-TOOL-021](../AGT/TOOL.md#AGT-TOOL-021) | 开启工具调用的严格模式（strict）之后，模型生成的参数一定符合 Schema，因… | 基础 | ★★★ |
| [AGT-TOOL-022](../AGT/TOOL.md#AGT-TOOL-022) | 流式接收工具调用时，即使流已经结束，执行前也应先检查停止原因：如果是因为达到 max… | 进阶 | ★★ |
| [AGT-TOOL-023](../AGT/TOOL.md#AGT-TOOL-023) | 使用 Anthropic Messages API 时，模型一次发起的多个并行调用，… | 进阶 | ★★ |
| [AGT-TOOL-024](../AGT/TOOL.md#AGT-TOOL-024) | 在工具检索中，召回率通常比精确率更关键：正确的工具一旦没被检索出来，模型就根本没有机… | 基础 | ★★ |
| [AGT-TOOL-025](../AGT/TOOL.md#AGT-TOOL-025) | 为了让服务端能区分不同的请求，调用下单接口时，幂等键应当在每次重试时重新生成。 | 进阶 | ★★ |
| [AGT-TOOL-048](../AGT/TOOL.md#AGT-TOOL-048) | 编码 Agent 的 read_file 结果缓存只靠「经由编辑工具写入后失效」是不… | 进阶 | ★★ |
| [AGT-TOOL-051](../AGT/TOOL.md#AGT-TOOL-051) | 原生 Function Calling 在底层已经不再是文本生成：模型直接输出一个结… | 进阶 | ★★★ |
| [ALN-GRPO-008](../ALN/GRPO.md#ALN-GRPO-008) | GRPO 选用 k3 估计器 r-1-\log r，是因为它无偏、恒非负且方差小；因… | 进阶 | ★★ |
| [ALN-GRPO-016](../ALN/GRPO.md#ALN-GRPO-016) | 在 GRPO 训练中，策略熵随训练缓慢下降是正常现象；真正危险的是准确率还没上去，熵… | 基础 | ★★ |
| [ALN-GRPO-021](../ALN/GRPO.md#ALN-GRPO-021) | DAPO 把 loss 从「先在样本内按长度平均」改为「整个 batch 的有效 t… | 进阶 | ★★ |
| [ALN-GRPO-028](../ALN/GRPO.md#ALN-GRPO-028) | GSPO 论文报告，它被裁剪掉的 token 比例比 GRPO 高出约两个数量级；由… | 挑战 | ★ |
| [ALN-GRPO-030](../ALN/GRPO.md#ALN-GRPO-030) | 组大小 G=2 时，只要两个回答的奖励不同，按「减组均值、除以无偏标准差」归一化后，… | 进阶 | ★★ |
| [ALN-GRPO-039](../ALN/GRPO.md#ALN-GRPO-039) | RLVR 用验证器判定奖励，因此经 RLVR 训练出来的模型，其思维链中的每一步推理… | 基础 | ★★ |
| [ALN-GRPO-044](../ALN/GRPO.md#ALN-GRPO-044) | MiniMax-M1 的技术报告发现，训练与推理两端算出的 token 概率存在明显… | 进阶 | ★ |
| [ALN-PO-004](../ALN/PO.md#ALN-PO-004) | 在偏好确实服从 Bradley-Terry 模型、数据覆盖所有回答且数量无限的理想条… | 进阶 | ★★ |
| [ALN-PO-012](../ALN/PO.md#ALN-PO-012) | DPO 中 β 越大，同样的对数概率比对应的隐式奖励差越大，因此模型会被推得离参考模… | 进阶 | ★★ |
| [ALN-PO-016](../ALN/PO.md#ALN-PO-016) | DPO 的隐式奖励 \beta\log\frac{\pi_\theta(y\mid … | 进阶 | ★★ |
| [ALN-PO-021](../ALN/PO.md#ALN-PO-021) | DPO 训练中，验证集上的 margin（chosen 与 rejected 的隐式… | 进阶 | ★★★ |
| [ALN-PO-026](../ALN/PO.md#ALN-PO-026) | KTO 只需要每条回答一个「好 / 坏」二元标签，不需要同一提示词下成对的 chos… | 基础 | ★★ |
| [ALN-PO-042](../ALN/PO.md#ALN-PO-042) | Noukhovitch 等（2024）研究异步 RLHF（推理端用旧权重生成样本、训… | 进阶 | ★ |
| [ALN-REASON-003](../ALN/REASON.md#ALN-REASON-003) | 对推理模型而言，同一道题的思维链写得越长，答案就越可能正确，所以应尽量让模型多想。 | 基础 | ★★ |
| [ALN-REASON-009](../ALN/REASON.md#ALN-REASON-009) | DeepSeek-R1 的冷启动阶段使用了数百万条长思维链数据，目的是在 RL 之前… | 基础 | ★★ |
| [ALN-REASON-012](../ALN/REASON.md#ALN-REASON-012) | DeepSeek-R1 论文中的蒸馏模型（如 DeepSeek-R1-Distill… | 进阶 | ★★ |
| [ALN-REASON-016](../ALN/REASON.md#ALN-REASON-016) | 测试时计算的收益与题目难度有关：对模型已经能稳定做对的简单题，增加采样次数或思考长度… | 基础 | ★★ |
| [ALN-REASON-025](../ALN/REASON.md#ALN-REASON-025) | Qwen3 系列把「思考模式」和「非思考模式」整合在同一个模型中，用户可以按需切换，… | 基础 | ★★ |
| [ALN-REASON-033](../ALN/REASON.md#ALN-REASON-033) | OpenAI 在发布 o1 时展示：模型性能随训练阶段的强化学习算力增加而平稳提升，… | 基础 | ★★ |
| [ALN-REASON-038](../ALN/REASON.md#ALN-REASON-038) | Qwen3 技术报告称，思考预算（thinking budget）能力并不是专门训练… | 进阶 | ★ |
| [ALN-RL-002](../ALN/RL.md#ALN-RL-002) | 马尔可夫性要求「下一状态和奖励只依赖于当前状态与动作，与更早的历史无关」。在 LLM… | 基础 | ★★ |
| [ALN-RL-008](../ALN/RL.md#ALN-RL-008) | 在只在回答结尾给奖励、\gamma=1 的 LLM 生成中（暂不考虑 KL 惩罚），… | 基础 | ★★ |
| [ALN-RL-014](../ALN/RL.md#ALN-RL-014) | 策略梯度方法要求奖励函数对模型参数可导，因此「单元测试是否通过」「最终答案是否正确」… | 基础 | ★★★ |
| [ALN-RL-027](../ALN/RL.md#ALN-RL-027) | 用旧策略 \pi_{\text{old}} 采样的整条轨迹去估计新策略 \pi_\t… | 进阶 | ★★ |
| [ALN-RL-039](../ALN/RL.md#ALN-RL-039) | PPO 的总损失写成 \mathcal{L}=-\mathcal{L}^{\text… | 基础 | ★★ |
| [ALN-RLHF-003](../ALN/RLHF.md#ALN-RLHF-003) | InstructGPT 的第三阶段（PPO）只需要提示词，不需要人工撰写的回答，也不… | 进阶 | ★★ |
| [ALN-RLHF-008](../ALN/RLHF.md#ALN-RLHF-008) | 训练奖励模型时，应把同一提示词排序展开得到的 \binom{K}{2} 个比较对打散… | 进阶 | ★★ |
| [ALN-RLHF-011](../ALN/RLHF.md#ALN-RLHF-011) | Bradley-Terry 损失只依赖分差，因此把奖励模型对所有回答的打分同时乘以 … | 进阶 | ★★ |
| [ALN-RLHF-020](../ALN/RLHF.md#ALN-RLHF-020) | InstructGPT 的 PPO-ptx 在 RL 目标中额外混入了预训练分布上的… | 基础 | ★★ |
| [ALN-RLHF-023](../ALN/RLHF.md#ALN-RLHF-023) | 在 RLHF 的 PPO 中，其他条件不变时，KL 系数 \beta 越大，策略越贴… | 进阶 | ★★ |
| [ALN-RLHF-034](../ALN/RLHF.md#ALN-RLHF-034) | PPO 中对优势做批内白化后，critic 的回归目标也应改为「白化后的优势 + V… | 挑战 | ★ |
| [ALN-RWD-009](../ALN/RWD.md#ALN-RWD-009) | Let's Verify Step by Step 认为，过程监督除了提升效果，还有… | 进阶 | ★★ |
| [ALN-RWD-012](../ALN/RWD.md#ALN-RWD-012) | 训练中出现奖励黑客，说明模型本身「学坏了」；最根本的解决办法是把 KL 系数调大，让… | 基础 | ★★★ |
| [ALN-RWD-017](../ALN/RWD.md#ALN-RWD-017) | best-of-N 采样同样会出现奖励过优化：当 N 足够大时，按代理奖励模型挑出的… | 进阶 | ★★ |
| [ALN-RWD-021](../ALN/RWD.md#ALN-RWD-021) | 奖励模型集成（取多个奖励模型的平均分作为奖励）能缓解奖励黑客，主要是因为平均可以抵消… | 挑战 | ★★ |
| [ALN-RWD-025](../ALN/RWD.md#ALN-RWD-025) | 在 Constitutional AI（Bai 等, 2022）中，有用性的偏好标签… | 进阶 | ★★ |
| [ALN-RWD-034](../ALN/RWD.md#ALN-RWD-034) | RewardBench 2 的作者分析了基准分数与下游效果的关系：分数与 best-… | 进阶 | ★★ |
| [CS-ALGO-003](../CS/ALGO.md#CS-ALGO-003) | Python 的 list.append 均摊时间复杂度是 O(1)，这意味着每一次… | 基础 | ★★ |
| [CS-ALGO-012](../CS/ALGO.md#CS-ALGO-012) | 「二分答案」只要求答案落在一个有界的整数区间内；即使可行性判定 check(x) 关… | 基础 | ★★ |
| [CS-ALGO-043](../CS/ALGO.md#CS-ALGO-043) | 机器内存只有 1 GB，要把 100 GB 的日志按时间排序。可以先把数据分成约 1… | 进阶 | ★★ |
| [CS-DIST-003](../CS/DIST.md#CS-DIST-003) | 最终一致性只保证「如果不再有新的写入，所有副本最终会收敛到相同的值」。因此，一个满足… | 进阶 | ★★ |
| [CS-DIST-010](../CS/DIST.md#CS-DIST-010) | Raft 选举中，候选人 A 的最后一条日志是（任期 2，索引 9），投票者 B 的… | 进阶 | ★★ |
| [CS-DIST-026](../CS/DIST.md#CS-DIST-026) | WordCount 中的 Reduce（对计数求和）可以直接复用为 Combiner… | 基础 | ★★ |
| [CS-NET-006](../CS/NET.md#CS-NET-006) | TCP 发送方在任一时刻能发出、但尚未被确认的数据量，同时受接收方通告的窗口（rwn… | 基础 | ★★ |
| [CS-NET-010](../CS/NET.md#CS-NET-010) | HTTP/3 跑在 UDP 之上，但这并不意味着它是不可靠的：QUIC 在 UDP … | 进阶 | ★★ |
| [CS-NET-011](../CS/NET.md#CS-NET-011) | DNS 查询只使用 UDP 协议，因为 DNS 报文都很小，用不到 TCP。 | 基础 | ★★ |
| [CS-NET-026](../CS/NET.md#CS-NET-026) | WebSocket 规定客户端发往服务端的帧必须做掩码处理，目的是对数据加密、防止链… | 进阶 | ★ |
| [CS-OS-006](../CS/OS.md#CS-OS-006) | 协程由操作系统内核调度：内核可以在任意时刻抢占一个正在运行的协程，切换到同一线程上的… | 基础 | ★★ |
| [CS-OS-008](../CS/OS.md#CS-OS-008) | 某服务每秒的上下文切换次数很高，用 pidstat -w 查看，绝大部分是自愿上下文… | 进阶 | ★★ |
| [CS-OS-019](../CS/OS.md#CS-OS-019) | 使用「非阻塞 socket + epoll」的程序，按经典的 IO 模型划分仍然属于… | 进阶 | ★★ |
| [CS-OS-023](../CS/OS.md#CS-OS-023) | 分页机制把物理内存划分为固定大小的页框，按页分配、不要求连续，因此基本消除了外部碎片… | 基础 | ★★ |
| [CS-PY-002](../CS/PY.md#CS-PY-002) | Python 函数传参时，不可变对象（如 int、str）按值传递，函数拿到的是一份… | 基础 | ★★★ |
| [CS-PY-019](../CS/PY.md#CS-PY-019) | 从 Python 3.7 起，生成器函数体内抛出且未被捕获的 StopIterati… | 进阶 | ★ |
| [CS-PY-025](../CS/PY.md#CS-PY-025) | 因为 CPython 有 GIL，同一时刻只有一个线程在执行字节码，所以多个线程对同… | 基础 | ★★★ |
| [CS-PY-029](../CS/PY.md#CS-PY-029) | ThreadPoolExecutor.map(fn, items) 返回结果的顺序总… | 基础 | ★★ |
| [CS-PY-040](../CS/PY.md#CS-PY-040) | 自定义类只重写了 __eq__、没有定义 __hash__ 时，Python 会把这… | 进阶 | ★★ |
| [CS-PY-043](../CS/PY.md#CS-PY-043) | Python 的类型注解会在运行时被强制检查：函数声明为 def f(x: int)… | 基础 | ★★ |
| [CS-PY-052](../CS/PY.md#CS-PY-052) | itertools.groupby 只把相邻且键相同的元素分为一组，所以想按某个键对… | 进阶 | ★★ |
| [CS-SQL-010](../CS/SQL.md#CS-SQL-010) | 想取每个用户最新的一条记录时，可以直接在同一层查询中写 WHERE ROW_NUMB… | 进阶 | ★★ |
| [CS-SQL-019](../CS/SQL.md#CS-SQL-019) | 在 MySQL InnoDB 中，二级索引（非主键索引）的叶子节点存放的是索引列的值… | 基础 | ★★ |
| [CS-SQL-026](../CS/SQL.md#CS-SQL-026) | MySQL InnoDB 的默认隔离级别是可重复读（REPEATABLE READ）… | 基础 | ★★ |
| [CS-TORCH-006](../CS/TORCH.md#CS-TORCH-006) | 设 a 的形状为 (3, 1)、b 的形状为 (3,)，则 a + b 会广播出形状… | 基础 | ★★ |
| [CS-TORCH-013](../CS/TORCH.md#CS-TORCH-013) | 对一个普通神经网络的 loss（计算图中保存了反向传播所需的中间结果）调用 loss… | 进阶 | ★★ |
| [CS-TORCH-016](../CS/TORCH.md#CS-TORCH-016) | torch.inference_mode() 与 torch.no_grad() 的… | 进阶 | ★★ |
| [CS-TORCH-022](../CS/TORCH.md#CS-TORCH-022) | 评估模型时，model.eval() 与 torch.no_grad() 的作用不同… | 基础 | ★★★ |
| [CS-TORCH-023](../CS/TORCH.md#CS-TORCH-023) | 模型处于训练模式时，只要把前向计算包在 torch.no_grad() 中，Batc… | 进阶 | ★★ |
| [CS-TORCH-033](../CS/TORCH.md#CS-TORCH-033) | 使用 torch.autocast 做混合精度训练时，应该把 loss.backwa… | 进阶 | ★★ |
| [ENG-DESIGN-005](../ENG/DESIGN.md#ENG-DESIGN-005) | 系统设计面试中，面试官对规模、延迟等澄清问题回答「你自己定」时，最稳妥的做法是继续追… | 基础 | ★★ |
| [ENG-DESIGN-008](../ENG/DESIGN.md#ENG-DESIGN-008) | 为了尽快验证业务价值，MVP 阶段可以先不建评测集、不接 Trace，也先不准备回滚… | 基础 | ★★ |
| [ENG-DESIGN-018](../ENG/DESIGN.md#ENG-DESIGN-018) | 提示词放在控制面、可以热更新，所以修改提示词不必重新部署服务，也就不需要再经过离线评… | 基础 | ★★ |
| [ENG-DESIGN-027](../ENG/DESIGN.md#ENG-DESIGN-027) | 如果按意图切片后，每个意图的成功率都没有下降，那么总体成功率也不可能下降。 | 进阶 | ★★ |
| [ENG-DESIGN-042](../ENG/DESIGN.md#ENG-DESIGN-042) | 数据分析 Agent 中的「语义层」（指标字典），主要作用是减少放进上下文的表结构 … | 基础 | ★★ |
| [ENG-OBS-002](../ENG/OBS.md#ENG-OBS-002) | 在 Prometheus 这类时序数据库中，不宜把 task_id、user_id … | 基础 | ★★ |
| [ENG-OBS-008](../ENG/OBS.md#ENG-OBS-008) | 按 OpenTelemetry GenAI 语义约定，提示词和模型输出的正文属于需要… | 基础 | ★★ |
| [ENG-OBS-018](../ENG/OBS.md#ENG-OBS-018) | 调用不带日期的模型别名时，厂商可能在不通知的情况下把别名指向新的模型快照；即使提示词… | 基础 | ★★ |
| [ENG-OBS-026](../ENG/OBS.md#ENG-OBS-026) | 灰度期间每小时把金丝雀与基线的成功率比较一次，每次都用 0.05 的显著性阈值判断是… | 挑战 | ★★ |
| [ENG-OBS-034](../ENG/OBS.md#ENG-OBS-034) | 回归评测集应当只增不减：所有历史上出现过的失败样本都永久保留，样本越多，门禁就越可靠… | 基础 | ★ |
| [ENG-PERF-007](../ENG/PERF.md#ENG-PERF-007) | 评估 Prompt Caching 的效果时，用「有缓存命中的请求数 ÷ 总请求数」… | 基础 | ★★ |
| [ENG-PERF-014](../ENG/PERF.md#ENG-PERF-014) | 在同一批数据上既挑选路由阈值、又报告路由后的质量与成本，得到的结果往往偏乐观；应当在… | 基础 | ★★ |
| [ENG-PERF-019](../ENG/PERF.md#ENG-PERF-019) | 使用推理模型时，调低推理强度（如 reasoning effort）或设置思考预算，… | 基础 | ★★ |
| [ENG-STAB-017](../ENG/STAB.md#ENG-STAB-017) | 在「客户端 → 网关 → Agent 服务 → 模型 SDK」这样的多层调用链中，通… | 基础 | ★★ |
| [ENG-STAB-021](../ENG/STAB.md#ENG-STAB-021) | 在 Stripe API（v1）的幂等机制中，带幂等键的请求一旦开始执行，Strip… | 挑战 | ★ |
| [ENG-STAB-023](../ENG/STAB.md#ENG-STAB-023) | Kafka 开启幂等生产者和事务后提供「恰好一次」语义，因此消费者处理消息时调用外部… | 进阶 | ★★ |
| [ENG-STAB-028](../ENG/STAB.md#ENG-STAB-028) | Saga 的补偿操作相当于数据库事务的回滚：补偿执行完之后，系统状态与从未执行过这笔… | 基础 | ★★ |
| [ENG-STAB-038](../ENG/STAB.md#ENG-STAB-038) | Envoy 中名为「circuit breaking」的配置（如集群的最大连接数、最… | 挑战 | ★ |
| [EVL-AGENT-002](../EVL/AGENT.md#EVL-AGENT-002) | Agent 评测中，同一道题多次运行结果不一致，主要是采样温度造成的；把温度设为 0… | 基础 | ★★ |
| [EVL-AGENT-010](../EVL/AGENT.md#EVL-AGENT-010) | 用无偏估计 1-\binom{n-c}{k}/\binom{n}{k} 估计某题的 … | 挑战 | ★★ |
| [EVL-AGENT-018](../EVL/AGENT.md#EVL-AGENT-018) | 2025 年 9 月，有人在 SWE-bench 的 issue 465 中报告部分… | 进阶 | ★★ |
| [EVL-AGENT-028](../EVL/AGENT.md#EVL-AGENT-028) | 在 BFCL 这类函数调用基准上得分很高的模型，用在 τ-bench 这类多轮业务任… | 基础 | ★★ |
| [EVL-AGENT-036](../EVL/AGENT.md#EVL-AGENT-036) | 对「500 道题、每题运行 3 次」的评测结果做 bootstrap 置信区间时，应… | 进阶 | ★★ |
| [EVL-AGENT-047](../EVL/AGENT.md#EVL-AGENT-047) | 团队在同一个测试集上反复调整提示词和流程几十轮，最后报告这个测试集上的分数。即使从来… | 进阶 | ★★ |
| [EVL-LLM-006](../EVL/LLM.md#EVL-LLM-006) | MMLU 的题目与标准答案经过了严格审核，可以认为几乎没有错误；如果模型在某个学科上… | 进阶 | ★★ |
| [EVL-LLM-017](../EVL/LLM.md#EVL-LLM-017) | 在 Elo / Bradley-Terry 模型中，两个模型的预测胜率只取决于它们的… | 基础 | ★★ |
| [EVL-LLM-025](../EVL/LLM.md#EVL-LLM-025) | 成对比较时，把两个回答的顺序交换各评一次、只在两次结论一致时才判胜负，就能同时消除位… | 进阶 | ★★ |
| [EVL-LLM-039](../EVL/LLM.md#EVL-LLM-039) | TruthfulQA（817 道题，覆盖健康、法律、金融、政治等 38 个类别）专门… | 进阶 | ★★ |
| [FND-DL-002](../FND/DL.md#FND-DL-002) | 万能近似定理表明：只有一个隐藏层、但神经元足够多的 MLP，能以任意精度逼近紧集上的… | 进阶 | ★★ |
| [FND-DL-014](../FND/DL.md#FND-DL-014) | 把 MLP 隐藏层的所有权重都初始化为 0（或同一个常数）也可以训练，只是收敛会慢一… | 基础 | ★★ |
| [FND-DL-018](../FND/DL.md#FND-DL-018) | ResNet 论文发现，不带残差连接时，56 层的普通网络在 CIFAR-10 上的… | 进阶 | ★★ |
| [FND-DL-023](../FND/DL.md#FND-DL-023) | BatchNorm 有效的原因已经被实验证实：它减少了内部协变量偏移（Interna… | 挑战 | ★ |
| [FND-DL-024](../FND/DL.md#FND-DL-024) | PyTorch 的 nn.Dropout(p) 采用「反向 Dropout」（inv… | 基础 | ★★ |
| [FND-MATH-006](../FND/MATH.md#FND-MATH-006) | 对实对称矩阵，奇异值恰好等于特征值的绝对值；但对一般的实方阵，「奇异值 = 特征值的… | 进阶 | ★★ |
| [FND-MATH-014](../FND/MATH.md#FND-MATH-014) | 若随机变量 X 与 Y 都服从标准正态分布 \mathcal{N}(0,1)，且二者… | 进阶 | ★ |
| [FND-MATH-019](../FND/MATH.md#FND-MATH-019) | 一般情况下，两个随机变量的协方差为 0 并不能推出它们相互独立；但如果 X、Y 服从… | 基础 | ★★ |
| [FND-MATH-026](../FND/MATH.md#FND-MATH-026) | KL 散度满足非负性，并且 \mathrm{KL}(p\Vert q)=0 当且仅当… | 基础 | ★★ |
| [FND-ML-005](../FND/ML.md#FND-ML-005) | 随着模型参数量增加，测试误差先下降、后上升；越过插值阈值（参数刚好多到能把训练集拟合… | 挑战 | ★ |
| [FND-ML-011](../FND/ML.md#FND-ML-011) | 用过去三年的每日销量预测未来的销量。如果把所有样本随机打乱后做 5 折交叉验证，得到… | 基础 | ★★ |
| [FND-ML-018](../FND/ML.md#FND-ML-018) | 在正样本极少（例如只占 0.1%）的场景下，模型的 ROC 曲线和 AUC 可能看起… | 进阶 | ★★ |
| [FND-ML-023](../FND/ML.md#FND-ML-023) | 用类别权重或过采样训练不平衡数据后，模型输出的概率仍然是真实后验概率的良好估计，可以… | 挑战 | ★★ |
| [FND-NLP-003](../FND/NLP.md#FND-NLP-003) | 训练大语言模型之前，通常要像传统文本分类流水线那样，对语料做去停用词、词干提取（st… | 进阶 | ★★ |
| [FND-NLP-013](../FND/NLP.md#FND-NLP-013) | Kneser-Ney 平滑在回退到低阶分布时，不直接使用词的出现次数，而是使用「这个… | 挑战 | ★ |
| [FND-NLP-015](../FND/NLP.md#FND-NLP-015) | 双向 LSTM 在每个位置同时利用了左右两侧的上下文，表示能力比单向 LSTM 更强… | 基础 | ★★ |
| [FND-NLP-025](../FND/NLP.md#FND-NLP-025) | XLNet 指出：BERT 的 MLM 在预测同一个序列中多个被遮住的 token … | 挑战 | ★ |
| [FND-NLP-030](../FND/NLP.md#FND-NLP-030) | GPT-1 在下游任务微调时，除了任务本身的监督损失，还把语言模型损失作为辅助目标一… | 进阶 | ★ |
| [FND-OPT-016](../FND/OPT.md#FND-OPT-016) | warmup 只对 Adam 这类自适应优化器有意义；用带动量的 SGD 训练时，即… | 进阶 | ★★ |
| [FND-OPT-024](../FND/OPT.md#FND-OPT-024) | 对于后面紧跟 BatchNorm 的卷积权重，网络的输出对该权重的整体缩放保持不变（… | 挑战 | ★ |
| [FND-OPT-028](../FND/OPT.md#FND-OPT-028) | 梯度累积能在不增加显存的前提下等效地增大 batch，因此它也能按比例缩短训练的墙钟… | 基础 | ★★ |
| [INF-BASE-002](../INF/BASE.md#INF-BASE-002) | 同一个模型部署在同一张 GPU 上，Prefill 阶段平均每个 token 的耗时… | 基础 | ★★ |
| [INF-BASE-007](../INF/BASE.md#INF-BASE-007) | 高负载时，TTFT 的上涨往往主要来自请求在调度队列中的等待，而不是 Prefill… | 基础 | ★★★ |
| [INF-BASE-020](../INF/BASE.md#INF-BASE-020) | 对 Llama-3-8B 这类 GQA 模型，在 H100 上做 4K 上下文的 D… | 进阶 | ★★★ |
| [INF-BASE-032](../INF/BASE.md#INF-BASE-032) | 在流式接口中，如果客户端中途断开、而服务端没有及时检测并中止（abort）该请求，它… | 基础 | ★★ |
| [INF-BASE-036](../INF/BASE.md#INF-BASE-036) | nvidia-smi 显示 Decode 阶段的 GPU-Util 长期接近 100… | 基础 | ★★★ |
| [INF-KERNEL-002](../INF/KERNEL.md#INF-KERNEL-002) | FlashAttention 的分块越大越好：块越大，K、V 被重复读取的次数越少，… | 进阶 | ★ |
| [INF-KERNEL-015](../INF/KERNEL.md#INF-KERNEL-015) | FlashAttention 的反向要重新计算注意力矩阵，FLOPs 比保存 P 的… | 进阶 | ★★ |
| [INF-KERNEL-023](../INF/KERNEL.md#INF-KERNEL-023) | FlashDecoding 把 KV 切成多段分别计算、再按各段的 log-sum-… | 基础 | ★★ |
| [INF-KERNEL-028](../INF/KERNEL.md#INF-KERNEL-028) | CUDA Graph 对大 batch、长提示词的 Prefill 同样能带来与小 … | 进阶 | ★★ |
| [INF-KERNEL-036](../INF/KERNEL.md#INF-KERNEL-036) | 把多个算子融合进同一个 kernel 后，每个线程要保存的中间变量变多、寄存器用量上… | 进阶 | ★ |
| [INF-KV-001](../INF/KV.md#INF-KV-001) | 两个请求都包含同一段 2000 token 的文档，但文档前面的内容不同（例如系统提… | 基础 | ★★★ |
| [INF-KV-008](../INF/KV.md#INF-KV-008) | PagedAttention 中，块越小，每条序列最后一块的内部碎片越少；而块表的长… | 基础 | ★★ |
| [INF-KV-016](../INF/KV.md#INF-KV-016) | 并行采样中，写时复制只可能发生在提示词最后一个未写满的块上：提示词中已经写满的块在整… | 进阶 | ★★ |
| [INF-KV-023](../INF/KV.md#INF-KV-023) | RadixAttention 在显存不足时按 LRU 淘汰基数树的叶子节点；正在被运… | 基础 | ★ |
| [INF-KV-028](../INF/KV.md#INF-KV-028) | 使用 FP8 KV Cache 时，注意力 kernel 应在读入 KV 后于片上（… | 进阶 | ★★ |
| [INF-QUANT-003](../INF/QUANT.md#INF-QUANT-003) | 对称量化时，截断阈值 c 影响的是截断误差，阈值以内元素的舍入误差由量化位宽决定、与… | 进阶 | ★★ |
| [INF-QUANT-006](../INF/QUANT.md#INF-QUANT-006) | 按常规做法（零点取整数，且量化范围包含 0），非对称量化总能精确表示实数 0：0 量… | 基础 | ★★ |
| [INF-QUANT-013](../INF/QUANT.md#INF-QUANT-013) | QAT 中，取整函数 round 的导数几乎处处为 0，直接反向传播会让梯度消失；常… | 进阶 | ★★ |
| [INF-QUANT-021](../INF/QUANT.md#INF-QUANT-021) | SmoothQuant 的迁移强度 \alpha 越大越好：\alpha=1 时激活… | 基础 | ★★ |
| [INF-QUANT-028](../INF/QUANT.md#INF-QUANT-028) | AWQ 的最终方案是：按激活幅度挑出约 1% 的显著权重通道保留为 FP16，其余权… | 进阶 | ★★ |
| [INF-QUANT-033](../INF/QUANT.md#INF-QUANT-033) | A100 没有 FP8 Tensor Core，FP8 在 A100 上最多只能作为… | 基础 | ★★ |
| [INF-QUANT-045](../INF/QUANT.md#INF-QUANT-045) | 把大模型的权重做 50% 的非结构化剪枝（任意位置的一半权重置零）后，即使仍用原来的… | 进阶 | ★★ |
| [INF-SCHED-003](../INF/SCHED.md#INF-SCHED-003) | 同样的负载下，静态批处理的 P99 ITL（相邻 token 的间隔）可能比连续批处… | 进阶 | ★★ |
| [INF-SCHED-009](../INF/SCHED.md#INF-SCHED-009) | 连续批处理中，新请求加入或旧请求离开 batch，在数学上不会改变 batch 中其… | 进阶 | ★★ |
| [INF-SCHED-015](../INF/SCHED.md#INF-SCHED-015) | 在先来先服务（FCFS）的调度下，显存不足需要抢占时，应优先抢占最早到达的请求，因为… | 基础 | ★★ |
| [INF-SCHED-025](../INF/SCHED.md#INF-SCHED-025) | PD 分离能减少一个请求的总计算量，这是它能提高 goodput 的主要原因。 | 基础 | ★★ |
| [INF-SCHED-036](../INF/SCHED.md#INF-SCHED-036) | 把 vLLM 的 max_num_batched_tokens（每步 token 预… | 进阶 | ★★ |
| [INF-SERVE-003](../INF/SERVE.md#INF-SERVE-003) | vLLM 服务刚启动、还没有任何请求时，nvidia-smi 就显示显存占用了约 9… | 基础 | ★★ |
| [INF-SERVE-007](../INF/SERVE.md#INF-SERVE-007) | TensorRT-LLM 早期的标准流程要先用 trtllm-build 把模型编译… | 进阶 | ★ |
| [INF-SERVE-013](../INF/SERVE.md#INF-SERVE-013) | 用两台 8 卡服务器部署一个单机放不下的大模型时，常见做法是「机内 TP = 8、机… | 基础 | ★★ |
| [INF-SERVE-023](../INF/SERVE.md#INF-SERVE-023) | 约束解码每一步把不合法 token 的 logit 置为 -\infty 再重新归一… | 进阶 | ★★ |
| [INF-SERVE-029](../INF/SERVE.md#INF-SERVE-029) | 自部署时，每个输出 token 的平均 GPU 成本通常明显高于每个输入 token… | 进阶 | ★★ |
| [INF-SERVE-038](../INF/SERVE.md#INF-SERVE-038) | 借助 vLLM 的硬件插件机制，安装 vllm-ascend 之后，vLLM 主仓库… | 进阶 | ★ |
| [INF-SPEC-002](../INF/SPEC.md#INF-SPEC-002) | 投机采样中，草稿模型越差，最终输出的质量就越差；所以草稿模型必须足够接近目标模型，否… | 基础 | ★★★ |
| [INF-SPEC-010](../INF/SPEC.md#INF-SPEC-010) | 贪心投机解码只接受与目标模型 argmax 相同的 token，所以在实际的浮点实现… | 进阶 | ★★ |
| [INF-SPEC-014](../INF/SPEC.md#INF-SPEC-014) | Medusa 在采样（温度大于 0）时使用「典型接受」（typical accept… | 进阶 | ★★ |
| [INF-SPEC-019](../INF/SPEC.md#INF-SPEC-019) | Meta 的多 token 预测（Gloeckle 等, 2024）在共享主干上接多… | 进阶 | ★ |
| [INF-SPEC-021](../INF/SPEC.md#INF-SPEC-021) | 朴素的 Jacobi 解码先随机初始化后续 n 个位置的猜测，再并行迭代更新；每次迭… | 进阶 | ★ |
| [LLM-ARCH-003](../LLM/ARCH.md#LLM-ARCH-003) | T5 论文指出：编码器 L 层 + 解码器 L 层的 Encoder-Decoder… | 挑战 | ★ |
| [LLM-ARCH-005](../LLM/ARCH.md#LLM-ARCH-005) | Wang 等（2022）系统比较了不同架构与预训练目标的零样本泛化能力，结论是：预训… | 进阶 | ★ |
| [LLM-ARCH-011](../LLM/ARCH.md#LLM-ARCH-011) | 在 Pre-Norm 结构中，第 L 层的输出可以写成 x_L = x_0 + \s… | 挑战 | ★ |
| [LLM-ARCH-013](../LLM/ARCH.md#LLM-ARCH-013) | Pre-Norm 结构的模型在最后一个 Block 之后、输出层之前还需要再加一个归… | 基础 | ★★ |
| [LLM-ARCH-022](../LLM/ARCH.md#LLM-ARCH-022) | SwiGLU 比普通 FFN 多一个权重矩阵，因此 Llama-2-7B 每层 FF… | 进阶 | ★★ |
| [LLM-ARCH-030](../LLM/ARCH.md#LLM-ARCH-030) | 训练算力估算公式 C\approx6ND 已经包含了注意力打分（QK^\top 以及… | 进阶 | ★★ |
| [LLM-ARCH-036](../LLM/ARCH.md#LLM-ARCH-036) | 输入 Embedding 与输出层共享权重后，共享矩阵在每个训练步会同时收到两路梯度… | 进阶 | ★ |
| [LLM-ATTN-003](../LLM/ATTN.md#LLM-ATTN-003) | MQA 让所有 Query 头共享同一组 K、V，但推理时每个头仍要单独缓存 K、V… | 基础 | ★★★ |
| [LLM-ATTN-019](../LLM/ATTN.md#LLM-ATTN-019) | 在 d_{model} 固定时，头数越多，每个头的维度 d_h=d_{model}/… | 基础 | ★★ |
| [LLM-ATTN-031](../LLM/ATTN.md#LLM-ATTN-031) | FlashAttention 通过分块与 online softmax 把标准注意力… | 基础 | ★★★ |
| [LLM-ATTN-037](../LLM/ATTN.md#LLM-ATTN-037) | 因果线性注意力可以写成 RNN 形式：维护状态 S_t=S_{t-1}+\phi(k… | 进阶 | ★★ |
| [LLM-ATTN-041](../LLM/ATTN.md#LLM-ATTN-041) | Encoder-Decoder 模型自回归解码时，交叉注意力的 K、V 只依赖编码器… | 基础 | ★★ |
| [LLM-ATTN-044](../LLM/ATTN.md#LLM-ATTN-044) | 大模型普遍把大量注意力分配给序列开头的几个 token（attention sink… | 进阶 | ★★ |
| [LLM-DEC-003](../LLM/DEC.md#LLM-DEC-003) | 温度只是把 logits 按同一个正数缩放，不改变各 token 的概率排序，因此温… | 进阶 | ★★ |
| [LLM-DEC-011](../LLM/DEC.md#LLM-DEC-011) | Hugging Face 的 repetition_penalty 只惩罚模型本次已… | 进阶 | ★★ |
| [LLM-DEC-019](../LLM/DEC.md#LLM-DEC-019) | 束宽越大并不一定翻译得越好。Stahlberg 与 Byrne（2019）用精确搜索… | 进阶 | ★ |
| [LLM-DEC-036](../LLM/DEC.md#LLM-DEC-036) | 同时设置 top-k 与 top-p 时（按 Hugging Face 的顺序，先 … | 挑战 | ★★ |
| [LLM-MM-003](../LLM/MM.md#LLM-MM-003) | ViT 论文发现：在 ImageNet-1k 这种中等规模的数据上从头训练时，ViT… | 进阶 | ★★ |
| [LLM-MM-007](../LLM/MM.md#LLM-MM-007) | SigLIP 把 CLIP 的 softmax 对比损失换成逐对的 sigmoid … | 进阶 | ★★ |
| [LLM-MM-024](../LLM/MM.md#LLM-MM-024) | 多模态训练如果只使用图文数据，常会导致语言模型原有的纯文本能力（如知识问答、代码、数… | 基础 | ★★ |
| [LLM-MM-026](../LLM/MM.md#LLM-MM-026) | DeepSeek-OCR（2025 年 10 月）探索「上下文光学压缩」：把文本渲染… | 挑战 | ★ |
| [LLM-MM-032](../LLM/MM.md#LLM-MM-032) | DeepSeek 的 Janus 认为，多模态理解与图像生成可以共享同一种视觉表示，… | 进阶 | ★ |
| [LLM-MODEL-006](../LLM/MODEL.md#LLM-MODEL-006) | 随着 GPT 路线的大模型兴起，BERT 这类 Encoder-only 模型在工业… | 基础 | ★★ |
| [LLM-MODEL-010](../LLM/MODEL.md#LLM-MODEL-010) | FLAN（Wei 等, 2021）的实验发现：指令微调对所有规模的模型都能提升其在未… | 进阶 | ★ |
| [LLM-MODEL-013](../LLM/MODEL.md#LLM-MODEL-013) | Llama 4（2025 年 4 月）是 Llama 系列首次采用 MoE 的版本：… | 基础 | ★★ |
| [LLM-MODEL-019](../LLM/MODEL.md#LLM-MODEL-019) | DeepSeek-V4（2026 年 4 月发布预览版）支持 1M token 上下… | 进阶 | ★ |
| [LLM-MODEL-029](../LLM/MODEL.md#LLM-MODEL-029) | DeepSeek-R1 以 MIT 许可发布，因此 DeepSeek-R1-Dist… | 进阶 | ★★ |
| [LLM-MOE-004](../LLM/MOE.md#LLM-MOE-004) | Switch Transformer 每个 token 只选 1 个专家（top-1… | 进阶 | ★★ |
| [LLM-MOE-011](../LLM/MOE.md#LLM-MOE-011) | 某个 token 在一个 MoE 层因超出专家容量而被丢弃后，它在这一层的输出是全零… | 基础 | ★★ |
| [LLM-MOE-015](../LLM/MOE.md#LLM-MOE-015) | 共享专家已经是 MoE 大模型的标配，例如 Qwen3-235B-A22B 的每个 … | 基础 | ★★ |
| [LLM-MOE-026](../LLM/MOE.md#LLM-MOE-026) | MoE 模型推理时，某个请求的输出只取决于它自己的输入：即使推理框架给每个专家设置了… | 进阶 | ★★ |
| [LLM-MOE-032](../LLM/MOE.md#LLM-MOE-032) | Mixtral 论文对路由结果的分析发现：专家并没有表现出明显的按主题（如数学、生物… | 进阶 | ★ |
| [LLM-NEW-003](../LLM/NEW.md#LLM-NEW-003) | S4 等线性时不变（LTI）SSM 的参数与输入无关，因此可以展开成卷积并行训练；M… | 基础 | ★ |
| [LLM-NEW-013](../LLM/NEW.md#LLM-NEW-013) | Gloeckle 等（2024）发现，多 token 预测对所有规模的模型都有一致的… | 基础 | ★ |
| [LLM-NEW-020](../LLM/NEW.md#LLM-NEW-020) | 扩散语言模型与自回归模型一样，已生成部分的表示在后续步骤中保持不变，因此可以直接复用… | 进阶 | ★★ |
| [LLM-NEW-025](../LLM/NEW.md#LLM-NEW-025) | MiniMax-01（2025 年 1 月）采用「每 7 层闪电注意力（一种线性注意… | 进阶 | ★★ |
| [LLM-POS-004](../LLM/POS.md#LLM-POS-004) | 原始 Transformer 论文同时试验了正弦位置编码和可学习的位置编码，发现两者… | 基础 | ★ |
| [LLM-POS-008](../LLM/POS.md#LLM-POS-008) | T5 的相对位置偏置在每一层都单独学习一套参数，不同层之间互不共享。 | 进阶 | ★ |
| [LLM-POS-021](../LLM/POS.md#LLM-POS-021) | ALiBi 让注意力分数随距离线性衰减，因此它特别擅长从很长的上下文中精确取回远处的… | 基础 | ★★ |
| [LLM-POS-029](../LLM/POS.md#LLM-POS-029) | 「动态 NTK」（Dynamic NTK）根据当前输入的实际长度实时计算缩放倍数：当… | 进阶 | ★ |
| [LLM-POS-038](../LLM/POS.md#LLM-POS-038) | 只要模型在 64K 长度的文本上，困惑度随长度增加保持下降或平稳，就足以说明它能有效… | 进阶 | ★★ |
| [LLM-POS-041](../LLM/POS.md#LLM-POS-041) | Lost in the Middle 论文报告：在多文档问答中，当答案所在的文档位于… | 进阶 | ★ |
| [LLM-TOK-006](../LLM/TOK.md#LLM-TOK-006) | Llama 2 的分词器（SentencePiece 实现的 BPE，词表 3200… | 基础 | ★★ |
| [LLM-TOK-014](../LLM/TOK.md#LLM-TOK-014) | 在训练 token 总数固定时，把词表从 32K 增大到 256K，同样的 toke… | 进阶 | ★★ |
| [LLM-TOK-026](../LLM/TOK.md#LLM-TOK-026) | Qwen3 的分词器共有 151,669 个 token，而模型配置中的 vocab… | 基础 | ★ |
| [LLM-TOK-033](../LLM/TOK.md#LLM-TOK-033) | 对 BPE 分词器而言，encode(a + b) 不一定等于 encode(a) … | 进阶 | ★★ |
| [RAG-ADV-005](../RAG/ADV.md#RAG-ADV-005) | GraphRAG 的图谱由 LLM 从非结构化文本中自动抽取，因此实体抽取与消歧的质… | 进阶 | ★★ |
| [RAG-ADV-009](../RAG/ADV.md#RAG-ADV-009) | Self-RAG 和 CRAG 都是即插即用的方法：二者都不需要训练任何模型，可以直… | 基础 | ★★ |
| [RAG-ADV-014](../RAG/ADV.md#RAG-ADV-014) | Agentic RAG 与传统 RAG 的本质区别不在于检索次数的多少，而在于由模型… | 进阶 | ★★ |
| [RAG-ADV-019](../RAG/ADV.md#RAG-ADV-019) | Contextual Retrieval 只能改善向量检索：LLM 生成的上下文前缀… | 进阶 | ★★ |
| [RAG-BASE-005](../RAG/BASE.md#RAG-BASE-005) | 主流模型的上下文窗口扩展到百万 token 之后，企业知识库问答就不再需要 RAG … | 基础 | ★★★ |
| [RAG-BASE-011](../RAG/BASE.md#RAG-BASE-011) | Modular RAG 与 Advanced RAG 的区别仅在于：Modular … | 进阶 | ★★ |
| [RAG-BASE-015](../RAG/BASE.md#RAG-BASE-015) | 即使包含正确答案的资料块排在检索结果第 1 位并放进了提示词，RAG 系统仍可能生成… | 进阶 | ★★ |
| [RAG-BASE-016](../RAG/BASE.md#RAG-BASE-016) | 与把知识微调进模型参数相比，RAG 更容易实现「不同员工只能问到自己有权查看的文档内… | 基础 | ★★ |
| [RAG-CHUNK-004](../RAG/CHUNK.md#RAG-CHUNK-004) | 扫描件经 OCR 识别后可以直接入库，低置信度的识别结果无需特别处理，因为后续的向量… | 进阶 | ★★ |
| [RAG-CHUNK-009](../RAG/CHUNK.md#RAG-CHUNK-009) | 重叠能缓解切分点把信息截断的问题；但重叠比例过大时，同一段内容会以多个版本同时挤进检… | 基础 | ★★ |
| [RAG-CHUNK-018](../RAG/CHUNK.md#RAG-CHUNK-018) | 按标题切块时，把章节标题路径（如「差旅报销制度 住宿标准」）拼到块的开头，往往能同时… | 进阶 | ★★ |
| [RAG-CHUNK-025](../RAG/CHUNK.md#RAG-CHUNK-025) | 其他条件不变时，块切得越小，向量检索的 Recall@k 越高，因为 k 固定时，块… | 进阶 | ★★ |
| [RAG-EMB-003](../RAG/EMB.md#RAG-EMB-003) | decoder-only 的大模型也可以改造成 Embedding 模型：在因果注意… | 进阶 | ★★ |
| [RAG-EMB-008](../RAG/EMB.md#RAG-EMB-008) | 使用批内负例的 InfoNCE 时，batch 越大，每个问题对比的负例越多，效果通… | 基础 | ★★ |
| [RAG-EMB-012](../RAG/EMB.md#RAG-EMB-012) | 挖掘难负例时，被当前模型排在第 1～3 名、但没有被标注为正例的文档最「难」，应该优… | 进阶 | ★★ |
| [RAG-EMB-019](../RAG/EMB.md#RAG-EMB-019) | 某 Embedding 模型在 MTEB 检索榜上的平均分高于另一个模型，那么它在你… | 基础 | ★★ |
| [RAG-EMB-022](../RAG/EMB.md#RAG-EMB-022) | 使用 MRL 训练的 Embedding 模型时，如果已经保存了完整的 1,024 … | 进阶 | ★ |
| [RAG-EMB-025](../RAG/EMB.md#RAG-EMB-025) | 对 Embedding 模型做领域微调时，只需使用领域数据训练，不必混入通用数据，因… | 进阶 | ★★ |
| [RAG-EVAL-004](../RAG/EVAL.md#RAG-EVAL-004) | 如果评测集中每个查询都恰好只有一个相关文档，那么每个查询的 Recall@k 与 H… | 基础 | ★★ |
| [RAG-EVAL-007](../RAG/EVAL.md#RAG-EVAL-007) | 某 RAG 系统的忠实度接近 1.0，即回答中的陈述几乎都能由检索到的资料推出，因此… | 进阶 | ★★ |
| [RAG-EVAL-009](../RAG/EVAL.md#RAG-EVAL-009) | 答案相关性只衡量回答是否切题，并不检验事实对错：一个紧扣问题、但内容错误的回答，也可… | 基础 | ★★ |
| [RAG-EVAL-015](../RAG/EVAL.md#RAG-EVAL-015) | 评测集中的相关性标注最好记录到「文档 ID + 原文字符区间」这一层级，而不是只记录… | 挑战 | ★ |
| [RAG-EVAL-022](../RAG/EVAL.md#RAG-EVAL-022) | 更换 Embedding 模型后，可以只用新模型编码新增和修改的文档，旧文档保留原来… | 进阶 | ★★ |
| [RAG-QUERY-003](../RAG/QUERY.md#RAG-QUERY-003) | 在多轮对话中，把完整的对话历史直接拼接到当前问题后面一起做向量检索，效果通常与先用 … | 基础 | ★★ |
| [RAG-QUERY-009](../RAG/QUERY.md#RAG-QUERY-009) | Step-back 对需要背景原理的推理型问题帮助较大；对「某个编号代表什么」这类答… | 进阶 | ★ |
| [RAG-QUERY-013](../RAG/QUERY.md#RAG-QUERY-013) | 元数据过滤是硬约束：一旦抽取的条件有误，正确文档根本不会进入候选，后续的重排也无法补… | 基础 | ★★ |
| [RAG-QUERY-017](../RAG/QUERY.md#RAG-QUERY-017) | 在 RAG 中，只要检索器的 Recall@k 随 k 增大而继续上升，把送入生成模… | 进阶 | ★★ |
| [RAG-RETR-008](../RAG/RETR.md#RAG-RETR-008) | 去掉 BM25 公式分子中的常数因子 (k_1+1)，对任何查询都不会改变文档的排序… | 进阶 | ★★ |
| [RAG-RETR-013](../RAG/RETR.md#RAG-RETR-013) | 倒排索引只能用于 BM25 这类传统稀疏检索；SPLADE 等学习型稀疏表示的词权重… | 基础 | ★★ |
| [RAG-RETR-016](../RAG/RETR.md#RAG-RETR-016) | SPLADE 这类学习型稀疏检索会给文档中没有出现、但语义相关的词也预测出权重（词扩… | 进阶 | ★★ |
| [RAG-RETR-021](../RAG/RETR.md#RAG-RETR-021) | 使用 RRF 融合时，各路召回只需取 top-5 即可；每路取更多候选（如 top-… | 进阶 | ★★ |
| [RAG-RETR-030](../RAG/RETR.md#RAG-RETR-030) | ColBERT 的打分只依赖问题与文档各自独立编码出的 token 向量，因此文档侧… | 进阶 | ★★ |
| [RAG-RETR-035](../RAG/RETR.md#RAG-RETR-035) | 入库时已经用内容哈希做了精确去重，所以检索之后不需要再用 MMR 之类的方法去冗余。 | 进阶 | ★★ |
| [SEC-AGENT-012](../SEC/AGENT.md#SEC-AGENT-012) | Meta 在 2025 年提出的「Agents Rule of Two」受致命三要素… | 进阶 | ★★ |
| [SEC-AGENT-023](../SEC/AGENT.md#SEC-AGENT-023) | 对 Agent 的每一个有副作用的动作都弹窗请用户确认，是最安全的策略。 | 基础 | ★★ |
| [SEC-AGENT-029](../SEC/AGENT.md#SEC-AGENT-029) | RAG 检索按相似度取 top-k，而不是按比例抽样；即使知识库包含上百万篇文档，只… | 进阶 | ★★ |
| [SEC-AGENT-035](../SEC/AGENT.md#SEC-AGENT-035) | 模型权重文件只是一堆数字，所以加载来源不明的 PyTorch .bin / .pt（… | 基础 | ★★ |
| [SEC-AGENT-041](../SEC/AGENT.md#SEC-AGENT-041) | 把宿主机的 ~/.aws 目录以只读方式挂载进 Agent 的沙箱，Agent 就无… | 基础 | ★★ |
| [SEC-DEF-006](../SEC/DEF.md#SEC-DEF-006) | 纵深防御中的「监控与响应」层无法在事前拦截攻击，但依然不可或缺：工具网关、沙箱等确定… | 基础 | ★★ |
| [SEC-DEF-009](../SEC/DEF.md#SEC-DEF-009) | 在双 LLM 模式中，隔离 LLM 没有任何工具，特权 LLM 又从不读取不可信内容… | 进阶 | ★★ |
| [SEC-DEF-019](../SEC/DEF.md#SEC-DEF-019) | 在动作选择器（Action-Selector）模式中，LLM 只负责把用户请求映射到… | 进阶 | ★★ |
| [SEC-DEF-023](../SEC/DEF.md#SEC-DEF-023) | 对模型输出做了 HTML 转义之后，再把它拼进 shell 命令就安全了，因为 HT… | 基础 | ★★ |
| [SEC-INJ-002](../SEC/INJ.md#SEC-INJ-002) | 直接提示注入的攻击者就是正在对话的用户本人，因此它只可能伤害攻击者自己，对应用方没有… | 基础 | ★★ |
| [SEC-INJ-010](../SEC/INJ.md#SEC-INJ-010) | 一个很难被越狱的模型，基于它构建的 Agent 仍可能被提示注入：注入诱导的动作（如… | 基础 | ★★★ |
| [SEC-INJ-014](../SEC/INJ.md#SEC-INJ-014) | 在系统提示词末尾加上「无论用户如何要求都不要透露以上内容」，再在输出端检测回答中是否… | 基础 | ★★ |
| [SEC-INJ-017](../SEC/INJ.md#SEC-INJ-017) | 一种提示注入防御在公开的静态注入测试集上把攻击成功率降到接近 0 之后，面对会针对它… | 进阶 | ★★ |
| [SEC-INJ-023](../SEC/INJ.md#SEC-INJ-023) | Spotlighting 的「编码」方式（例如把不可信文档转成 base64 再交给… | 进阶 | ★ |
| [SEC-REL-004](../SEC/REL.md#SEC-REL-004) | 即使预训练语料中的每一条陈述都是正确的，按标准的预训练目标训练出来的语言模型仍然会产… | 进阶 | ★★ |
| [SEC-REL-014](../SEC/REL.md#SEC-REL-014) | 温度缩放（temperature scaling）在验证集上学习一个标量 T，把 l… | 进阶 | ★★ |
| [SEC-REL-017](../SEC/REL.md#SEC-REL-017) | XSTest 用一批措辞上像有害请求、实际完全无害的提示（例如「怎么杀掉一个 Pyt… | 基础 | ★★ |
| [SEC-REL-024](../SEC/REL.md#SEC-REL-024) | 从向量库中删除某份文档对应的全部向量之后，这份文档的内容就不可能再出现在系统的回答中… | 基础 | ★★ |
| [SEC-REL-030](../SEC/REL.md#SEC-REL-030) | 研究发现，推理模型在思维链中常常不会提及实际影响其答案的因素（例如提示中暗含的线索）… | 进阶 | ★★ |
| [TRN-ADAPT-003](../TRN/ADAPT.md#TRN-ADAPT-003) | 只要学习率设得足够小，直接在 Chat 模型上用大量领域无标注文本做继续预训练，就能… | 基础 | ★★ |
| [TRN-ADAPT-007](../TRN/ADAPT.md#TRN-ADAPT-007) | 对开源权重模型做继续预训练时，即使拿不到它原始的预训练数据，也仍然可以做「回放」：用… | 进阶 | ★★ |
| [TRN-ADAPT-014](../TRN/ADAPT.md#TRN-ADAPT-014) | 为了提高中文压缩率，可以在中文语料上重新训练一个全新的分词器（token id 与旧… | 基础 | ★★ |
| [TRN-ADAPT-020](../TRN/ADAPT.md#TRN-ADAPT-020) | Gemma 2 的 2B 和 9B 模型在预训练阶段使用了知识蒸馏：以更大模型输出的… | 进阶 | ★ |
| [TRN-ADAPT-026](../TRN/ADAPT.md#TRN-ADAPT-026) | 权重平均、Task Arithmetic、TIES 等模型合并方法，通常要求被合并的… | 进阶 | ★★ |
| [TRN-ADAPT-031](../TRN/ADAPT.md#TRN-ADAPT-031) | 用几千条关于新事实的问答对做 SFT，是向模型注入新知识的高效方法：模型能很快学会这… | 进阶 | ★★ |
| [TRN-DATA-007](../TRN/DATA.md#TRN-DATA-007) | 用 Bloom 过滤器对海量文档做精确去重时，可能把一篇从未出现过的文档误判为「已出… | 进阶 | ★ |
| [TRN-DATA-017](../TRN/DATA.md#TRN-DATA-017) | 以维基百科、书籍等「正式文本」为正例训练的质量分类器，倾向于给口语、方言、小众社区和… | 进阶 | ★★ |
| [TRN-DATA-022](../TRN/DATA.md#TRN-DATA-022) | Longpre 等（2023）的实验发现，对预训练数据做毒性过滤，既能减少模型生成有… | 基础 | ★★ |
| [TRN-DATA-030](../TRN/DATA.md#TRN-DATA-030) | 有研究发现：如果每一代训练都在保留全部真实数据的基础上累加新生成的合成数据，而不是用… | 进阶 | ★ |
| [TRN-DATA-034](../TRN/DATA.md#TRN-DATA-034) | 对训练数据和评测集做 13-gram 重叠去污染，能检出评测题被换说法、换数字格式或… | 进阶 | ★★ |
| [TRN-DATA-040](../TRN/DATA.md#TRN-DATA-040) | 某低资源语言只有约 1B token 的可用数据。在一次 2T token 的预训练… | 进阶 | ★ |
| [TRN-DIST-002](../TRN/DIST.md#TRN-DIST-002) | DDP 训练中，为了保证各卡的模型参数一致，每一步优化器更新之后都要把 0 号卡的参… | 基础 | ★★ |
| [TRN-DIST-013](../TRN/DIST.md#TRN-DIST-013) | ZeRO 把模型状态切分到 N 张卡上来降低显存，同时也把每张卡的计算量降为原来的 … | 基础 | ★★★ |
| [TRN-DIST-016](../TRN/DIST.md#TRN-DIST-016) | FSDP 的 SHARD_GRAD_OP 策略近似 ZeRO-2：前向结束后不释放已… | 进阶 | ★★ |
| [TRN-DIST-023](../TRN/DIST.md#TRN-DIST-023) | 只用张量并行（不开序列并行）时，每张卡上的激活显存会随 TP 度 t 等比例下降为原… | 进阶 | ★★ |
| [TRN-DIST-028](../TRN/DIST.md#TRN-DIST-028) | 交错式 1F1B（interleaved 1F1B，每张卡负责 v 个不相邻的模型块… | 进阶 | ★★ |
| [TRN-DIST-046](../TRN/DIST.md#TRN-DIST-046) | 在各节点故障相互独立、单节点故障率不变的前提下，同步训练任务的平均无故障时间（MTB… | 基础 | ★★ |
| [TRN-MEM-002](../TRN/MEM.md#TRN-MEM-002) | 与纯 FP32 训练相比，BF16 混合精度训练能把 AdamW 的模型状态显存（权… | 基础 | ★★ |
| [TRN-MEM-011](../TRN/MEM.md#TRN-MEM-011) | 开启全量激活重计算后，反向传播时需要把每层的前向再算一遍，因此一步训练的计算量大约增… | 基础 | ★★ |
| [TRN-MEM-018](../TRN/MEM.md#TRN-MEM-018) | 用 BF16 训练的模型，推理时改用 FP16 结果会更准确：FP16 的尾数位更多… | 基础 | ★★ |
| [TRN-MEM-030](../TRN/MEM.md#TRN-MEM-030) | 在经典的混合精度训练中，FP32 主权重只在优化器更新参数时使用；每步更新后再把它转… | 基础 | ★★ |
| [TRN-MEM-035](../TRN/MEM.md#TRN-MEM-035) | 调用 torch.cuda.empty_cache() 可以整理已分配张量之间的显存… | 进阶 | ★★ |
| [TRN-MEM-038](../TRN/MEM.md#TRN-MEM-038) | Qi 等（2025）发现，RL 微调中训练引擎与推理引擎算出的 token 概率不一… | 进阶 | ★ |
| [TRN-PEFT-002](../TRN/PEFT.md#TRN-PEFT-002) | LoRA 中把 A、B 都初始化为零也可以：同样能保证初始时 \Delta W=0，… | 进阶 | ★★★ |
| [TRN-PEFT-013](../TRN/PEFT.md#TRN-PEFT-013) | 为对话模板新增了 <tool_call、</tool_call 等特殊 token … | 进阶 | ★★ |
| [TRN-PEFT-016](../TRN/PEFT.md#TRN-PEFT-016) | 用 QLoRA 训练得到的 adapter，合并到原始的 BF16 底座权重上，得到… | 挑战 | ★★ |
| [TRN-PEFT-023](../TRN/PEFT.md#TRN-PEFT-023) | QLoRA 的分页优化器主要用来应对训练中的瞬时显存尖峰（例如遇到特别长的样本）：显… | 基础 | ★★ |
| [TRN-PEFT-025](../TRN/PEFT.md#TRN-PEFT-025) | DoRA 训练时为了节省显存，把方向矩阵的列范数 \lVert V+\Delta V… | 挑战 | ★ |
| [TRN-PEFT-035](../TRN/PEFT.md#TRN-PEFT-035) | 在数十亿 token 规模的代码或数学继续训练中，LoRA 在目标领域的提升通常不如… | 进阶 | ★★ |
| [TRN-PT-004](../TRN/PT.md#TRN-PT-004) | 按 Chinchilla 论文拟合的缩放律，模型参数量与训练数据量同时趋于无穷时，自… | 基础 | ★★ |
| [TRN-PT-009](../TRN/PT.md#TRN-PT-009) | Kaplan 等（2020）认为「训练到收敛」在算力上是低效的：给定算力预算，更好的… | 进阶 | ★★ |
| [TRN-PT-018](../TRN/PT.md#TRN-PT-018) | Scaling Data-Constrained Language Models（M… | 进阶 | ★★ |
| [TRN-PT-024](../TRN/PT.md#TRN-PT-024) | Are Emergent Abilities of Large Language M… | 进阶 | ★★ |
| [TRN-PT-032](../TRN/PT.md#TRN-PT-032) | 学习率衰减阶段 loss 明显加速下降，一个主要原因是：高学习率下参数在损失面「山谷… | 进阶 | ★★ |
| [TRN-PT-039](../TRN/PT.md#TRN-PT-039) | 开启全局梯度裁剪（如阈值 1.0）后，AdamW 对每个参数的更新量也会随梯度一起按… | 挑战 | ★★ |
| [TRN-SFT-002](../TRN/SFT.md#TRN-SFT-002) | SFT 采用教师强制（teacher forcing）：训练时每个位置都以参考回答的… | 进阶 | ★★ |
| [TRN-SFT-010](../TRN/SFT.md#TRN-SFT-010) | 如果用 apply_chat_template(..., tokenize=Fals… | 进阶 | ★★ |
| [TRN-SFT-018](../TRN/SFT.md#TRN-SFT-018) | 一条 3 轮对话，若对话模板不会改写历史回合（例如不会删除历史中的思考内容），且不考… | 挑战 | ★★ |
| [TRN-SFT-029](../TRN/SFT.md#TRN-SFT-029) | 一个模型做完领域 SFT 后，在 MMLU 这类多选基准上的分数比 SFT 前低了 … | 进阶 | ★★ |
| [TRN-SFT-033](../TRN/SFT.md#TRN-SFT-033) | SFT 过程中，只要验证集 loss 开始上升，就说明模型的生成质量在变差，应当立即… | 进阶 | ★★ |
| [TRN-SFT-038](../TRN/SFT.md#TRN-SFT-038) | 在数学题上做拒绝采样微调时，每道题采样相同的次数，再把采到的全部正确解直接加入训练集… | 进阶 | ★ |
