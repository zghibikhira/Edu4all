export default function Features() {
  const items = [
    { title: "Online Courses", desc: "Access hundreds of premium courses." },
    { title: "Live Sessions", desc: "Interact with qualified teachers." },
    { title: "Personalized Stats", desc: "Track your progress in real-time." },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#1E90FF] mb-10">Main Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#1E90FF] mb-2">{item.title}</h3>
              <p className="text-[#2B2B2B]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
