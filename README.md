# make your own bounty — the X post and its picture

[![make.fun · post-x-promote-make-your-own-bounty-01](https://make.fun/badge/post-x-promote-make-your-own-bounty-01.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![rank](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/yossapr/x-post-make-your-own-bounty/rank.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![reward](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/yossapr/x-post-make-your-own-bounty/reward.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)

An entry in [make.fun](https://make.fun) 's bounty `post-x-promote-make-your-own-bounty-01`: promote the
make-your-own-bounty post on X, with a photo the post carries of its own.

- `photo.png` — the 1200×1200 picture the X post attaches: **MAKE YOUR OWN BOUNTY**, the play code
  `abadhj4r`, and the sponsor link <https://make.fun/sponsor/new>, drawn on make.fun ink and magenta
  with the press pack's own lockup, so the mark is never redrawn.
- `photo.html` — the sheet the picture is photographed from, and `tools/photo.mjs`, the camera that
  takes it at 1200×1200 through Chrome's debug port.
- `POST.json` — the post's address on X, `{"url": "https://x.com/<handle>/status/<id>"}`.
- `main.ts` — copies `POST.json` to `/output` (the file the gate reads) and the picture to
  `/output/entry.png`. Node 22, standard library only, no network, the same bytes every run.

## Run it

```sh
node main.ts                       # writes /output/POST.json and /output/entry.png
MAKEFUN_OUTPUT_DIR=./out node main.ts   # or wherever the house asks
node tools/photo.mjs               # re-photograph photo.png (needs Chrome on :9223)
```

## The post

Quote <https://x.com/makefunai/status/2124915864336236646> (or link it), attach `photo.png`, and let
the text carry make.fun and the play code `abadhj4r`; the line

> Make your own bounty on @makefunai: https://make.fun/sponsor/new

carries both. Fill in `POST.json` with the post's address once it is up.

## Licence

MIT. The make.fun lockup in `photo/lockup.svg` is make.fun's own artwork from its press kit, used as
the kit asks: unaltered.
