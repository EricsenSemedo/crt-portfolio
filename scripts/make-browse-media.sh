#!/usr/bin/env bash
# Prototype: cuts a 16:10 poster and a short muted hover clip for every project card.
# Usage: scripts/make-browse-media.sh   (run from the repo root; needs ffmpeg)
set -euo pipefail

out=public/projects/browse
mkdir -p "$out"
fit="scale=960:600:force_original_aspect_ratio=increase,crop=960:600"
small="scale=640:400:force_original_aspect_ratio=increase,crop=640:400"

# id, source, poster time, clip start, extra crop before fitting (or "-")
clip() {
  local id=$1 src=$2 poster=$3 start=$4 pre=$5
  local vf=$fit vfc=$small
  if [ "$pre" != "-" ]; then vf="$pre,$fit"; vfc="$pre,$small"; fi
  ffmpeg -v error -y -ss "$poster" -i "$src" -frames:v 1 -vf "$vf" -q:v 4 "$out/$id.jpg"
  ffmpeg -v error -y -ss "$start" -t 6 -i "$src" -an -vf "$vfc,fps=30" \
    -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 -deadline good "$out/$id.webm"
}

clip pullworth public/projects/pullworth-dashboard-v2.webm 1.5 0 -
clip toonsync public/projects/toonsync-demo-v2.webm 2 0 -
clip stitch public/projects/stitch-docs-v1.webm 3 2.6 -
clip edgewood-remodeling public/projects/edgewood-demo-v2.webm 1 0 -
clip btb-creative-vision public/websites/btb-tour.mp4 0.5 0 -
clip heros-quest public/projects/heros-quest/gameplay.mp4 3 2 -
clip physics-grab public/projects/physics-grab/demo.webm 30 27 -
clip dont-get-caught public/projects/dont_get_caught_demo.mp4 4 1 crop=1088:864:328:116
clip grow-your-plant public/projects/grow-your-plant-demo.mp4 1 0 crop=1456:864:330:116
clip zombies-game public/videos/zombies-game-demo.mp4 8 2 crop=896:720:206:0
clip maze-generator public/videos/maze-generator-demo.mp4 30 24 crop=640:400:320:200
clip project-manager-pro public/videos/project-manager-pro-demo.mp4 200 186 -

# Derma has stills only: a quick flip through its screens stands in for a clip.
ffmpeg -v error -y -i public/projects/derma-dashboard-home.png -vf "$fit" -q:v 4 "$out/derma.jpg"
ffmpeg -v error -y -framerate 1.25 -start_number 1 -i public/projects/derma-%02d.webp -frames:v 8 -an \
  -vf "$small,fps=30" -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 "$out/derma.webm"
ffmpeg -v error -y -i public/projects/shadi-dashboard-home.png -vf "$fit" -q:v 4 "$out/shadi.jpg"

du -ch "$out"/* | tail -1
