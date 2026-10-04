from datasets import load_dataset
from pathlib import Path

print("Downloading dataset...")

# Load the dataset
dataset = load_dataset(
    "jonathan-roberts1/Satellite-Images-of-Hurricane-Damage",
    split="train"
)

# Folders
damaged_folder = Path("backend/damaged")
undamaged_folder = Path("backend/undamaged")

damaged_folder.mkdir(parents=True, exist_ok=True)
undamaged_folder.mkdir(parents=True, exist_ok=True)

# Maximum images per class for our first model
MAX_IMAGES = 1000

damaged_count = 0
undamaged_count = 0

# Get class names
label_feature = dataset.features["label"]

print("Classes:", label_feature.names)

for i, item in enumerate(dataset):

    label = item["label"]
    label_name = label_feature.int2str(label).lower()

    # Identify damaged images
    if label_name == "flooded or damaged buildings":

        if damaged_count >= MAX_IMAGES:
            continue

        filename = damaged_folder / f"damaged_{damaged_count + 1}.jpg"

        image = item["image"].convert("RGB")
        image.save(filename, "JPEG")

        damaged_count += 1

    # Identify undamaged images
    else:

        if undamaged_count >= MAX_IMAGES:
            continue

        filename = undamaged_folder / f"undamaged_{undamaged_count + 1}.jpg"

        image = item["image"].convert("RGB")
        image.save(filename, "JPEG")

        undamaged_count += 1

    if damaged_count >= MAX_IMAGES and undamaged_count >= MAX_IMAGES:
        break

print()
print("Dataset download completed!")
print("Damaged images:", damaged_count)
print("Undamaged images:", undamaged_count)
print()
print("Images saved in:")
print("backend/damaged")
print("backend/undamaged")