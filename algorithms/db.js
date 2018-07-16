const sqlite = require("sqlite3");
const ALGORTIHM_DATABASE = "./Algorithms.db";

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


module.exports.connect = () => {
  return new Promise((resolve, reject) => {
    resolve(new sqlite.Database(ALGORTIHM_DATABASE, error => {
      if (error) {
        throw new Error(error.message);
      }
    }));
  }).then(db => database(db));
};
