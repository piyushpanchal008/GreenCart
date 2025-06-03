import { useEffect } from "react";

const AdBanner = () => {
  useEffect(() => {
    const atOptions = {
      key: 'b05eb8ed9f48d1877fafcc2f932a182f',
      format: 'iframe',
      height: 60,
      width: 468,
      params: {}
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//www.highperformanceformat.com/b05eb8ed9f48d1877fafcc2f932a182f/invoke.js';
    script.async = true;

    const container = document.getElementById('ad-container');
    if (container) {
      container.innerHTML = ""; // Clear if re-mounted
      container.appendChild(script);
    }

    return () => {
      // Cleanup on unmount
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div id="ad-container" style={{ width: 468, height: 60, overflow: 'hidden' }} />
  );
};

export default AdBanner;
