export const allowIsBoardAdmin = function(userId, board) {
  return board && board.hasAdmin(userId);
};

export const allowIsBoardMember = function(userId, board) {
  return board && board.hasMember(userId);
};

export const allowIsBoardMemberNonComment = function(userId, board) {
  return board && board.hasMember(userId) && !board.hasCommentOnly(userId);
};

export const allowIsBoardMemberByCard = function(userId, card) {
  const board = card.board();
  return board && board.hasMember(userId);
};
