import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <>
      <nav>
        <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-500 ">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-6xl font-extrabold tracking-tight">
              <span className=" bg-white bg-clip-text text-transparent font-['Fredoka']">
                FORJ
              </span>
            </h1>

            <div className="flex gap-3 items-center">
              <button
                className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200  text-white hover:bg-zinc-800"
                onClick={() => {
                  console.log("button clicked home");
                  navigate("/");
                }}
              >
                Home
              </button>
              <button
                className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-white hover:bg-zinc-800"
                onClick={() => navigate("/admin")}
              >
                Admin
              </button>
              <button
                className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-white hover:bg-zinc-800"
                onClick={() => navigate("/claim")}
              >
                Claim
              </button>
              <button
                className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-white hover:bg-zinc-800"
                onClick={() => navigate("/verify")}
              >
                Verify
              </button>
              <button
                className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-white hover:bg-zinc-800"
                onClick={() => navigate("/admin-dashboard")}
              >
                admin-dashboard
              </button>

              <WalletMultiButton />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
