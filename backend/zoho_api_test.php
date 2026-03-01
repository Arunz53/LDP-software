<?php
// Sample PHP code to call Zoho Books API using access token
$access_token = 'YOUR_ACCESS_TOKEN'; // Replace with your actual access token
$org_id = 'YOUR_ORG_ID'; // Replace with your actual organization ID

$url = "https://books.zoho.in/api/v3/customers?organization_id=$org_id";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Zoho-oauthtoken $access_token"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
echo $response;
?>
