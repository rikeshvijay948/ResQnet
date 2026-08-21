import { FaMapMarkedAlt, FaHandsHelping, FaExclamationTriangle } from "react-icons/fa";

function Features() {
  return (
    <section className="py-20">
      <h2 className="text-4xl font-bold text-center mb-12">
        Our Features
      </h2>

      <div className="grid md:grid-cols-3 gap-8 px-10">

        <div className="p-8 rounded-xl shadow-lg text-center">
          <FaExclamationTriangle className="text-5xl mx-auto text-red-500 mb-4" />
          <h3 className="text-2xl font-bold">Quick Reporting</h3>
          <p>Report emergencies within seconds.</p>
        </div>

        <div className="p-8 rounded-xl shadow-lg text-center">
          <FaMapMarkedAlt className="text-5xl mx-auto text-blue-500 mb-4" />
          <h3 className="text-2xl font-bold">Live Map</h3>
          <p>Track incidents on an interactive map.</p>
        </div>

        <div className="p-8 rounded-xl shadow-lg text-center">
          <FaHandsHelping className="text-5xl mx-auto text-green-500 mb-4" />
          <h3 className="text-2xl font-bold">Volunteer Network</h3>
          <p>Connect volunteers with affected citizens.</p>
        </div>

      </div>
    </section>
  );
}

export default Features;