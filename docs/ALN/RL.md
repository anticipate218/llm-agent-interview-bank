# ALN-RL · 强化学习基础

> 所属大类：对齐与强化学习　｜　题量：43

LLM 对齐所需的强化学习核心概念与算法。

**考点覆盖**：MDP基本概念（4） · 回报与折扣（4） · 价值函数（4） · 贝尔曼方程（4） · 策略梯度定理（5） · REINFORCE与基线（7） · 优势函数（5） · Actor-Critic（2） · GAE（3） · 重要性采样（7） · On-policy与Off-policy（5） · 探索与利用（3） · PPO裁剪（6） · 熵正则（3）

**题型**：[单选题（14）](#单选题) · [多选题（5）](#多选题) · [判断题（5）](#判断题) · [填空题（4）](#填空题) · [计算题（5）](#计算题) · [代码输出题（1）](#代码输出题) · [代码填空题（1）](#代码填空题) · [代码改错题（1）](#代码改错题) · [编程题（1）](#编程题) · [简答题（4）](#简答题) · [场景分析题（2）](#场景分析题)

---

## 单选题

<a name="ALN-RL-001"></a>

### ALN-RL-001　基础 · 考频 ★★★

把大模型「根据提示词逐 token 生成回答」建模为马尔可夫决策过程（MDP），下列对应关系中**最准确**的是：

- **A.** 状态是最后生成的那个 token，动作是整个词表上的概率分布，状态转移由奖励模型决定
- **B.** 状态是已生成的 token（不含提示词），动作是下一个 token，每生成一个 token 奖励模型都给出一个即时奖励
- **C.** 状态是提示词加上已生成的全部 token，动作是下一个 token，状态转移是把该 token 拼到末尾的确定性操作
- **D.** 状态是提示词加上已生成的全部 token，动作是下一个 token，状态转移是随机的，因为下一个 token 由采样决定

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：LLM 生成中，状态 = 提示词 + 已生成前缀，动作 = 下一个 token（动作空间是整个词表），转移是确定性的拼接。

策略就是语言模型本身 $\pi_\theta(y_t\mid x,y_{<t})$，一条完整回答就是一条轨迹。整条回答的对数概率等于逐 token 对数概率之和：$\log\pi_\theta(y\mid x)=\sum_t\log\pi_\theta(y_t\mid x,y_{<t})$，这就是「token 即动作」。

- A 错：只用最后一个 token 作状态会丢掉上下文；动作是「被选中的那个 token」，概率分布是策略；转移也与奖励模型无关。
- B 错：状态必须包含提示词；RLHF 中奖励模型通常只在回答结束时给一个总分，中间 token 没有来自奖励模型的即时奖励（PPO 里逐 token 的只有 KL 惩罚项）。
- D 错：随机性来自**策略**选动作（采样），而不是环境转移：token 一旦选定，下一状态就唯一确定。把采样的随机性算进转移，是混淆了「策略」与「环境」。

<sub>考点：MDP基本概念</sub>

</details>

---

<a name="ALN-RL-005"></a>

### ALN-RL-005　进阶 · 考频 ★★

RLHF 的 PPO 阶段通常取折扣因子 $\gamma=1$。下列解释中最合理的是：

- **A.** 回答是有限长的回合，回报不会发散；而奖励多在结尾给出，$\gamma<1$ 会让靠前 token 的信号衰减，并引入长度偏好
- **B.** $\gamma=1$ 时 critic 回归目标的方差最小、价值头最容易训练，这正是 RLHF 取 $\gamma=1$ 的主要原因
- **C.** 只有 $\gamma=1$ 时 GAE 的递推公式才成立，$\gamma<1$ 时必须改用蒙特卡洛回报来估计优势
- **D.** PPO 的裁剪目标要求回报不打折扣，否则重要性比率会超出 $[1-\varepsilon,1+\varepsilon]$

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：单轮生成是有限回合，不需要 $\gamma$ 来保证收敛；而结尾奖励一旦被折扣，信号就会被扭曲。

设回答共 $T$ 个 token，只在第 $T$ 个 token 拿到奖励 $R$。$\gamma<1$ 时第 $t$ 个 token 看到的回报是 $\gamma^{T-t}R$：开头的 token 信号最弱；而且整条回答的回报随长度衰减，$R>0$ 时策略会偏向更短的回答，$R<0$ 时反而倾向拖长回答、推迟惩罚。这些偏好都与回答质量无关。

- B 错：$\gamma=1$ 时回报包含全部未来奖励，方差通常更大而不是更小；$\gamma<1$ 才有降方差的作用。
- C 错：GAE 的递推 $\hat A_t=\delta_t+\gamma\lambda\hat A_{t+1}$ 对任意 $\gamma\in[0,1]$ 都成立。
- D 错：比率 $\pi_\theta/\pi_{\text{old}}$ 只由新旧策略决定，与折扣无关。

<sub>考点：回报与折扣</sub>

</details>

---

<a name="ALN-RL-007"></a>

### ALN-RL-007　基础 · 考频 ★★★

关于策略 $\pi$ 下的状态价值 $V^\pi(s)$、动作价值 $Q^\pi(s,a)$ 与优势 $A^\pi(s,a)$，下列关系正确的是：

- **A.** $V^\pi(s)=\max_aQ^\pi(s,a)$，因此 $A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s)\le0$ 对所有动作成立
- **B.** $V^\pi(s)=\sum_a\pi(a\mid s)Q^\pi(s,a)$，优势 $A^\pi=Q^\pi-V^\pi$，且它在策略下的期望为 0
- **C.** $Q^\pi(s,a)=V^\pi(s)+r(s,a)$，因此优势 $A^\pi=Q^\pi-V^\pi$ 就等于即时奖励 $r(s,a)$
- **D.** $A^\pi(s,a)=Q^\pi(s,a)/V^\pi(s)$，比值大于 1 表示该动作好于按策略平均行动的水平

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：$V$ 是 $Q$ 在策略下的加权平均，优势是「这个动作比按策略平均行动好多少」，它在策略下的期望恒为 0。

- $V^\pi(s)=\mathbb{E}_{a\sim\pi}[Q^\pi(s,a)]$：在 $s$ 按策略选动作、之后一直按策略走的期望回报；
- $A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s)$：$A>0$ 表示比平均水平更好；
- $\mathbb{E}_{a\sim\pi}[A^\pi(s,a)]=\sum_a\pi(a\mid s)A^\pi(s,a)=V^\pi(s)-V^\pi(s)=0$。

- A 错：$V=\max_aQ$ 只对最优策略（或对 $Q$ 贪心的策略）成立；对一般的随机策略，$V$ 是平均值，必然有些动作优势为正、有些为负。
- C 错：$Q^\pi(s,a)=r(s,a)+\gamma\,\mathbb{E}_{s'}[V^\pi(s')]$，与 $V^\pi(s)$ 之间没有这种加法关系，优势也不等于即时奖励。
- D 错：优势是差而不是比；价值可以为 0 或为负，比值没有意义。

<sub>考点：价值函数、优势函数</sub>

</details>

---

<a name="ALN-RL-010"></a>

### ALN-RL-010　进阶 · 考频 ★★

对**给定策略** $\pi$ 做策略评估（求 $V^\pi$）时，使用的贝尔曼期望方程是：

- **A.** $V^\pi(s)=\max_a\sum_{s'}P(s'\mid s,a)\big[R(s,a,s')+\gamma V^\pi(s')\big]$
- **B.** $V^\pi(s)=\sum_a\pi(a\mid s)\sum_{s'}P(s'\mid s,a)\big[R(s,a,s')+\gamma V^\pi(s)\big]$
- **C.** $Q^\pi(s,a)=R(s,a)+\gamma\sum_{s'}P(s'\mid s,a)\max_{a'}Q^\pi(s',a')$
- **D.** $V^\pi(s)=\sum_a\pi(a\mid s)\sum_{s'}P(s'\mid s,a)\big[R(s,a,s')+\gamma V^\pi(s')\big]$

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：期望方程对动作按策略 $\pi$ 取期望，对下一状态按转移概率取期望。

它表达的是「一步展开」：当前价值 = 这一步的期望奖励 + 折扣后的下一状态价值的期望。对有限 MDP，它是关于 $V^\pi$ 的线性方程组。

- A 错：对动作取 $\max$ 的是贝尔曼**最优**方程（应写成 $V^*$），用于求最优价值，而不是评估一个给定的策略。
- B 错：括号里用的是当前状态的 $V^\pi(s)$ 本身，而不是下一状态的 $V^\pi(s')$，不再是「一步展开」。
- C 错：$\max_{a'}$ 是 Q-learning 的目标，对应最优动作价值 $Q^*$；评估给定策略时应按 $\pi(a'\mid s')$ 对下一动作取期望（SARSA 的更新目标就是它的采样版本）。

<sub>考点：贝尔曼方程</sub>

</details>

---

<a name="ALN-RL-013"></a>

### ALN-RL-013　进阶 · 考频 ★★★

推导策略梯度时用到对数导数技巧 $\nabla_\theta p_\theta(\tau)=p_\theta(\tau)\nabla_\theta\log p_\theta(\tau)$，其中轨迹概率 $p_\theta(\tau)=\rho(s_0)\prod_t\pi_\theta(a_t\mid s_t)P(s_{t+1}\mid s_t,a_t)$，最终得到 $\nabla_\theta J=\mathbb{E}_\tau\big[R(\tau)\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\big]$。下列关于该结果的说法正确的是：

- **A.** 初始分布与转移概率都不依赖 $\theta$，取对数后成为加法项，求导即为 0，所以估计梯度不需要知道环境模型
- **B.** 需要对转移概率 $P(s_{t+1}\mid s_t,a_t)$ 关于动作求导，因此只能用于可微分的模拟器
- **C.** 只对确定性策略成立，随机策略必须改用重参数化技巧才能求梯度
- **D.** 只在 $\gamma=1$ 时成立，有折扣时梯度中会多出一项对 $\gamma$ 的导数

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：对数把连乘变成连加，与 $\theta$ 无关的环境项求导后直接消失，梯度里只剩策略的 score function $\nabla_\theta\log\pi_\theta(a_t\mid s_t)$。

$$\nabla_\theta\log p_\theta(\tau)=\underbrace{\nabla_\theta\log\rho(s_0)}_{=0}+\sum_t\Big[\nabla_\theta\log\pi_\theta(a_t\mid s_t)+\underbrace{\nabla_\theta\log P(s_{t+1}\mid s_t,a_t)}_{=0}\Big]$$

所以只要能采样轨迹、能对 $\log\pi_\theta$ 求导，就能无偏地估计梯度；奖励只作为标量权重出现，也不需要可导。LLM 中 $\log\pi_\theta(a_t\mid s_t)$ 就是每个生成 token 的对数概率，这正是 RLHF、DPO 等代码都要先算序列 log-prob 的原因。

- B 错：恰恰相反，推导中转移概率已经消掉，不需要环境可微。需要对动作求导的是 DDPG 一类确定性策略梯度方法（要求 $Q$ 对动作可导）。
- C 错：对数导数技巧正是为**随机**策略准备的，它要求 $\pi_\theta(a\mid s)>0$ 且可对 $\theta$ 求导；确定性策略没有可用的 $\log\pi$。
- D 错：$\gamma$ 是常数而不是参数，折扣只改变回报 $R(\tau)$ 的定义，不影响推导。

<sub>考点：策略梯度定理</sub>

</details>

---

<a name="ALN-RL-017"></a>

### ALN-RL-017　进阶 · 考频 ★★★

在策略梯度中把回报 $G_t$ 换成 $G_t-b(s_t)$（$b$ 只依赖状态，不依赖动作），梯度的期望保持不变。其根本原因是：

- **A.** 基线通常远小于回报，减去它只会带来很小的偏差，与策略梯度本身的采样噪声相比可以忽略，期望近似不变
- **B.** 减去基线后各样本的权重有正有负，正负样本的梯度在每个 batch 内恰好相互抵消，所以梯度的期望保持不变
- **C.** $b(s)$ 可提到对动作的期望之外，剩下的 score function 期望等于概率和 1 的梯度，即 0
- **D.** Adam 等优化器会对梯度做逐元素的归一化，给每个样本的梯度整体平移一个常数，不会改变参数更新的方向

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：score function 的期望为零，任何不依赖动作的基线乘上它，期望都是 0。

$\mathbb{E}_{a\sim\pi}[\nabla\log\pi(a\mid s)]=\sum_a\pi(a\mid s)\dfrac{\nabla\pi(a\mid s)}{\pi(a\mid s)}=\nabla\sum_a\pi(a\mid s)=\nabla1=0$，所以 $\mathbb{E}_{a\sim\pi}[b(s)\nabla_\theta\log\pi_\theta(a\mid s)]=b(s)\cdot0=0$。$b(s)$ 与 $a$ 无关，可以提到期望外面，额外项为 0。于是期望不变，而单个样本的权重变小、正负分明，方差大幅下降。

- A 错：基线不必很小（常取 $V(s)$，与回报同量级）；不引入偏差是**精确**成立的，不是「近似可忽略」。
- B 错：抵消只在期望意义下成立，单个 batch 内并不会恰好抵消；正因为不会恰好抵消，基线才能改变方差。
- D 错：优化器的归一化与基线无关；而且基线不是给梯度整体加常数，而是给每个样本的权重减去一个值。

延伸：若基线依赖当前动作（例如直接用这个样本自己的回报），上面的推导不成立，会引入偏差。

<sub>考点：REINFORCE与基线</sub>

</details>

---

<a name="ALN-RL-021"></a>

### ALN-RL-021　基础 · 考频 ★★★

在 Actor-Critic 方法中，关于 actor 与 critic 的分工，下列说法正确的是：

- **A.** critic 直接输出下一步要执行的动作，actor 负责评估这个动作的好坏
- **B.** actor 是策略，用 critic 估计的价值构造优势做策略梯度更新；critic 估计 $V(s)$，通过回归 TD 目标或回报来训练
- **C.** critic 就是奖励函数本身，它的输出直接替代环境奖励，因此 Actor-Critic 不需要环境奖励
- **D.** actor 通过对 critic 的输出 $V(s)$ 反向传播来更新，因此离散动作空间无法使用 Actor-Critic

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：actor 管「怎么做」，critic 管「做得怎么样」。critic 学的是价值（对未来回报的预测），为 actor 提供基线和 TD 目标，告诉它「比平均好多少」。

典型的单步更新：$\delta_t=r_t+\gamma V(s_{t+1})-V(s_t)$；actor 沿 $\delta_t\nabla\log\pi(a_t\mid s_t)$ 更新，critic 最小化 $\delta_t^2$（目标 $r_t+\gamma V(s_{t+1})$ 不回传梯度）。PPO 就是带裁剪的 Actor-Critic；LLM 中 critic 通常是与策略同结构的模型加一个标量价值头。

- A 错：角色颠倒了。
- C 错：critic 的训练目标来自环境奖励（或奖励模型的分数），没有奖励就无从学习价值。
- D 错：标准 Actor-Critic（A2C、PPO）用 critic 构造优势，再走 score function 形式的策略梯度，不需要对 critic 关于动作求导，离散动作完全适用；需要对 $Q$ 关于动作求导的是 DDPG 这类连续控制方法。

<sub>考点：Actor-Critic</sub>

</details>

---

<a name="ALN-RL-024"></a>

### ALN-RL-024　基础 · 考频 ★★★

GAE 中 $\hat A_t=\sum_{l\ge0}(\gamma\lambda)^l\delta_{t+l}$，$\delta_t=r_t+\gamma V(s_{t+1})-V(s_t)$。关于 $\lambda$ 的作用，下列说法正确的是：

- **A.** $\lambda$ 与 $\gamma$ 在公式里以乘积出现，作用相同，都是对未来奖励打折扣，实践中可以合并成一个超参数
- **B.** $\lambda=1$ 时 $\hat A_t=\delta_t$，只用一步 TD 误差，方差最小，但优势估计高度依赖 critic 的准确度
- **C.** $\lambda$ 越大，累加的 TD 误差项越多，优势估计越依赖 critic 的准确度，偏差越大、方差越小
- **D.** $\lambda=0$ 时为单步 TD 误差，方差小但依赖 critic、易有偏；$\lambda=1$ 时为蒙特卡洛回报减基线，方差大

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：$\lambda$ 在「相信 critic」（TD）与「相信实际回报」（蒙特卡洛）之间插值。

- $\lambda=0$：$\hat A_t=\delta_t$，只采样一步，其余靠 critic，方差最小；但只有 $V$ 准确时它才是优势的无偏估计。
- $\lambda=1$：$\sum_l\gamma^l\delta_{t+l}$ 中间的 $V$ 逐项抵消，得到 $G_t-V(s_t)$。此时 $V(s_t)$ 只起基线作用，对 critic 误差不敏感，但累加了整条轨迹的随机性，方差大。
- 实践中常取 $\lambda=0.95$ 左右（RLHF 中常见 $\gamma=1$、$\lambda=0.95$）。

- A 错：二者在公式里以乘积出现，但含义不同。$\gamma$ 决定回报如何折现，无论 critic 准不准都会改变所估计的量；$\lambda$ 只在 critic 不准时才引入偏差。GAE 论文分别讨论了两者。
- B 错：把两个极端说反了。
- C 错：方向反了，$\lambda$ 越小才越依赖 critic；累加的项越多，中间的 $V$ 抵消得越多，越接近蒙特卡洛回报。

<sub>考点：GAE　｜　出处：GAE 论文 arXiv:1506.02438</sub>

</details>

---

<a name="ALN-RL-026"></a>

### ALN-RL-026　挑战 · 考频 ★★

TRPO / PPO 优化的代理目标是
$$L(\theta)=\mathbb{E}_{s\sim d^{\pi_{\text{old}}},\,a\sim\pi_{\text{old}}}\Big[\frac{\pi_\theta(a\mid s)}{\pi_{\text{old}}(a\mid s)}A^{\pi_{\text{old}}}(s,a)\Big]$$
它与「新策略相对旧策略的真实性能提升」之间，主要的近似在于：

- **A.** 它把整条轨迹各步的比率连乘起来，轨迹较长时会严重高估性能提升
- **B.** 状态仍按旧策略的分布 $d^{\pi_{\text{old}}}$ 采样，只对动作做了重要性修正；新旧策略足够接近时这一近似才可靠
- **C.** 它用新策略的优势函数 $A^{\pi_\theta}$ 代替了旧策略的优势函数，而前者无法从旧数据中估计
- **D.** 对动作的重要性修正本身有偏，因为比率的分母应当是 $\pi_\theta$ 而不是 $\pi_{\text{old}}$

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：精确的性能差公式（Kakade & Langford, 2002）是
$$J(\pi_\theta)-J(\pi_{\text{old}})=\frac{1}{1-\gamma}\,\mathbb{E}_{s\sim d^{\pi_\theta},\,a\sim\pi_\theta}\big[A^{\pi_{\text{old}}}(s,a)\big]$$
其中状态来自**新策略**的分布 $d^{\pi_\theta}$。更新之前拿不到新策略的状态样本，代理目标就用旧策略的 $d^{\pi_{\text{old}}}$ 代替，只对动作做逐步的重要性修正。TRPO 证明二者之差可以用新旧策略的 KL 界定，所以要么约束 KL（TRPO），要么裁剪比率（PPO），不让新策略离旧策略太远。

- A 错：代理目标用的是**单步**比率，正是为了避免轨迹级比率连乘带来的方差爆炸。
- C 错：用的是旧策略的优势 $A^{\pi_{\text{old}}}$，它能用旧策略的数据估计（如 GAE）。
- D 错：重要性采样 $\mathbb{E}_p[f]=\mathbb{E}_q[\frac{p}{q}f]$ 中分母是采样分布 $q=\pi_{\text{old}}$，分子是目标分布 $p=\pi_\theta$，写法正确，对动作这一步的修正是无偏的。

LLM 中同样如此：一个 token 的比率只修正「这个位置选了哪个 token」，前缀（状态）本身仍是旧策略生成的。

<sub>考点：重要性采样、PPO裁剪　｜　出处：TRPO 论文 arXiv:1502.05477；PPO 论文 arXiv:1707.06347</sub>

</details>

---

<a name="ALN-RL-029"></a>

### ALN-RL-029　基础 · 考频 ★★

下列算法中，能够直接复用「由很早以前的旧策略收集、存放在经验回放池中」的数据进行学习，而不需要额外修正的是：

- **A.** REINFORCE（蒙特卡洛策略梯度）
- **B.** PPO（带裁剪的策略梯度）
- **C.** SARSA（时序差分控制）
- **D.** DQN（Q-learning）

<details>
<summary>答案与解析</summary>

**答案：D**

**解析：**

**结论**：Q-learning 学习的是最优动作价值 $Q^*$，更新目标 $r+\gamma\max_{a'}Q(s',a')$ 与「数据由哪个策略产生」无关，属于 off-policy 方法，可以用经验回放反复利用旧数据，DQN 正是这样做的。

- A 错：REINFORCE 的梯度是 $\mathbb{E}_{\tau\sim\pi_\theta}[\cdot]$，样本必须来自当前策略，用旧数据必须做重要性采样修正。
- B 错：PPO 是 on-policy 方法，只在同一批新采样的数据上更新几轮，靠比率和裁剪处理轻微的策略偏移；很旧的数据比率偏离太大，会被大量裁剪，甚至让更新失效。
- C 错：SARSA 的目标 $r+\gamma Q(s',a')$ 中，$a'$ 由当前策略选出，学的是当前策略的价值，是 on-policy 的 TD 方法。

延伸：off-policy 也不是「数据随便用」。单步 Q-learning 不需要重要性权重，但旧数据覆盖的状态动作分布会影响学习效果；多步回报的 off-policy 版本仍需要重要性修正或截断（如 Retrace）。

<sub>考点：On-policy与Off-policy</sub>

</details>

---

<a name="ALN-RL-031"></a>

### ALN-RL-031　基础 · 考频 ★★

用策略梯度训练 LLM 时，若 rollout 一律改用贪心解码（温度为 0），最主要的问题是：

- **A.** 同一提示词总得到同一条回答，无法探索；样本也不服从 $\pi_\theta$，梯度估计有偏
- **B.** 贪心解码每步都要对整个词表排序取最大值，生成速度比随机采样慢得多，训练吞吐会明显下降
- **C.** 奖励模型只给随机采样的回答打分：贪心解码的回答没有对应的采样概率，算不出奖励
- **D.** 贪心解码容易陷入重复，回答质量普遍比随机采样差，训练时奖励会持续下降、难以收敛

<details>
<summary>答案与解析</summary>

**答案：A**

**解析：**

**结论**：策略梯度既靠随机采样来探索，又要求样本来自当前策略本身。

- 探索：贪心解码只沿概率最大的路径走，永远采不到「当前概率不高、但其实更好」的回答，也就得不到推高它们的梯度。
- 无偏性：$\nabla J=\mathbb{E}_{y\sim\pi_\theta}[R\nabla\log\pi_\theta(y)]$ 要求 $y$ 按 $\pi_\theta$ 采样；贪心解码相当于从另一个（确定性的）分布采样，估计量不再是真实梯度。
- 即使用 0.7 之类的温度采样，训练端计算 log-prob 时也要除以同一个温度，否则采样分布与被优化的分布不一致。

- B 错：取最大值只需扫描一遍词表，不必排序，与按概率采样的开销相当，速度基本相同。
- C 错：奖励只取决于回答文本，与它是怎么采样出来的无关，奖励模型对贪心解码的回答同样能打分。
- D 错：对大模型而言，贪心解码的单条回答质量往往不差；问题在于没有多样性、无法探索，且梯度估计有偏。

<sub>考点：探索与利用</sub>

</details>

---

<a name="ALN-RL-040"></a>

### ALN-RL-040　挑战 · 考频 ★

考虑单步决策（只有一个状态，动作 $a$ 的奖励为 $r(a)$），带熵正则的目标为 $\max_\pi\ \mathbb{E}_{a\sim\pi}[r(a)]+\alpha H(\pi)$，$\alpha>0$。关于它的最优策略，下列说法正确的是：

- **A.** $\pi^*(a)\propto r(a)$，即按奖励大小成比例地分配概率，奖励高的动作概率也高
- **B.** $\pi^*(a)\propto\exp(\alpha\,r(a))$，$\alpha$ 越大，策略越集中于奖励最高的动作
- **C.** $\pi^*(a)\propto\exp(r(a)/\alpha)$，$\alpha$ 越小越接近贪心，越大越接近均匀
- **D.** 最优策略只选奖励最高的动作，与 $\alpha$ 的取值无关；熵项只影响训练中的探索和收敛速度

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：熵正则下的最优策略是以 $\alpha$ 为温度的 softmax（玻尔兹曼分布）。

用拉格朗日乘子 $\mu$ 处理约束 $\sum_a\pi(a)=1$：对 $\sum_a\pi(a)r(a)-\alpha\sum_a\pi(a)\log\pi(a)$ 关于 $\pi(a)$ 求导并令其为 0，得 $r(a)-\alpha(\log\pi(a)+1)-\mu=0$，即 $\pi^*(a)\propto\exp(r(a)/\alpha)$。

- $\alpha\to0$：概率集中到奖励最高的动作（贪心）；$\alpha\to\infty$：趋于均匀分布。$\alpha$ 平衡「多拿奖励」与「保持随机」。
- 熵与 KL 的关系：$H(\pi)=\log|A|-\mathrm{KL}(\pi\|U)$，$U$ 为均匀分布，所以熵正则就是「对均匀分布的 KL 惩罚」。把参考分布换成 $\pi_{\text{ref}}$，目标 $\mathbb{E}_\pi[r]-\beta\,\mathrm{KL}(\pi\|\pi_{\text{ref}})$ 的最优解是 $\pi^*\propto\pi_{\text{ref}}\exp(r/\beta)$，这正是 RLHF 目标的闭式解，也是 DPO 推导的起点。

- A 错：这不是任何正则化目标的解，奖励为负时甚至无法定义概率。
- B 错：温度的方向反了：$\alpha$ 是熵的权重，越大越随机，指数里应是 $r/\alpha$。
- D 错：$\alpha>0$ 时最优解是随机策略，熵项改变的是最优解本身，而不只是收敛速度。

<sub>考点：熵正则、策略梯度定理</sub>

</details>

---

<a name="ALN-RL-041"></a>

### ALN-RL-041　进阶 · 考频 ★★

「在线 / 离线」看训练过程中是否持续产生新数据（与环境交互或由模型自己采样）；「同策略 / 异策略」看用来更新参数的数据是否来自当前策略。按这两个维度，下列判断正确的是：

- **A.** 异步 RLHF 中，推理端用落后 1～2 个版本的权重生成数据，训练数据不来自当前策略，所以它属于离线强化学习
- **B.** PPO 在同一批 rollout 上更新多个 epoch，从第二个 epoch 起这批数据就成了离线数据，所以 PPO 属于离线算法
- **C.** 在固定偏好数据集上训练的 DPO 是离线、异策略的；每轮先用当前模型采样、再标注偏好对的迭代 DPO 是在线的，且每轮数据近似同策略
- **D.** 只要训练数据是模型自己生成的就属于同策略：用三轮之前的模型采样的数据做拒绝采样微调，与 PPO 一样是同策略训练

<details>
<summary>答案与解析</summary>

**答案：C**

**解析：**

**结论**：两个维度相互独立，不能混为一谈。

| | 同策略（数据来自当前策略） | 异策略（数据来自其他策略） |
|---|---|---|
| 在线（持续产生新数据） | PPO、GRPO（近似） | 异步 RLHF、DQN（经验回放） |
| 离线（数据固定） | — | 固定数据集上的 DPO、离线 RL |

- C 对：固定偏好集上的 DPO 不产生新数据，数据又往往来自其他模型，是离线、异策略的；迭代 DPO 每轮用当前模型重新采样，是（分批的）在线训练，每轮开始时数据与策略一致，随着本轮训练推进会逐渐偏离。
- A 错：异步 RLHF 一直在生成新数据，属于「在线但异策略」，Noukhovitch 等（2024）正是这样描述它的；需要的是对陈旧样本做修正，而不是把它当成离线问题。
- B 错：PPO 每一步都采集新数据，是在线算法。同一批数据更新多轮，只是让后面的 mini-batch 轻微异策略，由比率与裁剪来修正。
- D 错：同策略的关键是「来自**当前**策略」，而不是「来自模型自己」。三轮之前的模型生成的数据已经是异策略的，拒绝采样微调也不做重要性修正。

判断一个方法时，先问「训练中有没有新数据进来」，再问「新数据来自哪个版本的策略」。

<sub>考点：On-policy与Off-policy　｜　出处：Noukhovitch 等 Asynchronous RLHF arXiv:2410.18252</sub>

</details>

---

<a name="ALN-RL-042"></a>

### ALN-RL-042　基础 · 考频 ★

DQN 在 Q-learning 的基础上，用神经网络近似动作价值 $Q(s,a)$。为了让训练稳定，它引入的两项关键技术及其作用是：

- **A.** 重要性采样与价值裁剪：前者修正回放池中的旧数据与当前策略之间的分布差异，后者限制每一步更新中 Q 值的变化幅度，二者一起防止 Q 值发散
- **B.** 经验回放与目标网络：前者打破样本间的时间相关性并重复利用数据；后者用定期同步的旧参数计算 TD 目标，避免目标随训练网络一起移动
- **C.** 策略梯度与基线：前者直接对策略参数求梯度、跳过价值估计，后者从回报中减去状态价值来降低梯度估计的方差，二者一起让 Q 值估计更稳定
- **D.** 经验回放与目标网络：前者保证训练数据都来自当前策略，使 Q-learning 成为同策略算法；后者是一个单独的网络，负责输出各个动作的概率分布

<details>
<summary>答案与解析</summary>

**答案：B**

**解析：**

**结论**：DQN 的两项关键技术是经验回放和目标网络。

Q-learning 的更新目标 $r+\gamma\max_aQ(s_{t+1},a)$ 用自己的估计去更新自己（自举）。与函数近似、异策略学习三者叠加时，训练容易振荡甚至发散（Sutton 与 Barto 称之为「致命三要素」）。DQN 的两项技术分别针对其中的问题：
- **经验回放**：连续采到的样本高度相关，直接按顺序训练接近「在一条轨迹上过拟合」。存入回放池再随机抽取，样本更接近独立同分布，每条经验还能被反复使用。Q-learning 学的是最优价值 $Q^*$，单步更新不依赖行为策略，所以能直接使用旧数据。
- **目标网络**：如果 TD 目标也用正在训练的参数计算，每次更新都会让目标跟着变，像追逐自己的影子。目标网络的参数 $\bar\theta$ 每隔若干步才从在线网络复制一次，TD 目标 $r+\gamma\max_{a}Q_{\bar\theta}(s_{t+1},a)$ 在一段时间内保持固定。

- A 错：单步 Q-learning 不需要重要性采样（见 RL-029）；价值裁剪是 PPO 一类方法的技巧，不是 DQN 的设计。
- C 错：策略梯度和基线属于策略优化方法，DQN 是基于价值的方法。
- D 错：经验回放恰恰让数据来自旧策略，Q-learning 本来就是异策略算法；目标网络输出的仍是 Q 值，不是动作的概率分布。

延伸：max 操作会系统性地高估 Q 值，Double DQN 用在线网络选动作、目标网络评估该动作的价值来缓解。

<sub>考点：贝尔曼方程、On-policy与Off-policy　｜　出处：Mnih 等 Human-level control through deep reinforcement learning（Nature, 2015）；Sutton 与 Barto《Reinforcement Learning: An Introduction》第 2 版</sub>

</details>

---

## 多选题

<a name="ALN-RL-003"></a>

### ALN-RL-003　进阶 · 考频 ★★

关于折扣因子 $\gamma$ 与回报 $G_t=\sum_{k\ge0}\gamma^k r_{t+k}$，下列说法**正确**的有：

- **A.** $\gamma$ 越接近 1，回报中计入的未来奖励越多，回报估计的方差通常越小
- **B.** $\gamma$ 只是数值上的缩放，对同一个 MDP，改变 $\gamma$ 不会改变最优策略
- **C.** 有终止状态的回合制任务（如一次生成在 EOS 处结束）可以取 $\gamma=1$
- **D.** 当 $0\le\gamma<1$ 且单步奖励有界时，即使是无限时域的任务，回报也是有界的
- **E.** 回报满足递推关系 $G_t=r_t+\gamma G_{t+1}$，这是从后往前一次遍历算出全部回报的依据

<details>
<summary>答案与解析</summary>

**答案：CDE**

**解析：**

**结论**：C、D、E 正确。

- A 错：$\gamma$ 越大，回报里累加的随机奖励项越多，方差通常越**大**；$\gamma$ 越小越「短视」，方差小但相对真实目标有偏。这是 $\gamma$ 带来的偏差-方差权衡。
- B 错：$\gamma$ 决定「多看重未来」。例如一个动作立即给 1 分，另一个动作 10 步之后才给 5 分：$\gamma=0.9$ 时后者折现为 $5\times0.9^{10}\approx1.74$，更优；$\gamma=0.8$ 时只有 $5\times0.8^{10}\approx0.54$，前者更优。最优策略随 $\gamma$ 改变。
- C 对：回合有限长时回报天然有界，不需要靠 $\gamma<1$ 保证收敛。RLHF 中一条回答就是一个回合，通常取 $\gamma=1$。
- D 对：$|G_t|\le\sum_k\gamma^kR_{\max}=R_{\max}/(1-\gamma)$。$1/(1-\gamma)$ 常被称为「有效视野」，$\gamma=0.99$ 时约 100 步。
- E 对：把求和式的第一项拆出来即得。从轨迹末尾往前递推一次就能得到所有 $G_t$，GAE 也用同样的倒序递推。

<sub>考点：回报与折扣、MDP基本概念</sub>

</details>

---

<a name="ALN-RL-012"></a>

### ALN-RL-012　进阶 · 考频 ★★

关于贝尔曼方程及其求解，下列说法**正确**的有：

- **A.** 贝尔曼最优方程含有 $\max$，是非线性的，一般用价值迭代、策略迭代等迭代方法求解
- **B.** TD 学习以 $r+\gamma V(s')$ 为目标更新 $V(s)$，是对贝尔曼期望方程的采样近似，不需要已知转移概率
- **C.** 有限 MDP 的贝尔曼期望方程是线性方程组，$\gamma<1$ 时可以直接解出 $V^\pi=(I-\gamma P^\pi)^{-1}R^\pi$
- **D.** $\gamma=1$ 时 $I-\gamma P^\pi$ 依然可逆，含循环、不终止的 MDP 也能直接解出唯一的有限解
- **E.** 蒙特卡洛方法用完整回合的实际回报来估计 $V(s)$，不需要已知转移概率，但要等回合结束后才能更新

<details>
<summary>答案与解析</summary>

**答案：ABCE**

**解析：**

**结论**：A、B、C、E 正确。

- A 对：$V^*(s)=\max_a\sum_{s'}P(s'\mid s,a)[R+\gamma V^*(s')]$。$\gamma<1$ 时这个算子是压缩映射，价值迭代反复应用它会收敛到唯一的不动点。
- B 对：把期望方程右边的期望换成一次采样 $(r,s')$ 就得到 TD 目标。它用当前估计 $V(s')$ 做自举（bootstrap），因此有偏，但方差比蒙特卡洛回报小。
- C 对：写成矩阵形式 $V=R^\pi+\gamma P^\pi V$，$\gamma<1$ 时 $I-\gamma P^\pi$ 可逆，解唯一。状态很多时求逆代价为 $O(|S|^3)$，所以实际中用迭代或函数近似。
- D 错：$\gamma=1$ 且存在永不终止的循环时，循环部分的 $P^\pi$ 有特征值 1，$I-P^\pi$ 不可逆；若循环中每步奖励为 1，回报发散，方程没有有限解；$\gamma=1$ 只在回合必然终止时才安全。
- E 对：蒙特卡洛与 TD 都是无模型方法，只靠与环境交互采样。区别在于蒙特卡洛用完整回报，无偏但方差大，而且要等回合结束；TD 用 $r+\gamma V(s')$ 自举，每一步都能更新。动态规划则要对所有下一状态按 $P(s'\mid s,a)$ 求期望，必须已知模型。

<sub>考点：贝尔曼方程</sub>

</details>

---

<a name="ALN-RL-018"></a>

### ALN-RL-018　挑战 · 考频 ★★

用 REINFORCE 训练 LLM：每个提示词采样 $G$ 条回答，第 $i$ 条回答的奖励为 $r_i$。下列基线中，能保证策略梯度估计**无偏**的有：

- **A.** 同一提示词下除第 $i$ 条之外，其余 $G-1$ 条回答的平均奖励
- **B.** 对第 $i$ 条回答的每个 token，用该 token 自身的动作价值 $Q(s_t,a_t)$ 作基线
- **C.** 第 $i$ 条回答自身的奖励 $r_i$（使其权重恒为 0）
- **D.** 训练过程中奖励的滑动平均（只用之前若干步的数据计算）
- **E.** 由 critic 给出的状态价值 $V(s_t)$，$s_t$ 只包含提示词和已生成的前缀

<details>
<summary>答案与解析</summary>

**答案：ADE**

**解析：**

**结论**：A、D、E 正确。判断标准只有一条：基线不能依赖当前样本自己选的动作。

- A 对：留一（leave-one-out）均值只用其他样本的奖励，它们与第 $i$ 条独立地采自同一策略，$\mathbb{E}[b_i\nabla\log\pi(y_i)]=\mathbb{E}[b_i]\,\mathbb{E}[\nabla\log\pi(y_i)]=0$。RLOO 就是这样做的。
- B 错：$Q(s_t,a_t)$ 依赖当前动作。而且在给定 $(s_t,a_t)$ 时 $G_t-Q(s_t,a_t)$ 的期望为 0，期望梯度直接被消成 0，有用的信号全没了。
- C 错：$b_i=r_i$ 依赖当前样本，权重恒为 0，梯度也恒为 0，显然有偏。
- D 对：滑动平均来自过去的数据，与当前样本的动作独立，相当于常数基线。
- E 对：$V(s_t)$ 只依赖状态，不依赖 $t$ 时刻选的 token，是最经典的基线，PPO 中由 critic 提供。

延伸：若基线是「包含自身在内的组内均值」，它依赖自身奖励。由于 $r_i-\bar r=\frac{G-1}{G}(r_i-\bar r_{-i})$，期望梯度会缩小为 $\frac{G-1}{G}$ 倍，方向不变，相当于留一基线乘了一个常数。

<sub>考点：REINFORCE与基线</sub>

</details>

---

<a name="ALN-RL-030"></a>

### ALN-RL-030　进阶 · 考频 ★★

关于大模型训练中的 on-policy 与 off-policy，下列说法**正确**的有：

- **A.** 即使训练端与推理引擎加载的权重完全相同，两者算出的 token 概率也可能有数值差异，这同样会造成轻微的 off-policy
- **B.** 异步 RL 中推理端用落后一两个版本的权重生成样本，训练数据带有陈旧度，同样属于轻微的 off-policy
- **C.** DPO 在事先收集好的偏好数据上训练，数据往往来自其他模型，属于离线（off-policy）学习
- **D.** PPO 把一批 rollout 切成多个 mini-batch 更新多轮，第一次更新之后，后面的 mini-batch 严格来说已经轻微 off-policy，靠重要性比率和裁剪来修正
- **E.** on-policy 算法只要保存好旧数据，就可以像 DQN 一样不加修正地从回放池中反复采样训练

<details>
<summary>答案与解析</summary>

**答案：ABCD**

**解析：**

**结论**：A、B、C、D 正确。

- A 对：vLLM 等推理引擎与训练框架的算子实现、并行方式、数值精度不同，同一 token 的概率会有细微差别。常见做法是用训练引擎重新计算旧策略的 log-prob，让 PPO 比率的分子和分母出自同一套实现；但这只统一了比率的计算口径，样本仍然是按推理引擎的分布采出来的。要修正这部分偏差，还需要对「训练端旧策略概率 / 推理端采样概率」做截断重要性采样（TIS）等修正。
- B 对：样本来自几个版本之前的策略，与当前策略不一致。常见做法是限制最大陈旧度，并用重要性比率修正（如 AReaL 的解耦 PPO 目标）。大模型 RL 的主流算法（PPO、GRPO 等）本身是 on-policy 的，异步只是为了提高吞吐，引入了可控的 off-policy；off-policy 程度越高，重要性权重方差越大，越难训稳。
- C 对：DPO 只用固定的偏好数据，不在线采样，数据分布与当前策略不一致，这是它「分布偏移」问题的根源。
- D 对：第一次梯度更新后参数就变了，后续 mini-batch 的样本来自 $\pi_{\text{old}}$ 而不是当前的 $\pi_\theta$，比率 $\pi_\theta/\pi_{\text{old}}$ 正是用来修正这一点的，裁剪则保证偏移不会太大。
- E 错：on-policy 算法的梯度公式假设样本来自当前策略，用旧数据必须做重要性修正；数据越旧，比率方差越大，在 PPO 中还会被大量裁剪。

<sub>考点：On-policy与Off-policy、重要性采样　｜　出处：Feng Yao 等，Your Efficient RL Framework Secretly Brings You Off-Policy RL Training（2025 技术博客），https://fengyao.notion.site/off-policy-rl ；AReaL 论文 arXiv:2505.24298</sub>

</details>

---

<a name="ALN-RL-036"></a>

### ALN-RL-036　进阶 · 考频 ★★★

关于 PPO 的裁剪（clip）机制，下列说法**正确**的有：

- **A.** 优势为正、但比率已低于 $1-\varepsilon$ 时，该 token 同样被裁剪，不再提供梯度
- **B.** 取 $\min$ 使裁剪后的目标成为未裁剪目标的悲观下界
- **C.** 有了裁剪，一次更新之后新旧策略之间的 KL 散度就被严格限制在 $\varepsilon$ 以内
- **D.** 优势为正、比率已超过 $1+\varepsilon$ 时，该 token 不再提供梯度
- **E.** 裁剪等价于对梯度范数做裁剪，目的是防止梯度爆炸

<details>
<summary>答案与解析</summary>

**答案：BD**

**解析：**

**结论**：B、D 正确。

- A 错：$A>0$ 而 $\rho<1-\varepsilon$ 说明好动作的概率反而下降了，此时 $\rho A<(1-\varepsilon)A$，min 取未裁剪项，梯度照常，用来纠错。裁剪只限制「有利方向」。
- B 对：对每个 token 都有 $\min(\rho A,\mathrm{clip}(\rho)A)\le\rho A$，优化的是更保守的目标，避免因过于乐观而一步走太远。
- C 错：裁剪只是让越界的 token 失去梯度，不是硬约束：其他 token 的梯度仍会改变共享参数，越界 token 的比率可能继续变化，多轮更新后实际的 KL 也可能超标。实践中会监控近似 KL，超过阈值就提前停止本轮更新。
- D 对：$A>0$ 且 $\rho>1+\varepsilon$ 时，min 取到常数 $(1+\varepsilon)A$，梯度为 0。
- E 错：clip 作用在**比率**上，让「已经朝有利方向走够远」的 token 梯度为 0；梯度范数裁剪（`clip_grad_norm_`）是另一回事，PPO 实现中两者常常同时使用。

<sub>考点：PPO裁剪</sub>

</details>

---

## 判断题

<a name="ALN-RL-002"></a>

### ALN-RL-002　基础 · 考频 ★★

马尔可夫性要求「下一状态和奖励只依赖于当前状态与动作，与更早的历史无关」。在 LLM 生成中，由于状态被定义为「提示词 + 已生成的全部 token」，当前状态本身就包含了全部历史，因此这一性质自然成立。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。马尔可夫性是对「状态如何定义」的要求，而不是对任务本身的要求：只要状态包含决策所需的全部信息，过程就是马尔可夫的。LLM 把整个前缀当作状态，历史已经全部「装进」了状态，下一状态（前缀拼上新 token）只取决于当前前缀与所选 token。

代价是状态空间巨大：长度为 $T$ 的前缀有 $|V|^T$ 种可能，无法像表格方法那样为每个状态单独存一个值，只能用神经网络（如 critic 的价值头）做函数近似。反过来，如果只把「最后一个 token」当作状态，过程就不再是马尔可夫的。

<sub>考点：MDP基本概念</sub>

</details>

---

<a name="ALN-RL-008"></a>

### ALN-RL-008　基础 · 考频 ★★

在只在回答结尾给奖励、$\gamma=1$ 的 LLM 生成中（暂不考虑 KL 惩罚），某个前缀 $s_t=(x,y_{<t})$ 的状态价值 $V^\pi(s_t)$ 可以理解为：从这个前缀出发、按当前策略 $\pi$ 继续生成到结束，最终得到的奖励的期望。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。$V^\pi(s_t)=\mathbb{E}_\pi\big[\sum_{k\ge t}\gamma^{k-t}r_k\mid s_t\big]$。中间 token 的即时奖励为 0 且 $\gamma=1$ 时，求和只剩结尾那一项，于是 $V^\pi(s_t)$ 就是「从这个前缀续写到结束，奖励的期望」。

两点延伸：
- 价值依赖于策略：策略一变，同一前缀的价值随之改变，所以 PPO 中 critic 要和策略一起更新。
- 这也是 critic 难训的原因：同一个前缀可以续写出好坏差别很大的回答，critic 只能从有限样本里回归这个期望，越靠前的前缀不确定性越大。若加上逐 token 的 KL 惩罚，$V^\pi(s_t)$ 还要计入后续 KL 惩罚的期望。

<sub>考点：价值函数、MDP基本概念</sub>

</details>

---

<a name="ALN-RL-014"></a>

### ALN-RL-014　基础 · 考频 ★★★

策略梯度方法要求奖励函数对模型参数可导，因此「单元测试是否通过」「最终答案是否正确」这类 0/1 离散奖励无法直接用于策略梯度训练，必须先训练一个可导的奖励模型来替代。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**。策略梯度 $\nabla_\theta J=\mathbb{E}\big[R\,\nabla_\theta\log\pi_\theta(\cdot)\big]$ 求导的对象是 $\log\pi_\theta$，奖励 $R$ 只是一个标量权重，完全不需要可导，甚至不需要知道它是怎么算出来的（黑盒程序、人工打分都可以）。这正是 RL 适合「只能打分、无法示范」的目标的原因：代码能否通过测试、数学答案对不对，都可以直接当奖励，可验证奖励的 RL（RLVR）就建立在这一点上。

即使使用奖励模型，PPO 也不会对奖励模型反向传播，奖励模型的输出被当作常数使用。需要「奖励（或 $Q$）对动作可导」的是 DDPG、SAC 这类面向连续动作、利用重参数化的方法，离散的 token 无法这样求导。

<sub>考点：策略梯度定理</sub>

</details>

---

<a name="ALN-RL-027"></a>

### ALN-RL-027　进阶 · 考频 ★★

用旧策略 $\pi_{\text{old}}$ 采样的整条轨迹去估计新策略 $\pi_\theta$ 下的期望时，轨迹级重要性权重等于各步动作概率比的连乘 $\prod_t\frac{\pi_\theta(a_t\mid s_t)}{\pi_{\text{old}}(a_t\mid s_t)}$，环境的转移概率在比值中相互抵消，因此计算这个权重不需要知道环境模型。

<details>
<summary>答案与解析</summary>

**答案：✅ 正确**

**解析：**

**正确**。同一条轨迹在两个策略下的概率分别是 $\rho(s_0)\prod_t\pi_\theta(a_t\mid s_t)P(s_{t+1}\mid s_t,a_t)$ 与 $\rho(s_0)\prod_t\pi_{\text{old}}(a_t\mid s_t)P(s_{t+1}\mid s_t,a_t)$，相除后初始分布和转移概率全部约掉，只剩动作概率比的连乘。LLM 中，一条回答的轨迹级比率就是 $\pi_\theta(y\mid x)/\pi_{\text{old}}(y\mid x)$，等于逐 token 比率之积。

但「能算」不等于「好用」：连乘的方差随轨迹长度指数增长，每步比率只要稍稍偏离 1，乘上几百步就会爆炸或趋于 0。所以 PPO 不用轨迹级权重，而是对每一步（每个 token）单独用比率加权，再配合裁剪，并要求新旧策略足够接近。

<sub>考点：重要性采样</sub>

</details>

---

<a name="ALN-RL-039"></a>

### ALN-RL-039　基础 · 考频 ★★

PPO 的总损失写成 $\mathcal{L}=-\mathcal{L}^{\text{CLIP}}+c_1\mathcal{L}^{\text{VF}}+c_2\,H[\pi_\theta]$（$c_2>0$，$H$ 为策略熵），用梯度下降最小化 $\mathcal{L}$，可以鼓励策略保持随机、促进探索。

<details>
<summary>答案与解析</summary>

**答案：❌ 错误**

**解析：**

**错误**，熵项的符号写反了。最小化损失时，$+c_2H$ 会让熵**越小越好**，反而加速策略变得确定。正确写法是 $\mathcal{L}=-\mathcal{L}^{\text{CLIP}}+c_1\mathcal{L}^{\text{VF}}-c_2H[\pi_\theta]$，等价于最大化 $\mathcal{L}^{\text{CLIP}}-c_1\mathcal{L}^{\text{VF}}+c_2H$（PPO 论文中的写法）。

熵奖励的作用是防止策略过早塌缩成确定性策略、维持探索。系数 $c_2$ 很敏感：PPO 论文在 Atari 上取 0.01。LLM 的词表巨大，熵的量级与经典任务不同，过大的熵奖励会让模型输出乱码，所以不少 LLM 的 RL 配方不加或只加很小的熵项，转而靠采样温度、KL 约束、调整裁剪等方式维持探索。这类符号错误很隐蔽：训练照样能跑，只是熵掉得比预期更快。

<sub>考点：熵正则　｜　出处：PPO 论文 arXiv:1707.06347</sub>

</details>

---

## 填空题

<a name="ALN-RL-004"></a>

### ALN-RL-004　基础 · 考频 ★★

一个回合共 4 步，各步即时奖励依次为 $r_0=0,\ r_1=1,\ r_2=0,\ r_3=2$，之后回合结束，折扣因子 $\gamma=0.9$。则 $G_1=$ ____，$G_0=$ ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 2.62；(2) 2.358 / 2.36

**解析：**

从后往前用 $G_t=r_t+\gamma G_{t+1}$ 递推，回合结束之后回报为 0：

- $G_3=2$
- $G_2=0+0.9\times2=1.8$
- $G_1=1+0.9\times1.8=$ **2.62**
- $G_0=0+0.9\times2.62=$ **2.358**

按定义验算：$G_0=0+0.9\times1+0.9^2\times0+0.9^3\times2=0.9+1.458=2.358$。

倒序递推只需一次遍历，复杂度 $O(T)$；若对每个 $t$ 都从头按定义求和，复杂度是 $O(T^2)$。REINFORCE 中第 $t$ 步动作的权重就是这个「从当前往后」的回报（reward-to-go）。

<sub>考点：回报与折扣</sub>

</details>

---

<a name="ALN-RL-028"></a>

### ALN-RL-028　进阶 · 考频 ★★

一条 200 个 token 的回答，若更新后每个 token 的比率 $\pi_\theta/\pi_{\text{old}}$ 都是 1.01，整条回答的序列级比率约为 ____；若每个 token 的比率都是 0.99，序列级比率约为 ____（均保留 3 位有效数字）。

<details>
<summary>答案与解析</summary>

**答案：** (1) 7.32 / 7.3；(2) 0.134 / 0.13

**解析：**

序列级比率是逐 token 比率之积：

- $1.01^{200}=e^{200\ln1.01}\approx e^{1.990}\approx$ **7.32**；
- $0.99^{200}=e^{200\ln0.99}\approx e^{-2.010}\approx$ **0.134**。

单看每个 token，策略只变了 1%，离 PPO 的裁剪区间 $[0.8,1.2]$ 还很远；乘起来之后，序列级权重已经偏离 1 好几倍。若用序列级比率做重要性加权，少数样本的权重会主导整个 batch，方差极大，而且回答越长越严重。这就是 PPO 在 LLM 中对每个 token 单独计算比率、单独裁剪的原因。

<sub>考点：重要性采样</sub>

</details>

---

<a name="ALN-RL-032"></a>

### ALN-RL-032　基础 · 考频 ★★

$\varepsilon$-贪心策略：以 $1-\varepsilon$ 的概率选当前估值最高的动作，以 $\varepsilon$ 的概率从全部 $k$ 个动作中均匀随机选一个（包括估值最高的那个）。$k=4$、$\varepsilon=0.1$ 时，选中估值最高动作的概率为 ____，选中某一个特定的其他动作的概率为 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 0.925；(2) 0.025

**解析：**

- 估值最高的动作：$1-\varepsilon+\varepsilon/k=0.9+0.1/4=$ **0.925**；
- 其他每个动作：$\varepsilon/k=0.1/4=$ **0.025**，三个合计 0.075，总和为 1。

$\varepsilon$-贪心保证每个动作都有非零概率被尝试（探索），大部分时候又选当前最好的（利用），常让 $\varepsilon$ 随训练衰减。它的缺点是「盲目」：对明显很差的动作和差不多好的动作一视同仁。改进思路有：按估值做 softmax（玻尔兹曼探索，温度控制随机性）、UCB（给尝试次数少的动作加置信上界）、Thompson 采样等。LLM 的 RL 中，探索主要来自采样温度和策略本身的熵。

<sub>考点：探索与利用</sub>

</details>

---

<a name="ALN-RL-043"></a>

### ALN-RL-043　进阶 · 考频 ★★

行为策略 $\mu$ 在两个动作上的概率为 $(0.9,\ 0.1)$，目标策略 $\pi$ 为 $(0.5,\ 0.5)$，两个动作的奖励分别为 0 和 1，因此 $\mathbb{E}_\pi[r]=0.5$。从 $\mu$ 采样一个动作 $a$，用 $\rho(a)\,r(a)$（$\rho=\pi/\mu$）估计 $\mathbb{E}_\pi[r]$：该估计量的期望为 ____，方差为 ____。若改用截断权重 $\min(\rho,2)$，估计量的期望变为 ____，方差变为 ____。

<details>
<summary>答案与解析</summary>

**答案：** (1) 0.5；(2) 2.25；(3) 0.2；(4) 0.36

**解析：**

两个动作的比率：$\rho(a_1)=0.5/0.9\approx0.56$，$\rho(a_2)=0.5/0.1=5$。$a_1$ 的奖励为 0，估计量只在采到 $a_2$（概率 0.1）时非零。

**完整重要性采样**：估计值以 0.1 的概率取 $5\times1=5$，否则取 0。
- 期望 $=0.1\times5=$ **0.5**，无偏；
- 方差 $=0.1\times5^2-0.5^2=2.5-0.25=$ **2.25**。

**截断到 $C=2$**：采到 $a_2$ 时取 $\min(5,2)\times1=2$。
- 期望 $=0.1\times2=$ **0.2**，偏差为 $-0.3$；
- 方差 $=0.1\times2^2-0.2^2=0.4-0.04=$ **0.36**。

**偏差—方差权衡**：用 $n$ 个样本求平均时，均方误差 = 偏差² + 方差 / $n$。完整 IS 为 $2.25/n$，截断后为 $0.09+0.36/n$，两者在 $n=21$ 时相等：样本少于 21 个时截断更准，样本多时完整 IS 更准。

**对 LLM 强化学习的启示**：异步训练、训推不一致时，常用截断重要性采样（TIS）修正行为策略与当前策略之间的差异。被截断的恰恰是「行为策略认为不太可能、当前策略却更看好」的样本，截断会系统性地低估它们的贡献。所以实践中还要限制陈旧度，让大多数比率保持在 1 附近，截断只作为兜底。

<sub>考点：重要性采样　｜　出处：Yao 等博客 Your Efficient RL Framework Secretly Brings You Off-Policy RL Training（2025-08）</sub>

</details>

---

## 计算题

<a name="ALN-RL-009"></a>

### ALN-RL-009　进阶 · 考频 ★★

某状态 $s$ 下，策略对三个候选 token 的概率为 $\pi=[0.5,\ 0.3,\ 0.2]$，对应的动作价值为 $Q^\pi(s,\cdot)=[1.0,\ 2.0,\ 4.0]$。
(1) 求 $V^\pi(s)$；
(2) 求三个动作的优势，并计算它们按 $\pi$ 加权的和；
(3) 若策略是直接用 logits $z$ 参数化的 softmax（每个动作一个 logit），求目标 $J=\mathbb{E}_{a\sim\pi}[Q^\pi(s,a)]$ 对各 logit 的梯度（把 $Q$ 视为常数），并说明一步梯度上升后哪个动作的概率会被压低。

<details>
<summary>答案与解析</summary>

**答案：(1) V = 1.9；(2) A = [−0.9, 0.1, 2.1]，加权和为 0；(3) ∂J/∂z = [−0.45, 0.03, 0.42]，当前概率最大的动作 1 反而被压低，动作 3 上升最多**

**解析：**

**(1)** $V^\pi(s)=\sum_a\pi(a)Q(s,a)=0.5\times1.0+0.3\times2.0+0.2\times4.0=$ **1.9**。

**(2)** $A=Q-V=[1.0-1.9,\ 2.0-1.9,\ 4.0-1.9]=$ **[−0.9, 0.1, 2.1]**。加权和 $0.5\times(-0.9)+0.3\times0.1+0.2\times2.1=-0.45+0.03+0.42=0$，与「优势在策略下的期望为 0」一致。

**(3)** softmax 的导数 $\partial\pi_b/\partial z_a=\pi_b(\delta_{ab}-\pi_a)$，于是
$$\frac{\partial J}{\partial z_a}=\sum_bQ_b\,\pi_b(\delta_{ab}-\pi_a)=\pi_aQ_a-\pi_aV=\pi_aA_a$$
代入得 $[0.5\times(-0.9),\ 0.3\times0.1,\ 0.2\times2.1]=$ **[−0.45, 0.03, 0.42]**。动作 1 的概率虽然最大，但 $Q=1.0$ 低于平均水平 1.9，优势为负，它的 logit 被压低；动作 3 优势最大，上升最多。

这个例子说明策略梯度看的是「比平均好多少」（优势），而不是「当前概率多大」或「Q 值是不是正的」：三个动作的 $Q$ 都是正数，但只有高于平均的才被强化。

<sub>考点：价值函数、优势函数</sub>

</details>

---

<a name="ALN-RL-011"></a>

### ALN-RL-011　进阶 · 考频 ★★

一个两状态 MDP，$\gamma=0.9$，没有终止状态：
- 在 $s_1$ 有两个动作：动作 $a$ 获得奖励 1 并转到 $s_2$；动作 $b$ 获得奖励 0 并留在 $s_1$；
- 在 $s_2$ 只有一个动作：获得奖励 2 并回到 $s_1$。

策略 $\pi$ 在 $s_1$ 以各 0.5 的概率选 $a$、$b$。
(1) 列出贝尔曼期望方程，求 $V^\pi(s_1)$ 与 $V^\pi(s_2)$；
(2) 求 $Q^\pi(s_1,a)$、$Q^\pi(s_1,b)$ 以及它们的优势。

<details>
<summary>答案与解析</summary>

**答案：(1) V(s1) ≈ 9.655，V(s2) ≈ 10.690；(2) Q(s1,a) ≈ 10.621，Q(s1,b) ≈ 8.690，A(s1,a) ≈ +0.966，A(s1,b) ≈ −0.966**

**解析：**

**(1)** 贝尔曼期望方程（记 $V_1=V^\pi(s_1)$，$V_2=V^\pi(s_2)$）：
$$V_1=0.5\,(1+0.9V_2)+0.5\,(0+0.9V_1),\qquad V_2=2+0.9V_1$$
把第二式代入第一式：$V_1=0.5+0.45\,(2+0.9V_1)+0.45V_1=1.4+0.855V_1$，得 $0.145V_1=1.4$，$V_1\approx$ **9.655**；$V_2=2+0.9\times9.655\approx$ **10.690**。

**(2)** $Q(s_1,a)=1+0.9V_2\approx$ **10.621**；$Q(s_1,b)=0+0.9V_1\approx$ **8.690**。验算：$0.5\times(10.621+8.690)\approx9.655=V_1$。

优势：$A(s_1,a)=10.621-9.655\approx$ **+0.966**，$A(s_1,b)\approx$ **−0.966**，按策略加权和为 0。

**启示**：给定策略时，贝尔曼期望方程就是线性方程组，小规模问题可以直接解。动作 $a$ 的优势为正，值得多选：若把策略改为在 $s_1$ 总是选 $a$（策略改进），新的 $V_1'=(1+0.9\times2)/(1-0.81)\approx14.74$，确实更高。

<sub>考点：贝尔曼方程、价值函数、优势函数</sub>

</details>

---

<a name="ALN-RL-019"></a>

### ALN-RL-019　挑战 · 考频 ★★

一个两臂老虎机，策略为 $\pi=\mathrm{softmax}(\theta_1,\theta_2)$，当前 $\pi(a_1)=0.8$、$\pi(a_2)=0.2$；两个动作的奖励是确定的：$r(a_1)=10$，$r(a_2)=11$。用单样本 REINFORCE 估计 $\partial J/\partial\theta_1$：采样 $a\sim\pi$，估计量 $g=\big(r(a)-b\big)\,\partial\log\pi(a)/\partial\theta_1$。
(1) 求真实梯度 $\partial J/\partial\theta_1$；
(2) 不用基线（$b=0$）时，求 $g$ 的期望与方差；
(3) 用基线 $b=J=\mathbb{E}_\pi[r]$ 时，求 $g$ 的期望与方差。

<details>
<summary>答案与解析</summary>

**答案：(1) −0.16；(2) 期望 −0.16，方差 18.6624；(3) 期望 −0.16，方差 0.0576（约为不用基线时的 1/324）**

**解析：**

**准备**：softmax 下 $\partial\log\pi(a_1)/\partial\theta_1=1-\pi(a_1)=0.2$，$\partial\log\pi(a_2)/\partial\theta_1=-\pi(a_1)=-0.8$；$J=0.8\times10+0.2\times11=10.2$。

**(1)** $J=\sum_a\pi(a)r(a)$，$\partial\pi(a)/\partial\theta_1=\pi(a)(\mathbb{1}[a=a_1]-\pi(a_1))$，得 $\partial J/\partial\theta_1=\pi(a_1)\,(r(a_1)-J)=0.8\times(10-10.2)=$ **−0.16**。真实梯度为负：$a_1$ 低于平均水平，应调低它的概率。

**(2)** $b=0$：
- 采到 $a_1$（概率 0.8）：$g=10\times0.2=2$；采到 $a_2$（概率 0.2）：$g=11\times(-0.8)=-8.8$；
- $\mathbb{E}[g]=0.8\times2+0.2\times(-8.8)=1.6-1.76=$ **−0.16**（无偏）；
- $\mathbb{E}[g^2]=0.8\times4+0.2\times77.44=18.688$，方差 $=18.688-0.16^2=$ **18.6624**。

**(3)** $b=10.2$：
- 采到 $a_1$：$g=(10-10.2)\times0.2=-0.04$；采到 $a_2$：$g=(11-10.2)\times(-0.8)=-0.64$；
- $\mathbb{E}[g]=0.8\times(-0.04)+0.2\times(-0.64)=$ **−0.16**（仍然无偏）；
- $\mathbb{E}[g^2]=0.8\times0.0016+0.2\times0.4096=0.0832$，方差 $=0.0832-0.0256=$ **0.0576**。

**解读**：不减基线时，两个奖励都是 10 左右的大正数，估计量在 $+2$ 与 $-8.8$ 之间剧烈摆动，采到 $a_1$ 时符号甚至与真实梯度相反（会错误地推高较差的动作）。减去基线后只剩「比平均好多少」，两种情况下 $g$ 都是负的，方差降到约 1/324。这就是「奖励全为正时必须减基线」的定量解释。

<sub>考点：REINFORCE与基线、优势函数</sub>

</details>

---

<a name="ALN-RL-023"></a>

### ALN-RL-023　进阶 · 考频 ★★★

一条轨迹共 4 步，即时奖励 $r=[0,0,0,1]$，第 4 步后回合结束；critic 的估值 $V=[0.3,\ 0.4,\ 0.6,\ 0.7]$；$\gamma=0.9$，$\lambda=0.8$。
(1) 求各步的 TD 误差 $\delta_t$；
(2) 用 GAE 递推求 $\hat A_0\sim\hat A_3$；
(3) 分别写出 $\lambda=0$ 与 $\lambda=1$ 时的 $\hat A_0$。

<details>
<summary>答案与解析</summary>

**答案：(1) δ = [0.06, 0.14, 0.03, 0.30]；(2) Â = [0.2883, 0.3171, 0.246, 0.30]；(3) λ=0 时 Â₀ = 0.06，λ=1 时 Â₀ = 0.429**

**解析：**

**(1)** $\delta_t=r_t+\gamma V(s_{t+1})-V(s_t)$，回合结束后的价值记为 0：
- $\delta_0=0+0.9\times0.4-0.3=0.06$
- $\delta_1=0+0.9\times0.6-0.4=0.14$
- $\delta_2=0+0.9\times0.7-0.6=0.03$
- $\delta_3=1+0-0.7=0.30$

**(2)** $\gamma\lambda=0.72$，从后往前递推 $\hat A_t=\delta_t+0.72\,\hat A_{t+1}$：
- $\hat A_3=0.30$
- $\hat A_2=0.03+0.72\times0.30=0.246$
- $\hat A_1=0.14+0.72\times0.246=0.31712$
- $\hat A_0=0.06+0.72\times0.31712\approx0.2883$

**(3)** $\lambda=0$：$\hat A_0=\delta_0=$ **0.06**，只看一步，其余全靠 critic 的 $V(s_1)$。$\lambda=1$：$\hat A_0=G_0-V(s_0)=0.9^3\times1-0.3=$ **0.429**，即蒙特卡洛回报减基线，不依赖中间状态的估值。

**解读**：三个结果差别很大，说明 critic 的估值前后并不一致（例如 $V(s_3)=0.7$，而从 $s_3$ 出发的真实回报是 1）。$\lambda$ 越小越相信这些估值（方差小，但估值不准时有偏），越大越相信实际回报（偏差小，但方差大）。

<sub>考点：GAE</sub>

</details>

---

<a name="ALN-RL-034"></a>

### ALN-RL-034　进阶 · 考频 ★★★

PPO 中单个 token 的目标为 $\min\big(\rho A,\ \mathrm{clip}(\rho,1-\varepsilon,1+\varepsilon)A\big)$，$\varepsilon=0.2$。对下面四个 token 分别计算目标值，并指出哪些 token 对 $\rho$ 的梯度为 0：
(1) $\rho=1.5$，$A=+2$；(2) $\rho=0.6$，$A=+2$；(3) $\rho=0.6$，$A=-1$；(4) $\rho=1.5$，$A=-1$。

<details>
<summary>答案与解析</summary>

**答案：(1) 2.4；(2) 1.2；(3) −0.8；(4) −1.5；梯度为 0 的是 (1) 和 (3)**

**解析：**

裁剪区间为 $[0.8,1.2]$。逐个计算「未裁剪项」与「裁剪项」，取较小者：

| token | $\rho A$ | $\mathrm{clip}(\rho)A$ | 取 min | 梯度 |
|---|---|---|---|---|
| (1) $\rho=1.5$，$A=+2$ | 3.0 | $1.2\times2=2.4$ | **2.4**（裁剪项） | 0 |
| (2) $\rho=0.6$，$A=+2$ | 1.2 | $0.8\times2=1.6$ | **1.2**（未裁剪项） | $\partial/\partial\rho=2$ |
| (3) $\rho=0.6$，$A=-1$ | −0.6 | $0.8\times(-1)=-0.8$ | **−0.8**（裁剪项） | 0 |
| (4) $\rho=1.5$，$A=-1$ | −1.5 | $1.2\times(-1)=-1.2$ | **−1.5**（未裁剪项） | $\partial/\partial\rho=-1$ |

**直觉**：
- (1) 好动作的概率已经涨到 1.5 倍，超过 $1+\varepsilon$，「推够了」，不再给梯度；
- (3) 坏动作的概率已经降到 0.6 倍，低于 $1-\varepsilon$，同样停止；
- (2)(4) 是「走反了」：好动作的概率反而下降、坏动作的概率反而上升。此时 min 取未裁剪项，梯度照常，把它纠正回来。

所以 PPO 的裁剪是**单边**的：只限制「朝有利方向走得太远」，不限制纠错。取 min 让目标成为未裁剪目标的悲观下界。

<sub>考点：PPO裁剪　｜　出处：PPO 论文 arXiv:1707.06347</sub>

</details>

---

## 代码输出题

<a name="ALN-RL-016"></a>

### ALN-RL-016　进阶 · 考频 ★★

下面用 PyTorch 对一个三分类 softmax 策略做一次 REINFORCE 更新：采样到的动作是 0，奖励为 2，损失为 $-R\log\pi(a)$。输出是什么？

```python
import math
import torch

z = torch.tensor([0.0, 0.0, math.log(2.0)], requires_grad=True)   # logits
a, R = 0, 2.0
loss = -R * torch.log_softmax(z, dim=-1)[a]
loss.backward()
print([round(g, 2) for g in z.grad.tolist()])
with torch.no_grad():
    z -= 0.5 * z.grad                                              # 学习率 0.5 的梯度下降
print([round(p, 3) for p in torch.softmax(z, -1).tolist()])
```

<details>
<summary>答案与解析</summary>

**答案（程序输出）：**

```text
[-1.5, 0.5, 1.0]
[0.515, 0.19, 0.295]
```

**解析：**

初始 $\pi=\mathrm{softmax}([0,0,\ln2])=[1,1,2]/4=[0.25,0.25,0.5]$。

log-softmax 对 logits 的梯度是 $\nabla_z\log\pi(a)=e_a-\pi$，所以
$$\nabla_z\mathcal{L}=-R\,(e_a-\pi)=-2\times\big([1,0,0]-[0.25,0.25,0.5]\big)=[-1.5,\ 0.5,\ 1.0]$$

梯度下降后 $z=[0.75,\ -0.25,\ \ln2-0.5]$，softmax 得 $[0.515,\ 0.19,\ 0.295]$：被采样的动作 0 从 0.25 升到 0.515；其余动作的 logit 按各自原来的概率被压低（概率越大的被压得越多）。

要点：
- 奖励为正时，被采样的动作**总会**被推高。不减基线时，哪怕这个动作其实低于平均水平，只要奖励是正数就会被强化，只能靠其他样本被强化得更多来「相对」修正，所以方差很大。
- 若把奖励换成优势（例如 $A=-1$），梯度方向反转，动作 0 的概率会下降。

<sub>考点：策略梯度定理</sub>

</details>

---

## 代码填空题

<a name="ALN-RL-035"></a>

### ALN-RL-035　进阶 · 考频 ★★★

补全 PPO 的裁剪策略损失（对 token 取平均）。`logp` 是当前策略对已采样 token 的对数概率（带梯度），`old_logp` 是采样时旧策略的对数概率，`adv` 是优势。

```python
import torch

def ppo_clip_loss(logp, old_logp, adv, eps=0.2):
    ratio = torch.exp(____)
    surr1 = ratio * adv
    surr2 = torch.clamp(ratio, ____, ____) * adv
    return -torch.____(surr1, surr2).mean()
```

<details>
<summary>答案与解析</summary>

**答案：** (1) `logp - old_logp`；(2) `1 - eps`；(3) `1 + eps`；(4) `min`

**解析：**

完整实现：

```python
ratio = torch.exp(logp - old_logp)
surr2 = torch.clamp(ratio, 1 - eps, 1 + eps) * adv
return -torch.min(surr1, surr2).mean()
```

- **比率在对数空间算**：`exp(logp - old_logp)` 比 `exp(logp) / exp(old_logp)` 数值稳定，概率很小时也不会下溢；
- **取 min 再加负号**：PPO 要**最大化** $\min(\rho A,\mathrm{clip}(\rho)A)$，作为损失要取负。写成 `max` 会把悲观下界变成乐观上界，裁剪完全失效；
- `old_logp` 来自采样时的旧策略，必须是常数（实际代码中要 `detach`）；
- 测试中比率 1.3 且 $A=+1$、比率 0.7 且 $A=-1$ 的 token 梯度为 0，而比率 0.7 且 $A=+1$、比率 1.3 且 $A=-1$ 的 token 照常有梯度，体现了「只限制走过头，不限制纠错」。

实际训练中还会统计「裁剪比例」（取到裁剪项的 token 占比）作为监控指标，持续偏高说明单步走得太远。

<sub>考点：PPO裁剪</sub>

</details>

---

## 代码改错题

<a name="ALN-RL-006"></a>

### ALN-RL-006　进阶 · 考频 ★★

下面是 REINFORCE 损失的实现：先计算每一步的 reward-to-go $G_t=\sum_{k\ge t}\gamma^{k-t}r_k$，再以 $G_t$ 为权重乘以所选动作的对数概率。代码有一个 bug，导致权重算错。请指出并修正。

```python
import torch

def reinforce_loss(logps, rewards, gamma=0.99):
    """logps: (T,) 各步所选动作的 log π(a_t|s_t)，带梯度；rewards: (T,) 各步即时奖励"""
    T = rewards.shape[0]
    returns = torch.zeros(T)
    G = 0.0
    for t in range(T):
        G = rewards[t] + gamma * G
        returns[t] = G
    return -(logps * returns).sum()
```

<details>
<summary>答案与解析</summary>

**答案：**

**问题**：第 8 行从前往后遍历（`for t in range(T)`），递推 `G = rewards[t] + gamma * G` 累加的是**过去**的奖励，`returns[t]` 变成了 $\sum_{k\le t}\gamma^{t-k}r_k$，方向完全反了。例如奖励 `[0, 0, 1]`、$\gamma=0.5$ 时得到 `[0, 0, 1]`，正确值应为 `[0.25, 0.5, 1]`。

**修正**：改为倒序遍历：

```python
for t in reversed(range(T)):
    G = rewards[t] + gamma * G
    returns[t] = G
```

**修正后的代码：**

```python
import torch

def reinforce_loss(logps, rewards, gamma=0.99):
    """logps: (T,) 各步所选动作的 log π(a_t|s_t)，带梯度；rewards: (T,) 各步即时奖励"""
    T = rewards.shape[0]
    returns = torch.zeros(T)
    G = 0.0
    for t in reversed(range(T)):
        G = rewards[t] + gamma * G
        returns[t] = G
    return -(logps * returns).sum()
```

**解析：**

reward-to-go 满足 $G_t=r_t+\gamma G_{t+1}$，必须先知道 $G_{t+1}$ 才能算 $G_t$，所以要从最后一步往前递推。bug 版本让早期动作几乎拿不到后续奖励的功劳，最后一步的动作却被记上了之前所有奖励的账，信用分配完全错乱。

为什么用 reward-to-go 而不是整条轨迹的总回报 $R(\tau)$：$t$ 时刻的动作不可能影响它之前已经发生的奖励，$\mathbb{E}[r_k\nabla\log\pi(a_t\mid s_t)]=0\ (k<t)$，把这些项从权重里去掉，梯度期望不变而方差更小。这与减基线一样，是 REINFORCE 最基本的降方差手段。

<sub>考点：回报与折扣、REINFORCE与基线</sub>

</details>

---

## 编程题

<a name="ALN-RL-025"></a>

### ALN-RL-025　挑战 · 考频 ★★★

用纯 Python 实现带回合边界的 GAE：

```python
def compute_gae(rewards, values, dones, last_value, gamma=0.99, lam=0.95):
    """返回 (advantages, returns)，均为长度 T 的 list"""
```

- 一段 rollout 长度为 $T$，可能跨越多个回合；`dones[t] = 1` 表示第 $t$ 步之后回合结束，之后的数据属于新回合；
- `values[t]` 是 $V(s_t)$；`last_value` 是第 $T$ 步之后那个状态的价值估计（rollout 被截断时用于自举；若 `dones[T-1] = 1` 则不应使用）；
- $\delta_t=r_t+\gamma V(s_{t+1})(1-d_t)-V(s_t)$，$\hat A_t=\delta_t+\gamma\lambda(1-d_t)\hat A_{t+1}$；`returns[t] = advantages[t] + values[t]`，作为 critic 的回归目标。

<details>
<summary>答案与解析</summary>

**参考实现：**

```python
def compute_gae(rewards, values, dones, last_value, gamma=0.99, lam=0.95):
    T = len(rewards)
    adv = [0.0] * T
    gae = 0.0
    for t in reversed(range(T)):
        next_value = last_value if t == T - 1 else values[t + 1]
        nonterminal = 1.0 - dones[t]
        delta = rewards[t] + gamma * next_value * nonterminal - values[t]
        gae = delta + gamma * lam * nonterminal * gae     # 回合结束处切断累积
        adv[t] = gae
    returns = [a + v for a, v in zip(adv, values)]
    return adv, returns
```

**测试用例：**

```python
import math

def brute(rewards, values, dones, last_value, gamma, lam):
    """按定义：A_t = Σ_l (γλ)^l δ_{t+l}，求和到本回合结束（或 rollout 末尾）为止"""
    T = len(rewards)
    nxt = [last_value if t == T - 1 else values[t + 1] for t in range(T)]
    delta = [rewards[t] + gamma * nxt[t] * (1 - dones[t]) - values[t] for t in range(T)]
    out = []
    for t in range(T):
        s, coef = 0.0, 1.0
        for k in range(t, T):
            s += coef * delta[k]
            if dones[k]:
                break
            coef *= gamma * lam
        out.append(s)
    return out

def close(a, b):
    return len(a) == len(b) and all(math.isclose(x, y, abs_tol=1e-9) for x, y in zip(a, b))

r = [0.0, 0.0, 1.0, 0.5, 0.0, 2.0]
v = [0.2, 0.4, 0.5, 0.1, 0.3, 0.6]
d = [0, 0, 1, 0, 0, 0]          # 第 2 步后第一个回合结束；第二个回合被截断
for g, l in [(0.99, 0.95), (0.9, 0.5), (1.0, 1.0)]:
    adv, ret = compute_gae(r, v, d, last_value=0.7, gamma=g, lam=l)
    assert close(adv, brute(r, v, d, 0.7, g, l))
    assert close(ret, [a + b for a, b in zip(adv, v)])

# λ=0：退化为单步 TD 误差
adv0, _ = compute_gae(r, v, d, 0.7, gamma=0.9, lam=0.0)
assert close(adv0, [0.9 * 0.4 - 0.2, 0.9 * 0.5 - 0.4, 1 - 0.5,
                    0.5 + 0.9 * 0.3 - 0.1, 0.9 * 0.6 - 0.3, 2 + 0.9 * 0.7 - 0.6])

# γ=λ=1：回报等于回合内奖励之和，截断处用 last_value 自举
_, ret1 = compute_gae(r, v, d, 0.7, gamma=1.0, lam=1.0)
assert close(ret1, [1.0, 1.0, 1.0, 0.5 + 2 + 0.7, 2 + 0.7, 2 + 0.7])

# 回合边界：改动第二个回合的数据，不影响第一个回合的优势
adv_a, _ = compute_gae(r, v, d, 0.7)
adv_b, _ = compute_gae(r[:3] + [9.0, 9.0, 9.0], v[:3] + [5.0, 5.0, 5.0], d, 3.0)
assert close(adv_a[:3], adv_b[:3])

# 最后一步就是终止：last_value 不应被使用
adv_c, _ = compute_gae([1.0], [0.3], [1], last_value=100.0)
assert close(adv_c, [0.7])
```

**解析：**

**思路**：从后往前一次遍历。每一步先确定「下一状态价值」：rollout 末尾用 `last_value`，否则用 `values[t+1]`；若本步之后回合结束（`dones[t]=1`），下一状态价值和累积的 GAE 都乘以 0，信息不跨回合传递。

**易错点**：
- 只屏蔽了 `next_value`，忘了屏蔽累积项 `gae`：上一个回合的优势会「漏」进前一个回合的末尾（测试中「回合边界」一项专门检查这一点）；
- 混淆截断与终止：rollout 用完但回合没结束时应该用 `last_value` 自举，真正终止时下一状态价值为 0；
- 从前往后遍历；或者先把优势白化再加 `values` 当作回报（critic 的目标应使用白化前的优势）。

**复杂度**：时间 $O(T)$，空间 $O(T)$。LLM 的 RLHF 中一条回答就是一个回合，「回合结束」对应回答的最后一个 token，右侧 padding 的处理与这里的 `dones` 同理。

<sub>考点：GAE</sub>

</details>

---

## 简答题

<a name="ALN-RL-015"></a>

### ALN-RL-015　挑战 · 考频 ★★★

请推导策略梯度定理（REINFORCE 形式）：
(1) 从目标 $J(\theta)=\mathbb{E}_{\tau\sim p_\theta}[R(\tau)]$ 出发，用对数导数技巧推出梯度表达式；
(2) 说明梯度中为什么不出现环境的转移概率；
(3) 说明「reward-to-go」与「减基线」两种改写为什么不改变梯度的期望；
(4) 结合 LLM 解释这个梯度的直观含义。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **推导**：$\nabla_\theta J=\nabla_\theta\sum_\tau p_\theta(\tau)R(\tau)=\sum_\tau p_\theta(\tau)\,\nabla_\theta\log p_\theta(\tau)\,R(\tau)=\mathbb{E}_\tau\big[R(\tau)\nabla_\theta\log p_\theta(\tau)\big]$，用到恒等式 $\nabla p=p\,\nabla\log p$。
2. **环境项消失**：$\log p_\theta(\tau)=\log\rho(s_0)+\sum_t\big[\log\pi_\theta(a_t\mid s_t)+\log P(s_{t+1}\mid s_t,a_t)\big]$，初始分布与转移概率不依赖 $\theta$，求导为 0，于是 $\nabla_\theta J=\mathbb{E}\big[R(\tau)\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\big]$。不需要环境模型，也不需要奖励可导，用采样均值就能无偏估计。
3. **两种等价改写**：
   - reward-to-go：$t$ 时刻的动作不影响之前的奖励，$\mathbb{E}[r_k\nabla\log\pi(a_t\mid s_t)]=0\ (k<t)$，权重可换成 $G_t=\sum_{k\ge t}\gamma^{k-t}r_k$；
   - 基线：对只依赖状态的 $b(s_t)$，$\mathbb{E}_{a_t\sim\pi}[b(s_t)\nabla\log\pi(a_t\mid s_t)]=b(s_t)\nabla\sum_a\pi(a\mid s_t)=b(s_t)\nabla1=0$，权重可写成 $G_t-b(s_t)$；取 $b=V(s_t)$ 时，$G_t-V(s_t)$ 就是优势的估计。两者都不改变期望，只降低方差。
4. **LLM 中的直观含义**：$\sum_t\nabla\log\pi_\theta(y_t\mid x,y_{<t})$ 就是「对这条回答做一步 SFT」的梯度。策略梯度就是在模型自己采样的回答上做**加权 SFT**，权重是奖励（或优势）：好回答的概率被推高，优势为负的回答被压低。

**评分要点（共 10 分）：**

- 用对数导数技巧正确推出 E[R ∇log p(τ)]（3 分）
- 说明初始分布与转移概率不依赖 θ 而消失，奖励无需可导（2 分）
- 说明 reward-to-go 与基线不改变期望，并写出 E[b∇logπ]=0 的推导（3 分）
- 给出「加权 SFT」等 LLM 场景下的直观解释（2 分）

**讲解：**

**常见失分点**：把梯度写成对奖励求导；推导中跳过 $\nabla p=p\nabla\log p$ 直接给结论；说基线「会引入少量偏差」；认为基线可以依赖当前动作；讲不出「为什么不需要环境模型」。

常见追问：方差最小的常数基线是什么？答：按 $\|\nabla\log\pi\|^2$ 加权的回报均值 $b^*=\mathbb{E}[R\|\nabla\log\pi\|^2]/\mathbb{E}[\|\nabla\log\pi\|^2]$；实践中常直接用 $V(s)$ 或同一提示词多次采样的平均奖励。

<sub>考点：策略梯度定理、REINFORCE与基线　｜　出处：Williams (1992) REINFORCE；Sutton 等 (2000) 策略梯度定理</sub>

</details>

---

<a name="ALN-RL-022"></a>

### ALN-RL-022　进阶 · 考频 ★★

比较 REINFORCE（蒙特卡洛策略梯度，可带常数或组内基线）与 Actor-Critic：它们的优势估计分别来自哪里？在偏差、方差、更新时机、信用分配和计算成本上各有什么取舍？在 LLM 的 RL 训练中，两条路线各有哪些代表做法？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **优势从哪来**：REINFORCE 用实际回报 $G_t$ 减一个基线（常数、滑动平均或同一提示词多次采样的均值）；Actor-Critic 用学到的 $V(s)$ 构造 TD 误差 $\delta_t=r_t+\gamma V(s_{t+1})-V(s_t)$ 或 GAE。
2. **偏差与方差**：REINFORCE 用真实采样的回报，无偏但方差大；Actor-Critic 用 critic 自举，方差小，但 critic 不准就会引入偏差。GAE 的 $\lambda$ 在两者之间连续调节。
3. **更新时机**：REINFORCE 要等回合结束才知道回报；Actor-Critic 可以按步或按截断的片段更新，适合长回合、无限时域任务。
4. **信用分配**：Actor-Critic 能给每一步（每个 token）不同的优势；只有结尾奖励时，REINFORCE 通常让同一条轨迹的所有 token 共用一个权重。
5. **成本**：Actor-Critic 要多训练一个 critic（LLM 中往往和策略一样大，显存与计算都接近翻倍），而且 critic 本身难训；REINFORCE 系不要 critic，但需要更多采样来降低方差。
6. **LLM 中的代表**：PPO（critic + GAE，InstructGPT 式 RLHF）属于 Actor-Critic；REINFORCE 系有 RLOO（留一基线）、ReMax（贪心解码回答的奖励作基线）、GRPO（组内均值作基线）等，它们去掉 critic，靠一题多采来降方差。

**评分要点（共 10 分）：**

- 说清两者优势估计的来源（2 分）
- 正确比较偏差与方差，并提到 GAE 的折中（3 分）
- 说明更新时机、逐 token 信用分配与 critic 的成本（3 分）
- 举出 LLM 中两条路线的代表算法（2 分）

**讲解：**

**常见失分点**：说 Actor-Critic「无偏且方差小」；把 GRPO 说成「没有基线」；忽略 critic 在 LLM 中的显存与训练难度代价；只比较公式，不讲只有结尾奖励时两者在逐 token 信用分配上的差别。

<sub>考点：Actor-Critic、REINFORCE与基线</sub>

</details>

---

<a name="ALN-RL-033"></a>

### ALN-RL-033　进阶 · 考频 ★★

什么是强化学习中的「探索与利用」困境？请列举经典 RL 中常见的探索方法，并说明：在 LLM 的 RL 训练中，探索主要来自哪里？探索不足会有什么表现？可以用哪些手段维持探索？

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **困境**：利用是选当前认为最好的动作，拿到已知的奖励；探索是尝试不确定的动作，可能发现更好的策略，但短期可能吃亏。只利用会陷入局部最优，只探索则浪费样本。
2. **经典方法**：
   - $\varepsilon$-贪心：以小概率随机选动作，常随训练衰减；
   - 玻尔兹曼（softmax）探索：按 $\exp(Q/\tau)$ 采样，温度 $\tau$ 控制随机程度；
   - 乐观初始化与 UCB：对尝试次数少的动作加置信上界，「不确定时保持乐观」；
   - Thompson 采样：从参数后验中采样，再按采样结果贪心行动；
   - 熵正则：在目标中加 $\alpha H(\pi)$，鼓励策略保持随机；
   - 内在奖励（好奇心、新颖性奖励）：用于稀疏奖励环境。
3. **LLM 中的探索来源**：策略本身就是随机策略，探索主要来自 rollout 的采样（温度、top-p）和策略分布的熵；同一提示词多次采样，得到可以相互比较的不同回答。
4. **探索不足的表现**：策略熵快速下降；同一提示词的多次采样几乎一样；奖励停滞，pass@k 不再提升；难题始终采不到正确答案，拿不到正向信号。
5. **维持探索的手段**：合适的采样温度（训练端计算 log-prob 时同步除以温度）；很小的熵奖励（系数过大会输出乱码）；对参考模型的 KL 约束，防止分布过早塌缩；控制学习率与单步更新幅度；补充难度合适的题目（太难全错、太易全对，都没有学习信号）。

**评分要点（共 10 分）：**

- 说清探索与利用的含义与矛盾（2 分）
- 列出至少三种经典探索方法并说明原理（3 分）
- 说明 LLM 中探索来自采样温度与策略熵（2 分）
- 说出探索不足的表现和维持探索的手段（3 分）

**讲解：**

**常见失分点**：只会说「ε-贪心」；把探索等同于「把温度调高」，不知道训练端也要使用相同温度；不知道熵奖励系数过大的副作用；不会用指标（熵、同题多样性、pass@k）诊断探索是否不足。

<sub>考点：探索与利用、熵正则</sub>

</details>

---

<a name="ALN-RL-037"></a>

### ALN-RL-037　挑战 · 考频 ★★

PPO 与 TRPO 都想解决「用旧策略采集的数据，安全地把策略往前推一步」的问题。请说明：
(1) 二者共同的代理目标是什么，为什么需要限制更新幅度；
(2) TRPO 怎么限制、PPO 怎么限制，各自的工程代价是什么；
(3) PPO 的裁剪有哪些局限，实践中如何弥补。

<details>
<summary>答案与解析</summary>

**参考答案：**

1. **共同的代理目标**：$L(\theta)=\mathbb{E}_{s,a\sim\pi_{\text{old}}}\big[\rho_\theta(s,a)\hat A(s,a)\big]$，$\rho=\pi_\theta/\pi_{\text{old}}$。它用旧策略的状态分布近似新策略的状态分布，只在新旧策略接近时可靠；比率偏离 1 越远，重要性权重方差越大。若不加限制地最大化，策略会一步冲进代理目标高估的区域，真实性能反而下降。
2. **TRPO**：$\max_\theta L(\theta)$ s.t. $\mathbb{E}_s[\mathrm{KL}(\pi_{\text{old}}\|\pi_\theta)]\le\delta$。用 KL 的二阶近似（Fisher 信息矩阵）和共轭梯度求更新方向，再做线搜索确保约束满足。理论上有单调改进的保证，但实现复杂、二阶计算昂贵，难以与 mini-batch SGD、策略与价值共享主干、dropout 等配合，不易扩展到大模型。
3. **PPO**：把约束换成裁剪：$\min\big(\rho A,\mathrm{clip}(\rho,1-\varepsilon,1+\varepsilon)A\big)$，比率越界且方向有利时梯度为 0。纯一阶，几行代码，可以在同一批数据上用 mini-batch 跑多个 epoch。PPO 论文还给出了自适应 KL 惩罚的变体，但裁剪版更常用。
4. **PPO 的局限**：裁剪不是硬约束，越界 token 仍可能被其他 token 的梯度带着继续变化，多个 epoch 后实际 KL 可能超标；$\varepsilon$ 对所有 token 一视同仁，低概率 token 一步能涨的绝对幅度很小；效果对实现细节较敏感（优势归一化、价值裁剪、学习率退火等）。
5. **弥补手段**：监控近似 KL 与裁剪比例，超阈值时提前停止本轮更新；控制 epoch 数与学习率；梯度范数裁剪；在 RLHF 中另加对参考模型的 KL 惩罚，约束累计偏移。

**评分要点（共 10 分）：**

- 写出代理目标并说明为什么需要限制更新幅度（2 分）
- 说明 TRPO 的 KL 约束、二阶求解方式及其代价（3 分）
- 说明 PPO 裁剪的做法与工程优势（3 分）
- 指出裁剪不是硬约束等局限，并给出监控 KL、早停等补救措施（2 分）

**讲解：**

**常见失分点**：把 PPO 的 clip 说成梯度裁剪；说「PPO 严格保证新旧策略的 KL 不超过 ε」；不知道 TRPO 用的是共轭梯度加线搜索；把「相对 $\pi_{\text{old}}$ 的裁剪」与 RLHF 中「相对 $\pi_{\text{ref}}$ 的 KL 惩罚」混为一谈（前者管单步，后者管累计偏移）。

<sub>考点：PPO裁剪、重要性采样　｜　出处：TRPO 论文 arXiv:1502.05477；PPO 论文 arXiv:1707.06347</sub>

</details>

---

## 场景分析题

<a name="ALN-RL-020"></a>

### ALN-RL-020　进阶 · 考频 ★★

某团队用最朴素的 REINFORCE 在 7B 模型上做对话 RL：奖励模型的分数经 sigmoid 映射到 (0, 1)，实际几乎都落在 0.6～0.9 之间；每个提示词只采 1 条回答；损失为 $-r\cdot\sum_t\log\pi_\theta(y_t\mid x,y_{<t})$，不减基线，也不做任何归一化。训练中梯度范数和 loss 剧烈抖动，奖励涨得很慢，抽查还发现一些明显较差的回答在训练后概率反而上升了。请分析原因并给出改进方案。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 原因分析**
- **没有基线，权重全是正数**：每条被采到的回答都会被推高，只是程度略有不同（0.6 与 0.9 的差别）。「好坏」信息藏在一个很大的公共分量之下，单样本梯度方差极大，方向经常与真实梯度相反：差回答只要被采到，就会被强化。
- **每题只采 1 条**：无法在同一提示词内部比较好坏，也就构造不出「比平均好多少」的信号；不同提示词难度不同，奖励高低更多反映题目难易，而不是回答质量。
- **奖励尺度未处理**：奖励的整体偏移完全进入梯度；sigmoid 压缩后好坏回答的分差更小，信噪比更低。
- **按 token 求和**：梯度量级随回答长度变化，长回答的梯度更大，进一步放大了抖动。

**2. 改进方案（由易到难）**
1. **减基线、用优势**：每个提示词采 $G$ 条（如 4～8），用留一均值或组均值作基线；或在 batch 内对奖励减均值、除以标准差。
2. **训练 critic**：用 $V(s_t)$ 作基线并结合 GAE，得到逐 token 的优势（即 Actor-Critic / PPO）。
3. **处理尺度**：直接用奖励模型的原始分数（不过 sigmoid），做均值方差归一化或裁剪；优势在 batch 内白化。
4. **稳定化**：按 token 数平均或除以固定常数；加入对参考模型的 KL 约束；用 PPO 的裁剪限制单步更新；调小学习率并做梯度裁剪。

**3. 验证**：监控梯度范数、奖励均值与方差、优势的分布（应正负大致各半）；对同一提示词的高分与低分回答，检查训练后概率变化的方向是否正确。

**评分要点（共 10 分）：**

- 指出不减基线、奖励全为正导致高方差，且差样本也会被强化（3 分）
- 指出每题单样本无法组内比较、题目难度混入奖励（2 分）
- 给出组内基线、critic 或 batch 归一化等降方差方案（3 分）
- 提到奖励尺度、长度归一化、KL 或裁剪等稳定化措施，并给出监控方法（2 分）

**讲解：**

**常见失分点**：只说「学习率太大」「换成 PPO」而不解释方差的来源；认为减基线会让梯度有偏；把奖励归一化与减基线混为一谈（归一化管尺度，基线管「比平均好多少」，两者互补）；没有意识到每题只采一条回答时无法做组内比较。

<sub>考点：REINFORCE与基线、优势函数</sub>

</details>

---

<a name="ALN-RL-038"></a>

### ALN-RL-038　挑战 · 考频 ★★

某团队用 PPO 训练一个 7B 对话模型，rollout 生成占了每一步的大部分时间。为了省生成，有人提议：把最近 10 个训练 step 生成的 rollout 都存进回放池，每一步从池中混合采样新旧数据做 PPO 更新；「旧样本的 old_logp 直接用当前策略重新算一遍就行」。请分析这个方案的问题，并给出更稳妥的做法。

<details>
<summary>答案与解析</summary>

**参考答案：**

**1. 核心问题：把 off-policy 数据当 on-policy 用**
- PPO 比率 $\rho=\pi_\theta/\pi_{\text{old}}$ 中的 $\pi_{\text{old}}$ 必须是**真正生成这条样本的策略**（行为策略）。用当前策略重算 old_logp，比率一开始恒为 1，相当于假装旧样本来自当前策略：重要性修正没了，梯度有偏，裁剪也失去参照，无法限制相对行为策略的偏移。
- 优势也过期了：旧样本的优势是用当时的 critic、按当时的策略算的，对当前策略并不成立；即使重算也只是近似。

**2. 即使保存了正确的行为策略 log-prob**：10 步之前的数据比率可能远离 1，一部分 token 被裁剪、梯度为 0，白白浪费；另一部分比率很大，方差爆炸。数据越旧越严重。

**3. 更稳妥的做法**
1. **限制陈旧度**：只允许 1～2 步的滞后（类似异步 RL 中「落后一步」的流水线），保存生成时的 log-prob，并监控比率分布、裁剪比例与近似 KL。
2. **截断重要性权重**：对行为策略与当前策略之间的比率做截断（V-trace、Retrace 一类思路），用少量偏差换取可控的方差。
3. **按陈旧度加权或丢弃**：越旧的样本权重越低，超过阈值直接丢弃。
4. **从系统上降低生成成本**：用高效推理引擎（连续批处理、前缀缓存）、合理设置生成长度上限、让生成与训练流水线重叠，而不是复用太旧的数据。
5. **对照验证**：与严格 on-policy 的基线比较奖励曲线、KL 与评测指标，确认复用数据没有带来退化。

**评分要点（共 10 分）：**

- 指出 old_logp 必须来自行为策略，用当前策略重算会让比率恒为 1、丢失修正（3 分）
- 说明旧数据比率远离 1 会导致大量裁剪或方差爆炸，以及优势过期的问题（3 分）
- 给出限制陈旧度、截断重要性权重、按陈旧度加权或丢弃等方案（2 分）
- 提到监控指标、从系统层面降低生成成本或做对照验证（2 分）

**讲解：**

**常见失分点**：认为「PPO 有裁剪，就能随便用旧数据」；没发现用当前策略重算 old_logp 会让比率恒为 1；只说「off-policy 不行」，给不出可落地的折中方案；忽略了优势估计同样会过期。

<sub>考点：On-policy与Off-policy、重要性采样、PPO裁剪</sub>

</details>

---
