# Question formats (data)

These are the JSON shapes the phone app and any future tooling use for generated content. In chat the same content is shown in the card formats in `IN_CHAT_PRACTICE.md`.

## Vocabulary item

```json
{ "w": "打扫", "p": "dǎsǎo", "m": "to clean up", "l": "HSK 5", "t": "List 03 · b–c", "z": "周末我要把房间好好打扫一下。", "e": "I'm going to give my room a good clean this weekend." }
```

`l` is the level label (`HSK 5`, `HSK 6`, `HSK 7-9`, `N5`…`N1`). `t` is the section. `z` and `e` may be empty and are written later.

## Question group (listening, reading, grammar, vocabulary)

```json
{
  "groups": [
    {
      "kind": "gram1",
      "audio": "spoken script, turns on separate lines (listening only)",
      "text": "passage; blanks as [[1]], [[2]] (reading and text-grammar only)",
      "bank": ["A …", "B …"],
      "questions": [
        { "q": "question or sentence", "options": ["…", "…", "…", "…"], "answer": 2, "why": "short English explanation", "point": "optional grammar point" }
      ]
    }
  ]
}
```

- `answer` is the index into `options`.
- `bank` is used for paragraph ordering (HSK) and sentence filling (HSK 6); questions then offer letters.
- `kind` is the part type; it is the tag used to track weak points.

## Typed-answer drill

```json
{ "items": [ { "base": "行く", "reading": "いく", "form": "te-form", "answers": ["行って", "いって"], "note": "Exception: 行く → 行って, not 行いて" } ] }
```

## Writing or speaking task

```json
{ "tasks": [ { "type": "order | words | passage | picture | application | topic | chart | translation | retell | question | applied", "instruction": "English instruction", "material": "target-language text", "min": 100 } ] }
```

## Correction

```json
{ "score": 6, "verdict": "one sentence", "corrected": "…", "natural": "…", "errors": [ { "orig": "…", "fix": "…", "cat": "particle", "why": "…" } ], "focus": "one thing to improve" }
```

## Log entry

```json
{ "id": "log_zh_1760000000000", "t": 1760000000000, "lang": "zh", "type": "writing | speaking | reading | listening | drill | mock | placement", "prompt": "", "answer": "", "res": { }, "score": 0, "of": 0 }
```

## Weak-point record

```json
{ "gram2": { "n": 12, "m": 7, "t": 1760000000000 }, "conj:te-form": { "n": 6, "m": 1 } }
```

`n` attempts, `m` misses. Weak when `(m + 0.5) / (n + 1) >= 0.3` and `n >= 2`. Halve both when `n > 40`.

## Spaced repetition record

```json
{ "打扫": [3, 20375, 5, 1] }
```

`[box, dueDay, reviews, lapses]`. Boxes 0–5: New, Learning, Familiar, Known, Solid, Mastered. Intervals in days by box: `[0, 0, 1, 3, 8, 21]`. "I already know this" sets box 4 with a 14-day check.
