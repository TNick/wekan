import { JsonRoutes } from 'meteor/simple:json-routes';
import { Authentication } from 'meteor/simple:authenticate-user-by-token';

import { Cards } from '/imports/api/models/cards';
import { Users } from '/imports/api/models/users';

import { cardCreation, cardMove, cardRemover } from '/imports/api/models/cards/hooks';


JsonRoutes.add('GET', '/api/boards/:boardId/lists/:listId/cards', function (req, res) {
  const paramBoardId = req.params.boardId;
  const paramListId = req.params.listId;
  Authentication.checkBoardAccess(req.userId, paramBoardId);
  JsonRoutes.sendResult(res, {
    code: 200,
    data: Cards.find({boardId: paramBoardId, listId: paramListId, archived: false}).map(function (doc) {
      return {
        _id: doc._id,
        title: doc.title,
        description: doc.description,
      };
    }),
  });
});

JsonRoutes.add('GET', '/api/boards/:boardId/lists/:listId/cards/:cardId', function (req, res) {
  const paramBoardId = req.params.boardId;
  const paramListId = req.params.listId;
  const paramCardId = req.params.cardId;
  Authentication.checkBoardAccess(req.userId, paramBoardId);
  JsonRoutes.sendResult(res, {
    code: 200,
    data: Cards.findOne({_id: paramCardId, listId: paramListId, boardId: paramBoardId, archived: false}),
  });
});

JsonRoutes.add('POST', '/api/boards/:boardId/lists/:listId/cards', function (req, res) {
  Authentication.checkUserId(req.userId);
  const paramBoardId = req.params.boardId;
  const paramListId = req.params.listId;
  const check = Users.findOne({_id: req.body.authorId});
  const members = req.body.members || [req.body.authorId];
  if (typeof  check !== 'undefined') {
    const id = Cards.direct.insert({
      title: req.body.title,
      boardId: paramBoardId,
      listId: paramListId,
      description: req.body.description,
      userId: req.body.authorId,
      swimlaneId: req.body.swimlaneId,
      sort: 0,
      members,
    });
    JsonRoutes.sendResult(res, {
      code: 200,
      data: {
        _id: id,
      },
    });

    const card = Cards.findOne({_id:id});
    cardCreation(req.body.authorId, card);

  } else {
    JsonRoutes.sendResult(res, {
      code: 401,
    });
  }
});

JsonRoutes.add('PUT', '/api/boards/:boardId/lists/:listId/cards/:cardId', function (req, res) {
  Authentication.checkUserId(req.userId);
  const paramBoardId = req.params.boardId;
  const paramCardId = req.params.cardId;
  const paramListId = req.params.listId;

  if (req.body.hasOwnProperty('title')) {
    const newTitle = req.body.title;
    Cards.direct.update({_id: paramCardId, listId: paramListId, boardId: paramBoardId, archived: false},
      {$set: {title: newTitle}});
  }
  if (req.body.hasOwnProperty('listId')) {
    const newParamListId = req.body.listId;
    Cards.direct.update({_id: paramCardId, listId: paramListId, boardId: paramBoardId, archived: false},
      {$set: {listId: newParamListId}});

    const card = Cards.findOne({_id: paramCardId} );
    cardMove(req.body.authorId, card, {fieldName: 'listId'}, paramListId);

  }
  if (req.body.hasOwnProperty('description')) {
    const newDescription = req.body.description;
    Cards.direct.update({_id: paramCardId, listId: paramListId, boardId: paramBoardId, archived: false},
      {$set: {description: newDescription}});
  }
  if (req.body.hasOwnProperty('labelIds')) {
    const newlabelIds = req.body.labelIds;
    Cards.direct.update({_id: paramCardId, listId: paramListId, boardId: paramBoardId, archived: false},
      {$set: {labelIds: newlabelIds}});
  }
  JsonRoutes.sendResult(res, {
    code: 200,
    data: {
      _id: paramCardId,
    },
  });
});


JsonRoutes.add('DELETE', '/api/boards/:boardId/lists/:listId/cards/:cardId', function (req, res) {
  Authentication.checkUserId(req.userId);
  const paramBoardId = req.params.boardId;
  const paramListId = req.params.listId;
  const paramCardId = req.params.cardId;

  Cards.direct.remove({_id: paramCardId, listId: paramListId, boardId: paramBoardId});
  const card = Cards.find({_id: paramCardId} );
  cardRemover(req.body.authorId, card);
  JsonRoutes.sendResult(res, {
    code: 200,
    data: {
      _id: paramCardId,
    },
  });

});
