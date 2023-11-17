
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
let dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const  client = DynamoDBDocumentClient.from(dynamoDBClient);

type Event = {
  Records: {
    body: string;
  }[];
};

const TableName: string = process.env.DYNAMODB_TABLE_NAME || "";

export const handler = async (event: Event) => {
  try {
    const records = event.Records;
    if (!Array.isArray(records) || records.length === 0) {
      console.error('No records in the event.');
      return {
        statusCode: 400,
        body: 'No records in the event.',
      };
    }

    for (const record of records) {
      const queueMessage: string = record.body;
      console.log('queueMessage', queueMessage);

      try {
        let messageData: any = JSON.parse(queueMessage);

        if (messageData && messageData.Message) {
          messageData = JSON.parse(messageData.Message);
        } else {
          console.error('Invalid message format:', messageData);
          continue;
        }

        if (!messageData.Id || !messageData.name || !messageData.email) {
          console.error('Invalid message format:', messageData);
          continue;
        }

        const dynamoDBParams: any = {
          TableName,
          Item: messageData,
        };
        console.log('dynamoDBParams', dynamoDBParams);

        const putCommand = new PutCommand(dynamoDBParams);
        await client.send(putCommand);

        console.log('Successfully stored data in DynamoDB for record:');
      } catch (error) {
        console.error('Error processing a record:', error);
      }
    }

    return {
      statusCode: 200,
      body: 'Data stored in DynamoDB successfully.',
    };
  } catch (error) {
    console.error('Error in the handler:', error);

    return {
      statusCode: 500,
      body: 'Error in the handler.',
    };
  }
};
