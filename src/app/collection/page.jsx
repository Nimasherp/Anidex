"use client"

import { useState, useEffect, useMemo } from "react"  
import { useUser } from "@/hooks/useUser"  
import { useAuth } from "@/hooks/useAuth"  

function MainComponent() {
    const [collection, setCollection] = useState([])  
    const [achievements, setAchievements] = useState([])  
    const [loading, setLoading] = useState(true)  
    const [error, setError] = useState(null)  
    const [sortBy, setSortBy] = useState('newest')  
    const [filterBy, setFilterBy] = useState('all')  
    const [searchTerm, setSearchTerm] = useState('')  
    const { data: user, loading: userLoading } = useUser()  
    const { signOut } = useAuth()  
  
    const fetchCollection = async () => {
      try {
        setLoading(true)  
        const response = await fetch("/api/get-collection", { method: "POST" })  
        if (!response.ok) {
          throw new Error(
            `When fetching /api/get-collection, the response was [${response.status}] ${response.statusText}`,
          )  
        }
        const data = await response.json()  
        if (data.success) {
          setCollection(data.collections)  
          setAchievements(data.achievements)  
        } else {
          setError(data.error || "Failed to fetch collection")  
        }
      } catch (err) {
        console.error(err)  
        setError("Failed to fetch collection")  
      } finally {
        setLoading(false)  
      }
    }  
  
    useEffect(() => {
      if (user) {
        fetchCollection()  
      }
    }, [user])  
  
    const filteredAndSortedCollection = useMemo(() => {
      let filtered = collection  
  
      if (searchTerm) {
        filtered = filtered.filter(
          (animal) =>
            animal.common_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.species_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )  
      }
  
      if (filterBy !== 'all') {
        filtered = filtered.filter((animal) => {
          switch (filterBy) {
            case 'common':
              return animal.rarity_level === 'Common'  
            case 'uncommon':
              return animal.rarity_level === 'Uncommon'  
            case 'rare':
              return animal.rarity_level === 'Rare'  
            case 'epic':
              return animal.rarity_level === 'Epic'  
            case 'legendary':
              return animal.rarity_level === 'Legendary'  
            default:
              return true  
          }
        })  
      }
  
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.capture_date) - new Date(a.capture_date)  
          case 'oldest':
            return new Date(a.capture_date) - new Date(b.capture_date)  
          case 'name':
            return a.common_name?.localeCompare(b.common_name) || 0  
          case 'rarity':
            const rarityOrder = { 'Common': 1, 'Uncommon': 2, 'Rare': 3, 'Epic': 4, 'Legendary': 5 }  
            return (rarityOrder[b.rarity_level] || 0) - (rarityOrder[a.rarity_level] || 0)  
          default:
            return 0  
        }
      })  
  
      return filtered  
    }, [collection, searchTerm, filterBy, sortBy])  
  
    const getRarityColor = (rarity) => {
      switch (rarity) {
        case 'Common':
          return 'text-gray-600 bg-gray-100'  
        case 'Uncommon':
          return 'text-green-600 bg-green-100'  
        case 'Rare':
          return 'text-blue-600 bg-blue-100'  
        case 'Epic':
          return 'text-purple-600 bg-purple-100'  
        case 'Legendary':
          return 'text-yellow-600 bg-yellow-100'  
        default:
          return 'text-gray-600 bg-gray-100'  
      }
    }  
  
    const collectionStats = useMemo(() => {
      const total = collection.length  
      const rarityCount = collection.reduce((acc, animal) => {
        acc[animal.rarity_level] = (acc[animal.rarity_level] || 0) + 1  
        return acc  
      }, {})  
      
      return { total, rarityCount }  
    }, [collection])  
  
    if (userLoading || loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-green-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 font-roboto">Loading your collection...</p>
          </div>
        </div>
      )  
    }
  
    if (!user) {
      return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md w-full">
            <div className="mb-8">
              <div className="text-6xl mb-4">🦋</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 font-roboto">
                anidex
              </h1>
              <p className="text-lg text-gray-600 font-roboto">
                Sign in to view your collection
              </p>
            </div>
  
            <div className="space-y-4">
              <a
                href="/account/signin"
                className="block w-full bg-green-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg font-roboto"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      )  
    }
  
    return (
      <div className="min-h-screen bg-blue-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <a href="/" className="text-2xl font-bold text-gray-800 font-roboto hover:text-blue-600 transition-colors">
                  anidex
                </a>
                <span className="text-gray-400">|</span>
                <h2 className="text-xl font-semibold text-gray-700 font-roboto">My Collection</h2>
              </div>
              <button
              onClick={() => signOut({ callbackUrl: "/", redirect: true })}
              className="text-gray-600 hover:text-gray-800 font-roboto"
                >
                Sign Out
                </button>
            </div>
          </div>
        </header>
  
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600 font-roboto">{collectionStats.total}</div>
                <div className="text-sm text-gray-600 font-roboto">Total Animals</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-gray-600 font-roboto">{collectionStats.rarityCount.Common || 0}</div>
                <div className="text-sm text-gray-600 font-roboto">Common</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-green-600 font-roboto">{collectionStats.rarityCount.Uncommon || 0}</div>
                <div className="text-sm text-gray-600 font-roboto">Uncommon</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600 font-roboto">{collectionStats.rarityCount.Rare || 0}</div>
                <div className="text-sm text-gray-600 font-roboto">Rare</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-purple-600 font-roboto">{collectionStats.rarityCount.Epic || 0} + {collectionStats.rarityCount.Legendary || 0}</div>
                <div className="text-sm text-gray-600 font-roboto">Epic & Legendary</div>
              </div>
            </div>
  
            {achievements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 font-roboto">🏆 Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 font-roboto">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 font-roboto">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-2 font-roboto">
                        Earned: {new Date(achievement.date_earned).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search animals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-roboto"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-roboto"
                  >
                    <option value="all">All Rarities</option>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-roboto"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="rarity">Rarity</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
  
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 font-roboto">{error}</p>
            </div>
          )}
  
          {filteredAndSortedCollection.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🦋</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2 font-roboto">
                {collection.length === 0 ? "No Animals Yet" : "No Results Found"}
              </h3>
              <p className="text-gray-600 mb-8 font-roboto">
                {collection.length === 0 
                  ? "Start capturing wildlife to build your collection!"
                  : "Try adjusting your search or filters"}
              </p>
              {collection.length === 0 && (
                <a
                  href="/"
                  className="inline-block bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors font-roboto"
                >
                  Start Capturing
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCollection.map((animal) => (
                <div key={animal.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-w-16 aspect-h-12">
                    <img
                      src={animal.photo_url}
                      alt={`${animal.common_name} captured on ${new Date(animal.capture_date).toLocaleDateString()}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 font-roboto">{animal.common_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(animal.rarity_level)} font-roboto`}>
                        {animal.rarity_level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 italic mb-2 font-roboto">{animal.species_name}</p>
                    <p className="text-sm text-gray-600 mb-2 font-roboto">
                      <i className="fas fa-calendar mr-1"></i>
                      Captured: {new Date(animal.capture_date).toLocaleDateString()}
                    </p>
                    {animal.habitat && (
                      <p className="text-sm text-gray-600 mb-2 font-roboto">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {animal.habitat}
                      </p>
                    )}
                    {animal.conservation_status && (
                      <p className="text-sm text-gray-600 mb-2 font-roboto">
                        <i className="fas fa-shield-alt mr-1"></i>
                        {animal.conservation_status}
                      </p>
                    )}
                    {animal.interesting_facts && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-700 font-roboto">
                          <i className="fas fa-lightbulb mr-1 text-yellow-500"></i>
                          {animal.interesting_facts}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    )  
  }
  export default MainComponent  
  
  
  