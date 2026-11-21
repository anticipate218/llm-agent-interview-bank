# FND-OPT · 优化与训练技巧

> 所属大类：机器学习与深度学习基础　｜　题量：35

优化器、学习率策略与训练过程中的常见问题。

**考点覆盖**：梯度下降与SGD（3） · 动量（2） · Adagrad与RMSprop（2） · Adam与AdamW（9） · 学习率调度与warmup（3） · 批大小与学习率（4） · 梯度裁剪（3） · 权重衰减（5） · 早停（2） · 梯度累积（2） · 二阶方法直觉（3） · 训练不稳定诊断（3） · 新型优化器（3）

**题型**：[单选题（12）](#单选题) · [多选题（4）](#多选题) · [判断题（3）](#判断题) · [填空题（2）](#填空题) · [计算题（5）](#计算题) · [代码输出题（2）](#代码输出题) · [代码填空题（1）](#代码填空题) · [代码改错题（1）](#代码改错题) · [编程题（1）](#编程题) · [简答题（3）](#简答题) · [场景分析题（1）](#场景分析题)

---

## 单选题

<a name="FND-OPT-001"></a>

### FND-OPT-001　基础 · 考频 ★★

关于全批量梯度下降、随机梯度下降（SGD）与小批量（mini-batch）梯度下降，下列说法正确的是：

- **A.** 小批量梯度是全量梯度的有偏估计：batch 越小偏差越大，所以 batch 越大，训练的最终效果越好
- **B.** 小批量梯度是全量梯度的无偏估计，方差约与 batch 大小成反比，适度的噪声还有助于逃离鞍点
- **C.** 全批量梯度下降每一步的梯度最准确，按处理相同样本数比较，它通常比 SGD 收敛得更快
- **D.** SGD 的梯度噪声会让参数始终在极小值附近大幅游走、无法收敛，因此实践中已很少使用

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：均匀随机抽取的小批量，其平均梯度的期望等于全量梯度（无偏），方差约为 $\sigma^2/B$。

- **全批量**：每步遍历全部数据，梯度准确，但每步代价极高，数据量大时不可行。
- **SGD（B=1）**：每步最便宜，但噪声大，也无法利用硬件的并行能力。
- **小批量**：折中方案，也是深度学习的标准做法。batch 增大 4 倍，梯度噪声的标准差减半，但每步计算量变为 4 倍。

- A 错：随机抽样得到的是无偏估计；batch 大小影响的是方差，而不是偏差。batch 也不是越大越好，过大的 batch 会减少更新次数，还可能带来泛化差距。
- C 错：全批量每步的计算量最大。按「处理相同样本数」比较，SGD 往往进展更快，因为它更新更频繁。
- D 错：配合学习率衰减，SGD 能收敛到极小值附近；梯度噪声还被认为有助于逃离鞍点和尖锐的极小值，是一种隐式正则。SGD（加动量）至今仍是视觉模型训练的常用优化器。

<sub>考点：梯度下降与SGD</sub>

</details>

---

<a name="FND-OPT-004"></a>

### FND-OPT-004　进阶 · 考频 ★★

在一个狭长的「山谷」形损失面上（一个方向很陡，另一个方向很平缓），普通梯度下降的轨迹会在陡峭方向上来回振荡，在平缓方向上进展缓慢。加入动量（$v\leftarrow\mu v+g$，$\theta\leftarrow\theta-\eta v$）后能够改善，原因是：

- **A.** 动量让每一步都沿当前最陡的方向走得更远，在两侧谷壁之间加速弹跳，从而更快地离开山谷
- **B.** 动量相当于对学习率做指数衰减：$\mu$ 越大，学习率衰减越快，振荡幅度也随之逐步减小
- **C.** 动量累积历史梯度：陡峭方向的梯度正负交替、相互抵消，平缓方向的梯度持续累积，等效步长变大
- **D.** 动量通过历史梯度的差分近似海森矩阵，按牛顿方向选择更新，因此能沿山谷底部前进

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：动量是对梯度的「低通滤波」，保留持续一致的分量，抵消来回变号的分量。

- **陡峭方向**：每步梯度方向交替，$v$ 中的正负项相互抵消，振荡幅度变小。
- **平缓方向**：梯度方向持续一致，$v$ 不断累积，稳态时 $v=g/(1-\mu)$；$\mu=0.9$ 时等效步长约放大 10 倍。

物理类比：小球在山谷中滚动，惯性让它沿谷底加速前进，而不会在两侧谷壁之间来回弹跳。对强凸二次函数，合适参数下的（重球）动量可以把收敛所需的迭代次数从 $O(\kappa)$ 量级降到 $O(\sqrt\kappa)$ 量级。

- A 错：动量的方向是历史梯度的加权和，并不总是指向当前最陡的方向，正是这一点抑制了振荡。
- B 错：动量不改变学习率，反而在一致的方向上放大了等效步长。
- D 错：动量只是把历史梯度加权累积，只用到一阶梯度，不估计海森矩阵，也不求牛顿方向。

**Nesterov 动量**先沿动量方向「预走一步」，在预估位置计算梯度再修正，对过冲有更好的抑制作用。

<sub>考点：动量</sub>

</details>

---

<a name="FND-OPT-006"></a>

### FND-OPT-006　基础 · 考频 ★★

关于 Adagrad 与 RMSprop，下列说法正确的是：

- **A.** Adagrad 累加全部历史梯度平方，等效学习率单调下降、后期可能过小；RMSprop 改用指数滑动平均避免这一点
- **B.** RMSprop 累加历史上全部梯度的平方，等效学习率单调下降；Adagrad 改用指数滑动平均解决了这个问题
- **C.** Adagrad 对出现频率高的参数给予更大的学习率，对稀疏特征给予更小的学习率，以免稀疏特征过拟合
- **D.** Adam 相比 RMSprop 只多了偏差修正，两者都直接用当前梯度除以二阶矩的平方根来更新

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：两者都按「梯度平方」的历史为每个参数单独缩放步长，区别在于如何汇总历史。

- **Adagrad**（Duchi 等, 2011）：$G_t=\sum_{s\le t}g_s^2$，$\theta\leftarrow\theta-\eta g_t/(\sqrt{G_t}+\epsilon)$。$G_t$ 只增不减，等效学习率单调下降。稀疏特征的梯度很少出现，$G$ 很小，偶尔出现时步长很大，这对词向量、广告点击率这类稀疏问题很有用；但对需要长期训练的非凸深度网络，步长可能过早地衰减到几乎为 0。
- **RMSprop**（Hinton 在课程讲义中提出，未正式发表）：$v_t=\rho v_{t-1}+(1-\rho)g_t^2$，只看最近约 $1/(1-\rho)$ 步，学习率不会单调衰减。

- B 错：说反了，累加全部历史的是 Adagrad，改用指数滑动平均的是 RMSprop。
- C 错：恰好相反，Adagrad 给频繁出现、梯度累积大的参数**较小**的步长，给稀疏参数较大的步长。
- D 错：Adam 的分子是一阶矩（梯度的指数滑动平均，即动量），而不是当前梯度，这是两者最主要的区别；偏差修正只是另一处差异。

<sub>考点：Adagrad与RMSprop</sub>

</details>

---

<a name="FND-OPT-012"></a>

### FND-OPT-012　进阶 · 考频 ★★

训练代码中不小心把损失乘以了 100（其余设置都不变，也没有梯度裁剪）。分别使用 SGD 与 Adam 时，参数的更新量会怎样变化？

- **A.** SGD 与 Adam 的更新量都变为原来的 100 倍，因为两者的更新量都与梯度大小成正比
- **B.** SGD 的更新量不变，Adam 的更新量变为原来的 100 倍，因为 Adam 的二阶矩会把大梯度进一步放大
- **C.** 两者的更新量都不变：梯度方向没有改变，学习率也没有变，参数沿原方向走同样的距离
- **D.** SGD 的更新量变为原来的 100 倍；Adam 的更新量几乎不变，因为一阶矩与二阶矩的平方根同比放大

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：Adam 对梯度的整体尺度近似不变，SGD 则不然。

- **SGD**：更新量为 $\eta g$，梯度放大 100 倍，更新量就放大 100 倍，相当于学习率变为 100 倍，很可能直接发散。
- **Adam**：$g\to100g$ 时，$\hat m\to100\hat m$，$\hat v\to10^4\hat v$，$\sqrt{\hat v}\to100\sqrt{\hat v}$，比值 $\hat m/\sqrt{\hat v}$ 不变。只有当 $\sqrt{\hat v}$ 与 $\epsilon$ 可以相比时（梯度极小的参数），结果才会略有不同。

- A 错：Adam 的归一化抵消了尺度的变化。
- B 错：说反了；Adam 除以的是 $\sqrt{\hat v}$，大梯度会被压缩而不是放大。
- C 错：SGD 的更新量 $\eta g$ 与梯度大小成正比，方向不变，但步长变为原来的 100 倍。

**启示**：
1. 用 Adam 时，损失的缩放（如对 token 求和还是求平均）对更新的影响很小，但对 SGD 影响巨大；
2. 这一性质也解释了为什么 FP16 训练时的 loss scaling 对 Adam 基本无害（反缩放之后更是完全无关）；
3. 但梯度裁剪的阈值是按梯度范数设定的，损失被放大后，裁剪会更频繁地触发，从而间接改变 Adam 的行为。

<sub>考点：Adam与AdamW</sub>

</details>

---

<a name="FND-OPT-014"></a>

### FND-OPT-014　进阶 · 考频 ★★★

训练 Transformer 时，即使 Adam 已经做了偏差修正，通常仍需要学习率 warmup（前几百到几千步从很小的值逐步升到峰值）。下列解释最准确的是：

- **A.** warmup 期间学习率很小，梯度更新可以用低精度完成，主要作用是节省训练前期的计算量
- **B.** 训练初期梯度变化剧烈、二阶矩只由极少样本估计，自适应学习率方差很大，直接用峰值学习率容易发散
- **C.** Adam 偏差修正公式在前几步会系统性地高估二阶矩，warmup 是为了抵消这个公式本身带来的误差
- **D.** warmup 让学习率先大后小，前期的大步长帮助模型跳出局部最优，之后再逐步衰减

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：偏差修正只解决了「期望」上的偏差，没有解决初期估计「方差」大的问题。

RAdam（Liu 等, 2019, arXiv:1908.03265）从理论上分析指出：训练最初几步，$\hat v$ 只由很少几个梯度样本估计，自适应学习率 $1/\sqrt{\hat v}$ 的方差很大，甚至在理论上发散；warmup 用很小的学习率度过这段时间，起到降低方差的作用（RAdam 则用一个修正项自动做到这一点）。另外，训练初期参数是随机的，损失面的曲率可能很大，大步长容易造成不可逆的损坏；对 Post-Norm 的 Transformer，这一问题更突出。

- A 错：warmup 不减少计算量，每步的计算量与学习率无关，也与是否使用低精度无关。
- C 错：偏差修正的公式没有错误，它修正的是零初始化带来的期望上的偏差（初期是低估而不是高估）；warmup 针对的是估计的方差。
- D 错：warmup 是从小到大升高学习率；从大到小是衰减阶段。

<sub>考点：学习率调度与warmup、Adam与AdamW　｜　出处：论文：arXiv:1908.03265（https://arxiv.org/abs/1908.03265）</sub>

</details>

---

<a name="FND-OPT-017"></a>

### FND-OPT-017　进阶 · 考频 ★★

用 SGD 训练时，把 batch size 扩大为原来的 $k$ 倍，常用的「线性缩放规则」建议把学习率也扩大 $k$ 倍。它背后的推理是：

- **A.** 梯度变化不大时，大 batch 用 $k\eta$ 走一步，约等于小 batch 用 $\eta$ 走 $k$ 步的总位移
- **B.** batch 越大，梯度噪声越小、每步更新越激进，所以学习率应缩小为原来的 $1/k$，才能保证训练的稳定性
- **C.** 平均梯度的期望与 batch 大小无关，每一步的更新方向不变，所以学习率保持不变即可
- **D.** 梯度噪声的方差与 batch 大小成反比，要让噪声尺度保持不变，学习率应扩大 $k^2$ 倍

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**推理**：小 batch 走 $k$ 步，$\theta_{t+k}=\theta_t-\eta\sum_{j<k}\frac1B\sum_{x\in B_j}\nabla\ell(x,\theta_{t+j})$；若 $\theta_{t+j}\approx\theta_t$（梯度在这 $k$ 步里变化不大），就约等于 $\theta_t-k\eta\cdot\frac1{kB}\sum_{x\in\cup B_j}\nabla\ell(x,\theta_t)$，正是大 batch、学习率 $k\eta$ 的一步。处理相同的数据量时，步数变为 $1/k$，学习率放大 $k$ 倍，总的「移动量」才对得上。

Goyal 等（2017）据此把 ResNet-50 的 batch 扩大到 8192，学习率取 $0.1\times\frac{B}{256}$，配合 warmup，精度没有下降。但这条规则有适用范围：训练初期梯度变化快（因此需要 warmup），batch 超过一定规模后会失效。

- B 错：噪声变小意味着可以用**更大**的学习率；大 batch 每步的更新并不更「激进」，反而因为步数减少需要更大的步长。
- C 错：期望不变，但步数减少为 $1/k$，学习率不变就相当于少走了很多路，同样的 epoch 数下欠训练。
- D 错：没有 $k^2$ 倍的规则。从「噪声方差」角度推导得到的是平方根缩放（学习率扩大 $\sqrt k$ 倍），适用于 Adam 等自适应方法（Malladi 等, 2022）。

<sub>考点：批大小与学习率　｜　出处：Goyal 等, Accurate, Large Minibatch SGD: Training ImageNet in 1 Hour, arXiv:1706.02677；Malladi 等, On the SDEs and Scaling Rules for Adaptive Gradient Algorithms, arXiv:2205.10287</sub>

</details>

---

<a name="FND-OPT-021"></a>

### FND-OPT-021　基础 · 考频 ★★

关于梯度裁剪，下列说法正确的是：

- **A.** 按值裁剪与按全局范数裁剪效果相同：两者都只在梯度过大时触发，只是计算阈值的方式不同
- **B.** 按值裁剪逐元素截断到 $[-c,c]$，各分量同比例缩小，因此能保持梯度的方向不变
- **C.** 按全局范数裁剪在总范数超阈值时等比例缩小全部梯度，方向不变；按值裁剪会改变梯度方向
- **D.** 梯度裁剪应在 `optimizer.step()` 之后执行，以免影响本步的更新

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：全局范数裁剪是「方向不变、只压步长」。

全局范数裁剪：$g\leftarrow g\cdot\min\left(1,\dfrac{c}{\lVert g\rVert}\right)$。正常的 step 不受影响；遇到异常的大梯度（坏数据、梯度爆炸）时，把这一步的步长限制在安全范围内。Pascanu 等（2013, arXiv:1211.5063）为对付 RNN 的梯度爆炸系统地提出了这种做法，现在已是 Transformer 训练的标配。

- A 错：两者的效果不同：按值裁剪逐个元素截断，会改变方向；按全局范数裁剪整体缩放，方向不变。
- B 错：逐元素截断只改变绝对值超过 $c$ 的分量，其余分量保持不变，并不是同比例缩小；各分量之间的比例被打乱，方向改变。
- D 错：裁剪必须在 `backward()` 之后、`optimizer.step()` 之前进行，否则已经用未裁剪的梯度更新过参数了。使用 FP16 的 loss scaling 时，还要先对梯度反缩放（`scaler.unscale_`），再按真实梯度的范数裁剪。

**补充**：裁剪前的梯度范数是监控训练健康状况的重要指标；裁剪频繁触发，说明学习率可能过大或者数据有问题。用 Adam 时，裁剪不会改变更新的方向，但会影响一阶矩、二阶矩的累积。

<sub>考点：梯度裁剪　｜　出处：论文：arXiv:1211.5063（https://arxiv.org/abs/1211.5063）</sub>

</details>

---

<a name="FND-OPT-023"></a>

### FND-OPT-023　基础 · 考频 ★★

用 AdamW 训练 Transformer 时，通常怎样设置权重衰减的作用范围？

- **A.** 所有参数统一做权重衰减，包括偏置和归一化层的缩放参数，这样正则效果最强，模型也最不容易过拟合
- **B.** 只对偏置做权重衰减：偏置决定了激活的整体平移，最容易过拟合，矩阵权重则交给归一化层约束
- **C.** 只对 Embedding 做权重衰减，因为词表参数量最大、最容易过拟合，其余参数都不做衰减
- **D.** 通常只对线性层等矩阵权重做衰减，偏置和 LayerNorm / RMSNorm 的缩放参数不做衰减

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：矩阵权重衰减，一维参数（偏置、归一化层的增益）不衰减，这是 GPT 系列开源实现中的常见做法。

**原因**：
- 权重衰减的目的是约束「大权重」带来的复杂度，矩阵权重才是模型容量的主体；
- 偏置和归一化增益的参数量可以忽略，几乎不贡献过拟合；
- 归一化层的 $\gamma$ 决定了归一化之后的输出尺度，被衰减向 0 时会主动压缩信号，可能损害训练。

- A 错：对归一化参数和偏置做衰减通常没有好处，甚至有害。
- B 错：与常见做法相反。偏置的参数量极少，几乎不贡献过拟合，通常恰恰不做衰减；矩阵权重才是需要约束的主体。
- C 错：Embedding 是否衰减，各家做法不一（有的实现把 Embedding 也排除在外），但「只对 Embedding 衰减」不是合理的方案，参数量大也不意味着只有它需要约束。

**实现**：按参数的维度（`p.ndim >= 2`）或名称（含 `bias`、`norm`）分成两个参数组，分别设置 `weight_decay`。大模型预训练中常用的系数为 0.1。

<sub>考点：权重衰减</sub>

</details>

---

<a name="FND-OPT-025"></a>

### FND-OPT-025　基础 · 考频 ★★

关于早停（early stopping）的正确做法，下列描述最合理的是：

- **A.** 只要验证 loss 比上一个 epoch 高就立即停止训练，并保留最后一个检查点，避免继续过拟合
- **B.** 监控验证指标，连续若干次评估（patience）都没超过历史最优就停止，并回滚到验证最优的检查点
- **C.** 监控训练 loss，训练 loss 连续若干个 epoch 不再下降时停止，这说明模型已经收敛、开始过拟合
- **D.** 用测试集上的指标决定何时停止，并回滚到测试成绩最好的检查点，以获得最好的测试成绩

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：早停 = 监控验证指标 + 容忍若干次不改进（patience）+ 回滚到最佳检查点。

验证指标本身有噪声，偶尔回升一次很正常，patience 用来避免过早停止；最小改进量（min_delta）用来忽略微不足道的「改进」。停下来时，最后一个检查点通常已经过了最优点，所以要保存并回滚到验证指标最好的那个检查点。

- A 错：一次回升就停止，太容易被噪声误导；而且停下时的最后一个检查点往往已经过了最优点，应回滚到验证指标最好的检查点。
- C 错：训练 loss 不再下降只说明拟合到了头，不能说明是否过拟合；训练 loss 通常会持续下降，早停要防止的正是「训练 loss 还在降、验证 loss 已经变差」的过拟合。
- D 错：用测试集选择停止点或检查点，等于用测试集调参，测试成绩不再是无偏的泛化估计。

**补充**：早停也是一种正则化。对二次损失和梯度下降，可以证明早停近似等价于 L2 正则，训练步数与学习率的乘积大致对应正则系数的倒数（Goodfellow 等,《Deep Learning》第 7.8 节）。大模型预训练通常只训练约一个 epoch，几乎不用早停；微调时则很常用。

<sub>考点：早停</sub>

</details>

---

<a name="FND-OPT-027"></a>

### FND-OPT-027　进阶 · 考频 ★★

用梯度累积（每累积 $k$ 个 micro-batch 的梯度，更新一次参数）来模拟一次性的大 batch 训练。下列情况中，会导致两者**不等价**（差异超出浮点误差）的是：

- **A.** 各 micro-batch 的样本数相同，每个 micro-batch 的 loss 先对样本取平均，再除以 $k$ 后反向
- **B.** 使用 Adam 优化器
- **C.** 模型中含有 BatchNorm 层
- **D.** 在累积完成后、参数更新前，按全局范数做一次梯度裁剪

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：BN 的统计量在每个 micro-batch 内单独计算，前向本身就与大 batch 不同。

梯度累积的等价性依赖于「总梯度 = 各 micro-batch 梯度之和」，这要求前向计算中样本之间互不影响。BN 用 micro-batch 内的均值、方差做归一化，样本之间相互耦合，micro-batch 越小，统计量与大 batch 的差别越大，梯度和滑动统计量都不等价。

- A 不选：样本数相同时，$\frac1k\sum_j\frac1{B}\sum_{i\in B_j}\ell_i=\frac1{kB}\sum_i\ell_i$，与大 batch 的平均 loss 完全相同。
- B 不选：优化器只看到累积后的总梯度，与用大 batch 算出的梯度相同，后续更新也相同。
- D 不选：在累积完成后裁剪一次，与对大 batch 的梯度裁剪一次等价；如果在每个 micro-batch 上分别裁剪，才不等价。

**另一个常见陷阱**：变长序列按 token 求平均时，如果每个 micro-batch 先除以**自己的** token 数，再除以 $k$，token 少的 micro-batch 中每个 token 的权重会被放大，结果与大 batch 不等价；应当用整个累积窗口的有效 token 总数作分母。

<sub>考点：梯度累积</sub>

</details>

---

<a name="FND-OPT-030"></a>

### FND-OPT-030　进阶 · 考频 ★

关于在神经网络中使用二阶信息，下列说法正确的是：

- **A.** 海森-向量积 $Hv$ 不必显式构造 $H$，约用几次梯度计算的代价就能得到
- **B.** 对一个 7B 参数的模型，以 FP32 显式存储完整的海森矩阵约需 28 GB，与存一份参数相当
- **C.** 非凸问题中，牛顿方向 $-H^{-1}g$ 同样保证是下降方向，只是步长需要配合线搜索
- **D.** 海森矩阵的条件数越大，损失面越陡峭，梯度下降每步走得越远，收敛也就越快

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：只要能求梯度，就能高效地求海森-向量积。

$Hv=\nabla_\theta\big(\nabla_\theta f(\theta)^\top v\big)$：先求梯度，与固定向量 $v$ 做内积得到一个标量，再对它求一次梯度，代价是常数次反向传播（Pearlmutter, 1994）。也可以用「前向模式套反向模式」的自动微分实现。Hessian-free 优化、用幂迭代估计最大特征值（衡量损失面的尖锐程度）、Sophia 等方法都依赖这一技巧。

- B 错：海森矩阵有 $n^2=(7\times10^9)^2\approx4.9\times10^{19}$ 个元素，FP32 下约 $2\times10^{20}$ 字节，即约 196 EB。28 GB 是参数本身的大小（$7\times10^9\times4$ 字节）。
- C 错：海森矩阵不定（有负特征值）时，牛顿方向可能是上升方向，或者被吸引到鞍点，线搜索也无法修正方向本身。实用的二阶方法会加阻尼（如 $H+\lambda I$），或使用正定的近似（Gauss-Newton、Fisher）。
- D 错：条件数是最大曲率与最小曲率之比，与损失面整体是否陡峭无关。条件数越大，各方向的曲率越不均衡，梯度下降越慢：收敛所需的步数大致与条件数成正比。

<sub>考点：二阶方法直觉</sub>

</details>

---

<a name="FND-OPT-033"></a>

### FND-OPT-033　进阶 · 考频 ★★

Muon 优化器（Keller Jordan 等, 2024）近年被用于大模型训练（如 Moonshot 的 Moonlight、Kimi K2）。关于 Muon 相对 AdamW 改变了什么，下列描述正确的是：

- **A.** Muon 同样为每个参数维护一阶、二阶两个状态，与 AdamW 的区别只是把 $\beta_2$ 改成了 0.95、去掉了偏差修正
- **B.** Muon 每一步对梯度矩阵做精确的 SVD，把所有奇异值置为 1 后作为更新，因此每步都要做一次完整的 SVD 分解
- **C.** Muon 对模型的全部参数（包括 Embedding、输出层、偏置与归一化层的增益）统一使用正交化的更新，不再需要 AdamW
- **D.** 对隐藏层二维权重的动量做 Newton–Schulz 迭代，近似正交化为 $UV^\top$ 作为更新；Embedding 等仍用 AdamW

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：Muon 改变的是二维权重矩阵的**更新方向**：AdamW 逐元素地做自适应缩放，Muon 则在矩阵层面把更新「正交化」。

按 Keller Jordan 的博客（2024-12）与 Moonshot 的论文（arXiv:2502.16982）：
- 先对梯度做动量累积（默认使用 Nesterov 风格，动量系数常取 0.95）；
- 把动量矩阵除以其 Frobenius 范数，再做 5 步 Newton–Schulz 迭代（五次多项式，系数约为 3.4445、−4.7750、2.0315），得到近似的 $UV^\top$，即离原矩阵最近的半正交矩阵；迭代可以用 bfloat16 运行；
- 只用于隐藏层的二维矩阵（卷积核展平成矩阵后也可以），Embedding、输出层、偏置与归一化增益仍然交给 AdamW。

**直觉**：Transformer 中权重的梯度（动量）矩阵往往由少数几个奇异方向主导。正交化把所有奇异方向的步长拉平，让原本被压制的「稀有方向」也能得到有效的更新。

- A 错：Muon 只保存一份动量，不维护二阶矩，优化器状态约为 AdamW 的一半。
- B 错：精确的 SVD 太慢，Muon 用的是只含矩阵乘法的 Newton–Schulz 迭代来近似，适合 GPU 计算，迭代后的奇异值只是大致落在 1 附近。
- C 错：Embedding 与输出层的作用与隐藏层不同，按照提出者的建议仍使用 AdamW。

<sub>考点：新型优化器　｜　出处：Keller Jordan, Muon: An optimizer for hidden layers in neural networks（博客，2024-12）；Liu 等, Muon is Scalable for LLM Training, arXiv:2502.16982</sub>

</details>

---

## 多选题

<a name="FND-OPT-013"></a>

### FND-OPT-013　进阶 · 考频 ★★

关于 Adam / AdamW 的超参数与特性，下列说法**正确**的有：

- **A.** 由于除以了 $\sqrt{\hat v}$，Adam 每个参数的更新幅度大致在学习率量级，对梯度的整体尺度不敏感
- **B.** $\beta_1$ 越大，一阶矩的滑动平均窗口越短，动量越弱，参数更新越依赖当前这一步的梯度
- **C.** $\epsilon$ 不只防止除以 0：取值较大时，梯度很小的参数的更新会退化为近似的动量 SGD
- **D.** 大模型训练常把 $\beta_2$ 从 0.999 调到 0.95，让二阶矩更快跟上梯度幅度的变化，避免步长失控
- **E.** Adam 要为每个参数额外保存一阶矩和二阶矩两个状态，用 FP32 存储时每个参数额外占 8 字节

<details>
<summary>答案与解析</summary>

**答案：ACDE**

**解析：**

**结论**：A、C、D、E 正确。

- A 对：梯度稳定时 $|\hat m/\sqrt{\hat v}|\approx1$，更新幅度约为 $\eta$；梯度噪声大时比值小于 1，更新更保守。这使得 Adam 的学习率比 SGD 的更容易设定。
- B 错：说反了。$\beta_1$ 越大，滑动平均的窗口（约 $1/(1-\beta_1)$ 步）越长，越依赖历史（动量越强、越平滑）；$\beta_1=0$ 时 Adam 退化为带偏差修正的 RMSprop。
- C 对：更新量为 $\eta\hat m/(\sqrt{\hat v}+\epsilon)$，$\epsilon$ 在 $\sqrt{\hat v}$ 很小时起主导作用：$\sqrt{\hat v}\ll\epsilon$ 时分母近似为常数 $\epsilon$，更新退化为学习率 $\eta/\epsilon$ 的动量 SGD；$\epsilon$ 过小则可能放大噪声。此外，$10^{-8}$ 在 FP16 中会下溢为 0，若优化器状态用 FP16 存储，可能引发除以 0。
- D 对：$\beta_2=0.999$ 时，二阶矩约平均了最近 1000 步。某个参数长期梯度很小（$v$ 很小），突然出现大梯度时，$v$ 来不及增大，$\hat m/\sqrt{\hat v}$ 会变得很大，造成异常的大步长，这是 loss spike 的来源之一。0.95 只平均约 20 步，反应更快。
- E 对：这正是混合精度训练中「每参数约 16 字节」显存账本里优化器状态的部分；Adafactor、8 bit Adam、Muon（只存动量）等方法都在压缩这部分开销。

<sub>考点：Adam与AdamW、训练不稳定诊断</sub>

</details>

---

<a name="FND-OPT-019"></a>

### FND-OPT-019　挑战 · 考频 ★★

关于 batch size 对训练的影响，下列说法**正确**的有：

- **A.** batch 越小，每一步的计算越快、参数更新越频繁，因此训练到相同 loss 所需的墙钟时间越短
- **B.** 大 batch 可能出现泛化差距，Keskar 等认为与尖锐极小值有关；调好学习率、warmup 与训练步数往往能显著缩小差距
- **C.** 小批量梯度估计的方差只与学习率有关，与 batch 大小无关，因此加大 batch 不会让梯度更准确
- **D.** 存在「临界 batch size」：在它以内加大 batch 几乎能等比例减少训练步数，超过之后收益迅速递减
- **E.** 按线性规则同步放大学习率并配合 warmup，batch 就可以无限增大，最终精度与小 batch 训练保持一致

<details>
<summary>答案与解析</summary>

**答案：BD**

**解析：**

**结论**：B、D 正确。

- A 错：batch 太小时无法充分利用 GPU 的并行能力，每步的时间几乎不随 batch 减小而缩短，步数却多得多，墙钟时间反而更长。
- B 对：Keskar 等（arXiv:1609.04836）观察到大 batch 训练倾向于收敛到尖锐极小值、泛化较差；Hoffer 等（2017）等后续工作表明，调整学习率并训练足够的步数，可以大幅缩小这一差距。
- C 错：梯度估计的方差与学习率无关，而与 batch 大小有关：独立同分布抽样时，均值的方差为 $\sigma^2/B$，batch 越大，梯度噪声越小。
- D 对：McCandlish 等（2018, arXiv:1812.06162）用「梯度噪声尺度」来预测临界 batch size：batch 远小于它时，噪声主导，加大 batch 几乎等比例地减少步数；远大于它时，梯度已经足够准确，继续加大 batch 只增加每步的计算量，步数几乎不再减少。临界 batch size 还会随训练进行（loss 下降）而增大，这也是有些训练在过程中逐步增大 batch 的原因。
- E 错：Goyal 等（2017）在 ImageNet 上发现，batch 超过 8k 后，线性缩放加 warmup 也无法保持精度。

<sub>考点：批大小与学习率　｜　出处：论文：arXiv:1812.06162（https://arxiv.org/abs/1812.06162）、arXiv:1609.04836（https://arxiv.org/abs/1609.04836）</sub>

</details>

---

<a name="FND-OPT-032"></a>

### FND-OPT-032　进阶 · 考频 ★★★

训练中观察到下列现象，对应的推断**合理**的有：

- **A.** 验证 loss 低于训练 loss → 说明验证集与训练集有重叠，应立即重新划分数据并重新训练
- **B.** loss 在训练初期剧烈震荡并发散，调小学习率或加长 warmup 后恢复正常 → 原来的学习率过大
- **C.** 第 1 步 loss 就是 NaN → 先查输入数据和损失的实现（如 $\log0$、除以 0），而不是先调学习率
- **D.** loss 尖峰总出现在相同位置，并与某个数据分片的边界对齐 → 很可能是数据问题，应检查这些批次
- **E.** 梯度范数长期接近 0、loss 几乎不动 → 学习率太大导致参数跳进了平坦区域，应降低学习率

<details>
<summary>答案与解析</summary>

**答案：BCD**

**解析：**

**结论**：B、C、D 合理。

- A 错：验证 loss 低于训练 loss 可能是正常的：训练时开着 Dropout 等正则，评估时没有；训练 loss 通常是整个 epoch 的平均，而那时模型还在变好；训练集用了强数据增强等。当然也要排除验证集泄露、验证集过于简单等问题，但不能断言「一定有 bug」。
- B 对：典型的学习率过大的表现。
- C 对：第 1 步时参数还没被更新，学习率还没起作用，NaN 只能来自数据、模型的前向或损失的计算，例如输入含 NaN / inf、标签越界、$\log0$、除以 0。
- D 对：与数据位置相关的、可复现的尖峰，强烈提示是数据问题（如乱码、超长重复文本、标签错误）。大模型训练中常用的应对是回滚到尖峰前的检查点，并跳过这些数据。
- E 错：更可能是梯度消失（初始化或激活函数不当、ReLU 死亡）、参数被意外冻结（`requires_grad=False`，或没有被加入优化器）、学习率过小、损失被错误地 detach 等。学习率太大通常表现为震荡和发散，而不是梯度长期接近 0，降低学习率只会让参数更难动起来。

<sub>考点：训练不稳定诊断</sub>

</details>

---

<a name="FND-OPT-034"></a>

### FND-OPT-034　挑战 · 考频 ★★

关于 Muon、MuonClip 与 Lion 等新型优化器，下列说法**正确**的有：

- **A.** Kimi K2 的 MuonClip 加入了 QK-Clip：某个头的最大注意力 logit 超过阈值时，在更新后按比例缩小该头的 $W_q$、$W_k$
- **B.** 《Muon is Scalable for LLM Training》指出两个关键：加入权重衰减；按矩阵形状缩放更新，使其 RMS 与 AdamW 相当
- **C.** Lion 与 Adam 一样需要维护一阶、二阶两个状态，并用 $\sqrt v$ 对每个元素做自适应缩放，显存与 Adam 相同
- **D.** Newton–Schulz 迭代必须在 FP64 下精确地收敛到奇异值恰好为 1，否则正交化不准确，训练会发散
- **E.** Muon 只为每个矩阵参数保存一份动量，优化器状态的显存约为 AdamW（一阶矩加二阶矩）的一半

<details>
<summary>答案与解析</summary>

**答案：ABE**

**解析：**

**结论**：A、B、E 正确。

- A 对：Kimi K2 技术报告（arXiv:2507.20534）称，在他们的实验中，注意力 logit 爆炸在 Muon 下比在 AdamW 下更常见。QK-Clip 按注意力头监控当前 batch 中的最大 logit，超过阈值 $\tau$（K2 中为 100）时，用 $\sqrt{\tau/S_{\max}}$ 分别缩放该头的 $W_q$、$W_k$；它在优化器更新之后执行，不改变当前步的前向和反向计算。K2（总参数 1T、激活 32B）预训练 15.5T token，全程没有出现 loss spike。
- B 对：论文（Moonshot, arXiv:2502.16982）把正交化后的更新乘以 $0.2\sqrt{\max(A,B)}$。论文分析指出，形状为 $A\times B$ 的满秩矩阵，正交化后的更新 RMS 约为 $\sqrt{1/\max(A,B)}$，随形状变化；乘以 $\sqrt{\max(A,B)}$ 抵消这一点，再乘以 0.2，使其落在 AdamW 常见的更新 RMS（约 0.2～0.4）范围内，从而可以直接沿用为 AdamW 调好的学习率与权重衰减。论文的缩放律实验显示，在计算最优的训练设置下，Muon 的计算效率约为 AdamW 的 2 倍；据此训练的 Moonlight 是一个 3B 激活、16B 总参数的 MoE 模型，训练了 5.7T token。
- C 错：Lion（Chen 等, 2023, arXiv:2302.06675）只保存动量，更新为「动量与当前梯度插值后取符号」，每个元素的更新幅度相同；因为符号函数让更新的范数较大，它的学习率通常要比 AdamW 小。
- D 错：Keller Jordan 的实现在 bfloat16 中运行 5 步迭代，调过的系数是为了收敛得快，官方实现的注释称迭代结果的奇异值大致在 0.5～1.5 之间（近似均匀分布），并不精确等于 1，这对训练效果没有明显影响。
- E 对：Muon 的状态只有动量矩阵，AdamW 有 $m$、$v$ 两份。

<sub>考点：新型优化器　｜　出处：Keller Jordan, Muon 官方实现 muon.py（zeropower_via_newtonschulz5 注释），https://github.com/KellerJordan/Muon ；Liu 等, Muon is Scalable for LLM Training, arXiv:2502.16982；Kimi K2 技术报告, arXiv:2507.20534；Chen 等, Symbolic Discovery of Optimization Algorithms（Lion）, arXiv:2302.06675</sub>

</details>

---

## 判断题

<a name="FND-OPT-016"></a>

### FND-OPT-016　进阶 · 考频 ★★

warmup 只对 Adam 这类自适应优化器有意义；用带动量的 SGD 训练时，即使把 batch size 和学习率按比例放大很多倍，也不需要 warmup。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。Goyal 等（2017, arXiv:1706.02677）用带动量的 SGD 在 ImageNet 上训练 ResNet-50，把 batch 从 256 扩大到 8192，学习率按线性规则放大到 3.2。他们发现：如果一开始就使用大学习率，训练初期会不稳定、最终精度明显下降；采用「逐步 warmup」（前 5 个 epoch 从 0.1 线性升到 3.2）之后，大 batch 训练的精度才与小 batch 基线持平。

原因：线性缩放规则假设「一步大 batch 的更新约等于 k 步小 batch 的更新之和」，这要求在这 k 步内梯度变化不大。训练初期参数变化剧烈，这个假设不成立，大学习率会造成破坏。warmup 的作用与优化器类型无关：在训练初期梯度不稳定、损失面曲率较大时，限制步长。

对 Adam 来说，warmup 还额外缓解了二阶矩估计初期方差大的问题，所以几乎是 Transformer 训练的标配。

<sub>考点：学习率调度与warmup、批大小与学习率　｜　出处：论文：arXiv:1706.02677（https://arxiv.org/abs/1706.02677）</sub>

</details>

---

<a name="FND-OPT-024"></a>

### FND-OPT-024　挑战 · 考频 ★

对于后面紧跟 BatchNorm 的卷积权重，网络的输出对该权重的整体缩放保持不变（尺度不变性）。此时权重衰减的主要作用不是限制模型的容量，而是让权重的范数保持在较小的水平，从而增大了这些权重的「有效学习率」。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。设 $f(\alpha w)=f(w)$ 对任意 $\alpha>0$ 成立（BN 会把缩放消掉），则：
1. **容量不受影响**：把 $w$ 缩小，函数完全不变，所以权重衰减并没有限制这一层能表示的函数。
2. **梯度与范数成反比**：对尺度不变的函数有 $\nabla f(\alpha w)=\frac1\alpha\nabla f(w)$，而且梯度与 $w$ 正交。不加衰减时，每次梯度更新都会让 $\lVert w\rVert$ 变大（正交的增量只会加长向量），梯度随之变小，「方向」上的有效步长约为 $\eta/\lVert w\rVert^2$，学习越来越慢。
3. **衰减的真实作用**：权重衰减让 $\lVert w\rVert$ 保持在较小的平衡值，使方向上的有效学习率维持在较高的水平。

这一观点来自 van Laarhoven（2017, arXiv:1706.05350）以及 Zhang 等（2018, arXiv:1810.12281，《Three Mechanisms of Weight Decay Regularization》）。它说明：在带归一化层的现代网络中，权重衰减与学习率是耦合的，单独调一个往往不够；不能简单地把权重衰减理解为「L2 正则限制模型复杂度」。

<sub>考点：权重衰减　｜　出处：论文：arXiv:1706.05350（https://arxiv.org/abs/1706.05350）、arXiv:1810.12281（https://arxiv.org/abs/1810.12281）</sub>

</details>

---

<a name="FND-OPT-028"></a>

### FND-OPT-028　基础 · 考频 ★★

梯度累积能在不增加显存的前提下等效地增大 batch，因此它也能按比例缩短训练的墙钟时间。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。梯度累积只解决**显存**问题，不解决**速度**问题。

累积 $k$ 步时，仍然要依次做 $k$ 次前向与反向，总计算量与一次性处理大 batch 相同；而且 $k$ 次计算是串行的，每次只用到一个 micro-batch 的并行度。与「单卡就能放下大 batch」相比，它通常更慢（小 micro-batch 的 GPU 利用率较低）；与「不累积、用小 batch 训练相同的样本数」相比，计算量相同，只是参数更新的次数变成了 $1/k$。

**梯度累积的价值**：
1. 显存放不下目标 batch 时，仍然能用目标 batch 训练，保持与论文或基线一致的超参数；
2. 数据并行中减少梯度同步的次数（PyTorch DDP 可以在前 $k-1$ 个 micro-batch 上用 `no_sync()` 跳过 all-reduce），降低通信开销。

真正缩短墙钟时间，靠的是增加并行的硬件（更多卡做数据并行），或者提高单卡效率（混合精度、FlashAttention 等）。

<sub>考点：梯度累积</sub>

</details>

---

## 填空题

<a name="FND-OPT-005"></a>

### FND-OPT-005　进阶 · 考频 ★★

动量有两种常见写法：(a) PyTorch 的 `SGD(momentum=μ)`：$v\leftarrow\mu v+g$，$\theta\leftarrow\theta-\eta v$；(b) 指数滑动平均（EMA）形式：$v\leftarrow\mu v+(1-\mu)g$，$\theta\leftarrow\theta-\eta v$。取 $\mu=0.9$，若梯度长时间恒为 $g$，稳态时写法 (a) 每步的参数更新量为 ____ $\eta g$，写法 (b) 为 ____ $\eta g$。

<details>
<summary>答案与解析</summary>

**答案：** (1) 10；(2) 1

**解析：**

**稳态**：令 $v$ 不再变化。
- (a) $v=\mu v+g\Rightarrow v=\dfrac{g}{1-\mu}=10g$，更新量 $10\eta g$；
- (b) $v=\mu v+(1-\mu)g\Rightarrow v=g$，更新量 $\eta g$。

**启示**：两种写法只差一个常数因子 $1/(1-\mu)$，但在同一学习率下等效步长相差 10 倍。把 EMA 形式的超参数照搬到 PyTorch 的 SGD 上，学习率要除以 10，否则等效步长会大 10 倍，训练很可能发散；反过来照搬，则会慢 10 倍。修改 $\mu$ 时同理：PyTorch 写法中，把 $\mu$ 从 0.9 提到 0.99，等效步长会从 $10\eta$ 变成 $100\eta$。Adam 的一阶矩使用的是 (b) 这种 EMA 形式（再加偏差修正）。

<sub>考点：动量</sub>

</details>

---

<a name="FND-OPT-018"></a>

### FND-OPT-018　进阶 · 考频 ★★

用带动量的 SGD 训练，batch 为 256 时学习率为 0.1。把 batch 扩大到 2048，按线性缩放规则，学习率应设为 ____。另一个任务用 Adam 训练，batch 为 256 时学习率为 $1\times10^{-4}$；batch 扩大到 2048 时，按平方根缩放规则，学习率约为 ____（保留三位有效数字）。

<details>
<summary>答案与解析</summary>

**答案：** (1) 0.8；(2) 2.83e-4 / 2.83×10^-4 / 0.000283 / 2.83e-04

**解析：**

batch 扩大 $k=2048/256=8$ 倍。
- **线性缩放**（适用于 SGD，Goyal 等, 2017）：$0.1\times8=0.8$。
- **平方根缩放**（适用于 Adam、RMSprop 等自适应方法）：$10^{-4}\times\sqrt8\approx2.83\times10^{-4}$。

**为什么不同**：从随机微分方程（SDE）近似的角度看，SGD 的「学习率 / batch」决定了梯度噪声的强度，batch 扩大 $k$ 倍时，学习率也扩大 $k$ 倍，才能保持同样的动力学。Adam 的更新经过了 $\sqrt v$ 的归一化，Malladi 等（2022, arXiv:2205.10287）推导出平方根缩放规则：学习率乘以 $\sqrt k$，同时把 $1-\beta_1$、$1-\beta_2$ 都乘以 $k$，$\epsilon$ 除以 $\sqrt k$。

**实践**：两条规则都只是起点。batch 超过「临界 batch size」后，规则会失效；改了 batch 之后，仍需要在小范围内重新搜索学习率，并配合 warmup。

<sub>考点：批大小与学习率　｜　出处：论文：arXiv:2205.10287（https://arxiv.org/abs/2205.10287）</sub>

</details>

---

## 计算题

<a name="FND-OPT-002"></a>

### FND-OPT-002　进阶 · 考频 ★★

用梯度下降最小化二次函数 $f(w)=\frac12(100w_1^2+w_2^2)$，固定学习率 $\eta$。求：
(1) 保证收敛的最大学习率；
(2) 取能让两个方向收缩得一样快的最优固定学习率 $\eta^*=\frac{2}{\lambda_{\max}+\lambda_{\min}}$，每步误差的收缩因子是多少？要把误差缩小到原来的 1/1000，约需多少步？
(3) 用牛顿法需要几步？

<details>
<summary>答案与解析</summary>

**答案：(1) $\eta<0.02$；(2) 收缩因子 $99/101\approx0.980$，约 346 步；(3) 1 步**

**解析：**

**分析**：海森矩阵 $H=\mathrm{diag}(100,1)$，梯度为 $Hw$。梯度下降 $w\leftarrow w-\eta Hw$ 在两个坐标上分别乘以 $(1-100\eta)$ 与 $(1-\eta)$。

1. **稳定条件**：每个方向都要 $|1-\eta\lambda_i|<1$，即 $\eta<2/\lambda_{\max}=0.02$。学习率受最陡的方向（最大曲率）限制。
2. **最优固定学习率**：$\eta^*=2/101\approx0.0198$，两个方向的收缩因子绝对值相等，为 $\dfrac{\kappa-1}{\kappa+1}=\dfrac{99}{101}\approx0.980$，其中条件数 $\kappa=\lambda_{\max}/\lambda_{\min}=100$。误差缩小 1000 倍需要 $\ln1000/\ln(101/99)\approx345.4$，即约 346 步。若取 $\eta=0.01$，平坦方向每步只收缩 1%，约需 688 步。
3. **牛顿法**：$w\leftarrow w-H^{-1}\nabla f=w-H^{-1}Hw=0$，一步到达最优点。

**启示**：梯度下降的收敛速度由条件数决定：陡峭方向限制了学习率的上限，平坦方向因此进展缓慢，轨迹呈「之」字形振荡。动量、自适应学习率（Adam 等）、归一化以及二阶预条件方法，本质上都在缓解这种曲率不均衡的问题。

<sub>考点：梯度下降与SGD、二阶方法直觉</sub>

</details>

---

<a name="FND-OPT-007"></a>

### FND-OPT-007　进阶 · 考频 ★

某参数的梯度在每一步都恒为 $g=2$，忽略 $\epsilon$。
(1) 用 Adagrad（学习率 $\eta$），第 1、100、10000 步的更新量各是多少？
(2) 用 RMSprop（$\rho=0.99$，与 PyTorch 默认值相同，状态 $v$ 从 0 开始，无偏差修正），第 1、100、1000 步的更新量各是多少？

<details>
<summary>答案与解析</summary>

**答案：(1) $\eta$、$0.1\eta$、$0.01\eta$；(2) 约 $10\eta$、$1.26\eta$、$1.00\eta$**

**解析：**

**(1) Adagrad**：$G_t=\sum g^2=4t$，更新量 $\eta\cdot\dfrac{2}{\sqrt{4t}}=\dfrac{\eta}{\sqrt t}$。第 1、100、10000 步分别为 $\eta$、$0.1\eta$、$0.01\eta$。即使梯度一直很稳定，步长也按 $1/\sqrt t$ 不断缩小。

**(2) RMSprop**：$v_t=(1-\rho^t)g^2$，更新量 $\dfrac{\eta g}{\sqrt{v_t}}=\dfrac{\eta}{\sqrt{1-\rho^t}}$。
- $t=1$：$1/\sqrt{0.01}=10$，即 $10\eta$；
- $t=100$：$1/\sqrt{1-0.99^{100}}=1/\sqrt{0.634}\approx1.26$；
- $t=1000$：约 $1.00\eta$。

**启示**：
- Adagrad 的步长持续衰减，长时间训练可能「学不动」；RMSprop 的步长稳定在 $\eta$ 左右。
- RMSprop 的 $v$ 从 0 开始，前期被严重低估，第一步的更新量是稳态的 10 倍，这在训练初期很危险。Adam 用偏差修正 $\hat v_t=v_t/(1-\beta_2^t)$ 消除这种低估，第一步的更新量恰好是 $\eta$；warmup 也能缓解这一问题。

<sub>考点：Adagrad与RMSprop</sub>

</details>

---

<a name="FND-OPT-008"></a>

### FND-OPT-008　进阶 · 考频 ★★★

Adam 的超参数为 $\beta_1=0.9$、$\beta_2=0.999$、学习率 $\eta=0.01$，忽略 $\epsilon$，状态 $m_0=v_0=0$。某参数的梯度每一步都恒为 $g=0.5$。
(1) 第 1 步的更新量是多少？第 2 步呢？
(2) 如果去掉偏差修正（直接用 $m_t/\sqrt{v_t}$），第 1 步、第 2 步的更新量各是多少？
(3) 不做偏差修正时，更新量与「正确值」之比在哪一步附近最大，约为多少？

<details>
<summary>答案与解析</summary>

**答案：(1) 都是 0.01；(2) 约 0.0316 与 0.0425；(3) 约第 12 步，约 6.6 倍**

**解析：**

**(1) 有偏差修正**：
- 第 1 步：$m_1=0.1\times0.5=0.05$，$v_1=0.001\times0.25=0.00025$；$\hat m_1=0.05/0.1=0.5$，$\hat v_1=0.00025/0.001=0.25$；更新量 $\eta\hat m_1/\sqrt{\hat v_1}=0.01\times0.5/0.5=0.01$。
- 第 2 步：$m_2=0.095$，$v_2=0.00049975$；修正后仍是 $\hat m=0.5$、$\hat v=0.25$，更新量 0.01。

梯度恒定时，修正后的更新量始终为 $\eta\cdot\mathrm{sign}(g)$，与梯度大小无关。

**(2) 无偏差修正**：更新量为 $\eta\cdot\dfrac{1-\beta_1^t}{\sqrt{1-\beta_2^t}}$。
- 第 1 步：$0.01\times0.1/\sqrt{0.001}\approx0.0316$，是正确值的 3.16 倍；
- 第 2 步：$0.01\times0.19/\sqrt{0.001999}\approx0.0425$，是 4.25 倍。

**(3)**：比值 $\dfrac{1-0.9^t}{\sqrt{1-0.999^t}}$ 先增大后减小，约在第 12 步达到最大值 6.57；第 100 步约为 3.24，第 1000 步约为 1.26，之后才趋于 1。

**原因**：$m$ 与 $v$ 都从 0 开始，初期被低估。$m$ 的「记忆」短（约 10 步），很快恢复；$v$ 的「记忆」长（约 1000 步），被低估得更严重、更持久。除以被低估的 $\sqrt v$，更新量就被放大。偏差修正把两者都除以 $1-\beta^t$，恢复成无偏估计。训练初期参数还是随机的，这几倍的过大步长足以导致不稳定，这也是 warmup 常与 Adam 搭配使用的原因之一。

<sub>考点：Adam与AdamW</sub>

</details>

---

<a name="FND-OPT-015"></a>

### FND-OPT-015　进阶 · 考频 ★★

某次训练共 100000 步，学习率调度为：前 2000 步从 0 线性升到峰值 $3\times10^{-4}$；之后按余弦曲线衰减，在第 100000 步降到最小值 $3\times10^{-5}$，即
$$\eta_t=\eta_{\min}+\tfrac12(\eta_{\max}-\eta_{\min})\Big(1+\cos\big(\pi\cdot\tfrac{t-2000}{98000}\big)\Big),\quad t>2000$$
求第 500、51000、75500 步的学习率。

<details>
<summary>答案与解析</summary>

**答案：第 500 步 $7.5\times10^{-5}$；第 51000 步 $1.65\times10^{-4}$；第 75500 步约 $6.95\times10^{-5}$**

**解析：**

1. **第 500 步**（warmup 阶段）：$3\times10^{-4}\times500/2000=7.5\times10^{-5}$。
2. **第 51000 步**：进度 $(51000-2000)/98000=0.5$，$\cos(0.5\pi)=0$，
   $\eta=3\times10^{-5}+\tfrac12\times2.7\times10^{-4}\times1=1.65\times10^{-4}$，恰好是峰值与最小值的中点。
3. **第 75500 步**：进度 0.75，$\cos(0.75\pi)\approx-0.7071$，
   $\eta=3\times10^{-5}+\tfrac12\times2.7\times10^{-4}\times0.2929\approx3\times10^{-5}+3.95\times10^{-5}=6.95\times10^{-5}$。

**曲线特点**：余弦调度开始时下降很慢（长时间保持较高的学习率，有利于探索），中段近似线性下降，末段又变得平缓（在低学习率下精细收敛）。最小值常取峰值的 10%（如 Llama 2）。注意余弦周期要与实际训练长度匹配：如果计划训练 10 万步、却在第 5 万步停下，学习率还停在中间值，模型没有经过「退火」，效果会明显变差。WSD 调度（恒定学习率加末期快速衰减）缓解了这一问题，便于随时接续训练。

<sub>考点：学习率调度与warmup</sub>

</details>

---

<a name="FND-OPT-020"></a>

### FND-OPT-020　基础 · 考频 ★★

某模型只有两组参数，一次反向后的梯度为：A 组 $(3,4)$，B 组 $(12)$。阈值为 1。
(1) 全局梯度范数是多少？按全局范数裁剪后，各组梯度是多少？
(2) 若改为逐组（per-tensor）裁剪，即每组各自把范数限制在 1 以内，结果是多少？若改为按值裁剪到 $[-1,1]$ 呢？
(3) 把三种结果分别与原梯度方向比较，计算余弦相似度。

<details>
<summary>答案与解析</summary>

**答案：(1) 范数 13，裁剪后 A 组 $(0.231,0.308)$、B 组 $(0.923)$；(2) 逐组裁剪为 $(0.6,0.8)$、$(1)$，按值裁剪为 $(1,1)$、$(1)$；(3) 余弦相似度依次为 1、约 0.925、约 0.844**

**解析：**

1. **全局范数**：把所有梯度拼成一个向量 $(3,4,12)$，范数为 $\sqrt{9+16+144}=13$，超过阈值 1。缩放系数为 $1/13$，得到 A 组 $(3/13,4/13)\approx(0.231,0.308)$，B 组 $12/13\approx0.923$，裁剪后的总范数恰好为 1。
2. **逐组裁剪**：A 组范数 5，缩放为 $(0.6,0.8)$；B 组范数 12，缩放为 $(1)$。**按值裁剪**：每个元素截断到 $[-1,1]$，得 $(1,1)$ 与 $(1)$。
3. **方向**：原梯度 $u=(3,4,12)$。
   - 全局裁剪：只是整体缩放，余弦相似度为 1；
   - 逐组裁剪：$(0.6,0.8,1)$，$\cos=\dfrac{1.8+3.2+12}{13\times\sqrt{2}}\approx0.925$；
   - 按值裁剪：$(1,1,1)$，$\cos=\dfrac{19}{13\sqrt3}\approx0.844$。

**结论**：全局范数裁剪只改变步长、不改变方向，是大模型训练的标准做法（阈值常取 1.0）；逐组裁剪改变了各组之间的相对比例；按值裁剪改变最大，梯度最大的分量被压得最狠，方向偏差最大。

<sub>考点：梯度裁剪</sub>

</details>

---

## 代码输出题

<a name="FND-OPT-003"></a>

### FND-OPT-003　基础 · 考频 ★★

下面的代码用 4 种学习率对 $f(x)=x^2$ 做 10 步梯度下降（初始 $x=1$）。输出是什么？

```python
for lr in [0.1, 0.5, 1.0, 1.1]:
    x = 1.0
    for _ in range(10):
        x -= lr * 2 * x
    print(lr, round(x, 3))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
0.1 0.107
0.5 0.0
1.0 1.0
1.1 6.192
```

**解析：**

梯度为 $2x$，每步 $x\leftarrow x-2\eta x=(1-2\eta)x$，10 步后 $x=(1-2\eta)^{10}$。
- $\eta=0.1$：因子 0.8，$0.8^{10}\approx0.107$，平稳地单调收敛；
- $\eta=0.5$：因子 0，一步直达最优点 0。此时 $\eta=1/f''$，等价于牛顿法；
- $\eta=1.0$：因子 $-1$，在 $1$ 与 $-1$ 之间来回跳，永不收敛，偶数步回到 1.0；
- $\eta=1.1$：因子 $-1.2$，振荡且幅度越来越大，$(-1.2)^{10}\approx6.192$，发散。

**启示**：对曲率为 $L$（这里 $f''=2$）的方向，学习率小于 $1/L$ 时单调收敛，介于 $1/L$ 与 $2/L$ 之间时振荡收敛，超过 $2/L$ 时发散。训练中 loss 剧烈震荡甚至变成 NaN，最常见的原因之一就是学习率超过了损失面最陡方向所允许的上限。

<sub>考点：梯度下降与SGD</sub>

</details>

---

<a name="FND-OPT-026"></a>

### FND-OPT-026　基础 · 考频 ★★

下面是一个早停函数，返回「停止时的 epoch」与「最佳 epoch」（epoch 从 0 开始计）。输出是什么？

```python
def early_stop(val_losses, patience=2, min_delta=0.0):
    best, best_epoch, bad = float("inf"), -1, 0
    for epoch, loss in enumerate(val_losses):
        if loss < best - min_delta:
            best, best_epoch, bad = loss, epoch, 0
        else:
            bad += 1
            if bad >= patience:
                return epoch, best_epoch
    return len(val_losses) - 1, best_epoch

losses = [0.90, 0.70, 0.62, 0.64, 0.61, 0.63, 0.65, 0.60]
print(early_stop(losses, patience=2))
print(early_stop(losses, patience=3))
print(early_stop(losses, patience=2, min_delta=0.02))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
(6, 4)
(7, 7)
(4, 2)
```

**解析：**

**patience = 2**：第 0、1、2 个 epoch 依次刷新最优（0.62）；第 3 个（0.64）未改进，计数 1；第 4 个（0.61）刷新最优，计数清零；第 5 个（0.63）、第 6 个（0.65）连续两次未改进，在第 6 个 epoch 停止，最佳为第 4 个。

**patience = 3**：第 5、6 个 epoch 计数到 2，还没到 3；第 7 个（0.60）刷新最优，训练一直进行到结束，最佳为第 7 个。

**min_delta = 0.02**：只有比最优值低 0.02 以上才算改进。第 2 个 epoch 的 0.62 记为最优；第 3 个（0.64）不算改进；第 4 个的 0.61 虽然更低，但没有低于 $0.62-0.02=0.60$，也不算改进，计数到 2，在第 4 个 epoch 停止，最佳为第 2 个。

**启示**：patience 太小，容易因为噪声过早停止（第一组错过了第 7 个 epoch 的 0.60）；min_delta 太大，会把真实的小幅改进当成停滞。两者都要结合验证指标的波动幅度来设定。

<sub>考点：早停</sub>

</details>

---

## 代码填空题

<a name="FND-OPT-022"></a>

### FND-OPT-022　进阶 · 考频 ★★

补全按全局 L2 范数裁剪梯度的函数：`grads` 是各参数梯度（numpy 数组）组成的列表，函数原地缩放这些数组，并返回**裁剪前**的全局范数（语义与 PyTorch 的 `clip_grad_norm_` 相同）。

```python
import numpy as np

def clip_grad_norm(grads, max_norm, eps=1e-6):
    total = np.sqrt(sum(____ for g in grads))
    coef = max_norm / (total + eps)
    if coef < 1:
        for g in grads:
            g *= ____
    return total
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `np.sum(g ** 2)`；(2) `coef`

**解析：**

**两个空**：
1. `np.sum(g ** 2)`（写成 `(g ** 2).sum()`、`(g * g).sum()` 也可以）：每个张量的平方和，所有张量求和再开方，就是把所有梯度拼成一个长向量后的 L2 范数。
2. `coef`：超过阈值时，所有梯度乘以**同一个**系数 $\frac{c}{\lVert g\rVert}$，裁剪后总范数恰好为阈值，方向不变。

**细节**：
- `eps` 防止梯度全为 0 时除以 0（PyTorch 中为 $10^{-6}$）；
- 只有 `coef < 1` 时才缩放，范数低于阈值的梯度保持不变，不会被放大；
- 返回裁剪前的范数，用于记录日志、监控训练；它出现尖峰往往是 loss spike 的前兆；
- 分布式训练（如 ZeRO / FSDP）中，各卡只持有部分梯度，要先汇总各卡的平方和（all-reduce），再开方，不能各卡分别裁剪。

**测试**覆盖了：超过阈值时的缩放、未超过时保持不变、返回值为裁剪前的范数、多维数组，以及方向不变。

<sub>考点：梯度裁剪</sub>

</details>

---

## 代码改错题

<a name="FND-OPT-010"></a>

### FND-OPT-010　进阶 · 考频 ★★★

下面的函数为模型创建优化器，意图是：对矩阵类权重做 AdamW 式的（解耦）权重衰减，偏置与归一化层的参数不做衰减。训练中发现，调大 `weight_decay` 后，梯度很小的权重被衰减得很快，梯度大的权重却几乎没有被衰减，与预期的「所有权重按同一比例收缩」不符。请指出问题并修正。

```python
import torch

def make_optimizer(model, lr=1e-3, weight_decay=0.1):
    decay = [p for p in model.parameters() if p.ndim >= 2]      # 矩阵权重：做权重衰减
    no_decay = [p for p in model.parameters() if p.ndim < 2]    # 偏置、Norm 的缩放：不衰减
    return torch.optim.Adam([
        {"params": decay, "weight_decay": weight_decay},
        {"params": no_decay, "weight_decay": 0.0},
    ], lr=lr)
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：用的是 `torch.optim.Adam`。它的 `weight_decay` 是**L2 正则**：把 $\lambda\theta$ 加到梯度上，再一起进入一阶矩、二阶矩，最后被 $\sqrt{\hat v}$ 除。于是：
- 梯度大的参数，$\sqrt{\hat v}$ 大，衰减项被大幅缩小，几乎不衰减；
- 梯度很小的参数，衰减项在梯度中占主导，被 Adam 归一化成约 $\eta$ 量级的步长。例如梯度为 0 时，每步大约固定减去 $\eta\cdot\mathrm{sign}(\theta)$，与 $\lambda$ 的大小几乎无关。

**修正**：改用 `torch.optim.AdamW`，参数分组不变：

```python
return torch.optim.AdamW([
    {"params": decay, "weight_decay": weight_decay},
    {"params": no_decay, "weight_decay": 0.0},
], lr=lr)
```

AdamW 每步先执行 $\theta\leftarrow\theta(1-\eta\lambda)$，再做 Adam 更新，衰减比例与梯度大小无关。

**修正后的代码：**

```python
import torch

def make_optimizer(model, lr=1e-3, weight_decay=0.1):
    decay = [p for p in model.parameters() if p.ndim >= 2]      # 矩阵权重：做权重衰减
    no_decay = [p for p in model.parameters() if p.ndim < 2]    # 偏置、Norm 的缩放：不衰减
    return torch.optim.AdamW([
        {"params": decay, "weight_decay": weight_decay},
        {"params": no_decay, "weight_decay": 0.0},
    ], lr=lr)
```

**解析：**

**测试的设计**：把所有梯度设为 0，这时正确的 AdamW 只做 $\theta\leftarrow\theta(1-10^{-3}\times0.1)$，权重的变化约为 $10^{-4}\theta$；而 Adam + L2 的「梯度」变成 $0.1\theta$，经偏差修正后更新量约为 $\eta=10^{-3}$，比预期大一个数量级以上，测试因此失败。

**背景**：对 SGD 而言，L2 正则与权重衰减等价（差一个学习率因子）；对 Adam 这类自适应方法则不等价。Loshchilov 与 Hutter（arXiv:1711.05101）指出了这一点，提出解耦的 AdamW，它的泛化效果通常更好，最优学习率与权重衰减系数也更容易分开调节。如今大模型训练几乎都用 AdamW，常见的权重衰减系数为 0.1。

**参数分组**：偏置、LayerNorm / RMSNorm 的缩放参数等一维参数通常不做衰减，这里按 `p.ndim` 划分是常见的写法。

<sub>考点：Adam与AdamW、权重衰减　｜　出处：论文：arXiv:1711.05101（https://arxiv.org/abs/1711.05101）</sub>

</details>

---

## 编程题

<a name="FND-OPT-009"></a>

### FND-OPT-009　挑战 · 考频 ★★★

用 numpy 手写 AdamW 的一步更新，语义与 `torch.optim.AdamW` 一致：

```python
def adamw_step(param, grad, state, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=0.01):
    """原地更新 param（numpy 数组）并返回它；state 是一个 dict，首次调用时为空 {}"""
```

- `state` 中保存步数 `step` 以及一阶矩 `m`、二阶矩 `v`，首次调用时初始化；
- 需要偏差修正；权重衰减必须是「解耦」的（直接作用于参数，不加到梯度上）。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import numpy as np

def adamw_step(param, grad, state, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=0.01):
    b1, b2 = betas
    if not state:                                     # 第一次调用时初始化状态
        state.update(step=0, m=np.zeros_like(param), v=np.zeros_like(param))
    state["step"] += 1
    t = state["step"]
    param *= 1 - lr * weight_decay                    # 解耦的权重衰减：直接缩小参数
    state["m"] = b1 * state["m"] + (1 - b1) * grad
    state["v"] = b2 * state["v"] + (1 - b2) * grad * grad
    m_hat = state["m"] / (1 - b1 ** t)                # 偏差修正
    v_hat = state["v"] / (1 - b2 ** t)
    param -= lr * m_hat / (np.sqrt(v_hat) + eps)
    return param
```

**测试用例：**

```python
import torch

def run_ours(p0, grads, **kw):
    p, st = p0.copy(), {}
    for g in grads:
        p = adamw_step(p, g, st, **kw)
    return p, st

def run_torch(p0, grads, lr, betas, eps, weight_decay):
    p = torch.tensor(p0, requires_grad=True)
    opt = torch.optim.AdamW([p], lr=lr, betas=betas, eps=eps, weight_decay=weight_decay)
    for g in grads:
        p.grad = torch.tensor(g)
        opt.step()
    return p.detach().numpy()

rng = np.random.default_rng(0)
p0 = rng.normal(size=(3, 4))
grads = [rng.normal(size=(3, 4)) * s for s in (1.0, 0.1, 5.0, 1e-3, 2.0)]
for kw in [dict(lr=1e-2, betas=(0.9, 0.999), eps=1e-8, weight_decay=0.1),
           dict(lr=3e-4, betas=(0.9, 0.95), eps=1e-6, weight_decay=0.0)]:
    ours, st = run_ours(p0, grads, **kw)
    assert np.allclose(ours, run_torch(p0, grads, **kw), atol=1e-10), kw
    assert st["step"] == 5

# 第一步：偏差修正后更新量约为 lr * sign(g)，与梯度大小无关
p, st = np.array([1.0, -1.0]), {}
adamw_step(p, np.array([1e-3, -50.0]), st, lr=0.01, weight_decay=0.0)
assert np.allclose(p, [1.0 - 0.01, -1.0 + 0.01], atol=1e-6)

# 梯度为 0 时只剩权重衰减：p <- p * (1 - lr*wd)
p, st = np.array([2.0]), {}
adamw_step(p, np.array([0.0]), st, lr=0.1, weight_decay=0.5)
assert np.allclose(p, [2.0 * (1 - 0.05)])
```

**解析：**

**公式**（与 PyTorch 的实现一致）：
$$\theta\leftarrow\theta(1-\eta\lambda),\quad m\leftarrow\beta_1m+(1-\beta_1)g,\quad v\leftarrow\beta_2v+(1-\beta_2)g^2$$
$$\hat m=\frac{m}{1-\beta_1^t},\quad \hat v=\frac{v}{1-\beta_2^t},\quad \theta\leftarrow\theta-\eta\frac{\hat m}{\sqrt{\hat v}+\epsilon}$$

**要点**：
1. 步数 `t` 先加 1 再做偏差修正，否则第一步会除以 $1-\beta^0=0$；
2. 权重衰减直接乘在参数上，不进入 $m$、$v$，所以不会被 $\sqrt{\hat v}$ 缩放，这正是 AdamW 与「Adam + L2」的区别；
3. $\epsilon$ 加在 $\sqrt{\hat v}$ 之外（PyTorch 的做法），而不是加在根号里面；
4. 原地修改 `param`（`*=`、`-=`），与 PyTorch 优化器原地更新参数的行为一致。

**测试**：与 `torch.optim.AdamW` 逐步对拍（含 $\lambda=0$ 的情形），并检查第一步更新量约为 $\eta\cdot\mathrm{sign}(g)$、梯度为 0 时只剩权重衰减两个性质。如果把权重衰减写成 `grad + wd * param`，或者漏掉偏差修正，对拍都会失败。

**延伸**：AdamW 原论文（Loshchilov 与 Hutter, arXiv:1711.05101）中，衰减项乘的是学习率调度系数 $\eta_t$，而不是基础学习率；PyTorch 则把衰减项乘以当前学习率，所以调 `lr` 时有效的衰减强度也会随之改变。

<sub>考点：Adam与AdamW、权重衰减　｜　出处：论文：arXiv:1711.05101（https://arxiv.org/abs/1711.05101）</sub>

</details>

---

## 简答题

<a name="FND-OPT-011"></a>

### FND-OPT-011　进阶 · 考频 ★★★

AdamW 中的权重衰减与「Adam + L2 正则」有什么区别？为什么在 SGD 中两者等价，在 Adam 中却不等价？实践中该怎么用？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **两种写法**：
   - Adam + L2：在损失中加 $\frac\lambda2\lVert\theta\rVert^2$，等价于把梯度改为 $g+\lambda\theta$，然后照常计算 $m$、$v$，更新 $\theta\leftarrow\theta-\eta\hat m/(\sqrt{\hat v}+\epsilon)$；
   - AdamW（解耦权重衰减）：$m$、$v$ 只用原始梯度 $g$ 计算，参数单独按比例收缩：$\theta\leftarrow\theta-\eta\big(\hat m/(\sqrt{\hat v}+\epsilon)+\lambda\theta\big)$。
2. **SGD 中等价**：$\theta\leftarrow\theta-\eta(g+\lambda\theta)=(1-\eta\lambda)\theta-\eta g$，L2 正则正好就是按比例 $(1-\eta\lambda)$ 收缩参数。
3. **Adam 中不等价**：L2 项 $\lambda\theta$ 混进梯度后，也会被自适应分母 $\sqrt{\hat v}$ 除：
   - 历史梯度大的参数，分母大，衰减被削弱；
   - 历史梯度小的参数，衰减被放大。

   结果是「梯度越大的参数越少被正则」，与 L2 正则「惩罚大权重」的初衷不符；衰减强度还与学习率、$\beta_2$ 等耦合在一起，难以调节。AdamW 让所有参数按同一比例收缩，恢复了权重衰减原本的含义。
4. **效果**：Loshchilov 与 Hutter（arXiv:1711.05101）的实验表明，AdamW 的泛化通常优于 Adam + L2，最优的学习率与衰减系数也更容易解耦地搜索。
5. **实践**：
   - 大模型训练的默认选择是 AdamW，权重衰减系数常取 0.1（微调时也常用 0 到 0.1）；
   - 偏置、归一化层的参数通常不做衰减；
   - 注意 PyTorch 中 `Adam(weight_decay=...)` 是 L2 写法，要用 `AdamW`；
   - PyTorch 的 AdamW 把衰减乘以当前学习率，学习率随调度衰减时，衰减强度也一起衰减。

**评分要点（共 10 分）：**

- 写出 Adam + L2 与 AdamW 两种更新公式（3 分）
- 推导 SGD 中二者等价（2 分）
- 解释在 Adam 中 L2 项被 √v 缩放导致不等价及其后果（3 分）
- 给出实践建议（系数、不衰减的参数、PyTorch 的 Adam 与 AdamW 之别等）（2 分）

**讲解：**

**常见失分点**：只说「AdamW 把权重衰减解耦了」，说不清被什么解耦（与自适应缩放 $\sqrt{\hat v}$ 解耦）；以为 `Adam(weight_decay=0.1)` 就是 AdamW；推不出 SGD 中二者的等价关系；把权重衰减说成「对梯度做衰减」。

<sub>考点：Adam与AdamW、权重衰减　｜　出处：论文：arXiv:1711.05101（https://arxiv.org/abs/1711.05101）</sub>

</details>

---

<a name="FND-OPT-029"></a>

### FND-OPT-029　挑战 · 考频 ★★

牛顿法利用了二阶信息，在凸二次问题上一步就能收敛。请说明：(1) 牛顿法的更新公式及其优势；(2) 为什么深度学习中几乎不直接使用牛顿法；(3) 有哪些近似利用二阶（曲率）信息的方法，它们与 Adam 等常用优化器是什么关系。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **公式与优势**：在当前点对损失做二阶泰勒展开 $f(\theta+\Delta)\approx f+g^\top\Delta+\frac12\Delta^\top H\Delta$，令其对 $\Delta$ 的导数为 0，得 $\Delta=-H^{-1}g$。优势：
   - 按曲率自动调整各方向的步长：陡的方向走小步，平的方向走大步，不受条件数影响（对二次函数一步到位）；
   - 对参数的线性变换不变（仿射不变性），不需要手动调学习率；
   - 在最优点附近二次收敛。
2. **为什么不直接用**：
   - **存储**：$n$ 个参数的海森矩阵有 $n^2$ 个元素，7B 模型约为 $4.9\times10^{19}$ 个，不可能存下；
   - **计算**：求逆或解线性方程组的复杂度约为 $O(n^3)$；
   - **非凸**：深度网络的海森矩阵往往不定，$-H^{-1}g$ 可能指向鞍点甚至上升方向，需要阻尼或改用正定的近似（如 Gauss-Newton、Fisher 信息矩阵）；
   - **随机性**：小批量估计的曲率噪声很大。
3. **近似方法**：
   - **对角近似**：Adagrad、RMSprop、Adam 用梯度平方的累加（Adagrad）或指数滑动平均（RMSprop、Adam），即经验 Fisher 对角线的估计，来缩放各参数的步长，可以看作极简的对角预条件；注意它们用的是 $\sqrt{v}$ 而不是 $v$，与牛顿法并不相同；
   - **块对角 / Kronecker 分解**：K-FAC（Martens 与 Grosse, 2015）把每层的 Fisher 矩阵近似为两个小矩阵的 Kronecker 积；Shampoo（Gupta 等, 2018）为每个矩阵参数维护左右两个预条件矩阵；SOAP 在 Shampoo 的特征基中运行 Adam；
   - **只用海森-向量积**：Hessian-free 方法用共轭梯度法近似求解 $H\Delta=-g$，只需要 $Hv$，而 $Hv$ 的代价与几次梯度计算相当，不需要构造 $H$；
   - **拟牛顿**：L-BFGS 用最近若干步的梯度差来近似 $H^{-1}$，适合全批量、确定性的问题，在大规模随机训练中较少使用；
   - **其他**：Sophia 用对角海森的估计并做裁剪；Muon 对矩阵梯度做正交化，可以理解为在谱范数下的最速下降，与「白化」曲率的思想相近。

**评分要点（共 10 分）：**

- 写出牛顿更新 $-H^{-1}g$ 并说明按曲率调整步长等优势（3 分）
- 从存储、计算、非凸、随机性等角度说明不直接使用的原因（3 分）
- 列举至少两类近似方法（对角、K-FAC / Shampoo、Hessian-free、L-BFGS 等）（3 分）
- 说明 Adam 与二阶方法的关系及差别（1 分）

**讲解：**

**常见失分点**：说「牛顿法不用学习率，所以一定更好」，忽视非凸时方向可能错误；算不出海森矩阵的存储量级；把 Adam 直接说成「二阶方法」（它只用到梯度的二阶矩，不涉及损失的二阶导数）；不知道海森-向量积可以不构造 $H$ 而高效地计算。

<sub>考点：二阶方法直觉　｜　出处：Nocedal 与 Wright, Numerical Optimization（第 2 版, 2006，牛顿法与 L-BFGS）；Martens, Deep Learning via Hessian-free Optimization（ICML 2010）；Martens 与 Grosse, K-FAC, arXiv:1503.05671；Gupta 等, Shampoo, arXiv:1802.09568；Vyas 等, SOAP, arXiv:2409.11321；Liu 等, Sophia, arXiv:2305.14342</sub>

</details>

---

<a name="FND-OPT-035"></a>

### FND-OPT-035　挑战 · 考频 ★★

面试官问：「Muon 相对 AdamW 改了什么？为什么可能更好？要在大模型训练中用好它，需要注意哪些问题？」请系统地回答。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **改了什么**：
   - AdamW 逐元素地用 $\hat m/(\sqrt{\hat v}+\epsilon)$ 作为更新，把每个参数看成独立的标量；
   - Muon 把二维权重当作矩阵（线性映射）来处理：先算 Nesterov 动量 $M$，再把 $M$ 正交化，得到约 $UV^\top$（$M=USV^\top$），即保留奇异向量、把所有奇异值换成 1；正交化用 5 步 Newton–Schulz 迭代实现，只需矩阵乘法，可以在 bfloat16 中运行。
2. **为什么可能更好**：
   - 梯度和动量矩阵通常由少数几个奇异方向主导，正交化把各方向的步长拉平，让被压制的方向也能学习；
   - 理论上，它可以理解为在谱范数下的最速下降（Bernstein 与 Newhouse 的工作，arXiv:2409.20325），与「线性层的作用是把输入向量映射为输出向量」这一结构相匹配；
   - 经验上，它在 NanoGPT 速通等基准上刷新了记录；Moonshot（arXiv:2502.16982）的缩放律实验显示，在计算最优的训练设置下，其计算效率约为 AdamW 的 2 倍。
3. **适用范围**：只用于隐藏层的二维矩阵（Q、K、V 最好分开处理）；Embedding、输出层、偏置与归一化增益仍用 AdamW，所以实际上是「Muon + AdamW」的混合优化器。
4. **扩展到大模型的要点**（Moonshot）：
   - 加入权重衰减，否则权重与激活的尺度会持续增长；
   - 按矩阵形状缩放更新（乘以 $0.2\sqrt{\max(A,B)}$），让更新的 RMS 与 AdamW 一致，从而可以复用 AdamW 的学习率与权重衰减。
5. **开销**：
   - 显存：只存一份动量，约为 AdamW 状态的一半；
   - 计算：Newton–Schulz 迭代的额外 FLOPs 在常见语言模型训练设置下约在 1% 以内（Keller Jordan 的估计）；
   - 分布式：正交化需要完整的梯度矩阵，ZeRO-1 这类切分优化器状态的方式需要额外的 gather，Moonshot 估计通信量是分布式 AdamW 的 1～1.25 倍。
6. **稳定性**：Kimi K2 报告注意力 logit 爆炸在 Muon 下更常见，提出 MuonClip（Muon + QK-Clip：最大 logit 超过阈值时，在更新后缩小该头的 $W_q$、$W_k$），K2 在 15.5T token 的预训练中没有出现 loss spike。
7. **注意事项**：
   - 预训练与微调的优化器最好一致：Moonshot 的实验中，「Muon 预训练 + Muon 微调」效果最好；对 AdamW 预训练的模型改用 Muon 微调，没有明显优势；
   - 证据主要来自少数团队的公开报告，在自己的任务上仍需与调好的 AdamW 基线认真对比。

**评分要点（共 10 分）：**

- 说清 Muon 的更新：动量 + Newton–Schulz 正交化（约 UVᵀ），并与 AdamW 的逐元素缩放对比（3 分）
- 给出可能更好的直觉或理论解释及经验证据（2 分）
- 说明只用于二维隐藏层矩阵，其余参数用 AdamW（1 分）
- 提到权重衰减与更新 RMS 对齐等扩展要点（2 分）
- 提到显存、计算或分布式开销，以及 MuonClip / QK-Clip、微调一致性等注意事项（2 分）

**讲解：**

**常见失分点**：说成「Muon 用 SVD」（实际用 Newton–Schulz 迭代近似）；以为所有参数都用 Muon；说不出它与 AdamW 在显存上的差别；把 MuonClip 说成「对梯度做裁剪」（实际是在更新后缩放 $W_q$、$W_k$ 的权重）；把某个团队报告的收益当作普遍结论。前沿内容截至 2026 年 11 月仍在快速演进，回答时最好注明出处和时间。

<sub>考点：新型优化器、Adam与AdamW　｜　出处：Liu 等, Muon is Scalable for LLM Training, arXiv:2502.16982；Kimi K2 技术报告, arXiv:2507.20534；Chen 等, Symbolic Discovery of Optimization Algorithms（Lion）, arXiv:2302.06675</sub>

</details>

---

## 场景分析题

<a name="FND-OPT-031"></a>

### FND-OPT-031　挑战 · 考频 ★★★

团队用 FP16 混合精度（动态 loss scaling）训练一个 1.3B 的 Transformer，优化器为 Adam（$\epsilon=10^{-8}$），为了省显存，优化器状态也用 FP16 保存。前 3000 步一切正常，之后 loss 偶尔出现尖峰；第 3500 步 loss 变成 NaN，此后再也没有恢复。日志显示，在 NaN 出现前的几十步，梯度范数明显上升，loss scale 也被连续减半。请给出排查思路、可能的原因与修复方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**第一步：保留现场，定位第一个非有限值**
- 回到 NaN 之前最近的检查点，用相同的数据顺序复现；
- 逐层记录激活、梯度、参数、优化器状态的最大绝对值与 NaN / inf 计数，找出最先变成非有限值的张量；可以开启 `torch.autograd.detect_anomaly`（较慢，只用于复现）；
- 记下出问题的 step 和 batch，单独检查这批数据。

**可能的原因**：
1. **优化器状态用 FP16 保存**（本例最可疑）：$\epsilon=10^{-8}$ 小于 FP16 的最小正数（约 $6\times10^{-8}$），直接变成 0；梯度较小的参数，$g^2$ 在 FP16 中下溢为 0，$v=0$ 时更新量为 $m/(0+0)$，得到 inf 或 NaN（$0/0$）。另外 $v$ 的精度不足，也会导致更新量失真。
2. **前向溢出**：FP16 最大值为 65504，注意力 logits、某些激活或 loss 本身可能超过上限，得到 inf，再经过减法、softmax 变成 NaN。loss scaler 只能处理梯度的溢出（跳过这一步），处理不了前向的溢出。
3. **训练逐渐发散**：梯度范数上升、loss 尖峰是典型前兆，可能是学习率偏大、warmup 不足，或者注意力 logits 持续增长。
4. **数据问题**：异常样本（超长重复、乱码），或者所有标签都被掩码（有效 token 数为 0，按 token 求平均时出现 $0/0$）。

**修复**：
1. 主权重与优化器状态保持 FP32（标准的混合精度做法），只在前向和反向中使用半精度；
2. 优先改用 BF16：指数范围与 FP32 相同，基本消除溢出和下溢，也不再需要 loss scaling；
3. 稳定训练：适当降低峰值学习率、延长 warmup，开启全局梯度裁剪（如 1.0），把 $\beta_2$ 调到 0.95，对注意力使用 QK-Norm 或在输出层加 z-loss；
4. 数据与损失：跳过异常 batch，对按 token 平均的分母做 `clamp(min=1)`；
5. 安全阀：检测到 loss 或梯度为非有限值时跳过这一步并告警；若连续出现，自动回滚到最近的检查点，并跳过对应的数据。

**监控**：记录梯度范数（总体和分层）、更新量与参数范数之比、loss scale 的变化、激活与注意力 logits 的最大值，设置异常告警。

**评分要点（共 10 分）：**

- 给出定位第一个非有限值的系统排查方法（2 分）
- 指出 FP16 优化器状态中 $\epsilon$ 与 $g^2$ 下溢导致除以 0 的问题（2 分）
- 指出前向溢出、训练发散、数据或损失分母为 0 等其他原因（2 分）
- 给出 FP32 主权重与状态、BF16、降学习率、梯度裁剪、QK-Norm 等修复手段（3 分）
- 给出跳过、回滚与监控等工程保障（1 分）

**讲解：**

**常见失分点**：只说「降学习率」或「加梯度裁剪」，没有先定位 NaN 的来源；不知道 $10^{-8}$ 在 FP16 下会变成 0；误以为 loss scaling 能处理前向溢出；没有区分「偶发的单步溢出（scaler 自动跳过）」与「状态已被污染、无法恢复」两种情况。本例中 NaN 之后再也没有恢复，说明参数或优化器状态已经被 NaN 污染，必须回滚。

<sub>考点：训练不稳定诊断、Adam与AdamW</sub>

</details>

---
