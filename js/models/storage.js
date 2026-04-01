// storage.js - Funciones de almacenamiento con Supabase

let supabaseClient = null;

const StorageService = {
    // Inicializar cliente Supabase
    init() {
        if (supabaseClient) return supabaseClient;
        
        if (typeof supabase === 'undefined') {
            console.error('La librería de Supabase no está cargada.');
            return null;
        }
        
        if (!CONFIG.SUPABASE || !CONFIG.SUPABASE.URL || CONFIG.SUPABASE.URL.includes('TU_SUPABASE')) {
            console.error('Configuración de Supabase incompleta en data.js');
            alert("Falta configurar Supabase en js/models/data.js");
            return null;
        }
        
        supabaseClient = supabase.createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY);
        return supabaseClient;
    },

    // Helper: Convertir Base64 a Blob para subir imagen
    base64ToBlob(base64) {
        try {
            if (typeof base64 !== 'string' || !base64.includes(';base64,')) return null;
            const parts = base64.split(';base64,');
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);
            const rawLength = raw.length;
            const uInt8Array = new Uint8Array(rawLength);
            for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            return new Blob([uInt8Array], { type: contentType });
        } catch (e) {
            console.error("Error convirtiendo imagen", e);
            return null;
        }
    },

    // Helper: Subir imagen al bucket 'evidencias'
    async uploadImage(path, base64) {
        const client = this.init();
        if (!client || !base64) return null;

        try {
            const blob = this.base64ToBlob(base64);
            if (!blob) return null;

            const { data, error } = await client.storage
                .from('evidencias')
                .upload(path, blob, { 
                    upsert: true,
                    contentType: blob.type 
                });

            if (error) throw error;

            const { data: { publicUrl } } = client.storage
                .from('evidencias')
                .getPublicUrl(path);

            return publicUrl;
        } catch (err) {
            console.error('Error subiendo imagen:', err);
            throw err; // Lanzar error para detener el guardado si falla la imagen
        }
    },

    // Guardar reportes localmente
    async saveReport(report) {
        const client = this.init();
        if (!client) return false;

        try {
            report.id = Date.now().toString();
            report.tipo = 'checklist';
            
            // 1. Subir fotos de evidencia
            const fotosUrls = {};
            if (report.fotos) {
                for (const [key, base64] of Object.entries(report.fotos)) {
                    if (base64 && base64.startsWith('data:')) {
                        const url = await this.uploadImage(`reportes/${report.id}/${key}.jpg`, base64);
                        if (url) fotosUrls[key] = url;
                    }
                }
            }
            
            // 2. Subir firma
            let firmaUrl = report.firma;
            if (report.firma && report.firma.startsWith('data:')) {
                firmaUrl = await this.uploadImage(`reportes/${report.id}/firma.png`, report.firma);
            }

            // 3. Guardar datos en tabla 'reportes'
            // Guardamos todo el objeto JSON en una columna 'content' para flexibilidad
            const reportToSave = { ...report, fotos: fotosUrls, firma: firmaUrl };
            
            const { error } = await client
                .from('reportes')
                .insert({ id: report.id, content: reportToSave });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error al guardar reporte en Supabase:", error);
            if (error.message && error.message.includes("row-level security")) {
                alert("⛔ Error de Permisos en Supabase:\n\nFaltan las 'Policies' (Políticas de Seguridad). Ejecuta el script SQL proporcionado en el editor de Supabase para permitir la escritura.");
            } else {
                alert("Error al guardar: " + error.message);
            }
            return false;
        }
    },
    
    // Guardar orden de servicio localmente
    async saveOrden(orden) {
        const client = this.init();
        if (!client) return false;

        try {
            orden.id = Date.now().toString();
            orden.tipo = 'orden';
            
            // 1. Subir imágenes (Falla y Firmas)
            let fotoFallaUrl = orden.fotoFalla;
            if (orden.fotoFalla && orden.fotoFalla.startsWith('data:')) {
                fotoFallaUrl = await this.uploadImage(`ordenes/${orden.id}/falla.jpg`, orden.fotoFalla);
            }
            
            let firmaTallerUrl = orden.firmaTaller;
            if (orden.firmaTaller && orden.firmaTaller.startsWith('data:')) {
                firmaTallerUrl = await this.uploadImage(`ordenes/${orden.id}/firma_taller.png`, orden.firmaTaller);
            }
            
            let firmaChoferUrl = orden.firmaChofer;
            if (orden.firmaChofer && orden.firmaChofer.startsWith('data:')) {
                firmaChoferUrl = await this.uploadImage(`ordenes/${orden.id}/firma_chofer.png`, orden.firmaChofer);
            }

            // 2. Guardar datos en tabla 'ordenes'
            const ordenToSave = { 
                ...orden, 
                fotoFalla: fotoFallaUrl,
                firmaTaller: firmaTallerUrl,
                firmaChofer: firmaChoferUrl
            };

            const { error } = await client
                .from('ordenes')
                .insert({ id: orden.id, content: ordenToSave });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error al guardar orden en Supabase:", error);
            if (error.message && error.message.includes("row-level security")) {
                alert("⛔ Error de Permisos en Supabase:\n\nFaltan las 'Policies' (Políticas de Seguridad). Ejecuta el script SQL proporcionado en el editor de Supabase para permitir la escritura.");
            } else {
                alert("Error al guardar: " + error.message);
            }
            return false;
        }
    },

  // storage.js - Agregar después de updateOrdenStatus

// Actualizar orden (para trabajo realizado)
async updateOrden(id, updates) {
    const client = this.init();
    if (!client) {
        // Fallback a localStorage
        const ordenes = JSON.parse(localStorage.getItem('ordenes') || '[]');
        const index = ordenes.findIndex(o => o.id == id);
        if (index !== -1) {
            ordenes[index] = { ...ordenes[index], ...updates };
            localStorage.setItem('ordenes', JSON.stringify(ordenes));
            return true;
        }
        return false;
    }

    try {
        const { data, error: fetchError } = await client
            .from('ordenes')
            .select('content')
            .eq('id', id)
            .single();
            
        if (fetchError) throw fetchError;
        
        const orden = { ...data.content, ...updates };
        
        const { error } = await client
            .from('ordenes')
            .update({ content: orden })
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error actualizando orden:", error);
        return false;
    }
},
    
    // Cargar reportes
    async loadReports() {
        const client = this.init();
        if (!client) return [];

        try {
            const { data, error } = await client
                .from('reportes')
                .select('content')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return data.map(row => row.content);
        } catch (error) {
            console.error("Error al cargar reportes de Supabase:", error);
            return [];
        }
    },
    
    // Cargar órdenes
    async loadOrdenes() {
        const client = this.init();
        if (!client) return [];

        try {
            const { data, error } = await client
                .from('ordenes')
                .select('content')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map(row => row.content);
        } catch (error) {
            console.error("Error al cargar órdenes de Supabase:", error);
            return [];
        }
    },
    
    // Eliminar todos los reportes
    async clearReports() {
        const client = this.init();
        if (!client) return;
        // Nota: Esto borrará TODO en la tabla reportes. Usar con precaución.
        await client.from('reportes').delete().neq('id', '0'); 
    },
    
    // Eliminar todas las órdenes
    async clearOrdenes() {
        const client = this.init();
        if (!client) return;
        await client.from('ordenes').delete().neq('id', '0');
    },
    
    // Exportar a CSV
    exportToCSV(data, type) {
        let csv = '';
        
        if (type === 'checklists') {
            csv = 'Fecha,Hora,Operador,Economico,KM,Ruta,Estado,Observaciones\n';
            
            data.forEach(report => {
                const evaluaciones = report.evaluaciones || {};
                const rechazados = Object.values(evaluaciones).filter(e => e === 'rechazado').length;
                const estado = rechazados > 0 ? 'Con fallas' : 'Aprobado';
                
                const row = [
                    `"${report.fecha}"`,
                    `"${report.hora}"`,
                    `"${report.operador.replace(/"/g, '""')}"`,
                    `"${report.ecoUnidad}"`,
                    report.km,
                    `"${report.ruta}"`,
                    `"${estado}"`,
                    `"${(report.observaciones || '').replace(/"/g, '""')}"`
                ].join(',');
                
                csv += row + '\n';
            });
            
        } else {
            csv = 'Folio,Fecha,Hora,Unidad,Operador,KM,Tipo,Lugar,Estado,Falla,Puntos_Criticos\n';
            
            data.forEach(orden => {
                const row = [
                    `"${orden.folio}"`,
                    `"${orden.fecha}"`,
                    `"${orden.hora}"`,
                    `"${orden.unidad}"`,
                    `"${orden.operador.replace(/"/g, '""')}"`,
                    orden.kilometro,
                    `"${orden.tipoMantenimiento === 'correctivo' ? 'Correctivo' : orden.tipoMantenimiento === 'preventivo' ? 'Preventivo' : 'Otras'}"`,
                    `"${orden.mantenimientoLugar === 'taller' ? 'Taller' : 'Ruta'}"`,
                    `"${orden.estado}"`,
                    `"${(orden.descripcionFalla || '').replace(/"/g, '""').substring(0, 100)}"`,
                    `"${(orden.puntosCriticos || []).join('; ')}"`
                ].join(',');
                
                csv += row + '\n';
            });
        }
        
        return csv;
    }
};

// Exportar servicio para uso global
if (typeof window !== 'undefined') {
    window.StorageService = StorageService;
}