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

## AI features need a key

Corrections, example sentences, generated drills, mocks and the tutor chat need an Anthropic API key. The first time you use one of them, the app asks for the key and stores it **only in this browser's local storage**. It is sent only to `api.anthropic.com`.

- **Never put your key in the repository or in the page.** The GitHub Pages site is public.
- Anyone who uses your phone browser can use your key. Use a key with a spend limit, and remove it from the browser if you lend the phone: open the browser console and run `claude.forgetKey()`, or clear the site data.
- Calls are billed to your API account. A full mock is several calls; a card session with examples is one call per six cards.

The artifact version inside Claude uses your Claude account instead and needs no key.

## Where your progress lives

In the phone browser's local storage, per device and per browser. There is no account sync in the standalone version. Use **Export log** in the Log tab for the corrections. To move progress between devices, copy the data from the browser (a full backup/restore button is planned). Clearing site data deletes progress.

## Updating vocabulary

Edit or add JSON files in `languages/<code>/vocab/`, run `python scripts/build_app.py`, commit, push.

## Known limits

- Speech recognition depends on the browser (Chrome on Android works; some browsers have none). Keyboard dictation always works.
- Text-to-speech quality depends on the voices installed on the phone.
- The official sample audio files are not included (they are large). Play them from the files on your phone while you do the sample papers.
