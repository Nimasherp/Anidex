import { useState, useEffect } from "react"

export function useUser() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/user')
      if (res.ok) {
        const json = await res.json()
        setData(json.user)
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  return { data, loading }
}