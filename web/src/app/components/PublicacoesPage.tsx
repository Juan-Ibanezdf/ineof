"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAPIClient } from "@/services/axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from "react-icons/fa";

interface Publicacao {
  idPublicacao: string;
  titulo: string;
  resumo: string;
  categoria: string;
  autores: string[];
  slug: string;
  identifier: string;
  palavrasChave: string[]; // Novamente incluindo as palavras-chave
}

// Função para truncar o texto
const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

interface PublicacoesPageProps {
  keyword?: string; // Prop opcional para filtrar as publicações
}

const PublicacoesPage: React.FC<PublicacoesPageProps> = ({ keyword }) => {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicacoes = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get("/api/publicacoes");
        const publicacoesMapeadas = response.data.publicacoes
          .filter((publicacao: any) =>
            keyword ? publicacao.palavrasChave.includes(keyword) : true
          ) // Filtrar publicações por palavra-chave, se fornecida
          .slice(0, 8)
          .map((publicacao: any) => ({
            idPublicacao: publicacao.id_publicacao,
            titulo: publicacao.titulo,
            resumo: publicacao.resumo,
            categoria: publicacao.categoria,
            autores: publicacao.autores,
            slug: publicacao.slug,
            identifier: publicacao.identifier,
            palavrasChave: publicacao.palavrasChave || [], // Adicionando a lista de palavras-chave
          }));
        setPublicacoes(publicacoesMapeadas);
      } catch (error) {
        console.error("Erro ao obter as publicações", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicacoes();
  }, [keyword]); // Atualiza sempre que a palavra-chave mudar

  if (loading) {
    return <div>Carregando publicações...</div>;
  }

  return (
    <div className="w-full p-10 bg-blue-ineof text-white py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Publicações</h2>

      <div className="relative flex items-center justify-between mx-24">
        <Swiper
          modules={[Navigation]}
          spaceBetween={10}
          slidesPerView={5.5}
          loop={true}
          navigation={{
            nextEl: ".publicacoes-swiper-button-next",
            prevEl: ".publicacoes-swiper-button-prev",
          }}
          centeredSlides={true}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.5 },
            1280: { slidesPerView: 4.5 },
          }}
        >
          {publicacoes.map((pub, index) => (
            <SwiperSlide key={index}>
              <div className="bg-indigo-50 rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg">
                <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                  {pub.titulo}
                </h3>
                <p className="text-sm mb-4">{pub.autores.join(", ")}</p>
                <p className="text-sm text-gray-700">{pub.categoria}</p>
                <p className="text-xs mt-2 mb-4 text-gray-600">
                  {truncateText(pub.resumo, 30)}
                </p>
                <Link href={`/publicacoes/publicacao/${pub.identifier}/${pub.slug}`}>
                  <span className="inline-block bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 text-sm flex items-center gap-1">
                    Ver detalhes <FaExternalLinkAlt />
                  </span>
                </Link>
              </div>
            </SwiperSlide>
          ))}

          <SwiperSlide>
            <div className="bg-indigo-50 rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg cursor-pointer">
              <h3 className="text-lg font-semibold text-indigo-600 mb-4">
                Ver mais publicações
              </h3>
              <Link href="/publicacoes">
                <button className="bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 text-sm flex items-center gap-1">
                  Veja todas as Publicações <FaExternalLinkAlt />
                </button>
              </Link>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Setas de navegação com identificadores exclusivos */}
        <button className="publicacoes-swiper-button-prev absolute z-10 text-blue-600 hover:text-blue-ineof  p-2  left-4">
          <FaChevronLeft size={30} />
        </button>
        <button className="publicacoes-swiper-button-next absolute z-10 text-blue-600  hover:text-blue-ineof  p-2  right-4">
          <FaChevronRight size={30} />
        </button>
      </div>
    </div>
  );
};

export default PublicacoesPage;
