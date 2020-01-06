import React from "react"

export default function RendrHeader() {
  const Menu = (
    <>
      <div className="text-sm lg:flex-grow">
        <a
          href="/"
          className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
        >
          home
        </a>
        <a
          href="/about"
          className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
        >
          About
        </a>
        <a
          href="/articles"
          className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white"
        >
          Blog
        </a>
      </div>
      <div>
        <a
          href="https://github.com/ekino/rendr"
          className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
        >
          github
        </a>
      </div>
    </>
  )

  const Title = (
    <div className="flex items-center flex-shrink-0 text-white mr-6">
      <span className="font-semibold text-xl tracking-tight">Rendr Demo</span>
    </div>
  )

  const Download = (
    <div className="block lg:hidden">
      <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
        <svg
          className="fill-current h-3 w-3"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </button>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block md:block">
        <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
          {Title}
          {Download}
          <div className="w-full hidden flex-grow lg:flex lg:items-center lg:w-auto">
            {Menu}
          </div>
        </nav>
      </div>

      <div className="sm:block md:hidden lg:hidden xl:hidden">
        <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
          {Title}
          {Download}
          <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
            {Menu}
          </div>
        </nav>
      </div>
    </>
  )
}
