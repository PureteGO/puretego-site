<?php
/**
 * PureteGO - Sistema de Envio via SMTP (PHPMailer)
 * Mais seguro, mais rápido e evita o SPAM.
 */

// 1. Incluir os arquivos do PHPMailer
// Usando __DIR__ para garantir caminhos absolutos corretos independente de onde o script é chamado
require __DIR__ . '/libs/PHPMailer/Exception.php';
require __DIR__ . '/libs/PHPMailer/PHPMailer.php';
require __DIR__ . '/libs/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // --- VERIFICAÇÃO RECAPTCHA ---
    $recaptcha_secret = '6Le_aFssAAAAAMaIJMy1nKrYp6sGqDyczvC0TgrA'; // Secret Key fornecida
    $recaptcha_response = isset($_POST['g-recaptcha-response']) ? $_POST['g-recaptcha-response'] : null;

    // Solo verificar si se envió el token (para evitar bloqueo total si el JS falla en cargar, aunque es recomendado forzarlo)
    if ($recaptcha_response) {
        $verify_url = "https://www.google.com/recaptcha/api/siteverify";
        $data = [
            'secret' => $recaptcha_secret,
            'response' => $recaptcha_response,
            'remoteip' => $_SERVER['REMOTE_ADDR']
        ];
        
        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($data)
            ]
        ];
        
        $context = stream_context_create($options);
        $verify_result = file_get_contents($verify_url, false, $context);
        $json_result = json_decode($verify_result);
        
        if (!$json_result->success) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Falha na verificação de robô (reCAPTCHA)."]);
            exit;
        }
    }

    $mail = new PHPMailer(true);

    try {
        // --- CONFIGURAÇÃO DO SERVIDOR SMTP ---
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;         // Debug (desativado em produção)
        $mail->isSMTP();
        $mail->Host       = 'mail.puretego.online';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'leads@puretego.online';
        $mail->Password   = 'Mel_170803$';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        $mail->CharSet    = 'UTF-8';

        // --- DESTINATÁRIOS ---
        // Quem envia (deve ser o mesmo do Username para evitar bloqueios)
        $mail->setFrom('leads@puretego.online', 'PureteGO - Leads');
        
        // Quem recebe (o admin do site)
        $mail->addAddress('puretegoonline@gmail.com');
        $mail->addBCC('contacto@puretego.online'); // Cópia oculta para backup
        
        // Responder para (o cliente)
        $email_cliente = isset($_POST['email']) ? filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) : '';
        if ($email_cliente && filter_var($email_cliente, FILTER_VALIDATE_EMAIL)) {
            $mail->addReplyTo($email_cliente);
        }

        // --- CONTEÚDO DO E-MAIL ---
        $tipo_form = isset($_POST['form_type']) ? strip_tags($_POST['form_type']) : 'Contacto General';
        $empresa = isset($_POST['empresa']) ? strip_tags($_POST['empresa']) : 'N/A';
        $nombre = isset($_POST['nombre']) ? strip_tags($_POST['nombre']) : 'N/A';
        
        $mail->isHTML(true);
        $mail->Subject = "[Novo Lead] $tipo_form - $empresa ($nombre)";

        // Montando o corpo do e-mail
        $body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;'>";
        $body .= "<div style='background-color: #00c896; color: white; padding: 20px; text-align: center;'>";
        $body .= "<h2 style='margin:0;'>Novo Lead Capturado</h2>";
        $body .= "<p style='margin:5px 0 0 0;'>PureteGO Website</p>";
        $body .= "</div>";
        
        $body .= "<div style='padding: 20px; background-color: #ffffff;'>";
        $body .= "<p style='font-size: 16px; color: #333;'><strong>Solução de Interesse:</strong> <span style='color: #00c896;'>" . strtoupper($tipo_form) . "</span></p>";
        $body .= "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>";
        
        $body .= "<table style='width: 100%; border-collapse: collapse;'>";
        foreach ($_POST as $key => $value) {
            if ($key != 'form_type' && $value != '') {
                $label = ucfirst(str_replace('_', ' ', $key));
                $clean_value = nl2br(strip_tags($value));
                $body .= "<tr>";
                $body .= "<td style='padding: 10px 0; width: 40%; color: #666; font-weight: bold; border-bottom: 1px solid #f5f5f5;'>$label</td>";
                $body .= "<td style='padding: 10px 0; width: 60%; color: #333; border-bottom: 1px solid #f5f5f5;'>$clean_value</td>";
                $body .= "</tr>";
            }
        }
        $body .= "</table>";
        $body .= "</div>";
        
        $body .= "<div style='background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;'>";
        $body .= "Enviado de forma segura via servidor PureteGO • " . date('d/m/Y H:i');
        $body .= "</div>";
        $body .= "</div>";

        $mail->Body = $body;
        // Plain text version for non-HTML clients
        $mail->AltBody = "Novo Lead: $tipo_form\nEmpresa: $empresa\n\n(Veja a versão HTML para detalhes)";

        $mail->send();
        
        // Retorno JSON Sucesso
        echo json_encode(["status" => "success", "message" => "Mensagem enviada com sucesso!", "redirect" => true]);

    } catch (Exception $e) {
        // Retorno JSON Erro
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Erro técnico no envio: " . $mail->ErrorInfo]);
    }
} else {
    // Acesso direto negado
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Acesso negado"]);
}
?>
