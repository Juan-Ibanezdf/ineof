"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import img1 from "../../../public/user.svg";
import "swiper/css";
import "swiper/css/navigation";

const Team = () => {
  const teamMembers = [
    {
      name: "Juan Ibanez",
      role: "Engenheiro de Software",
      image: img1,
      moreInfoLink: "#",
    },
    {
      name: "Hellen Souza",
      role: "Engenheira de Produção",
      image: img1,
      moreInfoLink: "#",
    },
    {
      name: "Nerval de Jesus",
      role: "Engenheiro da Computação",
      image: img1,
      moreInfoLink: "#",
    },
    {
      name: "Isabelle Oliveira",
      role: "Graduanda em Eng. Elétrica",
      image: img1,
      moreInfoLink: "#",
    },
  ];

  return (
    <div className="w-full p-10 bg-white py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Nosso Time</h2>

      <div className="relative flex items-center justify-between mx-24">
        {teamMembers.length > 0 ? (
          <>
            <Swiper
              modules={[Navigation]}
              spaceBetween={10}
              slidesPerView={teamMembers.length < 3 ? teamMembers.length : 3.5}
              loop={teamMembers.length > 1}
              navigation={{
                nextEl: ".team-swiper-button-next", // Usando identificadores únicos
                prevEl: ".team-swiper-button-prev",
              }}
              centeredSlides={false}
              breakpoints={{
                640: { slidesPerView: 1.2 },
                768: { slidesPerView: 2.5 },
                1024: { slidesPerView: teamMembers.length < 3 ? teamMembers.length : 3.5 },
                1280: { slidesPerView: teamMembers.length < 3 ? teamMembers.length : 4.5 },
              }}
            >
              {teamMembers.map((member, index) => (
                <SwiperSlide key={index}>
                  <div className="bg-indigo-50 rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg">
                    <Image
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4"
                      width={96}
                      height={96}
                    />
                    <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-sm mb-2">{member.role}</p>
                    <a
                      href={member.moreInfoLink}
                      className="mt-2 inline-block bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600"
                    >
                      Saiba mais
                    </a>
                  </div>
                </SwiperSlide>
              ))}

              {/* Slide para exibir "Ver mais" */}
              {teamMembers.length >= 3 && (
                <SwiperSlide>
                  <div className="bg-indigo-50 rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg cursor-pointer">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4">
                      Ver mais membros
                    </h3>
                    <button className="bg-green-500 text-white py-2 px-3 rounded hover:bg-green-600">
                      Veja toda a equipe
                    </button>
                  </div>
                </SwiperSlide>
              )}
            </Swiper>

            {/* Setas de navegação com identificadores únicos */}
            {teamMembers.length > 1 && (
              <>
                <button className="team-swiper-button-prev absolute z-10 text-blue-600 hover:text-blue-ineof p-2 left-4">
                  <FaChevronLeft size={30} />
                </button>
                <button className="team-swiper-button-next absolute z-10 text-blue-600 hover:text-blue-ineof p-2 right-4">
                  <FaChevronRight size={30} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="bg-indigo-50 rounded-lg h-60 flex flex-col justify-center items-center p-4 text-black shadow-lg">
            <h3 className="text-lg font-semibold text-indigo-600 mb-4">
              Nenhum membro disponível
            </h3>
            <p className="text-sm mb-4">
              No momento, não temos membros cadastrados. Por favor, volte mais tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
