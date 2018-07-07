/**
 * Fast Render can improve the initial load time of your app, giving you
 * 2-10 times faster initial page loads. It provides the same effect as
 * Server Side Rendering (SSR), but still sends data over the wire to
 * avoid breaking one of Meteor’s core principles.
 */

import { FastRender } from 'meteor/staringatlights:fast-render';

FastRender.onAllRoutes(function() {
  this.subscribe('boards');
});

FastRender.route('/b/:id/:slug', function({ id }) {
  this.subscribe('board', id);
});
