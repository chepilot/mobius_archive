//
// mobius procedure controller
//

// todo value of in/out connector is not used

mobius.controller('procedureCtrl',['$scope','$rootScope','$filter','consoleMsg','generateCode','nodeCollection',
    function($scope,$rootScope,$filter,consoleMsg,generateCode,nodeCollection) {

        $scope.showProcedure = function(){
            $scope.$emit("showProcedure");
        };

        $scope.info=function(input){
            if(input){
                document.getElementById('choices').style.display = 'inline';
                $scope.toggleDropdown = false;
            }else{
                document.getElementById('choices').style.display = 'none';
                $scope.toggleDropdown = true;
            }
        };

        $scope.functionCodeList =[];

        // toggle code view
        $scope.codeContent = '';
        $scope.toggleCodeContent = function(content){
            $scope.codeContent = content;
        };

        // synchronization with mobius application data pool

        // inner function code for procedures
        $scope.innerCodeList = generateCode.getInnerCodeList();
        $scope.$watch('innerCodeList', function () {
            generateCode.setInnerCodeList($scope.innerCodeList);
            $scope.functionCodeList = generateCode.getFunctionCodeList();
        },true);
        $scope.$watch(function () { return generateCode.getInnerCodeList(); }, function () {
            $scope.innerCodeList = generateCode.getInnerCodeList();
            $scope.functionCodeList = generateCode.getFunctionCodeList();
        },true);

        // outer function code for procedures
        $scope.outerCodeList = generateCode.getOuterCodeList();
        $scope.$watch('outerCodeList', function () {
            generateCode.setOuterCodeList($scope.outerCodeList);
            $scope.functionCodeList = generateCode.getFunctionCodeList();
        },true);
        $scope.$watch(function () { return generateCode.getOuterCodeList(); }, function () {
            $scope.outerCodeList = generateCode.getOuterCodeList();
            $scope.functionCodeList = generateCode.getFunctionCodeList();
        },true);


        // procedure data list
        $scope.dataList = generateCode.getDataList();
        $scope.$watch(function () { return generateCode.getDataList(); }, function () {
            $scope.dataList= generateCode.getDataList();
        },true);

        // interface data list
        $scope.interfaceList= generateCode.getInterfaceList();
        $scope.$watch(function () { return generateCode.getInterfaceList(); }, function () {
            $scope.interfaceList= generateCode.getInterfaceList();
        },true);

        // graph flowchart view model
        // pass by reference
        // deep watch chartViewModel.data instead of chartViewModel to prevent stack limit exceeded
        $scope.chartViewModel= generateCode.getChartViewModel();

        $scope.$watch(function(){return generateCode.getChartViewModel()},function(){
            $scope.interfaceList= generateCode.getInterfaceList();
            $scope.dataList= generateCode.getDataList();
            $scope.chartViewModel = generateCode.getChartViewModel();
        });

        // currently selected node ID
        $scope.nodeIndex = '';

        // control types
        $scope.controlTypes = ['for each',
                                'if else'];

        // methods types
        $scope.getMethods = function(){
            var props = Object.getOwnPropertyNames(MOBIUS);

            var expression = [{category:'msc',name:'expression'}];

            // fixme sub category temp solution
            for(var i = 0; i < props.length; i++){
                if(typeof MOBIUS[props[i]] != 'function' && props[i] !='TOPOLOGY_DEF'){
                    var subProps = Object.getOwnPropertyNames(MOBIUS[props[i]]);
                    for(var j = 0; j < subProps.length; j++){
                        if(typeof MOBIUS[props[i]][subProps[j]] == 'function'){
                            expression.push({category:props[i],
                                             name:subProps[j],
                                             return:MOBIUS[props[i]][subProps[j]].prototype.return
                            });
                        }
                    }
                }
            }
            return expression;
        };

        $scope.getMethodList = function(){
            var props = Object.getOwnPropertyNames(MOBIUS);

            var expression = [{category:'msc',methods:[{name:'expression'}]}];

            // fixme sub category temp solution
            for(var i = 0; i < props.length; i++){
                if(typeof MOBIUS[props[i]] != 'function' && props[i] !='TOPOLOGY_DEF'){
                    var subProps = Object.getOwnPropertyNames(MOBIUS[props[i]]);

                    if(props[i] !== 'msc'){
                        expression.push({category:props[i],methods:[]});
                        for(var j = 0; j < subProps.length; j++){
                            if(typeof MOBIUS[props[i]][subProps[j]] == 'function'){
                                expression[expression.length-1].methods.push({
                                    name:subProps[j],
                                    return:MOBIUS[props[i]][subProps[j]].prototype.return,
                                    description:MOBIUS[props[i]][subProps[j]].prototype.description});
                            }
                        }
                    }else{
                        for(var j = 0; j < subProps.length; j++){
                            if(typeof MOBIUS[props[i]][subProps[j]] == 'function'){
                                expression[0].methods.push({name:subProps[j], description:MOBIUS[props[i]][subProps[j]].prototype.description});
                            }
                        }
                    }
                }
            }
            return expression;
        };

        $scope.methods = $scope.getMethods();
        $scope.methodList = $scope.getMethodList();

        $scope.$on("clearProcedure", function(){
            $scope.nodeIndex = undefined;
            $scope.data  = undefined;
            $scope.interface = undefined;
            $scope.currentNodeName = '';
            $scope.currentIsSubgraph = false;
            $scope.currentNodeType = '';
            if($scope.toggleTo === 'procedure'){
                $scope.subgraphToggle(true)
            }
            $scope.chartViewModel.deselectAll();
        });

        // listen to the graph, when a node is clicked, update the procedure/ interface tabs
        $rootScope.$on("nodeIndex", function(event, message) {
            if($scope.nodeIndex !== message && message !== undefined && message !== "port"){
                $scope.nodeIndex = message;

                $scope.currentNodeName = $scope.chartViewModel.nodes[$scope.nodeIndex].data.name;
                $scope.currentNodeType = $scope.chartViewModel.nodes[$scope.nodeIndex].data.type;
                $scope.currentIsSubgraph = $scope.chartViewModel.nodes[$scope.nodeIndex].data.subGraph;

                if($scope.currentIsSubgraph === true){
                    $scope.currentSubgraphChartViewModel = new flowchart.ChartViewModel(
                        $scope.chartViewModel.nodes[$scope.nodeIndex].data.subGraphModel.chartDataModel);
                }

                if($scope.toggleTo === 'procedure'){
                    $scope.subgraphToggle(true);
                }

                $scope.currentNodeVersion = $scope.chartViewModel.nodes[$scope.nodeIndex].data.version === 0?'':'*';

                //fixme update procedure data model cause lag
                // update the procedure tab
                $scope.data  = $scope.dataList[$scope.nodeIndex];

                // update the interface tab
                $scope.interface = $scope.interfaceList[$scope.nodeIndex];
            }
            else if(message === undefined){
                // $scope.nodeIndex = message;
                // $scope.currentNodeName = '';
                //
                // $scope.data  = undefined;
                // $scope.interface = undefined;

                //$scope.$emit("editProcedure",false);
            }else if(message === 'port'){
                //todo input/output port configuration

                // update the procedure tab
                $scope.data  = $scope.dataList[$scope.nodeIndex];

                // update the interface tab
                $scope.interface = $scope.interfaceList[$scope.nodeIndex];
            }
        });

        // watch change of procedure data tree, if change update the flattenData, update version
        $scope.$watch('data',function(){
            updateVersion();
            flattenData();
            generateCode.generateCode()
        } , true);

        $scope.$watch('interface',function(){
            updateVersion();
            flattenData();
            generateCode.generateCode()
        },true);

        function updateVersion(){
            // compare current node procedure to original node type procedure
            // if change, update version
            if($scope.nodeIndex !== undefined && $scope.nodeIndex !== ''){
                var currentType = $scope.chartViewModel.nodes[$scope.nodeIndex].data.type;

                var currentProcedure = $scope.data;
                var currentInterface = $scope.interface;

                var typeProcedure = nodeCollection.getProcedureDataModel(currentType);
                var typeInterface = nodeCollection.getInterfaceDataModel(currentType);

                if(!angular.equals(currentProcedure,typeProcedure) ||
                    !angular.equals(currentInterface,typeInterface) ){
                    var d = new Date();
                    $scope.chartViewModel.nodes[$scope.nodeIndex].data.version = d.getTime();
                }

                $scope.currentNodeVersion = $scope.chartViewModel.nodes[$scope.nodeIndex].data.version === 0?'':'*';
            }
        }

        function flattenData(){
            // flatten the procedure three for data searching
            var i, l,
                nodes=[],
                visited=[];

            function clone(n) {
                if(n['title'] == 'Data'){
                    var props=['id',
                        'title',
                        'type',
                        'dataName',
                        'dataValue',
                        'inputConnectors',
                        'outputConnectors']
                }
                else if(n['title'] == 'Action'){
                    var props=['id',
                        'title',
                        'dataName',
                        'dataValue',
                        'type',
                        'dataType',
                        'category',
                        'method',
                        'return',
                        'parameters',
                        'inputConnectors',
                        'outputConnectors']
                }
                else if(n['title'] == 'Control'){
                    var props=['id',
                        'title',
                        'controlType',
                        'nodes',
                        'type',
                        'dataName',
                        'forList',
                        'inputConnectors',
                        'outputConnectors']
                }else if(n['title'] === 'Output'){
                    var props = ['id', 'title','type','name','dataValue'];
                }else if(n['title']==='Input'){
                    var props = ['id','title','type','name','dataValue','connected']
                }


                var i,l,
                    result={};
                for (i = 0, l = props.length; i < l; i++) {
                    if (n[props[i]] || n[props[i]]  === undefined) {
                        result[props[i]]= n[props[i]];
                    }
                }
                return result;
            }

            function helper (node) {
                var i, limit;
                if (visited.indexOf(node.id) == -1) {
                    visited.push(node.id);
                    nodes.push(clone(node));
                    if( node.nodes) {
                        for (i = 0, limit = node.nodes.length; i < limit; i++) {
                            helper(node.nodes[i]);
                        }
                    }
                }
            }

            if($scope.data){
                for (i = 0, l = $scope.data.length; i < l; i++) {
                    helper($scope.data[i]);
                }
            }

            // object of flatten procedure data tree
            $scope.flattenData = nodes;

            // add interface data to flatten data for dropdown search
            $scope.flattenData.push.apply($scope.flattenData, $scope.interfaceList[$scope.nodeIndex]);

            $scope.checkDupDataName();
        };

        //
        // observing all procedures, if dataName duplicated, change type to 'assign'
        // indicating assign value to existing variable instead of creating new variable
        //
        // fixme type checking is broken, could be bug from code generation part
        $scope.checkDupDataName = function(){
            for(var i in $scope.flattenData){

                var previous;
                previous = $filter('positionFilter')($scope.data,$scope.flattenData[i].id,$scope);

                var current = $scope.flattenData[i];

                var hasDupName = false;

                // check duplication with current node's input/ouput connector
                for(var m in current.inputConnectors){
                    if(current.dataName === current.inputConnectors[m].name){
                        hasDupName = true;
                        var original;

                        for(var k in $scope.data){
                            original = $scope.data[k];

                            if(original.id ===  current.id){
                                original.type = 'assign';
                            }
                        }
                    }
                }

                for(var n in current.outputConnectors){
                    if(current.dataName === current.outputConnectors[m].name){
                        hasDupName = true;
                        var original;

                        for(var k in $scope.data){
                            original = $scope.data[k];

                            if(original.id ===  current.id){
                                original.type = 'assign';
                            }
                        }
                    }
                }


                // check duplication with previous defined dataName
                for(var j in previous){

                    if(current.dataName!= undefined && previous[j].dataName === current.dataName){

                        hasDupName = true;

                        var original;

                        for(var k in $scope.data){
                            original = $scope.data[k];

                            if(original.id ===  current.id){
                                original.type = 'assign';
                            }
                        }
                    }
                }
                if(!hasDupName){
                    var original;

                    for(var k in $scope.data){
                        original = $scope.data[k];

                        if(original.id ===  current.id){
                            original.type = 'new';
                        }
                    }
                }
            }
        };

        //
        // procedure manipulation
        //
        $scope.removeOutput = function(scope) {
            scope.remove();

            var newOutputConnectorDataModels = [];
            var newConnectionDataModels = [];
            var newConnectionViewModels = [];

            for(var i = 0; i < $scope.chartViewModel.data.nodes[$scope.nodeIndex].outputConnectors.length; i ++){
                if($scope.chartViewModel.nodes[$scope.nodeIndex].outputConnectors[i].data !== scope.$modelValue){
                    newOutputConnectorDataModels.push($scope.chartViewModel.nodes[$scope.nodeIndex].outputConnectors[i].data);
                }else{
                    var deletedOutputConnectors = {
                        nodeId: $scope.chartViewModel.nodes[$scope.nodeIndex].data.id,
                        outputConnectorIndex:
                            $scope.chartViewModel.nodes[$scope.nodeIndex].outputConnectors.indexOf(
                                $scope.chartViewModel.nodes[$scope.nodeIndex].outputConnectors[i]
                            )
                    };
                }
            }

            $scope.chartViewModel.data.nodes[$scope.nodeIndex].outputConnectors = [];
            $scope.chartViewModel.nodes[$scope.nodeIndex].outputConnectors = [];

            for(var newOutputIndex = 0; newOutputIndex < newOutputConnectorDataModels.length; newOutputIndex++){
                $scope.chartViewModel.nodes[$scope.nodeIndex].addOutputConnector(newOutputConnectorDataModels[newOutputIndex]);
            }


            for(var j = 0; j < $scope.chartViewModel.connections.length; j++){
                if(!(deletedOutputConnectors.nodeId === $scope.chartViewModel.connections[j].data.source.nodeID &&
                    deletedOutputConnectors.outputConnectorIndex === $scope.chartViewModel.connections[j].data.source.connectorIndex)){
                        newConnectionViewModels.push($scope.chartViewModel.connections[j]);
                        newConnectionDataModels.push($scope.chartViewModel.connections[j].data);
                }
            }

            // fixme update connector index and source/dest in connections
            for(var m = 0; m < $scope.chartViewModel.connections.length; m++){

                var sourceDecreaseIn = 0;

                if($scope.chartViewModel.connections[m].data.source.nodeID === deletedOutputConnectors.nodeId){
                    if($scope.chartViewModel.connections[m].data.source.connectorIndex >
                        deletedOutputConnectors.outputConnectorIndex){
                        sourceDecreaseIn ++;
                    }
                }

                $scope.chartViewModel.connections[m].data.source.connectorIndex -= sourceDecreaseIn;
                $scope.chartViewModel.connections[m].source = $scope.chartViewModel.findOutputConnector(
                    $scope.chartViewModel.connections[m].data.source.nodeID,
                    $scope.chartViewModel.connections[m].data.source.connectorIndex);
            }

            $scope.chartViewModel.connections = newConnectionViewModels;
            $scope.chartViewModel.data.connections = newConnectionDataModels;
        };

        $scope.removeInput = function(scope) {
            scope.remove();

            var newInputConnectorDataModels = [];
            var newConnectionDataModels = [];
            var newConnectionViewModels = [];

            for(var i = 0; i < $scope.chartViewModel.data.nodes[$scope.nodeIndex].inputConnectors.length; i ++){

                if($scope.chartViewModel.nodes[$scope.nodeIndex].inputConnectors[i].data !== scope.$modelValue){
                    newInputConnectorDataModels.push($scope.chartViewModel.nodes[$scope.nodeIndex].inputConnectors[i].data);
                }else{
                    var deletedInputConnectors = {
                        nodeId: $scope.chartViewModel.nodes[$scope.nodeIndex].data.id,
                        inputConnectorIndex:
                            $scope.chartViewModel.nodes[$scope.nodeIndex].inputConnectors.indexOf(
                                $scope.chartViewModel.nodes[$scope.nodeIndex].inputConnectors[i]
                            )
                    };
                }
            }

            $scope.chartViewModel.data.nodes[$scope.nodeIndex].inputConnectors = [];
            $scope.chartViewModel.nodes[$scope.nodeIndex].inputConnectors = [];

            for(var newInputIndex = 0; newInputIndex < newInputConnectorDataModels.length; newInputIndex++){
                $scope.chartViewModel.nodes[$scope.nodeIndex].addInputConnector(newInputConnectorDataModels[newInputIndex]);
            }


            for(var j = 0; j < $scope.chartViewModel.connections.length; j++){
                if(!(deletedInputConnectors.nodeId === $scope.chartViewModel.connections[j].data.dest.nodeID &&
                    deletedInputConnectors.inputConnectorIndex === $scope.chartViewModel.connections[j].data.dest.connectorIndex)){
                    newConnectionViewModels.push($scope.chartViewModel.connections[j]);
                    newConnectionDataModels.push($scope.chartViewModel.connections[j].data);
                }
            }

            // fixme update connector index and source/dest in connections
            for(var m = 0; m < $scope.chartViewModel.connections.length; m++){

                var destDecreaseIn = 0;

                if($scope.chartViewModel.connections[m].data.dest.nodeID === deletedInputConnectors.nodeId){
                    if($scope.chartViewModel.connections[m].data.dest.connectorIndex >
                        deletedInputConnectors.inputConnectorIndex){
                        destDecreaseIn ++;
                    }
                }

                $scope.chartViewModel.connections[m].data.dest.connectorIndex -= destDecreaseIn;
                $scope.chartViewModel.connections[m].dest = $scope.chartViewModel.findInputConnector(
                    $scope.chartViewModel.connections[m].data.dest.nodeID,
                    $scope.chartViewModel.connections[m].data.dest.connectorIndex);
            }

            $scope.chartViewModel.connections = newConnectionViewModels;
            $scope.chartViewModel.data.connections = newConnectionDataModels;

            $scope.chartViewModel.connections = newConnectionViewModels;
            $scope.chartViewModel.data.connections = newConnectionDataModels;
        };

        $scope.remove = function(scope){
            scope.remove();
        };

        $scope.toggle = function(scope) {
            scope.toggle();
        };

        $scope.$on('copyProcedure',function(event,content) {
            $scope.newItem(undefined,undefined,true,content);
        });

        // new parameter / procedure items
        $scope.newItem = function(cate,subCate,isCopy,content) {
            $scope.currentHighestId = 0;

            try{
                 //finding adding position
                var selectedPos = undefined;
                var selectedParent = undefined;
                var insertPos = undefined;
                var insertIndex = undefined;

                function findSelected (tree){
                    for(var i = 0; i < tree.length; i++ ){
                        if(tree[i].selected === true){
                            selectedPos  = tree[i];
                            selectedParent = tree;
                        }else if(tree[i].nodes){
                            findSelected(tree[i].nodes)
                        }
                    }
                }

                findSelected($scope.data);

                if(selectedPos !== undefined){
                    if(selectedPos.title === 'Data' ||
                        selectedPos.title === 'Output' ||
                        selectedPos.title === 'Action' ||
                        (selectedPos.title === 'Control' && selectedPos.controlType === 'if else')||
                        isCopy === true){
                        // insert below the select
                        insertIndex = selectedParent.indexOf(selectedPos) + 1;
                    }
                    else if((selectedPos.title === 'Control' && selectedPos.controlType === 'if') ||
                        (selectedPos.title === 'Control' && selectedPos.controlType === 'else') ||
                        (selectedPos.title === 'Control' && selectedPos.controlType === 'for each')){
                        // insert inside the selected
                        insertPos = selectedPos.nodes;
                    }
                }
                else{
                    // no procedure is selected
                    insertPos = $scope.data;
                }

                // if copy
                if(isCopy && isCopy === true){
                    selectedParent.splice(insertIndex,0,content);
                }
                // if direct adding
                else if(cate === 'Data'){
                    var dataObj = {
                        id: $scope.maxId($scope.data)  + 1,
                        title:  'Data',
                        nodes: [],
                        dataName:undefined,
                        dataValue:undefined,
                        // create new variable or assign value to existing variable
                        type:undefined
                    };

                    if(insertIndex !== undefined){
                        selectedParent.splice(insertIndex,0,dataObj);
                    }else{
                        insertPos.push(dataObj);
                    }
                }

                else if(cate === 'Output'){
                    var outputObj = {
                        id:$scope.maxId($scope.data) + 1,
                        title: 'Output'
                    };

                    if(insertIndex !== undefined){
                        selectedParent.splice(insertIndex,0,outputObj);
                    }else{
                        insertPos.push(outputObj);
                    }

                    $scope.chartViewModel.nodes[$scope.nodeIndex].addOutputConnector(outputObj);
                }
                // todo update node flatten func
                else if(cate === "Function"){
                    var functionObj = {
                        id:$scope.maxId($scope.data) + 1,
                        title: 'Function',
                        name: 'FUNC_OUTPUT',
                        dataValue:undefined,
                        type:undefined
                    };

                    if(insertIndex !== undefined){
                        selectedParent.splice(insertIndex,0,outputObj);
                    }else{
                        insertPos.push(outputObj);
                    }

                    $scope.chartViewModel.nodes[$scope.nodeIndex].addOutputConnector(outputObj);
                }

                else if(cate === 'Action'){
                    var parameters = [];
                    var result;
                    var expression;

                    if(subCate.name === 'print' || subCate.name === 'expression'){
                        result = undefined;
                    }else{
                        result = '';
                    }

                    if(subCate.name !== 'expression'){
                        var paraList = getParamNames(MOBIUS[subCate.category][subCate.name]);
                        for(var j = 0; j< paraList.length; j++){
                            parameters.push({value:'',type:paraList[j]});
                        }
                    }

                    var actionObj = {
                        id: $scope.maxId($scope.data)  + 1,
                        title:  'Action',
                        nodes: [],
                        type:undefined,
                        expression:'',
                        method:subCate.name,
                        category:subCate.category,
                        return:subCate.return,
                        parameters:parameters,
                        result:result,
                        dataName:undefined
                    };

                    if(insertIndex !== undefined){
                        selectedParent.splice(insertIndex,0,actionObj);
                    }else{
                        insertPos.push(actionObj);
                    }

                } else if(cate === 'Control'){
                    switch(subCate){
                        case 'for each':
                            var forObj ={
                                id: $scope.maxId($scope.data) + 1,
                                title:  'Control',
                                nodes: [],
                                type:undefined,
                                controlType: subCate,
                                dataName:undefined,
                                forList:undefined
                            };

                            if(insertIndex !== undefined){
                                selectedParent.splice(insertIndex,0,forObj);
                            }else{
                                insertPos.push(forObj);
                            }
                            break;

                        case 'if else':
                            var ifObj = {
                                id: $scope.maxId($scope.data)  + 1,
                                title:  'Control',
                                nodes: [
                                    {
                                        id: $scope.maxId($scope.data) + 1,
                                        title:  'Control',
                                        controlType:'if',
                                        nodes: [],
                                        ifExpression:undefined

                                    },
                                    {
                                        id: $scope.maxId($scope.data) + 1,
                                        title:  'Control',
                                        controlType:'else',
                                        nodes: []
                                    }
                                ],

                                controlType: subCate

                            };

                            if(insertIndex !== undefined){
                                selectedParent.splice(insertIndex,0,ifObj);
                            }else{
                                insertPos.push(ifObj);
                            }
                            break;
                    }
                }
            }
            catch(err){
                consoleMsg.errorMsg('noNode');
            }
            var procedureDiv = document.getElementById("procedure-area");
            setTimeout(function(){
                procedureDiv.scrollTop = procedureDiv.scrollHeight;},0);
        };

        // add new item in interface (input /output)
        $scope.newInterface = function(cate) {
            try{
                if(cate === 'Input'){

                    var inputObj = {
                        id:$scope.interface.length + 1,
                        title: 'Input',
                        name: undefined,
                        connected:false,
                        dataValue:undefined,
                        type:undefined,
                        option:{
                            name:'none'
                        },
                        color:'#000000',
                        menuOptionText:undefined
                    };

                    $scope.interface.push(
                        inputObj
                    );

                    $scope.chartViewModel.nodes[$scope.nodeIndex].addInputConnector(inputObj);
                }else if(cate === 'Output'){
                    var outputObj = {
                        id:$scope.maxId($scope.data) + 1,
                        title: 'Output'
                    };

                    $scope.interface.push(outputObj);

                    $scope.chartViewModel.nodes[$scope.nodeIndex].addOutputConnector(outputObj);
                }
            } catch(err) {
                consoleMsg.errorMsg('noNode');
            }

            var argumentDiv = document.getElementById("argument-area");
            setTimeout(function(){argumentDiv.scrollTop = argumentDiv.scrollHeight;},0);
        };

        // interface design options
        $scope.interfaceOptions = [{name:'none'},
                                   {name:'slider'},
                                   {name:'dropdown'},
                                   {name:'color picker'},
                                   {name:'local file'}];

        $scope.menuOptions = function (menuOptionText) {
            if(menuOptionText){
                return menuOptionText.split(",");
            }else{
                return [];
            }
        };

        // fixme generate max id in $scope.data or generate uuID?
        $scope.currentHighestId = 0;

        $scope.maxId = function(tree){
            if(tree.length > 0){
                for(var i = 0; i < tree.length; i++){
                    if(tree[i].id > $scope.currentHighestId && tree.id !== 999){
                        $scope.currentHighestId = tree[i].id;
                    }
                    if(tree[i].nodes){
                        $scope.maxId(tree[i].nodes);
                    }
                }
            }

            return $scope.currentHighestId;
        };

        $scope.toggleTo = 'subgraph';
        $scope.subgraphToggle = function(reset){
            if($scope.toggleTo === 'procedure' || reset === true){
                $scope.toggleTo = 'subgraph';

                document.getElementsByClassName('button-action')[0].style.display = 'inline-block';
                document.getElementsByClassName('button-control')[0].style.display = 'inline-block';
                document.getElementsByClassName('button-output')[0].style.display = 'inline-block';
                document.getElementsByClassName('button-variable')[0].style.display = 'inline-block';

                document.getElementById('tree-root-procedure').style.display= 'block';
                document.getElementById('subgraph-flow-chart').style.display='none';

                document.getElementById('subgraphToggle').style.right='120px';

            }else{
                $scope.toggleTo = 'procedure';

                document.getElementsByClassName('button-action')[0].style.display = 'none';
                document.getElementsByClassName('button-control')[0].style.display = 'none';
                document.getElementsByClassName('button-output')[0].style.display = 'none';
                document.getElementsByClassName('button-variable')[0].style.display = 'none';

                document.getElementById('tree-root-procedure').style.display= 'none';
                document.getElementById('subgraph-flow-chart').style.display='block';

                $scope.$broadcast('subgraphExtend',$scope.currentSubgraphChartViewModel);
                document.getElementById('subgraphToggle').style.right='2px';
            }
        };

        $scope.onshow = function(event) {
            if ($scope.readonly !== true) {
                var width = window.innerWidth,
                    height = window.innerHeight;

                document.getElementById('menu-procedure').className = ' position-fixed';

                if (event.clientY > height - 100) {
                    document.getElementById('menu-procedure').className += ' menu-up';
                }

                if (event.clientX > width - 120) {
                    document.getElementById('menu-procedure').className += ' menu-left';
                }

                if (event.clientX > width - 200) {
                    document.getElementById('menu-procedure').className += ' submenu-left';
                }
            }
        };

    }]);