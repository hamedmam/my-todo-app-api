import * as AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { v4 as uuid } from 'uuid';

const db = new AWS.DynamoDB.DocumentClient();

type TodoType = {
  userId: string;
  title: string;
  description: string;
  dueAt: number;
  categoryName: string;
  categoryColor: string;
};

const createTodo = async (
  newTodo: TodoType
): Promise<
  PromiseResult<AWS.DynamoDB.DocumentClient.PutItemOutput, AWS.AWSError>
> => {
  const { userId, title, description, dueAt, categoryName, categoryColor } =
    newTodo;
  const id = uuid();

  const todo = {
    id,
    ...newTodo,
  };

  try {
    const item = await db
      .put({
        TableName: process.env.TODO_TABLE || '',
        Item: {
          id,
          userId,
          title,
          description,
          dueAt,
          status: 'todo',
          categoryName,
          categoryColor,
        },
      })
      .promise();

    return {
      ...item,
      ...todo,
    };
  } catch (err) {
    console.log(err);
    return err;
  }
};

export default createTodo;
