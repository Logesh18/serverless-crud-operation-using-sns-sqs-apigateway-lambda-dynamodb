import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, GetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const client = DynamoDBDocumentClient.from(dynamoDBClient);

type Event = { 
  pathParameters: { 
    userId: string; 
  }
};

type Pk = {
  Id: string
}

const TableName: string = process.env.DYNAMODB_TABLE_NAME ? process.env.DYNAMODB_TABLE_NAME : "";

export const handler = async (event: Event) => {
  const { userId } = event.pathParameters;

  const primaryKey: Pk = {
    'Id': userId
  };

  const params: any = {
    TableName,
    Key: primaryKey,
  };

  console.log('params--->', params);

  try {
    const getCommand: any = new GetCommand(params);
    const getResponse: any = await client.send(getCommand);

    if (!getResponse.Item) {
      return {
        statusCode: 404,
        body: 'User not found.',
      };
    }

    const deleteCommand: any = new DeleteCommand(params);
    await client.send(deleteCommand);

    console.log('User deleted successfully.');

    return {
      statusCode: 200,
      body: 'User deleted successfully.',
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Error deleting user from DynamoDB.',
    };
  }
};
