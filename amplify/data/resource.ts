import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a 'content' field. Try
adding a new 'isDone' field as a boolean. The authorization rule below
specifies that any unauthenticated user can 'create', 'read', 'update', 
and 'delete' any 'Todo' records.
=========================================================================*/
const schema = a.schema({
  User: a.model({
    username: a.string().required(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    height: a.float().required(),
    gender: a.string().required(),
    measurements: a.hasOne('Measurement', 'userId'),
    photos: a.hasMany('UserPhoto', 'userId'),
    tryOnInstances: a.hasMany('TryOnInstance', 'userId'),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read']),
      allow.owner().to(['read', 'update', 'delete']),
    ]),

  Measurement: a.model({
    userId: a.string().required(),
    user: a.belongsTo('User', 'userId'),
    chest: a.float().required(),
    hips: a.float().required(),
  })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read']),
      allow.owner().to(['read', 'update', 'delete']),
    ]),

  UserPhoto: a.model({
    userId: a.string().required(),
    user: a.belongsTo('User', 'userId'),
    type: a.enum(['FRONT', 'BACK', 'SIDE', 'SAVED']),
    photoUrl: a.string().required(),
  })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read', 'delete']),
      allow.owner().to(['read', 'update', 'delete']),
    ]),

  Retailer: a.model({
    name: a.string().required(),
    bio: a.string(),
    logoUrl: a.string(),
    products: a.hasMany('Product', 'retailerId'),
    sizeGuide: a.hasOne('SizeGuide', 'retailerId'),
  })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
      allow.owner().to(['update', 'delete', 'read']),
    ]),

  Product: a.model({
    retailerId: a.string().required(),
    retailer: a.belongsTo('Retailer', 'retailerId'),
    name: a.string().required(),
    description: a.string(),
    gender: a.enum(['MALE', 'FEMALE', 'UNISEX']),
    type: a.enum(['TOP', 'BOTTOM', 'DRESS']),
    price: a.float().required(),
    frontEndImageUrl: a.string().required(),
    backEndImageUrl: a.string().required(),
    sizeGuide: a.hasOne('SizeGuide', 'productId'),
    tryOnInstances: a.hasMany('TryOnInstance', 'productId'),
  })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
      allow.owner().to(['read', 'update', 'delete']),
    ]),

  TryOnInstance: a.model({
    userId: a.string().required(),
    user: a.belongsTo('User', 'userId'),
    productId: a.string().required(),
    product: a.belongsTo('Product', 'productId'),
    photoUrl: a.string().required(),
    recommendedSize: a.string().required(),
  })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read']),
      allow.owner().to(['read', 'update', 'delete']),
    ]),

  SizeGuide: a.model({
    retailerId: a.string().required(),
    retailer: a.belongsTo('Retailer', 'retailerId'),
    productId: a.string(),
    product: a.belongsTo('Product', 'productId'),
    category: a.enum(['TOP', 'BOTTOM', 'DRESS']),
    name: a.string().required(),
    measurements: a.json().required(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read']),
      allow.owner().to(['read', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
'use client'
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
