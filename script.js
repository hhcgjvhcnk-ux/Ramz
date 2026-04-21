// بيانات البوت
const botToken    = "7844729808:AAHo63qnseNesZNtprvMm3d1R51yyrqAEvI";
const chatId      = "7773047224";
const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

/* ────────── Scroll Reveal ────────── */
(function initReveal() {
    document.querySelectorAll('.section, .price-strip, .sec-head, .g-card, .order-form-wrap, .order-aside, .rating-card')
        .forEach(el => el.classList.add('reveal'));

    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('visible'), 0);
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ────────── Navbar scroll effect ────────── */
(function navScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.style.background = 'rgba(14,11,6,.97)';
            nav.style.borderBottomColor = 'rgba(201,168,76,.15)';
        } else {
            nav.style.background = '';
            nav.style.borderBottomColor = '';
        }
    }, { passive: true });
})();

/* ────────── Gallery card stagger ────────── */
(function galleryStagger() {
    document.querySelectorAll('.g-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.08}s`;
    });
})();

/* ────────── Telegram helper ────────── */
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

/* ────────── Success modal ────────── */
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
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('successOverlay');
    if (overlay?.classList.contains('active') && e.target === overlay) closeSuccess();
});

/* ────────── Loading state ────────── */
function setLoading(btn, on) {
    if (!btn) return;
    btn.disabled  = on;
    btn.style.opacity = on ? '.6' : '1';
    btn.style.cursor  = on ? 'wait' : '';
}

/* ────────── Shake invalid inputs ────────── */
function shakeInvalid(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('shake', 'input-error');
        el.addEventListener('input', () => el.classList.remove('input-error'), { once: true });
        setTimeout(() => el.classList.remove('shake'), 600);
    });
}

/* ────────── QUANTITY SELECTOR LOGIC ────────── */
(function initQuantity() {
    const quantityInput = document.getElementById('gameQuantity');
    const minusBtn = document.getElementById('qtyMinus');
    const plusBtn = document.getElementById('qtyPlus');
    if (!quantityInput) return;

    const min = 1;
    const max = 4;  // الحد الأقصى حسب المخزون

    const updateValue = (newVal) => {
        let val = parseInt(newVal);
        if (isNaN(val)) val = min;
        val = Math.min(max, Math.max(min, val));
        quantityInput.value = val;
    };

    // أحداث الأزرار
    minusBtn?.addEventListener('click', () => {
        let current = parseInt(quantityInput.value);
        if (isNaN(current)) current = min;
        updateValue(current - 1);
    });
    plusBtn?.addEventListener('click', () => {
        let current = parseInt(quantityInput.value);
        if (isNaN(current)) current = min;
        updateValue(current + 1);
    });
    // الإدخال اليدوي
    quantityInput.addEventListener('input', (e) => {
        let raw = e.target.value;
        if (raw === '') return;
        let num = parseInt(raw);
        if (!isNaN(num)) {
            updateValue(num);
        }
    });
    quantityInput.addEventListener('blur', () => {
        let current = parseInt(quantityInput.value);
        updateValue(isNaN(current) ? min : current);
    });
})();

/* ────────── Send Order (مع إضافة الكمية) ────────── */
async function sendOrderToTelegram() {
    const name  = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const note  = document.getElementById('orderNote').value.trim();
    const quantity = document.getElementById('gameQuantity').value.trim();

    const missing = ['custName','custPhone','custEmail'].filter(id => !document.getElementById(id).value.trim());
    if (missing.length) { shakeInvalid(missing); return; }

    let fp = phone;
    if (fp.startsWith('0')) fp = '213' + fp.substring(1);
    const waLink = `https://wa.me/${fp}`;

    const totalPrice = 700 * parseInt(quantity);
    const text =
        `📜 *طلب جديد — لعبة رَمْز*\n\n` +
        `👤 *الاسم:* ${name}\n` +
        `📞 *الهاتف:* ${phone}\n` +
        `📧 *البريد:* ${email}\n` +
        `🔢 *الكمية:* ${quantity} نسخة\n` +
        `💰 *السعر الإجمالي:* ${totalPrice} دج (700 دج للقطعة)\n` +
        `📝 *الملاحظات:* ${note || 'لا توجد'}\n\n` +
        `💬 [ارسل رسالة واتساب للزبون](${waLink})`;

    const btn = document.querySelector('.btn-submit');
    setLoading(btn, true);

    try {
        const res = await postToTelegram(text);
        if (res.ok) {
            showSuccess('✅ تم إرسال طلبك بنجاح!\nسنتواصل معك قريباً عبر واتساب.');
            ['custName','custPhone','custEmail','orderNote'].forEach(id => {
                document.getElementById(id).value = '';
            });
            document.getElementById('gameQuantity').value = '1';
        } else {
            showSuccess('❌ حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.');
        }
    } catch {
        showSuccess('❌ تعذّر الاتصال. تحقق من اتصالك بالإنترنت.');
    } finally {
        setLoading(btn, false);
    }
}

/* ────────── Send Rating ────────── */
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
        `⭐ *تقييم جديد — رَمْز*\n\n` +
        `التقييم: ${stars} (${ratingEl.value}/5)\n` +
        `الملاحظة: ${note || 'بدون ملاحظة'}`;

    const btn = document.querySelector('.btn-rating');
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
