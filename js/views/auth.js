// auth.js - Vista de Autenticación Unificada

const AuthView = {
    renderLogin() {
        return `
            <div class="container">
                <div style="text-align: center; padding: 40px 20px;">
                    <!-- Usa tu logo -->
                    <div style="margin-bottom: 20px;">
                        <span style="font-size: 40px;">🔐</span>
                    </div>
                    <h2 style="color: #1e293b; margin-bottom: 30px;">Iniciar Sesión</h2>
                    
                    <div class="card" style="max-width: 350px; margin: 0 auto; text-align: left;">
                        <form onsubmit="AuthController.handleLogin(event)">
                            <div class="form-group">
                                <label style="font-weight: bold; color: #475569;">Correo Electrónico</label>
                                <input type="email" id="loginEmail" placeholder="usuario@gen.com" required 
                                       style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 5px;">
                            </div>
                            
                            <div class="form-group" style="margin-top: 20px;">
                                <label style="font-weight: bold; color: #475569;">Contraseña</label>
                                <input type="password" id="loginPassword" placeholder="******" required 
                                       style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 5px;">
                            </div>
                            
                            <button type="submit" id="loginBtn" class="btn btn-primary" style="width: 100%; margin-top: 25px; padding: 12px; font-size: 16px;">
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