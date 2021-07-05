import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const getTodos = async (userId: string) => {
  try {
    const { Items } = await db
      .query({
        TableName: process.env.TODO_TABLE || '',
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeNames: {
          '#userId': 'userId',
        },
        ExpressionAttributeValues: { ':userId': userId },
        ScanIndexForward: false,
      })
      .promise();

    return Items;
  } catch (err) {
    console.log(err);
    return err;
  }
};
export default getTodos;
