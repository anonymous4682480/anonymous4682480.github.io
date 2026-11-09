2D tracking asset (format version 1)

Extract this folder into your site's assets directory and serve over HTTP.
No viewer server, model weights, external fonts, scripts or requests are needed.
Open index.html for a complete player, or embed it:
  <iframe src="assets/my-clip/index.html" title="2D tracking"
          style="width:100%;height:640px;border:0" loading="lazy"></iframe>
When exported with Both, preview.mp4 contains the same clip rendered with the
saved display settings. Use it as a normal looping <video> on your site.

For a custom page:
  import { mountTracking2D } from './player.js';
  const player = await mountTracking2D(element, './manifest.json');
  player.draw(0, { step: 4, trail: 12, hollow: true, threshold: 0.5 });
The returned player offers draw(frame, settings), play(), pause(), destroy(),
manifest, data and settings. Frame indices are local
to this exported clip. These methods also allow synchronizing several players.
All requests are relative to the manifest. Controls may be hidden by setting
the host element's data-controls="false" before mounting.

manifest.json contains image dimensions, grid shape, query frame, presentation
times, visibility semantics, defaults and display settings. Settings are not
baked into the data: all decoded tracks and all RGB frames are retained.
Colors are fixed RGB uint8. query_uv is [N,2]; UV chunks are float32 [N,T,2],
visibility_score is float32 [N,T], and visible is uint8 [N,T]. Arrays use D4RB
(16-byte aligned typed arrays, a msgpack header) inside gzip files. player.js
includes its decoder. Chunks run along the time axis, with stable track IDs.
UV is edge-normalized and may lie outside [0,1]. Non-finite UV is invalid.
Only finite positions are drawn. Visibility is score > threshold; missing or
non-finite scores are below threshold. Binary-only older runs cannot recover
continuous scores. Presentation timing uses the selected FPS, not capture time.

The exporter includes no checkpoint path, source filename, run ID or author.
PNG files are freshly encoded without source metadata. The footage itself is
unchanged, so any visible identifying content remains part of the images.
