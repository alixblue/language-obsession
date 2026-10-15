# Setting up the "Language Obsession" project

## 1. Create the project

In Claude: **Projects → New project**, name it `Language Obsession`.

## 2. Paste the instructions

Open `PROJECT_INSTRUCTIONS.md`, copy everything, and paste it into the project's **Instructions** (custom instructions) box.

## 3. Upload the knowledge

Upload every file in `knowledge/` (19 files, about 1 MB):

| File | What it is |
|---|---|
| `formats-in-chat.md` | Exact formats for questions, answers, corrections, mocks, session block |
| `data-formats.md` | Data shapes (used by the phone app; harmless in chat) |
| `learner-profile.md` | Your goals, level, weak tags. **Update and re-upload weekly** |
| `zh-language.md`, `zh-exam-specs.md`, `zh-topics.md` | Chinese language file, HSK exam structures, official topic outline |
| `zh-grammar-outline-hsk5.txt`, `zh-grammar-outline-hsk6.txt` | Official grammar outlines |
| `zh-vocab-hsk5.tsv`, `zh-vocab-hsk6.tsv`, `zh-vocab-hsk7-9.tsv` | Chinese vocabulary (HSK 5, 6, 7-9) |
| `ja-language.md`, `ja-exam-specs.md` | Japanese language file and JLPT structures |
| `ja-vocab-n5.tsv` … `ja-vocab-n1.tsv`, `ja-vocab-starter-with-examples.tsv` | Japanese vocabulary N5-N1 and starter words with examples |

The vocabulary files are large. The project will search them instead of loading them whole, so name words or levels in your request ("hsk6 section List 03") when you want specific ones.

## 4. Try these first

```
zh · placement
ja · placement
zh · grammar drill · 8 · mixed
ja · exceptions drill · days of the month
ja · plan
```

## 5. Adding a language later

Say `new language · <name>`. The tutor asks five short questions, drafts the language and exam files, and tells you what to upload. Nothing else in the project changes.

## 6. Keeping progress

Claude does not remember between chats. At the end of every session it prints a SESSION BLOCK. Paste those into `learner-profile.md` (weak tags, words to work in, next re-test) and re-upload the file, or paste the latest block at the start of the next chat.

## 7. Still to verify together (in the project)

- A real backup download from the phone app, and one restore.
- The first GitHub Pages deploy of the phone app.
- AI features in the phone app with your API key.
- Whether the project's search finds the right rows in the vocabulary files when you name a level and section.
- The N4 and N2/N1 section counts against an official paper.
