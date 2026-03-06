"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef, Suspense } from "react" // Import useRef and Suspense
import { Button } from "@/components/ui/button"
import { Camera, Flame, Facebook, CheckCircle, MessageCircle, Heart, Upload, ScanEye, User, Calendar, Beaker as Gender, Home, Compass, MessageSquare, X, Star, MapPin, Lock, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { fetchInstagramProfile, fetchInstagramPosts } from "@/lib/instagram-tracker"
import { AlertTriangle } from "lucide-react"

// Device limit system - 1 search per device
const LIMIT_KEY = "instacheck_search_limit"
const MAX_SEARCHES = 1

// DDD to Location mapping (Brazil)
const DDD_LOCATIONS: Record<string, { city: string; state: string; lat: number; lng: number }> = {
  "11": { city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333 },
  "12": { city: "São José dos Campos", state: "SP", lat: -23.1896, lng: -45.8841 },
  "13": { city: "Santos", state: "SP", lat: -23.9608, lng: -46.3336 },
  "14": { city: "Bauru", state: "SP", lat: -22.3246, lng: -49.0871 },
  "15": { city: "Sorocaba", state: "SP", lat: -23.5015, lng: -47.4526 },
  "16": { city: "Ribeirão Preto", state: "SP", lat: -21.1775, lng: -47.8103 },
  "17": { city: "São José do Rio Preto", state: "SP", lat: -20.8113, lng: -49.3758 },
  "18": { city: "Presidente Prudente", state: "SP", lat: -22.1207, lng: -51.3882 },
  "19": { city: "Campinas", state: "SP", lat: -22.9099, lng: -47.0626 },
  "21": { city: "Rio de Janeiro", state: "RJ", lat: -22.9068, lng: -43.1729 },
  "22": { city: "Campos dos Goytacazes", state: "RJ", lat: -21.7545, lng: -41.3244 },
  "24": { city: "Volta Redonda", state: "RJ", lat: -22.5232, lng: -44.1042 },
  "27": { city: "Vitória", state: "ES", lat: -20.3155, lng: -40.3128 },
  "28": { city: "Cachoeiro de Itapemirim", state: "ES", lat: -20.8488, lng: -41.1128 },
  "31": { city: "Belo Horizonte", state: "MG", lat: -19.9167, lng: -43.9345 },
  "32": { city: "Juiz de Fora", state: "MG", lat: -21.7642, lng: -43.3496 },
  "33": { city: "Governador Valadares", state: "MG", lat: -18.8510, lng: -41.9493 },
  "34": { city: "Uberlândia", state: "MG", lat: -18.9186, lng: -48.2772 },
  "35": { city: "Poços de Caldas", state: "MG", lat: -21.7878, lng: -46.5613 },
  "37": { city: "Divinópolis", state: "MG", lat: -20.1389, lng: -44.8842 },
  "38": { city: "Montes Claros", state: "MG", lat: -16.7350, lng: -43.8617 },
  "41": { city: "Curitiba", state: "PR", lat: -25.4284, lng: -49.2733 },
  "42": { city: "Ponta Grossa", state: "PR", lat: -25.0945, lng: -50.1633 },
  "43": { city: "Londrina", state: "PR", lat: -23.3045, lng: -51.1696 },
  "44": { city: "Maringá", state: "PR", lat: -23.4205, lng: -51.9333 },
  "45": { city: "Foz do Iguaçu", state: "PR", lat: -25.5163, lng: -54.5854 },
  "46": { city: "Francisco Beltrão", state: "PR", lat: -26.0785, lng: -53.0522 },
  "47": { city: "Joinville", state: "SC", lat: -26.3044, lng: -48.8487 },
  "48": { city: "Florianópolis", state: "SC", lat: -27.5954, lng: -48.5480 },
  "49": { city: "Chapecó", state: "SC", lat: -27.1004, lng: -52.6152 },
  "51": { city: "Porto Alegre", state: "RS", lat: -30.0346, lng: -51.2177 },
  "53": { city: "Pelotas", state: "RS", lat: -31.7654, lng: -52.3376 },
  "54": { city: "Caxias do Sul", state: "RS", lat: -29.1634, lng: -51.1797 },
  "55": { city: "Santa Maria", state: "RS", lat: -29.6868, lng: -53.8149 },
  "61": { city: "Brasília", state: "DF", lat: -15.8267, lng: -47.9218 },
  "62": { city: "Goiânia", state: "GO", lat: -16.6864, lng: -49.2643 },
  "63": { city: "Palmas", state: "TO", lat: -10.2128, lng: -48.3603 },
  "64": { city: "Rio Verde", state: "GO", lat: -17.7923, lng: -50.9192 },
  "65": { city: "Cuiabá", state: "MT", lat: -15.6014, lng: -56.0979 },
  "66": { city: "Rondonópolis", state: "MT", lat: -16.4673, lng: -54.6372 },
  "67": { city: "Campo Grande", state: "MS", lat: -20.4697, lng: -54.6201 },
  "68": { city: "Rio Branco", state: "AC", lat: -9.9754, lng: -67.8249 },
  "69": { city: "Porto Velho", state: "RO", lat: -8.7612, lng: -63.9004 },
  "71": { city: "Salvador", state: "BA", lat: -12.9714, lng: -38.5014 },
  "73": { city: "Ilhéus", state: "BA", lat: -14.7942, lng: -39.0361 },
  "74": { city: "Juazeiro", state: "BA", lat: -9.4163, lng: -40.5033 },
  "75": { city: "Feira de Santana", state: "BA", lat: -12.2664, lng: -38.9663 },
  "77": { city: "Barreiras", state: "BA", lat: -12.1528, lng: -44.9900 },
  "79": { city: "Aracaju", state: "SE", lat: -10.9472, lng: -37.0731 },
  "81": { city: "Recife", state: "PE", lat: -8.0476, lng: -34.8770 },
  "82": { city: "Maceió", state: "AL", lat: -9.6498, lng: -35.7089 },
  "83": { city: "João Pessoa", state: "PB", lat: -7.1195, lng: -34.8450 },
  "84": { city: "Natal", state: "RN", lat: -5.7945, lng: -35.2110 },
  "85": { city: "Fortaleza", state: "CE", lat: -3.7172, lng: -38.5433 },
  "86": { city: "Teresina", state: "PI", lat: -5.0920, lng: -42.8038 },
  "87": { city: "Petrolina", state: "PE", lat: -9.3891, lng: -40.5028 },
  "88": { city: "Juazeiro do Norte", state: "CE", lat: -7.2130, lng: -39.3150 },
  "89": { city: "Picos", state: "PI", lat: -7.0767, lng: -41.4669 },
  "91": { city: "Belém", state: "PA", lat: -1.4558, lng: -48.4902 },
  "92": { city: "Manaus", state: "AM", lat: -3.1190, lng: -60.0217 },
  "93": { city: "Santarém", state: "PA", lat: -2.4431, lng: -54.7083 },
  "94": { city: "Marabá", state: "PA", lat: -5.3687, lng: -49.1178 },
  "95": { city: "Boa Vista", state: "RR", lat: 2.8235, lng: -60.6758 },
  "96": { city: "Macapá", state: "AP", lat: 0.0349, lng: -51.0694 },
  "97": { city: "Coari", state: "AM", lat: -4.0850, lng: -63.1408 },
  "98": { city: "São Luís", state: "MA", lat: -2.5307, lng: -44.3068 },
  "99": { city: "Imperatriz", state: "MA", lat: -5.5264, lng: -47.4916 },
}

// International country codes to location
const COUNTRY_CODES: Record<string, { country: string; city: string; lat: number; lng: number }> = {
  "1": { country: "United States", city: "New York", lat: 40.7128, lng: -74.0060 },
  "7": { country: "Russia", city: "Moscow", lat: 55.7558, lng: 37.6173 },
  "20": { country: "Egypt", city: "Cairo", lat: 30.0444, lng: 31.2357 },
  "27": { country: "South Africa", city: "Johannesburg", lat: -26.2041, lng: 28.0473 },
  "30": { country: "Greece", city: "Athens", lat: 37.9838, lng: 23.7275 },
  "31": { country: "Netherlands", city: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  "32": { country: "Belgium", city: "Brussels", lat: 50.8503, lng: 4.3517 },
  "33": { country: "France", city: "Paris", lat: 48.8566, lng: 2.3522 },
  "34": { country: "Spain", city: "Madrid", lat: 40.4168, lng: -3.7038 },
  "36": { country: "Hungary", city: "Budapest", lat: 47.4979, lng: 19.0402 },
  "39": { country: "Italy", city: "Rome", lat: 41.9028, lng: 12.4964 },
  "40": { country: "Romania", city: "Bucharest", lat: 44.4268, lng: 26.1025 },
  "41": { country: "Switzerland", city: "Zurich", lat: 47.3769, lng: 8.5417 },
  "43": { country: "Austria", city: "Vienna", lat: 48.2082, lng: 16.3738 },
  "44": { country: "United Kingdom", city: "London", lat: 51.5074, lng: -0.1278 },
  "45": { country: "Denmark", city: "Copenhagen", lat: 55.6761, lng: 12.5683 },
  "46": { country: "Sweden", city: "Stockholm", lat: 59.3293, lng: 18.0686 },
  "47": { country: "Norway", city: "Oslo", lat: 59.9139, lng: 10.7522 },
  "48": { country: "Poland", city: "Warsaw", lat: 52.2297, lng: 21.0122 },
  "49": { country: "Germany", city: "Berlin", lat: 52.5200, lng: 13.4050 },
  "51": { country: "Peru", city: "Lima", lat: -12.0464, lng: -77.0428 },
  "52": { country: "Mexico", city: "Mexico City", lat: 19.4326, lng: -99.1332 },
  "53": { country: "Cuba", city: "Havana", lat: 23.1136, lng: -82.3666 },
  "54": { country: "Argentina", city: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  "55": { country: "Brazil", city: "São Paulo", lat: -23.5505, lng: -46.6333 },
  "56": { country: "Chile", city: "Santiago", lat: -33.4489, lng: -70.6693 },
  "57": { country: "Colombia", city: "Bogotá", lat: 4.7110, lng: -74.0721 },
  "58": { country: "Venezuela", city: "Caracas", lat: 10.4806, lng: -66.9036 },
  "60": { country: "Malaysia", city: "Kuala Lumpur", lat: 3.1390, lng: 101.6869 },
  "61": { country: "Australia", city: "Sydney", lat: -33.8688, lng: 151.2093 },
  "62": { country: "Indonesia", city: "Jakarta", lat: -6.2088, lng: 106.8456 },
  "63": { country: "Philippines", city: "Manila", lat: 14.5995, lng: 120.9842 },
  "64": { country: "New Zealand", city: "Auckland", lat: -36.8485, lng: 174.7633 },
  "65": { country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198 },
  "66": { country: "Thailand", city: "Bangkok", lat: 13.7563, lng: 100.5018 },
  "81": { country: "Japan", city: "Tokyo", lat: 35.6762, lng: 139.6503 },
  "82": { country: "South Korea", city: "Seoul", lat: 37.5665, lng: 126.9780 },
  "84": { country: "Vietnam", city: "Hanoi", lat: 21.0285, lng: 105.8542 },
  "86": { country: "China", city: "Beijing", lat: 39.9042, lng: 116.4074 },
  "90": { country: "Turkey", city: "Istanbul", lat: 41.0082, lng: 28.9784 },
  "91": { country: "India", city: "New Delhi", lat: 28.6139, lng: 77.2090 },
  "92": { country: "Pakistan", city: "Karachi", lat: 24.8607, lng: 67.0011 },
  "93": { country: "Afghanistan", city: "Kabul", lat: 34.5553, lng: 69.2075 },
  "94": { country: "Sri Lanka", city: "Colombo", lat: 6.9271, lng: 79.8612 },
  "95": { country: "Myanmar", city: "Yangon", lat: 16.8661, lng: 96.1951 },
  "98": { country: "Iran", city: "Tehran", lat: 35.6892, lng: 51.3890 },
  "212": { country: "Morocco", city: "Casablanca", lat: 33.5731, lng: -7.5898 },
  "213": { country: "Algeria", city: "Algiers", lat: 36.7538, lng: 3.0588 },
  "234": { country: "Nigeria", city: "Lagos", lat: 6.5244, lng: 3.3792 },
  "351": { country: "Portugal", city: "Lisbon", lat: 38.7223, lng: -9.1393 },
  "352": { country: "Luxembourg", city: "Luxembourg", lat: 49.6117, lng: 6.1319 },
  "353": { country: "Ireland", city: "Dublin", lat: 53.3498, lng: -6.2603 },
  "354": { country: "Iceland", city: "Reykjavik", lat: 64.1466, lng: -21.9426 },
  "358": { country: "Finland", city: "Helsinki", lat: 60.1699, lng: 24.9384 },
  "380": { country: "Ukraine", city: "Kyiv", lat: 50.4501, lng: 30.5234 },
  "420": { country: "Czech Republic", city: "Prague", lat: 50.0755, lng: 14.4378 },
  "595": { country: "Paraguay", city: "Asunción", lat: -25.2637, lng: -57.5759 },
  "598": { country: "Uruguay", city: "Montevideo", lat: -34.9011, lng: -56.1645 },
  "852": { country: "Hong Kong", city: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  "886": { country: "Taiwan", city: "Taipei", lat: 25.0330, lng: 121.5654 },
  "971": { country: "UAE", city: "Dubai", lat: 25.2048, lng: 55.2708 },
  "972": { country: "Israel", city: "Tel Aviv", lat: 32.0853, lng: 34.7818 },
}

// Function to get location from phone number
const getLocationFromPhone = (phone: string): { city: string; country: string; lat: number; lng: number } | null => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")
  
  if (digits.length < 2) return null
  
  // Check if it's a Brazilian number (starts with 55 or has 10-11 digits without country code)
  if (digits.startsWith("55") && digits.length >= 4) {
    // Brazilian number with country code: 55 + DDD + number
    const ddd = digits.substring(2, 4)
    const location = DDD_LOCATIONS[ddd]
    if (location) {
      return { city: location.city, country: "Brazil", lat: location.lat, lng: location.lng }
    }
  } else if (digits.length >= 10 && digits.length <= 11) {
    // Brazilian number without country code
    const ddd = digits.substring(0, 2)
    const location = DDD_LOCATIONS[ddd]
    if (location) {
      return { city: location.city, country: "Brazil", lat: location.lat, lng: location.lng }
    }
  }
  
  // Check international codes (try longer codes first)
  for (const codeLength of [3, 2, 1]) {
    if (digits.length >= codeLength) {
      const code = digits.substring(0, codeLength)
      const location = COUNTRY_CODES[code]
      if (location) {
        return { city: location.city, country: location.country, lat: location.lat, lng: location.lng }
      }
    }
  }
  
  return null
}

interface SearchLimitData {
  searchedUsername: string
  searchedAt: number
  profilePicUrl?: string
  fullName?: string
}

export default function SpySystemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>}>
      <SpySystemContent />
    </Suspense>
  )
}

const getSearchLimitData = (): SearchLimitData | null => {
  try {
    const data = localStorage.getItem(LIMIT_KEY)
    if (!data) return null
    return JSON.parse(data) as SearchLimitData
  } catch (e) {
    console.error("[v0] Error getting search limit:", e)
    return null
  }
}

const setSearchLimitData = (username: string, profilePicUrl?: string, fullName?: string) => {
  try {
    const data: SearchLimitData = {
      searchedUsername: username,
      searchedAt: Date.now(),
      profilePicUrl,
      fullName
    }
    localStorage.setItem(LIMIT_KEY, JSON.stringify(data))
    console.log("[v0] Search limit set for:", username)
  } catch (e) {
    console.error("[v0] Error setting search limit:", e)
  }
}

const hasReachedLimit = (): boolean => {
  const data = getSearchLimitData()
  return data !== null
}

const sanitizeUsername = (username: string): string => {
  let u = (username || "").trim()
  if (u.startsWith("@")) u = u.slice(1)
  u = u.toLowerCase()
  return u.replace(/[^a-z0-9._]/g, "")
}

const setAvatarLocalCache = (user: string, url: string) => {
  if (!user || !url) return
  try {
    const key = "igAvatarCacheV1"
    const cache = JSON.parse(localStorage.getItem(key) || "{}") || {}
    cache[user] = { url, ts: Date.now() }
    localStorage.setItem(key, JSON.stringify(cache))
    console.log("[v0] Cached Instagram avatar for:", user)
  } catch (e) {
    console.error("[v0] Error caching avatar:", e)
  }
}

const getAvatarFromCache = (user: string): string | null => {
  try {
    const key = "igAvatarCacheV1"
    const cache = JSON.parse(localStorage.getItem(key) || "{}") || {}
    if (cache[user] && cache[user].url) {
      console.log("[v0] Found cached avatar for:", user)
      return cache[user].url
    }
  } catch (e) {
    console.error("[v0] Error reading cache:", e)
  }
  return null
}

const setProfileLocalCache = (user: string, profile: any) => {
  if (!user || !profile) return
  try {
    const key = "igProfileCacheV1"
    const cache = JSON.parse(localStorage.getItem(key) || "{}") || {}
    cache[user] = { profile, ts: Date.now() }
    localStorage.setItem(key, JSON.stringify(cache))
    console.log("[v0] Cached Instagram profile for:", user)
  } catch (e) {
    console.error("[v0] Error caching profile:", e)
  }
}

const getProfileFromCache = (user: string): any | null => {
  try {
    const key = "igProfileCacheV1"
    const cache = JSON.parse(localStorage.getItem(key) || "{}") || {}
    if (cache[user] && cache[user].profile) {
      console.log("[v0] Found cached profile for:", user)
      return cache[user].profile
    }
  } catch (e) {
    console.error("[v0] Error reading cache:", e)
  }
  return null
}

// Carousel component for Liked Photo 3
function CarouselPost3({ instagramProfile, imagePreviewUrl, investigatedHandle }: {
  instagramProfile: any
  imagePreviewUrl: string | null
  investigatedHandle: string
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselImages = [
    "/images/7b352510dd-8016-4bce-97de-8e8a5e4a141a-7d.png",
    "/images/beach-friends-1.jpg",
    "/images/beach-paddle-1.jpg"
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-12">
      <div className="relative w-full h-64 rounded-md overflow-hidden">
        <img
          src={carouselImages[currentSlide]}
          alt={`Liked Photo 3 - ${currentSlide + 1}`}
          className="w-full h-full object-cover filter blur-sm transition-all duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Lock size={48} className="text-white" />
        </div>
        
        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-all z-10"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-all z-10"
        >
          <ChevronRight size={20} />
        </button>
        
        {/* Carousel Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Heart size={16} className="text-pink-400" />
        <span className="text-sm text-gray-300">3.8K likes</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <img
          src={
            instagramProfile?.profile_pic_url
              ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
              : imagePreviewUrl || "/placeholder.svg"
          }
          alt="User Avatar"
          className="w-8 h-8 rounded-full object-cover border border-gray-500"
          crossOrigin="anonymous"
        />
        <div>
          <p className="text-sm text-gray-300 font-bold">{investigatedHandle || "@alvo"}</p>
          <p className="text-white text-sm">"The most perfect woman I've ever seen"</p>
        </div>
      </div>
    </div>
  )
}

function SpySystemContent() {
  // All state and functionality remains the same
  const [currentStage, setCurrentStage] = useState(0)
  const [showContent, setShowContent] = useState(true)
  const [fileName, setFileName] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [investigatedHandle, setInvestigatedHandle] = useState<string>("")
  const [investigatedAge, setInvestigatedAge] = useState<string>("")
  const [investigatedGender, setInvestigatedGender] = useState<string>("")
  const [investigatedLocation, setInvestigatedLocation] = useState<string>("")
  const [investigatedPhone, setInvestigatedPhone] = useState<string>("")
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisMessage, setAnalysisMessage] = useState("Initializing scan...")
  const [animationFrame, setAnimationFrame] = useState(0) // New state for animation frame
  const [timeLeft, setTimeLeft] = useState(10 * 60) // 10 minutes in seconds for the countdown
  const [showMissedMatch, setShowMissedMatch] = useState(false)
  const [randomNotifications, setRandomNotifications] = useState<
    { id: number; user: string; action: string; time: string }[]
  >([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [whatsappPhoto, setWhatsappPhoto] = useState<string | null>(null)
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false)
  const [userCity, setUserCity] = useState<string>("")
  const [userCountry, setUserCountry] = useState<string>("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null)

  // State for Instagram profile
  const [instagramProfile, setInstagramProfile] = useState<any>(null)
  const [isLoadingInstagram, setIsLoadingInstagram] = useState(false)
  const [instagramImageError, setInstagramImageError] = useState(false)
  const [instagramImageLoading, setInstagramImageLoading] = useState(false)

  const [instagramPosts, setInstagramPosts] = useState<any[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)

  // Limit system states
  const [showLimitReached, setShowLimitReached] = useState(false)
  const [limitData, setLimitData] = useState<SearchLimitData | null>(null)

  // Password cracking animation states
  const [isCrackingPassword, setIsCrackingPassword] = useState(false)
  const [crackingText, setCrackingText] = useState("")
  const [passwordCracked, setPasswordCracked] = useState(false)
  const crackingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Data for random notifications
  const randomUsers = [
    "Ana Silva",
    "João Pereira",
    "Maria Oliveira",
    "Pedro Santos",
    "Camila Souza",
    "Lucas Costa",
    "Mariana Almeida",
    "Rafael Martins",
    "Rafael Martins",
    "Beatriz Lima",
    "Gustavo Rocha",
    "Isabela Fernandes",
    "Felipe Gomes",
    "Lara Ribeiro",
    "Daniel Carvalho",
    "Sofia Mendes",
  ]
  const notificationActions = [
    "accessed the final result.",
    "downloaded the full report.",
    "viewed private data.",
    "initiated a new scan.",
    "shared the findings.",
    "verified the intelligence.",
  ]

  // Add these arrays for placeholder images
  const femalePlaceholders = [
    "/images/female-placeholder-1.jpeg",
    "/images/female-placeholder-2.jpeg",
    "/images/female-placeholder-3.jpeg",
    "/images/female-placeholder-4.jpeg",
    "/images/female-placeholder-5.jpeg",
    "/images/female-placeholder-6.avif", // New female image
    "/images/female-placeholder-7.jpeg", // New female image
    "/images/female-placeholder-8.jpeg", // New female image
  ]

  const malePlaceholders = [
    "/images/male-placeholder-1.jpeg",
    "/images/male-placeholder-2.jpeg",
    "/images/male-placeholder-3.jpeg",
    "/images/male-placeholder-4.jpeg",
    "/images/male-placeholder-5.jpeg",
    "/images/male-placeholder-6.jpeg", // Nova imagem masculina
    "/images/male-placeholder-7.png", // Nova imagem masculina
  ]

  // Check for search limit on mount
  // TEMPORARILY DISABLED FOR TESTING
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("instacheck_search_limit")
      // const existingLimit = getSearchLimitData()
      // if (existingLimit) {
      //   setLimitData(existingLimit)
      //   setShowLimitReached(true)
      // }
    }
  }, [])

  // Cleanup for image preview URL
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    if (currentStage === 6 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      clearInterval(timer)
    }
    return () => clearInterval(timer)
  }, [currentStage, timeLeft])

  // Random notifications effect
  useEffect(() => {
    let notificationInterval: NodeJS.Timeout | undefined
    if (currentStage === 6) {
      notificationInterval = setInterval(() => {
        const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)]
        const randomAction = notificationActions[Math.floor(Math.random() * notificationActions.length)]
        const newNotification = {
          id: Date.now(),
          user: randomUser,
          action: randomAction,
          time: "Just now",
        }
        setRandomNotifications((prevNotifications) => {
          const updated = [newNotification, ...prevNotifications]
          return updated.slice(0, 5) // Keep only the last 5 notifications
        })
      }, 3000) // Add a new notification every 3 seconds
    }
    return () => clearInterval(notificationInterval)
  }, [currentStage])

  useEffect(() => {
    if (currentStage === 4) {
      // Show notification after 4 seconds
      const showTimer = setTimeout(() => {
        setShowMissedMatch(true)
      }, 4000)

      // Hide notification after 7 seconds (4 + 3)
      const hideTimer = setTimeout(() => {
        setShowMissedMatch(false)
      }, 7000)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [currentStage])

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const usernameFromUrl = urlParams.get("username")

      if (usernameFromUrl) {
        console.log("[v0] Instagram username found in URL:", usernameFromUrl)
        // Set the username with @ prefix if not already present
        const formattedUsername = usernameFromUrl.startsWith("@") ? usernameFromUrl : `@${usernameFromUrl}`
        setInvestigatedHandle(formattedUsername)

        // Trigger Instagram profile fetch
        if (usernameFromUrl.length >= 3) {
          setIsLoadingInstagram(true)
          fetchInstagramProfile(formattedUsername).then((result) => {
            // Use formattedUsername here
            if (result.success) {
              setInstagramProfile(result.profile)
              console.log("[v0] Instagram profile validated from URL:", result.profile)
              // Start loading the image immediately if profile is found
              if (result.profile && result.profile.profile_pic_url) {
                setInstagramImageLoading(true)
                setInstagramImageError(false)
              }
            } else {
              setInstagramProfile(null)
              setInstagramImageLoading(false)
              setInstagramImageError(true)
            }
            setIsLoadingInstagram(false)
          })
        }
      }
    }
  }, []) // Run once on component mount

  useEffect(() => {
    if (instagramProfile && instagramProfile.username) {
      setIsLoadingPosts(true)
      fetchInstagramPosts(instagramProfile.username).then((result) => {
        if (result.success) {
          setInstagramPosts(result.posts || [])
          console.log("[v0] Instagram posts fetched:", result.posts)
        } else {
          setInstagramPosts([])
          if (result.error?.includes("private")) {
            console.log("[v0] Profile is private, no posts available")
          }
        }
        setIsLoadingPosts(false)
      })
    }
  }, [instagramProfile])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const nextStage = useCallback(() => {
    setShowContent(false) // Start fade-out
    setTimeout(() => {
      setCurrentStage((prev) => prev + 1)
      setShowContent(true) // Start fade-in for next stage
      // Reset analysis states only when starting a new analysis, not just moving stages
      if (currentStage === 0) {
        // If coming from initial screen, reset all
        setFileName(null)
        setImagePreviewUrl(null)
        setInvestigatedHandle("")
        setInvestigatedAge("")
        setInvestigatedGender("")
        setInvestigatedLocation("")
        setInvestigatedPhone("")
        setAnalysisProgress(0)
        setIsAnalyzing(false)
        setInstagramProfile(null) // Reset Instagram profile state
        setInstagramImageLoading(false) // Reset image loading state
        setInstagramImageError(false) // Reset image error state
        setInstagramPosts([]) // Clear posts when resetting
      }
      // Reset timer when entering stage 6
      if (currentStage + 1 === 6) {
        setTimeLeft(10 * 60) // Reset to 10 minutes
        setRandomNotifications([]) // Clear previous notifications
      }
    }, 500) // Duration of fade-out
  }, [currentStage, imagePreviewUrl]) // Added currentStage to dependencies

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      setFileName(file.name)
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl) // Revoke previous URL if exists
      }
      setImagePreviewUrl(URL.createObjectURL(file))
    } else {
      setFileName(null)
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
      setImagePreviewUrl(null)
    }
  }

const startCrackingAnimation = () => {
  setIsCrackingPassword(true)
  setPasswordCracked(false)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
  crackingIntervalRef.current = setInterval(() => {
    const randomStr = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    setCrackingText(randomStr)
  }, 80)
  
  setTimeout(() => {
    if (crackingIntervalRef.current) {
      clearInterval(crackingIntervalRef.current)
    }
    setCrackingText("********")
    setPasswordCracked(true)
    setIsCrackingPassword(false)
  }, 5000)
  }

  const handleInstagramHandleChange = async (value: string) => {
  // Sanitize the input
  const sanitized = sanitizeUsername(value)
  const formatted = sanitized ? `@${sanitized}` : ""
  setInvestigatedHandle(formatted)
  
  // Reset cracking state on new input
  if (crackingIntervalRef.current) {
    clearInterval(crackingIntervalRef.current)
  }
  setIsCrackingPassword(false)
  setPasswordCracked(false)
  setCrackingText("")
  
  // Clear previous debounce timer
  if (debounceTimer.current) {
  clearTimeout(debounceTimer.current)
  }
  
  // Only fetch if username is at least 3 characters (excluding @)
  if (sanitized.length >= 3) {
  // Wait 1.5s after user stops typing, then start cracking animation
  const timer = setTimeout(async () => {
    // Start cracking animation after user finishes typing
    startCrackingAnimation()
    
    // Fetch Instagram profile in background while cracking plays
    setIsLoadingInstagram(true)
    setInstagramImageLoading(true)
    setInstagramImageError(false)
    
    const cachedProfile = getProfileFromCache(sanitized)
    if (cachedProfile) {
      setInstagramProfile(cachedProfile)
      setInstagramImageLoading(false)
      setInstagramImageError(false)
      setIsLoadingInstagram(false)
    } else {
      const result = await fetchInstagramProfile(formatted)
      if (result.success && result.profile) {
        setInstagramProfile(result.profile)
        setProfileLocalCache(sanitized, result.profile)
        setIsLoadingInstagram(false)
        if (!result.profile.profile_pic_url) {
          setInstagramImageLoading(false)
        }
      } else {
        setInstagramProfile(null)
        setInstagramImageError(true)
        setInstagramImageLoading(false)
        setIsLoadingInstagram(false)
      }
    }
  }, 1500) // Wait 1.5s after user stops typing
  debounceTimer.current = timer
    } else {
      setInstagramProfile(null)
      setInstagramImageLoading(false)
      setInstagramImageError(false)
    }
  }

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisMessage("Initializing facial recognition protocols...")
    setAnimationFrame(0) // Reset animation frame

    let progress = 0
    let frame = 0 // Local frame counter
    const intervalDuration = 150
    const totalDuration = 15000
    const increment = 100 / (totalDuration / intervalDuration)

    const messages = [
      "Analyzing facial biometrics and unique identifiers...",
      "Cross-referencing encrypted public and private databases...",
      "Establishing secure connection to social network APIs...",
      "Decrypting hidden profiles and shadow accounts...",
      "Extracting private message logs and media attachments...",
      "Phone number found! Cross-referencing with social profiles...",
      "Identifying anomalous interaction patterns and suspicious likes...",
      "Compiling comprehensive intelligence report...",
      "Finalizing data integrity verification and extraction...",
      "Analysis complete. Results ready for decryption.",
    ]
    let messageIndex = 0

    const interval = setInterval(() => {
      progress += increment
      frame++ // Increment frame for cycling images

      if (progress <= 100) {
        setAnalysisProgress(Math.min(100, Math.round(progress)))

        const newIndex = Math.floor((progress / 100) * messages.length)
        if (newIndex > messageIndex && newIndex < messages.length) {
          messageIndex = newIndex
          setAnalysisMessage(messages[newIndex])
        }

        // Update animation frame for image cycling
        setAnimationFrame(frame)
      }
if (progress >= 100) {
  clearInterval(interval)
  // Save search limit when analysis completes
  const username = sanitizeUsername(investigatedHandle)
  setSearchLimitData(
    username,
    instagramProfile?.profile_pic_url,
    instagramProfile?.full_name
  )
  setLimitData({
    searchedUsername: username,
    searchedAt: Date.now(),
    profilePicUrl: instagramProfile?.profile_pic_url,
    fullName: instagramProfile?.full_name
  })
  setTimeout(() => {
  nextStage()
  }, 500)
  }
  }, intervalDuration)
  }, [nextStage, investigatedPhone, investigatedHandle, instagramProfile])

const fetchWhatsAppPhoto = async (phoneNumber: string, countryCode: string) => {
  console.log("[v0] fetchWhatsAppPhoto called with:", { phoneNumber, countryCode })

  if (!phoneNumber || phoneNumber.length < 8) {
    console.log("[v0] Phone number too short, aborting")
    return
  }

  setIsLoadingPhoto(true)
  
  // Fallback photo
  const fallbackPhoto = "https://i.postimg.cc/gcNd6QBM/img1.jpg"

  try {
    // Add timeout with AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const response = await fetch("/api/whatsapp-photo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phoneNumber,
        countryCode: countryCode,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("[v0] WhatsApp API response status:", response.status)
    const data = await response.json()
    console.log("[v0] WhatsApp API response data:", data)

    if (data.success && data.result) {
      console.log("[v0] Setting WhatsApp photo:", data.result)
      setWhatsappPhoto(data.result)
    } else {
      console.log("[v0] WhatsApp API returned no photo, using fallback")
      setWhatsappPhoto(fallbackPhoto)
    }
    fetchUserLocation()
  } catch (error) {
    console.error("[v0] Error fetching WhatsApp photo:", error)
    // Use fallback photo on error
    setWhatsappPhoto(fallbackPhoto)
    fetchUserLocation()
  } finally {
    setIsLoadingPhoto(false)
  }
}

const fetchUserLocation = async () => {
  setIsLoadingLocation(true)
  try {
    // Use our own API route to avoid CORS/mixed content issues
    const response = await fetch("/api/user-location")
    const data = await response.json()
    
    console.log("[v0] Location data received:", data)
    
    if (data.success) {
      setUserCity(data.city)
      setUserCountry(data.country)
      setUserCoords({ lat: data.lat, lng: data.lng })
    } else {
      throw new Error("Location fetch failed")
    }
  } catch (error) {
    console.error("[v0] Error fetching location:", error)
    // Fallback to São Paulo
    setUserCity("São Paulo")
    setUserCountry("Brazil")
    setUserCoords({ lat: -23.5505, lng: -46.6333 })
  } finally {
    setIsLoadingLocation(false)
  }
}

  // Warning component for all stages
  const LimitWarningBanner = () => (
    <div className="w-full max-w-md mx-auto mb-4 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
      <p className="text-center text-xs text-yellow-400">
        <AlertTriangle className="inline-block mr-1 mb-0.5" size={12} />
        <span className="font-semibold">Attention:</span> You only have <span className="font-bold text-white">1 FREE search</span> per device
      </p>
    </div>
  )

  const renderStage = () => {
    // Determine the match image based on gender
    const matchImageSrc =
      investigatedGender === "Feminino"
        ? "/images/tinder-match-female.jpeg"
        : investigatedGender === "Masculino"
          ? "/images/tinder-match-male.png" // Nova imagem para o match masculino
          : "/placeholder.svg?height=300&width=200" // Placeholder para 'Outro' ou não selecionado

    switch (currentStage) {
      case 0:
        return (
          <div className="text-center space-y-8">
            <LimitWarningBanner />
            <p className="text-4xl md:text-5xl font-bold text-white tracking-wider animate-pulse">INSTA CHECK 3</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider animate-pulse">
              💔 FEELING BETRAYED?
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              “You deserve to know the truth. Even the conversations he tried to hide…”
            </p>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Discover hidden profiles, private messages, and suspicious likes on:
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-3xl">
              <div className="flex flex-col items-center gap-2">
                <Camera className="text-purple-500" size={56} />
                <span className="text-white text-base">Instagram</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Facebook className="text-blue-600" size={56} />
                <span className="text-white text-base">Facebook</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Flame className="text-red-500" size={56} />
                <span className="text-white text-base">Tinder</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MessageCircle className="text-green-500" size={56} />
                <span className="text-white text-base">WhatsApp</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MapPin className="text-orange-500" size={56} />
                <span className="text-white text-base">Location</span>
              </div>
            </div>
            <Button
              onClick={nextStage}
              className="mt-10 px-10 py-5 text-xl font-bold uppercase bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg hover:from-pink-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 animate-pulse-slow"
            >
              ➡️ START SCANNING
            </Button>
          </div>
        )
      case 1: // Age, Gender, Location, and Phone
        return (
          <div className="text-center space-y-6 px-4">
            <LimitWarningBanner />
            <h2 className="text-2xl md:text-4xl font-bold text-white animate-fade-in">
              📊 <span className="text-pink-400">TARGET</span> PROFILE
            </h2>
            <p className="text-lg md:text-xl text-gray-300 animate-fade-in-delay-1">
              Complete the investigation profile for enhanced analysis
            </p>
            <div className="w-full max-w-sm mx-auto space-y-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  placeholder="Age of the investigated person"
                  value={investigatedAge}
                  onChange={(e) => setInvestigatedAge(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500"
                  min="1"
                  max="120"
                />
              </div>
              <div className="relative">
                <Gender className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={investigatedGender}
                  onChange={(e) => {
                    const selectedGender = e.target.value
                    setInvestigatedGender(selectedGender)

                    try {
                      const tipo =
                        selectedGender === "Masculino"
                          ? "parceiro"
                          : selectedGender === "Feminino"
                            ? "parceira"
                            : "outro"
                      localStorage.setItem("alvoMonitoramento", `instagram-${tipo}`)
                      console.log("[v0] Saved to localStorage:", `instagram-${tipo}`)
                    } catch (e) {
                      console.error("[v0] Error saving to localStorage:", e)
                    }
                  }}
                  className="w-full p-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-base appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="Masculino">Male</option>
                  <option value="Feminino">Female</option>
                  <option value="Outro">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Location (e.g., New York, USA)"
                  value={investigatedLocation}
                  onChange={(e) => setInvestigatedLocation(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <div className="flex">
                  <select
                    value={investigatedPhone.split(" ")[0] || "+1"}
                    onChange={(e) => {
                      const countryCode = e.target.value
                      const phoneNumber = investigatedPhone.split(" ")[1] || ""
                      const fullPhone = `${countryCode} ${phoneNumber}`
                      setInvestigatedPhone(fullPhone)

                      if (debounceTimer.current) {
                        clearTimeout(debounceTimer.current)
                      }

                      // Update location based on country code and phone
                      setIsLoadingLocation(true)
                      const timer = setTimeout(() => {
                        const fullNumber = countryCode.replace("+", "") + phoneNumber.replace(/\D/g, "")
                        const location = getLocationFromPhone(fullNumber)
                        
                        if (location) {
                          setUserCity(location.city)
                          setUserCountry(location.country)
                          setUserCoords({ lat: location.lat, lng: location.lng })
                        } else {
                          // Fallback to country code location
                          const countryCodeDigits = countryCode.replace("+", "")
                          const countryLocation = COUNTRY_CODES[countryCodeDigits]
                          if (countryLocation) {
                            setUserCity(countryLocation.city)
                            setUserCountry(countryLocation.country)
                            setUserCoords({ lat: countryLocation.lat, lng: countryLocation.lng })
                          }
                        }
                        setIsLoadingLocation(false)

                        if (phoneNumber && phoneNumber.length >= 8) {
                          fetchWhatsAppPhoto(phoneNumber, countryCode.replace("+", ""))
                        }
                      }, 500)
                      debounceTimer.current = timer
                    }}
                    className="w-24 p-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-l-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+7">🇷🇺 +7</option>
                    <option value="+20">🇪🇬 +20</option>
                    <option value="+27">🇿🇦 +27</option>
                    <option value="+30">🇬🇷 +30</option>
                    <option value="+31">🇳🇱 +31</option>
                    <option value="+32">🇧🇪 +32</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+36">🇭🇺 +36</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+40">🇷🇴 +40</option>
                    <option value="+41">🇨🇭 +41</option>
                    <option value="+43">🇦🇹 +43</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+45">🇩🇰 +45</option>
                    <option value="+46">🇸🇪 +46</option>
                    <option value="+47">🇳🇴 +47</option>
                    <option value="+48">🇵🇱 +48</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+51">🇵🇪 +51</option>
                    <option value="+52">🇲🇽 +52</option>
                    <option value="+53">🇨🇺 +53</option>
                    <option value="+54">🇦🇷 +54</option>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+56">🇨🇱 +56</option>
                    <option value="+57">🇨🇴 +57</option>
                    <option value="+58">🇻🇪 +58</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+62">🇮🇩 +62</option>
                    <option value="+63">🇵🇭 +63</option>
                    <option value="+64">🇳🇿 +64</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+66">🇹🇭 +66</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+84">🇻🇳 +84</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+90">🇹🇷 +90</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+92">🇵🇰 +92</option>
                    <option value="+93">🇦🇫 +93</option>
                    <option value="+94">🇱🇰 +94</option>
                    <option value="+95">🇲🇲 +95</option>
                    <option value="+98">🇮🇷 +98</option>
                    <option value="+212">🇲🇦 +212</option>
                    <option value="+213">🇩🇿 +213</option>
                    <option value="+216">🇹🇳 +216</option>
                    <option value="+218">🇱🇾 +218</option>
                    <option value="+220">🇬🇲 +220</option>
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+222">🇲🇷 +222</option>
                    <option value="+223">🇲🇱 +223</option>
                    <option value="+224">🇬🇳 +224</option>
                    <option value="+225">🇨🇮 +225</option>
                    <option value="+226">🇧🇫 +226</option>
                    <option value="+227">🇳🇪 +227</option>
                    <option value="+228">توج +228</option>
                    <option value="+229">🇧🇯 +229</option>
                    <option value="+230">🇲🇺 +230</option>
                    <option value="+231">🇱🇷 +231</option>
                    <option value="+232">🇸🇱 +232</option>
                    <option value="+233">🇬🇭 +233</option>
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+235">🇹🇩 +235</option>
                    <option value="+236">🇨🇫 +236</option>
                    <option value="+237">🇨🇲 +237</option>
                    <option value="+238">🇨🇻 +238</option>
                    <option value="+239">🇸🇹 +239</option>
                    <option value="+240">🇬🇶 +240</option>
                    <option value="+241">🇬🇦 +241</option>
                    <option value="+242">🇨🇬 +242</option>
                    <option value="+243">🇨🇩 +243</option>
                    <option value="+244">🇦🇴 +244</option>
                    <option value="+245">🇬🇼 +245</option>
                    <option value="+246">🇮🇴 +246</option>
                    <option value="+248">🇸🇨 +248</option>
                    <option value="+249">🇸🇩 +249</option>
                    <option value="+250">🇷🇼 +250</option>
                    <option value="+251">🇪🇹 +251</option>
                    <option value="+252">🇸🇴 +252</option>
                    <option value="+253">🇩🇯 +253</option>
                    <option value="+254">🇰🇪 +254</option>
                    <option value="+255">🇹🇿 +255</option>
                    <option value="+256">🇺🇬 +256</option>
                    <option value="+257">🇧🇮 +257</option>
                    <option value="+258">🇲🇿 +258</option>
                    <option value="+260">🇿🇲 +260</option>
                    <option value="+261">🇲🇬 +261</option>
                    <option value="+262">🇷🇪 +262</option>
                    <option value="+263">🇿🇼 +263</option>
                    <option value="+264">🇳🇦 +264</option>
                    <option value="+265">🇲🇼 +265</option>
                    <option value="+266">🇱🇸 +266</option>
                    <option value="+267">🇧🇼 +267</option>
                    <option value="+268">🇸🇿 +268</option>
                    <option value="+269">🇰🇲 +269</option>
                    <option value="+290">🇸🇭 +290</option>
                    <option value="+291">🇪🇷 +291</option>
                    <option value="+297">🇦🇼 +297</option>
                    <option value="+298">🇫🇴 +298</option>
                    <option value="+299">🇬🇱 +299</option>
                    <option value="+350">🇬🇮 +350</option>
                    <option value="+351">🇵🇹 +351</option>
                    <option value="+352">🇱🇺 +352</option>
                    <option value="+353">🇮🇪 +353</option>
                    <option value="+354">🇮🇸 +354</option>
                    <option value="+355">🇦🇱 +355</option>
                    <option value="+356">🇲🇹 +356</option>
                    <option value="+357">🇨🇾 +357</option>
                    <option value="+358">🇫🇮 +358</option>
                    <option value="+359">🇧🇬 +359</option>
                    <option value="+370">🇱🇹 +370</option>
                    <option value="+371">🇱🇻 +371</option>
                    <option value="+372">🇪🇪 +372</option>
                    <option value="+373">🇲🇩 +373</option>
                    <option value="+374">🇦🇲 +374</option>
                    <option value="+375">🇧🇾 +375</option>
                    <option value="+376">🇦🇩 +376</option>
                    <option value="+377">🇲🇨 +377</option>
                    <option value="+378">🇸🇲 +378</option>
                    <option value="+380">🇺🇦 +380</option>
                    <option value="+381">🇷🇸 +381</option>
                    <option value="+382">🇲🇪 +382</option>
                    <option value="+383">🇽🇰 +383</option>
                    <option value="+385">🇭🇷 +385</option>
                    <option value="+386">🇸🇮 +386</option>
                    <option value="+387">🇧🇦 +387</option>
                    <option value="+389">🇲🇰 +389</option>
                    <option value="+420">🇨🇿 +420</option>
                    <option value="+421">🇸🇰 +421</option>
                    <option value="+423">🇱🇮 +423</option>
                    <option value="+500">🇫🇰 +500</option>
                    <option value="+501">🇧🇿 +501</option>
                    <option value="+502">🇬🇹 +502</option>
                    <option value="+503">🇸🇻 +503</option>
                    <option value="+504">🇭🇳 +504</option>
                    <option value="+505">🇳🇮 +505</option>
                    <option value="+506">🇨🇷 +506</option>
                    <option value="+507">🇵🇦 +507</option>
                    <option value="+508">🇵🇲 +508</option>
                    <option value="+509">🇭🇹 +509</option>
                    <option value="+590">🇬🇵 +590</option>
                    <option value="+591">🇧🇴 +591</option>
                    <option value="+592">🇬🇾 +592</option>
                    <option value="+593">🇪🇨 +593</option>
                    <option value="+594">🇬🇫 +594</option>
                    <option value="+595">🇵🇾 +595</option>
                    <option value="+596">🇲🇶 +596</option>
                    <option value="+597">🇸🇷 +597</option>
                    <option value="+598">🇺🇾 +598</option>
                    <option value="+599">🇨🇼 +599</option>
                    <option value="+670">🇹🇱 +670</option>
                    <option value="+672">🇦🇶 +672</option>
                    <option value="+673">🇧🇳 +673</option>
                    <option value="+674">🇳🇷 +674</option>
                    <option value="+675">🇵🇬 +675</option>
                    <option value="+676">توج +676</option>
                    <option value="+677">🇸🇧 +677</option>
                    <option value="+678">🇻🇺 +678</option>
                    <option value="+679">🇫🇯 +679</option>
                    <option value="+680">🇵🇼 +680</option>
                    <option value="+681">🇼🇫 +681</option>
                    <option value="+682">🇨🇰 +682</option>
                    <option value="+683">🇳🇺 +683</option>
                    <option value="+684">🇦🇸 +684</option>
                    <option value="+685">🇼🇸 +685</option>
                    <option value="+686">🇰🇮 +686</option>
                    <option value="+687">🇳🇨 +687</option>
                    <option value="+688">توج +688</option>
                    <option value="+689">🇵🇫 +689</option>
                    <option value="+690">🇹🇰 +690</option>
                    <option value="+691">🇫🇲 +691</option>
                    <option value="+692">🇲🇭 +692</option>
                    <option value="+850">🇰🇵 +850</option>
                    <option value="+852">🇭🇰 +852</option>
                    <option value="+853">🇲🇴 +853</option>
                    <option value="+855">🇰🇭 +855</option>
                    <option value="+856">🇱🇦 +856</option>
                    <option value="+880">🇧🇩 +880</option>
                    <option value="+886">🇹🇼 +886</option>
                    <option value="+960">🇲🇻 +960</option>
                    <option value="+961">🇱🇧 +961</option>
                    <option value="+962">🇯🇴 +962</option>
                    <option value="+963">🇸🇾 +963</option>
                    <option value="+964">🇮🇶 +964</option>
                    <option value="+965">🇰🇼 +965</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+967">🇾🇪 +967</option>
                    <option value="+968">🇴🇲 +968</option>
                    <option value="+970">🇵🇸 +970</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+972">🇮🇱 +972</option>
                    <option value="+973">🇧🇭 +973</option>
                    <option value="+974">🇶🇦 +974</option>
                    <option value="+975">🇧🇹 +975</option>
                    <option value="+976">🇲🇳 +976</option>
                    <option value="+977">🇳🇵 +977</option>
                    <option value="+992">🇹🇯 +992</option>
                    <option value="+993">🇹🇲 +993</option>
                    <option value="+994">🇦🇿 +994</option>
                    <option value="+995">🇬🇪 +995</option>
                    <option value="+996">🇰🇬 +996</option>
                    <option value="+998">🇺🇿 +998</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={investigatedPhone.split(" ")[1] || ""}
                    onChange={(e) => {
                      const countryCode = investigatedPhone.split(" ")[0] || "+1"
                      const fullPhone = `${countryCode} ${e.target.value}`
                      setInvestigatedPhone(fullPhone)

                      if (debounceTimer.current) {
                        clearTimeout(debounceTimer.current)
                      }

                      // Only start fetching after user stops typing and has entered enough digits
                      const phoneDigits = e.target.value.replace(/\D/g, "")
                      if (phoneDigits.length >= 8) {
                        // Wait 1.5 seconds after user stops typing
                        const timer = setTimeout(async () => {
                          // Fetch real location via IP API (same as before)
                          fetchUserLocation()
                          
                          // Also fetch WhatsApp photo
                          fetchWhatsAppPhoto(e.target.value, countryCode.replace("+", ""))
                        }, 1500) // Wait 1.5s after user stops typing
                        debounceTimer.current = timer
                      }
                    }}
                    className="flex-1 p-3 bg-gray-800/50 border border-gray-700 border-l-0 rounded-r-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {(whatsappPhoto || userCity || isLoadingLocation) && (investigatedPhone.split(" ")[1]?.replace(/\D/g, "").length >= 8) && (
                <div className="mt-4 p-4 bg-gray-800/30 border border-gray-700 rounded-lg space-y-3">
                  {/* WhatsApp section - only show when photo is loaded */}
                  {whatsappPhoto && (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                        <img
                          src={whatsappPhoto}
                          alt="WhatsApp Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/whatsapp-checkmark.jpeg"
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-400 font-medium">
                          WhatsApp Profile Found
                        </p>
                        <p className="text-xs text-gray-400">
                          Profile detected
                        </p>
                      </div>
                    </div>
                  )}

                  {(userCity || isLoadingLocation) && (
                    <div className="space-y-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
                          {isLoadingLocation ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                          ) : (
                            <MapPin className="text-green-400" size={20} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-green-400 font-medium">
                            {isLoadingLocation ? "Detecting location..." : "Suspicious Location Found"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {isLoadingLocation ? "Analyzing IP address..." : `${userCity}, ${userCountry}`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Map Display - Only show after phone number is entered */}
                      {userCoords && !isLoadingLocation && investigatedPhone.split(" ")[1]?.length >= 8 && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-600">
                          <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${userCoords.lng - 0.05}%2C${userCoords.lat - 0.03}%2C${userCoords.lng + 0.05}%2C${userCoords.lat + 0.03}&layer=mapnik&marker=${userCoords.lat}%2C${userCoords.lng}`}
                            className="w-full h-full border-0"
                            style={{ filter: "hue-rotate(180deg) invert(90%)" }}
                          />
                          <div className="absolute top-2 left-2 bg-red-600/90 px-2 py-1 rounded text-xs font-bold text-white animate-pulse">
                            LIVE TRACKING
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-gray-300">
                            {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={nextStage}
              disabled={!investigatedAge || !investigatedGender || !investigatedLocation || !investigatedPhone}
              className="mt-8 px-8 py-4 text-lg font-bold uppercase bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg hover:from-pink-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 animate-pulse-slow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➡️ CONTINUE
            </Button>
          </div>
        )
case 2: // OLD STAGE 1: Upload and Handle
  return (
  <div className="text-center space-y-8">
  <LimitWarningBanner />
  <p className="text-3xl md:text-4xl font-bold text-white animate-pulse">
  📸 Select a photo for facial analysis...
            </p>
            <div className="relative w-full max-w-md mx-auto border-2 border-dashed border-gray-600 p-6 rounded-lg text-gray-400 flex flex-col items-center justify-center gap-3 bg-gray-800/30 hover:border-gray-500 transition-colors duration-200 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={isAnalyzing}
              />
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-h-40 max-w-full object-contain rounded-md"
                />
              ) : (
                <Upload size={40} className="text-gray-500" />
              )}
              <p className="text-base">
                {fileName ? `File selected: ${fileName}` : "Drag and drop or click to select"}
              </p>
              {fileName && !isAnalyzing && (
                <div className="mt-3 text-green-400 flex items-center gap-2 animate-fade-in">
                  <ScanEye size={20} />
                  <span className="text-lg">Ready to scan!</span>
                </div>
              )}
            </div>

            <p className="text-2xl md:text-3xl font-bold text-white animate-pulse mt-8">
              🎯 TARGET IDENTIFICATION: Enter the target Instagram
            </p>
            <div className="relative w-full max-w-md mx-auto">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="@target_user"
                value={investigatedHandle}
                onChange={(e) => handleInstagramHandleChange(e.target.value)}
                className="w-full p-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isAnalyzing}
              />
              {isLoadingInstagram && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
                </div>
              )}
            </div>

            {/* Password Cracking Animation */}
            {(isCrackingPassword || passwordCracked) && investigatedHandle.length > 3 && (
              <div className="w-full max-w-md mx-auto mt-4 animate-fade-in">
                <div className="p-4 bg-black/80 border border-green-500/50 rounded-lg font-mono text-sm overflow-hidden">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/30">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-green-500 text-xs ml-2">instacheck@cracker:~$</span>
                  </div>

                  <p className="text-green-400 mb-1">
                    {'>'} Target: <span className="text-white">{investigatedHandle}</span>
                  </p>
                  <p className="text-green-400 mb-1">
                    {'>'} Protocol: <span className="text-yellow-400">BRUTE-FORCE v3.7</span>
                  </p>

                  {isCrackingPassword && (
                    <>
                      <p className="text-red-400 animate-pulse mb-1">
                        {'>'} STATUS: CRACKING PASSWORD...
                      </p>
                      <div className="flex items-center gap-2 mt-2 p-2 bg-gray-900/80 rounded border border-green-500/20">
                        <span className="text-gray-500">Password:</span>
                        <span className="text-green-300 tracking-widest">{crackingText}</span>
                        <span className="animate-pulse text-green-500">|</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
                        <span className="text-yellow-400 text-xs animate-pulse">Decrypting hashes...</span>
                      </div>
                    </>
                  )}

                  {passwordCracked && (
                    <>
                      <p className="text-green-400 mb-1">
                        {'>'} STATUS: <span className="text-green-300 font-bold">PASSWORD CRACKED!</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2 p-2 bg-green-900/30 rounded border border-green-500/40">
                        <span className="text-gray-500">Password:</span>
                        <span className="text-green-300 tracking-widest">********</span>
                        <span className="text-green-500 ml-auto">UNLOCKED</span>
                      </div>
                      <p className="text-green-400 mt-2 text-xs">
                        {'>'} Access granted. Loading profile data...
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {instagramProfile && !isLoadingInstagram && passwordCracked && (
              <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg max-w-md mx-auto animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center relative flex-shrink-0">
                    {instagramImageLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : instagramProfile.profile_pic_url && !instagramImageError ? (
                      <>
                        <img
                          src={
                            instagramImageError
                              ? instagramProfile.profile_pic_url
                              : `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                          }
                          alt={instagramProfile.username}
                          className="w-full h-full object-cover"
                          loading="eager"
                          crossOrigin="anonymous"
                          onLoad={() => {
                            console.log("[v0] Profile picture loaded successfully")
                            setInstagramImageLoading(false)
                            setInstagramImageError(false)
                          }}
                          onError={(e) => {
                            console.log("[v0] Trying fallback image source")
                            if (!instagramImageError) {
                              // Tenta carregar direto da URL
                              setInstagramImageError(true)
                              const img = e.target as HTMLImageElement
                              img.src = instagramProfile.profile_pic_url
                            } else {
                              setInstagramImageLoading(false)
                            }
                          }}
                        />
                      </>
                    ) : (
                      <Camera className="text-white" size={24} />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-base text-white font-semibold">@{instagramProfile.username}</p>
                    <p className="text-sm text-gray-300 mt-1">
                      {instagramProfile.media_count} posts •{" "}
                      {typeof instagramProfile.follower_count === "number"
                        ? instagramProfile.follower_count.toLocaleString()
                        : instagramProfile.follower_count || "0"}{" "}
                      followers
                    </p>
                    {instagramProfile.biography && (
                      <p className="text-sm text-gray-300 mt-2">{instagramProfile.biography}</p>
                    )}
                  </div>
                </div>
                
                {/* Real Instagram Posts Grid */}
                {instagramPosts && instagramPosts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-purple-400 font-medium mb-2">Recent Posts</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {instagramPosts.slice(0, 6).map((post: any, index: number) => (
                        <div key={post.id || index} className="relative aspect-square rounded overflow-hidden">
                          <img
                            src={`/api/instagram-image-proxy?url=${encodeURIComponent(post.media_url)}`}
                            alt={`Post ${index + 1}`}
                            className="w-full h-full object-cover filter blur-[2px]"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Lock size={14} className="text-white/80" />
                          </div>
                          <div className="absolute bottom-0.5 left-0.5 flex items-center gap-0.5 bg-black/60 px-1 py-0.5 rounded text-[10px]">
                            <Heart size={8} className="text-pink-400" />
                            <span className="text-white">{post.like_count > 1000 ? `${(post.like_count / 1000).toFixed(1)}K` : post.like_count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {instagramProfile?.is_private && (
                      <p className="text-[10px] text-yellow-400/70 flex items-center gap-1 mt-2">
                        <Lock size={10} /> Private - Limited access
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {isAnalyzing && (
              <div className="w-full max-w-md mx-auto mt-8 space-y-3 animate-fade-in relative p-4 bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
                {/* Background grid for scanning effect */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(90deg, transparent 1px, #10b981 1px),
                      linear-gradient(180deg, #10b981 1px, transparent 1px)
                    `,
                    backgroundSize: "20px 20px",
                    animation: "grid-scan 2s linear infinite",
                  }}
                />
                <div className="relative z-10">
                  <p className="text-xl font-bold text-white font-mono">
                    <span className="text-green-400">[SCANNING]</span> {analysisMessage} ({analysisProgress}%)
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-red-600 h-3 rounded-full transition-all duration-200 ease-linear"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-lg font-bold text-gray-300 animate-pulse mt-3 font-mono">
                    <span className="text-yellow-400">[STATUS]</span> Searching for connected accounts...
                  </p>
                  {analysisProgress >= 60 && (
                    <div className="flex items-center gap-3 mt-3 p-2 bg-green-900/30 rounded-lg border border-green-700 animate-fade-in">
                      <img
                        src={whatsappPhoto || "/placeholder.svg"}
                        alt="Target"
                        className="w-8 h-8 rounded-full object-cover border-2 border-green-400"
                      />
                      <p className="text-lg font-bold text-green-400 font-medium">
                        <span className="text-green-300">[PHONE FOUND]</span> {investigatedPhone}
                      </p>
                      <CheckCircle size={20} className="text-green-400" />
                    </div>
                  )}

                  {/* New section for uploaded photo appearing multiple times */}
                  {imagePreviewUrl && (
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, i) => {
                        let src = "/placeholder.svg" // Default placeholder
                        const currentPlaceholders =
                          investigatedGender === "Feminino" ? femalePlaceholders : malePlaceholders

                        // Determine the source based on analysis progress and square index
                        if (isAnalyzing && analysisProgress < 90) {
                          // During active analysis, all squares cycle through placeholders
                          src = currentPlaceholders[(animationFrame + i) % currentPlaceholders.length]
                        } else if (isAnalyzing && analysisProgress >= 90) {
                          // When analysis is almost done, the 9th square shows the uploaded image with checkmark
                          if (i === 8) {
                            src = imagePreviewUrl || "/placeholder.svg" // Ensure it's the uploaded image
                          } else {
                            // Other squares freeze on a specific placeholder from their list
                            src = currentPlaceholders[i % currentPlaceholders.length]
                          }
                        } else {
                          // Before analysis starts or if not analyzing, default placeholders
                          src = currentPlaceholders[i % currentPlaceholders.length]
                        }

                        return (
                          <div key={i} className="relative w-full h-24 rounded-md overflow-hidden">
                            <img
                              src={src || "/placeholder.svg"}
                              alt={`Scanned image ${i}`}
                              className={`w-full h-full object-cover ${
                                isAnalyzing && analysisProgress < 90 ? "animate-scan-image-pulse" : ""
                              }`}
                              style={{ animationDelay: `${i * 0.1}s` }} // Staggered animation
                            />
                            {i === 8 &&
                              isAnalyzing &&
                              analysisProgress >= 90 && ( // Show checkmark on the 9th image when analysis is almost done
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <CheckCircle size={40} className="text-green-500 animate-fade-in" />
                                </div>
                              )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={startAnalysis}
              disabled={!fileName || !investigatedHandle || isAnalyzing} // Disable until file AND handle are present
              className="mt-10 px-10 py-5 text-xl font-bold uppercase bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg hover:from-pink-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 animate-pulse-slow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? "ANALYZING..." : "➡️ CONTINUE"}
            </Button>
          </div>
        )
case 3: // OLD STAGE 2: Detection and Notifications
  return (
  <div className="text-center space-y-8">
  <LimitWarningBanner />
  <div className="grid gap-3 text-left max-w-xl mx-auto">
  <p className="text-lg md:text-xl text-green-400 flex items-center gap-2 animate-fade-in">
  <CheckCircle className="text-green-400" size={28} /> Instagram account found. Last access: 3h ago.
              </p>
              <p className="text-lg md:text-xl text-red-400 flex items-center gap-2 animate-fade-in-delay-1">
                <Flame className="text-red-400" size={28} /> Hidden Tinder profile detected.
              </p>
              <p className="text-lg md:text-xl text-blue-400 flex items-center gap-2 animate-fade-in-delay-2">
                {imagePreviewUrl ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-blue-400 flex items-center justify-center">
                    <img
                      src={imagePreviewUrl || "/placeholder.svg"}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                    <MessageCircle
                      size={18}
                      className="absolute text-white bg-blue-500 rounded-full p-0.5 -bottom-1 -right-1"
                    />
                  </div>
                ) : (
                  <MessageCircle className="text-blue-400" size={28} />
                )}
                Private messages found.
              </p>
              <p className="text-lg md:text-xl text-pink-400 flex items-center gap-2 animate-fade-in-delay-3">
                <Heart className="text-pink-400" size={28} /> Suspicious likes identified on old posts.
              </p>
              {investigatedLocation && (
                <p className="text-lg md:text-xl text-purple-400 flex items-center gap-2 animate-fade-in-delay-4">
                  <MapPin className="text-purple-400" size={28} /> Location detected: {investigatedLocation}.
                </p>
              )}
              {analysisProgress >= 60 && (
                <div className="flex items-center gap-3 p-3 bg-green-900/30 rounded-lg border border-green-700 animate-fade-in-delay-3">
                  {whatsappPhoto && (
                    <img
                      src={whatsappPhoto || "/placeholder.svg"}
                      alt="WhatsApp Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-green-400"
                    />
                  )}
                  <div>
                    <p className="text-lg md:text-xl text-green-400 flex items-center gap-2">
                      <Phone className="text-green-400" size={28} /> PHONE FOUND
                    </p>
                    <p className="text-sm text-gray-300">{investigatedPhone}</p>
                  </div>
                </div>
              )}
              <div className="relative mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700 animate-fade-in-delay-4">
                <p className="text-base text-white font-mono">
                  <span className="text-green-400">[SYSTEM_LOG]</span> New activity detected:
                </p>
                <p className="text-base text-white font-mono ml-3">
                  <span className="text-blue-400">[INSTAGRAM]</span> New message from @
                  {investigatedGender === "Feminino" ? "alex22" : "alexia_30"}.
                </p>
                <p className="text-base text-white font-mono ml-3">
                  <span className="text-blue-400">[INSTAGRAM]</span> @
                  {investigatedGender === "Feminino" ? "rodrigo.b" : "izes"} liked your photo.
                </p>
              </div>

              {/* Instagram-style notifications */}
              <div className="mt-6 space-y-3 text-left">
                {/* Notification 1: Liked Photo */}
                <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-5">
                  <img
                    src={
                      investigatedGender === "Feminino"
                        ? "/images/male-placeholder-1.jpg"
                        : "/images/female-placeholder-1.jpeg"
                    }
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-pink-500"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-semibold">
                        @{investigatedGender === "Feminino" ? "alex22" : "alexia_30"}
                      </span>{" "}
                      liked your photo
                    </p>
                    <p className="text-gray-400 text-xs">2 minutes ago</p>
                  </div>
                  <Heart className="text-pink-500" size={16} />
                </div>

                {/* Notification 2: New Message */}
                <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-6">
                  <img
                    src={
                      investigatedGender === "Feminino"
                        ? "/images/male-placeholder-2.jpg"
                        : "/images/female-placeholder-2.jpeg"
                    }
                    alt="Message Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-semibold">@{investigatedGender === "Feminino" ? "rodrigo.b" : "izes"}</span>{" "}
                      sent you a message
                    </p>
                    <p className="text-gray-400 text-xs">5 minutes ago</p>
                  </div>
                  <MessageCircle className="text-blue-500" size={16} />
                </div>

                {/* Notification 3: Is typing... */}
                <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-7">
                  <img
                    src={
                      instagramProfile?.profile_pic_url
                        ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                        : imagePreviewUrl || "/placeholder.svg"
                    }
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-500"
                    crossOrigin="anonymous"
                  />
                  <div>
                    <p className="text-sm text-white font-bold">
                      {investigatedHandle || "@alvo"}
                      <span className="text-gray-400 font-normal ml-1">is typing...</span>
                    </p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></span>
                </div>

                {/* Notification 4: Message received after typing (simulating "digita de novo") */}
                <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-8">
                  <img
                    src={
                      instagramProfile?.profile_pic_url
                        ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                        : imagePreviewUrl || "/placeholder.svg"
                    }
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    crossOrigin="anonymous"
                  />
                  <div>
                    <p className="text-sm text-white font-bold">
                      {investigatedHandle || "@alvo"}
                      <span className="text-gray-400 font-normal ml-1">sent a new message.</span>
                    </p>
                    <p className="text-xs text-gray-500">1 minute ago</p>
                  </div>
                  <MessageCircle size={20} className="text-blue-500 ml-auto" />
                </div>
              </div>
            </div>

            {/* Original section for blurred images and comments - adjusted delay */}
            <div className="mt-6 space-y-5 text-left">
              <p className="text-xl md:text-2xl text-white font-bold animate-fade-in-delay-9">
                <span className="text-red-400">INTERCEPTED:</span> Suspicious Likes from {investigatedHandle || "@alvo"}
              </p>

              {investigatedGender === "Feminino" ? (
                <>
                  {/* Male Photos for Female Investigation */}
                  {/* Liked Photo 1 - Man at beach */}
                  <div className="flex flex-col gap-2 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-10">
                    <div className="relative w-full h-64 rounded-md overflow-hidden">
                      <img
                        src="/images/male-photo-beach.png"
                        alt="Liked Photo 1"
                        className="w-full h-full object-cover filter blur-sm"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock size={48} className="text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Heart size={16} className="text-pink-400" />
                      <span className="text-sm text-gray-300">2.1K likes</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={
                          instagramProfile?.profile_pic_url
                            ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                            : imagePreviewUrl || "/placeholder.svg"
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-500"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <p className="text-sm text-gray-300 font-bold">{investigatedHandle || "@alvo"}</p>
                        <p className="text-sm text-white">"very beautiful, I still want to meet you in person"</p>
                      </div>
                    </div>
                  </div>

                  {/* Liked Photo 2 - Man in gym */}
                  <div className="flex flex-col gap-2 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-11">
                    <div className="relative w-full h-64 rounded-md overflow-hidden">
                      <img
                        src="/images/male-photo-gym.png"
                        alt="Liked Photo 2"
                        className="w-full h-full object-cover filter blur-sm"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock size={48} className="text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Heart size={16} className="text-pink-400" />
                      <span className="text-sm text-gray-300">3.2K likes</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={
                          instagramProfile?.profile_pic_url
                            ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                            : imagePreviewUrl || "/placeholder.svg"
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-500"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <p className="text-sm text-gray-300 font-bold">{investigatedHandle || "@alvo"}</p>
                        <p className="text-white text-sm">"What a handsome man!"</p>
                      </div>
                    </div>
                  </div>

                  {/* Liked Photo 3 - Man bathroom selfie */}
                  <div className="flex flex-col gap-2 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-12">
                    <div className="relative w-full h-64 rounded-md overflow-hidden">
                      <img
                        src="/images/male-photo-bathroom.png"
                        alt="Liked Photo 3"
                        className="w-full h-full object-cover filter blur-sm"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock size={48} className="text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Heart size={16} className="text-pink-400" />
                      <span className="text-sm text-gray-300">4.5K likes</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={
                          instagramProfile?.profile_pic_url
                            ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                            : imagePreviewUrl || "/placeholder.svg"
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-500"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <p className="text-sm text-gray-300 font-bold">{investigatedHandle || "@alvo"}</p>
                        <p className="text-white text-sm">
                          "My friend, you're getting more handsome every day, I miss you."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Liked Photo 4 - Man bathroom selfie 2 */}
                  <div className="flex flex-col gap-2 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-13">
                    <div className="relative w-full h-64 rounded-md overflow-hidden">
                      <img
                        src="/images/male-photo-blue-eyes.png"
                        alt="Liked Photo 4"
                        className="w-full h-full object-cover filter blur-sm"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock size={48} className="text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Heart size={16} className="text-pink-400" />
                      <span className="text-sm text-gray-300">1.8K likes</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={
                          instagramProfile?.profile_pic_url
                            ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                            : imagePreviewUrl || "/placeholder.svg"
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-500"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <p className="text-sm text-gray-300 font-bold">{investigatedHandle || "@alvo"}</p>
                        <p className="text-white text-sm">"Hi handsome, what city are you from?"</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Female Photos for Male/Other Investigation */}
                  {/* Liked Photo 1 */}
                  <div className="flex flex-col gap-2 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-10">
                    <div className="relative w-full h-64 rounded-md overflow-hidden">
                      <img
                        src="/images/liked-photo-princess.png"
                        alt="Liked Photo 1"
                        className="w-full h-full object-cover filter blur-sm"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock size={48} className="text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Heart size={16} className="text-pink-400" />
                      <span className="text-sm text-gray-300">1.2K likes</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={
                          instagramProfile?.profile_pic_url
                            ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                            : imagePreviewUrl || "/placeholder.svg"
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-500"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <p className="text-sm text-gray-300 font-bold">{investigatedHandle || "@alvo"}</p>
                        <p className="text-white text-sm">"What a wonderful princess."</p>
                      </div>
                    </div>
                  </div>

                  {/* Liked Photo 2 */}
                  <div className="flex flex-col gap-2 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-11">
                    <div className="relative w-full h-64 rounded-md overflow-hidden">
                      <img
                        src="/images/liked-photo-2.jpeg"
                        alt="Liked Photo 2"
                        className="w-full h-full object-cover filter blur-sm"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock size={48} className="text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Heart size={16} className="text-pink-400" />
                      <span className="text-sm text-gray-300">2.4K likes</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={
                          instagramProfile?.profile_pic_url
                            ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                            : imagePreviewUrl || "/placeholder.svg"
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-500"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <p className="text-sm text-gray-300 font-bold">{investigatedHandle || "@alvo"}</p>
                        <p className="text-sm text-white"> "Those sunsets are unbeatable 🌅"</p>
                      </div>
                    </div>
                  </div>

                  {/* Liked Photo 3 - Carousel */}
                  <CarouselPost3 
                    instagramProfile={instagramProfile}
                    imagePreviewUrl={imagePreviewUrl}
                    investigatedHandle={investigatedHandle}
                  />

                  {/* Liked Photo 4 */}
                  <div className="flex flex-col gap-2 p-3 bg-gray-800/40 rounded-lg border border-gray-700 animate-fade-in-delay-13">
                    <div className="relative w-full h-64 rounded-md overflow-hidden">
                      <img
                        src="/images/garotas-lindas-melhores-amigas-alegres-irmas-curtindo-a-festa.avif"
                        alt="Liked Photo 4 - Group of friends enjoying a party"
                        className="w-full h-full object-cover filter blur-sm"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Lock size={48} className="text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Heart size={16} className="text-pink-400" />
                      <span className="text-sm text-gray-300">1.5K likes</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={
                          instagramProfile?.profile_pic_url
                            ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                            : imagePreviewUrl || "/placeholder.svg"
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-500"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <p className="text-sm text-gray-300 font-bold">{investigatedHandle || "@alvo"}</p>
                        <p className="text-white text-sm"> "Great energy! Wish I was there with you all."</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={nextStage}
              className="mt-10 px-10 py-5 text-xl font-bold uppercase bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-lg hover:from-pink-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 animate-pulse-slow"
            >
              ➡️ SEE MORE
            </Button>
          </div>
        )
case 4: // NEW STAGE: Tinder Likes Screen
  return (
  <div className="flex flex-col w-full max-w-md mx-auto bg-black text-white rounded-lg shadow-lg h-[calc(100vh-4rem)] overflow-y-auto">
  <LimitWarningBanner />
  {/* Top Bar */}
            <div className="relative flex items-center justify-between p-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
              {/* Left: User Profile */}
              <div className="flex items-center gap-2 z-10">
                <img
                  src={
                    instagramProfile?.profile_pic_url
                      ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                      : imagePreviewUrl || "/user-profile-illustration.png"
                  }
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-red-500"
                  crossOrigin="anonymous"
                />
                <span className="text-white font-bold text-lg truncate max-w-[120px]">
                  {investigatedHandle || "@your_profile"}
                </span>
              </div>

              {/* Right: Secondary Navigation */}
              <div className="flex space-x-3 text-gray-400 text-xs z-10">
                <span className="font-bold text-white border-b-2 border-red-500 pb-1">5 likes</span>
                <span className="hidden sm:block">Likes sent</span>
                <span className="hidden sm:block">
                  Highlights <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full ml-0.5"></span>
                </span>
              </div>
            </div>

            <div className="text-center py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
              <span className="text-red-500 font-bold text-xl">tinder</span>
            </div>

            {/* Main Content - "Veja quem já curtiu você." */}
            <div className="p-3 text-center bg-gray-900 flex-shrink-0">
              <p className="text-base text-gray-300">see who already liked you.</p>
            </div>

            <div className="flex items-center justify-center gap-3 p-4 bg-blue-600/80 text-white font-bold text-lg rounded-lg mx-auto mt-4 w-[90%] animate-fade-in flex-shrink-0">
              <img
                src={
                  instagramProfile?.profile_pic_url
                    ? `/api/instagram-image-proxy?url=${encodeURIComponent(instagramProfile.profile_pic_url)}`
                    : imagePreviewUrl || "/super-like-sender.jpg"
                }
                alt="Super Like Sender"
                className="w-10 h-10 rounded-full object-cover border-2 border-yellow-300"
                crossOrigin="anonymous"
              />
              <span>You received a Super Like!</span>
              <Star size={24} className="text-yellow-300 fill-yellow-300" />
            </div>

            {showMissedMatch && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <X size={20} />
                  <span className="font-bold">You missed a match!</span>
                </div>
              </div>
            )}

            {/* Main Profile Card (with lock overlay and carousel) */}
            <div className="relative w-full h-96 bg-gray-800 rounded-lg overflow-hidden mx-auto mt-4 flex-shrink-0">
              {/* Photo carousel container */}
              <div className="relative w-full h-full">
                {/* Current photo */}
                <img
                  src={
                    investigatedGender === "Feminino"
                      ? currentPhotoIndex === 0
                        ? "/images/tinder-male-rafael.png"
                        : currentPhotoIndex === 1
                          ? "/images/tinder-male-2.jpg"
                          : "/images/tinder-male-3.jpg"
                      : currentPhotoIndex === 0
                        ? "/images/tinder-main-profile.jpeg"
                        : currentPhotoIndex === 1
                          ? "/images/tinder-female-2.jpg"
                          : "/images/tinder-female-3.jpg"
                  }
                  alt={`Profile Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover blur-sm"
                />

                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="bg-gray-900/80 p-3 rounded-full">
                    <Lock size={32} className="text-gray-300" />
                  </div>
                </div>

                {/* Photo indicators */}
                <div className="absolute top-2 left-2 right-2 flex gap-1">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`flex-1 h-1 rounded-full ${index === currentPhotoIndex ? "bg-white" : "bg-white/30"}`}
                    />
                  ))}
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={() => setCurrentPhotoIndex(currentPhotoIndex > 0 ? currentPhotoIndex - 1 : 2)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentPhotoIndex(currentPhotoIndex < 2 ? currentPhotoIndex + 1 : 0)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Touch/swipe area for mobile */}
                <div
                  className="absolute inset-0 cursor-pointer"
                  onTouchStart={(e) => {
                    const touch = e.touches[0]
                    setTouchStart(touch.clientX)
                  }}
                  onTouchEnd={(e) => {
                    if (!touchStart) return
                    const touch = e.changedTouches[0]
                    const diff = touchStart - touch.clientX

                    if (Math.abs(diff) > 50) {
                      // Minimum swipe distance
                      if (diff > 0) {
                        // Swipe left - next photo
                        setCurrentPhotoIndex(currentPhotoIndex < 2 ? currentPhotoIndex + 1 : 0)
                      } else {
                        // Swipe right - previous photo
                        setCurrentPhotoIndex(currentPhotoIndex > 0 ? currentPhotoIndex - 1 : 2)
                      }
                    }
                    setTouchStart(null)
                  }}
                />

                {/* Profile info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  {currentPhotoIndex === 0 && (
                    <>
                      <p className="text-xl font-bold">
                        {investigatedGender === "Feminino" ? "Rafael, 30" : "Izabelle, 30"}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-gray-300">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> Online recently...
                      </p>
                    </>
                  )}
                  {currentPhotoIndex === 1 && (
                    <>
                      <p className="text-xl font-bold">Likes sent</p>
                      <p className="text-sm text-gray-300">View activity</p>
                    </>
                  )}
                  {currentPhotoIndex === 2 && (
                    <>
                      <p className="text-xl font-bold">4 Super Likes</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Like/Nope Buttons below the main profile card */}
            <div className="flex justify-center gap-6 py-4 bg-gray-900 flex-shrink-0">
              <Button
                size="icon"
                className="w-16 h-16 rounded-full bg-gray-700/70 hover:bg-gray-600/70 border-2 border-gray-600"
              >
                <X size={32} className="text-gray-300" />
              </Button>
              <Button
                size="icon"
                className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 border-2 border-pink-500"
              >
                <Heart size={32} className="text-white" />
              </Button>
            </div>

            {/* Grid of other profiles (blurred, one with Match overlay) */}
            <div className="grid grid-cols-2 gap-2 p-2 bg-gray-950 flex-grow">
              {investigatedGender === "Feminino" ? (
                <>
                  {/* Male Profile 1 with Lock */}
                  <div className="relative w-full h-60 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/images/tinder-male-1.jpg"
                      alt="Profile 1"
                      className="w-full h-full object-cover filter blur-sm"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-900/80 p-3 rounded-full">
                        <Lock size={32} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      <p className="font-semibold text-base">bruninho</p>
                      <span className="bg-gray-700/70 px-2 py-1 rounded-full">29</span>
                      <p className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> Online recently...
                      </p>
                    </div>
                  </div>

                  {/* Male Profile 2 with Lock */}
                  <div className="relative w-full h-60 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/images/tinder-male-2.jpg"
                      alt="Profile 2"
                      className="w-full h-full object-cover filter blur-sm"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-900/80 p-3 rounded-full">
                        <Lock size={32} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      <p className="font-semibold text-base">ricardo</p>
                      <span className="bg-gray-700/70 px-2 py-1 rounded-full">31</span>
                      <p className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> Online recently...
                      </p>
                    </div>
                  </div>

                  {/* Male Profile 3 with Lock */}
                  <div className="relative w-full h-60 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/images/tinder-male-3.jpg"
                      alt="Profile 3"
                      className="w-full h-full object-cover filter blur-sm"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-900/80 p-3 rounded-full">
                        <Lock size={32} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      <p className="font-semibold text-base">alex</p>
                      <span className="bg-gray-700/70 px-2 py-1 rounded-full">27</span>
                      <p className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> Online recently...
                      </p>
                    </div>
                  </div>

                  {/* Male Profile 4 with Lock */}
                  <div className="relative w-full h-60 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/images/tinder-male-4.jpg"
                      alt="Profile 4"
                      className="w-full h-full object-cover filter blur-sm"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-900/80 p-3 rounded-full">
                        <Lock size={32} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      <p className="font-semibold text-base">marcus</p>
                      <span className="bg-gray-700/70 px-2 py-1 rounded-full">30</span>
                      <p className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> Online recently...
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Card 1: Female Image 1 with Lock */}
                  <div className="relative w-full h-60 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/images/tinder-female-1.jpg"
                      alt="Profile 1"
                      className="w-full h-full object-cover filter blur-sm"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-900/80 p-3 rounded-full">
                        <Lock size={32} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      <p className="font-semibold text-base">gabyzinha</p>
                      <span className="bg-gray-700/70 px-2 py-1 rounded-full">26</span>
                      <p className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> Online recently...
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Female Image 2 with Lock */}
                  <div className="relative w-full h-60 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/images/tinder-female-2.jpg"
                      alt="Profile 2"
                      className="w-full h-full object-cover filter blur-sm"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-900/80 p-3 rounded-full">
                        <Lock size={32} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      <p className="font-semibold text-base">renatinha</p>
                      <span className="bg-gray-700/70 px-2 py-1 rounded-full">28</span>
                      <p className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> Online recently...
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Female Image 3 with Lock */}
                  <div className="relative w-full h-60 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/images/tinder-female-3.jpg"
                      alt="Profile 3"
                      className="w-full h-full object-cover filter blur-sm"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-900/80 p-3 rounded-full">
                        <Lock size={32} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      <p className="font-semibold text-base">bruna</p>
                      <span className="bg-gray-700/70 px-2 py-1 rounded-full">25</span>
                      <p className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> Online recently...
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Female Image 4 with Lock */}
                  <div className="relative w-full h-60 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="/images/tinder-female-4.jpg"
                      alt="Profile 4"
                      className="w-full h-full object-cover filter blur-sm"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-900/80 p-3 rounded-full">
                        <Lock size={32} className="text-gray-300" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      <p className="font-semibold text-base">bruna</p>
                      <span className="bg-gray-700/70 px-2 py-1 rounded-full">24</span>
                      <p className="flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> Online recently...
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-around items-center p-2 bg-gray-900 border-t border-gray-800 flex-shrink-0">
              <div className="flex flex-col items-center text-gray-400">
                <Home size={20} />
                <span className="text-xs">Home</span>
              </div>
              <div className="flex flex-col items-center text-gray-400">
                <Compass size={20} />
                <span className="text-xs">Explore</span>
              </div>
              <div className="relative flex flex-col items-center text-red-500">
                <Heart size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  5
                </span>
                <span className="text-xs">Likes</span>
              </div>
              <div className="flex flex-col items-center text-gray-400">
                <MessageSquare size={20} />
                <span className="text-xs">Chats</span>
              </div>
              <div className="flex flex-col items-center text-gray-400">
                <User size={20} />
                <span className="text-xs">Profile</span>
              </div>
            </div>

            <Button
              onClick={nextStage}
              className="mt-3 px-10 py-5 text-xl font-bold uppercase bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg hover:from-red-700 hover:to-gray-900 transition-all duration-300 transform hover:scale-105 animate-pulse-slow flex-shrink-0"
            >
              ➡️ UNLOCK DETAILS
            </Button>
          </div>
        )
case 5: // OLD STAGE 3: Revelation - Platform Detection
  return (
  <div className="text-center space-y-6">
  <LimitWarningBanner />
  
  {/* Flashing Alert Banner */}
  <div className="bg-red-600/20 border-2 border-red-500 rounded-lg p-4 animate-pulse mx-auto max-w-md">
    <div className="flex items-center justify-center gap-2">
      <AlertTriangle className="text-red-500" size={24} />
      <span className="text-red-500 font-bold text-lg">PROFILE DETECTED ON OTHER PLATFORMS</span>
      <AlertTriangle className="text-red-500" size={24} />
    </div>
  </div>

  {/* Platform Cards */}
  <div className="space-y-4 max-w-md mx-auto">
    {/* +18 Platforms Card */}
    <div className="bg-gray-800/90 rounded-xl p-4 border border-gray-700">
      <div className="flex items-start gap-4">
        {/* User Photo Circle */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-600">
            {imagePreviewUrl ? (
              <img 
                src={imagePreviewUrl} 
                alt="Detected" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <User className="text-gray-500" size={24} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
            <Lock size={12} className="text-black" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold text-lg">+18 Platforms</h3>
          </div>
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle size={16} />
            <span className="font-semibold">Possible profiles on:</span>
          </div>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• OnlyFans, Privacy</li>
            <li>• Other adult platforms</li>
          </ul>
        </div>
      </div>
    </div>

    {/* Telegram Card */}
    <div className="bg-gray-800/90 rounded-xl p-4 border border-gray-700">
      <div className="flex items-start gap-4">
        {/* User Photo Circle */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-600">
            {imagePreviewUrl ? (
              <img 
                src={imagePreviewUrl} 
                alt="Detected" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <User className="text-gray-500" size={24} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
            <Lock size={12} className="text-black" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-400" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <h3 className="text-white font-bold text-lg">Telegram</h3>
          </div>
          <div className="mb-2">
            <span className="border-2 border-yellow-500 text-yellow-500 text-xs font-bold px-3 py-1 rounded-full">PROBABLY HIM</span>
          </div>
          <div className="bg-gray-900 rounded-lg px-3 py-2 mt-2">
            <span className="text-gray-400 font-mono text-sm">t.me/us*******</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Button
    onClick={nextStage}
    className="mt-6 px-10 py-5 text-xl font-bold uppercase bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg hover:from-red-700 hover:to-gray-900 transition-all duration-300 transform hover:scale-105 animate-pulse-slow"
  >
    VIEW MORE DETAILS
  </Button>
</div>
        )
      case 6: // OLD STAGE 4: Final CTA
        return (
          <div className="text-center space-y-8">
            <p className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto leading-relaxed animate-fade-in">
              "Want full access to secret profiles, deleted conversations, and like history?"
            </p>
            {timeLeft > 0 ? (
              <p className="text-2xl md:text-3xl font-bold text-yellow-400 animate-pulse">
                Offer ends in: {formatTime(timeLeft)}
              </p>
            ) : (
              <p className="text-2xl md:text-3xl font-bold text-red-500">Offer expired!</p>
            )}
            <Button
              onClick={() =>
                (window.location.href = "https://pay.mycheckoutt.com/01997889-d90f-7176-b1ad-330b2aadd114?ref=")
              }
              disabled={timeLeft === 0}
              className="mt-10 px-10 py-5 text-xl font-bold uppercase bg-gradient-to-r from-red-700 to-black text-white shadow-lg hover:from-red-800 hover:to-gray-900 transition-all duration-300 transform hover:scale-105 animate-pulse-slow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💣 SEE FINAL RESULT
            </Button>

            {/* Random Access Notifications */}
            <div className="mt-8 w-full max-w-md mx-auto text-left space-y-2 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-lg font-bold text-white mb-3">
                <span className="text-green-400">[LIVE FEED]</span> Recent Accesses:
              </p>
              {randomNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center gap-2 text-sm text-gray-300 animate-fade-in">
                  <ScanEye size={16} className="text-blue-400" />
                  <span className="font-mono">
                    <span className="text-purple-300">{notification.user}</span> {notification.action}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">{notification.time}</span>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Limit Reached Component
  const LimitReachedScreen = () => (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-red-900 font-inter">
      {/* Matrix-style background */}
      <div 
        className="absolute inset-0 opacity-20 overflow-hidden"
        style={{
          fontFamily: 'monospace',
          color: '#0f0',
          fontSize: '10px',
          lineHeight: '12px',
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
            {Array.from({ length: 100 }).map(() => String.fromCharCode(Math.floor(Math.random() * 94) + 33)).join('')}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-gray-900/95 rounded-2xl p-8 border border-gray-800 shadow-2xl">
          {/* Profile Picture with Rainbow Ring */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full p-1"
                style={{
                  background: 'conic-gradient(from 0deg, #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080)',
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                  {limitData?.profilePicUrl ? (
                    <img
                      src={`/api/instagram-image-proxy?url=${encodeURIComponent(limitData.profilePicUrl)}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-user.jpg"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-gray-500" size={48} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Limit Reached Title */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="text-red-500" size={24} />
              <h2 className="text-2xl font-bold text-red-500">Limit Reached</h2>
            </div>
            <p className="text-gray-300">
              You have already used your <span className="font-bold text-white">free search</span>
            </p>
            <p className="text-gray-300">
              to spy on <span className="text-purple-400 font-semibold">@{limitData?.searchedUsername}</span>
            </p>
          </div>

{/* VIP Access CTA */}
  <div className="text-center mb-6">
  <p className="text-gray-400 mb-4">
  Get <span className="font-bold text-white">VIP access</span> and have full Instagram access right now!
  </p>
  <Button
    onClick={() => window.location.href = "https://pay.mycheckoutt.com/01997889-d90f-7176-b1ad-330b2aadd114?ref="}
    className="w-full mt-4 px-10 py-5 text-xl font-bold uppercase bg-gradient-to-r from-red-700 to-black text-white shadow-lg hover:from-red-800 hover:to-gray-900 transition-all duration-300 transform hover:scale-105 animate-pulse-slow"
  >
    SEE FINAL RESULT
  </Button>
  </div>

          {/* Warning Box */}
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-sm text-center">
              <span className="font-bold text-red-400">Your identity is compromised!</span>{" "}
              <span className="text-gray-300">
                {limitData?.fullName || limitData?.searchedUsername} may be notified about your spying, only VIP members have their privacy preserved during spying.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Show limit reached screen if limit is exceeded
  if (showLimitReached && limitData) {
    return <LimitReachedScreen />
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-red-900 font-inter">
      {/* Changed font-roboto to font-inter */}
      {/* Background grid pattern */}
      <div
        className={`absolute inset-0 opacity-10 animate-pulse-grid`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fillOpacity='0.2' fillRule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Content container with transition */}
      <div
        className={`relative z-10 transition-opacity duration-500 ${
          showContent ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {renderStage()}
      </div>
    </div>
  )
}
