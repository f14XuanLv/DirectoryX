# DirectoryX - Advanced Directory Structuring & Content Preparation Tool

DirectoryX is a sophisticated web-based utility meticulously designed to help you visualize directory structures, manage file content with surgical precision, and export curated selections. Its primary design impetus is to **prepare high-value, contextually relevant code and text for powerful Large Language Models (LLMs)** that possess large context windows but may not support direct file uploads.

While simply concatenating project files is a trivial task, DirectoryX's unique strength lies in its **highly flexible, multi-layered filtering mechanism and efficient operational capabilities**. It offers fine-grained control over what gets included and how content is processed, enabling users to significantly reduce low-value textual information. Although there's a learning curve to mastering its advanced features, the payoff is substantial: dramatically improved context for AI analysis, leading to more accurate insights and a significant reduction in token consumption.

## Key Features

*   **Intelligent Directory Import**:
    *   Import local project directories using the File System Access API (requires a compatible browser like Chrome/Edge in a secure context).
    *   Handles API unavailability or user cancellation by loading a sample project, allowing full feature exploration.
    *   **Performance Optimized**: Implements deferred content loading – first building a structural tree, applying import rules, and then loading content only for files that pass the filters.
*   **Interactive File Tree**:
    *   Visualize your project's folder and file structure with clarity.
    *   Expand/collapse folders for focused views.
    *   Efficiently search for files (`Ctrl+F`) and folders (`Ctrl+Shift+F`).
*   **Granular File Selection & Operations**:
    *   Individually select files for precise export.
    *   Bulk selection options for folders (select all, deselect all, invert selection within a folder).
*   **Content Management & Overrides**:
    *   **File/Folder Properties**: Add custom descriptions (appended as comments during merged export).
    *   **File-Specific Overrides**: Fine-tune line limits (e.g., head N, tail N, specific range, no lines) and compression (remove empty lines, remove comments), overriding global ruleset configurations for individual files.
*   **Powerful Matching Library**:
    *   Create and manage reusable "Matches" to identify files or folders.
    *   **Strict Type Distinction**: Matches are explicitly defined for either "Files" or "Folders."
    *   **Advanced Match Types**:
        *   **Name**: Exact or partial name match.
        *   **Suffix**: For files (e.g., `.txt`, `.js`).
        *   **Wildcard (Name)**: Glob-like patterns for names (e.g., `*.log`, `file?.ts`).
        *   **Regular Expression (Name)**: For complex name pattern matching.
        *   **Path Wildcard**: Glob-like patterns for full relative paths (e.g., `src/modules/**/tests`, `.yarn/cache`, `dist/**/*.js`).
        *   **Path Regular Expression**: For complex path pattern matching.
*   **Sophisticated Rulesets**:
    *   Organize rules into prioritized sets for different processing stages, ensuring precise control.
    *   **Import Rulesets**: Define which files and folders are initially imported or excluded. This is the first line of defense against irrelevant content (e.g., exclude `node_modules`, `.git`, build artifacts based on name or path).
    *   **Compression Rulesets**: Apply content compression (remove empty lines, basic comment removal for various languages) to targeted files.
    *   **Line Limit Rulesets**: Control how many lines of a file are exported (e.g., head N, tail N, custom range, or no lines for binaries) for targeted files, crucial for token management.
*   **Efficient Macro Operations**:
    *   **Operations**: Define specific actions like "Check File," "Uncheck File," "Select All in Folder," etc., based on previously defined Matches. Operations respect the file/folder target type of their matches.
    *   **Macros**: Create sequences of these Operations to automate complex or repetitive selection/deselection tasks. Macros can be run from the Files view.
*   **Versatile Export Options**:
    *   **Merge Selected Files**: Concatenates the content of all selected files into a single text file, applying chosen compression and line limit rules. Includes metadata about applied rules.
    *   **Export Directory Tree**: Exports a text representation of the directory structure (optionally showing selected files).
*   **Robust Undo/Redo**:
    *   Undo/redo changes to file selections and properties (`Ctrl+Z` / `Ctrl+Y`).
    *   Undo/redo macro executions, allowing for fearless experimentation.
*   **User-Centric Interface**:
    *   Tabbed navigation for Files, Matching Library, Rulesets, and Macro Operations.
    *   Intuitive modals for creating/editing items.
    *   Helpful tooltips for guidance.
    *   PWA support for offline use and "installation."
    *   Persistent storage (`localStorage`) for all user configurations.

## How to Use

1.  **Navigate to the "文件" (Files) View.** This is the default view.
2.  **Import Directory**: Click "导入目录" (Import Directory). A sample project loads if the API is unavailable.
3.  **Master the Core: Matching, Rules, and Rulesets (Crucial for Effective Filtering)**:
    *   **"匹配库" (Matching Library) View**: Define reusable Matches. This is the foundation. Pay attention to "Target Type" (File/Folder) and the various "Match Types" (Name, Suffix, Path Wildcard, etc.).
    *   **"规则集" (Rulesets) View**:
        *   Select a ruleset type (Import, Compression, Line Limit).
        *   Create rules in the "规则库" (Rule Library) panel. Rules use Matches you've defined.
        *   Create new rulesets or modify defaults. Add rules to your rulesets, adjusting their priority (lower number = higher priority) and enabled status.
    *   **Activate Rulesets**: In the **"文件" (Files) View**, select your desired active rulesets for Import, Compression, and Line Limits. The Import Ruleset is critical as it's applied during the directory import process to filter the structure *before* content is loaded.
4.  **Select Files for Export**: Use manual checks or folder-level actions in the Files View.
5.  **Automate with Macros (Optional)**:
    *   Go to the **"宏操作" (Macro Operations) View**. Define Operations (which use Matches), then combine them into Macros.
    *   Run macros from the Files view.
6.  **Override Properties (Optional)**: Use the properties icon (gear) next to files/folders for specific description, line limit, or compression overrides.
7.  **Export**: Choose your desired export format.

*Learning Curve Note*: DirectoryX offers a powerful, layered system. Investing time to understand how Matches, Rules, Rulesets, and Macros interact will unlock its full potential, allowing you to craft highly efficient and precise contexts for AI.

## Purpose & Advantages for AI Interaction

DirectoryX is specifically engineered to address a common challenge when working with advanced LLMs: providing them with comprehensive yet concise context from multi-file projects, especially when direct file uploads are not supported.

*   **Overcoming Token Limits**: LLMs have finite context windows. Sending unfiltered project code (e.g., including `node_modules`, extensive comments, logs, or large binary file representations) quickly consumes tokens, reducing the space for meaningful interaction or analysis. DirectoryX allows you to:
    *   **Aggressively Exclude Irrelevant Content**: Use Import Rules with name and path matching to filter out entire directories (like `node_modules`, `.git`, build outputs) and irrelevant file types *before* they are even fully processed.
    *   **Refine Textual Content**: Apply Compression Rules (remove empty lines, comments) and Line Limit Rules (keep only essential parts of files) to further reduce token count without losing core information.
*   **Enhancing AI Precision**: By providing a cleaner, more focused dataset, you enable the AI to:
    *   Concentrate on the most relevant parts of your project.
    *   Reduce the chances of being sidetracked by boilerplate or irrelevant code/text.
    *   Generate more accurate analyses, summaries, or code.
*   **Efficient Workflow**: Instead of manually curating files and pasting content, DirectoryX offers:
    *   **Reusable Configurations**: Define your filtering and selection logic once through Matches, Rules, and Rulesets, then re-apply them to different projects or project states.
    *   **Automation**: Use Macros to perform complex selections with a single click.
*   **Structured Output**: The merged export format includes file paths and descriptions, helping the AI understand the origin and context of each code snippet.

In essence, DirectoryX transforms the raw, noisy reality of a project directory into a streamlined, high-signal input tailored for LLM consumption.

## Design Philosophy & Future Vision

The core of DirectoryX is a powerful, hierarchical system built on these concepts:

1.  **Matches**: The atomic units for identifying specific files or folders based on various criteria (name, path, type).
2.  **Rules / Operations**: These consume Matches to define specific actions.
    *   **Rules** are used within Rulesets for passive processing (e.g., import/exclude, compress, limit lines).
    *   **Operations** are used within Macros for active selection tasks (e.g., check file, select all in folder).
3.  **Rulesets / Macros**: These are collections that organize and apply Rules or Operations.
    *   **Rulesets** apply a set of prioritized rules for a specific processing stage (Import, Compression, Line Limit).
    *   **Macros** execute a sequence of operations to automate user interactions.

This "Match → Rule/Operation → Ruleset/Macro" architecture provides a high degree of flexibility and composability.

**Future Consideration**: This robust filtering and action system has potential beyond its current application. We envision that the core logic could be abstracted into a **standalone, open-source filtering library**. Imagine an "advanced `.gitignore`" that is not only declarative but can also dynamically adapt to generate a user interface for its rules, making complex filtering logic accessible and manageable. Such a library could find applications in various domains requiring sophisticated data selection and processing pipelines.

## License

This project is released under the [MIT License](README.md).
