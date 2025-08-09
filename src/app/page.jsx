"use client" 
import {useState, useEffect} from "react" 
import { useSession, signIn, signOut } from "next-auth/react"
import { useUpload } from "../hooks/useUpload"
import Swal from 'sweetalert2'

function MainComponent() {
  // next auth session
  const { data: session, status } = useSession()
  const user = session?.user || null
  const userLoading = status === "loading"

  // Uploading
  const [file, setFile] = useState(null)
  const [image, setImage] = useState(null)
  const [upload, { loading: uploading }] = useUpload()

  // App state
  const [error, setError] = useState(null)
  const [identifiedAnimal, setIdentifiedAnimal] = useState(null)
  const [collection, setCollection] = useState([])
  const [achievements, setAchievements] = useState([])
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0]
    if (!selectedFile) {
      setError("No file selected")
      return
    }

    try {
      setFile(selectedFile)
      const result = await upload({ file: selectedFile })

      if (result.error) {
        setError(`Upload failed: ${result.error}`)
        return
      }

      const { url } = result
      if (!url) {
        setError("Upload succeeded but returned no URL")
        return
      }

      setImage(url)
      identifyAnimal(url)
    } catch (err) {
      console.error(err)
      setError("Failed to upload image")
    }
  }

  const identifyAnimal = async (imageUrl) => {
    try {
      const response = await fetch("/api/identify-animal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setIdentifiedAnimal(data)
    } catch (err) {
      console.error(err)
      setError("Failed to identify animal")
    }
  }

  const captureAnimal = async () => {
    if (!identifiedAnimal?.animal?.taxonid || !image) return

    try {
      const response = await fetch("/api/capture-animal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalId: identifiedAnimal.animal.taxonid,
          photoUrl: image,
          captureLocation: { x: 0, y: 0 },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        fetchCollection()
        Swal.fire({
          title: "Success!",
          text: "Animal added to your collection",
          icon: "success"
        })
      }
    } catch (err) {
      console.error(err)
      setError("Failed to capture animal")
    }
  }

  const fetchCollection = async () => {
    try {
      const response = await fetch("/api/get-collection", { method: "POST" })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setCollection(data.collections)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to fetch collection")
    }
  }

  useEffect(() => {
    if (user && !showIntro) {
      fetchCollection()
    }
  }, [user, showIntro])

  // Cinematic intro screen
  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center space-y-8 justify-center z-50">
        
        <div className="text-center mb-11">
          <h1 
            className="text-6xl md:text-8xl font text-gray-800 font-roboto "
            style={{ opacity: 0, animation: "introAnimation 3s ease-in-out forwards", willChange: "opacity" }}
          >
            anidex
          </h1>
        </div>

        <img 
          src="/img/Celtic-Symbol-Deer.png" 
          alt="Celtic Deer" 
          style={{ opacity: 0, animation: "introAnimation 3s ease-in-out forwards", willChange: "opacity" }}
          className="w-40 " 
        />

        <style jsx global>{`
          
          @keyframes introAnimation {
            0% {
              opacity: 0 ;
            }
            30% {
              opacity: 1 ;
            }
            70% {
              opacity: 1 ;
            }
            100% {
              opacity: 0 ;
            }
          }
        `}</style>
      </div>
    ) 
  }

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-roboto">Loading...</p>
        </div>
      </div>
    ) 
  }
// Login
  if (!user) {
    return (
      <div className="min-h-screen bg-black-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="mb-16">
            <div className="text-6xl mb-4">🦋</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-roboto">
              anidex
            </h1>
            <p className="text-lg text-gray-600 font-roboto">
              Discover, capture, and collect wildlife around you
            </p>
          </div>

          <div className="space-y-4">
            <a
              href="/account/signin"
              className="block w-full bg-black text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-colors shadow-lg font-roboto"
            >
              Sign In
            </a>

            <a
              href="/account/signup"
              className="block w-full bg-white text-black py-4 px-8 rounded-2xl font-bold text-lg border-2 border-black hover:bg-gray-100 transition-colors shadow-lg font-roboto"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    ) 
  }
  // THE MAIN PAGE
  return (

    <div className="min-h-screen bg-blue-50">
      {/* top bar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-gray-800 font-roboto">
                anidex
              </h1>
              <a
                href="/collection"
                className="text-gray-600 hover:text-green-600 transition-colors font-roboto flex items-center space-x-1"
              >
                <i className="fas fa-collection"></i>
                <span>My Collection ( {collection.length} )</span>
              </a>
            </div>
            <button
            // TODO
              onClick={() => signOut({ callbackUrl: "/", redirect: true })} 

              className="text-gray-600 hover:text-gray-800 font-roboto"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      {/* Menu */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {!image ? (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 font-roboto">
              Capture Wildlife
            </h2>
            <p className="text-gray-600 mb-12 font-roboto">
              Upload a photo to identify and collect animals
            </p>

            <div className="max-w-sm mx-auto">
              <label className="block w-full bg-blue-600 text-white py-6 px-8 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg cursor-pointer font-roboto">
                <span className="flex items-center justify-center">
                  Choose Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <img
                src={image}
                alt="Uploaded wildlife photo"
                className="w-full h-80 object-cover"
              />
            </div>

            {identifiedAnimal && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center font-roboto">
                  {identifiedAnimal.identification}
                </h3>
                {identifiedAnimal.found && (
                  <button
                    onClick={captureAnimal}
                    className="w-full bg-emerald-500 text-white py-4 px-6 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-md font-roboto"
                  >
                    Add to Collection
                  </button>
                )}
              </div>
            )}

            <div className="text-center">
              <button
              // TODO
                onClick={() => {
                  setImage(null) 
                  setIdentifiedAnimal(null) 
                  setFile(null) 
                }}
                className="bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-colors font-roboto"
              >
                Upload Another Photo
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-center font-roboto">{error}</p>
          </div>
        )}
      </main>
    </div>
  ) 
}

export default MainComponent 