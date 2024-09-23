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
import Link from "next/link";
import Image from "next/image";
import userImage from "../../../public/user.svg";
import { AuthContext } from "../../contexts/AuthContext"; // Importa o AuthContext

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Header: React.FC = () => {
  const { user, signOut } = useContext(AuthContext); // Puxa o `user` e `signOut` do contexto de autenticação
  const [isAdministrator, setIsAdministrator] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAdministrator(user.nivelPermissao === "superusuario"); // Verifica se o usuário é administrador
    }
  }, [user]); // Atualiza quando o `user` muda

  const navigation = isAdministrator
    ? [
        { name: "DASHBOARD", href: "/adm/dashboard" },
        { name: "HOME", href: "/" },
        { name: "PUBLICAÇÕES", href: "/publicacoes" },
        { name: "NOTÍCIAS", href: "/noticias" },
        { name: "EOSOLAR", href: "/eosolar" },
        { name: "EOCEANO", href: "/eoceano" },
      ]
    : [
        { name: "HOME", href: "/" },
        { name: "PUBLICAÇÕES", href: "/publicacoes" },
        { name: "NOTÍCIAS", href: "/noticias" },
        { name: "EOSOLAR", href: "/eosolar" },
        { name: "EOCEANO", href: "/eoceano" },
      ];

  const profile = ["Meu Perfil", "Minhas Publicações", "Minhas Noticias"];

  const handleLogout = () => {
    signOut(); // Chama a função de logout
  };

  return (
    <Disclosure as="nav" className="bg-blue-ineof">
      {({ open }) => (
        <>
          <div className="w-full bg-blue-ineof">
            <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
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
                  <div className="hidden md:flex items-center justify-center md:justify-start">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <span
                          className={classNames(
                            item.name === "Dashboard" && isAdministrator
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-green-ineof hover:text-blue-ineof",
                            "px-3 py-2 rounded-md text-sm font-medium"
                          )}
                        >
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="hidden md:flex items-center space-x-6">
                  {user ? (
                    <>
                      <button className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                        <span className="sr-only">Visualizar Notificações</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
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
                        className="text-gray-300 hover:bg-green-ineof hover:text-blue-ineof px-3 py-2 rounded-md text-sm font-medium"
                      >
                        LOGIN
                      </Link>
                      <Link
                        href="/auth/register"
                        className="text-gray-300 hover:bg-green-ineof hover:text-blue-ineof px-3 py-2 rounded-md text-sm font-medium"
                      >
                        REGISTRO
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
            {/* Aqui, se o usuário estiver logado, renderiza o menu específico */}
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
