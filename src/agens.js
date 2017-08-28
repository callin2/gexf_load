"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool, Client } = require('agensgraph');
var config_local = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'gexf_test',
};
function connect(option = config_local) {
    return __awaiter(this, void 0, void 0, function* () {
        var client = new Client(option);
        return new Promise((resolve, reject) => {
            client.connect((err) => {
                if (err)
                    reject(err);
                resolve({
                    query: query.bind(client),
                    updateById: updateById.bind(client),
                    end: end.bind(client)
                });
            });
        });
    });
}
exports.connect = connect;
function query(query, params) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("query", query);
        var client = this;
        query = "set graph_path=gexf;" + query;
        return client.query(query, params);
    });
}
function updateById(id, attrName, attrVal, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        var client = this;
        return new Promise((resolve, reject) => {
            client.query(`set graph_path=gexf; MATCH (p:person { id: ${id} })\n` +
                `SET p['${attrName}']= '${attrVal}'  \n` +
                `RETURN n`, callback);
        });
    });
}
function end() {
    return __awaiter(this, void 0, void 0, function* () {
        var client = this;
        return client.end();
    });
}
//# sourceMappingURL=agens.js.map