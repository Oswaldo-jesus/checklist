// signature-controller.js - Controlador para firmas digitales

const SignatureController = {
    // Variables para el canvas de firma
    sigCanvas: null,
    sigCtx: null,
    drawing: false,
    
    // Variables para firmas de orden
    firmaCanvasTaller: null,
    firmaCanvasChofer: null,
    firmaCtxTaller: null,
    firmaCtxChofer: null,
    drawingTaller: false,
    drawingChofer: false,

    // Variables para firma de supervisión
    supervisionCanvas: null,
    supervisionCtx: null,
    drawingSupervision: false,
    
    // Inicializar canvas de firma del checklist
    initSignatureCanvas() {
        this.sigCanvas = document.getElementById('sigCanvas');
        if (!this.sigCanvas) return;
        
        this.sigCtx = this.sigCanvas.getContext('2d');
        const rect = this.sigCanvas.parentNode.getBoundingClientRect();
        this.sigCanvas.width = rect.width;
        this.sigCanvas.height = rect.height;
        
        this.sigCtx.lineWidth = 2;
        this.sigCtx.lineCap = 'round';
        this.sigCtx.lineJoin = 'round';
        this.sigCtx.strokeStyle = '#1e293b';
        
        if (App.appState.signature) {
            const img = new Image();
            img.onload = () => {
                this.sigCtx.drawImage(img, 0, 0);
            };
            img.src = App.appState.signature;
        }
        
        const getPos = (e) => {
            const b = this.sigCanvas.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - b.left;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - b.top;
            return { x, y };
        };
        
        const start = (e) => { 
            if (e.type === 'touchstart') e.preventDefault();
            this.drawing = true; 
            const p = getPos(e); 
            this.sigCtx.beginPath(); 
            this.sigCtx.moveTo(p.x, p.y); 
        };
        
        const move = (e) => { 
            if (!this.drawing) return;
            e.preventDefault(); 
            const p = getPos(e); 
            this.sigCtx.lineTo(p.x, p.y); 
            this.sigCtx.stroke(); 
        };
        
        const stop = () => { 
            if (this.drawing) {
                this.drawing = false;
                App.appState.signature = this.sigCanvas.toDataURL();
            }
        };
        
        this.sigCanvas.addEventListener('mousedown', start);
        this.sigCanvas.addEventListener('mousemove', move);
        this.sigCanvas.addEventListener('mouseup', stop);
        this.sigCanvas.addEventListener('touchstart', start, { passive: false });
        this.sigCanvas.addEventListener('touchmove', move, { passive: false });
        this.sigCanvas.addEventListener('touchend', stop);
    },
    
    // Limpiar firma del checklist
    clearSignature(appState) {
        if (this.sigCtx) {
            this.sigCtx.clearRect(0, 0, this.sigCanvas.width, this.sigCanvas.height);
            appState.signature = null;
        }
    },
    
    // Inicializar canvas de firma para orden
    initFirmaCanvas(canvasId, tipo) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        if (tipo === 'taller') {
            this.firmaCanvasTaller = canvas;
            this.firmaCtxTaller = ctx;
        } else {
            this.firmaCanvasChofer = canvas;
            this.firmaCtxChofer = ctx;
        }
        
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e293b';
        
        const getPos = (e) => {
            const b = canvas.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - b.left;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - b.top;
            return { x, y };
        };
        
        const start = (e) => { 
            if (e.type === 'touchstart') e.preventDefault();
            if (tipo === 'taller') this.drawingTaller = true;
            else this.drawingChofer = true;
            
            const p = getPos(e); 
            ctx.beginPath(); 
            ctx.moveTo(p.x, p.y); 
        };
        
        const move = (e) => { 
            if ((tipo === 'taller' && !this.drawingTaller) || (tipo === 'chofer' && !this.drawingChofer)) return;
            
            e.preventDefault(); 
            const p = getPos(e); 
            ctx.lineTo(p.x, p.y); 
            ctx.stroke(); 
        };
        
        const stop = () => { 
            if (tipo === 'taller') {
                if (this.drawingTaller) {
                    this.drawingTaller = false;
                    App.appState.firmaTaller = this.firmaCanvasTaller.toDataURL();
                }
            } else {
                if (this.drawingChofer) {
                    this.drawingChofer = false;
                    App.appState.firmaChofer = this.firmaCanvasChofer.toDataURL();
                }
            }
        };
        
        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', move);
        canvas.addEventListener('mouseup', stop);
        canvas.addEventListener('touchstart', start, { passive: false });
        canvas.addEventListener('touchmove', move, { passive: false });
        canvas.addEventListener('touchend', stop);
    },
    
    // Limpiar firma de orden
    limpiarFirma(tipo, appState) {
        if (tipo === 'taller' && this.firmaCtxTaller) {
            this.firmaCtxTaller.clearRect(0, 0, this.firmaCanvasTaller.width, this.firmaCanvasTaller.height);
            appState.firmaTaller = null;
        } else if (tipo === 'chofer' && this.firmaCtxChofer) {
            this.firmaCtxChofer.clearRect(0, 0, this.firmaCanvasChofer.width, this.firmaCanvasChofer.height);
            appState.firmaChofer = null;
        }
    },
    
    // Limpiar firma de taller específicamente
    limpiarFirmaTaller(appState) {
        if (this.firmaCtxTaller) {
            this.firmaCtxTaller.clearRect(0, 0, this.firmaCanvasTaller.width, this.firmaCanvasTaller.height);
            appState.firmaTaller = null;
        }
    },
    
    // Limpiar firma de chofer específicamente
    limpiarFirmaChofer(appState) {
        if (this.firmaCtxChofer) {
            this.firmaCtxChofer.clearRect(0, 0, this.firmaCanvasChofer.width, this.firmaCanvasChofer.height);
            appState.firmaChofer = null;
        }
    },

    // Inicializar canvas de firma para supervisión
    initSupervisionCanvas() {
        this.supervisionCanvas = document.getElementById('supervisionSigCanvas');
        if (!this.supervisionCanvas) return;
        
        this.supervisionCtx = this.supervisionCanvas.getContext('2d');
        const rect = this.supervisionCanvas.parentNode.getBoundingClientRect();
        this.supervisionCanvas.width = rect.width;
        this.supervisionCanvas.height = rect.height;
        
        this.supervisionCtx.lineWidth = 2;
        this.supervisionCtx.lineCap = 'round';
        this.supervisionCtx.lineJoin = 'round';
        this.supervisionCtx.strokeStyle = '#1e293b';
        
        if (App.appState.supervisionData.firmaSupervisor) {
            const img = new Image();
            img.onload = () => {
                this.supervisionCtx.drawImage(img, 0, 0);
            };
            img.src = App.appState.supervisionData.firmaSupervisor;
        }
        
        const getPos = (e) => {
            const b = this.supervisionCanvas.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - b.left;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - b.top;
            return { x, y };
        };
        
        const start = (e) => { 
            if (e.type === 'touchstart') e.preventDefault();
            this.drawingSupervision = true; 
            const p = getPos(e); 
            this.supervisionCtx.beginPath(); 
            this.supervisionCtx.moveTo(p.x, p.y); 
        };
        
        const move = (e) => { 
            if (!this.drawingSupervision) return;
            e.preventDefault(); 
            const p = getPos(e); 
            this.supervisionCtx.lineTo(p.x, p.y); 
            this.supervisionCtx.stroke(); 
        };
        
        const stop = () => { 
            if (this.drawingSupervision) {
                this.drawingSupervision = false;
                App.appState.supervisionData.firmaSupervisor = this.supervisionCanvas.toDataURL();
            }
        };
        
        this.supervisionCanvas.addEventListener('mousedown', start);
        this.supervisionCanvas.addEventListener('mousemove', move);
        this.supervisionCanvas.addEventListener('mouseup', stop);
        this.supervisionCanvas.addEventListener('touchstart', start, { passive: false });
        this.supervisionCanvas.addEventListener('touchmove', move, { passive: false });
        this.supervisionCanvas.addEventListener('touchend', stop);
    },

    // Limpiar firma de supervisión
    clearSupervisionSignature(appState) {
        if (this.supervisionCtx) {
            this.supervisionCtx.clearRect(0, 0, this.supervisionCanvas.width, this.supervisionCanvas.height);
            appState.supervisionData.firmaSupervisor = null;
        }
    }
};

// Exportar controlador para uso global
if (typeof window !== 'undefined') {
    window.SignatureController = SignatureController;
}