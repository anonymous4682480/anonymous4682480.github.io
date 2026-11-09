# ARROW anonymous supplementary website

Anonymous videos and interactive examples for double-blind review.
All fonts, scripts, images, videos, and viewer data are served by this site.
No analytics or external embeds are included.

## Preview

Requires Node.js 24 or newer.

```sh
npm ci
npm run build
npx http-server dist -p 4173 -c-1
```

Open http://localhost:4173. When using VS Code over SSH, forward port 4173
in the Ports panel and open its forwarded address in your browser. Deployment
is not required.

The source `index.html` also supports HTTP preview after `npm ci`; its import
map resolves Three.js from local `node_modules`. The production build bundles
those dependencies and removes the development import map.

## Publish with GitHub Pages

1. In repository **Settings → Pages**, select **GitHub Actions** as the source.
2. Commit and push to `main` using the anonymous account.
3. The `Publish website` workflow builds and deploys `dist/` to
   https://anonymous4682480.github.io/.

The repository contains its media under `assets/`; no storage repository or
external asset host is required. Keep new files below GitHub's 100 MiB limit
and the deployed website below 1 GB. Do not import another repository's Git
history. Use the anonymous account's commit name, noreply email, and push
credentials.

## 2D predictions

The gallery follows the 3D examples and includes 15 selected packaged
TAP-Vid-DAVIS sequences, in the order listed in `static/js/tracking2d-scenes.js`.
Each clip uses frames 0–47, or every
available frame for shorter sequences, and a 24×24 query grid on its first frame.
Videos use the viewer’s renderer at 15 FPS, with display step 1, 12-frame trails,
a visibility threshold of 0.5, and predicted occluded points hidden.

Each folder under `assets/exports/tracking2d/` contains the anonymous prediction
bundle, `preview.mp4`, and `poster.jpg`. The prediction bundle retains all tracks
and visibility scores; the videos apply the visibility filter. Its standalone
`index.html` supports local inspection and adjustment without the model server.

The gallery requests only posters and MP4 previews, never the full tracking arrays
or PNG sequences. Posters and video metadata begin loading within 400 pixels of
the viewport; playback starts only while a card is visible and the tab is active.
MP4 previews use fast-start packaging (the playback index precedes the video
payload). The existing selected videos were remuxed without changing their encoded
frames; future viewer MP4 exports use the same packaging.

Edit `static/js/tracking2d-scenes.js` to choose which clips appear and are copied
into `dist/`. Remove a rejected clip’s asset folder before committing, so it is
not included in repository history. Checkpoint paths and run IDs are deliberately
absent from the website and exported bundles.

## Media

`assets/videos/overview.mp4` is a 46-second, 1080×1080 H.264 overview.
It retains the demonstrations, ends before the benchmark-results overlay,
and finishes with a short fade. Playback is accelerated for presentation.
The video can be played directly on the page.

Before publishing updates, check visible content, metadata, commit identities,
and browser network requests for identifying information or external tracking.
The noindex directive discourages indexing; it does not restrict access.
