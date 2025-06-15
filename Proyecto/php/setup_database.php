<?php
require 'database.php';  // Incluye la clase Database

// Crear conexión sin seleccionar base de datos (null)
$db = new Database();

// Crear base de datos e importar tablas
$db->importSQLFile(__DIR__ .'/sql/central_reservas.sql');

$db->importarCSV(__DIR__ . '/tipos_recurso.csv', 'tipos_recurso');
$db->importarCSV(__DIR__ . '/recursos.csv', 'recursos');

$db->importarCSV(__DIR__ .'/usuarios.csv', 'usuarios');          // Luego usuarios

$db->importarCSV(__DIR__ .'/reservas.csv', 'reservas');          // Finalmente reservas
$db->importarCSV(__DIR__ .'/cancelaciones.csv', 'cancelaciones');// Y otras tablas dependientes

// Cerrar conexión
$db->close();

echo "Base de datos creada e importada correctamente.";
?>