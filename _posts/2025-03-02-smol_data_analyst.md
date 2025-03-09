---
layout: post
title: "Smol Data Analyst"
date: 2025-03-02
excerpt: "Testing smolagent capability in data analyst work"
---

### Smolagents
- A library by Hugging Face for building AI agents.

### Experiments
- For experiment notebooks, please check my [repo](https://github.com/sean-sj-jung/smol_analyst).
- Using the Chinook dataset, the goal is to test whether Smolagent can perform tasks requiring multiple steps.
- The assigned task involves writing both SQL and Python, followed by visualizing and saving the results.
  - This ensures that completing the task requires multiple steps.
- **TL;DR:** With `gpt-4o`, the agent successfully executed a moderately complex SQL query, wrote Python code for visualization, and saved the results.
  - However, it failed to follow all instructions regarding code saving.

### Notes
- `CodeAgent` seems to expect a code block at every step. If the first step involves planning without executable code, an error message is generated, though this does not interrupt the workflow.
- When a schema is not provided, the agent still generates an SQL query, resulting in a "table not found" error. It then writes a query to inspect the database and retrieve table and column names.
  - This could become a costly hallucination.
- The system prompt is initialized when `agent.run()` is executed.
  - To modify the system prompt, update `agent.prompt_templates['system_prompt']`.
- `additional_authorized_imports` is difficult to work with, as it assumes the user already knows all the libraries the agent will need to complete the task.
  - Saving a file requires creating a custom tool, as direct use of `open()` is prohibited.
- Despite being instructed to save all generated code, the agent frequently ignores this directive.
- A tool was provided to retrieve data, yet the agent opted to print the values and hardcode them for the next step. This approach is infeasible for handling large datasets.
- The agent terminates when the `final_save` method is called.
  - If the task is visualization, `final_save` is not invoked, causing the agent to repeatedly execute the last piece of code until `max_steps` is reached.

### Useful Links
- [Smolagents by Hugging Face](https://huggingface.co/docs/smolagents/en/index)  

- [My Experiment](https://github.com/sean-sj-jung/smol_analyst)