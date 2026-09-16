export type Language = 'en' | 'ar';

export interface TranslationSchema {
  nav: {
    concept: string;
    pieces: string;
    editorial: string;
    sizeGuide: string;
    bag: string;
    langButton: string;
    langButtonAlt: string;
    themeToggleNavy: string;
    themeToggleDesert: string;
    themeToggleAlt: string;
  };
  hero: {
    dropBadge: string;
    tagline: string;
    subTagline: string;
    ctaShop: string;
    ctaStory: string;
    aestheticTag: string;
    fabricTag: string;
    editionLabel: string;
    editionValue: string;
    shippingLabel: string;
    shippingValue: string;
    scrollPrompt: string;
  };
  banner: {
    streetwear: string;
    tagline: string;
    origin: string;
  };
  story: {
    badge: string;
    headline: string;
    body: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
  };
  editorial: {
    badge: string;
    title: string;
    subtitle: string;
    craftTitle: string;
    craftDesc: string;
    btnMatrix: string;
    btnExplore: string;
  };
  showcase: {
    badge: string;
    title: string;
    limitedUnits: string;
    frontView: string;
    backView: string;
    viewSpecs: string;
    hideSpecs: string;
    selectSize: string;
    fitNotice: string;
    addToBag: string;
    addedToBag: string;
    hoverToZoom: string;
    zoomActive: string;
    emailWhenAvailable: string;
    sizeSoldOutNotice: string;
    sharePiece: string;
    shareWhatsApp: string;
    shareTwitter: string;
    copyLink: string;
    linkCopied: string;
    assuranceTitle: string;
    assuranceDesc: string;
  };
  cart: {
    title: string;
    reservedCount: (count: number) => string;
    emptyTitle: string;
    emptyDesc: string;
    exploreBtn: string;
    closeBtn: string;
    colorLabel: string;
    colorVal: string;
    shippingLabel: string;
    shippingVal: string;
    batchLabel: string;
    batchVal: string;
    totalLabel: string;
    checkoutBtn: string;
    confirmedTitle: string;
    confirmedDesc: string;
    returnBtn: string;
  };
  sizeModal: {
    title: string;
    subtitle: string;
    unitLabel: string;
    thSize: string;
    thChest: string;
    thLength: string;
    thShoulder: string;
    thHeight: string;
    guideTitle: string;
    guide1: string;
    guide2: string;
    understoodBtn: string;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{
      id: string;
      category: string;
      question: string;
      answer: string;
    }>;
  };
  footer: {
    brandDesc: string;
    navHeading: string;
    topLink: string;
    conceptLink: string;
    piecesLink: string;
    sizeLink: string;
    notifyHeading: string;
    notifyDesc: string;
    emailPlaceholder: string;
    joinBtn: string;
    joinedMsg: string;
    communityHeading: string;
    copyright: string;
    edition: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    nav: {
      concept: 'CONCEPT',
      pieces: 'DROP 01 PIECES',
      editorial: 'LOOKBOOK',
      sizeGuide: 'SIZE GUIDE',
      bag: 'BAG',
      langButton: 'ARABIC',
      langButtonAlt: 'Switch to Arabic',
      themeToggleNavy: 'NOCTURNAL NAVY',
      themeToggleDesert: 'DESERT SAND',
      themeToggleAlt: 'Toggle theme',
    },
    hero: {
      dropBadge: 'LIMITED ARCHIVE // DROP 01',
      tagline: 'STREETWEAR FORGED IN HERITAGE',
      subTagline:
        'Architectural cuts rooted in calligraphic discipline, nocturnal palettes, and raw street aesthetics. Crafted for those who move in quiet conviction.',
      ctaShop: 'SHOP DROP 01',
      ctaStory: 'DISCOVER CONCEPT',
      aestheticTag: 'NIGHT & FIRE AESTHETIC',
      fabricTag: 'Heavyweight 520 GSM French Terry & Combed Cotton',
      editionLabel: 'EDITION',
      editionValue: 'FIRST RUN / 200 PIECES',
      shippingLabel: 'SHIPMENT',
      shippingValue: 'WORLDWIDE EXPRESS',
      scrollPrompt: 'SCROLL TO EXPLORE',
    },
    banner: {
      streetwear: 'CONTEMPORARY STREETWEAR',
      tagline: 'FIRE FORGED IN ARCHITECTURAL FORM',
      origin: 'LIMITED FIRST EDITION',
    },
    story: {
      badge: '01 // CONCEPT & HERITAGE',
      headline: 'THE STREET MEETS CENTURIES OF CALLIGRAPHIC DISCIPLINE.',
      body:
        'LAHAB was born from a singular conviction: heritage is not a museum artifact—it is an untamed, kinetic current alive in the night streets. We fuse the mathematical geometry of classical script and arabesque line discipline into drop-shoulder, heavyweight streetwear.',
      feature1Title: 'NOVEL SILHOUETTES',
      feature1Desc: 'Boxy, drop-shoulder forms engineered with dense fabric drape.',
      feature2Title: 'TACTILE EMBROIDERY',
      feature2Desc: 'Matte gold high-density threadwork that endures relentless wear.',
      feature3Title: 'LIVING FLAME FORM',
      feature3Desc: 'Fluid calligraphic energy translated into modern silhouette lines.',
    },
    editorial: {
      badge: 'ARCHITECTURAL PROFILE // TEXTILE DISCIPLINE',
      title: 'DENSE FABRIC DRAPE. PERMANENT EMBROIDERY.',
      subtitle:
        'Custom-milled heavyweight combed cotton and French terry. Deep nocturnal navy reactive dye with abrasion-resistant matte gold accents.',
      craftTitle: 'ZERO COMPROMISE STANDARDS',
      craftDesc:
        'We reject fast fashion and flimsy synthetics. Every garment is cut wide with dense dropped shoulders to create an architectural profile that stands out without shouting.',
      btnMatrix: 'VIEW SIZE MATRIX',
      btnExplore: 'EXPLORE PIECES',
    },
    showcase: {
      badge: 'DROP 01 // FIRST EDITION',
      title: 'THE ESSENTIAL PIECES',
      limitedUnits: 'Only 100 units per piece released in Drop 01',
      frontView: 'FRONT VIEW',
      backView: 'BACK VIEW',
      viewSpecs: 'VIEW SPECS',
      hideSpecs: 'HIDE SPECS',
      selectSize: 'SELECT SIZE (BOXY FIT)',
      fitNotice: 'TRUE TO STREETWEAR SIZE',
      addToBag: 'ADD TO BAG',
      addedToBag: 'ADDED TO BAG',
      hoverToZoom: 'HOVER TO ZOOM & INSPECT TEXTURE',
      zoomActive: '2.25X MACRO INSPECTION',
      emailWhenAvailable: 'EMAIL ME WHEN AVAILABLE',
      sizeSoldOutNotice: 'Size is sold out in Drop 01. Join the priority waitlist for private restock alert.',
      sharePiece: 'SHARE PIECE',
      shareWhatsApp: 'Share on WhatsApp',
      shareTwitter: 'Share on X / Twitter',
      copyLink: 'Copy Link',
      linkCopied: 'LINK COPIED TO CLIPBOARD',
      assuranceTitle: 'GARMENT ASSURANCE & MATERIAL STANDARD',
      assuranceDesc:
        'Custom-milled heavyweight cotton & fleece. Color-fast deep navy reactive dye. Embroideries use high-tensile matte gold thread.',
    },
    cart: {
      title: 'YOUR BAG',
      reservedCount: (count: number) =>
        `${count} ${count === 1 ? 'PIECE' : 'PIECES'} RESERVED`,
      emptyTitle: 'YOUR BAG IS CURRENTLY EMPTY',
      emptyDesc: 'Explore Drop 01 pieces and reserve your size before the batch is exhausted.',
      exploreBtn: 'EXPLORE DROP 01',
      closeBtn: 'CLOSE',
      colorLabel: 'COLOR',
      colorVal: 'NIGHT NAVY',
      shippingLabel: 'SHIPPING',
      shippingVal: 'COMPLIMENTARY EXPRESS',
      batchLabel: 'DROP BATCH',
      batchVal: 'EDITION 01 / VERIFIED',
      totalLabel: 'TOTAL',
      checkoutBtn: 'CHECKOUT RESERVATION',
      confirmedTitle: 'DROP 01 RESERVATION CONFIRMED',
      confirmedDesc:
        'Your limited edition order has been locked into our dispatch queue. Tracking details will be dispatched immediately.',
      returnBtn: 'RETURN TO ARCHIVE',
    },
    sizeModal: {
      title: 'SIZING & FIT GUIDE',
      subtitle: 'All LAHAB garments feature an architectural boxy drop-shoulder cut.',
      unitLabel: 'GARMENT MEASUREMENTS (CENTIMETERS / CM)',
      thSize: 'SIZE',
      thChest: 'CHEST WIDTH',
      thLength: 'BODY LENGTH',
      thShoulder: 'SHOULDER DROP',
      thHeight: 'RECOMMENDED HEIGHT',
      guideTitle: 'HOW TO CHOOSE YOUR FIT',
      guide1: 'For standard oversized streetwear look: choose your regular size. Garments feature a generous 4-6 cm boxy ease.',
      guide2: 'For a cleaner, fitted look: size down one size.',
      understoodBtn: 'UNDERSTOOD',
    },
    faq: {
      badge: '04 // ARCHIVE INQUIRIES & DETAILS',
      title: 'FREQUENTLY ASKED QUESTIONS',
      subtitle:
        'Essential information regarding domestic courier dispatch, garment longevity, Egyptian craftsmanship, and sizing assurances.',
      items: [
        {
          id: 'shipping',
          category: 'SHIPPING & DISPATCH',
          question: 'How fast is delivery and can I inspect the piece upon arrival?',
          answer:
            'All Drop 01 orders are dispatched via dedicated express courier across Cairo, Giza, Alexandria, and all Egyptian governorates within 24 to 48 hours. We operate with Cash on Delivery (COD) and explicitly welcome physical garment inspection prior to acceptance, ensuring you can verify the heavyweight fleece density and gold embroidery threadwork firsthand.',
        },
        {
          id: 'care',
          category: 'GARMENT CARE & LONGEVITY',
          question: 'What are the recommended washing and care instructions for 520 GSM fleece?',
          answer:
            'To preserve the architectural form, deep night-navy reactive dye, and high-density matte gold embroidery: wash inside out on a gentle cold cycle (30°C max) with mild detergent. Do not tumble dry—lay flat to dry in shade to maintain the boxy drape. If ironing is needed, steam lightly on the reverse side; never iron directly over the embroidery or back flame calligraphy.',
        },
        {
          id: 'origin',
          category: 'ORIGIN & CRAFTSMANSHIP',
          question: 'Where are LAHAB pieces designed, milled, and manufactured?',
          answer:
            'Every LAHAB piece is conceived and architecturally patterned in Cairo. Our garments are crafted from 100% premium long-staple Egyptian cotton, custom-knitted into high-density 520 GSM French Terry fleece and 290 GSM combed jersey in historic Egyptian textile mills. Precision multi-head embroidery and archival screenprinting are executed locally with master artisans.',
        },
        {
          id: 'sizing',
          category: 'SIZING & EXCHANGES',
          question: 'How does the boxy drop-shoulder fit work, and can I exchange sizes?',
          answer:
            'LAHAB garments are engineered with an intentional boxy drop-shoulder silhouette featuring 4–6 cm of ease. We advise selecting your standard size for the intended relaxed streetwear drape, or sizing down one size for a more tailored profile. If you require a size swap, we offer a complimentary 14-day exchange on unworn pieces with security tags intact.',
        },
      ],
    },
    footer: {
      brandDesc:
        'LAHAB. Contemporary streetwear forged in calligraphic heritage, nocturnal geometry, and heavyweight textile discipline.',
      navHeading: 'NAVIGATION',
      topLink: 'TOP // INTRO',
      conceptLink: 'CONCEPT & STORY',
      piecesLink: 'DROP 01 PIECES',
      sizeLink: 'SIZING & FABRICS',
      notifyHeading: 'DROP NOTIFICATIONS',
      notifyDesc:
        'Drop 01 is strictly limited. Enter your email for private drop access and archive keys.',
      emailPlaceholder: 'ENTER YOUR EMAIL...',
      joinBtn: 'JOIN',
      joinedMsg: 'YOU ARE REGISTERED FOR DROP 01 ARCHIVE ALERTS.',
      communityHeading: 'COMMUNITY ARCHIVE',
      copyright: 'LAHAB. ALL RIGHTS RESERVED.',
      edition: 'EDITION 1.0',
    },
  },
  ar: {
    nav: {
      concept: 'المفهوم',
      pieces: 'قطع الإصدار الأول',
      editorial: 'لوحة الإطلالات',
      sizeGuide: 'دليل المقاسات',
      bag: 'الحقيبة',
      langButton: 'ENGLISH',
      langButtonAlt: 'التحويل إلى الإنجليزية',
      themeToggleNavy: 'الليلي الداكن',
      themeToggleDesert: 'رمال الصحراء',
      themeToggleAlt: 'تبديل المظهر',
    },
    hero: {
      dropBadge: 'إصدار أرشيفي حصري // المجموعة الأولى',
      tagline: 'أزياء الشارع المصهورة في عبق الأصالة',
      subTagline:
        'قوالب معمارية مستوحاة من طاقة الخط العربي، ألوان الليل العميقة، وثقافة الشارع المعاصرة. صُممت لمن يتحركون بيقين وهدوء.',
      ctaShop: 'تسوق الإصدار الأول',
      ctaStory: 'اكتشف المفهوم',
      aestheticTag: 'جمالية الليل والنار',
      fabricTag: 'قطن فرينش تيري ثقيل 520 جرام وقطن ممشط فاخر',
      editionLabel: 'الإصدار',
      editionValue: 'الدفعة الأولى / 200 قطعة',
      shippingLabel: 'الشحن',
      shippingValue: 'شحن سريع لجميع أنحاء العالم',
      scrollPrompt: 'اسحب لاستكشاف المجموعة',
    },
    banner: {
      streetwear: 'أزياء الشارع المعاصرة',
      tagline: 'طاقة اللهب في قوالب معمارية متقنة',
      origin: 'إصدار أول محدود',
    },
    story: {
      badge: '01 // المفهوم والأصالة',
      headline: 'حين يلتقي نبض الشارع بقرون من انضباط فن الخط.',
      body:
        'ولدت علامة لَهَب من قناعة راسخة: الثقافة والأصالة ليست أثرًا في متحف، بل تيار جامح ينبض بالحياة في شوارع الليل. نمزج الهندسة الرياضية للخط الكلاسيكي وزخارف الأرابيسك مع قصات أزياء الشارع الثقيلة والواسعة.',
      feature1Title: 'قصات معمارية مبتكرة',
      feature1Desc: 'تصاميم عريضة بأكتاف ساقطة تمنح القماش ثقلًا وانسيابية فريدة.',
      feature2Title: 'تطريز ملموس وعالي الكثافة',
      feature2Desc: 'خيوط ذهبية مطفية متينة تصمد أمام أصعب ظروف الارتداء اليومي.',
      feature3Title: 'طاقة خطية متدفقة',
      feature3Desc: 'تتحول حركة الحروف التراثية إلى خطوط ظلية معاصرة مفعمة بالحيوية.',
    },
    editorial: {
      badge: 'القالب المعماري // انضباط النسيج',
      title: 'ثقل نسيجي استثنائي. تطريز ذهبي دائم.',
      subtitle:
        'قطن ممشط فاخر وفرينش تيري بوزن ثقيل خاص. صباغة كحلية ليلية مقاومة للتلاشي مع تفاصيل ذهبية مطفية عالية التحمل.',
      craftTitle: 'معايير بلا مساومة',
      craftDesc:
        'نرفض الأزياء السريعة والأقمشة الصناعية الرديئة. كل قطعة مقصوصة بعناية بأكتاف واسعة ساقطة لتمنحك حضورًا معماريًا هادئًا وقويًا في آن واحد.',
      btnMatrix: 'جدول المقاسات الكامل',
      btnExplore: 'استعراض القطع',
    },
    showcase: {
      badge: 'المجموعة الأولى // الإصدار الحصري',
      title: 'القطع الأساسية',
      limitedUnits: '100 قطعة فقط مخصصة لكل تصميم في هذا الإصدار',
      frontView: 'الواجهة الأمامية',
      backView: 'الواجهة الخلفية',
      viewSpecs: 'عرض المواصفات',
      hideSpecs: 'إخفاء المواصفات',
      selectSize: 'اختر المقاس (قصة عريضة)',
      fitNotice: 'مقاسات مطابقة لمعايير أزياء الشارع العالمية',
      addToBag: 'أضف إلى الحقيبة',
      addedToBag: 'تمت الإضافة إلى الحقيبة',
      hoverToZoom: 'حرك المؤشر للتكبير وفحص دقة النسيج والتطريز',
      zoomActive: 'فحص مجهري بدقة 2.25X',
      emailWhenAvailable: 'أعلمني فور توفر المقاس',
      sizeSoldOutNotice: 'نفد هذا المقاس من الإصدار الأول. انضم لقائمة الأولوية لتلقي إشعار فور توفره.',
      sharePiece: 'مشاركة القطعة',
      shareWhatsApp: 'مشاركة عبر واتساب',
      shareTwitter: 'مشاركة عبر منصة X / تويتر',
      copyLink: 'نسخ الرابط',
      linkCopied: 'تم نسخ رابط القطعة للحافظة',
      assuranceTitle: 'ضمان الجودة والمعايير النسيجية',
      assuranceDesc:
        'قطن وصوف فرينش تيري مخصص فائق الكثافة. صباغة تفاعلية ثابتة. تطريز بخيوط ذهبية مطفية عالية الشد.',
    },
    cart: {
      title: 'حقيبة التسوق',
      reservedCount: (count: number) =>
        `تم حجز ${count} ${count === 1 ? 'قطعة' : 'قطع'} في قائمتك`,
      emptyTitle: 'حقيبتك فارغة حاليًا',
      emptyDesc: 'استعرض قطع المجموعة الأولى واحجز مقاسك قبل نفاد الدفعة المحدودة.',
      exploreBtn: 'استعراض الإصدار الأول',
      closeBtn: 'إغلاق',
      colorLabel: 'اللون',
      colorVal: 'كحلي ليلي عميق',
      shippingLabel: 'الشحن',
      shippingVal: 'شحن سريع مجاني',
      batchLabel: 'دفعة الإصدار',
      batchVal: 'المجموعة 01 / مؤكدة ومسجلة',
      totalLabel: 'المجموع الكلي',
      checkoutBtn: 'تأكيد حجز الطلب',
      confirmedTitle: 'تم تأكيد حجز طلبك بنجاح',
      confirmedDesc:
        'تم تثبيت طلبك في قائمة الشحن للإصدار الحصري. ستصلك بيانات التتبع ورقم الإرسالية فور التجهيز.',
      returnBtn: 'العودة إلى المتجر',
    },
    sizeModal: {
      title: 'دليل المقاسات والقصة',
      subtitle: 'جميع قطع لَهَب تأتي بقصة معمارية عريضة بأكتاف ساقطة مميزة.',
      unitLabel: 'قياسات القطعة بالسنتيمتر (سم)',
      thSize: 'المقاس',
      thChest: 'عرض الصدر',
      thLength: 'طول القطعة',
      thShoulder: 'نزول الكتف',
      thHeight: 'الطول الموصى به',
      guideTitle: 'كيف تختار مقاسك المثالي',
      guide1: 'لإطلالة أزياء الشارع العريضة (أوفر سايز): اختر مقاسك المعتاد؛ القطع مصممة بزيادة 4-6 سم في الاتساع.',
      guide2: 'لقصة أقرب إلى الجسم وأقل اتساعًا: اختر مقاسًا واحدًا أصغر من مقاسك المعتاد.',
      understoodBtn: 'تم الاستيعاب',
    },
    faq: {
      badge: '04 // استفسارات الأرشيف والتفاصيل',
      title: 'الأسئلة الشائعة والمعلومات',
      subtitle:
        'كل ما تحتاج معرفته عن خدمات التوصيل المحلي، العناية بالنسيج الفاخر، أصالة التصنيع المصري، وضمان المقاسات.',
      items: [
        {
          id: 'shipping',
          category: 'الشحن والتوصيل',
          question: 'كم تستغرق مدة التوصيل، وهل يمكنني معاينة القطعة قبل الاستلام؟',
          answer:
            'يتم شحن جميع طلبات الإصدار الأول عبر مندوب شحن سريع وموثوق إلى القاهرة والجيزة والإسكندرية وجميع محافظات مصر خلال 24 إلى 48 ساعة. نوفر خدمة الدفع عند الاستلام (نقداً أو بالبطاقة) مع ميزة فحص ومعاينة القطعة وخامتها الفاخرة بالكامل قبل الدفع والاستلام لضمان ثقتك التامة.',
        },
        {
          id: 'care',
          category: 'العناية بالنسيج والغسيل',
          question: 'ما هي تعليمات الغسيل المثالية للحفاظ على هودي 520 جرام والتي شيرت؟',
          answer:
            'للحفاظ على قوام القطعة المعماري، ولون الكحلي الليلي الغني، وخيوط التطريز الذهبي: يُفضل غسل القطعة مقلوبة بالماء البارد (30 درجة مئوية كحد أقصى) مع منظف معتدل. تجنب التجفيف الآلي، وانشر القطعة أفقياً في الظل للحفاظ على انسيابية القماش. في حال الكي، استخدم البخار من الداخل وتجنب ملامسة المكواة مباشرة لسطح التطريز أو الطباعة الخلفية.',
        },
        {
          id: 'origin',
          category: 'الأصالة والتصنيع',
          question: 'أين يتم تصميم وتصنيع وحياكة قطع لَهَب؟',
          answer:
            'صُممت قطع لَهَب بهندسة معمارية متقنة في قلب القاهرة، وتُحاك بالكامل من القطن المصري طويل التيلة 100%، المغزول خصيصاً في مصانع النسيج المصرية العريقة لإنتاج فرينش تيري بوزن 520 جرام وجيرسي ممشط بوزن 290 جرام. يتم تنفيذ التطريز الدقيق عالي الكثافة بأيدي أمهر الحرفيين المحليين.',
        },
        {
          id: 'sizing',
          category: 'المقاسات والاستبدال',
          question: 'كيف تختار مقاسك للقصة العريضة، وما هي سياسة الاستبدال؟',
          answer:
            'تتميز جميع قطعنا بقصة عريضة بأكتاف ساقطة تمنحك إطلالة أزياء الشارع الراقية (أوفر سايز). ننصح باختيار مقاسك المعتاد للحصول على القصة العريضة الأصلية، أو اختيار مقاس أصغر بدرجة لإطلالة أكثر انضباطاً. نوفر استبدالاً سهلاً وسريعاً للمقاس خلال 14 يوماً من الاستلام بشرط بقاء البطاقات الأمنية على القطعة.',
        },
      ],
    },
    footer: {
      brandDesc:
        'لَهَب. أزياء شارع معاصرة مصهورة في هندسة الخط، ألوان الليل الهادئة، وانضباط النسيج الثقيل.',
      navHeading: 'التنقل في الموقع',
      topLink: 'البداية // المقدمة',
      conceptLink: 'المفهوم والقصة',
      piecesLink: 'قطع الإصدار الأول',
      sizeLink: 'المقاسات والأقمشة',
      notifyHeading: 'إشعارات الإصدارات',
      notifyDesc:
        'المجموعة الأولى محدودة الكمية تمامًا. سجّل بريدك الإلكتروني للحصول على رموز الدخول المبكر.',
      emailPlaceholder: 'أدخل بريدك الإلكتروني...',
      joinBtn: 'تسجيل',
      joinedMsg: 'تم تسجيلك بنجاح في قائمة الإشعارات المبكرة للإصدار.',
      communityHeading: 'أرشيف المجتمع',
      copyright: 'لَهَب. جميع الحقوق محفوظة.',
      edition: 'الإصدار 1.0',
    },
  },
};
