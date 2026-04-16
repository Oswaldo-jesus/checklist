// form.js - Vista del formulario de inspección

const FormView = {
    render(appState) {
        // Obtener el tipo de ruta seleccionado
        const selectedRouteType = appState.formData.tipoRuta || '';
        
        // Obtener las rutas disponibles según el tipo seleccionado
        const availableRoutes = selectedRouteType ? CONFIG.getRoutesByType(selectedRouteType) : [];
        
        // Obtener los puntos de inspección según el tipo de ruta seleccionado
        const inspectionPoints = selectedRouteType ? CONFIG.getInspectionPointsByRouteType(selectedRouteType) : [];
        
        return `
            <div>
                <div class="header" style="background: #1e40af; border-bottom: none; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="toggleMenu()" class="btn-icon" style="color: white; font-size: 26px;">
                            <i class='bx bx-menu'></i>
                        </button>
                        <img src="${CONFIG.LOGO_URL}" onclick="toggleMenu()" alt="Logo" style="height: 35px; cursor: pointer; object-fit: contain;">
                        <div class="logo" style="font-weight: 600; font-size: 16px; color: white;">Gen Checklist</div>
                    </div>
                    <button onclick="App.goToStep('home')" class="btn-icon" title="Volver al inicio" style="color: white;">
                        <i class='bx bx-home-alt'></i>
                    </button>
                </div>
                
                <div class="container" style="max-width: 800px; margin: 0 auto; padding: 24px 16px;">
                    <form id="checklistForm" onsubmit="event.preventDefault(); FormController.previewChecklist(App.appState)">
                        <!-- Información básica -->
                        <div class="card card-hover" style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); margin-bottom: 24px; border: 1px solid #f1f5f9;">
                            <h3 style="margin-bottom: 20px; color: #0f172a; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                                <i class='bx bx-file' style="font-size: 24px; color: #3b82f6;"></i> Información de la Unidad
                            </h3>
                            
                            <!-- SELECTOR DE TIPO DE RUTA -->
                            <div class="form-group">
                                <label style="display: block; font-size: 14px; font-weight: 500; color: #475569; margin-bottom: 10px;">Tipo de Ruta <span style="color: #ef4444;">*</span></label>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px;">
                                    ${CONFIG.TIPOS_RUTA.map(tipo => `
                                        <button type="button"
                                                class="menu-item"
                                                onclick="FormController.updateFormData('tipoRuta', '${tipo}', App.appState)"
                                                style="padding: 14px; border: 1px solid ${appState.formData.tipoRuta === tipo ? '#3b82f6' : '#e2e8f0'}; 
                                                       background: ${appState.formData.tipoRuta === tipo ? '#eff6ff' : '#ffffff'}; 
                                                       color: ${appState.formData.tipoRuta === tipo ? '#1d4ed8' : '#475569'}; 
                                                       border-radius: 12px; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;
                                                       cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                                            ${tipo === 'Utilitario' ? "<i class='bx bx-car'></i>" : 
                                              tipo === 'Mantenimiento' ? "<i class='bx bx-wrench'></i>" : 
                                              tipo === 'Montacargas' ? "<i class='bx bx-package'></i>" : 
                                              tipo === 'Cilindros' ? "<i class='bx bx-cylinder'></i>" : "<i class='bx bx-gas-pump'></i>"} ${tipo}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Operador</label>
                                <input type="text" 
                                       id="operador" 
                                       value="${appState.formData.operador}"
                                       oninput="FormController.updateFormData('operador', this.value, App.appState)"
                                       placeholder="Selecciona o escribe el operador"
                                       list="operators-list"
                                       required>
                                <datalist id="operators-list">
                                    ${CONFIG.OPERATORS.map(op => `<option value="${op}">`).join('')}
                                </datalist>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label>Unidad ECO</label>
                                    <input type="text" 
                                           id="eco" 
                                           value="${appState.formData.eco}"
                                           oninput="FormController.updateFormData('eco', this.value, App.appState)"
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
                                           id="km" 
                                           value="${appState.formData.km}"
                                           oninput="FormController.updateFormData('km', this.value, App.appState)"
                                           placeholder="Ej: 15000"
                                           required>
                                </div>
                            </div>
                            
                            <!-- SELECTOR DE RUTA (LISTA DESPLEGABLE) -->
                            <div class="form-group">
                                <label>Ruta <span style="color: #dc2626;">*</span></label>
                                ${selectedRouteType ? `
                                    <select id="ruta"
                                            onchange="FormController.updateFormData('ruta', this.value, App.appState)"
                                            style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px; background: #f8fafc;"
                                            required>
                                        <option value="">Selecciona una ruta</option>
                                        ${availableRoutes.map(ruta => `
                                            <option value="${ruta}" ${appState.formData.ruta === ruta ? 'selected' : ''}>
                                                ${ruta}
                                            </option>
                                        `).join('')}
                                    </select>
                                    <p style="font-size: 11px; color: #64748b; margin-top: 4px;">
                                        ${availableRoutes.length} rutas disponibles para ${selectedRouteType}
                                    </p>
                                ` : `
                                    <div style="padding: 12px; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; text-align: center; color: #64748b;">
                                        Primero selecciona un tipo de ruta
                                    </div>
                                `}
                            </div>
                        </div>
                        
                        <!-- Checklist de inspección (solo si hay tipo seleccionado) -->
                        ${selectedRouteType ? `
                            <div class="card">
                                <h3 style="margin-bottom: 16px; color: #1e293b;">
                                    🔍 Checklist de Inspección - 
                                    <span style="color: #1e40af; background: #dbeafe; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
                                        ${selectedRouteType}
                                    </span>
                                </h3>
                                <p style="font-size: 12px; color: #64748b; margin-bottom: 16px;">
                                    Marca con ✅ (Aprobado) o ❌ (Rechazado) cada punto de revisión
                                </p>
                                
                                ${inspectionPoints.map((point, index) => {
                                    // Dibujar encabezado si es una categoría
                                    if (point.isHeader) {
                                        return `
                                            <div style="margin: 24px 0 12px 0; padding: 8px 12px; background: #e2e8f0; color: #1e293b; border-left: 4px solid #1e40af; border-radius: 4px; font-weight: bold; font-size: 13px; text-transform: uppercase;">
                                                📋 ${point.label}
                                            </div>
                                        `;
                                    }
                                    
                                    // Dibujar la pregunta normal si no es encabezado
                                    return `
                                    <div style="margin-bottom: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                                            <div style="flex: 1; min-width: 0;">
                                                <span style="font-weight: bold; line-height: 1.3; display: block; word-wrap: break-word;">${point.label}</span>
                                                ${point.critical ? '<span style="font-size: 10px; color: #dc2626; font-weight: bold; display: inline-block; margin-top: 4px;">(CRÍTICO)</span>' : ''}
                                            </div>
                                            <div style="display: flex; gap: 8px; flex-shrink: 0;">
                                                <button type="button"
                                                        onclick="FormController.setEvaluation('${point.id}', 'aprobado', App.appState)"
                                                        style="padding: 6px 12px; border: none; border-radius: 6px; 
                                                               background: ${appState.evaluations[point.id] === 'aprobado' ? '#22c55e' : '#f1f5f9'}; 
                                                               color: ${appState.evaluations[point.id] === 'aprobado' ? 'white' : '#64748b'};">
                                                    ✅ Aprobado
                                                </button>
                                                <button type="button"
                                                        onclick="FormController.setEvaluation('${point.id}', 'rechazado', App.appState)"
                                                        style="padding: 6px 12px; border: none; border-radius: 6px; 
                                                               background: ${appState.evaluations[point.id] === 'rechazado' ? '#dc2626' : '#f1f5f9'}; 
                                                               color: ${appState.evaluations[point.id] === 'rechazado' ? 'white' : '#64748b'};">
                                                    ❌ Rechazado
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <!-- Botón para foto solo si está rechazado -->
                                        ${appState.evaluations[point.id] === 'rechazado' ? `
                                            <div style="margin-top: 8px;">
                                                <input type="file" 
                                                       id="photo_${point.id}"
                                                       accept="image/*" 
                                                       capture="environment"
                                                       style="display: none;"
                                                       onchange="FormController.handlePhotoUpload('${point.id}', this, App.appState)">
                                                <button type="button" 
                                                        onclick="document.getElementById('photo_${point.id}').click()"
                                                        style="width: 100%; padding: 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; font-size: 12px; color: #64748b;">
                                                    📸 Adjuntar foto de evidencia
                                                </button>
                                                ${appState.photos[point.id] ? `
                                                    <div style="margin-top: 8px;">
                                                        <img src="${appState.photos[point.id]}" style="width: 100%; border-radius: 6px; border: 1px solid #e2e8f0;">
                                                        <button type="button"
                                                                onclick="FormController.removePhoto('${point.id}', App.appState)"
                                                                style="margin-top: 4px; padding: 4px 8px; background: #dc2626; color: white; border: none; border-radius: 4px; font-size: 10px;">
                                                            ✕ Eliminar foto
                                                        </button>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                    `;
                                }).join('')}
                                
                                <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px;">
                                    <p style="font-size: 11px; color: #92400e;">
                                        <strong>Nota:</strong> Los puntos marcados como CRÍTICO deben estar aprobados para considerar la inspección como válida.
                                    </p>
                                </div>
                            </div>
                        ` : `
                            <div class="card" style="text-align: center; padding: 40px;">
                                <div style="font-size: 40px; margin-bottom: 16px;">👆</div>
                                <h3 style="color: #64748b;">Selecciona un tipo de ruta para comenzar</h3>
                                <p style="font-size: 12px; color: #94a3b8;">Los puntos de inspección cambiarán según el tipo seleccionado</p>
                            </div>
                        `}
                        
                        <!-- Comentarios adicionales (solo si hay tipo seleccionado) -->
                        ${selectedRouteType ? `
                            <div class="card">
                                <h3 style="margin-bottom: 16px; color: #1e293b;">💭 Comentarios Adicionales</h3>
                                
                                <div class="form-group">
                                    <label>Observaciones (Opcional)</label>
                                    <textarea id="observaciones"
                                              oninput="FormController.updateFormData('observaciones', this.value, App.appState)"
                                              placeholder="Escribe aquí cualquier observación adicional..."
                                              rows="4">${appState.formData.observaciones || ''}</textarea>
                                </div>
                            </div>
                            
                            <!-- Firma de conformidad -->
                            <div class="card">
                                <h3 style="margin-bottom: 16px; color: #1e293b;">✍️ Firma de Conformidad</h3>
                                
                                <div class="signature-container">
                                    <canvas id="sigCanvas"></canvas>
                                </div>
                                
                                <div style="text-align: center; margin: 10px 0;">
                                    <button type="button" 
                                            onclick="SignatureController.clearSignature(App.appState)"
                                            style="padding: 8px 16px; background: #64748b; color: white; border: none; border-radius: 6px; font-size: 12px;">
                                        Limpiar Firma
                                    </button>
                                </div>
                                
                                <p style="text-align: center; font-size: 11px; color: #64748b;">
                                    Firma aquí para confirmar que la información es correcta
                                </p>
                            </div>
                            
                            <!-- Botón enviar -->
                            <div style="padding: 20px;">
                                <button type="submit" 
                                        class="btn btn-warning"
                                        ${appState.isSubmitting ? 'disabled' : ''}
                                        style="font-size: 18px;">
                                    ${appState.isSubmitting ? 'Enviando...' : '👁️ Previsualizar Checklist'}
                                </button>
                            </div>
                        ` : ''}
                    </form>
                </div>
            </div>
        `;
    }
};

// Exportar vista para uso global
if (typeof window !== 'undefined') {
    window.FormView = FormView;
}