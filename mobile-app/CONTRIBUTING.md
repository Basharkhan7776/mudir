# Contributing to Mudir

Thank you for your interest in contributing to Mudir! We welcome contributions from the community. Please follow these guidelines to ensure a smooth collaboration process.

## Getting Started

1.  **Prerequisites**: Ensure you have Node.js and [Bun](https://bun.sh/) installed.
2.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/Mudir.git
    cd Mudir
    ```
3.  **Install dependencies**:
    ```bash
    bun install
    ```

## Development Workflow

1.  **Find or Create an Issue**:
    *   Look for existing issues or create a new one.
    *   Use tags in the issue title to categorize it:
        *   `[BUG]`: For reporting bugs.
        *   `[FEATURE]`: For proposing new features.
    *   **Assign the issue to yourself** before starting work to avoid duplication.

2.  **Create a Branch**:
    *   Create a new branch for your work. Use a descriptive name related to the issue.
    *   Format: `type/short-description`
    *   Examples: `feat/add-inventory-search`, `fix/ledger-calculation-error`

    ```bash
    git checkout -b feat/your-feature-name
    ```

3.  **Make Changes**:
    *   Write clean, maintainable code.
    *   Ensure your code adheres to the project's style guidelines.

4.  **Format Code**:
    *   We use **Prettier** for code formatting. Run the following command before committing:
    ```bash
    npx prettier --write .
    ```

5.  **Commit Changes**:
    *   We follow the **Conventional Commits** specification.
    *   Format: `<type>: <description>`
    *   Common types:
        *   `feat`: A new feature
        *   `fix`: A bug fix
        *   `chore`: Maintenance tasks (builds, dependencies, etc.)
        *   `docs`: Documentation only changes
        *   `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
        *   `refactor`: A code change that neither fixes a bug nor adds a feature
    *   Example: `feat: add PDF export for ledger`

6.  **Push and Pull Request**:
    *   Push your branch to the repository:
        ```bash
        git push origin feat/your-feature-name
        ```
    *   Open a Pull Request (PR) against the `main` branch.
    *   Reference the issue you worked on in the PR description (e.g., "Closes #123").

## Code of Conduct

Please be respectful and considerate in your interactions. We strive to create a welcoming environment for everyone.

Happy Coding!
