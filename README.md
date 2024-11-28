# Web AR Application

This is a web-based Augmented Reality (AR) application that demonstrates various AR features using A-Frame and AR.js frameworks.

## Features

- Marker-based AR detection
- 3D object placement and manipulation
- Interactive controls (rotation, scaling, movement)
- Visual feedback for user interactions
- Responsive UI with instructions

## Setup

1. Clone this repository
2. Serve the project using a local server (e.g., `python -m http.server` or Live Server in VS Code)
3. Open the application in an AR-compatible browser (Chrome or Safari)
4. Allow camera access when prompted

## Usage

1. Point your camera at a Hiro marker (standard AR.js marker)
2. Once detected, 3D objects will appear
3. Use touch gestures to interact with objects:
   - Pinch to scale
   - Swipe to rotate
   - Drag to move
4. Tap objects to trigger animations

## Technologies Used

- A-Frame (WebVR/WebXR framework)
- AR.js (Augmented Reality library)
- Three.js (3D graphics library)

## Requirements

- Modern web browser with WebXR support
- Device with camera access
- Stable internet connection