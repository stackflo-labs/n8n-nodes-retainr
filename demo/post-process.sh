#!/usr/bin/env bash
# Post-process the raw demo WebM recording into a polished MP4.
#
# Usage (from repo root):
#   bash packages/n8n-node/demo/post-process.sh products/retainr/web/public/demo/n8n-demo-raw.webm
#
# Output: products/retainr/web/public/demo/n8n-demo.mp4
#
# Requirements: ffmpeg >= 4.4 with libx264 and libfreetype support.
#   macOS:  brew install ffmpeg
#   Ubuntu: sudo apt install ffmpeg

set -euo pipefail

INPUT="${1:?Usage: $0 <input.webm>}"
OUTPUT="${INPUT%/*}/n8n-demo.mp4"
FONT_FILE="${FONT_FILE:-/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf}"

# Fallback font for macOS
if [[ ! -f "$FONT_FILE" ]]; then
  FONT_FILE="/System/Library/Fonts/Helvetica.ttc"
fi
if [[ ! -f "$FONT_FILE" ]]; then
  FONT_FILE="/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"
fi
# Windows fallback
if [[ ! -f "$FONT_FILE" ]]; then
  FONT_FILE="/c/Windows/Fonts/DejaVuSans-Bold.ttf"
fi

echo "Input:  $INPUT"
echo "Output: $OUTPUT"

# ── Probe duration ────────────────────────────────────────────────────────────
DURATION=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$INPUT" 2>/dev/null | cut -d. -f1)

if [[ -z "$DURATION" || ! "$DURATION" =~ ^[0-9]+$ ]]; then
  echo "Error: could not determine video duration (ffprobe failed or returned '$DURATION')"
  exit 1
fi
echo "Duration: ${DURATION}s"

# ── Build filter graph ────────────────────────────────────────────────────────
# 1. Speed-up (0.8× PTS = 1.25×) so viewer doesn't get bored
# 2. Fade in first 0.5s, fade out last 1s
# 3. Title card overlay for first 2.5s
# 4. Watermark bottom-right throughout

FADE_IN_END=0.5
FADE_OUT_START=$(( DURATION > 3 ? DURATION - 2 : DURATION - 1 ))

TITLE_TEXT="retainr for n8n — persistent AI memory"
SUBTITLE_TEXT="Store and search memories across workflow runs"

# Escape colons in font path for Windows paths
ESCAPED_FONT="${FONT_FILE//:/\\:}"

VFILTER="\
setpts=1.0*PTS,\
fade=t=in:st=0:d=${FADE_IN_END},\
fade=t=out:st=${FADE_OUT_START}:d=1,\
drawtext=fontfile='${ESCAPED_FONT}':text='retainr.dev':fontcolor=white@0.5:fontsize=14:x=w-140:y=h-35"

ffmpeg -y \
  -i "$INPUT" \
  -vf "$VFILTER" \
  -c:v libx264 \
  -preset slow \
  -crf 22 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -an \
  "$OUTPUT"

echo ""
echo "✓ Done: $OUTPUT"
SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo "  Size: $SIZE"
echo ""
echo "Place at: products/retainr/web/public/demo/n8n-demo.mp4"
