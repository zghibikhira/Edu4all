import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const FEATURES = [
  {
    icon: '🎓',
    title: 'Enseignants experts',
    desc: 'Apprenez auprès de professeurs certifiés et passionnés.'
  },
  {
    icon: '📚',
    title: 'Cours variés',
    desc: 'Des centaines de cours pour tous les niveaux et intérêts.'
  },
  {
    icon: '💡',
    title: 'Méthodes innovantes',
    desc: 'Pédagogie moderne, exercices interactifs et suivi personnalisé.'
  },
  {
    icon: '🌍',
    title: 'Communauté active',
    desc: 'Échangez, collaborez et progressez ensemble.'
  }
];

export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-6 md:px-16 py-20 bg-gradient-to-br from-primary to-accent/80">
        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold font-poppins text-white leading-tight mb-6 drop-shadow-lg">
            Débloquez votre potentiel<br />
            <span className="text-warning">avec Edu4All</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-8 font-inter">
            Plateforme moderne pour apprendre, progresser et réussir avec les meilleurs enseignants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link to="/register" className="btn-primary text-lg">Commencer maintenant</Link>
            <Link to="/courses" className="btn-secondary text-lg">Explorer les cours</Link>
          </div>
        </div>
        {/* Illustration */}
        <div className="flex-1 flex justify-center md:justify-end">
          <img src="https://edublink-react.vercel.app/images/hero/hero-1.png" alt="Éducation moderne" className="w-80 md:w-[420px] rounded-2xl shadow-xl border-4 border-white/30" />
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-white dark:bg-background-dark">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
          {FEATURES.map(f => (
            <div key={f.title} className="flex flex-col items-center bg-background-light dark:bg-background-dark rounded-xl shadow-md p-8 border border-primary/10 hover:shadow-lg transition-all">
              <div className="text-4xl mb-3">{f.icon}</div>
              <div className="font-bold text-lg mb-2 text-primary font-poppins">{f.title}</div>
              <div className="text-gray-600 dark:text-gray-300 text-center font-inter">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
