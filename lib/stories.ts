// ─────────────────────────────────────────────────────────────────────────────
// Astellic in Action — the curated story portfolio.
//
// IMPORTANT (credibility rule): Astellic is a new, founder-led firm with no
// delivered engagements of its own yet. Every story below is the FOUNDER's own
// experience (prior roles and personal consultancies), drawn from the CV, and is
// labelled "Founder experience". Never relabel any of this as an Astellic
// engagement. When Astellic closes its first engagement in its own name, add it
// here with attribution "Astellic engagement".
// ─────────────────────────────────────────────────────────────────────────────

export type Portfolio = "Evidence" | "Policy" | "Implementation";

export interface Story {
  slug: string;
  portfolio: Portfolio;
  /** Tailwind accent token for the pillar: Evidence=navy, Policy=teal, Implementation=green. */
  accent: "navy" | "teal" | "green";
  title: string;
  subtitle: string;
  /** The editorial angle / recommended visual treatment. */
  angle: string;
  attribution: string;
  geography: string[];
  problem: string;
  /** Why it mattered / what made it hard. */
  complexity: string;
  approach: string[];
  created: string[];
  changed: string;
  frameworks: string[];
  capabilities: string[];
  cta: string;
}

const EVIDENCE: Story[] = [
  {
    slug: "supreme-lifelines",
    portfolio: "Evidence",
    accent: "navy",
    title: "Can new models of care work in the real health system?",
    subtitle:
      "National implementation research on pre-eclampsia and maternal anaemia.",
    angle: "A research journey — from question to scale-up decision.",
    attribution: "Founder experience · Principal Investigator · Jhpiego / Unitaid · 2026",
    geography: ["Malawi", "Tanzania", "Kenya", "Ghana", "Senegal"],
    problem:
      "Pre-eclampsia and maternal anaemia remain leading causes of maternal death. The clinical answers largely exist; what is unknown is which delivery models actually prevent, detect and manage them inside Malawi's routine primary and secondary care — and whether those models can scale.",
    complexity:
      "This is an implementation question, not an efficacy one. It spans facility, district and national levels, demands mixed methods, implementation-fidelity and costing evidence, cross-country harmonisation, and layered ethics across WHO, Johns Hopkins and national committees.",
    approach: [
      "Designed and led a national mixed-methods implementation-research programme of roughly USD 600,000 as Principal Investigator.",
      "Co-designed the Malawi Learning Agenda, research protocol and data-collection tools with the Ministry of Health, Jhpiego, Amref and Community Advisory Boards.",
      "Tested antenatal-care delivery models — Group ANC, midwifery-led care and networks of care — for feasibility, acceptability, scalability, fidelity and cost.",
      "Harmonised methodology with Principal Investigators in Tanzania, Kenya, Ghana and Senegal to generate comparable, region-relevant evidence.",
    ],
    created: [
      "Malawi Learning Agenda",
      "Implementation-research protocol and data tools",
      "A validated climate and health-equity scorecard for maternal and child health",
      "Implementation-costing model",
      "Policy briefs and national validation workshops",
    ],
    changed:
      "Designed to generate the feasibility, scalability and cost evidence Malawi needs to decide on national scale-up. The programme is current — evidence in progress, not a closed result.",
    frameworks: [
      "Implementation research design",
      "Implementation fidelity assessment",
      "Implementation costing",
      "Climate & health-equity scorecard",
    ],
    capabilities: [
      "Implementation science",
      "Mixed-methods research",
      "Research governance & ethics",
      "Government co-design",
      "Cross-country scientific leadership",
    ],
    cta: "Designing or scaling a model of care?",
  },
  {
    slug: "frontline-aids-financing-intelligence",
    portfolio: "Evidence",
    accent: "navy",
    title: "Eight countries. One health-financing intelligence system.",
    subtitle:
      "Health-financing scoping and an Intelligence Hub for Frontline AIDS.",
    angle: "A continental intelligence map — context to strategic action.",
    attribution:
      "Founder experience · Co-consultant with a global health-financing specialist · 2026–present",
    geography: [
      "Angola",
      "Côte d'Ivoire",
      "Kenya",
      "Malawi",
      "Mozambique",
      "Nigeria",
      "Uganda",
      "Zimbabwe",
    ],
    problem:
      "As donor funding for HIV and community-led responses contracts, countries must mobilise domestic resources — but financing landscapes are opaque, fragmented and politically contingent. Where can advocacy actually move money?",
    complexity:
      "Eight structurally different countries. The task is not a one-off report but a living intelligence system integrating financing trends, actors, mechanisms, policy developments and funding windows that Frontline AIDS can keep updating.",
    approach: [
      "Analysed domestic resource mobilisation, fiscal space, financing reforms and sustainability country by country.",
      "Applied political-economy analysis to the actors, incentives, institutions, power and policy windows shaping financing decisions.",
      "Assessed the feasibility of alternative mechanisms — social contracting, public financing, insurance and development-bank financing.",
      "Integrated global, regional and country intelligence through a strategic-prioritisation framework.",
    ],
    created: [
      "A Health Financing Intelligence Hub",
      "A strategic-prioritisation framework",
      "Eight country financing profiles",
      "Short- and longer-term strategic recommendations to 2030",
    ],
    changed:
      "Built to focus Frontline AIDS' financing advocacy and partnerships where they can most strengthen sustainable financing for community-led and key-population services. Current engagement — outcomes pending.",
    frameworks: [
      "Domestic resource mobilisation & fiscal-space analysis",
      "Political economy analysis",
      "Strategic prioritisation framework",
      "Health-financing intelligence system",
    ],
    capabilities: [
      "Multi-country health-financing analysis",
      "Political economy",
      "Strategic prioritisation",
      "Reusable intelligence tools",
      "Advocacy strategy",
    ],
    cta: "Need to see where financing can actually move?",
  },
  {
    slug: "evaluation-as-a-decision-tool",
    portfolio: "Evidence",
    accent: "navy",
    title: "Evaluation that changes decisions, not just closes projects.",
    subtitle: "Four evaluations where the method was chosen to fit the decision.",
    angle: "A comparison set — the question, the design, the decision it informed.",
    attribution: "Founder experience · Independent evaluation consultancies · 2022–2025",
    geography: ["Malawi", "Zambia", "Multi-country"],
    problem:
      "Most evaluations arrive late and answer the wrong question — built around donor reporting rather than the decision a client actually faces.",
    complexity:
      "Different decisions need different designs, often under data and time constraints and real political sensitivity. The craft is matching method to question.",
    approach: [
      "AGYW HIV/SRH integration, Mangochi (World Education) — baseline then endline; redesigned and validated the Ministry of Health Youth-Friendly Health Services Scorecard; assessed referral systems, access, service quality and partner coordination.",
      "Sondra Smalley midline (mothers2mothers) — policy and health-systems analysis for cervical-cancer screening; key-informant interviews, focus groups and surveys with Mentor Mothers.",
      "Commuters for Health endline (Health Equity Access) — a four-country, theory-based mixed-method evaluation with 32 key-informant interviews, shaping the next youth-engagement strategy.",
      "Community health systems effectiveness (On Call Africa, Zambia) — governance of Neighbourhood Health Committees and access to services.",
    ],
    created: [
      "The redesigned Youth-Friendly Health Services Scorecard",
      "Theory-based evaluation designs and Theories of Change",
      "Evaluation reports with prioritised, decision-ready recommendations",
    ],
    changed:
      "Findings fed programme-expansion and youth-strategy decisions for the commissioning organisations.",
    frameworks: [
      "Theory-based evaluation",
      "Theory of Change",
      "Youth-Friendly Health Services Scorecard",
      "Implementation fidelity assessment",
    ],
    capabilities: [
      "Evaluation design",
      "Mixed methods",
      "Tool development",
      "Policy-relevant synthesis",
    ],
    cta: "Commissioning an evaluation that must inform a real decision?",
  },
];

const POLICY: Story[] = [
  {
    slug: "malawi-health-devolution",
    portfolio: "Policy",
    accent: "teal",
    title: "Turning decentralisation from policy ambition into a working system.",
    subtitle: "Malawi's Comprehensive Health Sector Devolution Plan.",
    angle: "An institutional-architecture case — a system, not a summary.",
    attribution:
      "Founder experience · Ministry of Health & Sanitation consultancy · 2026",
    geography: ["Malawi"],
    problem:
      "Decentralisation is national policy, but the operating question is unanswered: who actually does what — functions, financing, drug budgets, human resources, accountability — between the Ministry of Health, Local Government Authorities and the Ministry of Local Government? Without that architecture, devolution stalls.",
    complexity:
      "It sits across multiple institutions with overlapping mandates, contested financing and HR arrangements, and weak intergovernmental coordination — a governance-design problem, not a technical one.",
    approach: [
      "Conducted policy and institutional analysis of the National Decentralization Policy, Local Government Act and health-sector frameworks.",
      "Assessed the status of devolved functions — financing, HR, drug-budget management, service delivery and coordination.",
      "Ran structured consultation with Ministry of Health directorates, the local-government ministry, Local Government Authorities, District Health Management Teams, partners and civil society.",
      "Designed the governance architecture — functions to devolve versus retain, reporting lines, accountability, financing and HR — with a monitoring and evaluation framework.",
    ],
    created: [
      "Inception Report",
      "Situational Analysis",
      "Draft Devolution Plan",
      "Stakeholder Consultation / Validation Report",
      "Final Devolution Plan",
      "A devolution governance architecture and M&E framework",
    ],
    changed:
      "Delivered the plan and architecture that operationalise health-sector devolution, validated with the Ministry of Health Senior Management Team. Adoption and rollout sit with the Ministry.",
    frameworks: [
      "Institutional & governance architecture",
      "Intergovernmental accountability design",
      "Decentralisation policy analysis",
    ],
    capabilities: [
      "Institutional analysis",
      "Governance & accountability design",
      "Intergovernmental coordination",
      "Stakeholder consultation",
      "Systems thinking",
    ],
    cta: "Operationalising a decentralisation or governance reform?",
  },
  {
    slug: "one-plan-one-budget-one-report",
    portfolio: "Policy",
    accent: "teal",
    title: "One plan, when everyone has their own priorities.",
    subtitle:
      "District implementation planning under HSSP III — One Plan, One Budget, One Report.",
    angle: "Fragmentation → alignment → one coherent plan.",
    attribution:
      "Founder experience · Ministry of Health, with FCDO & Global Health Initiative partners · 2025–26",
    geography: ["Malawi"],
    problem:
      "Multiple funders — the Global Fund, Gavi, the World Bank — the Ministry, and districts each carry their own priorities, producing fragmented plans, duplicated effort, and money that does not follow need.",
    complexity:
      "A rapidly shifting post-election donor landscape, a hard equity focus on women, children and newborns, and the need to build district capability — not just produce a plan.",
    approach: [
      "Provided embedded technical assistance to the Ministry of Health Department of Planning to strengthen the District Implementation Planning process.",
      "Supported districts to finalise cost-effective, risk-informed, equity-focused plans.",
      "Aligned Global Health Initiative resources to district-led planning, budgeting and monitoring.",
      "Built pathfinder case studies tracing facility plans up into district and national 'One Plan' mechanisms, using respectful maternal and neonatal care as the tracer.",
    ],
    created: [
      "Strengthened District Implementation Plans",
      "Pathfinder case studies",
      "Recommendations on planning cycles, training modalities and DIP guidelines",
      "Support to operationalise Direct Health Facility Financing",
    ],
    changed:
      "Designed to improve partner coordination, value-for-money and decentralised, locally owned planning. Recent work — outcomes emerging.",
    frameworks: [
      "One Plan, One Budget, One Report",
      "District Implementation Planning (HSSP III)",
      "Direct Health Facility Financing",
    ],
    capabilities: [
      "Operating inside government systems",
      "Planning & public financial management",
      "Donor alignment",
      "Equity-focused design",
      "Embedded advisory",
    ],
    cta: "Aligning partners around one government plan?",
  },
  {
    slug: "evidence-informed-decision-making",
    portfolio: "Policy",
    accent: "teal",
    title: "Evidence only creates value when institutions can use it.",
    subtitle:
      "An evidence-informed decision-making curriculum and mentorship across four countries.",
    angle: "A learning journey — from finding evidence to institutionalising its use.",
    attribution: "Founder experience · AFIDEP · 2023–24",
    geography: ["Malawi", "Uganda", "Kenya", "Nigeria"],
    problem:
      "Ministries are flooded with research but often cannot find, appraise and use it at the moment a policy window opens — so evidence rarely reaches the decision.",
    complexity:
      "Four countries with different systems, and a goal of institutionalised capability rather than a one-off workshop — which is why it ran as a curriculum plus a six-month mentorship.",
    approach: [
      "Designed and delivered an EIDM curriculum and six-month mentorship for 14 Ministry of Health officials across Malawi, Uganda, Kenya and Nigeria.",
      "Built the journey the training teaches: understand the role of evidence, find it, appraise it, frame the policy question, develop a brief, identify the policy window, engage decision-makers, institutionalise use.",
      "Mapped policy windows and developed a stakeholder-engagement strategy and matrix.",
      "Coached officials to draft high-impact policy briefs and champion EIDM inside their ministries.",
    ],
    created: [
      "The EIDM curriculum and mentorship model",
      "Policy briefs authored by the officials",
      "A stakeholder-engagement strategy and matrix",
      "Policy-window maps",
    ],
    changed:
      "Strengthened officials' capacity to draft high-impact briefs and champion the institutionalisation of evidence use within their ministries.",
    frameworks: [
      "EIDM curriculum & mentorship model",
      "Evidence appraisal",
      "Policy-window mapping",
    ],
    capabilities: [
      "Capability building",
      "Evidence synthesis & appraisal",
      "Policy translation",
      "Mentorship",
      "Institutionalisation",
    ],
    cta: "Building a ministry's capacity to use evidence?",
  },
];

const IMPLEMENTATION: Story[] = [
  {
    slug: "fact-delivery-operating-system",
    portfolio: "Implementation",
    accent: "green",
    title: "What it takes to run several complex programmes at once.",
    subtitle: "Director of Programmes & Strategy, FACT.",
    angle: "A delivery operating system — the machine behind delivery.",
    attribution: "Founder experience · FACT · 2021–22",
    geography: ["Malawi"],
    problem:
      "Donors fund programmes; what makes several of them actually deliver at the same time is an operating system most organisations underbuild — and it is invisible until it fails.",
    complexity:
      "Five donor-funded programmes in parallel — United Nations Trust Fund, USAID, EGPAF and the Global Fund — three of them HIV/SRHR, with a multidisciplinary team of more than 12 and different compliance regimes at once.",
    approach: [
      "Ran delivery across the organisation through an explicit operating system: people, planning, finance, procurement, MEAL, safeguarding, reporting, stakeholder management and adaptive management.",
      "Led recruitment, supervision and performance management of the programmes team.",
      "Held donor compliance alongside the Executive Director and Director of Finance.",
      "Used monitoring, evaluation and learning to drive adaptive programming.",
    ],
    created: [
      "A Community Outreach Model for TB adopted as the organisation-wide approach",
      "The 'Bola ya Moto' youth HIV intervention",
      "Competitive USAID and Global Fund grants won",
    ],
    changed:
      "The TB Community Outreach Model was institutionalised and is still used across all of FACT's health projects.",
    frameworks: [
      "Delivery operating model",
      "Adaptive management",
      "MEAL systems",
    ],
    capabilities: [
      "Operational leadership",
      "Multi-donor compliance",
      "Team leadership",
      "Adaptive management",
      "Resource mobilisation",
    ],
    cta: "Standing up or rescuing a complex delivery portfolio?",
  },
  {
    slug: "kuhes-idsr-hiv",
    portfolio: "Implementation",
    accent: "green",
    title: "Making HIV visible to the systems that watch for outbreaks.",
    subtitle:
      "Strengthening community-anchored IDSR-HIV surveillance under the Blantyre HIV Prevention Strategy.",
    angle: "A surveillance system — from community hotspots to national response.",
    attribution:
      "Founder experience · KUHeS, Blantyre HIV Prevention Strategy (Gates-funded) · 2022–23",
    geography: ["Malawi", "Blantyre"],
    problem:
      "HIV prevention depends on knowing where transmission is actually happening — but HIV has sat outside the routine Integrated Disease Surveillance and Response (IDSR) system that districts use to detect and respond to outbreaks, and the community organisations closest to transmission hotspots often cannot feed data into it. Hotspots stay invisible until late.",
    complexity:
      "Embedding HIV into IDSR across district and national levels, and building case-based and event-based surveillance capacity in community organisations, meant confronting the institutional, technical, reporting, coordination and resourcing gaps that constrain community-anchored surveillance.",
    approach: [
      "Conducted health-systems and policy assessments for the Blantyre HIV Prevention Strategy, a Gates-funded initiative to strengthen HIV surveillance, prevention and response.",
      "Provided technical input on embedding HIV into the Integrated Disease Surveillance and Response system (IDSR-HIV) as a core part of outbreak detection, preparedness and response at district and national levels.",
      "Served as the KUHeS focal person in the consortium, and led monitoring, evaluation and a systematic assessment of Ministry of Health capacity to implement IDSR-HIV.",
      "Assessed community-based organisations' readiness for case-based and event-based surveillance in transmission hotspots, then designed and delivered capacity-building on surveillance reporting, data verification and routine data use.",
    ],
    created: [
      "Analytical assessment reports on IDSR-HIV readiness and system gaps",
      "Capacity and gap assessments of community organisations across transmission hotspots",
      "A capacity-development package for community and district surveillance actors",
      "Policy briefs and communication materials for Ministry of Health decision-making",
    ],
    changed:
      "Generated the evidence and capacity to integrate HIV into routine surveillance and emergency preparedness, and fed Blantyre HIV Prevention Strategy evidence into national Health Technical Working Group discussions on surveillance integration.",
    frameworks: [
      "Integrated Disease Surveillance & Response (IDSR)",
      "Case-based & event-based surveillance",
      "Health-systems & capacity assessment",
      "Routine data use for decision-making",
    ],
    capabilities: [
      "Health-systems & surveillance strengthening",
      "Monitoring & evaluation",
      "Community-systems capacity building",
      "Evidence-to-policy",
      "Government engagement",
    ],
    cta: "Strengthening disease surveillance or community data systems?",
  },
  {
    slug: "reaching-people-outside-the-clinic",
    portfolio: "Implementation",
    accent: "green",
    title: "Reaching people who never walk into a clinic.",
    subtitle: "Community TB outreach and youth HIV mobilisation.",
    angle: "A human-centred field story — community to follow-up.",
    attribution: "Founder experience · FACT & the LIGHT photovoice work · 2017–24",
    geography: ["Malawi"],
    problem:
      "The people most affected by TB and HIV are often those least likely to present at a facility. Services that wait passively never reach them.",
    complexity:
      "It turns on trust, stigma and demand — especially among young people and men — none of which a clinical protocol alone creates.",
    approach: [
      "Built a community outreach model for TB: community, trust, mobilisation, demand creation, screening, referral, treatment and follow-up.",
      "Designed 'Bola ya Moto' ('A Ball of Fire'), using sports-based mobilisation to lift youth demand for and uptake of HIV services.",
      "Led a participatory photovoice study capturing the lived experience of young people affected by TB and HIV in Lilongwe.",
    ],
    created: [
      "The Community Outreach Model for TB, adopted organisation-wide",
      "The 'Bola ya Moto' youth HIV intervention",
      "A photovoice body of work disseminated at the KUHeS conference and the Global Symposium on Health Systems Research (Nagasaki, 2024)",
    ],
    changed:
      "The model was institutionalised across FACT's health projects; the youth intervention improved demand for and uptake of HIV services among young people.",
    frameworks: [
      "Community outreach model",
      "Positive masculinities / gender-transformative approaches",
      "Human-centred delivery design",
    ],
    capabilities: [
      "Human-centred delivery design",
      "Community mobilisation & demand creation",
      "Participatory research",
      "Gender-transformative programming",
    ],
    cta: "Designing delivery around people, not facilities?",
  },
];

export const STORIES: Story[] = [...EVIDENCE, ...POLICY, ...IMPLEMENTATION];

export const PORTFOLIOS: Portfolio[] = ["Evidence", "Policy", "Implementation"];

export const PORTFOLIO_BLURB: Record<Portfolio, string> = {
  Evidence: "Understand the problem. Generate evidence. Evaluate what actually works.",
  Policy: "Turn evidence and system realities into better decisions, policies and institutions.",
  Implementation: "Turn strategies into functioning programmes and delivery systems.",
};

export const ACCENT_CLASSES: Record<
  Story["accent"],
  { text: string; bg: string; border: string; dot: string }
> = {
  navy: { text: "text-brand-navy", bg: "bg-brand-navy", border: "border-brand-navy", dot: "bg-brand-navy" },
  teal: { text: "text-brand-teal", bg: "bg-brand-teal", border: "border-brand-teal", dot: "bg-brand-teal" },
  green: { text: "text-brand-green", bg: "bg-brand-green", border: "border-brand-green", dot: "bg-brand-green" },
};

/** Thematic banner image per story (atmospheric — not a claim that the photo is from the engagement). */
export const STORY_IMAGE: Record<string, string> = {
  "supreme-lifelines": "/images/thematic-health.jpg",
  "frontline-aids-financing-intelligence": "/images/thematic-governance.jpg",
  "evaluation-as-a-decision-tool": "/images/hero-approach.jpg",
  "malawi-health-devolution": "/images/hero-about.jpg",
  "one-plan-one-budget-one-report": "/images/hero-work.jpg",
  "evidence-informed-decision-making": "/images/hero-why.jpg",
  "fact-delivery-operating-system": "/images/hero-home.jpg",
  "kuhes-idsr-hiv": "/images/thematic-health.jpg",
  "reaching-people-outside-the-clinic": "/images/thematic-education.jpg",
};

export function storyImage(slug: string): string {
  return STORY_IMAGE[slug] ?? "/images/hero-thematic.jpg";
}

export function getStory(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug);
}

export const FEATURED_SLUGS = [
  "malawi-health-devolution",
  "frontline-aids-financing-intelligence",
  "supreme-lifelines",
];

export function featuredStories(): Story[] {
  return FEATURED_SLUGS.map((s) => getStory(s)!).filter(Boolean);
}
