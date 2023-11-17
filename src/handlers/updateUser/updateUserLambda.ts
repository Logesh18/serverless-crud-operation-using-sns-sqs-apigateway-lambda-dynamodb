import { DynamoDBClient, ReturnValue } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
let dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const  client = DynamoDBDocumentClient.from(dynamoDBClient);

type Pk = {
  Id: string;
};

type Params = {
  TableName: string;
  Key: Pk;
  UpdateExpression: string;
  ExpressionAttributeNames: any;
  ExpressionAttributeValues: any;
  ReturnValues: ReturnValue | undefined;
}

const TableName: string = process.env.DYNAMODB_TABLE_NAME ? process.env.DYNAMODB_TABLE_NAME : "";

export const handler = async (event: { pathParameters: { userId: any; }; body: string; }) => {
  const { userId }: { userId: string } = event.pathParameters;
  console.log('userId--->', userId);
  console.log('event---->', event.body);
  const attributeUpdates: any = {
    ...JSON.parse(event.body)
  };
  const updateExpression: string = 'SET ' + Object.keys(attributeUpdates).map((_attrName: any, index: number) => `#attrName${index} = :attrValue${index}`).join(', ');

  const expressionAttributeNames: any = {};
  const expressionAttributeValues: any = {};

  Object.keys(attributeUpdates).forEach((attrName: string, index: number) => {
    expressionAttributeNames[`#attrName${index}`] = attrName;

    const attrValue: string | number = attributeUpdates[attrName];
    expressionAttributeValues[`:attrValue${index}`] = attrValue;
  });

  const primaryKey: Pk = {
    'Id': userId
  };

  const params: Params = {
    TableName,
    Key: primaryKey,
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'UPDATED_NEW',
  };

  console.log('params----->', params);
  try {
    const updateCommand: any = new UpdateCommand(params);
    const data: any = await client.send(updateCommand);
    console.log('User updated successfully:', JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      body: 'User updated successfully.',
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Error updating user in DynamoDB.',
    };
  }
};
