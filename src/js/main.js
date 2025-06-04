// Funções utilitárias para validação e manipulação do DOM
const utils = {
    // Validação de formulários
    validateForm: (formData) => {
        const errors = {};
        const validations = {
            nome: {
                required: true,
                minLength: 3,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                messages: {
                    required: 'O nome é obrigatório',
                    minLength: 'O nome deve ter pelo menos 3 caracteres',
                    maxLength: 'O nome deve ter no máximo 100 caracteres',
                    pattern: 'O nome deve conter apenas letras e espaços'
                }
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                messages: {
                    required: 'O e-mail é obrigatório',
                    pattern: 'Digite um e-mail válido'
                }
            },
            assunto: {
                required: true,
                minLength: 5,
                maxLength: 100,
                messages: {
                    required: 'O assunto é obrigatório',
                    minLength: 'O assunto deve ter pelo menos 5 caracteres',
                    maxLength: 'O assunto deve ter no máximo 100 caracteres'
                }
            },
            mensagem: {
                required: true,
                minLength: 10,
                maxLength: 1000,
                messages: {
                    required: 'A mensagem é obrigatória',
                    minLength: 'A mensagem deve ter pelo menos 10 caracteres',
                    maxLength: 'A mensagem deve ter no máximo 1000 caracteres'
                }
            }
        };

        // Validação para cada campo
        for (const [field, rules] of Object.entries(validations)) {
            const value = formData.get(field)?.trim() || '';

            // Validação de campo obrigatório
            if (rules.required && !value) {
                errors[field] = rules.messages.required;
                continue;
            }

            // Validação de comprimento mínimo
            if (rules.minLength && value.length < rules.minLength) {
                errors[field] = rules.messages.minLength;
                continue;
            }

            // Validação de comprimento máximo
            if (rules.maxLength && value.length > rules.maxLength) {
                errors[field] = rules.messages.maxLength;
                continue;
            }

            // Validação de padrão (regex)
            if (rules.pattern && !rules.pattern.test(value)) {
                errors[field] = rules.messages.pattern;
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
        // Remove mensagens anteriores
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.setAttribute('role', 'alert');
        messageDiv.setAttribute('aria-live', 'polite');
        
        // Adiciona ícone baseado no tipo
        const icon = type === 'success' ? '✓' : '!';
        messageDiv.innerHTML = `<span class="message-icon">${icon}</span> ${message}`;

        document.body.appendChild(messageDiv);

        // Adiciona classe para animação
        setTimeout(() => messageDiv.classList.add('show'), 10);

        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    },

    // Funções de data e hora
    date: {
        formatDateTime: (date) => new Date(date).toLocaleString('pt-BR'),
    },

    // Funções de geolocalização
    geo: {
        calculateDistance: (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Raio da Terra em km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                     Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        },
        calculateCenter: (points) => {
            const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
            const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
            return { lat, lng };
        }
    }
};

window.utils = utils;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        const nome = form.querySelector('input[name="nome"]');
        const email = form.querySelector('input[name="email"]');
        const assunto = form.querySelector('input[name="assunto"]');
        const mensagem = form.querySelector('textarea[name="mensagem"]');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Função para mostrar mensagem de erro
        function mostrarErro(campo, mensagem) {
            removerErro(campo);
            campo.classList.add('error');
            const erro = document.createElement('div');
            erro.className = 'error-message';
            erro.textContent = mensagem;
            campo.parentElement.appendChild(erro);
        }

        // Função para remover mensagem de erro
        function removerErro(campo) {
            campo.classList.remove('error');
            const erro = campo.parentElement.querySelector('.error-message');
            if (erro) erro.remove();
        }

        // Função para validar cada campo
        function validarCampo(campo) {
            const valor = campo.value.trim();
            let valido = true;
            let mensagem = '';
            if (campo === nome) {
                if (!valor) {
                    valido = false;
                    mensagem = 'O nome é obrigatório';
                } else if (valor.length < 3) {
                    valido = false;
                    mensagem = 'O nome deve ter pelo menos 3 caracteres';
                } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(valor)) {
                    valido = false;
                    mensagem = 'O nome deve conter apenas letras e espaços';
                }
            } else if (campo === email) {
                if (!valor) {
                    valido = false;
                    mensagem = 'O e-mail é obrigatório';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
                    valido = false;
                    mensagem = 'Digite um e-mail válido';
                }
            } else if (campo === assunto) {
                if (!valor) {
                    valido = false;
                    mensagem = 'O assunto é obrigatório';
                } else if (valor.length < 5) {
                    valido = false;
                    mensagem = 'O assunto deve ter pelo menos 5 caracteres';
                }
            } else if (campo === mensagem) {
                if (!valor) {
                    valido = false;
                    mensagem = 'A mensagem é obrigatória';
                } else if (valor.length < 10) {
                    valido = false;
                    mensagem = 'A mensagem deve ter pelo menos 10 caracteres';
                }
            }
            if (!valido) {
                mostrarErro(campo, mensagem);
            } else {
                removerErro(campo);
            }
            return valido;
        }

        // Validação no blur
        [nome, email, assunto, mensagem].forEach(campo => {
            campo.addEventListener('blur', function() {
                validarCampo(campo);
                checarFormulario();
            });
        });

        // Função para checar se o formulário está válido
        function checarFormulario() {
            const valido = [nome, email, assunto, mensagem].every(campo => {
                return validarCampo(campo);
            });
            submitButton.disabled = !valido;
            return valido;
        }

        // Validação no submit
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (checarFormulario()) {
                alert('Mensagem enviada com sucesso!');
                form.reset();
                submitButton.disabled = true;
            } else {
                // Foca no primeiro campo inválido
                const primeiroErro = form.querySelector('.error');
                if (primeiroErro) primeiroErro.focus();
            }
        });

        // Desabilita o botão inicialmente
        submitButton.disabled = true;
    }

    // Inicializa FAQ (fora do bloco do formulário)
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    // Header shrink ao scroll
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 60) {
            header.classList.add('shrink');
        } else {
            header.classList.remove('shrink');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.querySelector('#main-menu');

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainMenu.setAttribute('aria-hidden', isExpanded);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? '' : 'hidden';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
                menuToggle.setAttribute('aria-expanded', 'false');
                mainMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        mainMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                mainMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });
    }
});

// Função auxiliar para validar um campo
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove mensagem de erro anterior
    const errorDiv = field.parentElement.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
    field.classList.remove('error');

    // Validações específicas por campo
    switch (field.name) {
        case 'nome':
            if (!value) {
                isValid = false;
                errorMessage = 'O nome é obrigatório';
            } else if (value.length < 3) {
                isValid = false;
                errorMessage = 'O nome deve ter pelo menos 3 caracteres';
            } else if (value.length > 100) {
                isValid = false;
                errorMessage = 'O nome deve ter no máximo 100 caracteres';
            } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
                isValid = false;
                errorMessage = 'O nome deve conter apenas letras e espaços';
            }
            break;

        case 'email':
            if (!value) {
                isValid = false;
                errorMessage = 'O e-mail é obrigatório';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Digite um e-mail válido';
            }
            break;

        case 'assunto':
            if (!value) {
                isValid = false;
                errorMessage = 'O assunto é obrigatório';
            } else if (value.length < 5) {
                isValid = false;
                errorMessage = 'O assunto deve ter pelo menos 5 caracteres';
            } else if (value.length > 100) {
                isValid = false;
                errorMessage = 'O assunto deve ter no máximo 100 caracteres';
            }
            break;

        case 'mensagem':
            if (!value) {
                isValid = false;
                errorMessage = 'A mensagem é obrigatória';
            } else if (value.length < 10) {
                isValid = false;
                errorMessage = 'A mensagem deve ter pelo menos 10 caracteres';
            } else if (value.length > 1000) {
                isValid = false;
                errorMessage = 'A mensagem deve ter no máximo 1000 caracteres';
            }
            break;
    }

    // Se houver erro, mostra a mensagem
    if (!isValid) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        field.parentElement.appendChild(errorDiv);
    }

    return isValid;
} 