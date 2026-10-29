# 🥑 Smart Pantry — on-device produce detection · React Native · FastAPI · MongoDB

**Detection never touches the backend** — online or offline, the bundled YOLOv8m ONNX model runs on the phone.
The backend is used only *afterwards*: when you confirm a scan, the inventory is saved to MongoDB (queued locally if offline, synced when the network returns), plus auth, recipes, copilot, notifications, admin.

```
PHONE ── camera/gallery → resize (aspect kept) → rect letterbox → ONNX Runtime (bundled detector.onnx) → NMS
      → Review HUD (tap box to correct) → local pantry ─────── confirm ──▶ BACKEND: /inventory/sync → MongoDB
```

## Setup (the model is already installed in this zip)
```bash
# web showcase & mobile APK portal
cd web && npm install && npm run dev          # http://localhost:3000
cd backend && cp .env.example .env && docker compose up --build      # http://localhost:8000/docs
# mobile  (needs a dev build - onnxruntime is native; Expo Go can't run it)
cd mobile && cp .env.example .env     # EXPO_PUBLIC_API_URL = your PC LAN IP or HTTPS URL
npm install && npx expo run:android   # or run:ios
```
Retrained? `python ml/install_model.py --onnx new.onnx --version v2` rewrites `labels.json` + the bundled model from the ONNX's own metadata.

## Your model (read from `detector_50epochs.onnx`)
YOLOv8m · 35 classes (order identical to your notebook) · input `images [batch,3,h,w]` (dynamic) · output `output0 [batch,39,anchors]` (4 box + 35 class scores, **no NMS inside**, so the app does NMS) · opset 14 · 104 MB.

## Why detection used to mismatch — and what is applied now
Your notebook's "mobile" cell **stretched** photos to 640×640. Ultralytics `predict()` instead keeps the aspect ratio and pads with grey 114 only up to a multiple of 32. Measured on your ONNX: the stretch moves the input by **37 gray levels** on average, so 3/20 of your photos failed. The app now does exactly what Ultralytics does:
| Step | Applied |
|---|---|
| Colour/scale | RGB, ÷255, CHW |
| Resize | aspect-preserving (never stretch), long side 640 |
| Padding | grey 114, **rectangular** (e.g. 4:3 → 640×480 tensor) = `predict()` auto-letterbox; also ~25-45 % faster |
| Decode | conf filter → class-aware NMS (iou 0.45) → un-letterbox → clip |
| Proof | `npm run test:golden`: TS decoder == Python reference; letterbox geometry == Ultralytics replica for 16 photo shapes |

**Residual differences (honest):** the phone's image resizer is not OpenCV's, so inputs differ by ~1–2 gray levels (vs 37 for the stretch). That is the same noise band as switching between two official Ultralytics modes; borderline (low-confidence) detections can occasionally flip class. That's what the **tap-to-correct** alternatives are for.

### Verify it on YOUR phone (30 seconds)
Settings → **Detection self-test** runs 3 bundled photos through the real phone pipeline and compares with reference results computed from your ONNX. Bundled photos are generic collages (threshold 75 %); for the strictest in-domain check use 3 of *your* validation photos:
`python ml/make_selftest.py --images valid1.jpg valid2.jpg valid3.jpg` (threshold 90 %), rebuild, run the self-test.
In Colab, replace notebook cell 41 with `ml/colab_parity_cell.py` (same pipeline) to see PyTorch↔ONNX parity without the stretch.
`ml/simulate_phone_pipeline.py` reproduces my drift measurements on any photo folder.

## Accuracy & speed — what your notebook actually says
- Validation mAP@50 **91.3 %** (not the 96 % target), recall 84.8 %. Weak classes: **Melon** (recall 0.30), **Turnip** (AP50 0.33), **Potato** (0.72), **Pineapple** (0.81), Tomato/Ginger/Carrot (~0.86). Expect more misses/confusions there; the Review screen's tap-to-correct, "Add a missing item", and the confidence slider (Settings) exist for this.
- The "test" split has only 10 images (all cabbage) and val has 147 — the metrics are noisy. More val/test data would make them trustworthy.
- Speed is **not benchmarked on a phone** (no device here). YOLOv8m is ~79 GFLOPs: expect roughly 1–4 s per photo on mid-range phones on CPU. If that's too slow, retrain `yolov8s` (≈3× cheaper) and run `install_model.py`.

## Hybrid / backend roles
| On the phone, always | Backend (when you confirm / online) |
|---|---|
| detection, shelf-life, urgency, recipes matching, nutrition, local expiry notifications, offline queue | login/JWT, inventory sync (idempotent, last-write-wins) → MongoDB, scan-correction telemetry, copilot LLM (offline rule fallback), announcements/push, admin stats, **optional OTA model updates** (turn off: Settings → Auto-update model) |

## Tests
`cd backend && pytest` (12) · `cd mobile && npm run typecheck && npm run test:golden` · `python ml/simulate_phone_pipeline.py --onnx ... --images ...`

## Web Showcase & APK Download Portal
Included in `web/`: modern interactive showcase with live YOLO HUD playground, 50-epoch validation metrics, tech stack architecture diagram, API explorer, and direct Android APK download portal with QR code. Run `cd web && npm run dev` or build with `npm run build`.

## Not included
Admin web dashboard for managing users (admin REST API is), live-video detection (photo scan only), phone benchmarks. Shelf-life/nutrition values are baseline estimates. Versions target Expo SDK 54 (`npx expo install --fix` if you differ).
