/**
 * DRAFT, pending human review.
 * Item bank v2, Romanian, natural spoken register. Keyed by stable item ID.
 * Exile items kept soft, first person, non-clinical.
 */
export const ITEM_TEXT_RO: Record<string, string> = {
  SELF1: "Când ceva mă tulbură, reușesc să-mi regăsesc calmul.",
  SELF2: "Pot fi curios/curioasă față de reacțiile mele în loc să le judec.",
  SELF3: "Pot simți compasiune pentru laturile mele care nu-mi plac.",
  SELF4: "Chiar și sub presiune, văd limpede ce contează.",
  SELF5: "Pot rămâne cu o emoție dificilă fără să fiu copleșit/ă de ea.",
  SELF6: "Când două laturi ale mele trag în direcții diferite, le pot asculta pe amândouă.",
  SELF7: "Am încredere că pot face față la ce îmi aduce viața.",
  SELF8: "Mă simt conectat/ă cu ceilalți oameni și cu viața.",

  PERF1: "Verific sau refac lucruri care sunt deja suficient de bune.",
  PERF2: "Țin lucrurile pentru mine pentru că nu mi se par încă gata.",
  PERF3: "Îmi impun standarde pe care nu le-aș cere nimănui altcuiva.",
  PERF4: "Îmi vine greu să mă bucur de un rezultat pentru că văd ce putea fi mai bine.",

  CRIT1: "O voce interioară îmi arată defectele înainte s-o facă altcineva.",
  CRIT2: "Când primesc feedback, sunt mai dur/ă cu mine decât a fost cealaltă persoană.",
  CRIT3: "Când mă simt expus/ă sau rănit/ă, devin dur/ă, cu mine sau cu cealaltă persoană.",
  CRIT4: "Observ repede greșelile altora și îmi e greu să trec peste ele.",

  PLEA1: "Spun da când vreau să spun nu.",
  PLEA2: "Îmi îndulcesc sau îmi schimb părerea ca să evit un dezacord.",
  PLEA3: "Când cineva e nemulțumit de mine, nu am liniște până nu repar situația.",
  PLEA4: "În fața figurilor de autoritate devin mai conciliant/ă decât sunt de fapt.",

  CTRL1: "Schimbările de plan din ultimul moment mă tulbură mai mult decât pe alții.",
  CTRL2: "Trec dinainte prin scenarii posibile pentru că nu suport să fiu luat/ă prin surprindere.",
  CTRL3: "Îmi e greu să deleg, pentru că nu va fi făcut cum trebuie.",
  CTRL4: "Am nevoie de structură și reguli clare ca să mă pot relaxa.",

  INTL1: "Când o conversație devine emoțională, încep să explic sau să analizez.",
  INTL2: "Pot descrie ce simt mult mai bine decât pot simți efectiv.",
  INTL3: "Am nevoie să înțeleg de ce simt ceva înainte să-mi permit să simt.",
  INTL4: "Oamenii apropiați spun că trăiesc în mintea mea.",

  AVOI1: "Evit să încep lucrurile care contează cel mai mult pentru mine, pentru că s-ar putea să nu iasă bine.",
  AVOI2: "Când o decizie importantă mă așteaptă, mă țin ocupat/ă cu altceva în loc să o iau.",
  AVOI3: "Evit situațiile în care îmi va fi evaluată performanța.",
  AVOI4: "Încep doar când termenul-limită nu-mi mai lasă de ales.",

  CARE1: "Observ nevoile celorlalți înaintea nevoilor mele.",
  CARE2: "Mă simt vinovat/ă sau egoist/ă când mă pun pe mine pe primul loc.",
  CARE3: "Când cineva suferă, simt că e datoria mea să rezolv.",
  CARE4: "Oamenii îmi aduc problemele lor, iar eu rareori le aduc pe ale mele.",

  HYPV1: "Când cineva nu răspunde, încep să-mi imaginez ce a mers prost.",
  HYPV2: "Scanez oamenii și situațiile după semne că ceva nu e în regulă.",
  HYPV3: "Mintea mea se duce la cel mai rău scenariu.",
  HYPV4: "Verific lucrurile de mai multe ori sau caut să fiu liniștit/ă.",

  DIST1: "Când o relație devine foarte apropiată, simt nevoia să mă retrag.",
  DIST2: "Îmi minimalizez nevoile, față de mine și față de ceilalți.",
  DIST3: "Să primesc grijă sau ajutor mă face să mă simt inconfortabil.",
  DIST4: "Îmi spun că, de fapt, nu am nevoie de nimeni.",

  NUMB1: "După un moment greu, mă refugiez în ecrane, mâncare, un pahar sau altceva care mă deconectează.",
  NUMB2: "Îmi liniștesc emoțiile dificile cu ceva rapid, chiar dacă știu că mă va costa mai târziu.",
  NUMB3: "Odată ce încep (să derulez, să mănânc, să beau, să muncesc), îmi e greu să mă opresc.",
  NUMB4: "Mă țin ocupat/ă ca să nu fiu nevoit/ă să simt.",

  DISS1: "Când apar emoții dureroase, mă golesc sau rămân fără nicio reacție.",
  DISS2: "În situații tensionate mă simt departe, ca și cum aș privi din afară.",
  DISS3: "Mintea mi se încețoșează când o conversație atinge ceva dureros.",
  DISS4: "Îmi dau seama că am fost ore întregi pe pilot automat.",

  ANGR1: "Când mă simt desconsiderat/ă sau umilit/ă, reacționez rapid și cu forță.",
  ANGR2: "Furia îmi vine înainte să am timp să gândesc.",
  ANGR3: "Folosesc sarcasmul sau ridic vocea ca să închei o conversație.",
  ANGR4: "Când cineva îmi încalcă limitele, trec la atac.",

  IMPL1: "Când presiunea crește, iau decizii bruște doar ca să scap (demisionez, plec, pun capăt).",
  IMPL2: "Când mă simt rău, cheltuiesc bani sau îmi asum riscuri din impuls.",
  IMPL3: "Fac lucruri la cald pe care apoi nu le pot explica.",
  IMPL4: "Când mă simt prins/ă în capcană, îmi vine să las totul și să fug.",

  REBL1: "Când mi se spune ce să fac, simt imediat un „nu” în interior.",
  REBL2: "Mă opun chiar și sugestiilor bune dacă le simt ca presiune.",
  REBL3: "Regulile care îmi sunt impuse îmi dau chef să le încalc.",
  REBL4: "Când mi se cere ceva, pur și simplu nu fac, în tăcere.",

  SHAM1: "Un eșec mic mă poate face să mă simt fără valoare.",
  SHAM2: "Sunt momente în care simt că ceva e fundamental în neregulă cu mine.",
  SHAM3: "În adâncul meu mă îndoiesc că sunt de ajuns.",
  SHAM4: "Mi-e rușine de cine sunt, nu doar de ce am făcut.",

  ABAN1: "Când cineva la care țin se îndepărtează, simt o durere care pare mai mare decât situația.",
  ABAN2: "Mi-e teamă că oamenii vor pleca odată ce mă vor cunoaște cu adevărat.",
  ABAN3: "În adâncul meu mă îndoiesc că pot fi iubit/ă așa cum sunt.",
  ABAN4: "Mă simt cel/cea lăsat/ă pe dinafară sau neales/ă.",

  FEAR1: "Am valuri de frică fără un motiv clar în prezent.",
  FEAR2: "Dintr-odată mă simt mic/ă și speriat/ă, ca un copil.",
  FEAR3: "Corpul meu reacționează ca și cum aș fi în pericol când nu se întâmplă nimic.",
  FEAR4: "O parte din mine simte că lumea nu e un loc sigur.",

  POWL1: "Simt că ce vreau sau ce spun nu schimbă nimic.",
  POWL2: "În unele situații îngheț și nu pot să mă apăr.",
  POWL3: "Mă simt invizibil/ă, ca și cum nevoile mele n-ar conta.",
  POWL4: "Mă simt prins/ă în capcană, fără nicio cale de a schimba lucrurile.",

  LONE1: "Simt o singurătate adâncă chiar și când sunt cu oameni.",
  LONE2: "Mă cuprinde o tristețe care pare mai veche decât viața mea de acum.",
  LONE3: "Port în mine dorul după ceva ce n-am primit niciodată.",
  LONE4: "Simt un gol înăuntru pe care nimic nu-l umple pe deplin.",
};
