# Interpretable Context Methodology: Folder Structure as Agent Architecture

**JAKE VAN CLIEF, DAVID MCDERMOTT**  
Eduba, University of Edinburgh, USA

---

## Abstract

Current approaches to AI agent orchestration typically involve building multi-agent frameworks that manage context passing, memory, error handling, and step coordination through code. These frameworks work well for complex, concurrent systems. But for sequential workflows where a human reviews output at each step, they introduce engineering overhead that the problem does not require. This paper presents **Model Workspace Protocol (MWP)**, a method that replaces framework-level orchestration with filesystem structure. Numbered folders represent stages. Plain markdown files carry the prompts and context that tell a single AI agent what role to play at each step. Local scripts handle the mechanical work that does not need AI at all. The result is a system where one agent, reading the right files at the right moment, does the work that would otherwise require a multi-agent framework. This approach applies ideas from Unix pipeline design, modular decomposition, multi-pass compilation, and literate programming to the specific problem of structuring context for AI agents. The protocol is open source under the MIT license.

**CCS Concepts:** Human-centered computing → Interactive systems and tools; HCI design and evaluation methods; Computing methodologies → Artificial intelligence; Software and its engineering → Software design engineering.

**Keywords:** context engineering, human-AI interaction, AI agent orchestration, filesystem architecture, human-in-the-loop, mixed-initiative systems, workflow automation

---

## 1. Introduction

There are genuinely good agentic frameworks available today. CrewAI, LangChain, AutoGen, and others handle multi-step orchestration, memory management, tool use, and error recovery. They work. But they work within their own structures, and adjusting those structures requires development work. Changing the order of steps, swapping a prompt, adding or removing a stage, skipping something that is not relevant today: these actions typically mean editing code, understanding abstractions, and redeploying. For practitioners whose workflows are sequential and need human review at each step, the control surface can be much simpler.

This paper describes Model Workspace Protocol (MWP), a method for orchestrating AI agent workflows using folder structure, markdown files, and local scripts. The central observation is straightforward: if the prompts and context for each stage of a workflow already exist as files in a well-organized folder hierarchy, you do not need a coordination framework to manage multiple specialized agents. You need one orchestrating agent that reads the right files at the right moment. The folder structure tells it what to do at each step, and if the agent delegates sub-tasks, the same folder structure determines what context those sub-agents receive. Local Python scripts handle the parts that do not need AI: fetching data, moving files, formatting output, sending emails.

This is going backward before going forward. The principles that made Unix pipelines effective in the 1970s and multi-pass compilers tractable in the 1980s apply directly to AI agent orchestration in the 2020s. MWP applies those principles to the specific challenge of structuring context for language models.

The central question this paper examines is how structuring the context delivery mechanism as a filesystem hierarchy affects practitioners' ability to control, inspect, and edit AI agent behavior across multi-step workflows, and what this structure means for the quality of the model's output at each stage.

**Comparison of control surfaces for sequential, human-reviewed workflows:**

| Dimension | Framework approach | MWP approach |
|---|---|---|
| Change stage order | Edit orchestration code, redeploy | Rename or reorder folders |
| Modify a prompt | Edit agent configuration in code | Edit a markdown file |
| Add or remove a stage | Write new agent class, update orchestrator | Add or delete a folder |
| Inspect intermediate state | Add logging, build dashboard | Open the folder, read the files |
| Hand off to another person | Document environment, dependencies, setup | Copy the folder |
| Who can make changes | Developer | Anyone with a text editor |
| Error recovery mid-pipeline | Built-in retry, fallback, exception handling | Manual re-run of failed stage |
| Conditional branching | Programmatic routing based on agent output | Human decides between stages |
| Concurrent execution | Native parallel agent coordination | Sequential by design |
| External service integration | Programmatic API calls, auth management | Local scripts or MCP connections |

*The first six rows show dimensions where MWP's filesystem approach simplifies common operations. The last four rows show dimensions where framework-based approaches provide capabilities that MWP lacks or handles less well.*

---

## 2. Background and Related Work

### 2.1 Composability and the Unix Tradition

In 1978, Doug McIlroy articulated the principles that would define Unix's design philosophy: make each program do one thing well, expect the output of every program to become the input to another, and use text streams as the universal interface between programs. These principles were not theoretical. They were engineering decisions driven by constraints.

Kernighan and Pike later argued that the power of a Unix system comes more from the relationships among programs than from the programs themselves. Eric Raymond codified this into explicit design rules: the Rule of Modularity (write simple parts connected by clean interfaces), the Rule of Transparency (design for visibility to make inspection and debugging easier), and the Rule of Composition (design programs to be connected to other programs).

These principles were formalized in software architecture as the "pipe-and-filter" pattern by Shaw and Garlan: a system of independent components, each reading from inputs and writing to outputs, connected by data streams. The pattern's strength is that any component can be replaced, inspected, or tested independently.

A related lineage runs through build systems. Stuart Feldman's Make (1979) established that workflows could be defined as dependency graphs between files using declarative specifications. The key insight: files are both the artifacts of work and the coordination mechanism between stages. Multi-pass compilers work on the same principle: source code transforms through a sequence of intermediate representations, each pass reading the output of the previous pass, with well-defined interfaces between them.

David Parnas argued in 1972 that systems should be decomposed based on what each module hides from the rest of the system, yielding components that can be modified independently. Edsger Dijkstra coined the term "separation of concerns" to describe the discipline of addressing one thing at a time.

These ideas appear across decades and contexts because they describe something real about how systems stay manageable as they grow. They are relevant here because the problem of orchestrating AI agents through multi-step workflows is, at its core, a problem of modular decomposition, clean interfaces, and readable intermediate representations.

### 2.2 Context Engineering and Agentic AI

The practitioner community has increasingly adopted the term "context engineering" to describe what building production AI systems actually involves. Andrej Karpathy gave the term its clearest articulation in June 2025, arguing that "prompt engineering" understates the work. The distinction is useful. Prompt engineering suggests crafting a single instruction. Context engineering describes the broader discipline of filling the context window with the right information: instructions, retrieved knowledge, memory, tool descriptions, and prior outputs, all structured so the model can use them effectively.

Lance Martin at LangChain formalized this into a taxonomy of strategies: write (author instructions), select (choose relevant context), compress (reduce token waste), and isolate (keep unrelated context separate). Simon Willison argued that the entire information environment, including previous model responses and system state, is part of the context that needs engineering.

The current generation of agentic frameworks — LangChain, AutoGen, CrewAI, and others — handle context engineering through code-level abstractions. They define agents as objects, conversations as message arrays, and orchestration as programmatic control flow. This works well for systems that need dynamic multi-agent collaboration, concurrent execution, or complex branching logic.

But for sequential workflows, these frameworks solve a coordination problem that may not need to exist. If Agent A's job is to research, Agent B's job is to filter, and Agent C's job is to write, the framework's role is to pass the right context to the right agent at the right time. That coordination can also be achieved by putting the right files in the right folders. The orchestrating agent reads different instructions at each stage. If it delegates sub-tasks to smaller models, the folder structure provides the context for those delegations too.

This matters because of how language models handle context. Liu et al. demonstrated that LLMs perform significantly worse when relevant information is buried in the middle of long contexts. The more irrelevant material in the context window, the worse the model performs on the material that matters. Stage-specific context loading — where each stage only sees the files it needs — prevents the problem rather than treating it after the fact.

It is worth distinguishing MWP from Anthropic's Model Context Protocol (MCP). MCP standardizes how models access external tools and data sources, solving the integration problem between AI systems and the services they need to call. MWP addresses a different layer: how to structure and deliver context to an agent across a multi-stage workflow. The two are complementary. An MWP stage might use MCP connections to access external services, while the stage's folder structure determines what context the agent receives when doing so.

### 2.3 Human Oversight and Observability

The question of how humans should relate to automated systems has been studied for decades, and the findings are remarkably consistent.

Fails and Olsen introduced the interactive machine learning paradigm in 2003: rapid cycles of system output, human feedback, and correction. Amershi et al. argued that interactive ML must involve users at all stages, from training through evaluation, with interfaces that support steering and correction. Dudley and Kristensson's review of interface design for interactive ML emphasized that transparent, inspectable representations are essential for effective human-AI collaboration.

Eric Horvitz's work on mixed-initiative systems established principles for coupling automated services with human control. The key insight: systems should let users invoke, adjust, and terminate automated processes at natural breakpoints. This requires that the system's state be visible and its actions be reversible.

Parasuraman and Riley identified the failure modes that emerge when this goes wrong. When automated outputs are opaque, people either trust them blindly (misuse) or stop using them entirely (disuse). Both failures stem from the same cause: the human cannot see what happened between input and output.

Ben Shneiderman synthesized these threads into the Human-Centered AI framework, arguing that systems can achieve both high human control and high automation simultaneously. The two are not in tension. They reinforce each other when the system is designed to be comprehensible, predictable, and controllable.

Cynthia Rudin made the most forceful version of this argument: stop building opaque systems and then trying to explain them after the fact. Build systems that are inherently interpretable. This applies at the workflow level as much as at the model level. A production pipeline where every intermediate output is a readable file is inherently interpretable. There is nothing to explain because nothing was hidden.

This is also becoming a regulatory concern. The EU AI Act requires human oversight of high-risk AI systems, distinguishing between human-in-the-loop, human-on-the-loop, and human-in-command approaches.

---

## 3. Model Workspace Protocol

### 3.1 Design Principles

MWP is built on five principles, each borrowed from established practice.

**One stage, one job.** Each stage in a workspace handles a single step of the workflow and writes its output to its own folder. A stage that fetches data does not also filter it. A stage that filters does not also format the final output. Each stage reads a defined input, transforms it, and writes a defined output.

**Plain text as the interface.** Stages communicate through markdown and JSON files. No binary formats, no database connections, no proprietary serialization. Any tool that can read a text file can participate in the workflow. Any human who can open a text editor can inspect or modify any artifact.

**Layered context loading.** Agents load only the context they need for the current stage. Within the content layers, MWP further distinguishes between reference material (stable rules and conventions that persist across runs) and working artifacts (per-run content that changes every time). The model receives these as structurally separate context, which matters because they require different kinds of attention: reference material should be internalized as constraints, while working artifacts should be processed as input.

**Every output is an edit surface.** The intermediate output of each stage is a file a human can open, read, edit, and save before the next stage runs.

**Configure the factory, not the product.** A workspace is set up once with the user's preferences, brand, style, and structural decisions. After that, each run of the pipeline produces a new deliverable using the same configuration.

### 3.2 Architecture

An MWP workspace is a folder. Inside it, agents navigate a **five-layer context hierarchy**:

```
Layer 0: CLAUDE.md          (~800 tok)   "Where am I?"        Structural (routing)
Layer 1: CONTEXT.md         (~300 tok)   "Where do I go?"     Structural (routing)
Layer 2: Stage CONTEXT.md   (200–500 tok) "What do I do?"     Structural (routing)
Layer 3: Reference material (500–2k tok) "What rules apply?"  Content (factory)
Layer 4: Working artifacts  (varies)     "What am I working with?" Content (product)
```

**Layer 0** is the global identity file. It tells the agent which workspace it is in, what the folder structure contains, and where to find things. **Layer 1** is workspace-level task routing: given what the user wants to do, which stage handles it, and what shared resources exist across stages. **Layer 2** is stage-specific: the contract that defines inputs, process, and outputs for one step of the workflow.

**Layer 3 is reference material:** design systems, voice rules, build conventions, style guides, domain knowledge. These files are configured once during workspace setup and remain stable across every run of the pipeline. They are **the factory**.

**Layer 4 is working artifacts:** the output of the previous stage, user-provided source material, anything specific to this particular run. These files are produced and consumed during execution and change every time. They are **the product**.

| | Layer 3: Reference | Layer 4: Working |
|---|---|---|
| Changes between runs | No | Yes |
| Example files | voice.md, conventions.md | research-output.md, script-draft.md |
| Model should | Internalize as constraints | Process as input |
| Configured during | Workspace setup (once) | Pipeline execution (each run) |
| Folder location | references/, _config/, shared/ | output/ |
| Analogy | The recipe | The ingredients |

**Typical workspace folder structure:**

```
workspace/
  CLAUDE.md                Layer 0
  CONTEXT.md               Layer 1
  stages/
    01_research/
      CONTEXT.md           Layer 2
      references/          Layer 3
      output/              Layer 4
    02_script/
      CONTEXT.md           Layer 2
      references/          Layer 3
      output/              Layer 4
    03_production/
      CONTEXT.md           Layer 2
      references/          Layer 3
      output/              Layer 4
  _config/
    shared/                Layer 3
  setup/
    questionnaire.md
```

This is the filesystem doing the work that a framework would otherwise do in code. Stage sequencing is the folder numbering. Context scoping is the folder hierarchy. State management is the files on disk. Coordination between stages is one folder's output being another folder's input.

**Typical context window per stage:** Layers 0–2 together contribute roughly 1,300–1,600 tokens. Layer 3 adds 500–2,000 tokens. Layer 4 adds the working material for this run, rarely exceeding a few thousand tokens when the previous stage has done its job of condensing. Total: **2,000–8,000 tokens per stage**. A monolithic approach can easily reach 30,000–50,000 tokens.

### 3.3 Stage Contracts and Handoffs

Each stage defines a contract with three parts: what it reads (inputs), what it does (process), and what it writes (outputs). This contract is spelled out in the stage's CONTEXT.md file.

**A typical stage contract:**

```markdown
## Inputs
- Layer 4 (working): ../01_research/output/
- Layer 3 (reference): ../../_config/voice.md
- Layer 3 (reference): references/structure.md

## Process
Write a script based on the research output. Follow the structure in structure.md. Match the tone described in voice.md.

## Outputs
- script_draft.md -> output/
```

The Inputs table distinguishes between Layer 3 files (reference material that stays the same every run) and Layer 4 files (working artifacts from this specific run). The agent reads the CONTEXT.md, follows the instructions, and writes its output. The human reviews what landed in output/. If it needs adjustment, the human edits the file directly. The next stage reads whatever is there.

This implements prompt chaining at the filesystem level. The stage outputs serve as intermediate representations: each one is a complete, readable artifact that captures the work done so far and provides everything the next stage needs to continue.

**Pipeline flow:**

```
Stage 1 → [human review gate] → Stage 2 → [human review gate] → Stage 3
output/                         output/                          output/
```

At each boundary, the human can inspect and edit the output before the next stage reads it. The same model executes every stage; the folder structure controls what context it receives.

### 3.4 Portability and Reproducibility

A workspace is a folder. It can be copied to another machine, committed to Git, emailed as a zip file, or synced through any cloud storage service. It carries its own prompts, its own context structure, its own stage definitions. There is no server to configure, no environment to replicate, no deployment step.

MWP workspaces are Git-compatible by default. Every change to a prompt, every edit to a stage output, every configuration adjustment is diffable and reversible. Stage outputs can be committed after each run, creating a version history of the entire production pipeline's behavior over time.

If a consultant builds a workspace for a client's weekly reporting workflow, handing it over means copying a folder. The client can run it, edit the prompts to match their evolving needs, and adjust stages without involving a developer.

---

## 4. Working Implementations

### 4.1 Model and Environment

All workspaces described here were developed and run using Claude Code with Claude Opus 4.6 as the primary agent. For sub-agent tasks within stages, Opus 4.6 delegates to Claude Sonnet 4.6 through its Agent Teams capability.

A detail worth noting: Opus 4.6 uses the workspace's own context files — the CONTEXT.md hierarchy and Layer 3 reference material — to fill prompts for its sub-agents. The model reads the folder structure to determine what context each sub-agent should receive and what task it should perform. The folder hierarchy is both the human's control surface and the model's orchestration logic.

MWP is designed to be model-agnostic. The protocol specifies folder structure, file formats, and naming conventions. It does not depend on any model-specific capability.

### 4.2 Script-to-Animation Pipeline

The first workspace takes a content idea through three stages to produce a working animated video.

- **Stage 1 (01_research)** — takes a topic and produces structured research output
- **Stage 2 (02_script)** — reads the research output and writes a script, guided by voice and structural reference files
- **Stage 3 (03_production)** — reads the finished script and produces animation specifications and working Remotion code

At each stage boundary, the human reviews the output. A research document that misses an important angle gets edited before the script stage runs. A script that runs too long gets trimmed before the production stage sees it.

### 4.3 Course Deck Production

A second workspace takes unstructured source material (PDFs, papers, lecture notes) and produces polished PowerPoint slide decks through five stages: content extraction, structural planning, slide drafting, visual design specification, and final assembly.

The five-stage structure matters because human judgment is essential at several points. The structural plan (stage 2 output) determines the entire arc of the presentation. By surfacing the structural plan as an editable markdown file before any slides are drafted, MWP lets the human course-correct at the point where correction is cheapest.

### 4.4 Building New Workspaces

MWP includes a workspace-builder: a five-stage workspace whose output is a new workspace. It walks through discovery, stage mapping, scaffolding, questionnaire design, and validation.

This means practitioners can create new workspaces for their own domains without understanding the underlying conventions in detail. The builder encodes the conventions into its process.

### 4.5 Early Practitioner Experience

MWP has been used in production across content creation, training material development, research analysis, and policy workflows. Observations come from an invite-only practitioner community of 52 members ranging from AI engineers to business owners, content creators, and academic researchers.

**Intervention pattern (U-shape):** Across 33 community members, 30 report heavy editing at stage 1 (direction-setting), light editing at middle stages, and heavy editing again at the final stage (aligning output with earlier decisions). Stage 1 editing is creative judgment. Final-stage editing is closer to debugging — tracing a misalignment in the output back through the pipeline to find where it diverged.

**Prompt editing by non-technical users:** Non-technical users have successfully modified stage behavior by editing the markdown CONTEXT.md files — adjusting tone instructions, adding constraints, reordering emphasis. These edits would be equivalent to modifying agent configuration in a framework-based system, a task that typically requires a developer.

**Workspace duplication:** Users who have a working workspace for one content format duplicate the folder, modify the stage prompts to target a different format, and run the new workspace without rebuilding from scratch.

### 4.6 Threats to Validity

Data collection has been informal: observations come from ongoing conversations rather than structured interviews or instrumented usage logging. The community is invite-only and self-selected. No controlled comparison has been conducted between MWP's staged context loading and a monolithic prompting approach on the same tasks. All testing was conducted using a single model family (Claude Opus 4.6 and Sonnet 4.6).

---

## 5. Discussion

### 5.1 Where This Works

MWP handles sequential multi-step workflows where a human reviews output at each stage. The common thread: workflows are sequential (step 2 follows step 1), reviewable (a human should check each step's output), and repeatable (the same pipeline runs regularly with different input).

Applied to: content production pipelines, training material development, academic research workflows, policy analysis.

### 5.2 Where This Does Not Work

- **Real-time multi-agent collaboration** — requires message-passing infrastructure that MWP's file-based handoffs are too slow to support
- **High-concurrency systems** — MWP is local-first by design; scaling to concurrent users requires infrastructure MWP was designed to avoid
- **Complex automated branching** — automated branching based on AI decisions mid-pipeline would require scripting that moves MWP toward being a framework itself

### 5.3 Observability as a Side Effect

The most useful property of MWP may be one that was not designed as a feature. Because every intermediate output is a plain file, the system is observable by default. There is no logging layer to build, no dashboard to configure, no special tooling to inspect pipeline state. You open a folder and read the files.

MWP is a glass-box AI workflow. It did not become transparent through the addition of an explanation layer. It was never opaque in the first place, because every artifact is a plain-text file that a human can read.

The EU AI Act's human oversight requirements emphasize staged review, audit trails, and defined intervention points. MWP produces these as a byproduct of its architecture.

### 5.4 Implications for Intelligent System Design

The core mechanism is context scoping. By delivering different context to the same model at each stage, MWP changes the task the model is performing. The model's capabilities do not change between stages. What changes is the information it has available.

The Layer 3/Layer 4 distinction adds a further dimension. Reference material (Layer 3) and working artifacts (Layer 4) ask different things of the model. Reference material says: here are the rules, follow them. Working artifacts say: here is the input, transform it. Delivering these as structurally separate context gives the model clearer signals about which information constrains its behavior and which information it should act on.

---

## 6. Future Directions

### 6.1 MWP as Multi-Pass Incremental Compilation

A multi-pass compiler transforms source code through a sequence of discrete passes. The lexer produces tokens. The parser produces a syntax tree. Semantic analysis annotates the tree. Optimization passes rewrite it. Code generation produces the final output. Each pass reads the output of the previous pass, transforms it according to its own rules, and writes an intermediate representation.

MWP does the same thing with content. Each stage reads the previous stage's output, applies its own context and instructions, and writes an intermediate artifact that the next stage consumes. The intermediate artifacts are plain files that can be opened, read, and edited.

**Incremental compilation:** if the research output is fine but the script needs rework, the practitioner re-runs stage 2 without touching stage 1. If a voice guide in the reference material changes, only the stages that load that file need to run again.

### 6.2 Toward Semantic Debugging

MWP currently provides observability but not traceability. A practitioner can open any stage's output folder and read what the agent produced. But if a phrase in the stage 3 output sounds wrong, there is no direct way to trace that phrase back to the specific instruction, reference file, or previous stage output that caused it.

**Directions being explored:**

- **Output provenance through identifiers** — embedding lightweight markers in stage output files that reference specific sections of the stage's CONTEXT.md or Layer 3 reference files
- **Cross-stage trace verification** — a Verify section in stage contracts specifying which earlier stage outputs should be checked for consistency before the human reviews
- **Breakpoints in markdown** — pausing after specific instructions to let the practitioner verify that the agent interpreted a constraint correctly before continuing

### 6.3 Source Integrity and the Edit-Source Principle

If a practitioner consistently tightens the opening paragraph, that is a signal that the stage contract should say "keep the opening under three sentences." If the tone drifts formal every time, that is a signal that the voice guide needs a stronger example. These recurring edits are debugging information. They point to fixable source-level problems.

A future version of MWP could track output edits across runs. If a practitioner edits the same kind of thing in the same stage's output three runs in a row, the system could surface that pattern and suggest a source-level change: a contract amendment, a reference file update, a new constraint. This would turn one-off fixes into durable system improvements.

---

## 7. Conclusion

The principles that made Unix pipelines effective in the 1970s apply to AI agent orchestration in the 2020s. Programs that do one thing. Output of one becomes input of another. Plain text as universal interface. Human-readable intermediate state.

MWP applies these principles to a specific problem: structuring context for AI agents across multi-step workflows. The result is a system where the folder structure replaces the framework. One agent reads different context at each stage rather than multiple agents coordinating through code. Local scripts handle the mechanical work that does not need AI. Every intermediate output is a file a human can read and edit.

For practitioners whose AI workflows are sequential, reviewable, and repeatable, this means full pipeline capability with no framework to learn, no server to maintain, and no developer needed for day-to-day operation. The workspace is a folder. It can be copied, versioned, shared, and edited with a text editor.

The protocol is open source under the MIT license: https://github.com/RinDig/Model-Workspace-Protocol-MWP-

---

## References

[1] M. D. McIlroy, E. N. Pinson, and B. A. Tague, "Unix Time-Sharing System: Foreword," The Bell System Technical Journal, vol. 57, no. 6, part 2, pp. 1902–1903, 1978.

[2] D. M. Ritchie and K. Thompson, "The UNIX Time-Sharing System," Communications of the ACM, vol. 17, no. 7, pp. 365–375, 1974.

[4] E. S. Raymond, The Art of Unix Programming. Addison-Wesley Professional, 2003.

[5] B. W. Kernighan and R. Pike, The UNIX Programming Environment. Prentice Hall, 1984.

[6] M. Shaw and D. Garlan, Software Architecture: Perspectives on an Emerging Discipline. Prentice Hall, 1996.

[7] S. I. Feldman, "Make — A Program for Maintaining Computer Programs," Software: Practice and Experience, vol. 9, no. 4, pp. 255–265, 1979.

[8] E. W. Dijkstra, "On the Role of Scientific Thought," Manuscript EWD447, 1974.

[9] D. L. Parnas, "On the Criteria To Be Used in Decomposing Systems into Modules," Communications of the ACM, vol. 15, no. 12, pp. 1053–1058, 1972.

[10] D. E. Knuth, "Literate Programming," The Computer Journal, vol. 27, no. 2, pp. 97–111, 1984.

[11] R. P. Gabriel, "The Rise of 'Worse is Better'," AI Expert, vol. 6, no. 6, pp. 33–35, 1991.

[12] R. Pike et al., "Plan 9 from Bell Labs," Computing Systems, vol. 8, no. 3, pp. 221–254, 1995.

[13] S. Chacon and B. Straub, Pro Git, 2nd ed. Apress, 2014.

[14] K. Morris, Infrastructure as Code: Dynamic Systems for the Cloud Age, 2nd ed. O'Reilly Media, 2021.

[15] J. Humble and D. Farley, Continuous Delivery. Addison-Wesley Professional, 2010.

[16] A. Karpathy, "+1 for 'context engineering' over 'prompt engineering'...," X (formerly Twitter), June 25, 2025.

[17] L. Martin, "Context Engineering," LangChain Blog, July 2, 2025.

[18] S. Willison, "Context Engineering," Simon Willison's Weblog, June 27, 2025.

[20] Q. Wu et al., "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation," COLM 2024, arXiv:2308.08155, August 2023.

[21] H. Chase, LangChain [open-source framework]. First released October 2022.

[23] Anthropic, "Introducing the Model Context Protocol," Anthropic Blog, November 25, 2024.

[24] A. Jones and C. Kelly, "Code Execution with MCP," Anthropic Engineering Blog, 2025.

[25] N. F. Liu et al., "Lost in the Middle: How Language Models Use Long Contexts," Transactions of the Association for Computational Linguistics, vol. 12, pp. 157–173, 2024.

[26] T. Wu, M. Terry, and C. J. Cai, "AI Chains: Transparent and Controllable Human-AI Interaction by Chaining Large Language Model Prompts," CHI '22. ACM, 2022.

[27] J. Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models," NeurIPS 2022.

[31] H. Jiang et al., "LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models," EMNLP 2023.

[34] S. Amershi et al., "Power to the People: The Role of Humans in Interactive Machine Learning," AI Magazine, vol. 35, no. 4, pp. 105–120, 2014.

[35] J. A. Fails and D. R. Olsen, Jr., "Interactive Machine Learning," Proceedings of IUI '03, pp. 39–45. ACM, 2003.

[36] J. J. Dudley and P. O. Kristensson, "A Review of User Interface Design for Interactive Machine Learning," ACM Transactions on Interactive Intelligent Systems, vol. 8, no. 2, 2018.

[37] E. Horvitz, "Principles of Mixed-Initiative User Interfaces," CHI '99, pp. 159–166. ACM, 1999.

[40] J. D. Lee and K. A. See, "Trust in Automation: Designing for Appropriate Reliance," Human Factors, vol. 46, no. 1, pp. 50–80, 2004.

[41] R. Parasuraman and V. Riley, "Humans and Automation: Use, Misuse, Disuse, Abuse," Human Factors, vol. 39, no. 2, pp. 230–253, 1997.

[42] R. Parasuraman, T. B. Sheridan, and C. D. Wickens, "A Model for Types and Levels of Human Interaction with Automation," IEEE Transactions on Systems, Man, and Cybernetics — Part A, vol. 30, no. 3, pp. 286–297, 2000.

[43] B. Shneiderman, "Human-Centered Artificial Intelligence: Reliable, Safe & Trustworthy," International Journal of Human–Computer Interaction, vol. 36, no. 6, pp. 495–504, 2020.

[45] C. Rudin, "Stop Explaining Black Box Machine Learning Models for High Stakes Decisions and Use Interpretable Models Instead," Nature Machine Intelligence, vol. 1, pp. 206–215, 2019.

[47] S. Amershi et al., "Guidelines for Human-AI Interaction," CHI 2019. ACM, 2019.

[49] L. Enqvist, "'Human Oversight' in the EU Artificial Intelligence Act," The Theory and Practice of Legislation, vol. 11, no. 3, 2023.

[50] C. Novelli et al., "Institutionalised Distrust and Human Oversight of Artificial Intelligence," Digital Society, vol. 3, no. 8, 2024.

[52] A. V. Aho, M. S. Lam, R. Sethi, and J. D. Ullman, Compilers: Principles, Techniques, and Tools, 2nd ed. Addison-Wesley, 2006.

[53] A. Zeller, Why Programs Fail: A Guide to Systematic Debugging, 2nd ed. Morgan Kaufmann, 2009.

[54] Anthropic, "Introducing Claude Opus 4.6," Anthropic Blog, February 2026.
