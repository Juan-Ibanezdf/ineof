import Layout from "./components/Layout";

import NossoTime from "./components/NossoTime";
import Noticias from "./components/Noticias";
import PublicacoesPage from "./components/PublicacoesPage";
import Eventos from "./components/Eventos";
import Carousel from "./components/Carousel";
import QuemSomos from "./components/QuemSomos";
import Objetivo from "./components/Objetivo";
import Financiamento from "./components/Financiamento";
import sodar from "../../public/sodar.svg";
import boia from "../../public/boia.svg";
import teste_turbina from "../../public/teste_turbina.svg";
import Imagem1 from "../../public/image1.svg";

export default function Home() {
  return (
    <>
      <Layout>
        <main className="flex flex-col items-center justify-between">
          <Carousel
            images={[sodar, boia, teste_turbina, Imagem1]}
            title="Bem vindo ao INEOF"
            subtitle="Juntos impulsionamos a ciência  e a tecnologia para um futuro mais energético e sustentável."
          />

          <QuemSomos />
          <Objetivo />
          <Noticias />
          <PublicacoesPage />
          <Eventos />
          <NossoTime />
          <Financiamento />
        </main>
      </Layout>
    </>
  );
}
