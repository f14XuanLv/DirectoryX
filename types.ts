
// General
export type UID = string;

// File System
export interface FileSystemNode {
  id: UID;
  name: string;
  path: string; // Full path
  parentId: UID | null;
  type: 'file' | 'directory';
  children?: FileSystemNode[]; // For directories
  selected?: boolean; // For files, for export selection
  descriptionOverride?: string; // 用户为文件或文件夹添加的描述信息
  lineLimitOverride?: LineLimitRule | null; // Specific override for this file
  compressionOverride?: CompressionRuleOptions; // Specific override for this file
}

export interface FileNode extends FileSystemNode {
  type: 'file';
  content?: string; // Loaded content or placeholder, undefined if not loaded yet
  totalLines?: number; // Calculated total lines, undefined if not calculated
  _fileHandle?: FileSystemFileHandle; // Temporary handle for deferred loading
}

export interface DirectoryNode extends FileSystemNode {
  type: 'directory';
  children: FileSystemNode[];
}

// Matches
export enum MatchTargetType {
  FOLDER = '文件夹',
  FILE = '文件',
}

export enum FolderMatchType {
  NAME = '名称匹配',
  WILDCARD = '通配符匹配', // Glob-like for name: *, ?
  REGEX = '正则表达式匹配', // For name
  PATH_WILDCARD = '路径通配符匹配', // Glob-like for path: src/**/name, .yarn/cache
  PATH_REGEX = '路径正则表达式匹配', // For path
}

export enum FileMatchType {
  NAME = '名称匹配', // Substring in name
  SUFFIX = '后缀匹配', // Exact suffix, e.g. ".txt"
  WILDCARD = '通配符匹配', // Glob-like for name: *.txt, file?.log
  REGEX = '正则表达式匹配', // Full regex for name
  PATH_WILDCARD = '路径通配符匹配', // Glob-like for path: src/**/*.ts, docs/*.md
  PATH_REGEX = '路径正则表达式匹配', // For path
}

export interface MatchConditionItem {
  id: UID;
  value: string; // e.g., "*.txt", "node_modules", "src/components/*"
}

export interface BaseMatch {
  id: UID;
  name: string;
  description: string;
  targetType: MatchTargetType; // FOLDER or FILE
  // For FOLDER targetType
  folderMatchType?: FolderMatchType;
  // For FILE targetType
  fileMatchType?: FileMatchType;
  conditions: MatchConditionItem[]; // OR logic between conditions
  isDefault?: boolean; 
}

export interface FolderMatch extends BaseMatch {
  targetType: MatchTargetType.FOLDER;
  folderMatchType: FolderMatchType;
}

export interface FileMatch extends BaseMatch {
  targetType: MatchTargetType.FILE;
  fileMatchType: FileMatchType;
}

export type Match = FolderMatch | FileMatch;


// Rules
export enum RuleType {
  IMPORT = '导入规则',
  COMPRESSION = '压缩规则',
  LINE_LIMIT = '行数限制规则',
}

export interface BaseRule {
  id: UID;
  name: string;
  description: string;
  ruleType: RuleType;
  matchIds: UID[]; // IDs of Match entities this rule applies to (OR logic)
  isDefault?: boolean;
}

// Import Rules
export enum ImportRuleActionType {
  IMPORT_FOLDER = '导入匹配的文件夹',
  CANCEL_IMPORT_FOLDER = '取消导入匹配的文件夹',
  IMPORT_FILE = '导入匹配的文件',
  CANCEL_IMPORT_FILE = '取消导入匹配的文件',
}
export interface ImportRule extends BaseRule {
  ruleType: RuleType.IMPORT;
  actionType: ImportRuleActionType;
}

// Compression Rules
export enum CompressionRuleTypeOption {
  REMOVE_EMPTY_LINES = '去除空行',
  REMOVE_COMMENTS = '去除注释',
  MINIFY = '极致压缩', // Placeholder - complex
}
export interface CompressionRuleOptions { // Can also be used for file-specific overrides
  removeEmptyLines?: boolean;
  removeComments?: boolean;
  minify?: boolean;
}
export interface CompressionRule extends BaseRule, CompressionRuleOptions {
  ruleType: RuleType.COMPRESSION;
}

// Line Limit Rules
export enum LineLimitRuleTypeOption {
  NO_LINES = '不保留任何行',
  HEAD_N = '只保留头部N行',
  TAIL_N = '只保留尾部N行',
  HEAD_M_TAIL_N = '只保留头部M行和尾部N行',
  CUSTOM_RANGE = '自定义区间内的行',
  RANDOM_N = '随机只保留N行', // Placeholder - complex
  RANDOM_PERCENT = '随机只保留百分比行', // Placeholder - complex
}
export interface LineLimitParams {
  n?: number;
  m?: number;
  start?: number; // 1-indexed
  end?: number; // 1-indexed, inclusive
  percent?: number; // 0-100
}
export interface LineLimitRule extends BaseRule {
  ruleType: RuleType.LINE_LIMIT;
  limitType: LineLimitRuleTypeOption;
  params: LineLimitParams;
}

export type Rule = ImportRule | CompressionRule | LineLimitRule;

// Rulesets
export interface RuleInstance {
  id: UID; // Unique ID for this instance within the ruleset
  ruleId: UID; // ID of the actual Rule
  priority: number; // Lower number = higher priority
  enabled: boolean;
}
export interface Ruleset {
  id: UID;
  name: string;
  description: string;
  type: RuleType; // IMPORT, COMPRESSION, or LINE_LIMIT
  rules: RuleInstance[];
  isDefault?: boolean;
}

// Operations (for Macros)
export enum OperationTargetType { // What the operation acts upon
    MATCHED_FOLDER_CONTENT = '匹配的文件夹内的文件', // All files within matched folders
    MATCHED_FILE = '匹配的文件',
}
export enum FolderOperationType { // Actions for MATCHED_FOLDER_CONTENT
    SELECT_ALL = '全选',
    DESELECT_ALL = '全不选',
    INVERT_SELECTION = '反选',
}
export enum FileOperationType { // Actions for MATCHED_FILE
    CHECK_FILE = '勾选',
    UNCHECK_FILE = '取消勾选',
}
export interface BaseOperation {
    id: UID;
    name: string;
    description: string;
    targetType: OperationTargetType;
    matchIds: UID[]; // IDs of Match entities this operation applies to
    isDefault?: boolean;
}
export interface FolderOperation extends BaseOperation {
    targetType: OperationTargetType.MATCHED_FOLDER_CONTENT;
    action: FolderOperationType;
}
export interface FileOperation extends BaseOperation {
    targetType: OperationTargetType.MATCHED_FILE;
    action: FileOperationType;
}
export type Operation = FolderOperation | FileOperation;


// Macros
export interface OperationInstance {
  id: UID; // Unique ID for this instance within the macro
  operationId: UID; // ID of the actual Operation
  sequence: number; // Execution order, lower number executes first
  enabled: boolean;
}
export interface Macro {
  id: UID;
  name: string;
  description: string;
  operations: OperationInstance[];
  isDefault?: boolean;
}


// For Undo/Redo
export interface AppStateSnapshot {
  fileTree: FileSystemNode[];
  // Potentially other parts of state like selections if macros modify them directly
  // For macro undo/redo, it might specifically snapshot file selections
  selectedFileIds?: Set<UID>; // Example for macro undo/redo
}

// For query components (search)
export interface QueryResult<T> {
  item: T;
  index: number;
}

// MainView Enum
export enum MainView {
  FILES = "文件",
  MATCHING_LIBRARY = "匹配库",
  RULESETS = "规则集",
  MACRO_OPERATIONS = "宏操作",
}

// Global settings for prototype (simplified approach)
export interface GlobalExportSettings {
  defaultExcludeFolders: string[];
  defaultExcludeFiles: string[];
}

// Export types for FilesView
export enum ExportType {
  MERGE_SELECTED = '合并导出选中的文件',
  SEPARATE_SELECTED = '分开导出选中的文件', // Re-added
  DIRECTORY_TREE = '导出目录树',
}

// Augment the global Window interface for File System Access API
declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
      startIn?: FileSystemHandle | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos";
    }) => Promise<FileSystemDirectoryHandle>;
  }

  // Assuming FileSystemHandle and FileSystemDirectoryHandle are globally available
  // from 'lib: ["dom"]' in tsconfig. If not, they might need basic definitions here.
  // For example:
  // interface FileSystemHandle {
  //   kind: 'file' | 'directory';
  //   name: string;
  //   // Add other necessary methods/properties if not available
  // }
  // interface FileSystemDirectoryHandle extends FileSystemHandle {
  //   kind: 'directory';
  //   // Add other necessary methods/properties if not available
  // }
}
