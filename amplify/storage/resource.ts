import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'FitlyStorage',
    access: (allow) => ({
        'saved-photos/*': [
            allow.authenticated.to(['read', 'write', 'delete']),
            allow.guest.to(['read'])
        ],
        'product-images/*': [
            allow.authenticated.to(['read', 'write', 'delete']),
            allow.guest.to(['read'])
        ]
    })
});