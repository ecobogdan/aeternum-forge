<?php
session_start();

// Always return JSON so browsers render it with a JSON viewer
header('Content-Type: application/json; charset=utf-8');

define('ADMIN_PASSWORD', 'langisoptik315');
$configFile = 'dropdowns.json';

// Admin login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if ($_POST['password'] === ADMIN_PASSWORD) {
        $_SESSION['admin'] = true;
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Wrong password']);
    }
    exit;
}

// Admin logout
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout'])) {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

// GET config: If in admin mode, return admin status; otherwise, just config
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $isAdmin = isset($_SESSION['admin']) && $_SESSION['admin'] === true;
    $config = file_exists($configFile) ? json_decode(file_get_contents($configFile), true) : [];
    echo json_encode(['isAdmin' => $isAdmin, 'config' => $config]);
    exit;
}

// POST config: Only allow if admin
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['login']) && !isset($_POST['logout'])) {
    if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden']);
        exit;
    }
    $json = file_get_contents('php://input');
    file_put_contents($configFile, $json);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(403);
echo json_encode(['success' => false, 'error' => 'Forbidden']);
