// Utility function to show feedback messages
function showFeedback(message, duration = 2000) {
    const feedback = document.getElementById('feedbackMessage');
    feedback.textContent = message;
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, duration);
}

// Wait for A-Frame to load
AFRAME.registerComponent('ar-interaction', {
    init: function () {
        this.marker = document.querySelector('a-marker');
        this.objects = document.querySelectorAll('.clickable');
        this.selectedObject = null;
        this.isRotating = false;
        this.isScaling = false;
        this.lastTouchDistance = 0;
        this.lastRotation = 0;

        // Add event listeners for touch interactions
        this.setupTouchEvents();
        
        // Add marker detection feedback
        this.setupMarkerDetection();
    },

    setupMarkerDetection: function() {
        this.marker.addEventListener('markerFound', () => {
            showFeedback('Marker detected!');
        });

        this.marker.addEventListener('markerLost', () => {
            showFeedback('Marker lost. Please point at the marker.');
        });
    },

    setupTouchEvents: function() {
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    },

    onTouchStart: function(event) {
        if (event.touches.length === 1) {
            // Single touch - prepare for rotation or movement
            this.isRotating = true;
            this.lastRotation = event.touches[0].clientX;
        } else if (event.touches.length === 2) {
            // Double touch - prepare for scaling
            this.isScaling = true;
            this.lastTouchDistance = this.getTouchDistance(event.touches);
        }
    },

    onTouchMove: function(event) {
        if (!this.selectedObject) return;

        if (this.isRotating && event.touches.length === 1) {
            // Handle rotation
            const currentX = event.touches[0].clientX;
            const deltaX = currentX - this.lastRotation;
            this.selectedObject.object3D.rotation.y += (deltaX * 0.01);
            this.lastRotation = currentX;
            showFeedback('Rotating object');
        } else if (this.isScaling && event.touches.length === 2) {
            // Handle scaling
            const currentDistance = this.getTouchDistance(event.touches);
            const scaleFactor = currentDistance / this.lastTouchDistance;
            const currentScale = this.selectedObject.getAttribute('scale');
            this.selectedObject.setAttribute('scale', {
                x: currentScale.x * scaleFactor,
                y: currentScale.y * scaleFactor,
                z: currentScale.z * scaleFactor
            });
            this.lastTouchDistance = currentDistance;
            showFeedback('Scaling object');
        }
    },

    onTouchEnd: function() {
        this.isRotating = false;
        this.isScaling = false;
    },

    getTouchDistance: function(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
});

// Add the component to the scene
document.querySelector('a-scene').setAttribute('ar-interaction', '');

// Add click listeners to objects for selection
document.querySelectorAll('.clickable').forEach(object => {
    object.addEventListener('click', function() {
        const interaction = document.querySelector('[ar-interaction]').components['ar-interaction'];
        interaction.selectedObject = this;
        showFeedback('Object selected');
        
        // Trigger animation
        this.setAttribute('animation', {
            property: 'rotation',
            to: '0 360 0',
            dur: 1000,
            easing: 'easeInOutQuad'
        });
    });
});
