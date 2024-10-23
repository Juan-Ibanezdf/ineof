"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import useSWR from "swr";

// Definição da interface para o vídeo
interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

// Função para buscar vídeos do canal
const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  return data.items || [];
};

// Função para truncar o título se for maior que 30 caracteres
const truncateTitle = (title: string, maxLength: number) => {
  return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
};

// Componente de vídeos
const NossosVideos: React.FC = () => {
  const apiKey = "chave aqui";
  const channelId = "UCRWk5ymsYkjHhXDToKdSAYA"; // Substitua com o channelId correto

  const maxResults = 8;
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}`;

  // useSWR faz a requisição de forma otimizada e com cache
  const { data: videos, error } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false, // Evita revalidação ao voltar o foco para a página
    refreshInterval: 0, // Sem intervalo de atualização automática
  });

  if (error) return <div>Erro ao carregar vídeos</div>;
  if (!videos) return <div>Carregando vídeos...</div>;

  return (
    <div className="w-full p-10 bg-blue-ineof text-white py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        Vídeos Recentes
      </h2>

      <div className="relative flex items-center justify-between mx-24">
        {videos.length > 0 ? (
          <>
            <Swiper
              modules={[Navigation]}
              spaceBetween={10}
              slidesPerView={3.5}
              loop={true} // Loop ativo para voltar ao início após a última página
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              centeredSlides={false}
              breakpoints={{
                640: { slidesPerView: 1.2 },
                768: { slidesPerView: 2.5 },
                1024: { slidesPerView: 3.5 },
                1280: { slidesPerView: 4.5 },
              }}
            >
              {videos.map((video: Video, index: number) => (
                <SwiperSlide key={index}>
                  <div className="bg-white rounded-lg h-80 flex flex-col justify-between p-4 text-black shadow-lg">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                      {truncateTitle(video.snippet.title, 65)}
                    </h3>
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${video.id.videoId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={video.snippet.title}
                    ></iframe>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                      className="mt-auto inline-block bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Saiba mais
                    </a>
                  </div>
                </SwiperSlide>
              ))}

              {/* Card para "Visite nosso canal no YouTube" */}
              <SwiperSlide>
                <div className="bg-white rounded-lg h-80 flex flex-col justify-center items-center p-4 text-black shadow-lg cursor-pointer">
                  <h3 className="text-lg font-semibold text-indigo-600 mb-4">
                    Visite nosso canal completo no YouTube
                  </h3>
                  <a
                    href="https://www.youtube.com/@ineofufma6629"
                    className="inline-block bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver mais vídeos
                  </a>
                </div>
              </SwiperSlide>
            </Swiper>

            {/* Botões de navegação */}
            <button className="swiper-button-prev absolute z-10 text-blue-600 hover:text-blue-ineof p-2 left-4">
              <FaChevronLeft size={30} />
            </button>
            <button className="swiper-button-next absolute z-10 text-blue-600 hover:text-blue-ineof p-2 right-4">
              <FaChevronRight size={30} />
            </button>
          </>
        ) : (
          <div className="bg-white rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg">
            <h3 className="text-lg font-semibold text-indigo-600 mb-4">
              Nenhum vídeo encontrado
            </h3>
            <p className="text-sm mb-4">
              No momento, não há vídeos disponíveis. Por favor, volte mais
              tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NossosVideos;
