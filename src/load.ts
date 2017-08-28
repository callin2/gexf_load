import * as fs from "fs";
import * as sax from "sax";
import * as agens from "./agens"
import * as readline from "readline";
import * as stream from "stream";


function gexf_load(fileName: string, fileType = "gexf" ) {
    var strict = true;
    // var parser = sax.parser(strict, {});
    var graph_type_info : any = {};

    var instream = fs.createReadStream(fileName);

    var currentNode :any = null;
    var currentEdge :any = null;
    var in_the_graph_tag = false;


    var dbProcCnt = 0
    var paused = false;

    //========================================================

    var saxStream = sax.createStream(strict, {})
    saxStream.on("error", function (e: any) {
        console.error("error!", e)
        this._parser.error = null
        this._parser.resume()
    });

    saxStream.on("opentag", async function (node: any) {
        // console.log('>>', node)
        switch(node.name) {
            case "graph" :
                in_the_graph_tag = true;
                break;
            case "node" :
                console.log('node >>', node, "dbProcCnt", dbProcCnt)
                in_the_graph_tag = false;


                if(currentEdge != null) {
                    console.log("edge >>",JSON.stringify(currentEdge));
                }

                //end of save collected data =========================================

                currentNode = {id: +node.attributes.id, caption: node.attributes.label}
                let cql = `CREATE (:person {id: ${node.attributes.id} })`;


                if(dbProcCnt > 5) {
                    console.log('pause', dbProcCnt)
                    instream.pause();
                    paused = true;
                }


                // if(node.attributes.id == 1) {
                dbProcCnt++;
                var conn = await agens.connect();
                await conn.query(cql);
                await conn.end();
                dbProcCnt--;
                console.log('>>>  db query done', dbProcCnt)
                // }


                if(paused && dbProcCnt < 3) {
                    console.log('resume')
                    paused = false;
                    instream.resume();
                }

                currentEdge = null
                break;

            case "edge" :
                in_the_graph_tag = false;
                // save prev collected node and edge data
                if(currentNode != null) {
                    // save prev currentNode
                    console.log("node >>",JSON.stringify(currentNode));
                }

                if(currentEdge != null) {
                    // save prev currentEdge
                    console.log("edge >>",JSON.stringify(currentEdge));
                }

                //end of save collected data =========================================

                currentNode = null;
                currentEdge = {id: +node.attributes.id, from: node.attributes.source, to: node.attributes.target}
                break;

            case "attribute" :
                if(in_the_graph_tag ) {
                    graph_type_info[node.attributes.id] = {title:node.attributes.title, "type":node.attributes.type};
                }
                break;

            case "attvalue" :
                if(currentNode != null) {
                    // console.log("node.attributes", node.attributes)

                    try {
                        switch (graph_type_info[node.attributes.for].type) {
                            case "string":
                                currentNode[node.attributes.for] = node.attributes.value;

                                // agens.updateById( currentNode.id, node.attributes.for, node.attributes.value, ()=>{});

                                break;

                            default:
                                currentNode[node.attributes.for] = +node.attributes.value;

                                // agens.updateById( currentNode.id, node.attributes.for, +node.attributes.value, ()=>{});
                                break;

                        }
                    }catch(e) {
                        console.error("node.attributes.for", node.attributes.for)
                    }
                    // console.log("node attr", node.attributes, graph_type_info[node.attributes.for])
                }

                if(currentEdge != null) {
                    currentEdge[node.attributes.for] = +node.attributes.value;
                }
                break;
        }



    });

    saxStream.on("end", function(){
        if(currentNode != null) {
            // save prev currentNode
            console.log("node >>",JSON.stringify(currentNode));

        }

        if(currentEdge != null) {
            // save prev currentEdge
            console.log("edge >>",JSON.stringify(currentEdge));
        }

        currentNode = null;
        currentEdge = null;
    });




    instream.pipe(saxStream);

}



gexf_load("./data/dh11.gexf");


