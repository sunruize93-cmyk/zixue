<h1 align="center">Zixue (自学)</h1>

<p align="center">
  <b>AI-powered study plan generator for international students.</b><br>
  <b>面向留学生的 AI 学习计划生成器。</b><br><br>
  <i>No more information gaps. · 消除留学生的信息差.</i>
</p>

<p align="center">
  Inspired by · 灵感来源于
  <a href="https://github.com/PKUanonym/REKCARC-TSC-UHT">REKCARC-TSC-UHT</a>
</p>

<p align="center">
  <a href="#english">English</a> · <a href="#中文">中文</a>
</p>

---

<a name="english"></a>

## English

### The problem

International students lose an enormous amount of time to an invisible barrier: the **information gap**. Local students inherit years of accumulated knowledge about how a course really works — which professors test which topics, how past exams are structured, what the unwritten expectations are, and where to focus. International students often arrive with none of that context, in a second language, and rebuild it from scratch every semester. Zixue closes that gap: you give it what you have — a syllabus, past exams, lecture notes — and an AI advisor turns it into a concrete, week-by-week study plan, in **both English and Chinese**.

### How the cost model works (important)

Generating a plan calls a large language model, which costs money. So Zixue is built like a **shared library**, exactly in the spirit of REKCARC-TSC-UHT:

> A course is generated **once** — that single time calls the API. The plan is then stored in a shared library. Everyone who looks up the same course afterwards reads it from the library **for free, with no API call.**

This keeps cost under control while letting the community's knowledge compound.

### Features

- 📄 **Document-aware** — upload a syllabus, past exams, and lecture notes; the plan is built from your actual materials.
- 🔍 **Exam pattern analysis** — when past exams are provided, the AI identifies recurring question types and frequently tested topics and weights your plan toward them.
- 🌏 **Bilingual output** — every plan is generated in both English and Simplified Chinese.
- 🗓️ **Week-by-week structure** — topics, concrete study actions, and time budgets per week.
- 📚 **Shared library** — generated plans are saved and browsable; reopening one never calls the API.
- 🏆 **University leaderboard** — see which universities' communities have contributed the most plans.
- ✍️ **Contributor credits** — every plan shows who contributed it.
- 🔒 **Privacy-first** — uploaded files are parsed in memory and discarded; only the generated plan text is stored.

### How it works

1. **Input** — enter course details: university, course code, course name, department, professor, semester.
2. **Upload** — attach PDFs (syllabus / past exam / lecture notes), each labeled by type.
3. **Get your plan** — Zixue returns a structured, bilingual weekly plan. If the course is already in the library, you get it instantly and for free.

### Tech stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Backend  | FastAPI · pdfplumber (in-memory PDF parsing) · SQLite   |
| AI       | Claude (`claude-sonnet-4-6`) via the Anthropic SDK      |
| Frontend | React + Vite · react-markdown                           |

### Getting started

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then add your ANTHROPIC_API_KEY
uvicorn main:app --reload --env-file .env   # http://localhost:8000
```

The SQLite database (`backend/zixue.db`) is created automatically on first run.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env          # optional — defaults to http://localhost:8000
npm run dev                   # http://localhost:5173
```

Open http://localhost:5173, fill in your course details, upload your PDFs, and generate your plan. Browse the **Library** and **Leaderboard** tabs to explore community contributions.

### Privacy

Uploaded files are **never written to disk and never stored**. Each PDF is read into memory, parsed for text, and discarded within the request. The generated **plan text** is stored in the shared library so it can be reused without re-calling the API.

### Contributing

Zixue gets better the more course knowledge the community pools. Contributions are welcome — open an issue or a PR. When you generate a plan, add your **contributor username** so your work is credited at the bottom of the plan and counts toward your university on the leaderboard.

### License

[MIT](LICENSE)

---

<a name="中文"></a>

## 中文

### 我们要解决的问题

留学生有大量时间消耗在一道无形的壁垒上——**信息差**。本地学生积累了多年的"潜规则":哪位教授爱考哪些内容、往年考试怎么出、课程不成文的期望是什么、该把精力放在哪。留学生往往什么都没有,还要用第二语言、每学期从零重建这些信息。Zixue 就是来消除这道信息差的:你把手头有的资料——教学大纲、往年试卷、课堂笔记——交给它,AI 顾问会生成一份具体的、按周划分的学习计划,而且**中英双语**。

### 费用机制(重要)

生成计划需要调用大语言模型,是要花钱的。所以 Zixue 的设计完全沿用了 REKCARC-TSC-UHT 的思路——做成一个**共享合集**:

> 同一门课只在**第一次**被生成时调用一次 API,生成后存进共享合集。之后任何人查这门课,都是直接从合集里读取,**完全免费、不再调用 API。**

这样既能把费用控制住,又能让社区的知识不断积累、复利增长。

### 功能特性

- 📄 **基于文档** —— 上传教学大纲、往年试卷、课堂笔记,计划完全基于你的真实资料生成。
- 🔍 **考试规律分析** —— 提供往年试卷时,AI 会识别反复出现的题型与高频考点,并据此调整计划的侧重。
- 🌏 **双语输出** —— 每份计划同时给出英文和简体中文。
- 🗓️ **按周划分** —— 每周给出学习主题、具体行动和时间预算。
- 📚 **共享合集** —— 生成过的计划都会被保存、可浏览;再次打开不消耗任何 API。
- 🏆 **大学榜单** —— 查看哪些大学的社区贡献的计划最多。
- ✍️ **贡献者署名** —— 每份计划都显示是谁贡献的。
- 🔒 **隐私优先** —— 上传的文件在内存中解析后立即丢弃,只保存生成的计划文本。

### 使用流程

1. **填写信息** —— 输入课程信息:大学、课程代码、课程名称、院系、教授、学期。
2. **上传文件** —— 上传 PDF(大纲 / 往年试卷 / 课堂笔记),并给每份标注类型。
3. **获取计划** —— Zixue 返回结构化的双语周计划。如果该课程已在合集中,会立即免费返回。

### 技术栈

| 层级   | 技术                                                      |
| ------ | --------------------------------------------------------- |
| 后端   | FastAPI · pdfplumber(内存中解析 PDF)· SQLite             |
| AI     | Claude(`claude-sonnet-4-6`),通过 Anthropic SDK 调用      |
| 前端   | React + Vite · react-markdown                             |

### 快速开始

**后端**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # 然后填入你的 ANTHROPIC_API_KEY
uvicorn main:app --reload --env-file .env   # http://localhost:8000
```

SQLite 数据库(`backend/zixue.db`)会在首次运行时自动创建。

**前端**

```bash
cd frontend
npm install
cp .env.example .env          # 可选,默认指向 http://localhost:8000
npm run dev                   # http://localhost:5173
```

打开 http://localhost:5173,填写课程信息、上传 PDF、生成计划。点 **Library(合集)** 和 **Leaderboard(榜单)** 标签可以浏览社区贡献。

### 隐私说明

上传的文件**不会写入磁盘、不会被保存**。每份 PDF 都在内存中读取、解析出文本后立即丢弃。只有生成的**计划文本**会被存入共享合集,以便复用而无需再次调用 API。

### 参与贡献

社区汇集的课程知识越多,Zixue 就越好用。欢迎贡献——提 issue 或 PR 都可以。生成计划时填上你的**贡献者用户名**,你的名字会显示在计划底部,并为你所在的大学在榜单上计入一次贡献。

### 许可证

[MIT](LICENSE)
