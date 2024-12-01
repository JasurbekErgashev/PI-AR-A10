class UIController {
    constructor() {
        this.setupModelSelectors();
        this.setupInstructions();
    }

    setupModelSelectors() {
        const modelBtns = document.querySelectorAll('.model-btn');
        modelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modelKey = btn.dataset.model;
                arController.loadModel(modelKey);
                this.updateActiveModel(btn);
            });
        });
    }

    setupInstructions() {
        const instructions = document.querySelector('.instructions');
        setTimeout(() => {
            instructions.style.opacity = '0';
            setTimeout(() => {
                instructions.style.display = 'none';
            }, 500);
        }, 5000);
    }

    updateActiveModel(activeBtn) {
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.style.background = btn === activeBtn ? '#2ecc71' : '#4a90e2';
        });
    }

    showMessage(message) {
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

const uiController = new UIController();
