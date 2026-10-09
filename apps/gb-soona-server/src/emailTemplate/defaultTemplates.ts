// Modele d'usine utilise tant que l'administrateur n'a pas enregistre sa
// propre version depuis les parametres. Reprend le texte qui etait
// auparavant code en dur cote frontend (DocsRequestSheet).
export const docRequestDefaultTemplate = {
  objet: "Pièces justificatives",
  corps:
    "<p class='py-2' dir='ltr'>" +
    "<span style='white-space: pre-wrap;'>Assalamo Aleikoum [Nom]</span></p>" +
    "<p class='py-2' dir='ltr' style='text-align: start;'>" +
    "<span style='white-space: pre-wrap;'>" +
    "&nbsp;Je vous remercie de m'envoyer les documents suivants afin d’étudier votre demande :</span></p>" +
    "<ul class='list-disc list-inside'>" +
    "<li value='1' class='ml-4' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>Carte identité ou passeport,</span></li>" +
    "<li value='2' class='ml-4' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>Justificatif de domicile</span></li>" +
    "<li value='3' class='ml-4' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>justificatifs de dettes</span></li>" +
    "<li value='4' class='ml-4' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>Attestation de la caf</span></li>" +
    "<li value='5' class='ml-4' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>justificatifs de revenus &nbsp;</span></li>" +
    "<li value='6' class='ml-4' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>Factures (EDF, assurance, téléphone, …)</span></li>" +
    "<li value='7' class='ml-4' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>RIB</span></li>" +
    "</ul>" +
    "<p class='py-2' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>" +
    "&nbsp;Ainsi que tous les justificatifs, que vous jugez utiles de nous communiquer afin de procéder à l’étude de votre dossier.</span></p>" +
    "<p class='py-2' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>Je reste à votre disposition.</span></p>" +
    "<p class='py-2' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>Bien cordialement.</span></p>" +
    "<p class='py-2' dir='ltr' style='text-align: start;'><span style='white-space: pre-wrap;'>AB SOO’NA</span></p>" +
    "<p class='py-2' dir='rtl' style='text-align: start;'>السلام عليكم ورحمة الله وبركاته،</p>" +
    "<p class='py-2' dir='rtl' style='text-align: start;'>" +
    "نشكر تواصلكم معنا، ونرجو منكم إرسال الوثائق التالية حتى نتمكن من دراسة طلبكم:</p>" +
    "<ul class='list-disc list-inside' dir='rtl' style='text-align: right;'>" +
    "<li>نسخة من بطاقة الهوية أو جواز السفر</li>" +
    "<li>إثبات السكن (مثل فاتورة كهرباء أو عقد إيجار)</li>" +
    "<li>مستندات تثبت وجود ديون (إن وُجدت)</li>" +
    "<li>شهادة من صندوق إعانات الأسرة (CAF)</li>" +
    "<li>مستندات تثبت مصادر الدخل (كشوف رواتب، RSA، ...إلخ)</li>" +
    "<li>فواتير (كهرباء، تأمين، هاتف...)</li>" +
    "<li>رقم الحساب البنكي (RIB)</li>" +
    "</ul>" +
    "<p class='py-2' dir='rtl' style='text-align: start;'>" +
    "كما نرجو منكم إرسال أي مستندات إضافية ترون أنها قد تفيد في دراسة ملفكم.</p>" +
    "<p class='py-2' dir='rtl' style='text-align: start;'>نحن رهن إشارتكم لأي استفسار.</p>" +
    "<p class='py-2' dir='rtl' style='text-align: start;'>مع خالص التحيات،</p>" +
    "<p class='py-2' dir='rtl' style='text-align: start;'>AB SOO’NA</p>" +
    "<p>[bouton_justificatif]</p>",
};
