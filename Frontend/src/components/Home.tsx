import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 space-y-24">
      <section className="text-center space-y-10">
        <div className="inline-block animate-fade-in">
          <h1 className="text-8xl tracking-[0.12em] font-black text-white mb-4 hover:scale-105 transition-transform duration-500">
            FORJ
          </h1>
        </div>

        <div className="space-y-4 animate-slide-up opacity-0 animation-delay-200">
          <p className="text-3xl text-white font-light">
            On‑chain credentials for modern institutions
          </p>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Issue, claim, and verify certificates with cryptographic guarantees.
            Minimal trust, maximal transparency.
          </p>
        </div>

        <div className="flex justify-center gap-4 mt-4 animate-slide-up opacity-0 animation-delay-300">
          <button
            className="px-8 py-3 rounded-full bg-white text-black font-semibold text-sm tracking-wide hover:bg-gray-500 transition-colors duration-100 "
            onClick={() => navigate("/admin")}
          >
            Get started
          </button>
          <button
            className="px-8 py-3 rounded-full border border-white/30 text-white font-semibold text-sm tracking-wide hover:border-white transition-colors duration-200"
            onClick={() => {
              window.location.href =
                "https://github.com/harshitneversettle/Forj/blob/main/README.md";
            }}
          >
            View docs
          </button>
        </div>

        <div className="mt-10 grid grid-cols-3 max-w-xl mx-auto gap-4 text-sm text-gray-400 animate-fade-in opacity-0 animation-delay-400">
          <div className="border border-white/10 rounded-xl py-3 bg-white/5 backdrop-blur-md">
            <p className="text-xs uppercase tracking-wide ">
              Average verify time
            </p>
            <p className="text-lg text-white mt-1">~400 ms</p>
          </div>
          <div className="border border-white/10 rounded-xl py-3 bg-white/5 backdrop-blur-md">
            <p className="text-xs uppercase tracking-wide">
              Per certificate cost
            </p>
            <p className="text-lg text-white mt-1">&lt; 0.001 SOL</p>
          </div>
          <div className="border border-white/10 rounded-xl py-3 bg-white/5 backdrop-blur-md">
            <p className="text-xs uppercase tracking-wide">Merkle compressed</p>
            <p className="text-lg text-white mt-1">Yes</p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Program admins",
            color: "blue",
            description:
              "Upload structured CSVs, anchor them on-chain, and export verifiable credentials for thousands of students in a single transaction.",
          },
          {
            title: "Learners",
            color: "orange",
            description:
              "No need to connect wallet, authenticate with college email (or registered to csv), and claim non‑transferable proof of completion bound to your identity.",
          },
          {
            title: "Reviewers",
            color: "green",
            description:
              "Paste an email on which cert is issued , and verify certificates using merkle proofs against the on‑chain root in real time.",
          },
        ].map((item, idx) => (
          <div
            key={item.title}
            className={`group  relative bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 transition-all duration-500 hover:border-${
              item.color
            }-400 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up opacity-0 ${
              idx === 0
                ? "animation-delay-500"
                : idx === 1
                ? "animation-delay-650"
                : "animation-delay-800"
            }`}
          >
            <div className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />

            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <div className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                  <span className="w-2 h-2 rounded-full bg-white/70" />
                </div>
              </div>

              <p className="text-gray-400 leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="uppercase tracking-wide">
                  Live merkle validation
                </span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  View flow →
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="text-center animate-fade-in opacity-0 animation-delay-1200">
        <p className="text-gray-500 text-lg tracking-[0.35em] uppercase">
          Immutable . Verifiable . Composable . Institution‑grade
        </p>
      </section>
    </div>
  );
}
