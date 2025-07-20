import { useAuth } from '../../contexts/AuthContext';
import EvaluationList from '../../components/EvaluationList';

const Evaluations = () => {
  const { user } = useAuth();

  // Determine user role based on user data
  const getUserRole = () => {
    if (!user) return 'student';
    
    // Check if user has teacher/enseignant role
    if (user.role === 'enseignant' || user.role === 'teacher') {
      return 'teacher';
    }
    
    // Check if user has student/etudiant role
    if (user.role === 'etudiant' || user.role === 'student') {
      return 'student';
    }
    
    // Default to student if role is not clear
    return 'student';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EvaluationList userRole={getUserRole()} />
    </div>
  );
};

export default Evaluations; 