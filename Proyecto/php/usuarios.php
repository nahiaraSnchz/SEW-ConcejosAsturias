<?php
class Usuario {
    private $db;

    public function __construct($db) {
        $this->db = $db;
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function registrar($nombre, $email, $password, $password2) {
        if ($password !== $password2) return "Las contraseñas no coinciden.";
        if (strlen($password) < 6) return "La contraseña debe tener al menos 6 caracteres.";
        if ($this->db->usuarioExistePorNombre($nombre)) return "El nombre ya está en uso.";
        if ($this->db->usuarioExistePorEmail($email)) return "El email ya está en uso.";

        $hash = password_hash($password, PASSWORD_DEFAULT);
        if ($this->db->crearUsuario($nombre, $email, $hash)) {
            return "OK";
        } else {
            return "Error al registrar usuario.";
        }
    }

    public function login($email, $password) {
        $user = $this->db->obtenerUsuarioPorEmail($email);
        if (!$user || !password_verify($password, $user['password'])) {
            return "Email o contraseña incorrectos.";
        }

        $_SESSION['user_id'] = $user['id_usuario'];
        $_SESSION['user_name'] = $user['nombre'];
        return "OK";
    }

    public function logout() {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }
}