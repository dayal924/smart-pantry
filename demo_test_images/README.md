# Smart Pantry - Demo Testing Image Dataset

This directory contains curated test images prepared specifically for testing and demonstrating the **Smart Pantry on-device YOLO produce detection system**.

---

## 📁 Directory Structure

```
demo_test_images/
├── dataset_samples/             # 8 multi-class, multi-object images from Roboflow dataset
│   ├── dataset_01_7_classes_fruit_platter_24_objects.jpg
│   ├── dataset_02_7_classes_kiwi_grape_orange_pineapple.jpg
│   ├── dataset_03_6_classes_validation_mixed_fruits.jpg
│   ├── dataset_04_6_classes_strawberry_grape_banana.jpg
│   ├── dataset_05_5_classes_produce_with_cauliflower.jpg
│   ├── dataset_06_4_classes_mango_pomegranate_banana_apple.jpg
│   ├── dataset_07_vegetables_carrots_and_cauliflower.jpg
│   └── dataset_08_vegetables_tomatoes_and_eggplants.jpg
└── gemini_generated/            # 6 realistic smartphone-style photos generated via Gemini
    ├── gemini_01_fruit_basket_kitchen.jpg
    ├── gemini_02_salad_prep_cutting_board.jpg
    ├── gemini_03_farm_root_vegetables.jpg
    ├── gemini_04_ceramic_bowl_berries_kiwi.jpg
    ├── gemini_05_cooking_vegetables_cabbage.jpg
    └── gemini_06_tropical_fruits_table.jpg
```

---

## 🎯 Part 1: Dataset Samples (Roboflow Ground-Truth)

| File | Number of Classes | Object Count | Ground-Truth Labels |
|---|:---:|:---:|---|
| `dataset_01_...` | **7 Classes** | 24 | Apple, Banana, Cherry, Orange, Peach, Pear, Pineapple |
| `dataset_02_...` | **7 Classes** | 11 | Apple, Grape, Kiwi, Orange, Peach, Pear, Pineapple |
| `dataset_03_...` | **6 Classes** | 10 | Apple, Banana, Grape, Orange, Peach, Pear |
| `dataset_04_...` | **6 Classes** | 13 | Apple, Banana, Grape, Orange, Pineapple, Strawberry |
| `dataset_05_...` | **5 Classes** | 5 | Apple, Cauliflower, Grape, Orange, Strawberry |
| `dataset_06_...` | **4 Classes** | 6 | Apple, Banana, Mango, Pomegranate |
| `dataset_07_...` | **2 Classes** | 9 | Carrot, Cauliflower |
| `dataset_08_...` | **2 Classes** | 4 | Tomato, EggPlant |

---

## 🤖 Part 2: Gemini AI-Generated Test Scenes

| File | Scene Description | Target Detection Classes |
|---|---|---|
| `gemini_01_fruit_basket_kitchen.jpg` | Bright kitchen fruit basket | Bananas, Red Apples, Green Apples, Oranges |
| `gemini_02_salad_prep_cutting_board.jpg` | Wooden cutting board with fresh produce | Tomatoes, Cucumber, Capsicum (Bell Pepper), Red Onions |
| `gemini_03_farm_root_vegetables.jpg` | Farm-fresh root vegetable arrangement | Carrots with greens, Potatoes, Radish, Beetroot |
| `gemini_04_ceramic_bowl_berries_kiwi.jpg` | Tabletop ceramic bowl with fruit | Strawberries, Grapes, Kiwi slices, Cherries |
| `gemini_05_cooking_vegetables_cabbage.jpg` | Fresh cooking vegetables on table | Cabbage head, Cauliflower, Green Peas, Chillies |
| `gemini_06_tropical_fruits_table.jpg` | Tropical produce banquet | Pineapple, Mangoes, Watermelon, Pomegranate |

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

