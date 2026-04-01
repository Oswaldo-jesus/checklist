// mapa-quejas.js - Versión con actualización automática

const MapaQuejasView = {
    map: null,
    markers: [],
    
    render() {
        return `
            <div style="height: 70vh; position: relative; background: #f1f5f9; border-radius: 12px; overflow: hidden; margin-top: 16px;">
                <!-- Controles del mapa -->
                <div style="position: absolute; top: 10px; right: 10px; z-index: 10; display: flex; gap: 8px;">
                    <button onclick="MapaQuejasView.centrarMapa()" 
                            style="background: white; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        📍 Centrar mapa
                    </button>
                    <button onclick="MapaQuejasView.actualizarMapa()" 
                            style="background: white; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        🔄 Actualizar
                    </button>
                </div>
                
                <!-- Leyenda -->
                <div style="position: absolute; bottom: 20px; left: 10px; z-index: 10; background: white; padding: 8px 12px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 11px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="display: inline-block; width: 12px; height: 12px; background: #0867ec; border-radius: 50%;"></span>
                        <span>Ubicación de quejas</span>
                    </div>
                </div>
                
                <!-- Contenedor del mapa -->
                <div id="mapa-quejas" style="width: 100%; height: 100%;"></div>
                
                <!-- Estadísticas -->
                <div style="position: absolute; top: 10px; left: 10px; z-index: 10; background: white; padding: 8px 16px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <span id="mapaStats" style="font-size: 12px; font-weight: bold;">Cargando...</span>
                </div>
            </div>
        `;
    },
    
    // Inicializar mapa
    async initMapa() {
        console.log('Inicializando mapa...');
        const mapElement = document.getElementById('mapa-quejas');
        if (!mapElement) {
            console.error('No se encontró el elemento mapa-quejas');
            return;
        }
        
        // Limpiar mapa anterior
        mapElement.innerHTML = '';
        
        // Verificar que Leaflet está cargado
        if (typeof L === 'undefined') {
            console.error('Leaflet no está cargado');
            alert('Error: Leaflet no está cargado. Verifica la conexión a internet.');
            return;
        }
        
        // Inicializar mapa con Leaflet
        this.map = L.map('mapa-quejas').setView([20.588793, -100.389889], 8);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Cargar supervisiones
        await this.cargarSupervisiones();
    },
    
    // Cargar supervisiones y crear marcadores
    async cargarSupervisiones() {
        // Limpiar marcadores anteriores
        if (this.markers.length > 0) {
            this.markers.forEach(marker => this.map.removeLayer(marker));
            this.markers = [];
        }
        
        // Cargar supervisiones desde localStorage
        const supervisiones = JSON.parse(localStorage.getItem('supervisiones') || '[]');
        console.log('Supervisiones cargadas:', supervisiones.length);
        
        let conCoordenadas = 0;
        
        // Crear marcadores para cada supervisión con coordenadas
        supervisiones.forEach(sup => {
            if (sup.coordenadas && sup.coordenadas.lat && sup.coordenadas.lng) {
                conCoordenadas++;
                
                // Crear marcador
                const marker = L.marker([sup.coordenadas.lat, sup.coordenadas.lng]).addTo(this.map);
                
                // Crear popup con información completa
                marker.bindPopup(this.crearPopupContent(sup));
                
                this.markers.push(marker);
            }
        });
        
        // Actualizar estadísticas
        const statsElement = document.getElementById('mapaStats');
        if (statsElement) {
            statsElement.innerHTML = `📍 ${conCoordenadas} ubicaciones encontradas`;
        }
        
        // Si hay coordenadas, centrar el mapa
        if (this.markers.length > 0) {
            const group = L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    },
    
    // Crear contenido del popup
    crearPopupContent(sup) {
        return `
            <div style="min-width: 250px; max-width: 300px;">
                <h4 style="margin: 0 0 8px 0; color: #0867ec; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
                    👨‍🔧 ${sup.nombreSupervisor || 'Sin supervisor'}
                </h4>
                
                <div style="font-size: 12px;">
                    <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${sup.fecha || ''} ${sup.hora || ''}</p>
                    <p style="margin: 5px 0;"><strong>🆔 Pedido:</strong> ${sup.numeroPedido || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>👤 Cliente:</strong> ${sup.nombreCliente || ''}</p>
                    <p style="margin: 5px 0;"><strong>📞 Teléfono:</strong> ${sup.telefonoCliente || ''}</p>
                    
                    <div style="margin: 8px 0; padding: 5px; background: #fef3c7; border-radius: 4px;">
                        <strong>📍 Motivo:</strong> ${sup.motivoQueja || 'No especificado'}
                    </div>
                    
                    <div style="margin: 8px 0; padding: 5px; background: #dcfce7; border-radius: 4px;">
                        <strong>✅ Solución:</strong> ${sup.solucion || 'No especificada'}
                    </div>
                    
                    ${sup.ubicacion ? `
                        <p style="margin: 5px 0;"><strong>📍 Dirección:</strong> ${sup.ubicacion}</p>
                    ` : ''}
                    
                    ${sup.enlaceMaps ? `
                        <div style="margin-top: 8px; text-align: center;">
                            <a href="${sup.enlaceMaps}" target="_blank" style="color: #0867ec; text-decoration: none; font-size: 11px;">
                                🗺️ Ver en Google Maps
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // Centrar mapa en todos los marcadores
    centrarMapa() {
        if (this.markers.length > 0) {
            const group = L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    },
    
    // Actualizar mapa (recargar supervisiones)
    async actualizarMapa() {
        await this.cargarSupervisiones();
    }
};

// Escuchar cambios en localStorage (para actualizar cuando se agregue una nueva supervisión)
window.addEventListener('storage', (e) => {
    if (e.key === 'supervisiones' && App.appState.activeTab === 'mapas') {
        console.log('Nueva supervisión detectada, actualizando mapa...');
        MapaQuejasView.actualizarMapa();
    }
});

// Exportar vista
if (typeof window !== 'undefined') {
    window.MapaQuejasView = MapaQuejasView;
}