import xml.etree.ElementTree as ET

def generate_drawio():
    mxfile = ET.Element('mxfile', host="app.diagrams.net", version="21.6.8")
    diagram = ET.SubElement(mxfile, 'diagram', id="clariq-arch-diagram", name="Clariq Architecture")
    mxGraphModel = ET.SubElement(diagram, 'mxGraphModel', dx="1422", dy="800", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="1169", pageHeight="827", math="0", shadow="0")
    root = ET.SubElement(mxGraphModel, 'root')
    
    ET.SubElement(root, 'mxCell', id="0")
    ET.SubElement(root, 'mxCell', id="1", parent="0")

    def add_cell(id, value, style, x, y, w, h, parent="1", is_vertex=True):
        cell = ET.SubElement(root, 'mxCell', id=id, value=value, style=style, parent=parent, vertex="1" if is_vertex else "0")
        geo = ET.SubElement(cell, 'mxGeometry', x=str(x), y=str(y), width=str(w), height=str(h))
        geo.set('as', 'geometry')
        return cell

    def add_edge(id, value, source, target, style):
        edge = ET.SubElement(root, 'mxCell', id=id, value=value, style=style, parent="1", edge="1", source=source, target=target)
        geo = ET.SubElement(edge, 'mxGeometry', relative="1")
        geo.set('as', 'geometry')
        return edge

    # Tier Group Styles
    s_tier = "rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=8 8;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=15;spacingTop=10;fontStyle=1;fontSize=12;"
    s_card = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;strokeWidth=1.5;fontFamily=Helvetica;shadow=1;"
    s_edge = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;strokeColor=#003366;fontFamily=Helvetica;fontSize=10;fontStyle=1;"

    # 1. TIER CONTAINERS
    add_cell("t1", "TIER 1: PRESENTATION & CLIENT APPLICATIONS", s_tier + "strokeColor=#3b82f6;fillColor=#eff6ff;fontColor=#1e40af;", 40, 40, 1020, 110)
    add_cell("t2", "TIER 2: API GATEWAY & SESSION ORCHESTRATION", s_tier + "strokeColor=#10b981;fillColor=#ecfdf5;fontColor=#065f46;", 40, 180, 1020, 100)
    add_cell("t3", "TIER 3: CURRICULUM INGESTION & HYBRID RAG ENGINE", s_tier + "strokeColor=#ea580c;fillColor=#fff7ed;fontColor=#9a3412;", 40, 310, 480, 360)
    add_cell("t4", "TIER 4: SOCRATIC GOVERNANCE & INFERENCE", s_tier + "strokeColor=#9333ea;fillColor=#faf5ff;fontColor=#6b21a8;", 550, 310, 510, 170)
    add_cell("t5", "TIER 5: KNOWLEDGE TELEMETRY & EDUCATOR SUPERVISION", s_tier + "strokeColor=#14b8a6;fillColor=#f0fdfa;fontColor=#0f766e;", 550, 500, 510, 170)

    # 2. NODES (CARDS)
    # Tier 1
    add_cell("c_web", "<b>React 18 / Vite Web Client</b><br><font style='font-size:10px;color:#f1f5f9;'>Socratic Bench • Prompt Chips • KaTeX Math</font>", 
             s_card + "fillColor=#1e40af;strokeColor=#1d4ed8;fontColor=#ffffff;", 100, 75, 380, 55)
    add_cell("c_mob", "<b>Expo Mobile Client (React Native)</b><br><font style='font-size:10px;color:#f1f5f9;'>Smartphone UI • Weekly Inquiry Streaks</font>", 
             s_card + "fillColor=#1e40af;strokeColor=#1d4ed8;fontColor=#ffffff;", 580, 75, 380, 55)

    # Tier 2
    add_cell("c_api", "<b>FastAPI Application Hub & Orchestrator</b><br><font style='font-size:10px;color:#f1f5f9;'>Async Route Handlers • SSE Token Streaming • JWT Auth • CORS</font>", 
             s_card + "fillColor=#047857;strokeColor=#059669;fontColor=#ffffff;", 100, 210, 600, 50)
    add_cell("c_db", "<b>SQLite3 Store</b><br><font style='font-size:10px;color:#f1f5f9;'>Session & History</font>", 
             s_card + "fillColor=#475569;strokeColor=#334155;fontColor=#ffffff;", 760, 210, 200, 50)

    # Tier 3 (RAG)
    add_cell("c_ing", "<b>Curriculum Knowledge Ingestion</b><br><font style='font-size:10px;color:#f1f5f9;'>17 Verified MoEST/CDC Textbooks • PyMuPDF</font>", 
             s_card + "fillColor=#ea580c;strokeColor=#c2410c;fontColor=#ffffff;", 70, 350, 420, 50)
    add_cell("c_rag", "<b>ChromaDB Vector Store</b><br><font style='font-size:10px;color:#f1f5f9;'>Ollama nomic-embed-text (768-d) • 1,200-char Chunks</font>", 
             s_card + "fillColor=#c2410c;strokeColor=#9a3412;fontColor=#ffffff;", 70, 440, 420, 50)
    add_cell("c_rerank", "<b>Lexical Candidate Reranker</b><br><font style='font-size:10px;color:#f1f5f9;'>Top-12 ANN Pool → Exact Term/Stem Matching (P@3 = 0.873)</font>", 
             s_card + "fillColor=#9a3412;strokeColor=#7c2d12;fontColor=#ffffff;", 70, 530, 420, 50)

    # Tier 4 (Core)
    add_cell("c_pol", "<b>Pedagogical Turn Policy & Routing</b><br><font style='font-size:10px;color:#f1f5f9;'>Intent Classification (Science vs Meta) • Terminal '?' Gating</font>", 
             s_card + "fillColor=#334155;strokeColor=#1e293b;fontColor=#ffffff;", 580, 345, 450, 50)
    add_cell("c_llm", "<b>Qwen2.5-7B Merged SFT Tutor Model</b><br><font style='font-size:10px;color:#f1f5f9;'>RunPod Serverless vLLM (Dedicated GPUs) • ZeroGPU Fallback</font>", 
             s_card + "fillColor=#6b21a8;strokeColor=#581c87;fontColor=#ffffff;", 580, 415, 450, 50)

    # Tier 5 (Mastery)
    add_cell("c_kg", "<b>135-Node Directed Knowledge Graph</b><br><font style='font-size:10px;color:#f1f5f9;'>45 Physics, 50 Chem, 40 Bio • 99 Prerequisite Edges</font>", 
             s_card + "fillColor=#0f766e;strokeColor=#0d9488;fontColor=#ffffff;", 580, 535, 450, 45)
    add_cell("c_ewma", "<b>EWMA Mastery Engine</b><br><font style='font-size:10px;color:#f1f5f9;'>α=0.25 • 3-Turn Confusion Flag</font>", 
             s_card + "fillColor=#047857;strokeColor=#065f46;fontColor=#ffffff;", 580, 600, 240, 50)
    add_cell("c_desk", "<b>Teacher Diagnostic Desk</b><br><font style='font-size:10px;color:#f1f5f9;'>Real-time Classroom Analytics</font>", 
             s_card + "fillColor=#0369a1;strokeColor=#0284c7;fontColor=#ffffff;", 840, 600, 190, 50)

    # 3. CONNECTING EDGES
    add_edge("e1", "HTTPS / JSON", "c_web", "c_api", s_edge)
    add_edge("e2", "SSE Stream", "c_mob", "c_api", s_edge)
    add_edge("e3", "Session State", "c_api", "c_db", s_edge)

    add_edge("e4", "Text Ingestion", "c_ing", "c_rag", s_edge)
    add_edge("e5", "Top-12 Candidates", "c_rag", "c_rerank", s_edge)

    add_edge("e6", "1. Inbound Query", "c_api", "c_pol", s_edge)
    add_edge("e7", "2. Semantic Search", "c_pol", "c_rag", s_edge)
    add_edge("e8", "3. Top-3 Chunks", "c_rerank", "c_llm", s_edge)

    add_edge("e9", "Prompt + Scaffolding", "c_pol", "c_llm", s_edge)
    add_edge("e10", "4. Socratic Stream", "c_llm", "c_api", s_edge + "strokeColor=#6b21a8;")

    add_edge("e11", "5. Turn Event", "c_llm", "c_kg", s_edge + "strokeColor=#0f766e;")
    add_edge("e12", "Score Update", "c_kg", "c_ewma", s_edge)
    add_edge("e13", "Confusion Alert", "c_ewma", "c_desk", s_edge)

    tree = ET.ElementTree(mxfile)
    ET.indent(tree, space="  ", level=0)
    tree.write("clariq_architecture.drawio", encoding="utf-8", xml_declaration=True)
    print("Draw.io XML diagram generated: clariq_architecture.drawio")

if __name__ == '__main__':
    generate_drawio()
