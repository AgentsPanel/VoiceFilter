# Audio Noise Reduction Application

## Overview

This is a Flask-based web application that provides comprehensive audio noise reduction capabilities using Kalman filtering algorithms. The application supports both file-based processing and real-time audio streaming. Users can upload audio files in various formats (WAV, MP3, FLAC, M4A, OGG) or process live microphone input in real-time. The system reduces background noise while preserving voice quality using advanced Kalman filter algorithms. The application features a modern dark-themed web interface with real-time waveform visualization, audio playback capabilities, and live parameter adjustment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Web Framework**: Flask with Jinja2 templating engine
- **UI Framework**: Bootstrap with dark theme styling
- **JavaScript Architecture**: Modular approach with separate handlers for audio processing, waveform visualization, and real-time audio streaming
- **Real-time Audio Processing**: Web Audio API with AudioWorklet for low-latency processing
- **Styling**: Custom CSS with Bootstrap integration, featuring hover effects, animations, and responsive design
- **File Upload**: Secure file handling with drag-and-drop support and real-time validation
- **Live Parameter Control**: Real-time adjustment of Kalman filter parameters with instant feedback

### Backend Architecture
- **Core Framework**: Flask web application with modular design
- **Audio Processing Engine**: Custom AudioProcessor class implementing Kalman filtering algorithms
- **File Management**: Separate upload and processed file directories with secure filename handling
- **Session Management**: Flask sessions with configurable secret keys
- **Error Handling**: Comprehensive logging and flash message system

### Audio Processing Pipeline
- **Kalman Filter Implementation**: Custom 1D Kalman filter class for real-time audio denoising (both Python and JavaScript versions)
- **File Processing**: LibROSA for audio file processing and analysis
- **Real-time Processing**: AudioWorklet-based processing for live microphone input with <10ms latency
- **Supported Formats**: Multiple audio format support (WAV, MP3, FLAC, M4A, OGG)
- **File Size Limits**: 50MB maximum file size with client-side validation
- **Processing Modes**: 
  - File Processing: Upload → Validation → Kalman Filtering → Output Generation
  - Real-time Processing: Microphone Input → Live Kalman Filtering → Audio Output + Visualization

### Data Storage Solutions
- **File Storage**: Local filesystem with organized directory structure
- **Upload Directory**: Temporary storage for incoming audio files
- **Processed Directory**: Storage for noise-reduced audio outputs
- **Session Storage**: Flask session management for user interaction state

### Security Features
- **File Validation**: Extension and size checking for uploaded files
- **Secure Filenames**: Werkzeug secure_filename implementation
- **Proxy Support**: ProxyFix middleware for deployment behind reverse proxies
- **CSRF Protection**: Flask secret key configuration for session security

## External Dependencies

### Core Libraries
- **Flask**: Web framework and routing
- **LibROSA**: Audio analysis and processing library
- **NumPy**: Numerical computing for Kalman filter algorithms
- **SoundFile**: Audio file I/O operations
- **Werkzeug**: WSGI utilities and secure file handling

### Frontend Dependencies
- **Bootstrap**: UI framework via CDN (bootstrap-agent-dark-theme)
- **Font Awesome**: Icon library via CDN (v6.4.0)
- **Web Audio API**: Browser-based audio processing and visualization
- **AudioWorklet**: High-performance real-time audio processing
- **MediaDevices API**: Microphone access for real-time processing

### Development Tools
- **Python Logging**: Built-in logging system for debugging and monitoring
- **UUID**: Unique identifier generation for file processing
- **OS Module**: File system operations and environment variable management

### Real-time Audio Processing (Added July 31, 2025)
- **AudioWorklet Processor**: Custom `kalman-processor.js` for real-time Kalman filtering
- **Real-time Interface**: Interactive controls for parameter adjustment (Q, R values)
- **Live Visualization**: Real-time waveform display showing original vs filtered audio
- **Microphone Integration**: Direct microphone input processing with noise reduction output
- **Parameter Control**: Live adjustment of Kalman filter parameters with instant effect
- **Performance**: <10ms latency processing suitable for real-time applications