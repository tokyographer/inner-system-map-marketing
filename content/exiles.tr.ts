/**
 * DRAFT, pending human review.
 * Exile theme content, Turkish. Warm, brief, no biography, no instruction to
 * go and meet the exile. "Sürgün (Exile)" on first use.
 */
import type { ExileKey } from "@/lib/scoring/types";
import type { ExileTheme } from "./exiles.en";

export const EXILE_SECTION_COPY_TR = {
  intro: "Bunlar eski yükler taşıyan genç parçalar: IFS'te onlara Sürgünler (Exiles) denir. Yük, onların kim olduğu değildir. IFS'te onlara doğrudan gitmeyiz: önce onları koruyan parçaların güvenini kazanırız. Bu, tek başına zorlanacak bir şey değil; bir kolaylaştırıcı ya da terapistle, tutulan bir alanda yapılacak bir çalışmadır.",
  hidden: "Yanıtların güçlü koruyucular ve yüzeye çıkan az sürgün duygusu gösteriyor. IFS'te bu genellikle korumanın işe yaradığı anlamına gelir; korunacak bir şey olmadığı değil. Burada peşine düşülecek bir şey yok. Koruyucuları tanımak, ne zaman ve eğer seçersen, içeri giden yoldur.",
};

export const EXILES_TR: Record<ExileKey, ExileTheme> = {
  SHAM: { key: "SHAM", name: "Yeterli değilim / Utanç", howItFeels: "Küçük başarısızlıklardan sonra çöküş, saklanma isteği, kusurlu olma hissi.", burdenBelief: "\"Bende bir şeyler yanlış.\"", whatItNeeds: "Olduğu gibi görülmek ve kabul edilmek." },
  ABAN: { key: "ABAN", name: "Terk edilmiş / Sevilmeye değmez", howItFeels: "Önem verdiğin biri geri çekildiğinde acı ya da panik, seçilmemiş hissetmek.", burdenBelief: "\"Beni bırakacaklar. Olduğum gibi sevilemem.\"", whatItNeeds: "Yanında kalınmak." },
  FEAR: { key: "FEAR", name: "Güvende değil / Korkmuş", howItFeels: "Korku dalgaları, küçük ve korkmuş bir his, tetikte bir beden.", burdenBelief: "\"Güvende değilim.\"", whatItNeeds: "Koruma ve yakında sakin bir varlık." },
  POWL: { key: "POWL", name: "Güçsüz / Görülmeyen", howItFeels: "Donmak, görünmez ya da kapana kısılmış hissetmek, sesin çıkmaması.", burdenBelief: "\"İstediklerimin önemi yok.\"", whatItNeeds: "Bir sesi olmak ve savunulmak." },
  LONE: { key: "LONE", name: "Yalnız / Yas tutan", howItFeels: "Eski bir hüzün, boşluk, hiç alınmamış bir şeye özlem.", burdenBelief: "\"Bununla yalnızım.\"", whatItNeeds: "Eşlik ve yas için yer." },
};
