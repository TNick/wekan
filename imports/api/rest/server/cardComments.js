import { JsonRoutes } from 'meteor/simple:json-routes';
import { Authentication } from 'meteor/simple:authenticate-user-by-token';

import { CardComments } from '/imports/api/models/cardComments';
import { commentCreation } from '/imports/api/models/cardComments/hooks';

JsonRoutes.add('GET', '/api/boards/:boardId/cards/:cardId/comments', function (req, res) {
  try {
    Authentication.checkUserId( req.userId);
    const paramBoardId = req.params.boardId;
    const paramCardId = req.params.cardId;
    JsonRoutes.sendResult(res, {
      code: 200,
      data: CardComments.find({ boardId: paramBoardId, cardId: paramCardId}).map(function (doc) {
        return {
          _id: doc._id,
          comment: doc.text,
          authorId: doc.userId,
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

JsonRoutes.add('GET', '/api/boards/:boardId/cards/:cardId/comments/:commentId', function (req, res) {
  try {
    Authentication.checkUserId( req.userId);
    const paramBoardId = req.params.boardId;
    const paramCommentId = req.params.commentId;
    const paramCardId = req.params.cardId;
    JsonRoutes.sendResult(res, {
      code: 200,
      data: CardComments.findOne({ _id: paramCommentId, cardId: paramCardId, boardId: paramBoardId }),
    });
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

JsonRoutes.add('POST', '/api/boards/:boardId/cards/:cardId/comments', function (req, res) {
  try {
    Authentication.checkUserId( req.userId);
    const paramBoardId = req.params.boardId;
    const paramCardId = req.params.cardId;
    const id = CardComments.direct.insert({
      userId: req.body.authorId,
      text: req.body.comment,
      cardId: paramCardId,
      boardId: paramBoardId,
    });

    JsonRoutes.sendResult(res, {
      code: 200,
      data: {
        _id: id,
      },
    });

    const cardComment = CardComments.findOne({_id: id, cardId:paramCardId, boardId: paramBoardId });
    commentCreation(req.body.authorId, cardComment);
  }
  catch (error) {
    JsonRoutes.sendResult(res, {
      code: 200,
      data: error,
    });
  }
});

JsonRoutes.add('DELETE', '/api/boards/:boardId/cards/:cardId/comments/:commentId', function (req, res) {
  try {
    Authentication.checkUserId( req.userId);
    const paramBoardId = req.params.boardId;
    const paramCommentId = req.params.commentId;
    const paramCardId = req.params.cardId;
    CardComments.remove({ _id: paramCommentId, cardId: paramCardId, boardId: paramBoardId });
    JsonRoutes.sendResult(res, {
      code: 200,
      data: {
        _id: paramCardId,
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
