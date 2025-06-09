import os
import logging
from werkzeug.utils import secure_filename
from flask import jsonify
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = "/app/workspace"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {
    'txt', 'py', 'js', 'html', 'css', 'json', 'xml', 'yaml', 'yml',
    'md', 'csv', 'sql', 'sh', 'bat', 'dockerfile', 'requirements',
    'pdf', 'docx', 'doc', 'rtf'
}

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file_size(file) -> bool:
    """Validate file size doesn't exceed maximum."""
    file.seek(0, 2)  # Seek to end
    size = file.tell()
    file.seek(0)  # Reset to beginning
    return size <= MAX_FILE_SIZE

def handle_file_upload(files) -> Dict[str, Any]:
    """
    Handle multiple file uploads with validation.
    Returns dict with success status, uploaded files list, and any errors.
    """
    if not files:
        return {
            'success': False,
            'error': 'No files provided',
            'uploaded_files': []
        }
    
    uploaded_files = []
    errors = []
    
    # Ensure upload directory exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    for file in files:
        if file.filename == '':
            errors.append('Empty filename provided')
            continue
            
        if not allowed_file(file.filename):
            errors.append(f'File type not allowed: {file.filename}')
            continue
            
        if not validate_file_size(file):
            errors.append(f'File too large: {file.filename} (max {MAX_FILE_SIZE//1024//1024}MB)')
            continue
        
        try:
            # Secure the filename
            filename = secure_filename(file.filename)
            
            # Handle duplicate filenames
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            counter = 1
            original_name, ext = os.path.splitext(filename)
            
            while os.path.exists(file_path):
                new_filename = f"{original_name}_{counter}{ext}"
                file_path = os.path.join(UPLOAD_FOLDER, new_filename)
                filename = new_filename
                counter += 1
            
            # Save the file
            file.save(file_path)
            
            # Verify file was saved correctly
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                uploaded_files.append({
                    'filename': filename,
                    'original_name': file.filename,
                    'path': file_path,
                    'size': os.path.getsize(file_path)
                })
                logger.info(f"Successfully uploaded file: {filename}")
            else:
                errors.append(f'Failed to save file: {file.filename}')
                
        except Exception as e:
            logger.error(f"Error uploading file {file.filename}: {str(e)}")
            errors.append(f'Upload failed for {file.filename}: {str(e)}')
    
    # Determine overall success
    success = len(uploaded_files) > 0
    
    return {
        'success': success,
        'uploaded_files': uploaded_files,
        'errors': errors if errors else None,
        'message': f'Successfully uploaded {len(uploaded_files)} file(s)' if success else 'Upload failed'
    }