import { useMemo } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import Home from "./components/Home";
import Admin from "./components/Admin";
import Claim from "./components/Claim";
import Verify from "./components/Verify";

function App() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-black">
              <Navigation />

              <div className="container mx-auto px-6 py-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/claim" element={<Claim />} />
                  <Route path="/claim/:issuer/:uniqueKey" element={<Claim />} />
                  <Route path="/verify" element={<Verify />} />
                  <Route
                    path="/verify/:issuer/:uniqueKey"
                    element={<Verify />}
                  />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function Navigation() {
  return (
    <nav className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-6xl font-extrabold tracking-tight">
          <span className=" bg-white bg-clip-text text-transparent font-['Fredoka']">
            FORJ
          </span>
        </h1>

        <div className="flex gap-3 items-center">
          <NavButton to="/">Home</NavButton>
          <NavButton to="/admin">Admin</NavButton>
          <NavButton to="/claim">Claim</NavButton>
          <NavButton to="/verify">Verify</NavButton>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}

function NavButton({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  const isActive = window.location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
}

export default App;
