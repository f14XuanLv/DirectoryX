
import React, { createContext, useState, useContext, useCallback, ReactNode, useMemo } from 'react';
import { 
  UID, FileSystemNode, FileNode, DirectoryNode, AppStateSnapshot,
  Match, Rule, Ruleset, Operation, Macro, RuleInstance, OperationInstance,
  MatchTargetType, FolderMatchType, FileMatchType, MatchConditionItem, FolderMatch, FileMatch,
  RuleType, ImportRule, ImportRuleActionType, CompressionRule, CompressionRuleOptions, CompressionRuleTypeOption,
  LineLimitRule, LineLimitRuleTypeOption, LineLimitParams,
  OperationTargetType, FolderOperation, FolderOperationType, FileOperation, FileOperationType,
  ExportType, GlobalExportSettings
} from '../types';
import { 
    DEFAULT_NO_LINES_EXTENSIONS, 
    DEFAULT_MATCHES, DEFAULT_RULES, DEFAULT_RULESETS, DEFAULT_OPERATIONS, DEFAULT_MACROS,
    RULESET_ID_DEFAULT_IMPORT, RULESET_ID_DEFAULT_COMPRESSION, RULESET_ID_DEFAULT_LINELIMIT
} from '../constants';

const generateId = (): UID => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const DEFAULT_EXCLUDE_FOLDERS = ['node_modules', '.git', '.svn', '.hg', '.idea', '.vscode', 'target', 'build', 'dist', '__pycache__', 'venv', '.env'];
const DEFAULT_EXCLUDE_FILE_EXTENSIONS_PATTERNS = [
    '.DS_Store', '.Spotlight-V100', '.Trashes', 'Thumbs.db', 
];

// Helper for wildcard to regex
const wildcardToRegex = (pattern: string): RegExp => {
    const escapedPattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
    const regexPattern = escapedPattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`, 'i'); // Case-insensitive
};


interface AppContextType {
  // File System
  fileTree: FileSystemNode[];
  setFileTree: React.Dispatch<React.SetStateAction<FileSystemNode[]>>;
  importDirectory: (handles?: FileSystemDirectoryHandle[]) => Promise<void>;
  updateNodeSelectionInTree: (nodeId: UID, selected: boolean) => void;
  updateNodeProperties: (nodeId: UID, properties: Partial<Pick<FileSystemNode, 'descriptionOverride' | 'lineLimitOverride' | 'compressionOverride'>>) => void;
  
  // Matches
  matches: Match[];
  addMatch: (match: Omit<Match, 'id' | 'isDefault'>) => Match;
  updateMatch: (match: Match) => void;
  deleteMatch: (matchId: UID) => void;
  getMatchById: (id: UID) => Match | undefined;
  checkNodeAgainstMatchConditions: (node: FileSystemNode, match: Match) => boolean; // Expose for testing in UI

  // Rules
  rules: Rule[];
  addRule: (rule: Omit<Rule, 'id' | 'isDefault'>) => Rule;
  updateRule: (rule: Rule) => void;
  deleteRule: (ruleId: UID) => void;
  getRuleById: (id: UID) => Rule | undefined;

  // Rulesets
  rulesets: Ruleset[];
  addRuleset: (ruleset: Omit<Ruleset, 'id' | 'rules' | 'isDefault'>) => Ruleset;
  updateRuleset: (ruleset: Ruleset) => void;
  deleteRuleset: (rulesetId: UID) => void;
  copyRuleset: (rulesetId: UID) => Ruleset | null;
  getRulesetById: (id: UID) => Ruleset | undefined;
  addRuleToRuleset: (rulesetId: UID, ruleId: UID, priority?: number, enabled?: boolean) => void;
  updateRuleInRuleset: (rulesetId: UID, ruleInstanceId: UID, updates: Partial<RuleInstance>) => void;
  removeRuleFromRuleset: (rulesetId: UID, ruleInstanceId: UID) => void;
  replaceRuleInRuleset: (rulesetId: UID, ruleInstanceIdToReplace: UID, newRuleId: UID) => void;
  reorderRuleInRuleset: (rulesetId: UID, ruleInstanceId: UID, direction: 'up' | 'down') => void;


  selectedImportRulesetId: UID | null;
  setSelectedImportRulesetId: React.Dispatch<React.SetStateAction<UID | null>>;
  selectedCompressionRulesetId: UID | null;
  setSelectedCompressionRulesetId: React.Dispatch<React.SetStateAction<UID | null>>;
  selectedLineLimitRulesetId: UID | null;
  setSelectedLineLimitRulesetId: React.Dispatch<React.SetStateAction<UID | null>>;

  // Operations
  operations: Operation[];
  addOperation: (operation: Omit<Operation, 'id' | 'isDefault'>) => Operation;
  updateOperation: (operation: Operation) => void;
  deleteOperation: (operationId: UID) => void;
  getOperationById: (id: UID) => Operation | undefined;

  // Macros
  macros: Macro[];
  addMacro: (macro: Omit<Macro, 'id' | 'operations' | 'isDefault'>) => Macro;
  updateMacro: (macro: Macro) => void;
  deleteMacro: (macroId: UID) => void;
  copyMacro: (macroId: UID) => Macro | null;
  getMacroById: (id: UID) => Macro | undefined;
  addOperationToMacro: (macroId: UID, operationId: UID, sequence?: number, enabled?: boolean) => void;
  updateOperationInMacro: (macroId: UID, opInstanceId: UID, updates: Partial<OperationInstance>) => void;
  removeOperationFromMacro: (macroId: UID, opInstanceId: UID) => void;
  replaceOperationInMacro: (macroId: UID, operationInstanceIdToReplace: UID, newOperationId: UID) => void;
  reorderOperationInMacro: (macroId: UID, operationInstanceId: UID, direction: 'up' | 'down') => void;

  // Export
  exportContent: (exportType: ExportType) => Promise<void>;

  // Global Settings
  globalSettings: GlobalExportSettings;

  // Undo/Redo for File Tree modifications (e.g. properties, manual selections)
  fileTreeUndoStack: AppStateSnapshot[];
  fileTreeRedoStack: AppStateSnapshot[];
  saveFileTreeSnapshot: () => void;
  undoFileTreeAction: () => void;
  redoFileTreeAction: () => void;
  canUndoFileTree: boolean;
  canRedoFileTree: boolean;

  // Undo/Redo for Macro Execution
  macroUndoStack: AppStateSnapshot[]; // Snapshots of fileTree selections
  macroRedoStack: AppStateSnapshot[];
  executeMacro: (macroId: UID) => void;
  undoMacroExecution: () => void;
  redoMacroExecution: () => void;
  canUndoMacro: boolean;
  canRedoMacro: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [fileTree, setFileTree] = useState<FileSystemNode[]>([]);
  const [globalSettings, _setGlobalSettings] = useState<GlobalExportSettings>({
    defaultExcludeFolders: DEFAULT_EXCLUDE_FOLDERS,
    defaultExcludeFiles: DEFAULT_EXCLUDE_FILE_EXTENSIONS_PATTERNS,
  });

  const [matches, setMatches] = useState<Match[]>(DEFAULT_MATCHES);
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [rulesets, setRulesets] = useState<Ruleset[]>(DEFAULT_RULESETS);
  const [operations, setOperations] = useState<Operation[]>(DEFAULT_OPERATIONS);
  const [macros, setMacros] = useState<Macro[]>(DEFAULT_MACROS);

  const [selectedImportRulesetId, setSelectedImportRulesetId] = useState<UID | null>(RULESET_ID_DEFAULT_IMPORT);
  const [selectedCompressionRulesetId, setSelectedCompressionRulesetId] = useState<UID | null>(RULESET_ID_DEFAULT_COMPRESSION);
  const [selectedLineLimitRulesetId, setSelectedLineLimitRulesetId] = useState<UID | null>(RULESET_ID_DEFAULT_LINELIMIT);
  
  const [fileTreeUndoStack, setFileTreeUndoStack] = useState<AppStateSnapshot[]>([]);
  const [fileTreeRedoStack, setFileTreeRedoStack] = useState<AppStateSnapshot[]>([]);
  const [macroUndoStack, setMacroUndoStack] = useState<AppStateSnapshot[]>([]);
  const [macroRedoStack, setMacroRedoStack] = useState<AppStateSnapshot[]>([]);

  // --- FileTree Snapshot and Undo/Redo ---
  const saveFileTreeSnapshot = useCallback(() => {
    const snapshot: AppStateSnapshot = { fileTree: JSON.parse(JSON.stringify(fileTree)) }; // Deep copy
    setFileTreeUndoStack(prev => [...prev, snapshot].slice(-20)); // Limit stack size
    setFileTreeRedoStack([]);
  }, [fileTree]);

  const undoFileTreeAction = () => {
    if (fileTreeUndoStack.length > 0) {
      const lastState = fileTreeUndoStack[fileTreeUndoStack.length - 1];
      const currentSnapshot: AppStateSnapshot = { fileTree: JSON.parse(JSON.stringify(fileTree)) };
      setFileTreeRedoStack(prev => [currentSnapshot, ...prev].slice(-20));
      setFileTreeUndoStack(prev => prev.slice(0, -1));
      setFileTree(lastState.fileTree);
    }
  };

  const redoFileTreeAction = () => {
    if (fileTreeRedoStack.length > 0) {
      const nextState = fileTreeRedoStack[0];
      const currentSnapshot: AppStateSnapshot = { fileTree: JSON.parse(JSON.stringify(fileTree)) };
      setFileTreeUndoStack(prev => [...prev, currentSnapshot].slice(-20));
      setFileTreeRedoStack(prev => prev.slice(1));
      setFileTree(nextState.fileTree);
    }
  };
  
  // --- Match Helpers ---
  const checkNodeAgainstMatchConditions = (node: FileSystemNode, match: Match): boolean => {
    if (node.type !== (match.targetType === MatchTargetType.FOLDER ? 'directory' : 'file')) return false;

    return match.conditions.some(condition => {
        const nodeName = node.name; // Use original case for regex, lowercase for others
        const conditionValue = condition.value;

        if (match.targetType === MatchTargetType.FOLDER) {
            const fm = match as FolderMatch;
            switch (fm.folderMatchType) {
                case FolderMatchType.NAME: return nodeName.toLowerCase().includes(conditionValue.toLowerCase());
                case FolderMatchType.WILDCARD: return wildcardToRegex(conditionValue).test(nodeName);
                case FolderMatchType.REGEX: 
                    try { return new RegExp(conditionValue).test(nodeName); } catch (e) { console.error("Invalid Regex:", conditionValue, e); return false; }
                default: return false;
            }
        } else { // FILE
            const fm = match as FileMatch;
            switch (fm.fileMatchType) {
                case FileMatchType.NAME: return nodeName.toLowerCase().includes(conditionValue.toLowerCase());
                case FileMatchType.SUFFIX: return nodeName.toLowerCase().endsWith(conditionValue.toLowerCase().startsWith('.') ? conditionValue.toLowerCase() : `.${conditionValue.toLowerCase()}`);
                case FileMatchType.WILDCARD: return wildcardToRegex(conditionValue).test(nodeName);
                case FileMatchType.REGEX:
                    try { return new RegExp(conditionValue).test(nodeName); } catch (e) { console.error("Invalid Regex:", conditionValue, e); return false; }
                default: return false;
            }
        }
    });
  };

  const checkNodeMatchesAny = (node: FileSystemNode, matchIds: UID[]): boolean => {
    return matchIds.some(matchId => {
        const match = matches.find(m => m.id === matchId);
        return match ? checkNodeAgainstMatchConditions(node, match) : false;
    });
  };


  // --- Import Directory & Rule Application ---
  const applyImportRules = (nodes: FileSystemNode[], rulesetId: UID | null): FileSystemNode[] => {
    const ruleset = rulesetId ? rulesets.find(rs => rs.id === rulesetId && rs.type === RuleType.IMPORT) : null;
    if (!ruleset || ruleset.rules.length === 0) return nodes;

    // Sort rule instances by priority (highest number = lowest priority = processed first)
    // This allows higher actual priority (lower number) rules processed later to override.
    const sortedRuleInstances = [...ruleset.rules].sort((a, b) => b.priority - a.priority);

    let decisionMap = new Map<UID, { included: boolean, reason: string }>();

    // Initialize all nodes: folders are provisionally included if their parent is (or if they are root and no cancel rule applies first)
    // files are provisionally excluded unless an import file rule applies.
    // Default behavior: import nothing, unless a rule says so.
    // Or, more practically: start with everything "potentially" importable, then prune.
    // The spec implies: Import All (low priority), then Cancel specific (high priority).
    // So, "Import All" sets base to true. "Cancel" sets to false.
    // The loop processes from lowest priority (e.g., 100) to highest (e.g., 10).
    // The decision made by the highest priority rule that matches will be the final one.

    function processNode(node: FileSystemNode, parentDecision: {included: boolean, reason: string} | null) {
        let nodeIncluded = parentDecision?.included ?? false; // Tentative: if parent included, child might be. Default to not included.
        let ruleReason = parentDecision?.reason ?? "默认未包含";

        for (const ruleInstance of sortedRuleInstances) { // Iterates from low priority (e.g. 100) to high (e.g. 10)
            if (!ruleInstance.enabled) continue;
            const rule = rules.find(r => r.id === ruleInstance.ruleId && r.ruleType === RuleType.IMPORT) as ImportRule | undefined;
            if (!rule) continue;

            if (checkNodeMatchesAny(node, rule.matchIds)) {
                // This rule matches. Its decision will take precedence over lower-priority rules processed earlier.
                switch (rule.actionType) {
                    case ImportRuleActionType.IMPORT_FILE:
                        if (node.type === 'file') { nodeIncluded = true; ruleReason = `规则: ${rule.name}`; }
                        break;
                    case ImportRuleActionType.IMPORT_FOLDER:
                        if (node.type === 'directory') { nodeIncluded = true; ruleReason = `规则: ${rule.name}`; }
                        break;
                    case ImportRuleActionType.CANCEL_IMPORT_FILE:
                        if (node.type === 'file') { nodeIncluded = false; ruleReason = `规则: ${rule.name}`; }
                        break;
                    case ImportRuleActionType.CANCEL_IMPORT_FOLDER:
                        if (node.type === 'directory') { nodeIncluded = false; ruleReason = `规则: ${rule.name}`; }
                        break;
                }
            }
        }
        decisionMap.set(node.id, { included: nodeIncluded, reason: ruleReason });

        if (node.type === 'directory' && node.children) {
            node.children.forEach(child => processNode(child, { included: nodeIncluded, reason: `父文件夹 (${node.name}) ${nodeIncluded ? '已导入' : '已取消导入'}` }));
        }
    }

    nodes.forEach(node => processNode(node, null));

    const filterTree = (nodesToFilter: FileSystemNode[]): FileSystemNode[] => {
      return nodesToFilter
        .filter(node => decisionMap.get(node.id)?.included)
        .map(node => {
          if (node.type === 'directory' && node.children) {
            return { ...node, children: filterTree(node.children) };
          }
          return node;
        });
    };
    
    return filterTree(JSON.parse(JSON.stringify(nodes))); // Work on a deep copy
  };

  const importDirectory = async (handles?: FileSystemDirectoryHandle[]) => {
    saveFileTreeSnapshot();
    let rawNodes: FileSystemNode[] = [];
    let idCounter = Date.now();

    const isDefaultExcluded = (name: string, itemType: 'file' | 'directory'): boolean => {
      const lowerName = name.toLowerCase();
      if (itemType === 'directory') return globalSettings.defaultExcludeFolders.includes(lowerName);
      return globalSettings.defaultExcludeFiles.some(pattern => lowerName.endsWith(pattern) || wildcardToRegex(pattern).test(lowerName));
    };
    
    const isNoLinesContent = (name: string): boolean => DEFAULT_NO_LINES_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext));

    const processHandle = async (handle: FileSystemHandle, parentId: UID | null, currentPath: string): Promise<FileSystemNode | null> => {
        const itemType = handle.kind as ('file' | 'directory');
        // Initial default exclusion, ruleset will refine this.
        // if (isDefaultExcluded(handle.name, itemType)) return null; 

        const nodeId = `node-${idCounter++}-${handle.name.replace(/[^a-zA-Z0-9_.-]/g, '')}`; 
        const path = `${currentPath}${parentId ? '/' : ''}${handle.name}`;

        if (itemType === 'file') {
            const fileHandle = handle as FileSystemFileHandle;
            let content = ""; let totalLines = 0; const noLines = isNoLinesContent(handle.name);
            try {
                const file = await fileHandle.getFile();
                if (!noLines) { content = await file.text(); totalLines = content.split('\n').length; }
                else { content = "[二进制或非文本文件内容不加载]"; }
            } catch (e) { content = noLines ? "[二进制或非文本文件内容不加载]" : "[无法读取文件内容]"; }
            
            return {
                id: nodeId, name: handle.name, type: 'file', path, parentId, selected: false, content, totalLines,
                lineLimitOverride: noLines ? {
                    id: generateId(), name: '默认无内容', description: '二进制/非文本文件默认不导出内容',
                    ruleType: RuleType.LINE_LIMIT, matchIds: [],
                    limitType: LineLimitRuleTypeOption.NO_LINES, params: {}
                } : null,
            } as FileNode;
        } else { // directory
            const dirNode: DirectoryNode = { id: nodeId, name: handle.name, type: 'directory', path, parentId, children: [] };
            const entries: FileSystemHandle[] = []; 
            for await (const entry of (handle as FileSystemDirectoryHandle).values()) entries.push(entry);
            entries.sort((a,b) => (a.kind === 'directory' && b.kind === 'file') ? -1 : (a.kind === 'file' && b.kind === 'directory') ? 1 : a.name.localeCompare(b.name, 'zh-CN-u-co-pinyin'));
            for (const entry of entries) {
                const childNode = await processHandle(entry, nodeId, path);
                if (childNode) dirNode.children.push(childNode);
            }
            return dirNode;
        }
    };
      
    try {
      if (handles && handles.length > 0) {
        for (const handle of handles) { 
          const rootNode = await processHandle(handle, null, "");
          if (rootNode) rawNodes.push(rootNode);
        }
      } else { 
        const mockIndexTs: FileSystemFileHandle = { 
            name: "index.ts", kind: 'file', isSameEntry: async () => false, 
            getFile: async () => new File(["console.log('hello world from mock index.ts');\n// another line"], "index.ts", {type: "text/typescript"}),
            createWritable: async () => ({} as FileSystemWritableFileStream) 
        };
        const mockReadmeMd: FileSystemFileHandle = { 
            name: "README.md", kind: 'file', isSameEntry: async () => false, 
            getFile: async () => new File(["# Mock Project Readme\n\nThis is a mock project."], "README.md", {type: "text/markdown"}),
            createWritable: async () => ({} as FileSystemWritableFileStream) 
        };
        const mockSrcDir: FileSystemDirectoryHandle = {
            name: "src", kind: 'directory', isSameEntry: async () => false, 
            values: async function*(): AsyncGenerator<FileSystemHandle, void, undefined> { yield mockIndexTs; },
            keys: async function*(): AsyncGenerator<string, void, undefined> { yield mockIndexTs.name; },
            entries: async function*(): AsyncGenerator<[string, FileSystemHandle], void, undefined> { yield [mockIndexTs.name, mockIndexTs]; },
            async *[Symbol.asyncIterator](): AsyncGenerator<[string, FileSystemHandle], void, undefined> {
                for await (const entry of this.entries()) {
                    yield entry;
                }
            },
            getDirectoryHandle: async () => ({} as FileSystemDirectoryHandle), 
            getFileHandle: async () => ({} as FileSystemFileHandle), 
            removeEntry: async () => {}, 
            resolve: async () => null, 
        };
        
        const mockRoot: FileSystemDirectoryHandle = { 
            name: "示例项目", kind: 'directory', isSameEntry: async () => false, 
            values: async function*(): AsyncGenerator<FileSystemHandle, void, undefined> { 
                yield mockSrcDir;
                yield mockReadmeMd; 
            },
            keys: async function*(): AsyncGenerator<string, void, undefined> {
                yield mockSrcDir.name;
                yield mockReadmeMd.name;
            },
            entries: async function*(): AsyncGenerator<[string, FileSystemHandle], void, undefined> {
                yield [mockSrcDir.name, mockSrcDir];
                yield [mockReadmeMd.name, mockReadmeMd];
            },
            async *[Symbol.asyncIterator](): AsyncGenerator<[string, FileSystemHandle], void, undefined> {
                 for await (const entry of this.entries()) {
                    yield entry;
                }
            },
            getDirectoryHandle: async () => ({} as FileSystemDirectoryHandle), 
            getFileHandle: async () => ({} as FileSystemFileHandle), 
            removeEntry: async () => {}, 
            resolve: async () => null, 
        };

        const rootNode = await processHandle(mockRoot, null, "");
        if (rootNode) rawNodes.push(rootNode);
      }
    } catch (err) {
      console.error("目录导入错误:", err);
      rawNodes = []; 
    }
    
    const ruleAppliedTree = applyImportRules(rawNodes, selectedImportRulesetId);
    setFileTree(ruleAppliedTree);
  };

  const updateNodeSelectionInTree = (nodeId: UID, selected: boolean) => {
    saveFileTreeSnapshot();
    const updateRecursive = (nodes: FileSystemNode[]): FileSystemNode[] => {
        return nodes.map(node => {
            if (node.id === nodeId && node.type === 'file') return { ...node, selected };
            if (node.type === 'directory' && node.children) return { ...node, children: updateRecursive(node.children) };
            return node;
        });
    };
    setFileTree(prevTree => updateRecursive(prevTree));
  };

  const updateNodeProperties = (nodeId: UID, properties: Partial<Pick<FileSystemNode, 'descriptionOverride' | 'lineLimitOverride' | 'compressionOverride'>>) => {
    saveFileTreeSnapshot();
    const updateRecursive = (nodes: FileSystemNode[]): FileSystemNode[] => {
        return nodes.map(node => {
            if (node.id === nodeId) return { ...node, ...properties };
            if (node.type === 'directory' && node.children) return { ...node, children: updateRecursive(node.children) };
            return node;
        });
    };
    setFileTree(prevTree => updateRecursive(prevTree));
  };


  // --- Matches CRUD ---
  const addMatch = (matchData: Omit<Match, 'id' | 'isDefault'>): Match => {
    const newMatch = { ...matchData, id: generateId(), isDefault: false } as Match;
    setMatches(prev => [...prev, newMatch]);
    return newMatch;
  };
  const updateMatch = (updatedMatch: Match) => setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
  const deleteMatch = (matchId: UID) => {
    const matchToDelete = matches.find(m => m.id === matchId);
    if (matchToDelete?.isDefault && !window.confirm(`"${matchToDelete.name}" 是一个默认匹配项。确定要删除吗?`)) return;

    setMatches(prev => prev.filter(m => m.id !== matchId));
    setRules(prevRules => prevRules.map(r => ({...r, matchIds: r.matchIds.filter(id => id !== matchId)})));
    setOperations(prevOps => prevOps.map(op => ({...op, matchIds: op.matchIds.filter(id => id !== matchId)})));
  };
  const getMatchById = (id: UID) => matches.find(m => m.id === id);

  // --- Rules CRUD ---
  const addRule = (ruleData: Omit<Rule, 'id' | 'isDefault'>): Rule => {
    const newRule = { ...ruleData, id: generateId(), isDefault: false } as Rule;
    setRules(prev => [...prev, newRule]);
    return newRule;
  };
  const updateRule = (updatedRule: Rule) => setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
  const deleteRule = (ruleId: UID) => {
    const ruleToDelete = rules.find(r => r.id === ruleId);
    if (ruleToDelete?.isDefault && !window.confirm(`"${ruleToDelete.name}" 是一个默认规则。确定要删除吗?`)) return;

    setRules(prev => prev.filter(r => r.id !== ruleId));
    setRulesets(prevRs => prevRs.map(rs => ({
        ...rs,
        rules: rs.rules.filter(ri => ri.ruleId !== ruleId)
    })));
  };
  const getRuleById = (id: UID) => rules.find(r => r.id === id);

  // --- Rulesets CRUD ---
  const addRuleset = (rulesetData: Omit<Ruleset, 'id' | 'rules' | 'isDefault'>): Ruleset => {
    const newRuleset = { ...rulesetData, id: generateId(), rules: [], isDefault: false };
    setRulesets(prev => [...prev, newRuleset]);
    return newRuleset;
  };
  const updateRuleset = (updatedRuleset: Ruleset) => setRulesets(prev => prev.map(rs => rs.id === updatedRuleset.id ? updatedRuleset : rs));
  const deleteRuleset = (rulesetId: UID) => {
     const rsToDelete = rulesets.find(rs => rs.id === rulesetId);
    if (rsToDelete?.isDefault && !window.confirm(`"${rsToDelete.name}" 是一个默认规则集。确定要删除吗?`)) return;
    setRulesets(prev => prev.filter(rs => rs.id !== rulesetId));
    if (selectedImportRulesetId === rulesetId) setSelectedImportRulesetId(RULESET_ID_DEFAULT_IMPORT);
    if (selectedCompressionRulesetId === rulesetId) setSelectedCompressionRulesetId(RULESET_ID_DEFAULT_COMPRESSION);
    if (selectedLineLimitRulesetId === rulesetId) setSelectedLineLimitRulesetId(RULESET_ID_DEFAULT_LINELIMIT);
  };
   const copyRuleset = (rulesetId: UID): Ruleset | null => {
    const originalRuleset = rulesets.find(rs => rs.id === rulesetId);
    if (!originalRuleset) return null;
    const newRuleset: Ruleset = {
      ...originalRuleset,
      id: generateId(),
      name: `${originalRuleset.name} (复制)`,
      isDefault: false,
      rules: originalRuleset.rules.map(ri => ({ ...ri, id: generateId() })), // New instance IDs
    };
    setRulesets(prev => [...prev, newRuleset]);
    return newRuleset;
  };
  const getRulesetById = (id: UID) => rulesets.find(rs => rs.id === id);

  const addRuleToRuleset = (rulesetId: UID, ruleId: UID, priority?: number, enabled: boolean = true) => {
    setRulesets(prev => prev.map(rs => {
      if (rs.id === rulesetId) {
        const newPriority = priority ?? (rs.rules.length > 0 ? Math.max(...rs.rules.map(r => r.priority)) + 10 : 10);
        const newInstance: RuleInstance = { id: generateId(), ruleId, priority: newPriority, enabled };
        const updatedRules = [...rs.rules, newInstance].sort((a,b) => a.priority - b.priority);
        return { ...rs, rules: updatedRules };
      }
      return rs;
    }));
  };
  const updateRuleInRuleset = (rulesetId: UID, ruleInstanceId: UID, updates: Partial<RuleInstance>) => {
     setRulesets(prev => prev.map(rs => {
      if (rs.id === rulesetId) {
        const updatedRules = rs.rules.map(ri => ri.id === ruleInstanceId ? {...ri, ...updates} : ri);
        if (updates.priority !== undefined) updatedRules.sort((a,b) => a.priority - b.priority);
        return { ...rs, rules: updatedRules };
      }
      return rs;
    }));
  };
  const removeRuleFromRuleset = (rulesetId: UID, ruleInstanceId: UID) => {
    setRulesets(prev => prev.map(rs => {
      if (rs.id === rulesetId) return { ...rs, rules: rs.rules.filter(ri => ri.id !== ruleInstanceId) };
      return rs;
    }));
  };
  const replaceRuleInRuleset = (rulesetId: UID, ruleInstanceIdToReplace: UID, newRuleId: UID) => {
    setRulesets(prev => prev.map(rs => {
      if (rs.id === rulesetId) {
        return {
          ...rs,
          rules: rs.rules.map(ri => ri.id === ruleInstanceIdToReplace ? { ...ri, ruleId: newRuleId } : ri)
        };
      }
      return rs;
    }));
  };
  const reorderRuleInRuleset = (rulesetId: UID, ruleInstanceId: UID, direction: 'up' | 'down') => {
    setRulesets(prevRulesets => prevRulesets.map(rs => {
        if (rs.id === rulesetId) {
            const rulesCopy = rs.rules.map(r => ({...r})); // Work with a copy of rule instances
            const ruleIndex = rulesCopy.findIndex(ri => ri.id === ruleInstanceId);
            if (ruleIndex === -1) return rs;

            const targetIndex = direction === 'up' ? ruleIndex - 1 : ruleIndex + 1;
            if (targetIndex < 0 || targetIndex >= rulesCopy.length) return rs;

            // Swap priorities to achieve reordering, then re-sort to normalize if needed
            const currentPriority = rulesCopy[ruleIndex].priority;
            const targetPriority = rulesCopy[targetIndex].priority;

            if (currentPriority === targetPriority) { // If same priority, adjust one slightly to force order
                if (direction === 'up') rulesCopy[ruleIndex].priority = targetPriority - 1;
                else rulesCopy[ruleIndex].priority = targetPriority + 1;
            } else {
                rulesCopy[ruleIndex].priority = targetPriority;
                rulesCopy[targetIndex].priority = currentPriority;
            }
            
            rulesCopy.sort((a, b) => a.priority - b.priority);
            return { ...rs, rules: rulesCopy };
        }
        return rs;
    }));
  };
  
  // --- Operations CRUD ---
  const addOperation = (opData: Omit<Operation, 'id'|'isDefault'>): Operation => {
    const newOp = { ...opData, id: generateId(), isDefault: false } as Operation;
    setOperations(prev => [...prev, newOp]);
    return newOp;
  };
  const updateOperation = (updatedOp: Operation) => setOperations(prev => prev.map(op => op.id === updatedOp.id ? updatedOp : op));
  const deleteOperation = (opId: UID) => {
    const opToDelete = operations.find(op => op.id === opId);
    if (opToDelete?.isDefault && !window.confirm(`"${opToDelete.name}" 是一个默认操作。确定要删除吗?`)) return;

    setOperations(prev => prev.filter(op => op.id !== opId));
    setMacros(prevMacros => prevMacros.map(m => ({
        ...m,
        operations: m.operations.filter(oi => oi.operationId !== opId)
    })));
  };
  const getOperationById = (id: UID) => operations.find(op => op.id === id);

  // --- Macros CRUD ---
  const addMacro = (macroData: Omit<Macro, 'id' | 'operations' | 'isDefault'>): Macro => {
    const newMacro = { ...macroData, id: generateId(), operations: [], isDefault: false };
    setMacros(prev => [...prev, newMacro]);
    return newMacro;
  };
  const updateMacro = (updatedMacro: Macro) => setMacros(prev => prev.map(m => m.id === updatedMacro.id ? updatedMacro : m));
  const deleteMacro = (macroId: UID) => {
    const macroToDelete = macros.find(m => m.id === macroId);
    if (macroToDelete?.isDefault && !window.confirm(`"${macroToDelete.name}" 是一个默认宏。确定要删除吗?`)) return;
    setMacros(prev => prev.filter(m => m.id !== macroId));
  };
  const copyMacro = (macroId: UID): Macro | null => {
    const originalMacro = macros.find(m => m.id === macroId);
    if (!originalMacro) return null;
    const newMacro: Macro = {
      ...originalMacro,
      id: generateId(),
      name: `${originalMacro.name} (复制)`,
      isDefault: false,
      operations: originalMacro.operations.map(oi => ({ ...oi, id: generateId() })),
    };
    setMacros(prev => [...prev, newMacro]);
    return newMacro;
  };
  const getMacroById = (id: UID) => macros.find(m => m.id === id);

  const addOperationToMacro = (macroId: UID, operationId: UID, sequence?: number, enabled: boolean = true) => {
    setMacros(prev => prev.map(m => {
      if (m.id === macroId) {
        const newSeq = sequence ?? (m.operations.length > 0 ? Math.max(...m.operations.map(op => op.sequence)) + 10 : 10);
        const newInstance: OperationInstance = { id: generateId(), operationId, sequence: newSeq, enabled };
        const updatedOps = [...m.operations, newInstance].sort((a,b) => a.sequence - b.sequence);
        return { ...m, operations: updatedOps };
      }
      return m;
    }));
  };
  const updateOperationInMacro = (macroId: UID, opInstanceId: UID, updates: Partial<OperationInstance>) => {
    setMacros(prev => prev.map(m => {
      if (m.id === macroId) {
        const updatedOps = m.operations.map(oi => oi.id === opInstanceId ? {...oi, ...updates} : oi);
        if (updates.sequence !== undefined) updatedOps.sort((a,b) => a.sequence - b.sequence);
        return { ...m, operations: updatedOps };
      }
      return m;
    }));
  };
  const removeOperationFromMacro = (macroId: UID, opInstanceId: UID) => {
     setMacros(prev => prev.map(m => {
      if (m.id === macroId) return { ...m, operations: m.operations.filter(oi => oi.id !== opInstanceId) };
      return m;
    }));
  };
  const replaceOperationInMacro = (macroId: UID, operationInstanceIdToReplace: UID, newOperationId: UID) => {
    setMacros(prev => prev.map(m => {
      if (m.id === macroId) {
        return {
          ...m,
          operations: m.operations.map(oi => oi.id === operationInstanceIdToReplace ? { ...oi, operationId: newOperationId } : oi)
        };
      }
      return m;
    }));
  };
  const reorderOperationInMacro = (macroId: UID, opInstanceId: UID, direction: 'up' | 'down') => {
    setMacros(prevMacros => prevMacros.map(m => {
        if (m.id === macroId) {
            const opsCopy = m.operations.map(o => ({...o})); // Work with a copy
            const opIndex = opsCopy.findIndex(oi => oi.id === opInstanceId);
            if (opIndex === -1) return m;

            const targetIndex = direction === 'up' ? opIndex - 1 : opIndex + 1;
            if (targetIndex < 0 || targetIndex >= opsCopy.length) return m;

            const currentSeq = opsCopy[opIndex].sequence;
            const targetSeq = opsCopy[targetIndex].sequence;

            if (currentSeq === targetSeq) {
                if (direction === 'up') opsCopy[opIndex].sequence = targetSeq - 1;
                else opsCopy[opIndex].sequence = targetSeq + 1;
            } else {
                opsCopy[opIndex].sequence = targetSeq;
                opsCopy[targetIndex].sequence = currentSeq;
            }
            
            opsCopy.sort((a, b) => a.sequence - b.sequence);
            return { ...m, operations: opsCopy };
        }
        return m;
    }));
  };

  // --- Macro Execution ---
  const getSelectedFileIds = (tree: FileSystemNode[]): Set<UID> => {
    const selectedIds = new Set<UID>();
    function findSelected(nodes: FileSystemNode[]) {
        nodes.forEach(node => {
            if (node.type === 'file' && node.selected) selectedIds.add(node.id);
            if (node.type === 'directory' && node.children) findSelected(node.children);
        });
    }
    findSelected(tree);
    return selectedIds;
  };

  const saveMacroSnapshot = useCallback(() => {
    const snapshot: AppStateSnapshot = { fileTree: JSON.parse(JSON.stringify(fileTree)), selectedFileIds: getSelectedFileIds(fileTree) };
    setMacroUndoStack(prev => [...prev, snapshot].slice(-10));
    setMacroRedoStack([]);
  }, [fileTree]);
  
  const executeMacro = (macroId: UID) => {
    const macro = macros.find(m => m.id === macroId);
    if (!macro) return;

    saveMacroSnapshot(); 

    let currentTree = JSON.parse(JSON.stringify(fileTree)); 

    const newSelectedFileIds = getSelectedFileIds(currentTree); 

    macro.operations
        .filter(opInst => opInst.enabled)
        .sort((a, b) => a.sequence - b.sequence)
        .forEach(opInst => {
            const operation = operations.find(op => op.id === opInst.operationId);
            if (!operation) return;

            const processNodeForMacro = (nodes: FileSystemNode[]) => {
                nodes.forEach(node => {
                    if (operation.targetType === OperationTargetType.MATCHED_FILE && node.type === 'file') {
                        if (checkNodeMatchesAny(node, operation.matchIds)) {
                            const fileOp = operation as FileOperation;
                            if (fileOp.action === FileOperationType.CHECK_FILE) newSelectedFileIds.add(node.id);
                            else if (fileOp.action === FileOperationType.UNCHECK_FILE) newSelectedFileIds.delete(node.id);
                        }
                    } else if (operation.targetType === OperationTargetType.MATCHED_FOLDER_CONTENT && node.type === 'directory') {
                        if (checkNodeMatchesAny(node, operation.matchIds)) {
                            const folderOp = operation as FolderOperation;
                            const processChildren = (childNodes: FileSystemNode[]) => {
                                childNodes.forEach(child => {
                                    if (child.type === 'file') {
                                        if (folderOp.action === FolderOperationType.SELECT_ALL) newSelectedFileIds.add(child.id);
                                        else if (folderOp.action === FolderOperationType.DESELECT_ALL) newSelectedFileIds.delete(child.id);
                                        else if (folderOp.action === FolderOperationType.INVERT_SELECTION) {
                                            if (newSelectedFileIds.has(child.id)) newSelectedFileIds.delete(child.id);
                                            else newSelectedFileIds.add(child.id);
                                        }
                                    }
                                    if (child.type === 'directory' && child.children) processChildren(child.children); 
                                });
                            };
                            if (node.children) processChildren(node.children);
                        }
                    }
                    if (node.type === 'directory' && node.children) { 
                       processNodeForMacro(node.children);
                    }
                });
            };
            processNodeForMacro(currentTree);
        });

    const applySelections = (nodes: FileSystemNode[]): FileSystemNode[] => {
        return nodes.map(node => {
            if (node.type === 'file') return { ...node, selected: newSelectedFileIds.has(node.id) };
            if (node.type === 'directory' && node.children) return { ...node, children: applySelections(node.children) };
            return node;
        });
    };
    setFileTree(applySelections(currentTree));
  };

  const undoMacroExecution = () => {
    if (macroUndoStack.length > 0) {
      const lastState = macroUndoStack[macroUndoStack.length - 1];
      const currentSnapshot: AppStateSnapshot = { fileTree: JSON.parse(JSON.stringify(fileTree)), selectedFileIds: getSelectedFileIds(fileTree) };
      setMacroRedoStack(prev => [currentSnapshot, ...prev].slice(-10));
      setMacroUndoStack(prev => prev.slice(0, -1));
       const applySelectionsFromSnapshot = (nodes: FileSystemNode[], selectedIds: Set<UID>): FileSystemNode[] => {
            return nodes.map(node => {
                if (node.type === 'file') return { ...node, selected: selectedIds.has(node.id) };
                if (node.type === 'directory' && node.children) return { ...node, children: applySelectionsFromSnapshot(node.children, selectedIds) };
                return node;
            });
        };
      setFileTree(applySelectionsFromSnapshot(JSON.parse(JSON.stringify(lastState.fileTree)), lastState.selectedFileIds || new Set()));
    }
  };

  const redoMacroExecution = () => {
    if (macroRedoStack.length > 0) {
      const nextState = macroRedoStack[0];
      const currentSnapshot: AppStateSnapshot = { fileTree: JSON.parse(JSON.stringify(fileTree)), selectedFileIds: getSelectedFileIds(fileTree) };
      setMacroUndoStack(prev => [...prev, currentSnapshot].slice(-10));
      setMacroRedoStack(prev => prev.slice(1));
      const applySelectionsFromSnapshot = (nodes: FileSystemNode[], selectedIds: Set<UID>): FileSystemNode[] => { 
          return nodes.map(node => {
              if (node.type === 'file') return { ...node, selected: selectedIds.has(node.id) };
              if (node.type === 'directory' && node.children) return { ...node, children: applySelectionsFromSnapshot(node.children, selectedIds) };
              return node;
          });
      };
      setFileTree(applySelectionsFromSnapshot(JSON.parse(JSON.stringify(nextState.fileTree)), nextState.selectedFileIds || new Set()));
    }
  };


  // --- Export Logic ---
  const applyCompressionRulesToFileContent = (content: string, fileNode: FileNode, rulesetId: UID | null): string => {
    let currentContent = content;
    const appliedRulesDescriptions: string[] = [];

    const effectiveCompressionOptions: CompressionRuleOptions = {};

    if (fileNode.compressionOverride && Object.keys(fileNode.compressionOverride).length > 0) {
        Object.assign(effectiveCompressionOptions, fileNode.compressionOverride);
        appliedRulesDescriptions.push("文件特定压缩覆盖");
    } else {
        const ruleset = rulesetId ? rulesets.find(rs => rs.id === rulesetId && rs.type === RuleType.COMPRESSION) : null;
        if (ruleset) {
            ruleset.rules
                .filter(ri => ri.enabled)
                .sort((a,b) => a.priority - b.priority) 
                .forEach(ri => {
                    const rule = rules.find(r => r.id === ri.ruleId && r.ruleType === RuleType.COMPRESSION) as CompressionRule | undefined;
                    if (rule && checkNodeMatchesAny(fileNode, rule.matchIds)) {
                        if (rule.removeEmptyLines) effectiveCompressionOptions.removeEmptyLines = true;
                        if (rule.removeComments) effectiveCompressionOptions.removeComments = true;
                        if (rule.minify) effectiveCompressionOptions.minify = true; 
                        appliedRulesDescriptions.push(rule.name);
                    }
                });
        }
    }
    
    if (effectiveCompressionOptions.removeEmptyLines) currentContent = currentContent.split('\n').filter(line => line.trim() !== '').join('\n');
    if (effectiveCompressionOptions.removeComments) { 
        currentContent = currentContent.split('\n').filter(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith(';');
        }).join('\n');
    }
    if (effectiveCompressionOptions.minify) { /* Minify logic placeholder */ }
    return currentContent;
  };

  const applyLineLimitRulesToFileContent = (content: string, fileNode: FileNode, rulesetId: UID | null): { limitedContent: string, ruleAppliedInfo: string } => {
    let currentContent = content;
    let ruleAppliedInfo = "";
    let lineLimitRuleToApply: LineLimitRule | null = null;

    if (fileNode.lineLimitOverride) {
        lineLimitRuleToApply = fileNode.lineLimitOverride;
    } else { 
        const ruleset = rulesetId ? rulesets.find(rs => rs.id === rulesetId && rs.type === RuleType.LINE_LIMIT) : null;
        if (ruleset) {
            const sortedRuleInstances = ruleset.rules
                .filter(ri => ri.enabled)
                .sort((a,b) => a.priority - b.priority); 

            for (const ri of sortedRuleInstances) {
                const rule = rules.find(r => r.id === ri.ruleId && r.ruleType === RuleType.LINE_LIMIT) as LineLimitRule | undefined;
                if (rule && checkNodeMatchesAny(fileNode, rule.matchIds)) {
                    lineLimitRuleToApply = rule;
                    break; 
                }
            }
        }
    }

    if (!lineLimitRuleToApply) return { limitedContent: content, ruleAppliedInfo: "" };
    
    const limit = lineLimitRuleToApply;
    ruleAppliedInfo = `行数限制规则: ${limit.name} (${limit.limitType})`;
    if(limit.params && Object.keys(limit.params).length > 0) ruleAppliedInfo += ` (${JSON.stringify(limit.params)})`;


    if (limit.limitType === LineLimitRuleTypeOption.NO_LINES) {
        currentContent = "[根据规则，内容不保留]";
    } else {
        const lines = currentContent.split('\n');
        let newLines: string[] = lines;
        const { n = 0, m = 0, start = 1, end = lines.length, percent = 0 } = limit.params || {};

        switch (limit.limitType) {
            case LineLimitRuleTypeOption.HEAD_N: newLines = lines.slice(0, n); break;
            case LineLimitRuleTypeOption.TAIL_N: newLines = lines.slice(-n); break;
            case LineLimitRuleTypeOption.HEAD_M_TAIL_N:
                if (lines.length > m + n) newLines = [...lines.slice(0, m), `\n... (内容已省略 ${lines.length - m - n} 行) ...\n`, ...lines.slice(-n)];
                break;
            case LineLimitRuleTypeOption.CUSTOM_RANGE: newLines = lines.slice(Math.max(0, start - 1), Math.min(lines.length, end)); break;
            case LineLimitRuleTypeOption.RANDOM_PERCENT:
                const targetCount = Math.round(lines.length * (Math.max(0, Math.min(100, percent)) / 100));
                if (targetCount < lines.length) {
                    newLines = lines.slice(0, targetCount); 
                    newLines.push(`\n... (内容已按 ${percent}% 比例截取，保留 ${targetCount} / ${lines.length} 行) ...\n`);
                }
                break;
            case LineLimitRuleTypeOption.RANDOM_N: 
                if (n < lines.length && n > 0) {
                    newLines = lines.slice(0, n);
                    newLines.push(`\n... (内容已按 ${n} 行截取，保留 ${n} / ${lines.length} 行) ...\n`);
                } else if (n >= lines.length) {
                    // no change
                } else { // n is 0 or invalid
                     newLines = []; // Or some other placeholder like "[内容已按0行规则截断]"
                }
                break;
        }
        currentContent = newLines.join('\n');
    }
    return { limitedContent: currentContent, ruleAppliedInfo };
  };


  const exportContent = async (exportType: ExportType) => {
    let output = "";
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `DirectoryX_导出_${timestamp}.txt`;
    const flatSelectedFiles: FileNode[] = [];

    const getSelectedFilesRecursive = (nodes: FileSystemNode[]) => {
        for (const node of nodes) {
            if (node.type === 'file' && node.selected) flatSelectedFiles.push(node as FileNode);
            else if (node.type === 'directory' && node.children) getSelectedFilesRecursive(node.children);
        }
    };
    getSelectedFilesRecursive(fileTree);

    if (flatSelectedFiles.length === 0 && exportType !== ExportType.DIRECTORY_TREE) {
        alert("没有选择任何文件进行导出。");
        return;
    }

    if (exportType === ExportType.DIRECTORY_TREE) {
        const generateTreeString = (nodes: FileSystemNode[], prefix = ""): string => {
            let treeStr = "";
            nodes.forEach((node, index) => {
                const isLast = index === nodes.length - 1;
                const connector = isLast ? "└── " : "├── ";
                const icon = node.type === 'directory' ? '📂' : '📄';
                treeStr += `${prefix}${connector}${icon} ${node.name}${node.selected && node.type === 'file' ? ' (已选)' : ''}\n`;
                if (node.type === 'directory' && node.children) {
                    treeStr += generateTreeString(node.children, `${prefix}${isLast ? "    " : "│   "}`);
                }
            });
            return treeStr;
        };
        output = generateTreeString(fileTree);
        filename = `DirectoryX_目录树_${timestamp}.txt`;

    } else if (exportType === ExportType.MERGE_SELECTED) {
        output += `// DirectoryX 合并导出\n`;
        output += `// 时间: ${new Date().toLocaleString()}\n`;
        output += `// 导出的文件数量: ${flatSelectedFiles.length}\n`;
        output += `// 应用的导入规则集: ${getRulesetById(selectedImportRulesetId || '')?.name || '无或默认内部排除'}\n`;
        output += `// 应用的压缩规则集: ${getRulesetById(selectedCompressionRulesetId || '')?.name || '无'}\n`;
        output += `// 应用的行数限制规则集: ${getRulesetById(selectedLineLimitRulesetId || '')?.name || '无'}\n\n`;
        output += `// 文件列表:\n`;
        flatSelectedFiles.forEach(fileNode => { output += `// - ${fileNode.path}\n`; });
        output += `\n// --- 文件内容开始 ---\n\n`;

        flatSelectedFiles.forEach(fileNode => {
            output += `// Path: ${fileNode.path}\n`;
            if (fileNode.descriptionOverride) output += `// 描述: ${fileNode.descriptionOverride}\n`;
            
            let fileContent = fileNode.content || "[文件内容为空或无法加载]";
            fileContent = applyCompressionRulesToFileContent(fileContent, fileNode, selectedCompressionRulesetId);
            const { limitedContent, ruleAppliedInfo } = applyLineLimitRulesToFileContent(fileContent, fileNode, selectedLineLimitRulesetId);
            fileContent = limitedContent;
            if (ruleAppliedInfo) output += `// ${ruleAppliedInfo}\n`;

            output += `${fileContent}\n// --- ${fileNode.path} 内容结束 ---\n\n`;
        });
        filename = `DirectoryX_合并导出_${timestamp}.txt`;
    } else if (exportType === ExportType.SEPARATE_SELECTED) {
        alert("“分开导出选中的文件”功能在此原型中简化为提醒。完整实现需要处理多文件下载或ZIP打包。");
        return;
    }

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const contextValue: AppContextType = {
    fileTree, setFileTree, importDirectory, updateNodeSelectionInTree, updateNodeProperties,
    matches, addMatch, updateMatch, deleteMatch, getMatchById, checkNodeAgainstMatchConditions,
    rules, addRule, updateRule, deleteRule, getRuleById,
    rulesets, addRuleset, updateRuleset, deleteRuleset, copyRuleset, getRulesetById,
    addRuleToRuleset, updateRuleInRuleset, removeRuleFromRuleset, replaceRuleInRuleset, reorderRuleInRuleset,
    selectedImportRulesetId, setSelectedImportRulesetId,
    selectedCompressionRulesetId, setSelectedCompressionRulesetId,
    selectedLineLimitRulesetId, setSelectedLineLimitRulesetId,
    operations, addOperation, updateOperation, deleteOperation, getOperationById,
    macros, addMacro, updateMacro, deleteMacro, copyMacro, getMacroById,
    addOperationToMacro, updateOperationInMacro, removeOperationFromMacro, replaceOperationInMacro, reorderOperationInMacro,
    exportContent, globalSettings,
    fileTreeUndoStack, fileTreeRedoStack, saveFileTreeSnapshot, undoFileTreeAction, redoFileTreeAction,
    canUndoFileTree: fileTreeUndoStack.length > 0,
    canRedoFileTree: fileTreeRedoStack.length > 0,
    macroUndoStack, macroRedoStack, executeMacro, undoMacroExecution, redoMacroExecution,
    canUndoMacro: macroUndoStack.length > 0,
    canRedoMacro: macroRedoStack.length > 0,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext 必须在 AppProvider 内部使用');
  return context;
};
