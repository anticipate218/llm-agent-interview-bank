# 简答题（315 道）

| 编号 | 题目 | 难度 | 考频 |
|---|---|---|---|
| [AGT-APP-006](../AGT/APP.md#AGT-APP-006) | 为什么编码 Agent 不能把整个仓库塞进上下文？请说明「漏斗式」代码定位的做法：各… | 进阶 | ★★★ |
| [AGT-APP-012](../AGT/APP.md#AGT-APP-012) | 编码 Agent 需要一次修改多个文件（例如修改一个公共函数的签名，并同步更新所有调… | 进阶 | ★★★ |
| [AGT-APP-015](../AGT/APP.md#AGT-APP-015) | 什么是编码 Agent 的测试「假绿灯」？请列出常见手法和多层防护措施；反过来，测试… | 进阶 | ★★★ |
| [AGT-APP-023](../AGT/APP.md#AGT-APP-023) | Deep Research 报告的「引用对齐」具体怎么做？如何评测一份报告的引用质量… | 进阶 | ★★ |
| [AGT-APP-032](../AGT/APP.md#AGT-APP-032) | 做浏览器 / Computer-Use 类 Agent 时，DOM（或可访问性树）方… | 进阶 | ★★★ |
| [AGT-APP-049](../AGT/APP.md#AGT-APP-049) | 为电话客服设计语音 Agent：请比较「级联」方案（语音识别 → 大模型 → 语音合… | 进阶 | ★ |
| [AGT-BASE-032](../AGT/BASE.md#AGT-BASE-032) | 什么是 Agent？它和一般的 LLM 应用（如单次问答、带检索的问答）有什么区别？ | 基础 | ★★★ |
| [AGT-BASE-033](../AGT/BASE.md#AGT-BASE-033) | 工作流和 Agent 怎么选？请从控制流、可预测性、成本与延迟、调试、擅长的任务五个… | 进阶 | ★★★ |
| [AGT-BASE-034](../AGT/BASE.md#AGT-BASE-034) | Anthropic 总结的五种工作流模式各是什么结构、适合什么场景？其中最容易混淆的… | 进阶 | ★★★ |
| [AGT-BASE-035](../AGT/BASE.md#AGT-BASE-035) | 如何设计 Agent 的终止条件？请说明终止条件有哪几类、停下来之后应该返回什么，以… | 进阶 | ★★★ |
| [AGT-BASE-036](../AGT/BASE.md#AGT-BASE-036) | 有人说「自主程度是旋钮，不是开关」。请解释这句话：光谱上大致有哪几档？越往自主一端移… | 进阶 | ★★ |
| [AGT-BASE-037](../AGT/BASE.md#AGT-BASE-037) | 评估者-优化者（evaluator-optimizer）模式在什么条件下有效？实践中… | 挑战 | ★★ |
| [AGT-BASE-044](../AGT/BASE.md#AGT-BASE-044) | 面试官问：「你的 Agent 主循环就是一个 while True：调模型、执行工具… | 进阶 | ★★ |
| [AGT-FW-002](../AGT/FW.md#AGT-FW-002) | Anthropic 在《Building effective agents》中建议「… | 进阶 | ★★★ |
| [AGT-FW-005](../AGT/FW.md#AGT-FW-005) | LangGraph 与 LangChain 旧版 AgentExecutor 有什么… | 进阶 | ★★★ |
| [AGT-FW-015](../AGT/FW.md#AGT-FW-015) | 断点续跑有两种主流实现思路：LangGraph checkpointer 的「快照式… | 挑战 | ★★ |
| [AGT-FW-019](../AGT/FW.md#AGT-FW-019) | 用 LangGraph 实现「退款金额超过 100 元需要人工审批」：请说明 int… | 进阶 | ★★★ |
| [AGT-FW-038](../AGT/FW.md#AGT-FW-038) | 面试官问：「AutoGen、CrewAI、LangGraph 你会怎么选？」请从抽象… | 挑战 | ★★★ |
| [AGT-HARNESS-009](../AGT/HARNESS.md#AGT-HARNESS-009) | 为什么给编码 Agent 一个裸 bash 往往不够？SWE-agent 提出的 A… | 进阶 | ★★★ |
| [AGT-HARNESS-014](../AGT/HARNESS.md#AGT-HARNESS-014) | Claude Code、Codex CLI 这类编码 Agent 的运行时由哪些部分… | 进阶 | ★★★ |
| [AGT-HARNESS-024](../AGT/HARNESS.md#AGT-HARNESS-024) | 面试官问：「怎么防止编码 Agent 乱提交代码、甚至删库？」请给出分层防御方案，说… | 进阶 | ★★★ |
| [AGT-HARNESS-029](../AGT/HARNESS.md#AGT-HARNESS-029) | 请为编码 Agent 设计执行沙箱：你会从哪些维度做隔离？进程级沙箱、容器、gVis… | 进阶 | ★★★ |
| [AGT-HARNESS-034](../AGT/HARNESS.md#AGT-HARNESS-034) | 你要在企业内部的编码 Agent 平台上引入 Voyager 式的技能库，让 Age… | 进阶 | ★★ |
| [AGT-HARNESS-038](../AGT/HARNESS.md#AGT-HARNESS-038) | 从「提示词工程」（Prompt Engineering）到「上下文工程」（Conte… | 进阶 | ★★★ |
| [AGT-HARNESS-043](../AGT/HARNESS.md#AGT-HARNESS-043) | 用编码 Agent 开发一个中等规模的功能，往往要跨越多个会话、经历多次上下文压缩，… | 进阶 | ★★ |
| [AGT-HARNESS-047](../AGT/HARNESS.md#AGT-HARNESS-047) | 面试官问：「市面上已经有 Claude Code、Codex 这样成熟的编码 Age… | 进阶 | ★★ |
| [AGT-MEM-003](../AGT/MEM.md#AGT-MEM-003) | 现在主流模型都支持几十万甚至百万 token 的上下文，为什么 Agent 仍然要做… | 进阶 | ★★★ |
| [AGT-MEM-006](../AGT/MEM.md#AGT-MEM-006) | 什么是上下文工程（Context Engineering）？它与提示词工程有什么区别… | 进阶 | ★★★ |
| [AGT-MEM-013](../AGT/MEM.md#AGT-MEM-013) | 一个长程运维 Agent 在会话中途收到用户的约束：「这个库连着线上，禁止执行 DR… | 挑战 | ★★★ |
| [AGT-MEM-017](../AGT/MEM.md#AGT-MEM-017) | 为什么说「笔记文件 + Compaction」是长程任务的黄金组合？请结合 todo… | 进阶 | ★★ |
| [AGT-MEM-022](../AGT/MEM.md#AGT-MEM-022) | MemGPT 的核心思想是什么？它是如何实现「分页」的？请说明它的分层结构、队列管理… | 进阶 | ★★★ |
| [AGT-MEM-026](../AGT/MEM.md#AGT-MEM-026) | 请说明 Generative Agents 的「记忆流、反思、规划」三件套分别做什么… | 进阶 | ★★ |
| [AGT-MEM-033](../AGT/MEM.md#AGT-MEM-033) | 为什么说生产级的记忆系统需要「时间线」，而不能只做向量检索？请结合 Zep 的双时间… | 进阶 | ★★★ |
| [AGT-MEM-048](../AGT/MEM.md#AGT-MEM-048) | 面试官问：「记忆和 RAG 有什么区别？RAG 算不算一种记忆？你们为什么用 Mar… | 进阶 | ★★ |
| [AGT-MEM-052](../AGT/MEM.md#AGT-MEM-052) | 你给个人助理 Agent 加上了跨会话的长期记忆。如何评测这套记忆系统的效果？请分别… | 进阶 | ★ |
| [AGT-MULTI-007](../AGT/MULTI.md#AGT-MULTI-007) | 2025 年 6 月，Anthropic 发布《How we built our m… | 进阶 | ★★★ |
| [AGT-MULTI-015](../AGT/MULTI.md#AGT-MULTI-015) | 多 Agent 系统中，Agent 之间共享上下文的方式从「全共享」到「全隔离」大致… | 进阶 | ★★ |
| [AGT-MULTI-038](../AGT/MULTI.md#AGT-MULTI-038) | 多 Agent 系统比单 Agent 更容易出现死循环和费用爆炸。请举出至少三种 A… | 进阶 | ★★★ |
| [AGT-MULTI-039](../AGT/MULTI.md#AGT-MULTI-039) | 什么是多 Agent 系统中的「角色漂移」（role drift）？它有哪些成因？请… | 进阶 | ★★ |
| [AGT-MULTI-040](../AGT/MULTI.md#AGT-MULTI-040) | 你把一个单 Agent 系统改造成了多 Agent，并声称效果更好。面试官追问：「你… | 进阶 | ★★★ |
| [AGT-MULTI-045](../AGT/MULTI.md#AGT-MULTI-045) | 面试官问：「你们为什么用 Agent Teams（多个 Agent 共享任务列表、动… | 进阶 | ★★ |
| [AGT-MULTI-047](../AGT/MULTI.md#AGT-MULTI-047) | 主 Agent 把几个调研子任务分派给子 Agent 并行执行。请说明：主 Agen… | 进阶 | ★ |
| [AGT-PLAN-016](../AGT/PLAN.md#AGT-PLAN-016) | ReAct 在做什么？它与 CoT、Act-only 相比各有什么优缺点？今天主流的… | 进阶 | ★★★ |
| [AGT-PLAN-033](../AGT/PLAN.md#AGT-PLAN-033) | CoT、Self-Consistency 和 ToT 有什么区别？请从核心思想、LL… | 进阶 | ★★★ |
| [AGT-PLAN-034](../AGT/PLAN.md#AGT-PLAN-034) | Plan-and-Execute 的结构是怎样的？它有哪些优缺点？什么时候应该触发重… | 进阶 | ★★★ |
| [AGT-PLAN-035](../AGT/PLAN.md#AGT-PLAN-035) | 请比较 ReAct、Plan-and-Execute、ReWOO、LLMCompil… | 挑战 | ★★ |
| [AGT-PLAN-036](../AGT/PLAN.md#AGT-PLAN-036) | 为什么生产中的编码 Agent 偏爱「待办清单」这种朴素的规划方式？如果让你为一个 … | 进阶 | ★★ |
| [AGT-PLAN-042](../AGT/PLAN.md#AGT-PLAN-042) | 长程 Agent 的「偏航」（又称目标漂移，goal drift）指什么？它和「路径… | 进阶 | ★★ |
| [AGT-PLAN-047](../AGT/PLAN.md#AGT-PLAN-047) | 你要为公司内部的编码 Agent 设计「Plan 模式」：先只读探索、写出方案，经用… | 进阶 | ★★ |
| [AGT-PROMPT-003](../AGT/PROMPT.md#AGT-PROMPT-003) | 一个生产环境中的任务提示词通常由哪些部分组成？请说明各部分的作用、推荐的组织顺序，以… | 进阶 | ★★★ |
| [AGT-PROMPT-007](../AGT/PROMPT.md#AGT-PROMPT-007) | 零样本提示和少样本提示各适合什么场景？如果决定使用少样本，示例应该怎样选、怎样排、放… | 进阶 | ★★★ |
| [AGT-PROMPT-011](../AGT/PROMPT.md#AGT-PROMPT-011) | 在生产系统中使用思维链提示，需要考虑哪些问题？请从提示写法、推理与答案的分离和解析、… | 进阶 | ★★ |
| [AGT-PROMPT-024](../AGT/PROMPT.md#AGT-PROMPT-024) | 如何像管理代码一样管理提示词？请从模板与变量、用户输入的嵌入方式、版本与发布、可观测… | 进阶 | ★★ |
| [AGT-PROMPT-034](../AGT/PROMPT.md#AGT-PROMPT-034) | 把一个原本基于普通指令模型的应用迁移到推理模型（如 o1、DeepSeek-R1 这… | 进阶 | ★★ |
| [AGT-PROMPT-039](../AGT/PROMPT.md#AGT-PROMPT-039) | 团队有一个线上的合同字段抽取任务，提示词由工程师手工迭代了几十版，效果卡在瓶颈。有人… | 进阶 | ★★ |
| [AGT-PROTO-003](../AGT/PROTO.md#AGT-PROTO-003) | 有人评价：「MCP 不过是给 Function Calling 换了个统一格式。」请… | 进阶 | ★★★ |
| [AGT-PROTO-011](../AGT/PROTO.md#AGT-PROTO-011) | 按 MCP 2025-11-25 版规范，客户端原语 Sampling、Roots、… | 进阶 | ★★ |
| [AGT-PROTO-017](../AGT/PROTO.md#AGT-PROTO-017) | 按 MCP 2025-11-25 版规范，请描述 MCP 初始化握手的三个步骤，并说… | 进阶 | ★★ |
| [AGT-PROTO-027](../AGT/PROTO.md#AGT-PROTO-027) | 一个远程 MCP Server 要接入企业的统一身份系统，供数千名员工通过各自的 A… | 挑战 | ★★ |
| [AGT-PROTO-036](../AGT/PROTO.md#AGT-PROTO-036) | A2A 中调用方获取任务进展与结果有三种方式：请求加轮询、流式订阅、推送通知。请分别… | 进阶 | ★★ |
| [AGT-PROTO-039](../AGT/PROTO.md#AGT-PROTO-039) | 团队 A 有一个「市场调研 Agent」，团队 B 想在自己的 Agent 里调用它… | 挑战 | ★★ |
| [AGT-PROTO-042](../AGT/PROTO.md#AGT-PROTO-042) | 团队的系统提示词已经膨胀到 2 万 token，里面塞满了报销、合同审批、周报生成等… | 进阶 | ★★ |
| [AGT-PROTO-057](../AGT/PROTO.md#AGT-PROTO-057) | 你负责评审其他团队提交到平台的 MCP Server。请给出一份评测清单：应当从哪些… | 进阶 | ★★ |
| [AGT-PROTO-059](../AGT/PROTO.md#AGT-PROTO-059) | Skill、MCP、CLI（让 Agent 直接在 Shell 中调用命令行工具）、… | 进阶 | ★★ |
| [AGT-PROTO-062](../AGT/PROTO.md#AGT-PROTO-062) | 在客服 Agent 中引入生成式 UI：Agent 不再只回复文字，而是返回可交互的… | 挑战 | ★ |
| [AGT-PROTO-067](../AGT/PROTO.md#AGT-PROTO-067) | MCP 2026-07-28 版把 Roots、Sampling、Logging 以… | 进阶 | ★★ |
| [AGT-REFL-017](../AGT/REFL.md#AGT-REFL-017) | Reflexion 的核心思想是什么？由哪几部分组成？它和 Self-Refine … | 进阶 | ★★★ |
| [AGT-REFL-018](../AGT/REFL.md#AGT-REFL-018) | 让大模型自我反思、自我纠错一定有用吗？请说明它在什么情况下可靠、在什么情况下靠不住，… | 进阶 | ★★★ |
| [AGT-REFL-019](../AGT/REFL.md#AGT-REFL-019) | 在反思与自我改进的系统里，「验证器」扮演什么角色？常见的验证器有哪些，各自的优缺点是… | 挑战 | ★★ |
| [AGT-REFL-020](../AGT/REFL.md#AGT-REFL-020) | 如果要让 Agent 把反思得到的经验保存下来、在后续尝试或后续任务中复用，你会如何… | 挑战 | ★★ |
| [AGT-RL-013](../AGT/RL.md#AGT-RL-013) | 怎样设计一个「可训」的 Agent RL 环境？请说明关键要求、接口与工程实现、任务… | 进阶 | ★★★ |
| [AGT-RL-025](../AGT/RL.md#AGT-RL-025) | 以 Search-R1 和 SWE-RL 为例，说明工具增强或软件工程类 Agent… | 进阶 | ★★ |
| [AGT-RL-028](../AGT/RL.md#AGT-RL-028) | 什么是拒绝采样微调（RFT，也叫专家迭代）？它和 GRPO 这类 RL 方法是什么关… | 进阶 | ★★★ |
| [AGT-RL-035](../AGT/RL.md#AGT-RL-035) | 训练客服类 Agent 时，常用大模型扮演用户（用户模拟器），与 Agent 进行多… | 进阶 | ★ |
| [AGT-TOOL-030](../AGT/TOOL.md#AGT-TOOL-030) | Function Calling 的原理是什么？模型真的在执行函数吗？它是怎么学会输… | 进阶 | ★★★ |
| [AGT-TOOL-031](../AGT/TOOL.md#AGT-TOOL-031) | 并行工具调用有哪些坑？请分别从协议层面和执行层面回答，并说明如何应对。 | 进阶 | ★★ |
| [AGT-TOOL-032](../AGT/TOOL.md#AGT-TOOL-032) | 工具调用的严格模式（strict）是怎么保证参数合法的？使用它要遵守哪些 Schem… | 挑战 | ★★ |
| [AGT-TOOL-033](../AGT/TOOL.md#AGT-TOOL-033) | 工具描述和参数 Schema 怎么写，模型才不容易用错？请给出你的原则，并说明如何验… | 进阶 | ★★★ |
| [AGT-TOOL-034](../AGT/TOOL.md#AGT-TOOL-034) | 多步工具调用中出错了怎么办？请对常见的工具错误分类，并分别说明处理方式；再说明错误信… | 进阶 | ★★★ |
| [AGT-TOOL-035](../AGT/TOOL.md#AGT-TOOL-035) | 一个 Agent 要接入上百个工具，全部放进上下文会有什么问题？有哪些应对方法？如何… | 进阶 | ★★★ |
| [AGT-TOOL-049](../AGT/TOOL.md#AGT-TOOL-049) | 面试官问：「你们的 Agent 用了哪些缓存？」候选人提到了工具结果缓存、Promp… | 进阶 | ★★ |
| [AGT-TOOL-052](../AGT/TOOL.md#AGT-TOOL-052) | 面试官连续追问：「Function Calling 和『提示词里约定格式、再用正则解… | 进阶 | ★★★ |
| [ALN-GRPO-005](../ALN/GRPO.md#ALN-GRPO-005) | 面试官问：「GRPO 相对 PPO 做了哪些简化？每一处简化付出了什么代价？什么样的… | 进阶 | ★★★ |
| [ALN-GRPO-013](../ALN/GRPO.md#ALN-GRPO-013) | DAPO 对 GRPO 做了哪些改进？每一项解决什么问题、具体怎么做？DAPO 还去… | 进阶 | ★★★ |
| [ALN-GRPO-024](../ALN/GRPO.md#ALN-GRPO-024) | Dr. GRPO（论文 Understanding R1-Zero-Like Tra… | 进阶 | ★★ |
| [ALN-GRPO-027](../ALN/GRPO.md#ALN-GRPO-027) | GSPO 的作者认为 GRPO 的 token 级重要性比率「更像噪声而不是修正」。… | 挑战 | ★★ |
| [ALN-GRPO-040](../ALN/GRPO.md#ALN-GRPO-040) | 设计 GRPO 训练时，组大小 G 怎么选？请从基线质量、零方差组概率、生成成本、与… | 进阶 | ★★ |
| [ALN-GRPO-047](../ALN/GRPO.md#ALN-GRPO-047) | 长思维链 RL 中，rollout 占了每一步的大部分时间，回答长度的长尾也很严重。… | 挑战 | ★★ |
| [ALN-GRPO-048](../ALN/GRPO.md#ALN-GRPO-048) | 你维护一个 GRPO 训练框架，一步训练的数据流是：取提示词 → 每题采样 G 个回… | 进阶 | ★★ |
| [ALN-PO-001](../ALN/PO.md#ALN-PO-001) | 请从 RLHF 的 KL 约束目标出发推导 DPO 的损失函数： (1) 写出目标函… | 挑战 | ★★★ |
| [ALN-PO-022](../ALN/PO.md#ALN-PO-022) | IPO 论文指出 DPO 在「确定性偏好」下会过拟合，KL 正则失效。请解释： (1… | 挑战 | ★★ |
| [ALN-PO-032](../ALN/PO.md#ALN-PO-032) | 请设计一个迭代式 DPO 流程：从一个 SFT 模型出发，每一轮如何构造偏好数据、训… | 进阶 | ★★ |
| [ALN-PO-038](../ALN/PO.md#ALN-PO-038) | 请从所需模型、数据与采样方式、计算与工程成本、训练稳定性、效果上限与适用场景几个方面… | 进阶 | ★★★ |
| [ALN-PO-041](../ALN/PO.md#ALN-PO-041) | 模型已经在高质量的示范数据上做过 SFT，为什么通常还要再做一轮 DPO 等偏好优化… | 进阶 | ★★ |
| [ALN-REASON-006](../ALN/REASON.md#ALN-REASON-006) | DeepSeek-R1-Zero 与 DeepSeek-R1 的训练方式有什么区别？… | 进阶 | ★★★ |
| [ALN-REASON-013](../ALN/REASON.md#ALN-REASON-013) | 为什么对小模型来说，从强推理模型蒸馏往往比直接对它做大规模 RL 更有效？蒸馏又有哪… | 挑战 | ★★★ |
| [ALN-REASON-023](../ALN/REASON.md#ALN-REASON-023) | 什么是推理模型的过度思考？它是怎么产生的，有什么危害？请从训练和推理两个方面给出缓解… | 进阶 | ★★ |
| [ALN-REASON-029](../ALN/REASON.md#ALN-REASON-029) | 在什么情况下不应该（或没必要）使用推理模型？如果业务中既有简单请求又有复杂请求，应如… | 进阶 | ★★ |
| [ALN-REASON-037](../ALN/REASON.md#ALN-REASON-037) | 要让同一个模型既能「深思熟虑」（长思维链），又能「快速作答」（不思考），并且可以由用… | 挑战 | ★★ |
| [ALN-RL-015](../ALN/RL.md#ALN-RL-015) | 请推导策略梯度定理（REINFORCE 形式）： (1) 从目标 J(\theta)… | 挑战 | ★★★ |
| [ALN-RL-022](../ALN/RL.md#ALN-RL-022) | 比较 REINFORCE（蒙特卡洛策略梯度，可带常数或组内基线）与 Actor-Cr… | 进阶 | ★★ |
| [ALN-RL-033](../ALN/RL.md#ALN-RL-033) | 什么是强化学习中的「探索与利用」困境？请列举经典 RL 中常见的探索方法，并说明：在… | 进阶 | ★★ |
| [ALN-RL-037](../ALN/RL.md#ALN-RL-037) | PPO 与 TRPO 都想解决「用旧策略采集的数据，安全地把策略往前推一步」的问题。… | 挑战 | ★★ |
| [ALN-RLHF-002](../ALN/RLHF.md#ALN-RLHF-002) | 请说明 RLHF（InstructGPT 配方）三个阶段分别做什么、每个阶段的输入数… | 基础 | ★★★ |
| [ALN-RLHF-017](../ALN/RLHF.md#ALN-RLHF-017) | 训练好一个奖励模型后，在接入 PPO 之前应该如何评估它？请从离线指标、偏差探测、分… | 挑战 | ★★ |
| [ALN-RLHF-024](../ALN/RLHF.md#ALN-RLHF-024) | PPO 已经通过裁剪限制了每一步的更新幅度，为什么 RLHF 还要加对参考模型的 K… | 进阶 | ★★★ |
| [ALN-RLHF-032](../ALN/RLHF.md#ALN-RLHF-032) | 为什么说 PPO 在大模型 RLHF 中「难训」？请从模型与超参数、critic、奖… | 进阶 | ★★★ |
| [ALN-RWD-003](../ALN/RWD.md#ALN-RWD-003) | 实际的 RL 训练常用「混合奖励」：可验证的部分用规则，开放的部分用奖励模型，再加上… | 进阶 | ★★★ |
| [ALN-RWD-015](../ALN/RWD.md#ALN-RWD-015) | 「长度偏置」会贯穿偏好数据、奖励模型、RL 训练和评测各个环节。请分别说明每个环节怎… | 进阶 | ★★ |
| [ALN-RWD-026](../ALN/RWD.md#ALN-RWD-026) | 请说明 Constitutional AI 的两个阶段分别做什么；它相比纯人工标注的… | 进阶 | ★★ |
| [ALN-RWD-028](../ALN/RWD.md#ALN-RWD-028) | 过程奖励模型（PRM）的步骤级标签可以通过哪些途径获得？各有什么问题？PRM 在 R… | 挑战 | ★★ |
| [ALN-RWD-033](../ALN/RWD.md#ALN-RWD-033) | 你要为对话模型的 RL 训练选择奖励来源：打分式奖励模型（标量头 + Bradley… | 挑战 | ★★ |
| [CS-ALGO-050](../CS/ALGO.md#CS-ALGO-050) | 你已经写好了一个 LRU 缓存（哈希表 + 双向链表）。面试官要求把它用来缓存 Ag… | 进阶 | ★★★ |
| [CS-DIST-016](../CS/DIST.md#CS-DIST-016) | Raft 常被认为比 Paxos 更容易理解和实现。请从问题分解、Leader 的角… | 进阶 | ★★ |
| [CS-DIST-022](../CS/DIST.md#CS-DIST-022) | TCC 模式落地时常遇到「幂等」「空回滚」「悬挂」三个问题。请分别说明它们是什么、在… | 挑战 | ★★ |
| [CS-NET-016](../CS/NET.md#CS-NET-016) | 在浏览器地址栏输入 https://example.com/chat 并回车，到页面… | 基础 | ★★★ |
| [CS-NET-017](../CS/NET.md#CS-NET-017) | 请描述 TLS 1.3 的完整握手过程，并回答：它相比 TLS 1.2 有哪些关键改… | 进阶 | ★★★ |
| [CS-NET-024](../CS/NET.md#CS-NET-024) | 大模型的流式输出为什么普遍采用 SSE，而不是 WebSocket？什么场景下应该选… | 进阶 | ★★★ |
| [CS-NET-029](../CS/NET.md#CS-NET-029) | 设计一个大模型推理平台时，对外接口用 HTTP/JSON（REST + SSE）还是… | 进阶 | ★★ |
| [CS-OS-004](../CS/OS.md#CS-OS-004) | 请比较进程、线程、协程：它们分别是什么的单位，由谁调度，切换开销有多大，各自适合什么… | 基础 | ★★★ |
| [CS-OS-016](../CS/OS.md#CS-OS-016) | 互斥锁、信号量、条件变量有什么区别？各自适合解决什么问题？请结合一个调用大模型 AP… | 进阶 | ★★ |
| [CS-OS-020](../CS/OS.md#CS-OS-020) | 请说明五种 IO 模型（阻塞 IO、非阻塞 IO、IO 多路复用、信号驱动 IO、异… | 进阶 | ★★ |
| [CS-PY-027](../CS/PY.md#CS-PY-027) | 面试官问：「既然 CPython 有 GIL，同一时刻只有一个线程在执行字节码，为什… | 进阶 | ★★★ |
| [CS-PY-038](../CS/PY.md#CS-PY-038) | 在 asyncio 中：(1) 调用 task.cancel() 之后到底发生了什么… | 挑战 | ★★ |
| [CS-PY-044](../CS/PY.md#CS-PY-044) | 在 Agent 项目中，大模型会返回 JSON 格式的工具调用参数，例如 {"cit… | 进阶 | ★★ |
| [CS-SQL-028](../CS/SQL.md#CS-SQL-028) | 请解释事务 ACID 的含义，以及脏读、不可重复读、幻读三种并发异常；说明四种标准隔… | 进阶 | ★★★ |
| [CS-TORCH-010](../CS/TORCH.md#CS-TORCH-010) | PyTorch 中 contiguous() 是做什么的？什么样的张量是「不连续」的… | 进阶 | ★★★ |
| [CS-TORCH-031](../CS/TORCH.md#CS-TORCH-031) | 面试中常要求「手写一个 PyTorch 训练循环」。请写出一个标准训练 step 的… | 进阶 | ★★★ |
| [ENG-DESIGN-003](../ENG/DESIGN.md#ENG-DESIGN-003) | 面试官说：「讲一个你做过的 Agent 项目。」请给出讲述结构并说明每部分要讲什么；… | 基础 | ★★★ |
| [ENG-DESIGN-006](../ENG/DESIGN.md#ENG-DESIGN-006) | 系统设计题的需求澄清环节应该从哪些维度提问？请至少列出 6 个维度，分别说明「答案会… | 进阶 | ★★★ |
| [ENG-DESIGN-016](../ENG/DESIGN.md#ENG-DESIGN-016) | 请用分层模板讲一个 Agent 平台的参考架构：分哪几层，每层负责什么？请沿「一次请… | 进阶 | ★★★ |
| [ENG-DESIGN-019](../ENG/DESIGN.md#ENG-DESIGN-019) | 什么是 Agent 系统的「不可变配置包」？它应当包含哪些内容？为什么要在每条 Tr… | 进阶 | ★★ |
| [ENG-DESIGN-025](../ENG/DESIGN.md#ENG-DESIGN-025) | 请用 FMEA 的「失败模式 — 影响 — 检测 — 缓解」四列，为企业知识库问答助… | 进阶 | ★★ |
| [ENG-OBS-011](../ENG/OBS.md#ENG-OBS-011) | 如何为一个线上 Agent 服务建立监控？请说明：一条好的 trace 应该包含什么… | 进阶 | ★★★ |
| [ENG-OBS-019](../ENG/OBS.md#ENG-OBS-019) | 为什么说 Agent 的发布单位应该是一个不可变的「配置包」，而不只是代码或提示词？… | 进阶 | ★★ |
| [ENG-OBS-022](../ENG/OBS.md#ENG-OBS-022) | 模型供应商通知：你们 Agent 当前使用的模型快照将在 90 天后下线。请给出迁移… | 进阶 | ★★★ |
| [ENG-OBS-033](../ENG/OBS.md#ENG-OBS-033) | 如何为 Agent 产品建立「线上失败 → 改进 → 再上线」的数据飞轮？请说明要收… | 进阶 | ★★ |
| [ENG-PERF-021](../ENG/PERF.md#ENG-PERF-021) | 除了开启流式输出，还有哪些方法可以降低大模型应用的「感知延迟」？请说明各自的适用场景… | 进阶 | ★★ |
| [ENG-PERF-023](../ENG/PERF.md#ENG-PERF-023) | Agent 的上下文随步数膨胀，输入成本快速上升。请给出系统的上下文裁剪方案：哪些内… | 进阶 | ★★ |
| [ENG-PERF-025](../ENG/PERF.md#ENG-PERF-025) | 面试官问：「你们为什么调 API 而不自己部署开源模型？」或者反过来问。请给出「自部… | 进阶 | ★★★ |
| [ENG-STAB-003](../ENG/STAB.md#ENG-STAB-003) | 面试官说：「超时、重试、限流、熔断这些后端稳定性套路大家都会背，Agent 服务有什… | 进阶 | ★★★ |
| [ENG-STAB-004](../ENG/STAB.md#ENG-STAB-004) | 调用大模型 API 的重试，和普通 RPC 的重试有什么不同？请从结果、成本、副作用… | 进阶 | ★★★ |
| [ENG-STAB-024](../ENG/STAB.md#ENG-STAB-024) | 重试、至少一次投递、幂等三者是什么关系？结合「Agent 调用退款、发邮件等写操作工… | 进阶 | ★★ |
| [ENG-STAB-027](../ENG/STAB.md#ENG-STAB-027) | 长任务的 Worker 用「租约 + 心跳」占住任务。为什么这还不足以保证同一个任务… | 挑战 | ★★ |
| [ENG-STAB-040](../ENG/STAB.md#ENG-STAB-040) | 什么是背压（backpressure）？Agent 服务应该怎样做过载保护？为什么「… | 进阶 | ★★ |
| [ENG-STAB-041](../ENG/STAB.md#ENG-STAB-041) | 主模型供应商大面积故障，或持续返回 429 时，Agent 服务怎样保持可用？请给出… | 进阶 | ★★★ |
| [EVL-AGENT-003](../EVL/AGENT.md#EVL-AGENT-003) | 与评测单轮问答相比，评测 Agent 难在哪里？请列出主要难点，并分别说明应对办法。 | 进阶 | ★★★ |
| [EVL-AGENT-019](../EVL/AGENT.md#EVL-AGENT-019) | 报告一个编码 Agent 在 SWE-bench 系列上的成绩时，必须声明哪些信息？… | 挑战 | ★★★ |
| [EVL-AGENT-020](../EVL/AGENT.md#EVL-AGENT-020) | GAIA 和 SWE-bench 分别考 Agent 的什么能力、怎么判分？二者在任… | 进阶 | ★★★ |
| [EVL-AGENT-026](../EVL/AGENT.md#EVL-AGENT-026) | 如何评测一个网页 / GUI Agent？请说明应该分哪几层评、各层可以用什么基准或… | 进阶 | ★★ |
| [EVL-AGENT-033](../EVL/AGENT.md#EVL-AGENT-033) | 你要为团队搭建一个 Agent 评测 Harness（评测框架，不是 Agent 运… | 进阶 | ★★★ |
| [EVL-AGENT-043](../EVL/AGENT.md#EVL-AGENT-043) | 用 LLM 评审 Agent 的轨迹，和用 LLM 评审单轮回答相比，有哪些不同？请… | 进阶 | ★★★ |
| [EVL-AGENT-044](../EVL/AGENT.md#EVL-AGENT-044) | 如何对 Agent 的失败做归因，让结果真正驱动迭代？如果新版本的整体成功率掉了 5… | 进阶 | ★★★ |
| [EVL-LLM-011](../EVL/LLM.md#EVL-LLM-011) | IFEval 这类「可验证指令」基准测的是什么？它的 strict 与 loose … | 进阶 | ★★ |
| [EVL-LLM-021](../EVL/LLM.md#EVL-LLM-021) | 什么是 LLM-as-a-Judge？它有哪几种常见用法，各适合什么场景？有哪些已知… | 挑战 | ★★★ |
| [FND-DL-005](../FND/DL.md#FND-DL-005) | 请给一位没有学过机器学习的工程师讲清楚反向传播：它要解决什么问题，怎么做，为什么高效… | 进阶 | ★★★ |
| [FND-DL-017](../FND/DL.md#FND-DL-017) | 残差连接（y=x+F(x)）为什么能让上百层的网络训练起来？请从优化难度、梯度传播、… | 挑战 | ★★★ |
| [FND-DL-032](../FND/DL.md#FND-DL-032) | 请写出 LSTM 的计算公式，说明每个门的作用，以及它为什么能缓解长序列上的梯度消失… | 进阶 | ★★ |
| [FND-MATH-010](../FND/MATH.md#FND-MATH-010) | 设 logits 为 z\in\mathbb{R}^C，p=\mathrm{soft… | 进阶 | ★★★ |
| [FND-MATH-022](../FND/MATH.md#FND-MATH-022) | 请回答：(1) 熵、交叉熵、KL 散度的定义，以及三者之间的关系；(2) 训练分类器… | 进阶 | ★★★ |
| [FND-ML-004](../FND/ML.md#FND-ML-004) | 请推导平方损失下的偏差-方差分解，说明每一项的含义；并说明在实际项目中如何判断模型主… | 进阶 | ★★★ |
| [FND-ML-031](../FND/ML.md#FND-ML-031) | 请比较随机森林、GBDT 与 XGBoost（可兼谈 LightGBM）：它们的核心… | 进阶 | ★★ |
| [FND-ML-034](../FND/ML.md#FND-ML-034) | 请讲清支持向量机的核心思想：(1) 硬间隔 SVM 的优化目标是什么，为什么要最大化… | 进阶 | ★★ |
| [FND-ML-035](../FND/ML.md#FND-ML-035) | 请说明 K-means 的算法流程与优化目标，为什么它一定会收敛、却不一定收敛到全局… | 进阶 | ★★★ |
| [FND-NLP-010](../FND/NLP.md#FND-NLP-010) | 请比较 Word2Vec（以 Skip-gram 负采样为例）与 GloVe：两者分… | 挑战 | ★★ |
| [FND-NLP-017](../FND/NLP.md#FND-NLP-017) | 为什么 Transformer 取代了 RNN / LSTM，成为 NLP 的主流架… | 进阶 | ★★★ |
| [FND-NLP-022](../FND/NLP.md#FND-NLP-022) | 什么是「静态词向量」与「上下文相关的词表示」？请以多义词为例说明两者的区别，并梳理从… | 进阶 | ★★ |
| [FND-NLP-026](../FND/NLP.md#FND-NLP-026) | 掩码语言模型（MLM，如 BERT）与因果语言模型（CLM，如 GPT）的训练目标有… | 进阶 | ★★★ |
| [FND-OPT-011](../FND/OPT.md#FND-OPT-011) | AdamW 中的权重衰减与「Adam + L2 正则」有什么区别？为什么在 SGD … | 进阶 | ★★★ |
| [FND-OPT-029](../FND/OPT.md#FND-OPT-029) | 牛顿法利用了二阶信息，在凸二次问题上一步就能收敛。请说明：(1) 牛顿法的更新公式及… | 挑战 | ★★ |
| [FND-OPT-035](../FND/OPT.md#FND-OPT-035) | 面试官问：「Muon 相对 AdamW 改了什么？为什么可能更好？要在大模型训练中用… | 挑战 | ★★ |
| [INF-BASE-004](../INF/BASE.md#INF-BASE-004) | 请从 Roofline（算术强度）的角度解释：为什么 Prefill 通常是算力瓶颈… | 进阶 | ★★★ |
| [INF-BASE-009](../INF/BASE.md#INF-BASE-009) | TTFT 和 TPOT 分别由哪些因素决定？各有哪些主要优化手段？两者之间存在哪些冲… | 进阶 | ★★★ |
| [INF-BASE-029](../INF/BASE.md#INF-BASE-029) | 如何刻画一个 LLM 推理服务的负载？请列出关键维度，说明这些维度分别如何影响瓶颈判… | 进阶 | ★★ |
| [INF-BASE-030](../INF/BASE.md#INF-BASE-030) | 描述一个流式请求在 vLLM 一类推理服务中的完整生命周期（从客户端发出到连接关闭）… | 进阶 | ★★★ |
| [INF-BASE-039](../INF/BASE.md#INF-BASE-039) | 线上推理服务「慢」或「吞吐上不去」时，如何系统地判断瓶颈在哪里（排队、显存容量、显存… | 挑战 | ★★ |
| [INF-KERNEL-007](../INF/KERNEL.md#INF-KERNEL-007) | 请说明 FlashAttention 的算法要点：前向如何分块、如何在看不到整行时做… | 进阶 | ★★★ |
| [INF-KERNEL-012](../INF/KERNEL.md#INF-KERNEL-012) | 请推导 online softmax：(1) 写出处理新的一块打分时 m、\ell、… | 挑战 | ★★ |
| [INF-KERNEL-020](../INF/KERNEL.md#INF-KERNEL-020) | 从 FlashAttention 到 FlashAttention-2、FlashA… | 挑战 | ★★ |
| [INF-KV-011](../INF/KV.md#INF-KV-011) | vLLM 的 PagedAttention 解决了什么问题？它如何借鉴操作系统的虚拟… | 进阶 | ★★★ |
| [INF-KV-025](../INF/KV.md#INF-KV-025) | 对比 vLLM 的自动前缀缓存（APC）与 SGLang 的 RadixAttent… | 进阶 | ★★ |
| [INF-KV-029](../INF/KV.md#INF-KV-029) | 在推理服务中落地 KV Cache 量化（如 FP8、INT4），除了「精度掉多少」… | 挑战 | ★★ |
| [INF-KV-033](../INF/KV.md#INF-KV-033) | 长上下文推理中，KV 淘汰与压缩方法（如 StreamingLLM、H2O、Snap… | 挑战 | ★ |
| [INF-QUANT-014](../INF/QUANT.md#INF-QUANT-014) | PTQ 与 QAT 各自的流程、成本与适用条件是什么？现在需要把一个 8B 对话模型… | 进阶 | ★★★ |
| [INF-QUANT-022](../INF/QUANT.md#INF-QUANT-022) | LLM.int8() 与 SmoothQuant 都是为了解决「激活离群值让 INT… | 挑战 | ★★ |
| [INF-QUANT-026](../INF/QUANT.md#INF-QUANT-026) | GPTQ 与 AWQ 都是 4 bit 权重量化的主流 PTQ 方法。请比较它们的核… | 进阶 | ★★★ |
| [INF-QUANT-041](../INF/QUANT.md#INF-QUANT-041) | 量化后整体指标的掉点超出了预算，如何定位「敏感层」并用混合精度修复？请给出具体步骤、… | 进阶 | ★★ |
| [INF-QUANT-042](../INF/QUANT.md#INF-QUANT-042) | 请为下面四种部署需求分别选择量化方案（权重、激活、KV 的格式与方法），并说明理由：… | 挑战 | ★★★ |
| [INF-QUANT-047](../INF/QUANT.md#INF-QUANT-047) | 大模型剪枝有非结构化、半结构化（如 2:4）和结构化三类。请比较它们的精度代价与实际… | 挑战 | ★★ |
| [INF-SCHED-007](../INF/SCHED.md#INF-SCHED-007) | 什么是连续批处理（continuous batching）？与静态批处理相比它解决了… | 进阶 | ★★★ |
| [INF-SCHED-013](../INF/SCHED.md#INF-SCHED-013) | Chunked Prefill 解决什么问题？具体如何调度？它的代价是什么？每步的 … | 进阶 | ★★★ |
| [INF-SCHED-026](../INF/SCHED.md#INF-SCHED-026) | PD 分离有哪些收益和代价？在什么情况下不值得做？工程上如何降低它的代价？ | 挑战 | ★★ |
| [INF-SCHED-033](../INF/SCHED.md#INF-SCHED-033) | 推理服务的调度器需要在多个目标之间权衡。请列举主要的权衡关系，说明每一对矛盾的来源与… | 挑战 | ★★ |
| [INF-SERVE-016](../INF/SERVE.md#INF-SERVE-016) | 推理部署时，如何在多副本（DP）、张量并行（TP）、流水线并行（PP）、专家并行（E… | 进阶 | ★★★ |
| [INF-SERVE-031](../INF/SERVE.md#INF-SERVE-031) | 一个基于 vLLM / SGLang 的线上推理服务应该监控哪些指标？请分类列出，说… | 进阶 | ★★★ |
| [INF-SERVE-034](../INF/SERVE.md#INF-SERVE-034) | 面试官问：「vLLM、SGLang、TensorRT-LLM、llama.cpp 你… | 进阶 | ★★★ |
| [INF-SERVE-035](../INF/SERVE.md#INF-SERVE-035) | 如何核算自部署推理服务的「每百万 token 成本」？请给出计算方法，说明有哪些因素… | 挑战 | ★★ |
| [INF-SERVE-042](../INF/SERVE.md#INF-SERVE-042) | 公司自研了一个 Decoder-only 模型（结构与 Llama 类似，但注意力中… | 进阶 | ★★ |
| [INF-SPEC-009](../INF/SPEC.md#INF-SPEC-009) | 请证明投机采样（以 \min(1,p/q) 接受，拒绝后从 \max(0,p-q) … | 进阶 | ★★★ |
| [INF-SPEC-028](../INF/SPEC.md#INF-SPEC-028) | 投机解码有多种草稿来源：独立草稿模型、Medusa、EAGLE、MTP、Lookah… | 进阶 | ★★ |
| [INF-SPEC-029](../INF/SPEC.md#INF-SPEC-029) | 投机解码的草稿长度 \gamma 应该如何选择？为什么不是越大越好？有哪些动态调整 … | 进阶 | ★★ |
| [LLM-ARCH-004](../LLM/ARCH.md#LLM-ARCH-004) | 当前主流大模型（GPT、Llama、Qwen、DeepSeek 等）几乎都采用 De… | 进阶 | ★★★ |
| [LLM-ARCH-040](../LLM/ARCH.md#LLM-ARCH-040) | 从原始 Transformer（2017）、GPT-2（2019）到 Llama 3… | 进阶 | ★★★ |
| [LLM-ARCH-044](../LLM/ARCH.md#LLM-ARCH-044) | 请在白板上画出（或用文字描述）一层 Llama 风格 Decoder Block 的… | 进阶 | ★★★ |
| [LLM-ARCH-045](../LLM/ARCH.md#LLM-ARCH-045) | 面试官给你一个 Decoder-only 模型的 config.json（Llama… | 进阶 | ★★★ |
| [LLM-ARCH-046](../LLM/ARCH.md#LLM-ARCH-046) | 请比较 Encoder-Decoder 与 Decoder-only 两种架构：结构… | 进阶 | ★★ |
| [LLM-ARCH-048](../LLM/ARCH.md#LLM-ARCH-048) | 面试官追问：「既然 Decoder-only 是主流，那做文本分类时，Decoder… | 进阶 | ★★ |
| [LLM-ATTN-005](../LLM/ATTN.md#LLM-ATTN-005) | 请比较 MHA、MQA、GQA、MLA 四种注意力：它们各自如何处理 K、V，推理时… | 进阶 | ★★★ |
| [LLM-ATTN-014](../LLM/ATTN.md#LLM-ATTN-014) | 请推导 Scaled Dot-Product Attention 为什么要除以 \s… | 进阶 | ★★★ |
| [LLM-ATTN-020](../LLM/ATTN.md#LLM-ATTN-020) | 多头注意力相比单头注意力「多了什么、没多什么」？输出投影 W^O 起什么作用？头数与… | 进阶 | ★★★ |
| [LLM-ATTN-025](../LLM/ATTN.md#LLM-ATTN-025) | DeepSeek 的 MLA（Multi-head Latent Attention… | 进阶 | ★★ |
| [LLM-ATTN-027](../LLM/ATTN.md#LLM-ATTN-027) | KV Cache 缓存的是什么？为什么只缓存 K、V 而不缓存 Q？为什么 Deco… | 基础 | ★★★ |
| [LLM-ATTN-032](../LLM/ATTN.md#LLM-ATTN-032) | 标准注意力的计算量和显存随序列长度平方增长。请把长上下文场景下的优化思路分成「不改变… | 进阶 | ★★★ |
| [LLM-ATTN-039](../LLM/ATTN.md#LLM-ATTN-039) | 线性注意力把复杂度降到了 O(T)，推理时的状态大小也固定，但它至今没有取代 Sof… | 挑战 | ★ |
| [LLM-DEC-031](../LLM/DEC.md#LLM-DEC-031) | 面试官问：「我们把 temperature 设成 0 了，为什么同样的输入，线上结果… | 进阶 | ★★★ |
| [LLM-DEC-035](../LLM/DEC.md#LLM-DEC-035) | 请比较贪心解码、束搜索、温度采样、top-k、top-p 的原理、优缺点与适用场景；… | 进阶 | ★★★ |
| [LLM-MM-010](../LLM/MM.md#LLM-MM-010) | 视觉编码器与语言模型之间的「模态连接器」有哪些主流方案？请比较线性 / MLP 投影… | 挑战 | ★★★ |
| [LLM-MM-022](../LLM/MM.md#LLM-MM-022) | 以「视觉编码器 + 连接器 + 语言模型」结构的多模态大模型（如 LLaVA、Qwe… | 进阶 | ★★★ |
| [LLM-MM-033](../LLM/MM.md#LLM-MM-033) | 为什么「一个模型同时做好多模态理解与图像生成」很难？请从视觉表示、训练目标、生成方式… | 挑战 | ★★ |
| [LLM-MM-042](../LLM/MM.md#LLM-MM-042) | 机器人的精细操作通常需要几十到几百 Hz 的控制频率，而数十亿参数的 VLA 模型一… | 挑战 | ★★ |
| [LLM-MODEL-003](../LLM/MODEL.md#LLM-MODEL-003) | 请梳理 OpenAI 从 GPT-1 到 GPT-4 的演进：每一代（GPT-1、G… | 进阶 | ★★★ |
| [LLM-MODEL-015](../LLM/MODEL.md#LLM-MODEL-015) | 请梳理 Qwen 系列从 Qwen2.5 到 Qwen3、再到 Qwen3-Next… | 进阶 | ★★★ |
| [LLM-MODEL-018](../LLM/MODEL.md#LLM-MODEL-018) | DeepSeek-V3（2024 年 12 月）以较低的训练成本达到了当时开放权重模… | 挑战 | ★★★ |
| [LLM-MODEL-033](../LLM/MODEL.md#LLM-MODEL-033) | 从 2K 到 128K 乃至 1M，大模型的上下文长度增长依赖哪些技术进步？请以 L… | 挑战 | ★★ |
| [LLM-MOE-013](../LLM/MOE.md#LLM-MOE-013) | 什么是专家容量与容量因子？容量因子设大、设小各有什么代价？被丢弃的 token 会怎… | 进阶 | ★★ |
| [LLM-MOE-021](../LLM/MOE.md#LLM-MOE-021) | 「辅助损失」与「无辅助损失」两种负载均衡方案分别是怎样工作的？为什么说辅助损失存在两… | 挑战 | ★★ |
| [LLM-MOE-029](../LLM/MOE.md#LLM-MOE-029) | MoE 为什么能在大幅增加参数量的同时，不明显增加每个 token 的计算量？它的代… | 进阶 | ★★★ |
| [LLM-NEW-005](../LLM/NEW.md#LLM-NEW-005) | Mamba 这类状态空间模型能否取代 Transformer？请说明 Mamba 的… | 进阶 | ★★ |
| [LLM-NEW-011](../LLM/NEW.md#LLM-NEW-011) | 长上下文让注意力的计算量与 KV Cache 成为瓶颈，业界出现了两条改架构的路线：… | 挑战 | ★★ |
| [LLM-POS-006](../LLM/POS.md#LLM-POS-006) | 请比较正弦绝对位置编码、可学习绝对位置编码和相对位置编码（以 T5 的相对位置偏置为… | 基础 | ★★ |
| [LLM-POS-011](../LLM/POS.md#LLM-POS-011) | RoPE（旋转位置编码）的原理是什么？为什么说它「用绝对位置的操作实现了相对位置编码… | 进阶 | ★★★ |
| [LLM-POS-027](../LLM/POS.md#LLM-POS-027) | 模型训练长度为 4K，要扩展到 32K。请比较 PI（位置插值）、NTK-aware… | 进阶 | ★★★ |
| [LLM-POS-042](../LLM/POS.md#LLM-POS-042) | 什么是 Lost in the Middle 现象？请从模型角度分析可能的成因，并分… | 进阶 | ★★ |
| [LLM-POS-046](../LLM/POS.md#LLM-POS-046) | 从 Qwen2-VL 到 Qwen2.5-VL、Qwen3-VL，多模态位置编码经历… | 挑战 | ★ |
| [LLM-TOK-011](../LLM/TOK.md#LLM-TOK-011) | 请比较 BPE、WordPiece、Unigram 三种子词算法：训练的方向与选择依… | 进阶 | ★★★ |
| [LLM-TOK-017](../LLM/TOK.md#LLM-TOK-017) | 为什么同一个大模型 API 对不同语言的用户「同价不同费」？请说明分词压缩率差异的来… | 进阶 | ★★ |
| [LLM-TOK-034](../LLM/TOK.md#LLM-TOK-034) | 从「按词切分」到「子词」再到「字节级 BPE」，未登录词（OOV）问题是怎样一步步被… | 进阶 | ★★ |
| [RAG-ADV-012](../RAG/ADV.md#RAG-ADV-012) | Self-RAG 与 CRAG 都在解决「该不该检索、检到的靠不靠谱」的问题。请分别… | 挑战 | ★★ |
| [RAG-ADV-017](../RAG/ADV.md#RAG-ADV-017) | 什么是多跳问题？为什么单次检索难以回答它？请介绍至少三种多跳检索的方法，并说明这些方… | 进阶 | ★★ |
| [RAG-ADV-028](../RAG/ADV.md#RAG-ADV-028) | 要让员工用自然语言查询公司的业务数据库（有几百张表），你会如何设计一个可靠的 Tex… | 进阶 | ★★ |
| [RAG-ADV-034](../RAG/ADV.md#RAG-ADV-034) | 近两年「本体（Ontology）」在企业 Agent 中重新受到关注。请回答：(1)… | 挑战 | ★ |
| [RAG-ADV-035](../RAG/ADV.md#RAG-ADV-035) | 某团队用 GraphRAG（LLM 抽取实体关系 → 社区检测 → 逐层生成社区摘要… | 进阶 | ★★ |
| [RAG-BASE-012](../RAG/BASE.md#RAG-BASE-012) | Naive RAG 有哪些典型缺陷？Advanced RAG 与 Modular R… | 进阶 | ★★ |
| [RAG-BASE-017](../RAG/BASE.md#RAG-BASE-017) | 直接用大模型回答企业内部问题有哪些短板？RAG 分别是怎么应对的？又有哪些问题是 R… | 基础 | ★★★ |
| [RAG-BASE-021](../RAG/BASE.md#RAG-BASE-021) | 请按顺序说出 RAG 在线链路的主要步骤。如果分别省掉其中的「查询改写」「多路召回与… | 基础 | ★★★ |
| [RAG-BASE-022](../RAG/BASE.md#RAG-BASE-022) | 一次 RAG 请求的端到端延迟由哪些部分构成？通常哪些部分是大头？请给出至少 5 种… | 进阶 | ★★ |
| [RAG-BASE-033](../RAG/BASE.md#RAG-BASE-033) | 面试官问：「Claude Code 这类编码 Agent 搜代码为什么用 grep，… | 进阶 | ★★ |
| [RAG-CHUNK-015](../RAG/CHUNK.md#RAG-CHUNK-015) | 语义切块（semantic chunking）是怎么做的？与递归切块相比有哪些优缺点… | 进阶 | ★★ |
| [RAG-CHUNK-023](../RAG/CHUNK.md#RAG-CHUNK-023) | 块大小如何影响 RAG 的效果？请从检索精度、上下文完整性、成本与延迟、模型长度限制… | 进阶 | ★★★ |
| [RAG-CHUNK-027](../RAG/CHUNK.md#RAG-CHUNK-027) | 企业知识库中有大量扫描件、含图表的 PPT 和复杂表格。请给出这类文档的解析与入库方… | 进阶 | ★★ |
| [RAG-EMB-011](../RAG/EMB.md#RAG-EMB-011) | 训练或微调 Embedding 模型时，为什么要用难负例？难负例从哪里来？如何处理其… | 进阶 | ★★ |
| [RAG-EMB-016](../RAG/EMB.md#RAG-EMB-016) | 要为一个中文企业知识库（约 100 万个块，以中文为主、夹杂部分英文术语）选择 Em… | 进阶 | ★★★ |
| [RAG-EMB-023](../RAG/EMB.md#RAG-EMB-023) | 通用 Embedding 模型在公司内部数据（大量术语、缩写和内部黑话）上的检索效果… | 进阶 | ★★ |
| [RAG-EMB-028](../RAG/EMB.md#RAG-EMB-028) | 请比较 IVF（及 IVF-PQ）与 HNSW 两类 ANN 索引：原理、可调参数、… | 进阶 | ★★★ |
| [RAG-EVAL-012](../RAG/EVAL.md#RAG-EVAL-012) | RAGAS 中常用的四个指标（忠实度、答案相关性、上下文精确率、上下文召回率）分别衡… | 挑战 | ★★★ |
| [RAG-EVAL-016](../RAG/EVAL.md#RAG-EVAL-016) | 如果要从零为一个企业制度问答 RAG 构建评测集，你会怎么做？请说明题目从哪里来、标… | 进阶 | ★★★ |
| [RAG-EVAL-030](../RAG/EVAL.md#RAG-EVAL-030) | 如何为 RAG 系统建立线上反馈闭环（数据飞轮）？请说明要收集哪些信号、怎样从信号走… | 进阶 | ★★ |
| [RAG-QUERY-023](../RAG/QUERY.md#RAG-QUERY-023) | RAG 系统如何做到「知识库里没有答案时老实拒答」？请说明可以在哪些环节设置防线、阈… | 进阶 | ★★★ |
| [RAG-QUERY-027](../RAG/QUERY.md#RAG-QUERY-027) | 检索之前的「查询侧优化」有哪些常用方法？请分别说明它们解决什么问题、代价与风险是什么… | 进阶 | ★★★ |
| [RAG-QUERY-028](../RAG/QUERY.md#RAG-QUERY-028) | 如何让 RAG 系统的回答带上可靠的引用？请从提示词设计、生成后的引用校验、校验不通… | 进阶 | ★★★ |
| [RAG-RETR-003](../RAG/RETR.md#RAG-RETR-003) | 从 TF-IDF 到 BM25，主要改进了什么？请写出 BM25 的打分公式，并说明… | 进阶 | ★★★ |
| [RAG-RETR-011](../RAG/RETR.md#RAG-RETR-011) | 倒排索引的基本结构是什么？为什么它能让关键词检索在海量文档上依然很快？在文档不断新增… | 进阶 | ★★ |
| [RAG-RETR-017](../RAG/RETR.md#RAG-RETR-017) | 已经有了向量检索，为什么还要做混合检索？请结合例子说明稠密检索与 BM25 各自的盲… | 进阶 | ★★★ |
| [RAG-RETR-037](../RAG/RETR.md#RAG-RETR-037) | 请比较 Bi-Encoder（双塔）、Cross-Encoder、ColBERT、L… | 进阶 | ★★★ |
| [SEC-AGENT-013](../SEC/AGENT.md#SEC-AGENT-013) | 什么是 AI Agent 的「致命三要素」？请说明你会如何用它评审一个 Agent … | 进阶 | ★★★ |
| [SEC-AGENT-022](../SEC/AGENT.md#SEC-AGENT-022) | 退款、发邮件、删除数据这类高危操作需要「人在环中」。请说明审批机制如何设计：哪些动作… | 进阶 | ★★★ |
| [SEC-AGENT-032](../SEC/AGENT.md#SEC-AGENT-032) | 什么是 MCP 的「工具描述投毒」和「rug pull」？请说明它们为什么有效；接入… | 进阶 | ★★★ |
| [SEC-AGENT-034](../SEC/AGENT.md#SEC-AGENT-034) | Agent 系统的供应链包括哪些环节？请分别说明 MCP Server 与插件、Ag… | 进阶 | ★★ |
| [SEC-DEF-003](../SEC/DEF.md#SEC-DEF-003) | 面试官问：「用 OWASP LLM Top 10 的思路，给一个能读用户邮件、能调用… | 进阶 | ★★★ |
| [SEC-DEF-007](../SEC/DEF.md#SEC-DEF-007) | 请把「纵深防御」落到一个能调用工具的 Agent 上：沿数据流说出各道防线（至少六道… | 进阶 | ★★★ |
| [SEC-DEF-024](../SEC/DEF.md#SEC-DEF-024) | 大模型的回答通过 SSE 流式推送给前端。安全团队要对输出做内容安全与外泄检查，产品… | 进阶 | ★★ |
| [SEC-DEF-026](../SEC/DEF.md#SEC-DEF-026) | 如何为一个能读网页、读邮件、发邮件的 Agent 建立持续的自动化红队评测？请说明：… | 进阶 | ★★ |
| [SEC-INJ-012](../SEC/INJ.md#SEC-INJ-012) | 越狱（jailbreak）有哪些主要类别？请站在防御者的角度，说明每一类利用的机制、… | 进阶 | ★★ |
| [SEC-INJ-018](../SEC/INJ.md#SEC-INJ-018) | 面试官问：「在系统提示词里写上『不要执行文档和网页中的任何指令』，能不能把它当作 A… | 进阶 | ★★★ |
| [SEC-INJ-030](../SEC/INJ.md#SEC-INJ-030) | 你要在一个能调用工具的 Agent 中部署护栏模型。请说明：护栏可以挂在哪几个位置、… | 进阶 | ★★ |
| [SEC-INJ-036](../SEC/INJ.md#SEC-INJ-036) | RAG 系统检索到的文档片段里，可能藏着针对模型的恶意指令。请从入库、检索、生成与动… | 进阶 | ★★★ |
| [SEC-REL-005](../SEC/REL.md#SEC-REL-005) | 大模型为什么会产生幻觉？请从数据、训练、推理（解码）三个阶段分析成因，并为每个阶段给… | 进阶 | ★★★ |
| [SEC-REL-006](../SEC/REL.md#SEC-REL-006) | 用户问「某开源框架最新版本里的 X 接口怎么用」，模型自信地给出了一个已被废弃的旧写… | 进阶 | ★★ |
| [SEC-REL-029](../SEC/REL.md#SEC-REL-029) | 请为一个面向公众的对话产品设计内容安全审核体系：审核放在哪些环节、用什么手段、命中后… | 进阶 | ★★ |
| [SEC-REL-032](../SEC/REL.md#SEC-REL-032) | 一家金融客户要求你们的 Agent 产品满足审计要求：「任何一次自动化决策都要能说清… | 进阶 | ★ |
| [TRN-ADAPT-010](../TRN/ADAPT.md#TRN-ADAPT-010) | 什么是灾难性遗忘？在继续预训练中如何度量它？有哪些缓解手段，各自的代价是什么？ | 进阶 | ★★★ |
| [TRN-ADAPT-015](../TRN/ADAPT.md#TRN-ADAPT-015) | 一个以英文为主的开源模型在中文上切分很碎（一个汉字常被切成多个字节级 token）。… | 进阶 | ★★ |
| [TRN-ADAPT-023](../TRN/ADAPT.md#TRN-ADAPT-023) | 要把一个强推理模型的能力迁移到 7B 小模型上，可以选择「用教师轨迹做 SFT（离线… | 挑战 | ★★ |
| [TRN-ADAPT-030](../TRN/ADAPT.md#TRN-ADAPT-030) | 要让大模型掌握一个垂直领域的知识，常见的选择有继续预训练（CPT）、SFT 和 RA… | 进阶 | ★★★ |
| [TRN-ADAPT-035](../TRN/ADAPT.md#TRN-ADAPT-035) | 请从强化学习的视角解释在线策略蒸馏（on-policy distillation，O… | 挑战 | ★★ |
| [TRN-DATA-008](../TRN/DATA.md#TRN-DATA-008) | 预训练数据为什么要去重？通常按哪些粒度、用哪些方法来做？去重是不是越彻底越好？ | 进阶 | ★★★ |
| [TRN-DATA-018](../TRN/DATA.md#TRN-DATA-018) | 如果让你为预训练数据训练一个质量分类器，你会如何选择正负样本、选择模型、确定过滤阈值… | 进阶 | ★★ |
| [TRN-DATA-028](../TRN/DATA.md#TRN-DATA-028) | 什么是预训练中的课程学习（curriculum learning）？请列举大模型预训… | 进阶 | ★★ |
| [TRN-DATA-031](../TRN/DATA.md#TRN-DATA-031) | 高质量的人类文本越来越不够用，合成数据成为预训练和中期训练的重要补充。请说明：(1)… | 进阶 | ★★★ |
| [TRN-DATA-035](../TRN/DATA.md#TRN-DATA-035) | 如果你负责一个预训练项目的数据去污染，你会如何设计这套流程？请说明要保护哪些评测集、… | 进阶 | ★★ |
| [TRN-DIST-011](../TRN/DIST.md#TRN-DIST-011) | 请说明 ZeRO-1、ZeRO-2、ZeRO-3 分别切分了什么，写出每张卡模型状态… | 进阶 | ★★★ |
| [TRN-DIST-024](../TRN/DIST.md#TRN-DIST-024) | 张量并行（TP）和流水线并行（PP）有什么区别？请从切分方式、通信模式与通信量、效率… | 基础 | ★★★ |
| [TRN-DIST-030](../TRN/DIST.md#TRN-DIST-030) | 流水线并行的气泡是怎么产生的？请给出至少四种减小气泡（或减轻其影响）的方法，并分别说… | 进阶 | ★★ |
| [TRN-DIST-035](../TRN/DIST.md#TRN-DIST-035) | 要把一个 70B 稠密模型（80 层，隐藏维度 8192，64 个 Query 头、… | 进阶 | ★★ |
| [TRN-DIST-038](../TRN/DIST.md#TRN-DIST-038) | MoE 训练中，专家并行（EP）的通信为什么容易成为瓶颈？请说明 EP 的通信模式，… | 挑战 | ★★ |
| [TRN-DIST-043](../TRN/DIST.md#TRN-DIST-043) | 大模型训练中有哪些「通信与计算重叠」的手段？请按并行维度（DP / ZeRO、TP、… | 进阶 | ★★ |
| [TRN-MEM-003](../TRN/MEM.md#TRN-MEM-003) | 全参训练一个大模型时，GPU 显存都花在了哪些地方？请给出估算方法，并说明估算时最容… | 进阶 | ★★★ |
| [TRN-MEM-014](../TRN/MEM.md#TRN-MEM-014) | 什么是激活重计算（activation recomputation / gradie… | 进阶 | ★★★ |
| [TRN-MEM-023](../TRN/MEM.md#TRN-MEM-023) | FP8 训练相比 BF16 训练能带来什么收益？主要难点是什么？业界有哪些应对方法？ | 挑战 | ★★ |
| [TRN-MEM-027](../TRN/MEM.md#TRN-MEM-027) | 为什么 FP16 混合精度训练需要 loss scaling？请说明它的原理、动态 … | 进阶 | ★★★ |
| [TRN-PEFT-008](../TRN/PEFT.md#TRN-PEFT-008) | 请讲清 LoRA 的原理：(1) 它基于什么假设，增量如何参数化，A、B 如何初始化… | 进阶 | ★★★ |
| [TRN-PEFT-011](../TRN/PEFT.md#TRN-PEFT-011) | LoRA 的秩 r、缩放系数 \alpha、作用层和学习率应该怎么选？请给出经验做法… | 进阶 | ★★ |
| [TRN-PEFT-020](../TRN/PEFT.md#TRN-PEFT-020) | QLoRA 相对 LoRA 多了哪些技术？请分别说明其原理与收益，描述训练时的精度路… | 进阶 | ★★★ |
| [TRN-PEFT-027](../TRN/PEFT.md#TRN-PEFT-027) | 请比较 Adapter、Prefix Tuning、Prompt Tuning、Lo… | 进阶 | ★★ |
| [TRN-PEFT-034](../TRN/PEFT.md#TRN-PEFT-034) | 全参数微调、LoRA、QLoRA 如何选型？请从任务与数据、资源、效果与遗忘、部署形… | 进阶 | ★★★ |
| [TRN-PT-017](../TRN/PT.md#TRN-PT-017) | Chinchilla 认为每个参数约训练 20 个 token 最划算，但 Llam… | 进阶 | ★★★ |
| [TRN-PT-025](../TRN/PT.md#TRN-PT-025) | 有人说「大模型的涌现能力只是评测指标制造的错觉」。请谈谈你的看法：(1) 指标选择如… | 挑战 | ★★ |
| [TRN-PT-029](../TRN/PT.md#TRN-PT-029) | 预训练为什么需要学习率 warmup？峰值学习率和全局 batch size 一般怎… | 进阶 | ★★★ |
| [TRN-PT-033](../TRN/PT.md#TRN-PT-033) | 什么是预训练的「退火阶段」？为什么常在这一阶段上采样高质量数据？Llama 3 是如… | 进阶 | ★★ |
| [TRN-SFT-003](../TRN/SFT.md#TRN-SFT-003) | LIMA 只用 1000 条精选样本微调 65B 的 LLaMA，就取得了很强的对话… | 进阶 | ★★★ |
| [TRN-SFT-012](../TRN/SFT.md#TRN-SFT-012) | 为什么说对话模板（chat template）是训练与推理之间的「接口协议」？请列举… | 进阶 | ★★ |
| [TRN-SFT-017](../TRN/SFT.md#TRN-SFT-017) | SFT 为什么通常只对 assistant 的回答计算 loss？在多轮对话、系统提… | 进阶 | ★★★ |
| [TRN-SFT-030](../TRN/SFT.md#TRN-SFT-030) | 在领域 SFT 中，如何在提升领域能力的同时尽量减少通用能力的遗忘？请从数据、超参数… | 进阶 | ★★ |
| [TRN-SFT-039](../TRN/SFT.md#TRN-SFT-039) | 请设计一个用于提升数学推理能力的拒绝采样微调（RFT）流程，并说明：(1) 每一步的… | 挑战 | ★★ |
| [TRN-SFT-041](../TRN/SFT.md#TRN-SFT-041) | 面试官问：「你的任务已经做了好几轮 SFT，什么时候该停下来改用强化学习？」请回答：… | 进阶 | ★★★ |
