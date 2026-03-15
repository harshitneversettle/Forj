import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import type ClaimData from "../types/ClaimData";
import type GoogleUser from "../types/GoogleUser";
import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FaUser } from "react-icons/fa";
import { backend_url } from "../config/be_url";

interface props {
  user: GoogleUser | null;
  setUser: React.Dispatch<React.SetStateAction<GoogleUser | null>>;
  handlenoti: (
    message: string,
    subtitle: string,
    type: "success" | "error" | "none" | "warning",
  ) => void;
  setClaimData: React.Dispatch<React.SetStateAction<ClaimData | null>>;
}
export default function ClaimCert({
  handlenoti,
  user,
  setUser,
  setClaimData,
}: props) {
  const [loading, setLoading] = useState(false);
  const { issuer, uniqueKey } = useParams();
  const issuerPubkey = issuer ? new PublicKey(issuer!) : null;

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
      handlenoti("Successfully signed in!", "", "success");
    } catch (error) {
      console.error("Error decoding token:", error);
      handlenoti("Failed to decode Google token", "", "error");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setClaimData(null);
    handlenoti("Signed out successfully", "", "success");
  };

  const handleClaim = async () => {
    if (!user) {
      handlenoti(
        "Please sign in with Google first",
        "Sign in using registered email",
        "warning",
      );
      return;
    }

    if (!user.email_verified) {
      handlenoti(
        "Email not verified",
        "Please verify your email address",
        "error",
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

      const response = await axios.post(`${backend_url}/api/claim`, data);
      console.log(typeof response.data.verifyUrl);
      if (String(response.data) == "error") {
        handlenoti("No cert for this mail", "", "error");
      }
      setClaimData({
        name: response.data.ans_name,
        email: response.data.ans_email,
        enrollment: response.data.ans_enroll,
        position: response.data.ans_position,
        eventName: response.data.eventName,
        templateUri: response.data.templateUri,
        verifyUrl: response.data.verifyUrl,
      });

      handlenoti(
        "Certificate claimed successfully!",
        "Your certificate is ready",
        "success",
      );
    } catch (error: any) {
      console.error("Claim error:", error);
      handlenoti(
        "Seems like no cert is issued to this email",
        "error",
        error.response?.data?.message || "Perform well next time",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="text-center mb-12 animate-fade-in ">
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
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 ">
              <FaUser size={34} className="text-white " />
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
                onError={() => handlenoti("Google Sign-In Failed", "", "error")}
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
              className="w-full bg-white text-black  py-5 px-6 rounded-xl font-mono font-bold text-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none  relative overflow-hidden group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  Claiming Certificate...
                </span>
              ) : (
                <span className="relative z-10">Claim Certificate</span>
              )}
            </button>

            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                Make sure your email matches the one registered for this event.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
