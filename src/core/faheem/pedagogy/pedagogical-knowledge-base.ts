/**
 * Qarayti.ai — Moroccan Master Teacher Pedagogical Knowledge Base
 * Generates progressive, intuitive, and exam-aligned interactive responses following the Master Moroccan Teacher Pedagogy.
 * "أستاذ خصوصي مغربي ذكي وصبور، كيجلس مع التلميذ وكيشرح ليه تدريجياً حتى كيفهم"
 */

import { EducationLanguage } from '../../../domain/types/education.types';
import { MasterTeacherPedagogy } from './pedagogical-policy';

export class PedagogicalKnowledgeBase {
  public static generateMasterTeacherResponse(
    query: string,
    systemInstruction: string,
    preferredLang: EducationLanguage
  ): string {
    const intent = MasterTeacherPedagogy.detectIntent(query, preferredLang);
    const qLower = query.toLowerCase();

    // 1. "ما فهمتش" / "ما عرفتش" / Confusion Recovery (Change Representation / Simpler Hint)
    if (
      intent.type === 'CONFUSION_RECOVERY' ||
      qLower.includes('ما عرفت') ||
      qLower.includes('ماعرفتش') ||
      qLower.includes('ما عرفتش') ||
      qLower.includes('ما فهمتش') ||
      qLower.includes('مافهمتش') ||
      qLower.includes('je ne sais pas') ||
      qLower.includes('pas compris') ||
      qLower.includes('comprends pas')
    ) {
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Ce n'est pas grave du tout ! Simplifions avec un exemple concret 💡 :

Imaginez deux nombres dont le produit est égal à 6. Quelles sont les possibilités ?
Par exemple :
$1 \\times 6 = 6$ ou $2 \\times 3 = 6$.

**Lequel de ces deux couples a une somme égale à 5 ?**`;
      }

      if (preferredLang === EducationLanguage.ARABIC) {
        return `لا بأس على الإطلاق! دعنا نبسط المسألة أكثر 💡:

تخيل معي عددين حاصل ضربهما يساوي 6، ما هي الاحتمالات الممكنة؟
مثلاً:
$1 \\times 6 = 6$ أو $2 \\times 3 = 6$.

**أي من هذين الزوجين مجموعهما يساوي 5؟**`;
      }

      if (qLower.includes('ما عرف') || qLower.includes('ماعرف') || qLower.includes('ما فهم') || qLower.includes('مافهم')) {
        return `ماشي مشكل نهائياً! خلينا نبسطوها أكثر 💡:

تخيل معايا عندك عددين الضرب ديالهم كيساوي 6، شنو هما الاحتمالات الممكنة؟
مثلاً:
$1 \\times 6 = 6$ أو $2 \\times 3 = 6$.

أما زوج من هادو المجموع ديالهم كيساوي 5؟`;
      }

      return `ماشي مشكل نهائياً! خلينا نبدلو الطريقة ونشوفوها بمثال ملموس من الواقع 💡:

تخيل معايا عندك ميزان بكفتين متوازنتين تماماً:
- في الكفة الأولى: عندك صندوق مجهول فيه $x$ دراهم وزدنا حداه **3 دراهم**.
- في الكفة الثانية: عندك **7 دراهم**.
والميزان متوازن ومقاد:
$$x + 3 = 7$$

باش نعرفو شحال كاين فهاد الصندوق $x$ بوحدو، شنو خاصنا نحيدو من الكفتين بجوج باش يبقى الميزان مقاد ومتوازن؟`;
    }

    // 2. Delta Intuition / "علاش كنستعملو دلتا" / "علاش دلتا" / "ما فهمتش دلتا"
    if (intent.type === 'CONCEPT_CONFUSION' && intent.subtopic === 'DELTA_INTUITION') {
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Excellente question 👏 ! Avant d'apprendre la formule $\\Delta = b^2 - 4ac$, comprenons le problème fondamental que résout le discriminant :

Pour une équation simple comme $x^2 - 5x + 6 = 0$, nous trouvons les racines facilement par factorisation.

Mais pour une équation générale comme :
$$2x^2 + 7x - 3 = 0$$

Il est très difficile de factoriser à vue d'œil. Avant de perdre du temps en calculs, nous voulons savoir :
**Existe-t-il 2 solutions, 1 solution double, ou aucune solution dans $\\mathbb{R}$ ?**

C'est exactement le rôle du **discriminant $\\Delta$ (Le Discriminant)**.
Comprenez-vous pourquoi cette méthode générale est indispensable avant de calculer les racines ?`;
      }

      if (preferredLang === EducationLanguage.ARABIC) {
        return `سؤال ممتاز 👏.. قبل أن نحفظ $\\Delta = b^2 - 4ac$، دعنا نفهم المشكلة التي يحلها المميز أصلاً:

عندما تكون لدينا معادلة بسيطة مثل $x^2 - 5x + 6 = 0$، يمكننا إيجاد الحلين بالتفكيك المباشر.

ولكن إذا كانت المعادلة مثل:
$$2x^2 + 7x - 3 = 0$$

يصعب تفكيكها بالعين المجردة، ونريد أن نعرف قبل أن نضيع الوقت في الحساب:
**هل يوجد حلان، أم حل واحد، أم لا يوجد أي حل حقيقي في $\\mathbb{R}$؟**

هنا يأتي دور **المميز $\\Delta$ (Le Discriminant)** الذي يميز لنا عدد الحلول دون تضييع الوقت.
هل اتضحت لك الآن الغاية من استخدام المميز دلتا؟`;
      }

      return `سؤال ممتاز 👏.. قبل ما نحفظو $\\Delta = b^2 - 4ac$، خلينا نفهمو المشكل اللي كتحلو دلتا أصلاً:

ملي كتكون عندنا معادلة ساهلة بحال $x^2 - 5x + 6 = 0$، كنقدرو نلقاو الحلين بالتفكيك بالعين المجردة.

ولكن إلى عطيناك معادلة بحال:
$$2x^2 + 7x - 3 = 0$$

هنا صعيب بزاف نفككوها بالعين، وبغينا نعرفو قبل ما نضيعو الوقت فالحساب:
واش أصلاً كاينين جوج حلول، ولا حل واحد، ولا ما كاين حتى حل حقيقي في $\\mathbb{R}$!

هنا كيجي دور **المميز $\\Delta$ (Le Discriminant)** اللي كيميز لينا شحال من حل كاين بلا ما نضيعو الوقت.

واش بان ليك دابا علاش احتاجينا طريقة عامة بحال دلتا؟`;
    }

    // 3. Inequality Sign Flip / "علاش كنقلبو الإشارة فالمتراجحة"
    if (intent.type === 'CONCEPT_CONFUSION' && intent.subtopic === 'SIGN_FLIP_INTUITION') {
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Voyons cela avec des nombres simples avant de mémoriser la règle ! 💡

Nous savons tous que :
$$2 < 5$$

Maintenant, si nous multiplions les deux membres par $(-1)$ :
- Le premier membre devient : $-2$
- Le second membre devient : $-5$

Petite question de réflexion :
**Sur la droite graduée, lequel est le plus grand : $-2$ ou $-5$ ?**`;
      }

      if (preferredLang === EducationLanguage.ARABIC) {
        return `تأمل معي هذا المثال البسيط بالأرقام قبل حفظ أي قاعدة! 💡

نعلم جميعاً أن:
$$2 < 5$$

الآن، إذا ضربنا الطرفين في العدد السالب $(-1)$:
- يصبح الطرف الأول: $-2$
- ويصبح الطرف الثاني: $-5$

سؤال بسيط للتفكير:
**على مستقيم الأعداد، أيهما أكبر الآن: $-2$ أم $-5$؟**`;
      }

      return `خلينا نشوفوها بالأرقام البسيطة قبل ما نحفظو أي قاعدة! 💡

كلنا كنعرفو أن:
$$2 < 5$$

دابا، إلا ضربنا الطرفين بجوج في العدد السالب $(-1)$:
- الطرف الأول كيولي: $-2$
- والطرف الثاني كيولي: $-5$

سؤال صغير ليك فكر فيه:
**على مستقيم الأعداد، شكون اللي كبر دابا؟ واش $-2$ ولا $-5$؟**`;
    }

    // 4. Student Attempt Evaluation (Interactive Feedback & Progressive Advance)
    if (intent.type === 'STUDENT_ATTEMPT') {
      const attempt = (intent.studentAttemptValue || '').toLowerCase();

      // Case A: Factorization numbers attempt "2 و 3" / "2 et 3"
      if (attempt.includes('2 و 3') || attempt.includes('2 et 3') || (attempt.includes('2') && attempt.includes('3') && !attempt.includes('4'))) {
        if (preferredLang === EducationLanguage.FRENCH) {
          return `Exactement 👌 ce sont 2 et 3 !

Car :
$$2 \\times 3 = 6 \\quad \\text{et} \\quad 2 + 3 = 5$$

Nous pouvons donc écrire l'équation sous forme de produit :
$$(x - 2)(x - 3) = 0$$

Question étape par étape :
**Si le produit de deux facteurs est nul, que peut-on déduire pour $(x - 2)$ ou $(x - 3)$ ?**`;
        }

        if (preferredLang === EducationLanguage.ARABIC) {
          return `بالضبط 👌 هما 2 و 3!

لأن:
$$2 \\times 3 = 6 \\quad \\text{و} \\quad 2 + 3 = 5$$

وبالتالي يمكننا كتابة المعادلة على شكل جداء:
$$(x - 2)(x - 3) = 0$$

سؤال خطوة بخطوة:
**إذا كان حاصل ضرب عاملين يساوي $0$، فماذا نستنتج بالنسبة لـ $(x - 2)$ أو $(x - 3)$؟**`;
        }

        return `بالضبط 👌 هما 2 و 3!

حيت:
$$2 \\times 3 = 6 \\quad \\text{و} \\quad 2 + 3 = 5$$

ودابا شفنا علاش المعادلة كنقدرو نكتبوها على شكل جداء:
$$(x - 2)(x - 3) = 0$$

دابا سؤال خطوة بخطوة ليك:
**إلى كان حاصل ضرب قوسين كيساوي $0$، شنو كيعني هادشي بالنسبة لـ $(x - 2)$ أو $(x - 3)$؟**`;
      }

      // Case A2: Product equals zero step: "واحد فيهم كيساوي 0" or "x=2 أو x=3" or "x-2=0"
      if (
        attempt.includes('كيساوي 0') ||
        attempt.includes('يساوي 0') ||
        attempt.includes('=0') ||
        attempt.includes('= 0') ||
        attempt.includes('x-2') ||
        attempt.includes('x-3') ||
        attempt.includes('x = 2') ||
        attempt.includes('x=2') ||
        attempt.includes('x = 3') ||
        attempt.includes('x=3')
      ) {
        if (preferredLang === EducationLanguage.FRENCH) {
          return `Bravo 👏 ! Exactement :
$$(x - 2) = 0 \\quad \\text{ou} \\quad (x - 3) = 0$$
Ce qui nous donne les deux solutions :
$$x = 2 \\quad \\text{ou} \\quad x = 3$$

---

### Vous avez compris l'idée fondamentale !
Mais imaginez une équation complexe comme :
$$2x^2 + 7x - 3 = 0$$

C'est ici qu'intervient **le discriminant $\\Delta$**, qui est l'outil universel :
$$\\Delta = b^2 - 4ac$$

Voulez-vous que nous déterminions ensemble les coefficients $a$, $b$ et $c$ de cette nouvelle équation ?`;
        }

        return `تبارك الله عليك 👏! بالضبط:
$$(x - 2) = 0 \\quad \\text{أو} \\quad (x - 3) = 0$$
وهذا كيعطينا الحلين:
$$x = 2 \\quad \\text{أو} \\quad x = 3$$

---

### دابا فهمتي الفكرة الأساسية!
لكن تخيل لو كانت المعادلة معقدة ومكتفككش بالعين بحال:
$$2x^2 + 7x - 3 = 0$$

هنا كيجي دور **المميز $\\Delta$ (Delta)** اللي هو أداة عامة كتحسب:
$$\\Delta = b^2 - 4ac$$

واش بغيتي نجربو نحددو المعاملات $a$ و $b$ و $c$ فهاد المعادلة الجديدة مع بعضنا؟`;
      }

      // Case B: Incorrect numbers for factorization (e.g. "2 و 4" / "2 et 4")
      if (attempt.includes('2 و 4') || attempt.includes('2 et 4') || (attempt.includes('2') && attempt.includes('4'))) {
        if (preferredLang === EducationLanguage.FRENCH) {
          return `C'est proche 👍 mais vérifions ensemble :

$2 \\times 4 = 8$, or nous cherchons un produit égal à 6 !
**Essayez de trouver deux autres nombres dont le produit vaut 6 et la somme vaut 5.**`;
        }

        if (preferredLang === EducationLanguage.ARABIC) {
          return `محاولة قريبة 👍 ولكن دعنا نتحقق معاً:

$2 \\times 4 = 8$، بينما نبحث عن حاصل ضرب يساوي 6 ومجموع يساوي 5!
**حاول التفكير في عددين آخرين حاصل ضربهما 6 ومجموعهما 5.**`;
        }

        return `قريب 👍 ولكن خلينا نتحققو مع بعضنا:

$2 \\times 4 = 8$، واش حنا بغينا 8 ولا 6؟
جرب تفكر فعددين آخرين الضرب ديالهم كيعطي 6 ومجموعهم 5.`;
      }

      // Case C: Inequality answer (e.g. "-2 > -5" or ">" or "تقلب" or "x > -4")
      if (
        attempt.includes('-2') ||
        attempt.includes('تقلب') ||
        attempt.includes('نقلب') ||
        attempt.includes('>') ||
        attempt.includes('inverser') ||
        attempt.includes('changer') ||
        attempt.includes('تبدل')
      ) {
        if (preferredLang === EducationLanguage.FRENCH) {
          return `Exactement 👌 $-2 > -5$ car $-2$ est plus proche de zéro sur la droite graduée !

Remarquez que le symbole $<$ s'est inversé pour devenir $>$ !

C'est pourquoi lorsqu'on multiplie ou divise une inéquation par un **nombre négatif**, on doit obligatoirement inverser le sens de l'inégalité :
- $<$ devient $>$
- $\\le$ devient $\\ge$

---

### ✍️ Petite question d'application :
Si on a $-3x < 12$ et qu'on divise par $-3$, quel sera le sens de l'inégalité et la valeur de $x$ ?`;
        }

        return `بالضبط 👌 $-2 > -5$ حيت $-2$ أقرب للصفر على مستقيم الأعداد!

لاحظتي شنو وقع؟ الرمز كان $<$ ورجع $>$!

لهذا السبب الرياضي، عندما نضرب أو نقسم طرفي أي متراجحة في **عدد سالب**، خاصنا نقلبو اتجاه الرمز إجبارياً:
- $<$ تصبح $>$
- $\\le$ تصبح $\\ge$

---

### ✍️ دابا سؤال تطبيقي صغير:
إذا كان:
$$-3x < 12$$
وقسمنا على $-3$، واش الرمز غادي يبقى $<$ ولا غادي يتقلب؟ وشحال غادي تخرج لك قيمة $x$؟`;
      }

      // Case D: General attempt encouragement with hint
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Votre démarche est sur la bonne voie 👍 !

Prenons un instant pour vérifier ce point ensemble :
Vérifiez le calcul et tentez une nouvelle étape, nous allons trouver la solution ensemble.`;
      }

      return `الفكرة ديالك في الطريق الصحيح 👍!

خلينا نراجعو هاد النقطة الصغيرة مع بعضنا:
تأكد من الحساب وجرب خطوة إضافية، وأنا معاك حتى نلقاو الجواب الصحيح.`;
    }

    // 5. Quadratic Equations / "كيفاش نحل معادلة من الدرجة الثانية" (Moroccan Teacher Interactive Loop)
    if (
      qLower.includes('درجة ثانية') ||
      qLower.includes('الدرجة الثانية') ||
      qLower.includes('second degré') ||
      qLower.includes('quadratic') ||
      qLower.includes('ax^2') ||
      qLower.includes('معادلات الدرجة 2') ||
      qLower.includes('معادلة من الدرجة الثانية') ||
      (qLower.includes('دلتا') && (qLower.includes('معادلة') || qLower.includes('اشرحلي') || qLower.includes('كيفاش') || qLower.includes('بغيت')))
    ) {
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Bonjour ! Prenons un exemple simple pour comprendre ensemble avant d'écrire les formules.

Considérons l'équation :
$$x^2 - 5x + 6 = 0$$

Avant d'utiliser le discriminant $\\Delta$, essayons de la factoriser sous la forme $(x - ?)(x - ?) = 0$.

À votre avis : **quels sont les deux nombres dont le produit est égal à 6 et la somme est égale à 5 ?**`;
      }

      if (preferredLang === EducationLanguage.ARABIC) {
        return `أهلاً بك! دعنا نأخذ مثالاً بسيطاً لنفهم معاً خطوة بخطوة قبل الخوض في القواعد.

تأمل معي هذه المعادلة:
$$x^2 - 5x + 6 = 0$$

قبل استخدام المميز $\\Delta$، لنحاول كتابتها على شكل جداء $(x - ?)(x - ?) = 0$.

برأيك: **ما هما العددان اللذان حاصل ضربهما 6 ومجموعهما 5؟**`;
      }

      // Authentic Moroccan Teacher Response
      return `آه، فهمتك 👍
ما بغيتكش تحفظ $\\Delta$ بلا ما تعرف علاش كنحتاجوها.

نشدو مثال صغير:
$$x^2 - 5x + 6 = 0$$

قبل ما نهضرو على $\\Delta$، بغيتك تجرب معايا حاجة بسيطة:
واش تقدر تلقى جوج أعداد، إلا ضربناهم يعطيو 6 وإلا جمعناهم يعطيو 5؟

جاوبني غير بهاد الخطوة، ومن بعد نكملو.`;
    }

    // 6. General Equations & Inequalities / "المعادلات والمتراجحات"
    if (
      qLower.includes('معادلات') ||
      qLower.includes('متراجحات') ||
      qLower.includes('معادلة') ||
      qLower.includes('متراجحة') ||
      qLower.includes('équation') ||
      qLower.includes('inéquation')
    ) {
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Bonjour ! Le cours des **équations et inéquations** repose sur un principe fondamental : **isoler l'inconnue $x$**.

Prenons cet exemple simple :
$$2x - 6 = 0$$

Pour isoler le terme $2x$ à gauche, **quelle est la première opération à effectuer avec le terme $-6$ ?**`;
      }

      if (preferredLang === EducationLanguage.ARABIC) {
        return `أهلاً بك يا بطل! يبدأ درس **المعادلات والمتراجحات** بالمفهوم الأساسي: **عزل المجهول $x$**.

تأمل معي هذا المثال البسيط:
$$2x - 6 = 0$$

لكي نبقي $x$ بمفردها في الطرف الأيمن، **ما هي أول خطوة نقوم بها للعدد $-6$؟**`;
      }

      return `أهلاً بك يا بطل! درس **المعادلات والمتراجحات** كيبدا دائماً بأبسط فكرة: **العزل ديال المجهول $x$**.

شوف معايا هاد المثال البسيط:
$$2x - 6 = 0$$

باش نخليو $x$ بوحدها فالطرف الأيسر، شنو هي أول حاجة نقدرو نديروها للعدد $-6$؟`;
    }

    // 7. Exercise Request / "عطيني تمرين"
    if (intent.type === 'EXERCISE_REQUEST') {
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Bravo pour votre motivation ! La pratique est la clé de la réussite 🎯.

Voici un exercice progressif :
Soit l'équation :
$$x^2 - 4x + 3 = 0$$

**Première étape :** Quels sont les coefficients $a$, $b$ et $c$ dans cette équation ?`;
      }

      if (preferredLang === EducationLanguage.ARABIC) {
        return `أحسنت! الممارسة هي مفتاح التفوق في الامتحان 🎯.

إليك هذا التمرين التدريجي:
نعتبر المعادلة:
$$x^2 - 4x + 3 = 0$$

**الخطوة الأولى:** ما هي المعاملات $a$ و $b$ و $c$ في هذه المعادلة؟`;
      }

      return `تبارك الله عليك! الممارسة هي السر باش تجيب نقطة ممتازة فـ الامتحان 🎯.

إليك هاد السؤال التدريجي:

نعتبر المعادلة:
$$x^2 - 4x + 3 = 0$$

**الخطوة الأولى:** شنو هما المعاملات $a$ و $b$ و $c$ في هاد المعادلة؟`;
    }

    // 8. Physics RC Circuit / ثنائي القطب RC
    if (qLower.includes('rc') || qLower.includes('فيزياء') || qLower.includes('مكثف') || qLower.includes('دارة') || qLower.includes('circuit')) {
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Bonjour ! Le dipôle **RC** est simple et captivant :
Nous avons un circuit avec un générateur $E$, un conducteur ohmique $R$ et un condensateur $C$ qui se charge progressivement.

D'après la loi d'additivité des tensions :
$$u_R(t) + u_C(t) = E$$

Petite question de compréhension :
**À l'instant initial $t = 0$ (début de la charge), que vaut la tension $u_C(0)$ aux bornes du condensateur totalement déchargé ?**`;
      }

      return `أهلاً بك! درس **ثنائي القطب RC** فكرتو بسيطة وممتعة:
عندنا دارة فيها مولد $E$، موصل أومي $R$، ومكثف $C$ كيتشحن تدريجياً.

بتطبيق قانون إضافية التوترات:
$$u_R(t) + u_C(t) = E$$

سؤال صغير للفهم:
**في اللحظة $t = 0$ (بداية الشحن)، شحال كيكون التوتر $u_C(0)$ بين مربطي المكثف وهو باقي خاوي؟**`;
    }

    // 9. Philosophy / الفلسفة
    if (qLower.includes('فلسفة') || qLower.includes('شخص') || qLower.includes('غير') || qLower.includes('وضع بشري') || qLower.includes('philosophie')) {
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Bienvenue ! En **philosophie**, l'essentiel est de poser la problématique et le paradoxe.

Considérons cette question centrale :
**"La personne est-elle libre et autonome, ou déterminée par des contraintes qui la dépassent ?"**

À votre avis, nos choix quotidiens sont-ils totalement libres, ou influencés par des facteurs sociaux et psychologiques ?`;
      }

      return `مرحباً بك! مادة **الفلسفة** كتحتاج فهم الإشكال والمفارقة قبل حفظ المواقف.

تأمل معايا هاد الإشكال المركزي:
**"هل الشخص كائن حر وذو إرادة مستقلة، أم أنه خاضع لحتميات وإكراهات تتجاوزه؟"**

من وجهة نظرك، واش كتحس أن قراراتك اليومية حرة 100%، ولا كاينين إكراهات (اجتماعية أو نفسية) كتحكم فيك؟`;
    }

    // 10. Greeting Intents
    if (intent.type === 'GREETING' || qLower === 'سلام' || qLower === 'bonjour' || qLower === 'salut' || qLower === 'salam') {
      if (preferredLang === EducationLanguage.FRENCH) {
        return `Bonjour ! Bienvenue sur **Qarayti.ai** avec ton tuteur **Faheem** 🌟.

Je suis là pour t'accompagner pas à pas dans le programme marocain. Quel sujet ou exercice souhaites-tu aborder aujourd'hui ?`;
      }

      if (preferredLang === EducationLanguage.ARABIC) {
        return `وعليكم السلام ورحمة الله وبركاته! أهلاً بك في **قرايتي.أي (Qarayti.ai)** مع أستاذك **فهيم** 🌟.

أنا معك لنفهم أي درس أو تمرين في المقرر المغربي خطوة بخطوة وبطريقة ممتعة وبسيطة. ما هو الدرس الذي تود دراسته اليوم؟`;
      }

      return `وعليكم السلام ورحمة الله وبركاته! أهلاً بك يا بطل في **قرايتي.أي (Qarayti.ai)** مع أستاذك الخصوصي **فهيم** 🌟.

أنا معاك باش نفهمو أي درس أو تمرين فـ المقرر المغربي خطوة بخطوة وبطريقة ممتعة وبسيطة.

شنو هو الدرس أو المفهوم اللي باغي نبداو بيه دابا؟`;
    }

    // 11. General Master Teacher Pedagogical Fallback
    if (preferredLang === EducationLanguage.FRENCH) {
      return `Bonjour ! Concernant le sujet : **"${query}"**, commençons par un exemple simple pour bien comprendre :

1. **L'idée intuitive :** Comprendre l'objectif avant d'appliquer une règle.
2. **Question de réflexion :** Quelle serait selon vous la première étape ?`;
    }

    if (preferredLang === EducationLanguage.ARABIC) {
      return `أهلاً بك! بخصوص موضوع: **"${query}"**، دعنا نبدأ بمثال بسيط لفهم الفكرة:

1. **الفكرة الأولية:** نفهم ما نبحث عنه قبل أي قاعدة.
2. **سؤال التفكير:** ما هي الخطوة الأولى التي تراها مناسبة في هذا الموضوع؟`;
    }

    return `أهلاً بك! بخصوص موضوع: **"${query}"**، خلينا نبدأو بأبسط مثال لفهم الفكرة:

1. **الفكرة الأولية:** نفهمو شنو باغين نلقاو قبل أي قاعدة.
2. **سؤال التفكير:** شنو اللي كيبان ليك كخطوة أولى فهاد الموضوع؟`;
  }
}
