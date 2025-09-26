<?php
// proxy.php - Simple proxy para solucionar problemas de CORS
if (isset($_GET['url'])) {
    $url = urldecode($_GET['url']);
    
    // Validar que la URL sea válida y segura
    if (filter_var($url, FILTER_VALIDATE_URL)) {
        // Configurar las cabeceras para permitir CORS
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET");
        
        // Obtener las cabeceras de la URL destino
        $headers = get_headers($url, 1);
        
        // Establecer las cabeceras apropiadas
        if (isset($headers['Content-Type'])) {
            header('Content-Type: ' . $headers['Content-Type']);
        }
        
        if (isset($headers['Content-Length'])) {
            header('Content-Length: ' . $headers['Content-Length']);
        }
        
        // Permitir que el video se busque (seek)
        header('Accept-Ranges: bytes');
        
        // Leer y enviar el contenido
        readfile($url);
        exit;
    }
}

// Si hay algún error, devolver un error 404
header("HTTP/1.0 404 Not Found");
echo "Archivo no encontrado";
?>