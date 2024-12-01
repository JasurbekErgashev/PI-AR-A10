class ARController {
    constructor() {
        this.scene = document.querySelector('a-scene');
        this.modelContainer = document.querySelector('#model-container');
        this.currentModel = null;
        this.isRotating = false;
        this.isScaling = false;
        this.models = {
            model1: {
                url: './models/bugati_divo.glb',
                scale: '0.04 0.04 0.04',
                rotation: '0 180 0',
                position: '0 0.5 -2'
            },
            model2: {
                url: './models/ferrari_sf90_stradale.glb',
                scale: '0.4 0.4 0.4',
                rotation: '0 180 0',
                position: '0 0.5 -2'
            },
            model3: {
                url: './models/flamborghini_terzo_millennio.glb',
                scale: '0.4 0.4 0.4',
                rotation: '0 180 0',
                position: '0 0.5 -2'
            }
        };

        // Cache for loaded models
        this.modelCache = new Map();
        
        this.setupEventListeners();
        this.preloadModels().then(() => {
            // Auto-load the first model after preloading
            this.loadModel('model1');
            // Highlight the first button
            document.querySelector('[data-model="model1"]').classList.add('active');
        });
    }

    async preloadModels() {
        const loader = new THREE.GLTFLoader();
        const loadPromises = Object.entries(this.models).map(([key, model]) => {
            return new Promise((resolve, reject) => {
                loader.load(
                    model.url,
                    (gltf) => {
                        this.modelCache.set(key, gltf);
                        resolve();
                    },
                    (progress) => {
                        const percent = (progress.loaded / progress.total * 100).toFixed(0);
                        this.showFeedback(`Loading ${key}: ${percent}%`);
                    },
                    reject
                );
            });
        });

        try {
            await Promise.all(loadPromises);
            this.showFeedback('All models loaded!');
        } catch (error) {
            console.error('Error preloading models:', error);
            this.showFeedback('Error loading models. Please refresh.');
        }
    }

    async loadModel(modelKey) {
        try {
            if (this.currentModel) {
                this.modelContainer.removeChild(this.currentModel);
            }

            const modelConfig = this.models[modelKey];
            const model = document.createElement('a-entity');
            
            // Set initial attributes
            model.setAttribute('scale', modelConfig.scale);
            model.setAttribute('rotation', modelConfig.rotation);
            model.setAttribute('position', modelConfig.position);
            model.setAttribute('class', 'clickable');
            model.dataset.modelKey = modelKey;

            // Use cached model if available
            if (this.modelCache.has(modelKey)) {
                model.setAttribute('gltf-model', modelConfig.url);
            } else {
                this.showFeedback('Loading model...');
                model.setAttribute('gltf-model', modelConfig.url);
            }

            // Create a promise for model loading
            const modelLoaded = new Promise((resolve, reject) => {
                model.addEventListener('model-loaded', resolve, { once: true });
                model.addEventListener('model-error', reject, { once: true });
            });

            // Add to scene
            this.modelContainer.appendChild(model);
            this.currentModel = model;

            // Update button states
            document.querySelectorAll('.model-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.model === modelKey) {
                    btn.classList.add('active');
                }
            });

            // Wait for model to load
            await modelLoaded;
            this.showFeedback(`${modelKey.replace('model', 'Car ')} ready!`);
        } catch (error) {
            console.error('Error loading model:', error);
            this.showFeedback('Error loading model. Please try again.');
            
            if (this.currentModel) {
                this.modelContainer.removeChild(this.currentModel);
                this.currentModel = null;
            }
        }
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
                
                // Add limits to prevent models from getting too big or too small
                const minScale = baseScale * 0.5;  // minimum 50% of original size
                const maxScale = baseScale * 2.0;  // maximum 200% of original size
                const clampedScale = Math.min(Math.max(newScale, minScale), maxScale);
                
                this.currentModel.setAttribute('scale', `${clampedScale} ${clampedScale} ${clampedScale}`);
                initialDistance = currentDistance; // Update distance for next move
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
