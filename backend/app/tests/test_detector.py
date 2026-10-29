import numpy as np
from PIL import Image

from app.services.detector import decode_yolov8, make_letterbox, preprocess


def make_out(nc, anchors):
    """anchors: list of (cx, cy, w, h, {cls: score}) in 640-letterbox px -> Ultralytics layout [1, 4+nc, N]"""
    out = np.zeros((1, 4 + nc, len(anchors)), dtype=np.float32)
    for i, (cx, cy, w, h, sc) in enumerate(anchors):
        out[0, :4, i] = (cx, cy, w, h)
        for c, s in sc.items():
            out[0, 4 + c, i] = s
    return out


def test_letterbox_geometry_rect_like_ultralytics_predict():
    lb = make_letterbox(1280, 960, 640)  # auto=True: 480 is already a multiple of 32 -> no vertical pad
    assert (lb.new_w, lb.new_h, lb.canvas_w, lb.canvas_h, lb.pad_x, lb.pad_y) == (640, 480, 640, 480, 0, 0)
    lb = make_letterbox(1500, 1000, 640)  # 640x427 -> pad 213 % 32 = 21 -> canvas height 448, pads 10/11
    assert (lb.new_h, lb.canvas_h, lb.pad_y) == (427, 448, 10)


def test_letterbox_geometry_square_mode():
    lb = make_letterbox(1280, 960, 640, auto=False)
    assert (lb.canvas_w, lb.canvas_h, lb.pad_y) == (640, 640, 80)


def test_preprocess_pads_with_114_and_is_chw():
    t, lb = preprocess(Image.new("RGB", (200, 150), (255, 0, 0)), 640, auto=False)
    assert t.shape == (1, 3, 640, 640) and t.dtype == np.float32
    assert abs(t[0, 0, 0, 0] - 114 / 255) < 1e-6  # padding
    assert t[0, 0, 320, 320] == 1.0 and t[0, 1, 320, 320] == 0.0  # red centre
    t2, lb2 = preprocess(Image.new("RGB", (200, 150), (255, 0, 0)), 640)  # rect: 640x480, no padding needed
    assert t2.shape == (1, 3, 480, 640)


def test_decode_nms_and_unletterbox():
    lb = make_letterbox(1280, 960, 640, auto=False)  # pad_y = 80, scale .5
    out = make_out(5, [
        (320, 320, 100, 100, {1: 0.9}),
        (322, 321, 100, 100, {1: 0.8}),            # same class dup -> suppressed
        (322, 321, 100, 100, {2: 0.7, 1: 0.8}),    # best is class 1 -> dup too
        (500, 200, 60, 60, {3: 0.6}),
        (100, 100, 40, 40, {0: 0.1}),              # below conf
    ])
    d = decode_yolov8(out, 5, lb, conf=0.35, iou=0.45)
    assert [x["class_id"] for x in d] == [1, 3]
    x, y, w, h = d[0]["bbox"]
    # box centre (320,320) -> original (640, 480) -> normalised (0.5, 0.5); size 100px -> 200 px of 1280
    assert abs((x + w / 2) - 0.5) < 1e-6 and abs((y + h / 2) - 0.5) < 1e-6 and abs(w - 200 / 1280) < 1e-6


def test_cross_class_duplicate_becomes_alternative():
    lb = make_letterbox(640, 640, 640)
    out = make_out(4, [(300, 300, 120, 120, {0: 0.8}), (301, 300, 120, 120, {1: 0.6})])
    d = decode_yolov8(out, 4, lb)
    assert len(d) == 1 and d[0]["class_id"] == 0 and d[0]["alternatives"][0]["class_id"] == 1


def test_accepts_channel_last_layout():
    lb = make_letterbox(640, 640, 640)
    out = make_out(3, [(100, 100, 50, 50, {2: 0.9})]).transpose(0, 2, 1)
    assert decode_yolov8(out, 3, lb)[0]["class_id"] == 2


def test_onnx_load_metadata_and_detect_endpoint(tmp_path):
    """Build a tiny ONNX that emits one fixed YOLO-style detection and run it through DetectorService."""
    import onnx
    from onnx import TensorProto as T, helper as H, numpy_helper as N
    from app.services.detector import DetectorService

    nc, n = 3, 8400
    fixed = np.zeros((1, 4 + nc, n), dtype=np.float32)
    fixed[0, :4, 0] = (320, 240, 200, 200); fixed[0, 5, 0] = 0.88  # class 1 at the centre of the 640x480 canvas
    nodes = [
        H.make_node("ReduceMean", ["images"], ["m"], keepdims=0),
        H.make_node("Mul", ["m", "zero"], ["z"]),
        H.make_node("Add", ["fixed", "z"], ["output0"]),
    ]
    g = H.make_graph(nodes, "g", [H.make_tensor_value_info("images", T.FLOAT, ["batch", 3, "height", "width"])],
                     [H.make_tensor_value_info("output0", T.FLOAT, [1, 4 + nc, n])],
                     [N.from_array(fixed, "fixed"), N.from_array(np.array(0, np.float32), "zero")])
    m = H.make_model(g, opset_imports=[H.make_opsetid("", 13)])
    m.ir_version = 8
    for k, v in {"names": "{0: 'Apple', 1: 'Bitter_Gourd', 2: 'EggPlant'}", "imgsz": "[640, 640]"}.items():
        e = m.metadata_props.add(); e.key, e.value = k, v
    path = tmp_path / "detector.onnx"
    onnx.save(m, path)

    d = DetectorService()
    d.load(path, "test-v1")
    assert d.names == ["Apple", "Bitter_Gourd", "EggPlant"]
    res = d.detect(Image.new("RGB", (800, 600), (30, 200, 30)), conf=0.35, iou=0.45)
    det = res["detections"][0]
    assert det["class_key"] == "bitter_gourd" and det["label"] == "Bitter Gourd" and abs(det["score"] - 0.88) < 1e-4
    x, y, w, h = det["bbox"]
    assert abs(x + w / 2 - 0.5) < 1e-3 and abs(y + h / 2 - 0.5) < 1e-3
    assert res["detector_version"] == "test-v1" and res["timings"]["inference"] >= 0
