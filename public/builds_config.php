<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

// Match the simple demo password used on the client.
define('ADMIN_PASSWORD', 'langisoptik315');

$rootDir = __DIR__;
$dataFile = $rootDir . '/data/builds.json';
$categoriesFile = $rootDir . '/data/categories.json';

function load_builds($file)
{
    if (!file_exists($file)) {
        return [];
    }

    $json = file_get_contents($file);
    $data = json_decode($json, true);

    return is_array($data) ? $data : [];
}

function save_builds($file, $data)
{
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    return file_put_contents($file, $json . PHP_EOL) !== false;
}

function load_categories($file)
{
    if (!file_exists($file)) {
        return [];
    }

    $json = file_get_contents($file);
    $data = json_decode($json, true);

    return is_array($data) ? $data : [];
}

function save_categories($file, $data)
{
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    return file_put_contents($file, $json . PHP_EOL) !== false;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $password = $_POST['password'] ?? '';
    if ($password === ADMIN_PASSWORD) {
        $_SESSION['admin_authenticated'] = true;
        echo json_encode(['success' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Incorrect password']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout'])) {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $isAdmin = isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true;
    echo json_encode([
        'isAdmin' => $isAdmin,
        'builds' => load_builds($dataFile),
        'categories' => load_categories($categoriesFile),
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $isAdmin = isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true;
    if (!$isAdmin) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden']);
        exit;
    }

    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Payload must be a JSON array']);
        exit;
    }

    // Check if this is a categories update (array of strings)
    $isCategoriesUpdate = !empty($payload) && is_string($payload[0]);
    
    if ($isCategoriesUpdate) {
        if (!save_categories($categoriesFile, $payload)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save categories']);
            exit;
        }
    } else {
        // This is a builds update (array of build objects)
        if (!save_builds($dataFile, $payload)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save builds']);
            exit;
        }
    }

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
