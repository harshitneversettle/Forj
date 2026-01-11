import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function Verify() {
  const { issuer, uniqueKey, studentEmail } = useParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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

  const handleVerify = async () => {
    if (!studentEmail) {
      showNotification(
        "Email required",
        "error",
        "Please enter your email address"
      );
      return;
    }

    setLoading(true);
    setResult(null);
    let email = studentEmail;
    try {
      const reqData = {
        issuer,
        uniqueKey,
        email,
      };

      const response = await axios.post(
        "http://localhost:3001/api/verify",
        reqData
      );

      const data = await response.data;
      setResult(data);

      if (data === true) {
        showNotification(
          "Valid Certificate",
          "success",
          "The certificate is cryptographically valid"
        );
      } else {
        showNotification(
          "Invalid Certificate",
          "error",
          "The certificate is cryptographically invalid"
        );
      }
    } catch (error: any) {
      setResult({ valid: false, error: error.message });
      showNotification(
        "Verification failed",
        "error",
        error.message || "Please check your connection"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 fixed inset-0 z-50 pt-40 ">
      {notification.show && (
        <div className="fixed z-50 top-22 left-191 text-center bg-animate-slide-in">
          <div
            className={`bg-black border rounded-xl p-4 shadow-2xl max-w-md ${
              notification.type === "success"
                ? "border-white"
                : notification.type === "warning"
                ? "border-yellow-500/30"
                : "border-red-500/30"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.type === "success"
                    ? "bg-green-500/20 text-green-400"
                    : notification.type === "warning"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
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
              <div className="flex-1">
                <p
                  className={`font-semibold text-lg ${
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
                  <p className="text-sm text-gray-400 mt-1">
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

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">
            Verify Certificate
          </h1>
          <p className="text-gray-400">
            Enter your email to verify certificate authenticity on-chain
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Event ID
              </label>
              <div className="px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white">
                {uniqueKey}
              </div>
            </div>

            <div>
              <label className="block text-md font-medium text-gray-400 mb-2">
                Email Address : {studentEmail}
              </label>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-green-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Certificate"
              )}
            </button>
          </div>

          {result !== null && (
            <div
              className={`mt-6 p-6 rounded-xl border backdrop-blur-sm ${
                result
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              {result ? (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-green-400"
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
                  </div>
                  <div>
                    <p className="font-bold text-green-400 text-xl mb-2">
                      Valid Certificate
                    </p>
                    <p className="text-sm text-gray-400">
                      This certificate is cryptographically verified and exists
                      on the Solana blockchain
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-red-400 text-xl mb-2">
                      Invalid Certificate
                    </p>
                    <p className="text-sm text-gray-400">
                      {result.error ||
                        "This certificate could not be verified on the blockchain"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            All verifications are performed against the Solana blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
