import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="text-center py-24">

      <h1 className="text-5xl font-bold text-gray-800">
        Disaster Management Made Smarter
      </h1>

      <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
        Report emergencies instantly and help emergency organizations
        coordinate rescue operations efficiently.
      </p>

      <div className="mt-10 flex justify-center gap-5">

        <button
          onClick={() => navigate("/report-emergency")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Report Emergency
        </button>

        <button
          className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg"
        >
          Learn More
        </button>

      </div>

    </section>
  );
}

export default Hero;