// auth-controller.js - Lógica de inicio de sesión con Supabase Auth

const AuthController = {
    // Manejar el envío del formulario de login
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtn');
        
        btn.innerText = 'Verificando...';
        btn.disabled = true;
        
        try {
            const client = StorageService.init();
            if (!client) throw new Error("Supabase no está configurado.");
            
            // 1. Iniciar sesión directo en Supabase
            const { data, error } = await client.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            // 2. Extraer el rol oculto en los metadatos
            const role = data.user?.user_metadata?.role;
            
            if (role !== 'admin' && role !== 'supervisor') {
                await client.auth.signOut(); // Cierra la sesión inmediatamente si no tiene rol válido
                throw new Error(`Acceso denegado: Tu rol actual es '${role || 'NINGUNO'}'. Solo se permite 'admin' o 'supervisor'.`);
            }
            
            // 3. Guardarlo en el estado de la app
            App.appState.userRole = role;
            App.appState.user = data.user;
            
            // 4. Redirigir al menú principal (que ahora es exclusivo para logueados)
            App.goToStep('home');
            
        } catch (error) {
            console.error("Error en login:", error);
            alert(`❌ ${error.message.includes('Acceso denegado') ? error.message : 'Acceso denegado: Correo o contraseña incorrectos.'}`);
        } finally {
            btn.innerText = 'Ingresar';
            btn.disabled = false;
        }
    },
    
    // Verificar si el usuario ya había iniciado sesión previamente
    async checkActiveSession() {
        try {
            const client = StorageService.init();
            if (!client) return;
            
            const { data: { session } } = await client.auth.getSession();
            if (session) {
                const role = session.user?.user_metadata?.role;
                if (role === 'admin' || role === 'supervisor') {
                    App.appState.userRole = role;
                    App.appState.user = session.user;
                } else {
                    await client.auth.signOut(); // Si le quitaron el rol, lo saca
                }
            }
        } catch (error) {
            console.error("Error recuperando sesión:", error);
        }
    },
    
    // Cerrar sesión
    async logout() {
        const client = StorageService.init();
        if (client) await client.auth.signOut();
        App.appState.userRole = null;
        App.appState.user = null;
        App.goToStep('login');
    }
};

if (typeof window !== 'undefined') window.AuthController = AuthController;