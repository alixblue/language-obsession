# Phone app (GitHub Pages)

The phone app is the same single-page app as the Claude artifact, built into `app/dist/` and published on GitHub Pages. You open it in the phone browser and use "Add to Home screen" so it behaves like an app.

## Publish it

1. Create a GitHub repository and push this folder to `main`.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push any change. The workflow `.github/workflows/pages.yml` runs `scripts/build_app.py` and deploys `app/dist`.
4. Open `https://<your-user>.github.io/<repo>/` on the phone. In Chrome: menu → **Add to Home screen** (or Install app).

To build and test locally, run `python scripts/build_app.py` and open `app/dist/index.html` in a browser.

## What works without the AI

Flashcards with spaced repetition, the "I already know this" button, section progress, the pacing plan, the weekly review numbers, the log, grammar and mock review of questions already generated, text-to-speech, and offline use after the first load.

## AI is optional, and there is a free option

Everything except the AI features works with no key at all. If you do not want to spend anything, simply never enter a key (press Cancel when it asks).

The AI features (corrections, example sentences, generated drills, mocks, the tutor chat) use a key you paste once. The key is stored **only in this browser's local storage** and sent only to the provider.

| Key | Provider | Cost |
|---|---|---|
| Any key that does not start with `sk-ant-` (Google keys usually start with `AIza`) | Google Gemini API | Free tier from Google AI Studio (aistudio.google.com, "Get API key"). No card. Limited requests per minute and per day, and free-tier requests may be used by Google to improve its products. Check the limits shown in AI Studio. |
| Starts with `sk-ant-` | Anthropic API | Paid, billed to your account |

- **Free path:** create the Gemini key, paste it when asked. If a call fails with "model not found", Google renamed the model: set `laoshi_gemini_model` in the browser's local storage to a current Flash model name.
- **No-cost alternative with better quality:** do the AI work in the Claude project chat or the Claude artifact, which use your existing Claude plan, and use the phone app only for cards, progress and backups.
- **Never put a key in the repository or the page.** The GitHub Pages site is public. Remove the key from a browser with `claude.forgetKey()` in the console or by clearing site data.

## Where your progress lives

In the phone browser's local storage, per device and per browser. There is no account sync in the standalone version. Use **Export log** in the Log tab for the corrections. To move progress between devices, copy the data from the browser (a full backup/restore button is planned). Clearing site data deletes progress.

## Updating vocabulary

Edit or add JSON files in `languages/<code>/vocab/`, run `python scripts/build_app.py`, commit, push.

## Known limits

- Speech recognition depends on the browser (Chrome on Android works; some browsers have none). Keyboard dictation always works.
- Text-to-speech quality depends on the voices installed on the phone.
- The official sample audio files are not included (they are large). Play them from the files on your phone while you do the sample papers.
