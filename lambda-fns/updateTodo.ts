import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

type UpdateTodoType = {
  userId: string;
  id: string;
  title: string;
  description: string;
  dueAt: number;
};

const updateTodo = async (updatedTodo: UpdateTodoType) => {
  const { userId, id, title, description, dueAt } = updatedTodo;
  try {
    const res = await db
      .update({
        TableName: process.env.TODO_TABLE || '',
        Key: {
          id,
          userId,
        },
        UpdateExpression:
          'set title = :title, description = :description, dueAt = :dueAt',
        ExpressionAttributeValues: {
          ':title': title,
          ':description': description,
          ':dueAt': dueAt,
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();

    return {
      ...res.Attributes,
      ...updatedTodo,
    };
  } catch (err) {
    console.log(err);
    return err;
  }
};
export default updateTodo;
