import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { Session } from 'meteor/session';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { DocHead } from 'meteor/kadira:dochead';
import { _ } from 'meteor/underscore';

import { Boards } from '/imports/api/models/boards';
import { Filter } from '/imports/ui/components/utils/filter';
import { EscapeActions } from '/imports/ui/lib/escapeActions';
import '/imports/ui/layouts/defaultLayout';
import '/imports/ui/pages/notFound';
import '/imports/ui/components/concerns/boards/boardsList';
import '/imports/ui/components/concerns/boards/boardsListHeaderBar';


let previousPath;
FlowRouter.triggers.exit([({path}) => {
  previousPath = path;
}]);

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('defaultLayout', { content: 'notFound' });
  },
};

FlowRouter.route('/', {
  name: 'home',
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  action() {
    Session.set('currentBoard', null);
    Session.set('currentList', null);
    Session.set('currentCard', null);

    Filter.reset();
    EscapeActions.executeAll();

    BlazeLayout.render('defaultLayout', {
      headerBar: 'boardListHeaderBar',
      content: 'boardList',
    });
  },
});

// We maintain a list of redirections to ensure that we don't break old URLs
// when we change our routing scheme.
const redirections = {
  '/boards': '/',
  '/boards/:id/:slug': '/b/:id/:slug',
  '/boards/:id/:slug/:cardId': '/b/:id/:slug/:cardId',
  '/import': '/import/trello',
};

_.each(redirections, (newPath, oldPath) => {
  FlowRouter.route(oldPath, {
    triggersEnter: [(context, redirect) => {
      redirect(FlowRouter.path(newPath, context.params));
    }],
  });
});

// As it is not possible to use template helpers in the page <head> we create a
// reactive function whose role is to set any page-specific tag in the <head>
// using the `kadira:dochead` package. Currently we only use it to display the
// board title if we are in a board page (see #364) but we may want to support
// some <meta> tags in the future.
const appTitle = 'Wekan';

// XXX The `Meteor.startup` should not be necessary -- we don't need to wait for
// the complete DOM to be ready to call `DocHead.setTitle`. But the problem is
// that the global variable `Boards` is undefined when this file loads so we
// wait a bit until hopefully all files are loaded. This will be fixed in a
// clean way once Meteor will support ES6 modules -- hopefully in Meteor 1.3.
Meteor.isClient && Meteor.startup(() => {
  Tracker.autorun(() => {
    const currentBoard = Boards.findOne(Session.get('currentBoard'));
    const titleStack = [appTitle];
    if (currentBoard) {
      titleStack.push(currentBoard.title);
    }
    DocHead.setTitle(titleStack.reverse().join(' - '));
  });
});
