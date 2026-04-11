// admin.js - Vistas del panel de administración

const AdminView = {
    // Vista de login para SUPERVISOR
    renderLogin() {
        return `
            <div class="container">
                <div style="text-align: center; padding: 40px 20px;">
                    <h2 style="color: #1e293b; margin-bottom: 30px;">👨‍💼 Acceso Supervisor</h2>
                    
                    <div class="card" style="max-width: 300px; margin: 0 auto;">
                        <div class="form-group">
                            <label>Clave de acceso</label>
                            <input type="password" 
                                   id="adminPassword"
                                   placeholder="Ingresa la clave"
                                   style="text-align: center; font-weight: bold;">
                        </div>
                        
                        <button onclick="AdminController.checkPassword()" class="btn btn-primary">
                            Ingresar
                        </button>
                        
                        <button onclick="App.goToStep('home')" 
                                class="btn btn-secondary"
                                style="margin-top: 10px;">
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Vista de login para TALLER
    renderTallerLogin() {
        return `
            <div class="container">
                <div style="text-align: center; padding: 40px 20px;">
                    <h2 style="color: #1e293b; margin-bottom: 30px;">🔧 Acceso Taller Mecánico</h2>
                    
                    <div class="card" style="max-width: 300px; margin: 0 auto;">
                        <div class="form-group">
                            <label>Clave de acceso</label>
                            <input type="password" 
                                   id="tallerPassword"
                                   placeholder="Ingresa la clave"
                                   style="text-align: center; font-weight: bold;">
                        </div>
                        
                        <button onclick="AdminController.checkTallerPassword()" class="btn btn-primary" style="background: #0f172a;">
                            Ingresar al Taller
                        </button>
                        
                        <button onclick="App.goToStep('home')" 
                                class="btn btn-secondary"
                                style="margin-top: 10px;">
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Vista del panel SUPERVISOR
    renderPanel(appState) {
        return `
            <div>
                <div class="header" style="background: #1e293b; color: white;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="App.goToStep('home')"
                                style="background: none; border: none; color: white; font-size: 20px;">
                            ←
                        </button>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${CONFIG.LOGO_URL}" style="height: 35px; background: white; padding: 2px; border-radius: 4px;">
                            <div>
                                <div class="logo" style="color: white;">Panel Supervisor</div>
                                <div style="font-size: 10px; opacity: 0.8;">Gestión de reportes y órdenes</div>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                    <button onclick="AdminController.exportAllToPDF()"
                            style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px;">
                        📄 Exportar PDFs
                    </button>
                        <button onclick="AdminController.exportToCSV()"
                                style="background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px;">
                        Exportar CSV
                        </button>
                    ${appState.userRole === 'admin' ? `
                        <button onclick="AdminController.showPasswordModal()"
                                style="background: #8b5cf6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                            🔐 Accesos
                        </button>
                    ` : ''}
                    </div>
                </div>
                
                <div class="container">
                    <!-- Filtros -->
                    <div class="card">
                        <div class="grid-responsive">
                            <div class="form-group">
                                <label>Filtrar por mes</label>
                                <input type="month" 
                                       id="filterMonth"
                                       value="${appState.filterMonth || ''}"
                                       onchange="AdminController.updateFilterMonth(this.value)">
                            </div>
                            <div class="form-group">
                                <label>Filtrar por fecha</label>
                                <input type="date" 
                                       id="filterDate"
                                       value="${appState.filterDate}"
                                       onchange="AdminController.updateFilterDate(this.value)">
                            </div>
                            <div class="form-group">
                                <label>Buscar</label>
                                <input type="text" 
                                       id="filterSearch"
                                       value="${appState.filterSearch}"
                                       oninput="AdminController.updateFilterSearch(this.value)"
                                       placeholder="Unidad, operador...">
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
                            <div>Total: <span id="totalReports">0</span> registros</div>
                            <button onclick="AdminController.clearAllReports()" 
                                    style="color: #dc2626; background: none; border: none; font-size: 12px;">
                                Limpiar todo
                            </button>
                        </div>
                    </div>
                    
                    <!-- Pestañas -->
                    <div style="display: flex; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; flex-wrap: wrap;">
                        <button id="tabChecklistsBtn" onclick="AdminController.switchTab('checklists')" 
                                style="flex: 1; min-width: 100px; padding: 12px; background: ${appState.activeTab === 'checklists' ? '#1e40af' : '#f8fafc'}; color: ${appState.activeTab === 'checklists' ? 'white' : '#475569'}; border: none; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                            📋 Inspecciones
                        </button>
                        <button id="tabOrdenesBtn" onclick="AdminController.switchTab('ordenes')" 
                                style="flex: 1; min-width: 100px; padding: 12px; background: ${appState.activeTab === 'ordenes' ? '#f59e0b' : '#f8fafc'}; color: ${appState.activeTab === 'ordenes' ? 'white' : '#475569'}; border: none; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                            🔧 Órdenes
                        </button>
                        <button id="tabSupervisionesBtn" onclick="AdminController.switchTab('supervisiones')" 
                                style="flex: 1; min-width: 100px; padding: 12px; background: ${appState.activeTab === 'supervisiones' ? '#0867ec' : '#f8fafc'}; color: ${appState.activeTab === 'supervisiones' ? 'white' : '#475569'}; border: none; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                            👨‍🔧 Supervisiones
                        </button>
                        <button id="tabMapasBtn" onclick="AdminController.switchTab('mapas')" 
                                style="flex: 1; min-width: 100px; padding: 12px; background: ${appState.activeTab === 'mapas' ? '#10b981' : '#f8fafc'}; color: ${appState.activeTab === 'mapas' ? 'white' : '#475569'}; border: none; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                            🗺️ Mapas de Quejas
                        </button>
                    </div>
                    
                    <!-- Gráfica de Resumen (solo para no mapas) -->
                    ${appState.activeTab !== 'mapas' ? `
                        <div class="card" style="margin-bottom: 16px;">
                            <h4 id="chartTitle" style="margin-bottom: 10px; color: #1e293b; font-size: 14px;">
                                ${appState.activeTab === 'checklists' ? '📊 Estado de Inspecciones' : 
                                  appState.activeTab === 'ordenes' ? '📊 Estado de Órdenes' : 
                                  '📊 Supervisiones en Campo'}
                            </h4>
                            <div style="height: 200px; position: relative;"><canvas id="statsChart"></canvas></div>
                        </div>
                    ` : ''}
                    
                    <!-- Contenido dinámico -->
                    <div id="reportsList" style="margin-top: 16px;">
                        ${appState.activeTab === 'mapas' ? MapaQuejasView.render() : ''}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Vista del panel TALLER
    renderTallerPanel(appState) {
        return `
            <div>
                <div class="header" style="background: #0f172a; color: white;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="App.goToStep('home')"
                                style="background: none; border: none; color: white; font-size: 20px;">
                            ←
                        </button>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${CONFIG.LOGO_URL}" style="height: 35px; background: white; padding: 2px; border-radius: 4px;">
                            <div>
                                <div class="logo" style="color: white;">Panel Taller</div>
                                <div style="font-size: 10px; opacity: 0.8;">Gestión de órdenes de servicio</div>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="AdminController.exportAllToPDF()"
                                style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px;">
                            📄 Exportar PDF
                        </button>
                        <button onclick="AdminController.exportToCSV()"
                                style="background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px;">
                            Exportar
                        </button>
                    </div>
                </div>
                
                <div class="container">
                    <!-- Filtros simplificados -->
                    <div class="card">
                        <div style="display: flex; gap: 10px; align-items: flex-end;">
                            <div class="form-group" style="flex: 1; margin-bottom: 0;">
                                <label>Buscar por unidad o folio</label>
                                <input type="text" 
                                       id="filterSearch"
                                       value="${appState.filterSearch}"
                                       oninput="AdminController.updateTallerFilter(this.value)"
                                       placeholder="Ej: GU-1260 o FOLIO-123">
                            </div>
                            <button onclick="AdminController.loadTallerPanel()" 
                                    class="btn btn-primary" 
                                    style="width: auto; padding: 10px 20px; margin: 0;">
                                Buscar
                            </button>
                        </div>
                    </div>
                    
                    <!-- Estadísticas rápidas -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0;">
                        <div class="stat-card" style="background: #fee2e2;">
                            <div class="stat-value" style="color: #dc2626;" id="pendientesCount">0</div>
                            <div class="stat-label">Pendientes</div>
                        </div>
                        <div class="stat-card" style="background: #dbeafe;">
                            <div class="stat-value" style="color: #2563eb;" id="procesoCount">0</div>
                            <div class="stat-label">En Proceso</div>
                        </div>
                        <div class="stat-card" style="background: #dcfce7;">
                            <div class="stat-value" style="color: #16a34a;" id="completadasCount">0</div>
                            <div class="stat-label">Completadas</div>
                        </div>
                    </div>
                    
                    <!-- Título de la lista -->
                    <h3 style="margin: 20px 0 10px 0; font-size: 16px; color: #334155; display: flex; align-items: center; gap: 8px;">
                        <span>🔧</span> Órdenes de Servicio
                    </h3>

                    <!-- Lista de órdenes -->
                    <div id="reportsList" style="margin-top: 10px;">
                        <!-- Se carga dinámicamente -->
                    </div>
                </div>
            </div>
        `;
    },

    // Vista de detalles del reporte (INSPECCIÓN) - FORMATO COMPLETO
    renderReportDetails(report) {
        const contentId = `report-content-${report.id}`;
        
        // Obtener los puntos de inspección según el tipo de ruta del reporte
        const tipoRuta = report.tipoRuta || 'Utilitario';
        const inspectionPoints = CONFIG.getInspectionPointsByRouteType(tipoRuta);
        
        const getStatusRow = (point) => {
            if (point.isHeader) {
                return `
                    <tr>
                        <td colspan="4" style="border: 1px solid #000; padding: 4px; font-size: 9px; font-weight: bold; background-color: #e5e7eb; text-transform: uppercase;">
                            ${point.label}
                        </td>
                    </tr>
                `;
            }

            // Separar Componente y Criterio basado en los paréntesis "Componente (Criterio)"
            let component = point.label;
            let criterion = "";
            const match = point.label.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                component = match[1];
                criterion = match[2];
            }

            const evaluacion = report.evaluaciones && report.evaluaciones[point.id];
            if (!evaluacion) return '';
            
            const isApproved = evaluacion === 'aprobado';
            const isRejected = evaluacion === 'rechazado';
            const hasPhoto = report.fotos && report.fotos[point.id];
            
            return `
                <tr>
                    <td style="border: 1px solid #000; padding: 4px; font-size: 9px;">${component}</td>
                    <td style="border: 1px solid #000; padding: 4px; font-size: 9px;">${criterion}</td>
                    <td style="border: 1px solid #000; padding: 4px; font-size: 9px; text-align: center; font-weight: bold;">
                        ${isApproved ? 'X' : ''}
                    </td>
                    <td style="border: 1px solid #000; padding: 4px; font-size: 9px; text-align: center; font-weight: bold; color: ${isRejected ? '#dc2626' : '#000'};">
                        ${isRejected ? 'X' : ''}
                    </td>
                </tr>
            `;
        };

        const fechaText = report.fecha || '______________';
        const operadorText = report.operador || '____________________';
        const unidadText = report.ecoUnidad || '__________';
        const observaciones = report.observaciones || 'Ninguna';

        // Extraer fotos y crear una galería visible solo en la pantalla (NO EN EL PDF)
        const pointsWithPhotos = inspectionPoints.filter(p => !p.isHeader && report.fotos && report.fotos[p.id]);
        let photosHtml = '';
        if (pointsWithPhotos.length > 0) {
            photosHtml = `
                <div style="margin-top: 24px; background: #f8fafc; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px;">
                    <h3 style="font-size: 14px; font-weight: bold; color: #1e40af; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        📸 Evidencia Fotográfica de Fallas
                        <span style="font-size: 10px; font-weight: normal; color: #64748b; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">(Visible solo en panel, no se imprime en PDF)</span>
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
                        ${pointsWithPhotos.map(p => {
                            let comp = p.label;
                            const m = p.label.match(/^(.*?)\s*\((.*?)\)$/);
                            if (m) comp = m[1] + ' - ' + m[2];
                            return `
                                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background: white; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                    <p style="font-size: 11px; font-weight: bold; margin-bottom: 8px; color: #334155;">${comp}</p>
                                    <img src="${report.fotos[p.id]}" style="max-width: 100%; height: 160px; object-fit: contain; border-radius: 4px;">
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        return `
            <div style="padding: 20px; max-width: 900px; margin: 0 auto; padding-bottom: 100px;">
                <div id="${contentId}" style="background: white; padding: 24px; border: 1px solid #d1d5db; font-family: sans-serif; color: #000;">
                    
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #000; padding-bottom: 16px;">
                        <div style="font-size: 20px; font-weight: bold; font-style: italic; line-height: 1.2;">
                            <img src="${CONFIG.LOGO_URL}" alt="GEN" style="max-width: 200px; height: auto; object-fit: contain;">
                        </div>
                        <div style="text-align: center;">
                            <p style="font-weight: bold; font-size: 18px; margin: 0;">(Normativo)</p>
                            <p style="font-weight: bold; font-size: 20px; text-transform: uppercase; margin: 0;">Listado de revisión visual diaria</p>
                        </div>
                    </div>

                    <div style="font-size: 12px; margin-bottom: 16px; font-style: italic; line-height: 1.4;">
                        Antes de la puesta en marcha de la Unidad de Distribución se debe realizar la siguiente revisión visual diaria, según la Unidad que corresponda. Los conceptos de este Apéndice pueden conformar un documento independiente, formar parte de los procedimientos de operación o de la bitácora de operación.
                    </div>

                    <!-- Unidad info -->
                    <div style="margin-bottom: 16px; font-size: 14px; font-weight: bold; border: 1px solid #000; padding: 8px; background-color: #f9fafb; text-transform: uppercase;">
                        ${tipoRuta === 'Autotanque' ? 'AUTOTANQUE' : 'VEHÍCULO DE REPARTO'}
                    </div>
                    
                    <!-- Datos Generales -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div><span style="font-weight: bold;">FECHA:</span> <span style="border-bottom: 1px solid #000; padding: 0 10px;">${fechaText}</span></div>
                            <div><span style="font-weight: bold;">NOMBRE DEL OPERADOR:</span> <span style="border-bottom: 1px solid #000; padding: 0 10px;">${operadorText}</span></div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div><span style="font-weight: bold;">IDENTIFICACIÓN DE LA UNIDAD:</span> <span style="border-bottom: 1px solid #000; padding: 0 10px;">${unidadText}</span></div>
                            <div style="display: flex; align-items: end;">
                                <span style="font-weight: bold; margin-right: 10px;">FIRMA(S):</span> 
                                ${report.firma ? `<img src="${report.firma}" style="max-height: 40px; border-bottom: 1px solid #000;">` : '<span style="border-bottom: 1px solid #000; display: inline-block; width: 150px;"></span>'}
                            </div>
                        </div>
                        <div style="grid-column: span 2;">
                            <span style="font-weight: bold;">NOMBRE(S) DEL PERSONAL AUXILIAR:</span> <span style="border-bottom: 1px solid #000; display: inline-block; width: 300px;"></span>
                        </div>
                    </div>
                    
                    <!-- Tabla de Revisión -->
                    <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="border: 1px solid #000; padding: 4px; font-size: 9px; width: 40%; text-align: left;">Componentes</th>
                                <th style="border: 1px solid #000; padding: 4px; font-size: 9px; width: 40%; text-align: left;">Criterio de aceptación</th>
                                <th style="border: 1px solid #000; padding: 4px; font-size: 9px; width: 10%; text-align: center;">Cumple</th>
                                <th style="border: 1px solid #000; padding: 4px; font-size: 9px; width: 10%; text-align: center;">No cumple</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inspectionPoints.map(p => getStatusRow(p)).join('')}
                        </tbody>
                    </table>
                    
                    <!-- Sección de Incumplimientos -->
                    <div style="border-top: 2px solid #000; padding-top: 16px;">
                        <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px;">ESTA SECCIÓN SE UTILIZA EN CASO DE DETECTAR INCUMPLIMIENTOS EN LA REVISIÓN</h3>
                        <div style="font-size: 12px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="border-bottom: 1px solid #000; padding-bottom: 4px; min-height: 20px;">
                                <span style="font-weight: bold;">Defectos o anomalías observadas:</span> ${observaciones}
                            </div>
                            <div style="border-bottom: 1px solid #000; padding-bottom: 4px; min-height: 20px;">
                                <!-- Línea extra para escritura a mano -->
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px;">
                                <div style="border-bottom: 1px solid #000; padding-bottom: 4px;">
                                    <span style="font-weight: bold;">Nombre del responsable de la corrección/reparación:</span> 
                                </div>
                                <div style="border-bottom: 1px solid #000; padding-bottom: 4px;">
                                    <span style="font-weight: bold;">Fecha de la acción correctiva:</span> 
                                </div>
                            </div>
                            <div style="margin-top: 16px; display: flex; align-items: end;">
                                <span style="font-weight: bold; margin-right: 10px;">Firma del responsable:</span> 
                                <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px;"></span>
                            </div>
                        </div>
                    </div>

                </div>
                
                <!-- Galería de fotos que solo se ve en pantalla -->
                ${photosHtml}
                
                <!-- BOTONES DE ACCIÓN -->
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="ModalService.close()"
                            class="btn btn-secondary" style="flex: 1;">
                        Cerrar
                    </button>
                    <button onclick="AdminController.downloadPDF('${contentId}', 'Listado_Revision_${report.ecoUnidad}')"
                            class="btn btn-danger" style="flex: 1;">
                        📄 Descargar PDF
                    </button>
                </div>
            </div>
        `;
    },
    
    // Vista de detalles de orden - FORMATO COMPLETO
    renderOrdenDetails(orden) {
        const contentId = `orden-content-${orden.id}`;
        const firmaElaboroData = orden.firmaElaboro || (orden.operador ? this.generarFirmaAutomatica(orden.operador) : null);
        
        return `
            <div style="padding: 20px; max-width: 800px; margin: 0 auto; padding-bottom: 100px;">
                <div id="${contentId}" class="formato-container" style="background: white; padding: 15px; border: 1px solid #000;">
                    <!-- Encabezado -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                        <tr>
                            <td style="width: 33%; border: none; vertical-align: top;">
                                <img src="${CONFIG.LOGO_URL}" style="max-width: 150px; max-height: 60px; object-fit: contain;">
                            </td>
                            <td style="width: 34%; border: none; text-align: center; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                                ORDEN DE SERVICIO<br>PLANTA: QUERÉTARO
                            </td>
                            <td style="width: 33%; border: none; text-align: right; font-size: 10px;">
                                Forma: GEN-F-011-001<br><br>
                                FOLIO: <span style="color:red; font-weight:bold;">${orden.folio}</span><br>
                                FECHA: ${orden.fecha}
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Datos principales -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                        <tr>
                            <td colspan="2" style="border: 1px solid #444; padding: 4px;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase; display: block;">Responsable del Vehículo:</span>
                                ${orden.operador || '________________'}
                            </td>
                            <td style="border: 1px solid #444; padding: 4px;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase; display: block;">Unidad:</span>
                                ${orden.unidad || '________________'}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3" style="border: 1px solid #444; padding: 4px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-weight: bold; font-size: 8px; text-transform: uppercase;">Mantenimiento realizado en:</span>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="border: 1px solid #000; width: 12px; height: 8px; display: inline-block; ${orden.mantenimientoLugar === 'taller' ? 'background-color: #000;' : ''}"></div> Taller
                                        <div style="border: 1px solid #000; width: 12px; height: 8px; display: inline-block; ${orden.mantenimientoLugar === 'ruta' ? 'background-color: #000;' : ''}"></div> Ruta
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #444; padding: 4px; width: 33%;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase; display: block;">Hora del reporte:</span>
                                ${orden.horaReporte || '______'}
                            </td>
                            <td style="border: 1px solid #444; padding: 4px; width: 33%;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase; display: block;">Hora de término:</span>
                                ${orden.horaTermino || '______'}
                            </td>
                            <td style="border: 1px solid #444; padding: 4px; width: 33%;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase; display: block;">Tiempo muerto:</span>
                                ${orden.tiempoMuerto || '______'}
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Trabajos a realizar -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                        <tr>
                            <td style="border: 1px solid #444; padding: 4px; width: 70%;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase; display: block;">Trabajos a realizar</span>
                                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                                    ${CONFIG.TIPOS_MANTENIMIENTO.map(tipo => {
                                        const value = tipo.toLowerCase().includes('correctivo') ? 'correctivo' : 
                                                     tipo.toLowerCase().includes('preventivo') ? 'preventivo' : 'otras';
                                        const checked = orden.tipoMantenimiento === value;
                                        return `<div style="display: flex; align-items: center; gap: 5px;">
                                            <div style="border: 1px solid #000; width: 12px; height: 8px; display: inline-block; ${checked ? 'background-color: #000;' : ''}"></div> ${tipo}
                                        </div>`;
                                    }).join('')}
                                </div>
                            </td>
                            <td style="border: 1px solid #444; padding: 4px;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase; display: block;">Kilometraje:</span>
                                ${orden.kilometro || '______'}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border: 1px solid #444; padding: 8px; min-height: 60px;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase; display: block;">Especificar falla de la unidad:</span>
                                <div style="font-size: 9px;">${orden.descripcionFalla || ''}</div>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Descripción del trabajo -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                        <tr style="background-color: #cbdcf7;">
                            <td style="border: 1px solid #444; padding: 4px;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase;">Descripción del trabajo realizado (Taller)</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #444; padding: 8px; min-height: 80px;">
                                <div style="font-size: 9px;">${orden.trabajoRealizado || ''}</div>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Puntos críticos -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; background-color: #cbdcf7;">
                        <tr>
                            <td colspan="4" style="text-align: center; font-weight: bold; font-size: 8px; padding: 4px; border: 1px solid #444;">
                                UNA VEZ EFECTUADO EL MANTENIMIENTO Y ANTES DE DAR SALIDA A LA UNIDAD, REVISAR LOS SIGUIENTES PUNTOS CRÍTICOS
                            </td>
                        </tr>
                        <tr>
                            ${CONFIG.PUNTOS_CRITICOS.slice(0, 4).map(punto => `
                                <td style="border: 1px solid #444; padding: 4px; font-size: 8px;">
                                    ${punto} 
                                    <div style="border: 1px solid #000; width: 12px; height: 8px; display: inline-block; float: right; ${orden.puntosCriticos && orden.puntosCriticos.includes(punto) ? 'background-color: #000;' : ''}"></div>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            ${CONFIG.PUNTOS_CRITICOS.slice(4, 8).map(punto => `
                                <td style="border: 1px solid #444; padding: 4px; font-size: 8px;">
                                    ${punto} 
                                    <div style="border: 1px solid #000; width: 12px; height: 8px; display: inline-block; float: right; ${orden.puntosCriticos && orden.puntosCriticos.includes(punto) ? 'background-color: #000;' : ''}"></div>
                                </td>
                            `).join('')}
                        </tr>
                    </table>
                    
                    <!-- Nota -->
                    <div style="font-size: 7px; text-align: center; font-style: italic; margin: 5px 0;">
                        Nota: El taller no se hace responsable por objetos personales de valor dejados u olvidados en las unidades.
                    </div>
                    
                    <!-- Observaciones y Firmas -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
                        <tr style="background-color: #cbdcf7;">
                            <td colspan="3" style="border: 1px solid #444; padding: 4px;">
                                <span style="font-weight: bold; font-size: 8px; text-transform: uppercase;">Observaciones:</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3" style="border: 1px solid #444; padding: 8px; min-height: 20px; font-size: 9px;">
                                ${orden.observaciones || ''}
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #444; padding: 4px; width: 33%; height: 60px; text-align: center; vertical-align: middle;">
                                ${firmaElaboroData ? `<img src="${firmaElaboroData}" style="max-height: 50px; max-width: 100%; object-fit: contain;">` : ''}
                            </td>
                            <td style="border: 1px solid #444; padding: 4px; width: 33%; height: 60px; text-align: center; vertical-align: middle;">
                                ${orden.firmaTaller ? `<img src="${orden.firmaTaller}" style="max-height: 50px; max-width: 100%; object-fit: contain;">` : ''}
                            </td>
                            <td style="border: 1px solid #444; padding: 4px; width: 33%; height: 60px; text-align: center; vertical-align: middle;">
                                ${orden.firmaChofer ? `<img src="${orden.firmaChofer}" style="max-height: 50px; max-width: 100%; object-fit: contain;">` : ''}
                            </td>
                        </tr>
                        <tr style="background-color: #cbdcf7;">
                            <td style="border: 1px solid #444; padding: 4px; text-align: center; font-weight: bold; font-size: 8px;">ELABORÓ</td>
                            <td style="border: 1px solid #444; padding: 4px; text-align: center; font-weight: bold; font-size: 8px;">FIRMA DE RECIBIDO (TALLER)</td>
                            <td style="border: 1px solid #444; padding: 4px; text-align: center; font-weight: bold; font-size: 8px;">FIRMA DE CONFORMIDAD (CHOFER)</td>
                        </tr>
                    </table>
                    
                    ${orden.fotoFalla ? `
                        <div style="margin-top: 10px; text-align: center;">
                            <span style="font-weight: bold; font-size: 8px; text-transform: uppercase;">EVIDENCIA FOTOGRÁFICA:</span><br>
                            <img src="${orden.fotoFalla}" style="max-width: 300px; border: 1px solid #ccc; margin-top: 5px;">
                        </div>
                    ` : ''}
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="ModalService.close()"
                            class="btn btn-secondary" style="flex: 1;">
                        Cerrar
                    </button>
                    <button onclick="AdminController.downloadPDF('${contentId}', 'Orden_${orden.folio}')"
                            class="btn btn-danger" style="flex: 1;">
                        📄 Descargar PDF
                    </button>
                </div>
            </div>
        `;
    },
    
    // Renderizar lista de reportes/órdenes/supervisiones
    renderReportsList(items, activeTab) {
        if (items.length === 0) {
            return `
                <div class="card" style="text-align: center; padding: 40px 20px; background: #f8fafc; border: 2px dashed #e2e8f0;">
                    <div style="font-size: 40px; color: #cbd5e1; margin-bottom: 16px;">
                        ${activeTab === 'checklists' ? '📋' : activeTab === 'ordenes' ? '🔧' : '👨‍🔧'}
                    </div>
                    <p style="color: #64748b; font-weight: bold;">
                        No hay ${activeTab === 'checklists' ? 'inspecciones' : activeTab === 'ordenes' ? 'órdenes de servicio' : 'supervisiones en campo'} registradas
                    </p>
                </div>
            `;
        }
        
        if (activeTab === 'checklists') {
            return items.map(report => `
                <div class="report-card">
                    <div class="report-header">
                        <div>
                            <div class="report-date">${report.fecha} ${report.hora}</div>
                            <div style="font-weight: bold; margin-top: 4px;">${report.operador}</div>
                            <div style="font-size: 10px; color: #1e40af; margin-top: 2px;">
                                ${report.tipoRuta || 'Estándar'}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="report-unit">${report.ecoUnidad}</div>
                            <div style="font-size: 12px; color: #64748b;">${report.ruta}</div>
                        </div>
                    </div>
                    
                    <div style="margin: 8px 0; padding: 8px; background: #f1f5f9; border-radius: 6px; font-size: 12px;">
                        <strong>Estatus:</strong> 
                        ${Object.values(report.evaluaciones || {}).filter(e => e === 'rechazado').length > 0 ? 
                        '<span style="color: #dc2626;">❌ Con fallas</span>' : 
                        '<span style="color: #22c55e;">✅ Aprobado</span>'}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                        <div style="font-size: 11px; color: #64748b;">
                            ${Object.keys(report.fotos || {}).length > 0 ? 
                            `📸 ${Object.keys(report.fotos).length} foto(s)` : 
                            'Sin fotos'}
                        </div>
                        <button onclick="AdminController.viewReport('${report.id}')"
                                style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px;">
                            Ver detalles
                        </button>
                    </div>
                </div>
            `).join('');
            
        } else if (activeTab === 'ordenes') {
            return items.map(orden => `
                <div class="report-card">
                    <div class="report-header">
                        <div>
                            <div class="report-date">${orden.fecha} ${orden.hora}</div>
                            <div style="font-weight: bold; margin-top: 4px;">
                                Folio: ${orden.folio || 'N/A'}
                                <span style="font-size: 10px; padding: 2px 6px; border-radius: 10px; 
                                      background: ${orden.estado === 'pendiente' ? '#fef3c7' : 
                                                   orden.estado === 'en_proceso' ? '#dbeafe' : '#dcfce7'}; 
                                      color: ${orden.estado === 'pendiente' ? '#92400e' : 
                                              orden.estado === 'en_proceso' ? '#1e40af' : '#166534'}; 
                                      margin-left: 8px;">
                                    ${orden.estado === 'pendiente' ? 'PENDIENTE' : 
                                      orden.estado === 'en_proceso' ? 'EN PROCESO' : 'COMPLETADO'}
                                </span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="report-unit">${orden.unidad}</div>
                            <div style="font-size: 12px; color: #64748b;">${orden.operador}</div>
                        </div>
                    </div>
                    
                    <div style="margin: 8px 0; padding: 8px; background: #fef3c7; border-radius: 6px; font-size: 12px;">
                        <strong>Falla:</strong> ${orden.descripcionFalla ? orden.descripcionFalla.substring(0, 80) + (orden.descripcionFalla.length > 80 ? '...' : '') : 'Sin descripción'}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                        <div style="font-size: 11px; color: #64748b;">
                            ${orden.fotoFalla ? '📸 Con foto' : 'Sin foto'} | ${orden.puntosCriticos ? orden.puntosCriticos.length : 0} puntos críticos
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button onclick="AdminController.viewOrden('${orden.id}')"
                                    style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px;">
                                Ver
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
        } else {
            // SUPERVISIONES
            return items.map(supervision => `
                <div class="report-card" style="border-left: 4px solid #0867ec;">
                    <div class="report-header">
                        <div>
                            <div class="report-date">${supervision.fecha || ''} ${supervision.hora || ''}</div>
                            <div style="font-weight: bold; margin-top: 4px; color: #0867ec;">
                                👤 ${supervision.nombreSupervisor || 'Sin supervisor'}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="report-unit">Pedido: ${supervision.numeroPedido || 'N/A'}</div>
                            <div style="font-size: 12px; color: #64748b;">${supervision.nombreCliente || ''}</div>
                        </div>
                    </div>
                    
                    <div style="margin: 8px 0; padding: 8px; background: #f0f9ff; border-radius: 6px; font-size: 12px;">
                        <strong>📍 Motivo:</strong> ${supervision.motivoQueja ? supervision.motivoQueja.substring(0, 80) + (supervision.motivoQueja.length > 80 ? '...' : '') : 'No especificado'}
                    </div>
                    
                    <div style="margin: 8px 0; font-size: 11px; color: #475569; display: flex; flex-wrap: wrap; gap: 10px;">
                        <span>📞 ${supervision.telefonoCliente || 'Sin teléfono'}</span>
                        ${supervision.ubicacion ? `<span>📍 ${supervision.ubicacion.substring(0, 30)}${supervision.ubicacion.length > 30 ? '...' : ''}</span>` : ''}
                    </div>
                    
                    <div style="margin: 8px 0; padding: 8px; background: #ecfdf5; border-radius: 6px; font-size: 12px; color: #065f46;">
                        <strong>✅ Solución:</strong> ${supervision.solucion ? supervision.solucion.substring(0, 60) + (supervision.solucion.length > 60 ? '...' : '') : 'No especificada'}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                        <div style="font-size: 11px; color: #64748b; display: flex; gap: 10px;">
                            ${supervision.evidenciasFotos ? 
                              `📸 ${supervision.evidenciasFotos.length} foto(s)` : 
                              supervision.evidenciaFoto ? '📸 1 foto' : '📸 Sin fotos'}
                            ${supervision.coordenadas ? ' | 🗺️ Geo' : ''}
                        </div>
                        <button onclick="AdminController.viewSupervision('${supervision.id}')"
                                style="background: #0867ec; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                            Ver detalles
                        </button>
                    </div>
                </div>
            `).join('');
        }
    },

    // Función auxiliar para generar firma automática (si no existe)
    generarFirmaAutomatica(nombre) {
        if (!nombre) return null;
        
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'italic 16px Arial';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const texto = nombre.split(':')[1] || nombre;
        ctx.fillText(texto.trim(), canvas.width/2, canvas.height/2);
        
        ctx.beginPath();
        ctx.moveTo(20, canvas.height - 10);
        ctx.lineTo(canvas.width - 20, canvas.height - 10);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        return canvas.toDataURL();
    }
};

// Exportar vista para uso global
if (typeof window !== 'undefined') {
    window.AdminView = AdminView;
}