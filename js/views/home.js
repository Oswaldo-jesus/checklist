// home.js - Vista de la página principal

const HomeView = {
    render() {
        return `
            <div class="container">
                <div style="text-align: center; padding: 30px 20px;">
                    <img src="${CONFIG.LOGO_URL}" alt="Logo" style="height: 80px; margin-bottom: 15px;">
                    <h1 style="font-size: 32px; color: #1e293b; margin-bottom: 8px;">
                        Gen <span style="color: #dc2626;">Checklist</span>
                    </h1>
                    <p style="color: #64748b; font-size: 12px; margin-bottom: 30px;">
                        Control de unidades - Planta Qro
                    </p>
                    
                    <div class="home-buttons">
                        <button onclick="App.goToStep('form')" class="btn btn-primary">
                            📋 Nuevo CHECK LIST
                        </button>
                        
                        <button onclick="App.goToStep('orden-servicio')" class="btn btn-warning">
                            🔧 Orden de Servicio
                        </button>
                        
                        <button onclick="App.goToStep('admin-panel')" class="btn btn-secondary">
                            👨‍💼 Panel Supervisor
                        </button>
                        
                        <button onclick="App.goToStep('taller-panel')" class="btn" style="background: #334155; color: white;">
                            🛻 Panel Taller
                        </button>

                        <button onclick="App.goToStep('geocercas')" class="btn" style="background: #dd08ec; color: white;">
                            📍 GEOCERCAS
                        </button>

                        <button onclick="App.goToStep('supervision-form')" class="btn" style="background: #0867ec; color: white;">
                            👨‍🔧 SUPERVISIÓN EN CAMPO
                        </button>       

                        <button onclick="AuthController.logout()" class="btn" style="background: #ef4444; color: white; margin-top: 15px;">
                            🚪 Cerrar Sesión
                        </button>

                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value stat-checklist" id="stat-checklist">--</div>
                            <div class="stat-label">Check list de Hoy</div>
                            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;" id="todayDate"></div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value stat-ordenes" id="stat-ordenes">--</div>
                            <div class="stat-label">Órdenes de Hoy</div>
                            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;" id="todayDate2"></div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 12px;">
                        <p style="font-size: 12px; color: #64748b;">
                            <strong>Nota importante:</strong> Este es un reporte de revisión diaria, por lo que no sustituye al reporte de fallas a taller. Para reportes de fallas, utiliza "Orden de Servicio".
                        </p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Función para obtener la fecha actual en formato YYYY-MM-DD
    getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // Función para obtener fecha en formato legible
    getTodayFormatted() {
        const today = new Date();
        return today.toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },
    
    // Actualizar estadísticas del día
    async updateStats() {
        try {
            const reports = await StorageService.loadReports();
            const ordenes = await StorageService.loadOrdenes();
            
            const todayStr = this.getTodayDate();
            const todayFormatted = this.getTodayFormatted();
            
            const todayReports = reports.filter(report => {
                if (report.timestamp) {
                    const reportDate = new Date(report.timestamp);
                    const reportDateStr = reportDate.toISOString().split('T')[0];
                    return reportDateStr === todayStr;
                }
                else if (report.fecha) {
                    const parts = report.fecha.split('/');
                    if (parts.length === 3) {
                        const reportDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        return reportDateStr === todayStr;
                    }
                }
                return false;
            });
            
            const todayOrdenes = ordenes.filter(orden => {
                if (orden.timestamp) {
                    const ordenDate = new Date(orden.timestamp);
                    const ordenDateStr = ordenDate.toISOString().split('T')[0];
                    return ordenDateStr === todayStr;
                }
                else if (orden.fecha) {
                    const parts = orden.fecha.split('/');
                    if (parts.length === 3) {
                        const ordenDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        return ordenDateStr === todayStr;
                    }
                }
                return false;
            });
            
            const elCheck = document.getElementById('stat-checklist');
            const elOrden = document.getElementById('stat-ordenes');
            const elDate = document.getElementById('todayDate');
            const elDate2 = document.getElementById('todayDate2');
            
            if (elCheck) {
                elCheck.textContent = todayReports.length;
                elCheck.style.transform = 'scale(1.1)';
                setTimeout(() => elCheck.style.transform = 'scale(1)', 200);
            }
            
            if (elOrden) {
                elOrden.textContent = todayOrdenes.length;
                elOrden.style.transform = 'scale(1.1)';
                setTimeout(() => elOrden.style.transform = 'scale(1)', 200);
            }
            
            if (elDate) {
                const fechaCapitalized = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);
                elDate.textContent = fechaCapitalized;
            }
            
            if (elDate2) {
                elDate2.textContent = todayFormatted;
            }
            
        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
            const elCheck = document.getElementById('stat-checklist');
            const elOrden = document.getElementById('stat-ordenes');
            if (elCheck) elCheck.textContent = '0';
            if (elOrden) elOrden.textContent = '0';
        }
    }
};

// Exportar vista para uso global
if (typeof window !== 'undefined') {
    window.HomeView = HomeView;
}