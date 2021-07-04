import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const getTodosByCategory = async ({
  userId,
  categoryName,
}: {
  userId: string;
  categoryName: string;
}) => {
  try {
    const { Items } = await db
      .query({
        TableName: process.env.TODO_TABLE || '',
        IndexName: 'categoryIndex',
        KeyConditionExpression:
          '#userId = :userId AND #categoryName = :categoryName',
        ExpressionAttributeNames: {
          '#userId': 'userId',
          '#categoryName': 'categoryName',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':categoryName': categoryName,
        },
        ScanIndexForward: false,
      })
      .promise();
    console.log(Items);

    return Items;
  } catch (err) {
    console.log(err);
    return err;
  }
};
export default getTodosByCategory;
