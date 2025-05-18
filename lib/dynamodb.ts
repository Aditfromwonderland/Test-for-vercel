import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Table name as a constant for reuse
export const GUIDES_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Guides";

// Required environment variables for AWS configuration
const requiredEnvVars = [
  { name: "AWS_REGION", description: "AWS Region where your DynamoDB table is located" },
  { name: "AWS_ACCESS_KEY_ID", description: "Access Key ID for AWS authentication" },
  { name: "AWS_SECRET_ACCESS_KEY", description: "Secret Access Key for AWS authentication" }
];

// Check for required environment variables and log detailed information
console.log("🔄 Initializing DynamoDB client...");
const missingEnvVars = requiredEnvVars.filter(({ name }) => !process.env[name]);

if (missingEnvVars.length > 0) {
  console.error("⚠️ CRITICAL: Missing required AWS environment variables:");
  missingEnvVars.forEach(({ name, description }) => {
    console.error(`  - ${name}: ${description}`);
  });
  console.error("DynamoDB operations will fail without these credentials.");
} else {
  console.log("✅ All required AWS environment variables are present.");
}

// Log configuration details without exposing sensitive information
console.log(`📊 DynamoDB Configuration:
  - Table Name: ${GUIDES_TABLE_NAME}
  - AWS Region: ${process.env.AWS_REGION || "NOT SET"}
  - Access Key ID: ${process.env.AWS_ACCESS_KEY_ID ? "********" + process.env.AWS_ACCESS_KEY_ID.slice(-4) : "NOT SET"}
  - Secret Access Key: ${process.env.AWS_SECRET_ACCESS_KEY ? "********" : "NOT SET"}
`);

// Validate AWS_ACCESS_KEY_ID format if present
if (process.env.AWS_ACCESS_KEY_ID && !/^[A-Z0-9]{20}$/.test(process.env.AWS_ACCESS_KEY_ID)) {
  console.warn("⚠️ AWS_ACCESS_KEY_ID appears to be in an incorrect format. Should be 20 characters, alphanumeric.");
}

// Validate AWS_REGION format if present
if (process.env.AWS_REGION && !/^[a-z]{2}-[a-z]+-\d$/.test(process.env.AWS_REGION)) {
  console.warn(`⚠️ AWS_REGION "${process.env.AWS_REGION}" may be invalid. Expected format: "us-east-1"`);
}

// Initialize the base DynamoDB client with credentials from environment variables
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY 
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined, // Will use default credentials chain if env vars not provided
});

// Create the document client from the base client with enhanced options
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    // Convert empty strings to null (DynamoDB doesn't support empty strings)
    convertEmptyValues: true,
    // Remove undefined values
    removeUndefinedValues: true,
    // Convert JavaScript numbers to DynamoDB numbers
    convertClassInstanceToMap: true,
  },
});

console.log("✅ DynamoDB client initialized successfully");

// Export the raw client for advanced operations if needed
export const dynamoDBClient = client;
