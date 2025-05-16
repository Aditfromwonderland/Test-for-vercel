import { NextResponse } from "next/server";
import { formSchema } from "../../../lib/schemas";
import { OpenAI } from "openai";

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Handle POST requests to generate a personalized networking guide
 */
export async function POST(request: Request) {
  try {
    // Parse the request body as JSON
    const body = await request.json();
    
    // Validate the request body against our schema
    const validationResult = formSchema.safeParse(body);
    
    // If validation fails, return a 400 Bad Request with the validation errors
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    // Extract the validated user input
    const userInput = validationResult.data;
    
    try {
      // Craft the prompt for OpenAI
      const systemPrompt = `
        You are the "Coffee-Chat Coach", an expert in professional networking and relationship building.
        Your task is to create a personalized networking guide for the user based on their background and challenges.
        
        Provide practical, actionable advice that is specific to their industry, experience level, and stated challenges.
        Focus on helping them leverage their strengths and overcome their specific networking challenges.
        
        Your response must be a JSON object with the following structure:
        {
          "greeting": "A personalized greeting using their name",
          "keyStrengths": ["List of 3-5 key strengths based on their experience"],
          "areasToFocus": ["List of 2-4 areas to focus on based on their challenges"],
          "actionableSteps": [
            {
              "title": "Short, actionable title",
              "description": "Detailed explanation of the step (1-3 sentences)",
              "iconName": "A relevant icon name (e.g., 'BriefcaseIcon', 'LightbulbIcon', 'UsersIcon')"
            }
          ],
          "conversationStarters": ["List of 3-5 conversation starters tailored to their industry and experience"],
          "closingRemark": "A motivational closing remark"
        }
        
        Include 3-5 actionable steps. Make all advice specific and tailored to their situation, not generic.
      `;
      
      const userPrompt = `
        Create a personalized networking guide for me based on the following information:
        
        Name: ${userInput.name}
        Work Experience: ${userInput.workExperience}
        Industry Experience: ${userInput.industryExperience}
        Motivation for Networking: ${userInput.motivation}
        Networking Challenge: ${userInput.networkingChallenge}
      `;
      
      // Call the OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });
      
      // Extract the content from the response
      const responseContent = completion.choices[0].message.content;
      
      // Parse the JSON response
      const guideContent = JSON.parse(responseContent || "{}");
      
      // Return the guide content
      return NextResponse.json({ 
        message: "Guide generated successfully", 
        guideContent 
      }, { status: 200 });
      
    } catch (openaiError) {
      console.error("Error calling OpenAI API:", openaiError);
      
      // Check if it's an API key issue
      if (openaiError instanceof Error && 
          openaiError.message.includes("API key")) {
        return NextResponse.json(
          { message: "Configuration error: OpenAI API key issue" },
          { status: 500 }
        );
      }
      
      // General OpenAI error
      return NextResponse.json(
        { message: "Failed to generate guide content" },
        { status: 500 }
      );
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle all other HTTP methods with a 405 Method Not Allowed response
 */
export async function GET() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

/**
 * Helper function to return a 405 Method Not Allowed response
 */
function methodNotAllowed() {
  return NextResponse.json(
    { message: "Method Not Allowed" },
    { status: 405 }
  );
}
