// orden-servicio.js - Vista del formulario de orden de servicio

const OrdenServicioView = {
    render(appState) {
        const today = new Date();
        const fechaFormatted = today.toLocaleDateString('es-MX');
        
        return `
            <div>
                <div class="header" style="background: #1e40af; border-bottom: none; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="toggleMenu()" class="btn-icon" style="color: white; font-size: 26px;">
                            <i class='bx bx-menu'></i>
                        </button>
                        <img src="${CONFIG.LOGO_URL}" onclick="toggleMenu()" alt="Logo" style="height: 35px; cursor: pointer; object-fit: contain;">
                        <div class="logo" style="font-weight: 600; font-size: 16px; color: white;">Orden de Servicio</div>
                    </div>
                    <button onclick="App.goToStep('home')" class="btn-icon" title="Volver al inicio" style="color: white;">
                        <i class='bx bx-home-alt'></i>
                    </button>
                </div>
                
                <div class="container">
                    <form id="ordenForm" onsubmit="OrdenController.handleSubmit(event, App.appState)">
                        <div class="card">
                            <h3 style="margin-bottom: 16px; color: #1e293b;">📋 Datos de la Orden</h3>
                            
                            <div class="grid-responsive" style="margin-bottom: 0;">
                                <div class="form-group">
                                    <label>Unidad</label>
                                    <input type="text" 
                                           id="ordenUnidad" 
                                           value="${appState.ordenData.unidad}"
                                           oninput="OrdenController.updateOrdenData('unidad', this.value, App.appState)"
                                           placeholder="Ej: GU-1260"
                                           list="units-list"
                                           required>
                                    <datalist id="units-list">
                                        ${CONFIG.UNITS.map(unit => `<option value="${unit}">`).join('')}
                                    </datalist>
                                </div>
                                
                                <div class="form-group">
                                    <label>Kilometraje</label>
                                    <input type="number" 
                                           id="ordenKilometro" 
                                           value="${appState.ordenData.kilometro}"
                                           oninput="OrdenController.updateOrdenData('kilometro', this.value, App.appState)"
                                           placeholder="KM actual"
                                           required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Responsable del Vehículo (Chofer)</label>
                                <input type="text" 
                                       id="ordenOperador" 
                                       value="${appState.ordenData.operador}"
                                       oninput="OrdenController.updateOrdenData('operador', this.value, App.appState)"
                                       placeholder="Nombre del operador"
                                       list="operators-list"
                                       required>
                                <datalist id="operators-list">
                                    ${CONFIG.OPERATORS.map(op => `<option value="${op}">`).join('')}
                                </datalist>
                            </div>
                            
                            <div class="grid-responsive" style="margin-bottom: 16px;">
                                <div class="form-group">
                                    <label>Hora del Reporte</label>
                                    <input type="time" 
                                           id="ordenHoraReporte" 
                                           value="${appState.ordenData.horaReporte}"
                                           oninput="OrdenController.updateOrdenData('horaReporte', this.value, App.appState)"
                                           required>
                                </div>
                                
                                <div class="form-group">
                                    <label>Hora Término Reparación</label>
                                    <input type="time" 
                                           id="ordenHoraTermino" 
                                           value="${appState.ordenData.horaTermino}"
                                           oninput="OrdenController.updateOrdenData('horaTermino', this.value, App.appState)"
                                           required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Tiempo Muerto de Unidad (HH:MM)</label>
                                <input type="text" 
                                       id="ordenTiempoMuerto" 
                                       value="${appState.ordenData.tiempoMuerto}"
                                       oninput="OrdenController.updateOrdenData('tiempoMuerto', this.value, App.appState)"
                                       placeholder="Ej: 02:30"
                                       required>
                            </div>
                            
                            <div class="form-group">
                                <label>Lugar del Mantenimiento</label>
                                <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 8px;">
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                        <input type="radio" 
                                               name="mantenimientoLugar" 
                                               value="taller" 
                                               ${appState.ordenData.mantenimientoLugar === 'taller' ? 'checked' : ''}
                                               onchange="OrdenController.updateOrdenData('mantenimientoLugar', this.value, App.appState)"
                                               style="width: 18px; height: 18px; margin: 0; flex-shrink: 0; cursor: pointer;">
                                        <span style="color: #334155;">Taller</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                        <input type="radio" 
                                               name="mantenimientoLugar" 
                                               value="ruta" 
                                               ${appState.ordenData.mantenimientoLugar === 'ruta' ? 'checked' : ''}
                                               onchange="OrdenController.updateOrdenData('mantenimientoLugar', this.value, App.appState)"
                                               style="width: 18px; height: 18px; margin: 0; flex-shrink: 0; cursor: pointer;">
                                        <span style="color: #334155;">Ruta</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Tipo de Mantenimiento</label>
                                <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 8px;">
                                    ${CONFIG.TIPOS_MANTENIMIENTO.map(tipo => {
                                        const value = tipo.toLowerCase().includes('correctivo') ? 'correctivo' : 
                                                     tipo.toLowerCase().includes('preventivo') ? 'preventivo' : 'otras';
                                        return `
                                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                                <input type="radio" 
                                                       name="tipoMantenimiento" 
                                                       value="${value}"
                                                       ${appState.ordenData.tipoMantenimiento === value ? 'checked' : ''}
                                                       onchange="OrdenController.updateOrdenData('tipoMantenimiento', this.value, App.appState)"
                                                       style="width: 18px; height: 18px; margin: 0; flex-shrink: 0; cursor: pointer;">
                                                <span style="color: #334155;">${tipo}</span>
                                            </label>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Descripción Detallada de la Falla</label>
                                <textarea id="ordenDescripcionFalla" 
                                          oninput="OrdenController.updateOrdenData('descripcionFalla', this.value, App.appState)"
                                          placeholder="Describe la falla con detalle, síntomas, condiciones en que ocurre, etc..."
                                          rows="4"
                                          required>${appState.ordenData.descripcionFalla}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Trabajo Realizado por el Taller</label>
                                <textarea id="ordenTrabajoRealizado" 
                                          oninput="OrdenController.updateOrdenData('trabajoRealizado', this.value, App.appState)"
                                          placeholder="Describe el trabajo realizado por el taller..."
                                          rows="4"
                                          required>${appState.ordenData.trabajoRealizado}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Puntos Críticos Revisados (Selecciona los verificados)</label>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 8px;">
                                    ${CONFIG.PUNTOS_CRITICOS.map((punto, index) => `
                                        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; padding: 10px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; height: 100%; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                                            <input type="checkbox" 
                                                   value="${punto}"
                                                   ${appState.ordenData.puntosCriticos.includes(punto) ? 'checked' : ''}
                                               onchange="OrdenController.togglePuntoCritico('${punto}', this.checked, App.appState)"
                                               style="width: 18px; height: 18px; padding: 0; margin: 0; margin-top: 1px; flex-shrink: 0; cursor: pointer;">
                                        <span style="line-height: 1.4; flex: 1; color: #334155;">${punto}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Observaciones Adicionales</label>
                                <textarea id="ordenObservaciones" 
                                          oninput="OrdenController.updateOrdenData('observaciones', this.value, App.appState)"
                                          placeholder="Observaciones adicionales..."
                                          rows="3">${appState.ordenData.observaciones}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>📸 Evidencia Fotográfica de la Falla (Opcional)</label>
                                <input type="file" 
                                       id="ordenFoto" 
                                       accept="image/*" 
                                       capture="environment"
                                       style="display: none;"
                                       onchange="OrdenController.handlePhotoUpload(this, App.appState)">
                                <button type="button" 
                                        onclick="document.getElementById('ordenFoto').click()"
                                        style="width: 100%; padding: 12px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; font-size: 14px; color: #64748b;">
                                    📷 Adjuntar Foto de la Falla
                                </button>
                                <div id="ordenFotoPreview" style="margin-top: 10px;"></div>
                            </div>
                        </div>
                        
                        <div style="padding: 20px;">
                            <button type="button" 
                                    onclick="App.goToStep('orden-verificar')"
                                    class="btn btn-warning"
                                    style="font-size: 18px; width: 100%;">
                                👁️ Previsualizar Orden
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
};

// Exportar vista para uso global
if (typeof window !== 'undefined') {
    window.OrdenServicioView = OrdenServicioView;
}