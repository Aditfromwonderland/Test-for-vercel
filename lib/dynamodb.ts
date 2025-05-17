import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Table name as a constant for reuse
export const GUIDES_TABLE_NAME = "Guides";

// Check for required environment variables
const requiredEnvVars = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY"
];

// Log warning if any required env vars are missing
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.warn(`Missing AWS environment variables: ${missingEnvVars.join(", ")}`);
  console.warn("DynamoDB operations may fail without these credentials.");
}

// Initialize the base DynamoDB client with credentials from environment variables
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Create the document client from the base client
// The document client provides a more convenient way to work with DynamoDB items
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    // Convert empty strings to null (DynamoDB doesn't support empty strings)
    convertEmptyValues: true,
    // Remove undefined values
    removeUndefinedValues: true,
  },
});
