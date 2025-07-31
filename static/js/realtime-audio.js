/**
 * Real-time Audio Processing with Kalman Filter
 */
class RealtimeAudioProcessor {
    constructor() {
        this.isProcessing = false;
        this.audioContext = null;
        this.stream = null;
        this.processor = null;
        this.kalmanFilter = new KalmanFilter();
        this.canvas = null;
        this.canvasCtx = null;
        this.animationId = null;
        
        this.initializeUI();
    }

    initializeUI() {
        // Add real-time audio section to the page
        const container = document.querySelector('.container');
        if (!container) return;

        const realtimeSection = document.createElement('div');
        realtimeSection.className = 'row mt-5';
        realtimeSection.innerHTML = `
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-microphone me-2"></i>
                            Real-time Audio Processing
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>Controls</h5>
                                <div class="d-grid gap-2">
                                    <button id="startRealtime" class="btn btn-success">
                                        <i class="fas fa-play me-2"></i>
                                        Start Real-time Processing
                                    </button>
                                    <button id="stopRealtime" class="btn btn-danger" disabled>
                                        <i class="fas fa-stop me-2"></i>
                                        Stop Processing
                                    </button>
                                </div>
                                <div class="mt-3">
                                    <label for="kalmanQ" class="form-label">Process Noise (Q): <span id="qValue">1e-5</span></label>
                                    <input type="range" class="form-range" id="kalmanQ" min="-6" max="-3" step="0.1" value="-5">
                                    
                                    <label for="kalmanR" class="form-label">Measurement Noise (R): <span id="rValue">0.25</span></label>
                                    <input type="range" class="form-range" id="kalmanR" min="0.1" max="1.0" step="0.05" value="0.25">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h5>Live Waveform</h5>
                                <canvas id="realtimeWaveform" width="400" height="200" class="waveform-canvas"></canvas>
                                <div class="mt-2">
                                    <small class="text-muted">
                                        <i class="fas fa-info-circle me-1"></i>
                                        Blue: Original audio | Red: Filtered audio
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>Note:</strong> This feature processes your microphone input in real-time using the same Kalman filter algorithm. 
                                    You'll hear the filtered audio through your speakers/headphones. Use headphones to avoid feedback.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(realtimeSection);
        this.bindEvents();
    }

    bindEvents() {
        const startBtn = document.getElementById('startRealtime');
        const stopBtn = document.getElementById('stopRealtime');
        const qSlider = document.getElementById('kalmanQ');
        const rSlider = document.getElementById('kalmanR');
        const qValue = document.getElementById('qValue');
        const rValue = document.getElementById('rValue');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startProcessing());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopProcessing());
        }

        if (qSlider && qValue) {
            qSlider.addEventListener('input', (e) => {
                const value = Math.pow(10, parseFloat(e.target.value));
                qValue.textContent = value.toExponential(1);
                this.kalmanFilter.setQ(value);
                
                // Update processor parameters if running
                if (this.processor) {
                    this.processor.port.postMessage({
                        type: 'update-params',
                        Q: value
                    });
                }
            });
        }

        if (rSlider && rValue) {
            rSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                rValue.textContent = value.toString();
                this.kalmanFilter.setR(value);
                
                // Update processor parameters if running
                if (this.processor) {
                    this.processor.port.postMessage({
                        type: 'update-params',
                        R: value
                    });
                }
            });
        }

        this.canvas = document.getElementById('realtimeWaveform');
        if (this.canvas) {
            this.canvasCtx = this.canvas.getContext('2d');
            this.setupCanvas();
        }
    }

    setupCanvas() {
        if (!this.canvas || !this.canvasCtx) return;
        
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.canvas.style.width = this.canvas.offsetWidth + 'px';
        this.canvas.style.height = this.canvas.offsetHeight + 'px';
        this.canvasCtx.scale(dpr, dpr);
    }

    async startProcessing() {
        try {
            // Request microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100
                }
            });

            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 44100
            });

            // Create nodes
            const source = this.audioContext.createMediaStreamSource(this.stream);
            const destination = this.audioContext.createMediaStreamDestination();
            
            // Create audio worklet for processing
            await this.audioContext.audioWorklet.addModule('/static/js/kalman-processor.js');
            this.processor = new AudioWorkletNode(this.audioContext, 'kalman-processor');
            
            // Connect the audio graph
            source.connect(this.processor);
            this.processor.connect(destination);
            this.processor.connect(this.audioContext.destination);

            // Set up message handling for visualization
            this.processor.port.onmessage = (event) => {
                if (event.data.type === 'audio-data') {
                    this.updateWaveform(event.data.original, event.data.filtered);
                }
            };

            this.isProcessing = true;
            this.updateUI();
            this.startVisualization();

        } catch (error) {
            console.error('Error starting real-time processing:', error);
            alert('Error accessing microphone: ' + error.message);
        }
    }

    stopProcessing() {
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        this.isProcessing = false;
        this.updateUI();
        this.clearCanvas();
    }

    updateUI() {
        const startBtn = document.getElementById('startRealtime');
        const stopBtn = document.getElementById('stopRealtime');

        if (startBtn && stopBtn) {
            startBtn.disabled = this.isProcessing;
            stopBtn.disabled = !this.isProcessing;
        }
    }

    startVisualization() {
        if (!this.canvas || !this.canvasCtx) return;

        const animate = () => {
            if (this.isProcessing) {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        animate();
    }

    updateWaveform(originalData, filteredData) {
        if (!this.canvas || !this.canvasCtx || !originalData || !filteredData) return;

        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        const centerY = height / 2;

        // Clear canvas
        this.canvasCtx.clearRect(0, 0, width, height);

        // Draw background
        this.canvasCtx.fillStyle = 'rgba(108, 117, 125, 0.05)';
        this.canvasCtx.fillRect(0, 0, width, height);

        // Draw center line
        this.canvasCtx.strokeStyle = 'rgba(108, 117, 125, 0.3)';
        this.canvasCtx.lineWidth = 1;
        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(0, centerY);
        this.canvasCtx.lineTo(width, centerY);
        this.canvasCtx.stroke();

        if (originalData.length === 0) return;

        const step = width / originalData.length;

        // Draw original waveform (blue)
        this.canvasCtx.strokeStyle = '#007bff';
        this.canvasCtx.lineWidth = 1.5;
        this.canvasCtx.beginPath();
        
        for (let i = 0; i < originalData.length; i++) {
            const x = i * step;
            const y = centerY + (originalData[i] * centerY * 0.8);
            
            if (i === 0) {
                this.canvasCtx.moveTo(x, y);
            } else {
                this.canvasCtx.lineTo(x, y);
            }
        }
        this.canvasCtx.stroke();

        // Draw filtered waveform (red)
        this.canvasCtx.strokeStyle = '#dc3545';
        this.canvasCtx.lineWidth = 1.5;
        this.canvasCtx.beginPath();
        
        for (let i = 0; i < filteredData.length; i++) {
            const x = i * step;
            const y = centerY + (filteredData[i] * centerY * 0.8);
            
            if (i === 0) {
                this.canvasCtx.moveTo(x, y);
            } else {
                this.canvasCtx.lineTo(x, y);
            }
        }
        this.canvasCtx.stroke();
    }

    clearCanvas() {
        if (!this.canvas || !this.canvasCtx) return;
        
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        this.canvasCtx.clearRect(0, 0, width, height);
        this.canvasCtx.fillStyle = 'rgba(108, 117, 125, 0.05)';
        this.canvasCtx.fillRect(0, 0, width, height);
        
        this.canvasCtx.fillStyle = '#6c757d';
        this.canvasCtx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        this.canvasCtx.textAlign = 'center';
        this.canvasCtx.fillText('Real-time processing stopped', width / 2, height / 2);
    }
}

/**
 * JavaScript implementation of Kalman Filter
 */
class KalmanFilter {
    constructor(Q = 1e-5, R = 0.25, P = 1.0) {
        this.Q = Q; // Process noise covariance
        this.R = R; // Measurement noise covariance
        this.P = P; // Estimation error covariance
        this.x_prev = 0.0; // Previous state estimate
    }

    setQ(Q) {
        this.Q = Q;
    }

    setR(R) {
        this.R = R;
    }

    reset() {
        this.P = 1.0;
        this.x_prev = 0.0;
    }

    filter(measurement) {
        // Predict
        const x_pred = this.x_prev;
        const P_pred = this.P + this.Q;

        // Compute Kalman gain
        const K = P_pred / (P_pred + this.R);

        // Update estimate
        const x_cur = x_pred + K * (measurement - x_pred);
        this.P = (1 - K) * P_pred;

        // Save for next iteration
        this.x_prev = x_cur;
        return x_cur;
    }
}