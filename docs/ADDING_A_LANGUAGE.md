# Adding another language

Do these in order. Nothing in the tutor rules is specific to Chinese or Japanese except the two language folders.

1. **Create the folder.** `languages/<code>/` with `vocab/`, `specs/`, and `language.json`.
2. **`language.json`.** Copy `languages/ja/language.json` and set:
   - `code`, `name`, `script`, `reading` (pinyin, kana, romanisation, none)
   - `speech`: the BCP-47 tag used for text-to-speech and recognition (`fr-FR`, `ko-KR`, `es-ES`, …)
   - `levels`: ordered easiest to hardest, with `level_direction` stated in words
   - `goal`, `test_date`, `start_level`
3. **Vocabulary.** One JSON file per level in `vocab/`, objects `{w, p, m, l, t, z, e}`. Keep section names (`t`) meaningful; the app turns them into the section list. Leave `z`/`e` empty if you have no examples.
4. **Exam spec.** `specs/<exam>.json`: sections, number of questions, minutes, part types. State where the numbers came from.
5. **Grammar / topic outlines** if the exam publishes them (`grammar/`, `specs/topics.json`).
6. **Tell the tutor.** Add a short section to `CLAUDE.md` under "The learner" for this language: goal, level, weak skills, anything specific (for example, gendered nouns, tones, politeness levels). Add language-specific style rules to rule 1.
7. **Update the app.**
   - Add the language to `LANGS` in `app/src/laoshi.html` (name, speech tag, level list, goal, `who` description).
   - Add its vocabulary to `scripts/build_app.py` (another `rows(...)` call and `inject(...)`).
   - Add the exam spec to `OFFICIAL` in the mock section.
8. **Run** `python scripts/build_app.py`, open `app/dist/index.html`, and check one card session and one grammar drill.

## Things to decide per language

- Does a level scale run up or down (JLPT runs down; HSK runs up)? Write it into `language.json`.
- Is there a script to learn (kana, hangul, cyrillic)? Add a short kana-style drill before vocabulary.
- Does speech recognition exist for it in the learner's browser? If not, rely on keyboard dictation.
