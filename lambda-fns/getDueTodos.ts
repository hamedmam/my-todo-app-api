import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const setDateInNumber = (date: number) => (date < 10 ? '0' + date : date);

const transformDateToNumber = (date: Date) => {
  const year = date.getFullYear().toString();
  const month = setDateInNumber(date.getMonth()).toString();
  const day = setDateInNumber(date.getDate()).toString();
  return Number(year + month + day);
};

const getDueTodos = async (userId: string) => {
  try {
    const date = new Date();
    const today = transformDateToNumber(date);
    const { Items } = await db
      .query({
        TableName: process.env.TODO_TABLE || '',
        IndexName: 'dueAtIndex',
        KeyConditionExpression: '#userId = :userId AND #dueAt = :dueAt',
        ExpressionAttributeNames: {
          '#userId': 'userId',
          '#dueAt': 'dueAt',
        },
        ExpressionAttributeValues: { ':userId': userId, ':dueAt': today },
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
export default getDueTodos;
