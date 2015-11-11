<?php

header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
header('Pragma: no-cache'); // HTTP 1.0.
header('Expires: 0'); // Proxies.
//defeat xss=cross-site-scripting
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");

//doesn't need jason_encode as it would with an array.
// fall-back lat/lng at 157 Poplar Avenue, Memphis, TN 38103 (election commission)
?>

<li class="geolistAdd" data-role="list-divider">Fusion - Needs Google</li>
<li class="geolistAdd">
  <a href="geolocation_gmaps.html" onclick="window.votlay='14huvMa_IC-A_C1AwNchipdxMdgQvoy_Y7IUgk3k'; window.pctlay='1TqqJqLjrtojFkLBCCVfiMzvfsuCB9Z-HRMAl-0Q'; window.blklay='1pk_uYm5kkcaC0K2ahfRlcgOGEQiezfAmwdOPhXQ'; window.pty='%'; window.pcts='PCT in (01601,01603,01700,02001,02800,03601)'; window.geolat=35.1495; window.geolng=-90.0489; window.presVP=false;">Midtown Top Voters</a>
</li>
<li class="geolistAdd">
  <a href="geolocation_gmaps.html" onclick="window.votlay='1PFGjPfz2NhP77SXe6Uy0q8Si0VT8mtb-pmKnqtg'; window.pctlay='1TqqJqLjrtojFkLBCCVfiMzvfsuCB9Z-HRMAl-0Q'; window.blklay='1pk_uYm5kkcaC0K2ahfRlcgOGEQiezfAmwdOPhXQ'; window.pty='%'; window.pcts='PCT in (01601)'; window.geolat=35.1495; window.geolng=-90.0489; window.presVP=false;">16-1 All Registered</a>
</li>
<li class="geolistAdd">
  <a href="geolocation_gmaps.html" onclick="window.votlay='14huvMa_IC-A_C1AwNchipdxMdgQvoy_Y7IUgk3k'; window.pctlay='1TqqJqLjrtojFkLBCCVfiMzvfsuCB9Z-HRMAl-0Q'; window.blklay='1pk_uYm5kkcaC0K2ahfRlcgOGEQiezfAmwdOPhXQ'; window.pty='GOP'; window.pcts='PCT in (01601)'; window.geolat=35.1495; window.geolng=-90.0489; window.presVP=false;">16-1 Top GOP</a>
</li>
<li class="geolistAdd">
  <a href="geolocation_gmaps.html" onclick="window.votlay='1TqCZYSvZ-NbMLXcjwE4OzTIsfACJRZQhoGf7fVY'; window.pctlay='1TqqJqLjrtojFkLBCCVfiMzvfsuCB9Z-HRMAl-0Q'; window.blklay='1pk_uYm5kkcaC0K2ahfRlcgOGEQiezfAmwdOPhXQ'; window.pty='%'; window.pcts='PCT in (07406,08101,08102)'; window.geolat=35.1495; window.geolng=-90.0489; window.presVP=false;">Eddie Settles</a>
</li>

