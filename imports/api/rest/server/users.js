import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { JsonRoutes } from 'meteor/simple:json-routes';
import { Authentication } from 'meteor/simple:authenticate-user-by-token';

import { Boards } from '/imports/api/models/boards';
import { Users } from '/imports/api/models/users';


JsonRoutes.add('GET', '/api/user', function(req, res) {
  try {
    Authentication.checkLoggedIn(req.userId);
    const data = Meteor.users.findOne({ _id: req.userId});
    delete data.services;
    JsonRoutes.sendResult(res, {
      code: 200,
      data,
    });
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

JsonRoutes.add('GET', '/api/users', function (req, res) {
  try {
    Authentication.checkUserId(req.userId);
    JsonRoutes.sendResult(res, {
      code: 200,
      data: Meteor.users.find({}).map(function (doc) {
        return { _id: doc._id, username: doc.username };
      }),
    });
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

JsonRoutes.add('GET', '/api/users/:id', function (req, res) {
  try {
    Authentication.checkUserId(req.userId);
    const id = req.params.id;
    JsonRoutes.sendResult(res, {
      code: 200,
      data: Meteor.users.findOne({ _id: id }),
    });
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

JsonRoutes.add('PUT', '/api/users/:id', function (req, res) {
  try {
    Authentication.checkUserId(req.userId);
    const id = req.params.id;
    const action = req.body.action;
    let data = Meteor.users.findOne({ _id: id });
    if (data !== undefined) {
      if (action === 'takeOwnership') {
        data = Boards.find({
          'members.userId': id,
          'members.isAdmin': true,
        }).map(function(board) {
          if (board.hasMember(req.userId)) {
            board.removeMember(req.userId);
          }
          board.changeOwnership(id, req.userId);
          return {
            _id: board._id,
            title: board.title,
          };
        });
      } else {
        if ((action === 'disableLogin') && (id !== req.userId)) {
          Users.update({ _id: id }, { $set: { loginDisabled: true, 'services.resume.loginTokens': '' } });
        } else if (action === 'enableLogin') {
          Users.update({ _id: id }, { $set: { loginDisabled: '' } });
        }
        data = Meteor.users.findOne({ _id: id });
      }
    }
    JsonRoutes.sendResult(res, {
      code: 200,
      data,
    });
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

JsonRoutes.add('POST', '/api/users/', function (req, res) {
  try {
    Authentication.checkUserId(req.userId);
    const id = Accounts.createUser({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      from: 'admin',
    });
    JsonRoutes.sendResult(res, {
      code: 200,
      data: {
        _id: id,
      },
    });
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

JsonRoutes.add('DELETE', '/api/users/:id', function (req, res) {
  try {
    Authentication.checkUserId(req.userId);
    const id = req.params.id;
    Meteor.users.remove({ _id: id });
    JsonRoutes.sendResult(res, {
      code: 200,
      data: {
        _id: id,
      },
    });
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

