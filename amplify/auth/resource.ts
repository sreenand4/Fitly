import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    givenName: {
      required: true,
      mutable: true,
    },
    familyName: {
      required: true,
      mutable: true,
    },
    'custom:userType': {
      dataType: 'String',
      mutable: true,
    },
    'custom:companyName': {
      dataType: 'String',
      mutable: true,
    }
  },
});
