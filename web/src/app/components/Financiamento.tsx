"use client";
import React from "react";
import Image from "next/image";

import ufma from "../../../public/ufma-logo.svg";
import ufsc from "../../../public/ufsc-logo.svg";
import ufrj from "../../../public/ufrj-logo.svg";
import ufpa from "../../../public/ufpa-logo.svg";
import unifei from "../../../public/unifei-logo.svg";

import cnpq from "../../../public/cnpq-logo.svg";
import capes from "../../../public/capes-logo.svg";
import fapema from "../../../public/fapema-logo.svg";

import backgroundImage from "../../../public/bg-4.svg"

const instituicoes = [
  { src: ufma, alt: "UFMA" },
  { src: ufsc, alt: "UFSC" },
  { src: ufrj, alt: "UFRJ" },
  { src: ufpa, alt: "UFPA" },
  { src: unifei, alt: "UNIFEI" },
];
const financiamento = [
  { src: cnpq, alt: "CNPq" },
  { src: capes, alt: "CAPES" },
  { src: fapema, alt: "FAPEMA" },
];

const Financiamento = () => {
  return (
    <section
      className="w-full p-10 bg-no-repeat bg-center bg-cover pt-12 sm:pt-12 md:pt-16 lg:pt-20 xl:mt-26"
      style={{ backgroundImage: `url(${backgroundImage.src})` }}
    >
      <h2 className="text-4xl font-bold text-blue-ineof text-left mx-6 sm:mx-12 md:mx-24 mb-6">
        <span className="text-green-ineof">INSTITUIÇÕES ASSOCIADAS</span> <br />E FINANCIAMENTO
      </h2>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8">
          {instituicoes.map((instituicao) => (
            <div key={instituicao.alt} className="p-4">
              <Image
                src={instituicao.src}
                alt={instituicao.alt}
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-4 mb-12 sm:mb-20 lg:mb-28">
          {financiamento.map((financ) => (
            <div key={financ.alt} className="p-4">
              <Image
                src={financ.src}
                alt={financ.alt}
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Financiamento;
