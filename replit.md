# Audio Noise Reduction Application

## Overview

This is a Flask-based web application that provides audio noise reduction capabilities using Kalman filtering algorithms. Users can upload audio files in various formats (WAV, MP3, FLAC, M4A, OGG) and the system processes them to reduce background noise while preserving voice quality. The application features a modern dark-themed web interface with real-time waveform visualization and audio playback capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Web Framework**: Flask with Jinja2 templating engine
- **UI Framework**: Bootstrap with dark theme styling
- **JavaScript Architecture**: Modular approach with separate handlers for audio processing and waveform visualization
- **Styling**: Custom CSS with Bootstrap integration, featuring hover effects, animations, and responsive design
- **File Upload**: Secure file handling with drag-and-drop support and real-time validation

### Backend Architecture
- **Core Framework**: Flask web application with modular design
- **Audio Processing Engine**: Custom AudioProcessor class implementing Kalman filtering algorithms
- **File Management**: Separate upload and processed file directories with secure filename handling
- **Session Management**: Flask sessions with configurable secret keys
- **Error Handling**: Comprehensive logging and flash message system

### Audio Processing Pipeline
- **Kalman Filter Implementation**: Custom 1D Kalman filter class for real-time audio denoising
- **Audio Library**: LibROSA for audio file processing and analysis
- **Supported Formats**: Multiple audio format support (WAV, MP3, FLAC, M4A, OGG)
- **File Size Limits**: 50MB maximum file size with client-side validation
- **Processing Flow**: Upload → Validation → Kalman Filtering → Output Generation

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

### Development Tools
- **Python Logging**: Built-in logging system for debugging and monitoring
- **UUID**: Unique identifier generation for file processing
- **OS Module**: File system operations and environment variable management

### Optional Real-time Processing
- **SoundDevice**: Real-time audio stream processing (referenced in attached assets)
- **Real-time Kalman**: Live audio processing capabilities for future enhancement