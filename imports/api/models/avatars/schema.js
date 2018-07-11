import { FS } from 'meteor/cfs:base-package';


// ----------------------------[     Schema      ]----------------------------

export const Avatars = new FS.Collection('avatars', {
  stores: [
    new FS.Store.GridFS('avatars'),
  ],
  filter: {
    maxSize: 72000,
    allow: {
      contentTypes: ['image/*'],
    },
  },
});

// ----------------------------[   Alow / Deny   ]----------------------------

function isOwner(userId, file) {
  return userId && userId === file.userId;
}

Avatars.allow({
  insert: isOwner,
  update: isOwner,
  remove: isOwner,
  download() { return true; },
  fetch: ['userId'],
});

// ----------------------------[     Various     ]----------------------------
