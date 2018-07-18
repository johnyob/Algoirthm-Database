const database = require("../db");
const DB = "./Tasks.db";

/**
 * Creates the required tables for the Tasks.db database using DDL
 * (Data Definition Language)
 * @function createTables
 */

function createTables() {

  /**
   * Executes a insert command using command stored in the sql parameter
   * @function create
   * @param {String} sql contains DDL command
   */

  function create(sql) {
    database.connect(DB).then(db => db.insert(sql, [])).then(
      db => db.close()
    ).catch(error => console.log(error));
  }

  create(
      "CREATE TABLE IF NOT EXISTS Task ("
    + "  TaskID INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "  TaskName TEXT,"
    + "  TaskSummary TEXT,"
    + "  CONSTRAINT task_unique UNIQUE (TaskName)"
    + ");"
  );

  create(
      "CREATE TABLE IF NOT EXISTS Language ("
    + "  LanguageID INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "  LanguageName TEXT,"
    + "  CONSTRAINT language_unique UNIQUE (LanguageName)"
    + ");"
  );

  create(
      "CREATE TABLE IF NOT EXISTS Implementation ("
    + "  TaskID INTEGER,"
    + "  LanguageID INTEGER,"
    + "  Implementation TEXT,"
    + "  PRIMARY KEY (TaskID, LanguageID),"
    + "  FOREIGN KEY (TaskID) REFERENCES Task (LanguageID),"
    + "  FOREIGN KEY (LanguageID) REFERENCES LanguageID (LanguageID)"
    + ");"
  );
}

module.exports = createTables;
