# INF-KV · KV Cache 与显存管理

> 所属大类：推理与部署　｜　题量：41

KV Cache 的大小、管理、复用与压缩。

**考点覆盖**：KV Cache原理（4） · KV Cache大小计算（4） · 显存碎片（5） · PagedAttention（8） · 块表（4） · 写时复制（3） · 前缀缓存（12） · RadixAttention（4） · KV量化（4） · KV压缩与淘汰（4） · KV卸载（4） · 长上下文KV优化（5）

**题型**：[单选题（12）](#单选题) · [多选题（5）](#多选题) · [判断题（5）](#判断题) · [填空题（2）](#填空题) · [计算题（6）](#计算题) · [代码输出题（2）](#代码输出题) · [代码填空题（1）](#代码填空题) · [代码改错题（1）](#代码改错题) · [编程题（1）](#编程题) · [简答题（4）](#简答题) · [场景分析题（1）](#场景分析题) · [系统设计题（1）](#系统设计题)

---

## 单选题

<a name="INF-KV-002"></a>

### INF-KV-002　基础 · 考频 ★★★

一张 80 GB 的 GPU 部署 Llama-3-8B（BF16 权重约 16 GB），提供 8K 上下文的对话服务。决定它最多能同时服务多少条请求的主要因素是：

- **A.** 权重大小：每条请求要加载自己的一份权重副本，80 GB 显存最多放下约 4 份
- **B.** KV Cache：每条请求的 KV 私有且随长度增长，剩余显存 ÷ 每条请求的 KV 约为并发上限
- **C.** 激活值显存：Decode 每一步的激活随 batch 的平方增长，batch 稍大就会超过 KV 的占用
- **D.** GPU 的 SM 数量：每条请求的 Decode 要独占一个 SM，并发上限约等于 SM 数

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：推理服务的并发上限主要由 KV Cache 决定。

Llama-3-8B 每个 token 的 KV 为 128 KiB，8K 上下文每条请求 1 GiB。按 90% 显存可用，$80\times0.9-16\approx56$ GB，约 52 GiB，最多约 50 条满长度的请求。

- A 错：权重只有一份，被同一个 batch 里的所有请求共享，这也是批处理能提高吞吐的根本原因；真正每条请求私有、随长度线性增长的是 KV。
- C 错：Decode 每步每条序列只处理 1 个 token，激活很小，且随 batch 线性增长；推理框架通常按最大 batch 试跑一次，预留峰值激活。
- D 错：一个 batch 的所有请求一起被切分到各个 SM 上计算，与 SM 数量没有一一对应关系。

所以 KV 管理的每一项优化（PagedAttention 减少浪费、前缀缓存减少重复、KV 量化减少每个数的字节、GQA / MLA 减少要存的数）最终都转化为「能放下更多并发」。

<sub>考点：KV Cache原理、KV Cache大小计算</sub>

</details>

---

<a name="INF-KV-005"></a>

### INF-KV-005　基础 · 考频 ★★★

早期的推理系统按「提示词长度 + 最大输出长度」为每个请求预留一段连续显存来存 KV。关于由此产生的显存浪费，下列说法正确的是：

- **A.** 浪费主要来自外部碎片，定期整理（compaction）显存、把空闲段拼接起来就能基本解决
- **B.** 把最大输出长度设大、每个请求按同一上限预留，分配大小一致，就不会产生碎片
- **C.** 浪费包括预留、内部碎片与外部碎片；分页按需分配后，只剩每条序列最后一块未写满的部分
- **D.** PagedAttention 把 KV 从 BF16 降到 INT8 存储，每个 token 的占用减半，从而减少浪费

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：PagedAttention 用「固定大小的块 + 按需分配」同时解决了预留、内部碎片和外部碎片。

PagedAttention 论文（Kwon 等, 2023）统计，当时的系统里 KV 显存真正存放 token 状态的只有约 20%～38%；vLLM 把浪费降到 4% 以下。三种浪费：
1. **预留**：为尚未生成的 token 占着位置；
2. **内部碎片**：实际输出比上限短，多预留的位置永远用不上；
3. **外部碎片**：大小不一的连续区间反复申请、释放，空闲显存被切成拼不起来的小段。

- A 错：整理碎片需要搬动正在使用的 KV，代价很高，而且解决不了预留和内部碎片这两个大头。
- B 错：大小一致只能消除外部碎片；上限越大，预留与内部碎片越严重。
- D 错：那是 KV 量化，与分页是正交的两种技术，可以叠加使用。PagedAttention 用固定大小的块按需分配，浪费只剩每条序列最后一块中未写满的部分。

<sub>考点：显存碎片、PagedAttention　｜　出处：PagedAttention 论文 arXiv:2309.06180</sub>

</details>

---

<a name="INF-KV-006"></a>

### INF-KV-006　进阶 · 考频 ★★

有人提议：不用 PagedAttention，而是让每个请求通过 PyTorch 的缓存分配器申请一个「刚好够用」的连续 KV 张量，序列变长时再申请一个更大的张量。这个方案的主要问题是：

- **A.** 扩容时要整体拷贝已有 KV，大小各异的张量反复申请、释放还会产生外部碎片
- **B.** PyTorch 在推理（no_grad）模式下不允许新申请显存，KV 张量要在加载模型时一次分配好
- **C.** 连续张量的长度各不相同，batch 内的注意力无法对齐计算，会读到相邻请求的 KV，导致结果出错
- **D.** 连续张量的 KV 不满足 Tensor Core 要求的分块对齐，注意力要退回 CUDA Core 计算，慢一个数量级

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：难点在于 KV 的长度在生成中不断增长，而且事先不知道会长到多少。

「刚好够用 + 不够再换大的」意味着每次扩容都要把已有的 KV 整体拷贝一遍，长序列反复扩容的拷贝开销很可观；不同请求的张量大小各异、生命周期交错，缓存分配器里会留下大量拼不起来的空闲段，最终表现为「总空闲显存足够、却分配不出一块连续空间」。连续张量还让多个请求之间无法共享相同前缀的 KV（除非拷贝）。

分页把 KV 切成固定大小的块：任意空闲块都能分给任意序列，没有外部碎片；增长时只追加一块，不搬动旧数据；共享前缀只需让多张块表指向同一个物理块。

- B 错：no_grad 只是不记录计算图，推理时照样可以申请显存，只是频繁申请、释放代价高，还可能引发同步。
- C、D 错：连续存储在计算上完全正确，Tensor Core 也能处理；问题出在显存管理上，而不是计算上。

<sub>考点：显存碎片</sub>

</details>

---

<a name="INF-KV-009"></a>

### INF-KV-009　进阶 · 考频 ★★★

PagedAttention 论文报告，其注意力 kernel 比 FasterTransformer 中的实现慢约 20%～26%，但 vLLM 的端到端吞吐却比 FasterTransformer、Orca 高 2～4 倍。对此最准确的解释是：

- **A.** 吞吐提升主要来自并行采样、束搜索中的 KV 共享，普通的单序列采样下 vLLM 并无优势
- **B.** 分页让活跃序列的 KV 常驻 L2 缓存，命中率的提升抵消了间接寻址带来的 kernel 开销
- **C.** PagedAttention 减少了注意力的计算量，省下的算力抵消了 kernel 变慢的损失
- **D.** 分页把 KV 显存浪费降到 4% 以下，batch 能大几倍，这部分收益远大于 kernel 的损失

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：PagedAttention 用一个算子上的小损失，换来了整个系统 batch 的大幅提升。

Decode 每步要把权重读一遍，batch 越大，权重读取被分摊得越薄，吞吐越高。以前 KV 显存只有两三成真正用来存 token，batch 被浪费的显存卡住；分页后几乎所有 KV 显存都在存 token，batch 可以大几倍。分页 kernel 要按块表间接寻址、访存不连续，单个算子确实略慢；但注意力 kernel 只是每步耗时的一部分，它慢 20% 对端到端的影响远小于 batch 翻几倍带来的收益。

- A 错：论文在普通的单序列采样上同样报告了明显提升，例如 ShareGPT 负载下可承受的请求速率是 Orca (Oracle) 的 1.7～2.7 倍、Orca (Max) 的 2.7～8 倍；并行采样、束搜索中的 KV 共享是在此基础上的额外收益。
- B 错：长上下文、大 batch 下的 KV 远大于 L2 缓存，分页也不会让访存更「局部」，反而更零碎。
- C 错：PagedAttention 管理的是显存，注意力的计算量一点没少。

<sub>考点：PagedAttention　｜　出处：PagedAttention 论文 arXiv:2309.06180</sub>

</details>

---

<a name="INF-KV-012"></a>

### INF-KV-012　基础 · 考频 ★★

关于 PagedAttention 中的块表（block table），下列说法正确的是：

- **A.** 块表保存在每个物理块的头部，kernel 读完一块才能知道下一块在哪，类似链表
- **B.** 块表由 CPU 侧的 KV 管理器维护，每步作为张量传给注意力 kernel，用于由逻辑块号查物理块号
- **C.** 每个物理块只归一个序列使用：块表把它映射回所属序列的逻辑块，防止多个序列互相覆盖 KV
- **D.** 块表要记录每个 token 的物理地址，所以它的大小与 token 数成正比，甚至比 KV 本身还大

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：块表是一张「逻辑块号 → 物理块号」的数组，由 CPU 侧维护，作为 kernel 的输入。

- A 错：链表式的结构只能顺序遍历，kernel 无法并行定位各块；块表是数组，第 $i$ 个逻辑块的物理位置可以直接索引得到。
- B 对：分配、释放、共享都在 CPU 侧完成（vLLM 的 KV 管理器），每步把本 batch 各序列的块表整理成张量交给 GPU。
- C 错：映射方向是逻辑到物理；多张块表可以指向同一个物理块（共享前缀），靠引用计数管理，需要写入时再复制（copy-on-write），不会互相覆盖。
- D 错：块表每块一项，例如每 16 个 token 只需一个 4 字节的整数，而这 16 个 token 的 KV 在 Llama-3-8B 上有 2 MiB，块表的开销可以忽略。

<sub>考点：块表</sub>

</details>

---

<a name="INF-KV-021"></a>

### INF-KV-021　进阶 · 考频 ★★

某 Agent 平台中，每个会话在两次模型调用之间要等待工具返回 10～60 s，期间该会话没有正在运行的推理请求。为了让下一次调用尽量命中前缀缓存，同时不让「等待中的会话」长期占住 GPU 显存，下列策略最合理的是：

- **A.** 请求结束后立即清除 KV、释放显存，下一次调用重新完整 Prefill，靠 Chunked Prefill 掩盖开销
- **B.** 把等待中会话的 KV 固定（pin）在 GPU 上直到会话结束，保证下一次调用 100% 命中
- **C.** KV 留在可淘汰的前缀缓存中，显存紧张时卸载到 CPU 内存或 SSD，下次调用按会话亲和路由回来
- **D.** 把工具调用改成在推理请求内部同步等待，请求不结束，KV 就始终有效，也省去了路由

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：用「可淘汰的前缀缓存 + 下级缓存 + 亲和路由」在命中率与显存占用之间取平衡。

- A 错：会话上下文可能有几万 token，每轮都完整 Prefill，TTFT 和算力浪费都很大；Chunked Prefill 只是把 Prefill 切块与 Decode 混合执行，计算量并不减少。
- B 错：成千上万个等待中的会话会把显存占满，正在运行的请求反而分不到 KV 块，吞吐暴跌。
- C 对：显存够用时，KV 留在 GPU 上直接命中；显存紧张时先降级到 CPU 内存、SSD 或分布式 KV 池（如 LMCache、Mooncake 的做法），恢复时拷回通常比重算快得多；网关按会话把请求路由回缓存所在的实例。还可以根据工具的预期耗时设置保留时间，工具返回后提前预取。
- D 错：请求一直挂着会占用 batch 名额和调度资源，KV 也照样占着显存，比把 KV 固定在 GPU 上更糟。

<sub>考点：KV卸载、前缀缓存</sub>

</details>

---

<a name="INF-KV-022"></a>

### INF-KV-022　基础 · 考频 ★★

关于 SGLang 的 RadixAttention 与 vLLM 的自动前缀缓存（APC），下列说法正确的是：

- **A.** RadixAttention 只缓存各请求共有的系统提示词，多轮对话的历史每轮仍要重新 Prefill
- **B.** APC 缓存的是模型输出的文本，命中后跳过生成；RadixAttention 缓存的是 KV，命中后跳过 Prefill
- **C.** RadixAttention 要求用户在请求中用前端语言显式标注 fork 点，系统才能共享对应前缀
- **D.** APC 按块用链式哈希逐块查找；RadixAttention 用基数树按 token 做最长前缀匹配

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：两者原理相同（相同前缀的 KV 可以复用），差别在数据结构与粒度。

RadixAttention（SGLang 论文，Zheng 等, 2023）用基数树组织所有缓存的 token 序列：边上是一段 token，节点指向对应的 KV；新请求沿树按 token 粒度做最长前缀匹配，能匹配到块的中间，也天然表达多分支的树状复用；显存不足时按 LRU 淘汰叶子节点。它还配合「缓存感知调度」，让与缓存匹配更长的请求优先执行，提高命中率。

- A 错：多轮对话历史、few-shot 示例、并行采样、搜索树等任何共享前缀都能复用。
- B 错：两者缓存的都是 KV，都不缓存输出文本。
- C 错：两者都是自动的，按前缀匹配，无需用户标注；SGLang 的前端语言还能在程序层面显式表达 fork 等结构，但不是使用 RadixAttention 的前提。

<sub>考点：RadixAttention、前缀缓存　｜　出处：SGLang 论文 arXiv:2312.07104</sub>

</details>

---

<a name="INF-KV-026"></a>

### INF-KV-026　进阶 · 考频 ★★

KIVI 等 2 bit KV 量化方法对 Key 按通道（per-channel）量化、对 Value 按 token（per-token）量化，并让最近的一小段 token 保持全精度。下列解释最准确的是：

- **A.** Key 有少数固定的离群通道，按通道量化可隔离它们，Value 则无此现象；按通道统计 scale 要攒够一组 token，故最近 token 暂存全精度
- **B.** Key 的头维度比 Value 大，按通道量化能减少 scale 的数量；最近 token 保留全精度是为了让 RoPE 位置编码不受量化误差影响
- **C.** 按通道量化不用存储 scale，能省下元数据；Value 每个 token 的分布差异大，才不得不按 token 量化
- **D.** 这样 Key 和 Value 可以共用同一组 scale，便于 kernel 一次反量化；最近 token 全精度是为了对齐分页的块边界

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：K、V 的数值分布不同，所以量化方向不同。

- **Key**：观察表明 Key 中有少数通道的幅度系统性地远大于其他通道。若按 token 量化（一行共用一个 scale），scale 会被离群通道撑大，其余通道只剩很少的刻度；按通道量化让每个通道用自己的 scale，离群值被隔离。
- **Value**：没有明显的固定离群通道；注意力输出是各 token 的 Value 按权重加权求和，按 token 量化让每个 token 的误差相互独立，误差不会集中放大。
- **全精度窗口**：按通道量化的 scale 要在一组 token 上统计，新 token 刚生成时凑不满一组，先以全精度存放，攒够一组再量化；这也顺带保护了对当前生成最重要的最近 token。

- B 错：Llama 等模型中每个头的 K、V 维度相同，量化方向的选择与维度大小无关；全精度窗口是按通道分组统计的需要，与 RoPE 无关。
- C 错：任何粒度都需要存 scale（非对称量化还要存零点）；Value 按 token 量化是因为它没有固定的离群通道、误差不会集中放大。
- D 错：K、V 分别量化，各有各的 scale；全精度窗口与分页的块边界无关。

<sub>考点：KV量化　｜　出处：KIVI arXiv:2402.02750</sub>

</details>

---

<a name="INF-KV-030"></a>

### INF-KV-030　进阶 · 考频 ★★

H2O（Heavy-Hitter Oracle）在 KV 预算固定时会保留哪些 token？它在工程落地时的一个主要障碍是什么？

- **A.** 只保留开头几个 sink token 和最近的窗口；障碍是模型要在训练时加入 sink token 才能生效
- **B.** 按 token 在原文中的位置均匀抽样保留，保证各段都有代表；障碍是位置编码要随之重新映射
- **C.** 最近窗口加上按累计注意力选出的重击者；障碍是需要注意力权重，而 FlashAttention 不输出它
- **D.** 保留与当前 query 余弦相似度最高的 token；障碍是要为 KV 建向量索引并额外部署向量数据库

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：H2O = 最近窗口 + 按累计注意力选出的重击者，无需训练。

H2O（Zhang 等, 2023）观察到注意力分布高度稀疏，少数 token 在生成过程中持续获得大量注意力。缓存满时，按累计注意力分数贪心地淘汰最不重要的旧 token，同时保留一段最近的 token。

工程障碍：
- 每一步都需要注意力权重来更新累计分数，而 FlashAttention 一类 kernel 从不把完整的权重矩阵写回显存，需要额外计算或修改 kernel；
- 淘汰是永久的，后续若需要被淘汰的内容就无法恢复；
- 累计分数天然偏向更早出现的 token（被累加的步数更多）；
- 各序列、各头保留的位置不同，KV 布局变得不规则，与分页、前缀共享的配合更复杂。

- A 错：这描述的是 StreamingLLM，而且它同样无需训练。
- B 错：均匀抽样不是 H2O 的做法。
- D 错：这更像检索式的方法，H2O 不需要外部数据库。

<sub>考点：KV压缩与淘汰　｜　出处：H2O arXiv:2306.14048</sub>

</details>

---

<a name="INF-KV-036"></a>

### INF-KV-036　进阶 · 考频 ★★

长上下文 Decode 中，下面哪种方法**保留全部 KV**（显存占用不降），但每一步只读取其中一部分参与注意力，以降低带宽开销？

- **A.** Quest：按每页 key 的逐维最值估计注意力上界，每步只加载得分最高的若干页
- **B.** H2O：按累计注意力分数挑出重击者 token 参与计算，其余 token 永久淘汰以节省带宽
- **C.** StreamingLLM：只保留开头几个 sink token 和最近的窗口，窗口外的 KV 直接丢弃
- **D.** KV 量化：把 KV 从 BF16 压缩为 INT4 存储，每步读取的字节降为约 1/4

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：Quest 是「查询感知」的稀疏读取，不淘汰任何 KV。

Quest（Tang 等, ICML 2024）对每页 KV 记录 key 每一维的最小值 $m_i$ 与最大值 $M_i$。对当前 query $q$，$\sum_i\max(q_im_i,\ q_iM_i)$ 是该页内任意 key 与 $q$ 点积的上界，据此挑出上界最大的若干页，只读这些页做注意力。每一步都按新的 query 重新挑选，被跳过的页以后仍可能被选中，因此可逆、风险较小；代价是容量不降，元数据与挑选也有少量开销。

- B、C 错：二者都永久丢弃部分 KV，容量与带宽一起下降，但不可逆。
- D 错：量化减少的是每个数的字节，显存占用随之下降，而所有 KV 仍要每步全部读取，不是「保留全部、只读一部分」。

DeepSeek-V3.2-Exp 的稀疏注意力（DSA，2025 年）也属于「全部保留、按需挑选」：用轻量的索引器为每个 query 选出部分 token 参与注意力。

<sub>考点：长上下文KV优化　｜　出处：Quest（Tang 等, ICML 2024）</sub>

</details>

---

<a name="INF-KV-038"></a>

### INF-KV-038　挑战 · 考频 ★

某模型共 32 层，其中 24 层是窗口为 4096 的滑动窗口注意力，8 层是全局注意力。推理框架的 KV 管理器若对所有层都按全局注意力分配块（即每一层都为整条序列保留 KV），处理一条 64K（65536）token 的序列时：

- **A.** 结果会出错：滑动窗口层会读到窗口之外的 KV，相当于退化成全局注意力，约 70% 的注意力计算是多余的
- **B.** 结果正确，但滑动窗口层窗口外的块不会再被读取，约 70% 的 KV 显存被白白占用
- **C.** 没有影响：滑动窗口层的 KV 只在当前步临时计算，本来就不写入显存，统一分配的只是空的地址
- **D.** 全局层会变成近似计算：显存被滑动窗口层挤占，框架会自动截断全局层较早的 KV

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：按全局层统一分配不影响正确性（窗口由注意力掩码保证），但浪费大量显存。

实际需要的 KV（以「层 × token」计）：$24\times4096+8\times65536=622592$；统一分配：$32\times65536=2097152$。真正有用的只有约 29.7%，**约 70%** 被浪费。上下文越长，浪费比例越接近滑动窗口层的占比（这里是 75%）。

对策是按层分组管理：滑动窗口层用单独的块池，只保留最近一个窗口的块，滑出窗口的块立即归还（类似 Mistral 的滚动缓存）；全局层照常分页。较新版本的推理框架（如 vLLM 的混合 KV 缓存管理）已经针对这类混合架构做了专门处理。前缀缓存在这种结构下也更复杂：滑动窗口层只需要（也只保留着）最后一个窗口的 KV。

- A 错：注意力掩码保证只看窗口内的 token，多存的 KV 不会被用到。
- C 错：滑动窗口层同样要缓存窗口内的 KV。
- D 错：显存分配方式不影响全局层的计算精度，框架也不会悄悄截断 KV；显存不够时的表现是并发下降或请求被抢占。

<sub>考点：长上下文KV优化、PagedAttention</sub>

</details>

---

<a name="INF-KV-041"></a>

### INF-KV-041　进阶 · 考频 ★

某问答服务开启前缀缓存后，监控显示按 token 计的前缀命中率高达 85%，但端到端时延几乎没有改善。经查，请求的提示词平均约 1,000 token，回答平均约 1,500 token。最可能的解释是：

- **A.** 前缀缓存只在 batch = 1 时生效，高并发时命中的 KV 块无法被多个请求同时共享，所以没有收益
- **B.** 命中前缀后，模型仍要对整个提示词重新做一次完整的 Prefill，用来校验缓存的内容是否正确
- **C.** 复用缓存的 KV 与重新计算的数值不同，会改变采样结果，系统为保证一致性自动关闭了命中块的复用
- **D.** 时延大头是 1,500 个 token 的 Decode，前缀缓存只省 Prefill，对 TPOT 几乎没有帮助

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：前缀缓存优化的是 Prefill（TTFT），而这个业务的时延大头在 Decode。

粗算：1,000 token 的 Prefill 在现代 GPU 上通常只要几十毫秒，命中 85% 也只能省下这几十毫秒中的大部分；1,500 个输出 token、TPOT 按 20～30 ms 算，Decode 要 30～45 秒。端到端时延几乎全由 Decode 决定，命中率再高也看不出改善。

命中率高、端到端却没变快，还常见以下原因，排查时可以逐一核对：
- TTFT 主要花在排队上，而不是 Prefill 计算；
- 命中的只是很短的系统提示词，按请求统计的命中率很高，按 token 算的节省却很少（本题已排除）；
- 瓶颈在模型之外，如检索、工具调用、网络与网关；
- GPU 本来就不忙，省下的算力没有转化为可见的时延收益。

- A 错：前缀缓存的块可以被多个请求同时共享（引用计数），高并发正是它的主要用武之地。
- B 错：命中部分的 KV 直接复用，只对未命中的部分做 Prefill。
- C 错：复用的 KV 在数学上与重新计算相同，不会因此关闭复用；可能存在的细微差异只来自浮点运算顺序。

<sub>考点：前缀缓存</sub>

</details>

---

## 多选题

<a name="INF-KV-003"></a>

### INF-KV-003　进阶 · 考频 ★★

推理服务实现前缀缓存时，要判断一段已缓存的 KV 能否被新请求复用。缓存键中必须体现（或隐含）的信息有：

- **A.** 本次请求的 max_tokens：它决定要预留多少个 KV 块
- **B.** 请求使用的 LoRA 适配器：不同适配器算出的 K、V 不同
- **C.** 多模态输入的内容（如图片的哈希），而不只是图片占位 token
- **D.** 从序列开头到当前块为止的每一个 token ID
- **E.** 本次请求的采样温度与 top_p：参数不同，生成的后续 token 不同

<details>
<summary>答案与解析</summary>

**答案：BCD**

**解析：**

**结论**：KV 由「模型权重 + 从开头起的全部输入」决定，与采样参数无关，B、C、D 正确。

- A 错：输出上限影响的是生成多长、调度时预估要占多少块，与已缓存前缀的 KV 内容无关。
- B 对：LoRA 改变了投影权重，同样的 token 经过不同适配器会得到不同的 K、V。vLLM 把 LoRA 编号作为块哈希的额外键。
- C 对：多模态模型中，图片先被替换成若干占位 token，真正参与计算的是图片特征；只看 token ID 会让两张不同的图片误命中，所以要把图片内容的哈希放进键里。
- D 对：KV 依赖整段前缀，vLLM 用链式块哈希（父块哈希 + 本块 token）隐含了「从开头到这一块」的全部 token。
- E 错：温度、top_p 只作用于 logits 之后的采样，不影响已有 token 的 K、V；后续生成的 token 不同，并不妨碍复用相同前缀的 KV。

此外，多租户场景还会加入「缓存盐」，让不同租户的相同前缀互不命中，防止通过命中时 TTFT 变短的差异推测他人的提示词；这一项是为了隔离与安全，而不是为了正确性。

<sub>考点：KV Cache原理、前缀缓存</sub>

</details>

---

<a name="INF-KV-010"></a>

### INF-KV-010　进阶 · 考频 ★★

关于 PagedAttention 与 vLLM 的 KV 管理，下列说法正确的有：

- **A.** 块越大，块表越短、kernel 访存越规整，但每条序列最后一块的平均浪费、以及写时复制一次要拷贝的数据量都会变大
- **B.** 使用 PagedAttention 后，每个 token 的 KV 字节数也随之减小
- **C.** PagedAttention 只能用于 Decode，Prefill 阶段仍需为每个请求分配一段连续显存
- **D.** 不同序列的块表可以指向同一个物理块，这是并行采样、beam search 和前缀缓存节省显存的基础
- **E.** vLLM 的 KV 块在请求到来时才向 CUDA 申请、请求结束后立即归还，所以服务刚启动、还没有请求时显存占用很低

<details>
<summary>答案与解析</summary>

**答案：AD**

**解析：**

**结论**：A、D 正确。

- A 对：这是块大小的基本折中，vLLM 默认取 16。
- B 错：分页减少的是**浪费**，每个 token 要存的 K、V 一个都不少；减少每 token 字节数靠的是 KV 量化、GQA / MLA。
- C 错：Prefill 写入的 KV 同样按块存放，后续 Decode 直接按块表读取；分块 Prefill 时，后面的块读取前面块的 KV 也走分页 kernel。
- D 对：物理块配合引用计数可以被多条序列共享，写入时再按需复制。
- E 错：vLLM 启动时先用最大 batch 试跑一次测出峰值激活，再把 gpu_memory_utilization 比例内的剩余显存一次性切成 KV 块池，运行时只在池内分配与回收，不再向 CUDA 申请或归还。所以服务一启动显存就显示接近占满，这是正常现象，但也意味着同一张卡上不能再随手起第二个推理进程。

<sub>考点：PagedAttention、块表</sub>

</details>

---

<a name="INF-KV-017"></a>

### INF-KV-017　进阶 · 考频 ★★★

关于 vLLM 的自动前缀缓存（Automatic Prefix Caching，APC），下列说法正确的有：

- **A.** 提示词全部命中时可以完全跳过前向计算，直接从缓存中取出上次生成的第一个 token
- **B.** 请求结束、引用计数归零的块不会立即清除，仍可被后续请求命中，直到显存不足时被淘汰
- **C.** 块哈希由「父块哈希 + 本块 token + 额外键（如 LoRA 编号、多模态输入的哈希、缓存盐）」计算，所以哈希相同就意味着从开头到这一块的整段输入都相同
- **D.** 新请求从第一块开始逐块查找，即使中间某一块未命中，也会跳过它继续匹配后面的块，以便尽量多地复用
- **E.** 只有写满的块才计算哈希并进入缓存，最后一个未写满的块不参与匹配

<details>
<summary>答案与解析</summary>

**答案：BCE**

**解析：**

**结论**：B、C、E 正确。

- A 错：缓存的是 KV，不是输出。至少要重算最后一个 token 才能拿到 logits，再按本次请求的采样参数采样。
- B 对：这些块进入「可淘汰」队列，内容保留、随时可被命中；显存紧张时才按 LRU 淘汰，同一条链先淘汰链尾。
- C 对：把父块哈希串进来形成哈希链，保证「哈希相同 ⇔ 整段前缀相同」；额外键用来区分 LoRA、多模态输入与租户。
- D 错：一个块的 KV 依赖它之前的全部内容，中间某块未命中，后面的块即使 token 相同，KV 也不同（链式哈希本身也不会匹配），所以遇到第一个未命中就停止。
- E 对：未满的块内容还会变化，不能作为稳定的缓存单元；因此命中长度要向下取整到块大小的整数倍。

<sub>考点：前缀缓存</sub>

</details>

---

<a name="INF-KV-032"></a>

### INF-KV-032　挑战 · 考频 ★★

关于长上下文推理中的 KV 压缩与淘汰方法，下列说法正确的有：

- **A.** SnapKV 用提示词末尾「观察窗口」内 query 的注意力，为每个头挑选要保留的提示词位置
- **B.** H2O 按 token 在提示词中的位置决定淘汰顺序，越靠前的越先淘汰，以保留最近的上下文
- **C.** StreamingLLM 只按位置保留开头的 sink 与最近窗口，不依赖注意力分数，但窗口外的内容会被遗忘
- **D.** 多轮对话沿用压缩后的 KV 时，后续问题若需要已被淘汰的内容，模型无法再看到它
- **E.** 淘汰类方法基本无损：被淘汰 token 的注意力权重在淘汰时已接近 0，之后也不会再变大

<details>
<summary>答案与解析</summary>

**答案：ACD**

**解析：**

**结论**：A、C、D 正确。

- A 对：SnapKV（Li 等, 2024）的观察是：每个头在生成时关注哪些提示词位置，可以从提示词末尾一小段 query 的注意力中预判出来；据此只保留被选中的位置（并做池化，保留它们的邻近 token）。它压缩的是提示词部分，问题恰好位于提示词末尾时效果最好。
- B 错：H2O 依据累计注意力分数，不是位置。
- C 对：StreamingLLM 不需要注意力分数、实现简单，保证超长流式输入下的稳定生成，但不扩展有效上下文。
- D 对：淘汰不可逆，这是淘汰类方法的根本局限。若保留原文、每轮重新 Prefill 再压缩，内容可以「找回」，但也就失去了复用缓存的意义。与之相对，Quest 一类方法保留全部 KV、每步只读一部分，被跳过的内容之后仍可能被选中。
- E 错：「现在」权重小，不代表「以后」也小。token 的重要性随后续的 query 变化，被淘汰的内容可能恰好是下一个问题需要的；多个小误差也会累积。这类方法都是有损的，需要在长上下文任务上评估。

<sub>考点：KV压缩与淘汰　｜　出处：StreamingLLM arXiv:2309.17453；H2O arXiv:2306.14048；SnapKV arXiv:2404.14469</sub>

</details>

---

<a name="INF-KV-035"></a>

### INF-KV-035　进阶 · 考频 ★

关于把 KV Cache 卸载到 GPU 之外的存储（CPU 内存、SSD、远端存储池），下列说法正确的有：

- **A.** 恢复时可以按层流水：第 i 层计算的同时异步传输第 i+1 层的 KV，掩盖部分传输时间
- **B.** KV 卸载是无损的：拷回后的 KV 与卸载前逐位相同，不影响模型输出
- **C.** PD 分离也要搬运 KV：Prefill 实例算出的 KV 经 RDMA 等网络传给 Decode 实例，Mooncake 正是以 KV 为中心设计的
- **D.** 只要 CPU 内存足够大，所有请求的 KV 都可以放在 CPU 上直接参与 GPU 的注意力计算，GPU 显存的容量就不再重要
- **E.** LMCache、Mooncake 等系统把 KV 存到 CPU 内存、本地 SSD 乃至跨机器的存储池，使可复用前缀的容量不再受单卡显存限制，还能在实例之间共享

<details>
<summary>答案与解析</summary>

**答案：ABCE**

**解析：**

**结论**：A、B、C、E 正确。

- A 对：逐层传输与逐层计算流水起来，是卸载、PD 分离中常用的掩盖传输时延的办法。
- B 对：卸载只是换了存放位置，数据原样拷回；与量化、淘汰等有损方法不同。
- C 对：Mooncake 论文的标题就是「以 KV 为中心的 PD 分离架构」：Prefill 集群算出的 KV 经 RDMA 传给 Decode 集群，传输与 KV 池共用一套基础设施。传输量很大（Llama-3-8B 每 token 128 KiB），通常也按层流水传输：第 i 层计算的同时传输下一层的 KV。
- D 错：Decode 每步都要读全部 KV。PCIe 带宽（几十 GB/s）比 HBM（H100 约 3.35 TB/s）低约两个数量级，每步经 PCIe 读 KV 会慢得无法接受，所以参与计算的 KV 仍需在显存里。卸载的价值在于「暂时不用的 KV」，例如等待工具返回的会话、可能被复用的前缀。
- E 对：Mooncake 是月之暗面 Kimi 的以 KV 为中心的服务架构，把集群闲置的 CPU 内存与 SSD 组成分布式 KV 池；LMCache 为 vLLM 等引擎提供多级 KV 缓存与跨实例共享。

另外，SSD 这一层并非没有意义：NVMe SSD 单盘可达每秒数 GB，多盘更高；对很长的上下文，加载几 GB 的 KV 往往仍比重新 Prefill 快，而且不占 GPU 算力。是否划算取决于上下文长度、存储带宽和算力。

<sub>考点：KV卸载　｜　出处：Mooncake arXiv:2407.00079</sub>

</details>

---

## 判断题

<a name="INF-KV-001"></a>

### INF-KV-001　基础 · 考频 ★★★

两个请求都包含同一段 2000 token 的文档，但文档前面的内容不同（例如系统提示词不同）。由于文档部分的 token 完全相同，这段文档在两个请求中的 KV 也完全相同，推理服务可以直接复用。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。一个 token 在某一层的 K、V 由它在该层的隐状态决定，而从第一个注意力层开始，隐状态就混入了它前面所有 token 的信息；RoPE 还让 K 依赖于 token 的绝对位置。前缀不同、位置不同，同一段文档的 KV 就不同。

只有「从序列开头起完全相同」的部分，KV 才一定相同，这正是前缀缓存只能按**前缀**命中的原因：vLLM 的块哈希要把父块哈希串进来，SGLang 用基数树做最长前缀匹配。

延伸：RAG 场景中，同一批文档块出现在不同位置、不同前缀之后的情况很常见。CacheBlend（Yao 等, 2024）等研究尝试复用这类「非前缀」的 KV，再挑选少量 token 重新计算来修补跨块的注意力，属于近似方法，需要评估质量损失。

<sub>考点：KV Cache原理、前缀缓存　｜　出处：CacheBlend（Yao 等, 2024, arXiv:2405.16444）；vLLM 文档：Automatic Prefix Caching https://docs.vllm.ai/en/latest/design/prefix_caching.html；SGLang（Zheng 等, 2023, arXiv:2312.07104）</sub>

</details>

---

<a name="INF-KV-008"></a>

### INF-KV-008　基础 · 考频 ★★

PagedAttention 中，块越小，每条序列最后一块的内部碎片越少；而块表的长度、注意力 kernel 的访存效率与块大小无关，所以块大小取 1（每个 token 一个块）时推理性能最好。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。块越小内部碎片越少，但块表长度、访存效率都与块大小有关，块变小的代价随之增加：
- 块表变长：每个 token 一条映射，调度器维护与传给 GPU 的元数据都变多；
- 注意力 kernel 的访存更零碎，难以按大块连续读取，带宽利用率下降；
- 前缀缓存要为每个块算哈希，块越小哈希与查表次数越多；
- 换出到 CPU 时小块传输效率很低（PagedAttention 论文也指出了这一点）。

块太大则最后一块平均浪费更多、前缀缓存的粒度更粗、写时复制一次要拷贝的数据更多。PagedAttention 论文的实验中块大小在 16～128 之间表现较好（随数据集而异），vLLM 默认取 16。SGLang 默认按 token 粒度（页大小为 1）管理 KV，依靠专门优化的 kernel 控制访存开销。可见块大小是工程上的折中，没有「越小越好」。

<sub>考点：显存碎片、PagedAttention　｜　出处：PagedAttention 论文 arXiv:2309.06180</sub>

</details>

---

<a name="INF-KV-016"></a>

### INF-KV-016　进阶 · 考频 ★★

并行采样中，写时复制只可能发生在提示词最后一个未写满的块上：提示词中已经写满的块在整个生成过程中都不会被写入，因此始终由各样本共享。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。KV 只追加不修改：新 token 只会写进序列的最后一个未满块，或者新申请的块。fork 之后，各样本唯一可能「写进共享块」的位置就是提示词的最后一块（如果它没写满）；之后各样本的新块都是自己独占的。

推论：
- 提示词长度恰好是块大小的整数倍时，fork 后根本不会发生写时复制，每个样本的第一个新 token 直接写进新块；
- 写满的块是不可变的，所以前缀缓存可以放心地让多个请求共享它们；
- beam search 在生成过程中也会 fork，此时被共享的是已生成部分的块，写时复制同样只发生在共享序列的最后一个未满块上。

<sub>考点：写时复制</sub>

</details>

---

<a name="INF-KV-023"></a>

### INF-KV-023　基础 · 考频 ★

RadixAttention 在显存不足时按 LRU 淘汰基数树的叶子节点；正在被运行中请求使用的节点带有引用计数，不会被淘汰。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。SGLang 论文中，基数树的每个节点记录有多少个正在运行的请求在使用它（引用计数），计数为 0 的节点才可以被淘汰；淘汰从叶子开始，按最近使用时间（LRU）选择。

只淘汰叶子是因为内部节点是其他序列的公共前缀：先淘汰前缀会让它下面的所有分支都无法命中，与 vLLM「同一条哈希链先淘汰链尾」是同一个道理。一个叶子被淘汰后，它的父节点可能变成新的叶子，进入下一轮候选。

<sub>考点：RadixAttention　｜　出处：SGLang 论文 arXiv:2312.07104</sub>

</details>

---

<a name="INF-KV-028"></a>

### INF-KV-028　进阶 · 考频 ★★

使用 FP8 KV Cache 时，注意力 kernel 应在读入 KV 后于片上（寄存器 / 共享内存）反量化再计算；如果先把整段 KV 反量化成 BF16 写回显存、再调用普通的注意力 kernel，Decode 不但省不下读带宽，反而会比直接使用 BF16 KV 更慢。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。按每个元素计算显存流量：
- 直接使用 BF16 KV：读 2 字节；
- FP8 KV + 融合反量化的 kernel：读 1 字节，带宽减半；
- 先反量化再计算：读 1 字节（FP8）+ 写 2 字节（BF16）+ 再读 2 字节（BF16）= 5 字节，是 BF16 直接计算的 2.5 倍，还多了一次 kernel 启动和一块临时显存。

Decode 的注意力受带宽限制，流量变多就会变慢。所以 FP8、INT4 等 KV 量化必须配套「边读边反量化」的注意力 kernel（写入时也在 kernel 里顺手量化），收益才能兑现。这也是低比特 KV 量化落地时的主要工程难点之一：每种格式、每种分组方式都需要专门的 kernel 支持。

<sub>考点：KV量化</sub>

</details>

---

## 填空题

<a name="INF-KV-015"></a>

### INF-KV-015　进阶 · 考频 ★★

块大小为 4。一个 13 token 的提示词做完 Prefill 后，用 fork 的方式做 n = 4 的并行采样：4 个样本共享提示词的全部物理块，只增加引用计数；之后每个样本各自生成 6 个 token，写入共享块前按写时复制处理。全部生成完毕时，共占用 ____ 个物理块，过程中一共发生了 ____ 次写时复制；若不共享、每个样本各存一份完整的 KV，则需要 ____ 个物理块。

<details>
<summary>答案与解析</summary>

**答案：** (1) 11；(2) 3；(3) 20

**解析：**

- **提示词**：13 个 token 占 4 块：3 个写满的块 + 第 4 块里只有 1 个 token。fork 后这 4 块的引用计数都是 4。
- **写时复制**：每个样本的第 1 个新 token 都要写进第 4 块（共享且未满）。前 3 个写入者各复制一次（引用计数 4→3→2→1），最后一个写入者面对的引用计数已是 1，直接原地写，共 **3** 次。
- **块数**：每个样本在自己的第 4 块（复制品或原块）里再写 3 个 token 就满了，剩下 3 个 token 各申请 1 个新块。合计 $3$（共享的满块）$+4$（各自的第 4 块）$+4$（新块）$=$ **11**。
- **不共享**：每个样本 $13+6=19$ 个 token，占 5 块，4 个样本共 **20** 块。

无论 4 个样本以什么顺序交替生成，结果都相同。提示词越长、样本数越多，共享省下的显存越多；这也是 RL 训练中对同一道题做多次采样时推理引擎特别高效的原因之一。

<sub>考点：写时复制</sub>

</details>

---

<a name="INF-KV-019"></a>

### INF-KV-019　基础 · 考频 ★★

某服务开启了按块（块大小 16）的自动前缀缓存，只有写满的块才会被缓存和匹配。缓存中已有请求 R 的全部 KV（R 长于 1000 个 token）。新请求 X 共 1000 个 token，其中前 990 个与 R 完全相同、第 991 个开始不同，X 最多能复用 ____ 个 token 的 KV；新请求 Y 的 1000 个 token 与 R 的前 1000 个 token 完全相同，Y 最多能复用 ____ 个 token 的 KV。

<details>
<summary>答案与解析</summary>

**答案：** (1) 976；(2) 992

**解析：**

- **X**：前 990 个 token 相同，覆盖 $990\div16=61.875$ 块。第 62 块（第 977～992 个 token）里含有不同的 token，哈希对不上，只能复用前 61 块，即 $61\times16=$ **976** 个 token。
- **Y**：$1000=62\times16+8$，前 62 块写满且与 R 相同，可复用 $62\times16=$ **992** 个 token；最后 8 个 token 不满一块，要重新计算。

命中长度总是向下取整到块大小的整数倍。另外，即使整段提示词都能命中，也至少要重算最后 1 个 token 才能得到 logits。这些损失每次最多十几个 token，相对几千 token 的前缀可以忽略；真正影响命中率的是前缀中间有没有变化的内容。

<sub>考点：前缀缓存</sub>

</details>

---

## 计算题

<a name="INF-KV-004"></a>

### INF-KV-004　进阶 · 考频 ★★★

用 vLLM 在 H100 上部署 Llama-3-8B（BF16；32 层、8 个 KV 头、头维度 128），显存按 80 GiB 计，`gpu_memory_utilization=0.9`，块大小 16。启动时测得权重占 15 GiB，峰值激活与其他运行时开销约 3 GiB，其余显存全部预分配为 KV 块。
(1) 每个 token 的 KV 多大？每个块多大？共能分配多少个块、容纳多少个 token？
(2) 若 `max_model_len=8192`，按每条请求都用满上下文计算，最大并发是多少？
(3) 若实际请求平均只用 2000 个 token，分页管理下大约能同时容纳多少条？这说明了什么？

<details>
<summary>答案与解析</summary>

**答案：(1) 每 token 128 KiB，每块 2 MiB，共 27648 块、442368 个 token；(2) 54 条；(3) 约 221 条（计入最后一块平均半块的浪费约为 220 条），并发由实际长度而不是上限决定，约为按上限预留的 4 倍**

**解析：**

**(1)** 每 token：$2\times32\times8\times128\times2=131072$ 字节 = 128 KiB；每块 $16\times128\ \text{KiB}=2$ MiB。
KV 可用显存 $=80\times0.9-15-3=54$ GiB，块数 $=54\times1024\div2=$ **27648**，可容纳 $27648\times16=$ **442368** 个 token。

**(2)** 每条满长度请求要 $8192\div16=512$ 块，$27648\div512=$ **54** 条。vLLM 启动日志中也会打印类似的「每条请求用满上下文时的最大并发」估计。

**(3)** 平均每条 $2000\div16=125$ 块，$27648\div125\approx$ **221** 条；考虑最后一块平均约有半块空着（每条约 125.5 块），约 220 条。

**含义**：按需分页时，并发由**实际**长度决定，比按 `max_model_len` 预留多出约 4 倍。这也意味着请求在 Decode 中继续变长时，显存可能被逐渐占满，调度器需要准入控制和抢占来兜底。

<sub>考点：KV Cache大小计算、PagedAttention　｜　出处：vLLM 论文（Kwon 等, 2023, arXiv:2309.06180）；vLLM 文档：Parallelism and Scaling（启动日志中的 GPU KV cache size 与 Maximum concurrency）https://docs.vllm.ai/en/stable/serving/parallelism_scaling/；Llama 3 config.json（Hugging Face meta-llama/Meta-Llama-3-8B：32 层、8 个 KV 头、头维度 128，约 8.03B 参数）</sub>

</details>

---

<a name="INF-KV-007"></a>

### INF-KV-007　进阶 · 考频 ★★

某服务把 `max_tokens` 统一设为 2048，请求的提示词平均 500 token，实际输出平均 300 token。KV 显存共 40 GiB，模型为 Llama-3-8B（每 token 128 KiB）。
(1) 若按「提示词 + max_tokens」为每个请求连续预留 KV 空间，以请求结束时计，预留空间的平均利用率是多少？最多能同时服务多少条请求？
(2) 若用块大小为 16 的 PagedAttention 按需分配，假设序列长度对 16 取余后均匀分布，每条序列平均浪费多少个 token 的位置？利用率是多少？按请求结束时的长度估算，最多能同时容纳多少条？
(3) 两种方式的并发相差约几倍？

<details>
<summary>答案与解析</summary>

**答案：(1) 约 31.4%，128 条；(2) 平均浪费约 7.5 个 token，利用率约 99.1%，约 405 条；(3) 约 3.2 倍**

**解析：**

**(1) 连续预留**：每条预留 $500+2048=2548$ 个位置，结束时实际用 $500+300=800$ 个，利用率 $800\div2548\approx$ **31.4%**。KV 池共 $40\ \text{GiB}\div128\ \text{KiB}=327680$ 个 token 位置，$327680\div2548\approx128.6$，最多 **128** 条。

**(2) 分页**：长度对 16 取余为 $r$ 时，最后一块空着 $(16-r)\bmod16$ 个位置，$r$ 在 0～15 上均匀分布时平均为 $(0+1+\cdots+15)\div16=$ **7.5** 个；利用率 $800\div807.5\approx$ **99.1%**；$327680\div807.5\approx$ **405** 条。

**(3)** $405\div128\approx$ **3.2** 倍。

**说明**：这里按请求结束时的长度估算，对分页偏保守：生成过程中序列更短，实际能容纳的更多。并发更高意味着 Decode 的 batch 更大，这正是 vLLM 论文报告吞吐提升 2～4 倍的主要来源。

<sub>考点：显存碎片　｜　出处：vLLM 论文（Kwon 等, 2023, arXiv:2309.06180）；Llama 3 config.json（Hugging Face meta-llama/Meta-Llama-3-8B：32 层、8 个 KV 头、头维度 128，约 8.03B 参数）</sub>

</details>

---

<a name="INF-KV-020"></a>

### INF-KV-020　进阶 · 考频 ★★★

一个 Agent 任务共调用模型 10 次。第 1 次的提示词为 8000 token（系统提示词 + 工具定义 + 任务描述）；之后每次调用的提示词都在上一次的基础上追加「上一次模型输出的 100 token + 工具返回的 1500 token」。
(1) 不使用前缀缓存，10 次调用共需 Prefill 多少 token？
(2) 若每次都能命中上一次请求留下的全部 KV（忽略块对齐；生成部分的 KV 也被缓存），共需 Prefill 多少 token？是不用缓存时的百分之几？
(3) 设 Prefill 速度为 10000 token/s，第 10 次调用的 TTFT（只算 Prefill）在两种情况下分别是多少？

<details>
<summary>答案与解析</summary>

**答案：(1) 152000 token；(2) 21500 token，约 14.1%；(3) 无缓存约 2.24 s，有缓存约 0.15 s**

**解析：**

**(1)** 第 $k$ 次的提示词长度为 $8000+1600(k-1)$，求和：
$$\sum_{k=1}^{10}\left[8000+1600(k-1)\right]=80000+1600\times45=152000$$

**(2)** 第 1 次要 Prefill 8000 个 token；之后每次，上一轮的提示词和模型输出（输出的 KV 在 Decode 时已经算好并被缓存）都能命中，只需 Prefill 新追加的 1500 个工具返回 token：$8000+9\times1500=21500$，约为 **14.1%**。

**(3)** 第 10 次的提示词为 $8000+9\times1600=22400$ token：无缓存 $22400\div10000=2.24$ s；有缓存只算 1500 个，0.15 s。

**结论**：不用缓存时，累计 Prefill 量随步数近似**平方**增长；命中缓存后只与新增内容的总量成正比。要拿到这个收益，需要：上下文只追加不改写、稳定内容在前；同一会话的请求路由到同一实例；在等待工具返回期间，会话的 KV 不被淘汰（或被卸载到下一级缓存）。

<sub>考点：前缀缓存</sub>

</details>

---

<a name="INF-KV-027"></a>

### INF-KV-027　进阶 · 考频 ★★

Llama-3-8B 每个 token 的 KV 共有 $2\times32\times8\times128=65536$ 个数，BF16 时为 128 KiB。
(1) INT4 分组量化：每 32 个数一组，每组存一个 FP16 的 scale 和一个 FP16 的零点。平均每个数占多少 bit？每个 token 的 KV 多大？相对 BF16 压缩几倍？
(2) 同样分组方式的 INT2 呢？
(3) 一条 32K（32768）token 的序列用 INT2 存储，但最近 128 个 token 保持 BF16（类似 KIVI 的全精度窗口），共需多少 MiB？相对 BF16 压缩几倍？

<details>
<summary>答案与解析</summary>

**答案：(1) 5 bit，40 KiB，3.2 倍；(2) 3 bit，24 KiB，约 5.33 倍；(3) 约 781 MiB，约 5.24 倍（BF16 为 4096 MiB）**

**解析：**

**(1) INT4**：元数据每组 $16+16=32$ bit，摊到 32 个数上每个 1 bit，合计 $4+1=5$ bit；每 token $65536\times5\div8=40960$ 字节 = **40 KiB**；压缩 $128\div40=$ **3.2** 倍（而不是名义上的 4 倍）。

**(2) INT2**：$2+1=3$ bit；每 token $65536\times3\div8=24576$ 字节 = **24 KiB**；压缩约 **5.33** 倍（名义 8 倍）。

**(3)**：INT2 部分 $(32768-128)\times24\ \text{KiB}=783360$ KiB = 765 MiB；全精度窗口 $128\times128\ \text{KiB}=16$ MiB；合计约 **781 MiB**。BF16 为 $32768\times128\ \text{KiB}=4096$ MiB，压缩约 **5.24** 倍。

**启示**：比特越低，元数据的相对开销越大。增大分组能降低开销但精度变差，也可以把 scale 存成更低的精度。评估 KV 量化时要按「实际字节数」算容量收益，并确认注意力 kernel 能直接读取这种格式。

<sub>考点：KV量化、KV Cache大小计算　｜　出处：KIVI arXiv:2402.02750</sub>

</details>

---

<a name="INF-KV-034"></a>

### INF-KV-034　进阶 · 考频 ★★

Agent 会话在等待工具返回期间，其 32K（32768）token 的 KV（Llama-3-8B，BF16，每 token 128 KiB）被换出到 CPU 内存。下一次调用时有两种恢复方式：经 PCIe 把 KV 拷回 GPU，或重新 Prefill。设 PCIe 5.0 x16 的有效带宽为 50 GB/s，H100 上 Prefill 的有效算力为 600 TFLOPS。
(1) 这段 KV 有多大？
(2) 拷回需要多久？若是 PCIe 4.0（有效约 25 GB/s）呢？
(3) 重新 Prefill 需要多久？（FLOPs 按 $2NT+2Ln_qd_hT^2$ 计，$N=8.03\times10^9$，$L=n_q=32$，$d_h=128$）
(4) 结论是什么？还需要考虑哪些因素？

<details>
<summary>答案与解析</summary>

**答案：(1) 4 GiB（约 4.29 GB）；(2) 约 86 ms，PCIe 4.0 约 172 ms；(3) 约 1.35 s；(4) 拷回比重算快约 16 倍，长上下文时卸载再加载远比重算划算，但要考虑 PCIe 争用、CPU 内存容量、与计算的重叠以及缓存失效时的回退**

**解析：**

**(1)** $32768\times128\ \text{KiB}=4$ GiB $\approx4.29$ GB。

**(2)** $4.29\ \text{GB}\div50\ \text{GB/s}\approx$ **86 ms**；PCIe 4.0 约 **172 ms**。

**(3)** 线性部分 $2\times8.03\times10^9\times32768\approx5.26\times10^{14}$；注意力部分 $2\times32\times32\times128\times32768^2\approx2.81\times10^{14}$；合计约 $8.08\times10^{14}$ FLOPs，$\div600$ TFLOPS $\approx$ **1.35 s**。

**(4) 结论**：拷回比重算快约 16 倍（$1.35\ \text{s}\div86\ \text{ms}\approx15.7$）。重算的计算量随长度超线性增长（注意力项是 $T^2$），拷回只随长度线性增长，上下文越长，卸载越划算；而且重算会占用本可以服务其他请求的算力。

**其他因素**：
- PCIe 由同机多张卡、多路数据共享，高峰时有效带宽会下降；
- CPU 内存容量有限（每会话 4 GiB，上千个等待中的会话就要几 TB），需要再往 SSD 或分布式存储分层，并设置淘汰策略；
- 按层流水加载（第 $i$ 层计算时传第 $i+1$ 层）可以把传输与计算重叠；
- 缓存可能已被淘汰，必须能回退到重算；前缀的前一部分可能还在 GPU 上，只需加载缺失的部分。

<sub>考点：KV卸载　｜　出处：Llama 3 config.json（Hugging Face meta-llama/Meta-Llama-3-8B：32 层、8 个 KV 头、头维度 128，约 8.03B 参数）；NVIDIA H100 规格 https://www.nvidia.com/en-us/data-center/h100/（PCIe Gen5 x16 双向合计 128 GB/s）</sub>

</details>

---

<a name="INF-KV-037"></a>

### INF-KV-037　挑战 · 考频 ★★

设想把 Llama-3-8B 的结构（32 层、8 个 KV 头、头维度 128，约 8.03B 参数）用于 1M（$2^{20}$）token 的上下文。
(1) 一条 1M token 序列的 KV 在 BF16 与 FP8 下各多大？单张 80 GB 的 GPU 能放下吗？
(2) 用 8 张 H100 做张量并行（每卡 1 个 KV 头、1/8 的权重），每卡按 80 GB × 90% 可用、再预留 3 GiB 给激活等开销，每卡能放下几条 1M 序列的 KV（BF16 / FP8）？
(3) Decode 时每一步，仅读取一条 1M 序列的 KV（BF16）就要多久（8 卡带宽合计 26.8 TB/s）？与读一遍权重的时间相比如何？这说明长上下文推理应从哪里入手优化？

<details>
<summary>答案与解析</summary>

**答案：(1) BF16 为 128 GiB，FP8 为 64 GiB，单卡都放不下（FP8 加上约 15 GiB 权重也超出约 74.5 GiB 的显存）；(2) 每卡可用约 62 GiB，BF16 下每条序列每卡 16 GiB，约 3 条；FP8 下每卡 8 GiB，约 7 条；(3) 约 5.1 ms，约为读权重（约 0.6 ms）的 8.6 倍，瓶颈完全在 KV，应从减少 KV 的存储与读取入手**

**解析：**

**(1)** 每 token 128 KiB，$2^{20}\times128\ \text{KiB}=128$ GiB；FP8 为 64 GiB。80 GB 约 74.5 GiB，FP8 的 KV 加上约 15 GiB 的权重也放不下。

**(2)** 每卡可用：$80\times10^9\times0.9\div2^{30}\approx67.1$ GiB，减去 1/8 的权重（约 1.9 GiB）和 3 GiB，约 **62 GiB**。每条序列每卡：BF16 为 $128\div8=16$ GiB，可放 **3** 条；FP8 为 8 GiB，可放 **7** 条。

**(3)** $128\ \text{GiB}\approx137.4$ GB，$137.4\div26.8\ \text{TB/s}\approx$ **5.1 ms**；读权重 $16.06\ \text{GB}\div26.8\ \text{TB/s}\approx0.6$ ms，KV 是它的约 **8.6 倍**。

**启示**：长上下文时，KV 的容量和读取量都远超权重，batch 也无法摊薄它。优化要直接作用在 KV 上：
- 少存几个头或压缩：GQA、MLA；
- 每个数少几位：FP8 / INT4 KV；
- 每步少读：查询感知稀疏（Quest、DSA）或混合局部 / 全局注意力；
- 换地方存、多卡分摊：卸载到 CPU、上下文并行把序列切到多张卡上。

<sub>考点：长上下文KV优化、KV Cache大小计算　｜　出处：Llama 3 config.json（Hugging Face meta-llama/Meta-Llama-3-8B：32 层、8 个 KV 头、头维度 128，约 8.03B 参数）；NVIDIA H100 规格 https://www.nvidia.com/en-us/data-center/h100/；Quest（Tang 等, 2024, arXiv:2406.10774）</sub>

</details>

---

## 代码输出题

<a name="INF-KV-018"></a>

### INF-KV-018　进阶 · 考频 ★★

vLLM 风格的前缀缓存中，请求结束后其块的引用计数归零，进入「可淘汰队列」（内容仍可被命中），显存不足时从队头开始淘汰。下面的代码比较两种入队顺序：按「链尾 → 链头」逆序入队，与按「链头 → 链尾」正序入队。输出是什么？

```python
from collections import OrderedDict

def run(reverse):
    free = OrderedDict()                  # 引用计数为 0、仍可被命中的块；越靠前越先被淘汰
    for chain in (["S0", "S1", "A2", "A3"], ["S0", "S1", "B2"]):   # 请求 A、B 先后结束
        for b in (reversed(chain) if reverse else chain):
            free.pop(b, None)
            free[b] = True                # 放到队尾（最晚被淘汰）
    evicted = [free.popitem(last=False)[0] for _ in range(3)]       # 显存紧张，淘汰 3 块
    hit = 0
    for b in ["S0", "S1", "C2"]:          # 新请求 C 与 A、B 共享前缀 S0、S1
        if b not in free:
            break
        hit += 1
    return evicted, list(free), hit

print(run(reverse=True))
print(run(reverse=False))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
(['A3', 'A2', 'B2'], ['S1', 'S0'], 2)
(['A2', 'A3', 'S0'], ['S1', 'B2'], 0)
```

**解析：**

**逆序入队**：A 结束后队列为 `[A3, A2, S1, S0]`；B 结束时 `B2` 入队，`S1`、`S0` 被移到队尾，得到 `[A3, A2, B2, S1, S0]`。淘汰前 3 块后只剩公共前缀 `S1, S0`，请求 C 命中 2 块。

**正序入队**：A 结束后为 `[S0, S1, A2, A3]`；B 结束后为 `[A2, A3, S0, S1, B2]`。淘汰前 3 块时把链头 `S0` 也淘汰了，C 在第一块就未命中，命中数为 0；而 `S1`、`B2` 虽然还在显存里，却因为前面的块缺失再也不可能被命中，白白占着空间。

**结论**：同一条哈希链上要先淘汰靠后的块、保住靠前的公共前缀。vLLM 在请求结束时按逆序把块放回空闲队列，正是为此；SGLang 的基数树只淘汰叶子节点，也天然满足「先淘汰后缀」。

<sub>考点：前缀缓存</sub>

</details>

---

<a name="INF-KV-031"></a>

### INF-KV-031　进阶 · 考频 ★

下面的代码用一个玩具例子比较两种 KV 淘汰策略：H2O 式（保留最近的 token + 累计注意力最高的 token）与 StreamingLLM 式（保留开头的 sink token + 最近的窗口）。KV 预算都是 4 个 token。输出是什么？

```python
import numpy as np

# 6 个已缓存 token 在最近 3 个解码步里得到的注意力权重（每行是一步）
attn = np.array([
    [0.40, 0.05, 0.30, 0.05, 0.10, 0.10],
    [0.35, 0.05, 0.25, 0.10, 0.05, 0.20],
    [0.30, 0.10, 0.20, 0.05, 0.05, 0.30],
])
budget, recent = 4, 2                  # 只能保留 4 个 token，其中 2 个留给最近的 token
n = attn.shape[1]
score = attn.sum(axis=0)               # 累计注意力
older = range(n - recent)
heavy = sorted(older, key=lambda i: -score[i])[: budget - recent]
print(np.round(score, 2).tolist())
print(sorted(heavy) + list(range(n - recent, n)))
sink = 1                               # StreamingLLM 式：1 个开头 token + 最近的窗口
print(list(range(sink)) + list(range(n - (budget - sink), n)))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
[1.05, 0.2, 0.75, 0.2, 0.2, 0.6]
[0, 2, 4, 5]
[0, 3, 4, 5]
```

**解析：**

- **累计分数**：按列求和，得到 `[1.05, 0.2, 0.75, 0.2, 0.2, 0.6]`。
- **H2O 式**：最近的 2 个（位置 4、5）必留；其余 2 个名额从位置 0～3 中按累计分数选最高的：位置 0（1.05）和位置 2（0.75）。保留 `[0, 2, 4, 5]`。
- **StreamingLLM 式**：保留开头 1 个 sink（位置 0）和最近 3 个（位置 3、4、5），完全不看注意力分数。保留 `[0, 3, 4, 5]`。

差别在位置 2：它持续获得较高的注意力，很可能承载着重要内容，H2O 留下了它，StreamingLLM 则按位置把它挤掉了。代价是 H2O 需要注意力分数，而 StreamingLLM 只需维护一个滚动窗口，实现简单、与 FlashAttention 完全兼容。真实的 H2O 在每一层、每个头上分别统计与选择。

<sub>考点：KV压缩与淘汰　｜　出处：H2O arXiv:2306.14048；StreamingLLM arXiv:2309.17453</sub>

</details>

---

## 代码填空题

<a name="INF-KV-013"></a>

### INF-KV-013　基础 · 考频 ★★

分页 KV 池的形状为 `(num_blocks, block_size, d)`，一条序列的块表 `block_table` 记录它依次占用的物理块号。补全 `gather_kv`，按逻辑顺序取出这条序列前 `seq_len` 个 token 的 KV（这正是分页注意力 kernel 读取 KV 时做的地址换算）。

```python
import torch

def gather_kv(pool: torch.Tensor, block_table: torch.Tensor, seq_len: int) -> torch.Tensor:
    block_size = pool.shape[1]
    pos = torch.arange(seq_len)                # 逻辑位置 0, 1, ..., seq_len-1
    blocks = block_table[____]                 # 每个位置所在的物理块号
    offsets = ____                             # 每个位置在块内的偏移
    return pool[blocks, offsets]               # (seq_len, d)
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `pos // block_size`；(2) `pos % block_size`

**解析：**

第 $i$ 个 token 位于第 `i // block_size` 个逻辑块、块内第 `i % block_size` 个位置；逻辑块号经块表换成物理块号后，就能在池中定位。

写入新 token 时用同样的换算：把池看成 `(num_blocks * block_size, d)` 的一维槽位，第 $n$ 个 token 的槽位号为 `block_table[n // block_size] * block_size + n % block_size`，vLLM 中称为 slot mapping。

真实的 kernel 不会先把整条序列拼成连续张量（那样就多了一次读写），而是在计算注意力时按块读取：每次取一个物理块的 K、V 放进片上存储，与 query 打分并用 online softmax 累加。块表本身很小，可以放进共享内存或寄存器。

<sub>考点：块表、PagedAttention</sub>

</details>

---

## 代码改错题

<a name="INF-KV-014"></a>

### INF-KV-014　进阶 · 考频 ★★

下面是一个分页 KV 分配器的简化实现，`fork` 用于并行采样：子序列共享父序列的全部物理块，只增加引用计数。测试发现，fork 之后父子序列各自追加 token，读出来的内容会互相串写。请找出 bug 并修正。

```python
class Pool:
    def __init__(self, n, bs):
        self.free, self.ref, self.bs = list(range(n)), [0] * n, bs
        self.data = [[None] * bs for _ in range(n)]

    def alloc(self):
        b = self.free.pop(0)
        self.ref[b] = 1
        return b

    def release(self, b):
        self.ref[b] -= 1
        if self.ref[b] == 0:
            self.free.append(b)

class Seq:
    def __init__(self, pool):
        self.pool, self.table, self.n = pool, [], 0

    def fork(self):
        child = Seq(self.pool)
        child.table, child.n = list(self.table), self.n
        for b in self.table:
            self.pool.ref[b] += 1
        return child

    def append(self, tok):
        p, slot = self.pool, self.n % self.pool.bs
        if slot == 0:
            self.table.append(p.alloc())
        p.data[self.table[-1]][slot] = tok
        self.n += 1

    def tokens(self):
        bs = self.pool.bs
        return [self.pool.data[self.table[i // bs]][i % bs] for i in range(self.n)]
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：`append` 只在当前块写满时申请新块，没有检查「要写入的块是否被共享」。fork 之后父子序列的最后一块是同一个物理块（引用计数为 2），双方都往这一块的同一个槽位写，后写的覆盖先写的，于是串写。

**修正**：写入未满的块之前，若它的引用计数大于 1，先申请新块、复制已有的 `slot` 个 token、对旧块减引用，再写入新块（写时复制）：

```python
elif p.ref[self.table[-1]] > 1:
    old, new = self.table[-1], p.alloc()
    p.data[new][:slot] = p.data[old][:slot]
    p.release(old)
    self.table[-1] = new
```

**修正后的代码：**

```python
class Pool:
    def __init__(self, n, bs):
        self.free, self.ref, self.bs = list(range(n)), [0] * n, bs
        self.data = [[None] * bs for _ in range(n)]

    def alloc(self):
        b = self.free.pop(0)
        self.ref[b] = 1
        return b

    def release(self, b):
        self.ref[b] -= 1
        if self.ref[b] == 0:
            self.free.append(b)

class Seq:
    def __init__(self, pool):
        self.pool, self.table, self.n = pool, [], 0

    def fork(self):
        child = Seq(self.pool)
        child.table, child.n = list(self.table), self.n
        for b in self.table:
            self.pool.ref[b] += 1
        return child

    def append(self, tok):
        p, slot = self.pool, self.n % self.pool.bs
        if slot == 0:
            self.table.append(p.alloc())
        elif p.ref[self.table[-1]] > 1:              # 要写的块被共享：先复制再写
            old, new = self.table[-1], p.alloc()
            p.data[new][:slot] = p.data[old][:slot]
            p.release(old)
            self.table[-1] = new
        p.data[self.table[-1]][slot] = tok
        self.n += 1

    def tokens(self):
        bs = self.pool.bs
        return [self.pool.data[self.table[i // bs]][i % bs] for i in range(self.n)]
```

**解析：**

写时复制的要点：
1. **只复制要写的那一块**：前面写满的块不会再被写入，继续共享（测试中块 0 的引用计数仍为 2）；
2. **复制后给旧块减引用**：最后一个持有者再写时，引用计数已降为 1，直接原地写，不再多复制一次；
3. **释放共享块只减计数**：计数归零才真正回收，否则另一条序列会读到被覆盖的数据。

在真实系统里，复制一块意味着在 GPU 上拷贝这一块所有层的 K、V，由调度器在每一步执行前统一下发拷贝指令。

<sub>考点：写时复制</sub>

</details>

---

## 编程题

<a name="INF-KV-024"></a>

### INF-KV-024　挑战 · 考频 ★★

实现 RadixAttention 中用于前缀匹配的基数树（只需管理 token 序列，不必存 KV）：

```python
class RadixCache:
    def insert(self, tokens: list[int]) -> None: ...
    def match_prefix(self, tokens: list[int]) -> int: ...
    def node_count(self) -> int: ...
```

- 每条边存一段 token；同一节点的各条子边的首 token 互不相同；
- `insert`：插入一个序列。若与已有的边只部分重合，要在分歧处把这条边劈成两段（产生一个新的中间节点）；插入一个已有序列的前缀时，若结束点落在边的中间，同样要劈开；
- `match_prefix`：返回该序列与已插入序列的最长公共前缀长度（按 token 计，可以停在一条边的中间）；
- `node_count`：返回除根节点外的节点数。例如依次插入 `[1, 2, 3, 4]` 和 `[1, 2, 5]` 后，树中有 `[1, 2]`、`[3, 4]`、`[5]` 三个节点。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
class Node:
    def __init__(self, key=()):
        self.key = tuple(key)          # 从父节点到本节点这条边上的 token 片段
        self.children = {}             # 子边首 token -> 子节点

class RadixCache:
    def __init__(self):
        self.root = Node()

    @staticmethod
    def _common(a, b):
        n = 0
        while n < len(a) and n < len(b) and a[n] == b[n]:
            n += 1
        return n

    def match_prefix(self, tokens):
        node, i = self.root, 0
        while i < len(tokens) and tokens[i] in node.children:
            child = node.children[tokens[i]]
            n = self._common(child.key, tokens[i:])
            i += n
            if n < len(child.key):             # 停在边的中间
                break
            node = child
        return i

    def insert(self, tokens):
        node, i, tokens = self.root, 0, tuple(tokens)
        while i < len(tokens):
            first = tokens[i]
            if first not in node.children:      # 没有可走的边：挂一个新叶子
                node.children[first] = Node(tokens[i:])
                return
            child = node.children[first]
            n = self._common(child.key, tokens[i:])
            if n < len(child.key):              # 部分重合：在第 n 个 token 处劈开
                mid = Node(child.key[:n])
                child.key = child.key[n:]
                mid.children[child.key[0]] = child
                node.children[first] = mid
                child = mid
            node, i = child, i + n

    def node_count(self):
        stack, cnt = [self.root], 0
        while stack:
            nd = stack.pop()
            cnt += len(nd.children)
            stack.extend(nd.children.values())
        return cnt
```

**测试用例：**

```python
c = RadixCache()
assert c.match_prefix([1, 2, 3]) == 0 and c.node_count() == 0
c.insert([1, 2, 3, 4])
assert c.match_prefix([1, 2, 3, 4, 5]) == 4
assert c.match_prefix([1, 2, 9]) == 2            # token 粒度：可以停在边的中间
assert c.node_count() == 1
c.insert([1, 2, 5])                               # 在 [1, 2] 之后分叉
assert c.node_count() == 3                        # [1,2] -> {[3,4], [5]}
assert c.match_prefix([1, 2, 5, 7]) == 3
assert c.match_prefix([1, 2, 3, 4]) == 4
assert c.match_prefix([1, 3]) == 1
c.insert([1, 2, 3, 4])                            # 重复插入不新增节点
assert c.node_count() == 3
c.insert([1, 2, 3, 4, 6, 6])                      # 在叶子后面延长
assert c.match_prefix([1, 2, 3, 4, 6, 6, 6]) == 6
assert c.node_count() == 4
c.insert([1, 2])                                  # 恰好结束在已有节点上
assert c.node_count() == 4 and c.match_prefix([1, 2]) == 2
c.insert([1])                                     # 结束在边的中间：需要劈开
assert c.match_prefix([1]) == 1 and c.node_count() == 5
c.insert([8, 9])
assert c.match_prefix([8, 9, 1]) == 2 and c.match_prefix([]) == 0
assert c.node_count() == 6
```

**解析：**

**思路**：
1. **匹配**：从根出发，用下一个 token 选子边，逐个比较边上的 token；整条边都匹配就进入子节点继续，中途不匹配就停下，已比较的长度即答案。
2. **插入**：沿同样的路径向下。没有可走的边时，把剩余部分作为一条新边挂上；只部分重合时，把原边劈成「公共部分 + 剩余部分」两段，插入一个中间节点，再从中间节点继续。
3. **复杂度**：匹配与插入都是 $O(L)$（$L$ 为序列长度），与缓存的序列总数无关。

**与真实系统的差别**：SGLang 的节点还记录对应 KV 在显存池中的位置、引用计数与最近访问时间；显存不足时按 LRU 淘汰引用计数为 0 的叶子；匹配成功后，请求直接复用这些位置上的 KV，只为未命中的部分做 Prefill。与按块哈希的实现相比，基数树能匹配到任意 token 位置，也天然支持多分支的共享结构。

**易错点**：劈边时忘了更新父节点的子边映射；结束在边中间的插入不劈边，导致后续计数或匹配出错；把首 token 相同的两条边都挂在同一个节点下。

<sub>考点：RadixAttention　｜　出处：SGLang 论文 arXiv:2312.07104</sub>

</details>

---

## 简答题

<a name="INF-KV-011"></a>

### INF-KV-011　进阶 · 考频 ★★★

vLLM 的 PagedAttention 解决了什么问题？它如何借鉴操作系统的虚拟内存？请说明块、块表、按需分配、共享与写时复制的作用，以及它的代价和块大小的选择。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **问题**：KV 的长度事先未知、在生成中不断增长。早期系统按「提示词 + 最大输出长度」预留连续显存，产生预留、内部碎片、外部碎片三类浪费，KV 显存只有约 20%～38% 真正存放 token，batch 因此上不去，吞吐低。
2. **类比**：KV 块 ↔ 内存页，token ↔ 字节，序列 ↔ 进程，块表 ↔ 页表；逻辑上连续的 KV 在物理上可以分散存放。
3. **块**：KV 切成固定大小的块，每块存 $b$ 个 token（vLLM 默认 16）的 K、V；任意空闲块可以分给任意序列，没有外部碎片。
4. **块表**：每条序列一张，把逻辑块号映射到物理块号；由 CPU 侧的调度器维护，每步传给 GPU，注意力 kernel 按表读取 K、V。
5. **按需分配**：上一块写满才申请新块，浪费只剩每条序列最后一块中未写满的部分，平均不到半块；请求结束立即归还。
6. **共享与写时复制**：并行采样、beam search、前缀缓存让多张块表指向同一物理块，用引用计数管理；某条序列要写入共享块时，先复制这一块再写，写满的块继续共享。
7. **效果与代价**：KV 浪费降到 4% 以下，论文报告吞吐比 FasterTransformer、Orca 高 2～4 倍；代价是 kernel 要按表间接寻址、访存不连续，论文微基准中注意力 kernel 慢约 20%～26%，另有 CPU 侧的块管理开销。
8. **块大小**：小块碎片少，但块表长、访存零碎、元数据与哈希开销大；大块则最后一块浪费多、前缀缓存粒度粗、写时复制拷贝多。

**评分要点（共 10 分）：**

- 说清 KV 长度未知导致的三类浪费及其对 batch 和吞吐的影响（2 分）
- 说明与虚拟内存的类比，以及块、块表、按需分配的机制（3 分）
- 说明引用计数共享与写时复制（2 分）
- 说明效果与 kernel 间接寻址等代价（2 分）
- 说明块大小的折中（1 分）

**讲解：**

**常见失分点**：说 PagedAttention「减少了注意力计算量」或「压缩了 KV」；讲不清块表由谁维护、kernel 如何使用；把写时复制说成 fork 时就整体复制；不知道浪费只剩最后一块；只讲收益不讲代价。

<sub>考点：PagedAttention、显存碎片、块表　｜　出处：PagedAttention 论文 arXiv:2309.06180</sub>

</details>

---

<a name="INF-KV-025"></a>

### INF-KV-025　进阶 · 考频 ★★

对比 vLLM 的自动前缀缓存（APC）与 SGLang 的 RadixAttention：数据结构、匹配粒度、淘汰策略、与调度的配合，以及各自更适合的场景。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **共同点**：都基于「因果注意力下，相同前缀的 KV 完全相同」；都只能按前缀精确命中；都缓存 KV 而不是输出；多实例部署时都需要亲和路由，多租户时都需要隔离。
2. **数据结构**：APC 是哈希表，键为链式块哈希（父块哈希 + 本块 token + LoRA、多模态、缓存盐等额外键），值为物理块；RadixAttention 是基数树，边是 token 片段，节点指向 KV 在显存池中的位置。
3. **匹配粒度**：APC 以块（默认 16 个 token）为单位，只缓存写满的块，命中长度向下取整到块大小，逐块查表、遇到第一个未命中就停；RadixAttention 按 token 粒度沿树做最长前缀匹配，可以停在任意位置。
4. **淘汰**：APC 中引用计数归零的块按链尾到链头的顺序进入可淘汰队列，LRU 淘汰，先淘汰后缀；RadixAttention 按 LRU 淘汰引用计数为 0 的叶子节点，同样先淘汰后缀。
5. **与调度的配合**：SGLang 的缓存感知调度让匹配前缀更长的请求优先执行，前端语言还能显式表达 fork 等程序结构；vLLM V1 把 APC 融入统一调度（每步为每个请求计算「还需算多少 token」），默认开启，命中率为 0 时的额外开销很小。
6. **适合的场景**：两者都适合多轮对话、Agent、长系统提示词。基数树天然表达树状分叉（多分支搜索、共享 few-shot 示例、对同一前缀的多次采样），短前缀、非块对齐的复用更充分；按块哈希实现简单、查找为 $O(1)$、与分页 kernel 和额外键的扩展结合自然。对很长的、按块对齐的公共前缀，两者命中率相差不大。

**评分要点（共 10 分）：**

- 说清两者的数据结构（3 分）
- 说清匹配粒度与查找方式的差异（2 分）
- 说清淘汰策略及「先淘汰后缀」的共同原则（2 分）
- 说明与调度的配合及各自适合的场景（3 分）

**讲解：**

**常见失分点**：说其中一个缓存的是输出；说 APC 能跳过未命中的块继续匹配；不知道 APC 只缓存满块；讲不出缓存感知调度；把两者说成完全不同的原理。

<sub>考点：RadixAttention、前缀缓存　｜　出处：SGLang 论文 arXiv:2312.07104</sub>

</details>

---

<a name="INF-KV-029"></a>

### INF-KV-029　挑战 · 考频 ★★

在推理服务中落地 KV Cache 量化（如 FP8、INT4），除了「精度掉多少」，还需要考虑哪些系统层面的问题？请分点说明。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **收益在哪**：一是容量，同样的显存放下更多并发或更长的上下文；二是 Decode 注意力的读带宽。上下文越长、batch 越大，KV 在显存与带宽中的占比越高，收益越明显；短上下文、小 batch 时收益有限。
2. **kernel 支持**：注意力 kernel 要在片上边读边反量化，写入 KV 时在 kernel 里顺手量化；要同时支持分页布局、Prefill 与 Decode、变长 batch。没有融合 kernel，带宽收益会被反量化的额外读写吃掉。
3. **scale 的粒度与存放**：逐张量的静态 scale（离线校准，实现最简单），或逐头、逐 token、逐通道的动态 scale。scale 要和 KV 一起按块存放；Key 按通道量化需要攒够一组 token，最近的 token 先以高精度保存，使块的布局与管理更复杂。
4. **与其他机制的兼容**：前缀缓存中被复用的 KV 必须采用相同的量化配置；卸载到 CPU / SSD 与 PD 分离时，传输量化后的 KV 能节省带宽，但两端格式必须一致；投机解码的回滚、CUDA Graph 的固定形状也要支持。
5. **精度评测**：长上下文检索（大海捞针、RULER）、多轮对话、长生成的推理任务（误差会累积）、结构化输出与工具调用；分别评估 K 与 V 的敏感度、各层的敏感度，必要时对少数层保留高精度。
6. **硬件与格式**：FP8 在 Hopper 等架构上有原生支持，E4M3 精度更高、E5M2 范围更大；更低比特的整数格式依赖专门实现。
7. **上线方式**：作为可开关的配置，灰度对比，监控格式错误率、长文本任务的质量指标与吞吐。

**评分要点（共 10 分）：**

- 说明容量与带宽两类收益及其适用条件（2 分）
- 指出需要边读边反量化的融合 kernel（2 分）
- 说明 scale 粒度、存放与 Key 分组带来的布局问题（2 分）
- 说明与前缀缓存、卸载、PD 分离等机制的兼容性（2 分）
- 给出针对长上下文与长生成的评测方案（2 分）

**讲解：**

**常见失分点**：只谈精度不谈 kernel；以为把 KV 存成低比特就自动变快；忽略 scale 的存储开销与布局；不考虑与前缀缓存、PD 分离的格式一致性；只用困惑度评估，忽略长上下文与长生成任务。

<sub>考点：KV量化</sub>

</details>

---

<a name="INF-KV-033"></a>

### INF-KV-033　挑战 · 考频 ★

长上下文推理中，KV 淘汰与压缩方法（如 StreamingLLM、H2O、SnapKV）可以大幅节省显存。请分析这类方法的风险、适合与不适合的场景、上线前应如何评估，并与「保留全部 KV、每步只读取一部分」的查询感知稀疏方法（如 Quest）对比。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **收益**：减少 KV 的容量与 Decode 读取量，支持更长的上下文或更大的 batch。
2. **风险**：
   - 淘汰不可逆，token 的重要性随后续 query 变化，被丢掉的内容可能恰好是后面需要的；
   - 对需要精确回忆任意细节的任务（检索、代码、法律、数字）伤害最大；
   - 依赖注意力分数的方法与 FlashAttention 等融合 kernel 不兼容，需要额外计算；
   - 各序列、各头保留不同的位置，KV 布局不规则，与分页、前缀缓存难以配合：同一前缀在不同请求中被压缩成不同的样子，无法共享；
   - 累计分数有偏、各层各头的冗余程度不同，统一预算容易误删。
3. **适合的场景**：流式长对话（最近内容最重要）、问题在 Prefill 时已知的单轮长文档问答（SnapKV 一类）、对少量细节损失不敏感的摘要。
4. **不适合的场景**：同一份长文档上的多轮不同提问、Agent 需要回看早先的工具输出、代码仓库理解、大海捞针式检索。
5. **评估方法**：大海捞针与 RULER 的多键检索、LongBench 等长上下文基准；专门构造「后续问题依赖早期内容」的多轮测试；用业务轨迹回放；在多个预算比例下画出质量 - 显存曲线；端到端测量吞吐与时延收益；灰度上线。
6. **与 Quest 对比**：Quest 为每个 KV 页记录 key 各维度的最小 / 最大值，结合当前 query 估计页的重要性，只加载得分最高的若干页参与注意力。它保留全部 KV（容量不降），但每步读取量下降、选择可逆，风险小得多；代价是元数据与选择的开销，容量问题仍需配合量化或卸载解决。DeepSeek-V3.2-Exp 的稀疏注意力（DSA）也采用「全部保留、按需挑选」的思路，用一个轻量的索引器为每个 query 选出部分 token。

**评分要点（共 10 分）：**

- 说清淘汰不可逆、重要性随 query 变化等核心风险，以及与 kernel、分页、前缀缓存的兼容问题（3 分）
- 给出合理的适合与不适合场景（2 分）
- 给出覆盖长上下文检索与多轮依赖的评估方案（3 分）
- 正确对比「保留全部、按需读取」的方法（2 分）

**讲解：**

**常见失分点**：认为被淘汰的 token「本来就不重要」；只用困惑度评估；忽略多轮对话中重要性的变化；不知道淘汰会破坏前缀缓存的共享；把 Quest 也当成淘汰方法。

<sub>考点：KV压缩与淘汰、长上下文KV优化　｜　出处：StreamingLLM arXiv:2309.17453；H2O arXiv:2306.14048；SnapKV arXiv:2404.14469；Quest（Tang 等, ICML 2024）</sub>

</details>

---

## 场景分析题

<a name="INF-KV-039"></a>

### INF-KV-039　挑战 · 考频 ★★

某团队在 vLLM 上部署 Agent 服务并开启了自动前缀缓存，期望系统提示词（约 6K token）与对话历史大部分命中，但监控显示前缀缓存命中率只有约 20%，TTFT 没有改善。已知：
① 服务有 4 个副本，网关轮询分发请求；
② 聊天模板在系统提示词开头插入了精确到秒的当前时间；
③ 部分请求使用不同的 LoRA 适配器；
④ 高峰期 KV 使用率在 95% 以上；
⑤ 工具定义由各业务方动态拼接，顺序不固定。
请逐条分析它们对命中率的影响，并给出排查方法与改进方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 逐条分析**：
- **① 轮询分发**：前缀缓存只在单个实例内有效。同一会话的下一轮只有约 1/4 的概率落到上一轮所在的副本，历史部分大多无法命中。改为按会话（或前缀哈希）做亲和路由，配合负载阈值防止热点。
- **② 开头的时间戳**：链式块哈希使第一块的任何变化都让其后所有块失效。时间每秒都变，等于整段提示词每次都不同，连系统提示词也无法命中，这很可能是命中率低的首要原因。把时间移到提示词末尾，或只精确到日期。
- **③ LoRA**：不同适配器算出的 KV 不同，缓存键包含 LoRA 编号，跨适配器本来就不能共享，这是正确行为。可以按适配器分组路由，提高同一适配器请求的聚集度。
- **④ KV 使用率高**：活跃请求占满显存，已结束请求留下的可复用块很快被淘汰，等工具返回后的下一轮常常已找不到上一轮的 KV。可启用 FP8 KV、增加副本、限制并发，或引入 CPU 内存一级的 KV 缓存（如 LMCache）保留被淘汰的块。
- **⑤ 工具定义顺序不固定**：工具定义位于提示词前部，顺序一变，其后全部失效。改为确定性序列化（固定排序、稳定的 JSON 键顺序），会话内保持工具集稳定，新增工具追加在末尾。

**2. 排查方法**：
- 看 vLLM 的前缀缓存查询数与命中数指标，以及请求级的命中 token 数（部分框架可在 usage 中返回 `cached_tokens`）；
- 抽取同一会话相邻两轮的提示词，逐 token 对比，找出第一个不同的位置（多半就是时间戳或工具定义）；
- 按副本、按租户 / 适配器、按时段拆分命中率；用线上日志离线模拟不同路由策略下的命中率。

**3. 改进与验证**：按影响从大到小依次修复（②⑤ → ① → ④），每一步观察命中率、平均 Prefill token 数与 TTFT；目标是系统提示词几乎全部命中、会话历史大部分命中。

**评分要点（共 10 分）：**

- 指出轮询分发让会话历史无法命中，并给出亲和路由（2 分）
- 指出开头时间戳因链式哈希导致整段失效，并给出修改布局的方案（2 分）
- 正确分析 LoRA、KV 压力、工具顺序三项的影响与对策（3 分）
- 给出逐 token 对比、分维度统计命中率等排查方法（2 分）
- 给出修复顺序与验证指标（1 分）

**讲解：**

**常见失分点**：把 LoRA 导致的不命中当成 bug；不知道前缀中任何一处变化都会让其后全部失效；只想到加显存，忽略路由与提示词布局；没有提出「逐 token 对比相邻两轮提示词」这一最直接的排查手段。

<sub>考点：前缀缓存、KV Cache原理</sub>

</details>

---

## 系统设计题

<a name="INF-KV-040"></a>

### INF-KV-040　挑战 · 考频 ★★

你要为一个 Agent 平台设计推理侧的 KV Cache 管理方案。平台特点：同时活跃的会话有上万个；每个会话几十轮，上下文从 1 万增长到 10 万 token；两次模型调用之间要等待工具返回（几秒到几分钟）；所有会话共享约 8K token 的系统提示词与工具定义；模型为 70B 级的 GQA 模型，部署在多台 8×H100 机器上，共有数十个推理实例。请给出设计：缓存分层与容量估算、缓存键与一致性、放置与路由、淘汰与预取、与调度的配合、监控指标与风险。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 目标**：最大化前缀命中（降低 TTFT 与 Prefill 算力），同时让活跃请求有足够的显存，并保证正确性与租户隔离。

**2. 容量估算**（以 80 层、8 个 KV 头、头维度 128 为例）：每 token 的 KV 为 $2\times80\times8\times128\times2$ 字节 = 320 KiB（FP8 为 160 KiB）。一个 5 万 token 的会话约 15.6 GiB（FP8 约 7.8 GiB），上万个会话需要上百 TB，单机 8 卡的显存只有 640 GB，必须分层，并接受冷会话的部分重算。

**3. 分层**：
- GPU 显存：活跃请求的 KV + 热门前缀（共享的系统提示词常驻）；
- CPU 内存（每机 1～2 TB）：最近结束、正在等工具返回的会话；
- 本地 NVMe 与分布式 KV 池（如 Mooncake、LMCache 的思路）：长尾会话、跨实例共享。
- 采用 FP8 KV，容量与传输量都减半。

**4. 缓存键与一致性**：链式块哈希，额外键包含模型与权重版本、LoRA 编号、租户盐、多模态输入哈希、KV 的数据类型与量化配置、对话模板版本；模型升级即整体失效；块写满后不可变，天然没有并发写冲突。

**5. 放置与路由**：网关按会话做亲和路由（带负载上限的一致性哈希），维护「前缀 → 所在实例 / 层级」的全局索引；目标实例过载时可路由到别处，再从分布式池拉取 KV。

**6. 淘汰与预取**：GPU 层按 LRU 且先淘汰链尾；淘汰时优先降级到下一层而不是直接丢弃；按工具的预期耗时设置保留时间；工具返回（或可预测即将返回）时提前把 KV 预取回 GPU；加载按层流水，与计算重叠。

**7. 与调度的配合**：准入时考虑缓存位置，KV 已在显存中的请求优先执行；限制「正在加载」的请求数，避免 PCIe 拥塞；若采用 PD 分离，Prefill 实例从 KV 池拉取已有前缀、只计算增量，再把 KV 传给 Decode 实例。

**8. 上下文侧配合**：要求上下文只追加不改写、稳定内容在前；超长时的压缩或摘要会改变前缀、使缓存失效，应在少数边界时刻集中进行。

**9. 监控**：各层命中率与命中 token 数、加载字节数与耗时、TTFT 拆分（加载 / 计算 / 排队）、各层使用率与淘汰速率、跨机传输带宽、SLO 达标率。

**10. 风险**：模型或模板更新时的一致性；多租户的时延侧信道（加盐）；热点会话导致实例过载；CPU 内存与网络带宽成为新瓶颈；任何一层失效都必须能回退到重算；需要做「加载结果与重算结果一致」的正确性校验。

**评分要点（共 10 分）：**

- 给出分层方案并用 KV 公式做容量估算（3 分）
- 缓存键覆盖模型版本、LoRA、租户等并说明一致性（2 分）
- 给出亲和路由与全局索引等放置策略（2 分）
- 给出淘汰、降级、预取与调度配合的策略（2 分）
- 给出监控指标与主要风险（1 分）

**讲解：**

**常见失分点**：不做容量估算，默认显存能放下所有会话；只有单层缓存，淘汰即丢弃；缓存键漏掉模型版本或 LoRA，导致错误复用；没有亲和路由，多实例下命中率随实例数下降；忽略加载带宽与重算回退。

<sub>考点：KV卸载、前缀缓存、长上下文KV优化</sub>

</details>

---
