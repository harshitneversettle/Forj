import { useState } from "react";
import axios from "axios";
import { useNotihandler } from "../hooks/notihandler";
import ShowNoti from "./showNoti";
import type ClaimData from "../types/ClaimData";
import ClaimCert from "./claimcert";
import type GoogleUser from "../types/GoogleUser";
import { backend_url } from "../config/be_url";

export default function Claim() {
  // const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [processingPdf, setProcessingPdf] = useState(false);
  const { handlenoti, notification, setNotification } = useNotihandler();
  const [user, setUser] = useState<GoogleUser | null>(null);

  const handleGenerateCertificate = async () => {
    if (!claimData || !claimData.templateUri) return;

    setProcessingPdf(true);
    console.log(claimData);
    try {
      if (!claimData.verifyUrl) return;
      const response = await axios.post(
        `${backend_url}/api/generate-certificate`,
        {
          name: claimData.name,
          email: claimData.email,
          enrollment: claimData.enrollment,
          position: claimData.position || null,
          eventName: claimData.eventName,
          templateUri: claimData.templateUri,
          verifyUrl: claimData.verifyUrl,
        },
        { responseType: "arraybuffer" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${claimData.eventName}-${claimData.enrollment}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      handlenoti(
        "Certificate downloaded!",
        "Check your downloads folder",
        "success",
      );
    } catch (error) {
      console.error("Generate certificate error:", error);
      handlenoti("Failed to generate certificate", "Please try again", "error");
    } finally {
      setProcessingPdf(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto relative">
      <ShowNoti notification={notification} setNotification={setNotification} />
      {claimData ? (
        <div className="animate-fade-in">
          <div className="text-center mb-8 mt-10">
            <h2 className="text-5xl font-bold text-white mb-4">
              Certificate claimed
            </h2>
            <p className="text-gray-400 text-lg">
              Your certificate has been successfully claimed
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-2xl mb-8">
            <div className="space-y-6">
              <div className="pb-6 border-b border-white/10">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                  Recipient Name
                </p>
                <p className="text-2xl font-bold text-white">
                  {claimData.name}
                </p>
              </div>

              <div className="pb-6 border-b border-white/10">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                  Email Address
                </p>
                <p className="text-lg text-gray-300">{claimData.email}</p>
              </div>

              <div className="pb-6 border-b border-white/10">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                  Enrollment Number
                </p>
                <p className="text-lg font-mono text-gray-300">
                  {claimData.enrollment}
                </p>
              </div>

              <div className="pb-6 border-b border-white/10">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                  Position / Achievement
                </p>
                <p className="text-lg font-semibold text-blue-400">
                  {claimData.position === "1" && "1st Place"}
                  {claimData.position === "2" && "2nd Place"}
                  {claimData.position === "3" && "3rd Place"}
                  {!["1", "2", "3"].includes(claimData.position) &&
                    `Position ${claimData.position}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                  Event Name
                </p>
                <p className="text-lg text-gray-300">{claimData.eventName}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={handleGenerateCertificate}
              disabled={processingPdf}
              className="bg-white text-black py-5 px-8 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {processingPdf ? (
                <>Generating...</>
              ) : (
                <>Download PDF Certificate</>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setClaimData(null);
                setUser(null);
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Claim another certificate
            </button>
          </div>
        </div>
      ) : (
        <ClaimCert
          user={user}
          setUser={setUser}
          handlenoti={handlenoti}
          setClaimData={setClaimData}
        />
      )}
    </div>
  );
}
