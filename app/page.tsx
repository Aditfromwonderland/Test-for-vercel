'use client'

import { useState, FormEvent } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    workExperience: '',
    industryExperience: '',
    motivation: '',
    networkingChallenge: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    // In the future, this will call the API endpoint
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with gradient text */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-coral to-blue bg-clip-text text-transparent">
            Coffee-Chat Coach
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Tell us a bit about yourself to get your personalized networking guide!
          </p>
        </div>
        
        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue focus:border-blue"
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue focus:border-blue"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Work Experience field */}
            <div>
              <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 mb-1">
                Work Experience
              </label>
              <textarea
                id="workExperience"
                name="workExperience"
                value={formData.workExperience}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue focus:border-blue"
                placeholder="Briefly describe your work experience"
                required
              />
            </div>

            {/* Industry Experience field */}
            <div>
              <label htmlFor="industryExperience" className="block text-sm font-medium text-gray-700 mb-1">
                Industry Experience
              </label>
              <textarea
                id="industryExperience"
                name="industryExperience"
                value={formData.industryExperience}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue focus:border-blue"
                placeholder="What industries have you worked in?"
                required
              />
            </div>

            {/* Motivation field */}
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
                Motivation
              </label>
              <textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue focus:border-blue"
                placeholder="What motivates you to network and connect with others?"
                required
              />
            </div>

            {/* Networking Challenge field */}
            <div>
              <label htmlFor="networkingChallenge" className="block text-sm font-medium text-gray-700 mb-1">
                Networking Challenge
              </label>
              <textarea
                id="networkingChallenge"
                name="networkingChallenge"
                value={formData.networkingChallenge}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue focus:border-blue"
                placeholder="What challenges do you face when networking?"
                required
              />
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-orange to-coral text-white font-medium rounded-md shadow-sm hover:from-coral hover:to-orange transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral"
              >
                Get My Guide
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
