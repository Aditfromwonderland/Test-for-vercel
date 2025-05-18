'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormData } from "../lib/schemas";
import { useRouter } from 'next/navigation';

export default function Home() {
  // State for tracking form submission status and errors
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Initialize router for navigation
  const router = useRouter();

  // Initialize react-hook-form with zod schema validation
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      workExperience: '',
      industryExperience: '',
      motivation: '',
      networkingChallenge: '',
    },
  });

  // Destructure useful methods and properties from form
  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  // Form submission handler - now async to handle API call
  const onSubmit = async (data: FormData) => {
    try {
      // Reset status and show loading state
      setSubmissionStatus('loading');
      setErrorMessage('');
      
      // Call the API route
      const response = await fetch('/api/create-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Parse the response
      const result = await response.json();
      
      // Handle non-successful responses
      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate guide');
      }
      
      // Handle successful response
      console.log('Success:', result);
      setSubmissionStatus('success');
      
      // Extract the guideId and guideContent from the result
      const { guideId, guideContent } = result;
      
      // Store the guide content in localStorage for retrieval on the guide page
      localStorage.setItem(`coffee-chat-guide-${guideId}`, JSON.stringify({
        id: guideId,
        userInput: data,
        guideContent: guideContent,
        createdAt: new Date().toISOString()
      }));
      
      // Navigate to the guide page
      router.push(`/guide/${guideId}`);
      
    } catch (error) {
      // Handle errors
      console.error('Error submitting form:', error);
      setSubmissionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  // Loading screen component
  const LoadingScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 animate-fadeIn">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-coral to-blue bg-clip-text text-transparent mb-8">
        Coffee-Chat Copilot
      </h1>
      
      <div className="relative w-24 h-24 mb-8">
        {/* Multi-color spinner */}
        <div className="absolute w-full h-full rounded-full border-4 border-t-coral border-r-orange border-b-blue border-l-green animate-spin"></div>
      </div>
      
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Creating your personalized guide...</h2>
        <p className="text-gray-600">
          We're analyzing your information and crafting a tailored consulting coffee chat guide just for you.
        </p>
        <p className="text-gray-500 mt-4 text-sm animate-pulse">
          This usually takes about 15-20 seconds
        </p>
      </div>
    </div>
  );

  // If in loading state, show the loading screen
  if (submissionStatus === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with gradient text */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-coral to-blue bg-clip-text text-transparent">
            Coffee-Chat Copilot
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Tell us a bit about yourself to get your personalized networking guide!
          </p>
        </div>
        
        {/* Error Message */}
        {submissionStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            Error: {errorMessage || 'Failed to generate guide. Please try again.'}
          </div>
        )}
        
        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                {...register('name')}
                className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue focus:border-blue ${
                  errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue focus:border-blue ${
                  errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Work Experience field */}
            <div>
              <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 mb-1">
                Work Experience
              </label>
              <textarea
                id="workExperience"
                {...register('workExperience')}
                rows={3}
                className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue focus:border-blue ${
                  errors.workExperience ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="Briefly describe your work experience"
              />
              {errors.workExperience && (
                <p className="mt-1 text-sm text-red-500">{errors.workExperience.message}</p>
              )}
            </div>

            {/* Industry Experience field */}
            <div>
              <label htmlFor="industryExperience" className="block text-sm font-medium text-gray-700 mb-1">
                Industry Experience
              </label>
              <textarea
                id="industryExperience"
                {...register('industryExperience')}
                rows={3}
                className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue focus:border-blue ${
                  errors.industryExperience ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="What industries have you worked in?"
              />
              {errors.industryExperience && (
                <p className="mt-1 text-sm text-red-500">{errors.industryExperience.message}</p>
              )}
            </div>

            {/* Motivation field */}
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
                Motivation
              </label>
              <textarea
                id="motivation"
                {...register('motivation')}
                rows={3}
                className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue focus:border-blue ${
                  errors.motivation ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="What motivates you to network and connect with others?"
              />
              {errors.motivation && (
                <p className="mt-1 text-sm text-red-500">{errors.motivation.message}</p>
              )}
            </div>

            {/* Networking Challenge field */}
            <div>
              <label htmlFor="networkingChallenge" className="block text-sm font-medium text-gray-700 mb-1">
                Networking Challenge
              </label>
              <textarea
                id="networkingChallenge"
                {...register('networkingChallenge')}
                rows={3}
                className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue focus:border-blue ${
                  errors.networkingChallenge ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="What challenges do you face when networking?"
              />
              {errors.networkingChallenge && (
                <p className="mt-1 text-sm text-red-500">{errors.networkingChallenge.message}</p>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange to-coral text-white font-medium rounded-md shadow-sm hover:from-coral hover:to-orange transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral disabled:opacity-70"
              >
                {isSubmitting ? 'Processing...' : 'Get My Guide'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
