class ARController {
    constructor() {
        this.scene = document.querySelector('a-scene');
        this.modelContainer = document.querySelector('#model-container');
        this.currentModel = null;
        this.isRotating = false;
        this.isScaling = false;
        this.models = {
            model1: {
                url: '/models/bugati_divo.glb',
                scale: '0.5 0.5 0.5',
                rotation: '0 180 0',
                position: '0 0 0'
            },
            model2: {
                url: '/models/ferrari_sf90_stradale.glb',
                scale: '0.3 0.3 0.3',
                rotation: '0 180 0',
                position: '0 0 0'
            },
            model3: {
                url: '/models/flamborghini_terzo_millennio.glb',
                scale: '0.4 0.4 0.4',
                rotation: '0 180 0',
                position: '0 0 0'
            }
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Scene loaded event
        this.scene.addEventListener('loaded', () => {
            document.querySelector('.arjs-loader').style.display = 'none';
            document.querySelector('.controls').style.display = 'flex';
        });

        // Touch events for rotation and scaling
        let touchStartX = 0;
        let touchStartY = 0;
        let initialDistance = 0;

        document.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            } else if (event.touches.length === 2) {
                initialDistance = Math.hypot(
                    event.touches[0].clientX - event.touches[1].clientX,
                    event.touches[0].clientY - event.touches[1].clientY
                );
            }
        });

        document.addEventListener('touchmove', (event) => {
            if (!this.currentModel) return;

            if (event.touches.length === 1 && this.isRotating) {
                const deltaX = event.touches[0].clientX - touchStartX;
                const currentRotation = this.currentModel.getAttribute('rotation');
                this.currentModel.setAttribute('rotation', {
                    x: currentRotation.x,
                    y: currentRotation.y + deltaX * 0.5,
                    z: currentRotation.z
                });
                touchStartX = event.touches[0].clientX;
            } else if (event.touches.length === 2 && this.isScaling) {
                const currentDistance = Math.hypot(
                    event.touches[0].clientX - event.touches[1].clientX,
                    event.touches[0].clientY - event.touches[1].clientY
                );
                const scaleFactor = currentDistance / initialDistance;
                const modelConfig = this.models[this.currentModel.dataset.modelKey];
                const baseScale = parseFloat(modelConfig.scale.split(' ')[0]);
                const newScale = baseScale * scaleFactor;
                this.currentModel.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);
            }
        });

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

    loadModel(modelKey) {
        if (this.currentModel) {
            this.modelContainer.removeChild(this.currentModel);
        }

        const modelConfig = this.models[modelKey];
        const model = document.createElement('a-entity');
        model.setAttribute('gltf-model', modelConfig.url);
        model.setAttribute('scale', modelConfig.scale);
        model.setAttribute('rotation', modelConfig.rotation);
        model.setAttribute('position', modelConfig.position);
        model.setAttribute('class', 'clickable');
        model.dataset.modelKey = modelKey;

        model.addEventListener('model-loaded', () => {
            this.showFeedback(`${modelKey.replace('model', 'Car ')} loaded successfully!`);
        });

        model.addEventListener('model-error', () => {
            this.showFeedback(`Error loading ${modelKey.replace('model', 'Car ')}. Please try again.`);
        });

        this.modelContainer.appendChild(model);
        this.currentModel = model;
    }

    updateButtonStates() {
        const rotateBtn = document.getElementById('rotate-model');
        const scaleBtn = document.getElementById('scale-model');
        
        rotateBtn.style.background = this.isRotating ? '#2ecc71' : '#4a90e2';
        scaleBtn.style.background = this.isScaling ? '#2ecc71' : '#4a90e2';
    }

    showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = message;
        document.body.appendChild(feedback);

        setTimeout(() => feedback.classList.add('show'), 100);
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => document.body.removeChild(feedback), 300);
        }, 2000);
    }
}

const arController = new ARController();
