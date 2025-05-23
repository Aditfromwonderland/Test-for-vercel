'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Guide, GuideContent, ActionableStep } from '../../../lib/store'
import { 
  Users, 
  Briefcase, 
  Lightbulb, 
  MessageSquare, 
  BookOpen, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  Award, 
  Coffee, 
  FileText, 
  Search, 
  Building, 
  ThumbsUp, 
  PenTool, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Compass,
  Target,
  Zap,
  Star,
  Heart
} from 'lucide-react'

export default function GuidePage() {
  // State for guide data, loading and error
  const [guide, setGuide] = useState<Guide | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get the guide ID from the URL parameters
  const params = useParams()
  const id = params.id as string
  
  // Router for navigation
  const router = useRouter()
  
  // Icon mapping - maps the icon names to actual icon components
  const iconMap: Record<string, React.ReactNode> = {
    // Basic icons
    UsersIcon: <Users className="w-5 h-5 text-orange" />,
    BriefcaseIcon: <Briefcase className="w-5 h-5 text-orange" />,
    LightbulbIcon: <Lightbulb className="w-5 h-5 text-orange" />,
    MessageSquareIcon: <MessageSquare className="w-5 h-5 text-orange" />,
    BookOpenIcon: <BookOpen className="w-5 h-5 text-orange" />,
    CalendarIcon: <Calendar className="w-5 h-5 text-orange" />,
    MailIcon: <Mail className="w-5 h-5 text-orange" />,
    PhoneIcon: <Phone className="w-5 h-5 text-orange" />,
    GlobeIcon: <Globe className="w-5 h-5 text-orange" />,
    AwardIcon: <Award className="w-5 h-5 text-orange" />,
    CoffeeIcon: <Coffee className="w-5 h-5 text-orange" />,
    FileTextIcon: <FileText className="w-5 h-5 text-orange" />,
    SearchIcon: <Search className="w-5 h-5 text-orange" />,
    BuildingIcon: <Building className="w-5 h-5 text-orange" />,
    HandshakeIcon: <Award className="w-5 h-5 text-orange" />,
    ThumbsUpIcon: <ThumbsUp className="w-5 h-5 text-orange" />,
    PenToolIcon: <PenTool className="w-5 h-5 text-orange" />,
    ClockIcon: <Clock className="w-5 h-5 text-orange" />,
    CheckCircleIcon: <CheckCircle className="w-5 h-5 text-orange" />,
    AlertCircleIcon: <AlertCircle className="w-5 h-5 text-orange" />,
    CompassIcon: <Compass className="w-5 h-5 text-orange" />,
    TargetIcon: <Target className="w-5 h-5 text-orange" />,
    ZapIcon: <Zap className="w-5 h-5 text-orange" />,
    StarIcon: <Star className="w-5 h-5 text-orange" />,
    HeartIcon: <Heart className="w-5 h-5 text-orange" />,
    
    // Fallback for unknown icons
    DefaultIcon: <Coffee className="w-5 h-5 text-orange" />
  }
  
  // Helper function to get the icon component
  const getIcon = (iconName: string) => {
    // Clean up icon name (remove spaces, ensure consistency)
    const cleanIconName = iconName.replace(/\s+/g, '');
    
    // Return the icon or default if not found
    return iconMap[cleanIconName] || iconMap.DefaultIcon;
  }
  
  // Fetch the guide data on component mount
  useEffect(() => {
    async function fetchGuide() {
      try {
        setIsLoading(true)
        setError(null)
        
        // First, try to fetch the guide from the API (DynamoDB)
        const response = await fetch(`/api/guide/${id}`)
        
        // Handle different API response statuses
        if (response.status === 404) {
          // Try localStorage as fallback if the API returns 404
          const localGuide = localStorage.getItem(`coffee-chat-guide-${id}`)
          
          if (localGuide) {
            // If found in localStorage, use that
            setGuide(JSON.parse(localGuide))
            return
          } else {
            // If not in localStorage either, show not found error
            throw new Error("Guide not found. It may have expired or been removed.")
          }
        } else if (!response.ok) {
          // For other non-OK responses, check if it's a server error
          if (response.status >= 500) {
            throw new Error("Server error. Please try again later.")
          } else {
            // For other client errors
            const data = await response.json()
            throw new Error(data.message || "Failed to fetch guide")
          }
        }
        
        // If we get here, the API response was OK
        const data = await response.json()
        setGuide(data.guide)
      } catch (err) {
        console.error('Error fetching guide:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the guide')
        
        // Last resort: try localStorage if we haven't already
        if (!error?.includes("not found")) {
          const localGuide = localStorage.getItem(`coffee-chat-guide-${id}`)
          if (localGuide) {
            try {
              setGuide(JSON.parse(localGuide))
              setError(null) // Clear error if localStorage retrieval succeeds
            } catch (parseErr) {
              console.error('Error parsing guide from localStorage:', parseErr)
              // Keep the original error if localStorage parsing fails
            }
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    if (id) {
      fetchGuide()
    }
  }, [id])
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue border-r-coral border-b-orange border-l-green rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your personalized guide...</h2>
          <p className="text-gray-500 mt-2">This will just take a moment</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error || !guide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold text-coral mb-4">Oops!</h1>
          <p className="text-gray-700 mb-6">{error || 'Guide not found. It may have expired or been removed.'}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-orange to-coral text-white font-medium rounded-md hover:from-coral hover:to-orange transition-all duration-300 shadow-md"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }
  
  // Destructure guide content for easier access
  const { guideContent, userInput } = guide
  
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl bg-gradient-to-r from-coral to-blue bg-clip-text text-transparent">
            Coffee-Chat Copilot
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your Personalized Networking Guide
          </p>
        </div>

        {/* Guide Content */}
        <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
          {/* Greeting */}
          <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-yellow/10 to-orange/10">
            <h2 className="text-3xl font-bold text-gray-800">
              {guideContent.greeting}
            </h2>
          </div>

          {/* About Coffee Chats in Consulting - New Static Section */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue/10 to-green/10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Understanding Coffee Chats in Consulting
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue font-bold mr-2">•</span>
                <span className="text-gray-700">A coffee chat is an online/offline opportunity (typically 15-20 minutes) that helps candidates learn more about consulting and life at a specific firm.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue font-bold mr-2">•</span>
                <span className="text-gray-700">The key objective is learning more about the firm and consulting career paths. As the consulting recruitment process is fairly streamlined, companies often post coffee chat availabilities on their websites or through campus representatives.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue font-bold mr-2">•</span>
                <span className="text-gray-700">Cold reach outs might not be needed.</span>
              </li>
            </ul>
          </div>

          {/* Key Strengths */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-green mb-4">
              Your Key Strengths
            </h3>
            <ul className="space-y-2">
              {guideContent.keyStrengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green font-bold mr-2">•</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to Focus */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-semibold text-blue mb-4">
              Areas to Focus On
            </h3>
            <ul className="space-y-2">
              {guideContent.areasToFocus.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue font-bold mr-2">•</span>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actionable Steps */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Your Action Plan
            </h3>
            <div className="space-y-6">
              {guideContent.actionableSteps.map((step, index) => (
                <div key={index} className="flex">
                  <div className="mr-4 mt-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange/20 text-orange-700">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="text-lg font-medium text-gray-800 mr-2">
                        {step.title}
                      </h4>
                      <div className="flex items-center">
                        {getIcon(step.iconName)}
                      </div>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Starters */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-semibold text-coral mb-4">
              Conversation Starters
            </h3>
            <ul className="space-y-3">
              {guideContent.conversationStarters.map((starter, index) => (
                <li key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-gray-700">"{starter}"</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Closing Remark */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue/10 to-green/10">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Final Thoughts
            </h3>
            <p className="text-gray-700 italic">
              {guideContent.closingRemark}
            </p>
          </div>
        </div>

        {/* Footer with return button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-orange to-coral text-white font-medium rounded-md hover:from-coral hover:to-orange transition-all duration-300 shadow-md"
          >
            Create Another Guide
          </button>
        </div>
      </div>
    </div>
  )
}
