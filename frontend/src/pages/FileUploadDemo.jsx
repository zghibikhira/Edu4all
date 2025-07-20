import React, { useState } from 'react';
import FileUploadEnhanced from '../components/FileUploadEnhanced';
import Card from '../components/ui/Card';

const FileUploadDemo = () => {
  const [uploadResults, setUploadResults] = useState([]);

  const handleFileChange = (files) => {
    console.log('Files selected:', files);
  };

  const handleUploadComplete = (results) => {
    console.log('Upload completed:', results);
    setUploadResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Démonstration - Upload de Fichiers
          </h1>
          <p className="text-gray-600">
            Testez les fonctionnalités d'upload de fichiers PDF et vidéos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PDF Upload */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📄 Upload de PDF
            </h2>
            <FileUploadEnhanced
              accept="pdf"
              onFileChange={handleFileChange}
              onUploadComplete={handleUploadComplete}
              maxFiles={3}
              maxSize={10}
              showPreview={true}
            />
          </Card>

          {/* Video Upload */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎥 Upload de Vidéos
            </h2>
            <FileUploadEnhanced
              accept="video"
              onFileChange={handleFileChange}
              onUploadComplete={handleUploadComplete}
              maxFiles={2}
              maxSize={100}
              showPreview={true}
            />
          </Card>

          {/* Image Upload */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🖼️ Upload d'Images
            </h2>
            <FileUploadEnhanced
              accept="image"
              onFileChange={handleFileChange}
              onUploadComplete={handleUploadComplete}
              maxFiles={5}
              maxSize={5}
              showPreview={true}
            />
          </Card>

          {/* Mixed Files Upload */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📁 Upload Mixte
            </h2>
            <FileUploadEnhanced
              accept="all"
              onFileChange={handleFileChange}
              onUploadComplete={handleUploadComplete}
              maxFiles={5}
              maxSize={50}
              showPreview={true}
            />
          </Card>
        </div>

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <Card className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Résultats d'Upload
            </h2>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-md">
                  <p className="text-green-800">
                    ✅ {result.filename || 'Fichier'} uploadé avec succès
                  </p>
                  {result.fileUrl && (
                    <a 
                      href={result.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Voir le fichier
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Features List */}
        <Card className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Fonctionnalités Testées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">✅ Validation</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Types de fichiers acceptés</li>
                <li>• Taille maximale des fichiers</li>
                <li>• Nombre maximum de fichiers</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">✅ Interface</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Drag & drop</li>
                <li>• Aperçu des fichiers</li>
                <li>• Barre de progression</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">✅ Gestion</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Suppression de fichiers</li>
                <li>• Upload multiple</li>
                <li>• Gestion des erreurs</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">✅ Types Supportés</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF (application/pdf)</li>
                <li>• Vidéos (MP4, AVI, MOV, etc.)</li>
                <li>• Images (JPG, PNG, GIF, WEBP)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FileUploadDemo; 