import type { Metadata, Viewport } from "next/types"
import { Nav } from "@/components/nav"
import { Inter } from "next/font/google"
import clsx from "clsx"
import "next-docs-ui/style.css"
import "./global.css"
import { base_url } from "@/utils/metadata"
import { Provider } from "./provider"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: "%s | Noroff API Documentation",
      default: "Noroff API Documentation"
    },
    description: "Noroff API Documentation",
    metadataBase: base_url
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ]
}

const inter = Inter({
  subsets: ["latin"]
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }} className={clsx(inter.className, "dark")} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>
          <Nav />
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  )
}

function Footer() {
  return (
    <footer className="bg-secondary/50 text-secondary-foreground mt-auto border-t py-6">
      <div className="container flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="flex flex-row items-center text-sm text-muted-foreground transition-colors">
          {new Date().getFullYear()} © Noroff.
        </p>
      </div>
    </footer>
  )
}
