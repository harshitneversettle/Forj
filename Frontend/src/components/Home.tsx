import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 space-y-24 ">
      <section className="text-center space-y-10">
        <div className="inline-block ">
          <h1 className="text-8xl tracking-widest font-black text-white mb-4 hover:scale-105 transition-transform duration-500">
            FORJ
          </h1>
        </div>

        <div className="space-y-4 ">
          <p className="text-3xl text-white font-light">
            On‑chain credentials for modern institutions
          </p>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Issue, claim, and verify certificates with cryptographic guarantees.
            Minimal trust, maximal transparency.
          </p>
        </div>

        <div className="flex justify-center gap-4 mt-4 animate-slide-up  animation-delay-300">
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

        <div className="mt-10 grid grid-cols-3 max-w-xl mx-auto gap-4 text-sm text-gray-400 animate-fade-in  animation-delay-400">
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
            color: "red",
            description:
              "Upload structured CSVs, anchor them on-chain, and export verifiable credentials for thousands of students in a single transaction.",
          },
          {
            title: "Learners",
            color: "green",
            description:
              "No need to connect wallet, authenticate with college email (or registered to csv), and claim non‑transferable proof of completion bound to your identity.",
          },
          {
            title: "Reviewers",
            color: "blue",
            description:
              "Paste an email on which cert is issued , and verify certificates using merkle proofs against the on‑chain root in real time.",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className={` relative p-8 bg-zinc-900/70 rounded-3xl border border-white/10 transition-all duration-500 `}
          >
            <div className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />

            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <div className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center ">
                  <span
                    className={`w-2.5 h-2.5 rounded-full bg-${item.color}-500  `}
                  />
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

      <section className="text-center animate-fade-in  animation-delay-1200">
        <p className="text-gray-500 text-lg tracking-widest uppercase">
          Immutable . Verifiable . Composable . Institution‑grade
        </p>
      </section>
    </div>
  );
}
