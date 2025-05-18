import { NextResponse } from "next/server";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, GUIDES_TABLE_NAME } from "../../../../lib/dynamodb";

/**
 * Handle GET requests to fetch a guide by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the guide ID from the route parameters
    const { id } = params;

    console.log(`Attempting to fetch guide with ID: ${id}`);
    console.log(`Using DynamoDB table: ${GUIDES_TABLE_NAME}`);

    if (!id) {
      console.error("Guide ID is missing in request parameters");
      return NextResponse.json(
        { message: "Guide ID is required" },
        { status: 400 }
      );
    }

    // Log the request parameters we're using
    console.log(`DynamoDB request params: { TableName: ${GUIDES_TABLE_NAME}, Key: { id: ${id} } }`);

    // Validate AWS credentials are available
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
      console.error("Missing AWS credentials or region in environment variables");
      return NextResponse.json(
        { message: "Server configuration error: Missing AWS credentials" },
        { status: 500 }
      );
    }

    try {
      // Fetch the guide from DynamoDB
      console.log("Sending GetCommand to DynamoDB...");
      const result = await docClient.send(
        new GetCommand({
          TableName: GUIDES_TABLE_NAME,
          Key: { id }
        })
      );
      
      console.log(`DynamoDB response received: ${result ? "Success" : "Empty response"}`);
      
      // Check if the guide exists
      if (!result.Item) {
        console.log(`Guide with ID ${id} not found in DynamoDB`);
        return NextResponse.json(
          { message: "Guide not found" },
          { status: 404 }
        );
      }
      
      console.log(`Successfully retrieved guide for ID: ${id}`);
      
      // Return the guide data
      return NextResponse.json(
        { guide: result.Item },
        { status: 200 }
      );
    } catch (dbError: unknown) {
      // Detailed error logging for DynamoDB errors
      console.error("DynamoDB error details:");
      
      // Safe error property access with type checking
      if (dbError && typeof dbError === 'object') {
        const errorObj = dbError as Record<string, any>;
        console.error(`Error name: ${errorObj.name || 'Unknown error name'}`);
        console.error(`Error message: ${errorObj.message || 'No error message available'}`);
        console.error(`Error stack: ${errorObj.stack || 'No stack trace available'}`);
        
        // Check for specific DynamoDB error types
        if (errorObj.name === 'ResourceNotFoundException') {
          return NextResponse.json(
            { message: "Database table not found. Please check configuration." },
            { status: 500 }
          );
        } else if (errorObj.name === 'AccessDeniedException') {
          return NextResponse.json(
            { message: "Access denied to database. Please check IAM permissions." },
            { status: 500 }
          );
        }
      } else {
        console.error(`Error: ${String(dbError)}`);
      }
      
      return NextResponse.json(
        { 
          message: "Database error while fetching guide",
          error: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    // Handle any unexpected errors
    console.error("Unexpected error in guide retrieval API:");
    
    // Safe error property access with type checking
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, any>;
      console.error(`Error name: ${errorObj.name || 'Unknown error name'}`);
      console.error(`Error message: ${errorObj.message || 'No error message available'}`);
      console.error(`Error stack: ${errorObj.stack || 'No stack trace available'}`);
    } else {
      console.error(`Error: ${String(error)}`);
    }
    
    return NextResponse.json(
      { 
        message: "Server error while processing guide request",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Handle all other HTTP methods with a 405 Method Not Allowed response
 */
export async function POST() {
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
