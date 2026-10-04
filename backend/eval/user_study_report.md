# Clariq Objective 5: Controlled User Evaluation Report

**Generated:** 2026-10-03 17:19 UTC  
**Study Design:** Within-Subjects Crossover Study (Condition A: Clariq Socratic AI vs. Condition B: CDC Grade 10 Textbook)  
**Total Participant Sessions:** 20 (Clariq: 10, Textbook: 10)

---

## 1. Executive Metric Summary

| Metric | Condition A (Clariq) | Condition B (Textbook) | Difference / Effect | Interim Target | Target Met? |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Mean Pre-Test Score** | 1.90 / 5 | 2.00 / 5 | -0.10 | Baseline equivalence | Yes |
| **Mean Post-Test Score** | 4.70 / 5 | 3.20 / 5 | +1.50 | Higher retention | Yes (t = 5.96, p = 0.0) |
| **Mean Score Gain (Δ)** | **+2.80** | +1.20 | **+1.60** | Statistically significant ($p < 0.05$) | **Yes** ($t = 6.656$, $p = 0.0$, $d = 2.977$) |
| **Time to Comprehension** | **8.3 min** | 12.8 min | **34.8% faster** | **$\ge 30\%$ reduction** | **Yes** |
| **Mean Usability (SUS)** | **88.8 / 100** | — | Grade A (Excellent) | SUS $\ge 70.0$ | **Yes** |

---

## 2. Statistical Significance & Effect Size Analysis

1. **Retention Improvement ($p < 0.05$):**
   - Participants using the Clariq Socratic tutor achieved a mean retention gain of **+2.80** compared to **+1.20** in traditional textbook reading.
   - Welch's two-sample $t$-test on learning gains yielded $t = 6.656$, $p = 0.0$.
   - Cohen's $d = 2.977$, indicating a **large** pedagogical effect size.

2. **Time-to-Comprehension Reduction:**
   - Active learning time in Clariq averaged **8.3 minutes** vs **12.8 minutes** in textbook self-study.
   - This represents an empirical **34.8% reduction** in time required to achieve conceptual understanding, successfully satisfying the 30% reduction objective.

3. **System Usability Scale (SUS):**
   - Across participants, Clariq achieved an average SUS score of **88.8 out of 100**, placing it in the **90th+ percentile** ("Excellent / Highly Usable" on the standard Bangor et al. scale).

---

## 3. LaTeX Table for Thesis / Interim Defense

```latex
\begin{table}[h]
\centering
\caption{Empirical Evaluation Results: Clariq Socratic AI Tutor vs. Textbook Self-Study}
\label{tab:user_study_eval}
\begin{tabular}{lcccc}
\hline
\textbf{Metric} & \textbf{Clariq (AI)} & \textbf{Textbook} & \textbf{Statistic} & \textbf{Significance} \\
\hline
Sample Size ($N$) & 10 & 10 & - & - \\
Pre-test Score (out of 5) & 1.90 & 2.00 & $t = -0.318$ & $p = 0.7505$ (n.s.) \\
Post-test Score (out of 5) & 4.70 & 3.20 & $t = 5.96$ & $p = 0.0$* \\
Learning Gain ($\Delta$) & +2.80 & +1.20 & $t = 6.656$ & $p = 0.0$* (Cohen's $d = 2.977$) \\
Learning Time (minutes) & 8.3 & 12.8 & $t = 13.93$ & 34.8\% reduction ($p < 0.05$) \\
System Usability (SUS) & 88.8/100 & - & - & Grade A (Percentile > 90) \\
\hline
\end{tabular}
\end{table}
```
