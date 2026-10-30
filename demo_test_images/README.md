# Smart Pantry - Demo Testing Image Dataset

This directory contains curated test images prepared specifically for testing and demonstrating the **Smart Pantry on-device YOLO produce detection system**.

---

## 📁 Directory Structure

```
demo_test_images/
├── dataset_samples/             # 14 Roboflow dataset ground-truth images (up to 96% accuracy)
│   ├── dataset_01_7_classes_fruit_platter_24_objects.jpg
│   ├── dataset_02_7_classes_kiwi_grape_orange_pineapple.jpg
│   ├── dataset_03_6_classes_validation_mixed_fruits.jpg
│   ├── dataset_04_6_classes_strawberry_grape_banana.jpg
│   ├── dataset_05_5_classes_produce_with_cauliflower.jpg
│   ├── dataset_06_4_classes_mango_pomegranate_banana_apple.jpg
│   ├── dataset_07_vegetables_carrots_and_cauliflower.jpg
│   ├── dataset_08_vegetables_tomatoes_and_eggplants.jpg
│   ├── dataset_09_chilli_sample_88pct.jpg
│   ├── dataset_10_peas_sample_92pct.jpg
│   ├── dataset_11_beetroot_sample_94pct.jpg
│   ├── dataset_12_mango_sample_95pct.jpg
│   ├── dataset_13_banana_sample_95pct.jpg
│   └── dataset_14_carrot_sample_96pct.jpg
└── gemini_generated/            # 6 realistic smartphone-style photos generated via Gemini
    ├── gemini_01_fruit_basket_kitchen.jpg
    ├── gemini_02_salad_prep_cutting_board.jpg
    ├── gemini_03_farm_root_vegetables.jpg
    ├── gemini_04_ceramic_bowl_berries_kiwi.jpg
    ├── gemini_05_cooking_vegetables_cabbage.jpg
    └── gemini_06_tropical_fruits_table.jpg
```

---

## 🎯 Part 1: Dataset Samples (Roboflow Ground-Truth Benchmarks)

| File | Classes & Benchmark Accuracy | Object Count | Ground-Truth Labels |
|---|---|:---:|---|
| `dataset_01_...` | **7 Classes** | 24 | Apple (95%), Banana (94%), Cherry (95%), Orange (92%), Peach (94%), Pear (94%), Pineapple (94%) |
| `dataset_02_...` | **7 Classes** | 11 | Pineapple (97%), Apple (96%), Grape (92%), Kiwi (90%), Peach (90%), Orange (89%), Pear (87%) |
| `dataset_03_...` | **6 Classes** | 10 | Apple (95%), Grape (80%), Banana (79%), Orange (51%) |
| `dataset_04_...` | **6 Classes** | 13 | Orange (96%), Pineapple (95%), Grape (94%), Banana (94%), Strawberry (92%), Apple (90%) |
| `dataset_05_...` | **5 Classes** | 5 | Orange (94%), Cauliflower (92%), Grape (92%), Apple (92%), Strawberry (86%) |
| `dataset_06_...` | **4 Classes (User Verified)** | 6 | **Mango (92%)**, **Pomegranate (91%)**, **Apple (95%)**, **Banana (79%)** |
| `dataset_07_...` | **2 Classes** | 9 | **Carrot (96%)**, **Cauliflower (94%)** |
| `dataset_08_...` | **2 Classes** | 4 | **EggPlant (96%)**, **Tomato (95%)** |
| `dataset_09_...` | **Benchmark Single Class** | 1 | **Chilli (88.8%)** |
| `dataset_10_...` | **Benchmark Single Class** | 1 | **Peas (92.3%)** |
| `dataset_11_...` | **Benchmark Single Class** | 1 | **Beetroot (93.7%)** |
| `dataset_12_...` | **Benchmark Single Class** | 1 | **Mango (93.9%)** |
| `dataset_13_...` | **Benchmark Single Class** | 1 | **Banana (95.7%)** |
| `dataset_14_...` | **Benchmark Single Class** | 1 | **Carrot (95.6%)** |

---

## 🤖 Part 2: Gemini AI-Generated Test Scenes & Findings

| File | Scene Description | On-Device Detections & Diagnostics |
|---|---|---|
| `gemini_01_fruit_basket_kitchen.jpg` | Kitchen fruit basket | **Apple (94-96%)**, **Banana (26.2%)** (Detected with threshold = 0.25). |
| `gemini_02_salad_prep_cutting_board.jpg` | Wooden cutting board | **Tomato (87%)**, **Capsicum (79%)**. |
| `gemini_03_farm_root_vegetables.jpg` | Root vegetables on table | **Beetroot (76.6%)**, **Potato (57%)**, **Potato (51%)**. Carrots have heavy leafy green foliage covering the root. |
| `gemini_04_ceramic_bowl_berries_kiwi.jpg` | Tabletop ceramic bowl | **Strawberry (90%)**, **Grape (87%)**. |
| `gemini_05_cooking_vegetables_cabbage.jpg` | Fresh vegetables on table | **Cauliflower (94%)**, **Cabbage (88%)**. Chillies and pea pods are small objects in foreground. |
| `gemini_06_tropical_fruits_table.jpg` | Tropical banquet | **Pineapple (96%)**, **Watermelon (92%)**, **Pomegranate (47%)**. Mangoes in deep table shadow under pineapple. |

---

## 📱 How to Test Live in Front of Sir

### Method A: Direct Phone Camera Scan (Easiest)
1. Open any of these images on your laptop screen in full screen.
2. Open **Smart Pantry** on your phone $\rightarrow$ navigate to the **Scan** tab.
3. Point your phone camera at your laptop screen and tap **Capture**.
4. The on-device YOLO model will detect bounding boxes, labels, and confidence scores in ~100 ms!

### Method B: Upload from Phone Gallery
1. Transfer any of these images to your phone storage (or use the preloaded samples).
2. In the app's **Scan** tab, tap the **Gallery / Photo Picker** icon.
3. Select any image $\rightarrow$ review detections $\rightarrow$ tap **Confirm to Pantry**.

---

## 💡 Key Tips for Demonstrating to Sir

1. **Dataset Authenticity Proof**:
   - Every single class (**Chilli, Peas, Beetroot, Carrot, Banana, Mango**) is 100% part of the Roboflow dataset:
     - `Mango`: 1,098 bboxes (277 images)
     - `Banana`: 478 bboxes (277 images)
     - `Chilli`: 372 bboxes (150 images)
     - `Peas`: 358 bboxes (211 images)
     - `Beetroot`: 348 bboxes (180 images)
     - `Carrot`: 201 bboxes (113 images)
2. **Confidence Tuning Demonstration**:
   - Open **Settings $\rightarrow$ AI Accuracy Tuning**.
   - Show how lowering the **Confidence threshold** from `0.35` to `0.25` immediately captures partially occluded or shadowy items (e.g., bananas curved in bowls).
3. **Human-in-the-Loop Smart Review**:
   - Show Sir that Smart Pantry is a production-grade system: if an item is occluded or in deep shadow, the user can tap **`+ Add item`** or tap any box to edit. Then the app automatically recommends whether it belongs in the **Refrigerator** or **Room Temperature** with USDA shelf-life guidance!
