import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL, Connection, PublicKey } from "@solana/web3.js";

export function useWalletBalance(
  connection: Connection,
  publicKey: PublicKey | null ,
) {
  const [balance, setBalance] = useState<number | null>(null);
  const fetchBalance = async () => {
    if (publicKey) {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      }
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [publicKey]);

  return { balance };
}
