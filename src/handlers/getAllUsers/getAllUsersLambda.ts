import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
let dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const  client = DynamoDBDocumentClient.from(dynamoDBClient);
type Params = {
  TableName: string
};

const TableName: string = process.env.DYNAMODB_TABLE_NAME ? process.env.DYNAMODB_TABLE_NAME : "";

export const handler = async () => {
  const params: Params  = {
    TableName
  };

  console.log('params--->', params);

  try {
    const scanResults: any[] = [];
    let items: any;

    const scanCommand: any = new ScanCommand(params);
    items = await client.send(scanCommand);
    
    console.log('items.Items', items.Items);

    scanResults.push(...items.Items);

    return {
      statusCode: 200,
      body: JSON.stringify(scanResults),
    };
  } catch (error: any) {
    console.log('error--->', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error scanning table' }),
    };
  }
};
