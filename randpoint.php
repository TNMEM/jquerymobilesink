<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
header('Pragma: no-cache'); // HTTP 1.0.
header('Expires: 0'); // Proxies.
header('Content-Type: application/vnd.google-earth.kml+xml');
$longitude = rand(-80000, -120000)/1000;
$latitude = rand(23000, 50000)/1000;

// echo first twolines because server seems to interpret them.
echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<kml xmlns:gx="http://www.google.com/kml/ext/2.2">';
?>
<Document>
    <Placemark>
        <name><?php echo $longitude . "," . $latitude; ?></name>
        <Point>
            <coordinates><?php echo $longitude . "," . $latitude; ?></coordinates>
        </Point>
    </Placemark>
</Document>
</kml>
