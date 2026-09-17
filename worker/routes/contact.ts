import { Hono } from 'hono';
import type { AppEnv } from '../hono';
import { sendEmail } from '../email';
import { rateLimit } from '../rateLimit';
import { requireAdmin } from '../auth';

export const contactRouter = new Hono<AppEnv>();

const ATELIER_TARGET_EMAIL = 'lahabfire@gmail.com';
const ATELIER_WHATSAPP_NUMBER = '201288224920';

const CATEGORY_NAMES: Record<string, { en: string; ar: string }> = {
  bespoke: { en: 'Bespoke Gold Monogram / Custom Tailoring', ar: 'تطريز مخصص / تفصيل خاص' },
  sizing: { en: 'Sizing & Drop-Shoulder Drape Advice', ar: 'استشارة المقاس والقصة المعمارية' },
  order: { en: 'Order Status & Express Courier Tracking', ar: 'متابعة الشحن وحالة الطلب' },
  vip: { en: 'Drop 02 "Sahar" VIP Early Allocation', ar: 'حجز مبكر للإصدار القادم سَحَر' },
  press: { en: 'Press, Editorial & Wholesale Inquiry', ar: 'الصحافة والتنسيق والتعاون' },
  general: { en: 'General Atelier Inquiry', ar: 'استفسار عام' },
};

const contactLimiter = rateLimit({
  name: 'contact',
  windowSeconds: 15 * 60,
  limit: 5,
  message: 'Too many inquiries submitted from this device. Please try again later or contact us directly on WhatsApp.',
});

// POST /api/contact
contactRouter.post('/contact', contactLimiter, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}) as any);
    const { name, email, phone, inquiryType, subject, message, language } = body;

    const cleanName = typeof name === 'string' ? name.trim().slice(0, 80) : '';
    const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 100) : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 40) : '';
    const cleanCategory = typeof inquiryType === 'string' ? inquiryType.trim() : 'general';
    const cleanSubject = typeof subject === 'string' ? subject.trim().slice(0, 120) : '';
    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 2500) : '';
    const isAr = language === 'ar';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName || cleanName.length < 2) {
      return c.json(
        { success: false, error: isAr ? 'الاسم مطلوب (حرفان على الأقل)' : 'Full name is required (minimum 2 characters)', field: 'name' },
        400
      );
    }
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return c.json(
        { success: false, error: isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please provide a valid email address', field: 'email' },
        400
      );
    }
    if (!cleanMessage || cleanMessage.length < 10) {
      return c.json(
        { success: false, error: isAr ? 'الرسالة يجب أن لا تقل عن 10 أحرف' : 'Message must be at least 10 characters long', field: 'message' },
        400
      );
    }

    const inquiryId = `LHB-INQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const categoryInfo = CATEGORY_NAMES[cleanCategory] || CATEGORY_NAMES.general;
    const catLabel = isAr ? categoryInfo.ar : categoryInfo.en;
    const formattedEmailSubject = `[LΛHΛB Inquiry #${inquiryId}] ${cleanSubject || `Inquiry from ${cleanName}`}`;

    const formattedBodyText = isAr
      ? `طلب استفسار جديد — لَهَب LΛHΛB\n-----------------------------------------\n` +
        `• كود المرجع: ${inquiryId}\n• الاسم: ${cleanName}\n• البريد الإلكتروني: ${cleanEmail}\n` +
        `• الهاتف / واتساب: ${cleanPhone || 'غير محدد'}\n• نوع الاستفسار: ${catLabel}\n` +
        (cleanSubject ? `• الموضوع: ${cleanSubject}\n` : '') +
        `-----------------------------------------\n\nنص الرسالة:\n${cleanMessage}`
      : `New Atelier Inquiry — LΛHΛB Heritage\n-----------------------------------------\n` +
        `• Reference Code: ${inquiryId}\n• Client Name: ${cleanName}\n• Client Email: ${cleanEmail}\n` +
        `• Client Phone: ${cleanPhone || 'Not provided'}\n• Category: ${catLabel}\n` +
        (cleanSubject ? `• Subject: ${cleanSubject}\n` : '') +
        `-----------------------------------------\n\nMessage:\n${cleanMessage}`;

    const whatsappText = isAr
      ? `السلام عليكم، استفسار جديد عبر موقع لَهَب LΛHΛB [كود: ${inquiryId}]\n\n• الاسم: ${cleanName}\n• البريد: ${cleanEmail}\n• الهاتف: ${cleanPhone || 'غير محدد'}\n• التصنيف: ${catLabel}\n` +
        (cleanSubject ? `• الموضوع: ${cleanSubject}\n` : '') +
        `• الرسالة:\n${cleanMessage}`
      : `Greetings LΛHΛB Atelier,\nNew Inquiry [Ref: ${inquiryId}]\n\n• Name: ${cleanName}\n• Email: ${cleanEmail}\n• Phone: ${cleanPhone || 'Not provided'}\n• Category: ${catLabel}\n` +
        (cleanSubject ? `• Subject: ${cleanSubject}\n` : '') +
        `• Message:\n${cleanMessage}`;

    const whatsappUrl = `https://wa.me/${ATELIER_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${ATELIER_TARGET_EMAIL}&su=${encodeURIComponent(formattedEmailSubject)}&body=${encodeURIComponent(formattedBodyText)}`;
    const mailtoUrl = `mailto:${ATELIER_TARGET_EMAIL}?subject=${encodeURIComponent(formattedEmailSubject)}&body=${encodeURIComponent(formattedBodyText)}`;

    const emailStatus = await sendEmail(c.env, {
      to: ATELIER_TARGET_EMAIL,
      replyTo: cleanEmail,
      subject: formattedEmailSubject,
      text: formattedBodyText,
      html: `<div style="font-family: Arial, sans-serif; background-color: #0D1929; color: #E2E6E8; padding: 24px; border-radius: 8px;">
        <h2 style="color: #D8A065; margin: 0; font-size: 20px;">LΛHΛB | ATELIER INQUIRY</h2>
        <p style="color: #8E9CAE; font-size: 12px;">Reference: <strong>${inquiryId}</strong></p>
        <table style="width: 100%; font-size: 14px; margin: 16px 0;">
          <tr><td style="color:#8E9CAE; padding:4px 0;">Name:</td><td style="color:#FFF;">${cleanName}</td></tr>
          <tr><td style="color:#8E9CAE; padding:4px 0;">Email:</td><td><a href="mailto:${cleanEmail}" style="color:#D8A065;">${cleanEmail}</a></td></tr>
          <tr><td style="color:#8E9CAE; padding:4px 0;">Phone:</td><td style="color:#FFF;">${cleanPhone || 'Not specified'}</td></tr>
          <tr><td style="color:#8E9CAE; padding:4px 0;">Category:</td><td style="color:#D8A065;">${catLabel}</td></tr>
        </table>
        <div style="background:#132238; border-left:3px solid #D8A065; padding:16px;">
          <p style="white-space:pre-wrap; margin:0; color:#E2E6E8;">${cleanMessage}</p>
        </div>
      </div>`,
    });

    const timestamp = new Date().toISOString();
    await c.env.DB.prepare(
      `INSERT INTO inquiries (id, timestamp, name, email, phone, inquiryType, subject, message, emailStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(inquiryId, timestamp, cleanName, cleanEmail, cleanPhone || null, cleanCategory, cleanSubject || null, cleanMessage, emailStatus)
      .run();

    return c.json({
      success: true,
      inquiryId,
      timestamp,
      message: isAr
        ? `تم استلام وتوجيه استفسارك بنجاح إلى ${ATELIER_TARGET_EMAIL}`
        : `Your inquiry has been successfully recorded and routed to ${ATELIER_TARGET_EMAIL}`,
      whatsappUrl,
      gmailUrl,
      mailtoUrl,
      emailStatus,
      targetEmail: ATELIER_TARGET_EMAIL,
      targetWhatsApp: `+${ATELIER_WHATSAPP_NUMBER}`,
    });
  } catch (error) {
    console.error('[LAHAB Worker] Unexpected error in /api/contact:', error);
    return c.json({ success: false, error: 'An unexpected error occurred while processing your inquiry.' }, 500);
  }
});

// POST /api/stock-alert
contactRouter.post(
  '/stock-alert',
  rateLimit({ name: 'stock-alert', windowSeconds: 15 * 60, limit: 5, message: 'Too many requests. Please try again later.' }),
  async (c) => {
    try {
      const { email, phone, productName, size, language } = await c.req.json().catch(() => ({}) as any);
      const isAr = language === 'ar';

      const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 100) : '';
      const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 40) : '';
      const cleanProduct = typeof productName === 'string' ? productName.trim().slice(0, 120) : 'Unknown Piece';
      const cleanSize = typeof size === 'string' ? size.trim().slice(0, 10) : 'N/A';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return c.json({ success: false, error: isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please provide a valid email address' }, 400);
      }

      const alertId = `LHB-ALERT-${Math.floor(1000 + Math.random() * 9000)}`;

      const emailStatus = await sendEmail(c.env, {
        to: ATELIER_TARGET_EMAIL,
        replyTo: cleanEmail,
        subject: `[LΛHΛB Stock Alert #${alertId}] ${cleanProduct} - Size ${cleanSize}`,
        text:
          `New restock alert signup\nReference: ${alertId}\nPiece: ${cleanProduct}\nSize: ${cleanSize}\n` +
          `Notify Email: ${cleanEmail}\nNotify Phone: ${cleanPhone || 'Not provided'}\n`,
      });

      return c.json({ success: true, alertId, emailStatus });
    } catch (error) {
      console.error('[LAHAB Worker] Unexpected error in /api/stock-alert:', error);
      return c.json({ success: false, error: 'An unexpected error occurred while registering your alert.' }, 500);
    }
  }
);

// POST /api/checkout — Full order reservation: saves to DB, sends email, returns WhatsApp & Gmail links
const CHECKOUT_COUPONS: Record<string, number> = {
  LAHABLTD: 15,
  VIP15: 15,
  DROP02: 15,
  DROP01: 10,
  FIRE10: 10,
};

interface CheckoutProductRow {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  priceEGP: number;
  sizes: string;
}

contactRouter.post(
  '/checkout',
  rateLimit({ name: 'checkout', windowSeconds: 15 * 60, limit: 10, message: 'Too many order submissions. Please try again shortly.' }),
  async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}) as any);
      const { fullName, phone, email, address, location, regionType, paymentMethod, notes, couponCode, items, language } = body;

      const isAr = language === 'ar';

      const cleanName = typeof fullName === 'string' ? fullName.trim().slice(0, 80) : '';
      const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 40) : '';
      const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 100) : '';
      const cleanAddress = typeof address === 'string' ? address.trim().slice(0, 300) : '';
      const cleanLocation = typeof location === 'string' ? location.trim().slice(0, 120) : '';
      const cleanNotes = typeof notes === 'string' ? notes.trim().slice(0, 500) : '';

      if (!cleanName || cleanName.length < 2) {
        return c.json({ success: false, error: isAr ? 'الاسم مطلوب' : 'Full name is required', field: 'fullName' }, 400);
      }
      if (!cleanPhone || cleanPhone.length < 7) {
        return c.json({ success: false, error: isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required', field: 'phone' }, 400);
      }
      if (!cleanAddress) {
        return c.json({ success: false, error: isAr ? 'العنوان مطلوب' : 'Delivery address is required', field: 'address' }, 400);
      }

      if (regionType !== 'egypt' && regionType !== 'gcc') {
        return c.json({ success: false, error: 'A valid delivery region is required.', field: 'regionType' }, 400);
      }
      if (!Array.isArray(items) || items.length === 0 || items.length > 25) {
        return c.json({ success: false, error: 'The order must contain between 1 and 25 items.', field: 'items' }, 400);
      }

      const parsedItems: Array<{ productId: string; name: string; code: string; size: string; quantity: number; price: number; monogram?: string }> = [];
      for (const rawItem of items) {
        const productId = typeof rawItem?.productId === 'string' ? rawItem.productId.trim() : '';
        const size = typeof rawItem?.size === 'string' ? rawItem.size.trim() : '';
        const quantity = Number(rawItem?.quantity);
        if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
          return c.json({ success: false, error: 'An order item is malformed.', field: 'items' }, 400);
        }
        const product = await c.env.DB.prepare(
          'SELECT id, code, nameEn, nameAr, priceEGP, sizes FROM products WHERE id = ?'
        ).bind(productId).first<CheckoutProductRow>();
        if (!product) {
          return c.json({ success: false, error: `Product ${productId} is no longer available.`, field: 'items' }, 422);
        }
        const allowedSizes = JSON.parse(product.sizes) as string[];
        if (!allowedSizes.includes(size)) {
          return c.json({ success: false, error: `Size ${size} is not available for ${product.code}.`, field: 'items' }, 422);
        }
        const monogram = typeof rawItem?.monogram === 'string'
          ? rawItem.monogram.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80)
          : '';
        parsedItems.push({
          productId,
          name: isAr ? product.nameAr : product.nameEn,
          code: product.code,
          size,
          quantity,
          price: Math.round(product.priceEGP),
          ...(monogram ? { monogram } : {}),
        });
      }

      const subtotalEGP = parsedItems.reduce(
        (sum, item) => sum + item.price * item.quantity + (item.monogram ? 350 * item.quantity : 0),
        0
      );
      const normalizedCoupon = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';
      const discountPercent = normalizedCoupon ? CHECKOUT_COUPONS[normalizedCoupon] : 0;
      if (normalizedCoupon && !discountPercent) {
        return c.json({ success: false, error: 'This coupon code is not valid.', field: 'couponCode' }, 422);
      }
      const discountAmount = Math.round(subtotalEGP * (discountPercent / 100));
      const cairoOrGiza = regionType === 'egypt' && /cairo|giza|القاهرة|الجيزة/i.test(cleanLocation);
      const shippingFeeEGP = regionType === 'gcc' ? 350 : cairoOrGiza ? 0 : 50;
      const totalEGP = Math.max(0, subtotalEGP - discountAmount + shippingFeeEGP);

      const prefix = regionType === 'gcc' ? 'LHB-GCC' : 'LHB-EG';
      const reservationCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      const timestamp = new Date().toISOString();

      const itemsSummaryText = parsedItems
        .map(
          (item) =>
            `  • ${item.name} [${item.code}] | Size: ${item.size} | Qty: ${item.quantity} | ${(item.price * item.quantity).toLocaleString()} EGP${
              item.monogram ? ` | BESPOKE: "${item.monogram}"` : ''
            }`
        )
        .join('\n');

      const paymentLabel =
        paymentMethod === 'cod'
          ? isAr ? 'الدفع نقداً عند الاستلام (COD)' : 'Cash on Delivery (COD)'
          : paymentMethod === 'instapay'
          ? isAr ? 'إنستاباي / فوري' : 'InstaPay / Fawry'
          : isAr ? 'بطاقة دفع إلكتروني' : 'Credit / Debit Card';

      const emailSubject = `[LΛHΛB ORDER #${reservationCode}] ${cleanName} — ${cleanLocation}`;
      const emailBodyText = isAr
        ? `طلب حجز رسمي جديد — لَهَب LΛHΛB\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• كود التتبع: ${reservationCode}\n• التاريخ: ${timestamp}\n• الاسم: ${cleanName}\n• الهاتف: ${cleanPhone}\n• البريد: ${cleanEmail || 'غير محدد'}\n• المنطقة: ${cleanLocation} (${regionType?.toUpperCase()})\n• العنوان: ${cleanAddress}\n• طريقة الدفع: ${paymentLabel}\n${couponCode ? `• كود الخصم: ${couponCode}\n` : ''}${cleanNotes ? `• ملاحظات: ${cleanNotes}\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nالقطع المطلوبة:\n${itemsSummaryText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nالمجموع: ${subtotalEGP?.toLocaleString()} EGP\n${discountAmount > 0 ? `الخصم: -${discountAmount?.toLocaleString()} EGP\n` : ''}الشحن: ${shippingFeeEGP === 0 ? 'مجاناً' : `${shippingFeeEGP} EGP`}\nالإجمالي: ${totalEGP?.toLocaleString()} EGP`
        : `New Official Order — LΛHΛB Atelier\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Tracking Code: ${reservationCode}\n• Timestamp: ${timestamp}\n• Client Name: ${cleanName}\n• Phone: ${cleanPhone}\n• Email: ${cleanEmail || 'Not provided'}\n• Destination: ${cleanLocation} (${regionType?.toUpperCase()})\n• Address: ${cleanAddress}\n• Payment: ${paymentLabel}\n${couponCode ? `• Coupon: ${couponCode}\n` : ''}${cleanNotes ? `• Notes: ${cleanNotes}\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOrdered Items:\n${itemsSummaryText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSubtotal: ${subtotalEGP?.toLocaleString()} EGP\n${discountAmount > 0 ? `Discount: -${discountAmount?.toLocaleString()} EGP\n` : ''}Shipping: ${shippingFeeEGP === 0 ? 'FREE' : `${shippingFeeEGP} EGP`}\nTOTAL: ${totalEGP?.toLocaleString()} EGP`;

      const emailStatus = await sendEmail(c.env, {
        to: ATELIER_TARGET_EMAIL,
        replyTo: cleanEmail || undefined,
        subject: emailSubject,
        text: emailBodyText,
        html: `<div style="font-family:Arial,sans-serif;background:#0D1929;color:#E2E6E8;padding:28px;border-radius:8px;max-width:600px;">
          <h2 style="color:#D8A065;margin:0 0 4px;font-size:22px;letter-spacing:2px;">LΛHΛB — NEW ORDER</h2>
          <p style="color:#8E9CAE;font-size:12px;margin:0 0 20px;">Code: <strong style="color:#D8A065;">${reservationCode}</strong></p>
          <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="color:#8E9CAE;padding:4px 0;">Client:</td><td style="color:#FFF;font-weight:bold;">${cleanName}</td></tr>
            <tr><td style="color:#8E9CAE;padding:4px 0;">Phone:</td><td style="color:#FFF;">${cleanPhone}</td></tr>
            <tr><td style="color:#8E9CAE;padding:4px 0;">Email:</td><td><a href="mailto:${cleanEmail}" style="color:#D8A065;">${cleanEmail || 'N/A'}</a></td></tr>
            <tr><td style="color:#8E9CAE;padding:4px 0;">Region:</td><td style="color:#FFF;">${cleanLocation}</td></tr>
            <tr><td style="color:#8E9CAE;padding:4px 0;">Address:</td><td style="color:#FFF;">${cleanAddress}</td></tr>
            <tr><td style="color:#8E9CAE;padding:4px 0;">Payment:</td><td style="color:#D8A065;font-weight:bold;">${paymentLabel}</td></tr>
          </table>
          <div style="background:#132238;border-left:3px solid #D8A065;padding:16px;margin-bottom:16px;">
            <p style="color:#D8A065;font-size:11px;font-weight:bold;margin:0 0 10px;">ORDERED ITEMS</p>
            ${parsedItems.map((item) => `<div style="border-bottom:1px solid #1e3a5f;padding:7px 0;font-size:13px;"><span style="color:#D8A065;font-weight:bold;">${item.code}</span> — ${item.name}<br/><span style="color:#8E9CAE;">Size: ${item.size} | Qty: ${item.quantity} | ${(item.price * item.quantity).toLocaleString()} EGP</span>${item.monogram ? `<br/><span style="color:#D8A065;font-size:11px;">✨ BESPOKE: "${item.monogram}"</span>` : ''}</div>`).join('')}
          </div>
          <table style="width:100%;font-size:14px;">
            <tr><td style="color:#8E9CAE;">Subtotal:</td><td style="text-align:right;color:#FFF;">${subtotalEGP?.toLocaleString()} EGP</td></tr>
            ${discountAmount > 0 ? `<tr><td style="color:#8E9CAE;">Discount:</td><td style="text-align:right;color:#22c55e;">-${discountAmount?.toLocaleString()} EGP</td></tr>` : ''}
            <tr><td style="color:#8E9CAE;">Shipping:</td><td style="text-align:right;color:${shippingFeeEGP === 0 ? '#22c55e' : '#FFF'};">${shippingFeeEGP === 0 ? 'FREE' : `${shippingFeeEGP} EGP`}</td></tr>
            <tr style="font-size:18px;font-weight:bold;"><td style="color:#D8A065;padding-top:8px;border-top:1px solid #1e3a5f;">TOTAL</td><td style="text-align:right;color:#D8A065;padding-top:8px;border-top:1px solid #1e3a5f;">${totalEGP?.toLocaleString()} EGP</td></tr>
          </table>
        </div>`,
      });

      const waText = isAr
        ? `السلام عليكم، تأكيد طلب لَهَب LΛHΛB\n\nكود: ${reservationCode}\nالاسم: ${cleanName}\nهاتف: ${cleanPhone}\nالوجهة: ${cleanLocation}\nالعنوان: ${cleanAddress}\nالدفع: ${paymentLabel}\n\nالقطع:\n${itemsSummaryText}\n\nالإجمالي: ${totalEGP?.toLocaleString()} EGP`
        : `LΛHΛB Order Confirmation\n\nRef: ${reservationCode}\nName: ${cleanName}\nPhone: ${cleanPhone}\nDestination: ${cleanLocation}\nAddress: ${cleanAddress}\nPayment: ${paymentLabel}\n\nItems:\n${itemsSummaryText}\n\nTotal: ${totalEGP?.toLocaleString()} EGP`;

      const whatsappUrl = `https://wa.me/${ATELIER_WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${ATELIER_TARGET_EMAIL}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
      const mailtoUrl = `mailto:${ATELIER_TARGET_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;

      try {
        await c.env.DB.prepare(
          `INSERT INTO inquiries (id, timestamp, name, email, phone, inquiryType, subject, message, emailStatus, orderDataJson, totalEGP)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            reservationCode,
            timestamp,
            cleanName,
            cleanEmail || '',
            cleanPhone,
            'order',
            emailSubject,
            emailBodyText.slice(0, 2500),
            emailStatus,
            JSON.stringify({ items: parsedItems, subtotalEGP, shippingFeeEGP, discountAmount, totalEGP, couponCode: normalizedCoupon || null, regionType, location: cleanLocation, paymentMethod }),
            totalEGP
          )
          .run();
      } catch (dbErr) {
        console.warn('[LAHAB Worker] DB insert for order failed (non-fatal):', dbErr);
      }

      return c.json({
        success: true,
        reservationCode,
        timestamp,
        whatsappUrl,
        gmailUrl,
        mailtoUrl,
        emailStatus,
        subtotalEGP,
        shippingFeeEGP,
        discountAmount,
        totalEGP,
        message: isAr
          ? `تم تسجيل طلبك برقم ${reservationCode} وإرسال الإشعار للأتيليه.`
          : `Order ${reservationCode} registered and dispatched to the atelier.`,
      });
    } catch (error) {
      console.error('[LAHAB Worker] Unexpected error in /api/checkout:', error);
      return c.json({ success: false, error: 'An unexpected error occurred while processing your order.' }, 500);
    }
  }
);

// GET /api/inquiries — Admin inquiries & order list
contactRouter.get('/inquiries', requireAdmin, async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM inquiries ORDER BY timestamp DESC LIMIT 100').all();
    const inquiries = results.map((row: any) => {
      let orderData = null;
      try {
        orderData = row.orderDataJson ? JSON.parse(row.orderDataJson) : null;
      } catch {
        orderData = null;
      }
      const storedTotal = Number(row.totalEGP);
      const legacyMatch = typeof row.message === 'string' ? row.message.match(/(?:TOTAL|Total):\s*([\d,]+)\s*EGP/i) : null;
      const legacyTotal = legacyMatch ? Number(legacyMatch[1].replace(/,/g, '')) : null;
      const safeTotal = row.totalEGP !== null && Number.isFinite(storedTotal) && storedTotal >= 0
        ? storedTotal
        : Number.isFinite(legacyTotal) ? legacyTotal : null;
      return { ...row, orderData, totalEGP: safeTotal };
    });
    return c.json({ success: true, inquiries });
  } catch (err) {
    return c.json({ success: false, inquiries: [] });
  }
});
