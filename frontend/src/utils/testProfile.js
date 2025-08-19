// Test utility for Enhanced Teacher Profile
// This file helps you test the complete profile functionality

export const testTeacherData = {
  id: 'test-teacher-123',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@test.com',
  role: 'enseignant',
  avatar: null,
  bio: 'Passionné d\'enseignement avec plus de 10 ans d\'expérience dans l\'éducation.',
  teacherInfo: {
    subjects: ['Mathématiques', 'Physique', 'Informatique'],
    experience: 10,
    education: {
      degree: 'Master en Mathématiques Appliquées',
      institution: 'Université de Paris',
      year: 2015
    },
    rating: 4.8,
    totalReviews: 45,
    followersCount: 12,
    postsCount: 8,
    rank: 'Superprof',
    availability: {
      timezone: 'Europe/Paris',
      schedule: [
        { day: 'lundi', startTime: '09:00', endTime: '17:00' },
        { day: 'mardi', startTime: '09:00', endTime: '17:00' },
        { day: 'mercredi', startTime: '09:00', endTime: '17:00' }
      ]
    }
  }
};

export const testStudentData = {
  id: 'test-student-456',
  firstName: 'Marie',
  lastName: 'Martin',
  email: 'marie.martin@test.com',
  role: 'etudiant',
  studentInfo: {
    level: 'lycee',
    languages: ['Français', 'Anglais']
  }
};

export const testPosts = [
  {
    _id: 'post-1',
    text: 'Bonjour à tous ! Je suis ravi de partager avec vous mes connaissances en mathématiques. Aujourd\'hui, nous allons explorer les concepts fondamentaux de l\'algèbre linéaire.',
    visibility: 'public',
    tags: ['mathématiques', 'algèbre', 'éducation'],
    createdAt: '2024-01-15T10:30:00Z',
    engagement: {
      likes: ['student-1', 'student-2'],
      shares: ['student-3'],
      commentsCount: 3,
      viewsCount: 25
    },
    teacherId: {
      _id: 'test-teacher-123',
      firstName: 'Jean',
      lastName: 'Dupont',
      avatar: null,
      role: 'enseignant'
    }
  },
  {
    _id: 'post-2',
    text: 'Conseil du jour : La pratique régulière est la clé du succès en mathématiques. Prenez le temps de résoudre des exercices chaque jour, même 15 minutes suffisent !',
    visibility: 'followers',
    tags: ['conseils', 'pratique', 'mathématiques'],
    createdAt: '2024-01-14T14:20:00Z',
    engagement: {
      likes: ['student-1', 'student-4', 'student-5'],
      shares: [],
      commentsCount: 1,
      viewsCount: 18
    },
    teacherId: {
      _id: 'test-teacher-123',
      firstName: 'Jean',
      lastName: 'Dupont',
      avatar: null,
      role: 'enseignant'
    }
  }
];

export const testFollowers = [
  {
    _id: 'follow-1',
    followerId: {
      _id: 'student-1',
      firstName: 'Marie',
      lastName: 'Martin',
      avatar: null,
      role: 'etudiant'
    },
    createdAt: '2024-01-10T09:00:00Z'
  },
  {
    _id: 'follow-2',
    followerId: {
      _id: 'student-2',
      firstName: 'Pierre',
      lastName: 'Durand',
      avatar: null,
      role: 'etudiant'
    },
    createdAt: '2024-01-12T11:30:00Z'
  }
];

export const testReviews = [
  {
    _id: 'review-1',
    student: {
      firstName: 'Marie',
      lastName: 'Martin'
    },
    overallRating: 5,
    comment: 'Excellent professeur ! Ses explications sont très claires et il prend le temps de bien expliquer chaque concept.',
    createdAt: '2024-01-10T15:30:00Z'
  },
  {
    _id: 'review-2',
    student: {
      firstName: 'Pierre',
      lastName: 'Durand'
    },
    overallRating: 4,
    comment: 'Très bon enseignant, très patient et à l\'écoute des besoins des élèves.',
    createdAt: '2024-01-08T12:15:00Z'
  }
];

// Instructions for testing
export const testingInstructions = `
🧪 TESTING INSTRUCTIONS FOR ENHANCED TEACHER PROFILE

1. START THE APPLICATION:
   - Backend: cd backend && npm start
   - Frontend: cd frontend && npm start

2. CREATE TEST USERS:
   - Register a teacher account
   - Register a student account (in incognito mode)

3. ACCESS THE ENHANCED PROFILE:
   - Go to: http://localhost:3000/teacher/[TEACHER_ID]
   - Replace [TEACHER_ID] with the actual teacher's ID

4. TEST ALL TABS:
   - About: Shows teacher information, experience, education
   - Courses: Shows teacher's courses (placeholder)
   - Posts: Shows teacher's posts with creation form
   - Reviews: Shows student reviews and rating form
   - Followers: Shows list of students following the teacher

5. TEST FOLLOW FUNCTIONALITY:
   - Login as student
   - Go to teacher profile
   - Click "Suivre" button
   - Verify follower count increases

6. TEST POST CREATION:
   - Login as teacher
   - Go to your profile
   - Click "Posts" tab
   - Create a new post
   - Verify it appears in the list

7. TEST FEED:
   - Login as student
   - Follow a teacher
   - Go to /feed
   - Verify teacher's posts appear

EXPECTED RESULTS:
✅ All 5 tabs should be visible and functional
✅ Follow/unfollow button should work
✅ Posts should be created and displayed
✅ Comments should work on posts
✅ Followers list should show students
✅ Student feed should show posts from followed teachers
`;

export default {
  testTeacherData,
  testStudentData,
  testPosts,
  testFollowers,
  testReviews,
  testingInstructions
};
