<?php
// reserva.php

require_once 'database.php';

class Reserva {
    private $db;
    private $mysqli;

    public function __construct() {
        $this->db = new Database();
        $this->mysqli = $this->db->conn;
    }

    public function obtenerRecursos() {
        $recursos = [];
        $result = $this->mysqli->query("SELECT * FROM recursos");
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $recursos[] = $row;
            }
            $result->free();
        }
        return $recursos;
    }

    public function obtenerRecursoPorId(int $id) {
        $stmt = $this->mysqli->prepare("SELECT * FROM recursos WHERE id_recurso = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $recurso = $resultado->fetch_assoc();
        $stmt->close();
        return $recurso ?: null;
    }

    /**
     * Intenta crear una reserva.
     * Retorna array con ['success' => bool, 'message' => string]
     */
    public function crearReserva(int $idUsuario, int $idRecurso, int $personas, string $fecha_inicio, string $fecha_fin, float $precioTotal): array {
        if ($personas < 1) {
            return ['success' => false, 'message' => 'Debe reservar al menos una persona.'];
        }

        $recurso = $this->obtenerRecursoPorId($idRecurso);
        if (!$recurso) {
            return ['success' => false, 'message' => 'Recurso no encontrado.'];
        }
        if ($personas > $recurso['plazas']) {
            return ['success' => false, 'message' => "No hay suficientes plazas disponibles. Plazas disponibles: {$recurso['plazas']}."];
        }

        
        $fechaReserva = date('Y-m-d H:i:s');

        $stmt = $this->mysqli->prepare("INSERT INTO reservas (id_usuario, id_recurso, fecha_inicio, fecha_fin, confirmada, total_precio) VALUES (?, ?, ?, ?, 1, ?)");
        $stmt->bind_param("iissd", $idUsuario, $idRecurso, $fecha_inicio, $fecha_fin, $precioTotal);
        if (!$stmt->execute()) {
            $stmt->close();
            return ['success' => false, 'message' => 'Error al insertar la reserva.'];
        }
        $stmt->close();

        // Actualizar plazas
        $nuevasPlazas = $recurso['plazas'] - $personas;
        $stmt = $this->mysqli->prepare("UPDATE recursos SET plazas = ? WHERE id_recurso = ?");
        $stmt->bind_param("ii", $nuevasPlazas, $idRecurso);
        $stmt->execute();
        $stmt->close();

        return ['success' => true, 'message' => "Reserva realizada correctamente. Total a pagar: €" . number_format($precioTotal, 2, ',', '.')];
    }

    /**
     * Obtiene todas las reservas del usuario con datos del recurso.
     * Retorna array con reservas.
     */
    public function obtenerPorUsuario(int $idUsuario) {
        $stmt = $this->mysqli->prepare(
            "SELECT r.id_reserva, r.id_usuario, r.id_recurso, r.fecha_inicio, r.fecha_fin, r.confirmada, r.total_precio,
                    rec.nombre AS nombre_recurso
            FROM reservas r
            JOIN recursos rec ON r.id_recurso = rec.id_recurso
            WHERE r.id_usuario = ?
            AND NOT EXISTS (
                SELECT 1 FROM cancelaciones c WHERE c.id_reserva = r.id_reserva
            )"
        );
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $reservas = [];
        while ($fila = $resultado->fetch_assoc()) {
            $reservas[] = $fila;
        }
        $stmt->close();
        return $reservas;
    }

    /**
     * Cancela una reserva del usuario.
     * Retorna array con ['success' => bool, 'message' => string]
     */
    public function cancelarReserva(int $idReserva, int $idUsuario, string $motivo = 'Cancelación de usuario'): array {
        // Obtener el recurso relacionado y plazas disponibles
        $stmt = $this->mysqli->prepare(
            "SELECT r.id_recurso, rec.plazas 
            FROM reservas r 
            JOIN recursos rec ON r.id_recurso = rec.id_recurso
            WHERE r.id_reserva = ? AND r.id_usuario = ?"
        );
        $stmt->bind_param("ii", $idReserva, $idUsuario);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $datos = $resultado->fetch_assoc();
        $stmt->close();

        if (!$datos) {
            return ['success' => false, 'message' => 'Reserva no encontrada o no pertenece al usuario.'];
        }

        $idRecurso = $datos['id_recurso'];
        $plazasActuales = (int)$datos['plazas'];

        // Insertar en cancelaciones
        $fechaCancelacion = date('Y-m-d H:i:s');
        $stmt = $this->mysqli->prepare(
            "INSERT INTO cancelaciones (id_reserva, fecha_cancelacion, motivo) VALUES (?, ?, ?)"
        );
        $stmt->bind_param("iss", $idReserva, $fechaCancelacion, $motivo);
        if (!$stmt->execute()) {
            $stmt->close();
            return ['success' => false, 'message' => 'Error al registrar la cancelación.'];
        }
        $stmt->close();

        // Actualizar plazas aumentando en 1
        $nuevasPlazas = $plazasActuales + 1;
        $stmt = $this->mysqli->prepare("UPDATE recursos SET plazas = ? WHERE id_recurso = ?");
        $stmt->bind_param("ii", $nuevasPlazas, $idRecurso);
        $stmt->execute();
        $stmt->close();

        return ['success' => true, 'message' => 'Reserva cancelada correctamente.'];
    }

    public function validarFechas($fechaInicio, $fechaFin) {
        $inicio = strtotime($fechaInicio);
        $fin = strtotime($fechaFin);
        if (!$inicio || !$fin) return false;  // fechas no válidas
        if ($inicio > $fin) return false;     // inicio después de fin
        // Puedes agregar más reglas aquí (ej. mínimo 1 día, no fechas pasadas, etc.)
        return true;
    }

    public function calcularPrecio($precioBase, $fechaInicio, $fechaFin) {
        $inicio = new DateTime($fechaInicio);
        $fin = new DateTime($fechaFin);
        $dias = $fin->diff($inicio)->days + 1;  // +1 para incluir día inicio
        return $precioBase * $dias;
    }
}