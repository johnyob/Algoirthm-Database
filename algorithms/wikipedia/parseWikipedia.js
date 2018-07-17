const wikipedia = require("mediawiki-api-js");
const database = require("../db");
const ddl = require("./ddl");

const MAX_DEPTH = 3;
const DB = "./Algorithms.db";

const HEURISTIC_IDENTIFIERS = [ //heuristic
  "algorithm", "Algorithm",
  "data structure", "Data structure",
  "abstract data type",
  "Abstract data type",
  "tree", "Tree",
  "search", "Search",
  "sort", "Sort"
];

/**
 * Helper Functions
 */
var isAlgorithm = (page) => HEURISTIC_IDENTIFIERS.filter(x => page.includes(x)).length > 0;

var isAlgorithmCategory = page => page.includes("Category:") && isAlgorithm(page);

var isAlgorithmPage = (page) => {
  return {
    page: page,
    condition: page.categories.then(categories => categories.filter(
      isAlgorithm
    ).length > 0).then(condition => page.content.then(
      summary => condition && isAlgorithm(summary)
    ))
  };
};


/**
 * Functions
 */

var handleCategory = (id, category) => database.connect(DB).then(db => db.insert(
    "INSERT OR IGNORE INTO Category(CategoryTitle) "
  + "VALUES (?);", [category]
)).then(db => db.insert(
    "INSERT OR IGNORE INTO CategoryLink "
  + "VALUES (?, (SELECT CategoryID FROM "
  + "Category WHERE CategoryTitle = ?) "
  + ");", [id, category]
)).then(db => db.delete(
    "DELETE FROM CategoryLink "
  + "WHERE CategoryID IS NULL;", []
)).then(db => db.close());

var parsePage = page => page.summary.then(summary => database.connect(DB).then(db => db.insert(
    "INSERT OR IGNORE INTO Algorithm "
  + "VALUES (?, ?, ?);",
    [page.id, page.title, summary]
)).then(db => {
  page.categories.then(categories => categories.filter(isAlgorithmCategory).forEach(
    category => handleCategory(page.id, category)
  ));
  return db;
}).then(db => db.close()));

var parseCategory = (category, depth, visited) => {
  console.log("[ALERT] Depth: " + depth);
  if (depth >= MAX_DEPTH) {
    return;
  }

  wikipedia().pagesInCategory(category).then(pages => pages.forEach(page => {
    console.log("[INFO] Page in pages: " + page);
    if (isAlgorithmCategory(page)) {
      console.log("[INFO] Category: " + category);

      database.connect(DB).then(db => db.insert(
          "INSERT OR IGNORE INTO Category(CategoryTitle) "
        + "VALUES (?);", [page]
      )).then(db => db.close());
      parseCategory(page, depth + 1, visited);
    } else if (!page.includes("Category:") && !visited.includes(page)) {
      console.log("[INFO] Page: " + page);

      wikipedia().page(page).then(isAlgorithmPage).then(result => result.condition.then(
        condition => condition
          ? result.page
          : (() => {throw new Error("Page isn't an algorithm")})()
      ).then(parsePage).catch(error => console.log("[ALERT] Page: " + page + " isn't an algorithm.")));
    }
  }));
};

ddl();

var category = "Category:Sorting_algorithms";
//used to reduce timeout
database.connect(DB).then(db => db.query(
  "SELECT AlgorithmTitle FROM Algorithm;", []
)).then(visited => parseCategory(category, 0, visited));
