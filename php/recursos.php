<?php


if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'database.php';


class Recursos {
    private $conn;

    public function __construct($db) {
        $this->conn = $db->conn;
    }

    public function obtenerTodos() {
        $sql = "SELECT id_recurso, nombre, descripcion, plazas, fecha_inicio, fecha_fin, precio FROM recursos WHERE plazas > 0 ORDER BY fecha_inicio";
        $result = $this->conn->query($sql);
        $recursos = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $recursos[] = $row;
            }
        }
        return $recursos;
    }
}

$db = new Database();
$recursosObj = new Recursos($db);
$recursos = $recursosObj->obtenerTodos();
?>
