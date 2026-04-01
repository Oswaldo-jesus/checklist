// form-controller.js - Controlador para el formulario de checklist

const FormController = {
    // Actualizar datos del formulario
    updateFormData(field, value, appState) {
        appState.formData[field] = value;
        
        // Si cambia el tipo de ruta, reiniciar evaluaciones y limpiar la ruta seleccionada
        if (field === 'tipoRuta') {
            appState.evaluations = {};
            appState.formData.ruta = ''; // Limpiar la ruta seleccionada
            App.render();
        }
    },
    
    // Establecer evaluación de un punto
    setEvaluation(pointId, status, appState) {
        appState.evaluations[pointId] = status;
        
        // Si se cambia a aprobado, eliminar foto si existe
        if (status === 'aprobado' && appState.photos[pointId]) {
            delete appState.photos[pointId];
        }
        
        App.render();
    },
    
    // Manejar carga de fotos
    handlePhotoUpload(pointId, input, appState) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const maxWidth = 400;
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                appState.photos[pointId] = canvas.toDataURL('image/jpeg', 0.7);
                App.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },
    
    // Eliminar foto
    removePhoto(pointId, appState) {
        delete appState.photos[pointId];
        App.render();
    },
    
    // Manejar envío del formulario
    async handleSubmit(e, appState) {
        e.preventDefault();
        
        // Validaciones
        if (!appState.formData.tipoRuta) {
            alert("Por favor, selecciona el tipo de ruta.");
            return;
        }
        
        if (!appState.formData.operador || !appState.formData.eco || 
            !appState.formData.km || !appState.formData.ruta) {
            alert("Por favor, completa todos los campos de información.");
            return;
        }
        
        // Validar respaldo de datos (Catálogos)
        if (!CONFIG.OPERATORS.includes(appState.formData.operador)) {
            alert("El Operador ingresado no es válido. Por favor selecciónalo de la lista sugerida.");
            return;
        }
        if (!CONFIG.UNITS.includes(appState.formData.eco)) {
            alert("La Unidad ingresada no es válida. Por favor selecciónala de la lista sugerida.");
            return;
        }
        
        // Validar que la ruta seleccionada sea válida para el tipo
        const rutasValidas = CONFIG.getRoutesByType(appState.formData.tipoRuta);
        if (!rutasValidas.includes(appState.formData.ruta)) {
            alert(`La ruta seleccionada no es válida para el tipo ${appState.formData.tipoRuta}. Por favor selecciona una de la lista.`);
            return;
        }
        
        // Obtener puntos de inspección según el tipo de ruta
        const inspectionPoints = CONFIG.getInspectionPointsByRouteType(appState.formData.tipoRuta);
        
        // Verificar puntos críticos
        const puntosCriticos = inspectionPoints.filter(p => p.critical);
        const puntosCriticosAprobados = puntosCriticos.filter(p => 
            appState.evaluations[p.id] === 'aprobado'
        );
        
        if (puntosCriticosAprobados.length < puntosCriticos.length) {
            const confirmar = confirm("No todos los puntos críticos están aprobados. ¿Deseas continuar de todas formas?");
            if (!confirmar) return;
        }
        
        if (!appState.signature) {
            alert("Por favor, firma el documento de conformidad.");
            return;
        }
        
        // --- VERIFICACIÓN ESTRICTA DE USUARIO ---
        // Extraer ID del operador seleccionado (Formato "ID: NOMBRE")
        const operatorParts = appState.formData.operador.split(':');
        if (operatorParts.length > 1) {
            const correctId = operatorParts[0].trim();
            const inputId = prompt(`🔐 VERIFICACIÓN DE SEGURIDAD\n\nPor favor, ingresa tu NÚMERO DE EMPLEADO para confirmar que eres ${operatorParts[1].trim()}:`);
            
            if (inputId !== correctId) {
                alert("❌ Verificación fallida. El número de empleado ingresado no coincide con el operador seleccionado.");
                return;
            }
        }

        // Mostrar estado de envío
        appState.isSubmitting = true;
        App.render();
        
        // Crear reporte
        const now = new Date();
        const report = {
            tipoRuta: appState.formData.tipoRuta,
            operador: appState.formData.operador.toUpperCase(),
            ecoUnidad: appState.formData.eco.toUpperCase(),
            km: parseInt(appState.formData.km),
            ruta: appState.formData.ruta.toUpperCase(),
            evaluaciones: { ...appState.evaluations },
            fotos: { ...appState.photos },
            observaciones: appState.formData.observaciones || '',
            firma: appState.signature,
            fecha: now.toLocaleDateString('es-MX'),
            hora: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            timestamp: now.getTime()
        };
        
        // Simular delay de envío
        setTimeout(async () => {
            // Guardar localmente
            const saved = await StorageService.saveReport(report);
            
            if (saved) {
                // Resetear formulario
                appState.evaluations = {};
                appState.photos = {};
                appState.signature = null;
                appState.formData = { 
                    tipoRuta: '', 
                    operador: '', 
                    eco: '', 
                    km: '', 
                    ruta: '', 
                    observaciones: '' 
                };
                appState.isSubmitting = false;
                
                // Ir a pantalla de éxito
                App.goToStep('success');
            } else {
                alert("Error al guardar el reporte. Intenta de nuevo.");
                appState.isSubmitting = false;
                App.render();
            }
        }, 1000);
    }
};

// Exportar controlador para uso global
if (typeof window !== 'undefined') {
    window.FormController = FormController;
}