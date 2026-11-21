# TRN-DIST · 分布式训练

> 所属大类：预训练与微调　｜　题量：49

数据、张量、流水线、序列与专家并行，以及通信与容错。

**考点覆盖**：数据并行（5） · 集合通信原语（6） · ZeRO（9） · FSDP（4） · 张量并行（9） · 流水线并行与气泡（9） · 序列与上下文并行（6） · 专家并行（4） · 3D并行（7） · 通信计算重叠（8） · 梯度检查点（3） · 大规模训练容错（4）

**题型**：[单选题（15）](#单选题) · [多选题（5）](#多选题) · [判断题（6）](#判断题) · [填空题（4）](#填空题) · [计算题（5）](#计算题) · [代码输出题（2）](#代码输出题) · [代码填空题（1）](#代码填空题) · [代码改错题（1）](#代码改错题) · [编程题（1）](#编程题) · [简答题（6）](#简答题) · [场景分析题（2）](#场景分析题) · [系统设计题（1）](#系统设计题)

---

## 单选题

<a name="TRN-DIST-001"></a>

### TRN-DIST-001　基础 · 考频 ★★★

PyTorch 的 `DistributedDataParallel`（DDP）通常比 `DataParallel`（DP）快得多，最主要的原因是：

- **A.** DDP 把参数切分到各卡，每张卡只存一部分参数，计算量和显存因此随卡数成比例下降
- **B.** DDP 用参数服务器把各卡梯度汇总到 0 号卡，更新后再广播新参数，通信路径更短、同步更简单
- **C.** DDP 每卡一个进程，没有 GIL 争用和每步复制模型的开销，分桶 all-reduce 还能与反向重叠
- **D.** DDP 每步只同步随机抽取的一部分梯度，其余在本地累积到下一步再发，通信量约为 DP 的一半

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：DDP 快在「多进程 + 去中心化的 all-reduce + 通信与反向重叠」。

`DataParallel` 是单进程多线程：每一步都要把模型从 0 号卡复制到各卡、把输入切开分发、再把各卡输出汇总回 0 号卡算 loss，梯度也汇总到 0 号卡。Python 的 GIL 和 0 号卡的显存、带宽都会成为瓶颈。DDP 每张卡一个进程，各自持有完整副本，只在构造时广播一次初始参数；反向时梯度按桶（默认约 25 MB）凑满一桶就立即发起 all-reduce，后面层的反向计算与前面桶的通信同时进行。

- A 错：切分参数是 ZeRO-3 / FSDP 的做法，DDP 每卡都有完整模型，单卡计算量也没有变小。
- B 错：这更接近 `DataParallel` 或参数服务器的模式；DDP 用 NCCL 的 ring / tree all-reduce，没有中心节点。
- D 错：DDP 每步都同步全部梯度（使用 `no_sync()` 做梯度累积时除外），不存在随机抽样同步。

<sub>考点：数据并行、通信计算重叠　｜　出处：PyTorch Distributed 论文（Li 等, 2020）</sub>

</details>

---

<a name="TRN-DIST-003"></a>

### TRN-DIST-003　进阶 · 考频 ★★

2 卡数据并行做 SFT（只对回答 token 计算 loss），DDP 会对两张卡的梯度取平均。某一步 rank 0 的 batch 共有 100 个有效 token、token 损失之和为 300；rank 1 共有 300 个有效 token、损失之和为 300。要让梯度与「把两卡数据放在一张卡上、按全部有效 token 取平均」完全等价，每张卡用于反向的 loss 应该怎样算？

- **A.** 各卡按本地有效 token 数取平均（rank 0 为 3.0，rank 1 为 1.0），DDP 平均后等效 loss 为 2.0
- **B.** 各卡直接用本地损失之和、不做归一化，DDP 平均后与全局平均只差一个常数倍，可由学习率吸收
- **C.** 各卡按本地样本数取平均：两卡样本数相同时每个样本的权重一致，与按 token 平均等价
- **D.** 先 all-reduce 求出全局有效 token 数 400，各卡用本地损失之和除以 400 再乘以卡数 2

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：目标是全局 token 平均 $(300+300)/(100+300)=1.5$。DDP 对梯度取平均，相当于对 $(L_0+L_1)/2$ 求导，所以每卡应取 $L_i=S_i\cdot N/T_{global}$，其中 $S_i$ 是本地损失之和，$T_{global}$ 要先用一次（很便宜的标量）all-reduce 求出。本题中两卡的 loss 都是 $300/400\times2=1.5$，DDP 平均后恰为 1.5。

- A 错：先按本地 token 平均再跨卡平均，得到 2.0。rank 0 的每个 token 权重是 rank 1 的 3 倍，与梯度累积中「每个 micro-batch 先各自平均」是同一类偏差。
- B 错：DDP 平均后是 $(S_0+S_1)/2=300$，与 1.5 相差 $T_{global}/N$ 倍，而 $T_{global}$ 每一步都在变，相当于学习率随 batch 的 token 数忽大忽小，梯度裁剪的阈值也随之失真，并不是一个固定常数。
- C 错：按样本平均是另一种加权方式（短回答的 token 权重更大），与按 token 平均本来就不同。

延伸：变长样本 + 数据并行 + 梯度累积三者叠加时，分母都应该是「整个优化步」的全局有效 token 数。

<sub>考点：数据并行</sub>

</details>

---

<a name="TRN-DIST-006"></a>

### TRN-DIST-006　进阶 · 考频 ★

环形 AllReduce 的耗时可以近似写成 $T\approx2(N-1)\alpha+\frac{2(N-1)}{N}\cdot\frac{S}{B}$，其中 $\alpha$ 为每一步的固定延迟、$S$ 为数据量、$B$ 为带宽。在数千张卡上同步较小的张量时，环形算法效率很低，最主要的原因是：

- **A.** 带宽项 $\frac{2(N-1)}{N}\cdot\frac{S}{B}$ 随卡数线性增长
- **B.** 算法有 $2(N-1)$ 个串行步骤，固定延迟随卡数线性累积，消息较小时成为主导
- **C.** 环形算法要先把所有数据汇总到一个根节点，根节点的带宽成为瓶颈
- **D.** 环形算法要求每张卡同时与其他所有卡通信，连接数随卡数平方增长

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：大规模、小消息时，环形算法输在「步数太多」。

带宽项的系数 $\frac{2(N-1)}{N}<2$，几乎不随 $N$ 变化；但延迟项 $2(N-1)\alpha$ 与 $N$ 成正比。设 $N=4096$、$\alpha=10\ \mu s$，延迟项约 $2\times4095\times10\ \mu s\approx82$ ms；而 1 MB 的消息在 50 GB/s 下的带宽项只有约 0.04 ms，耗时几乎全是延迟。因此 NCCL 在大规模时会改用树形算法（延迟随 $\log N$ 增长）或「机内 + 机间」的分层算法；DDP 把小梯度攒成桶再通信，也是为了摊薄每次通信的固定延迟。

- A 错：带宽项系数有上界 2，与卡数基本无关。
- C 错：这是 Reduce + Broadcast 或参数服务器的模式；环形算法没有根节点，每张卡的负载对称。
- D 错：环形算法中每张卡只与左右两个邻居通信。

<sub>考点：集合通信原语</sub>

</details>

---

<a name="TRN-DIST-008"></a>

### TRN-DIST-008　基础 · 考频 ★★★

混合精度 AdamW 训练中，ZeRO-2 相比 ZeRO-1 **额外**切分到各卡的是：

- **A.** BF16 梯度
- **B.** FP32 优化器状态（主权重、一阶矩、二阶矩）
- **C.** 前向产生的激活
- **D.** BF16 模型参数

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：ZeRO 三个阶段逐级累加：ZeRO-1 切优化器状态，ZeRO-2 再切梯度，ZeRO-3 再切参数。

记参数量为 $\Psi$、卡数为 $N$，每卡模型状态依次为 $4\Psi+12\Psi/N$、$2\Psi+14\Psi/N$、$16\Psi/N$。ZeRO-2 中每张卡只需要保留自己负责更新的那 $1/N$ 参数对应的梯度，其余梯度在 reduce-scatter 之后即可释放。

- B 错：优化器状态在 ZeRO-1 就已经切分。
- C 错：激活不属于模型状态，ZeRO-1/2/3 都不切激活；激活要靠张量 / 序列 / 上下文并行切分，或用重计算减少。
- D 错：切分参数是 ZeRO-3 才做的事。

<sub>考点：ZeRO</sub>

</details>

---

<a name="TRN-DIST-010"></a>

### TRN-DIST-010　进阶 · 考频 ★★

用 ZeRO-2 训练一个 30B 参数的模型（混合精度 AdamW，16 字节/参数）。不考虑激活和其他开销，无论增加多少张卡，每张卡的模型状态都不会低于约：

- **A.** 接近 0：卡数足够多时，所有状态都会被切得足够小
- **B.** 60 GB
- **C.** 120 GB
- **D.** 30 GB

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：ZeRO-2 的每卡模型状态为 $2\Psi+14\Psi/N$，$N\to\infty$ 时趋近 $2\Psi=60$ GB，即每张卡都保留的一份完整 BF16 参数。

这说明 ZeRO-1/2 有「显存地板」：参数本身不切。30B 模型在 80 GB 的卡上用 ZeRO-2，即使卡再多，每卡也只剩约 20 GB 给激活和缓冲，往往不够。此时要用 ZeRO-3 / FSDP 把参数也切开，或者用张量 / 流水线并行把参数分到多卡。

- A 错：只有 ZeRO-3（$16\Psi/N$）才会随卡数趋近 0。
- C 错：120 GB 是 $4\Psi$，是 ZeRO-1 的下限（参数和梯度都不切）。
- D 错：误按 1 字节/参数计算了参数。

<sub>考点：ZeRO</sub>

</details>

---

<a name="TRN-DIST-014"></a>

### TRN-DIST-014　进阶 · 考频 ★★

某同学用 PyTorch FSDP（`FULL_SHARD`）训练 13B 模型，只在最外层写了 `FSDP(model)`，没有设置 `auto_wrap_policy`。与「每个 Transformer 层作为一个 FSDP 单元」相比，最可能出现的问题是：

- **A.** 只有一个单元时 FSDP 退化为 DDP，优化器状态不再切分，每张卡都要存完整的 FP32 优化器状态
- **B.** 梯度不再 reduce-scatter，而是退化为 all-reduce，每卡保留完整梯度，通信量与梯度显存都翻倍
- **C.** 整个模型只有一个 FSDP 单元，全部参数一次 all-gather 后持续驻留，峰值显存接近不分片，通信也难与计算重叠
- **D.** 基本没有影响：FSDP 会沿模块树自动把每个子模块包成独立的单元，效果与按 Transformer 层包装相同

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：FSDP 的 all-gather 与释放都以「单元」为粒度，单元太大就失去了分片的意义。

FSDP 把每个单元内的参数展平成一个大张量后均匀分片。前向时，算到某个单元才 all-gather 它的参数，算完立即释放；反向同理。只包最外层时整个模型是一个单元：13B 的 BF16 参数（约 26 GB）一开始就全部拼出来并一直持有，反向时完整梯度也要先全部生成再 reduce-scatter，峰值显存接近不分片；而且只有一次大通信，无法用「算第 $i$ 层时预取第 $i+1$ 层」的方式重叠。正确做法是按 Transformer 层包装（如 `transformer_auto_wrap_policy`，或在 FSDP2 中对每个层调用 `fully_shard` 后再包根模块）。

- A 错：单元内的展平参数仍按卡数分片，优化器状态跟着分片走，依然只有 $1/N$。
- B 错：梯度仍是 reduce-scatter，只是粒度变成了整个模型。
- D 错：FSDP（FSDP1）不会自动拆分子模块，需要显式指定包装策略。

<sub>考点：FSDP</sub>

</details>

---

<a name="TRN-DIST-018"></a>

### TRN-DIST-018　进阶 · 考频 ★★★

Megatron-LM 对 MLP $Z=\mathrm{GeLU}(XA)B$ 做张量并行时，让 $A$ 按列切、$B$ 按行切，使前向只需在最后做一次 all-reduce。这样设计的关键原因是：

- **A.** 列切后各卡得到的是部分和，而 GeLU 满足 $f(a+b)=f(a)+f(b)$，所以可以先各自激活再求和
- **B.** 先按行切 $A$，每张卡只需要输入 $X$ 的一部分列，省掉了把 $X$ 复制到各卡的开销，整体只需一次 all-reduce
- **C.** $B$ 也按列切，各卡的输出列块直接拼接就是结果，拼接可以留到下一层输入时再做，不需要额外通信
- **D.** 列切 $A$ 后各卡持有 $XA_i$ 的完整列块，GeLU 逐元素作用无需通信；行切 $B$ 后各卡结果相加即可

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：「先列后行」让非线性落在不需要通信的位置。

$A=[A_1,A_2]$ 按列切，$XA=[XA_1,XA_2]$，每张卡拿到的是完整的一部分列，GeLU 逐元素作用，各卡互不依赖。$B$ 按行切成 $\begin{bmatrix}B_1\\B_2\end{bmatrix}$，$Z=\mathrm{GeLU}(XA_1)B_1+\mathrm{GeLU}(XA_2)B_2$，只需一次 all-reduce 求和。注意力同理：Q、K、V 按头列切，输出投影 $W^O$ 行切。

- A 错：列切得到的不是部分和；而且 GeLU 是非线性函数，$\mathrm{GeLU}(a+b)\neq\mathrm{GeLU}(a)+\mathrm{GeLU}(b)$。
- B 错：先按行切 $A$，每张卡得到的是 $XA$ 的部分和，必须先 all-reduce 求和才能过 GeLU，前向至少要两次通信。
- C 错：$B$ 按列切时，每张卡需要完整的 $\mathrm{GeLU}(XA)$ 作为输入，要先 all-gather；输出拼接给下一层同样需要通信。

<sub>考点：张量并行</sub>

</details>

---

<a name="TRN-DIST-021"></a>

### TRN-DIST-021　挑战 · 考频 ★★

Llama-3-70B 的注意力有 64 个 Query 头、8 个 KV 头（GQA）。从原理上看，如果坚持用 TP=16 对注意力按头切分，会出现什么情况？

- **A.** 每卡分到 4 个 Query 头，8 个 KV 头只能每个复制到两张卡上，K/V 投影参数与激活出现冗余
- **B.** 数学上无法实现：TP 度超过 KV 头数后，部分卡上的 Query 头找不到对应的 KV 头，注意力无法正确计算
- **C.** 把每个 KV 头沿头维度切成两半分给两张卡，每卡算一半维度的注意力，结果与不切分一致，也不增加通信
- **D.** 基本没有影响：GQA 会把 8 个 KV 头自动重组为 16 个更小的头，参数量与显存都保持不变

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：TP 度超过 KV 头数时只能复制 KV 头，造成冗余，所以 TP 度通常不超过 KV 头数。

按头切分时，每张卡需要完整地拥有它负责的 Query 头所对应的 KV 头。64 个 Query 头分到 16 张卡，每卡 4 个，它们同属一组，共用 1 个 KV 头；8 个 KV 头要服务 16 张卡，每个 KV 头必须在两张卡上各放一份，K、V 投影的权重、梯度和计算出的 K、V 激活都翻倍。工程上，有的框架会直接要求 KV 头数能被 TP 度整除，有的（如 vLLM 推理）会自动复制 KV 头。

- B 错：复制 KV 头就能正确计算，只是有冗余，并非数学上不可行。
- C 错：把一个头的维度切开后，$q\cdot k$ 在每张卡上只是部分和，softmax 之前必须先 all-reduce，增加了额外通信。
- D 错：KV 头数和头维度是模型结构的一部分，不会因为并行方式而重组；若要「扩展」到 16 个，本质上就是复制，显存会增加。

<sub>考点：张量并行</sub>

</details>

---

<a name="TRN-DIST-029"></a>

### TRN-DIST-029　进阶 · 考频 ★★

用 1F1B 调度、$p=8$ 段的流水线训练，$m$ 远大于 $p$，各段的 Transformer 层数相同，不做重计算。只考虑 Transformer 层的激活，哪一段的激活显存峰值最高？

- **A.** 最后一段：它最先开始反向，反向开始前要把流水线中各个 micro-batch 的激活都缓存下来
- **B.** 第一段：它最多同时缓存 8 个 micro-batch 的激活，最后一段只需 1 个
- **C.** 各段相同：1F1B 进入稳定期后每段都是一前一后交替执行，在途的 micro-batch 数都等于 p
- **D.** 中间段：它既要缓存前一段传来的激活，又要缓存后一段传回的梯度，两头的缓冲叠加最大

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：1F1B 下第 $i$ 段（从 0 计）在第一次反向之前要先做 $p-i$ 个前向，因此最多同时持有 $p-i$ 个 micro-batch 的激活：第一段 8 个，最后一段 1 个。

直观理解：第一个 micro-batch 的反向要等它走完全部 8 段再传回来，在此期间第一段一直在接收新的 micro-batch 做前向。

工程影响：第一段往往最先 OOM。常见做法是对前几段开启（选择性）重计算，或给第一段少分几层；同时第一段还放着 Embedding、最后一段放着输出层和 loss（大词表的 logits 也很占显存），切分时要综合考虑。Llama 3 405B 的训练就从第一段和最后一段各减少了一个 Transformer 层来平衡负载。

- A 错：最后一段每个 micro-batch 做完前向马上做反向，只需缓存 1 个。
- C 错：稳定期的交替不改变「在途 micro-batch 数」在各段之间的差异，第 $i$ 段是 $p-i$ 个，只有第一段达到 $p$。
- D 错：收发激活、梯度的缓冲很小，不决定激活峰值。

<sub>考点：流水线并行与气泡、梯度检查点</sub>

</details>

---

<a name="TRN-DIST-032"></a>

### TRN-DIST-032　挑战 · 考频 ★★

用 TP=8（不开序列并行）训练，并对每个 Transformer 层开启**全量**激活重计算（反向计算某层之前，先把该层的前向完整重算一遍）。与不重计算相比，每层每个 micro-batch 的张量并行 all-reduce 次数会怎样变化？

- **A.** 不变：重计算只是在本地重做矩阵乘和激活函数，所需输入都已在本卡，不涉及额外通信
- **B.** 减少为 2 次：重算时各卡已持有完整的层输入与激活，反向对输入梯度的 all-reduce 可以省掉
- **C.** 由 4 次变为 6 次：重算前向会把输出投影与 MLP 第二层后的 2 次 all-reduce 再做一遍
- **D.** 翻倍为 8 次：重计算要把前向与反向都重放一遍，两者各自的 2 次 all-reduce 都要重做

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：全量重计算重放的是「完整的前向」，其中也包括 TP 的前向通信，所以每层多出 2 次 all-reduce，TP 通信量增加约 50%。

不重计算时，每层前向在注意力输出投影（行切）和 MLP 第二层（行切）之后各有一次 all-reduce（Megatron 的 $g$ 算子），反向在两个列切层的输入梯度处各有一次（$f$ 算子），共 4 次。全量重计算在反向之前重跑一遍前向，前向的 2 次 all-reduce 随之再执行一遍；反向本身不变，合计 6 次。这些通信都处在关键路径上，很难被掩盖。

这也是 Megatron 偏好**选择性重计算**的原因之一：它只重算注意力核心（$QK^\top$、softmax、dropout、与 $V$ 相乘），这部分在每张卡上按头独立计算，不包含任何 TP 通信，既省激活又不增加通信。开启序列并行时同理，全量重计算会把前向的 all-gather / reduce-scatter 再做一遍。

- A 错：重算的前向与原前向完全相同，包含通信算子。
- B 错：反向对输入梯度的 all-reduce 依然需要，重计算不会消除它。
- D 错：重计算只重放前向，反向不会重做。

<sub>考点：梯度检查点、张量并行</sub>

</details>

---

<a name="TRN-DIST-037"></a>

### TRN-DIST-037　进阶 · 考频 ★★

一个 MoE 模型在 16 张卡上训练：共 64 个专家，专家并行度 EP=8（每张卡放 8 个专家，16 张卡构成 2 个 EP 组，每组放一整套专家）；注意力等非专家参数在 16 张卡上各有一份完整副本。两个 EP 组处理不同的数据。关于梯度同步，正确的是：

- **A.** 非专家参数在 16 卡间 all-reduce，每个专家只在持有它的 2 张卡间 all-reduce
- **B.** 所有参数都在 16 张卡之间 all-reduce，专家参数的同步方式与稠密模型的数据并行相同
- **C.** 专家参数不需要同步：每个专家只处理路由给它的 token，各副本学到的是不同的专门化能力
- **D.** 非专家参数只在同一个 EP 组的 8 张卡之间 all-reduce，专家参数则在 16 张卡之间同步

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：非专家参数的数据并行度是 16，专家参数的数据并行度是 $16/8=2$。

- 非专家参数（注意力、Norm、Embedding 等）在每张卡上都参与计算，16 张卡处理的都是不同的数据，梯度必须在 16 卡间平均。
- 每个专家在两个 EP 组里各有一份，分别处理各自组内路由过来的 token，梯度不同，需要在这 2 张卡之间 all-reduce（常称为「专家数据并行组」）。

- B 错：专家参数并不在 16 张卡上都有副本，无法也不需要在 16 卡间 all-reduce。
- C 错：同一个专家在两个 EP 组中各有一份副本，两份看到的数据不同，不同步就会分叉，变成两个不同的模型。
- D 错：两个 EP 组处理的数据不同，只在组内同步会让两组的非专家参数逐渐不一致；专家参数也只存在于 2 张卡上，谈不上在 16 卡间同步。

<sub>考点：专家并行</sub>

</details>

---

<a name="TRN-DIST-039"></a>

### TRN-DIST-039　基础 · 考频 ★★★

在「每台 8 卡、机内 NVLink、机间 InfiniBand」的集群上组合张量并行（TP）、流水线并行（PP）和数据并行（DP），通常的放置原则是：

- **A.** DP 放在机内，因为每步梯度 all-reduce 的数据量最大；TP 每次只传部分激活，可以跨机
- **B.** PP 放在机内、TP 跨机：PP 的点对点通信对延迟最敏感，而 TP 的 all-reduce 能与计算重叠
- **C.** 放置方式影响不大：NCCL 会根据拓扑自动选出最优的通信路径和算法，跨机通信也能被调度隐藏
- **D.** TP 放在机内（通常不超过 8），PP 跨机切层，剩余维度做 DP，常配合 ZeRO-1

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：通信越频繁、越处在关键路径上，就放在带宽越高的地方。

- TP 每层前向、反向各两次 all-reduce，数据是整个 $(b,s,h)$ 的激活，且下一步计算必须等它完成，只能放在 NVLink 上；
- PP 只在相邻段之间点对点传递边界激活，通信量小，适合跨机；
- DP 每步只同步一次梯度，而且能与反向计算重叠，放在最外层。

Megatron-LM 的 rank 编排把 TP 放在最内层（相邻的 rank 编号属于同一 TP 组）；Llama 3 405B 的并行维度顺序为 [TP, CP, PP, DP]，越靠内的维度对带宽和延迟要求越高。

- A 错：DP 的梯度虽然总量大，但每步只同步一次且可重叠；TP 跨机会让每层都卡在慢速网络上。
- B 错：恰好放反了。TP 的 all-reduce 处在关键路径上，下一步计算必须等它完成，很难与计算重叠。
- C 错：rank 到 GPU 的映射决定了每个通信组由哪些卡组成、通信是否要跨机，NCCL 只能在给定的组内选算法，无法替你改变组的划分。

<sub>考点：3D并行</sub>

</details>

---

<a name="TRN-DIST-041"></a>

### TRN-DIST-041　进阶 · 考频 ★★

DDP 把梯度按「桶」（默认约 25 MB）分组，一个桶内的梯度全部算完就发起 all-reduce。关于桶大小的影响，正确的是：

- **A.** 桶太大，通信要等很多层算完才开始，与反向的重叠变少；桶太小，固定延迟占比高、带宽利用率低
- **B.** 桶越大越好：整个模型只用一个桶时通信次数最少、单次带宽利用率最高，总耗时也最短
- **C.** 桶越小越好：每个参数单独一个桶，梯度一算出来就通信，与反向计算的重叠最充分，总耗时最短
- **D.** 桶大小只影响通信缓冲区的显存占用，all-reduce 的总数据量不变，因此通信耗时基本不受影响

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：桶大小是在「重叠程度」与「单次通信效率」之间折中。

反向传播从最后一层往前算，DDP 按参数的大致逆序分桶，后面层的梯度先凑满一桶就先发 all-reduce，同时前面层的反向继续计算。
- 桶太大：第一个桶要等很久才能发出，最后一个桶的通信几乎完全暴露在反向之后；极端情况下（一个桶）完全没有重叠。
- 桶太小：每次 all-reduce 都有固定的启动和延迟开销，小消息也跑不满带宽，大量小通信反而更慢。

- B 错：通信次数最少不等于总时间最短，因为失去了与计算的重叠。
- C 错：每参数一桶会产生成百上千次小通信，延迟开销占主导。
- D 错：总数据量虽然不变，但桶大小直接影响通信的开始时机和单次效率。实践中可以通过 `bucket_cap_mb` 调整，并结合 profile 观察暴露的通信时间。

<sub>考点：通信计算重叠</sub>

</details>

---

<a name="TRN-DIST-042"></a>

### TRN-DIST-042　基础 · 考频 ★★

用 DDP 做梯度累积（每次参数更新累积 8 个 micro-batch）时，常在前 7 个 micro-batch 的前向和反向外面包上 `with model.no_sync():`。这样做的作用是：

- **A.** 让各卡在前 7 个 micro-batch 中保留不同的梯度，起到类似正则化的效果，最终梯度与不用 no_sync 时不同
- **B.** no_sync 期间梯度不累积，最终只用第 8 个 micro-batch 的梯度更新，以节省显存
- **C.** 防止前 7 个 micro-batch 的梯度在 BF16 all-reduce 中反复求和而溢出，最后一次再统一以 FP32 同步
- **D.** 跳过前 7 次 all-reduce，梯度先在本地 .grad 中累加，第 8 次反向时统一同步，结果与每次都同步相同

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：`no_sync` 只是把通信推迟到最后一次反向，数学结果不变，通信量降为原来的 1/8。

不加 `no_sync` 时，DDP 在每个 micro-batch 的反向中都会 all-reduce 一次梯度，累积 8 次就通信 8 次。由于 $\frac{1}{N}\sum_r\sum_k g_{r,k}=\sum_k\frac{1}{N}\sum_r g_{r,k}$，先在本地累加再统一平均，与每次都平均后再累加完全等价。

- A 错：最终梯度完全相同，没有正则化效果。
- B 错：`no_sync` 期间梯度照常在 `.grad` 中累加，只是不通信。
- C 错：与数值精度无关，`no_sync` 不改变梯度通信的数据类型，只是推迟通信。

延伸：FSDP 也有 `no_sync()`，但它在累积期间要保留未分片的完整梯度，显存会明显增加，使用时要权衡。

<sub>考点：通信计算重叠、数据并行</sub>

</details>

---

<a name="TRN-DIST-049"></a>

### TRN-DIST-049　基础 · 考频 ★★

关于 DeepSpeed 与 Megatron-LM 这两个分布式训练框架的定位，下列说法最准确的是：

- **A.** DeepSpeed 只支持数据并行，不能做流水线并行；Megatron-LM 只支持张量并行，不能与数据并行组合，所以训练大模型时必须在两者之间二选一
- **B.** Megatron-LM 是 DeepSpeed 内部的一个子模块，二者本质上是同一套代码，只是面向的模型规模不同，配置文件与参数也完全通用
- **C.** DeepSpeed 以 ZeRO 和 offload 为核心、接入改动小；Megatron-LM 以多维模型并行和优化算子为核心，更适合超大规模预训练，二者可组合
- **D.** ZeRO-3 已经切分了全部参数，可以完全替代张量并行和流水线并行：无论模型多大、集群多大，用 ZeRO-3 都比张量并行加流水线并行的组合更快

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：两者的出发点不同：DeepSpeed 从「省显存、易接入」出发，Megatron-LM 从「把模型切开、追求极致吞吐」出发。

- C 对：DeepSpeed 的核心是 ZeRO-1/2/3 与 ZeRO-Offload / Infinity，可以通过配置文件接入 Hugging Face Trainer、Accelerate 等现有代码，微调和中等规模训练很常用；它也提供流水线并行和 DeepSpeed-Ulysses 序列并行。Megatron-LM（及其核心库 Megatron-Core）提供张量、流水线（含交错式 1F1B）、序列、上下文、专家并行，以及分布式优化器、融合算子、FP8 等，模型要按它的方式实现，适合千卡级预训练。两者可以组合：BLOOM-176B 就是用 Megatron-DeepSpeed 训练的。
- A 错：DeepSpeed 也支持流水线并行；Megatron-LM 的张量、流水线并行本来就与数据并行组合使用（3D 并行）。
- B 错：两者是不同团队维护的独立项目（DeepSpeed 来自微软，Megatron-LM 来自 NVIDIA）。
- D 错：ZeRO-3 每层都要 all-gather 完整参数，通信量约为数据并行的 1.5 倍，而且分布在所有卡之间，跨机时容易成为瓶颈；它也不切分激活。超大模型通常在机内用张量并行、跨机用流水线并行，再配合数据并行（常用 ZeRO-1）。

**选型思路**：中小规模、要快速接入现有代码，优先 DeepSpeed 或 PyTorch FSDP；数百卡以上的大模型预训练，优先 Megatron 系的多维并行。

<sub>考点：ZeRO、3D并行　｜　出处：DeepSpeed 官方文档；Megatron-LM GitHub 仓库（NVIDIA/Megatron-LM）；ZeRO 论文 arXiv:1910.02054；BLOOM 论文 arXiv:2211.05100</sub>

</details>

---

## 多选题

<a name="TRN-DIST-004"></a>

### TRN-DIST-004　基础 · 考频 ★★★

下列「训练场景—所用的主要通信操作」的对应关系中，**正确**的有：

- **A.** ZeRO-3 / FSDP 在反向中把各卡梯度求和，并切回各卡各自负责的分片—AllReduce
- **B.** DDP 在反向传播中同步各卡梯度—AllReduce
- **C.** 流水线并行中相邻两段之间传递激活—AllReduce
- **D.** DeepSpeed-Ulysses 在「按序列切分」与「按注意力头切分」之间转换—Broadcast
- **E.** MoE 专家并行中把 token 发往其路由到的专家所在的卡—All-to-All

<details>
<summary>答案与解析</summary>

**答案：BE**

**解析：**

**结论**：B、E 正确。

常用原语：Broadcast（一发全）、Reduce（全归一）、AllReduce（全员得到归约结果）、ReduceScatter（归约后每人拿 1/N）、AllGather（每人拿到所有人的分片拼接）、All-to-All（每人给每人发不同的数据）、Send/Recv（点对点）。其中 AllReduce = ReduceScatter + AllGather。

- A 错：「求和后每卡只拿自己负责的分片」正是 ReduceScatter 的定义。ZeRO-2/3 与 FSDP 都用 ReduceScatter 同步梯度，通信量只有 AllReduce 的一半，也不必让每张卡都持有完整梯度；AllGather 则用在用到某一层之前取回该层的完整参数，用完即释放。
- B 对：DDP 用 AllReduce 求梯度平均，按桶在反向过程中发起。
- C 错：流水线相邻段之间是点对点的 Send/Recv，只有相邻两张卡参与，这也是 PP 通信量小、适合跨机的原因。
- D 错：Ulysses 在注意力前后各做一次 All-to-All，把 Q/K/V 从「每卡一段序列、全部头」换成「每卡完整序列、部分头」，算完再换回来。
- E 对：路由后每张卡要把不同的 token 发给不同的卡（dispatch），专家算完再发回（combine），两次都是 All-to-All。

<sub>考点：集合通信原语、专家并行、序列与上下文并行、流水线并行与气泡　｜　出处：PyTorch FSDP（Zhao 等, 2023）arXiv:2304.11277；ZeRO arXiv:1910.02054；DeepSpeed Ulysses arXiv:2309.14509</sub>

</details>

---

<a name="TRN-DIST-015"></a>

### TRN-DIST-015　进阶 · 考频 ★★

关于 PyTorch FSDP 的工作机制，下列说法**正确**的有：

- **A.** 反向得到的梯度通过 reduce-scatter 回到各卡，每张卡只保留自己分片对应的梯度
- **B.** `HYBRID_SHARD` 在机间分片、机内复制，以减少机内 NVLink 上的参数通信量
- **C.** `FULL_SHARD` 下每个单元在前向前 all-gather 参数、算完即释放，反向时再 all-gather 一次
- **D.** FSDP 把每个参数张量按第 0 维独立切分，与模块结构无关，因此不需要指定包装策略或单元划分
- **E.** 反向预取可以让下一个单元的 all-gather 与当前单元的反向计算重叠

<details>
<summary>答案与解析</summary>

**答案：ACE**

**解析：**

**结论**：A、C、E 正确。

- A 对：reduce-scatter 一步完成「跨卡求和 + 按分片切开」，之后每张卡只更新自己那份参数和优化器状态。
- B 错：方向反了。`HYBRID_SHARD` 是**机内分片、机间复制**：频繁的参数 all-gather 走机内高带宽的 NVLink，机间只需对分片后的梯度做 all-reduce，适合跨机带宽紧张的集群；代价是模型状态只在一台机器的几张卡之间分摊（每台机器各存一整份），每卡显存比全局分片多。
- C 对：这就是 ZeRO-3 的执行方式，所以前向、反向各有一次 all-gather。
- D 错：FSDP1 以「单元」为粒度，把单元内参数展平后均匀切分；包装策略决定单元的划分，直接影响峰值显存和重叠效果。FSDP2 改为对每个参数按第 0 维切分（DTensor），但仍需要按层调用 `fully_shard` 划分通信单元。
- E 对：反向预取（backward prefetch）默认的 `BACKWARD_PRE` 会在当前单元算梯度之前就发起下一个单元参数的 all-gather；前向也有可选的 forward prefetch。代价是同时驻留两个单元的完整参数，显存略增。

<sub>考点：FSDP、通信计算重叠</sub>

</details>

---

<a name="TRN-DIST-027"></a>

### TRN-DIST-027　进阶 · 考频 ★★★

关于流水线并行的调度，下列说法**正确**的有：

- **A.** 1F1B 的气泡比例与 GPipe 相同，但在途 micro-batch 不超过段数 p，激活显存显著降低
- **B.** Zero Bubble 类方法把反向拆成对输入求梯度和对权重求梯度两步，用可推迟的后者填补气泡
- **C.** 流水线相邻段之间要对边界激活做 all-reduce，通信量与张量并行相当，因此 PP 也应放在机内
- **D.** 不做重计算时，GPipe 要保存全部 m 个 micro-batch 的激活，直到它们的反向开始
- **E.** 1F1B 让前向与反向交替执行、互相填补空隙，把气泡比例降到 GPipe 的一半左右

<details>
<summary>答案与解析</summary>

**答案：ABD**

**解析：**

**结论**：A、B、D 正确。

- A 对：1F1B（PipeDream-Flush）进入稳定期后每做一个前向就做一个反向，及时释放激活。它改变的是显存，不是气泡。
- B 对：对输入的梯度（论文记为 $B$）要尽快传给前一段，对权重的梯度（记为 $W$）只在优化器更新前需要，可以挪到原本空闲的时隙里执行。
- C 错：相邻段之间是点对点 Send/Recv，只传一个 micro-batch 的边界激活（反向时传梯度），通信量远小于 TP 每层的 all-reduce，所以 PP 适合跨机。
- D 对：GPipe 先把 m 个 micro-batch 的前向全部做完再做反向，激活要一直存着；GPipe 论文用重计算（只存段边界的激活）来缓解。
- E 错：非交错的 1F1B 气泡比例仍是 $(p-1)/(m+p-1)$；真正缩小气泡的是交错式 1F1B（约缩小到 $1/v$）、Zero Bubble、DualPipe 等。

<sub>考点：流水线并行与气泡</sub>

</details>

---

<a name="TRN-DIST-033"></a>

### TRN-DIST-033　进阶 · 考频 ★★

关于序列并行（SP）与上下文并行（CP），下列说法**正确**的有：

- **A.** Ring Attention 中每张卡持有一段 Q，K、V 分块沿环传递，计算可以与传递重叠
- **B.** 上下文并行中 MLP、LayerNorm 等逐 token 计算只处理本地序列，只有注意力需要跨卡的 K、V
- **C.** Megatron 序列并行在 TP 组内把 LayerNorm、Dropout 等沿序列维切开，通信量与原 TP 相同
- **D.** 因果掩码下把序列按顺序等分给各卡即可：各卡 token 数相同，注意力的计算量与显存也就天然均衡
- **E.** DeepSpeed-Ulysses 用 All-to-All 把按序列切换成按头切，并行度受注意力头数限制

<details>
<summary>答案与解析</summary>

**答案：ABCE**

**解析：**

**结论**：A、B、C、E 正确，只有 D 错。

- A 对：每一步用本地 Q 与刚收到的 K/V 块计算部分注意力（用 online softmax 合并），同时把 K/V 块传给下一张卡，块够大时通信能被计算掩盖。
- B 对：上下文并行切分的是整个模型的序列维，而不只是注意力层。MLP、LayerNorm 都是逐 token 计算的，每张卡只处理自己那段 token，前向、反向中都无需交换激活；只有注意力需要跨段的 K/V，这正是 CP 的通信所在。各 CP rank 持有相同的权重，权重梯度仍要在它们之间归约，这一点与数据并行类似。
- C 对：Megatron-SP 是 TP 的补充，把 TP 中被每张卡重复计算的 LayerNorm、Dropout、残差等沿序列维切开，all-reduce 拆成 reduce-scatter + all-gather，通信量不变，激活显存进一步下降。
- D 错：因果掩码下越靠后的 token 要看的 key 越多，顺序切分时最后一张卡的计算量远大于第一张，要用「切成 2×CP 块、首尾配对」等负载均衡切法。
- E 对：Ulysses 在注意力前把 Q、K、V 从「每卡一段序列、全部头」换成「每卡完整序列、部分头」，并行度不能超过头数（GQA 下还受 KV 头数约束，或需要复制 KV 头）。

<sub>考点：序列与上下文并行　｜　出处：Korthikanti 等 arXiv:2205.05198；Ring Attention arXiv:2310.01889；DeepSpeed Ulysses arXiv:2309.14509；The Llama 3 Herd of Models arXiv:2407.21783</sub>

</details>

---

<a name="TRN-DIST-044"></a>

### TRN-DIST-044　基础 · 考频 ★★

在上万张 GPU 上做同步预训练时，硬件和网络故障几乎每天都会发生。下列做法中，能够**直接减少**故障造成的有效训练时间损失的有：

- **A.** 把 NCCL 超时设为无限长，避免偶发的网络抖动让任务退出，省去重启和回滚检查点的时间
- **B.** 把检查点间隔拉长到一天一次，减少写盘造成的训练阻塞，从而提高有效训练时间占比
- **C.** 任务启动前和重启后对节点做自检（GPU 压测、NCCL 带宽测试等），剔除有问题的机器
- **D.** 异步检查点：先把训练状态快速拷到主机内存，训练随即继续，再在后台写入持久化存储
- **E.** 自动故障检测与定位（心跳、日志、NCCL 超时监控），配合热备节点快速替换坏机器

<details>
<summary>答案与解析</summary>

**答案：CDE**

**解析：**

**结论**：C、D、E 正确。故障损失 ≈ 写检查点的阻塞时间 + 故障发生时丢失的进度 + 发现与恢复的时间，三者都要压缩。

- A 错：真故障时任务会无限期卡住而无法触发自动重启；应设置合理的超时并配合 watchdog。
- B 错：写盘阻塞是省下了，但每次故障平均要丢半个间隔的进度，间隔拉长到一天意味着每次故障平均重算半天，得不偿失。
- C 对：避免坏机器反复导致故障。MegaScale 的自检包括网卡回环测试、机内 All-to-All、与相邻机器的 All-Reduce 等。
- D 对：阻塞时间从「写到远端存储」缩短为「拷到主机内存」，可以更频繁地保存，每次故障丢的进度也更少。
- E 对：缩短从故障发生到定位、替换、重启的时间。字节的 MegaScale（12288 卡训练 175B，MFU 55.2%）用大量篇幅介绍自动检测、诊断和快速恢复。

数字感：Llama 3 405B 的 54 天预训练中有 466 次作业中断，其中 419 次是意外中断，约 78% 与已确认或疑似的硬件问题有关；靠高度自动化的恢复，有效训练时间仍超过 90%。

<sub>考点：大规模训练容错</sub>

</details>

---

## 判断题

<a name="TRN-DIST-002"></a>

### TRN-DIST-002　基础 · 考频 ★★

DDP 训练中，为了保证各卡的模型参数一致，每一步优化器更新之后都要把 0 号卡的参数广播给其他卡。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。DDP 只在构造时把 0 号卡的参数（和 buffer）广播一次，保证初始参数相同。此后每一步，各卡通过 all-reduce 拿到**完全相同的平均梯度**，再执行相同的优化器更新，参数自然保持一致，不需要每步广播参数。

这也解释了几个工程现象：
- 如果某张卡的梯度没有参与同步（例如手动绕过了 DDP 的 hook），各卡参数会悄悄分叉，loss 看起来正常但模型已不一致；
- DDP 默认 `broadcast_buffers=True`，每次前向会广播 buffer（如 BatchNorm 的统计量），但广播的是 buffer，不是参数；大模型里基本没有需要同步的 buffer。

<sub>考点：数据并行　｜　出处：PyTorch DDP 文档</sub>

</details>

---

<a name="TRN-DIST-013"></a>

### TRN-DIST-013　基础 · 考频 ★★★

ZeRO 把模型状态切分到 N 张卡上来降低显存，同时也把每张卡的计算量降为原来的 1/N。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。ZeRO 只切「存储」，不切「计算」：每张卡仍要对自己那份数据做完整的前向和反向，用到某层时把参数临时拼完整（ZeRO-3）或者本来就有完整参数（ZeRO-1/2）。与相同 micro-batch 的 DDP 相比，每卡的前向、反向计算量完全一样。唯一被切分的计算是优化器更新（每卡只更新自己那 $1/N$ 参数），这在总计算中占比很小。

ZeRO 的代价是通信：ZeRO-1/2 与 DDP 持平，ZeRO-3 约为 1.5 倍。真正把计算分摊到多卡的是数据切分（数据并行）、层内矩阵切分（张量并行）和按层切分（流水线并行）。

<sub>考点：ZeRO</sub>

</details>

---

<a name="TRN-DIST-016"></a>

### TRN-DIST-016　进阶 · 考频 ★★

FSDP 的 `SHARD_GRAD_OP` 策略近似 ZeRO-2：前向结束后不释放已经 all-gather 的完整参数，反向时就不必再 all-gather 一次；代价是从前向到反向这段时间，每张卡都要持有完整参数。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。三种常用策略的对比：
- `FULL_SHARD`（≈ ZeRO-3）：前向后立即释放参数，反向再 all-gather 一次，通信约 $3\Psi$，显存最省；
- `SHARD_GRAD_OP`（≈ ZeRO-2）：前向 all-gather 后一直保留到反向结束，通信约 $2\Psi$（一次 all-gather + 一次梯度 reduce-scatter），与 DDP 持平；梯度和优化器状态仍然分片；
- `NO_SHARD`（≈ DDP）：不分片，梯度 all-reduce。

FSDP2 中对应的开关是 `fully_shard(..., reshard_after_forward=False)`。显存够用、但通信成为瓶颈时（例如跨机带宽较低），从 `FULL_SHARD` 切到 `SHARD_GRAD_OP` 是常见的调优手段。

<sub>考点：FSDP</sub>

</details>

---

<a name="TRN-DIST-023"></a>

### TRN-DIST-023　进阶 · 考频 ★★

只用张量并行（不开序列并行）时，每张卡上的激活显存会随 TP 度 $t$ 等比例下降为原来的 $1/t$。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。张量并行只切分了注意力和 MLP **内部**的激活（Q、K、V、注意力打分、MLP 中间层等），而 LayerNorm 的输入输出、残差流、Dropout 掩码等在 TP 组的每张卡上都是完整复制的。按 Korthikanti 等（2022）的估算，每层激活约为
$$sbh\left(10+\frac{24}{t}+\frac{5as}{ht}\right)$$
其中 $10sbh$ 这部分不随 $t$ 下降。

Megatron 的**序列并行**把这些在 TP 中被重复计算的部分沿序列维切开，把 all-reduce 拆成 reduce-scatter + all-gather，通信量不变，激活变为 $\frac{sbh}{t}\left(34+\frac{5as}{h}\right)$，才真正做到整体按 $1/t$ 下降。

<sub>考点：张量并行、序列与上下文并行</sub>

</details>

---

<a name="TRN-DIST-028"></a>

### TRN-DIST-028　进阶 · 考频 ★★

交错式 1F1B（interleaved 1F1B，每张卡负责 $v$ 个不相邻的模型块）能把流水线气泡缩小为原来的约 $1/v$，代价是流水线点对点通信的次数约增加为 $v$ 倍。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。普通 1F1B 中每张卡负责一段连续的层；交错式调度把每张卡的层拆成 $v$ 个不相邻的小块（例如 4 卡、16 层、$v=2$ 时，卡 0 负责第 0～1 层和第 8～9 层）。每个小块的计算时间只有原来的 $1/v$，填充和排空流水线的时间也随之缩短，气泡时间约为原来的 $1/v$（Megatron-LM 的口径：$\frac{p-1}{m}\to\frac{p-1}{vm}$）。

代价：一个 micro-batch 要在卡间来回传递 $v$ 倍的次数，点对点通信量相应增加；Megatron 的实现还要求 micro-batch 数是段数的整数倍，激活显存也会略有增加。通信带宽充足时，这是缩小气泡的常用手段。

<sub>考点：流水线并行与气泡</sub>

</details>

---

<a name="TRN-DIST-046"></a>

### TRN-DIST-046　基础 · 考频 ★★

在各节点故障相互独立、单节点故障率不变的前提下，同步训练任务的平均无故障时间（MTBF）与参与的节点数近似成反比；因此集群从 1000 卡扩到 16000 卡时，检查点间隔通常也要相应缩短。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。同步训练中任意一个节点出故障都会中断整个任务，任务的故障率等于各节点故障率之和：$\lambda_{job}=n\lambda_{node}$，所以 $\mathrm{MTBF}_{job}=\mathrm{MTBF}_{node}/n$。卡数扩大 16 倍，任务 MTBF 约降为 1/16。

按 Young 公式，最优检查点间隔 $\tau^*=\sqrt{2CM}$ 与 $\sqrt{M}$ 成正比，MTBF 降为 1/16 时间隔约缩短为 1/4（检查点耗时不变的前提下）。这也是万卡训练必须依赖自动故障检测、快速检查点和自动重启的原因：Llama 3 405B 在 1.6 万张 GPU 上平均约 3 小时就有一次意外中断。

<sub>考点：大规模训练容错</sub>

</details>

---

## 填空题

<a name="TRN-DIST-009"></a>

### TRN-DIST-009　进阶 · 考频 ★★★

一个 13B 参数的模型用混合精度 AdamW 训练（BF16 权重 2 + BF16 梯度 2 + FP32 优化器状态 12，共 16 字节/参数），16 张卡做数据并行。只算模型状态，1 GB 按 $10^9$ 字节计，每张卡的模型状态：ZeRO-1 为 ____ GB，ZeRO-2 为 ____ GB，ZeRO-3 为 ____ GB。

<details>
<summary>答案与解析</summary>

**答案：** (1) 61.75 / 61.8；(2) 37.375 / 37.38 / 37.4；(3) 13 / 13.0

**解析：**

记 $\Psi=13\times10^9$、$N=16$：
- 不切分（DDP）：$16\Psi=208$ GB；
- ZeRO-1（切优化器状态）：$4\Psi+12\Psi/N=52+9.75=$ **61.75 GB**；
- ZeRO-2（再切梯度）：$2\Psi+14\Psi/N=26+11.375=$ **37.375 GB**；
- ZeRO-3（再切参数）：$16\Psi/N=$ **13 GB**。

解读：ZeRO-1 不增加通信就把 208 GB 降到 61.75 GB，性价比最高；但 ZeRO-1/2 中每张卡仍要存完整的 BF16 参数（26 GB），这部分不随卡数下降。还要另外留出激活、通信缓冲和碎片的空间，80 GB 的卡上用 ZeRO-2 训练 13B 已经比较紧，ZeRO-3 才有充足余量。

<sub>考点：ZeRO</sub>

</details>

---

<a name="TRN-DIST-025"></a>

### TRN-DIST-025　基础 · 考频 ★★★

流水线并行切成 $p=8$ 段，一个 batch 拆成 $m=32$ 个 micro-batch，按 GPipe 或 1F1B 调度（各段耗时相同）。气泡（空闲时间）占总时间的比例约为 ____%（保留一位小数）；若要让气泡比例不超过 5%，$m$ 至少为 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 17.9 / 17.9% / 7/39；(2) 133

**解析：**

气泡比例 $=\frac{p-1}{m+p-1}$：每段在一个 batch 的开头要等前面的段把第一个 micro-batch 传过来，结尾要等后面的段把最后一个 micro-batch 的反向传回来，这 $p-1$ 个时隙都是空等。

- $p=8,m=32$：$\frac{7}{39}\approx17.9\%$；
- 要 $\frac{7}{m+7}\le0.05$，即 $m+7\ge140$，$m\ge133$。

结论：micro-batch 数要远大于段数（GPipe 论文的经验是 $m\ge4p$ 时气泡已不显著）。但在全局 batch 固定时，增大 $m$ 意味着更小的 micro-batch 或更少的数据并行路数，这正是流水线调度要权衡的地方。注意 Megatron 论文用「气泡时间 / 理想计算时间」$=\frac{p-1}{m}$ 来定义气泡比例，两种口径要分清。

<sub>考点：流水线并行与气泡</sub>

</details>

---

<a name="TRN-DIST-031"></a>

### TRN-DIST-031　进阶 · 考频 ★★

某次 70B 模型训练开启了全量激活重计算（反向时把每层的前向重算一次）。按 GPU 实际执行的浮点运算统计，硬件 FLOPs 利用率（HFU）为 52%。若 MFU 只计模型本身需要的运算量（约 $6N$ FLOPs/token，忽略注意力的二次项），则 MFU 约为 ____%。

<details>
<summary>答案与解析</summary>

**答案：** (1) 39 / 39%

**解析：**

每个 token 的计算量：前向 $2N$、反向 $4N$，模型本身需要 $6N$；全量重计算再多一次前向 $2N$，GPU 实际执行 $8N$。

$\mathrm{MFU}=\mathrm{HFU}\times\frac{6N}{8N}=52\%\times0.75=$ **39%**。

为什么要区分：重计算多做的运算对「训练进度」没有贡献，用 HFU 比较不同系统会让开了重计算的系统显得更好。MFU 只计模型理论上必须的运算，是跨系统比较的公平口径（PaLM 论文提出这对指标：540B 训练的 MFU 为 46.2%、HFU 为 57.8%）。选择性重计算只重算开销很小的部分，能把两者的差距缩到很小。

<sub>考点：梯度检查点</sub>

</details>

---

<a name="TRN-DIST-036"></a>

### TRN-DIST-036　基础 · 考频 ★★

某 MoE 层采用专家并行。每张卡上有 4096 个 token，隐藏维度 $h=4096$，每个 token 选 top-2 个专家，激活为 BF16。假设被选中的专家都在其他卡上，一层 MoE 的前向中，每张卡在 dispatch 和 combine 两次 All-to-All 里共发送 ____ MiB；算上反向（梯度沿相反方向再各传一次），每层共发送 ____ MiB。

<details>
<summary>答案与解析</summary>

**答案：** (1) 128；(2) 256

**解析：**

- dispatch：每个 token 要发给 2 个专家，发送 $4096\times2\times4096\times2$ 字节 $=64$ MiB；
- combine：专家输出按原路发回，同样 64 MiB；前向合计 **128 MiB**；
- 反向：combine 的反向把梯度发往专家所在卡，dispatch 的反向再把梯度发回，又是两次同样大小的 All-to-All，每层合计 **256 MiB**。

实际中有约 $1/EP$ 的 token 会留在本卡，通信量略小；但细粒度 MoE 的 top-k 更大（如 8），隐藏维度也更大，通信量会成倍增加，且通常要跨机。这就是 DeepSeek-V3 限制每个 token 最多发往 4 个节点、用 FP8 做 dispatch，并把 All-to-All 与计算重叠的原因。

<sub>考点：专家并行、集合通信原语</sub>

</details>

---

## 计算题

<a name="TRN-DIST-005"></a>

### TRN-DIST-005　进阶 · 考频 ★★★

用环形（Ring）AllReduce 同步一个 7B 模型的 BF16 梯度（共 $7\times10^9$ 个元素）。假设每张卡的发送带宽为 50 GB/s（1 GB = $10^9$ 字节），忽略每一步的启动延迟，且通信不与计算重叠。分别计算 8 卡和 64 卡数据并行时，每张卡需要发送的数据量与通信时间，并说明结论。

<details>
<summary>答案与解析</summary>

**答案：8 卡：每卡发送 24.5 GB，约 0.49 s；64 卡：每卡约 27.6 GB，约 0.55 s。通信时间几乎与卡数无关**

**解析：**

**公式**：环形 AllReduce = ReduceScatter + AllGather。数据切成 $N$ 块，每个阶段 $N-1$ 步，每步每张卡发送 $S/N$，所以每张卡共发送
$$2(N-1)\cdot\frac{S}{N}=\frac{2(N-1)}{N}S$$

**代入**：梯度大小 $S=7\times10^9\times2$ 字节 $=14$ GB。
- 8 卡：$\frac{2\times7}{8}\times14=24.5$ GB，耗时 $24.5/50=0.49$ s；
- 64 卡：$\frac{2\times63}{64}\times14\approx27.56$ GB，耗时约 $0.55$ s。

**结论**：每卡通信量的上限是 $2S$，与卡数基本无关，这正是数据并行能扩展到大量卡的原因。实际系统还要考虑：每一步的固定延迟 $\alpha$ 会累积 $2(N-1)$ 次（卡数很多时对小消息不利）；跨机带宽远低于机内 NVLink；所以 DDP 要分桶并与反向重叠，NCCL 在大规模时会使用树形或分层算法。

<sub>考点：集合通信原语、数据并行</sub>

</details>

---

<a name="TRN-DIST-020"></a>

### TRN-DIST-020　进阶 · 考频 ★★

用 TP=8 训练 Llama-2-70B（80 层，隐藏维度 $h=8192$），micro-batch $b=1$，序列长 $s=4096$，激活为 BF16，不开序列并行。每层前向 2 次、反向 2 次 all-reduce，每次的张量形状为 $(b,s,h)$，用环形算法。
1. 每个 micro-batch，每张卡在 TP 通信上要发送多少数据？
2. 若 TP 组在机内（按每卡 200 GB/s 算）或跨机（按每卡 50 GB/s 算），通信各需多少时间？（1 GB = $10^9$ 字节）
3. 每卡每个 micro-batch 的计算量约为 $6Nbs/8$ FLOPs（$N=70\times10^9$），按每卡有效算力 400 TFLOPS 估算计算时间，并说明 TP 为什么通常只放在机内。

<details>
<summary>答案与解析</summary>

**答案：(1) 约 35 GiB（≈37.6 GB）；(2) 机内约 0.19 s，跨机约 0.75 s；(3) 计算约 0.54 s，跨机时 TP 通信超过计算时间**

**解析：**

**(1) 通信量**
- 每次 all-reduce 的张量：$b\cdot s\cdot h\times2=1\times4096\times8192\times2$ 字节 $=64$ MiB；
- 环形 all-reduce 每卡发送 $\frac{2(t-1)}{t}\times64=\frac{2\times7}{8}\times64=112$ MiB；
- 每层 4 次：448 MiB；80 层：$448\times80=35840$ MiB $=35$ GiB $\approx37.6$ GB。

**(2) 时间**：机内 $37.6/200\approx0.19$ s；跨机 $37.6/50\approx0.75$ s。

**(3) 计算**：$6\times70\times10^9\times4096/8\approx2.15\times10^{14}$ FLOPs，$\div400\times10^{12}\approx0.54$ s。

**结论**：TP 的 all-reduce 每层都有、且处在关键路径上（下一步计算必须等它完成），很难与计算重叠。机内时通信约占计算的三分之一，尚可接受；跨机时通信比计算还长，效率会腰斩。所以 TP 通常限制在一台机器内（≤ 8），跨机的扩展交给通信量小的流水线并行和数据并行。开启序列并行时，all-reduce 被拆成 reduce-scatter + all-gather，通信量不变，但能进一步切分激活显存。

<sub>考点：张量并行、3D并行</sub>

</details>

---

<a name="TRN-DIST-026"></a>

### TRN-DIST-026　进阶 · 考频 ★★

某模型用 TP=8、PP=8 训练，全局 batch 固定为 1024 条序列，micro-batch 为 1 条序列，各段耗时相同、不考虑通信。
1. 用 512 张卡时，数据并行度 DP、每条流水线的 micro-batch 数 $m$ 与气泡比例各是多少？
2. 只增加数据并行扩到 2048 张卡后呢？
3. 2048 卡相对 512 卡，每步的加速比约为多少？为什么不是 4 倍？

<details>
<summary>答案与解析</summary>

**答案：(1) DP=8，m=128，气泡约 5.2%；(2) DP=32，m=32，气泡约 17.9%；(3) 约 3.46 倍，因为 m 变小使气泡变大**

**解析：**

**(1)** $DP=\frac{512}{8\times8}=8$；每条流水线分到 $\frac{1024}{8}=128$ 条序列，$m=128$；气泡 $=\frac{7}{128+7}=\frac{7}{135}\approx5.2\%$。

**(2)** $DP=\frac{2048}{64}=32$，$m=\frac{1024}{32}=32$，气泡 $=\frac{7}{39}\approx17.9\%$。

**(3)** 一步的时间正比于 $m+p-1$ 个时隙：512 卡为 135，2048 卡为 39，加速比 $=135/39\approx3.46$（也可以算成 $4\times\frac{1-0.179}{1-0.052}\approx3.46$），扩展效率约 87%。

**原因与对策**：全局 batch 固定时，数据并行路数越多，每条流水线分到的 micro-batch 越少，气泡占比越高。可选的对策：在收敛允许的前提下增大全局 batch；减少 PP 段数（用 ZeRO、重计算腾出显存）；使用交错式 1F1B 等缩小气泡的调度。这也是 3D 并行配置时要把 $m\gg p$ 作为约束的原因。

<sub>考点：流水线并行与气泡、3D并行</sub>

</details>

---

<a name="TRN-DIST-040"></a>

### TRN-DIST-040　进阶 · 考频 ★★

用 1024 张卡训练一个 175B 模型：TP=8、PP=8、DP=16，混合精度 AdamW（BF16 权重 2 + BF16 梯度 2 + FP32 优化器状态 12 字节/参数）。忽略 Embedding 与输出层造成的各段不均衡，1 GB = $10^9$ 字节。求：
1. 每张卡负责的参数量；
2. 不用 ZeRO 时每张卡的模型状态；
3. 在 DP 维度上使用 ZeRO-1 时每张卡的模型状态。

<details>
<summary>答案与解析</summary>

**答案：(1) 约 2.73B；(2) 约 43.75 GB；(3) 约 13.0 GB**

**解析：**

**(1)** TP 和 PP 都切分参数，DP 是副本：$\frac{175\times10^9}{8\times8}\approx2.734\times10^9$。

**(2)** $16\times2.734\times10^9\approx43.75$ GB。

**(3)** ZeRO-1 只在 DP 维度上切分优化器状态：
- 权重 + 梯度：$4\times2.734\times10^9\approx10.94$ GB；
- 优化器状态：$12\times2.734\times10^9/16\approx2.05$ GB；
- 合计约 **13.0 GB**，为激活（1F1B 下第一段最多缓存 8 个 micro-batch）留出了大量空间。

**延伸**：为什么这里常用 ZeRO-1 而不是 ZeRO-2/3？流水线中每个 micro-batch 的反向都会产生梯度，若梯度也分片，就要每个 micro-batch 都做一次 reduce-scatter，通信次数大增；ZeRO-3 还要在每个 micro-batch 的前向、反向反复 all-gather 参数。DeepSpeed 的流水线引擎只支持 ZeRO-1，Megatron 的分布式优化器也是在 DP 维度切分优化器状态。

<sub>考点：3D并行、ZeRO</sub>

</details>

---

<a name="TRN-DIST-045"></a>

### TRN-DIST-045　挑战 · 考频 ★

某个上万卡的预训练任务平均每 3 小时发生一次导致任务中断的故障（MTBF $M=180$ 分钟）。每次保存检查点时训练要暂停 $C=2$ 分钟。假设故障在时间上均匀随机发生，每次故障平均损失半个检查点间隔的进度（不计重启耗时）。
1. 设检查点间隔为 $\tau$，写出因检查点与故障造成的时间浪费比例，并求使其最小的 $\tau$；
2. 计算此时的浪费比例；
3. 若改用异步检查点，阻塞时间降到 $C=0.2$ 分钟，最优间隔和浪费比例各变为多少？

<details>
<summary>答案与解析</summary>

**答案：(1) 浪费比例约为 C/τ + τ/(2M)，最优 τ = √(2CM) ≈ 26.8 分钟；(2) 约 14.9%；(3) 约 8.5 分钟，浪费约 4.7%**

**解析：**

**(1) 建模**：每 $\tau$ 分钟暂停 $C$ 分钟，开销比例 $\frac{C}{\tau}$；单位时间发生 $\frac{1}{M}$ 次故障，每次平均丢 $\frac{\tau}{2}$，比例 $\frac{\tau}{2M}$。
$$W(\tau)=\frac{C}{\tau}+\frac{\tau}{2M},\qquad W'(\tau)=-\frac{C}{\tau^2}+\frac{1}{2M}=0\ \Rightarrow\ \tau^*=\sqrt{2CM}$$
这就是经典的 Young 公式。代入：$\tau^*=\sqrt{2\times2\times180}=\sqrt{720}\approx26.8$ 分钟。

**(2)** $W=\frac{2}{26.8}+\frac{26.8}{360}\approx7.5\%+7.5\%\approx14.9\%$（最优点处两项相等，$W^*=\sqrt{2C/M}$）。

**(3)** $\tau^*=\sqrt{2\times0.2\times180}=\sqrt{72}\approx8.5$ 分钟，$W^*=\sqrt{0.4/180}\approx4.7\%$。

**结论**：阻塞时间降为 1/10，浪费降为约 $1/\sqrt{10}$。再加上每次重启的固定耗时 $R$（额外浪费约 $R/M$，例如 10 分钟重启就是 5.6%），可以看出大规模训练为什么要同时做异步 / 内存检查点和快速自动恢复。$M=3$ 小时也不夸张：Llama 3 在 1.6 万卡上 54 天发生了 419 次意外中断，平均约 3 小时一次。

<sub>考点：大规模训练容错</sub>

</details>

---

## 代码输出题

<a name="TRN-DIST-019"></a>

### TRN-DIST-019　进阶 · 考频 ★★

下面的代码在单进程中模拟 2 路张量并行，用求和模拟 all-reduce。输出是什么？

```python
import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(size=(4, 6))                      # 输入 (tokens, d)
A = rng.normal(size=(6, 8))                      # 第一层 d -> d_ff
B = rng.normal(size=(8, 6))                      # 第二层 d_ff -> d
gelu = lambda z: 0.5 * z * (1 + np.tanh(0.7978845608 * (z + 0.044715 * z**3)))
ref = gelu(X @ A) @ B

A_col, B_row = np.split(A, 2, axis=1), np.split(B, 2, axis=0)
out1 = sum(gelu(X @ a) @ b for a, b in zip(A_col, B_row))

X_col, A_row = np.split(X, 2, axis=1), np.split(A, 2, axis=0)
out2 = sum(gelu(x @ a) for x, a in zip(X_col, A_row)) @ B
out3 = gelu(sum(x @ a for x, a in zip(X_col, A_row))) @ B

print(np.allclose(out1, ref), np.allclose(out2, ref), np.allclose(out3, ref))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
True False True
```

**解析：**

- `out1`：$A$ 按列切、$B$ 按行切。每「卡」算 $\mathrm{GeLU}(XA_i)B_i$，最后求和（对应一次 all-reduce），与不切分结果一致，输出 `True`。
- `out2`：$A$ 按行切（输入 $X$ 相应按列切），每卡得到的 $X_iA_i$ 只是部分和，却在求和**之前**各自过 GeLU。GeLU 非线性，$\sum_i\mathrm{GeLU}(X_iA_i)\neq\mathrm{GeLU}(\sum_iX_iA_i)$，输出 `False`。
- `out3`：同样按行切，但先求和（all-reduce）再过 GeLU，结果正确，输出 `True`。代价是激活函数之前多了一次通信，后面的 $B$ 也要另外处理。

这正是 Megatron 选择「先列后行」的原因：只有列切能让非线性在本地完成，整个 MLP 前向只需一次 all-reduce。

<sub>考点：张量并行</sub>

</details>

---

<a name="TRN-DIST-034"></a>

### TRN-DIST-034　进阶 · 考频 ★

上下文并行把一条长度为 16 的序列分给 4 张卡，先切成 8 个块（每块 2 个 token）。下面代码统计两种分配方式下，每张卡在因果掩码下要计算的 (query, key) 对数。输出是什么？

```python
def causal_pairs(chunk_ids, chunk):
    """统计这些块里的 query 在因果掩码下要计算的 (q, k) 对数"""
    total = 0
    for c in chunk_ids:
        for q in range(c * chunk, (c + 1) * chunk):
            total += q + 1                 # 位置 q 能看到 0..q
    return total

seq, cp = 16, 4
chunk = seq // (2 * cp)                    # 切成 2*cp = 8 块，每块 2 个 token
contiguous = [[2 * r, 2 * r + 1] for r in range(cp)]
zigzag = [[r, 2 * cp - 1 - r] for r in range(cp)]
print([causal_pairs(ids, chunk) for ids in contiguous])
print([causal_pairs(ids, chunk) for ids in zigzag])
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
[10, 26, 42, 58]
[34, 34, 34, 34]
```

**解析：**

第 $c$ 块的两个 query 位置是 $2c$ 和 $2c+1$，分别能看到 $2c+1$ 和 $2c+2$ 个 key，合计 $4c+3$ 对。

- **顺序切分**：rank $r$ 拿第 $2r$、$2r+1$ 块，共 $(8r+3)+(8r+7)=16r+10$，即 `[10, 26, 42, 58]`。最后一张卡的计算量是第一张的近 6 倍，整体速度由最慢的卡决定。
- **首尾配对**（zigzag）：rank $r$ 拿第 $r$ 块和第 $7-r$ 块，共 $(4r+3)+(4(7-r)+3)=34$，四张卡完全相同。

总对数 $=16\times17/2=136$，两种方式相同，只是分配不同。Megatron 的上下文并行和 Llama 3 的长上下文训练都采用「切成 2×CP 块、rank $i$ 拿第 $i$ 块与第 $2\cdot CP-1-i$ 块」的做法。

<sub>考点：序列与上下文并行</sub>

</details>

---

## 代码填空题

<a name="TRN-DIST-022"></a>

### TRN-DIST-022　挑战 · 考频 ★★

Megatron-LM 把输出层按词表维切到 TP 组的各张卡上。为了不把 $b\times s\times V$ 的完整 logits 收集到一张卡，交叉熵也并行计算：各卡只交换每个位置的几个标量。补全下面的单进程模拟（列表 `shards` 的每个元素代表一张卡上的 logits 分片）。

```python
import numpy as np

def vocab_parallel_ce(shards, target):
    """shards[r]：第 r 张卡上的 logits 分片，形状 (N, V/t)，对应词表 [r*V/t, (r+1)*V/t)
    target：形状 (N,) 的目标 token id。返回每个位置的交叉熵，形状 (N,)。
    每个「跨卡求最大 / 求和」的地方，真实实现中对应一次 all-reduce。"""
    n, part = len(target), shards[0].shape[1]
    # 1) 全局最大值：各卡局部最大值 -> all-reduce(MAX)
    m = np.max([s.max(axis=1) for s in shards], axis=0)
    # 2) 全局 sum(exp)：各卡减去全局最大值后局部求和 -> all-reduce(SUM)
    sum_exp = sum(np.exp(s - ____).sum(axis=1) for s in shards)
    # 3) 目标 logit：只有目标词所在的卡有贡献，其余卡贡献 0 -> all-reduce(SUM)
    tgt = np.zeros(n)
    for r, s in enumerate(shards):
        local = target - r * part
        hit = ____
        tgt[hit] += s[np.arange(n)[hit], local[hit]]
    return ____
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `m[:, None]`；(2) `(local >= 0) & (local < part)`；(3) `np.log(sum_exp) + m - tgt`

**解析：**

**公式**：交叉熵 $=\log\sum_j e^{z_j}-z_y=\log\sum_j e^{z_j-m}+m-z_y$，其中 $m$ 是全局最大 logit。三项各需一次跨卡规约：
1. `m`：各卡局部最大值做 all-reduce(MAX)，形状 $(N,)$；
2. `sum_exp`：各卡减去**全局**最大值 `m[:, None]`（广播到每一列）后求 $\sum e^{z-m}$，再 all-reduce(SUM)；减最大值保证数值稳定；
3. `tgt`：目标 id 落在本卡词表区间 `(local >= 0) & (local < part)` 的位置才取值，其余为 0，再 all-reduce(SUM)；
4. 返回 `np.log(sum_exp) + m - tgt`。

**通信量对比**：若把 logits all-gather 到一起，$s=4096$、$V=128256$ 的 BF16 logits 每个序列约 1 GB；并行交叉熵只交换 3 个长度为 $b\times s$ 的向量，几十 KB 量级。Megatron 论文正是把输出层 GEMM 与交叉熵融合，把通信从 $b\times s\times V$ 降到 $b\times s$。

<sub>考点：张量并行</sub>

</details>

---

## 代码改错题

<a name="TRN-DIST-012"></a>

### TRN-DIST-012　进阶 · 考频 ★★

下面的函数用来估算 ZeRO 各阶段每张卡的模型状态。用它复现 ZeRO 论文的算例（7.5B 参数、64 卡）时，ZeRO-1 正确得到 31.4 GB，但 ZeRO-2 和 ZeRO-3 的结果反而比 ZeRO-1 还大。请指出 bug 并修正。

```python
def zero_model_states_gb(n_params, stage, n_gpu):
    """混合精度 AdamW 下每张卡的模型状态（GB，1 GB = 1e9 字节）。
    BF16 权重 2 + BF16 梯度 2 + FP32 优化器状态 12 字节/参数；stage=0 表示普通 DDP。"""
    weight, grad, optim = 2 * n_params, 2 * n_params, 12 * n_params
    if stage == 1:
        optim /= n_gpu
    elif stage == 2:
        grad /= n_gpu
    elif stage == 3:
        weight /= n_gpu
    return (weight + grad + optim) / 1e9
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：第 5～10 行用 `if / elif` 让每个阶段**只切自己新增的那一项**：stage 2 只切梯度、不切优化器状态，stage 3 只切参数、梯度和优化器状态都不切。于是 ZeRO-2、ZeRO-3 都约为 105.2 GB，比 ZeRO-1 还大。

**修正**：ZeRO 的阶段是累加的，高阶段包含低阶段的全部切分，改成三个独立的 `if stage >= k`：

```python
if stage >= 1:
    optim /= n_gpu
if stage >= 2:
    grad /= n_gpu
if stage >= 3:
    weight /= n_gpu
```

**修正后的代码：**

```python
def zero_model_states_gb(n_params, stage, n_gpu):
    """混合精度 AdamW 下每张卡的模型状态（GB，1 GB = 1e9 字节）。
    BF16 权重 2 + BF16 梯度 2 + FP32 优化器状态 12 字节/参数；stage=0 表示普通 DDP。"""
    weight, grad, optim = 2 * n_params, 2 * n_params, 12 * n_params
    if stage >= 1:
        optim /= n_gpu
    if stage >= 2:
        grad /= n_gpu
    if stage >= 3:
        weight /= n_gpu
    return (weight + grad + optim) / 1e9
```

**解析：**

修正后 7.5B、64 卡的结果为 DDP 120 GB、ZeRO-1 31.4 GB、ZeRO-2 16.6 GB、ZeRO-3 1.9 GB，与 ZeRO 论文一致。

这个 bug 对应一个常见的概念错误：以为 ZeRO-2「切梯度」就只切梯度。实际上 $P_{os}\subset P_{os+g}\subset P_{os+g+p}$，阶段越高切得越多。顺带记住两个检查点：单卡（$N=1$）时任何阶段都应等于 16 字节/参数；阶段升高时，每卡显存只能下降、不能上升。

<sub>考点：ZeRO</sub>

</details>

---

## 编程题

<a name="TRN-DIST-007"></a>

### TRN-DIST-007　挑战 · 考频 ★★

用 numpy 在单进程中模拟环形 AllReduce（求和）：

```python
def ring_allreduce(data: list) -> tuple[list, list]: ...
```

- `data[i]` 是第 i 张卡上的一维数组，共 N 张卡，长度都为 L，且 L 能被 N 整除；
- 先做 N−1 步 reduce-scatter，再做 N−1 步 all-gather；每一步里每张卡只能向下一张卡（`(i + 1) % N`）发送一个分块，所有卡**同时**收发；
- 返回 `(results, sent)`：`results[i]` 是第 i 张卡最终得到的全局求和结果，`sent[i]` 是第 i 张卡累计发送的元素个数；
- 不得修改输入数组。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import numpy as np

def ring_allreduce(data):
    n = len(data)
    chunks = [np.array_split(np.asarray(x, dtype=float).copy(), n) for x in data]
    sent = [0] * n
    # 阶段 1：reduce-scatter。第 s 步，rank i 把第 (i - s) % n 块发给下一张卡，对方累加
    for s in range(n - 1):
        msgs = []
        for i in range(n):
            c = (i - s) % n
            msgs.append(((i + 1) % n, c, chunks[i][c].copy()))
            sent[i] += chunks[i][c].size
        for dst, c, buf in msgs:          # 先收集本步全部消息再统一接收，模拟「同时」收发
            chunks[dst][c] += buf
    # 此时 rank i 持有完整求和后的第 (i + 1) % n 块
    # 阶段 2：all-gather。第 s 步，rank i 把第 (i + 1 - s) % n 块发给下一张卡，对方覆盖
    for s in range(n - 1):
        msgs = []
        for i in range(n):
            c = (i + 1 - s) % n
            msgs.append(((i + 1) % n, c, chunks[i][c].copy()))
            sent[i] += chunks[i][c].size
        for dst, c, buf in msgs:
            chunks[dst][c] = buf
    return [np.concatenate(ch) for ch in chunks], sent
```

**测试用例：**

```python
rng = np.random.default_rng(0)
for n, L in [(4, 8), (3, 9), (5, 20), (2, 6)]:
    data = [rng.normal(size=L) for _ in range(n)]
    backup = [d.copy() for d in data]
    out, sent = ring_allreduce(data)
    total = sum(data)
    assert len(out) == n
    assert all(np.allclose(o, total) for o in out)
    assert sent == [2 * (n - 1) * L // n] * n, (sent, n, L)        # 每卡发送 2(N-1)/N·L
    assert all(np.array_equal(a, b) for a, b in zip(data, backup))  # 不修改输入

out, sent = ring_allreduce([np.arange(4.0)])          # 单卡：不需要通信
assert np.allclose(out[0], np.arange(4.0)) and sent == [0]

out, sent = ring_allreduce([[1, 2, 3, 4], [10, 20, 30, 40]])   # 整数列表输入
assert all(np.allclose(o, [11, 22, 33, 44]) for o in out) and sent == [4, 4]
```

**解析：**

**思路**：
1. 每张卡把数组切成 N 块。reduce-scatter 的第 $s$ 步，rank $i$ 把第 $(i-s)\bmod N$ 块发给 rank $i+1$，对方把它加到自己的同号块上。$N-1$ 步后，rank $i$ 的第 $(i+1)\bmod N$ 块已经累加了所有卡的数据。
2. all-gather 的第 $s$ 步，rank $i$ 把第 $(i+1-s)\bmod N$ 块（第 0 步就是它刚得到的完整块）发给下一张卡，对方直接覆盖。再过 $N-1$ 步，每张卡的每一块都是完整的和。
3. 每张卡每步发 $L/N$ 个元素，共 $2(N-1)$ 步，合计 $\frac{2(N-1)}{N}L$，与测试中的断言一致。

**易错点**：
- 同一步里边发边收，会让某张卡在本步用上刚收到的数据，等于一步走了多跳，结果和计数都不对；要先收集本步所有消息再统一接收。
- 块下标的偏移写错（如两个阶段用同一个公式）会导致部分块重复累加或从未完整求和。
- 直接在输入数组上原地累加会修改调用者的数据；用 `copy()` 隔离。

<sub>考点：集合通信原语</sub>

</details>

---

## 简答题

<a name="TRN-DIST-011"></a>

### TRN-DIST-011　进阶 · 考频 ★★★

请说明 ZeRO-1、ZeRO-2、ZeRO-3 分别切分了什么，写出每张卡模型状态的公式（混合精度 AdamW，参数量 $\Psi$，卡数 $N$）；并分析通信量：为什么 ZeRO-1/2 的通信量与 DDP 相同，而 ZeRO-3 约为 DDP 的 1.5 倍？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **动机**：DDP 每张卡都存完整的模型状态，共 $16\Psi$（BF16 权重 2、BF16 梯度 2、FP32 主权重与 Adam 的 $m$、$v$ 共 12 字节/参数），$N$ 张卡上完全冗余。ZeRO 把这些状态切开，每张卡只负责 $1/N$。
2. **三个阶段**：
   - ZeRO-1 切优化器状态：$4\Psi+12\Psi/N$；
   - ZeRO-2 再切梯度：$2\Psi+14\Psi/N$；
   - ZeRO-3 再切参数：$16\Psi/N$。
3. **ZeRO-1/2 的通信**：DDP 的 AllReduce（环形实现）本身就是 ReduceScatter + AllGather，每卡约 $2\Psi$ 个元素。ZeRO-1/2 把它拆开用：先 ReduceScatter 梯度，每张卡只拿到自己那 $1/N$ 的平均梯度（约 $\Psi$），更新自己那份参数后，再 AllGather 参数（约 $\Psi$），合计仍是 $2\Psi$，所以通信量不变。
4. **ZeRO-3 的通信**：参数平时是分片的。前向每层计算前要 AllGather 一次参数（$\Psi$），用完释放；反向时还要再 AllGather 一次（$\Psi$）；梯度 ReduceScatter（$\Psi$）。合计 $3\Psi$，是 DDP 的 1.5 倍。
5. **实践权衡**：模型放得下时优先 ZeRO-1/2（不加通信）；放不下再上 ZeRO-3 / FSDP，并用预取把 AllGather 与计算重叠；跨机带宽紧张时可用混合分片（机内切、机间复制）或 ZeRO++ 的量化通信。

**评分要点（共 10 分）：**

- 正确说明三个阶段各自切分的对象（2 分）
- 写出三个阶段每卡模型状态的公式（3 分）
- 用 AllReduce = ReduceScatter + AllGather 解释 ZeRO-1/2 通信量不变（2 分）
- 说明 ZeRO-3 前向、反向各一次 AllGather 加一次 ReduceScatter，合计 3Ψ（2 分）
- 提到实践权衡，如预取重叠、按模型规模选择阶段（1 分）

**讲解：**

**常见失分点**：把 ZeRO-2 说成「切参数」；说「ZeRO 越高级越好」而不提通信代价；只会背「1.5 倍」却说不出三次通信分别发生在哪里；忘了 ZeRO-1/2 中参数仍是完整复制的，导致误以为卡数足够多时显存可以无限下降。

<sub>考点：ZeRO、集合通信原语</sub>

</details>

---

<a name="TRN-DIST-024"></a>

### TRN-DIST-024　基础 · 考频 ★★★

张量并行（TP）和流水线并行（PP）有什么区别？请从切分方式、通信模式与通信量、效率损失、显存特点四个方面比较，并说明实践中二者如何搭配。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **切分方式**：TP 在**层内**切矩阵（MLP 先列后行，注意力按头切），每张卡参与每一层的计算；PP 按**层**切成 $p$ 段，每张卡只负责连续的若干层。
2. **通信**：TP 每层前向 2 次、反向 2 次 all-reduce，每次是整个 $(b,s,h)$ 的激活，频繁、量大且处在关键路径上，需要 NVLink，一般只在机内、规模不超过 8；PP 只在相邻段之间点对点传递边界激活和梯度，通信量小，适合跨机。
3. **效率损失**：TP 度越高，每卡的矩阵越小，GPU 利用率下降，但没有空等；PP 有流水线气泡，比例约 $(p-1)/(m+p-1)$，需要足够多的 micro-batch，还要保证各段负载均衡。
4. **显存**：TP 同时切分参数和激活（配合序列并行几乎按 $1/t$ 下降）；PP 每卡只存部分层的参数，但 1F1B 调度下第一段要同时缓存最多 $p$ 个 micro-batch 的激活。
5. **搭配**：机内用 TP，跨机用 PP，最外层再套数据并行（常配 ZeRO-1）；总卡数 = TP × PP × DP。

**评分要点（共 10 分）：**

- 说明层内切矩阵与按层切段的区别（2 分）
- 说明 TP 每层多次 all-reduce、PP 相邻段点对点传激活，以及由此决定的机内 / 跨机放置（3 分）
- 说明 PP 的气泡与 TP 的小矩阵效率问题（2 分）
- 说明二者的显存特点（1 分）
- 给出机内 TP、机间 PP、外层 DP 的组合原则（2 分）

**讲解：**

**常见失分点**：把 TP、PP 笼统地都叫「模型并行」而说不出通信差别；说「PP 没有通信」；只记得 PP 有气泡，却不知道 TP 为什么不能跨机；忘了 1F1B 下各段的激活显存并不均衡。

<sub>考点：张量并行、流水线并行与气泡、3D并行</sub>

</details>

---

<a name="TRN-DIST-030"></a>

### TRN-DIST-030　进阶 · 考频 ★★

流水线并行的气泡是怎么产生的？请给出至少四种减小气泡（或减轻其影响）的方法，并分别说明代价。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **来源**：同步训练中每个 batch 结束时要排空流水线再更新参数。开头各段要依次等第一个 micro-batch 传过来，结尾要依次等最后一个 micro-batch 的梯度传回去，每段有 $p-1$ 个时隙空等，气泡比例约 $\frac{p-1}{m+p-1}$。
2. **增加 micro-batch 数 $m$**：代价是要么增大全局 batch（可能超过临界 batch，影响收敛），要么减小 micro-batch（矩阵变小、单卡效率下降）。
3. **减少段数 $p$**：每段放更多层，代价是每卡显存压力变大，需要 ZeRO、TP 或重计算来补。
4. **交错式 1F1B**：每卡负责 $v$ 个不相邻的块，气泡约缩小为 $1/v$；代价是点对点通信约增加 $v$ 倍，要求 $m$ 是 $p$ 的整数倍。
5. **Zero Bubble**：把反向拆成对输入求梯度（B）和对权重求梯度（W），用可推迟的 W 填补空隙；代价是要暂存更多中间结果、调度更复杂。
6. **DualPipe**（DeepSeek-V3）：从流水线两端同时送入 micro-batch，并把前向、反向的计算与通信成对重叠；代价是每张卡要存两份模型参数，实现复杂。
7. **负载均衡**：Embedding、输出层和 loss 让首尾两段更慢，整条流水线按最慢的段运行；给首尾段少分几层（Llama 3 的做法）可以减小这种「隐性气泡」。

**评分要点（共 10 分）：**

- 说明气泡来自同步训练中流水线的填充与排空，给出比例公式（3 分）
- 给出至少四种方法，每种 1 分（4 分）
- 说明各方法的代价（3 分）

**讲解：**

**常见失分点**：说「1F1B 消除了气泡」（它降的是激活显存）；只会说「增大 m」而不提全局 batch 与单卡效率的约束；忽视各段负载不均造成的等待；说不出交错调度的通信代价。

<sub>考点：流水线并行与气泡</sub>

</details>

---

<a name="TRN-DIST-035"></a>

### TRN-DIST-035　进阶 · 考频 ★★

要把一个 70B 稠密模型（80 层，隐藏维度 8192，64 个 Query 头、8 个 KV 头）的训练长度从 8K 扩到 128K。为什么需要上下文并行（CP）？请比较 Ring Attention、DeepSpeed-Ulysses 和「先 all-gather K/V 再计算」三种实现的通信方式、限制与适用场景。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **为什么需要 CP**：用 FlashAttention 时激活与序列长度成正比，每层约 $34sbh$ 字节。$s=128\text{K}$、$h=8192$ 时一层约 36.5 GB，即使 TP=8 加序列并行也有约 4.6 GB，80 层约 365 GB，远超单卡；注意力计算量还随 $s^2$ 增长。CP 把一条序列切到多张卡上，每张卡在所有层只处理 $s/cp$ 个 token（MLP、LayerNorm 完全本地），只有注意力需要跨卡交换 K/V。
2. **Ring Attention**：每张卡持有一段 Q，K/V 块沿环点对点传递 $cp-1$ 次，每收到一块就算一块并用 online softmax 合并，通信与计算重叠。优点是不受头数限制、可跨机；缺点是因果掩码下负载不均，需要首尾配对切分，块太小时通信藏不住。
3. **DeepSpeed-Ulysses**：注意力前用 All-to-All 把 Q/K/V 从「按序列切」换成「按头切」，每张卡对完整序列算 $h/cp$ 个头，算完再 All-to-All 换回来。序列长度与卡数同比增长时每卡通信量不变，可直接复用现成的注意力内核；限制是并行度受头数约束，本例只有 8 个 KV 头，超过 8 就要复制 KV 头，All-to-All 也更适合放在高带宽的机内。
4. **all-gather K/V**（Llama 3 的做法）：每张卡先 all-gather 完整的 K、V，再算本地 Q 块的注意力。实现简单、容易支持文档掩码等任意掩码；GQA 下 K、V 合计只有 Q 的 1/4（8 个 KV 头对 64 个 Query 头），暴露在关键路径上的通信不大；代价是要临时存下整段 K/V。
5. **选型**：头数充足、机内带宽高时用 Ulysses；需要跨机扩展或头数受限时用 Ring；需要复杂掩码、GQA 明显时用 all-gather；也可以组合（如机内 Ulysses、机间 Ring），并与 TP、首尾配对的负载均衡一起使用。

**评分要点（共 10 分）：**

- 说明 CP 的必要性：激活随序列线性增长、注意力随序列平方增长，单卡放不下（2 分）
- 说明 Ring Attention 的点对点环形传递、与计算重叠及负载均衡问题（2 分）
- 说明 Ulysses 的两次 All-to-All 与头数限制（2 分）
- 说明 all-gather K/V 方案及 GQA 让它可行的原因（2 分）
- 给出合理的选型或组合建议（2 分）

**讲解：**

**常见失分点**：把 Megatron 的序列并行（只切 LayerNorm 等、仍在 TP 组内）与上下文并行混为一谈；以为 CP 要切分 MLP 的计算并通信；不知道因果掩码造成的负载不均；忽视 GQA 下 KV 头数对 Ulysses 并行度的约束。

<sub>考点：序列与上下文并行</sub>

</details>

---

<a name="TRN-DIST-038"></a>

### TRN-DIST-038　挑战 · 考频 ★★

MoE 训练中，专家并行（EP）的通信为什么容易成为瓶颈？请说明 EP 的通信模式，分析影响通信开销的因素，并给出优化手段（可以结合 DeepSeek-V3 的做法）。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **通信模式**：每个 MoE 层前向有两次 All-to-All：dispatch 把 token 发到所选专家所在的卡，专家计算后 combine 发回原卡；反向再有两次。数据量正比于「token 数 × top-k × 隐藏维度」。
2. **为什么容易成为瓶颈**：
   - 量大：细粒度 MoE 的 top-k 常为 8，每层通信量可与稠密模型的 TP 通信相当甚至更大；
   - 跨机：专家多时 EP 必然跨节点（DeepSeek-V3 的 64 路 EP 横跨 8 个节点），机间 IB 带宽远低于机内 NVLink；
   - 负载不均：热门专家所在的卡收到更多 token，All-to-All 和专家计算都被最慢的卡拖住；
   - 计算通信比低：每个专家分到的 token 少、矩阵小，计算很快，通信相对更显眼；All-to-All 又是同步点，延迟敏感。
3. **优化手段**：
   - **限制路由范围**：DeepSeek-V3 让每个 token 最多发往 4 个节点，控制跨机流量；先经 IB 发到目标节点上同号的卡，再经 NVLink 转发给目标专家；
   - **负载均衡**：辅助损失或无辅助损失的偏置调整，让各专家负载接近；
   - **通信与计算重叠**：DualPipe 把不同 micro-batch 的前向与反向块配对，一边算一边做 All-to-All；只用少量 SM（DeepSeek-V3 约 20 个）运行通信内核，不挤占计算；
   - **减少字节数**：dispatch 前把激活量化为 FP8，combine 保留 BF16；
   - **并行布局**：EP 尽量放在通信快的范围内，与数据并行组合；DeepSeek-V3 采用 16 路 PP、64 路 EP 与 ZeRO-1 数据并行，训练中不用张量并行；
   - **专用通信库**：如 DeepSeek 开源的 DeepEP，针对 MoE 的 dispatch / combine 做了优化。

**评分要点（共 10 分）：**

- 说明 dispatch / combine 两次 All-to-All 及其数据量（2 分）
- 分析通信量、跨机带宽、负载不均、计算通信比等因素（3 分）
- 给出至少三种有效的优化手段（3 分）
- 能结合 DeepSeek-V3 等实例说明（2 分）

**讲解：**

**常见失分点**：说 EP 的通信是 all-reduce；只谈负载均衡损失而不谈通信本身；不知道细粒度专家、大 top-k 会放大通信；把 MoE 的「激活参数少」误解成「训练通信少」。负载均衡损失、容量因子等路由细节属于 MoE 结构的考点，这里点到为止即可。

<sub>考点：专家并行、通信计算重叠</sub>

</details>

---

<a name="TRN-DIST-043"></a>

### TRN-DIST-043　进阶 · 考频 ★★

大模型训练中有哪些「通信与计算重叠」的手段？请按并行维度（DP / ZeRO、TP、PP、EP）各举例说明，并指出重叠能够成立的前提条件和局限。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **DP / ZeRO**：DDP 梯度分桶，后面层的梯度 all-reduce 与前面层的反向计算同时进行；ZeRO-3 / FSDP 预取下一层参数的 all-gather，与当前层的计算重叠；梯度 reduce-scatter 也在反向中逐层发出。
2. **TP**：把矩阵乘与它前后的 all-gather / reduce-scatter 切成小块流水执行（Megatron / Transformer Engine 的 TP 通信重叠；MegaScale 把序列并行的 all-gather、reduce-scatter 与相邻的矩阵乘融合）。
3. **PP**：相邻段的点对点收发异步执行，在等待下一个 micro-batch 时传输上一个的激活或梯度；交错调度、DualPipe 等进一步把通信嵌入计算的空隙。
4. **EP**：把一个 micro-batch 的 All-to-All 与另一个 micro-batch 的计算重叠（DualPipe 将前向块与反向块配对执行）。
5. **前提**：存在与当前通信没有数据依赖的计算；计算时间不短于通信时间；通信放在独立的 CUDA 流上；有足够显存放预取的缓冲。
6. **局限**：通信内核也占用 SM 和显存带宽，会拖慢同时运行的计算；通信比计算长时只能部分掩盖；预取增加显存；实现复杂，各 rank 的集合通信顺序必须一致，否则会死锁。

**评分要点（共 10 分）：**

- 说明 DP / ZeRO 的分桶与预取重叠（2 分）
- 说明 TP 的通信与矩阵乘分块重叠（2 分）
- 说明 PP 或 EP 的重叠方式（2 分）
- 说明重叠成立的前提：无数据依赖、计算量足够、独立的流与缓冲（2 分）
- 说明局限：资源争用、只能部分掩盖、显存与复杂度代价（2 分）

**讲解：**

**常见失分点**：只会说「异步通信」而没有具体机制；认为重叠可以把通信完全「变没」；忽略通信内核对 SM 的占用（DeepSeek-V3 专门把通信限制在约 20 个 SM 上，就是为了减少对计算的挤占）；不知道 TP 的 all-reduce 处在关键路径上、天然难以重叠。

<sub>考点：通信计算重叠</sub>

</details>

---

## 场景分析题

<a name="TRN-DIST-017"></a>

### TRN-DIST-017　挑战 · 考频 ★★

团队在 4 台机器上用 FSDP `FULL_SHARD` 全参训练一个 13B 模型：每台 8 张 A100 80GB，机内 NVLink，机间**每台只有 1 张** 200 Gb/s 网卡；序列长 4096，每卡 micro-batch 为 1。监控显示 GPU 利用率只有 35% 左右，profile 发现大量时间在等待 all-gather 和 reduce-scatter。请定量分析原因，并按改动成本从低到高给出优化方案及其代价。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 定位瓶颈：跨机带宽**
- 13B 的 BF16 参数约 26 GB。`FULL_SHARD` 在 32 卡上做全局分片，每步要做前向 all-gather、反向 all-gather、梯度 reduce-scatter 三次集合通信，每次约有 26 GB 的数据要经过每台机器唯一的网卡，合计约 75 GB。
- 网卡带宽 200 Gb/s ≈ 25 GB/s，仅通信就要约 3 s；而每卡每步计算约 $6\times13\times10^9\times4096\approx3.2\times10^{14}$ FLOPs，按 A100 有效算力约 150 TFLOPS 估算约 2.1 s。通信比计算还长，预取也藏不住，利用率自然很低。

**2. 优化方案（成本从低到高）**
1. **检查重叠配置**：按 Transformer 层包装；开启反向预取（`BACKWARD_PRE`）和前向预取；确认没有不必要的同步。代价几乎为零，但解决不了「通信比计算长」的根本问题。
2. **提高计算通信比**：在显存允许时加大每卡 micro-batch 或序列长度，让每次通信对应更多计算。注意 `FULL_SHARD` 下单纯增加梯度累积步数并不减少参数 all-gather 的次数。
3. **改用 `SHARD_GRAD_OP`**：省掉反向的 all-gather，通信约降为 2/3；代价是前向到反向期间每卡持有完整参数（约 26 GB）。
4. **改用 `HYBRID_SHARD`（机内分片、机间复制）**：参数 all-gather 与梯度 reduce-scatter 都走 NVLink，跨机只剩一次分片梯度的 all-reduce（4 台机器的环形 all-reduce，每台网卡约 $2\times\frac{3}{4}\times26\approx39$ GB），且可与反向重叠。代价是模型状态只在 8 卡间分摊，每卡约 $16\times13/8=26$ GB，仍放得下。也可以改成「机内 TP=8 + 机间 DP（ZeRO-1）」，效果类似。
5. **压缩通信**：梯度用 BF16 规约；或用 ZeRO++ 一类的量化 all-gather / reduce-scatter。代价是数值误差，需要对比 loss 曲线验证。
6. **升级硬件**：大模型训练集群通常每张 GPU 配一张网卡并支持 GPUDirect RDMA，跨机带宽提升约 8 倍，这是最根本但成本最高的方案。

**3. 验证**：用 nccl-tests 实测机内、机间 all-gather 带宽；在 profile 中比较计算与通信时间线；以 MFU、每步时间和 loss 曲线作为前后对比指标。

**评分要点（共 10 分）：**

- 定量指出跨机带宽是瓶颈：单网卡约 25 GB/s，FULL_SHARD 每步约三次跨机集合通信，通信时间超过计算（3 分）
- 给出 HYBRID_SHARD 或机内 TP 等「把频繁通信留在机内」的方案，并说明显存代价（3 分）
- 给出预取、增大计算量、SHARD_GRAD_OP、通信压缩等低成本方案及代价（2 分）
- 提到硬件层面（每卡一张网卡、GPUDirect RDMA）与验证方法（2 分）

**讲解：**

**常见失分点**：只说「开启预取」而不算账，没意识到通信本身比计算还长、预取也藏不住；不知道 `HYBRID_SHARD` 的方向（机内分片、机间复制）；以为增大梯度累积就能减少 `FULL_SHARD` 的参数通信；给方案不提显存代价。高分回答要先把「每步通信量 / 跨机带宽」和「每步计算量 / 有效算力」两个数算出来再对比。

<sub>考点：FSDP、通信计算重叠</sub>

</details>

---

<a name="TRN-DIST-047"></a>

### TRN-DIST-047　挑战 · 考频 ★★

你负责一个 2048 卡的预训练任务（TP=8、PP=8、DP=32）。最近出现两类问题：
1. 训练偶尔整体卡住，几十分钟后因 NCCL 超时报错退出，日志显示绝大多数 rank 都停在同一个集合通信调用上；
2. 平均每步耗时比上线初期慢了约 15%，没有任何报错，loss 曲线正常。

请分析两类问题的可能原因、定位方法，以及工程上的改进措施。

<details>
<summary>答案与解析</summary>

**参考答案：**

**问题 1：整体卡住（hang）**
- **本质**：集合通信要求组内所有 rank 都到场，只要一个 rank 没进入这次调用，其余 rank 都会一直等到超时，所以「大家都停在同一个调用上」恰恰说明问题出在**少数没到场的 rank**。
- **可能原因**：某张 GPU 硬件故障（Xid、ECC 错误）或进程崩溃、OOM；网卡或链路故障、端口反复上下线；某个 rank 的数据加载卡在存储上；代码分支不一致导致集合通信顺序错位（例如只有部分 rank 进入了某个条件分支，或流水线收发不匹配）。
- **定位**：收集每个 rank 最后完成的集合通信序号与调用栈（如 PyTorch 的 NCCL Flight Recorder、对所有进程 dump Python 栈），找出与众不同的 rank；查看该节点的 dmesg / Xid 日志、网卡错误计数和存储延迟。
- **改进**：设置合理的分层超时和 watchdog，超时时自动 dump 现场再退出，避免干等几十分钟；自动隔离坏节点并用热备替换；从最近的检查点自动重启；启动前做节点自检（GPU 压测、NCCL 带宽测试），坏机器不进训练。

**问题 2：无报错变慢（慢节点）**
- **本质**：同步训练每一步由最慢的 rank 决定，一张慢卡会拖慢 2048 张卡。
- **可能原因**：GPU 过热降频或功耗封顶；NVLink / PCIe 降级；网卡链路降速、重传增多、ECMP 哈希冲突造成拥塞；某台主机 CPU 被数据预处理、日志或 Python 垃圾回收占用造成停顿；存储变慢；也要排除工作负载变化（新数据更长、batch 组成变化）。
- **定位**：给每个 rank 记录「计算时间」与「在集合通信中等待的时间」：慢节点自身计算时间最长、几乎不等待，其他 rank 都在等它。MegaScale 用 CUDA event 计时器收集各 rank 的耗时，并按 rank 可视化来找出慢机器；同时比较不同 DP 组、PP 段的耗时，检查 GPU 频率、温度和网卡计数器。
- **改进**：剔除或更换慢节点；修复网络配置；在固定步数统一手动触发垃圾回收；持续监控每步 MFU 与各 rank 的耗时分布并设置告警。

**评分要点（共 10 分）：**

- 指出 hang 的本质是少数 rank 没进入集合通信，并给出至少两类原因（2 分）
- 给出 hang 的定位方法：通信序号 / 调用栈对比、节点日志（2 分）
- 指出变慢由最慢 rank 决定，并给出至少两类慢节点原因（2 分）
- 给出慢节点定位方法：各 rank 计算与等待时间分解（2 分）
- 给出自动检测、隔离替换、检查点重启、监控告警等工程改进（2 分）

**讲解：**

**常见失分点**：看到 NCCL 超时就归因于「网络不好」或简单调大超时；不知道同步训练中「大家都在等」意味着要找那个「没在等」的 rank；把慢节点问题当成算法问题去调学习率；只给排查思路、没有自动化的长效机制。

<sub>考点：大规模训练容错、通信计算重叠</sub>

</details>

---

## 系统设计题

<a name="TRN-DIST-048"></a>

### TRN-DIST-048　挑战 · 考频 ★★★

为一个 70B 稠密模型设计预训练的并行方案。模型：80 层，隐藏维度 8192，64 个 Query 头、8 个 KV 头，词表 128K。资源：64 台机器 × 8 张 H100 80GB（机内 NVLink，机间每卡一张 400 Gb/s 网卡）。训练：主体阶段序列长 8K，全局 batch 为 2048 条序列（约 1680 万 token）；最后有一个 128K 的长上下文阶段，全局 token 数保持不变。请给出 TP / PP / DP（及 CP）的配置与理由，估算每卡显存与流水线气泡，并说明通信重叠、容错与验证方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 约束**：共 512 卡；模型状态 $70\times10^9\times16\approx1.12$ TB，必须切分到多卡；TP 要放在机内，并且不宜超过 8 个 KV 头。

**2. 主体阶段推荐：TP=8 × PP=4 × DP=16，DP 维度用 ZeRO-1（分布式优化器）**
- **TP=8**：放在机内 NVLink 上，每卡 8 个 Query 头、1 个 KV 头，正好不需要复制 KV 头；开启序列并行。
- **PP=4**：每段 20 层，跨机只传边界激活；首段有 Embedding、末段有输出层与 loss，可以各少放一层来平衡负载。
- **DP=16**：每个副本分到 $2048/16=128$ 条序列，micro-batch 为 1 时 $m=128$，气泡 $=\frac{3}{131}\approx2.3\%$。
- **每卡显存估算**：
  - 参数 $70\text{B}/(8\times4)\approx2.19$B；BF16 权重 + 梯度约 8.75 GB；FP32 优化器状态按 DP=16 切分约 1.64 GB；模型状态合计约 10.4 GB；
  - 激活（TP + SP + FlashAttention）每层每个 micro-batch 约 $34sbh/t=34\times8192\times8192/8\approx285$ MB；1F1B 下第一段最多同时缓存 4 个 micro-batch × 20 层，约 22.8 GB；
  - 末段的 logits 按词表切分后约 0.5 GB（FP32）；加上通信缓冲和碎片，峰值约 40 GB，可以不开全量重计算，只用选择性重计算。
- **备选：TP=8 + FSDP（ZeRO-3）跨 64 台机器、不用 PP**：没有气泡，每卡模型状态只有约 2.2 GB，但参数 all-gather 与梯度 reduce-scatter 都要跨机，通信约为 DDP 的 1.5 倍，需要依赖预取重叠。两种方案应在小规模上实测 MFU 后再定。

**3. 长上下文阶段：TP=8 × CP=8 × PP=4 × DP=2（共 512 卡）**
- 全局 token 不变，即 128 条 128K 序列，每个 DP 副本 64 条，$m=64$，气泡 $\frac{3}{67}\approx4.5\%$；
- CP 把每条序列切成 2×CP 块、首尾配对分给各卡以平衡因果掩码的负载；GQA 下 K/V 只有 Q 的 1/4，可采用 all-gather K/V 的实现（便于支持文档掩码），也可用 Ring Attention；
- 每卡每层只处理 16K token，激活与主体阶段同量级。

**4. 通信重叠**：DP 的梯度 reduce-scatter / 参数 all-gather 与最后几个 micro-batch 的反向重叠；TP 通信与矩阵乘分块重叠；PP 点对点异步收发；气泡偏大时用交错式 1F1B。

**5. 容错**：分片的异步检查点，按 MTBF 与单次检查点的阻塞时间用 Young 公式 $\sqrt{2CM}$ 定间隔（异步检查点只阻塞几秒时通常在几十分钟以内，阻塞越久间隔越长）；检查点格式支持换卡数后重新切分；自动故障检测、热备替换与自动重启；监控每个 rank 的耗时以发现慢节点。

**6. 验证**：先在 1～2 台机器上用同样的并行配置和缩小的层数，与单卡参考实现对拍 loss；用 profile 检查各段耗时是否均衡、通信是否被掩盖；逐步扩到全量，记录 MFU、每步时间与 loss 曲线。

**评分要点（共 10 分）：**

- 给出合理的 TP / PP / DP 组合并说明放置理由（TP 机内且不超过 KV 头数、PP 跨机、DP 外层配 ZeRO-1）（3 分）
- 估算每卡模型状态、激活与 micro-batch 数、气泡比例（3 分）
- 给出长上下文阶段的 CP 配置与负载均衡方法（2 分）
- 说明通信重叠、容错与验证方案（2 分）

**讲解：**

**常见失分点**：TP 跨机或超过 KV 头数；只给卡数乘积而不估算显存与气泡；忽略全局 batch 固定时 DP 与 micro-batch 数的此消彼长；长上下文阶段不加 CP 或不处理因果掩码的负载不均；完全不提容错。参考：Llama 3 405B 在 1.6 万张 H100 上采用 TP、CP、PP 与 FSDP 组成的 4D 并行，并按 [TP, CP, PP, DP] 的顺序从内到外排布。

<sub>考点：3D并行、张量并行、流水线并行与气泡、ZeRO、序列与上下文并行　｜　出处：The Llama 3 Herd of Models arXiv:2407.21783（3.3 节 4D 并行）；Megatron-LM（Narayanan 等, 2021）arXiv:2104.04473；Korthikanti 等 arXiv:2205.05198；ZeRO arXiv:1910.02054</sub>

</details>

---
