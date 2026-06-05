<?php
/**
 * FOSSBilling - Configuração Completa PureteGO
 * 
 * INSTRUÇÕES:
 * 1. Acesse: https://central.puretego.online/setup-puretego.php
 * 2. Preencha os campos e clique em "Executar"
 * 3. DELETE O ARQUIVO: rm central/setup-puretego.php (via FTP/cPanel)
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

// Verificar se é POST
$action = $_POST['action'] ?? '';

?><!DOCTYPE html>
<html lang="pt-BR" data-bs-theme="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PureteGO - Configurar FOSSBilling</title>
    <link rel="stylesheet" href="/themes/huraga/build/css/huraga-bundle.c8d5ac.css">
    <style>
        body { padding: 20px; max-width: 800px; margin: 0 auto; }
        .card { margin-bottom: 20px; }
        .success { color: #2fb344; }
        .error { color: #d63939; }
        pre { background: #1b1e24; padding: 15px; border-radius: 8px; overflow-x: auto; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="text-center mb-4">
        <img src="https://www.puretego.online/img/logo.png" style="height: 50px;" alt="PureteGO">
        <h2 class="mt-2">⚙️ Configurar FOSSBilling</h2>
    </div>

<?php
if ($action === 'diagnostic') {
    echo "<div class='card card-md'><div class='card-body'>";
    echo "<h3>🔍 Diagnóstico do Sistema</h3><pre>";
    
    require_once __DIR__ . '/bb-config.php';
    
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "=== MOEDAS ===\n";
    $stmt = $pdo->query("SELECT * FROM currency");
    foreach ($stmt as $row) print_r($row);
    
    echo "\n=== PRODUTOS ===\n";
    $stmt = $pdo->query("SELECT * FROM product LIMIT 20");
    foreach ($stmt as $row) print_r($row);
    
    echo "\n=== CATEGORIAS ===\n";
    $stmt = $pdo->query("SELECT * FROM product_category LIMIT 10");
    foreach ($stmt as $row) print_r($row);
    
    echo "\n=== CONFIG ===\n";
    $stmt = $pdo->query("SELECT * FROM extension_meta WHERE extension = 'mod_system' LIMIT 20");
    foreach ($stmt as $row) print_r($row);
    
    echo "\n=== GATEWAYS ===\n";
    $stmt = $pdo->query("SELECT * FROM pay_gateway LIMIT 10");
    foreach ($stmt as $row) print_r($row);
    
    echo "\n=== CLIENTES ===\n";
    $stmt = $pdo->query("SELECT id, email, first_name, last_name, created_at FROM client ORDER BY id DESC LIMIT 10");
    foreach ($stmt as $row) print_r($row);
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM client");
    echo "\nTotal clientes: " . $stmt->fetch()['total'] . "\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM product");
    echo "Total produtos: " . $stmt->fetch()['total'] . "\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM `order`");
    echo "Total pedidos: " . $stmt->fetch()['total'] . "\n";
    
    echo "</pre></div></div>";

} elseif ($action === 'create_admin') {
    echo "<div class='card card-md'><div class='card-body'>";
    echo "<h3>👤 Criar Admin</h3><pre>";
    
    require_once __DIR__ . '/bb-config.php';
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    $email = $_POST['email'] ?? 'janae@puretego.online';
    $password = $_POST['password'] ?? 'MeLu_1723$';
    $name = $_POST['name'] ?? 'Janaê Pereira';
    
    $stmt = $pdo->prepare("SELECT id FROM admin WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($row = $stmt->fetch()) {
        // Update
        $salt = substr(md5(uniqid()), 0, 8);
        $hash = sha1($salt . sha1($salt . sha1($password)));
        $pdo->prepare("UPDATE admin SET pass = ?, salt = ?, name = ? WHERE id = ?")
            ->execute([$hash, $salt, $name, $row['id']]);
        echo "✅ Admin ATUALIZADO: $email\n";
    } else {
        // Create
        $salt = substr(md5(uniqid()), 0, 8);
        $hash = sha1($salt . sha1($salt . sha1($password)));
        $pdo->prepare("INSERT INTO admin (role, name, email, pass, salt, created_at, updated_at) VALUES ('admin', ?, ?, ?, ?, NOW(), NOW())")
            ->execute([$name, $email, $hash, $salt]);
        echo "✅ Admin CRIADO: $email\n";
    }
    echo "Senha: $password\n";
    echo "\nLogin: https://central.puretego.online/admin\n";
    echo "</pre></div></div>";

} elseif ($action === 'setup_products') {
    echo "<div class='card card-md'><div class='card-body'>";
    echo "<h3>📦 Criar Produtos</h3><pre>";
    
    require_once __DIR__ . '/bb-config.php';
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // Pegar a moeda PYG padrão
    $stmt = $pdo->query("SELECT id, code FROM currency WHERE code = 'PYG'");
    $currency = $stmt->fetch();
    $currency_id = $currency ? $currency['id'] : 1;
    
    // Produtos do catálogo PureteGO
    $products = [
        ['Site Institucional c/ IA', 'Site profissional com inteligência artificial integrada', 3500000, 'monthly'],
        ['Landing Page', 'Página de captura profissional', 1200000, 'monthly'],
        ['SEO Local Premium', 'Otimização para busca local Google', 1500000, 'monthly'],
        ['Gestão de Redes Sociais', 'Posts + stories + engajamento', 1800000, 'monthly'],
        ['Google Meu Negócio Premium', 'Gestão completa do perfil GMB', 800000, 'monthly'],
        ['Tour Virtual 360°', 'Tour virtual interativo', 1200000, 'one_time'],
        ['Presença Digital', 'Site + SEO + GMB + Redes', 5000000, 'monthly'],
        ['Hospedagem Site', 'Hospedagem com SSL incluso', 300000, 'monthly'],
        ['Email Corporativo', '5 contas email profissionais', 200000, 'monthly'],
    ];
    
    foreach ($products as $p) {
        $stmt = $pdo->prepare("SELECT id FROM product WHERE title = ?");
        $stmt->execute([$p[0]]);
        
        if (!$stmt->fetch()) {
            $pdo->prepare("INSERT INTO product (product_category_id, title, description, pricing, status, created_at, updated_at) VALUES (1, ?, ?, ?, 'active', NOW(), NOW())")
                ->execute([$p[0], $p[1], json_encode([
                    $p[2] => ['price' => $p[2], 'setup' => 0, 'currency_id' => $currency_id],
                    'w' => ['price' => $p[2], 'setup' => 0, 'currency_id' => $currency_id],
                ])]);
            echo "✅ Criado: {$p[0]} ({$p[2]} Gs/{$p[3]})\n";
        } else {
            echo "⏩ Já existe: {$p[0]}\n";
        }
    }
    
    echo "\nTotal produtos configurados.\n";
    echo "</pre></div></div>";

} elseif ($action === 'setup_company') {
    echo "<div class='card card-md'><div class='card-body'>";
    echo "<h3>🏢 Configurar Empresa</h3><pre>";
    
    require_once __DIR__ . '/bb-config.php';
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    $company_name = $_POST['company_name'] ?? 'PureteGO.Online';
    $company_email = $_POST['company_email'] ?? 'puretego@gmail.com';
    $company_tel = $_POST['company_tel'] ?? '+595 981 603 507';
    $company_address = $_POST['company_address'] ?? 'Asunción, Paraguay';
    
    // Atualizar nas configurações
    $settings = [
        'company_name' => $company_name,
        'company_email' => $company_email,
        'company_tel' => $company_tel,
        'company_address' => $company_address,
        'company_logo' => 'https://www.puretego.online/img/logo.png',
        'company_signature' => "Atenciosamente,\nEquipe $company_name",
        'funds_min_amount' => '50000',
        'funds_max_amount' => '10000000',
        'invoice_series' => '001-001',
        'invoice_due_days' => '15',
        'invoice_reminder_days' => '3',
        'automatic_invoice' => '1',
        'main_currency' => 'PYG',
        'default_currency' => 'PYG',
    ];
    
    // Verificar tabela de params
    $stmt = $pdo->query("SHOW TABLES LIKE '%param%'");
    $param_table = $stmt->fetchColumn();
    
    if ($param_table) {
        foreach ($settings as $key => $value) {
            $stmt = $pdo->prepare("SELECT id FROM $param_table WHERE param = ?");
            $stmt->execute([$key]);
            if ($stmt->fetch()) {
                $pdo->prepare("UPDATE $param_table SET value = ? WHERE param = ?")->execute([$value, $key]);
            } else {
                $pdo->prepare("INSERT INTO $param_table (param, value) VALUES (?, ?)")->execute([$key, $value]);
            }
        }
        echo "✅ Configurações salvas!\n";
    }
    
    echo "Empresa: $company_name\n";
    echo "Email: $company_email\n";
    echo "Telefone: $company_tel\n";
    
    echo "</pre></div></div>";

} elseif ($action === 'self_delete') {
    unlink(__FILE__);
    echo "<div class='card card-md'><div class='card-body'><h3>🗑️ Arquivo deletado!</h3>
    <p class='success'>O arquivo setup-puretego.php foi removido do servidor.</p>
    <a href='/admin' class='btn btn-primary'>Ir para Admin →</a>
    </div></div>";

} elseif ($action === 'create_page') {
    echo "<div class='card card-md'><div class='card-body'>";
    echo "<h3>📄 Criar Páginas</h3><pre>";
    
    require_once __DIR__ . '/bb-config.php';
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // Criar páginas do sistema
    $pages = [
        ['Contrate', 'Contrate nossos serviços', 'order', 1],
        ['Meus Pedidos', 'Acompanhe seus pedidos', 'order/service', 2],
        ['Suporte', 'Central de suporte', 'support', 3],
        ['FAQ', 'Perguntas frequentes', 'faq', 4],
    ];
    
    $stmt = $pdo->query("SHOW TABLES LIKE '%page%'");
    $page_table = $stmt->fetchColumn();
    
    if ($page_table) {
        foreach ($pages as $p) {
            $stmt = $pdo->prepare("SELECT id FROM $page_table WHERE title = ?");
            $stmt->execute([$p[0]]);
            if (!$stmt->fetch()) {
                $pdo->prepare("INSERT INTO $page_table (title, content, slug, meta, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())")
                    ->execute([$p[0], $p[1], $p[2], json_encode(['order' => $p[3]])]);
                echo "✅ Página criada: {$p[0]}\n";
            }
        }
    }
    
    echo "</pre></div></div>";
}
?>

<!-- Menu Principal -->
<div class="card card-md">
    <div class="card-body">
        <h3>🚀 Configuração FOSSBilling - PureteGO</h3>
        <p>Use os botões abaixo para configurar o sistema passo a passo:</p>
        
        <form method="post" style="margin-bottom:10px">
            <input type="hidden" name="action" value="diagnostic">
            <button type="submit" class="btn btn-info w-100 mb-2">🔍 1. Diagnosticar Sistema</button>
        </form>
        
        <form method="post" style="margin-bottom:10px">
            <input type="hidden" name="action" value="create_admin">
            <button type="submit" class="btn btn-warning w-100 mb-2">👤 2. Resetar Admin (janae@puretego.online)</button>
        </form>
        
        <form method="post" style="margin-bottom:10px">
            <input type="hidden" name="action" value="setup_company">
            <input type="hidden" name="company_name" value="PureteGO.Online">
            <input type="hidden" name="company_email" value="puretego@gmail.com">
            <input type="hidden" name="company_tel" value="+595 981 603 507">
            <button type="submit" class="btn btn-primary w-100 mb-2">🏢 3. Configurar Empresa</button>
        </form>
        
        <form method="post" style="margin-bottom:10px">
            <input type="hidden" name="action" value="setup_products">
            <button type="submit" class="btn btn-success w-100 mb-2">📦 4. Criar Produtos do Catálogo</button>
        </form>
        
        <form method="post" style="margin-bottom:10px">
            <input type="hidden" name="action" value="create_page">
            <button type="submit" class="btn btn-secondary w-100 mb-2">📄 5. Criar Páginas</button>
        </form>
        
        <hr>
        
        <form method="post" onsubmit="return confirm('Deletar arquivo permanentemente?');">
            <input type="hidden" name="action" value="self_delete">
            <button type="submit" class="btn btn-danger w-100">🗑️ DELETAR ESTE ARQUIVO (segurança)</button>
        </form>
    </div>
</div>

<div class="card card-md">
    <div class="card-body">
        <h3>📖 Instruções</h3>
        <ol>
            <li>Clique em <strong>1. Diagnosticar Sistema</strong> — vê o que já existe</li>
            <li>Clique em <strong>2. Resetar Admin</strong> — garante acesso</li>
            <li>Clique em <strong>3. Configurar Empresa</strong> — dados da PureteGO</li>
            <li>Clique em <strong>4. Criar Produtos</strong> — catálogo de serviços</li>
            <li>Clique em <strong>5. Criar Páginas</strong> — páginas do sistema</li>
            <li>Depois de tudo pronto, <strong>DELETE O ARQUIVO</strong></li>
        </ol>
    </div>
</div>

</body>
</html>
