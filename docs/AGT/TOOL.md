# AGT-TOOL · 工具调用

> 所属大类：智能体 Agent　｜　题量：53

Function Calling 的原理、协议细节与工具设计。

**考点覆盖**：Function Calling原理（7） · 工具Schema设计（4） · tool_choice（5） · 并行工具调用（8） · 工具结果回填（6） · 错误处理与重试（7） · 工具描述写法（4） · 工具检索（5） · 严格模式（8） · 流式工具调用（4） · 不同厂商格式（8） · API幻觉（3） · 副作用与幂等（10） · 工具结果缓存（5）

**题型**：[单选题（14）](#单选题) · [多选题（8）](#多选题) · [判断题（7）](#判断题) · [填空题（4）](#填空题) · [代码输出题（2）](#代码输出题) · [代码填空题（1）](#代码填空题) · [代码改错题（1）](#代码改错题) · [编程题（3）](#编程题) · [简答题（8）](#简答题) · [场景分析题（4）](#场景分析题) · [系统设计题（1）](#系统设计题)

---

## 单选题

<a name="AGT-TOOL-001"></a>

### AGT-TOOL-001　基础 · 考频 ★★★

关于 Function Calling（工具调用），下列说法正确的是：

- **A.** 模型在推理服务端的沙箱里直接执行函数，拿到函数返回值后再写进最终回复
- **B.** 模型只输出结构化的调用请求（函数名 + 参数），由应用执行后把结果回填
- **C.** 请求中传入 tools 且 tool_choice 保持默认时，模型每轮至少会调用其中一个工具
- **D.** Function Calling 是 API 网关层的规则匹配，与模型训练无关

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：模型从不执行任何函数，它只负责「填调用单」；应用拿到调用请求后，先解析、校验参数，再执行，最后把结果作为新消息回填。执行权永远在应用（运行时）手里，所以参数校验、权限检查、确认与审计都必须在应用侧完成。

- A 错：混淆了「提出调用」与「执行调用」，用户自定义的函数不会在推理服务里执行。
- C 错：默认的 `tool_choice: auto` 由模型自己决定调不调；不需要工具时，它会直接回答。
- D 错：这是训练出来的能力：聊天模板把工具定义渲染进提示词，SFT 和 RL 教会模型在需要时输出约定格式的调用，推理服务再把这段输出解析成 `tool_calls` 结构。

<sub>考点：Function Calling原理</sub>

</details>

---

<a name="AGT-TOOL-002"></a>

### AGT-TOOL-002　基础 · 考频 ★★★

在 OpenAI Chat Completions 中，模型返回的 `tool_calls[i].function.arguments` 字段是：

- **A.** 已经由 SDK 解析好的 JSON 对象（Python 中是 dict），可以直接按键取值
- **B.** 一段 Python 调用表达式（如 f(x=1)），需要用 eval 或 exec 执行
- **C.** 被调用函数的返回值，由 OpenAI 服务端执行函数后填入
- **D.** 一个 JSON 格式的字符串，要先 json.loads 解析，且可能不合法

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：OpenAI 的 `arguments` 是 **JSON 字符串**，需要应用自己解析；它由模型逐 token 生成，可能被截断、可能缺字段或多字段，解析和校验失败时应把错误作为结果回填，让模型改正。

对比：Anthropic 的 `tool_use.input` 是已解析的 JSON 对象。多模型网关在两种格式之间转换时，要在字符串和对象之间相互转换。

- A 错：OpenAI SDK 不会替你解析 `arguments`，它仍是字符串；已解析的对象是 Anthropic 的 `input` 字段的形式。
- B 错：参数是数据，不是代码；对模型输出执行 `exec` / `eval` 是严重的安全隐患。
- C 错：OpenAI 服务端不执行用户定义的函数；返回值由应用执行函数后得到，再通过 tool 消息回填。

<sub>考点：不同厂商格式、Function Calling原理</sub>

</details>

---

<a name="AGT-TOOL-003"></a>

### AGT-TOOL-003　基础 · 考频 ★★

你希望模型从简历文本中抽取姓名、电话、工作年限等字段，并严格按固定的 JSON 结构返回。用工具调用来实现时，经典的做法是：

- **A.** 定义以目标字段为参数的 record_resume 工具并用 tool_choice 强制调用，参数即结果
- **B.** 把 tool_choice 设为 none，在提示词里给出 JSON 示例，并要求模型严格按示例的字段与结构输出
- **C.** 把 tool_choice 设为 auto，再额外定义 20 个与简历无关的工具，扩大模型的选择范围
- **D.** 不定义工具，把采样温度调高、多采样几次，再合并各次结果以提高字段覆盖率

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：「指定函数」的经典用法就是结构化抽取：模型被迫调用 `record_resume`，它填的参数就是你要的 JSON；配合严格模式还能保证参数符合 Schema。

- B 错：`none` 禁止调用工具，只靠提示词和示例无法保证结构。
- C 错：无关工具只会增加干扰和 token 开销。
- D 错：调高温度只会让输出更随机，多次采样再合并也保证不了结构。

**注意**：强制调用并非在所有模型和模式下都可用。Anthropic 的模型开启扩展思考（extended thinking）时只支持 `auto` 与 `none`；Claude Opus 5.5、Sonnet 5.5 等较新的模型则完全不支持强制调用，`tool_choice` 设为 `any` 或某个具体工具会直接返回 400 错误。这时可以改用 `auto` 加提示词引导，并在代码里检查模型是否真的发起了调用；如果只是为了拿到 JSON，也可以直接使用结构化输出（用 JSON Schema 约束最终回复）。

<sub>考点：tool_choice　｜　出处：Anthropic 文档：Tool use（tool_choice），https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview ；模型迁移指南（Claude Opus 5.5、Sonnet 5.5 不支持强制工具调用），https://platform.claude.com/docs/en/about-claude/models/migration-guide</sub>

</details>

---

<a name="AGT-TOOL-004"></a>

### AGT-TOOL-004　进阶 · 考频 ★★

某 Agent 循环在**每一轮**请求中都把 tool_choice 设为 `required`（Anthropic 中对应 `any`）。最可能出现的问题是：

- **A.** 强制调用会自动关闭并行调用，模型每轮至多调用一个工具，循环效率下降
- **B.** 工具已被强制选用，服务端会省略工具定义的渲染，工具定义不再占用上下文 token
- **C.** 模型每轮都得调用工具、给不出不带调用的最终回答，循环要靠步数上限才能停下
- **D.** 模型被限定为调用工具列表中的第一个工具，其他工具形同虚设

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：`required` / `any` 强制模型每一轮至少调用一个工具，它就没有机会「说完」；Agent 循环通常以「模型不再请求工具」作为正常结束的信号，于是只能撞上步数上限才停。

正确做法：强制调用只用于工作流里的固定步骤（如第一步必须检索、结构化抽取）；需要强制时，额外提供一个 `final_answer` 工具作为交卷出口，或在完成强制步骤后把 tool_choice 改回 `auto`。

- A 错：强制调用不会关闭并行，是否并行由 `parallel_tool_calls` / `disable_parallel_tool_use` 控制。
- B 错：工具定义每次请求都会进入上下文，与 tool_choice 无关。
- D 错：`required` / `any` 允许调用任意一个工具；只有指定函数才会限定到某一个。

**版本差异**：OpenAI 等平台仍支持 `required`；Claude Opus 5.5、Sonnet 5.5 等较新的 Claude 模型已不支持 `any` 和指定工具（返回 400），只能用 `auto` 并在提示词中说明何时必须调用工具，所以在这些模型上不会出现本题的问题；但「强制步骤之外保持 `auto`、由代码判断循环何时结束」的设计要点不变。

<sub>考点：tool_choice　｜　出处：Anthropic 文档：Tool use（tool_choice），https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview ；模型迁移指南（Claude Opus 5.5、Sonnet 5.5 不支持强制工具调用），https://platform.claude.com/docs/en/about-claude/models/migration-guide</sub>

</details>

---

<a name="AGT-TOOL-005"></a>

### AGT-TOOL-005　基础 · 考频 ★★

关于「并行工具调用」（parallel tool calls），下列理解正确的是：

- **A.** 模型在一条 assistant 消息里给出多个互不依赖的调用；是否并发执行由应用决定
- **B.** 它指模型服务端在返回前替应用并发执行这些工具调用，再把结果一并返回
- **C.** 开启后，模型会把可用工具各调用一次，由应用从返回结果中挑出有用的
- **D.** 并行调用要求多个调用针对同一个工具（如同时查多个城市的天气），不能混合不同工具

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：「并行」描述的是模型的**输出**：一次给出多个调用，省掉多次模型往返。例如同时查北京和上海的天气，并行时调用模型 2 次（提出调用 + 总结），串行要 3 次。

至于执行，应用可以并发跑（线程池、asyncio），也可以出于限流或副作用冲突的考虑串行跑，但每个调用都必须回填结果。

- B 错：用户自定义的工具由应用执行，模型服务端不会替你执行。
- C 错：模型只会给出它认为需要的调用，不会把每个工具都调一遍。
- D 错：一条消息里可以同时调用不同的工具，比如同时查天气和查航班。

<sub>考点：并行工具调用</sub>

</details>

---

<a name="AGT-TOOL-006"></a>

### AGT-TOOL-006　进阶 · 考频 ★★★

下面是发给 OpenAI Chat Completions 的消息序列（Python 表示）。这次请求会被 API 拒绝，原因是：

```python
messages = [
    {"role": "system", "content": "你是出行助手"},
    {"role": "user", "content": "北京和上海天气怎么样？"},
    {"role": "assistant", "content": None, "tool_calls": [
        {"id": "call_1", "type": "function",
         "function": {"name": "get_weather", "arguments": '{"city": "北京"}'}},
        {"id": "call_2", "type": "function",
         "function": {"name": "get_weather", "arguments": '{"city": "上海"}'}}]},
    {"role": "tool", "tool_call_id": "call_1", "content": "北京：晴，3°C"},
    {"role": "user", "content": "快点"},
    {"role": "tool", "tool_call_id": "call_2", "content": "上海：小雨，9°C"},
]
```

- **A.** 带 tool_calls 的 assistant 消息 content 为 None，必须写上一段文字
- **B.** 两条 tool 消息应该合并成一条，在 content 里同时写两个结果
- **C.** user 消息插在了调用和结果之间：call_2 的结果没有紧跟在发起调用的 assistant 消息之后
- **D.** 两条 tool 消息必须按 call_2、call_1 的倒序回填

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：OpenAI 要求一条带 `tool_calls` 的 assistant 消息之后，紧跟着为**每一个**调用回填的 tool 消息，中间不能插入其他消息。这里 `call_1` 回填后插入了一条 user 消息，此时 `call_2` 还没有回应，违反了「结果紧跟调用」的不变式。

正确做法：先回填 `call_2`，再追加用户的新消息。

- A 错：带调用的 assistant 消息 content 可以为空。
- B 错：每个调用对应一条 tool 消息，用 `tool_call_id` 关联，不能合并。
- D 错：按 id 对应，与调用顺序一致是常见做法，不要求倒序。

工程上可以在发请求前用一个协议校验函数（维护「待回应调用集合」）把这类错误拦在本地。

<sub>考点：工具结果回填、并行工具调用</sub>

</details>

---

<a name="AGT-TOOL-007"></a>

### AGT-TOOL-007　进阶 · 考频 ★★

在 Anthropic Messages API 中，上一条 assistant 消息里有两个 `tool_use` 块（id 为 `toolu_1`、`toolu_2`）。两个工具都已执行完毕，同时用户又补充了一句「顺便查下明天的」。下一条消息应该怎样组织？

- **A.** 一条 user 消息，content 依次为：text 块「顺便查下明天的」、toolu_1 的 tool_result、toolu_2 的 tool_result
- **B.** 两条 user 消息，每条只放一个 tool_result；最后再发一条 user 文本消息
- **C.** 两条 role 为 tool 的消息分别回填结果，再发一条 user 文本消息
- **D.** 一条 user 消息，content 依次为：toolu_1 的 tool_result、toolu_2 的 tool_result、text 块「顺便查下明天的」

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：Anthropic 要求结果放在**紧随其后的那一条 user 消息**里，并行调用的全部 `tool_result` 放在同一条消息中，并且 `tool_result` 块要排在文本之前。

- A 错：文本排在了 `tool_result` 前面，违反顺序要求。
- B 错：拆成多条消息，第二个结果就不在「紧随其后」的那条消息里，可能直接报错；即使不报错，也会让模型逐渐减少并行调用。
- C 错：`role: tool` 是 OpenAI 的格式；Anthropic 没有 tool 角色，结果用 user 消息里的 `tool_result` 块（以 `tool_use_id` 关联）表示。

<sub>考点：不同厂商格式、工具结果回填</sub>

</details>

---

<a name="AGT-TOOL-008"></a>

### AGT-TOOL-008　基础 · 考频 ★★

用 OpenAI 的严格模式（`strict: true`）定义工具时，一个可以不填的参数 `note` 应该怎样表示？

- **A.** 不放进 required，与普通 JSON Schema 一样，模型想填就填，不填时整个字段省略
- **B.** 放进 required，类型写成「string 或 null」，没有备注时由模型显式传 null
- **C.** 从 Schema 中删掉 note，需要备注时让模型把内容写进其他字符串参数的末尾
- **D.** 把 additionalProperties 设为 true，让模型自行决定是否添加 note

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：严格模式要求**所有字段都列进 required**、每一层对象都设 `additionalProperties: false`。「可选」用「允许为 null」来表达（类型写成 `["string", "null"]`，或用 anyOf 加 null）：模型必须显式给出 `note: null`。执行时可以把 null 还原成函数的默认值。

为什么这样设计：约束解码要求结构确定，模型必须逐个生成每个字段；好处是模型不会因为「忘了」某个字段而出错。

- A 错：这是普通 JSON Schema 的可选写法；不在 required 里的字段，在严格模式下不被允许。
- C 错：删掉字段只会让信息无处安放，塞进其他参数还会污染那些参数的取值。
- D 错：严格模式要求 `additionalProperties: false`，设为 true 不符合要求。

<sub>考点：严格模式</sub>

</details>

---

<a name="AGT-TOOL-009"></a>

### AGT-TOOL-009　进阶 · 考频 ★★

OpenAI 流式返回中，两个并行调用的参数分片交错到达：每个增量都带 `index`；某个调用的第一个增量还带 `id` 和函数名，之后的增量只带 `arguments` 的一小段字符串。客户端正确的处理方式是：

- **A.** 每收到一个分片就尝试 json.loads，一旦解析成功就立即执行该调用，以降低端到端延迟
- **B.** 把各分片的 arguments 按到达顺序拼成一个字符串，再按逗号切分成两个调用
- **C.** 按 index 分别累积各调用的 id、名字与 arguments 片段，流结束后再整体解析校验
- **D.** 按 index 归组后只取每个调用的最后一个分片，它携带的是累计后的完整参数

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：分片的边界是任意的，多个调用的分片还会交错到达。必须按 `index` 归并，等流结束（并确认停止原因是 `tool_calls`）后，再对每个调用的完整参数做解析、校验和执行。

- A 错：某个前缀恰好是合法 JSON 并不代表参数完整，比如 `{"city": "北京"}` 后面可能还有字段；提前执行会用不完整的参数产生副作用。
- B 错：交错的分片会把两个调用的参数搅在一起，而且参数内部本身就可能含逗号。
- D 错：每个分片只是一小段增量字符串，最后一个分片并不含累计结果，必须拼接。

Anthropic 的流式格式不同但思路相同：`content_block_start`（含 tool_use 的 id 和名字）→ 若干 `input_json_delta`（partial_json 片段）→ `content_block_stop`，按内容块累积。若想提前在界面上显示「正在查询北京……」，可以用容错的增量解析器做展示，但执行前必须用完整参数重新校验。

<sub>考点：流式工具调用</sub>

</details>

---

<a name="AGT-TOOL-010"></a>

### AGT-TOOL-010　基础 · 考频 ★★★

下列工具错误中，最适合由运行时**自动**按指数退避重试的是：

- **A.** 参数校验失败：date 应为 YYYY-MM-DD，收到 11/20
- **B.** 查询航班的接口返回 429 Too Many Requests
- **C.** 无权访问该用户的订单
- **D.** 支付接口请求超时，不确定是否已经扣款

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：限流（429）、超时、5xx 这类**暂时性错误**，等一等再试可能成功；而且查询是只读操作，重试没有副作用。做法是指数退避加随机抖动，设次数上限，仍失败就把原因回填给模型。

- A 错：参数错误是确定性的，重试一百次结果都一样；应把校验信息回填，让模型改参数。
- C 错：权限错误不应重试，应告知用户或升级处理。
- D 错：写操作超时不代表没执行，盲目重试可能重复扣款。应先查询订单状态，确实不确定时带**同一个**幂等键重试。

<sub>考点：错误处理与重试、副作用与幂等</sub>

</details>

---

<a name="AGT-TOOL-011"></a>

### AGT-TOOL-011　进阶 · 考频 ★★

一个企业助手接入了 200 个工具，团队用检索为每个任务挑选 Top-5 工具放进上下文。评估工具检索模块时，最应该优先关注的指标是：

- **A.** 正确工具出现在 Top-k 中的召回率（Recall@k）
- **B.** 检索的平均延迟与 P99 延迟，它直接决定每轮对话的首字时间
- **C.** 被选中工具的描述平均长度，它决定了每轮请求的 token 开销
- **D.** 每个任务被选中的工具数量的方差，它反映了检索结果是否稳定

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：检索漏掉了正确工具，模型就根本看不到它，后面的步骤再聪明也无从选择；多选进来一两个无关工具，模型通常还能分辨。所以召回率是工具检索最该盯的指标。

提升召回率的常见做法：在工具描述里写上用户的常见说法（「100 美元能换多少人民币」→「美元、人民币、能换多少」）；BM25 与向量的混合检索；保留几个常驻工具和一个 `search_tools` 元工具兜底；监控「模型说没有合适工具」的比例，把漏召回的问法补进描述。

- B、C、D 错：都是次要指标。延迟要控制、token 开销要算，但前提是先选对；选中数量是否稳定与能否选对无关。

<sub>考点：工具检索</sub>

</details>

---

<a name="AGT-TOOL-012"></a>

### AGT-TOOL-012　进阶 · 考频 ★★

Gorilla（Patil 等, 2023）针对「模型编造不存在的 API 或参数」（API 幻觉）这一问题，采用的主要方法是：

- **A.** 在系统提示词中列出常见的幻觉 API 作为反例，并反复强调「不要编造 API」
- **B.** 对模型输出做 AST 子树匹配，与 API 库对不上的调用直接丢弃，模型本身不做训练
- **C.** 把 API 库中每个 API 的文档一次性放进系统提示词，让模型对照着写调用
- **D.** 检索相关 API 文档放进上下文，并做检索感知微调，让模型学会依据文档写调用

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：Gorilla 让模型面向 TorchHub、TensorFlow Hub、Hugging Face 上的大量 API 写调用，发现模型经常编造 API。它的做法是检索 API 文档放进上下文，并用检索感知训练（retriever-aware training）微调模型，使模型学会以文档为依据；文档更新后，模型也能跟上新版本。

- A 错：只靠提示词约束，效果有限，列举反例也覆盖不了数量庞大的 API。
- B 错：AST 子树匹配是 Gorilla 用来**评估**调用是否正确、是否幻觉的方法，不是减少幻觉的手段。
- C 错：API 数量巨大时放不下，也会稀释注意力；应当按需检索。

延伸：同一团队维护的 BFCL（伯克利函数调用排行榜）用 AST 匹配和真实执行两种方式评测函数调用能力，并考察「无关检测」。

<sub>考点：API幻觉</sub>

</details>

---

<a name="AGT-TOOL-013"></a>

### AGT-TOOL-013　基础 · 考频 ★★★

日志显示模型经常在 `search_orders`（按条件搜索订单列表）和 `get_order`（按订单号查询单个订单的详情）之间选错。下列改进最直接有效的是：

- **A.** 把两个工具的描述都压缩成一句话，减少冗余文字干扰，越短越不容易让模型混淆
- **B.** 描述中写清各自的使用时机与「何时不该用」，如注明「已知订单号时改用 get_order」
- **C.** 把两个工具改名为 tool_1 和 tool_2，避免模型望文生义，迫使它认真阅读描述
- **D.** 提高采样温度，让模型多尝试几种工具，再根据返回结果是否为空自动纠正

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：工具描述是写给模型看的「API 文档」，要写清做什么、什么时候用、**什么时候不该用**、返回什么。相似工具之间要互相指路，拉开区分度，例如 `search_orders` 写明「已知订单号时请改用 get_order」，必要时给出参数格式示例。另一个方向是合并工具：如果两者经常被连着调用，可以合并成一个按任务设计的工具。

- A 错：描述太短正是相似工具无法区分的原因。
- C 错：有区分度的名字（动词 + 对象）本身就是重要的语义信息，改成编号只会更难选。
- D 错：提高随机性只会让选择更不稳定，「结果为空」也不能可靠地说明选错了工具。

<sub>考点：工具描述写法</sub>

</details>

---

<a name="AGT-TOOL-053"></a>

### AGT-TOOL-053　进阶 · 考频 ★

Toolformer（Schick 等，2023）与今天主流的 Function Calling 相比，最本质的区别是：

- **A.** Toolformer 在推理时由一个外部分类器判断是否需要调用工具，模型本身并不生成任何调用，只负责读取结果
- **B.** Toolformer 只能调用计算器这一种工具，训练数据也只覆盖算术，因此无法推广到问答、搜索等其他任务
- **C.** Toolformer 通过 RLHF 学会调用工具：标注人员给每一次调用结果的好坏打分，训练出的奖励模型再给策略提供偏好信号
- **D.** Toolformer 自监督地造数据：在文本中插入候选 API 调用并执行，只保留能降低后续 token 损失的调用，再微调

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：Toolformer（arXiv:2302.04761）的核心是**自监督地**学会在什么位置、调用什么 API。

做法：每个 API 只给几个示范，让模型（GPT-J）在大量文本中采样插入候选调用，例如 `[Calculator(400/1400) → 0.29]`；实际执行这些调用，比较「带调用和结果」与「不带」时后续 token 的语言模型损失，只保留能让损失下降超过阈值的调用；再用这些增强后的文本微调模型。论文使用了计算器、问答系统、维基百科搜索、机器翻译和日历五种工具。

与主流 FC 的区别：Toolformer 的工具集合在训练时就固定了，调用以内联文本的形式嵌在生成过程中；主流 FC 在推理时把任意工具的 Schema 放进上下文，模型经过工具调用数据的后训练，能泛化到训练时没见过的工具，并通过结构化接口多轮回填结果。

- A 错：调用由模型自己生成。
- B 错：论文使用了五种工具。
- C 错：Toolformer 不使用 RLHF，筛选依据是语言模型损失的下降。

<sub>考点：Function Calling原理　｜　出处：Toolformer 论文 arXiv:2302.04761</sub>

</details>

---

## 多选题

<a name="AGT-TOOL-014"></a>

### AGT-TOOL-014　进阶 · 考频 ★★★

关于模型「学会」工具调用以及推理服务如何支持它，下列说法**正确**的有：

- **A.** 聊天模板把工具的名称、描述和参数 Schema 序列化进提示词，每次请求都占 token
- **B.** vLLM 等推理服务用工具解析器识别输出中的调用标记，再转成 tool_calls 结构
- **C.** 训练数据覆盖「需要调用工具」的样本即可，混入直接回答的样本会削弱模型调用工具的积极性
- **D.** SFT 数据中，assistant 输出的调用计入 loss，工具返回的内容通常不计入
- **E.** 没有原生 Function Calling 能力的模型无法使用工具，提示词约定的调用格式解析不了

<details>
<summary>答案与解析</summary>

**答案：ABD**

**解析：**

**结论**：A、B、D 正确。Function Calling =「训练出来的能力」+「推理服务的解析」。

- A 对：工具定义本质上是提示词，写得好坏直接影响调用准确率；工具太多会带来可观的固定 token 开销。
- B 对：vLLM、SGLang 等推理服务都提供工具解析器，把模型输出中的调用标记转换成 API 中的 `tool_calls` 结构；严格模式下还会叠加约束解码，保证参数符合 Schema。
- C 错：数据要覆盖不该调用时直接回答、参数缺失时先追问、并行调用、出错后修正等情况，否则模型会滥用工具。BFCL 等评测也专门考察「无关检测」。
- D 对：工具返回是环境给出的内容，不是模型要学会生成的东西。
- E 错：可以用提示词约定输出格式（ReAct 文本或 JSON），再自己解析，可靠性差一些，可配合约束解码。

<sub>考点：Function Calling原理　｜　出处：vLLM 文档 Tool Calling：https://docs.vllm.ai/en/latest/features/tool_calling.html ；Berkeley Function Calling Leaderboard（BFCL）：https://gorilla.cs.berkeley.edu/leaderboard.html</sub>

</details>

---

<a name="AGT-TOOL-015"></a>

### AGT-TOOL-015　基础 · 考频 ★★★

设计工具的参数 Schema 时，下列做法**恰当**的有：

- **A.** 当前登录用户的 ID 设为必填参数由模型填写，这样调用记录里就带上了身份，便于审计
- **B.** 参数名尽量短，例如用 u 代替 user_id，以节省 token
- **C.** 能枚举的参数用 enum，并在描述中写清格式和单位，如 YYYY-MM-DD、元、毫秒
- **D.** 为了灵活，所有参数都定义成自由文本的 string，由工具内部再去解析
- **E.** 设置 additionalProperties: false，并在执行前真正检查有没有多余参数

<details>
<summary>答案与解析</summary>

**答案：CE**

**解析：**

**结论**：C、E 恰当。好 Schema 的目标是让错误「写不出来」。

- A 错：当前登录用户的 ID、当前时间这类程序已知的信息不该交给模型填写：模型可能填错，也可能被提示注入诱导改成别人的 ID，造成越权。应由程序注入，权限校验基于当前登录身份；审计日志也应由运行时记录真实的调用者，而不是记录模型传来的参数。
- B 错：参数名应当自解释（`user_id` 而不是 `u` 或 `user`），省下的几个 token 远不如选错、填错带来的重试成本。
- C 对：enum 和格式说明直接缩小了模型的出错空间。
- D 错：自由文本让模型「自由发挥」，格式五花八门，工具内部的解析也容易出错。
- E 对：模型常常凭空多填一个字段，Schema 声明了还要真的校验。

<sub>考点：工具Schema设计</sub>

</details>

---

<a name="AGT-TOOL-016"></a>

### AGT-TOOL-016　进阶 · 考频 ★★★

模型在一条 assistant 消息里发起了 3 个并行调用，其中 1 个执行超时。回填结果时，下列做法**正确**的有：

- **A.** 超时的调用先不回填，等下一轮执行成功了再补上，避免把错误暴露给模型
- **B.** 超时的调用也要回填一条结果，说明超时原因和建议（Anthropic 可以标记 is_error）
- **C.** 为了省 token，可以把 assistant 消息里的调用参数改写得更短后再追加
- **D.** 先把这条带调用的 assistant 消息原样追加进历史，再追加结果
- **E.** 每条结果用对应的调用 id 关联，不能张冠李戴，也不能回填没有对应调用的结果

<details>
<summary>答案与解析</summary>

**答案：BDE**

**解析：**

**结论**：B、D、E 正确，它们对应 Function Calling 的协议不变式。

- A 错：每个调用都要**恰好回应一次**，漏回一条，下一次请求多半直接报 400。错误本身也是有用的观察，模型看到「超时，可缩小范围后重试」往往能自己调整。
- B 对：OpenAI 没有专门的错误字段，把错误写进 content；Anthropic 的 `tool_result` 可以加 `is_error: true`。
- C 错：调用消息要原样保留，id、函数名、参数都不要改；使用推理模型时，模型返回的思考内容通常也要按要求原样带回。
- D 对：调用消息必须先于结果出现在历史中。
- E 对：按 id 对应，不能出现孤儿结果。

<sub>考点：工具结果回填、并行工具调用　｜　出处：Anthropic 文档 Handle tool calls：https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls ；OpenAI 文档 Function calling：https://developers.openai.com/api/docs/guides/function-calling</sub>

</details>

---

<a name="AGT-TOOL-017"></a>

### AGT-TOOL-017　进阶 · 考频 ★★

关于工具调用的严格模式（strict），下列说法**正确**的有：

- **A.** 只支持 JSON Schema 的一个子集，不受支持的约束（各家支持程度不同）要在客户端补充校验
- **B.** 以 OpenAI 为例，每一层 object 都要设置 additionalProperties: false
- **C.** 一个新的 Schema 第一次使用时可能有额外的预处理延迟，之后会被缓存
- **D.** 服务端把参数 Schema 编译成语法、用约束解码屏蔽不合法 token，输出未被截断时参数必能通过校验
- **E.** 开启后，服务端还会按字段描述对参数取值做语义校验，例如预订日期不会早于今天、城市名不会拼错

<details>
<summary>答案与解析</summary>

**答案：ABCD**

**解析：**

**结论**：A、B、C、D 正确。严格模式与结构化输出是同一套约束解码技术，一个约束工具参数，一个约束最终回复。

- A 对：只能用受限的 Schema 写法，各家对数值范围、字符串格式等约束的支持程度不同；客户端补校验还有一个原因：网关可能接入不支持严格模式的模型。
- B 对：OpenAI 的严格模式还要求所有字段都列进 required，可选字段写成「某类型或 null」。
- C 对：首个请求会变慢，属于正常现象。
- D 对：不开严格模式时，参数可能缺字段、类型不对、多出字段、取枚举外的值；开启后这些格式错误不会再出现。例外是输出因达到 max_tokens 被截断（或模型拒答）时，参数 JSON 可能不完整，所以执行前仍要检查停止原因。
- E 错：严格模式**只保证格式，不保证语义**：日期格式合法却可能已经过去，城市名合法却可能拼错、不在服务范围内，业务校验仍然要做。

<sub>考点：严格模式　｜　出处：OpenAI 文档 Structured Outputs：https://developers.openai.com/api/docs/guides/structured-outputs ；Anthropic 文档 Structured outputs（strict tool use）：https://platform.claude.com/docs/en/build-with-claude/structured-outputs</sub>

</details>

---

<a name="AGT-TOOL-018"></a>

### AGT-TOOL-018　挑战 · 考频 ★★

在多模型网关中，把 OpenAI Chat Completions 风格的请求转换为 Anthropic Messages 格式时，下列映射**正确**的有：

- **A.** tools[].function.parameters → tools[].input_schema
- **B.** 每条 role 为 tool 的消息 → 一条 role 为 tool 的消息，只需把 tool_call_id 改名为 tool_use_id
- **C.** role 为 system 的消息 → 请求顶层的 system 参数
- **D.** tool_calls[].function.arguments（JSON 字符串）→ tool_use 块的 input，原样保留为字符串
- **E.** tool_choice: "required" → tool_choice: {"type": "any"}

<details>
<summary>答案与解析</summary>

**答案：ACE**

**解析：**

**结论**：A、C、E 正确。

- A 对：OpenAI 的工具定义外面还包了一层 `function`，Anthropic 直接是 name、description、`input_schema`。
- B 错：Anthropic 没有 tool 角色。连续的 tool 消息要合并成**一条 user 消息**里的多个 `tool_result` 块（以 `tool_use_id` 关联），排在该消息的文本之前；以「错误」开头一类的结果可以映射为 `is_error: true`。
- C 对：Anthropic 的系统提示词是顶层参数。
- D 错：Anthropic 的 `input` 是已解析的 JSON 对象，需要 `json.loads`；反向转换时再序列化成字符串。
- E 对：tool_choice 的映射为 auto → auto、required → any、none → none、指定函数 → `{"type": "tool", "name": ...}`；关闭并行用 `disable_parallel_tool_use: true`（放在 tool_choice 里），对应 OpenAI 的顶层参数 `parallel_tool_calls: false`。

转换不总是无损的：思考内容、缓存控制等各家特有的字段往往只能丢弃或特殊处理，网关要写清哪些字段保证无损。

<sub>考点：不同厂商格式、tool_choice</sub>

</details>

---

<a name="AGT-TOOL-019"></a>

### AGT-TOOL-019　挑战 · 考频 ★★

关于有副作用的工具（下单、支付、发邮件、写数据库）的调用与重试，下列说法**正确**的有：

- **A.** 只读查询（如查天气、查余票）通常可以在退避后安全地自动重试
- **B.** 工具描述里声明了「此操作幂等」时，运行时就可以对它不设上限地自动重试，直到成功
- **C.** 幂等键应绑定「这一次业务意图」（如任务 ID + 步骤 + 动作），同一逻辑调用的重试共用一个键
- **D.** 写操作超时不代表没有执行，应先查询状态，或带同一个幂等键重试
- **E.** MCP 的 readOnlyHint 等工具注解由 Server 自行声明，只是提示，不能当作安全保证

<details>
<summary>答案与解析</summary>

**答案：ACDE**

**解析：**

**结论**：A、C、D、E 正确。

- A 对：只读操作没有副作用，暂时性错误可以退避重试。
- B 错：描述只是自然语言声明，不能替代真正的幂等实现；即使真的幂等，重试也要有次数上限和退避，否则会打爆下游。
- C 对：除了「任务 ID + 步骤 + 动作」，也可以用服务端预先发放的订单号作键。键要在一次逻辑调用开始时生成，重试时复用；服务端见过这个键就直接返回原结果，不会重复下单。每次重试都换新键，等于没有幂等。也不能拿 JSON-RPC 请求 id 充当幂等键：按 MCP 2026-07-28 版规范，Streamable HTTP 的响应流断开后在途请求即丢失，客户端必须用**新的**请求 id 重新发起，所以幂等键要作为工具参数显式传递。
- D 对：「服务端已下单、响应却超时」是重复下单的根源。
- E 对：注解只是提示，Host 可据此决定是否自动执行、是否要人确认、失败能否重试；但恶意 Server 可以谎称「只读」，规范要求客户端把来自不可信 Server 的注解视为不可信，权限策略要由 Host 按「用户 × Server × 工具」配置。

<sub>考点：副作用与幂等、错误处理与重试　｜　出处：MCP 规范 2026-07-28（Tools）：https://modelcontextprotocol.io/specification/2026-07-28/server/tools ；变更日志：https://modelcontextprotocol.io/specification/2026-07-28/changelog</sub>

</details>

---

<a name="AGT-TOOL-020"></a>

### AGT-TOOL-020　挑战 · 考频 ★★

关于 API 幻觉以及函数调用能力的评测，下列说法**正确**的有：

- **A.** 把工具文档（或检索到的文档片段）放进上下文可以减少 API 幻觉，文档更新后模型也能跟上
- **B.** BFCL 同时使用 AST 匹配与真实执行两种方式，判断调用是否正确
- **C.** 开启严格模式后，约束解码会把调用限定在合法的工具与参数内，因此模型不会再选错工具
- **D.** API 幻觉既包括调用不存在的函数，也包括给真实存在的函数编造不存在的参数
- **E.** BFCL 的「无关检测」考察的是：给定的工具都与问题无关时，模型应当不调用工具

<details>
<summary>答案与解析</summary>

**答案：ABDE**

**解析：**

**结论**：A、B、D、E 正确。

- A 对：这正是 Gorilla「检索 + 检索感知训练」的思路；工程上即使不训练，按需把相关文档放进上下文也能明显减少编造。
- B 对：AST 匹配检查函数名、参数名和取值是否符合预期，真实执行检查调用能否跑通、结果是否正确；后续版本又扩展到多轮与 Agent 场景。
- C 错：严格模式保证参数符合**所选工具**的 Schema，工具名合法也不等于选对了工具；选错工具要靠描述的区分度、工具数量控制和评测来解决。
- D 对：两类都很常见，执行前必须校验工具名和参数。
- E 对：「该调不调、不该调乱调」是一类独立的错误，闲聊也去调工具同样是失败。

<sub>考点：API幻觉</sub>

</details>

---

<a name="AGT-TOOL-046"></a>

### AGT-TOOL-046　进阶 · 考频 ★★

为 Agent 的工具层加一层结果缓存：相同的调用直接返回上次的结果，以降低延迟、费用和对下游系统的压力。下列做法**正确**的有：

- **A.** 缓存键用「工具名 + 参数」就够了：同一个查询工具对不同用户返回的数据相同，没有必要把用户或租户放进缓存键
- **B.** 计算缓存键之前先规范化参数（如按键名排序、去掉首尾空白），否则键顺序不同的同一调用会被当成两次不同的调用
- **C.** 只缓存只读的查询类工具（如查汇率、读产品文档）；下单、发邮件等有副作用的工具一律不缓存，防止重复执行交给幂等键处理
- **D.** MCP 工具把 readOnlyHint 标注为 true 时，即使它来自未经审核的第三方 Server，也可以据此认定它只读、放心缓存其结果
- **E.** 所有只读工具统一设一个较长的 TTL；写操作之后不必主动失效缓存，等它自然过期即可

<details>
<summary>答案与解析</summary>

**答案：BC**

**解析：**

**结论**：B、C 正确。工具结果缓存的三个要点是：缓存什么、键怎么定、何时失效。

- A 错：查询结果往往取决于调用者的身份与权限。键里不含用户或租户，就会把用户甲的订单返回给用户乙，这是严重的越权事故。MCP 2026-07-28 版规范为列表类结果和 `resources/read` 引入 `cacheScope`，`private` 表示只能在同一授权上下文内复用，体现的是同一原则。
- B 对：`{"q": "x", "k": 5}` 与 `{"k": 5, "q": "x"}` 是同一调用，不规范化会白白降低命中率。
- C 对：只有只读、对相同输入结果稳定的工具才适合缓存。有副作用的调用被缓存，等于「第二次没有真正执行却报告成功」；防止重复执行靠的是幂等键（由服务端去重），而不是客户端缓存。
- D 错：MCP 规范明确，工具标注（annotations）只是提示，不保证如实描述工具行为，客户端不应依据来自不可信 Server 的标注做决策。是否可缓存应由平台的工具登记信息决定。
- E 错：TTL 决定能容忍多旧的数据，应按数据变化的快慢分别设置（汇率几分钟、产品文档几小时），统一用长 TTL 会让变化快的数据过时；写操作之后也要主动失效受影响资源的缓存，否则在 TTL 内会读到自己刚刚改掉的旧值。

<sub>考点：工具结果缓存、副作用与幂等　｜　出处：MCP 规范 2026-07-28（Tools、ToolAnnotations、Caching）：https://modelcontextprotocol.io/specification/2026-07-28/server/tools</sub>

</details>

---

## 判断题

<a name="AGT-TOOL-021"></a>

### AGT-TOOL-021　基础 · 考频 ★★★

开启工具调用的严格模式（strict）之后，模型生成的参数一定符合 Schema，因此应用侧可以省掉参数的业务校验。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。严格模式只保证**格式**合法：字段齐全、类型正确、枚举取值合法、没有多余字段。它不保证**语义**正确：日期格式合法却已经过去、金额合法却超出用户余额、用户 ID 合法却不是当前登录用户。

此外，不是所有模型和场景都开了严格模式，Schema 子集不支持的约束也只能在客户端检查。所以执行前的业务校验和权限检查一个都不能少。

<sub>考点：严格模式</sub>

</details>

---

<a name="AGT-TOOL-022"></a>

### AGT-TOOL-022　进阶 · 考频 ★★

流式接收工具调用时，即使流已经结束，执行前也应先检查停止原因：如果是因为达到 max_tokens 而截断，参数 JSON 可能不完整，不应执行该调用。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。流式输出可能因为达到 `max_tokens`、网络中断或其他原因提前结束，此时最后一个调用的参数往往只拼了一半。有的 SDK 用容错解析器处理部分 JSON，可能把截断的输入「解析成功」为一个缺字段的对象，不报异常。

正确做法：确认停止原因是 `tool_calls`（OpenAI）或 `tool_use`（Anthropic）；对完整参数严格解析并按 Schema 校验；截断时提高 `max_tokens` 重新请求，或回填一条「参数不完整」的错误，而不是执行一个参数残缺、可能带副作用的调用。

<sub>考点：流式工具调用</sub>

</details>

---

<a name="AGT-TOOL-023"></a>

### AGT-TOOL-023　进阶 · 考频 ★★

使用 Anthropic Messages API 时，模型一次发起的多个并行调用，其 tool_result 可以拆到连续的多条 user 消息里分别回填，效果与放在同一条消息里完全相同。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。Anthropic 要求结果放在**紧随其后的那一条 user 消息**里，并行调用的全部 `tool_result` 应放在同一条消息中，且排在文本之前。拆成多条消息，后面的结果就不在「紧随其后」的位置，可能直接报错；即使请求被接受，也会让模型逐渐学会少用并行调用。

对比 OpenAI：每个调用各回一条 `role: "tool"` 的消息，这些 tool 消息要连续跟在发起调用的 assistant 消息之后。

<sub>考点：不同厂商格式、并行工具调用</sub>

</details>

---

<a name="AGT-TOOL-024"></a>

### AGT-TOOL-024　基础 · 考频 ★★

在工具检索中，召回率通常比精确率更关键：正确的工具一旦没被检索出来，模型就根本没有机会选择它；多选进来一两个无关工具，模型往往还能分辨。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。工具检索的错误是不对称的：漏召回直接导致任务失败（或模型改用错误的工具硬凑），多召回只是多一点 token 和一点干扰。所以通常取一个略宽的 Top-k，再加几个常驻工具和一个 `search_tools` 元工具兜底。

当然 k 也不能无限放大：工具太多会让相似工具互相干扰、选择准确率下降，经验上一次交给模型的工具最好控制在十几到二十个以内。

<sub>考点：工具检索</sub>

</details>

---

<a name="AGT-TOOL-025"></a>

### AGT-TOOL-025　进阶 · 考频 ★★

为了让服务端能区分不同的请求，调用下单接口时，幂等键应当在每次重试时重新生成。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。幂等键的作用恰恰是让服务端识别出「这是**同一次**请求的重试」。正确做法是在一次逻辑调用开始时生成键，之后所有重试都带同一个键；服务端见过这个键，就直接返回第一次的结果。

如果每次重试都换新键，「服务端已下单、响应却超时」时，重试会被当成一笔新订单，造成重复扣款，幂等就形同虚设。键通常绑定业务意图，例如会话 ID + 步骤号 + 动作，或由服务端预先发放的订单号。

<sub>考点：副作用与幂等</sub>

</details>

---

<a name="AGT-TOOL-048"></a>

### AGT-TOOL-048　进阶 · 考频 ★★

编码 Agent 的 read_file 结果缓存只靠「经由编辑工具写入后失效」是不够的：通过 Bash 执行的命令、代码格式化工具或其他进程同样可能修改文件，因此命中缓存前还应校验文件的修改时间或内容哈希，不一致就重新读取。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。缓存层只能感知经由它自己执行的写操作，而文件可能在它看不见的地方被修改：`sed -i`、`git checkout`、`npm install` 这类 Bash 命令，保存时自动运行的格式化工具，同一工作区里的其他 Agent，以及用户本人在 IDE 中的编辑。

读到陈旧内容的后果很具体：模型基于旧内容生成的 search/replace 编辑匹配不上，或者整文件写回时覆盖了别人的修改；测试结论也可能建立在已经不存在的代码上。

常见做法：
- 命中前用 `stat` 校验修改时间与文件大小（很便宜），必要时比较内容哈希；
- 编辑前再做一次「读后改」校验：如果文件自上次读取后被改过，就拒绝编辑并要求重新读取；
- 本地读文件本来就很快，可以干脆不缓存，把缓存留给昂贵或限流严格的远程工具。

<sub>考点：工具结果缓存</sub>

</details>

---

<a name="AGT-TOOL-051"></a>

### AGT-TOOL-051　进阶 · 考频 ★★★

原生 Function Calling 在底层已经不再是文本生成：模型直接输出一个结构化的函数调用对象，因此推理服务端不需要对模型的输出做任何解析。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。原生 Function Calling 在底层仍然是逐 token 的文本生成。区别在于：

- 模型在后训练阶段学过一套固定的调用格式。对话模板中规定了工具定义怎样注入、调用用什么特殊 token 或标记包起来，例如一些开源模型使用 `<tool_call>{...}</tool_call>` 形式；
- 推理服务端按这套格式**解析**生成的文本，转换成 API 中的 `tool_calls` 等结构化字段返回给调用方。像 vLLM 这样的推理引擎，要按模型选择对应的工具调用解析器（tool call parser）；
- 开启严格模式时，服务端还会用约束解码保证参数符合 JSON Schema；不开启时，OpenAI 返回的 `arguments` 是一个 JSON 字符串，仍然可能不合法，需要应用侧解析与校验。

所以，FC 与「提示词约定格式 + 正则解析」的区别不在于「生不生成文本」，而在于：模型针对这种格式训练过，解析由服务端完成并暴露成结构化接口，还可以叠加约束解码。

<sub>考点：Function Calling原理、严格模式　｜　出处：vLLM 文档 Tool Calling</sub>

</details>

---

## 填空题

<a name="AGT-TOOL-026"></a>

### AGT-TOOL-026　基础 · 考频 ★★

模型请求调用工具时，OpenAI Chat Completions 返回的 `finish_reason` 为 ____；Anthropic Messages 返回的 `stop_reason` 为 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) tool_calls / "tool_calls"；(2) tool_use / "tool_use"

**解析：**

Agent 循环据此判断下一步：停止原因是 `tool_calls` / `tool_use`，就执行工具、回填结果、继续请求；正常说完时，OpenAI 为 `stop`，Anthropic 为 `end_turn`，循环结束。

还要处理其他停止原因：达到输出上限（OpenAI 的 `length`、Anthropic 的 `max_tokens`）时，调用参数可能被截断，不能直接执行。

<sub>考点：不同厂商格式</sub>

</details>

---

<a name="AGT-TOOL-027"></a>

### AGT-TOOL-027　进阶 · 考频 ★★

把 OpenAI 的工具调用参数迁移到 Anthropic：`tool_choice: "required"`（至少调用一个工具）对应 Anthropic 的 `{"type": "____"}`；OpenAI 的 `parallel_tool_calls: false`（禁止并行）对应在 Anthropic 的 tool_choice 中设置 `____: true`。

<details>
<summary>答案与解析</summary>

**答案：** (1) any；(2) disable_parallel_tool_use

**解析：**

**tool_choice 对照**：

| 含义 | OpenAI | Anthropic |
|---|---|---|
| 模型自己决定 | `auto` | `{"type": "auto"}` |
| 至少调用一个 | `required` | `{"type": "any"}` |
| 禁止调用 | `none` | `{"type": "none"}` |
| 指定某个工具 | `{"type": "function", "function": {"name": ...}}` | `{"type": "tool", "name": ...}` |

并行开关的位置不同：OpenAI 是请求的顶层参数 `parallel_tool_calls`；Anthropic 是 tool_choice 里的 `disable_parallel_tool_use`，设为 true 后每次最多调用一个工具。

<sub>考点：tool_choice、不同厂商格式</sub>

</details>

---

<a name="AGT-TOOL-028"></a>

### AGT-TOOL-028　基础 · 考频 ★★

某 Agent 一次性加载了 40 个工具，每个工具的定义（名称、描述、参数 Schema）平均约 350 token。工具定义带来的固定开销为每次请求 ____ token；若一个任务平均要调用模型 12 次，且不考虑缓存，则每个任务仅工具定义就要输入 ____ token。

<details>
<summary>答案与解析</summary>

**答案：** (1) 14000 / 14,000 / 14K / 1.4 万；(2) 168000 / 168,000 / 168K / 16.8 万

**解析：**

**计算**：$40\times350=14000$ token / 次；$14000\times12=168000$ token / 任务。

工具定义本质上是提示词，每次请求都要发送。工具越多，固定开销越大，相似工具之间的干扰也越强，选择准确率随之下降。常用做法：

- 按任务检索 Top-k 工具，再加少量常驻工具；
- 提供工具搜索的元工具，让模型按需发现并加载工具；
- 保持工具列表在任务内稳定，以命中前缀缓存（Prompt Caching），中途需要新工具时以追加方式加载，而不是改写开头的工具列表。

<sub>考点：工具检索</sub>

</details>

---

<a name="AGT-TOOL-029"></a>

### AGT-TOOL-029　基础 · 考频 ★★

用户问「北京、上海、广州今天天气怎么样」，Agent 需要对三个城市各调用一次天气工具，再汇总回答。允许并行调用时，一共需要调用模型 ____ 次；关闭并行（每轮最多一个工具调用）时，需要调用模型 ____ 次。

<details>
<summary>答案与解析</summary>

**答案：** (1) 2；(2) 4

**解析：**

- **允许并行**：第 1 次调用模型，一条消息里给出 3 个调用；应用执行后回填 3 条结果；第 2 次调用模型生成最终回答。共 **2** 次。
- **关闭并行**：每轮只能调用一个工具，3 个城市要 3 轮，再加最后一次汇总，共 **4** 次。

并行省下的是**模型往返**（以及随之重复输入的上下文 token），而不是工具本身的执行时间。调用之间有依赖（后一个要用前一个的结果）或写操作必须串行时，应关闭并行。

<sub>考点：并行工具调用</sub>

</details>

---

## 代码输出题

<a name="AGT-TOOL-039"></a>

### AGT-TOOL-039　进阶 · 考频 ★★

下面的执行器对可重试错误（限流、5xx）重试，对确定性错误（参数校验失败）不重试。`make` 按顺序返回结果或抛出异常。输出是什么？

```python
class Retryable(Exception): pass

def call_with_retry(fn, retries=2):
    log = []
    for attempt in range(retries + 1):
        try:
            return fn(), log
        except Retryable as e:
            log.append(f"retry{attempt}:{e}")
        except ValueError as e:
            return f"错误：{e}（不重试）", log
    return "错误：重试耗尽", log

def make(seq):
    it = iter(seq)
    def fn():
        x = next(it)
        if isinstance(x, Exception):
            raise x
        return x
    return fn

print(call_with_retry(make([Retryable("429"), "ok"])))
print(call_with_retry(make([ValueError("date 格式错误"), "ok"])))
print(call_with_retry(make([Retryable("503")] * 3 + ["ok"])))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
('ok', ['retry0:429'])
('错误：date 格式错误（不重试）', [])
('错误：重试耗尽', ['retry0:503', 'retry1:503', 'retry2:503'])
```

**解析：**

1. 第一次遇到 429（可重试），记一条日志；第二次成功，返回 `'ok'`；
2. 参数错误属于确定性错误，重试也没用，立即返回错误信息，不重试；
3. 连续三次 503，`retries=2` 意味着最多尝试 3 次，全部失败后返回「重试耗尽」。

工程要点：重试之间要指数退避并加随机抖动，避免同时重试造成「重试风暴」；耗尽后不要抛异常中断 Agent 循环，而是回填「原因 + 建议」（如「接口繁忙，可稍后再试或换用其他数据源」）。写操作还要额外考虑幂等：超时的写请求可能已经执行。

<sub>考点：错误处理与重试</sub>

</details>

---

<a name="AGT-TOOL-040"></a>

### AGT-TOOL-040　进阶 · 考频 ★★

模拟「服务端已经下单、但响应超时」的情况：第一次请求会创建订单，然后抛出超时；客户端捕获超时后重试。比较三种幂等键策略，输出是什么？

```python
class BookingAPI:
    def __init__(self):
        self.orders, self.seen, self.calls = [], {}, 0
    def book(self, flight, key=None):
        self.calls += 1
        if key is not None and key in self.seen:
            return self.seen[key]
        order = f"ORD{len(self.orders) + 1}"
        self.orders.append(order)                 # 副作用已经发生
        if key is not None:
            self.seen[key] = order
        if self.calls == 1:
            raise TimeoutError("响应超时")         # 已下单，但响应丢了
        return order

def book_with_retry(api, flight, next_key):
    for _ in range(3):
        try:
            return api.book(flight, key=next_key())
        except TimeoutError:
            continue

for name, next_key in [("无键", lambda: None), ("每次新键", iter(["k1", "k2", "k3"]).__next__),
                       ("固定键", lambda: "trip7:book:MU5101")]:
    api = BookingAPI()
    print(name, book_with_retry(api, "MU5101", next_key), api.orders)
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
无键 ORD2 ['ORD1', 'ORD2']
每次新键 ORD2 ['ORD1', 'ORD2']
固定键 ORD1 ['ORD1']
```

**解析：**

- **无键**：第一次请求已创建 ORD1，响应超时；重试时服务端无从判断这是同一笔请求，又创建了 ORD2。重复下单。
- **每次新键**：每次重试都换一个新键，服务端看到的是两个不同的请求，效果与无键相同，幂等形同虚设。
- **固定键**：第一次请求用该键创建了 ORD1；重试带着同一个键，服务端直接返回 ORD1，只有一笔订单。

**结论**：幂等键要绑定「这一次业务意图」（如行程 ID + 动作 + 航班），在逻辑调用开始时生成，所有重试共用。另一条原则：写操作超时不代表没执行，先查订单状态，再决定是否重试。

<sub>考点：副作用与幂等</sub>

</details>

---

## 代码填空题

<a name="AGT-TOOL-041"></a>

### AGT-TOOL-041　进阶 · 考频 ★★

多模型网关需要把 OpenAI Chat Completions 风格的工具定义、tool_choice 和工具调用转换成 Anthropic Messages 的格式。补全代码中的四个空。

```python
import json

def tools_to_anthropic(tools):
    return [{"name": t["function"]["name"],
             "description": t["function"]["description"],
             "____": t["function"]["parameters"]} for t in tools]

def choice_to_anthropic(choice, parallel=True):
    if isinstance(choice, dict):
        out = {"type": "tool", "name": choice["function"]["name"]}
    else:
        out = {"type": {"auto": "auto", "required": "____", "none": "none"}[choice]}
    if not parallel:
        out["____"] = True
    return out

def call_to_tool_use(call):
    return {"type": "tool_use", "id": call["id"], "name": call["function"]["name"],
            "input": ____(call["function"]["arguments"])}
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `input_schema`；(2) `any`；(3) `disable_parallel_tool_use`；(4) `json.loads`

**解析：**

四个空分别是：

1. `input_schema`：Anthropic 的工具定义用 `input_schema` 承载参数的 JSON Schema，外层也没有 `function` 包装；
2. `any`：OpenAI 的 `required`（至少调用一个工具）对应 Anthropic 的 `{"type": "any"}`；
3. `disable_parallel_tool_use`：Anthropic 的并行开关放在 tool_choice 里，对应 OpenAI 顶层的 `parallel_tool_calls: false`；
4. `json.loads`：OpenAI 的 `arguments` 是 JSON 字符串，Anthropic 的 `input` 是对象。

完整的网关还要处理消息层面的差异：system 消息提到顶层参数；连续的 tool 消息合并成一条 user 消息中的多个 `tool_result` 块（排在文本之前），错误结果映射为 `is_error`；反向转换时再拆回去。调用 id 尽量原样保留，便于日志和追踪串联。

<sub>考点：不同厂商格式、tool_choice</sub>

</details>

---

## 代码改错题

<a name="AGT-TOOL-036"></a>

### AGT-TOOL-036　进阶 · 考频 ★★

下面的函数把 OpenAI 风格的流式增量（已简化为扁平字典）拼回完整的工具调用列表。每个增量都带 `index`；某个调用的第一个增量还带 `id` 和 `name`，之后的增量只带 `arguments` 片段。单个调用时它工作正常，但模型返回两个并行调用时参数就乱了。请指出 bug 并修正。

```python
def assemble(chunks):
    calls = []
    for d in chunks:
        if "id" in d:                      # 新调用的第一个分片
            calls.append({"id": d["id"], "name": d["name"], "arguments": ""})
        calls[-1]["arguments"] += d.get("arguments", "")
    return calls
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：后续分片一律拼到 `calls[-1]`，即「最近开始的那个调用」上。两个调用的分片交错到达时，属于 `call_a` 的片段被拼进了 `call_b`：`call_a` 的参数始终是空串，`call_b` 的参数变成两段 JSON 的混合物。

**修正**：用 `index` 作为归并的键。首片记录 id 和函数名，后续片按 `index` 追加 arguments，最后按 index 排序输出：

```python
c = calls.setdefault(d["index"], {"id": "", "name": "", "arguments": ""})
c["id"] = d.get("id") or c["id"]
c["name"] = d.get("name") or c["name"]
c["arguments"] += d.get("arguments", "")
```

**修正后的代码：**

```python
def assemble(chunks):
    calls = {}
    for d in chunks:                       # 按 index 归并，而不是拼到「最近一个调用」
        c = calls.setdefault(d["index"], {"id": "", "name": "", "arguments": ""})
        c["id"] = d.get("id") or c["id"]
        c["name"] = d.get("name") or c["name"]
        c["arguments"] += d.get("arguments", "")
    return [calls[i] for i in sorted(calls)]
```

**解析：**

流式并行调用有两个特点：分片边界任意，多个调用的分片可能交错。所以要按 `index`（Anthropic 按内容块）归并，流结束后再整体 `json.loads` 和校验。

这类 bug 在单调用的测试里完全暴露不出来，必须专门构造「交错分片」的测试用例。另外，执行前还要确认流是正常结束的（停止原因为 `tool_calls`），否则最后一个调用的参数可能被截断。

<sub>考点：流式工具调用</sub>

</details>

---

## 编程题

<a name="AGT-TOOL-037"></a>

### AGT-TOOL-037　挑战 · 考频 ★★

运行时要在执行工具前校验模型给出的参数。实现一个 JSON Schema 子集的校验器：

```python
def validate(schema: dict, value, path: str = "$") -> list[tuple[str, str]]: ...
```

- 支持 `type`（`object`、`array`、`string`、`integer`、`number`、`boolean`、`null`，也可以是列表表示「任一类型」）、`enum`、`properties`、`required`、`additionalProperties: false`、`items`；
- 返回错误列表，每个错误是 `(JSON 路径, 错误类别)`，类别为 `type`、`enum`、`required`、`additional` 之一；路径形如 `$.passengers[0].age`；缺字段和多余字段的路径指向该字段本身（如 `$.date`）；
- 布尔值不算 `integer` 或 `number`；`integer` 不接受 `3.0` 这样的浮点数；
- 某个节点类型不符时只报这一条，不再深入检查其内部；错误顺序不限。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
def validate(schema, value, path="$"):
    types = schema.get("type")
    types = [types] if isinstance(types, str) else (types or [])

    def is_type(t, v):
        if t == "integer":
            return isinstance(v, int) and not isinstance(v, bool)
        if t == "number":
            return isinstance(v, (int, float)) and not isinstance(v, bool)
        return isinstance(v, {"string": str, "boolean": bool, "null": type(None),
                              "object": dict, "array": list}[t])

    if types and not any(is_type(t, value) for t in types):
        return [(path, "type")]
    if "enum" in schema and value not in schema["enum"]:
        return [(path, "enum")]
    errs = []
    if isinstance(value, dict):
        props = schema.get("properties", {})
        errs += [(f"{path}.{k}", "required") for k in schema.get("required", [])
                 if k not in value]
        if schema.get("additionalProperties") is False:
            errs += [(f"{path}.{k}", "additional") for k in value if k not in props]
        for k, v in value.items():
            if k in props:
                errs += validate(props[k], v, f"{path}.{k}")
    elif isinstance(value, list) and "items" in schema:
        for i, v in enumerate(value):
            errs += validate(schema["items"], v, f"{path}[{i}]")
    return errs
```

**测试用例：**

```python
S = {"type": "object", "additionalProperties": False,
     "required": ["flight", "date", "passengers", "cabin"],
     "properties": {
         "flight": {"type": "string"},
         "date": {"type": "string"},
         "cabin": {"type": ["string", "null"], "enum": ["economy", "business", None]},
         "passengers": {"type": "array", "items": {
             "type": "object", "additionalProperties": False, "required": ["name", "age"],
             "properties": {"name": {"type": "string"}, "age": {"type": "integer"}}}}}}
good = {"flight": "MU5101", "date": "2026-11-20", "cabin": None,
        "passengers": [{"name": "张三", "age": 30}]}
assert validate(S, good) == []
bad = {"flight": "MU5101", "cabin": "first", "vip": True,
       "passengers": [{"name": "李四", "age": True}, {"age": 6.5}, "王五"]}
assert sorted(validate(S, bad)) == sorted([
    ("$.date", "required"), ("$.vip", "additional"), ("$.cabin", "enum"),
    ("$.passengers[0].age", "type"), ("$.passengers[1].name", "required"),
    ("$.passengers[1].age", "type"), ("$.passengers[2]", "type")])
assert validate({"type": "number"}, 3) == []
assert validate({"type": "number"}, False) == [("$", "type")]
assert validate({"type": "integer"}, 3.0) == [("$", "type")]
assert validate({"type": "array", "items": {"type": "string"}}, []) == []
assert validate({"type": "array", "items": {"type": "string"}}, ["a", 1]) == [("$[1]", "type")]
assert validate(S, "not an object") == [("$", "type")]
assert validate({"type": "object", "properties": {"a": {"type": "string"}}},
                {"a": "x", "b": 1}) == []
```

**解析：**

**思路**：递归下降。

1. 先查类型：`type` 统一成列表，任一类型匹配即可。Python 中 `True` 是 `int` 的实例，判断 integer / number 时必须排除 bool，这是最常见的坑；
2. 再查 `enum`；
3. 对象：缺字段报 `required`，`additionalProperties` 为 false 时多余字段报 `additional`，再对声明过的字段递归；
4. 数组：对每个元素按 `items` 递归，路径加 `[i]`。

**为什么要自己校验**：即使服务端开了严格模式，也只覆盖 Schema 子集，且未必所有模型都支持；返回带路径的错误，回填给模型后它能精确地改正（如「`$.passengers[1].age` 应为 integer」）。生产中可以直接用 jsonschema、Pydantic 等成熟库，这里的手写版用于理解原理。

**复杂度**：$O(N)$，$N$ 为参数值的节点数。

<sub>考点：工具Schema设计、严格模式</sub>

</details>

---

<a name="AGT-TOOL-038"></a>

### AGT-TOOL-038　挑战 · 考频 ★★

发请求前，在本地校验 OpenAI Chat Completions 风格消息序列的协议不变式。实现

```python
def check_protocol(messages: list[dict]) -> list[tuple[int, str]]: ...
```

返回违规列表，每项为 `(消息下标, 类别)`，按发现顺序排列：

- `"orphan"`：tool 消息的 `tool_call_id` 不属于当前待回应的调用（从未发起，或已经回应过）；
- `"unanswered"`：在一批调用尚未全部回应时出现了非 tool 消息，下标记为该消息；序列结束时仍有未回应的调用，下标记为 `len(messages)`。报告后视为这批调用已清空；
- `"duplicate_id"`：同一条 assistant 消息里出现重复的调用 id，或与仍待回应的 id 重复，下标记为该 assistant 消息。

同一批调用的结果按 id 对应，不要求与调用顺序一致。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
def check_protocol(messages):
    errs, pending = [], set()
    for i, m in enumerate(messages):
        if m["role"] == "tool":
            if m.get("tool_call_id") not in pending:
                errs.append((i, "orphan"))
            pending.discard(m.get("tool_call_id"))
            continue
        if pending:
            errs.append((i, "unanswered"))
            pending = set()
        for c in m.get("tool_calls") or []:
            if c["id"] in pending:
                errs.append((i, "duplicate_id"))
            pending.add(c["id"])
    if pending:
        errs.append((len(messages), "unanswered"))
    return errs
```

**测试用例：**

```python
def a(*ids):
    return {"role": "assistant", "content": None,
            "tool_calls": [{"id": x, "type": "function",
                            "function": {"name": "f", "arguments": "{}"}} for x in ids]}
def t(x):
    return {"role": "tool", "tool_call_id": x, "content": "ok"}
u = {"role": "user", "content": "hi"}
s = {"role": "system", "content": "sys"}
done = {"role": "assistant", "content": "done"}
assert check_protocol([]) == []
assert check_protocol([s, u, a("c1", "c2"), t("c1"), t("c2"), done]) == []
assert check_protocol([s, u, a("c1", "c2"), t("c2"), t("c1"), u]) == []
assert check_protocol([u, a("c1", "c2"), t("c1"), u, t("c2")]) == [(3, "unanswered"), (4, "orphan")]
assert check_protocol([u, a("c1"), t("c1"), t("c1")]) == [(3, "orphan")]
assert check_protocol([u, t("x")]) == [(1, "orphan")]
assert check_protocol([u, a("c1", "c1"), t("c1")]) == [(1, "duplicate_id")]
assert check_protocol([u, a("c1")]) == [(2, "unanswered")]
assert check_protocol([u, a("c1"), t("c1"), a("c2"), t("c2"), done]) == []
```

**解析：**

**思路**：维护一个「待回应集合」`pending`。

1. assistant 消息发起调用时，把 id 加入集合；若 id 已在集合中，说明重复；
2. tool 消息必须回应集合中的某个 id，否则就是孤儿（包括重复回应同一个 id）；回应后移出集合；
3. 出现任何非 tool 消息时，集合必须已经清空，否则说明有调用没回应，或结果没有紧跟调用；
4. 序列结束时集合还不空，同样是未回应。

这三类问题正对应「每个调用恰好回应一次、结果紧跟调用、按 id 对应」几条不变式，违反时真实 API 多半直接返回 400。并行调用、错误处理、中途插入用户消息时最容易出错，在发请求前跑一遍能把问题拦在本地，并给出精确的定位。复杂度 $O(L)$，$L$ 为消息数。

<sub>考点：工具结果回填、并行工具调用</sub>

</details>

---

<a name="AGT-TOOL-047"></a>

### AGT-TOOL-047　挑战 · 考频 ★★

实现 Agent 工具层的结果缓存：

```python
class ToolCache:
    def __init__(self, specs: dict, clock=time.monotonic): ...
    def call(self, user: str, tool: str, args: dict, fn) -> tuple[object, bool]: ...
```

- `specs[tool]` 描述每个工具：`{"mode": "read", "ttl": 秒数, "key": 参数名}` 或 `{"mode": "write", "key": 参数名}`。`key` 可以省略，它指出哪个参数标识被读写的资源（如 `"path"`），资源即 `args[key]`。
- `call` 执行 `fn(**args)` 或返回缓存，返回 `(结果, 是否命中缓存)`。
- **读工具**：缓存键为 `(user, tool, 规范化后的参数)`，参数键的顺序不影响；条目的存活时间（两次 `clock()` 之差）**小于** `ttl` 时命中，否则重新执行并覆盖。执行抛异常时直接抛出，不写缓存。
- **写工具**：从不缓存。无论执行成功还是抛异常，都要先失效相关缓存：有 `key` 时，删除所有用户、所有工具中资源等于 `args[key]` 的条目；没有 `key` 时清空全部缓存。之后返回结果（命中标志为 `False`）或抛出原异常。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import json
import time


class ToolCache:
    def __init__(self, specs, clock=time.monotonic):
        self.specs, self.clock = specs, clock
        self.store = {}                    # (user, tool, 规范化参数) -> (结果, 写入时刻, 资源)

    def call(self, user, tool, args, fn):
        spec = self.specs[tool]
        res = args.get(spec["key"]) if "key" in spec else None
        if spec["mode"] == "write":
            try:
                return fn(**args), False
            finally:                       # 无论成功还是抛异常，都先失效相关缓存
                self._invalidate(res)
        k = (user, tool, json.dumps(args, sort_keys=True, ensure_ascii=False))
        hit = self.store.get(k)
        if hit is not None and self.clock() - hit[1] < spec["ttl"]:
            return hit[0], True
        out = fn(**args)                   # 读失败时异常直接抛出，不写缓存
        self.store[k] = (out, self.clock(), res)
        return out, False

    def _invalidate(self, res):
        if res is None:                    # 不知道写了什么：保守地清空全部
            self.store.clear()
        else:
            self.store = {k: v for k, v in self.store.items() if v[2] != res}
```

**测试用例：**

```python
class Clock:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t


specs = {
    "read_file": {"mode": "read", "ttl": 60, "key": "path"},
    "grep": {"mode": "read", "ttl": 60, "key": "path"},
    "edit_file": {"mode": "write", "key": "path"},
    "rate": {"mode": "read", "ttl": 10},
    "reset_all": {"mode": "write"},
}
files, n = {"a.py": "v1", "b.py": "x"}, {"read": 0}


def read_file(path):
    n["read"] += 1
    return files[path]


def grep(path, pattern):
    return str(pattern in files[path])


def edit_file(path, text):
    files[path] = text
    return "ok"


clk = Clock()
c = ToolCache(specs, clk)
assert c.call("u1", "read_file", {"path": "a.py"}, read_file) == ("v1", False)
assert c.call("u1", "read_file", {"path": "a.py"}, read_file) == ("v1", True)
assert n["read"] == 1
# 不同用户不共享缓存
assert c.call("u2", "read_file", {"path": "a.py"}, read_file) == ("v1", False)
# 参数键序不同仍然命中
assert c.call("u1", "grep", {"path": "a.py", "pattern": "v"}, grep) == ("True", False)
assert c.call("u1", "grep", {"pattern": "v", "path": "a.py"}, grep) == ("True", True)
# 写操作失效同一资源的全部读缓存（含其他工具、其他用户），不影响别的资源
assert c.call("u1", "read_file", {"path": "b.py"}, read_file) == ("x", False)
assert c.call("u1", "edit_file", {"path": "a.py", "text": "v2"}, edit_file) == ("ok", False)
assert c.call("u1", "read_file", {"path": "a.py"}, read_file) == ("v2", False)
assert c.call("u2", "read_file", {"path": "a.py"}, read_file) == ("v2", False)
assert c.call("u1", "grep", {"path": "a.py", "pattern": "v"}, grep)[1] is False
assert c.call("u1", "read_file", {"path": "b.py"}, read_file) == ("x", True)
# TTL：存活时间达到 ttl 即过期
rates = iter(["7.1", "7.2"])
fx = lambda cur: next(rates)
assert c.call("u1", "rate", {"cur": "USD"}, fx) == ("7.1", False)
clk.t = 9.9
assert c.call("u1", "rate", {"cur": "USD"}, fx) == ("7.1", True)
clk.t = 10.0
assert c.call("u1", "rate", {"cur": "USD"}, fx) == ("7.2", False)
# 读失败不写缓存
tries = []


def flaky(path):
    tries.append(path)
    if len(tries) == 1:
        raise IOError("down")
    return "ok"


try:
    c.call("u1", "read_file", {"path": "c.py"}, flaky)
    raise AssertionError("应当抛出 IOError")
except IOError:
    pass
assert c.call("u1", "read_file", {"path": "c.py"}, flaky) == ("ok", False)
# 写失败也要失效（失败的写可能已经部分生效）
assert c.call("u1", "read_file", {"path": "b.py"}, read_file)[1] is True


def bad_edit(path, text):
    raise IOError("磁盘已满")


try:
    c.call("u1", "edit_file", {"path": "b.py", "text": "y"}, bad_edit)
    raise AssertionError("应当抛出 IOError")
except IOError:
    pass
assert c.call("u1", "read_file", {"path": "b.py"}, read_file)[1] is False
# 没有 key 的写操作保守地清空全部缓存
c.call("u1", "rate", {"cur": "EUR"}, lambda cur: "8.0")
c.call("u1", "reset_all", {}, lambda: "done")
assert c.call("u1", "rate", {"cur": "EUR"}, lambda cur: "8.1") == ("8.1", False)
```

**解析：**

**设计要点**：

1. **键里必须有用户**：同一个查询对不同用户可能返回不同的数据，不按用户隔离会造成越权。参数用 `json.dumps(..., sort_keys=True)` 规范化，键序不同的同一调用才能命中。
2. **按资源失效**：读工具与写工具通过「资源」关联起来。`read_file(a.py)` 和 `grep(a.py)` 读的是同一个资源，`edit_file(a.py)` 之后两者都要失效，而且对**所有用户**都要失效，因为文件是共享的。只按「同一个工具」失效会漏掉 `grep` 这类间接读取。
3. **失败的写也要失效**：写操作可能已经部分生效（写了一半、或者服务端已提交但响应超时），继续使用旧缓存就会读到错误的状态。用 `try/finally` 保证无论成败都先失效。
4. **不知道写了什么就全部清空**：宁可多失效，也不返回陈旧数据。
5. **不缓存失败的读**：瞬时故障被缓存下来，会在 TTL 内持续「复现」故障。
6. **可注入时钟**：把 `clock` 作为参数传入，测试就能精确控制时间、验证 TTL 边界，这是测试时间相关逻辑的常用技巧。

**局限**：缓存层只能看到经由它执行的写。通过 Bash 修改文件、其他进程或人在 IDE 中的修改，它都感知不到，所以文件类缓存在命中前还应校验修改时间或内容哈希。本地读文件本身很便宜，生产中缓存更多用在昂贵或限流严格的远程查询上。

<sub>考点：工具结果缓存、副作用与幂等　｜　出处：MCP 规范 2026-07-28（Caching）</sub>

</details>

---

## 简答题

<a name="AGT-TOOL-030"></a>

### AGT-TOOL-030　进阶 · 考频 ★★★

Function Calling 的原理是什么？模型真的在执行函数吗？它是怎么学会输出工具调用的？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **模型不执行任何函数**：它只按约定格式输出「调用哪个函数、参数是什么」；应用解析、校验参数、检查权限后执行，再把结果作为新消息回填，模型据此继续生成或给出最终回答。执行权永远在应用，所以权限检查、确认与审计都在应用侧。
2. **一次往返**：请求带 messages 和 tools（名称、描述、参数的 JSON Schema）→ 模型返回带调用的 assistant 消息（停止原因 `tool_calls` / `tool_use`）→ 应用执行 → 先追加 assistant 消息、再为每个调用追加结果 → 再次请求。
3. **怎么学会的**：
   - 渲染：聊天模板把工具定义序列化进提示词（通常在系统提示词里），所以工具定义每次请求都占 token；
   - 训练：SFT 数据中 assistant 回合用约定格式（如 `<tool_call>` 标记包裹的 JSON）写出调用，计入 loss；工具返回不计 loss。数据要覆盖不需要工具时直接回答、参数缺失时追问、并行调用、出错后修正。之后再用强化学习在多步工具任务上优化。Toolformer 是早期的自监督尝试；
   - 解析：推理服务的工具解析器识别调用标记，转成 API 里的 `tool_calls`；严格模式下再叠加约束解码。
4. **推论**：工具描述的质量直接影响调用准确率；模型对训练时见过的调用格式最熟悉；没有原生 FC 的模型也能用提示词约定格式来调用工具，只是可靠性差一些。

**评分要点（共 10 分）：**

- 明确模型只输出调用意图、执行权在应用，并说出由此带来的安全含义（3 分）
- 说清一次完整的消息往返（2 分）
- 说清模板渲染、SFT 数据（调用计 loss、返回不计 loss）与推理解析（4 分）
- 给出至少一条推论，如描述影响准确率、无原生 FC 也可用提示词实现（1 分）

**讲解：**

**常见失分点**：说「模型调用了 API」却不补充执行权在应用；把 Function Calling 说成 API 层的规则匹配；说不出训练数据要覆盖「不调用」和「追问」的情况；不知道工具定义会占用上下文 token。

<sub>考点：Function Calling原理</sub>

</details>

---

<a name="AGT-TOOL-031"></a>

### AGT-TOOL-031　进阶 · 考频 ★★

并行工具调用有哪些坑？请分别从协议层面和执行层面回答，并说明如何应对。

<details>
<summary>答案与解析</summary>

**参考答案：**

**协议层面**（违反就会被 API 拒绝）：

1. 每个调用恰好回应一次：失败、超时、被拒绝也要回一条说明，不能漏、不能重复；
2. 结果紧跟调用：OpenAI 的 tool 消息要连续跟在发起调用的 assistant 消息之后；Anthropic 要把全部 `tool_result` 放在紧随其后的同一条 user 消息里，排在文本之前；
3. 按 id 对应：不能有孤儿结果，也不能张冠李戴；
4. 调用消息原样保留，不要改 id、函数名和参数。

**执行层面**：

1. 有依赖的调用被并行发出：后一个调用需要前一个的结果时，只会拿到空值或瞎猜的参数。在描述里写明依赖，必要时关闭并行；
2. 写操作并发冲突或重复执行：两个写操作可能互相覆盖；写操作带幂等键，必要时串行；
3. 一次扇出太多打爆下游：用信号量限制并发数，按下游限流；
4. 一个慢调用拖住整轮：每个调用单独设超时，超时就回填超时错误，不影响其他调用；
5. 结果合起来撑爆上下文：在工具层分页、截断，或只返回指针。

**补充**：「并行」是指模型在一条消息里提出多个调用，是否并发执行由应用决定。

**评分要点（共 10 分）：**

- 说出「恰好回应一次、结果紧跟调用、按 id 对应」等协议不变式（3 分）
- 说明两家格式在回填位置上的差异（2 分）
- 列出依赖、写操作冲突、限流、超时、上下文膨胀中的至少三项执行风险（3 分）
- 给出相应的应对措施（2 分）

**讲解：**

**常见失分点**：只答「要并发执行」；不知道失败也要回填；把 Anthropic 的多个结果拆到多条消息里；以为「并行」意味着工具一定被并发执行。能在发请求前用协议校验函数把错误拦在本地，是工程上的加分项。

<sub>考点：并行工具调用、工具结果回填</sub>

</details>

---

<a name="AGT-TOOL-032"></a>

### AGT-TOOL-032　挑战 · 考频 ★★

工具调用的严格模式（strict）是怎么保证参数合法的？使用它要遵守哪些 Schema 限制？既然服务端已经保证了合法，为什么应用侧仍然要做校验？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **原理**：服务端把工具的 JSON Schema 编译成语法（如有限状态机或上下文无关文法），生成参数时用约束解码在每一步屏蔽不合法的 token，因此输出一定能通过 Schema 校验。与结构化输出是同一套技术，一个约束工具参数，一个约束最终回复。
2. **Schema 限制**（以 OpenAI 为例）：
   - 每一层 object 都要写 `additionalProperties: false`；
   - 所有字段都列进 required，可选字段写成「某类型或 null」，由模型显式传 null，执行时再把 null 换成默认值；
   - 只支持 JSON Schema 的一个子集，数值范围、字符串长度与格式、递归结构等关键字的支持程度各家不同；
   - 新 Schema 第一次使用时有编译开销，之后缓存。
3. **为什么还要校验**：
   - 只保证格式不保证语义：日期合法但已过去、ID 合法但无权访问、金额合法但超出余额；
   - 不受支持的约束只能在客户端检查；
   - 不是所有模型、所有路径都开了严格模式，网关也可能接入不支持严格模式的模型；
   - 权限与业务规则本来就该由执行方把关，不能依赖模型的输出。

**评分要点（共 10 分）：**

- 说清约束解码保证格式合法的原理（3 分）
- 列出 additionalProperties、全部 required 与可空、子集限制、首次编译开销等限制中的至少三项（3 分）
- 说明可选参数如何表达及执行时如何还原默认值（1 分）
- 给出仍需应用侧校验的理由，尤其是语义与权限（3 分）

**讲解：**

**常见失分点**：认为开了严格模式就可以省掉校验；不知道可选字段要写成可空并放进 required；说不出严格模式与结构化输出的关系。追问「可选参数为什么要放进 required」时，要答出：约束解码要求结构确定，「可选」用允许 null 来表达。

<sub>考点：严格模式</sub>

</details>

---

<a name="AGT-TOOL-033"></a>

### AGT-TOOL-033　进阶 · 考频 ★★★

工具描述和参数 Schema 怎么写，模型才不容易用错？请给出你的原则，并说明如何验证改进是否有效。

<details>
<summary>答案与解析</summary>

**参考答案：**

把工具定义当成写给一位聪明、但第一天上班、又没法当面提问的新同事看的说明书：

1. **按任务设计粒度，不照搬后端接口**：与其暴露 list_users、list_events、create_event，不如提供一个 schedule_event；经常被连续调用的工具考虑合并，调用链越短越不容易出错。
2. **命名有区分度**：动词 + 对象（search_orders），接多个服务时加命名空间前缀（github_create_issue、jira_create_ticket）。
3. **描述写清四件事**：做什么、什么时候用、什么时候**不该**用（相似工具互相指路）、返回什么；可以写上用户的常见说法，同时帮助工具检索召回。
4. **参数让错误「写不出来」**：能枚举的用 enum；写清格式与单位（YYYY-MM-DD、元）并给示例；参数名自解释（user_id 而不是 user）；程序已知的信息（当前用户、当前时间）由程序填；`additionalProperties: false`。
5. **防呆设计**：例如 Anthropic 在 SWE-bench Agent 中把文件工具改成只接受绝对路径，相关错误随即消失。
6. **返回精简、错误可行动**：只返回下一步需要的字段，长结果分页或截断并说明如何取下一页；用可读名称代替长 UUID；出错时说清哪里错、正确的样子和下一步怎么做。
7. **标注副作用**：区分只读、会修改、会删除、能否安全重试，供运行时决定是否需要确认。

**验证**：用一批真实任务（含边界和不该调用的情况）跑回归评测，统计选错工具率、参数错误率、无效重试次数和任务成功率，对比修改前后；上线后从日志中挖掘高频错误，持续迭代描述。描述也不是越长越好，每次请求都要发送，只写影响选择和填参的信息。

**评分要点（共 10 分）：**

- 提到按任务设计粒度、命名区分度（2 分）
- 描述写清何时用与何时不用（2 分）
- 参数设计：enum、格式示例、自解释命名、程序已知信息不让模型填（2 分）
- 返回精简、错误可行动、标注副作用（2 分）
- 给出评测驱动的验证方法（2 分）

**讲解：**

**常见失分点**：只写一句「查询订单」；把后端接口文档原样贴进描述；错误只回状态码；没有验证方法，全凭感觉改描述。Anthropic 提到做 SWE-bench Agent 时，花在优化工具上的时间比优化整体提示词还多，可见工具设计的分量。

<sub>考点：工具描述写法、工具Schema设计</sub>

</details>

---

<a name="AGT-TOOL-034"></a>

### AGT-TOOL-034　进阶 · 考频 ★★★

多步工具调用中出错了怎么办？请对常见的工具错误分类，并分别说明处理方式；再说明错误信息应当如何回填给模型。

<details>
<summary>答案与解析</summary>

**参考答案：**

**原则**：先分类再处理；所有错误都转成观察回填，不让异常打断 Agent 循环。

| 错误类型 | 例子 | 处理方式 |
|---|---|---|
| 参数错误 | 日期格式不对、枚举值非法、缺必填参数 | 不重试；把校验错误回填，让模型改参数 |
| 暂时性错误 | 超时、限流 429、5xx | 指数退避加随机抖动后重试，设次数上限；仍失败就回填并建议换方案 |
| 业务错误 | 余票不足、城市不存在 | 回填原因和可选项，让模型换方案或追问用户 |
| 权限与安全 | 无权访问、操作被拒 | 不重试；告知用户或升级给人 |
| 写操作结果未知 | 下单请求超时，不知道成没成 | 先查状态，或带同一个幂等键重试，避免重复下单 |

**回填方式**：

1. 每个调用都要有结果，错误也不例外（Anthropic 可以标记 `is_error`）；
2. 错误信息要**可行动**：说清哪里错、正确的样子、下一步怎么做。例如「date 应为 YYYY-MM-DD，收到 11/20；今天是 2026-11-15」远好于「400 Bad Request」或一整段堆栈；
3. 对重复失败做循环检测：同一调用连续失败几次就提醒模型换思路，再不行就停止并升级给人；
4. 前面步骤已经产生的副作用要能补偿，例如占座后支付失败就释放座位。

**评分要点（共 10 分）：**

- 给出参数、暂时性、业务、权限、写操作结果未知等至少四类错误（4 分）
- 为每类给出正确的处理方式，尤其是确定性错误不重试、写操作超时先查状态或用幂等键（3 分）
- 说明错误要回填且信息可行动（2 分）
- 提到重复失败的检测或副作用补偿（1 分）

**讲解：**

**常见失分点**：把所有错误都重试三次（确定性错误重试一百次结果也一样）；写操作超时直接重试；工具出错时抛异常中断循环；回填的错误只有状态码，模型只能原样重试。

<sub>考点：错误处理与重试、工具结果回填</sub>

</details>

---

<a name="AGT-TOOL-035"></a>

### AGT-TOOL-035　进阶 · 考频 ★★★

一个 Agent 要接入上百个工具，全部放进上下文会有什么问题？有哪些应对方法？如何评估效果？

<details>
<summary>答案与解析</summary>

**参考答案：**

**问题**：

1. 固定开销大：100 个工具、每个约 300 token，每次请求就是 3 万 token，并在每一步重复付费；
2. 选择准确率下降：相似工具互相干扰，模型更容易选错或编造参数；
3. 注意力被稀释，挤占任务本身需要的上下文。

**应对方法**：

1. **工具检索**：用名称、描述和用户常见说法建索引（BM25、向量或混合检索），每个任务开始时选出 Top-k，再加几个常驻工具；
2. **分层路由**：先选服务或类别，再在类别内选工具；
3. **工具搜索元工具**：给模型一个 search_tools，让它按需发现工具；有的 API 支持把工具标记为延迟加载，被搜到后才展开完整定义；
4. **按状态开放**：工作流的不同阶段只开放相关工具；
5. **调用多、数据大的场景改用代码方式调用**：让模型写代码批量调用工具，按需读取 API 定义。

**关键细节**：

- 描述里写用户的说法，召回率才高；
- 不要每一轮都重新检索并替换整个工具列表：工具定义位于提示词前部，改动会让前缀缓存失效，历史里用过的工具还会「凭空消失」。应在任务开始时选定，中途需要新工具时以追加方式加载。

**评估**：离线看工具检索的 Recall@k（首要指标）；在线看任务成功率、选错工具率、「找不到合适工具」的比例、每次请求的工具 token 数和缓存命中率。

**评分要点（共 10 分）：**

- 说出 token 开销、选择准确率下降等问题（2 分）
- 给出检索 Top-k、分层路由、搜索元工具等至少三种方法（3 分）
- 指出描述中写用户说法以提高召回（2 分）
- 指出不应中途替换工具列表以保护缓存（2 分）
- 给出以召回率为首的评估指标（1 分）

**讲解：**

**常见失分点**：只说「用向量检索」，不提召回率；每一轮都重新检索、替换工具列表，导致缓存失效；不知道工具描述本身的写法对检索效果影响很大，往往比换检索算法更明显。

<sub>考点：工具检索</sub>

</details>

---

<a name="AGT-TOOL-049"></a>

### AGT-TOOL-049　进阶 · 考频 ★★

面试官问：「你们的 Agent 用了哪些缓存？」候选人提到了工具结果缓存、Prompt Caching、语义缓存，还把幂等键也算作一种「缓存」。请分别说明这四种机制缓存（或去重）的对象是什么、位于哪一层、键是什么、主要风险是什么；再说明在一个电商客服 Agent 中如何组合使用它们。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **工具结果缓存**：
   - 对象：只读工具的执行结果；位于 Agent 的工具层或工具网关；
   - 键：工具名 + 规范化参数 + 用户 / 租户范围；
   - 收益：降低延迟、下游费用与限流压力；
   - 风险：数据陈旧、跨用户越权、误缓存有副作用的工具。需要 TTL 和写后失效。
2. **Prompt Caching**：
   - 对象：提示词前缀的计算结果（KV），由模型服务商在推理侧缓存；
   - 键：逐 token 完全相同的前缀；
   - 特点：模型「看到」的内容不变，只省输入费用和首 token 延迟，不存在数据陈旧问题；
   - 风险：前缀不稳定（时间戳、工具定义顺序变化）导致命中率低。
3. **语义缓存**：
   - 对象：整个回答；位于应用入口，在调用模型之前；
   - 键：用户问题的向量，相似度超过阈值即命中；
   - 风险：相似但不同的问题拿到错误的答案（如「退款」与「退货」），个性化或带权限的回答被串用，答案过时。只适合通用 FAQ，阈值要高，并且只用于不含个人数据的回答。
4. **幂等键**：
   - 对象：不是缓存读结果，而是让写操作「多次请求、只生效一次」；去重发生在服务端；
   - 键：每个业务操作生成一次（如订单号 + 操作类型），所有重试复用同一个键；服务端记录键对应的结果，重复请求直接返回首次的结果；
   - 风险：每次重试都生成新键，等于没有幂等；键的作用范围设计错误，导致不同的操作被误判为重复。
5. **在电商客服 Agent 中的组合**：
   - 稳定的系统提示与工具定义放在最前面，吃满 Prompt Caching；
   - 「运费怎么算」「几天能到」等通用政策问题走语义缓存，阈值高，并且不缓存个人信息；
   - 订单、物流查询用工具结果缓存：按用户隔离、TTL 短（如一分钟），用户修改地址等操作之后立即失效；
   - 退款、取消订单等写操作绝不缓存，统一带幂等键。
   - 监控各层命中率，以及「陈旧数据导致错误回答」的事件数。

**评分要点（共 10 分）：**

- 正确说明工具结果缓存的对象、键与失效要求（2 分）
- 正确说明 Prompt Caching 只省计算、不改变模型看到的内容，以及前缀稳定性的要求（2 分）
- 正确说明语义缓存的键与误命中风险（2 分）
- 指出幂等键是服务端的写去重，重试必须复用同一个键（2 分）
- 给出合理的组合方案，按数据敏感度与读写属性分流（2 分）

**讲解：**

**常见失分点**：把 Prompt Caching 说成「缓存了模型的回答」；不知道语义缓存会误命中；把幂等键理解为客户端缓存，或者以为每次重试都要换新键；工具结果缓存的键里不放用户。四者的本质区别在于：Prompt Caching 只省计算，语义缓存与工具结果缓存会**返回旧的内容**，幂等键保证**写操作只生效一次**。

<sub>考点：工具结果缓存、副作用与幂等</sub>

</details>

---

<a name="AGT-TOOL-052"></a>

### AGT-TOOL-052　进阶 · 考频 ★★★

面试官连续追问：「Function Calling 和『提示词里约定格式、再用正则解析输出』有什么本质区别？Function Calling 和约束解码（结构化输出）又是什么关系？既然有了约束解码，还需要专门训练模型做工具调用吗？」请回答。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **共同点**：两者都是让模型生成一段表示「调用哪个工具、传什么参数」的文本；「要不要调用、调用哪个、参数填什么」始终由模型决定，函数都由应用执行。
2. **与「提示词 + 正则」的本质区别**：
   - **训练**：FC 模型在后训练中专门学过工具调用：何时调用、如何按 Schema 填参、并行调用、读懂工具结果。「提示词 + 正则」只能依赖模型临场遵守格式说明，格式越复杂越容易出错；
   - **协议**：FC 由服务端解析，返回结构化的 `tool_calls`（带调用 id），天然支持并行调用、按 id 回填结果、流式增量；正则解析要自己处理代码围栏、转义、半截输出、模型「顺嘴」编造观察等问题；
   - **通道分离**：调用与给用户看的文本分开，不会把调用格式漏给用户，也便于做权限校验和审计；
   - **可保证性**：FC 可以叠加严格模式，用约束解码保证参数合法；正则只能事后发现错误再重试。
3. **与约束解码的关系**：二者是互补的两层。
   - FC 负责「语义决策」：调不调、调哪个、参数取什么值；
   - 约束解码负责「语法保证」：把 JSON Schema 编译成语法，生成时屏蔽不合法的 token，保证输出可以解析、满足类型与必填要求；
   - 严格模式 = FC + 对参数做约束解码。
4. **为什么仍然需要训练**：约束解码只保证格式，不保证内容。工具选错、参数值编错（如编造订单号）、该问用户却直接调用，这些都约束不了。而且在一个不会调用工具的模型上强行约束，它会生成格式正确、内容荒谬的调用。此外，约束解码对 Schema 的写法有限制，字段顺序不当（例如先输出结论、后输出推理）还可能损害质量。
5. **「提示词 + 正则」仍然有用的场景**：模型或服务不支持 FC；ReAct 等文本格式的 Agent；以代码作为动作（CodeAct）。此时要配合停止词、解析失败后回填错误让模型重试等兜底措施。

**评分要点（共 10 分）：**

- 指出两者都是文本生成，决策都在模型（1 分）
- 从训练、协议与结构化接口、并行与回填等方面说明与「提示词 + 正则」的区别（3 分）
- 说明 FC 负责语义决策、约束解码负责语法保证，严格模式是二者结合（3 分）
- 说明约束解码不能替代训练：只保证格式、不保证内容（2 分）
- 提到「提示词 + 正则」仍然适用的场景或兜底手段（1 分）

**讲解：**

**常见失分点**：说「FC 是模型直接调用函数」；以为有了约束解码，模型选错工具的问题也一起解决了；只说「FC 更稳定」，讲不出稳定在哪里（训练、协议、约束）。一句话总结：训练让模型「想得对」，约束解码让输出「写得对」，结构化接口让应用「接得住」。

<sub>考点：Function Calling原理、严格模式</sub>

</details>

---

## 场景分析题

<a name="AGT-TOOL-042"></a>

### AGT-TOOL-042　进阶 · 考频 ★★★

下面是某电商客服 Agent 的工具定义（OpenAI 风格，只列出 function 部分）。请指出其中的问题，并给出改进后的设计思路。

```json
[
  {"name": "query", "description": "查询接口",
   "parameters": {"type": "object", "properties": {
     "q": {"type": "string"}, "t": {"type": "string"}}}},
  {"name": "order", "description": "订单操作，op 可以是 create、cancel、refund",
   "parameters": {"type": "object", "properties": {
     "op": {"type": "string"},
     "user_id": {"type": "string", "description": "用户 ID"},
     "order_id": {"type": "string"},
     "amount": {"type": "number"},
     "date": {"type": "string"}}}},
  {"name": "get_logs", "description": "返回服务器的全部日志",
   "parameters": {"type": "object", "properties": {}}}
]
```

<details>
<summary>答案与解析</summary>

**参考答案：**

**问题诊断**：

1. **query**：名字和描述都没有信息量，模型不知道它查什么、何时该用；参数 `q`、`t` 不自解释，没有格式说明，也没有 required。
2. **order**：
   - 把只读与写操作、可逆与不可逆操作揉进一个工具，`op` 还是自由文本，没有 enum；
   - `user_id` 交给模型填写：模型可能填错，也可能被注入篡改，从而操作别人的订单；
   - `amount` 没有单位（元还是分），`date` 没有格式；没有 required，也没有 `additionalProperties: false`；
   - 创建、退款等写操作没有幂等保护，也没有标注需要用户确认。
3. **get_logs**：返回全部日志会撑爆上下文，没有时间范围、级别、关键词等过滤条件，也没有分页或截断。
4. **整体**：没有命名空间和统一的命名规范；描述里没有「何时不该用」；没有约定出错时返回什么。

**改进设计**：

1. 按任务和副作用拆分：`orders_search`（按状态、时间搜索当前用户的订单，返回摘要）、`orders_get`（按订单号查详情）为只读；`order_cancel`、`order_refund` 为写操作，标注为需要用户确认的破坏性操作。
2. 当前用户身份由程序从登录态注入，不出现在参数里；工具层按登录身份做权限校验。
3. 参数：`status` 用 enum；`amount` 写明单位（如「单位：元，最多两位小数」）；日期写明 YYYY-MM-DD 并给示例；列出 required，设 `additionalProperties: false`，必要时开启严格模式。
4. 写操作由运行时生成并注入幂等键（绑定会话、订单与动作），重试时复用；执行前由状态机要求用户确认金额与订单。
5. 日志工具改为 `logs_search(level, since, until, keyword, limit=50, cursor)`，默认只返回少量匹配行，结果过长时截断并给出下一页的游标。
6. 描述写清做什么、何时用、何时改用别的工具、返回哪些字段；错误信息可行动，例如「date 应为 YYYY-MM-DD，收到 11/20」。

**评分要点（共 10 分）：**

- 指出 query 的名称、描述、参数缺乏信息量（2 分）
- 指出 order 混合读写、op 无 enum、user_id 由模型填写等问题（3 分）
- 指出 get_logs 返回过大、缺少过滤与分页（1 分）
- 给出按副作用拆分、身份由程序注入、幂等键与确认等改进（3 分）
- 给出参数规范与可行动的错误信息（1 分）

**讲解：**

**常见失分点**：只改描述文字，不改工具粒度；没发现 `user_id` 由模型填写带来的越权风险；忽视写操作的幂等与确认；对返回过大的工具只说「让模型少调用」。挑毛病时可以按「名字 → 描述 → 参数 → 返回 → 副作用 → 错误」的顺序逐项检查。

<sub>考点：工具描述写法、工具Schema设计、副作用与幂等</sub>

</details>

---

<a name="AGT-TOOL-043"></a>

### AGT-TOOL-043　挑战 · 考频 ★★

某企业助手把接入的工具从 15 个一次性扩充到 120 个（全部放进每次请求）。上线一周后日志显示：

1. 约 6% 的调用使用了不存在的工具名，例如调用 `get_user_info`，而实际的工具是 `crm_get_customer`；
2. 不少调用编造了参数，例如给 `crm_get_customer` 传了并不存在的 `customer_name` 参数；
3. 功能相近的工具经常选错；
4. 每次请求的输入 token 增加到原来的约 5 倍，延迟明显上升。

请分析原因并给出改进方案，包括如何验证改进效果。

<details>
<summary>答案与解析</summary>

**参考答案：**

**原因分析**：

1. **工具过多**：120 个工具的定义每次都要发送，固定开销大；相似工具互相干扰、注意力被稀释，选错和编造的概率随之上升。
2. **API 幻觉**：模型倾向于按训练中常见的命名习惯「猜」工具名和参数名（`get_user_info`、`customer_name`）；工具命名不统一、缺少命名空间时更严重。
3. **缺少执行前校验与可行动的反馈**：编造的工具名和参数没有被拦下并给出纠正提示，或者错误信息无法帮助模型改正。
4. **描述区分度不够**：相似工具没有写清各自的使用时机和「何时不该用」。

**改进方案**：

1. **按需加载工具**：每个任务开始时用检索选 Top-k 工具，加上少量常驻工具；工具天然分组时先路由到类别；保留一个 search_tools 元工具兜底。工具集在任务内保持稳定，需要新工具时追加，以保住前缀缓存。
2. **规范命名与描述**：统一「服务前缀 + 动词 + 对象」的命名；描述写清用途、触发条件、何时改用其他工具，并写入用户的常见说法以提升检索召回。
3. **执行前校验**：未知工具名时，返回「不存在 get_user_info，相近的可用工具有 crm_get_customer……」；未知参数返回该工具的参数说明；能开启严格模式的工具开启严格模式，保证参数符合 Schema。
4. **把文档放到模型眼前**：对易错工具在描述中给出调用示例；接口变更时同步更新描述。

**验证**：

- 离线：构造覆盖相似工具、无关请求（应当不调用）、多工具任务的评测集，统计工具选择正确率、无效工具名率、无效参数率、无关检测正确率；检索模块单独看 Recall@k；
- 在线：监控无效调用率、每次请求的工具 token 数与缓存命中率、任务成功率和延迟，并与扩充前对比。

**评分要点（共 10 分）：**

- 指出工具过多导致的开销与干扰（2 分）
- 用 API 幻觉解释编造工具名与参数，并指出命名与描述问题（2 分）
- 给出工具检索或分层路由，并注意缓存（2 分）
- 给出执行前校验与可行动错误、严格模式等措施（2 分）
- 给出离线与在线的验证指标，包括召回率与无关检测（2 分）

**讲解：**

**常见失分点**：只想到「换个更强的模型」；每轮都重新检索并替换工具列表，导致缓存失效、历史中的工具「消失」；只做拦截不给纠正提示，模型只能反复试错；不评估检索的召回率，漏召回时模型根本看不到正确工具。

<sub>考点：API幻觉、工具检索、工具描述写法</sub>

</details>

---

<a name="AGT-TOOL-044"></a>

### AGT-TOOL-044　挑战 · 考频 ★★

某电商客服 Agent 有一个退款工具 `refund(order_id, amount)`。为提升体验，团队开启了并行工具调用，并给所有工具加上了「超时自动重试 3 次」。上线后财务发现部分订单被重复退款 2～3 次。排查发现：

1. 退款接口的 P99 延迟约 8 秒，而客户端超时设置为 5 秒；
2. 偶尔模型在同一条消息里对同一订单发出了两个相同的退款调用。

请分析原因，并给出系统性的修复方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**原因分析**：

1. **写操作被盲目重试**：超时只说明「没等到响应」，不代表没执行。退款接口经常在 5 到 8 秒之间完成，客户端已超时并重试，于是同一笔退款被执行多次。
2. **没有幂等键**：服务端无法识别重复请求。
3. **并行调用中的重复写**：模型在一条消息里发出了两个相同的退款调用，执行层照单全收、并发执行。
4. **缺少业务护栏**：退款这种资金操作没有状态机约束（同一订单只能退一次、金额不超过可退金额），也没有用户确认环节。

**修复方案**：

1. **幂等**：运行时在一次逻辑退款开始时生成幂等键（如会话 ID + 订单号 + 动作），所有重试复用同一个键；服务端按键去重，见过的键直接返回第一次的结果。
2. **分类重试**：只读工具可以自动重试；写操作超时先查询退款状态，确实不确定时才带同一个键重试，并限制次数。
3. **合理设置超时**：根据接口延迟分布设置超时（高于 P99 并留余量）；长耗时操作改为异步提交 + 查询状态。
4. **执行层去重与串行**：同一批调用中，参数完全相同的写操作只执行一次，并对多余的调用回填「重复请求已忽略」；对写操作关闭并行，或按订单加锁串行执行。
5. **业务约束与确认**：退款前校验订单状态和可退金额，由状态机保证同一订单不会重复退款；金额较大或首次退款需要用户确认。
6. **善后与监控**：对已经发生的重复退款对账、追回或补偿；监控重复退款率（目标为 0）、写操作超时率、重试次数；用故障注入测试（「服务端成功但响应丢失」）验证修复。

**评分要点（共 10 分）：**

- 指出写操作超时后盲目重试是根因，且超时不代表未执行（2 分）
- 提出幂等键：一次逻辑操作一个键、重试复用、服务端去重（2 分）
- 提出写操作先查状态、分类重试、合理超时（2 分）
- 提出同批调用去重、写操作串行或加锁（2 分）
- 提出业务约束、用户确认、对账补偿与监控测试（2 分）

**讲解：**

**常见失分点**：只把超时调长；只在提示词里要求模型「不要重复退款」；幂等键每次重试都重新生成；忽视并行调用带来的重复写。核心原则：**有副作用的工具，重试的安全性必须由系统保证（幂等键 + 状态检查），而不是由模型或运气保证**。

<sub>考点：副作用与幂等、错误处理与重试、并行工具调用</sub>

</details>

---

<a name="AGT-TOOL-050"></a>

### AGT-TOOL-050　挑战 · 考频 ★★

某客服 Agent 的线上日志暴露了三个现象：

1. 同一会话中，`search_orders(user_id="u1", status="refunding")` 以完全相同的参数被调用了 9 次，每次都返回 `[]`；
2. 另一个会话中，`get_export_status(job_id=42)` 被连续调用了 6 次，返回的进度从 10% 涨到 100%，产品经理把它也统计成了「重复调用」；
3. 有同事提议：工具层对任何「工具名 + 参数」完全相同的调用，一律拒绝执行第二次。

请分析现象 1 的可能原因，判断现象 2 是否属于问题，评价提议 3，并设计一套防重复调用机制，说明如何区分合理的重试与无意义的重复。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 现象 1 的可能原因**
- 空结果含义不清：`[]` 可能表示「确实没有」「状态值写错了」，也可能表示「查询出错了」，模型不敢相信，于是反复确认；
- 参数取值不合法：系统里实际的状态值可能是 `REFUND_PENDING`，工具却没有报错或给出提示；
- 提示词要求「必须查到订单再回复」，逼着模型一直查；
- 早期的结果被截断或压缩掉了，模型不记得已经查过；
- 并行调用或多层重试（SDK 一层、Agent 一层）叠加，放大了重复。

**2. 现象 2 不是问题**：动作相同，但观察在变化，属于合理的轮询。可以优化的是：加退避间隔、设置最长等待时间，或者让服务端在任务完成时推送通知，减少无效的轮询。

**3. 提议 3 过于粗暴**：
- 会误伤超时、限流之后的合理重试，以及轮询；
- 会误伤写操作之后的「再查一次确认结果」；
- 对写操作而言，正确的防重复手段是服务端幂等，而不是客户端拒绝执行。

**4. 防重复调用机制**
- **调用台账**：每个会话记录签名（工具名 + 规范化参数，必要时加上相关资源的版本号）、结果摘要和调用次数。
- **只读工具**：签名相同、相关资源没有被写过、工具也不属于时效敏感类时，直接返回上次的结果，并附一句说明，例如「与第 3 步的调用完全相同，结果未变：该用户当前没有退款中的订单」。第 3 次出现时注入提醒，要求换条件或直接告知用户；超过上限则阻断并升级处理。
- **判定为合理重试的情况**：上次因超时、限流、5xx 等可重试错误而失败（按退避重试）；工具被登记为「结果易变」，如轮询类（按最小间隔放行）；两次调用之间相关资源发生过写操作；参数有实质差异。
- **有副作用的工具**：按业务操作生成幂等键（如会话号 + 订单号 + 操作类型），重试复用同一个键，由服务端去重；短时间内对同一对象发起第二次不同的写操作时，要求用户确认。
- **改善工具语义**：空结果要说明含义并给出下一步建议；枚举参数不合法时返回合法取值列表。
- **监控**：按工具统计重复调用率、被拦截次数、误拦截率，并据此持续调整规则。

**评分要点（共 10 分）：**

- 分析现象 1 的成因：空结果含义不清、参数不合法、提示词逼迫、历史丢失等（2 分）
- 判断现象 2 属于合理轮询，并给出优化建议（2 分）
- 指出提议 3 会误伤合理重试，写操作应依靠服务端幂等（2 分）
- 设计调用台账与分级处理，并给出区分合理重试的判据（3 分）
- 提到改善工具返回语义或监控指标（1 分）

**讲解：**

**常见失分点**：把所有重复调用都当作模型的问题，只改提示词；不区分只读工具和有副作用的工具；判据里只看动作、不看观察和资源状态，从而误伤轮询；不知道工具返回值的语义设计本身就能减少大量重复调用。

与「路径震荡」不同，这里的重复是周期为 1 的同一调用，根因往往在工具层：空结果没有说明、参数取值不合法却没有提示。修好工具的返回语义，往往比加拦截规则更治本。

<sub>考点：错误处理与重试、副作用与幂等、工具结果缓存</sub>

</details>

---

## 系统设计题

<a name="AGT-TOOL-045"></a>

### AGT-TOOL-045　挑战 · 考频 ★★

公司要做一个「多模型工具调用网关」：上层 Agent 只用一套统一的接口描述工具、发起对话；网关负责对接 OpenAI 兼容接口（包括国内的模型服务和自部署的 vLLM）与 Anthropic Messages API，支持流式输出、并行调用和严格模式，并能在某家服务故障时切换到另一家。请给出你的设计。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 需求与边界**：统一的工具定义与消息表示；支持流式、并行调用、tool_choice、严格模式；故障切换；可观测；明确哪些字段保证无损转换、哪些会降级。网关只负责「模型调用协议」，工具本身由上层运行时执行。

**2. 内部规范格式**：

- 工具：name、description、JSON Schema、是否严格、副作用标注；
- 消息：系统提示、用户文本、带调用的助手消息（调用 id、名称、参数对象）、工具结果（调用 id、内容、是否错误）。

**3. 适配器**（每家一个，双向转换）：

- 工具定义：`parameters` 与 `input_schema`；严格模式下按目标服务支持的 Schema 子集转换，不支持的约束降级为描述加网关侧校验；
- 消息：system 消息与顶层参数互转；连续的 tool 消息与「一条 user 消息里的多个 tool_result（排在文本前）」互转；arguments 字符串与 input 对象互转；错误结果与 `is_error` 互转；
- tool_choice：auto / required(any) / none / 指定工具，并行开关的位置不同；
- 能力矩阵：记录每个模型是否支持并行、严格模式、强制调用（截至 2026 年 11 月，Anthropic 的 Claude Opus 5.5、Sonnet 5.5 等部分较新模型不支持强制调用，指定 any 或具体工具会直接返回 400；手动开启扩展思考时也只能用 auto 或 none），不支持时自动降级（如改用 auto 并在网关检查是否真的发起了调用）。

**4. 流式归一化**：OpenAI 按 index 累积增量，Anthropic 按内容块累积 `input_json_delta`；对上层输出统一的事件流（文本增量、调用开始、参数片段、调用完成）。流结束后检查停止原因，截断时不交付不完整的调用。

**5. 校验层**：发送前校验协议不变式（每个调用恰好回应一次、结果紧跟调用、按 id 对应）；收到调用后校验工具名是否存在、参数是否符合 Schema，错误以可行动的形式返回给上层。

**6. 错误处理与故障切换**：对上游的 429、5xx、超时做指数退避加抖动重试，并有熔断；网关**不重试工具执行**，那是运行时的职责（涉及幂等）。切换服务商时，历史消息要整段转换；调用 id 尽量保留，目标格式有字符集要求时维护映射表；推理模型的思考内容通常只能原样回传给同一家，切换时要丢弃或按规则处理。

**7. 可观测与测试**：每次调用记录服务商、模型、token、延迟、停止原因、调用数、校验失败数；往返转换测试（A → B → A 必须与原文一致）；每家服务的契约测试与录制回放；上线后对比各服务商的工具调用正确率。

**8. 风险**：字段有损（思考内容、缓存控制、引用等）；切换服务商导致前缀缓存失效、成本上升；各家行为差异（是否并行、参数风格）会影响上层 Agent 的效果，需要按模型做回归评测。

**评分要点（共 10 分）：**

- 定义统一的内部格式并明确无损与降级的边界（2 分）
- 说清工具定义、消息、tool_choice 与并行开关的双向转换（2 分）
- 说清流式按 index 或内容块归一化，并检查停止原因（2 分）
- 有协议与参数校验层，并说明严格模式的能力差异与降级（2 分）
- 错误重试、熔断与故障切换的设计，分清网关与运行时的职责（1 分）
- 可观测、往返测试与主要风险（1 分）

**讲解：**

**常见失分点**：只做字段改名，忽略 tool 消息与 tool_result 的结构差异和顺序要求；流式时边收边执行；网关擅自重试有副作用的工具；切换服务商时忘了处理调用 id 与思考内容；没有往返测试保证转换无损。好的设计会先定义规范格式，再把每家的差异隔离在适配器里。

<sub>考点：不同厂商格式、流式工具调用、严格模式、错误处理与重试　｜　出处：Anthropic 文档 Define tools（Forcing tool use）：https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools ；Anthropic 文档 Handle tool calls：https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls ；OpenAI 文档 Function calling：https://developers.openai.com/api/docs/guides/function-calling ；vLLM 文档 Tool Calling：https://docs.vllm.ai/en/latest/features/tool_calling.html</sub>

</details>

---
