// Utility function to show feedback messages
function showFeedback(message, duration = 2000) {
    const feedback = document.getElementById('feedbackMessage');
    feedback.textContent = message;
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, duration);
}

// Register ground placement component
AFRAME.registerComponent('ar-ground-placement', {
    schema: {
        minScale: { default: 0.1 },
        maxScale: { default: 0.5 },
        defaultScale: { default: 0.2 }
    },

    init: function() {
        this.el.addEventListener('loaded', this.onSceneLoaded.bind(this));
        this.car = null;
        this.isPlacing = false;
        
        // Initialize touch state
        this.touchState = {
            startTime: 0,
            startPosition: { x: 0, y: 0 },
            lastPosition: { x: 0, y: 0 },
            lastScale: 1,
            lastRotation: 0
        };

        // Create raycaster for ground detection
        this.raycaster = new THREE.Raycaster();
        this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        
        // Bind methods
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
    },

    onSceneLoaded: function() {
        this.setupControls();
        
        // Add touch event listeners
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onTouchEnd);

        showFeedback('Point camera at the ground and tap to place car', 3000);
    },

    setupControls: function() {
        const modelSelect = document.getElementById('carModel');
        modelSelect.addEventListener('change', () => {
            if (this.car) {
                const modelId = modelSelect.value;
                this.car.setAttribute('gltf-model', `#${modelId}`);
                showFeedback(`Changed car model to ${modelId}`, 2000);
            }
        });

        const colorPicker = document.getElementById('carColor');
        colorPicker.addEventListener('input', () => {
            if (this.car) {
                const color = colorPicker.value;
                this.car.setAttribute('material', { color: color, metalness: 0.8, roughness: 0.2 });
                showFeedback('Updated car color', 1000);
            }
        });

        const placeButton = document.getElementById('placeCar');
        placeButton.addEventListener('click', () => {
            this.isPlacing = true;
            showFeedback('Tap on the ground to place the car', 2000);
        });

        const resetButton = document.getElementById('resetView');
        resetButton.addEventListener('click', () => {
            if (this.car) {
                this.car.parentNode.removeChild(this.car);
                this.car = null;
                showFeedback('View reset. Tap to place a new car', 2000);
            }
        });
    },

    onTouchStart: function(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchState.startTime = Date.now();
            this.touchState.startPosition = { x: touch.clientX, y: touch.clientY };
            this.touchState.lastPosition = { x: touch.clientX, y: touch.clientY };

            if (this.isPlacing || !this.car) {
                const position = this.getGroundPosition(touch);
                if (position) {
                    this.placeCar(position);
                    this.isPlacing = false;
                }
            }
        }
    },

    getGroundPosition: function(touch) {
        // Convert touch coordinates to normalized device coordinates (-1 to +1)
        const x = (touch.clientX / window.innerWidth) * 2 - 1;
        const y = -(touch.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        const camera = this.el.sceneEl.camera;
        this.raycaster.setFromCamera({ x, y }, camera);

        // Get the intersection point with the ground plane
        const intersection = new THREE.Vector3();
        const ray = this.raycaster.ray;
        
        if (ray.intersectPlane(this.groundPlane, intersection)) {
            // Add a small offset to ensure the car is slightly above ground
            intersection.y += 0.01;
            return intersection;
        }
        return null;
    },

    onTouchMove: function(event) {
        event.preventDefault();
        
        if (!this.car) return;

        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            if (this.touchState.lastScale) {
                // Handle scaling
                const scale = this.car.getAttribute('scale');
                const scaleFactor = distance / this.touchState.lastScale;
                const newScale = Math.min(
                    Math.max(scale.x * scaleFactor, this.data.minScale),
                    this.data.maxScale
                );
                this.car.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);

                // Handle rotation (only Y-axis)
                const rotationDelta = (angle - this.touchState.lastRotation) * (180 / Math.PI);
                const currentRotation = this.car.getAttribute('rotation');
                this.car.setAttribute('rotation', {
                    x: 0, // Lock X rotation
                    y: currentRotation.y + rotationDelta,
                    z: 0  // Lock Z rotation
                });
            }

            this.touchState.lastScale = distance;
            this.touchState.lastRotation = angle;
        }
    },

    onTouchEnd: function() {
        this.touchState.lastScale = null;
        this.touchState.lastRotation = null;
    },

    placeCar: function(position) {
        if (this.car) {
            this.car.parentNode.removeChild(this.car);
        }

        this.car = document.createElement('a-entity');
        this.car.setAttribute('position', position);
        
        const modelId = document.getElementById('carModel').value;
        const color = document.getElementById('carColor').value;
        
        this.car.setAttribute('gltf-model', `#${modelId}`);
        this.car.setAttribute('scale', `${this.data.defaultScale} ${this.data.defaultScale} ${this.data.defaultScale}`);
        this.car.setAttribute('shadow', 'cast: true; receive: true');
        this.car.setAttribute('material', { color: color, metalness: 0.8, roughness: 0.2 });
        
        // Add physics to keep the car grounded
        this.car.setAttribute('static-body', '');
        
        this.el.sceneEl.appendChild(this.car);
        showFeedback('Car placed! Use two fingers to rotate and zoom', 3000);
    }
});

// Wait for A-Frame to load
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    scene.setAttribute('ar-ground-placement', '');

    // Hide loading screen when AR.js is ready
    document.querySelector('a-scene').addEventListener('loaded', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });

    // Handle marker detection and video playback for Great Wall
    const greatWallMarker = document.querySelector('a-marker[url="markers/great-wall.patt"]');
    const greatWallVideo = document.querySelector('#great-wall-video');

    greatWallMarker.addEventListener('markerFound', function() {
        console.log('Great Wall marker detected');
        greatWallVideo.play();
    });

    greatWallMarker.addEventListener('markerLost', function() {
        console.log('Great Wall marker lost');
        greatWallVideo.pause();
    });

    // Handle marker detection and video playback for Taj Mahal
    const tajMahalMarker = document.querySelector('a-marker[url="markers/taj-mahal.patt"]');
    const tajMahalVideo = document.querySelector('#taj-mahal-video');

    tajMahalMarker.addEventListener('markerFound', function() {
        console.log('Taj Mahal marker detected');
        tajMahalVideo.play();
    });

    tajMahalMarker.addEventListener('markerLost', function() {
        console.log('Taj Mahal marker lost');
        tajMahalVideo.pause();
    });

    // Error handling for video loading
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.addEventListener('error', function() {
            console.error('Error loading video:', video.id);
        });
    });
});
