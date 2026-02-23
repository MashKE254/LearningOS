# EduForge Testing Guide

Complete guide for setting up local development with Ollama and testing all customer journeys.

## Quick Start

### 1. Install and Start Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download

# Pull a model (choose one)
ollama pull llama3.2        # Recommended: Fast, good quality
ollama pull mistral         # Alternative: Good for reasoning
ollama pull codellama       # For code-heavy tasks

# Start Ollama server
ollama serve
```

### 2. Configure Environment

The `.env` file is already configured for Ollama:

```env
AI_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2"
```

### 3. Start the Application

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

---

## Customer Journey 1: Student Learning Experience

### Path: Student Chat Interface
**URL:** `/student`

#### Steps to Test:

1. **Login/Access**
   - Open http://localhost:3000
   - Click "Student" to enter student view
   - You should see the AI status indicator (green = connected)

2. **Mode Selection**
   - Choose a learning mode:
     - **Learn Mode**: Socratic questioning, guided discovery
     - **Practice Mode**: Problems with hints and feedback
     - **Exam Mode**: Intensive exam preparation

3. **Chat Interaction**
   - Try these prompts:
     ```
     "Help me understand quadratic equations"
     "What's the difference between mitosis and meiosis?"
     "I'm stuck on this chemistry problem: balance H2 + O2 -> H2O"
     ```

4. **Expected AI Behavior**
   - Asks clarifying questions instead of giving direct answers
   - Breaks down concepts step by step
   - Uses the Socratic method to guide understanding

#### What's Working:
- [x] Real AI responses via Ollama
- [x] Session persistence
- [x] Mode-specific prompting
- [x] Streaming responses (if enabled)

---

## Customer Journey 2: Debug Mode (Misconception Correction)

### Path: Debug Mode
**URL:** `/student/debug`

#### Steps to Test:

1. **Navigate to Debug Mode**
   - From student dashboard, click "Debug Mode" in sidebar

2. **Select a Misconception**
   - View list of detected misconceptions
   - Click one to start a debug session

3. **4-Step Process**
   - **Step 1 - Identify**: AI identifies what went wrong
   - **Step 2 - Explain**: AI explains why this is a common mistake
   - **Step 3 - Contrast**: Side-by-side wrong vs correct thinking
   - **Step 4 - Verify**: AI asks a verification question

4. **Complete the Session**
   - Answer the verification question
   - Mark misconception as resolved

#### What's Working:
- [x] Pre-loaded misconception examples
- [x] AI-guided 4-step correction process
- [x] Progress tracking through steps
- [x] Chat interface for follow-up questions

---

## Customer Journey 3: Teacher Course Generation

### Path: Edit Mode
**URL:** `/teacher/edit-mode`

#### Steps to Test:

1. **Access Teacher Dashboard**
   - Click "Teacher" role button
   - Navigate to "Edit Mode" in sidebar

2. **Upload Material**
   - Enter a filename (e.g., "Chapter_5_Photosynthesis.pdf")
   - Paste content to be transformed into a course:
     ```
     Photosynthesis is the process by which plants convert sunlight,
     water, and carbon dioxide into glucose and oxygen. The process
     occurs in the chloroplasts of plant cells, specifically in
     structures called thylakoids and the stroma.

     The light-dependent reactions occur in the thylakoids where
     water is split and ATP/NADPH are produced. The light-independent
     reactions (Calvin cycle) occur in the stroma where CO2 is fixed
     into glucose.
     ```

3. **Generate Course**
   - Click "Generate Course"
   - AI will create:
     - Learning objectives
     - Lesson modules
     - Practice questions
     - Assessment questions with hints

4. **Review Generated Content**
   - Browse generated modules
   - View questions with answers and explanations
   - Edit content if needed

#### What's Working:
- [x] Material upload simulation
- [x] AI-powered course generation (when Ollama connected)
- [x] Template fallback if AI unavailable
- [x] Module and question structure

---

## Customer Journey 4: IEP/504 Document Generation

### Path: IEP Generator API
**URL:** `/api/iep-generator`

#### Steps to Test (via API):

```bash
# Generate IEP document
curl -X POST http://localhost:3000/api/iep-generator \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student_123",
    "studentName": "Alex Johnson",
    "teacherId": "teacher_456",
    "gradeLevel": 8,
    "subjects": ["Mathematics", "English", "Science"],
    "specialNeeds": ["dyslexia", "adhd"]
  }'
```

#### Response Includes:
- Present levels of performance
- Misconception history analysis
- Recommended accommodations (based on special needs)
- Measurable goals with baselines
- Parent-friendly summary (AI-generated if available)

---

## Customer Journey 5: Community & Collaboration

### Path: Community Hub
**URL:** `/student/community`

#### Steps to Test:

1. **View Learning Needs Board**
   - See questions/needs from classroom
   - Vote on needs you share
   - Add your own learning needs

2. **Browse Community Content**
   - View explanations, mnemonics, worked examples
   - Content sorted by relevance score
   - Filter by subject/topic

3. **Contribute Content**
   - Switch to "Contribute" tab
   - Create a new explanation, mnemonic, or worked example
   - Submit for community review

---

## API Endpoints Reference

### Chat API
```
GET  /api/chat?action=status     # Check AI connection status
POST /api/chat                    # Send message, get AI response
PUT  /api/chat                    # Update session mode
DELETE /api/chat?sessionId=xxx   # Delete session
```

### Edit Mode API
```
GET  /api/edit-mode              # List generated courses
POST /api/edit-mode              # Upload material or generate course
PUT  /api/edit-mode              # Update course content
```

### IEP Generator API
```
GET  /api/iep-generator          # List documents
POST /api/iep-generator          # Generate new IEP/504
PUT  /api/iep-generator          # Update document status
```

### Other APIs
```
GET  /api/certificates           # Certificate pathways
GET  /api/skills-intelligence    # Enterprise skills dashboard
GET  /api/collaborative-authoring # Community content
POST /api/material-upload        # Upload study materials
```

---

## Troubleshooting

### AI Not Responding

1. **Check Ollama is running:**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   Should return list of models.

2. **Check model is installed:**
   ```bash
   ollama list
   ```
   Should show `llama3.2` or your chosen model.

3. **Restart Ollama:**
   ```bash
   # Kill existing process
   pkill ollama

   # Start fresh
   ollama serve
   ```

### Slow Responses

1. **Use a smaller model:**
   ```bash
   ollama pull phi3    # Smaller, faster model
   ```
   Update `.env`: `OLLAMA_MODEL="phi3"`

2. **Check system resources:**
   - Ollama needs RAM for model loading
   - First response may be slow (model loading)

### Build Errors

1. **Clean and reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## Testing Checklist

### Student Features
- [ ] Chat works with Ollama
- [ ] Mode switching changes AI behavior
- [ ] Debug mode shows misconceptions
- [ ] Debug 4-step process works
- [ ] Community page loads content

### Teacher Features
- [ ] Edit mode shows courses
- [ ] Material upload works
- [ ] AI generates course content
- [ ] IEP generation creates documents

### System
- [ ] AI status indicator accurate
- [ ] Sessions persist correctly
- [ ] Error messages helpful
- [ ] Fallbacks work when AI offline

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      EduForge Web App                        │
│                    (Next.js 14 App Router)                   │
├─────────────────────────────────────────────────────────────┤
│  Student UI          Teacher UI           Parent UI          │
│  ├─ Chat            ├─ Edit Mode         ├─ Dashboard        │
│  ├─ Debug Mode      ├─ IEP Reports       └─ Progress         │
│  ├─ Community       └─ Class Mgmt                            │
│  └─ Progress                                                 │
├─────────────────────────────────────────────────────────────┤
│                       API Layer                              │
│  /api/chat  /api/edit-mode  /api/iep-generator  etc.        │
├─────────────────────────────────────────────────────────────┤
│                    AI Service Layer                          │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐        │
│  │   Ollama    │   │  Anthropic  │   │   OpenAI    │        │
│  │   Client    │   │   Router    │   │  (Embeds)   │        │
│  └─────────────┘   └─────────────┘   └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Core Libraries                            │
│  Knowledge Graph │ Streaks │ Text Leveler │ Safety Loop     │
│  Confidence      │ Intervention │ Language Bridging          │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Add more learning modes**: Review mode, Assessment mode
2. **Integrate Knowledge Graph**: Track mastery across sessions
3. **Add real-time features**: Live collaboration, classroom sync
4. **Production deployment**: Configure for Anthropic Claude API
