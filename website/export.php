<?php

session_start();
require_once __DIR__ . '/db.php';

if (empty($_SESSION['admin_ok'])) {
    header('Location: admin.php');
    exit;
}

$db   = getDb();
$rows = $db->query("SELECT email, ip_address, created_at FROM waitlist_entries ORDER BY created_at DESC")->fetchAll();

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="biblesnap-waitlist-' . date('Y-m-d') . '.csv"');

$out = fopen('php://output', 'w');
fputcsv($out, ['Email', 'IP Address', 'Joined At']);
foreach ($rows as $row) {
    fputcsv($out, [$row['email'], $row['ip_address'] ?? '', $row['created_at']]);
}
fclose($out);
