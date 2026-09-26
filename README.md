# One Night

A short animated film about one exhausting night of a Palestinian man in his late twenties: four recurring nightmares, then a fragile, hopeful morning. There is no dialogue, narration or music, only environmental sound.

Everything is generated in code. The images are drawn live on an HTML canvas and every sound is synthesized with the Web Audio API. There are no image, video or audio files.

## Watch it

Open `index.html` in a modern browser (Chrome, Edge, Firefox or Safari) and click to begin. Headphones are recommended.

- No build step, server or install is needed. It also runs straight from `file://`.
- If you prefer a local server: `npx serve .` or `python3 -m http.server`, then open the printed URL.

| Key | Action |
|---|---|
| `Space` | play / pause |
| `←` / `→` | seek 5 s |
| `1`–`9`, `0`, `-` | jump to scene 1–9, 10, 11 |
| `F` | fullscreen |
| `M` | mute |

The timeline bar at the bottom appears when you move the mouse. Click it to scrub.

URL options:
- `?q=1` renders at full 1920×804 (the default is `0.75`; use `0.5` on slow machines).
- `?t=120` starts at 120 s.
- `?t=120&still` renders one frame with no audio (used for testing).

## The film (≈ 5 min 32 s)

| # | Scene | Length | What happens |
|---|---|---|---|
| — | Title | 7 s | Black screen; the night's sound comes in first |
| 1 | Bedroom, late night | 30 s | Wide room lit by streetlight, headlights sweeping across the wall, eyes open on the pillow, the ceiling |
| 2 | Falling asleep | 20 s | Eyes close; warmth drains; window light stretches; the ceiling ripples into water |
| 3 | Drowning | 34 s | Fully dressed, he rises toward the light and is pulled down: wide shot, the reaching hand, a stuttering repeat, then sinking into the abyss |
| 4 | The endless corridor | 34 s | Bare feet on terrazzo; doors stretch apart; the end door recedes (dolly zoom); flickering tubes die one by one |
| 5 | The coffee cup | 30 s | A small finjan spins, grows, gives chase and spills coffee upward like black rain; the camera falls into it |
| 6 | Mother and childhood | 40 s | A golden kitchen, coffee in a brass rakweh, a boy in the doorway, the man watching from the dark, her smile, the gold fading before he can reach it |
| 7 | Waking before dawn | 22 s | He wakes with a jolt; the room is cold blue-gray; he sits hunched on the edge of the bed at 04:52 |
| 8 | Morning routine | 26 s | The mirror, a tired and pale face, a paracetamol, a glass of water |
| 9 | Leaving home | 26 s | Stairwell; the street wakes up: shutters, a car, birds, his footsteps going away |
| 10 | The red balloon | 30 s | Golden afternoon; a boy near the entrance lets go of a red balloon; the man stops and looks up |
| 11 | Final moment | 26 s | The balloon between the buildings; his first small, sincere smile; home; the door closes softly; fade to black |

Visual throughline: colour carries the story. Warm sodium streetlight drains into cold blue, then teal water, green fluorescents, a black void, gold (his mother), blue-grey dawn, flat bathroom white, soft morning light, and golden afternoon. The balloon is the only strong red in the film. Coffee connects the nightmare cup, the mother's kitchen and the finjans on her shelf.

Palestinian details: tatreez cross-stitch on the mother's thobe, on the framed embroidery and on the finjans; a brass rakweh on a small gas stove; cement-tile floors; limestone buildings with rooftop water tanks and solar heaters; black-and-white painted curbs; Arabic shop signs; Arabic-Indic door numbers.

## How it's built

```
index.html              player shell (canvas, HUD, start screen)
js/core.js              engine: math/easing/noise, drawing helpers, timeline, dissolves & fades,
                        film grain + vignette, cached/offscreen layers, player controls
js/audio.js             Web Audio: noise beds, synthesized one-shots (footsteps, bubbles, breath, heartbeat,
                        porcelain, shutters, cars, birds, doors…), shared reverbs, and a director that starts
                        and stops each scene's sound so seeking always lands in sync
js/characters.js        C.head: a pseudo-3D painted head (yaw/pitch/roll, eyelids, gaze, smile, stubble,
                        headscarf, lighting); C.figure: posable body (side/front/back); C.hand; pose library
js/sets.js              shared sets: the bedroom (one-point perspective), the ceiling, the pillow close-up,
                        and a perspective Palestinian street
js/scenes/sNN_*.js      one file per scene: its shots (draw) and its soundscape (audio)
```

Each scene registers itself with `FILM.scene({ order, name, dur, draw(ctx, t), audio(h, fx), dissolve, fadeIn, fadeOut, post })`. `draw` gets scene-local time and paints a 1920×804 (2.39:1) logical frame. `audio` schedules sound against the same scene-local clock. The audio clock drives the picture, so they stay in sync.

## Honest limits

This is a stylized, painterly animation made of vector shapes, gradients, grain and light. It is not photorealistic. Photorealistic faces and footage would need an AI video model or real production. The shot list and timing here can serve as an animatic for that.
