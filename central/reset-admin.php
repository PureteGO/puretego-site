<?php
/**
 * TEMPORARY: Reset FOSSBilling admin password
 * DELETE AFTER USE!
 */

// Try to find bb-config.php
$possiblePaths = [
    __DIR__ . '/bb-config.php',
    dirname(__DIR__) . '/bb-config.php',
    __DIR__ . '/../bb-config.php',
];

$configPath = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $configPath = $path;
        break;
    }
}

if (!$configPath) {
    die("bb-config.php not found. Searched: " . implode(', ', $possiblePaths));
}

require_once $configPath;

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Get the admin email
    $email = isset($_GET['email']) ? $_GET['email'] : 'puretego@gmail.com';
    $password = isset($_GET['password']) ? $_GET['password'] : 'PureteGO2024!';

    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id, email, name FROM admin WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin) {
        // Update password
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("UPDATE admin SET pass = ? WHERE email = ?");
        $stmt->execute([$hash, $email]);

        // Also update any salt-based password if old schema
        $salt = substr(md5(uniqid()), 0, 8);
        $oldHash = sha1($salt . sha1($salt . sha1($password)));
        $stmt = $pdo->prepare("UPDATE admin SET pass = ?, salt = ? WHERE email = ?");
        $stmt->execute([$oldHash, $salt, $email]);

        echo "✅ Senha atualizada para admin: <b>" . htmlspecialchars($email) . "</b><br>";
        echo "Nova senha: <b>" . htmlspecialchars($password) . "</b><br>";
        echo '<a href="/admin">Ir para login →</a>';
    } else {
        // Create new admin
        $salt = substr(md5(uniqid()), 0, 8);
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $oldHash = sha1($salt . sha1($salt . sha1($password)));
        
        $stmt = $pdo->prepare("INSERT INTO admin (role, name, email, pass, salt, created_at, updated_at) VALUES ('admin', 'Janaê Pereira', ?, ?, ?, NOW(), NOW())");
        $stmt->execute([$email, $oldHash, $salt]);
        
        echo "✅ Admin criado: <b>" . htmlspecialchars($email) . "</b><br>";
        echo "Nova senha: <b>" . htmlspecialchars($password) . "</b><br>";
        echo '<a href="/admin">Ir para login →</a>';
    }

    // Show all admins
    echo "<br><br><b>Admins registrados:</b><br>";
    $stmt = $pdo->query("SELECT id, email, name, role FROM admin");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: {$row['id']} | {$row['name']} | {$row['email']} | Role: {$row['role']}<br>";
    }

} catch (Exception $e) {
    die("Erro: " . $e->getMessage());
}

// IMPORTANT: Delete this file after use!
echo '<br><br><b style="color:red">⚠ DELETE THIS FILE AFTER USE!</b>';
echo '<br><form method="post"><button type="submit" name="self_delete" style="background:red;color:white;padding:10px;border:none;cursor:pointer;">🗑 DELETE THIS FILE</button></form>';

if (isset($_POST['self_delete'])) {
    unlink(__FILE__);
    echo "<br>✅ Arquivo deletado!";
}
