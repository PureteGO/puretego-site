
/* ===== Contact Page Form Logic (reCAPTCHA v3) ===== */
function initContactPageForm() {
    const form = document.getElementById('contactPageForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        // Feedback visual
        btn.textContent = 'Verificando...';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        // Ejecutar reCAPTCHA v3
        if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
            grecaptcha.ready(function () {
                // Usar la Site Key correcta
                grecaptcha.execute('6Le_aFssAAAAACd_QJs4HGzi2YHhAo_n5fZsiCal', { action: 'submit' }).then(function (token) {

                    // Asignar token al input hidden
                    let inputToken = document.getElementById('g-recaptcha-response');
                    if (!inputToken) {
                        inputToken = document.createElement('input');
                        inputToken.type = 'hidden';
                        inputToken.name = 'g-recaptcha-response';
                        form.appendChild(inputToken);
                    }
                    inputToken.value = token;

                    // Continuar con envío AJAX
                    btn.textContent = 'Enviando...';
                    const formData = new FormData(form);

                    fetch('php/send-mail.php', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo a la brevedad.');
                                form.reset();
                            } else {
                                alert('Hubo un problema: ' + (data.message || 'Error desconocido'));
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Error de conexión. Por favor verifica tu internet o intenta más tarde.');
                        })
                        .finally(() => {
                            btn.textContent = originalText;
                            btn.style.opacity = '1';
                            btn.disabled = false;
                        });
                });
            });
        } else {
            // Fallback si reCAPTCHA no carga
            alert('Error: reCAPTCHA no cargó correctamente. Recarga la página.');
            btn.textContent = originalText;
            btn.style.opacity = '1';
            btn.disabled = false;
        }
    });
}
