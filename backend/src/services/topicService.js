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

  // Update lesson viewed in progress
  await db.TopicProgress.upsert({
    user_id: userId,
    topic_id: topicId,
    lesson_viewed: true,
    status: TOPIC_STATUS.LEARNING,
  });

  return lesson;
}

module.exports = {
  getTopicDetails,
  getTopicLesson,
};
