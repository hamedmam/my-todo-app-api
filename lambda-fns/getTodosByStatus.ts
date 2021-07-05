import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const getTodosByStatus = async ({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) => {
  try {
    const { Items } = await db
      .query({
        TableName: process.env.TODO_TABLE || '',
        IndexName: 'statusIndex',
        KeyConditionExpression: '#userId = :userId AND #status = :status',
        ExpressionAttributeNames: {
          '#userId': 'userId',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':status': status,
        },
        ScanIndexForward: false,
      })
      .promise();

    return Items;
  } catch (err) {
    console.log(err);
    return err;
  }
};
export default getTodosByStatus;
