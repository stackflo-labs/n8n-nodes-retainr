# Demo Recording

Automated pipeline to record an n8n workflow demo video showing the retainr node in action.

## Quick start

```bash
# From the repo root
cd packages/n8n-node
npm run demo:up      # build + start n8n with retainr node pre-installed (port 5679)

# In a separate terminal, wait ~30s for n8n to be ready, then:
cd ../../products/retainr/web
RETAINR_API_KEY=rec_live_... node scripts/record-n8n-demo.mjs
# → saves: public/demo/n8n-demo-raw.webm

# Convert to MP4
bash ../../packages/n8n-node/demo/post-process.sh public/demo/n8n-demo-raw.webm
# → saves: public/demo/n8n-demo.mp4

# Tear down
cd ../../packages/n8n-node
npm run demo:down
```

## What gets recorded

1. n8n workflow editor opens with "AI Memory Demo — retainr"
2. Workflow: **Run Demo** → **Store Memory** (retainr) → **Search Memory** (retainr)
3. Click "Test workflow" — both nodes execute in sequence
4. Search Memory output shows ranked memories retrieved for the user
5. Execution panel shows the stored memory ID

## Files

| File | Purpose |
|---|---|
| `docker-compose.demo.yml` | Spins up n8n with retainr node on port 5679 |
| `post-process.sh` | ffmpeg: WebM → MP4 with title card, fade, watermark |
| `README.md` | This file |

The Playwright recording script lives at:
`products/retainr/web/scripts/record-n8n-demo.mjs`

## Output

The final MP4 (`products/retainr/web/public/demo/n8n-demo.mp4`) is served by Next.js
and displayed on the `/n8n` landing page in an autoplay loop.

## Re-recording

The demo can be re-recorded at any time to reflect node updates. Just re-run the pipeline above.
To use a fresh n8n instance (cleared state):

```bash
npm run demo:down
docker volume rm n8n-node_n8n_demo_data
npm run demo:up
```
