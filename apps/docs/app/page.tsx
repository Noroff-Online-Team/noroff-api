import { Tally1Icon, Tally2Icon, RocketIcon } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <main>
      <div className="absolute inset-x-0 top-0 h-[400px] w-full -translate-y-8 z-[-1]">
        <div className="h-full w-full mx-auto max-w-[1000px] bg-gradient-to-r from-purple-400/50 to-blue-400/50 [mask-image:radial-gradient(500px_80%_at_top_center,white,transparent)] animate-in fade-in duration-1000 opacity-50" />
      </div>
      <div className="container py-20 flex flex-col items-center text-center">
        <div className="bg-gradient-to-b from-blue-300 shadow-md shadow-purple-400/50 rounded-lg mb-6 animate-star">
          <RocketIcon className="m-px p-3 w-12 h-12 bg-background text-foreground rounded-[inherit]" />
        </div>
        <h1 className="text-2xl font-bold mb-6 sm:text-5xl">Noroff API</h1>
        <p className="text-muted-foreground max-w-xl sm:text-lg">Noroff API documentation</p>
        <div className="mt-14 grid grid-cols-1 max-w-4xl gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 md:grid-cols-2">
          <Link href="/docs/v2" className="group relative overflow-hidden rounded-xl p-px z-[2]">
            <i className="absolute inset-0 opacity-0 transition-opacity z-[-1] animated-border group-hover:opacity-100" />
            <div className="absolute inset-px bg-background bg-gradient-radial from-blue-400/20 to-blue-400/0 rounded-[inherit] z-[-1]" />
            <div className="flex flex-col items-center rounded-[inherit] h-full p-6 border sm:p-12">
              <div className="border p-3 bg-gradient-to-b from-blue-400/30 border-blue-500/50 shadow-xl shadow-background/50 mb-6 rounded-xl">
                <Tally2Icon className="h-9 w-9 text-blue-400 dark:text-cyan-200" />
              </div>
              <p className="mb-2 text-xl font-medium">API v2</p>
              <p className="text-muted-foreground">The newest version of the API. You should use this version.</p>
            </div>
          </Link>

          <Link href="/docs/v1" className="group relative overflow-hidden p-px rounded-xl z-[2]">
            <i className="absolute inset-0 opacity-0 transition-opacity z-[-1] animated-border group-hover:opacity-100" />
            <div className="absolute inset-px bg-background bg-gradient-radial rounded-[inherit] from-purple-400/20 to-purple-400/0 z-[-1]" />
            <div className="flex flex-col items-center rounded-[inherit] h-full z-[2] p-6 border sm:p-12">
              <div className="border p-3 bg-gradient-to-b from-purple-400/10 border-foreground/20 shadow-xl shadow-background/50 mb-6 rounded-xl">
                <Tally1Icon className="h-9 w-9 text-purple-400 dark:text-purple-200" />
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
