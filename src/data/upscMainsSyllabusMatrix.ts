/**
 * Official UPSC Civil Services Mains Syllabus & Topic-Theme Taxonomy
 * Direct mapping of every official syllabus sub-point from the UPSC Gazette Notification
 * across GS 1, GS 2, GS 3, GS 4, Essay, and Law Optional (2013–2026).
 */

export interface SyllabusSubtopic {
  id: string;
  paper: string;
  code: string; // e.g. "GS1-01"
  title: string;
  officialText: string;
  themeKeywords: string[];
  frequentYears: string[];
  importanceWeight: "Core (Very High)" | "High" | "Moderate";
  typicalQuestionsPerCycle: string;
  description: string;
}

export const UPSC_OFFICIAL_SYLLABUS_MATRIX: Record<string, SyllabusSubtopic[]> = {
  "General Studies 1": [
    {
      id: "gs1-art-culture",
      paper: "General Studies 1",
      code: "GS1-01",
      title: "Art Forms, Literature & Architecture",
      officialText: "Indian culture will cover the salient aspects of Art Forms, literature and Architecture from ancient to modern times.",
      themeKeywords: ["Architecture", "Art & Architecture", "Sculpture", "Temple", "Literature", "Rock-cut", "Mughal", "Mauryan", "Buddhism"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "3–4 questions (35–45 Marks)",
      description: "Covers ancient rock-cut caves, Gandhara/Mathura sculpture, temple architecture (Nagara, Dravida, Vesara), Bhakti/Sufi literature, and medieval architectural synthesis."
    },
    {
      id: "gs1-modern-history",
      paper: "General Studies 1",
      code: "GS1-02",
      title: "Modern Indian History (Mid-18th Century to Present)",
      officialText: "Modern Indian history from about the middle of the eighteenth century until the present- significant events, personalities, issues.",
      themeKeywords: ["Modern History", "British Rule", "Socio-Religious Reform", "Colonial Economy", "Land Revenue"],
      frequentYears: ["2013", "2015", "2017", "2019", "2021", "2023", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Deconstructs the decline of Mughals, Battle of Plassey/Buxar, British administrative expansion, drain of wealth, and 19th-century reform movements."
    },
    {
      id: "gs1-freedom-struggle",
      paper: "General Studies 1",
      code: "GS1-03",
      title: "The Freedom Struggle & Contributors",
      officialText: "The Freedom Struggle — its various stages and important contributors/contributions from different parts of the country.",
      themeKeywords: ["Freedom Struggle", "Gandhian Era", "Tribal Uprisings", "Peasant Movements", "Revolutionary Movement", "INA"],
      frequentYears: ["2013", "2014", "2016", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "3–4 questions (35–50 Marks)",
      description: "From 1857 Revolt to Non-Cooperation, Civil Disobedience, Quit India, and regional revolutionary movements across Bengal, Maharashtra, and North-East."
    },
    {
      id: "gs1-post-independence",
      paper: "General Studies 1",
      code: "GS1-04",
      title: "Post-Independence Consolidation & Reorganization",
      officialText: "Post-independence consolidation and reorganization within the country.",
      themeKeywords: ["Post-Independence", "State Reorganization", "Tribal Integration", "Linguistic States", "Green Revolution", "Emergency"],
      frequentYears: ["2013", "2014", "2016", "2018", "2020", "2022", "2024"],
      importanceWeight: "High",
      typicalQuestionsPerCycle: "1–2 questions (10–25 Marks)",
      description: "Integration of Princely States, States Reorganisation Act 1956, Official Language dispute, boundary disputes, and tribal development policies."
    },
    {
      id: "gs1-world-history",
      paper: "General Studies 1",
      code: "GS1-05",
      title: "History of the World (18th Century Onwards)",
      officialText: "History of the world will include events from 18th century such as industrial revolution, world wars, redrawal of national boundaries, colonization, decolonization, political philosophies like communism, capitalism, socialism etc.— their forms and effect on the society.",
      themeKeywords: ["World History", "Industrial Revolution", "World War", "Decolonization", "Fascism", "Cold War", "French Revolution"],
      frequentYears: ["2013", "2014", "2015", "2016", "2019", "2021", "2023"],
      importanceWeight: "High",
      typicalQuestionsPerCycle: "1–2 questions (10–25 Marks)",
      description: "Industrial Revolution, American & French Revolutions, Imperialism in Africa/Asia, Inter-war crises, and post-WWII decolonization dynamics."
    },
    {
      id: "gs1-indian-society",
      paper: "General Studies 1",
      code: "GS1-06",
      title: "Salient Features of Indian Society & Diversity",
      officialText: "Salient features of Indian Society, Diversity of India.",
      themeKeywords: ["Indian Society", "Caste System", "Kinship", "Multiculturalism", "Linguistic Diversity", "Religious Pluralism"],
      frequentYears: ["2013", "2015", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Covers unity in diversity, caste transformations, Sanskritization, tribal assimilation, and changing joint-family dynamics."
    },
    {
      id: "gs1-women-demography",
      paper: "General Studies 1",
      code: "GS1-07",
      title: "Role of Women, Population & Urbanization",
      officialText: "Role of women and women’s organization, population and associated issues, poverty and developmental issues, urbanization, their problems and their remedies.",
      themeKeywords: ["Role of Women", "Urbanization", "Demographic Aging", "Smart Cities", "Migration", "Slums", "Fertility Rate"],
      frequentYears: ["2014", "2015", "2016", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Female labour force participation, demographic dividend vs aging, urban flooding, smart cities mission, and informal urban settlements."
    },
    {
      id: "gs1-globalization",
      paper: "General Studies 1",
      code: "GS1-08",
      title: "Effects of Globalization on Indian Society",
      officialText: "Effects of globalization on Indian society.",
      themeKeywords: ["Globalization", "Glocalization", "Cultural Hybridization", "Consumerism", "Elderly Care", "Agrarian Crisis"],
      frequentYears: ["2013", "2015", "2016", "2018", "2020", "2022", "2024"],
      importanceWeight: "High",
      typicalQuestionsPerCycle: "1–2 questions (10–25 Marks)",
      description: "Impact on local cultures, culinary practices, language erosion, gig economy, and intergenerational values."
    },
    {
      id: "gs1-social-empowerment",
      paper: "General Studies 1",
      code: "GS1-09",
      title: "Social Empowerment, Communalism, Regionalism & Secularism",
      officialText: "Social empowerment, communalism, regionalism & secularism.",
      themeKeywords: ["Social Empowerment", "Communalism", "Regionalism", "Secularism", "Affirmative Action", "Identity Politics"],
      frequentYears: ["2013", "2014", "2016", "2017", "2018", "2020", "2022", "2023", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "1–2 questions (15–25 Marks)",
      description: "Indian vs Western secularism, sons of the soil doctrine, regional aspirations, and empowerment of historically marginalized communities."
    },
    {
      id: "gs1-physical-geography",
      paper: "General Studies 1",
      code: "GS1-10",
      title: "Salient Features of World's Physical Geography",
      officialText: "Salient features of world’s physical geography.",
      themeKeywords: ["Physical Geography", "Geomorphology", "Plate Tectonics", "Ocean Currents", "Monsoon", "Climatology"],
      frequentYears: ["2013", "2014", "2015", "2017", "2018", "2019", "2021", "2022", "2023", "2024", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "3–4 questions (35–50 Marks)",
      description: "Plate boundary interactions, volcanic belts, sea-floor spreading, atmospheric circulation cells, jet streams, and thermohaline ocean circulation."
    },
    {
      id: "gs1-resource-distribution",
      paper: "General Studies 1",
      code: "GS1-11",
      title: "Distribution of Natural Resources & Location of Industries",
      officialText: "Distribution of key natural resources across the world (including South Asia and the Indian sub-continent); factors responsible for the location of primary, secondary, and tertiary sector industries in various parts of the world (including India).",
      themeKeywords: ["Resource Distribution", "Industrial Location", "Raw Materials", "Iron & Steel", "IT Clustering", "Critical Minerals"],
      frequentYears: ["2013", "2014", "2015", "2016", "2018", "2020", "2022", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Footloose industries, Weberian industrial location theory, mineral belts of Gondwana, renewable energy hubs, and semiconductor manufacturing clusters."
    },
    {
      id: "gs1-geophysical-phenomena",
      paper: "General Studies 1",
      code: "GS1-12",
      title: "Geophysical Phenomena (Earthquakes, Tsunamis, Cyclones, Ice-caps)",
      officialText: "Important Geophysical phenomena such as earthquakes, Tsunami, Volcanic activity, cyclone etc., geographical features and their location-changes in critical geographical features (including water-bodies and ice-caps) and in flora and fauna and the effects of such changes.",
      themeKeywords: ["Geophysical Phenomena", "Earthquakes", "Tsunami", "Cyclone", "Cryosphere", "Permafrost Thaw", "Coral Bleaching"],
      frequentYears: ["2014", "2015", "2016", "2017", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Tropical vs temperate cyclones, Arabian Sea cyclogenesis, Arctic amplification, Himalayan glacier retreat, and dead coral ecosystems."
    }
  ],

  "General Studies 2": [
    {
      id: "gs2-constitution-evolution",
      paper: "General Studies 2",
      code: "GS2-01",
      title: "Indian Constitution: Historical Underpinnings & Basic Structure",
      officialText: "Indian Constitution—historical underpinnings, evolution, features, amendments, significant provisions and basic structure.",
      themeKeywords: ["Constitution", "Basic Structure", "Preamble", "Judicial Review", "Kesavananda Bharati", "Constitutional Amendments"],
      frequentYears: ["2013", "2015", "2017", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Genesis from GoI Acts 1919/1935, Constituent Assembly debates, Art 368 vs Art 13, and judicial expansion of the Basic Structure doctrine."
    },
    {
      id: "gs2-federalism",
      paper: "General Studies 2",
      code: "GS2-02",
      title: "Federal Structure, Devolution of Powers & Local Governance",
      officialText: "Functions and responsibilities of the Union and the States, issues and challenges pertaining to the federal structure, devolution of powers and finances up to local levels and challenges therein.",
      themeKeywords: ["Federalism", "Cooperative Federalism", "Governor", "Panchayati Raj", "Finance Commission", "Inter-State River Disputes", "Article 356"],
      frequentYears: ["2013", "2014", "2016", "2017", "2018", "2019", "2021", "2022", "2023", "2024", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "3–4 questions (35–45 Marks)",
      description: "Asymmetric federalism (Art 371), fiscal federalism post-GST, 73rd/74th Constitutional Amendments, State Finance Commissions, and municipal financial autonomy."
    },
    {
      id: "gs2-separation-powers",
      paper: "General Studies 2",
      code: "GS2-03",
      title: "Separation of Powers & Dispute Redressal Mechanisms",
      officialText: "Separation of powers between various organs dispute redressal mechanisms and institutions.",
      themeKeywords: ["Separation of Powers", "Judicial Activism", "Judicial Overreach", "Tribunals", "Lokpal", "Ombudsman"],
      frequentYears: ["2014", "2015", "2018", "2019", "2020", "2021", "2023", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "1–2 questions (15–25 Marks)",
      description: "Checks and balances, Montesquieu doctrine in Indian context, National Green Tribunal (NGT), and executive encroaching on legislative domains via ordinances."
    },
    {
      id: "gs2-comparative-constitutions",
      paper: "General Studies 2",
      code: "GS2-04",
      title: "Comparison of Indian Constitutional Scheme with Other Countries",
      officialText: "Comparison of the Indian constitutional scheme with that of other countries.",
      themeKeywords: ["Comparative Constitution", "UK Constitution", "US Constitution", "French Secularism", "German Basic Law"],
      frequentYears: ["2013", "2015", "2018", "2019", "2020", "2021", "2022", "2024", "2025"],
      importanceWeight: "High",
      typicalQuestionsPerCycle: "1–2 questions (10–25 Marks)",
      description: "Indian vs British parliamentary sovereignty, US vs Indian federal presidential pardon (Art 72), French laïcité vs Indian secularism, and South African fundamental rights."
    },
    {
      id: "gs2-parliament-legislatures",
      paper: "General Studies 2",
      code: "GS2-05",
      title: "Parliament & State Legislatures: Functioning & Privileges",
      officialText: "Parliament and State legislatures—structure, functioning, conduct of business, powers & privileges and issues arising out of these.",
      themeKeywords: ["Parliament", "Anti-Defection", "Tenth Schedule", "Speaker", "Parliamentary Committees", "Legislative Decline", "Money Bill"],
      frequentYears: ["2014", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Decline in parliamentary sittings, bypass of departmental standing committees, misuse of money bill classification, and reform of the Speaker's office."
    },
    {
      id: "gs2-judiciary-executive",
      paper: "General Studies 2",
      code: "GS2-06",
      title: "Structure & Functioning of Executive and Judiciary",
      officialText: "Structure, organization and functioning of the Executive and the Judiciary—Ministries and Departments of the Government; pressure groups and formal/informal associations and their role in the Polity.",
      themeKeywords: ["Judiciary", "Collegium System", "NJAC", "Pressure Groups", "Master of Roster", "Judicial Pendency", "All India Judicial Service"],
      frequentYears: ["2013", "2015", "2017", "2019", "2020", "2022", "2023", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Collegium vs Executive appointment conflicts, judicial vacancies, case backlog, agrarian/business pressure groups, and PIL misuse."
    },
    {
      id: "gs2-rpa",
      paper: "General Studies 2",
      code: "GS2-07",
      title: "Salient Features of the Representation of the People Act",
      officialText: "Salient features of the Representation of People’s Act.",
      themeKeywords: ["Representation of People Act", "RPA 1951", "Elections", "Disqualification of MPs", "Electoral Reforms", "Corrupt Practices"],
      frequentYears: ["2013", "2015", "2016", "2017", "2019", "2020", "2022", "2024", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "1–2 questions (10–20 Marks)",
      description: "Section 8 criminalization disqualifications, Section 123 corrupt practices/hate speech, electoral bonds, political party funding transparency, and EVM/VVPAT verification."
    },
    {
      id: "gs2-constitutional-bodies",
      paper: "General Studies 2",
      code: "GS2-08",
      title: "Constitutional & Quasi-Judicial Bodies",
      officialText: "Appointment to various Constitutional posts, powers, functions and responsibilities of various Constitutional Bodies. Statutory, regulatory and various quasi-judicial bodies.",
      themeKeywords: ["Constitutional Bodies", "Election Commission", "CAG", "UPSC", "Finance Commission", "NHRC", "CBI", "CVC", "Competition Commission"],
      frequentYears: ["2013", "2014", "2016", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Institutional autonomy of ECI, CAG as friend/philosopher/guide, CVC Act, CBI police establishment vs federal consent, and NHRC toothless tiger debates."
    },
    {
      id: "gs2-civil-society",
      paper: "General Studies 2",
      code: "GS2-09",
      title: "Development Processes, NGOs, SHGs & Stakeholders",
      officialText: "Development processes and the development industry —the role of NGOs, SHGs, various groups and associations, donors, charities, institutional and other stakeholders.",
      themeKeywords: ["NGOs", "SHGs", "Civil Society", "FCRA", "Microfinance", "Kudumbashree", "Self-Help Groups"],
      frequentYears: ["2013", "2014", "2015", "2017", "2019", "2021", "2022", "2023", "2024"],
      importanceWeight: "High",
      typicalQuestionsPerCycle: "1–2 questions (15–25 Marks)",
      description: "Women empowerment through SHG-bank linkage, Foreign Contribution Regulation Act (FCRA) amendments, and civil society advocacy in policy drafting."
    },
    {
      id: "gs2-welfare-vulnerable",
      paper: "General Studies 2",
      code: "GS2-10",
      title: "Welfare Schemes, Mechanisms & Laws for Vulnerable Sections",
      officialText: "Welfare schemes for vulnerable sections of the population by the Centre and States and the performance of these schemes; mechanisms, laws, institutions and Bodies constituted for the protection and betterment of these vulnerable sections.",
      themeKeywords: ["Welfare Schemes", "Vulnerable Sections", "SC/ST Atrocities Act", "Transgender Persons Act", "Disability Rights", "Elderly Protection"],
      frequentYears: ["2013", "2014", "2015", "2017", "2019", "2020", "2021", "2022", "2023", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Rights of Persons with Disabilities Act, POSH Act, National Commission for Scheduled Tribes, Forest Rights Act 2006, and PM-JANMAN for PVTGs."
    },
    {
      id: "gs2-health-education-hunger",
      paper: "General Studies 2",
      code: "GS2-11",
      title: "Social Sector: Health, Education, Human Capital, Poverty & Hunger",
      officialText: "Issues relating to development and management of Social Sector/Services relating to Health, Education, Human Resources. Issues relating to poverty and hunger.",
      themeKeywords: ["Health", "Education", "Human Capital", "Poverty & Hunger", "Ayushman Bharat", "National Education Policy", "Global Hunger Index"],
      frequentYears: ["2014", "2015", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Out-of-pocket health expenditures, primary healthcare infrastructure, NEP 2020 vocationalization, multidimensional poverty index (MPI), and stunting/wasting in Poshan Abhiyaan."
    },
    {
      id: "gs2-governance-accountability",
      paper: "General Studies 2",
      code: "GS2-12",
      title: "Governance, Transparency, E-Governance & Role of Civil Services",
      officialText: "Important aspects of governance, transparency and accountability, e-governance- applications, models, successes, limitations, and potential; citizens charters, transparency & accountability and institutional and other measures. Role of civil services in a democracy.",
      themeKeywords: ["Governance", "E-Governance", "Right to Information", "Citizen Charter", "Civil Services Reform", "Mission Karmayogi", "Lateral Entry"],
      frequentYears: ["2013", "2014", "2016", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Direct Benefit Transfer (DBT), Digital Personal Data Protection Act, RTI exemptions under Sec 8, Sevottam model, and civil service neutrality vs commitment."
    },
    {
      id: "gs2-international-relations",
      paper: "General Studies 2",
      code: "GS2-13",
      title: "India & Neighborhood, Global Groupings & Geopolitics",
      officialText: "India and its neighborhood- relations. Bilateral, regional and global groupings and agreements involving India and/or affecting India’s interests. Effect of policies and politics of developed and developing countries on India’s interests, Indian diaspora. Important International institutions, agencies and fora- their structure, mandate.",
      themeKeywords: ["International Relations", "Neighborhood First", "Indo-Pacific", "QUAD", "BRICS", "SCO", "WTO", "UNSC Reforms", "Diaspora", "IMEC"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "4–5 questions (50–65 Marks)",
      description: "Strategic autonomy, SAGAR initiative, cross-border infrastructure in Nepal/Bangladesh, China-Pakistan Economic Corridor (CPEC), WTO dispute settlement paralysis, and UNSC expansion."
    }
  ],

  "General Studies 3": [
    {
      id: "gs3-macroeconomy",
      paper: "General Studies 3",
      code: "GS3-01",
      title: "Indian Economy, Resource Mobilization & Inclusive Growth",
      officialText: "Indian Economy and issues relating to planning, mobilization, of resources, growth, development and employment. Inclusive growth and issues arising from it.",
      themeKeywords: ["Macroeconomics", "Inclusive Growth", "Resource Mobilization", "Employment", "Jobless Growth", "K-shaped Recovery", "GDP vs HDI"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "Formalization of the informal economy, demographic dividend, private corporate capital expenditure, and structural bottlenecks in manufacturing."
    },
    {
      id: "gs3-budgeting-fiscal",
      paper: "General Studies 3",
      code: "GS3-02",
      title: "Government Budgeting & Fiscal Policy",
      officialText: "Government Budgeting.",
      themeKeywords: ["Budgeting", "Fiscal Deficit", "FRBM Act", "Capital Expenditure", "Capex", "Direct Tax Reforms", "GST Compensation"],
      frequentYears: ["2013", "2015", "2017", "2018", "2021", "2022", "2023", "2024"],
      importanceWeight: "High",
      typicalQuestionsPerCycle: "1–2 questions (10–25 Marks)",
      description: "Revenue vs capital expenditure quality, off-budget borrowings, FRBM target glide paths, and tax-to-GDP ratio enhancement."
    },
    {
      id: "gs3-agriculture-irrigation",
      paper: "General Studies 3",
      code: "GS3-03",
      title: "Cropping Patterns, Irrigation, Storage & Agri-Marketing",
      officialText: "Major crops-cropping patterns in various parts of the country, - different types of irrigation and irrigation systems storage, transport and marketing of agricultural produce and issues and related constraints; e-technology in the aid of farmers.",
      themeKeywords: ["Agriculture", "Cropping Patterns", "Irrigation", "Micro-Irrigation", "Agri-Marketing", "e-NAM", "Cold Storage", "Precision Farming"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "3–4 questions (35–50 Marks)",
      description: "Crop diversification from paddy-wheat monoculture, PM Krishi Sinchayee Yojana, post-harvest losses, electronic National Agriculture Market, and Kisan Drones."
    },
    {
      id: "gs3-msp-pds-foodsecurity",
      paper: "General Studies 3",
      code: "GS3-04",
      title: "Farm Subsidies, MSP, PDS & Food Security",
      officialText: "Issues related to direct and indirect farm subsidies and minimum support prices; Public Distribution System- objectives, functioning, limitations, revamping; issues of buffer stocks and food security; Technology missions; economics of animal-rearing.",
      themeKeywords: ["Farm Subsidies", "MSP", "Public Distribution System", "Food Security", "Buffer Stocks", "FCI", "NFSA 2013", "PM Garib Kalyan Anna Yojana"],
      frequentYears: ["2013", "2014", "2015", "2016", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "WTO Agreement on Agriculture (Peace Clause/Amber Box), economic cost of food grains at FCI, direct fertilizer subsidy transfers, and legal guarantee for MSP."
    },
    {
      id: "gs3-food-processing",
      paper: "General Studies 3",
      code: "GS3-05",
      title: "Food Processing & Supply Chain Management",
      officialText: "Food processing and related industries in India- scope and significance, location, upstream and downstream requirements, supply chain management.",
      themeKeywords: ["Food Processing", "Supply Chain", "Mega Food Parks", "PM FME Scheme", "Contract Farming", "Value Addition"],
      frequentYears: ["2013", "2014", "2015", "2017", "2019", "2020", "2022", "2024", "2025"],
      importanceWeight: "High",
      typicalQuestionsPerCycle: "1–2 questions (10–20 Marks)",
      description: "Reducing agricultural wastage, Mega Food Park infrastructure, supply chain cold linkages, and backward-forward integration."
    },
    {
      id: "gs3-land-reforms",
      paper: "General Studies 3",
      code: "GS3-06",
      title: "Land Reforms & Tenancy Structure",
      officialText: "Land reforms in India.",
      themeKeywords: ["Land Reforms", "Tenancy", "Land Ceiling", "Digitization of Land Records", "SVAMITVA Scheme", "Fragmented Holdings"],
      frequentYears: ["2013", "2016", "2018", "2020", "2021", "2023"],
      importanceWeight: "Moderate",
      typicalQuestionsPerCycle: "1 question (10–15 Marks)",
      description: "Zamindari abolition success vs tenancy regulation failure, ceiling surplus redistribution, and digital land records under DILRMP."
    },
    {
      id: "gs3-industry-infrastructure",
      paper: "General Studies 3",
      code: "GS3-07",
      title: "Industrial Policy, Liberalization, Infrastructure & Investment Models",
      officialText: "Effects of liberalization on the economy, changes in industrial policy and their effects on industrial growth. Infrastructure: Energy, Ports, Roads, Airports, Railways etc. Investment models.",
      themeKeywords: ["Infrastructure", "Industrial Policy", "PPP Models", "PM GatiShakti", "Dedicated Freight Corridors", "National Logistics Policy", "PLI Scheme"],
      frequentYears: ["2013", "2014", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (25–35 Marks)",
      description: "HAM vs BOT models in highways, logistics cost reduction, Production Linked Incentive (PLI) impact on domestic manufacturing, and renewable power transmission grids."
    },
    {
      id: "gs3-science-technology",
      paper: "General Studies 3",
      code: "GS3-08",
      title: "Science & Technology: IT, Space, Robotics, Biotech & IPR",
      officialText: "Science and Technology- developments and their applications and effects in everyday life. Achievements of Indians in science & technology; indigenization of technology and developing new technology. Awareness in the fields of IT, Space, Computers, robotics, nano-technology, bio-technology and issues relating to intellectual property rights.",
      themeKeywords: ["Science & Technology", "Space Technology", "ISRO", "Artificial Intelligence", "Generative AI", "Quantum Computing", "CRISPR", "IPR", "Semiconductors"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "3–4 questions (35–50 Marks)",
      description: "Chandrayaan/Aditya-L1, IndiaAI Mission, National Quantum Mission, genome editing regulations, standard essential patents, and semiconductor fabrication ecosystem."
    },
    {
      id: "gs3-environment-biodiversity",
      paper: "General Studies 3",
      code: "GS3-09",
      title: "Environment Conservation, Pollution & Environmental Impact Assessment",
      officialText: "Conservation, environmental pollution and degradation, environmental impact assessment.",
      themeKeywords: ["Environment", "Climate Change", "Net Zero 2070", "EIA", "Plastic Pollution", "Renewable Energy", "Wetlands", "Air Quality"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "3–4 questions (35–50 Marks)",
      description: "COP climate negotiations, Panchamrit targets, draft EIA notification controversies, single-use plastic enforcement, and Delhi-NCR smog mitigation."
    },
    {
      id: "gs3-disaster-management",
      paper: "General Studies 3",
      code: "GS3-10",
      title: "Disaster Management & Sendai Framework",
      officialText: "Disaster and disaster management.",
      themeKeywords: ["Disaster Management", "Sendai Framework", "NDMA", "GLOF", "Urban Floods", "Landslides", "Early Warning Systems"],
      frequentYears: ["2013", "2014", "2016", "2017", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "1–2 questions (15–25 Marks)",
      description: "Shift from relief-centric to proactive mitigation, Sendai Framework 2015–2030 priorities, community-based disaster risk reduction, and Wayanad-style landslide resilience."
    },
    {
      id: "gs3-internal-security",
      paper: "General Studies 3",
      code: "GS3-11",
      title: "Internal Security, Extremism, Border Management, Cyber & Money Laundering",
      officialText: "Linkages between development and spread of extremism. Role of external state and non-state actors in creating challenges to internal security. Challenges to internal security through communication networks, the role of media and social networking sites in internal security challenges, basics of cyber security; money-laundering and its prevention. Security challenges and their management in border areas - linkages of organized crime with terrorism. Various Security forces and agencies and their mandate.",
      themeKeywords: ["Internal Security", "Left Wing Extremism", "Cybersecurity", "Border Management", "Money Laundering", "PMLA", "AFSPA", "Organized Crime", "Deepfakes"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "4–5 questions (50–65 Marks)",
      description: "LWE surrender policies & red corridor contraction, Comprehensive Integrated Border Management System (CIBMS), narco-terror networks in Punjab/J&K, CERT-In rules, and Prevention of Money Laundering Act enforcement."
    }
  ],

  "General Studies 4": [
    {
      id: "gs4-ethics-human-interface",
      paper: "General Studies 4",
      code: "GS4-01",
      title: "Ethics & Human Interface: Essence, Determinants & Consequences",
      officialText: "Ethics and Human Interface: Essence, determinants and consequences of Ethics in-human actions; dimensions of ethics; ethics - in private and public relationships.",
      themeKeywords: ["Ethics & Human Interface", "Determinants of Ethics", "Public vs Private Ethics", "Consequentialism", "Deontology", "Virtue Ethics"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (20–30 Marks)",
      description: "Distinguishing morality, religion, law, and ethics; ethical consequences in administrative policy; ethical dilemmas between private loyalty and public duty."
    },
    {
      id: "gs4-human-values-leaders",
      paper: "General Studies 4",
      code: "GS4-02",
      title: "Human Values & Role of Family, Society and Education",
      officialText: "Human Values - lessons from the lives and teachings of great leaders, reformers and administrators; role of family, society and educational institutions in inculcating values.",
      themeKeywords: ["Human Values", "Lessons from Leaders", "Family & Values", "Moral Education", "Value Erosion"],
      frequentYears: ["2013", "2015", "2016", "2018", "2019", "2020", "2022", "2023", "2024"],
      importanceWeight: "High",
      typicalQuestionsPerCycle: "1–2 questions (10–20 Marks)",
      description: "Teachings of Swami Vivekananda, APJ Abdul Kalam, Nelson Mandela, Kabir, Buddha, and institutional mechanisms in schools/families."
    },
    {
      id: "gs4-attitude-persuasion",
      paper: "General Studies 4",
      code: "GS4-03",
      title: "Attitude: Structure, Function & Social Influence",
      officialText: "Attitude: content, structure, function; its influence and relation with thought and behaviour; moral and political attitudes; social influence and persuasion.",
      themeKeywords: ["Attitude", "CAB Model", "Persuasion", "Social Influence", "Behavioral Nudge", "Prejudice", "Stereotypes"],
      frequentYears: ["2013", "2014", "2016", "2017", "2018", "2020", "2021", "2022", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "1–2 questions (10–20 Marks)",
      description: "Cognitive-Affective-Behavioral (CAB) triad, behavioral nudges in Swachh Bharat and Beti Bachao campaigns, and overcoming deep-seated administrative bias."
    },
    {
      id: "gs4-foundational-values",
      paper: "General Studies 4",
      code: "GS4-04",
      title: "Foundational Values for Civil Service: Integrity, Objectivity & Empathy",
      officialText: "Aptitude and foundational values for Civil Service, integrity, impartiality and non-partisanship, objectivity, dedication to public service, empathy, tolerance and compassion towards the weaker-sections.",
      themeKeywords: ["Civil Service Values", "Integrity", "Impartiality", "Objectivity", "Empathy", "Compassion", "Nolan Committee Principles"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (20–30 Marks)",
      description: "Nolan Committee's 7 Principles of Public Life, intellectual integrity vs moral integrity, objectivity in statutory decisions, and compassionate bureaucracy."
    },
    {
      id: "gs4-emotional-intelligence",
      paper: "General Studies 4",
      code: "GS4-05",
      title: "Emotional Intelligence in Administration & Governance",
      officialText: "Emotional intelligence-concepts, and their utilities and application in administration and governance.",
      themeKeywords: ["Emotional Intelligence", "Goleman Model", "Self-Awareness", "Conflict Resolution", "Crisis Management"],
      frequentYears: ["2013", "2014", "2016", "2017", "2019", "2020", "2022", "2023", "2024"],
      importanceWeight: "High",
      typicalQuestionsPerCycle: "1 question (10 Marks)",
      description: "Daniel Goleman's 5 domains of EQ, managing mob violence, preventing burnout among frontline workers, and empathetic grievance redressal."
    },
    {
      id: "gs4-moral-thinkers",
      paper: "General Studies 4",
      code: "GS4-06",
      title: "Contributions of Moral Thinkers & Philosophers",
      officialText: "Contributions of moral thinkers and philosophers from India and world.",
      themeKeywords: ["Moral Thinkers", "Kautilya", "Mahatma Gandhi", "B.R. Ambedkar", "John Rawls", "Immanuel Kant", "Aristotle", "Utilitarianism"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "3–4 quote-based questions (30–40 Marks)",
      description: "Rawls's Veil of Ignorance & Difference Principle, Kantian Categorical Imperative, Gandhian Talisman & Seven Social Sins, and Ambedkar's constitutional morality."
    },
    {
      id: "gs4-probity-governance",
      paper: "General Studies 4",
      code: "GS4-07",
      title: "Probity in Governance, RTI, Citizen's Charters & Anti-Corruption",
      officialText: "Public/Civil service values and Ethics in Public administration: Status and problems; ethical concerns and dilemmas in government and private institutions; laws, rules, regulations and conscience as sources of ethical guidance; accountability and ethical governance; strengthening of ethical and moral values in governance; ethical issues in international relations and funding; corporate governance. Probity in Governance: Concept of public service; Philosophical basis of governance and probity; Information sharing and transparency in government, Right to Information, Codes of Ethics, Codes of Conduct, Citizen’s Charters, Work culture, Quality of service delivery, Utilization of public funds, challenges of corruption.",
      themeKeywords: ["Probity in Governance", "Right to Information", "Citizen Charter", "Code of Conduct", "Corruption", "Whistleblowing", "Corporate Governance", "Conflict of Interest"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 questions (20–30 Marks)",
      description: "Distinction between Code of Conduct vs Code of Ethics, Whistleblowers Protection Act, conflict of interest management, and institutional probity."
    },
    {
      id: "gs4-case-studies",
      paper: "General Studies 4",
      code: "GS4-08",
      title: "Applied Ethical Dilemmas & Case Studies (Section B)",
      officialText: "Case Studies on above issues (Section B of GS Paper IV).",
      themeKeywords: ["Ethics Case Study", "Ethical Dilemma", "Whistleblowing Case", "Disaster Response Dilemma", "Procurement Irregularity", "Political Pressure"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "6 case studies (120 Marks = 50% of the paper)",
      description: "Structured analysis of stakeholders, conflicting values, viable options, ethical justification using moral frameworks, and long-term preventive protocols."
    }
  ],

  "Essay": [
    {
      id: "essay-philosophical",
      paper: "Essay",
      code: "ESSAY-01",
      title: "Philosophical, Reflective & Epistemological Essays",
      officialText: "Philosophical, ethical, reflective quotes and aphorisms challenging mental paradigms (Section A & B).",
      themeKeywords: ["Philosophical", "Ethics", "Wisdom", "Truth", "Moral Courage", "Simplicity"],
      frequentYears: ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "4–6 prompts per paper (dominant trend)",
      description: "Aphorisms exploring human nature, truth, moral illusions, and epistemological boundaries."
    },
    {
      id: "essay-socio-political",
      paper: "Essay",
      code: "ESSAY-02",
      title: "Democracy, Governance & Social Justice",
      officialText: "Themes on democracy, federalism, judicial independence, education, and social equality.",
      themeKeywords: ["Democracy", "Social Justice", "Governance", "Education", "Inequality"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2019", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "2–3 prompts per paper",
      description: "Essays addressing constitutional values, civic responsibility, and inclusive human dignity."
    },
    {
      id: "essay-technology-science",
      paper: "Essay",
      code: "ESSAY-03",
      title: "Science, Artificial Intelligence & Ecological Future",
      officialText: "Intersections of technological progress, AI ethics, climate emergency, and sustainability.",
      themeKeywords: ["Technology", "Artificial Intelligence", "Climate Change", "Ecology", "Progress"],
      frequentYears: ["2014", "2017", "2019", "2021", "2023", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "1–2 prompts per paper",
      description: "Balancing algorithmic efficiency with human conscience and ecological limits."
    }
  ],

  "Law Optional": [
    {
      id: "law-constitutional-administrative",
      paper: "Law Optional",
      code: "LAW-01",
      title: "Constitutional & Administrative Law (Paper 1 - Sec A)",
      officialText: "Constitutional and Administrative Law: Fundamental Rights, Directive Principles, Federalism, Judicial Review, Delegated Legislation, Principles of Natural Justice.",
      themeKeywords: ["Constitutional Law", "Administrative Law", "Delegated Legislation", "Natural Justice", "Proportionality"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "4 questions (125 Marks)",
      description: "Rigorous statutory and constitutional jurisprudence, doctrine of proportionality, and administrative discretion."
    },
    {
      id: "law-international",
      paper: "Law Optional",
      code: "LAW-02",
      title: "International Law (Paper 1 - Sec B)",
      officialText: "International Law: Nature, Sources, Recognition, State Responsibility, Law of the Sea, Extradition, Use of Force.",
      themeKeywords: ["Public International Law", "State Responsibility", "Cyber Warfare", "Law of the Sea", "Extradition", "Treaties"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "4 questions (125 Marks)",
      description: "Customary international law, jus cogens, UNCLOS maritime boundaries, and state responsibility for cyber operations."
    },
    {
      id: "law-crimes-torts",
      paper: "Law Optional",
      code: "LAW-03",
      title: "Law of Crimes, Torts & Consumer Protection (Paper 2 - Sec A)",
      officialText: "Law of Crimes: General Principles, Mens Rea, Defences. Law of Torts: Negligence, Strict/Absolute Liability, Vicarious Liability.",
      themeKeywords: ["Law of Crimes", "Law of Torts", "Strict Liability", "Absolute Liability", "Mens Rea", "Negligence"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2026"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "4 questions (125 Marks)",
      description: "Evolution from Rylands v Fletcher to MC Mehta absolute liability, statutory mens rea exceptions, and criminal liability."
    },
    {
      id: "law-contracts-mercantile",
      paper: "Law Optional",
      code: "LAW-04",
      title: "Law of Contracts, Mercantile Law & Cyber Law (Paper 2 - Sec B)",
      officialText: "Law of Contracts: Formation, Frustration, Standard Form Contracts. Contemporary Legal Developments: IPR, Cyber Crime, Competition Law.",
      themeKeywords: ["Law of Contracts", "Frustration of Contract", "Cyber Law", "IPR", "Arbitration"],
      frequentYears: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
      importanceWeight: "Core (Very High)",
      typicalQuestionsPerCycle: "4 questions (125 Marks)",
      description: "Doctrine of frustration (Sec 56), e-contracts, standard form adhesion contracts, and Intellectual Property disputes."
    }
  ]
};

/**
 * Returns total count of official syllabus heads mapped
 */
export function getTotalSyllabusTopicsCount(): number {
  return Object.values(UPSC_OFFICIAL_SYLLABUS_MATRIX).reduce((acc, list) => acc + list.length, 0);
}
