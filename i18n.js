/**
 * Internationalization
 *
 * To use, just add the class="i18n" to any element who's inner text you want to be able to handle different languages.
 * Then add the text to be translated to each of the available languates.
 */
// handle page load
//Internationalization Functions
var i18n = {}
i18n.strings = {}
i18n.dynamicElements = []//elements that cause trouble, functions that return the element
i18n.strings["original"] = {}
//Get/Set Language from storage
i18n.currentLanguage = (window.localStorage.getItem("language"))?window.localStorage.getItem("language"):"english";

//Settings
i18n.strings["spanish"] = {
    "Search for a word or phrase:":"Buscar una palabra o frase:",
    "Bahá'í Writings <br>Search":"Buscador <br>Escritos Bahá'ís",
    "Language":"Idioma",
    "Search":"Buscar",
    "Options":"Opciones",
    "Results":"Resultados",
    "Context":"Contexto",
    "Back":"Atrás",
    "Close":"Cerrar",
    "Search":"Buscar",
    "Sentence":"Frases Encontradas",
    "Documents":"Documentos",
    "Sorry, no results where found.":"No se encontraron resultados.",
    "Configuration":"Configuración",
    "Config":"Config",
    "Favorites":"Favoritos",
    "History":"Historial",
    "Search History":"Historial de Búsquedas"
};
i18n.strings["english"] = {
    "Search for a word or phrase:":"Search for a word or phrase:",
    "Bahá'í Writings <br>Search":"Bahá'í Writings <br>Search",
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
    "Sorry, no results where found.":"Sorry, no results where found.",
    "Configuration":"Configuration",
    "Config":"Config",
    "Favorites":"Favorites",
    "History":"History",
    "Search History":"Search History"
};
i18n.strings["german"] = {
    "Search for a word or phrase:": "Nach einem Wort oder Satz suchen:",
    "Bahá'í Writings <br>Search": "Bahá'í-Schriften <br>Suchen",
    "Language": "Sprache",
    "Search": "Suchen",
    "Options": "Optionen",
    "Results": "Suchergebnisse",
    "Context": "Kontext",
    "Back": "Zuráck",
    "Close": "Schlieáen",
    "Search": "Suchen",
    "Sentence": "Satz",
    "Documents": "Dokumente",
    "Sorry, no results where found.": "Sorry, keine Suchergebnisse gefunden.",
    "Configuration":"Konfiguration",
    "Config":"Konfig",
    "Favorites":"Favoriten",
    "History":"Geschichte",
    "Search History":"Suchverlauf"
};
i18n.dynamicElements.push(
    function(){
        if(typeof $("#searchForm a")[1]!="undefined")
        return $("#searchForm a")[1].childNodes[0].childNodes[0].childNodes[0];
    },function(){
        if(typeof $(".ui-header .ui-btn-left span span")[0]!="undefined")
            return $(".ui-header .ui-btn-left span span")[0];
    },function(){
        if(typeof $("#searchForm .ui-btn-inner .ui-btn-text")[1]!="undefined")
            return $("#searchForm .ui-btn-inner .ui-btn-text")[1];
    },function(){
        if(typeof $(".ui-navbar .ui-btn-text").length)
            return $(".ui-navbar .ui-btn-text");
    });

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
        //support for jquery object as a dynamic element
        if(element instanceof jQuery){
            $.each(element,function(index,jqueryElm){
                i18n.elementTranslation(jqueryElm,language)
            })
        }
        else if(typeof element != "undefined")
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
i18n.setLanguage = function(language){
    window.localStorage.getItem("language",language);
}
i18n.onPageLoad = function(){
  i18n.currentLanguage = (window.localStorage.getItem("language"))?window.localStorage.getItem("language"):"english";
  i18n.translateAllTo(i18n.currentLanguage)
}
i18n.__ = function(string,language){
    return i18n.translateTo(string,language);
}