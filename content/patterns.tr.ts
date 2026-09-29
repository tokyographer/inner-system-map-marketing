/**
 * DRAFT, pending human review.
 * Pattern, modifier, framing and care copy, Turkish. Part language only.
 */
import type { Band, ModifierKey, PatternKey, SelfBand } from "@/lib/scoring/types";

export const FRAMING_TR = "Bu, iç sisteminin şu anda nasıl düzenlendiğinin bir haritası; bir etiket değil. Parçalar sen değilsin. Gerçek bilgi, onları tanımaktan gelir.";
export const SELF_NOTE_TR = "IFS'te Self hiçbir zaman hasarlı ya da eksik değildir. Yalnızca, çok çalışmak zorunda kalmış parçalar tarafından az ya da çok gölgede bırakılmıştır.";
export const CARE_NOTE_TR = "Bu güçlü duygular uyandırdıysa, yavaşla ve güvendiğin birine ya da bir ruh sağlığı uzmanına ulaş. Bu araç profesyonel desteğin yerini tutmaz.";
export const DISCLAIMER_TR = "Bu, öz bildirime dayalı bir yansıtma aracıdır. Geçerliliği kanıtlanmış bir psikometrik araç değildir ve herhangi bir durumu değerlendirmez ya da tanımlamaz. Bantlar ve eşikler okulun sezgisel ölçütleridir, norm değildir.";

export const PATTERNS_TR: Record<PatternKey, { title: string; body: string }> = {
  SELF_LED: { title: "Self yönetiyor", body: "Şu anda yanıtların, Self enerjisinin çoğu zaman erişilebilir olduğunu ve hiçbir parça grubunun sistemi yönetmediğini gösteriyor. Parçalar hâlâ orada, bazıları etkin; ama geri çekilecek kadar sana güveniyor gibiler. İşler sakinken onları tanımak için iyi bir zaman." },
  FLOODED: { title: "Sürgün duyguları yüzeye çıkıyor", body: "Yanıtların, eski ve hassas duyguların şu sıralar sık sık, koruyucuların tutabildiğinden daha fazla yüzeye çıktığını gösteriyor. Bu hiçbir parçanın başarısızlığı değil. Genellikle bir şeyin duyulmak istediği anlamına gelir. Lütfen yavaş git ve bunun tek başına değil, tutulan bir alanda karşılanmasına izin ver." },
  REACTIVE: { title: "İtfaiyeciler (Firefighters) yönetiyor", body: "Yanıtların, hızlı hareket eden koruyucuların öne çıktığını gösteriyor: acı yüzeye çıkar çıkmaz onu söndürmek için hızla davranan parçalar. Çok çalışıyorlar ve yöntemleri pahalıya patlayabiliyor. Sorun onlar değil; altta yatan bir şeye verilen yanıtlar." },
  MANAGED: { title: "Yöneticiler (Managers) yönetiyor", body: "Yanıtların, önleyici koruyucuların günlük hayatı düzenlediğini gösteriyor: hassas yerlere hiç dokunulmasın diye planlayan, kontrol eden, memnun eden, denetleyen ya da mesafe koyan parçalar. Muhtemelen çok etkili oldular. Bedeli çoğu zaman çaba, katılık ve tam olarak yaşamıyor olma hissidir." },
  POLARISED: { title: "Yöneticiler ve İtfaiyeciler, ikisi de güçlü", body: "Yanıtların, aynı anda çok çalışan iki koruyucu grubu gösteriyor: bazıları her şeyi bir arada tutuyor, bazıları baskı fazla gelince kopup gidiyor. Böyle sistemler çoğu zaman bir halat çekme gibi hissettirir. İki taraf da yardım etmeye çalışıyor ve ikisi de merakı hak ediyor." },
  QUIET_OR_GUARDED: { title: "Sakin, ya da tetikte", body: "Yanıtların sistem genelinde düşük bir etkinlik gösteriyor ve Self enerjisi net biçimde erişilebilir görünmüyor. Bu sakin bir dönem anlamına gelebilir. Bir parçanın senin adına yanıt verip her şeyi uzakta tuttuğu anlamına da gelebilir. İkisi de olur. Hangisi olduğunu merak etmek isteyebilirsin." },
};

export const MODIFIERS_TR: Record<ModifierKey, string> = {
  HIDDEN_EXILES: "Güçlü koruyucuların yanında düşük sürgün puanları genellikle korumanın işe yaradığı anlamına gelir; korunacak bir şey olmadığı değil.",
  SELF_PRESENT: "Etkin parçaların yanında Self enerjisi de erişilebilir. Bu, onları tanımak için en iyi koşuldur.",
};

export const BAND_LABELS_TR: Record<Band, string> = { quiet: "sakin", present: "mevcut", veryActive: "çok etkin" };
export const SELF_BAND_LABELS_TR: Record<SelfBand, string> = { hardToReach: "şu anda ulaşması zor", availableAtTimes: "zaman zaman erişilebilir", oftenAvailable: "sıklıkla erişilebilir" };
export const GROUP_LABELS_TR = { managers: "Yöneticiler (Managers)", firefighters: "İtfaiyeciler (Firefighters)", mixed: "Karma rol", exiles: "Korunan ne", self: "Self" } as const;
export const PAIRING_SENTENCE_TR = (exileName: string) => `Yanıtlarında bu koruyucu, ${exileName} duygularıyla birlikte görünüyor. Onların başında nöbet tutuyor olabilir.`;
