class ARController {
    constructor() {
        this.scene = document.querySelector('a-scene');
        this.marker = document.querySelector('a-marker');
        this.currentModel = null;
        this.models = {
            model1: '/models/bugati_divo.glb',
            model2: '/models/ferrari_sf90_stradale.glb',
            model3: '/models/flamborghini_terzo_millennio.glb'
        };
        this.setupMarkerEvents();
    }

    setupMarkerEvents() {
        this.marker.addEventListener('markerFound', () => {
            this.showFeedback('Marker detected!');
            document.querySelector('.controls').style.display = 'flex';
        });

        this.marker.addEventListener('markerLost', () => {
            document.querySelector('.controls').style.display = 'none';
        });
    }

    loadModel(modelKey) {
        if (this.currentModel) {
            this.marker.removeChild(this.currentModel);
        }

        const model = document.createElement('a-entity');
        model.setAttribute('gltf-model', this.models[modelKey]);
        model.setAttribute('scale', '0.1 0.1 0.1');
        model.setAttribute('rotation', '0 0 0');
        model.setAttribute('position', '0 0.5 0');
        model.setAttribute('animation-mixer', '');

        this.marker.appendChild(model);
        this.currentModel = model;
        this.showFeedback(`Loaded ${modelKey.replace('model', 'Car ')}`);
    }

    showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = message;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.classList.add('show');
        }, 100);

        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 2000);
    }
}

const arController = new ARController();
