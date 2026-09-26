# One Night

A short animated film about one exhausting night of a Palestinian man in his late twenties: four recurring nightmares, then a fragile, hopeful morning. There is no dialogue or narration. Environmental sound and an original score carry it.

Everything is generated in code. The images are drawn live on an HTML canvas, and every sound and every note of the music is synthesized with the Web Audio API. There are no image, video or audio files.

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

## The film (≈ 6 min 5 s)

| # | Scene | Length | What happens |
|---|---|---|---|
| — | Title | 7 s | Black screen; the night's sound comes in first |
| 1 | Bedroom, late night | 24 s | Wide room lit by streetlight, headlights sweeping across the wall, eyes open on the pillow, the ceiling; on the wall, a photo of a boy with his mother and a small red balloon |
| 2 | Falling asleep | 17 s | Eyes close; warmth drains; window light stretches; the ceiling ripples into water |
| 3 | Drowning | 34 s | Fully dressed, he rises toward the light and is pulled down: wide shot, the reaching hand, a stuttering repeat, then sinking into the abyss; far above the surface, something red |
| 4 | The endless corridor | 34 s | Bare feet on terrazzo; doors stretch apart; the end door recedes (dolly zoom); for a moment a red balloon floats before the end door; behind it, faintly, coffee boiling and her kitchen clock; the tubes die one by one |
| 5 | The coffee cup | 30 s | A small finjan spins, grows, gives chase and spills coffee upward like black rain; the camera falls into it |
| 6 | Mother and childhood | 46 s | A golden kitchen, remembered through drifting light leaks; a red balloon tied by the window; coffee in a brass rakweh; the boy turns and looks straight at the man he will become; she strokes the boy's hair and gives him the balloon, then lifts her eyes to the man and smiles; he reaches, the balloon slips away past her face, and the memory closes on him like a door, with a muffled thud and a second of total silence |
| 7 | Waking before dawn | 32 s | A white flash; his eye snaps open while split-second flashes of the four nightmares break in; he bolts upright, panting; the clock turns 04:51 → 04:52 and the fridge shudders off; one tear; the old photo of his mother and him on the wall glows once as his fingertips touch the glass; stillness on the edge of the bed |
| 8 | Morning routine | 26 s | The mirror, a tired and pale face he touches as if to check it is his; a paracetamol; a glass of water |
| 9 | Leaving home | 26 s | Stairwell; the street wakes up: shutters rising, a ka'ak seller with his cart, two children walking to school, a car, birds, his footsteps going away |
| 10 | The red balloon | 33 s | Golden afternoon. By his building, a little girl with dark brown hair sees his tired face, walks over and holds up her red balloon. He hesitates, then takes it. She smiles and runs home |
| 11 | Final moment | 40 s | He looks at the balloon and smiles for the first time. As a boy it slipped from his hand; now he opens his hand and lets it go. It rises between the buildings. Home; the door closes softly. Last shot: the same bedroom where the night began, golden now; he rests, and the red balloon drifts past the window |
| — | End | 16 s | ONE NIGHT · ليلة واحدة, over the theme in major |

Visual throughline: colour carries the story. Warm sodium streetlight drains into cold blue, then teal water, green fluorescents, a black void, gold (his mother), blue-grey dawn, flat bathroom white, soft morning light, and golden afternoon. The balloon is the only strong red in the film. Coffee connects the nightmare cup, the mother's kitchen and the finjans on her shelf. The red balloon is the thread of the story: lost in childhood, glimpsed in every nightmare, given back by a stranger's child, and finally released by his own choice.

Music: one theme in Maqam Nahawand on D, played on oud and ney over strings. It is whispered in the bedroom, broken into drones and ostinatos in the nightmares, whole in the mother's kitchen, and silent in the bathroom. When he first smiles it returns in Ajam (D major), the first major chord of the film.

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
                        headscarf, children, tears, lighting); C.figure: posable body (man, mother, boy, girl;
                        side/front/back); C.hand; pose library
js/sets.js              shared sets: the red balloon, the bedroom (one-point perspective; night, dawn, golden),
                        the ceiling, the pillow close-up, and a perspective Palestinian street
js/music.js             the score: oud (Karplus-Strong), ney, string pad, piano, cello; the theme and one cue per scene,
                        attached to each scene's audio so it seeks and stops in sync
js/scenes/sNN_*.js      one file per scene: its shots (draw) and its soundscape (audio)
```

Each scene registers itself with `FILM.scene({ order, name, dur, draw(ctx, t), audio(h, fx), dissolve, fadeIn, fadeOut, post })`. `draw` gets scene-local time and paints a 1920×804 (2.39:1) logical frame. `audio` schedules sound against the same scene-local clock. The audio clock drives the picture, so they stay in sync.

## Honest limits

This is a stylized, painterly animation made of vector shapes, gradients, grain and light. It is not photorealistic. Photorealistic faces and footage would need an AI video model or real production. The shot list and timing here can serve as an animatic for that.
