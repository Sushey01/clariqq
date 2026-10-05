"""
generate_poster.py
Generates an A4 Portrait Poster in PowerPoint (.pptx) based on the Clariq FYP Final Project Dissertation,
strictly matching the design, structure, and visual layout of the reference academic poster.
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

# A4 Dimensions in Inches
A4_WIDTH = Inches(8.267)   # 210 mm
A4_HEIGHT = Inches(11.692) # 297 mm

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
    prs.slide_width = A4_WIDTH
    prs.slide_height = A4_HEIGHT
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    return prs, slide

def add_rect(slide, left, top, width, height, bg_color=C_CARD_BG, border_color=C_CARD_BORDER, border_width=1.0):
    """Draws a rectangular container box."""
    rect = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    rect.fill.solid()
    rect.fill.fore_color.rgb = bg_color
    if border_color:
        rect.line.color.rgb = border_color
        rect.line.width = Pt(border_width)
    else:
        rect.line.fill.background()
    return rect

def add_section_title(slide, left, top, width, title_text, font_size=10):
    """Creates a bold section title matching the reference poster."""
    tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(0.25))
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
    """Builds the top dark header banner with logos, title, subtitle, and credentials."""
    # Top Dark Green/Teal Banner
    banner = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, A4_WIDTH, Inches(0.85))
    banner.fill.solid()
    banner.fill.fore_color.rgb = C_HEADER_DARK
    banner.line.color.rgb = C_HEADER_DARK

    # Left Logo Icon if present
    logo_path = "logo.png"
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Inches(0.25), Inches(0.12), height=Inches(0.6))
    
    # Title & Subtitle Text Box
    tb_title = slide.shapes.add_textbox(Inches(1.85), Inches(0.08), Inches(4.2), Inches(0.7))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
    
    p1 = tf_t.paragraphs[0]
    p1.text = "Clariq"
    p1.font.size = Pt(22)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.font.name = 'Arial'

    p2 = tf_t.add_paragraph()
    p2.text = "AI-Powered Socratic Science Tutor for SEE Students"
    p2.font.size = Pt(9.5)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(186, 230, 253)
    p2.font.name = 'Arial'
    p2.space_before = Pt(1)

    # Right Institutional Logos / Badges
    tb_inst = slide.shapes.add_textbox(Inches(6.15), Inches(0.08), Inches(1.85), Inches(0.7))
    tf_i = tb_inst.text_frame
    tf_i.word_wrap = True
    tf_i.margin_left = tf_i.margin_top = tf_i.margin_right = tf_i.margin_bottom = 0
    
    p_i1 = tf_i.paragraphs[0]
    p_i1.alignment = PP_ALIGN.RIGHT
    p_i1.text = "SUNWAY COLLEGE"
    p_i1.font.size = Pt(8.5)
    p_i1.font.bold = True
    p_i1.font.color.rgb = C_WHITE
    p_i1.font.name = 'Arial'

    p_i2 = tf_i.add_paragraph()
    p_i2.alignment = PP_ALIGN.RIGHT
    p_i2.text = "KATHMANDU"
    p_i2.font.size = Pt(7)
    p_i2.font.color.rgb = C_GOLD_TEXT
    p_i2.font.name = 'Arial'

    p_i3 = tf_i.add_paragraph()
    p_i3.alignment = PP_ALIGN.RIGHT
    p_i3.text = "BIRMINGHAM CITY\nUniversity"
    p_i3.font.size = Pt(8)
    p_i3.font.bold = True
    p_i3.font.color.rgb = C_WHITE
    p_i3.font.name = 'Arial'
    p_i3.space_before = Pt(2)

    # Sub-header Strip (Student Info & Standout Contribution)
    # Left: Author credentials
    tb_auth = slide.shapes.add_textbox(Inches(0.25), Inches(0.92), Inches(4.55), Inches(0.42))
    tf_a = tb_auth.text_frame
    tf_a.word_wrap = True
    tf_a.margin_left = tf_a.margin_top = tf_a.margin_right = tf_a.margin_bottom = 0
    
    p_a1 = tf_a.paragraphs[0]
    p_a1.text = "Shekhar Lamichhane Magar | 23189647 | CMP6200 Individual Honours Project | Supervisor: Rupak Koirala"
    p_a1.font.size = Pt(7.8)
    p_a1.font.bold = True
    p_a1.font.color.rgb = C_DARK_TEXT
    p_a1.font.name = 'Arial'

    # Right: Standout contribution box
    tb_sc = slide.shapes.add_textbox(Inches(4.9), Inches(0.88), Inches(3.1), Inches(0.48))
    tf_sc = tb_sc.text_frame
    tf_sc.word_wrap = True
    tf_sc.margin_left = tf_sc.margin_top = tf_sc.margin_right = tf_sc.margin_bottom = 0
    
    p_sc1 = tf_sc.paragraphs[0]
    p_sc1.text = "Standout contribution"
    p_sc1.font.size = Pt(8)
    p_sc1.font.bold = True
    p_sc1.font.color.rgb = C_DARK_TEXT
    p_sc1.font.name = 'Arial'

    p_sc2 = tf_sc.add_paragraph()
    p_sc2.text = "Curriculum-grounded Socratic AI tutor with strict turn gating (0% answer leaks), 135-node adaptive knowledge graph, real-time confusion telemetry, and web/mobile apps."
    p_sc2.font.size = Pt(6.2)
    p_sc2.font.color.rgb = C_BODY_TEXT
    p_sc2.font.name = 'Arial'
    p_sc2.space_before = Pt(1)

def build_upper_left(slide):
    """Builds Problem, Gap, and Aim/Objectives in the left column."""
    # Column Left: x=0.25", width=2.85"
    
    # 1. Problem Box
    add_section_title(slide, 0.25, 1.42, 2.85, "Problem", font_size=9.5)
    tb_prob = slide.shapes.add_textbox(Inches(0.25), Inches(1.60), Inches(2.85), Inches(0.68))
    tf_p = tb_prob.text_frame
    tf_p.word_wrap = True
    tf_p.margin_left = tf_p.margin_top = tf_p.margin_right = tf_p.margin_bottom = 0
    
    probs = [
        "In the 2080-81 SEE, 79,271 students (15.42%) were marked Non-Graded in Science & Technology (MoEST, 2024).",
        "Commercial AI chatbots dump direct answers (88% leakage), bypassing student reasoning and inducing cognitive atrophy (Bastani et al., 2025).",
        "Private coaching is unaffordable for rural families ($15–$40/mo); public schools face 50+:1 pupil-teacher ratios."
    ]
    for idx, txt in enumerate(probs):
        p = tf_p.paragraphs[0] if idx == 0 else tf_p.add_paragraph()
        p.text = f"• {txt}"
        p.font.size = Pt(6.0)
        p.font.color.rgb = C_BODY_TEXT
        p.font.name = 'Arial'
        p.space_after = Pt(2)

    # 2. Gap Box
    add_section_title(slide, 0.25, 2.34, 2.85, "Gap", font_size=9.5)
    tb_gap = slide.shapes.add_textbox(Inches(0.25), Inches(2.50), Inches(2.85), Inches(0.42))
    tf_g = tb_gap.text_frame
    tf_g.word_wrap = True
    tf_g.margin_left = tf_g.margin_top = tf_g.margin_right = tf_g.margin_bottom = 0
    
    p_g = tf_g.paragraphs[0]
    p_g.text = "Existing educational AI tools either act as didactic answer dispensers without syllabus grounding, or rely on rigid rule-based ITS without conversational fluidity. Few provide open-weight Socratic turn policies combined with dynamic concept mastery tracking for South Asian national secondary curricula."
    p_g.font.size = Pt(6.0)
    p_g.font.color.rgb = C_BODY_TEXT
    p_g.font.name = 'Arial'

    # 3. Aim and objectives
    add_section_title(slide, 0.25, 2.98, 2.85, "Aim and objectives", font_size=9.5)
    tb_aim = slide.shapes.add_textbox(Inches(0.25), Inches(3.14), Inches(2.85), Inches(1.35))
    tf_aim = tb_aim.text_frame
    tf_aim.word_wrap = True
    tf_aim.margin_left = tf_aim.margin_top = tf_aim.margin_right = tf_aim.margin_bottom = 0
    
    p_aim = tf_aim.paragraphs[0]
    p_aim.text = "To develop an AI-powered Socratic science tutor that delivers curriculum-grounded dialogue, prevents direct answer leakage, tracks individual concept mastery across an adaptive 135-node Knowledge Graph, and surfaces diagnostic insights for educators."
    p_aim.font.size = Pt(6.0)
    p_aim.font.bold = False
    p_aim.font.color.rgb = C_BODY_TEXT
    p_aim.font.name = 'Arial'
    p_aim.space_after = Pt(2)

    objs = [
        "1. Ingest official CDC Class 10 science textbooks into Chroma vector DB",
        "2. Implement hybrid RAG with lexical candidate reranking (P@3 >= 0.85)",
        "3. Enforce 5-stage turn policy (turn_policy.py) to suppress answer leakage",
        "4. Fine-tune open-weight Socratic dialogue model on dual T4 GPUs",
        "5. Eliminate script collapse via weight merging (Qwen2.5-7B Merged SFT)",
        "6. Construct 135-node directed knowledge graph across Physics, Chem, Bio",
        "7. Formulate token-overlap scoring with coherence & copy penalties",
        "8. Implement Exponential Moving Average (EWMA) mastery updating",
        "9. Build automated 3-turn persistent confusion diagnostic alerts",
        "10. Develop responsive React 18 / Vite Nebular UI tutoring bench",
        "11. Build Teacher Diagnostic Supervision Desk for class-wide weak topics",
        "12. Develop cross-platform Expo React Native mobile application",
        "13. Conduct controlled empirical pilot study (N=20) against textbook study"
    ]
    for obj_txt in objs:
        p_o = tf_aim.add_paragraph()
        p_o.text = obj_txt
        p_o.font.size = Pt(5.5)
        p_o.font.color.rgb = C_BODY_TEXT
        p_o.font.name = 'Arial'
        p_o.space_after = Pt(1)

def build_upper_right(slide):
    """Builds Method (6-box grid) and Architecture/Workflow in the right column."""
    # Column Right: x=3.25", width=4.75"
    
    # Section Title: Method
    add_section_title(slide, 3.25, 1.42, 4.75, "Method", font_size=9.5)

    # 6-box Method Grid (3 columns x 2 rows)
    # Each box: width=1.52", height=0.58", gap=0.09"
    methods = [
        ("1  Research approach", "Design Science Research: design, build, test, and evaluate the artifact."),
        ("2  Ingestion & RAG", "17 CDC digital text volumes, OCR filter, regex boilerplate cleaning, 768d vectors."),
        ("3  Socratic turn policy", "turn_policy.py: intent routing, terminal '?' gating, answer-dump interception."),
        ("4  Tutor LLM fine-tuning", "Qwen2.5-7B SFT LoRA on 606 dialogues (4,628 turns); merged weights on RunPod vLLM."),
        ("5  Knowledge Graph", "135 concept nodes, 99 prerequisite edges, EWMA tracking (α=0.25), confusion alerts."),
        ("6  Client Ecosystem", "React 18 Nebular UI desktop bench, Teacher Diagnostic Desk, Expo mobile app.")
    ]

    for idx, (m_title, m_desc) in enumerate(methods):
        col = idx % 3
        row = idx // 3
        bx = 3.25 + col * (1.53 + 0.08)
        by = 1.60 + row * (0.52 + 0.06)
        
        # Outer card
        add_rect(slide, bx, by, 1.53, 0.52, bg_color=C_ALT_BG, border_color=C_CARD_BORDER)
        
        tb = slide.shapes.add_textbox(Inches(bx + 0.04), Inches(by + 0.03), Inches(1.45), Inches(0.46))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p1 = tf.paragraphs[0]
        p1.text = m_title
        p1.font.size = Pt(6.8)
        p1.font.bold = True
        p1.font.color.rgb = C_DARK_TEXT
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.text = m_desc
        p2.font.size = Pt(5.5)
        p2.font.color.rgb = C_BODY_TEXT
        p2.font.name = 'Arial'
        p2.space_before = Pt(1)

    # Section Title: Architecture and Workflow
    add_section_title(slide, 3.25, 2.78, 4.75, "Clariq Architecture and Workflow", font_size=9.5)

    # Architecture Diagram Image
    arch_img = "report_figures/fig_system_architecture.png"
    if os.path.exists(arch_img):
        # width 4.75", top 2.98"
        slide.shapes.add_picture(arch_img, Inches(3.25), Inches(2.98), width=Inches(4.75))

def build_dataset_evidence(slide):
    """Builds the DATASET & CURRICULUM EVIDENCE box."""
    # Top y = 4.50", width = 7.76", height = 0.78"
    add_rect(slide, 0.25, 4.50, 7.76, 0.78, bg_color=C_CARD_BG, border_color=C_CARD_BORDER)
    
    # Header inside container
    tb_h = slide.shapes.add_textbox(Inches(0.35), Inches(4.53), Inches(7.55), Inches(0.18))
    tf_h = tb_h.text_frame
    p_h = tf_h.paragraphs[0]
    p_h.text = "DATASET & CURRICULUM EVIDENCE"
    p_h.font.size = Pt(8.0)
    p_h.font.bold = True
    p_h.font.color.rgb = C_DARK_TEXT
    p_h.font.name = 'Arial'

    # Left Column: Curriculum Classes (135)
    tb_c1 = slide.shapes.add_textbox(Inches(0.35), Inches(4.72), Inches(4.7), Inches(0.52))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    tf_c1.margin_left = tf_c1.margin_top = tf_c1.margin_right = tf_c1.margin_bottom = 0
    
    p1 = tf_c1.paragraphs[0]
    p1.text = "SEE Science Curriculum Concept Nodes (135 Nodes Across 3 Branches)"
    p1.font.size = Pt(6.8)
    p1.font.bold = True
    p1.font.color.rgb = C_DARK_TEXT
    p1.font.name = 'Arial'

    p2 = tf_c1.add_paragraph()
    p2.text = "Physics (45): Force, Gravity, Pressure, Energy, Heat, Light, Current Electricity, Magnetism\nChemistry (50): Periodic Table, Chemical Reactions, Acid-Base-Salt, Metals, Hydrocarbons\nBiology (40): Cell Reproduction, Heredity, Nervous System, Blood Circulation, Ecosystems"
    p2.font.size = Pt(5.6)
    p2.font.color.rgb = C_BODY_TEXT
    p2.font.name = 'Arial'
    p2.space_before = Pt(1)

    # Right Column: Socratic Dialogue Dataset
    tb_c2 = slide.shapes.add_textbox(Inches(5.15), Inches(4.72), Inches(2.75), Inches(0.52))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    tf_c2.margin_left = tf_c2.margin_top = tf_c2.margin_right = tf_c2.margin_bottom = 0

    p3 = tf_c2.paragraphs[0]
    p3.text = "Socratic Dialogue Dataset (606 Dialogues, 4,628 Turns)"
    p3.font.size = Pt(6.8)
    p3.font.bold = True
    p3.font.color.rgb = C_DARK_TEXT
    p3.font.name = 'Arial'

    p4 = tf_c2.add_paragraph()
    p4.text = "Dataset Preparation: 17 CDC textbooks cleaned with boilerplate stripping, 1200-char chunking with 200-char overlap, nomic-embed-text (768d) indexing."
    p4.font.size = Pt(5.6)
    p4.font.color.rgb = C_BODY_TEXT
    p4.font.name = 'Arial'
    p4.space_before = Pt(1)

def build_screenshots_section(slide):
    """Builds the 7-screenshot visual evidence row."""
    # Section Title: Screenshots and Visual Evidence
    add_section_title(slide, 0.25, 5.35, 7.76, "Screenshots and Visual Evidence", font_size=9.5)

    # 7 Screenshots Side-by-Side
    # Each slot: width = 1.03", gap = 0.09"
    # Total = 7 * 1.03 + 6 * 0.09 = 7.21 + 0.54 = 7.75"
    slots = [
        ("Navigation &\nLanding Portal", "report_figures/fig_ui_landing.png"),
        ("Authentication &\nOnboarding", "report_figures/fig_ui_login.png"),
        ("Socratic Tutoring\nBench", "report_figures/fig_ui_chat_desktop.png"),
        ("Scaffolding\nDialogue", "report_figures/fig_socratic_exchange.png"),
        ("Teacher Desk\nAnalytics", "report_figures/fig_ui_teacher_desk.png"),
        ("Mastery Telemetry\nProgress", "report_figures/fig_student_progress.png"),
        ("Expo Mobile\nClient", "report_figures/fig_ui_mobile_app.png")
    ]

    for idx, (title, img_path) in enumerate(slots):
        x = 0.25 + idx * (1.03 + 0.09)
        y = 5.55
        
        # Container Box
        add_rect(slide, x, y, 1.03, 1.40, bg_color=C_CARD_BG, border_color=C_CARD_BORDER)
        
        # Title Box on top
        tb_t = slide.shapes.add_textbox(Inches(x + 0.02), Inches(y + 0.02), Inches(0.99), Inches(0.28))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.alignment = PP_ALIGN.CENTER
        p_t.text = title
        p_t.font.size = Pt(5.5)
        p_t.font.bold = True
        p_t.font.color.rgb = C_DARK_TEXT
        p_t.font.name = 'Arial'

        # Image
        if os.path.exists(img_path):
            # Height ~0.95"
            slide.shapes.add_picture(img_path, Inches(x + 0.04), Inches(y + 0.32), width=Inches(0.95))

def build_metrics_section(slide):
    """Builds Findings and Metrics (7 KPI boxes) and Pilot Study Callout."""
    # Section Title: Findings and Metrics
    add_section_title(slide, 0.25, 7.02, 7.76, "Findings and Metrics", font_size=9.5)

    # 7 KPI Metric Boxes (width = 1.03", gap = 0.09", height = 0.65")
    kpis = [
        ("0.873", "Curriculum RAG\nPrecision@3", C_GREEN_STAT),
        ("0%", "Direct Answer\nDumps (vs 88% 4o)", C_GREEN_STAT),
        ("100%", "Guiding Inquiries\n('?') Post-Policy", C_NAVY_PRIMARY),
        ("0", "Script Collapse\nFlags (vs 14 in 4B)", C_GREEN_STAT),
        ("3.31 s", "Median Warm\nLatency (ZeroGPU)", C_NAVY_PRIMARY),
        ("+2.80", "Pilot Learning\nGain (vs +1.20)", C_GREEN_STAT),
        ("88.8/100", "System Usability\nScale (Excellent)", C_NAVY_PRIMARY)
    ]

    for idx, (num_str, label_str, col) in enumerate(kpis):
        x = 0.25 + idx * (1.03 + 0.09)
        y = 7.22
        
        # Outer card
        add_rect(slide, x, y, 1.03, 0.62, bg_color=C_WHITE, border_color=C_CARD_BORDER)
        
        tb = slide.shapes.add_textbox(Inches(x + 0.02), Inches(y + 0.04), Inches(0.99), Inches(0.54))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p1 = tf.paragraphs[0]
        p1.alignment = PP_ALIGN.CENTER
        p1.text = num_str
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.CENTER
        p2.text = label_str
        p2.font.size = Pt(5.2)
        p2.font.bold = True
        p2.font.color.rgb = C_DARK_TEXT
        p2.font.name = 'Arial'
        p2.space_before = Pt(1)

    # Pilot Study (UAT) Callout Banner
    # Top y = 7.92", width = 7.76", height = 0.44"
    add_rect(slide, 0.25, 7.92, 7.76, 0.44, bg_color=C_ALT_BG, border_color=C_CARD_BORDER)
    
    # UAT Badge
    add_rect(slide, 0.35, 7.98, 0.55, 0.32, bg_color=C_HEADER_DARK, border_color=C_HEADER_DARK)
    tb_ub = slide.shapes.add_textbox(Inches(0.35), Inches(8.04), Inches(0.55), Inches(0.2))
    tf_ub = tb_ub.text_frame
    p_ub = tf_ub.paragraphs[0]
    p_ub.alignment = PP_ALIGN.CENTER
    p_ub.text = "UAT"
    p_ub.font.size = Pt(8.5)
    p_ub.font.bold = True
    p_ub.font.color.rgb = C_WHITE
    p_ub.font.name = 'Arial'

    # Text next to UAT
    tb_ut = slide.shapes.add_textbox(Inches(0.98), Inches(7.96), Inches(6.9), Inches(0.36))
    tf_ut = tb_ut.text_frame
    tf_ut.word_wrap = True
    tf_ut.margin_left = tf_ut.margin_top = tf_ut.margin_right = tf_ut.margin_bottom = 0
    p_ut = tf_ut.paragraphs[0]
    p_ut.text = "20 Class 10 SEE secondary students tested Clariq Socratic AI Tutor vs. CDC Textbook Self-Study on Acids, Bases, and Salts; achieved +2.80 vs +1.20 learning gain (p < 0.0001), 34.8% reduction in active study time, and 88.8 SUS usability."
    p_ut.font.size = Pt(6.5)
    p_ut.font.color.rgb = C_BODY_TEXT
    p_ut.font.name = 'Arial'

def build_bottom_section(slide):
    """Builds Conclusion/Next Steps, References, Pedagogical Features, and Scope & Ethics."""
    # Left Column: x=0.25", width=4.3"
    # Right Column: x=4.75", width=3.26"
    
    # Left 1: Conclusion and Next Steps
    add_section_title(slide, 0.25, 8.44, 4.3, "Conclusion and Next Steps", font_size=9.5)
    tb_concl = slide.shapes.add_textbox(Inches(0.25), Inches(8.64), Inches(4.3), Inches(1.3))
    tf_c = tb_concl.text_frame
    tf_c.word_wrap = True
    tf_c.margin_left = tf_c.margin_top = tf_c.margin_right = tf_c.margin_bottom = 0
    
    p_c1 = tf_c.paragraphs[0]
    p_c1.text = "Using curriculum-grounded RAG, strict Socratic turn gating, and an adaptive 135-node Knowledge Graph, Clariq successfully achieved its pedagogical and technical objectives."
    p_c1.font.size = Pt(6.2)
    p_c1.font.color.rgb = C_BODY_TEXT
    p_c1.font.name = 'Arial'
    p_c1.space_after = Pt(2)

    p_c2 = tf_c.add_paragraph()
    r1 = p_c2.add_run()
    r1.text = "Main contribution: "
    r1.font.bold = True
    r1.font.size = Pt(6.2)
    r1.font.color.rgb = C_DARK_TEXT
    r2 = p_c2.add_run()
    r2.text = "An open-weight, curriculum-grounded Socratic tutoring workflow that prevents cognitive surrender (0% answer dumps), tracks concept mastery via EWMA telemetry, and operates across web and mobile."
    r2.font.size = Pt(6.2)
    r2.font.color.rgb = C_BODY_TEXT
    p_c2.space_after = Pt(2)

    p_c3 = tf_c.add_paragraph()
    r3 = p_c3.add_run()
    r3.text = "Next step: "
    r3.font.bold = True
    r3.font.size = Pt(6.2)
    r3.font.color.rgb = C_DARK_TEXT
    r4 = p_c3.add_run()
    r4.text = "Conduct multi-school longitudinal trials, implement recursive multi-turn memory, and deploy quantized GGUF models on offline tablets for off-grid rural community classrooms."
    r4.font.size = Pt(6.2)
    r4.font.color.rgb = C_BODY_TEXT

    # Left 2: References
    add_section_title(slide, 0.25, 10.05, 4.3, "References", font_size=9.5)
    tb_ref = slide.shapes.add_textbox(Inches(0.25), Inches(10.25), Inches(4.3), Inches(1.3))
    tf_r = tb_ref.text_frame
    tf_r.word_wrap = True
    tf_r.margin_left = tf_r.margin_top = tf_r.margin_right = tf_r.margin_bottom = 0
    
    refs = [
        "Bastani, H. et al. (2025) 'Generative AI can harm learning: Evidence from high school classrooms'.",
        "Bloom, B. S. (1984) 'The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring', Educational Researcher.",
        "Curriculum Development Centre (CDC Nepal, 2024) Class 10 Science and Technology Textbook, Sanothimi, Bhaktapur.",
        "Lewis, P. et al. (2020) 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', NeurIPS 2020.",
        "Ministry of Education, Science and Technology (MoEST, 2024) Secondary Education Examination (SEE) Results 2080-81, Nepal."
    ]
    for idx, ref_txt in enumerate(refs):
        p = tf_r.paragraphs[0] if idx == 0 else tf_r.add_paragraph()
        p.text = f"• {ref_txt}"
        p.font.size = Pt(5.5)
        p.font.color.rgb = C_MUTED_TEXT
        p.font.name = 'Arial'
        p.space_after = Pt(1.5)

    # Right 1: Pedagogical & Accessibility Features
    add_section_title(slide, 4.75, 8.44, 3.26, "Pedagogical & Accessibility features", font_size=9.5)
    tb_ped = slide.shapes.add_textbox(Inches(4.75), Inches(8.64), Inches(3.26), Inches(1.3))
    tf_ped = tb_ped.text_frame
    tf_ped.word_wrap = True
    tf_ped.margin_left = tf_ped.margin_top = tf_ped.margin_right = tf_ped.margin_bottom = 0
    
    p_p1 = tf_ped.paragraphs[0]
    p_p1.text = "Socratic turn gating, cognitive prompt chips ('Give me a hint', 'Is my reasoning right?'), teacher struggle alerts, and low-bandwidth payload optimization support diverse learners."
    p_p1.font.size = Pt(6.2)
    p_p1.font.color.rgb = C_BODY_TEXT
    p_p1.font.name = 'Arial'
    p_p1.space_after = Pt(2)

    p_p2 = tf_ped.add_paragraph()
    p_p2.text = "Offline curriculum embedding, lightweight responses (<500 bytes), and responsive client designs make continuous learning practical in low-connectivity rural environments."
    p_p2.font.size = Pt(6.2)
    p_p2.font.color.rgb = C_BODY_TEXT
    p_p2.font.name = 'Arial'

    # Right 2: Scope and Ethics
    add_section_title(slide, 4.75, 10.05, 3.26, "Scope and ethics", font_size=9.5)
    tb_eth = slide.shapes.add_textbox(Inches(4.75), Inches(10.25), Inches(3.26), Inches(1.3))
    tf_eth = tb_eth.text_frame
    tf_eth.word_wrap = True
    tf_eth.margin_left = tf_eth.margin_top = tf_eth.margin_right = tf_eth.margin_bottom = 0
    
    p_e1 = tf_eth.paragraphs[0]
    p_e1.text = "Specialist hardware, speech recognition, and non-English scripts not included in scope."
    p_e1.font.size = Pt(6.2)
    p_e1.font.color.rgb = C_BODY_TEXT
    p_e1.font.name = 'Arial'
    p_e1.space_after = Pt(2)

    p_e2 = tf_eth.add_paragraph()
    r_et = p_e2.add_run()
    r_et.text = "Ethics: "
    r_et.font.bold = True
    r_et.font.size = Pt(6.2)
    r_et.font.color.rgb = C_DARK_TEXT
    r_eb = p_e2.add_run()
    r_eb.text = "Voluntary minor assent, parental consent, full pseudonymisation (P01–P20), no personal identifiable data (PII) stored, and copyright fair dealing under Nepal Copyright Act 2059 & UK CDPA 1988."
    r_eb.font.size = Pt(6.2)
    r_eb.font.color.rgb = C_BODY_TEXT

def main():
    print("Initializing A4 Portrait Poster Canvas (210 x 297 mm)...")
    prs, slide = create_poster()

    print("Building Header & Banner...")
    build_header(slide)

    print("Building Upper Left (Problem, Gap, Aim & Objectives)...")
    build_upper_left(slide)

    print("Building Upper Right (Method Grid & Architecture/Workflow)...")
    build_upper_right(slide)

    print("Building Dataset & Curriculum Evidence...")
    build_dataset_evidence(slide)

    print("Building Screenshots and Visual Evidence (7 items)...")
    build_screenshots_section(slide)

    print("Building Findings and Metrics (7 KPI boxes & UAT)...")
    build_metrics_section(slide)

    print("Building Bottom Section (Conclusion, References, Pedagogical Features, Scope & Ethics)...")
    build_bottom_section(slide)

    output_filename = "Clariq_A4_Portrait_Poster.pptx"
    prs.save(output_filename)
    print(f"Poster successfully saved to: {output_filename}")

if __name__ == "__main__":
    main()
