# Interactive Web-Based AR Application

This is a modern web-based Augmented Reality (AR) application that allows users to interact with 3D objects in their real environment using their device's camera.

## Live here

[https://ar-interactive-web.vercel.app/](https://ar-interactive-web.vercel.app/)

## Video

[https://youtu.be/](https://youtu.be/)

## Members

- Jasurbek Ergashev
- Mukhtor Eshimov
- Munira Rakhmatova

## Features

- Real-time AR visualization using A-Frame and AR.js
- Marker-based AR tracking
- Interactive 3D model manipulation:
  - Rotation using touch gestures
  - Scaling using pinch gestures
  - Multiple model selection
- Modern UI with intuitive controls
- Real-time feedback and instructions
- Responsive design for mobile devices

## Prerequisites

- Node.js (v14 or higher)
- NPM (v6 or higher)
- Modern web browser with WebXR support
- Device with camera access

## Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Allow camera access when prompted
2. Point your camera at a flat surface
3. Use the on-screen controls to:
   - Select different 3D models
   - Toggle rotation mode
   - Toggle scaling mode
4. Use touch gestures to:
   - Swipe to rotate in rotation mode
   - Pinch to scale in scaling mode

## Project Structure

```
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── ar-controller.js
│   │   ├── interaction-handler.js
│   │   └── ui-controller.js
│   ├── models/
│   │   └── [3D models in GLTF format]
│   └── index.html
├── server.js
├── package.json
└── README.md
```
