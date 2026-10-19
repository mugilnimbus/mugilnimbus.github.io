# Saturn MCP

A local MCP server that keeps long tool output out of a coding agent's context. The agent asks Saturn to run the noisy work; Saturn keeps the raw output locally and returns only what matters, with a reference the agent can query later.

## The problem

Coding agents such as Claude Code or Codex pour raw tool output into their context: test logs, lint reports, whole files. Every tool result is re-read on every later turn.

| Effect | Why it hurts |
| --- | --- |
| Tokens are paid again and again | A 25,000-token lint report is re-read on each turn that follows |
| Context fills up | The conversation is pushed toward compaction |
| The model gets confused | The five lines it needed are buried in noise |

## The solution

Saturn is a proper MCP server running on the local computer, with an optional small local model. The agent calls Saturn instead of running the noisy command itself.

### The five tools

| Tool | What the agent gets |
| --- | --- |
| `saturn_run` | Runs a test, build, lint or read-only git command. Short output comes back unchanged; long output becomes a digest of the failures plus an artifact ID |
| `saturn_read` | A file with line numbers. A long file returns an outline first, then exact line ranges on request |
| `saturn_search` | Regex search across files, capped to a size budget, with counts of what was left out |
| `saturn_ask` | A read-only worker (the small local model) explores files and answers briefly, citing source lines whose existence is checked |
| `saturn_query` | Part of a stored output: by regex, by line range, or by question |

### Size limits

| Setting | Default | Meaning |
| --- | --- | --- |
| Inline limit | 700 tokens | Output up to this size is returned unchanged |
| Digest limit | 450 tokens | The largest digest Saturn returns |
| Artifact lifetime | 48 hours | How long a stored output can be queried |

```text
Coding agent (Claude Code, Codex ...)
   |  MCP call: saturn_run / read / search / ask / query
   v
Saturn (local)
   |
   v
Policy: command parsed without a shell, checked against an allow list;
        files only inside configured folders
   |
   v
Run the command or read the file  -->  raw output
   |
   v
Within 700 tokens? --yes--> returned unchanged
   |
   no
   v
Store the full output as an artifact (48 h)
   |
   v
Digest by code: recognise pytest, linter, compiler, traceback, diff, JSON or log;
                extract, group and count the failures  (no model)
   |
   +-- code can tell what matters --> short digest
   |
   +-- it cannot, or the agent stated a goal -->
          deduplicate and rank the lines, the local model reads short excerpts,
          any line number it cites that does not exist is dropped --> short digest
   |
   v
Digest (at most 450 tokens) + artifact ID  -->  back to the agent
   |
   v
Agent needs a detail?  -->  saturn_query by regex, line range or question
                            returns only that part
```

## Steps

1. **Call.** The coding agent calls a Saturn tool over MCP, through the local `saturn stdio` command or over HTTP, with its own access token.
2. **Check.** Saturn parses the command without a shell and checks it against an allow list. File access is limited to the configured folders.
3. **Run.** Saturn runs the command or reads the file and captures the raw output.
4. **Measure.** If the output is within 700 tokens, it goes back unchanged.
5. **Store.** A longer output is kept in full in a local store, under an artifact ID, for 48 hours.
6. **Digest by code.** Saturn recognises the kind of output (pytest, linter, compiler diagnostics, traceback, diff, JSON, log) and extracts, groups and counts what failed. No model is used on this path.
7. **Model only when needed.** If code cannot tell what matters, or the agent's call states a goal, the lines are deduplicated and ranked, and the small local model reads short excerpts. Any line number it cites that does not exist is dropped.
8. **Return.** The agent receives a digest of at most 450 tokens, plus the artifact ID and what the stored output contains.
9. **Query on demand.** If the agent needs more, it calls `saturn_query` with the ID and gets back only the part it asked for.
10. **Ask.** For open questions about the code, `saturn_ask` runs a bounded worker loop (LangGraph) in which the local model uses read-only tools, and every source line it cites is checked.

A dashboard shows what was saved, every call with its trace, the stored outputs, and what the local model cost.

## The idea that matters

The expensive model never reads what it does not need. Code does most of the reduction; a small local model helps only when code cannot tell what matters; and the full output is never lost, because it stays queryable by ID.

## Results

| Case | Raw output | Returned | Cut |
| --- | --- | --- | --- |
| pytest, 8 failures in 419 lines | about 8,100 tokens | 219 | 97% |
| ruff, 370 findings in 4,049 lines | about 25,000 tokens | 289 | 99% |
| Log with one anomaly in 2,503 lines | about 52,500 tokens | 89 | 99.8% |

Recorded fixture measurements with `google/gemma-4-e4b` as the local model. Output token counts are estimates (about 3.6 characters per token).

In everyday use, Saturn runs the commands the main agent gives it and records the raw and returned token counts for each call. Across whole tasks this has meant roughly 50% to 60% fewer tokens, depending on the task. The biggest cuts come from large outputs, such as reading a whole file for one piece of information: tens of thousands of tokens reduced to a few hundred.

## Built with

Python 3.12, MCP (stdio and Streamable HTTP), LangChain and LangGraph, any local server with the OpenAI Responses API (developed with LM Studio), SQLite, and a web dashboard built with Vite. Per-client access tokens, stored as hashes. Optional Claude Code hooks hand plain test, build and lint commands to Saturn automatically.

## Animation brief

Clean, neat and step by step, following one noisy test run.

| Scene | Shows |
| --- | --- |
| 1 | A coding agent's context window; a raw test log pours in and fills it (the problem) |
| 2 | Saturn appears between the agent and the computer, running locally |
| 3 | The agent calls `saturn_run`; the five tools are listed beside Saturn |
| 4 | The policy check: the command is parsed and matched against the allow list |
| 5 | The command runs; a long raw output comes back |
| 6 | A 700-token gauge measures it and overflows |
| 7 | The full output drops into the store, stamped with an ID and a 48-hour timer |
| 8 | Code recognises the format and pulls out the failures, grouped and counted |
| 9 | Alternative branch: the local model reads short excerpts; a cited line that does not exist is struck out |
| 10 | A digest of a few hundred tokens and the ID go back to the agent |
| 11 | The agent calls `saturn_query` and receives just one detail |
| 12 | Context windows side by side, without and with Saturn |

## On the site

- Headline: the measured fixture cuts (97% to 99.8%), with the everyday 50% to 60% as the whole-task figure.
- Repository: https://github.com/mugilnimbus/Saturn-MCP
