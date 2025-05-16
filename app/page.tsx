export default function Home() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with gradient text */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-coral to-blue bg-clip-text text-transparent">
            Coffee-Chat Coach
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Get personalized networking advice tailored to your background and challenges.
          </p>
        </div>
        
        {/* Call to action */}
        <div className="mt-8 flex justify-center">
          <div className="rounded-md shadow">
            <a
              href="#"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-orange to-coral hover:from-coral hover:to-orange md:py-4 md:text-lg md:px-10 transition-all duration-300"
            >
              Get Started
            </a>
          </div>
        </div>

        {/* Feature highlight */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Why use Coffee-Chat Coach?
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-green font-bold mr-2">•</span>
              <span>Personalized networking strategies based on your experience</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue font-bold mr-2">•</span>
              <span>Actionable conversation starters for your industry</span>
            </li>
            <li className="flex items-start">
              <span className="text-coral font-bold mr-2">•</span>
              <span>PDF guide emailed directly to your inbox</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
