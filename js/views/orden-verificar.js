// orden-verificar.js - Vista de verificación de orden

const OrdenVerificarView = {
    render(appState) {
        const orden = appState.ordenData;
        const hoy = new Date();
        const fecha = hoy.toLocaleDateString('es-MX').split('/');
        const fechaFormatted = `${fecha[2]}/${fecha[1]}/${fecha[0]}`;
        
        // Generar firma automática para "ELABORÓ"
        const firmaElaboroData = this.generarFirmaAutomatica(orden.operador);
        
        return `
            <div>
                <div class="header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${CONFIG.LOGO_URL}" alt="Logo" style="height: 40px;">
                        <div class="logo">Verificar Orden</div>
                    </div>
                    <button onclick="App.goToStep('orden-servicio')" 
                            style="background: none; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 12px;">
                        Editar
                    </button>
                </div>
                
                <div class="container has-action-bar">
                    <div style="margin-bottom: 20px; text-align: center;">
                        <h3 style="color: #1e293b;">Previsualización de la Orden</h3>
                        <p style="color: #64748b; font-size: 12px;">Verifica que toda la información sea correcta antes de continuar.</p>
                    </div>
                    
                    <!-- Formato de orden de servicio -->
                    <div class="formato-container">
                        <!-- Encabezado -->
                        <table class="formato-table header-table">
                            <tr>
                                <td class="formato-logo">
                                    <img src="${CONFIG.LOGO_URL}" alt="Gas Express Nieto" style="max-width: 100%; max-height: 60px; object-fit: contain;">
                                </td>
                                <td class="formato-title">ORDEN DE SERVICIO<br>PLANTA: QUERÉTARO</td>
                                <td class="formato-folio">
                                    Forma: GEN-F-011-001<br><br>
                                    FOLIO: <span style="color:red; font-weight:bold;">${orden.folio}</span><br>
                                    FECHA: <span id="fechaDisplay">${fechaFormatted}</span>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Datos principales -->
                        <table class="formato-table">
                            <tr>
                                <td colspan="2">
                                    <span class="formato-label">Responsable del Vehículo:</span>
                                    <div style="font-size: 10px; margin-top: 2px;">${orden.operador || '________________'}</div>
                                </td>
                                <td>
                                    <span class="formato-label">Unidad:</span>
                                    <div style="font-size: 10px; margin-top: 2px;">${orden.unidad || '________________'}</div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="3">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span class="formato-label" style="margin-bottom: 0;">Mantenimiento realizado en:</span>
                                        <div class="checkbox-group" style="margin-top: 0;">
                                            <div class="formato-box ${orden.mantenimientoLugar === 'taller' ? 'checked' : ''}"></div> Taller
                                            <div class="formato-box ${orden.mantenimientoLugar === 'ruta' ? 'checked' : ''}"></div> Ruta
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width="33%">
                                    <span class="formato-label">Hora del reporte:</span>
                                    <div style="font-size: 10px; margin-top: 2px;">${orden.horaReporte || '______'}</div>
                                </td>
                                <td width="33%">
                                    <span class="formato-label">Hora de término:</span>
                                    <div style="font-size: 10px; margin-top: 2px;">${orden.horaTermino || '______'}</div>
                                </td>
                                <td width="33%">
                                    <span class="formato-label">Tiempo muerto:</span>
                                    <div style="font-size: 10px; margin-top: 2px;">${orden.tiempoMuerto || '______'}</div>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Trabajos a realizar -->
                        <table class="formato-table">
                            <tr>
                                <td style="width: 70%;">
                                    <span class="formato-label">Trabajos a realizar</span>
                                    <div class="checkbox-group">
                                        ${CONFIG.TIPOS_MANTENIMIENTO.map(tipo => {
                                            const value = tipo.toLowerCase().includes('correctivo') ? 'correctivo' : 
                                                         tipo.toLowerCase().includes('preventivo') ? 'preventivo' : 'otras';
                                            const checked = orden.tipoMantenimiento === value;
                                            return `<div class="formato-box ${checked ? 'checked' : ''}"></div> ${tipo}`;
                                        }).join('')}
                                    </div>
                                </td>
                                <td>
                                    <span class="formato-label">Kilometraje:</span>
                                    <div style="font-size: 10px; margin-top: 2px;">${orden.kilometro || '______'}</div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="height: 60px;">
                                    <span class="formato-label">Especificar falla de la unidad:</span>
                                    <div style="font-size: 9px; padding: 3px; white-space: pre-wrap; min-height: 50px;">
                                        ${orden.descripcionFalla || ''}
                                    </div>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Descripción del trabajo -->
                        <table class="formato-table" style="border-top: none;">
                            <tr class="bg-medium-blue">
                                <td colspan="2"><span class="formato-label">Descripción del trabajo realizado (Taller)</span></td>
                            </tr>
                            <tr>
                                <td colspan="2" style="min-height: 120px;">
                                    <div style="font-size: 9px; padding: 3px; white-space: pre-wrap;">
                                        ${orden.trabajoRealizado || ''}
                                    </div>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Puntos críticos -->
                        <table class="formato-table bg-medium-blue">
                            <tr>
                                <td colspan="4" style="text-align: center; font-weight: bold; font-size: 8px;" class="py-1">
                                    UNA VEZ EFECTUADO EL MANTENIMIENTO Y ANTES DE DAR SALIDA A LA UNIDAD, REVISAR LOS SIGUIENTES PUNTOS CRÍTICOS, EN CASO DE NO CUMPLIMIENTO PROGRAMAR REPARACIÓN.
                                </td>
                            </tr>
                            <tr>
                                ${CONFIG.PUNTOS_CRITICOS.slice(0, 4).map(punto => `
                                    <td>
                                        ${punto} 
                                        <div class="formato-box ${orden.puntosCriticos.includes(punto) ? 'checked' : ''}" style="float:right"></div>
                                    </td>
                                `).join('')}
                            </tr>
                            <tr>
                                ${CONFIG.PUNTOS_CRITICOS.slice(4, 8).map(punto => `
                                    <td>
                                        ${punto} 
                                        <div class="formato-box ${orden.puntosCriticos.includes(punto) ? 'checked' : ''}" style="float:right"></div>
                                    </td>
                                `).join('')}
                            </tr>
                        </table>
                        
                        <!-- Nota -->
                        <div class="footer-note">
                            Nota: El taller no se hace responsable por objetos personales de valor dejados u olvidados en las unidades.
                        </div>
                        
                        <!-- Observaciones -->
                        <table class="formato-table">
                            <tr class="bg-medium-blue">
                                <td colspan="3"><span class="formato-label">Observaciones:</span></td>
                            </tr>
                            <tr>
                                <td colspan="3" style="min-height: 20px;">
                                    <div style="font-size: 9px; padding: 3px;">
                                        ${orden.observaciones || ''}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td class="signature-box" style="width: 33%;">
                                    ${firmaElaboroData ? `<img src="${firmaElaboroData}" class="signature-img">` : ''}
                                </td>
                                <td class="signature-box" style="width: 33%;" id="firmaTallerBox">
                                    ${appState.firmaTaller ? `<img src="${appState.firmaTaller}" class="signature-img">` : ''}
                                </td>
                                <td class="signature-box" style="width: 33%;" id="firmaChoferBox">
                                    ${appState.firmaChofer ? `<img src="${appState.firmaChofer}" class="signature-img">` : ''}
                                </td>
                            </tr>
                            <tr class="bg-medium-blue" style="text-align: center; font-weight: bold; font-size: 8px;">
                                <td>ELABORÓ</td>
                                <td>FIRMA DE RECIBIDO (TALLER)</td>
                                <td>FIRMA DE CONFORMIDAD (CHOFER)</td>
                            </tr>
                        </table>
                        
                        <!-- Leyenda -->
                        <div class="legend">
                            <div class="legend-item"><div class="color-box bg-light-blue"></div> ESTOS ESPACIOS SON CUBIERTOS POR LA GASERA</div>
                            <div class="legend-item"><div class="color-box bg-medium-blue"></div> ESTOS ESPACIOS SON CUBIERTOS POR MULTISERVICIOS NIETO</div>
                            <div class="legend-item"><div class="color-box bg-dark-blue"></div> CHOFER DE LA UNIDAD DANDO V° B° DE LA O LAS REPARACIONES</div>
                        </div>
                    </div>
                    
                    <!-- Firmas -->
                    <div class="card" style="margin-top: 20px;">
                        <h3 style="margin-bottom: 16px; color: #1e293b; text-align: center;">Firmas Digitales</h3>
                        
                        <div class="grid-responsive" style="gap: 20px; margin-bottom: 20px;">
                            <div>
                                <h4 style="font-size: 12px; color: #64748b; margin-bottom: 10px;">Firma del Taller (Recibido)</h4>
                                <div style="border: 2px dashed #cbd5e1; border-radius: 8px; height: 100px; background: #f8fafc; position: relative; overflow: hidden;">
                                    <canvas id="firmaTallerCanvas" style="width: 100%; height: 100%; border-radius: 6px;"></canvas>
                                    <button type="button" 
                                            onclick="SignatureController.limpiarFirma('taller', App.appState)"
                                            style="position: absolute; top: 5px; right: 5px; background: white; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; font-size: 10px;">
                                        Limpiar
                                    </button>
                                </div>
                                <p style="text-align: center; font-size: 10px; color: #64748b; margin-top: 5px;">
                                    Firma del responsable del taller
                                </p>
                            </div>
                            
                            <div>
                                <h4 style="font-size: 12px; color: #64748b; margin-bottom: 10px;">Firma del Chofer (Conformidad)</h4>
                                <div style="border: 2px dashed #cbd5e1; border-radius: 8px; height: 100px; background: #f8fafc; position: relative; overflow: hidden;">
                                    <canvas id="firmaChoferCanvas" style="width: 100%; height: 100%; border-radius: 6px;"></canvas>
                                    <button type="button" 
                                            onclick="SignatureController.limpiarFirma('chofer', App.appState)"
                                            style="position: absolute; top: 5px; right: 5px; background: white; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; font-size: 10px;">
                                        Limpiar
                                    </button>
                                </div>
                                <p style="text-align: center; font-size: 10px; color: #64748b; margin-top: 5px;">
                                    Firma del chofer responsable
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="action-bar">
                    <button onclick="App.goToStep('orden-servicio')" class="btn btn-secondary">
                        Editar
                    </button>
                    <button onclick="OrdenController.guardarFirmasYContinuar(App.appState)" class="btn btn-warning">
                        ✅ Finalizar
                    </button>
                </div>
            </div>
        `;
    },
    
    generarFirmaAutomatica(nombre) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'italic 16px Arial';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const texto = nombre ? nombre.split(':')[1] || nombre : 'FIRMA';
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
    window.OrdenVerificarView = OrdenVerificarView;
}