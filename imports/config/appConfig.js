import { Meteor } from 'meteor/meteor';

/** Tell if we're running under Sandstorm or we're running standalone.
 *
 * Sandstorm context is detected using the METEOR_SETTINGS environment variable
 * in the package definition.
 */
export const isSandstorm = Meteor.settings && Meteor.settings.public &&
  Meteor.settings.public.sandstorm;
