// Utility function to show feedback messages
function showFeedback(message, duration = 2000) {
    const feedback = document.getElementById('feedbackMessage');
    feedback.textContent = message;
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, duration);
}

// Enhanced AR Interaction Component
AFRAME.registerComponent('ar-interaction', {
    schema: {
        rotationSpeed: { type: 'number', default: 50 },
        scaleSpeed: { type: 'number', default: 1.1 }
    },

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

        // Add click interactions for objects
        this.setupObjectInteractions();
    },

    setupObjectInteractions: function() {
        this.objects.forEach(object => {
            object.addEventListener('click', () => {
                // Highlight selected object
                this.objects.forEach(obj => {
                    obj.setAttribute('material', { opacity: 0.5 });
                });
                object.setAttribute('material', { opacity: 1 });

                // Select the clicked object
                this.selectedObject = object;
                showFeedback(`Selected: ${object.getAttribute('gltf-model') || 'Object'}`);

                // Trigger special animation
                this.animateSelectedObject();
            });
        });
    },

    animateSelectedObject: function() {
        if (!this.selectedObject) return;

        // Complex animation sequence
        this.selectedObject.setAttribute('animation__scale', {
            property: 'scale',
            from: '1 1 1',
            to: '1.2 1.2 1.2',
            dur: 500,
            easing: 'easeInOutQuad',
            loop: 2,
            dir: 'alternate'
        });

        this.selectedObject.setAttribute('animation__rotation', {
            property: 'rotation',
            from: '0 0 0',
            to: '0 360 0',
            dur: 2000,
            easing: 'linear',
            loop: 1
        });
    },

    setupMarkerDetection: function() {
        this.marker.addEventListener('markerFound', () => {
            showFeedback('Marker detected! Explore the 3D models.', 3000);
            // Add visual enhancement when marker is found
            this.marker.setAttribute('material', { color: '#00FF00', opacity: 0.3 });
        });

        this.marker.addEventListener('markerLost', () => {
            showFeedback('Marker lost. Please point at the marker again.', 3000);
            // Reset marker appearance
            this.marker.setAttribute('material', { color: '#FFFFFF', opacity: 0 });
        });
    },

    setupTouchEvents: function() {
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    },

    onTouchStart: function(event) {
        if (!this.selectedObject) return;

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
            this.selectedObject.object3D.rotation.y += (deltaX * 0.01 * this.data.rotationSpeed);
            this.lastRotation = currentX;
            showFeedback('Rotating object');
        } else if (this.isScaling && event.touches.length === 2) {
            // Handle scaling
            const currentDistance = this.getTouchDistance(event.touches);
            const scaleFactor = currentDistance / this.lastTouchDistance;
            const currentScale = this.selectedObject.getAttribute('scale');
            
            // Limit scaling to prevent extreme deformations
            const newScale = {
                x: Math.max(0.1, Math.min(currentScale.x * scaleFactor, 2)),
                y: Math.max(0.1, Math.min(currentScale.y * scaleFactor, 2)),
                z: Math.max(0.1, Math.min(currentScale.z * scaleFactor, 2))
            };

            this.selectedObject.setAttribute('scale', newScale);
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

// Wait for A-Frame to load
document.addEventListener('DOMContentLoaded', () => {
    // Add the component to the scene
    document.querySelector('a-scene').setAttribute('ar-interaction', '');
});
