var currentSearchResults;
function startSearch(){
    $.mobile.loading( 'show');
    //fetch data
    $.ajax(baseUrl+"/json_searchv2.php?language="+currentLanguage+"&type=search&q="+encodeURI($("#SearchQuery")[0].value.replace(/^\s+|\s+$/g,"")),{
        //url: ,
        dataType: 'json',
        success: function(data, textStatus, xhr){
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
            $('#FoldersContent').html(ResultsContentHtml).ready(function(){console.log("ready!")
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
        onClickFunc = 'loadContext(\''+currentSearchResults.fragments[document.id]+'\')'
        $.each(currentSearchResults.fragments[document.id],function(key,fragment){
            if(key=="count") return true;
            onClickFunc = 'loadContext(\''
                +fragment.foundparagraphid+'\',\''
                +escape(fragment.Fragment)+'\')';
            fragmentText = '<p class="ui-li-desc">'+fragment.title+'</p>'
        })
    } else{
        onClickFunc = 'displayMatchesFor(\''+document.id+'\')'
    }
    currentCount = (currentSearchResults.fragments[document.id].count>1)?currentSearchResults.fragments[document.id].count:null;
    return '<li role="option" tabindex="0" data-theme="c" class="ui-btn ui-btn-icon-right ui-li ui-btn-up-c" onclick="'+onClickFunc+'">'
        +'<h3 class="ui-li-heading">'
            +document.title
        +'</h3>'
        +fragmentText
        +((currentCount)?'<span class="ui-li-count ui-btn-up-c ui-btn-corner-all">'+currentCount+'</span>':'')
        +'<span class="ui-icon ui-icon-arrow-r"></span>'
        +'</li>';
}
function displayMatchesFor(DocumentId){
    ResultsContentHtml = '<ul data-role="listview" class="ui-listview" role="listbox">';
    $.each(currentSearchResults.fragments[DocumentId],function(key,fragment){
        if(key=="count") return true;
        ResultsContentHtml = ResultsContentHtml
            +'<li role="option" tabindex="0" data-theme="c" class="ui-btn ui-btn-icon-right ui-li ui-btn-up-c" onclick="loadContext(\''
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
function loadContext(FoundParagraphID,Fragment){
    //console.debug(FoundParagraphID,Fragment)
    $.mobile.loading( 'show');
    Fragment=unescape(Fragment);
    //fetch
    $.get(
        baseUrl+"/json_searchv2.php?language="+currentLanguage+"&type=paragraph&q="+encodeURI($("#SearchQuery")[0].value.replace(/^\s+|\s+$/g,""))+"&FoundParagraphID="+FoundParagraphID+"&Fragment="+Fragment,
        function(data){
            $('#FragmentContext').html(data); //update content
            //hide loading
            $.mobile.hidePageLoadingMsg()
            //go to results page
            $.mobile.changePage($("#FragmentContextPage"),null,false,true);
            $('html,body').animate({ scrollTop: $("a#SEARCHRESULT").offset().top }, { duration: 'slow', easing: 'swing'});
            $(".ptf").append("<a href='page.html' class='saveFavorite' data-role='button' data-theme='b'  data-iconpos='right' data-icon='star'>Save to Favorites</a>");
            $(".saveFavorite").click(function(e){
                savedTexts = JSON.parse(window.localStorage.getItem("savedTexts"));
                if(!savedTexts)
                    savedTexts = []
                $(this).remove()
                savedTexts.push({query:$("#SearchQuery")[0].value.replace(/^\s+|\s+$/g,""),text:$(".ptf").html()})
                window.localStorage.setItem("savedTexts",JSON.stringify(savedTexts));
                e.preventDefault()
            })
            //$('#FragmentContext').append('<a href="#" data-role="button" data-inline="true" data-theme="b">Save to Favorites</a>');
        }
    );
}

//Get/Set Language from storage
var currentLanguage = (window.localStorage.getItem("language"))?
    window.localStorage.getItem("language"):"english";
//Internationalization Functions
i18n = {}
i18n.strings = {}
i18n.dynamicElements = []//elements that cause trouble, functions that return the element
i18n.strings["original"] = {}

//Settings
i18n.strings["spanish"] = {
    "Search for a word or phrase:":"Buscar una palabra o frase:",
    "Bah�'� Writings <br>Search":"Buscador <br>Escritos Bah�'�s",
    "Language":"Idioma",
    "Search":"Buscar",
    "Options":"Opciones",
    "Results":"Resultados",
    "Context":"Contexto",
    "Back":"Atr�s",
    "Close":"Cerrar",
    "Search":"Buscar",
    "Sentence":"Frases Encontradas",
    "Documents":"Documentos",
    "Sorry, no results where found.":"No se encontraron resultados."
};
i18n.strings["english"] = {
    "Search for a word or phrase:":"Search for a word or phrase:",
    "Bah�'� Writings <br>Search":"Bah�'� Writings <br>Search",
    "Language":"Language",
    "Search":"Search",
    "Options":"Options",
    "Results":"Results",
    "Context":"Context",
    "Back":"Back",
    "Close":"Close",
    "Search":"Search",
    "Sentence":"Sentence",
    "Documents":"Documents",
    "Sorry, no results where found.":"Sorry, no results where found."
};
i18n.strings["german"] = {
    "Search for a word or phrase:": "Nach einem Wort oder Satz suchen:",
        "Bah�'� Writings <br>Search": "Bah�'�-Schriften <br>Suchen",
        "Language": "Sprache",
        "Search": "Suchen",
        "Options": "Optionen",
        "Results": "Suchergebnisse",
        "Context": "Kontext",
        "Back": "Zur�ck",
        "Close": "Schlie�en",
        "Search": "Suchen",
        "Sentence": "Satz",
        "Documents": "Dokumente",
        "Sorry, no results where found.": "Sorry, keine Suchergebnisse gefunden."
};
i18n.dynamicElements[0] = function(){
    if(typeof $("#searchForm a")[1]!="undefined")
        return $("#searchForm a")[1].childNodes[0].childNodes[0].childNodes[0];
}
i18n.dynamicElements[1] = function(){
    if(typeof $(".ui-header .ui-btn-left span span")[0]!="undefined")
        return $(".ui-header .ui-btn-left span span")[0];
}
i18n.dynamicElements[1] = function(){
    if(typeof $("#searchForm .ui-btn-inner .ui-btn-text")[1]!="undefined")
        return $("#searchForm .ui-btn-inner .ui-btn-text")[1];
}

i18n.elementTranslation = function(element,language){
    if(
        typeof i18n.strings[language][element.innerHTML] == "undefined"
        &&
        typeof i18n.strings[language][element.originalString] == "undefined"
    ){
        console.log("Missing i18n. Language: "+language+". String: "+element.innerHTML)
    }else{
        //save the original texts
        if(typeof element.originalString =="undefined")
                element.originalString = element.innerHTML
        element.innerHTML = i18n.strings[language][element.originalString]
    }

}
i18n.translateAllTo = function(language){
    $.each($(".i18n"),function(key,element){
        i18n.elementTranslation(element,language)
    });
    $.each(i18n.dynamicElements,function(key,func){
        element = func();
        if(typeof element != "undefined")
            i18n.elementTranslation(element,language)
    });
}
i18n.translateTo = function(string,language){
    if(typeof language=="undefined")
        language = i18n.currentLanguage;
    if(typeof i18n.strings[language][string] == "undefined"){
        console.log("Missing i18n. Language: "+language+". String: "+element.innerHTML)
        return string
    }else{
        return i18n.strings[language][string]
    }
}
i18n.__ = function(string,language){
    return i18n.translateTo(string,language);
}
//Switch Languages
function setLanguage(language){
    currentLanguage = i18n.currentLanguage = language;
    window.localStorage.setItem("language", language);
    i18n.translateAllTo(language)
}