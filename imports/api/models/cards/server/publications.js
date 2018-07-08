import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Cards } from '/imports/api/models/cards';


Meteor.publish('card', (cardId) => {
  check(cardId, String);
  return Cards.find({ _id: cardId });
});
