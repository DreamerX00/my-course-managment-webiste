'use client';

import { useEffect } from 'react';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hide navbar for this page
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }

    // Cleanup function to show navbar when leaving this page
    return () => {
      if (navbar) {
        navbar.style.display = '';
      }
    };
  }, []);

  return <>{children}</>;
} 