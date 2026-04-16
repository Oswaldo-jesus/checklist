// supervision-controller.js - Controlador para el módulo de Supervisión en Campo

const SupervisionController = {
    // Clave de acceso para supervisión
    SUPERVISION_KEY: "nieto2025",
    
    // Variable para almacenar las coordenadas actuales
    currentLocation: {
        lat: null,
        lng: null,
        address: ''
    },

    // Verificar contraseña
    checkPassword() {
        const password = document.getElementById('supervisionPassword').value;
        
        if (password === this.SUPERVISION_KEY) {
            // Obtener ubicación automáticamente al entrar
            this.obtenerUbicacionActual();
            App.goToStep('supervision-form');
        } else {
            alert("❌ Clave incorrecta. La clave es: " + this.SUPERVISION_KEY);
        }
    },

    // Obtener ubicación actual del dispositivo
    obtenerUbicacionActual() {
        if (navigator.geolocation) {
            // Mostrar indicador de carga
            const ubicacionField = document.getElementById('ubicacion');
            if (ubicacionField) {
                ubicacionField.placeholder = "Obteniendo ubicación...";
                ubicacionField.value = "Obteniendo dirección...";
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation.lat = position.coords.latitude;
                    this.currentLocation.lng = position.coords.longitude;
                    
                    // Mostrar coordenadas mientras se obtiene la dirección
                    const ubicacionField = document.getElementById('ubicacion');
                    if (ubicacionField) {
                        ubicacionField.value = `Coordenadas: ${this.currentLocation.lat}, ${this.currentLocation.lng} (obteniendo dirección...)`;
                    }
                    
                    // Obtener dirección a partir de coordenadas
                    this.obtenerDireccionDesdeCoordenadas(
                        this.currentLocation.lat, 
                        this.currentLocation.lng
                    );
                    
                    console.log('Ubicación obtenida:', this.currentLocation);
                },
                (error) => {
                    console.warn('Error obteniendo ubicación:', error);
                    let mensaje = '';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            mensaje = 'Permiso denegado. Activa la ubicación en tu dispositivo.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            mensaje = 'Ubicación no disponible. Verifica tu conexión GPS.';
                            break;
                        case error.TIMEOUT:
                            mensaje = 'Tiempo de espera agotado. Intenta de nuevo.';
                            break;
                    }
                    
                    const ubicacionField = document.getElementById('ubicacion');
                    if (ubicacionField) {
                        ubicacionField.placeholder = mensaje + ' Puedes escribir la dirección manualmente.';
                    }
                    
                    alert('📍 ' + mensaje);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            alert('Tu navegador no soporta geolocalización. Deberás ingresar la ubicación manualmente.');
        }
    },

    // Geocodificación inversa (coordenadas -> dirección) - CORREGIDO
    async obtenerDireccionDesdeCoordenadas(lat, lng) {
        try {
            // Usando Nominatim (OpenStreetMap) - gratuito
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'GenChecklist-App'
                    }
                }
            );
            
            if (!response.ok) throw new Error('Error en geocodificación');
            
            const data = await response.json();
            
            // Extraer dirección formateada
            const direccion = data.display_name || '';
            this.currentLocation.address = direccion;
            
            // Actualizar campo de ubicación
            const ubicacionField = document.getElementById('ubicacion');
            if (ubicacionField) {
                ubicacionField.value = direccion;
                // Actualizar el appState
                App.appState.supervisionData.ubicacion = direccion;
            }
            
            // También actualizar campos de calle, número y colonia si es posible
            if (data.address) {
                // Buscar calle (road, pedestrian, etc.)
                const calle = data.address.road || 
                             data.address.street || 
                             data.address.pedestrian || 
                             data.address.footway || '';
                
                // Buscar número
                const numero = data.address.house_number || '';
                
                // Buscar colonia (suburb, neighbourhood, etc.)
                const colonia = data.address.suburb || 
                               data.address.neighbourhood || 
                               data.address.city_district || 
                               data.address.district || '';
                
                // Actualizar campo calle
                if (calle) {
                    const calleField = document.getElementById('calle');
                    if (calleField) {
                        calleField.value = calle;
                        App.appState.supervisionData.calle = calle;
                    }
                }
                
                // Actualizar campo número
                if (numero) {
                    const numeroField = document.getElementById('numero');
                    if (numeroField) {
                        numeroField.value = numero;
                        App.appState.supervisionData.numero = numero;
                    }
                }
                
                // Actualizar campo colonia
                if (colonia) {
                    const coloniaField = document.getElementById('colonia');
                    if (coloniaField) {
                        coloniaField.value = colonia;
                        App.appState.supervisionData.colonia = colonia;
                    }
                }
            }
            
            console.log('Dirección obtenida:', direccion);
            
        } catch (error) {
            console.error('Error en geocodificación:', error);
            // Si falla, mostrar coordenadas
            const ubicacionField = document.getElementById('ubicacion');
            if (ubicacionField) {
                const coordsText = `Coordenadas: ${lat}, ${lng}`;
                ubicacionField.value = coordsText;
                App.appState.supervisionData.ubicacion = coordsText;
            }
        }
    },

    // Actualizar datos del formulario
    updateFormData(field, value, appState) {
        appState.supervisionData[field] = value;
    },

    // Manejar carga de fotos (MÚLTIPLES)
    handlePhotoUpload(input, appState) {
        const files = Array.from(input.files);
        if (files.length === 0) return;
        
        if (!appState.supervisionData.evidenciasFotos) {
            appState.supervisionData.evidenciasFotos = [];
        }
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 1024;
                    const scale = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    appState.supervisionData.evidenciasFotos.push({
                        id: Date.now() + index,
                        data: canvas.toDataURL('image/jpeg', 0.85),
                        name: file.name
                    });
                    
                    if (index === files.length - 1) {
                        App.render();
                    }
                };
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        });
    },

    // Eliminar foto específica
    removeSpecificPhoto(appState, photoId) {
        if (appState.supervisionData.evidenciasFotos) {
            appState.supervisionData.evidenciasFotos = 
                appState.supervisionData.evidenciasFotos.filter(p => p.id !== photoId);
            App.render();
        }
    },

    // Eliminar todas las fotos
    removePhoto(appState) {
        appState.supervisionData.evidenciasFotos = [];
        App.render();
    },

    // Abrir en Google Maps con ubicación actual - CORREGIDO
    abrirEnMaps() {
        const data = App.appState.supervisionData;
        let query = '';
        
        // Usar coordenadas si están disponibles
        if (this.currentLocation.lat && this.currentLocation.lng) {
            query = `${this.currentLocation.lat},${this.currentLocation.lng}`;
        } 
        // Si no, usar la dirección completa
        else if (data.ubicacion && data.ubicacion !== 'Obteniendo dirección...') {
            query = encodeURIComponent(data.ubicacion);
        } 
        // Por último, construir con calle, número y colonia
        else {
            const calle = data.calle || '';
            const numero = data.numero || '';
            const colonia = data.colonia || '';
            
            if (calle || colonia) {
                const direccionCompleta = `${calle} ${numero}, ${colonia}, Queretaro`.trim();
                query = encodeURIComponent(direccionCompleta);
            } else {
                query = encodeURIComponent('Queretaro');
            }
        }
        
        if (query) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        } else {
            alert('No hay ubicación disponible');
        }
    },

    // Validar formulario
    validateForm(data) {
        const now = new Date();
        if (!data.fecha) {
            data.fecha = now.toISOString().split('T')[0];
        }
        if (!data.hora) {
            data.hora = now.toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        }
        
        if (!data.nombreSupervisor?.trim()) {
            alert('❌ El nombre del supervisor es obligatorio');
            return false;
        }
        
        if (!data.numeroPedido?.trim()) {
            alert('❌ El número de pedido es obligatorio');
            return false;
        }
        
        if (!data.telefonoCliente?.trim()) {
            alert('❌ El teléfono del cliente es obligatorio');
            return false;
        }
        
        if (!data.nombreCliente?.trim()) {
            alert('❌ El nombre del cliente es obligatorio');
            return false;
        }
        
        if (!data.motivoQueja?.trim()) {
            alert('❌ El motivo de la queja es obligatorio');
            return false;
        }
        
        if (!data.solucion?.trim()) {
            alert('❌ La solución brindada es obligatoria');
            return false;
        }
        
        if (!data.firmaSupervisor) {
            alert('❌ La firma del supervisor es obligatoria');
            return false;
        }
        
        return true;
    },

    // Manejar envío del formulario (CORREGIDO - Solo se agregó 1 línea para limpiar el canvas)
    async handleSubmit(e, appState) {
        e.preventDefault();
        
        if (!this.validateForm(appState.supervisionData)) {
            return;
        }

        appState.isSubmitting = true;
        App.render();
        
        const now = new Date();
        const reporte = {
            id: Date.now().toString(),
            tipo: 'supervision',
            ...appState.supervisionData,
            fecha: appState.supervisionData.fecha || now.toISOString().split('T')[0],
            hora: appState.supervisionData.hora || now.toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }),
            coordenadas: {
                lat: this.currentLocation.lat,
                lng: this.currentLocation.lng
            },
            direccionCompleta: this.currentLocation.address || appState.supervisionData.ubicacion,
            timestamp: now.getTime(),
            enlaceMaps: this.currentLocation.lat && this.currentLocation.lng 
                ? `https://www.google.com/maps?q=${this.currentLocation.lat},${this.currentLocation.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appState.supervisionData.ubicacion || '')}`,
            cantidadFotos: appState.supervisionData.evidenciasFotos?.length || 0
        };
        
        setTimeout(async () => {
            try {
                const supervisionesGuardadas = JSON.parse(localStorage.getItem('supervisiones') || '[]');
                supervisionesGuardadas.push(reporte);
                localStorage.setItem('supervisiones', JSON.stringify(supervisionesGuardadas));
                
                // Disparar eventos para actualizar el mapa
                window.dispatchEvent(new Event('supervisionGuardada'));
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'supervisiones',
                    newValue: JSON.stringify(supervisionesGuardadas)
                }));
                
                if (!appState.supervisiones) {
                    appState.supervisiones = [];
                }
                appState.supervisiones.push(reporte);
                
                // Resetear formulario
                appState.supervisionData = {
                    nombreSupervisor: '',
                    fecha: now.toISOString().split('T')[0],
                    hora: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    numeroPedido: '',
                    telefonoCliente: '',
                    nombreCliente: '',
                    calle: '',
                    numero: '',
                    colonia: '',
                    ubicacion: '',
                    motivoQueja: '',
                    comentario: '',
                    solucion: '',
                    evidenciasFotos: [],
                    firmaSupervisor: null
                };
                
                // 🔥 ÚNICA LÍNEA AGREGADA - Limpiar el canvas físicamente
                document.getElementById('supervisionSigCanvas')?.getContext('2d')?.clearRect(0, 0, 300, 150);
                
                this.currentLocation = {
                    lat: null,
                    lng: null,
                    address: ''
                };
                
                appState.isSubmitting = false;
                
                App.goToStep('supervision-success');
                
            } catch (error) {
                console.error('Error al guardar:', error);
                alert('❌ Error al guardar el reporte. Intenta de nuevo.');
                appState.isSubmitting = false;
                App.render();
            }
        }, 1500);
    }
};

// Exportar controlador
if (typeof window !== 'undefined') {
    window.SupervisionController = SupervisionController;
}