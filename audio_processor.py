import numpy as np
import librosa
import soundfile as sf
import os
import logging
from typing import Optional, Dict, List

class KalmanFilter:
    """1D Kalman filter for audio denoising"""
    
    def __init__(self, Q=1e-5, R=0.25, P=1.0):
        """
        Initialize Kalman filter parameters
        
        Args:
            Q: Process noise covariance (smaller → trust model more)
            R: Measurement noise covariance (≈ noise variance)
            P: Initial estimation error covariance
        """
        self.Q = Q
        self.R = R
        self.P = P
        self.x_prev = 0.0
        
    def reset(self):
        """Reset filter state"""
        self.P = 1.0
        self.x_prev = 0.0
        
    def filter_sample(self, y):
        """
        Apply one iteration of Kalman filter
        
        Args:
            y: Input sample (measurement)
            
        Returns:
            Filtered sample
        """
        # Predict
        x_pred = self.x_prev
        P_pred = self.P + self.Q
        
        # Compute Kalman gain
        K = P_pred / (P_pred + self.R)
        
        # Update estimate
        x_cur = x_pred + K * (y - x_pred)
        self.P = (1 - K) * P_pred
        
        # Save for next iteration
        self.x_prev = x_cur
        return x_cur

class AudioProcessor:
    """Audio processing class with Kalman filter denoising"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def process_audio(self, input_path: str, output_dir: str) -> Optional[str]:
        """
        Process audio file with Kalman filter denoising
        
        Args:
            input_path: Path to input audio file
            output_dir: Directory to save processed file
            
        Returns:
            Filename of processed audio or None if error
        """
        try:
            self.logger.info(f"Processing audio file: {input_path}")
            
            # Load audio file
            audio_data, sample_rate = librosa.load(input_path, sr=None, mono=True)
            self.logger.info(f"Loaded audio: {len(audio_data)} samples at {sample_rate} Hz")
            
            # Apply Kalman filter
            filtered_audio = self._apply_kalman_filter(audio_data)
            
            # Generate output filename
            input_filename = os.path.basename(input_path)
            name, ext = os.path.splitext(input_filename)
            output_filename = f"{name}_denoised.wav"
            output_path = os.path.join(output_dir, output_filename)
            
            # Save processed audio as WAV
            sf.write(output_path, filtered_audio, sample_rate)
            self.logger.info(f"Saved processed audio: {output_path}")
            
            return output_filename
            
        except Exception as e:
            self.logger.error(f"Error processing audio: {str(e)}")
            return None
    
    def _apply_kalman_filter(self, audio_data: np.ndarray) -> np.ndarray:
        """
        Apply Kalman filter to audio data
        
        Args:
            audio_data: Input audio samples
            
        Returns:
            Filtered audio samples
        """
        # Initialize Kalman filter
        kalman = KalmanFilter(Q=1e-5, R=0.25, P=1.0)
        
        # Apply filter sample by sample
        filtered_samples = np.empty_like(audio_data)
        for i, sample in enumerate(audio_data):
            filtered_samples[i] = kalman.filter_sample(sample)
            
        return filtered_samples
    
    def get_waveform_data(self, audio_path: str, max_points: int = 1000) -> Dict:
        """
        Get waveform data for visualization
        
        Args:
            audio_path: Path to audio file
            max_points: Maximum number of points for visualization
            
        Returns:
            Dictionary with waveform data
        """
        try:
            # Load audio file
            audio_data, sample_rate = librosa.load(audio_path, sr=None, mono=True)
            
            # Downsample for visualization if needed
            if len(audio_data) > max_points:
                # Use RMS downsampling for better visualization
                hop_length = len(audio_data) // max_points
                downsampled = []
                for i in range(0, len(audio_data) - hop_length, hop_length):
                    chunk = audio_data[i:i + hop_length]
                    rms_value = np.sqrt(np.mean(chunk ** 2))
                    downsampled.append(rms_value)
                audio_data = np.array(downsampled)
            
            # Create time axis
            duration = len(audio_data) / sample_rate if len(audio_data) <= max_points else len(audio_data) / max_points
            time_axis = np.linspace(0, duration, len(audio_data))
            
            return {
                'waveform': audio_data.tolist(),
                'time': time_axis.tolist(),
                'sample_rate': sample_rate,
                'duration': float(duration)
            }
            
        except Exception as e:
            self.logger.error(f"Error getting waveform data: {str(e)}")
            return {'error': str(e)}
