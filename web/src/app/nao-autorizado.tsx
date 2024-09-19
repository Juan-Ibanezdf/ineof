import React from 'react';
import  Header  from './partials/Header';
import Link from 'next/link';

const naoAutorizado = () => {

    return (
        <>
            <Header />
            <span>Você não tem autorização para acessar aqui</span><br/>
            <Link href="/">Voltar ao Home</Link>
        </>
    );
};

export default naoAutorizado;