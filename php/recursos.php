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
        $sql = "SELECT id_recurso, nombre, descripcion, plazas, precio FROM recursos WHERE plazas > 0";
        $result = $this->conn->query($sql);
        $recursos = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $recursos[] = $row;
            }
        }
        return $recursos;
    }

    // Método para obtener el precio de un recurso por id
    public function obtenerPrecio($idRecurso) {
        $sql = "SELECT precio FROM recursos WHERE id_recurso = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $idRecurso);
        $stmt->execute();
        $resultado = $stmt->get_result()->fetch_assoc();
        if ($resultado) {
            return (float)$resultado['precio'];
        }
        return 0.0;
    }
}

$db = new Database();
$recursosObj = new Recursos($db);
$recursos = $recursosObj->obtenerTodos();
?>
