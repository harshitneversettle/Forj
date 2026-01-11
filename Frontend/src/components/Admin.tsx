import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Connection,
} from "@solana/web3.js";
import axios from "axios";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import idl from "/home/titan/Desktop/forj/target/idl/forj.json";

export default function Admin() {
  const programId = new PublicKey(
    "8DUw9b9nwoXH6FuqBUGy7dknzpDy1Ljh94rwKYNdEHRb"
  );
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const [file, setFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventId, setEventId] = useState("0");
  const [emailDomain, setEmailDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [templateDragActive, setTemplateDragActive] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [uniqueKey, setUniquekey] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    subtitle?: string;
    type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });

  const getProvider = () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions } as any,
      { commitment: "confirmed" }
    );
    return provider;
  };

  const getProgram = () => {
    const provider = getProvider();
    if (!provider) return null;
    return new Program(idl as any, provider);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        setLoadingBalance(true);
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance(null);
        } finally {
          setLoadingBalance(false);
        }
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning",
    subtitle?: string
  ) => {
    setNotification({ show: true, message, subtitle, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      6000
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleTemplateDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setTemplateDragActive(true);
    } else if (e.type === "dragleave") {
      setTemplateDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const ext = droppedFile.name.split(".").pop()?.toLowerCase();
      if (ext !== "csv" && droppedFile.type !== "text/csv") {
        showNotification(
          "Invalid file format",
          "error",
          "Please upload a CSV file only"
        );
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleTemplateDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTemplateDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const ext = droppedFile.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf" && droppedFile.type !== "application/pdf") {
        showNotification(
          "Invalid file format",
          "error",
          "Please upload a PDF file only"
        );
        return;
      }
      setTemplateFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !eventName || !emailDomain || !templateFile) {
      showNotification(
        "Please fill all fields",
        "error",
        "CSV, template, and event details required"
      );
      return;
    }

    if (balance !== null && balance < 0.01) {
      showNotification(
        "Insufficient balance",
        "error",
        "You need at least 0.01 SOL"
      );
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && file.type !== "text/csv") {
      showNotification(
        "Invalid file format",
        "error",
        "Please upload a CSV file only"
      );
      return;
    }

    const templateExt = templateFile.name.split(".").pop()?.toLowerCase();
    if (templateExt !== "pdf" && templateFile.type !== "application/pdf") {
      showNotification(
        "Invalid template format",
        "error",
        "Please upload a PDF template only"
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload = new FormData();
      payload.append("eventName", eventName);
      payload.append("eventId", eventId);
      payload.append("emailDomain", emailDomain);
      payload.append("csv", file);
      payload.append("template", templateFile);
      payload.append("issuerPubkey", publicKey?.toBase58() || "");

      const response = await axios.post(
        "http://localhost:3001/api/upload",
        payload
      );
      const data = response.data;
      console.log(data);
      // console.log(publicKey?.toBase58());
      setUniquekey(data.eventId);
      const batchSize = data.batchSize;
      const bitMap = Buffer.from(data.bitMap, "hex");
      const merkleRoot = data.merkleRoot;
      const metadataUri = data.metadataUri;
      const templateUri = data.templateUri;
      const merkleProofUri = data.merkleProofUri;
      if (!publicKey) {
        showNotification("Wallet not connected", "error");
        return;
      }

      const [eventPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("event"),
          publicKey.toBuffer(),
          new BN(uniqueKey).toArrayLike(Buffer, "le", 8),
        ],
        programId
      );
      // console.log(eventId);
      // console.log(eventPda.toString());
      // console.log(eventName);
      // console.log(response.data);
      const exist = await connection.getAccountInfo(eventPda);
      if (exist) {
        showNotification(
          "Batch already exists!",
          "warning",
          "Changing eventId may work"
        );
        return;
      }

      const program = getProgram();
      if (!program) {
        showNotification("Failed to initialize program", "error");
        return;
      }

      const tx = await program.methods
        .initEvent(
          new BN(uniqueKey),
          eventName,
          new BN(eventId),
          batchSize,
          bitMap,
          merkleRoot,
          metadataUri,
          templateUri,
          merkleProofUri
        )
        .accounts({
          issuer: publicKey,
          newEvent: eventPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setTimeout(() => {
        setResult({
          success: true,
          data: {
            totalCertificates: batchSize,
            eventName: eventName,
            transactionSignature: tx,
            merkleRoot: merkleRoot,
            metadataUri: metadataUri,
            templateUploaded: data.templateUri || "Uploaded",
          },
        });
      }, 3000);
      showNotification(
        "Certificates issued successfully!",
        "success",
        "Transaction confirmed on blockchain"
      );

      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error: any) {
      console.error("Transaction error:", error);
      showNotification(
        "Transaction failed",
        "error",
        error.message || "Please check your connection"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <div className="bg-white/5 backdrop-blur-sm p-12 rounded-2xl border border-white/10 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Wallet Required
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Connect your wallet to issue certificates on the blockchain
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="mb-8 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Wallet Balance</p>
              {loadingBalance ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-300 text-sm">Loading...</p>
                </div>
              ) : (
                <p className="text-white text-2xl font-bold">
                  {balance !== null ? balance.toFixed(4) : "0.0000"} SOL
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-1">Connected Wallet</p>
            <p className="text-gray-300 text-sm font-mono">
              {publicKey.toBase58().slice(0, 4)}...
              {publicKey.toBase58().slice(-4)}
            </p>
            {balance !== null && balance < 0.01 && (
              <p className="text-red-400 text-xs mt-2 flex items-center justify-end gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Low balance
              </p>
            )}
          </div>
        </div>
      </div>

      {notification.show && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
          <div
            className={`pointer-events-auto max-w-md w-full p-6 rounded-2xl border backdrop-blur-2xl shadow-2xl transform transition-all duration-500 ease-out animate-slide-down ${
              notification.type === "success"
                ? "bg-green-500/10 border-green-500/30"
                : notification.type === "warning"
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.type === "success"
                    ? "bg-green-500/20 text-green-400"
                    : notification.type === "warning"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d={
                      notification.type === "success"
                        ? "M5 13l4 4L19 7"
                        : notification.type === "warning"
                        ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        : "M6 18L18 6M6 6l12 12"
                    }
                  />
                </svg>
              </div>
              <div className="flex-1 pt-1">
                <p
                  className={`font-bold text-xl mb-2 ${
                    notification.type === "success"
                      ? "text-green-400"
                      : notification.type === "warning"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {notification.message}
                </p>
                {notification.subtitle && (
                  <p className="text-sm text-gray-400">
                    {notification.subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  setNotification({ show: false, message: "", type: "success" })
                }
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Event Name
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Hackathon 2026"
              className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Event ID
            </label>
            <input
              type="number"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Email Domain
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
              @
            </span>
            <input
              type="text"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              placeholder="mitsgwl.ac.in"
              className="w-full pl-12 pr-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Certificate Template (Fillable PDF)
          </label>
          <div
            onDragEnter={handleTemplateDrag}
            onDragLeave={handleTemplateDrag}
            onDragOver={handleTemplateDrag}
            onDrop={handleTemplateDrop}
            className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
              templateDragActive
                ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
                : "border-white/20 bg-black/20"
            }`}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  const ext = selectedFile.name.split(".").pop()?.toLowerCase();
                  if (
                    ext !== "pdf" &&
                    selectedFile.type !== "application/pdf"
                  ) {
                    showNotification(
                      "Invalid file format",
                      "error",
                      "Please upload a PDF file only"
                    );
                    e.target.value = "";
                    return;
                  }
                  setTemplateFile(selectedFile);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              {templateFile ? (
                <div className="animate-fade-in">
                  <p className="text-white font-semibold mb-1">
                    {templateFile.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {(templateFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium mb-2">
                    Drop PDF template here or click to browse
                  </p>
                  <p className="text-sm text-gray-400">
                    Fillable PDF with form fields required
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Upload CSV File (Participant Data)
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
              dragActive
                ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                : "border-white/20 bg-black/20"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  const ext = selectedFile.name.split(".").pop()?.toLowerCase();
                  if (ext !== "csv" && selectedFile.type !== "text/csv") {
                    showNotification(
                      "Invalid file format",
                      "error",
                      "Please upload a CSV file only"
                    );
                    e.target.value = "";
                    return;
                  }
                  setFile(selectedFile);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              {file ? (
                <div className="animate-fade-in">
                  <p className="text-white font-semibold mb-1">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium mb-2">
                    Drop CSV file here or click to browse
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports CSV files only
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || (balance !== null && balance < 0.01)}
          className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white py-5 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/25"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : balance !== null && balance < 0.01 ? (
            "Insufficient Balance - Need 0.01 SOL"
          ) : (
            "Issue Certificates"
          )}
        </button>

        {result?.success && (
          <div className="mt-8 p-8 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-2 border-green-500/30 rounded-2xl animate-fade-in shadow-xl">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                <svg
                  className="w-9 h-9 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-400 text-3xl mb-4">
                  Certificates Issued Successfully!
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-base">
                    <span className="text-gray-400">Total Certificates:</span>
                    <span className="text-white font-semibold">
                      {result.data.totalCertificates}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <span className="text-gray-400">Event:</span>
                    <span className="text-white font-semibold">
                      {result.data.eventName}
                    </span>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg space-y-2">
                    <p className="text-md text-gray-500 uppercase tracking-wide">
                      Transaction Signature
                    </p>
                    <p className="text-gray-300 break-all font-mono text-md">
                      {result.data.transactionSignature}
                    </p>
                    <a
                      href={`https://explorer.solana.com/tx/${result.data.transactionSignature}?cluster=custom&customUrl=http://127.0.0.1:8899`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-md mt-2 transition-colors"
                    >
                      View on Solana Explorer
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg space-y-2">
                    <p className="text-md text-gray-500 uppercase tracking-wide">
                      Merkle Root
                    </p>
                    <p className="text-gray-300 break-all font-mono text-md">
                      {result.data.merkleRoot}
                    </p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg space-y-2">
                    <p className="text-md text-gray-500 uppercase tracking-wide">
                      Metadata URI
                    </p>
                    <a
                      href={result.data.metadataUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 break-all text-md transition-colors"
                    >
                      {result.data.metadataUri}
                    </a>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg space-y-2">
                    <p className="text-md text-gray-500 uppercase tracking-wide">
                      Shareable link
                    </p>
                    <a
                      href={`http://localhost:5173/claim/${publicKey.toBase58()}/${uniqueKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 break-all text-md transition-colors"
                    >
                      {`http://localhost:5173/claim/${publicKey.toBase58()}/${uniqueKey}`}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
