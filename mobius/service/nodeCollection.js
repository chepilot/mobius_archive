// data pool for node types

mobius.factory('nodeCollection', function () {

    var nodes= [];

    // embeded unchangable node goes here
    var defaultNodes = [
    //    {
    //    // node type name
    //    nodeType:'xxx',
    //    // node type
    //    version:'',
    //    // node option to be overwritten
    //    overwrite:false,
    //
    //    // graph info
    //    inputConnectors: [],
    //    outputConnectors: [],
    //
    //    // procedure data model linked with node
    //    procedureDataModel: [],
    //
    //    // procedure data model linked with node
    //    interfaceDataModel: []
    //}
    ];


    // check if node types exists in local storage, if not, store default
    if(localStorage.mobiusNodeTypes === undefined){
        // store default into local storage
        localStorage.mobiusNodeTypes = JSON.stringify(defaultNodes);
    }

    // retrieve the local storage node types for usage
    nodes = JSON.parse(localStorage.mobiusNodeTypes);

    return{
        syncNodeTpyeStorage: function(){
            nodes = JSON.parse(localStorage.mobiusNodeTypes);
        },

        ifSubGraph: function(typeName){
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].nodeType == typeName){
                    return nodes[i].subGraph;
                }
            }
        },

        // return node types for graph
        getNodeTypes: function(){
            var nodeTypes = [];
            for(var i = 0; i < nodes.length; i++){
                nodeTypes.push(nodes[i].nodeType);
            }
            return nodeTypes;
        },

        // return overwrite option
        getOverwrite: function(typeName){
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].nodeType == typeName){
                    return nodes[i].overwrite;
                }
            }
            return true;
        },

        getInputConnectors: function(type){
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].nodeType == type){
                    var input = [];
                    angular.copy(nodes[i].inputConnectors,input);
                    return input;
                }
            }
            return [];
        },

        getOutputConnectors: function(type){
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].nodeType == type){
                    var output = [];
                    angular.copy(nodes[i].outputConnectors,output);
                    return output;
                }
            }
            return [];
        },

        // return procedure data model for procedure
        getProcedureDataModel: function(typeName){
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].nodeType == typeName){
                    var obj = [];
                    angular.copy(nodes[i].procedureDataModel,obj);
                    return obj;
                }
            }
            return [];
        },

        // return interface data model for interface
        getInterfaceDataModel: function(typeName){
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].nodeType == typeName){
                    var obj = [];
                    angular.copy(nodes[i].interfaceDataModel,obj);
                    return obj;
                }
            }
            return [];
        },

        getSubGraphModel: function(typeName){
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].nodeType == typeName){
                    var obj = {};
                    angular.copy(nodes[i].subGraphModel,obj);
                    return obj;
                }
            }
        },

        // install node for create new node type / import node
        installNewNodeType: function(type, subGraph, input, output, procedureList, interfaceList,subGraphModel){
            var newNode = {};
            if(!subGraph){
                 newNode = {
                    nodeType: type,
                    version:0,
                    overwrite:true,

                    inputConnectors:  input === undefined ? [] : input,
                    outputConnectors: output === undefined ? [] : output,

                    procedureDataModel: procedureList === undefined ? [] : procedureList,
                    interfaceDataModel: interfaceList === undefined ? [] : interfaceList
                };
            }else{
                 newNode = {
                    nodeType: type,
                    version:0,
                    overwrite:true,
                    subGraph:true,

                    inputConnectors:  input === undefined ? [] : input,
                    outputConnectors: output === undefined ? [] : output,

                    procedureDataModel: procedureList === undefined ? [] : procedureList,
                    interfaceDataModel: interfaceList === undefined ? [] : interfaceList,
                    subGraphModel:subGraphModel === undefined ?
                    {
                        javascriptCode: '// To generate code,\n' + '// create nodes & procedures and run!\n',
                        geomListCode: "var geomList = [];\n",
                        innerCodeList:[],
                        outerCodeList:[],
                        dataList:[],
                        interfaceList:[],
                        chartDataModel: {
                            "nodes": [],
                            "connections": [],
                            "inputPort": {
                                x:1900,
                                y:1900,
                                outputConnectors:[]
                            },
                            "outputPort": {
                                x:1900,
                                y:2300,
                                inputConnectors:[]
                            }
                        },
                        nodeIndex:undefined
                    } : subGraphModel
                };
            }

            nodes.push(newNode);
            localStorage.mobiusNodeTypes = JSON.stringify(nodes);
        },

        importNodeType: function(jsonObj){
            nodes.push(jsonObj);
            localStorage.mobiusNodeTypes = JSON.stringify(nodes);
        },

        // update node procedure content
        updateNodeType: function(oldType,newType, input, output, newProcedureList,newInterfaceList,isSubGraph,newSubGraphModel){
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].nodeType == oldType){
                    if(isSubGraph !== nodes[i].subGraph){
                        angular.copy(isSubGraph,nodes[i].subGraph);
                    }

                    if(newType !== nodes[i].nodeType){
                        angular.copy(newType,nodes[i].nodeType);
                    }
                    angular.copy(input,nodes[i].inputConnectors);
                    angular.copy(output,nodes[i].outputConnectors );
                    angular.copy(newProcedureList,nodes[i].procedureDataModel);
                    angular.copy(newInterfaceList,nodes[i].interfaceDataModel);
                    angular.copy(newSubGraphModel,  nodes[i].subGraphModel);
                }
            }
            localStorage.mobiusNodeTypes = JSON.stringify(nodes);
        },

        // delete node type
        deleteNodeType: function(name){
            for(var i =0; i< name.length; i++){
                for(var j = 0; j < nodes.length; j++){
                    if(name[i] === nodes[j].nodeType){
                        nodes.splice(j,1);
                    }
                }
            }
            localStorage.mobiusNodeTypes = JSON.stringify(nodes);
        }
    }
});