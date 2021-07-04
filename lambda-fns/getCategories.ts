import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const getCategories = async (userId: string) => {
  try {
    const { Items } = await db
      .query({
        TableName: process.env.CATEGORY_TABLE || '',
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeNames: {
          '#userId': 'userId',
        },
        ExpressionAttributeValues: { ':userId': userId },
      })
      .promise();
    console.log(Items);

    return Items;
  } catch (err) {
    console.log(err);
    return err;
  }
};
export default getCategories;
