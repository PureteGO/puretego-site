
/* ===== Contact Page Form Logic ===== */
function initContactPageForm() {
    const form = document.getElementById('contactPageForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        // Basic visual feedback
        btn.textContent = 'Enviando...';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        const formData = new FormData(form);

        fetch('php/send-mail.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Use a nice alert or custom modal if available, fallback to alert
                    // Check if we have sweetalert loaded? No, assume vanilla.
                    alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo a la brevedad.');
                    form.reset();
                    // Redirect to thank you page if needed, or just stay
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
}
