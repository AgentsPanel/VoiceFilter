# VoiceFilter - Audio Enhancement Web Application

A web-based application for enhancing audio quality using DeepFilterNet. Upload audio files in various formats and get enhanced versions with reduced background noise while preserving voice quality.

## Features

- Support for multiple audio formats:
  - WAV
  - MP3
  - FLAC
  - M4A
  - OGG

- Real-time audio playback
  - Compare original and enhanced audio directly in browser
  - High-quality 48kHz audio processing
  - Supports both mono and stereo input

- Modern web interface
  - Clean and responsive design
  - Progress indicators
  - Drag-and-drop file upload
  - File size limit: 32MB

- Powered by DeepFilterNet2
  - State-of-the-art audio enhancement
  - Efficient CPU processing
  - Automatic format conversion

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/VoiceFilter.git
cd VoiceFilter
```

2. Make the run script executable:
```bash
chmod +x run.sh
```

3. Start the application:
```bash
./run.sh
```

The script will:
- Check for required dependencies
- Set up a Python virtual environment
- Install required packages
- Start the web server

4. Open your browser and go to:
```
http://localhost:5000
```

## Manual Installation

If you prefer manual installation or are using Windows:

1. Install FFmpeg:
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt-get install ffmpeg`
- Windows: Download from [FFmpeg website](https://ffmpeg.org/download.html)

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the application:
```bash
python app.py
```

## Project Structure

```
VoiceFilter/
├── app.py              # Main Flask application
├── realtime_processor.py # Audio processing logic
├── requirements.txt    # Python dependencies
├── run.sh             # Startup script
├── templates/         # Web interface templates
│   └── index.html
└── uploads/           # Temporary file storage
```

## Dependencies

Core dependencies:
- Flask (web framework)
- PyTorch & torchaudio (audio processing)
- DeepFilterNet (audio enhancement)
- pydub (audio format conversion)
- FFmpeg (audio codec support)

See `requirements.txt` for complete list.

## Usage

1. Open the web interface
2. Click "Choose file" or drag-and-drop an audio file
3. Click "Process Audio"
4. Wait for processing to complete
5. Compare original and enhanced audio using the players
6. Download the enhanced audio file

## Troubleshooting

1. **FFmpeg not found**
   - Make sure FFmpeg is installed and in your system PATH
   - Follow installation instructions for your OS

2. **File upload fails**
   - Check if file size is under 32MB
   - Ensure file format is supported
   - Verify file is not corrupted

3. **Processing errors**
   - Check console for Python error messages
   - Ensure all dependencies are installed correctly
   - Verify input file is a valid audio file

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [DeepFilterNet](https://github.com/Rikorose/DeepFilterNet) for the audio enhancement model
- Flask and PyTorch communities
- All contributors and users of this project
# VoiceFilter
