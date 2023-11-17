import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
let dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const  client = DynamoDBDocumentClient.from(dynamoDBClient);
type Event = { 
  pathParameters: { 
    userId: any; 
  }
};

type Pk = {
  Id: string
};

type Params = {
  TableName: string,
  Key: any,
};

const TableName: string = process.env.DYNAMODB_TABLE_NAME ? process.env.DYNAMODB_TABLE_NAME : "";

export const handler = async (event: Event) => {
  const { userId }: { userId: string } = event.pathParameters;

  const primaryKey: Pk = {
    'Id': userId 
  };

  const params: Params = {
    TableName,
    Key: primaryKey,
  };

  try {
    const getItemCommand: any = new GetCommand(params);
    const data: any = await client.send(getItemCommand);

    if (data.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(data.Item),
      };
    } else {
      return {
        statusCode: 404,
        body: 'User not found',
      };
    }
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Error retrieving user data from DynamoDB',
    };
  }
};
