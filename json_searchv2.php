<?php
$lanugages = array("english"=>"english","spanish"=>"spanish","german"=>"german");
$types = array("search"=>"search","paragraph"=>"paragraph","document"=>"document");
$language = $lanugages[$_GET["language"]];
$type = $types[$_GET["type"]];
$query = $_GET["q"];

function getCurl($url){
    $ch = curl_init( $url );
    curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
    curl_setopt( $ch, CURLOPT_HEADER, true );
    curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
    list( $header, $searchResults ) = preg_split( '/([\r\n][\r\n])\\1/', curl_exec( $ch ), 2 );
    //Close up Curl
    $status = curl_getinfo( $ch );
    curl_close( $ch );
    return $searchResults;
}
function extraer_texto($pre,$post,$str){
	$pos = strpos($str,$pre);
	$substr = substr($str,$pos+strlen($pre));
	$pos = strpos($substr,$post);
	$substr = substr($substr,0,$pos);
	return $substr;
}
function extraer_textos($pre,$post,$array){
	foreach($array as $str){
		$return[]=extraer_texto($pre,$post,$str);
	}
	return $return;
}
function pregxtract($pre,$post,$str,$length="{1,30}"){
	$match=array();
	preg_match_all('|'.$pre.'.'.$length.$post.'|',$str,$match);
	$return = extraer_textos($pre,$post,$match[0]);
	return $return;
}



if(empty($type)||$type=="search"){
    $url = "http://bahairesearch.com/Services/Rest.svc/search/$language/baha'i?q=".urlencode($query);
    header( 'Content-type: application/' . ( $is_xhr ? 'json' : 'x-javascript' ) );
    $searchResults = getCurl($url);
    
    ///Fast and Dirty Method 
    require_once("xml2json.php");
    $searchResults = xml2array($searchResults,1);//*/
    
    /*Simple XML Way*/
    //$searchResults = simplexml_load_string($searchResults);
    $resultCount = count($searchResults["fragments"]["n"])/2;
    $folders = $documents = $fragments = $folderCount = $documentsReference = array();
    for($i=0;$i<$resultCount;$i++){
        switch($searchResults["fragments"]["n"][$i."_attr"]["type"]){
            case "F":
                $folders[$searchResults["fragments"]["n"][$i."_attr"]["id"]]=$searchResults["fragments"]["n"][$i."_attr"];
                break;
            case "D":
                $documents[$searchResults["fragments"]["n"][$i."_attr"]["parentid"]][$searchResults["fragments"]["n"][$i."_attr"]["id"]]=$searchResults["fragments"]["n"][$i."_attr"];
                $documentsReference[$searchResults["fragments"]["n"][$i."_attr"]["id"]]=$searchResults["fragments"]["n"][$i."_attr"]; 
                break;
            case "G":
                $fragments[$searchResults["fragments"]["n"][$i."_attr"]["parentid"]][$searchResults["fragments"]["n"][$i."_attr"]["foundparagraphid"]]=$searchResults["fragments"]["n"][$i."_attr"];
                $fragments[$searchResults["fragments"]["n"][$i."_attr"]["parentid"]][$searchResults["fragments"]["n"][$i."_attr"]["foundparagraphid"]]["Fragment"]=base64_encode($searchResults["fragments"]["n"][$i]);
                $fragments[$searchResults["fragments"]["n"][$i."_attr"]["parentid"]]["count"] = count($fragments[$searchResults["fragments"]["n"][$i."_attr"]["parentid"]])-1;
                if($fragments[$searchResults["fragments"]["n"][$i."_attr"]["parentid"]]["count"]==0)$fragments[$searchResults["fragments"]["n"][$i."_attr"]["parentid"]]["count"]=1;
                $docId=$searchResults["fragments"]["n"][$i."_attr"]["parentid"];
                $folderId=$documentsReference[$docId]["parentid"];
                $folderCount[$folderId]++;
                break;
        }
    }
    $searchResults = array("folders"=>$folders,"documents"=>$documents,"fragments"=>$fragments,"folderCount"=>$folderCount);
    $searchResults = json_encode($searchResults);
    echo $searchResults;
    
}elseif($type=="paragraph"){
    $fragment = urlencode(base64_decode($_GET["Fragment"]));
    $query = urlencode($query);
    $url = "http://bahairesearch.com/Services/Rest.svc/Document/$language/{$_GET["FoundParagraphID"]}?q=$query&Fragment=$fragment";
    $searchResults = getCurl($url);
    //Get the specific Paragraph
    //$searchResults = html_entity_decode(extraer_texto("&lt;div class='ptf'&gt;","&lt;/div&gt;",$searchResults));
    
    $searchResultsArray = pregxtract("&lt;p&gt;","&lt;/p&gt;",$searchResults,"{1,5000}");
    if(is_array($searchResultsArray)){
        foreach($searchResultsArray as $key=>$paragraph){
            if(strstr($paragraph,"&lt;div class='ptf'&gt;")){
                $foundParagraphKey = $key;
                break;
            }      
        }
        for($i=$key-6;$i<$key+6;$i++){
            $reducedSearchResults[$i] = $searchResultsArray[$i];
        }
        $searchResults = html_entity_decode("&lt;p&gt;".implode("&lt;/p&gt;&lt;p&gt;",$reducedSearchResults)."&lt;/p&gt;");    
    }else{
        $searchResults = html_entity_decode($searchResults);
    }
    
    echo $searchResults;
    //then simply use $("#SEARCHRESULT")[0].focus(); in javascript to move to the resulted text
}


//var_dump($searchResults);



?>