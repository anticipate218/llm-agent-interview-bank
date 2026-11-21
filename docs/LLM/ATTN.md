# LLM-ATTN · 注意力机制

> 所属大类：大模型原理　｜　题量：52

注意力的计算、掩码、多头及其省显存变体、复杂度与 KV Cache。

**考点覆盖**：缩放点积注意力（4） · 缩放因子（5） · 注意力掩码（8） · 多头注意力（6） · MQA（5） · GQA（9） · MLA（6） · 注意力复杂度（7） · KV Cache原理与大小（11） · 稀疏与滑动窗口注意力（8） · 线性注意力（5） · 交叉注意力（5） · Attention Sink（4） · 数值稳定（7）

**题型**：[单选题（12）](#单选题) · [多选题（6）](#多选题) · [判断题（6）](#判断题) · [填空题（4）](#填空题) · [计算题（5）](#计算题) · [代码输出题（3）](#代码输出题) · [代码填空题（1）](#代码填空题) · [代码改错题（1）](#代码改错题) · [编程题（4）](#编程题) · [简答题（7）](#简答题) · [场景分析题（2）](#场景分析题) · [系统设计题（1）](#系统设计题)

---

## 单选题

<a name="LLM-ATTN-001"></a>

### LLM-ATTN-001　基础 · 考频 ★★★

Scaled Dot-Product Attention 中，打分 $QK^\top$ 要除以 $\sqrt{d_k}$，最主要的目的是：

- **A.** 让注意力分布更尖锐，使每个 query 更集中地关注最相关的 token
- **B.** 防止点积随维度增大而变大，导致 Softmax 饱和、梯度过小
- **C.** 保证每一行注意力权重之和为 1，使输出成为对 V 的加权平均
- **D.** 使打分随 token 间距离增大而衰减，从而为模型注入相对位置信息

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：缩放是为了控制 Softmax 输入的数值范围，保持梯度健康。

设 $q$、$k$ 的各维独立、均值 0、方差 1，则点积 $q\cdot k=\sum_{i=1}^{d_k}q_ik_i$ 的方差为 $d_k$。$d_k=128$ 时标准差约 11，Softmax 会把几乎全部权重压到最大的一项上（接近 one-hot），其余位置梯度趋近于 0，训练困难。除以 $\sqrt{d_k}$ 后方差回到 1 左右。

- A 错：方向反了。除以大于 1 的 $\sqrt{d_k}$ 相当于升高 Softmax 温度，分布更平缓；缩放要防止的恰恰是分布过尖、接近 one-hot。
- C 错：权重和为 1 是 Softmax 归一化保证的，与是否缩放无关。
- D 错：$\sqrt{d_k}$ 是与位置无关的常数，对所有打分一视同仁；位置信息来自位置编码（如 RoPE，或 ALiBi 的距离偏置）。

<sub>考点：缩放因子、缩放点积注意力</sub>

</details>

---

<a name="LLM-ATTN-013"></a>

### LLM-ATTN-013　挑战 · 考频 ★

关于注意力中的缩放因子 $1/\sqrt{d_k}$，下列说法正确的是：

- **A.** 缩放放在 Softmax 前后效果相同：乘一个常数不改变各位置打分的相对大小
- **B.** 把 $1/\sqrt{d_k}$ 换成可学习标量后，模型能自行控制尺度，Softmax 归一化也就可以省去
- **C.** 它等价于把 Softmax 的温度设为 $\sqrt{d_k}$，也可以折算进 $W^Q$ 的初始化中
- **D.** 使用 RoPE 后旋转打乱了各维的相关性，打分方差不再随 $d_k$ 增长，缩放可以省略

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：缩放就是一个固定的 Softmax 温度，放在哪里乘都是同一个函数族。

$\mathrm{softmax}(QK^\top/\sqrt{d_k})$ 就是温度 $\tau=\sqrt{d_k}$ 的 Softmax。又因为 $QK^\top/\sqrt{d_k}=(XW^Q/\sqrt{d_k})K^\top$，缩放也可以吸收进 $W^Q$。T5（Mesh TensorFlow 实现）正是这样做的：注意力里不除以 $\sqrt{d_k}$，而是把 $W^Q$ 的初始化标准差设为 $(d_{model}\cdot d_{kv})^{-1/2}$，Hugging Face 的 T5 代码里也注明了「避免在 Softmax 前缩放」。两种写法在初始化时等价，但训练中的优化动态并不完全相同。

- A 错：Softmax 前乘常数改变的是分布的尖锐程度（即温度），前后并不等价。缩放必须作用于 Softmax 的**输入**，目的就是控制输入的尺度；Softmax 之后再乘常数既不能缓解饱和，还会让权重和不为 1。
- B 错：可学习标量只调节打分的尺度（温度），仍然需要 Softmax 把打分归一化成概率分布，二者作用不同。
- D 错：RoPE 是正交旋转，不改变向量长度；旋转后的点积仍是 $d_k$ 项之和，方差照样随 $d_k$ 增长。

<sub>考点：缩放因子</sub>

</details>

---

<a name="LLM-ATTN-015"></a>

### LLM-ATTN-015　基础 · 考频 ★★

一次注意力计算中，$Q$ 的形状为 $T_q\times d_k$，$K$ 为 $T_k\times d_k$，$V$ 为 $T_k\times d_v$（例如交叉注意力中 $T_q$ 是解码器长度、$T_k$ 是编码器长度）。打分矩阵和输出的形状分别是：

- **A.** 打分 $T_q\times T_k$，输出 $T_q\times d_v$
- **B.** 打分 $T_k\times T_q$，输出 $T_k\times d_v$
- **C.** 打分 $T_q\times T_k$，输出 $T_q\times d_k$
- **D.** 打分 $T_q\times T_q$，输出 $T_q\times d_v$

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：输出的「行数跟 Q 走、列数跟 V 走」。

$QK^\top$ 是 $(T_q\times d_k)(d_k\times T_k)=T_q\times T_k$，每一行是一个 query 在全部 $T_k$ 个 key 上的打分，Softmax 沿最后一维（key 维）归一化；再乘 $V$（$T_k\times d_v$）得到 $T_q\times d_v$。

形状约束：$Q$ 与 $K$ 的维度必须相同（才能做点积），$K$ 与 $V$ 的长度必须相同（一一对应）；$d_v$ 可以与 $d_k$ 不同，例如 DeepSeek-V3 的 MLA 中每个头的 query / key 为 192 维、value 为 128 维。

- B 错：把 query 与 key 的角色弄反了。
- C 错：输出维度由 $V$ 决定，是 $d_v$ 而不是 $d_k$。
- D 错：交叉注意力中 query 与 key 来自不同序列，打分矩阵是 $T_q\times T_k$。

<sub>考点：缩放点积注意力、交叉注意力</sub>

</details>

---

<a name="LLM-ATTN-017"></a>

### LLM-ATTN-017　进阶 · 考频 ★★

某同学在 FP16 推理代码里写了 `scores = scores.masked_fill(mask, -1e9)`，运行时报错：`value cannot be converted to type c10::Half without overflow`。下列分析与改法中最合适的是：

- **A.** `masked_fill` 不支持 FP16 张量，应先把 scores 转成 FP32 再做掩码，之后全程保持 FP32 计算
- **B.** -1e9 超出 FP16 的表示范围（约 ±65504），应改用 `torch.finfo(scores.dtype).min`
- **C.** -1e9 过大会让 Softmax 的指数运算下溢并产生 NaN，应改用 -1 这样的小负数作掩码值
- **D.** `masked_fill` 对半精度有已知缺陷，改用 `scores[mask] = -1e9` 这种索引赋值即可绕过

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：掩码值必须能被当前精度表示。FP16 的最大有限值约为 65504，$-10^9$ 无法转换，PyTorch 因此报错。

常见做法是 `torch.finfo(scores.dtype).min`（FP16 为 $-65504$，BF16 约为 $-3.39\times10^{38}$）或 $-\infty$。两者的区别在整行都被屏蔽时：用 $-\infty$ 时 Softmax 得到 NaN；用有限的极小值时得到均匀分布、不会产生 NaN，Hugging Face Transformers 因此采用 `finfo.min`。注意若是把掩码「加」到打分上，打分本身为负时 $-65504$ 再减就会溢出成 $-\infty$，所以更推荐用 `masked_fill`「填」而不是「加」。

- A 错：`masked_fill` 支持 FP16，问题出在填充值。
- C 错：$e^{-10^9}$ 只会下溢为 0，不会产生 NaN（NaN 来自整行都是 $-\infty$ 的情形）；而 -1 根本起不到屏蔽作用。
- D 错：`masked_fill` 本身没有缺陷；索引赋值同样要把 $-10^9$ 转成 FP16，会报同样的错误。

<sub>考点：注意力掩码、数值稳定</sub>

</details>

---

<a name="LLM-ATTN-018"></a>

### LLM-ATTN-018　基础 · 考频 ★★★

在 $d_{model}$ 固定的条件下，把单头注意力改成 $h$ 头的多头注意力（每头维度 $d_{model}/h$），下列说法正确的是：

- **A.** 参数量约变为原来的 $h$ 倍，因为每个头都有自己独立的 Q、K、V 投影矩阵
- **B.** 打分计算量变为原来的 $h$ 倍，因为要分别计算 $h$ 个 $T\times T$ 的打分矩阵
- **C.** 每个头只用 $d_{model}/h$ 维打分，表达能力下降，模型整体容量约降为原来的 $1/h$
- **D.** 参数量不变、打分计算量基本不变，变化是每个 query 有 $h$ 组独立的注意力分布

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：多头是把 $d_{model}$ 维「切开用」，而不是复制 $h$ 份。

$W^Q,W^K,W^V,W^O$ 仍是 $d\times d$，合计 $4d^2$；所谓每个头的投影，只是大矩阵中相应的 $d/h$ 列。打分计算量为 $h\times T^2\times(d/h)=T^2d$，与单头相同。真正的变化是：每个 query 有 $h$ 个独立的 Softmax 分布，可以同时关注不同的关系（如指代、句法搭配、相邻 token），再由 $W^O$ 混合。

- A 错：这是最常见的误解。每个头的投影只是大矩阵中的一部分列，合起来仍是 $d\times d$。
- B 错：每个打分矩阵的点积长度变成 $d/h$，总计算量不变（Softmax 的逐元素运算会多出 $h$ 倍，但相对矩阵乘可以忽略）。
- C 错：参数量不变，容量并没有降为 $1/h$；切分只是让 $h$ 个头在不同的子空间里各自计算注意力，再由 $W^O$ 混合。

<sub>考点：多头注意力</sub>

</details>

---

<a name="LLM-ATTN-021"></a>

### LLM-ATTN-021　进阶 · 考频 ★★★

同一个模型把 MHA 换成 GQA（KV 头数从 32 降到 8，Query 头数不变）后，推理的 Decode 阶段明显变快，而 Prefill 阶段几乎没有提速。最主要的原因是：

- **A.** GQA 只在 Decode 阶段生效，Prefill 阶段推理框架会把 KV 头复制回 32 个、退化成 MHA 计算
- **B.** GQA 只减少了 K、V 投影的计算：Decode 时投影占比高所以提速明显，Prefill 时 FFN 占大头所以几乎不变
- **C.** Prefill 阶段不写 KV Cache，缓存要等 Decode 开始才逐步建立，所以 KV 头数对它没有影响
- **D.** Decode 受带宽限制，GQA 让每步读取的 KV Cache 降为 1/4；Prefill 受算力限制，打分计算量不变

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：GQA 省的是 KV 的**存储与读取**，不是注意力的**计算**。

- Decode 每步只有 1 个新 token，却要把全部历史 KV 从显存读一遍，耗时由带宽决定。KV 头从 32 降到 8，读取量降为 1/4；而且每读入一份 KV 会被组内 4 个 Query 头复用，算术强度提高，所以明显提速。
- Prefill 一次处理整段提示词，是计算密集型。32 个 Query 头仍要各自与全部 key 打分，$QK^\top$ 与「乘 V」的 FLOPs 不变，GQA 只让 K、V 投影少了一些计算，整体几乎不变。

- A 错：两个阶段用的是同一套 GQA 计算；高效内核按头号索引共享的 KV，并不真正复制。
- B 错：每个 token 的投影计算在两个阶段相同，GQA 省下的 K、V 投影只占很小一部分；Decode 提速来自 KV Cache 读取量的减少，而不是投影 FLOPs。
- C 错：Prefill 会把整段提示词的 K、V 一次性写入缓存，GQA 同样减小了这部分显存，只是对计算时间影响很小。

<sub>考点：GQA、MQA</sub>

</details>

---

<a name="LLM-ATTN-022"></a>

### LLM-ATTN-022　挑战 · 考频 ★

Llama-2-70B 有 64 个 Query 头、8 个 KV 头。若用 16 张 GPU 按注意力头做张量并行推理，KV 头通常如何处理？

- **A.** 每个 KV 头复制到 2 张卡上，每卡 4 个 Query 头配 1 个 KV 头，KV Cache 总量翻倍
- **B.** 把每个 KV 头沿头维度（128 维）切成两半分给两张卡，各存 64 维，KV Cache 总量不变
- **C.** 张量并行度不能超过 KV 头数 8，16 卡时只能改为 8 路张量并行再叠加 2 路流水线并行
- **D.** 每张卡都保存全部 8 个 KV 头，本卡的 4 个 Query 头可直接访问任意一组 KV，无需通信

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：张量并行度大于 KV 头数时，常见做法是复制 KV 头。

每张卡分到 $64/16=4$ 个 Query 头。GQA 中每 8 个 Query 头共享 1 个 KV 头，第 0、1 张卡上的 Query 头（0～3、4～7）都属于第 0 组，于是第 0 个 KV 头要在这两张卡上各放一份。每张卡只存 1 个 KV 头，但全局看每个 KV 头存了 2 份，总缓存翻倍。vLLM 等框架在张量并行度大于 KV 头数时就是这样复制 KV 头的。

- B 错：注意力打分需要每个头完整的点积，沿头维度切开要额外通信来合并部分点积，按头切分的张量并行不这样做。
- C 错：并行度可以超过 KV 头数，代价是 KV 复制（8 路张量并行加 2 路流水线并行是可选方案之一，但不是唯一出路）；这正是 GQA 比 MQA 更适合张量并行的原因（MQA 只有 1 个 KV 头，每张卡都得放一份）。
- D 错：每张卡只需要本卡 Query 头所属组的 KV，放全部 8 组是 8 倍的浪费。

<sub>考点：GQA、MQA</sub>

</details>

---

<a name="LLM-ATTN-028"></a>

### LLM-ATTN-028　基础 · 考频 ★★★

对长度为 $T$、隐藏维度为 $d$ 的序列做一次标准自注意力（朴素实现，不使用 FlashAttention），打分与加权求和这两步的时间复杂度，以及打分矩阵所需的额外显存分别是：

- **A.** 时间 $O(Td^2)$，显存 $O(Td)$
- **B.** 时间 $O(T^2d^2)$，显存 $O(T^2d)$
- **C.** 时间 $O(T^2d)$，显存 $O(T^2)$
- **D.** 时间 $O(T\log T\cdot d)$，显存 $O(T)$

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：$QK^\top$ 是 $(T\times d)(d\times T)$，共 $T^2$ 个长度为 $d$ 的点积，$O(T^2d)$；权重乘 $V$ 同样是 $O(T^2d)$；打分矩阵本身有 $T^2$ 个元素（多头时每头一个 $T\times T$，计算量合计仍是 $O(T^2d)$）。

序列从 4K 拉长到 128K，长度变为 32 倍，打分矩阵变为 1024 倍，这是长上下文昂贵的根源。

- A 错：$O(Td^2)$ 是 Q、K、V、O 投影等线性层的复杂度，整层是 $O(Td^2+T^2d)$。
- B 错：多乘了一个 $d$。
- D 错：标准注意力没有 $T\log T$ 的结构；把显存降到 $O(T)$ 的是 FlashAttention 这类不物化打分矩阵的实现，但它的计算量仍是 $O(T^2d)$。

<sub>考点：注意力复杂度</sub>

</details>

---

<a name="LLM-ATTN-036"></a>

### LLM-ATTN-036　基础 · 考频 ★★

线性注意力（如 Katharopoulos 等, 2020）把 $\mathrm{softmax}(QK^\top)V$ 换成 $\phi(Q)\big(\phi(K)^\top V\big)$（再做归一化），其中 $\phi$ 是逐元素的正值特征映射。它能把复杂度从 $O(T^2d)$ 降到 $O(Td^2)$，关键在于：

- **A.** 把 $T\times T$ 打分矩阵做低秩近似，只保留前 $d$ 个奇异方向，从而把复杂度降到线性
- **B.** 去掉 Softmax 后按结合律先算 $\phi(K)^\top V$，不再构造 $T\times T$ 矩阵
- **C.** 只计算每个 token 与相邻 $d$ 个 token 的注意力，其余位置置零，相当于带状掩码
- **D.** 把序列切成长度为 $d$ 的块，块内做标准注意力、块间不交互，总计算量随 $T$ 线性增长

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：核心是矩阵乘法的结合律。

Softmax 注意力中，$\exp(q\cdot k)$ 不能拆成「只含 $q$ 的部分」乘「只含 $k$ 的部分」，必须先算出全部 $T^2$ 个打分。换成核函数 $\phi(q)^\top\phi(k)$ 后：
$$\big(\phi(Q)\phi(K)^\top\big)V=\phi(Q)\big(\phi(K)^\top V\big)$$
右边先算 $\phi(K)^\top V$（$d\times d_v$，代价 $O(Td\,d_v)$），再左乘 $\phi(Q)$，全程不出现 $T\times T$ 矩阵，复杂度对 $T$ 是线性的。归一化项同理：分母为 $\phi(q_t)^\top\sum_j\phi(k_j)$。论文中取 $\phi(x)=\mathrm{elu}(x)+1$ 以保证非负。

- A 错：那是 Linformer 一类低秩投影方法的思路。
- C 错：那是滑动窗口（局部）注意力。
- D 错：那是分块局部注意力，块间信息无法交互。

<sub>考点：线性注意力　｜　出处：Transformers are RNNs（Katharopoulos 等, 2020）arXiv:2006.16236</sub>

</details>

---

<a name="LLM-ATTN-040"></a>

### LLM-ATTN-040　基础 · 考频 ★★

Encoder-Decoder 模型（如 T5、Whisper）的解码器中，交叉注意力需要使用哪种掩码？

- **A.** 因果掩码：解码器第 $i$ 个位置只能看编码器前 $i$ 个位置，以免提前看到对应的源端内容
- **B.** 不需要任何掩码：编码器输出是完整的源序列，既不存在未来信息，也不存在 padding
- **C.** 沿用解码器自注意力的因果掩码，再叠加解码器一侧的 padding 掩码，保证训练与推理一致
- **D.** 不加因果掩码，每个位置都能看到全部编码器输出，只需屏蔽编码器侧的 padding

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：交叉注意力的 key 是**完整已知**的源序列，不存在「偷看未来」的问题，所以不需要因果掩码；只需要 key padding 掩码，屏蔽编码器输出中的填充位置。

- A 错：解码器第 $i$ 个位置与编码器第 $i$ 个位置没有对应关系（翻译中源句与目标句长度、语序都不同），按位置截断毫无道理；源序列在解码前已完整给出，也不存在需要防止「偷看」的未来信息。
- B 错：批处理时不同输入长度不同，编码器侧必须补齐，padding 位置需要屏蔽，否则会分走注意力权重。
- C 错：因果掩码属于解码器的**自注意力**；交叉注意力只需屏蔽编码器侧的 padding。

<sub>考点：交叉注意力、注意力掩码</sub>

</details>

---

<a name="LLM-ATTN-043"></a>

### LLM-ATTN-043　基础 · 考频 ★★

StreamingLLM（Xiao 等, 2023）研究「窗口注意力」用于超长流式文本时发现：只保留最近 $W$ 个 token 的 KV，一旦序列开头的几个 token 被挤出缓存，困惑度就急剧上升。它的解决办法是：

- **A.** 固定保留开头 4 个 token 的 KV 作为「注意力汇聚点」，其余用最近 token 的滚动窗口
- **B.** 窗口每滑动一步就对窗口内全部 token 重新计算 KV，使每个 token 的表示只依赖窗口内上下文
- **C.** 把被挤出窗口的 token 压缩成一段摘要文本，重新拼接回提示词的开头，保留早期信息
- **D.** 把 RoPE 的 base 调大，使开头 token 被挤出后模型仍能通过外推关注到更远的位置

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：StreamingLLM = 少量 attention sink token + 最近 token 的滚动 KV 缓存，无需训练。

论文观察到，很多层、很多头都会把大量注意力分给开头的几个 token，无论它们的内容是什么，这些 token 被称为 attention sink（注意力汇聚点）。窗口注意力一旦把它们挤出缓存，Softmax 的分布就被打乱，困惑度暴涨。保留 4 个开头 token 的 KV 后，模型可以稳定处理长达数百万 token 的流式输入。

- B 错：这是「滑动窗口 + 重新计算」的基线，效果好但每步都要重算整个窗口，非常慢；StreamingLLM 相比它提速最高约 22 倍。
- C 错：这是 Agent 记忆管理中的摘要思路，不是 StreamingLLM。
- D 错：调大 base 与 attention sink 问题无关，也无法让模型看到已被丢弃的 KV。

<sub>考点：Attention Sink、稀疏与滑动窗口注意力　｜　出处：Efficient Streaming Language Models with Attention Sinks arXiv:2309.17453</sub>

</details>

---

<a name="LLM-ATTN-049"></a>

### LLM-ATTN-049　进阶 · 考频 ★★

大规模训练中常出现注意力 logits 随训练不断增大、Softmax 饱和成 one-hot，进而引发损失尖峰甚至发散。下列做法中，能直接约束注意力 logits 数值范围、缓解这一问题的是：

- **A.** 增大 batch size 以降低梯度噪声，使每步参数更新更平稳，logits 不再持续增大
- **B.** 把 MHA 改成 GQA，让多个 Query 头共享 K，从而平均掉单个头过大的打分
- **C.** 对每个头的 q、k 先做归一化（QK-Norm），或用 tanh 对 logits 做软截断
- **D.** 把 RoPE 的 base 从 10000 调大到 500000，降低高频维度旋转对打分的放大

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：QK-Norm 与 logit 软截断都直接作用于打分的数值范围。

- **QK-Norm**：打分前对每个头的 $q$、$k$ 做归一化（常用 RMSNorm，带可学习缩放），点积的大小被 $\|q\|\|k\|$ 约束住。ViT-22B 用它解决了 logits 发散问题，OLMo 2、Qwen3、Gemma 3 等也采用了它。
- **软截断**：$c\cdot\tanh(z/c)$ 把 logits 平滑地压在 $(-c,c)$ 内。Gemma 2 对注意力 logits 取 $c=50$、对最终输出 logits 取 $c=30$；Gemma 3 改用 QK-Norm 替代了软截断。

- A 错：batch 大小影响梯度噪声，不约束 logits 的尺度。
- B 错：GQA 只是让组内 Query 头共用同一份 K、V，每个 Query 头仍单独计算打分，尺度不受约束。
- D 错：RoPE 是旋转，不改变 $q$、$k$ 的长度；base 只影响各维度的转速。

<sub>考点：数值稳定、缩放因子　｜　出处：Gemma 2 技术报告 arXiv:2408.00118；ViT-22B（Dehghani 等, 2023）</sub>

</details>

---

## 多选题

<a name="LLM-ATTN-002"></a>

### LLM-ATTN-002　进阶 · 考频 ★★★

关于分组查询注意力（GQA），下列说法**正确**的有：

- **A.** KV 头数等于 Query 头数时，GQA 退化为 MHA；KV 头数为 1 时退化为 MQA
- **B.** 把 Query 头分成若干组，同一组内的 Query 头共享一组 K、V
- **C.** 已训练好的 MHA 模型可以把同组的 K、V 投影取平均，再用少量预训练算力继续训练，转换成 GQA
- **D.** GQA 减少了 Query 投影的参数量，这是它节省显存的主要来源
- **E.** 推理时 KV Cache 大小与 KV 头数成正比，因此 GQA 能显著降低 KV Cache

<details>
<summary>答案与解析</summary>

**答案：ABCE**

**解析：**

**结论**：A、B、C、E 正确。GQA 是 MHA 与 MQA 的折中，靠「减少 KV 头数」压缩 KV Cache。

- A 对：组数 = KV 头数，取两个极端分别得到 MHA 和 MQA。
- B 对：这是 GQA 的定义，例如 32 个 Query 头分 8 组，每组 4 个 Query 头共享 1 组 K、V。
- C 对：GQA 论文提出了 uptraining：把同组的 K、V 投影权重取平均作为初始化，再用约 5% 的原预训练算力继续训练，即可把 MHA 模型转换成 GQA，效果接近 MHA、推理速度接近 MQA。
- D 错：Query 头数不变，Query 投影参数也不变；省下的主要是推理时的 KV Cache（以及少量 K、V 投影参数）。
- E 对：每 token 的 KV Cache 为 $2\times L\times n_{kv}\times d_h\times$ 每元素字节数，与 KV 头数 $n_{kv}$ 成正比。Llama-3-8B 用 8 个 KV 头，KV Cache 只有同尺寸 MHA 的 1/4。

<sub>考点：GQA、MQA、KV Cache原理与大小　｜　出处：GQA 论文（Ainslie 等）arXiv:2305.13245</sub>

</details>

---

<a name="LLM-ATTN-026"></a>

### LLM-ATTN-026　挑战 · 考频 ★★

关于 MLA，下列说法**正确**的有：

- **A.** MLA 把 RoPE 直接施加在压缩后的 KV 潜向量上，位置信息因此也能随上投影矩阵一起被吸收
- **B.** 低秩压缩与 KV 量化可以叠加使用：前者减少「存几个数」，后者减少「每个数占几个比特」
- **C.** 推理时通过矩阵吸收直接在潜向量上计算注意力，每读一个字节缓存要做更多计算，这对受带宽限制的 Decode 反而有利
- **D.** MLA 让所有头共享同一份 K、V，与 GQA 原理相同，只是组数更少
- **E.** MLA 的主要收益是减少模型参数量，KV Cache 的减少只是附带效果

<details>
<summary>答案与解析</summary>

**答案：BC**

**解析：**

**结论**：B、C 正确。

- A 错：RoPE 的旋转矩阵随位置变化，夹在 query 与 K 的上投影之间，无法与上投影矩阵合并，直接作用在潜向量（或由它还原的 K）上会破坏矩阵吸收。DeepSeek 因此采用解耦 RoPE：另设一个所有头共享、不经压缩的 64 维 $k^R$ 承载位置信息并直接缓存，相当于在位置部分使用了 MQA。
- B 对：两者正交。MLA 减少每 token 缓存的元素个数，FP8 等 KV 量化减少每个元素的字节数，可以叠加。
- C 对：Decode 的瓶颈是从显存读 KV 的带宽，MLA 用更多的计算换更少的读取，提高了算术强度。
- D 错：MLA 的每个头通过各自的上投影矩阵从同一个潜向量中得到**不同的** K、V，这正是它比 GQA 表达能力强的原因；GQA 则是组内的头直接共用同一份 K、V。
- E 错：MLA 的目标是压缩 KV Cache；它引入了下投影、上投影等矩阵，参数并不会因此显著减少。

<sub>考点：MLA　｜　出处：DeepSeek-V2 技术报告 arXiv:2405.04434</sub>

</details>

---

<a name="LLM-ATTN-035"></a>

### LLM-ATTN-035　进阶 · 考频 ★★

关于稀疏注意力与滑动窗口注意力，下列说法**正确**的有：

- **A.** 窗口为 W 的滑动窗口注意力，单层计算量从 O(T²) 降到 O(TW)，KV Cache 也只需保留最近 W 个
- **B.** GPT-3 沿用 GPT-2 的稠密注意力，与 GPT-2 的差别只在层数、宽度和训练数据规模
- **C.** 把大部分位置在掩码里置为 −∞ 后，Softmax 和矩阵乘会自动跳过这些位置，获得与稀疏度成正比的加速
- **D.** BigBird 在窗口注意力和全局 token 之外，还加入了随机连接
- **E.** Longformer 用滑动窗口加少量「全局 token」，全局 token 能看到所有位置，也被所有位置看到

<details>
<summary>答案与解析</summary>

**答案：ADE**

**解析：**

**结论**：A、D、E 正确。

- A 对：每个 token 只看最近 W 个 token，窗口外的 KV 不会再被用到，可以用滚动缓存丢弃。
- B 错：GPT-3 论文写明它在各层交替使用稠密注意力和局部带状稀疏注意力（类似 Sparse Transformer），这正是它与 GPT-2 在结构上的一处差别。
- C 错：标准内核不会因为掩码值是 −∞ 就跳过计算，用掩码屏蔽仍然要计算完整的 $T\times T$ 打分矩阵，计算量不变。要真正提速，必须用跳过无效块的块稀疏内核，而且稀疏模式最好按块对齐硬件（DeepSeek 的 NSA 强调的「硬件对齐」就是为此）。
- D 对：BigBird 的稀疏模式由窗口、全局、随机三部分组成，论文还从理论上分析了这种稀疏模式的表达能力。
- E 对：Longformer 用滑动窗口（还可加膨胀窗口）处理局部上下文，对分类标记、问题 token 等少数位置使用全局注意力。

<sub>考点：稀疏与滑动窗口注意力　｜　出处：Longformer arXiv:2004.05150；BigBird arXiv:2007.14062</sub>

</details>

---

<a name="LLM-ATTN-042"></a>

### LLM-ATTN-042　进阶 · 考频 ★★

下列模型或模块中，使用了交叉注意力（Q 来自一路输入，K 和 V 来自另一路输入）的有：

- **A.** Flamingo 在冻结的语言模型层之间插入门控交叉注意力层，用来读取视觉特征
- **B.** Whisper 的文本解码器读取音频编码器的输出
- **C.** GPT 类 Decoder-only 语言模型中，后面的 token 读取前面 token 的信息
- **D.** Stable Diffusion 的去噪 U-Net 读取文本编码器输出的文本特征
- **E.** LLaVA-1.5 把视觉特征经 MLP 投影后作为 token 拼接到文本序列中，再由语言模型统一做自注意力

<details>
<summary>答案与解析</summary>

**答案：ABD**

**解析：**

**结论**：A、B、D 使用交叉注意力。

- A 对：Flamingo 冻结视觉编码器和语言模型，在语言模型层间插入新的门控交叉注意力层（gated xattn-dense）来读取视觉信息。
- B 对：Whisper 是 Encoder-Decoder，解码器每层通过交叉注意力读取音频编码。
- C 错：这是因果**自**注意力，Q、K、V 来自同一序列。
- D 对：Stable Diffusion 用交叉注意力把文本条件注入 U-Net：Q 来自图像特征，K、V 来自文本编码。
- E 错：LLaVA 走的是「投影 + 拼接」路线，视觉 token 与文本 token 放在同一序列里做自注意力，没有交叉注意力层。

多模态融合的两条路线各有取舍：交叉注意力让视觉特征不占用语言模型的上下文长度，但要新增参数和层；拼接路线简单、可以直接复用语言模型，但视觉 token 会占用上下文和计算。Llama 3.2 Vision 用的是交叉注意力适配层，LLaVA 系列和多数开源多模态模型用拼接。

<sub>考点：交叉注意力</sub>

</details>

---

<a name="LLM-ATTN-045"></a>

### LLM-ATTN-045　挑战 · 考频 ★

关于 StreamingLLM 与 attention sink，下列说法**正确**的有：

- **A.** Attention sink 只出现在使用 ALiBi 的模型中，使用 RoPE 的模型不会出现这一现象
- **B.** 论文发现预训练时加入一个可学习的 sink token 后，流式推理只保留这一个 token 就有较好效果
- **C.** StreamingLLM 能稳定处理远超训练长度的流式输入，但不扩展有效上下文，被挤出的内容无法再利用
- **D.** 使用前需在长文本上做一轮微调，让模型学会把多余的注意力集中到开头几个 token 上
- **E.** StreamingLLM 给缓存中的 token 分配位置时，沿用它们在原文中的位置，以保持真实的相对距离

<details>
<summary>答案与解析</summary>

**答案：BC**

**解析：**

**结论**：B、C 正确。

- A 错：论文在 Llama-2、Falcon、Pythia（RoPE）和 MPT（ALiBi）等模型上都观察到了 attention sink。
- B 对：论文用预训练实验验证了专门 sink token 的作用。
- C 对：论文明确说明它不扩展上下文窗口，也不增强长期记忆，只保证「最近的内容 + sink」下的稳定生成；需要用到早期细节的任务（如对长文档提问）不适合用它解决。
- D 错：StreamingLLM 不需要训练或微调；attention sink 是预训练模型本来就有的现象，直接保留开头 token 的 KV 即可。
- E 错：论文使用的是 token 在**缓存内**的位置，而不是在原文中的位置。例如缓存里是第 0～3 个 token 和第 6～8 个 token，位置会被重新编号为 0～6。若沿用原文位置，随着流式输入变长，sink 与最近 token 之间的相对距离会超出训练范围，模型同样会失效。实现上缓存的是施加 RoPE **之前**的 K，每步按缓存内位置重新施加旋转。

<sub>考点：Attention Sink　｜　出处：Efficient Streaming Language Models with Attention Sinks arXiv:2309.17453</sub>

</details>

---

<a name="LLM-ATTN-050"></a>

### LLM-ATTN-050　进阶 · 考频 ★★

关于注意力计算中的数值稳定，下列说法**正确**的有：

- **A.** 混合精度下的常见实现会把注意力 Softmax 放在 FP32 下计算，再把权重转回半精度
- **B.** 减去行最大值后各指数项落在 $(0,1]$ 内，因此既不会上溢，也不会有概率下溢为 0
- **C.** Softmax 先减去每行最大值再求指数，结果与原式在数学上完全等价
- **D.** FlashAttention 分块计算时为每行维护当前最大值与指数和，最大值变大时重新缩放已累加结果
- **E.** FP16 最大值约 65504，$e^{z}$ 在 $z$ 超过约 11 时溢出；BF16 指数范围同 FP32，阈值约 88.7

<details>
<summary>答案与解析</summary>

**答案：ACDE**

**解析：**

**结论**：A、C、D、E 正确。

- A 对：例如 Hugging Face 的 Llama 实现以 `softmax(..., dtype=torch.float32)` 计算后再转回 Q 的精度；FlashAttention 内部也用 FP32 累加 Softmax 统计量。
- B 错：指数项落在 $(0,1]$ 内只保证不**上溢**；与最大值相差很多的项（如差 200）在 FP32 下仍会下溢为 0。这通常无害，因为这些权重本来就可以忽略。
- C 对：$\mathrm{softmax}(z-c)=\mathrm{softmax}(z)$ 对任意常数 $c$ 成立。
- D 对：这就是 online softmax。处理新的 K 块时，若行最大值从 $m$ 变为更大的 $m'$，就把已累加的指数和与输出都乘以 $e^{m-m'}$ 再继续累加，最后统一除以指数和。这样既不必保存完整的打分矩阵，又始终是「减最大值」的稳定形式，结果与标准 Softmax 一致。
- E 对：$\ln65504\approx11.09$；BF16 与 FP32 的最大值都约为 $3.4\times10^{38}$，$\ln(3.4\times10^{38})\approx88.7$。

补充：用 `torch.finfo(dtype).min` 代替 $-\infty$ 作掩码值时，若一整行都被屏蔽（如 padding 行），减去最大值后全为 0，Softmax 输出的是均匀分布而不是 NaN；用 $-\infty$ 才会出现 $-\infty-(-\infty)$ 得到 NaN。这些行的输出通常会被丢弃，所以均匀分布无害。

<sub>考点：数值稳定、注意力掩码　｜　出处：FlashAttention arXiv:2205.14135；Milakov 与 Gimelshein, Online normalizer calculation for softmax, arXiv:1805.02867</sub>

</details>

---

## 判断题

<a name="LLM-ATTN-003"></a>

### LLM-ATTN-003　基础 · 考频 ★★★

MQA 让所有 Query 头共享同一组 K、V，但推理时每个头仍要单独缓存 K、V，所以 KV Cache 的大小与 MHA 相同。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。MQA 只有 1 组 K、V，推理时也只缓存这一组，KV Cache 是 MHA 的 $1/h$（$h$ 为 Query 头数）。这正是 MQA 的设计动机：自回归解码时每一步都要从显存读取全部 KV Cache，缓存越小，带宽压力越小、能容纳的并发越多。代价是表达能力下降，效果通常略差于 MHA，因此后来出现了折中的 GQA。

<sub>考点：MQA、KV Cache原理与大小</sub>

</details>

---

<a name="LLM-ATTN-019"></a>

### LLM-ATTN-019　基础 · 考频 ★★

在 $d_{model}$ 固定时，头数越多，每个头的维度 $d_h=d_{model}/h$ 越小；而无论序列多长，单个头的打分矩阵 $Q_hK_h^\top$ 的秩都不会超过 $d_h$，所以头数过多会形成低秩瓶颈，头数并不是越多越好。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。$Q_h$ 是 $T\times d_h$，$K_h^\top$ 是 $d_h\times T$，乘积的秩不超过 $\min(T,d_h)$。当 $d_h$ 远小于序列长度时，单个头能表达的注意力模式受限，这一问题被称为多头注意力的「低秩瓶颈」（Bhojanapalli 等, 2020）。

所以实践中头维度一般取 64 或 128，模型变大时增加头数而不是缩小 $d_h$。此外，训练好的模型里有不少头剪掉后几乎不掉点（Michel 等, 2019），说明头数也存在冗余。推理时 KV Cache 与 KV 头数成正比，这又是 GQA 减少 KV 头的动机。

<sub>考点：多头注意力　｜　出处：Bhojanapalli 等, Low-Rank Bottleneck in Multi-head Attention Models, arXiv:2002.07028；Michel 等, Are Sixteen Heads Really Better than One?, arXiv:1905.10650</sub>

</details>

---

<a name="LLM-ATTN-031"></a>

### LLM-ATTN-031　基础 · 考频 ★★★

FlashAttention 通过分块与 online softmax 把标准注意力的时间复杂度从 $O(T^2)$ 降到了 $O(T)$，因此它是一种近似注意力。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**，这句话有两处错。

1. FlashAttention **不改变计算量**：仍要计算全部 $T^2$ 个打分，时间复杂度仍是 $O(T^2d)$（反向时还会重算注意力矩阵，FLOPs 略多）。它降低的是**显存读写量**和**额外显存**：不把 $T\times T$ 矩阵写回 HBM，额外显存从 $O(T^2)$ 降到 $O(T)$。
2. FlashAttention 是**精确**的：结果与标准注意力在浮点误差范围内一致，不是近似。

它更快的原因是 IO 感知：GPU 上标准注意力的瓶颈往往是显存带宽而不是算力，减少 HBM 读写就能明显提速。真正改变复杂度的是滑动窗口、稀疏注意力、线性注意力等改变了数学形式的方法，它们会带来近似或表达能力上的代价。

<sub>考点：注意力复杂度　｜　出处：FlashAttention 论文 arXiv:2205.14135</sub>

</details>

---

<a name="LLM-ATTN-037"></a>

### LLM-ATTN-037　进阶 · 考频 ★★

因果线性注意力可以写成 RNN 形式：维护状态 $S_t=S_{t-1}+\phi(k_t)v_t^\top$ 与 $z_t=z_{t-1}+\phi(k_t)$，输出 $o_t=\dfrac{S_t^\top\phi(q_t)}{z_t^\top\phi(q_t)}$。因此无论已经生成了多少个 token，推理时每生成一个 token 的计算量和需要保存的状态大小都保持不变。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。因果掩码下第 $t$ 个输出只累加 $j\le t$ 的项：
$$\sum_{j\le t}\phi(q_t)^\top\phi(k_j)\,v_j=\Big(\sum_{j\le t}\phi(k_j)v_j^\top\Big)^{\!\top}\phi(q_t)=S_t^\top\phi(q_t)$$
$S_t$ 是 $d\times d_v$ 的矩阵、$z_t$ 是 $d$ 维向量，大小固定，每步更新与读取都是 $O(d\,d_v)$。这正是论文标题「Transformers are RNNs」的含义。

对比 Softmax 注意力：KV Cache 随长度线性增长，单步注意力是 $O(t\cdot d)$。线性注意力的代价是把全部历史压缩进固定大小的状态，精确回忆能力较弱；后续的 RetNet、GLA、Mamba-2 等加入了衰减或门控来更好地管理这份状态。

<sub>考点：线性注意力</sub>

</details>

---

<a name="LLM-ATTN-041"></a>

### LLM-ATTN-041　基础 · 考频 ★★

Encoder-Decoder 模型自回归解码时，交叉注意力的 K、V 只依赖编码器输出，无论解码进行到哪一步都保持不变，因此可以在解码开始前为每一层一次算好并缓存，之后每一步只需要为新 token 计算交叉注意力的 Q。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。每个解码器层的交叉注意力 $K=H_{enc}W^K$、$V=H_{enc}W^V$ 只取决于编码器输出 $H_{enc}$，而编码器输出在整个解码过程中不变，所以可以一次算好缓存起来（Hugging Face 中称为 cross-attention cache）。

于是 Encoder-Decoder 解码时有两份缓存：自注意力的 KV Cache 随生成长度增长；交叉注意力的 KV Cache 大小固定，由输入长度决定。以 Whisper 为例，30 秒音频经编码器后是 1500 个位置，每一层的交叉注意力 K、V 只需计算一次。若每步都重新计算，就是大量的冗余计算。

<sub>考点：交叉注意力、KV Cache原理与大小</sub>

</details>

---

<a name="LLM-ATTN-044"></a>

### LLM-ATTN-044　进阶 · 考频 ★★

大模型普遍把大量注意力分配给序列开头的几个 token（attention sink），这是因为开头的 token（如 BOS 或系统提示的第一句话）通常包含整段文本最重要的语义信息。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。Attention sink 主要与**位置**有关，而不是语义。

机制上的解释：Softmax 的权重之和必须为 1。当一个头在当前位置「没有什么需要关注」时，它仍然必须把权重放在某处。在因果语言模型中，开头的 token 对之后**所有**位置都可见，训练中就逐渐变成了存放多余注意力的默认位置，相当于一个影响很小的「停放处」。

证据：StreamingLLM 论文把开头的 4 个 token 换成换行符「\n」，保留它们同样能恢复困惑度，说明起作用的是绝对位置而不是内容。

相关改进：预训练时加入专门的可学习 sink token；在 Softmax 分母中加一个可学习的常数项（类似「off-by-one」Softmax），让注意力可以「什么都不看」。OpenAI 在 2025 年 8 月发布的 gpt-oss 就为每个头引入了可学习的 sink 项。

<sub>考点：Attention Sink　｜　出处：Efficient Streaming Language Models with Attention Sinks arXiv:2309.17453</sub>

</details>

---

## 填空题

<a name="LLM-ATTN-004"></a>

### LLM-ATTN-004　进阶 · 考频 ★★★

Llama-3-8B 有 32 层、8 个 KV 头、每头维度 128。用 BF16（2 字节）存储时，每个 token 的 KV Cache 为 ____ KiB；8K（8192）个 token 的一条序列共需 ____ GiB。

<details>
<summary>答案与解析</summary>

**答案：** (1) 128；(2) 1

**解析：**

每 token 的 KV Cache = $2$（K 和 V）$\times L \times n_{kv} \times d_h \times$ 字节数
$=2\times32\times8\times128\times2=131072$ 字节 $=128$ KiB。

8192 个 token：$128\ \text{KiB}\times8192=1\ \text{GiB}$。

对比：若同样的模型用 MHA（32 个 KV 头），每 token 为 512 KiB，8K 序列要 4 GiB。这就是 GQA 让长上下文与高并发成为可能的原因。

<sub>考点：KV Cache原理与大小、GQA</sub>

</details>

---

<a name="LLM-ATTN-012"></a>

### LLM-ATTN-012　进阶 · 考频 ★★

设 $q$、$k$ 的各分量相互独立、均值为 0、方差都为 2，头维度 $d_k=64$。则点积 $q\cdot k$ 的标准差为 ____；按标准做法除以 $\sqrt{d_k}$ 之后，打分的标准差为 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 16；(2) 2

**解析：**

**推导**：$q_i$ 与 $k_i$ 独立且均值为 0，所以 $\mathrm{Var}(q_ik_i)=E[q_i^2]\,E[k_i^2]=2\times2=4$；64 项独立相加，$\mathrm{Var}(q\cdot k)=64\times4=256$，标准差为 **16**。除以 $\sqrt{64}=8$ 后标准差为 **2**。

一般地，$\mathrm{std}(q\cdot k)=\sigma_q\sigma_k\sqrt{d_k}$，除以 $\sqrt{d_k}$ 只消除了「随维度增长」的那部分，结果是 $\sigma_q\sigma_k$。所以「缩放后方差为 1」依赖于各分量方差约为 1 的假设：归一化层和合适的初始化让训练初期大致满足这一点。训练过程中 $q$、$k$ 的范数可能持续变大，logits 仍会增长，这就是后来需要 QK-Norm、logit 软截断等手段的原因。

<sub>考点：缩放因子</sub>

</details>

---

<a name="LLM-ATTN-024"></a>

### LLM-ATTN-024　进阶 · 考频 ★★

DeepSeek-V2 的 MLA 每层每个 token 缓存 $d_c+d_h^R=512+64=576$ 个数。若用头维度 $d_h=128$ 的 GQA 达到相同的缓存量（每组缓存 K、V 各 $d_h$ 维），相当于 ____ 组 GQA；而它的 128 个注意力头若使用 MHA（K、V 头维度都按 128 计），每层每个 token 需缓存 ____ 个数。

<details>
<summary>答案与解析</summary>

**答案：** (1) 2.25 / 2.25 组；(2) 32768

**解析：**

- GQA 每层每 token 缓存 $2\times n_g\times d_h$ 个数，令 $2\times n_g\times128=576$，得 $n_g=$ **2.25**。DeepSeek-V2 论文正是用「相当于只有 2.25 组的 GQA」来描述 MLA 的缓存量。
- MHA：$2\times128\times128=$ **32768**，约为 MLA 的 57 倍。

关键在于：GQA 靠「多个头共享同一份 K、V」省缓存，组数越少头间差异越被抹平；MLA 的缓存量只相当于 2.25 组 GQA，但每个头仍能从潜向量中还原出各自不同的 K、V，论文的消融实验中效果不弱于 MHA。

<sub>考点：MLA、GQA　｜　出处：DeepSeek-V2 论文 arXiv:2405.04434</sub>

</details>

---

<a name="LLM-ATTN-033"></a>

### LLM-ATTN-033　进阶 · 考频 ★★

Mistral 7B（v0.1）在每一层使用窗口 $W=4096$ 的滑动窗口注意力，共 32 层。信息可以逐层向前传递，所以最后一层理论上能「间接」覆盖的范围约为 ____ 个 token。推理时它使用大小固定为 $W$ 的滚动缓存（rolling buffer），第 $i$ 个 token（从 0 开始计数）的 K、V 存放在缓存的第 ____ 个位置。

<details>
<summary>答案与解析</summary>

**答案：** (1) 131072 / 131K / 约13万 / 32×4096；(2) i mod 4096 / i % 4096 / i mod W / i % W

**解析：**

- **理论感受野**：每一层每个 token 最多向前看 $W$ 个位置，经过 $k$ 层，信息最多可以向前传递 $k\times W$ 个位置：$32\times4096=131072$，约 131K。Mistral 7B 论文给出的正是这个数字。
- **滚动缓存**：缓存大小固定为 $W$，第 $i$ 个 token 的 K、V 写到 `i mod W` 处，超过 $W$ 之后覆盖最旧的条目。论文指出，序列长度为 32K 时缓存显存降为 1/8，而模型质量不受影响。

注意「理论感受野」不等于能精确检索那么远的信息：窗口外的内容只能经过多层逐步「转述」，远距离的精确回忆远不如全注意力。Mistral 后续版本（v0.2 起）去掉了滑动窗口，改用 32K 全注意力。

<sub>考点：稀疏与滑动窗口注意力　｜　出处：Mistral 7B 论文 arXiv:2310.06825</sub>

</details>

---

## 计算题

<a name="LLM-ATTN-006"></a>

### LLM-ATTN-006　进阶 · 考频 ★★★

Llama-2-7B 使用 MHA：32 层，32 个头，每头维度 128，KV Cache 用 FP16 存储。若同时服务 batch = 8 条请求，每条上下文长度 4096，KV Cache 一共需要多少显存？它与模型权重（约 6.7B 参数，FP16）相比如何？

<details>
<summary>答案与解析</summary>

**答案：约 16 GiB，超过模型权重本身（约 12.5 GiB）**

**解析：**

1. 每 token 每层：K、V 各 $32\times128=4096$ 个元素，共 $2\times4096=8192$ 个元素；
2. 每 token 32 层：$8192\times32=262144$ 个元素，FP16 每个 2 字节，即 $524288$ 字节 $=512$ KiB；
3. 每条 4096 token：$512\ \text{KiB}\times4096=2$ GiB；
4. batch = 8：$2\times8=$ **16 GiB**。

模型权重：$6.7\times10^9\times2\approx1.34\times10^{10}$ 字节 $\approx12.5$ GiB。

结论：在长上下文、大 batch 下，KV Cache 很容易超过权重本身，成为显存的大头。这正是 GQA / MLA、KV 量化、PagedAttention 等技术的出发点。

<sub>考点：KV Cache原理与大小</sub>

</details>

---

<a name="LLM-ATTN-023"></a>

### LLM-ATTN-023　进阶 · 考频 ★★

DeepSeek-V3 共 61 层、每层 128 个注意力头，采用 MLA：每层每个 token 只缓存 512 维的 KV 潜向量和 64 维带 RoPE 的共享 key。若改用标准 MHA，每个头的 K 为 192 维（128 维内容 + 64 维 RoPE）、V 为 128 维。按 BF16（2 字节）计算：
(1) MLA 每个 token 的 KV Cache 多大？
(2) MHA 每个 token 的 KV Cache 多大？两者相差多少倍？
(3) 一条 128K（131072）token 的序列，MLA 与 MHA 分别需要多少 KV Cache？

<details>
<summary>答案与解析</summary>

**答案：(1) 约 68.6 KiB；(2) 4880 KiB（约 4.77 MiB），约 71 倍；(3) MLA 约 8.6 GiB，MHA 约 610 GiB**

**解析：**

**(1) MLA**：每层每 token $512+64=576$ 个数，$61\times576\times2=70{,}272$ 字节 $\approx68.6$ KiB。

**(2) MHA**：每层每 token $128\times(192+128)=40{,}960$ 个数，$61\times40960\times2=4{,}997{,}120$ 字节 $=4880$ KiB。比值 $40960/576\approx71$。

**(3) 128K 序列**：MLA $70272\times131072\approx9.21\times10^{9}$ 字节 $\approx8.6$ GiB；MHA $4880\ \text{KiB}\times131072=610$ GiB，单机 8 卡都放不下一条序列。

MLA 的压缩来自「只缓存低秩潜向量」：512 维的 $c_t$ 由各头的上投影矩阵还原出 K、V，推理时这些上投影可以吸收进 Query 一侧和输出矩阵，不必真的解压。这也是 DeepSeek-V3 能以较低成本提供 128K 上下文的关键之一。

<sub>考点：MLA、KV Cache原理与大小　｜　出处：DeepSeek-V3 技术报告 arXiv:2412.19437</sub>

</details>

---

<a name="LLM-ATTN-029"></a>

### LLM-ATTN-029　进阶 · 考频 ★★

某模型每层 32 个注意力头，打分矩阵用 FP16 存储。若用不分块的朴素实现，对一条 32K（32768）token 的序列做 Prefill，单层所有头的打分矩阵一共要占多少显存？序列为 8K（8192）时呢？这说明了什么？

<details>
<summary>答案与解析</summary>

**答案：32K 时 64 GiB，8K 时 4 GiB；打分矩阵随长度平方增长，长上下文必须使用 FlashAttention 等不物化完整打分矩阵的实现**

**解析：**

- 32K：$32768^2\times32\times2$ 字节 $=68{,}719{,}476{,}736$ 字节 $=$ **64 GiB**，单层就接近一张 80 GB 显卡的容量；Softmax 的输出还要再占同样大小。
- 8K：$8192^2\times32\times2$ 字节 $=$ **4 GiB**。长度变为 4 倍，显存变为 16 倍。

结论：朴素实现的显存是 $O(T^2)$，长上下文下根本放不下。FlashAttention 把 Q、K、V 分块搬进片上 SRAM，用 online softmax 边算边归一化，从不把 $T\times T$ 矩阵写回显存，额外显存降到 $O(T)$，结果与标准注意力一致。推理引擎还会配合分块 Prefill（chunked prefill）控制单次处理的长度。

<sub>考点：注意力复杂度</sub>

</details>

---

<a name="LLM-ATTN-030"></a>

### LLM-ATTN-030　挑战 · 考频 ★

估算一层 Transformer 的前向 FLOPs：线性部分（Q、K、V、O 投影与 FFN，参数约 $12d^2$）每个 token 约 $24d^2$ FLOPs；注意力打分部分（$QK^\top$ 与权重乘 $V$）在不利用因果掩码节省计算时，每个 token 约 $4Td$ FLOPs（$T$ 为序列长度）。
(1) 序列长度 $T$ 为多少时两部分相等？
(2) 对 $d=4096$（如 Llama-2-7B）和 $d=12288$（如 GPT-3）分别是多少？
(3) 若利用因果掩码只计算一半的打分，临界长度变为多少？

<details>
<summary>答案与解析</summary>

**答案：(1) T = 6d；(2) d=4096 时 24576，d=12288 时 73728；(3) T = 12d，分别为 49152 和 147456**

**解析：**

**(1)** 令 $24d^2=4Td$，得 $T=6d$。

**(2)** $d=4096$：$T=24576$（约 24K）；$d=12288$：$T=73728$（约 72K）。

**(3)** 只算下三角时每 token 约 $2Td$，令 $24d^2=2Td$ 得 $T=12d$：$d=4096$ 时 49152，$d=12288$ 时 147456。

**含义**：
- 每 token 的线性部分与 $d^2$ 成正比，注意力部分与 $Td$ 成正比，二者之比约为 $T/(6d)$（或因果时的 $T/(12d)$）。模型越宽，注意力占比越低，越大的模型越「不怕」长上下文的计算量。
- 对 7B 级模型，4K～8K 上下文时注意力只占一小部分；超过 32K 后它会成为主要开销，这正是稀疏注意力、线性注意力等方法在长上下文下才显出价值的原因。

<sub>考点：注意力复杂度</sub>

</details>

---

<a name="LLM-ATTN-034"></a>

### LLM-ATTN-034　进阶 · 考频 ★

Gemma 3 采用「每 5 个局部滑动窗口层配 1 个全局注意力层」的交替结构，局部层窗口为 1024，上下文长度 128K。假设各层的 KV 头数与头维度相同，忽略层数不能被 6 整除的零头，局部层只缓存窗口内的 KV。处理一条 128K（131072）token 的序列时：
(1) 全部 KV Cache 相当于「所有层都用全局注意力」时的百分之几？
(2) 若在同样 128K 长度下改用局部、全局 1:1 交替且局部窗口为 4096 的结构（Gemma 2 的做法），又是多少？
(3) 这类结构的 KV Cache 下限由什么决定？

<details>
<summary>答案与解析</summary>

**答案：(1) 约 17.3%；(2) 约 51.6%；(3) 由全局层的占比决定（5:1 时下限约 1/6 ≈ 16.7%）**

**解析：**

**(1)** 6 层一组：5 个局部层各缓存 1024 个 token，1 个全局层缓存全部 131072 个 token：
$$\frac{5\times1024+131072}{6\times131072}=\frac{136192}{786432}\approx17.3\%$$

**(2)** 2 层一组：$\dfrac{4096+131072}{2\times131072}=\dfrac{135168}{262144}\approx51.6\%$。

**(3)** 序列很长时局部层的缓存可以忽略，比例趋近于「全局层占比」：5:1 时约 $1/6\approx16.7\%$，1:1 时约 50%。所以想继续压缩 KV Cache，要么减少全局层，要么缩小全局层本身的缓存（GQA、MLA、KV 量化）。

取舍：全局层越少，远距离精确检索能力越依赖少数几层，需要用长上下文评测验证。Gemma 3 还让全局层和局部层使用不同的 RoPE base（全局层更大），以适应各自的距离范围。

<sub>考点：稀疏与滑动窗口注意力、KV Cache原理与大小　｜　出处：Gemma 3 技术报告；Gemma 2 技术报告 arXiv:2408.00118</sub>

</details>

---

## 代码输出题

<a name="LLM-ATTN-007"></a>

### LLM-ATTN-007　进阶 · 考频 ★★

下面的代码对全 0 的打分矩阵施加因果掩码后做 Softmax，输出是什么？

```python
import torch

scores = torch.zeros(3, 3)
future = torch.ones(3, 3, dtype=torch.bool).triu(1)
w = torch.softmax(scores.masked_fill(future, float("-inf")), dim=-1)
print(w[0].tolist())
print([round(x, 2) for x in w[2].tolist()])
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
[1.0, 0.0, 0.0]
[0.33, 0.33, 0.33]
```

**解析：**

`triu(1)` 生成严格上三角为 True 的矩阵，即「未来位置」。这些位置被填成 $-\infty$，Softmax 后权重为 0。

- 第 0 行只能看到第 0 个位置，权重 `[1.0, 0.0, 0.0]`；
- 第 2 行能看到全部 3 个位置，打分都是 0，所以平均分配，约为 `[0.33, 0.33, 0.33]`。

延伸：如果某一行**全部**被屏蔽（例如整行都是 padding），Softmax 的输入全是 $-\infty$，会得到 NaN。工程上常用一个很大的负数（如 `-1e9`）代替 $-\infty$，或对全屏蔽行单独处理。

<sub>考点：注意力掩码、缩放点积注意力</sub>

</details>

---

<a name="LLM-ATTN-016"></a>

### LLM-ATTN-016　进阶 · 考频 ★★

带 KV Cache 的解码中，本步有 $T_q=2$ 个新 token 作为 query，缓存里连同它们一共有 $T_k=5$ 个 key（新 token 位于末尾）。下面的代码按两种方式构造因果掩码（True 表示屏蔽）。输出是什么？

```python
import torch

Tq, Tk = 2, 5
right = torch.ones(Tq, Tk, dtype=torch.bool).triu(Tk - Tq + 1)
left = torch.ones(Tq, Tk, dtype=torch.bool).triu(1)
print(right.int().tolist())
print(left.int().tolist())
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
[[0, 0, 0, 0, 1], [0, 0, 0, 0, 0]]
[[0, 1, 1, 1, 1], [0, 0, 1, 1, 1]]
```

**解析：**

`triu(k)` 把第 $k$ 条对角线及其右上方置为 True。

- `right` 用偏移 $T_k-T_q+1=4$：两个 query 的绝对位置是 3 和 4，位置 3 只屏蔽 key 4，位置 4 什么都不屏蔽。这是**右下角对齐**的因果掩码，是增量解码时的**正确**写法。
- `left` 用偏移 1：相当于把两个 query 当成位置 0 和 1，结果把早已存在的历史 key 也屏蔽了，是错误的。

PyTorch 的 `F.scaled_dot_product_attention(..., is_causal=True)` 在 $T_q\ne T_k$ 时按**左上角**对齐，相当于 `left`，所以带缓存解码时不要直接用它：$T_q=1$ 时干脆不加因果掩码（单个新 token 本来就能看到全部历史），$T_q>1$（如投机解码验证、分块 prefill）时自己构造右下角对齐的掩码，或使用 `torch.nn.attention.bias.causal_lower_right`。FlashAttention 2 在 $T_q\ne T_k$ 时默认按右下角对齐。

<sub>考点：注意力掩码、KV Cache原理与大小</sub>

</details>

---

<a name="LLM-ATTN-047"></a>

### LLM-ATTN-047　基础 · 考频 ★★

下面的代码分别用「直接求指数」和「先减去最大值」两种方式计算 Softmax。输出是什么？

```python
import torch

z = torch.tensor([1000.0, 1001.0, 1002.0])
naive = torch.exp(z) / torch.exp(z).sum()
stable = torch.exp(z - z.max()) / torch.exp(z - z.max()).sum()
print(naive.tolist())
print([round(p, 4) for p in stable.tolist()])
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
[nan, nan, nan]
[0.09, 0.2447, 0.6652]
```

**解析：**

- **直接求指数**：FP32 能表示的最大值约 $3.4\times10^{38}$，$e^x$ 在 $x>88.7$ 左右就溢出成 inf。$e^{1000}$ 是 inf，inf / inf 得到 NaN，三个位置全是 NaN。
- **先减最大值**：对任意常数 $c$，$\mathrm{softmax}(z)=\mathrm{softmax}(z-c)$。取 $c=\max z$ 后指数都不超过 0，最大项恰为 $e^0=1$，分母至少为 1，既不会上溢也不会除以 0。$\mathrm{softmax}([-2,-1,0])\approx[0.0900, 0.2447, 0.6652]$，`round(0.0900, 4)` 打印为 `0.09`。

FP16 的最大值只有约 65504，$e^x$ 在 $x>11.09$ 时就溢出，所以混合精度下这个技巧更是必不可少。`torch.softmax` 内部已经做了减最大值；手写注意力或 online softmax 时要自己处理。

<sub>考点：数值稳定</sub>

</details>

---

## 代码填空题

<a name="LLM-ATTN-009"></a>

### LLM-ATTN-009　进阶 · 考频 ★★★

GQA 中，KV 头数少于 Query 头数，计算注意力前需要把每个 KV 头复制给它所在组的所有 Query 头。补全 `repeat_kv`：输入 `(B, n_kv, T, d)`，输出 `(B, n_kv * n_rep, T, d)`，要求第 $i$ 个 KV 头复制后连续占据第 $i\cdot n_{rep}$ 到 $(i+1)\cdot n_{rep}-1$ 个位置。

```python
import torch

def repeat_kv(x: torch.Tensor, n_rep: int) -> torch.Tensor:
    return x.____(n_rep, dim=____)
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `repeat_interleave`；(2) `1`

**解析：**

答案是 `x.repeat_interleave(n_rep, dim=1)`：在头维度（第 1 维）上把每个 KV 头**连续**复制 `n_rep` 次，得到 `[h0, h0, h0, h1, h1, h1]`，正好对应「Query 头 0～2 用 KV 头 0，Query 头 3～5 用 KV 头 1」的分组方式。

常见错误是写成 `x.repeat(1, n_rep, 1, 1)`：它把整组头平铺复制，得到 `[h0, h1, h0, h1, h0, h1]`，Query 头与 KV 头的对应关系就错了。形状虽然正确，结果却不对，这类 bug 很难通过形状检查发现。

<sub>考点：GQA</sub>

</details>

---

## 代码改错题

<a name="LLM-ATTN-008"></a>

### LLM-ATTN-008　进阶 · 考频 ★★★

下面的因果注意力实现有一个 bug，导致输出与标准实现不一致。请指出问题并修正。

```python
import math
import torch

def causal_attention(q, k, v):
    T, d = q.shape
    scores = q @ k.T / math.sqrt(d)
    w = torch.softmax(scores, dim=-1)
    mask = torch.ones(T, T, dtype=torch.bool).triu(1)
    w = w.masked_fill(mask, 0.0)
    return w @ v, w
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：掩码加在了 Softmax **之后**（第 7～9 行）。先对全部位置做 Softmax，再把未来位置的权重置 0，剩下的权重之和小于 1，且分布已被未来位置「污染」。

**修正**：在 Softmax **之前**把未来位置的打分置为 $-\infty$：

```python
mask = torch.ones(T, T, dtype=torch.bool).triu(1)
scores = scores.masked_fill(mask, float("-inf"))
w = torch.softmax(scores, dim=-1)
```

**修正后的代码：**

```python
import math
import torch

def causal_attention(q, k, v):
    T, d = q.shape
    scores = q @ k.T / math.sqrt(d)
    mask = torch.ones(T, T, dtype=torch.bool).triu(1)
    scores = scores.masked_fill(mask, float("-inf"))
    w = torch.softmax(scores, dim=-1)
    return w @ v, w
```

**解析：**

Softmax 的归一化是在「允许看的位置」上进行的。先置 $-\infty$ 再 Softmax，被屏蔽位置的 $e^{-\infty}=0$，不参与归一化，剩下的权重和恰好为 1。先 Softmax 再置 0，分母里包含了未来位置，结果既不归一化，也与标准实现不一致。这是面试手写 Attention 时最常见的错误之一。

<sub>考点：注意力掩码、缩放点积注意力</sub>

</details>

---

## 编程题

<a name="LLM-ATTN-010"></a>

### LLM-ATTN-010　挑战 · 考频 ★★★

用 numpy 实现带因果掩码的多头自注意力前向计算：

```python
def mha_forward(x, Wq, Wk, Wv, Wo, n_heads, causal=True): ...
```

- `x`：形状 `(T, D)`；`Wq`、`Wk`、`Wv`、`Wo`：形状 `(D, D)`；
- `D` 能被 `n_heads` 整除，每个头的维度 `d = D // n_heads`；
- 返回形状 `(T, D)` 的输出；要求向量化实现（不对头做 Python 循环），Softmax 需数值稳定。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import numpy as np

def mha_forward(x, Wq, Wk, Wv, Wo, n_heads, causal=True):
    T, D = x.shape
    d = D // n_heads

    def split(m):                          # (T, D) -> (H, T, d)
        return m.reshape(T, n_heads, d).transpose(1, 0, 2)

    q, k, v = split(x @ Wq), split(x @ Wk), split(x @ Wv)
    scores = q @ k.transpose(0, 2, 1) / np.sqrt(d)          # (H, T, T)
    if causal:
        scores = scores + np.triu(np.full((T, T), -np.inf), k=1)
    scores = scores - scores.max(axis=-1, keepdims=True)    # 数值稳定
    w = np.exp(scores)
    w = w / w.sum(axis=-1, keepdims=True)
    out = (w @ v).transpose(1, 0, 2).reshape(T, D)          # 拼接各头
    return out @ Wo
```

**测试用例：**

```python
rng = np.random.default_rng(0)
T, D, H = 5, 8, 2
x = rng.normal(size=(T, D))
Wq, Wk, Wv, Wo = (rng.normal(size=(D, D)) for _ in range(4))
out = mha_forward(x, Wq, Wk, Wv, Wo, H)
assert out.shape == (T, D)

# 因果性：修改最后一个 token，不影响前面位置的输出
x2 = x.copy()
x2[-1] += 10
assert np.allclose(out[:-1], mha_forward(x2, Wq, Wk, Wv, Wo, H)[:-1])

# 与逐头循环的朴素实现对拍
def naive(x):
    d = D // H
    q, k, v = x @ Wq, x @ Wk, x @ Wv
    heads = []
    for h in range(H):
        sl = slice(h * d, (h + 1) * d)
        s = q[:, sl] @ k[:, sl].T / np.sqrt(d) + np.triu(np.full((T, T), -np.inf), 1)
        w = np.exp(s - s.max(-1, keepdims=True))
        heads.append((w / w.sum(-1, keepdims=True)) @ v[:, sl])
    return np.concatenate(heads, -1) @ Wo
assert np.allclose(out, naive(x))

# 数值稳定：输入很大时不出现 NaN
assert np.isfinite(mha_forward(x * 1e3, Wq, Wk, Wv, Wo, H)).all()
```

**解析：**

**思路**：
1. 一次矩阵乘得到 Q、K、V，再把最后一维拆成 `(H, d)` 并把头维移到最前，得到 `(H, T, d)`；
2. 批量矩阵乘得到每个头的打分 `(H, T, T)`，除以 $\sqrt{d}$；
3. 因果掩码：上三角（不含对角线）加 $-\infty$；
4. 减去每行最大值再求指数，避免溢出（这一步不改变 Softmax 的结果）；
5. 加权求和后把头维移回去、拼接成 `(T, D)`，最后乘输出投影 $W_O$。

**复杂度**：时间 $O(T^2D + TD^2)$，注意力矩阵占 $O(HT^2)$ 空间。

**易错点**：拆头时直接 `reshape(n_heads, T, d)` 会打乱数据（必须先 `reshape(T, H, d)` 再转置）；缩放用每个头的维度 $d$ 而不是 $D$；掩码要在 Softmax 之前加。

<sub>考点：多头注意力、注意力掩码、数值稳定</sub>

</details>

---

<a name="LLM-ATTN-038"></a>

### LLM-ATTN-038　挑战 · 考频 ★★

用 numpy 实现因果线性注意力的**递推形式**：

```python
def causal_linear_attention(Q, K, V): ...
```

- `Q`、`K` 形状 `(T, d)`，`V` 形状 `(T, dv)`；特征映射 $\phi(x)=\mathrm{elu}(x)+1$，即 $x>0$ 时为 $x+1$，否则为 $e^x$；
- 第 $t$ 个输出 $o_t=\dfrac{\phi(q_t)^\top S_t}{\phi(q_t)^\top z_t}$，其中 $S_t=\sum_{j\le t}\phi(k_j)v_j^\top$（$d\times d_v$），$z_t=\sum_{j\le t}\phi(k_j)$；
- 要求按 $t$ 逐步更新 $S$、$z$（状态大小与 $T$ 无关），不得构造 $T\times T$ 矩阵；返回形状 `(T, dv)`。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import numpy as np

def phi(x):
    return np.where(x > 0, x + 1.0, np.exp(np.minimum(x, 0.0)))   # elu(x) + 1，恒为正

def causal_linear_attention(Q, K, V):
    T, d = Q.shape
    S = np.zeros((d, V.shape[1]))          # Σ φ(k_j) v_jᵀ
    z = np.zeros(d)                        # Σ φ(k_j)
    out = np.empty((T, V.shape[1]))
    for t in range(T):
        k = phi(K[t])
        S += np.outer(k, V[t])             # 先把第 t 个 token 写入状态
        z += k
        q = phi(Q[t])
        out[t] = q @ S / (q @ z)           # 再读出：包含 j <= t 的全部项
    return out
```

**测试用例：**

```python
rng = np.random.default_rng(0)
T, d, dv = 7, 4, 3
Q, K, V = rng.normal(size=(T, d)), rng.normal(size=(T, d)), rng.normal(size=(T, dv))
out = causal_linear_attention(Q, K, V)
assert out.shape == (T, dv)

# 1) 与并行形式（构造 T×T 矩阵）对拍
fq = np.where(Q > 0, Q + 1, np.exp(np.minimum(Q, 0)))
fk = np.where(K > 0, K + 1, np.exp(np.minimum(K, 0)))
A = np.tril(fq @ fk.T)                          # 因果：只保留 j <= t
ref = (A @ V) / A.sum(-1, keepdims=True)
assert np.allclose(out, ref)

# 2) 第一个位置只能看到自己
assert np.allclose(out[0], V[0])

# 3) 因果性：修改最后一个 token 不影响之前的输出
K2, V2 = K.copy(), V.copy()
K2[-1] += 3.0
V2[-1] -= 3.0
assert np.allclose(causal_linear_attention(Q, K2, V2)[:-1], out[:-1])
```

**解析：**

**思路**：用两个累加器代替整个历史。每一步先把 $\phi(k_t)v_t^\top$ 加进 $S$、$\phi(k_t)$ 加进 $z$，再用 $\phi(q_t)$ 读出分子和分母。时间 $O(T\,d\,d_v)$，状态只占 $O(d\,d_v)$，与 $T$ 无关；Softmax 注意力则是 $O(T^2d)$ 时间、$O(Td)$ 的 KV Cache。

**测试的含义**：与并行形式 $\dfrac{\mathrm{tril}(\phi(Q)\phi(K)^\top)V}{\mathrm{rowsum}}$ 对拍，说明两种形式数学上等价——训练时可以用并行（或分块并行）形式，推理时用递推形式。

**易错点**：
- 先读出、后写入状态：第 $t$ 个输出就漏掉了自己（测试 2 中第一个位置会得到 0/0）；
- 忘了除以归一化项 $\phi(q_t)^\top z_t$；
- 用不保证为正的 $\phi$（如恒等映射），分母可能为 0 或负数；
- 直接 `np.exp(x)` 而不截断正数部分，输入很大时会溢出告警。

<sub>考点：线性注意力　｜　出处：Transformers are RNNs（Katharopoulos 等, 2020）arXiv:2006.16236</sub>

</details>

---

<a name="LLM-ATTN-048"></a>

### LLM-ATTN-048　挑战 · 考频 ★★

用 numpy 实现单个 query 的注意力，但要求**分块遍历** K、V（每次只处理 `block` 个 key），用 online softmax 维护运行中的最大值与分母，不得一次性计算全部打分：

```python
def online_attention(q, K, V, block): ...
```

- `q` 形状 `(d,)`，`K` 形状 `(T, d)`，`V` 形状 `(T, dv)`；返回以 $\mathrm{softmax}(Kq/\sqrt{d})$ 为权重的 V 加权和，形状 `(dv,)`；
- 打分可能很大（如数千），结果中不能出现 inf 或 NaN；
- `block` 可以是任意正整数（包括 1 和大于 T 的值）。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import numpy as np

def online_attention(q, K, V, block):
    d = q.shape[0]
    m = -np.inf                      # 已处理部分的最大打分
    l = 0.0                          # 已处理部分的 Σ exp(s - m)
    acc = np.zeros(V.shape[1])       # 已处理部分的 Σ exp(s - m) · v
    for start in range(0, K.shape[0], block):
        s = K[start:start + block] @ q / np.sqrt(d)
        m_new = max(m, s.max())
        scale = np.exp(m - m_new)    # 把旧的累计量换算到新的最大值下（≤ 1）
        p = np.exp(s - m_new)
        l = l * scale + p.sum()
        acc = acc * scale + p @ V[start:start + block]
        m = m_new
    return acc / l
```

**测试用例：**

```python
def reference(q, K, V):
    s = K @ q / np.sqrt(q.shape[0])
    w = np.exp(s - s.max())
    return (w / w.sum()) @ V

rng = np.random.default_rng(0)
T, d, dv = 10, 8, 5
q, K, V = rng.normal(size=d), rng.normal(size=(T, d)), rng.normal(size=(T, dv))
for block in (1, 3, 4, 10, 32):
    assert np.allclose(online_attention(q, K, V, block), reference(q, K, V))

# 打分达到数千时仍然稳定
out = online_attention(q * 3000, K, V, 3)
assert np.isfinite(out).all()
assert np.allclose(out, reference(q * 3000, K, V))

# 最大打分出现在最后一块：之前块的累计量必须被正确修正
K2 = K.copy()
K2[-1] = q * 50
assert np.allclose(online_attention(q, K2, V, 2), reference(q, K2, V))

# 只有一个 key 时，输出就是对应的 value
assert np.allclose(online_attention(q, K[:1], V[:1], 4), V[0])
```

**解析：**

**思路**：维护三个量——当前最大打分 $m$、分母 $l=\sum e^{s-m}$、分子 $acc=\sum e^{s-m}v$。处理新块时：
1. 新的最大值 $m'=\max(m,\max s_{block})$；
2. 旧的 $l$ 和 $acc$ 都是相对 $m$ 计算的，乘以 $e^{m-m'}$（不超过 1，不会溢出）换算到 $m'$ 下；
3. 加上新块的 $e^{s-m'}$ 与 $e^{s-m'}v$；
4. 全部处理完后输出 $acc/l$。

第一块时 $m=-\infty$，$e^{-\infty}=0$，旧累计量自然清零，无需特判。所有指数的参数都不大于 0，打分再大也不会溢出。

**意义**：这就是 FlashAttention 的核心——按块读入 K、V，不保存完整的打分向量（矩阵），结果与标准 Softmax 完全一致；FlashDecoding 把 K、V 分给多个线程块并行处理，最后用同样的换算规则合并各块的 $(m,l,acc)$。

**易错点**：只修正 $l$ 而忘了修正 $acc$；不减最大值直接累加 $e^{s}$（打分很大时溢出）；最后忘了除以 $l$。

<sub>考点：数值稳定、注意力复杂度　｜　出处：FlashAttention 论文 arXiv:2205.14135</sub>

</details>

---

<a name="LLM-ATTN-052"></a>

### LLM-ATTN-052　进阶 · 考频 ★★

用 numpy 实现带 key padding 掩码的多头交叉注意力（批量版）：

```python
def cross_attention(x_q, x_kv, kv_lens, Wq, Wk, Wv, Wo, n_heads): ...
```

- `x_q`：解码器一侧的输入，形状 `(B, Tq, D)`；`x_kv`：编码器输出，已在右侧补齐，形状 `(B, Tk, D)`；
- `kv_lens`：长度为 `B` 的整数列表，第 `b` 条样本只有前 `kv_lens[b]` 个 key 有效（保证 ≥ 1），其余位置是 padding，不能被注意到；
- `Wq`、`Wk`、`Wv`、`Wo` 形状均为 `(D, D)`，`D` 能被 `n_heads` 整除；Q 由 `x_q` 投影，K、V 由 `x_kv` 投影；
- 交叉注意力不加因果掩码；返回形状 `(B, Tq, D)` 的输出。要求向量化（不对 batch 和头写 Python 循环），Softmax 需数值稳定。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import numpy as np

def cross_attention(x_q, x_kv, kv_lens, Wq, Wk, Wv, Wo, n_heads):
    B, Tq, D = x_q.shape
    Tk = x_kv.shape[1]
    d = D // n_heads

    def split(m, T):                                     # (B, T, D) -> (B, H, T, d)
        return m.reshape(B, T, n_heads, d).transpose(0, 2, 1, 3)

    q, k, v = split(x_q @ Wq, Tq), split(x_kv @ Wk, Tk), split(x_kv @ Wv, Tk)
    scores = q @ k.transpose(0, 1, 3, 2) / np.sqrt(d)    # (B, H, Tq, Tk)
    pad = np.arange(Tk)[None, :] >= np.asarray(kv_lens)[:, None]     # (B, Tk)，True 表示 padding
    scores = np.where(pad[:, None, None, :], -np.inf, scores)        # 只屏蔽 key 维
    scores = scores - scores.max(axis=-1, keepdims=True)             # 数值稳定
    w = np.exp(scores)
    w = w / w.sum(axis=-1, keepdims=True)
    out = (w @ v).transpose(0, 2, 1, 3).reshape(B, Tq, D)           # 拼接各头
    return out @ Wo
```

**测试用例：**

```python
rng = np.random.default_rng(0)
B, Tq, Tk, D, H = 3, 4, 6, 8, 2
x_q, x_kv = rng.normal(size=(B, Tq, D)), rng.normal(size=(B, Tk, D))
W = [rng.normal(size=(D, D)) for _ in range(4)]
lens = [6, 3, 1]
out = cross_attention(x_q, x_kv, lens, *W, H)
assert out.shape == (B, Tq, D)

# 1) 与「去掉 padding 后逐条、逐头计算」的朴素实现对拍
def naive(xq, xkv):
    d = D // H
    q, k, v = xq @ W[0], xkv @ W[1], xkv @ W[2]
    heads = []
    for h in range(H):
        sl = slice(h * d, (h + 1) * d)
        s = q[:, sl] @ k[:, sl].T / np.sqrt(d)
        p = np.exp(s - s.max(-1, keepdims=True))
        heads.append((p / p.sum(-1, keepdims=True)) @ v[:, sl])
    return np.concatenate(heads, -1) @ W[3]
for b in range(B):
    assert np.allclose(out[b], naive(x_q[b], x_kv[b, :lens[b]]))

# 2) padding 位置填什么都不影响结果
x2 = x_kv.copy()
x2[1, 3:] = 1e3
x2[2, 1:] = -1e3
assert np.allclose(cross_attention(x_q, x2, lens, *W, H), out)

# 3) 不加因果掩码：第 0 个 query 也会受到最后一个有效 key 的影响
x3 = x_kv.copy()
x3[0, 5] += 1.0
assert not np.allclose(cross_attention(x_q, x3, lens, *W, H)[0, 0], out[0, 0])

# 4) 打分很大时数值稳定
assert np.isfinite(cross_attention(x_q * 100, x_kv, lens, *W, H)).all()
```

**解析：**

**思路**：
1. Q 来自解码器一侧的 `x_q`，K、V 来自编码器输出 `x_kv`，两边长度可以不同，打分矩阵为 `(B, H, Tq, Tk)`；
2. 由 `kv_lens` 生成 `(B, Tk)` 的 padding 掩码，扩成 `(B, 1, 1, Tk)` 后广播到所有头和所有 query，把 padding 位置的打分置为 $-\infty$；
3. 减去每行最大值再求指数，避免溢出；因为每条样本至少有 1 个有效 key，每行都有有限值，不会出现 NaN；
4. 加权求和后把头维移回去、拼接，再乘输出投影。

**易错点**：
- 掩码加错了维度：写成 `pad[:, None, :, None]` 会去屏蔽 query 维，长度又对不上；padding 掩码属于 **key 维**（最后一维）；
- 给交叉注意力加了因果掩码：编码器输出是完整已知的源序列，解码器每个位置都可以看到全部有效 key；
- 在 Softmax 之后再把 padding 位置置 0，权重和不再为 1；
- 某一行全部被屏蔽时，$-\infty$ 会让 Softmax 得到 NaN，工程上常改用一个很大的负数或单独处理这些行（本题约定 `kv_lens ≥ 1`）。

**复杂度**：时间 $O(B\cdot H\cdot T_q\cdot T_k\cdot d)$；推理时交叉注意力的 K、V 只依赖编码器输出，可以在解码开始前一次算好并缓存。

<sub>考点：交叉注意力、注意力掩码、多头注意力　｜　出处：Attention Is All You Need arXiv:1706.03762</sub>

</details>

---

## 简答题

<a name="LLM-ATTN-005"></a>

### LLM-ATTN-005　进阶 · 考频 ★★★

请比较 MHA、MQA、GQA、MLA 四种注意力：它们各自如何处理 K、V，推理时的 KV Cache 有什么差别，效果与工程上各有什么取舍？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **MHA**：每个头有独立的 Q、K、V。KV Cache 每 token 每层为 $2n_hd_h$ 个元素，最大；效果是基准。
2. **MQA**：所有 Query 头共享 1 组 K、V。KV Cache 降为 $2d_h$，是 MHA 的 $1/n_h$；推理快、省显存，但表达能力下降，效果有损，训练也可能更不稳定。
3. **GQA**：Query 头分成 $g$ 组，每组共享 1 组 K、V。KV Cache 为 $2gd_h$；效果接近 MHA，是当前开源模型的主流选择（如 Llama-3、Qwen2.5）。
4. **MLA**（DeepSeek-V2 / V3）：把 K、V 压缩成一个低秩潜向量，推理时只缓存潜向量和一小段带 RoPE 的 key（如 512 + 64 维），KV Cache 比 GQA 还小，论文报告效果不弱于 MHA；代价是实现复杂，RoPE 需要「解耦」处理，推理需要专门优化的算子。
5. **一句话总结**：都是在「推理时少存 KV」与「效果别掉」之间权衡——MQA、GQA 靠共享，MLA 靠压缩。

**评分要点（共 10 分）：**

- 正确说明 MHA、MQA、GQA 对 K、V 的处理方式（3 分）
- 给出 KV Cache 的量级对比（如 MQA 为 MHA 的 1/h，GQA 为 g/h）（3 分）
- 说明 MLA 低秩压缩的思路及其工程代价（2 分）
- 说明各自的效果取舍与代表模型（2 分）

**讲解：**

**常见失分点**：把 GQA 说成「减少 Query 头」；说 MQA「不影响效果」；不知道 MLA 缓存的是压缩后的潜向量；只罗列名词，不给 KV Cache 的量级。回答时最好随手写出 KV Cache 公式，再代入头数比较。

<sub>考点：多头注意力、MQA、GQA、MLA　｜　出处：MQA（Shazeer, 2019）arXiv:1911.02150；GQA arXiv:2305.13245；DeepSeek-V2 技术报告 arXiv:2405.04434</sub>

</details>

---

<a name="LLM-ATTN-014"></a>

### LLM-ATTN-014　进阶 · 考频 ★★★

请推导 Scaled Dot-Product Attention 为什么要除以 $\sqrt{d_k}$：(1) 在什么假设下点积的方差是多少；(2) 不缩放会发生什么？请从 Softmax 的梯度角度解释；(3) 如果改成除以 $d_k$ 会怎样；(4) 还有哪些控制注意力打分尺度的方法？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **方差**：假设 $q$、$k$ 的各分量独立、均值 0、方差 1，则 $\mathrm{Var}(q_ik_i)=1$，$\mathrm{Var}(q\cdot k)=\sum_{i=1}^{d_k}\mathrm{Var}(q_ik_i)=d_k$，标准差 $\sqrt{d_k}$。$d_k=128$ 时约 11.3。
2. **不缩放的后果**：打分之间的差距被放大，Softmax 输出接近 one-hot。Softmax 的雅可比为 $\partial p_i/\partial z_j=p_i(\delta_{ij}-p_j)$：最大项 $p_i\approx1$ 时 $p_i(1-p_i)\approx0$，其余项 $p_j\approx0$，所有梯度都接近 0，注意力很难再被调整，训练变慢甚至停滞。实测：$d_k=128$ 时不缩放，每行最大权重平均 0.89；缩放后为 0.25。
3. **除以 $d_k$**：方差变成 $1/d_k$，标准差约 0.09（$d_k=128$），打分几乎相同，Softmax 接近均匀分布，注意力失去区分度，梯度同样偏小。目标是让标准差为 1，所以应除以标准差 $\sqrt{d_k}$。
4. **其他方法**：QK-Norm（打分前对每个头的 $q$、$k$ 做归一化，Qwen3、Gemma 3 等使用）；logit 软截断 $c\cdot\tanh(z/c)$（Gemma 2）；把缩放折算进 $W^Q$ 的初始化（T5）；长度扩展时调整注意力温度（如 YaRN）。

**评分要点（共 10 分）：**

- 在独立、零均值、单位方差的假设下推出点积方差为 d_k（3 分）
- 用 Softmax 梯度 p_i(δ_ij − p_j) 解释饱和导致梯度消失（3 分）
- 指出除以 d_k 会让分布过平、失去区分度（2 分）
- 列出至少一种其他控制打分尺度的方法（2 分）

**讲解：**

**常见失分点**：写成除以 $\sqrt{d_{model}}$；把原因说成「防止数值溢出」（溢出靠减去最大值解决，缩放解决的是饱和与梯度问题）；只背结论、推不出方差；认为除以 $d_k$「缩得更狠、更稳定」。

<sub>考点：缩放因子、数值稳定</sub>

</details>

---

<a name="LLM-ATTN-020"></a>

### LLM-ATTN-020　进阶 · 考频 ★★★

多头注意力相比单头注意力「多了什么、没多什么」？输出投影 $W^O$ 起什么作用？头数与头维度一般如何选取？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **没多什么**：$d_{model}$ 固定时，投影参数仍为 $4d^2$；打分计算量 $h\times T^2\times(d/h)=T^2d$，基本不变。
2. **多了什么**：每个 query 有 $h$ 组独立的注意力分布，可以同时关注不同类型的关系；单头只能把多种关系「平均」成一个分布。可解释性研究观察到专看前一个 token 的头、负责「找到前文相同模式并复制后续」的 induction head（Olsson 等, 2022）等分工。
3. **$W^O$ 的作用**：拼接只是把各头结果并排放置，每个头只占自己那一段维度；$W^O$ 把各头的信息混合起来并投影回 $d_{model}$ 维，决定写入残差流的哪些方向。去掉它，头与头的结果无法组合，每个头只能影响残差流中固定的一段子空间。
4. **如何选取**：$d_h$ 一般取 64 或 128。$d_h$ 太小会形成低秩瓶颈（单头打分矩阵秩不超过 $d_h$），所以模型变大时增加头数；头数还要考虑张量并行的整除关系，以及推理时 KV Cache 与 KV 头数成正比（GQA / MQA 只减少 KV 头，不减少 Q 头）。
5. **冗余**：Michel 等（2019）发现训练好的模型中很多头可以剪掉而几乎不掉点。

**评分要点（共 10 分）：**

- 指出参数量与计算量基本不变（2 分）
- 说明多组独立注意力分布能捕捉多种关系，最好举出头分工的例子（3 分）
- 说清 W_O 混合各头并投影回残差流的作用（2 分）
- 说明 d_h 的取值经验与低秩瓶颈、KV Cache 或张量并行等约束（3 分）

**讲解：**

**常见失分点**：说「多头让参数量变成 $h$ 倍」；把 $W^O$ 说成只是「恢复维度」的摆设；认为头越多越好；说不出 $d_h$ 的常见取值；把 GQA 说成「减少了 Q 头」。

<sub>考点：多头注意力　｜　出处：Olsson 等, In-context Learning and Induction Heads, arXiv:2209.11895；Michel 等 arXiv:1905.10650；Bhojanapalli 等 arXiv:2002.07028</sub>

</details>

---

<a name="LLM-ATTN-025"></a>

### LLM-ATTN-025　进阶 · 考频 ★★

DeepSeek 的 MLA（Multi-head Latent Attention）是如何压缩 KV Cache 的？推理时为什么不需要把潜向量「解压」成每个头的 K、V？为什么 RoPE 必须「解耦」处理？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **低秩联合压缩**：把隐状态投影成一个短向量 $c_t=W^{DKV}h_t$（DeepSeek-V2/V3 中 $d_c=512$，远小于 $n_hd_h=16384$）；第 $i$ 个头的 $k_{t,i}=W^{UK}_ic_t$、$v_{t,i}=W^{UV}_ic_t$。缓存里只存 $c_t$。
2. **矩阵吸收**：$q_{t,i}^\top k_{s,i}=q_{t,i}^\top W^{UK}_ic_s=(W^{UK\top}_iq_{t,i})^\top c_s$，$W^{UK}_i$ 可以并入 query 一侧；输出 $\sum_s a_{ts}v_{s,i}=W^{UV}_i\sum_s a_{ts}c_s$，$W^{UV}_i$ 可以并入输出矩阵 $W^O$。推理时直接拿变换后的 query 与 512 维潜向量做注意力，不必物化每个头的 K、V。代价是每读一个字节缓存要做更多计算，这对受带宽限制的 Decode 恰好有利。
3. **RoPE 为什么要解耦**：RoPE 在 $q$、$k$ 上乘随位置变化的旋转矩阵，打分变成 $q_{t,i}^\top R_t^\top R_sW^{UK}_ic_s=q_{t,i}^\top R_{s-t}W^{UK}_ic_s$。旋转矩阵夹在 query 与 $W^{UK}$ 之间且随相对位置变化，$W^{UK}$ 就无法预先与 query 侧合并成一个固定矩阵。
4. **解耦做法**：内容部分不加 RoPE（可吸收）；另加一小段只负责位置的维度：每个头一段带 RoPE 的 $q^R_{t,i}$（64 维），所有头共享一个带 RoPE 的 $k^R_t$（64 维），拼成 $q=[q^C;q^R]$、$k=[k^C;k^R]$。缓存 $c_t$ 与 $k^R_t$，每层每 token 共 576 个数。
5. **其他细节**：训练时 query 也做低秩压缩（DeepSeek-V3 为 1536 维）以节省激活显存；共享的 $k^R$ 相当于在位置部分用了 MQA。

**评分要点（共 10 分）：**

- 说明低秩联合压缩、只缓存潜向量（3 分）
- 推导矩阵吸收：W^UK 并入 query 侧、W^UV 并入 W^O（3 分）
- 说明 RoPE 旋转矩阵夹在中间且随位置变化，导致无法吸收（2 分）
- 说明解耦方案：额外的带 RoPE 维度、所有头共享 k^R、缓存 512+64（2 分）

**讲解：**

**常见失分点**：把 MLA 说成 KV 量化；以为推理时必须先把潜向量解压成每个头的 K、V；说解耦 RoPE 是为了「减少参数」；不知道带 RoPE 的 key 是所有头共享的；只会背「512+64」却讲不出为什么 RoPE 会破坏矩阵吸收。

<sub>考点：MLA　｜　出处：DeepSeek-V2 论文 arXiv:2405.04434</sub>

</details>

---

<a name="LLM-ATTN-027"></a>

### LLM-ATTN-027　基础 · 考频 ★★★

KV Cache 缓存的是什么？为什么只缓存 K、V 而不缓存 Q？为什么 Decoder-only 模型可以这样缓存，而 BERT 这类双向模型不行？使用 KV Cache 后，生成第 $t$ 个 token 时注意力部分的计算量与 $t$ 有什么关系？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **缓存内容**：每一层、每个历史 token 的 K 和 V（K 是施加 RoPE 之后的）；GQA 时只缓存 $n_{kv}$ 个头。
2. **不缓存 Q**：新 token 的 query 只用一次，与历史 K 打完分就不再需要；历史 token 的 K、V 却会被之后**每一个**新 query 反复使用。
3. **能缓存的前提**：因果掩码下，位置 $s$ 的表示只依赖位置 $\le s$ 的 token，后来的 token 不会改变它，所以 $K_s$、$V_s$ 一旦算出就永远不变。双向模型中每个位置都看全句，新增一个 token 会改变所有位置的表示，K、V 都要重算。
4. **计算量**：不缓存时每步要把整个前缀重新前向一遍，生成 $N$ 个 token 共处理 $O(N^2)$ 个 token；缓存后每步只对 1 个新 token 做投影和 FFN。但注意力仍要让新 query 与全部 $t$ 个历史 key 打分、读取全部 KV，单步注意力是 $O(t\cdot d)$，随 $t$ 线性增长。
5. **代价**：显存随序列长度线性增长（$2\times L\times n_{kv}\times d_h\times T\times b$ 字节），Decode 主要受显存带宽限制。

**评分要点（共 10 分）：**

- 说明缓存的是每层历史 token 的 K、V（RoPE 之后）（2 分）
- 解释不缓存 Q 的原因（2 分）
- 用因果掩码解释为什么可以缓存，并对比双向模型（3 分）
- 说明单步注意力计算仍与上下文长度线性相关，以及总体计算量的变化（3 分）

**讲解：**

**常见失分点**：说缓存的是注意力分数矩阵；说 Q、K、V 都缓存；以为用了 KV Cache 之后每步计算量与长度无关；说缓存的是 RoPE 之前的 K（那样每步都要把整个缓存重新旋转一遍）。

<sub>考点：KV Cache原理与大小</sub>

</details>

---

<a name="LLM-ATTN-032"></a>

### LLM-ATTN-032　进阶 · 考频 ★★★

标准注意力的计算量和显存随序列长度平方增长。请把长上下文场景下的优化思路分成「不改变注意力的数学、只改实现」与「改变注意力的数学以降低复杂度」两类，各举代表方法，并说明后一类的主要代价。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **不改数学，只改实现**（结果与标准注意力一致）：
   - FlashAttention：分块 + online softmax，不物化 $T\times T$ 矩阵，额外显存降到 $O(T)$，减少显存读写；计算量仍是 $O(T^2d)$。
   - 序列 / 上下文并行（如 Ring Attention）：把长序列切到多张卡上，分摊显存与计算。
   - 推理侧：分块 Prefill、FlashDecoding 等，复杂度不变，提高硬件利用率。
2. **改变数学，降低复杂度**：
   - 滑动窗口（局部）注意力：每个 token 只看最近 $W$ 个，$O(TW)$；如 Mistral 7B（$W=4096$），Gemma 2 / 3 的局部层与全局层交替。
   - 稀疏注意力：固定模式（Sparse Transformer 的跨步模式、Longformer 的窗口 + 全局 token、BigBird 再加随机连接），或按内容动态挑选部分 key（如 DeepSeek 的 NSA、DSA）。
   - 线性注意力与状态空间模型：去掉 Softmax 或改用递推状态，复杂度 $O(T)$、推理状态大小固定（如 Linear Transformer、Mamba），常与少量全注意力层混合（如 Jamba、MiniMax-01）。
3. **后一类的代价**：精确回忆远处细节的能力变弱（大海捞针、多跳检索、复制类任务受影响）；窗口外的信息只能靠多层间接传递；动态稀疏需要专门的内核才能真正提速；线性注意力的固定大小状态限制了能记住的信息量；通常需要与全注意力层混合，或从头训练 / 大量续训。
4. **补充**：GQA、MLA、KV 量化不降低 $T^2$ 的计算复杂度，但减小了每 token 的 KV Cache 和 Decode 的读带宽，在长上下文推理中同样关键。

**评分要点（共 10 分）：**

- 正确区分两类，并给出 FlashAttention 等「数学不变」的代表（3 分）
- 给出滑动窗口、稀疏、线性注意力 / SSM 中至少两类及代表模型（3 分）
- 说明改变数学的代价：远程精确回忆变弱、需要混合或重训等（2 分）
- 提到 KV 侧优化或混合架构等工程实践（2 分）

**讲解：**

**常见失分点**：把 FlashAttention 归为「近似注意力」或说它把复杂度降到 $O(T)$；把 GQA 说成降低了注意力的计算复杂度；只列方法名、不讲代价；不知道实际模型多采用「局部 + 全局」或「线性 + 少量全注意力」的混合方案。

<sub>考点：注意力复杂度、稀疏与滑动窗口注意力、线性注意力　｜　出处：FlashAttention arXiv:2205.14135；Ring Attention arXiv:2310.01889；Mistral 7B arXiv:2310.06825；Longformer arXiv:2004.05150；BigBird arXiv:2007.14062；NSA arXiv:2502.11089；Mamba arXiv:2312.00752</sub>

</details>

---

<a name="LLM-ATTN-039"></a>

### LLM-ATTN-039　挑战 · 考频 ★

线性注意力把复杂度降到了 $O(T)$，推理时的状态大小也固定，但它至今没有取代 Softmax 注意力成为大模型的主流。请分析原因，并说明业界通常如何利用它的优势。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **表达能力**：Softmax 的指数函数能产生非常尖锐、接近 one-hot 的分布，精确聚焦到某一个 token；线性注意力的核 $\phi(q)^\top\phi(k)$ 通常平滑得多，难以「只看一个位置」，在需要精确取回的任务上吃亏。
2. **固定容量的记忆**：全部历史被压缩进 $d\times d_v$ 的状态，能记住的信息有上限。序列越长，旧信息越容易被覆盖、混叠，关联回忆、大海捞针、复制等任务明显弱于全注意力（全注意力保留了每个 token 的 KV，代价是缓存线性增长）。
3. **工程与硬件**：递推形式难以并行训练，要依赖分块并行算法和专门内核才能在 GPU 上跑满；在常见的几 K 长度下 FlashAttention 已经足够快，理论 FLOPs 优势要到更长序列才明显；推理框架、长度扩展、KV 管理等生态都围绕 Softmax 注意力建设。
4. **改进方向**：给状态加入衰减或数据相关的门控（RetNet、GLA、Mamba / Mamba-2 等），或用 delta 规则按需改写状态（DeltaNet 系列），显著缩小了与 Softmax 注意力的差距。
5. **现实用法——混合架构**：大部分层用线性注意力或状态空间模型，少量层保留全注意力负责精确检索（如 Jamba、MiniMax-01），兼顾长序列效率与回忆能力；也常用于对长度极敏感的端侧和超长序列场景。

**评分要点（共 10 分）：**

- 指出 Softmax 的尖锐分布与精确检索能力是线性注意力的短板（3 分）
- 说明固定大小状态带来的记忆容量限制及其在回忆类任务上的表现（3 分）
- 提到并行训练、内核实现、短序列优势不明显或生态等工程因素（2 分）
- 说明门控 / 衰减等改进与混合架构的现实用法（2 分）

**讲解：**

**常见失分点**：只说「效果差」而讲不出原因；把线性注意力和滑动窗口注意力混为一谈；认为复杂度更低就一定更快；不知道业界的主流用法是与全注意力层混合，而不是整体替换。

<sub>考点：线性注意力</sub>

</details>

---

## 场景分析题

<a name="LLM-ATTN-011"></a>

### LLM-ATTN-011　挑战 · 考频 ★★

团队用一个 13B 的 MHA 模型（40 层、40 个头、头维度 128，FP16）提供 32K 长上下文的文档问答服务，部署在单张 80 GB 的 GPU 上。上线后发现：并发一高就 OOM，只能把 batch 限制在 1～2，吞吐很低。请分析原因，并按「改动成本从低到高」给出优化方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**定位原因**：瓶颈是 KV Cache 而不是权重。
- 权重：$13\times10^9\times2\approx26$ GB；
- 每 token 的 KV Cache：$2\times40\times40\times128\times2=819200$ 字节 $\approx0.78$ MiB；
- 一条 32K 序列：$0.78\ \text{MiB}\times32768\approx25$ GiB。80 GB 卡放下权重后只剩约 50 GB，最多容纳 2 条满长度序列，与现象吻合。

**优化方案（成本从低到高）**：
1. **PagedAttention / 按需分配**（如 vLLM）：按实际长度分配 KV 块，消除预留与碎片浪费；多数请求远短于 32K 时并发能大幅提升。
2. **前缀缓存**：同一文档的多轮问答共享文档部分的 KV，只存一份。
3. **KV Cache 量化**：FP8 / INT8 存储，KV 显存减半，通常掉点很小。
4. **权重量化**：INT8 / INT4 权重，腾出 13～20 GB 给 KV。
5. **多卡张量并行**：把 KV 头切到多张卡上，单卡 KV 压力按卡数下降。
6. **换架构或改造模型**：换用 GQA / MLA 模型，或用 uptraining 把 MHA 转成 GQA（例如 8 个 KV 头，KV Cache 降为 1/5）；也可考虑滑动窗口 + 全局注意力的混合结构。这类改动收益最大，但需要重新训练与评测。

**验证**：压测时记录 KV Cache 利用率、可并发请求数、TTFT / TPOT 与吞吐，并在长文档评测集上确认量化或改架构后效果没有明显下降。

**评分要点（共 10 分）：**

- 算出单序列 KV Cache 的量级并指出它才是瓶颈（3 分）
- 给出 PagedAttention、前缀缓存等不改模型的方案（2 分）
- 给出 KV 量化、权重量化、多卡等方案并说明代价（2 分）
- 提到 GQA / MLA 等架构级方案及其训练成本（2 分）
- 说明如何验证效果（1 分）

**讲解：**

**常见失分点**：只说「加卡」「换大显存」；把瓶颈归因于权重或计算量；给出方案却不说代价与验证方法。高分回答的关键是先用 KV Cache 公式**算出数量级**，让后续每个方案都有数字支撑。

<sub>考点：KV Cache原理与大小、GQA、稀疏与滑动窗口注意力</sub>

</details>

---

<a name="LLM-ATTN-046"></a>

### LLM-ATTN-046　挑战 · 考频 ★★

某团队做一个「7×24 小时陪伴聊天」服务，单个会话会持续累积到几十万 token，远超模型 32K 的训练长度。为了控制显存，工程师实现了「只保留最近 4K 个 token 的 KV Cache」的方案：窗口外的 KV 直接丢弃，新 token 的位置编号沿用原文中的绝对位置继续往后数。上线后发现，会话长度一超过 4K，回复就开始语无伦次、重复。请分析原因，给出改进方案，并说明改进后仍然存在的局限。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 原因分析**：
- **主因：attention sink 被丢弃**。模型的很多头会把大量注意力分给开头几个 token。窗口一滑过开头，这些 token 的 KV 被丢掉，Softmax 失去「停放多余注意力」的位置，注意力分布被打乱，困惑度暴涨。崩溃恰好从 4K 开始，正是这一机制的特征（StreamingLLM 的核心发现）。
- **次要隐患：位置编号**。窗口内 query 与 key 的相对距离不超过 4K，在训练范围内；但绝对位置会一直增长到几十万，角度 $m\theta$ 数值很大，计算 cos / sin 的浮点误差变大。若模型不是 RoPE 这类相对位置编码，还会直接越界。

**2. 改进方案**：
- 采用 StreamingLLM：始终保留开头约 4 个 token 的 KV 作为 sink，加上最近窗口的滚动缓存；无需训练。
- 位置按缓存内的顺序重新编号：缓存施加 RoPE 之前的 K，每步按缓存位置施加旋转，使相对距离始终落在训练范围内。
- 若可以训练：在微调或预训练中加入专门的 sink token，或使用带可学习 sink 项的注意力。

**3. 仍然存在的局限**：StreamingLLM 只保证「稳定地说下去」，不扩展有效上下文。窗口外的内容被丢弃，用户几小时前说过的名字、偏好都会被遗忘。需要配合记忆机制：
- 定期把旧对话压缩成摘要放在窗口内；
- 把关键事实写入外部记忆（向量库或结构化笔记），每轮按需检索回填；
- 若对早期细节要求高，换用支持更长上下文的模型，并配合按重要性淘汰的 KV 压缩策略。

**4. 验证**：画出随会话长度变化的困惑度曲线，确认超过 4K 后不再飙升；做长程回忆测试（如在第 1000 个 token 处给出一个事实，在 30 万 token 后提问）；线上抽检重复率、乱码率等指标。

**评分要点（共 10 分）：**

- 指出丢弃开头 token（attention sink）是超过 4K 即崩溃的主因，并解释 Softmax 必须分配权重的机制（3 分）
- 给出保留 sink token + 滚动窗口的方案，并正确处理位置编号（3 分）
- 说明该方案不扩展有效上下文，窗口外信息无法再利用（2 分）
- 给出补充记忆或验证方法，如摘要、检索式记忆、长程回忆测试（2 分）

**讲解：**

**常见失分点**：把原因笼统归结为「超过了训练长度」（崩溃从 4K 就开始，远小于 32K）；只给「把窗口开大」的方案，显存问题依旧且没有解决根因；以为加了 sink token 模型就能记住窗口外的内容；没有给出验证手段。

<sub>考点：Attention Sink、稀疏与滑动窗口注意力</sub>

</details>

---

## 系统设计题

<a name="LLM-ATTN-051"></a>

### LLM-ATTN-051　挑战 · 考频 ★★

你负责为一个约 30B 参数的稠密 Decoder-only 模型设计注意力方案。已定的骨架：64 层，隐藏维度 5120，40 个 Query 头（头维度 128）。目标：原生支持 128K 上下文；部署在单机 8×80 GB GPU 上，希望 128K 长度下也有足够的并发；业务包含长文档问答与代码仓库理解，要求较强的远距离精确检索能力。请给出注意力相关的设计（注意力变体与 KV 头数、是否使用局部 / 全局交替或稀疏注意力、位置编码与长度扩展、数值稳定措施），估算 KV Cache 与并发，并说明评测方法与取舍。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 预算估算**（BF16）：
- 8×80 GB ≈ 596 GiB；权重 $30\text{B}\times2$ 字节 ≈ 56 GiB；每卡预留约 6 GiB 给激活与运行时，可用于 KV Cache 的约 490 GiB。
- 每 token KV Cache $=2\times64\times n_{kv}\times128\times2$ 字节：
  - MHA（40 个 KV 头）：1280 KiB，128K 序列 160 GiB，只能并发约 3 条；
  - GQA-8：256 KiB，128K 序列 32 GiB，约 15 条；
  - GQA-8 + 局部 / 全局 3:1 交替（局部窗口 4096）：缓存降为 $\frac{3\times4096+131072}{4\times131072}\approx27\%$，约 8.75 GiB，约 56 条；
  - MLA（每层 512 + 64 维）：72 KiB，128K 序列约 9 GiB，约 54 条。

**2. 推荐方案**：GQA-8 + 局部 / 全局 3:1 交替。
- GQA-8：效果接近 MHA，8 个 KV 头与单机 8 卡张量并行天然对齐；
- 局部层用 4096 窗口（滚动缓存），每 4 层保留 1 个全局层负责远距离精确检索；全局层比例不宜过低，因为远距离检索全靠它们；
- 与 MLA 比较：MLA 的缓存同样小、且每层都是全局注意力，检索能力更有保障，但实现复杂、需要专门内核，训练与推理框架适配成本高；若团队有成熟的 MLA 推理栈，可作为备选。

**3. 位置编码与长度扩展**：RoPE；全局层用大 base（如 $10^6$），局部层可以保持较小的 base；先以 8K 长度完成主体预训练，再用长文本继续预训练分阶段扩到 128K（必要时配合 YaRN）。

**4. 数值稳定**：QK-Norm 约束注意力 logits；Softmax 与归一化统计量用 FP32；掩码用 `finfo.min`；使用 FlashAttention 类内核，长序列训练配合上下文并行。

**5. 评测与消融**：大海捞针（不同深度和长度）、RULER 的多键检索、变量追踪、聚合任务、长文档问答与仓库级代码问答；对「全局层比例（如 1:1、3:1、5:1）」和「GQA 对比 MLA」做小规模消融，同时监控短上下文基准是否退化，再确定最终方案。

**6. 风险**：局部层过多导致远距离检索变弱；标称 128K 不等于有效 128K；长文本数据质量决定上限；全局层的 KV 仍随长度线性增长，可再叠加 FP8 KV 量化。

**评分要点（共 10 分）：**

- 给出完整的注意力配置：变体与 KV 头数、局部 / 全局或稀疏选择、位置编码（3 分）
- 正确估算 128K 下每条序列的 KV Cache 与单机并发，并对比至少两种方案（3 分）
- 说明远距离检索能力与 KV 节省之间的取舍，并给出保留全局层或选择 MLA 等理由（2 分）
- 给出数值稳定措施与评测 / 消融方案（2 分）

**讲解：**

**常见失分点**：只说「用 GQA」而不算 KV Cache；为省显存把所有层都换成滑动窗口，忽略远距离检索需求；只看标称长度，不设计长上下文评测；把 FlashAttention 当成降低 KV Cache 的手段（它减少的是计算时的显存读写与打分矩阵显存，不减少 KV Cache）。

<sub>考点：注意力复杂度、GQA、MLA、稀疏与滑动窗口注意力、KV Cache原理与大小</sub>

</details>

---
