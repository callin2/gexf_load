import * as agens from "./agens"


(async function() {
    var conn = await agens.connect();
    var rslt = await conn.query("create (:person {id: 21})");
    console.log(rslt)
    await conn.end();

})();



