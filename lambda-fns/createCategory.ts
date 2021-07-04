import * as AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk';
import { PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { v4 as uuid } from 'uuid';

const db = new AWS.DynamoDB.DocumentClient();

type Category = {
  userId: string;
  name: string;
  color: string;
};

const createCategory = async (
  newCategory: Category
): Promise<
  PromiseResult<AWS.DynamoDB.DocumentClient.PutItemOutput, AWS.AWSError>
> => {
  const { userId, name, color } = newCategory;

  const id = uuid();

  const category = {
    id,
    ...newCategory,
  };

  try {
    const item = await db
      .put({
        TableName: process.env.CATEGORY_TABLE || '',
        Item: {
          id,
          userId,
          name,
          color,
        },
      })
      .promise();

    return {
      ...item,
      ...category,
    };
  } catch (err) {
    console.log(err);
    return err;
  }
};

export default createCategory;
