import type { PublicKey } from "@solana/web3.js";
import { frontend_url } from "../config/fe_url";
import axios from "axios";
import { backend_url } from "../config/be_url";

interface props {
  result: any;
  uniqueKeyRef: React.RefObject<number | null>;
  publicKey: PublicKey;
  emailDomainRef: React.RefObject<HTMLInputElement | null>;
  eventNameRef: React.RefObject<HTMLInputElement | null>;
}

export default function Result({
  result,
  uniqueKeyRef,
  publicKey,
  emailDomainRef,
  eventNameRef,
}: props) {
  console.log(typeof publicKey);

  async function handleMails() {
    const link = `${frontend_url}/claim/${publicKey.toString()}/${uniqueKeyRef.current?.toString()}`;
    const domain = emailDomainRef.current?.value;
    const eventName = eventNameRef.current?.value;

    const response = await axios.post(`${backend_url}/api/send-emails` , {
      link ,
      domain ,
      eventName
    })
    console.log(response.data)
  }

  return (
    <>
      {result.success && (
        <div className="mt-8 p-8 bg-zinc-950 text-white border border-white/30  rounded-2xl font-mono">
          <div className="flex items-start gap-5">
            <div className="flex-1">
              <p className="font-bold text-white text-3xl mb-6 tracking-tight">
                Certificates Issued Successfully!
              </p>

              <div className="h-px bg-[#1e1e1e] mb-5" />

              <div className="flex justify-between">
                <div className="space-y-3 mb-5">
                  <div className="text-md">
                    <span className="text-white">Total Certificates : </span>
                    <span className="text-white font-bold">
                      {result.data.totalCertificates}
                    </span>
                  </div>
                  <div className="text-md ">
                    <span className="text-white">Event Name : </span>
                    <span className="text-white font-bold">
                      {result.data.eventName}
                    </span>
                  </div>
                </div>
                <div className="">
                  <button
                    onClick={handleMails}
                    className="bg-white rounded-2xl border border-zinc-200/30 w-fit text-black p-1 hover:scale-[1.1] transition-all duration-300"
                  >
                    Send mails to all
                  </button>
                </div>
              </div>

              <div className="bg-black/90 border border-[#1e1e1e] p-4 rounded-xl space-y-2 mb-3">
                <p className="text-md text-white/50 uppercase tracking-widest">
                  Transaction Signature
                </p>
                <p className="text-white break-all font-mono text-md leading-relaxed">
                  {result.data.transactionSignature}
                </p>
                <a
                  href={`https://explorer.solana.com/tx/${result.data.transactionSignature}?cluster=custom&customUrl=https://api.devnet.solana.com`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-md mt-1 transition-colors"
                >
                  View on Solana Explorer
                </a>
              </div>

              <div className="bg-black/90 border border-[#1e1e1e] p-4 rounded-xl space-y-2 mb-3">
                <p className="text-md text-white/50 uppercase tracking-widest">
                  Merkle Root
                </p>
                <p className="text-md break-all font-mono text-md leading-relaxed">
                  {result.data.merkleRoot}
                </p>
              </div>

              <div className="bg-black/90 border border-[#1e1e1e] p-4 rounded-xl space-y-2 mb-3">
                <p className="text-md text-white/50 uppercase tracking-widest">
                  Metadata URI
                </p>
                <a
                  href={result.data.metadataUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 break-all font-mono text-md transition-colors"
                >
                  {result.data.metadataUri}
                </a>
              </div>

              <div className="bg-black/90 border border-[#1e1e1e] p-4 rounded-xl space-y-2">
                <p className="text-md text-white/50 uppercase tracking-widest">
                  Shareable Link
                </p>
                <a
                  href={`${frontend_url}/claim/${publicKey.toString()}/${uniqueKeyRef.current?.toString()}`}
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 break-all font-mono text-md transition-colors"
                >
                  {`${frontend_url}/claim/${publicKey.toString()}/${uniqueKeyRef.current?.toString()}`}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
