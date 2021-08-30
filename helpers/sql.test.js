const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("works", function () {
        let data = { 
            firstName: 'phoenix',
            lastName: 'david',
            email: 'phoenix@pdavid.net'
        }
        let sql = { 
            firstName: 'first_name',
            lastName: 'last_name',
            isAdmin: 'is_admin'
        }
        const res = sqlForPartialUpdate(data, sql)

        expect(res).toEqual({ setCols: '"first_name"=$1, "last_name"=$2, "email"=$3',
        values: [ 'phoenix', 'david', 'phoenix@pdavid.net' ] })

    })
    test("breaks", function () {
        try {
            let data = {
            }
            let sql = { 
                firstName: 'first_name',
                lastName: 'last_name',
                isAdmin: 'is_admin'
            }
            sqlForPartialUpdate(data, sql)
        } catch (err) {
            expect(err.message).toEqual('No data');
        }
          
    })
})