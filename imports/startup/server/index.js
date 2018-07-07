// This defines a starting set of data to be loaded if the app is loaded with an empty db.
import './fixtures.js';

// This file configures the Accounts package to define the UI of the reset password email.
// import '../imports/startup/server/reset-password-email.js';

// Set up some rate limiting and other important security settings.
// import '../imports/startup/server/security.js';

// This defines all the collections, publications and methods that the application provides
// as an API to the client.
import '/imports/api';

// All publications are needed here
// As the code is not actually used by third parties it could
// be moved out of `api`.
import '/imports/api/models/accountSettings/server/publications';
import '/imports/api/models/activities/server/publications';
import '/imports/api/models/announcements/server/publications';
import '/imports/api/models/avatars/server/publications';
import '/imports/api/models/boards/server/publications';
import '/imports/api/models/cardComments/server/publications';
import '/imports/api/models/cards/server/publications';
import '/imports/api/models/checklistItems/server/publications';
import '/imports/api/models/checklists/server/publications';
import '/imports/api/models/customFields/server/publications';
import '/imports/api/models/integrations/server/publications';
import '/imports/api/models/invitationCodes/server/publications';
import '/imports/api/models/lists/server/publications';
import '/imports/api/models/settings/server/publications';
import '/imports/api/models/swimlanes/server/publications';
import '/imports/api/models/unsavedEdits/server/publications';
import '/imports/api/models/users/server/publications';

// Various other stuff needed at startup
import '/imports/config/fastRender';
import './migrations';
import '/imports/api/statistics';
