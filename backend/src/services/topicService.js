const db = require('../models');
const { TOPIC_STATUS } = require('../constants/topicStatus');

async function getTopicDetails(topicId, userId) {
  const topic = await db.Topic.findByPk(topicId, {
    include: [
      {
        model: db.Subject,
        as: 'subject',
        attributes: ['id', 'name', 'code'],
      },
      {
        model: db.Chapter,
        as: 'chapter',
        attributes: ['id', 'name'],
      },
      {
        model: db.Subtopic,
        as: 'subtopics',
        attributes: ['id', 'name'],
      },
      {
        model: db.Resource,
        as: 'resources',
      },
      {
        model: db.Lesson,
        as: 'lesson',
        attributes: ['id', 'title', 'overview', 'estimated_read_time'],
      },
    ],
  });

  if (!topic) {
    const error = new Error(`Topic with ID ${topicId} not found`);
    error.statusCode = 404;
    error.errorCode = 'TOPIC_NOT_FOUND';
    throw error;
  }

  // Fetch or initialize user progress
  let [progress] = await db.TopicProgress.findOrCreate({
    where: { user_id: userId, topic_id: topicId },
    defaults: {
      status: TOPIC_STATUS.NOT_STARTED,
      best_score: 0,
      attempts_count: 0,
    },
  });

  // Count available MCQs and PYQs
  const totalQuestions = await db.Question.count({ where: { topic_id: topicId } });
  const pyqCount = await db.Question.count({ where: { topic_id: topicId, is_pyq: true } });

  return {
    ...topic.toJSON(),
    progress: progress.toJSON(),
    stats: {
      total_mcqs: totalQuestions,
      pyqs_available: pyqCount,
    },
  };
}


function generateGujaratiSections(topic) {
  const name = topic.name || 'Mining Topic';
  const subjectId = topic.subject_id || (topic.subject && topic.subject.id) || 1;
  const subjectName = topic.subject ? topic.subject.name : 'Mining Engineering';

  // Topic specific custom content for high-frequency topics
  if (/sampling|grade|reserve/i.test(name)) {
    return [
      {
        level_number: 1,
        section_type: 'CONCEPT_INTRO',
        title: 'Level 1: What is this topic? (આ ટોપિક શું છે?)',
        content_text: `${name} એ Mineral Economics અને Mine Planning નો પાયાનો વિષય છે. ખનિજ ભંડારમાંથી અયસ્ક (ore) ના સેમ્પલ એકત્રિત કરવાની પ્રક્રિયાને Mineral Sampling કહે છે. તેના આધારે સમગ્ર ડિપોઝિટનો સરેરાશ ગ્રેડ (Average Grade) અને કુલ જથ્થો (Reserve Tonnage) ગણવામાં આવે છે. આમાં Channel sampling, Chip sampling, Grab sampling, અને Core drilling પદ્ધતિઓ વપરાય છે.`,
      },
      {
        level_number: 2,
        section_type: 'IMPORTANCE',
        title: 'Level 2: Why does it matter? (GATE અને Mining માં આનો શું રોલ છે?)',
        content_text: `GATE Mining Engineering માં દર વર્ષે Average Grade અને Reserve Estimation પર 1 થી 2 માર્કના સીધા Numerical Answer Type (NAT) દાખલા પૂછાય છે. આ ઉપરાંત વાસ્તવિક ખાણકામમાં પ્રોજેક્ટની નાણાકીય શક્યતા (Economic Feasibility), Cut-off Grade નક્કી કરવા, અને UNFC / JORC Code મુજબ રિઝર્વ વર્ગીકરણ માટે આ વિષય અનિવાર્ય છે.`,
      },
      {
        level_number: 3,
        section_type: 'BASIC_CONCEPTS',
        title: 'Level 3: Basic Concepts (મૂળભૂત સિદ્ધાંતો)',
        content_text: `મુખ્ય સિદ્ધાંતો અને પદ્ધતિઓ:\n1. Weighting Factors: અલગ-અલગ લંબાઈ કે વિસ્તારના સેમ્પલ માટે ક્યારેય Simple Average ન લેવો, હંમેશા Weighted Average લેવો.\n2. Area of Influence: Boreholes ની અસર દર્શાવવા માટે Polygonal Method (Voronoi Diagram) અથવા Triangular Method નો ઉપયોગ થાય છે.\n3. UNFC Reserve Categories: Proved (Measured - 111), Probable (Indicated - 121/122), અને Possible (Inferred - 333) વર્ગીકરણ.`,
      },
      {
        level_number: 4,
        section_type: 'FORMULAS',
        title: 'Level 4: Important Formulas & Variables (મહત્વપૂર્ણ સૂત્રો)',
        content_text: `GATE માટેના આવશ્યક સૂત્રો:\n1. Length-Weighted Average Grade:\n   G_avg = Σ(g_i × l_i) / Σ(l_i)\n2. Area-Thickness-Weighted Grade:\n   G_avg = Σ(g_i × A_i × t_i) / Σ(A_i × t_i)\n3. Tonnage Calculation (Tonnes):\n   Tonnage = Area (m²) × Thickness (m) × Bulk Density (t/m³)\n4. Total Metal Content:\n   Total Metal = Tonnage × (Average Grade / 100)\n5. Mill Recovery:\n   Recovered Metal = Total Metal × Recovery Percentage`,
      },
      {
        level_number: 5,
        section_type: 'SIMPLE_EXAMPLE',
        title: 'Level 5: Simple Example (સરળ ઉદાહરણ)',
        content_text: `દાખલો (Conceptual Example):\nએક ઓરબોડીના 3 Boreholes માં નીચે મુજબ ડેટા મળેલ છે:\n• BH-1: Thickness = 2.0 m, Grade = 4.0%\n• BH-2: Thickness = 3.0 m, Grade = 2.5%\n• BH-3: Thickness = 5.0 m, Grade = 3.5%\n\nસરેરાશ ગ્રેડ (Average Grade) શોધો.\n\nઉકેલ (Solution):\nG_avg = Σ(g_i × t_i) / Σ(t_i)\nΣ(g_i × t_i) = (4.0 × 2.0) + (2.5 × 3.0) + (3.5 × 5.0) = 8.0 + 7.5 + 17.5 = 33.0 m-%\nΣ(t_i) = 2.0 + 3.0 + 5.0 = 10.0 m\nG_avg = 33.0 / 10.0 = 3.30%\nજવાબ: 3.30%`,
      },
      {
        level_number: 6,
        section_type: 'GATE_EXAMPLE',
        title: 'Level 6: GATE-Level Example (GATE પેટર્ન પ્રશ્ન)',
        content_text: `GATE Pattern Problem (Area & Density Weighted):\nબે બ્લોક્સનો ડેટા નીચે મુજબ છે:\n• Block A: Area = 10,000 m², Thickness = 4 m, Grade = 3.0%, Bulk Density = 2.5 t/m³\n• Block B: Area = 20,000 m², Thickness = 3 m, Grade = 2.0%, Bulk Density = 3.0 t/m³\n\nસમગ્ર ડિપોઝિટનો Average Grade શોધો.\n\nઉકેલ:\nTonnage A = 10,000 × 4 × 2.5 = 100,000 tonnes\nTonnage B = 20,000 × 3 × 3.0 = 180,000 tonnes\nTotal Tonnage = 100,000 + 180,000 = 280,000 tonnes\nMetal A = 100,000 × 0.03 = 3,000 tonnes\nMetal B = 180,000 × 0.02 = 3,600 tonnes\nTotal Metal = 6,600 tonnes\nG_avg = (6,600 / 280,000) × 100 = 2.357%\nજવાબ: 2.36%`,
      },
      {
        level_number: 7,
        section_type: 'PYQ_REVIEW',
        title: 'Level 7: Common Mistakes & PYQ Traps (સામાન્ય ભૂલો અને ટ્રેપ્સ)',
        content_text: `સામાન્ય ભૂલો (Common Mistakes in GATE):\n1. Simple Average લેવાની ભૂલ: (4.0 + 2.5 + 3.5)/3 = 3.33% લખવાથી ખોટો જવાબ આવે. હંમેશા Thickness અથવા Tonnage થી weightage આપવું.\n2. Bulk Density ધ્યાને ન લેવી: જો જુદા-જુદા બ્લોકમાં density અલગ હોય તો Tonnage-weighted ગણતરી કરવી અનિવાર્ય છે.\n3. PPM અને Percentage કન્વર્ઝન: 1% = 10,000 ppm (g/t). ગોલ્ડ કે પ્લેટિનમ ડિપોઝિટ માટે grade g/t માં આપેલ હોય ત્યારે યુનિટ બરાબર તપાસવું.`,
      },
      {
        level_number: 8,
        section_type: 'TIMED_PRACTICE',
        title: 'Level 8: Quick Revision & Exam Checklist (ક્વિક રિવિઝન અને ચેકલિસ્ટ)',
        content_text: `પરીક્ષા પૂર્વે ઝડપી ચેકલિસ્ટ:\n✓ Length-weighted અને Area-weighted ના સૂત્રો યાદ છે.\n✓ Tonnage = Area × Thickness × Bulk Density નો ખ્યાલ સ્પષ્ટ છે.\n✓ Cut-off Grade અને Mill Recovery ના સંબંધો સમજાઈ ગયા છે.\n\nહવે નીચે આપેલ 'Start 10-MCQ Mastery Quiz' બટન પર ક્લિક કરો અને તમારી સજ્જતા ચકાસો!`,
      },
    ];
  }

  // 1. Blast Design, Burden, Spacing, Explosives (GATE MN 2010-2026 Reference)
  if (/blast|burden|spacing|powder factor|explosive/i.test(name)) {
    return [
      {
        level_number: 1,
        section_type: 'CONCEPT_INTRO',
        title: 'Level 1: What is Blast Design? (બ્લાસ્ટ ડિઝાઇન અને પરિમાણો)',
        content_text: `Blast Design એ opencast અને underground mines માં ખડકોના વિભાજન (Rock Fragmentation) માટે blast holes ની ભૌમિતિક ગોઠવણી, વિસ્ફોટક (Explosive) નો જથ્થો, અને સલામત delay timing નક્કી કરવાની પદ્ધતિ છે. આમાં Free Face (મુક્ત સપાટી), Burden (B), Spacing (S), Bench Height (H), Collar Stemming (T), અને Sub-drilling (J) મુખ્ય ઘટકો છે. VCR Stope માં ગોળાકાર વિસ્ફોટક (Spherical charge) માટે શરત lc / d = 6 હોય છે (GATE 2024 Q1).`,
      },
      {
        level_number: 2,
        section_type: 'IMPORTANCE',
        title: 'Level 2: GATE MN Weightage (પરીક્ષામાં મહત્વ અને ઉપયોગિતા)',
        content_text: `GATE Mining Engineering માં Blast Design અને Explosives પરથી દર વર્ષે 4 થી 6 ગુણના numericals પૂછાય છે. મુખ્ય પ્રશ્નો: Powder Factor (m³/kg અથવા t/kg), Relative Bulk Strength (RBS), Electric Delay Detonator Circuit Resistance (GATE 2024), Scaled Distance PPV Ground Vibration (GATE 2020-2026), અને Underwater Blasting Selection (GATE 2026).`,
      },
      {
        level_number: 3,
        section_type: 'BASIC_CONCEPTS',
        title: 'Level 3: Blast Geometry & Technical Definitions (મૂળભૂત સિદ્ધાંતો)',
        content_text: `[DIAGRAM: BLAST_GEOMETRY|Bench Blast Hole Geometry: Burden, Spacing, Stemming, Subgrade]
મુખ્ય ઈજનેરી પરિમાણો (Engineering Parameters):
1. Burden (B): Blast hole અને નજીકની મુક્ત સપાટી (Free face) વચ્ચેનું લંબ અંતર.
2. Spacing (S): એક જ હરોળના બે પાસપાસેના holes વચ્ચેનું અંતર (સામાન્ય રીતે S = 1.15·B થી 1.4·B).
3. Stemming (T): Drill hole નો ઉપરનો ભાગ જે બ્લાસ્ટિંગ દરમિયાન વાયુઓને બહાર નીકળતા રોકે છે (T ≈ 20·D થી 25·D).
4. Subgrade Drilling (J): ફ્લોર લેવલ નીચે વધારાનું કાણું જેથી ફ્લોર પર 'Toe' ન રહી જાય (J ≈ 8·D થી 10·D).
5. Column Charge Length (Lc): Lc = (Bench Height + Subgrade) - Stemming.`,
      },
      {
        level_number: 4,
        section_type: 'FORMULAS',
        title: 'Level 4: Essential GATE Formulas (આવશ્યક ગાણિતિક સૂત્રો)',
        content_text: `GATE MN 2010-2026 ના પ્રમાણભૂત સૂત્રો:
1. Powder Factor (PF):
   PF = (B × S × H) / Explosive_in_kg  [m³/kg]
   અથવા PF = (B × S × H × ρ_rock) / Explosive_in_kg  [tonne/kg]
2. Relative Bulk Strength (RBS):
   RBS = (ρ_exp × E_exp) / (ρ_ANFO × E_ANFO) × 100
3. Blasting Circuit Total Resistance (GATE 2024):
   R_total = (n × R_det) + [n × 2 × L_lead × R_lead] + [2 × L_cable × R_cable]
4. USBM Ground Vibration Law (PPV):
   PPV = K · [D / √Q]^(-β)
   જ્યાં D = અંતર (m), Q = Delay દીઠ મહત્તમ instantaneous charge (kg), K, β = Site constants.
5. VCR Spherical Charge Criterion:
   lc / d = 6  (જ્યાં d = hole diameter, lc = maximum charge length).`,
      },
      {
        level_number: 5,
        section_type: 'SIMPLE_EXAMPLE',
        title: 'Level 5: Conceptual Example (સરળ દાખલો - GATE 2024)',
        content_text: `પ્રશ્ન: એક VCR Stope માં 165 mm વ્યાસના blast holes ડ્રિલ કરવામાં આવેલ છે. Hole ને spherical charge તરીકે વર્તવા માટે મહત્તમ charge length (lc) કેટલી હોવી જોઈએ?
ઉકેલ:
Spherical charge માટે પ્રમાણભૂત શરત:
lc / d = 6
lc = 6 × d = 6 × 0.165 m = 0.99 m.
જવાબ: 0.99 m (GATE 2024 Q1).`,
      },
      {
        level_number: 6,
        section_type: 'GATE_EXAMPLE',
        title: 'Level 6: Advanced GATE 2-Mark Numerical (GATE 2024 Q3)',
        content_text: `પ્રશ્ન: એક કોલસાના face માં 12 holes સીરીઝમાં જોડાયેલા electric delay detonators વડે બ્લાસ્ટ કરવામાં આવે છે.
ડેટા:
• Detonator resistance = 1.48 Ω દરેકનું
• Lead wire length = 1.5 m (બંને વાયરો માટે 1.5 + 1.5 = 3.0 m)
• Lead wire resistance = 0.04 Ω/m
• Blasting cable length = 120 m (2 core wire)
• Cable resistance = 0.009 Ω/m per wire
સમગ્ર સર્કિટનો કુલ રેઝિસ્ટન્સ (R) શોધો.

ઉકેલ:
1. Detonators નો રેઝિસ્ટન્સ: R_det = 12 × 1.48 = 17.76 Ω
2. Lead wires નો રેઝિસ્ટન્સ: R_lead = 12 × (1.5 + 1.5) × 0.04 = 1.44 Ω
3. Blasting cable નો રેઝિસ્ટન્સ: R_cable = 0.009 × 120 × 2 = 2.16 Ω
કુલ રેઝિસ્ટન્સ R = 17.76 + 1.44 + 2.16 = 21.36 Ω.
જવાબ: 21.36 Ω.`,
      },
      {
        level_number: 7,
        section_type: 'PYQ_REVIEW',
        title: 'Level 7: Common GATE Traps (સામાન્ય ભૂલો અને ટ્રેપ્સ)',
        content_text: `GATE Traps & Mistakes:
1. PPV સૂત્રમાં ભૂલ: PPV = K·[D/√Q]^(-β) માં Q એ 'Total Explosive' નથી, પરંતુ 'Maximum Instantaneous Charge per Delay' છે (GATE 2026 Q48).
2. Blasting Cable માં 2 વાયરો હોય છે, તેથી લંબાઈને 2 વડે ગુણવાનું ક્યારેય ભૂલવું નહીં.
3. Underwater Blasting (GATE 2026 Q47): ANFO પાણીમાં ઓગળી જાય છે (Non-water resistant) તેથી Emulsion વપરાય છે. Electric detonators માં stray current નો ભય રહે છે તેથી Non-Electric Shock Tube વાપરવી જોઈએ.`,
      },
      {
        level_number: 8,
        section_type: 'TIMED_PRACTICE',
        title: 'Level 8: Exam Checklist & Mastery (ક્વિક રિવિઝન)',
        content_text: `ચેકલિસ્ટ:
✓ lc / d = 6 (VCR Stope Spherical Charge)
✓ Powder factor = Volume / Explosive (m³/kg) અથવા Tonnes / Explosive (t/kg)
✓ Subgrade drilling J = 8D to 10D
✓ Stemming T = 20D to 25D
✓ PPV = K·(D/√Q)^(-β)
હવે નીચે આપેલ ક્વિઝ શરૂ કરો!`,
      },
    ];
  }

  // 2. Geomechanics: Kirsch Equations & In-situ Stresses around Circular Tunnel
  if (/kirsch|insitu stress|stress concentration|tangential stress/i.test(name)) {
    return [
      {
        level_number: 1,
        section_type: 'CONCEPT_INTRO',
        title: 'Level 1: What are Kirsch Equations? (કિર્શ સમીકરણો શું છે?)',
        content_text: `જ્યારે ખડકમાં ભૂગર્ભ ટનલ (Circular Opening) ખોદવામાં આવે છે, ત્યારે મૂળ ઇન-સીટુ સ્ટ્રેસ ફિલ્ડ પુનઃવહેંચાય છે. ટનલની આસપાસ ઉત્પન્ન થતા Tangential Stress (σθθ) અને Radial Stress (σr) ની ગણતરી કરવા માટે Kirsch Equations નો ઉપયોગ થાય છે.`,
      },
      {
        level_number: 2,
        section_type: 'IMPORTANCE',
        title: 'Level 2: GATE Weightage (પરીક્ષામાં મહત્વ)',
        content_text: `GATE 2022 (Q26), GATE 2023 (Q13), અને GATE 2024 (Q5) માં સીધા કિર્શ સમીકરણોના આધારે In-situ Stress Ratio (k) અને Tangential Stress ગણવાના 2-mark પ્રશ્નો પૂછાયા છે.`,
      },
      {
        level_number: 3,
        section_type: 'BASIC_CONCEPTS',
        title: 'Level 3: Boundary Stress Distribution (મૂળભૂત સિદ્ધાંતો)',
        content_text: `[DIAGRAM: KIRSCH_STRESS|Kirsch Tangential Stress Distribution around Circular Opening]
ટનલની સપાટી પર (Boundary at r = a):
1. Radial Stress: σr = 0 (મુક્ત આંતરિક સપાટી પર શૂન્ય હોય છે).
2. Tangential Stress (σθθ):
   σθθ = Po · [ (1 + k) + 2(1 - k)cos(2θ) ]
   જ્યાં Po = ઊભો સ્ટ્રેસ (Vertical Stress), k = Horizontal to Vertical Stress Ratio (k = σh / σv).
3. Sidewall (Point A, θ = 0°):
   σθθ(A) = Po · (3 - k)
4. Crown / Roof (Point B, θ = 90°):
   σθθ(B) = Po · (3k - 1).`,
      },
      {
        level_number: 4,
        section_type: 'FORMULAS',
        title: 'Level 4: Formulas & Relations (મહત્વપૂર્ણ સૂત્રો)',
        content_text: `1. Kirsch Boundary Formula:
   σθθ = Po · [ (1 + k) + 2(1 - k)cos(2θ) ]
2. Ratio Condition (GATE 2022 Q26):
   જો Sidewall (Point A) પરનો સ્ટ્રેસ Crown (Point B) કરતાં 3 ગણો હોય:
   Po(3 - k) = 3 · Po(3k - 1)  ➔  k = 0.6  (અથવા વિપરીત શરત મુજબ k = 2).
3. Hydrostatic Field (k = 1):
   σθθ = 2·Po (તમામ બિંદુઓ પર સમાન સ્ટ્રેસ).`,
      },
      {
        level_number: 5,
        section_type: 'SIMPLE_EXAMPLE',
        title: 'Level 5: Conceptual Example (GATE 2023 Q13)',
        content_text: `પ્રશ્ન: Biaxial stress field માં બનેલ ગોળાકાર ટનલ માટે જો boundary point A (θ=0°) અને point B (θ=45°) વચ્ચે tangential stress નો ગુણોત્તર σθθ(A)/σθθ(B) = 2.0 હોય, તો k ની કિંમત શોધો.
ઉકેલ:
σθθ(A) = Po(3 - k)
θ = 45° માટે cos(2 × 45°) = cos(90°) = 0, તેથી:
σθθ(B) = Po(1 + k)
σθθ(A) / σθθ(B) = (3 - k) / (1 + k) = 2.0
3 - k = 2 + 2k  ➔  3k = 1  ➔  k = 1/3 = 0.33.
જવાબ: k = 0.33.`,
      },
      {
        level_number: 6,
        section_type: 'GATE_EXAMPLE',
        title: 'Level 6: Depth & Overburden Problem (GATE 2024 Q5)',
        content_text: `પ્રશ્ન: 100 m ઊંડાઈએ 27 kN/m³ ઘનતા ધરાવતા રોકમાં ટનલ બનાવવામાં આવી છે. જો પોઇન્ટ A (હૉરિઝોન્ટલ બાઉન્ડ્રી) પર સ્ટ્રેસ 5 MPa હોય, તો પોઇન્ટ B (વર્ટિકલ ક્રાઉન) પર tangential stress ગણો.
ઉકેલ:
Po = γ · H = 27 × 10³ × 100 N/m² = 2.7 MPa.
Point A પર: σθθ(A) = Po(3 - k)
5 = 2.7(3 - k)  ➔  3 - k = 5 / 2.7 = 1.85  ➔  k = 1.15.
Point B (Crown, θ = 90°) પર:
σθθ(B) = 2.7 · [(1 + 1.15) + 2(1 - 1.15)cos(180°)]
σθθ(B) = 2.7 · [2.15 + 2(-0.15)(-1)] = 2.7 · [2.15 + 0.30] = 6.62 MPa.
જવાબ: 6.62 MPa.`,
      },
      {
        level_number: 7,
        section_type: 'PYQ_REVIEW',
        title: 'Level 7: Traps & Tips (ટ્રીકી પોઇન્ટ્સ)',
        content_text: `ખાસ યાદ રાખો:
• θ નો ખૂણો હંમેશા Horizontal Axis થી મપાય છે: Sidewall પર θ = 0°, Crown પર θ = 90°.
• જો k < 1/3 હોય, તો ટનલના Roof (Crown) પર Tensile Stress ઉત્પન્ન થાય છે અને છાપરું તૂટી પડવાનો ભય રહે છે!`,
      },
      {
        level_number: 8,
        section_type: 'TIMED_PRACTICE',
        title: 'Level 8: Final Summary (ક્વિક રિવિઝન)',
        content_text: `✓ σθθ(Sidewall) = Po(3 - k)
✓ σθθ(Crown) = Po(3k - 1)
✓ σθθ(45°) = Po(1 + k)
✓ Hydrostatic (k=1) ➔ σθθ = 2Po.
હવે ટેસ્ટ આપીને વિષય પૂર્ણ કરો!`,
      },
    ];
  }

  // 3. Geomechanics: Mohr-Coulomb & Pore Pressure Shift
  if (/mohr|triaxial|shear strength|pore pressure/i.test(name)) {
    return [
      {
        level_number: 1,
        section_type: 'CONCEPT_INTRO',
        title: 'Level 1: What is Mohr-Coulomb Failure Criteria? (મોહર-કુલંબ સિદ્ધાંત)',
        content_text: `Mohr-Coulomb Criterion એ ખડકો અને જમીનની શિયર સ્ટ્રેન્થ (Shear Strength) માપવા માટેનો સર્વમાન્ય સિદ્ધાંત છે. તેના મુજબ ખડકની મજબૂતાઈ Cohesion (c) અને Angle of Internal Friction (φ) પર નિર્ભર કરે છે. જ્યારે ખડકમાં પાણી ભરાય છે (Pore Water Pressure - p), ત્યારે Effective Normal Stress ઘટી જાય છે, જેનાથી Mohr Circle ડાબી બાજુ ખસે છે અને ખડક ઝડપથી ફેલ થાય છે.`,
      },
      {
        level_number: 2,
        section_type: 'IMPORTANCE',
        title: 'Level 2: GATE Weightage (પરીક્ષામાં મહત્વ)',
        content_text: `GATE 2022 (Q24), GATE 2023 (Q8), અને GATE 2024 (Q2) માં સીધા Mohr-Coulomb Envelope અને Pore Pressure Shift પર પ્રશ્નો પૂછાયા છે.`,
      },
      {
        level_number: 3,
        section_type: 'BASIC_CONCEPTS',
        title: 'Level 3: Failure Envelope & Pore Pressure (મૂળભૂત સિદ્ધાંતો)',
        content_text: `[DIAGRAM: MOHR_CIRCLE|Mohr Circle of Stress & Pore Pressure Saturation Shift]
મુખ્ય સિદ્ધાંતો:
1. Coulomb Equation: τ = c + σn · tan(φ)
   જ્યાં c = Cohesion (MPa), φ = Friction angle, σn = Normal stress.
2. Effective Stress Principle (Terzaghi):
   σ' = σ - p (જ્યાં p = Pore water pressure).
3. Circle Shift (GATE 2022 Q24):
   ડ્રાય રોકમાં સર્કલ (σ3, σ1) પર હોય છે. પાણી ભરાતાં સર્કલ ડાબી બાજુ ખસીને (σ3 - p, σ1 - p) બની જાય છે અને ફેલિયર એન્વલપને સ્પર્શે છે!`,
      },
      {
        level_number: 4,
        section_type: 'FORMULAS',
        title: 'Level 4: Mathematical Relations (મહત્વપૂર્ણ સૂત્રો)',
        content_text: `1. Triaxial Failure Equation:
   σ1 = σ3 · tan²(45° + φ/2) + 2c · tan(45° + φ/2)
2. Shear Stress at Failure Plane:
   τ = [(σ1 - σ3) / 2] · cos(φ)
3. Angle of Failure Plane with Minor Principal Axis (σ3):
   θ = 45° + φ/2
4. UCS (Uniaxial Compressive Strength Co):
   Co = 2c · cos(φ) / (1 - sin(φ))
5. Tensile Strength (To):
   To = 2c · cos(φ) / (1 + sin(φ))
   Ratio Co / To = (1 + sin φ) / (1 - sin φ)  (GATE 2010 Q87).`,
      },
      {
        level_number: 5,
        section_type: 'SIMPLE_EXAMPLE',
        title: 'Level 5: Simple Example (GATE 2023 Q8)',
        content_text: `પ્રશ્ન: સેન્ડસ્ટોન માટે Mohr-Coulomb failure envelop σ1 = 30 + 3.5·σ3 છે. Failure plane નો σ3 axis સાથેનો ખૂણો ડિગ્રીમાં શોધો.
ઉકેલ:
Standard form: σ1 = Co + tan²(45° + φ/2) · σ3
અહીં tan²(45° + φ/2) = 3.5
tan(45° + φ/2) = √3.5 = 1.8708
45° + φ/2 = tan⁻¹(1.8708) = 61.875°
Failure plane નો ખૂણો θ = 45° + φ/2 = 61.88°.
જવાબ: 61.9° (GATE 2023).`,
      },
      {
        level_number: 6,
        section_type: 'GATE_EXAMPLE',
        title: 'Level 6: Advanced Triaxial Problem (GATE 2024 Q2)',
        content_text: `પ્રશ્ન: સેન્ડસ્ટોન માટે τ = 7.5 + 0.84·σn (MPa) છે. Confining pressure σ3 = 5.0 MPa હોય ત્યારે failure વખતે Shear Stress (τ) શોધો.
ઉકેલ:
tan φ = 0.84 ➔ φ = 40.03°, c = 7.5 MPa.
Co = 2c·cos φ / (1 - sin φ) = (2 × 7.5 × cos 40.03°) / (1 - sin 40.03°) = 32.19 MPa.
σ1 = 4.63·σ3 + 32.19 = 4.63(5) + 32.19 = 55.34 MPa.
τ = [(σ1 - σ3) / 2] · cos φ = [(55.34 - 5) / 2] · cos(40.03°) = 19.21 MPa.
જવાબ: 19.21 MPa.`,
      },
      {
        level_number: 7,
        section_type: 'PYQ_REVIEW',
        title: 'Level 7: Traps & Analysis (સામાન્ય ભૂલો)',
        content_text: `• Normal Stress vs Principal Stress: τ એ failure plane પરનો shear stress છે, જ્યારે σ1, σ3 એ principal stresses છે જે planes પર shear stress શૂન્ય હોય છે.
• Pore pressure વધવાથી સર્કલનો વ્યાસ (σ1 - σ3) બદલાતો નથી, માત્ર સર્કલ આખું ડાબી બાજુ ખસે છે!`,
      },
      {
        level_number: 8,
        section_type: 'TIMED_PRACTICE',
        title: 'Level 8: Exam Checklist (ક્વિક રિવિઝન)',
        content_text: `✓ τ = c + σn·tan φ
✓ Failure angle θ = 45° + φ/2
✓ UCS / Tensile = (1 + sin φ) / (1 - sin φ)
✓ Saturated Pore Pressure p shifts circle left by p
હવે ક્વિઝ આપો!`,
      },
    ];
  }

  // Domain-specific defaults
  let domainFocus = 'mining engineering operations અને GATE પરીક્ષા';
  let practicalApplication = 'ખનન પ્રક્રિયાઓ (mine operations) અને સલામતી ધોરણો (DGMS standards)';
  let formulaTip = `Standard equations, variables, અને SI units (દા.ત. m, kg, s, Pa, N, t/m³).`;
  let mistakesTrap = `Unit conversion (દા.ત. mm vs m, tonnes vs kg, Pa vs kPa) અને rounding-off errors.`;

  if (subjectId === 1) {
    domainFocus = 'Mining Geology, Mine Development & Surveying';
    practicalApplication = 'Borehole exploration, shaft sinking, rock drilling, blast design, અને theodolite traversing';
    formulaTip = `Dip & strike trigonometry, burden-spacing relations, powder factor, theodolite latitude/departure, અને leveling corrections.`;
    mistakesTrap = `True dip vs apparent dip માં ગૂંચવણ, burden vs spacing નો ratio, અને traverse balancing માં sign conventions (+/-) ની ભૂલો.`;
  } else if (subjectId === 2) {
    domainFocus = 'Geomechanics & Ground Control';
    practicalApplication = 'Rock mass classification (RMR/Q), pillar stability, in-situ stress measurements, અને underground roof support design';
    formulaTip = `Mohr-Coulomb failure criterion, UCS relations, Bieniawski RMR rating, tributary area theory, અને safety factor (SF = Strength / Stress).`;
    mistakesTrap = `Tributary area theory માં extraction ratio (e) ની ગણતરી, triaxial test માં principal stresses (σ1, σ3) ની ઓળખ, અને bolt anchorage length.`;
  } else if (subjectId === 3) {
    domainFocus = 'Mining Methods & Machinery';
    practicalApplication = 'Bord & Pillar, Longwall retreating/advancing, open pit bench geometry, dragline/shovel-dumper sizing, અને hoisting systems';
    formulaTip = `Stripping ratio (BESR), cycle time of HEMM, belt conveyor capacity, winder power calculations, અને face production rates.`;
    mistakesTrap = `Swell factor (bulking factor) vs fill factor ની ગૂંચવણ, volumetric vs mass stripping ratio, અને fleet matching ratio.`;
  } else if (subjectId === 4) {
    domainFocus = 'Mine Ventilation, Environment & Hazards';
    practicalApplication = 'Mine airflow dynamics, mechanical ventilation fans, mine gases detection, spontaneous combustion control, અને fire fighting';
    formulaTip = `Atkinson's equation (P = R·Q² = K·P·L·Q² / A³), fan power (Air Power = P·Q), equivalent orifice, અને methane explosibility Coward diagram.`;
    mistakesTrap = `Resistance in series vs parallel (R_eq = R1 + R2 vs 1/√R_eq = 1/√R1 + 1/√R2), NVP direction (assisting vs opposing), અને air density corrections.`;
  } else if (subjectId === 5) {
    domainFocus = 'Mineral Economics, Mine Planning & Systems Engineering';
    practicalApplication = 'Mineral sampling, borehole grade assaying, ore reserve estimation, break-even cut-off grade, NPV/IRR valuation, અને CPM/PERT';
    formulaTip = `Weighted average grade G = Σ(g·w)/Σw, reserve tonnage = Area × Thickness × Bulk Density, Break-Even Stripping Ratio, અને Net Present Value.`;
    mistakesTrap = `Simple arithmetic mean લેવાની ભૂલ (હંમેશા weighted average વાપરો), specific gravity/bulk density ને ધ્યાને ન લેવું, અને ppm vs % conversion (1% = 10,000 ppm).`;
  } else if (subjectId === 6) {
    domainFocus = 'Engineering Mathematics for GATE';
    practicalApplication = 'Matrix operations, eigenvalues/eigenvectors, calculus optimization, numerical integration, અને probability distributions';
    formulaTip = `Eigenvalue characteristic equation det(A - λI) = 0, Taylor series, Simpson's 1/3rd rule, Normal / Poisson distribution formulas.`;
    mistakesTrap = `Simpson's rule માં number of intervals even હોવા જોઈએ, matrix non-singularity (det ≠ 0), અને probability density function (PDF) integral = 1.`;
  } else if (subjectId === 7) {
    domainFocus = 'General Aptitude';
    practicalApplication = 'Quantitative aptitude, percentages, time-work-speed problems, logical deduction, અને spatial reasoning';
    formulaTip = `Work = Rate × Time, Relative Speed (opposite direction = s1 + s2, same = |s1 - s2|), Profit/Loss percentages, Ratios & Proportions.`;
    mistakesTrap = `Speed unit conversion (km/h to m/s: multiply by 5/18), base value in percentage change, અને negative marking traps.`;
  }

  return [
    {
      level_number: 1,
      section_type: 'CONCEPT_INTRO',
      title: 'Level 1: What is this topic? (આ ટોપિક શું છે?)',
      content_text: `${name} એ GATE Mining Engineering અભ્યાસક્રમનો અત્યંત મહત્વપૂર્ણ વિષય છે. આ સેક્શનમાં આપણે તેના fundamental principles, standard engineering definitions, અને practical mining applications વિશે વિગતવાર ગુજરાતીમાં સમજીશું. દરેક મુખ્ય concept અને technical terms ને GATE પરીક્ષાના standard મુજબ અંગ્રેજીમાં જ સ્પષ્ટ કરવામાં આવ્યા છે.`,
    },
    {
      level_number: 2,
      section_type: 'IMPORTANCE',
      title: 'Level 2: Why does it matter? (GATE અને Mining માં આનો શું રોલ છે?)',
      content_text: `${name} ટોપિક ${practicalApplication} તેમજ GATE પરીક્ષાના high scoring માટે સીધો નિર્ણાયક (crucial) છે. અગાઉના વર્ષોના GATE પેપર્સના એનાલિસિસ મુજબ આમાંથી conceptual MCQs, MSQs (Multiple Select Questions), અને 1-2 માર્કના numerical calculations વારંવાર પૂછાય છે.`,
    },
    {
      level_number: 3,
      section_type: 'BASIC_CONCEPTS',
      title: 'Level 3: Basic Concepts (મૂળભૂત સિદ્ધાંતો)',
      content_text: `${name} ના મુખ્ય પાયાના સિદ્ધાંતો અને theoretical foundations:\n• Core Mechanism: આ વિષયના ગાણિતિક અને ભૌતિક સિદ્ધાંતોનું ઊંડાણપૂર્વક વિશ્લેષણ.\n• Field Practice: ખનન ક્ષેત્ર (${domainFocus}) માં તેનું practical અમલીકરણ.\n• Operational Assumptions: ગણતરી કરતી વખતે ધ્યાનમાં રાખવાની ચોક્કસ પૂર્વધારણાઓ અને safety factors.`,
    },
    {
      level_number: 4,
      section_type: 'FORMULAS',
      title: 'Level 4: Important Formulas & Variables (મહત્વપૂર્ણ સૂત્રો)',
      content_text: `${name} માટેના આવશ્યક mathematical equations અને SI units:\n• ${formulaTip}\n• ગણતરી કરતી વખતે તમામ parameters ને standard SI units માં કન્વર્ટ કરો જેથી numerical calculation માં સિલી મિસ્ટેક ન થાય.`,
    },
    {
      level_number: 5,
      section_type: 'SIMPLE_EXAMPLE',
      title: 'Level 5: Simple Example (સરળ ઉદાહરણ)',
      content_text: `દાખલાની વિગત (Conceptual Problem):\n${name} ના બેઝિક ફોર્મ્યુલા આધારિત direct numerical question.\n\nસ્ટેપ-બાય-સ્ટેપ ઉકેલ (Step-by-step Solution):\n1. Given Data ઓળખો અને તમામ values ને standard SI units માં ફેરવો.\n2. યોગ્ય Standard Formula લાગુ કરો.\n3. કિંમતો મૂકીને સાચો જવાબ મેળવો અને યોગ્ય units દર્શાવો.`,
    },
    {
      level_number: 6,
      section_type: 'GATE_EXAMPLE',
      title: 'Level 6: GATE-Level Example (GATE પેટર્ન પ્રશ્ન)',
      content_text: `GATE 2-Mark Numerical Question (Higher Difficulty):\nઆ પ્રકારના પ્રશ્નોમાં બે કે તેથી વધુ concepts ને એકસાથે જોડીને multi-step calculation પૂછવામાં આવે છે.\n\nસચોટ અભિગમ (Solving Strategy):\n• પ્રશ્નમાં પૂછાયેલી ચોક્કસ શરતો (Boundary conditions) સમજો.\n• મધ્યવર્તી ગણતરીઓમાં rounding-off error ટાળવા માટે ઓછામાં ઓછા 3 થી 4 decimal places જાળવી રાખો.\n• વર્ચ્યુઅલ કેલ્ક્યુલેટર (GATE Virtual Calculator) ના ઉપયોગથી ઝડપી અને સચોટ ગણતરી કરો.`,
    },
    {
      level_number: 7,
      section_type: 'PYQ_REVIEW',
      title: 'Level 7: Common Mistakes & PYQ Traps (સામાન્ય ભૂલો અને ટ્રેપ્સ)',
      content_text: `${name} માં વિદ્યાર્થીઓ દ્વારા થતી સામાન્ય ભૂલો અને ટ્રીકી પોઇન્ટ્સ:\n• ${mistakesTrap}\n• જ્યાં સુધી 100% ખાતરી ન હોય ત્યાં સુધી અંદાજે તુક્કો ન લગાવવો જેથી 1/3 કે 2/3 નેગેટિવ માર્કિંગથી બચી શકાય.`,
    },
    {
      level_number: 8,
      section_type: 'TIMED_PRACTICE',
      title: 'Level 8: Quick Revision & Exam Checklist (ક્વિક રિવિઝન અને ચેકલિસ્ટ)',
      content_text: `ટોપિક કમ્પ્લીટ કરવા માટેની અંતિમ ચેકલિસ્ટ:\n✓ તમામ fundamental definitions અને assumptions યાદ છે.\n✓ બધા મુખ્ય formulas અને units મોઢે છે.\n✓ GATE pattern ના numericals ગણવાની પૂરતી પ્રેક્ટિસ થઈ ગઈ છે.\n\nહવે તમારી તૈયારી ચકાસવા માટે નીચે આપેલ 'Start 10-MCQ Mastery Quiz' બટન પર ક્લિક કરો અને ઓછામાં ઓછો 80% સ્કોર મેળવો!`,
    },
  ];
}

async function getTopicLesson(topicId, userId) {
  let lesson = await db.Lesson.findOne({
    where: { topic_id: topicId },
    include: [
      {
        model: db.LessonSection,
        as: 'sections',
        order: [['level_number', 'ASC']],
      },
    ],
  });

  if (!lesson) {
    // Generate standard 8-level structured progression in Gujarati for unseeded topics
    const topic = await db.Topic.findByPk(topicId, {
      include: [{ model: db.Subject, as: 'subject' }],
    });
    if (!topic) {
      const error = new Error('Topic not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      topic_id: topic.id,
      title: `${topic.name} Mastery Guide`,
      overview: `${topic.name} માટે સંપૂર્ણ અભ્યાસક્રમ મુજબનું 8-સ્તરીય સ્ટડી મટિરિયલ.`,
      estimated_read_time: topic.estimated_minutes || 25,
      sections: generateGujaratiSections(topic),
    };
  }

  // Update lesson viewed in progress without overwriting COMPLETED status
  const [prog] = await db.TopicProgress.findOrCreate({
    where: { user_id: userId, topic_id: topicId },
    defaults: {
      lesson_viewed: true,
      status: TOPIC_STATUS.LEARNING,
    },
  });
  if (prog) {
    prog.lesson_viewed = true;
    if (prog.status === TOPIC_STATUS.NOT_STARTED) {
      prog.status = TOPIC_STATUS.LEARNING;
    }
    await prog.save();
  }

  return lesson;
}

async function markTopicCompleted(topicId, userId) {
  const transaction = await db.sequelize.transaction();
  try {
    const topic = await db.Topic.findByPk(topicId);
    if (!topic) {
      const error = new Error(`Topic with ID ${topicId} not found`);
      error.statusCode = 404;
      throw error;
    }

    const [progress] = await db.TopicProgress.findOrCreate({
      where: { user_id: userId, topic_id: topicId },
      defaults: {
        status: TOPIC_STATUS.COMPLETED,
        best_score: 85,
        last_score: 85,
        attempts_count: 1,
        lesson_viewed: true,
        last_attempted_at: new Date(),
        completed_at: new Date(),
      },
      transaction,
    });

    progress.status = TOPIC_STATUS.COMPLETED;
    progress.lesson_viewed = true;
    progress.completed_at = progress.completed_at || new Date();
    if (!progress.best_score || progress.best_score < 80) {
      progress.best_score = 85;
    }
    await progress.save({ transaction });

    // Schedule spaced retention revision
    const existingRevision = await db.RevisionSchedule.findOne({
      where: { user_id: userId, topic_id: topicId, is_completed: false },
      transaction,
    });
    if (!existingRevision) {
      const { calculateRevisionDate } = require('../utils/dateUtils');
      await db.RevisionSchedule.create(
        {
          user_id: userId,
          topic_id: topicId,
          revision_cycle: 1,
          scheduled_date: calculateRevisionDate(0),
          is_completed: false,
        },
        { transaction }
      );
    }

    // Update DailyProgress for study days containing this topic
    const dayTopics = await db.DayTopic.findAll({
      where: { topic_id: topicId },
      transaction,
    });

    let dayCompleted = false;
    for (const dt of dayTopics) {
      const dayId = dt.day_id;
      const allDt = await db.DayTopic.findAll({ where: { day_id: dayId }, transaction });
      const dtTopicIds = allDt.map((item) => item.topic_id);

      const completedInDay = await db.TopicProgress.count({
        where: {
          user_id: userId,
          topic_id: dtTopicIds,
          status: TOPIC_STATUS.COMPLETED,
        },
        transaction,
      });

      const isCompleted = completedInDay >= allDt.length;
      if (isCompleted) dayCompleted = true;

      const [dailyProg] = await db.DailyProgress.findOrCreate({
        where: { user_id: userId, day_id: dayId },
        defaults: {
          is_completed: isCompleted,
          topics_completed_count: completedInDay,
          total_topics_count: allDt.length,
          completed_at: isCompleted ? new Date() : null,
        },
        transaction,
      });

      dailyProg.topics_completed_count = completedInDay;
      dailyProg.total_topics_count = allDt.length;
      if (isCompleted) {
        dailyProg.is_completed = true;
        dailyProg.completed_at = dailyProg.completed_at || new Date();
      }
      await dailyProg.save({ transaction });
    }

    await transaction.commit();

    // Update streak asynchronously
    const streakService = require('./streakService');
    await streakService.updateUserStreak(userId).catch(() => {});

    return {
      topic_id: topicId,
      status: TOPIC_STATUS.COMPLETED,
      is_completed: true,
      day_completed: dayCompleted,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  getTopicDetails,
  getTopicLesson,
  markTopicCompleted,
};
