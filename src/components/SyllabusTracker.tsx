import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Check,
  Brain,
  Award,
  Sparkles,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export interface RecallCard {
  id: string;
  paper: string;
  question: string;
  modelAnswer: string;
  citations: string[];
  intervalDays: number;
  nextReviewDate: string;
}

export const INITIAL_RECALL_CARDS: RecallCard[] = [
  {
    id: "card_1",
    paper: "GS 2 (Polity)",
    question: "Discuss the administrative utility of the 'Separation of Powers' doctrine under the Indian Constitution.",
    modelAnswer: "The Indian Constitution does not strictu sensu enact a formal division of powers, but distributes sovereign powers beautifully. While legislative competence belongs to Parliament and State Assemblies, executive authority resides in Cabinets. Judicial check ensures compliance with constitutional morality.",
    citations: ["Article 50 (Separation of judiciary from executive)", "Kesavananda Bharati v. State of Kerala (1973) - Separation of powers as Basic Structure Doctrine", "Ram Jawaya Kapur v. State of Punjab (1955)"],
    intervalDays: 1,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "card_2",
    paper: "GS 3 (Economics)",
    question: "Analyze the 'Agrarian Supply Chain Strategy' and solutions recommended by Ashok Dalwai Committee.",
    modelAnswer: "Dalwai Committee emphasizes doubling farmers' income not through yield gains alone but via institutional market reform. Key pillars are upgrading APMCs, establishing grameen markets (GrAMs), expanding post-harvest warehouses, and strengthening public-private partnerships.",
    citations: ["Ashok Dalwai Committee Report", "Model APMC Act guidelines", "SDG-2: Zero Hunger targets"],
    intervalDays: 1,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "card_3",
    paper: "GS 4 (Ethics)",
    question: "Detail the '7 Nolan Principles of Public Life' and their ethical validity in IAS officers' decision-making.",
    modelAnswer: "Nolan Principles serve as the international gold standard for public service ethics, composed of: Selflessness, Integrity, Objectivity, Accountability, Openness, Honesty, and Leadership. They resolve complex administrative moral dilemmas by prioritising institutional transparency.",
    citations: ["Nolan Committee on Standards in Public Life (UK)", "2nd Administrative Reforms Commission (ARC) Report (Ethics in Governance)", "Article 311 constitutional backing"],
    intervalDays: 1,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "card_4",
    paper: "GS 2 (Governance)",
    question: "Outline the recommendations of Sarkaria Commission regarding executive appointments & governor tensions.",
    modelAnswer: "To prevent governor-cabinet friction, Sarkaria Commission recommends appointing governors solely after constructive consult with State Chief Ministers. A governor must be an eminent public figure outside active local politics, avoiding partisan interventions.",
    citations: ["Sarkaria Commission Report (1988)", "Punchhi Commission Recommendations (2010)", "S.R. Bommai v. Union of India (1994)"],
    intervalDays: 1,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "card_5",
    paper: "GS 1 (Geography & Environment)",
    question: "Explain the Western Ghats conservation conflict & Gadgil vs Kasturirangan Committee models.",
    modelAnswer: "Gadgil Committee recommended classifying 64% of Western Ghats as Ecologically Sensitive Area (ESA-1,2,3) with a complete mining ban. Kasturirangan report compromised to 37% ESA, allowing highly regulated green development while safeguarding local community livelihoods.",
    citations: ["Madhav Gadgil Panel Report on Western Ghats", "K. Kasturirangan High Level Working Group Report", "SDG-15: Life on Land"],
    intervalDays: 1,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "card_6",
    paper: "GS 3 (Internal Security)",
    question: "Discuss the structural challenges in India's border management and key recommendations.",
    modelAnswer: "Challenges include porous borders, hostile terrain, smuggling, and dual control friction. Crucial solutions encompass 'One Border One Force' deployment, smart digital border fences, local demographic empowerment, and cross-border security cooperation.",
    citations: ["Kargil Review Committee recommendations", "Madhukar Gupta Committee on Border Protection", "Smart Border Fencing Initiative"],
    intervalDays: 1,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: "card_7",
    paper: "Optional (Law)",
    question: "Explain the doctrine of 'Promissory Estoppel' against government corporations under Administrative Law.",
    modelAnswer: "Promissory estoppel binds administration when a clear representation is acted upon by citizens resulting in position change. However, it cannot exceed statutory mandates, and public interest overrides individual commercial estoppel claims.",
    citations: ["Motilal Padampat Sugar Mills case (1979)", "Union of India v. Indo-Afghan Agencies (1968)", "Doctrine of Legitimate Expectation integration"],
    intervalDays: 1,
    nextReviewDate: new Date().toISOString()
  }
];

export interface Topic {
  id: string;
  title: string;
  status: "not_started" | "reading" | "mastered";
  revisions: number;
  subtopics: Topic[];
}

export const initialSyllabus: Topic[] = [
  {
    id: "prelims",
    title: "Preliminary Examination",
    status: "not_started",
    revisions: 0,
    subtopics: [
      {
        id: "pre-p1",
        title: "Paper I: General Studies",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "pre-p1-1",
            title: "Current events of national and international importance.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p1-2",
            title: "History of India and Indian National Movement.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p1-3",
            title: "Indian and World Geography - Physical, Social, Economic.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p1-4",
            title:
              "Indian Polity and Governance - Constitution, Political System, Panchayati Raj, Public Policy, Rights Issues, etc.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p1-5",
            title:
              "Economic and Social Development - Sustainable Development, Poverty, Inclusion, Demographics, Social Sector initiatives, etc.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p1-6",
            title:
              "General issues on Environmental Ecology, Bio-diversity and Climate Change.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p1-7",
            title: "General Science.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
      {
        id: "pre-p2",
        title: "Paper II: CSAT",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "pre-p2-1",
            title: "Comprehension",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p2-2",
            title: "Interpersonal skills including communication skills",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p2-3",
            title: "Logical reasoning and analytical ability",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p2-4",
            title: "Decision-making and problem-solving",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p2-5",
            title: "General mental ability",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p2-6",
            title: "Basic numeracy and Data interpretation",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "pre-p2-7",
            title: "English Language Comprehension skills",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
    ],
  },
  {
    id: "mains-gs",
    title: "Main Examination (General Studies)",
    status: "not_started",
    revisions: 0,
    subtopics: [
      {
        id: "mains-essay",
        title: "Paper-I: Essay",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "essay-1",
            title:
              "Write closely to subject, orderly fashion, concise expression.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
      {
        id: "mains-gs1",
        title: "Paper-II: General Studies-I",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "gs1-1",
            title:
              "History of the world (18th century events, borders, philosophies).",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs1-2",
            title: "Salient features of Indian Society, Diversity of India.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs1-3",
            title: "Role of women, population, poverty, urbanization.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs1-4",
            title: "Effects of globalization on Indian society.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs1-5",
            title: "Social empowerment, communalism, regionalism & secularism.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs1-6",
            title: "Salient features of world's physical geography.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs1-7",
            title: "Distribution of key natural resources.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs1-8",
            title:
              "Important Geophysical phenomena (Earthquakes, Tsunami, Volcanic activity, cyclones).",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
      {
        id: "mains-gs2",
        title:
          "Paper-III: General Studies-II (Governance, Constitution, Polity, Social Justice, IR)",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "gs2-1",
            title:
              "Indian Constitution- historical underpinnings, evolution, features.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-2",
            title:
              "Functions and responsibilities of the Union and the States.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-3",
            title: "Separation of powers, dispute redressal mechanisms.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-4",
            title: "Comparison of the Indian constitutional scheme.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-5",
            title:
              "Parliament and State Legislatures - structure, functioning.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-6",
            title:
              "Structure, organization and functioning of the Executive and the Judiciary.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-7",
            title: "Salient features of the Representation of People's Act.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-8",
            title:
              "Appointment to various Constitutional posts, statutory bodies.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-9",
            title: "Government policies and interventions for development.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-10",
            title:
              "Development processes and the development industry (NGOs, SHGs).",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-11",
            title: "Welfare schemes for vulnerable sections.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-12",
            title:
              "Issues relating to Social Sector/Services (Health, Education, HR).",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-13",
            title: "Issues relating to poverty and hunger.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs2-14",
            title: "Important International institutions, agencies and fora.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
      {
        id: "mains-gs3",
        title:
          "Paper-IV: General Studies-III (Technology, Economic Development, Environment, Security)",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "gs3-1",
            title:
              "Indian Economy and issues relating to planning, mobilization.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-2",
            title: "Inclusive growth, Government Budgeting.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-3",
            title: "Major crops, irrigation systems, farm subsidies, MSP.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-4",
            title: "Food processing and related industries in India.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-5",
            title: "Land reforms in India, Effects of liberalization.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-6",
            title: "Infrastructure: Energy, Ports, Roads, Airports, Railways.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-7",
            title: "Investment models.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-8",
            title:
              "Science and Technology- developments and their applications.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-9",
            title:
              "Awareness in IT, Space, Computers, robotics, nano-technology, IPRs.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-10",
            title: "Conservation, environmental pollution, EIA.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-11",
            title: "Disaster and disaster management.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-12",
            title: "Linkages between development and spread of extremism.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-13",
            title:
              "Role of external state and non-state actors in internal security.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-14",
            title:
              "Challenges to internal security: networks, media, cyber security, money-laundering.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-15",
            title:
              "Security challenges in border areas; organized crime & terrorism.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs3-16",
            title: "Various Security forces and agencies.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
      {
        id: "mains-gs4",
        title: "Paper-V: General Studies-IV (Ethics, Integrity, and Aptitude)",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "gs4-1",
            title: "Aptitude and foundational values for Civil Service.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs4-2",
            title: "Emotional intelligence-concepts and utilities.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs4-3",
            title: "Contributions of moral thinkers and philosophers.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs4-4",
            title:
              "Public/Civil service values and Ethics in Public administration.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs4-5",
            title:
              "Probity in Governance: philosophical basis, RTI, Codes of Conduct, Citizen's Charters.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "gs4-6",
            title: "Case Studies on above issues.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
    ],
  },
  {
    id: "law-p1",
    title: "Optional Paper VI: Law Paper I",
    status: "not_started",
    revisions: 0,
    subtopics: [
      {
        id: "const-law",
        title: "Constitutional and Administrative Law",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "const-1",
            title:
              "Constitution and Constitutionalism: The distinctive features of the Constitution.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-2",
            title:
              "Fundamental Rights—Public interest litigation; Legal Aid; Legal services authority.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-3",
            title:
              "Relationship between Fundamental Rights, Directive Principles and Fundamental Duties.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-4",
            title:
              "Constitutional Position of the President and relation with the Council of Ministers.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-5",
            title: "Governor and his powers.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-6",
            title:
              "Supreme Court and the High Courts: (a) Appointments and transfer. (b) Powers, functions and jurisdiction.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-7",
            title:
              "Centre, States and local bodies: (a) Distribution of legislative powers between the Union and the States. (b) Local Bodies. (c) Administrative relationship among Union, State and Local Bodies. (d) Eminent domain-State property-common property-community property.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-8",
            title: "Legislative powers, privileges and immunities.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-9",
            title:
              "Services under the Union and the States: (a) Recruitment and conditions of services; Constitutional safeguards; Administrative tribunals. (b) Union Public Service Commission and State Public Service Commissions—Power and functions. (c) Election Commission—Power and functions.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-10",
            title: "Emergency provisions.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-11",
            title: "Amendment of the Constitution.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-12",
            title:
              "Principle of Natural Justice—Emerging trends and judicial approach.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-13",
            title: "Delegated legislation and its constitutionality.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-14",
            title: "Separation of powers and constitutional governance.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-15",
            title: "Judicial review of administrative action.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "const-16",
            title: "Ombudsman: Lokayukta, Lokpal etc.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
      {
        id: "int-law",
        title: "International Law",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "int-1",
            title: "Nature and Definition of International Law.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-2",
            title: "Relationship between International Law and Municipal Law.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-3",
            title: "State Recognition and State Succession.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-4",
            title:
              "Law of the sea: Inland Waters, Territorial Sea, Contiguous Zone, Continental Shelf, Exclusive Economic Zone and High Seas.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-5",
            title:
              "Individuals: Nationality, statelessness; Human Rights and procedures available for their protection.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-6",
            title:
              "Territorial jurisdiction of States, Extradition and Asylum.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-7",
            title:
              "Treaties: Formation, application, termination and reservation.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-8",
            title:
              "United Nations: Its principal organs, powers and functions and reform.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-9",
            title: "Peaceful settlement of disputes—different modes.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-10",
            title:
              "Lawful recourse to force: aggressions, self-defence, intervention.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-11",
            title:
              "Fundamental principles of international humanitarian law—International conventions and contemporary developments.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-12",
            title:
              "Legality of the use of nuclear weapons; ban on testing of nuclear weapons; Nuclear non-proliferation treaty, CTBT.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-13",
            title:
              "International Terrorism, State sponsored terrorism, Hijacking, International Criminal Court.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-14",
            title:
              "New International Economic Order and Monetary Law: WTO, TRIPS, GATT, IMF, World Bank.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "int-15",
            title:
              "Protection and Improvement of the Human Environment: International Efforts.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
    ],
  },
  {
    id: "law-p2",
    title: "Optional Paper VII: Law Paper II",
    status: "not_started",
    revisions: 0,
    subtopics: [
      {
        id: "crime-law",
        title: "Law of Crimes",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "crime-1",
            title:
              "General principles of Criminal liability: mens rea and actus reus, mens rea in statutory offences.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-2",
            title:
              "Kinds of punishment and emerging trends as to abolition of capital punishment.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-3",
            title: "Preparations and criminal attempt.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-4",
            title: "General exceptions.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-5",
            title: "Joint and constructive liability.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-6",
            title: "Abetment.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-7",
            title: "Criminal conspiracy.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-8",
            title: "Offences against the State.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-9",
            title: "Offences against public tranquility.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-10",
            title: "Offences against human body.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-11",
            title: "Offences against property.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-12",
            title: "Offences against women.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-13",
            title: "Defamation.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-14",
            title: "Prevention of Corruption Act, 1988.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-15",
            title:
              "Protection of Civil Rights Act, 1955 and subsequent legislative developments.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "crime-16",
            title: "Plea bargaining.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
      {
        id: "tort-law",
        title: "Law of Torts",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "tort-1",
            title: "Nature and definition.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-2",
            title:
              "Liability based upon fault and strict liability; Absolute liability.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-3",
            title: "Vicarious liability including State Liability.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-4",
            title: "General defences.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-5",
            title: "Joint tort feasors.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-6",
            title: "Remedies.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-7",
            title: "Negligence.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-8",
            title: "Defamation.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-9",
            title: "Nuisance.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-10",
            title: "Conspiracy.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-11",
            title: "False imprisonment.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-12",
            title: "Malicious prosecution.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "tort-13",
            title: "Consumer Protection Act, 1986.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
      {
        id: "contract-law",
        title: "Law of Contracts and Mercantile Law",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "contract-1",
            title: "Nature and formation of contract/E-contract.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-2",
            title: "Factors vitiating free consent.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-3",
            title: "Void, voidable, illegal and unenforceable agreements.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-4",
            title: "Performance and discharge of contracts.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-5",
            title: "Quasi-contracts.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-6",
            title: "Consequences of breach of contract.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-7",
            title: "Contract of indemnity, guarantee and insurance.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-8",
            title: "Contract of agency.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-9",
            title: "Sale of goods and hire purchase.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-10",
            title: "Formation and dissolution of partnership.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-11",
            title: "Negotiable Instruments Act, 1881.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-12",
            title: "Arbitration and Conciliation Act, 1996.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contract-13",
            title: "Standard form contracts.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
      {
        id: "contemporary-law",
        title: "Contemporary Legal Developments",
        status: "not_started",
        revisions: 0,
        subtopics: [
          {
            id: "contemp-1",
            title: "Public Interest Litigation.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contemp-2",
            title: "Intellectual property rights—Concept, types/prospects.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contemp-3",
            title:
              "Information Technology Law including Cyber Laws—Concept, purpose/prospects.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contemp-4",
            title: "Competition Law-Concept, purpose/prospects.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contemp-5",
            title: "Alternate Dispute Resolution—Concept, types/prospects.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contemp-6",
            title: "Major statutes concerning environmental law.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contemp-7",
            title: "Right to Information Act.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
          {
            id: "contemp-8",
            title: "Trial by media.",
            status: "not_started",
            revisions: 0,
            subtopics: [],
          },
        ],
      },
    ],
  },
];

const calculateStats = (topics: Topic[]) => {
  const stats = { total: 0, mastered: 0, reading: 0, not_started: 0 };
  const traverse = (t: Topic) => {
    if (t.subtopics.length === 0) {
      stats.total += 1;
      if (t.status === "mastered") stats.mastered += 1;
      else if (t.status === "reading") stats.reading += 1;
      else stats.not_started += 1;
    } else {
      t.subtopics.forEach(traverse);
    }
  };
  topics.forEach(traverse);
  return stats;
};

const filterSyllabusTree = (
  nodes: Topic[],
  status: "all" | "mastered" | "reading" | "not_started"
): Topic[] => {
  if (status === "all") return nodes;
  return nodes
    .map((node) => {
      if (node.subtopics.length === 0) {
        if (node.status === status) return node;
        return null;
      }
      const filteredSub = filterSyllabusTree(node.subtopics, status);
      if (filteredSub.length > 0) {
        return {
          ...node,
          subtopics: filteredSub,
        };
      }
      return null;
    })
    .filter((n): n is Topic => n !== null);
};

interface ProgressRingProps {
  id: string;
  title: string;
  stats: { total: number; mastered: number; reading: number; not_started: number };
  isActive: boolean;
  activeStatusFilter: "all" | "mastered" | "reading" | "not_started";
  onClick: () => void;
  onStatusFilterClick: (status: "all" | "mastered" | "reading" | "not_started") => void;
}

const ProgressRing = ({
  id,
  title,
  stats,
  isActive,
  activeStatusFilter,
  onClick,
  onStatusFilterClick,
}: ProgressRingProps) => {
  const completion =
    stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  const ringColors = {
    stroke: completion >= 80 ? "stroke-emerald-500" : completion >= 50 ? "stroke-emerald-400" : "stroke-accent",
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-5 shadow-xs flex flex-col items-center relative overflow-hidden transition-all duration-300 transform select-none cursor-pointer ${
        isActive
          ? "border-accent ring-2 ring-accent/20 bg-accent/5 scale-[1.02]"
          : "hover:border-panel-border/80 hover:bg-panel-border/5 hover:scale-[1.01]"
      }`}
    >
      {isActive && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
        </span>
      )}

      <h3 className={`font-semibold text-[11px] tracking-wider uppercase mb-3 ${isActive ? "text-accent font-bold" : "text-muted"}`}>
        {title}
      </h3>

      <div className="relative w-[120px] h-[120px] transition-transform hover:scale-105 duration-300">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-panel-border"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${ringColors.stroke} transition-all duration-500 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-main">{completion}%</span>
          <span className="text-[9px] font-bold text-muted uppercase tracking-wider">
            Completed
          </span>
        </div>
      </div>

      <div className="mt-4 w-full flex flex-col gap-1.5 border-t border-panel-border/30 pt-3 text-[10px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusFilterClick(activeStatusFilter === "mastered" ? "all" : "mastered");
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all w-full justify-between cursor-pointer ${
            activeStatusFilter === "mastered"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold"
              : "hover:bg-panel-border/30 text-muted"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
            Mastered
          </span>
          <span className="font-mono">{stats.mastered} / {stats.total}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusFilterClick(activeStatusFilter === "reading" ? "all" : "reading");
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all w-full justify-between cursor-pointer ${
            activeStatusFilter === "reading"
              ? "bg-accent/15 text-accent border border-accent/20 font-bold"
              : "hover:bg-panel-border/30 text-muted"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0" />
            Reading
          </span>
          <span className="font-mono">{stats.reading}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusFilterClick(activeStatusFilter === "not_started" ? "all" : "not_started");
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all w-full justify-between cursor-pointer ${
            activeStatusFilter === "not_started"
              ? "bg-slate-500/15 text-slate-400 border border-slate-500/30 font-bold"
              : "hover:bg-panel-border/30 text-muted"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-500 shrink-0" />
            To Do
          </span>
          <span className="font-mono">{stats.not_started}</span>
        </button>
      </div>

      <div className="mt-3 text-[9px] font-bold tracking-wider uppercase text-accent opacity-60 flex items-center justify-center gap-1">
        {isActive ? "Focused List" : "Explore Subject"}
      </div>
    </div>
  );
};

export function SyllabusTracker() {
  const [syllabus, setSyllabus] = useState<Topic[]>(() => {
    const saved = localStorage.getItem("upsc_syllabus_v2");
    return saved ? JSON.parse(saved) : initialSyllabus;
  });

  const [recallCards, setRecallCards] = useState<RecallCard[]>(() => {
    const saved = localStorage.getItem("upsc_spaced_recall_v1");
    return saved ? JSON.parse(saved) : INITIAL_RECALL_CARDS;
  });

  const [currentCardIdx, setCurrentCardIdx] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "mastered" | "reading" | "not_started">("all");

  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(
    {
      prelims: true,
      "mains-gs": false,
      "law-p1": false,
      "law-p2": false,
    },
  );

  useEffect(() => {
    localStorage.setItem("upsc_syllabus_v2", JSON.stringify(syllabus));
    window.dispatchEvent(new CustomEvent("app:syllabusUpdated"));
  }, [syllabus]);

  useEffect(() => {
    localStorage.setItem("upsc_spaced_recall_v1", JSON.stringify(recallCards));
  }, [recallCards]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "upsc_syllabus_v2" && e.newValue) {
        try {
          setSyllabus(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateTopic = (
    nodes: Topic[],
    id: string,
    updater: (t: Topic) => Topic,
  ): Topic[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        return updater(node);
      }
      if (node.subtopics.length > 0) {
        return { ...node, subtopics: updateTopic(node.subtopics, id, updater) };
      }
      return node;
    });
  };

  const handleStatusChange = (id: string, status: Topic["status"]) => {
    setSyllabus((prev) => updateTopic(prev, id, (t) => ({ ...t, status })));
  };

  const incrementRevision = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSyllabus((prev) =>
      updateTopic(prev, id, (t) => ({ ...t, revisions: t.revisions + 1 })),
    );
  };

  const dueCards = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return recallCards.filter(c => {
      const reviewDate = new Date(c.nextReviewDate);
      reviewDate.setHours(0,0,0,0);
      return reviewDate <= today;
    });
  }, [recallCards]);

  const handleScoreCard = (cardId: string, level: "easy" | "medium" | "hard") => {
    setRecallCards(prev => prev.map(c => {
      if (c.id === cardId) {
        let newInterval = c.intervalDays;
        if (level === "easy") {
          newInterval = c.intervalDays * 3;
        } else if (level === "medium") {
          newInterval = Math.max(1, Math.round(c.intervalDays * 1.5));
        } else {
          newInterval = 1;
        }
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + newInterval);
        
        return {
          ...c,
          intervalDays: newInterval,
          nextReviewDate: nextDate.toISOString()
        };
      }
      return c;
    }));
    setIsCardFlipped(false);
  };

  const renderTopic = (topic: Topic, depth: number = 0) => {
    const isExpanded = expandedTopics[topic.id] || statusFilter !== "all" || subjectFilter !== null;
    const hasChildren = topic.subtopics.length > 0;
    
    let isMastered = false;
    if (hasChildren) {
        const stats = calculateStats([topic]);
        isMastered = stats.total > 0 && stats.mastered === stats.total;
    } else {
        isMastered = topic.status === 'mastered';
    }

    return (
      <div key={topic.id} className="w-full">
        <div
          className={`flex items-center gap-3 p-3 border-b border-panel-border/30 hover:bg-input transition-colors ${depth === 0 ? "bg-panel-border/10 font-medium" : ""}`}
          style={{ paddingLeft: `${depth * 24 + 16}px` }}
        >
          <div
            className="w-5 h-5 flex items-center justify-center cursor-pointer shrink-0"
            onClick={() => hasChildren && toggleExpand(topic.id)}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`text-[15px] ${depth === 0 ? "text-main font-semibold" : "text-main"}`}
              >
                {topic.title}
              </span>
              {isMastered && (
                 <span className="inline-flex items-center gap-1 mx-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Mastery
                 </span>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {/* Revisions counter */}
              <div className="flex items-center gap-2" title="Revision Count">
                <button
                  onClick={(e) => incrementRevision(topic.id, e)}
                  className="w-6 h-6 rounded bg-panel border border-panel-border flex items-center justify-center hover:bg-accent hover:text-white transition-colors text-muted"
                >
                  <span className="text-[10px] font-bold">
                    +{topic.revisions}
                  </span>
                </button>
              </div>

              {/* Status Select */}
              <select
                value={topic.status}
                onChange={(e) =>
                  handleStatusChange(topic.id, e.target.value as any)
                }
                onClick={(e) => e.stopPropagation()}
                className={`text-[11px] font-semibold px-2 py-1.5 rounded-lg outline-none cursor-pointer border ${
                  topic.status === "mastered"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : topic.status === "reading"
                      ? "bg-accent/10 text-accent/80 border-accent/20"
                      : "glass-panel text-muted hover:glass-input"
                }`}
              >
                <option value="not_started">To Do</option>
                <option value="reading">Reading</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {topic.subtopics.map((sub) => renderTopic(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const fullStats = calculateStats(syllabus);
  const remainingTopics = fullStats.total - fullStats.mastered;

  // Calculate remaining days assuming target exam is May 23, 2027
  const EXAM_DATE = new Date("2027-05-23T00:00:00Z");
  const today = new Date();
  const daysRemaining = Math.max(
    1,
    Math.ceil((EXAM_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const targetDaily = (remainingTopics / daysRemaining).toFixed(2);

  const generateBurndown = () => {
    const data = [];
    const months = Math.ceil(daysRemaining / 30);
    const dropPerMonth = remainingTopics / months;

    for (let i = 0; i <= months; i++) {
      const d = new Date(today);
      d.setMonth(d.getMonth() + i);
      data.push({
        name: d.toLocaleDateString("en-US", { month: "short" }),
        Remaining: Math.max(0, Math.round(remainingTopics - dropPerMonth * i)),
      });
    }
    return data;
  };

  const burndownData = generateBurndown();

  const visibleSyllabus = React.useMemo(() => {
    let filtered = syllabus;
    if (subjectFilter) {
      if (subjectFilter === "optional-law") {
        filtered = syllabus.filter((t) => t.id === "law-p1" || t.id === "law-p2");
      } else {
        filtered = syllabus.filter((t) => t.id === subjectFilter);
      }
    }
    if (statusFilter !== "all") {
      filtered = filterSyllabusTree(filtered, statusFilter);
    }
    return filtered;
  }, [syllabus, subjectFilter, statusFilter]);

  const subjectLabel =
    subjectFilter === "prelims"
      ? "Prelims"
      : subjectFilter === "mains-gs"
        ? "Mains (GS)"
        : subjectFilter === "optional-law"
          ? "Optional (Law)"
          : "All Subjects";

  const statusLabel =
    statusFilter === "mastered"
      ? "Mastered"
      : statusFilter === "reading"
        ? "Reading"
        : statusFilter === "not_started"
          ? "To Do"
          : "All";

  const completedPercent = fullStats.total > 0 ? Math.round((fullStats.mastered / fullStats.total) * 100) : 0;
  const pendingPercent = 100 - completedPercent;

  return (
    <div className="h-full flex flex-col bg-transparent overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto w-full flex-1 pb-16">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-main mb-2 tracking-tight">
            Syllabus Micro-Tracker
          </h2>
          <p className="text-muted text-[15px]">
            Track your progression across every micro-topic with active revision
            counts and interactive subject focus views.
          </p>
        </header>

        {/* Real-time Syllabus Completed vs Pending HUD Card */}
        <div className="glass-panel border border-accent/20 bg-gradient-to-r from-accent/[0.02] via-transparent to-transparent p-5 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-4.5 w-full md:w-auto">
            <div className="p-3 rounded-xl bg-accent/15 border border-accent/25 text-accent flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20 inline-block">
                  Mission Progress Status
                </span>
                <span className="text-[10.5px] font-mono text-muted">
                  Total Micro-Units Mapped: <strong className="text-main font-bold">{fullStats.total}</strong>
                </span>
              </div>
              <h3 className="text-xs font-black uppercase text-main tracking-tight pt-1">Active Syllabus Mastery Index</h3>
              <p className="text-[10.5px] font-medium text-muted leading-tight">
                Review pending syllabus milestones and commit cited facts into core long-term retention.
              </p>
            </div>
          </div>

          <div className="w-full md:w-80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Completed: {completedPercent}% ({fullStats.mastered})
              </span>
              <span className="text-[#ffbf00] flex items-center gap-1 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-[#ffbf00]" />
                Pending: {pendingPercent}% ({remainingTopics})
              </span>
            </div>
            
            {/* Split Progress Track */}
            <div className="w-full h-3.5 bg-panel-border/30 rounded-full overflow-hidden flex border border-panel-border/35 p-[1px]">
              {completedPercent > 0 && (
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-1000 ease-out" 
                  style={{ width: `${completedPercent}%` }}
                />
              )}
              {pendingPercent > 0 && (
                <div 
                  className="h-full bg-gradient-to-r from-[#ffbf00]/80 to-[#ffbf00] rounded-r-full transition-all duration-1000 ease-out" 
                  style={{ width: `${pendingPercent}%` }}
                />
              )}
            </div>

            <div className="flex justify-between items-center text-[9px] font-semibold text-muted leading-none pt-0.5">
              <span>{fullStats.mastered} Mastered Units</span>
              <span>{remainingTopics} Remaining Units</span>
            </div>
          </div>
        </div>

        <div className="glass-panel shadow-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-8">
          <div className="flex flex-col justify-center gap-6 md:w-1/3">
            <div>
              <div className="text-muted text-[11px] font-bold uppercase tracking-wider mb-1">
                Target Exam
              </div>
              <div className="text-2xl font-bold text-main">
                UPSC CSE Prelims
              </div>
              <div className="text-accent text-sm font-medium">
                May 23, 2027
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-main">
                  {daysRemaining}
                </div>
                <div className="text-muted text-[10px] font-bold uppercase tracking-wider mt-1">
                  Days Left
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-main">
                  {remainingTopics}
                </div>
                <div className="text-muted text-[10px] font-bold uppercase tracking-wider mt-1">
                  Topics Left
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="text-2xl font-bold text-accent">
                {targetDaily}
              </div>
              <div className="text-accent text-[10px] font-bold uppercase tracking-wider mt-1">
                Target Topics / Day
              </div>
            </div>
          </div>

          <div className="flex-1 h-64 min-h-[250px] relative">
            <h3 className="absolute -top-4 right-0 text-[10px] font-bold text-muted uppercase tracking-wider z-10 px-2">
              Completion Trend
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={burndownData}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-panel-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-panel)",
                    borderColor: "var(--color-panel-border)",
                    borderRadius: "8px",
                    color: "var(--color-main)",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "var(--color-main)" }}
                />
                <Area
                  type="monotone"
                  dataKey="Remaining"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTarget)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ProgressRing
            id="prelims"
            title="Prelims"
            stats={calculateStats(syllabus.filter((t) => t.id === "prelims"))}
            isActive={subjectFilter === "prelims"}
            activeStatusFilter={subjectFilter === "prelims" ? statusFilter : "all"}
            onClick={() => {
              setSubjectFilter((prev) => (prev === "prelims" ? null : "prelims"));
              setStatusFilter("all");
            }}
            onStatusFilterClick={(status) => {
              setSubjectFilter("prelims");
              setStatusFilter(status);
            }}
          />
          <ProgressRing
            id="mains-gs"
            title="Mains (GS)"
            stats={calculateStats(syllabus.filter((t) => t.id === "mains-gs"))}
            isActive={subjectFilter === "mains-gs"}
            activeStatusFilter={subjectFilter === "mains-gs" ? statusFilter : "all"}
            onClick={() => {
              setSubjectFilter((prev) => (prev === "mains-gs" ? null : "mains-gs"));
              setStatusFilter("all");
            }}
            onStatusFilterClick={(status) => {
              setSubjectFilter("mains-gs");
              setStatusFilter(status);
            }}
          />
          <ProgressRing
            id="optional-law"
            title="Optional (Law)"
            stats={calculateStats(
              syllabus.filter((t) => t.id === "law-p1" || t.id === "law-p2")
            )}
            isActive={subjectFilter === "optional-law"}
            activeStatusFilter={subjectFilter === "optional-law" ? statusFilter : "all"}
            onClick={() => {
              setSubjectFilter((prev) => (prev === "optional-law" ? null : "optional-law"));
              setStatusFilter("all");
            }}
            onStatusFilterClick={(status) => {
              setSubjectFilter("optional-law");
              setStatusFilter(status);
            }}
          />
        </div>

        {/* Lighthouse Spaced Repetition Active Recall Deck */}
        <div className="glass-panel border border-[#ffbf00]/15 bg-panel-border/5 p-6 rounded-3xl mb-8 flex flex-col items-stretch text-left shadow-lg relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-[#ffbf00]/5 blur-xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-panel-border/20 mb-5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#ffbf00]/15 text-[#ffbf00] border border-[#ffbf00]/20 flex items-center justify-center">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-main text-[14px] uppercase tracking-wider">Lighthouse Active Recall Deck</h3>
                <p className="text-[11px] text-muted mt-0.5">Spaced repetition triggers to retain critical syllabus metrics indefinitely</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] px-2.5 py-1 rounded-xl bg-[#ffbf00]/10 border border-[#ffbf00]/25 text-[#ffbf00] font-mono font-bold">
                Pending: {dueCards.length}
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-xl bg-panel-border/20 text-muted font-mono">
                Total Deck: {recallCards.length}
              </span>
            </div>
          </div>

          {dueCards.length > 0 ? (
            (() => {
              // Ensure we don't overflow the array index if we finish reviews
              const currentActiveCard = dueCards[currentCardIdx] || dueCards[0];
              if (!currentActiveCard) return null;

              return (
                <div className="animate-fadeIn relative z-10 flex flex-col md:flex-row gap-6 items-stretch justify-between min-h-[160px]">
                  {/* Active Recall Card Panel */}
                  <div className="flex-1 bg-app/50 border border-panel-border/30 rounded-2xl p-5 flex flex-col justify-between shadow-inner">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9.5px] px-2 py-0.5 rounded-md font-black uppercase bg-[#ffbf00]/10 border border-[#ffbf00]/20 text-[#ffbf00]">
                          {currentActiveCard.paper}
                        </span>
                        <span className="text-[9px] font-mono text-muted">
                          Interval: {currentActiveCard.intervalDays} {currentActiveCard.intervalDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <h4 className="text-[13.5px] font-bold text-main leading-relaxed">
                        {currentActiveCard.question}
                      </h4>
                    </div>

                    {!isCardFlipped ? (
                      <button
                        onClick={() => setIsCardFlipped(true)}
                        className="mt-6 w-full py-2.5 bg-panel border border-[#ffbf00]/20 hover:border-[#ffbf00]/40 rounded-xl text-[11px] font-bold text-[#ffbf00] cursor-pointer hover:bg-[#ffbf00]/5 transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "10s" }} />
                        <span>Flip Index Card & Reveal Model Answer</span>
                      </button>
                    ) : (
                      <div className="mt-5 pt-4 border-t border-panel-border/20 space-y-4 animate-fadeIn">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-muted font-mono block mb-1">Topper Key Guidance Model Answer:</span>
                          <p className="text-[11.5px] text-main leading-relaxed bg-app/80 p-3 rounded-xl border border-panel-border/20">
                            {currentActiveCard.modelAnswer}
                          </p>
                        </div>

                        {currentActiveCard.citations.length > 0 && (
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#ffbf00] font-mono block mb-1.5">Value Addition Markers to cross-check:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {currentActiveCard.citations.map((cite, cI) => (
                                <span key={cI} className="text-[9.5px] px-2.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-[#ffbf00] font-medium">
                                  {cite}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Spaced Repetition Responses */}
                  {isCardFlipped && (
                    <div className="md:w-56 shrink-0 flex flex-col justify-center gap-2.5 animate-fadeIn bg-panel-border/5 p-4 rounded-2xl border border-panel-border/15">
                      <span className="text-[9.5px] font-black text-muted uppercase tracking-wider text-center block mb-1 font-mono">How well did you recall?</span>
                      
                      <button
                        onClick={() => handleScoreCard(currentActiveCard.id, "hard")}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 font-bold text-[10.5px] rounded-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <div>
                          <strong className="block text-[11px] font-extrabold uppercase text-left">Hard / Revise</strong>
                          <span className="text-[8px] font-normal block font-mono text-left">Resets interval to 1 day</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleScoreCard(currentActiveCard.id, "medium")}
                        className="w-full py-2 bg-[#ffbf00]/10 hover:bg-[#ffbf00]/15 border border-[#ffbf00]/25 text-[#ffbf00] font-bold text-[10.5px] rounded-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ffbf00] shrink-0 animate-pulse" />
                        <div>
                          <strong className="block text-[11px] font-extrabold uppercase text-left">Medium / Good</strong>
                          <span className="text-[8px] font-normal block font-mono text-left">Grows interval by 1.5x</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleScoreCard(currentActiveCard.id, "easy")}
                        className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-bold text-[10.5px] rounded-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <strong className="block text-[11px] font-extrabold uppercase text-left">Easy / Perfect</strong>
                          <span className="text-[8px] font-normal block font-mono text-left">Grows interval by 3x</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-fadeIn relative z-10">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 mb-3 animate-bounce">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-[13px] font-black uppercase text-main">Synaptic Recall Target Complete!</h4>
              <p className="text-[11px] text-muted mt-1 max-w-md">
                You have solved every pending spaced repetition card for today. Your long-term structural retention is in top form!
              </p>
              
              <button
                onClick={() => {
                  setRecallCards(INITIAL_RECALL_CARDS);
                  setCurrentCardIdx(0);
                  setIsCardFlipped(false);
                }}
                className="mt-4 px-4 py-1.5 bg-panel-border/10 hover:bg-panel-border/25 border border-panel-border/30 rounded-xl text-[9.5px] text-main font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                title="Reset reviews to initial state for diagnostic re-use"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Diagnostic reset cards deck</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Filter Badge / Reset Banner */}
        {(subjectFilter || statusFilter !== "all") && (
          <div className="mb-6 bg-accent/10 border border-accent/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="bg-accent/20 p-2.5 rounded-xl text-accent shrink-0">
                <Check className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-main">Interactive Filter Active</h4>
                <p className="text-[11px] text-muted mt-0.5">
                  Showing <strong>{subjectLabel}</strong> — {statusFilter !== "all" ? `topics marked as "${statusLabel}"` : "all topics"}.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSubjectFilter(null);
                setStatusFilter("all");
              }}
              className="text-[11px] font-black uppercase tracking-wider text-accent bg-accent/20 hover:bg-accent/30 px-4 py-2 rounded-xl border border-accent/20 active:scale-95 transition-all cursor-pointer shrink-0 w-full sm:w-auto text-center"
            >
              Clear Subject Focus
            </button>
          </div>
        )}

        <div className="glass-panel shadow-sm rounded-2xl overflow-hidden min-h-[120px] flex flex-col justify-center">
          {visibleSyllabus.length > 0 ? (
            visibleSyllabus.map((topic) => renderTopic(topic, 0))
          ) : (
            <div className="p-12 text-center text-muted flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-accent/50 mb-3 animate-bounce" />
              <p className="text-sm font-semibold text-main">No topics match your active status filters!</p>
              <p className="text-[11px] text-muted mt-1 max-w-sm">
                Try switching the sub-filter on your circular progress bar or click below to clear focus.
              </p>
              <button
                onClick={() => {
                  setSubjectFilter(null);
                  setStatusFilter("all");
                }}
                className="mt-4 text-[11px] font-black uppercase tracking-wider text-accent hover:underline cursor-pointer"
              >
                Reset Focus Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
