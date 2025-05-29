
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
export const COPY_ICON = React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5-.124m7.5 10.375h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.522-.175A1.125 1.125 0 005.25 3.375m10.5 11.25h-3.375c-.621 0-1.125.504-1.125 1.125v3.375c0 .621.504 1.125 1.125 1.125h3.375c.621 0 1.125-.504 1.125-1.125V16.5a1.125 1.125 0 00-1.125-1.125z" }));
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

// --- Default Matches ---
export const MATCH_ID_IGNORE_GIT_FOLDER = generateId();
export const MATCH_ID_IGNORE_NODE_MODULES_FOLDER = generateId();
export const MATCH_ID_IGNORE_COMMON_BUILD_FOLDERS = generateId(); // target, build, dist
export const MATCH_ID_IGNORE_VENV_PYCACHE = generateId();
export const MATCH_ID_BINARY_FILES_SUFFIX = generateId();
export const MATCH_ID_LOG_FILES_SUFFIX = generateId();
export const MATCH_ID_ARCHIVE_FILES_SUFFIX = generateId();
export const MATCH_ID_LOCK_FILES_NAME = generateId();
export const MATCH_ID_ALL_FOLDERS_WILDCARD = generateId();
export const MATCH_ID_ALL_FILES_WILDCARD = generateId();
export const MATCH_ID_JS_TS_FILES_SUFFIX = generateId();
export const MATCH_ID_PYTHON_FILES_SUFFIX = generateId();


export const DEFAULT_MATCHES: Match[] = [
    { id: MATCH_ID_IGNORE_GIT_FOLDER, name: "忽略 .git 文件夹", description: "匹配 .git 文件夹", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: ".git"}] },
    { id: MATCH_ID_IGNORE_NODE_MODULES_FOLDER, name: "忽略 node_modules", description: "匹配 node_modules 文件夹", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: "node_modules"}] },
    { id: MATCH_ID_IGNORE_COMMON_BUILD_FOLDERS, name: "忽略通用构建输出文件夹", description: "匹配 target, build, dist 文件夹", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: "target"}, {id: generateId(), value: "build"}, {id: generateId(), value: "dist"}] },
    { id: MATCH_ID_IGNORE_VENV_PYCACHE, name: "忽略Python虚拟环境和缓存", description: "匹配 venv, .venv, __pycache__ 文件夹", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.NAME, conditions: [{id: generateId(), value: "venv"}, {id: generateId(), value: ".venv"}, {id: generateId(), value: "__pycache__"}] },
    { id: MATCH_ID_BINARY_FILES_SUFFIX, name: "常见二进制文件后缀", description: "匹配 .exe, .dll, .so, .o, .a, .lib, .obj, .class, .jar, .war, .ear, .pyc, .pyo 等", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [
        '.exe', '.dll', '.so', '.o', '.a', '.lib', '.obj', 
        '.class', '.jar', '.war', '.ear', '.pyc', '.pyo',
        '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.ico', '.webp',
        '.mp3', '.wav', '.ogg', '.aac', '.flac', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv',
        '.eot', '.ttf', '.woff', '.woff2', '.otf', '.pdf'
    ].map(ext => ({id: generateId(), value: ext})) },
    { id: MATCH_ID_LOG_FILES_SUFFIX, name: "日志文件", description: "匹配 .log 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".log"}] },
    { id: MATCH_ID_ARCHIVE_FILES_SUFFIX, name: "压缩包文件", description: "匹配 .zip, .tar, .gz 等", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [
        '.zip', '.tar', '.gz', '.rar', '.7z', '.bz2', '.xz'
    ].map(ext => ({id: generateId(), value: ext})) },
    { id: MATCH_ID_LOCK_FILES_NAME, name: "锁文件", description: "匹配 package-lock.json, yarn.lock, composer.lock, Gemfile.lock, poetry.lock, Pipfile.lock", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.NAME, conditions: [
        'package-lock.json', 'yarn.lock', 'composer.lock', 'Gemfile.lock', 'poetry.lock', 'Pipfile.lock'
    ].map(name => ({id: generateId(), value: name})) },
    { id: MATCH_ID_ALL_FOLDERS_WILDCARD, name: "所有文件夹 (通配符)", description: "匹配所有文件夹", targetType: MatchTargetType.FOLDER, folderMatchType: FolderMatchType.WILDCARD, conditions: [{id: generateId(), value: "*"}]},
    { id: MATCH_ID_ALL_FILES_WILDCARD, name: "所有文件 (通配符)", description: "匹配所有文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.WILDCARD, conditions: [{id: generateId(), value: "*.*"}]},
    { id: MATCH_ID_JS_TS_FILES_SUFFIX, name: "JS/TS 文件", description: "匹配 .js, .ts, .jsx, .tsx 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: ['.js', '.ts', '.jsx', '.tsx'].map(ext => ({id: generateId(), value: ext}))},
    { id: MATCH_ID_PYTHON_FILES_SUFFIX, name: "Python 文件", description: "匹配 .py 文件", targetType: MatchTargetType.FILE, fileMatchType: FileMatchType.SUFFIX, conditions: [{id: generateId(), value: ".py"}]},
];

// --- Default Rules ---
export const RULE_ID_IMPORT_ALL_FOLDERS = generateId();
export const RULE_ID_IMPORT_ALL_FILES = generateId();
export const RULE_ID_CANCEL_IGNORE_FOLDERS = generateId();
export const RULE_ID_CANCEL_BINARY_FILES = generateId();
export const RULE_ID_CANCEL_LOG_FILES = generateId();
export const RULE_ID_CANCEL_ARCHIVE_FILES = generateId();
export const RULE_ID_CANCEL_LOCK_FILES = generateId();

export const RULE_ID_COMPRESS_REMOVE_EMPTY = generateId();
export const RULE_ID_COMPRESS_REMOVE_COMMENTS_CODE = generateId();

export const RULE_ID_LIMIT_NONE_BINARY = generateId();
export const RULE_ID_LIMIT_TAIL_LOGS = generateId();

export const DEFAULT_RULES: Rule[] = [
    // Import Rules
    { id: RULE_ID_IMPORT_ALL_FOLDERS, name: "导入所有文件夹", description: "默认导入所有遇到的文件夹", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.IMPORT_FOLDER, matchIds: [MATCH_ID_ALL_FOLDERS_WILDCARD] },
    { id: RULE_ID_IMPORT_ALL_FILES, name: "导入所有文件", description: "默认导入所有遇到的文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.IMPORT_FILE, matchIds: [MATCH_ID_ALL_FILES_WILDCARD] },
    { id: RULE_ID_CANCEL_IGNORE_FOLDERS, name: "取消导入忽略文件夹", description: "不导入 .git, node_modules 等文件夹", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FOLDER, matchIds: [MATCH_ID_IGNORE_GIT_FOLDER, MATCH_ID_IGNORE_NODE_MODULES_FOLDER, MATCH_ID_IGNORE_COMMON_BUILD_FOLDERS, MATCH_ID_IGNORE_VENV_PYCACHE] },
    { id: RULE_ID_CANCEL_BINARY_FILES, name: "取消导入二进制文件", description: "不导入常见的二进制文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_BINARY_FILES_SUFFIX] },
    { id: RULE_ID_CANCEL_LOG_FILES, name: "取消导入日志文件", description: "不导入 .log 文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_LOG_FILES_SUFFIX] },
    { id: RULE_ID_CANCEL_ARCHIVE_FILES, name: "取消导入压缩包文件", description: "不导入 .zip, .tar 等文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_ARCHIVE_FILES_SUFFIX] },
    { id: RULE_ID_CANCEL_LOCK_FILES, name: "取消导入锁文件", description: "不导入 package-lock.json 等文件", ruleType: RuleType.IMPORT, actionType: ImportRuleActionType.CANCEL_IMPORT_FILE, matchIds: [MATCH_ID_LOCK_FILES_NAME] },
    // Compression Rules
    { id: RULE_ID_COMPRESS_REMOVE_EMPTY, name: "去除空行 (所有文件)", description: "去除所有文本文件中的空行", ruleType: RuleType.COMPRESSION, removeEmptyLines: true, matchIds: [MATCH_ID_ALL_FILES_WILDCARD] },
    { id: RULE_ID_COMPRESS_REMOVE_COMMENTS_CODE, name: "去除注释 (代码文件)", description: "去除 JS/TS/Python 文件中的常见注释", ruleType: RuleType.COMPRESSION, removeComments: true, matchIds: [MATCH_ID_JS_TS_FILES_SUFFIX, MATCH_ID_PYTHON_FILES_SUFFIX] },
    // Line Limit Rules
    { id: RULE_ID_LIMIT_NONE_BINARY, name: "二进制文件不保留行", description: "二进制文件内容不导出", ruleType: RuleType.LINE_LIMIT, limitType: LineLimitRuleTypeOption.NO_LINES, params: {}, matchIds: [MATCH_ID_BINARY_FILES_SUFFIX, MATCH_ID_ARCHIVE_FILES_SUFFIX] },
    { id: RULE_ID_LIMIT_TAIL_LOGS, name: "日志文件保留尾部100行", description: "日志文件默认保留最后100行", ruleType: RuleType.LINE_LIMIT, limitType: LineLimitRuleTypeOption.TAIL_N, params: { n: 100 }, matchIds: [MATCH_ID_LOG_FILES_SUFFIX] },
];

// --- Default Rulesets ---
export const RULESET_ID_DEFAULT_IMPORT = generateId();
export const RULESET_ID_DEFAULT_COMPRESSION = generateId();
export const RULESET_ID_DEFAULT_LINELIMIT = generateId();

export const DEFAULT_RULESETS: Ruleset[] = [
    { 
        id: RULESET_ID_DEFAULT_IMPORT, name: '默认导入规则集', description: '常用的导入过滤规则', type: RuleType.IMPORT, 
        rules: [
            { id: generateId(), ruleId: RULE_ID_IMPORT_ALL_FOLDERS, priority: 100, enabled: true },
            { id: generateId(), ruleId: RULE_ID_IMPORT_ALL_FILES, priority: 100, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_IGNORE_FOLDERS, priority: 10, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_BINARY_FILES, priority: 20, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_LOG_FILES, priority: 21, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_ARCHIVE_FILES, priority: 22, enabled: true },
            { id: generateId(), ruleId: RULE_ID_CANCEL_LOCK_FILES, priority: 23, enabled: true },
        ]
    },
    { 
        id: RULESET_ID_DEFAULT_COMPRESSION, name: '默认压缩规则集', description: '常用的压缩规则', type: RuleType.COMPRESSION, 
        rules: [
            { id: generateId(), ruleId: RULE_ID_COMPRESS_REMOVE_EMPTY, priority: 10, enabled: true },
            { id: generateId(), ruleId: RULE_ID_COMPRESS_REMOVE_COMMENTS_CODE, priority: 20, enabled: true },
        ] 
    },
    { 
        id: RULESET_ID_DEFAULT_LINELIMIT, name: '默认行数限制规则集', description: '常用的行数限制', type: RuleType.LINE_LIMIT, 
        rules: [
            { id: generateId(), ruleId: RULE_ID_LIMIT_NONE_BINARY, priority: 10, enabled: true },
            { id: generateId(), ruleId: RULE_ID_LIMIT_TAIL_LOGS, priority: 20, enabled: true },
        ]
    },
];

// --- Default Operations ---
export const OP_ID_SELECT_JS_FILES = generateId();
export const OP_ID_SELECT_PYTHON_FILES = generateId();
export const OP_ID_DESELECT_LOCK_FILES = generateId();

export const DEFAULT_OPERATIONS: Operation[] = [
    { id: OP_ID_SELECT_JS_FILES, name: "选中所有JS/TS文件", description: "勾选项目中所有JS, TS, JSX, TSX 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_JS_TS_FILES_SUFFIX] },
    { id: OP_ID_SELECT_PYTHON_FILES, name: "选中所有Python文件", description: "勾选项目中所有 .py 文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.CHECK_FILE, matchIds: [MATCH_ID_PYTHON_FILES_SUFFIX] },
    { id: OP_ID_DESELECT_LOCK_FILES, name: "取消选中所有锁文件", description: "取消勾选项目中所有锁文件", targetType: OperationTargetType.MATCHED_FILE, action: FileOperationType.UNCHECK_FILE, matchIds: [MATCH_ID_LOCK_FILES_NAME] },
];

// --- Default Macros ---
export const MACRO_ID_SELECT_COMMON_CODE = generateId();

export const DEFAULT_MACROS: Macro[] = [
    { 
        id: MACRO_ID_SELECT_COMMON_CODE, name: '选中常用代码文件', description: '选中项目中常见的JS/TS和Python代码文件，并取消选中锁文件。', 
        operations: [
            {id: generateId(), operationId: OP_ID_SELECT_JS_FILES, sequence: 10, enabled: true},
            {id: generateId(), operationId: OP_ID_SELECT_PYTHON_FILES, sequence: 20, enabled: true},
            {id: generateId(), operationId: OP_ID_DESELECT_LOCK_FILES, sequence: 30, enabled: true},
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

export const DEFAULT_NO_LINES_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.ico', '.webp',
    '.svg', 
    '.pdf', 
    '.doc', '.docx', '.odt',
    '.xls', '.xlsx', '.ods',
    '.ppt', '.pptx', '.odp',
    '.mp3', '.wav', '.ogg', '.aac', '.flac',
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv',
    '.eot', '.ttf', '.woff', '.woff2', '.otf', // Added otf
    '.zip', '.tar', '.gz', '.rar', '.7z', '.bz2', '.xz', // Moved archives here as they generally don't have lines
    '.exe', '.dll', '.so', '.o', '.a', '.lib', '.obj',
    '.class', '.jar', '.war', '.ear',
    '.pyc', '.pyo',
    '.DS_Store',
];
