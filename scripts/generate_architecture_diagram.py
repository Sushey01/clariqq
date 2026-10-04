import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

def create_diagram():
    fig, ax = plt.subplots(figsize=(16, 11), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    
    bg_color = "#f8fafc"
    fig.patch.set_facecolor(bg_color)
    ax.set_facecolor(bg_color)
    
    # Palette
    c_blue = "#1e3a8a"       # Navy primary
    c_client = "#2563eb"     # Royal blue
    c_gateway = "#059669"    # Emerald green
    c_rag = "#d97706"        # Amber
    c_policy = "#334155"     # Slate dark
    c_model = "#7e22ce"      # Purple
    c_kg = "#0f766e"         # Teal
    c_teacher = "#0284c7"    # Sky blue
    
    def draw_container(x, y, w, h, title, fill_color, border_color):
        # Outer container box
        box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1.2",
                             facecolor=fill_color, edgecolor=border_color,
                             linewidth=1.2, linestyle='--', alpha=0.9, zorder=1)
        ax.add_patch(box)
        
        # Clean colored header banner inside the container
        banner = FancyBboxPatch((x + 0.8, y + h - 3.2), w - 1.6, 2.5,
                                boxstyle="round,pad=0.2,rounding_size=0.6",
                                facecolor=border_color, edgecolor="none", zorder=2)
        ax.add_patch(banner)
        ax.text(x + w/2.0, y + h - 2.0, title.upper(), fontsize=8.2, fontweight='bold',
                color="#ffffff", ha='center', va='center', family='sans-serif', zorder=3)

    def draw_card(x, y, w, h, title, subtitle, fill_c, border_c, text_c="#ffffff", zorder=4):
        # Drop shadow
        shadow = FancyBboxPatch((x + 0.35, y - 0.35), w, h, boxstyle="round,pad=0.35,rounding_size=0.8",
                                facecolor="#cbd5e1", edgecolor="none", alpha=0.45, zorder=zorder-1)
        ax.add_patch(shadow)
        
        # Main card
        card = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.35,rounding_size=0.8",
                              facecolor=fill_c, edgecolor=border_c, linewidth=1.2, zorder=zorder)
        ax.add_patch(card)
        
        # Title & Subtitle
        if subtitle:
            ax.text(x + w/2.0, y + h*0.62, title, fontsize=9.0, fontweight='bold',
                    color=text_c, ha='center', va='center', family='sans-serif', zorder=zorder+1)
            ax.text(x + w/2.0, y + h*0.28, subtitle, fontsize=6.8,
                    color=text_c, ha='center', va='center', family='sans-serif', alpha=0.92, zorder=zorder+1)
        else:
            ax.text(x + w/2.0, y + h*0.5, title, fontsize=9.0, fontweight='bold',
                    color=text_c, ha='center', va='center', family='sans-serif', zorder=zorder+1)

    def draw_path(points, label=None, lbl_pos=None, color="#334155", lw=1.6, style="-|>", dashed=False):
        arrow_prop = dict(arrowstyle=style, color=color, lw=lw, mutation_scale=13,
                          linestyle='--' if dashed else '-', zorder=5)
        for i in range(len(points)-1):
            p1 = points[i]
            p2 = points[i+1]
            if i == len(points)-2:
                ax.annotate("", xy=p2, xytext=p1, arrowprops=arrow_prop)
            else:
                ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=color, lw=lw,
                        linestyle='--' if dashed else '-', zorder=5)
                
        if label and lbl_pos:
            ax.text(lbl_pos[0], lbl_pos[1], label, fontsize=6.6, fontweight='bold', color="#0f172a",
                    ha='center', va='center', bbox=dict(boxstyle="round,pad=0.25,rounding_size=0.4",
                    facecolor="#ffffff", edgecolor="#94a3b8", lw=0.7), zorder=7)

    # 1. CONTAINERS
    draw_container(2, 85, 96, 13.5, "Tier 1: Client Presentation Layer", "#eff6ff", "#2563eb")
    draw_container(2, 69, 96, 14.0, "Tier 2: API Gateway & Session Orchestration", "#ecfdf5", "#059669")
    draw_container(2, 2, 28, 65.0, "Offline Curriculum Ingestion Pipeline", "#f8fafc", "#64748b")
    draw_container(32, 2, 38, 65.0, "Tier 3 & 4: Core Socratic Dialogue & Inference Engine", "#faf5ff", "#7e22ce")
    draw_container(72, 2, 26, 65.0, "Tier 5: Adaptive Knowledge & Telemetry", "#f0fdfa", "#0f766e")

    # 2. CARDS / MODULES
    # Tier 1: Clients
    draw_card(12, 86.5, 35, 8.2, "React 18 / Vite Web Client", "Socratic Lab Bench • Cognitive Prompt Chips • KaTeX", c_client, "#1d4ed8")
    draw_card(53, 86.5, 35, 8.2, "Expo Mobile Client (React Native)", "Cross-Platform Smartphone Tutoring • Inquiry Streaks", c_client, "#1d4ed8")

    # Tier 2: Gateway & Session
    draw_card(12, 70.5, 52, 8.5, "FastAPI Hub & Central Orchestrator", "Async Route Handlers • SSE Streaming • JWT Auth • CORS Security", c_gateway, "#047857")
    draw_card(68, 70.5, 20, 8.5, "SQLite3 Database", "User Accounts & Turn History (users.sqlite3)", "#475569", "#334155")

    # Left Column: Offline Pipeline & Knowledge Store
    draw_card(4, 51.5, 24, 10, "MoEST / CDC Textbooks", "17 Verified Digital Text Volumes\n(Compulsory Science 9-10)", "#475569", "#334155")
    draw_card(4, 35.5, 24, 10, "Text Ingestion & Cleaning", "PyMuPDF (fitz) Parser\nRegex Boilerplate & Header Stripping", "#d97706", "#b45309")
    draw_card(4, 19.5, 24, 10, "ChromaDB Vector Store", "Ollama nomic-embed-text (768-d)\n1,200-char Recursive Text Chunks", "#b45309", "#92400e")
    draw_card(4, 4.5, 24, 9.0, "Lexical Term Reranker", "Top-12 Candidates → Top-3 Exact Stem Scoring", "#92400e", "#78350f")

    # Center Column: Real-Time Socratic Pipeline
    draw_card(35, 51.5, 32, 9.5, "Pedagogical Turn Policy", "Intent Classification (Science vs Meta Inquiry)\nPrompt Formulation & Output Verification", c_policy, "#1e293b")
    draw_card(35, 36.0, 32, 9.5, "Hybrid Retrieval Coordinator", "Query Cleaning • Parallel ANN Vector Search\nTop-3 Curriculum Context Injection", "#d97706", "#b45309")
    draw_card(35, 20.5, 32, 9.5, "Socratic Scaffolding Engine", "Class 10 Physical Analogies • Student Validation\nStrict Question-Mark Terminal Gating", c_model, "#6b21a8")
    draw_card(35, 4.5, 32, 10.0, "Qwen2.5-7B Merged SFT Model", "RunPod Serverless vLLM (Dedicated NVIDIA GPUs)\nZero-Cost Fallback: Hugging Face ZeroGPU", "#581c87", "#3b0764")

    # Right Column: Knowledge Graph & Analytics
    draw_card(74, 47.0, 22, 13.5, "135-Node Knowledge Graph", "Curriculum Prerequisite Ontology\n• 45 Physics Nodes\n• 50 Chemistry Nodes\n• 40 Biology Nodes", c_kg, "#0d9488")
    draw_card(74, 25.5, 22, 12.0, "EWMA Mastery Telemetry", "Exponential Smoothing (α = 0.25)\n• Dynamic Score Update (st)\n• 3-Turn Confusion Flagging", "#047857", "#065f46")
    draw_card(74, 4.5, 22, 13.0, "Teacher Diagnostic Desk", "Educator Supervision Dashboard\n• Persistent Confusion Alerts\n• Class Concept Mastery Trends", c_teacher, "#0284c7")

    # 3. ROUTED ARROWS (NO CROSSING OVER ANY BOX)
    # Clients -> Gateway
    draw_path([(29.5, 86.5), (29.5, 79)], label="REST / JSON", lbl_pos=(29.5, 82.5), color=c_blue)
    draw_path([(70.5, 86.5), (70.5, 83), (50, 83), (50, 79)], label="SSE Stream", lbl_pos=(60, 83), color=c_blue)

    # Gateway <-> DB
    draw_path([(64, 74.75), (68, 74.75)], label="Session State", lbl_pos=(66, 76.5), color="#475569")

    # Gateway -> Turn Policy (Center down)
    draw_path([(38, 70.5), (38, 61)], label="1. Inbound Query", lbl_pos=(38, 65.5), color="#059669")

    # Offline Pipeline (Left Column down)
    draw_path([(16, 51.5), (16, 45.5)], label="Digital Text", lbl_pos=(16, 48.5), color="#64748b")
    draw_path([(16, 35.5), (16, 29.5)], label="Clean Chunks", lbl_pos=(16, 32.5), color="#b45309")
    draw_path([(16, 19.5), (16, 13.5)], label="ANN $k=12$", lbl_pos=(16, 16.5), color="#92400e")

    # Turn Policy -> Hybrid Retrieval Coordinator
    draw_path([(45, 51.5), (45, 45.5)], label="Science Intent", lbl_pos=(45, 48.5), color=c_policy)
    
    # Retrieval Coordinator queries ChromaDB (via left channel x=30.5)
    draw_path([(35, 40.75), (30.5, 40.75), (30.5, 24.5), (28, 24.5)],
              label="2. Semantic Query", lbl_pos=(30.5, 33), color="#d97706")
    
    # Lexical Reranker returns Top-3 (via left channel x=32.5)
    draw_path([(28, 9), (32.5, 9), (32.5, 38), (35, 38)],
              label="3. Top-3 Context", lbl_pos=(32.5, 15), color="#92400e")

    # Hybrid Retrieval Coordinator -> Scaffolding Engine
    draw_path([(51, 36), (51, 30)], label="Context Injected", lbl_pos=(51, 33), color="#d97706")

    # Scaffolding Engine -> LLM
    draw_path([(51, 20.5), (51, 14.5)], label="Prompt + Scaffolding", lbl_pos=(51, 17.5), color=c_model)

    # LLM Stream -> Gateway (Return Highway via right channel x=68.5)
    draw_path([(67, 11), (68.5, 11), (68.5, 66.5), (48, 66.5), (48, 70.5)],
              label="4. Socratic Stream (No Direct Answers)", lbl_pos=(68.5, 39), color=c_model)

    # LLM Turn Event -> Knowledge Graph (via right channel x=71)
    draw_path([(67, 7), (71.0, 7), (71.0, 53.75), (74, 53.75)],
              label="5. Student Turn Score", lbl_pos=(71.0, 28), color=c_kg)

    # Knowledge Graph -> EWMA -> Teacher Desk (Right column down)
    draw_path([(85, 47), (85, 37.5)], label="Concept Mapping", lbl_pos=(85, 42.2), color=c_kg)
    draw_path([(85, 25.5), (85, 17.5)], label="Mastery Update / Alerts", lbl_pos=(85, 21.5), color="#047857")

    plt.tight_layout()
    plt.savefig("report_figures/fig_system_architecture.png", dpi=300, bbox_inches='tight', pad_inches=0.1)
    print("Zero-crossing architecture diagram successfully generated!")

if __name__ == '__main__':
    create_diagram()
