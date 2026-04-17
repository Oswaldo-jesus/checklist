// geocercas.js - Vista de geocercas con filtros mejorados

const GeocercasView = {
    map: null,
    currentKmlLayer: null,
    allKmlData: null, // Guardaremos los datos en memoria para filtrar súper rápido
    currentFilter: 'all',

    render() {
        return `
            <style>
                .geo-layout { display: flex; flex: 1; overflow: hidden; flex-direction: row; }
                .geo-sidebar { width: 280px; background: white; border-right: 1px solid #e2e8f0; overflow-y: auto; padding: 20px; box-shadow: 2px 0 10px rgba(0,0,0,0.03); z-index: 20; display: flex; flex-direction: column; }
                .geo-map-container { flex: 1; position: relative; background: #f1f5f9; }
                .route-item-hover:hover { background: #e2e8f0 !important; color: #1e293b !important; transform: translateX(2px); }
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                @media (max-width: 768px) {
                    .geo-layout { flex-direction: column-reverse; } /* En móvil: filtros abajo, mapa arriba */
                    .geo-sidebar { width: 100%; flex: 1; border-right: none; border-top: 1px solid #e2e8f0; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); padding: 15px; }
                    .geo-map-container { height: 50vh; flex: none; } /* El mapa toma la mitad superior estática */
                }
            </style>
            <div style="height: 100vh; display: flex; flex-direction: column;">
                <!-- Header -->
                <div class="header" style="background: #1e40af; border-bottom: none; padding: 8px 12px; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="toggleMenu()" class="btn-icon" style="color: white; font-size: 26px;">
                            <i class='bx bx-menu'></i>
                        </button>
                        <img src="${CONFIG.LOGO_URL}" onclick="toggleMenu()" alt="Logo" style="height: 35px; cursor: pointer; object-fit: contain;">
                        <div class="logo" style="font-weight: 600; font-size: 16px; color: white;">Mapas y Rutas</div>
                    </div>
                    <button onclick="App.goToStep('home')" class="btn-icon" title="Volver al inicio" style="color: white;">
                        <i class='bx bx-home-alt' style="font-size: 24px;"></i>
                    </button>
                </div>
                
                <!-- Contenedor principal con layout responsivo -->
                <div class="geo-layout">
                    <!-- Panel de botones -->
                    <div class="geo-sidebar">
                        <h3 style="color: #475569; margin-bottom: 24px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Filtros de Búsqueda</h3>
                        
                        <!-- Buscador por Texto -->
                        <div style="margin-bottom: 20px;">
                            <div style="position: relative; display: flex; align-items: center;">
                                <i class='bx bx-search' style="position: absolute; left: 12px; color: #64748b; font-size: 18px;"></i>
                                <input type="text" id="route-search-input" onkeyup="GeocercasView.applySearch()" placeholder="Buscar ruta exacta (ej. R 10)..." style="width: 100%; padding: 12px 35px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #f8fafc; outline: none; transition: border-color 0.2s;">
                                <i class='bx bx-x' onclick="GeocercasView.clearSearch()" style="position: absolute; right: 12px; color: #94a3b8; font-size: 22px; cursor: pointer; transition: color 0.2s; padding: 2px;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'" title="Limpiar búsqueda"></i>
                            </div>
                        </div>

                        <!-- Botón Todas las rutas -->
                        <button id="btn-filter-all" onclick="GeocercasView.filterRoutes('all')" class="menu-item filter-btn"
                                style="width: 100%; background: #1e40af; color: white; border: none; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(30, 64, 175, 0.2);">
                            <i class='bx bx-globe'></i> TODAS LAS RUTAS
                        </button>
                        
                        <!-- FILTROS POR OPERACIÓN -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-weight: 600; color: #64748b; margin-bottom: 12px; font-size: 12px; display: flex; align-items: center; gap: 6px;"><i class='bx bx-sitemap'></i> OPERACIÓN</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <button id="btn-filter-cilindros-matutino" onclick="GeocercasView.filterRoutes('cilindros-matutino')" class="menu-item filter-btn"
                                        style="background: #ef4444; color: white; border: none; padding: 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">
                                    <i class='bx bx-sun' style="display: block; margin: 0 auto 4px; font-size: 16px;"></i>Cilindros Mat.
                                </button>
                                <button id="btn-filter-cilindros-vespertino" onclick="GeocercasView.filterRoutes('cilindros-vespertino')" class="menu-item filter-btn"
                                        style="background: #ef4444; color: white; border: none; padding: 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">
                                    <i class='bx bx-moon' style="display: block; margin: 0 auto 4px; font-size: 16px;"></i>Cilindros Vesp.
                                </button>
                                <button id="btn-filter-autotanque-matutino" onclick="GeocercasView.filterRoutes('autotanque-matutino')" class="menu-item filter-btn"
                                        style="background: #f97316; color: white; border: none; padding: 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">
                                    <i class='bx bx-sun' style="display: block; margin: 0 auto 4px; font-size: 16px;"></i>Autotanque Mat.
                                </button>
                                <button id="btn-filter-autotanque-vespertino" onclick="GeocercasView.filterRoutes('autotanque-vespertino')" class="menu-item filter-btn"
                                        style="background: #f97316; color: white; border: none; padding: 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;">
                                    <i class='bx bx-moon' style="display: block; margin: 0 auto 4px; font-size: 16px;"></i>Autotanque Vesp.
                                </button>
                            </div>
                        </div>
                        
                        <!-- Supervisores específicos -->
                        <div style="margin-top: 10px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
                            
                            <!-- Matutino -->
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 8px; font-size: 13px;">☀️ SUPERVISORES MATUTINO</div>
                            <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px;">
                                <button id="btn-filter-supervisor-roberto" onclick="GeocercasView.filterRoutes('supervisor-roberto')" class="filter-btn"
                                        style="background: #FF6B6B; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    ROBERTO (12 rutas)
                                </button>
                                <button id="btn-filter-supervisor-guadalupe" onclick="GeocercasView.filterRoutes('supervisor-guadalupe')" class="filter-btn"
                                        style="background: #4ECDC4; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    GUADALUPE (11 rutas)
                                </button>
                                <button id="btn-filter-supervisor-arturo" onclick="GeocercasView.filterRoutes('supervisor-arturo')" class="filter-btn"
                                        style="background: #45B7D1; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    ARTURO (12 rutas)
                                </button>
                                <button id="btn-filter-supervisor-ilsse" onclick="GeocercasView.filterRoutes('supervisor-ilsse')" class="filter-btn"
                                        style="background: #98D8C8; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    ILSSE Q. (12 rutas)
                                </button>
                                <button id="btn-filter-supervisor-julio" onclick="GeocercasView.filterRoutes('supervisor-julio')" class="filter-btn"
                                        style="background: #F7DC6F; color: #333; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    JULIO M. (11 rutas)
                                </button>
                            </div>

                            <!-- Vespertino -->
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 8px; font-size: 13px;">🌙 SUPERVISORES VESPERTINO</div>
                            <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px;">
                                <button id="btn-filter-supervisor-alberto" onclick="GeocercasView.filterRoutes('supervisor-alberto')" class="filter-btn"
                                        style="background: #96CEB4; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    ALBERTO (10 rutas)
                                </button>
                                <button id="btn-filter-supervisor-carlos" onclick="GeocercasView.filterRoutes('supervisor-carlos')" class="filter-btn"
                                        style="background: #FFA07A; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    CARLOS B. (14 rutas)
                                </button>
                            </div>
                            
                            <!-- Sin Asignar -->
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 8px; font-size: 13px;">⚠️ SIN ASIGNAR</div>
                            <div style="display: flex; flex-direction: column; gap: 5px;">
                                <button id="btn-filter-supervisor-vacante" onclick="GeocercasView.filterRoutes('supervisor-vacante')" class="filter-btn"
                                        style="background: #94a3b8; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    VACANTE (11 rutas)
                                </button>
                                <button id="btn-filter-supervisor-pendiente" onclick="GeocercasView.filterRoutes('supervisor-pendiente')" class="filter-btn"
                                        style="background: #d97706; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                                    PENDIENTES
                                </button>
                            </div>
                        </div>
                        
                        <!-- Contenedor dinámico para la lista de rutas (Acordeón) -->
                        <div id="routes-list-container" class="custom-scroll" style="display: none; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1px dashed #cbd5e1; margin-top: -2px; margin-bottom: 8px; overflow-y: auto; max-height: 250px;"></div>

                        <!-- Contador de rutas -->
                        <div id="routesCount" style="margin-top: 30px; padding: 12px; background: #f1f5f9; border-radius: 8px; font-size: 12px; font-weight: 500; color: #475569; text-align: center; border: 1px dashed #cbd5e1;">
                            Total: 95 rutas visibles
                        </div>
                    </div>
                    
                    <!-- Contenedor del mapa -->
                    <div class="geo-map-container">
                        <!-- Etiqueta arriba del mapa -->
                        <div style="position: absolute; top: 10px; left: 0; right: 0; z-index: 10; display: flex; justify-content: center; pointer-events: none;">
                            <div style="background: rgba(0, 0, 0, 0.7); color: white; padding: 8px 20px; border-radius: 30px; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                                <p id="mapLabel" style="font-size: 14px; margin: 0; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                                    <i class='bx bxs-map-pin' style="color: #fbbf24; font-size: 18px;"></i>
                                    <span>Geocercas: Rutas de pipas y cilindros</span>
                                </p>
                            </div>
                        </div>
                        
                        <!-- Botón para abrir en Google Maps -->
                        <div style="position: absolute; bottom: 20px; right: 20px; z-index: 10;">
                            <button onclick="GeocercasView.centrarMapa()" 
                               style="display: inline-flex; align-items: center; gap: 8px; background: #1e40af; color: white; border: none; padding: 12px 20px; border-radius: 30px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3); cursor: pointer; transition: all 0.2s;">
                                <i class='bx bx-target-lock' style="font-size: 18px;"></i> Centrar Mapa
                            </button>
                        </div>

                        <!-- Contenedor del Mapa Leaflet -->
                        <!-- AÑADIDO: Overlay de carga -->
                        <div id="map-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; background: rgba(241, 245, 249, 0.8); display: flex; flex-direction: column; justify-content: center; align-items: center; backdrop-filter: blur(2px); transition: opacity 0.3s;">
                            <div class="spinner"></div>
                            <p style="margin-top: 10px; font-weight: 500; color: #475569;">Cargando rutas...</p>
                        </div>
                        <div id="mapa-geocercas-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;"></div>
                    </div>
                </div>
                
                <!-- Barra inferior -->
                <div style="background: white; padding: 8px 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; flex-shrink: 0;">
                    <p style="margin: 0;">Desliza para ver todas las rutas • Usa dos dedos para hacer zoom</p>
                </div>
            </div>
        `;
    },

    // Inicializar el mapa de Leaflet
    initMap() {
        const mapContainer = document.getElementById('mapa-geocercas-container');
        if (!mapContainer) return;
        
        // Limpiar instancia previa si existe
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        
        // Coordenadas de Querétaro
        this.map = L.map('mapa-geocercas-container').setView([20.588793, -100.389889], 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        // Cargar mapa por defecto
        this.filterRoutes('all');
        
        // Forzar actualización del tamaño del mapa tras renderizar la UI en móviles
        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 300);
    },

    centrarMapa() {
        if (this.map && this.currentKmlLayer) {
            this.map.fitBounds(this.currentKmlLayer.getBounds());
        } else if (this.map) {
            this.map.setView([20.588793, -100.389889], 11);
        }
    },

    centrarRuta(routeName) {
        if (!this.currentKmlLayer || !this.map) return;
        
        this.currentKmlLayer.eachLayer(layer => {
            if (layer.feature && (layer.feature.properties.name || '').trim() === routeName) {
                // Hacer zoom al polígono específico
                this.map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 14 });
                // Abrir su popup de información
                layer.openPopup();
            }
        });
    },

    // Función para filtrar rutas
    filterRoutes(filterType, fromSearch = false) {
        this.currentFilter = filterType;
        
        // Limpiar buscador si el usuario hace clic manualmente en un botón
        if (!fromSearch) {
            const searchInput = document.getElementById('route-search-input');
            if (searchInput) searchInput.value = '';
        }

        // Actualizar UI de los botones (efecto de selección)
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.boxShadow = 'none';
            btn.style.transform = 'scale(0.98)';
        });
        
        const activeBtn = document.getElementById(`btn-filter-${filterType}`);
        if (activeBtn) {
            activeBtn.style.opacity = '1';
            activeBtn.style.transform = 'scale(1)';
            activeBtn.style.boxShadow = '0 0 0 2px #f1f5f9, 0 0 0 4px #0f172a';
            if(filterType === 'all') {
                activeBtn.style.boxShadow = '0 4px 6px rgba(30, 64, 175, 0.2), 0 0 0 2px #f1f5f9, 0 0 0 4px #0f172a';
            }
        }

        // Mover el contenedor de la lista de rutas debajo del botón activo
        const listContainer = document.getElementById('routes-list-container');
        if (activeBtn && listContainer) {
            activeBtn.insertAdjacentElement('afterend', listContainer);
            listContainer.style.display = filterType === 'all' ? 'none' : 'block';
            listContainer.innerHTML = '<div style="text-align: center; font-size: 11px; color: #64748b; padding: 10px;">Cargando rutas...</div>';
        }

        // Actualizar el contador según el filtro seleccionado
        const counts = {
            'all': 95,
            'cilindros-matutino': 38,
            'cilindros-vespertino': 10,
            'autotanque-matutino': 33,
            'autotanque-vespertino': 14,
            'supervisor-roberto': 12,
            'supervisor-guadalupe': 11,
            'supervisor-arturo': 12,
            'supervisor-alberto': 10,
            'supervisor-carlos': 14,
            'supervisor-ilsse': 12,
            'supervisor-julio': 11,
            'supervisor-vacante': 11,
            'supervisor-pendiente': '?'
        };
        
        const count = counts[filterType] || '?';
        document.getElementById('routesCount').innerHTML = `Total: ${count} rutas visibles`;
        
        // Actualizar la etiqueta del mapa
        const mapLabel = document.querySelector('#mapLabel span:nth-child(2)');
        if (mapLabel) {
            const labels = {
                'all': 'Geocercas: Rutas de pipas y cilindros',
                'cilindros-matutino': '🚛 Cilindros - Turno Matutino',
                'cilindros-vespertino': '🚛 Cilindros - Turno Vespertino',
                'autotanque-matutino': '⛽ Autotanque - Turno Matutino',
                'autotanque-vespertino': '⛽ Autotanque - Turno Vespertino',
                'supervisor-roberto': '👤 Supervisor ROBERTO - Cilindros Oriente',
                'supervisor-guadalupe': '👤 Supervisor GUADALUPE - Cilindros Sur',
                'supervisor-arturo': '👤 Supervisor ARTURO - Cilindros Poniente',
                'supervisor-alberto': '👤 Supervisor ALBERTO - Cilindros Vespertino',
                'supervisor-carlos': '👤 Supervisor CARLOS B. - Autotanque Vespertino',
                'supervisor-ilsse': '👤 Supervisor ILSSE Q. - Autotanque Poniente',
                'supervisor-julio': '👤 Supervisor JULIO M. - Autotanque Sur',
                'supervisor-vacante': '👤 VACANTE - Rutas sin supervisor asignado',
                'supervisor-pendiente': '👤 PENDIENTES - Rutas pendientes de asignación'
            };
            mapLabel.textContent = labels[filterType] || labels.all;
        }
        
        console.log('Filtrando por:', filterType);
        this.loadAndFilterRoutes(filterType);
    },

    // Función al escribir en el buscador
    applySearch() {
        const searchInput = document.getElementById('route-search-input');
        if (searchInput && searchInput.value.trim() !== '') {
            // Si el usuario escribe, forzamos la vista a "Todas las rutas" para que busque globalmente
            if (this.currentFilter !== 'all') {
                this.filterRoutes('all', true);
                return; // filterRoutes ya llama a applyFilter internamente
            }
        }
        this.applyFilter(this.currentFilter);
    },

    // Limpiar el buscador rápidamente
    clearSearch() {
        const searchInput = document.getElementById('route-search-input');
        if (searchInput) {
            searchInput.value = '';
            this.applySearch(); // Vuelve a ejecutar la búsqueda vacía para restaurar la vista
        }
    },

    // Carga el KML solo una vez y luego aplica los filtros
    loadAndFilterRoutes(filterType) {
        // Si ya tenemos los datos descargados, solo aplicamos el filtro en memoria
        if (this.allKmlData) {
            this.applyFilter(filterType);
            return;
        }

        if (!this.map || typeof omnivore === 'undefined') return;

        // Mostrar el spinner de carga
        const loader = document.getElementById('map-loader');
        if (loader) {
            loader.innerHTML = `<div class="spinner"></div><p style="margin-top: 10px; font-weight: 500; color: #475569;">Descargando mapa base...</p>`;
            loader.style.display = 'flex';
        }

        const kmlUrl = `${CONFIG.SUPABASE.URL}/storage/v1/object/public/mapas/GEOCERCAS QUERETARO.kml`; // Apuntando al nombre de archivo exacto

        // Parsear el KML y guardarlo en formato GeoJSON en memoria
        omnivore.kml(kmlUrl)
            .on('ready', (layer) => {
                this.allKmlData = layer.target.toGeoJSON();
                if (loader) loader.style.display = 'none';
                
                // Una vez cargados los datos, aplicar el filtro seleccionado
                this.applyFilter(filterType);
            })
            .on('error', (err) => {
                if (loader) {
                    loader.innerHTML = `<p style="color: #dc2626; font-weight: bold; text-align: center; padding: 20px;">❌ Error:<br>No se encontró el archivo principal.<br>Asegúrate de subir el archivo KML con todas las rutas a Supabase.</p>`;
                    loader.style.display = 'flex';
                }
                console.error(`Error cargando KML:`, err);
            });
    },

    // Aplica el filtro buscando dentro de la descripción y el nombre
    applyFilter(filterType) {
        if (!this.allKmlData) return;

        if (this.currentKmlLayer) {
            this.map.removeLayer(this.currentKmlLayer);
        }

        // Filtrar polígonos
        const filteredFeatures = this.allKmlData.features.filter(feature => {
            if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') return false;
            
            const searchInput = document.getElementById('route-search-input');
            const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
            
            const name = (feature.properties.name || '').toLowerCase();
            
            // Si hay texto de búsqueda, la ruta DEBE coincidir con lo que el usuario escribe
            if (searchText && !name.includes(searchText)) return false;
            
            if (filterType === 'all') return true;
            
            const desc = (feature.properties.description || '').toLowerCase();
            // Leemos el nuevo campo SUPERVISOR de los datos del KML
            const supervisorData = (feature.properties.SUPERVISOR || '').toLowerCase();
            
            // Búsqueda del nombre del supervisor dentro de la DESCRIPCIÓN
            if (filterType.startsWith('supervisor-')) {
                const supervisor = filterType.split('-')[1]; // ej: "roberto"
                // Ahora busca en el campo de datos específico, que es más preciso
                return supervisorData.includes(supervisor);
            }
            
            // Lista definitiva de rutas vespertinas
            const rutasVespertinas = ['r 53', 'r 54', 'r 56', 'r 57', 'r 58', 'r 59', 'r 60', 'r 66', 'r 79', 'r 82', 'm 15', 'm 18', 'm 19', 'm 25', 'm 36', 'm 38', 'm 39', 'm 43', 'm 44', 'm 45', 'm 47', 'm 48', 'm 57', 'm 66'];
            const isVespertino = rutasVespertinas.includes(name.trim());
            const isCilindro = name.startsWith('r') || name.startsWith('c');
            const isAutotanque = name.startsWith('m');

            // Filtros de Operación Segmentados
            if (filterType === 'cilindros-matutino') return isCilindro && !isVespertino;
            if (filterType === 'cilindros-vespertino') return isCilindro && isVespertino;
            if (filterType === 'autotanque-matutino') return isAutotanque && !isVespertino;
            if (filterType === 'autotanque-vespertino') return isAutotanque && isVespertino;
            
            // Si se busca "supervisor-pendiente" y la ruta no tiene supervisor asignado o está vacía
            if (filterType === 'supervisor-pendiente') return !supervisorData || supervisorData.trim() === '';
            
            // Filtros generales (si se quisieran re-agregar)
            // if (filterType === 'cilindros') return isCilindro;
            // if (filterType === 'autotanque') return isAutotanque;
            
            return false;
        });

        // Dibujar polígonos filtrados en el mapa
        this.currentKmlLayer = L.geoJSON(filteredFeatures, {
            style: (feature) => {
                // Pintar cada polígono del color de su supervisor
                const sup = (feature.properties.SUPERVISOR || '').toLowerCase();
                let color = '#3b82f6'; // Azul por defecto
                
                if (sup.includes('roberto')) color = '#FF6B6B';
                else if (sup.includes('guadalupe')) color = '#4ECDC4';
                else if (sup.includes('arturo')) color = '#45B7D1';
                else if (sup.includes('alberto')) color = '#96CEB4';
                else if (sup.includes('carlos')) color = '#FFA07A';
                else if (sup.includes('ilsse')) color = '#98D8C8';
                else if (sup.includes('julio')) color = '#F7DC6F';
                else if (sup.includes('vacante')) color = '#94a3b8';
                else if (sup.includes('pendiente')) color = '#d97706';
                
                return {
                    color: color,         // Color del borde
                    weight: 3,            // Grosor de la línea
                    opacity: 0.9,         // Opacidad del borde
                    fillColor: color,     // Color del relleno
                    fillOpacity: 0.4      // Transparencia del relleno
                };
            },
            onEachFeature: (feature, layer) => {
                const name = feature.properties.name || 'Ruta sin nombre';
                
                // 1. Obtener la descripción cruda
                let rawDesc = feature.properties.description || feature.properties['descripción'] || '';
                
                // 2. Limpiar texto basura de Google My Maps para dejar solo las colonias
                let colonias = rawDesc
                    .replace(/descripción:\s*COLONIA[S]?/gi, '') // Quita el título
                    .replace(/SUPERVISOR:.*$/gi, '')             // Quita la etiqueta final del supervisor
                    .replace(/<br\s*\/?>/gi, '\n')               // Pasamos <br> a saltos de línea temporalmente
                    .replace(/\n+/g, '<br>')                     // Quitamos saltos extra y lo regresamos a <br>
                    .trim();
                
                if (colonias.startsWith('<br>')) colonias = colonias.substring(4); // Quitar <br> inicial si queda
                
                // 3. Extraer el nombre del supervisor
                const supervisorName = feature.properties.SUPERVISOR || 'No asignado';
                
                layer.bindPopup(`
                    <div style="max-height: 250px; overflow-y: auto;">
                        <b style="font-size:15px; color:#1e40af; border-bottom:1px solid #e2e8f0; padding-bottom:5px; display:block; margin-bottom: 5px;">${name}</b>
                        <div style="font-size:11px; color:#dc2626; font-weight:bold; margin-bottom: 8px;">👤 Supervisor: ${supervisorName}</div>
                        <div style="font-size:11px; font-weight:bold; color:#475569; margin-bottom: 3px;">📍 Colonias asignadas:</div>
                        <div style="font-size:11px; margin-bottom: 12px; color:#475569; line-height: 1.4;">${colonias || 'Sin colonias especificadas'}</div>
                        <button onclick="App.goToStep('supervision-form')" class="btn btn-primary" style="padding: 8px; font-size: 11px; width: 100%; margin:0;">Supervisar esta ruta</button>
                    </div>
                `);
            }
        }).addTo(this.map);

        // Ajustar la cámara para que se vean todas las rutas filtradas
        if (filteredFeatures.length > 0) {
            this.map.fitBounds(this.currentKmlLayer.getBounds(), { padding: [20, 20] });
        }
        
        // Renderizar sub-lista (acordeón) de rutas encontradas
        const listContainer = document.getElementById('routes-list-container');
        if (listContainer) {
            if (filteredFeatures.length > 0 && filterType !== 'all') {
                // Extraer nombres, limpiar y ordenar (Ruta 2 va antes de Ruta 10 gracias al localeCompare numeric)
                const routeNames = filteredFeatures.map(f => (f.properties.name || 'Sin nombre').trim()).sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));
                
                listContainer.style.display = 'block';
                listContainer.innerHTML = routeNames.map(name => `
                    <div onclick="GeocercasView.centrarRuta('${name}')" class="route-item-hover" style="padding: 8px; border-radius: 4px; font-size: 11px; color: #475569; cursor: pointer; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9;">
                        <span style="font-weight: 500;">📍 ${name}</span>
                        <i class='bx bx-target-lock' style="color: #94a3b8; font-size: 14px;"></i>
                    </div>
                `).join('');
            } else {
                listContainer.style.display = 'none';
            }
        }
        
        // Re-calcular tamaño del mapa en caso de que el panel inferior haya cambiado
        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 200);
    }
};

// Exportar vista para uso global
if (typeof window !== 'undefined') {
    window.GeocercasView = GeocercasView;
}