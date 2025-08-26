import React, { useEffect, useMemo, useState } from 'react';
import CompactRatingCard from './CompactRatingCard';

export default function StudentRatings() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, cRes] = await Promise.all([
          fetch('/api/teachers', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          fetch('/api/courses', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);
        const tData = await tRes.json();
        const cData = await cRes.json();
        if (tData?.success) {
          const teachersArr = Array.isArray(tData.data) ? tData.data : (tData?.teachers || []);
          setTeachers(teachersArr);
        }
        if (cData?.success) {
          const coursesArrCandidate = cData?.data?.courses ?? cData?.data ?? cData?.courses ?? [];
          const coursesArr = Array.isArray(coursesArrCandidate) ? coursesArrCandidate : [];
          setCourses(coursesArr);
        }
      } catch (e) {
        console.error('StudentRatings load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedCourse = useMemo(() => (Array.isArray(courses) ? courses.find(c => c._id === selectedCourseId) : undefined), [courses, selectedCourseId]);
  const selectedTeacher = useMemo(() => teachers.find(t => t._id === selectedTeacherId), [teachers, selectedTeacherId]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Choisir un enseignant ou un cours à évaluer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enseignant</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">— Sélectionner —</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cours</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">— Sélectionner —</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>
                  {c.title || 'Cours'} {c.instructor ? `— ${c.instructor.firstName} ${c.instructor.lastName}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!loading && (selectedTeacherId || selectedCourseId) && (
        <CompactRatingCard
          courseTitle={selectedCourse?.title || 'Évaluer un enseignant'}
          courseSubtitle={selectedCourse?.description || ''}
          whenLabel={selectedCourse?.startDate ? new Date(selectedCourse.startDate).toLocaleString('fr-FR') : ''}
          teacherId={selectedCourse?.instructor?._id || selectedTeacherId}
          courseId={selectedCourseId || null}
          onSubmitted={() => {
            alert('Merci pour votre évaluation !');
          }}
        />
      )}
    </div>
  );
}


