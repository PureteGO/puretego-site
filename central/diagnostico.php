<?php
/**
 * FOSSBilling Setup Script - PureteGO
 * Configura produtos, moedas e métodos de pagamento
 * DELETE AFTER USE: rm central/setup-puretego.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/bb-config.php';

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "<h1>⚙️ FOSSBilling - PureteGO Setup</h1>";
    
    // 1. Configurar moedas
    echo "<h2>💰 Moedas</h2>";
    $stmt = $pdo->query("SELECT * FROM currency");
    echo "<pre>"; print_r($stmt->fetchAll(PDO::FETCH_ASSOC)); echo "</pre>";
    
    // 2. Configurar métodos de pagamento
    echo "<h2>💳 Métodos de Pagamento</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE '%pay_gateway%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tabelas de pagamento: " . implode(', ', $tables) . "<br>";
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT * FROM $table LIMIT 5");
        echo "<h3>$table</h3><pre>";
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
        echo "</pre>";
    }
    
    // 3. Listar produtos
    echo "<h2>📦 Produtos</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE '%product%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tabelas de produto: " . implode(', ', $tables) . "<br>";
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT * FROM $table LIMIT 10");
        echo "<h3>$table</h3><pre>";
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
        echo "</pre>";
    }
    
    // 4. Listar categorias de produto
    echo "<h2>📁 Categorias de Produto</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE '%product_category%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT * FROM $table LIMIT 10");
        echo "<h3>$table</h3><pre>";
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
        echo "</pre>";
    }
    
    // 5. Ver orders/invoices
    echo "<h2>📄 Orders</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE '%order%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tabelas de order: " . implode(', ', $tables) . "<br>";
    
    // 6. Ver configurações gerais
    echo "<h2>⚙️ Configurações</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE '%param%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT * FROM $table LIMIT 20");
        echo "<h3>$table</h3><pre>";
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
        echo "</pre>";
    }
    
    // 7. Extensions / Modules ativos
    echo "<h2>🧩 Módulos</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE '%extension%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT * FROM $table LIMIT 20");
        echo "<h3>$table</h3><pre>";
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
        echo "</pre>";
    }
    
    echo "<hr><p style='color:green'>✅ Diagnóstico completo!</p>";
    
} catch (Exception $e) {
    die("<p style='color:red'>❌ Erro: " . $e->getMessage() . "</p>");
}
