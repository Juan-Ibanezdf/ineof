import Layout from "./components/Layout";

import NossoTime from './components/NossoTime';
import Noticias from './components/Noticias';
import PublicacoesPage from './components/PublicacoesPage';
import Eventos from './components/Eventos';
import Carousel from "./components/Carousel";
import QuemSomos from "./components/QuemSomos";
import Objetivo from "./components/Objetivo";
import Financiamento from "./components/Financiamento";


export default function Home() {

  
  return (
    <>
      <Layout>
        <main className="flex flex-col items-center justify-between">
         <Carousel />
         <QuemSomos/>
         <Objetivo/>
         <Noticias />
         <PublicacoesPage/>
         <Eventos /> 
         <NossoTime/>
         <Financiamento/>
        </main>
      </Layout>
    </>
  );
}
