
import { useState, useCallback } from 'react' 




export function useUpload(){
  const [loading, setLoading] = useState(false) 
  const upload = useCallback(async (file) => {
    setLoading(true)  
  
    const formData = new FormData()  
    formData.append("file", file.file) // file is an object
  
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })  
  
    if (!response.ok) {
      throw new Error("Upload failed")  
    }
  
    const data = await response.json()  
  
    setLoading(false)  
  
    return { url: data.url, mimeType: data.mimeType }  
  },[])
  return[ upload, { loading }]
  
  
}
