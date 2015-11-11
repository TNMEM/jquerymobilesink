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
"'" . $_POST['item']['Name'] . "', " .
"'" . $_POST['item']['Place'] . "', " .
"'" . $_POST['item']['Call'] . "', " .
"'" . $_POST['item']['Text'] . "', " .
"'" . $_POST['item']['Sign'] . "', " .
"'" . $_POST['item']['Tel'] . "', " .
"'" . $_POST['item']['Comm'] . "', " .
"'" . $_POST['item']['Ident'] . "', " .
"NOW() " .
");";

//echo $sql;

try {
	$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);	
	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $stmt = $dbh->prepare($sql);  
	$stmt->execute();
	$dbh = null;
	//echo 'Success: ' . $sql; 
	echo 'Notes Saved'; 
} catch(PDOException $e) {
	//echo 'Error: ' . $e->getMessage();
	echo 'Error';
}

?>
