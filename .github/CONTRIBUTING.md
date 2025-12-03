# Contributing to OmniDistro-Content-Publishing-Engine-TypeScript-CLI

Thank you for considering contributing to OmniDistro-Content-Publishing-Engine-TypeScript-CLI! We welcome your contributions to improve this powerful content distribution engine.

## 1. Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. Please review the [CODE_OF_CONDUCT.md](https://github.com/chirag127/OmniDistro-Content-Publishing-Engine-TypeScript-CLI/blob/main/CODE_OF_CONDUCT.md) file for details on how to ensure a positive and inclusive environment.

## 2. Prerequisites

Before you start contributing, please ensure you have the following installed:

*   **Node.js:** Version 18 or higher recommended.
*   **npm:** Version 9 or higher recommended.
*   **Git:** For version control.

This project uses TypeScript, Vite, and TailwindCSS. Familiarity with these technologies is beneficial.

## 3. Development Setup

Follow these steps to set up your development environment:

1.  **Fork the Repository:** Click the "Fork" button on the top right of the [OmniDistro-Content-Publishing-Engine-TypeScript-CLI](https://github.com/chirag127/OmniDistro-Content-Publishing-Engine-TypeScript-CLI) repository page.

2.  **Clone your Fork:**
    bash
    git clone https://github.com/<your-username>/OmniDistro-Content-Publishing-Engine-TypeScript-CLI.git
    cd OmniDistro-Content-Publishing-Engine-TypeScript-CLI
    

3.  **Add Upstream Remote:**
    bash
    git remote add upstream https://github.com/chirag127/OmniDistro-Content-Publishing-Engine-TypeScript-CLI.git
    

4.  **Install Dependencies:**
    bash
    npm install
    

## 4. Contribution Workflow

We follow a standard Git workflow for contributions:

1.  **Create a New Branch:** Always branch off the `main` branch for your contributions.
    bash
    git checkout main
    git pull upstream main
    git checkout -b feature/<your-feature-name> # or bugfix/<issue-number>
    

2.  **Make Your Changes:** Write your code, add tests, and ensure all linting and formatting rules are satisfied.

3.  **Test Your Changes:** Run the test suite to ensure your changes haven't introduced regressions.
    bash
    npm run test # (Assuming a test script exists in package.json)
    

4.  **Lint and Format:** Ensure your code adheres to the project's coding standards.
    bash
    npm run lint
    npm run format
    

5.  **Commit Your Changes:** Write clear, concise commit messages.
    bash
    git add .
    git commit -m "feat: Add new platform support for [Platform Name]"
    # or
    git commit -m "fix: Resolve issue with [Specific Component/Function]"
    

6.  **Push Your Branch:**
    bash
    git push origin feature/<your-feature-name>
    

7.  **Open a Pull Request:** Navigate to the original repository on GitHub and create a new Pull Request from your forked repository's branch.

## 5. Pull Request Guidelines

*   **Clear Description:** Provide a detailed description of your changes, including the problem they solve and how they were tested.
*   **Link to Issues:** If your PR addresses an issue, please link to it using keywords like `Closes #<issue-number>`.
*   **Keep PRs Focused:** Aim for small, single-purpose PRs.
*   **Code Review:** Be prepared to address feedback from the maintainers.

## 6. Feature Development & Architectural Principles

This project adheres to the Apex Technical Authority's standards, prioritizing:

*   **Modularity:** Components should be independent and reusable.
*   **DRY (Don't Repeat Yourself):** Avoid redundant code.
*   **SOLID Principles:** Ensure code maintainability and extensibility.
*   **Performance:** Optimize for speed and resource efficiency.
*   **Testability:** Write code with testability in mind.

## 7. AI AGENT DIRECTIVES COMPLIANCE

Contributors are expected to align with the AI Agent Directives outlined in the `AGENTS.md` file. This includes understanding the intended use of the CLI, its integration points, and adherence to the defined tech stack.

## 8. Reporting Issues

If you find a bug or have a feature request, please open an issue on the GitHub repository. Be as specific as possible:

*   **Bug Reports:** Include steps to reproduce, expected behavior, and actual behavior.
*   **Feature Requests:** Clearly describe the desired functionality and its use case.

We strive to maintain a high standard of quality and reliability. Your input is invaluable!
