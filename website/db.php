<?php

require_once __DIR__ . '/config.php';

function getDb(): PDO
{
    $dir = dirname(DB_PATH);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $db = new PDO('sqlite:' . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $db->exec("
        CREATE TABLE IF NOT EXISTS waitlist_entries (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            email       TEXT    UNIQUE NOT NULL,
            ip_address  TEXT,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS page_visits (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address  TEXT,
            user_agent  TEXT,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    return $db;
}
