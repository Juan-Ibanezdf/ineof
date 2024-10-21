"use client";

import React, { useState } from "react";
import Link from "next/link";
import Carousel from "../components/Carousel";
import logoEosolarEquatorial from "../../../public/logoEosolarEquatorial.svg";
import equipeEosolar from "../../../public/equipeEosolar.svg";
import mapaMaranhao from "../../../public/mapaMaranhao.svg";
import Layout from "../components/Layout";
import Image from "next/image";
import NossoTime from "../components/NossoTime";
import sodar from "../../../public/sodar.svg";
import PublicacoesPage from "../components/PublicacoesPage";
import logoUfma from "../../../public/ufma-logo.svg";
import logoIneof from "../../../public/INEOFLogo.svg";
import logoFiec from "../../../public/logoFiec.svg";
import logoEquatorial from "../../../public/logoEquatorial.svg";
import logoAneel from "../../../public/logoAnel.svg";
import logoGera from "../../../public/geraMaranhao.svg";
import logoAlbtech from "../../../public/logoAlbtech.svg";
import logoCamargo from "../../../public/logoCamargo.svg";
import logoIEE from "../../../public/logoIEE.svg";

const EOSOLARPage: React.FC = () => {
  // Estado para controlar a exibição das informações do equipamento
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );

  const handleShowDetails = (equipment: string) => {
    setSelectedEquipment(equipment);
  };

  const handleCloseDetails = () => {
    setSelectedEquipment(null);
  };

  const renderEquatorialSection = () => (
    <div className=" py-10 bg-gradient-to-r from-green-500 to-blue-600 text-white text-center rounded-lg shadow-lg">
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

  const renderQuemSomos = () => (
    <section className=" py-5 bg-blue-ineof text-center">
      <div className="container mx-auto px-20">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-6">
          {/* Texto */}
          <div className="md:w-1/3 text-left">
            <p className="text-2xl text-white">
              O{" "}
              <span className="font-bold text-green-ineof">
                Projeto EOSOLAR
              </span>{" "}
              é um projeto de P&D Aneel com foco no entendimento de alguns
              fenômenos micrometeorológicos relevantes para prospecção do
              potencial eólico e solar na região Equatorial.
            </p>
          </div>

          {/* Imagem */}
          <div className="md:w-1/3">
            <Image
              src={mapaMaranhao}
              alt="Quem Somos"
              width={400}
              height={300}
            />
          </div>

          {/* Vídeo do YouTube */}
          <div className="md:w-1/3">
            <iframe
              width="550"
              height="350"
              src="https://www.youtube.com/embed/TxaNRBOPkeQ"
              title="EoSolar"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );

  const renderEquipamentoDetails = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
        <h3 className="text-2xl font-bold mb-4">Informações do Equipamento</h3>
        <p className="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
          fringilla, nulla nec.
        </p>
        <h4 className="text-xl font-semibold mb-2">Objetivos</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <button
          className="mt-6 bg-blue-ineof text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
          onClick={handleCloseDetails}
        >
          Fechar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Layout>
        <main>
          <Carousel
            images={[equipeEosolar, equipeEosolar, equipeEosolar]}
            logoImage={logoEosolarEquatorial} // Imagem de logo opcional
            buttonText="Visite nossa plataforma interativa"
            buttonLink="https://eosolar.equatorialenergia.com.br/#"
          />

          {/* Seção "Quem Somos" */}
          {renderQuemSomos()}

          {/* Seção "Equipamentos" */}
          <section className="py-10 bg-white">
            <div className="container mx-auto">
              <div className="flex justify-between items-start">
                {/* Grid de Imagens (Cards dos Equipamentos) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full md:w-2/3">
                  <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg">
                    <Image
                      src={sodar}
                      alt="Estação Solarimétrica"
                      className="w-full h-auto rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        className="bg-white text-black px-3 py-1 rounded-lg"
                        onClick={() =>
                          handleShowDetails("Estação Solarimétrica")
                        }
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>

                  <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg">
                    <Image
                      src={sodar}
                      alt="Sistema de Apoio"
                      className="w-full h-auto rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        className="bg-white text-black px-3 py-1 rounded-lg"
                        onClick={() => handleShowDetails("Sistema de Apoio")}
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>

                  <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg">
                    <Image
                      src={sodar}
                      alt="LIDAR"
                      className="w-full h-auto rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        className="bg-white text-black px-3 py-1 rounded-lg"
                        onClick={() => handleShowDetails("LIDAR")}
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>

                  <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg">
                    <Image
                      src={sodar}
                      alt="SODAR"
                      className="w-full h-auto rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        className="bg-white text-black px-3 py-1 rounded-lg"
                        onClick={() => handleShowDetails("SODAR")}
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>

                  <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg row-span-2">
                    <Image
                      src={sodar}
                      alt="Torres Micrometeorológicas"
                      className="w-full h-auto rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        className="bg-white text-black px-3 py-1 rounded-lg"
                        onClick={() =>
                          handleShowDetails("Torres Micrometeorológicas")
                        }
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>
                </div>

                {/* Texto Explicativo */}
                <div className="w-full md:w-1/3 ml-6">
                  <h2 className="text-3xl font-bold mb-4">Equipamentos</h2>
                  <p className="text-lg mb-4">
                    Dentro da parte científica do projeto EOSOLAR há uma série
                    de campanhas de medições com torres micrometeorológicas
                    móveis, estação solarimétrica completa com rastreador solar
                    e medições da radiação difusa e direta, além de equipamentos
                    de sensoriamento remoto (SODAR e LIDAR).
                  </p>
                  <p className="text-lg">
                    As campanhas de medição têm objetivos científicos e buscam
                    compreender a Camada Limite Atmosférica na região costeira
                    do Maranhão.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Renderiza as informações do equipamento ao clicar no botão */}
          {selectedEquipment && renderEquipamentoDetails()}

          <NossoTime />
          {renderEquatorialSection()}

          <PublicacoesPage />

          <section className="py-10 bg-gray-100">
            <div className="container mx-auto text-center">
              <h2 className="text-4xl font-bold text-blue-ineof mb-8"></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="flex justify-center">
                  <Image src={logoUfma} alt="UFMA" width={150} height={150} />
                </div>
                <div className="flex justify-center">
                  <Image src={logoIneof} alt="INEOF" width={150} height={150} />
                </div>
                <div className="flex justify-center">
                  <Image src={logoFiec} alt="FIEC" width={150} height={150} />
                </div>
                <div className="flex justify-center">
                  <Image
                    src={logoEquatorial}
                    alt="Equatorial Energia"
                    width={150}
                    height={150}
                  />
                </div>
                <div className="flex justify-center">
                  <Image src={logoAneel} alt="ANEEL" width={150} height={150} />
                </div>
                <div className="flex justify-center">
                  <Image
                    src={logoGera}
                    alt="GERA Maranhão"
                    width={150}
                    height={150}
                  />
                </div>
                <div className="flex justify-center">
                  <Image
                    src={logoCamargo}
                    alt="Camargo Schubert"
                    width={150}
                    height={150}
                  />
                </div>
                <div className="flex justify-center">
                  <Image
                    src={logoAlbtech}
                    alt="Albtech"
                    width={150}
                    height={150}
                  />
                </div>
                <div className="flex justify-center">
                  <Image src={logoIEE} alt="IEE" width={150} height={150} />
                </div>
              </div>
            </div>
          </section>
          <section className="py-10 bg-[#F1F8FF] flex justify-end items-center">
            <div className="bg-gradient-to-r from-[#4E51D3] to-[#23C672] text-white rounded-lg flex justify-between items-center w-full max-w-7xl p-8">
              <div className="text-left">
                <h2 className="text-3xl font-bold">
                  Todos bancos de dados de nossas campanhas de medição estão
                  disponíveis gratuitamente
                </h2>
              </div>
              <div className="flex justify-center items-center">
                <a
                  href="#"
                  className="text-green-500 bg-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                >
                  Acesse aqui{" "}
                  <svg
                    className="inline-block w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
};

export default EOSOLARPage;
