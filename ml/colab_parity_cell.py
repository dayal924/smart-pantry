# ============================================================================================
# REPLACEMENT for notebook Section 11 (cell 41). Same pipeline as the phone app:
#   Ultralytics-style rectangular letterbox (cv2 INTER_LINEAR, grey 114, pad to multiple of 32)
#   -> ONNX (dynamic h/w) -> decode: conf filter, class-aware NMS -> un-letterbox.
# The old cell STRETCHED photos to 640x640; that is what produced the "CHECK" rows (3 vs 1 detections).
# Paste into Colab AFTER the cell that defines `eval_model`, `session`, `test_photos`.
# ============================================================================================
import cv2, math, numpy as np
from PIL import Image

_r = lambda x: int(math.floor(x + 0.5))

def letterbox_rect(rgb, size=640, stride=32):
    h, w = rgb.shape[:2]; r = min(size / h, size / w)
    nw, nh = _r(w * r), _r(h * r)
    dw, dh = (size - nw) % stride / 2, (size - nh) % stride / 2          # auto=True  (what model.predict does)
    img = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_LINEAR) if (nw, nh) != (w, h) else rgb
    t, b, l, rr = _r(dh - 0.1), _r(dh + 0.1), _r(dw - 0.1), _r(dw + 0.1)
    img = cv2.copyMakeBorder(img, t, b, l, rr, cv2.BORDER_CONSTANT, value=(114, 114, 114))
    return img, dict(w=w, h=h, sx=nw / w, sy=nh / h, px=l, py=t)

def _iou(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0])); iy = max(0, min(a[3], b[3]) - max(a[1], b[1])); i = ix * iy
    return i / ((a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - i + 1e-9)

def onnx_detect(sess, photo_path, conf=0.25, iou=0.45):
    rgb = np.asarray(Image.open(photo_path).convert("RGB"))               # RGB, not BGR
    img, g = letterbox_rect(rgb)
    x = np.ascontiguousarray(img.astype(np.float32).transpose(2, 0, 1)[None] / 255.0)   # CHW, /255
    out = sess.run(None, {sess.get_inputs()[0].name: x})[0][0].T          # [N, 4+nc]
    sc = out[:, 4:]; best = sc.max(1); cls = sc.argmax(1); idx = np.where(best >= conf)[0]
    idx = idx[np.argsort(-best[idx], kind="stable")]
    box = lambda i: (out[i,0]-out[i,2]/2, out[i,1]-out[i,3]/2, out[i,0]+out[i,2]/2, out[i,1]+out[i,3]/2)
    keep = []
    for i in idx:                                                          # class-aware greedy NMS (like Ultralytics)
        if all(not (cls[i] == cls[j] and _iou(box(i), box(j)) > iou) for j in keep): keep.append(i)
    dets = []
    for i in keep:
        x1, y1, x2, y2 = box(i)
        cl = lambda v, m: min(max(v, 0), m)
        X1, Y1 = cl((x1-g["px"])/g["sx"], g["w"]), cl((y1-g["py"])/g["sy"], g["h"])
        X2, Y2 = cl((x2-g["px"])/g["sx"], g["w"]), cl((y2-g["py"])/g["sy"], g["h"])
        dets.append(dict(class_id=int(cls[i]), score=float(best[i]), box=[X1/g["w"], Y1/g["h"], X2/g["w"], Y2/g["h"]]))
    return dets

def parity_report(eval_model, session, photos, conf=0.25, iou=0.45):
    rows = []
    for p in photos:
        py = eval_model.predict(str(p), conf=conf, iou=iou, verbose=False)[0].boxes
        mob = onnx_detect(session, p, conf, iou)
        ious, agree = [], 0
        for b in py:
            pb = b.xyxyn[0].tolist()
            best = max(mob, key=lambda m: _iou(pb, m["box"]), default=None)
            v = _iou(pb, best["box"]) if best else 0.0; ious.append(v)
            agree += int(best is not None and v >= 0.5 and best["class_id"] == int(b.cls[0]))
        n = len(py)
        rows.append((p.name[:26], n, len(mob), float(np.mean(ious)) if ious else 1.0, 100.0 * agree / n if n else 100.0))
    print(f"{'photo':<28}{'py':>4}{'onnx':>6}{'meanIoU':>9}{'class%':>8}")
    for r in rows: print(f"{r[0]:<28}{r[1]:>4}{r[2]:>6}{r[3]*100:>8.1f}%{r[4]:>7.1f}%")
    print(f"\nmean IoU {np.mean([r[3] for r in rows])*100:.2f}% | class agreement {np.mean([r[4] for r in rows]):.2f}% | same-count {sum(r[1]==r[2] for r in rows)}/{len(rows)}")

# --- run it (uses variables from the earlier cells) ---
# parity_report(eval_model, session, test_photos)
