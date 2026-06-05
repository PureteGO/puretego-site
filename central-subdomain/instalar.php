<?php
/**
 * Configurador FOSSBilling - PureteGO
 * Acesse: https://central.puretego.online/instalar.php
 * DEPOIS DELETE ESTE ARQUIVO!
 */

define('FOSS_ROOT', __DIR__);
require_once FOSS_ROOT . '/src/bootstrap.php';

$di = include FOSS_ROOT . '/di.php';

echo "<!DOCTYPE html><html lang='pt'><head>";
echo "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>";
echo "<title>Configurador PureteGO</title>";
echo "<style>body{font-family:sans-serif;background:#1a1a2e;color:#eee;padding:20px;max-width:800px;margin:auto}";
echo "h1{color:#00d4aa}h2{color:#e94560}.ok{color:#00d4aa;padding:4px 0}.erro{color:#e94560;padding:4px 0}.info{color:#ffd700;padding:4px 0}";
echo "pre{background:#16213e;padding:10px;border-radius:8px;overflow-x:auto}";
echo "button{background:#0f3460;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;margin:5px}";
echo "button:hover{background:#e94560}.card{background:#16213e;padding:15px;border-radius:8px;margin:10px 0}</style></head><body>";
echo "<h1>🔧 Configurador FOSSBilling - PureteGO</h1>";

try {
    $pdo = $di['pdo'];
    
    // 1. CONFIG EMPRESA
    echo "<div class='card'><h2>🏢 Configurações da Empresa</h2>";
    
    $company = [
        'company_name' => 'PureteGO.Online - Digital Solutions',
        'company_email' => 'puretegoonline@gmail.com',
        'company_tel' => '+595 981 457890',
        'company_address' => 'Asunción, Paraguay',
        'company_number' => '80045073-1',
        'company_vat' => '80045073-1',
        'currency' => 'PYG',
        'default_currency' => 'PYG',
        'locale' => 'pt_BR',
        'timezone' => 'America/Asuncion',
    ];
    
    foreach ($company as $key => $val) {
        $pdo->exec("REPLACE INTO setting (param, value) VALUES (" . $pdo->quote($key) . ", " . $pdo->quote($val) . ")");
    }
    echo "<p class='ok'>✅ Empresa configurada: PureteGO.Online (PYG, America/Asuncion)</p></div>";
    
    // 2. ADMIN
    echo "<div class='card'><h2>👤 Admin</h2>";
    $adminExists = $pdo->query("SELECT id FROM admin WHERE email='janae@puretego.online'")->fetch();
    if (!$adminExists) {
        $pdo->exec("INSERT INTO admin (role, name, email, pass, status, created_at, updated_at) VALUES (
            'admin', 'Janaê Pereira', 'janae@puretego.online', 
            '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            1, NOW(), NOW()
        )");
        echo "<p class='ok'>✅ Admin criado: janae@puretego.online / MeLu_1723\$</p>";
    } else {
        $pdo->exec("UPDATE admin SET pass='\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email='janae@puretego.online'");
        echo "<p class='ok'>✅ Senha resetada: janae@puretego.online / MeLu_1723\$</p>";
    }
    echo "<p class='info'>⚠️ Troque a senha depois de acessar!</p></div>";
    
    // 3. PRODUTOS
    echo "<div class='card'><h2>📦 Produtos</h2>";
    
    $produtos = [
        ['name' => 'Site Institucional', 'slug' => 'site-institucional', 'price' => 2900000, 'desc' => 'Site profissional com até 5 páginas, responsivo, SEO básico e formulário de contato.'],
        ['name' => 'Site c/ IA + SEO Local', 'slug' => 'site-ia-seo', 'price' => 684000, 'desc' => 'Site com inteligência artificial, SEO local avançado, GMB premium.'],
        ['name' => 'E-commerce Completo', 'slug' => 'ecommerce', 'price' => 5490000, 'desc' => 'Loja virtual completa WooCommerce, pagamentos, frete.'],
        ['name' => 'Landing Page', 'slug' => 'landing-page', 'price' => 1200000, 'desc' => 'Página única de alta conversão para campanhas.'],
        ['name' => 'Tour Virtual 360°', 'slug' => 'tour-virtual', 'price' => 1200000, 'desc' => 'Tour virtual imersivo 360° para Google Maps e site.'],
        ['name' => 'SEO Local + GMB', 'slug' => 'seo-local-gmb', 'price' => 790000, 'desc' => 'Otimização Google Meu Negócio e buscas locais.'],
        ['name' => 'Hospedagem Premium (anual)', 'slug' => 'hospedagem', 'price' => 960000, 'desc' => 'Hospedagem otimizada com SSL, CDN, backup diário.'],
        ['name' => 'Gestão de Redes Sociais (mês)', 'slug' => 'social-media', 'price' => 1800000, 'desc' => 'Gestão mensal com conteúdo estratégico e métricas.'],
        ['name' => 'Consultoria Digital', 'slug' => 'consultoria', 'price' => 2500000, 'desc' => 'Consultoria personalizada para transformação digital.'],
    ];
    
    // Verificar tabela de produtos
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('product', $tables)) {
        $cols = $pdo->query("SHOW COLUMNS FROM product")->fetchAll(PDO::FETCH_COLUMN);
        
        // Adaptar INSERT conforme colunas
        $hasDescription = in_array('description', $cols);
        $hasCurrency = in_array('currency', $cols);
        
        foreach ($produtos as $p) {
            $exists = $pdo->query("SELECT id FROM product WHERE slug=" . $pdo->quote($p['slug']))->fetch();
            if (!$exists) {
                $cols_insert = 'name, slug, price, status, created_at, updated_at';
                $vals = $pdo->quote($p['name']) . ", " . $pdo->quote($p['slug']) . ", " . $p['price'] . ", 1, NOW(), NOW()";
                if ($hasDescription) { $cols_insert .= ', description'; $vals .= ', ' . $pdo->quote($p['desc']); }
                if ($hasCurrency) { $cols_insert .= ', currency'; $vals .= ", 'PYG'"; }
                $pdo->exec("INSERT INTO product ($cols_insert) VALUES ($vals)");
                echo "<p class='ok'>✅ {$p['name']} — Gs " . number_format($p['price'], 0, ',', '.') . "</p>";
            } else {
                echo "<p class='info'>ℹ️ Já existe: {$p['name']}</p>";
            }
        }
    } else {
        echo "<p class='erro'>❌ Tabela 'product' não encontrada. Tabelas: " . implode(', ', $tables) . "</p>";
    }
    echo "</div>";
    
    // 4. PÁGINAS
    echo "<div class='card'><h2>📄 Páginas CMS</h2>";
    
    if (in_array('page', $tables)) {
        $paginas = [
            ['title' => 'Contrate', 'slug' => 'contrate', 'content' => '<h1>Contrate Nossos Serviços</h1><p>Solicite um orçamento personalizado. WhatsApp: +595 981 457890 | Email: puretegoonline@gmail.com</p>'],
            ['title' => 'FAQ', 'slug' => 'faq', 'content' => '<h1>FAQ</h1><h2>Prazos?</h2><p>5-15 dias úteis conforme complexidade.</p><h2>Contrato?</h2><p>Sim, todos os serviços têm contrato digital.</p><h2>Pagamentos?</h2><p>Transferência, Pix (BRL) ou depósito PY.</p>'],
            ['title' => 'Suporte', 'slug' => 'suporte', 'content' => '<h1>Suporte</h1><p>Seg-Sex 08:00-18:00 (Asunción). WhatsApp: +595 981 457890</p>'],
        ];
        
        foreach ($paginas as $pg) {
            $exists = $pdo->query("SELECT id FROM page WHERE slug=" . $pdo->quote($pg['slug']))->fetch();
            if (!$exists) {
                $pdo->exec("INSERT INTO page (title, slug, content, status, created_at, updated_at) VALUES (
                    " . $pdo->quote($pg['title']) . ",
                    " . $pdo->quote($pg['slug']) . ",
                    " . $pdo->quote($pg['content']) . ",
                    1, NOW(), NOW()
                )");
                echo "<p class='ok'>✅ Página: {$pg['title']}</p>";
            } else {
                echo "<p class='info'>ℹ️ Página já existe: {$pg['title']}</p>";
            }
        }
    } else {
        echo "<p class='info'>ℹ️ Tabela 'page' não encontrada</p>";
    }
    echo "</div>";
    
    // 5. RESUMO FINAL
    echo "<div class='card' style='border:2px solid #e94560'><h2>✅ Concluído!</h2>";
    echo "<p><strong>Admin:</strong> <a href='/admin' style='color:#00d4aa'>/admin</a></p>";
    echo "<p><strong>Email:</strong> janae@puretego.online</p>";
    echo "<p><strong>Senha:</strong> MeLu_1723\$</p>";
    echo "<p class='erro' style='font-size:18px'>⚠️ DELETE ESTE ARQUIVO AGORA!</p>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div class='card'><h2 class='erro'>❌ Erro</h2><pre>" . $e->getMessage() . "</pre></div>";
}

echo "</body></html>";
