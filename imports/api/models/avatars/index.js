import { FS } from 'meteor/cfs:base-package';


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
