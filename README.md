# DirectoryX - Directory Structuring Tool

DirectoryX is a web-based utility designed to help you visualize directory structures, manage file content, and export selections in a format suitable for various purposes, particularly for providing context to Large Language Models (LLMs). It offers fine-grained control over what gets included and how content is processed before export.

## Features

*   **Directory Import**:
    *   Import local project directories using the File System Access API (requires a compatible browser like Chrome/Edge in a secure context).
    *   Loads a sample project if the API is unavailable or the user cancels, allowing you to explore features.
*   **Interactive File Tree**:
    *   Visualize your project's folder and file structure.
    *   Expand/collapse folders.
    *   Search for files and folders using `Ctrl+F` (files) or `Ctrl+Shift+F` (folders).
*   **File Selection**:
    *   Individually select files for export.
    *   Bulk selection options for folders (select all, deselect all, invert selection within a folder).
*   **Content Management & Overrides**:
    *   **File/Folder Properties**: Add custom descriptions.
    *   **File-Specific Overrides**:
        *   **Line Limits**: Override ruleset-defined line limits (e.g., keep only first N lines, last N lines, a specific range, or no lines).
        *   **Compression**: Override ruleset-defined compression (e.g., remove empty lines, remove comments).
*   **Matching Library**:
    *   Create and manage reusable "Matches" to identify files or folders based on:
        *   **Name**: Exact or partial name match.
        *   **Suffix**: For files (e.g., `.txt`, `.js`).
        *   **Wildcard**: Glob-like patterns (e.g., `*.log`, `src/*/*.ts`).
        *   **Regular Expression**: For complex pattern matching.
*   **Rulesets**:
    *   Organize rules into prioritized sets for different processing stages.
    *   **Import Rulesets**: Define which files and folders are initially imported or excluded based on matches. (e.g., exclude `node_modules`, `.git`).
    *   **Compression Rulesets**: Apply content compression (remove empty lines, basic comment removal) to files matching specific criteria.
    *   **Line Limit Rulesets**: Control how many lines of a file are exported (e.g., head N, tail N, custom range, or no lines for binaries) for files matching specific criteria.
*   **Macro Operations**:
    *   **Operations**: Define specific actions like "Check File," "Uncheck File," "Select All in Folder," "Deselect All in Folder," or "Invert Selection in Folder" based on previously defined Matches.
    *   **Macros**: Create sequences of these Operations to automate common selection or deselection tasks. Macros can be run from the Files view.
*   **Export Options**:
    *   **Merge Selected Files**: Concatenates the content of all selected files into a single text file, applying chosen compression and line limit rules.
    *   **Export Directory Tree**: Exports a text representation of the directory structure (optionally showing selected files).
*   **Undo/Redo**:
    *   Undo/redo changes to file selections and properties (`Ctrl+Z` / `Ctrl+Y`).
    *   Undo/redo macro executions.
*   **User Interface**:
    *   Tabbed navigation for Files, Matching Library, Rulesets, and Macro Operations.
    *   Modals for creating/editing items.
    *   Tooltips for guidance.

## How to Use

1.  **Navigate to the "文件" (Files) View.** This is the default view.
2.  **Import Directory**: Click "导入目录" (Import Directory).
    *   If your browser supports it, a dialog will ask for permission to access a folder on your system.
    *   If not, or if you cancel, a sample project will be loaded to demonstrate functionality.
3.  **Manage Rulesets (Optional but Recommended)**:
    *   Go to the **"规则集" (Rulesets) View**.
    *   Select a ruleset type (Import, Compression, Line Limit) from the top dropdown.
    *   Review default rulesets or create new ones by clicking "创建规则集" (Create Ruleset).
    *   Rules within a ruleset are applied by priority (lower number = higher priority). You can adjust priority and enable/disable rules.
    *   To create rules, use the "规则库" (Rule Library) panel on the left. Click "创建规则" (Create Rule) and define its properties, including which Matches it uses.
    *   **Matching Library**: You might first want to visit the **"匹配库" (Matching Library) View** to define reusable Matches (e.g., "all JS files", "node_modules folder") that your rules will use.
    *   Back in the **"文件" (Files) View**, select the desired active rulesets for Import, Compression, and Line Limits from the dropdowns in the top bar. The Import Ruleset is applied during the directory import process. Compression and Line Limit rulesets are applied during export.
4.  **Select Files for Export**:
    *   In the **"文件" (Files) View**, manually check the boxes next to files you want to include.
    *   Use folder actions (全选/不选/反选 - Select All/Deselect All/Invert) for bulk operations within a folder.
5.  **Use Macros (Optional)**:
    *   Go to the **"宏操作" (Macro Operations) View**.
    *   Define **Operations** first (e.g., "Select all Python files"). Operations use Matches from the Matching Library.
    *   Then, combine Operations into **Macros** (e.g., "Select all source code").
    *   Run your macros from the right-hand "宏操作" panel in the **"文件" (Files) View** by clicking the play icon.
6.  **Adjust File Properties (Optional)**:
    *   In the **"文件" (Files) View**, click the properties icon (gear) next to any file or folder.
    *   Add a description override (this description will be added as a comment at the top of the file's content during merged export).
    *   For files, set specific line limit or compression overrides that will take precedence over ruleset configurations for that particular file.
7.  **Export**:
    *   In the **"文件" (Files) View**, click the "导出 ▼" (Export) button.
    *   Choose an export option:
        *   `合并导出选中的文件` (Merge selected files): Exports a single text file.
        *   `分开导出选中的文件` (Separate selected files): Currently simplified; for full functionality, ZIP packaging would be needed.
        *   `导出目录树` (Export directory tree): Exports a text representation of the folder structure.

## Purpose

DirectoryX aims to simplify the process of preparing and packaging project code, documentation, or any text-based file structure for interaction with Large Language Models or other tools. It gives you control over:
*   What content is initially considered (via Import Rules).
*   How content is cleaned or reduced (via Compression and Line Limit Rules/Overrides).
*   How selections are made efficiently (via Manual Selection and Macros).
*   The final format of the exported data.

## License

This project is released under the [MIT License](LICENSE).
