import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Users } from '/imports/api/models/users';


export const Announcements = new Mongo.Collection('announcements');

// ----------------------------[     Schema      ]----------------------------

Announcements.attachSchema(new SimpleSchema({
  enabled: {
    type: Boolean,
    defaultValue: false,
  },
  title: {
    type: String,
    optional: true,
  },
  body: {
    type: String,
    optional: true,
  },
  sort: {
    type: Number,
    decimal: true,
  },
}));

// ----------------------------[   Alow / Deny   ]----------------------------

Announcements.allow({
  update(userId) {
    const user = Users.findOne(userId);
    return user && user.isAdmin;
  },
});

// ----------------------------[     Various     ]----------------------------

if (Meteor.isServer) {
  Meteor.startup(() => {
    const announcements = Announcements.findOne({});
    if(!announcements){
      Announcements.insert({enabled: false, sort: 0});
    }
  });
}
