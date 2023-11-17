import * as AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { v4 as uuidv4 } from 'uuid';

const sns = new AWS.SNS();

type Event = {
  body: string;
};

type Params = {
  Message: string;
  TopicArn: string;
};

const SNS_TOPIC_ARN: string = process.env.SNS_TOPIC_ARN || '';

export const handler = async (event: Event) => {
  console.log('eventData', event.body);
  const messageData: any = {
    Id: uuidv4(),
    ...JSON.parse(event.body),
  };

  console.log('SNS_TOPIC_ARN', SNS_TOPIC_ARN);
  const params: Params = {
    Message: JSON.stringify(messageData, null, 2),
    TopicArn: SNS_TOPIC_ARN,
  };

  console.log('params', params);

  try {
    const result: PromiseResult<AWS.SNS.PublishResponse, any> = await sns.publish(params).promise();
    console.log('Message published to SNS:', JSON.stringify(result, null, 2));

    return {
      statusCode: 200,
      body: 'Message published to SNS successfully.',
    };
  } catch (error) {
    console.error('Error publishing message to SNS:', error);

    return {
      statusCode: 500,
      body: 'Error publishing message to SNS.',
    };
  }
};