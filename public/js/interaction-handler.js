class InteractionHandler {
    constructor() {
        this.currentModel = null;
        this.isRotating = false;
        this.isScaling = false;
        this.lastTouchDistance = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const scene = document.querySelector('a-scene');

        // Touch events for rotation
        scene.addEventListener('touchstart', this.handleTouchStart.bind(this));
        scene.addEventListener('touchmove', this.handleTouchMove.bind(this));
        scene.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Button controls
        document.getElementById('rotate-model').addEventListener('click', () => {
            this.isRotating = !this.isRotating;
            this.isScaling = false;
            this.updateButtonStates();
        });

        document.getElementById('scale-model').addEventListener('click', () => {
            this.isScaling = !this.isScaling;
            this.isRotating = false;
            this.updateButtonStates();
        });
    }

    handleTouchStart(event) {
        if (event.touches.length === 2 && this.isScaling) {
            this.lastTouchDistance = this.getTouchDistance(event.touches);
        }
    }

    handleTouchMove(event) {
        if (!this.currentModel) return;

        if (this.isRotating && event.touches.length === 1) {
            const touch = event.touches[0];
            const movement = touch.movementX || 0;
            const currentRotation = this.currentModel.getAttribute('rotation');
            this.currentModel.setAttribute('rotation', {
                x: currentRotation.x,
                y: currentRotation.y + movement * 0.5,
                z: currentRotation.z
            });
        } else if (this.isScaling && event.touches.length === 2) {
            const currentDistance = this.getTouchDistance(event.touches);
            const scale = currentDistance / this.lastTouchDistance;
            const currentScale = this.currentModel.getAttribute('scale');
            this.currentModel.setAttribute('scale', {
                x: currentScale.x * scale,
                y: currentScale.y * scale,
                z: currentScale.z * scale
            });
            this.lastTouchDistance = currentDistance;
        }
    }

    handleTouchEnd() {
        this.lastTouchDistance = 0;
    }

    getTouchDistance(touches) {
        const dx = touches[1].clientX - touches[0].clientX;
        const dy = touches[1].clientY - touches[0].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    updateButtonStates() {
        const rotateBtn = document.getElementById('rotate-model');
        const scaleBtn = document.getElementById('scale-model');
        
        rotateBtn.style.background = this.isRotating ? '#2ecc71' : '#4a90e2';
        scaleBtn.style.background = this.isScaling ? '#2ecc71' : '#4a90e2';
    }
}

const interactionHandler = new InteractionHandler();
