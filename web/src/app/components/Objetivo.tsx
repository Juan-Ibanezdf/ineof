"use client";
import React from "react";
import Image from "next/image";
import img1 from "../../../public/objetivo_imagem1.svg";
import img2 from "../../../public/objetivo_imagem2.svg";
import img3 from "../../../public/objetivo_imagem3.svg";
import img4 from "../../../public/objetivo_imagem4.svg";

const Obejtivo = () => {
  return (
    <div className="bg-blue-ineof text-white py-8">
      <div className="max-w-full mx-auto px-10 grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
        {/* Coluna 1 (1/3) */}
        <div className="md:col-span-1 flex flex-col items-center md:items-end text-center md:text-right pt-8 md:pt-16">
          <svg
            width="200"
            height="5"
            viewBox="0 0 200 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-4"
          >
            <path d="M0.25 2.15942L200 3.15942" stroke="white" strokeWidth="3" />
          </svg>
          <div className="md:text-right text-center">
            <h2 className="text-2xl uppercase">
              Nossos <br />
              <span className="text-green-ineof font-black">Objetivos</span>
              <br /> E <br />
              <span className="text-green-ineof font-black">
                Linhas De
                <br /> Pesquisa
              </span>
            </h2>
          </div>
          <svg
            width="200"
            height="5"
            viewBox="0 0 200 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mt-4"
          >
            <path d="M0.25 2.15942L200 3.15942" stroke="white" strokeWidth="3" />
          </svg>
        </div>
        {/* Coluna 2 (2/3) */}
        <div className="md:col-span-2 text-center px-4 pr-24">
          <p className="text-lg mb-4">
            Trabalhamos para atender as demandas de geração de energia renovável
            no Brasil, com foco em fontes oceânicas e fluviais.
          </p>
          <p className="text-lg mb-8">
            Nosso objetivo é criar uma rede de cooperação que possibilite a
            inovação técnica e científica, além de promover a formação de novos
            pesquisadores.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* Ícones com descrições */}
            <div className="flex flex-col items-center">
              <Image src={img1} alt={"Imagem 1"} width={80} height={80} priority/>
              <p className="text-sm text-center mt-4">
                Prospecção energética e de impactos ambientais da exploração da
                energia das ondas.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image src={img2} alt={"Imagem 2"} width={80} height={80} priority/>
              <p className="text-sm text-center mt-4">
                Alternativas para telas fotovoltaicas de baixo custo.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image src={img3} alt={"Imagem 3"} width={80} height={80} priority />
              <p className="text-sm text-center mt-4">
                Desenvolvimento de turbinas de baixas quedas e correntes.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image src={img4} alt={"Imagem 4"} width={80} height={80} priority/>
              <p className="text-sm text-center mt-4">Modelagem hidrodinâmica.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Obejtivo;
