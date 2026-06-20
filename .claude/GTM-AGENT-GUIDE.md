# Marquee GTM Agent — How to Run It

A plain-English guide for running the Marquee go-to-market (GTM) agent. No coding required. If you can open a terminal and type a sentence, you can run this.

---

## 1. What this is (in one paragraph)

You have an **AI operator** that runs Marquee's go-to-market like a one-person marketing team. It knows Marquee's whole launch strategy (the "skill"), it follows that strategy every time (the "agent/operator"), and it remembers what it learns (the "knowledge base"). You talk to it in plain English. It drafts posts, surveys, outreach, research, and plans — but it **never sends, posts, or publishes anything without showing you first.** Your approval is always required for anything that goes out.

Two pieces:

- **The skill** = the playbook. The strategy, the rules, the voice, the step-by-step launch sequence.
- **The agent (operator)** = the worker that reads the playbook and does the work, in Sarah's voice.

---

## 2. What's included (the files)

Everything lives in one folder inside the app: `~/Desktop/ROO/marquee/.claude/`

```
.claude/
├── agents/
│   └── marquee-gtm-operator.md        ← THE AGENT. The worker you talk to.
│
└── skills/marquee-gtm/
    ├── SKILL.md                       ← THE PLAYBOOK. Full GTM strategy + rules + voice.
    │
    ├── references/                    ← Deep strategy detail (the "why" and the sequence)
    │   └── README.md                  ←   (note: full detail files pending — see inside)
    │
    └── knowledge/                     ← THE MEMORY. Grows over time. Edit these freely.
        ├── competitors.md             ←   who else is in the space
        ├── market.md                  ←   stats + survey data (every number needs a source)
        ├── feedback.md                ←   what real users say (paste it here, word for word)
        ├── playbook-library.md        ←   GTM ideas from others, what to steal/reject
        └── decisions.md               ←   what we decided and why (so we don't re-argue it)
```

You will mostly only ever touch the **knowledge/** files. Everything else you can leave alone.

---

## 3. How to run it (every time)

1. Open the **Terminal** app.
2. Type this and press Enter:
   ```bash
   cd ~/Desktop/ROO/marquee
   ```
3. Type this and press Enter:
   ```bash
   claude
   ```
4. You're now talking to Claude. To use the operator, just start your message with **"Use the marquee-gtm-operator"** and say what you want.

That's the whole launch. To leave, type `/exit` or close the terminal.

> **First time only:** running `claude` may open a browser asking you to log in. Log in with the Anthropic account, and you won't have to do it again.

---

## 4. The prompts you'll actually use (copy/paste these)

**Find out where we stand and what to do next:**
> Use the marquee-gtm-operator. Read the skill, figure out which stage the Marquee launch is on right now, and tell me the single most important next move. Ask me anything you need to know.

**Draft outreach to test the Blueprint:**
> Use the marquee-gtm-operator. Draft short outreach to 10-15 real people who are job-hunting or pivoting, asking them to try the Alignment Blueprint. Keep it in Sarah's voice. Don't send it — show me first.

**Build the first survey:**
> Use the marquee-gtm-operator. Draft our first survey so we start owning data. Pick the topic with the best PR and content potential, write the questions, and save the plan in the knowledge base.

**Log feedback from a user:**
> Use the marquee-gtm-operator. Here's what a beta user said: "[paste exactly what they said]". Save it to the feedback file word-for-word, note the theme, and tell me if it changes anything.

**Research competitors:**
> Use the marquee-gtm-operator. Research who else is competing with Marquee, rank them, note their weak spots, and save it to the competitors file.

You don't have to memorize these. Just describe what you want in normal English and the operator figures out the rest.

---

## 5. The one rule that keeps you safe

The operator will **draft, research, build lists, and update its own memory files freely.** But it will **never post, email, DM, send, or publish anything in Marquee's name without showing you first and getting a yes.** Anything going out to the public is always your call. So you can let it work without worrying it'll do something live behind your back.

---

## 6. How to add knowledge and feedback (two easy ways)

**Way A — just tell the agent (easiest).** In a `claude` session:
> Use the marquee-gtm-operator. Add this to the competitors file: [whatever you learned].

> Use the marquee-gtm-operator. A user said "[paste]". Log it in feedback.

The agent writes it to the right file for you.

**Way B — edit the file yourself.** Open the file in any text editor (or TextEdit) and type at the bottom. The rule for these files: **add to the bottom, don't delete what's there.** Always put the date. Examples:

- New thing a user said → add to `knowledge/feedback.md`
- A competitor launched something → add to `knowledge/competitors.md`
- A new stat you want to cite → add to `knowledge/market.md` **with a link to where it came from** (no source = the agent won't use it)
- A GTM idea you saw somewhere → add to `knowledge/playbook-library.md`

The files have a little template at the top showing the format. Follow it loosely; it doesn't have to be perfect.

---

## 7. Two different kinds of changes (keep them separate)

There's a difference between **learning** and **changing the plan**:

- **Growing the knowledge** (new feedback, a competitor move, a stat) → just add it to the right `knowledge/` file. Do this all the time, freely.
- **Changing the strategy itself** (the launch sequence, a core tactic, the pricing approach) → this is a bigger deal. Edit `SKILL.md` (or the `references/` files) on purpose, and write a line in `knowledge/decisions.md` saying what you changed and why.

Rule of thumb: **adding facts = anytime. Changing the plan = slow down and write down why.**

---

## 8. Saving your work (optional but smart)

The agent and skill live in the app's code repository, so changes can be "saved to history" with git. After you've made meaningful changes you want to keep on the record:

```bash
cd ~/Desktop/ROO/marquee
git add .claude
git commit -m "GTM: short note on what changed"
```

If git isn't something you do, that's fine — the files are still saved on the computer either way. This just keeps a dated history.

---

## 9. If something's not working

- **You don't see the operator / it doesn't act like the operator:** make sure you started your message with "Use the marquee-gtm-operator," and that you ran `claude` from inside the `~/Desktop/ROO/marquee` folder (Step 3 above).
- **You see "marquee-gtm" listed twice:** harmless. The version inside this repo is the one to edit; ignore the duplicate.
- **General check-up:** in a terminal, run `claude doctor`.
- **It cited a number with no source, or repeated a bad idea you'd killed:** tell it. The guardrails are `market.md` (sources for stats) and `decisions.md` (settled decisions) — point it back to those.

---

## 10. The short version (tape this to the wall)

1. `cd ~/Desktop/ROO/marquee` then `claude`
2. Start with **"Use the marquee-gtm-operator"** and ask in plain English.
3. It drafts; **you approve** anything that goes out.
4. New feedback / competitor / stat → add it to the matching file in `knowledge/`.
5. Changing the actual plan → edit `SKILL.md` and note why in `decisions.md`.
