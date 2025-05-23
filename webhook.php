<?php
// Webhook listener for GitHub auto-deployment

$secret = 'nosecrets'; // Optional: Set this if using a secret in GitHub

// Get raw POST data from GitHub
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify the GitHub payload (if using a secret)
if ($secret && $signature) {
    $hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($hash, $signature)) {
        die('Invalid signature');
    }
}

// Decode the JSON payload
$data = json_decode($payload, true);

if ($data['ref'] === 'refs/heads/main') {
    // Run git pull command to sync repository
    shell_exec('cd /home/qqoyyh31/public_html/buylo.ca/webai2 && git pull origin main');
    echo "Repository updated successfully.";
} else {
    echo "No update needed.";
}
?>