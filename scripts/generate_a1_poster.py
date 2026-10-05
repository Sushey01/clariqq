"""
generate_a1_poster.py
Generates the Definitive "Best of Both Worlds" ISO A1 Portrait Academic Conference Poster in PowerPoint (.pptx).
Dimensions: ISO A1 Portrait (594 mm x 841 mm = 23.386 in x 33.110 in)

The "Best of Both Worlds" Architecture:
  1. HUGE Architecture Diagram (11.50" x 7.85", aspect ratio 1.465) in the Upper Right Column, providing maximum visual prominence.
  2. United Curriculum & Dataset Provenance in the Upper Left Column (135 Concept Nodes + 17 CDC Books + 606 Dialogues + Tech Stack).
  3. Perfect Horizontal Alignment: Left Column and Right Column end at the exact same horizontal baseline (y = 14.25").
  4. Generous Benchmark & Model Evaluation Band (Chart on left, spacious 12" Comparative Findings table on right).
  5. 7 KPI Metric Cards + Plain-English UAT Pilot Trial Banner (zero scary math formulas).
  6. Bottom 2-Column Section with two-tier rural village / low-bandwidth defense explicitly embedded.
  7. ZERO overlapping, ZERO text cramping, readable from 1-2 meters away.

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

# Color Palette
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

def add_section_title(slide, left, top, width, title_text, font_size=20):
    """Creates a bold section title readable from 1-2 meters away."""
    tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(0.40))
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
    # Top Dark Green/Teal Banner (Height = 2.25", ends at y=2.25")
    banner = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, A1_WIDTH, Inches(2.25))
    banner.fill.solid()
    banner.fill.fore_color.rgb = C_HEADER_DARK
    banner.line.color.rgb = C_HEADER_DARK

    # Left Logo Icon
    logo_path = "logo.png"
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Inches(0.80), Inches(0.28), height=Inches(1.65))

    # Title & Subtitle Box
    tb_title = slide.shapes.add_textbox(Inches(5.00), Inches(0.18), Inches(12.6), Inches(1.90))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
    
    p1 = tf_t.paragraphs[0]
    p1.text = "Clariq"
    p1.font.size = Pt(54)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.font.name = 'Arial'

    p2 = tf_t.add_paragraph()
    p2.text = "AI-Powered Socratic Science Tutor with Adaptive Knowledge Tracking"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(186, 230, 253)
    p2.font.name = 'Arial'
    p2.space_before = Pt(2)

    p3 = tf_t.add_paragraph()
    p3.text = "For Nepal's Secondary Education Examination (SEE, Class 10 Science)  •  Physics, Chemistry & Biology"
    p3.font.size = Pt(13.5)
    p3.font.color.rgb = RGBColor(224, 242, 254)
    p3.font.name = 'Arial'
    p3.space_before = Pt(2)

    # Right Institutional Crests & Names
    tb_inst = slide.shapes.add_textbox(Inches(17.8), Inches(0.22), Inches(4.78), Inches(1.85))
    tf_i = tb_inst.text_frame
    tf_i.word_wrap = True
    tf_i.margin_left = tf_i.margin_top = tf_i.margin_right = tf_i.margin_bottom = 0
    
    p_i1 = tf_i.paragraphs[0]
    p_i1.alignment = PP_ALIGN.RIGHT
    p_i1.text = "SUNWAY COLLEGE"
    p_i1.font.size = Pt(18)
    p_i1.font.bold = True
    p_i1.font.color.rgb = C_WHITE
    p_i1.font.name = 'Arial'

    p_i2 = tf_i.add_paragraph()
    p_i2.alignment = PP_ALIGN.RIGHT
    p_i2.text = "KATHMANDU, NEPAL"
    p_i2.font.size = Pt(13.5)
    p_i2.font.bold = True
    p_i2.font.color.rgb = C_GOLD_TEXT
    p_i2.font.name = 'Arial'

    p_i3 = tf_i.add_paragraph()
    p_i3.alignment = PP_ALIGN.RIGHT
    p_i3.text = "BIRMINGHAM CITY\nUniversity"
    p_i3.font.size = Pt(16)
    p_i3.font.bold = True
    p_i3.font.color.rgb = C_WHITE
    p_i3.font.name = 'Arial'
    p_i3.space_before = Pt(4)

    # Sub-header Strip (y = 2.38", height = 1.00", ends at y = 3.38")
    # Left: Author credentials
    tb_auth = slide.shapes.add_textbox(Inches(0.80), Inches(2.44), Inches(12.6), Inches(0.90))
    tf_a = tb_auth.text_frame
    tf_a.word_wrap = True
    tf_a.margin_left = tf_a.margin_top = tf_a.margin_right = tf_a.margin_bottom = 0
    
    p_a1 = tf_a.paragraphs[0]
    p_a1.text = "Shekhar Lamichhane Magar | Student ID: 23189647 | CMP6200 Individual Honours Project"
    p_a1.font.size = Pt(17)
    p_a1.font.bold = True
    p_a1.font.color.rgb = C_DARK_TEXT
    p_a1.font.name = 'Arial'

    p_a2 = tf_a.add_paragraph()
    p_a2.text = "Project Supervisor: Rupak Koirala  •  Department of Computer and Data Science  •  October 2026"
    p_a2.font.size = Pt(13.5)
    p_a2.font.color.rgb = C_BODY_TEXT
    p_a2.font.name = 'Arial'
    p_a2.space_before = Pt(2)

    # Right: Standout Novelty & Contribution Box
    add_rect(slide, 13.60, 2.38, 8.98, 1.00, bg_color=C_ALT_BG, border_color=C_CARD_BORDER)
    tb_sc = slide.shapes.add_textbox(Inches(13.75), Inches(2.44), Inches(8.68), Inches(0.90))
    tf_sc = tb_sc.text_frame
    tf_sc.word_wrap = True
    tf_sc.margin_left = tf_sc.margin_top = tf_sc.margin_right = tf_sc.margin_bottom = 0
    
    p_sc1 = tf_sc.paragraphs[0]
    p_sc1.text = "Standout Novelty & Core Contribution"
    p_sc1.font.size = Pt(15.5)
    p_sc1.font.bold = True
    p_sc1.font.color.rgb = C_DARK_TEXT
    p_sc1.font.name = 'Arial'

    p_sc2 = tf_sc.add_paragraph()
    p_sc2.text = "First curriculum-grounded Socratic tutor for Nepal's Class 10 SEE with strict turn gating (0% answer leaks vs 88% GPT-4o), 135-node adaptive knowledge graph, real-time confusion telemetry, and responsive web/mobile clients."
    p_sc2.font.size = Pt(11)
    p_sc2.font.color.rgb = C_BODY_TEXT
    p_sc2.font.name = 'Arial'
    p_sc2.space_before = Pt(2)

def build_upper_left(slide):
    """
    Builds Left Column (width = 8.10"):
      1. Problem & Background Context (y = 3.52", h = 2.30", ends 5.82")
      2. Identified Research Gap (y = 5.95", h = 1.25", ends 7.20")
      3. Aim, Objectives & Research Questions (y = 7.32", h = 3.25", ends 10.57")
      4. United Curriculum Knowledge Base, Dataset & Tech Stack (y = 10.70", h = 3.55", ends 14.25")
    Aligned at y = 14.25" with the bottom of the Big Architecture Diagram on the right!
    """
    # 1. Problem & Background Context (y = 3.52", h = 2.30", ends at 5.82")
    add_rect(slide, 0.80, 3.52, 8.10, 2.30, bg_color=C_WHITE, border_color=C_CARD_BORDER)
    tb_p_title = slide.shapes.add_textbox(Inches(0.95), Inches(3.58), Inches(7.80), Inches(0.32))
    tb_p_title.text_frame.paragraphs[0].text = "Problem & Background Context"
    tb_p_title.text_frame.paragraphs[0].font.size = Pt(16)
    tb_p_title.text_frame.paragraphs[0].font.bold = True
    tb_p_title.text_frame.paragraphs[0].font.color.rgb = C_DARK_TEXT

    tb_prob = slide.shapes.add_textbox(Inches(0.95), Inches(3.96), Inches(7.80), Inches(1.80))
    tf_p = tb_prob.text_frame
    tf_p.word_wrap = True
    tf_p.margin_left = tf_p.margin_top = tf_p.margin_right = tf_p.margin_bottom = 0
    
    probs = [
        ("National Failure Crisis", "In 2080-81 SEE, 79,271 students (15.42%) were marked Non-Graded (NG) in Science & Technology—the highest deficit subject in Nepal (MoEST, 2024)."),
        ("The AI 'Cognitive Crutch' Hazard", "Commercial chatbots (GPT-4o) act as unearned answer dispensers (88% answer dumps), short-circuiting metacognition and inducing cognitive atrophy (Bastani et al., 2025)."),
        ("Socio-Economic & Rural Divide", "Private tutoring costs NPR 2,000–5,000/mo ($15–$40), unaffordable for rural families. Rural schools face 50+:1 pupil-teacher ratios and limited internet infrastructure.")
    ]
    for idx, (lead, body) in enumerate(probs):
        p = tf_p.paragraphs[0] if idx == 0 else tf_p.add_paragraph()
        r1 = p.add_run()
        r1.text = f"•  {lead}: "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = C_NAVY_PRIMARY
        r1.font.name = 'Arial'
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = C_BODY_TEXT
        r2.font.name = 'Arial'
        p.space_after = Pt(2)

    # 2. Identified Research Gap (y = 5.95", h = 1.25", ends at 7.20")
    add_rect(slide, 0.80, 5.95, 8.10, 1.25, bg_color=C_WHITE, border_color=C_CARD_BORDER)
    tb_g_title = slide.shapes.add_textbox(Inches(0.95), Inches(6.01), Inches(7.80), Inches(0.30))
    tb_g_title.text_frame.paragraphs[0].text = "Identified Research Gap"
    tb_g_title.text_frame.paragraphs[0].font.size = Pt(16)
    tb_g_title.text_frame.paragraphs[0].font.bold = True
    tb_g_title.text_frame.paragraphs[0].font.color.rgb = C_DARK_TEXT

    tb_gap = slide.shapes.add_textbox(Inches(0.95), Inches(6.36), Inches(7.80), Inches(0.80))
    tf_g = tb_gap.text_frame
    tf_g.word_wrap = True
    tf_g.margin_left = tf_g.margin_top = tf_g.margin_right = tf_g.margin_bottom = 0
    p_g = tf_g.paragraphs[0]
    p_g.text = "Existing educational AI tools either act as didactic answer dispensers without national curriculum grounding, or rely on rigid rule-based ITS without conversational fluidity. No prior work provides open-weight Socratic dialogue models governed by deterministic turn gating combined with dynamic concept mastery tracking for South Asian national secondary curricula."
    p_g.font.size = Pt(10.5)
    p_g.font.color.rgb = C_BODY_TEXT
    p_g.font.name = 'Arial'

    # 3. Aim, Objectives & Research Questions (y = 7.32", h = 3.25", ends at 10.57")
    add_rect(slide, 0.80, 7.32, 8.10, 3.25, bg_color=C_WHITE, border_color=C_CARD_BORDER)
    tb_a_title = slide.shapes.add_textbox(Inches(0.95), Inches(7.38), Inches(7.80), Inches(0.30))
    tb_a_title.text_frame.paragraphs[0].text = "Aim, Objectives & Research Questions"
    tb_a_title.text_frame.paragraphs[0].font.size = Pt(16)
    tb_a_title.text_frame.paragraphs[0].font.bold = True
    tb_a_title.text_frame.paragraphs[0].font.color.rgb = C_DARK_TEXT

    tb_aim = slide.shapes.add_textbox(Inches(0.95), Inches(7.74), Inches(7.80), Inches(2.75))
    tf_aim = tb_aim.text_frame
    tf_aim.word_wrap = True
    tf_aim.margin_left = tf_aim.margin_top = tf_aim.margin_right = tf_aim.margin_bottom = 0
    
    p_a = tf_aim.paragraphs[0]
    p_a.text = "Research Aim: To design, implement, and empirically pilot Clariq—an AI-powered Socratic science tutor delivering curriculum-grounded dialogue, dynamically tracking mastery across a 135-node Knowledge Graph, and evaluating its pedagogical feasibility."
    p_a.font.size = Pt(10.5)
    p_a.font.bold = True
    p_a.font.color.rgb = C_DARK_TEXT
    p_a.font.name = 'Arial'
    p_a.space_after = Pt(2)

    p_rq = tf_aim.add_paragraph()
    p_rq.text = "• RQ1 (Dialogue Restraint): Can open-weight LLMs, constrained by turn policies and RAG, sustain multi-turn inquiry without leaking direct answers?\n• RQ2 (Mastery Telemetry): Can conversational turns yield reliable concept mastery telemetry across an adaptive knowledge graph to flag struggling students?"
    p_rq.font.size = Pt(10.2)
    p_rq.font.color.rgb = C_NAVY_PRIMARY
    p_rq.font.bold = True
    p_rq.font.name = 'Arial'
    p_rq.space_after = Pt(2)

    objs = [
        "1. Ingest official CDC Class 10 science textbooks into Chroma vector DB",
        "2. Implement hybrid RAG with lexical candidate reranking (P@3 >= 0.85)",
        "3. Enforce 5-stage turn policy (turn_policy.py) to suppress answer leakage",
        "4. Fine-tune open-weight Socratic dialogue model on dual T4 GPUs",
        "5. Eliminate script collapse via weight merging (Qwen2.5-7B Merged SFT)",
        "6. Construct 135-node directed knowledge graph across Physics, Chem, Bio",
        "7. Formulate token-overlap scoring with coherence and rote-copy penalties",
        "8. Implement Exponential Moving Average (EWMA) mastery updating",
        "9. Engineer teacher desk with real-time 3-turn struggle diagnostic flags",
        "10. Conduct controlled empirical pilot user study (N=20) vs. textbook baseline"
    ]
    p_o = tf_aim.add_paragraph()
    p_o.text = "Itemized Research Targets:\n" + "\n".join(objs)
    p_o.font.size = Pt(9.2)
    p_o.font.color.rgb = C_BODY_TEXT
    p_o.font.name = 'Arial'

    # 4. United Curriculum Knowledge Base, Dataset & Tech Stack (y = 10.70", h = 3.55", ends at 14.25")
    # Perfectly unifies data provenance and matches the bottom of the Big Architecture Diagram!
    add_rect(slide, 0.80, 10.70, 8.10, 3.55, bg_color=C_WHITE, border_color=C_CARD_BORDER)
    tb_c_title = slide.shapes.add_textbox(Inches(0.95), Inches(10.78), Inches(7.80), Inches(0.32))
    tb_c_title.text_frame.paragraphs[0].text = "Curriculum Knowledge Base, Dataset & Tech Stack"
    tb_c_title.text_frame.paragraphs[0].font.size = Pt(15.5)
    tb_c_title.text_frame.paragraphs[0].font.bold = True
    tb_c_title.text_frame.paragraphs[0].font.color.rgb = C_DARK_TEXT

    tb_c_body = slide.shapes.add_textbox(Inches(0.95), Inches(11.16), Inches(7.80), Inches(3.00))
    tf_cb = tb_c_body.text_frame
    tf_cb.word_wrap = True
    tf_cb.margin_left = tf_cb.margin_top = tf_cb.margin_right = tf_cb.margin_bottom = 0

    d_points = [
        ("135 Curriculum Concept Nodes", "Physics (45 nodes: Force, Gravity, Pressure, Electricity, Heat); Chemistry (50 nodes: Reactions, Periodic Table, Acid-Base-Salt, Metals); Biology (40 nodes: Cells, Heredity, Circulation, Ecosystems)."),
        ("17 CDC Textbooks (Curriculum RAG)", "Official national curriculum text volumes digitized, cleaned with regex boilerplate stripping (>15% page recurrence), partitioned into 1,200-char chunks (200 overlap), indexed in Chroma DB (768d vectors)."),
        ("Socratic Dialogue Corpus (606 Dialogues)", "4,628 multi-turn interactions spanning 5 pedagogical categories: Direct Conceptual, Misconceptions, Stuck/Confused, Topic Switches, and Ambiguous Probes."),
        ("Experimental Tech Stack", "Qwen2.5-7B Merged SFT, PyTorch, vLLM PagedAttention on RunPod GPU, FastAPI gateway, Chroma DB, React 18, Vite, Tailwind CSS, Expo (React Native).")
    ]
    for idx, (lead, body) in enumerate(d_points):
        p = tf_cb.paragraphs[0] if idx == 0 else tf_cb.add_paragraph()
        r1 = p.add_run()
        r1.text = f"•  {lead}: "
        r1.font.bold = True
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = C_NAVY_PRIMARY
        r1.font.name = 'Arial'
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10)
        r2.font.color.rgb = C_BODY_TEXT
        r2.font.name = 'Arial'
        p.space_after = Pt(2.5)

def build_upper_right(slide):
    """
    Builds Right Column (width = 13.23"):
      1. Research Methodology (6-Box Grid): y = 3.52", h = 2.25", ends at 5.77"
      2. Architecture Title: y = 5.90", h = 0.35"
      3. HUGE Full-Width Architecture Diagram: y = 6.30", h = 7.95", ends at 14.25"
    Aligned at y = 14.25" with the bottom of the Left Column!
    """
    # 1. Methodology Title & 6-Box Grid
    add_section_title(slide, 9.35, 3.52, 13.23, "Research Methodology & Engineering Framework", font_size=20)

    # 6-Box Grid (2 rows x 3 cols)
    # y = 3.90", height = 1.85", ends at 5.75"
    methods = [
        ("1. Design Science Research", "Six DSR iterative stages: problem identification, objective definition, design/dev, demonstration, evaluation, dissemination (Peffers et al., 2007)."),
        ("2. Hybrid Retrieval (RAG)", "Domain-sanitized CDC corpus (17 textbooks) embedded via nomic-embed-text (768d) in Chroma DB with lexical candidate reranking for curriculum grounding."),
        ("3. Turn Policy Gating", "turn_policy.py 5-stage deterministic state machine enforcing Socratic restraint, scaffolding inquiry probes, and suppressing direct factual answer disclosures."),
        ("4. SFT Socratic LLM", "Qwen2.5-7B fine-tuned on 606 curriculum dialogues across 5 pedagogical categories on dual T4 GPUs with merged weights to eliminate script collapse."),
        ("5. Knowledge Graph & EWMA", "135 concept nodes (Physics, Chem, Bio). Real-time student response scoring (token overlap, copy penalty) and Exponential Moving Average telemetry."),
        ("6. Client Ecosystem", "Cross-platform access via React 18 / Vite web application and Expo (React Native) mobile client; teacher diagnostic analytics desk with struggle flags.")
    ]

    for idx, (m_title, m_desc) in enumerate(methods):
        col = idx % 3
        row = idx // 3
        bx = 9.35 + col * (4.25 + 0.24)
        by = 3.90 + row * (0.85 + 0.15)
        
        # Outer card
        add_rect(slide, bx, by, 4.25, 0.85, bg_color=C_ALT_BG, border_color=C_CARD_BORDER)
        
        tb = slide.shapes.add_textbox(Inches(bx + 0.10), Inches(by + 0.05), Inches(4.05), Inches(0.75))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p1 = tf.paragraphs[0]
        p1.text = m_title
        p1.font.size = Pt(12.5)
        p1.font.bold = True
        p1.font.color.rgb = C_DARK_TEXT
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.text = m_desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_BODY_TEXT
        p2.font.name = 'Arial'
        p2.space_before = Pt(1)

    # 2. Architecture Title
    add_section_title(slide, 9.35, 5.90, 13.23, "Clariq Six-Layer System Architecture & Interaction Workflow", font_size=20)

    # 3. BIG Full-Width Architecture Diagram Card (y = 6.30", h = 7.95", ends at 14.25")
    add_rect(slide, 9.35, 6.30, 13.23, 7.95, bg_color=C_WHITE, border_color=C_CARD_BORDER)

    arch_img = "report_figures/fig_system_architecture.png"
    if os.path.exists(arch_img):
        # Native aspect ratio is 1.465 (1024 / 699).
        # At width = 11.50", height = 11.50 / 1.465 = 7.85" (fits inside 7.95")
        # Centered horizontally inside the 13.23" container:
        # left = 9.35 + (13.23 - 11.50)/2 = 10.21"
        slide.shapes.add_picture(arch_img, Inches(10.21), Inches(6.35), width=Inches(11.50), height=Inches(7.85))

def build_model_evaluation_section(slide):
    """
    Builds Empirical Model Evaluation & Adversarial Benchmark Section (y = 14.45", h = 4.85", ends at 19.30").
    Full-width section with:
      - Left: Benchmark comparison chart (width 9.50", height 4.40")
      - Right: Spacious Comparative Findings & Socratic Gating Analysis (width 12.08", height 4.40")
    """
    # Section Title (y = 14.45")
    add_section_title(slide, 0.80, 14.45, 21.786, "Empirical Model Evaluation & Adversarial Benchmark (100-Item Challenge Suite)", font_size=20)

    # Left Container: Benchmark Comparison Chart (width = 9.50", height = 4.40")
    add_rect(slide, 0.80, 14.85, 9.50, 4.40, bg_color=C_WHITE, border_color=C_CARD_BORDER)
    chart_img = "report_figures/fig_model_smoke_comparison.png"
    if os.path.exists(chart_img):
        # Height = 4.20", width = 4.20 * 2.019 = 8.48" (fits inside 9.50")
        # Centered: left = 0.80 + (9.50 - 8.48)/2 = 1.31"
        slide.shapes.add_picture(chart_img, Inches(1.31), Inches(14.95), width=Inches(8.48), height=Inches(4.20))

    # Right Container: Benchmark Findings & Baseline Analysis (width = 12.08", height = 4.40")
    add_rect(slide, 10.50, 14.85, 12.08, 4.40, bg_color=C_WHITE, border_color=C_CARD_BORDER)
    tb_bench = slide.shapes.add_textbox(Inches(10.75), Inches(14.95), Inches(11.60), Inches(4.20))
    tf_b = tb_bench.text_frame
    tf_b.word_wrap = True
    tf_b.margin_left = tf_b.margin_top = tf_b.margin_right = tf_b.margin_bottom = 0

    p_bt = tf_b.paragraphs[0]
    p_bt.text = "Comparative Benchmark Findings (Table 6.2 in Dissertation)"
    p_bt.font.size = Pt(15.5)
    p_bt.font.bold = True
    p_bt.font.color.rgb = C_DARK_TEXT
    p_bt.font.name = 'Arial'

    bench_points = [
        ("Clariq (Qwen2.5-7B Merged SFT + Turn Policy)", "0% Direct Answer Leaks  •  100% Guiding Questions  •  0 Script Collapse Flags  •  3.31s Median Latency.\nAchieved absolute conversational compliance with zero direct answer disclosures across all 100 adversarial student probes."),
        ("Commercial GPT-4o (Frontier Model Baseline)", "88% Direct Answer Dumps  •  Only 22% Guiding Questions  •  2.12s Latency.\nCompletely fails Socratic restraint by immediately dispensing full solutions, robbing students of self-guided synthesis."),
        ("Qwen-4B LoRA (Raw Unmerged Baseline)", "4% Answer Dumps  •  96% Questions  •  14 Script Collapse Flags  •  5.80s Latency.\nSuffered catastrophic prompt loop repetition on English prefixes; resolved completely by 7B weight merging."),
        ("Deterministic Socratic Gating (turn_policy.py)", "Multi-stage deterministic validation intercepts raw LLM candidate outputs before transmission. If answer leakage or script repetition is detected, the policy dynamically injects a guiding scaffold probe.")
    ]

    for lead, body in bench_points:
        p = tf_b.add_paragraph()
        r1 = p.add_run()
        r1.text = f"•  {lead}: "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = C_NAVY_PRIMARY
        r1.font.name = 'Arial'
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = C_BODY_TEXT
        r2.font.name = 'Arial'
        p.space_before = Pt(3)

def build_metrics_section(slide):
    """
    Builds 7 KPI Metric Cards and the Refactored UAT Pilot Study Callout.
    Starts at y = 19.45", ends at y = 22.35" (ZERO overlap).
    """
    # Section Title: Findings and Metrics (y = 19.45")
    add_section_title(slide, 0.80, 19.45, 21.786, "Key Empirical Results & Baseline Model Comparison", font_size=20)

    # 7 KPI Metric Boxes (width = 2.95", height = 1.40", gap = 0.18", ends at 21.30")
    kpis = [
        ("0.873", "Curriculum RAG\nPrecision@3", "Target: >= 0.85 (MET)\n+11.3% over cosine", C_GREEN_STAT),
        ("0%", "Direct Answer\nDumps (Leakage)", "Baseline: 88% GPT-4o\nTotal restraint", C_GREEN_STAT),
        ("100%", "Guiding Questions\n('?') Post-Policy", "Baseline: 22% GPT-4o\nStrict guidance", C_NAVY_PRIMARY),
        ("0", "Script Collapse\nFlags (Memorization)", "Baseline: 14 in 4B Raw\nResolved via 7B SFT", C_GREEN_STAT),
        ("3.31 s", "Median Warm\nLatency (ZeroGPU)", "Target: <= 5.0s (MET)\nRunPod: 6.66s conc.", C_NAVY_PRIMARY),
        ("+2.80", "Mean Pilot\nLearning Gain", "Baseline: +1.20 Book\n4.70 vs 3.20 post-score", C_GREEN_STAT),
        ("88.8 / 100", "System Usability\nScale (SUS)", "Target: >= 70.0 (MET)\nRating: 'Excellent'", C_NAVY_PRIMARY)
    ]

    for idx, (num_str, label_str, sub_str, col) in enumerate(kpis):
        x = 0.80 + idx * (2.95 + 0.18)
        y = 19.90
        
        # Outer Card
        add_rect(slide, x, y, 2.95, 1.40, bg_color=C_WHITE, border_color=C_CARD_BORDER)
        
        tb = slide.shapes.add_textbox(Inches(x + 0.10), Inches(y + 0.05), Inches(2.75), Inches(1.30))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p1 = tf.paragraphs[0]
        p1.alignment = PP_ALIGN.CENTER
        p1.text = num_str
        p1.font.size = Pt(25)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.CENTER
        p2.text = label_str
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = C_DARK_TEXT
        p2.font.name = 'Arial'
        p2.space_before = Pt(1)

        p3 = tf.add_paragraph()
        p3.alignment = PP_ALIGN.CENTER
        p3.text = sub_str
        p3.font.size = Pt(8.8)
        p3.font.color.rgb = C_MUTED_TEXT
        p3.font.name = 'Arial'
        p3.space_before = Pt(1)

    # Refactored UAT Pilot Study Callout Banner (y = 21.45", height = 0.95", ends at 22.40")
    add_rect(slide, 0.80, 21.45, 21.786, 0.95, bg_color=RGBColor(240, 253, 244), border_color=RGBColor(187, 247, 208))
    
    # Left Badge
    badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.95), Inches(21.52), Inches(1.80), Inches(0.80))
    badge.fill.solid()
    badge.fill.fore_color.rgb = C_GREEN_STAT
    badge.line.fill.background()
    tf_b = badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.alignment = PP_ALIGN.CENTER
    p_b.text = "UAT PILOT\nTRIAL"
    p_b.font.size = Pt(12.5)
    p_b.font.bold = True
    p_b.font.color.rgb = C_WHITE
    p_b.font.name = 'Arial'

    # Right Content
    tb_ut = slide.shapes.add_textbox(Inches(2.95), Inches(21.49), Inches(19.40), Inches(0.85))
    tf_ut = tb_ut.text_frame
    tf_ut.word_wrap = True
    tf_ut.margin_left = tf_ut.margin_top = tf_ut.margin_right = tf_ut.margin_bottom = 0
    
    p_ut1 = tf_ut.paragraphs[0]
    p_ut1.text = "User Acceptance Testing (UAT) & Empirical Pilot Feasibility Trial  (N = 20 Class 10 Students, Ages 15–16)"
    p_ut1.font.size = Pt(12.5)
    p_ut1.font.bold = True
    p_ut1.font.color.rgb = C_DARK_TEXT
    p_ut1.font.name = 'Arial'

    p_ut2 = tf_ut.add_paragraph()
    p_ut2.text = "• Higher Comprehension: Clariq students scored 4.70 / 5.0 on post-study assessment vs. 3.20 / 5.0 for CDC textbook self-study (+1.50 higher comprehension; +2.80 learning gain).\n• Time Efficiency: 34.8% reduction in study duration (8.35 min with Clariq vs. 12.80 min with textbook self-study) while maintaining deeper understanding.\n• High Usability: 88.8 / 100 System Usability Scale (SUS) rating ('Excellent' usability across all 10 standard items). Preliminary trial focused on Chemical Acids, Bases & Salts."
    p_ut2.font.size = Pt(10)
    p_ut2.font.color.rgb = C_BODY_TEXT
    p_ut2.font.name = 'Arial'
    p_ut2.space_before = Pt(1.5)

def build_bottom_section(slide):
    """
    Builds Bottom Section: Practical Implications, Conclusion, Future Work, References, 
    Pedagogical Features, Scope & Ethics.
    Starts at y = 22.55", ends at y = 32.55" (ZERO overflow).
    """
    # Left Column: x=0.80", width=12.20"
    # Right Column: x=13.35", width=9.23"
    
    # Left 1: Practical Implications & Significance (y = 22.55", height = 1.60", ends at 24.15")
    add_section_title(slide, 0.80, 22.55, 12.20, "Practical Implications & Educational Significance", font_size=20)
    tb_imp = slide.shapes.add_textbox(Inches(0.80), Inches(22.95), Inches(12.20), Inches(1.45))
    tf_imp = tb_imp.text_frame
    tf_imp.word_wrap = True
    tf_imp.margin_left = tf_imp.margin_top = tf_imp.margin_right = tf_imp.margin_bottom = 0
    
    impls = [
        ("Bridging the Rural Educational Divide", "Provides free 1-on-1 Socratic tutoring to rural public school students who cannot afford private tuition ($15–$40/mo). Designed specifically to operate over low-cost smartphones even under constrained educational resources."),
        ("Protecting Cognitive Autonomy", "Eliminating direct answer dumping (0% leakage) prevents cognitive surrender and ensures secondary students actively synthesize scientific principles rather than passively copying solutions."),
        ("Teacher Empowerment & Classroom Interventions", "Converts conversational turns into concept-level mastery heatmaps and automated 3-turn confusion alerts, enabling overburdened educators to prioritize targeted small-group classroom support.")
    ]
    for idx, (lead, body) in enumerate(impls):
        p = tf_imp.paragraphs[0] if idx == 0 else tf_imp.add_paragraph()
        r1 = p.add_run()
        r1.text = f"•  {lead}: "
        r1.font.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = C_NAVY_PRIMARY
        r1.font.name = 'Arial'
        r2 = p.add_run()
        r2.text = body
        r2.font.size = Pt(10.2)
        r2.font.color.rgb = C_BODY_TEXT
        r2.font.name = 'Arial'
        p.space_after = Pt(2)

    # Left 2: Conclusion & Future Roadmap (y = 24.30", height = 2.15", ends at 26.45")
    add_section_title(slide, 0.80, 24.30, 12.20, "Conclusion & Future Research Roadmap", font_size=20)
    tb_concl = slide.shapes.add_textbox(Inches(0.80), Inches(24.70), Inches(12.20), Inches(2.00))
    tf_c = tb_concl.text_frame
    tf_c.word_wrap = True
    tf_c.margin_left = tf_c.margin_top = tf_c.margin_right = tf_c.margin_bottom = 0
    
    p_c1 = tf_c.paragraphs[0]
    p_c1.text = "Dissertation Conclusion: Clariq validates that fine-tuning open-weight models (Qwen2.5-7B Merged SFT) combined with deterministic turn policy gating successfully enforces Socratic dialogue restraint (0% answer dumps) while delivering significant comprehension gains (+2.80) and 34.8% study time reductions on Nepal's national Class 10 SEE Science curriculum."
    p_c1.font.size = Pt(11)
    p_c1.font.color.rgb = C_BODY_TEXT
    p_c1.font.name = 'Arial'
    p_c1.space_after = Pt(2)

    p_c2 = tf_c.add_paragraph()
    p_c2.text = "Strategic Future Work (4 Pillars):\n•  1. Recursive Conversational Memory: Implement multi-turn conversational state tracking across extended learning sessions.\n•  2. Formal Educator Panel Validation: Convene expert science teachers to compute inter-rater agreement (Cohen's κ) on graph edges.\n•  3. Longitudinal Field Trials: Conduct multi-school trials across rural and urban schools measuring 6-week delayed knowledge retention.\n•  4. Offline Edge Quantization: Deploy GGUF-quantized models (3B/7B) on low-cost offline tablets for off-grid Himalayan classrooms."
    p_c2.font.size = Pt(10.2)
    p_c2.font.color.rgb = C_NAVY_PRIMARY
    p_c2.font.name = 'Arial'

    # Left 3: References (y = 26.60", height = 5.95", ends at 32.55")
    add_section_title(slide, 0.80, 26.60, 12.20, "References", font_size=18)
    tb_ref = slide.shapes.add_textbox(Inches(0.80), Inches(27.00), Inches(12.20), Inches(5.55))
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
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_MUTED_TEXT
        p.font.name = 'Arial'
        p.space_after = Pt(2)

    # Right 1: Pedagogical Features & Accessibility (y = 22.55", height = 2.45", ends at 25.00")
    add_section_title(slide, 13.35, 22.55, 9.23, "Pedagogical Features & Accessibility", font_size=20)
    tb_ped = slide.shapes.add_textbox(Inches(13.35), Inches(22.95), Inches(9.23), Inches(2.20))
    tf_ped = tb_ped.text_frame
    tf_ped.word_wrap = True
    tf_ped.margin_left = tf_ped.margin_top = tf_ped.margin_right = tf_ped.margin_bottom = 0
    
    p_p1 = tf_ped.paragraphs[0]
    p_p1.text = "•  Socratic Scaffolding Chips: Interactive UI chips ('Give me a hint', 'Is my reasoning right?', 'What is the next step?') give learners cognitive autonomy without revealing answers.\n•  Teacher Struggle Alerts: Automated detection of 3 consecutive low-scoring turns triggers diagnostic flags for educators.\n•  Low-Bandwidth Mobile Optimization: Ultra-lightweight JSON response payloads (<500 bytes per turn) and client-side caching ensure smooth operation over patchy 2G/3G mobile data connections in rural hill districts.\n•  Offline Village Edge Roadmap: Architecture designed for 4-bit GGUF quantization deployed on local community school desktop PCs and solar-powered tablets, delivering full Socratic tutoring without requiring active internet connectivity."
    p_p1.font.size = Pt(10.2)
    p_p1.font.color.rgb = C_BODY_TEXT
    p_p1.font.name = 'Arial'

    # Right 2: Scope, Delimitations & Ethics (y = 25.15", height = 7.40", ends at 32.55")
    add_section_title(slide, 13.35, 25.15, 9.23, "Scope, Study Limitations & Ethics", font_size=20)
    tb_eth = slide.shapes.add_textbox(Inches(13.35), Inches(25.55), Inches(9.23), Inches(7.00))
    tf_eth = tb_eth.text_frame
    tf_eth.word_wrap = True
    tf_eth.margin_left = tf_eth.margin_top = tf_eth.margin_right = tf_eth.margin_bottom = 0
    
    p_e1 = tf_eth.paragraphs[0]
    p_e1.text = "Scope Boundaries & Delimitations:\n•  In-Scope: Class 10 Physics, Chemistry, Biology (CDC Nepal); typed Socratic chat; 135-node KG; web & mobile clients.\n•  Out-of-Scope: Grades 1–9 / 11–12; speech/voice synthesis; Devanagari script; high-stakes summative grading.\n\nStudy Limitations:\n•  Immediate post-test measures short-term conceptual acquisition rather than long-term delayed retention.\n•  Pilot cohort of N=20 evaluated on a single chemistry unit (Acids & Bases); broader cross-subject trials are needed.\n•  Token-overlap scoring serves as a computationally efficient proxy for understanding, but does not capture deep semantic nuance.\n\nResearch Ethics & Governance:\n•  Protection of Minors: Voluntary student assent, parental awareness, full pseudonymisation (P01–P20), and zero personal identifiable information (PII) stored.\n•  Legal Compliance: Official CDC textbooks utilized under educational research fair dealing provisions of Nepal Copyright Act 2059 (Sec 16 & 18) and UK CDPA 1988.\n•  Professional Standards: Strict adherence to BCS Code of Conduct and ACM Code of Ethics."
    p_e1.font.size = Pt(10.2)
    p_e1.font.color.rgb = C_BODY_TEXT
    p_e1.font.name = 'Arial'

def main():
    print("Initializing A1 Portrait Poster Canvas (594 mm x 841 mm = 23.386 in x 33.110 in)...")
    prs, slide = create_poster()

    print("Building Header & Banner...")
    build_header(slide)

    print("Building Upper Left (Problem, Gap, Aim, Objectives, RQs, and United Curriculum & Dataset)...")
    build_upper_left(slide)

    print("Building Upper Right (Method Grid & HUGE Full-Width Architecture Diagram)...")
    build_upper_right(slide)

    print("Building Empirical Model Evaluation & Adversarial Benchmark (Spacious Chart + Comparison Table)...")
    build_model_evaluation_section(slide)

    print("Building Findings, Metrics & Baseline Comparison (7 KPI cards & Refactored UAT)...")
    build_metrics_section(slide)

    print("Building Bottom Section (Implications, Conclusion, Roadmap, References, Features, Scope & Ethics)...")
    build_bottom_section(slide)

    output_filename = "Clariq_A1_Portrait_Poster.pptx"
    prs.save(output_filename)
    print(f"A1 Portrait Poster successfully saved to: {output_filename}")

if __name__ == "__main__":
    main()
