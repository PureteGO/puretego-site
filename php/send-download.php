<?php
/**
 * PureteGO - Registro de Descarga de Informe
 * Envía los datos del lead a contacto@puretego.online
 */

require __DIR__ . '/libs/PHPMailer/Exception.php';
require __DIR__ . '/libs/PHPMailer/PHPMailer.php';
require __DIR__ . '/libs/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $nombre = isset($_POST['nombre']) ? strip_tags(trim($_POST['nombre'])) : 'N/A';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : 'N/A';
    $whatsapp = isset($_POST['whatsapp']) ? strip_tags(trim($_POST['whatsapp'])) : 'N/A';
    $reporte = isset($_POST['reporte']) ? strip_tags(trim($_POST['reporte'])) : 'N/A';

    if (empty($nombre) || empty($email) || empty($whatsapp) || $nombre === 'N/A' || $email === 'N/A' || $whatsapp === 'N/A') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Todos los campos obligatorios deben estar completos."]);
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // --- CONFIGURAÇÃO DO SERVIDOR SMTP ---
        $mail->isSMTP();
        $mail->Host       = 'mail.puretego.online';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'leads@puretego.online';
        $mail->Password   = 'Mel_170803$';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        $mail->CharSet    = 'UTF-8';

        // --- DESTINATÁRIOS ---
        $mail->setFrom('leads@puretego.online', 'PureteGO - Leads');
        $mail->addAddress('contacto@puretego.online');
        
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $mail->addReplyTo($email);
        }

        // --- CONTEÚDO DO E-MAIL ---
        $mail->isHTML(true);
        $mail->Subject = 'Novo Download de artigos do Blog PureteGO.Online';

        // Montando o corpo do e-mail
        $body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;'>";
        $body .= "<div style='background-color: #01a7ee; color: white; padding: 20px; text-align: center;'>";
        $body .= "<h2 style='margin:0;'>Novo Registro de Descarga</h2>";
        $body .= "<p style='margin:5px 0 0 0;'>Blog PureteGO.Online</p>";
        $body .= "</div>";
        
        $body .= "<div style='padding: 20px; background-color: #ffffff;'>";
        $body .= "<p style='font-size: 16px; color: #333;'>Un usuario ha solicitado la descarga de un informe del blog.</p>";
        $body .= "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>";
        
        $body .= "<table style='width: 100%; border-collapse: collapse;'>";
        $body .= "<tr><td style='padding: 10px 0; width: 40%; color: #666; font-weight: bold; border-bottom: 1px solid #f5f5f5;'>Nombre</td><td style='padding: 10px 0; width: 60%; color: #333; border-bottom: 1px solid #f5f5f5;'>$nombre</td></tr>";
        $body .= "<tr><td style='padding: 10px 0; width: 40%; color: #666; font-weight: bold; border-bottom: 1px solid #f5f5f5;'>Email</td><td style='padding: 10px 0; width: 60%; color: #333; border-bottom: 1px solid #f5f5f5;'>$email</td></tr>";
        $body .= "<tr><td style='padding: 10px 0; width: 40%; color: #666; font-weight: bold; border-bottom: 1px solid #f5f5f5;'>WhatsApp</td><td style='padding: 10px 0; width: 60%; color: #333; border-bottom: 1px solid #f5f5f5;'>$whatsapp</td></tr>";
        $body .= "<tr><td style='padding: 10px 0; width: 40%; color: #666; font-weight: bold; border-bottom: 1px solid #f5f5f5;'>Informe Solicitado</td><td style='padding: 10px 0; width: 60%; color: #333; border-bottom: 1px solid #f5f5f5;'>$reporte</td></tr>";
        $body .= "</table>";
        $body .= "</div>";
        
        $body .= "<div style='background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;'>";
        $body .= "Enviado de forma segura via servidor PureteGO • " . date('d/m/Y H:i');
        $body .= "</div>";
        $body .= "</div>";

        $mail->Body = $body;
        $mail->AltBody = "Novo Download de artigos do Blog PureteGO.Online\n\nNombre: $nombre\nEmail: $email\nWhatsApp: $whatsapp\nInforme: $reporte";

        $mail->send();
        
        echo json_encode(["status" => "success", "message" => "Registro exitoso."]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error al enviar registro: " . $mail->ErrorInfo]);
    }
} else {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Acceso denegado"]);
}
?>
