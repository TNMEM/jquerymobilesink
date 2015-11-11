<?php

header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
header('Pragma: no-cache'); // HTTP 1.0.
header('Expires: 0'); // Proxies.
header('Content-Type: text/plain');
// iso8601
// 2013-07-26T12:05:24Z for example
// 2013-07-26T12:05Z is OK too

echo gmdate("Y-m-d\TH:i:s\Z", time() + (5 * 60)); 

?>
