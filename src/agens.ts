const { Pool, Client } = require('agensgraph')

// var config = {
//     host: '27.117.163.21',
//     port: 15602,
//     user: 'agraph',
//     password: '',
//     database: 'imdb',
// };

var config_local = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'gexf_test',
};


// var client = new ag.Client(config);

// client.connect(function (err:any) {
//     if (err) throw err;
//
//     client.query('set graph_path=gexf', function(err:any, rslt:any){
//         console.log(err,rslt)
//     });
// });


async function connect(option = config_local) : Promise<any> {
    var client = new Client(option);

    return new Promise((resolve, reject)=>{
        client.connect((err)=>{
            if (err) reject(err);

            resolve({
                query: query.bind(client),
                updateById: updateById.bind(client),
                end: end.bind(client)
            });
        });
    });
}

async function query(query : string, params : any) {
    console.log("query", query)
    var client = this;
    query = "set graph_path=gexf;" + query;
    return client.query(query, params);
}

async function updateById(id: number, attrName: string, attrVal: any, callback: any) {
    var client = this;

    return new Promise((resolve, reject)=> {
        client.query(`set graph_path=gexf; MATCH (p:person { id: ${id} })\n` +
            `SET p['${attrName}']= '${attrVal}'  \n` +
            `RETURN n`, callback);
    });
}


async function end() {
    var client = this;

    return client.end();
}

export { connect };