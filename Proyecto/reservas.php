<?php
// Código sesión, login, registro, logout (tu código actual)
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', 1800);
    session_set_cookie_params(1800);
    session_start();
}



require_once 'php/database.php';
require_once 'php/usuarios.php';
require_once 'php/recursos.php';
require_once 'php/reserva.php';


// Crear conexión sin base de datos para comprobar existencia
$dbCheck = new Database(null, 'DBUSER2025', 'DBPWD2025', null);

// Comprobar si base de datos existe o si tabla usuarios existe
$dbExists = $dbCheck->query("SHOW DATABASES LIKE 'central_reservas'");
$databaseExists = ($dbExists && $dbExists->num_rows > 0);

if (!$databaseExists) {
    // Base de datos no existe, la creamos y llenamos
    $dbCheck->importSQLFile(__DIR__ . '/php/sql/central_reservas.sql');

    $dbCheck->importarCSV(__DIR__ . '/php/tipos_recurso.csv', 'tipos_recurso');
    $dbCheck->importarCSV(__DIR__ . '/php/recursos.csv', 'recursos');
    $dbCheck->importarCSV(__DIR__ . '/php/usuarios.csv', 'usuarios');
    $dbCheck->importarCSV(__DIR__ . '/php/reservas.csv', 'reservas');
    $dbCheck->importarCSV(__DIR__ . '/php/cancelaciones.csv', 'cancelaciones');
}

// Ahora crear conexión normal con base de datos
$db = new Database('localhost', 'DBUSER2025', 'DBPWD2025', 'central_reservas');

$usuarioModel = new Usuario($db);

$authAction = $_GET['action'] ?? '';
$view = $_GET['view'] ?? '';
$mensajeLogin = '';
$mensajeRegistro = '';

if ($authAction === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $mensajeLogin = $usuarioModel->login($_POST['email'], $_POST['password']);
    if ($mensajeLogin === 'OK') {
        // Obtener datos del usuario si login fue correcto
        $datosUsuario = $db->obtenerUsuarioPorEmail($_POST['email']); 
        $_SESSION['user_id'] = $datosUsuario['id_usuario'];
        $_SESSION['user_name'] = $datosUsuario['nombre'];
        
        header('Location: reservas.php?view=reservas');
        exit;
    }
} elseif ($authAction === 'registro' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $mensajeRegistro = $usuarioModel->registrar($_POST['nombre'], $_POST['email'], $_POST['password'], $_POST['password2']);
    if ($mensajeRegistro === 'OK') {
        $mensajeLogin = 'Registro exitoso. Inicia sesión.';
        $authAction = 'login';
    }
} elseif ($authAction === 'logout') {
    $usuarioModel->logout();
    header('Location: reservas.php?action=login');
    exit;
}

// Si el usuario está autenticado y quiere ver recursos, cargamos los recursos
if (isset($_SESSION['user_id']) && $view === 'recursos') {
    $recursosObj = new Recursos($db);
    $recursos = $recursosObj->obtenerTodos();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="author" content="Nahiara Sánchez García" />
    <meta name="description" content="Reservas de recursos turísticos" />
    <meta name="keywords" content="reservas, turismo, asturias" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ConcejosAsturias - Reservas</title>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <link rel="stylesheet" href="estilo/estilo.css" />
    <link rel="stylesheet" href="estilo/layout.css" />
    <link rel="icon" href="multimedia/favicon.ico" />
</head>
<body>
<header>
    <h1><a href="index.html" title="Página Inicio">ConcejosAsturias</a></h1>
    <nav>
        <a href="index.html">Inicio</a>
        <a href="reservas.php?view=recursos" title="Recursos Turísticos">Recursos Turísticos</a>
        <a href="reservas.php?view=reservas" title="Reservas">Reservas</a>
        <a href="ayuda.html">Ayuda</a>
        <?php if (isset($_SESSION['user_id'])): ?>
            <a href="reservas.php?action=logout">Cerrar sesión (<?= htmlspecialchars($_SESSION['user_name']) ?>)</a>
        <?php endif; ?>
    </nav>
</header>
<main>
<?php
if (!isset($_SESSION['user_id'])) {
    // Mostrar login o registro
    if ($authAction === 'registro') {
        echo '<section><h2>Registro de usuario</h2>';
        if ($mensajeRegistro) echo "<p>$mensajeRegistro</p>";
        echo <<<HTML
        <form method="post" action="?action=registro">
            <label>Nombre: <input type="text" name="nombre" required></label><br>
            <label>Email: <input type="email" name="email" required></label><br>
            <label>Contraseña: <input type="password" name="password" required></label><br>
            <label>Confirmar contraseña: <input type="password" name="password2" required></label><br>
            <input type="submit" value="Registrar">
        </form>
        <p>¿Ya tienes cuenta? <a href="?action=login">Iniciar sesión</a></p>
        HTML;
    } else {
        echo '<section><h2>Inicio de sesión</h2>';
        if ($mensajeLogin) echo "<p>$mensajeLogin</p>";
        echo <<<HTML
        <form method="post" action="?action=login">
            <label>Email: <input type="email" name="email" required></label><br>
            <label>Contraseña: <input type="password" name="password" required></label><br>
            <input type="submit" value="Entrar">
        </form>
        <p>¿No tienes cuenta? <a href="?action=registro">Regístrate aquí</a></p>
        HTML;
    }
    echo '</section>';
    exit;
}

// Usuario autenticado:
if ($view === 'recursos'):
?>
    <section>
        <h3>Reservar Recursos Turísticos</h3>
        <p>Bienvenido, <?= htmlspecialchars($_SESSION['user_name']) ?> | 
           <a href="reservas.php?action=logout">Cerrar sesión</a></p>

        <?php
        require_once 'php/reserva.php';
        $reservaObj = new Reserva();

        // Procesar reserva si se ha confirmado
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['confirmar'])) {
            $idUsuario = $_SESSION['user_id'];
            $idRecurso = (int)$_POST['id_recurso'];
            $fechaInicio = $_POST['fecha_inicio'];
            $fechaFin = $_POST['fecha_fin'];
            $personas = 1; // Si luego añades campo para personas, cambia aquí

            $recursosObj = new Recursos($db);
            $precioBase = $recursosObj->obtenerPrecio($idRecurso);

            $precioTotal = $reservaObj->calcularPrecio($precioBase, $fechaInicio, $fechaFin);

            $resultado = $reservaObj->crearReserva($idUsuario, $idRecurso, $personas, $fechaInicio, $fechaFin, $precioTotal);

            if ($resultado['success'] === true) {
                header('Location: reservas.php?view=reservas');
                exit();
            } else {
                echo "<p>Error al crear reserva</p>";
            }
        }

        // Obtener recurso seleccionado
        $idRecursoSeleccionado = $_GET['id_recurso'] ?? null;
        $recursoSeleccionado = null;

        if ($idRecursoSeleccionado) {
            foreach ($recursos as $r) {
                if ((int)$r['id_recurso'] === (int)$idRecursoSeleccionado) {
                    $recursoSeleccionado = $r;
                    break;
                }
            }
        }
        ?>

        <?php if ($recursoSeleccionado): ?>
            <article class="recurso-seleccionado" aria-label="Reserva de <?= htmlspecialchars($recursoSeleccionado['nombre']) ?>">
                <h2>Confirmar Reserva</h2>
                <ul>
                    <li><strong>Nombre:</strong> <?= htmlspecialchars($recursoSeleccionado['nombre']) ?></li>
                    <li><strong>Descripción:</strong> <?= htmlspecialchars($recursoSeleccionado['descripcion']) ?></li>
                    <li><strong>Precio de un día:</strong> €<?= number_format($recursoSeleccionado['precio'], 2, ',', '.') ?></li>
                </ul>

                <form method="POST" action="reservas.php?view=recursos&id_recurso=<?= (int)$recursoSeleccionado['id_recurso'] ?>">
                    <label for="fecha_inicio"><strong>Fecha inicio:</strong></label>
                    <input type="datetime-local" id="fecha_inicio" name="fecha_inicio" value="<?= date('Y-m-d') ?>" required>

                    <label for="fecha_fin"><strong>Fecha fin:</strong></label>
                    <input type="datetime-local" id="fecha_fin" name="fecha_fin" value="<?= date('Y-m-d', strtotime('+1 day')) ?>" required>

                    <input type="hidden" name="id_recurso" value="<?= (int)$recursoSeleccionado['id_recurso'] ?>">
                    <button type="submit" name="confirmar">Confirmar Reserva</button>
                </form>

                <br>
                <a href="reservas.php?view=reservas">← Volver al listado</a>
            </article>
        <?php elseif (empty($recursos)): ?>
            <p>No hay recursos disponibles para reservar en este momento.</p>
        <?php else: ?>
            <?php foreach ($recursos as $recurso): ?>
                <article class="recurso" aria-label="Recurso <?= htmlspecialchars($recurso['nombre']) ?>">
                    <h2><?= htmlspecialchars($recurso['nombre']) ?></h2>
                    <ul>
                        <li><strong>Descripción:</strong> <?= htmlspecialchars($recurso['descripcion']) ?></li>
                        <li><strong>Plazas disponibles:</strong> <?= (int)$recurso['plazas'] ?></li>
                        <li><strong>Precio:</strong> €<?= number_format($recurso['precio'], 2, ',', '.') ?></li>
                    </ul>
                    <form method="GET" action="reservas.php">
                        <input type="hidden" name="view" value="recursos">
                        <input type="hidden" name="id_recurso" value="<?= (int)$recurso['id_recurso'] ?>">
                        <button type="submit">Reservar</button>
                    </form>
                </article>
                <br>
                <hr>
            <?php endforeach; ?>
        <?php endif; ?>
    </section>

<?php elseif ($view === 'reservas'): ?>
    <?php
        // Asumimos que $userId contiene el id del usuario logueado
        $reservaObj = new Reserva();

        // Obtener reservas actuales
        $userId = $_SESSION['user_id'];

        // Procesar cancelación si viene por POST
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['cancelar_reserva_id'])) {
            $idReservaCancelar = intval($_POST['cancelar_reserva_id']);
            $resultadoCancelacion = $reservaObj->cancelarReserva($idReservaCancelar, $userId);
            echo '<p>' . htmlspecialchars($resultadoCancelacion['message']) . '</p>';
        }

        
        $reservas = $reservaObj->obtenerPorUsuario($userId);
        ?>
        <section>
            <h3>Reservar Recursos Turísticos</h3>
            <p>Bienvenido, <?= htmlspecialchars($_SESSION['user_name']) ?> | 
           <a href="reservas.php?action=logout">Cerrar sesión</a></p>
            <h2>Mis reservas</h2>

            <?php if (empty($reservas)): ?>
                <p>No tienes reservas activas.</p>
            <?php else: ?>
                <?php foreach ($reservas as $reserva): ?>
                    <article>
                        <h3><?= htmlspecialchars($reserva['nombre_recurso']) ?></h3>
                        <ul>
                            <li><strong>Fecha inicio:</strong> <?= htmlspecialchars($reserva['fecha_inicio']) ?></li>
                            <li><strong>Fecha fin:</strong> <?= htmlspecialchars($reserva['fecha_fin']) ?></li>
                            <li><strong>Total (€):</strong> <?= number_format($reserva['total_precio'], 2, ',', '.') ?></li>
                            <li><strong>Confirmada:</strong> <?= $reserva['confirmada'] ? 'Sí' : 'No' ?></li>
                        </ul>
                        <form method="post">
                            <input type="hidden" name="cancelar_reserva_id" value="<?= (int)$reserva['id_reserva'] ?>">
                            <button type="submit" onclick="return confirm('¿Seguro que quieres cancelar esta reserva?');">Cancelar</button>
                        </form>
                        <br>
                    </article>
                <?php endforeach; ?>
                <br>
            <?php endif; ?>
        </section>
    
<?php else: ?>
    <section>
        <h2>Zona de reservas</h2>
        <p>Bienvenido, <strong><?= htmlspecialchars($_SESSION['user_name']) ?></strong>. Aquí podrás gestionar tus reservas.</p>
        <br>
        <!-- Aquí puedes incluir listado de reservas, formulario para nueva reserva, etc. -->
    </section>
<?php endif; ?>
</main>
</body>
</html>