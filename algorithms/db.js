const sqlite = require("sqlite3");

class Database {
  constructor(connection) {
    this.connection = connection;
  }

  query(sql, parameters) {
    return new Promise((resolve, reject) => {
      let rows = [];
      this.connection.each(sql, parameters, (error, row) => {
        if (error) {
          throw new Error(error.message);
        }
        rows.push(row);
      }, () => {
        resolve(rows);
      });
    });
  }

  close() {
    this.connection.close();
  }

  insert(sql, parameters) {
    return this._commit(sql, parameters);
  }

  delete(sql, parameters) {
    return this._commit(sql, parameters);
  }

  update(sql, parameters) {
    return this._commit(sql, parameters)
  }
  /**
  * Helper Methods
  */

  _commit(sql, parameters) {
    this.connection.run(sql, parameters error => {
      if (error) {
        throw new Error(error.message);
      }
    });
    return this;
  }
}



var database = (db) => {
  var query = (sql, parameters) => {
    return new Promise((resolve, reject) => {
      let rows = [];
      db.each(sql, parameters, (error, row) => {
        if (error) {
          throw new Error(error.message);
        }
        rows.push(row)
      }, () => {
        db.close()
        resolve(rows)
      });
    });
  };

  var close = () => {
    db.close();
  };

  var commit = (sql, parameters, final=false) => {
    db.run(sql, parameters, error => {
      if (error) {
        throw new Error(error.message);
      }
    });
    return dbFunctions;
  };

  const dbFunctions = {
    query: query,
    insert: commit,
    delete: commit,
    update: commit,
    close: close
  };

  return dbFunctions;
};


module.exports.connect = (dbFile) => {
  return new Promise((resolve, reject) => {
    resolve(new sqlite.Database(dbFile, error => {
      if (error) {
        throw new Error(error.message) ;
      }
    }));
  }).then(db => database(db));
};
