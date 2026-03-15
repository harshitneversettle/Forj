import { useState } from "react";

export function useNotihandler() {
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    subtitle?: string;
    type: "success" | "error" | "warning" | "none";
  }>({show : false , message : "" , subtitle:"" , type:"none"});

  function handlenoti(
    message: string,
    subtitle: string,
    type: "success" | "error" | "warning" | "none",
  ) {
    setNotification({
      show: true,
      message,
      subtitle,
      type,
    });
    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        subtitle: "",
        type: "none",
      });
    }, 4000);
  }

  const hideNotification = () =>
    setNotification({ show: false, message: "", type: "success" });

  return { handlenoti, hideNotification , notification , setNotification };
}
