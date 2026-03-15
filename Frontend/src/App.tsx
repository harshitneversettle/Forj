import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { Buffer } from "buffer";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import Home from "./components/Home";
import Admin from "./components/Admin";
import Claim from "./components/Claim";
import Verify from "./components/Verify";
import Demo from "./components/Demo";
import Navbar from "./components/Navbar";
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}
function App() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-black">
              <Navbar />
              <div className="container mx-auto ">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/claim" element={<Claim />} />
                  <Route path="/claim/:issuer/:uniqueKey" element={<Claim />} />
                  <Route path="/verify" element={<Verify />} />
                  <Route
                    path="/verify/:issuer/:uniqueKey/:studentEmail"
                    element={<Verify />}
                  />
                  <Route element={<Demo />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
