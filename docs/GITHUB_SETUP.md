# Publishing to GitHub (alixblue)

1. On github.com create a new repository named `language-obsession` under your account (no README, no .gitignore, no license: the folder already has its own files).
2. In this folder, run:

```
git remote add origin https://github.com/alixblue/language-obsession.git
git branch -M main
git push -u origin main
```

3. In the repository: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. Wait for the "Deploy phone app to GitHub Pages" run (Actions tab). The app is then at `https://alixblue.github.io/language-obsession/`.
5. Open that address on the phone and use "Add to Home screen".

The repository is public, so the vocabulary lists are public too. The API key is never stored in the repository: the phone app asks for it once and keeps it only in that browser.
