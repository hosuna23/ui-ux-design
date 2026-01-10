<?php
// send.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load PHPMailer (Composer)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
  require __DIR__ . '/vendor/autoload.php';
} else {
  // Fallback if you manually uploaded PHPMailer /src
  require __DIR__ . '/PHPMailer/src/PHPMailer.php';
  require __DIR__ . '/PHPMailer/src/SMTP.php';
  require __DIR__ . '/PHPMailer/src/Exception.php';
}

// ---- BASIC SPAM TRAP ----
if (!empty($_POST['website'])) { header('Location: thanks.html'); exit; }

// ---- INPUT ----
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');
if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400); echo 'Invalid form input.'; exit;
}

// ---- CHOOSE ONE PROVIDER ----
$PROVIDER = 'sendgrid'; // 'gmail' or 'sendgrid'

// (A) GMAIL — requires 2-Step Verification + App Password (16 chars)
$GMAIL_USER = 'yourgmail@gmail.com';
$GMAIL_APP_PASSWORD = 'xxxxxxxxxxxxxxxx'; // App Password, not your login

// (B) SENDGRID — verify a sender/domain and create API key with "Mail Send"
$SG_API_KEY = 'SG.xxxxx...'; // your SendGrid API key
$SG_FROM    = 'no-reply@yourdomain.com'; // must be a verified sender/domain

// ---- MAIL ----
$mail = new PHPMailer(true);
try {
  $mail->isSMTP();
  $mail->SMTPAuth   = true;
  $mail->CharSet    = 'UTF-8';
  $mail->isHTML(false);
  $mail->Timeout    = 15;

  if ($PROVIDER === 'gmail') {
    $mail->Host       = 'smtp.gmail.com';
    $mail->Port       = 587;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Username   = $GMAIL_USER;
    $mail->Password   = $GMAIL_APP_PASSWORD;

    // DMARC alignment: use the Gmail address as the From
    $mail->setFrom($GMAIL_USER, 'OSUNA Designs');
  } else {
    // SENDGRID
    $mail->Host       = 'smtp.sendgrid.net';
    $mail->Port       = 587;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Username   = 'apikey';
    $mail->Password   = $SG_API_KEY;

    // Must be a verified From in SendGrid (single sender or domain)
    $mail->setFrom($SG_FROM, 'OSUNA Designs');
  }

  // Recipient (you)
  $mail->addAddress('hosuna23@gmail.com', 'Hector Osuna');

  // Let replies go to the visitor
  $mail->addReplyTo($email, $name);

  $mail->Subject = 'New message from hectorosunadesign.com';
  $mail->Body = "Name: $name\nEmail: $email\n\nMessage:\n$message\n\n—\nIP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

  $mail->send();
  header('Location: thanks.html'); exit;

} catch (Exception $e) {
  http_response_code(500);
  echo 'Mailer Error: ' . $mail->ErrorInfo;
}
