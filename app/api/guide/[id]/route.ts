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

    if (!id) {
      return NextResponse.json(
        { message: "Guide ID is required" },
        { status: 400 }
      );
    }

    // Fetch the guide from DynamoDB
    const result = await docClient.send(
      new GetCommand({
        TableName: GUIDES_TABLE_NAME,
        Key: { id }
      })
    );
    
    // Check if the guide exists
    if (!result.Item) {
      return NextResponse.json(
        { message: "Guide not found" },
        { status: 404 }
      );
    }
    
    // Return the guide data
    return NextResponse.json(
      { guide: result.Item },
      { status: 200 }
    );
  } catch (error) {
    // Handle any errors that occur
    console.error("Error fetching guide:", error);
    return NextResponse.json(
      { message: "Failed to fetch guide" },
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
