# حنين — Nostalgia

**A film directed by Qussai Anas · فيلم من إخراج قصي أنس**

An animated short about one exhausting night of a Palestinian man in his late twenties: four recurring nightmares, a day that repeats them in daylight, and a fragile, hopeful afternoon. There is no dialogue or narration. Environmental sound and an original score carry it.

Everything is generated in code. The images are drawn live on an HTML canvas, and every sound and every note of the music is synthesized with the Web Audio API. There are no image, video or audio files.

## Watch it

Open `index.html` in a modern browser (Chrome, Edge, Firefox or Safari) and click to begin. Headphones are recommended.

- No build step, server or install is needed. It also runs straight from `file://`.
- If you prefer a local server: `npx serve .` or `python3 -m http.server`, then open the printed URL.
- Arabic titles use the Amiri font from Google Fonts. Offline, a system Arabic font is used instead.

| Key | Action |
|---|---|
| `Space` | play / pause |
| `←` / `→` | seek 5 s |
| `1`–`9`, `0`, `-`, `=` | jump to scene 1–9, 10, 11, 12 |
| `F` | fullscreen |
| `M` | mute |

The timeline bar at the bottom appears when you move the mouse. Click it to scrub.

URL options:
- `?q=1` renders at full 1920×804 (the default is `0.75`; use `0.5` on slow machines).
- `?t=120` starts at 120 s.
- `?t=120&still` renders one frame with no audio (used for testing).

## The film (≈ 6 min 52 s)

| # | Scene | Length | What happens |
|---|---|---|---|
| — | Opening | 11 s | "A film directed by Qussai Anas", then the title, حنين |
| 1 | Bedroom, late night | 24 s | Streetlight, headlights sweeping the wall, eyes open on the pillow; on the wall, a photo of a boy with his mother and a small red balloon |
| 2 | Falling asleep | 17 s | Eyes close; warmth drains; window light stretches; the ceiling ripples into water |
| 3 | Drowning | 34 s | Fully dressed, he rises toward the light and is pulled down, again and again, then sinks into the dark |
| 4 | The endless corridor | 34 s | Bare feet on terrazzo; the corridor stretches; behind the end door, faintly, coffee boiling and her kitchen clock; the lights die one by one |
| 5 | The coffee cup | 30 s | A finjan spins, grows, gives chase and spills coffee upward like black rain; he falls into it |
| 6 | Mother and childhood | 46 s | A golden kitchen; the boy turns and looks at the man he will become; she gives the boy a red balloon, strokes his hair, then looks at the man and smiles; he reaches, the balloon slips away, and the memory closes like a door |
| 7 | Waking before dawn | 32 s | A jolt; flashes of the nightmares; 04:51 → 04:52; a tear; the photo of his mother glows once under his fingertips |
| 8 | Morning routine | 26 s | The mirror, a face he touches to check it is his; a paracetamol; water |
| 9 | Leaving home | 26 s | Stairwell; the street wakes: shutters, a ka'ak seller, children walking to school |
| 10 | Work | 34 s | The day repeats the night: the coffee comes in the same finjan, the office aisle is the corridor, the pile of paper grows back however much he clears, and the office floods like the sea until he closes his eyes |
| 11 | The red balloon | 33 s | Golden afternoon. A little girl with dark brown hair, in a blue dress, gives him her red balloon |
| 12 | Final moment | 40 s | His first smile. He lets the balloon go by his own choice. Home. The same bedroom, golden now; the balloon drifts past the window |
| — | Ending | 25 s | حنين · "To the generations still searching for their balloon" · a one-line note: made entirely with AI · Claude |

The red balloon is the thread of the story: lost in childhood, given back by a stranger's child, and finally released by his own choice. It appears only in the waking world and the memory, never in the nightmares.

The day mirrors the night: the finjan that chased him is the cup he is handed at the kiosk, the office aisle stretches like the corridor, and the work that never shrinks drowns him like the sea.

Music: one theme in Maqam Nahawand on D, played on oud and ney over strings. It is whispered in the bedroom, broken into drones and ostinatos in the nightmares and at work, whole in the mother's kitchen, and silent in the bathroom. When he first smiles it returns in Ajam (D major), the first major chord of the film.

Palestinian details: tatreez cross-stitch on the mother's thobe, the framed embroidery and the finjans; a brass rakweh; cement-tile floors; limestone buildings with rooftop water tanks and solar heaters; black-and-white painted curbs; Arabic shop signs; a ka'ak seller's cart; Arabic-Indic door numbers.

## How it's built

```
index.html              player shell (canvas, HUD, start screen)
js/core.js              engine: math/easing/noise, drawing helpers, timeline, dissolves & fades,
                        film grain + vignette, cached/offscreen layers, player controls
js/audio.js             Web Audio: noise beds, synthesized one-shots, shared reverbs, and a director that
                        starts and stops each scene's sound so seeking always lands in sync
js/characters.js        C.head: a pseudo-3D painted head (man, mother, boy, girl; gaze, smile, tears, lighting);
                        C.figure: posable body (side/front/back); C.hand; pose library
js/sets.js              shared sets: the red balloon, the bedroom (night, dawn, golden), the ceiling,
                        the pillow close-up, and a perspective Palestinian street
js/music.js             the score: oud (Karplus-Strong), ney, string pad, piano, cello; one cue per scene
js/scenes/*.js          one file per scene: its shots (draw) and its soundscape (audio)
```

Each scene registers itself with `FILM.scene({ order, name, dur, draw(ctx, t), audio(h, fx), dissolve, fadeIn, fadeOut, post })`. `draw` gets scene-local time and paints a 1920×804 (2.39:1) logical frame. `audio` schedules sound against the same scene-local clock, and the audio clock drives the picture.

## Credits

Directed by Qussai Anas. Made entirely with AI (Claude by Anthropic): every image, sound and note was written in code.
