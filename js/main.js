// Funções utilitárias para validação e manipulação do DOM
const utils = {
    // Validação de formulários
    validateForm: (formData) => {
        const errors = {};
        
        for (const [key, value] of formData.entries()) {
            if (!value.trim()) {
                errors[key] = 'Este campo é obrigatório';
            }
        }

        // Validação específica de email
        if (formData.get('email')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.get('email'))) {
                errors.email = 'Email inválido';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Manipulação do localStorage
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Erro ao salvar no localStorage:', error);
                return false;
            }
        },

        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                console.error('Erro ao ler do localStorage:', error);
                return null;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Erro ao remover do localStorage:', error);
                return false;
            }
        }
    },

    // Manipulação de mensagens de erro/sucesso
    showMessage: (message, type = 'error') => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        // Remove a mensagem após 3 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
};

// Exporta as funções utilitárias
window.utils = utils; 