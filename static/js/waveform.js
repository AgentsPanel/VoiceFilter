/**
 * Waveform Visualization Manager
 */
class WaveformManager {
    constructor() {
        this.canvases = new Map();
    }

    /**
     * Load and display waveform for an audio file
     * @param {string} canvasId - ID of the canvas element
     * @param {string} dataUrl - URL to fetch waveform data
     */
    async loadWaveform(canvasId, dataUrl) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with ID ${canvasId} not found`);
            return;
        }

        try {
            // Show loading state
            this.showLoadingState(canvas);

            // Fetch waveform data
            const response = await fetch(dataUrl);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Draw waveform
            this.drawWaveform(canvas, data);
            this.canvases.set(canvasId, { canvas, data });

        } catch (error) {
            console.error('Error loading waveform:', error);
            this.showErrorState(canvas, error.message);
        }
    }

    /**
     * Show loading state on canvas
     * @param {HTMLCanvasElement} canvas 
     */
    showLoadingState(canvas) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas size
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = 150 * dpr;
        canvas.style.width = canvas.offsetWidth + 'px';
        canvas.style.height = '150px';
        
        ctx.scale(dpr, dpr);
        
        // Clear and show loading
        ctx.fillStyle = 'rgba(108, 117, 125, 0.1)';
        ctx.fillRect(0, 0, canvas.offsetWidth, 150);
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('Loading waveform...', canvas.offsetWidth / 2, 75);
    }

    /**
     * Show error state on canvas
     * @param {HTMLCanvasElement} canvas 
     * @param {string} errorMessage 
     */
    showErrorState(canvas, errorMessage) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(220, 53, 69, 0.1)';
        ctx.fillRect(0, 0, canvas.offsetWidth, 150);
        
        ctx.fillStyle = '#dc3545';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'center';
        ctx.fillText(`Error: ${errorMessage}`, canvas.offsetWidth / 2, 75);
    }

    /**
     * Draw waveform on canvas
     * @param {HTMLCanvasElement} canvas 
     * @param {Object} data - Waveform data
     */
    drawWaveform(canvas, data) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas size with device pixel ratio
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = 150 * dpr;
        canvas.style.width = canvas.offsetWidth + 'px';
        canvas.style.height = '150px';
        
        ctx.scale(dpr, dpr);
        
        const width = canvas.offsetWidth;
        const height = 150;
        const centerY = height / 2;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = 'rgba(108, 117, 125, 0.05)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw center line
        ctx.strokeStyle = 'rgba(108, 117, 125, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        // Prepare waveform data
        const waveform = data.waveform;
        if (!waveform || waveform.length === 0) {
            ctx.fillStyle = '#6c757d';
            ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
            ctx.textAlign = 'center';
            ctx.fillText('No waveform data available', width / 2, centerY);
            return;
        }
        
        // Normalize waveform data
        const maxAmplitude = Math.max(...waveform.map(Math.abs));
        const normalizedWaveform = waveform.map(sample => sample / (maxAmplitude || 1));
        
        // Draw waveform
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        const step = width / normalizedWaveform.length;
        
        for (let i = 0; i < normalizedWaveform.length; i++) {
            const x = i * step;
            const y = centerY + (normalizedWaveform[i] * centerY * 0.8);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw filled area under curve
        ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        
        for (let i = 0; i < normalizedWaveform.length; i++) {
            const x = i * step;
            const y = centerY + (normalizedWaveform[i] * centerY * 0.8);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, centerY);
        ctx.closePath();
        ctx.fill();
        
        // Draw time labels
        this.drawTimeLabels(ctx, width, height, data.duration);
    }

    /**
     * Draw time labels on waveform
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} width 
     * @param {number} height 
     * @param {number} duration 
     */
    drawTimeLabels(ctx, width, height, duration) {
        if (!duration || duration <= 0) return;
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'left';
        
        // Start time
        ctx.fillText('0:00', 5, height - 5);
        
        // End time
        ctx.textAlign = 'right';
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        ctx.fillText(timeString, width - 5, height - 5);
        
        // Middle time if duration > 60 seconds
        if (duration > 60) {
            ctx.textAlign = 'center';
            const midDuration = duration / 2;
            const midMinutes = Math.floor(midDuration / 60);
            const midSeconds = Math.floor(midDuration % 60);
            const midTimeString = `${midMinutes}:${midSeconds.toString().padStart(2, '0')}`;
            ctx.fillText(midTimeString, width / 2, height - 5);
        }
    }

    /**
     * Resize all canvases (call on window resize)
     */
    resizeCanvases() {
        this.canvases.forEach(({ canvas, data }, canvasId) => {
            this.drawWaveform(canvas, data);
        });
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.waveformManager) {
        window.waveformManager.resizeCanvases();
    }
});
