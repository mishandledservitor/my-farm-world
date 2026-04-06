# Deploying My Farm World to Netlify

## Prerequisites

- A [Netlify](https://app.netlify.com/) account (free tier is fine)
- This repo pushed to GitHub (or GitLab / Bitbucket)

---

## Option A: Connect via Git (recommended — auto-deploys on push)

1. Push the repo to GitHub if you haven't already:
   ```
   git remote add origin git@github.com:<your-user>/my-farm-world.git
   git push -u origin main
   ```

2. Log in to [app.netlify.com](https://app.netlify.com/).

3. Click **"Add new site"** > **"Import an existing project"**.

4. Select **GitHub** and authorise Netlify if prompted.

5. Pick the **my-farm-world** repository.

6. Netlify will auto-detect the settings from `netlify.toml`, but verify:
   | Setting        | Value           |
   |----------------|-----------------|
   | Branch         | `main`          |
   | Build command  | `npm run build` |
   | Publish dir    | `dist`          |

7. Click **"Deploy site"**.

8. Wait ~30 seconds for the build. Once the status shows **Published**, click the generated URL (e.g. `https://my-farm-world.netlify.app`).

9. **(Optional)** Go to **Site configuration** > **Domain management** > **Add a custom domain** to use your own domain.

Every push to `main` will now automatically redeploy.

---

## Option B: Manual deploy (drag-and-drop, no Git connection)

1. Build locally:
   ```
   npm run build
   ```

2. Go to [app.netlify.com](https://app.netlify.com/) > **"Add new site"** > **"Deploy manually"**.

3. Drag the entire `dist/` folder onto the drop zone.

4. The site goes live immediately at the generated URL.

To update later, rebuild and drag the new `dist/` folder onto the **Deploys** tab.

---

## Option C: Netlify CLI

1. Install the CLI:
   ```
   npm install -g netlify-cli
   ```

2. Log in:
   ```
   netlify login
   ```

3. From the project root, link or create a site:
   ```
   netlify init
   ```

4. Deploy a preview:
   ```
   netlify deploy
   ```

5. Deploy to production:
   ```
   netlify deploy --prod
   ```

---

## Environment / Build notes

- **Node version**: The project uses Node 22. Netlify defaults to Node 18. If the build fails, set the environment variable `NODE_VERSION` to `22` in **Site configuration** > **Environment variables**.
- **Build output**: Vite outputs to `dist/`. The `netlify.toml` in the repo root handles this automatically.
- **No server required**: This is a fully static site (HTML + JS). No serverless functions needed.
- **Chunk size warning**: The build emits a "chunk larger than 500 kB" warning — this is just Phaser being bundled. It compresses to ~370 kB gzipped and is fine for a game.
- **localStorage**: The game saves to `localStorage`, which works on Netlify with no configuration.
