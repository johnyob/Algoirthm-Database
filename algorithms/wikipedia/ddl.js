const database = require("../db");
const DB = "./Algorithms.db";

function createTables() {
  function create(sql) {
    database.connect(DB).then(db => db.insert(sql)).then(
      db => db.close()
    ).catch(error => console.log(error));
  }

  create(
      "CREATE TABLE IF NOT EXISTS Algorithm ("
    + "  AlgorithmID INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "  AlgorithmTitle TEXT,"
    + "  AlgorithmSummary TEXT"
    + ");"
  );

  create(
      "CREATE TABLE IF NOT EXISTS Category ("
    + "  CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "  CategoryTitle TEXT,"
    + "  CONSTRAINT category_unique UNIQUE (CategoryTitle)"
    + ");"
  );

  create(
      "CREATE TABLE IF NOT EXISTS CategoryLink ("
    + "  AlgorithmID INTEGER,"
    + "  CategoryID INTEGER,"
    + "  PRIMARY KEY (AlgorithmID, CategoryID),"
    + "  FOREIGN KEY (AlgorithmID) REFERENCES Algorithm (AlgorithmID),"
    + "  FOREIGN KEY (CategoryID) REFERENCES Category (CategoryID)"
    + ");"
  );
}

module.exports = () => {
  createTables();
}
