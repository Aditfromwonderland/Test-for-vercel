import { NextResponse } from "next/server";
import { formSchema } from "../../../lib/schemas";
import { OpenAI } from "openai";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { generatePdfFromHtml } from "../../../lib/pdfGenerator";
import GuideEmailTemplate from "../../../components/GuideEmailTemplate";
import { renderToStaticMarkup } from "react-dom/server";
import { sendGuideEmail } from "../../../lib/emailService";

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize the DynamoDB Document Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = "Guides"; // Or from an environment variable

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
              "iconName": "A relevant icon name from Heroicons/Lucide (e.g., 'BriefcaseIcon', 'LightbulbIcon', 'UsersIcon')"
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
      
      // Generate a unique ID for the guide
      const guideId = uuidv4();
      
      // Generate PDF from the guide content
      let pdfBuffer = null;
      let pdfError = null;
      let emailHtml = "";
      
      try {
        // Render the GuideEmailTemplate component to HTML
        emailHtml = renderToStaticMarkup(
          <GuideEmailTemplate guideContent={guideContent} userName={userInput.name} />
        );
        
        // Generate PDF from the HTML
        pdfBuffer = await generatePdfFromHtml(emailHtml);
        
        console.log("PDF generated successfully, size:", pdfBuffer.length);
      } catch (pdfGenerationError) {
        console.error("Error generating PDF:", pdfGenerationError);
        pdfError = `Failed to generate PDF: ${pdfGenerationError.message}`;
      }
      
      // Send email with PDF attachment if PDF was generated successfully
      let emailSentSuccessfully = false;
      let emailError: string | null = null;

      if (pdfBuffer) { // Only attempt to email if PDF was created
        try {
          const emailResult = await sendGuideEmail(
            userInput.email,
            userInput.name,
            pdfBuffer,
            emailHtml
          );

          if (emailResult.success) {
            emailSentSuccessfully = true;
            console.log(`Email sent successfully to ${userInput.email}`);
          } else {
            emailError = emailResult.message;
            console.error(`Failed to send email to ${userInput.email}: ${emailError}`);
          }
        } catch (err) {
          console.error(`Critical error during email sending process for ${userInput.email}:`, err);
          emailError = err.message || "Unknown error during email sending.";
        }
      }
      
      try {
        // Store the guide in DynamoDB
        await docClient.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: guideId,
              userInput,
              guideContent,
              createdAt: new Date().toISOString(),
              hasPdf: pdfBuffer !== null,
              emailSent: emailSentSuccessfully,
            }
          })
        );
        
        // Prepare the response message based on PDF and email status
        let responseMessage = "Guide generated and saved";
        
        if (pdfBuffer && emailSentSuccessfully) {
          responseMessage += ", and emailed successfully";
        } else if (pdfBuffer && !emailSentSuccessfully) {
          responseMessage += ". Emailing failed";
        } else if (!pdfBuffer) {
          responseMessage += ", but PDF generation failed";
        }
        
        // Return the guide ID and content
        const response = { 
          message: responseMessage, 
          guideId,
          guideContent
        };
        
        // Add error details if applicable
        if (pdfError) {
          response.pdfError = pdfError;
        }
        
        if (emailError) {
          response.emailError = emailError;
        }
        
        return NextResponse.json(response, { status: 200 });
      } catch (dynamoError) {
        console.error("Error storing guide in DynamoDB:", dynamoError);
        
        // Prepare the response message based on PDF and email status
        let responseMessage = "Guide generated but not saved";
        
        if (pdfBuffer && emailSentSuccessfully) {
          responseMessage += ", but was emailed successfully";
        } else if (pdfBuffer && !emailSentSuccessfully) {
          responseMessage += ", and emailing also failed";
        } else if (!pdfBuffer) {
          responseMessage += ", and PDF generation failed";
        }
        
        // Return the guide content even if storage failed
        const response = { 
          message: responseMessage, 
          guideId: null,
          guideContent,
          error: "Failed to store guide in database"
        };
        
        // Add error details if applicable
        if (pdfError) {
          response.pdfError = pdfError;
        }
        
        if (emailError) {
          response.emailError = emailError;
        }
        
        return NextResponse.json(response, { status: 500 });
      }
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
