<?php
// Webhook listener for GitHub auto-deployment

$secret = '@@@'; // Optional: Set this if using a secret in GitHub

// Log webhook requests for debugging
file_put_contents('/home/qqoyyh31/public_html/webhook.log', date('Y-m-d H:i:s') . " - Webhook received\n", FILE_APPEND);

// Get raw POST data from GitHub
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify GitHub Payload (if using a secret)
if ($secret && $signature) {
    $hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($hash, $signature)) {
        die('Invalid signature');
    }
}

// Decode the JSON payload
$data = json_decode($payload, true);

// Ensure the push event is to the 'main' branch
if (isset($data['ref']) && $data['ref'] === 'refs/heads/main') {
    // Run git pull to sync files on the server
    exec('cd /home/qqoyyh31/public_html/buylo.ca/webai2 && git pull origin main 2>&1', $output, $returnCode);
    
    // Log the output
    file_put_contents('/home/qqoyyh31/public_html/webhook.log', date('Y-m-d H:i:s') . " - Git pull output:\n" . implode("\n", $output) . "\n", FILE_APPEND);
    
    if ($returnCode !== 0) {
        echo "Error pulling from GitHub: " . implode("\n", $output);
    } else {
        echo "Repository updated successfully.";
    }
} else {
    echo "No update needed.";
}
?>