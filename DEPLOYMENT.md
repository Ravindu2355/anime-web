# Hosting on GitHub Pages (Guide)

This application is fully client-side and optimized for **static web hosting**. It compiles into standard, optimized HTML, CSS, and JavaScript files inside the `dist` folder.

We have pre-configured `vite.config.ts` with `base: './'` so that all built assets use relative paths. This ensures that the application will render perfectly whether hosted at the root domain (`https://username.github.io`) or under a repository subfolder (`https://username.github.io/repository-name`).

Here are the two easiest ways to deploy this site to GitHub Pages.

---

## Method 1: Automated Deployment via GitHub Actions (Recommended)

This is the modern and recommended approach. Every time you push code to your `main` branch, GitHub will automatically build and publish your site.

### Step 1: Export to GitHub
In the Google AI Studio interface:
1. Open the **Settings** menu.
2. Select **Export to GitHub** to link and push your repository.

### Step 2: Create the Workflow File
In your repository on GitHub, create a new file at `.github/workflows/deploy.yml` with the following contents:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # change to master if your primary branch is master

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-cache: 'npm'
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build Application
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Enable Pages in Repository Settings
1. Go to your repository on GitHub.
2. Click **Settings** (the gear icon on the top tab).
3. Under the **Code and automation** sidebar on the left, click **Pages**.
4. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
5. Once you push or commit your new workflow, GitHub Actions will build and deploy the applet automatically!

---

## Method 2: Quick Deployment using the `gh-pages` package

If you want to build and deploy locally or run a one-line terminal deploy:

### Step 1: Install the deploy package
Run this command in your terminal inside the project directory:
```bash
npm install -D gh-pages
```

### Step 2: Update `package.json` scripts
Add these scripts inside your `package.json` file:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### Step 3: Run Deployment
Deploy the compiled directory directly to GitHub pages branch:
```bash
npm run deploy
```

---

## Static Features & Persistence

The application is built with continuous standalone resilience:
- **Offline / Transient Mode**: Supported out of the box. Watchlists, downloads, and user comments fall back gracefully to `localStorage` and `IndexedDB` when Firebase is not configured or in simulated offline mode.
- **Durable Persistence (Optional)**: If you want database synchronization across devices, you can provide client-side Firebase Auth and Firestore credentials directly in the app. No backend servers are needed!
