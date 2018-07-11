import { JsonRoutes } from 'meteor/simple:json-routes';
import { Authentication } from 'meteor/simple:authenticate-user-by-token';
import { Random } from 'meteor/random';

import { Boards } from '/imports/api/models/boards';


JsonRoutes.add('GET', '/api/users/:userId/boards', function (req, res) {
  try {
    Authentication.checkLoggedIn(req.userId);
    const paramUserId = req.params.userId;
    // A normal user should be able to see their own boards,
    // admins can access boards of any user
    Authentication.checkAdminOrCondition(req.userId, req.userId === paramUserId);

    const data = Boards.find({
      archived: false,
      'members.userId': paramUserId,
    }, {
      sort: ['title'],
    }).map(function(board) {
      return {
        _id: board._id,
        title: board.title,
      };
    });

    JsonRoutes.sendResult(res, {code: 200, data});
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

JsonRoutes.add('GET', '/api/boards', function (req, res) {
  try {
    Authentication.checkUserId(req.userId);
    JsonRoutes.sendResult(res, {
      code: 200,
      data: Boards.find({ permission: 'public' }).map(function (doc) {
        return {
          _id: doc._id,
          title: doc.title,
        };
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

JsonRoutes.add('GET', '/api/boards/:id', function (req, res) {
  try {
    const id = req.params.id;
    Authentication.checkBoardAccess(req.userId, id);

    JsonRoutes.sendResult(res, {
      code: 200,
      data: Boards.findOne({ _id: id }),
    });
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

JsonRoutes.add('POST', '/api/boards', function (req, res) {
  try {
    Authentication.checkUserId(req.userId);
    const id = Boards.insert({
      title: req.body.title,
      members: [
        {
          userId: req.body.owner,
          isAdmin: true,
          isActive: true,
          isCommentOnly: false,
        },
      ],
      permission: 'public',
      color: 'belize',
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

JsonRoutes.add('DELETE', '/api/boards/:id', function (req, res) {
  try {
    Authentication.checkUserId(req.userId);
    const id = req.params.id;
    Boards.remove({ _id: id });
    JsonRoutes.sendResult(res, {
      code: 200,
      data:{
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

JsonRoutes.add('PUT', '/api/boards/:id/labels', function (req, res) {
  Authentication.checkUserId(req.userId);
  const id = req.params.id;
  try {
    if (req.body.hasOwnProperty('label')) {
      const board = Boards.findOne({ _id: id });
      const color = req.body.label.color;
      const name = req.body.label.name;
      const labelId = Random.id(6);
      if (!board.getLabel(name, color)) {
        Boards.direct.update({ _id: id }, { $push: { labels: { _id: labelId,  name,  color } } });
        JsonRoutes.sendResult(res, {
          code: 200,
          data: labelId,
        });
      } else {
        JsonRoutes.sendResult(res, {
          code: 200,
        });
      }
    }
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      data: error,
    });
  }
});

