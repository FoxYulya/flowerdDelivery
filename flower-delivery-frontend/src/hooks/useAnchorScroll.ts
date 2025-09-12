import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useAnchorScroll = () => {
  const location = useLocation();

  useEffect(() => {
    const handleAnchorScroll = () => {
      const hash = window.location.hash;
      if (hash === "#shops-section") {
        setTimeout(() => {
          const shopsSection = document.getElementById("shops-section");
          if (shopsSection) {
            shopsSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 500);
      }
    };

    handleAnchorScroll();
    const handleHashChange = () => {
      handleAnchorScroll();
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [location.pathname]);
};
