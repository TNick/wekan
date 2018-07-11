import { FlowRouter } from 'meteor/kadira:flow-router';

import './useraccounts-configuration';
import './routes';
import './accessibility';
import './windowEvents';
import './i18n';
import './blazeHelpers';
import './gecko-fix';
import './presence';
import '/imports/api/statistics';


// prevents annoying error message that there's no path for /
FlowRouter.wait();
