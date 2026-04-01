// app.js - Aplicación principal

const App = {
    // Estado de la aplicación
    appState: {
        step: 'home',
        evaluations: {},
        photos: {},
        signature: null,
        isSubmitting: false,
        reports: [],
        ordenes: [],
        supervisiones: [],
        filterDate: '',
        filterSearch: '',
        activeTab: 'checklists',
        formData: { operador: '', eco: '', km: '', ruta: '', observaciones: '' },
        ordenData: { 
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
        },
        supervisionData: {
            nombreSupervisor: '',
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            numeroPedido: '',
            telefonoCliente: '',
            nombreCliente: '',
            calle: '',
            numero: '',
            colonia: '',
            ubicacion: '',
            detalleVisita: '',
            motivoQueja: '',
            comentario: '',
            solucion: '',
            evidenciaFoto: null,
            firmaSupervisor: null
        },
        firmaChofer: null,
        firmaTaller: null,
        userRole: null
    },
    
    // Navegar a un paso específico (MODIFICADO - Agregada limpieza de firmas)
    goToStep(step) {
        // Si estamos saliendo de orden-verificar, limpiar las firmas
        if (this.appState.step === 'orden-verificar' && step !== 'orden-verificar') {
            const tallerCanvas = document.getElementById('firmaTallerCanvas');
            if (tallerCanvas) {
                tallerCanvas.getContext('2d')?.clearRect(0, 0, tallerCanvas.width, tallerCanvas.height);
            }
            const choferCanvas = document.getElementById('firmaChoferCanvas');
            if (choferCanvas) {
                choferCanvas.getContext('2d')?.clearRect(0, 0, choferCanvas.width, choferCanvas.height);
            }
            this.appState.firmaTaller = null;
            this.appState.firmaChofer = null;
        }
        
        this.appState.step = step;
        this.render();
    },
    
    // Inicializar componentes específicos del paso actual (MODIFICADO)
    initStepComponents() {
        switch(this.appState.step) {
            case 'form':
                SignatureController.initSignatureCanvas();
                break;
            case 'orden-verificar':
                SignatureController.initFirmaCanvas('firmaTallerCanvas', 'taller');
                SignatureController.initFirmaCanvas('firmaChoferCanvas', 'chofer');
                // Limpiar firmas anteriores
                if (SignatureController.limpiarFirmaTaller) {
                    SignatureController.limpiarFirmaTaller(this.appState);
                }
                if (SignatureController.limpiarFirmaChofer) {
                    SignatureController.limpiarFirmaChofer(this.appState);
                }
                break;
            case 'supervision-form':
                SignatureController.initSupervisionCanvas();
                break;
            case 'admin-panel':
                AdminController.loadReportsIntoPanel();
                break;
            case 'taller-panel':
                AdminController.loadTallerPanel();
                break;
            case 'home':
                this.updateHomeStats();
                setTimeout(() => {
                    HomeView.updateStats();
                }, 100);
                break;
            case 'geocercas':
                setTimeout(() => {
                    if (GeocercasView.initMap) GeocercasView.initMap();
                }, 100);
                break;
        }
    },
    
    // Renderizar la aplicación
    render() {
        const app = document.getElementById('app');
        if (!app) return;
        
        switch(this.appState.step) {
            case 'home':
                app.innerHTML = HomeView.render();
                setTimeout(() => {
                    HomeView.updateStats();
                }, 100);
                break;
            case 'form':
                app.innerHTML = FormView.render(this.appState);
                break;
            case 'orden-servicio':
                app.innerHTML = OrdenServicioView.render(this.appState);
                break;
            case 'orden-verificar':
                app.innerHTML = OrdenVerificarView.render(this.appState);
                break;
            case 'admin-login':
                app.innerHTML = AdminView.renderLogin();
                break;
            case 'taller-login':
                app.innerHTML = AdminView.renderTallerLogin();
                break;
            case 'admin-panel':
                app.innerHTML = AdminView.renderPanel(this.appState);
                break;
            case 'taller-panel':
                app.innerHTML = AdminView.renderTallerPanel(this.appState);
                break;
            case 'success':
                app.innerHTML = SuccessView.renderChecklistSuccess();
                break;
            case 'orden-success':
                app.innerHTML = SuccessView.renderOrdenSuccess(this.appState.ordenData);
                break;
            case 'geocercas':
                app.innerHTML = GeocercasView.render();
                setTimeout(() => {
                    if (GeocercasView.initMap) GeocercasView.initMap();
                }, 100);
                break;
            case 'supervision':
                app.innerHTML = SupervisionView.renderLogin();
                break;
            case 'supervision-form':
                app.innerHTML = SupervisionView.renderForm(this.appState);
                break;
            case 'supervision-success':
                app.innerHTML = SuccessView.renderSupervisionSuccess();
                break;
            default:
                app.innerHTML = HomeView.render();
                setTimeout(() => {
                    HomeView.updateStats();
                }, 100);
        }
        
        setTimeout(() => {
            this.initStepComponents();
        }, 50);
    }, // <-- ESTA COMA ES IMPORTANTE
    
    // Inicializar la aplicación
    init() {
        setTimeout(() => {
            this.goToStep('home');
        }, 500);
    },

    // Actualizar estadísticas del home
    async updateHomeStats() {
        const reports = await StorageService.loadReports();
        const ordenes = await StorageService.loadOrdenes();
        const elCheck = document.getElementById('stat-checklist');
        const elOrden = document.getElementById('stat-ordenes');
        if(elCheck) elCheck.textContent = reports.length;
        if(elOrden) elOrden.textContent = ordenes.length;
    }
}; // <-- CIERRE DEL OBJETO App

// Inicializar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Exportar aplicación para uso global
if (typeof window !== 'undefined') {
    window.App = App;
}