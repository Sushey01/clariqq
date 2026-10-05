# Clariq

Clariq is an AI-powered Socratic science tutor for SEE students in Nepal. It is designed to support Class 10 science learning by combining curriculum-grounded retrieval, guided questioning, and concept-level mastery tracking.

## Project goal

The project aims to provide a low-cost, accessible, and interactive learning assistant that helps students reason through science concepts rather than simply copying final answers.

## Core idea

Clariq combines:

- a curriculum-aligned retrieval layer
- a Socratic prompt policy
- a teacher-facing concept graph and mastery model
- a student-facing chat interface
- optional teacher, parent, and student progress views

## System components

### Backend
The backend is implemented in Python with FastAPI and manages:

- student chat sessions
- retrieval from textbook and uploaded notes
- turn policy and tutoring behavior
- mastery tracking and stored events
- teacher and parent views

Relevant directories:

- `backend/`
- `backend/app/`

### Frontend
The frontend provides the conversational student interface and UI for learning progress.

Relevant directories:

- `frontend/`

### Evaluation and analysis
Evaluation scripts and notes are stored in:

- `evaluation/`
- `eval_results/`

Important note:

The repository evaluation notes are associated with the 4B deployed model baseline. The 7B fine-tuning path is a separate model-development effort and should be benchmarked with a fresh evaluation using the same test set before drawing conclusions.

### Model fine-tuning notebook
A separate fine-tuning workflow for a 7B model is included here:

- `socratic-dataset-FineTune-qwen-7-5b.ipynb`

### Viva preparation
A ready-made viva and technical Q&A file is also included:

- `technical_viva_preparation.md`

## Project structure

```text
clariq/
├── backend/                  # FastAPI backend and app logic
├── frontend/                 # student interface
├── evaluation/               # evaluation scripts and notes
├── eval_results/             # evaluation outputs
├── datasets/                 # dataset-related resources
├── hf_space/                 # Hugging Face space assets
├── local_gguf/               # local GGUF inference setup
├── mobile/                   # mobile app project
├── modal/                    # modal deployment scripts
├── models/                   # model assets
├── scripts/                  # utility scripts
├── references.bib            # bibliography
├── clariq_final_report.tex    # report source
├── clariq_final_draft.tex     # working draft
├── technical_viva_preparation.md
├── requirements.txt
└── README.md
```

## Main technical focus areas

- Retrieval-augmented science tutoring
- Socratic conversation design
- Knowledge graph and mastery estimation
- Teacher and parent reporting
- Educational evaluation and pilot testing
- Model fine-tuning experimentation with LoRA and QLoRA workflows

## Notes for developing and presenting

This project should be described honestly as a working prototype with evidence-backed implementation and a pilot evaluation. Any claim about a 7B model superiority should only be made after rerunning the same benchmark on the final 7B model under the same evaluation conditions as the 4B baseline.

## Quick start

1. Create a Python environment and install dependencies.
2. Run the backend service from the `backend` project.
3. Start the frontend application.
4. Run the evaluation scripts where needed.

## Repository status

The repository contains:

- a working backend and frontend prototype,
- retrieval and concept-tracking modules,
- evaluation notes for the deployed 4B model,
- a separate 7B fine-tuning and export workflow,
- and a technical viva preparation guide.

## License and usage

This repository is intended for academic and research use within the project context. Please check the project-specific licensing and deployment constraints before public reuse.
