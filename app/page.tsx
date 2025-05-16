'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormData } from "../lib/schemas";

export default function Home() {
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

  // Form submission handler
  const onSubmit = (data: FormData) => {
    console.log('Form submitted with data:', data);
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
