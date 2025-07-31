/**
 * Audio Handler - Manages file upload and processing UI
 */
class AudioHandler {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadForm = document.getElementById('uploadForm');
        const fileInput = document.getElementById('file');
        const uploadBtn = document.getElementById('uploadBtn');
        const processingIndicator = document.getElementById('processingIndicator');

        // File input change event
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e);
            });
        }

        // Form submission
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                this.handleFormSubmission(e, uploadBtn, processingIndicator);
            });
        }

        // Audio player enhancements
        this.setupAudioPlayers();
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        const uploadBtn = document.getElementById('uploadBtn');
        
        if (file) {
            // Validate file size (50MB limit)
            const maxSize = 50 * 1024 * 1024; // 50MB in bytes
            if (file.size > maxSize) {
                this.showAlert('File size exceeds 50MB limit. Please choose a smaller file.', 'error');
                event.target.value = '';
                return;
            }

            // Update button text with file name
            const fileName = file.name.length > 30 ? 
                file.name.substring(0, 27) + '...' : file.name;
            uploadBtn.innerHTML = `<i class="fas fa-magic me-2"></i>Process "${fileName}"`;
            
            // Show file info
            this.displayFileInfo(file);
        } else {
            uploadBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Process Audio';
        }
    }

    displayFileInfo(file) {
        // Remove existing file info
        const existingInfo = document.querySelector('.file-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        // Create file info display
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info mt-3 p-3 bg-body-secondary rounded';
        fileInfo.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <strong>File:</strong> ${file.name}<br>
                    <strong>Size:</strong> ${this.formatFileSize(file.size)}
                </div>
                <div class="col-md-6">
                    <strong>Type:</strong> ${file.type || 'Unknown'}<br>
                    <strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleDateString()}
                </div>
            </div>
        `;

        const formContainer = document.querySelector('#uploadForm').parentElement;
        formContainer.appendChild(fileInfo);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleFormSubmission(event, uploadBtn, processingIndicator) {
        // Show processing indicator
        if (processingIndicator) {
            processingIndicator.style.display = 'block';
        }
        
        // Disable submit button
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        }

        // Note: Form will submit normally, processing continues on server
    }

    setupAudioPlayers() {
        const audioPlayers = document.querySelectorAll('audio');
        
        audioPlayers.forEach(player => {
            // Add event listeners for better UX
            player.addEventListener('loadstart', () => {
                console.log('Audio loading started');
            });

            player.addEventListener('canplay', () => {
                console.log('Audio can start playing');
            });

            player.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                this.showAlert('Error loading audio file', 'error');
            });

            // Add playback time display
            player.addEventListener('timeupdate', () => {
                this.updatePlaybackTime(player);
            });
        });
    }

    updatePlaybackTime(player) {
        const currentTime = this.formatTime(player.currentTime);
        const duration = this.formatTime(player.duration);
        
        // Update time display if element exists
        const timeDisplay = player.parentElement.querySelector('.time-display');
        if (timeDisplay && !isNaN(player.duration)) {
            timeDisplay.textContent = `${currentTime} / ${duration}`;
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'error' ? 'danger' : 'info'} alert-dismissible fade show`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(alert, container.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }
}

// Initialize audio handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AudioHandler();
});
