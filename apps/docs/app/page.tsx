import { LayoutIcon, LibraryIcon, StarIcon } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <main>
      <div className="absolute inset-x-0 top-0 h-[400px] w-full -translate-y-8 z-[-1]">
        <div className="h-full w-full mx-auto max-w-[1000px] bg-gradient-to-r from-purple-400 to-blue-400 [mask-image:radial-gradient(500px_100%_at_top_center,white,transparent)] animate-in fade-in duration-1000 opacity-50" />
      </div>
      <div className="container py-20 flex flex-col items-center text-center">
        <div className="bg-gradient-to-b from-blue-300 shadow-md shadow-purple-400/50 rounded-lg mb-6">
          <StarIcon className="m-px p-3 w-12 h-12 bg-secondary text-foreground rounded-[inherit]" />
        </div>
        <h1 className="text-2xl font-semibold mb-4 sm:text-4xl">Noroff API</h1>
        <p className="text-muted-foreground max-w-xl sm:text-lg">Noroff API documentation</p>
        <div className="mt-14 grid grid-cols-1 max-w-4xl gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 md:grid-cols-2">
          <Link href="/docs/v2" className="group relative overflow-hidden rounded-xl p-px z-[2] bg-border">
            <i className="absolute opacity-0 transition-opacity top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[130%] h-auto aspect-square z-[-1] group-hover:opacity-100">
              <div className="w-full h-full bg-[conic-gradient(var(--tw-gradient-stops))] from-purple-400 via-pink-400 animate-infinite-rotate" />
            </i>
            <div className="flex flex-col items-center bg-background rounded-xl h-full bg-gradient-to-t from-purple-400/20 p-6 sm:p-12">
              <div className="border p-3 bg-gradient-to-b from-purple-400/50 border-purple-500 shadow-xl shadow-purple-400/50 mb-6 rounded-xl">
                <LibraryIcon className="h-9 w-9 text-purple-400 dark:text-purple-200" />
              </div>
              <p className="mb-2 text-xl font-medium">API v2</p>
              <p className="text-muted-foreground">The newest version of the API. You should use this version.</p>
            </div>
          </Link>

          <Link href="/docs/v1" className="group relative overflow-hidden rounded-xl p-px z-[2] bg-border">
            <i className="absolute opacity-0 transition-opacity top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[130%] h-auto aspect-square z-[-1] group-hover:opacity-100">
              <div className="w-full h-full bg-[conic-gradient(var(--tw-gradient-stops))] from-purple-400 via-blue-400 animate-infinite-rotate" />
            </i>
            <div className="flex flex-col items-center bg-background rounded-xl h-full bg-gradient-to-t from-blue-400/20 p-6 sm:p-12">
              <div className="border p-3 bg-gradient-to-b from-blue-400/50 border-blue-500 shadow-xl shadow-blue-400/50 mb-6 rounded-xl">
                <LayoutIcon className="h-9 w-9 text-blue-400 dark:text-cyan-200" />
              </div>
              <p className="mb-2 text-xl font-medium">API v1</p>
              <p className="text-muted-foreground">
                The first version of the API. Unless you have a specific reason to use this version, you should use v2.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
