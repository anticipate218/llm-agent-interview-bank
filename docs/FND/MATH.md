# FND-MATH · 数学基础

> 所属大类：机器学习与深度学习基础　｜　题量：32

线性代数、概率统计与信息论中面试常考的部分。

**考点覆盖**：向量与矩阵运算（3） · 矩阵的秩与分解（3） · 特征值与SVD（4） · 梯度与链式法则（3） · 雅可比与海森矩阵（3） · 常见概率分布（2） · 贝叶斯公式（2） · 期望方差与协方差（3） · 最大似然与最大后验（3） · 熵与交叉熵（4） · KL散度（6） · 互信息（2） · 数值稳定性（4）

**题型**：[单选题（8）](#单选题) · [多选题（4）](#多选题) · [判断题（4）](#判断题) · [填空题（5）](#填空题) · [计算题（4）](#计算题) · [代码输出题（3）](#代码输出题) · [代码改错题（1）](#代码改错题) · [简答题（2）](#简答题) · [场景分析题（1）](#场景分析题)

---

## 单选题

<a name="FND-MATH-001"></a>

### FND-MATH-001　基础 · 考频 ★★

LoRA 推理时不合并权重，旁路输出为 $BAx$，其中 $x\in\mathbb{R}^{k}$，$A\in\mathbb{R}^{r\times k}$，$B\in\mathbb{R}^{d\times r}$，$d=k=4096$，$r=16$。对单个 token，按 $B(Ax)$ 与按 $(BA)x$ 两种顺序计算这条旁路，乘加次数分别约为：

- **A.** $B(Ax)$ 约 $1.3\times10^{5}$ 次，$(BA)x$ 约 $2.9\times10^{8}$ 次
- **B.** 两者都约 $1.3\times10^{5}$ 次：矩阵乘法满足结合律，计算量与顺序无关
- **C.** $B(Ax)$ 约 $1.7\times10^{7}$ 次，$(BA)x$ 约 $1.3\times10^{5}$ 次
- **D.** 两者都约 $2.9\times10^{8}$ 次：都要先得到 $d\times k$ 的完整矩阵

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：结合律保证结果相同，但不保证计算量相同；先乘向量要便宜得多。

$(m\times n)$ 矩阵乘 $(n\times p)$ 矩阵需要 $mnp$ 次乘加（约 $2mnp$ FLOPs）。
- $B(Ax)$：$Ax$ 需 $rk=65536$ 次，$B(Ax)$ 需 $dr=65536$ 次，合计 $131072\approx1.3\times10^5$ 次；
- $(BA)x$：$BA$ 需 $drk\approx2.68\times10^8$ 次，再乘 $x$ 需 $dk\approx1.68\times10^7$ 次，合计约 $2.85\times10^8$ 次，是前者的约 2000 倍。

作为对照，主干 $W_0x$ 需要 $dk\approx1.68\times10^7$ 次，所以按 $B(Ax)$ 计算的旁路只增加约 0.8% 的计算量。

- B 错：结合律只保证结果相等，计算量由乘的顺序决定，这就是「矩阵链乘」问题要选顺序的原因。
- C 错：把两种顺序的计算量弄反了。
- D 错：$B(Ax)$ 全程只出现长度为 $r$ 和 $d$ 的向量，不会构造 $d\times k$ 的矩阵。

延伸：部署时也可以离线算一次 $W_0+BA$ 合并成一个矩阵，推理开销与原模型相同；需要频繁切换多个 LoRA 时，才保持不合并、按 $B(Ax)$ 计算。

<sub>考点：向量与矩阵运算</sub>

</details>

---

<a name="FND-MATH-002"></a>

### FND-MATH-002　基础 · 考频 ★★

向量检索中，查询向量与所有文档向量都做了 L2 归一化（模长为 1）。对同一个查询，「按欧氏距离从小到大排序」与「按余弦相似度从大到小排序」得到的结果：

- **A.** 一般不同：即使模长都为 1，欧氏距离仍对各维数值差异的绝对大小敏感，余弦只看方向夹角
- **B.** 只在维度不超过 3 时相同；高维空间中距离集中，欧氏距离的排序会与余弦相似度出现分歧
- **C.** 恰好相反：$\lVert a-b\rVert^2=2+2\cos\theta$，余弦相似度越大，欧氏距离也越大
- **D.** 完全相同：归一化后 $\lVert a-b\rVert^2=2-2\cos\theta$，距离是余弦相似度的单调递减函数

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：向量归一化以后，欧氏距离、余弦相似度、内积三者给出的排序完全一致。

展开平方距离：$\lVert a-b\rVert^2=\lVert a\rVert^2+\lVert b\rVert^2-2a\cdot b$。当 $\lVert a\rVert=\lVert b\rVert=1$ 时，$a\cdot b=\cos\theta$，于是 $\lVert a-b\rVert^2=2-2\cos\theta$。例如 $\cos\theta=0.8$ 时，平方距离为 0.4，距离约 0.632。余弦越大，距离越小，排序一致。这也是很多向量库在归一化后直接用内积（最快）代替余弦的原因。

- A 错：模长都为 1 时，$\lVert a-b\rVert$ 只由夹角决定，各维数值的差异已经完全体现在 $\cos\theta$ 中；长度的影响只在**未归一化**时存在。
- B 错：上面的恒等式对任意维度成立。高维中的距离集中现象会让各距离彼此接近、区分度下降，但不会改变两种度量之间的单调关系。
- C 错：展开式中是 $-2a\cdot b$，不是 $+2a\cdot b$；两者是单调递减关系。

<sub>考点：向量与矩阵运算</sub>

</details>

---

<a name="FND-MATH-003"></a>

### FND-MATH-003　进阶 · 考频 ★★

LoRA 把权重更新写成 $\Delta W=BA$，$B\in\mathbb{R}^{d\times r}$，$A\in\mathbb{R}^{r\times k}$，$r\ll\min(d,k)$，并且初始化时 $B=0$。从线性代数的角度看，下列说法正确的是：

- **A.** $\mathrm{rank}(\Delta W)\le r$，合并后 $W_0+\Delta W$ 的秩也不超过 $r$，所以微调后模型的表达能力会明显下降
- **B.** $\mathrm{rank}(\Delta W)\le r$，但 $W_0+\Delta W$ 的秩通常仍很高，LoRA 只约束「更新量」的秩
- **C.** $\mathrm{rank}(\Delta W)=r$ 恒成立，与 $A$、$B$ 的取值无关
- **D.** $\Delta W$ 共有 $r\cdot d\cdot k$ 个可训练参数，参数量随 $r$ 增长得很快

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：秩的约束只作用在增量 $\Delta W$ 上。

- 乘积的秩不超过任一因子的秩：$\mathrm{rank}(BA)\le\min(\mathrm{rank}B,\mathrm{rank}A)\le r$。
- 和的秩满足 $\mathrm{rank}(W_0+\Delta W)\le\mathrm{rank}(W_0)+\mathrm{rank}(\Delta W)$，这只是上界。预训练权重 $W_0$ 本身通常接近满秩，加上一个低秩增量后一般仍是满秩。LoRA 的假设是「微调所需的改动位于一个低维子空间」，而不是「整个权重是低秩的」。

逐项点评：
- A 错：混淆了增量的秩与合并后权重的秩。
- C 错：只有 $B$ 列满秩且 $A$ 行满秩时才有 $\mathrm{rank}(BA)=r$。初始化时 $B=0$，$\Delta W$ 的秩为 0；训练中也可能出现秩亏。
- D 错：参数量是 $r(d+k)$，与 $r$ 线性相关。$d=k=4096$、$r=16$ 时约 13 万，只占 $dk$ 的 0.8%。

<sub>考点：矩阵的秩与分解</sub>

</details>

---

<a name="FND-MATH-009"></a>

### FND-MATH-009　进阶 · 考频 ★★

设 $f(x)=x^\top Ax$，$A=\begin{pmatrix}1&2\\0&3\end{pmatrix}$。$f$ 在 $x=(1,1)^\top$ 处的梯度 $\nabla f$ 为：

- **A.** $(6,6)^\top$
- **B.** $(3,3)^\top$
- **C.** $(4,8)^\top$
- **D.** $(1,5)^\top$

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：二次型的梯度是 $\nabla_x(x^\top Ax)=(A+A^\top)x$，只有 $A$ 对称时才简化为 $2Ax$。

**计算**：$A+A^\top=\begin{pmatrix}2&2\\2&6\end{pmatrix}$，乘以 $(1,1)^\top$ 得 $(4,8)^\top$。

**用分量验证**：$f=x_1^2+2x_1x_2+3x_2^2$，$\partial f/\partial x_1=2x_1+2x_2=4$，$\partial f/\partial x_2=2x_1+6x_2=8$。

- A 错：$2Ax=(6,6)^\top$，误把 $A$ 当成对称矩阵套用 $2Ax$。
- B 错：$Ax=(3,3)^\top$，只对一侧的 $x$ 求导，漏了另一侧。
- D 错：$A^\top x=(1,5)^\top$，同样只对一侧求导。

**方法**：$f=\sum_{i,j}A_{ij}x_ix_j$，对 $x_k$ 求导时，$x_k$ 既可能作为 $x_i$ 出现、也可能作为 $x_j$ 出现，两部分分别贡献 $(A^\top x)_k$ 与 $(Ax)_k$。

<sub>考点：梯度与链式法则</sub>

</details>

---

<a name="FND-MATH-011"></a>

### FND-MATH-011　进阶 · 考频 ★★

记 $p=\mathrm{softmax}(z)$，$z\in\mathbb{R}^n$，其雅可比矩阵为 $J=\partial p/\partial z$。下列说法正确的是：

- **A.** $J$ 是对角矩阵：$i\ne j$ 时 $\partial p_i/\partial z_j=0$，因为 $p_i$ 只依赖于 $z_i$
- **B.** $J$ 对称且每行元素之和为 0，因而是奇异矩阵，对应「所有 logits 同加一个常数，输出不变」
- **C.** $J$ 的对角元素为 $p_i(1-p_i)$，非对角元素为 $p_ip_j$，所以 $J$ 的元素全都非负
- **D.** $J$ 满秩（秩为 $n$），因此由输出概率 $p$ 可以唯一地反推出 logits $z$

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：$J=\mathrm{diag}(p)-pp^\top$，即 $J_{ij}=p_i(\delta_{ij}-p_j)$。

- **对称**：$J_{ij}=J_{ji}=-p_ip_j$（$i\ne j$）。
- **行和为 0**：$\sum_jJ_{ij}=p_i-p_i\sum_jp_j=0$，即 $J\mathbf{1}=0$。全 1 向量在零空间里，所以 $J$ 奇异，秩至多为 $n-1$。几何含义：沿 $\mathbf{1}$ 方向移动 logits（全体加常数）不改变输出。

- A 错：分母 $\sum_ke^{z_k}$ 把所有分量耦合在一起，非对角元素 $-p_ip_j\neq0$。
- C 错：对角元素 $p_i(1-p_i)$ 没错，但非对角元素是 $-p_ip_j<0$：增大 $z_j$ 会让 $p_j$ 增大、其余概率减小（概率之和固定为 1）。
- D 错：$J$ 奇异；由 $p$ 只能确定 $z$ 到相差一个常数为止（$z_i=\log p_i+c$）。

**延伸**：$J$ 同时也是 log-sum-exp 函数的海森矩阵，它半正定，说明 log-sum-exp 是凸函数，因此多分类逻辑回归的交叉熵损失关于参数是凸的。

<sub>考点：雅可比与海森矩阵</sub>

</details>

---

<a name="FND-MATH-012"></a>

### FND-MATH-012　进阶 · 考频 ★★

函数 $f(x,y)=x^2+3xy+y^2$ 在原点处梯度为 0。关于原点的性质，下列判断正确的是：

- **A.** 海森矩阵的特征值为 2 和 2，原点是极小值点
- **B.** 海森矩阵的特征值为 5 和 $-1$，原点是极大值点
- **C.** 海森矩阵的特征值为 5 和 $-1$，原点是鞍点
- **D.** 海森矩阵的行列式为 $-5$，仅凭二阶信息无法判断原点的性质

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：海森矩阵特征值有正有负，驻点就是鞍点。

海森矩阵 $H=\begin{pmatrix}2&3\\3&2\end{pmatrix}$，特征值为 $2\pm3$，即 5 和 $-1$。
- 沿特征向量 $(1,1)$ 方向：$f(t,t)=5t^2$，向上弯；
- 沿 $(1,-1)$ 方向：$f(t,-t)=-t^2$，向下弯。

所以原点是鞍点。

- A 错：只看了对角元素，忽略了交叉项 $3xy$ 带来的非对角元素。
- B 错：极大值点要求海森矩阵负定（所有特征值为负）。
- D 错：行列式确实是 $4-9=-5$，但二维情形下行列式为负恰好说明两个特征值异号，可以断定是鞍点。只有海森矩阵奇异（有零特征值）时，二阶信息才不足以判断。

**延伸**：高维非凸损失中，梯度为 0 的点大多是鞍点而不是局部极小值（Dauphin 等, 2014, arXiv:1406.2572）。梯度下降在鞍点附近会变慢，SGD 的噪声与动量有助于离开鞍点。

<sub>考点：雅可比与海森矩阵　｜　出处：论文：arXiv:1406.2572（https://arxiv.org/abs/1406.2572）</sub>

</details>

---

<a name="FND-MATH-020"></a>

### FND-MATH-020　进阶 · 考频 ★★★

线性回归 $y=w^\top x+\varepsilon$，噪声 $\varepsilon\sim\mathcal{N}(0,\sigma^2)$，参数先验 $w\sim\mathcal{N}(0,\tau^2I)$。对 $w$ 做最大后验（MAP）估计，等价于最小化 $\sum_i(y_i-w^\top x_i)^2+\lambda\lVert w\rVert_2^2$，其中：

- **A.** $\lambda=\sigma^2/\tau^2$：噪声越大、先验越窄，正则就越强
- **B.** $\lambda=\tau^2/\sigma^2$：先验方差越大，正则就越强
- **C.** $\lambda=1/\tau^2$，与噪声方差无关
- **D.** $\lambda=\sigma^2/\tau^2$，但它对应的是 L1 正则，即 Lasso

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**推导**：负对数后验 = 负对数似然 + 负对数先验（略去常数）：
$$-\log p(w\mid D)=\frac{1}{2\sigma^2}\sum_i(y_i-w^\top x_i)^2+\frac{1}{2\tau^2}\lVert w\rVert^2+\text{const}$$
两边乘以 $2\sigma^2$，得 $\sum_i(y_i-w^\top x_i)^2+\frac{\sigma^2}{\tau^2}\lVert w\rVert^2$，所以 $\lambda=\sigma^2/\tau^2$。

**直觉**：先验越窄（$\tau$ 小），越相信「权重应接近 0」；噪声越大（$\sigma$ 大），越不相信数据。两者都让正则变强。

- B 错：把比例写反了，先验方差越大，约束越弱。
- C 错：只有把噪声方差固定为 1 时才成立；一般情况下 $\lambda$ 取决于两者之比。
- D 错：高斯先验对应 L2（岭回归）；零均值拉普拉斯先验 $p(w)\propto e^{-|w|/b}$ 才对应 L1（Lasso）。

<sub>考点：最大似然与最大后验</sub>

</details>

---

<a name="FND-MATH-025"></a>

### FND-MATH-025　挑战 · 考频 ★★

RLHF 中常用 KL 惩罚 $\mathrm{KL}(\pi_\theta\Vert\pi_{ref})$ 约束策略不要偏离参考模型太远。有人提议把它换成交叉熵 $H(\pi_\theta,\pi_{ref})=-E_{y\sim\pi_\theta}[\log\pi_{ref}(y)]$，理由是「交叉熵和 KL 只差一个常数，优化结果相同」。对这个提议，下列分析正确的是：

- **A.** 没有问题：$\mathrm{KL}(\pi_\theta\Vert\pi_{ref})=H(\pi_\theta,\pi_{ref})-H(\pi_{ref})$，被去掉的 $H(\pi_{ref})$ 与 $\theta$ 无关
- **B.** 有问题：$H(\pi_\theta,\pi_{ref})$ 可能取负值，用作惩罚项时优化目标没有下界，策略可以无限刷高奖励
- **C.** 有问题：由于 $H(\pi_\theta,\pi_{ref})\ge\mathrm{KL}(\pi_\theta\Vert\pi_{ref})$，惩罚变强，策略被推得比参考模型更多样，奖励难以提升
- **D.** $\mathrm{KL}(\pi_\theta\Vert\pi_{ref})=H(\pi_\theta,\pi_{ref})-H(\pi_\theta)$，去掉的熵随 $\theta$ 变化，只罚交叉熵会使策略塌缩到少数高概率输出上

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：「只差一个常数」只在第一个分布固定时成立；这里第一个分布正是被优化的策略。

监督学习里 $\mathrm{KL}(p_{data}\Vert q_\theta)=H(p_{data},q_\theta)-H(p_{data})$，被减去的是数据分布的熵，与 $\theta$ 无关，所以两者等价。RLHF 中 KL 的第一个参数是 $\pi_\theta$：
$$\mathrm{KL}(\pi_\theta\Vert\pi_{ref})=E_{\pi_\theta}[\log\pi_\theta-\log\pi_{ref}]=H(\pi_\theta,\pi_{ref})-H(\pi_\theta)$$
熵 $H(\pi_\theta)$ 随策略变化。最小化 KL 时，$-H(\pi_\theta)$ 这一项相当于熵奖励，鼓励策略保持多样性；只罚交叉熵 $-E_{\pi_\theta}[\log\pi_{ref}]$，它的最小值是把全部概率放在 $\pi_{ref}$ 最可能的输出上（一个确定性分布），策略会趋于塌缩、多样性丧失。带 KL 约束的最优策略是 $\pi^*\propto\pi_{ref}\exp(r/\beta)$，保留了 $\pi_{ref}$ 的多样性。

- A 错：把被减去的熵错写成 $H(\pi_{ref})$。
- B 错：语言模型的输出是离散的 token 序列，离散分布的交叉熵 $-\sum\pi\log\pi_{ref}\ge0$，不会为负；只有连续分布的微分熵、交叉熵才可能为负。
- C 错：离散情形下 $H(\pi_\theta,\pi_{ref})=\mathrm{KL}(\pi_\theta\Vert\pi_{ref})+H(\pi_\theta)\ge\mathrm{KL}(\pi_\theta\Vert\pi_{ref})$ 确实成立，但问题不在惩罚的大小，而在方向：去掉熵项后策略会变得更确定，而不是更多样。

**延伸**：实现中按 token 用采样估计 KL，常用 $\log\pi_\theta(y_t)-\log\pi_{ref}(y_t)$。如果漏掉 $\log\pi_\theta$ 这一项，就退化成了上面的交叉熵惩罚。

<sub>考点：KL散度、熵与交叉熵</sub>

</details>

---

## 多选题

<a name="FND-MATH-007"></a>

### FND-MATH-007　进阶 · 考频 ★★

关于特征值、奇异值与矩阵范数，下列说法**正确**的有：

- **A.** 矩阵 $A$ 的奇异值等于 $A^\top A$ 的特征值的算术平方根
- **B.** 谱范数等于最大奇异值，Frobenius 范数等于全部奇异值平方和的平方根
- **C.** 所有特征值都为正的实方阵一定是正定矩阵，即对任意非零 $x$ 都有 $x^\top Ax>0$
- **D.** 数据的协方差矩阵可能出现明显为负的特征值，这说明数据中存在负相关的特征
- **E.** 实对称矩阵的特征值都是实数，并且可以选出一组两两正交的特征向量

<details>
<summary>答案与解析</summary>

**答案：ABE**

**解析：**

**结论**：A、B、E 正确。

- A 对：设 $A=U\Sigma V^\top$，则 $A^\top A=V\Sigma^2V^\top$，其特征值正是 $\sigma_i^2$。
- B 对：$\lVert A\rVert_2=\max_{\lVert x\rVert=1}\lVert Ax\rVert=\sigma_{\max}$；$\lVert A\rVert_F^2=\mathrm{tr}(A^\top A)=\sum\sigma_i^2$。
- C 错：正定性要求对任意非零 $x$ 有 $x^\top Ax>0$，还通常要求对称。反例 $A=\begin{pmatrix}1&5\\0&1\end{pmatrix}$ 的特征值都是 1，但取 $x=(1,-1)$ 得 $x^\top Ax=-3<0$。
- D 错：协方差矩阵 $\Sigma=E[(x-\mu)(x-\mu)^\top]$ 满足 $v^\top\Sigma v=\mathrm{Var}(v^\top x)\ge0$，是半正定的，特征值不可能为负。负相关体现在非对角元素为负，不体现在特征值上；数值计算中出现极小的负特征值（如 $-10^{-15}$），只是浮点误差。
- E 对：这是谱定理，实对称矩阵可以正交对角化 $A=Q\Lambda Q^\top$。

<sub>考点：特征值与SVD、向量与矩阵运算</sub>

</details>

---

<a name="FND-MATH-013"></a>

### FND-MATH-013　基础 · 考频 ★★

关于常见的概率分布，下列说法**正确**的有：

- **A.** 若 $X\sim\mathcal{N}(\mu,\sigma^2)$，则 $e^X$ 的均值为 $e^{\mu+\sigma^2/2}$，而不是 $e^{\mu}$
- **B.** 泊松分布 $\mathrm{Poisson}(\lambda)$ 的均值和方差都等于 $\lambda$
- **C.** $U(-a,a)$ 的方差为 $a^2/3$；Xavier 均匀初始化取 $a=\sqrt{6/(n_{in}+n_{out})}$，对应方差 $2/(n_{in}+n_{out})$
- **D.** 伯努利分布 $\mathrm{Bern}(p)$ 的方差为 $p(1-p)$，在 $p=0.5$ 时最大
- **E.** 拉普拉斯分布 $p(x)\propto e^{-|x|/b}$ 的尾部比高斯分布更轻，用它建模噪声时对离群点更敏感

<details>
<summary>答案与解析</summary>

**答案：ABCD**

**解析：**

**结论**：A、B、C、D 正确。

- A 对：$E[e^X]$ 就是正态分布的矩母函数在 $t=1$ 处的值，$M(t)=e^{\mu t+\sigma^2t^2/2}$，所以均值为 $e^{\mu+\sigma^2/2}$。由于 $e^x$ 是凸函数，按 Jensen 不等式 $E[e^X]\ge e^{E[X]}=e^{\mu}$；$e^{\mu}$ 是它的中位数而不是均值。对数正态分布取值恒为正、右偏。
- B 对：泊松分布的均值与方差都是 $\lambda$，常用来建模计数数据。
- C 对：$U(-a,a)$ 的方差为 $(2a)^2/12=a^2/3$。代入 $a^2=6/(n_{in}+n_{out})$，得 $2/(n_{in}+n_{out})$，这就是 Xavier（Glorot）初始化的目标方差。
- D 对：$\mathrm{Var}=E[X^2]-E[X]^2=p-p^2$，开口向下的抛物线，在 $p=0.5$ 处取最大值 0.25。
- E 错：拉普拉斯分布的密度按 $e^{-|x|/b}$ 衰减（指数中是 $|x|$ 的一次方），比高斯的 $e^{-x^2/2\sigma^2}$ 慢，是**重尾**分布。用它建模噪声，对应的极大似然是最小化绝对误差（L1 / MAE），对离群点**更稳健**。

<sub>考点：常见概率分布</sub>

</details>

---

<a name="FND-MATH-021"></a>

### FND-MATH-021　挑战 · 考频 ★★

关于极大似然估计（MLE）与最大后验估计（MAP），下列说法**正确**的有：

- **A.** MAP 估计在重参数化下保持不变：若 $\hat\theta$ 是 $\theta$ 的 MAP 估计，则 $g(\hat\theta)$ 一定是 $g(\theta)$ 的 MAP 估计
- **B.** MLE 等价于最小化反向 KL 散度 $\mathrm{KL}(p_\theta\Vert p_{data})$
- **C.** 高斯分布方差的极大似然估计 $\frac1n\sum_i(x_i-\bar x)^2$ 是有偏估计，其期望小于真实方差
- **D.** 在参数取值范围内使用均匀先验（密度为常数）时，MAP 估计与 MLE 相同
- **E.** 若先验在真实参数附近的密度为正，样本量趋于无穷时，MAP 估计与 MLE 趋于一致

<details>
<summary>答案与解析</summary>

**答案：CDE**

**解析：**

**结论**：C、D、E 正确。

- A 错：MLE 有这种不变性，MAP 没有。后验是概率密度，换元 $\phi=g(\theta)$ 时密度要乘以雅可比因子 $|d\theta/d\phi|$，众数（mode）的位置会移动。
- B 错：MLE 等价于最小化**前向** KL $\mathrm{KL}(p_{data}\Vert p_\theta)$：$\frac1n\sum\log p_\theta(x_i)\approx E_{p_{data}}[\log p_\theta]=-H(p_{data})-\mathrm{KL}(p_{data}\Vert p_\theta)$，其中 $H(p_{data})$ 与 $\theta$ 无关。
- C 对：$E\big[\frac1n\sum(x_i-\bar x)^2\big]=\frac{n-1}{n}\sigma^2$，偏小；除以 $n-1$ 的样本方差才是无偏的。例如 $n=5$、$\sigma^2=4$ 时，MLE 的期望为 3.2。
- D 对：先验为常数时，后验正比于似然，两者的最大值点相同。
- E 对：对数似然随样本数 $n$ 线性增长，对数先验不随 $n$ 变化，数据量大时先验的影响被淹没。

<sub>考点：最大似然与最大后验</sub>

</details>

---

<a name="FND-MATH-028"></a>

### FND-MATH-028　进阶 · 考频 ★★

关于互信息 $I(X;Y)$，下列说法**正确**的有：

- **A.** InfoNCE 损失给出互信息的上界 $I(X;Y)\le\log N-\mathcal{L}_{\text{InfoNCE}}$，损失越小上界越紧
- **B.** $I(X;Y)=\mathrm{KL}\big(p(x,y)\Vert p(x)p(y)\big)\ge0$，取等当且仅当 $X$、$Y$ 独立
- **C.** 对离散随机变量，当 $X$ 与 $Y$ 高度相关时，$I(X;Y)$ 可以超过 $\min\big(H(X),H(Y)\big)$
- **D.** 若 $X$ 与 $Y$ 的皮尔逊相关系数为 0，则二者没有任何统计依赖，$I(X;Y)=0$
- **E.** $I(X;Y)=H(X)-H(X\mid Y)=H(Y)-H(Y\mid X)$，关于 $X$、$Y$ 对称

<details>
<summary>答案与解析</summary>

**答案：BE**

**解析：**

**结论**：B、E 正确。

- A 错：CPC（van den Oord 等, 2018, arXiv:1807.03748）证明 $I(X;Y)\ge\log N-\mathcal{L}_{\text{InfoNCE}}$，$N$ 为每组的候选数（1 个正例加 $N-1$ 个负例）。它是**下界**：最小化 InfoNCE 是在抬高互信息的下界，而且这个下界不超过 $\log N$，这也是对比学习偏爱大量负例的一个理论解释。
- B 对：互信息衡量联合分布离「独立时的乘积分布」有多远，由 KL 的非负性得 $I\ge0$，取等当且仅当 $p(x,y)=p(x)p(y)$。
- C 错：$I(X;Y)=H(X)-H(X\mid Y)$，离散情形下条件熵非负，所以 $I\le H(X)$，同理 $I\le H(Y)$。即使 $Y$ 完全由 $X$ 确定，互信息也只能达到 $H(Y)$，不会更大。
- D 错：相关系数只刻画线性关系。$X\sim\mathcal{N}(0,1)$、$Y=X^2$ 时相关系数为 0，但 $Y$ 完全由 $X$ 决定，互信息大于 0。
- E 对：互信息是「知道一个变量后，另一个变量不确定性的减少量」，两种写法都等于 $H(X)+H(Y)-H(X,Y)$，是对称的。

<sub>考点：互信息　｜　出处：论文：arXiv:1807.03748（https://arxiv.org/abs/1807.03748）</sub>

</details>

---

## 判断题

<a name="FND-MATH-006"></a>

### FND-MATH-006　进阶 · 考频 ★★

对实对称矩阵，奇异值恰好等于特征值的绝对值；但对一般的实方阵，「奇异值 = 特征值的绝对值」不一定成立。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。
- **对称矩阵成立**：实对称矩阵可以正交对角化 $A=Q\Lambda Q^\top$。记 $S=\mathrm{diag}(\mathrm{sign}(\lambda_i))$，则 $A=Q\,|\Lambda|\,(SQ^\top)$，其中 $Q$ 与 $SQ^\top$ 都是正交矩阵，这正是一个 SVD，所以奇异值为 $|\lambda_i|$。更一般地，正规矩阵（$A^\top A=AA^\top$）都满足这一关系。
- **一般方阵不成立**：反例 $A=\begin{pmatrix}1&1\0&1\end{pmatrix}$。它是上三角矩阵，两个特征值都是 1；奇异值却是 $A^\top A=\begin{pmatrix}1&1\1&2\end{pmatrix}$ 的特征值的平方根，即 $\frac{\sqrt5+1}{2}\approx1.618$ 与 $\frac{\sqrt5-1}{2}\approx0.618$。

**区别**：特征值描述 $Av=\lambda v$，即「方向不变、只做伸缩」的方向，可能是复数，只对方阵定义；奇异值描述 $A$ 把单位球映射成椭球后各主轴的长度，总是非负实数，任意形状的矩阵都有。

**实践意义**：分析深层网络或 RNN 的梯度是否爆炸，关心的是雅可比连乘的**奇异值**（决定向量被放大多少倍）。只看特征值会误判：上例的特征值都是 1，单步却能把某些方向放大到 1.618 倍。

<sub>考点：特征值与SVD</sub>

</details>

---

<a name="FND-MATH-014"></a>

### FND-MATH-014　进阶 · 考频 ★

若随机变量 $X$ 与 $Y$ 都服从标准正态分布 $\mathcal{N}(0,1)$，且二者不相关（$\mathrm{Cov}(X,Y)=0$），则 $X+Y$ 服从正态分布 $\mathcal{N}(0,2)$。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。不相关只能保证方差：$\mathrm{Var}(X+Y)=1+1+2\mathrm{Cov}(X,Y)=2$；而 $X+Y$ 是否服从正态，要求 $X$、$Y$ **联合**正态（例如相互独立）。只知道两个边缘分布都是正态、且不相关，既推不出联合正态，也推不出独立。

**反例**：取 $S$ 等概率为 $\pm1$，与 $X$ 独立，令 $Y=SX$。由对称性，$Y$ 也服从 $\mathcal{N}(0,1)$，而且 $\mathrm{Cov}(X,Y)=E[S]E[X^2]=0$。但 $X+Y=(1+S)X$ 以 1/2 的概率恰好等于 0，以 1/2 的概率等于 $2X$。它的均值为 0、方差恰好是 2，却在 0 处有一个概率质量为 1/2 的点，不可能是正态分布。

**正确说法**：若 $X$、$Y$ **相互独立**且都服从正态分布（或更一般地联合正态），则 $X+Y$ 服从正态分布，均值、方差分别为两者之和（联合正态但相关时，方差还要加 $2\mathrm{Cov}$）。只有在联合正态的前提下，「不相关」才等价于「独立」。

<sub>考点：常见概率分布</sub>

</details>

---

<a name="FND-MATH-019"></a>

### FND-MATH-019　基础 · 考频 ★★

一般情况下，两个随机变量的协方差为 0 并不能推出它们相互独立；但如果 $X$、$Y$ 服从二元正态分布（联合正态），协方差为 0 就一定能推出 $X$、$Y$ 相互独立。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。
- **一般情形**：独立能推出不相关（协方差为 0），反过来不成立，因为协方差只衡量**线性**相关。反例：$X\sim\mathcal{N}(0,1)$，$Y=X^2$，$\mathrm{Cov}(X,Y)=E[X^3]-E[X]E[X^2]=0$，但 $Y$ 完全由 $X$ 决定。
- **联合正态**：联合密度完全由均值和协方差矩阵决定。协方差为 0 时协方差矩阵是对角阵，联合密度恰好分解为两个边缘密度之积，因此相互独立。
- **注意**：只知道「$X$、$Y$ 各自服从正态分布」是不够的，必须是**联合**正态。例如取与 $X$ 独立的随机符号 $S=\pm1$，令 $Y=SX$：$X$、$Y$ 都是标准正态且协方差为 0，但 $|Y|=|X|$，两者显然不独立。

**延伸**：互信息 $I(X;Y)=0$ 才在一般情形下等价于独立，它能刻画非线性依赖。PCA 得到的主成分彼此不相关，但未必独立；ICA（独立成分分析）追求的才是独立。

<sub>考点：期望方差与协方差</sub>

</details>

---

<a name="FND-MATH-026"></a>

### FND-MATH-026　基础 · 考频 ★★

KL 散度满足非负性，并且 $\mathrm{KL}(p\Vert q)=0$ 当且仅当 $p=q$，因此它是一种衡量两个分布之间距离的度量（metric）。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。度量需要满足非负性、同一性、**对称性**和**三角不等式**，KL 散度只满足前两条。
- 不对称：一般 $\mathrm{KL}(p\Vert q)\neq\mathrm{KL}(q\Vert p)$。例如 $p=(0.9,0.1)$、$q=(0.5,0.5)$ 时，前者约 0.368 nat，后者约 0.511 nat。
- 不满足三角不等式。

所以 KL 叫「散度」而不叫「距离」。需要对称的度量时，可以用 JS 散度 $\mathrm{JS}(p,q)=\tfrac12\mathrm{KL}(p\Vert m)+\tfrac12\mathrm{KL}(q\Vert m)$，其中 $m=\tfrac12(p+q)$。JS 散度对称且有界（以 $\ln$ 为单位时不超过 $\ln2$），它的平方根满足三角不等式，是一个度量。也可以用总变差距离、Wasserstein 距离等。

<sub>考点：KL散度</sub>

</details>

---

## 填空题

<a name="FND-MATH-005"></a>

### FND-MATH-005　挑战 · 考频 ★

全连接层 $y=Wx$，$W\in\mathbb{R}^{4096\times4096}$。由链式法则，损失对 $W$ 的梯度为 $\nabla_WL=\sum_i\delta_ix_i^\top$，其中 $\delta_i=\partial L/\partial y_i$，求和遍历经过这一层的所有向量。若一个 batch 只有 8 个样本、每个样本一个向量，该梯度矩阵的秩至多为 ____；若 batch 为 8 条序列、每条 1024 个 token（每个 token 都经过这一层），秩至多为 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 8；(2) 4096

**解析：**

**关键**：单个样本的梯度 $\delta_ix_i^\top$ 是两个向量的外积，秩至多为 1；$n$ 个秩 1 矩阵之和的秩至多为 $n$，同时不超过矩阵尺寸 $\min(4096,4096)$。

- 8 个向量：秩 $\le\min(8,4096)=8$。
- $8\times1024=8192$ 个 token 向量：秩 $\le\min(8192,4096)=4096$，上界就是矩阵本身的尺寸。

**推导**：$y=Wx$ 时 $\partial L/\partial W_{jk}=\sum_i\frac{\partial L}{\partial y_{ij}}x_{ik}$，写成矩阵就是 $\nabla_WL=\sum_i\delta_ix_i^\top=\Delta^\top X$（$\Delta$、$X$ 分别把各个 $\delta_i$、$x_i$ 按行堆叠）。这也说明反向传播要保存每层的输入 $X$：算权重梯度时离不开它。

**延伸**：实际训练中梯度矩阵的有效秩往往远低于上界（奇异值衰减很快），GaLore（arXiv:2403.03507）等方法据此把梯度投影到低秩子空间、在子空间里维护优化器状态，以节省显存。

<sub>考点：梯度与链式法则、矩阵的秩与分解　｜　出处：论文：arXiv:2403.03507（https://arxiv.org/abs/2403.03507）</sub>

</details>

---

<a name="FND-MATH-016"></a>

### FND-MATH-016　进阶 · 考频 ★★

某罕见缺陷的发生率为 1%。一项检测对有缺陷的样本有 90% 的概率报阳性，对无缺陷的样本有 10% 的概率误报阳性。某样本第一次检测为阳性，此时它有缺陷的后验概率为 ____；在给定是否有缺陷的条件下，两次检测相互独立，若再做一次检测仍为阳性，后验概率变为 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 8.3% / 0.083 / 1/12 / 8.33% / 0.0833；(2) 45% / 0.45

**解析：**

**第一次**：
$$P(D\mid+)=\frac{0.9\times0.01}{0.9\times0.01+0.1\times0.99}=\frac{0.009}{0.108}=\frac1{12}\approx8.3\%$$

**第二次**：把上一步的后验当作新的先验 $1/12$，再做一次贝叶斯更新：
$$P(D\mid++)=\frac{0.9\times\frac1{12}}{0.9\times\frac1{12}+0.1\times\frac{11}{12}}=\frac{0.9}{0.9+1.1}=0.45$$
也可以一步算：$\dfrac{0.01\times0.9^2}{0.01\times0.9^2+0.99\times0.1^2}=\dfrac{0.0081}{0.0081+0.0099}=0.45$。

**几率（odds）视角**：后验几率 = 先验几率 × 似然比。每次阳性的似然比为 $0.9/0.1=9$。先验几率 $1:99$，一次阳性后变为 $9:99=1:11$（即 $1/12$），两次后为 $81:99$，即 $81/180=0.45$。

**注意**：条件独立的假设很关键。如果两次检测的误报来自同一个原因（例如同一种干扰因素），第二次阳性带来的信息会少得多，后验不会涨这么快。

<sub>考点：贝叶斯公式</sub>

</details>

---

<a name="FND-MATH-017"></a>

### FND-MATH-017　进阶 · 考频 ★★

$n$ 个模型对同一输入的预测是同分布的随机变量，方差都为 $\sigma^2$，任意两个模型之间的相关系数都为 $\rho$。取 $\sigma^2=1$、$\rho=0.2$、$n=10$，对这 10 个预测取平均，平均预测的方差为 ____；当 $n\to\infty$ 时，平均预测的方差趋于 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 0.28；(2) 0.2

**解析：**

**推导**：
$$\mathrm{Var}\Big(\frac1n\sum_iX_i\Big)=\frac1{n^2}\Big(\sum_i\mathrm{Var}X_i+\sum_{i\ne j}\mathrm{Cov}(X_i,X_j)\Big)=\frac1{n^2}\big(n\sigma^2+n(n-1)\rho\sigma^2\big)=\rho\sigma^2+\frac{1-\rho}{n}\sigma^2$$

代入数值：$0.2+0.8/10=0.28$；$n\to\infty$ 时第二项消失，只剩 $\rho\sigma^2=0.2$。

**启示**：
- 平均只能消除「不相关」的那部分方差，相关的部分 $\rho\sigma^2$ 无论加多少个模型都去不掉。
- 这正是随机森林在 Bagging 之外还要在每次分裂时随机抽取特征子集的原因：降低树与树之间的相关性 $\rho$，让平均的降方差效果更好。
- 同理，多个大模型投票或自洽性（self-consistency）采样时，答案彼此越独立，集成的收益越大；同一个模型低温度采样出的多个答案高度相关，投票收益有限。

<sub>考点：期望方差与协方差</sub>

</details>

---

<a name="FND-MATH-018"></a>

### FND-MATH-018　挑战 · 考频 ★

$q,k\in\mathbb{R}^{64}$，所有分量相互独立。$q$ 的每个分量均值为 1、方差为 1；$k$ 的每个分量均值为 0、方差为 1。则 $\mathrm{Var}(q\cdot k)=$ ____。若 $k$ 的每个分量均值也改为 1（方差仍为 1），则 $\mathrm{Var}(q\cdot k)=$ ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 128；(2) 192

**解析：**

**公式**：对相互独立的 $X$、$Y$，
$$\mathrm{Var}(XY)=E[X^2]E[Y^2]-(E[X]E[Y])^2,\qquad E[X^2]=\mathrm{Var}X+(EX)^2$$

**第一问**：$E[q_i^2]=1+1=2$，$E[k_i^2]=1$，$E[q_i]E[k_i]=0$，所以 $\mathrm{Var}(q_ik_i)=2$。64 个独立项相加：$64\times2=128$。

**第二问**：$E[q_i^2]=E[k_i^2]=2$，$E[q_i]E[k_i]=1$，$\mathrm{Var}(q_ik_i)=4-1=3$，合计 $64\times3=192$。此时点积的均值也变成了 64。

**启示**：常见的「点积方差 $=d\sigma_q^2\sigma_k^2$」只在**零均值**时成立。均值不为 0 时，方差（以及均值）会变大，这也是在点积之前常对向量做中心化或归一化的原因之一。用蒙特卡洛模拟（40 万次）验证，两问分别约为 128 与 192。

<sub>考点：期望方差与协方差</sub>

</details>

---

<a name="FND-MATH-031"></a>

### FND-MATH-031　基础 · 考频 ★★

FP16 能表示的最大有限值为 65504。计算 $e^x$ 时，在 FP16 下 $x$ 超过约 ____ 结果就会溢出为 `inf`；在 FP32（最大值约 $3.4\times10^{38}$）下，$x$ 超过约 ____ 会溢出。（保留两位小数）

<details>
<summary>答案与解析</summary>

**答案：** (1) 11.09 / 11.1；(2) 88.72 / 88.7

**解析：**

溢出阈值就是最大值的自然对数：
- FP16：$\ln65504\approx11.09$。实测 $e^{11.08}\approx64864$ 正常，$e^{11.1}$ 已经是 `inf`。
- FP32：$\ln(3.4\times10^{38})\approx88.72$。BF16 的指数位与 FP32 相同，阈值也约为 88.7。

**启示**：logits 超过 11 在大模型里很常见，所以：
- 半精度下计算 softmax、exp 必须先减最大值；
- 混合精度框架（如 PyTorch autocast）会把 softmax、log_softmax、交叉熵等对数值敏感的运算放到 FP32 中执行；
- 反方向也要小心：概率小于 FP16 的最小正数（约 $6\times10^{-8}$）就会下溢成 0，随后取 log 得到 $-\infty$。所以损失应在对数空间里计算（log_softmax），而不是先求概率再取 log。

<sub>考点：数值稳定性</sub>

</details>

---

## 计算题

<a name="FND-MATH-004"></a>

### FND-MATH-004　进阶 · 考频 ★★

某矩阵 $W$ 的全部非零奇异值为 $10, 6, 3, 1$。用截断 SVD 得到它的最佳秩 2 近似 $W_2$。求：
(1) 近似误差的 Frobenius 范数 $\lVert W-W_2\rVert_F$ 与谱范数 $\lVert W-W_2\rVert_2$；
(2) $W_2$ 保留了 $W$ 的「能量」（奇异值平方和）的百分之几；
(3) 若把一个 $4096\times4096$ 的权重压缩为秩 64 的两个因子 $U_k\Sigma_k$ 与 $V_k^\top$，参数量是原来的百分之几？

<details>
<summary>答案与解析</summary>

**答案：(1) $\sqrt{10}\approx3.16$ 与 3；(2) 约 93.2%；(3) 3.125%**

**解析：**

**依据**：Eckart–Young 定理。保留前 $k$ 个奇异值的截断 SVD $W_k=\sum_{i\le k}\sigma_iu_iv_i^\top$，在 Frobenius 范数和谱范数下都是最佳的秩 $k$ 近似，误差由被丢弃的奇异值决定：
$$\lVert W-W_k\rVert_F=\sqrt{\textstyle\sum_{i>k}\sigma_i^2},\qquad \lVert W-W_k\rVert_2=\sigma_{k+1}$$

**计算**：
1. 丢弃的奇异值为 3 和 1：$\lVert W-W_2\rVert_F=\sqrt{9+1}=\sqrt{10}\approx3.16$；谱范数误差为 $\sigma_3=3$。
2. 总能量 $\lVert W\rVert_F^2=100+36+9+1=146$，保留 $100+36=136$，占 $136/146\approx93.2\%$。相对误差 $\sqrt{10/146}\approx0.26$。
3. 两个因子分别为 $4096\times64$ 与 $64\times4096$，共 $64\times(4096+4096)=524288$ 个参数；原矩阵有 $4096^2=16777216$ 个，比例为 $524288/16777216=3.125\%$。

**延伸**：奇异值衰减得越快，低秩近似越有效。LoRA 假设的是「微调增量」低秩；SVD 压缩、以及用主奇异向量初始化 LoRA 的方法（如 PiSSA），利用的是权重本身的奇异值分布。

<sub>考点：矩阵的秩与分解、特征值与SVD</sub>

</details>

---

<a name="FND-MATH-015"></a>

### FND-MATH-015　基础 · 考频 ★★★

某问答系统约 4% 的回答含有幻觉。一个幻觉检测器能标记出 90% 的幻觉回答（召回率 90%），同时会误标 5% 的正常回答。现在某个回答被检测器标记了，它确实含有幻觉的概率是多少？没有被标记的回答中，含幻觉的比例又是多少？

<details>
<summary>答案与解析</summary>

**答案：被标记的回答确有幻觉的概率约 42.9%；未被标记的回答中幻觉约占 0.44%**

**解析：**

记 $H$ 为「含幻觉」，$F$ 为「被标记」。已知 $P(H)=0.04$，$P(F\mid H)=0.9$，$P(F\mid\neg H)=0.05$。

**(1) 被标记时确有幻觉的概率**：
$$P(H\mid F)=\frac{P(F\mid H)P(H)}{P(F\mid H)P(H)+P(F\mid\neg H)P(\neg H)}=\frac{0.9\times0.04}{0.9\times0.04+0.05\times0.96}=\frac{0.036}{0.036+0.048}\approx0.429$$

**(2) 未被标记时含幻觉的概率**：
$$P(H\mid\neg F)=\frac{0.1\times0.04}{0.1\times0.04+0.95\times0.96}=\frac{0.004}{0.004+0.912}\approx0.0044$$

**解读**：检测器看起来很准（召回 90%、误报率只有 5%），被标记的回答中却有一半以上是误报。原因是基率很低：96% 的正常回答即使只有 5% 被误标，绝对数量（4.8%）也超过了被正确标出的幻觉（3.6%）。这就是「基率谬误」。实践中：
- 不能直接用检测器的结果拦截回答，可以先用它筛选，再交给更强的模型或人工复核；
- 评估这类检测器要同时报告精确率（这里约 42.9%）与召回率，并说明在什么基率下测得，基率变了精确率也会变。

<sub>考点：贝叶斯公式</sub>

</details>

---

<a name="FND-MATH-023"></a>

### FND-MATH-023　基础 · 考频 ★★★

在 3 个类别上，真实分布 $p=(\tfrac12,\tfrac12,0)$，模型分布 $q=(\tfrac14,\tfrac14,\tfrac12)$。以 bit（$\log_2$）为单位，计算 $H(p)$、$H(p,q)$、$\mathrm{KL}(p\Vert q)$、$\mathrm{KL}(q\Vert p)$。（约定 $0\log0=0$）

<details>
<summary>答案与解析</summary>

**答案：$H(p)=1$ bit，$H(p,q)=2$ bit，$\mathrm{KL}(p\Vert q)=1$ bit，$\mathrm{KL}(q\Vert p)=+\infty$**

**解析：**

1. $H(p)=-\tfrac12\log_2\tfrac12-\tfrac12\log_2\tfrac12-0=1$ bit。
2. $H(p,q)=-\tfrac12\log_2\tfrac14-\tfrac12\log_2\tfrac14-0\cdot\log_2\tfrac12=1+1=2$ bit。
3. $\mathrm{KL}(p\Vert q)=\tfrac12\log_2\frac{1/2}{1/4}+\tfrac12\log_2\frac{1/2}{1/4}+0=1$ bit。验证：$H(p,q)=H(p)+\mathrm{KL}(p\Vert q)=1+1=2$ ✓。
4. $\mathrm{KL}(q\Vert p)=\tfrac14\log_2\frac{1/4}{1/2}+\tfrac14\log_2\frac{1/4}{1/2}+\tfrac12\log_2\frac{1/2}{0}=+\infty$：$q$ 在第 3 类上有概率，而 $p$ 在那里为 0。

**启示**：
- KL 不对称，一个方向有限、另一个方向甚至可能是无穷大。
- $\mathrm{KL}(p\Vert q)$ 要求「$p>0$ 的地方 $q$ 必须 $>0$」，否则为无穷大（zero-avoiding），所以用它训练的模型倾向于覆盖数据的全部支撑；$\mathrm{KL}(q\Vert p)$ 要求「$p=0$ 的地方 $q$ 必须为 0」（zero-forcing），所以用它训练的模型倾向于只待在 $p$ 的高概率区域里。
- 换成自然对数，$\mathrm{KL}(p\Vert q)=\ln2\approx0.693$ nat。

<sub>考点：熵与交叉熵、KL散度</sub>

</details>

---

<a name="FND-MATH-027"></a>

### FND-MATH-027　进阶 · 考频 ★

用 $X$、$Y$ 分别表示两个模型对同一道题是否答对（1 为答对）。在一个大评测集上统计得到联合分布：$P(1,1)=0.4$，$P(1,0)=0.1$，$P(0,1)=0.1$，$P(0,0)=0.4$。以 bit 为单位，求 $H(X)$、$H(X,Y)$、条件熵 $H(X\mid Y)$ 与互信息 $I(X;Y)$。

<details>
<summary>答案与解析</summary>

**答案：$H(X)=1$，$H(X,Y)\approx1.722$，$H(X\mid Y)\approx0.722$，$I(X;Y)\approx0.278$ bit**

**解析：**

1. **边缘分布**：$P(X=1)=0.4+0.1=0.5$，$Y$ 同理，所以 $H(X)=H(Y)=1$ bit。
2. **联合熵**：$H(X,Y)=-2\times0.4\log_20.4-2\times0.1\log_20.1=1.058+0.664\approx1.722$ bit。
3. **条件熵**：$H(X\mid Y)=H(X,Y)-H(Y)\approx0.722$ bit。也可以直接算：给定 $Y$ 后，$X$ 与 $Y$ 相同的概率为 0.8，$H(X\mid Y)=h(0.8)=-0.8\log_20.8-0.2\log_20.2\approx0.722$。
4. **互信息**：$I(X;Y)=H(X)+H(Y)-H(X,Y)=2-1.722\approx0.278$ bit，也等于 $H(X)-H(X\mid Y)$。

**解读**：知道一个模型是否答对，能消除另一个模型对错不确定性的约 28%。两个模型的错误高度相关时，互信息高，集成或投票的收益就小；互信息为 0 说明两者的对错相互独立，集成收益最大。

<sub>考点：互信息</sub>

</details>

---

## 代码输出题

<a name="FND-MATH-008"></a>

### FND-MATH-008　进阶 · 考频 ★

下面的代码对一个 $2\times2$ 对称矩阵反复做「乘矩阵再归一化」。输出是什么？

```python
import numpy as np

A = np.array([[2.0, 1.0], [1.0, 2.0]])
x = np.array([1.0, 0.0])
for _ in range(50):
    x = A @ x
    x = x / np.linalg.norm(x)
print(round(float(x @ A @ x), 4))
print(np.round(x, 4).tolist())
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
3.0
[0.7071, 0.7071]
```

**解析：**

这是**幂迭代**（power iteration）：反复左乘 $A$，向量会收敛到模最大的特征值对应的特征向量。

$A$ 的特征值为 3（特征向量 $(1,1)/\sqrt2$）和 1（特征向量 $(1,-1)/\sqrt2$）。初始向量 $(1,0)$ 在两个方向上各有分量；每乘一次 $A$，两个分量分别乘以 3 和 1，比值按 $(1/3)^t$ 衰减，50 次后第二个分量可以忽略。于是 $x\to(0.7071,0.7071)$，瑞利商 $x^\top Ax/x^\top x$ 收敛到最大特征值 3。

**延伸**：
- 收敛速度由 $|\lambda_2/\lambda_1|$ 决定，两个特征值越接近，收敛越慢。
- 深度学习中的谱归一化（Spectral Normalization）就是用一两步幂迭代估计权重的最大奇异值，再把权重除以它。
- 同一现象也解释了 RNN 的梯度问题：反复乘同一个矩阵时，结果由最大的特征值主导，模大于 1 就爆炸、小于 1 就消失。

<sub>考点：特征值与SVD</sub>

</details>

---

<a name="FND-MATH-024"></a>

### FND-MATH-024　挑战 · 考频 ★★

目标分布 $p$ 是双峰的。下面的代码比较两个候选分布：`cover` 把概率摊开、覆盖两个峰，`seek` 只押中一个峰。每行依次输出 $\mathrm{KL}(p\Vert q)$ 与 $\mathrm{KL}(q\Vert p)$。输出是什么？在两种 KL 下，分别是哪个候选更好？

```python
import numpy as np

def kl(a, b):
    return float(np.sum(a * np.log(a / b)))

p = np.array([0.45, 0.05, 0.05, 0.45])
q_cover = np.array([0.25, 0.25, 0.25, 0.25])
q_seek = np.array([0.85, 0.05, 0.05, 0.05])
for name, q in [("cover", q_cover), ("seek", q_seek)]:
    print(name, round(kl(p, q), 3), round(kl(q, p), 3))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
cover 0.368 0.511
seek 0.703 0.431
```

**解析：**

**计算**（自然对数）：
- $\mathrm{KL}(p\Vert q_{cover})=2\times0.45\ln\frac{0.45}{0.25}+2\times0.05\ln\frac{0.05}{0.25}=0.529-0.161=0.368$
- $\mathrm{KL}(q_{cover}\Vert p)=2\times0.25\ln\frac{0.25}{0.45}+2\times0.25\ln\frac{0.25}{0.05}=-0.294+0.805=0.511$
- $\mathrm{KL}(p\Vert q_{seek})=0.45\ln\frac{0.45}{0.85}+0.45\ln\frac{0.45}{0.05}=-0.286+0.989=0.703$
- $\mathrm{KL}(q_{seek}\Vert p)=0.85\ln\frac{0.85}{0.45}+0.05\ln\frac{0.05}{0.45}=0.541-0.110=0.431$

**结论**：前向 KL $\mathrm{KL}(p\Vert q)$ 偏好 `cover`（0.368 < 0.703），反向 KL $\mathrm{KL}(q\Vert p)$ 偏好 `seek`（0.431 < 0.511）。

**原理**：
- 前向 KL 按 $p$ 加权：$p$ 有质量而 $q$ 很小的地方惩罚很重。`seek` 在第 4 个峰上只给了 0.05，被重罚，所以前向 KL 是 **mode-covering**（均值寻找、宁可摊开也不漏峰）。
- 反向 KL 按 $q$ 加权：只关心 $q$ 自己放了质量的地方，$q$ 不去的峰不受惩罚，而 $q$ 放在低谷（$p$ 小的地方）的质量会被重罚。所以反向 KL 是 **mode-seeking**（锁定一个峰）。

**应用**：极大似然 / SFT 对应前向 KL，容量不足时模型会把概率分到不合理的输出上；RLHF 中的 KL 约束 $\mathrm{KL}(\pi_\theta\Vert\pi_{ref})$ 与变分推断用的是反向 KL；知识蒸馏可以按需选择方向（如 MiniLLM 用反向 KL）。

<sub>考点：KL散度</sub>

</details>

---

<a name="FND-MATH-029"></a>

### FND-MATH-029　基础 · 考频 ★★★

下面的代码分别用朴素方法和「先减最大值」的方法计算 softmax 与 log-sum-exp（已屏蔽溢出警告）。输出是什么？

```python
import numpy as np

z = np.array([1000.0, 999.0])
with np.errstate(over="ignore", invalid="ignore"):
    naive = np.exp(z) / np.exp(z).sum()
    naive_lse = np.log(np.exp(z).sum())
m = z.max()
stable = np.exp(z - m) / np.exp(z - m).sum()
stable_lse = m + np.log(np.exp(z - m).sum())
print(naive, naive_lse)
print(np.round(stable, 4), round(float(stable_lse), 4))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
[nan nan] inf
[0.7311 0.2689] 1000.3133
```

**解析：**

**朴素实现**：$e^{1000}$ 超出 float64 的上限（约 $1.8\times10^{308}$，即指数超过约 709.8 就溢出），结果为 `inf`；softmax 变成 $\infty/\infty=$ `nan`，log-sum-exp 变成 $\log\infty=$ `inf`。

**稳定实现**利用两个恒等式：
- $\mathrm{softmax}(z)=\mathrm{softmax}(z-c)$：分子分母同乘 $e^{-c}$；
- $\log\sum_ie^{z_i}=m+\log\sum_ie^{z_i-m}$。

取 $m=\max(z)$ 后，指数部分最大为 $e^0=1$，不会上溢；分母至少为 1，也不会出现除以 0 或 $\log0$。结果：$\mathrm{softmax}=(\frac{1}{1+e^{-1}},\frac{e^{-1}}{1+e^{-1}})=(0.7311,0.2689)$，$\mathrm{LSE}=1000+\ln(1+e^{-1})=1000.3133$。

**延伸**：
- 减最大值能成立，是因为 softmax 具有平移不变性；sigmoid、tanh 等函数没有这个性质，要用别的办法稳定（如 $\log\sigma(x)=-\mathrm{softplus}(-x)$）。
- log-sum-exp 是 max 的光滑近似：$\max(z)\le\mathrm{LSE}(z)\le\max(z)+\log n$。
- FlashAttention 中的 online softmax 也是同一个思路：一边扫描一边维护当前最大值，并据此修正已经累加的结果。

<sub>考点：数值稳定性</sub>

</details>

---

## 代码改错题

<a name="FND-MATH-030"></a>

### FND-MATH-030　进阶 · 考频 ★★

下面的函数根据 logits $z$ 和 0/1 标签 $y$ 逐元素计算二元交叉熵。它在 $z$ 取值适中时结果正确，但当 $|z|$ 较大时会返回 `inf` 或 `nan`。请指出问题并给出数值稳定的实现。

```python
import numpy as np

def bce_with_logits(z, y):
    p = 1.0 / (1.0 + np.exp(-z))
    return -(y * np.log(p) + (1 - y) * np.log(1 - p))
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：先算概率再取对数，在两端都会出错。
1. $z=50$：$e^{-50}\approx2\times10^{-22}$，远小于 float64 的相对精度，$p$ 被舍入成恰好 1.0，$\log(1-p)=\log0=-\infty$。当 $y=0$ 时 loss 为 `inf`（真实值约 50）；当 $y=1$ 时出现 $0\times(-\infty)=$ `nan`。
2. $z=-800$：$e^{800}$ 上溢为 `inf`，$p=0$，$y=1$ 时 $\log0$ 得到 `inf`（真实值约 800）。

**修正**：在 logits 上直接化简。利用 $\log\sigma(z)=-\mathrm{softplus}(-z)$、$\log(1-\sigma(z))=-\mathrm{softplus}(z)$，可得 $\ell=\mathrm{softplus}(z)-yz$；再把 softplus 写成不会溢出的形式：

```python
def bce_with_logits(z, y):
    return np.maximum(z, 0) - z * y + np.log1p(np.exp(-np.abs(z)))
```

**修正后的代码：**

```python
import numpy as np

def bce_with_logits(z, y):
    return np.maximum(z, 0) - z * y + np.log1p(np.exp(-np.abs(z)))
```

**解析：**

**推导**：$\ell=-y\log\sigma(z)-(1-y)\log(1-\sigma(z))$。由 $\log\sigma(z)=-\log(1+e^{-z})$、$\log(1-\sigma(z))=-z-\log(1+e^{-z})$，代入得 $\ell=(1-y)z+\log(1+e^{-z})=\mathrm{softplus}(z)-yz$。

而 $\mathrm{softplus}(z)=\log(1+e^z)=\max(z,0)+\log(1+e^{-|z|})$：指数部分 $e^{-|z|}\le1$，永不溢出；`log1p` 在 $e^{-|z|}$ 很小时仍然精确。

这正是 PyTorch 提供 `BCEWithLogitsLoss` 的原因：它在 logits 上一次算完，比「先 `sigmoid` 再 `BCELoss`」数值稳定得多。同理，多分类要用 `cross_entropy(logits)`，而不是 `log(softmax(x))`。

<sub>考点：数值稳定性</sub>

</details>

---

## 简答题

<a name="FND-MATH-010"></a>

### FND-MATH-010　进阶 · 考频 ★★★

设 logits 为 $z\in\mathbb{R}^C$，$p=\mathrm{softmax}(z)$，标签分布为 $y$（one-hot 或软标签，$\sum_iy_i=1$），损失 $L=-\sum_iy_i\log p_i$。请：(1) 写出 softmax 的雅可比矩阵；(2) 用链式法则推导 $\partial L/\partial z$；(3) 说明这个梯度的性质；(4) 说明深度学习框架为什么把 softmax 和交叉熵合成一个算子（如 PyTorch 的 `F.cross_entropy` 直接接收 logits）。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **softmax 的雅可比**：$\dfrac{\partial p_i}{\partial z_j}=p_i(\delta_{ij}-p_j)$，写成矩阵为 $J=\mathrm{diag}(p)-pp^\top$。它对称，每行之和为 0。
2. **推导**：$\dfrac{\partial L}{\partial p_i}=-\dfrac{y_i}{p_i}$，于是
   $$\frac{\partial L}{\partial z_j}=\sum_i\Big(-\frac{y_i}{p_i}\Big)p_i(\delta_{ij}-p_j)=-y_j+p_j\sum_iy_i=p_j-y_j$$
   更快的写法：$L=-\sum_iy_iz_i+\log\sum_ke^{z_k}$（利用 $\sum_iy_i=1$），对 $z_j$ 求导直接得 $-y_j+p_j$。向量形式为 $\nabla_zL=p-y$；batch 取平均时再除以 $N$。
3. **性质**：梯度等于「预测分布减标签分布」，每个分量都在 $[-1,1]$ 内，大小与预测误差成正比。预测越错，梯度越大；不会像 sigmoid / softmax 接 MSE 那样，在输出饱和时梯度被 $p(1-p)$ 压没。各分量之和为 0，与「logits 整体平移不改变输出」一致。
4. **合成算子的原因**：
   - 数值稳定：先算 softmax 再取 log，$p_i$ 下溢为 0 时 $\log0=-\infty$；合成后用 log-sum-exp 计算 $\log p_i=z_i-\max(z)-\log\sum_ke^{z_k-\max(z)}$，不会溢出或下溢。
   - 高效：反向直接用 $p-y$，不需要构造 $C\times C$ 的雅可比（大模型词表 $C$ 超过 10 万，这个矩阵根本存不下），也不用保存中间的 $\log p$。

**评分要点（共 10 分）：**

- 正确写出 softmax 雅可比 $p_i(\delta_{ij}-p_j)$（3 分）
- 用链式法则（或 log-sum-exp 写法）推出 $p-y$（3 分）
- 说明梯度有界、与误差成正比、不因饱和而消失等性质（2 分）
- 从数值稳定与计算效率两方面说明合成算子的原因（2 分）

**讲解：**

**常见失分点**：把雅可比写成对角矩阵，漏掉 $-p_ip_j$ 项；推导时忘了用 $\sum_iy_i=1$，得不到简洁的 $p-y$；batch 平均时漏了除以 $N$；先 `softmax` 再 `log` 再 `nll_loss`，或者把已经过 softmax 的概率传给 `cross_entropy`（相当于做了两次 softmax，loss 降不下去）。

<sub>考点：梯度与链式法则、雅可比与海森矩阵、熵与交叉熵</sub>

</details>

---

<a name="FND-MATH-022"></a>

### FND-MATH-022　进阶 · 考频 ★★★

请回答：(1) 熵、交叉熵、KL 散度的定义，以及三者之间的关系；(2) 训练分类器或语言模型时，为什么「最小化交叉熵」「最小化 KL 散度」「极大似然」是等价的；(3) 语言模型的交叉熵 loss 能否降到 0？它与困惑度是什么关系？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **定义与关系**（$p$ 为真实分布，$q$ 为模型分布）：
   - 熵 $H(p)=-\sum_xp(x)\log p(x)$：用最优编码描述 $p$ 的样本，平均所需的信息量；
   - 交叉熵 $H(p,q)=-\sum_xp(x)\log q(x)$：样本来自 $p$、却按 $q$ 编码时的平均码长；
   - KL 散度 $\mathrm{KL}(p\Vert q)=\sum_xp(x)\log\frac{p(x)}{q(x)}$：用 $q$ 代替 $p$ 多付出的码长；
   - 关系：$H(p,q)=H(p)+\mathrm{KL}(p\Vert q)$。由于 $\mathrm{KL}\ge0$（吉布斯不等式），所以 $H(p,q)\ge H(p)$，当且仅当 $q=p$ 时取等。
2. **三者等价**：
   - 训练时 $p$ 是数据分布，与模型参数 $\theta$ 无关，$H(p)$ 是常数，所以 $\min_\theta H(p,q_\theta)\Leftrightarrow\min_\theta\mathrm{KL}(p\Vert q_\theta)$；
   - 极大似然 $\max_\theta\frac1N\sum_i\log q_\theta(x_i)$ 等于最小化经验分布与模型之间的交叉熵 $-\frac1N\sum_i\log q_\theta(x_i)$；
   - 语言模型的 next-token loss 就是对每个位置的 $-\log q_\theta(x_t\mid x_{<t})$ 取平均，即 token 级的极大似然。
3. **下界与困惑度**：
   - loss 的下界是数据本身的熵 $H(p)$。自然语言有内在的不确定性（同一个前缀可以合理地接很多词），$H(p)>0$，所以 loss 不会降到 0；在训练集上降到接近 0，通常意味着在背诵训练数据（过拟合）。
   - 困惑度 $\mathrm{PPL}=\exp(\text{交叉熵})$（以 nat 为单位时）。可以理解为模型每一步平均在多少个等可能的候选之间犹豫，下界为 $\exp(H(p))$。

**评分要点（共 10 分）：**

- 正确写出三个定义（2 分）
- 推出 $H(p,q)=H(p)+\mathrm{KL}(p\Vert q)$ 并说明 KL 非负（2 分）
- 说明 $H(p)$ 与参数无关，故最小化交叉熵等价于最小化 KL（2 分）
- 说明极大似然与最小化经验交叉熵等价，并联系 next-token loss（2 分）
- 说明 loss 下界为数据熵、困惑度与交叉熵的关系（2 分）

**讲解：**

**常见失分点**：把关系写成 $\mathrm{KL}=H(p)+H(p,q)$ 或混淆 KL 的方向（极大似然对应的是 $\mathrm{KL}(p_{data}\Vert q_\theta)$，即前向 KL）；说不出「$H(p)$ 是常数」这一关键前提，在 RL 等「被优化的分布出现在第一个位置」的场景里，这个前提并不成立；以为 loss 可以降到 0；困惑度的底数与 loss 的对数底不一致（用 $\log_2$ 时 $\mathrm{PPL}=2^{H}$）。

<sub>考点：熵与交叉熵、KL散度、最大似然与最大后验</sub>

</details>

---

## 场景分析题

<a name="FND-MATH-032"></a>

### FND-MATH-032　挑战 · 考频 ★★

团队用混合精度训练做 logits 蒸馏（词表约 15 万），蒸馏损失是这样写的（logits 已展平为 `(N, V)`，$N$ 为参与蒸馏的 token 数）：

```python
p = teacher_logits.softmax(-1)   # 教师分布
q = student_logits.softmax(-1)   # 学生分布
loss = (p * (p.log() - q.log())).sum(-1).mean()
```

训练最初几百步正常，之后 loss 时而变成 `inf`、时而变成 `nan`，并且随着训练进行越来越频繁。请分析原因，给出修复方案，并说明如何验证与预防。

<details>
<summary>答案与解析</summary>

**参考答案：**

**原因分析**：
1. **概率下溢为 0**：词表很大，绝大多数 token 的概率极小。半精度下概率小于约 $6\times10^{-8}$（FP16 最小正数）就变成 0；即使在 FP32 中，logit 差距超过约 100 时概率也会下溢（$e^{-104}$ 已小于 FP32 的最小正数）。
2. **两种异常的来源**：
   - $p_i=0$ 时，`p.log()` 为 $-\infty$，$0\times(-\infty)=$ `nan`；
   - $q_i=0$ 而 $p_i>0$ 时，`-q.log()` 为 $+\infty$，乘以正的 $p_i$ 得到 `inf`。
3. **为什么越来越频繁**：训练中教师分布本身就很尖锐，学生的 logits 尺度也在增大（分布变尖），落入下溢区域的 token 越来越多。

**修复**：
1. 全程在对数空间计算：
   ```python
   log_p = F.log_softmax(teacher_logits.float() / T, -1)
   log_q = F.log_softmax(student_logits.float() / T, -1)
   loss = F.kl_div(log_q, log_p, log_target=True, reduction="batchmean") * T * T
   ```
   `log_softmax` 内部用 log-sum-exp，结果有限；$\exp(\log p)\cdot(\log p-\log q)$ 在 $p\to0$ 时自然趋于 0，不会出现 $0\times\infty$。
2. softmax、log_softmax 与 KL 都放在 FP32 中计算（先 `.float()`，或依赖 autocast 的 FP32 白名单）。
3. 注意 `reduction`：`"batchmean"` 才是按样本平均的 KL；`"mean"` 会再除以词表大小，数值偏小。使用温度 $T$ 时乘以 $T^2$，保持梯度量级（Hinton 等, 2015）。
4. 如果只能拿到概率，就用 `torch.xlogy` 处理 $0\log0$，并在 log 之前对 $q$ 做 clamp（如 `q.clamp_min(1e-12)`）兜底。

**验证与预防**：
- 单元测试：构造极端 logits（如 $\pm1000$、大词表、one-hot 教师），断言 loss 有限，并与 FP64 参考实现对比；
- 训练监控：记录 loss 与梯度范数，出现非有限值时立即保存现场；用 `torch.autograd.detect_anomaly` 或逐层检查定位最先出现 NaN 的张量；
- 训练框架层面：遇到非有限的 loss 或梯度时跳过这一步，并告警。

**评分要点（共 10 分）：**

- 指出 $0\times\log0$ 产生 NaN、$\log q=-\infty$ 产生 inf 两条路径（3 分）
- 解释下溢的成因：大词表、半精度范围、分布逐渐变尖（2 分）
- 给出对数空间的修复（log_softmax / kl_div 的 log_target）并说明为何有效（3 分）
- 提到 FP32 计算、reduction 与温度等细节，以及测试和监控手段（2 分）

**讲解：**

**常见失分点**：只说「加一个 eps」而不解释 NaN 的来源（`p + eps` 能挡住 $\log0$，却会让分布不再归一，也挡不住 FP16 下溢）；只降学习率，误以为是优化发散；不知道 `F.kl_div` 的第一个参数要传**学生的对数概率**，第二个参数是目标分布；用了 `reduction="mean"` 却没意识到被多除了一个词表大小。

<sub>考点：数值稳定性、KL散度</sub>

</details>

---
