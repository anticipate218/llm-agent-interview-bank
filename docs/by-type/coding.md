# 编程题（101 道）

| 编号 | 题目 | 难度 | 考频 |
|---|---|---|---|
| [AGT-APP-009](../AGT/APP.md#AGT-APP-009) | 实现编码 Agent 的 search/replace 编辑应用器： - 按整行匹配… | 挑战 | ★★ |
| [AGT-APP-022](../AGT/APP.md#AGT-APP-022) | 实现 Deep Research 引用校验中的「字面检查」： - claim 是报告… | 进阶 | ★★ |
| [AGT-APP-027](../AGT/APP.md#AGT-APP-027) | 用 Python 标准库 html.parser 实现浏览器 Agent 的 DOM… | 挑战 | ★★ |
| [AGT-BASE-041](../AGT/BASE.md#AGT-BASE-041) | 不使用任何 Agent 框架，手写一个最小的 Agent 循环： - llm(mes… | 挑战 | ★★★ |
| [AGT-FW-009](../AGT/FW.md#AGT-FW-009) | 用纯 Python 实现 LangGraph「超步结束时统一合并增量」的语义： - … | 进阶 | ★★ |
| [AGT-HARNESS-019](../AGT/HARNESS.md#AGT-HARNESS-019) | 仿照 Claude Code 的 Bash 权限规则，实现判定函数： - rules… | 挑战 | ★★ |
| [AGT-HARNESS-032](../AGT/HARNESS.md#AGT-HARNESS-032) | 命令输出可能很长，原样回填会撑爆上下文。实现 Harness 中的输出整理函数： 1… | 进阶 | ★★ |
| [AGT-MEM-032](../AGT/MEM.md#AGT-MEM-032) | 实现一个只处理单值关系（如「住在哪里」）的双时间轴事实库。每条记录是一个 dict：… | 挑战 | ★★ |
| [AGT-MEM-043](../AGT/MEM.md#AGT-MEM-043) | 实现记忆系统的级联删除： - records 把记录 id 映射到 {"owner"… | 进阶 | ★★ |
| [AGT-MULTI-026](../AGT/MULTI.md#AGT-MULTI-026) | 实现多 Agent 任务图的状态推演函数： - deps：每个任务 → 它依赖的上游… | 挑战 | ★★ |
| [AGT-MULTI-046](../AGT/MULTI.md#AGT-MULTI-046) | Agent Teams 中，队友通过共享任务列表认领工作。实现一个任务板： - ta… | 挑战 | ★★ |
| [AGT-PLAN-032](../AGT/PLAN.md#AGT-PLAN-032) | 规划器输出了一张任务依赖图。实现 - tasks 把任务 id 映射到它依赖的任务 … | 挑战 | ★★ |
| [AGT-PLAN-043](../AGT/PLAN.md#AGT-PLAN-043) | Agent 的每一步记录为 {"tool": 工具名, "args": 参数 dic… | 挑战 | ★★ |
| [AGT-PROMPT-013](../AGT/PROMPT.md#AGT-PROMPT-013) | 实现 Self-Consistency 的答案抽取、规范化与投票： - 抽取：最终答… | 挑战 | ★★ |
| [AGT-PROMPT-019](../AGT/PROMPT.md#AGT-PROMPT-019) | 模型的输出里常夹着说明文字或 Markdown 代码围栏，需要从中稳健地取出 JSO… | 挑战 | ★★ |
| [AGT-PROTO-035](../AGT/PROTO.md#AGT-PROTO-035) | 实现 A2A 任务状态历史的合法性校验： - states 是一个任务依次经历的状态… | 进阶 | ★★ |
| [AGT-PROTO-054](../AGT/PROTO.md#AGT-PROTO-054) | 平台在技能入库前要做格式检查。按 Agent Skills 规范实现 SKILL.m… | 进阶 | ★★ |
| [AGT-TOOL-037](../AGT/TOOL.md#AGT-TOOL-037) | 运行时要在执行工具前校验模型给出的参数。实现一个 JSON Schema 子集的校验… | 挑战 | ★★ |
| [AGT-TOOL-038](../AGT/TOOL.md#AGT-TOOL-038) | 发请求前，在本地校验 OpenAI Chat Completions 风格消息序列的… | 挑战 | ★★ |
| [AGT-TOOL-047](../AGT/TOOL.md#AGT-TOOL-047) | 实现 Agent 工具层的结果缓存： - specs[tool] 描述每个工具：{"… | 挑战 | ★★ |
| [ALN-GRPO-033](../ALN/GRPO.md#ALN-GRPO-033) | 实现 GRPO 的组内相对优势，并顺带返回监控指标「零方差组比例」： - rewar… | 进阶 | ★★★ |
| [ALN-PO-008](../ALN/PO.md#ALN-PO-008) | 实现从 token 级对数概率计算 DPO 损失与监控指标： | 挑战 | ★★ |
| [ALN-RL-025](../ALN/RL.md#ALN-RL-025) | 用纯 Python 实现带回合边界的 GAE： - 一段 rollout 长度为 T… | 挑战 | ★★★ |
| [ALN-RLHF-012](../ALN/RLHF.md#ALN-RLHF-012) | 实现支持「每个提示词回答条数不同」的排序损失： - 一个提示词有 k 条有效回答时贡… | 挑战 | ★★ |
| [CS-ALGO-009](../CS/ALGO.md#CS-ALGO-009) | 大模型 API 常按「每分钟 token 数（TPM）」限流。实现一个基于滑动日志的… | 进阶 | ★★ |
| [CS-ALGO-010](../CS/ALGO.md#CS-ALGO-010) | 流水线并行要把模型的各层按顺序切成若干个连续的阶段，每个阶段放在一张卡上，流水线的节… | 挑战 | ★★ |
| [CS-ALGO-013](../CS/ALGO.md#CS-ALGO-013) | 模型以流式方式输出工具调用的 JSON 参数，前端希望在生成过程中就能解析、展示「到… | 挑战 | ★★ |
| [CS-ALGO-016](../CS/ALGO.md#CS-ALGO-016) | 统计 Agent 日志中被调用得最多的工具名。实现： - 返回出现次数最多的 k 个… | 进阶 | ★★★ |
| [CS-ALGO-019](../CS/ALGO.md#CS-ALGO-019) | 实现链表的「K 个一组反转」： - 从头开始每 k 个节点反转一次，最后不足 k 个… | 挑战 | ★★★ |
| [CS-ALGO-022](../CS/ALGO.md#CS-ALGO-022) | 实现二叉树中两个节点的最近公共祖先（LCA）： - 普通二叉树（不是二叉搜索树），节… | 进阶 | ★★★ |
| [CS-ALGO-025](../CS/ALGO.md#CS-ALGO-025) | 实现网格中的「岛屿数量」： - grid 是若干等长字符串，'1' 表示陆地、'0'… | 进阶 | ★★★ |
| [CS-ALGO-029](../CS/ALGO.md#CS-ALGO-029) | Agent 规划出一组带依赖的工具调用，执行器的并发数不受限制：一个任务的所有前置任… | 挑战 | ★★ |
| [CS-ALGO-031](../CS/ALGO.md#CS-ALGO-031) | 模型网关要在多个机房之间转发请求，边权为链路时延（ms）。实现带路径还原的 Dijk… | 进阶 | ★★★ |
| [CS-ALGO-034](../CS/ALGO.md#CS-ALGO-034) | 语音识别常用词错误率（WER）评估：WER = (S + D + I) / N，其中… | 进阶 | ★★★ |
| [CS-ALGO-039](../CS/ALGO.md#CS-ALGO-039) | 实现推理服务的 stop 参数：模型输出以文本片段（chunk）的形式陆续到达，一旦… | 挑战 | ★★ |
| [CS-ALGO-045](../CS/ALGO.md#CS-ALGO-045) | 预训练数据按配比混合，例如网页、代码、书籍、论文的权重为 0.6、0.2、0.1、0… | 进阶 | ★★ |
| [CS-ALGO-048](../CS/ALGO.md#CS-ALGO-048) | Embedding 和工具结果缓存通常按占用的字节数限制容量，而不是按条目数。实现按… | 进阶 | ★★★ |
| [CS-ALGO-049](../CS/ALGO.md#CS-ALGO-049) | 实现 O(1) 的 LFU（最不经常使用）缓存： - 每个 key 记录使用次数：新… | 挑战 | ★★ |
| [CS-ALGO-052](../CS/ALGO.md#CS-ALGO-052) | Agent 平台的配置由「默认配置 + 租户覆盖」合并而成，覆盖部分采用 JSON … | 进阶 | ★★ |
| [CS-ALGO-053](../CS/ALGO.md#CS-ALGO-053) | 多轮 Agent 对话超出上下文窗口时，需要按 token 预算截断历史。实现： -… | 挑战 | ★★ |
| [CS-DIST-018](../CS/DIST.md#CS-DIST-018) | 实现带虚拟节点的一致性哈希环，并支持为 key 选出多个副本节点（类似 Dynamo… | 进阶 | ★★ |
| [CS-NET-023](../CS/NET.md#CS-NET-023) | 实现一个增量的 SSE 解析器： - 网络会把字节流切成任意大小的块：可能切在一个汉… | 挑战 | ★★★ |
| [CS-OS-015](../CS/OS.md#CS-OS-015) | 用 threading 的锁与条件变量实现一个线程安全的有界阻塞队列（不得使用 qu… | 进阶 | ★★★ |
| [CS-PY-016](../CS/PY.md#CS-PY-016) | 实现带过期时间的缓存装饰器 ttl_cache(seconds, clock=tim… | 挑战 | ★★ |
| [CS-PY-020](../CS/PY.md#CS-PY-020) | 实现函数 sliding_window(iterable, n)，返回一个惰性迭代器… | 进阶 | ★★ |
| [CS-PY-035](../CS/PY.md#CS-PY-035) | 实现一个限并发的异步调度器： - factories 是一个列表，每个元素都是无参函… | 进阶 | ★★★ |
| [CS-SQL-006](../CS/SQL.md#CS-SQL-006) | 员工表 staff(id INTEGER PRIMARY KEY, name TEX… | 挑战 | ★★ |
| [CS-SQL-012](../CS/SQL.md#CS-SQL-012) | 登录日志表 login(uid INT, d TEXT)，d 为 'YYYY-MM-… | 挑战 | ★★ |
| [CS-SQL-015](../CS/SQL.md#CS-SQL-015) | 表 sales(category TEXT, item TEXT, amount I… | 进阶 | ★★★ |
| [CS-TORCH-034](../CS/TORCH.md#CS-TORCH-034) | 为 SFT 数据实现 DataLoader 的 collate_fn： - batc… | 进阶 | ★★★ |
| [CS-TORCH-041](../CS/TORCH.md#CS-TORCH-041) | 实现带掩码的平均池化（计算句向量时常用）： - h：形状 (B, T, H) 的浮点… | 挑战 | ★★ |
| [ENG-DESIGN-029](../ENG/DESIGN.md#ENG-DESIGN-029) | 实现成功率下跌的切片拆分函数： - before、after：切片名 → (任务数,… | 挑战 | ★★ |
| [ENG-OBS-014](../ENG/OBS.md#ENG-OBS-014) | 为 Agent 的工具调用实现「录制 / 回放」包装器，用于稳定复现线上问题： - … | 挑战 | ★★ |
| [ENG-PERF-013](../ENG/PERF.md#ENG-PERF-013) | 在校准集上为模型路由选阈值。实现： - records 中每一项为 (score, … | 进阶 | ★★ |
| [ENG-STAB-014](../ENG/STAB.md#ENG-STAB-014) | 实现一个同步的重试函数（为了便于测试，等待和随机数都通过参数注入）： - 调用 fn… | 挑战 | ★★ |
| [ENG-STAB-020](../ENG/STAB.md#ENG-STAB-020) | 为扣款接口实现一个单进程的幂等层： - clock 是无参函数，返回当前时间（秒）；… | 挑战 | ★★ |
| [ENG-STAB-032](../ENG/STAB.md#ENG-STAB-032) | 实现一个可注入时钟的令牌桶： - 初始时桶是满的；clock() 返回当前时间（秒）… | 挑战 | ★★ |
| [EVL-AGENT-030](../EVL/AGENT.md#EVL-AGENT-030) | 实现工具调用轨迹的评测函数： - pred、ref 是调用列表，每个调用是 (工具名… | 挑战 | ★★ |
| [EVL-AGENT-038](../EVL/AGENT.md#EVL-AGENT-038) | 实现精确的配对置换检验（符号翻转检验），用于比较两个 Agent 在同一批题上的表现… | 挑战 | ★★ |
| [FND-DL-006](../FND/DL.md#FND-DL-006) | 用 numpy 手写一个单隐层二分类 MLP 的前向与反向传播（不能使用自动微分）：… | 挑战 | ★★★ |
| [FND-ML-016](../FND/ML.md#FND-ML-016) | 实现多分类的 macro-F1（不使用 scikit-learn）： - 类别集合取… | 进阶 | ★★ |
| [FND-ML-020](../FND/ML.md#FND-ML-020) | 用 numpy 实现 AUC： - scores 为模型得分，labels 为 0/… | 进阶 | ★★★ |
| [FND-ML-025](../FND/ML.md#FND-ML-025) | 用 numpy 从零实现二分类逻辑回归（全批量梯度下降）： - X 形状为 (n, … | 进阶 | ★★★ |
| [FND-NLP-031](../FND/NLP.md#FND-NLP-031) | 实现 T5 的片段破坏（span corruption）样本构造： - spans … | 进阶 | ★★ |
| [FND-NLP-034](../FND/NLP.md#FND-NLP-034) | 实现基于最长公共子序列（LCS）的 ROUGE-L： - 精确率 P=\mathrm… | 进阶 | ★★ |
| [FND-NLP-038](../FND/NLP.md#FND-NLP-038) | 用 numpy 实现隐马尔可夫模型（如词性标注）的 Viterbi 解码： - ob… | 挑战 | ★★ |
| [FND-OPT-009](../FND/OPT.md#FND-OPT-009) | 用 numpy 手写 AdamW 的一步更新，语义与 torch.optim.Ada… | 挑战 | ★★★ |
| [INF-BASE-025](../INF/BASE.md#INF-BASE-025) | 实现一个 Decode 批大小估算器： - model：params（参数量）、w_… | 挑战 | ★★ |
| [INF-KV-024](../INF/KV.md#INF-KV-024) | 实现 RadixAttention 中用于前缀匹配的基数树（只需管理 token 序… | 挑战 | ★★ |
| [INF-QUANT-011](../INF/QUANT.md#INF-QUANT-011) | 用 numpy 实现非对称（带零点）量化与反量化： - x 为一维浮点数组；grou… | 进阶 | ★★ |
| [INF-SCHED-010](../INF/SCHED.md#INF-SCHED-010) | 实现连续批处理调度器的「一步」： - 每个请求是一个字典：id、prompt（提示词… | 进阶 | ★★ |
| [INF-SPEC-023](../INF/SPEC.md#INF-SPEC-023) | 实现树形验证（贪心解码）的两个核心函数： - parents[i] 是第 i 个候选… | 挑战 | ★★ |
| [LLM-ARCH-042](../LLM/ARCH.md#LLM-ARCH-042) | 用 numpy 实现一个 Llama 风格 Decoder Block 的前向计算（… | 挑战 | ★★ |
| [LLM-ATTN-010](../LLM/ATTN.md#LLM-ATTN-010) | 用 numpy 实现带因果掩码的多头自注意力前向计算： - x：形状 (T, D)；… | 挑战 | ★★★ |
| [LLM-ATTN-038](../LLM/ATTN.md#LLM-ATTN-038) | 用 numpy 实现因果线性注意力的递推形式： - Q、K 形状 (T, d)，V … | 挑战 | ★★ |
| [LLM-ATTN-048](../LLM/ATTN.md#LLM-ATTN-048) | 用 numpy 实现单个 query 的注意力，但要求分块遍历 K、V（每次只处理 … | 挑战 | ★★ |
| [LLM-ATTN-052](../LLM/ATTN.md#LLM-ATTN-052) | 用 numpy 实现带 key padding 掩码的多头交叉注意力（批量版）： -… | 进阶 | ★★ |
| [LLM-DEC-006](../LLM/DEC.md#LLM-DEC-006) | 用 numpy 实现采样前的概率过滤（按 Hugging Face 的顺序：温度 →… | 挑战 | ★★★ |
| [LLM-MM-004](../LLM/MM.md#LLM-MM-004) | 用 PyTorch 实现 CLIP 的对比损失： - img_emb、txt_emb… | 进阶 | ★★★ |
| [LLM-MOE-006](../LLM/MOE.md#LLM-MOE-006) | 用 numpy 实现一个 MoE 层的前向计算，并同时返回 Switch 式负载均衡… | 挑战 | ★★★ |
| [LLM-POS-013](../LLM/POS.md#LLM-POS-013) | 用 numpy 实现 RoPE，采用 Hugging Face 的 rotate_h… | 挑战 | ★★★ |
| [LLM-TOK-004](../LLM/TOK.md#LLM-TOK-004) | 实现一个最小的字节级 BPE： - 基础单位是 UTF-8 字节（id 为 0～25… | 挑战 | ★★★ |
| [RAG-BASE-024](../RAG/BASE.md#RAG-BASE-024) | 线上 bad case 归因是 RAG 迭代的起点。实现 attribute(cas… | 进阶 | ★★ |
| [RAG-CHUNK-014](../RAG/CHUNK.md#RAG-CHUNK-014) | 实现递归切块： 要求： - 每块长度（按字符计）不超过 size（size = 1）… | 挑战 | ★★★ |
| [RAG-EVAL-021](../RAG/EVAL.md#RAG-EVAL-021) | 实现增量同步的「变更计划」： - index 是当前索引的状态：{doc_id: 该… | 挑战 | ★★ |
| [RAG-QUERY-014](../RAG/QUERY.md#RAG-QUERY-014) | LLM 从问题中抽取出过滤条件后，需要先按白名单清洗，再交给向量库。实现： - ra… | 进阶 | ★★ |
| [RAG-RETR-006](../RAG/RETR.md#RAG-RETR-006) | 从零实现 BM25 检索（文档已经分好词）： - IDF 使用 \ln\left(1… | 挑战 | ★★★ |
| [SEC-AGENT-016](../SEC/AGENT.md#SEC-AGENT-016) | 实现模型输出在渲染前的 URL 检查（图片和链接里的每个 URL 都要过一遍）： -… | 挑战 | ★★ |
| [SEC-AGENT-031](../SEC/AGENT.md#SEC-AGENT-031) | 实现 MCP 工具定义的「钉住」检查，Host 每次拉取工具列表（或收到列表变更通知… | 挑战 | ★★ |
| [SEC-AGENT-043](../SEC/AGENT.md#SEC-AGENT-043) | 实现 Agent 调用前的费用守卫（金额以美分为单位，都是整数）： - 每次工具或模… | 进阶 | ★★ |
| [SEC-DEF-013](../SEC/DEF.md#SEC-DEF-013) | 实现 CaMeL 式的值级污点追踪与发信策略： - Labeled 保存三个属性：v… | 挑战 | ★★ |
| [SEC-INJ-026](../SEC/INJ.md#SEC-INJ-026) | 实现不可信文本进入模型前的「隐藏字符」预处理： - 先对 text 做 NFKC 归… | 挑战 | ★★ |
| [SEC-REL-008](../SEC/REL.md#SEC-REL-008) | 实现离散版的语义熵（semantic entropy），用于判断一个问题的多次采样回… | 进阶 | ★★ |
| [SEC-REL-020](../SEC/REL.md#SEC-REL-020) | 实现写日志前的个人信息脱敏函数： - 身份证号：18 位，前 17 位是数字，最后一… | 进阶 | ★★★ |
| [TRN-ADAPT-025](../TRN/ADAPT.md#TRN-ADAPT-025) | 用 numpy 实现 TIES-Merging 的核心步骤（参数用一维数组表示）： … | 挑战 | ★★ |
| [TRN-DATA-005](../TRN/DATA.md#TRN-DATA-005) | 网页正文里常混有在大量页面中重复出现的模板行（如「版权所有 © 2024」「点击关注… | 进阶 | ★★ |
| [TRN-DATA-013](../TRN/DATA.md#TRN-DATA-013) | 实现 MinHash 签名与 LSH 分桶： - minhash_signature… | 挑战 | ★★ |
| [TRN-DATA-033](../TRN/DATA.md#TRN-DATA-033) | 实现一个简单的 n-gram 污染检测工具： - 文本先转小写，再按空白切分成词（t… | 进阶 | ★★ |
| [TRN-DIST-007](../TRN/DIST.md#TRN-DIST-007) | 用 numpy 在单进程中模拟环形 AllReduce（求和）： - data[i]… | 挑战 | ★★ |
| [TRN-PEFT-007](../TRN/PEFT.md#TRN-PEFT-007) | 用 PyTorch 实现 LoRALinear，包装一个已有的 nn.Linear：… | 挑战 | ★★ |
| [TRN-SFT-024](../TRN/SFT.md#TRN-SFT-024) | 实现 SFT 的 packing： - samples[i] = (input_id… | 挑战 | ★★ |
