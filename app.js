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
        this.groundPlane = document.querySelector('#ground');
        this.car = null;
        this.isPlacing = false;
        this.raycaster = new AFRAME.THREE.Raycaster();
        this.mouse = new AFRAME.THREE.Vector2();
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        
        // Initialize touch state
        this.touchState = {
            startTime: 0,
            startPosition: { x: 0, y: 0 },
            lastPosition: { x: 0, y: 0 },
            lastScale: 1,
            lastRotation: 0
        };
    },

    onSceneLoaded: function() {
        // Setup UI controls
        this.setupControls();
        
        // Add touch event listeners
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onTouchEnd);

        showFeedback('Point camera at the ground and tap to place car', 3000);
    },

    setupControls: function() {
        // Car model selection
        const modelSelect = document.getElementById('carModel');
        modelSelect.addEventListener('change', () => {
            if (this.car) {
                const modelId = modelSelect.value;
                this.car.setAttribute('gltf-model', `#${modelId}`);
                showFeedback(`Changed car model to ${modelId}`, 2000);
            }
        });

        // Car color selection
        const colorPicker = document.getElementById('carColor');
        colorPicker.addEventListener('input', () => {
            if (this.car) {
                const color = colorPicker.value;
                this.car.setAttribute('material', { color: color, metalness: 0.8, roughness: 0.2 });
                showFeedback('Updated car color', 1000);
            }
        });

        // Place car button
        const placeButton = document.getElementById('placeCar');
        placeButton.addEventListener('click', () => {
            this.isPlacing = true;
            showFeedback('Tap on the ground to place the car', 2000);
        });

        // Reset view button
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
                const intersection = this.getRaycasterIntersection(touch);
                if (intersection) {
                    this.placeCar(intersection.point);
                    this.isPlacing = false;
                }
            }
        }
    },

    onTouchMove: function(event) {
        event.preventDefault();
        
        if (!this.car) return;

        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            // Calculate rotation and scale
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

                // Handle rotation
                const rotationDelta = (angle - this.touchState.lastRotation) * (180 / Math.PI);
                const currentRotation = this.car.getAttribute('rotation');
                this.car.setAttribute('rotation', {
                    x: currentRotation.x,
                    y: currentRotation.y + rotationDelta,
                    z: currentRotation.z
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

    getRaycasterIntersection: function(touch) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        const camera = this.el.sceneEl.camera;
        this.raycaster.setFromCamera(this.mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObject(this.el.sceneEl.object3D, true);
        
        return intersects.length > 0 ? intersects[0] : null;
    },

    placeCar: function(position) {
        // Remove existing car if any
        if (this.car) {
            this.car.parentNode.removeChild(this.car);
        }

        // Create new car entity
        this.car = document.createElement('a-entity');
        this.car.setAttribute('position', {
            x: position.x,
            y: position.y + 0.01, // Slight offset to prevent z-fighting
            z: position.z
        });
        
        const modelId = document.getElementById('carModel').value;
        const color = document.getElementById('carColor').value;
        
        this.car.setAttribute('gltf-model', `#${modelId}`);
        this.car.setAttribute('scale', `${this.data.defaultScale} ${this.data.defaultScale} ${this.data.defaultScale}`);
        this.car.setAttribute('shadow', 'cast: true; receive: true');
        this.car.setAttribute('material', { color: color, metalness: 0.8, roughness: 0.2 });

        // Add to scene
        this.el.sceneEl.appendChild(this.car);
        showFeedback('Car placed! Use two fingers to rotate and zoom', 3000);
    }
});

// Wait for A-Frame to load
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    scene.setAttribute('ar-ground-placement', '');
});
