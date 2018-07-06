import { Meteor } from 'meteor/meteor';

// Sandstorm context is detected using the METEOR_SETTINGS environment variable
// in the package definition.
const isSandstorm = Meteor.settings && Meteor.settings.public &&
  Meteor.settings.public.sandstorm;
export const Users = Meteor.users;
