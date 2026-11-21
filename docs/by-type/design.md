# 系统设计题（49 道）

| 编号 | 题目 | 难度 | 考频 |
|---|---|---|---|
| [AGT-APP-024](../AGT/APP.md#AGT-APP-024) | 某集团要为战略与投资部门建设内部的 Deep Research 系统：既要检索外网公… | 挑战 | ★★ |
| [AGT-APP-042](../AGT/APP.md#AGT-APP-042) | 为公司的代码托管平台设计一个 PR 评审 Agent（Code Review Age… | 挑战 | ★★ |
| [AGT-BASE-040](../AGT/BASE.md#AGT-BASE-040) | 设计一个企业「差旅报销审核助手」：员工提交报销单（发票图片、行程、金额、事由），系统… | 挑战 | ★★ |
| [AGT-FW-040](../AGT/FW.md#AGT-FW-040) | 公司希望建设统一的 Agent 开发平台：业务同学可以用低代码方式（类似扣子、Dif… | 挑战 | ★★ |
| [AGT-HARNESS-037](../AGT/HARNESS.md#AGT-HARNESS-037) | 给定一个支持工具调用的大模型 API，请设计一个最小可用、能上线给公司内部团队使用的… | 挑战 | ★★ |
| [AGT-MEM-046](../AGT/MEM.md#AGT-MEM-046) | 为一个面向千万用户的个人助理 Agent 设计记忆系统：既要在单次长对话中保持连贯，… | 挑战 | ★★ |
| [AGT-MULTI-043](../AGT/MULTI.md#AGT-MULTI-043) | 公司有 300 个 Python 微服务仓库，需要统一从 Python 3.8 升级… | 挑战 | ★★ |
| [AGT-PLAN-040](../AGT/PLAN.md#AGT-PLAN-040) | 设计一个「出行比价助手」：用户用一句话提需求（如「下周三从北京去成都出差两天，帮我找… | 挑战 | ★★ |
| [AGT-PROMPT-037](../AGT/PROMPT.md#AGT-PROMPT-037) | 公司有几十个团队在用大模型，提示词散落在各个代码仓库和配置后台里，经常出现「提示词被… | 挑战 | ★★ |
| [AGT-PROTO-030](../AGT/PROTO.md#AGT-PROTO-030) | 公司有几十个团队各自维护 MCP Server（工单、CRM、数据仓库、代码仓库等）… | 挑战 | ★★ |
| [AGT-PROTO-056](../AGT/PROTO.md#AGT-PROTO-056) | 公司的 Agent 平台已经有统一的 MCP 网关，负责鉴权、租户隔离与审计。如今平… | 挑战 | ★★ |
| [AGT-RL-032](../AGT/RL.md#AGT-RL-032) | 为一个航空公司客服 Agent 设计一套 Agentic RL 训练方案。该 Age… | 挑战 | ★★ |
| [AGT-TOOL-045](../AGT/TOOL.md#AGT-TOOL-045) | 公司要做一个「多模型工具调用网关」：上层 Agent 只用一套统一的接口描述工具、发… | 挑战 | ★★ |
| [ALN-PO-040](../ALN/PO.md#ALN-PO-040) | 你负责一个 14B 中文通用助手的后训练对齐。现有资源：一个训好的 SFT 模型；约… | 挑战 | ★★ |
| [ALN-REASON-031](../ALN/REASON.md#ALN-REASON-031) | 公司要在一个 32B 的开源基座上训练一个面向「财务报表分析与计算」的推理模型：任务… | 挑战 | ★★ |
| [ALN-RLHF-038](../ALN/RLHF.md#ALN-RLHF-038) | 你需要在 2 台机器、共 16 张 80 GB GPU 上搭建一套 PPO-RLHF… | 挑战 | ★★ |
| [CS-ALGO-054](../CS/ALGO.md#CS-ALGO-054) | 请设计一个 Agent 工作流的 DAG 执行引擎：规划器（大模型）输出一组带依赖关… | 挑战 | ★★ |
| [CS-SQL-032](../CS/SQL.md#CS-SQL-032) | 为一个企业级知识库问答 Agent（RAG）设计数据存储方案。需求：多租户（约 50… | 挑战 | ★★ |
| [ENG-DESIGN-034](../ENG/DESIGN.md#ENG-DESIGN-034) | 你负责为一款面向企业客户的办公套件设计「知识库问答助手」：员工可以就公司制度、产品文… | 挑战 | ★★★ |
| [ENG-DESIGN-036](../ENG/DESIGN.md#ENG-DESIGN-036) | 为一家约 3,000 名工程师的公司设计内部 Coding Agent 平台。已知：… | 挑战 | ★★★ |
| [ENG-DESIGN-038](../ENG/DESIGN.md#ENG-DESIGN-038) | 设计一个电商 App 内的智能客服 Agent：处理订单查询、物流查询、退换货申请、… | 挑战 | ★★★ |
| [ENG-DESIGN-040](../ENG/DESIGN.md#ENG-DESIGN-040) | 为公司的运营、产品、销售人员设计数据分析 Agent：用自然语言提问业务数据（Tex… | 挑战 | ★★★ |
| [ENG-DESIGN-044](../ENG/DESIGN.md#ENG-DESIGN-044) | 公司有 12 条业务线在调用大模型：有的直连外部 API，有的调用自建的 vLLM … | 挑战 | ★★★ |
| [ENG-DESIGN-046](../ENG/DESIGN.md#ENG-DESIGN-046) | 某内容社区每天新增约 1,000 万条用户内容（帖子与评论，约 20% 带图片）。需… | 挑战 | ★★ |
| [ENG-OBS-037](../ENG/OBS.md#ENG-OBS-037) | 公司有多个 Agent 产品（客服、编码助手、数据分析），各自零散地接入了日志和监控… | 挑战 | ★★★ |
| [ENG-PERF-027](../ENG/PERF.md#ENG-PERF-027) | 请为公司设计一个统一的「LLM 网关」降本方案。现状：大模型费用每月 20 万美元，… | 挑战 | ★★ |
| [ENG-STAB-048](../ENG/STAB.md#ENG-STAB-048) | 请为一个 Agent 任务执行平台设计稳定性方案。已知：每天约 50 万个任务，峰值… | 挑战 | ★★★ |
| [EVL-AGENT-048](../EVL/AGENT.md#EVL-AGENT-048) | 公司有十几个业务团队在开发 Agent（客服、编码、数据分析等），目前各自用脚本评测… | 挑战 | ★★★ |
| [EVL-LLM-040](../EVL/LLM.md#EVL-LLM-040) | 公司要为自研大模型（以及选型时的外部模型）建立一套统一的评测体系，用于训练迭代中的回… | 挑战 | ★★★ |
| [INF-BASE-042](../INF/BASE.md#INF-BASE-042) | 你负责为公司的 LLM 推理平台建立一套性能评测与瓶颈分析体系：既要对比不同引擎与配… | 挑战 | ★★ |
| [INF-KV-040](../INF/KV.md#INF-KV-040) | 你要为一个 Agent 平台设计推理侧的 KV Cache 管理方案。平台特点：同时… | 挑战 | ★★ |
| [INF-SCHED-034](../INF/SCHED.md#INF-SCHED-034) | 一个推理集群需要同时承载三类流量：① 在线聊天（P99 TTFT ≤ 1 s、P99… | 挑战 | ★★ |
| [INF-SERVE-033](../INF/SERVE.md#INF-SERVE-033) | 为一家企业设计私有化的大模型推理平台。需求如下： - 两个底座：8B 对话模型（承担… | 挑战 | ★★ |
| [INF-SPEC-031](../INF/SPEC.md#INF-SPEC-031) | 你负责为公司的代码助手落地投机解码：目标模型 70B，部署在 8×H100 上（张量… | 挑战 | ★ |
| [LLM-ARCH-041](../LLM/ARCH.md#LLM-ARCH-041) | 团队计划从零预训练一个约 7B 参数的中英双语 Decoder-only 基座模型。… | 挑战 | ★★ |
| [LLM-ATTN-051](../LLM/ATTN.md#LLM-ATTN-051) | 你负责为一个约 30B 参数的稠密 Decoder-only 模型设计注意力方案。已… | 挑战 | ★★ |
| [LLM-MM-030](../LLM/MM.md#LLM-MM-030) | 请设计一个电话场景的实时语音客服 Agent：用户说话、模型用语音回答。要求：从用户… | 挑战 | ★★ |
| [LLM-MOE-035](../LLM/MOE.md#LLM-MOE-035) | 你要把一个 7B 稠密模型的配方（32 层，d=4096，GQA 8 个 KV 头，… | 挑战 | ★★ |
| [LLM-TOK-036](../LLM/TOK.md#LLM-TOK-036) | 你负责为一个从零预训练的中英双语、代码能力要求较高的 7B 模型设计分词器。请说明：… | 挑战 | ★★ |
| [RAG-ADV-031](../RAG/ADV.md#RAG-ADV-031) | 为一家券商的研究部门设计「财报问答助手」。数据包括：近 10 年 A 股上市公司的年… | 挑战 | ★★ |
| [RAG-BASE-030](../RAG/BASE.md#RAG-BASE-030) | 你负责为一家 2 万名员工的公司设计「IT 与 HR 知识库问答助手」。已知： - … | 挑战 | ★★★ |
| [RAG-EVAL-031](../RAG/EVAL.md#RAG-EVAL-031) | 你负责一个已上线的企业知识库 RAG 系统（日均约 5 万次提问）。团队每周都会改切… | 挑战 | ★★ |
| [RAG-RETR-040](../RAG/RETR.md#RAG-RETR-040) | 请为一个开发者问答平台设计检索与重排子系统。已知：知识库约 2,000 万个块，来自… | 挑战 | ★★ |
| [TRN-ADAPT-032](../TRN/ADAPT.md#TRN-ADAPT-032) | 某三甲医院希望打造一个面向医生的临床辅助问答系统：需要掌握医学专业知识和院内诊疗规范… | 挑战 | ★★ |
| [TRN-DATA-041](../TRN/DATA.md#TRN-DATA-041) | 请为一个中英双语、约 7B 参数的基座模型设计预训练数据流水线，目标是产出约 3T … | 挑战 | ★★★ |
| [TRN-DIST-048](../TRN/DIST.md#TRN-DIST-048) | 为一个 70B 稠密模型设计预训练的并行方案。模型：80 层，隐藏维度 8192，6… | 挑战 | ★★★ |
| [TRN-PEFT-039](../TRN/PEFT.md#TRN-PEFT-039) | 设计一个面向企业客户的「多租户 LoRA 微调与推理平台」：同一个 8B 底座，预计… | 挑战 | ★★ |
| [TRN-PT-043](../TRN/PT.md#TRN-PT-043) | 你负责一个 7B 模型的从零预训练（计划 8T token，含末期退火与长上下文阶段… | 挑战 | ★★ |
| [TRN-SFT-040](../TRN/SFT.md#TRN-SFT-040) | 你要为一家电商公司从零搭建「客服助手」的 SFT 数据与训练流水线。基座是开源的 8… | 挑战 | ★★★ |
