var Store = require('express').session.Store;
var fs = require('fs');
var pg = require('pg');
var ok = require('okay');

var createTableStmt = fs.readFileSync('./create-tables.sql');

var Errors = {
  'INVALID_CONN_STR': 'pg-session error: Field `connStr` is invalid'
};

var db = {
  query: function(connStr, query, values, callback) {
    if (typeof values == 'function'){
      callback = values;
      values = [];
    }

    pg.connect( config.copper.connStr, function(error, client, done) {
      if (error) return callback ? callback(error) : null;

      client.query( query, values, function(error, result) {
        done();

        if (error) return callback ? callback(error) : null;

        if (callback) callback(null, result);
      });
    });
  }
};

function PGSessionStore(options) {
  if (!options) throw new Errors.INVALID_CONN_STR();
  if (!options.connStr) throw new Errors.INVALID_CONN_STR();
  this.connStr = options.connStr;
  db.query(this.connStr, createTableStmt);
  Store.call(this);
}

PGSessionStore.prototype = Object.create(Store.prototype);

PGSessionStore.prototype.set = function(sid, sessData, cb) {
  var expiration = null;

  if (sessData.cookie && sessData.cookie.expires) {
    expiration = sessData.cookie.expires;
  }

  db.query(
    this.connStr
  , 'INSERT INTO sessions (sid, data, expiration) VALUES ($1, $2, $3)'
  , [sid, sessData, expiration]
  , cb
  );
};

PGSessionStore.prototype.get = function(sid, cb) {
  db.query(
    this.connStr
  , 'SELECT data FROM sessions WHERE uid = $1 ORDER BY id desc LIMIT 1'
  , [sid]
  , ok(cb, function(rows, result) {
      cb(null, rows.length ? rows[0].data : null);
    })
  );
};

PGSessionStore.prototype.destroy = function(sid, cb) {
  db.query(this.connStr, 'DELETE FROM sessions WHERE id = $1', [sid], cb);
};

PGSessionStore.prototype.length = function(cb) {
  db.query(this.connStr, 'SELECT count(id) AS count FROM sessions', ok(cb, function(rows) {
    cb(null, rows[0].count);
  }));
};

PGSessionStore.prototype.clear = function(cb) {
  db.query(this.connStr, 'DELETE FROM sessions', cb);
};

module.exports = PGSessionStore;
