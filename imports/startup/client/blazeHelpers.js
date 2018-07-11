import { Blaze } from 'meteor/blaze';

import { Filter } from '/imports/ui/components/utils/filter';
import { Modal } from '/imports/ui/components/utils/modal';


Blaze.registerHelper('Filter', Filter);
Blaze.registerHelper('Modal', Modal);
