<?php
// Test Zoho Books API call using access token and organization ID
// 1. Complete the OAuth flow and copy your access token from zoho_oauth_callback.php
// 2. Paste it below
// 3. Visit this file in your browser to test the API call

$access_token = 'PASTE_YOUR_ACCESS_TOKEN_HERE'; // Paste the access token from zoho_oauth_callback.php
$organization_id = '60066001798'; // Your Zoho Books org ID

$url = "https://books.zoho.in/api/v3/contacts?organization_id=$organization_id";

$headers = [
    "Authorization: Zoho-oauthtoken $access_token"
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo "<pre>" . htmlspecialchars($response) . "</pre>";
