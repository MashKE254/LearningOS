# EduForge

**EduForge** is a **Generative Teaching Infrastructure**—a real-time, adaptive AI engine that transforms any curriculum document, textbook, or skill requirement into personalized, Socratic pedagogy. Unlike educational platforms that deliver pre-recorded videos or static worksheets, EduForge generates infinite learning pathways dynamically, constrained by official syllabi and verified by domain-specific safety layers.

---

## Part 1: What EduForge Is

### The Core Architecture

#### 1. The Retrieval-Augmented Generation (RAG) Engine

EduForge does not contain "courses." It contains **curriculum intelligence**—vectorized embeddings of official syllabi (IGCSE, KCSE, CBSE, Common Core), past examination papers, marking schemes, and textbook excerpts. When a student asks for help, the system:

- Retrieves the specific learning objectives and assessment criteria for their exact curriculum (e.g., "CIE Biology 9700, Chapter 12, Photosynthesis")
- Generates explanations, practice problems, and feedback that adhere strictly to those retrieved standards
- Cites official sources (e.g., "According to the 2023 KCSE marking scheme, this answer requires three specific terms for full marks")

**Implementation:** `packages/ai/src/rag-engine.ts`

#### 2. The Hierarchical Model Router

To optimize cost and performance, EduForge routes queries through different AI models based on cognitive complexity:

| Model | Use Cases |
|-------|-----------|
| **Haiku (Fast)** | Intent classification, simple recall, parent dashboard updates |
| **Sonnet (Balanced)** | Standard concept explanations, practice problem generation, essay feedback |
| **Opus (Deep)** | Complex Socratic dialogue, debugging, high-stakes exam preparation |
| **Verified (Deterministic)** | Mathematical proofs (Wolfram Alpha), chemical equation balancing (RDKit), code execution (Judge0) |

**Implementation:** `packages/ai/src/model-router.ts`

#### 3. The Safety & Verification Layer

- **Factual Grounding**: All STEM content passes through symbolic verification systems before reaching the student
- **Pedagogical Safety**: Constitutional constraints prevent giving direct answers; the system defaults to Socratic questioning
- **Hallucination Prevention**: Structured output requires citation of retrieved curriculum chunks; confidence thresholds trigger "I don't know" responses rather than invention

**Implementation:** `packages/ai/src/verification-engine.ts`

#### 4. The Dynamic State Management

Each student maintains a persistent **knowledge graph**—not a list of completed videos, but a living map of concepts mastered, misconceptions held, and prerequisite gaps. This graph updates in real-time, allowing the AI to generate the exact next explanation needed, rather than following a linear sequence.

**Implementation:** `packages/database/prisma/schema.prisma` (KnowledgeNode model)

---

### What It Does

#### For Students

- **Curriculum-Native Tutoring**: Explains concepts using the exact terminology and sequence of the user's specific exam board (e.g., explaining "gradient" differently for IB vs. A-Level vs. AP Calculus)
- **Infinite Practice Generation**: Creates unlimited variations of exam-style questions targeting specific weaknesses, with feedback modeled on official mark schemes
- **Misconception Repair**: Detects specific errors (e.g., "confuses structural and molecular formulas") and generates targeted counter-explanations
- **Multilingual Bridging**: Teaches in the student's native language while integrating target-language academic vocabulary for exam preparation

#### For Parents

- **Transparency Dashboard**: Real-time visibility into "what my child doesn't understand" rather than just "what they completed"
- **Time Reclamation**: Eliminates lesson planning, grading, and curriculum design for homeschoolers; provides homework support for traditionally schooled students

#### For Schools (Institutional Tier)

- **Force Multiplication**: One teacher + EduForge effectively creates a 1:1 student-tutor ratio in a classroom of 30
- **Living Curriculum**: Automatically aligns generated content to state standards (TEKS, Common Core) with built-in pacing guides
- **Predictive Intervention**: Flags students at risk of failure at 23% mastery rather than after a failed exam

---

## Part 2: Five Distinct Customer Journeys

### Journey 1: The Homeschool Architect

**Persona:** Sarah Chen-Martinez (42), former attorney, homeschooling four children (ages 14, 11, 11, 7) in Austin, Texas. She is burnout after three years of curriculum juggling.

**The Crisis:**
Monday morning. Sarah stares at four different math programs, two history curricula, and a science experiment kit missing critical components. Elena (14) is bored in Algebra II; the twins (Jake and Zoe, 11) learn nothing alike; Sam (7) has convergence insufficiency and cannot read standard worksheets. Sarah spent 15 hours last week planning and still feels like she's failing everyone.

**Onboarding:**
Sarah selects the Family Pro tier ($79/month). Instead of "select grade levels," EduForge conducts intake interviews for each child:

- **Elena**: Identified as "asynchronous"—Abstract reasoning at undergraduate level, writing mechanics at middle school level. The AI generates a **Calculus-through-Astronomy** track and a separate **Rhetoric through Science Communication** writing track.
- **Jake (ADHD)**: Kinesthetic profile generated. Movement-integrated learning with 12-minute modules.
- **Zoe**: Visual-spatial profile. Art-integrated mathematics (tessellations, mathematical art history).
- **Sam (Vision Issues)**: Voice-first interface. Dyslexia-friendly fonts. Phonics taught through oral storytelling.

**The Daily Flow:**
At 9:00 AM, Sarah opens her dashboard to see four parallel learning sessions generated overnight:

- Elena is deriving orbital mechanics equations (Calculus concepts contextualized through her astronomy interest) while the AI Socratically questions her about the derivative as a rate of change.
- Jake builds a Roman aqueduct in the backyard (physics and history generated as an engineering challenge) while the AI asks him to calculate load-bearing angles using geometry he hasn't formally learned yet—teaching through the project.
- Zoe analyzes Escher's *Day and Night* while the AI generates inquiries about tessellation geometry and rotational symmetry.
- Sam dictates a story about a dragon; the AI transcribes it, then isolates CVC words to teach decoding patterns from his own vocabulary.

**The Intervention:**
At 11:00 AM, Sarah receives a notification: *"Elena hit a wall with epsilon-delta proofs (expected frustration curve). Suggested intervention: Share a story about being stuck in law school. The AI has already switched her to Philosophy of Mathematics (logic proofs) to strengthen formal reasoning before returning to Calculus rigor."*

**Outcome:**
Sarah spends 90 minutes daily on deep discussions with her children rather than drilling math facts. Elena teaches herself Calculus; Jake learns fractions through game design; Zoe explains the Cold War using illustrated guides she created; Sam reads decodable texts generated from his own stories. Sarah transitions from "curriculum administrator" to "learning facilitator."

---

### Journey 2: The University Student in Crisis

**Persona:** David (20), Biochemistry major at a state university. Final exam in Organic Chemistry II in 96 hours. He crammed for the midterm (barely passed) but the final is cumulative. He is experiencing panic paralysis.

**The Input:**
*"I have my orgo final in 4 days. I'm screwed. I don't understand mechanisms and there's too much to review."*

**The Triage:**
EduForge detects high temporal urgency and emotional distress. It activates **Crisis Mode**:

1. **Rapid Diagnostic (20 minutes)**: Instead of asking "what chapter are you on," the AI generates a synthetic mechanism problem. David attempts it. The AI identifies the specific gap: he confuses SN2 (concerted) with SN1 (stepwise) mechanisms and lacks carbocation stability intuition.
2. **Panic Protocol**: The AI explicitly tells him to close his textbook. It generates a **4-Day Battle Plan** weighted by exam frequency analysis (retrieved from past papers): 40% of time on his specific gap (substitution/elimination), 20% on new material, 40% on exam simulation.

**The Teaching Sequence:**

- **Day 1**: No videos. The AI generates infinite mechanism variations. When David draws an arrow-pushing mechanism incorrectly, the AI retrieves the specific marking scheme criteria: *"You showed a backside attack on a tertiary carbon. Mark scheme says: 0/4 marks—steric hindrance makes this impossible. The correct intermediate is a carbocation. Let me generate the resonance structures..."*
- **Day 2**: **Bilingual pedagogy** emerges. David mentions he speaks Spanish at home. The AI explains carbocation rearrangements in Spanish first, then provides the English IUPAC terminology he needs for the exam.
- **Day 3**: Generated mock exam under timed conditions. The AI acts as examiner, then grader, applying the actual professor's marking patterns (retrieved from department archives). David scores 78%. The AI identifies the remaining 22% gap: spectroscopy interpretation.
- **Day 4**: Morning-of refresher generated at 7:00 AM—only the specific spectroscopy trees he missed, delivered via mobile.

**The Verification:**
Every mechanism David draws is checked against chemical validity rules (RDKit). When he proposes a non-existent rearrangement, the AI flags it before he memorizes the error.

**Outcome:**
David scores 82% (A-) on the final. He reports: *"It didn't just teach me reactions. It taught me how to think about electron flow. The AI never gave me the answer, but it knew exactly which of my mistakes were conceptual versus careless."*

---

### Journey 3: The Career Pivot Professional

**Persona:** Kenji (34), retail shift supervisor, father of one. Salary $42K. He sees a Data Analyst job posting requiring Python/SQL, offering $65K. He has never written code. He believes he is "too old to learn."

**The Contextual Onboarding:**
Kenji selects the "Career Change - Data Analytics" track. The AI rejects generic "Python 101." Instead, it creates a **Just-in-Time** curriculum:

- **Week 1**: Kenji uploads his actual store inventory spreadsheet (CSV). The AI generates Python code using `pandas` to clean it. When he runs it in the sandboxed environment, his 2-hour manual task completes in 8 seconds. He experiences immediate utility.
- **Week 2**: The AI generates a **Customer Segmentation Project**. It creates a synthetic dataset matching his retail context. He learns K-Means clustering not through abstract math, but through "finding the whale customers" at his store.
- **Week 3**: Debugging spiral. Kenji encounters a `KeyError`. The AI retrieves the exact line, explains dictionary structures using his inventory SKU system as analogy, and generates three similar errors for him to practice fixing.

**The Portfolio Construction:**
By Month 3, the AI has generated three complete projects:

1. **Inventory Automation Script** (his real work data, anonymized)
2. **Customer Segmentation Analysis** (K-Means, RFM analysis)
3. **Sales Forecasting Dashboard** (Matplotlib visualizations)

Each project includes a generated `README.md` and technical documentation. The AI verifies code quality using PEP8 linters and complexity metrics.

**The Interview Prep:**
Kenji inputs the job description. The AI switches to **Interviewer Mode**:

- Generates SQL questions using his project data
- Creates the "non-traditional background" narrative: *"You didn't just take a bootcamp. You solved real business problems with code to get here."*
- Conducts mock technical screens where the AI plays the hiring manager, asking increasingly difficult questions about his own projects.

**Outcome:**
Kenji accepts a Data Analyst role at $62K. His total investment: $29/month for 6 months ($174). ROI: 35,700%. He continues using EduForge for "Level Up Mode"—learning Tableau to move toward Senior Analyst.

---

### Journey 4: The Public School Teacher (Institutional Tier)

**Persona:** Ms. Rodriguez, 7th Grade Math, Riverside Unified School District. Class size: 32 students. 40% English Language Learners. She has 3 students with IEPs and 5 "accelerated" students who are bored.

**The Infrastructure:**
The district deployed EduForge Institutional ($14/student/year). Ms. Rodriguez logs into her **Co-Pilot Dashboard**.

**The Morning Brief (Auto-Generated):**
At 6:30 AM, she reviews:

- **Jamie**: Spent 45 minutes on slope problems yesterday but still shows "rise over run" confusion. AI suggests using physical manipulatives (bin 3). Lesson plan adjusted.
- **Alex**: Mastered linear equations 2 days early. AI generated enrichment: introduction to derivatives (visual only). Ms. Rodriguez approves with one click.
- **Class Readiness**: 80% ready for new content; 20% need review.

**The Classroom Flow:**
Students log in via Clever SSO. Their screens show personalized AI tutors, but locked to the **TEKS standards** pacing guide Ms. Rodriguez set.

- **During Lecture**: Ms. Rodriguez explains slope to the class. The AI (via student tablets) simultaneously generates Portuguese translations for ELL students, provides dyslexia-friendly fonts for IEP students, and pushes calculus preview questions to accelerated students—all in real-time.
- **Independent Practice**: The AI generates infinite worksheet variants (anti-cheating). When Maria (IEP) struggles, the AI switches to visual fraction models automatically. When Marcus (advanced) finishes, the AI generates a project about architectural slope design rather than "busy work."
- **Intervention**: Ms. Rodriguez's tablet glows red: *"Tommy has guessed incorrectly 5 times on fractions. AI has attempted 2 explanations. Recommend: Physical fraction tiles (bin 3). Specific problem queued to your tablet."* She intervenes with human connection while the AI handles the 31 other students.

**The Reporting:**
At 3:00 PM, gradebook data auto-syncs to PowerSchool. The AI generated detailed mastery reports for each IEP student, satisfying compliance documentation requirements that previously took her 10 hours weekly.

**Outcome:**
Ms. Rodriguez reports: *"I am no longer a delivery system for worksheets. I am an intervention specialist. I know exactly who needs me and why, while the AI ensures no student is left practicing what they already know or struggling alone with what they don't."*

---

### Journey 5: The Refugee Student

**Persona:** Ahmad (15), Syrian refugee in Berlin. Attending German Gymnasium. Native Arabic speaker. Conversational German, weak academic German. Missed 18 months of schooling during migration. Was top of his class in Syria; now failing physics because he cannot understand the teacher's German explanations.

**The Bilingual Bridge:**
Ahmad selects Arabic as his interface language but inputs his curriculum: *"German Gymnasium, Physics, Grade 10."*

**The Retrieval Strategy:**
The AI retrieves:

- The German physics syllabus (Lehrplan) in German
- Ahmad's prior knowledge (assessed via Arabic conversation)
- The gap analysis: He knows Newton's laws conceptually (learned in Syria) but lacks German academic vocabulary and missed "Energy Conservation" (not taught in his interrupted curriculum).

**The Session Flow:**

- **Explanation**: The AI teaches kinetic energy in Arabic first: *"الطاقة الحركية هي..."* Then provides the German terminology: *"Die kinetische Energie..."* It explicitly maps: *"السرعة = Geschwindigkeit (not 'Schnelligkeit'—the syllabus requires the technical term)."*
- **Gap Filling**: The AI generates 3 intensive sessions on Energy Conservation (the missed topic), taught in Arabic with German vocabulary integration, ensuring Ahmad can participate in class discussions.
- **Exam Preparation**: The AI generates practice questions in the German Abitur format but allows Ahmad to answer in Arabic initially, then requires German translations of key terms.

**The Verification:**
When Ahmad writes a physics equation, the AI verifies it against SI unit standards (Wolfram). When he describes a concept in Arabic, the AI checks it against the German syllabus requirements to ensure conceptual alignment.

**The Social Integration:**
After 3 months, Ahmad raises his hand in physics class and answers a question about *Erhaltungssätze* (conservation laws) in perfect academic German. His teacher emails his parents: *"Remarkable transformation. Ahmad is now in the top 10% of the class."*

**Outcome:**
Ahmad bridged 18 months of curriculum disruption in 12 weeks. He learned not by being "remediated" (which implies deficiency), but by being taught bilingually with precision alignment to his new country's standards while honoring his existing knowledge.

---

## Summary of Differentiation

| Feature | Traditional EdTech | EduForge |
|---------|-------------------|----------|
| **Content** | Static videos/worksheets | Generated dynamically per student |
| **Personalization** | "Grade level" | Concept-level knowledge graph |
| **Curriculum** | Generic or human-authored courses | Retrieved official syllabi (RAG) |
| **Cost Structure** | High content production costs | High compute, zero marginal content cost |
| **Language** | Translation layer | Native pedagogical transcreation |
| **Safety** | Content moderation | Deterministic verification (math/chem checks) |

---

## Technical Architecture

### Project Structure

```
eduforge/
├── apps/
│   ├── api/                    # Hono backend API
│   │   └── src/
│   │       ├── routes/         # API endpoints
│   │       │   ├── auth.ts     # Authentication
│   │       │   ├── tutor.ts    # AI tutoring
│   │       │   ├── student.ts  # Student management
│   │       │   ├── teacher.ts  # Teacher features
│   │       │   ├── parent.ts   # Parent dashboard
│   │       │   └── admin.ts    # Administration
│   │       └── middleware/     # Auth, rate limiting
│   └── web/                    # Next.js 14 frontend
│       └── src/
│           ├── app/            # App router pages
│           │   ├── (dashboard)/
│           │   │   ├── student/
│           │   │   ├── teacher/
│           │   │   ├── parent/
│           │   │   └── admin/
│           │   └── api/        # API routes
│           └── components/     # UI components
├── packages/
│   ├── ai/                     # AI engines
│   │   └── src/
│   │       ├── model-router.ts      # Hierarchical model routing
│   │       ├── rag-engine.ts        # Curriculum RAG
│   │       ├── socratic-engine.ts   # Pedagogical AI
│   │       └── verification-engine.ts # STEM verification
│   └── database/               # Prisma schema
│       └── prisma/
│           └── schema.prisma   # Full data model
└── package.json               # Monorepo configuration
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Radix UI, Zustand |
| **Backend** | Hono, TypeScript, Node.js |
| **Database** | PostgreSQL, Prisma ORM |
| **AI/ML** | Anthropic Claude (Haiku/Sonnet/Opus), OpenAI embeddings, Pinecone vectors |
| **Verification** | Wolfram Alpha, RDKit, Judge0 |
| **Payments** | Stripe |
| **Build** | Turbo monorepo, TypeScript |

### Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development servers
npm run dev
```

### Environment Variables

See `.env` for required configuration:

- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude API access
- `OPENAI_API_KEY` - Embeddings generation
- `PINECONE_API_KEY` - Vector database
- `WOLFRAM_APP_ID` - Math verification
- `JUDGE0_API_KEY` - Code execution
- `STRIPE_SECRET_KEY` - Payment processing

---

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 10 questions/day, 1 curriculum |
| **Student Pro** | $29/month | Unlimited questions, all curricula, exam prep |
| **Family Pro** | $79/month | Up to 4 students, parent dashboard, all features |
| **Institution** | $14/student/year | SSO, gradebook sync, teacher co-pilot, analytics |
| **Enterprise** | Custom | Custom curriculum ingestion, SLAs, dedicated support |

---

## License

Proprietary. All rights reserved.

---

EduForge is not an app. It is infrastructure for human capability development—whether that human is a homeschooling mother reclaiming her time, a refugee reclaiming his academic standing, or a teacher reclaiming her classroom from administrative overload.
