import createTodo from './createTodo';
import getTodos from './getTodos';
import getTodo from './getTodo';
import getCategories from './getCategories';
import createCategory from './createCategory';
import getDueTodos from './getDueTodos';
import getTodosByCategory from './getTodosByCategory';
import deleteTodo from './deleteTodos';
import updateTodo from './updateTodo';

export type Category = {
  color: string;
  name: string;
  id: string;
};

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    id: string;
    name: string;
    color: string;
    title: string;
    description: string;
    dueAt: number;
    categoryName: string;
    categoryColor: string;
  };
  identity: {
    sub: string;
  };
};

exports.handler = async (event: AppSyncEvent) => {
  const userId = event.identity.sub;
  const {
    id,
    name,
    color,
    title,
    description,
    dueAt,
    categoryColor,
    categoryName,
  } = event.arguments;
  switch (event.info.fieldName) {
    case 'createTodo':
      return await createTodo({
        userId,
        title,
        description,
        dueAt,
        categoryColor,
        categoryName,
      });
    case 'updateTodo':
      return await updateTodo({ userId, id, title, description, dueAt });
    case 'getTodos':
      return await getTodos(userId);
    case 'getDueTodos':
      return await getDueTodos(userId);
    case 'getTodosByCategory':
      return await getTodosByCategory({ userId, categoryName });
    case 'getTodo':
      return await getTodo({ id, userId });
    case 'deleteTodo':
      return await deleteTodo({ id, userId });
    case 'createCategory':
      return await createCategory({ userId, name, color });
    case 'getCategories':
      return await getCategories(userId);
    default:
      return '';
  }
};
