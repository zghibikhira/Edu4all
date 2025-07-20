import React, { useState } from 'react';

const EvaluationForm = ({ onSubmit, initialData = null }) => {
  // const { user } = useAuth(); // Will be used when connecting to real API
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    studentId: initialData?.studentId || '',
    courseId: initialData?.courseId || '',
    type: initialData?.type || 'devoir',
    maxScore: initialData?.maxScore || 100,
    dueDate: initialData?.dueDate || '',
    criteria: initialData?.criteria || [
      { name: 'Compréhension', weight: 25, description: 'Compréhension du sujet' },
      { name: 'Qualité', weight: 25, description: 'Qualité du travail' },
      { name: 'Présentation', weight: 25, description: 'Présentation et format' },
      { name: 'Originalité', weight: 25, description: 'Originalité et créativité' }
    ]
  });

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, fetch from API
  React.useEffect(() => {
    // Simulate API call
    setStudents([
      { _id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com' },
      { _id: '2', firstName: 'Marie', lastName: 'Martin', email: 'marie@example.com' },
      { _id: '3', firstName: 'Pierre', lastName: 'Bernard', email: 'pierre@example.com' }
    ]);
    setCourses([
      { _id: '1', title: 'Mathématiques Avancées' },
      { _id: '2', title: 'Physique Quantique' },
      { _id: '3', title: 'Programmation Web' }
    ]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCriteriaChange = (index, field, value) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index] = {
      ...newCriteria[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      criteria: newCriteria
    }));
  };

  const addCriteria = () => {
    setFormData(prev => ({
      ...prev,
      criteria: [
        ...prev.criteria,
        { name: '', weight: 0, description: '' }
      ]
    }));
  };

  const removeCriteria = (index) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate criteria weights sum to 100
      const totalWeight = formData.criteria.reduce((sum, criteria) => sum + Number(criteria.weight), 0);
      if (totalWeight !== 100) {
        alert('Les poids des critères doivent totaliser 100%');
        return;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {initialData ? 'Modifier l\'évaluation' : 'Créer une nouvelle évaluation'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de l'évaluation *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Devoir de mathématiques - Chapitre 5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'évaluation *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="devoir">Devoir</option>
              <option value="examen">Examen</option>
              <option value="projet">Projet</option>
              <option value="presentation">Présentation</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description détaillée de l'évaluation..."
          />
        </div>

        {/* Student and Course Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Étudiant *
            </label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un étudiant</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cours (optionnel)
            </label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un cours</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note maximale *
            </label>
            <input
              type="number"
              name="maxScore"
              value={formData.maxScore}
              onChange={handleChange}
              required
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date limite *
          </label>
          <input
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Evaluation Criteria */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Critères d'évaluation</h3>
            <button
              type="button"
              onClick={addCriteria}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Ajouter un critère
            </button>
          </div>

          <div className="space-y-4">
            {formData.criteria.map((criteria, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du critère
                    </label>
                    <input
                      type="text"
                      value={criteria.name}
                      onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Compréhension"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poids (%)
                    </label>
                    <input
                      type="number"
                      value={criteria.weight}
                      onChange={(e) => handleCriteriaChange(index, 'weight', Number(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeCriteria(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={criteria.description}
                    onChange={(e) => handleCriteriaChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description du critère..."
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Total des poids: {formData.criteria.reduce((sum, criteria) => sum + Number(criteria.weight), 0)}%
              {formData.criteria.reduce((sum, criteria) => sum + Number(criteria.weight), 0) !== 100 && 
                <span className="text-red-600 ml-2">(Doit être égal à 100%)</span>
              }
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : (initialData ? 'Modifier' : 'Créer l\'évaluation')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvaluationForm; 