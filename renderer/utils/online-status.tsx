import React, { useState, useEffect } from "react";

const OnlineStatus = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(false);

  const updateOnlineStatus = () => {
    setIsOnline(navigator.onLine);
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return isOnline ? <div>{children}</div> : <div>Offline</div>;
};

export default OnlineStatus;
