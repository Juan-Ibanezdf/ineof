"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAPIClient } from "@/services/axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from "react-icons/fa";

interface Noticia {
  id_noticia: string;
  titulo: string;
  description?: string;
  categoria: string;
  data_publicacao: string;
  slug: string;
  identifier: string;
}

// Função para truncar o texto da descrição
const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

const News: React.FC = () => {
  const [newsItems, setNewsItems] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get("/api/noticias", {
          params: {
            itens_por_pagina: 8, // Buscar as 8 primeiras notícias
          },
        });
        const noticiasMapeadas = response.data.noticias.map((noticia: any) => ({
          id_noticia: noticia.id_noticia,
          titulo: noticia.titulo,
          description: noticia.lead || "Sem resumo disponível",
          categoria: noticia.categoria || "Categoria não informada",
          slug: noticia.slug,
          identifier: noticia.identifier,
        }));
        setNewsItems(noticiasMapeadas);
      } catch (error) {
        console.error("Erro ao obter as notícias", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  if (loading) {
    return <div>Carregando notícias...</div>;
  }

  return (
    <div className="w-full p-10 bg-white text-gray-800 py-12">
      {/* Título "Notícias" */}
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-ineof">Notícias</h2>

      <div className="relative flex items-center justify-between mx-24">
        {/* Swiper com cards */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={10}
          slidesPerView={5.5}
          loop={true}
          navigation={{
            nextEl: ".news-swiper-button-next",
            prevEl: ".news-swiper-button-prev",
          }}
          centeredSlides={true}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.5 },
            1280: { slidesPerView: 4.5 },
          }}
        >
          {newsItems.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="bg-indigo-50 rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">
                  {item.titulo}
                </h3>
                <p className="text-sm mb-4">
                  {truncateText(item.description || "", 50)}
                </p>
                <p className="text-sm text-gray-700 mb-4">{item.categoria}</p>
                <Link href={`/noticias/noticia/${item.identifier}/${item.slug}`}>
                  <span className="inline-block bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 text-sm flex items-center gap-1">
                    Ver detalhes <FaExternalLinkAlt />
                  </span>
                </Link>
              </div>
            </SwiperSlide>
          ))}

          <SwiperSlide>
            <div className="bg-indigo-50 rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg cursor-pointer">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">
                Ver mais notícias
              </h3>
              <button className="bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 text-sm flex items-center gap-1">
                Veja todas as Notícias <FaExternalLinkAlt />
              </button>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Setas de navegação com identificadores exclusivos */}
        <button className="news-swiper-button-prev absolute z-10 hover:text-blue-ineof text-blue-500 p-2 left-4">
          <FaChevronLeft size={30} />
        </button>
        <button className="news-swiper-button-next absolute z-10 hover:text-blue-ineof text-blue-500 p-2 right-4">
          <FaChevronRight size={30}/>
        </button>
      </div>
    </div>
  );
};

export default News;
