import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'etudiant', value: 120 },
  { name: 'Cours', value: 45 },
  { name: 'enseignants', value: 8 },
  { name: 'Certificates', value: 20 },
];

export default function StatsChart() {
  const stats = [
    { value: "29.3K", label: "STUDENT ENROLLED", color: "bg-blue-100 text-blue-700" },
    { value: "32.4K", label: "CLASS COMPLETED", color: "bg-purple-100 text-purple-700" },
    { value: "100%", label: "SATISFACTION RATE", color: "bg-indigo-100 text-indigo-700" },
    { value: "354+", label: "TOP INSTRUCTORS", color: "bg-orange-100 text-orange-700" },
  ];

  return (
    <section className="max-w-4xl mx-auto my-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-lg shadow p-6 text-center ${stat.color}`}
          >
            <div className="text-3xl font-bold mb-2">{stat.value}</div>
            <div className="text-sm font-semibold">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
