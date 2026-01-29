<?php
/**
 * PureteGO - Sistema de Envio via SMTP (PHPMailer)
 * Mais seguro, mais rápido e evita o SPAM.
 */

// 1. Incluir os arquivos do PHPMailer (Você deve subir esses arquivos para uma pasta chamada 'libs/PHPMailer')
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'libs/PHPMailer/Exception.php';
require 'libs/PHPMailer/PHPMailer.php';
require 'libs/PHPMailer/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $mail = new PHPMailer(true);

    try {
        // --- CONFIGURAÇÃO DO SERVIDOR SMTP (Pegue esses dados no seu cPanel) ---
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;         // Ative para debugar se der erro
        $mail->isSMTP();
        $mail->Host       = 'mail.puretego.online';        // Endereço do servidor SMTP do cPanel
        $mail->SMTPAuth   = true;
        $mail->Username   = 'leads@puretego.online';       // Seu e-mail criado no cPanel
        $mail->Password   = 'Mel_170803$';              // Senha do seu e-mail do cPanel
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;   // TLS ou SSL (Porta 465 geralmente é SMTPS)
        $mail->Port       = 465;
        $mail->CharSet    = 'UTF-8';

        // --- DESTINATÁRIOS ---
        $mail->setFrom('leads@puretego.online', 'Sistema PureteGO');
        $mail->addAddress('puretegoonline@gmail.com');     // Onde você quer receber os leads
        
        $responder_para = isset($_POST['email']) ? $_POST['email'] : 'puretegoonline@gmail.com';
        $mail->addReplyTo($responder_para);

        // --- CONTEÚDO DO E-MAIL ---
        $tipo_form = isset($_POST['form_type']) ? $_POST['form_type'] : 'Contacto General';
        $empresa = strip_tags($_POST['empresa']);
        
        $mail->isHTML(true);
        $mail->Subject = "[PureteGO Lead] $tipo_form - $empresa";

        // Montando o corpo do e-mail em HTML elegante
        $body = "<h2>Nuevo Lead capturado desde el sitio web</h2>";
        $body .= "<p><strong>Tipo de Solicitud:</strong> " . strtoupper($tipo_form) . "</p>";
        $body .= "<hr>";
        $body .= "<ul>";
        foreach ($_POST as $key => $value) {
            if ($key != 'form_type' && $value != '') {
                $label = ucfirst(str_replace('_', ' ', $key));
                $body .= "<li><strong>$label:</strong> " . nl2br(strip_tags($value)) . "</li>";
            }
        }
        $body .= "</ul>";
        $body .= "<hr>";
        $body .= "<p><em>Enviado desde el servidor PureteGO el " . date('d/m/Y H:i') . "</em></p>";

        $mail->Body = $body;

        $mail->send();
        echo json_encode(["status" => "success", "message" => "Email enviado con éxito por SMTP"]);

    } catch (Exception $e) {
        header('HTTP/1.1 500 Error');
        echo json_encode(["status" => "error", "message" => "Erro ao enviar: {$mail->ErrorInfo}"]);
    }
} else {
    echo "Acesso negado.";
}
?>
