import { IoNotificationsCircleOutline } from "react-icons/io5";
import { LuX } from "react-icons/lu";

interface props {
  notification: {
    show: boolean;
    message: string;
    subtitle?: string | undefined;
    type: "success" | "error" | "warning" | "none";
  };
  setNotification: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      message: string;
      subtitle?: string;
      type: "success" | "error" | "warning" | "none";
    }>
  >;
}
export default function ShowNoti({ notification, setNotification }: props) {
  return (
    <>
      {notification.show && (
        <div className="fixed inset-0 z-1000 flex items-start justify-center pt-20 pointer-events-none transition-all duration-300">
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
                <IoNotificationsCircleOutline />
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
                  setNotification({
                    show: false,
                    message: "",
                    type: "success",
                  })
                }
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <LuX />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
