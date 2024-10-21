"use client";
import React, { useState, useEffect, useCallback, ReactNode } from "react";
import Image, { StaticImageData } from "next/image";
import { FaArrowLeft, FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link"; // Para o botão com link

interface CarouselProps {
  images: StaticImageData[]; // Array de imagens para o carrossel
  title?: string; // Texto do título opcional
  subtitle?: string; // Texto do subtítulo opcional
  logoImage?: StaticImageData; // Logo opcional
  buttonText?: string; // Texto do botão
  buttonLink?: string; // Link do botão
  children?: ReactNode; // Qualquer outro conteúdo que será exibido
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  title,
  subtitle,
  logoImage,
  buttonText,
  buttonLink,
  children,
}) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((current) => (current === images.length - 1 ? 0 : current + 1));
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrent((current) => (current === 0 ? images.length - 1 : current - 1));
  }, [images.length]);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // Auto-play a cada 5 segundos
    return () => clearInterval(slideInterval); // Cleanup on unmount
  }, [nextSlide]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "504px" }}
    >
      {/* Renderiza as imagens do carrossel */}
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
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
      ))}

      {/* Conteúdo dinâmico */}
      {children ? (
        <div className="absolute w-full top-1/2 -translate-y-1/2 px-6 sm:px-24 md:px-52 flex flex-col items-start">
          {children}
        </div>
      ) : (
        <div className="absolute w-full top-1/2 -translate-y-1/2 px-6 sm:px-24 md:px-52 flex flex-col items-start">
          {/* Renderização condicional do logo */}
          {logoImage && (
            <div className="flex items-center space-x-4">
              <Image src={logoImage} alt="Logo" width={300} height={300} />{" "}
              {/* Aumenta o tamanho para 300x300 */}
            </div>
          )}

          {/* Renderização condicional do título */}
          {title && (
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                {title}
              </h1>
            </div>
          )}

          {/* Renderização condicional do subtítulo */}
          {subtitle && (
            <div className="mt-2 max-w-lg">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-white break-words">
                {subtitle}
              </h2>
            </div>
          )}

          {/* Renderização condicional do botão */}
          {buttonText && buttonLink && (
            <div className="mt-4">
              <Link href={buttonLink} target="__blank">
                <span className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2">
                  {buttonText} <FaExternalLinkAlt />
                </span>
              </Link>
            </div>
          )}
        </div>
      )}

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
