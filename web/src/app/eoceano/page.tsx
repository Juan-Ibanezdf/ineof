"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { AuthContext } from "../../contexts/AuthContext";

// Interface para a estrutura dos dados
interface Equipamento {
  nome: string;
  tipo: string;
  descricao: string;
}

interface Campanha {
  titulo: string;
  data: string;
  descricao: string;
}

interface DadosColetados {
  tipo: string;
  descricao: string;
}

interface Trabalho {
  titulo: string;
  autores: string;
  ano: string;
}

const EOCEANOPage: React.FC = () => {
  const { user } = React.useContext(AuthContext); // Contexto de autenticação
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [dados, setDados] = useState<DadosColetados[]>([]);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);

  // Mock de dados (você pode substituir por uma chamada à API)
  useEffect(() => {
    setEquipamentos([
      {
        nome: "LIDAR",
        tipo: "Sensor de vento",
        descricao: "Utilizado para medir perfis de vento.",
      },
      {
        nome: "ADCP",
        tipo: "Perfilador de Correntes",
        descricao: "Medidor de correntes oceânicas.",
      },
      {
        nome: "Estação Meteorológica",
        tipo: "Climatologia",
        descricao: "Coleta dados climáticos locais.",
      },
    ]);

    setCampanhas([
      {
        titulo: "Campanha de Teste 2023",
        data: "Janeiro - Fevereiro 2023",
        descricao: "Coletou dados iniciais de correntes.",
      },
      {
        titulo: "Campanha de Monitoramento 2024",
        data: "Março - Maio 2024",
        descricao: "Dados completos de vento e corrente.",
      },
    ]);

    setDados([
      { tipo: "Perfis de Vento", descricao: "Dados capturados via LIDAR." },
      { tipo: "Correntes Oceânicas", descricao: "Dados coletados via ADCP." },
      {
        tipo: "Climatologia Local",
        descricao: "Dados coletados pela estação meteorológica.",
      },
    ]);

    setTrabalhos([
      {
        titulo: "Impacto das Correntes Oceânicas em Energias Renováveis",
        autores: "J. Silva, M. Souza",
        ano: "2022",
      },
      {
        titulo: "Estudo de Perfis de Vento na Costa Brasileira",
        autores: "A. Pereira, C. Santos",
        ano: "2023",
      },
    ]);
  }, []);

  const renderEquipamentos = () => (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Equipamentos</h2>
      <ul className="space-y-3">
        {equipamentos.map((equipamento, index) => (
          <li key={index} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{equipamento.nome}</h3>
            <p>{equipamento.tipo}</p>
            <p>{equipamento.descricao}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderCampanhas = () => (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4">Campanhas Realizadas</h2>
      <ul className="space-y-3">
        {campanhas.map((campanha, index) => (
          <li key={index} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{campanha.titulo}</h3>
            <p>{campanha.data}</p>
            <p>{campanha.descricao}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderDadosColetados = () => (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4">Tipos de Dados Coletados</h2>
      <ul className="space-y-3">
        {dados.map((dado, index) => (
          <li key={index} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{dado.tipo}</h3>
            <p>{dado.descricao}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderTrabalhos = () => (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4">Trabalhos Relacionados</h2>
      <ul className="space-y-3">
        {trabalhos.map((trabalho, index) => (
          <li key={index} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{trabalho.titulo}</h3>
            <p>Autores: {trabalho.autores}</p>
            <p>Ano: {trabalho.ano}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderDownloadButton = () =>
    user?.nivelPermissao === "user" || user?.nivelPermissao === "superadmin" ? (
      <div className="text-center mt-8">
        <Link href="/download-dados">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
            Baixar Dados Coletados
          </button>
        </Link>
      </div>
    ) : (
      <div className="text-center mt-8">
        <Link href="/download-dados">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
            Baixar Dados Coletados
          </button>
        </Link>
      </div>
    );

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center text-blue-ineof mb-8">
          Energia Oceânica - EOCEANO
        </h1>

        {renderEquipamentos()}
        {renderCampanhas()}
        {renderDadosColetados()}
        {renderTrabalhos()}
        {renderDownloadButton()}
      </div>
      <Footer />
    </>
  );
};

export default EOCEANOPage;
