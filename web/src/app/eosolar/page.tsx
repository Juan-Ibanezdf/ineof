"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

const EOSOLARPage: React.FC = () => {
  const { user } = React.useContext(AuthContext); // Contexto de autenticação
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [dados, setDados] = useState<DadosColetados[]>([]);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);

  // Mock de dados (substituir por uma chamada à API se necessário)
  useEffect(() => {
    setEquipamentos([
      {
        nome: "Sensor Solarimétrico",
        tipo: "Medição Solar",
        descricao: "Coleta dados de radiação solar e temperatura ambiente.",
      },
      {
        nome: "Estação Meteorológica",
        tipo: "Climatologia",
        descricao: "Monitoramento climático para suportar análises solares.",
      },
    ]);

    setCampanhas([
      {
        titulo: "Monitoramento Solar 2022",
        data: "Janeiro - Dezembro 2022",
        descricao:
          "Coleta contínua de dados de radiação solar em parceria com a Equatorial Energia.",
      },
      {
        titulo: "Campanha de Teste 2023",
        data: "Janeiro - Maio 2023",
        descricao: "Dados experimentais para otimização de painéis solares.",
      },
    ]);

    setDados([
      { tipo: "Radiação Solar", descricao: "Captura de intensidade solar." },
      {
        tipo: "Temperatura Ambiente",
        descricao: "Medição da temperatura em diferentes períodos.",
      },
      {
        tipo: "Climatologia Local",
        descricao: "Monitoramento de ventos, umidade e outros fatores.",
      },
    ]);

    setTrabalhos([
      {
        titulo: "Análise de Eficiência Solar no Maranhão",
        autores: "F. Souza, P. Oliveira",
        ano: "2021",
      },
      {
        titulo: "Impacto Climático na Eficiência de Painéis Solares",
        autores: "G. Costa, A. Lima",
        ano: "2022",
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
    user?.nivelPermissao === "admin" || user?.nivelPermissao === "superadmin" ? (
      <div className="text-center mt-8">
        <Link href="/download-dados">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
            Baixar Dados Coletados
          </button>
        </Link>
      </div>
    ) : <div className="text-center mt-8">
    <Link href="/download-dados">
      <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
        Baixar Dados Coletados
      </button>
    </Link>
  </div>;

  const renderEquatorialSection = () => (
    <div className="mt-16 py-10 bg-gradient-to-r from-green-500 to-blue-600 text-white text-center rounded-lg shadow-lg">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-6">
          Projeto em Parceria com a Equatorial Energia
        </h2>
        <p className="text-lg mb-8">
          Conheça mais sobre o projeto EOSOLAR, desenvolvido em parceria com a
          Equatorial Energia do Maranhão. O projeto visa aprimorar as
          tecnologias de energias renováveis com foco em energia solar e suas
          aplicações na região.
        </p>
        <Link href="https://eosolar.equatorialenergia.com.br/" target="_blank">
          <button className="bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-300">
            Visite o site do EOSOLAR
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center text-blue-ineof mb-8">
          Energia Solar - EOSOLAR
        </h1>

        {renderEquipamentos()}
        {renderCampanhas()}
        {renderDadosColetados()}
        {renderTrabalhos()}
        {renderEquatorialSection()}
        {renderDownloadButton()}
      </div>
      <Footer />
    </>
  );
};

export default EOSOLARPage;
