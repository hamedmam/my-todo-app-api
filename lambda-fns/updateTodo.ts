import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

type UpdateTodoType = {
  userId: string;
  id: string;
  title: string;
  description: string;
  dueAt: number;
  status: string;
};

const updateTodo = async (updatedTodo: UpdateTodoType) => {
  const { userId, id, title, description, dueAt, status } = updatedTodo;
  try {
    const res = await db
      .update({
        TableName: process.env.TODO_TABLE || '',
        Key: {
          id,
          userId,
        },
        UpdateExpression:
          'set title = :title, description = :description, dueAt = :dueAt, #s = :status',
        ExpressionAttributeNames: {
          '#s': 'status',
        },
        ExpressionAttributeValues: {
          ':title': title,
          ':description': description,
          ':dueAt': dueAt,
          ':status': status,
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
