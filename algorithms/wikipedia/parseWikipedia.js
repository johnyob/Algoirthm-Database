const wikipedia = require("mediawiki-api-js");
const database = require("../db");
const ddl = require("./ddl");

const DB = "./Algorithms.db";

/**
 * Constant that contains the maximum recursion depth for the parseCategory
 * function
 * @const {Number} MAX_DEPTH
 */

const MAX_DEPTH = 3;

/**
 * Constant that contains the strings that are matched to a page. Used to determine
 * whether a page is an algorithm / data structure.
 * @const {Array} HEURISTIC_IDENTIFIERS
 */

const HEURISTIC_IDENTIFIERS = [
  "algorithm", "Algorithm",
  "data structure", "Data structure",
  "abstract data type",
  "Abstract data type",
  "tree", "Tree",
  "search", "Search",
  "sort", "Sort"
];

/**
 * (Heuristic) Used to determine whether a page is an algorithm / data structure
 * @function isAlgorithm
 * @param {String} page
 * @return {Boolean}
 */

function isAlgorithm(page) {
  return HEURISTIC_IDENTIFIERS.filter(x => page.includes(x)).length > 0;
}

/**
 * (Heuristic) Used to determine whether a category contains algorithm pages
 * @function isAlgorithmCategory
 * @param {String} category
 * @return {Boolean}
 */

function isAlgorithmCategory(category) {
  return page.includes("Category:") && isAlgorithm(category);
}

/**
 * (Heuristic) Used to determine whether a page is an algorithm / data structure
 * by checking the categories that the page belongs too and the contents of the
 * page
 * @function isAlgorithmPage
 * @param {String} page
 * @return {Object} contains {wikipedia.Page} page and {Promise} condition which
 * resolves to a boolean
 */

function isAlgorithmPage(page) {
  return {
    page: page,
    condition: page.categories.then(categories => categories.filter(
      isAlgorithm
    ).length > 0).then(condition => page.content.then(
      content => condition && isAlgorithm(content)
    ))
  };
}

/**
 * Inserts category into Category table if it does not yet exist, then
 * inserts the link between the AlgorithmID and CategoryID and then deletes
 * any links where the CategoryID IS NULL
 * @function handleCategory
 * @param {Number} id
 * @param {String} category
 */

function handleCategory(id, category) {
  database.connect(DB).then(db => db.insert(
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
}

/**
 * Inserts algorithm in Algorithm if it does not yet exist, then handle any
 * categories that the algorithm belongs too
 * @function parsePage
 * @param {wikipedia.Page} page
 */

function parsePage(page) {
  page.summary.then(summary => database.connect(DB).then(db => db.insert(
      "INSERT OR IGNORE INTO Algorithm "
    + "VALUES (?, ?, ?);",
      [page.id, page.title, summary]
  )).then(db => {
    page.categories.then(categories => categories.filter(isAlgorithmCategory).forEach(
      category => handleCategory(page.id, category)
    ));
    return db;
  }).then(db => db.close()));
}

/**
 * @function parseCategory
 * @param {String} category (<category> ::= Category:<identifier>;)
 * @param {Number} depth current recursive depth
 * @param {Array} visited contains list of algorithms stored in the database
 */

function parseCategory(category, depth, visited) {
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
}

ddl();
const CATEGORY = "Category:Sorting_algorithms";
database.connect(DB).then(db => db.query(
  "SELECT AlgorithmTitle FROM Algorithm;", []
)).then(visited => parseCategory(CATEGORY, 0, visited));
