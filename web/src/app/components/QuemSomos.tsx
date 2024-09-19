"use client";
import React from 'react';
import Image from "next/image";
import Inct from "../../../public/inct_image.svg";
import IneofLogo from '../../../public/INEOFLogo.svg';
import backgroundImage from "../../../public/bg-1.svg";
import { FaExternalLinkAlt } from "react-icons/fa";

const QuemSomos = () => {
  return (
    <section
      className="w-full p-8 sm:p-12 md:p-16 lg:p-24 bg-no-repeat bg-center bg-cover"
      style={{ backgroundImage: `url(${backgroundImage.src})` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-7xl mx-auto">
        {/* Coluna 1 */}
        <div className="flex flex-col items-center text-center">
          <Image src={IneofLogo} alt="INEOF LOGO" className="w-2/4 lg:w-auto" />
          <p className="text-base sm:text-lg mt-4">
            O INCT é um Programa de Institutos Nacionais de Ciência e Tecnologia com o objetivo de: agregar,
            de forma articulada, os melhores grupos de pesquisa na fronteira da ciência e em áreas
            estratégicas para o desenvolvimento sustentável do país; impulsionar a pesquisa científica básica e
            fundamental competitiva internacionalmente; estimular o desenvolvimento de pesquisa
            científica e tecnológica de ponta associada a aplicações para promover a inovação e o espírito
            empreendedor.
          </p>
          <button className="flex items-center gap-2 mt-4 py-2 px-8 bg-green-ineof text-white rounded hover:bg-blue-600">
            Clique aqui e saiba mais
            <FaExternalLinkAlt />
          </button>
        </div>

        {/* Coluna 2 */}
        <div className="flex flex-col items-center text-center">
          <Image src={Inct} alt="INCT LOGO" className="w-3/4 lg:w-auto" />
          <p className="text-base sm:text-lg mt-4">
            O INEOF é uma iniciativa apoiada e co-financiada a nível federal pelo Conselho Nacional de
            Desenvolvimento Científico e Tecnológico (CNPq) e pela Coordenação de Aperfeiçoamento de
            Pessoal de Nível Superior (CAPES) e em nível estadual pela Fundação de Amparo à Pesquisa do
            Estado do Maranhão (FAPEMA), sob a coordenação do Professor Dr. Osvaldo Saavedra
            da Universidade Federal do Maranhão - UFMA.
          </p>
          <button className="flex items-center gap-2 mt-4 py-2 px-8 bg-green-ineof text-white rounded hover:bg-blue-600 mb-36">
            Clique aqui e saiba mais
            <FaExternalLinkAlt />
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuemSomos;
