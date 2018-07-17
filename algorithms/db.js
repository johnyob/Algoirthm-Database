const sqlite = require("sqlite3");

/**
 * Wrapper for sqlite3.Database connection. Contains methods for common SQL
 * commands
 * @class
 */

class Database {

  /**
   * Constructor used to instantiate the Database object. Initializes property
   * (Private) _connection.
   * @constructor
   * @param {sqlite.Database} connection sqlite3 database connection object
   */

  constructor(connection) {
    this._connection = connection;
  }

  /**
   * (Public) method for executing a SQL query.
   * @method Database.query
   * @param {String} sql SQL query to execute
   * @param {Array} parameters parameters to replace placeholders in sql
   * @param {Promise}
   */

  query(sql, parameters) {
    return new Promise((resolve, reject) => {
      let rows = [];
      this._connection.each(sql, parameters, (error, row) => {
        if (error) {
          throw new Error(error.message);
        }
        rows.push(row);
      }, () => {
        this.close();
        resolve(rows);
      });
    });
  }

  /**
   * (Public) method for closing database connection.
   * @method Database.close
   */

  close() {
    this._connection.close();
  }

  /**
   * (Public) wrapper for Database._commit method.
   * @method Database.insert
   * @param {String} sql SQL command to execute
   * @param {Array} parameters parameters to replace placeholders in sql
   * @param {Database} this Database object
   */

  insert(sql, parameters) {
    return this._commit(sql, parameters);
  }

  /**
   * (Public) wrapper for Database._commit method.
   * @method Database.delete
   * @param {String} sql SQL command to execute
   * @param {Array} parameters parameters to replace placeholders in sql
   * @param {Database} this Database object
   */

  delete(sql, parameters) {
    return this._commit(sql, parameters);
  }

  /**
   * (Public) wrapper for Database._commit method.
   * @method Database.update
   * @param {String} sql SQL command to execute
   * @param {Array} parameters parameters to replace placeholders in sql
   * @param {Database} this Database object
   */

  update(sql, parameters) {
    return this._commit(sql, parameters)
  }

  /**
   * Helper Methods
   */

  /**
   * (Private) commit method, executes SQL command and commit changes to
   * database.
   * @method Database._commit
   * @param {String} sql SQL command to execute
   * @param {Array} parameters parameters to replace placeholders in sql
   * @param {Database} this Database object
   */

  _commit(sql, parameters) {
    this._connection.run(sql, parameters, error => {
      if (error) {
        throw new Error(error.message);
      }
    });
    return this;
  }
}

/**
 * Creates a Database object wrapped in a promise
 * @function module.exports.connect
 * @param {String} file file path for database file (.db)
 * @return {Promise} creates new sqlite.Database connect and then instantiates
 * a Database object
 */


module.exports.connect = (file) => {
  return new Promise((resolve, reject) => {
    resolve(new sqlite.Database(file, error => {
      if (error) {
        throw new Error(error.message) ;
      }
    }));
  }).then(db => new Database(db));
};
