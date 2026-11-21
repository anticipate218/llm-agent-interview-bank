# INF-SERVE · 推理服务与框架

> 所属大类：推理与部署　｜　题量：43

推理框架、并行部署、结构化输出与容量规划。

**考点覆盖**：vLLM（7） · SGLang（4） · TensorRT-LLM（4） · llama.cpp与端侧（5） · 张量并行推理（6） · 流水线与专家并行推理（6） · 多LoRA服务（5） · 结构化输出（4） · OpenAI兼容API（4） · 容量规划（7） · 推理成本估算（3） · 推理服务监控（5） · 国产硬件部署（4）

**题型**：[单选题（12）](#单选题) · [多选题（7）](#多选题) · [判断题（6）](#判断题) · [填空题（2）](#填空题) · [计算题（6）](#计算题) · [代码填空题（1）](#代码填空题) · [简答题（5）](#简答题) · [场景分析题（3）](#场景分析题) · [系统设计题（1）](#系统设计题)

---

## 单选题

<a name="INF-SERVE-001"></a>

### INF-SERVE-001　基础 · 考频 ★★★

下列「场景 → 推理框架」的对应中，最合理的一组是：

- **A.** MacBook 上离线运行 4 bit 量化模型 → TensorRT-LLM；Agent 多轮对话服务 → SGLang；通用的 OpenAI 兼容服务 → vLLM
- **B.** MacBook 上离线运行 4 bit 量化模型 → llama.cpp；高并发的在线 API 服务 → llama.cpp；通用的 OpenAI 兼容服务 → vLLM
- **C.** MacBook 上离线运行 4 bit 量化模型 → llama.cpp；大量前缀复用的 Agent 服务 → SGLang；覆盖多种模型与硬件的通用服务 → vLLM
- **D.** AMD GPU 集群上的在线服务 → TensorRT-LLM；Agent 多轮对话服务 → SGLang；通用的 OpenAI 兼容服务 → vLLM

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：四个框架的定位可以概括为——vLLM 覆盖面最广、是默认首选；SGLang 擅长前缀复用、结构化输出与大规模 MoE 部署；TensorRT-LLM 是 NVIDIA 官方、kernel 优化最深；llama.cpp 主打本地与端侧。

- A 错：TensorRT-LLM 只支持 NVIDIA GPU，不能在 MacBook（Apple Silicon）上运行；本地跑量化模型是 llama.cpp（及基于它的 Ollama 等工具）的主场。
- B 错：llama.cpp 面向单机、少量并发的本地推理，连续批处理与显存管理都不以高并发吞吐为目标，在线 API 服务应选 vLLM、SGLang 等。
- D 错：TensorRT-LLM 只能运行在 NVIDIA GPU 上；AMD GPU 可以选择支持 ROCm 的 vLLM、SGLang。

最终选型仍应以自己的模型、硬件与负载压测为准。

<sub>考点：vLLM、SGLang、TensorRT-LLM、llama.cpp与端侧　｜　出处：vLLM 文档：GPU 安装（CUDA / ROCm / XPU）https://docs.vllm.ai/en/latest/getting_started/installation/gpu.html；SGLang 文档：AMD GPUs https://github.com/sgl-project/sglang/blob/main/docs/platforms/amd_gpu.md；llama.cpp https://github.com/ggml-org/llama.cpp；TensorRT-LLM https://github.com/NVIDIA/TensorRT-LLM</sub>

</details>

---

<a name="INF-SERVE-004"></a>

### INF-SERVE-004　进阶 · 考频 ★★

SGLang v0.4（2024 年 12 月）引入的「零开销批调度器」（zero-overhead batch scheduler）主要解决的是：

- **A.** 调度等 CPU 工作与 GPU 计算串行导致 GPU 空等；让 CPU 提前准备下一批，与当前批重叠
- **B.** 大小不一的 batch 反复申请、释放 KV 显存造成的碎片，导致可调度的 batch 变小
- **C.** 长提示词的 Prefill 阻塞 Decode 的问题，做法是把 Prefill 拆块后与 Decode 混合执行
- **D.** 多卡张量并行中 all-reduce 的通信开销：让通信与下一层的计算重叠，消除卡间等待

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：这是针对「CPU 开销」的优化。

Decode 每一步的 GPU 计算只有几到几十毫秒，而调度器要做的事不少：挑选本步的请求、分配 KV、构造输入张量、处理采样结果、检查停止条件、反分词。若这些 CPU 工作与 GPU 计算串行，GPU 每步都要空等一段时间，模型越小、batch 越小，空等的比例越高。SGLang v0.4 让 CPU 在 GPU 执行当前批的同时就为下一批做好准备，官方博客报告吞吐提升约 1.1 倍。vLLM V1 把 API 服务、分词、调度放到独立进程中，思路类似。

- B 是 PagedAttention 解决的问题；
- C 是 Chunked Prefill 要解决的问题，与「零开销」调度无关；
- D 是通信优化（如计算与通信重叠）要解决的问题。

<sub>考点：SGLang　｜　出处：SGLang v0.4 发布博客 https://www.lmsys.org/blog/2024-12-04-sglang-v0-4/</sub>

</details>

---

<a name="INF-SERVE-006"></a>

### INF-SERVE-006　基础 · 考频 ★★

关于 TensorRT-LLM，下列说法正确的是：

- **A.** 社区开发的 C/C++ 推理库，主打 CPU 与 Apple Silicon 上的本地推理，模型使用 GGUF 格式
- **B.** 最早提出 PagedAttention 与连续批处理的推理框架，后来成为 vLLM 的底层引擎
- **C.** 面向单卡部署优化，不支持张量并行与专家并行，多卡场景要靠 Triton Inference Server 编排多副本
- **D.** NVIDIA 官方的开源推理库，针对 NVIDIA GPU 深度优化 kernel，支持 FP8、FP4 等低精度

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：TensorRT-LLM 的定位是「在 NVIDIA GPU 上把性能做到极致」。它提供 in-flight batching（即连续批处理）、分页 KV Cache、Chunked Prefill、FP8 / FP4 量化（Hopper 上 FP8、Blackwell 上 FP4）、EAGLE / MTP / n-gram 等投机解码、张量 / 流水线 / 专家并行与 PD 分离等能力，并能接入 Triton Inference Server 与 Dynamo。代价是只支持 NVIDIA 硬件，版本迭代快、接口变化较多。

- A 是 llama.cpp；
- B 错：PagedAttention 来自 vLLM（PagedAttention 论文的作者团队开发），连续批处理（迭代级调度）则由 Orca 提出，TensorRT-LLM 也不是 vLLM 的底层引擎；
- C 错：TensorRT-LLM 支持单机多卡与多机部署，包括张量、流水线与专家并行。

<sub>考点：TensorRT-LLM　｜　出处：TensorRT-LLM 文档 https://nvidia.github.io/TensorRT-LLM/overview.html</sub>

</details>

---

<a name="INF-SERVE-008"></a>

### INF-SERVE-008　基础 · 考频 ★★

关于 llama.cpp，下列说法正确的是：

- **A.** 主打数据中心的高并发服务：用 PagedAttention 与张量并行，单机吞吐通常高于 vLLM
- **B.** C/C++ 实现，模型存为 GGUF 格式，支持多种低比特量化，可在 CPU、Metal、CUDA 等后端运行
- **C.** 模型以 FP16 / BF16 的 safetensors 格式加载，不支持低比特量化，需要量化时要改用其他框架
- **D.** 依赖 CUDA 与 cuBLAS，必须在 NVIDIA GPU 上运行，不支持 CPU 推理

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：llama.cpp 是本地与端侧推理的事实标准之一，Ollama、LM Studio 等本地工具都曾以它为基础。

它的特点：
- **GGUF**：把权重、分词器、元数据打包进单个文件，便于分发；
- **量化**：Q4_0、Q8_0、K-quants 等多种格式，4 bit 让 7B 模型只需 4 GB 左右，能装进笔记本或手机；
- **多后端**：x86 / ARM 的 CPU SIMD、Apple Metal、CUDA、Vulkan 等；
- **部分卸载**：显存不够时用 `-ngl`（`--n-gpu-layers`）只把若干层放到 GPU，其余在 CPU 上算；
- **服务**：`llama-server` 提供 OpenAI 兼容接口，方便本地应用接入。

- A 错：llama.cpp 面向单机、低并发，高并发吞吐不是它的目标。
- C 错：它使用自己的 GGUF 格式，核心价值之一就是丰富的低比特量化格式。
- D 错：它最初就以 CPU 和 Apple Silicon 为主要目标，CUDA 只是可选后端之一。

<sub>考点：llama.cpp与端侧　｜　出处：llama.cpp https://github.com/ggml-org/llama.cpp</sub>

</details>

---

<a name="INF-SERVE-011"></a>

### INF-SERVE-011　进阶 · 考频 ★★★

一个 8B 模型单张 H100 就能放下。团队在两种部署之间犹豫：4 个单卡副本（多副本，DP = 4），或 2 组 TP = 2。下列对比最准确的是：

- **A.** TP = 2 单步时延更低，适合 TPOT 要求严的场景；多副本无卡间通信，总吞吐通常更高
- **B.** TP = 2 让单步时延严格减半，两组 TP 的总吞吐也与 4 个副本相同，应优先选 TP
- **C.** 多副本没有 all-reduce，单步时延比 TP = 2 更低、总吞吐也更高，TP 只在模型放不下时才有用
- **D.** TP = 2 每层要做两次 all-reduce，单步时延反而高于单卡，推理中只在模型放不下单卡时才用

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：单卡放得下时，默认用多副本；只有当 TPOT 的 SLO 单卡达不到时，才用 TP 换更低的单步时延。

- **TP 的收益**：Decode 卡在带宽，每张卡只读 $1/\text{TP}$ 的权重与 KV，单步耗时近似按 TP 下降，直接改善 TPOT。
- **TP 的代价**：每层 2 次 all-reduce，batch 小时以延迟为主，占比随 TP 增大而上升；单步时延不会严格减半，每张卡的吞吐效率下降。
- **多副本**：副本之间不通信，4 张卡就是 4 份完整的吞吐，加一个负载均衡器即可，扩缩容也最简单。

- B 错：通信开销使 TP 达不到线性加速，同样卡数下总吞吐通常不如多副本。
- C 错：多副本中每个请求仍在单卡上跑，单步时延与单卡相同，比 TP = 2 更高。
- D 错：Decode 卡在带宽，TP 让每张卡读的字节减半，通信开销通常抵不过这部分收益；推理中 TP 对降低单步时延、放下单卡装不下的模型都很关键。

<sub>考点：张量并行推理</sub>

</details>

---

<a name="INF-SERVE-014"></a>

### INF-SERVE-014　基础 · 考频 ★★

关于推理中的流水线并行（PP），下列说法正确的是：

- **A.** PP 让每张卡只算 1/段数 的层，各段并行计算，单个请求的 TPOT 按段数成比例下降
- **B.** PP 每一层都要在各段之间做两次 all-reduce 同步激活，通信量比 TP 更大，只适合机内 NVLink
- **C.** 一个 token 仍要依次经过各段，单 token 时延不降反升，要靠多个微批同时流动才能用满各段
- **D.** PP 需要反向传播来填满流水线气泡，推理只有前向，因此推理中几乎不用 PP

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：PP 解决「放不下」和「跨机通信」的问题，不解决「单请求慢」的问题。

生成一个 token 必须从第 1 层算到最后一层，切成几段只是让这些层分布在不同的卡上，依次计算；段间还要传激活，所以单 token 时延略有增加。只有同时有多个微批（多组请求）在流水线中流动，各段才能都忙起来，总吞吐才上得去；请求少时会出现气泡。

- A 错：这是把「每张卡的工作量」误当成「每个 token 的时延」。降低单步时延要靠 TP。
- B 错：每层两次 all-reduce 是 TP 的特点；PP 只在段边界做点对点传输。
- D 错：推理靠多个请求组成的微批来填满流水线，不需要反向传播；PP 常用于跨机部署大模型，如机内 TP、机间 PP。

<sub>考点：流水线与专家并行推理</sub>

</details>

---

<a name="INF-SERVE-017"></a>

### INF-SERVE-017　进阶 · 考频 ★★

多 LoRA 服务中，不同 adapter 的请求常常共用同一段系统提示词。前缀缓存的键为什么必须包含 LoRA 编号？

- **A.** 缓存命中会让不同 adapter 的请求共享计费单元，加编号是为了按 adapter 分别统计 token 用量
- **B.** adapter 会改变各层的 K、V 投影或隐状态，同样的前缀算出的 KV 不同，混用会出错
- **C.** LoRA 通常只作用于 lm_head，不影响 KV，加编号只是为了多租户之间的隔离与安全
- **D.** 不同 adapter 的秩不同，每个 token 的 KV 大小随秩变化，不同 adapter 的 KV 块无法混放

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：前缀缓存复用的前提是「同样的前缀算出同样的 KV」，而 KV 取决于整个模型的计算，adapter 不同，KV 就不同。

LoRA 常加在 q、k、v、o 与 MLP 上。即使某个 adapter 只改 MLP，第 1 层之后的隐状态也变了，后续各层的 K、V 都会不同。若只按 token 内容查缓存，甲客户的请求会用到乙客户 adapter 算出的 KV，结果错误，还可能泄露信息。所以 vLLM 等框架把 LoRA 编号作为块哈希的额外键；同理，多模态输入的哈希、租户盐也会进入缓存键。

- A 错：计费与缓存键无关。
- C 错：LoRA 一般不只作用于 lm_head；即使只作用于 lm_head，KV 不变，复用才是安全的——但这是特例，不能作为通用规则。
- D 错：LoRA 的秩只影响增量矩阵的大小；K、V 的维度由底座模型的 KV 头数与头维度决定，与秩无关。

<sub>考点：多LoRA服务</sub>

</details>

---

<a name="INF-SERVE-020"></a>

### INF-SERVE-020　进阶 · 考频 ★★

把 JSON Schema 或正则编译成状态机来做约束解码时，必须处理「token 不等于字符」的问题。下列说法正确的是：

- **A.** 只需在生成结束后检查 JSON 是否合法，不合法就带着错误信息重试，效果与约束解码等价
- **B.** 把词表限制为单字符的 token 就不存在这个问题；模型在字符级别同样训练过，生成质量基本不变
- **C.** 分词器训练时会把 JSON 的引号、括号等符号单独切分，token 边界与语法单元对齐，按 token 比较即可
- **D.** 判断 token 是否合法要把它的字符依次喂给状态机，可为每个状态预先算好合法 token 集合

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：约束解码的状态机定义在字符上，模型却按 token 生成，两者之间要做一次「token → 字符串 → 状态转移」的映射。

一个 token 可能包含多个字符、跨越多个语法单元（如 `", "` 同时结束字符串、写出逗号、开始下一个键）。每一步，对词表中的每个 token，把它的字符逐个喂给状态机，不中途失败才算合法；非法 token 的 logit 置为 $-\infty$。逐 token、逐字符地实时检查代价太高（词表常有十几万个 token），所以 Outlines 为状态机的每个状态预先算好「合法 token 集合」，运行时查表即可；XGrammar 等进一步把能预先检查的 token 与必须在运行时检查的 token 分开处理。

- A 错：事后校验加重试只能兜底，失败时要成倍增加时延与成本，小模型还可能反复失败；约束解码在生成过程中就保证合法。
- B 错：强迫模型逐字符输出会严重偏离它训练时的分布，质量和速度都会大幅下降。
- C 错：分词按统计规律合并字符，不理会语法；`", "`、`":`、`"}` 这类跨边界的 token 很常见。

<sub>考点：结构化输出　｜　出处：Outlines（Willard 与 Louf, 2023, arXiv:2307.09702）</sub>

</details>

---

<a name="INF-SERVE-024"></a>

### INF-SERVE-024　基础 · 考频 ★★

推理框架宣称提供「OpenAI 兼容 API」，它的主要含义是：

- **A.** 请求与响应的格式与 OpenAI API 一致，现有 SDK 改一下 base_url 就能接入
- **B.** 部署的模型经过 OpenAI 格式的对齐微调，输出风格与 OpenAI 官方模型一致
- **C.** 服务内部把请求转发给 OpenAI 的服务器处理，本地模型只在网络不通时兜底
- **D.** 使用与 OpenAI 相同的 tiktoken 分词器，token 计数与 OpenAI 的计费结果一致

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：「兼容」指的是**接口协议**一致，不涉及模型本身。

OpenAI 的接口已成为事实标准，vLLM、SGLang、TensorRT-LLM（`trtllm-serve`）、llama.cpp（`llama-server`）都实现了 `/v1/chat/completions`、`/v1/completions`、`/v1/models` 等接口，支持流式输出，多数也支持 tools 与结构化输出。应用侧用同一套 SDK 和代码，改一下 base_url 和 API Key，就能在云端 API 与自部署模型之间切换，或通过网关统一管理多个模型。

- B 错：「兼容」与模型训练无关；模型是你自己部署的开源模型，能力与输出当然不同。
- C 错：自部署服务在本地完成推理，不经过 OpenAI。
- D 错：token 数由所部署模型自己的分词器决定，不会改用 tiktoken，与 OpenAI 模型的计数不同；成本核算要以服务返回的 usage 为准。

要注意的是，「兼容」也常常不完整：部分参数可能不支持或语义不同，扩展参数（如 top_k）要通过 `extra_body` 传递，接入前应按自己用到的功能逐项验证。

<sub>考点：OpenAI兼容API　｜　出处：vLLM OpenAI 兼容服务文档 https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/</sub>

</details>

---

<a name="INF-SERVE-025"></a>

### INF-SERVE-025　进阶 · 考频 ★★

团队用自研的推理服务部署了一个开源对话模型，对外提供 OpenAI 兼容接口。上线后发现：模型经常不停止生成，回复里出现 `<|im_start|>user` 之类的字样，还会自己编造下一轮的用户提问。最可能的原因是：

- **A.** 采样温度设得太高，模型在回答结束时没有以足够高的概率选中结束标记，越写越发散
- **B.** 没按模型的对话模板拼接 messages，或没把回合结束标记（如 `<|im_end|>`）设为停止条件
- **C.** KV Cache 用了 FP8 量化，特殊 token 的注意力被量化误差抹平，模型识别不出回合边界，停不下来
- **D.** `max_tokens` 设得太大，模型被迫写满长度上限，只好续写出下一轮的用户提问

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：这是对话模板或停止条件出错的典型症状。

Chat 接口收到的是结构化的 messages，服务端要用模型自带的对话模板（tokenizer 配置中的 chat template）把它们拼成训练时见过的格式，并在末尾加上「助手开始回答」的提示。模型学会了在回合结束时输出结束标记（如 `<|im_end|>`），服务端要把它当作停止条件。

- 模板不对，模型看到的格式与训练时不同，行为就会异常；
- 没把结束标记设为停止条件，模型输出它后会「顺势」开始写下一轮的 `<|im_start|>user`，看起来像在自问自答。

vLLM 等框架默认使用模型自带的模板，也可以用 `--chat-template` 指定；生成配置中的 EOS token 也要正确。

- A 错：温度过高会让内容发散，但不会系统性地出现对话模板的特殊标记。
- C 错：FP8 KV 一般只带来轻微的精度变化，不会导致这种格式性错误。
- D 错：`max_tokens` 只是上限，模型输出结束标记（且服务端识别它）就会停止，设得再大也不会被迫写满；太小则只会让回答被截断。

<sub>考点：OpenAI兼容API　｜　出处：vLLM OpenAI 兼容服务文档 https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/</sub>

</details>

---

<a name="INF-SERVE-030"></a>

### INF-SERVE-030　基础 · 考频 ★★★

推理服务做水平自动扩缩容时，最适合作为扩容依据的信号是：

- **A.** nvidia-smi 报告的 GPU-Util
- **B.** 推理进程所在机器的 CPU 使用率
- **C.** 排队中的请求数（或排队时间）与 KV Cache 使用率
- **D.** 每秒请求数（QPS）的绝对值，不考虑请求的输入输出长度

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：扩容要看「服务是否已经接不住」，最直接的信号是排队与 KV 容量。

- 排队请求数 / 排队时间上升，说明到达速率超过了处理能力，TTFT 即将超标；
- KV 使用率持续接近上限（常伴随抢占），说明并发已经到达显存容量的上限。

- A 错：GPU-Util 只表示「有 kernel 在运行的时间占比」，Decode 时即使算力利用率只有个位数，它也接近 100%，无法反映余量。
- B 错：CPU 使用率与 GPU 推理负载关系不大，除非瓶颈确实在分词或调度。
- D 错：同样的 QPS，请求长度不同，负载可能相差数倍；QPS 可以作为参考，但要结合 token 吞吐与 SLO。

还要注意冷启动：加载几十 GB 的权重、录制 CUDA Graph 需要几十秒到几分钟，扩容决策要留出提前量，并保留最小副本数。

<sub>考点：推理服务监控</sub>

</details>

---

<a name="INF-SERVE-036"></a>

### INF-SERVE-036　基础 · 考频 ★★

团队要把一套 NVIDIA GPU 上的大模型推理软件栈迁移到昇腾 NPU。关于两边组件的大致对应关系，下列说法最恰当的是：

- **A.** CANN 只是昇腾的设备驱动，地位相当于 NVIDIA 显卡驱动；算子库、图编译与集合通信能力都要另外从第三方开源项目获取
- **B.** PyTorch 模型必须先改写成 MindSpore 才能在昇腾上运行；vLLM 一类开源推理引擎无法使用昇腾，只能改用厂商的推理引擎
- **C.** HCCL 是昇腾上的推理服务框架，地位相当于 vLLM；torch_npu 是昇腾的集合通信库，相当于 NCCL，负责多卡之间的 all-reduce
- **D.** CANN 大致对应 CUDA 及算子库这一层，HCCL 对应 NCCL，torch_npu 让 PyTorch 调用 NPU，vLLM 可经 vllm-ascend 运行

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：昇腾的软件栈可以按层与 CUDA 生态对照：异构计算架构 CANN → 集合通信库 HCCL → 框架适配 torch_npu → 推理引擎（MindIE、vllm-ascend）。

- **CANN**（Compute Architecture for Neural Networks）：面向 AI 场景的异构计算架构，向上支持多种 AI 框架，向下对接昇腾 AI 处理器，提供多层编程接口；算子开发语言 Ascend C、ACLNN 算子接口等都属于这一层。
- **HCCL**（Huawei Collective Communication Library）：基于昇腾 AI 处理器的集合通信库，提供 all-reduce、all-to-all 等原语，地位相当于 NCCL。
- **torch_npu**：昇腾为 PyTorch 提供的适配插件，通过 PyTorch 的 PrivateUse1 机制接入，设备名为 `npu`（如 `x.npu()`）。
- **推理引擎**：可用 MindIE，或经硬件插件 vllm-ascend 运行 vLLM。MindIE 是昇腾的推理引擎，包含服务化（MindIE Service）、大模型推理（MindIE LLM）等组件；vllm-ascend 是社区维护的 vLLM 硬件插件，按 vLLM 的「Hardware Pluggable」机制接入。

- A 错：CANN 不只是驱动，而是包含编程接口、算子库、图编译与运行时的一整层软件。
- B 错：PyTorch 模型可以经 torch_npu 直接运行，vLLM 也能通过 vllm-ascend 插件使用昇腾；MindSpore 是可选的框架，不是唯一路径。
- C 错：HCCL 是集合通信库（对应 NCCL），torch_npu 是 PyTorch 的适配插件，两者的角色说反了。

各组件的版本与特性变化较快，以官方文档为准；本题只考查分层对应关系（2026-11 查阅）。

<sub>考点：国产硬件部署　｜　出处：llama.cpp CANN 后端文档 https://github.com/ggml-org/llama.cpp/blob/master/docs/backend/CANN.md；HCCL https://gitcode.com/cann/hccl；torch_npu https://github.com/Ascend/pytorch；MindIE 文档 https://www.hiascend.com/doc_center/source/zh/mindie/100/whatismindie/mindie_what_0001.html；vllm-ascend https://github.com/vllm-project/vllm-ascend</sub>

</details>

---

## 多选题

<a name="INF-SERVE-002"></a>

### INF-SERVE-002　进阶 · 考频 ★★

关于 vLLM，下列说法正确的有：

- **A.** 启动前要先把 Hugging Face 权重编译成与 GPU 型号绑定的引擎文件，换卡后需重新构建
- **B.** V1 引擎默认开启前缀缓存，并在可能时默认启用 Chunked Prefill
- **C.** 底层 kernel 依赖 CUDA，仅支持 NVIDIA GPU，AMD 等硬件需改用其他框架
- **D.** 启动时先试跑一次测出峰值激活显存，再把剩余的可用显存预分配为 KV 块池
- **E.** 用 `vllm serve <模型>` 即可启动 OpenAI 兼容的 HTTP 服务

<details>
<summary>答案与解析</summary>

**答案：BDE**

**解析：**

- A 错：vLLM 直接加载 Hugging Face 格式的权重，不需要预编译引擎；需要构建引擎是 TensorRT-LLM 早期 TensorRT 后端的流程。
- B 对：V1 引擎（2025 年起成为默认）的调度器统一成「本步为每个请求计算多少个 token」，前缀缓存因开销接近零而默认开启，Chunked Prefill 也在可能时默认启用。
- C 错：vLLM 支持 NVIDIA、AMD（ROCm）等多种硬件，硬件覆盖面广正是它的特点之一。
- D 对：这是 vLLM 显存管理的基本做法：按 `gpu_memory_utilization`（默认 0.9）算出可用显存，扣除权重和试跑测得的峰值激活，其余预分配为 KV 块池。KV 块池一次性预留好，运行时按块分配给各请求，所以服务一启动显存就显示「占满」，同一张卡上也不宜再起第二个推理进程。
- E 对：`vllm serve` 提供 `/v1/chat/completions`、`/v1/completions`、`/v1/models` 等 OpenAI 兼容接口。

<sub>考点：vLLM　｜　出处：vLLM V1 发布博客 https://vllm.ai/blog/2025-01-27-v1-alpha-release</sub>

</details>

---

<a name="INF-SERVE-005"></a>

### INF-SERVE-005　进阶 · 考频 ★

SGLang 最初的论文把系统分成「前端语言」与「运行时」两部分。关于它的前端语言及其带来的优化，下列说法正确的有：

- **A.** 对正则约束的输出，运行时能把已经确定的一段字符一次性追加（jump-forward）
- **B.** 前端语言提供 gen、select、fork 等原语，可以把多次模型调用写成一个程序
- **C.** 程序中多次调用共享的前缀（如 fork 出的分支）由 RadixAttention 自动复用 KV
- **D.** 前端程序由本地解释器逐句执行，因此后端运行时不支持多卡并行，也不能多副本部署
- **E.** 前端语言把整个程序蒸馏、编译进一份新的模型权重，部署后不再需要运行时逐次调用

<details>
<summary>答案与解析</summary>

**答案：ABC**

**解析：**

SGLang 论文（Efficient Execution of Structured Language Model Programs）的核心观点是：Agent、few-shot、多轮对话、JSON 抽取等应用本质上是「多次调用 LLM 的程序」，前端负责表达程序，运行时负责高效执行。

- A 对：论文的另一项运行时优化是压缩有限状态机：把状态机中只有唯一出边的连续转移压缩成一段字符串，解码到这里时一次性追加，即 jump-forward。
- B 对：`gen` 生成、`select` 在候选中选择、`fork` 并行分支，分支、并行、条件选择等多次调用写成一个程序，程序结构对运行时可见。
- C 对：程序结构让共享前缀（长系统提示词、fork 出的分支等）显式化，RadixAttention 用基数树管理 KV，自动复用公共前缀。
- D 错：前端只负责向运行时发出调用，与运行时解耦，后端同样支持多卡并行与多副本部署。
- E 错：前端只是编程接口，不改变模型权重，程序仍由运行时执行。

论文报告在 Agent、推理、few-shot、JSON 解码、RAG、多轮对话等负载上最高约 6.4 倍的吞吐提升。如今多数用户只使用它的 OpenAI 兼容服务，前端语言主要在编排复杂调用时使用。

<sub>考点：SGLang　｜　出处：SGLang（Zheng 等, 2023, arXiv:2312.07104）</sub>

</details>

---

<a name="INF-SERVE-015"></a>

### INF-SERVE-015　挑战 · 考频 ★★

关于 MoE 模型推理中的专家并行（EP），下列说法正确的有：

- **A.** 专家并行中每个 token 都要把激活发给各张卡上的专家，通信量与 top-k 的大小无关
- **B.** Decode 阶段每步的消息很小，all-to-all 的延迟可以忽略，EP 的通信开销因此低于 TP
- **C.** EP 下每个 MoE 层要做两次 all-to-all：把 token 分发到所选专家所在的卡，算完再收回
- **D.** 可以为热门专家部署冗余副本来均衡各卡负载（如 DeepSeek-V3 的冗余专家）
- **E.** MLA 的 KV 只有一个压缩潜向量，按头做 TP 会让每张卡重复存 KV，注意力常改用数据并行

<details>
<summary>答案与解析</summary>

**答案：CDE**

**解析：**

- A 错：每个 token 只发往它选中的 top-k 个专家，通信量与 token 数 × top-k 成正比。
- B 错：Decode 时每步的消息很小，all-to-all 的延迟反而是主要开销，需要专门优化（如 DeepEP 的低延迟 kernel、通信与计算重叠）。
- C 对：分发（dispatch）与收回（combine）各一次 all-to-all，这是 EP 的基本通信模式。
- D 对：热门专家的负载更高，路由不均会让少数卡成为瓶颈。DeepSeek-V3 根据统计的专家负载，为高负载专家部署冗余副本，并定期调整。
- E 对：MLA 每层只缓存一个 512 维潜向量加一小段带 RoPE 的 key，不存在「按头切 KV」的空间，TP 会让每张卡重复存一份 KV。所以注意力部分常改用数据并行（各卡处理不同的请求）：SGLang 等框架的 DP Attention 让注意力按请求做数据并行，消除 KV 的重复存储，再与专家部分的 EP 配合。

规模参考：DeepSeek-V3 技术报告给出的最小部署单元是 Prefill 4 台机器 32 张卡（MoE 部分 EP32），Decode 40 台机器 320 张卡（MoE 部分 EP320）。

<sub>考点：流水线与专家并行推理　｜　出处：DeepSeek-V3 技术报告（arXiv:2412.19437）；SGLang v0.4 博客 https://www.lmsys.org/blog/2024-12-04-sglang-v0-4/</sub>

</details>

---

<a name="INF-SERVE-019"></a>

### INF-SERVE-019　进阶 · 考频 ★★

用 vLLM 一类推理框架在同一个底座上服务上百个 LoRA adapter 时，下列说法正确的有：

- **A.** `--max-lora-rank` 应设为各 adapter 中最大的秩，设得过大会浪费显存
- **B.** 单个 adapter 可把增量合并进底座权重、不增加推理开销，上百个 adapter 时则不宜逐个合并
- **C.** 首次用到未加载的 adapter 时，请求先用底座模型生成，待 adapter 加载完再切换，几乎不增加延迟
- **D.** adapter 可在 GPU、CPU 内存与磁盘之间按需换入换出，一个 batch 内的 adapter 数受 `--max-loras` 限制
- **E.** 同一 batch 可混合不同 adapter 的请求：底座部分合并计算，LoRA 增量由 SGMV 一类 kernel 分别计算

<details>
<summary>答案与解析</summary>

**答案：ABDE**

**解析：**

**结论**：A、B、D、E 正确。

- A 对：vLLM 按 `--max-lora-rank` 为 LoRA 槽位预留空间；文档建议设为实际 adapter 中最大的秩（如秩为 16 / 32 / 64 时设 64），设得过大既浪费显存，也可能拖慢计算。
- B 对：$W'=W+BA$ 与原权重形状相同，合并后没有额外计算，适合单一 adapter 的独立部署。但若为每个 adapter 都合并出完整权重，一份 8B 底座约 16 GB，100 个就是 1.6 TB，完全不现实，所以多 adapter 服务保持「一份底座 + 各自的小矩阵」。
- C 错：请求要等 adapter 就绪后才能用它计算，先用底座生成会得到不符合该 adapter 的结果。冷加载要从磁盘或 CPU 内存读入并拷到 GPU，首个请求的 TTFT 会变长；热门 adapter 应预加载或常驻。
- D 对：多 LoRA 服务的核心是「一份底座 + 分级缓存的 adapter」。vLLM 的 `--max-loras` 控制一个 batch 中可同时出现的 adapter 数，`--max-cpu-loras` 控制 CPU 侧缓存的数量，其余按需从磁盘加载。
- E 对：$xW$ 部分对整个 batch 一起算，$xAB$ 部分各请求的 $A$、$B$ 不同，用 Punica 的 SGMV 一类 kernel 在一个 kernel 里批量完成，避免按 adapter 拆 batch。

<sub>考点：多LoRA服务　｜　出处：vLLM LoRA 文档 https://docs.vllm.ai/en/latest/features/lora.html；Punica（Chen 等, 2023, arXiv:2310.18547）</sub>

</details>

---

<a name="INF-SERVE-022"></a>

### INF-SERVE-022　进阶 · 考频 ★★

关于推理引擎中结构化输出（约束解码）的实现，下列说法正确的有：

- **A.** 接下来的内容已经确定时（如固定的键名），可直接追加整段文本，省掉逐 token 解码
- **B.** 为支持一种新的 JSON Schema，引擎要先用该 Schema 的样例数据训练一个小模型来预测掩码
- **C.** XGrammar 把 token 分为可预先检查与需运行时检查两类，并让掩码计算与 GPU 前向重叠
- **D.** 正则与 JSON Schema 均可编译成有限状态机：即使允许任意深度的嵌套，也只是状态数更多，不用额外的栈
- **E.** 约束解码的主要开销在 GPU 上：每一步都要额外做一次完整的前向来计算词表掩码，吞吐约减半

<details>
<summary>答案与解析</summary>

**答案：AC**

**解析：**

**结论**：A、C 正确。

- A 对：例如生成到 `{"name": "` 之后，状态机只允许 `name` 字段的值；字段名、冒号这类唯一确定的片段可以整段追加，减少前向次数。SGLang 用压缩状态机实现这一点，称为 jump-forward。
- B 错：Schema 被编译成自动机或文法，是确定性的算法，不需要训练模型。
- C 对：多数 token 是否合法只取决于自动机的当前位置，与栈的内容无关，可以预先算好；少数 token 需要运行时查看栈。XGrammar 还把掩码的计算安排在 GPU 执行前向的同时进行，论文报告比已有方案快至多 100 倍，在端到端服务中接近零开销。
- D 错：有限状态机没有「记忆」，数不清括号的嵌套深度。嵌套深度有上限、结构固定的 Schema 可以展开成有限状态机，但允许任意深度嵌套的 JSON（如递归引用的 Schema）、代码等属于上下文无关文法，需要带栈的下推自动机。
- E 错：计算掩码不需要额外的前向，掩码由 CPU 侧的语法引擎计算，GPU 只需把掩码加到 logits 上；开销主要在 CPU 侧，没有与 GPU 重叠时会拖慢每一步。

<sub>考点：结构化输出　｜　出处：XGrammar（Dong 等, 2024, arXiv:2411.15100）；SGLang（arXiv:2312.07104）</sub>

</details>

---

<a name="INF-SERVE-026"></a>

### INF-SERVE-026　进阶 · 考频 ★

关于 vLLM 的 OpenAI 兼容服务，下列说法正确的有：

- **A.** usage 中的 token 数按 OpenAI 的 tiktoken 统一计算，便于与官方 API 的账单直接对比
- **B.** 规范之外的采样参数（如 `top_k`）可以通过 SDK 的 `extra_body` 传给服务端
- **C.** 要把工具调用解析成 `tool_calls`，需开启自动工具选择并用 `--tool-call-parser` 指定解析器
- **D.** chat 接口用模型自带的对话模板拼接 messages，没有模板时可用 `--chat-template` 指定
- **E.** 用 `--lora-modules` 注册的 adapter 可通过请求的 `model` 字段选择

<details>
<summary>答案与解析</summary>

**答案：BCDE**

**解析：**

**结论**：B、C、D、E 正确。

- A 错：token 数由部署模型的分词器决定，vLLM 不会改用 OpenAI 的 tiktoken 计数。
- B 对：OpenAI SDK 会校验已知参数，扩展参数放进 `extra_body` 原样透传，vLLM 文档列出了 `top_k`、`min_p`、`repetition_penalty` 等。
- C 对：不同模型的工具调用输出格式不同（如 Hermes、Llama 3.1 的 JSON 格式），需要匹配的解析器把文本转换成结构化的 `tool_calls`；`--enable-auto-tool-choice` 是必选项。
- D 对：vLLM 要求分词器配置中带有 chat template（Jinja2 模板），用它把 messages（以及 tools）拼成模型训练时的格式；模型没有模板时，可用 `--chat-template` 传入模板文件或字符串，否则 chat 请求会报错。模板不匹配是「不停止生成、自己编造下一轮」等问题的常见原因。另外，`model` 字段填写的是服务端注册的模型名或 adapter 名（可通过 `--served-model-name` 自定义），不必是 OpenAI 官方的模型名。
- E 对：vLLM 文档说明，注册后的 adapter 可以「像其他模型一样」通过 `model` 参数指定，与底座的请求并行处理（受 `max_loras` 限制），`/v1/models` 会同时列出底座和各个 adapter。上层网关可以借此把「部门 / 任务」映射到不同的 adapter 名称。

<sub>考点：OpenAI兼容API、多LoRA服务　｜　出处：vLLM 文档：LoRA https://docs.vllm.ai/en/latest/features/lora.html；工具调用 https://docs.vllm.ai/en/latest/features/tool_calling.html</sub>

</details>

---

<a name="INF-SERVE-037"></a>

### INF-SERVE-037　进阶 · 考频 ★★

把一个在 NVIDIA GPU 上运行良好的大模型推理服务迁移到昇腾 NPU，下列判断**正确**的有：

- **A.** 多卡通信换成平台对应的集合通信库（如 HCCL）之后，TP、EP 的通信原语与切分方式都不变，在 GPU 上调好的并行配置可以原样沿用，不必重新压测
- **B.** 手写的 CUDA kernel（.cu 源码、内联 PTX 等）不能直接在 NPU 上运行，需改用平台的融合算子或用 `Ascend C` 等重写
- **C.** 把 PyTorch 代码中的 `.cuda()` 换成 `.npu()` 后，eager 模式的推理性能即可与 GPU 相当，其他优化可以省略
- **D.** 昇腾驱动内置 CUDA 兼容层，GPU 上编译好的推理程序与 kernel 复制过去就能直接运行
- **E.** 精度对齐要在相同输入下逐层导出中间张量与 GPU 基线比对，定位第一个出现偏差的算子，不能只看最终回答

<details>
<summary>答案与解析</summary>

**答案：BE**

**解析：**

**结论**：迁移的主要工作集中在算子、精度、性能、通信四处，只有 B、E 正确。

- A 错：all-reduce、all-to-all 等集合通信的语义确实不变，但机内与机间的互联拓扑、带宽以及算子性能都不同，在 GPU 上最优的 TP、EP 划分与 batch 配置不一定仍然最优，必须重新评估和压测。
- B 对：CUDA kernel 依赖 NVIDIA 的编程模型与指令集，NPU 的计算单元和编程接口都不同。迁移前先盘点自定义算子（注意力、RMSNorm、RoPE、MoE 路由、量化 GEMM 等），优先换成平台已有的融合算子，缺的再自行开发。
- C 错：逐算子下发的 eager 模式在 NPU 上同样有可观的下发开销，部分算子还可能走较慢的实现路径。通常要启用图模式（torch_npu 提供图模式与 NPUGraph）、替换融合算子、重新调并行与 batch 参数，才能接近理想性能。
- D 错：NPU 不执行 CUDA 二进制，需要基于目标平台的软件栈（CANN、torch_npu 等）重新构建和适配。
- E 对：不同硬件上算子的实现、累加顺序和精度都可能不同，误差会逐层累积；在相同输入下逐层导出中间张量，用余弦相似度、最大误差等指标与 GPU 基线比对，才能区分「正常的浮点差异」与「实现错误」（如掩码、RoPE 维度配对方式、数值溢出）。

<sub>考点：国产硬件部署　｜　出处：torch_npu https://github.com/Ascend/pytorch；HCCL https://gitcode.com/cann/hccl；llama.cpp CANN 后端文档</sub>

</details>

---

## 判断题

<a name="INF-SERVE-003"></a>

### INF-SERVE-003　基础 · 考频 ★★

vLLM 服务刚启动、还没有任何请求时，nvidia-smi 就显示显存占用了约 90%，这说明发生了显存泄漏，应立即排查。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。这是 vLLM 的正常行为：启动时它先用最大 batch 试跑一次，测出权重与峰值激活所需的显存，然后把 `gpu_memory_utilization`（默认 0.9）比例内剩下的显存全部预分配成 KV Cache 块池，供后续请求按块使用。所以没有请求时显存也显示接近 90%。

判断显存是否真的紧张，要看 vLLM 暴露的 KV Cache 使用率、排队请求数和抢占次数，而不是 nvidia-smi 的显存占用。这也意味着同一张卡上不能随手再起第二个推理进程；确需共享时，要分别调小 `gpu_memory_utilization`。

<sub>考点：vLLM</sub>

</details>

---

<a name="INF-SERVE-007"></a>

### INF-SERVE-007　进阶 · 考频 ★

TensorRT-LLM 早期的标准流程要先用 `trtllm-build` 把模型编译成 TensorRT 引擎，引擎默认与构建时的 GPU 架构绑定，换卡型往往需要重新构建；按照官方 release notes，1.0 版起默认改为以 PyTorch 为后端，1.2 系列版本移除了 TensorRT 引擎后端，可以直接加载 Hugging Face 检查点。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**（以 2026 年的官方文档为准）。

- **早期**：转换检查点 → `trtllm-build` 构建引擎 → 运行。TensorRT 引擎默认只能在与构建时同类的 GPU 上运行，模型、并行方式、最大 batch / 序列长度等配置改变也常要重新构建，这是「工程投入更大」的主要来源。
- **之后**：1.0 版把 PyTorch 提升为默认后端（`trtllm-serve` 也默认 PyTorch），1.2 系列版本移除 TensorRT 后端（1.1 是最后一个同时保留两种后端的版本），`trtllm-build` 等工具随之下线，直接加载 Hugging Face 格式即可；kernel 层面的深度优化依然保留。

**启示**：推理框架演进很快，面试中描述框架的工作流时最好带上时间或版本，避免用过时的印象做判断；选型时以最新文档和自己的压测为准。

<sub>考点：TensorRT-LLM　｜　出处：TensorRT-LLM Release Notes https://nvidia.github.io/TensorRT-LLM/release-notes.html；迁移指南 https://nvidia.github.io/TensorRT-LLM/latest/legacy/tensorrt-backend-removal.html</sub>

</details>

---

<a name="INF-SERVE-013"></a>

### INF-SERVE-013　基础 · 考频 ★★

用两台 8 卡服务器部署一个单机放不下的大模型时，常见做法是「机内 TP = 8、机间 PP = 2」：TP 每层都要做两次 all-reduce，需要 NVLink 级的带宽；PP 只在段与段之间传一次激活，对跨机带宽的要求低得多。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。以 H100 为例，机内 NVLink 每卡双向带宽约 900 GB/s，而机间网络（如 400 Gb/s 的 InfiniBand，约 50 GB/s）低一个数量级以上。

- **TP 跨机**：80 层的模型每个 Decode 步要做 160 次 all-reduce，每次都要跨机，延迟与带宽都会成为瓶颈，单步时延反而变差。
- **PP 跨机**：两段之间每步只传一次激活（batch × 隐藏维度），通信量小，跨机代价可以接受。

代价是 PP 不降低单 token 时延，且需要多个微批才能填满流水线。所以常见组合是机内 TP、机间 PP；如果模型用 FP8 等格式能塞进单机（如 405B 的 FP8 权重约 405 GB，单机 8×80 GB 放得下），则优先单机部署，避免跨机。

<sub>考点：张量并行推理、流水线与专家并行推理</sub>

</details>

---

<a name="INF-SERVE-023"></a>

### INF-SERVE-023　进阶 · 考频 ★★

约束解码每一步把不合法 token 的 logit 置为 $-\infty$ 再重新归一化，因此对模型来说是「无损」的：它的输出分布等于「无约束采样后只保留合法结果」（拒绝采样）得到的分布。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。逐步掩码只在每一步局部重新归一化：

$$
P_{\text{mask}}(y)=\prod_t\frac{p(y_t\mid y_{<t})}{Z_t(y_{<t})}
$$

其中 $Z_t$ 是这一步合法 token 的概率之和。拒绝采样得到的是 $p(y)$ 在合法集合上的条件分布 $p(y)/Z$，分母是整个序列层面的常数。只要各步的 $Z_t$ 随前缀变化，两者就不相等：如果模型开头更倾向一个「之后很难写成合法格式」的前缀，掩码只会在后面硬拐，最终结果可能是低概率、不自然的输出。Grammar-Aligned Decoding（Park 等, 2024）专门分析了这种分布扭曲，并提出了修正方法。

**工程启示**：约束解码保证格式合法，但可能把模型逼向不自然的写法。在提示词里写清 Schema 并给出示例，让模型「本来就想」按格式输出，能减小这种扭曲；字段顺序与命名也尽量贴近模型的习惯。

<sub>考点：结构化输出　｜　出处：Grammar-Aligned Decoding（Park 等, 2024, arXiv:2405.21047）</sub>

</details>

---

<a name="INF-SERVE-029"></a>

### INF-SERVE-029　进阶 · 考频 ★★

自部署时，每个输出 token 的平均 GPU 成本通常明显高于每个输入 token：输入 token 在 Prefill 中并行处理、算力利用率高；而 Decode 每产出一个 token 都要把权重和 KV 读一遍，算力大量闲置。这也是 API 厂商的输出单价普遍高于输入单价的原因之一。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。以 8B 模型在 H100 上为例：Prefill 处于算力瓶颈，一张卡每秒能处理数万个输入 token；Decode 处于带宽瓶颈，即使组成大 batch，每张卡每秒也只能产出几千个 token。同一张卡、同样的时间，处理的输入 token 数往往是输出 token 数的约 10 倍，摊到每个 token 上的成本自然相差很多。

所以：
- API 的输出单价通常是输入的数倍；
- 降本时，压缩输出长度往往比压缩同等数量的输入更有效；
- 但 Agent、RAG 场景的输入量可能是输出的几十倍，输入的总成本仍可能占大头，前缀缓存（省掉重复的 Prefill）同样关键。

<sub>考点：推理成本估算</sub>

</details>

---

<a name="INF-SERVE-038"></a>

### INF-SERVE-038　进阶 · 考频 ★

借助 vLLM 的硬件插件机制，安装 vllm-ascend 之后，vLLM 主仓库中为 CUDA 实现的注意力后端和 kernel 会被自动编译到昇腾 NPU 上运行，因此支持的功能和性能特征都与 GPU 版一致，迁移时无需查阅插件的支持矩阵，也不必重新压测。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。硬件插件机制的思路是「解耦」，而不是「自动移植」：
1. vLLM 把硬件相关的实现集中到 Platform 模块，并重构了 Executor、Worker、ModelRunner、AttentionBackend、Communicator 等组件，使它们可以由插件替换；
2. 插件项目实现自己的 Platform 类，以及对应的 Worker、ModelRunner、注意力后端和通信模块，再通过 Python 的 entry point（`vllm.platform_plugins` 组）注册；用户只需 `pip install vllm vllm-ascend`，启动日志会显示插件被加载并激活；
3. 所以在 NPU 上运行的是插件提供的实现（调用 CANN 的算子与 HCCL 通信），CUDA 版的 kernel 不会被「自动编译」过去。

因此支持哪些模型、量化格式、并行方式与特性（如图模式、投机解码、PD 分离），要以插件的支持矩阵为准；性能也必须在目标硬件上重新压测，不能直接套用 GPU 上的数字。

<sub>考点：国产硬件部署、vLLM　｜　出处：vLLM 博客：Introducing vLLM Hardware Plugin, Best Practice from Ascend NPU（2025-05-12）https://blog.vllm.ai/2025/05/12/hardware-plugin.html；vllm-ascend https://github.com/vllm-project/vllm-ascend</sub>

</details>

---

## 填空题

<a name="INF-SERVE-009"></a>

### INF-SERVE-009　基础 · 考频 ★★

llama.cpp 的 Q4_0 格式每 32 个权重为一块，块内存放 32 个 4 bit 整数和 1 个 FP16 的 scale，平均每个权重占 ____ bit；按此估算，70 亿参数的模型约需 ____ GB（1 GB = $10^9$ B，忽略少量保持高精度的张量）。

<details>
<summary>答案与解析</summary>

**答案：** (1) 4.5；(2) 3.9 / 3.94 / 3.938 / 3.9375

**解析：**

- 每块：$32\times4$ bit + 16 bit $=144$ bit，即 18 字节；平均 $144/32=4.5$ bit/权重。
- 7B：$7\times10^9\times4.5/8\approx3.94$ GB，约为 FP16（14 GB）的 28%。

同理 Q8_0 每块 34 字节，平均 8.5 bit/权重。可以看出：「4 bit 量化」的实际体积并不是 FP16 的 1/4，而要加上 scale 等元数据的开销；llama.cpp 的 K-quants（如 Q4_K）用 256 个权重的超块和量化后的子块 scale 进一步压缩元数据。估算本地能否跑得动某个模型时，还要预留 KV Cache 与计算缓冲。

<sub>考点：llama.cpp与端侧　｜　出处：llama.cpp ggml-common.h https://github.com/ggml-org/llama.cpp/blob/master/ggml/src/ggml-common.h</sub>

</details>

---

<a name="INF-SERVE-018"></a>

### INF-SERVE-018　进阶 · 考频 ★★

Llama-3-8B 共 32 层，隐藏维度 4096，K、V 投影的输出维度各为 1024，MLP 中间维度 14336。在每层的 q、k、v、o、gate、up、down 共 7 个线性层上都加秩 $r=16$ 的 LoRA（一个 $d_{in}\times d_{out}$ 的线性层增加 $r(d_{in}+d_{out})$ 个参数）。一个 adapter 约有 ____ M 个参数（保留一位小数）；用 FP16 存储约 ____ MB（1 MB = $10^6$ B，保留一位小数）。

<details>
<summary>答案与解析</summary>

**答案：** (1) 41.9 / 41.94；(2) 83.9 / 83.89

**解析：**

每层：
- q、o：$16\times(4096+4096)=131072$，两个共 262144；
- k、v：$16\times(4096+1024)=81920$，两个共 163840；
- gate、up、down：$16\times(4096+14336)=294912$，三个共 884736；
- 合计 1,310,720。

32 层共 41,943,040 个参数，约 **41.9 M**；FP16 每个 2 字节，约 **83.9 MB**（恰好 80 MiB）。

**含义**：单个 adapter 只有底座（约 16 GB）的 0.5%，但 200 个 adapter 就有约 16.8 GB，与底座相当。所以多 LoRA 服务不会把所有 adapter 都常驻显存，而是在 GPU、CPU 内存、磁盘之间分级缓存、按需换入；同一个 batch 里混合不同 adapter 的请求，用 SGMV 一类 kernel 批量计算各自的 LoRA 增量。

<sub>考点：多LoRA服务　｜　出处：S-LoRA（Sheng 等, 2023, arXiv:2311.03285）</sub>

</details>

---

## 计算题

<a name="INF-SERVE-010"></a>

### INF-SERVE-010　进阶 · 考频 ★★

在一台笔记本上用 llama.cpp 运行 13B 模型的 Q4_0 版本：模型共 40 层，每层约 0.18 GB（词嵌入、输出层等其余部分忽略）。独立显卡显存 8 GB，扣除 KV 与计算缓冲后最多放 30 层（`-ngl 30`），其余 10 层留在 CPU 上计算。显卡显存带宽约 360 GB/s，CPU 内存带宽约 60 GB/s。batch = 1 的 Decode 处于带宽瓶颈，每生成一个 token 要把所有层的权重各读一遍（忽略 KV 与层间传输）。

(1) 估算每秒最多生成多少个 token；
(2) 如果 40 层全部在 GPU 上、或全部在 CPU 上，分别是多少？
(3) 由此说明部分卸载（partial offload）的特点与优化方向。

<details>
<summary>答案与解析</summary>

**答案：(1) 每 token 约 45 ms，约 22 token/s；(2) 全在 GPU 约 50 token/s，全在 CPU 约 8.3 token/s；(3) 速度由最慢的部分主导：只占 25% 的 CPU 层贡献了 2/3 的时间，应尽量让更多层进显存**

**解析：**

**(1)**
- GPU 部分：$30\times0.18=5.4$ GB，$5.4/360=15$ ms；
- CPU 部分：$10\times0.18=1.8$ GB，$1.8/60=30$ ms；
- 每 token 约 45 ms，约 **22 token/s**。

**(2)** 全在 GPU：$7.2/360=20$ ms，约 **50 token/s**；全在 CPU：$7.2/60=120$ ms，约 **8.3 token/s**。

**(3)** 两段是串行的，总时间等于各段时间之和。CPU 的带宽只有 GPU 的 1/6，留在 CPU 上的 25% 的层占了 2/3 的时间。所以：
- 尽量让更多层进显存：缩短上下文上限或量化 KV，给权重腾出空间；
- 换更小的量化格式或更小的模型，争取全部放进 GPU；
- Apple Silicon 的统一内存没有这种「两段带宽」的问题，速度取决于统一内存带宽。

这些都是上界估算，实际还受 kernel 效率、计算缓冲与 KV 读取的影响。

<sub>考点：llama.cpp与端侧</sub>

</details>

---

<a name="INF-SERVE-012"></a>

### INF-SERVE-012　挑战 · 考频 ★★

Llama-3-70B（80 层，BF16 权重约 141 GB）在 H100（显存带宽 3.35 TB/s）上做张量并行推理，batch 很小（忽略 KV 读取与计算时间）。张量并行时每层有 2 次 all-reduce（注意力输出投影之后、MLP 下投影之后各一次）；batch 很小时每次消息只有几百 KiB，all-reduce 的耗时以延迟为主，按每次 15 µs 计。

(1) TP = 4 与 TP = 8 时，每个 Decode 步读权重的时间、all-reduce 的总时间与单步时延各约多少？
(2) 从 TP = 4 换到 TP = 8，单步时延提升多少倍？通信占比如何变化？
(3) 据此说明增大 TP 的收益规律。

<details>
<summary>答案与解析</summary>

**答案：(1) all-reduce 每步 160 次、共 2.4 ms；TP=4：读权重约 10.5 ms，单步约 12.9 ms；TP=8：读权重约 5.3 ms，单步约 7.7 ms；(2) 约 1.69 倍，通信占比从约 19% 升到约 31%；(3) 读权重的时间随 TP 线性下降，而每层的通信延迟不随 TP 减小，收益递减**

**解析：**

**(1)** 每步 all-reduce 次数：$2\times80=160$ 次，共 $160\times15\ \mu\text{s}=2.4$ ms。
- TP = 4：每卡权重 $141/4\approx35.3$ GB，读取 $35.3/3.35\approx10.5$ ms，单步约 $10.5+2.4\approx12.9$ ms；
- TP = 8：每卡权重约 17.6 GB，读取约 5.3 ms，单步约 $5.3+2.4\approx7.7$ ms。

**(2)** $12.9/7.7\approx1.69$ 倍，而不是 2 倍；通信占比从 $2.4/12.9\approx19\%$ 升到 $2.4/7.7\approx31\%$。卡数翻倍、速度只提升 1.69 倍，每张卡的效率约为 $1.69/2\approx84\%$。

**(3)** 读权重（和 KV）的时间按 $1/\text{TP}$ 下降，但每层两次 all-reduce 的延迟基本不随 TP 减小，TP 越大，通信占比越高，收益递减；跨机后带宽还会骤降。所以 TP 一般限制在单机 NVLink 域内（≤ 8），按 TPOT 的 SLO 选能满足要求的最小 TP。工程上还会用通信与计算重叠、融合 all-reduce 等方法降低这部分开销。

<sub>考点：张量并行推理　｜　出处：Megatron-LM（Shoeybi 等, 2019, arXiv:1909.08053，张量并行每层前向两次 all-reduce）；NVIDIA H100 规格 https://www.nvidia.com/en-us/data-center/h100/；Llama 3 config.json（Hugging Face meta-llama/Meta-Llama-3-70B：80 层、64 个 Query 头、8 个 KV 头、词表 128256，约 70.55B 参数）</sub>

</details>

---

<a name="INF-SERVE-027"></a>

### INF-SERVE-027　挑战 · 考频 ★★★

某 8B 对话服务的流量画像：峰值 40 QPS；平均每个请求输入 2000 token（约 50% 命中前缀缓存）、输出 400 token。压测得到单卡（H100）在满足 SLO 时：Decode 吞吐 2500 个输出 token/s，Prefill 吞吐 20000 个（未命中缓存的）输入 token/s；Prefill 与 Decode 在同一批卡上分时进行。冗余按 30% 计。

(1) 峰值时 Decode 与 Prefill 各需要多少张卡的算力？共需多少张卡？
(2) 设平均 TTFT 0.5 s、TPOT 30 ms，用 Little 定律估算峰值时系统中同时在处理的请求数，以及平均每张卡上的并发数。
(3) 每条请求的 KV 最多约多大（每 token 128 KiB）？检查 KV 容量是否够用（单卡放完权重后，约有 50 GiB 可给 KV）。

<details>
<summary>答案与解析</summary>

**答案：(1) Decode 6.4 张、Prefill 2.0 张，共 8.4 张，加 30% 冗余后向上取整为 11 张；(2) 端到端约 12.5 s，同时在处理约 500 个请求，平均每卡约 45 个；(3) 每条最多约 300 MiB，每卡约 13 GiB，远小于 50 GiB，KV 容量不是瓶颈**

**解析：**

**(1)** 按「每秒需要的卡·秒」计算：
- Decode：$40\times400/2500=6.4$；
- Prefill：$40\times2000\times50\%/20000=2.0$（命中前缀缓存的部分不用重算）；
- 合计 8.4，乘 1.3 得 10.92，取 **11 张**。

**(2)** 平均端到端时延 $\approx0.5+0.03\times(400-1)\approx12.5$ s。Little 定律：在系统中的请求数 = 到达率 × 平均停留时间 $=40\times12.5=500$ 个，平均每卡 $500/11\approx45$ 个。

**(3)** 每条请求的 KV 最多 $(2000+400)\times128$ KiB $=300$ MiB；每卡约 $45\times300$ MiB $\approx13.2$ GiB，远小于 50 GiB。实际还有共享前缀，占用更少。所以这套配置的约束是算力与 SLO，而不是 KV 容量。

**要点**：
- 两个阶段都要算：本例 Prefill 占了约四分之一的算力；输入更长或缓存命中率下降时，Prefill 可能成为主要负载；
- 用峰值 QPS 配卡、按 P99 的长度分布复核，而不是只用平均值；
- 吞吐数字必须来自「满足 SLO」的压测，理论带宽公式只能用来估算数量级。

<sub>考点：容量规划</sub>

</details>

---

<a name="INF-SERVE-028"></a>

### INF-SERVE-028　进阶 · 考频 ★★

自部署推理服务：每张 H100 的成本按每小时 2.5 美元计；按当前负载压测，单卡在满足 SLO 时最多每秒输出 3000 个 token（已包含同一批卡上 Prefill 的耗时）。

(1) 卡满载运行时，每百万输出 token 的 GPU 成本是多少？
(2) 实际日均利用率只有 35%（其余时间卡空着但照样计费），每百万输出 token 的实际成本是多少？
(3) 若按峰值配卡，且峰值是日均的 2.5 倍、另加 30% 冗余，日均利用率最多约为多少？对应的成本是多少？

<details>
<summary>答案与解析</summary>

**答案：(1) 约 0.23 美元；(2) 约 0.66 美元；(3) 约 31%，约 0.75 美元**

**解析：**

**(1)** 每小时满载产出 $3000\times3600=1.08\times10^7$ 个 token，成本 $2.5/10.8\times10^{6}\ \text{token}$，即每百万 token 约 **0.23 美元**。

**(2)** 卡按小时计费，用不满也要付钱：$0.2315/0.35\approx$ **0.66 美元**。

**(3)** 配卡容量 = 日均负载 × 2.5 × 1.3，日均利用率最多为 $1/(2.5\times1.3)\approx30.8\%$，成本 $0.2315/0.308\approx$ **0.75 美元**。

**要点**：
- 自部署的单价 = 每小时卡费 ÷ 每小时**实际**产出；利用率往往是决定性因素，比卡的单价更重要；
- 提高利用率的手段：弹性扩缩容、把离线批处理（评测、数据标注）放到低峰期、多个业务共用推理池、自部署承接基线流量而把峰值溢出到 API；
- 这里只算了 GPU，还应加上 CPU、存储、网络和运维人力等成本。

<sub>考点：推理成本估算</sub>

</details>

---

<a name="INF-SERVE-040"></a>

### INF-SERVE-040　挑战 · 考频 ★★★

Qwen3-235B-A22B 的公开配置：总参数约 235B（其中各层专家约 227B、注意力约 6.7B，其余为词嵌入与输出层），94 层，注意力为 GQA：64 个 Query 头、4 个 KV 头、头维度 128。计划部署在一台 8 × 80 GB 的 GPU 服务器上，每卡显存按 72 GB 可用，KV Cache 用 BF16，忽略激活与框架的其他开销（1 GB 按 $10^9$ 字节计）。

(1) BF16 与 FP8 权重各约多大？能否放进这台机器？每卡还剩多少显存？
(2) 每个 token 的 KV Cache 是多少字节，合多少 KiB？
(3) 采用 FP8 权重、TP = 8（注意力与专家都按 8 路切分）。KV 头只有 4 个，8 路切分时每张卡要存 1 个 KV 头，即每个 KV 头在 2 张卡上各存一份。每张卡每个 token 的 KV 是多少字节？整机最多能同时容纳多少条 32K（32768 token）的序列？
(4) 如果把整机剩余的显存直接按「每 token 188 KiB」均分来估算，会得到多少条？说明差别从何而来。

<details>
<summary>答案与解析</summary>

**答案：(1) BF16 约 470 GB、FP8 约 235 GB，都放得下整机的 576 GB；每卡剩余约 13.2 GB（BF16）或 42.6 GB（FP8）；(2) 192,512 字节，即 188 KiB；(3) 每卡每 token 48,128 字节，最多约 27 条；(4) 约 54 条，高估一倍，因为 TP = 8 时 4 个 KV 头各被复制成两份**

**解析：**

**(1)** BF16：$235.1\times10^9\times2\approx470.2$ GB；FP8：约 235.1 GB。整机可用 $8\times72=576$ GB，都放得下。每卡剩余：BF16 为 $72-470.2/8\approx13.2$ GB；FP8 为 $72-235.1/8\approx42.6$ GB。

**(2)** $2\times94\times4\times128\times2=192{,}512$ 字节 $=188$ KiB。

**(3)** 每卡 1 个 KV 头：$2\times94\times1\times128\times2=48{,}128$ 字节 / token。每张卡都要为每条序列的每个 token 存这么多，整机容量由单卡决定：$42.6\times10^9\div48{,}128\approx88.5$ 万 token，$\div32768\approx27.0$，即 **27 条**。整机实际为每个 token 存了 $8\times48{,}128=385{,}024$ 字节，是逻辑 KV（192,512 字节）的 2 倍。

**(4)** $8\times42.6\times10^9\div192{,}512\approx177$ 万 token，约 **54 条**，高估一倍。原因：KV 头数（4）小于 TP（8）时，KV 头无法再往下切，只能复制；vLLM 的 `QKVParallelLinear` 在这种情况下会把 KV 头复制到多张卡上。

**延伸**：
- 若用 BF16 权重、TP = 8，每卡只剩约 13.2 GB，约 27.5 万 token，只能放约 8 条 32K 序列。对大 MoE 来说，FP8 权重省下的显存往往直接决定并发上限。
- 想避免 KV 复制，可以让注意力按请求做数据并行（每卡存一份完整的注意力权重，只服务自己的请求），专家部分做专家并行；代价是注意力权重在每卡重复存储，并且需要 all-to-all 通信。
- 这里算的只是显存上界，实际还要给激活、CUDA Graph、通信缓冲留出余量，再结合压测得到的吞吐与 SLO 决定实例数。

<sub>考点：流水线与专家并行推理、张量并行推理、容量规划　｜　出处：Qwen3-235B-A22B config.json（Hugging Face）；Qwen3 技术报告 arXiv:2505.09388；vLLM 文档 Basic Model（QKVParallelLinear 在 KV 头数少于 TP 时复制 KV 头）</sub>

</details>

---

<a name="INF-SERVE-041"></a>

### INF-SERVE-041　挑战 · 考频 ★★★

DeepSeek-V3 总参数约 671B，其中路由专家约 654B，其余（MLA 注意力、前 3 层稠密 FFN、共享专家、词嵌入与输出层等）约 17B。模型共 61 层，MLA 每层为每个 token 缓存 512 维的 KV 潜向量和 64 维的 RoPE key（BF16）。用 FP8 权重（每参数按 1 字节计）部署在 H100（80 GB）上，每卡可用 72 GB，忽略激活等开销（1 GB 按 $10^9$ 字节计）。

(1) 只考虑放下权重，最少要几张卡？按整机算要几台 8 卡服务器？用 2 台共 16 张卡、权重均分时，每卡剩多少显存给 KV？
(2) 每个 token 的 KV 是多少字节？若采用「机内 TP = 8、机间 PP = 2」（两段的层数与权重均分），由于 MLA 的潜向量不分头，同一段内的 8 张卡都要存本段各层的完整潜向量。最多能同时容纳多少条 32K（32768 token）的序列？
(3) 若改为「注意力按请求做数据并行（16 张卡各存一份约 17B 的非专家参数，各自服务不同的请求）+ 专家并行 EP = 16」，每卡剩多少显存给 KV？整机最多能容纳多少条 32K 序列（一条序列的 KV 只能放在一张卡上）？

<details>
<summary>答案与解析</summary>

**答案：(1) 至少 10 张卡，即 2 台；16 卡均分后每卡权重约 41.9 GB，剩约 30.1 GB；(2) 每 token 70,272 字节（约 68.6 KiB），约 26 条；(3) 每卡权重约 57.9 GB，剩约 14.1 GB，每卡 6 条，共约 96 条**

**解析：**

**(1)** $671\div72\approx9.3$，至少 **10 张卡**；单台 $8\times72=576$ GB 放不下 671 GB，需要 **2 台**。16 卡均分：每卡 $671/16\approx41.9$ GB，剩余 $72-41.9\approx30.1$ GB。

**(2)** 每 token 的 KV：$(512+64)\times61\times2=70{,}272$ 字节，约 68.6 KiB。PP = 2 时每张卡只负责一半的层，每 token 存 $70{,}272/2=35{,}136$ 字节；但 TP 切不开潜向量，同一段的 8 张卡各存一份。单卡容量 $30.06\times10^9\div35{,}136\approx85.6$ 万 token，$\div32768\approx26.1$，约 **26 条**。

**(3)** 每卡权重 $654/16+17\approx57.9$ GB，剩余约 14.1 GB。每卡只存自己所服务请求的完整 KV：$14.1\times10^9\div70{,}272\approx20.1$ 万 token，每卡 6 条，16 卡共约 **96 条**，约为 (2) 的 3.7 倍。

**结论**：
- MLA 每层每 token 只缓存 1,152 字节，比 8 个 KV 头的 GQA（如 Llama-3-70B，每层 4 KiB）小得多；但它「不分头」，TP 切分时每张卡都要存一份完整的潜向量，TP 越大，重复越多。
- 「注意力按请求做数据并行 + 大规模专家并行」虽然让每卡多存了约 17 GB 的非专家权重，却消除了 KV 的重复，并发容量高得多。DeepSeek-V3 的推理部署也是这个思路：注意力只用很小的 TP，主要靠数据并行扩展，MoE 部分用大规模专家并行。技术报告中 Prefill 的最小部署单元为 4 台 32 卡（注意力 TP4 + SP，配合 DP8；MoE 为 EP32），Decode 为 40 台 320 卡（注意力 TP4 + SP，配合 DP80；MoE 为 EP320）。
- 估算框架：权重（按**总参数**与所选精度）→ 每卡剩余显存 → 每 token 的 KV（看清所选并行方式下是否重复存储）→ 并发上限 → 再结合压测吞吐与 SLO 决定实例数。这里只是显存上界，实际还要给激活、通信缓冲和 CUDA Graph 留出余量。

<sub>考点：流水线与专家并行推理、容量规划　｜　出处：DeepSeek-V3 技术报告 arXiv:2412.19437（3.4 节推理部署）；DeepSeek-V3 config.json（Hugging Face）</sub>

</details>

---

## 代码填空题

<a name="INF-SERVE-021"></a>

### INF-SERVE-021　进阶 · 考频 ★★

下面用一个字符级状态机描述格式「1～3 位数字 + %」（如 `7%`、`42%`、`100%`）。补全 `allowed_tokens`：返回从当前状态出发、整个 token 都能被状态机接受的 token 列表，并且只有到达终态时才允许 EOS。

```python
DIGITS = set("0123456789")

def step(state, ch):
    """state 为已读入的数字个数（0～3），读入 % 后为 "END"；非法返回 None"""
    if state == "END":
        return None
    if ch in DIGITS and state < 3:
        return state + 1
    if ch == "%" and state >= 1:
        return "END"
    return None

def allowed_tokens(state, vocab, eos="<eos>"):
    ok = []
    for tok in vocab:
        s = state
        for ch in tok:                 # 一个 token 可能跨越多个字符
            s = ____
            if s is None:
                break
        if ____:
            ok.append(tok)
    if ____:
        ok.append(eos)
    return ok
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `step(s, ch)`；(2) `s is not None`；(3) `state == "END"`

**解析：**

- **空 1** `step(s, ch)`：把 token 的字符逐个喂给状态机，状态随之推进。
- **空 2** `s is not None`：整个 token 都没有让状态机失败才合法。不能只写 `s`：如果出现空字符串 token，状态保持为 0，会被误判为非法；更不能只检查第一个字符——`"12%"` 在状态 2 时第一个字符合法，但读到第二个数字就超过 3 位了。
- **空 3** `state == "END"`：EOS 只在终态（格式已完整）时允许，否则模型可能在 `"4"` 之后就结束，输出不完整。

**对应真实系统**：
- `"7%"`、`"12%"` 这类跨越「数字段 → 百分号」边界的 token，正是「token ≠ 字符」问题的缩影；
- 真实词表有十几万个 token，不可能每步都这样遍历，所以要为每个状态预先计算并缓存合法集合（Outlines 的索引），或像 XGrammar 那样区分可预检与需运行时检查的 token；
- 状态机设计要保证每个非终态都至少有一个合法 token，否则模型会走进「死胡同」。

<sub>考点：结构化输出</sub>

</details>

---

## 简答题

<a name="INF-SERVE-016"></a>

### INF-SERVE-016　进阶 · 考频 ★★★

推理部署时，如何在多副本（DP）、张量并行（TP）、流水线并行（PP）、专家并行（EP）之间做选择？请说明各自切分什么、通信模式、对单步时延与吞吐的影响，并给出选择顺序与一两个例子。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **多副本（DP）**：不切模型，每个副本一份完整权重；副本间不通信，前面加负载均衡（可按会话亲和）。单步时延与单卡相同，吞吐随副本数线性增长，最简单。
2. **TP**：每层的矩阵按列 / 行切分，注意力按头切；每层 2 次 all-reduce，需要 NVLink。每卡只读 $1/\text{TP}$ 的权重与 KV，**单步时延下降**，但收益随 TP 增大递减；KV 头数最好能被 TP 整除，否则要复制 KV 头。一般限于单机（≤ 8）。
3. **PP**：按层分段；段间点对点传激活，通信量小，适合跨机。**单 token 时延不降**，需要多个微批填满流水线，否则有气泡。
4. **EP**：MoE 的专家分散到多卡；每层两次 all-to-all；注意力部分常用数据并行（MLA 模型尤其如此）；要处理专家负载不均（冗余专家）。
5. **选择顺序**：单卡放得下 → 多副本；对 TPOT 要求极严 → 加 TP；单卡放不下 → 先量化（FP8 / INT4）或机内 TP；单机放不下 → 机内 TP + 机间 PP；MoE 大规模部署 → EP + 注意力 DP，规模更大时再考虑 PD 分离。
6. **例子**：8B 对话服务用 4 个单卡副本；70B 用 FP8 在 TP = 4 或 TP = 8 上部署；405B 用 FP8 单机 8 卡 TP = 8，BF16 则需两台机器 TP8 × PP2；DeepSeek-V3 这类 MoE 用 EP 加 DP Attention。

**评分要点（共 10 分）：**

- 正确说明 DP、TP、PP、EP 各自切分的对象与通信模式（4 分）
- 说明 TP 降单步时延、PP 不降时延、DP 线性扩吞吐（3 分）
- 给出合理的选择顺序（2 分）
- 给出贴切的例子或提到量化可减少并行度（1 分）

**讲解：**

**常见失分点**：照搬训练经验说「PP 能降低推理时延」；不知道 TP 每层两次 all-reduce、跨机 TP 很慢；忽略「先量化再决定并行度」这一步；MoE 只说 EP，不知道注意力部分要配合数据并行。

<sub>考点：张量并行推理、流水线与专家并行推理　｜　出处：DeepSeek-V3 技术报告（arXiv:2412.19437）</sub>

</details>

---

<a name="INF-SERVE-031"></a>

### INF-SERVE-031　进阶 · 考频 ★★★

一个基于 vLLM / SGLang 的线上推理服务应该监控哪些指标？请分类列出，说明各自反映什么问题，并给出告警与扩缩容的设计要点。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **延迟（按分位数）**：TTFT、TPOT、ITL、端到端时延的 P50 / P99；按模型、租户、输入长度分桶。TTFT 升高先看排队，ITL 尖刺多与长 Prefill 插队有关。
2. **吞吐与负载**：请求速率、输入 / 输出 token 速率、正在运行与排队的请求数、排队时间、每步的 batch 大小。
3. **显存与调度**：KV Cache 使用率、抢占次数（频繁抢占说明显存过紧或并发上限过高）、前缀缓存命中率（突然下降常由模板变更或路由变化引起）。
4. **错误与异常**：4xx / 5xx、超时、客户端中断、OOM，以及 `finish_reason=length` 的比例（`max_tokens` 截断）、格式错误率等质量信号。
5. **硬件**：显存占用、SM 活跃度 / Tensor Core 利用率（如 DCGM 的指标），而不是只看 GPU-Util；功耗与温度、卡间互联错误。
6. **成本**：按租户 / 业务统计 token 用量与 GPU 小时，计算每百万 token 成本。
7. **告警设计**：基于 SLO 设告警（如 P99 TTFT 连续超标、错误预算消耗速度），而不是对每个指标设硬阈值；KV 使用率高且抢占增多、排队持续增长、命中率骤降、错误率突增要告警；告警附带排查入口（Trace、仪表盘）。
8. **扩缩容**：以排队长度 / 排队时间和 KV 使用率为主要信号，考虑冷启动时间留出提前量，保留最小副本数；流量有明显峰谷时可按时间预扩容。

**评分要点（共 10 分）：**

- 列出延迟类指标并强调分位数（2 分）
- 列出吞吐、排队、batch 等负载指标（2 分）
- 列出 KV 使用率、抢占、前缀缓存命中率并说明含义（2 分）
- 列出错误、截断与硬件指标，指出 GPU-Util 的局限（2 分）
- 给出基于 SLO 的告警与基于排队 / KV 的扩缩容设计（2 分）

**讲解：**

**常见失分点**：只列 QPS 和平均延迟；把 GPU-Util 当作利用率和扩容依据；不知道抢占次数、前缀缓存命中率这类推理特有的指标；告警没有和 SLO 关联；忽略冷启动对扩容的影响。

<sub>考点：推理服务监控</sub>

</details>

---

<a name="INF-SERVE-034"></a>

### INF-SERVE-034　进阶 · 考频 ★★★

面试官问：「vLLM、SGLang、TensorRT-LLM、llama.cpp 你会怎么选？」请说明它们各自的定位与长处，并给出一套在自己业务上做选型评估的方法。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **vLLM**：PagedAttention 的发源地，社区活跃，模型与硬件覆盖面最广（NVIDIA、AMD 等），OpenAI 兼容服务、多 LoRA、量化、投机解码、前缀缓存开箱即用；是多数团队的默认选择。
2. **SGLang**：RadixAttention 前缀复用与缓存感知调度，结构化输出快（压缩状态机、XGrammar），CPU 调度与 GPU 计算重叠；对 DeepSeek 等 MLA / MoE 模型的数据并行注意力、大规模专家并行与 PD 分离支持深入；适合多轮对话、Agent、结构化输出多的负载。
3. **TensorRT-LLM**：NVIDIA 官方，kernel 与 FP8 / FP4 优化最深，与 Triton、Dynamo 集成；在 NVIDIA GPU 上常常性能最好，代价是只支持 NVIDIA 硬件、版本迭代快（早期需要构建引擎，新版本已改为以 PyTorch 为后端）。
4. **llama.cpp**：C/C++、GGUF、多种 4 / 8 bit 量化，跑在 CPU、Apple Silicon、消费级显卡上，主打本地与端侧，不适合高并发服务。
5. **评估方法**：
   - 先定约束：硬件型号、模型（是否 MoE / MLA、是否多模态）、精度、需要的功能（多 LoRA、结构化输出、投机解码、PD 分离）、运维能力；
   - 用真实流量画像（输入输出长度分布、前缀共享程度、并发）在同一硬件、同样的精度下压测，比较满足 SLO 时的 goodput、P99 TTFT / TPOT，而不是只看峰值吞吐；
   - 检查效果：同一模型在不同引擎下的输出质量（量化与 kernel 实现可能带来差异）；
   - 评估工程成本：部署复杂度、监控指标、升级频率与社区支持；
   - 保持可替换：上层统一走 OpenAI 兼容接口，便于以后切换。

**评分要点（共 10 分）：**

- 正确说明四个框架的定位与长处（4 分）
- 指出 TensorRT-LLM 仅限 NVIDIA、llama.cpp 不适合高并发等限制（2 分）
- 给出基于真实负载、以 SLO 内 goodput 为准的压测评估方法（3 分）
- 提到效果一致性、工程成本或接口可替换（1 分）

**讲解：**

**常见失分点**：凭印象断言「X 一定最快」；用离线最大吞吐代替 SLO 内的 goodput 做比较；不区分负载特征（长前缀复用、结构化输出、MoE）；不知道框架迭代很快，描述过时的工作流而不注明版本。

<sub>考点：vLLM、SGLang、TensorRT-LLM、llama.cpp与端侧　｜　出处：TensorRT-LLM Release Notes https://nvidia.github.io/TensorRT-LLM/release-notes.html</sub>

</details>

---

<a name="INF-SERVE-035"></a>

### INF-SERVE-035　挑战 · 考频 ★★

如何核算自部署推理服务的「每百万 token 成本」？请给出计算方法，说明有哪些因素会让实际成本高于理论值，以及输入、输出 token 的成本应如何分摊，最后列出主要的降本手段。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **基本公式**：每百万 token 成本 = 每小时总成本 ÷ 每小时实际产出的 token 数 × $10^6$。每小时总成本包括 GPU（按租用价或折旧）、CPU / 存储 / 网络，以及摊到每小时的运维人力。
2. **产出要用「满足 SLO 的吞吐」**：压测在 SLO 约束下的最大吞吐（goodput），而不是不限延迟的峰值吞吐。
3. **利用率是关键**：卡按小时计费，用不满也要付钱。按峰值配卡并留冗余时，日均利用率常常只有 30% 左右，实际单价是满载单价的约 3 倍。
4. **实际成本高于理论值的原因**：峰谷差与冗余、冷启动与预留的最小副本、抢占与重算、失败重试、评测与灰度占用的资源、多模型 / 多 adapter 导致的资源碎片。
5. **输入与输出的分摊**：同一张卡上 Prefill 与 Decode 分时进行，可以按两者实际占用的 GPU 时间比例分摊：输入成本 = Prefill 时间占比 × 总成本 ÷ 输入 token 数；输出同理。通常每个输出 token 的成本是输入 token 的数倍，命中前缀缓存的输入几乎不消耗算力，可以按很低的价格计。
6. **降本手段**：提高利用率（弹性扩缩、离线任务填低峰、多业务共享资源池、基线自部署 + 峰值溢出到 API）；提高单卡吞吐（FP8、在 SLO 内加大 batch、前缀缓存、投机解码只在低负载时开启）；选择合适的模型尺寸、把简单请求路由到小模型；控制输出长度。

**评分要点（共 10 分）：**

- 写出成本公式，并说明总成本的构成（2 分）
- 强调用 SLO 内的吞吐与实际利用率计算（3 分）
- 列出导致实际成本偏高的因素（2 分）
- 给出输入、输出成本按 GPU 时间分摊的方法（1 分）
- 列出多类降本手段（2 分）

**讲解：**

**常见失分点**：用峰值吞吐、100% 利用率算单价，严重低估成本；只算 GPU，忽略人力与周边资源；把输入、输出 token 当成同样的成本；只列降本手段，不说它们分别作用于公式中的哪一项。

<sub>考点：推理成本估算、容量规划</sub>

</details>

---

<a name="INF-SERVE-042"></a>

### INF-SERVE-042　进阶 · 考频 ★★

公司自研了一个 Decoder-only 模型（结构与 Llama 类似，但注意力中加了 QK-Norm，位置编码也做了改动），要接入 vLLM 对外提供服务。请说明需要做哪些工作、每一步的要点，以及如何验证接入后的精度与性能。

<details>
<summary>答案与解析</summary>

**参考答案：**

0. **先试现成的路径**：vLLM 可以通过 Transformers 后端直接加载许多 Hugging Face 格式的 Decoder 模型，先确认 `vllm serve <模型>` 能否运行、性能是否满足要求；不满足再写原生实现。
1. **改写模型代码**：参照结构最接近的已有实现（如 llama.py）改写。
   - 各模块的构造函数带 `prefix` 参数（模块在权重字典中的全名），用于注意力算子的注册与「部分层量化」时的匹配；
   - `forward` 接收**拉平**的 `input_ids` 与 `positions`（只有一个 token 维，没有 batch 与补齐维）；
   - 注意力使用 vLLM 的 `Attention` 层，由它对接分页 KV Cache 与各注意力后端；QK-Norm 与 RoPE 的先后顺序、RoPE 的维度配对方式必须与训练代码一致；注意力机制若超出现有支持范围，需要实现新的注意力层或后端。
2. **张量并行与量化**：Embedding 换成 `VocabParallelEmbedding`，输出层换成 `ParallelLMHead`；线性层换成 `ColumnParallelLinear`、`RowParallelLinear`、`QKVParallelLinear`、`MergedColumnParallelLinear`。KV 头数小于 TP 时，`QKVParallelLinear` 会复制 KV 头；逐头的 QK-Norm 要随头切分。
3. **权重加载**：实现 `load_weights`，把 checkpoint 中分开存放的 q、k、v 与 gate、up 权重，按分片装进合并后的并行层。
4. **注册**：内置模型加入模型注册表；或以插件形式在树外注册（`ModelRegistry.register_model`），不改 vLLM 源码；同时检查 config 中的 `architectures`、分词器、对话模板与停止 token。
5. **验证精度**：
   - 用随机权重做加载测试；
   - 与 Hugging Face 原实现对比：贪心解码输出完全一致，或双方的 logprob 互相落在对方的 top-k 内；
   - 有差异时逐层比对隐藏状态，定位出问题的模块；
   - 覆盖长上下文、混合长度的 batch、TP > 1、量化、前缀缓存、CUDA Graph 与 eager 模式等组合，最后在业务评测集上与原实现对比。
6. **验证性能**：按真实的输入输出长度分布压测 TTFT、TPOT 与吞吐，与结构相近的已有模型对比，排查是否有算子退化到慢路径。

**评分要点（共 10 分）：**

- 说明改写模型的要点：prefix、拉平的输入、使用 vLLM 的 Attention 层与位置编码一致性（3 分）
- 说明张量并行层与权重加载（含合并层分片、KV 头复制）（2 分）
- 说明注册方式（内置或插件）与分词器、模板等配套检查（1 分）
- 给出与 HF 实现逐 token / logprob 对比、逐层定位、多配置覆盖的精度验证方案（3 分）
- 提到按真实负载压测性能（1 分）

**讲解：**

**常见失分点**：以为把 Hugging Face 的模型代码原样放进去就能获得 PagedAttention 的收益；忘记 `load_weights` 中合并层的分片映射；只做「能跑通」的冒烟测试，不和原实现逐 token 对比；没考虑 TP > 1、CUDA Graph、前缀缓存等配置下的正确性；位置编码的维度配对方式（相邻两维还是前后两半）与训练代码不一致，导致效果悄悄变差。

<sub>考点：vLLM、张量并行推理　｜　出处：vLLM 文档：Adding a New Model（Basic Model、Registering a Model、Unit Testing）https://github.com/vllm-project/vllm/tree/main/docs/contributing/model</sub>

</details>

---

## 场景分析题

<a name="INF-SERVE-032"></a>

### INF-SERVE-032　挑战 · 考频 ★★

某 8B 对话服务（4 个 vLLM 副本，每个一张 H100）上线了「长文档问答」功能，允许的上下文从 4K 提高到 32K。上线后监控显示：

1. P99 TTFT 从 0.8 s 升到 6 s，P50 也明显变差；
2. KV Cache 使用率长期在 95% 以上，抢占（preemption）每分钟数百次；
3. 输出 token 的总吞吐下降约 30%；
4. GPU-Util 仍接近 100%。

请分析原因，并给出短期与长期的处理方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**原因分析**
1. **KV 容量成为瓶颈**：每 token 的 KV 为 128 KiB，一条 32K 请求的 KV 就有 4 GiB，单卡约 50 GiB 的 KV 空间只能容纳十几条这样的请求；并发上限骤降，新请求排队，TTFT 上升，普通短请求也被拖累。
2. **抢占造成重复计算**：KV 用尽时调度器抢占请求（vLLM V1 默认丢弃 KV、恢复时重算），长文档的重算就是一次长 Prefill，大量算力被浪费，吞吐下降；被抢占的请求时延进一步拉长。
3. **长 Prefill 挤占算力**：32K 的提示词 Prefill 计算量大，Chunked Prefill 让它们分多步完成，与 Decode 争抢每步的 token 预算。
4. **GPU-Util 有误导性**：它只表示有 kernel 在跑，重算和低效调度同样会让它接近 100%，不代表有效产出。

**短期处理**
1. 准入控制：限制每个副本同时处理的长上下文请求数，或调小 `max_num_seqs`，宁可排队也不要频繁抢占；
2. 按长度路由：把长文档请求分到独立的副本池，避免拖累普通对话；
3. 开启 FP8 KV，KV 容量约翻倍；
4. 同一文档的多轮提问会话亲和路由，让前缀缓存复用文档部分的 KV；
5. 按新的负载画像扩容。

**长期处理**
1. 重新做容量规划：按输入长度的分布（P50 / P99）压测，得到长文档场景下单卡的 goodput；
2. 长提示词较多时评估 PD 分离，或把 KV 卸载到 CPU / 分布式 KV 池；
3. 产品侧：检索出相关段落再回答，而不是把整篇文档都塞进上下文；
4. 监控按长度分桶统计 TTFT / TPOT，对抢占次数和 KV 使用率设告警，扩缩容以排队与 KV 使用率为信号。

**评分要点（共 10 分）：**

- 算出长上下文下单请求 KV 的量级，指出 KV 容量成为瓶颈（3 分）
- 解释抢占重算导致吞吐下降、排队导致 TTFT 上升（2 分）
- 指出 GPU-Util 的误导性（1 分）
- 给出准入控制、按长度路由、FP8 KV、前缀缓存等短期方案（2 分）
- 给出重新容量规划、PD 分离或 KV 卸载、检索替代长上下文等长期方案与监控（2 分）

**讲解：**

**常见失分点**：只说「加机器」；看到 GPU-Util 接近 100% 就认为算力已满；没有用数字说明 KV 容量的变化；不知道抢占的重算成本；没想到把长短请求分池。高分回答先用 KV 公式算出「每张卡能容纳几条 32K 请求」，再展开方案。

<sub>考点：推理服务监控、容量规划　｜　出处：vLLM 文档：Optimization and Tuning（V1 默认以 RECOMPUTE 方式抢占、尽可能默认开启 Chunked Prefill）https://docs.vllm.ai/en/latest/configuration/optimization/；Llama 3 config.json（Hugging Face meta-llama/Meta-Llama-3-8B：32 层、8 个 KV 头、头维度 128，约 8.03B 参数）</sub>

</details>

---

<a name="INF-SERVE-039"></a>

### INF-SERVE-039　挑战 · 考频 ★★

团队要把一个 32B 稠密模型的对话服务从 GPU 集群迁到昇腾 NPU 集群（用 vllm-ascend 部署，模型与权重不变）。灰度测试中发现：

1. 在 500 道回归题上，约 3% 的回答与 GPU 版差别明显，个别长回答的后半段出现乱码；
2. 吞吐只有 GPU 版的约 60%，profiling 显示大量小算子逐个下发，算子之间有明显的空隙，还有少数算子走了较慢的实现路径；
3. 长提示词请求的 TTFT 明显偏高。

请给出精度问题与性能问题的排查思路和优化方案，并说明这次迁移的上线验收标准。

<details>
<summary>答案与解析</summary>

**参考答案：**

**一、精度：先判断差异是否超出正常范围，再逐层定位**
1. 对齐条件：同一份权重、分词器、对话模板、停止词与采样参数，用贪心解码对比，排除采样的随机性。
2. 输出层面：比较两边在同一批输入上的 logits 或 logprob（top-k 是否一致、KL 散度），而不只是比较文本。正常的浮点差异会让少数样本在「几乎打平」的 token 上分叉，但不应出现乱码。
3. 逐层比对：同一输入下导出每层的隐藏状态，计算与 GPU 基线的余弦相似度和最大误差，找到第一个明显偏离的层与算子。常见原因：数据类型或累加精度不同（如 FP16 溢出产生 inf / NaN，长回答后半段乱码常与此有关）；RoPE 的维度配对方式、注意力掩码、归一化的 eps 与原实现不一致；长序列下注意力算子的数值问题；量化格式不一致。
4. 修复后在回归集上复测，并把逐层比对脚本保留下来，作为以后升级驱动、框架或模型时的回归工具。

**二、性能：先消除下发开销与慢路径，再调并行与调度**
1. 下发开销：启用图模式，把一步的计算捕获成图整体下发，对 Decode 这类小 batch、短算子的阶段收益最大；
2. 融合算子：把注意力、RMSNorm、RoPE、SwiGLU 等换成平台提供的融合算子，减少小算子的数量；
3. 慢路径：从 profiling 中找出走慢路径的算子，改用受支持的数据类型、形状或等价实现，必要时用 Ascend C 开发自定义算子；
4. 并行与调度：按 NPU 的互联拓扑重新选择 TP 大小，重新压测 batch 上限、Chunked Prefill 的 token 预算与 KV 块大小；评估平台支持的量化格式；
5. 长提示词的 TTFT：确认前缀缓存、Chunked Prefill 等特性在插件上已启用并生效，检查长序列注意力算子的效率，必要时考虑 PD 分离。

**三、上线验收标准**
- 精度：公开基准与业务回归集的得分和 GPU 基线的差距在预设阈值内（报告置信区间）；工具调用、结构化输出的格式正确率不下降；无乱码、无 NaN。
- 性能：在目标 QPS 与真实的输入输出长度分布下，P99 TTFT 与 P99 TPOT 满足 SLO，并核算单位 token 成本。
- 稳定性：长时间压测无显存泄漏、无通信超时；故障恢复与扩缩容流程验证通过。
- 灰度：影子流量对比 → 小流量 → 全量，保留随时切回 GPU 集群的能力。

**评分要点（共 10 分）：**

- 精度：统一对齐条件，比较 logits / logprob，逐层导出中间结果定位第一个偏差算子（3 分）
- 能说出数据类型溢出、RoPE 配对、掩码、累加精度等常见的精度原因（1 分）
- 性能：用图模式减少下发开销、替换融合算子、消除慢路径算子（3 分）
- 按新硬件重新评估并行与调度参数，并处理长提示词的 TTFT（1 分）
- 给出精度、性能、稳定性与灰度回切等可量化的验收标准（2 分）

**讲解：**

**常见失分点**：看到回答不一致就认定「硬件不行」，没有先区分正常的浮点差异与实现错误；只比较最终文本，不做逐层比对；把性能差距归因于「算力不够」，没有看 profiling 中的下发空隙和慢路径算子；只报平均吞吐，不给 SLO 与精度门槛；没有保留回切方案。

说明：工具与特性的名称随版本变化，答题时讲清方法即可；可用的特性以 vllm-ascend 的支持矩阵为准（2026-11 查阅）。

<sub>考点：国产硬件部署、推理服务监控　｜　出处：vllm-ascend https://github.com/vllm-project/vllm-ascend；torch_npu https://github.com/Ascend/pytorch</sub>

</details>

---

<a name="INF-SERVE-043"></a>

### INF-SERVE-043　挑战 · 考频 ★★

某 70B 模型服务部署在 K8s 上（每个实例 TP = 4，BF16 权重约 140 GB，存放在对象存储中）。白天流量波动大，经常出现分钟级的突增。目前扩容一个新实例从触发到能接流量约需 4 分钟：调度到空闲 GPU 节点并拉取约 15 GB 的镜像约 60 秒，下载权重约 120 秒，加载权重与 torch.compile、CUDA Graph 捕获等预热约 60 秒。突增时 P99 TTFT 严重超标，扩出来的实例往往在高峰快结束时才就绪。

请分析问题，并给出缩短冷启动、改进扩缩容策略，以及在扩容完成前保护服务的方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**问题分析**
1. 扩容动作的时延（4 分钟）大于流量上升的时间尺度，扩容永远「慢半拍」；如果按 GPU 利用率这类滞后指标触发，还会再慢一截。
2. 新实例刚就绪时前缀缓存是空的，若就绪探针在预热完成前就通过，最初的请求会更慢。
3. 扩容期间没有准入控制，请求全部堆在排队里，TTFT 被拉长。

**缩短冷启动**
- 镜像：精简镜像；在 GPU 节点上预拉镜像（如用 DaemonSet）或使用节点镜像缓存。
- 权重：提前把权重放到节点本地 NVMe（或节点内存的页缓存）；按 TP 分片预切好的 checkpoint 并行加载、流式加载；必要时在节点之间分发。下载 140 GB 是最大的一块，去掉它就能省约一半时间。
- 预热：缓存 torch.compile 的编译产物；只为常用的 batch 大小捕获 CUDA Graph，在启动时间与运行性能之间取舍。
- 热备：保留少量「已加载权重、但不接流量」的备用实例；vLLM 的 Sleep Mode 可以把权重卸载到 CPU 内存并丢弃 KV Cache，唤醒时不必从头加载模型。
- 节点：保留一定的空闲 GPU 节点池，避免等待节点调度或创建。

**改进扩缩容策略**
- 用领先指标触发：排队请求数、等待时长、KV Cache 使用率、请求速率的增长趋势，而不是 GPU 利用率；
- 预留余量：余量至少覆盖「冷启动时长内的流量增量」。例如 4 分钟内流量可能上涨 30%，就要保留约 30% 的余量；把冷启动压到 1 分钟，余量可以相应减少；
- 对每天固定的高峰做定时或预测式扩容；
- 缩容要慢（冷却时间、逐步排空在途请求），避免反复扩缩。

**扩容完成前的保护**
- 网关做准入控制与分级排队：交互请求优先，离线任务暂缓；
- 超过排队阈值时降级：限制 max_tokens、切到更小的模型，或溢出到其他集群、外部 API；
- 就绪探针在预热完成并跑通一次测试推理后才通过；新实例逐步放量（慢启动），并可用常用的系统提示词预热前缀缓存。

**监控**：拆分记录冷启动各阶段耗时、从触发到就绪的时长、排队时长与拒绝率，持续优化最长的那一段。

**评分要点（共 10 分）：**

- 指出扩容时延大于流量上升时间、触发指标滞后、预热前就接流量等问题（2 分）
- 缩短冷启动：镜像预拉、权重本地缓存或并行加载、编译缓存与 CUDA Graph 取舍（3 分）
- 热备实例或 Sleep Mode 一类的快速唤醒、空闲节点池（1 分）
- 用排队、KV 使用率等领先指标触发，按冷启动时长预留余量，定时或预测扩容，慢缩容（2 分）
- 扩容完成前的准入控制、降级与溢出，以及就绪探针与慢启动（2 分）

**讲解：**

**常见失分点**：只说「调低 HPA 阈值」或「多加机器」，不量化冷启动各阶段；用 GPU 利用率当扩容信号；忽略权重下载这一最大头；没有扩容完成前的兜底，突增期间只能干等；就绪探针过早通过，导致新实例一上线就超时。

<sub>考点：容量规划、推理服务监控　｜　出处：vLLM 文档：Sleep Mode https://github.com/vllm-project/vllm/blob/main/docs/features/sleep_mode.md；vLLM 设计文档：CUDA Graphs https://github.com/vllm-project/vllm/blob/main/docs/design/cuda_graphs.md</sub>

</details>

---

## 系统设计题

<a name="INF-SERVE-033"></a>

### INF-SERVE-033　挑战 · 考频 ★★

为一家企业设计私有化的大模型推理平台。需求如下：

- 两个底座：8B 对话模型（承担约 80% 的请求）与 70B 高质量模型（约 20%）；
- 约 80 个业务部门各自基于 8B 底座微调了 LoRA adapter；
- 所有业务通过统一的 OpenAI 兼容接口调用，峰值约 60 QPS，平均输入 1500 token、输出 300 token；
- 数据不能出域，资源为 16 张 H100（2 台 8 卡服务器）。

请给出设计：引擎与精度、并行与部署、多 LoRA 方案、网关与路由、容量估算思路、监控与 SLO、主要风险。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 需求澄清**：各业务的 SLO（交互式要求 P99 TTFT ≤ 1 s、TPOT ≤ 50 ms，批处理只看吞吐）、adapter 的秩与更新频率、是否有长上下文、部门之间的隔离与配额要求。

**2. 引擎与精度**：vLLM 或 SGLang（多 LoRA、OpenAI 兼容、前缀缓存都成熟）；H100 上统一用 FP8 W8A8，必要时开启 FP8 KV；量化后的模型与各 adapter 都要用业务评测集回归。

**3. 部署**
- 70B：FP8 权重约 70 GB，按 TP = 4 部署两个副本（共 8 张卡，在一台机器内），TP 换取较低的 TPOT；
- 8B：单卡放得下，另一台机器上部署多个单卡副本（多副本优于 TP），全部开启多 LoRA（`--enable-lora`，`--max-loras` 按单 batch 中常见的 adapter 数设置，`--max-lora-rank` 设为实际最大的秩，CPU 侧缓存更多 adapter）；
- 两类实例分池，按各自的负载独立扩缩。

**4. 网关与路由**
- 统一的 OpenAI 兼容网关：鉴权、按部门的配额与限流、审计日志；
- 用 `model` 字段路由：底座名 → 对应的模型池；adapter 名 → 8B 池中的副本；
- 路由策略：同一会话或同一 adapter 的请求亲和到同一副本，提高前缀缓存命中率并减少 adapter 换入；负载过高时溢出到其他副本；
- 前缀缓存按部门加盐，避免跨部门通过命中时延推测提示词。

**5. 容量估算**
- 8B：峰值 48 QPS，Decode 需要 $48\times300=14400$ token/s，Prefill 最多 $48\times1500=7.2$ 万 token/s（命中前缀缓存的部分可以扣除）；用压测得到的单卡在 SLO 内的 Decode、Prefill 吞吐（含 LoRA 开销）折算卡数，再加冗余；
- 70B：12 QPS，按 TP = 4 副本的压测 goodput 计算；
- 若 16 张卡不够，优先通过前缀缓存、FP8 KV、限制最大长度挖潜，再与业务协商 SLO 或扩容。

**6. 监控与 SLO**：按模型、adapter、部门统计 TTFT / TPOT 分位数、排队、KV 使用率、抢占、前缀缓存命中率、adapter 加载次数与加载耗时、错误率与 token 用量（用于内部计费）；告警基于 SLO 与错误预算。

**7. 风险与对策**
- adapter 冷加载拖慢首请求 → 热门 adapter 预加载，按 adapter 亲和路由；
- 大部门挤占资源 → 按部门配额与公平调度；
- adapter 更新出错 → adapter 版本化、灰度发布、可回滚；
- 底座升级导致所有 adapter 失效 → 底座与 adapter 的兼容矩阵，统一重训与回归；
- 单点故障 → 每类模型至少两个副本，网关健康检查与熔断。

**评分要点（共 10 分）：**

- 引擎与精度选择合理，并考虑效果评测（1 分）
- 部署方案：70B 用 TP、8B 用多副本，并说明理由（2 分）
- 多 LoRA 方案：一份底座 + adapter 分级缓存、关键参数与 adapter 亲和（2 分）
- 网关：OpenAI 兼容、鉴权与配额、按 model 字段路由、缓存隔离（2 分）
- 给出容量估算方法与关键数字（1 分）
- 监控指标、SLO 与主要风险的对策（2 分）

**讲解：**

**常见失分点**：给每个 adapter 单独部署一个模型；70B 不量化、不考虑卡数是否够用；只画框图不做容量估算；忽略部门间的隔离、配额与缓存加盐；没有 adapter 的版本管理与回滚；监控只看总体，不按模型 / adapter 拆分。

<sub>考点：vLLM、多LoRA服务、容量规划、OpenAI兼容API　｜　出处：vLLM LoRA 文档 https://docs.vllm.ai/en/latest/features/lora.html</sub>

</details>

---
