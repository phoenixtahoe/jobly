const { BadRequestError } = require("../expressError");

  /** format dataToUpdate, and jsToSql for SQL statements.
   *
   * Data required:
   *  dataToUpdate: { firstName: 'test', lastName: 'test', email: 'email@email.com' }
   *
   *  jsToSql: { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
   *
   * Returns: 
   *  { setCols: '"first_name"=$1, "last_name"=$2, "email"=$3', values: [ 'test', 'test', 'email@email.com' ] }
   *
   * 
   * Throws BadRequestError if no data.
   *
   */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
