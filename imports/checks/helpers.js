import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { TAPi18n } from 'meteor/tap:i18n';
import { stub } from 'sinon';
import { _ } from 'meteor/underscore';
import { expect } from 'meteor/practicalmeteor:chai';

import { Boards } from '/imports/api/models/boards';
import { Users } from '/imports/api/models/users';
import { Swimlanes } from '/imports/api/models/swimlanes';
import { Lists } from '/imports/api/models/lists';
import { Cards } from '/imports/api/models/cards';
import { Settings } from '/imports/api/models/settings';

/**
 * This is used to stub Meteor.user and Meteor.userId
 */
export let currentUser = null;
export const setCurrentUser = (value) => {
  currentUser = value;
};


/**
 * In order for us to be able to reset the database from client side we provide
 * a `test.resetDatabase` method.
 *
 * Example use:
 *
 *     describe('my module', function (done) {
 *       // We need to wait until the method call is done before moving on, so we
 *       // use Mocha's async mechanism (calling a done callback)
 *       beforeEach(function (done) {
 *           Meteor.call('test.resetDatabase', done);
 *       });
 *     });
 */
if ((Meteor.isTest) || (Meteor.isAppTest)) {
  // NOTE: Before writing a method like this you'll want to double check
  // that this file is only going to be loaded in test mode!!
  Meteor.methods({
    'test.resetDatabase': () => resetDatabase(),
  });
}

/**
 * Lists object's own properties using Meteor._debug.
 *
 *  Example:
 *      printOwnProperties(TAPi18n);
 *
 * @param {*} obj The object to print
 */
export const printOwnProperties = (obj) => {
  Meteor._debug('========[ Object Properties ]========');
  Meteor._debug(obj);
  Meteor._debug('-------------------------------------');
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      try {
        Meteor._debug(`${key}: ${obj[key]}`);
      } catch(error) {
        Meteor._debug(`${key}: cannot print (${error})`);
      }
    }
  }
  Meteor._debug('=====================================');
};

/**
 * Function to clean the database from either cleint or server.
 */
export const wipeDatabase = (done) => {
  if (Meteor.isClient) {
    Meteor.call('test.resetDatabase', (error, result) => {
      if (error) {
        Meteor._debug('Failed to reset the database: ', error);
      }
      if (done) done();
    });
  } else {
    resetDatabase(null, () => {
      if (done) done();
    });
  }
};

/**
 * Holds the objects being tested.
 */
class TestStage {

  constructor() {
    this.users = [];
    this.admins = [];
    this.boards = [];
  }

  /**
   * Creates some objects in the database.
   *
   * The method expects an array of words, each describing a type of
   * object or objects:
   *
   * - settings: save default settings to database if not already set;
   * - user: create a single user;
   * - admin: make first user an admin;
   * - crtuser: make first user current user;
   * - board: create a board; implies ['user']
   * - list: create a single list in first board; implies ['board', 'user']
   * - swim: create a single swimlane in first board; implies ['board', 'user']
   * - card: create a single card in first board; implies ['list', 'swim', 'user']
   * - users: create N users; 'user' is ignored;
   * - admins: make all users admins;
   * - boards: create N boards; implies ['user']
   * - lists: create N lists in first board; implies ['board', 'user']
   * - swims: create N swimlanes in first board; implies ['board', 'user']
   * - cards: create N cards in first board; implies ['list', 'swim', 'user']
   *
   * N is 3 by default. You can use third argument to change that.
   */
  bootstrapTest (args, N) {
    if (N === undefined) {
      N = 3;
    }

    const crtusers = [];
    const crtadmins = [];
    const crtboards = [];

    if (_.contains(args, 'settings')) {
      this.addSettings();
    }

    // by default no admin
    let adminCount = 0;
    if (_.contains(args, 'admins')) {
      // all users created in this run will be admins
      adminCount = -1;
    } else if (_.contains(args, 'admin')) {
      // only first user becomes admin
      adminCount = 1;
    }

    // Decide the number of users to create.
    let userCount = 0;
    if (_.contains(args, 'users')) {
      userCount = N;
    } else if (_.contains(args, 'user')) {
      userCount = 1;
    }
    if (userCount === 0) {
      if (_.intersection(args, ['board', 'list', 'swim', 'card', 'boards', 'lists', 'swims', 'cards', 'crtuser']).length) {
        userCount = 1;
      }
    }

    // Here is where we create the users.
    while(userCount > 0) {
      const options = {};
      if (adminCount === 0) {
        options.isAdmin = false;
      } else {
        options.isAdmin = true;
        --adminCount;
      }
      const userId = Users.insert(options);
      expect(userId).to.be.a.string;
      const user = Users.find(userId);
      expect(user).to.be.a.object;
      this.users.push(user);
      if (options.isAdmin) {
        this.admins.push(user);
        crtadmins.push(user);
      }
      crtusers.push(user);
      --userCount;
    }

    if (_.contains(args, 'crtuser')) {
      currentUser = crtusers[0];
    }

    // Decide the number of boards to create.
    let boardCount = 0;
    if (_.contains(args, 'boards')) {
      boardCount = N;
    } else if (_.contains(args, 'board')) {
      boardCount = 1;
    }
    if (boardCount === 0) {
      if (_.intersection(args, ['list', 'swim', 'card', 'lists', 'swims', 'cards']).length) {
        boardCount = 1;
      }
    }

    // Here is where we create the boards.
    for(let i = 0; i < boardCount; ++i) {
      const options = {
        members: [
          {
            userId: crtusers[0],
            isAdmin: true,
            isActive: true,
            isCommentOnly: false,
          },
        ],
      };
      const boardId = Boards.insert(options);
      expect(boardId).to.be.a.string;
      const board = Boards.find(boardId);
      expect(board).to.be.a.object;
      board.swimlanes = [];
      board.lists = [];
      board.cards = [];
      this.boards.push(board);
      crtboards.push(board);
    }
    Meteor._debug(boardCount, 'boards created');

    // Decide the number of swimlanes to create.
    let swimCount = 0;
    if (_.contains(args, 'swims')) {
      swimCount = N;
    } else if (_.contains(args, 'swim')) {
      swimCount = 1;
    }
    if (swimCount === 0) {
      if (_.intersection(args, ['card', 'cards']).length) {
        swimCount = 1;
      }
    }

    // Here is where we create the swimLanes.
    this.addSwimlane(crtboards[0], swimCount);
    Meteor._debug(swimCount, 'swimlanes created');

    // Decide the number of lists to create.
    let listCount = 0;
    if (_.contains(args, 'lists')) {
      listCount = N;
    } else if (_.contains(args, 'list')) {
      listCount = 1;
    }
    if (listCount === 0) {
      if (_.intersection(args, ['card', 'cards']).length) {
        listCount = 1;
      }
    }

    // Here is where we create the lists.
    this.addList(crtboards[0], listCount);
    Meteor._debug(listCount, 'lists created');

    // Decide the number of cards to create.
    let cardsCount = 0;
    if (_.contains(args, 'cards')) {
      cardsCount = N;
    } else if (_.contains(args, 'card')) {
      cardsCount = 1;
    }
    if (cardsCount === 0) {
      if (_.intersection(args, ['card', 'cards']).length) {
        cardsCount = 1;
      }
    }

    // Here is where we create the cards.
    this.addCard(
      crtboards[0], 0, 0, cardsCount);
    Meteor._debug(cardsCount, 'cards created');
  }

  /** Default settings. */
  addSettings() {
    if (Settings.findOne() === undefined) {
      Settings.insert({
        disableRegistration: false,
        mailServer: {
          username: '',
          password: '',
          host: '',
          port: '',
          enableTLS: false,
          from: '',
        },
      });
    }
  }

  /** Create a list. */
  addList (board, count) {
    while(count > 0) {
      const options = {
        boardId: board._id,
      };
      const listId = Lists.insert(options);
      expect(listId).to.be.a.string;
      const list = Lists.find(listId);
      list.cards = [];
      expect(list).to.be.a.object;
      board.lists.push(list);
      --count;
    }
  }

  /** Create a swimlane. */
  addSwimlane (board, count) {
    while(count > 0) {
      const options = {
        boardId: board._id,
      };
      const swimId = Swimlanes.insert(options);
      expect(swimId).to.be.a.string;
      const swim = Swimlanes.find(swimId);
      swim.cards = [];
      expect(swim).to.be.a.object;
      board.swimlanes.push(swim);
      --count;
    }
  }

  /** Create a card. */
  addCard (board, list, swimlane, count) {
    while(count > 0) {
      const options = {
        boardId: board._id,
        listId: list._id,
        swimlaneId: swimlane._id,
      };
      const cardId = Cards.insert(options);
      expect(cardId).to.be.a.string;
      const card = Cards.find(cardId);
      expect(card).to.be.a.object;
      board.cards.push(card);
      board.lists[list].cards.push(card);
      board.swimlanes[swimlane].cards.push(card);
      --count;
    }
  }

}


/**
 * Creates some objects in teh database.
 *
 * The method expects an array of words, each describing a type of
 * object or objects:
 *
 * - user: create a single user;
 * - admin: make first user an admin;
 * - crtuser: make first user current user;
 * - board: create a board; implies ['user']
 * - list: create a single list in first board; implies ['board', 'user']
 * - swim: create a single swimlane in first board; implies ['board', 'user']
 * - card: create a single card in first board; implies ['list', 'swim', 'user']
 * - users: create N users;
 * - admins: make all users admins;
 * - boards: create N boards; implies ['user']
 * - lists: create N lists in first board; implies ['board', 'user']
 * - swims: create N swimlanes in first board; implies ['board', 'user']
 * - cards: create N cards in first board; implies ['list', 'swim', 'user']
 *
 * N is 3 by default. You can use third argument to change that.
 */
export const bootstrapTest = (args, N) => {
  const result = new TestStage();
  result.bootstrapTest(args, N);
  return result;
};

/**
 * Common initialization of tests.
 *
 * While it is possible to have global <beforeEach, afterEach> some
 * tests might need to opt out of those.
 */
export const initTest = (done, args, N) => {
  let data = null;
  if (args !== undefined) {
    data = new TestStage();
  }
  stub(TAPi18n, '__').callsFake((arg) => arg);
  stub(Meteor, 'userId').callsFake(() => {
    if (currentUser === null)
      return null;
    else
      return currentUser._id;
  });
  stub(Meteor, 'user').callsFake(() => currentUser);

  wipeDatabase(() => {
    if (args !== undefined) {
      data.bootstrapTest(args, N);
    }
    if (done) done();
  });
  return data;
};

/**
 * Common termination of tests.
 *
 * While it is possible to have global <beforeEach, afterEach> some
 * tests might need to opt out of those.
 */
export const endTest = (done) => {
  wipeDatabase(done);
  TAPi18n.__.restore();
  try {
    Meteor.user.restore();
    Meteor.userId.restore();
  } catch(error) {
    // this is for the case when we restore while testing
  }
};
