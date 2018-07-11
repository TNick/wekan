import { Blaze } from 'meteor/blaze';
import { _ } from 'meteor/underscore';
import { Session } from 'meteor/session';

import { Filter } from '/imports/ui/components/utils/filter';
import { Modal } from '/imports/ui/components/utils/modal';
import { UnsavedEdits } from '/imports/ui/lib/unsavedEdits';
import { MultiSelection } from '/imports/ui/lib/multiSelection';
import { Lists } from '/imports/api/models/lists';
import { Boards } from '/imports/api/models/boards';
import { Cards } from '/imports/api/models/cards';
import { Utils } from '/imports/ui/lib/utils';
import { Users } from '/imports/api/models/users';


Blaze.registerHelper('Filter', Filter);

Blaze.registerHelper('Modal', Modal);

Blaze.registerHelper('getUnsavedValue', (fieldName, docId, defaultTo) => {
  // Workaround some blaze feature that pass a list of keywords arguments as the
  // last parameter (even if the caller didn't specify any).
  if (!_.isString(defaultTo)) {
    defaultTo = '';
  }
  return UnsavedEdits.get({ fieldName, docId }, defaultTo);
});

Blaze.registerHelper('hasUnsavedValue', (fieldName, docId) => {
  return UnsavedEdits.has({ fieldName, docId });
});

Blaze.registerHelper('MultiSelection', MultiSelection);

Blaze.registerHelper('currentBoard', () => {
  const boardId = Session.get('currentBoard');
  if (boardId) {
    return Boards.findOne(boardId);
  } else {
    return null;
  }
});

Blaze.registerHelper('currentCard', () => {
  const cardId = Session.get('currentCard');
  if (cardId) {
    return Cards.findOne(cardId);
  } else {
    return null;
  }
});

Blaze.registerHelper('currentList', () => {
  const listId = Session.get('currentList');
  if (listId) {
    return Lists.findOne(listId);
  } else {
    return null;
  }
});

Blaze.registerHelper('getUser', (userId) => Users.findOne(userId));

Blaze.registerHelper('concat', (...args) => args.slice(0, -1).join(''));

Blaze.registerHelper('isMiniScreen', () => Utils.isMiniScreen());
