import torch
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
import torch.nn as nn
import torch.optim as optim

# -----------------------------
# 1. Device
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Using device:", device)

# -----------------------------
# 2. Image transformations
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

# -----------------------------
# 3. Load dataset
# -----------------------------
dataset = datasets.ImageFolder(
    "backend",
    transform=transform
)

print("Classes:", dataset.classes)
print("Total images:", len(dataset))

# -----------------------------
# 4. Split dataset
# -----------------------------
train_size = int(0.8 * len(dataset))
test_size = len(dataset) - train_size

train_dataset, test_dataset = random_split(
    dataset,
    [train_size, test_size]
)

print("Training images:", len(train_dataset))
print("Testing images:", len(test_dataset))

# -----------------------------
# 5. Data loaders
# -----------------------------
train_loader = DataLoader(
    train_dataset,
    batch_size=16,
    shuffle=True
)

test_loader = DataLoader(
    test_dataset,
    batch_size=16,
    shuffle=False
)

# -----------------------------
# 6. Load pretrained model
# -----------------------------
model = models.resnet18(weights="DEFAULT")

# Replace final layer
model.fc = nn.Linear(
    model.fc.in_features,
    2
)

model = model.to(device)

# -----------------------------
# 7. Loss and optimizer
# -----------------------------
criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.parameters(),
    lr=0.0001
)

# -----------------------------
# 8. Training
# -----------------------------
epochs = 5

for epoch in range(epochs):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total

    print(
        f"Epoch [{epoch + 1}/{epochs}] "
        f"Loss: {running_loss:.4f} "
        f"Accuracy: {accuracy:.2f}%"
    )

# -----------------------------
# 9. Save model
# -----------------------------
torch.save(
    model.state_dict(),
    "backend/model/damage_model.pth"
)

print()
print("Training completed!")
print("Model saved as:")
print("backend/model/damage_model.pth")