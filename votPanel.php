<?php

header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
header('Pragma: no-cache'); // HTTP 1.0.
header('Expires: 0'); // Proxies.
//defeat xss=cross-site-scripting
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

include 'TESTONLY.php';

$sql = "INSERT INTO `TESTONLY`.`" . $_POST['item']['Table'] . "` " .
"(`Name`,`Place`,`Call`,`Text`,`Sign`,`Tel`,`Comm`,`Ident`, `Noted`) " .
"VALUES ( " .
":Name," .
":Place," .
":Call," .
":Text," .
":Sign," .
":Tel," .
":Comm," .
":Ident," .
"NOW() " .
");";

//echo $sql;

try {
	$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);	
	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $stmt = $dbh->prepare($sql);  
  //$stmt->bindParam(":Table", $_POST['item']['Table']); // cannot use with table name?
  $stmt->bindParam(":Name", $_POST['item']['Name']);
  $stmt->bindParam(":Place", $_POST['item']['Place']);
  $stmt->bindParam(":Call", $_POST['item']['Call']);
  $stmt->bindParam(":Text", $_POST['item']['Text']);
  $stmt->bindParam(":Sign", $_POST['item']['Sign']);
  $stmt->bindParam(":Tel", $_POST['item']['Tel']);
  $stmt->bindParam(":Comm", $_POST['item']['Comm']);
  $stmt->bindParam(":Ident", $_POST['item']['Ident']);
	$stmt->execute();
	$dbh = null;
	//echo 'Success: ' . $sql; 
	echo 'Notes Saved'; 
} catch(PDOException $e) {
	echo 'Error: ' . $e->getMessage();
	//echo 'Error';
}

?>
