import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Connection, PublicKey } from "@solana/web3.js";
import { useParams } from "react-router-dom";
import { eventNames } from "process";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

interface ClaimData {
  name: string;
  email: string;
  enrollment: string;
  position: string;
  eventName: string;
  templateUri: string;
  verifyUrl : string;
}

export default function Claim() {
  const programId = new PublicKey(
    "8DUw9b9nwoXH6FuqBUGy7dknzpDy1Ljh94rwKYNdEHRb"
  );
  const { issuer, uniqueKey } = useParams();
  const issuerPubkey = issuer ? new PublicKey(issuer!) : null;
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [processingPdf, setProcessingPdf] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    subtitle?: string;
    type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });
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
  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const userData: GoogleUser = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        email_verified: decoded.email_verified,
      };
      setUser(userData);
      showNotification("Successfully signed in!", "success");
    } catch (error) {
      console.error("Error decoding token:", error);
      showNotification("Failed to decode Google token", "error");
    }
  };

  const handleClaim = async () => {
    if (!user) {
      showNotification(
        "Please sign in with Google first",
        "warning",
        "Sign in using registered email"
      );
      return;
    }

    if (!user.email_verified) {
      showNotification(
        "Email not verified",
        "error",
        "Please verify your email address"
      );
      return;
    }

    setLoading(true);

    try {
      const data = {
        pubkey: issuerPubkey?.toString(),
        uniqueKey,
        userEmail: user.email,
      };

      const response = await axios.post(
        "http://localhost:3001/api/claim",
        data
      );
      console.log(response.data);
      if (String(response.data) == "error") {
        showNotification("No cert for this mail", "error");
      }
      setClaimData({
        name: response.data.ans_name,
        email: response.data.ans_email,
        enrollment: response.data.ans_enroll,
        position: response.data.ans_position,
        eventName: response.data.eventName ,
        templateUri: response.data.templateUri,
        verifyUrl : response.data.verifyUrl ,
      });

      showNotification(
        "Certificate claimed successfully!",
        "success",
        "Your certificate is ready"
      );
    } catch (error: any) {
      console.error("Claim error:", error);
      showNotification(
        "Seems like no cert is issued to this email",
        "error",
        error.response?.data?.message || "Perform well next time"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!claimData || !claimData.templateUri) return;
    
    setProcessingPdf(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/generate-certificate",
        {
          name: claimData.name,
          email: claimData.email,
          enrollment: claimData.enrollment,
          position: claimData.position || null,
          eventName: claimData.eventName,
          templateUri: claimData.templateUri,
          verifyUrl : claimData.verifyUrl
        },
        { responseType: "arraybuffer" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${claimData.enrollment}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showNotification(
        "Certificate downloaded!",
        "success",
        "Check your downloads folder"
      );
    } catch (error) {
      console.error("Generate certificate error:", error);
      showNotification(
        "Failed to generate certificate",
        "error",
        "Please try again"
      );
    } finally {
      setProcessingPdf(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setClaimData(null);
    showNotification("Signed out successfully", "success");
  };

  const NotificationIcon = () => {
    const icons = {
      success: "M5 13l4 4L19 7",
      warning:
        "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      error: "M6 18L18 6M6 6l12 12",
    };
    return (
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
          d={icons[notification.type]}
        />
      </svg>
    );
  };

  return (
    <div className="max-w-2xl mx-auto relative">
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
                <NotificationIcon />
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

      {claimData ? (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-scale-in">
              <svg
                className="w-10 h-10 text-green-400"
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
              className="bg-green-600 text-white py-5 px-8 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
            >
              {processingPdf ? (
                <>
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
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF Certificate
                </>
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
        <>
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-5xl font-bold text-white mb-4">
              Claim Certificate
            </h2>
            <p className="text-gray-400 text-lg">
              Sign in to claim your blockchain certificate
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up">
            {!user ? (
              <div className="flex flex-col items-center space-y-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg
                    className="w-12 h-12 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-bold text-white">
                    Sign In Required
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Use your college email to authenticate and claim your cert
                  </p>
                </div>
                <div className="scale-110 hover:scale-115 transition-transform duration-200">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() =>
                      showNotification("Google Sign-In Failed", "error")
                    }
                    useOneTap
                    theme="filled_black"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4 p-5 rounded-xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="relative">
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-16 h-16 rounded-full border-2 border-blue-400/50 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    {user.email_verified && (
                      <div className="flex items-center gap-1 mt-1">
                        <svg
                          className="w-4 h-4 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-green-400 text-xs font-semibold">
                          Verified
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 font-semibold border border-red-500/30 hover:border-red-500/50"
                  >
                    Logout
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-gray-300">
                    Event ID: {uniqueKey}
                  </label>
                </div>

                <button
                  onClick={handleClaim}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-5 px-6 rounded-xl font-bold text-lg hover:bg-green-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-green-500/25 relative overflow-hidden group"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3 relative z-10">
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
                      Claiming Certificate...
                    </span>
                  ) : (
                    <span className="relative z-10">Claim Certificate</span>
                  )}
                </button>

                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-blue-300">
                    Make sure your email matches the one registered for this
                    event.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
