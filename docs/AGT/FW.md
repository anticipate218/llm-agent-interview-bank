# AGT-FW · Agent 框架

> 所属大类：智能体 Agent　｜　题量：45

主流 Agent 框架的抽象、能力与选型。

**考点覆盖**：框架解决的问题（6） · LangChain（5） · LangGraph状态图（7） · 检查点与持久化（7） · 中断与人在回路（4） · OpenAI Agents SDK（2） · Handoff与Guardrail（3） · Google ADK（3） · AutoGen（4） · CrewAI（2） · MetaGPT与ChatDev（2） · 低代码平台（3） · 框架选型（12）

**题型**：[单选题（15）](#单选题) · [多选题（7）](#多选题) · [判断题（6）](#判断题) · [填空题（2）](#填空题) · [计算题（1）](#计算题) · [代码输出题（2）](#代码输出题) · [代码填空题（1）](#代码填空题) · [代码改错题（1）](#代码改错题) · [编程题（1）](#编程题) · [简答题（5）](#简答题) · [场景分析题（3）](#场景分析题) · [系统设计题（1）](#系统设计题)

---

## 单选题

<a name="AGT-FW-001"></a>

### AGT-FW-001　基础 · 考频 ★★

不用框架时，Agent 的核心循环（调模型 → 解析工具调用 → 执行 → 回填结果）几十行代码就能写完。下列能力中，通常被认为最难自己写对、也是状态图类框架真正「护城河」的是：

- **A.** 提示词模板与输出解析
- **B.** 持久化（断点续跑）与人在回路（暂停、等人、再恢复）
- **C.** 把函数签名自动转换成工具的 JSON Schema
- **D.** 用 print 打印每一步的输入输出

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：框架在核心循环之外大致替你做了七件事：编排、状态、工具、记忆、可观测、持久化、人审。其中持久化与人审最难自己写对。

要做到「暂停三天后在另一台机器上接着跑」，需要三件事同时成立：状态必须能序列化，执行位置必须被记录下来，恢复语义必须清楚（哪些步骤会重跑、副作用会不会重复）。自己从零实现，很容易在这些细节上出错。

- A 错：提示词模板与输出解析是早期框架（如最初的 LangChain）解决的问题，自己写也不难。
- C 错：从签名生成 schema 很方便，但几十行代码就能实现。
- D 错：print 日志远不等于可观测性；真正的可观测是结构化的 trace 树，能还原每一步的输入、输出、耗时和成本。

<sub>考点：框架解决的问题</sub>

</details>

---

<a name="AGT-FW-006"></a>

### AGT-FW-006　进阶 · 考频 ★★★

LangGraph 的 State 定义如下：

```python
class State(TypedDict):
    log: Annotated[list, operator.add]
    amount: int
```

某个超步中，节点 A 返回 `{"log": ["A"], "amount": 50}`，与之并行的节点 B 返回 `{"log": ["B"], "amount": 80}`。这个超步结束时会发生什么？

- **A.** amount 取后执行完的节点的值；log 追加 ["A", "B"] 或 ["B", "A"]，取决于完成的先后
- **B.** amount 变为 130，log 追加两个元素
- **C.** 抛出 InvalidUpdateError：没有 reducer 的 amount 在同一超步收到了两个写入
- **D.** amount 保持旧值不变，log 正常追加

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：没有 reducer 的字段默认是「覆盖」语义，同一超步只允许一个写入者；收到多个值时，框架不知道该听谁的，直接报错（错误信息形如「Can receive only one value per step. Use an Annotated key to handle multiple values.」），而不是静默覆盖。

- A 错：LangGraph 不会按完成先后静默覆盖；有 reducer 的字段也按**任务顺序**合并，与谁先执行完无关，保证结果可复现。
- B 错：没有 reducer 就不会求和；需要求和可以声明 `Annotated[int, operator.add]`。
- D 错：不会静默忽略写入。

如果只有 B 写了 amount，它会直接被覆盖为 80，log 变成「旧值 + ["A"] + ["B"]」。修复方法：给 amount 声明 reducer，或者调整设计，让同一超步只有一个节点写它。

<sub>考点：LangGraph状态图</sub>

</details>

---

<a name="AGT-FW-010"></a>

### AGT-FW-010　基础 · 考频 ★★★

一个编译时挂了 PostgreSQL checkpointer 的 LangGraph 应用，执行到第 5 个超步时进程崩溃。重启后要从断点继续执行，正确的做法是：

- **A.** 用同一个 thread_id 调用 invoke(None, config)，从最新检查点继续
- **B.** 用同一个 thread_id 再传一次原始输入，框架会自动跳过已经完成的节点
- **C.** 换一个新的 thread_id 并传入原始输入，框架会按输入内容匹配到旧的检查点
- **D.** 先调用 update_state 把状态改回初始值，再用同一个 thread_id 从入口重新运行

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：检查点按 thread_id 隔离；恢复时传 `None`（或人审场景下传 `Command(resume=...)`），框架读取最新检查点，从记录的 `next` 节点继续。

- B 错：再传一遍原始输入，框架会把它当成这个线程上的**新一轮输入**，从入口重新执行；追加型字段还会多出一份重复记录。
- C 错：检查点只按 thread_id（以及可选的 checkpoint_id）查找，不会按输入内容匹配；新的 thread_id 就是一个全新的会话。
- D 错：这等于放弃已完成的工作，从头再来。

注意：崩溃时正在执行的那个节点会**整个重新执行**，因为节点是最小的重跑单位。节点里的副作用（打款、发邮件）必须幂等，或者拆成更小的节点。同一超步中已成功的并行节点，其输出作为 pending writes 已经保存，不会重跑。

<sub>考点：检查点与持久化</sub>

</details>

---

<a name="AGT-FW-016"></a>

### AGT-FW-016　进阶 · 考频 ★★★

某 LangGraph 审批节点的代码如下：

```python
def approve(state):
    notify_reviewer(state["amount"])          # 给审批人发通知邮件
    decision = interrupt({"question": "批准这笔退款吗？", "amount": state["amount"]})
    return {"decision": decision}
```

审批人批准后，业务方用 `Command(resume="批准")` 恢复执行，结果审批人收到了两封通知邮件。最可能的原因是：

- **A.** checkpointer 重复写入了同一个检查点
- **B.** Command(resume=...) 会让整张图从 START 重新执行一遍
- **C.** interrupt() 默认会自动重试一次
- **D.** 恢复时该节点从头重新执行，interrupt() 之前的代码会再运行一次

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：这是 interrupt 最大的坑：恢复时**节点从头重跑**，`interrupt()` 这次直接返回恢复值，但它之前的代码已经又执行了一遍。

修复方法：
- 把副作用放到 interrupt 之后，或拆成单独的上游节点（如先由 notify 节点发通知，再进入 approve 节点等待）；
- 实在要放在前面，就做成幂等（带幂等键，重复调用只生效一次）。

- A 错：检查点写入是存储层的行为，不会触发业务代码发邮件。
- B 错：恢复是从被中断的那个节点继续，之前已完成的节点不会重跑。
- C 错：interrupt 没有自动重试的语义。

<sub>考点：中断与人在回路</sub>

</details>

---

<a name="AGT-FW-020"></a>

### AGT-FW-020　基础 · 考频 ★★

关于 OpenAI Agents SDK 的 Runner 循环，下列说法**正确**的是：

- **A.** 模型给出最终回答后，Runner 会把结果交给所有已注册的 Agent 投票确认
- **B.** Runner 没有轮数上限，需要开发者自己在工具里计数，防止死循环
- **C.** 工具调用与转交都在同一个循环里：执行工具后回填结果，转交则切换当前 Agent
- **D.** Tracing 默认关闭，需要手动开启才会记录模型调用和工具调用的 span

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：Agents SDK 的核心是一个 Runner 循环：调用当前 Agent 的模型 → 如果是普通工具调用就执行并回填，如果是转交（handoff）就切换当前 Agent，如果是最终输出就过输出护栏后返回。工具调用与转交都在同一个循环里。

- A 错：没有投票机制，最终输出只经过输出护栏的检查。
- B 错：Runner 有 `max_turns` 参数，超出时抛出异常中止运行，用来防止工具调用或互相转交的死循环。
- D 错：Tracing 默认开启，一次运行是一个 trace，模型调用、工具、转交、护栏各是一个 span，也可以接入自定义的处理器导出。

Agents SDK 于 2025 年 3 月发布，是 OpenAI 实验项目 Swarm 的生产版，原语很少：Agent、工具、Handoff、Guardrail，再加上自动维护多轮历史的 Session 和默认开启的 Tracing。

<sub>考点：OpenAI Agents SDK　｜　出处：OpenAI Agents SDK 文档 Running agents：https://openai.github.io/openai-agents-python/running_agents/ ；Tracing（默认开启）：https://openai.github.io/openai-agents-python/tracing/</sub>

</details>

---

<a name="AGT-FW-022"></a>

### AGT-FW-022　进阶 · 考频 ★★★

一个「出行规划」助手需要分别向机票、酒店、签证三个专业 Agent 获取结果，再由自己汇总成一份完整方案回复用户。用 OpenAI Agents SDK 实现时，最合适的组织方式是：

- **A.** 主 Agent 依次 Handoff 给三个专业 Agent，由最后一个 Agent 负责汇总
- **B.** 用 as_tool() 把三个专业 Agent 包装成工具，由主 Agent 调用并汇总结果
- **C.** 给主 Agent 配置输入护栏，由护栏把请求分发给三个专业 Agent
- **D.** 三个专业 Agent 互相 Handoff，每个 Agent 均可看到完整对话历史，循环到方案完成为止

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：Handoff 与「Agent 当工具」的区别在**控制权**。`as_tool()` 调用的子 Agent 干完把结果交回，主 Agent 始终掌控对话，适合需要汇总多个子结果的场景；Handoff 之后由新 Agent 直接回复用户，控制权不回来，适合「按意图分流、每段对话由一位专人负责」的场景（如客服分诊）。

- A 错：转交后控制权不回来，第一个、第二个专业 Agent 的结果要靠历史传递，最后一个 Agent 还得承担不属于它的汇总职责。
- C 错：护栏是安全检查，只负责放行或拦截，不负责路由。
- D 错：互相转交容易出现「踢皮球」式的循环，只能靠 `max_turns` 止损；共享完整历史也解决不了没有人负责汇总的问题。

<sub>考点：Handoff与Guardrail</sub>

</details>

---

<a name="AGT-FW-024"></a>

### AGT-FW-024　基础 · 考频 ★★

Google ADK 中的 SequentialAgent、ParallelAgent、LoopAgent 的共同特点是：

- **A.** 由大模型根据任务内容动态规划各个子 Agent 的执行顺序
- **B.** 只能包含 LlmAgent，不能再嵌套其他工作流 Agent
- **C.** 每个子 Agent 拥有完全隔离、互不可见的会话状态
- **D.** 自身不调用模型，只按固定方式顺序、并发或循环地编排子 Agent

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：ADK 把 Agent 分成三类：由模型驱动的 LlmAgent、只做确定性编排的工作流 Agent、继承 BaseAgent 自己写逻辑的自定义 Agent。工作流 Agent 不调用模型。

- A 错：让模型决定下一步的是 LlmAgent；Sequential、Parallel、Loop 都是写死的编排。
- B 错：工作流 Agent 可以互相嵌套，例如一个 SequentialAgent 里先放一个 ParallelAgent 做并发检索，再放一个 LoopAgent 做「写作 → 审阅」的循环。
- C 错：子 Agent 共享同一份会话 state，靠 `output_key` 把结果写进 state、下游在指令里用 `{键名}` 引用来传递数据。

LoopAgent 在达到 `max_iterations`，或某个子 Agent 发出 escalate 信号时停止。

注：ADK 2.0（Python 版于 2026 年 5 月正式发布）引入基于图的工作流，文档已把 SequentialAgent、ParallelAgent、LoopAgent 这类模板式工作流标为 Deprecated、推荐改用图工作流；现有代码仍可运行，本题考查的是这三类 Agent 本身的行为。

<sub>考点：Google ADK　｜　出处：Google ADK 文档 Workflow agents：https://adk.dev/agents/workflow-agents/ ；ADK 2.0：https://adk.dev/2.0/</sub>

</details>

---

<a name="AGT-FW-027"></a>

### AGT-FW-027　进阶 · 考频 ★★

关于 AutoGen，下列说法**正确**的是：

- **A.** 0.4 版是在 0.2 版基础上的小幅升级，原有代码无需修改即可运行
- **B.** AG2 是微软官方在 0.4 版之后发布的 AutoGen 新一代版本
- **C.** 0.2 版由 GroupChatManager 每轮选出下一位发言者
- **D.** 群聊只要配置了终止关键词检测，就一定会正常结束，不需要再设轮数上限

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：AutoGen 的核心抽象是可对话的 Agent，多 Agent 协作就是多方对话；0.2 版的 GroupChat 让多个 Agent 共享一份对话，由 GroupChatManager 每轮选人，`speaker_selection_method` 可选 auto（让模型选）、round_robin、random、manual 或自定义函数，还可以用「允许的发言转移图」约束谁能接谁的话。

- A 错：2025 年 1 月发布的 0.4 版是一次重写：底层改为异步、事件驱动的 actor 模型，上层 AgentChat 提供 RoundRobinGroupChat、SelectorGroupChat 等团队形态，与 0.2 的 API 不兼容。
- B 错：AG2 是 2024 年底部分原作者另立的社区分支，延续 0.2 的 API 风格，不是微软官方的新版本。此后微软于 2025 年 10 月发布 Microsoft Agent Framework（公开预览），把 AutoGen 与 Semantic Kernel 合并，AutoGen 以维护为主。
- D 错：模型可能永远不说终止词，也可能在讨论中顺口提到而过早结束；必须同时配置轮数上限和无进展检测。

<sub>考点：AutoGen　｜　出处：AutoGen 论文 arXiv:2308.08155</sub>

</details>

---

<a name="AGT-FW-031"></a>

### AGT-FW-031　基础 · 考频 ★★

CrewAI 中定义一个 Agent 时，写进提示词、用来设定其身份的「三件套」是：

- **A.** role（角色）、goal（目标）、backstory（背景）
- **B.** system、user、assistant 三种消息角色
- **C.** name、instructions、handoffs 三个参数
- **D.** plan、act、reflect 三个推理阶段

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：CrewAI 用「组建一支团队」来建模：Agent 由 role、goal、backstory 三件套设定身份，再配上工具以及是否允许委派；Task 写明任务描述、期望产出（expected_output）、负责的 Agent，并可以用 context 指定依赖哪些任务的输出；Crew 加上 Process（sequential 顺序执行或 hierarchical 由经理 Agent 分派）组织执行。

- B 错：这是聊天消息的三种角色，不是 CrewAI 的 Agent 定义。
- C 错：name、instructions、handoffs 更接近 OpenAI Agents SDK 中 Agent 的参数。
- D 错：这是一种推理循环的阶段划分，与 CrewAI 的 Agent 定义无关。

三件套贴近业务语言，上手快；代价是角色设定会带来额外的 token。

<sub>考点：CrewAI　｜　出处：CrewAI 文档</sub>

</details>

---

<a name="AGT-FW-033"></a>

### AGT-FW-033　进阶 · 考频 ★★

MetaGPT 的口号是「Code = SOP(Team)」。与自由群聊式的多 Agent 相比，它更稳定的**最关键**原因是：

- **A.** 角色数量更多，完整覆盖了软件公司从产品到测试的全部岗位
- **B.** 角色间传递结构化产物，按需订阅，并以真实测试结果作为反馈
- **C.** 所有角色统一使用同一个能力更强的大模型，减少能力差异
- **D.** 所有角色共享完整的对话历史，任何信息都不会在传递中丢失

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：MetaGPT 把软件公司的标准作业程序固化成角色流水线：产品经理写 PRD，架构师出系统设计与接口，项目经理拆任务，工程师写代码，QA 写测试。它的稳定性来自三点：

1. **结构化产物**：角色之间传递格式固定的文档，下游能校验字段、引用接口，不用从闲聊里猜；
2. **共享消息池 + 订阅**：每个角色把产物发布到消息池，只订阅自己关心的类型，上下文短、噪声少；
3. **可执行反馈**：代码真的去跑测试，失败信息回到工程师手里修复，而不是让另一个模型「看看有没有问题」。

- A 错：只照搬角色、没有结构化产物与可执行反馈，得到的是一群互相客气的聊天机器人。
- C 错：模型能力不是这套设计的关键。
- D 错：恰恰相反，订阅机制让每个角色只看自己需要的产物，减少噪声和上下文开销。

<sub>考点：MetaGPT与ChatDev　｜　出处：MetaGPT 论文 arXiv:2308.00352</sub>

</details>

---

<a name="AGT-FW-035"></a>

### AGT-FW-035　基础 · 考频 ★★

下列需求中，**最适合**直接在扣子（Coze）或 Dify 这类低代码平台上搭建的是：

- **A.** 业务同学要在一周内上线一个基于内部 FAQ 知识库、接入企业 IM 的问答助手
- **B.** 需要多层嵌套循环、动态扇出几百路，并对每一路的失败做精细恢复的数据处理 Agent
- **C.** 每一步的 token 和时延都要逐项优化的高并发核心交易链路
- **D.** 必须经过严格代码评审、单元测试和 CI/CD 流程发布的支付审批 Agent

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：低代码平台擅长快速搭建标准流程：可视化工作流、插件、知识库、多渠道发布开箱即用，业务同学也能上手。「检索 + 生成 + 少量 API」、需要快速接入多个渠道的问答助手，正是它的主场。

- B 错：复杂控制流（多层嵌套循环、动态扇出、精细的错误恢复）拖拽起来很快变成一团线，难以维护。
- C 错：节点的额外开销和平台内置的提示词不够透明，难以逐项优化性能与成本。
- D 错：版本比对、代码评审、单元测试、CI/CD 都不如代码顺手。

常见做法是混合：平台承载标准流程，复杂或核心的环节用代码实现，再以插件或 API 的形式接回平台。

<sub>考点：低代码平台　｜　出处：Dify 文档 Key Concepts：https://docs.dify.ai/en/learn/key-concepts ；Coze Studio 开源仓库：https://github.com/coze-dev/coze-studio</sub>

</details>

---

<a name="AGT-FW-037"></a>

### AGT-FW-037　进阶 · 考频 ★★★

团队要开发一个退款 Agent：超过 100 元的退款需要财务人工审批（可能隔天才处理）；服务会滚动发布，进程随时可能重启；审批人点错时，要能回到审批前重新决定；每一步都要可追溯。下列选型最合适的是：

- **A.** LangChain 的 LCEL 链：检索退款规则 → 生成方案 → 执行退款
- **B.** AutoGen 群聊：让财务 Agent 与客服 Agent 讨论后决定是否退款
- **C.** CrewAI 的 hierarchical 流程：由经理 Agent 分派并验收审批任务
- **D.** LangGraph：interrupt 人审 + 持久化 checkpointer + 时间旅行

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：需求的关键词是「长时间暂停、跨进程恢复、回到过去」，这正是状态图框架的强项。

- A 错：LCEL 描述的是有向无环的数据流，没有暂停、恢复和检查点。
- B 错：审批要由人来做，交给两个 Agent 讨论既不可控也不合规；对话式协作的路径也难以审计。
- C 错：CrewAI 支持任务级的人工复核，但跨进程的暂停恢复、检查点和时间旅行不是它的强项。
- D 对：`interrupt()` 存档后返回，隔天用 `Command(resume=...)` 恢复；Postgres 等持久化 saver 保证进程重启不丢；`get_state_history` 加 `update_state` 可以从审批前分叉重新决定；配合 trace 记录每一步。

别忘了：打款节点要带幂等键；如果流程跨多个系统、持续多天且涉及资金，可以再用 Temporal 一类持久化执行引擎做外层编排。

<sub>考点：框架选型　｜　出处：LangGraph 文档 Interrupts：https://docs.langchain.com/oss/python/langgraph/interrupts ；Persistence：https://docs.langchain.com/oss/python/langgraph/persistence</sub>

</details>

---

<a name="AGT-FW-043"></a>

### AGT-FW-043　进阶 · 考频 ★★

LangChain 官方博客（2025 年 10 月）把自家的三个开源项目分别定位为 Agent 框架、Agent 运行时和 Agent Harness。下列对应关系与说明正确的是：

- **A.** LangChain 是运行时，负责持久化执行与断点恢复；LangGraph 是 Harness，自带规划工具和文件系统；Deep Agents 是框架，只提供基础抽象
- **B.** LangChain 是框架，提供 Agent 循环与中间件等抽象；LangGraph 是运行时，负责持久化执行与人在回路；Deep Agents 是 Harness，自带规划与文件系统
- **C.** Deep Agents 是最底层的运行时，负责持久化执行与断点恢复；LangGraph 与 LangChain 都构建在 Deep Agents 之上，分别提供抽象和开箱即用的默认能力
- **D.** 三者分别面向不同的编程语言与部署环境，彼此互不兼容：项目一旦选用其中一个，就不能再同时使用另外两个

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：三层由低到高是：运行时（LangGraph）→ 框架（LangChain）→ Harness（Deep Agents）。

- **框架**的主要价值是抽象：统一的模型接口、内容块、Agent 循环与中间件；同类还有 OpenAI Agents SDK、Google ADK、CrewAI、LlamaIndex 等。
- **运行时**解决「在生产中运行 Agent」的基础设施问题：持久化执行、流式输出、人在回路、线程级与跨线程的持久化；同类还有 Temporal 等持久化执行引擎。LangChain 1.0 的 Agent 本身就构建在 LangGraph 之上。
- **Harness** 比框架更高一层，「开箱即用」：自带默认提示词、有主见的工具调用处理、规划能力和文件系统访问。Deep Agents 的 README 还列出了子 Agent、上下文管理（长对话摘要、把工具输出写入文件）、技能、人在回路等能力，并称自己为「自带电池的 Agent Harness」。Claude Agent SDK 也属于这一类。

- A 错：把层次弄反了。
- C 错：Deep Agents 在最上层，构建在 LangChain 的 Agent 与 LangGraph 运行时之上。
- D 错：三者可以组合使用。官方的建议是先从 Deep Agents 开始，需要精细控制每一步时，再下沉到 LangChain 与 LangGraph。

作者也承认这些术语的边界还很模糊。面试中能讲清「抽象、运行时、开箱即用的默认能力」这三层关注点即可。

<sub>考点：LangChain、LangGraph状态图、框架选型　｜　出处：LangChain 博客《Agent Frameworks, Runtimes, and Harnesses - oh my!》（2025-10-25）：https://www.langchain.com/blog/agent-frameworks-runtimes-and-harnesses-oh-my ；Deep Agents：https://github.com/langchain-ai/deepagents</sub>

</details>

---

<a name="AGT-FW-044"></a>

### AGT-FW-044　基础 · 考频 ★★

关于 LangChain 与 LlamaIndex 的定位差异，下列说法最准确的是：

- **A.** LlamaIndex 起家于「把私有数据接给大模型」，核心是数据连接器、索引与查询引擎，也支持 Agent 与 Workflows；LangChain 偏通用的 Agent 构件
- **B.** LlamaIndex 只能做向量检索与问答，既不支持 Agent，也不支持工具调用，因此无法用它来构建需要执行动作、调用外部系统的 Agent 应用
- **C.** LangChain 是 LlamaIndex 的一层 Python 封装，二者共享同一套底层代码和版本号，由同一个团队统一维护和发布
- **D.** 二者无法在同一个项目中同时使用：用 LlamaIndex 构建的索引或查询引擎，不能被包装成一个工具，交给 LangChain 或 LangGraph 中构建的 Agent 来调用

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：两者的出发点不同，但能力已经大量重叠。

LlamaIndex 官方文档把自己描述为「在你的数据之上构建 LLM 驱动的 Agent 的 Python 工具包」，最早以 RAG 闻名：数据连接器、索引与向量存储、查询引擎与聊天引擎是它的招牌抽象；如今也提供 Agent 与工具，以及支持分支、重试和人工审核的事件驱动 Workflows。LangChain 更偏通用：统一的模型接口、工具、Agent 循环与中间件，编排与持久化交给 LangGraph。

- B 错：LlamaIndex 早已支持 Agent 与工具。
- C 错：两者是不同团队维护的独立项目。
- D 错：二者可以组合，例如把 LlamaIndex 的查询引擎包装成一个工具，交给 LangChain 或 LangGraph 中的 Agent 调用。

选型建议：以「接数据、做检索与问答」为主的应用，LlamaIndex 的数据抽象更顺手；以复杂流程编排、长时间运行和人审为主的 Agent，LangGraph 更合适。两者都不必绑定：检索层与编排层可以各用所长。

<sub>考点：LangChain、框架选型　｜　出处：LlamaIndex 文档：https://developers.llamaindex.ai/python/framework/ ；LangChain 博客（2025-10-25）</sub>

</details>

---

<a name="AGT-FW-045"></a>

### AGT-FW-045　基础 · 考频 ★★

某公司的后端全部是 Java（Spring Boot），需要在现有服务中接入大模型 Agent 能力。关于 Java 生态的方案，下列说法正确的是：

- **A.** Java 生态目前没有成熟的大模型 Agent 框架，只能另起一个 Python 服务承载 Agent 逻辑，再由 Java 服务通过 HTTP 接口调用
- **B.** LangChain4j 是 Python 版 LangChain 的逐行移植，API 设计、模块划分都与 Python 版完全一致，并且始终与 Python 版同步发布新版本
- **C.** Spring AI 目前只支持 OpenAI 一家的模型，若要更换为其他厂商的模型，就必须绕开 Spring AI 重写全部调用代码
- **D.** Spring AI 有跨厂商的 ChatClient、工具调用、向量存储与 MCP 集成，LangChain4j 有 AI Services、工具与 RAG，都能嵌入现有服务

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：Java 技术栈可以直接在现有服务内接入 Agent 能力，主流选择是 Spring AI 和 LangChain4j。

- **Spring AI**：官方文档列出的能力包括跨厂商的可移植模型接口（支持 Anthropic、OpenAI、Google 等主要厂商）、风格类似 WebClient 的 ChatClient 流式 API、封装常见生成式 AI 模式的 Advisors、工具调用、把输出映射为 POJO 的结构化输出、多种向量数据库、对话记忆与 RAG，以及 MCP 的客户端与服务端集成，并提供 Spring Boot 自动配置。
- **LangChain4j**：以统一 API 对接 20 多家模型服务与 30 多种向量存储；高层的 AI Services 用声明式接口隐藏样板代码；支持工具、对话记忆、完整的 RAG 流程，并与 Quarkus、Spring Boot、Helidon、Micronaut 集成。

- A 错：如上所述，Java 生态已有成熟方案；当然，团队已有 Python Agent 服务时，跨语言调用也是可行的架构，但并不是「只能如此」。
- B 错：LangChain4j 的文档明确说明它**不是** Python 版的移植，而是面向 Java 设计的库，API、内部实现和发布节奏都独立于 Python 项目。
- C 错：Spring AI 的核心卖点之一就是跨厂商的可移植接口。

选型时还要考虑：团队已在用的框架（Spring 体系优先考虑 Spring AI）、需要的 Agent 能力深度（复杂的多步编排可能还要自己搭状态机或引入工作流引擎），以及各厂商官方 Java SDK 这种更薄的选择。

<sub>考点：框架选型　｜　出处：Spring AI 文档：https://docs.spring.io/spring-ai/reference/ ；LangChain4j 文档：https://docs.langchain4j.dev/intro</sub>

</details>

---

## 多选题

<a name="AGT-FW-003"></a>

### AGT-FW-003　进阶 · 考频 ★★★

LangChain 旧版的 AgentExecutor 把 ReAct 循环封装成开箱即用的执行器。下列哪些是它被状态图框架（如 LangGraph）取代的主要原因？

- **A.** 状态只有消息和中间步骤，难以承载计划、已验证的证据、预算等业务状态
- **B.** 循环写死在框架里，想「先强制检索一次」「某个工具之后必须审批」，只能 hack 回调或重写类
- **C.** 它没有任何迭代次数上限，一旦模型不给出最终答案就必然陷入死循环
- **D.** 它不支持工具调用，只能让模型基于提示词做纯文本问答
- **E.** 进程中断后无法从中间恢复，更难做隔天才完成的人工审批

<details>
<summary>答案与解析</summary>

**答案：ABE**

**解析：**

AgentExecutor 本质是一个写死的 while 循环：调模型 → 解析动作 → 执行工具 → 把（动作，观察）追加进中间步骤 → 直到给出最终答案或达到迭代上限。它的问题都源于「循环在框架手里」：

- A 对：状态单薄，业务状态只能塞进提示词或外部变量。
- B 对：控制流不可定制，插入审批、强制步骤、失败换策略都很别扭。
- C 错：它有 `max_iterations` 参数（默认 15），问题不在于没有上限。
- D 错：它的核心就是调用工具。
- E 对：没有检查点，进程一挂全部重来。

此外还有难以组合（Executor 嵌套后状态和追踪会断开）、中间状态不是一等公民导致难调试。LangChain 官方后来推荐用 LangGraph 构建 Agent；2025 年 10 月发布的 LangChain 1.0 中，`create_agent` 直接运行在 LangGraph 运行时之上，旧的链与 AgentExecutor 移到了 `langchain-classic` 包。

<sub>考点：LangChain、LangGraph状态图　｜　出处：LangChain 与 LangGraph 1.0 发布（2025-10-22）及 LangChain v1 迁移指南（AgentExecutor 移至 langchain-classic，create_agent 运行在 LangGraph 之上）：https://docs.langchain.com/oss/python/migrate/langchain-v1</sub>

</details>

---

<a name="AGT-FW-011"></a>

### AGT-FW-011　挑战 · 考频 ★★

关于 LangGraph 的 checkpointer 保存的检查点及恢复行为，下列说法**正确**的有：

- **A.** 默认只在整张图运行结束时保存一次检查点，因此中途崩溃只能从头再来
- **B.** 同一超步中有节点失败时，已成功节点的输出随之丢弃，恢复时这一超步的节点全部重跑
- **C.** 检查点会记录已发出的外部副作用（如邮件、扣款）的回滚日志，回放旧检查点时自动撤销这些副作用
- **D.** 检查点记录了接下来要执行的节点，可以通过 get_state(config).next 查看
- **E.** 检查点包含各状态字段（通道）的当前值和版本信息，运行时据此判断下一步哪些节点应被触发

<details>
<summary>答案与解析</summary>

**答案：DE**

**解析：**

编译时传入 checkpointer、调用时给出 thread_id，框架就会在**每个超步结束时**为该线程保存一份检查点，主要包括：状态值、下一步要执行的节点、版本信息、待写入（pending writes）和元数据（步号、来源、父检查点 ID）。

- A 错：检查点按超步保存。只在退出时写入是 `durability="exit"` 这种需要显式选择的模式，代价正是中途崩溃无法恢复。
- B 错：已成功节点的输出会作为 pending writes 存进检查点，恢复时只重跑失败的节点。例如三个并行分支有一个超时，另外两个的结果先存下来，不必重跑。
- C 错：框架管不了外部世界。回放会真的重新执行之后的节点，已扣的款不会自己回来，带副作用的节点要靠幂等设计，调试时可换成假实现。
- D 对：`next` 是断点续跑的依据。
- E 对：每个字段实现为一个通道，被更新时版本号递增；节点记住自己看过的版本，订阅的通道出现更新的版本时就被触发。恢复后运行时据此准确算出下一步。

父检查点 ID 把检查点串成链（分叉后成为树），这是时间旅行的基础。

<sub>考点：检查点与持久化</sub>

</details>

---

<a name="AGT-FW-017"></a>

### AGT-FW-017　进阶 · 考频 ★★

关于 LangGraph 的人在回路（human-in-the-loop）机制，下列说法**正确**的有：

- **A.** 恢复执行时应再次传入原始输入并带上同一个 thread_id，框架会自动识别出这是一次恢复，从断点继续执行
- **B.** 一个节点内有多个 interrupt() 时，恢复值按 payload 内容匹配，因此可以在条件分支里随意增减 interrupt 的个数
- **C.** 节点调用 interrupt(payload) 时，框架保存检查点，并通过返回值中的 __interrupt__ 字段把 payload 交给调用方
- **D.** 编译或调用时传入 interrupt_before / interrupt_after 也能暂停，但只能在整个节点前后停
- **E.** 不配置 checkpointer 也能使用 interrupt()，暂停状态会保存在调用方进程的内存中，进程重启后也能照常恢复

<details>
<summary>答案与解析</summary>

**答案：CD**

**解析：**

- A 错：恢复要用 `Command(resume=值)` 加同一个 thread_id；再传原始输入，框架会把它当作新一轮输入，从入口重新执行。
- B 错：恢复值与 interrupt 的对应关系严格按调用顺序（索引）匹配，与 payload 内容无关；节点恢复时会从头重跑，interrupt 的个数或顺序一变就会对错位，所以不要在条件分支里动态增减 interrupt。
- C 对：调用方拿到 payload（如金额、问题、证据）后推送审批卡片，然后本次调用结束，进程不必挂着等人。
- D 对：静态断点只能整节点地停，不能按条件暂停、不能携带数据，主要用于调试；官方更推荐在节点逻辑里调用 `interrupt()` 做人审。
- E 错：没有存档就谈不上「之后再恢复」，interrupt 必须配合 checkpointer。

常见的人审交互有四种：批准或驳回；编辑后批准（审批人改参数，随 resume 传回或用 `update_state` 改状态）；审查工具调用（执行前展示工具名和参数）；补充输入（向用户追问缺失的信息）。

<sub>考点：中断与人在回路</sub>

</details>

---

<a name="AGT-FW-021"></a>

### AGT-FW-021　进阶 · 考频 ★★

关于 OpenAI Agents SDK 中的 Handoff 与 Guardrail，下列说法**正确**的有：

- **A.** input_filter 可以裁剪交给下一个 Agent 的对话历史，例如去掉之前的工具调用记录
- **B.** 护栏触发 tripwire 后会抛出异常，本次运行中止
- **C.** 护栏函数只能用规则实现，不能在护栏里调用模型
- **D.** 输出护栏会检查转交链路上每一个 Agent 的中间输出
- **E.** Handoff 对模型来说是一种特殊消息，不出现在工具列表里，模型输出约定的关键词即可触发

<details>
<summary>答案与解析</summary>

**答案：AB**

**解析：**

- A 对：例如内置的 `handoff_filters.remove_all_tools`。过滤太狠会丢掉下游需要的信息，必要字段可以用 `input_type` 让模型在转交时附带结构化参数；`on_handoff` 回调常用来预取数据或记日志。
- B 对：输入、输出护栏触发后分别抛出 `InputGuardrailTripwireTriggered`、`OutputGuardrailTripwireTriggered`。
- C 错：护栏函数里可以运行一个小模型或另一个 Agent 做判定，常见做法是规则粗筛加小模型复核。
- D 错：输出护栏只作用于**产出最终结果的那个 Agent**；输入护栏也只作用于**第一个 Agent** 的输入。
- E 错：Handoff 在模型看来就是一个工具，默认名称形如 `transfer_to_<目标 Agent 名>`；转交意图通过工具选择来表达，模型不需要学新协议，转交的适用场景写在工具描述里。

注意：输入护栏默认与第一个 Agent 并发执行，省了时延，但护栏判定拦截时，主 Agent 可能已经消耗了 token 甚至调用了工具；对高风险或很贵的 Agent，可以改成「先拦后跑」。

<sub>考点：OpenAI Agents SDK、Handoff与Guardrail　｜　出处：OpenAI Agents SDK 文档</sub>

</details>

---

<a name="AGT-FW-032"></a>

### AGT-FW-032　进阶 · 考频 ★★

关于 CrewAI，下列说法**正确**的有：

- **A.** Process 设为 hierarchical 时，由一个经理 Agent 分派任务并验收结果
- **B.** Task 可以通过 context 指定依赖哪些任务的输出，并用 expected_output 描述期望的产出
- **C.** Flows 提供事件驱动的确定性编排，官方的分工是 Crews 负责自主协作、Flows 负责精确控制
- **D.** CrewAI 是基于 LangGraph 的上层封装，必须安装 LangChain 及其依赖才能使用
- **E.** Agent 设置 allow_delegation=True 后，可以把任务或问题委派给同一 Crew 中的其他 Agent

<details>
<summary>答案与解析</summary>

**答案：ABCE**

**解析：**

- A 对：hierarchical 流程由经理 Agent 分派与验收；sequential 则按任务顺序执行。
- B 对：context 让任务之间形成依赖关系；还可以要求结构化输出（Pydantic 模型）或人工复核。
- C 对：Flows 用 `@start`、`@listen`、`@router` 等装饰器连接步骤，状态是结构化的，一个 Crew 可以作为 Flow 中的一步。流程越复杂、越需要确定性，越应该退回 Flows 或图编排。
- D 错：CrewAI 是不依赖 LangChain 的独立 Python 框架。
- E 对：allow_delegation 默认为 False；打开后，Agent 会获得委派类工具，可以把子任务或问题交给同一 Crew 中更合适的 Agent。

注意 role、goal、backstory 这三件套会被写进 Agent 的提示词，写得越长，每次调用的 token 开销越大。CrewAI 适合「调研 → 写作 → 审校」这类角色清晰的内容生产。

<sub>考点：CrewAI　｜　出处：CrewAI 文档 Agents：https://docs.crewai.com/en/concepts/agents</sub>

</details>

---

<a name="AGT-FW-036"></a>

### AGT-FW-036　基础 · 考频 ★★

关于扣子（Coze）、Dify 这类低代码 Agent 平台的边界，下列说法**正确**的有：

- **A.** 私有化部署之后，插件调用的外部 API 和知识库中的敏感文档就无需再做权限控制与审计
- **B.** 扣子开源了 Coze Studio 之后，平台的插件生态与数据锁定问题就完全不存在了
- **C.** 平台同样提供代码节点、循环和自定义插件，真正的瓶颈是复杂度上来以后的可维护性
- **D.** 常见做法是平台承载标准流程，核心或复杂环节用代码实现，再以插件或 API 的形式接回平台
- **E.** Dify 的应用可以导出为 YAML 格式的 DSL，便于迁移和备份

<details>
<summary>答案与解析</summary>

**答案：CDE**

**解析：**

- A 错：私有化解决的是数据不出域，插件调用的外部 API、知识库里的敏感文档依然需要权限与审计。
- B 错：开源（2025 年 7 月开源 Coze Studio 与扣子罗盘，Apache 2.0 协议）让私有化部署成为可能，但应用依旧绑定在平台的节点类型、插件生态和数据格式上，迁移成本仍然存在。
- C 对：「低代码平台做不了复杂 Agent」的说法太绝对，问题在于复杂度上来以后难以维护、难以测试。
- D 对：需求稳定之后，再把关键链路逐步迁到代码框架。迁移信号包括：画布上的连线多到没人敢改、同一个问题要在多个应用里重复修、线上问题只能靠平台日志去猜。
- E 对：DSL 导出可以部分弥补版本管理上的不足。较新版本在 Studio 中导出的是 .ifpkg 应用包，里面的 app.yaml 就是 DSL 文件；也可以用命令行工具直接导出 DSL。

另外，Dify 的开源协议在 Apache 2.0 基础上附加了条件（例如对多租户 SaaS 的限制），商用前要读清楚。

<sub>考点：低代码平台　｜　出处：Coze Studio 开源仓库（2025-07-26 开源，Apache 2.0）：https://github.com/coze-dev/coze-studio ；Dify 文档 Create and Update Apps from DSL Files：https://docs.dify.ai/en/cli/create-and-update-apps-from-dsl-files ；Dify 许可证（Apache 2.0 附加条件）：https://github.com/langgenius/dify/blob/main/LICENSE</sub>

</details>

---

<a name="AGT-FW-042"></a>

### AGT-FW-042　进阶 · 考频 ★★

下列哪些是自研 Agent 主循环或 Harness（而不是直接使用现成框架）的**合理理由**？

- **A.** 自研能让模型本身更聪明：去掉框架这层抽象之后，同一个模型的推理和规划能力都会明显提升
- **B.** 框架无法调用自定义工具，只能使用框架内置的少数几个工具，因此接入公司的业务工具必须自研 Agent
- **C.** 团队已经有成熟的持久化执行、链路追踪与评测基础设施，框架带来的主要是重复的抽象和升级成本
- **D.** 需要逐字控制上下文布局（稳定前缀以命中 Prompt Caching、精细的压缩与工具输出清理），框架的默认抽象难以做到
- **E.** 需要第一时间用上模型厂商的新能力（如新的工具类型、思考内容在多轮间回传），而框架的适配往往滞后

<details>
<summary>答案与解析</summary>

**答案：CDE**

**解析：**

**结论**：C、D、E 是合理理由，它们都与「控制权」和「重复建设」有关。

- A 错：模型能力不会因为换了框架而变化。效果的差别来自提示词、工具和上下文的处理方式，而这些用框架同样能调好。
- B 错：所有主流框架都支持自定义工具，这不是理由。
- C 对：框架最有价值的部分（持久化、人审、观测）团队已经具备时，剩下的抽象带来的更多是学习与升级成本。
- D 对：上下文的组装方式直接决定效果与成本。框架往往会在提示中插入自己的内容（时间、格式说明），或者只提供固定的记忆策略，限制了精细的上下文工程。
- E 对：厂商的新能力（工具检索、新的内容块类型等）往往需要框架跟进适配，自研可以当天就用上。

反过来，如果团队没有这些基础设施，或者需求就是标准的 ReAct 加人审，直接使用框架通常更划算。自研的代价是长期维护：工具执行、流式解析、断点续跑、追踪、评测都要自己负责。

<sub>考点：框架选型、框架解决的问题</sub>

</details>

---

## 判断题

<a name="AGT-FW-004"></a>

### AGT-FW-004　基础 · 考频 ★★

LangGraph 是 LangChain 的升级版，必须依赖 LangChain 的模型、提示词等组件才能构建状态图。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。LangGraph 是 LangChain 公司推出的另一个库，可以独立使用：图的节点就是普通的 Python 函数，在节点里可以调用 LangChain 的模型、检索器与工具封装，也可以直接调用任何厂商的 SDK，完全不用 LangChain。

两者的定位不同：LangChain 是组件库加线性编排（LCEL 描述有向无环的数据流）；LangGraph 是有状态的编排运行时，提供状态、reducer、条件边、环、检查点和人在回路。依赖关系反而是另一个方向：LangChain 1.0 的 `create_agent` 运行在 LangGraph 的运行时之上。

<sub>考点：LangChain</sub>

</details>

---

<a name="AGT-FW-012"></a>

### AGT-FW-012　基础 · 考频 ★★

LangGraph 的 InMemorySaver 只适合开发和测试；如果把它带上生产，进程一重启，所有挂起中、等待人工审批的线程都会丢失。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。InMemorySaver（旧名 MemorySaver）把检查点放在进程内存里，进程退出就没了，挂起的 interrupt 再也无法恢复。生产环境应使用 PostgreSQL、SQLite 等持久化的 saver，并配备备份与清理策略。

相关的生产要点：
- 检查点保存的是完整状态，状态里如果放了大文件或完整的工具返回，存储会暴涨，还会把敏感数据持久化：大对象存外部，状态里只放引用，密钥不进状态；
- thread_id 是会话隔离的边界，多个用户共用一个 thread_id，状态就会串；
- 长对话的消息全文会让每份检查点越来越大，需要配合压缩。

<sub>考点：检查点与持久化</sub>

</details>

---

<a name="AGT-FW-014"></a>

### AGT-FW-014　基础 · 考频 ★★

LangGraph 的时间旅行相当于「撤销」：从某个旧检查点回放后，该检查点之后已经执行过的退款、发出的邮件都会被自动撤回。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。时间旅行改变的是**图的执行位置**，撤不回外部世界已经发生的事：

- **回放**（replay）：用旧检查点的 config 继续执行，之前的步骤不重跑，之后的节点会**真的再跑一遍**，遇到 interrupt 也会再次暂停；
- **分叉**（fork）：先用 `update_state` 在旧检查点上改出一个新检查点，再从它继续；原来那条线的历史仍然保留，检查点历史因此是一棵树。

带副作用的节点要么幂等，要么在调试环境中换成假实现。典型用途有三个：复现线上问题、what-if 实验（改一个中间结果看下游怎么变）、纠正人工误操作（审批人点错了，从审批前分叉重新决定）。回放时之后的节点会重新调用模型，采样结果可能不同；要完全复现，还得把模型输出录下来回放。

<sub>考点：检查点与持久化</sub>

</details>

---

<a name="AGT-FW-023"></a>

### AGT-FW-023　进阶 · 考频 ★★

在 OpenAI Agents SDK 中，只要入口 Agent 配置了输入护栏，转交之后各个 Agent 从工具返回结果、检索文档中读到的间接提示注入，也会被这道护栏拦截。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。输入护栏只检查**第一个 Agent 收到的用户输入**，不会对工具返回的内容做检查，也不会在转交后对新的 Agent 再跑一遍；输出护栏只检查最终产出结果的 Agent。

所以安全至少要分三层：入口的输入护栏（注入、越界请求、敏感信息）、出口的输出护栏（泄密、格式、合规）、工具层的执行前校验（权限、参数范围、金额阈值）。工具返回的网页、文档内容一律按不可信数据处理，高风险操作不能由工具结果直接触发，不可逆操作还要靠权限设计和人工审批兜底。护栏本身是概率性的，不能把安全全部交给它。

<sub>考点：Handoff与Guardrail</sub>

</details>

---

<a name="AGT-FW-026"></a>

### AGT-FW-026　进阶 · 考频 ★

Google ADK 的 ParallelAgent 中，各子 Agent 共享同一份会话 state；如果它们把结果写到同一个 output_key，后写入的结果会覆盖先写入的，所以应当为每个子 Agent 设置不同的键。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。ParallelAgent 并发执行子 Agent，它们彼此不需要看到对方的中间过程，但写的是同一份 state。用同一个键，结果取决于谁后写完，先完成的结果会被覆盖丢失。正确做法是每个子 Agent 写各自的键（如 `web_notes`、`doc_notes`），再由下游的汇总 Agent 在指令里分别引用。

对比 LangGraph：没有 reducer 的字段在同一超步被多个节点写入时，LangGraph 直接抛出 InvalidUpdateError，而不是让后写的覆盖先写的；需要合并多个结果时，要为字段声明 reducer（如列表追加）。

<sub>考点：Google ADK　｜　出处：Google ADK 文档</sub>

</details>

---

<a name="AGT-FW-034"></a>

### AGT-FW-034　基础 · 考频 ★

ChatDev 按瀑布模型把软件开发拆成设计、编码、测试、文档等阶段，串成「聊天链」（chat chain），每个子任务由一对角色（如 CTO 与程序员）通过多轮对话完成。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。ChatDev 的另一个设计是「交流式去幻觉」（communicative dehallucination）：助手角色在作答前先主动追问细节，减少凭空编造。

ChatDev 与 MetaGPT 共同说明了一点：**流程越固定、产物越结构化，多 Agent 越可控**。SOP 式流水线的代价是流程僵硬，遇到 SOP 没覆盖的情况就会卡住；上游的错误还会顺流而下，所以每个交接处都要设关口校验，越早拦截越便宜。

<sub>考点：MetaGPT与ChatDev　｜　出处：ChatDev 论文 arXiv:2307.07924</sub>

</details>

---

## 填空题

<a name="AGT-FW-013"></a>

### AGT-FW-013　进阶 · 考频 ★

较新版本的 LangGraph 用 `durability` 参数控制检查点写入存储的时机：取值 ____ 时，每一步的检查点写完才进入下一步，最稳但最慢；取值 ____ 时，在执行下一步的同时异步写入，进程恰好在此时崩溃可能丢掉最后一步；取值 ____ 时，只在图运行退出时写入，最快，但中途被杀则无从恢复。

<details>
<summary>答案与解析</summary>

**答案：** (1) sync；(2) async；(3) exit

**解析：**

三种模式是可靠性与性能的权衡：

- **sync**：写盘完成才继续，适合涉及资金等高价值副作用的流程；
- **async**：写盘与下一步的执行重叠，性能更好，极端情况下丢失最后一步的检查点，恢复时那一步会重跑；
- **exit**：只在退出时写，适合不需要中途恢复的短流程。

无论哪种模式，检查点机制都只能保证「至少执行一次」：节点执行完、检查点还没写下就崩溃，恢复后该节点会再执行一次。有副作用的节点要带幂等键（如线程 ID 加步号），由下游服务去重。参数名与默认值以所用版本的官方文档为准。

<sub>考点：检查点与持久化　｜　出处：LangGraph 文档</sub>

</details>

---

<a name="AGT-FW-025"></a>

### AGT-FW-025　进阶 · 考频 ★

Google ADK 中，LlmAgent 通过 ____ 参数把自己的最终回复写进会话 state 的某个键，下游 Agent 在指令中用 `{键名}` 引用；state 的键名带 ____ 前缀时，表示该数据跨会话保存、属于同一用户；LoopAgent 在达到 max_iterations，或者某个子 Agent 发出 ____ 信号时停止循环。

<details>
<summary>答案与解析</summary>

**答案：** (1) output_key；(2) user:；(3) escalate / escalation

**解析：**

- **output_key**：ADK 中 Agent 之间传递数据的主要方式，结果写进会话 state，下游通过模板引用；
- **state 前缀**：无前缀属于当前会话；`user:` 跨会话、属于同一用户；`app:` 全应用共享；`temp:` 只在本次调用内有效。会话由 SessionService 管理，长期记忆由 MemoryService 管理；
- **escalate**：子 Agent 通过事件动作发出升级信号，例如审阅 Agent 判断稿件已经合格，就让循环提前结束。

运行中的每个动作都以事件（Event）的形式流出，状态变更也记录在事件里；ADK 还在调用模型、调用工具、运行 Agent 的前后提供回调，常用来做护栏、缓存和日志。

<sub>考点：Google ADK　｜　出处：Google ADK 文档</sub>

</details>

---

## 计算题

<a name="AGT-FW-029"></a>

### AGT-FW-029　进阶 · 考频 ★★

一个 4 个 Agent 的群聊采用「由模型选择发言者」的方式：每一轮先调用一次模型选出下一位发言者，再由被选中的 Agent 调用一次模型发言。每次模型调用的输入 = 固定开销 1,000 token（系统提示词、角色说明等）+ 当前全部群聊历史；每条发言 200 token；初始历史为空，选人调用本身不产生历史消息。

1. 进行 20 轮（产生 20 条发言），累计输入多少 token？
2. 若改为轮询（round-robin）选人，不再需要选人调用，同样 20 轮的累计输入是多少？
3. 若加入无进展检测，在第 6 轮之后终止（共 6 条发言），仍由模型选人，累计输入是多少？

<details>
<summary>答案与解析</summary>

**答案：(1) 116,000 token；(2) 58,000 token；(3) 18,000 token**

**解析：**

第 $i$ 轮开始时历史中已有 $i-1$ 条发言，每次调用的输入为 $1{,}000+200(i-1)$。

1. 模型选人，每轮 2 次调用：
   $$\sum_{i=1}^{20}2\,[1{,}000+200(i-1)]=2\times(20{,}000+200\times190)=2\times58{,}000=116{,}000$$
2. 轮询，每轮 1 次调用：$58{,}000$。
3. 6 轮、每轮 2 次：$2\times(6{,}000+200\times15)=2\times9{,}000=18{,}000$。

**结论**：
- 让模型选人，调用次数和输入 token 都翻倍，而且每次都带全量历史；能用规则或「允许的发言转移图」确定下一位时，就别让模型选；
- 历史项随轮数平方增长，轮数越多越贵；及时终止（无进展检测、轮数上限）的省钱效果最明显，20 轮降到 6 轮，累计输入从 116K 降到 18K；
- 这也是对话式多 Agent 与图编排的成本差异：图编排只在需要的节点调用模型，并且只把需要的字段渲染进提示词。

<sub>考点：AutoGen、框架选型</sub>

</details>

---

## 代码输出题

<a name="AGT-FW-007"></a>

### AGT-FW-007　进阶 · 考频 ★★

下面用纯 Python 模拟 LangGraph 的 reducer 合并：`log` 字段的 reducer 是列表追加，`step` 没有 reducer（直接覆盖）。节点 `bad` 犯了一个常见错误。程序的输出是什么？

```python
import operator

REDUCERS = {"log": operator.add, "step": None}

def merge(state, update):
    for key, value in update.items():
        reducer = REDUCERS[key]
        state[key] = reducer(state[key], value) if reducer else value
    return state

def good(s):
    return {"log": ["good"], "step": s["step"] + 1}

def bad(s):
    return {**s, "log": s["log"] + ["bad"], "step": s["step"] + 1}

s = {"log": ["start"], "step": 0}
for node in (good, bad, good):
    s = merge(s, node(s))
print(s["log"])
print(s["step"], len(s["log"]))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
['start', 'good', 'start', 'good', 'bad', 'good']
3 6
```

**解析：**

逐步追踪：

1. `good`：返回增量 `{"log": ["good"], "step": 1}`，log 变为 `['start', 'good']`；
2. `bad`：返回的是**整份状态**，其中 log 已经包含全部历史 `['start', 'good', 'bad']`。追加型 reducer 把它整个接到旧值后面，得到 `['start', 'good', 'start', 'good', 'bad']`，旧记录被重复了一遍；step 没有 reducer，直接覆盖为 2；
3. `good`：再追加 `'good'`，step 变为 3。

最终 log 有 6 个元素。**节点只应返回自己改动的字段的增量**，例如 `bad` 应写成 `return {"log": ["bad"], "step": s["step"] + 1}`。真实 LangGraph 中，用 `operator.add` 的字段同样会出现这种重复；如果字段用的是按消息 ID 合并的 `add_messages`，重复返回的旧消息会按 ID 原地替换而不会翻倍，但仍是多余的写入。

<sub>考点：LangGraph状态图</sub>

</details>

---

<a name="AGT-FW-028"></a>

### AGT-FW-028　进阶 · 考频 ★★

下面模拟 AutoGen 0.4 风格的可组合终止条件：`a | b` 表示任一满足即停，`a & b` 表示同时满足才停。对同一段群聊消息，分别用三种终止条件检查「在第几条消息之后停止」。程序的输出是什么？

```python
class Cond:
    def __or__(self, other): return Combo(any, self, other)
    def __and__(self, other): return Combo(all, self, other)

class Combo(Cond):
    def __init__(self, mode, *conds): self.mode, self.conds = mode, conds
    def check(self, msgs): return self.mode(c.check(msgs) for c in self.conds)

class MaxMsg(Cond):
    def __init__(self, n): self.n = n
    def check(self, msgs): return len(msgs) >= self.n

class Mention(Cond):
    def __init__(self, word): self.word = word
    def check(self, msgs): return self.word in msgs[-1]

msgs = ["计划：写 add 函数", "代码 v1", "测试失败", "代码 v2，可以 TERMINATE 了吗？", "测试通过", "APPROVE"]
conds = [MaxMsg(10) | Mention("APPROVE"),
         Mention("TERMINATE") | MaxMsg(5),
         MaxMsg(3) & Mention("通过")]
for cond in conds:
    print(next((i for i in range(1, len(msgs) + 1) if cond.check(msgs[:i])), None))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
6
4
5
```

**解析：**

逐个条件分析（`msgs[:i]` 表示前 $i$ 条消息，检查的是最后一条）：

1. `MaxMsg(10) | Mention("APPROVE")`：前 5 条既不满 10 条、最后一条也不含 APPROVE；第 6 条是 APPROVE，停止 → **6**。
2. `Mention("TERMINATE") | MaxMsg(5)`：第 4 条「代码 v2，可以 TERMINATE 了吗？」只是在讨论中顺口提到了终止词，却触发了终止 → **4**。这正是关键词终止的典型坑：过早结束，测试还没跑完。
3. `MaxMsg(3) & Mention("通过")`：第 3 条满足条数但内容是「测试失败」；第 4 条不含「通过」；第 5 条「测试通过」两者同时满足 → **5**。

工程建议：终止关键词要求单独成行，或者只认指定验收 Agent 发出的关键词；用 `|` 组合消息数上限、超时、预算等兜底条件；再加上无进展检测，防止 Agent 之间互相客套、兜圈子。

<sub>考点：AutoGen</sub>

</details>

---

## 代码填空题

<a name="AGT-FW-008"></a>

### AGT-FW-008　进阶 · 考频 ★★

LangGraph 中消息列表常用的 reducer `add_messages` 按消息 ID 合并：ID 已存在的消息被**原地替换**（可以用来修改历史消息），新 ID 的消息追加到末尾。补全下面的简化实现，要求不修改入参。

```python
def add_messages(left, right):
    merged = list(left)
    index = {m["id"]: i for i, m in enumerate(merged)}
    for m in right:
        if m["id"] in index:
            merged[____] = m
        else:
            index[m["id"]] = len(merged)
            merged.____(m)
    return merged
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `index[m["id"]]`；(2) `append`

**解析：**

1. 第一个空：ID 已存在时，用记录下的位置 `index[m["id"]]` 原地替换，消息的顺序保持不变；
2. 第二个空：新 ID 先登记位置 `len(merged)`，再 `append` 到末尾。登记位置这一步保证了 `right` 中出现重复 ID 时，后一条会替换前一条。

**为什么消息要按 ID 合并而不是简单追加**：节点可以通过返回同 ID 的消息来修改历史（例如人工审批时改掉一条工具调用的参数），也避免了重复返回导致的消息翻倍。真实的 `add_messages` 还会给没有 ID 的消息自动分配 ID、统一消息格式，并支持用特殊的删除标记（RemoveMessage）删除指定消息。

reducer 的通用要求：是确定性的二元函数「旧值 × 增量 → 新值」，不依赖执行先后，这样同一超步内的并行写入才能可复现地合并。

<sub>考点：LangGraph状态图</sub>

</details>

---

## 代码改错题

<a name="AGT-FW-018"></a>

### AGT-FW-018　挑战 · 考频 ★★

下面用纯 Python 模拟 LangGraph 的 interrupt 语义：节点调用 `interrupt()` 时若还没有恢复值，就暂停（抛出异常、交出 payload）；恢复时**节点从头重新执行**，`interrupt()` 返回恢复值。退款节点 `refund_node` 存在严重缺陷，请指出并修正（只需修改 `refund_node`）。

```python
class Interrupt(Exception):
    pass

class Runtime:
    def __init__(self):
        self.resume = None

    def interrupt(self, payload):
        if self.resume is None:
            raise Interrupt(payload)
        value, self.resume = self.resume, None
        return value

def run_node(rt, node, state, resume=None):
    rt.resume = resume
    try:
        return "done", node(rt, state)
    except Interrupt as e:
        return "paused", e.args[0]

PAID = []                                       # 模拟支付接口：记录实际打出的款项

def refund_node(rt, state):
    PAID.append(state["amount"])                # 调用支付接口打款
    ok = rt.interrupt({"question": "确认退款？", "amount": state["amount"]})
    return {"status": "refunded" if ok == "approve" else "rejected"}
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：打款（第 24 行的 `PAID.append`）写在 `interrupt()` 之前，造成两个后果：

1. 第一次执行时还没审批就已经打款，驳回也来不及了；
2. 恢复时节点从头重跑，打款代码再执行一次，批准后一共打了两次款。

**修正**：先等审批结果，批准后才执行副作用：

```python
def refund_node(rt, state):
    ok = rt.interrupt({"question": "确认退款？", "amount": state["amount"]})
    if ok != "approve":
        return {"status": "rejected"}
    PAID.append(state["amount"])                # 审批通过后才打款
    return {"status": "refunded"}
```

**修正后的代码：**

```python
class Interrupt(Exception):
    pass

class Runtime:
    def __init__(self):
        self.resume = None

    def interrupt(self, payload):
        if self.resume is None:
            raise Interrupt(payload)
        value, self.resume = self.resume, None
        return value

def run_node(rt, node, state, resume=None):
    rt.resume = resume
    try:
        return "done", node(rt, state)
    except Interrupt as e:
        return "paused", e.args[0]

PAID = []                                       # 模拟支付接口：记录实际打出的款项

def refund_node(rt, state):
    ok = rt.interrupt({"question": "确认退款？", "amount": state["amount"]})
    if ok != "approve":
        return {"status": "rejected"}
    PAID.append(state["amount"])                # 审批通过后才打款
    return {"status": "refunded"}
```

**解析：**

LangGraph 的 `interrupt()` 不是「把执行冻结在这一行」，而是保存检查点后结束本次调用；恢复时重新执行整个节点，`interrupt()` 这次直接返回恢复值。所以 interrupt 之前的代码会执行两次。

**工程上的完整做法**：
- 副作用放在 interrupt 之后，或拆到下游的独立节点（如 approve 节点只负责审批，pay 节点负责打款）；
- 打款请求带幂等键（如线程 ID 加业务单号），由支付服务去重。即使副作用位置正确，节点执行完、检查点还没写下就崩溃时，恢复后仍会重跑，只有幂等才能兜底；
- interrupt 之前只放可以安全重复的读操作（如查询订单金额）。

<sub>考点：中断与人在回路、检查点与持久化</sub>

</details>

---

## 编程题

<a name="AGT-FW-009"></a>

### AGT-FW-009　进阶 · 考频 ★★

用纯 Python 实现 LangGraph「超步结束时统一合并增量」的语义：

```python
class InvalidUpdateError(Exception): ...

def apply_superstep(state: dict, updates: list[dict], reducers: dict) -> dict: ...
```

- `state` 已包含 `reducers` 中声明的全部字段；
- `updates` 是同一超步内各节点返回的增量，按任务顺序排列（与谁先执行完无关）；
- `reducers` 把字段名映射到二元函数（如 `operator.add`、`max`）或 `None`（表示直接覆盖）；
- 有 reducer 的字段，按 `updates` 的顺序依次用 reducer 并入；
- 没有 reducer 的字段：本超步只被写入一次时直接覆盖；被写入两次及以上时，抛出 `InvalidUpdateError`；
- 增量中出现 `reducers` 没有声明的字段，抛出 `KeyError`；
- 返回新的状态 dict，不修改入参 `state`；抛出异常时 `state` 也必须保持原样。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
class InvalidUpdateError(Exception):
    pass

def apply_superstep(state, updates, reducers):
    writes = {}
    for upd in updates:
        for key, value in upd.items():
            if key not in reducers:
                raise KeyError(key)
            writes.setdefault(key, []).append(value)
    new = dict(state)
    for key, values in writes.items():
        reducer = reducers[key]
        if reducer is None:
            if len(values) > 1:
                raise InvalidUpdateError(f"At key {key!r}: can receive only one value per step")
            new[key] = values[0]
        else:
            acc = new[key]
            for v in values:
                acc = reducer(acc, v)
            new[key] = acc
    return new
```

**测试用例：**

```python
import operator

R = {"log": operator.add, "amount": None, "best": max}
s0 = {"log": ["start"], "amount": 0, "best": 3}
s1 = apply_superstep(s0, [{"log": ["A"]}, {"log": ["B"], "amount": 80}, {"best": 7}, {"best": 5}], R)
assert s1 == {"log": ["start", "A", "B"], "amount": 80, "best": 7}
assert s0 == {"log": ["start"], "amount": 0, "best": 3}           # 不修改入参
assert apply_superstep(s0, [], R) == s0
assert apply_superstep(s0, [{"log": ["B"]}, {"log": ["A"]}], R)["log"] == ["start", "B", "A"]
try:
    apply_superstep(s0, [{"amount": 1, "log": ["A"]}, {"amount": 2}], R)
    raise AssertionError("应当抛出 InvalidUpdateError")
except InvalidUpdateError:
    pass
assert s0 == {"log": ["start"], "amount": 0, "best": 3}           # 出错时状态不变
try:
    apply_superstep(s0, [{"unknown": 1}], R)
    raise AssertionError("应当抛出 KeyError")
except KeyError:
    pass
```

**解析：**

**思路**：先收集、后合并。第一遍按任务顺序把所有写入按字段归组，并检查字段是否声明；第二遍在状态的浅拷贝上逐字段合并：无 reducer 的字段检查写入次数，有 reducer 的字段依次折叠。所有校验都在写入新字典之前或过程中完成，入参 `state` 从头到尾没被改动，异常时自然保持原样。

**与 LangGraph 的对应**：LangGraph 借鉴 Pregel 的「整体同步并行」模型，同一超步的节点看到同一份状态快照，彼此看不到本步的写入，超步结束时统一按 reducer 合并，然后写检查点。这样合并结果与执行先后无关，可以重放；代价是快的分支要等慢的分支。无 reducer 字段的多次写入直接报错而不是「后写覆盖先写」，是为了避免难以察觉的数据丢失。

**复杂度**：$O(W)$，$W$ 为本超步的写入总数（不计 reducer 自身的开销）。

**易错点**：边执行边合并（会依赖完成顺序）；直接修改入参；忘记处理未声明的字段。

<sub>考点：LangGraph状态图</sub>

</details>

---

## 简答题

<a name="AGT-FW-002"></a>

### AGT-FW-002　进阶 · 考频 ★★★

Anthropic 在《Building effective agents》中建议「先直接使用模型 API」。请说明：什么情况下不该引入 Agent 框架？什么情况下自己写的成本会很快超过学框架的成本？两者之间有哪些折中做法？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **不该引入框架的情况**：
   - 流程简单：一两次模型调用、没有环、不需要暂停恢复，直接写代码更清楚、更好测；
   - 需要极致控制：时延、token、提示词的每个字都要抠，框架的默认提示词和隐藏调用会碍事；
   - 团队与生命周期：框架 API 变化快，没人愿意跟进版本时，引入后反而成为负担。
2. **自己写的成本会迅速超过框架的情况**：需要长时间运行、断点续跑、人工审批、并行分支、多人协作调试时。分水岭是「要不要跨进程地暂停与恢复」：例如「生成退款方案 → 超过 100 元等人审批（可能等一天）→ 执行 → 失败重试」，手写要自己做状态序列化、存储、恢复入口、审批回调和幂等，轻松几百行；用状态图框架，interrupt 加 checkpointer 就有了骨架。
3. **框架税**：抽象泄漏（出了问题要翻框架源码）、版本变化快、默认行为不透明。所以用框架就一定要弄懂底层，对「框架底下发生了什么」的错误假设是常见的出错来源。
4. **折中做法**：
   - 只用框架的一部分，例如只用 LangGraph 的 checkpointer 与 interrupt；
   - 自己写一层薄封装，统一模型调用、工具执行和追踪；
   - 自己写时最先补：统一的工具执行与报错、步数与预算上限、结构化日志与 trace；需要人审时再补状态持久化与恢复入口。
5. **判断标准**：看复杂度与生命周期，而不是个人好恶；框架不会让模型变聪明，效果问题多出在提示词、工具和上下文上。

**评分要点（共 10 分）：**

- 说出不用框架的典型情况（简单流程、极致控制、版本负担）（3 分）
- 说出框架价值凸显的情况，并点出「跨进程暂停与恢复」这个分水岭（3 分）
- 提到框架税与「必须懂底层」（2 分）
- 给出折中做法或自研时优先补齐的能力（2 分）

**讲解：**

**常见失分点**：把「不用框架」说成「框架没用」，或者反过来「什么都上框架」；讲不出判断的分水岭；以为换个框架就能提升效果。好的回答会用一个具体例子说明「什么时候值得」。

<sub>考点：框架解决的问题、框架选型　｜　出处：Anthropic《Building effective agents》（2024 年 12 月）</sub>

</details>

---

<a name="AGT-FW-005"></a>

### AGT-FW-005　进阶 · 考频 ★★★

LangGraph 与 LangChain 旧版 AgentExecutor 有什么本质区别？为什么要把 Agent 建模成「状态图」？它和 Airflow 这类 DAG 工作流又有什么不同？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **本质区别：控制流归谁**。AgentExecutor 是框架写死的 ReAct 循环，开发者只能往里填工具和提示词；LangGraph 把控制流交还开发者，用显式的状态、节点和边描述流程。
2. **LangGraph 的核心抽象**：
   - State：全图共享、带类型的状态，消息只是其中一个字段，还可以放计划、草稿、预算、审批结论；
   - reducer：按字段定义「增量怎么并进旧值」，如追加列表、按 ID 合并消息；
   - 节点：普通函数，读状态、返回**增量**；
   - 边：普通边固定去向，条件边由路由函数根据状态决定去向，允许环。
3. **运行时能力**：每个超步保存检查点，带来断点续跑、`interrupt()` 人审、时间旅行（回放与分叉）；流式输出可细到节点增量和 token。
4. **为什么建模成状态图**：Agent 的执行天然是「状态 + 转移」：每步读状态、做决定、写状态，下一步去哪取决于结果。状态图把这些显式化，路径可枚举、可测试、可存档；同一张图里既可以有固定的工作流节点，也可以有「模型 ⇄ 工具」的自主循环，自主程度可调。
5. **与 DAG 工作流的不同**：
   - DAG 不允许环，而重试、反思、「生成 → 检查 → 不合格再生成」都是环；用 DAG 只能把 while 藏进节点内部，外面就看不到中间过程了；
   - DAG 的依赖在定义时确定，Agent 的分支由运行时状态（往往是模型的判断）决定。
6. **注意**：状态图不等于「画流程图」，关键在状态、reducer 和检查点；LangGraph 可以完全不依赖 LangChain。

**评分要点（共 10 分）：**

- 点明「控制流从框架写死回到开发者显式定义」（2 分）
- 正确说明 State、reducer、节点返回增量、条件边等抽象（3 分）
- 说明检查点带来的恢复、人审、时间旅行能力（2 分）
- 说清与 DAG 的区别：允许环、运行时决定分支（3 分）

**讲解：**

**常见失分点**：说「LangGraph 是 LangChain 的升级版」；只说「LangGraph 更灵活」而讲不出灵活在哪里；不知道节点返回的是增量；把状态图等同于可视化。

<sub>考点：LangChain、LangGraph状态图</sub>

</details>

---

<a name="AGT-FW-015"></a>

### AGT-FW-015　挑战 · 考频 ★★

断点续跑有两种主流实现思路：LangGraph checkpointer 的「快照式」，以及 Temporal 一类持久化执行引擎的「重放式」。请比较二者存什么、怎么恢复、对代码有什么要求、改代码时有什么风险、各自适合什么场景；并说明它们能否保证副作用「恰好执行一次」。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **存什么**：
   - 快照式：每个超步结束时保存完整状态与「下一步要执行的节点」；
   - 重放式：保存每个活动（activity）执行结果组成的事件历史。
2. **怎么恢复**：
   - 快照式：读最新快照，从 `next` 指向的节点继续；
   - 重放式：从头重新执行工作流代码，执行到已记录的活动时直接返回历史结果，不再真正执行，直到追上中断点。
3. **对代码的要求**：
   - 快照式：节点是最小的重跑单位，要能整体重跑（幂等），状态要能序列化；
   - 重放式：工作流代码必须是确定性的，随机数、当前时间、网络请求和模型调用都要放进活动（或使用框架提供的确定性版本），否则重放时会走上另一条路。
4. **改代码的风险**：
   - 快照式：节点改名、状态结构变化后，旧检查点可能读不回来，需要兼容或迁移正在运行的线程；
   - 重放式：新代码与旧历史对不上会报非确定性错误，需要用版本闸门（如 patched）让老执行走老逻辑、新执行走新逻辑。
5. **适合场景**：快照式适合 Agent 内部的多步推理与人审；重放式适合跨系统、跨天、涉及资金等强一致的业务流程。两者可以组合：用 Temporal 做外层编排，把 Agent 作为其中的一个活动运行。LangGraph 的函数式 API（`@entrypoint`、`@task`）也采用类似重放的语义：恢复时入口函数从头执行，已完成的 task 直接返回保存的结果。
6. **能否恰好一次**：都不能。活动或节点执行完、结果还没记下就崩溃，恢复后会再执行一次，只能保证「至少一次」。有副作用的步骤要带幂等键（如线程 ID 加步号、业务单号），由下游服务去重。

**评分要点（共 10 分）：**

- 说清两者分别存什么、如何恢复（3 分）
- 说清对代码的要求：节点幂等 vs 工作流确定性（2 分）
- 说清改代码的风险与版本闸门（2 分）
- 给出各自适合的场景及组合方式（2 分）
- 指出只能保证至少一次、需幂等键（1 分）

**讲解：**

**常见失分点**：以为持久化执行能「恰好一次」；不知道重放式要求工作流代码确定性，在工作流里直接调 LLM、取当前时间或生成随机数；忽略改代码对正在运行的线程的影响。

<sub>考点：检查点与持久化</sub>

</details>

---

<a name="AGT-FW-019"></a>

### AGT-FW-019　进阶 · 考频 ★★★

用 LangGraph 实现「退款金额超过 100 元需要人工审批」：请说明 `interrupt()` 的工作机制和恢复方式，设计审批流程时最容易踩的坑，以及在生产中如何运营这些挂起的审批（超时、积压等）。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **工作机制**：在审批节点中调用 `interrupt(payload)`。框架保存检查点，把 payload 放在返回值的 `__interrupt__` 字段里交给调用方，然后结束本次调用；业务系统据此推送审批卡片。审批人做出决定后，调用方用 `Command(resume=决定)` 加同一个 thread_id 再调用一次，`interrupt()` 返回这个决定，节点继续执行。
2. **容易踩的坑**：
   - 恢复时节点从头重跑，interrupt 之前的代码会再执行一遍：副作用放在 interrupt 之后或下游节点，之前的代码必须幂等；
   - 恢复要传 `Command(resume=...)`，不要再传原始输入，否则会从入口开始新一轮；
   - 一个节点内有多个 interrupt 时按调用顺序匹配恢复值，不要在分支里动态增减；
   - 必须配置持久化的 checkpointer，内存版一重启审批就丢；
   - 不要用 `input()` 之类的阻塞方式等人，生产中进程不能为了等人一直挂着。
3. **payload 设计**：给出可判断的信息：将要执行的动作、参数（金额、订单号）、影响范围、理由与证据，而不是一句「是否继续」。支持批准、驳回、编辑后批准（随 resume 传回修改后的参数，或用 `update_state` 改状态）。
4. **运营**：
   - 按风险分级：只读操作自动放行，小额自动处理，不可逆操作（打款、删除、对外发送）必须人审；审批太多人会麻木地一路点同意；
   - 审批单设有效期，过期自动驳回或升级给上级；
   - 挂起的线程要能列出来、能批量处理，监控积压数量与等待时长；
   - 审批记录写审计日志；打款带幂等键；审批人点错时可以用时间旅行从审批前分叉重新决定。

**评分要点（共 10 分）：**

- 正确描述 interrupt 的暂停与 Command(resume) 恢复机制（3 分）
- 指出节点重跑导致副作用重复等至少三个坑（3 分）
- 说明审批 payload 应包含的信息与交互类型（2 分）
- 给出风险分级、超时升级、积压监控等运营措施（2 分）

**讲解：**

**常见失分点**：以为 interrupt 会把执行「冻结在那一行」；恢复时再传原始输入；用 `input()` 阻塞等人；没有考虑审批超时和积压；所有操作都要人审，导致审批疲劳。

<sub>考点：中断与人在回路</sub>

</details>

---

<a name="AGT-FW-038"></a>

### AGT-FW-038　挑战 · 考频 ★★★

面试官问：「AutoGen、CrewAI、LangGraph 你会怎么选？」请从抽象层次、控制流的确定性、持久化与人审能力、可观测与调试、学习成本、维护状态等维度比较三者，分别给出最适合的场景，并说明能否混用。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **LangGraph**：
   - 抽象层次最低（状态、节点、边），控制力最强，代码也最啰嗦，学习曲线陡；
   - 控制流显式、路径可枚举，便于测试和审计；
   - 每个超步存检查点，`interrupt()` 人审、时间旅行是强项；可观测可接 LangSmith 或 OpenTelemetry；
   - 适合长流程、需要人审和恢复的生产 Agent 与多 Agent 系统。
2. **CrewAI**：
   - 抽象层次最高（角色、任务、流程），概念贴近业务语言，上手最快；
   - Crews 负责自主协作，需要确定性时用 Flows 补足；角色设定带来额外 token；
   - 适合「调研 → 写作 → 审校」这类角色清晰、像流水线的内容生产。
3. **AutoGen**：
   - 以对话为中心，控制流从对话中涌现，可预测性较低，必须配好终止条件；
   - 0.4 版改为事件驱动的 actor 模型，适合分布式部署；
   - 维护状态：2025 年 10 月起以维护为主，新项目应评估 Microsoft Agent Framework（2026 年 4 月发布 1.0）；社区分支 AG2 延续 0.2 的风格；
   - 适合研究探索、开放式讨论。
4. **其他候选**：按意图分流、工具型助手可以考虑 OpenAI Agents SDK；在 Google 云上做确定性编排可以考虑 ADK；业务同学自己搭标准流程用扣子、Dify；只有一两次调用、没有环时直接写代码。
5. **能否混用**：能，比如把一个 Crew 包成 LangGraph 的一个节点。但两个运行时叠在一起，追踪和调试会割裂，状态与恢复语义也不统一，没有明确收益就别叠。
6. **决策依据**：控制流要多确定、要不要持久化和人审、对可观测的要求、团队的技术栈与学习成本、所在云厂商与生态、框架的维护状态；而不是 GitHub 星数或「哪个火」。

**评分要点（共 10 分）：**

- 准确刻画 LangGraph 的抽象层次、确定性与持久化人审能力（2 分）
- 准确刻画 CrewAI 的抽象与 Crews / Flows 分工（2 分）
- 准确刻画 AutoGen 的对话式控制流、终止条件与维护状态（2 分）
- 为三者给出合理的适用场景（2 分）
- 讨论混用的利弊并给出决策依据（2 分）

**讲解：**

**常见失分点**：只按热度或星数选；把三者说成「功能差不多」；不知道 AutoGen 0.2 与 0.4 的差异和维护状态；忽略「什么都不用、直接写代码」也是一个选项。

<sub>考点：框架选型　｜　出处：Microsoft Agent Framework（AutoGen 与 Semantic Kernel 的后继，2026-04 发布 1.0）：https://github.com/microsoft/agent-framework ；CrewAI 文档 Flows：https://docs.crewai.com/en/concepts/flows ；LangGraph 文档 Persistence：https://docs.langchain.com/oss/python/langgraph/persistence</sub>

</details>

---

## 场景分析题

<a name="AGT-FW-030"></a>

### AGT-FW-030　挑战 · 考频 ★★★

团队用 AutoGen 式群聊做「需求评审」：产品、架构、测试三个 Agent，加一个由模型选人的主持人，终止条件只有「消息中出现 APPROVE」。上线后发现：

- 有的会话聊到 80 多轮还不结束，单次成本飙升；
- 有的会话第 3 轮就结束了，评审结论明显不完整；
- 日志里经常看到两个 Agent 反复互相请对方确认。

请分析原因，并给出改进方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**原因分析**
1. **终止只靠关键词**：模型可能永远不说 APPROVE（无限循环），也可能在讨论中顺口提到（如「等大家都同意再 APPROVE」）导致过早结束；
2. **没有兜底上限**：没有轮数、时长、token 或费用上限，失控的会话只能一直跑；
3. **没有无进展检测**：客套循环（互相请对方确认）、踢皮球、审阅者永远不满意，这类原地打转不会被发现；
4. **选人缺少约束**：模型选人可能让同一对 Agent 来回对话，或者让同一个人连续发言；
5. **没有拍板机制**：没有人负责在某个时点给出结论；
6. **成本放大**：每轮选人加发言两次调用，且都带全量历史，轮数越多越贵。

**改进方案**
1. **可组合的终止条件**：消息数上限 | 超时 | token 或费用预算 | 关键词。关键词只认指定验收角色发出的、且单独成行的终止词；
2. **框架层强制总上限**：无论用户怎么配置，运行器都再「或」上一个硬上限；
3. **无进展检测**：最近若干条消息高度重复、状态与动作的哈希重复、评审清单的完成项没有增加时判定为兜圈子，提前结束；
4. **约束发言顺序**：禁止同一人连续发言，用允许的转移图限定谁能接谁的话；能用规则决定下一位就不让模型选；
5. **结构化与拍板**：把评审内容改为结构化清单（每一项的结论、负责人、风险），主持人在 N 轮后必须给出结论；清单全部关闭时结束；
6. **升级给人**：触发上限或无进展时保存状态并转人工；
7. **控成本**：历史过长时摘要早期讨论，只把必要内容放进上下文；
8. **可观测与回归**：监控轮数分布、终止原因分布、单会话成本；用录制的会话回放测试终止逻辑；
9. **重新评估形态**：需求评审的流程相对固定，可以改为「产品 → 架构 → 测试 → 汇总」的 SOP 流水线或图编排，每一步产出结构化文档并过关口校验，只在确实需要开放讨论时用群聊。

**评分要点（共 10 分）：**

- 指出关键词终止的两类问题（永不结束、过早结束）（2 分）
- 指出缺少上限、无进展检测、选人约束、拍板机制等原因（2 分）
- 给出可组合终止条件与框架层硬上限（2 分）
- 给出无进展检测、发言约束、结构化清单与拍板机制（3 分）
- 提到升级给人、成本控制、可观测或改用 SOP / 图编排（1 分）

**讲解：**

**常见失分点**：只答「设一个 max_round」——上限只能止损，不能让对话产出结果；不知道关键词会被顺口提到；没有意识到固定流程的评审本来就不适合开放式群聊。

<sub>考点：AutoGen、框架选型</sub>

</details>

---

<a name="AGT-FW-039"></a>

### AGT-FW-039　挑战 · 考频 ★★

一个初创团队用 LangChain 旧版 AgentExecutor 做了客服 Agent 的 Demo，现在准备上线，并提出新需求：

1. 超过 500 元的赔付需要人工审批，审批可能隔夜；
2. 服务每天滚动发布，进程会重启；
3. 出现错误赔付时，要能查清当时每一步发生了什么；
4. 另有一个 FAQ 场景，只需要「检索 → 生成」两步。

请给出框架与架构的改造方案，并列出上线前必须补齐的生产要素。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 按场景分别选型**
- FAQ：两步、无环、不需要暂停，直接调模型 API 或用一条简单的链即可，不必引入 Agent 循环；
- 赔付：迁移到 LangGraph（或运行在 LangGraph 运行时上的 LangChain 1.0 `create_agent`，用中间件插入人审）。图结构示例：分类 → 查订单 → 条件边（≤ 500 元直接赔付；> 500 元进入审批节点）→ 赔付 → 回复。

**2. 人审与恢复**
- 审批节点用 `interrupt()`，payload 带金额、理由、证据；业务系统推送审批卡片，审批后用 `Command(resume=...)` 恢复；
- 使用 Postgres 等持久化 checkpointer，每张工单一个 thread_id；滚动发布重启后，挂起的线程照常恢复；
- 副作用放在 interrupt 之后或独立节点；赔付请求带幂等键（如工单号加步号），对资金类步骤选择最稳的写盘模式；
- 审批单设有效期，超时自动驳回或升级；审批人点错可从审批前分叉重新决定。

**3. 可追溯**
- 一次运行记成一棵 trace 树：节点、模型调用（含提示词与模型版本）、工具调用、路由决策都是 span，记录输入输出（脱敏）、token、成本、耗时、错误；
- trace 带上 thread_id 与 checkpoint_id，出问题时直接拿那一步的状态回放；关键操作写审计日志。

**4. 上线前必须补齐的生产要素**
- 上限：步数（recursion_limit）、token、费用、时长；工具与节点的超时与重试策略；
- 测试：用 FakeLLM 做节点与路由的单测，覆盖人审暂停与恢复路径的集成测试，轨迹回放，评测集回归；
- 版本：图结构、状态 schema、提示词、模型都要版本化；改图前想清楚正在运行（含挂起审批）的线程如何兼容或迁移；
- 安全：工具最小权限；密钥不进提示词和检查点；外部内容进入状态前做注入检测；护栏只是补充；
- 发布与监控：灰度、可回滚；监控成功率、人工接管率、审批积压与等待时长、成本分布、步数上限触发次数。

**评分要点（共 10 分）：**

- 按场景区分：FAQ 不上框架，赔付迁移到状态图（2 分）
- 人审与恢复设计正确：interrupt、持久化 checkpointer、副作用位置与幂等（3 分）
- 可追溯设计：trace 树与检查点关联、审计（2 分）
- 列出上限、测试、版本、安全、发布监控等生产要素（3 分）

**讲解：**

**常见失分点**：所有场景一刀切地上同一个框架；只把 AgentExecutor 换成 LangGraph，却没有持久化 saver 和幂等；忽略滚动发布对挂起线程的影响；只记录模型调用、不记录工具与路由。

<sub>考点：框架选型、框架解决的问题</sub>

</details>

---

<a name="AGT-FW-041"></a>

### AGT-FW-041　挑战 · 考频 ★★★

某团队用 LangChain 的 Agent 抽象做了一个数据分析 Agent，上线三个月后遇到这些问题：

1. Prompt Caching 命中率不到 10%：框架在系统提示中插入了当前时间，工具定义的顺序也会随注册顺序变化；
2. 想实现「清理旧工具输出 + 结构化压缩」的上下文策略，但框架的记忆抽象只提供固定格式的对话摘要；
3. 模型厂商推出的新能力（如工具检索、思考内容在多轮间回传）要等框架适配，往往滞后几周；
4. 一次小版本升级后，同一批评测题的成功率下降了 4 个百分点，排查时不得不去翻框架源码。

团队负责人提议「全部推倒、自研 Agent 运行时」。请评估这个提议：哪些部分值得自研、哪些应继续使用现成方案；自研需要额外承担哪些工作；如何用数据而不是感觉做出决定，又如何迁移。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 先诊断问题的性质**
- 问题 1～3 都指向同一件事：**上下文的组装与管理**，以及对模型新能力的跟进。对这个产品来说，这正是效果和成本的核心竞争力，值得自己掌控；
- 问题 4 是依赖升级的风险。即使继续用框架，锁定版本、每次升级先跑回归评测，也能缓解。

**2. 建议：自己掌控「循环与上下文」，基础设施继续复用**
- **值得自研**：精简、显式的 Agent 主循环；上下文组装（稳定的前缀、固定的工具顺序，把当前时间放到用户消息中而不是前缀里）；工具输出清理与结构化压缩策略；对接各厂商新能力的模型适配层。
- **继续复用**：持久化执行与检查点（如 LangGraph 运行时或 Temporal 这类引擎）、链路追踪与可观测性、评测框架、模型网关；工具接入通过 MCP 等标准协议复用。
- **折中方案**：不用高层的 Agent 抽象，只用框架的底层原语（例如在 LangGraph 中用自己写的节点组装循环），既保留持久化与人审能力，又拿回上下文的控制权。

**3. 自研需要额外承担的工作**
工具执行层（参数校验、超时、重试、并行调用）、流式工具调用的解析、多厂商格式适配、检查点与断点续跑、人在回路、链路追踪、评测基础设施、权限与沙箱，以及文档、新人上手、长期维护与值班。还要避免关键代码只有一两个人看得懂。

**4. 用数据做决定**
- 先建好黄金评测集，固定模型和工具，对比成功率、单任务成本、时延和缓存命中率；
- 先在一小部分流量或任务上做自研原型，对比收益；同时估算工程投入与维护成本，事先定好「收益超过多少才值得迁移」的门槛。

**5. 迁移方式**
- 先定义稳定的接口：模型网关、工具注册表、链路追踪的数据格式；
- 绞杀者模式，逐块替换：先换上下文组装（收益最直接，缓存命中率立竿见影），再换主循环；
- 新旧版本并行或影子运行，指标达标后再切流；过渡期内锁定框架版本，并保留回滚手段。

**评分要点（共 10 分）：**

- 诊断出问题 1～3 属于上下文控制与新能力跟进，问题 4 属于依赖升级风险（2 分）
- 给出「自研循环与上下文、复用持久化与观测等基础设施」的分层方案或底层原语的折中（3 分）
- 列出自研需要额外承担的工作与长期维护成本（2 分）
- 提出以评测集与指标为依据的决策方法（2 分）
- 给出渐进迁移与回滚方案（1 分）

**讲解：**

**常见失分点**：非黑即白，要么「框架万能」，要么「全部重写」；说不出自研的完整成本，低估了持久化、人审和观测这些「脏活」；没有评测集就决定迁移；忽视升级风险其实可以靠版本锁定和回归评测来控制。面试中被问「为什么自研」时，最好的回答是讲清**哪一层是你们的核心竞争力**、为什么现成方案在这一层不够用，以及自研付出的代价是什么。

<sub>考点：框架选型、框架解决的问题　｜　出处：LangChain 博客《Agent Frameworks, Runtimes, and Harnesses - oh my!》（2025-10-25）：https://www.langchain.com/blog/agent-frameworks-runtimes-and-harnesses-oh-my</sub>

</details>

---

## 系统设计题

<a name="AGT-FW-040"></a>

### AGT-FW-040　挑战 · 考频 ★★

公司希望建设统一的 Agent 开发平台：业务同学可以用低代码方式（类似扣子、Dify）自助搭建标准流程的助手；工程团队用代码框架（如 LangGraph）开发核心业务 Agent；两类应用都要接入统一的模型网关、工具与知识库、观测评测和发布治理。请给出平台的整体设计，重点说明低代码与代码两条路径的边界，以及如何打通。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 需求澄清**
- 用户：业务同学（自助搭建）与工程师（核心 Agent）；预计应用数量、调用量与峰值；
- 约束：数据是否必须私有化、可用的模型（多厂商、国产模型）、合规与审计要求、可用性目标。

**2. 分层架构**
- **接入层**：IM、网页、API 等渠道的统一接入与鉴权；
- **构建层**：低代码工作台（可视化工作流、插件、知识库、变量，可基于私有化部署的开源平台或自研）；代码框架的脚手架与模板（如 LangGraph、Agents SDK），统一的工程规范；
- **运行层**：低代码应用由工作流引擎解释执行 DSL；代码应用运行在 Agent 运行时上（检查点存储、interrupt 恢复服务）；两类应用共用一个**人审中心**（审批卡片、有效期、升级）；
- **能力层**：模型网关（路由、配额、密钥托管、缓存、计费）；工具与插件注册中心（HTTP API、MCP Server，统一鉴权与审核）；知识库服务（RAG 全链路）；记忆服务；
- **治理层**：身份与权限（按团队、应用授权）、密钥管理、数据隔离、内容安全与护栏、审计日志；
- **观测与评测**：统一 trace（按 OpenTelemetry 生成式 AI 语义约定埋点）、成本看板、评测集与发布门禁、灰度与 A/B；
- **发布治理**：DSL、提示词、图代码统一版本化，评审后发布，可一键回滚。

**3. 两条路径的边界**
- 低代码：FAQ、检索 + 生成 + 少量 API、分支简单的审批流、需要快速接入多渠道的助手；
- 代码：复杂控制流（嵌套循环、动态扇出、精细的失败恢复）、需要严格测试与 CI、对性能和成本要逐项优化、涉及资金等高风险操作的核心链路；
- 迁移信号：画布连线多到没人敢改、同一问题要在多个应用里重复修、需要单元测试和代码评审、成本与时延要逐项抠。

**4. 打通方式**
- 代码开发的 Agent 或工具以插件（HTTP / MCP）形式注册，低代码流程可以直接调用；
- 低代码应用导出 DSL 纳入 Git 管理，支持比对与评审；
- 共享同一套工具注册中心、知识库、模型网关和人审中心，避免两套能力各自为政；
- trace 与评测打通，两类应用用同一套指标比较；
- 「毕业路径」：在低代码平台上原型验证 → 需求稳定后把核心链路迁到代码，界面与渠道仍留在平台。

**5. 关键设计与风险**
- 代码节点在沙箱中执行；插件上架前审核，按应用授权；
- 按团队配额与限流，防止单个应用拖垮共享资源；
- 风险：平台复杂度与运维成本、治理流程拖慢上线、对开源平台的版本与许可依赖（部分开源平台的协议对多租户 SaaS 有附加限制，需提前评估）。

**6. 指标**
- 应用上线周期、活跃应用数、任务成功率、人工接管率、单任务成本、审批积压、线上事故数与回滚次数。

**评分要点（共 10 分）：**

- 给出清晰的分层架构，包含模型网关、工具注册、知识库、人审中心等共享能力（3 分）
- 讲清低代码与代码两条路径的边界与迁移信号（2 分）
- 给出两条路径的打通方式（插件 / MCP 互调、DSL 版本化、共享能力）（2 分）
- 覆盖治理、观测评测与发布（2 分）
- 讨论风险与指标（1 分）

**讲解：**

**常见失分点**：只设计低代码或只设计代码框架；两条路径各建一套能力、互不相通；忽略版本管理与发布治理；没有说明什么时候该从低代码「毕业」到代码。

<sub>考点：低代码平台、框架选型、框架解决的问题　｜　出处：OpenTelemetry 生成式 AI 语义约定：https://opentelemetry.io/docs/specs/semconv/gen-ai/ ；Dify 许可证（多租户附加限制）：https://github.com/langgenius/dify/blob/main/LICENSE</sub>

</details>

---
