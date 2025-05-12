import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'UserSavedPhotos',
    access: (allow) => ({
        'saved-photos/*': [
            allow.authenticated.to(['read', 'write', 'delete']),
            allow.guest.to(['read'])
        ]
    })
}); 