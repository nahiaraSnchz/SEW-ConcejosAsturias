<?php
class Database {
    private $host = 'localhost';
    private $user = 'DBUSER2025';
    private $pass = 'DBPWD2025';
    private $dbname = 'central_reservas';
    public $conn;

    public function __construct($host = 'localhost', $user = 'DBUSER2025', $pass = 'DBPWD2025', $dbname = null) {
        $this->host = $host;
        $this->user = $user;
        $this->pass = $pass;
        // Solo actualizar si $dbname NO es null, sino mantiene el valor por defecto
        if ($dbname !== null) {
            $this->dbname = $dbname;
        }
        $this->connect();
    }

    private function connect() {
        if ($this->dbname) {
            // Conectar con base de datos especificada
            $this->conn = new mysqli($this->host, $this->user, $this->pass, $this->dbname);
        } else {
            // Conectar sin seleccionar base de datos
            $this->conn = new mysqli($this->host, $this->user, $this->pass);
        }

        if ($this->conn->connect_error) {
            die('Error de conexión: ' . $this->conn->connect_error);
        }

        $this->conn->set_charset('utf8mb4');
    }

    public function close() {
        if ($this->conn) {
            $this->conn->close();
        }
    }

    public function importSQLFile($filename) {
        if (!file_exists($filename)) {
            throw new Exception("Archivo SQL no encontrado: $filename");
        }
        $sql = file_get_contents($filename);
        // Dividir sentencias por punto y coma
        $statements = array_filter(array_map('trim', explode(';', $sql)));

        foreach ($statements as $stmt) {
            if (!empty($stmt)) {
                if (!$this->conn->query($stmt)) {
                    throw new Exception("Error al ejecutar la consulta: " . $this->conn->error);
                }
            }
        }
    }

    public function importarCSV($archivo, $tabla) {
        if (!file_exists($archivo)) throw new Exception("Archivo CSV no encontrado: $archivo");
        if (($handle = fopen($archivo, 'r')) !== false) {
            // Cambiar ',' por ';' si el CSV usa punto y coma
            $columnas = fgetcsv($handle, 0, ';');  // <-- fijarse en el delimitador aquí
            while (($data = fgetcsv($handle, 0, ';')) !== false) {
                $placeholders = implode(',', array_fill(0, count($data), '?'));
                $sql = "INSERT INTO $tabla (" . implode(',', $columnas) . ") VALUES ($placeholders)";
                $stmt = $this->conn->prepare($sql);
                $stmt->bind_param(str_repeat('s', count($data)), ...$data);
                $stmt->execute();
            }
            fclose($handle);
            return true;
        }
        return false;
    }

    // Comprobar si existe usuario por nombre
    public function usuarioExistePorNombre($nombre) {
        $stmt = $this->conn->prepare("SELECT id_usuario FROM usuarios WHERE nombre = ?");
        $stmt->bind_param('s', $nombre);
        $stmt->execute();
        $stmt->store_result();
        $existe = $stmt->num_rows > 0;
        $stmt->close();
        return $existe;
    }

    // Comprobar si existe usuario por email
    public function usuarioExistePorEmail($email) {
        $stmt = $this->conn->prepare("SELECT id_usuario FROM usuarios WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->store_result();
        $existe = $stmt->num_rows > 0;
        $stmt->close();
        return $existe;
    }

    

    // Crear nuevo usuario con password hasheado
    public function crearUsuario($nombre, $email, $passwordHash) {
        $stmt = $this->conn->prepare("INSERT INTO usuarios (nombre, email, password, fecha_registro) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param('sss', $nombre, $email, $passwordHash);
        $stmt->execute();
        $exito = $stmt->affected_rows > 0;
        $stmt->close();
        return $exito;
    }

    // Obtener usuario completo por nombre
    public function obtenerUsuarioPorNombre($nombre) {
        $stmt = $this->conn->prepare("SELECT id_usuario, nombre, email, password FROM usuarios WHERE nombre = ?");
        $stmt->bind_param('s', $nombre);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        return $user;
    }

    public function obtenerUsuarioPorEmail($email) {
        $stmt = $this->conn->prepare("SELECT id_usuario, nombre, email, password FROM usuarios WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        return $user;
    }

    public function query($sql) {
        $result = $this->conn->query($sql);
        if ($result === false) {
            throw new Exception("Error en la consulta SQL: " . $this->conn->error);
        }
        return $result;
    }

    
}
?>