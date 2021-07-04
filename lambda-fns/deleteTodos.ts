import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const deleteTodo = async ({ userId, id }: { userId: string; id: string }) => {
  try {
    const res = await db
      .delete({
        TableName: process.env.TODO_TABLE || '',
        Key: {
          id,
          userId,
        },
        ConditionExpression: '#id = :id AND #userId = :userId',
        ExpressionAttributeNames: {
          '#userId': 'userId',
          '#id': 'id',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':id': id,
        },
      })
      .promise();
    console.log(res);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
export default deleteTodo;
