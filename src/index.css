import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={isLoggedIn} userRole={user?.role} />
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-[#1a365d] text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm opacity-80">
            © 2026 Aman Sayyad
          </p>
        </div>
      </footer>
    </div>
  );
}