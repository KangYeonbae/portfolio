"""Generate the portrait renderer's motion vectors. Requires OpenCV and NumPy."""

from pathlib import Path

import cv2
import numpy as np


PORTRAITS = Path(__file__).resolve().parents[1] / "public" / "portrait"
POSES = (
    "up-left", "up", "up-right",
    "left", "center", "right",
    "down-left", "down", "down-right",
)
WIDTH, HEIGHT = 576, 768
GRID_WIDTH, GRID_HEIGHT = 73, 97
FLOW_SCALE = 1152


def read_photo(path):
    photo = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if photo is None:
        raise ValueError(f"Could not read {path}")
    return cv2.resize(photo, (WIDTH, HEIGHT), interpolation=cv2.INTER_AREA)


def main():
    center = read_photo(PORTRAITS / "front.jpg")
    flow_estimator = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    flow_estimator.setFinestScale(0)
    x, y = np.meshgrid(
        np.linspace(0, WIDTH - 1, GRID_WIDTH, dtype=np.float32),
        np.linspace(0, HEIGHT - 1, GRID_HEIGHT, dtype=np.float32),
    )
    # Pin the outer edge and damp small ripples in the flow across the background.
    edge = np.minimum.reduce((x, WIDTH - 1 - x, y, HEIGHT - 1 - y))
    edge_weight = np.clip(edge / 36, 0, 1)[..., None]
    output = bytearray()
    for pose in POSES:
        if pose == "center":
            output.extend(np.full((GRID_HEIGHT, GRID_WIDTH, 2), 128, np.uint8).tobytes())
            continue

        photo = read_photo(PORTRAITS / f"gaze-{pose}.png")
        flow = flow_estimator.calc(center, photo, None)
        flow = cv2.GaussianBlur(flow, (0, 0), 1.0)
        sampled = cv2.remap(flow, x, y, cv2.INTER_LINEAR) * edge_weight
        sampled /= np.array([WIDTH - 1, HEIGHT - 1], dtype=np.float32)
        output.extend(np.clip(np.rint(sampled * FLOW_SCALE) + 128, 0, 255).astype(np.uint8).tobytes())

    (PORTRAITS / "gaze-flow.bin").write_bytes(output)


if __name__ == "__main__":
    main()
