import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { backend_url } from "../config/be_url";
import { useNotihandler } from "../hooks/notihandler";
import ShowNoti from "./showNoti";

export default function Verify() {
  const { issuer, uniqueKey, studentEmail } = useParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(false);
  const { handlenoti, notification, setNotification } = useNotihandler();

  const handleVerify = async () => {
    if (!studentEmail) {
      handlenoti("Email required", "Please enter your email address", "error");
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
      const response = await axios.post(`${backend_url}/api/verify`, reqData);
      const data = await response.data;
      console.log(data);
      if (data === "valid") {
        setResult(true);
        handlenoti(
          "Valid Certificate",
          "The certificate is cryptographically valid",
          "success",
        );
      } else {
        setResult(false);
        handlenoti(
          "Invalid Certificate",
          "The certificate is cryptographically invalid",
          "error",
        );
      }
    } catch (error: any) {
      setResult({ valid: false, error: error.message });
      handlenoti(
        "Verification failed",
        error.message || "Please check your connection",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 fixed inset-0 z-50 pt-40 ">
      <ShowNoti notification={notification} setNotification={setNotification} />
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
              className="w-full px-8 py-4 bg-white text-black tracking-widest font-semibold rounded-xl hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  Verifying...
                </span>
              ) : (
                "Verify Certificate"
              )}
            </button>
          </div>

          {result && (
            <div
              className={`mt-6 p-6 rounded-xl border backdrop-blur-sm ${
                result
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              {result ? (
                <div className="flex items-start gap-4">
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
