# Language Lab

A personal language-learning project: one tutor, one library per language, one phone app. Currently **Mandarin (new HSK 5–9)** and **Japanese (JLPT N5–N1)**, built for two goals by 2027-02-28: HSK 6 and N3.

## What's in it

| Path | Purpose |
|---|---|
| `CLAUDE.md` | Instructions for the tutor (Claude): learner profile, style rules, adaptive policy |
| `docs/IN_CHAT_PRACTICE.md` | Exact formats for questions, answers, corrections and session blocks in a chat |
| `docs/QUESTION_FORMATS.md` | JSON shapes used by the app and tools |
| `docs/ADDING_A_LANGUAGE.md` | How to add a language |
| `docs/PHONE_APP.md` | Publishing the phone app on GitHub Pages and how the AI key works |
| `languages/zh`, `languages/ja` | Vocabulary (JSON), exam specs, Chinese grammar and topic outlines |
| `progress/` | Profile template, corrections log, session log |
| `app/src/laoshi.html` | The app (single file) |
| `app/shim.js`, `manifest.webmanifest`, `sw.js` | Make the same file run as a standalone phone app |
| `scripts/build_app.py` | Builds `app/dist` from the vocabulary, grammar-bank and prompt files |

## Library contents

| Language | Level | Words |
|---|---|---|
| Chinese | HSK 5 | 1,581 |
| Chinese | HSK 6 | 1,777 |
| Chinese | HSK 7–9 | 5,562 |
| Japanese | N5 | 730 |
| Japanese | N4 | 673 |
| Japanese | N3 | 1,585 |
| Japanese | N2 | 1,868 |
| Japanese | N1 | 2,979 |

Chinese meanings for HSK 7–9 were missing in the source list and are now filled from CC-CEDICT. Example sentences are written on demand (AI, only when you press the button) except for a few starter words.

## Using it

- **In a Claude project chat:** upload `CLAUDE.md`, `docs/` and the language folders as project knowledge, then start with a line such as `zh · grammar drill · 8 · weak points`.
- **On the phone:** follow `docs/PHONE_APP.md`.
- **In the Claude artifact:** the same app, using your Claude account, no key.

## Sources

- Chinese vocabulary: new-HSK word lists for levels 5, 6 and 7–9, cross-checked against the official 2025-11 syllabus (levels 1–6).
- Chinese grammar and topics: official HSK syllabus 2025-11 (in force 2026-07).
- Exam structures: official HSK sample papers (HSK 5, 6, 7–9) and the JLPT layout.
- Japanese vocabulary: JLPT N5–N1 word lists (readings and English meanings from a dictionary export).
- HSK 7–9 English meanings: [CC-CEDICT](https://cc-cedict.org/) (CC BY-SA 4.0), matched by characters and pinyin.
- Fixed grammar questions, Japanese verb list, prompt banks: `languages/<code>/grammar/` and `languages/<code>/prompts.json`, used by the app's offline placement check, drills and prompts.

The source PDFs and audio files are not included in this folder.
