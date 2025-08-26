const mongoose = require('mongoose');
const User = require('../models/user');
const Course = require('../models/course');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/education-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleTeachers = [
  {
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@edu4all.com',
    password: 'password123',
    phone: '+33123456789',
    role: 'enseignant',
    teacherInfo: {
      subjects: ['Mathématiques', 'Physique'],
      education: {
        degree: 'Doctorat',
        institution: 'Université de Paris',
        year: 2018
      },
      experience: 8,
      bio: 'Docteur en mathématiques avec 8 ans d\'expérience dans l\'enseignement supérieur.',
      availability: {
        monday: { morning: true, afternoon: true, evening: false },
        tuesday: { morning: true, afternoon: true, evening: true },
        wednesday: { morning: false, afternoon: true, evening: true },
        thursday: { morning: true, afternoon: false, evening: true },
        friday: { morning: true, afternoon: true, evening: false }
      },
      rank: 'Superprof',
      rankTier: 'SUPERPROF',
      rankingScore: 95,
      rating: 4.8,
      totalReviews: 127,
      followersCount: 89,
      postsCount: 23
    }
  },
  {
    firstName: 'Prof. Michael',
    lastName: 'Chen',
    email: 'michael.chen@edu4all.com',
    password: 'password123',
    phone: '+33123456790',
    role: 'enseignant',
    teacherInfo: {
      subjects: ['Informatique', 'JavaScript', 'React'],
      education: {
        degree: 'Master',
        institution: 'École Centrale',
        year: 2020
      },
      experience: 5,
      bio: 'Expert en développement web avec une passion pour l\'enseignement des technologies modernes.',
      availability: {
        monday: { morning: false, afternoon: true, evening: true },
        tuesday: { morning: true, afternoon: true, evening: false },
        wednesday: { morning: true, afternoon: false, evening: true },
        thursday: { morning: false, afternoon: true, evening: true },
        friday: { morning: true, afternoon: true, evening: true }
      },
      rank: 'Prof',
      rankTier: 'PROF',
      rankingScore: 87,
      rating: 4.6,
      totalReviews: 94,
      followersCount: 67,
      postsCount: 18
    }
  },
  {
    firstName: 'Dr. Emily',
    lastName: 'Davis',
    email: 'emily.davis@edu4all.com',
    password: 'password123',
    phone: '+33123456791',
    role: 'enseignant',
    teacherInfo: {
      subjects: ['Anglais', 'Littérature'],
      education: {
        degree: 'Doctorat',
        institution: 'Sorbonne',
        year: 2019
      },
      experience: 6,
      bio: 'Spécialiste en littérature anglaise et professeur d\'anglais expérimentée.',
      availability: {
        monday: { morning: true, afternoon: false, evening: true },
        tuesday: { morning: false, afternoon: true, evening: true },
        wednesday: { morning: true, afternoon: true, evening: false },
        thursday: { morning: true, afternoon: false, evening: true },
        friday: { morning: false, afternoon: true, evening: true }
      },
      rank: 'Hyperprof',
      rankTier: 'HYPERPROF',
      rankingScore: 98,
      rating: 4.9,
      totalReviews: 156,
      followersCount: 134,
      postsCount: 31
    }
  },
  {
    firstName: 'Prof. Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@edu4all.com',
    password: 'password123',
    phone: '+33123456792',
    role: 'enseignant',
    teacherInfo: {
      subjects: ['Physique', 'Chimie'],
      education: {
        degree: 'Master',
        institution: 'École Normale Supérieure',
        year: 2021
      },
      experience: 4,
      bio: 'Physicien passionné par l\'enseignement des sciences expérimentales.',
      availability: {
        monday: { morning: true, afternoon: true, evening: false },
        tuesday: { morning: false, afternoon: true, evening: true },
        wednesday: { morning: true, afternoon: false, evening: true },
        thursday: { morning: true, afternoon: true, evening: false },
        friday: { morning: false, afternoon: true, evening: true }
      },
      rank: 'Prof',
      rankTier: 'PROF',
      rankingScore: 82,
      rating: 4.4,
      totalReviews: 73,
      followersCount: 45,
      postsCount: 12
    }
  }
];

const sampleCourses = [
  {
    title: 'Mathématiques Avancées - Niveau Lycée',
    description: 'Cours complet de mathématiques pour les élèves de terminale, couvrant l\'algèbre, la géométrie et l\'analyse.',
    shortDescription: 'Maîtrisez les mathématiques de terminale avec des exercices pratiques et des explications claires.',
    category: 'Sciences',
    subjects: ['Mathématiques'],
    level: 'avance',
    content: {
      objectives: [
        'Maîtriser les concepts fondamentaux de l\'algèbre',
        'Résoudre des problèmes de géométrie complexe',
        'Comprendre les bases de l\'analyse mathématique'
      ],
      prerequisites: ['Mathématiques niveau première'],
      materials: ['Calculatrice scientifique', 'Cahier de cours'],
      duration: 40,
      lessons: [
        {
          title: 'Introduction à l\'algèbre avancée',
          description: 'Rappels et approfondissement des concepts algébriques',
          duration: 60,
          order: 1
        },
        {
          title: 'Géométrie dans l\'espace',
          description: 'Étude des figures géométriques en 3D',
          duration: 90,
          order: 2
        }
      ]
    },
    settings: {
      price: 29.99,
      isPublic: true,
      maxStudents: 50,
      allowEnrollment: true
    }
  },
  {
    title: 'JavaScript Moderne - De Débutant à Avancé',
    description: 'Apprenez JavaScript de A à Z avec les dernières fonctionnalités ES6+ et les bonnes pratiques de développement.',
    shortDescription: 'Formation complète JavaScript avec projets pratiques et exercices interactifs.',
    category: 'Informatique',
    subjects: ['JavaScript', 'Informatique'],
    level: 'intermediaire',
    content: {
      objectives: [
        'Maîtriser la syntaxe JavaScript moderne',
        'Comprendre les concepts de programmation orientée objet',
        'Développer des applications web interactives'
      ],
      prerequisites: ['Bases de l\'informatique'],
      materials: ['Ordinateur avec navigateur moderne', 'Éditeur de code'],
      duration: 60,
      lessons: [
        {
          title: 'Introduction à JavaScript',
          description: 'Premiers pas avec JavaScript et l\'environnement de développement',
          duration: 45,
          order: 1
        },
        {
          title: 'Variables et types de données',
          description: 'Déclaration de variables et manipulation des différents types',
          duration: 60,
          order: 2
        }
      ]
    },
    settings: {
      price: 39.99,
      isPublic: true,
      maxStudents: 30,
      allowEnrollment: true
    }
  },
  {
    title: 'Anglais Conversationnel - Niveau Intermédiaire',
    description: 'Améliorez votre anglais oral avec des conversations guidées et des exercices pratiques.',
    shortDescription: 'Développez votre fluidité en anglais grâce à des conversations thématiques.',
    category: 'Langues',
    subjects: ['Anglais'],
    level: 'intermediaire',
    content: {
      objectives: [
        'Améliorer la fluidité de l\'expression orale',
        'Enrichir le vocabulaire quotidien',
        'Maîtriser les expressions idiomatiques courantes'
      ],
      prerequisites: ['Anglais niveau B1'],
      materials: ['Microphone', 'Haut-parleurs'],
      duration: 30,
      lessons: [
        {
          title: 'Conversations quotidiennes',
          description: 'Pratique des dialogues de la vie courante',
          duration: 45,
          order: 1
        },
        {
          title: 'Expressions idiomatiques',
          description: 'Apprentissage et utilisation des expressions courantes',
          duration: 60,
          order: 2
        }
      ]
    },
    settings: {
      price: 24.99,
      isPublic: true,
      maxStudents: 20,
      allowEnrollment: true
    }
  },
  {
    title: 'Physique Quantique - Introduction',
    description: 'Découvrez les mystères de la physique quantique avec des explications accessibles et des expériences virtuelles.',
    shortDescription: 'Introduction fascinante aux concepts de la physique quantique moderne.',
    category: 'Sciences',
    subjects: ['Physique'],
    level: 'avance',
    content: {
      objectives: [
        'Comprendre les principes de base de la mécanique quantique',
        'Explorer les paradoxes quantiques',
        'Appréhender les applications modernes'
      ],
      prerequisites: ['Physique niveau lycée', 'Mathématiques niveau terminale'],
      materials: ['Simulateur quantique en ligne', 'Calculatrice scientifique'],
      duration: 50,
      lessons: [
        {
          title: 'Les fondements de la mécanique quantique',
          description: 'Introduction aux concepts révolutionnaires de la physique quantique',
          duration: 90,
          order: 1
        },
        {
          title: 'Le principe d\'incertitude',
          description: 'Exploration du célèbre principe d\'Heisenberg',
          duration: 75,
          order: 2
        }
      ]
    },
    settings: {
      price: 34.99,
      isPublic: true,
      maxStudents: 25,
      allowEnrollment: true
    }
  }
];

async function seedData() {
  try {
    console.log('🌱 Seeding database...');
    
    // Clear existing data
    await User.deleteMany({ role: 'enseignant' });
    await Course.deleteMany({});
    
    console.log('🗑️ Cleared existing data');
    
    // Create teachers
    const createdTeachers = [];
    for (const teacherData of sampleTeachers) {
      const hashedPassword = await bcrypt.hash(teacherData.password, 10);
      const teacher = new User({
        ...teacherData,
        password: hashedPassword,
        isVerified: true,
        isActive: true
      });
      await teacher.save();
      createdTeachers.push(teacher);
      console.log(`✅ Created teacher: ${teacher.firstName} ${teacher.lastName}`);
    }
    
    // Create courses
    for (let i = 0; i < sampleCourses.length; i++) {
      const courseData = sampleCourses[i];
      const course = new Course({
        ...courseData,
        instructor: createdTeachers[i]._id
      });
      await course.save();
      console.log(`✅ Created course: ${course.title}`);
    }
    
    console.log('🎉 Database seeded successfully!');
    console.log(`📊 Created ${createdTeachers.length} teachers and ${sampleCourses.length} courses`);
    console.log('\n🔗 You can now:');
    console.log('1. Visit http://localhost:3000/teacher-ratings to see teachers');
    console.log('2. Visit http://localhost:3000/courses to see courses');
    console.log('3. Login with any teacher email and password: password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
