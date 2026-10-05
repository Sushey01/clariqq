"""
generate_presentation.py
Full automated generator for the 20-slide Clariq Final Project Dissertation Presentation in .pptx.
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

# Color Palette Definitions
C_NAVY_DARK    = RGBColor(0, 32, 70)      # BCU Deep Navy #002046
C_NAVY_PRIMARY = RGBColor(0, 51, 102)     # BCU Blue #003366
C_BLUE_ACCENT  = RGBColor(14, 165, 233)   # Clariq Cyan / Electric Blue #0EA5E9
C_BLUE_LIGHT   = RGBColor(224, 242, 254)  # Light Sky Background #E0F2FE
C_SLATE_DARK   = RGBColor(15, 23, 42)     # Primary Text Dark #0F172A
C_SLATE_BODY   = RGBColor(51, 65, 85)     # Body Text Slate #334155
C_SLATE_MUTED  = RGBColor(100, 116, 139)  # Subtitles / Captions #64748B
C_CARD_BG      = RGBColor(248, 250, 252)  # Card Fill #F8FAFC
C_CARD_BORDER  = RGBColor(226, 232, 240)  # Card Border #E2E8F0
C_CARD_ALT_BG  = RGBColor(241, 245, 249)  # Alt Card Fill #F1F5F9
C_WHITE        = RGBColor(255, 255, 255)  # Pure White
C_GREEN        = RGBColor(22, 163, 74)    # Success / Positive #16A34A
C_ORANGE       = RGBColor(234, 88, 12)    # Warning / Highlight #EA580C
C_PURPLE       = RGBColor(123, 94, 167)   # Model Accent #7B5EA7

TOTAL_SLIDES = 20

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    return prs

def add_header(slide, category, title, subtitle):
    """Adds a standard structured header zone with category tag, title, and subtitle."""
    badge_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.38), Inches(11.7), Inches(0.26))
    tf_b = badge_box.text_frame
    tf_b.word_wrap = True
    tf_b.margin_left = tf_b.margin_top = tf_b.margin_right = tf_b.margin_bottom = 0
    p_b = tf_b.paragraphs[0]
    p_b.text = f"[ {category.upper()} ]"
    p_b.font.size = Pt(10)
    p_b.font.bold = True
    p_b.font.color.rgb = C_BLUE_ACCENT
    p_b.font.name = 'Arial'

    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(11.7), Inches(0.52))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
    p_t = tf_t.paragraphs[0]
    p_t.text = title
    p_t.font.size = Pt(21)
    p_t.font.bold = True
    p_t.font.color.rgb = C_NAVY_PRIMARY
    p_t.font.name = 'Arial'

    sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.18), Inches(11.7), Inches(0.32))
    tf_s = sub_box.text_frame
    tf_s.word_wrap = True
    tf_s.margin_left = tf_s.margin_top = tf_s.margin_right = tf_s.margin_bottom = 0
    p_s = tf_s.paragraphs[0]
    p_s.text = subtitle
    p_s.font.size = Pt(12)
    p_s.font.color.rgb = C_SLATE_MUTED
    p_s.font.name = 'Arial'

    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.52), Inches(11.733), Inches(0.015))
    line.fill.solid()
    line.fill.fore_color.rgb = C_CARD_BORDER
    line.line.color.rgb = C_CARD_BORDER

def add_footer(slide, current_slide, total_slides=TOTAL_SLIDES):
    """Adds a standard academic footer to the slide."""
    footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.08), Inches(11.733), Inches(0.28))
    tf = footer_box.text_frame
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.font.size = Pt(8.5)
    p.font.color.rgb = C_SLATE_MUTED
    p.font.name = 'Arial'
    
    r1 = p.add_run()
    r1.text = "Clariq: Socratic AI Science Tutor for SEE Students | Shekhar Lamichhane Magar (ID: 23189647)  •  CMP6200/DIG6200 FYP"
    
    page_box = slide.shapes.add_textbox(Inches(10.5), Inches(7.08), Inches(2.0), Inches(0.28))
    tf_p = page_box.text_frame
    tf_p.margin_left = tf_p.margin_top = tf_p.margin_right = tf_p.margin_bottom = 0
    p_p = tf_p.paragraphs[0]
    p_p.alignment = PP_ALIGN.RIGHT
    p_p.font.size = Pt(8.5)
    p_p.font.bold = True
    p_p.font.color.rgb = C_NAVY_PRIMARY
    p_p.font.name = 'Arial'
    r2 = p_p.add_run()
    r2.text = f"Slide {current_slide} of {total_slides}"

def add_card(slide, left, top, width, height, bg_color=C_CARD_BG, border_color=C_CARD_BORDER):
    """Creates a container card shape with subtle background and border."""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1.0)
    return card

def add_card_header(slide, left, top, width, title_text, bg_color=C_NAVY_PRIMARY, text_color=C_WHITE):
    """Creates a card header title banner."""
    header = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(0.38))
    header.fill.solid()
    header.fill.fore_color.rgb = bg_color
    header.line.color.rgb = bg_color
    tf = header.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.15)
    tf.margin_top = Inches(0.06)
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = text_color
    p.font.name = 'Arial'
    return header

def add_metric_callout(slide, left, top, width, height, stat_value, stat_label, subtext="", stat_color=C_NAVY_PRIMARY):
    """Creates a high-impact metric KPI box with big numbers."""
    add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=C_CARD_BORDER)
    
    tb = slide.shapes.add_textbox(Inches(left + 0.12), Inches(top + 0.1), Inches(width - 0.24), Inches(height - 0.2))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p1 = tf.paragraphs[0]
    p1.text = stat_value
    p1.font.size = Pt(25)
    p1.font.bold = True
    p1.font.color.rgb = stat_color
    p1.font.name = 'Arial'
    
    p2 = tf.add_paragraph()
    p2.text = stat_label
    p2.font.size = Pt(10.5)
    p2.font.bold = True
    p2.font.color.rgb = C_SLATE_DARK
    p2.font.name = 'Arial'
    p2.space_before = Pt(3)
    
    if subtext:
        p3 = tf.add_paragraph()
        p3.text = subtext
        p3.font.size = Pt(9)
        p3.font.color.rgb = C_SLATE_MUTED
        p3.font.name = 'Arial'
        p3.space_before = Pt(2)

def add_bullet_list(slide, left, top, width, height, items, font_size=11, space_after=5):
    """Adds styled bullet points with bold prefixes to a container."""
    tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    for idx, (lead, body) in enumerate(items):
        if idx == 0 and len(tf.paragraphs[0].text) == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.space_after = Pt(space_after)
        p.level = 0
        
        if lead:
            r_lead = p.add_run()
            r_lead.text = f"•  {lead}: "
            r_lead.font.bold = True
            r_lead.font.size = Pt(font_size)
            r_lead.font.color.rgb = C_NAVY_PRIMARY
            r_lead.font.name = 'Arial'
        else:
            r_bullet = p.add_run()
            r_bullet.text = "•  "
            r_bullet.font.bold = True
            r_bullet.font.size = Pt(font_size)
            r_bullet.font.color.rgb = C_NAVY_PRIMARY
            r_bullet.font.name = 'Arial'
        
        r_body = p.add_run()
        r_body.text = body
        r_body.font.bold = False
        r_body.font.size = Pt(font_size)
        r_body.font.color.rgb = C_SLATE_BODY
        r_body.font.name = 'Arial'

# ==============================================================================
# SLIDE BUILDERS (20 SLIDES)
# ==============================================================================

def build_slide_1(prs):
    """Slide 1: Cover / Title Slide"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    
    # Background Navy
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = C_NAVY_DARK
    bg.line.color.rgb = C_NAVY_DARK
    
    # Top decorative bar
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12))
    bar.fill.solid()
    bar.fill.fore_color.rgb = C_BLUE_ACCENT
    bar.line.color.rgb = C_BLUE_ACCENT

    # Logo if exists
    if os.path.exists("logo.png"):
        slide.shapes.add_picture("logo.png", Inches(1.0), Inches(0.7), height=Inches(0.85))

    # University & Faculty Banner
    tb_uni = slide.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(0.6))
    tf_u = tb_uni.text_frame
    p_u = tf_u.paragraphs[0]
    p_u.text = "BIRMINGHAM CITY UNIVERSITY  |  FACULTY OF COMPUTING, ENGINEERING AND THE BUILT ENVIRONMENT"
    p_u.font.size = Pt(11)
    p_u.font.bold = True
    p_u.font.color.rgb = C_BLUE_ACCENT
    p_u.font.name = 'Arial'

    p_mod = tf_u.add_paragraph()
    p_mod.text = "CMP6200 / DIG6200: Individual Undergraduate Project (FYP) Final Project Dissertation Defense"
    p_mod.font.size = Pt(13)
    p_mod.font.bold = True
    p_mod.font.color.rgb = C_WHITE
    p_mod.font.name = 'Arial'
    p_mod.space_before = Pt(4)

    # Main Project Title
    tb_title = slide.shapes.add_textbox(Inches(1.0), Inches(2.7), Inches(11.3), Inches(1.6))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = True
    p_t1 = tf_t.paragraphs[0]
    p_t1.text = "Clariq: An AI-Powered Socratic Science Tutor"
    p_t1.font.size = Pt(32)
    p_t1.font.bold = True
    p_t1.font.color.rgb = C_WHITE
    p_t1.font.name = 'Arial'

    p_t2 = tf_t.add_paragraph()
    p_t2.text = "with Adaptive Knowledge Tracking for SEE Students (Class 10, Nepal)"
    p_t2.font.size = Pt(22)
    p_t2.font.bold = True
    p_t2.font.color.rgb = C_BLUE_LIGHT
    p_t2.font.name = 'Arial'
    p_t2.space_before = Pt(6)

    # Candidate & Supervisor Credentials Card
    cred_card = add_card(slide, 1.0, 4.6, 11.333, 2.0, bg_color=RGBColor(11, 25, 44), border_color=RGBColor(30, 58, 95))
    
    # Left Column: Student Details
    tb_stud = slide.shapes.add_textbox(Inches(1.3), Inches(4.8), Inches(5.2), Inches(1.6))
    tf_s = tb_stud.text_frame
    p_s1 = tf_s.paragraphs[0]
    p_s1.text = "STUDENT CANDIDATE"
    p_s1.font.size = Pt(10)
    p_s1.font.bold = True
    p_s1.font.color.rgb = C_BLUE_ACCENT
    p_s1.font.name = 'Arial'

    p_s2 = tf_s.add_paragraph()
    p_s2.text = "Shekhar Lamichhane Magar"
    p_s2.font.size = Pt(17)
    p_s2.font.bold = True
    p_s2.font.color.rgb = C_WHITE
    p_s2.font.name = 'Arial'
    p_s2.space_before = Pt(3)

    p_s3 = tf_s.add_paragraph()
    p_s3.text = "Student ID: 23189647  •  BSc (Hons) Computer and Data Science"
    p_s3.font.size = Pt(11)
    p_s3.font.color.rgb = C_CARD_BORDER
    p_s3.font.name = 'Arial'
    p_s3.space_before = Pt(3)

    # Right Column: Supervisor & Date
    tb_sup = slide.shapes.add_textbox(Inches(6.8), Inches(4.8), Inches(5.2), Inches(1.6))
    tf_sp = tb_sup.text_frame
    p_sp1 = tf_sp.paragraphs[0]
    p_sp1.text = "ACADEMIC SUPERVISOR & ASSESSMENT"
    p_sp1.font.size = Pt(10)
    p_sp1.font.bold = True
    p_sp1.font.color.rgb = C_BLUE_ACCENT
    p_sp1.font.name = 'Arial'

    p_sp2 = tf_sp.add_paragraph()
    p_sp2.text = "Rupak Koirala"
    p_sp2.font.size = Pt(17)
    p_sp2.font.bold = True
    p_sp2.font.color.rgb = C_WHITE
    p_sp2.font.name = 'Arial'
    p_sp2.space_before = Pt(3)

    p_sp3 = tf_sp.add_paragraph()
    p_sp3.text = "Department of Computer and Data Science  •  October 2026"
    p_sp3.font.size = Pt(11)
    p_sp3.font.color.rgb = C_CARD_BORDER
    p_sp3.font.name = 'Arial'
    p_sp3.space_before = Pt(3)

    return slide

def build_slide_2(prs):
    """Slide 2: Executive Summary & National Problem Context"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Executive Summary", "National Educational Context: The Class 10 SEE Challenge", 
               "Severe national pass rate deficits and socio-economic tuition barriers drive the urgent need for scalable AI inquiry.")
    add_footer(slide, 2)

    # 3 High-Impact Metric Cards
    add_metric_callout(slide, 0.8, 1.7, 3.6, 1.25, "79,271", "Non-Graded in SEE Science", "15.42% failed in 2080-81 (highest deficit subject)", C_ORANGE)
    add_metric_callout(slide, 4.866, 1.7, 3.6, 1.25, "88%", "Answer Leakage in LLMs", "Commercial ChatGPT-4o immediately gives away answers", C_NAVY_PRIMARY)
    add_metric_callout(slide, 8.933, 1.7, 3.6, 1.25, "135 Nodes", "SEE Knowledge Graph", "Curriculum-grounded tracking across Physics, Chem & Bio", C_GREEN)

    # Left Container: National Problem
    add_card(slide, 0.8, 3.15, 5.7, 3.7)
    add_card_header(slide, 0.8, 3.15, 5.7, "The Educational & Socio-Economic Crisis in Nepal")
    left_items = [
        ("The High-Stakes Gateway", "The Secondary Education Examination (SEE, Class 10) dictates students' eligibility for higher secondary science, engineering, and medical streams."),
        ("Disproportionate Failure", "In the 2080-81 national exams, 79,271 students (15.42%) were marked Non-Graded (NG) in Science & Technology, reflecting severe instructional gaps."),
        ("Unaffordable Private Tuition", "Commercial coaching centers charge NPR 2,000–5,000/month ($15–$40), which is economically prohibitive for underprivileged and rural households."),
        ("Under-Resourced Community Schools", "Public community schools face 50+:1 pupil-teacher ratios, making personalized inquiry and 1-on-1 scaffolding practically impossible.")
    ]
    add_bullet_list(slide, 1.0, 3.7, 5.3, 3.0, left_items, font_size=11, space_after=6)

    # Right Container: Digital Dilemma & Solution
    add_card(slide, 6.833, 3.15, 5.7, 3.7)
    add_card_header(slide, 6.833, 3.15, 5.7, "The Digital Pitfall: Static Books vs. Didactic AI")
    right_items = [
        ("Static Textbooks (Passive)", "Approved CDC textbooks provide factual curriculum material but cannot answer contextual questions or dynamically diagnose student misconceptions."),
        ("Commercial Chatbots (Cognitive Crutch)", "Generic LLMs (ChatGPT, Claude) act as didactic answer dispensers—88% of queries result in immediate answer dumps, short-circuiting critical thinking."),
        ("Hallucination & Syllabus Drift", "Off-the-shelf LLMs frequently drift outside national exam syllabi and hallucinate facts unsupported by official CDC textbooks."),
        ("The Clariq Intervention", "An open-weight, curriculum-grounded Socratic tutor enforcing strict pedagogical turn policies (0% answer dumps) with continuous 135-node mastery tracking.")
    ]
    add_bullet_list(slide, 7.033, 3.7, 5.3, 3.0, right_items, font_size=11, space_after=6)
    return slide

def build_slide_3(prs):
    """Slide 3: Research Questions & Pedagogical Challenge"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Research Foundations", "Research Questions & Theoretical Pedagogical Alignment",
               "Investigating whether generative AI can uphold pedagogical restraint and deliver reliable formative mastery telemetry.")
    add_footer(slide, 3)

    # Left Container: Research Questions
    add_card(slide, 0.8, 1.7, 5.7, 5.15)
    add_card_header(slide, 0.8, 1.7, 5.7, "Formal Research Questions (RQs)")

    # RQ1 Box
    add_card(slide, 1.05, 2.25, 5.2, 1.95, bg_color=C_WHITE, border_color=C_BLUE_ACCENT)
    tb_rq1 = slide.shapes.add_textbox(Inches(1.2), Inches(2.35), Inches(4.9), Inches(1.75))
    tf1 = tb_rq1.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "RESEARCH QUESTION 1 (Dialogue Discipline)"
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = C_BLUE_ACCENT
    p1.font.name = 'Arial'

    p2 = tf1.add_paragraph()
    p2.text = "Can an open-weight conversational LLM, constrained by pedagogical turn policies and textbook RAG, sustain multi-turn Socratic inquiry without leaking direct answers on SEE Class 10 science queries?"
    p2.font.size = Pt(11.5)
    p2.font.bold = True
    p2.font.color.rgb = C_NAVY_PRIMARY
    p2.font.name = 'Arial'
    p2.space_before = Pt(4)

    # RQ2 Box
    add_card(slide, 1.05, 4.4, 5.2, 2.25, bg_color=C_WHITE, border_color=C_GREEN)
    tb_rq2 = slide.shapes.add_textbox(Inches(1.2), Inches(4.5), Inches(4.9), Inches(2.05))
    tf2 = tb_rq2.text_frame
    tf2.word_wrap = True
    p3 = tf2.paragraphs[0]
    p3.text = "RESEARCH QUESTION 2 (Mastery Telemetry)"
    p3.font.size = Pt(10)
    p3.font.bold = True
    p3.font.color.rgb = C_GREEN
    p3.font.name = 'Arial'

    p4 = tf2.add_paragraph()
    p4.text = "Can student multi-turn conversational responses provide reliable concept-level mastery signals across an adaptive 135-node knowledge graph to surface actionable confusion alerts for secondary school science educators?"
    p4.font.size = Pt(11.5)
    p4.font.bold = True
    p4.font.color.rgb = C_NAVY_PRIMARY
    p4.font.name = 'Arial'
    p4.space_before = Pt(4)

    # Right Container: Pedagogical Foundations
    add_card(slide, 6.833, 1.7, 5.7, 5.15)
    add_card_header(slide, 6.833, 1.7, 5.7, "Theoretical Pedagogical Frameworks")
    theory_items = [
        ("Bloom's 2-Sigma Problem (Bloom, 1984)", "1-on-1 human tutoring produces 2 standard deviations (+2σ) improvement over traditional classroom instruction. Clariq aims to scale this cognitive scaffolding affordably."),
        ("Vygotsky's Zone of Proximal Development (ZPD)", "Cognitive growth occurs when learners are guided just beyond their independent capacity. Socratic dialogue provides calibrated hints to bridge this gap."),
        ("AI as Cognitive Crutch (Bastani et al., 2025)", "Recent empirical findings show that unconstrained AI tutors providing direct answers degrade independent problem-solving skills; Socratic restraint forces active schema building."),
        ("Formative Telemetry vs. Summative Stress", "Replacing high-stakes end-of-year exams with continuous concept tracking enables timely diagnostic intervention before students fall into the 'Non-Graded' category.")
    ]
    add_bullet_list(slide, 7.033, 2.3, 5.3, 4.3, theory_items, font_size=11, space_after=8)
    return slide

def build_slide_4(prs):
    """Slide 4: Project Aims, Scope Boundaries & Delimitations"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Project Scope", "Project Aims, Operational Boundaries & Delimitations",
               "Clear demarcations between delivered engineering capabilities and explicit dissertation research delimitations.")
    add_footer(slide, 4)

    # Primary Aim Banner
    add_card(slide, 0.8, 1.7, 11.733, 1.15, bg_color=C_BLUE_LIGHT, border_color=C_BLUE_ACCENT)
    tb_aim = slide.shapes.add_textbox(Inches(1.0), Inches(1.78), Inches(11.333), Inches(0.95))
    tf_a = tb_aim.text_frame
    tf_a.word_wrap = True
    p_ah = tf_a.paragraphs[0]
    p_ah.text = "PRIMARY PROJECT AIM"
    p_ah.font.size = Pt(10)
    p_ah.font.bold = True
    p_ah.font.color.rgb = C_NAVY_PRIMARY
    p_ah.font.name = 'Arial'

    p_at = tf_a.add_paragraph()
    p_at.text = '"To design, implement, and empirically pilot Clariq—an AI-powered Socratic science tutor delivering curriculum-grounded dialogue for Nepal\'s Class 10 SEE; dynamically tracking individual concept understanding across an adaptive 135-node Knowledge Graph; generating actionable diagnostic summaries; and evaluating its pedagogical feasibility and usability against textbook self-study."'
    p_at.font.size = Pt(11)
    p_at.font.italic = True
    p_at.font.color.rgb = C_SLATE_DARK
    p_at.font.name = 'Arial'
    p_at.space_before = Pt(2)

    # In Scope Card
    add_card(slide, 0.8, 3.05, 5.7, 3.8)
    add_card_header(slide, 0.8, 3.05, 5.7, "Delivered In-Scope Capabilities", bg_color=C_NAVY_PRIMARY)
    in_scope_items = [
        ("Curriculum Grounding", "Complete SEE Class 10 Physics (45 nodes), Chemistry (50 nodes), and Biology (40 nodes) mapped from official CDC Nepal textbooks."),
        ("Socratic Dialogue Model", "Fine-tuned Qwen2.5-7B Merged SFT deployed on RunPod Serverless vLLM with multi-tier fallback and regex question-mark gating."),
        ("Formative Knowledge Graph", "135 concept nodes interconnected by 99 prerequisite dependencies with EWMA mastery updating (α = 0.25)."),
        ("Dual Client Ecosystem", "Interactive React 18 / Vite web application (Nebular Lab UI, teacher diagnostic desk) and cross-platform Expo mobile app."),
        ("Empirical Evaluation", "Controlled between-subjects pilot user study (N=20 Class 10 students) evaluating comprehension, latency, and usability.")
    ]
    add_bullet_list(slide, 1.0, 3.6, 5.3, 3.1, in_scope_items, font_size=10.5, space_after=5)

    # Out of Scope Card
    add_card(slide, 6.833, 3.05, 5.7, 3.8)
    add_card_header(slide, 6.833, 3.05, 5.7, "Explicit Delimitations & Out of Scope", bg_color=C_SLATE_MUTED)
    out_scope_items = [
        ("Excluded Curricula", "Class 1–9 foundational or Class 11–12 advanced science; Geology and Astronomy units excluded from the formal 135-node KG."),
        ("Interaction Modality", "Asynchronous typed text dialogue only; speech recognition, voice synthesis, and live classroom video conferencing are out of scope."),
        ("Language Medium", "English-medium instruction and scientific nomenclature; Devanagari script, Nepali vernacular, and automated machine translation excluded."),
        ("Assessment Scope", "Formative concept-level mastery telemetry only; official summative examination grading or high-stakes certification excluded."),
        ("Enterprise Integration", "Standalone web/mobile architecture; direct integration with school ERP or MoEST national databases was not attempted.")
    ]
    add_bullet_list(slide, 7.033, 3.6, 5.3, 3.1, out_scope_items, font_size=10.5, space_after=5)
    return slide

def build_slide_5(prs):
    """Slide 5: Review of Existing Knowledge & Theoretical Foundations"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Literature Review", "Theoretical Foundations & Critical Review of Prior Art",
               "Synthesizing Intelligent Tutoring Systems, Retrieval-Augmented Generation, and Knowledge Tracing models.")
    add_footer(slide, 5)

    # 4 Pillar Cards in a 2x2 Grid
    # Card 1: Intelligent Tutoring Systems
    add_card(slide, 0.8, 1.7, 5.7, 2.45)
    add_card_header(slide, 0.8, 1.7, 5.7, "1. Intelligent Tutoring Systems (ITS)")
    its_items = [
        ("Classical Rule-Based Systems", "AutoTutor and Andes demonstrated the efficacy of conversational tutoring but relied on rigid production rules and brittle finite-state scripts."),
        ("Generative LLM Revolution", "Recent LLMs offer conversational fluidity but routinely suffer from factual hallucinations, unconstrained topic drift, and direct answer leakage.")
    ]
    add_bullet_list(slide, 1.0, 2.2, 5.3, 1.8, its_items, font_size=10.5, space_after=5)

    # Card 2: RAG Grounding
    add_card(slide, 6.833, 1.7, 5.7, 2.45)
    add_card_header(slide, 6.833, 1.7, 5.7, "2. Retrieval-Augmented Generation (RAG)")
    rag_items = [
        ("Factual Hallucination Suppression", "Anchoring conversational models to verified national textbooks ensures domain compliance and syllabus fidelity (Lewis et al., 2020)."),
        ("Lexical Challenges in Science", "Standard semantic vector search struggles with domain-specific science terms; requires hybrid retrieval with lexical candidate reranking.")
    ]
    add_bullet_list(slide, 7.033, 2.2, 5.3, 1.8, rag_items, font_size=10.5, space_after=5)

    # Card 3: Student Modeling & Knowledge Tracing
    add_card(slide, 0.8, 4.35, 5.7, 2.5)
    add_card_header(slide, 0.8, 4.35, 5.7, "3. Student Modeling & Knowledge Tracing")
    bkt_items = [
        ("BKT & DKT Constraints", "Bayesian Knowledge Tracing (Corbett & Anderson) and Deep Knowledge Tracing (Piech et al.) demand massive longitudinal datasets unavailable in Nepal."),
        ("Pragmatic EWMA Telemetry", "A 135-node directed graph with Exponentially Weighted Moving Average (EWMA) tracking delivers instant, zero-cold-start mastery updates at low latency.")
    ]
    add_bullet_list(slide, 1.0, 4.85, 5.3, 1.9, bkt_items, font_size=10.5, space_after=5)

    # Card 4: Identified Research Gaps
    add_card(slide, 6.833, 4.35, 5.7, 2.5)
    add_card_header(slide, 6.833, 4.35, 5.7, "4. Identified Gaps Addressed by Clariq")
    gap_items = [
        ("Developing Nation Curriculum Gap", "Near-zero existing AI tutoring literature focuses on Nepal's CDC national examination syllabus or localized secondary science challenges."),
        ("Open-Weight Socratic Discipline", "Absence of open-weight fine-tuned models specifically optimized to enforce strict Socratic counter-questioning rather than direct answer generation.")
    ]
    add_bullet_list(slide, 7.033, 4.85, 5.3, 1.9, gap_items, font_size=10.5, space_after=5)
    return slide

def build_slide_6(prs):
    """Slide 6: Formal Project Objectives & Quantitative Targets"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Formal Objectives", "Five Measurable Objectives & Quantitative Acceptance Criteria",
               "Translating pedagogical aims into verifiable engineering deliverables and empirical research thresholds.")
    add_footer(slide, 6)

    # 5 Objectives Cards vertically spaced
    objs = [
        ("Objective 1: Curriculum Dataset & RAG Pipeline",
         "Structure, clean, and index official CDC Nepal Class 10 Science textbooks into a persistent Chroma vector store with lexical candidate reranking.",
         "Precision@3 >= 0.85 across 100 test queries (300 blinded relevance judgments).", C_NAVY_PRIMARY),
        
        ("Objective 2: Socratic Dialogue Model & Turn Discipline",
         "Fine-tune open-weight Socratic dialogue models (progressing from 4B LoRA prototype to 7B Merged SFT) under strict turn policies.",
         "Direct answer dump rate <= 5%; 0 script collapse flags; >= 90% guiding question adherence.", C_NAVY_PRIMARY),
        
        ("Objective 3: System Integration, Orchestration & Latency",
         "Implement an asynchronous FastAPI backend orchestrating vector search, hosted LLM inference, JWT auth, and session persistence.",
         "Median operational response latency <= 5.0 seconds under warm sequential interactive usage.", C_NAVY_PRIMARY),
        
        ("Objective 4: Adaptive Knowledge Graph & Telemetry",
         "Construct a 135-node directed knowledge graph across Physics, Chemistry, Biology; implement EWMA mastery smoothing and teacher reports.",
         "Functional 135-node graph; automated confusion flag triggered after 3 low-scoring turns.", C_NAVY_PRIMARY),
        
        ("Objective 5: Controlled Empirical Pilot User Study",
         "Conduct a between-subjects pilot study (N=20 Class 10 SEE students) comparing Clariq Socratic AI tutoring against textbook self-study.",
         "Measurable comprehension gains; >= 30% reduction in active study time; SUS score >= 70.0.", C_GREEN)
    ]

    for idx, (title, desc, target, color) in enumerate(objs):
        top_y = 1.7 + idx * 1.02
        add_card(slide, 0.8, top_y, 11.733, 0.92, bg_color=C_WHITE, border_color=C_CARD_BORDER)
        
        # Color accent strip on left
        strip = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(top_y), Inches(0.12), Inches(0.92))
        strip.fill.solid()
        strip.fill.fore_color.rgb = color
        strip.line.color.rgb = color

        # Content text
        tb = slide.shapes.add_textbox(Inches(1.05), Inches(top_y + 0.08), Inches(11.3), Inches(0.76))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(11.5)
        p1.font.bold = True
        p1.font.color.rgb = color
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        r_desc = p2.add_run()
        r_desc.text = f"{desc}  "
        r_desc.font.size = Pt(9.5)
        r_desc.font.color.rgb = C_SLATE_BODY
        r_desc.font.name = 'Arial'
        
        r_tgt = p2.add_run()
        r_tgt.text = f"Target: {target}"
        r_tgt.font.size = Pt(9.5)
        r_tgt.font.bold = True
        r_tgt.font.color.rgb = C_SLATE_DARK
        r_tgt.font.name = 'Arial'
        p2.space_before = Pt(2)

    return slide

def build_slide_7(prs):
    """Slide 7: Methodology: Design Science Research & Evolution"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Design Methodology", "Design Science Research Framework & Architectural Evolution",
               "Iterative design cycles and justified engineering transitions from interim proposal to delivered system.")
    add_footer(slide, 7)

    # Left Container: DSR Framework
    add_card(slide, 0.8, 1.7, 5.4, 5.15)
    add_card_header(slide, 0.8, 1.7, 5.4, "Design Science Research (Peffers et al., 2007)")
    dsr_steps = [
        ("1. Problem Identification", "15.42% national SEE science failure rate; commercial AI acts as an unearned answer dispenser."),
        ("2. Objective Definition", "Formulated 5 quantitative engineering benchmarks across retrieval, dialogue restraint, latency, and learning."),
        ("3. Design & Development", "Constructed 6-layer architecture, fine-tuned Qwen2.5-7B Merged SFT, and developed 135-node directed knowledge graph."),
        ("4. Demonstration", "Deployed interactive React 18 web laboratory and cross-platform Expo mobile app for student tutoring."),
        ("5. Evaluation", "100-query RAG precision test, 100-item smoke test, latency profiling, and N=20 controlled pilot user study."),
        ("6. Communication", "Comprehensive 6,600-word dissertation, reproducible open-source code, and academic defense.")
    ]
    add_bullet_list(slide, 1.0, 2.25, 5.0, 4.4, dsr_steps, font_size=10.5, space_after=6)

    # Right Container: Evolution Table
    add_card(slide, 6.45, 1.7, 6.083, 5.15)
    add_card_header(slide, 6.45, 1.7, 6.083, "Architectural Evolution: Interim vs. Delivered")
    
    evo_rows = [
        ("Vector Storage", "PostgreSQL / pgvector", "Chroma DB (embedded)", "Eliminated external daemon overhead; simplified local & cloud deployment."),
        ("Embeddings", "all-MiniLM-L6-v2 (384d)", "nomic-embed-text (768d)", "Higher semantic density for science texts; local execution without API dependency."),
        ("Retrieval", "Cosine similarity", "Hybrid + Lexical Reranker", "Vector-only search suffered low precision; reranking boosted P@3 to 0.873."),
        ("Tutor LLM", "LLaMA-3-8B LoRA", "Qwen2.5-7B Merged SFT", "Raw 8B caused OOM; fine-tuning 7B on dual T4s eliminated script collapse."),
        ("Constraint Engine", "DistilBERT Classifier", "turn_policy.py gating", "Classifier had high false-positive rejections; structural turn gating proved superior."),
        ("Mastery Calc", "Dense embedding cosine", "Token overlap + EWMA", "Eliminated secondary model inference on every turn, cutting latency 7.8s -> 3.3s.")
    ]
    
    for idx, (comp, prop, deliv, rat) in enumerate(evo_rows):
        top_r = 2.2 + idx * 0.74
        add_card(slide, 6.6, top_r, 5.78, 0.68, bg_color=C_WHITE, border_color=C_CARD_BORDER)
        
        tb = slide.shapes.add_textbox(Inches(6.75), Inches(top_r + 0.05), Inches(5.5), Inches(0.58))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p = tf.paragraphs[0]
        r1 = p.add_run()
        r1.text = f"{comp}: "
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = C_NAVY_PRIMARY
        r1.font.name = 'Arial'

        r2 = p.add_run()
        r2.text = f"{deliv} "
        r2.font.bold = True
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = C_SLATE_DARK
        r2.font.name = 'Arial'

        r3 = p.add_run()
        r3.text = f"(was: {prop})"
        r3.font.italic = True
        r3.font.size = Pt(9)
        r3.font.color.rgb = C_SLATE_MUTED
        r3.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.text = f"Rationale: {rat}"
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = C_SLATE_BODY
        p2.font.name = 'Arial'
        p2.space_before = Pt(2)

    return slide

def build_slide_8(prs):
    """Slide 8: End-to-End System Architecture"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "System Architecture", "Six-Layer Decoupled Engineering Architecture",
               "Modular pipeline decoupling offline curriculum ingestion, client presentation, orchestration, and GPU inference.")
    add_footer(slide, 8)

    # Left Container: Layer descriptions
    add_card(slide, 0.8, 1.7, 5.4, 5.15)
    add_card_header(slide, 0.8, 1.7, 5.4, "The Six Decoupled Functional Layers")
    
    layers = [
        ("Layer 1: Offline Ingestion", "PyMuPDF text extraction, OCR filter, 1200-char chunking, 768d nomic-embed-text vectors stored in Chroma DB."),
        ("Layer 2: Client Presentation", "React 18 / Vite Nebular UI (interactive desktop bench, prompt chips, teacher desk) and Expo Mobile client."),
        ("Layer 3: Orchestration Hub", "Asynchronous FastAPI gateway handling JWT auth, CORS, session state, and SQLite persistence."),
        ("Layer 4: Turn Policy & Retrieval", "Intent classification, Chroma top-12 vector retrieval, and lexical term candidate reranking."),
        ("Layer 5: Socratic Inference", "RunPod Serverless vLLM hosting fine-tuned Qwen2.5-7B Merged SFT (with ZeroGPU fallback)."),
        ("Layer 6: Knowledge Tracking", "135-node directed graph mapping, EWMA mastery smoothing, and automated 3-turn confusion alert logging.")
    ]
    add_bullet_list(slide, 1.0, 2.25, 5.0, 4.4, layers, font_size=10.5, space_after=7)

    # Right Container: High-Res Architecture Diagram
    add_card(slide, 6.45, 1.7, 6.083, 5.15, bg_color=C_WHITE)
    add_card_header(slide, 6.45, 1.7, 6.083, "End-to-End System Architecture Diagram")
    
    arch_img = "report_figures/fig_system_architecture.png"
    if os.path.exists(arch_img):
        slide.shapes.add_picture(arch_img, Inches(6.6), Inches(2.25), width=Inches(5.78))
        
        # Caption box underneath
        tb_c = slide.shapes.add_textbox(Inches(6.6), Inches(6.25), Inches(5.78), Inches(0.5))
        tf_c = tb_c.text_frame
        tf_c.word_wrap = True
        p_c = tf_c.paragraphs[0]
        p_c.text = "Figure 4.1: Six-layer decoupled architecture: client presentation, FastAPI gateway, 5-stage turn policy, Chroma vector store, and RunPod vLLM GPU inference."
        p_c.font.size = Pt(8.5)
        p_c.font.italic = True
        p_c.font.color.rgb = C_SLATE_MUTED
        p_c.font.name = 'Arial'

    return slide

def build_slide_9(prs):
    """Slide 9: Curriculum Ingestion & Hybrid RAG Pipeline"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Curriculum RAG", "Curriculum Ingestion & Hybrid Candidate Reranking",
               "Eliminating OCR noise and boilerplate reprint notices to ground Socratic inquiry in official CDC textbooks.")
    add_footer(slide, 9)

    # Left Container: Ingestion Pipeline
    add_card(slide, 0.8, 1.7, 5.7, 5.15)
    add_card_header(slide, 0.8, 1.7, 5.7, "Document Cleaning & Ingestion Pipeline")
    
    rag_steps = [
        ("Authoritative CDC Corpus", "Ingested 17 official digital textbook volumes from Nepal's Curriculum Development Centre (CDC), covering Class 10 Compulsory Science, Optional Science, and foundational Grade 9."),
        ("Scanned Non-OCR Exclusion", "Automated density checks flagged and rejected 2 scanned image PDFs (CDC2017, Part 1), eliminating unverified OCR garbage from the vector database."),
        ("Regex Boilerplate Stripping", "Removed running headers ('Optional Science Grade 10') and reprint notices appearing on >15% of pages to prevent false vector matches."),
        ("Recursive Chunking", "Segmented text into 1,200-character chunks (~300 tokens) with 200-character overlap, preserving complete scientific definitions and chemical equations."),
        ("Ollama Vector Embeddings", "Generated 768-dimensional dense embeddings using nomic-embed-text, indexed in persistent Chroma DB at backend/storage/chroma_db/.")
    ]
    add_bullet_list(slide, 1.0, 2.25, 5.3, 4.4, rag_steps, font_size=10.5, space_after=6)

    # Right Container: Hybrid Retrieval & Precision Figure
    add_card(slide, 6.833, 1.7, 5.7, 5.15, bg_color=C_WHITE)
    add_card_header(slide, 6.833, 1.7, 5.7, "Hybrid Retrieval & Precision@3 Benchmark")
    
    ret_img = "report_figures/fig_retrieval_precision.png"
    if os.path.exists(ret_img):
        slide.shapes.add_picture(ret_img, Inches(6.98), Inches(2.2), width=Inches(5.4))
    
    # Text summary below figure
    tb_r = slide.shapes.add_textbox(Inches(7.033), Inches(4.55), Inches(5.3), Inches(2.15))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    
    summary_items = [
        ("Candidate Generation", "Chroma ANN vector search retrieves expanded pool of top-12 candidates."),
        ("Lexical Reranker", "Reranks candidates based on non-stopword stem match + length penalty to select top-3 chunks."),
        ("Precision@3 Results", "Raw Vector (0.760) -> Boilerplate Stripped (0.817) -> Hybrid Reranked (0.873) -> Target >= 0.85 MET!"),
        ("Subject Breakdown", "Chemistry: 0.890 | Physics: 0.865 | Biology: 0.865.")
    ]
    add_bullet_list(slide, 7.033, 4.6, 5.3, 2.1, summary_items, font_size=9.5, space_after=4)
    return slide

def build_slide_10(prs):
    """Slide 10: Socratic Dialogue Engine & Turn Policy"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Pedagogical Policy", "Socratic Turn Policy & Cognitive Scaffolding Engine",
               "Deterministic multi-layer gating suppresses direct answers and forces reflective inquiry.")
    add_footer(slide, 10)

    # 3 Horizontal Cards Layout
    # Card 1: Pedagogical Philosophy
    add_card(slide, 0.8, 1.7, 3.64, 5.15)
    add_card_header(slide, 0.8, 1.7, 3.64, "1. Pedagogical Philosophy")
    philo_items = [
        ("The 'Socratic Oath'", "Never provide the direct answer; scaffold with guiding questions that lead the learner to deduce the solution independently."),
        ("Overcoming Answer Crutches", "Commercial AI creates an illusion of competence. Clariq demands cognitive effort, reinforcing durable memory schemas."),
        ("Cognitive Prompt Chips", "Interactive UI chips ('Give me a hint', 'Is my reasoning right?', 'What is the next step?') empower student agency."),
        ("Adaptive Scaffolding", "Adjusts cognitive load based on student responses, simplifying concepts when confusion is detected.")
    ]
    add_bullet_list(slide, 0.95, 2.25, 3.34, 4.4, philo_items, font_size=10, space_after=7)

    # Card 2: 5-Stage Policy Pipeline
    add_card(slide, 4.84, 1.7, 3.64, 5.15)
    add_card_header(slide, 4.84, 1.7, 3.64, "2. 5-Stage Policy Pipeline")
    pipeline_items = [
        ("Stage 1: Intent Routing", "Classifies turns into Science Inquiry, Meta-Dialogue, or Social/Identity chitchat."),
        ("Stage 2: RAG Context Assembly", "Injects top-3 reranked textbook chunks into strict Socratic system prompt."),
        ("Stage 3: LLM Inference", "Fine-tuned Qwen2.5-7B Merged SFT generates pedagogical response."),
        ("Stage 4: Structural Verification", "Deterministic regex checks verify terminal question mark ('?') and detect definitional assertion patterns."),
        ("Stage 5: Fallback Interception", "If the model leaks an answer, the response is overridden with a pedagogical counter-question.")
    ]
    add_bullet_list(slide, 4.99, 2.25, 3.34, 4.4, pipeline_items, font_size=10, space_after=6)

    # Card 3: Quantitative Discipline Impact
    add_card(slide, 8.88, 1.7, 3.64, 5.15)
    add_card_header(slide, 8.88, 1.7, 3.64, "3. Policy Discipline Impact")
    
    # 2 Mini KPI Callouts inside Card 3
    add_metric_callout(slide, 9.08, 2.25, 3.24, 1.1, "0%", "Direct Answer Dumps", "Down from 88% in commercial GPT-4o", C_GREEN)
    add_metric_callout(slide, 9.08, 3.5, 3.24, 1.1, "100%", "Guiding Inquiries ('?')", "Up from 22% in commercial GPT-4o", C_NAVY_PRIMARY)
    
    impact_items = [
        ("Zero Direct Leakage", "Across 100 development smoke items, Clariq 7B leaked 0 direct answers."),
        ("Robust Turn Gating", "Structural fallback ensures no student query terminates without a thought-provoking question.")
    ]
    add_bullet_list(slide, 9.08, 4.85, 3.24, 1.8, impact_items, font_size=9.5, space_after=4)
    return slide

def build_slide_11(prs):
    """Slide 11: Tutor Model Engineering: 4B Prototype to 7B Merged SFT"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Model Engineering", "Tutor Model Engineering & Resolving Script Collapse",
               "Scaling training data to 606 dialogues and consolidating weights via SFT LoRA on dual T4 GPUs.")
    add_footer(slide, 11)

    # Left Container: Engineering Evolution
    add_card(slide, 0.8, 1.7, 5.7, 5.15)
    add_card_header(slide, 0.8, 1.7, 5.7, "Dataset Development & Architecture Evolution")
    
    model_items = [
        ("Dataset Expansion", "Expanded training corpus from 54 initial seed skits to 606 curated multi-turn Socratic dialogues (4,628 turns) in datasets/socratic_dataset.jsonl across Physics, Chemistry, and Biology."),
        ("Prototype 1: Qwen3-4B LoRA", "Fine-tuned 4B parameter model on RunPod. Successfully lifted guiding questions to 96% and reduced leakage to 4%."),
        ("Failure Mode: Script Collapse", "Due to parameter capacity bottlenecks, the 4B model suffered 14 script collapse flags—repetitively reciting memorized optical prism skits on broad conceptual probes."),
        ("Production: Qwen2.5-7B Merged SFT", "Fine-tuned Qwen2.5-7B-Instruct using Supervised Fine-Tuning (SFT) LoRA on dual NVIDIA T4 GPUs; merged weights via merge_and_unload into a standalone model."),
        ("High-Throughput Serving", "Deployed on RunPod Serverless vLLM with PagedAttention, achieving 0 script collapse, 0% leakage, and 100% guiding inquiries.")
    ]
    add_bullet_list(slide, 1.0, 2.25, 5.3, 4.4, model_items, font_size=10.5, space_after=6)

    # Right Container: Model Smoke Comparison Figure
    add_card(slide, 6.833, 1.7, 5.7, 5.15, bg_color=C_WHITE)
    add_card_header(slide, 6.833, 1.7, 5.7, "100-Item Model Smoke Benchmark Comparison")
    
    smoke_img = "report_figures/fig_model_smoke_comparison.png"
    if os.path.exists(smoke_img):
        slide.shapes.add_picture(smoke_img, Inches(6.98), Inches(2.2), width=Inches(5.4))
    
    # Key comparison callouts below
    add_metric_callout(slide, 7.033, 4.95, 2.5, 1.7, "0", "Script Collapse", "4B Raw had 14 flags; 7B Merged completely resolved collapse", C_GREEN)
    add_metric_callout(slide, 9.833, 4.95, 2.5, 1.7, "92%", "Topical Alignment", "High curriculum adherence without losing scientific depth", C_NAVY_PRIMARY)
    return slide

def build_slide_12(prs):
    """Slide 12: Adaptive Knowledge Graph & Mastery Telemetry"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Knowledge Graph", "Adaptive Knowledge Graph & Formative Mastery Telemetry",
               "135-node curriculum topology, token-overlap scoring, and automated 3-turn confusion detection.")
    add_footer(slide, 12)

    # Left Container: Mathematical Formulation
    add_card(slide, 0.8, 1.7, 5.7, 5.15)
    add_card_header(slide, 0.8, 1.7, 5.7, "Graph Topology & Mastery Formulation")
    
    kg_items = [
        ("Curriculum Topology", "Directed graph G = (V, E) comprising |V| = 135 concepts (45 Physics, 50 Chemistry, 40 Biology) connected by |E| = 99 prerequisite dependencies mapped from the SEE syllabus."),
        ("Turn Scoring Formula", "s_t = sim(u_student, u_curriculum) * γ_coherence\nWhere sim(·) is Jaccard overlap of non-stop-word tokens against active concept node labels and aliases."),
        ("Coherence Penalty (γ)", "Penalizes fragmentation (γ = 0.30 if length < 5 words) and rote copying (γ = 0.50 if overlap > 0.85); valid formulations receive γ = 1.00."),
        ("EWMA Mastery Update", "m_{t+1} = m_t + α(s_t - m_t), with smoothing factor α = 0.25 and neutral prior m_0 = 0.50.\n• Mastered: m_t >= 0.75 | In Progress: 0.40 <= m_t < 0.75 | Struggling: m_t < 0.40."),
        ("Automated Confusion Alert", "Three consecutive turns recording s_t < 0.40 triggers a CONFUSION_EVENT logged in users.sqlite3, surfacing an immediate teacher diagnostic alert.")
    ]
    add_bullet_list(slide, 1.0, 2.25, 5.3, 4.4, kg_items, font_size=10, space_after=5)

    # Right Container: Mastery Simulation Figure
    add_card(slide, 6.833, 1.7, 5.7, 5.15, bg_color=C_WHITE)
    add_card_header(slide, 6.833, 1.7, 5.7, "Mastery Telemetry Simulation & Diagnostic Alert")
    
    kg_img = "report_figures/fig_mastery_simulation.png"
    if os.path.exists(kg_img):
        slide.shapes.add_picture(kg_img, Inches(6.98), Inches(2.2), width=Inches(5.4))
    
    # Simulation walkthrough box below
    tb_sim = slide.shapes.add_textbox(Inches(7.033), Inches(5.0), Inches(5.3), Inches(1.7))
    tf_s = tb_sim.text_frame
    tf_s.word_wrap = True
    sim_items = [
        ("Synthetic Multi-Turn Validation", "Validated via simulated dialogue on 'Solubility of Bases': student scored s1=0.22, s2=0.31, s3=0.28."),
        ("EWMA Trajectory", "Mastery dropped from m0=0.50 -> 0.430 -> 0.400 -> 0.370 (< 0.40 threshold)."),
        ("Diagnostic Trigger", "Successfully logged CONFUSION_EVENT and flagged student on teacher desk.")
    ]
    add_bullet_list(slide, 7.033, 5.0, 5.3, 1.7, sim_items, font_size=9.5, space_after=4)
    return slide

def build_slide_13(prs):
    """Slide 13: Client Application Ecosystem"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Client Applications", "Cross-Platform User Ecosystem: Web & Mobile Applications",
               "Responsive React 18 / Vite Nebular Lab desktop suite, teacher supervision desk, and Expo mobile client.")
    add_footer(slide, 13)

    # 3 Visual Cards Side-by-Side
    # Column 1: Web Tutoring Bench
    add_card(slide, 0.8, 1.7, 4.2, 5.15, bg_color=C_WHITE)
    add_card_header(slide, 0.8, 1.7, 4.2, "Student Web Tutoring Bench (React 18)")
    chat_img = "report_figures/fig_ui_chat_desktop.png"
    if os.path.exists(chat_img):
        slide.shapes.add_picture(chat_img, Inches(0.95), Inches(2.2), width=Inches(3.9))
    col1_items = [
        ("Nebular Lab UI", "Immersive dark interface designed for secondary science learners."),
        ("Turn Taking & Chips", "Active session timeline, cognitive prompt chips, and strict turn gating."),
        ("Multi-Turn Socratic Flow", "Guides learners on chemical reactions without answer leakage.")
    ]
    add_bullet_list(slide, 0.95, 4.4, 3.9, 2.3, col1_items, font_size=9.5, space_after=4)

    # Column 2: Teacher Diagnostic Desk
    add_card(slide, 5.2, 1.7, 4.2, 5.15, bg_color=C_WHITE)
    add_card_header(slide, 5.2, 1.7, 4.2, "Teacher Diagnostic Supervision Desk")
    desk_img = "report_figures/fig_ui_teacher_desk.png"
    if os.path.exists(desk_img):
        slide.shapes.add_picture(desk_img, Inches(5.35), Inches(2.2), width=Inches(3.9))
    col2_items = [
        ("Classroom Learning Analytics", "Summarized concept mastery trends without demanding raw log parsing."),
        ("Weak Topic Heatmaps", "Aggregates struggling nodes across Physics, Chemistry, and Biology."),
        ("Confusion Alert Feed", "Real-time flags highlighting students requiring human intervention.")
    ]
    add_bullet_list(slide, 5.35, 4.4, 3.9, 2.3, col2_items, font_size=9.5, space_after=4)

    # Column 3: Expo Mobile Client
    add_card(slide, 9.6, 1.7, 2.933, 5.15, bg_color=C_WHITE)
    add_card_header(slide, 9.6, 1.7, 2.933, "Expo Mobile Client (React Native)")
    mob_img = "report_figures/fig_ui_mobile_app.png"
    if os.path.exists(mob_img):
        slide.shapes.add_picture(mob_img, Inches(10.15), Inches(2.2), height=Inches(2.5))
    col3_items = [
        ("Smartphone Tutoring", "Cross-platform mobile client for Android & iOS."),
        ("Inquiry Streaks", "Daily science streaks and bite-sized learning cards."),
        ("Low-Bandwidth Mode", "Optimized payload size for mobile networks.")
    ]
    add_bullet_list(slide, 9.75, 4.85, 2.65, 1.85, col3_items, font_size=9, space_after=3)
    return slide

def build_slide_14(prs):
    """Slide 14: Objective 1 & 2 Evaluation: Retrieval Precision & 100-Item Smoke Benchmark"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Experimental Evaluation", "Objective 1 & 2: Curriculum RAG & Smoke Benchmarking",
               "Benchmarking retrieval precision across 100 queries and evaluating dialogue restraint across 100 stress items.")
    add_footer(slide, 14)

    # Left Container: Objective 1 (Retrieval Precision)
    add_card(slide, 0.8, 1.7, 5.7, 5.15)
    add_card_header(slide, 0.8, 1.7, 5.7, "Objective 1: Curriculum RAG Benchmarking")
    
    # 2 Mini Metric Boxes
    add_metric_callout(slide, 1.0, 2.25, 2.5, 1.15, "0.873", "Precision@3 (Hybrid)", "Target >= 0.85 MET (+11.3% over raw vector)", C_GREEN)
    add_metric_callout(slide, 3.8, 2.25, 2.5, 1.15, "100 Queries", "300 Blind Judgments", "Evaluated across Chem, Physics, and Biology", C_NAVY_PRIMARY)
    
    rag_eval_items = [
        ("Pipeline Evolution", "Raw Cosine Vector: 0.760 -> Boilerplate Stripped: 0.817 -> Hybrid Reranked: 0.873."),
        ("Domain Breakdown", "Chemistry: 0.890 | Physics: 0.865 | Biology: 0.865."),
        ("Lexical Reranker Impact", "Eliminated semantic confusion on technical terms (e.g. isotope vs covalent bond), ensuring accurate textbook context retrieval.")
    ]
    add_bullet_list(slide, 1.0, 3.65, 5.3, 3.0, rag_eval_items, font_size=10.5, space_after=6)

    # Right Container: Objective 2 (100-Item Smoke Benchmark Table)
    add_card(slide, 6.833, 1.7, 5.7, 5.15)
    add_card_header(slide, 6.833, 1.7, 5.7, "Objective 2: 100-Item Model Smoke Benchmark")
    
    # Comparative Table
    table_shape = slide.shapes.add_table(7, 5, Inches(6.98), Inches(2.25), Inches(5.4), Inches(2.7))
    table = table_shape.table
    table.columns[0].width = Inches(2.0)
    table.columns[1].width = Inches(0.85)
    table.columns[2].width = Inches(0.85)
    table.columns[3].width = Inches(0.85)
    table.columns[4].width = Inches(0.85)

    headers = ["Metric", "GPT-4o", "4B Raw", "4B RAG", "7B Merged"]
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_NAVY_PRIMARY
        p = cell.text_frame.paragraphs[0]
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

    rows = [
        ("Direct Answer Dumps", "88%", "4%", "2%", "0%"),
        ("Guides with Inquiry ('?')", "22%", "96%", "98%", "100%"),
        ("Curriculum Alignment", "98%", "86%", "89%", "92%"),
        ("Misconceptions Challenged", "95%", "80%", "85%", "80%"),
        ("Script Collapse Flags", "0", "14", "6", "0"),
        ("Topic Switch Failures", "2", "18", "11", "12")
    ]

    for r_idx, row in enumerate(rows):
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx + 1, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(8.5)
            if c_idx == 4:
                p.font.bold = True
                p.font.color.rgb = C_GREEN if val in ["0%", "100%", "0"] else C_NAVY_PRIMARY
            else:
                p.font.color.rgb = C_SLATE_DARK

    # Summary underneath
    smoke_summary = [
        ("Commercial GPT-4o Hazard", "Dumps answers on 88% of queries; fails as a pedagogical mentor."),
        ("7B Merged SFT Mastery", "Achieved 0% answer dumps, 100% guiding inquiries, and completely eliminated script collapse, meeting all Objective 2 targets.")
    ]
    add_bullet_list(slide, 7.033, 5.2, 5.3, 1.5, smoke_summary, font_size=9.5, space_after=4)
    return slide

def build_slide_15(prs):
    """Slide 15: Objective 3 Evaluation: Latency & Concurrency Profiling"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Performance Profiling", "Objective 3: System Latency & Concurrency Profiling",
               "Evaluating response times across free-tier ZeroGPU and production RunPod Serverless vLLM.")
    add_footer(slide, 15)

    # Left Container: Latency Profiling Findings
    add_card(slide, 0.8, 1.7, 5.7, 5.15)
    add_card_header(slide, 0.8, 1.7, 5.7, "Latency Benchmarks & Concurrency Profile")
    
    # 2 Metric Boxes
    add_metric_callout(slide, 1.0, 2.25, 2.5, 1.15, "3.31 s", "Median Warm Latency", "Sequential Free Tier (ZeroGPU) -> Target <= 5.0s MET", C_GREEN)
    add_metric_callout(slide, 3.8, 2.25, 2.5, 1.15, "6.66 s", "Concurrent Median", "RunPod Serverless vLLM under 10 active concurrent users", C_ORANGE)
    
    lat_items = [
        ("Sequential Operational Latency", "Hugging Face ZeroGPU achieved median latency of 3.31s (P95: 4.88s), successfully meeting the project's <= 5.0s warm response target."),
        ("Concurrency Load Profiling", "Under 10 simultaneous user queries on RunPod Serverless vLLM, median operational latency scaled to 6.66s (8.46s wall-clock)."),
        ("Sub-Component Latency Breakdown", "• Turn Policy Intent Routing: 12 ms\n• Chroma Vector ANN Search: 45 ms\n• Lexical Reranker & Context Assembly: 8 ms\n• vLLM GPU Generation: ~3,245 ms"),
        ("Cold Start Analysis", "Serverless GPU container boot requires 22–45s; addressed via warm container keep-alives and Server-Sent Event (SSE) token streaming.")
    ]
    add_bullet_list(slide, 1.0, 3.65, 5.3, 3.0, lat_items, font_size=10, space_after=5)

    # Right Container: Latency & Concurrency Figure
    add_card(slide, 6.833, 1.7, 5.7, 5.15, bg_color=C_WHITE)
    add_card_header(slide, 6.833, 1.7, 5.7, "Latency & Concurrency Profiling Plots")
    
    lat_img = "report_figures/fig_latency_concurrency.png"
    if os.path.exists(lat_img):
        slide.shapes.add_picture(lat_img, Inches(6.98), Inches(2.2), width=Inches(5.4))
    
    # Takeaways below
    eng_takeaways = [
        ("Deployment Strategy", "Maintained dual infrastructure: RunPod Serverless vLLM for high-throughput production and ZeroGPU for open public demonstration."),
        ("Optimization Insight", "Replacing dense embedding cosine mastery with token-overlap Jaccard cut per-turn latency from 7.8s to 3.3s, a 57.7% reduction.")
    ]
    add_bullet_list(slide, 7.033, 4.95, 5.3, 1.8, eng_takeaways, font_size=9.5, space_after=4)
    return slide

def build_slide_16(prs):
    """Slide 16: Objective 5 Evaluation: Controlled Empirical Pilot Study"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Empirical User Study", "Objective 5: Controlled Empirical Pilot Evaluation (N=20)",
               "Between-subjects trial comparing Clariq Socratic AI Tutor vs. CDC Textbook Self-Study on Acids & Bases.")
    add_footer(slide, 16)

    # 3 Big Result Metric Callouts at Top
    add_metric_callout(slide, 0.8, 1.7, 3.6, 1.25, "+2.80 vs +1.20", "Mean Learning Gain (Δ)", "Clariq gained +2.80 vs Textbook +1.20 (t=6.656, p < 0.0001*)", C_GREEN)
    add_metric_callout(slide, 4.866, 1.7, 3.6, 1.25, "34.8% Less Time", "Study Time Reduction", "8.35 min vs 12.80 min (t=-13.93, p < 0.0001* -> Target >= 30% MET)", C_NAVY_PRIMARY)
    add_metric_callout(slide, 8.933, 1.7, 3.6, 1.25, "88.8 / 100", "System Usability Scale (SUS)", "'Excellent' Adjective Rating (>90th Percentile -> Target >= 70 MET)", C_PURPLE)

    # Left Container: Protocol & Statistical Findings
    add_card(slide, 0.8, 3.15, 5.7, 3.7)
    add_card_header(slide, 0.8, 3.15, 5.7, "Pilot Protocol & Statistical Findings")
    
    pilot_items = [
        ("Experimental Design", "N = 20 Class 10 SEE students in Nepal (ages 15–16), randomized into Condition A (Clariq AI Tutor, n=10) and Condition B (Textbook Self-Study, n=10)."),
        ("Topic Evaluated", "Class 10 Chemistry Chapter 9: Chemical Acids, Bases, and Salts (specifically distinguishing alkalis vs. bases)."),
        ("Baseline Equivalence", "Pre-test scores were equivalent (1.90 vs. 2.00, t = -0.318, p = 0.7505), confirming no prior knowledge bias between cohorts."),
        ("Post-Test Comprehension", "Clariq scored 4.70/5.0 vs. Textbook 3.20/5.0 (t = 5.960, p = 1.25e-5, large effect size Cohen's d = 2.666)."),
        ("Methodological Caution", "Large effect size reflects immediate post-test on a 5-item assessment with N=20; indicates strong initial inquiry acquisition, not proof of permanent retention.")
    ]
    add_bullet_list(slide, 1.0, 3.7, 5.3, 3.0, pilot_items, font_size=10, space_after=4)

    # Right Container: 4-Panel User Study Plots
    add_card(slide, 6.833, 3.15, 5.7, 3.7, bg_color=C_WHITE)
    add_card_header(slide, 6.833, 3.15, 5.7, "Empirical Pilot Study Distributions (Figure 6.4)")
    
    study_img = "report_figures/fig_user_study_results.png"
    if os.path.exists(study_img):
        # 3300 x 2550 -> aspect 1.294. Height 3.05" gives width 3.95"
        slide.shapes.add_picture(study_img, Inches(7.7), Inches(3.62), height=Inches(3.05))
    return slide

def build_slide_17(prs):
    """Slide 17: Challenges Encountered, Failures & Lessons Learned"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Challenges & Lessons", "Engineering Challenges, System Failures & Lessons Learned",
               "Honest evaluation of technical obstacles encountered and pragmatic engineering resolutions.")
    add_footer(slide, 17)

    # 4 Cards Grid (2x2)
    # Card 1: Script Collapse
    add_card(slide, 0.8, 1.7, 5.7, 2.45)
    add_card_header(slide, 0.8, 1.7, 5.7, "1. Script Collapse & Model Bottlenecks", bg_color=C_ORANGE)
    c1_items = [
        ("The Failure", "Early Qwen3-4B LoRA memorized narrow training templates, repeatedly reciting optical prism skits on broad conceptual queries (14 collapse flags)."),
        ("The Solution", "Expanded dataset from 54 to 606 dialogues (4,628 turns), scaled to Qwen2.5-7B, and merged LoRA weights via merge_and_unload (0 collapse flags).")
    ]
    add_bullet_list(slide, 1.0, 2.2, 5.3, 1.8, c1_items, font_size=10.5, space_after=5)

    # Card 2: Short-Prompt Retrieval
    add_card(slide, 6.833, 1.7, 5.7, 2.45)
    add_card_header(slide, 6.833, 1.7, 5.7, "2. Retrieval Failures on Brief Prompts", bg_color=C_NAVY_PRIMARY)
    c2_items = [
        ("The Failure", "One-word student queries (e.g. 'Acid', 'Why?') lacked semantic density, causing standard vector search to retrieve irrelevant chapters."),
        ("The Solution", "Implemented query rewriting incorporating recent conversational context, combined with candidate lexical reranking to boost Precision@3 to 0.873.")
    ]
    add_bullet_list(slide, 7.033, 2.2, 5.3, 1.8, c2_items, font_size=10.5, space_after=5)

    # Card 3: Infrastructure Quotas
    add_card(slide, 0.8, 4.35, 5.7, 2.5)
    add_card_header(slide, 0.8, 4.35, 5.7, "3. Infrastructure Dependencies & Rate Limits", bg_color=C_NAVY_PRIMARY)
    c3_items = [
        ("The Failure", "Free ZeroGPU instances experienced 60s quota drops during stress testing, disrupting continuous multi-turn student dialogues."),
        ("The Solution", "Architected dual deployment: RunPod Serverless vLLM for high-throughput production evaluation, with ZeroGPU kept for open public demonstration.")
    ]
    add_bullet_list(slide, 1.0, 4.85, 5.3, 1.9, c3_items, font_size=10.5, space_after=5)

    # Card 4: Telemetry Hygiene
    add_card(slide, 6.833, 4.35, 5.7, 2.5)
    add_card_header(slide, 6.833, 4.35, 5.7, "4. Evaluation Telemetry Logging Hygiene", bg_color=C_PURPLE)
    c4_items = [
        ("The Reality", "Live student graph updates were not persisted to SQLite during the N=20 pilot study to avoid local file locking conflicts under unstandardized environments."),
        ("The Honest Reporting", "Graph telemetry was validated computationally via automated synthetic simulations, maintaining transparent academic reporting.")
    ]
    add_bullet_list(slide, 7.033, 4.85, 5.3, 1.9, c4_items, font_size=10.5, space_after=5)
    return slide

def build_slide_18(prs):
    """Slide 18: Critical Evaluation: Status Against Planned Objectives"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Critical Evaluation", "Status Against Planned Objectives & Threats to Validity",
               "Systematic verification matrix across all five formal deliverables and study limitations.")
    add_footer(slide, 18)

    # Left Container: Objectives Verification Matrix
    add_card(slide, 0.8, 1.7, 6.4, 5.15)
    add_card_header(slide, 0.8, 1.7, 6.4, "Objectives Verification Matrix (Table 8.1 in Dissertation)")
    
    matrix_rows = [
        ("Obj 1: Curriculum RAG", "P@3 >= 0.85 across 100 queries", "Achieved 0.873 (+11.3% gain)", "MET", C_GREEN),
        ("Obj 2: Socratic Model", "<= 5% leakage; 0 script collapse", "0% leakage; 0 collapse; 100% questions", "MET", C_GREEN),
        ("Obj 3: System Latency", "Warm latency <= 5.0s", "3.31s sequential; 6.66s concurrent", "MET / BORDERLINE", C_ORANGE),
        ("Obj 4: Knowledge Graph", "135 nodes, EWMA tracking", "135 nodes; 99 edges; simulated EWMA", "PROTOTYPE DELIVERED", C_NAVY_PRIMARY),
        ("Obj 5: User Pilot Study", ">= 30% time saved; SUS >= 70", "34.8% time saved; +2.80 gain; SUS 88.8", "PILOT COMPLETED", C_GREEN)
    ]
    
    for idx, (obj, tgt, ach, status, col) in enumerate(matrix_rows):
        top_y = 2.2 + idx * 0.86
        add_card(slide, 0.95, top_y, 6.1, 0.8, bg_color=C_WHITE, border_color=C_CARD_BORDER)
        
        # Status Badge on right
        sb = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.3), Inches(top_y + 0.1), Inches(1.65), Inches(0.28))
        sb.fill.solid()
        sb.fill.fore_color.rgb = col
        sb.line.color.rgb = col
        p_sb = sb.text_frame.paragraphs[0]
        p_sb.text = status
        p_sb.font.size = Pt(8.5)
        p_sb.font.bold = True
        p_sb.font.color.rgb = C_WHITE
        p_sb.alignment = PP_ALIGN.CENTER
        
        # Details text
        tb = slide.shapes.add_textbox(Inches(1.05), Inches(top_y + 0.08), Inches(4.2), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = obj
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = C_NAVY_PRIMARY
        p1.font.name = 'Arial'

        p2 = tf.add_paragraph()
        p2.text = f"Target: {tgt}  ->  {ach}"
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = C_SLATE_BODY
        p2.font.name = 'Arial'
        p2.space_before = Pt(2)

    # Right Container: Threats to Validity
    add_card(slide, 7.45, 1.7, 5.083, 5.15)
    add_card_header(slide, 7.45, 1.7, 5.083, "Threats to Validity & Methodological Constraints")
    threat_items = [
        ("Internal Validity (Horizon)", "Immediate post-test measures short-term comprehension rather than long-term delayed retention; novelty effects may heighten initial engagement."),
        ("External Validity (Breadth)", "Pilot tested a single chemistry topic (Acids & Bases); generalizability across all 135 curriculum concepts requires multi-school longitudinal trials."),
        ("Construct Validity (Testing)", "Multiple-choice pre/post instruments provide standardized grading but do not fully assess spontaneous reasoning or practical experimental skills."),
        ("Telemetry Heuristics", "Token overlap acts as a lightweight proxy for understanding; semantic nuance and complex misconceptions require human validation.")
    ]
    add_bullet_list(slide, 7.65, 2.25, 4.7, 4.4, threat_items, font_size=10, space_after=6)
    return slide

def build_slide_19(prs):
    """Slide 19: Legal, Social, Ethical & Professional (LSEP) Considerations"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "LSEP Governance", "Legal, Social, Ethical & Professional (LSEP) Considerations",
               "Responsible engineering governance for educational AI artifacts deployed for secondary school minors.")
    add_footer(slide, 19)

    # 4 Cards Grid (2x2)
    # Card 1: Legal & IP
    add_card(slide, 0.8, 1.7, 5.7, 2.45)
    add_card_header(slide, 0.8, 1.7, 5.7, "1. Legal Framework & Intellectual Property")
    l1_items = [
        ("Educational Fair Dealing", "CDC textbooks utilized strictly under educational research provisions of the Nepal Copyright Act 2059 (Sections 16 & 18) and UK CDPA 1988."),
        ("Open-Weight Licensing", "Underlying tutor fine-tuned from Qwen2.5-7B-Instruct under permissive Apache 2.0 license; non-commercial open research distribution.")
    ]
    add_bullet_list(slide, 1.0, 2.2, 5.3, 1.8, l1_items, font_size=10.5, space_after=5)

    # Card 2: Social Equity
    add_card(slide, 6.833, 1.7, 5.7, 2.45)
    add_card_header(slide, 6.833, 1.7, 5.7, "2. Social Equity & Educational Access")
    l2_items = [
        ("Bridging the Educational Divide", "Democratizes high-quality 1-on-1 tutoring, addressing the severe resource divide between urban private coaching and rural public schools."),
        ("Low-Bandwidth Optimization", "Engineered lightweight JSON payloads and client-side caching to ensure reliability over intermittent rural network connections.")
    ]
    add_bullet_list(slide, 7.033, 2.2, 5.3, 1.8, l2_items, font_size=10.5, space_after=5)

    # Card 3: Ethical Governance & Minors
    add_card(slide, 0.8, 4.35, 5.7, 2.5)
    add_card_header(slide, 0.8, 4.35, 5.7, "3. Ethical Governance & Minor Protection")
    l3_items = [
        ("Protection of Minors (Ages 15-16)", "Voluntary student assent and parental awareness; full pseudonymisation (P01–P20); zero personal identifiable information (PII) logged."),
        ("Cognitive Ethics & Agency", "Socratic turn gating prevents over-reliance on generative AI, preserving learners' independent critical thinking and cognitive agency.")
    ]
    add_bullet_list(slide, 1.0, 4.85, 5.3, 1.9, l3_items, font_size=10.5, space_after=5)

    # Card 4: Professional Standards
    add_card(slide, 6.833, 4.35, 5.7, 2.5)
    add_card_header(slide, 6.833, 4.35, 5.7, "4. Professional Standards (BCS & ACM Codes)")
    l4_items = [
        ("Software Engineering Rigor", "Adherence to BCS Code of Conduct: modular decoupled architecture, defensive exception handling, and reproducible evaluation testbeds."),
        ("Scientific Honesty", "Transparent disclosure of study limitations, sample size constraints, and acknowledgment of simulated graph telemetry.")
    ]
    add_bullet_list(slide, 7.033, 4.85, 5.3, 1.9, l4_items, font_size=10.5, space_after=5)
    return slide

def build_slide_20(prs):
    """Slide 20: Conclusion, Future Roadmap & Defense Q&A"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Conclusion & Roadmap", "Conclusion, Future Research Roadmap & Defense Q&A",
               "Summary of core scientific contributions and future expansion for national educational impact.")
    add_footer(slide, 20)

    # Left Container: Core Scientific Contributions
    add_card(slide, 0.8, 1.7, 5.7, 4.15)
    add_card_header(slide, 0.8, 1.7, 5.7, "Core Project Scientific Contributions")
    contrib_items = [
        ("First National Socratic AI Tutor", "Designed and validated the first curriculum-grounded Socratic tutor specifically tailored for Nepal's Class 10 SEE Science examination."),
        ("Elimination of Answer Leakage", "Proved that fine-tuning (Qwen2.5-7B Merged SFT) and structural turn policies suppress answer dumps from 88% (GPT-4o) to 0% with 100% guiding inquiry."),
        ("Empirical Comprehension Gains", "Demonstrated significant pilot score improvements (+2.80 vs. +1.20) and a 34.8% reduction in study time with an 88.8 SUS rating."),
        ("Formative Knowledge Graph", "Engineered an adaptive 135-node curriculum graph with EWMA telemetry and automated confusion flagging for classroom teachers.")
    ]
    add_bullet_list(slide, 1.0, 2.25, 5.3, 3.4, contrib_items, font_size=10.5, space_after=6)

    # Right Container: Strategic Future Roadmap
    add_card(slide, 6.833, 1.7, 5.7, 4.15)
    add_card_header(slide, 6.833, 1.7, 5.7, "Strategic Future Research Roadmap")
    roadmap_items = [
        ("1. Recursive Conversational Memory", "Implement recursive graph state tracking to retain student reasoning context across extended multi-session tutoring dialogues."),
        ("2. Formal Teacher Panel Validation", "Convene expert science teachers to compute inter-rater agreement (Cohen's κ) on knowledge graph prerequisite edges."),
        ("3. Longitudinal Multi-School Trials", "Deploy across rural and urban community schools, measuring delayed retention over 6-week and 12-week study intervals."),
        ("4. Edge Model Quantization", "Deploy GGUF-quantized models (e.g. 3B/7B) locally on low-cost offline tablets for off-grid Himalayan classrooms.")
    ]
    add_bullet_list(slide, 7.033, 2.25, 5.3, 3.4, roadmap_items, font_size=10.5, space_after=6)

    # Bottom Banner: Acknowledgements & Q&A Callout
    add_card(slide, 0.8, 6.0, 11.733, 0.9, bg_color=C_NAVY_DARK, border_color=C_NAVY_PRIMARY)
    tb_qa = slide.shapes.add_textbox(Inches(1.0), Inches(6.05), Inches(11.333), Inches(0.78))
    tf_qa = tb_qa.text_frame
    tf_qa.word_wrap = True
    
    p_q1 = tf_qa.paragraphs[0]
    p_q1.text = "ACKNOWLEDGEMENTS & DEFENSE Q&A"
    p_q1.font.size = Pt(10)
    p_q1.font.bold = True
    p_q1.font.color.rgb = C_BLUE_ACCENT
    p_q1.font.name = 'Arial'

    p_q2 = tf_qa.add_paragraph()
    p_q2.text = "Sincere gratitude to project supervisor Rupak Koirala, the BCU Faculty of Computing, participating educators, and students.  |  Thank you — Questions & Discussion Welcomed."
    p_q2.font.size = Pt(11)
    p_q2.font.bold = True
    p_q2.font.color.rgb = C_WHITE
    p_q2.font.name = 'Arial'
    p_q2.space_before = Pt(2)

    return slide

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

def main():
    print("Initializing 16:9 Presentation Canvas...")
    prs = create_presentation()

    print("Building Slide 1: Cover / Title Slide...")
    build_slide_1(prs)

    print("Building Slide 2: Executive Summary & National Problem Context...")
    build_slide_2(prs)

    print("Building Slide 3: Research Questions & Theoretical Alignment...")
    build_slide_3(prs)

    print("Building Slide 4: Project Aims, Scope Boundaries & Delimitations...")
    build_slide_4(prs)

    print("Building Slide 5: Literature Review & Theoretical Foundations...")
    build_slide_5(prs)

    print("Building Slide 6: Formal Project Objectives & Quantitative Targets...")
    build_slide_6(prs)

    print("Building Slide 7: Design Science Research & Architectural Evolution...")
    build_slide_7(prs)

    print("Building Slide 8: End-to-End System Architecture...")
    build_slide_8(prs)

    print("Building Slide 9: Curriculum Ingestion & Hybrid RAG Pipeline...")
    build_slide_9(prs)

    print("Building Slide 10: Socratic Dialogue Engine & Turn Policy...")
    build_slide_10(prs)

    print("Building Slide 11: Tutor Model Engineering (4B Prototype to 7B Merged SFT)...")
    build_slide_11(prs)

    print("Building Slide 12: Adaptive Knowledge Graph & Mastery Telemetry...")
    build_slide_12(prs)

    print("Building Slide 13: Client Application Ecosystem (Web & Mobile)...")
    build_slide_13(prs)

    print("Building Slide 14: Objective 1 & 2 Evaluation (RAG Precision & Smoke Benchmark)...")
    build_slide_14(prs)

    print("Building Slide 15: Objective 3 Evaluation (Latency & Concurrency Profiling)...")
    build_slide_15(prs)

    print("Building Slide 16: Objective 5 Evaluation (Controlled Empirical Pilot Study)...")
    build_slide_16(prs)

    print("Building Slide 17: Challenges Encountered, Failures & Lessons Learned...")
    build_slide_17(prs)

    print("Building Slide 18: Critical Evaluation (Status Against Planned Objectives)...")
    build_slide_18(prs)

    print("Building Slide 19: Legal, Social, Ethical & Professional (LSEP) Considerations...")
    build_slide_19(prs)

    print("Building Slide 20: Conclusion, Future Roadmap & Defense Q&A...")
    build_slide_20(prs)

    output_filename = "Clariq_Final_Project_Presentation.pptx"
    prs.save(output_filename)
    print(f"Presentation successfully created and saved to: {output_filename}")
    print(f"Total Slides: {len(prs.slides)}")

if __name__ == "__main__":
    main()
