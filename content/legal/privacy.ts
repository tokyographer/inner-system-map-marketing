/**
 * DRAFT, pending human review. PLACEHOLDER, requires legal review. Privacy notice and consent text per
 * locale, structured as sections so a lawyer can replace the wording without
 * touching layout. Sub-processors listed here must match README.
 */
import { WHATSAPP_INBOX_READY, WHATSAPP_RESULTS_READY, WHATSAPP_RETENTION_MONTHS, type Locale } from "@/config/app";

export interface LegalSection { heading: string; paragraphs: string[] }
export interface LegalPage { title: string; updated: string; notice: string; sections: LegalSection[] }

const WHATSAPP_ANY = WHATSAPP_RESULTS_READY || WHATSAPP_INBOX_READY;
const SUBPROCESSORS = `Vercel (hosting, Frankfurt), Neon (database and sign-in, Frankfurt), Resend (transactional email, EU), Upstash (rate limiting, EU)${WHATSAPP_ANY ? ", Meta Platforms (WhatsApp Cloud API, only if you use WhatsApp with us)" : ""}.`;

/** Shown only while the matching WhatsApp switch is on (config/app.ts), so the notice matches what the app does. */
const WHATSAPP: Record<Locale, { processing: string; inbox: string; transfer: string }> = {
  en: {
    processing: "WhatsApp (optional, public mode): if you give a WhatsApp number and tick the WhatsApp box, we also send your results PDF to that number through Meta's WhatsApp Cloud API, keep the number with your stored copy for 6 months, and include it in the institute's copy so the school can reply to you on WhatsApp. The deletion link removes the number with everything else.",
    inbox: `WhatsApp messages: if you write to the institute's WhatsApp number, we keep your messages, your WhatsApp profile name and our replies for ${WHATSAPP_RETENTION_MONTHS} months so the institute's administrators can answer you. Only administrators can read them, and every time they open them is recorded. Photos, voice notes and files are not downloaded or kept; we keep only their type and caption. To have the conversation deleted sooner, write to info@transcendentinstitute.com and an administrator deletes it.`,
    transfer: " Exception: when you use WhatsApp with us (results delivery or messages), Meta may process those messages, and any PDF, outside the EU.",
  },
  es: {
    processing: "WhatsApp (opcional, modo público): si das un número de WhatsApp y marcas la casilla de WhatsApp, también enviamos el PDF de tus resultados a ese número mediante la API de WhatsApp Cloud de Meta, guardamos el número con tu copia durante 6 meses y lo incluimos en la copia del instituto para que la escuela pueda responderte por WhatsApp. El enlace de eliminación borra el número junto con todo lo demás.",
    inbox: `Mensajes de WhatsApp: si escribes al número de WhatsApp del instituto, guardamos tus mensajes, tu nombre de perfil de WhatsApp y nuestras respuestas durante ${WHATSAPP_RETENTION_MONTHS} meses para que los administradores del instituto puedan responderte. Solo los administradores pueden leerlos, y cada vez que los abren queda registrado. No descargamos ni guardamos fotos, notas de voz ni archivos; solo su tipo y su descripción. Para borrar la conversación antes, escribe a info@transcendentinstitute.com y un administrador la elimina.`,
    transfer: " Excepción: cuando usas WhatsApp con nosotros (envío de resultados o mensajes), Meta puede tratar esos mensajes, y cualquier PDF, fuera de la UE.",
  },
  ro: {
    processing: "WhatsApp (opțional, modul public): dacă dai un număr de WhatsApp și bifezi căsuța WhatsApp, îți trimitem și PDF-ul cu rezultatele la acel număr prin WhatsApp Cloud API de la Meta, păstrăm numărul împreună cu copia ta timp de 6 luni și îl includem în copia institutului, ca școala să-ți poată răspunde pe WhatsApp. Linkul de ștergere elimină numărul împreună cu tot restul.",
    inbox: `Mesaje WhatsApp: dacă scrii la numărul de WhatsApp al institutului, păstrăm mesajele tale, numele tău de profil WhatsApp și răspunsurile noastre timp de ${WHATSAPP_RETENTION_MONTHS} luni, ca administratorii institutului să-ți poată răspunde. Doar administratorii le pot citi, iar fiecare deschidere este înregistrată. Fotografiile, mesajele vocale și fișierele nu sunt descărcate și nici păstrate; păstrăm doar tipul și descrierea lor. Pentru a șterge conversația mai devreme, scrie la info@transcendentinstitute.com și un administrator o șterge.`,
    transfer: " Excepție: când folosești WhatsApp cu noi (livrarea rezultatelor sau mesaje), Meta poate prelucra acele mesaje, și orice PDF, în afara UE.",
  },
  tr: {
    processing: "WhatsApp (isteğe bağlı, açık mod): bir WhatsApp numarası verir ve WhatsApp kutusunu işaretlersen sonuç PDF'ini Meta'nın WhatsApp Cloud API'si üzerinden bu numaraya da göndeririz, numarayı saklanan kopyanla birlikte 6 ay tutarız ve okulun sana WhatsApp'tan yanıt verebilmesi için enstitünün kopyasına ekleriz. Silme bağlantısı numarayı diğer her şeyle birlikte kaldırır.",
    inbox: `WhatsApp mesajları: enstitünün WhatsApp numarasına yazarsan, enstitü yöneticilerinin sana yanıt verebilmesi için mesajlarını, WhatsApp profil adını ve yanıtlarımızı ${WHATSAPP_RETENTION_MONTHS} ay saklarız. Bunları yalnızca yöneticiler okuyabilir ve her açılış kaydedilir. Fotoğraflar, sesli notlar ve dosyalar indirilmez ve saklanmaz; yalnızca türleri ve açıklamaları tutulur. Konuşmanın daha önce silinmesi için info@transcendentinstitute.com adresine yaz, bir yönetici siler.`,
    transfer: " İstisna: WhatsApp'ı bizimle kullandığında (sonuç gönderimi ya da mesajlar), Meta bu mesajları ve varsa PDF'i AB dışında işleyebilir.",
  },
};
const whatsappParagraphs = (l: Locale) => [...(WHATSAPP_RESULTS_READY ? [WHATSAPP[l].processing] : []), ...(WHATSAPP_INBOX_READY ? [WHATSAPP[l].inbox] : [])];
const whatsappTransfer = (l: Locale) => (WHATSAPP_ANY ? WHATSAPP[l].transfer : "");

export const PRIVACY: Record<Locale, LegalPage> = {
  en: {
    title: "Privacy notice", updated: "2026-09-29",
    notice: "PLACEHOLDER. This text has not been reviewed by a lawyer. It describes what the application actually does so that a professional can finalise the wording.",
    sections: [
      { heading: "Who we are", paragraphs: ["Transcendent Institute operates the Inner System Map. Contact: info@transcendentinstitute.com."] },
      { heading: "What we process and why", paragraphs: [
        "Public mode: your answers are scored in your browser. When you give your name and email at the start, we email you your results as a PDF, keep a copy of your name, email, answers and results for 6 months, and send a copy to Transcendent Institute so the school can follow up if you ask. Only the institute's administrators can see the stored copy, and every time they open it is recorded. This is based on your explicit consent, which you can withdraw at any time using the deletion link in the email.",
        ...whatsappParagraphs("en"),
        "Cohort mode: your answers, results and any notes you choose to share are stored under your account and are visible to the named facilitators of your cohort, to support your work in the retreat. This is based on your explicit consent, recorded with its date and policy version. You can export or delete everything at any time from your data page.",
        "Answers describe your inner life and may reveal information about mental health. We treat all of it as special category data.",
      ] },
      { heading: "What we do not collect", paragraphs: ["No date of birth, no IP addresses in our database, no analytics cookies. Logs record job outcomes only, never answers or email addresses."] },
      { heading: "Retention", paragraphs: ["Public results: 6 months, then deleted automatically. Cohort data: 12 months after the cohort end date unless the school sets otherwise, then deleted automatically. Account deletion removes everything immediately."] },
      { heading: "Where your data is", paragraphs: [`All data is stored and processed in the European Union. Sub-processors: ${SUBPROCESSORS}${whatsappTransfer("en")}`] },
      { heading: "Your rights", paragraphs: ["Access, rectification, erasure, restriction, portability and objection, and the right to withdraw consent. Write to info@transcendentinstitute.com or use the self-service export and deletion in the app. You may complain to your data protection authority."] },
      { heading: "Age", paragraphs: ["This tool is for adults. You confirm you are 18 or older before starting."] },
    ],
  },
  es: {
    title: "Aviso de privacidad", updated: "2026-09-29",
    notice: "PROVISIONAL. Este texto no ha sido revisado por un abogado. Describe lo que la aplicación hace realmente para que un profesional pueda fijar la redacción definitiva.",
    sections: [
      { heading: "Quiénes somos", paragraphs: ["Transcendent Institute opera el Mapa del Sistema Interno. Contacto: info@transcendentinstitute.com."] },
      { heading: "Qué tratamos y por qué", paragraphs: [
        "Modo público: tus respuestas se puntúan en tu navegador. Cuando das tu nombre y correo al inicio, te enviamos tus resultados en PDF, guardamos una copia de tu nombre, correo, respuestas y resultados durante 6 meses y enviamos una copia a Transcendent Institute para que la escuela pueda hacer seguimiento si lo pides. Solo los administradores del instituto pueden ver la copia guardada, y cada acceso queda registrado. La base es tu consentimiento explícito, que puedes retirar en cualquier momento con el enlace de eliminación del correo.",
        ...whatsappParagraphs("es"),
        "Modo cohorte: tus respuestas, resultados y las notas que decidas compartir se guardan bajo tu cuenta y son visibles para los facilitadores designados de tu cohorte, para acompañar tu trabajo en el retiro. La base es tu consentimiento explícito, registrado con fecha y versión de la política. Puedes exportar o eliminar todo en cualquier momento desde tu página de datos.",
        "Las respuestas describen tu vida interior y pueden revelar información sobre salud mental. Tratamos todo como datos de categoría especial.",
      ] },
      { heading: "Qué no recogemos", paragraphs: ["Ni fecha de nacimiento, ni direcciones IP en nuestra base de datos, ni cookies de analítica. Los registros guardan solo resultados de procesos, nunca respuestas ni correos."] },
      { heading: "Conservación", paragraphs: ["Resultados públicos: 6 meses y luego se eliminan automáticamente. Datos de cohorte: 12 meses tras la fecha de fin de la cohorte salvo que la escuela establezca otra cosa, y luego se eliminan automáticamente. Eliminar la cuenta borra todo de inmediato."] },
      { heading: "Dónde están tus datos", paragraphs: [`Todos los datos se almacenan y procesan en la Unión Europea. Encargados: ${SUBPROCESSORS}${whatsappTransfer("es")}`] },
      { heading: "Tus derechos", paragraphs: ["Acceso, rectificación, supresión, limitación, portabilidad y oposición, y el derecho a retirar el consentimiento. Escribe a info@transcendentinstitute.com o usa la exportación y eliminación en la app. Puedes reclamar ante tu autoridad de protección de datos."] },
      { heading: "Edad", paragraphs: ["Esta herramienta es para personas adultas. Confirmas que tienes 18 años o más antes de empezar."] },
    ],
  },
  ro: {
    title: "Notă de confidențialitate", updated: "2026-09-29",
    notice: "PROVIZORIU. Acest text nu a fost revizuit de un avocat. Descrie ce face efectiv aplicația, pentru ca un profesionist să poată finaliza formularea.",
    sections: [
      { heading: "Cine suntem", paragraphs: ["Transcendent Institute operează Harta Sistemului Interior. Contact: info@transcendentinstitute.com."] },
      { heading: "Ce prelucrăm și de ce", paragraphs: [
        "Modul public: răspunsurile tale sunt evaluate în browser. Când îți dai numele și emailul la început, îți trimitem rezultatele ca PDF, păstrăm o copie a numelui, emailului, răspunsurilor și rezultatelor tale timp de 6 luni și trimitem o copie la Transcendent Institute, ca școala să poată reveni dacă ceri. Doar administratorii institutului pot vedea copia păstrată, iar fiecare accesare este înregistrată. Temeiul este consimțământul tău explicit, pe care îl poți retrage oricând prin linkul de ștergere din email.",
        ...whatsappParagraphs("ro"),
        "Modul cohortă: răspunsurile, rezultatele și notele pe care alegi să le împărtășești sunt stocate în contul tău și sunt vizibile facilitatorilor desemnați ai cohortei tale, pentru a-ți sprijini munca în retreat. Temeiul este consimțământul tău explicit, înregistrat cu data și versiunea politicii. Poți exporta sau șterge totul oricând din pagina ta de date.",
        "Răspunsurile descriu viața ta interioară și pot dezvălui informații despre sănătatea mintală. Tratăm totul ca date din categorii speciale.",
      ] },
      { heading: "Ce nu colectăm", paragraphs: ["Fără data nașterii, fără adrese IP în baza noastră de date, fără cookie-uri de analiză. Jurnalele înregistrează doar rezultatele proceselor, niciodată răspunsuri sau adrese de email."] },
      { heading: "Păstrare", paragraphs: ["Rezultate publice: 6 luni, apoi șterse automat. Date de cohortă: 12 luni după data de încheiere a cohortei, dacă școala nu stabilește altfel, apoi șterse automat. Ștergerea contului elimină totul imediat."] },
      { heading: "Unde sunt datele tale", paragraphs: [`Toate datele sunt stocate și prelucrate în Uniunea Europeană. Împuterniciți: ${SUBPROCESSORS}${whatsappTransfer("ro")}`] },
      { heading: "Drepturile tale", paragraphs: ["Acces, rectificare, ștergere, restricționare, portabilitate și opoziție, precum și dreptul de a retrage consimțământul. Scrie la info@transcendentinstitute.com sau folosește exportul și ștergerea din aplicație. Poți depune o plângere la autoritatea ta de protecție a datelor."] },
      { heading: "Vârstă", paragraphs: ["Acest instrument este pentru adulți. Confirmi că ai 18 ani sau mai mult înainte de a începe."] },
    ],
  },
  tr: {
    title: "Gizlilik bildirimi", updated: "2026-09-29",
    notice: "GEÇİCİ. Bu metin bir avukat tarafından incelenmemiştir. Bir uzmanın nihai ifadeyi belirleyebilmesi için uygulamanın gerçekte ne yaptığını açıklar.",
    sections: [
      { heading: "Biz kimiz", paragraphs: ["İç Sistem Haritası'nı Transcendent Institute işletir. İletişim: info@transcendentinstitute.com."] },
      { heading: "Neyi, neden işliyoruz", paragraphs: [
        "Açık mod: yanıtların tarayıcında puanlanır. Başta adını ve e-postanı verdiğinde sonuçlarını PDF olarak gönderir, adının, e-postanın, yanıtlarının ve sonuçlarının bir kopyasını 6 ay saklar ve istersen okulun sana ulaşabilmesi için bir kopyasını Transcendent Institute'e göndeririz. Saklanan kopyayı yalnızca enstitünün yöneticileri görebilir ve her erişim kaydedilir. Dayanak, e-postadaki silme bağlantısıyla istediğin zaman geri çekebileceğin açık rızandır.",
        ...whatsappParagraphs("tr"),
        "Grup modu: yanıtların, sonuçların ve paylaşmayı seçtiğin notlar hesabının altında saklanır ve inziva çalışmanı desteklemek için grubunun belirlenmiş kolaylaştırıcılarına görünür. Dayanak, tarih ve politika sürümüyle kaydedilen açık rızandır. Veri sayfandan istediğin zaman her şeyi dışa aktarabilir ya da silebilirsin.",
        "Yanıtlar iç hayatını anlatır ve ruh sağlığına ilişkin bilgi açığa çıkarabilir. Hepsini özel nitelikli veri olarak ele alırız.",
      ] },
      { heading: "Neyi toplamıyoruz", paragraphs: ["Doğum tarihi yok, veritabanımızda IP adresi yok, analitik çerez yok. Günlükler yalnızca işlem sonuçlarını kaydeder; yanıtları ya da e-posta adreslerini asla."] },
      { heading: "Saklama", paragraphs: ["Açık sonuçlar: 6 ay, sonra otomatik silinir. Grup verileri: okul aksini belirlemedikçe grup bitiş tarihinden 12 ay sonra otomatik silinir. Hesabın silinmesi her şeyi anında kaldırır."] },
      { heading: "Verilerin nerede", paragraphs: [`Tüm veriler Avrupa Birliği'nde saklanır ve işlenir. Alt işleyiciler: ${SUBPROCESSORS}${whatsappTransfer("tr")}`] },
      { heading: "Hakların", paragraphs: ["Erişim, düzeltme, silme, kısıtlama, taşınabilirlik ve itiraz ile rızayı geri çekme hakkı. info@transcendentinstitute.com adresine yaz ya da uygulamadaki dışa aktarma ve silmeyi kullan. Veri koruma otoritene şikâyette bulunabilirsin."] },
      { heading: "Yaş", paragraphs: ["Bu araç yetişkinler içindir. Başlamadan önce 18 yaşında ya da daha büyük olduğunu onaylarsın."] },
    ],
  },
};
