import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const FileUploadEnhanced = ({ 
  accept = 'all', 
  onFileChange, 
  onUploadComplete, 
  maxFiles = 1,
  maxSize = 50, // MB
  showPreview = true,
  className = '',
  simulateUpload = true // For demo purposes
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const fileInputRef = useRef(null);

  const allowedTypes = {
    'pdf': ['application/pdf'],
    'video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'],
    'image': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    'all': ['application/pdf', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.type.startsWith('video/')) return '🎥';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `Le fichier est trop volumineux. Taille maximale: ${maxSize}MB` };
    }

    // Check file type
    if (!allowedTypes[accept].includes(file.type)) {
      return { valid: false, error: 'Type de fichier non supporté' };
    }

    return { valid: true };
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      // Show errors in a more user-friendly way
      setUploadErrors(prev => ({
        ...prev,
        general: errors.join('\n')
      }));
      setTimeout(() => setUploadErrors(prev => ({ ...prev, general: null })), 5000);
    }

    if (validFiles.length > 0) {
      const updatedFiles = maxFiles === 1 ? validFiles.slice(0, 1) : [...files, ...validFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      
      if (onFileChange) {
        onFileChange(maxFiles === 1 ? updatedFiles[0] : updatedFiles);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    if (onFileChange) {
      onFileChange(maxFiles === 1 ? newFiles[0] || null : newFiles);
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadErrors({});
    const newProgress = {};
    files.forEach(file => {
      newProgress[file.name] = 0;
    });
    setUploadProgress(newProgress);

    try {
      if (simulateUpload) {
        // Simulate upload for demo purposes
        const uploadPromises = files.map(async (file) => {
          return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 20;
              if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                  resolve({
                    success: true,
                    filename: file.name,
                    fileUrl: URL.createObjectURL(file),
                    size: file.size,
                    type: file.type
                  });
                }, 500);
              }
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: Math.min(progress, 100)
              }));
            }, 200);
          });
        });

        const results = await Promise.all(uploadPromises);
        
        if (onUploadComplete) {
          onUploadComplete(results);
        }

        // Clear files after successful upload
        setFiles([]);
        setUploadProgress({});
        
        // Show success message
        alert('Fichiers uploadés avec succès !');
        
      } else {
        // Real upload implementation
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          try {
            const response = await fetch('http://localhost:5000/api/files/upload', {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${user?.token}`
              }
            });

            if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
          } catch (error) {
            setUploadErrors(prev => ({
              ...prev,
              [file.name]: error.message
            }));
            throw error;
          }
        });

        const results = await Promise.all(uploadPromises);
        
        if (onUploadComplete) {
          onUploadComplete(results);
        }

        setFiles([]);
        setUploadProgress({});
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadErrors(prev => ({
        ...prev,
        general: 'Erreur lors de l\'upload des fichiers'
      }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Messages */}
      {uploadErrors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <p className="text-red-700 text-sm whitespace-pre-line">{uploadErrors.general}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept === 'all' ? allowedTypes.all.join(',') : allowedTypes[accept].join(',')}
          onChange={handleChange}
          multiple={maxFiles > 1}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="text-4xl mb-4">
            {accept === 'pdf' && '📄'}
            {accept === 'video' && '🎥'}
            {accept === 'image' && '🖼️'}
            {accept === 'all' && '📁'}
          </div>
          
          <h3 className="text-lg font-medium text-gray-700">
            Glissez-déposez vos fichiers ici
          </h3>
          
          <p className="text-sm text-gray-500">
            ou{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              parcourez vos fichiers
            </button>
          </p>
          
          <p className="text-xs text-gray-400">
            Types acceptés: {
              (accept === 'pdf' && 'PDF') ||
              (accept === 'video' && 'MP4, AVI, MOV, WMV, FLV, WEBM') ||
              (accept === 'image' && 'JPG, PNG, GIF, WEBP') ||
              'PDF, Vidéos, Images'
            } • Taille max: {maxSize}MB
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">
            Fichiers sélectionnés ({files.length}/{maxFiles})
          </h4>
          
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFileIcon(file)}</span>
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  {uploadErrors[file.name] && (
                    <p className="text-xs text-red-500">{uploadErrors[file.name]}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {uploadProgress[file.name] !== undefined && (
                  <div className="w-20">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          
          {/* Upload Button */}
          <button
            type="button"
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {uploading ? 'Upload en cours...' : 'Uploader les fichiers'}
          </button>
        </div>
      )}

      {/* File Previews */}
      {showPreview && files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Aperçus</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-32 object-cover"
                  />
                ) : file.type === 'application/pdf' ? (
                  <div className="w-full h-32 bg-red-100 flex items-center justify-center">
                    <span className="text-4xl">📄</span>
                  </div>
                ) : file.type.startsWith('video/') ? (
                  <div className="w-full h-32 bg-blue-100 flex items-center justify-center">
                    <span className="text-4xl">🎥</span>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">📁</span>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadEnhanced; 