"use client";

import { useEffect } from "react";

export function ChromeDevToolsHandler() {
  useEffect(() => {
    // Handle Chrome DevTools extensions
    if (typeof window !== "undefined") {
      const handleChromeDevTools = () => {
        // Remove any cz-shortcut-listen attributes
        const elements = document.querySelectorAll("[cz-shortcut-listen]");
        elements.forEach((el) => {
          el.removeAttribute("cz-shortcut-listen");
        });
      };

      // Run initially
      handleChromeDevTools();

      // Set up a MutationObserver to handle dynamically added elements
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "cz-shortcut-listen"
          ) {
            handleChromeDevTools();
          }
        });
      });

      // Start observing the document
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return null;
}
