// orden-controller.js - Controlador para órdenes de servicio

const OrdenController = {
    // Actualizar datos de la orden
    updateOrdenData(field, value, appState) {
        appState.ordenData[field] = value;
    },
    
    // Alternar punto crítico
    togglePuntoCritico(punto, checked, appState) {
        if (checked) {
            if (!appState.ordenData.puntosCriticos.includes(punto)) {
                appState.ordenData.puntosCriticos.push(punto);
            }
        } else {
            const index = appState.ordenData.puntosCriticos.indexOf(punto);
            if (index > -1) {
                appState.ordenData.puntosCriticos.splice(index, 1);
            }
        }
        App.render();
    },
    
    // Manejar carga de foto para orden
    handlePhotoUpload(input, appState) {
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
                
                appState.ordenData.fotoFalla = canvas.toDataURL('image/jpeg', 0.7);
                
                const preview = document.getElementById('ordenFotoPreview');
                if (preview) {
                    preview.innerHTML = `
                        <img src="${appState.ordenData.fotoFalla}" class="photo-preview">
                        <button type="button" 
                                onclick="OrdenController.removePhoto(App.appState)"
                                style="margin-top: 8px; padding: 8px; background: #dc2626; color: white; border: none; border-radius: 6px; font-size: 12px;">
                            ✕ Eliminar foto
                        </button>
                    `;
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },
    
    // Eliminar foto de orden
    removePhoto(appState) {
        appState.ordenData.fotoFalla = null;
        const preview = document.getElementById('ordenFotoPreview');
        if (preview) {
            preview.innerHTML = '';
        }
    },
    
    // Manejar envío del formulario de orden
    handleSubmit(e, appState) {
        e.preventDefault();
        App.goToStep('orden-verificar');
    },
    
    // Guardar firmas y continuar
    async guardarFirmasYContinuar(appState) {
        if (!appState.firmaTaller || !appState.firmaChofer) {
            alert("Por favor, captura ambas firmas antes de continuar.");
            return;
        }
        
        if (!appState.ordenData.unidad || !appState.ordenData.operador || 
            !appState.ordenData.kilometro || !appState.ordenData.descripcionFalla || 
            !appState.ordenData.trabajoRealizado) {
            alert("Por favor, completa todos los campos obligatorios de la orden.");
            return;
        }
        
        if (!CONFIG.OPERATORS.includes(appState.ordenData.operador)) {
            alert("El Operador ingresado no es válido. Por favor selecciónalo de la lista sugerida.");
            return;
        }
        if (!CONFIG.UNITS.includes(appState.ordenData.unidad)) {
            alert("La Unidad ingresada no es válida. Por favor selecciónala de la lista sugerida.");
            return;
        }
        
        const operatorParts = appState.ordenData.operador.split(':');
        if (operatorParts.length > 1) {
            const correctId = operatorParts[0].trim();
            const inputId = prompt(`🔐 VERIFICACIÓN DE SEGURIDAD\n\nPor favor, ingresa tu NÚMERO DE EMPLEADO para confirmar que eres ${operatorParts[1].trim()}:`);
            
            if (inputId !== correctId) {
                alert("❌ Verificación fallida. El número de empleado ingresado no coincide con el operador seleccionado.");
                return;
            }
        }

        appState.isSubmitting = true;
        
        const now = new Date();
        const fecha = now.toLocaleDateString('es-MX').split('/');
        const fechaFormatted = `${fecha[2]}/${fecha[1]}/${fecha[0]}`;
        
        const orden = {
            folio: appState.ordenData.folio,
            numero: `ORD-${appState.ordenData.folio}`,
            fecha: fechaFormatted,
            hora: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            unidad: appState.ordenData.unidad.toUpperCase(),
            operador: appState.ordenData.operador.toUpperCase(),
            kilometro: parseInt(appState.ordenData.kilometro) || 0,
            horaReporte: appState.ordenData.horaReporte,
            horaTermino: appState.ordenData.horaTermino,
            tiempoMuerto: appState.ordenData.tiempoMuerto,
            mantenimientoLugar: appState.ordenData.mantenimientoLugar,
            tipoMantenimiento: appState.ordenData.tipoMantenimiento,
            descripcionFalla: appState.ordenData.descripcionFalla,
            trabajoRealizado: appState.ordenData.trabajoRealizado,
            puntosCriticos: appState.ordenData.puntosCriticos,
            observaciones: appState.ordenData.observaciones,
            fotoFalla: appState.ordenData.fotoFalla,
            firmaElaboro: OrdenVerificarView.generarFirmaAutomatica(appState.ordenData.operador),
            firmaTaller: appState.firmaTaller,
            firmaChofer: appState.firmaChofer,
            timestamp: now.getTime(),
            estado: 'pendiente'
        };
        
        setTimeout(async () => {
            const saved = await StorageService.saveOrden(orden);
            
            if (saved) {
                // Resetear datos
                appState.ordenData = { 
                    unidad: '',
                    operador: '',
                    kilometro: '',
                    fecha: new Date().toISOString().split('T')[0],
                    folio: Math.floor(Math.random() * 900000 + 100000).toString(),
                    horaReporte: '',
                    horaTermino: '',
                    tiempoMuerto: '',
                    mantenimientoLugar: 'taller',
                    tipoMantenimiento: 'correctivo',
                    descripcionFalla: '',
                    trabajoRealizado: '',
                    puntosCriticos: [],
                    observaciones: '',
                    firmaChofer: null,
                    firmaTaller: null,
                    firmaElaboro: null,
                    fotoFalla: null
                };
                
                // 🔥 Limpiar los canvas físicamente
                const tallerCanvas = document.getElementById('firmaTallerCanvas');
                if (tallerCanvas) {
                    const ctx = tallerCanvas.getContext('2d');
                    ctx.clearRect(0, 0, tallerCanvas.width, tallerCanvas.height);
                }
                
                const choferCanvas = document.getElementById('firmaChoferCanvas');
                if (choferCanvas) {
                    const ctx = choferCanvas.getContext('2d');
                    ctx.clearRect(0, 0, choferCanvas.width, choferCanvas.height);
                }
                
                appState.firmaTaller = null;
                appState.firmaChofer = null;
                appState.isSubmitting = false;
                
                const numeroSupervisor = "524423935004"; 
                const text = `🚨 *NUEVA ORDEN DE SERVICIO*\n\nFolio: ${orden.folio}\nUnidad: ${orden.unidad}\nOperador: ${orden.operador}\n\n*Falla Reportada:*\n${orden.descripcionFalla}`;
                const url = `https://wa.me/${numeroSupervisor}?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
                
                App.goToStep('orden-success');
            } else {
                alert("Error al guardar la orden. Intenta de nuevo.");
                appState.isSubmitting = false;
                App.render();
            }
        }, 1000);
    }
};

// Exportar controlador para uso global
if (typeof window !== 'undefined') {
    window.OrdenController = OrdenController;
}