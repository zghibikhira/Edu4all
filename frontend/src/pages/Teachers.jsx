import React from 'react';
import TeachersList from '../components/TeachersList';

const Teachers = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
        Liste des Enseignants Inscrits
      </h1>
      <TeachersList />
    </div>
  );
};

export default Teachers; 