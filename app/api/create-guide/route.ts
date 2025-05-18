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
      // Craft the prompt for OpenAI
      const systemPrompt = `
        You are the "Coffee-Chat Coach", an expert in guiding users through consulting recruitment coffee chats.
        
        A coffee chat is an online/offline opportunity (typically 15-20 minutes) that helps candidates learn more about consulting and life at a specific firm. The key objective is learning more about the firm and consulting career paths. As the consulting recruitment process is fairly streamlined, companies often post coffee chat availabilities on their websites or through campus representatives. Cold reach outs might not be needed.
        
        Focus on strategy consulting specifically. Remember that post-MBA roles in these companies are typically industry-agnostic for the first couple of years, after which consultants can choose to focus on an industry or function.
        
        Your task is to create a personalized networking guide for the user based on their background and challenges, specifically tailored to help them succeed in consulting coffee chats.
        
        Provide practical, actionable advice that helps the user draw parallels between their prior work experience and consulting. Recommend researching what industries are dominant in the geography where the candidate is applying.
        
        Your response must be a JSON object with the following structure:
        {
          "greeting": "A personalized greeting using their name",
          "keyStrengths": ["List of 3-5 key strengths based on their experience that are relevant to consulting"],
          "areasToFocus": ["List of 2-4 areas to focus on based on their challenges"],
          "actionableSteps": [
            {
              "title": "Short, actionable title",
              "description": "Detailed explanation of the step (1-3 sentences)",
              "iconName": "A relevant icon name from Heroicons/Lucide (e.g., 'BriefcaseIcon', 'LightbulbIcon', 'UsersIcon')"
            }
          ],
          "conversationStarters": ["List of 3-5 conversation starters tailored to consulting and their experience"],
          "closingRemark": "A motivational closing remark"
        }
        
        Include 3-5 actionable steps. Make all advice specific to consulting recruitment.
        
        In your advice, emphasize that:
        1. Professionalism should always be maintained in all coffee chats
        2. The user should research the company and what it is known for
        3. The user should send a short thank-you email after the coffee chat expressing gratitude and mentioning 1-2 things they learned
        4. The user should focus on drawing parallels between their experience and consulting
        
        Also include a section in the actionable steps about things NOT to do during consulting coffee chats.
      `;
      
      const userPrompt = `
        Create a personalized consulting coffee chat guide for me based on the following information:
        
        Name: ${userInput.name}
        Work Experience: ${userInput.workExperience}
        Industry Experience: ${userInput.industryExperience}
        Motivation for Networking: ${userInput.motivation}
        Networking Challenge: ${userInput.networkingChallenge}
        
        Please help me understand how to navigate coffee chats specifically for consulting recruitment, what topics to discuss, questions that can help connect with consultants at a personal level, and general pointers for these interactions.
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
