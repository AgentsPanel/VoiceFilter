/**
 * Audio Worklet Processor for Real-time Kalman Filtering
 */
class KalmanProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        
        // Kalman filter parameters
        this.Q = 1e-5;  // Process noise covariance
        this.R = 0.25;  // Measurement noise covariance
        this.P = 1.0;   // Estimation error covariance
        this.x_prev = 0.0; // Previous state estimate
        
        // Visualization data buffer
        this.bufferSize = 512;
        this.originalBuffer = new Float32Array(this.bufferSize);
        this.filteredBuffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
        this.frameCount = 0;
        
        // Listen for parameter updates from main thread
        this.port.onmessage = (event) => {
            if (event.data.type === 'update-params') {
                this.Q = event.data.Q || this.Q;
                this.R = event.data.R || this.R;
            }
        };
    }

    kalmanFilter(measurement) {
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

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        if (input.length > 0) {
            const inputChannel = input[0];
            const outputChannel = output[0];

            // Process each sample through Kalman filter
            for (let i = 0; i < inputChannel.length; i++) {
                const sample = inputChannel[i];
                const filtered = this.kalmanFilter(sample);
                
                outputChannel[i] = filtered;

                // Store samples for visualization
                this.originalBuffer[this.bufferIndex] = sample;
                this.filteredBuffer[this.bufferIndex] = filtered;
                this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;
            }

            // Send visualization data periodically (every ~10ms at 44.1kHz)
            this.frameCount++;
            if (this.frameCount % 128 === 0) {
                // Create downsampled arrays for visualization
                const downsampleFactor = 4;
                const visualSize = this.bufferSize / downsampleFactor;
                const originalVis = new Float32Array(visualSize);
                const filteredVis = new Float32Array(visualSize);

                for (let i = 0; i < visualSize; i++) {
                    const sourceIndex = i * downsampleFactor;
                    originalVis[i] = this.originalBuffer[sourceIndex];
                    filteredVis[i] = this.filteredBuffer[sourceIndex];
                }

                this.port.postMessage({
                    type: 'audio-data',
                    original: Array.from(originalVis),
                    filtered: Array.from(filteredVis)
                });
            }
        }

        return true; // Keep processor alive
    }
}

registerProcessor('kalman-processor', KalmanProcessor);