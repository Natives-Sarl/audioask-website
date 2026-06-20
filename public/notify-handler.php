<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://www.audioask.ai');
header('X-Content-Type-Options: nosniff');

function respond(bool $success, string $error = ''): never
{
    echo $success
        ? json_encode(['success' => true])
        : json_encode(['success' => false, 'error' => $error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Méthode non autorisée.');
}

$email = trim(strip_tags($_POST['email'] ?? ''));

if ($email === '') {
    respond(false, 'L\'adresse email est requise.');
}
if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    respond(false, 'L\'adresse email n\'est pas valide.');
}
if (mb_strlen($email, 'UTF-8') > 254) {
    respond(false, 'L\'adresse email est trop longue.');
}

$to      = 'hello@audioask.ai';
$subject = '=?UTF-8?B?' . base64_encode('Audioask App Mobile — Nouvelle inscription liste d\'attente') . '?=';
$body    = "Nouvelle inscription sur la liste d'attente de l'app mobile Audioask\n";
$body   .= str_repeat('-', 50) . "\n\n";
$body   .= "Email : {$email}\n";
$headers  = "From: noreply@audioask.ai\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$sent = mail($to, $subject, $body, $headers);

if (!$sent) {
    respond(false, 'L\'envoi a échoué côté serveur. Réessaie dans un instant.');
}

respond(true);
