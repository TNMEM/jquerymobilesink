<?php

header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
header('Pragma: no-cache'); // HTTP 1.0.
header('Expires: 0'); // Proxies.
//defeat xss=cross-site-scripting
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

include 'TESTONLY.php';

// called like ...
// nearLatLng.php?aLat=35.1343075098425&aLng=-90.0067435061961&aDist=0.001&aStreet=Linden&aVotLay=14huvMa_IC-A_C1AwNchipdxMdgQvoy_Y7IUgk3k&aParty=DEM

$sql = "SELECT e.id, e.Party, e.PCT, e.Name, e.Place, e.Race, e.Sex, e.Birth, e.FirstReg, e.Latitude, e.Longitude " .
"FROM `" . $_GET['aVotLay'] . "` e " .
"WHERE (e.Latitude BETWEEN :aLat - :aDist AND :aLat + :aDist) " .
"AND " .
"(e.Longitude BETWEEN :aLng - :aDist AND :aLng + :aDist) " .
"AND " .
"e.Place like CONCAT('%', :aStreet, '%') "; // sleight of hand ... PDO quotes, so nearest quote cancels that

// '%' will not match null, so if you want everything...
if ($_GET['aParty'] != '%') {
  $sql = $sql . "AND " .
  "e.Party like CONCAT('%', :aParty, '%') ";
}
else {
  "e.Party like :aParty ";
}

$sql = $sql . "ORDER by e.Latitude, e.Longitude, e.Birth";

//echo $sql . "<br><br>";

try {
	$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);	
	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $stmt = $dbh->prepare($sql);
  //$stmt->bindParam(":aVotLay", $_GET['aVotLay']); // cannot use with table name?
  $stmt->bindParam(":aLat", $_GET['aLat']);
  $stmt->bindParam(":aLng", $_GET['aLng']);
  $stmt->bindParam(":aDist", $_GET['aDist']);
  $stmt->bindParam(":aStreet", $_GET['aStreet']);
  $stmt->bindParam(":aParty", $_GET['aParty']);
	$stmt->execute();
	$rows = $stmt->fetchAll(PDO::FETCH_OBJ);
	$dbh = null;
	echo '{"rows":'. json_encode($rows) .'}'; 
} catch(PDOException $e) {
	echo '{"error":{"text":'. $e->getMessage() .'}}'; 
}

?>
