import { Blaze } from 'meteor/blaze';
import { _ } from 'meteor/underscore';

import { Filter } from '/imports/ui/components/utils/filter';
import { Modal } from '/imports/ui/components/utils/modal';
import { UnsavedEdits } from '/imports/ui/lib/unsavedEdits';
import { MultiSelection } from '/imports/ui/lib/multiSelection';


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
