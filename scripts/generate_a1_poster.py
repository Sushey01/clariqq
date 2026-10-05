"""
generate_a1_poster.py
Generates an A1 Portrait Academic Conference Poster in PowerPoint (.pptx) based on the Clariq FYP Dissertation.
Dimensions: ISO A1 Portrait (594 mm x 841 mm = 23.386 in x 33.110 in)
Readable from 1-2 meters away.
Author: Shekhar Lamichhane Magar (ID: 23189647)
Supervisor: Rupak Koirala
Degree: BSc (Hons) Computer and Data Science, Birmingham City University (CMP6200/DIG6200)
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

# A1 Dimensions (594 mm x 841 mm)
A1_WIDTH  = Inches(23.386) # 594 mm
A1_HEIGHT = Inches(33.110) # 841 mm

# Color Palette (Matching Reference Academic Poster)
C_HEADER_DARK  = RGBColor(16, 45, 36)     # Deep Forest Green / Teal #102D24
C_NAVY_PRIMARY = RGBColor(0, 51, 102)     # BCU Blue #003366
C_CYAN_ACCENT  = RGBColor(14, 165, 233)   # Electric Blue / Cyan #0EA5E9
C_DARK_TEXT    = RGBColor(17, 24, 39)     # Dark Slate / Almost Black #111827
C_BODY_TEXT    = RGBColor(55, 65, 81)     # Slate Gray #374151
C_MUTED_TEXT   = RGBColor(107, 114, 128)  # Muted Gray #6B7280
C_CARD_BG      = RGBColor(255, 255, 255)  # Pure White #FFFFFF
C_CARD_BORDER  = RGBColor(209, 213, 219)  # Light Gray Border #D1D5DB
C_ALT_BG       = RGBColor(249, 250, 251)  # Soft Light Fill #F9FAFB
C_WHITE        = RGBColor(255, 255, 255)  # Pure White
C_GREEN_STAT   = RGBColor(22, 163, 74)    # Positive Metric #16A34A
C_GOLD_TEXT    = RGBColor(245, 158, 11)   # Accent Gold

def create_poster():
    prs = Presentation()
    prs.slide_width = A1_WIDTH
    prs.slide_height = A1_HEIGHT
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    return prs, slide

def add_rect(slide, left, top, width, height, bg_color=C_CARD_BG, border_color=C_CARD_BORDER, border_width=1.5):
    """Draws a rectangular container box with smooth borders."""
    rect = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    rect.fill.solid()
    rect.fill.fore_color.rgb = bg_color
    if border_color:
        rect.line.color.rgb = border_color
        rect.line.width = Pt(border_width)
    else:
        rect.line.fill.background()
    return rect

def add_section_title(slide, left, top, width, title_text, font_size=23):
    """Creates a bold section title readable from 1-2 meters away."""
    tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(0.55))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(font_size)
    p.font.bold = True
    p.font.color.rgb = C_DARK_TEXT
    p.font.name = 'Arial'
    return tb

def build_header(slide):
    """Builds top dark header banner with logos, title, subtitle, credentials, and standout novelty."""
    # Top Dark Green/Teal Banner (Height = 2.40")
    banner = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, A1_WIDTH, Inches(2.40))
    banner.fill.solid()
    banner.fill.fore_color.rgb = C_HEADER_DARK
    banner.line.color.rgb = C_HEADER_DARK

    # Left Logo Icon
    logo_path = "logo.png"
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Inches(0.80), Inches(0.35), height=Inches(1.70))

    # Title & Subtitle Box
    tb_title = slide.shapes.add_textbox(Inches(5.20), Inches(0.25), Inches(12.5), Inches(1.90))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
    
    p1 = tf_t.paragraphs[0]
    p1.text = "Clariq"
    p1.font.size = Pt(56)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.font.name = 'Arial'

    p2 = tf_t.add_paragraph()
    p2.text = "AI-Powered Socratic Science Tutor with Adaptive Knowledge Tracking"
    p2.font.size = Pt(21)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(186, 230, 253)
    p2.font.name = 'Arial'
    p2.space_before = Pt(3)

    p3 = tf_t.add_paragraph()
    p3.text = "For Nepal's Secondary Education Examination (SEE, Class 10 Science)  •  Physics, Chemistry & Biology"
    p3.font.size = Pt(14)
    p3.font.color.rgb = RGBColor(224, 242, 254)
    p3.font.name = 'Arial'
    p3.space_before = Pt(2)

    # Right Institutional Crests & Names
    tb_inst = slide.shapes.add_textbox(Inches(17.8), Inches(0.28), Inches(4.78), Inches(1.85))
    tf_i = tb_inst.text_frame
    tf_i.word_wrap = True
    tf_i.margin_left = tf_i.margin_top = tf_i.margin_right = tf_i.margin_bottom = 0
    
    p_i1 = tf_i.paragraphs[0]
    p_i1.alignment = PP_ALIGN.RIGHT
    p_i1.text = "SUNWAY COLLEGE"
    p_i1.font.size = Pt(19)
    p_i1.font.bold = True
    p_i1.font.color.rgb = C_WHITE
    p_i1.font.name = 'Arial'

    p_i2 = tf_i.add_paragraph()
    p_i2.alignment = PP_ALIGN.RIGHT
    p_i2.text = "KATHMANDU, NEPAL"
    p_i2.font.size = Pt(14)
    p_i2.font.bold = True
    p_i2.font.color.rgb = C_GOLD_TEXT
    p_i2.font.name = 'Arial'

    p_i3 = tf_i.add_paragraph()
    p_i3.alignment = PP_ALIGN.RIGHT
    p_i3.text = "BIRMINGHAM CITY\nUniversity"
    p_i3.font.size = Pt(17)
    p_i3.font.bold = True
    p_i3.font.color.rgb = C_WHITE
    p_i3.font.name = 'Arial'
    p_i3.space_before = Pt(5)

    # Sub-header Strip (y = 2.58", height = 1.15")
    # Left: Author credentials
    tb_auth = slide.shapes.add_textbox(Inches(0.80), Inches(2.62), Inches(12.6), Inches(1.10))
    tf_a = tb_auth.text_frame
    tf_a.word_wrap = True
    tf_a.margin_left = tf_a.margin_top = tf_a.margin_right = tf_a.margin_bottom = 0
    
    p_a1 = tf_a.paragraphs[0]
    p_a1.text = "Shekhar Lamichhane Magar | Student ID: 23189647 | CMP6200 Individual Honours Project"
    p_a1.font.size = Pt(17.5)
    p_a1.font.bold = True
    p_a1.font.color.rgb = C_DARK_TEXT
    p_a1.font.name = 'Arial'

    p_a2 = tf_a.add_paragraph()
    p_a2.text = "Project Supervisor: Rupak Koirala  •  Department of Computer and Data Science  •  October 2026"
    p_a2.font.size = Pt(14)
    p_a2.font.color.rgb = C_BODY_TEXT
    p_a2.font.name = 'Arial'
    p_a2.space_before = Pt(3)

    # Right: Standout Novelty & Contribution Box
    add_rect(slide, 13.60, 2.52, 8.98, 1.18, bg_color=C_ALT_BG, border_color=C_CARD_BORDER)
    tb_sc = slide.shapes.add_textbox(Inches(13.75), Inches(2.58), Inches(8.68), Inches(1.06))
    tf_sc = tb_sc.text_frame
    tf_sc.word_wrap = True
    tf_sc.margin_left = tf_sc.margin_top = tf_sc.margin_right = tf_sc.margin_bottom = 0
    
    p_sc1 = tf_sc.paragraphs[0]
    p_sc1.text = "Standout Novelty & Core Contribution"
    p_sc1.font.size = Pt(16)
    p_sc1.font.bold = True
    p_sc1.font.color.rgb = C_DARK_TEXT
    p_sc1.font.name = 'Arial'

    p_sc2 = tf_sc.add_paragraph()
    p_sc2.text = "First curriculum-grounded Socratic tutor for Nepal's Class 10 SEE with strict turn gating (0% answer leaks vs 88% GPT-4o), 135-node adaptive knowledge graph, real-time confusion telemetry, and responsive web/mobile clients."
    p_sc2.font.size = Pt(12)
    p_sc2.font.color.rgb = C_BODY_TEXT
    p_sc2.font.name = 'Arial'
    p_sc2.space_before = Pt(2)

def build_upper_left(slide):
    """Builds Problem, Background, Gap, Aim, Objectives & Research Questions in Left Column."""
    # Column Left: x=0.80", width=8.10"
    
    # 1. Problem & Background (y = 3.90")
    add_section_title(slide, 0.80, 3.90, 8.10, "Problem & Background Context", font_size=23)
    tb_prob = slide.shapes.add_textbox(Inches(0.80), Inches(4.35), Inches(8.10), Inches(1.75))
    tf_p = tb_prob.text_frame
    tf_p.word_wrap = True
    tf_p.margin_left = tf_p.margin_top = tf_p.margin_right = tf_p.margin_bottom = 0
    
    probs = [
        ("National Failure Crisis", "In the 2080-81 Secondary Education Examination (SEE), 79,271 students (15.42%) were marked Non-Graded (NG) in Science & Technology—the highest academic deficit subject (MoEST, 2024)."),
        ("The AI 'Cognitive Crutch' Hazard", "Commercial chatbots (GPT-4o) act as unearned answer dispensers (88% answer dumps), short-circuiting metacognition and inducing cognitive atrophy (Bastani et al., 2025)."),
        ("Socio-Economic Divide", "Private tutoring centers cost NPR 2,000–5,000/mo ($15–$40), which is unaffordable for rural families. Public schools face severe 50+:1 pupil-teacher ratios, precluding 1-on-1 scaffolding.")
    ]
    for idx, (lead, body) in enumerate(probs):
        p = tf_p.paragraphs[0] if idx == 0 else tf_p.add_paragraph()
        r1 = p.add_run()
        r1.text = f"•  {lead}: "
        r1.font.bold = True
        r1.font.size = Pt(12.5)
        r1.font.color.rgb = C_NAVY_PRIMARY
        r1.font.name = 'Arial'
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(12)
        r2.font.color.rgb = C_BODY_TEXT
        r2.font.name = 'Arial'
        p.space_after = Pt(4)

    # 2. Identified Research Gap (y = 6.20")
    add_section_title(slide, 0.80, 6.20, 8.10, "Identified Research Gap", font_size=23)
    tb_gap = slide.shapes.add_textbox(Inches(0.80), Inches(6.65), Inches(8.10), Inches(1.10))
    tf_g = tb_gap.text_frame
    tf_g.word_wrap = True
    tf_g.margin_left = tf_g.margin_top = tf_g.margin_right = tf_g.margin_bottom = 0
    
    p_g = tf_g.paragraphs[0]
    p_g.text = "Existing educational AI tools either act as didactic answer dispensers without national curriculum grounding, or rely on rigid rule-based ITS without conversational fluidity. No prior work provides open-weight Socratic dialogue models governed by deterministic turn gating combined with dynamic concept mastery tracking for South Asian national secondary curricula."
    p_g.font.size = Pt(12.5)
    p_g.font.color.rgb = C_BODY_TEXT
    p_g.font.name = 'Arial'

    # 3. Aim, Objectives & Research Questions (y = 7.85")
    add_section_title(slide, 0.80, 7.85, 8.10, "Aim, Objectives & Research Questions", font_size=23)
    tb_aim = slide.shapes.add_textbox(Inches(0.80), Inches(8.30), Inches(8.10), Inches(3.40))
    tf_aim = tb_aim.text_frame
    tf_aim.word_wrap = True
    tf_aim.margin_left = tf_aim.margin_top = tf_aim.margin_right = tf_aim.margin_bottom = 0
    
    p_a = tf_aim.paragraphs[0]
    p_a.text = "Research Aim: To design, implement, and empirically pilot Clariq—an AI-powered Socratic science tutor delivering curriculum-grounded dialogue, dynamically tracking mastery across a 135-node Knowledge Graph, and evaluating its pedagogical feasibility against textbook self-study."
    p_a.font.size = Pt(12.5)
    p_a.font.bold = True
    p_a.font.color.rgb = C_DARK_TEXT
    p_a.font.name = 'Arial'
    p_a.space_after = Pt(4)

    p_rq = tf_aim.add_paragraph()
    p_rq.text = "• RQ1 (Dialogue Restraint): Can open-weight LLMs, constrained by turn policies and RAG, sustain multi-turn inquiry without leaking direct answers?\n• RQ2 (Mastery Telemetry): Can conversational turns yield reliable concept mastery telemetry across an adaptive knowledge graph to flag struggling students?"
    p_rq.font.size = Pt(11.5)
    p_rq.font.color.rgb = C_NAVY_PRIMARY
    p_rq.font.bold = True
    p_rq.font.name = 'Arial'
    p_rq.space_after = Pt(4)

    objs = [
        "1. Ingest official CDC Class 10 science textbooks into Chroma vector DB",
        "2. Implement hybrid RAG with lexical candidate reranking (P@3 >= 0.85)",
        "3. Enforce 5-stage turn policy (turn_policy.py) to suppress answer leakage",
        "4. Fine-tune open-weight Socratic dialogue model on dual T4 GPUs",
        "5. Eliminate script collapse via weight merging (Qwen2.5-7B Merged SFT)",
        "6. Construct 135-node directed knowledge graph across Physics, Chem, Bio",
        "7. Formulate token-overlap scoring with coherence and rote-copy penalties",
        "8. Implement Exponential Moving Average (EWMA) mastery updating",
        "9. Build automated 3-turn persistent confusion diagnostic alerts",
        "10. Conduct controlled empirical pilot study (N=20) against textbook study"
    ]
    for obj_txt in objs:
        p_o = tf_aim.add_paragraph()
        p_o.text = f"•  {obj_txt}"
        p_o.font.size = Pt(11)
        p_o.font.color.rgb = C_BODY_TEXT
        p_o.font.name = 'Arial'
        p_o.space_after = Pt(2)

def build_upper_right(slide):
    """Builds Method (6-box grid) and Architecture/Workflow in Right Column."""
    # Column Right: x=9.35", width=13.23"
    
    # Section Title: Method
    add_section_title(slide, 9.35, 3.90, 13.23, "Research Methodology & System Frameworks", font_size=23)

    # 6-box Method Grid (3 columns x 2 rows)
    # Box dimensions: width = 4.25", height = 1.15", gap = 0.24"
    methods = [
        ("1  Research Approach", "Design Science Research (DSR; Peffers et al., 2007): 6-stage iterative cycle to design, build, test, and evaluate the artifact."),
        ("2  Ingestion & Hybrid RAG", "17 digital CDC volumes, OCR filter, regex boilerplate cleaning, 768d nomic-embed-text vectors in Chroma DB + lexical reranking."),
        ("3  Socratic Turn Policy", "turn_policy.py: intent routing, terminal '?' gating, definitional assertion interception, and scaffolding counter-question override."),
        ("4  Tutor LLM Fine-Tuning", "Qwen2.5-7B SFT LoRA on 606 dialogues (4,628 turns); merged weights via merge_and_unload deployed on RunPod Serverless vLLM."),
        ("5  Adaptive Knowledge Graph", "135 concept nodes, 99 prerequisite edges, token-overlap scoring with coherence penalty, and EWMA mastery tracking (α = 0.25)."),
        ("6  Client Ecosystem", "React 18 / Vite Nebular UI desktop tutoring bench, Teacher Diagnostic Desk for class-wide heatmaps, and Expo React Native mobile app.")
    ]

    for idx, (m_title, m_desc) in enumerate(methods):
        col = idx % 3
        row = idx // 3
        bx = 9.35 + col * (4.25 + 0.24)
        by = 4.35 + row * (1.15 + 0.16)
        
        # Outer card
        add_rect(slide, bx, by, 4.25, 1.15, bg_color=C_ALT_BG, border_color=C_CARD_BORDER)
        
        tb = slide.shapes.add_textbox(Inches(bx + 0.12), Inches(by + 0.10), Inches(4.01), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p1 = tf.paragraphs[0]
        p1.text = m_title
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = C_DARK_TEXT
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.text = m_desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_BODY_TEXT
        p2.font.name = 'Arial'
        p2.space_before = Pt(2)

    # Section Title: Architecture and Workflow
    add_section_title(slide, 9.35, 7.00, 13.23, "Clariq Six-Layer System Architecture & Interaction Workflow", font_size=23)

    # High-Res Architecture Diagram
    arch_img = "report_figures/fig_system_architecture.png"
    if os.path.exists(arch_img):
        # width = 13.23", top = 7.50", height ~4.15"
        slide.shapes.add_picture(arch_img, Inches(9.35), Inches(7.50), width=Inches(13.23))

def build_dataset_evidence(slide):
    """Builds Curriculum Knowledge Base & Experimental Setup."""
    # Top y = 11.85", width = 21.786", height = 2.10"
    
    # Left Box: Curriculum Knowledge Base (width = 13.20")
    add_rect(slide, 0.80, 11.85, 13.20, 2.10, bg_color=C_WHITE, border_color=C_CARD_BORDER)
    tb_c1 = slide.shapes.add_textbox(Inches(1.05), Inches(11.95), Inches(12.70), Inches(1.90))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    tf_c1.margin_left = tf_c1.margin_top = tf_c1.margin_right = tf_c1.margin_bottom = 0
    
    p1 = tf_c1.paragraphs[0]
    p1.text = "SEE Science Curriculum Concept Nodes (135 Nodes Across 3 Branches)"
    p1.font.size = Pt(16)
    p1.font.bold = True
    p1.font.color.rgb = C_DARK_TEXT
    p1.font.name = 'Arial'

    p2 = tf_c1.add_paragraph()
    p2.text = "•  Physics (45 Nodes): Force, Gravity, Pressure, Energy, Heat, Light, Current Electricity, Magnetism\n•  Chemistry (50 Nodes): Periodic Table, Chemical Reactions, Acid-Base-Salt, Metals, Hydrocarbons & Derivatives\n•  Biology (40 Nodes): Cell Reproduction, Heredity, Nervous System, Blood Circulation, Ecosystems & Balance"
    p2.font.size = Pt(12)
    p2.font.color.rgb = C_BODY_TEXT
    p2.font.name = 'Arial'
    p2.space_before = Pt(3)

    p3 = tf_c1.add_paragraph()
    p3.text = "Curriculum Ingestion Hygiene: 17 official CDC textbooks cleaned with boilerplate regex stripping (>15% page recurrence), 1200-char chunking with 200-char overlap, nomic-embed-text (768d) vectors indexed in Chroma DB."
    p3.font.size = Pt(11)
    p3.font.color.rgb = C_MUTED_TEXT
    p3.font.name = 'Arial'
    p3.space_before = Pt(3)

    # Right Box: Socratic Dataset & Tech Stack (width = 8.34")
    add_rect(slide, 14.24, 11.85, 8.34, 2.10, bg_color=C_WHITE, border_color=C_CARD_BORDER)
    tb_c2 = slide.shapes.add_textbox(Inches(14.45), Inches(11.95), Inches(7.94), Inches(1.90))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    tf_c2.margin_left = tf_c2.margin_top = tf_c2.margin_right = tf_c2.margin_bottom = 0

    p4 = tf_c2.paragraphs[0]
    p4.text = "Socratic Dataset & Experimental Tech Stack"
    p4.font.size = Pt(16)
    p4.font.bold = True
    p4.font.color.rgb = C_DARK_TEXT
    p4.font.name = 'Arial'

    p5 = tf_c2.add_paragraph()
    p5.text = "•  Training Corpus: 606 curated dialogues (4,628 turns) covering Direct Conceptual, Misconceptions, Stuck/Confused, Topic Switches, and Ambiguous Probes.\n•  AI & LLM Stack: Qwen2.5-7B-Instruct, PyTorch, Hugging Face PEFT, vLLM PagedAttention on RunPod Serverless GPU.\n•  App Stack: FastAPI, Chroma DB, React 18, Vite, Tailwind CSS, Expo (React Native)."
    p5.font.size = Pt(11.5)
    p5.font.color.rgb = C_BODY_TEXT
    p5.font.name = 'Arial'
    p5.space_before = Pt(3)

def build_screenshots_section(slide):
    """Builds the 7-screenshot visual evidence row."""
    # Section Title: Screenshots and Visual Evidence (y = 14.20")
    add_section_title(slide, 0.80, 14.20, 21.786, "Client Ecosystem & Visual User Interface Evidence", font_size=23)

    # 7 Screenshots Side-by-Side (width = 2.95", height = 4.30", gap = 0.18")
    # Total = 7 * 2.95 + 6 * 0.18 = 20.65 + 1.08 = 21.73"
    slots = [
        ("Navigation &\nLanding Portal", "report_figures/fig_ui_landing.png"),
        ("Authentication &\nOnboarding", "report_figures/fig_ui_login.png"),
        ("Socratic Tutoring\nBench (React 18)", "report_figures/fig_ui_chat_desktop.png"),
        ("Scaffolding\nDialogue Exchange", "report_figures/fig_socratic_exchange.png"),
        ("Teacher Desk\nDiagnostic Analytics", "report_figures/fig_ui_teacher_desk.png"),
        ("Mastery Telemetry\nProgress Curves", "report_figures/fig_student_progress.png"),
        ("Expo Mobile\nClient (React Native)", "report_figures/fig_ui_mobile_app.png")
    ]

    for idx, (title, img_path) in enumerate(slots):
        x = 0.80 + idx * (2.95 + 0.18)
        y = 14.75
        
        # Container Card
        add_rect(slide, x, y, 2.95, 4.40, bg_color=C_CARD_BG, border_color=C_CARD_BORDER)
        
        # Title Box on top
        tb_t = slide.shapes.add_textbox(Inches(x + 0.08), Inches(y + 0.08), Inches(2.79), Inches(0.68))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.alignment = PP_ALIGN.CENTER
        p_t.text = title
        p_t.font.size = Pt(11.5)
        p_t.font.bold = True
        p_t.font.color.rgb = C_DARK_TEXT
        p_t.font.name = 'Arial'

        # Screenshot Image
        if os.path.exists(img_path):
            slide.shapes.add_picture(img_path, Inches(x + 0.12), Inches(y + 0.80), width=Inches(2.71))

def build_metrics_section(slide):
    """Builds Findings, Baseline Comparison, 7 KPI boxes & UAT Pilot Study Callout."""
    # Section Title: Findings and Metrics (y = 19.45")
    add_section_title(slide, 0.80, 19.45, 21.786, "Key Empirical Results, Findings & Baseline Model Comparison", font_size=23)

    # 7 KPI Metric Boxes (width = 2.95", height = 2.05", gap = 0.18")
    kpis = [
        ("0.873", "Curriculum RAG\nPrecision@3", "Target: >= 0.85 (MET)\n+11.3% over raw cosine", C_GREEN_STAT),
        ("0%", "Direct Answer\nDumps (Leakage)", "Baseline: 88% GPT-4o\nComplete answer restraint", C_GREEN_STAT),
        ("100%", "Guiding Questions\n('?') Post-Policy", "Baseline: 22% GPT-4o\nStrict Socratic guidance", C_NAVY_PRIMARY),
        ("0", "Script Collapse\nFlags (Memorization)", "Baseline: 14 in 4B Raw\nResolved via 7B SFT merge", C_GREEN_STAT),
        ("3.31 s", "Median Warm\nLatency (ZeroGPU)", "Target: <= 5.0s (MET)\nRunPod: 6.66s concurrent", C_NAVY_PRIMARY),
        ("+2.80", "Mean Pilot\nLearning Gain", "Baseline: +1.20 Textbook\np = 5.67e-6 (Stat. Sig.)", C_GREEN_STAT),
        ("88.8 / 100", "System Usability\nScale (SUS)", "Target: >= 70.0 (MET)\nAdjective: 'Excellent'", C_NAVY_PRIMARY)
    ]

    for idx, (num_str, label_str, sub_str, col) in enumerate(kpis):
        x = 0.80 + idx * (2.95 + 0.18)
        y = 19.98
        
        # Outer Card
        add_rect(slide, x, y, 2.95, 2.05, bg_color=C_WHITE, border_color=C_CARD_BORDER)
        
        tb = slide.shapes.add_textbox(Inches(x + 0.10), Inches(y + 0.10), Inches(2.75), Inches(1.85))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p1 = tf.paragraphs[0]
        p1.alignment = PP_ALIGN.CENTER
        p1.text = num_str
        p1.font.size = Pt(28)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.CENTER
        p2.text = label_str
        p2.font.size = Pt(12)
        p2.font.bold = True
        p2.font.color.rgb = C_DARK_TEXT
        p2.font.name = 'Arial'
        p2.space_before = Pt(3)

        p3 = tf.add_paragraph()
        p3.alignment = PP_ALIGN.CENTER
        p3.text = sub_str
        p3.font.size = Pt(9.5)
        p3.font.color.rgb = C_MUTED_TEXT
        p3.font.name = 'Arial'
        p3.space_before = Pt(2)

    # Controlled Empirical Pilot Study (UAT) Callout Banner (y = 22.25", height = 1.25")
    add_rect(slide, 0.80, 22.25, 21.786, 1.25, bg_color=C_ALT_BG, border_color=C_CARD_BORDER)
    
    # UAT Badge
    add_rect(slide, 1.05, 22.42, 1.40, 0.88, bg_color=C_HEADER_DARK, border_color=C_HEADER_DARK)
    tb_ub = slide.shapes.add_textbox(Inches(1.05), Inches(22.58), Inches(1.40), Inches(0.55))
    tf_ub = tb_ub.text_frame
    p_ub = tf_ub.paragraphs[0]
    p_ub.alignment = PP_ALIGN.CENTER
    p_ub.text = "UAT"
    p_ub.font.size = Pt(20)
    p_ub.font.bold = True
    p_ub.font.color.rgb = C_WHITE
    p_ub.font.name = 'Arial'

    # Text next to UAT
    tb_ut = slide.shapes.add_textbox(Inches(2.65), Inches(22.35), Inches(19.70), Inches(1.05))
    tf_ut = tb_ut.text_frame
    tf_ut.word_wrap = True
    tf_ut.margin_left = tf_ut.margin_top = tf_ut.margin_right = tf_ut.margin_bottom = 0
    
    p_ut1 = tf_ut.paragraphs[0]
    p_ut1.text = "Controlled Empirical Pilot User Study (N = 20 Class 10 Secondary Students in Nepal, Ages 15–16)"
    p_ut1.font.size = Pt(14)
    p_ut1.font.bold = True
    p_ut1.font.color.rgb = C_DARK_TEXT
    p_ut1.font.name = 'Arial'

    p_ut2 = tf_ut.add_paragraph()
    p_ut2.text = "Randomized between-subjects trial comparing Clariq Socratic AI Tutor (n=10) vs. CDC Textbook Self-Study (n=10) on Chemical Acids, Bases, and Salts. Baseline equivalence confirmed (1.90 vs. 2.00, p = 0.75). Clariq users scored 4.70/5.0 vs. Textbook 3.20/5.0 (t = 5.960, p = 1.25e-5, Cohen's d = 2.666), achieved +2.80 learning gain, studied 34.8% less time (8.35 min vs. 12.80 min, t = -13.93, p < 0.0001), and rated usability at SUS 88.8 / 100."
    p_ut2.font.size = Pt(11.5)
    p_ut2.font.color.rgb = C_BODY_TEXT
    p_ut2.font.name = 'Arial'
    p_ut2.space_before = Pt(2)

def build_bottom_section(slide):
    """Builds Practical Implications, Conclusion, Future Work, References, Pedagogical Features, Scope & Ethics."""
    # Left Column: x=0.80", width=12.20"
    # Right Column: x=13.35", width=9.23"
    
    # Left 1: Practical Implications & Significance (y = 23.80")
    add_section_title(slide, 0.80, 23.80, 12.20, "Practical Implications & Educational Significance", font_size=23)
    tb_imp = slide.shapes.add_textbox(Inches(0.80), Inches(24.30), Inches(12.20), Inches(1.60))
    tf_imp = tb_imp.text_frame
    tf_imp.word_wrap = True
    tf_imp.margin_left = tf_imp.margin_top = tf_imp.margin_right = tf_imp.margin_bottom = 0
    
    impls = [
        ("Bridging the Educational Resource Gap", "Democratizes personalized 1-on-1 Socratic tutoring for rural community school students who cannot afford commercial private tuition centers ($15–$40/month)."),
        ("Protecting Cognitive Autonomy", "Eliminating answer dumping (0% leakage) prevents cognitive surrender and ensures that secondary students actively synthesize scientific principles rather than passively copying solutions."),
        ("Teacher Empowerment", "Translates continuous conversational turns into concept-level mastery heatmaps and automated confusion alerts, enabling educators to prioritize targeted classroom interventions.")
    ]
    for idx, (lead, body) in enumerate(impls):
        p = tf_imp.paragraphs[0] if idx == 0 else tf_imp.add_paragraph()
        r1 = p.add_run()
        r1.text = f"•  {lead}: "
        r1.font.bold = True
        r1.font.size = Pt(12)
        r1.font.color.rgb = C_NAVY_PRIMARY
        r1.font.name = 'Arial'
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(11.5)
        r2.font.color.rgb = C_BODY_TEXT
        r2.font.name = 'Arial'
        p.space_after = Pt(2)

    # Left 2: Conclusion & Future Roadmap (y = 26.05")
    add_section_title(slide, 0.80, 26.05, 12.20, "Conclusion & Future Research Roadmap", font_size=23)
    tb_concl = slide.shapes.add_textbox(Inches(0.80), Inches(26.55), Inches(12.20), Inches(2.20))
    tf_c = tb_concl.text_frame
    tf_c.word_wrap = True
    tf_c.margin_left = tf_c.margin_top = tf_c.margin_right = tf_c.margin_bottom = 0
    
    p_c1 = tf_c.paragraphs[0]
    p_c1.text = "Dissertation Conclusion: Clariq validates that fine-tuning open-weight models (Qwen2.5-7B Merged SFT) combined with deterministic turn policy gating successfully enforces Socratic dialogue restraint (0% answer dumps) while delivering significant comprehension gains (+2.80) and 34.8% study time reductions on Nepal's national Class 10 SEE Science curriculum."
    p_c1.font.size = Pt(12)
    p_c1.font.color.rgb = C_BODY_TEXT
    p_c1.font.name = 'Arial'
    p_c1.space_after = Pt(3)

    p_c2 = tf_c.add_paragraph()
    p_c2.text = "Strategic Future Work:\n•  1. Recursive Conversational Memory: Implement multi-turn conversational state tracking across extended learning sessions.\n•  2. Formal Educator Panel Validation: Convene expert science teachers to compute inter-rater agreement (Cohen's κ) on graph edges.\n•  3. Longitudinal Field Trials: Conduct multi-school trials across rural and urban schools measuring 6-week delayed knowledge retention.\n•  4. Offline Edge Quantization: Deploy GGUF-quantized models (3B/7B) on low-cost offline tablets for off-grid Himalayan classrooms."
    p_c2.font.size = Pt(11)
    p_c2.font.color.rgb = C_NAVY_PRIMARY
    p_c2.font.name = 'Arial'

    # Left 3: References (y = 28.90")
    add_section_title(slide, 0.80, 28.90, 12.20, "References", font_size=20)
    tb_ref = slide.shapes.add_textbox(Inches(0.80), Inches(29.35), Inches(12.20), Inches(3.20))
    tf_r = tb_ref.text_frame
    tf_r.word_wrap = True
    tf_r.margin_left = tf_r.margin_top = tf_r.margin_right = tf_r.margin_bottom = 0
    
    refs = [
        "Bastani, H. et al. (2025) 'Generative AI can harm learning: Evidence from high school classrooms'.",
        "Bloom, B. S. (1984) 'The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring', Educational Researcher, 13(6), pp. 4–16.",
        "Curriculum Development Centre (CDC Nepal, 2024) Class 10 Science and Technology Textbook, Ministry of Education, Sanothimi, Bhaktapur.",
        "Lewis, P. et al. (2020) 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', Advances in Neural Information Processing Systems (NeurIPS 2020).",
        "Ministry of Education, Science and Technology (MoEST, 2024) Secondary Education Examination (SEE) Results 2080-81, Sanothimi, Bhaktapur, Nepal.",
        "Peffers, K. et al. (2007) 'A design science research methodology for information systems research', Journal of Management Information Systems, 24(3), pp. 45–77."
    ]
    for idx, ref_txt in enumerate(refs):
        p = tf_r.paragraphs[0] if idx == 0 else tf_r.add_paragraph()
        p.text = f"•  {ref_txt}"
        p.font.size = Pt(10)
        p.font.color.rgb = C_MUTED_TEXT
        p.font.name = 'Arial'
        p.space_after = Pt(2)

    # Right 1: Pedagogical Features & Accessibility (y = 23.80")
    add_section_title(slide, 13.35, 23.80, 9.23, "Pedagogical Features & Accessibility", font_size=23)
    tb_ped = slide.shapes.add_textbox(Inches(13.35), Inches(24.30), Inches(9.23), Inches(2.15))
    tf_ped = tb_ped.text_frame
    tf_ped.word_wrap = True
    tf_ped.margin_left = tf_ped.margin_top = tf_ped.margin_right = tf_ped.margin_bottom = 0
    
    p_p1 = tf_ped.paragraphs[0]
    p_p1.text = "•  Socratic Scaffolding Chips: Interactive UI chips ('Give me a hint', 'Is my reasoning right?', 'What is the next step?') give learners cognitive autonomy without revealing answers.\n•  Teacher Struggle Alerts: Automated detection of 3 consecutive low-scoring turns triggers diagnostic flags for educators.\n•  Low-Bandwidth Optimization: Lightweight JSON response payloads (<500 bytes per turn) and client-side caching ensure responsive performance over 3G/2G rural mobile connections.\n•  Multi-Platform Access: Web app (React 18 / Vite) and cross-platform mobile client (Expo / React Native) provide seamless access across smartphones and school computer labs."
    p_p1.font.size = Pt(11.5)
    p_p1.font.color.rgb = C_BODY_TEXT
    p_p1.font.name = 'Arial'

    # Right 2: Scope, Delimitations & Ethics (y = 26.70")
    add_section_title(slide, 13.35, 26.70, 9.23, "Scope, Study Limitations & Ethics", font_size=23)
    tb_eth = slide.shapes.add_textbox(Inches(13.35), Inches(27.20), Inches(9.23), Inches(5.35))
    tf_eth = tb_eth.text_frame
    tf_eth.word_wrap = True
    tf_eth.margin_left = tf_eth.margin_top = tf_eth.margin_right = tf_eth.margin_bottom = 0
    
    p_e1 = tf_eth.paragraphs[0]
    p_e1.text = "Scope Boundaries & Delimitations:\n•  In-Scope: Class 10 Physics, Chemistry, Biology (CDC Nepal); typed Socratic chat; 135-node KG; web & mobile clients.\n•  Out-of-Scope: Grades 1–9 / 11–12; speech/voice synthesis; Devanagari script; high-stakes summative grading.\n\nStudy Limitations:\n•  Immediate post-test measures short-term conceptual acquisition rather than long-term delayed retention.\n•  Pilot cohort of N=20 evaluated on a single chemistry unit (Acids & Bases); broader cross-subject trials are needed.\n•  Token-overlap scoring serves as a computationally efficient proxy for understanding, but does not capture deep semantic nuance.\n\nResearch Ethics & Governance:\n•  Protection of Minors: Voluntary student assent, parental awareness, full pseudonymisation (P01–P20), and zero personal identifiable information (PII) stored.\n•  Legal Compliance: Official CDC textbooks utilized under educational research fair dealing provisions of Nepal Copyright Act 2059 (Sec 16 & 18) and UK CDPA 1988.\n•  Professional Standards: Adherence to BCS Code of Conduct and ACM Code of Ethics."
    p_e1.font.size = Pt(11)
    p_e1.font.color.rgb = C_BODY_TEXT
    p_e1.font.name = 'Arial'

def main():
    print("Initializing A1 Portrait Poster Canvas (594 mm x 841 mm = 23.386 in x 33.110 in)...")
    prs, slide = create_poster()

    print("Building Header & Banner...")
    build_header(slide)

    print("Building Upper Left (Problem, Gap, Aim, Objectives & RQs)...")
    build_upper_left(slide)

    print("Building Upper Right (Method Grid & Architecture/Workflow)...")
    build_upper_right(slide)

    print("Building Curriculum & Experimental Setup...")
    build_dataset_evidence(slide)

    print("Building Screenshots and Visual Evidence (7 items)...")
    build_screenshots_section(slide)

    print("Building Findings, Metrics & Baseline Comparison (7 KPI cards & UAT)...")
    build_metrics_section(slide)

    print("Building Bottom Section (Implications, Conclusion, Roadmap, References, Features, Scope & Ethics)...")
    build_bottom_section(slide)

    output_filename = "Clariq_A1_Portrait_Poster.pptx"
    prs.save(output_filename)
    print(f"A1 Portrait Poster successfully saved to: {output_filename}")

if __name__ == "__main__":
    main()
