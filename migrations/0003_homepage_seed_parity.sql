-- Migration 0003: keep already-migrated Phase 1 databases aligned with the
-- exact legacy storefront copy before enabling the Phase 2 runtime renderer.

UPDATE page_revisions
SET document_json = json_set(
  document_json,
  '$.sections[2].content.visualLabel.ar', 'HERITAGE ARCHITECTURAL CUTS',
  '$.sections[2].content.materialTags[0].ar', '520 GSM FLEECE',
  '$.sections[2].content.materialTags[1].ar', 'GIZA 86 COTTON',
  '$.sections[8].content.demoSerials', json('["LHB-01-018/200","LHB-01-042/200","LHB-01-084/200"]'),
  '$.sections[9].content.description.en', 'Classified early look at our upcoming dawn silhouette capsule. Unlock the blueprints with your VIP pass or register for early allocation privileges.',
  '$.sections[9].content.description.ar', 'معاينة سرية وحصرية للقطع المعمارية القادمة من علامة لَهَب. أدخل رمز VIP الخاص بك أو سجل بياناتك لفتح المخططات.',
  '$.sections[10].content.items[0].answer.en', 'All Drop 01 orders are dispatched via dedicated express courier across Cairo, Giza, Alexandria, and all Egyptian governorates within 24 to 48 hours. We operate with Cash on Delivery (COD) and explicitly welcome physical garment inspection prior to acceptance, ensuring you can verify the heavyweight fleece density and gold embroidery threadwork firsthand.',
  '$.sections[10].content.items[0].answer.ar', 'يتم شحن جميع طلبات الإصدار الأول عبر مندوب شحن سريع وموثوق إلى القاهرة والجيزة والإسكندرية وجميع محافظات مصر خلال 24 إلى 48 ساعة. نوفر خدمة الدفع عند الاستلام (نقداً أو بالبطاقة) مع ميزة فحص ومعاينة القطعة وخامتها الفاخرة بالكامل قبل الدفع والاستلام لضمان ثقتك التامة.',
  '$.sections[10].content.items[1].question.ar', 'ما هي تعليمات الغسيل المثالية للحفاظ على هودي 520 جرام والتي شيرت؟',
  '$.sections[10].content.items[1].answer.en', 'To preserve the architectural form, deep night-navy reactive dye, and high-density matte gold embroidery: wash inside out on a gentle cold cycle (30°C max) with mild detergent. Do not tumble dry—lay flat to dry in shade to maintain the boxy drape. If ironing is needed, steam lightly on the reverse side; never iron directly over the embroidery or back flame calligraphy.',
  '$.sections[10].content.items[1].answer.ar', 'للحفاظ على قوام القطعة المعماري، ولون الكحلي الليلي الغني، وخيوط التطريز الذهبي: يُفضل غسل القطعة مقلوبة بالماء البارد (30 درجة مئوية كحد أقصى) مع منظف معتدل. تجنب التجفيف الآلي، وانشر القطعة أفقياً في الظل للحفاظ على انسيابية القماش. في حال الكي، استخدم البخار من الداخل وتجنب ملامسة المكواة مباشرة لسطح التطريز أو الطباعة الخلفية.',
  '$.sections[10].content.items[2].answer.en', 'Every LAHAB piece is conceived and architecturally patterned in Cairo. Our garments are crafted from 100% premium long-staple Egyptian cotton, custom-knitted into high-density 520 GSM French Terry fleece and 290 GSM combed jersey in historic Egyptian textile mills. Precision multi-head embroidery and archival screenprinting are executed locally with master artisans.',
  '$.sections[10].content.items[2].answer.ar', 'صُممت قطع لَهَب بهندسة معمارية متقنة في قلب القاهرة، وتُحاك بالكامل من القطن المصري طويل التيلة 100%، المغزول خصيصاً في مصانع النسيج المصرية العريقة لإنتاج فرينش تيري بوزن 520 جرام وجيرسي ممشط بوزن 290 جرام. يتم تنفيذ التطريز الدقيق عالي الكثافة بأيدي أمهر الحرفيين المحليين.',
  '$.sections[10].content.items[3].answer.en', 'LAHAB garments are engineered with an intentional boxy drop-shoulder silhouette featuring 4–6 cm of ease. We advise selecting your standard size for the intended relaxed streetwear drape, or sizing down one size for a more tailored profile. If you require a size swap, we offer a complimentary 14-day exchange on unworn pieces with security tags intact.',
  '$.sections[10].content.items[3].answer.ar', 'تتميز جميع قطعنا بقصة عريضة بأكتاف ساقطة تمنحك إطلالة أزياء الشارع الراقية (أوفر سايز). ننصح باختيار مقاسك المعتاد للحصول على القصة العريضة الأصلية، أو اختيار مقاس أصغر بدرجة لإطلالة أكثر انضباطاً. نوفر استبدالاً سهلاً وسريعاً للمقاس خلال 14 يوماً من الاستلام بشرط بقاء البطاقات الأمنية على القطعة.'
)
WHERE id = 'homepage-v1' AND page_id = 'homepage';

