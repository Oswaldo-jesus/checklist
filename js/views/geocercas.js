// geocercas.js - Vista de geocercas con filtros mejorados

const GeocercasView = {
    render() {
        return `
            <div style="height: 100vh; display: flex; flex-direction: column;">
                <!-- Header -->
                <div class="header" style="padding: 8px 12px; flex-shrink: 0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="${CONFIG.LOGO_URL}" alt="Logo" style="height: 30px;">
                        <div class="logo" style="font-size: 16px;">Geocercas de Rutas</div>
                    </div>
                    <button onclick="App.goToStep('home')" 
                            style="background: none; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 12px;">
                        ✕ Cerrar
                    </button>
                </div>
                
                <!-- Contenedor principal con botones a la izquierda y mapa a la derecha -->
                <div style="display: flex; flex: 1; overflow: hidden;">
                    <!-- Panel de botones a la izquierda -->
                    <div style="width: 280px; background: white; border-right: 2px solid #e2e8f0; overflow-y: auto; padding: 16px;">
                        <h3 style="color: #1e293b; margin-bottom: 20px; font-size: 16px;">🗺️ Filtros de Rutas</h3>
                        
                        <!-- Botón Todas las rutas -->
                        <button onclick="GeocercasView.filterRoutes('all')" 
                                style="width: 100%; background: #1e40af; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; margin-bottom: 20px;">
                            🗺️ TODAS LAS RUTAS
                        </button>
                        
                        <!-- FILTROS POR TURNO (MATUTINO/VESPERTINO) -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 10px; font-size: 14px;">⏰ TURNOS</div>
                            <button onclick="GeocercasView.filterRoutes('matutino')" 
                                    style="width: 100%; background: #FFA500; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                                <span>🌅 MATUTINO</span>
                                <span style="background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 12px; font-size: 12px;"></span>
                            </button>
                            <button onclick="GeocercasView.filterRoutes('vespertino')" 
                                    style="width: 100%; background: #4B0082; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                                <span>🌆 VESPERTINO</span>
                                <span style="background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 12px; font-size: 12px;"></span>
                            </button>
                        </div>
                        
                        <!-- FILTROS POR TIPO (CILINDROS/AUTOTANQUE) -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 10px; font-size: 14px;">🚗 TIPO DE UNIDAD</div>
                            <button onclick="GeocercasView.filterRoutes('cilindros')" 
                                    style="width: 100%; background: #FF6B6B; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                                <span>🚛 CILINDROS</span>
                                <span style="background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 12px; font-size: 12px;"></span>
                            </button>
                            <button onclick="GeocercasView.filterRoutes('autotanque')" 
                                    style="width: 100%; background: #FFA07A; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                                <span>⛽ AUTOTANQUE</span>
                                <span style="background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 12px; font-size: 12px;"></span>
                            </button>
                        </div>
                        
                        <!-- Supervisores específicos -->
                        <div style="margin-top: 10px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 10px; font-size: 14px;">👤 SUPERVISORES</div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <button onclick="GeocercasView.filterRoutes('supervisor-roberto')" 
                                        style="background: #FF6B6B; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    ROBERTO (12 rutas)
                                </button>
                                <button onclick="GeocercasView.filterRoutes('supervisor-guadalupe')" 
                                        style="background: #4ECDC4; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    GUADALUPE (11 rutas)
                                </button>
                                <button onclick="GeocercasView.filterRoutes('supervisor-arturo')" 
                                        style="background: #45B7D1; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    ARTURO (12 rutas)
                                </button>
                                <button onclick="GeocercasView.filterRoutes('supervisor-alberto')" 
                                        style="background: #96CEB4; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    ALBERTO (10 rutas)
                                </button>
                                <button onclick="GeocercasView.filterRoutes('supervisor-carlos')" 
                                        style="background: #FFA07A; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    CARLOS B. (14 rutas)
                                </button>
                                <button onclick="GeocercasView.filterRoutes('supervisor-ilsse')" 
                                        style="background: #98D8C8; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    ILSSE Q. (12 rutas)
                                </button>
                                <button onclick="GeocercasView.filterRoutes('supervisor-julio')" 
                                        style="background: #F7DC6F; color: #333; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    JULIO M. (11 rutas)
                                </button>
                            </div>
                        </div>
                        
                        <!-- Contador de rutas -->
                        <div id="routesCount" style="margin-top: 20px; padding: 10px; background: #f8fafc; border-radius: 6px; font-size: 12px; color: #64748b; text-align: center;">
                            Total: 95 rutas visibles
                        </div>
                    </div>
                    
                    <!-- Contenedor del mapa a la derecha -->
                    <div style="flex: 1; position: relative; background: #f1f5f9;">
                        <!-- Etiqueta arriba del mapa -->
                        <div style="position: absolute; top: 10px; left: 0; right: 0; z-index: 10; display: flex; justify-content: center; pointer-events: none;">
                            <div style="background: rgba(0, 0, 0, 0.7); color: white; padding: 8px 20px; border-radius: 30px; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                                <p id="mapLabel" style="font-size: 14px; margin: 0; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                                    <span style="color: #ffd700;">📍</span> 
                                    <span>Geocercas: Rutas de pipas y cilindros</span>
                                </p>
                            </div>
                        </div>
                        
                        <!-- Mapa (iframe original) -->
                        <iframe src="https://www.google.com/maps/d/embed?mid=1eVQ_3M99VxUlduPSb9g2uizU0sCZwwg&ehbc=2E312F" 
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                                allowfullscreen=""
                                loading="lazy"
                                referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                        
                        <!-- Botón para abrir en Google Maps -->
                        <div style="position: absolute; bottom: 20px; right: 20px; z-index: 10;">
                            <a href="https://www.google.com/maps/d/viewer?mid=1eVQ_3M99VxUlduPSb9g2uizU0sCZwwg" 
                               target="_blank"
                               style="display: inline-block; background: #1e40af; color: white; padding: 10px 16px; border-radius: 30px; text-decoration: none; font-size: 14px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                                🗺️ Abrir en Google Maps
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Barra inferior -->
                <div style="background: white; padding: 8px 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; flex-shrink: 0;">
                    <p style="margin: 0;">Desliza para ver todas las rutas • Usa dos dedos para hacer zoom</p>
                </div>
            </div>
        `;
    },

    // Función para filtrar rutas
    filterRoutes(filterType) {
        // Actualizar el contador según el filtro seleccionado
        const counts = {
            'all': 95,
            'matutino': 71,
            'vespertino': 24,
            'cilindros': 48,
            'autotanque': 47,
            'supervisor-roberto': 12,
            'supervisor-guadalupe': 11,
            'supervisor-arturo': 12,
            'supervisor-alberto': 10,
            'supervisor-carlos': 14,
            'supervisor-ilsse': 12,
            'supervisor-julio': 11
        };
        
        const count = counts[filterType] || 0;
        document.getElementById('routesCount').innerHTML = `Total: ${count} rutas visibles`;
        
        // Actualizar la etiqueta del mapa
        const mapLabel = document.getElementById('mapLabel').querySelector('span:nth-child(2)');
        if (mapLabel) {
            const labels = {
                'all': 'Geocercas: Rutas de pipas y cilindros',
                'matutino': '🌅 Turno MATUTINO - Todas las rutas',
                'vespertino': '🌆 Turno VESPERTINO - Todas las rutas',
                'cilindros': '🚛 CILINDROS - Todas las rutas',
                'autotanque': '⛽ AUTOTANQUE - Todas las rutas',
                'supervisor-roberto': '👤 Supervisor ROBERTO - Cilindros Oriente',
                'supervisor-guadalupe': '👤 Supervisor GUADALUPE - Cilindros Sur',
                'supervisor-arturo': '👤 Supervisor ARTURO - Cilindros Poniente',
                'supervisor-alberto': '👤 Supervisor ALBERTO - Cilindros Vespertino',
                'supervisor-carlos': '👤 Supervisor CARLOS B. - Autotanque Vespertino',
                'supervisor-ilsse': '👤 Supervisor ILSSE Q. - Autotanque Poniente',
                'supervisor-julio': '👤 Supervisor JULIO M. - Autotanque Sur'
            };
            mapLabel.textContent = labels[filterType] || labels.all;
        }
        
        console.log('Filtrando por:', filterType);
    }
};

// Exportar vista para uso global
if (typeof window !== 'undefined') {
    window.GeocercasView = GeocercasView;
}