// modal-controller.js - Controlador para modales

const ModalService = {
    currentModal: null,
    
    // Mostrar modal
    show(content) {
        // Cerrar modal anterior si existe
        this.close();
        
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.zIndex = '10000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.padding = '20px';
        modal.style.overflowY = 'auto';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; max-height: 90vh; overflow-y: auto; width: 100%; max-width: 800px; margin: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                ${content}
            </div>
        `;
        
        // Función para cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    },
    
    // Cerrar modal
    close() {
        if (this.currentModal && document.body.contains(this.currentModal)) {
            document.body.removeChild(this.currentModal);
            this.currentModal = null;
            // Restaurar scroll
            document.body.style.overflow = '';
        }
    }
};

// Exportar servicio para uso global
if (typeof window !== 'undefined') {
    window.ModalService = ModalService;
}