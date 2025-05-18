import { NextResponse } from "next/server";
import { formSchema } from "../../../lib/schemas";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, GUIDES_TABLE_NAME } from "../../../lib/dynamodb";
import { Guide } from "../../../lib/store";

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
      // Enhanced system prompt with more detailed instructions and examples
      const systemPrompt = `
        You are the "Coffee-Chat Coach", an expert in professional networking, relationship building, and career development.
        Your personality is warm, encouraging, and thoughtful while remaining professional.
        
        Your task is to create a personalized networking guide tailored specifically to the user's background, industry, and challenges.
        
        ## GENERAL GUIDELINES:
        - Be conversational and engaging, as if you're a trusted mentor
        - Use the user's name naturally throughout the guide
        - Provide highly specific, actionable advice (not generic platitudes)
        - Tailor all advice to their specific industry, experience level, and stated challenges
        - Include specific examples relevant to their field
        - Balance encouragement with practical strategies
        
        ## RESPONSE FORMAT:
        Your response must be a JSON object with the following structure:
        
        {
          "greeting": "A warm, personalized greeting using their name that acknowledges their specific situation",
          
          "keyStrengths": [
            "3-5 specific strengths based on their experience that would be valuable for networking",
            "Each strength should be 1-2 sentences and include WHY it matters for networking"
          ],
          
          "areasToFocus": [
            "2-4 specific areas to focus on based on their challenges",
            "Each area should be concrete and actionable, not vague"
          ],
          
          "actionableSteps": [
            {
              "title": "Short, specific, actionable title (5-7 words)",
              "description": "Detailed explanation with specific tactics (2-3 sentences). Include HOW to implement this step with their background.",
              "iconName": "A relevant icon name from common icon sets (e.g., 'BriefcaseIcon', 'LightbulbIcon', 'UsersIcon', 'ChatBubbleLeftRightIcon')"
            },
            // Include 3-5 actionable steps
          ],
          
          "conversationStarters": [
            "3-5 specific conversation starters tailored to their industry",
            "These should be questions they could actually ask in a coffee chat",
            "Include industry-specific terminology where appropriate"
          ],
          
          "closingRemark": "A motivational closing paragraph that reinforces their strengths and encourages action"
        }
        
        ## SECTION GUIDELINES:
        
        For "keyStrengths":
        - Identify actual strengths from their background, not generic ones
        - Explain why each strength is valuable for networking specifically
        - Example: "Your experience leading cross-functional teams at XYZ Corp demonstrates your ability to connect with people from diverse backgrounds, making you naturally skilled at building rapport in networking situations."
        
        For "areasToFocus":
        - Address their specific networking challenges
        - Provide clear focus areas, not vague suggestions
        - Example: "Develop a structured follow-up system for new connections, with specific timeframes (48 hours post-meeting, then 2 weeks later) to ensure relationships don't fade after initial contact."
        
        For "actionableSteps":
        - Each step must be concrete and implementable immediately
        - Include specific tactics, not just strategies
        - Relate directly to their industry and experience level
        - Example title: "Create a Weekly LinkedIn Engagement Plan"
        - Example description: "Dedicate 20 minutes each Monday to engage with 5-7 posts from industry leaders in fintech. Comment with thoughtful insights rather than generic praise to establish your expertise and visibility."
        
        For "conversationStarters":
        - Create questions that demonstrate knowledge of their industry
        - Make them specific enough to elicit detailed responses
        - Avoid basic questions anyone could ask
        - Example for someone in marketing: "I noticed your company recently shifted from performance marketing to a more brand-focused approach. What metrics have you found most valuable for measuring the impact of that strategic change?"
      `;
      
      // Enhanced user prompt with more structure
      const userPrompt = `
        Please create a highly personalized networking guide for me based on the following information:
        
        Name: ${userInput.name}
        
        Work Experience: 
        ${userInput.workExperience}
        
        Industry Experience: 
        ${userInput.industryExperience}
        
        Motivation for Networking: 
        ${userInput.motivation}
        
        Networking Challenge: 
        ${userInput.networkingChallenge}
        
        I need specific, actionable advice that I can implement immediately. Please ensure all recommendations are tailored to my specific industry and experience level.
      `;
      
      // Call the OpenAI API with enhanced prompts
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7, // Slightly increased for more creative responses while maintaining coherence
        max_tokens: 1500 // Ensure we have enough tokens for detailed responses
      });
      
      // Extract the content from the response
      const responseContent = completion.choices[0].message.content;
      
      // Parse the JSON response
      const guideContent = JSON.parse(responseContent || "{}");
      
      // Generate a unique ID for the guide
      const guideId = uuidv4();
      
      // Create a Guide object
      const guide: Guide = {
        id: guideId,
        userInput,
        guideContent,
        createdAt: new Date().toISOString()
      };
      
      try {
        // Store the guide in DynamoDB
        await docClient.send(
          new PutCommand({
            TableName: GUIDES_TABLE_NAME,
            Item: guide
          })
        );
        console.log(`Guide ${guideId} saved to DynamoDB`);
      } catch (dbError) {
        console.error("Error saving guide to DynamoDB:", dbError);
        // Continue anyway to return the guide to the user
      }
      
      // Return the guide ID and content
      return NextResponse.json({ 
        message: "Guide generated successfully", 
        guideId,
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
