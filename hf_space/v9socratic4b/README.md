---
title: v9 Socratic Tutor
emoji: 🧪
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 6.28.0
app_file: app.py
python_version: "3.12"
startup_duration_timeout: 1h
short_description: Grade 10 Socratic science tutor demo
pinned: false
---

Chat demo for [Susu11/v9socratic4b](https://huggingface.co/Susu11/v9socratic4b): QLoRA adapters on [Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507), trained on [Susu11/socraticfinetune](https://huggingface.co/datasets/Susu11/socraticfinetune).

Ask a Grade 10 science question. The tutor is trained to guide with a short question instead of handing over the final answer.

Runs on ZeroGPU. The first message after the Space wakes up loads the 4B weights onto the GPU, so it can take a minute.
