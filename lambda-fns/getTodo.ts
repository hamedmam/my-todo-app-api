import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const getTodo = async ({ id, userId }: { id: string; userId: string }) => {
  try {
    const { Items } = await db
      .query({
        TableName: process.env.TODO_TABLE || '',
        KeyConditionExpression: '#id = :id AND #userId = :userId',
        ExpressionAttributeNames: {
          '#userId': 'userId',
          '#id': 'id',
        },
        ExpressionAttributeValues: { ':userId': userId, ':id': id },
      })
      .promise();
    console.log(Items![0]);

    return Items![0];
  } catch (err) {
    console.log(err);
    return err;
  }
};
export default getTodo;
