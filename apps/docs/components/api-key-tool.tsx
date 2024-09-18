"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Copy, Loader2 } from "lucide-react"
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock"

const API_URL = "https://v2.api.noroff.dev"

type AuthResponse = {
  data: {
    name: string
    email: string
    avatar: {
      url: string
      alt: string
    }
    accessToken: string
  }
}

type ApiKeyResponse = {
  data: {
    name: string
    status: string
    key: string
  }
}

type ErrorResponse = {
  errors: Array<{
    code?: string
    message: string
    path?: string[]
  }>
  status: string
  statusCode: number
}

export function APIKeyTool() {
  const [activeTab, setActiveTab] = useState("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingApiKey, setIsGettingApiKey] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState(false)

  const handleAuth = async (endpoint: string, body: object) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    const data: AuthResponse | ErrorResponse = await response.json()

    if (!response.ok) {
      setAuthSuccess(false)
      const errorData = data as ErrorResponse
      throw new Error(
        errorData.errors[0]?.message || "An unexpected error occurred"
      )
    }

    setAuthSuccess(true)

    return data as AuthResponse
  }

  const generateApiKey = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/create-api-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name: "My Noroff API Key" })
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        console.error("API Key Generation Error:", errorData)
        throw new Error(
          errorData.errors[0]?.message ||
            `Failed to generate API key: ${response.status} ${response.statusText}`
        )
      }

      const data: ApiKeyResponse = await response.json()
      return data.data.key
    } catch (error) {
      console.error("API Key Generation Error:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setApiKey(null)

    try {
      let authData: AuthResponse

      if (activeTab === "register") {
        authData = await handleAuth("/auth/register", { name, email, password })
        authData = await handleAuth("/auth/login", { email, password })
      } else {
        authData = await handleAuth("/auth/login", { email, password })
      }

      setAccessToken(authData.data.accessToken)
      setIsLoading(false)
      setIsGettingApiKey(true)

      const key = await generateApiKey(authData.data.accessToken)
      setApiKey(key)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
      setIsLoading(false)
    } finally {
      setIsGettingApiKey(false)
    }
  }

  const resetForm = () => {
    setError(null)
    setApiKey(null)
    setAccessToken(null)
    setIsLoading(false)
    setIsGettingApiKey(false)
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardDescription className="text-center">
            Use this tool to login or register with the Noroff API and retrieve
            an API key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGettingApiKey ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !apiKey ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.name@stud.noroff.no"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Username</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="your_username"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.name@stud.noroff.no"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password (min 8 characters)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Register"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <CodeBlock
                  title="Your API Key:"
                  allowCopy
                  icon={<Copy size={16} />}
                >
                  <Pre>{apiKey}</Pre>
                </CodeBlock>
              </div>
              {accessToken && (
                <div className="space-y-2">
                  <CodeBlock
                    title="Example API options"
                    allowCopy
                    icon={<Copy size={16} />}
                  >
                    <Pre lang="javascript">
                      {`const options = {
  headers: {
    'Authorization': 'Bearer ${accessToken}',
    'X-Noroff-API-Key': '${apiKey}'
  }
};`}
                    </Pre>
                  </CodeBlock>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          {error && (
            <div className="flex items-center space-x-2 text-red-500">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}
          {error && authSuccess && !apiKey && (
            <Button className="w-full mt-4" onClick={resetForm}>
              Return to Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
