# LLM-DEC · 解码与生成

> 所属大类：大模型原理　｜　题量：36

从 logits 到文本：解码策略、采样参数与约束生成。

**考点覆盖**：贪心解码（6） · 束搜索（6） · 温度（8） · Top-k采样（4） · Top-p采样（6） · Min-p采样（3） · 重复惩罚（6） · 停止条件与EOS（3） · 约束解码与结构化输出（5） · 解码与幻觉（5） · 确定性与随机种子（4） · logits处理（7）

**题型**：[单选题（12）](#单选题) · [多选题（5）](#多选题) · [判断题（4）](#判断题) · [填空题（3）](#填空题) · [计算题（4）](#计算题) · [代码输出题（2）](#代码输出题) · [代码填空题（1）](#代码填空题) · [代码改错题（1）](#代码改错题) · [编程题（1）](#编程题) · [简答题（2）](#简答题) · [场景分析题（1）](#场景分析题)

---

## 单选题

<a name="LLM-DEC-001"></a>

### LLM-DEC-001　基础 · 考频 ★★★

采样时先把 logits 除以温度 $T$ 再做 Softmax：$p_i\propto e^{z_i/T}$。下列说法正确的是：

- **A.** $T$ 越大，logits 之间的差距被放大得越多，分布越尖锐，越倾向选概率最大的 token
- **B.** $T<1$ 时分布更尖锐，$T\to0$ 退化为贪心；$T>1$ 时更平坦，越大越接近均匀分布
- **C.** 温度只缩放概率最高的那个 token 的 logit，其余 token 按原比例分配剩余的概率
- **D.** 温度作用在 Softmax 之后：把每个概率乘以 $T$ 再重新归一化，$T$ 越大分布越平坦

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：温度是「冒险程度」旋钮，作用在 Softmax 之前的 logits 上。

任意两个 token 的概率比为 $p_i/p_j=e^{(z_i-z_j)/T}$。$T$ 变小，差距被放大，最大项占据几乎全部概率；$T$ 变大，差距被压缩，分布趋于均匀。

- A 错：说反了。logits 除以较大的 $T$，彼此差距被压缩，分布更平坦。
- C 错：温度对每个 logit 一视同仁地缩放，所有 token 的概率都会变化，彼此的概率比也会变。
- D 错：把概率统一乘以常数再归一化，结果不变，起不到任何作用；温度必须作用在 logits 上（等价于把概率取 $1/T$ 次幂再归一化）。

<sub>考点：温度、贪心解码</sub>

</details>

---

<a name="LLM-DEC-004"></a>

### LLM-DEC-004　基础 · 考频 ★★★

top-k 采样（每步只在概率最大的 k 个 token 中按概率抽样）最主要的缺点是：

- **A.** 每步都要对整个词表完整排序才能选出前 k 个，计算开销比 top-p 大得多
- **B.** 截断后重新归一化会改变候选间的排序，概率最大的 token 可能不再排第一
- **C.** k 不随分布形状变化：分布尖时会混入不靠谱的 token，分布平时又砍掉合理候选
- **D.** k 较小时生成容易退化成重复循环，因此 k 通常要设到词表大小的一半左右

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：top-k 的截断规模与模型的「把握程度」脱钩，这正是 top-p（核采样）要解决的问题。

例如「中国的首都是」之后，模型几乎只认「北京」，k = 50 会把 49 个几乎不可能的候选也放进抽签池，偶尔抽中就是事实错误；而在「我今天想吃」之后，合理的候选可能有上百个，k = 50 又显得太窄。top-p 按累计概率截断，分布尖时候选少、平时候选多，候选数随分布自适应。

- A 错：top-k 只需选出前 k 个（部分选择，约 $O(V)$），通常比需要排序的 top-p 更便宜。
- B 错：截断后按同一个常数重新归一化，候选之间的相对大小不变，排名第一的 token 也不变。
- D 错：k 是一个需要按任务调的超参数，常见取值在几十左右，与词表大小无关。

<sub>考点：Top-k采样　｜　出处：Fan 等, Hierarchical Neural Story Generation, arXiv:1805.04833；Holtzman 等, The Curious Case of Neural Text Degeneration, arXiv:1904.09751</sub>

</details>

---

<a name="LLM-DEC-007"></a>

### LLM-DEC-007　基础 · 考频 ★★

设 min-p = 0.15（保留概率不低于「当前最大概率 × 0.15」的 token）。分布甲为 (0.6, 0.2, 0.1, 0.06, 0.04)，分布乙为 (0.9, 0.05, 0.03, 0.02)。min-p 分别保留几个 token？

- **A.** 甲保留 3 个，乙保留 1 个
- **B.** 甲保留 2 个，乙保留 1 个
- **C.** 甲保留 4 个，乙保留 2 个
- **D.** 甲、乙都保留 3 个

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**计算**：
- 甲：门槛 $0.15\times0.6=0.09$，保留 0.6、0.2、0.1，共 **3 个**；
- 乙：门槛 $0.15\times0.9=0.135$，只有 0.9 达标，保留 **1 个**。

**含义**：min-p 的门槛随模型的把握程度浮动。乙分布很尖，模型很确定，门槛高，只留下最可能的词；甲分布较平，门槛低，候选多。

- B 错：把 0.15 当作绝对门槛（甲只有 0.6、0.2 超过 0.15）。
- C 错：门槛算错。
- D 错：把 min-p 当成固定数量的 top-k。

<sub>考点：Min-p采样　｜　出处：Nguyen 等, Turning Up the Heat: Min-p Sampling for Creative and Coherent LLM Outputs, arXiv:2407.01082</sub>

</details>

---

<a name="LLM-DEC-010"></a>

### LLM-DEC-010　进阶 · 考频 ★★

在 Hugging Face transformers 的 `generate` 中，设置 `do_sample=True` 并同时开启 `repetition_penalty`、`temperature`、`top_k`、`top_p`、`min_p`。这些处理的默认执行顺序是：

- **A.** 温度 → 重复惩罚 → top-p → top-k → min-p
- **B.** top-k → top-p → 温度 → 重复惩罚 → min-p
- **C.** min-p → top-p → top-k → 温度 → 重复惩罚
- **D.** 重复惩罚 → 温度 → top-k → top-p → min-p

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：先做与「历史内容」相关的修改（重复惩罚、禁止词、最小长度等），再做与「采样」相关的变换和截断。

`_get_logits_processor` 先加入重复惩罚、no_repeat_ngram、禁止词、最小长度、前缀约束等处理器；只有 `do_sample=True` 时，才依次加入温度、top-k、top-p、min-p（以及 typical、epsilon 等）。顺序的意义：
- 重复惩罚改的是原始 logits，放在温度之前，惩罚力度不随温度变化；
- 温度在截断之前，会改变哪些 token 落进 top-p 的核里；
- min-p 在温度之后计算门槛。

另外，Hugging Face 中 `temperature=0` 配合 `do_sample=True` 会直接报错，并提示改用 `do_sample=False` 做贪心解码。其他框架的默认顺序可能不同，例如 llama.cpp 默认把温度放在采样链的最后。

<sub>考点：logits处理、重复惩罚　｜　出处：Hugging Face transformers 源码（generation/utils.py 的 _get_logits_processor）</sub>

</details>

---

<a name="LLM-DEC-015"></a>

### LLM-DEC-015　基础 · 考频 ★★

关于束搜索（beam search），下列说法正确的是：

- **A.** 每步扩展每条候选，按累计对数概率保留最好的 B 条；B = 1 时就是贪心解码
- **B.** 每步按概率随机抽取 B 个 token 分别续写，生成结束后对 B 条结果做多数投票
- **C.** 束搜索相当于对所有可能序列做动态规划，得到的就是全局概率最大的序列
- **D.** 束宽 B 越大，搜索越早收敛到高概率路径，总生成步数和计算量反而越小

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：束搜索是「保留 B 条最优前缀」的近似搜索，介于贪心（B = 1）和穷举之间。

- B 错：这描述的是多次采样加投票（如 Self-Consistency），不是束搜索。
- C 错：每一步只保留 B 条，被剪掉的前缀可能通向更好的整句，束搜索只是近似；自回归模型的「状态」是整个前缀，没法像 HMM 那样做动态规划，穷举的代价是指数级的。
- D 错：每一步要为 B 条候选各算一次前向，计算与 KV Cache 显存约为贪心的 B 倍。

<sub>考点：束搜索</sub>

</details>

---

<a name="LLM-DEC-017"></a>

### LLM-DEC-017　进阶 · 考频 ★★

机器翻译、语音识别常用束搜索，但聊天、写作等开放式生成的大模型服务几乎不用它。最主要的原因是：

- **A.** 束搜索每步要在多条候选间重排，KV Cache 无法复用，只能每步重算整段前缀
- **B.** 束搜索依赖编码器给出的完整源句表示，只适用于 Encoder-Decoder 模型
- **C.** 开放式生成没有唯一答案，追求整句概率最大反而让文本平淡、重复，开销还随束宽成倍增加
- **D.** 束搜索剪枝时只看局部累计概率，生成长句时语法错误和前后矛盾明显增多

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：「概率最大」不等于「最好」，对开放式生成尤其如此。

Holtzman 等（2020）发现，人类写的文本并不集中在模型认为最可能的区域，而以最大化似然为目标的解码（贪心、束搜索）会产生平淡、重复甚至循环的退化文本。翻译、语音识别的答案空间窄、接近唯一，束搜索才有优势。再加上 B 倍的计算与显存开销，聊天服务通常用温度加 top-p 的采样。

- A 错：束搜索可以复用 KV Cache，候选重排时按索引调整缓存即可，各条候选还能共享前缀（PagedAttention 用写时复制支持这一点）。
- B 错：Decoder-only 模型同样可以做束搜索，Hugging Face 的 `generate` 就支持。
- D 错：束搜索的输出通常语法通顺，问题在于平淡和重复。

<sub>考点：束搜索、解码与幻觉　｜　出处：Holtzman 等, The Curious Case of Neural Text Degeneration, arXiv:1904.09751</sub>

</details>

---

<a name="LLM-DEC-020"></a>

### LLM-DEC-020　进阶 · 考频 ★★★

Qwen3 的官方建议在思考模式下明确要求不要使用贪心解码，DeepSeek-R1 也建议温度设在 0.5～0.7（推荐 0.6）。推理模型不推荐贪心解码，最主要的原因是：

- **A.** 贪心解码无法与投机解码等加速手段配合，长思维链下速度明显慢于采样
- **B.** 长思维链中贪心解码容易陷入无休止的重复循环，适度的随机性有助于跳出
- **C.** 贪心总选最大概率 token，而 `<think>` 等思考标记概率偏低，模型因此不进入思考
- **D.** 推理模型输出的 logits 未经归一化，数值尺度不稳定，直接取 argmax 会选错 token

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：长输出下贪心的「复读」问题被放大，官方建议用适度的温度规避。

Qwen3 模型卡写明贪心解码可能导致性能下降和无休止的重复，思考模式推荐 Temperature = 0.6、TopP = 0.95、TopK = 20；DeepSeek-R1 的说明是把温度设在 0.5～0.7 以避免无休止的重复或不连贯的输出，评测时也用温度 0.6、top-p 0.95 采样。机制上，一旦出现局部重复，重复片段之后继续重复的概率往往越来越高，贪心每步都选最大值，很难自己跳出来。

- A 错：贪心是最快的解码方式之一，投机解码在贪心下最容易验证、接受率也最高。
- C 错：思考标记就是普通的特殊 token，贪心同样能生成。
- D 错：Softmax 是单调变换，归一化不改变最大值的位置，任何 logits 都能直接取 argmax。

延伸：非推理场景的短答案、分类、工具参数仍常用贪心或低温度；是否用贪心要看输出长度与任务性质。

<sub>考点：贪心解码、解码与幻觉　｜　出处：Qwen3-8B 模型卡（Best Practices）；DeepSeek-R1 模型卡（Usage Recommendations）</sub>

</details>

---

<a name="LLM-DEC-022"></a>

### LLM-DEC-022　基础 · 考频 ★★

Codex 论文评测 HumanEval 时，每个样本一直采样，直到遇到 `\nclass`、`\ndef`、`\n#`、`\nif`、`\nprint` 之一才停止。设置这些停止序列的主要原因是：

- **A.** 这些字符串是评测框架约定的结束标记，生成到它们时框架便开始运行单元测试
- **B.** 这些都是 Python 保留字或内置函数，出现在函数体内会导致语法错误，必须提前截断
- **C.** 让模型在一个样本里尽量多写几个候选实现，评测时任一实现通过即算通过
- **D.** 模型写完目标函数后常会接着写新的顶层代码，在这些开头处截断可只保留函数体

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：停止序列是「任务相关的结束条件」，对没有回合概念的基座模型尤其重要。

HumanEval 的提示是函数签名加文档字符串，模型续写函数体。Codex 论文说明，不加这些停止序列，模型会继续生成额外的函数或语句。以换行加顶层关键字作为停止条件，正好在函数体结束、下一段顶层代码开始的位置截断，既节省 token，也避免多余代码影响测试（如重复定义同名函数）。

- A 错：测试由评测框架在生成结束后运行，与停止序列无关。
- B 错：`if`、`print`、注释写在函数体内（带缩进）完全合法；停止序列匹配的是「换行后紧跟」的顶层代码，模型当然能生成它们，正因如此才需要截断。
- C 错：目的恰恰是及时停止；多写的函数（尤其是重复定义的同名函数）反而可能让测试失败。

<sub>考点：停止条件与EOS　｜　出处：Chen 等, Evaluating Large Language Models Trained on Code（Codex）, arXiv:2107.03374</sub>

</details>

---

<a name="LLM-DEC-024"></a>

### LLM-DEC-024　进阶 · 考频 ★★★

在采样流程中加入语法约束（例如保证输出符合 JSON Schema），下列做法正确的是：

- **A.** 先把不合法 token 的 logit 置为 $-\infty$，再做温度与 top-k / top-p 截断，最后采样
- **B.** 先做 top-p 截断，再从截断后的候选中去掉不合法的 token；如果一个都不剩，就随机挑一个合法 token
- **C.** 先不加约束正常采样，若采到不合法的 token，就换成概率最高的合法 token 再继续生成
- **D.** 把不合法 token 的概率乘以 0.5 再归一化，既引导输出合法，又保留一定的探索空间

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：语法掩码要最先作用在 logits 上，后续的温度与截断都只在合法 token 中进行。

先掩码再 Softmax，等价于把概率质量只分配给合法 token，再按 top-p 等规则在合法集合内截断。Hugging Face 中前缀约束（`PrefixConstrainedLogitsProcessor`）属于普通处理器，排在温度、top-k、top-p 之前；推理框架的结构化输出也是在采样前对 logits 施加位掩码。

- B 错：top-p 的核是在包含非法 token 的分布上算出来的，合法候选可能全被挤出去（只好随机挑一个，完全脱离模型的偏好）；即使有剩余，留下哪些合法 token 也取决于非法 token 占了多少概率。
- C 错：事后替换破坏了采样分布，而且被替换的 token 与模型的上下文意图可能毫不相干。
- D 错：只是降低概率，不能保证输出合法。

<sub>考点：约束解码与结构化输出、logits处理　｜　出处：Hugging Face transformers 源码（generation/utils.py）</sub>

</details>

---

<a name="LLM-DEC-026"></a>

### LLM-DEC-026　挑战 · 考频 ★

提示词以 `访问 https:` 结尾，让模型续写网址。分词器训练时 `://` 通常作为一个整体 token 出现，而提示词末尾单独的 `:` 已经被编码成一个 token，模型很少见过「`:` token 后面接 `//`」的切分，于是续写质量下降。Guidance 库的 token healing 解决这个问题的做法是：

- **A.** 编码前去掉提示词末尾的标点和空格，让提示词停在完整的单词边界上再续写
- **B.** 检测到末尾是 `:` 时直接在提示词后补上 `//`，让切分与训练语料中的 `://` 一致
- **C.** 把末尾的 `:` token 退回，约束首个生成 token 以 `:` 开头，让模型自己选出 `://`
- **D.** 在提示词末尾的那一步临时调高温度，让模型更容易跳出罕见切分、采到正确的后续 token

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：token healing 是「回退 + 前缀约束」：把边界处被截断的 token 交还给模型重新生成。

问题根源是提示词边界造成的切分偏差：很多常见 token 是更长 token 的前缀（Guidance 的示例中，常用 token 里约七成如此），提示词恰好停在这种「短 token」上时，模型被迫在训练中罕见的切分上续写。回退一个 token、并要求第一个生成 token 以 `:` 开头，模型就能输出 `://` 这一常见 token，与训练分布一致。

- A 错：删掉标点改变了提示的含义，问题也可能换个位置出现。
- B 错：补上的 `//` 会被编码成独立的 token，「`:` 后接 `//`」仍是训练中罕见的切分；这种补丁也只对这个例子有效，不能推广到任意边界。
- D 错：提高温度不能修正切分偏差，只会增加随机错误。

延伸：这与「`encode(a + b)` 不一定等于 `encode(a) + encode(b)`」是同一个问题；原始实现只回退一个 token，后续工作讨论了需要回退多个 token 的情况。

<sub>考点：约束解码与结构化输出、logits处理　｜　出处：Guidance 文档（Token healing 教程）；Lundberg, The Art of Prompt Design: Prompt Boundaries and Token Healing（2023）</sub>

</details>

---

<a name="LLM-DEC-028"></a>

### LLM-DEC-028　进阶 · 考频 ★★★

同一个提示词在某推理服务上以 temperature = 0 请求 1000 次，得到了几十种不同的输出。Thinking Machines Lab 2025 年的分析认为，这类不确定性的主要来源是：

- **A.** temperature = 0 在服务端被映射为一个很小的正温度，实际仍在做随机采样
- **B.** GPU 上的单次前向计算本身是随机的，每次运行都会因原子加法的执行顺序不同而得到不同结果
- **C.** 每次请求的随机种子不同，即使 temperature = 0，top-p 截断时的并列项也会随机取舍
- **D.** 内核缺乏批次不变性：负载不同导致批大小不同，归约顺序随之改变，浮点结果出现细微差异

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：问题不在「GPU 每次都随机」，而在「同一请求的计算方式随批次大小变化」。

分析文章（Horace He 等，2025 年 9 月）指出：常见的「并发加浮点运算不满足结合律」的解释并不完整，LLM 前向通常不使用原子加法，单次前向在同样的输入和批次下是逐位可复现的；真正的原因是推理内核缺乏「批次不变性」：服务端按当时的负载动态组批，同一请求所在批次的大小不同，内核选用的归约策略（如矩阵乘的切分方式、归一化与注意力的并行拆分）随之改变；批次大小对用户不可见，看起来就像随机。浮点加法不满足结合律，归约顺序一变，数值就有微小差异，在两个 token 分数非常接近时改变 argmax，此后整段输出都不同。

文中实验：Qwen3-235B-A22B-Instruct-2507 以温度 0 生成 1000 次，默认配置得到 80 种不同输出；改用批次不变的 RMSNorm、矩阵乘与注意力内核后，1000 次完全一致，代价是一定的性能损失。

- A 错：问题在真正的贪心解码下同样存在。
- B 错：这正是文章要纠正的常见误解。
- C 错：贪心解码不涉及随机数。

<sub>考点：确定性与随机种子　｜　出处：Horace He 与 Thinking Machines Lab, Defeating Nondeterminism in LLM Inference（2025-09-10，thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/）</sub>

</details>

---

<a name="LLM-DEC-032"></a>

### LLM-DEC-032　进阶 · 考频 ★★

Lee 等（2022）在开放式生成中评测事实性时发现：与贪心解码相比，top-p = 0.9 的采样产生了明显更多的命名实体错误，但贪心解码又有大量重复。他们提出的 factual-nucleus sampling 的做法是：

- **A.** 改用束宽较大的束搜索，用整句似然代替逐词采样，同时兼顾事实性和多样性
- **B.** 句内随步数逐步减小 p（设有下限），每个新句子开始时再把 p 重置为初始值
- **C.** 句内随步数逐步增大 p，每个新句子开始时再把 p 重置为较小的初始值
- **D.** 按固定比例在 token 间随机切换贪心与 top-p 采样，在期望意义上兼顾两者

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：随机性在句子后半段（往往承载实体、数字等事实细节）对事实性伤害更大，所以让随机性在句内逐步衰减。

做法是 $p_t=\max\{\omega,\ p\times\lambda^{t-1}\}$：$\lambda$ 为衰减系数，$t$ 为句内步数，$\omega$ 是下限，防止退化成贪心；每遇到句号开始新句子，就把 $p$ 重置为初始值，兼顾多样性。论文中 1.3B 模型的命名实体错误率：贪心约 39.9%、top-p 0.9 约 52.4%，factual-nucleus（$p=0.9,\lambda=0.9,\omega=0.3$）约 42.1%，同时重复率远低于贪心。

- A 错：束搜索更偏向高似然，会加重重复与平淡。
- C 错：方向反了。句子后半段往往承载实体、数字等事实细节，此时增大随机性只会让事实错误更多。
- D 错：论文没有这样的设计；随机切换并不针对事实细节所在的位置，也缺乏依据。

启示：解码策略本身就会影响幻觉。事实性要求高的场景用低温度或衰减式的截断，创意场景再放开随机性。

<sub>考点：解码与幻觉　｜　出处：Lee 等, Factuality Enhanced Language Models for Open-Ended Text Generation, arXiv:2206.04624</sub>

</details>

---

## 多选题

<a name="LLM-DEC-008"></a>

### LLM-DEC-008　进阶 · 考频 ★★

关于 min-p 与 top-p，下列说法**正确**的有：

- **A.** 高温下 top-p 要纳入大量尾部 token 才能凑够累计概率；min-p 门槛随最大概率浮动，相对更稳
- **B.** min-p 截断后会在候选中均匀采样，所以设置 min-p 后温度参数不再起作用
- **C.** min-p 的门槛是「最大概率 × min_p」，模型越有把握，门槛越高、候选越少
- **D.** Hugging Face 的实现中，min-p 在温度缩放之后计算门槛
- **E.** min-p 与 top-k 一样每步保留固定数量的候选，只是数量由 min_p 与词表大小换算而来

<details>
<summary>答案与解析</summary>

**答案：ACD**

**解析：**

- A 对：温度很高时分布变平，top-p 要纳入很多尾部 token 才能凑够累计概率，容易抽到离谱的词；min-p 的门槛随最大概率浮动，在高温下相对更稳。min-p 论文的出发点正是 top-p 在高温下难以兼顾质量与多样性；论文在 GPQA、GSM8K 和创意写作等任务上报告了 min-p 在高温下的优势。
- B 错：min-p 只负责截断，截断后仍按（温度缩放后的）概率重新归一化再采样，并不是均匀采样；温度仍决定概率的形状，两者通常配合使用。
- C 对：这是 min-p 的定义。
- D 对：Hugging Face 的处理顺序为温度 → top-k → top-p → min-p，源码注释特别说明 min-p 在温度缩放之后应用。
- E 错：保留数量随分布形状变化，这正是它与 top-k 的区别。

<sub>考点：Min-p采样、Top-p采样、温度　｜　出处：Nguyen 等, arXiv:2407.01082；Hugging Face transformers 源码（generation/utils.py）</sub>

</details>

---

<a name="LLM-DEC-014"></a>

### LLM-DEC-014　进阶 · 考频 ★★

关于重复与重复惩罚，下列说法**正确**的有：

- **A.** OpenAI 的 presence penalty 按 token 已出现的次数累加扣分，出现次数越多扣得越重
- **B.** Hugging Face 的重复惩罚对出现过的 token：正 logit 除以 θ、负 logit 乘以 θ（θ>1）
- **C.** `no_repeat_ngram_size` 硬性禁止 n-gram 重复，「New York」这样的专名可能只能出现一次
- **D.** 代码变量名、JSON 键名本就需要反复出现，重复惩罚过强会把它们写错，结构化输出时应调小
- **E.** 贪心与束搜索这类追求高似然的解码，在长文本中更容易陷入重复循环

<details>
<summary>答案与解析</summary>

**答案：BCDE**

**解析：**

**结论**：B、C、D、E 正确。

- A 错：那是 frequency penalty。presence penalty 只要 token 出现过就扣一个固定值，与次数无关；frequency penalty 才与出现次数成正比。两者系数过大都会让模型刻意回避必要的词，生成生硬、偏题甚至错误的内容。
- B 对：两种情况都让该 logit 变小。如果对负 logit 也除以 θ，它反而会变大（如 $-1.0/1.2\approx-0.83$），起不到惩罚作用；所以 Hugging Face 的实现对负 logit 改为乘以 θ，保证 logit 一定变小。
- C 对：这是 Hugging Face 文档对 `no_repeat_ngram_size` 的提醒，硬性禁止会伤害本该重复的专有名词。
- D 对：重复惩罚不区分「该重复」和「不该重复」，代码与结构化输出最容易被误伤，应调小或关闭。
- E 对：Holtzman 等（2020）指出，以最大化似然为目标的解码会产生平淡、重复的退化文本；重复一旦出现，模型继续重复的概率往往越来越高，形成循环。Qwen3 等推理模型的官方建议也明确不要用贪心解码。

<sub>考点：重复惩罚、贪心解码　｜　出处：Holtzman 等, arXiv:1904.09751；Hugging Face transformers 文档（NoRepeatNGramLogitsProcessor、RepetitionPenaltyLogitsProcessor）；Qwen3 模型卡</sub>

</details>

---

<a name="LLM-DEC-021"></a>

### LLM-DEC-021　基础 · 考频 ★★

关于生成的停止条件，下列说法**正确**的有：

- **A.** min_new_tokens 的常见实现是在未达最小长度前把结束 token 的 logit 置为 −∞
- **B.** 停止序列要先编码成 token 序列，按 token id 匹配，因此跨 token 边界的字符串无法命中
- **C.** 每个模型只有一个结束 token id，对话模型的回合结束符也要映射到这个 EOS 上才能停止
- **D.** 达到 max_tokens 时，服务端会再多生成几个 token，把当前句子补完整后再停止
- **E.** 停止序列在文本层面匹配，OpenAI API 返回的文本不含命中的停止序列

<details>
<summary>答案与解析</summary>

**答案：AE**

**解析：**

**结论**：A、E 正确。

- A 对：Hugging Face 的 `MinNewTokensLengthLogitsProcessor` 就是这样做的。反过来，压测吞吐时可以用 `ignore_eos` 一类的选项让生成固定长度。
- B 错：停止序列可以是任意字符串，服务端在解码出的文本上匹配；流式输出时还要暂缓推送可能构成停止序列前缀的内容。
- C 错：结束 token 可以配置多个。对话模型通常把「文本结束符」和「回合结束符」都设为结束 token（例如 Llama 3 Instruct 的生成配置里 eos_token_id 是一个包含多个 id 的列表），漏配回合结束符会导致说完不停。
- D 错：达到 max_tokens 就是硬截断（finish_reason 为 `length`），句子、JSON 都可能是半截的，调用方要检查停止原因。
- E 对：停止序列是字符串匹配，可以跨越多个 token；命中后截断，返回内容不含停止序列本身。

<sub>考点：停止条件与EOS　｜　出处：OpenAI API 文档（stop 参数）；Hugging Face transformers 源码（logits_process.py）</sub>

</details>

---

<a name="LLM-DEC-030"></a>

### LLM-DEC-030　进阶 · 考频 ★★

关于大模型输出的可复现性，下列说法**正确**的有：

- **A.** OpenAI 的 seed 参数保证结果完全确定：只要 seed 和其他参数相同，任何时候都会返回逐字相同的输出
- **B.** 批次不变（batch-invariant）的内核可以让结果不受并发负载影响，但通常要付出一定的性能代价
- **C.** 固定 `torch.manual_seed` 之后，不同型号的 GPU 也会得到逐位相同的结果
- **D.** 只要 temperature = 0，任何推理服务返回的结果都会逐字相同
- **E.** 在同一台机器上固定随机种子、批次组成和软件版本，采样结果通常可以复现

<details>
<summary>答案与解析</summary>

**答案：BE**

**解析：**

**结论**：B、E 正确。

- A 错：OpenAI 文档说明 seed 只是「尽力」确定（best effort），不作保证；官方建议同时关注返回的 system_fingerprint，它标识后端的权重、基础设施与配置组合，它变了，结果就可能变。
- B 对：Thinking Machines 的实验中，批次不变内核让 1000 次温度 0 的生成完全一致，但吞吐有所下降（文中示例从 26 秒增至 42 秒）。
- C 错：不同 GPU 的内核实现、指令与归约顺序不同，种子只控制随机数，控制不了浮点运算的顺序。
- D 错：动态组批导致的批次差异、硬件与软件版本、并行配置等都会引入数值差异。
- E 对：采样的随机性来自随机数，固定种子后，在计算本身确定（相同硬件、相同批次与版本）时结果可以复现。

<sub>考点：确定性与随机种子　｜　出处：OpenAI Cookbook（Reproducible outputs with the seed parameter）；Thinking Machines Lab, Defeating Nondeterminism in LLM Inference（2025）</sub>

</details>

---

<a name="LLM-DEC-033"></a>

### LLM-DEC-033　挑战 · 考频 ★★

下列关于「在解码阶段减少幻觉、提高可靠性」的方法，说法**正确**的有：

- **A.** 基于 JSON Schema 的约束解码在保证格式合法的同时，也能保证字段取值符合事实
- **B.** Self-Consistency 多次采样推理路径并按最终答案投票，能提高推理任务的准确率
- **C.** DoLa 对比后层与前层在词表上的输出分布，突出后层新增的信息，无需检索或额外训练
- **D.** 上下文感知解码放大有、无上下文两种输出分布的差异，让模型更信任输入中的证据
- **E.** 适当调高温度能降低幻觉：模型会考虑更多候选答案，不容易被单一的错误答案锁死

<details>
<summary>答案与解析</summary>

**答案：BCD**

**解析：**

- A 错：约束解码只保证格式（语法）合法，城市名、金额这类取值照样可能是错的。
- B 对：Wang 等（2022）的 Self-Consistency 用多数投票聚合多条推理路径，减少单条路径的偶然错误；代价是成倍的推理成本。
- C 对：DoLa（Chuang 等, 2023）基于「事实知识集中在某些层」的观察，用层间对比得到下一个 token 的分布，ICLR 2024 论文报告 LLaMA 系列在 TruthfulQA 上提升 12～17 个百分点。
- D 对：CAD（Context-aware Decoding，Shi 等, 2023）在摘要等任务上提升了忠实度，论文报告 LLaMA 在摘要事实性指标上提升 14.3%，对知识冲突场景帮助最大。
- E 错：温度越高，尾部低概率 token 越容易被抽中，事实错误通常更多。

<sub>考点：解码与幻觉　｜　出处：Chuang 等, DoLa, arXiv:2309.03883；Shi 等, Trusting Your Evidence: Hallucinate Less with Context-aware Decoding, arXiv:2305.14739；Wang 等, Self-Consistency, arXiv:2203.11171</sub>

</details>

---

## 判断题

<a name="LLM-DEC-003"></a>

### LLM-DEC-003　进阶 · 考频 ★★

温度只是把 logits 按同一个正数缩放，不改变各 token 的概率排序，因此温度对贪心解码的结果没有影响；温度只在随机采样时才起作用。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。对任意 $T>0$，$\arg\max_i z_i/T=\arg\max_iz_i$，贪心每步选出的 token 完全相同。温度改变的是概率的「形状」，只有在按概率抽样时（以及 top-p、min-p 这类依赖概率大小的截断里）才会影响结果。

实践含义：很多 API 把 temperature = 0 当作「贪心」的约定写法；而在 Hugging Face 中，温度只在 `do_sample=True` 时生效，设为 0 会直接报错，并提示改用 `do_sample=False` 做贪心解码。

注意这个结论只针对「每步取最大值」的贪心。束搜索要跨不同前缀比较累计对数概率，温度会改变各步对数概率的相对大小，因此可能改变束搜索的结果。

<sub>考点：温度、贪心解码　｜　出处：Hugging Face transformers 源码（TemperatureLogitsWarper）</sub>

</details>

---

<a name="LLM-DEC-011"></a>

### LLM-DEC-011　进阶 · 考频 ★★

Hugging Face 的 `repetition_penalty` 只惩罚模型本次已经生成的 token；提示词（prompt）里出现过的 token 不受影响。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。对 Decoder-only 模型，传给处理器的 `input_ids` 包含提示词和已生成的部分，默认情况下**提示词里出现过的 token 也会被惩罚**（官方文档对此有说明）。

这在某些任务上是有害的：RAG 问答、摘要、信息抽取需要照抄原文中的人名、数字、术语，重复惩罚会让模型刻意避开这些 token，换成近义词或改写，反而引入错误。所以：
- 这类任务上把重复惩罚关掉或设得很小；
- 确实只想惩罚生成部分时，要确认所用框架是否提供排除提示词的选项，或自己实现；
- OpenAI 风格的 frequency / presence penalty 只依据已采样的 token 计数，语义也不同。

<sub>考点：重复惩罚　｜　出处：Hugging Face transformers 源码与文档（RepetitionPenaltyLogitsProcessor）；OpenAI API 文档 Advanced usage</sub>

</details>

---

<a name="LLM-DEC-019"></a>

### LLM-DEC-019　进阶 · 考频 ★

束宽越大并不一定翻译得越好。Stahlberg 与 Byrne（2019）用精确搜索发现：在他们实验的英德翻译测试集上，超过一半句子的「模型最高分译文」竟然是空译文；标准的神经机器翻译在某种程度上依赖束搜索的「搜索误差」才能正常工作。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。论文（On NMT Search Errors and Model Errors: Cat Got Your Tongue?）结合束搜索与深度优先搜索做精确推断，在 WMT15 英德测试集上发现，超过 50% 的句子全局最优解是空译文；即使束宽设到 100，束搜索在多数情况下也找不到全局最优。根源是模型本身偏好短输出：每多一个 token 就多乘一个小于 1 的概率。

这解释了几个现象：
- 束宽过大时译文反而变短、质量下降；
- 束搜索要配合长度归一化或长度惩罚；
- 对大模型也是同样的道理：「找到概率最大的序列」并不等于「得到最好的输出」，模型误差与搜索误差要分开看。

<sub>考点：束搜索　｜　出处：Stahlberg 与 Byrne, On NMT Search Errors and Model Errors: Cat Got Your Tongue?, arXiv:1908.10090</sub>

</details>

---

<a name="LLM-DEC-036"></a>

### LLM-DEC-036　挑战 · 考频 ★★

同时设置 top-k 与 top-p 时（按 Hugging Face 的顺序，先 top-k、再 top-p），最终的候选集合就等于「原分布上的 top-k 集合」与「原分布上的 top-p 集合」的交集。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。top-p 是在 top-k **截断并重新归一化之后**的分布上计算的，此时每个保留 token 的概率都被放大，累计概率更快达到 p，核可能比在原分布上算的更小。

**反例**：概率为 (0.5, 0.3, 0.15, 0.05)，k = 2，p = 0.62。
- 原分布上：top-2 集合为 {1, 2}；top-p 需要 0.5 + 0.3 = 0.8 ≥ 0.62，也是 {1, 2}；交集为 {1, 2}。
- 按顺序执行：top-k 后重新归一化为 (0.625, 0.375)，第一个 token 已有 0.625 ≥ 0.62，top-p 只保留 {1}。

一般地，顺序执行的结果总是交集的子集，可能严格更小。手写采样或对齐不同框架的结果时，要注意这类「顺序与重新归一化」带来的差异。

<sub>考点：Top-k采样、Top-p采样、logits处理　｜　出处：Hugging Face transformers 源码（TopKLogitsWarper、TopPLogitsWarper）</sub>

</details>

---

## 填空题

<a name="LLM-DEC-005"></a>

### LLM-DEC-005　基础 · 考频 ★★★

某一步的概率按从大到小排序为 0.45、0.25、0.15、0.10、0.05。设 top-p = 0.8（保留「累计概率首次达到或超过 p」的最小集合），会保留 ____ 个 token；重新归一化后，概率最大的 token 的概率约为 ____（保留三位小数）。

<details>
<summary>答案与解析</summary>

**答案：** (1) 3；(2) 0.529 / 0.53

**解析：**

累计概率：0.45 → 0.70 → **0.85**。前两个只有 0.70，未达到 0.8，必须把第 3 个也纳入，累计 0.85 ≥ 0.8，于是保留 3 个。

重新归一化：$0.45/0.85\approx0.529$，$0.25/0.85\approx0.294$，$0.15/0.85\approx0.176$。

**常见错误**：
- 把 top-p 理解成「保留概率大于 p 的 token」，结果一个都不剩；
- 停在累计 0.70 处，只保留 2 个（「刚好不超过 p」与「首次达到 p」的混淆）。

实现时通常用「加入该 token 之前的累计概率是否已经达到 p」来判断，这样概率最大的 token 一定保留，p 很小时也不会得到空集合。

<sub>考点：Top-p采样　｜　出处：Holtzman 等, arXiv:1904.09751</sub>

</details>

---

<a name="LLM-DEC-013"></a>

### LLM-DEC-013　基础 · 考频 ★★

某个 token 的 logit 为 3.0，此前已经生成过 3 次。按 OpenAI 风格的惩罚（logit 减去「出现次数 × frequency_penalty」与「是否出现过 × presence_penalty」，其中 frequency_penalty = 0.5、presence_penalty = 0.6），惩罚后的 logit 为 ____；按 CTRL 式重复惩罚（θ = 1.2，正 logit 除以 θ），惩罚后为 ____；若该 token 的 logit 原本是 −1.0，按 CTRL 式（负 logit 乘以 θ）惩罚后为 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 0.9；(2) 2.5；(3) -1.2 / −1.2

**解析：**

- OpenAI 风格：$3.0-3\times0.5-1\times0.6=0.9$；
- CTRL 式（正 logit）：$3.0/1.2=2.5$；
- CTRL 式（负 logit）：$-1.0\times1.2=-1.2$。

**两类惩罚的区别**：
- 加减式（OpenAI 文档给出的公式为 `mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence`）：频率惩罚随出现次数线性增加，存在惩罚只看「是否出现过」；系数可以为负，用来鼓励重复；
- 乘除式（CTRL / Hugging Face 的 repetition_penalty）：不看次数，只看是否出现过，力度与 logit 的大小成比例。

同样的「惩罚强度」在两种实现下含义不同，换框架时不能直接照搬数值。

<sub>考点：重复惩罚　｜　出处：OpenAI API 文档 Advanced usage（frequency 与 presence penalty）；Keskar 等, CTRL, arXiv:1909.05858</sub>

</details>

---

<a name="LLM-DEC-018"></a>

### LLM-DEC-018　基础 · 考频 ★★

束搜索结束时剩下两个候选：A 长 5 个 token，累计对数概率 −4.0；B 长 10 个 token，累计对数概率 −7.0。不做长度归一化时会选 ____；若按「累计对数概率 / 长度$^{\alpha}$」打分（Hugging Face 的 `length_penalty` 就是这里的 $\alpha$），取 $\alpha=1$ 时 A 的得分为 ____，B 的得分为 ____，最终选 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) A；(2) -0.8 / −0.8；(3) -0.7 / −0.7；(4) B

**解析：**

- 不归一化：$-4.0>-7.0$，选 **A**。每多一个 token 就多加一个负数，越长越吃亏，束搜索天然偏向短句，甚至过早输出结束符。
- $\alpha=1$：A 为 $-4.0/5=-0.8$，B 为 $-7.0/10=-0.7$，B 的平均每 token 对数概率更高，选 **B**。

$\alpha$ 越大越偏向长句（得分为负时，除以更大的长度项会让分数更接近 0），$\alpha$ 取 0 即不归一化；本例中取 $\alpha=0.5$ 时 A 约 −1.79、B 约 −2.21，又会选回 A。GNMT 使用的长度惩罚是 $\frac{(5+|Y|)^\alpha}{(5+1)^\alpha}$，思路相同。长度归一化是束搜索的标配；采样解码则不需要它。

<sub>考点：束搜索　｜　出处：Wu 等, Google’s Neural Machine Translation System, arXiv:1609.08144；Hugging Face transformers 文档（length_penalty）</sub>

</details>

---

## 计算题

<a name="LLM-DEC-002"></a>

### LLM-DEC-002　进阶 · 考频 ★★★

某一步的 logits 为 $(2,\ 1,\ 0)$。分别计算温度 $T=0.5$、$1$、$2$ 时三个 token 的概率（保留三位小数），并说明温度如何改变「第 1 名与第 2 名的概率之比」。

<details>
<summary>答案与解析</summary>

**答案：T=0.5：(0.867, 0.117, 0.016)；T=1：(0.665, 0.245, 0.090)；T=2：(0.506, 0.307, 0.186)；第 1 名与第 2 名的概率比为 e^(1/T)，依次约为 7.39、2.72、1.65**

**解析：**

**公式**：$p_i=\dfrac{e^{z_i/T}}{\sum_je^{z_j/T}}$。

- $T=0.5$：缩放后为 $(4,2,0)$，$e^4\approx54.60$、$e^2\approx7.39$、$e^0=1$，总和 62.99，概率约 **(0.867, 0.117, 0.016)**；
- $T=1$：$e^2\approx7.39$、$e^1\approx2.72$、$1$，总和 11.11，概率约 **(0.665, 0.245, 0.090)**；
- $T=2$：缩放后为 $(1,0.5,0)$，$e^1\approx2.72$、$e^{0.5}\approx1.65$、$1$，总和 5.37，概率约 **(0.506, 0.307, 0.186)**。

**概率比**：$p_1/p_2=e^{(z_1-z_2)/T}=e^{1/T}$，$T=0.5$、$1$、$2$ 时分别约为 7.39、2.72、1.65。温度越低，领先者的优势被指数级放大；温度越高，尾部 token（这里的第 3 名）被抽中的概率显著上升，从 1.6% 涨到 18.6%。

<sub>考点：温度</sub>

</details>

---

<a name="LLM-DEC-009"></a>

### LLM-DEC-009　挑战 · 考频 ★★

某一步的 logits 为 $(3,\ 2,\ 1,\ 0)$，设置温度 $T=2$、top-p = 0.8。比较两种执行顺序：

- 顺序甲（Hugging Face 的默认顺序）：先除以温度，再在得到的分布上做 top-p；
- 顺序乙（llama.cpp 默认把温度放在采样链的最后）：先在 $T=1$ 的分布上做 top-p，再对保留下来的 token 施加温度。

分别求两种顺序保留的 token 集合，以及重新归一化后的概率（保留三位小数）。

<details>
<summary>答案与解析</summary>

**答案：顺序甲保留前 3 个，概率约 (0.506, 0.307, 0.186)；顺序乙保留前 2 个，概率约 (0.622, 0.378)**

**解析：**

**顺序甲**：$z/T=(1.5,1,0.5,0)$，Softmax 约为 $(0.455,0.276,0.167,0.102)$；累计 0.455、0.731、**0.898**，前两个不够 0.8，保留 3 个。在这 3 个上重新归一化，约为 **(0.506, 0.307, 0.186)**。

**顺序乙**：$T=1$ 时 Softmax 约为 $(0.644,0.237,0.087,0.032)$；累计 0.644、**0.881**，保留 2 个。再对保留的 logits $(3,2)$ 施加 $T=2$：Softmax$(1.5,1)$ 约为 **(0.622, 0.378)**。

**结论**：同一组参数，执行顺序不同，候选集合和概率都不同。温度在截断之前时，高温会把更多尾部 token 放进候选池；温度在截断之后时，候选集合由原始分布决定，温度只调整候选内部的概率。不同框架的默认顺序并不一致（llama.cpp 的采样链顺序还可配置），迁移采样参数或复现他人结果时，必须核对处理顺序。

<sub>考点：logits处理、温度、Top-p采样　｜　出处：Hugging Face transformers 源码（generation/utils.py）；llama.cpp 源码 common/common.h（默认采样链）</sub>

</details>

---

<a name="LLM-DEC-016"></a>

### LLM-DEC-016　进阶 · 考频 ★★★

一个两步生成的例子：第 1 步，token A、B、C 的概率为 0.5、0.4、0.1；第 2 步的条件概率为：A 之后 x 0.4、y 0.35、z 0.25；B 之后 x 0.9、y 0.05、z 0.05；C 之后 x 0.5、y 0.3、z 0.2。分别求贪心解码与束宽为 2 的束搜索得到的序列及其概率。

<details>
<summary>答案与解析</summary>

**答案：贪心：A→x，概率 0.20；束宽 2：B→x，概率 0.36（也是全局最优）**

**解析：**

**贪心**：第 1 步选 A（0.5），第 2 步在 A 之后选 x（0.4），整句概率 $0.5\times0.4=0.20$（对数概率约 −1.61）。

**束宽 2**：第 1 步保留 A（0.5）与 B（0.4）。第 2 步扩展所有候选：
- A→x 0.20，A→y 0.175，A→z 0.125；
- B→x $0.4\times0.9=0.36$，B→y 0.02，B→z 0.02。

保留最好的两条：B→x（0.36）、A→x（0.20），最终输出 **B→x，概率 0.36**（对数概率约 −1.02）。

**要点**：贪心在第 1 步「只看眼前」，选了略高的 A，错过了第 1 步略低、但后续非常确定的 B。束搜索多保留几条前缀来弥补这种短视；但它同样只是近似，束宽不够时也会错过全局最优。

<sub>考点：束搜索、贪心解码</sub>

</details>

---

<a name="LLM-DEC-025"></a>

### LLM-DEC-025　挑战 · 考频 ★★

一个玩具语言模型只生成两个 token：第 1 个 token 为 A 的概率 0.6、为 B 的概率 0.4；在 A 之后，第 2 个 token 为「1」的概率只有 0.1，在 B 之后为「1」的概率是 0.5。格式要求第 2 个 token 必须是「1」（A、B 两个开头都可能走到合法结尾）。

(1) 用逐步约束解码采样（每一步屏蔽不合法 token 后在剩余 token 上重新归一化），输出「A1」与「B1」的概率各是多少？
(2) 在「输出满足格式」的条件下，模型本身给出的条件概率（等价于无约束采样、不合法就丢弃重来）各是多少？
(3) 两者为什么不同？

<details>
<summary>答案与解析</summary>

**答案：(1) A1 为 0.6，B1 为 0.4；(2) A1 约 0.231，B1 约 0.769；(3) 逐步约束只看当前一步是否合法，不考虑某个前缀之后还剩多少概率能走到合法结尾，因此扭曲了模型的条件分布**

**解析：**

**(1) 逐步约束**：第 1 步 A、B 都合法，按 0.6 / 0.4 抽样；第 2 步只有「1」合法，重新归一化后概率为 1。所以 P(A1) = 0.6，P(B1) = 0.4。

**(2) 条件分布**：联合概率 P(A1) = 0.6 × 0.1 = 0.06，P(B1) = 0.4 × 0.5 = 0.20，合法输出的总概率为 0.26。条件概率为 0.06 / 0.26 ≈ **0.231**、0.20 / 0.26 ≈ **0.769**。

**(3) 原因**：模型其实认为「满足格式的输出里，B1 远比 A1 合理」，但逐步约束在第 1 步只检查「A 能不能走到合法结尾」，不考虑走下去要付出多大的概率代价，于是 A1 被大大高估，偏好甚至反转。Grammar-Aligned Decoding（Park 等, 2024）专门讨论了这种分布扭曲，并提出了与条件分布一致的采样算法 ASAp。

**实践启示**：约束解码保证格式合法，但不保证内容与模型的真实偏好一致。所以要把 Schema 和示例写进提示词，让模型无约束时就倾向于合法格式；格式设计尽量贴近模型的自然写法（如字段顺序、字符串风格），减少「被逼着走」的步数。

<sub>考点：约束解码与结构化输出　｜　出处：Park 等, Grammar-Aligned Decoding, arXiv:2405.21047</sub>

</details>

---

## 代码输出题

<a name="LLM-DEC-023"></a>

### LLM-DEC-023　进阶 · 考频 ★★

下面用一张固定的 logits 表模拟模型，做贪心解码，并实现「最小生成长度」和「最大生成长度」两种停止控制。输出是什么？

```python
import numpy as np

EOS = 0
VOCAB = ["<eos>", "好", "的", "。"]
TABLE = np.array([[1.0, 3.0, 0.5, 0.2],    # 第 0 步最想说「好」
                  [2.5, 0.1, 2.0, 1.0],    # 之后最想结束
                  [3.0, 0.2, 0.1, 2.9],
                  [3.0, 0.5, 0.3, 1.0]])

def generate(min_new_tokens, max_new_tokens=6):
    out = []
    for step in range(max_new_tokens):
        logits = TABLE[min(step, 3)].copy()
        if len(out) < min_new_tokens:
            logits[EOS] = -np.inf             # 未达到最小长度时禁止结束
        tok = int(np.argmax(logits))
        if tok == EOS:
            return "".join(out), "stop"
        out.append(VOCAB[tok])
    return "".join(out), "length"

print(generate(0))
print(generate(3))
print(generate(3, max_new_tokens=2))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
('好', 'stop')
('好的。', 'stop')
('好的', 'length')
```

**解析：**

- `generate(0)`：第 0 步选「好」（3.0 最大）；第 1 步 `<eos>` 的 2.5 最大，停止，结果 `('好', 'stop')`。
- `generate(3)`：前 3 步 `<eos>` 被置为 $-\infty$。第 1 步在剩余 token 中选「的」（2.0）；第 2 步选「。」（2.9）；第 3 步已生成 3 个 token，不再屏蔽，`<eos>`（3.0）最大，停止，结果 `('好的。', 'stop')`。
- `generate(3, max_new_tokens=2)`：只生成 2 步就到达上限，返回 `('好的', 'length')`。

要点：最小长度通过修改 logits 实现，是一个 logits 处理器；最大长度是循环外层的硬上限，触发时停止原因为 `length`，内容可能不完整。注意要先 `.copy()` 再改 logits，否则会改坏共享的表。

<sub>考点：停止条件与EOS、logits处理　｜　出处：Hugging Face transformers 源码（MinNewTokensLengthLogitsProcessor）</sub>

</details>

---

<a name="LLM-DEC-029"></a>

### LLM-DEC-029　基础 · 考频 ★★

下面的代码以不同顺序做浮点加法。输出是什么？

```python
import numpy as np

a = (0.1 + 0.2) + 0.3
b = 0.1 + (0.2 + 0.3)
print(a == b, a, b)

x = np.array([1e8, 1.0, -1e8], dtype=np.float32)
print(x[0] + x[1] + x[2], x[0] + x[2] + x[1])
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
False 0.6000000000000001 0.6
0.0 1.0
```

**解析：**

**浮点加法不满足结合律**：

- `(0.1 + 0.2) + 0.3`：0.1 + 0.2 先得到 0.30000000000000004，再加 0.3 得到 0.6000000000000001；`0.1 + (0.2 + 0.3)` 得到 0.6。两者不相等。
- float32 只有约 7 位有效数字，$10^8$ 附近相邻两个 float32 数相差 8。`1e8 + 1` 舍入后仍是 `1e8`，再减去 `1e8` 得 0.0；先算 `1e8 - 1e8 = 0`，再加 1 得 1.0。

**与大模型推理的关系**：矩阵乘、归一化、注意力都包含大量求和，内核按不同方式切分与归约（例如随批次大小改变策略）就会得到略有差异的结果。差异通常极小，但在两个候选 token 分数接近时会改变 argmax，之后整段生成都分叉。这就是 temperature = 0 也不能保证线上结果逐字一致的底层原因。

<sub>考点：确定性与随机种子</sub>

</details>

---

## 代码填空题

<a name="LLM-DEC-027"></a>

### LLM-DEC-027　进阶 · 考频 ★★

补全一个最小的约束贪心解码器：目标格式是「1～3 位、不以 0 开头的十进制整数」，词表中的 token 可能包含多个字符，也可能不合法。每一步只允许「接上后仍可能是合法前缀」的 token；只有当前已经是完整的合法数字时才允许输出 `<eos>`。

```python
import numpy as np

VOCAB = ["0", "1", "5", "12", "007", "9a", "<eos>"]
EOS = len(VOCAB) - 1

def allowed(prefix):
    """prefix 为已生成的字符串，返回此时允许的 token 编号"""
    ok = []
    for t, tok in enumerate(VOCAB[:EOS]):
        s = prefix + tok
        if s.isdigit() and s[0] != "0" and len(s) <= 3:
            ok.append(t)
    if ____:                      # 已经是合法的完整数字时才允许结束
        ok.append(EOS)
    return ok

def constrained_greedy(logits_seq):
    prefix = ""
    for logits in logits_seq:
        mask = np.full(len(VOCAB), -np.inf)
        mask[allowed(prefix)] = ____
        t = int(np.argmax(np.asarray(logits) + mask))
        if t == EOS:
            break
        prefix += ____
    return prefix
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `len(prefix) >= 1`；(2) `0.0`；(3) `VOCAB[t]`

**解析：**

1. **何时允许结束**：本格式下，只要前缀非空，它就一定是 1～3 位、不以 0 开头的合法数字（每一步都只接受合法前缀），所以条件是 `len(prefix) >= 1`。空串时不允许结束，否则会输出空字符串。
2. **掩码**：合法 token 的偏置为 `0.0`，不合法的为 $-\infty$，与 logits 相加后取 argmax，等价于只在合法 token 中选最大者。
3. **推进状态**：把选中的 token 文本 `VOCAB[t]` 接到前缀上。

测试中第 1 步模型最想要的 `007`、`9a`、`<eos>` 都被屏蔽，选中合法 token 里分数最高的 `12`；第 2 步接上 `0` 得到 `120`；此时任何数字都会超过 3 位，只剩 `<eos>`。

**工程对应**：真实系统把 JSON Schema 或正则编译成有限状态机（嵌套结构需要下推自动机），并为每个状态预先算好合法 token 集合，运行时只需查表加掩码；多字符 token 要逐字符喂给状态机检查。

<sub>考点：约束解码与结构化输出</sub>

</details>

---

## 代码改错题

<a name="LLM-DEC-012"></a>

### LLM-DEC-012　进阶 · 考频 ★★

下面是 CTRL 式重复惩罚的实现，目标是降低已出现过的 token 的概率（`penalty > 1`）。它在某些情况下反而会**提高**这些 token 的概率。请指出问题并修正。

```python
import numpy as np

def repetition_penalty(logits, prev_ids, penalty=1.2):
    """CTRL 式重复惩罚：降低已出现过的 token 的概率"""
    out = np.array(logits, dtype=float)
    for t in set(prev_ids):
        out[t] = out[t] / penalty
    return out
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：第 7 行对所有 logit 一律除以 `penalty`。对正 logit，除以 1.2 会变小，概率下降；但对**负 logit**，例如 −1.0 除以 1.2 变成 −0.83，反而变大了，这个 token 的概率上升，与「惩罚」的本意相反。

**修正**：正 logit 除以 penalty，负 logit 乘以 penalty，两种情况都让 logit 变小：

```python
out[t] = out[t] / penalty if out[t] > 0 else out[t] * penalty
```

**修正后的代码：**

```python
import numpy as np

def repetition_penalty(logits, prev_ids, penalty=1.2):
    """CTRL 式重复惩罚：降低已出现过的 token 的概率"""
    out = np.array(logits, dtype=float)
    for t in set(prev_ids):
        out[t] = out[t] / penalty if out[t] > 0 else out[t] * penalty
    return out
```

**解析：**

CTRL 论文的公式写作 $p_i\propto\exp\big(x_i/(T\cdot I(i\in g))\big)$，其中 $I=\theta$（出现过）或 1，直接用除法，隐含假设 logit 为正；Hugging Face 的实现按符号区分：`torch.where(score < 0, score * penalty, score / penalty)`。

还要注意两点：
1. 「降低 logit」不等于「这个 token 的概率一定下降」：如果同时惩罚了多个 token，被惩罚得更狠的其他 token 让出的概率可能流向它。测试因此单独惩罚 token 1 来检查概率；
2. 乘除式惩罚的力度与 logit 的大小有关，logit 接近 0 时几乎不起作用；OpenAI 风格的加减式惩罚（减去「次数 × 频率惩罚」与「是否出现 × 存在惩罚」）则与 logit 大小无关。

<sub>考点：重复惩罚　｜　出处：Keskar 等, CTRL, arXiv:1909.05858；Hugging Face transformers 源码（RepetitionPenaltyLogitsProcessor）</sub>

</details>

---

## 编程题

<a name="LLM-DEC-006"></a>

### LLM-DEC-006　挑战 · 考频 ★★★

用 numpy 实现采样前的概率过滤（按 Hugging Face 的顺序：温度 → top-k → top-p → min-p）：

```python
def filter_probs(logits, temperature=1.0, top_k=0, top_p=1.0, min_p=0.0) -> np.ndarray: ...
```

- 输入一维 logits，返回与之等长、和为 1 的概率数组（被过滤的 token 概率为 0）；
- 温度：logits 除以 `temperature`（保证大于 0）；
- top-k（`top_k > 0` 时生效）：保留 logit 不小于第 k 大值的 token，并列时一起保留；
- top-p（`top_p < 1` 时生效）：在当前分布上按概率从大到小（并列按下标），保留「加入该 token 之前的累计概率小于 `top_p`」的 token，保证至少保留一个；
- min-p（`min_p > 0` 时生效）：去掉概率小于 `min_p` × 当前最大概率的 token；
- 每一步截断后都在剩余 token 上重新归一化；Softmax 需数值稳定。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import numpy as np


def filter_probs(logits, temperature=1.0, top_k=0, top_p=1.0, min_p=0.0):
    z = np.asarray(logits, dtype=float) / temperature           # ① 温度
    if top_k > 0:                                               # ② top-k（并列一起保留）
        kth = np.sort(z)[::-1][min(top_k, z.size) - 1]
        z = np.where(z >= kth, z, -np.inf)
    p = np.exp(z - z.max())
    p /= p.sum()
    if top_p < 1.0:                                             # ③ top-p
        order = np.argsort(-p, kind="stable")
        before = np.cumsum(p[order]) - p[order]                 # 加入该 token 之前的累计概率
        drop = order[before >= top_p]
        p[drop] = 0.0
        p /= p.sum()
    if min_p > 0.0:                                             # ④ min-p
        p[p < min_p * p.max()] = 0.0
        p /= p.sum()
    return p
```

**测试用例：**

```python
z = np.array([3.0, 2.0, 1.0, 0.0])
p = filter_probs(z, temperature=2.0, top_p=0.8)
assert np.allclose(p, [0.5065, 0.3072, 0.1863, 0.0], atol=1e-3)
p = filter_probs(z, top_k=2)
assert (p > 0).sum() == 2 and np.isclose(p[0], 1 / (1 + np.e ** -1))
# top-p 很小时只保留概率最大的 token，不会得到空集合
assert np.allclose(filter_probs(z, top_p=1e-9), [1, 0, 0, 0])
# min-p：门槛是当前最大概率的 min_p 倍
p = filter_probs(np.log([0.6, 0.2, 0.1, 0.06, 0.04]), min_p=0.15)
assert np.allclose(p, [0.6 / 0.9, 0.2 / 0.9, 0.1 / 0.9, 0, 0])
assert np.allclose(filter_probs(np.log([0.9, 0.05, 0.03, 0.02]), min_p=0.15), [1, 0, 0, 0])
# 先 top-k 再 top-p：top-p 作用在 top-k 重新归一化之后的分布上
p = filter_probs(np.log([0.5, 0.3, 0.15, 0.05]), top_k=2, top_p=0.62)
assert np.allclose(p, [1, 0, 0, 0])
# 不加过滤时等于 Softmax；logits 很大时数值稳定
p = filter_probs([1000.0, 999.0])
assert np.isfinite(p).all() and np.isclose(p.sum(), 1) and np.isclose(p[0], 1 / (1 + np.e ** -1))
# 温度很低时接近贪心
assert filter_probs(z, temperature=0.01)[0] > 0.999
```

**解析：**

**要点**：
1. 温度最先作用，它会改变后续 top-p、min-p 看到的概率形状；
2. top-k 用「不小于第 k 大的 logit」作门槛，被淘汰的置为 $-\infty$，Softmax 后自然为 0；
3. top-p 用「加入之前的累计概率」判断：第一个 token 之前的累计为 0，一定保留；累计一旦达到 p，后面的全部丢弃，得到最小的满足集合；
4. min-p 的门槛与当前最大概率成正比，重新归一化不改变概率之比，所以在 top-p 之后算也只依赖相对大小；
5. 每次截断后都重新归一化。

**复杂度**：top-p 需要排序，$O(V\log V)$；其余 $O(V)$。

**易错点**：top-p 写成「保留累计概率 ≤ p 的 token」，p 较小时会得到空集合；把温度放在 top-p 之后却仍声称与 Hugging Face 一致；在 logits 上直接比较 min-p 门槛（应比较概率）；忘记数值稳定。测试里「top-k=2 再 top-p=0.62 只剩 1 个 token」说明：两者叠加并不等于各自在原分布上结果的交集。

<sub>考点：温度、Top-k采样、Top-p采样、Min-p采样、logits处理　｜　出处：Hugging Face transformers 源码（generation/logits_process.py）</sub>

</details>

---

## 简答题

<a name="LLM-DEC-031"></a>

### LLM-DEC-031　进阶 · 考频 ★★★

面试官问：「我们把 temperature 设成 0 了，为什么同样的输入，线上结果还是会变？要怎样尽量保证输出一致？」请回答。

<details>
<summary>答案与解析</summary>

**参考答案：**

**一、为什么会变**
1. **浮点运算不满足结合律**：同样的数学计算，求和顺序不同，结果就有末位差异。
2. **批次不变性缺失**（主要原因）：线上服务按负载动态组批，同一请求所在批次的大小不同，矩阵乘、归一化、注意力的内核会选择不同的切分与归约策略，数值随之变化；贪心解码在两个候选分数接近时会因此改选另一个 token，之后整段输出都分叉。
3. **系统配置变化**：模型快照更新、推理框架或驱动升级、硬件型号、张量并行度、量化方式不同；MoE 模型若设置了专家容量，token 是否被丢弃还会受同批其他请求影响。
4. 只要是真正的贪心，就不是「随机采样」造成的；若服务对 temperature = 0 的实现细节不公开，也要确认它是否真的等价于贪心。

**二、怎样尽量一致**
1. **固定版本**：固定模型快照与推理栈版本，记录系统指纹（如 OpenAI 的 system_fingerprint）和完整的请求参数，便于复现与回放。
2. **确定性推理**：自部署时使用批次不变或确定性的内核模式，或对关键请求固定批次大小、单独处理，接受一定的吞吐损失；采样场景固定随机种子。
3. **缓存**：对完全相同的请求直接返回缓存结果，既一致又省钱。
4. **系统设计上容忍差异**：不依赖逐字一致；用结构化输出与校验保证格式，用多次采样投票或规则校验保证关键结论，评测时每题多跑几次并报告方差。

**评分要点（共 10 分）：**

- 指出浮点非结合性是底层原因（2 分）
- 说明动态组批导致的批次不变性缺失，以及差异在贪心解码中被放大（3 分）
- 提到版本、硬件、并行配置、MoE 容量等其他来源中的至少两项（2 分）
- 给出可操作的保证一致性手段：固定版本与记录、确定性内核、缓存、系统层面容忍差异（3 分）

**讲解：**

**常见失分点**：只说「GPU 有随机性」或「多线程原子加」而说不出批次不变性；认为固定 seed 就能解决温度为 0 时的差异（贪心根本不用随机数）；只给出「多试几次」而没有工程手段；忽略模型快照更新这一最常见的线上变化来源。

<sub>考点：确定性与随机种子　｜　出处：Thinking Machines Lab, Defeating Nondeterminism in LLM Inference（2025）；OpenAI Cookbook（seed 参数）</sub>

</details>

---

<a name="LLM-DEC-035"></a>

### LLM-DEC-035　进阶 · 考频 ★★★

请比较贪心解码、束搜索、温度采样、top-k、top-p 的原理、优缺点与适用场景；如果要让 Agent 稳定地调用工具，你会怎样设置解码参数？

<details>
<summary>答案与解析</summary>

**参考答案：**

| 策略 | 做法 | 优点 | 缺点 | 适用场景 |
|---|---|---|---|---|
| 贪心 | 每步取 argmax | 快、简单、（在确定的计算下）可复现 | 短视；长文本易重复、复读 | 短答案、分类、抽取、工具参数 |
| 束搜索 | 保留累计对数概率最高的 B 条前缀，配合长度归一化 | 整句概率更高 | 开放生成平淡重复；约 B 倍开销；偏短需长度惩罚 | 翻译、语音识别等答案近乎唯一的任务 |
| 温度采样 | logits 除以 T 再抽样 | 一个旋钮控制多样性 | T 高时易抽到离谱的词 | 与截断方法配合使用 |
| top-k | 只在前 k 个中抽样 | 简单、便宜 | k 不随分布形状变化 | 早期开放式生成 |
| top-p | 保留累计概率首次达到 p 的最小集合 | 候选数随分布自适应 | 高温或分布很平时候选过多 | 对话、写作的常用选择 |

要点补充：
1. 温度只改变分布形状，不改变 argmax；先温度后截断时，温度会影响哪些 token 进入候选集，各框架的执行顺序可能不同；
2. min-p 按「最大概率 × 系数」设门槛，高温下更稳；
3. 推理模型通常不建议贪心（长思维链易复读），按官方推荐的温度和 top-p 设置。

**Agent 调用工具**：
- 工具名和参数用贪心或低温度（0～0.3），关闭重复惩罚（键名、ID 需要原样重复）；
- 开启基于 JSON Schema 的约束解码，保证格式合法，同时在提示词里给出 Schema 与示例；
- 设置合理的 max_tokens，并检查停止原因，处理截断；
- 不要假设 temperature = 0 就逐字可复现，关键操作依靠参数校验与幂等设计兜底。

**评分要点（共 10 分）：**

- 正确说明贪心与束搜索的原理和主要缺点（3 分）
- 正确说明温度、top-k、top-p 的原理与区别，指出 top-k 不自适应、top-p 自适应（3 分）
- 给出各策略合理的适用场景（2 分）
- 给出工具调用的配置：低温或贪心、约束解码、关闭重复惩罚、处理截断（2 分）

**讲解：**

**常见失分点**：把 top-p 说成「保留概率大于 p 的 token」；说「温度越高模型越聪明」；认为束搜索适合聊天；工具调用只说「温度调低」而不提约束解码与参数校验；以为 temperature = 0 一定可复现。

<sub>考点：贪心解码、束搜索、温度、Top-k采样、Top-p采样　｜　出处：Holtzman 等, arXiv:1904.09751</sub>

</details>

---

## 场景分析题

<a name="LLM-DEC-034"></a>

### LLM-DEC-034　挑战 · 考频 ★★★

某电商客服机器人（基于开源模型自部署）上线时为了让回答「更生动」，对所有请求统一使用 temperature = 1.2、top_p = 1.0、repetition_penalty = 1.5。两周后投诉集中在：
(1) 编造订单号、退款金额和并不存在的政策条款；
(2) 同一个问题问两次，答案前后不一致；
(3) 回答中偶尔夹杂奇怪的词，或中英混杂；
(4) 调用工具时 JSON 参数经常解析失败，键名被改写（如 `order_id` 变成 `orderId` 或 `order_no`）。
请从解码配置的角度分析原因，给出按任务区分的配置方案，并说明还需要哪些非解码手段和验证方法。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 原因分析**
- **温度过高且不截断**：$T=1.2$ 把分布拉平，top_p = 1.0 不做任何截断，尾部低概率 token 被频繁抽中。订单号、金额、条款这类「一个 token 错就全错」的内容最先出问题，奇怪用词和语言混杂也来自尾部 token。
- **随机性大导致不一致**：每次采样走不同的路径，同一问题的答案自然不稳定。
- **重复惩罚过强**：Hugging Face 的 repetition_penalty 默认连提示词里出现过的 token 一起惩罚。检索到的政策原文、用户给出的订单号，模型反而被迫避开、改写，诱发编造；JSON 中已经用过或出现在 Schema 里的键名也被惩罚，于是 `order_id` 被改写成别的写法。
- **工具调用没有格式约束**：只靠提示词约束 JSON，在高温下解析失败率更高。

**2. 按任务区分的配置**
- **工具调用 / JSON 参数**：贪心或 temperature ≤ 0.2；关闭重复惩罚；开启基于 JSON Schema 的约束解码；检查停止原因，处理截断。
- **政策问答（有检索证据）**：temperature 0.2～0.5、top_p 约 0.9；关闭重复惩罚，允许照抄原文中的数字与条款。
- **闲聊、安抚话术**：temperature 0.7～0.9，配合 top_p 0.9～0.95 或 min-p 约 0.05～0.1；如确有复读问题，用小的 presence / frequency penalty，而不是很大的乘除式惩罚。
- 推理模型按官方推荐参数设置，不要套用以上数值。

**3. 非解码手段**
- 订单号、金额等事实只能来自工具或数据库返回，提示词中要求「没有依据就说不知道」，回答中引用来源；
- 输出后校验：订单号格式与存在性、金额与系统记录一致、JSON 按 Schema 验证，失败则重试或转人工；
- 高频问题可以缓存标准答案，保证一致。

**4. 验证**
- 离线：构造覆盖各意图的评测集，比较新旧配置的幻觉率（与工具返回或政策原文核对）、同题多次回答的一致率、JSON 解析成功率与工具调用成功率；
- 线上：灰度 A/B，监控投诉率、转人工率、重试率，并按意图拆分观察。

**评分要点（共 10 分）：**

- 指出高温加不截断导致尾部 token 被抽中，并联系到编造与怪词（2 分）
- 指出重复惩罚会惩罚提示词与已用键名，导致不肯照抄事实、改写键名（2 分）
- 给出按任务区分的解码配置，含工具调用的低温度加约束解码（3 分）
- 给出非解码手段：工具取数、引用依据、输出校验等（2 分）
- 给出离线与线上的验证指标（1 分）

**讲解：**

**常见失分点**：只说「把温度调低」，没有按任务区分；没意识到重复惩罚会惩罚提示词中的 token，进而导致改写订单号和键名；把幻觉全部归因于模型本身，不提工具取数与输出校验；没有给出可量化的验证指标。

<sub>考点：解码与幻觉、温度、重复惩罚、约束解码与结构化输出　｜　出处：Hugging Face transformers 源码（RepetitionPenaltyLogitsProcessor）；Lee 等, arXiv:2206.04624</sub>

</details>

---
