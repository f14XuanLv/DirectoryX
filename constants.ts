
import React from 'react';
import { 
    RuleType, Ruleset, Macro, Match, Rule, Operation, 
    MatchTargetType, FolderMatchType, FileMatchType, 
    ImportRuleActionType, CompressionRuleTypeOption, LineLimitRuleTypeOption,
    OperationTargetType, FolderOperationType, FileOperationType,
    UID
} from './types';

const generateId = (): UID => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);


export const FOLDER_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth:1.5, stroke: "currentColor", className:"w-5 h-5 inline-block mr-2 text-yellow-500" }, React.createElement('path', { strokeLinecap:"round", strokeLinejoin:"round", d:"M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" }));
export const FILE_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth:1.5, stroke: "currentColor", className:"w-5 h-5 inline-block mr-2 text-blue-500" }, React.createElement('path', { strokeLinecap:"round", strokeLinejoin:"round", d:"M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" }));
export const CHEVRON_RIGHT_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.25 4.5l7.5 7.5-7.5 7.5" }));
export const CHEVRON_DOWN_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 8.25l-7.5 7.5-7.5-7.5" }));
export const PLUS_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" }));
export const TRASH_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0l-.346 9m4.788 0L9.26 9m0 0l-.346-3.21m0 0a48.108 48.108 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" }));
export const PENCIL_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" }));
export const EYE_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" }), React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }));
export const COPY_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504 1.125 1.125-1.125H6.75a9.06 9.06 0 011.5-.124m7.5 10.375h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.522-.175A1.125 1.125 0 005.25 3.375m10.5 11.25h-3.375c-.621 0-1.125.504-1.125 1.125v3.375c0 .621.504 1.125 1.125 1.125h3.375c.621 0 1.125-.504 1.125-1.125V16.5a1.125 1.125 0 00-1.125-1.125z" }));
export const ARROW_UP_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" }));
export const ARROW_DOWN_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" }));
export const X_MARK_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }));
export const PROPERTIES_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 1.655c.007.378.138.75.431.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.333.183-.583.495-.646.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.646-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.793 6.793 0 010-1.655c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.49l1.217.456c.354.133.75.072 1.075-.124.072-.044.146-.087.22-.128.332-.183.582-.495.646-.869l.213-1.28z" }), React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }));
export const QUESTION_MARK_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-gray-400 hover:text-gray-600" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" }));
export const PLAY_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" }));
export const UNDO_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" }));
export const REDO_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" }));
export const LIBRARY_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className:"w-5 h-5"}, React.createElement('path', { strokeLinecap:"round", strokeLinejoin:"round", d:"M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"}));
export const RULE_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className:"w-5 h-5"}, React.createElement('path', { strokeLinecap:"round", strokeLinejoin:"round", d:"M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"})); 
export const MACRO_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className:"w-5 h-5"}, React.createElement('path', { strokeLinecap:"round", strokeLinejoin:"round", d:"M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"}));
export const FILTER_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className:"w-5 h-5"}, React.createElement('path', { strokeLinecap:"round", strokeLinejoin:"round", d:"M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"}));
export const GITHUB_ICON = React.createElement('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 16 16",
  fill: "currentColor",
}, React.createElement('path', {
  d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
}));


// --- Default Matches ---
// VCS Folders
export const MATCH_ID_GIT_FOLDER = generateId();
// Dependency/Package Management Folders
export const MATCH_ID_NODE_MODULES_FOLDER = generateId();
export const MATCH_ID_YARN_CACHE_FOLDER_PATH = generateId(); // Path-based
export const MATCH_ID_PNPM_STORE_FOLDER_PATH = generateId(); // Path-based
export const MATCH_ID_MAVEN_REPO_FOLDER_NAME = generateId(); // Name-based
export const MATCH_ID_COMPOSER_VENDOR_FOLDER_NAME = generateId(); // Name-based
export const MATCH_ID_BOWER_COMPONENTS_FOLDER_NAME = generateId(); // Name-based
export const MATCH_ID_SITE_PACKAGES_FOLDER_NAME = generateId(); // Name-based
// Build Output / Common Exclude Folders
export const MATCH_ID_COMMON_BUILD_FOLDERS = generateId(); // target, build, dist, obj, bin
export const MATCH_ID_VENV_PYCACHE_FOLDERS = generateId(); // venv, .venv, __pycache__
export const MATCH_ID_CMAKEFILES_FOLDER = generateId(); // CMakeFiles folder name
export const MATCH_ID_DOTDIR_FOLDERS_WILDCARD = generateId(); // *.dir folders (often in CMake build)

// Generic & Utility Files/Folders
export const MATCH_ID_BINARY_FILES_SUFFIX = generateId(); // Comprehensive list of binary/non-text extensions
export const MATCH_ID_LOG_FILES_SUFFIX = generateId();
export const MATCH_ID_LOCK_FILES_NAME = generateId();
export const MATCH_ID_ALL_FOLDERS_WILDCARD = generateId();
export const MATCH_ID_ALL_FILES_WILDCARD = generateId(); // Uses '*'

// Programming Language Source Files
export const MATCH_ID_JS_TS_FILES_SUFFIX = generateId();
export const MATCH_ID_PYTHON_FILES_SUFFIX = generateId();
export const MATCH_ID_C_CPP_FILES_SUFFIX = generateId();
export const MATCH_ID_JAVA_FILES_SUFFIX = generateId();
export const MATCH_ID_RUST_FILES_SUFFIX = generateId();
export const MATCH_ID_GO_FILES_SUFFIX = generateId();
export const MATCH_ID_CSHARP_FILES = generateId(); 
export const MATCH_ID_PHP_FILES_SUFFIX = generateId();
export const MATCH_ID_RUBY_FILES_SUFFIX = generateId();
export const MATCH_ID_PERL_FILES_SUFFIX = generateId();
export const MATCH_ID_LUA_FILES_SUFFIX = generateId();
export const MATCH_ID_GROOVY_FILES_SUFFIX = generateId();
export const MATCH_ID_SCALA_FILES_SUFFIX = generateId();
export const MATCH_ID_R_FILES_SUFFIX = generateId();

// Scripting Language Source Files
export const MATCH_ID_SHELL_BATCH_SCRIPTS_SUFFIX = generateId();
export const MATCH_ID_APPLESCRIPT_FILES_SUFFIX = generateId();
export const MATCH_ID_VBSCRIPT_FILES_SUFFIX = generateId();

// Build System & Development Related Files
export const MATCH_ID_MAKEFILE_FILES_NAME = generateId(); // Makefile, makefile, GNUmakefile (source Makefiles)
export const MATCH_ID_MAKEFILE_WILDCARD_MK = generateId(); // For *.mk files specifically
export const MATCH_ID_MATLAB_M_FILES_SUFFIX = generateId();
export const MATCH_ID_DOCKER_FILES = generateId(); 
// CMake Specific Files (often in source, distinct from CMakeFiles/ folder)
export const MATCH_ID_CMAKE_INSTALL_FILE = generateId(); // cmake_install.cmake
export const MATCH_ID_CMAKE_CACHE_FILE = generateId(); // CMakeCache.txt
export const MATCH_ID_MAKEFILE2_FILE = generateId(); // Makefile2 (often found in CMake build dirs)

// Compiler Intermediate & Build Artifacts
export const MATCH_ID_C_CPP_PREPROCESSOR_OUTPUT_SUFFIX = generateId(); // .i, .ii
export const MATCH_ID_ASSEMBLY_CODE_SUFFIX = generateId(); // .s, .asm
// Note: .o, .obj are in MATCH_ID_BINARY_FILES_SUFFIX
export const MATCH_ID_C_CPP_LEX_YACC_INTERMEDIATE_FILES = generateId(); // lex.yy.c, y.tab.c, y.tab.h
export const MATCH_ID_MAKEFILE_DEPENDENCY_FILES_WILDCARD = generateId(); // *.d, *.d.*

// Debugging & Analysis Files
export const MATCH_ID_PRECOMPILED_HEADERS_SUFFIX = generateId(); // .gch
export const MATCH_ID_PROFILING_DATA_SUFFIX = generateId(); // .gcno, .gcda
export const MATCH_ID_STATIC_ANALYSIS_PLIST_SUFFIX = generateId(); // .plist

// Patch & Backup Files
export const MATCH_ID_PATCH_BACKUP_FILES_SUFFIX = generateId(); // .orig, .rej

// Document, Config, Markup, Style Files
export const MATCH_ID_MARKDOWN_FILES_SUFFIX = generateId();
export const MATCH_ID_TEX_FILES_SUFFIX = generateId();
export const MATCH_ID_JSON_FILES_SUFFIX = generateId();
export const MATCH_ID_YAML_FILES_SUFFIX = generateId();
export const MATCH_ID_XML_HTML_FILES_SUFFIX = generateId();
export const MATCH_ID_CSS_FILES_SUFFIX = generateId();
export const MATCH_ID_INI_CONF_TOML_FILES = generateId(); 
export const MATCH_ID_OFFICE_DOCS_SPECIFIC_SUFFIX = generateId(); // Specific for deselection ops
export const MATCH_ID_TEXT_FILES_SUFFIX = generateId();


const binaryFileConditionsWithComments: { value: string, comment?: string }[] = [
    // 可执行文件
    { value: '.exe', comment: 'Executable' }, { value: '.dll', comment: 'Dynamic Link Library' }, 
    { value: '.so', comment: 'Shared Object (Linux)' }, { value: '.dylib', comment: 'Dynamic Library (macOS)' },
    // 编译中间文件 (Object files)
    { value: '.o', comment: 'Object file (Unix-like)' }, { value: '.obj', comment: 'Object file (Windows)' },
    { value: '.a', comment: 'Static Library (Unix)' }, { value: '.lib', comment: 'Static Library (Windows)' }, 
    { value: '.class', comment: 'Java compiled class' },
    // Precompiled Headers
    { value: '.gch', comment: 'GCC Precompiled Header' },
    // Profiling Data
    { value: '.gcno', comment: 'Gcov Notes File (Coverage)' }, { value: '.gcda', comment: 'Gcov Data File (Coverage)' },
    // 打包文件
    { value: '.jar', comment: 'Java Archive' }, { value: '.war', comment: 'Web Application Archive' }, 
    { value: '.ear', comment: 'Enterprise Application Archive' },
    // Python编译文件
    { value: '.pyc', comment: 'Python compiled code' }, { value: '.pyo', comment: 'Python optimized code' },
    // 图像文件
    { value: '.png' }, { value: '.jpg' }, { value: '.jpeg' }, { value: '.gif' }, { value: '.bmp' }, 
    { value: '.tiff' }, { value: '.tif' }, { value: '.ico' }, { value: '.webp' }, { value: '.svg' }, // SVG can be text, but often treated as image asset
    // 音视频文件
    { value: '.mp3' }, { value: '.wav' }, { value: '.ogg' }, { value: '.aac' }, { value: '.flac' }, 
    { value: '.mp4' }, { value: '.avi' }, { value: '.mov' }, { value: '.wmv' }, { value: '.flv' }, { value: '.mkv' },
    // 字体文件
    { value: '.eot' }, { value: '.ttf' }, { value: '.woff' }, { value: '.woff2' }, { value: '.otf' },
    // 文档文件 (often treated as binary or non-plain-text for line processing)
    { value: '.pdf' }, { value: '.doc' }, { value: '.docx' }, { value: '.odt' }, 
    { value: '.xls' }, { value: '.xlsx' }, { value: '.ods' }, 
    { value: '.ppt' }, { value: '.pptx' }, { value: '.odp' },
    // 压缩文件
    { value: '.zip' }, { value: '.tar' }, { value: '.gz' }, { value: '.rar' }, { value: '.7z' }, 
    { value: '.bz2' }, { value: '.xz' }, { value: '.tgz' },
    // 数据库文件
    { value: '.db' }, { value: '.sqlite' }, { value: '.sqlite3' }, { value: '.mdb'}, { value: '.accdb'},
    // 其他 (Disk Images, Installers, Specific Tool Binaries)
    { value: '.iso', comment: 'Disc Image' }, { value: '.dmg', comment: 'macOS Disk Image' }, 
    { value: '.apk', comment: 'Android Package Kit' }, { value: '.msi', comment: 'Microsoft Installer' },
    { value: '.scpt', comment: 'AppleScript compiled' }, // Compiled AppleScript
    { value: '.fig', comment: 'MATLAB Figure' }, { value: '.mat', comment: 'MATLAB Data file' },
    { value: '.mlx', comment: 'MATLAB Live Script (often binary-like with rich content)'},
    // Static Analysis reports (often XML but can be large and tool-specific)
    { value: '.plist', comment: 'Property List (e.g., Clang static analysis reports)' },
];

export const DEFAULT_MATCHES: Match[] = [
    // --- FOLDER Matches ---
    // VCS
    { id: MATCH_ID_GIT_FOLDER, name: ".git 文件夹", description: "匹配 .git 版本控制文件夹 (名称)", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: ".git"}] },
    // Dependencies / Package Management
    { id: MATCH_ID_NODE_MODULES_FOLDER, name: "node_modules 文件夹", description: "匹配 node_modules 文件夹 (名称)", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: "node_modules"}] },
    { id: MATCH_ID_YARN_CACHE_FOLDER_PATH, name: "Yarn Cache 文件夹 (路径)", description: "匹配路径为 .yarn/cache 的文件夹", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.PATH_WILDCARD, conditions: [{id: generateId(), value: ".yarn/cache"}] },
    { id: MATCH_ID_PNPM_STORE_FOLDER_PATH, name: "PNPM Store 文件夹 (路径)", description: "匹配路径为 .pnpm/store 或 node_modules/.pnpm-store 的文件夹", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.PATH_WILDCARD, conditions: [{id: generateId(), value: ".pnpm/store"}, {id: generateId(), value: "node_modules/.pnpm-store"}] },
    { id: MATCH_ID_MAVEN_REPO_FOLDER_NAME, name: "Maven Repository 文件夹 (名称)", description: "匹配名为 'repository' 的文件夹 (通常在 .m2/ 下)", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: "repository"}] },
    { id: MATCH_ID_COMPOSER_VENDOR_FOLDER_NAME, name: "Composer Vendor 文件夹 (名称)", description: "匹配名为 'vendor' 的文件夹 (PHP Composer)", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: "vendor"}] },
    { id: MATCH_ID_BOWER_COMPONENTS_FOLDER_NAME, name: "Bower Components 文件夹 (名称)", description: "匹配名为 'bower_components' 的文件夹", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: "bower_components"}] },
    { id: MATCH_ID_SITE_PACKAGES_FOLDER_NAME, name: "Python Site Packages 文件夹 (名称)", description: "匹配名为 'site-packages' 的文件夹", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: "site-packages"}] },
    // Build Output / Common Excludes
    { id: MATCH_ID_COMMON_BUILD_FOLDERS, name: "通用构建输出文件夹", description: "匹配 target, build, dist, out, obj, bin 文件夹 (名称)", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: ["target", "build", "dist", "out", "obj", "bin"].map(name => ({id: generateId(), value: name})) },
    { id: MATCH_ID_VENV_PYCACHE_FOLDERS, name: "Python虚拟环境和缓存文件夹", description: "匹配 venv, .venv, env, .env, __pycache__ 文件夹 (名称)", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: ["venv", ".venv", "env", ".env", "__pycache__"].map(name => ({id: generateId(), value: name})) },
    { id: MATCH_ID_CMAKEFILES_FOLDER, name: "CMake 生成文件夹 (CMakeFiles)", description: "匹配名为 CMakeFiles 的文件夹 (CMake构建系统)", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: "CMakeFiles"}] },
    { id: MATCH_ID_DOTDIR_FOLDERS_WILDCARD, name: "CMake *.dir 文件夹 (通配符)", description: "匹配名为 *.dir 的文件夹 (常用于CMake构建中间目标)", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.WILDCARD, conditions: [{id: generateId(), value: "*.dir"}]},
    // Generic
    { id: MATCH_ID_ALL_FOLDERS_WILDCARD, name: "所有文件夹 (名称通配符)", description: "匹配所有文件夹名称", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.WILDCARD, conditions: [{id: generateId(), value: "*"}]},

    // --- FILE Matches ---
    // Binary & Non-Text
    { 
        id: MATCH_ID_BINARY_FILES_SUFFIX, name: "常见二进制及非文本文件后缀", 
        description: "匹配各类二进制、编译、媒体、文档、压缩、预编译头、分析数据及其他非纯文本文件后缀。", 
        targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, 
        conditions: binaryFileConditionsWithComments.map(item => ({id: generateId(), value: item.value})) 
    },
    // Utility / Tooling
    { id: MATCH_ID_LOG_FILES_SUFFIX, name: "日志文件", description: "匹配 .log 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".log"}] },
    { id: MATCH_ID_LOCK_FILES_NAME, name: "锁文件", description: "匹配 package-lock.json, yarn.lock, composer.lock, Gemfile.lock, poetry.lock, Pipfile.lock 等", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.NAME, conditions: [
        'package-lock.json', 'yarn.lock', 'composer.lock', 'Gemfile.lock', 'poetry.lock', 'Pipfile.lock', 'Cargo.lock', 'go.sum'
    ].map(name => ({id: generateId(), value: name})) },
    // Generic
    { id: MATCH_ID_ALL_FILES_WILDCARD, name: "所有文件 (名称通配符)", description: "匹配所有文件名，包括无后缀名文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.WILDCARD, conditions: [{id: generateId(), value: "*"}]},
    
    // Programming Language Source Files
    { id: MATCH_ID_JS_TS_FILES_SUFFIX, name: "JS/TS 文件", description: "匹配 .js, .ts, .jsx, .tsx, .mjs, .cjs 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_PYTHON_FILES_SUFFIX, name: "Python 文件", description: "匹配 .py, .pyw 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.py', '.pyw'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_C_CPP_FILES_SUFFIX, name: "C/C++ 源文件", description: "匹配 .c, .h, .cpp, .hpp, .cc, .cxx, .hh 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.c', '.h', '.cpp', '.hpp', '.cc', '.cxx', '.hh'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_JAVA_FILES_SUFFIX, name: "Java 文件", description: "匹配 .java 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".java"}]},
    { id: MATCH_ID_RUST_FILES_SUFFIX, name: "Rust 文件", description: "匹配 .rs 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".rs"}]},
    { id: MATCH_ID_GO_FILES_SUFFIX, name: "Go 文件", description: "匹配 .go 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".go"}]},
    { id: MATCH_ID_CSHARP_FILES, name: "C# 文件", description: "匹配 .cs 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".cs"}]},
    { id: MATCH_ID_PHP_FILES_SUFFIX, name: "PHP 文件", description: "匹配 .php, .php3, .php4, .php5, .phtml 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.php', '.php3', '.php4', '.php5', '.phtml'].map(ext => ({id: generateId(), value: ext})) },
    { id: MATCH_ID_RUBY_FILES_SUFFIX, name: "Ruby 文件", description: "匹配 .rb 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".rb"}] },
    { id: MATCH_ID_PERL_FILES_SUFFIX, name: "Perl 文件", description: "匹配 .pl, .pm 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.pl', '.pm'].map(ext => ({id: generateId(), value: ext})) },
    { id: MATCH_ID_LUA_FILES_SUFFIX, name: "Lua 文件", description: "匹配 .lua 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".lua"}] },
    { id: MATCH_ID_GROOVY_FILES_SUFFIX, name: "Groovy 文件", description: "匹配 .groovy, .gvy, .gy, .gsh 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.groovy', '.gvy', '.gy', '.gsh'].map(ext => ({id: generateId(), value: ext})) },
    { id: MATCH_ID_SCALA_FILES_SUFFIX, name: "Scala 文件", description: "匹配 .scala, .sc 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.scala', '.sc'].map(ext => ({id: generateId(), value: ext})) },
    { id: MATCH_ID_R_FILES_SUFFIX, name: "R 文件", description: "匹配 .r, .R 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.r', '.R'].map(ext => ({id: generateId(), value: ext})) },

    // Scripting Language Source Files
    { id: MATCH_ID_SHELL_BATCH_SCRIPTS_SUFFIX, name: "Shell/Batch 脚本", description: "匹配 .sh, .bash, .zsh, .bat, .cmd, .ps1 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.sh', '.bash', '.zsh', '.bat', '.cmd', '.ps1'].map(ext => ({id: generateId(), value: ext})) },
    { id: MATCH_ID_APPLESCRIPT_FILES_SUFFIX, name: "AppleScript 文件 (文本)", description: "匹配 .applescript 文件 (文本格式)", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".applescript"}] }, // .scpt is binary
    { id: MATCH_ID_VBSCRIPT_FILES_SUFFIX, name: "VBScript 文件", description: "匹配 .vbs 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".vbs"}] },

    // Build System & Dev Related Source/Config Files
    { id: MATCH_ID_MAKEFILE_FILES_NAME, name: "Makefile 文件 (名称)", description: "匹配 Makefile, makefile, GNUmakefile (名称)", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.NAME, conditions: ['Makefile', 'makefile', 'GNUmakefile'].map(name => ({id: generateId(), value: name})) },
    { id: MATCH_ID_MAKEFILE_WILDCARD_MK, name: "Makefile (*.mk)", description: "匹配 *.mk Makefile 片段 (通配符)", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.WILDCARD, conditions: [{id: generateId(), value: "*.mk"}]},
    { id: MATCH_ID_MATLAB_M_FILES_SUFFIX, name: "MATLAB .m 文件", description: "匹配 .m 文件 (MATLAB脚本/函数)", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".m"}] },
    { id: MATCH_ID_DOCKER_FILES, name: "Docker 文件", description: "匹配 Dockerfile, docker-compose.yml, docker-compose.yaml", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.NAME, conditions: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'].map(name => ({id: generateId(), value: name}))},
    { id: MATCH_ID_CMAKE_INSTALL_FILE, name: "CMake Install 文件", description: "匹配 cmake_install.cmake 文件 (名称)", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.NAME, conditions: [{id: generateId(), value: "cmake_install.cmake"}] },
    { id: MATCH_ID_CMAKE_CACHE_FILE, name: "CMake Cache 文件", description: "匹配 CMakeCache.txt 文件 (名称)", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.NAME, conditions: [{id: generateId(), value: "CMakeCache.txt"}] },
    { id: MATCH_ID_MAKEFILE2_FILE, name: "Makefile2 文件 (CMake)", description: "匹配 Makefile2 文件 (通常由CMake生成)", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.NAME, conditions: [{id: generateId(), value: "Makefile2"}] },


    // Compiler Intermediate & Build Artifacts (Files)
    { id: MATCH_ID_C_CPP_PREPROCESSOR_OUTPUT_SUFFIX, name: "C/C++ 预处理输出", description: "匹配 .i, .ii 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.i', '.ii'].map(ext => ({id: generateId(), value: ext})) },
    { id: MATCH_ID_ASSEMBLY_CODE_SUFFIX, name: "汇编代码文件", description: "匹配 .s, .asm 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.s', '.asm'].map(ext => ({id: generateId(), value: ext})) },
    { id: MATCH_ID_C_CPP_LEX_YACC_INTERMEDIATE_FILES, name: "C/C++ Lex/Yacc 中间文件", description: "匹配 lex.yy.c, y.tab.c, y.tab.h", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.NAME, conditions: ['lex.yy.c', 'y.tab.c', 'y.tab.h'].map(name => ({id: generateId(), value: name}))},
    { id: MATCH_ID_MAKEFILE_DEPENDENCY_FILES_WILDCARD, name: "Makefile 依赖文件", description: "匹配 *.d 或 *.d.* 文件 (通配符)", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.WILDCARD, conditions: [{id: generateId(), value: "*.d"}, {id: generateId(), value: "*.d.*"}] },
    // .gch, .gcno, .gcda, .plist are in binary files match

    // Patch & Backup Files
    { id: MATCH_ID_PATCH_BACKUP_FILES_SUFFIX, name: "补丁/备份文件", description: "匹配 .orig, .rej 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.orig', '.rej'].map(ext => ({id: generateId(), value: ext})) },
    
    // Document, Config, Markup, Style Files
    { id: MATCH_ID_MARKDOWN_FILES_SUFFIX, name: "Markdown 文件", description: "匹配 .md, .markdown 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.md', '.markdown'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_TEX_FILES_SUFFIX, name: "LaTeX/TeX 文件", description: "匹配 .tex, .bib, .cls, .sty 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.tex', '.bib', '.cls', '.sty'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_JSON_FILES_SUFFIX, name: "JSON 文件", description: "匹配 .json, .jsonc, .geojson 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.json', '.jsonc', '.geojson'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_YAML_FILES_SUFFIX, name: "YAML 文件", description: "匹配 .yml, .yaml 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.yml', '.yaml'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_XML_HTML_FILES_SUFFIX, name: "XML/HTML/SVG(Source) 文件", description: "匹配 .xml, .html, .htm, .xhtml, .svg (源文件) 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.xml', '.html', '.htm', '.xhtml', /*.svg is often image, but source is XML-like*/].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_CSS_FILES_SUFFIX, name: "CSS 文件", description: "匹配 .css, .scss, .sass, .less 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.css', '.scss', '.sass', '.less'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_INI_CONF_TOML_FILES, name: "INI/CONF/TOML 配置文件", description: "匹配 .ini, .cfg, .conf, .toml 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.ini', '.cfg', '.conf', '.toml'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_OFFICE_DOCS_SPECIFIC_SUFFIX, name: "Office 文档文件 (特定)", description: "匹配 .doc, .docx, .odt, .xls, .xlsx, .ods, .ppt, .pptx, .odp (用于特定操作，如取消选择)", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.doc', '.docx', '.odt', '.xls', '.xlsx', '.ods', '.ppt', '.pptx', '.odp'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_TEXT_FILES_SUFFIX, name: "纯文本文件 (.txt)", description: "匹配 .txt 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".txt"}]},
];

// --- Default Rules ---
export const RULE_ID_IMPORT_ALL_FOLDERS = generateId();
export const RULE_ID_IMPORT_ALL_FILES = generateId();

// Exclusion Rules for Folders
export const RULE_ID_CANCEL_VCS_FOLDERS = generateId();
export const RULE_ID_CANCEL_DEPENDENCY_FOLDERS_BY_NAME = generateId(); // node_modules, bower, composer vendor etc.
export const RULE_ID_CANCEL_DEPENDENCY_FOLDERS_BY_PATH = generateId(); // .yarn/cache, .pnpm/store
export const RULE_ID_CANCEL_BUILD_OUTPUT_FOLDERS = generateId();
export const RULE_ID_CANCEL_PYTHON_ENV_CACHE_FOLDERS = generateId();
export const RULE_ID_CANCEL_CMAKEFILES_FOLDER = generateId();
export const RULE_ID_CANCEL_DOTDIR_FOLDERS = generateId();

// Exclusion Rules for Files
export const RULE_ID_CANCEL_BINARY_AND_NONTEXT_FILES = generateId();
export const RULE_ID_CANCEL_LOG_FILES = generateId();
export const RULE_ID_CANCEL_LOCK_FILES = generateId();
export const RULE_ID_CANCEL_C_CPP_LEX_YACC_INTERMEDIATES = generateId();
export const RULE_ID_CANCEL_C_CPP_PREPROCESSOR_OUTPUT = generateId();
export const RULE_ID_CANCEL_ASSEMBLY_CODE = generateId();
export const RULE_ID_CANCEL_MAKEFILE_DEPENDENCIES = generateId();
export const RULE_ID_CANCEL_CMAKE_BUILD_FILES = generateId(); // cmake_install.cmake, CMakeCache.txt, Makefile2
export const RULE_ID_CANCEL_PATCH_BACKUP_FILES = generateId();
// Note: .gch, .gcno, .gcda, .plist are now part of binary files match, so RULE_ID_CANCEL_BINARY_AND_NONTEXT_FILES covers them.

// Compression and Line Limit Rules
export const RULE_ID_COMPRESS_REMOVE_EMPTY = generateId();
export const RULE_ID_COMPRESS_REMOVE_COMMENTS_CODE_CONFIG = generateId(); 
export const RULE_ID_LIMIT_NONE_BINARY = generateId();
export const RULE_ID_LIMIT_TAIL_LOGS = generateId();

export const DEFAULT_RULES: Rule[] = [
    // --- Import Rules ---
    // Base Inclusions (Low Priority)
    { id: RULE_ID_IMPORT_ALL_FOLDERS, name: "导入所有文件夹", description: "默认导入所有遇到的文件夹", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.IMPORT_FOLDER, matchIds: [MATCH_ID_ALL_FOLDERS_WILDCARD] },
    { id: RULE_ID_IMPORT_ALL_FILES, name: "导入所有文件", description: "默认导入所有遇到的文件 (包括无后缀名)", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.IMPORT_FILE, matchIds: [MATCH_ID_ALL_FILES_WILDCARD] },
    
    // Folder Exclusions (High Priority)
    { id: RULE_ID_CANCEL_VCS_FOLDERS, name: "取消导入 VCS 文件夹", description: "不导入 .git 等版本控制系统文件夹", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FOLDER, matchIds: [MATCH_ID_GIT_FOLDER] },
    { id: RULE_ID_CANCEL_DEPENDENCY_FOLDERS_BY_NAME, name: "取消导入依赖文件夹 (按名称)", description: "不导入 node_modules, vendor, bower_components, site-packages, Maven repository 等", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FOLDER, matchIds: [MATCH_ID_NODE_MODULES_FOLDER, MATCH_ID_COMPOSER_VENDOR_FOLDER_NAME, MATCH_ID_BOWER_COMPONENTS_FOLDER_NAME, MATCH_ID_SITE_PACKAGES_FOLDER_NAME, MATCH_ID_MAVEN_REPO_FOLDER_NAME] },
    { id: RULE_ID_CANCEL_DEPENDENCY_FOLDERS_BY_PATH, name: "取消导入依赖文件夹 (按路径)", description: "不导入 .yarn/cache, .pnpm/store 等特定路径的依赖文件夹", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FOLDER, matchIds: [MATCH_ID_YARN_CACHE_FOLDER_PATH, MATCH_ID_PNPM_STORE_FOLDER_PATH] },
    { id: RULE_ID_CANCEL_BUILD_OUTPUT_FOLDERS, name: "取消导入通用构建输出文件夹", description: "不导入 target, build, dist, out, obj, bin 等文件夹", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FOLDER, matchIds: [MATCH_ID_COMMON_BUILD_FOLDERS] },
    { id: RULE_ID_CANCEL_PYTHON_ENV_CACHE_FOLDERS, name: "取消导入Python虚拟环境和缓存", description: "不导入 venv, .venv, __pycache__ 等文件夹", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FOLDER, matchIds: [MATCH_ID_VENV_PYCACHE_FOLDERS] },
    { id: RULE_ID_CANCEL_CMAKEFILES_FOLDER, name: "取消导入 CMake 生成文件夹 (CMakeFiles)", description: "不导入 CMakeFiles 文件夹", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FOLDER, matchIds: [MATCH_ID_CMAKEFILES_FOLDER] },
    { id: RULE_ID_CANCEL_DOTDIR_FOLDERS, name: "取消导入 CMake *.dir 文件夹", description: "不导入 *.dir 文件夹 (CMake 中间目标)", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FOLDER, matchIds: [MATCH_ID_DOTDIR_FOLDERS_WILDCARD] },
    
    // File Exclusions (High Priority)
    { id: RULE_ID_CANCEL_BINARY_AND_NONTEXT_FILES, name: "取消导入二进制及非文本文件", description: "不导入常见二进制、媒体、压缩包、预编译头、分析数据等非纯文本文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_BINARY_FILES_SUFFIX] },
    { id: RULE_ID_CANCEL_LOG_FILES, name: "取消导入日志文件", description: "不导入 .log 文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_LOG_FILES_SUFFIX] },
    { id: RULE_ID_CANCEL_LOCK_FILES, name: "取消导入锁文件", description: "不导入 package-lock.json 等依赖锁文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_LOCK_FILES_NAME] },
    { id: RULE_ID_CANCEL_C_CPP_LEX_YACC_INTERMEDIATES, name: "取消导入C/C++ Lex/Yacc 中间文件", description: "不导入 lex.yy.c, y.tab.c, y.tab.h 等文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_C_CPP_LEX_YACC_INTERMEDIATE_FILES] },
    { id: RULE_ID_CANCEL_C_CPP_PREPROCESSOR_OUTPUT, name: "取消导入C/C++预处理输出", description: "不导入 .i, .ii 文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_C_CPP_PREPROCESSOR_OUTPUT_SUFFIX] },
    { id: RULE_ID_CANCEL_ASSEMBLY_CODE, name: "取消导入汇编代码文件", description: "不导入 .s, .asm 文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_ASSEMBLY_CODE_SUFFIX] },
    { id: RULE_ID_CANCEL_MAKEFILE_DEPENDENCIES, name: "取消导入Makefile依赖文件", description: "不导入 *.d, *.d.* 文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_MAKEFILE_DEPENDENCY_FILES_WILDCARD] },
    { id: RULE_ID_CANCEL_CMAKE_BUILD_FILES, name: "取消导入CMake构建辅助文件", description: "不导入 cmake_install.cmake, CMakeCache.txt, Makefile2 等", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_CMAKE_INSTALL_FILE, MATCH_ID_CMAKE_CACHE_FILE, MATCH_ID_MAKEFILE2_FILE] },
    { id: RULE_ID_CANCEL_PATCH_BACKUP_FILES, name: "取消导入补丁/备份文件", description: "不导入 .orig, .rej 文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_PATCH_BACKUP_FILES_SUFFIX] },

    // --- Compression Rules ---
    { id: RULE_ID_COMPRESS_REMOVE_EMPTY, name: "去除空行 (所有可处理文件)", description: "去除所有文本文件中的空行 (对二进制文件无效)", ruleType: RuleType.COMPRESSION, removeEmptyLines: true, matchIds: [MATCH_ID_ALL_FILES_WILDCARD] }, // Applies to all, but effectively only text
    { 
        id: RULE_ID_COMPRESS_REMOVE_COMMENTS_CODE_CONFIG, 
        name: "去除注释 (代码和配置文件)", 
        description: "去除常见代码、脚本和配置文件中的单行注释 (#, //, ;, --, ', %)", 
        ruleType: RuleType.COMPRESSION, removeComments: true, 
        matchIds: [ // Extensive list of text-based code/config files
            MATCH_ID_JS_TS_FILES_SUFFIX, MATCH_ID_PYTHON_FILES_SUFFIX, MATCH_ID_C_CPP_FILES_SUFFIX, 
            MATCH_ID_JAVA_FILES_SUFFIX, MATCH_ID_RUST_FILES_SUFFIX, MATCH_ID_GO_FILES_SUFFIX, 
            MATCH_ID_CSHARP_FILES, MATCH_ID_YAML_FILES_SUFFIX, MATCH_ID_INI_CONF_TOML_FILES,
            MATCH_ID_SHELL_BATCH_SCRIPTS_SUFFIX, MATCH_ID_PHP_FILES_SUFFIX, MATCH_ID_RUBY_FILES_SUFFIX,
            MATCH_ID_PERL_FILES_SUFFIX, MATCH_ID_LUA_FILES_SUFFIX, MATCH_ID_GROOVY_FILES_SUFFIX,
            MATCH_ID_SCALA_FILES_SUFFIX, MATCH_ID_R_FILES_SUFFIX, MATCH_ID_APPLESCRIPT_FILES_SUFFIX,
            MATCH_ID_VBSCRIPT_FILES_SUFFIX, MATCH_ID_MAKEFILE_FILES_NAME, MATCH_ID_MATLAB_M_FILES_SUFFIX,
            MATCH_ID_DOCKER_FILES, MATCH_ID_CSS_FILES_SUFFIX, MATCH_ID_XML_HTML_FILES_SUFFIX, // XML/HTML comments are complex, this rule is simple
            MATCH_ID_JSON_FILES_SUFFIX, // JSON doesn't officially support comments, but some variants do (jsonc)
            MATCH_ID_TEX_FILES_SUFFIX, // TeX comments are %
        ] 
    },

    // --- Line Limit Rules ---
    { id: RULE_ID_LIMIT_NONE_BINARY, name: "二进制及非文本文件不保留行", description: "二进制、媒体、压缩包等及特定工具输出文件内容不导出", ruleType: RuleType.LINE_LIMIT, limitType: LineLimitRuleTypeOption.NO_LINES, params: {}, matchIds: [MATCH_ID_BINARY_FILES_SUFFIX] },
    { id: RULE_ID_LIMIT_TAIL_LOGS, name: "日志文件保留尾部100行", description: "日志文件默认保留最后100行", ruleType: RuleType.LINE_LIMIT, limitType: LineLimitRuleTypeOption.TAIL_N, params: { n: 100 }, matchIds: [MATCH_ID_LOG_FILES_SUFFIX] },
];

// --- Default Rulesets ---
export const RULESET_ID_DEFAULT_IMPORT = generateId();
export const RULESET_ID_DEFAULT_COMPRESSION = generateId();
export const RULESET_ID_DEFAULT_LINELIMIT = generateId();

export const DEFAULT_RULESETS: Ruleset[] = [
    { 
        id: RULESET_ID_DEFAULT_IMPORT, name: '默认导入规则集', description: '常用的导入过滤规则，优先排除常见构建产物和依赖，然后导入所有。', type: RuleType.IMPORT, 
        rules: [
            // High priority exclusions
            { id: generateId(), ruleId: RULE_ID_CANCEL_VCS_FOLDERS, priority: 5, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_DEPENDENCY_FOLDERS_BY_NAME, priority: 10, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_DEPENDENCY_FOLDERS_BY_PATH, priority: 11, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_BUILD_OUTPUT_FOLDERS, priority: 15, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_PYTHON_ENV_CACHE_FOLDERS, priority: 16, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_CMAKEFILES_FOLDER, priority: 17, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_DOTDIR_FOLDERS, priority: 18, enabled: true },

            { id: generateId(), ruleId: RULE_ID_CANCEL_BINARY_AND_NONTEXT_FILES, priority: 20, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_LOG_FILES, priority: 21, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_LOCK_FILES, priority: 22, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_C_CPP_LEX_YACC_INTERMEDIATES, priority: 23, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_C_CPP_PREPROCESSOR_OUTPUT, priority: 24, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_ASSEMBLY_CODE, priority: 25, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_MAKEFILE_DEPENDENCIES, priority: 26, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_CMAKE_BUILD_FILES, priority: 27, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_PATCH_BACKUP_FILES, priority: 28, enabled: true },
            
            // Base inclusions (lower priority)
            { id: generateId(), ruleId: RULE_ID_IMPORT_ALL_FOLDERS, priority: 100, enabled: true },
            { id: generateId(), ruleId: RULE_ID_IMPORT_ALL_FILES, priority: 101, enabled: true },
        ]
    },
    { 
        id: RULESET_ID_DEFAULT_COMPRESSION, name: '默认压缩规则集', description: '常用的压缩规则，如去除空行和注释。', type: RuleType.COMPRESSION, 
        rules: [
            { id: generateId(), ruleId: RULE_ID_COMPRESS_REMOVE_EMPTY, priority: 10, enabled: true },
            { id: generateId(), ruleId: RULE_ID_COMPRESS_REMOVE_COMMENTS_CODE_CONFIG, priority: 20, enabled: true },
        ] 
    },
    { 
        id: RULESET_ID_DEFAULT_LINELIMIT, name: '默认行数限制规则集', description: '常用的行数限制，如二进制文件不保留行，日志文件保留尾部。', type: RuleType.LINE_LIMIT, 
        rules: [
            { id: generateId(), ruleId: RULE_ID_LIMIT_NONE_BINARY, priority: 10, enabled: true },
            { id: generateId(), ruleId: RULE_ID_LIMIT_TAIL_LOGS, priority: 20, enabled: true },
        ]
    },
];

// --- Default Operations ---
// Existing operations are fine, these new matches are mostly for exclusion rules
export const OP_ID_SELECT_JS_FILES = generateId();
export const OP_ID_SELECT_PYTHON_FILES = generateId();
export const OP_ID_DESELECT_LOCK_FILES = generateId();
export const OP_ID_SELECT_C_CPP_FILES = generateId();
export const OP_ID_SELECT_JAVA_FILES = generateId();
export const OP_ID_SELECT_RUST_FILES = generateId();
export const OP_ID_SELECT_GO_FILES = generateId();
export const OP_ID_SELECT_CSHARP_FILES = generateId(); 
export const OP_ID_SELECT_MARKDOWN_FILES = generateId();
export const OP_ID_SELECT_TEX_FILES = generateId();
export const OP_ID_SELECT_JSON_FILES = generateId();
export const OP_ID_SELECT_YAML_FILES = generateId();
export const OP_ID_SELECT_XML_HTML_FILES = generateId();
export const OP_ID_SELECT_CSS_FILES = generateId();
export const OP_ID_SELECT_DOCKER_FILES = generateId(); 
export const OP_ID_SELECT_INI_CONF_TOML_FILES = generateId(); 
export const OP_ID_DESELECT_OFFICE_DOCS = generateId(); 
export const OP_ID_SELECT_SHELL_BATCH_SCRIPTS = generateId();
export const OP_ID_SELECT_PHP_FILES = generateId();
export const OP_ID_SELECT_RUBY_FILES = generateId();
export const OP_ID_SELECT_PERL_FILES = generateId();
export const OP_ID_SELECT_LUA_FILES = generateId();
export const OP_ID_SELECT_GROOVY_FILES = generateId();
export const OP_ID_SELECT_SCALA_FILES = generateId();
export const OP_ID_SELECT_R_FILES = generateId();
export const OP_ID_SELECT_APPLESCRIPT_FILES = generateId();
export const OP_ID_SELECT_VBSCRIPT_FILES = generateId();
export const OP_ID_SELECT_MAKEFILE_FILES = generateId(); // For source Makefiles
export const OP_ID_SELECT_MATLAB_M_FILES = generateId();
export const OP_ID_SELECT_TEXT_FILES = generateId();


export const DEFAULT_OPERATIONS: Operation[] = [
    { id: OP_ID_SELECT_JS_FILES, name: "选中所有JS/TS文件", description: "勾选项目中所有JS, TS, JSX, TSX, MJS, CJS 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_JS_TS_FILES_SUFFIX] },
    { id: OP_ID_SELECT_PYTHON_FILES, name: "选中所有Python文件", description: "勾选项目中所有 .py, .pyw 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_PYTHON_FILES_SUFFIX] },
    { id: OP_ID_DESELECT_LOCK_FILES, name: "取消选中所有锁文件", description: "取消勾选项目中所有依赖锁文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.UNCHECK_FILE, matchIds: [MATCH_ID_LOCK_FILES_NAME] },
    { id: OP_ID_SELECT_C_CPP_FILES, name: "选中所有C/C++源文件", description: "勾选项目中所有 C/C++ 源文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_C_CPP_FILES_SUFFIX] },
    { id: OP_ID_SELECT_JAVA_FILES, name: "选中所有Java文件", description: "勾选项目中所有 .java 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_JAVA_FILES_SUFFIX] },
    { id: OP_ID_SELECT_RUST_FILES, name: "选中所有Rust文件", description: "勾选项目中所有 .rs 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_RUST_FILES_SUFFIX] },
    { id: OP_ID_SELECT_GO_FILES, name: "选中所有Go文件", description: "勾选项目中所有 .go 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_GO_FILES_SUFFIX] },
    { id: OP_ID_SELECT_CSHARP_FILES, name: "选中所有C#文件", description: "勾选项目中所有 .cs 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_CSHARP_FILES] },
    { id: OP_ID_SELECT_MARKDOWN_FILES, name: "选中所有Markdown文件", description: "勾选项目中所有 .md, .markdown 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_MARKDOWN_FILES_SUFFIX] },
    { id: OP_ID_SELECT_TEX_FILES, name: "选中所有TeX相关文件", description: "勾选项目中所有 .tex, .bib, .cls, .sty 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_TEX_FILES_SUFFIX] },
    { id: OP_ID_SELECT_JSON_FILES, name: "选中所有JSON文件", description: "勾选项目中所有 .json, .jsonc, .geojson 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_JSON_FILES_SUFFIX] },
    { id: OP_ID_SELECT_YAML_FILES, name: "选中所有YAML文件", description: "勾选项目中所有 .yml, .yaml 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_YAML_FILES_SUFFIX] },
    { id: OP_ID_SELECT_XML_HTML_FILES, name: "选中所有XML/HTML/SVG(Source)文件", description: "勾选项目中所有 .xml, .html, .htm, .xhtml, .svg (源) 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_XML_HTML_FILES_SUFFIX] },
    { id: OP_ID_SELECT_CSS_FILES, name: "选中所有CSS/SCSS/LESS文件", description: "勾选项目中所有 .css, .scss, .sass, .less 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_CSS_FILES_SUFFIX] },
    { id: OP_ID_SELECT_DOCKER_FILES, name: "选中所有Docker文件", description: "勾选项目中所有 Dockerfile, docker-compose 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_DOCKER_FILES] },
    { id: OP_ID_SELECT_INI_CONF_TOML_FILES, name: "选中所有INI/CONF/TOML文件", description: "勾选项目中所有 .ini, .cfg, .conf, .toml 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_INI_CONF_TOML_FILES] },
    { id: OP_ID_DESELECT_OFFICE_DOCS, name: "取消选中Office文档", description: "取消勾选项目中所有Office文档 (.doc, .xls, .ppt 系列)", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.UNCHECK_FILE, matchIds: [MATCH_ID_OFFICE_DOCS_SPECIFIC_SUFFIX] }, // This uses the specific Office match
    { id: OP_ID_SELECT_SHELL_BATCH_SCRIPTS, name: "选中所有Shell/Batch脚本", description: "勾选项目中所有 .sh, .bash, .zsh, .bat, .cmd, .ps1 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_SHELL_BATCH_SCRIPTS_SUFFIX] },
    { id: OP_ID_SELECT_PHP_FILES, name: "选中所有PHP文件", description: "勾选项目中所有 .php 系列文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_PHP_FILES_SUFFIX] },
    { id: OP_ID_SELECT_RUBY_FILES, name: "选中所有Ruby文件", description: "勾选项目中所有 .rb 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_RUBY_FILES_SUFFIX] },
    { id: OP_ID_SELECT_PERL_FILES, name: "选中所有Perl文件", description: "勾选项目中所有 .pl, .pm 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_PERL_FILES_SUFFIX] },
    { id: OP_ID_SELECT_LUA_FILES, name: "选中所有Lua文件", description: "勾选项目中所有 .lua 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_LUA_FILES_SUFFIX] },
    { id: OP_ID_SELECT_GROOVY_FILES, name: "选中所有Groovy文件", description: "勾选项目中所有 .groovy 系列文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_GROOVY_FILES_SUFFIX] },
    { id: OP_ID_SELECT_SCALA_FILES, name: "选中所有Scala文件", description: "勾选项目中所有 .scala, .sc 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_SCALA_FILES_SUFFIX] },
    { id: OP_ID_SELECT_R_FILES, name: "选中所有R文件", description: "勾选项目中所有 .r, .R 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_R_FILES_SUFFIX] },
    { id: OP_ID_SELECT_APPLESCRIPT_FILES, name: "选中所有AppleScript (文本)文件", description: "勾选项目中所有 .applescript 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_APPLESCRIPT_FILES_SUFFIX] },
    { id: OP_ID_SELECT_VBSCRIPT_FILES, name: "选中所有VBScript文件", description: "勾选项目中所有 .vbs 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_VBSCRIPT_FILES_SUFFIX] },
    { id: OP_ID_SELECT_MAKEFILE_FILES, name: "选中所有Makefile(源)", description: "勾选项目中所有 Makefile, makefile, GNUmakefile, *.mk 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_MAKEFILE_FILES_NAME, MATCH_ID_MAKEFILE_WILDCARD_MK] },
    { id: OP_ID_SELECT_MATLAB_M_FILES, name: "选中所有MATLAB .m文件", description: "勾选项目中所有 .m 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_MATLAB_M_FILES_SUFFIX] },
    { id: OP_ID_SELECT_TEXT_FILES, name: "选中所有纯文本文件 (.txt)", description: "勾选项目中所有 .txt 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_TEXT_FILES_SUFFIX] },
];

// --- Default Macros ---
export const MACRO_ID_SELECT_COMMON_CODE = generateId();
export const MACRO_ID_SELECT_DOCS_AND_CONFIGS = generateId();
export const MACRO_ID_SELECT_COMMON_SCRIPTS = generateId();

export const DEFAULT_MACROS: Macro[] = [
    { 
        id: MACRO_ID_SELECT_COMMON_CODE, name: '选中常用代码和构建/标记/样式文件', description: '选中项目中常见的代码、构建、标记和样式文件，并取消选中锁文件。', 
        operations: [
            {id: generateId(), operationId: OP_ID_SELECT_JS_FILES, sequence: 10, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_PYTHON_FILES, sequence: 20, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_C_CPP_FILES, sequence: 30, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_JAVA_FILES, sequence: 40, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_RUST_FILES, sequence: 50, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_GO_FILES, sequence: 60, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_CSHARP_FILES, sequence: 65, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_PHP_FILES, sequence: 66, enabled: true },
            {id: generateId(), operationId: OP_ID_SELECT_RUBY_FILES, sequence: 67, enabled: true },
            {id: generateId(), operationId: OP_ID_SELECT_PERL_FILES, sequence: 68, enabled: true },
            {id: generateId(), operationId: OP_ID_SELECT_LUA_FILES, sequence: 69, enabled: true },
            {id: generateId(), operationId: OP_ID_SELECT_GROOVY_FILES, sequence: 71, enabled: true },
            {id: generateId(), operationId: OP_ID_SELECT_SCALA_FILES, sequence: 72, enabled: true },
            {id: generateId(), operationId: OP_ID_SELECT_R_FILES, sequence: 73, enabled: true },
            {id: generateId(), operationId: OP_ID_SELECT_MATLAB_M_FILES, sequence: 74, enabled: true },
            {id: generateId(), operationId: OP_ID_SELECT_XML_HTML_FILES, sequence: 75, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_CSS_FILES, sequence: 80, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_DOCKER_FILES, sequence: 85, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_MAKEFILE_FILES, sequence: 86, enabled: true},
            {id: generateId(), operationId: OP_ID_DESELECT_LOCK_FILES, sequence: 100, enabled: true}, 
        ]
    },
    {
        id: MACRO_ID_SELECT_DOCS_AND_CONFIGS, name: '选中常用文档和配置文件', description: '选中项目中常见的Markdown, JSON, YAML, INI, CONF, TOML, TXT 文件。',
        operations: [
            {id: generateId(), operationId: OP_ID_SELECT_MARKDOWN_FILES, sequence: 10, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_JSON_FILES, sequence: 20, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_YAML_FILES, sequence: 30, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_INI_CONF_TOML_FILES, sequence: 40, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_TEXT_FILES, sequence: 50, enabled: true},
             {id: generateId(), operationId: OP_ID_SELECT_TEX_FILES, sequence: 60, enabled: true },
        ]
    },
    {
        id: MACRO_ID_SELECT_COMMON_SCRIPTS, name: '选中常用脚本文件', description: '选中项目中常见的Shell, Batch, AppleScript, VBScript 文件。',
        operations: [
            {id: generateId(), operationId: OP_ID_SELECT_SHELL_BATCH_SCRIPTS, sequence: 10, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_APPLESCRIPT_FILES, sequence: 20, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_VBSCRIPT_FILES, sequence: 30, enabled: true},
        ]
    }
];


export const MOCK_FILE_CONTENT = `
// This is a sample JavaScript file.
// It includes comments and empty lines.

function greet(name) {
  // Log a greeting message.
  console.log(\`Hello, \${name}!\`);
}

greet('World'); // Call the function.

// Another comment.

// End of file.
`;

// Extensions for files that should not have their content loaded/processed for lines by default
export const DEFAULT_NO_LINES_EXTENSIONS = Array.from(new Set(binaryFileConditionsWithComments.map(item => item.value.toLowerCase()).concat([
    '.ds_store', 
    // Add other specific non-text or problematic extensions here if not covered by binaryFileConditionsWithComments
]))).sort();
