// auth.js - Vista de Autenticación Unificada

const AuthView = {
    renderLogin() {
        return `
            <div class="container">
                <div style="text-align: center; padding: 40px 20px;">
                    <!-- Logo del proyecto en lugar del candado -->
                    <div style="margin-bottom: 24px; display: flex; justify-content: center;">
                        <img src="${CONFIG.LOGO_URL}" alt="Logo del Proyecto" style="height: 70px; object-fit: contain;">
                    </div>
                    <h2 style="color: #1e293b; margin-bottom: 30px; font-weight: 700;">Iniciar Sesión</h2>
                    
                    <div class="card" style="max-width: 400px; margin: 0 auto; text-align: left;">
                        <form onsubmit="AuthController.handleLogin(event)">
                            <div class="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" id="loginEmail" placeholder="usuario@gen.com" required>
                            </div>
                            
                            <div class="form-group" style="margin-top: 20px;">
                                <label>Contraseña</label>
                                <input type="password" id="loginPassword" placeholder="******" required>
                            </div>
                            
                            <button type="submit" id="loginBtn" class="btn btn-primary" style="margin-top: 30px;">
                                <i class='bx bx-log-in-circle' style="font-size: 20px;"></i>
                                Ingresar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') window.AuthView = AuthView;