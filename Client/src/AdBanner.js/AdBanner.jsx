import { useEffect, useRef } from "react";

const AdBanner = () => {
  const adRef = useRef(null);

  useEffect(() => {
    if (window.atOptions) return; // Avoid redefinition if already present

    // Step 1: Define the ad options
    const script1 = document.createElement("script");
    script1.type = "text/javascript";
    script1.innerHTML = `
      atOptions = {
        'key' : 'b05eb8ed9f48d1877fafcc2f932a182f',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    adRef.current.appendChild(script1);

    // Step 2: Load the ad script
    const script2 = document.createElement("script");
    script2.type = "text/javascript";
    script2.src = "//www.highperformanceformat.com/b05eb8ed9f48d1877fafcc2f932a182f/invoke.js";
    script2.async = true;
    adRef.current.appendChild(script2);

    // Cleanup on unmount
    return () => {
      if (adRef.current) adRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={adRef}
      style={{ width: 468, height: 60, margin: "20px auto", textAlign: "center" }}
    />
  );
};

export default AdBanner;
