import { useRouter } from "next/navigation"

export function useAuth() {
  const router = useRouter()

  const signUpWithCredentials = async ({ email, password }) => {
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Sign up failed")
      }

      if (result.success) {
        router.push("/")
      }

      return result
    } catch (err) {
      console.error("Signup error:", err)
      throw err
    }
  }

  const signInWithCredentials = async ({ email, password }) => {
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Login failed")
      }

      if (result.success) {
        router.push("/")
      }

      return result
    } catch (err) {
      console.error("Signin error:", err)
      throw err
    }
  }

  return { signUpWithCredentials, signInWithCredentials }
}
