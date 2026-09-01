import { useEffect } from "react";

import {
  useLocation,
  useNavigationType,
} from "react-router-dom";

function ScrollManager() {
  const location = useLocation();
  const navigationType =
    useNavigationType();

  useEffect(() => {
    const storageKey =
      `scroll-position-${location.key}`;

    // ==========================================
    // Browser Back / Forward
    // ==========================================
    if (navigationType === "POP") {
      const savedPosition =
        sessionStorage.getItem(
          storageKey
        );

      if (savedPosition !== null) {
        const scrollPosition =
          Number(savedPosition);

        const restorePosition = () => {
          window.scrollTo({
            top: scrollPosition,
            left: 0,
            behavior: "instant",
          });
        };

        // Restore multiple times because
        // page data/images may load asynchronously
        requestAnimationFrame(
          restorePosition
        );

        const timer1 = setTimeout(
          restorePosition,
          100
        );

        const timer2 = setTimeout(
          restorePosition,
          300
        );

        const timer3 = setTimeout(
          restorePosition,
          700
        );

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);

          sessionStorage.setItem(
            storageKey,
            String(window.scrollY)
          );
        };
      }
    }

    // ==========================================
    // New Route Navigation
    // ==========================================
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    return () => {
      sessionStorage.setItem(
        storageKey,
        String(window.scrollY)
      );
    };
  }, [
    location.key,
    navigationType,
  ]);

  return null;
}

export default ScrollManager;