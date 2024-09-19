"use client"; // Se necessário

import React from 'react';
import Header from '@/app/partials/Header';
import Footer from '@/app/partials/Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Fixo no topo */}
      <Header />

      {/* Conteúdo principal flexível */}
      <main className="flex-grow ">
        {children}
      </main>

      {/* Footer Fixo no rodapé */}
      <Footer />
    </div>
  );
};

export default Layout;
