"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Imagem1 from "../../../public/image1.svg";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import sodar from "../../../public/sodar.svg";
import boia from "../../../public/boia.svg";
import teste_turbina from "../../../public/teste_turbina.svg";

const Carousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const images = [sodar, boia, teste_turbina, Imagem1];

  const nextSlide = useCallback(() => {
    setCurrent((current) => (current === images.length - 1 ? 0 : current + 1));
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrent((current) => (current === 0 ? images.length - 1 : current - 1));
  }, [images.length]);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // Auto-play every 5 seconds
    return () => clearInterval(slideInterval); // Cleanup on unmount
  }, [nextSlide]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "504px" }}>
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute transition duration-500 ease-in-out ${
            index === current ? "left-0" : "-left-full"
          } w-full h-full flex items-center justify-center`}
        >
          <Image
            src={img}
            alt={`Slide ${index}`}
            fill
            style={{ objectFit: "cover" }} // Usando style para definir o objectFit
            priority // Adicionando priority para LCP
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
      ))}

      {/* Texto e linhas com responsividade */}
      <div className="absolute w-full top-1/2 -translate-y-1/2 px-6 sm:px-24 md:px-52 flex flex-col items-start">
        <div className="flex items-center space-x-4">
          <svg
            width="81"
            height="4"
            viewBox="0 0 81 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.99353 1.9436L80.492 2.44359"
              stroke="#EFF4F7"
              strokeWidth="2" // stroke-width convertido para strokeWidth
            />
          </svg>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
            Bem vindo
          </h1>
        </div>

        <div className="flex items-center mt-2 space-x-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            ao INEOF
          </h2>
          <svg
            width="120"
            height="5"
            viewBox="0 0 120 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-4"
          >
            <path
              d="M0.99353 1.9436L119.994 2.9436"
              stroke="#EFF4F7"
              strokeWidth="2" // stroke-width convertido para strokeWidth
            />
          </svg>
        </div>

        <p className="text-sm sm:text-base md:text-xl text-white mt-2">
          Juntos impulsionamos a ciência e a tecnologia
          <br /> para um futuro mais energético e sustentável.
        </p>
      </div>

      {/* Setas de navegação e botões de paginação */}
      <div className="absolute bottom-4 w-full text-center">
        <div className="inline-flex justify-center items-center space-x-2">
          <button onClick={prevSlide} className="text-white p-3">
            <FaArrowLeft size={24} />
          </button>
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`h-3 w-3 rounded-full ${
                idx === current ? "bg-white" : "bg-gray-400"
              }`}
              onClick={() => setCurrent(idx)}
            />
          ))}
          <button onClick={nextSlide} className="text-white p-3">
            <FaArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
