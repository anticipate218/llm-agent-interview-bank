# ALN-PO · 偏好优化 DPO 系列

> 所属大类：对齐与强化学习　｜　题量：42

不训练奖励模型的离线偏好优化方法。

**考点覆盖**：DPO推导（5） · DPO损失（9） · β的作用（5） · 隐式奖励（8） · DPO失效模式（8） · IPO（3） · KTO（3） · ORPO（2） · SimPO（2） · 在线与迭代DPO（5） · 偏好数据质量（5） · DPO与PPO对比（5）

**题型**：[单选题（12）](#单选题) · [多选题（5）](#多选题) · [判断题（6）](#判断题) · [填空题（3）](#填空题) · [计算题（5）](#计算题) · [代码输出题（1）](#代码输出题) · [代码填空题（1）](#代码填空题) · [编程题（1）](#编程题) · [简答题（5）](#简答题) · [场景分析题（2）](#场景分析题) · [系统设计题（1）](#系统设计题)

---

## 单选题

<a name="ALN-PO-002"></a>

### ALN-PO-002　进阶 · 考频 ★★★

DPO 推导中，奖励被写成 $r(x,y)=\beta\log\frac{\pi^*(y\mid x)}{\pi_{\text{ref}}(y\mid x)}+\beta\log Z(x)$，其中配分函数 $Z(x)$ 要对所有可能的回答求和，无法计算。DPO 能绕开 $Z(x)$ 的关键是：

- **A.** 用蒙特卡洛方法从参考模型采样若干回答来估计 $Z(x)$，再把估计值代入损失，每个 batch 重新估计一次
- **B.** Bradley-Terry 模型只看同一提示词下两条回答的奖励差，二者共享的 $\beta\log Z(x)$ 相减后抵消
- **C.** 假设 $Z(x)=1$：策略和参考模型都是归一化的概率分布，由它们定义的配分函数自然等于 1
- **D.** 在 $\beta\to0$ 的极限下 $\beta\log Z(x)$ 趋于 0，实际训练用的 β（约 0.1）足够小，可以直接忽略

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：$Z(x)$ 只依赖提示词、不依赖回答，而 BT 模型比较的是同一提示词下两条回答的奖励差：
$$r(x,y_w)-r(x,y_l)=\beta\log\frac{\pi^*(y_w\mid x)}{\pi_{\text{ref}}(y_w\mid x)}-\beta\log\frac{\pi^*(y_l\mid x)}{\pi_{\text{ref}}(y_l\mid x)}$$
$\beta\log Z(x)$ 在相减中消失。这也是标准 DPO 必须使用「同一提示词下的成对数据」的原因。

- A 错：DPO 训练中完全不估计 $Z(x)$；对所有回答求和的采样估计方差极大，也没有必要。
- C 错：$Z(x)=\sum_y\pi_{\text{ref}}(y\mid x)e^{r/\beta}$，只有当所有回答的奖励都为 0 时才等于 1，一般不成立。
- D 错：$\beta\to0$ 时 $\beta\log Z(x)$ 趋于参考模型支撑集上的最大奖励 $\max_yr(x,y)$，并不趋于 0；而且 DPO 在任意 $\beta$ 下都成立，不依赖任何极限。

延伸：不使用成对数据的方法要另想办法处理这一项，例如 KTO 用一个批内估计的 KL 项充当参考点。

<sub>考点：DPO推导</sub>

</details>

---

<a name="ALN-PO-010"></a>

### ALN-PO-010　进阶 · 考频 ★★★

DPO 损失对参数的梯度为
$$\nabla_\theta\mathcal{L}=-\beta\,\mathbb{E}\Big[\sigma\big(\hat r_\theta(x,y_l)-\hat r_\theta(x,y_w)\big)\big(\nabla_\theta\log\pi_\theta(y_w\mid x)-\nabla_\theta\log\pi_\theta(y_l\mid x)\big)\Big]$$
其中 $\hat r_\theta=\beta\log(\pi_\theta/\pi_{\text{ref}})$。关于这个梯度，下列理解正确的是：

- **A.** 各样本的权重相同，DPO 相当于对 chosen 做 SFT、对 rejected 做反向 SFT，再乘以系数 β
- **B.** 已经排对、margin 很大的样本 sigmoid 值最大、权重最大，模型会持续强化已经学会的偏好
- **C.** 梯度同时推高 chosen 的对数概率、压低 rejected 的对数概率，因此训练中 chosen 的概率会持续上升
- **D.** 隐式奖励排错（$\hat r_l>\hat r_w$）的样本权重大，已排对且差距大的权重小；梯度只约束二者的相对变化

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：权重 $\sigma(\hat r_l-\hat r_w)$ 让 DPO 把力气花在「还没学会」的样本上。例如 margin 为 −2（排错）时权重为 $\sigma(2)\approx0.88$，margin 为 +2 时只有 $\sigma(-2)\approx0.12$。

- A 错：样本权重随 margin 变化。DPO 论文指出，去掉这个权重、无差别地「推高 chosen、压低 rejected」，会让语言模型退化。
- B 错：方向反了。权重是 $\sigma(\hat r_l-\hat r_w)$，margin 越大、括号内越负，已排对的样本权重最小。
- C 错：梯度只保证 $\log\pi(y_w)-\log\pi(y_l)$ 增大。chosen 与 rejected 往往很相似，压低 rejected 时会连带压低 chosen，实际中常观察到两者的对数概率一起下降、chosen 降得慢一些，这就是「chosen 概率也下降」的失效模式。

<sub>考点：DPO损失、隐式奖励　｜　出处：DPO 论文 arXiv:2305.18290</sub>

</details>

---

<a name="ALN-PO-011"></a>

### ALN-PO-011　基础 · 考频 ★★★

关于 DPO 中 β 的作用，下列说法正确的是：

- **A.** β 对应 KL 约束的强度：β 越大，最优策略越贴近参考模型、训练越保守；β 越小，策略可以离参考模型越远
- **B.** β 只是学习率的另一个名字，调大 β 等价于调大学习率，不改变最优解
- **C.** β 是要求 chosen 比 rejected 高出的目标 margin，作用与 SimPO 中的 γ 相同
- **D.** β 只影响训练速度，不影响隐式奖励的数值

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：β 就是原始 RLHF 目标 $\mathbb{E}[r]-\beta\,\mathrm{KL}(\pi\|\pi_{\text{ref}})$ 中的 KL 系数，对应最优解 $\pi^*\propto\pi_{\text{ref}}\exp(r/\beta)$ 的温度。

从损失看：隐式奖励是 $\beta\log(\pi_\theta/\pi_{\text{ref}})$，要把 $-\log\sigma(\beta\Delta)$ 降到同样的水平，β 越大，所需的 log-ratio 差 $\Delta$ 越小，策略只要稍微偏离参考模型就「满足」了，所以更保守。DPO 论文默认取 β = 0.1（TL;DR 摘要任务取 0.5），Llama 3 的 DPO 也用 0.1；实践中常在 0.01～0.5 之间调。

- B 错：β 在 sigmoid 里面，改变的是损失的形状和最优解，而不是简单的步长缩放。
- C 错：β 是乘在对数概率比上的缩放系数（KL 强度），而不是加减的间隔。要求「至少高出一个 margin」的是 SimPO 的 γ；IPO 的目标 margin $\frac{1}{2\tau}$ 也是由正则系数导出的另一回事。
- D 错：隐式奖励的数值直接与 β 成正比。

<sub>考点：β的作用　｜　出处：DPO 论文 arXiv:2305.18290（附录 B）；Llama 3 论文 arXiv:2407.21783（4.1.4 节）</sub>

</details>

---

<a name="ALN-PO-014"></a>

### ALN-PO-014　基础 · 考频 ★★★

DPO 论文中有一节的标题是「Your Language Model Is Secretly a Reward Model」。这里语言模型隐含的「奖励」是指：

- **A.** 策略给这条回答的序列对数概率本身：策略越倾向生成的回答，隐含的奖励越高
- **B.** 策略与参考模型在整个回答分布上的 KL 散度，偏离参考模型越远，隐含奖励越高
- **C.** β 乘以策略与参考模型对该回答的概率比的对数，与真实奖励只差一个仅依赖提示词的项
- **D.** 训练过程中在策略模型上额外学习的一个标量价值头（value head）的输出，由偏好数据监督

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：隐式奖励 $\hat r_\theta(x,y)=\beta\log\dfrac{\pi_\theta(y\mid x)}{\pi_{\text{ref}}(y\mid x)}$，就是由闭式解反推奖励时去掉 $\beta\log Z(x)$ 的部分，与真实奖励只差这一个只依赖提示词的项。DPO 训练的过程，就是在用 BT 损失拟合这个隐式奖励。

- 它可以像奖励模型一样，给同一提示词的多条回答打分、排序；
- 它依赖参考模型：换了参考模型，隐式奖励的含义也随之改变；
- 它缺了 $\beta\log Z(x)$，所以只在同一提示词内比较才有意义。

- A 错：缺少参考模型，序列对数概率主要反映长度和流畅度，不是偏好。
- B 错：KL 是对所有回答取期望得到的一个数，不针对某条具体回答；单条回答上的 $\log(\pi_\theta/\pi_{\text{ref}})$ 只是 KL 的单样本估计，而且还要乘以 β。
- D 错：DPO 没有价值头或奖励头，奖励隐含在策略与参考模型的对数概率之比中。

<sub>考点：隐式奖励　｜　出处：DPO 论文 arXiv:2305.18290（5.1 节）</sub>

</details>

---

<a name="ALN-PO-018"></a>

### ALN-PO-018　进阶 · 考频 ★★★

DPO 训练中常观察到：margin 和排序准确率持续上升，但 chosen 回答的对数概率也在下降，只是比 rejected 下降得慢。最主要的原因是：

- **A.** DPO 只约束 chosen 与 rejected 的相对差距；二者往往很相似，压低 rejected 会连带压低 chosen
- **B.** 学习率过大、bf16 下逐 token 对数概率累加出现数值误差，改用 fp32 计算 log-prob 后 chosen 的概率就会上升
- **C.** 参考模型在训练中被意外更新（与策略共享了参数），隐式奖励的锚点随之漂移
- **D.** β 设得过大，KL 约束过强，把策略整体拉回参考模型，导致 chosen 与 rejected 的概率一起被压低

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：损失只依赖 $\log\pi(y_w)-\log\pi(y_l)$（相对参考模型），不保证 chosen 的绝对概率上升。拉大差距有两种方式：抬高 chosen，或者把两者一起往下压、但 rejected 压得更多。chosen 与 rejected 往往共享大段前缀、措辞相近，在模型内部的表示也相近，压低 rejected 的梯度会连带压低 chosen，被拿走的概率质量流向了数据中没有出现过的回答。Razin 等（2024）称之为似然位移（likelihood displacement），并发现它主要由「两条回答隐藏表示很相似」的偏好对驱动。

后果可能很严重：Razin 等在安全场景中观察到，用这类偏好数据训练后，Llama-3-8B-Instruct 对不安全提示的拒答率从 74.4% 降到 33.4%。缓解手段：给 chosen 加 NLL 项（Llama 3 在 DPO 中对 chosen 加了系数 0.2 的 NLL 项，明确用于防止 chosen 的对数概率下降）、DPOP 等变体、过滤表示过于相似的偏好对、使用在线采样的数据、降低学习率或少训几轮。

- B 错：这是损失的结构决定的现象，与数值精度无关；换成 fp32 计算也同样会出现。
- C 错：标准实现中参考模型冻结（或其对数概率离线预先算好），不会漂移。
- D 错：β 大意味着更保守、更贴近参考模型；这一现象并不是 β 过大造成的。

<sub>考点：DPO失效模式　｜　出处：Razin 等, Unintentional Unalignment: Likelihood Displacement in DPO, arXiv:2410.08847；Llama 3 论文 arXiv:2407.21783（4.1.4 节）</sub>

</details>

---

<a name="ALN-PO-023"></a>

### ALN-PO-023　进阶 · 考频 ★★

记 $h=\log\frac{\pi_\theta(y_w)}{\pi_{\text{ref}}(y_w)}-\log\frac{\pi_\theta(y_l)}{\pi_{\text{ref}}(y_l)}$。IPO 的损失为 $\big(h-\frac{1}{2\tau}\big)^2$。与 DPO 的 $-\log\sigma(\beta h)$ 相比，IPO 主要解决的问题是：

- **A.** 把 sigmoid 换成平方损失后不再需要参考模型，可以节省一份显存和一次前向
- **B.** 不再需要成对数据：平方损失可以对单条回答分别回归，只用好坏标签即可训练
- **C.** 把序列对数概率换成长度归一化的平均对数概率，消除 DPO 的长度偏置
- **D.** 让 $h$ 收敛到有限的目标值而不是被推向无穷，缓解确定性偏好下的过拟合

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：IPO 是「对目标 margin 做回归」：$h<\frac{1}{2\tau}$ 时把 $h$ 往上推，$h>\frac{1}{2\tau}$ 时往回拉；DPO 则在任何 $h$ 下都继续往上推，只是越来越慢。

- A 错：IPO 仍然需要参考模型，$h$ 的定义里就有 $\pi_{\text{ref}}$；不需要参考模型的是 ORPO、SimPO。
- B 错：$h$ 本身就是 chosen 与 rejected 的差，IPO 必须使用成对数据；不需要成对数据的是 KTO。
- C 错：这是 SimPO 的做法。

IPO 来自论文 A General Theoretical Paradigm to Understand Learning from Human Preferences（Azar 等, 2023）。它提出 ΨPO 框架，RLHF 与 DPO 都是其特例；IPO 是 Ψ 取恒等映射时的情形，因为 Ψ 有界，KL 正则在确定性偏好下仍然有效。

<sub>考点：IPO　｜　出处：IPO 论文 arXiv:2310.12036</sub>

</details>

---

<a name="ALN-PO-025"></a>

### ALN-PO-025　基础 · 考频 ★★

某产品只积累了大量「点赞 / 点踩」日志：每条记录是一个提示词、一条回答，外加一个好或坏的标签；同一提示词下很少同时有好、坏两条回答。想直接用这些数据做偏好对齐，最合适的方法是：

- **A.** 标准 DPO：把同一提示词下的好、坏回答配成对，配不上的跨提示词随机拼对即可
- **B.** KTO：它只需要每条回答一个「好 / 坏」二元标签，不要求同一提示词下有成对回答
- **C.** IPO：点赞数据噪声大，平方损失回归到有限 margin，比 DPO 更不容易过拟合噪声标签
- **D.** SimPO：它去掉了参考模型，奖励只依赖单条回答自身的平均对数概率，可以直接使用单条数据

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：KTO（Ethayarajh 等, 2024）借鉴前景理论：把每条回答的隐式奖励 $r_\theta=\log\frac{\pi_\theta(y\mid x)}{\pi_{\text{ref}}(y\mid x)}$ 与一个参考点 $z_0$ 比较（$z_0$ 是策略与参考模型之间 KL 的批内估计，不回传梯度），好回答希望高于参考点，坏回答希望低于参考点，两类损失分别用 $\lambda_D$、$\lambda_U$ 加权。它天然适配点赞、点踩这类非成对数据；好坏样本数量不平衡时，可以调节两类的权重（论文建议让 $\lambda_Dn_D/(\lambda_Un_U)$ 落在 1～1.5 之间）。

- A 错：标准 DPO 需要同一提示词下的成对数据，$\beta\log Z(x)$ 才能抵消；把不同提示词的回答硬拼成一对是不成立的。
- C 错：IPO 同样需要成对数据。
- D 错：SimPO 虽然不需要参考模型，但仍是成对损失（chosen 的奖励要比 rejected 高出目标 margin）。

延伸：点赞数据本身有选择偏差（愿意点的人少、更容易对极端回答点），使用前要清洗去偏。

<sub>考点：KTO　｜　出处：KTO 论文 arXiv:2402.01306</sub>

</details>

---

<a name="ALN-PO-027"></a>

### ALN-PO-027　基础 · 考频 ★★

关于 ORPO（Odds Ratio Preference Optimization），下列说法正确的是：

- **A.** 它在 DPO 损失之外再加一个对参考模型的 KL 惩罚项，用两个锚点约束策略，训练更稳
- **B.** 它只需要单条回答的好坏标签，用赔率比把好回答与固定阈值比较，不需要成对数据
- **C.** 它不需要参考模型，在 SFT 损失上加一个赔率比偏好项，一个阶段同时完成指令微调与偏好对齐
- **D.** 它用长度归一化的平均对数概率作为奖励，并加入目标 margin $\gamma$ 来拉开 chosen 与 rejected

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：ORPO（Hong 等, 2024）的损失是 $\mathcal{L}=\mathcal{L}_{\text{SFT}}+\lambda\,\mathcal{L}_{\text{OR}}$，其中 $\mathcal{L}_{\text{SFT}}$ 是 chosen 上的负对数似然，$\mathcal{L}_{\text{OR}}=-\log\sigma\Big(\log\dfrac{\text{odds}_\theta(y_w\mid x)}{\text{odds}_\theta(y_l\mid x)}\Big)$，$\text{odds}=\frac{P}{1-P}$。SFT 项负责学会回答，赔率比项在同一步里拉开 chosen 与 rejected。论文强调它既不需要 SFT 预热阶段，也不需要参考模型，每个 batch 的前向次数是 DPO 的一半。

- A 错：ORPO 恰恰去掉了参考模型，也没有 KL 惩罚项。
- B 错：ORPO 的赔率比是 chosen 与 rejected 之间的比较，需要成对数据；只用单条标签的是 KTO。
- D 错：这是 SimPO 的定义。（ORPO 的 $P$ 也取逐 token 平均对数概率的指数，但没有目标 margin。）

代价：没有参考模型这个 KL 锚点，防止跑偏主要靠 SFT 项；λ 需要调节（论文在 Mistral-7B 上取 0.1）。

<sub>考点：ORPO　｜　出处：ORPO 论文 arXiv:2403.07691</sub>

</details>

---

<a name="ALN-PO-029"></a>

### ALN-PO-029　进阶 · 考频 ★★

SimPO 的隐式奖励定义为 $\frac{\beta}{|y|}\log\pi_\theta(y\mid x)$，损失为 $-\log\sigma\big(r(y_w)-r(y_l)-\gamma\big)$。关于 SimPO，下列说法正确的是：

- **A.** 它的奖励与 DPO 相同，只是把 β 换成了 $\beta/|y|$，仍需要参考模型提供锚点
- **B.** 它不需要成对数据：奖励只取决于单条回答，用好坏标签分别推高、压低即可训练
- **C.** 目标 margin $\gamma$ 越大越好，因为它能不断拉开 chosen 与 rejected 的差距，生成质量随之单调提升
- **D.** 它不需要参考模型；奖励用长度归一化的平均对数概率，与生成时的度量更一致，也减轻了长度偏置

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：SimPO（Meng 等, 2024）有两个改动：
1. **奖励 = 长度归一化的平均对数概率**：论文指出 DPO 的奖励「与指导生成的度量并不直接一致」，生成时衡量回答好坏的大致是平均对数似然；DPO 的序列级对数概率比随长度累加，还会带来长度偏置。
2. **目标 margin $\gamma$**：要求 chosen 的奖励比 rejected 至少高出 $\gamma$，提升区分度。长度归一化也减少了靠写长回答刷奖励。

不需要参考模型，省掉一份显存和一次前向；论文报告比朴素 DPO 实现约少 20% 的运行时间、约 10% 的显存。推荐的超参数范围大致是 β 取 2.0～2.5、γ 取 0.5～1.5。

- A 错：SimPO 的奖励里没有 $\pi_{\text{ref}}$。
- B 错：SimPO 仍是成对损失；只用单条标签的是 KTO。
- C 错：论文的消融显示，γ 增大时留出集上的奖励准确率上升，但 AlpacaEval 2 的胜率先升后降；γ 过大还会降低 chosen 回答的对数似然，甚至导致退化。

代价：没有参考模型这个 KL 锚点，更依赖好的 SFT 起点和合适的超参数。

<sub>考点：SimPO　｜　出处：SimPO 论文 arXiv:2405.14734</sub>

</details>

---

<a name="ALN-PO-031"></a>

### ALN-PO-031　基础 · 考频 ★★

相比只在一份固定的离线偏好数据上训练的 DPO，在线 / 迭代 DPO（每轮用当前策略采样回答，再用奖励模型或评审模型标出偏好对，继续训练）的主要好处是：

- **A.** 偏好对来自当前策略自己的分布，缓解了分布偏移，每轮可以针对模型当下会犯的错误学习
- **B.** 不再需要奖励模型或标注：当前策略生成的回答默认优于上一轮，直接配成 chosen / rejected
- **C.** 不再需要参考模型：每一轮的策略会自动成为新的参考，损失里可以去掉 KL 锚点
- **D.** 计算成本比离线 DPO 更低：数据由策略自己生成，省去了预先收集和标注偏好数据的开销

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：在线 / 迭代 DPO 补上了 DPO「离线」的短板：偏好对来自当前策略的采样，覆盖模型真实会生成的回答，修正的是它当下的错误。

实例：Llama 3 的后训练进行了六轮，每轮都用最新的模型采样、收集新的偏好标注与 SFT 数据，DPO 主要使用最近几批、由上一轮最好的模型采集的偏好数据；Self-Rewarding（Yuan 等, 2024）让模型以 LLM-as-a-Judge 的方式给自己的回答打分、构造偏好对，迭代地做 DPO。

- B 错：仍然需要偏好信号：奖励模型、评审模型（包括模型自评）或人工标注；新一轮的回答并不总比上一轮好，不能按轮次默认标胜负。
- C 错：仍然需要参考模型。常见做法是每轮把上一轮的模型作为新的参考模型，也可以固定为 SFT 模型，这是一种设计选择，而不是「不需要」。
- D 错：每轮都要大量采样和打分，计算成本高于离线 DPO；它是在成本与效果之间向在线 RL 靠拢。

<sub>考点：在线与迭代DPO　｜　出处：Llama 3 论文 arXiv:2407.21783（4.1 节）；Self-Rewarding Language Models arXiv:2401.10020</sub>

</details>

---

<a name="ALN-PO-034"></a>

### ALN-PO-034　进阶 · 考频 ★★

构造 DPO 偏好对时，关于 chosen 与 rejected 的差异程度，下列做法最合理的是：

- **A.** 尽量让 rejected 与 chosen 差异极大（例如 rejected 是随机文本），这样信号最清晰、训练最稳
- **B.** 尽量让 chosen 与 rejected 几乎相同，只差一两个 token，这样模型学得最精准，也不会有副作用
- **C.** 优先选择质量差异明确、但无法单靠长度或格式等表面特征区分的偏好对，并过滤分差过小（可能是噪声）或两者几乎相同的样本
- **D.** 差异程度无所谓，只要数据量足够大，DPO 会自动学到正确的偏好

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：好的偏好对应当「差在质量，不差在表面」，而且差异要足够明确。

- A 错：差异过大的对（随机文本、明显劣质的回答）模型很快就能排对，margin 迅速变大，梯度权重 $\sigma(\hat r_l-\hat r_w)$ 趋于 0，几乎学不到东西；还可能学到「区分来源」之类的表面特征。
- B 错：差异极小的对往往是噪声（标注员也难以区分）；更重要的是，Razin 等（2024）发现似然位移主要由 chosen 与 rejected 隐藏表示很相似的偏好对驱动：压低 rejected 时会连带压低 chosen，严重时会让模型在安全等方面「意外失准」。他们建议筛掉这类样本、使用差异明确的偏好对。
- C 对：中等难度、质量差异明确的样本（例如一条正确、一条有事实错误或遗漏关键步骤）提供最有用的梯度；控制长度和格式，避免模型把它们当成偏好；用奖励模型分差或多人一致性过滤噪声。
- D 错：数据中的系统性偏差（长度、来源、格式）不会因为数据量变大而消失，反而会被学得更牢。

<sub>考点：偏好数据质量　｜　出处：Razin 等 arXiv:2410.08847</sub>

</details>

---

<a name="ALN-PO-037"></a>

### ALN-PO-037　基础 · 考频 ★★★

团队已有 5 万对高质量的人工偏好数据，目标是改善对话的风格与安全性；GPU 资源有限，也缺乏 RL 训练经验。下列方案中最合适的起步方案是：

- **A.** 直接搭建完整的 PPO 流程（训练奖励模型和 critic、在线采样），因为 PPO 的效果上限最高
- **B.** 先做 DPO（必要时加 chosen 的 NLL 项），资源允许后再考虑在线 / 迭代 DPO 或 RL
- **C.** 只在偏好数据的 chosen 上做 SFT，rejected 直接丢弃，效果与 DPO 相同
- **D.** 用 GRPO，因为它不需要 critic，是最省资源的对齐方法

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：已有偏好数据、目标是风格与安全、资源和经验有限时，DPO 是性价比最高的起点：只需要策略和参考模型（参考模型的对数概率可以离线预先算好），训练流程接近 SFT，稳定、好调。

- A 错：PPO 的上限可能更高，但需要四个模型、在线生成与大量调参，工程量大一个数量级，不适合作为起步方案。
- C 错：只用 chosen 做 SFT，丢掉了「哪里不好」的对比信息，通常不如 DPO；不过它可以作为 DPO 之前的准备步骤，或作为 DPO 中的辅助 NLL 项。
- D 错：GRPO 主要用于有可验证奖励（数学、代码）的在线 RL；风格与安全没有现成的规则验证器，仍需要奖励模型，还要在线采样，并不比 DPO 省事。

<sub>考点：DPO与PPO对比</sub>

</details>

---

## 多选题

<a name="ALN-PO-015"></a>

### ALN-PO-015　进阶 · 考频 ★★

关于 DPO 的隐式奖励 $\hat r_\theta(x,y)=\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\text{ref}}(y\mid x)}$，下列说法**正确**的有：

- **A.** 可以用它给同一提示词的多条候选回答排序，相当于一个「附带」的奖励模型
- **B.** 训练开始时（策略等于参考模型），所有回答的隐式奖励都为 0
- **C.** 训练中常监控 chosen 奖励、rejected 奖励、二者之差（margin）和排序准确率
- **D.** 隐式奖励不依赖参考模型的选择，换一个参考模型，同一策略给出的隐式奖励不变
- **E.** chosen 的隐式奖励上升，说明 chosen 的序列对数概率一定已经高于 rejected

<details>
<summary>答案与解析</summary>

**答案：ABC**

**解析：**

**结论**：A、B、C 正确。

- A 对：同一提示词下 $\beta\log Z(x)$ 相同，隐式奖励的排序与 KL 约束目标对应的奖励排序一致，可以用来做 best-of-N 选择或给新采样的回答打分；但它在训练数据分布之外未必可靠。
- B 对：$\log(\pi_\theta/\pi_{\text{ref}})=0$，这也是 DPO 初始损失恒为 $\ln2$ 的原因。
- C 对：这四个量是 DPO 训练最常看的指标；但它们上升不代表生成质量上升，还要看 chosen 的对数概率和真实的生成评测。
- D 错：隐式奖励的定义里就有 $\pi_{\text{ref}}$，换参考模型，奖励的含义随之改变。
- E 错：隐式奖励衡量的是相对参考模型的**变化**；chosen 的绝对对数概率可能仍低于 rejected（例如 chosen 更长）。

<sub>考点：隐式奖励</sub>

</details>

---

<a name="ALN-PO-019"></a>

### ALN-PO-019　进阶 · 考频 ★★★

关于 DPO 的局限与失效模式，下列说法**正确**的有：

- **A.** margin 和排序准确率持续上升、隐式奖励把 chosen 排在前面，就足以说明 DPO 没有出现失效
- **B.** 当 chosen 平均比 rejected 更长时，DPO 可能顺带学会把回答写得更长
- **C.** 由于 DPO 是离线方法、训练更稳定，它在数学、代码等推理任务上的提升通常比在线 RL 更大
- **D.** 偏好数据常来自其他模型，但 DPO 只在数据中出现过的回答上施加梯度，因此数据之外回答的概率保持不变
- **E.** 若某对偏好是确定性的（chosen 总是赢），BT 要求分差趋于无穷，DPO 会把 rejected 概率压向 0，KL 正则失效

<details>
<summary>答案与解析</summary>

**答案：BE**

**解析：**

**结论**：B、E 正确。

- A 错：margin 与准确率上升，也可能伴随着 chosen 概率下降、概率流向数据外的回答；还要看 chosen 的对数概率和真实的生成评测。
- B 对：长度偏置。chosen 系统性更长时，长度会被当成「偏好」学进去，回答变得啰嗦；SimPO 的长度归一化、长度均衡的数据构造都是对策。
- C 错：离线训练更稳定、更省事，但缺少在线探索和可验证的奖励，DPO 在数学、代码等推理任务上通常不如在线 RL；推理模型的训练以在线 RL 为主。
- D 错：梯度只作用在数据中的回答上，但策略的概率是归一化的。压低 rejected（往往连带压低 chosen）时，概率质量会流向数据之外的回答，它们的概率可能被意外抬高。这是离线方法的根本代价——分布偏移。Xu 等（2024）证明 PPO 的解集是 DPO 解集的真子集：DPO 可能找到把概率放在数据外回答上的解。
- E 对：这是 IPO 论文对 DPO 的批评：BT 加最大似然在确定性偏好下没有有限解，KL 正则不起作用，模型过拟合。IPO 改用回归到有限目标 margin 的平方损失。

<sub>考点：DPO失效模式　｜　出处：Is DPO Superior to PPO for LLM Alignment? arXiv:2404.10719；IPO 论文 arXiv:2310.12036</sub>

</details>

---

<a name="ALN-PO-033"></a>

### ALN-PO-033　进阶 · 考频 ★★

关于在线 / 迭代 DPO 及相关方法，下列说法**正确**的有：

- **A.** 在线 DPO 与离线 DPO 的区别只在数据量：多轮累积下来的偏好对更多，所以效果更好
- **B.** 迭代过程中，同一提示词的多次采样可能越来越相似，导致偏好对的区分度下降
- **C.** 在线 DPO 的偏好对通常由当前策略生成的回答构成，再由奖励模型、评审或人工标注偏好
- **D.** Self-Rewarding 让模型充当评审、给自己生成的回答打分来构造偏好对，再迭代地做 DPO
- **E.** 每轮都用当前策略重新采样、重新打分，打分器的偏差会随迭代被稀释，因此可以省去人工抽检

<details>
<summary>答案与解析</summary>

**答案：BCD**

**解析：**

**结论**：B、C、D 正确。

- A 错：在线 / 迭代 DPO 的关键是数据分布跟随策略变化，性质上接近 on-policy 学习，而不只是数据量更大。
- B 对：策略越来越确定，采样多样性下降；可以提高采样温度、增加每题采样数、扩充提示词。
- C 对：这是在线 / 迭代 DPO 的定义性特征：数据来自当前策略，标注来自外部或模型自身的打分器。
- D 对：Self-Rewarding Language Models（Yuan 等, 2024）让模型以 LLM-as-a-Judge 的方式自评，在 Llama 2 70B 上迭代三轮，指令遵循能力和自身作为评审的打分能力都有提升。
- E 错：恰恰相反，策略会越来越擅长「讨好」打分器，偏差在迭代中被放大（奖励黑客）；需要人工抽检、更新打分器或混合多种打分来源。

<sub>考点：在线与迭代DPO　｜　出处：Self-Rewarding Language Models arXiv:2401.10020</sub>

</details>

---

<a name="ALN-PO-035"></a>

### ALN-PO-035　进阶 · 考频 ★★

关于 DPO 偏好数据的质量控制，下列做法**合理**的有：

- **A.** 标注噪声较大时，用标签平滑（如 cDPO）或改用 IPO 这类不把 margin 推向无穷的损失
- **B.** 只保留评审分差最大的那部分样本：分差越大标签越可靠，偏好对的学习价值也越高，可以提升训练效率
- **C.** 平局或「两者都差」的样本也按评审的微小分差强行标出胜负，以免浪费数据、保持样本量
- **D.** 用当前 SFT 模型对同一提示词采样多条回答，再打分构造偏好对，让数据贴近策略分布
- **E.** 检查 chosen 与 rejected 的长度差，若 chosen 系统性更长，就做平衡或构造长度相近的偏好对

<details>
<summary>答案与解析</summary>

**答案：ADE**

**解析：**

**结论**：A、D、E 合理。

- A 对：cDPO 假设标签以概率 ε 翻转，损失变为 $-(1-\varepsilon)\log\sigma(\beta h)-\varepsilon\log\sigma(-\beta h)$，最优的 margin 有限；IPO 的平方损失同样不会把 margin 推向无穷。
- B 不合理：分差最大的往往是「一好一烂」的简单样本，信息量小，还容易学到表面特征。通常是过滤掉分差过小的噪声对，同时保留中等难度的样本。
- C 不合理：平局或两者都差时强行标胜负，等于引入随机标签；更好的做法是丢弃、单独标记或记录偏好强度。
- D 对：on-policy 的偏好数据覆盖策略真正会生成的回答，缓解分布偏移，是实践中效果较好的做法。
- E 对：长度偏置是最常见的系统性偏差，不处理会让模型学会啰嗦。

<sub>考点：偏好数据质量　｜　出处：IPO 论文 arXiv:2310.12036；cDPO 见 Mitchell (2023) 及 rDPO 论文 arXiv:2403.00409</sub>

</details>

---

<a name="ALN-PO-039"></a>

### ALN-PO-039　挑战 · 考频 ★★

关于 DPO 与 PPO 的理论与实证比较，下列说法**正确**的有：

- **A.** DPO 每步也会用当前策略在线生成新回答、计算隐式奖励的梯度，因此同样能探索偏好数据之外的回答
- **B.** 理想条件下（偏好服从 BT 模型、数据无限），两者优化同一个 KL 约束目标，最优策略相同
- **C.** Xu 等（2024）发现，做好优势归一化、大 batch、参考模型滑动平均更新后，PPO 在对话和代码任务上优于 DPO
- **D.** Xu 等（2024）证明 PPO 的解集是 DPO 解集的真子集：DPO 可能把概率放在偏好数据之外的回答上
- **E.** DPO 不显式训练奖励模型，但隐式拟合的仍是偏好数据中的 BT 奖励，数据里的长度等偏差同样会被学进去

<details>
<summary>答案与解析</summary>

**答案：BCDE**

**解析：**

**结论**：B、C、D、E 正确。

- A 错：标准 DPO 是纯离线的，不生成新回答，这正是它缺乏探索、受分布偏移影响的原因；在线 / 迭代 DPO 才会采样新回答。
- B 对：DPO 的推导没有近似，理想条件下与 RLHF 目标等价。
- C 对：论文指出这三项是 PPO 发挥好效果的关键，其中大 batch 带来的提升最大，尤其是在代码生成任务上；调好的 PPO 在竞赛级代码任务上取得了当时的最好结果。
- D 对：论文的反例中，偏好数据只比较了 $y_1$ 与 $y_2$，DPO 可以把 0.9 的概率放在从未出现过的 $y_3$ 上仍达到损失最小；PPO 的奖励和 KL 惩罚都作用在策略自己生成的回答上，参考模型对 $y_3$ 的概率为 0，KL 约束不允许这样做。
- E 对：DPO 只是把奖励模型「藏」进了策略里，拟合的仍是偏好数据中的 BT 奖励。chosen 系统性更长时，长度会被当成「偏好」学进去，DPO 同样会变得啰嗦；常见对策是构造长度均衡的偏好对，或改用 SimPO 这类长度归一化的目标。

<sub>考点：DPO与PPO对比、DPO失效模式　｜　出处：Is DPO Superior to PPO for LLM Alignment? arXiv:2404.10719</sub>

</details>

---

## 判断题

<a name="ALN-PO-004"></a>

### ALN-PO-004　进阶 · 考频 ★★

在偏好确实服从 Bradley-Terry 模型、数据覆盖所有回答且数量无限的理想条件下，DPO 与 KL 约束的 RLHF 目标具有相同的最优策略；但在有限的离线偏好数据上，二者训练出的策略可能明显不同。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。DPO 的推导只用到「KL 约束目标有闭式解」和「BT 模型只依赖奖励差」，没有任何近似，所以理想条件下二者的最优解一致。差别出在有限数据上：

- RLHF 先训练奖励模型，奖励模型会把偏好泛化到没见过的回答上；PPO 再在策略自己的采样分布上优化，KL 约束作用在策略实际生成的回答上；
- DPO 只约束数据集中出现过的回答对之间的相对概率，对数据之外的回答几乎没有约束，它们的概率可能被意外抬高（Xu 等, 2024 的分析）；数据来自其他模型时，还存在分布偏移。

所以「DPO 等价于 RLHF」只在理想条件下成立，实践中二者各有优劣。

<sub>考点：DPO推导、DPO与PPO对比　｜　出处：Is DPO Superior to PPO for LLM Alignment? arXiv:2404.10719</sub>

</details>

---

<a name="ALN-PO-012"></a>

### ALN-PO-012　进阶 · 考频 ★★

DPO 中 β 越大，同样的对数概率比对应的隐式奖励差越大，因此模型会被推得离参考模型越远，训练越激进。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。β 大确实让同样的 log-ratio 差 $\Delta$ 对应更大的 logit $\beta\Delta$，但这意味着损失更快饱和：$-\log\sigma(\beta\Delta)$ 在 $\beta\Delta$ 达到 2～3 时就已经很小，梯度权重 $\sigma(-\beta\Delta)$ 随之变小，模型不再被推着继续偏离参考模型。从最优解看，$\pi^*\propto\pi_{\text{ref}}\exp(r/\beta)$，β 越大越接近 $\pi_{\text{ref}}$。所以 β 越大越保守，越小越激进。

需要区分的是训练初期：初始梯度为 $\mp\beta/2$，与 β 成正比，β 大时前几步的更新可能更大；但这影响的是「走多快」，而不是「最终走多远」。

<sub>考点：β的作用</sub>

</details>

---

<a name="ALN-PO-016"></a>

### ALN-PO-016　进阶 · 考频 ★★

DPO 的隐式奖励 $\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\text{ref}}(y\mid x)}$ 与真实奖励只差一个依赖提示词的项 $\beta\log Z(x)$，因此在同一提示词的不同回答之间比较隐式奖励是有意义的，但不宜跨提示词直接比较其绝对大小。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。由 $r(x,y)=\beta\log\frac{\pi^*(y\mid x)}{\pi_{\text{ref}}(y\mid x)}+\beta\log Z(x)$，同一提示词下 $\beta\log Z(x)$ 是常数，排序和差值都不受影响；不同提示词的 $Z(x)$ 不同，隐式奖励的绝对值不能直接比较。例如某提示词下所有回答的隐式奖励都是负数，并不说明这些回答都「不好」。

这与 BT 奖励模型「只有分差有意义」是同一件事：BT 损失本身就无法确定每个提示词的偏移。所以把 DPO 模型当奖励模型用时，应只在同一提示词内部排序；需要跨提示词比较（例如筛选整体质量）时，最好另行归一化或使用专门训练的评分模型。

<sub>考点：隐式奖励</sub>

</details>

---

<a name="ALN-PO-021"></a>

### ALN-PO-021　进阶 · 考频 ★★★

DPO 训练中，验证集上的 margin（chosen 与 rejected 的隐式奖励之差）持续上升，说明模型给 chosen 回答的概率在上升，生成质量也在随之提升。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。margin 是两个隐式奖励之**差**，只衡量「策略相对参考模型，把 chosen 排在 rejected 前面」的程度，说明不了 chosen 本身的概率怎样变化；它与生成质量之间至少隔着三道坎：

1. **chosen 的概率可能在下降**：两者一起降、rejected 降得更多，margin 照样上升，概率质量却流向了数据外的回答；
2. **可能学到了表面特征**：例如 chosen 普遍更长，模型学会「越长越好」，margin 和排序准确率都很高，但回答啰嗦；
3. **评估只覆盖数据中的回答**：模型真正生成的回答可能与偏好数据的分布很不一样，margin 反映不了它们的质量。

正确的监控应同时看 chosen / rejected 的对数概率与回答长度，并定期做真实的生成评测（人工或评审模型、长度控制的胜率）以及通用能力的回归测试。

<sub>考点：DPO失效模式</sub>

</details>

---

<a name="ALN-PO-026"></a>

### ALN-PO-026　基础 · 考频 ★★

KTO 只需要每条回答一个「好 / 坏」二元标签，不需要同一提示词下成对的 chosen / rejected 回答，因此可以直接利用点赞、点踩一类的反馈；但标准形式的 KTO 仍然需要参考模型。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。KTO 的损失作用在隐式奖励 $r_\theta(x,y)=\log\frac{\pi_\theta(y\mid x)}{\pi_{\text{ref}}(y\mid x)}$ 与参考点 $z_0$ 之差上：好回答的损失为 $\lambda_D\big(1-\sigma(\beta(r_\theta-z_0))\big)$，坏回答为 $\lambda_U\big(1-\sigma(\beta(z_0-r_\theta))\big)$。每条样本单独计算，不需要配对；$z_0$ 用批内错配的（提示词，回答）对估计策略与参考模型之间的 KL，并截断到不小于 0、不回传梯度。$r_\theta$ 与 $z_0$ 的定义都离不开参考模型。

论文还给出一个省显存的变体：假设参考模型是均匀分布，从而不必加载参考模型，但效果略逊于标准 KTO。成对数据也可以拆成「好」「坏」两条单条样本给 KTO 使用。

不需要参考模型的常见方法是 ORPO 与 SimPO，它们又都需要成对数据。按「数据形式」与「是否需要参考模型」两个维度来记这几种方法，最不容易混淆。

<sub>考点：KTO　｜　出处：KTO 论文 arXiv:2402.01306</sub>

</details>

---

<a name="ALN-PO-042"></a>

### ALN-PO-042　进阶 · 考频 ★

Noukhovitch 等（2024）研究异步 RLHF（推理端用旧权重生成样本、训练端同时更新）时发现：在他们比较的几种 RLHF 算法中，在线 DPO 对 off-policy 数据最稳健，而且策略模型越大，对 off-policy 数据越稳健。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。该研究把生成与训练解耦：模型在旧样本上训练的同时生成新样本，这正是「在线但异策略」的设定，核心问题是能容忍多大程度的异策略。论文的结论包括：
- 在线 DPO 对 off-policy 数据最稳健；
- 策略模型越大，对 off-policy 数据越稳健；
- 在 LLaMA 3.1 8B 的指令遵循任务上，异步训练比同步训练快约 40%，最终效果相当。

直观理解：DPO 一类的对比式目标不依赖逐 token 的重要性比率，数据稍旧时只是信号变弱，不会像 PPO 的比率那样被裁掉或放大。但这不意味着可以不加限制地使用旧数据，实践中仍要控制陈旧度。

<sub>考点：在线与迭代DPO　｜　出处：Noukhovitch 等 Asynchronous RLHF: Faster and More Efficient Off-Policy RL for Language Models arXiv:2410.18252</sub>

</details>

---

## 填空题

<a name="ALN-PO-005"></a>

### ALN-PO-005　进阶 · 考频 ★★

设 KL 约束目标（系数 $\beta=0.5$）的最优策略为 $\pi^*$。对某个提示词的两条回答，已知 $\pi_{\text{ref}}(y_1)=0.2$、$\pi^*(y_1)=0.4$，$\pi_{\text{ref}}(y_2)=0.5$、$\pi^*(y_2)=0.25$。则两者的真实奖励差 $r(y_1)-r(y_2)=$ ____（保留 3 位小数）；按 Bradley-Terry 模型，$y_1$ 优于 $y_2$ 的概率为 ____（保留 3 位小数）。

<details>
<summary>答案与解析</summary>

**答案：** (1) 0.693 / ln2 / ln 2；(2) 0.667 / 2/3

**解析：**

由 $r=\beta\log\dfrac{\pi^*}{\pi_{\text{ref}}}+\beta\log Z(x)$，同一提示词下两条回答的 $\beta\log Z(x)$ 相同，相减抵消：
$$r(y_1)-r(y_2)=0.5\Big(\ln\frac{0.4}{0.2}-\ln\frac{0.25}{0.5}\Big)=0.5\,(\ln2+\ln2)=\ln2\approx0.693$$
BT 概率 $\sigma(\ln2)=\dfrac{1}{1+e^{-\ln2}}=\dfrac{1}{1+1/2}=\dfrac23\approx0.667$。

注意：只能求出奖励**差**，求不出单条回答的奖励 $r(y_1)$ 本身，因为 $Z(x)$ 未知。这也是 DPO 的隐式奖励 $\beta\log(\pi_\theta/\pi_{\text{ref}})$「只在同一提示词内比较才有意义」的原因。

<sub>考点：DPO推导</sub>

</details>

---

<a name="ALN-PO-013"></a>

### ALN-PO-013　进阶 · 考频 ★★

记 $\Delta=\log\frac{\pi_\theta(y_w)}{\pi_{\text{ref}}(y_w)}-\log\frac{\pi_\theta(y_l)}{\pi_{\text{ref}}(y_l)}$。要让单个样本的 DPO 损失 $-\log\sigma(\beta\Delta)$ 降到 0.1，需要 $\beta\Delta\approx$ ____（保留 2 位小数）；当 $\beta=0.1$ 时，对应的 $\Delta\approx$ ____ nats（保留 1 位小数）。

<details>
<summary>答案与解析</summary>

**答案：** (1) 2.25；(2) 22.5

**解析：**

$-\log\sigma(z)=0.1\Rightarrow\sigma(z)=e^{-0.1}\approx0.9048\Rightarrow z=\ln\dfrac{0.9048}{1-0.9048}\approx$ **2.25**。

β = 0.1 时 $\Delta\approx2.25/0.1=$ **22.5** nats；若 β = 0.5，只需 $\Delta\approx4.5$ nats。

解读：β 越小，要把损失降到同样的水平，策略相对参考模型要拉开的对数概率差就越大，也就离参考模型越远。22.5 nats 意味着 chosen 与 rejected 的概率比相对参考模型放大了约 $e^{22.5}\approx6\times10^9$ 倍。这也说明了 β 很小时，DPO 容易把 rejected 的概率压到极低，甚至连带 chosen 一起往下掉。

<sub>考点：β的作用、DPO损失</sub>

</details>

---

<a name="ALN-PO-017"></a>

### ALN-PO-017　基础 · 考频 ★★

β = 0.1，某条 rejected 回答在策略下的序列对数概率为 −35.2，在参考模型下为 −38.0，则它的隐式奖励为 ____；若同一提示词的 chosen 回答隐式奖励为 0.5，该样本的 DPO 损失为 ____（保留 3 位小数）。

<details>
<summary>答案与解析</summary>

**答案：** (1) 0.28；(2) 0.589

**解析：**

- 隐式奖励：$0.1\times(-35.2+38.0)=$ **0.28**。注意这是一条 rejected 回答，它的隐式奖励为正，说明策略反而提高了它相对参考模型的概率。
- margin $=0.5-0.28=0.22$，损失 $=-\log\sigma(0.22)\approx-\log0.5548\approx$ **0.589**，只比初始的 0.693 低一点：排序虽然对了，差距还很小。

监控中如果大量 rejected 的隐式奖励为正，说明模型在整体抬高这类回答（例如它们与 chosen 很相似），需要结合 chosen 的奖励与对数概率一起判断。

<sub>考点：隐式奖励、DPO损失</sub>

</details>

---

## 计算题

<a name="ALN-PO-003"></a>

### ALN-PO-003　挑战 · 考频 ★★

某提示词只有三条候选回答，参考模型的概率为 $\pi_{\text{ref}}=[0.5,\ 0.3,\ 0.2]$，奖励为 $r=[1,\ 2,\ 0]$。KL 约束目标 $\max_\pi\mathbb{E}_\pi[r]-\beta\,\mathrm{KL}(\pi\|\pi_{\text{ref}})$ 的最优解为 $\pi^*\propto\pi_{\text{ref}}\exp(r/\beta)$。
(1) 求 $\beta=1$ 时的 $\pi^*$ 与 $Z$；
(2) 求 $\beta=0.5$ 与 $\beta=5$ 时的 $\pi^*$；
(3) 比较三种 $\beta$ 下的期望奖励，并验证 $\beta=1$ 时最优目标值等于 $\beta\log Z$。

<details>
<summary>答案与解析</summary>

**答案：(1) π* ≈ [0.360, 0.587, 0.053]，Z ≈ 3.776；(2) β=0.5 时 ≈ [0.182, 0.808, 0.010]，β=5 时 ≈ [0.485, 0.356, 0.159]；(3) 期望奖励约 1.80（β=0.5）> 1.53（β=1）> 1.20（β=5）> 参考模型的 1.10；β=1 时 E[r] − KL ≈ 1.534 − 0.206 ≈ 1.329 = ln Z**

**解析：**

**(1)** 未归一化权重 $\pi_{\text{ref}}e^{r/\beta}=[0.5e,\ 0.3e^2,\ 0.2]\approx[1.359,\ 2.217,\ 0.2]$，$Z\approx3.776$，$\pi^*\approx$ **[0.360, 0.587, 0.053]**。奖励最高的回答 2 从 0.3 升到 0.587，奖励最低的回答 3 从 0.2 降到 0.053。

**(2)**
- $\beta=0.5$：权重 $[0.5e^2,\ 0.3e^4,\ 0.2]\approx[3.695,\ 16.379,\ 0.2]$，$\pi^*\approx$ **[0.182, 0.808, 0.010]**，更激进地集中到最高奖励；
- $\beta=5$：权重 $[0.5e^{0.2},\ 0.3e^{0.4},\ 0.2]\approx[0.611,\ 0.448,\ 0.2]$，$\pi^*\approx$ **[0.485, 0.356, 0.159]**，几乎停在参考模型附近。

**(3)** 期望奖励：$\beta=0.5$ 约 1.80，$\beta=1$ 约 1.53，$\beta=5$ 约 1.20，参考模型为 $0.5\times1+0.3\times2=1.1$。$\beta$ 越小，越敢偏离参考模型去换取奖励。

$\beta=1$ 时 $\mathrm{KL}(\pi^*\|\pi_{\text{ref}})\approx0.206$，目标值 $\approx1.534-0.206=1.329$，而 $\ln Z=\ln3.776\approx1.329$，二者相等。这正是推导中的恒等式 $\mathbb{E}_\pi[r]-\beta\,\mathrm{KL}(\pi\|\pi_{\text{ref}})=\beta\log Z-\beta\,\mathrm{KL}(\pi\|\pi^*)$：在 $\pi=\pi^*$ 时取到最大值 $\beta\log Z$。

**意义**：这里的 β 就是 DPO 损失里的 β；DPO 想要逼近的正是这个 $\pi^*$，只是不需要知道 $r$ 和 $Z$。

<sub>考点：DPO推导、β的作用</sub>

</details>

---

<a name="ALN-PO-006"></a>

### ALN-PO-006　进阶 · 考频 ★★★

DPO 训练中的某个样本：$\beta=0.2$；策略对 chosen 的序列对数概率 $\log\pi_\theta(y_w)=-20$，参考模型为 $\log\pi_{\text{ref}}(y_w)=-21$；策略对 rejected 的 $\log\pi_\theta(y_l)=-18$，参考模型为 $\log\pi_{\text{ref}}(y_l)=-17.5$。
(1) 求 chosen 与 rejected 的隐式奖励；
(2) 求该样本的 DPO 损失；
(3) 求损失对 $\log\pi_\theta(y_w)$ 和 $\log\pi_\theta(y_l)$ 的梯度，并说明一步梯度下降后二者如何变化；
(4) 策略下 rejected 的对数概率（−18）比 chosen（−20）还高，这能说明模型「更偏好 rejected」吗？

<details>
<summary>答案与解析</summary>

**答案：(1) r̂_w = 0.2，r̂_l = −0.1；(2) loss = −log σ(0.3) ≈ 0.554；(3) ∂L/∂log π(y_w) ≈ −0.085，∂L/∂log π(y_l) ≈ +0.085，梯度下降推高 chosen、压低 rejected；(4) 不能，DPO 比较的是相对参考模型的变化**

**解析：**

**(1)** $\hat r_w=0.2\times(-20+21)=$ **0.2**；$\hat r_l=0.2\times(-18+17.5)=$ **−0.1**。

**(2)** margin $=\hat r_w-\hat r_l=0.3$，$\mathcal{L}=-\log\sigma(0.3)=-\log0.5744\approx$ **0.554**。

**(3)** 记 $z=\hat r_w-\hat r_l$，$\partial\mathcal{L}/\partial z=-\sigma(-z)$，而 $\partial z/\partial\log\pi_\theta(y_w)=\beta$、$\partial z/\partial\log\pi_\theta(y_l)=-\beta$：
- $\partial\mathcal{L}/\partial\log\pi_\theta(y_w)=-\beta\,\sigma(-0.3)=-0.2\times0.4256\approx$ **−0.085**；
- $\partial\mathcal{L}/\partial\log\pi_\theta(y_l)=$ **+0.085**。

梯度下降会提高 $\log\pi_\theta(y_w)$、降低 $\log\pi_\theta(y_l)$。权重 $\sigma(-z)$ 随 margin 增大而减小：已经排对并拉开差距的样本，学得越来越少。

**(4)** 不能。序列对数概率受长度、措辞等因素影响，不同回答的绝对值不可比。DPO 看的是**相对参考模型的变化**：chosen 相比参考模型升了 1，rejected 降了 0.5，说明训练正在朝正确方向推进。

<sub>考点：DPO损失、隐式奖励</sub>

</details>

---

<a name="ALN-PO-024"></a>

### ALN-PO-024　挑战 · 考频 ★★

设 $h$ 为两条回答相对参考模型的对数概率比之差（同 DPO）。DPO 取 $\beta=0.1$，IPO 取 $\tau=0.1$（目标 margin 为 $\frac{1}{2\tau}$）。分别对 $h=2$ 与 $h=8$ 两种情况：
(1) 计算 IPO 与 DPO 的损失；
(2) 计算两种损失对 $h$ 的导数，并说明梯度下降会让 $h$ 往哪个方向变。

<details>
<summary>答案与解析</summary>

**答案：h=2：IPO 损失 9、导数 −6（h 增大）；DPO 损失 ≈ 0.598、导数 ≈ −0.045（h 增大）。h=8：IPO 损失 9、导数 +6（h 减小，拉回目标 5）；DPO 损失 ≈ 0.371、导数 ≈ −0.031（h 继续增大）**

**解析：**

目标 margin $\frac{1}{2\tau}=5$。

**IPO**：$\mathcal{L}=(h-5)^2$，$\partial\mathcal{L}/\partial h=2(h-5)$。
- $h=2$：损失 9，导数 $-6$，梯度下降使 $h$ **增大**；
- $h=8$：损失 9，导数 $+6$，梯度下降使 $h$ **减小**，拉回 5。

**DPO**：$\mathcal{L}=-\log\sigma(0.1h)$，$\partial\mathcal{L}/\partial h=-0.1\,\sigma(-0.1h)$。
- $h=2$：损失 $-\log\sigma(0.2)\approx0.598$，导数 $-0.1\times\sigma(-0.2)\approx-0.045$，$h$ 增大；
- $h=8$：损失 $-\log\sigma(0.8)\approx0.371$，导数 $-0.1\times\sigma(-0.8)\approx-0.031$，$h$ **仍然增大**。

**结论**：DPO 的导数恒为负，只要训练继续，$h$ 就一直被推大（只是越来越慢），确定性偏好下最终趋于无穷；IPO 有一个有限的稳定点 $h=5$，超过就往回拉，相当于真正施加了「别离参考模型太远」的约束。代价是：IPO 对所有样本要求同样的目标 margin，不区分偏好强度；平方损失在离目标很远时梯度很大，需要配合 τ 与学习率调节。

<sub>考点：IPO、DPO损失　｜　出处：IPO 论文 arXiv:2310.12036</sub>

</details>

---

<a name="ALN-PO-028"></a>

### ALN-PO-028　进阶 · 考频 ★

ORPO 中 $P_\theta(y\mid x)$ 取逐 token 平均对数概率的指数 $\exp\big(\frac{1}{|y|}\sum_t\log\pi_\theta(y_t\mid x,y_{<t})\big)$，赔率 $\text{odds}=\frac{P}{1-P}$。某样本 chosen 的逐 token 平均对数概率为 −0.5，rejected 为 −1.0，$\lambda=0.1$，SFT 项取 chosen 的逐 token 平均负对数似然。求：
(1) chosen、rejected 的 $P$ 与赔率；
(2) 对数赔率比 $\log\text{OR}$ 与 $\mathcal{L}_{\text{OR}}=-\log\sigma(\log\text{OR})$；
(3) 总损失 $\mathcal{L}=\mathcal{L}_{\text{SFT}}+\lambda\mathcal{L}_{\text{OR}}$。

<details>
<summary>答案与解析</summary>

**答案：(1) P_w ≈ 0.607、odds_w ≈ 1.541；P_l ≈ 0.368、odds_l ≈ 0.582；(2) log OR ≈ 0.974，L_OR ≈ 0.320；(3) L ≈ 0.5 + 0.1 × 0.320 ≈ 0.532**

**解析：**

**(1)** $P_w=e^{-0.5}\approx0.6065$，$\text{odds}_w=0.6065/0.3935\approx1.541$；$P_l=e^{-1}\approx0.3679$，$\text{odds}_l=0.3679/0.6321\approx0.582$。

**(2)** $\log\text{OR}=\ln(1.541/0.582)\approx$ **0.974**；$\mathcal{L}_{\text{OR}}=-\log\sigma(0.974)\approx$ **0.320**。

**(3)** $\mathcal{L}_{\text{SFT}}=0.5$，总损失 $\approx0.5+0.1\times0.320=$ **0.532**。

**解读**：
- 总损失中 SFT 项占大头，偏好项是附加约束：模型主要在学 chosen，同时被要求让 chosen 的赔率明显高于 rejected。
- 为什么用赔率比而不是概率比：ORPO 论文专门做了比较，认为与 SFT 联合训练时，基于概率比的对比会对 rejected 施加更极端的压制（实验中 rejected 的对数概率被压得更快），容易导致退化；赔率比的惩罚更温和。
- 这里的 $P$ 用的是平均对数概率，带有长度归一化。

<sub>考点：ORPO　｜　出处：ORPO 论文 arXiv:2403.07691（公式 3～7 与 7.1 节）</sub>

</details>

---

<a name="ALN-PO-030"></a>

### ALN-PO-030　进阶 · 考频 ★★

SimPO 中，某样本 chosen 回答 50 个 token，序列对数概率之和为 −40；rejected 回答 20 个 token，序列对数概率之和为 −20。取 $\beta=2$，$\gamma=0.5$。
(1) 求两者的 SimPO 奖励、减去 margin 后的差值，以及损失；
(2) 若去掉长度归一化，直接用 $\beta\log\pi_\theta(y\mid x)$（同样不使用参考模型）作为奖励，减去 margin 后的差值和损失变为多少？这说明了什么？

<details>
<summary>答案与解析</summary>

**答案：(1) r_w = −1.6，r_l = −2.0，差值 −0.1，损失 ≈ 0.744；(2) 差值 −40.5，损失 ≈ 40.5；没有参考模型时，序列对数概率之和主要由长度决定，损失被「chosen 更长」这一事实主导**

**解析：**

**(1)** $r_w=\frac{2}{50}\times(-40)=-1.6$；$r_l=\frac{2}{20}\times(-20)=-2.0$；差值 $r_w-r_l-\gamma=0.4-0.5=-0.1$；损失 $-\log\sigma(-0.1)\approx$ **0.744**。按平均每个 token 的对数概率，chosen（−0.8）其实比 rejected（−1.0）更「自信」，只是还没拉开到目标 margin。

**(2)** $r_w=2\times(-40)=-80$，$r_l=2\times(-20)=-40$，差值 $-80+40-0.5=-40.5$，损失 $\approx$ **40.5**。

**说明**：序列对数概率之和随长度近似线性下降，长回答天然「吃亏」。没有参考模型时，DPO 那种「与参考模型相减」带来的长度抵消也没有了，损失几乎完全由长度差决定，模型会被强力推向「提高长回答的总概率」，梯度极大且与质量无关。SimPO 用 $1/|y|$ 归一化，把比较放到「平均每个 token」的尺度上，使奖励与长度解耦。

（DPO 中参考模型的对数概率能抵消一部分长度效应，但 chosen 系统性更长时，序列级的对数概率比仍会累积出长度偏置。）

<sub>考点：SimPO、DPO失效模式　｜　出处：SimPO 论文 arXiv:2405.14734</sub>

</details>

---

## 代码输出题

<a name="ALN-PO-009"></a>

### ALN-PO-009　进阶 · 考频 ★★

DPO 训练的第一步，策略与参考模型参数完全相同。下面的代码在这种情况下分别取 β = 0.1 与 β = 0.5，计算损失和对 chosen 序列对数概率的梯度。输出是什么？

```python
import torch
import torch.nn.functional as F

for beta in (0.1, 0.5):
    pc = torch.tensor(-30.0, requires_grad=True)    # 策略对 chosen 的序列 log-prob
    pr = torch.tensor(-25.0, requires_grad=True)    # 策略对 rejected 的序列 log-prob
    ref_c, ref_r = -30.0, -25.0                     # 参考模型与策略相同
    loss = -F.logsigmoid(beta * ((pc - ref_c) - (pr - ref_r)))
    loss.backward()
    print(beta, round(loss.item(), 4), round(pc.grad.item(), 4))
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
0.1 0.6931 -0.05
0.5 0.6931 -0.25
```

**解析：**

策略等于参考模型时，两条回答的隐式奖励都是 0，margin 为 0：
- 损失 $=-\log\sigma(0)=\ln2\approx0.6931$，与 β 无关；
- 梯度 $\partial\mathcal{L}/\partial\log\pi_\theta(y_w)=-\beta\,\sigma(0)=-\beta/2$：β = 0.1 时为 −0.05，β = 0.5 时为 −0.25。

要点：
- DPO 训练曲线的起点一定是 0.693，可以用来检查实现（例如 chosen / rejected 是否接反、参考模型是否加载正确）；
- 初始梯度与 β 成正比，β 大时前几步推得更猛；但 β 越大，同样的 log-ratio 差对应的 logit 越大，损失越快饱和，最终策略离参考模型更近；
- 本例中 rejected 的对数概率（−25）高于 chosen（−30），并不影响结果：DPO 只看相对参考模型的变化。

<sub>考点：DPO损失、β的作用</sub>

</details>

---

## 代码填空题

<a name="ALN-PO-007"></a>

### ALN-PO-007　基础 · 考频 ★★★

补全 DPO 损失。输入是 batch 内每条 chosen / rejected 回答在策略与参考模型下的序列对数概率（形状 `(B,)`），返回平均损失，以及 chosen、rejected 的隐式奖励（用于监控，不带梯度）。

```python
import torch
import torch.nn.functional as F

def dpo_loss(pi_c, pi_r, ref_c, ref_r, beta=0.1):
    r_c = ____
    r_r = beta * (pi_r - ref_r)
    loss = ____(r_c - r_r).mean()
    return loss, r_c.detach(), r_r.detach()
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `beta * (pi_c - ref_c)`；(2) `-F.logsigmoid`

**解析：**

完整写法：`r_c = beta * (pi_c - ref_c)`，`loss = -F.logsigmoid(r_c - r_r).mean()`。

- 隐式奖励是策略相对参考模型的对数概率比乘以 β；
- 损失是「chosen 的隐式奖励高于 rejected」的二分类交叉熵，与 BT 损失同形；
- 要用 `F.logsigmoid` 而不是 `torch.log(torch.sigmoid(x))`：margin 很负时 sigmoid 下溢为 0，取 log 得到 $-\infty$（测试最后一项检查了这一点）；
- 参考模型的对数概率不需要梯度，常在训练前离线算好；隐式奖励返回前 `detach`，只用于监控 chosen / rejected 奖励、margin 与排序准确率；
- 策略与参考模型相同时（训练第一步），不论 β 多大，损失都是 $\ln2\approx0.693$，单样本梯度为 $\mp\beta/2$。

<sub>考点：DPO损失</sub>

</details>

---

## 编程题

<a name="ALN-PO-008"></a>

### ALN-PO-008　挑战 · 考频 ★★

实现从 token 级对数概率计算 DPO 损失与监控指标：

```python
def dpo_from_token_logps(pol_c, pol_r, ref_c, ref_r, mask_c, mask_r, beta=0.1):
    """pol_* / ref_*: (B, T)，每个位置目标 token 在策略 / 参考模型下的对数概率；
    mask_*: (B, T) 的 0/1 张量，只有回答 token 为 1（提示词和 padding 为 0）；c 为 chosen，r 为 rejected。
    返回 dict：loss（标量，batch 平均）；chosen_reward、rejected_reward（(B,)，不带梯度）；
    margin（标量，奖励差的 batch 平均）；accuracy（标量，chosen 奖励严格高于 rejected 的比例）"""
```

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
import torch
import torch.nn.functional as F

def dpo_from_token_logps(pol_c, pol_r, ref_c, ref_r, mask_c, mask_r, beta=0.1):
    seq = lambda lp, m: (lp * m).sum(-1)                  # 只对回答 token 求和
    logits_c = seq(pol_c, mask_c) - seq(ref_c, mask_c)    # log(π/π_ref)，chosen
    logits_r = seq(pol_r, mask_r) - seq(ref_r, mask_r)
    z = beta * (logits_c - logits_r)
    loss = -F.logsigmoid(z).mean()
    rc, rr = (beta * logits_c).detach(), (beta * logits_r).detach()
    return {"loss": loss, "chosen_reward": rc, "rejected_reward": rr,
            "margin": (rc - rr).mean(), "accuracy": (rc > rr).float().mean()}
```

**测试用例：**

```python
import math

torch.manual_seed(0)
B, T = 3, 6
pol_c = (-torch.rand(B, T)).requires_grad_(True)
pol_r = (-torch.rand(B, T)).requires_grad_(True)
ref_c, ref_r = -torch.rand(B, T), -torch.rand(B, T)
mask_c = torch.tensor([[0, 0, 1, 1, 1, 0], [0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 0, 0]], dtype=torch.float32)
mask_r = torch.tensor([[0, 0, 1, 1, 0, 0], [0, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1]], dtype=torch.float32)
out = dpo_from_token_logps(pol_c, pol_r, ref_c, ref_r, mask_c, mask_r, beta=0.1)

# 1) 与逐样本的朴素实现对拍
losses, accs = [], []
for b in range(B):
    lc = sum((pol_c[b, t] - ref_c[b, t]).item() for t in range(T) if mask_c[b, t])
    lr = sum((pol_r[b, t] - ref_r[b, t]).item() for t in range(T) if mask_r[b, t])
    losses.append(math.log1p(math.exp(-0.1 * (lc - lr))))
    accs.append(1.0 if lc > lr else 0.0)
    assert abs(out["chosen_reward"][b].item() - 0.1 * lc) < 1e-5
assert abs(out["loss"].item() - sum(losses) / B) < 1e-5
assert abs(out["accuracy"].item() - sum(accs) / B) < 1e-6
assert abs(out["margin"].item() - (out["chosen_reward"] - out["rejected_reward"]).mean().item()) < 1e-6

# 2) 监控量不带梯度；提示词与 padding 位置没有梯度；回答 token 的梯度方向正确
assert not out["chosen_reward"].requires_grad
out["loss"].backward()
assert torch.all(pol_c.grad[mask_c == 0] == 0) and torch.all(pol_r.grad[mask_r == 0] == 0)
assert torch.all(pol_c.grad[mask_c == 1] < 0) and torch.all(pol_r.grad[mask_r == 1] > 0)

# 3) 策略与参考模型相同：loss = ln2，margin 为 0，accuracy 为 0（严格大于）
same = dpo_from_token_logps(ref_c, ref_r, ref_c, ref_r, mask_c, mask_r, beta=0.5)
assert abs(same["loss"].item() - math.log(2)) < 1e-6
assert same["margin"].item() == 0.0 and same["accuracy"].item() == 0.0

# 4) 修改提示词或 padding 位置的对数概率，结果不变
pol_c2 = pol_c.detach().clone()
pol_c2[mask_c == 0] = -100.0
out2 = dpo_from_token_logps(pol_c2, pol_r.detach(), ref_c, ref_r, mask_c, mask_r, beta=0.1)
assert abs(out2["loss"].item() - out["loss"].item()) < 1e-5
```

**解析：**

**思路**：
1. 序列对数概率 = 回答 token 的对数概率之和（乘 mask 再求和），提示词和 padding 不计入；
2. 策略与参考模型的序列对数概率之差就是 $\log(\pi_\theta/\pi_{\text{ref}})$，乘 β 后两条回答相减，再过 $-\log\sigma$；
3. 监控量要 `detach`：chosen / rejected 的隐式奖励、margin、accuracy 是 DPO 训练中最常看的指标。

**易错点**：
- 对 token 求平均而不是求和：DPO 推导基于整条回答的概率 $\pi(y\mid x)=\prod_t\pi(y_t\mid\cdot)$，取平均就改变了目标（SimPO 等方法才有意做长度归一化）；
- mask 把提示词也算进去：两条回答共享同一个提示词，提示词部分在相减时抵消，损失不变，但单独的 chosen / rejected 隐式奖励会被平移，监控指标失真；
- accuracy 用 `>=`：初始化时奖励全为 0，会得到虚高的 100%；
- chosen 与 rejected 长度不同，两个 mask 必须分开使用。

**补充**：只看 margin 和 accuracy 不够，还要看 chosen 的对数概率是否在持续下降（「chosen 概率也下降」问题）。

<sub>考点：DPO损失、隐式奖励</sub>

</details>

---

## 简答题

<a name="ALN-PO-001"></a>

### ALN-PO-001　挑战 · 考频 ★★★

请从 RLHF 的 KL 约束目标出发推导 DPO 的损失函数：
(1) 写出目标函数，并推出最优策略的闭式解；
(2) 说明为什么不能直接用这个闭式解训练；
(3) 如何把奖励用策略表示，并代入 Bradley-Terry 模型消去难以计算的项；
(4) 写出最终的 DPO 损失，并说明其中 $\beta$ 与参考模型的作用。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **目标与闭式解**：对每个提示词 $x$，$\max_\pi\ \mathbb{E}_{y\sim\pi}[r(x,y)]-\beta\,\mathrm{KL}\big(\pi(\cdot\mid x)\,\|\,\pi_{\text{ref}}(\cdot\mid x)\big)$。它可以改写为
   $$\mathbb{E}_\pi[r]-\beta\,\mathrm{KL}(\pi\|\pi_{\text{ref}})=-\beta\,\mathrm{KL}(\pi\|\pi^*)+\beta\log Z(x),\qquad\pi^*(y\mid x)=\frac{1}{Z(x)}\pi_{\text{ref}}(y\mid x)\,e^{r(x,y)/\beta}$$
   后一项与 $\pi$ 无关，KL 非负，所以 $\pi=\pi^*$ 时目标最大。
2. **为什么不能直接用**：$Z(x)=\sum_y\pi_{\text{ref}}(y\mid x)e^{r(x,y)/\beta}$ 要对所有可能的回答求和，无法计算；真实奖励 $r$ 本身也未知。RLHF 因此要先训练奖励模型，再用 RL 采样去逼近 $\pi^*$。
3. **用策略表示奖励**：对闭式解取对数并移项，$r(x,y)=\beta\log\dfrac{\pi^*(y\mid x)}{\pi_{\text{ref}}(y\mid x)}+\beta\log Z(x)$。代入 BT 模型 $P(y_w\succ y_l)=\sigma\big(r(x,y_w)-r(x,y_l)\big)$，两条回答属于同一个 $x$，$\beta\log Z(x)$ 相减抵消。
4. **DPO 损失**：用参数化策略 $\pi_\theta$ 代替 $\pi^*$，对偏好数据做最大似然：
   $$\mathcal{L}_{\text{DPO}}=-\mathbb{E}\Big[\log\sigma\Big(\beta\log\frac{\pi_\theta(y_w\mid x)}{\pi_{\text{ref}}(y_w\mid x)}-\beta\log\frac{\pi_\theta(y_l\mid x)}{\pi_{\text{ref}}(y_l\mid x)}\Big)\Big]$$
   - $\beta$：原目标中 KL 的系数，相当于温度，越大越保守、越贴近参考模型；
   - 参考模型：KL 的锚点，隐式奖励 $\beta\log(\pi_\theta/\pi_{\text{ref}})$ 就是相对它定义的，通常就是 SFT 模型。

   结论：DPO 隐式地拟合了 BT 奖励，优化的是与 RLHF 相同的目标，只是用固定的离线偏好数据代替了「奖励模型 + 在线 RL」。

**评分要点（共 10 分）：**

- 写出 KL 约束目标并推出 π* ∝ π_ref·exp(r/β) 的闭式解（3 分）
- 说明 Z(x) 不可计算，因此不能直接使用闭式解（1 分）
- 写出用策略表示奖励的式子，并说明代入 BT 后 β log Z(x) 抵消（3 分）
- 写出完整的 DPO 损失并解释 β 与参考模型的作用（3 分）

**讲解：**

**常见失分点**：漏掉 $Z(x)$，或说不清它为什么能消去（关键在于两条回答共享同一个提示词，这也是标准 DPO 必须用成对数据的原因）；说 DPO「没有 KL 约束」（β 就是 KL 系数，参考模型就是锚点）；把隐式奖励写成 $\beta\log\pi_\theta$、漏掉参考模型；把 σ 里的符号写反。

常见追问：$\beta\to0$ 与 $\beta\to\infty$ 时最优策略分别是什么？答：分别趋于只选奖励最高的回答（在参考模型的支撑集内），以及停留在参考模型。

<sub>考点：DPO推导、隐式奖励　｜　出处：DPO 论文 arXiv:2305.18290</sub>

</details>

---

<a name="ALN-PO-022"></a>

### ALN-PO-022　挑战 · 考频 ★★

IPO 论文指出 DPO 在「确定性偏好」下会过拟合，KL 正则失效。请解释：
(1) 什么是确定性偏好，为什么在有限数据中很常见；
(2) 为什么此时 DPO 的 β 约束「形同虚设」；
(3) IPO 如何修改损失来解决这个问题，正则系数在其中扮演什么角色；
(4) 还有哪些应对思路。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **确定性偏好**：对某个比较对，偏好概率 $p(y_w\succ y_l)=1$。即使真实偏好只有 0.8，有限数据中每个比较对往往只被标注一次，从数据上看就是「总是 $y_w$ 赢」，经验偏好概率为 1。
2. **β 失效的原因**：BT 模型 $p=\sigma(r_w-r_l)$，要拟合 $p=1$ 需要 $r_w-r_l\to\infty$。DPO 的隐式奖励差是 $\beta h$（$h$ 为两条回答相对参考模型的对数概率比之差），无论 β 取多小，最大似然都会把 $h$ 推向无穷，即把 $\pi_\theta(y_l)$ 压向 0。β 只改变「推多快」，不改变「推到哪」，KL 正则本应提供的「别离参考模型太远」不起作用，模型过拟合偏好数据。IPO 论文在双动作的例子中说明：偏好确定时，无论正则系数多大，DPO 都会收敛到确定性策略。
3. **IPO 的修改**：把 $-\log\sigma(\beta h)$ 换成平方损失
   $$\mathcal{L}_{\text{IPO}}=\mathbb{E}\Big[\Big(h-\frac{1}{2\tau}\Big)^2\Big]$$
   让 $h$ 回归一个**有限的目标值** $\frac{1}{2\tau}$，而不是推向无穷；超过目标后梯度反向，把它拉回来。$\tau$ 扮演正则强度的角色：τ 越大，目标 margin 越小，策略越贴近参考模型；τ 越小，允许的对数似然比差距越大。
4. **其他思路**：标签平滑（cDPO：假设标签以概率 ε 翻转，损失为 $-(1-\varepsilon)\log\sigma(\beta h)-\varepsilon\log\sigma(-\beta h)$，最优的 $h$ 有限）；早停；用在线采样的数据，让同一提示词下有多次比较。

**评分要点（共 10 分）：**

- 说明确定性偏好的含义以及为什么在有限数据中常见（2 分）
- 解释 BT 最大似然要求分差趋于无穷、β 只改速度不改终点（3 分）
- 写出 IPO 的平方损失并说明有限目标 margin 的作用（3 分）
- 说明 τ 的作用，或给出 cDPO 标签平滑等其他手段（2 分）

**讲解：**

**常见失分点**：只会说「IPO 用平方损失」而讲不出为什么；以为调大 β 就能解决（β 改变不了「推向无穷」的终点）；把确定性偏好理解成「标注员很确定」；不知道 IPO 的目标 margin 与 τ 成反比。

<sub>考点：DPO失效模式、IPO　｜　出处：IPO 论文 arXiv:2310.12036（第 4、5 节）；cDPO 见 Mitchell (2023) 及 rDPO 论文 arXiv:2403.00409</sub>

</details>

---

<a name="ALN-PO-032"></a>

### ALN-PO-032　进阶 · 考频 ★★

请设计一个迭代式 DPO 流程：从一个 SFT 模型出发，每一轮如何构造偏好数据、训练和评估？需要注意哪些问题？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **起点**：SFT 模型 $\pi_0$，一批覆盖目标场景的提示词，以及打分器（奖励模型、带评分细则的强模型评审，或可验证的规则）。
2. **每一轮 $k$**：
   - **采样**：用当前策略 $\pi_k$ 对每个提示词采 $N$ 条回答（如 4～8 条，温度 0.7～1.0），保证多样性；
   - **打分与构造偏好对**：用打分器给每条回答打分，取最高分作 chosen、最低分（或一条较低分）作 rejected；过滤分差过小（噪声大）的对；控制 chosen 与 rejected 的长度差，避免长度偏置；
   - **训练**：以 $\pi_k$（或固定的 SFT 模型）作参考模型做 DPO，可加 chosen 的 NLL 项，训 1 个 epoch 左右；
   - **评估**：留出集上的生成评测（评审胜率、长度控制胜率）、安全与通用能力回归；监控 chosen 的对数概率与回答长度；
   - 通过评测后作为 $\pi_{k+1}$ 进入下一轮；可同时用新数据补标、更新奖励模型。
3. **注意事项**：
   - **奖励黑客**：打分器的偏差（偏长、偏格式）会一轮轮被放大，需要人工抽检、更新奖励模型或换评审；
   - **多样性下降**：迭代后同一提示词的采样越来越相似，偏好对失去区分度，可提高温度、扩充提示词；
   - **参考模型的选择**：每轮更新参考模型，约束更「局部」；固定为 SFT 模型，则约束累计偏移，各有取舍；
   - **数据累积**：混入前几轮的数据可以防遗忘，但旧数据又带有分布偏移；
   - **成本**：每轮采样与打分的开销，在提示词数量与每题采样数 $N$ 之间权衡。

**评分要点（共 10 分）：**

- 给出完整的每轮流程：采样、打分、构造偏好对、训练、评估（4 分）
- 说明偏好对的构造细节（取最高与最低、过滤、长度控制）（2 分）
- 说明参考模型选择、奖励黑客、多样性下降等注意事项（3 分）
- 提到评估与成本权衡（1 分）

**讲解：**

**常见失分点**：只说「多训几轮 DPO」而不说每轮要重新采样；不说明打分器从哪来；忽略打分器偏差在迭代中的放大；不提参考模型如何更新；没有评估与早停环节。

<sub>考点：在线与迭代DPO、偏好数据质量</sub>

</details>

---

<a name="ALN-PO-038"></a>

### ALN-PO-038　进阶 · 考频 ★★★

请从所需模型、数据与采样方式、计算与工程成本、训练稳定性、效果上限与适用场景几个方面对比 DPO 与 PPO（RLHF），并说明实践中二者如何组合使用。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **所需模型**：DPO 只需策略 + 冻结的参考模型（参考模型的对数概率可离线预先计算）；PPO 需要策略、critic、奖励模型、参考模型四个模型，其中两个要训练。
2. **数据与采样**：DPO 使用固定的离线偏好对，不在线生成；PPO 只需提示词，回答由策略在线生成、奖励模型在线打分。
3. **成本与工程**：DPO 接近「每条样本两条序列」的 SFT；PPO 需要推理引擎做 rollout、训练引擎做更新、权重同步，显存与工程量大一个数量级。
4. **稳定性**：DPO 是监督式损失，训练平稳、超参少（主要是 β 和学习率）；PPO 超参多、critic 难训、容易被奖励模型钻空子，调好之后才稳。
5. **效果与局限**：DPO 受离线数据的分布偏移限制，有 chosen 概率下降、长度偏置、缺乏探索等问题，在推理类任务上提升有限。Xu 等（2024）证明 PPO 的解集是 DPO 解集的真子集（DPO 可能利用分布外回答），实验中充分调优的 PPO（关键因素包括优势归一化、大 batch、参考模型的滑动平均更新）在对话到代码生成的多个任务上都优于 DPO。
6. **适用场景**：已有偏好数据、目标是风格与安全、资源有限时先用 DPO；追求上限、有可靠的奖励模型或可验证奖励、有基础设施时用在线 RL（PPO、GRPO）。
7. **组合方式**：先 SFT，再用 DPO 做基础偏好对齐，再用在线 RL 冲刺推理等能力；或者采用在线 / 迭代 DPO 这一折中：用当前策略采样、打分器标注偏好对，多轮迭代（Llama 3 的后训练进行了多轮「拒绝采样 + SFT + DPO」）。

**评分要点（共 10 分）：**

- 正确对比所需模型与离线 / 在线的差别（2 分）
- 对比成本、工程复杂度与稳定性（3 分）
- 说明效果上限与 DPO 的局限，并给出适用场景（3 分）
- 说明组合使用或在线 / 迭代 DPO 的折中（2 分）

**讲解：**

**常见失分点**：说「DPO 已经全面取代 PPO」或「DPO 没用」；说 DPO 没有 KL 约束；不知道 DPO 的离线分布偏移问题；忽略工程成本差异的量级；不知道在线 / 迭代 DPO 这一折中方案。

<sub>考点：DPO与PPO对比　｜　出处：Is DPO Superior to PPO for LLM Alignment? arXiv:2404.10719；Llama 3 论文 arXiv:2407.21783</sub>

</details>

---

<a name="ALN-PO-041"></a>

### ALN-PO-041　进阶 · 考频 ★★

模型已经在高质量的示范数据上做过 SFT，为什么通常还要再做一轮 DPO 等偏好优化？反过来，DPO 为什么一般要从 SFT 模型出发，并以它作为参考模型？请结合 DPO 的损失说明，并指出这一流程中需要监控的问题。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **SFT 之后为什么还要偏好优化**
   - SFT 是对示范的最大似然（行为克隆），只有「应该这样答」的正例，没有「这样答不好」的信号。模型自己常犯的错误（啰嗦、幻觉、不当顺从、格式问题）如果没有出现在示范里，SFT 无法有针对性地压低它们。
   - 示范质量受限于写示范的人；判断两个回答哪个更好，比亲手写出最好的回答容易得多，偏好标注的成本更低、一致性更高，能提供超出示范水平的信号。
   - 偏好对可以来自模型自己的采样，直接针对模型当前分布中的问题；SFT 数据往往是「别人写的」回答。
   - DPO 的损失为 $-\log\sigma\Big(\beta\big[\log\frac{\pi_\theta(y_w)}{\pi_{\text{ref}}(y_w)}-\log\frac{\pi_\theta(y_l)}{\pi_{\text{ref}}(y_l)}\big]\Big)$：它同时推高 chosen、压低 rejected 的相对概率，梯度按隐式奖励「排错的程度」加权，排得越错的样本权重越大。
2. **为什么从 SFT 出发、以 SFT 为参考**
   - DPO 由 KL 约束的 RLHF 目标推出，最优策略为 $\pi^*\propto\pi_{\text{ref}}\exp(r/\beta)$。参考模型决定了「从哪里出发、允许偏离多远」，DPO 只调整回答之间的相对概率，不负责教会对话格式和基本的指令遵循。
   - 偏好数据通常由 SFT 模型采样得到，参考模型取 SFT 模型时，数据落在参考分布之内，对数概率比才有意义。DPO 论文在没有现成 SFT 模型时，先在 chosen 回答上做最大似然训练，再以它为参考模型，以减小分布偏移。
   - 若直接从基座模型出发，模型连基本格式都不稳定，偏好数据对它来说是分布外的，训练噪声大、效果差。也有把两步合一的方法（如 ORPO 在 SFT 损失上加赔率比项、不需要参考模型），但标准 DPO 依赖一个好的 SFT 起点。
3. **需要监控的问题**
   - chosen 的对数概率也可能下降（似然位移）：只看 margin 与排序准确率会误判，可以给 chosen 加 NLL 项；
   - 过拟合偏好数据、回答变长（偏好数据常带长度偏置）；
   - 通用能力与安全行为的回归；
   - $\beta$ 与学习率：$\beta$ 太小时偏离参考模型太远，太大时几乎学不动。

**评分要点（共 10 分）：**

- 说明 SFT 只有正例、缺少负向信号，以及「比较比示范更容易」的道理（3 分）
- 结合 DPO 损失说明它如何同时推高 chosen、压低 rejected（2 分）
- 说明 DPO 依赖 SFT 起点与参考模型的原因：KL 约束、数据分布、DPO 论文先在 chosen 上训练（3 分）
- 指出需要监控的问题：chosen 似然下降、长度、遗忘（2 分）

**讲解：**

**常见失分点**：只说「DPO 让模型更符合人类偏好」，讲不出 SFT 缺的是负向信号；以为 DPO 可以替代 SFT、直接在基座上做；不知道参考模型在推导中的作用；只看 margin 上涨就认为训练成功，忽略 chosen 概率同时下降的现象。

<sub>考点：DPO失效模式、DPO损失　｜　出处：DPO 论文 arXiv:2305.18290</sub>

</details>

---

## 场景分析题

<a name="ALN-PO-020"></a>

### ALN-PO-020　挑战 · 考频 ★★

团队用 6 万对偏好数据对一个 7B SFT 模型做 DPO（β = 0.1，学习率 5e-6，训了 3 个 epoch）。偏好数据是这样构造的：chosen 一律取某个强模型的回答，rejected 一律取团队自家早期模型的回答。训练日志显示：排序准确率很快升到 98%，margin 持续增大；但 chosen 与 rejected 的对数概率都在持续下降，chosen 平均每条下降了 40 nats 以上。上线评测发现：回答变得冗长、格式化严重，部分回答出现重复和莫名其妙的内容，常规基准也有回退。请分析原因并给出改进方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 原因分析**
- **偏好对太容易、分布偏移大**：chosen 与 rejected 来自两个模型，风格、长度、格式差异明显，模型只要学会「区分两个来源」就能把准确率做到 98%，学到的是表面特征（更长、更格式化），而不是真正的质量差异。而且 chosen 并不是当前策略自己会生成的回答，DPO 只约束这些数据点，对策略真实的生成分布约束很弱。
- **似然位移**：DPO 只要求拉开相对差距，chosen 与 rejected 的对数概率一起下降（chosen 降 40 nats 以上），概率质量流向数据之外的回答，表现为重复、怪异的内容。
- **过度优化**：3 个 epoch，模型把 margin 推得很大，离参考模型太远，通用能力回退（对齐税）。
- **长度偏置**：强模型的回答普遍更长、格式更花哨，被当成偏好学了进去。

**2. 改进方案**
1. **换成 on-policy 的偏好数据**：用当前 SFT 模型对每个提示词采样多条回答，再用奖励模型或强模型评审打分，选出 chosen 与 rejected；数据贴近策略分布，差异集中在质量上。
2. **构造有区分度的偏好对**：控制 chosen 与 rejected 的长度差和格式差；过滤分差过大（一眼可分）或几乎相同（容易引发似然位移）的样本；评审细则明确「不因篇幅加分」。
3. **约束 chosen 的概率**：加 chosen 的 NLL 项（如系数 0.2），或用 DPOP 一类变体；监控 chosen 的对数概率，持续下降就早停。
4. **调超参**：减到 1 个 epoch、降低学习率、尝试更大的 β；按留出集的生成评测挑选检查点，而不是按准确率。
5. **在线 / 迭代 DPO**：每轮用新策略采样、重新标注，迭代多轮，逐步纠正分布偏移。
6. **长度控制**：考虑 SimPO 一类的长度归一化，评测时使用长度控制的胜率。

**3. 验证**：留出集上的生成评测（长度控制胜率、人工抽检）、常规基准回归测试，监控回答长度与重复率。

**评分要点（共 10 分）：**

- 指出 chosen / rejected 来源不同导致偏好对过于容易、学到表面特征并存在分布偏移（3 分）
- 识别 chosen 概率持续下降（似然位移）及其后果（2 分）
- 指出过度训练、长度偏置等因素（1 分）
- 给出 on-policy 偏好数据、加 NLL 项、早停与调参、在线迭代等改进（3 分）
- 给出验证方法，强调不能只看准确率与 margin（1 分）

**讲解：**

**常见失分点**：把 98% 的准确率当成训练成功；只调 β 或学习率而不改数据；没注意到 chosen 对数概率持续下降这个关键信号；不知道 on-policy 偏好数据与离线「强模型 vs 弱模型」数据的区别。

<sub>考点：DPO失效模式、偏好数据质量</sub>

</details>

---

<a name="ALN-PO-036"></a>

### ALN-PO-036　进阶 · 考频 ★★

某客服大模型上线半年，积累了 200 万条带反馈的对话：约 3% 被点赞，约 1% 被点踩，其余没有反馈；另有约 8% 的回答被用户点了「重新生成」，其中一半的新回答被用户采纳（继续对话或复制）。团队想用这些数据做一轮偏好对齐。请分析这些信号的可用性与偏差，并给出数据构造与训练方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 信号分析**
- **点赞 / 点踩**：显式、单条、非成对；量少（约 4%）且有选择偏差：愿意点的用户少，点踩集中在极端失败，点赞可能偏爱热情、附和用户的回答（谄媚风险）。
- **重新生成后采纳**：同一上下文下有「被放弃的回答」和「被采纳的回答」，天然构成成对偏好，质量相对较高；但「采纳」不等于「最好」，可能只是勉强接受。
- **无反馈**：不能当正样本，最多作为弱信号或用于统计提示词分布。
- **其他风险**：少数用户贡献大量反馈、恶意或误操作；业务规则带来的点踩（如按规定拒答被点踩）；数据含隐私信息。

**2. 数据构造**
1. **成对数据**：从「重新生成 → 采纳」中构造 chosen（采纳）/ rejected（被放弃），约 8 万对；去重，过滤几乎相同的对，平衡长度差。
2. **单条数据**：点赞作「好」、点踩作「坏」，约 8 万条；限制单用户贡献、按话题去偏；对点踩样本人工抽检归因（模型错误，还是按规定拒答）。
3. **清洗**：脱敏去隐私，剔除违规和恶意反馈，留出一部分做评测集。

**3. 训练方案**
- KTO 可以直接使用单条的好 / 坏标签，成对数据也可以拆成两条单条样本一起使用；或者成对部分用 DPO、单条部分用 KTO。
- 好坏样本约 3:1 不平衡：KTO 可以调节两类的损失权重。
- 从最新的 SFT 模型出发，β 取保守值，训 1 个 epoch 左右，监控 chosen（好样本）的对数概率。
- 安全护栏：被点踩的「正确拒答」不能当负例，否则会削弱安全性。

**4. 评估与上线**：离线评测（留出集胜率、长度控制胜率、问题解决率等业务指标）、安全与过度拒答评测、谄媚测试；灰度 A/B，监控重新生成率、点踩率、转人工率；定期回流新反馈，形成闭环。

**评分要点（共 10 分）：**

- 正确分析点赞 / 点踩、重新生成等信号的特点与偏差（含选择偏差、谄媚风险）（3 分）
- 给出成对与单条数据的构造与清洗方案（3 分）
- 选择 KTO / DPO 等合适的方法，并处理样本不平衡与安全问题（2 分）
- 给出评估、灰度与闭环监控（2 分）

**讲解：**

**常见失分点**：把无反馈当作正样本；忽略点赞信号里的谄媚风险（2025 年 4 月 OpenAI 回滚了一次 GPT-4o 更新，官方复盘称新加入的基于用户点赞、点踩的奖励信号是模型变得过度讨好的原因之一）；只想到 DPO，不知道单条标签可以用 KTO；没有评估与灰度环节。

<sub>考点：KTO、偏好数据质量　｜　出处：KTO 论文 arXiv:2402.01306</sub>

</details>

---

## 系统设计题

<a name="ALN-PO-040"></a>

### ALN-PO-040　挑战 · 考频 ★★

你负责一个 14B 中文通用助手的后训练对齐。现有资源：一个训好的 SFT 模型；约 10 万对人工偏好数据（来自早期模型的采样）；一个 70B 的开源模型可用作评审；32 张 80 GB GPU；4 周时间。目标：提升有用性与安全性，减少啰嗦和谄媚，不能明显损失通用能力和数学代码能力。请设计对齐方案：方法选型、数据构造、训练流程、评估体系与风险控制。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 选型思路**：资源与时间有限、已有偏好数据、目标偏风格与安全 → 以 DPO 为主，采用「离线 DPO 起步 + 2～3 轮在线迭代 DPO」；数学代码部分若有可验证的题目，可另做小规模 RLVR，或用拒绝采样得到的高质量数据做 SFT 来保持能力。

**2. 数据构造**
- 离线数据：10 万对人工偏好按任务类别、长度差、标注一致性清洗；平衡 chosen / rejected 的长度；补充安全数据（有害请求下的正确拒答 vs 有害回答；正常请求下的有用回答 vs 过度拒答）。
- 在线数据：每轮用当前模型对 2 万～5 万条提示词各采 4～8 条回答，由 70B 评审按评分细则（有用、准确、简洁、安全、不谄媚）打分，取最高 / 最低构造偏好对；随机交换顺序、多次评审取一致，减少评审的位置与长度偏差；人工抽检评审结果。
- 防谄媚：构造「用户给出错误前提」的提示词，坚持事实的回答作 chosen，附和用户的回答作 rejected。

**3. 训练流程**
- 第 1 周：离线 DPO（β 约 0.1、1 个 epoch、加 chosen 的 NLL 项），参考模型为 SFT 模型，参考模型的对数概率离线预先计算；14B 全参训练用 ZeRO-3，只需策略与参考模型。
- 第 2～3 周：2～3 轮在线迭代 DPO，每轮用上一轮模型采样（用 vLLM 等推理引擎加速），参考模型取上一轮模型或固定为 SFT 模型（可做对比）。
- 第 4 周：能力回归与安全评测；若数学代码回退，混入拒绝采样得到的高质量推理数据做一轮 SFT，或在 DPO 中混入这些数据的 NLL 项。

**4. 评估体系**
- 有用性：留出集上的评审胜率（同时报长度控制胜率）、人工评测；
- 安全：有害回答率与过度拒答率一起报；
- 风格：平均长度、重复率、谄媚测试集；
- 能力回归：通用知识、数学、代码基准（多次采样报平均）；
- 训练监控：chosen / rejected 的对数概率与隐式奖励、margin、准确率。

**5. 风险控制**
- 评审偏差被迭代放大（偏长、偏格式、偏自家风格）→ 评分细则约束长度、换用不同评审交叉验证、人工抽检；
- chosen 概率下降、分布外回答被抬高 → NLL 项、早停、在线数据；
- 对齐税 → 回归评测设门禁，必要时混入能力数据；
- 每轮保留检查点，按综合评测而不是训练指标挑选；灰度上线并监控线上反馈。

**评分要点（共 10 分）：**

- 给出合理的方法选型（以 DPO 为主 + 在线迭代，必要时补充 RLVR 或 SFT）并说明理由（2 分）
- 数据构造完整：离线清洗、在线采样与评审打分、安全与防谄媚数据（3 分）
- 训练流程与资源安排合理（2 分）
- 评估体系覆盖有用、安全、风格与能力回归（2 分）
- 识别评审偏差放大、chosen 概率下降、对齐税等风险并给出对策（1 分）

**讲解：**

**常见失分点**：不考虑 4 周与 32 卡的约束就直接上 PPO；只用离线数据训一次 DPO；评审打分不做去偏；评估只报胜率，不报长度与安全；忽略数学代码能力的回退。

<sub>考点：DPO与PPO对比、在线与迭代DPO</sub>

</details>

---
