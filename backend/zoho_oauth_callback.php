<?php

$client_id = "1000.IBDBJBA1XQE6YU1J0UVEYA3QDG0R4L";
$client_secret = "c330e713efb5c6b872d6649de197e5c6ea8e4b3f32"; // put correct secret
$redirect_uri = "http://localhost:8080/LDP_software/LDP-Software/backend/zoho_oauth_callback.php";

$code = $_GET['code'];

$url = "https://accounts.zoho.in/oauth/v2/token";

$data = [
    "grant_type" => "authorization_code",
    "client_id" => $client_id,
    "client_secret" => $client_secret,
    "redirect_uri" => $redirect_uri,
    "code" => $code
];

$options = [
    "http" => [
        "header"  => "Content-type: application/x-www-form-urlencoded",
        "method"  => "POST",
        "content" => http_build_query($data)
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo $result;

?>