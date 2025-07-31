import os
import logging
from flask import Flask, render_template, request, redirect, url_for, flash, send_file, jsonify
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
import uuid
from audio_processor import AudioProcessor

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configuration
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'm4a', 'ogg'}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Initialize audio processor
audio_processor = AudioProcessor()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('No file selected', 'error')
        return redirect(url_for('index'))
    
    file = request.files['file']
    if file.filename == '':
        flash('No file selected', 'error')
        return redirect(url_for('index'))
    
    if file and file.filename and allowed_file(file.filename):
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        try:
            file.save(filepath)
            app.logger.info(f"File saved: {filepath}")
            
            # Process the audio file
            processed_filename = audio_processor.process_audio(filepath, app.config['PROCESSED_FOLDER'])
            
            if processed_filename:
                flash('Audio processed successfully!', 'success')
                return render_template('index.html', 
                                     original_file=unique_filename,
                                     processed_file=processed_filename,
                                     show_results=True)
            else:
                flash('Error processing audio file', 'error')
                return redirect(url_for('index'))
                
        except Exception as e:
            app.logger.error(f"Error processing file: {str(e)}")
            flash(f'Error processing file: {str(e)}', 'error')
            return redirect(url_for('index'))
    else:
        flash('Invalid file type. Please upload WAV, MP3, FLAC, M4A, or OGG files.', 'error')
        return redirect(url_for('index'))

@app.route('/download/<filename>')
def download_file(filename):
    try:
        return send_file(
            os.path.join(app.config['PROCESSED_FOLDER'], filename),
            as_attachment=True,
            download_name=f"denoised_{filename}"
        )
    except FileNotFoundError:
        flash('File not found', 'error')
        return redirect(url_for('index'))

@app.route('/audio/<folder>/<filename>')
def serve_audio(folder, filename):
    try:
        if folder == 'original':
            return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        elif folder == 'processed':
            return send_file(os.path.join(app.config['PROCESSED_FOLDER'], filename))
        else:
            return "Invalid folder", 404
    except FileNotFoundError:
        return "File not found", 404

@app.route('/waveform/<folder>/<filename>')
def get_waveform_data(folder, filename):
    try:
        if folder == 'original':
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        elif folder == 'processed':
            filepath = os.path.join(app.config['PROCESSED_FOLDER'], filename)
        else:
            return jsonify({'error': 'Invalid folder'}), 404
        
        waveform_data = audio_processor.get_waveform_data(filepath)
        return jsonify(waveform_data)
    except Exception as e:
        app.logger.error(f"Error getting waveform data: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
