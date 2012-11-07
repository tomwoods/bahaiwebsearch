var currentSearchResults, currentFolder, currentDocumentTitle;
function startSearch(){
    $.mobile.loading( 'show');
    //fetch data
    $.ajax(baseUrl+"/json_searchv2.php?language="+i18n.currentLanguage+"&type=search&q="+encodeURI($("#SearchQuery").val().replace(/^\s+|\s+$/g,"")),{
        //url: ,
        dataType: 'json',
        success: function(data, textStatus, xhr){
            History.saveSearchHistory()
            $.mobile.loading( 'show');
            //populate folder results page
            currentSearchResults = data;
            ResultsContentHtml = '<ul data-role="listview" class="ui-listview" role="listbox">';
            FolderCount = 0;
            $.each(data.folders,function(key,folder){
                FolderCount++;
            });
            if(FolderCount>4){
                $.each(data.folders,function(key,folder){
                    ResultsContentHtml +='<li role="option" tabindex="0" data-theme="c" class="ui-btn ui-btn-icon-right ui-li ui-btn-up-c ui-li-has-count" onclick="displayDocumentsFor(\''+folder.id+'\')">'
                        +'<h3 class="ui-li-heading">'
                            +folder.title
                        +'</h3>'
                        +'<span class="ui-li-count ui-btn-up-c ui-btn-corner-all">'+data.folderCount[folder.id]+'</span>'
                        +'<span class="ui-icon ui-icon-arrow-r"></span>'
                        +'</li>';
                });
            }else if(FolderCount>0){
                $.each(data.folders,function(key,folder){
                    ResultsContentHtml += '<li data-role="list-divider" role="heading" tabindex="0" class="ui-li ui-li-divider ui-btn ui-bar-b ui-btn-up-undefined">'+folder.title+'</li>';
                    $.each(currentSearchResults.documents[folder.id],function(key,document){
                        ResultsContentHtml += contentForDocuments(document);
                    });
                });
            }else{//No results
                ResultsContentHtml += '<h3 class="ui-li-heading" style="padding-left:10px">'+i18n.__('Sorry, no results where found.')+'</h3>';
            }

            ResultsContentHtml += "</ul>";
            $('#FoldersContent').html(ResultsContentHtml).ready(function(){
                //go to results page
                $.mobile.changePage($("#FoldersPage"),{
                    allowSamePageTransition:true,
                    showLoadMsg:true
                },false,true);
                //hide loading
                $.mobile.hidePageLoadingMsg();
            });
        }
    });
}
function displayDocumentsFor(FolderId){
    currentFolderId = FolderId
    ResultsContentHtml = '<ul data-role="listview" class="ui-listview" role="listbox">';
    $.each(currentSearchResults.documents[FolderId],function(key,document){
        ResultsContentHtml += contentForDocuments(document);
    });
    ResultsContentHtml += "</ul>";
    $('#DocumentsContent').html(ResultsContentHtml);
    //go to results page
    $.mobile.changePage($("#DocumentsPage"),null,false,true);
}
function contentForDocuments(document){
    fragmentText = '';
    if(currentSearchResults.fragments[document.id].count == 1){
        onClickFunc = 'loadContext(\''+escape(document.title)+'\',\''+currentSearchResults.fragments[document.id]+'\')'
        $.each(currentSearchResults.fragments[document.id],function(key,fragment){
            if(key=="count") return true;
            onClickFunc = 'loadContext(\''
                +escape(document.title)+'\',\''
                +fragment.foundparagraphid+'\',\''
                +escape(fragment.Fragment)+'\')';
            fragmentText = '<p class="ui-li-desc">'+fragment.title+'</p>'
        })
    } else{
        onClickFunc = 'displayMatchesFor(\''+escape(document.title)+'\',\''+document.id+'\')'
    }
    currentCount = (currentSearchResults.fragments[document.id].count>1)?currentSearchResults.fragments[document.id].count:null;
    return '<li role="option" tabindex="0" data-theme="c" class="ui-btn ui-btn-icon-right ui-li ui-btn-up-c" style="padding: 0px;" onclick="'+onClickFunc+'">'
        +'<h3 class="ui-li-heading">'
            +document.title
        +'</h3>'
        +fragmentText
        +((currentCount)?'<span class="ui-li-count ui-btn-up-c ui-btn-corner-all">'+currentCount+'</span>':'')
        +'<span class="ui-icon ui-icon-arrow-r"></span>'
        +'</li>';
}
function displayMatchesFor(documentTitle,DocumentId){
    ResultsContentHtml = '<ul data-role="listview" class="ui-listview" role="listbox">';
    $.each(currentSearchResults.fragments[DocumentId],function(key,fragment){
        if(key=="count") return true;
        ResultsContentHtml = ResultsContentHtml
            +'<li role="option" tabindex="0" data-theme="c" class="ui-btn ui-btn-icon-right ui-li ui-btn-up-c" onclick="loadContext(\''
                +documentTitle+'\',\''
                +fragment.foundparagraphid+'\',\''
                +escape(fragment.Fragment)+'\')">'
            +'<div class="ui-btn-inner"><div class="ui-btn-text">'
            //+'<h3 class="ui-li-heading">'
            //    +fragment.title
            //+'</h3>'
            +'<p class="ui-li-desc" style="margin: 0 0 .6em;">'+fragment.title+'</p>'
            +'</div><span class="ui-icon ui-icon-arrow-r"></span></div></li>';
    });
    ResultsContentHtml += "</ul>";
    $('#FragmentsContent').html(ResultsContentHtml);
    //go to results page
    $.mobile.changePage($("#FragmentsPage"),null,false,true);
}
function loadContext(documentTitle,FoundParagraphID,Fragment){
    currentDocumentTitle = unescape(documentTitle)
    $.mobile.loading( 'show');
    Fragment=unescape(Fragment);
    //fetch
    $.get(
        baseUrl+"/json_searchv2.php?language="+currentLanguage+"&type=paragraph&q="+encodeURI($("#SearchQuery").val().replace(/^\s+|\s+$/g,""))+"&FoundParagraphID="+FoundParagraphID+"&Fragment="+Fragment,
        function(data){
            $('#FragmentContext').html(data); //update content
            $(".saveFavorite").show(); //show the save to Favorites button
            $(".saveFavorite").unbind("click")
            //hide loading
            $.mobile.hidePageLoadingMsg()
            //go to results page
            $.mobile.changePage($("#FragmentContextPage"),null,false,true);
            //Save to favorites functionality
            if($(".ptf").length)
                $.mobile.silentScroll($(".ptf").offset().top);
            $(".saveFavorite").click(function(e){
                var savedTexts = JSON.parse(window.localStorage.getItem("savedTexts"));
                if(!savedTexts)
                    savedTexts = {}
                if(typeof savedTexts[$("#SearchQuery").val().replace(/^\s+|\s+$/g,"")] == "undefined")
                    savedTexts[$("#SearchQuery").val().replace(/^\s+|\s+$/g,"")] = []
                
                savedTexts[$("#SearchQuery").val().replace(/^\s+|\s+$/g,"")].push({
                    query:$("#SearchQuery").val().replace(/^\s+|\s+$/g,""),
                    text:$('#FragmentContext').html(),
                    paragraphID:FoundParagraphID,
                    date:(new Date()).toString(),
                    folderTitle:currentSearchResults.folders[currentFolderId].title,
                    document:currentDocumentTitle
                })
                
                window.localStorage.setItem("savedTexts",JSON.stringify(savedTexts));
                $( "#messagePopup" ).html("Saved!").popup( "open" )
                setTimeout(function(){$( "#messagePopup" ).delay(1000).popup( "close" )},1000);
                // delete the save button
                $(this).hide()
                e.preventDefault()
            })
        }
    );
}
// Run stuff when the page loads
$('div').live('pageshow',function(event, ui){
    if($("#Collections #favorites").length){//is the favorites page
        favoritesInit()
    }
     if($("#History #list").length){//is the History page
         History.init()
     }
     if($("#SearchPage #searchForm").is(":visible")){//is the History page
         var query = $.parseQuerystring()
         if(typeof query["q"]!="undefined"){
             $("#SearchQuery").val(query["q"])
             startSearch()
        }
    }
    //internationalization
    i18n.onPageLoad()
    $("#select-choice-1").val(i18n.currentLanguage)
});

/**
 *Favorites
 */
function favoritesInit(){
    savedFavorites = JSON.parse(window.localStorage.getItem("savedTexts"));
    if(!savedFavorites)
        return false;
    collectionListHtml = _.template($("#collectionListTemplate").html(), savedFavorites);
    $("#Collections #favorites").html(collectionListHtml)
    $("#Collections #favorites").trigger("create");
    $("#collectionList a").click(function(e){
        displayCollectionList($(this).data("query"))
        e.preventDefault()
    })
}

function displayCollectionList(query){
    $.mobile.changePage($("#DocumentListing"),null,false,true);
    documentListHtml = _.template($("#documentListTemplate").html(), {"documents":savedFavorites[query]});
    $("#DocumentListing div.list").html(documentListHtml);
    $("#DocumentListing div.list").trigger("create");
    $("#documentList a").click(function(e){
        displayDocument(query, $(this).data("paragraphid"))
        e.preventDefault()
    })
}

function displayDocument(query, paragraphID){
    $.mobile.changePage($("#DocumentView"),null,false,true);
    $.each(savedFavorites[query],function(key,document){
        if(document.paragraphID == paragraphID){
            $("#DocumentView .document").html(document.text)
            $("#DocumentView .title").html(document.folderTitle+" : "+document.document)
            if($(".ptf").length)
                setTimeout(function(){$.mobile.silentScroll($(".ptf").offset().top)},500);
        }
    })

}
// format date, taken from http://stackoverflow.com/questions/9050763/format-date-in-jquery
function getISODateTime(d){
    // padding function
    var s = function(a,b){return(1e15+a+"").slice(-b)};

    // default date parameter
    if (typeof d === 'undefined'){
        d = new Date();
    };

    // return ISO datetime
    return d.getFullYear() + '-' +
        s(d.getMonth()+1,2) + '-' +
        s(d.getDate(),2) + ' ' +
        s(d.getHours(),2) + ':' +
        s(d.getMinutes(),2) + ':' +
        s(d.getSeconds(),2);
}
/**
 * History
 */
History = {
    "maxSavedSearches":25,
    "init":function(){
        savedSearches = JSON.parse(window.localStorage.getItem("savedSearches"));
        if(!savedSearches)
            return false;
        savedSearchesListHtml = _.template($("#savedSearchesListHtmlTemplate").html(), {"savedSearches":savedSearches});
        $("#History #list").html(savedSearchesListHtml)
        $("#History #list").trigger("create");
        $("#savedSearchesList a").click(function(e){
            window.location.href = "index.html?q="+encodeURI($(this).data("query"))
            e.preventDefault()
        })
    },
    "saveSearchHistory":function(){
        savedSearches = JSON.parse(window.localStorage.getItem("savedSearches"));
        if(!savedSearches)
            savedSearches = []
        savedSearches.unshift({
            query:$("#SearchQuery").val(),
            date:(new Date()).toString(),
            language:i18n.currentLanguage
        })
        savedSearches = savedSearches.slice(0,this.maxSavedSearches);
        window.localStorage.setItem("savedSearches",JSON.stringify(savedSearches));
    }
}

/**
 * JQuery Plugins
 */
//parse the query string (http://paulgueller.com/2011/04/26/parse-the-querystring-with-jquery/)
jQuery.extend({
  parseQuerystring: function(){
    var nvpair = {};
    var qs = window.location.search.replace('?', '');
    var pairs = qs.split('&');
    $.each(pairs, function(i, v){
      var pair = v.split('=');
      nvpair[pair[0]] = pair[1];
    });
    return nvpair;
  }
});