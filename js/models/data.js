// data.js - Datos constantes y configuración

// Datos de ejemplo
let OPERATORS = [];

let UNITS = [];

const TALLERES = [
    "Taller Central",
    "Taller Norte", 
    "Taller Sur",
    "Taller Externo",
    "Proveedor Autorizado"
];

// TIPOS DE RUTA (NUEVO)
const TIPOS_RUTA = [
    "Utilitario",
    "Mantenimiento",
    "Montacargas",
    "Cilindros",
    "Autotanque"
];

// RUTAS ORGANIZADAS POR TIPO
let RUTAS_POR_TIPO = {
    "Utilitario": ["Utilitario"],
    "Mantenimiento": ["Mantenimiento"],
    "Montacargas": ["Montacargas"],
    "Cilindros": [],
    "Autotanque": []
};

// PUNTOS DE INSPECCIÓN PARA TIPOS NORMALES (Utilitario, Mantenimiento, Montacargas, Cilindros)
const INSPECTION_POINTS_NORMAL = [
    { id: "head_interior", label: "INTERIOR DE LA UNIDAD", isHeader: true },
    { id: "int_indicadores", label: "Indicadores del tablero (Funcionan)", critical: true },
    { id: "int_calentador", label: "Calentador-Desempañador (Funciona)", critical: true },
    { id: "int_herramientas", label: "Caja de herramientas y martillo (A bordo)", critical: true },
    { id: "int_lampara", label: "Lámpara de mano (A bordo)", critical: true },
    { id: "int_cinturon", label: "Cinturón de seguridad (Buen estado y funciona)", critical: true },
    { id: "int_parabrisas", label: "Parabrisas (Sin daño)", critical: true },
    { id: "int_limpiadores", label: "Limpiadores (Funcionando)", critical: true },
    { id: "int_espejos", label: "Espejos retrovisores (Sin daño)", critical: true },
    { id: "int_frenos", label: "Sistema de frenos (Funciona)", critical: true },

    { id: "head_frente", label: "FRENTE EXTERIOR", isHeader: true },
    { id: "frente_defensa", label: "Defensa (Sujeción correcta, en buen estado)", critical: true },
    { id: "frente_luces", label: "Sistema de luces (Funcionando)", critical: true },

    { id: "head_laterales", label: "LADO IZQUIERDO Y DERECHO", isHeader: true },
    { id: "lat_tapon", label: "Tapón tanque de combustible (Cierre hermético)", critical: true },
    { id: "lat_luces", label: "Sistema de luces (Funcionando)", critical: true },
    { id: "lat_refaccion", label: "Llanta de refacción (Presión correcta y sin daños)", critical: true },
    { id: "lat_llantas", label: "Llantas (Presión de fabricante y sin daños)", critical: true },
    { id: "lat_rines", label: "Rines (Sin daños)", critical: true },
    { id: "lat_birlos", label: "Birlos y tuercas (Completos y sin daños)", critical: true },
    { id: "lat_loderas", label: "Guardafangos / Loderas (Completos y sin daños)", critical: true },

    { id: "head_posterior", label: "PARTE POSTERIOR E INFERIOR", isHeader: true },
    { id: "post_luces", label: "Sistema de luces (Funcionando)", critical: true },
    { id: "post_reflejantes", label: "Reflejantes visibles (En buen estado)", critical: true },
    { id: "post_defensa", label: "Defensa (Sujeción correcta, sin daños)", critical: true },
    { id: "post_escape", label: "Escape (Sujeto y sin daño)", critical: true },
    { id: "inf_muelles", label: "Muelles (Completos)", critical: true },

    { id: "head_emergencia", label: "EQUIPO DE EMERGENCIA Y ESTRUCTURA", isHeader: true },
    { id: "em_botiquin", label: "Botiquín de primeros auxilios (A bordo)", critical: true },
    { id: "em_extintor", label: "Extintor 9kg tipo ABC (Sujeto, fecha vigente)", critical: true },
    { id: "em_senales", label: "Señales reflejantes y Calzas (A bordo, sin daño)", critical: true },
    { id: "est_plataforma", label: "Plataforma y armazón perimetral (Uniforme y completa)", critical: true },
    { id: "est_sujecion", label: "Sistema de aseguramiento y enganche (Sin daño)", critical: true },
    { id: "est_recipientes", label: "Recipientes (En posición vertical y asegurados)", critical: true },
    
    { id: "head_letreros", label: "LETREROS, SEÑALES Y AVISOS", isHeader: true },
    { id: "letreros", label: "Letreros y avisos (Claros, legibles y no obstruidos)", critical: true }
];

// PUNTOS DE INSPECCIÓN PARA AUTOTANQUE (DIFERENTE)
const INSPECTION_POINTS_AUTOTANQUE = [
    // RECIPIENTE, VÁLVULAS, ACCESORIOS Y SISTEMA DE TRASIEGO
    { id: "head_recipiente", label: "RECIPIENTE, VÁLVULAS, ACCESORIOS Y SISTEMA DE TRASIEGO", isHeader: true },
    { id: "at_recipiente", label: "Recipiente No Desmontable (Libre de abolladuras, protuberancias, etc.)", critical: true },
    { id: "at_coples", label: "Coples (Sin fuga)", critical: true },
    { id: "at_valvulas_acc", label: "Válvulas y accesorios (Sin fuga)", critical: true },
    { id: "at_valvula_interna", label: "Válvula interna (Abre/cierra correctamente)", critical: true },
    { id: "at_indicadores_fuga", label: "Indicador de presión, temp. y nivel (Sin fuga y funciona)", critical: true },
    { id: "at_indicadores_nivel", label: "Nivel de llenado del Recipiente (No excede el 90%)", critical: true },
    { id: "at_bomba", label: "Bomba de trasiego (Tornillería completa y anclaje correcto)", critical: true },
    { id: "at_medicion", label: "Sistema de medición (Sin fuga, tornillería completa, sin corrosión)", critical: true },
    { id: "at_manguera_estado", label: "Manguera (Sin protuberancias, cortes, raspaduras)", critical: true },
    { id: "at_manguera_recubrimiento", label: "Manguera (Recubrimiento de hule y malla interna sin daño)", critical: true },
    { id: "at_manguera_accesorios", label: "Manguera (Tornillería completa, sin desgaste en accesorios)", critical: true },
    { id: "at_junta_rotatoria", label: "Junta rotatoria (Sin fuga, sin cables expuestos y funcionando)", critical: true },
    { id: "at_valvula_suministro", label: "Válvula de suministro (Sin daños y sin fugas)", critical: true },

    // INTERIOR (CABINA)
    { id: "head_interior_at", label: "INTERIOR (CABINA)", isHeader: true },
    { id: "at_documentos", label: "Documentos (Permiso, T. Circulación, Reglamento, PRE, HDS a bordo)", critical: true },
    { id: "at_herramientas", label: "Caja de herramientas y martillo (A bordo)", critical: true },
    { id: "at_lampara", label: "Lámpara de mano (A bordo)", critical: true },
    { id: "at_indicadores", label: "Indicadores del tablero (Funcionan)", critical: true },
    { id: "at_calentador", label: "Calentador-Desempañador (Funciona)", critical: true },
    { id: "at_cinturon", label: "Cinturón de seguridad (En buen estado y funciona)", critical: true },
    { id: "at_parabrisas", label: "Parabrisas (Sin daño)", critical: true },
    { id: "at_limpiadores", label: "Limpiadores (Funcionan)", critical: true },
    { id: "at_espejos", label: "Espejos retrovisores (Sin daño)", critical: true },
    { id: "at_frenos", label: "Sistema de frenos (Funciona)", critical: true },

    // FRENTE EXTERIOR
    { id: "head_frente_at", label: "FRENTE EXTERIOR", isHeader: true },
    { id: "at_frente_defensa", label: "Defensa (Sujeción correcta, sin daños)", critical: true },
    { id: "at_frente_luces", label: "Sistema de luces (Funcionan)", critical: true },
    { id: "at_frente_escape", label: "Escape (Sujeto y sin daño)", critical: true },

    // LADO IZQUIERDO Y LADO DERECHO
    { id: "head_laterales_at", label: "LADO IZQUIERDO Y LADO DERECHO", isHeader: true },
    { id: "at_lat_tapon", label: "Tapón del tanque de combustible (Cierre hermético)", critical: true },
    { id: "at_lat_luces", label: "Sistema de luces (Funcionan)", critical: true },
    { id: "at_lat_refaccion", label: "Llanta de refacción (Presión correcta y sin daños)", critical: true },
    { id: "at_lat_llantas", label: "Llantas (Presión correcta y sin daños)", critical: true },
    { id: "at_lat_rines", label: "Rines (Sin daños)", critical: true },
    { id: "at_lat_birlos", label: "Birlos y tuercas (Completos y sin daños)", critical: true },
    { id: "at_lat_loderas", label: "Guardafangos / Loderas (Completos y sin daños)", critical: true },
    { id: "at_lat_escalera", label: "Escalera (Bien sujeta)", critical: true },

    // PARTE POSTERIOR DE LA UNIDAD
    { id: "head_post_at", label: "PARTE POSTERIOR DE LA UNIDAD", isHeader: true },
    { id: "at_post_luces", label: "Sistema de luces (Funcionando)", critical: true },
    { id: "at_post_defensa", label: "Defensa (Que exista, sujeción correcta y sin daños)", critical: true },

    // PARTE INFERIOR
    { id: "head_inf_at", label: "PARTE INFERIOR DE LA UNIDAD", isHeader: true },
    { id: "at_inf_cinta", label: "Cinta estática (Que toque el piso)", critical: true },

    // EQUIPO DE EMERGENCIA
    { id: "head_em_at", label: "EQUIPO DE EMERGENCIA", isHeader: true },
    { id: "at_em_botiquin", label: "Botiquín y Extintor 9kg ABC (A bordo, vigente)", critical: true },
    { id: "at_em_senales", label: "Señales, Letreros y Calzas (A bordo)", critical: true },

    // LETREROS, SEÑALES Y AVISOS
    { id: "head_letreros_at", label: "LETREROS, SEÑALES Y AVISOS", isHeader: true },
    { id: "at_letreros", label: "Letreros, señales y avisos (Claros, legibles y no obstruidos)", critical: true }
];

// PUNTOS DE INSPECCIÓN EXCLUSIVOS PARA UTILITARIOS
const INSPECTION_POINTS_UTILITARIO = [
    { id: "head_utilitario", label: "REVISIÓN DE VEHÍCULO UTILITARIO", isHeader: true },
    { id: "util_limp_ext", label: "Limpieza exterior (Limpio y sin daños)", critical: false },
    { id: "util_limp_int", label: "Limpieza interior (Limpio y ordenado)", critical: false },
    { id: "util_llantas", label: "Estado de llantas (Presión y desgaste correcto)", critical: true },
    { id: "util_luces", label: "Luces en general (Funcionando correctamente)", critical: true },
    { id: "util_espejos", label: "Espejos completos (Sujetos y sin daños)", critical: true },
    { id: "util_claxon", label: "Claxon (Funcionando)", critical: true },
    { id: "util_frenos", label: "Frenos (Funcionando correctamente)", critical: true },
    { id: "util_suspension", label: "Suspensión (Sin ruidos anormales)", critical: false },
    { id: "util_aceite", label: "Nivel de aceite (Nivel óptimo)", critical: true },
    { id: "util_agua", label: "Nivel de agua (Nivel óptimo)", critical: true },
    { id: "util_bandas", label: "Bandas (Buen estado y tensión adecuada)", critical: true },
    { id: "util_documentos", label: "Documentación completa (A bordo y vigente)", critical: true }
];


// Tipos de mantenimiento
const TIPOS_MANTENIMIENTO = [
    "Mantenimiento Correctivo",
    "Mantenimiento Preventivo", 
    "Otras Reparaciones"
];

// Puntos críticos de revisión
const PUNTOS_CRITICOS = [
    "Luces en general",
    "Cinta estática y banderolas",
    "Sellos manguera carburación ambas puntas",
    "Niveles (Agua, aceite, transmisión)",
    "Perifoneo",
    "Espejos",
    "Presión de aire llantas",
    "Muelles"
];

// Configuración de imagen 
const LOGO_URL = "img/logo.png";

// Configuración de Supabase
const SUPABASE_CONFIG = {
    URL: "https://jktnnlthbahbwlmqrubt.supabase.co",
    KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdG5ubHRoYmFoYndsbXFydWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjA5MjEsImV4cCI6MjA5MDYzNjkyMX0.LtsaU3I3nlIS5-VhpFJIvncO8sj6ftjbGsg4hiO0mzM"
};

// FUNCIÓN PARA DESCARGAR CATÁLOGOS AL INICIAR
async function loadCatalogsFromDB() {
    if (typeof StorageService === 'undefined') return;
    const client = StorageService.init();
    if (!client) return;
    
    try {
        const { data: ops } = await client.from('operadores').select('numero_empleado, nombre_completo').eq('estatus', true).order('nombre_completo');
        if (ops) OPERATORS = ops.map(o => `${o.numero_empleado}: ${o.nombre_completo}`);
        
        const { data: unis } = await client.from('unidades').select('eco').eq('estatus', true).order('eco');
        if (unis) UNITS = unis.map(u => u.eco);
        
        const { data: rutas } = await client.from('rutas_catalogo').select('nombre, tipo').eq('estatus', true);
        if (rutas) {
            RUTAS_POR_TIPO["Cilindros"] = [];
            RUTAS_POR_TIPO["Autotanque"] = [];
            rutas.forEach(r => {
                if (RUTAS_POR_TIPO[r.tipo]) RUTAS_POR_TIPO[r.tipo].push(r.nombre);
            });
        }
        
        // Re-asignar al objeto global
        window.CONFIG.OPERATORS = OPERATORS;
        window.CONFIG.UNITS = UNITS;
        window.CONFIG.RUTAS_POR_TIPO = RUTAS_POR_TIPO;
    } catch(e) {
        console.error("Error cargando catálogos de base de datos", e);
    }
}

// Función para obtener los puntos de inspección según el tipo de ruta
function getInspectionPointsByRouteType(routeType) {
    if (routeType === "Autotanque") {
        return INSPECTION_POINTS_AUTOTANQUE;
    } else if (routeType === "Utilitario") {
        return INSPECTION_POINTS_UTILITARIO;
    } else {
        // Para Mantenimiento, Montacargas, Cilindros y cualquier otro
        return INSPECTION_POINTS_NORMAL;
    }
}

// Función para obtener las rutas según el tipo
function getRoutesByType(routeType) {
    return RUTAS_POR_TIPO[routeType] || [];
}

// Exportar datos para uso global
if (typeof window !== 'undefined') {
    window.CONFIG = {
        OPERATORS,
        UNITS,
        TALLERES,
        TIPOS_RUTA,
        RUTAS_POR_TIPO,
        TIPOS_MANTENIMIENTO,
        PUNTOS_CRITICOS,
        INSPECTION_POINTS_NORMAL,
        INSPECTION_POINTS_AUTOTANQUE,
        INSPECTION_POINTS_UTILITARIO,
        getInspectionPointsByRouteType,
        getRoutesByType,
        LOGO_URL,
        SUPABASE: SUPABASE_CONFIG,
        loadCatalogsFromDB
    };
}