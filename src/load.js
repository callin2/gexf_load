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
const fs = require("fs");
const sax = require("sax");
const agens = require("./agens");
function gexf_load(fileName, fileType = "gexf") {
    var strict = true;
    var graph_type_info = {};
    var instream = fs.createReadStream(fileName);
    var currentNode = null;
    var currentEdge = null;
    var in_the_graph_tag = false;
    var dbProcCnt = 0;
    var paused = false;
    var saxStream = sax.createStream(strict, {});
    saxStream.on("error", function (e) {
        console.error("error!", e);
        this._parser.error = null;
        this._parser.resume();
    });
    saxStream.on("opentag", function (node) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (node.name) {
                case "graph":
                    in_the_graph_tag = true;
                    break;
                case "node":
                    console.log('node >>', node, "dbProcCnt", dbProcCnt);
                    in_the_graph_tag = false;
                    if (currentEdge != null) {
                        console.log("edge >>", JSON.stringify(currentEdge));
                    }
                    currentNode = { id: +node.attributes.id, caption: node.attributes.label };
                    let cql = `CREATE (:person {id: ${node.attributes.id} })`;
                    if (dbProcCnt > 5) {
                        console.log('pause', dbProcCnt);
                        instream.pause();
                        paused = true;
                    }
                    dbProcCnt++;
                    var conn = yield agens.connect();
                    yield conn.query(cql);
                    yield conn.end();
                    dbProcCnt--;
                    console.log('>>>  db query done', dbProcCnt);
                    if (paused && dbProcCnt < 3) {
                        console.log('resume');
                        paused = false;
                        instream.resume();
                    }
                    currentEdge = null;
                    break;
                case "edge":
                    in_the_graph_tag = false;
                    if (currentNode != null) {
                        console.log("node >>", JSON.stringify(currentNode));
                    }
                    if (currentEdge != null) {
                        console.log("edge >>", JSON.stringify(currentEdge));
                    }
                    currentNode = null;
                    currentEdge = { id: +node.attributes.id, from: node.attributes.source, to: node.attributes.target };
                    break;
                case "attribute":
                    if (in_the_graph_tag) {
                        graph_type_info[node.attributes.id] = { title: node.attributes.title, "type": node.attributes.type };
                    }
                    break;
                case "attvalue":
                    if (currentNode != null) {
                        try {
                            switch (graph_type_info[node.attributes.for].type) {
                                case "string":
                                    currentNode[node.attributes.for] = node.attributes.value;
                                    break;
                                default:
                                    currentNode[node.attributes.for] = +node.attributes.value;
                                    break;
                            }
                        }
                        catch (e) {
                            console.error("node.attributes.for", node.attributes.for);
                        }
                    }
                    if (currentEdge != null) {
                        currentEdge[node.attributes.for] = +node.attributes.value;
                    }
                    break;
            }
        });
    });
    saxStream.on("end", function () {
        if (currentNode != null) {
            console.log("node >>", JSON.stringify(currentNode));
        }
        if (currentEdge != null) {
            console.log("edge >>", JSON.stringify(currentEdge));
        }
        currentNode = null;
        currentEdge = null;
    });
    instream.pipe(saxStream);
}
gexf_load("./data/dh11.gexf");
//# sourceMappingURL=load.js.map