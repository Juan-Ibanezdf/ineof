"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";

const Events = () => {
  const events = [
    {
      title: "VI Workshop Energias Oceânicas e Fluviais",
      date: "04 e 05 setembro de 2024",
      location: "Hotel Centro de Convenções, Flamengo, Rio de Janeiro - RJ",
      description: "Contribuindo para a descarbonização da Economia",
      moreInfoLink: "#",
    },
    {
      title: "Webinário de Transição Energética",
      date: "20 de novembro de 2024",
      location: "Online - Zoom",
      description: "Discussão sobre desafios e oportunidades da transição energética",
      moreInfoLink: "#",
    },
    {
      title: "Seminário sobre Hidrogênio Verde",
      date: "10 de dezembro de 2024",
      location: "Centro de Convenções UFMA, São Luís - MA",
      description: "Explorando o potencial do hidrogênio verde na matriz energética",
      moreInfoLink: "#",
    },
  ];

  return (
    <div className="w-full p-10 bg-blue-ineof text-white py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        ACOMPANHE NOSSOS EVENTOS, WORKSHOPS E WEBNÁRIOS
      </h2>

      <div className="relative flex items-center justify-between mx-24">
        {events.length > 0 ? (
          <>
            <Swiper
              modules={[Navigation]}
              spaceBetween={10}
              slidesPerView={events.length} // Exibe todos os eventos se forem poucos
              loop={false} // Não ativa o loop
              navigation={false} // Remove as setas de navegação se não for necessário
              centeredSlides={false} // Não centraliza se houver menos eventos
              breakpoints={{
                640: { slidesPerView: 1.2 },
                768: { slidesPerView: 2.5 },
                1024: { slidesPerView: events.length }, // Define o número de slides de acordo com a quantidade de eventos
                1280: { slidesPerView: events.length },
              }}
            >
              {events.map((event, index) => (
                <SwiperSlide key={index}>
                  <div className="bg-white rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm mb-2">{event.date}</p>
                    <p className="text-sm mb-2">{event.location}</p>
                    <p className="text-xs mt-2 mb-4 text-gray-600">
                      {event.description}
                    </p>
                    <a
                      href={event.moreInfoLink}
                      className="inline-block bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600 text-sm"
                    >
                      Saiba mais
                    </a>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        ) : (
          <div className="bg-white rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg">
            <h3 className="text-lg font-semibold text-indigo-600 mb-4">
              Nenhum evento cadastrado
            </h3>
            <p className="text-sm mb-4">
              No momento, não temos eventos cadastrados. Por favor, volte mais tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
