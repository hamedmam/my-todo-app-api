import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export class MyTodoAppApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // UserPool
    const userPool = new cognito.UserPool(this, 'MyTodoAppUserPool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    // UserPoolClient
    const userPoolClient = new cognito.UserPoolClient(
      this,
      'MyTodoAppUserPoolClient',
      {
        userPool,
      }
    );

    // AppSync API
    const api = new appsync.GraphqlApi(this, 'MyTodoAppAppSyncApi', {
      name: 'MyTodoAppAppSyncApi',
      schema: appsync.Schema.fromAsset('./graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool,
            },
          },
        ],
      },
      xrayEnabled: true,
    });

    // AppSync cache
    // new appsync.CfnApiCache(this, 'MyTodoAppAppSyncApiCache', {
    //   apiCachingBehavior: 'FULL_REQUEST_CACHING',
    //   ttl: 300,
    //   apiId: api.apiId,
    //   type: 'SMALL',
    // });

    // Gateway Lambda
    const mainLambda = new lambda.Function(this, 'MyTodoAppMainLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
      memorySize: 1024,
    });

    // Lambda Datasource
    const lambdaDs = api.addLambdaDataSource('lambdaDataSource', mainLambda);

    // resolvers
    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'createTodo',
    });

    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteTodo',
    });

    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateTodo',
    });

    lambdaDs.createResolver({
      typeName: 'Query',
      fieldName: 'getTodo',
    });

    lambdaDs.createResolver({
      typeName: 'Query',
      fieldName: 'getTodos',
    });

    lambdaDs.createResolver({
      typeName: 'Query',
      fieldName: 'getDueTodos',
    });

    lambdaDs.createResolver({
      typeName: 'Query',
      fieldName: 'getTodosByCategory',
    });

    lambdaDs.createResolver({
      typeName: 'Query',
      fieldName: 'getTodosByStatus',
    });

    // Tables
    const todoTable = new dynamodb.Table(this, 'MyTodoAppTodoTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    todoTable.addLocalSecondaryIndex({
      indexName: 'dueAtIndex',
      sortKey: {
        name: 'dueAt',
        type: dynamodb.AttributeType.NUMBER,
      },
    });

    todoTable.addLocalSecondaryIndex({
      indexName: 'statusIndex',
      sortKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
    });

    todoTable.addLocalSecondaryIndex({
      indexName: 'categoryIndex',
      sortKey: {
        name: 'categoryName',
        type: dynamodb.AttributeType.STRING,
      },
    });

    todoTable.addLocalSecondaryIndex({
      indexName: 'titleIndex',
      sortKey: {
        name: 'title',
        type: dynamodb.AttributeType.STRING,
      },
    });

    const categoryTable = new dynamodb.Table(this, 'MyTodoAppCategoryTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // resolvers
    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'createCategory',
    });

    lambdaDs.createResolver({
      typeName: 'Query',
      fieldName: 'getCategories',
    });

    todoTable.grantFullAccess(mainLambda);
    categoryTable.grantFullAccess(mainLambda);

    mainLambda.addEnvironment('TODO_TABLE', todoTable.tableName);
    mainLambda.addEnvironment('CATEGORY_TABLE', categoryTable.tableName);

    // CDK outputs
    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });

    new cdk.CfnOutput(this, 'AppSyncAPIKey', {
      value: api.apiKey || '',
    });

    new cdk.CfnOutput(this, 'ProjectRegion', {
      value: this.region,
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });
  }
}
