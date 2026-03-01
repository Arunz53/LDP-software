<?php

$access_token = "1000.37e8096e6c0e8628a68062220160f500.4c3b4cb5d5f72e578d27e257b35a423d";

$url = "https://www.zohoapis.in/books/v3/organizations";

$options = [
    "http" => [
        "header" => "Authorization: Zoho-oauthtoken $access_token\r\n",
        "method" => "GET"
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo $result;

?>