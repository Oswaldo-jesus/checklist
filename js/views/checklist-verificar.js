// checklist-verificar.js - Vista de previsualización del checklist

const ChecklistVerificarView = {
    render(appState) {
        const now = new Date();
        
        // Construir un objeto "reporte" borrador para reutilizar la vista de detalles
        const draftReport = {
            id: 'preview',
            tipoRuta: appState.formData.tipoRuta || 'Utilitario',
            operador: appState.formData.operador?.toUpperCase() || '____________________',
            ecoUnidad: appState.formData.eco?.toUpperCase() || '__________',
            km: parseInt(appState.formData.km) || 0,
            ruta: appState.formData.ruta?.toUpperCase() || '',
            evaluaciones: { ...appState.evaluations },
            fotos: { ...appState.photos },
            observaciones: appState.formData.observaciones || 'Ninguna',
            firma: appState.signature || null,
            fecha: now.toLocaleDateString('es-MX'),
            hora: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        };

        // Aprovechamos la función de AdminView para generar el formato
        let html = AdminView.renderReportDetails(draftReport);

        // Reemplazamos los botones originales (Cerrar / Descargar PDF) por los de Verificación
        html = html.replace(
            /<div style="display: flex; gap: 10px; margin-top: 20px;">[\s\S]*?<\/div>/,
            `<div style="display: flex; gap: 10px; margin-top: 20px; position: sticky; bottom: 0; background: white; padding: 15px 0; border-top: 1px solid #e2e8f0; z-index: 100;">
                <button type="button" onclick="App.goToStep('form')" class="btn btn-secondary" style="flex: 1; font-size: 15px;">
                    📝 Volver a editar
                </button>
                <button type="button" onclick="FormController.submitFromPreview(App.appState)" class="btn btn-success" style="flex: 1; font-size: 15px;" id="btnSubmitPreview">
                    ✅ Confirmar y Guardar
                </button>
            </div>`
        );

        return `
            <div>
                <!-- Header -->
                <div class="header" style="background: #1e40af; border-bottom: none; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 12px 16px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="App.goToStep('form')" class="btn-icon" style="color: white; font-size: 26px; width: auto; height: auto;">
                            <i class='bx bx-arrow-back'></i>
                        </button>
                        <div class="logo" style="font-weight: 600; font-size: 16px; color: white;">Verificar Checklist</div>
                    </div>
                </div>
                
                <!-- Contenido de Previsualización -->
                <div style="background: #f1f5f9; min-height: 100vh; padding-top: 10px;">
                    ${html}
                </div>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.ChecklistVerificarView = ChecklistVerificarView;
}