import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import axios from "axios";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import idl from "./idl.json";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { useDragDrop } from "../hooks/DragDrop";
import InputCred from "./inputCred";
import Pdf from "./pdfupload";
import Csv from "./csvupload";
import Result from "./result";
import ShowNoti from "./showNoti";
import { useNotihandler } from "../hooks/notihandler";
import { backend_url } from "../config/be_url";
import { FaLock } from "react-icons/fa";

export default function Admin() {
  const programId = new PublicKey(
    "EtaqN8Lz1J1zdoJRXapCNudMDKaWyxcGtapi6eWjnGfC",
  );
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  useEffect(() => {
    async function m() {
      const response = await axios.post(`${backend_url}/api/admin-signup`, {
        address: publicKey,
        issueAmount: 0,
      });
      console.log(response);
    }
    m();
  }, [publicKey]);

  const connection = new Connection(
    "https://devnet.helius-rpc.com/?api-key=734f5c9d-1802-48ab-ab39-4d2c80f8dd6e",
    "confirmed",
  );

  const eventNameRef = useRef<HTMLInputElement>(null);
  const eventIdRef = useRef<HTMLInputElement>(null);
  const emailDomainRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { balance } = useWalletBalance(connection, publicKey);
  const uniqueKeyRef = useRef<number>(null);

  const { handlenoti, notification, setNotification } = useNotihandler();
  const getProvider = () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions } as any,
      { commitment: "confirmed" },
    );
    return provider;
  };

  const getProgram = () => {
    const provider = getProvider();
    if (!provider) return null;
    return new Program(idl as any, provider);
  };

  const {
    file,
    templateFile,
    handleDrag,
    handleTemplateDrag,
    handleDrop,
    handleTemplateDrop,
  } = useDragDrop(handlenoti);

  if (!publicKey) {
    return (
      <>
        <ShowNoti
          notification={notification}
          setNotification={setNotification}
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <FaLock size={28} className="text-zinc-200" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-white text-2xl font-semibold">
              Wallet not connected
            </p>
            <p className="text-gray-500 text-md">
              Connect your Solana wallet to issue certificates
            </p>
          </div>
        </div>
      </>
    );
  }

  const handleUpload = async () => {
    if (
      !file ||
      !eventNameRef.current?.value ||
      !emailDomainRef.current?.value ||
      !templateFile
    ) {
      handlenoti(
        "Please fill all fields",
        "CSV, template, and event details required",
        "error",
      );
      return;
    }

    if (balance !== null && balance < 0.01) {
      handlenoti("Insufficient balance", "You need at least 0.01 SOL", "error");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && file.type !== "text/csv") {
      handlenoti(
        "Invalid file format",
        "Please upload a CSV file only",
        "error",
      );
      return;
    }

    const templateExt = templateFile.name.split(".").pop()?.toLowerCase();
    if (templateExt !== "pdf" && templateFile.type !== "application/pdf") {
      handlenoti(
        "Invalid template format",
        "Please upload a PDF template only",
        "error",
      );
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      if (!eventIdRef.current) return;
      const payload = new FormData();
      payload.append("eventName", eventNameRef.current.value);
      payload.append("eventId", eventIdRef.current.value);
      payload.append("emailDomain", emailDomainRef.current.value);
      payload.append("csv", file);
      payload.append("template", templateFile);
      payload.append("issuerPubkey", publicKey?.toBase58() || "");

      console.log("payload gaya");
      const response = await axios.post(`${backend_url}/api/upload`, payload);
      const data = response.data;
      console.log(data);
      uniqueKeyRef.current = data.eventId;
      const batchSize = data.batchSize;
      const bitMap = Buffer.from(data.bitMap, "hex");
      const merkleRoot = data.merkleRoot;
      const metadataUri = data.metadataUri;
      const templateUri = data.templateUri;
      const merkleProofUri = data.merkleProofUri;
      const all_students = data.all_students;
      console.log(publicKey.toString());
      const address = publicKey.toString();
      if (!publicKey) {
        handlenoti("Wallet not connected", "connect your wallet", "error");
        return;
      }
      const [eventPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("event"),
          publicKey.toBuffer(),
          new BN(eventIdRef.current.value).toArrayLike(Buffer, "le", 8),
        ],
        programId,
      );
      console.log(eventPda.toString());
      const exist = await connection.getAccountInfo(eventPda);
      if (exist) {
        alert("batch already exists , try changing the EventId");
        eventNameRef.current.value = "";
        eventIdRef.current.value = "";
        emailDomainRef.current.value = "";
        return;
      }
      const program = getProgram();
      if (!program) {
        handlenoti("Failed to initialize program", "", "error");
        return;
      }

      const tx = await program.methods
        .initEvent(
          new BN(data.eventId),
          eventNameRef.current.value,
          new BN(eventIdRef.current.value),
          batchSize,
          bitMap,
          merkleRoot,
          metadataUri,
          templateUri,
          merkleProofUri,
        )
        .accounts({
          issuer: publicKey,
          newEvent: eventPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setResult({
        success: true,
        data: {
          totalCertificates: batchSize,
          eventName: eventNameRef.current.value,
          transactionSignature: tx,
          merkleRoot: merkleRoot,
          metadataUri: metadataUri,
          templateUploaded: data.templateUri || "Uploaded",
        },
      });
      handlenoti(
        "Certificates issued successfully!",
        "Transaction confirmed on blockchain",
        "success",
      );
      const response3 = await axios.post(`${backend_url}/api/update-event`, {
        eventName: eventNameRef.current.value,
        eventId: eventIdRef.current.value,
        issueAmount: batchSize,
        adminAddress: address,
      });
      console.log(response3);
      let all_mails: string[] = [];
      Object.entries(all_students).map((i: any) => {
        all_mails.push(i[1].email);
      });
      const response4 = await axios.post(`${backend_url}/api/update-students`, {
        all_mails,
        eventId: Number(eventIdRef.current.value),
      });
      console.log(response4.data);
    } catch (error: any) {
      console.error("Transaction error:", error);
      handlenoti(
        "Transaction failed",
        error.message || "Please check your connection",
        "error",
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      <ShowNoti notification={notification} setNotification={setNotification} />
      <div className="mb-8 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-gray-400 text-sm">Wallet Balance</p>
              <p className="text-white text-2xl font-bold">
                {balance !== null ? balance.toFixed(4) : "0.0000"} SOL
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">Connected Wallet</p>
            <p className="text-gray-300 text-md  font-mono">
              {publicKey.toBase58().slice(0, 8)}...
              {publicKey.toBase58().slice(-4)}
            </p>
            {balance !== null && balance < 0.01 && (
              <p className="text-red-400 text-xs mt-2 flex items-center justify-end gap-1">
                Low balance
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-5xl font-bold text-white mb-4">
          Issue Certificates
        </h2>
        <p className="text-gray-400 text-lg">
          Upload CSV, template, and deploy certificates to Solana blockchain
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <InputCred
            eventNameRef={eventNameRef}
            eventIdRef={eventIdRef}
            emailDomainRef={emailDomainRef}
          />
        </div>

        <Pdf
          handleTemplateDrag={handleTemplateDrag}
          handleTemplateDrop={handleTemplateDrop}
          templateDragActive
          templateFile={templateFile}
          handlenoti={handlenoti}
        />

        <Csv
          handleDrag={handleDrag}
          handleDrop={handleDrop}
          dragActive
          handlenoti={handlenoti}
          file={file}
        />

        <button
          onClick={handleUpload}
          // disabled={loading || (balance !== null && balance < 0.01)}
          className="w-full bg-white/90 text-black py-5 px-6 rounded-xl font-bold text-lg transform hover:scale-[1.02] transition-all duration-200 "
        >
          {balance !== null && balance < 0.01
            ? "Insufficient Balance - Need 0.01 SOL"
            : "Issue Certificates"}
        </button>
      </div>

      {result?.success && (
        <Result
          result={result}
          uniqueKeyRef={uniqueKeyRef}
          publicKey={publicKey}
          emailDomainRef={emailDomainRef}
          eventNameRef={eventNameRef}
        />
      )}
    </div>
  );
}
