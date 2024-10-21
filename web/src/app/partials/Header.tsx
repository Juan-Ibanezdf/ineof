"use client";
import React, { Fragment, useContext, useEffect, useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { BellIcon, XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import IneofLogo from "../../../public/INEOFLogoBranca.svg";
import LogoEosolar from "../../../public/logoEosolar.svg"; // Adicionando o logo EOSOLAR
import LogoEoceano from "../../../public/logoEoceano.svg"; // Adicionando o logo EOCEANO
import Link from "next/link";
import Image from "next/image";
import userImage from "../../../public/user.svg";
import { AuthContext } from "../../contexts/AuthContext";
import { FaArrowRight } from "react-icons/fa";
import { getAPIClient } from "@/services/axios";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Header: React.FC = () => {
  const { user, signOut, loading } = useContext(AuthContext);
  const [isAdministrator, setIsAdministrator] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      setIsAdministrator(user.nivelPermissao === "superusuario");

      // Função para buscar as notificações não lidas
      const fetchUnreadNotifications = async () => {
        try {
          const api = getAPIClient();
          const response = await api.get("/api/notificacoes");
          const unreadNotifications = response.data.filter(
            (notificacao: any) => !notificacao.lida
          );
          setUnreadCount(unreadNotifications.length);
        } catch (error) {
          console.error("Erro ao buscar notificações:", error);
          setUnreadCount(0);
        }
      };

      fetchUnreadNotifications();
    }
  }, [user]);

  const navigation = isAdministrator
    ? [
        { name: "DASHBOARD", href: "/adm/dashboard" },
        { name: "HOME", href: "/" },
        { name: "PUBLICAÇÕES", href: "/publicacoes" },
        { name: "NOTÍCIAS", href: "/noticias" },
      ]
    : [
        { name: "HOME", href: "/" },
        { name: "PUBLICAÇÕES", href: "/publicacoes" },
        { name: "NOTÍCIAS", href: "/noticias" },
      ];

  const profile = [
    "Meu Perfil",
    "Minhas Publicações",
    "Minhas Notícias",
    "Favoritos",
  ];

  const handleLogout = () => {
    signOut();
  };

  if (loading) {
    return null;
  }
  

  return (
    <Disclosure as="nav" className="bg-blue-ineof">
      {({ open }) => (
        <>
          <div className="w-full bg-blue-ineof">
            <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <Link href="/">
                    <span>
                      <Image
                        className="h-40 w-40"
                        src={IneofLogo}
                        alt="Logo INEOF"
                        width={50}
                        height={50}
                        priority
                      />
                    </span>
                  </Link>
                </div>

                {/* Navigation Items */}
                <div className="hidden md:flex items-center space-x-6">
                  {navigation.slice(0, 4).map((item) => (
                    <Link key={item.name} href={item.href}>
                      <span
                        className={classNames(
                          "text-gray-300 hover:bg-green-ineof hover:text-blue-ineof",
                          "px-3 py-2 rounded-md text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </span>
                    </Link>
                  ))}

                  {/* Adicionando Logos e separador */}
                  <div className="flex items-center space-x-2">
                    <Link href="/eosolar">
                      <div className="flex gap-1 items-center text-white hover:bg-green-ineof hover:text-blue-ineof hover:rounded-md">
                        <Image
                          className="h-8 w-8 "
                          src={LogoEosolar}
                          alt="Logo EOSOLAR"
                          width={32}
                          height={32}
                          priority
                        />{" "}
                        <span className="mr-2">EOSOLAR</span>
                      </div>
                    </Link>
                    <span className="text-gray-300">|</span>

                    <Link href="/eoceano">
                      <div className="flex  gap-1 items-center text-white hover:bg-green-ineof hover:text-blue-ineof hover:rounded-md">
                        <Image
                          className="h-8 w-8"
                          src={LogoEoceano}
                          alt="Logo EOCEANO"
                          width={32}
                          height={32}
                          priority
                        />{" "}
                        <span className="mr-2">EOCEANO</span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* User profile or Login/Register */}
                <div className="hidden md:flex items-center space-x-6">
                  {user ? (
                    <>
                   
                   <button className="relative bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                        <Link href="/notificacoes">
                          <span className="flex items-center">
                            <span className="sr-only">Visualizar Notificações</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                            {unreadCount > 0 && (
                              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </span>
                        </Link>
                      </button>
                      <Menu as="div" className="relative">
                        <MenuButton className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                          <span className="sr-only">Abrir Menu de Usuário</span>
                          <Image
                            className="h-8 w-8 rounded-full"
                            src={user?.perfilImagem || userImage}
                            alt="User"
                            width={32}
                            height={32}
                            priority
                          />
                        </MenuButton>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <MenuItems
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                            style={{ zIndex: 1000 }}
                          >
                            {profile.map((item) => (
                              <MenuItem key={item}>
                                <Link
                                  href={
                                    item === "Meu Perfil"
                                      ? `/perfil/profile/${user?.idUsuario}`
                                      : item === "Minhas Publicações"
                                      ? `/perfil/publicacoes/minhas-publicacoes`
                                      : item === "Minhas Notícias"
                                      ? `/perfil/noticias/minhas-noticias`
                                      : item === "Favoritos"
                                      ? `/perfil/favoritos`
                                      : "#"
                                  }
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-ineof hover:text-blue-ineof hover:rounded-md"
                                >
                                  {item}
                                </Link>
                              </MenuItem>
                            ))}

                            <MenuItem>
                              <Link
                                href="/configurations"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-ineof hover:text-blue-ineof hover:rounded-md"
                              >
                                Configurações
                              </Link>
                            </MenuItem>
                            <MenuItem>
                              <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-ineof hover:text-blue-ineof hover:rounded-md"
                              >
                                Sair
                              </button>
                            </MenuItem>
                          </MenuItems>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <div className="flex items-baseline space-x-4">
                      <Link
                        href="/auth/login"
                        className="flex gap-1 items-center text-gray-300 hover:bg-green-ineof hover:text-blue-ineof px-3 py-2 rounded-md text-sm font-medium border border-white"
                      >
                        LOGIN <FaArrowRight />
                      </Link>

                      <Link
                        href="/auth/register"
                        className="flex gap-1 items-center text-gray-300 hover:bg-green-ineof hover:text-blue-ineof px-3 py-2 rounded-md text-sm font-medium border border-white"
                      >
                        REGISTRO <FaArrowRight />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Menu mobile */}
                <div className="-mr-2 flex md:hidden">
                  <DisclosureButton className="bg-green-ineof inline-flex items-center justify-center p-2 rounded-md hover:rounded-md text-blue-ineof hover:text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">Abrir Menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
              </div>
            </div>
          </div>

          <DisclosurePanel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.name === "Dashboard" && isAdministrator
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block px-3 py-2 rounded-md text-base font-medium"
                  )}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
            {user ? (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={user?.perfilImagem || userImage}
                      alt="User"
                      width={50}
                      height={50}
                      priority
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {user?.nomeDeUsuario}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  <button className="ml-auto bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">Visualizar Notificações</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {profile.map((item) => (
                    <DisclosureButton
                      key={item}
                      as="a"
                      href={
                        item === "Meu Perfil"
                          ? `/perfil/profile/${user?.idUsuario}`
                          : item === "Minhas Publicações"
                          ? `/perfil/publicacoes/minhas-publicacoes`
                          : item === "Minhas Notícias"
                          ? `/perfil/noticia/minhas-noticias`
                          : item === "Favoritos"
                          ? `/perfil/favoritos`
                          : "#"
                      }
                      className="block px-4 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"
                    >
                      {item}
                    </DisclosureButton>
                  ))}
                  <DisclosureButton
                    as="a"
                    href="/configurations"
                    className="block px-4 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"
                  >
                    Configurações
                  </DisclosureButton>
                  <DisclosureButton
                    as="a"
                    href="#"
                    onClick={handleLogout}
                    className="block px-4 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"
                  >
                    Sair
                  </DisclosureButton>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="px-2 space-y-1">
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-4 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"
                  >
                    Registro
                  </Link>
                </div>
              </div>
            )}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

export default Header;
