// Definição do objeto utils global para uso em todo o sistema
window.utils = window.utils || {};
window.utils.date = window.utils.date || {
    formatDateTime: (date) => new Date(date).toLocaleString('pt-BR'),
};
if (!window.utils.storage) {
    window.utils.storage = {
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
    };
}
window.utils.validateForm = window.utils.validateForm || (() => ({ isValid: true, errors: {} }));
window.utils.showMessage = window.utils.showMessage || (() => {});

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

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa formulários
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const validation = utils.validateForm(formData);
            
            if (validation.isValid) {
                // Aqui você pode adicionar a lógica de envio do formulário
                utils.showMessage('Mensagem enviada com sucesso! Em breve entraremos em contato.', 'success');
                this.reset();
            } else {
                // Mostra erros de validação
                Object.entries(validation.errors).forEach(([field, message]) => {
                    const input = this.querySelector(`[name="${field}"]`);
                    if (input) {
                        utils.showMessage(message);
                        input.focus();
                    }
                });
            }
        });
    });

    // Inicializa FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Fecha todos os itens
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Se o item clicado não estava ativo, abre ele
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
}); 