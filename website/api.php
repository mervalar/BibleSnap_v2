<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/db.php';

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? ($_GET['action'] ?? '');
$ip     = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null;

// ── Track page visit ──────────────────────────────────────────────────────────
if ($action === 'track') {
    try {
        $db   = getDb();
        $ua   = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);
        $stmt = $db->prepare('INSERT INTO page_visits (ip_address, user_agent) VALUES (?, ?)');
        $stmt->execute([$ip, $ua]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false]);
    }
    exit;
}

// ── Join waitlist ─────────────────────────────────────────────────────────────
if ($action === 'join') {
    $email = trim($input['email'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
        exit;
    }

    try {
        $db   = getDb();
        $stmt = $db->prepare('INSERT INTO waitlist_entries (email, ip_address) VALUES (?, ?)');
        $stmt->execute([$email, $ip]);

        $count = (int) $db->query('SELECT COUNT(*) FROM waitlist_entries')->fetchColumn();
        echo json_encode(['success' => true, 'count' => $count]);
    } catch (PDOException $e) {
        if (str_contains($e->getMessage(), 'UNIQUE')) {
            echo json_encode(['success' => false, 'message' => 'This email is already on the waitlist! 🙏']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again.']);
        }
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);
