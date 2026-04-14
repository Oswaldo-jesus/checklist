// admin-controller.js - Controlador para el panel de administración

const AdminController = {
    chartInstance: null,
    SECRET_CLEAN_CODE: "Nieto2025",

    // Verificar contraseñas
    checkPassword() {
        const pwd = document.getElementById('adminPassword')?.value;
        if (['nieto2025','super7','admin'].includes(pwd)) {
            App.appState.userRole = 'supervisor';
            App.goToStep('admin-panel');
        } else if (['nieto2025','mecanico'].includes(pwd)) {
            App.appState.userRole = 'taller';
            App.goToStep('taller-panel');
        } else alert("Clave incorrecta.");
    },
    
    checkTallerPassword() {
        const pwd = document.getElementById('tallerPassword')?.value;
        if (['nieto2025','mecanico','taller2025'].includes(pwd)) {
            App.appState.userRole = 'taller';
            App.goToStep('taller-panel');
        } else alert("❌ Clave incorrecta.");
    },

    // Cambiar pestaña
    switchTab(tab) {
        App.appState.activeTab = tab;
        this.updateTabStyles(tab);
        
        const subTabs = document.getElementById('subTabsChecklists');
        if (subTabs) subTabs.style.display = tab === 'checklists' ? 'flex' : 'none';
        
        if (tab === 'mapas') {
            const c = document.getElementById('reportsList');
            if (c) { c.innerHTML = MapaQuejasView.render(); setTimeout(() => MapaQuejasView.initMapa?.(), 200); }
        } else this.loadReportsIntoPanel();
    },

    // Filtros
    updateFilterDate(date) { 
        App.appState.filterDate = date; 
        if (App.appState.activeTab !== 'mapas') this.loadReportsIntoPanel(); 
    },
    
    updateFilterMonth(m) { 
        App.appState.filterMonth = m; 
        if (App.appState.activeTab !== 'mapas') this.loadReportsIntoPanel(); 
    },
    
    updateFilterSearch(s) { 
        App.appState.filterSearch = s; 
        if (App.appState.activeTab !== 'mapas') this.loadReportsIntoPanel(); 
    },
    
    updateTallerFilter(s) { 
        App.appState.filterSearch = s; 
        this.loadTallerPanel(); 
    },

    // Filtro por Tipo de Ruta (Sub-pestañas)
    updateFilterTipoRuta(tipo) {
        App.appState.filterTipoRuta = tipo;
        // Actualizar estilos de los botones
        ['Todos', 'Utilitario', 'Mantenimiento', 'Montacargas', 'Cilindros', 'Autotanque'].forEach(t => {
            const btn = document.getElementById(`btnSubFilter-${t}`);
            if (btn) {
                if (t === tipo) {
                    btn.style.border = '1px solid #1e40af';
                    btn.style.background = '#eff6ff';
                    btn.style.color = '#1e40af';
                } else {
                    btn.style.border = '1px solid #cbd5e1';
                    btn.style.background = '#f8fafc';
                    btn.style.color = '#475569';
                }
            }
        });
        this.loadReportsIntoPanel();
    },

    // Estilos de pestañas
    updateTabStyles(active) {
        ['tabChecklistsBtn','tabOrdenesBtn','tabSupervisionesBtn','tabMapasBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) { 
                btn.style.background = '#f8fafc'; 
                btn.style.color = '#475569'; 
            }
        });
        const activeBtn = document.getElementById(
            active === 'checklists' ? 'tabChecklistsBtn' :
            active === 'ordenes' ? 'tabOrdenesBtn' :
            active === 'supervisiones' ? 'tabSupervisionesBtn' : 'tabMapasBtn'
        );
        if (activeBtn) {
            activeBtn.style.background = active === 'mapas' ? '#10b981' : active === 'ordenes' ? '#f59e0b' : active === 'supervisiones' ? '#0867ec' : '#1e40af';
            activeBtn.style.color = 'white';
        }
    },

    // ✅ Cargar panel supervisor - CORREGIDO FILTRO DE FECHA
    async loadReportsIntoPanel() {
        const c = document.getElementById('reportsList');
        const t = document.getElementById('totalReports');
        const ct = document.getElementById('chartTitle');
        
        if (ct) ct.textContent = App.appState.activeTab === 'checklists' ? '📊 Estado de Inspecciones' : 
                                  App.appState.activeTab === 'ordenes' ? '📊 Estado de Órdenes' : 
                                  '📊 Supervisiones en Campo';
        
        if (c) c.innerHTML = '<div class="spinner" style="margin:40px auto"></div><p style="text-align:center">Cargando...</p>';
        
        try {
            let items = App.appState.activeTab === 'checklists' ? await StorageService.loadReports() :
                        App.appState.activeTab === 'ordenes' ? await StorageService.loadOrdenes() :
                        JSON.parse(localStorage.getItem('supervisiones') || '[]');
            
            let filtered = items.filter(i => {
                let itemYear, itemMonth, itemDay;
                
                if (i.timestamp) {
                    const fecha = new Date(i.timestamp);
                    itemYear = fecha.getFullYear();
                    itemMonth = fecha.getMonth() + 1;
                    itemDay = fecha.getDate();
                } else if (i.fecha) {
                    if (i.fecha.includes('/')) {
                        const [dia, mes, año] = i.fecha.split('/').map(Number);
                        itemYear = año; itemMonth = mes; itemDay = dia;
                    } else if (i.fecha.includes('-')) {
                        const [año, mes, dia] = i.fecha.split('-').map(Number);
                        itemYear = año; itemMonth = mes; itemDay = dia;
                    }
                }
                
                // Filtro por Mes
                if (App.appState.filterMonth) {
                    if (!itemYear || !itemMonth) return false;
                    const [year, month] = App.appState.filterMonth.split('-').map(Number);
                    if (itemYear !== year || itemMonth !== month) return false;
                }
                
                // Filtro por Día Exacto
                if (App.appState.filterDate) {
                    if (!itemYear || !itemMonth || !itemDay) return false;
                    const [year, month, day] = App.appState.filterDate.split('-').map(Number);
                    if (itemYear !== year || itemMonth !== month || itemDay !== day) return false;
                }
                return true;
            }).filter(i => {
                // Filtro por Tipo de Ruta (solo Inspecciones)
                if (App.appState.activeTab === 'checklists' && App.appState.filterTipoRuta && App.appState.filterTipoRuta !== 'Todos') {
                    if (i.tipoRuta !== App.appState.filterTipoRuta) return false;
                }

                // Filtro de búsqueda por texto (sin cambios)
                if (!App.appState.filterSearch) return true;
                const s = App.appState.filterSearch.toLowerCase();
                if (App.appState.activeTab === 'supervisiones') {
                    return (i.nombreSupervisor?.toLowerCase().includes(s) || 
                            i.nombreCliente?.toLowerCase().includes(s) || 
                            i.numeroPedido?.toLowerCase().includes(s) || 
                            i.telefonoCliente?.toLowerCase().includes(s) || 
                            i.motivoQueja?.toLowerCase().includes(s) || 
                            i.ubicacion?.toLowerCase().includes(s));
                } else {
                    return (i.operador?.toLowerCase().includes(s) || 
                            i.unidad?.toLowerCase().includes(s) || 
                            i.ecoUnidad?.toLowerCase().includes(s) || 
                            i.ruta?.toLowerCase().includes(s) || 
                            i.descripcion?.toLowerCase().includes(s) || 
                            i.descripcionFalla?.toLowerCase().includes(s) || 
                            i.folio?.toString().includes(s));
                }
            });
            
            if (t) t.textContent = filtered.length;
            if (c) c.innerHTML = AdminView.renderReportsList(filtered, App.appState.activeTab);
            
            try { this.updateStatsChart(filtered, App.appState.activeTab); } catch (e) {}
        } catch (error) {
            console.error("Error cargando reportes:", error);
            if (c) c.innerHTML = `<div class="card"><p>Error: ${error.message}</p><button onclick="AdminController.loadReportsIntoPanel()" class="btn btn-primary">Reintentar</button></div>`;
        }
    },

    // ===== PANEL TALLER =====
    async loadTallerPanel() {
        const c = document.getElementById('reportsList');
        if (c) c.innerHTML = '<div class="spinner" style="margin:40px auto"></div><p style="text-align:center">Cargando órdenes...</p>';
        
        try {
            let items = await StorageService.loadOrdenes();
            
            if (App.appState.filterSearch) {
                const s = App.appState.filterSearch.toLowerCase();
                items = items.filter(i => i.unidad?.toLowerCase().includes(s) || 
                                         i.folio?.toString().toLowerCase().includes(s) || 
                                         i.operador?.toLowerCase().includes(s));
            }
            
            items.sort((a,b) => (b.timestamp||0) - (a.timestamp||0));
            this.updateTallerStats(items);
            
            if (c) c.innerHTML = this.renderTallerOrdersList(items);
        } catch (error) {
            console.error("Error cargando taller:", error);
            if (c) c.innerHTML = '<div class="card"><p>Error al cargar las órdenes</p><button onclick="AdminController.loadTallerPanel()" class="btn btn-primary">Reintentar</button></div>';
        }
    },

    // Renderizar órdenes en taller
    renderTallerOrdersList(ordenes) {
        if (!ordenes.length) return `<div class="card" style="text-align:center;padding:40px;"><div style="font-size:40px;">🔧</div><p>No hay órdenes</p></div>`;
        
        return ordenes.map(o => {
            const color = o.estado === 'pendiente' ? '#dc2626' : o.estado === 'en_proceso' ? '#2563eb' : '#16a34a';
            const bg = o.estado === 'pendiente' ? '#fee2e2' : o.estado === 'en_proceso' ? '#dbeafe' : '#dcfce7';
            
            return `<div class="report-card" style="border-left:4px solid ${color};margin-bottom:15px;">
                <div class="report-header">
                    <div>
                        <div class="report-date">${o.fecha || ''} ${o.hora || ''}</div>
                        <div style="font-weight:bold;">Folio: ${o.folio || 'N/A'}</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="report-unit">${o.unidad || ''}</div>
                        <div style="font-size:12px;color:#64748b;">${o.operador || ''}</div>
                    </div>
                </div>
                
                <div style="margin:10px 0;padding:10px;background:#f8fafc;border-radius:6px;">
                    <div style="margin-bottom:8px;"><strong>🔧 Falla reportada:</strong> ${o.descripcionFalla || 'Sin descripción'}</div>
                    
                    ${o.estado === 'en_proceso' ? `
                        <div style="margin-top:10px;">
                            <label style="font-weight:bold;display:block;margin-bottom:5px;">⚙️ Trabajo realizado:</label>
                            <textarea id="trabajo-${o.id}" rows="3" style="width:100%;padding:8px;border:2px solid #e2e8f0;border-radius:6px;margin-bottom:8px;" placeholder="Describe el trabajo realizado...">${o.trabajoRealizado || ''}</textarea>
                            <button onclick="AdminController.guardarTrabajoRealizado('${o.id}')" 
                                    class="btn btn-success" style="width:100%;padding:8px;font-size:13px;margin:0;">
                                💾 Guardar trabajo realizado
                            </button>
                        </div>
                    ` : o.trabajoRealizado ? `
                        <div style="margin-top:10px;padding:8px;background:#ecfdf5;border-radius:4px;">
                            <strong>✅ Trabajo realizado:</strong> ${o.trabajoRealizado}
                        </div>
                    ` : ''}
                </div>
                
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
                    <span style="background:${bg};color:${color};padding:4px 8px;border-radius:12px;font-size:12px;">
                        ${o.estado === 'pendiente' ? '⏳ PENDIENTE' : o.estado === 'en_proceso' ? '🔄 EN PROCESO' : '✅ COMPLETADO'}
                    </span>
                    
                    <div style="display:flex;gap:5px;">
                        ${o.estado === 'pendiente' ? `
                            <button onclick="AdminController.updateTallerOrderStatus('${o.id}','en_proceso')" 
                                    class="btn btn-primary" style="padding:6px 12px;font-size:12px;width:auto;margin:0;">
                                ▶ Iniciar
                            </button>
                        ` : ''}
                        
                        ${o.estado === 'en_proceso' ? `
                            <button onclick="AdminController.updateTallerOrderStatus('${o.id}','completado')" 
                                    class="btn btn-success" style="padding:6px 12px;font-size:12px;width:auto;margin:0;">
                                ✓ Completar
                            </button>
                        ` : ''}
                        
                        <button onclick="AdminController.viewOrden('${o.id}')" 
                                class="btn btn-secondary" style="padding:6px 12px;font-size:12px;width:auto;margin:0;">
                            Ver
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    // Guardar trabajo realizado
    async guardarTrabajoRealizado(ordenId) {
        const textarea = document.getElementById(`trabajo-${ordenId}`);
        if (!textarea) {
            alert("Error: No se encontró el campo de texto");
            return false;
        }
        
        const trabajo = textarea.value;
        
        if (!trabajo?.trim()) {
            alert("❌ El trabajo realizado no puede estar vacío");
            return false;
        }
        
        const btn = document.activeElement;
        const originalText = btn.innerText;
        btn.innerText = 'Guardando...'; 
        btn.disabled = true;
        
        try {
            const ordenes = await StorageService.loadOrdenes();
            const ordenIndex = ordenes.findIndex(o => o.id == ordenId);
            
            if (ordenIndex === -1) {
                alert("Orden no encontrada");
                return false;
            }
            
            ordenes[ordenIndex].trabajoRealizado = trabajo;
            localStorage.setItem('ordenes', JSON.stringify(ordenes));
            
            if (typeof StorageService.updateOrden === 'function') {
                await StorageService.updateOrden(ordenId, { trabajoRealizado: trabajo });
            }
            
            await this.loadTallerPanel();
            alert("✅ Trabajo guardado correctamente");
            return true;
            
        } catch (error) {
            console.error("Error guardando trabajo:", error);
            alert("Error al guardar el trabajo realizado");
            return false;
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    },

    // Estadísticas del taller
    updateTallerStats(ordenes) {
        const pendientes = document.getElementById('pendientesCount');
        const proceso = document.getElementById('procesoCount');
        const completadas = document.getElementById('completadasCount');
        
        if (pendientes) pendientes.textContent = ordenes.filter(o => o.estado === 'pendiente').length;
        if (proceso) proceso.textContent = ordenes.filter(o => o.estado === 'en_proceso').length;
        if (completadas) completadas.textContent = ordenes.filter(o => o.estado === 'completado' || o.estado === 'terminado').length;
    },

    // Actualizar estado de orden
    async updateTallerOrderStatus(id, status) {
        if (!confirm(status === 'en_proceso' ? '¿Iniciar esta orden?' : '¿Completar esta orden?')) return;
        
        if (status === 'completado') {
            const ordenes = await StorageService.loadOrdenes();
            const orden = ordenes.find(o => o.id == id);
            
            if (!orden.trabajoRealizado || orden.trabajoRealizado.trim() === '') {
                alert("❌ Debes guardar el trabajo realizado antes de completar la orden");
                return;
            }
        }
        
        const btn = document.activeElement;
        const originalText = btn.innerText;
        btn.innerText = '...'; 
        btn.disabled = true;
        
        try {
            const ordenes = await StorageService.loadOrdenes();
            const ordenIndex = ordenes.findIndex(o => o.id == id);
            
            if (ordenIndex === -1) {
                alert("Orden no encontrada");
                return;
            }
            
            ordenes[ordenIndex].estado = status;
            localStorage.setItem('ordenes', JSON.stringify(ordenes));
            
            if (typeof StorageService.updateOrdenStatus === 'function') {
                await StorageService.updateOrdenStatus(id, status);
            }
            
            await this.loadTallerPanel();
            
        } catch (error) {
            console.error('Error actualizando orden:', error);
            alert('Error al actualizar la orden. Intenta de nuevo.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    },

    // Ver detalles
    async viewReport(id) { 
        const r = (await StorageService.loadReports()).find(r=>r.id==id);
        if (r) ModalService.show(AdminView.renderReportDetails(r)); 
        else alert("No encontrado");
    },
    
    async viewOrden(id) { 
        const o = (await StorageService.loadOrdenes()).find(o=>o.id==id);
        if (o) ModalService.show(AdminView.renderOrdenDetails(o)); 
        else alert("No encontrado");
    },
    
    // Ver supervisiones
    async viewSupervision(id) { 
        const supervisiones = JSON.parse(localStorage.getItem('supervisiones')||'[]');
        const s = supervisiones.find(s => s.id == id);
        if (s) {
            ModalService.show(this.renderSupervisionDetails(s)); 
        } else {
            alert("No encontrado");
        }
    },

    // Renderizar detalles de supervisión
    renderSupervisionDetails(s) { 
        return `
            <div style="padding: 25px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <!-- Encabezado con nombre del supervisor -->
                <div style="background: #0867ec; color: white; padding: 20px; border-radius: 12px 12px 0 0; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold;">${s.nombreSupervisor || 'ALBERTO SORIA'}</h2>
                </div>
                
                <!-- Contenido principal -->
                <div style="padding: 0 10px;">
                    <!-- Fecha y hora -->
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; color: #475569;">
                        <strong>📅 Fecha:</strong> ${s.fecha || ''} ${s.hora || ''}
                    </div>
                    
                    <!-- Pedido y cliente -->
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 15px;">
                        <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
                            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">📦 PEDIDO</div>
                            <div style="font-weight: bold; font-size: 16px;">${s.numeroPedido || '16394332'}</div>
                        </div>
                        <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
                            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">👤 CLIENTE</div>
                            <div style="font-weight: bold; font-size: 14px;">${s.nombreCliente || 'GAS EXPRES NIETO'}</div>
                        </div>
                    </div>
                    
                    <!-- Teléfono -->
                    <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <span style="background: #e2e8f0; padding: 8px; border-radius: 50%;">📞</span>
                        <div>
                            <div style="font-size: 11px; color: #64748b;">TELÉFONO</div>
                            <div style="font-weight: bold;">${s.telefonoCliente || '4421639433'}</div>
                        </div>
                    </div>
                    
                    <!-- Motivo de la queja (en rojo) -->
                    <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #dc2626;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                            <span style="color: #dc2626; font-size: 18px;">🔴</span>
                            <span style="font-weight: bold; color: #991b1b;">MOTIVO DE LA QUEJA</span>
                        </div>
                        <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 14px;">
                            ${s.motivoQueja || 'EL CLIENTE SE QUEJA PORQUE NO LE DURA EL GAS'}
                        </p>
                    </div>
                    
                    <!-- Solución brindada (en verde) -->
                    <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #16a34a;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                            <span style="color: #16a34a; font-size: 18px;">✅</span>
                            <span style="font-weight: bold; color: #166534;">SOLUCIÓN BRINDADA</span>
                        </div>
                        <p style="margin: 5px 0 0 0; color: #14532d; font-size: 14px;">
                            ${s.solucion || 'SE REVISA NOTAS DE CONSUMO Y SE REALIZA REPOSICIÓN DE GAS 20 KG.'}
                        </p>
                    </div>
                    
                    <!-- Dirección (en azul) -->
                    <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #2563eb;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                            <span style="color: #2563eb; font-size: 18px;">❌</span>
                            <span style="font-weight: bold; color: #1e40af;">DIRECCIÓN</span>
                        </div>
                        <p style="margin: 5px 0 0 0; color: #1e3a8a; font-size: 14px;">
                            ${s.ubicacion || (s.calle ? `${s.calle} ${s.numero || ''}, ${s.colonia || ''}` : 'Dirección no disponible')}
                        </p>
                    </div>
                    
                    <!-- Enlace a Google Maps -->
                    ${s.enlaceMaps ? `
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${s.enlaceMaps}" 
                               target="_blank"
                               style="display: inline-flex; align-items: center; gap: 8px; background: #1e40af; color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold;">
                                📷 Ver en Google Maps
                            </a>
                        </div>
                    ` : s.coordenadas ? `
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://www.google.com/maps?q=${s.coordenadas.lat},${s.coordenadas.lng}" 
                               target="_blank"
                               style="display: inline-flex; align-items: center; gap: 8px; background: #1e40af; color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold;">
                                📷 Ver en Google Maps
                            </a>
                        </div>
                    ` : ''}
                    
                    <!-- Fotos de evidencia (si existen) -->
                    ${s.evidenciasFotos?.length > 0 ? `
                        <div style="margin-top: 20px;">
                            <h4 style="color: #1e293b; margin-bottom: 10px;">📸 Evidencia fotográfica</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
                                ${s.evidenciasFotos.map(foto => `
                                    <img src="${foto.data}" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;">
                                `).join('')}
                            </div>
                        </div>
                    ` : s.evidenciaFoto ? `
                        <div style="margin-top: 20px;">
                            <h4 style="color: #1e293b; margin-bottom: 10px;">📸 Evidencia fotográfica</h4>
                            <img src="${s.evidenciaFoto}" style="max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;">
                        </div>
                    ` : ''}
                    
                    <!-- Firma del supervisor -->
                    ${s.firmaSupervisor ? `
                        <div style="margin-top: 25px; padding: 15px; background: #f8fafc; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: #64748b; margin-bottom: 5px;">FIRMA DEL SUPERVISOR</div>
                            <img src="${s.firmaSupervisor}" style="max-height: 60px; max-width: 100%; object-fit: contain;">
                        </div>
                    ` : ''}
                    
                    <!-- Comentario adicional -->
                    ${s.comentario ? `
                        <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-radius: 8px; font-size: 13px;">
                            <strong>📝 Comentario:</strong> ${s.comentario}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Botones de acción -->
                <div style="display: flex; gap: 10px; margin-top: 30px; padding: 0 10px 20px 10px;">
                    <button onclick="ModalService.close()"
                            style="flex: 1; padding: 12px; background: #e2e8f0; color: #475569; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                        Cerrar
                    </button>
                </div>
            </div>
        `; 
    },

    // Exportar CSV
    async exportToCSV() {
        let data = App.appState.step === 'taller-panel' ? await StorageService.loadOrdenes() :
                   App.appState.activeTab === 'checklists' ? await StorageService.loadReports() :
                   App.appState.activeTab === 'ordenes' ? await StorageService.loadOrdenes() :
                   JSON.parse(localStorage.getItem('supervisiones')||'[]');
        
        if (!data.length) return alert('Sin datos');
        
        let filtered = data;
        
        // Aplicar filtro de tipo de ruta si estamos en inspecciones
        if (App.appState.activeTab === 'checklists' && App.appState.filterTipoRuta && App.appState.filterTipoRuta !== 'Todos') {
            filtered = filtered.filter(i => i.tipoRuta === App.appState.filterTipoRuta);
        }
        
        if (App.appState.filterSearch) {
            const s = App.appState.filterSearch.toLowerCase();
            filtered = filtered.filter(i => i.operador?.toLowerCase().includes(s) || 
                                           i.unidad?.toLowerCase().includes(s) || 
                                           i.folio?.toString().includes(s) || 
                                           i.nombreSupervisor?.toLowerCase().includes(s));
        }
        
        const csv = App.appState.activeTab === 'supervisiones' ? this.exportToCSVFormat(filtered, 'supervisiones') : 
                    StorageService.exportToCSV(filtered, App.appState.activeTab === 'checklists' ? 'checklists' : 'ordenes');
        
        const url = URL.createObjectURL(new Blob(['\uFEFF'+csv], {type:'text/csv'}));
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = `export_${Date.now()}.csv`; 
        a.click(); 
        URL.revokeObjectURL(url);
        alert(`Exportados ${filtered.length} registros`);
    },
    
    exportToCSVFormat(d,t) { 
        if (t === 'supervisiones') {
            return 'Fecha,Hora,Supervisor,Pedido,Cliente,Teléfono,Motivo,Solución,Ubicación\n' + 
                   d.map(i => `${i.fecha},${i.hora},${i.nombreSupervisor},${i.numeroPedido},${i.nombreCliente},${i.telefonoCliente},${i.motivoQueja},${i.solucion},${i.ubicacion}`).join('\n');
        }
        return '';
    },

    // Mostrar opciones de exportación
    showExportOptions() {
        const isTaller = App.appState.step === 'taller-panel';
        const activeTab = isTaller ? 'ordenes' : App.appState.activeTab;

        if (activeTab === 'mapas') return alert('Esta función no aplica para el mapa.');
        
        const html = `
            <div style="padding: 24px; text-align: center; font-family: 'Inter', sans-serif;">
                <div style="width: 60px; height: 60px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                    <i class='bx bxs-file-pdf' style="font-size: 32px; color: #1e40af;"></i>
                </div>
                <h3 style="margin-bottom: 8px; color: #1e293b; font-size: 20px;">Exportar Documentos</h3>
                <p style="font-size: 13px; color: #64748b; margin-bottom: 24px;">
                    ¿Qué registros deseas exportar como PDFs individuales?
                </p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button onclick="ModalService.close(); AdminController.exportAllToPDF('filtered')" 
                            class="btn btn-primary" style="padding: 12px;">
                        <i class='bx bx-filter-alt'></i> Solo los filtrados en pantalla
                    </button>
                    <button onclick="ModalService.close(); AdminController.exportAllToPDF('all')" 
                            class="btn btn-secondary" style="padding: 12px; background: #f8fafc; color: #1e293b; border: 1px solid #e2e8f0;">
                        <i class='bx bx-list-ul'></i> Todos los registros generales
                    </button>
                    <button onclick="ModalService.close()" 
                            style="margin-top: 8px; background: transparent; border: none; color: #64748b; font-size: 13px; cursor: pointer; text-decoration: underline;">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        ModalService.show(html);
    },

    // Exportar todos los reportes filtrados a PDFs individuales (uno por uno)
    async exportAllToPDF(exportMode = 'filtered') {
        const isTaller = App.appState.step === 'taller-panel';
        const activeTab = isTaller ? 'ordenes' : App.appState.activeTab;

        // 1. Obtener los datos según la pestaña
        let items = activeTab === 'checklists' ? await StorageService.loadReports() :
                    activeTab === 'ordenes' ? await StorageService.loadOrdenes() :
                    JSON.parse(localStorage.getItem('supervisiones') || '[]');
        
        // 2. Aplicar filtros SOLO si el usuario eligió 'filtered'
        let filtered = items;
        if (exportMode === 'filtered') {
            if (isTaller) {
                if (App.appState.filterSearch) {
                    const s = App.appState.filterSearch.toLowerCase();
                    filtered = items.filter(i => i.unidad?.toLowerCase().includes(s) || 
                                             i.folio?.toString().toLowerCase().includes(s) || 
                                             i.operador?.toLowerCase().includes(s));
                }
            } else {
                filtered = items.filter(i => {
                    let itemYear, itemMonth, itemDay;
                    if (i.timestamp) {
                        const fecha = new Date(i.timestamp);
                        itemYear = fecha.getFullYear(); itemMonth = fecha.getMonth() + 1; itemDay = fecha.getDate();
                    } else if (i.fecha) {
                        if (i.fecha.includes('/')) {
                            const [dia, mes, año] = i.fecha.split('/').map(Number);
                            itemYear = año; itemMonth = mes; itemDay = dia;
                        } else if (i.fecha.includes('-')) {
                            const [año, mes, dia] = i.fecha.split('-').map(Number);
                            itemYear = año; itemMonth = mes; itemDay = dia;
                        }
                    }

                    if (App.appState.filterMonth) {
                        if (!itemYear || !itemMonth) return false;
                        const [year, month] = App.appState.filterMonth.split('-').map(Number);
                        if (itemYear !== year || itemMonth !== month) return false;
                    }

                    if (App.appState.filterDate) {
                        if (!itemYear || !itemMonth || !itemDay) return false;
                        const [year, month, day] = App.appState.filterDate.split('-').map(Number);
                        if (itemYear !== year || itemMonth !== month || itemDay !== day) return false;
                    }
                    return true;
                }).filter(i => {
                    // Filtro de tipo de ruta en la exportación
                    if (activeTab === 'checklists' && App.appState.filterTipoRuta && App.appState.filterTipoRuta !== 'Todos') {
                        if (i.tipoRuta !== App.appState.filterTipoRuta) return false;
                    }
                    
                    if (!App.appState.filterSearch) return true;
                    const s = App.appState.filterSearch.toLowerCase();
                    if (activeTab === 'supervisiones') {
                        return (i.nombreSupervisor?.toLowerCase().includes(s) || i.nombreCliente?.toLowerCase().includes(s) || i.numeroPedido?.toLowerCase().includes(s) || i.telefonoCliente?.toLowerCase().includes(s) || i.motivoQueja?.toLowerCase().includes(s) || i.ubicacion?.toLowerCase().includes(s));
                    } else {
                        return (i.operador?.toLowerCase().includes(s) || i.unidad?.toLowerCase().includes(s) || i.ecoUnidad?.toLowerCase().includes(s) || i.ruta?.toLowerCase().includes(s) || i.descripcion?.toLowerCase().includes(s) || i.descripcionFalla?.toLowerCase().includes(s) || i.folio?.toString().includes(s));
                    }
                });
            }
        }

        if (!filtered.length) return alert('No hay registros para exportar.');

        // 3. Mostrar pantalla de carga estética (Sin fondos negros)
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.9);backdrop-filter:blur(5px);color:#1e293b;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:99999;font-family:"Inter", sans-serif;';
        loadingDiv.innerHTML = `
            <div class="spinner" style="margin-bottom:24px; width:60px; height:60px; border:4px solid #e2e8f0; border-top:4px solid #1e40af; border-radius:50%; animation:spin 1s linear infinite;"></div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            <h2 style="margin:0 0 12px 0; color:#0f172a; font-size:22px;">Generando PDFs individuales</h2>
            <div style="background:#eff6ff; padding:8px 16px; border-radius:20px; border:1px solid #bfdbfe;">
                <p id="pdfProgress" style="font-size:16px; font-weight:bold; color:#1d4ed8; margin:0;">Preparando 0 de ${filtered.length}</p>
            </div>
            <p style="font-size:13px; margin-top:24px; color:#64748b; text-align:center; max-width:80%; line-height:1.5;">
                Por favor, no cierres esta ventana mientras se descargan.<br>
                Asegúrate de <strong>permitir descargas múltiples</strong> si el navegador lo solicita.
            </p>
        `;
        document.body.appendChild(loadingDiv);
        const progressText = document.getElementById('pdfProgress');

        // 4. Crear contenedor temporal
        const container = document.createElement('div');
        // IMPORTANTE: Lo colocamos fuera de pantalla pero con top:0 para evitar bugs de html2canvas
        container.style.cssText = 'position:absolute; left:-9999px; top:0; width: 800px; background: white;';
        document.body.appendChild(container);

        // 5. Procesar uno por uno secuencialmente
        try {
            for (let i = 0; i < filtered.length; i++) {
                const item = filtered[i];
                progressText.innerText = `Descargando ${i + 1} de ${filtered.length}...`;

                    // Generar el HTML completo de la vista
                let htmlContent = activeTab === 'checklists' ? AdminView.renderReportDetails(item) :
                                  activeTab === 'ordenes' ? AdminView.renderOrdenDetails(item) :
                                  this.renderSupervisionDetails(item);
                    
                    // Inyectar en el contenedor para que el DOM lo renderice
                    container.innerHTML = htmlContent;

                    // ¡AQUÍ ESTÁ LA CLAVE! 
                    // Extraemos exactamente el mismo recuadro que usa downloadPDF()
                    let elementToPrint;
                    if (activeTab === 'checklists') {
                        elementToPrint = document.getElementById(`report-content-${item.id}`);
                    } else if (activeTab === 'ordenes') {
                        elementToPrint = document.getElementById(`orden-content-${item.id}`);
                    } else {
                        elementToPrint = container.firstElementChild; // Supervisiones no tiene ID interno
                    }

                    // Asegurarnos de ocultar botones si llegara a existir alguno dentro
                    const style = document.createElement('style');
                    style.innerHTML = '.btn, button { display: none !important; }';
                    if (elementToPrint) elementToPrint.appendChild(style);
                
                let prefix = activeTab === 'checklists' ? 'Inspeccion_' + (item.ecoUnidad || '') :
                             activeTab === 'ordenes' ? 'Orden_' + (item.folio || '') :
                             'Supervision_' + ((item.nombreSupervisor || '').split(' ')[0]);
                
                // Se agregó ID único al nombre del archivo para que el navegador no los empalme o cancele
                let filename = `${prefix}_${(item.fecha || '').replace(/\//g, '-')}_${item.id || i}`;

                    // Opciones idénticas a la función downloadPDF original
                const opt = {
                    margin: [0.5, 0.5, 0.5, 0.5],
                    filename: `${filename}.pdf`,
                    image: { type: 'jpeg', quality: 0.95 },
                        html2canvas: { scale: 2, letterRendering: true, useCORS: true, logging: false, scrollY: 0, scrollX: 0 },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };

                    await html2pdf().set(opt).from(elementToPrint || container).save();
                // Damos un poco más de tiempo (1.2 seg) entre descargas para no trabar el navegador
                await new Promise(resolve => setTimeout(resolve, 1200));
            }
            
            ModalService.show(`
                <div style="padding: 30px; text-align: center; font-family: 'Inter', sans-serif;">
                    <div style="width: 60px; height: 60px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <i class='bx bx-check' style="font-size: 40px; color: #16a34a;"></i>
                    </div>
                    <h2 style="color: #166534; margin-bottom: 12px; font-size: 22px;">¡Descarga Completada!</h2>
                    <p style="color: #475569; margin-bottom: 24px; font-size: 14px;">Se han descargado <strong>${filtered.length}</strong> documentos PDF en tu dispositivo.</p>
                    <button onclick="ModalService.close()" class="btn btn-success" style="width: auto; padding: 10px 30px;">Aceptar</button>
                </div>
            `);
        } catch (error) {
            console.error('Error generando PDFs:', error);
            alert('Ocurrió un error al generar los PDFs. Verifica la consola para más detalles.');
        } finally {
            document.body.removeChild(loadingDiv);
            document.body.removeChild(container);
        }
    },

    // Limpiar todo
    async clearAllReports() {
        const code = prompt("Código de seguridad:");
        if (code !== this.SECRET_CLEAN_CODE) return alert("❌ Código incorrecto");
        if (!confirm("¿Eliminar todos los registros?")) return;
        
        if (App.appState.activeTab === 'checklists') await StorageService.clearReports();
        else if (App.appState.activeTab === 'ordenes') await StorageService.clearOrdenes();
        else localStorage.removeItem('supervisiones');
        
        this.loadReportsIntoPanel();
    },

    // Gráfica
    updateStatsChart(d, t) {
        if (!Chart) return;
        const ctx = document.getElementById('statsChart');
        if (!ctx) return;
        if (this.chartInstance) this.chartInstance.destroy();
        
        let labels, values, backgroundColor;
        
        if (t === 'checklists') {
            labels = ['✅ Aprobados', '❌ Con Fallas'];
            values = [
                d.filter(r => !Object.values(r.evaluaciones || {}).includes('rechazado')).length,
                d.filter(r => Object.values(r.evaluaciones || {}).includes('rechazado')).length
            ];
            backgroundColor = ['#22c55e', '#dc2626'];
        } else if (t === 'ordenes') {
            labels = ['⏳ Pendientes', '🔄 En Proceso', '✅ Completados'];
            values = [
                d.filter(o => o.estado === 'pendiente').length,
                d.filter(o => o.estado === 'en_proceso').length,
                d.filter(o => o.estado === 'completado' || o.estado === 'terminado').length
            ];
            backgroundColor = ['#f59e0b', '#3b82f6', '#22c55e'];
        } else {
            // supervisiones
            const supervisores = d.reduce((acc, curr) => {
                const nombre = curr.nombreSupervisor || 'Sin supervisor';
                acc[nombre] = (acc[nombre] || 0) + 1;
                return acc;
            }, {});
            
            labels = Object.keys(supervisores);
            values = Object.values(supervisores);
            backgroundColor = ['#0867ec', '#4f9ef7', '#7bb3f9', '#a8c4f0', '#cbdcf7'];
        }
        
        this.chartInstance = new Chart(ctx, {
            type: t === 'supervisiones' ? 'bar' : 'doughnut',
            data: { 
                labels, 
                datasets: [{ 
                    data: values, 
                    backgroundColor: backgroundColor 
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { 
                        position: 'bottom' 
                    } 
                } 
            }
        });
    },

    // FUNCIÓN PARA DESCARGAR PDF
    downloadPDF(elementId, fileName) {
        if (typeof html2pdf === 'undefined') {
            alert("Error: La librería html2pdf no está cargada");
            return Promise.reject();
        }
        
        const element = document.getElementById(elementId);
        if (!element) {
            alert("Error: No se encontró el elemento a imprimir");
            return;
        }
        
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.8);backdrop-filter:blur(4px);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:10000;';
        loadingDiv.innerHTML = `
            <div style="background:white;padding:30px;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.1);text-align:center;border:1px solid #f1f5f9;">
                <div class="spinner" style="margin:0 auto 15px auto; width:40px; height:40px; border:3px solid #e2e8f0; border-top:3px solid #1e40af;"></div>
                <p style="color:#1e293b; font-weight:600; margin:0; font-family:'Inter', sans-serif;">Generando documento PDF...</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);
        
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `${fileName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, letterRendering: true, useCORS: true, logging: false, scrollY: 0, scrollX: 0 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        return html2pdf().set(opt).from(element).save()
            .then(() => {
                document.body.removeChild(loadingDiv);
            })
            .catch((error) => {
                document.body.removeChild(loadingDiv);
                console.error('Error generando PDF:', error);
                alert('Error al generar el PDF. Intenta de nuevo.');
            });
    },

    async generatePdfBlob(eId) { 
        return typeof html2pdf !== 'undefined' ? html2pdf().from(document.getElementById(eId)).output('blob') : null; 
    },
    
    async sendOrdenEmail(oId) { 
        console.log('Enviar email', oId); 
    },
    
    // Agrega estas dos funciones al final del objeto AdminController
    showPasswordModal() {
        if (App.appState.userRole !== 'admin') return alert("❌ Solo los administradores principales pueden cambiar contraseñas.");
        
        const html = `
            <div style="padding: 20px; text-align: left; font-family: Arial, sans-serif;">
                <h3 style="margin-bottom: 15px; color: #1e293b; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                    <img src="${CONFIG.LOGO_URL}" alt="Gen Logo" style="height: 28px; object-fit: contain;">
                    Cambiar Contraseña
                </h3>
                <p style="font-size: 12px; color: #64748b; margin-bottom: 15px;">
                    Ingresa el correo del empleado y su nueva contraseña.
                </p>
                <form onsubmit="AdminController.handlePasswordReset(event)">
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-size: 12px; font-weight: bold;">Correo</label>
                        <input type="email" id="resetEmail" required style="width: 100%; padding: 10px; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 12px; font-weight: bold;">Nueva Contraseña</label>
                        <input type="password" id="resetPassword" required minlength="6" style="width: 100%; padding: 10px; border-radius: 6px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" onclick="ModalService.close()" class="btn btn-secondary">Cancelar</button>
                        <button type="submit" id="btnResetPwd" class="btn btn-primary">Actualizar</button>
                    </div>
                </form>
            </div>
        `;
        ModalService.show(html);
    },

    async handlePasswordReset(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();
        const password = document.getElementById('resetPassword').value;
        const btn = document.getElementById('btnResetPwd');

        if(!confirm(`¿Estás seguro de cambiar la contraseña de "${email}"?`)) return;

        btn.disabled = true;
        btn.innerText = "Actualizando...";

        try {
            await StorageService.resetUserPassword(email, password);
            ModalService.show(`
                <div style="padding: 30px; text-align: center; font-family: 'Inter', sans-serif;">
                    <div style="width: 60px; height: 60px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <i class='bx bx-check' style="font-size: 40px; color: #16a34a;"></i>
                    </div>
                    <h2 style="color: #166534; margin-bottom: 12px; font-size: 20px;">Contraseña Actualizada</h2>
                    <p style="color: #475569; margin-bottom: 24px; font-size: 14px;">La contraseña de <strong>${email}</strong> fue cambiada exitosamente.</p>
                    <button onclick="ModalService.close()" class="btn btn-success" style="width: auto; padding: 10px 30px;">Aceptar</button>
                </div>
            `);
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        } finally {
            btn.disabled = false;
            btn.innerText = "Actualizar";
        }
    }
};

if (typeof window !== 'undefined') window.AdminController = AdminController;