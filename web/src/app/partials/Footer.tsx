"use client";

import Image from "next/image";
import IneofLogo from "../../../public/INEOFLogoBranca.svg"; // Ajuste o caminho da imagem conforme necessário
import {
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaDiscord,
  FaArrowUp,
} from "react-icons/fa"; // Pacote react-icons para ícones
import { useCallback } from "react"; // Import useCallback from React
import React from "react";

const Footer = () => {
  // Função para rolar para o topo da página
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Efeito de rolagem suave
    });
  }, []);

  return (
    <footer className="max-w-full  bg-blue-ineof text-white py-10">
      <div className="container px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {/* Logo e Social */}
          <div className="flex flex-col items-start mb-6 sm:mb-0">
            <Image src={IneofLogo} alt="INEOF Logo" width={150} height={50} />
            <p className="mt-4">Conheça mais e junte-se a nós.</p>
            <div className="flex gap-1 mt-2">
              {[
                { href: "https://www.linkedin.com/in/ineof/?originalSubdomain=br", icon: <FaLinkedin /> },
                { href: "https://www.instagram.com/ineof_ufma/", icon: <FaInstagram /> },
                { href: "https://www.youtube.com/channel/UCRWk5ymsYkjHhXDToKdSAYA", icon: <FaYoutube /> },
                // { href: "#", icon: <FaDiscord /> },
              ].map((social, index) => (
                <a key={index} href={social.href} target="_blank" className="text-white hover:text-green-ineof transition-colors duration-300">
                  {React.cloneElement(social.icon, { className: "h-7 w-7" })}
                </a>
              ))}
            </div>
          </div>

          {/* Links and Quick Access */}
          <div className="flex flex-col sm:flex-row flex-grow justify-around">
            <div className="mx-2">
              <h4 className="font-bold text-white mb-2">Instituições Parceiras</h4>
              <ul className="text-slate-400 ">
                <li><a className="hover:text-green-ineof" href="https://portalpadrao.ufma.br/" target="_blank">UFMA</a></li>
                <li><a className="hover:text-green-ineof" href="https://ufsc.br/" target="_blank">UFSC</a></li>
                <li><a className="hover:text-green-ineof" href="https://ufpa.br/" target="_blank">UFPA</a></li>
                <li><a className="hover:text-green-ineof" href="https://ufrj.br/" target="_blank">UFRJ</a></li>
                <li><a className="hover:text-green-ineof" href="https://unifei.edu.br/" target="_blank">UNIFEI</a></li>
              </ul>
            </div>

            <div className="mr-2">
              <h4 className="font-bold text-white mb-2">Financiamento</h4>
              <ul className="text-slate-400">
                <li><a className="hover:text-green-ineof" href="https://www.gov.br/cnpq/pt-br" target="_blank">CNPq</a></li>
                <li><a className="hover:text-green-ineof" href="https://www.gov.br/capes/pt-br" target="_blank">CAPES</a></li>
                <li><a className="hover:text-green-ineof" href="https://www.fapema.br/" target="_blank">FAPEMA</a></li>
              </ul>
            </div>

            <div className="mr-2">
              <h4 className="font-bold text-white mb-2">Acesso Rápido</h4>
              <ul className="text-slate-400">
                <li><a className="hover:text-green-ineof" href="#">Notícias</a></li>
                <li><a className="hover:text-green-ineof" href="#">Publicações</a></li>
                <li><a className="hover:text-green-ineof" href="#">EOSOLAR</a></li>
                <li><a className="hover:text-green-ineof" href="#">EOCEANO</a></li>
                <li><a className="hover:text-green-ineof" href="#">Site Institucional</a></li>
              </ul>
            </div>
          </div>

          {/* Botão para rolar para o topo */}
          <div className="flex justify-end mt-auto sm:mt-auto">
            <button
              onClick={scrollToTop}
              className="text-white bg-green-ineof px-4 py-4 rounded hover:bg-green-600 transition duration-300"
            >
              <FaArrowUp />
            </button>
          </div>
        </div>

        {/* Direitos autorais */}
        <div className="mt-10 text-left text-sm text-white">
          © Todos os direitos reservados INEOF - IEE - UFMA {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
