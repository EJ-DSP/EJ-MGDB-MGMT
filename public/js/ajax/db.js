'use strict';
$( document ).ready(function() {
    var collData=[]
    var childs=[]
    var looper = $.Deferred().resolve();

    //init json vewier    
    var jsonViewerColOptions = new JSONViewer();
    var jsonViewerIndexes = new JSONViewer();
    document.querySelector("#db_ColIndexes").appendChild(jsonViewerIndexes.getContainer());
    document.querySelector("#db_ColSettings").appendChild(jsonViewerColOptions.getContainer());

    //api pathing
    const basePath = '/api/v1'
    const apiPaths = {
        GetColDoc: basePath+'/mgdb/getColDoc',
        GetColIndexes: basePath+'/mgdb/getColIndexes',
        GetColDocCount: basePath+'/mgdb/getDocCount',
        GetDBList: basePath+'/mgdb/getDBList',
        GetDBColList: basePath+'/mgdb/getColList',
    }
 
    //init default doms
    var clstIds = []
    $('.accordion-container').each(function () {clstIds.push(this.id);});


    // Pull collections per Database Sub Call
    var getDBColList = function(clstName,dbName){
        var deferred = $.Deferred();
        var childs=[]
        $.ajax({ 
                url: apiPaths.GetDBColList,
                dataType: "json",
                data: { 
                    clstName: clstName,
                    dbName: dbName,
                    export: 'true'                  
                },
                success: function(data){   
                    childs = []
                    data.forEach(function(item, index, arr){childs.push({"label":item.name,"clstName":clstName,"options":item})})
                    mergeColData(dbName,childs)
                    deferred.resolve(childs);
                },
                error: function(error) {
                    deferred.reject(error);
                }
            });
            return deferred.promise();
    }

    // Loop over clst id and add pull List of databases
    for (let clstName of clstIds) {
        let $clst = $('#'+clstName)
        $clst.on("click", async function(e){
            //Get Data
            $.ajax({ 
                url: apiPaths.GetDBList,
                dataType: "json",
                data: {"clstName": clstName},
                success: function(data){                      
                    BuildDBColList(clstName,data)
                }
            });
            
            // ignore inner accordion clicks
            $clst.find('.accordion-body').click(function (e) {
                e.stopPropagation(); 
            });

        });
    }// end for loop

    //Loop over every DB and build Collections list
    function BuildDBColList(cName,dbList){
        // go through each item and call the ajax function
        $.when.apply($, $.map(dbList, function(dbName) {
            return getDBColList(cName,dbName);
        })).then(function() {
            // run this after all ajax calls have completed
            buildColTree(cName)
            //Done
        });
    }
    
    function mergeColData(dbName,childs){
        collData.push({
            name:dbName,
            db: true,
            children: childs
        })          
    }
 
    function sortByColName(x,y)
    { 
        if ( x.name.toLowerCase() < y.name.toLowerCase()){return -1;}
        if ( x.name.toLowerCase() > y.name.toLowerCase()){return 1;}
        return 0;
    }

    async function populateSummary(node,idx)
    {
        //Print Index Count
        $('#db_ColIdxCount').html(idx.length) 

        //Get Document Count
        $.ajax({ 
            url: apiPaths.GetColDocCount,
            dataType: "text",
            data: {"clstName": node.clstName, "cName": node.name,"dbName": node.parent.name},
            success: function(data){
                $('#db_ColDocCount').html(data) 

                if(Number(data)>=1){

                    //Get Sample Doc
                    $.ajax({ 
                        url: apiPaths.GetColDoc,
                        dataType: "json",
                        data: {"clstName": node.clstName, "cName": node.name,"dbName": node.parent.name,"limit":5},
                        success: function(data){
                            var coldocObj = $("#db_ColDocs")
                            coldocObj.empty()
                            var colDoc = {}
                            $('#colDocLoading').show()
                            data.forEach(function(doc){
                                $('#colDocLoading').hide()
                                const jsonViewerColDocSample = new JSONViewer();
                                coldocObj.append('<div id="colDoc_'+doc._id+'"></div><hr></hr>')
                                colDoc = $( "#colDoc_"+doc._id)
                                document.querySelector("#colDoc_"+doc._id).appendChild(jsonViewerColDocSample.getContainer());                        
                                jsonViewerColDocSample.showJSON(doc,6,4);
                                }                    
                            )
                        },
                        error: function(err){
                            $('#db_ColDocs').html(err) 
                        }
                    });
                }
                else {$("#db_ColDocs").empty();$('#colDocLoading').hide();}

            },
            error: function(err){
                $('#db_ColDocCount').html(err) 
            },

        });


    }

    function buildColTree(cName){
        // collData = [
        //     {
        //         name: 'node1',
        //         db: true,
        //         children: [
        //             { label: 'child11', },
        //             { label: 'child21', },
        //             { label: 'child21', },
        //             { label: 'child21', },
        //             { label: 'child21', },
        //             { label: 'child21', }
        //         ]
        //     },
        //     {
        //         name: 'node2',
        //         db: true,
        //         children: [
        //             { name: 'child3',},
        //             { label: 'child21', },
        //             { label: 'child21', },
        //             { label: 'child21', }
        //         ]
        //     }
        // ];
        //Build collection tree with updated collections
        $('#'+cName).find('#content').tree({
            closedIcon: $('<i class="icon-chevron-up"></i>'),
            openedIcon: $('<i class="icon-chevron-down"></i>'),
            buttonLeft: true,
            selectable: true,
            autoOpen: false,
            data: collData.sort(sortByColName)
        }).bind('tree.click',function(e) {
                if(e.node.db===true){
                    //is db expand/contract database list
                    $(this).tree('toggle', e.node);
                } else {
                    //Collection clicked populate settings from node details
                    //$('#db_ColSettings').val(JSON.stringify(e.node.options))  
                    
                    //Pull collection indexes
                    $.ajax({ 
                        url: apiPaths.GetColIndexes,
                        dataType: "json",
                        data: {"clstName": e.node.clstName, "cName": e.node.name,"dbName": e.node.parent.name},
                        success: function(data){    
                            //Trigger Summary call
                            populateSummary(e.node,data)
                            //Print Json 
                            jsonViewerIndexes.showJSON(data,4,2);
                            jsonViewerColOptions.showJSON(e.node.options.options,4);
                        }
                    });
                }
            }
        );
    }
})