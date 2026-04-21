// بيانات البوت
const botToken = "7844729808:AAHo63qnseNesZNtprvMm3d1R51yyrqAEvI";
const chatId   = "7773047224";
const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

/* ══════════════════════════════════
   توليد جسيمات الخلفية
══════════════════════════════════ */
(function spawnParticles() {
    const container = document.getElementById('bgParticles');
    if (!container) return;
    const count = 28;
    for (let i = 0; i < count; i++) {
        const el = document.createElement('span');
        const size = Math.random() * 3 + 1;
        el.style.cssText = `
            left: ${Math.random() * 100}%;
            bottom: ${Math.random() * -10}%;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${Math.random() * 12 + 8}s;
            animation-delay: ${Math.random() * 10}s;
            opacity: 0;
        `;
        container.appendChild(el);
    }
})();

/* ══════════════════════════════════
   Scroll-based fade-in for sections
══════════════════════════════════ */
(function initScrollReveal() {
    const sections = document.querySelectorAll('.card-style, .gallery-section');
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(s => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(30px)';
        s.style.transition = 'opacity .7s ease, transform .7s ease';
        io.observe(s);
    });
})();

/* ══════════════════════════════════
   دالة مساعدة: إرسال إلى تيليجرام
══════════════════════════════════ */
function postToTelegram(text) {
    return fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
            disable_web_page_preview: true
        })
    });
}

/* ══════════════════════════════════
   نافذة النجاح
══════════════════════════════════ */
function showSuccess(message) {
    const overlay = document.getElementById('successOverlay');
    const msg     = document.getElementById('successMsg');
    if (!overlay || !msg) { alert(message); return; }
    msg.textContent = message;
    overlay.classList.add('active');
}

function closeSuccess() {
    const overlay = document.getElementById('successOverlay');
    if (overlay) overlay.classList.remove('active');
}

// إغلاق عند النقر خارج الصندوق
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('successOverlay');
    if (overlay && overlay.classList.contains('active') && e.target === overlay) {
        closeSuccess();
    }
});

/* ══════════════════════════════════
   دالة إرسال الطلب
══════════════════════════════════ */
async function sendOrderToTelegram() {
    const name  = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const note  = document.getElementById('orderNote').value.trim();

    if (!name || !phone || !email) {
        shakeInvalid(['custName', 'custPhone', 'custEmail'].filter(id => !document.getElementById(id).value.trim()));
        return;
    }

    // تهيئة رابط واتساب
    let fp = phone;
    if (fp.startsWith('0')) fp = '213' + fp.substring(1);
    const waLink = `https://wa.me/${fp}`;

    const text =
        `📜 *طلب جديد — لعبة رَمْز*\n\n` +
        `👤 *الاسم:* ${name}\n` +
        `📞 *الهاتف:* ${phone}\n` +
        `📧 *البريد:* ${email}\n` +
        `📝 *الملاحظات:* ${note || 'لا توجد'}\n\n` +
        `💰 *السعر:* 700 دج (خصم من 750 دج)\n` +
        `📦 *الكمية:* 4 قطع\n\n` +
        `💬 [ارسل رسالة واتساب للزبون](${waLink})`;

    const btn = document.querySelector('.order-section .btn-primary');
    setLoading(btn, true);

    try {
        const res = await postToTelegram(text);
        if (res.ok) {
            showSuccess('✅ تم إرسال طلبك بنجاح!\nسنتواصل معك قريباً.');
            ['custName', 'custPhone', 'custEmail', 'orderNote'].forEach(id => {
                document.getElementById(id).value = '';
            });
        } else {
            showSuccess('❌ حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.');
        }
    } catch {
        showSuccess('❌ تعذّر الاتصال. تحقق من اتصالك بالإنترنت.');
    } finally {
        setLoading(btn, false);
    }
}

/* ══════════════════════════════════
   دالة إرسال التقييم
══════════════════════════════════ */
async function sendRatingToTelegram() {
    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const note     = document.getElementById('ratingNote').value.trim();

    if (!ratingEl) {
        const container = document.querySelector('.star-rating');
        if (container) {
            container.classList.add('shake');
            setTimeout(() => container.classList.remove('shake'), 600);
        }
        return;
    }

    const stars = '⭐'.repeat(Number(ratingEl.value));
    const text  =
        `⭐ *تقييم جديد من الموقع*\n\n` +
        `التقييم: ${stars} (${ratingEl.value}/5)\n` +
        `الملاحظة: ${note || 'بدون ملاحظة'}`;

    const btn = document.querySelector('.rating-section .btn-secondary');
    setLoading(btn, true);

    try {
        const res = await postToTelegram(text);
        if (res.ok) {
            showSuccess('✨ شكراً لتقييمك!\nرأيك يهمنا كثيراً.');
            ratingEl.checked = false;
            document.getElementById('ratingNote').value = '';
        }
    } catch {
        showSuccess('❌ تعذّر الإرسال. حاول مرة أخرى.');
    } finally {
        setLoading(btn, false);
    }
}

/* ══════════════════════════════════
   دوال مساعدة للـ UI
══════════════════════════════════ */
function setLoading(btn, isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.style.opacity = isLoading ? '.6' : '1';
    btn.style.cursor  = isLoading ? 'wait' : 'pointer';
}

function shakeInvalid(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('shake');
        el.style.borderColor = '#c0392b';
        setTimeout(() => {
            el.classList.remove('shake');
            el.style.borderColor = '';
        }, 600);
    });
}

/* ── shake keyframe (injected) ── */
(function injectShake() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shakeAnim {
            0%,100%{transform:translateX(0)}
            20%{transform:translateX(-6px)}
            40%{transform:translateX(6px)}
            60%{transform:translateX(-4px)}
            80%{transform:translateX(4px)}
        }
        .shake { animation: shakeAnim .5s ease both !important; }
    `;
    document.head.appendChild(style);
})();
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(s => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(30px)';
        s.style.transition = 'opacity .7s ease, transform .7s ease';
        io.observe(s);
    });
})();

/* ══════════════════════════════════
   دالة مساعدة: إرسال إلى تيليجرام
══════════════════════════════════ */
function postToTelegram(text) {
    return fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
            disable_web_page_preview: true
        })
    });
}

/* ══════════════════════════════════
   نافذة النجاح
══════════════════════════════════ */
function showSuccess(message) {
    const overlay = document.getElementById('successOverlay');
    const msg     = document.getElementById('successMsg');
    if (!overlay || !msg) { alert(message); return; }
    msg.textContent = message;
    overlay.classList.add('active');
}

function closeSuccess() {
    const overlay = document.getElementById('successOverlay');
    if (overlay) overlay.classList.remove('active');
}

// إغلاق عند النقر خارج الصندوق
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('successOverlay');
    if (overlay && overlay.classList.contains('active') && e.target === overlay) {
        closeSuccess();
    }
});

/* ══════════════════════════════════
   دالة إرسال الطلب
══════════════════════════════════ */
async function sendOrderToTelegram() {
    const name  = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const note  = document.getElementById('orderNote').value.trim();

    if (!name || !phone || !email) {
        shakeInvalid(['custName', 'custPhone', 'custEmail'].filter(id => !document.getElementById(id).value.trim()));
        return;
    }

    // تهيئة رابط واتساب
    let fp = phone;
    if (fp.startsWith('0')) fp = '213' + fp.substring(1);
    const waLink = `https://wa.me/${fp}`;

    const text =
        `📜 *طلب جديد — لعبة رَمْز*\n\n` +
        `👤 *الاسم:* ${name}\n` +
        `📞 *الهاتف:* ${phone}\n` +
        `📧 *البريد:* ${email}\n` +
        `📝 *الملاحظات:* ${note || 'لا توجد'}\n\n` +
        `💬 [ارسل رسالة واتساب للزبون](${waLink})`;

    const btn = document.querySelector('.order-section .btn-primary');
    setLoading(btn, true);

    try {
        const res = await postToTelegram(text);
        if (res.ok) {
            showSuccess('✅ تم إرسال طلبك بنجاح!\nسنتواصل معك قريباً.');
            ['custName', 'custPhone', 'custEmail', 'orderNote'].forEach(id => {
                document.getElementById(id).value = '';
            });
        } else {
            showSuccess('❌ حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.');
        }
    } catch {
        showSuccess('❌ تعذّر الاتصال. تحقق من اتصالك بالإنترنت.');
    } finally {
        setLoading(btn, false);
    }
}

/* ══════════════════════════════════
   دالة إرسال التقييم
══════════════════════════════════ */
async function sendRatingToTelegram() {
    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const note     = document.getElementById('ratingNote').value.trim();

    if (!ratingEl) {
        const container = document.querySelector('.star-rating');
        if (container) {
            container.classList.add('shake');
            setTimeout(() => container.classList.remove('shake'), 600);
        }
        return;
    }

    const stars = '⭐'.repeat(Number(ratingEl.value));
    const text  =
        `⭐ *تقييم جديد من الموقع*\n\n` +
        `التقييم: ${stars} (${ratingEl.value}/5)\n` +
        `الملاحظة: ${note || 'بدون ملاحظة'}`;

    const btn = document.querySelector('.rating-section .btn-secondary');
    setLoading(btn, true);

    try {
        const res = await postToTelegram(text);
        if (res.ok) {
            showSuccess('✨ شكراً لتقييمك!\nرأيك يهمنا كثيراً.');
            ratingEl.checked = false;
            document.getElementById('ratingNote').value = '';
        }
    } catch {
        showSuccess('❌ تعذّر الإرسال. حاول مرة أخرى.');
    } finally {
        setLoading(btn, false);
    }
}

/* ══════════════════════════════════
   دوال مساعدة للـ UI
══════════════════════════════════ */
function setLoading(btn, isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.style.opacity = isLoading ? '.6' : '1';
    btn.style.cursor  = isLoading ? 'wait' : 'pointer';
}

function shakeInvalid(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('shake');
        el.style.borderColor = '#c0392b';
        setTimeout(() => {
            el.classList.remove('shake');
            el.style.borderColor = '';
        }, 600);
    });
}

/* ── shake keyframe (injected) ── */
(function injectShake() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shakeAnim {
            0%,100%{transform:translateX(0)}
            20%{transform:translateX(-6px)}
            40%{transform:translateX(6px)}
            60%{transform:translateX(-4px)}
            80%{transform:translateX(4px)}
        }
        .shake { animation: shakeAnim .5s ease both !important; }
    `;
    document.head.appendChild(style);
})();
