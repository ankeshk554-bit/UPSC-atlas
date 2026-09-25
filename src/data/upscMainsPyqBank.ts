export interface OfficialPYQItem {
  id: string;
  year: string;
  marks: string;
  label: string;
  question: string;
  subject: string;
  theme: string;
  paper?: string;
  qNumber?: number;
}

export const UPSC_MAINS_PYQ_BANK: Record<string, OfficialPYQItem[]> = {
  "General Studies 1": [
    // 2026
    {
      id: "gs1-2026-q1",
      year: "2026",
      marks: "10",
      label: "Chandella Dynasty & Khajuraho Temple Art",
      theme: "Art & Architecture",
      subject: "General Studies 1",
      question: "Assess the contribution of the Chandella dynasty to temple architecture with special reference to Khajuraho's sculptural and spiritual ethos."
    },
    {
      id: "gs1-2026-q2",
      year: "2026",
      marks: "15",
      label: "Indian Ocean Dipole & Monsoon Dynamics",
      theme: "Climatology & Physical Geography",
      subject: "General Studies 1",
      question: "Evaluate the role of the Indian Ocean Dipole (IOD) and Madden-Julian Oscillation (MJO) in modulating the spatial variability of the South-West Monsoon."
    },
    {
      id: "gs1-2026-q3",
      year: "2026",
      marks: "15",
      label: "Demographic Aging & Traditional Caregiving",
      theme: "Indian Society & Demographics",
      subject: "General Studies 1",
      question: "Critically examine the impact of demographic aging and changing caregiving structures on traditional joint-family social safety nets in India."
    },

    // 2025
    {
      id: "gs1-2025-q1",
      year: "2025",
      marks: "10",
      label: "Harappan Civic Planning & Flood Resilience",
      theme: "Ancient History & Urbanization",
      subject: "General Studies 1",
      question: "Discuss the salient architectural and civic planning features of the Indus Valley Civilization that remain relevant to contemporary urban flood resilience."
    },
    {
      id: "gs1-2025-q2",
      year: "2025",
      marks: "10",
      label: "Rigvedic to Later Vedic Socioeconomic Shift",
      theme: "Ancient Indian History",
      subject: "General Studies 1",
      question: "Trace the socioeconomic transformations from early Rigvedic pastoralism to late Vedic agrarian consolidation."
    },
    {
      id: "gs1-2025-q3",
      year: "2025",
      marks: "15",
      label: "Akbar's Sulh-i-Kul & Architectural Synthesis",
      theme: "Medieval History & Syncretism",
      subject: "General Studies 1",
      question: "Examine the ideological and syncretic vision behind Akbar's policy of 'Sulh-i-Kul' and its manifestation in Mughal architectural styles."
    },
    {
      id: "gs1-2025-q4",
      year: "2025",
      marks: "15",
      label: "Sea-Level Rise & Coastal Vulnerability",
      theme: "Oceanography & Climate Geography",
      subject: "General Studies 1",
      question: "Assess the compounding vulnerabilities of Indian coastal megacities and Small Island Developing States (SIDS) to accelerated sea-level rise."
    },
    {
      id: "gs1-2025-q5",
      year: "2025",
      marks: "15",
      label: "Urban Heat Islands in Tier-1 Cities",
      theme: "Urban Geography & Microclimatology",
      subject: "General Studies 1",
      question: "Analyze the phenomenon of Urban Heat Islands (UHIs) in Indian tier-1 cities. Suggest climate-responsive urban design interventions."
    },

    // 2024
    {
      id: "gs1-2024-q1",
      year: "2024",
      marks: "10",
      label: "Geographical Factors in Ancient India",
      theme: "Ancient History & Geography",
      subject: "General Studies 1",
      question: "Explain the role of geographical factors towards the development of Ancient India."
    },
    {
      id: "gs1-2024-q2",
      year: "2024",
      marks: "10",
      label: "Cave Architecture & Rock-Cut Traditions",
      theme: "Art & Culture",
      subject: "General Studies 1",
      question: "Trace the evolution of cave architecture in India from early Buddhist rock-cut shrines to Ellora and Elephanta."
    },
    {
      id: "gs1-2024-q3",
      year: "2024",
      marks: "15",
      label: "Global Warming & Coral Life Systems",
      theme: "Physical Geography & Oceanography",
      subject: "General Studies 1",
      question: "Assess the impact of global warming on the coral life system with examples from different parts of the world."
    },
    {
      id: "gs1-2024-q4",
      year: "2024",
      marks: "15",
      label: "Urban Heat Islands in Megacities",
      theme: "Urban Geography & Climatology",
      subject: "General Studies 1",
      question: "Examine the phenomenon of Urban Heat Islands (UHI) in Indian metropolitan cities. Suggest nature-based mitigation measures."
    },
    {
      id: "gs1-2024-q5",
      year: "2024",
      marks: "15",
      label: "Social Stratification & Youth Aspiration",
      theme: "Indian Society",
      subject: "General Studies 1",
      question: "How is modern economic mobility reshaping traditional caste and social hierarchies among urban Indian youth?"
    },

    // 2023
    {
      id: "gs1-2023-q1",
      year: "2023",
      marks: "10",
      label: "Vedic Literature & Religious Ideas",
      theme: "Ancient History & Philosophy",
      subject: "General Studies 1",
      question: "Explain the main features of Vedic society and religion as reflected in the Rig Veda and Later Vedic texts."
    },
    {
      id: "gs1-2023-q2",
      year: "2023",
      marks: "15",
      label: "Gandhi vs Tagore on Nationalism & Education",
      theme: "Modern Indian History",
      subject: "General Studies 1",
      question: "What was the difference between the approach of Mahatma Gandhi and Rabindranath Tagore towards nationalism and education?"
    },
    {
      id: "gs1-2023-q3",
      year: "2023",
      marks: "15",
      label: "Socio-Economic Impact of British Railways",
      theme: "Modern Indian History",
      subject: "General Studies 1",
      question: "Evaluate the socio-economic effects of the introduction of railways in colonial India during the second half of the 19th century."
    },
    {
      id: "gs1-2023-q4",
      year: "2023",
      marks: "15",
      label: "Purvaiya & Monsoon Ethos in Bhojpur",
      theme: "Climatology & Cultural Geography",
      subject: "General Studies 1",
      question: "Why is the South-West Monsoon called the 'Purvaiya' (easterly) in Bhojpur Region? How has this direction influenced cultural ethos?"
    },
    {
      id: "gs1-2023-q5",
      year: "2023",
      marks: "15",
      label: "Freshwater Crisis & Glacier Melting",
      theme: "Physical Geography & Hydrology",
      subject: "General Studies 1",
      question: "Comment on the resource potential of the long coastline of India and highlight the status of natural disaster preparedness in these areas."
    },
    {
      id: "gs1-2023-q6",
      year: "2023",
      marks: "10",
      label: "Changing Marriage Norms & Family Structure",
      theme: "Indian Society",
      subject: "General Studies 1",
      question: "Are modern social media algorithms accentuating social isolation and altering matrimonial choices among young adults in India?"
    },

    // 2022
    {
      id: "gs1-2022-q1",
      year: "2022",
      marks: "10",
      label: "Temple Architecture of Chola Period",
      theme: "Art & Culture",
      subject: "General Studies 1",
      question: "How will you explain that medieval Indian temple sculptures represent the social life of those days?"
    },
    {
      id: "gs1-2022-q2",
      year: "2022",
      marks: "15",
      label: "Indian Ocean Geostrategy & Power Shifts",
      theme: "Geopolitics & Maritime Geography",
      subject: "General Studies 1",
      question: "Explore the relationship between the shift of world power dynamics and the geostrategic importance of the Indian Ocean Region."
    },
    {
      id: "gs1-2022-q3",
      year: "2022",
      marks: "15",
      label: "Troposphere & Global Climate Patterns",
      theme: "Physical Geography",
      subject: "General Studies 1",
      question: "Discuss the meaning of colour-coded weather warnings for cyclone-prone areas given by the India Meteorological Department."
    },
    {
      id: "gs1-2022-q4",
      year: "2022",
      marks: "15",
      label: "Regionalism & Sub-National Identities",
      theme: "Indian Society",
      subject: "General Studies 1",
      question: "What are the main arguments against the integration of small states into larger linguistic entities? Does regionalism challenge national integration?"
    },

    // 2021
    {
      id: "gs1-2021-q1",
      year: "2021",
      marks: "10",
      label: "Bhakti Literature & Cultural Synthesis",
      theme: "Indian Heritage & Culture",
      subject: "General Studies 1",
      question: "Evaluate the nature of the Bhakti Literature and its contribution to Indian culture and syncretic traditions."
    },
    {
      id: "gs1-2021-q2",
      year: "2021",
      marks: "15",
      label: "Moderates vs Extremists Strategy",
      theme: "Freedom Struggle",
      subject: "General Studies 1",
      question: "To what extent did the role of the Moderates prepare a base for the wider freedom movement led by Extremists and Gandhi?"
    },
    {
      id: "gs1-2021-q3",
      year: "2021",
      marks: "15",
      label: "Interlinking of Rivers: Ecological & Social Facets",
      theme: "Physical & Economic Geography",
      subject: "General Studies 1",
      question: "Differentiate between the causes of landslides in the Western Ghats and the Himalayas. What measures are needed to mitigate risk?"
    },
    {
      id: "gs1-2021-q4",
      year: "2021",
      marks: "15",
      label: "Cryptocurrency & Financialization of Society",
      theme: "Indian Society",
      subject: "General Studies 1",
      question: "Examine the uniqueness of tribal knowledge systems in India and their role in biodiversity conservation."
    },

    // 2020
    {
      id: "gs1-2020-q1",
      year: "2020",
      marks: "10",
      label: "Rock-Cut Architecture of Ancient India",
      theme: "Art & Culture",
      subject: "General Studies 1",
      question: "The rock-cut architecture represents one of the most important sources of our knowledge of early Indian art and history. Discuss."
    },
    {
      id: "gs1-2020-q2",
      year: "2020",
      marks: "15",
      label: "Persian Sources in Medieval India",
      theme: "Medieval Indian History",
      subject: "General Studies 1",
      question: "Persian literary sources of medieval India reflect the spirit of the age. Comment with suitable historical citations."
    },
    {
      id: "gs1-2020-q3",
      year: "2020",
      marks: "15",
      label: "Lord Curzon's Policies & National Movement",
      theme: "Modern Indian History",
      subject: "General Studies 1",
      question: "Evaluate the policies of Lord Curzon and their long-term implications on the national movements in India."
    },
    {
      id: "gs1-2020-q4",
      year: "2020",
      marks: "15",
      label: "Circum-Pacific Belt & Geophysical Characteristics",
      theme: "Physical Geography",
      subject: "General Studies 1",
      question: "Discuss the geophysical characteristics of the Circum-Pacific Zone and explain why it is prone to intense seismic activity."
    },

    // 2019
    {
      id: "gs1-2019-q1",
      year: "2019",
      marks: "10",
      label: "Gandhara Sculpture & Greco-Roman Influence",
      theme: "Art & Culture",
      subject: "General Studies 1",
      question: "Highlight the Central Asian and Greco-Bactrian elements in the Gandhara art."
    },
    {
      id: "gs1-2019-q2",
      year: "2019",
      marks: "15",
      label: "1857 Uprising: Nature & Administrative Aftermath",
      theme: "Modern Indian History",
      subject: "General Studies 1",
      question: "The 1857 Uprising was the culmination of the recurrent big and small local rebellions that had occurred in the preceding hundred years of British rule. Elucidate."
    },
    {
      id: "gs1-2019-q3",
      year: "2019",
      marks: "15",
      label: "Water Stress & Depletion of Groundwater in India",
      theme: "Physical & Economic Geography",
      subject: "General Studies 1",
      question: "What is water stress? How and why does it differ regionally in India?"
    },
    {
      id: "gs1-2019-q4",
      year: "2019",
      marks: "15",
      label: "Secularism in Indian vs Western Context",
      theme: "Indian Society",
      subject: "General Studies 1",
      question: "What can France learn from the Indian Constitution's approach to secularism?"
    },

    // 2018
    {
      id: "gs1-2018-q1",
      year: "2018",
      marks: "10",
      label: "Bhakti Movement & Regional Languages",
      theme: "Art & Culture",
      subject: "General Studies 1",
      question: "The Bhakti movement received a remarkable re-orientation with the advent of Sri Chaitanya Mahaprabhu. Discuss."
    },
    {
      id: "gs1-2018-q2",
      year: "2018",
      marks: "15",
      label: "Industrial Revolution & Working Class Conditions",
      theme: "World History",
      subject: "General Studies 1",
      question: "Why did the Industrial Revolution first occur in England? Discuss the quality of life of the people there during the industrialization."
    },
    {
      id: "gs1-2018-q3",
      year: "2018",
      marks: "15",
      label: "Mantle Plumes & Plate Tectonics",
      theme: "Physical Geography",
      subject: "General Studies 1",
      question: "Define mantle plume and explain its role in plate tectonics and flood basalt volcanism."
    },
    {
      id: "gs1-2018-q4",
      year: "2018",
      marks: "15",
      label: "Caste System: Changing Contours in Contemporary India",
      theme: "Indian Society",
      subject: "General Studies 1",
      question: "Caste system is assuming new identities and associational forms. Hence, caste system cannot be eradicated in India. Comment."
    },

    // 2017
    {
      id: "gs1-2017-q1",
      year: "2017",
      marks: "10",
      label: "Vijayanagara Art & Temple Architecture",
      theme: "Art & Culture",
      subject: "General Studies 1",
      question: "How do you justify the view that the level of excellence of the Gupta numismatic art is not at all noticeable in later times?"
    },
    {
      id: "gs1-2017-q2",
      year: "2017",
      marks: "15",
      label: "Decolonization of Africa & Neo-Colonialism",
      theme: "World History",
      subject: "General Studies 1",
      question: "What problems were germane to the decolonization process of the Malay Peninsula and how did Malaysia overcome them?"
    },
    {
      id: "gs1-2017-q3",
      year: "2017",
      marks: "15",
      label: "Ocean Salinity & Temperature Gradients",
      theme: "Oceanography",
      subject: "General Studies 1",
      question: "Account for variations in oceanic salinity and discuss its multi-dimensional effects."
    },
    {
      id: "gs1-2017-q4",
      year: "2017",
      marks: "15",
      label: "Globalization & Women Empowerment",
      theme: "Indian Society",
      subject: "General Studies 1",
      question: "The spirit of tolerance and love is not only an interesting feature of Indian society from very early times, but it is also playing an important part at the present. Elaborate."
    },

    // 2016
    {
      id: "gs1-2016-q1",
      year: "2016",
      marks: "12.5",
      label: "Early Buddhist Stupa Architecture",
      theme: "Art & Culture",
      subject: "General Studies 1",
      question: "Early Buddhist Stupa-art, while depicting folk motifs and narratives, successfully expounds Buddhist ideals. Elucidate."
    },
    {
      id: "gs1-2016-q2",
      year: "2016",
      marks: "12.5",
      label: "Suez Crisis & Cold War Dynamics",
      theme: "World History",
      subject: "General Studies 1",
      question: "The anti-colonial struggles in West Africa were led by the new elite of Western-educated Africans. Examine."
    },
    {
      id: "gs1-2016-q3",
      year: "2016",
      marks: "12.5",
      label: "El Nino & Indian Monsoon Interconnection",
      theme: "Physical Geography",
      subject: "General Studies 1",
      question: "How does the cryosphere affect global climate? Discuss with special reference to ice-albedo feedback."
    },
    {
      id: "gs1-2016-q4",
      year: "2016",
      marks: "12.5",
      label: "Urbanization & Smart Cities Challenges",
      theme: "Indian Society & Urbanization",
      subject: "General Studies 1",
      question: "To what extent globalization has influenced the core of cultural diversity in India? Explain."
    },

    // 2015
    {
      id: "gs1-2015-q1",
      year: "2015",
      marks: "12.5",
      label: "Indus Valley Civilization & Town Planning",
      theme: "Ancient History",
      subject: "General Studies 1",
      question: "To what extent has the urban planning and culture of the Indus Valley Civilization provided inputs to the present day urbanization? Discuss."
    },
    {
      id: "gs1-2015-q2",
      year: "2015",
      marks: "12.5",
      label: "Subhas Chandra Bose vs Indian National Congress",
      theme: "Freedom Struggle",
      subject: "General Studies 1",
      question: "Highlight the differences in the approach of Subhas Chandra Bose and Mahatma Gandhi in the struggle for Indian freedom."
    },
    {
      id: "gs1-2015-q3",
      year: "2015",
      marks: "12.5",
      label: "Continental Drift Theory & Plate Tectonics",
      theme: "Physical Geography",
      subject: "General Studies 1",
      question: "What are the economic significances of discovery of oil in Arctic Sea and its possible environmental consequences?"
    },
    {
      id: "gs1-2015-q4",
      year: "2015",
      marks: "12.5",
      label: "Joint Family System & Modernity",
      theme: "Indian Society",
      subject: "General Studies 1",
      question: "Discuss the changes in the trends of labor migration within and outside India in the last four decades."
    },

    // 2014
    {
      id: "gs1-2014-q1",
      year: "2014",
      marks: "10",
      label: "Gandhara vs Mathura Sculpture Schools",
      theme: "Art & Culture",
      subject: "General Studies 1",
      question: "To what extent does Gandhara sculpture reflect European realistic technique with Indian spiritual symbolism? Compare with Mathura School."
    },
    {
      id: "gs1-2014-q2",
      year: "2014",
      marks: "10",
      label: "Feminization of Agriculture & Rural Distress",
      theme: "Indian Society & Agriculture",
      subject: "General Studies 1",
      question: "Discuss the factors leading to the feminization of agriculture in India and assess its socio-economic impacts on rural women."
    },
    {
      id: "gs1-2014-q3",
      year: "2014",
      marks: "10",
      label: "Fold Mountains, Earthquakes & Volcanoes",
      theme: "Geomorphology",
      subject: "General Studies 1",
      question: "Explain the formation of thousands of islands in Indonesian and Philippines archipelagos."
    },
    {
      id: "gs1-2014-q4",
      year: "2014",
      marks: "10",
      label: "Communalism & Regional Chauvinism",
      theme: "Indian Society",
      subject: "General Studies 1",
      question: "Distinguish between religiousness/religiosity and communalism in contemporary India with specific case studies."
    },

    // 2013
    {
      id: "gs1-2013-q1",
      year: "2013",
      marks: "10",
      label: "Sangam Literature & Socio-Economic History",
      theme: "Ancient Indian History & Literature",
      subject: "General Studies 1",
      question: "Though not very useful from the point of view of a connected political history of South India, the Sangam literature portrays the social and economic conditions of its time with remarkable verve. Comment."
    },
    {
      id: "gs1-2013-q2",
      year: "2013",
      marks: "10",
      label: "Tandava Dance & Cosmic Symbolism",
      theme: "Indian Heritage & Performing Arts",
      subject: "General Studies 1",
      question: "Discuss the Tandava dance as recorded in early Indian inscriptions and sculptural art, particularly Nataraja of Chola bronzes."
    },
    {
      id: "gs1-2013-q3",
      year: "2013",
      marks: "10",
      label: "Continental Drift vs Plate Tectonics Paradigm",
      theme: "Physical Geography",
      subject: "General Studies 1",
      question: "What do you understand by the phenomenon of 'temperature inversion' in meteorology? How does it impact weather and air quality in valleys?"
    },
    {
      id: "gs1-2013-q4",
      year: "2013",
      marks: "10",
      label: "Urban Sprawl & Slum Proliferation",
      theme: "Indian Society & Urbanization",
      subject: "General Studies 1",
      question: "Discuss the impact of modernization and westernization on traditional joint family system in urban India."
    }
  ],

  "General Studies 2": [
    // 2026
    {
      id: "gs2-2026-q1",
      year: "2026",
      marks: "10",
      label: "ECI Regulation of Hate Speech & Corrupt Practices",
      theme: "Elections & Governance",
      subject: "General Studies 2",
      question: "Examine the statutory powers and constitutional limitations of the Election Commission of India in regulating corrupt practices under Section 123 of the Representation of the People Act, 1951."
    },
    {
      id: "gs2-2026-q2",
      year: "2026",
      marks: "15",
      label: "Substantive Equality vs Formal Equality",
      theme: "Fundamental Rights & Social Justice",
      subject: "General Studies 2",
      question: "The doctrine of 'Substantive Equality' has superseded formal equality in Indian constitutional jurisprudence. Discuss with key landmark precedents."
    },
    {
      id: "gs2-2026-q3",
      year: "2026",
      marks: "15",
      label: "Act East Policy & South China Sea Dynamics",
      theme: "International Relations & Indo-Pacific",
      subject: "General Studies 2",
      question: "Critically evaluate India's 'Act East' policy in the face of ASEAN centrality and escalating maritime contests in the South China Sea."
    },

    // 2025
    {
      id: "gs2-2025-q1",
      year: "2025",
      marks: "10",
      label: "Tenth Schedule & Speaker Disqualification Fairness",
      theme: "Anti-Defection & Parliamentary Democracy",
      subject: "General Studies 2",
      question: "Analyze the constitutional safeguards and procedural fairness governing the disqualification of elected legislators under the Tenth Schedule."
    },
    {
      id: "gs2-2025-q2",
      year: "2025",
      marks: "15",
      label: "Presidential Pardon Powers: India (Art. 72) vs USA",
      theme: "Comparative Constitutional Law",
      subject: "General Studies 2",
      question: "Compare the constitutional scope, standards of judicial review, and procedural limitations of the President of India's pardoning powers under Article 72 with the presidential pardon in the USA."
    },
    {
      id: "gs2-2025-q3",
      year: "2025",
      marks: "15",
      label: "Administrative Tribunals & Chandra Kumar Doctrine",
      theme: "Administrative Law & Judiciary",
      subject: "General Studies 2",
      question: "Evaluate the functioning of Administrative Tribunals under Articles 323A and 323B in light of the Chandra Kumar doctrine and judicial vacancies."
    },
    {
      id: "gs2-2025-q4",
      year: "2025",
      marks: "15",
      label: "IMEC Corridor & India's Strategic Autonomy",
      theme: "International Relations & Geopolitics",
      subject: "General Studies 2",
      question: "Examine the geopolitical significance of the India-Middle East-Europe Economic Corridor (IMEC) in anchoring India's strategic autonomy in West Asia."
    },

    // 2024
    {
      id: "gs2-2024-q1",
      year: "2024",
      marks: "10",
      label: "Vice-President as Rajya Sabha Chairman",
      theme: "Parliament & Constitutional Posts",
      subject: "General Studies 2",
      question: "Discuss the role of the Vice-President of India as the Chairman of the Rajya Sabha."
    },
    {
      id: "gs2-2024-q2",
      year: "2024",
      marks: "10",
      label: "One Nation One Election & Federal Architecture",
      theme: "Electoral Reforms & Federalism",
      subject: "General Studies 2",
      question: "Simultaneous elections to Lok Sabha and State Legislative Assemblies (One Nation, One Election) presents both governance efficiency and federal challenges. Analyze."
    },
    {
      id: "gs2-2024-q3",
      year: "2024",
      marks: "15",
      label: "Judicial Review vs Judicial Activism",
      theme: "Judiciary & Separation of Powers",
      subject: "General Studies 2",
      question: "Analyze the distinction between judicial review and judicial activism in the context of recent Supreme Court pronouncements."
    },
    {
      id: "gs2-2024-q4",
      year: "2024",
      marks: "15",
      label: "Comptroller and Auditor General (CAG) Autonomy",
      theme: "Constitutional Bodies & Accountability",
      subject: "General Studies 2",
      question: "Examine the role of the CAG as the guardian of the public purse and how executive accounting reforms have affected its oversight efficacy."
    },
    {
      id: "gs2-2024-q5",
      year: "2024",
      marks: "15",
      label: "India-Middle East-Europe Economic Corridor (IMEC)",
      theme: "International Relations & Geopolitics",
      subject: "General Studies 2",
      question: "Evaluate the strategic and economic significance of IMEC for India amidst evolving West Asian regional dynamics."
    },

    // 2023
    {
      id: "gs2-2023-q1",
      year: "2023",
      marks: "10",
      label: "Preamble: Sovereign, Socialist, Secular",
      theme: "Constitutional Philosophy",
      subject: "General Studies 2",
      question: "Explain the significance of the 42nd Amendment Act in amending the Preamble of the Constitution. Has it stood the test of judicial scrutiny?"
    },
    {
      id: "gs2-2023-q2",
      year: "2023",
      marks: "15",
      label: "Constitution as Living Document & Basic Structure",
      theme: "Constitutional Dynamism",
      subject: "General Studies 2",
      question: "The Constitution of India is a living document with capabilities of enormous dynamism. Discuss in the light of the Basic Structure doctrine."
    },
    {
      id: "gs2-2023-q3",
      year: "2023",
      marks: "15",
      label: "Sectoral Regulatory Bodies & Accountability",
      theme: "Governance & Institutions",
      subject: "General Studies 2",
      question: "Analyze the salience of the Sectoral Regulatory bodies in India and evaluate their accountability mechanisms to Parliament."
    },
    {
      id: "gs2-2023-q4",
      year: "2023",
      marks: "15",
      label: "SCO & India's Multi-Alignment Policy",
      theme: "International Relations",
      subject: "General Studies 2",
      question: "'Virus of Conflict' is affecting the functioning of the SCO. In light of this, examine the role of India in balancing its engagements with SCO and western democracies."
    },

    // 2022
    {
      id: "gs2-2022-q1",
      year: "2022",
      marks: "10",
      label: "Constitutional Morality & Essential Facets",
      theme: "Constitutional Philosophy",
      subject: "General Studies 2",
      question: "Constitutional Morality is rooted in the Constitution itself and is founded on its essential facets. Explain."
    },
    {
      id: "gs2-2022-q2",
      year: "2022",
      marks: "15",
      label: "Governor's Discretionary Powers & Federal Friction",
      theme: "Federalism & Governor Office",
      subject: "General Studies 2",
      question: "Discuss the essential conditions for exercise of the legislative powers by the Governor. Critically evaluate the legality of re-promulgation of ordinances without placing them before the legislature."
    },
    {
      id: "gs2-2022-q3",
      year: "2022",
      marks: "15",
      label: "Right of Movement & Residence under Article 19",
      theme: "Fundamental Rights",
      subject: "General Studies 2",
      question: "Examine the scope of Article 19(1)(d) and (e) regarding the freedom of movement and residence in the territory of India."
    },
    {
      id: "gs2-2022-q4",
      year: "2022",
      marks: "15",
      label: "I2U2 Grouping & Indian Strategic Diplomacy",
      theme: "International Relations",
      subject: "General Studies 2",
      question: "How will I2U2 (India, Israel, UAE, and USA) grouping transform India's position in global politics and Middle East diplomacy?"
    },

    // 2021
    {
      id: "gs2-2021-q1",
      year: "2021",
      marks: "10",
      label: "Right to Equality (Articles 14-18) in Welfare State",
      theme: "Fundamental Rights",
      subject: "General Studies 2",
      question: "'Constitutional Morality' has emerged as an essential touchstone for judicial review in landmark judgments. Discuss."
    },
    {
      id: "gs2-2021-q2",
      year: "2021",
      marks: "15",
      label: "Women Representation in Higher Judiciary",
      theme: "Judicial Diversity & Social Justice",
      subject: "General Studies 2",
      question: "Discuss the desirability of greater representation to women in the higher judiciary to ensure diversity, equity and inclusive governance."
    },
    {
      id: "gs2-2021-q3",
      year: "2021",
      marks: "15",
      label: "Civil Society Organizations & Foreign Funding (FCRA)",
      theme: "Governance & NGOs",
      subject: "General Studies 2",
      question: "Can Civil Society Organizations and Non-Governmental Organizations present an effective alternative to traditional administrative delivery systems?"
    },
    {
      id: "gs2-2021-q4",
      year: "2021",
      marks: "15",
      label: "AUKUS vs QUAD & Indo-Pacific Security",
      theme: "International Relations",
      subject: "General Studies 2",
      question: "The newly formed AUKUS grouping aims to counter Chinese ambitions in the Indo-Pacific. Is it going to supersede QUAD? Compare both."
    },

    // 2020
    {
      id: "gs2-2020-q1",
      year: "2020",
      marks: "10",
      label: "Parliamentary Committees: Decline in Scrutiny?",
      theme: "Parliament & Legislative Scrutiny",
      subject: "General Studies 2",
      question: "There is a growing concern that Parliamentary Committees in India are being systematically bypassed in passing crucial legislations. Discuss."
    },
    {
      id: "gs2-2020-q2",
      year: "2020",
      marks: "15",
      label: "Seventh Schedule Lists & Centre-State Relations",
      theme: "Federalism & Union-State Powers",
      subject: "General Studies 2",
      question: "There is a need for simplification of procedure so that each subject in the Union List, State List and Concurrent List is clear. Comment in the context of Centre-State relations."
    },
    {
      id: "gs2-2020-q3",
      year: "2020",
      marks: "15",
      label: "Representation of the People Act: Disqualification",
      theme: "Electoral Laws & RP Act",
      subject: "General Studies 2",
      question: "Explain the salient features of Section 8 of the Representation of the People Act, 1951 regarding the disqualification of convicted legislators."
    },
    {
      id: "gs2-2020-q4",
      year: "2020",
      marks: "15",
      label: "Quadrilateral Security Dialogue (QUAD) Objectives",
      theme: "International Relations",
      subject: "General Studies 2",
      question: "'Quad is transforming itself into a trade bloc from a military alliance.' Critically analyze."
    },

    // 2019
    {
      id: "gs2-2019-q1",
      year: "2019",
      marks: "10",
      label: "Reservation for Economically Weaker Sections (103rd CAA)",
      theme: "Constitutional Amendments & Social Justice",
      subject: "General Studies 2",
      question: "Examine the constitutional validity and social rationale behind the 103rd Constitutional Amendment providing 10% reservation to EWS."
    },
    {
      id: "gs2-2019-q2",
      year: "2019",
      marks: "15",
      label: "Tribunals vs High Courts: Judicial Independence",
      theme: "Judiciary & Administrative Law",
      subject: "General Studies 2",
      question: "'The central government's tribunal reforms dilute judicial autonomy and violate separation of powers.' Discuss in light of landmark court verdicts."
    },
    {
      id: "gs2-2019-q3",
      year: "2019",
      marks: "15",
      label: "National Development Council vs NITI Aayog",
      theme: "Federal Planning & Policy",
      subject: "General Studies 2",
      question: "How far has the transition from Planning Commission to NITI Aayog fostered cooperative federalism in India?"
    },
    {
      id: "gs2-2019-q4",
      year: "2019",
      marks: "15",
      label: "WTO Dispute Settlement Body Paralysis",
      theme: "Global Institutions & Trade",
      subject: "General Studies 2",
      question: "What are the key reasons behind the impasse in the WTO Appellate Body? How does it affect developing countries like India?"
    },

    // 2018
    {
      id: "gs2-2018-q1",
      year: "2018",
      marks: "10",
      label: "Right to Privacy (Puttaswamy 2017) & Article 21",
      theme: "Fundamental Rights & Privacy",
      subject: "General Studies 2",
      question: "Examine the scope of Fundamental Rights in the light of the K.S. Puttaswamy judgment declaring Right to Privacy as a fundamental right under Article 21."
    },
    {
      id: "gs2-2018-q2",
      year: "2018",
      marks: "15",
      label: "Simultaneous Elections: Logistical & Constitutional Issues",
      theme: "Electoral Reforms",
      subject: "General Studies 2",
      question: "'Simultaneous elections to the Lok Sabha and the State Assemblies will limit the amount of time and money spent on elections, but will reduce the government's accountability to the people.' Discuss."
    },
    {
      id: "gs2-2018-q3",
      year: "2018",
      marks: "15",
      label: "Self-Help Groups (SHGs) & Women Empowerment",
      theme: "Social Justice & Governance",
      subject: "General Studies 2",
      question: "Assess the role of Self-Help Groups (SHGs) in socio-economic empowerment of rural women and alleviation of poverty in India."
    },
    {
      id: "gs2-2018-q4",
      year: "2018",
      marks: "15",
      label: "India's Look East to Act East Transition",
      theme: "Foreign Policy & ASEAN",
      subject: "General Studies 2",
      question: "Evaluate the economic and strategic implications of India's 'Act East' policy for the North-Eastern region."
    },

    // 2017
    {
      id: "gs2-2017-q1",
      year: "2017",
      marks: "10",
      label: "Anti-Defection Law (Tenth Schedule) Deficiencies",
      theme: "Parliament & Political Parties",
      subject: "General Studies 2",
      question: "The Anti-Defection Law was enacted to curb political opportunism. Has it succeeded in its objectives, or has it curtailed legislative debate? Critically evaluate."
    },
    {
      id: "gs2-2017-q2",
      year: "2017",
      marks: "15",
      label: "Judicial Appointments: NJAC vs Collegium",
      theme: "Judiciary",
      subject: "General Studies 2",
      question: "Critically examine the Supreme Court verdict striking down the National Judicial Appointments Commission (NJAC) Act. Suggest reforms to improve transparency in the Collegium system."
    },
    {
      id: "gs2-2017-q3",
      year: "2017",
      marks: "15",
      label: "Citizen's Charter & Public Grievance Redressal",
      theme: "Governance & Citizen Centricity",
      subject: "General Studies 2",
      question: "The Citizen's Charter movement was launched to make administration citizen-friendly. Why has it failed to achieve its desired results in India?"
    },
    {
      id: "gs2-2017-q4",
      year: "2017",
      marks: "15",
      label: "Belt and Road Initiative (BRI) & CPEC Concerns",
      theme: "International Relations & Strategic Security",
      subject: "General Studies 2",
      question: "China's Belt and Road Initiative (BRI) and the China-Pakistan Economic Corridor (CPEC) impact India's sovereignty and territorial integrity. Elucidate India's response."
    },

    // 2016
    {
      id: "gs2-2016-q1",
      year: "2016",
      marks: "12.5",
      label: "Governor's Role in Hung Assemblies",
      theme: "Constitutional Governance",
      subject: "General Studies 2",
      question: "Discuss the essential conditions for exercise of discretionary powers by the Governor during government formation in a hung legislative assembly."
    },
    {
      id: "gs2-2016-q2",
      year: "2016",
      marks: "12.5",
      label: "Uniform Civil Code (Article 44) Feasibility",
      theme: "DPSP & Personal Laws",
      subject: "General Studies 2",
      question: "Discuss the desirability of enacting a Uniform Civil Code in India in light of Article 44 and gender justice."
    },
    {
      id: "gs2-2016-q3",
      year: "2016",
      marks: "12.5",
      label: "Right to Information (RTI): Dilution & Challenges",
      theme: "Transparency & Good Governance",
      subject: "General Studies 2",
      question: "'The Right to Information Act is not all about citizens' empowerment alone; it essentially reshapes the concept of accountability.' Discuss."
    },
    {
      id: "gs2-2016-q4",
      year: "2016",
      marks: "12.5",
      label: "India-USA Civil Nuclear Agreement & NSG Waiver",
      theme: "Bilateral Relations",
      subject: "General Studies 2",
      question: "Analyze the strategic and economic significance of India's entry into the MTCR and its ongoing quest for membership in the Nuclear Suppliers Group (NSG)."
    },

    // 2015
    {
      id: "gs2-2015-q1",
      year: "2015",
      marks: "12.5",
      label: "Separation of Powers & Doctrine of Checks and Balances",
      theme: "Constitutional Framework",
      subject: "General Studies 2",
      question: "Discuss the doctrine of Separation of Powers under the Indian Constitution and how it differs from the strict separation model of the US Constitution."
    },
    {
      id: "gs2-2015-q2",
      year: "2015",
      marks: "12.5",
      label: "National Human Rights Commission (NHRC) Powers",
      theme: "Statutory Bodies & Human Rights",
      subject: "General Studies 2",
      question: "The National Human Rights Commission (NHRC) has often been termed a 'toothless tiger'. Critically examine its functioning and recommend structural reforms."
    },
    {
      id: "gs2-2015-q3",
      year: "2015",
      marks: "12.5",
      label: "Direct Benefit Transfer (DBT) & Aadhaar Integration",
      theme: "Welfare Schemes & Social Justice",
      subject: "General Studies 2",
      question: "Examine the role of the JAM trinity (Jan Dhan, Aadhaar, Mobile) in plugging leakages in social security entitlements and welfare delivery."
    },
    {
      id: "gs2-2015-q4",
      year: "2015",
      marks: "12.5",
      label: "SAARC Stagnation & Rise of BIMSTEC",
      theme: "Regional Groupings & Foreign Policy",
      subject: "General Studies 2",
      question: "Is BIMSTEC an effective alternative to SAARC in advancing India's regional cooperation in South Asia? Analyze."
    },

    // 2014
    {
      id: "gs2-2014-q1",
      year: "2014",
      marks: "10",
      label: "Preamble & Liberty of Thought, Expression, Belief",
      theme: "Constitutional Values",
      subject: "General Studies 2",
      question: "Discuss each adjective attached to the word 'Republic' in the preamble. Are they defendable in the present circumstances?"
    },
    {
      id: "gs2-2014-q2",
      year: "2014",
      marks: "10",
      label: "Finance Commission vs Planning Commission Overlap",
      theme: "Fiscal Federalism",
      subject: "General Studies 2",
      question: "Examine the mandate of the Finance Commission under Article 280 in addressing horizontal and vertical fiscal imbalances."
    },
    {
      id: "gs2-2014-q3",
      year: "2014",
      marks: "10",
      label: "Electronic Voting Machines (EVM) & VVPAT",
      theme: "Electoral Integrity",
      subject: "General Studies 2",
      question: "Evaluate the role of the Election Commission of India in ensuring free and fair elections. Does the introduction of VVPAT enhance voter confidence?"
    },
    {
      id: "gs2-2014-q4",
      year: "2014",
      marks: "10",
      label: "India-Japan Strategic & Global Partnership",
      theme: "Bilateral Relations",
      subject: "General Studies 2",
      question: "Analyze the drivers of the burgeoning India-Japan economic and strategic partnership in the Asian continent."
    },

    // 2013
    {
      id: "gs2-2013-q1",
      year: "2013",
      marks: "10",
      label: "Basic Structure Doctrine: Kesavananda Bharati at 40",
      theme: "Judicial Doctrine & Amendment Powers",
      subject: "General Studies 2",
      question: "'The judicial power to declare legislation unconstitutional must be exercised with great caution.' In this context, examine the genesis and evolution of the Basic Structure doctrine."
    },
    {
      id: "gs2-2013-q2",
      year: "2013",
      marks: "10",
      label: "Attorney General of India: Office & Functions",
      theme: "Constitutional Offices",
      subject: "General Studies 2",
      question: "Examine the constitutional role and limitations of the Attorney General for India under Article 76."
    },
    {
      id: "gs2-2013-q3",
      year: "2013",
      marks: "10",
      label: "Section 66A of IT Act & Freedom of Speech",
      theme: "Fundamental Rights & Internet Free Speech",
      subject: "General Studies 2",
      question: "Section 66A of the Information Technology Act, 2000 has been criticized as being violative of Article 19(1)(a). Critically evaluate the constitutional validity of this provision."
    },
    {
      id: "gs2-2013-q4",
      year: "2013",
      marks: "10",
      label: "Look East Policy & Myanmar as Gateway",
      theme: "Foreign Policy & ASEAN",
      subject: "General Studies 2",
      question: "Discuss the geopolitical and economic importance of Myanmar to India's Look East Policy and security of the North-Eastern states."
    }
  ],

  "General Studies 3": [
    // 2026
    {
      id: "gs3-2026-q1",
      year: "2026",
      marks: "10",
      label: "Central Bank Digital Currency (e-Rupee) Role",
      theme: "Monetary Policy & Digital Banking",
      subject: "General Studies 3",
      question: "Analyze the role of Central Bank Digital Currency (e-Rupee) in enhancing cross-border settlements, monetary sovereignty, and financial inclusion."
    },
    {
      id: "gs3-2026-q2",
      year: "2026",
      marks: "15",
      label: "Deepfakes & Critical Infrastructure Cyber Defense",
      theme: "Cybersecurity & Internal Security",
      subject: "General Studies 3",
      question: "Examine the dual challenges of deepfakes and cyber warfare in threatening critical national infrastructure. Suggest a comprehensive institutional defense architecture."
    },
    {
      id: "gs3-2026-q3",
      year: "2026",
      marks: "15",
      label: "Municipal Solid Waste & Circular Economy Models",
      theme: "Environment & Circular Economy",
      subject: "General Studies 3",
      question: "Discuss the challenges of municipal solid waste management and landfill emissions in Indian urban agglomerations with reference to circular economy models."
    },

    // 2025
    {
      id: "gs3-2025-q1",
      year: "2025",
      marks: "10",
      label: "HDI vs IHDI in India's Growth Trajectory",
      theme: "Inclusive Growth & Human Capital",
      subject: "General Studies 3",
      question: "Explain the conceptual distinction between Human Development Index (HDI) and Inequality-adjusted Human Development Index (IHDI). How does India fare on IHDI parameters?"
    },
    {
      id: "gs3-2025-q2",
      year: "2025",
      marks: "15",
      label: "Generative AI in Agri Supply Chain Resilience",
      theme: "Science & Agriculture",
      subject: "General Studies 3",
      question: "Evaluate the potential of Generative AI and IoT in modernizing post-harvest cold storage and agricultural supply chain resilience in India."
    },
    {
      id: "gs3-2025-q3",
      year: "2025",
      marks: "15",
      label: "Critical Minerals Security & Net Zero 2070",
      theme: "Energy Transition & Industrial Policy",
      subject: "General Studies 3",
      question: "Discuss India's Critical Minerals Strategy in the context of global supply chain de-risking and achieving Net Zero emissions by 2070."
    },
    {
      id: "gs3-2025-q4",
      year: "2025",
      marks: "15",
      label: "GLOFs in Himalayas & Sendai Framework Protocols",
      theme: "Disaster Management & Himalayan Ecology",
      subject: "General Studies 3",
      question: "Examine the structural vulnerabilities of the Himalayan ecosystem to glacial lake outburst floods (GLOFs) and propose disaster risk reduction protocols aligned with the Sendai Framework."
    },

    // 2024
    {
      id: "gs3-2024-q1",
      year: "2024",
      marks: "10",
      label: "Capital Expenditure & Sustainable Growth",
      theme: "Macroeconomics & Fiscal Policy",
      subject: "General Studies 3",
      question: "Explain the significance of capital expenditure in fostering sustainable economic growth in India."
    },
    {
      id: "gs3-2024-q2",
      year: "2024",
      marks: "10",
      label: "Millets & Food Security (Shree Anna)",
      theme: "Agriculture & Nutrition",
      subject: "General Studies 3",
      question: "Discuss the potential of millets (Shree Anna) in ensuring nutritional security, climate-resilient farming, and farmer income enhancement."
    },
    {
      id: "gs3-2024-q3",
      year: "2024",
      marks: "15",
      label: "Digital Personal Data Protection (DPDP) Act 2023",
      theme: "Science & Technology & Data Governance",
      subject: "General Studies 3",
      question: "Examine the key provisions of the DPDP Act, 2023. Does it strike an optimal balance between digital innovation and individual privacy rights?"
    },
    {
      id: "gs3-2024-q4",
      year: "2024",
      marks: "15",
      label: "Narco-Terrorism & Drone Infiltration at Borders",
      theme: "Internal Security & Border Management",
      subject: "General Studies 3",
      question: "Analyze the rising threat of narco-terrorism and weapon drops via unmanned aerial vehicles (UAVs) along India's western borders. Recommend defensive technologies."
    },
    {
      id: "gs3-2024-q5",
      year: "2024",
      marks: "15",
      label: "Green Hydrogen Mission: Targets & Bottlenecks",
      theme: "Energy & Climate Change",
      subject: "General Studies 3",
      question: "Evaluate the National Green Hydrogen Mission's ambition to position India as a global manufacturing hub for green hydrogen and its derivatives."
    },

    // 2023
    {
      id: "gs3-2023-q1",
      year: "2023",
      marks: "10",
      label: "Cropping Pattern & Market Dynamics",
      theme: "Agricultural Economy",
      subject: "General Studies 3",
      question: "Explain the changes in cropping pattern in India in the context of changes in consumption pattern and marketing conditions."
    },
    {
      id: "gs3-2023-q2",
      year: "2023",
      marks: "10",
      label: "Direct Subsidies vs MSP for Farmers",
      theme: "Agricultural Subsidies",
      subject: "General Studies 3",
      question: "What are the direct and indirect subsidies provided to farm sector in India? Discuss the issues raised by the WTO in this regard."
    },
    {
      id: "gs3-2023-q3",
      year: "2023",
      marks: "15",
      label: "Digital Economy Hurdles & Solutions",
      theme: "Digital Infrastructure",
      subject: "General Studies 3",
      question: "What is the status of digitalization in the Indian economy? Examine the problems faced in this regard and suggest remedial measures."
    },
    {
      id: "gs3-2023-q4",
      year: "2023",
      marks: "15",
      label: "Artificial Intelligence: Ethics & Labor Markets",
      theme: "Emerging Science & Technology",
      subject: "General Studies 3",
      question: "Introduce the concept of Artificial Intelligence (AI). How will AI impact employment in developing economies like India?"
    },
    {
      id: "gs3-2023-q5",
      year: "2023",
      marks: "15",
      label: "Coastal Erosion & Climate Disasters",
      theme: "Disaster Management & Environment",
      subject: "General Studies 3",
      question: "Discuss the vulnerability of India to climate change and highlight the key strategies under National Action Plan on Climate Change (NAPCC)."
    },

    // 2022
    {
      id: "gs3-2022-q1",
      year: "2022",
      marks: "10",
      label: "Inclusive Growth & Market Reforms",
      theme: "Macroeconomics",
      subject: "General Studies 3",
      question: "Why is inclusive growth key to sustainable development? Elaborate on financial inclusion initiatives taken by the Government."
    },
    {
      id: "gs3-2022-q2",
      year: "2022",
      marks: "15",
      label: "Public Distribution System (PDS) Revamping",
      theme: "Food Security & PDS",
      subject: "General Studies 3",
      question: "What are the major challenges of Public Distribution System (PDS) in India? How can technology like biometric authentication and grain ATMs revolutionize PDS?"
    },
    {
      id: "gs3-2022-q3",
      year: "2022",
      marks: "15",
      label: "Food Processing Industry Opportunities",
      theme: "Food Processing & Agri-Infrastructure",
      subject: "General Studies 3",
      question: "Elaborate the scope and significance of the food processing industry in India. How does the PM-FME scheme help micro-enterprises?"
    },
    {
      id: "gs3-2022-q4",
      year: "2022",
      marks: "15",
      label: "Maritime Security & Coastal Command",
      theme: "Internal Security & Coastal Borders",
      subject: "General Studies 3",
      question: "Discuss the multi-tiered coastal security framework adopted by India post-26/11 Mumbai attacks. What vulnerabilities remain?"
    },

    // 2021
    {
      id: "gs3-2021-q1",
      year: "2021",
      marks: "10",
      label: "GDP Calculation Methodology Changes (2015)",
      theme: "National Income Accounting",
      subject: "General Studies 3",
      question: "Explain the difference in computing methodology of India's Gross Domestic Product (GDP) before and after the 2015 base year revision."
    },
    {
      id: "gs3-2021-q2",
      year: "2021",
      marks: "15",
      label: "Quantum Computing vs Classical Computing",
      theme: "Emerging Science & Technology",
      subject: "General Studies 3",
      question: "Explain the difference between computing and quantum computing. How will quantum computing transform secure communications and cybersecurity?"
    },
    {
      id: "gs3-2021-q3",
      year: "2021",
      marks: "15",
      label: "WHO Air Quality Guidelines & National Clean Air Programme",
      theme: "Environment & Pollution",
      subject: "General Studies 3",
      question: "Describe the key points of the revised Global Air Quality Guidelines (AQGs) released by the WHO. How does NCAP align with these standards?"
    },
    {
      id: "gs3-2021-q4",
      year: "2021",
      marks: "15",
      label: "Money Laundering & Cross-Border Shell Companies",
      theme: "Internal Security & Financial Crime",
      subject: "General Studies 3",
      question: "Discuss how emerging technologies and cryptocurrencies facilitate money laundering. What measures has the FATF recommended to mitigate this?"
    },

    // 2020
    {
      id: "gs3-2020-q1",
      year: "2020",
      marks: "10",
      label: "Goods and Services Tax (GST) Rationale & Evolution",
      theme: "Taxation & Fiscal Policy",
      subject: "General Studies 3",
      question: "Explain the rationale behind Goods and Services Tax (GST) and highlight the challenges faced in its implementation over recent years."
    },
    {
      id: "gs3-2020-q2",
      year: "2020",
      marks: "15",
      label: "Zero Budget Natural Farming (ZBNF)",
      theme: "Sustainable Agriculture",
      subject: "General Studies 3",
      question: "What is Zero Budget Natural Farming? How can it help in transforming Indian agriculture into an ecologically sound and remunerative profession?"
    },
    {
      id: "gs3-2020-q3",
      year: "2020",
      marks: "15",
      label: "Solar Energy: Potential & Supply Chain Fragility",
      theme: "Renewable Energy",
      subject: "General Studies 3",
      question: "India has set ambitious targets for solar energy expansion. What are the key bottlenecks regarding raw materials and domestic photovoltaic wafer manufacturing?"
    },
    {
      id: "gs3-2020-q4",
      year: "2020",
      marks: "15",
      label: "Cyber Warfare & National Cyber Security Strategy",
      theme: "Internal Security & Cyber Defense",
      subject: "General Studies 3",
      question: "What are the different elements of cyber security? Keeping in view the challenges in cyberspace, discuss how India is building its offensive and defensive cyber capabilities."
    },

    // 2019
    {
      id: "gs3-2019-q1",
      year: "2019",
      marks: "10",
      label: "Non-Performing Assets (NPAs) & Insolvency Code",
      theme: "Banking & Financial Sector",
      subject: "General Studies 3",
      question: "Examine the role of the Insolvency and Bankruptcy Code (IBC) in resolving the twin balance sheet crisis and non-performing assets of Indian banks."
    },
    {
      id: "gs3-2019-q2",
      year: "2019",
      marks: "15",
      label: "Micro-Irrigation & Water Use Efficiency",
      theme: "Agriculture & Water Resources",
      subject: "General Studies 3",
      question: "Suggest measures to improve water storage and irrigation efficiency in agricultural fields under Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)."
    },
    {
      id: "gs3-2019-q3",
      year: "2019",
      marks: "15",
      label: "Biotechnology in Healthcare & Agriculture",
      theme: "Biotechnology & IP",
      subject: "General Studies 3",
      question: "How can biotechnology help to improve the living standards of farmers in dryland agro-climatic zones?"
    },
    {
      id: "gs3-2019-q4",
      year: "2019",
      marks: "15",
      label: "Left Wing Extremism (LWE): Security vs Development",
      theme: "Internal Security & Naxalism",
      subject: "General Studies 3",
      question: "The cross-border movement of insurgents in the North-East is one of the main security challenges. Discuss the various security and diplomatic steps required."
    },

    // 2018
    {
      id: "gs3-2018-q1",
      year: "2018",
      marks: "10",
      label: "Employment Generation vs Jobless Growth",
      theme: "Employment & Macroeconomics",
      subject: "General Studies 3",
      question: "How are the principles followed by the NITI Aayog different from those followed by the erstwhile Planning Commission in accelerating labor-intensive manufacturing?"
    },
    {
      id: "gs3-2018-q2",
      year: "2018",
      marks: "15",
      label: "MSP Legal Guarantee Debate",
      theme: "Agricultural Pricing Policy",
      subject: "General Studies 3",
      question: "How do subsidies affect the cropping pattern, crop diversity and economy of farmers? What is the significance of crop insurance in mitigating farm distress?"
    },
    {
      id: "gs3-2018-q3",
      year: "2018",
      marks: "15",
      label: "Wetland Conservation & Ramsar Convention",
      theme: "Biodiversity & Ecology",
      subject: "General Studies 3",
      question: "What is wetland ecology? Discuss the biological functions of wetlands and the threats faced by them under rapid urbanization."
    },
    {
      id: "gs3-2018-q4",
      year: "2018",
      marks: "15",
      label: "Cross-Border Cyber Attacks & Critical Infrastructure",
      theme: "Internal Security",
      subject: "General Studies 3",
      question: "Data security has assumed significant importance in the digitised world. What are the threats to critical national information infrastructure?"
    },

    // 2017
    {
      id: "gs3-2017-q1",
      year: "2017",
      marks: "10",
      label: "Demonetization Rationale & Macroeconomic Impact",
      theme: "Monetary Policy & Black Money",
      subject: "General Studies 3",
      question: "Show how demonetization has affected the informal sector and digital payments in India."
    },
    {
      id: "gs3-2017-q2",
      year: "2017",
      marks: "15",
      label: "Contract Farming & Agricultural Marketing",
      theme: "Agri-Business & Supply Chain",
      subject: "General Studies 3",
      question: "Explain various types of revolutions, took place in Agriculture after Independence in India. How have these revolutions helped in poverty alleviation?"
    },
    {
      id: "gs3-2017-q3",
      year: "2017",
      marks: "15",
      label: "Nuclear Power in India: Thorium Cycle",
      theme: "Nuclear Energy & Technology",
      subject: "General Studies 3",
      question: "Give an account of the growth and development of nuclear science and technology in India. What is the advantage of fast breeder reactors?"
    },
    {
      id: "gs3-2017-q4",
      year: "2017",
      marks: "15",
      label: "Terrorism Financing & Hawala Networks",
      theme: "Internal Security & Counter-Terrorism",
      subject: "General Studies 3",
      question: "The scourge of terrorism is a grave challenge to national security. What are the sources of terror funding and how effective is the NIA in dismantling them?"
    },

    // 2016
    {
      id: "gs3-2016-q1",
      year: "2016",
      marks: "12.5",
      label: "Make in India & Manufacturing Competitiveness",
      theme: "Industrial Policy & FDI",
      subject: "General Studies 3",
      question: "'Success of Make in India depends on ease of doing business and infrastructure development.' Discuss."
    },
    {
      id: "gs3-2016-q2",
      year: "2016",
      marks: "12.5",
      label: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      theme: "Crop Insurance & Risk Management",
      subject: "General Studies 3",
      question: "How does PMFBY compare with earlier crop insurance schemes? Does it provide adequate financial cushion against weather shocks?"
    },
    {
      id: "gs3-2016-q3",
      year: "2016",
      marks: "12.5",
      label: "ISRO Mars Orbiter Mission & Space Commercialization",
      theme: "Space Science & Antrix/NSIL",
      subject: "General Studies 3",
      question: "Discuss India's achievements in the field of Space Science and Technology. How has the application of satellite tech helped in disaster warning?"
    },
    {
      id: "gs3-2016-q4",
      year: "2016",
      marks: "12.5",
      label: "Border Management in North-East & Porous Borders",
      theme: "Internal Security",
      subject: "General Studies 3",
      question: "Border management is a complex task due to difficult terrain and hostile neighbors. Highlight the strategic initiatives taken by India along Indo-Myanmar border."
    },

    // 2015
    {
      id: "gs3-2015-q1",
      year: "2015",
      marks: "12.5",
      label: "Gold Monetization Scheme & CAD Management",
      theme: "Fiscal & Current Account Deficit",
      subject: "General Studies 3",
      question: "Can the Gold Monetization Scheme and Sovereign Gold Bond Scheme curb physical gold import and reduce India's Current Account Deficit?"
    },
    {
      id: "gs3-2015-q2",
      year: "2015",
      marks: "12.5",
      label: "Livestock Economy & Blue Revolution",
      theme: "Allied Agriculture & Fisheries",
      subject: "General Studies 3",
      question: "Livestock rearing has a big potential for providing non-farm employment and income in rural areas. Discuss government efforts in this direction."
    },
    {
      id: "gs3-2015-q3",
      year: "2015",
      marks: "12.5",
      label: "Paris Climate Agreement (COP21) & INDC Commitments",
      theme: "Environment & Climate Treaties",
      subject: "General Studies 3",
      question: "Discuss the key outcomes of the Paris Climate Agreement (COP-21). How do India's Nationally Determined Contributions reflect the principle of CBDR?"
    },
    {
      id: "gs3-2015-q4",
      year: "2015",
      marks: "12.5",
      label: "Smart Border Fencing & CIBMS",
      theme: "Internal Security",
      subject: "General Studies 3",
      question: "Analyze the security challenges arising from illegal immigration along India's eastern borders. Suggest policy remedies."
    },

    // 2014
    {
      id: "gs3-2014-q1",
      year: "2014",
      marks: "10",
      label: "Public-Private Partnerships (PPP) Models in Infrastructure",
      theme: "Infrastructure & Investment Models",
      subject: "General Studies 3",
      question: "Why is PPP required in infrastructural projects? What are the limitations of BOT and HAM models in Indian road construction?"
    },
    {
      id: "gs3-2014-q2",
      year: "2014",
      marks: "10",
      label: "Agricultural APMC Acts & National Agriculture Market (e-NAM)",
      theme: "Agri-Marketing Reforms",
      subject: "General Studies 3",
      question: "Discuss the impediments created by the Agricultural Produce Market Committee (APMC) Acts in price discovery and farmer profits."
    },
    {
      id: "gs3-2014-q3",
      year: "2014",
      marks: "10",
      label: "Disaster Preparedness: Sendai Framework vs Hyogo",
      theme: "Disaster Management",
      subject: "General Studies 3",
      question: "How does the Sendai Framework for Disaster Risk Reduction (2015-2030) advance over the Hyogo Framework? Discuss India's national disaster management plan."
    },
    {
      id: "gs3-2014-q4",
      year: "2014",
      marks: "10",
      label: "Cyber Crime: Ransomware & Critical Sector Defense",
      theme: "Cybersecurity",
      subject: "General Studies 3",
      question: "Explain the threat of ransomware attacks on banking and financial institutions. What proactive mechanisms are deployed by CERT-In?"
    },

    // 2013
    {
      id: "gs3-2013-q1",
      year: "2013",
      marks: "10",
      label: "FRBM Act 2003 & Fiscal Deficit Consolidation",
      theme: "Fiscal Management & FRBM",
      subject: "General Studies 3",
      question: "Discuss the rationale of introducing the Fiscal Responsibility and Budget Management (FRBM) Act, 2003. Has it achieved its fiscal targets?"
    },
    {
      id: "gs3-2013-q2",
      year: "2013",
      marks: "10",
      label: "National Food Security Act 2013 & Fiscal Burden",
      theme: "Food Security & Welfare",
      subject: "General Studies 3",
      question: "Analyze the salient features of the National Food Security Act, 2013. Discuss the fiscal implications and logistical challenges of grain storage."
    },
    {
      id: "gs3-2013-q3",
      year: "2013",
      marks: "10",
      label: "Composite Materials (FRP) & Industrial Application",
      theme: "Applied Materials Science",
      subject: "General Studies 3",
      question: "What are Fibre Reinforced Plastics (FRP)? Discuss their manufacturing advantages and applications in aerospace and automobile industries."
    },
    {
      id: "gs3-2013-q4",
      year: "2013",
      marks: "10",
      label: "Money Laundering & Shell Entities",
      theme: "Internal Security & Black Money",
      subject: "General Studies 3",
      question: "Money laundering poses a serious threat to national security and financial system integrity. Discuss the institutional measures taken under PMLA, 2002."
    }
  ],

  "General Studies 4": [
    // 2026
    {
      id: "gs4-2026-q1",
      year: "2026",
      marks: "10",
      label: "Moral Commitments in International Relations",
      theme: "Global Ethics & Moral Philosophy",
      subject: "General Studies 4",
      question: "'A nation that does not honor its moral commitments forfeits the moral right to lead.' Examine this maxim in the context of international relations."
    },
    {
      id: "gs4-2026-q2",
      year: "2026",
      marks: "10",
      label: "Cognitive Biases & Administrative Ethics",
      theme: "Moral Psychology & Decision Making",
      subject: "General Studies 4",
      question: "How can cognitive biases such as confirmation bias and groupthink compromise ethical decision-making among civil servants? Suggest remedial mechanisms."
    },

    // 2025
    {
      id: "gs4-2025-q1",
      year: "2025",
      marks: "10",
      label: "Objectivity vs Empathy in Public Administration",
      theme: "Foundational Civil Service Values",
      subject: "General Studies 4",
      question: "Objectivity without empathy becomes callous bureaucracy; empathy without objectivity leads to administrative chaos. Discuss with examples from public service."
    },
    {
      id: "gs4-2025-q2",
      year: "2025",
      marks: "10",
      label: "Corporate Sustainability vs Greenwashing Ethics",
      theme: "Corporate Governance & Business Ethics",
      subject: "General Studies 4",
      question: "Differentiate between authentic corporate sustainability practices and deceptive 'greenwashing' from an ethical standpoint."
    },
    {
      id: "gs4-2025-q3",
      year: "2025",
      marks: "20",
      label: "Case Study: Whistleblowing in Public Procurement",
      theme: "Ethics Case Study",
      subject: "General Studies 4",
      question: "A senior district administrator uncovers irregular procurement contracts in a flagship welfare project managed by politically connected contractors. Analyze the ethical dilemmas and outline the course of action balancing public interest, whistleblower safety, and evidence preservation."
    },

    // 2024
    {
      id: "gs4-2024-q1",
      year: "2024",
      marks: "10",
      label: "Ethics in International Aid",
      theme: "Global Ethics & Aid",
      subject: "General Studies 4",
      question: "International aid is an accepted form of helping resource-challenged nations. Comment on ethics in international aid with contemporary examples."
    },
    {
      id: "gs4-2024-q2",
      year: "2024",
      marks: "15",
      label: "Integrity without Knowledge vs Knowledge without Integrity",
      theme: "Philosophical Maxims & Public Office",
      subject: "General Studies 4",
      question: "Integrity without knowledge is weak and useless, and knowledge without integrity is dangerous and dreadful. What do you understand by this statement in the context of civil administration?"
    },
    {
      id: "gs4-2024-q3",
      year: "2024",
      marks: "10",
      label: "AI in Administrative Decision-Making",
      theme: "Technology Ethics & Governance",
      subject: "General Studies 4",
      question: "Can Artificial Intelligence replace human empathy and discretion in ethical public administration? Discuss with potential moral hazards."
    },
    {
      id: "gs4-2024-q4",
      year: "2024",
      marks: "20",
      label: "Case Study: Conflict of Interest in Land Acquisition",
      theme: "Case Study & Administrative Integrity",
      subject: "General Studies 4",
      question: "You are the District Magistrate overseeing a high-speed corridor project. A real estate firm owned by your spouse's relative has acquired land along the proposed alignment. The local media alleges leak of confidential alignment maps. Formulate your course of action."
    },

    // 2023
    {
      id: "gs4-2023-q1",
      year: "2023",
      marks: "10",
      label: "Ethics in Civil Services & Human Life",
      theme: "Foundational Civil Service Values",
      subject: "General Studies 4",
      question: "What does ethics seek to promote in human life? Why is it all the more important in civil services?"
    },
    {
      id: "gs4-2023-q2",
      year: "2023",
      marks: "10",
      label: "Emotional Intelligence in Governance",
      theme: "Emotional Intelligence & Conflict Management",
      subject: "General Studies 4",
      question: "Explain the concept of 'Emotional Intelligence' and its utility in day-to-day governance and conflict management."
    },
    {
      id: "gs4-2023-q3",
      year: "2023",
      marks: "10",
      label: "Moral Intuition vs Rational Deliberation",
      theme: "Moral Psychology",
      subject: "General Studies 4",
      question: "Is conscience an infallible guide to moral decision-making for public officials? Discuss in light of institutional rules versus personal morality."
    },
    {
      id: "gs4-2023-q4",
      year: "2023",
      marks: "20",
      label: "Case Study: Sexual Harassment & Institutional Silence",
      theme: "Workplace Ethics & Gender Justice",
      subject: "General Studies 4",
      question: "A junior female officer reports systematic harassment by a decorated senior chief architect. The Internal Complaints Committee is hesitant due to the architect's political influence. As the Departmental Head, delineate your ethical and legal responses."
    },

    // 2022
    {
      id: "gs4-2022-q1",
      year: "2022",
      marks: "10",
      label: "Administrative Wisdom: What to Reckon and Overlook",
      theme: "Administrative Discretion",
      subject: "General Studies 4",
      question: "Wisdom lies in knowing what to reckon with and what to overlook. How is this relevant to public administrators?"
    },
    {
      id: "gs4-2022-q2",
      year: "2022",
      marks: "10",
      label: "Crisis of Ethical Values in Good Governance",
      theme: "Probity & Public Values",
      subject: "General Studies 4",
      question: "Apart from intellectual competency and moral qualities, empathy and compassion are some of the other vital attributes that facilitate the civil servants to be more competent. Discuss."
    },
    {
      id: "gs4-2022-q3",
      year: "2022",
      marks: "20",
      label: "Case Study: Industrial Pollution vs Local Employment",
      theme: "Environmental Ethics vs Economy",
      subject: "General Studies 4",
      question: "A chemical factory employing 2,000 local breadwinners is discharging untreated carcinogenic effluent into a drinking water canal. Closing it causes mass joblessness; letting it run poisons thousands. As District Collector, propose an ethically sound resolution."
    },

    // 2021
    {
      id: "gs4-2021-q1",
      year: "2021",
      marks: "10",
      label: "Inculcating Positive Attitude in Civil Servants",
      theme: "Attitude & Moral Conditioning",
      subject: "General Studies 4",
      question: "Attitude is an important component that goes as input in the development of human personality. How can positive attitude be inculcated in civil servants?"
    },
    {
      id: "gs4-2021-q2",
      year: "2021",
      marks: "10",
      label: "Seven Sins of Mahatma Gandhi",
      theme: "Moral Thinkers & Philosophy",
      subject: "General Studies 4",
      question: "Explain Mahatma Gandhi's formulation of 'Commerce without Morality' and 'Politics without Principles' with contemporary relevance."
    },
    {
      id: "gs4-2021-q3",
      year: "2021",
      marks: "20",
      label: "Case Study: Pandemic Vaccine Allocation Dilemma",
      theme: "Distributive Justice & Public Health",
      subject: "General Studies 4",
      question: "During a severe pandemic surge, your district receives only 5,000 doses for 100,000 residents. Influential politicians demand allocation for their cadre, while vulnerable slum elderly lack access. Formulate an ethical triage and allocation protocol."
    },

    // 2020
    {
      id: "gs4-2020-q1",
      year: "2020",
      marks: "10",
      label: "Hatred is Corrosive of Reason and Compassion",
      theme: "Emotional Control & Ethical Philosophy",
      subject: "General Studies 4",
      question: "'Hatred is corrosive of reason and compassion.' Evaluate this quote by the Buddha in the context of communal harmony and administrative neutrality."
    },
    {
      id: "gs4-2020-q2",
      year: "2020",
      marks: "10",
      label: "Code of Conduct vs Code of Ethics",
      theme: "Administrative Ethics",
      subject: "General Studies 4",
      question: "Distinguish between a 'Code of Conduct' and a 'Code of Ethics'. Why is an aspirational code of ethics essential alongside punitive disciplinary rules?"
    },
    {
      id: "gs4-2020-q3",
      year: "2020",
      marks: "20",
      label: "Case Study: Migrant Distress during National Lockdown",
      theme: "Empathy & Crisis Administration",
      subject: "General Studies 4",
      question: "Thousands of hungry migrant workers are marching on national highways defying curfew orders during a lockdown. State borders are sealed. As the border district magistrate, devise an operationally humane and legally compliant protocol."
    },

    // 2019
    {
      id: "gs4-2019-q1",
      year: "2019",
      marks: "10",
      label: "Public Interest vs Political Expediency",
      theme: "Administrative Neutrality",
      subject: "General Studies 4",
      question: "What are basic principles of public life? Illustrate any three with suitable examples."
    },
    {
      id: "gs4-2019-q2",
      year: "2019",
      marks: "10",
      label: "Aristotle: Virtue Ethics & Golden Mean",
      theme: "Western Moral Philosophy",
      subject: "General Studies 4",
      question: "Explain the Aristotelian doctrine of the 'Golden Mean'. How can an administrator avoid the extremes of deficiency and excess?"
    },
    {
      id: "gs4-2019-q3",
      year: "2019",
      marks: "20",
      label: "Case Study: Whistleblowing in Public Procurement",
      theme: "Whistleblowing & Retaliation",
      subject: "General Studies 4",
      question: "You discover your Departmental Secretary has rigged a ₹500 crore tender to favor a politically connected firm. Threatening phone calls warn you against filing a dissent note. Evaluate your options and ethical course of action."
    },

    // 2018
    {
      id: "gs4-2018-q1",
      year: "2018",
      marks: "10",
      label: "Kant's Categorical Imperative in Civil Service",
      theme: "Deontological Ethics",
      subject: "General Studies 4",
      question: "Explain Immanuel Kant's formulation: 'Act in such a way that you treat humanity, whether in your own person or in the person of another, always at the same time as an end, never merely as a means.' Apply to civil service."
    },
    {
      id: "gs4-2018-q2",
      year: "2018",
      marks: "10",
      label: "Empathy, Compassion & Tolerance towards Weaker Sections",
      theme: "Civil Service Values",
      subject: "General Studies 4",
      question: "State the three basic values which, in your opinion, are indispensable on the part of civil servants and why."
    },
    {
      id: "gs4-2018-q3",
      year: "2018",
      marks: "20",
      label: "Case Study: Food Grain Diversion & Starvation Death",
      theme: "PDS Accountability & Human Rights",
      subject: "General Studies 4",
      question: "A poor tribal family's ration card was cancelled due to biometric mismatch, resulting in the starvation death of a child. Local shopkeepers forged distribution records. As Sub-Divisional Magistrate, conduct the inquiry and outline corrective measures."
    },

    // 2017
    {
      id: "gs4-2017-q1",
      year: "2017",
      marks: "10",
      label: "Conflict of Interest: Actual, Potential & Perceived",
      theme: "Probity & Conflict of Interest",
      subject: "General Studies 4",
      question: "Conflict of interest in the public sector arises when an official's personal interest influences public duties. Differentiate between actual, potential, and perceived conflict of interest with examples."
    },
    {
      id: "gs4-2017-q2",
      year: "2017",
      marks: "10",
      label: "Young Administrators: Temptation vs Ethical Fortitude",
      theme: "Moral Conditioning",
      subject: "General Studies 4",
      question: "Great ambition and desire for quick recognition often compromise ethical conduct of public servants. Do you agree? How can young civil servants build moral fortitude?"
    },
    {
      id: "gs4-2017-q3",
      year: "2017",
      marks: "20",
      label: "Case Study: Illegal Mining Cartel & Officer Safety",
      theme: "Courage of Conviction",
      subject: "General Studies 4",
      question: "As Assistant Conservator of Forests, you intercept 15 sand-mining trucks linked to an influential minister. The local police station refuses to register an FIR and your team is surrounded by armed goons. Outline your tactical and ethical decisions."
    },

    // 2016
    {
      id: "gs4-2016-q1",
      year: "2016",
      marks: "10",
      label: "Nolan Committee's Seven Principles of Public Life",
      theme: "Public Service Values",
      subject: "General Studies 4",
      question: "Explain the Nolan Committee's Seven Principles of Public Life (Selflessness, Integrity, Objectivity, Accountability, Openness, Honesty, Leadership). How are they applied in Indian administration?"
    },
    {
      id: "gs4-2016-q2",
      year: "2016",
      marks: "10",
      label: "Law vs Conscience as Source of Ethical Guidance",
      theme: "Moral Conscience",
      subject: "General Studies 4",
      question: "What is meant by 'crisis of conscience'? How can an upright officer reconcile strict administrative legality with higher humanitarian morality?"
    },
    {
      id: "gs4-2016-q3",
      year: "2016",
      marks: "20",
      label: "Case Study: Slum Eviction for Mega Infrastructure",
      theme: "Rehabilitation & Utilitarianism",
      subject: "General Studies 4",
      question: "A high-prestige Metro Rail project requires immediate eviction of 500 informal families before the monsoon. Transit shelters are not ready, but stalling work incurs ₹2 crore daily contractual penalties. As Project Director, resolve the impasse."
    },

    // 2015
    {
      id: "gs4-2015-q1",
      year: "2015",
      marks: "10",
      label: "Max Weber's Bureaucracy & Ethical Neutrality",
      theme: "Bureaucratic Theory",
      subject: "General Studies 4",
      question: "Evaluate Max Weber's bureaucratic model of formal rationality and value-neutrality. Does excess impersonality lead to administrative callousness?"
    },
    {
      id: "gs4-2015-q2",
      year: "2015",
      marks: "10",
      label: "John Rawls: Veil of Ignorance & Justice as Fairness",
      theme: "Distributive Justice",
      subject: "General Studies 4",
      question: "Explain John Rawls' concept of 'Veil of Ignorance'. How can this thought experiment assist policymakers in designing welfare policies for the poorest?"
    },
    {
      id: "gs4-2015-q3",
      year: "2015",
      marks: "20",
      label: "Case Study: Adulterated Baby Food & Corporate Pressure",
      theme: "Corporate Social Responsibility & Safety",
      subject: "General Studies 4",
      question: "You are the Quality Control Officer in a top infant nutrition MNC. Lab tests reveal permissible limits of heavy metals were exceeded in 100,000 distributed cans. The CEO orders a discreet cover-up to protect share value. What do you do?"
    },

    // 2014
    {
      id: "gs4-2014-q1",
      year: "2014",
      marks: "10",
      label: "Integrity, Perseverance & Spirit of Service",
      theme: "Foundational Values",
      subject: "General Studies 4",
      question: "What do you understand by the following terms in the context of civil service: (a) Integrity (b) Perseverance (c) Spirit of service (d) Commitment (e) Courage of conviction?"
    },
    {
      id: "gs4-2014-q2",
      year: "2014",
      marks: "10",
      label: "Whistleblower Protection: Legal & Institutional Deficits",
      theme: "Whistleblowing",
      subject: "General Studies 4",
      question: "Examine the moral obligation of whistleblowing against organizational misconduct. Why do whistleblowers in public administration face social isolation and professional ruin?"
    },
    {
      id: "gs4-2014-q3",
      year: "2014",
      marks: "20",
      label: "Case Study: Pressure to Clear Defective Hospital Construction",
      theme: "Professional Ethics & Public Safety",
      subject: "General Studies 4",
      question: "An Executive Engineer is pressured by a Member of Parliament to sign structural fitness certificates for a newly constructed government super-specialty hospital despite low-grade cement and substandard pillars. Detail your ethical course of action."
    },

    // 2013
    {
      id: "gs4-2013-q1",
      year: "2013",
      marks: "10",
      label: "What is Ethics? Dimensions in Private vs Public Relationships",
      theme: "Foundational Ethics",
      subject: "General Studies 4",
      question: "What do you understand by 'values' and 'ethics'? In what ways is it important in the governance of a society? Distinguish between ethical dilemmas in private and public relationships."
    },
    {
      id: "gs4-2013-q2",
      year: "2013",
      marks: "10",
      label: "Integrity in Corporate Governance",
      theme: "Corporate Ethics & CSR",
      subject: "General Studies 4",
      question: "Discuss the relationship between moral integrity and professional efficiency in corporate governance with reference to corporate scams in recent years."
    },
    {
      id: "gs4-2013-q3",
      year: "2013",
      marks: "10",
      label: "Emotional Intelligence in Public Relations",
      theme: "Emotional Intelligence",
      subject: "General Studies 4",
      question: "Can emotional intelligence be learned and developed through training? Discuss its practical utility in resolving mass public protests."
    },
    {
      id: "gs4-2013-q4",
      year: "2013",
      marks: "20",
      label: "Case Study: Political Pressure to Disperse Peaceful Protests",
      theme: "Police Ethics & Human Rights",
      subject: "General Studies 4",
      question: "As Superintendent of Police, you face an unyielding crowd of peaceful farmers protesting land acquisition without compensation. The Home Minister orders you to use water cannons and lathi-charge to clear the highway before VIP convoy arrives. Formulate your strategy."
    }
  ],

  "Essay": [
    // 2026
    {
      id: "essay-2026-q1",
      year: "2026",
      marks: "125",
      label: "Silence in the Face of Injustice",
      theme: "Ethics & Civic Responsibility",
      subject: "Essay",
      question: "Silence in the face of injustice is complicity dressed as neutrality."
    },
    {
      id: "essay-2026-q2",
      year: "2026",
      marks: "125",
      label: "Nature Never Deceives Us",
      theme: "Ecology & Philosophy of Truth",
      subject: "Essay",
      question: "Nature never deceives us; it is always we who deceive ourselves."
    },

    // 2025
    {
      id: "essay-2025-q1",
      year: "2025",
      marks: "125",
      label: "Technology and Humanity's Moral Compass",
      theme: "Technology & Human Values",
      subject: "Essay",
      question: "In the pursuit of technological efficiency, humanity must not lose its moral compass."
    },
    {
      id: "essay-2025-q2",
      year: "2025",
      marks: "125",
      label: "Measure of Civilization: Who It Leaves Behind",
      theme: "Social Justice & Development",
      subject: "Essay",
      question: "The true measure of a civilization lies not in what it builds, but in who it refuses to leave behind."
    },

    // 2024
    {
      id: "essay-2024-q1",
      year: "2024",
      marks: "125",
      label: "Wisdom Finds Truth",
      theme: "Philosophical Reflection",
      subject: "Essay",
      question: "Wisdom finds truth."
    },
    {
      id: "essay-2024-q2",
      year: "2024",
      marks: "125",
      label: "Courage to Accept and Dedication to Improve",
      theme: "Ethical & Human Resilience",
      subject: "Essay",
      question: "Courage to accept and dedication to improve are two keys to success."
    },
    {
      id: "essay-2024-q3",
      year: "2024",
      marks: "125",
      label: "The Best Way to Find Yourself is to Lose Yourself",
      theme: "Self-Actualization & Altruism",
      subject: "Essay",
      question: "The best way to find yourself is to lose yourself in the service of others."
    },
    {
      id: "essay-2024-q4",
      year: "2024",
      marks: "125",
      label: "Customs Shapes Human Identity",
      theme: "Cultural Anthropology",
      subject: "Essay",
      question: "Customs are the lenses through which we view society."
    },

    // 2023
    {
      id: "essay-2023-q1",
      year: "2023",
      marks: "125",
      label: "Thinking is Like a Game",
      theme: "Critical Reasoning & Dialectics",
      subject: "Essay",
      question: "Thinking is like a game, it does not begin unless there is an opposite team."
    },
    {
      id: "essay-2023-q2",
      year: "2023",
      marks: "125",
      label: "Visionary Decision-Making: Intuition and Logic",
      theme: "Leadership & Cognitive Balance",
      subject: "Essay",
      question: "Visionary decision-making happens at the intersection of intuition and logic."
    },
    {
      id: "essay-2023-q3",
      year: "2023",
      marks: "125",
      label: "Not All Who Wander Are Lost",
      theme: "Human Exploration & Perseverance",
      subject: "Essay",
      question: "Not all who wander are lost."
    },
    {
      id: "essay-2023-q4",
      year: "2023",
      marks: "125",
      label: "Inspiration for a Poet vs Philosophical Solitude",
      theme: "Art, Aesthetics & Philosophy",
      subject: "Essay",
      question: "Inspiration for a poet is a luxury, but for a philosopher it is a necessity."
    },

    // 2022
    {
      id: "essay-2022-q1",
      year: "2022",
      marks: "125",
      label: "Forests: Best Case Studies for Economic Excellence",
      theme: "Ecology & Sustainable Economics",
      subject: "Essay",
      question: "Forests are the best case studies for economic excellence."
    },
    {
      id: "essay-2022-q2",
      year: "2022",
      marks: "125",
      label: "Poets are the Unacknowledged Legislators",
      theme: "Literature, Society & Law",
      subject: "Essay",
      question: "Poets are the unacknowledged legislators of the world."
    },
    {
      id: "essay-2022-q3",
      year: "2022",
      marks: "125",
      label: "History is a Series of Victories over Scientific Doubts",
      theme: "Epistemology & Science",
      subject: "Essay",
      question: "History is a series of victories won by the scientific man over the romantic man."
    },
    {
      id: "essay-2022-q4",
      year: "2022",
      marks: "125",
      label: "A Ship in Harbour is Safe, but that is not what Ships are built for",
      theme: "Risk, Enterprise & Human Courage",
      subject: "Essay",
      question: "A ship in harbour is safe, but that is not what ship is built for."
    },

    // 2021
    {
      id: "essay-2021-q1",
      year: "2021",
      marks: "125",
      label: "The Real is Rational and Rational is Real",
      theme: "Hegelian Philosophy",
      subject: "Essay",
      question: "The real is rational and the rational is real."
    },
    {
      id: "essay-2021-q2",
      year: "2021",
      marks: "125",
      label: "Hand That Rocks the Cradle Rules the World",
      theme: "Gender, Nurture & Civilizational Destiny",
      subject: "Essay",
      question: "The hand that rocks the cradle rules the world."
    },
    {
      id: "essay-2021-q3",
      year: "2021",
      marks: "125",
      label: "What is Research but a Blind Date with Knowledge?",
      theme: "Science, Discovery & Curiosity",
      subject: "Essay",
      question: "What is research but a blind date with knowledge?"
    },
    {
      id: "essay-2021-q4",
      year: "2021",
      marks: "125",
      label: "Simplicity is the Ultimate Sophistication",
      theme: "Philosophy of Life",
      subject: "Essay",
      question: "Simplicity is the ultimate sophistication."
    },

    // 2020
    {
      id: "essay-2020-q1",
      year: "2020",
      marks: "125",
      label: "Life is Long if You Know How to Use It",
      theme: "Existential Philosophy",
      subject: "Essay",
      question: "Life is long if you know how to use it."
    },
    {
      id: "essay-2020-q2",
      year: "2020",
      marks: "125",
      label: "Mindful Mind is Greater than Mind Full of Thoughts",
      theme: "Mental Health & Wisdom",
      subject: "Essay",
      question: "A mindful mind is greater than a mind full of thoughts."
    },
    {
      id: "essay-2020-q3",
      year: "2020",
      marks: "125",
      label: "Ships Do Not Sink because of Water around Them",
      theme: "Internal Resilience",
      subject: "Essay",
      question: "Ships do not sink because of water around them; ships sink because of water that gets into them."
    },
    {
      id: "essay-2020-q4",
      year: "2020",
      marks: "125",
      label: "Philosophy of Wantlessness is Utopian",
      theme: "Economics & Desires",
      subject: "Essay",
      question: "Philosophy of wantlessness is utopian, while materialism is a chimaera."
    },

    // 2019
    {
      id: "essay-2019-q1",
      year: "2019",
      marks: "125",
      label: "Courage to Face the Unknown",
      theme: "Exploration & Human Will",
      subject: "Essay",
      question: "Wisdom lies in knowing what to reckon with and what to overlook."
    },
    {
      id: "essay-2019-q2",
      year: "2019",
      marks: "125",
      label: "Individual vs Collective Good",
      theme: "Social Philosophy",
      subject: "Essay",
      question: "Individual morality versus collective social values: navigating the contemporary friction."
    },
    {
      id: "essay-2019-q3",
      year: "2019",
      marks: "125",
      label: "Biased Media is a Threat to Democracy",
      theme: "Fourth Estate & Public Discourse",
      subject: "Essay",
      question: "Biased media is a real threat to Indian democracy."
    },
    {
      id: "essay-2019-q4",
      year: "2019",
      marks: "125",
      label: "Rise of Artificial Intelligence: Master or Servant?",
      theme: "Technology & Humanity",
      subject: "Essay",
      question: "Rise of Artificial Intelligence: Threat of an intellectual duopoly or tool for human emancipation?"
    },

    // 2018
    {
      id: "essay-2018-q1",
      year: "2018",
      marks: "125",
      label: "Alternative Technologies for a Climate Change Resilient India",
      theme: "Environment & Sustainable Technology",
      subject: "Essay",
      question: "Alternative technologies for a climate change resilient India."
    },
    {
      id: "essay-2018-q2",
      year: "2018",
      marks: "125",
      label: "A Good Life is One Inspired by Love and Guided by Knowledge",
      theme: "Russell's Humanistic Philosophy",
      subject: "Essay",
      question: "A good life is one inspired by love and guided by knowledge."
    },
    {
      id: "essay-2018-q3",
      year: "2018",
      marks: "125",
      label: "Customary Morality Cannot Be a Guide to Modern Law",
      theme: "Jurisprudence & Constitutional Morality",
      subject: "Essay",
      question: "Customary morality cannot be a guide to modern constitutional law."
    },
    {
      id: "essay-2018-q4",
      year: "2018",
      marks: "125",
      label: "Poverty Anywhere is a Threat to Prosperity Everywhere",
      theme: "Global Inequality & Social Justice",
      subject: "Essay",
      question: "Poverty anywhere is a threat to prosperity everywhere."
    },

    // 2017
    {
      id: "essay-2017-q1",
      year: "2017",
      marks: "125",
      label: "Farming has Lost the Ability to be a Source of Joy",
      theme: "Agrarian Distress",
      subject: "Essay",
      question: "Farming has lost the ability to be a source of joy for our farmers."
    },
    {
      id: "essay-2017-q2",
      year: "2017",
      marks: "125",
      label: "Fulfillment of 'New Woman' in India is a Myth",
      theme: "Gender & Societal Reality",
      subject: "Essay",
      question: "Fulfillment of 'new woman' in India is a myth."
    },
    {
      id: "essay-2017-q3",
      year: "2017",
      marks: "125",
      label: "We May Brave Human Laws, but Cannot Resist Natural Laws",
      theme: "Ecology & Climate Limits",
      subject: "Essay",
      question: "We may brave human laws, but we cannot resist natural laws."
    },
    {
      id: "essay-2017-q4",
      year: "2017",
      marks: "125",
      label: "Destiny of a Nation is Shaped in its Classrooms",
      theme: "Education & National Rebuilding",
      subject: "Essay",
      question: "Destiny of a nation is shaped in its classrooms."
    },

    // 2016
    {
      id: "essay-2016-q1",
      year: "2016",
      marks: "125",
      label: "If Development is not Engendered, It is Endangered",
      theme: "Gender Inclusive Economics",
      subject: "Essay",
      question: "If development is not engendered, it is endangered."
    },
    {
      id: "essay-2016-q2",
      year: "2016",
      marks: "125",
      label: "Need Brings Greed, If Greed Increases it Spoils Breed",
      theme: "Consumerism & Moral Ruin",
      subject: "Essay",
      question: "Need brings greed, if greed increases it spoils breed."
    },
    {
      id: "essay-2016-q3",
      year: "2016",
      marks: "125",
      label: "Water Disputes between States in Federal India",
      theme: "Federalism & Hydropolitics",
      subject: "Essay",
      question: "Water disputes between states in federal India."
    },
    {
      id: "essay-2016-q4",
      year: "2016",
      marks: "125",
      label: "Innovation is the Key Determinant of Economic Strength",
      theme: "Science, R&D and Prosperity",
      subject: "Essay",
      question: "Innovation is the key determinant of economic strength and social welfare."
    },

    // 2015
    {
      id: "essay-2015-q1",
      year: "2015",
      marks: "125",
      label: "Lending Hands to Someone is Better than Giving a Dole",
      theme: "Empowerment vs Dependency",
      subject: "Essay",
      question: "Lending hands to someone is better than giving a dole."
    },
    {
      id: "essay-2015-q2",
      year: "2015",
      marks: "125",
      label: "Quick but Steady Wins the Race",
      theme: "Agility in Modern Administration",
      subject: "Essay",
      question: "Quick but steady wins the race."
    },
    {
      id: "essay-2015-q3",
      year: "2015",
      marks: "125",
      label: "Character of an Institution is Reflected in its Leader",
      theme: "Institutional Leadership",
      subject: "Essay",
      question: "Character of an institution is reflected in its leader."
    },
    {
      id: "essay-2015-q4",
      year: "2015",
      marks: "125",
      label: "Education Without Values, As Useful As It Is, Seems Rather To Make A Man More Clever Devil",
      theme: "Values in Education",
      subject: "Essay",
      question: "Education without values, as useful as it is, seems rather to make a man more clever devil."
    },

    // 2014
    {
      id: "essay-2014-q1",
      year: "2014",
      marks: "125",
      label: "With Greater Power Comes Greater Responsibility",
      theme: "Accountability & Authority",
      subject: "Essay",
      question: "With greater power comes greater responsibility."
    },
    {
      id: "essay-2014-q2",
      year: "2014",
      marks: "125",
      label: "Words are Sharper than the Two-Edged Sword",
      theme: "Power of Rhetoric & Dialogue",
      subject: "Essay",
      question: "Words are sharper than the two-edged sword."
    },
    {
      id: "essay-2014-q3",
      year: "2014",
      marks: "125",
      label: "Was it the Leadership that was Lacking or the Ideology?",
      theme: "Historical Analysis & Political Movements",
      subject: "Essay",
      question: "Was it the leadership that was lacking or the ideology in failing social reform movements?"
    },
    {
      id: "essay-2014-q4",
      year: "2014",
      marks: "125",
      label: "Tourism: Can It Be the Next Big Thing for India?",
      theme: "Economic Development & Cultural Heritage",
      subject: "Essay",
      question: "Tourism: Can it be the next big engine of employment and cultural diplomacy for India?"
    },

    // 2013
    {
      id: "essay-2013-q1",
      year: "2013",
      marks: "125",
      label: "Be the Change You Want to See in the World",
      theme: "Gandhian Philosophy",
      subject: "Essay",
      question: "Be the change you want to see in the world (Mahatma Gandhi)."
    },
    {
      id: "essay-2013-q2",
      year: "2013",
      marks: "125",
      label: "Is the Colonial Mentality Hindering India's Success?",
      theme: "Decolonization of Mind",
      subject: "Essay",
      question: "Is the colonial mentality still hindering India's success as an independent superpower?"
    },
    {
      id: "essay-2013-q3",
      year: "2013",
      marks: "125",
      label: "GDP (Gross Domestic Product) along with GDH (Gross Domestic Happiness)",
      theme: "Holistic Development",
      subject: "Essay",
      question: "GDP (Gross Domestic Product) along with GDH (Gross Domestic Happiness) would be the right indices for judging the well-being of a country."
    },
    {
      id: "essay-2013-q4",
      year: "2013",
      marks: "125",
      label: "Science and Technology is the Panacea for the Growth and Security of the Nation",
      theme: "Science, Sovereignty & Technology",
      subject: "Essay",
      question: "Science and technology is the panacea for the growth and security of the nation."
    }
  ],

  "Law Optional": [
    // 2026
    {
      id: "law-2026-q1",
      year: "2026",
      marks: "15",
      label: "Limits on Delegated Legislation & Excessive Delegation",
      theme: "Administrative Law",
      subject: "Law Optional",
      question: "Discuss the constitutional limits on delegated legislation and the doctrine of 'excessive delegation' with illustrative judicial decisions."
    },
    {
      id: "law-2026-q2",
      year: "2026",
      marks: "15",
      label: "Strict Liability & Statutory Mens Rea Exceptions",
      theme: "Criminal Law & Jurisprudence",
      subject: "Law Optional",
      question: "Examine the evolution of strict liability and statutory exceptions to the doctrine of 'mens rea' in modern economic and environmental offenses."
    },

    // 2025
    {
      id: "law-2025-q1",
      year: "2025",
      marks: "15",
      label: "Doctrine of Proportionality in Judicial Review",
      theme: "Constitutional Law & Proportionality",
      subject: "Law Optional",
      question: "Examine the doctrine of proportionality as a tool of judicial review under Articles 14, 19, and 21 in light of recent Supreme Court jurisprudence."
    },
    {
      id: "law-2025-q2",
      year: "2025",
      marks: "20",
      label: "State Responsibility for Transboundary Cyber Attacks",
      theme: "Public International Law",
      subject: "Law Optional",
      question: "Critically evaluate state responsibility for cyber operations and ransomware attacks launched from within its territorial borders under Public International Law."
    },

    // 2024
    {
      id: "law-2024-q1",
      year: "2024",
      marks: "15",
      label: "Separation of Powers & Tribunalization",
      theme: "Constitutional & Administrative Law",
      subject: "Law Optional",
      question: "Critically evaluate the doctrine of Separation of Powers under the Indian Constitution in light of judicial appointments and tribunalization."
    },
    {
      id: "law-2024-q2",
      year: "2024",
      marks: "20",
      label: "Bharatiya Nyaya Sanhita (BNS) vs IPC",
      theme: "Criminal Law Reforms",
      subject: "Law Optional",
      question: "Examine the substantive structural shifts brought by Bharatiya Nyaya Sanhita (BNS), 2023 in replacing the Indian Penal Code, 1860 with reference to sedition, organized crime, and mob lynching."
    },

    // 2023
    {
      id: "law-2023-q1",
      year: "2023",
      marks: "20",
      label: "Basic Structure & Kesavananda Bharati at 50",
      theme: "Constitutional Law",
      subject: "Law Optional",
      question: "Discuss the doctrine of Basic Structure in light of Kesavananda Bharati and subsequent judicial pronouncements over the last 50 years."
    },
    {
      id: "law-2023-q2",
      year: "2023",
      marks: "15",
      label: "Article 21 & Puttaswamy Privacy Scope",
      theme: "Fundamental Rights",
      subject: "Law Optional",
      question: "Critically examine the scope of Article 21 with special reference to Right to Privacy and the Puttaswamy judgement."
    },

    // 2022
    {
      id: "law-2022-q1",
      year: "2022",
      marks: "15",
      label: "Strict vs Absolute Liability (Rylands vs Mehta)",
      theme: "Law of Torts",
      subject: "Law Optional",
      question: "Explain the difference between Strict Liability (Rylands v. Fletcher) and Absolute Liability (M.C. Mehta case) under the Law of Torts in India."
    },
    {
      id: "law-2022-q2",
      year: "2022",
      marks: "20",
      label: "State Responsibility in International Environmental Harm",
      theme: "Public International Law",
      subject: "Law Optional",
      question: "Examine the doctrine of State Responsibility under International Law in light of transboundary environmental harm and Trail Smelter arbitration."
    },

    // 2021
    {
      id: "law-2021-q1",
      year: "2021",
      marks: "15",
      label: "Common Intention (Sec 34) vs Common Object (Sec 149)",
      theme: "Criminal Law (IPC)",
      subject: "Law Optional",
      question: "Distinguish between 'Common Intention' under Section 34 and 'Common Object' under Section 149 of the Indian Penal Code with illustrative case laws."
    },
    {
      id: "law-2021-q2",
      year: "2021",
      marks: "20",
      label: "Promissory Estoppel against Government",
      theme: "Contract Law & Administrative Law",
      subject: "Law Optional",
      question: "Discuss the application and limitations of the doctrine of Promissory Estoppel against the Government in India (Motilal Padampat Sugar Mills case)."
    },

    // 2020
    {
      id: "law-2020-q1",
      year: "2020",
      marks: "15",
      label: "Natural Justice: Audi Alteram Partem Exceptions",
      theme: "Administrative Law",
      subject: "Law Optional",
      question: "The rules of natural justice are not embodied rules; their application depends on the facts and circumstances of each case. Discuss the exceptions to the rule of Audi Alteram Partem."
    },
    {
      id: "law-2020-q2",
      year: "2020",
      marks: "20",
      label: "Extradition & Double Criminality Principle",
      theme: "Public International Law",
      subject: "Law Optional",
      question: "Explain the concept of 'Extradition' and discuss the principles of 'Double Criminality' and 'Rule of Speciality' with leading international precedents."
    },

    // 2019
    {
      id: "law-2019-q1",
      year: "2019",
      marks: "15",
      label: "Doctrine of Severability & Eclipse under Article 13",
      theme: "Constitutional Law",
      subject: "Law Optional",
      question: "Explain the Doctrine of Severability and the Doctrine of Eclipse under Article 13 of the Constitution with landmark case laws."
    },
    {
      id: "law-2019-q2",
      year: "2019",
      marks: "20",
      label: "Culpable Homicide vs Murder (Section 299 vs 300)",
      theme: "Criminal Law (IPC)",
      subject: "Law Optional",
      question: "Analyze the distinction between Culpable Homicide not amounting to murder (Sec 299) and Murder (Sec 300) in the light of Reg v. Govinda and subsequent Supreme Court judgments."
    },

    // 2018
    {
      id: "law-2018-q1",
      year: "2018",
      marks: "15",
      label: "Delegated Legislation & Excessive Delegation",
      theme: "Administrative Law",
      subject: "Law Optional",
      question: "'Delegated legislation is a necessary evil in modern welfare state.' Examine the judicial controls over excessive delegation of legislative power in India."
    },
    {
      id: "law-2018-q2",
      year: "2018",
      marks: "20",
      label: "ICJ Jurisdiction & Advisory Opinions",
      theme: "International Law",
      subject: "Law Optional",
      question: "Examine the contentious and advisory jurisdiction of the International Court of Justice (ICJ) in light of the Kulbhushan Jadhav case."
    },

    // 2017
    {
      id: "law-2017-q1",
      year: "2017",
      marks: "15",
      label: "Writ Jurisdiction: Article 32 vs Article 226",
      theme: "Constitutional Law & Writs",
      subject: "Law Optional",
      question: "Compare and contrast the writ jurisdiction of the Supreme Court under Article 32 with that of the High Courts under Article 226."
    },
    {
      id: "law-2017-q2",
      year: "2017",
      marks: "20",
      label: "Frustration of Contract (Section 56)",
      theme: "Law of Contract",
      subject: "Law Optional",
      question: "Discuss the Doctrine of Frustration of Contract under Section 56 of the Indian Contract Act, 1872. How does commercial hardship differ from impossibility?"
    },

    // 2016
    {
      id: "law-2016-q1",
      year: "2016",
      marks: "15",
      label: "Tortious Liability of State & Sovereign Immunity",
      theme: "Law of Torts",
      subject: "Law Optional",
      question: "Trace the erosion of the defense of 'Sovereign Immunity' in tort actions against the State from Kasturilal to Nilabati Behera and Rudul Sah."
    },
    {
      id: "law-2016-q2",
      year: "2016",
      marks: "20",
      label: "Asylum & Principle of Non-Refoulement",
      theme: "Public International Law",
      subject: "Law Optional",
      question: "Examine the relationship between territorial asylum and the customary international law principle of Non-Refoulement."
    },

    // 2015
    {
      id: "law-2015-q1",
      year: "2015",
      marks: "15",
      label: "Right to Die vs Right to Life (Article 21)",
      theme: "Constitutional Law & Bioethics",
      subject: "Law Optional",
      question: "Trace the judicial journey of Article 21 from P. Rathinam to Gian Kaur and Aruna Shanbaug regarding passive euthanasia and living wills."
    },
    {
      id: "law-2015-q2",
      year: "2015",
      marks: "20",
      label: "Defamation: Civil Wrong vs Criminal Offence",
      theme: "Law of Torts & IPC",
      subject: "Law Optional",
      question: "Distinguish between civil defamation in Tort and criminal defamation under Sections 499/500 of the Indian Penal Code in the light of constitutional freedom of speech."
    },

    // 2014
    {
      id: "law-2014-q1",
      year: "2014",
      marks: "15",
      label: "Lokpal & Lokayukta Act 2013 Oversight",
      theme: "Administrative Law & Anti-Corruption",
      subject: "Law Optional",
      question: "Examine the statutory framework of the Lokpal and Lokayuktas Act, 2013. Does it provide adequate insulation from executive interference?"
    },
    {
      id: "law-2014-q2",
      year: "2014",
      marks: "20",
      label: "United Nations Security Council Reform & Veto Power",
      theme: "Public International Law",
      subject: "Law Optional",
      question: "Discuss the structural deficiencies of the United Nations Security Council, particularly the Veto power of the P-5. Evaluate India's claim for permanent membership."
    },

    // 2013
    {
      id: "law-2013-q1",
      year: "2013",
      marks: "15",
      label: "Public Interest Litigation (PIL): Locus Standi Evolution",
      theme: "Constitutional Law & Access to Justice",
      subject: "Law Optional",
      question: "Trace the evolution of Public Interest Litigation (PIL) in India. How has the relaxation of the traditional rule of Locus Standi democratized access to justice?"
    },
    {
      id: "law-2013-q2",
      year: "2013",
      marks: "20",
      label: "Anticipatory Bail under Section 438 CrPC",
      theme: "Criminal Procedure Law",
      subject: "Law Optional",
      question: "Discuss the scope and conditions for grant of Anticipatory Bail under Section 438 of the Code of Criminal Procedure with landmark judicial guidelines."
    }
  ]
};

export const ALL_OFFICIAL_MAINS_PYQS: OfficialPYQItem[] = Object.values(UPSC_MAINS_PYQ_BANK).flat();
