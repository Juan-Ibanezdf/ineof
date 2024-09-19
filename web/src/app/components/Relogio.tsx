"use client";  

import React, { useState, useEffect } from 'react';

const Relogio = () => {
  const [dataHora, setDataHora] = useState(new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => {
      setDataHora(new Date().toLocaleString());
    }, 1000); // Atualiza a cada segundo

    return () => clearInterval(timer); // Limpa o intervalo quando o componente é desmontado
  }, []);

  return (
    <p className="mt-4 text-sm text-gray-500">Data e Hora atual: <span className="font-normal">{dataHora}</span></p>
  );
};

export default Relogio;