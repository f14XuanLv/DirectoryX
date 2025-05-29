
import React, { createContext, useState, useContext, useCallback, ReactNode, useMemo, useEffect } from 'react';
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

// localStorage keys
const LS_KEYS = {
  MATCHES: 'directoryx_matches',
  RULES: 'directoryx_rules',
  RULESETS: 'directoryx_rulesets',
  OPERATIONS: 'directoryx_operations',
  MACROS: 'directoryx_macros',
  SELECTED_IMPORT_RULESET_ID: 'directoryx_selectedImportRulesetId',
  SELECTED_COMPRESSION_RULESET_ID: 'directoryx_selectedCompressionRulesetId',
  SELECTED_LINE_LIMIT_RULESET_ID: 'directoryx_selectedLineLimitRulesetId',
};

// Helper function to load from localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Helper function to save to localStorage
const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

// Helper for wildcard (name) to regex
const wildcardToRegex = (pattern: string): RegExp => {
    const escapedPattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regexPattern = escapedPattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`, 'i');
};

// Helper for path wildcard to regex
const pathWildcardToRegex = (pattern: string): RegExp => {
    // Normalize path separators to /
    let p = pattern.replace(/\\/g, '/');
    // Escape most regex special characters
    p = p.replace(/[+()|[\]\\]/g, '\\$&'); // Keep . ^ $ for user's own regex-like use in wildcards
    // Handle **: match any sequence of characters including /
    p = p.replace(/\*\*/g, '.*');
    // Handle *: match any sequence of characters except /
    p = p.replace(/\*/g, '[^/]*');
    // Handle ?: match a single character except /
    p = p.replace(/\?/g, '[^/]');
    // Anchor the pattern to match the full path
    return new RegExp(`^${p}$`, 'i');
};


interface AppContextType {
  // File System
  fileTree: FileSystemNode[];
  setFileTree: React.Dispatch<React.SetStateAction<FileSystemNode[]>>;
  importDirectory: (handles?: FileSystemDirectoryHandle[]) => Promise<void>;
  updateNodeSelectionInTree: (nodeId: UID, selected: boolean) => void;
  selectAllDescendantFiles: (dirId: UID, select: boolean) => void;
  invertSelectionDescendantFiles: (dirId: UID) => void;
  updateNodeProperties: (nodeId: UID, properties: Partial<Pick<FileSystemNode, 'descriptionOverride' | 'lineLimitOverride' | 'compressionOverride'>>) => void;

  // Matches
  matches: Match[];
  addMatch: (match: Omit<Match, 'id' | 'isDefault'>) => Match;
  updateMatch: (match: Match) => void;
  deleteMatch: (matchId: UID) => void;
  getMatchById: (id: UID) => Match | undefined;
  checkNodeAgainstMatchConditions: (node: FileSystemNode, match: Match) => boolean;

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

  // Function to reset all persisted data to defaults
  resetAllPersistedData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function for updating descendant file selections
const updateDescendantFileSelectionsInTree = (
  nodes: FileSystemNode[],
  targetDirectoryId: UID,
  selectionValueOrFn: boolean | ((currentSelected: boolean) => boolean)
): FileSystemNode[] => {
  return nodes.map(node => {
    const clonedNode = { ...node }; // Shallow clone node

    if (clonedNode.type === 'directory') {
      let childrenToProcess = (clonedNode as DirectoryNode).children;

      if (clonedNode.id === targetDirectoryId) {
        // This is the target directory. Apply selection logic to all its descendants.
        const applySelectionToDescendants = (descendantNodes: FileSystemNode[]): FileSystemNode[] => {
          return descendantNodes.map(childNode => {
            const clonedChildNode = { ...childNode }; // Shallow clone child
            if (clonedChildNode.type === 'file') {
              const currentSelected = (clonedChildNode as FileNode).selected || false;
              const newSelected = typeof selectionValueOrFn === 'function'
                ? selectionValueOrFn(currentSelected)
                : selectionValueOrFn;
              (clonedChildNode as FileNode).selected = newSelected;
            } else if (clonedChildNode.type === 'directory' && (clonedChildNode as DirectoryNode).children) {
              // Recursively apply to children of this sub-directory
              (clonedChildNode as DirectoryNode).children = applySelectionToDescendants((clonedChildNode as DirectoryNode).children);
            }
            return clonedChildNode;
          });
        };
        if (childrenToProcess && childrenToProcess.length > 0) {
          (clonedNode as DirectoryNode).children = applySelectionToDescendants(childrenToProcess);
        }
      } else if (childrenToProcess && childrenToProcess.length > 0) {
        // Not the target directory, but it has children. Recurse.
        (clonedNode as DirectoryNode).children = updateDescendantFileSelectionsInTree(childrenToProcess, targetDirectoryId, selectionValueOrFn);
      }
    }
    return clonedNode;
  });
};


export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [fileTree, setFileTree] = useState<FileSystemNode[]>([]);
  const [_globalSettings, _setGlobalSettings] = useState<GlobalExportSettings>({
    defaultExcludeFolders: [], 
    defaultExcludeFiles: [], 
  });

  const [matches, setMatches] = useState<Match[]>(() => loadFromLocalStorage(LS_KEYS.MATCHES, DEFAULT_MATCHES));
  const [rules, setRules] = useState<Rule[]>(() => loadFromLocalStorage(LS_KEYS.RULES, DEFAULT_RULES));
  const [rulesets, setRulesets] = useState<Ruleset[]>(() => loadFromLocalStorage(LS_KEYS.RULESETS, DEFAULT_RULESETS));
  const [operations, setOperations] = useState<Operation[]>(() => loadFromLocalStorage(LS_KEYS.OPERATIONS, DEFAULT_OPERATIONS));
  const [macros, setMacros] = useState<Macro[]>(() => loadFromLocalStorage(LS_KEYS.MACROS, DEFAULT_MACROS));

  const [selectedImportRulesetId, setSelectedImportRulesetId] = useState<UID | null>(() => loadFromLocalStorage(LS_KEYS.SELECTED_IMPORT_RULESET_ID, RULESET_ID_DEFAULT_IMPORT));
  const [selectedCompressionRulesetId, setSelectedCompressionRulesetId] = useState<UID | null>(() => loadFromLocalStorage(LS_KEYS.SELECTED_COMPRESSION_RULESET_ID, RULESET_ID_DEFAULT_COMPRESSION));
  const [selectedLineLimitRulesetId, setSelectedLineLimitRulesetId] = useState<UID | null>(() => loadFromLocalStorage(LS_KEYS.SELECTED_LINE_LIMIT_RULESET_ID, RULESET_ID_DEFAULT_LINELIMIT));

  const [fileTreeUndoStack, setFileTreeUndoStack] = useState<AppStateSnapshot[]>([]);
  const [fileTreeRedoStack, setFileTreeRedoStack] = useState<AppStateSnapshot[]>([]);
  const [macroUndoStack, setMacroUndoStack] = useState<AppStateSnapshot[]>([]);
  const [macroRedoStack, setMacroRedoStack] = useState<AppStateSnapshot[]>([]);

  useEffect(() => { saveToLocalStorage(LS_KEYS.MATCHES, matches); }, [matches]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.RULES, rules); }, [rules]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.RULESETS, rulesets); }, [rulesets]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.OPERATIONS, operations); }, [operations]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.MACROS, macros); }, [macros]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.SELECTED_IMPORT_RULESET_ID, selectedImportRulesetId); }, [selectedImportRulesetId]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.SELECTED_COMPRESSION_RULESET_ID, selectedCompressionRulesetId); }, [selectedCompressionRulesetId]);
  useEffect(() => { saveToLocalStorage(LS_KEYS.SELECTED_LINE_LIMIT_RULESET_ID, selectedLineLimitRulesetId); }, [selectedLineLimitRulesetId]);


  const resetAllPersistedData = useCallback(() => {
    if (window.confirm("确定要将所有匹配项、规则、规则集、操作和宏恢复到默认设置吗？此操作不可撤销。")) {
        setMatches(DEFAULT_MATCHES);
        setRules(DEFAULT_RULES);
        setRulesets(DEFAULT_RULESETS);
        setOperations(DEFAULT_OPERATIONS);
        setMacros(DEFAULT_MACROS);
        setSelectedImportRulesetId(RULESET_ID_DEFAULT_IMPORT);
        setSelectedCompressionRulesetId(RULESET_ID_DEFAULT_COMPRESSION);
        setSelectedLineLimitRulesetId(RULESET_ID_DEFAULT_LINELIMIT);

        Object.values(LS_KEYS).forEach(key => localStorage.removeItem(key));
        alert("所有配置已重置为默认值。");
    }
  }, []);

  const saveFileTreeSnapshot = useCallback(() => {
    // Filter out _fileHandle before stringifying for snapshot, as it's not serializable
    const cleanTreeForSnapshot = (nodes: FileSystemNode[]): FileSystemNode[] => {
        return nodes.map(node => {
            const { _fileHandle, ...restOfNode } = node as FileNode; // Destructure to remove _fileHandle
            const cleanNode = { ...restOfNode } as FileSystemNode; // Create a new object without _fileHandle
            if (cleanNode.type === 'directory' && cleanNode.children) {
                (cleanNode as DirectoryNode).children = cleanTreeForSnapshot(cleanNode.children);
            }
            return cleanNode;
        });
    };
    const snapshot: AppStateSnapshot = { fileTree: cleanTreeForSnapshot(fileTree) }; // Uses the cleaned tree
    setFileTreeUndoStack(prev => [...prev, snapshot].slice(-20));
    setFileTreeRedoStack([]);
  }, [fileTree]);

  const undoFileTreeAction = () => {
    if (fileTreeUndoStack.length > 0) {
      const lastState = fileTreeUndoStack[fileTreeUndoStack.length - 1];
      saveFileTreeSnapshot(); // Save current state to redo before reverting
      setFileTreeUndoStack(prev => prev.slice(0, -1));
      setFileTree(lastState.fileTree); // This tree is already cleaned (no _fileHandle)
    }
  };

  const redoFileTreeAction = () => {
    if (fileTreeRedoStack.length > 0) {
      const nextState = fileTreeRedoStack[0];
      // Current state is already saved to undo by the action that put `nextState` in redo stack
      // or by the preceding `undoFileTreeAction` if `saveFileTreeSnapshot()` was called there.
      // The logic of `saveFileTreeSnapshot` handles adding current state to undo stack.
      setFileTreeRedoStack(prev => prev.slice(1));
      setFileTree(nextState.fileTree); // This tree is already cleaned
    }
  };

  const checkNodeAgainstMatchConditions = (node: FileSystemNode, match: Match): boolean => {
    if (node.type !== (match.targetType === MatchTargetType.FOLDER ? 'directory' : 'file')) return false;

    return match.conditions.some(condition => {
        const nodeName = node.name;
        const nodePath = node.path;
        const conditionValue = condition.value;

        if (match.targetType === MatchTargetType.FOLDER) {
            const fm = match as FolderMatch;
            switch (fm.folderMatchType) {
                case FolderMatchType.NAME: return nodeName.toLowerCase().includes(conditionValue.toLowerCase());
                case FolderMatchType.WILDCARD: return wildcardToRegex(conditionValue).test(nodeName);
                case FolderMatchType.REGEX:
                    try { return new RegExp(conditionValue).test(nodeName); } catch (e) { console.error("Invalid Regex for folder name:", conditionValue, e); return false; }
                case FolderMatchType.PATH_WILDCARD:
                    try { return pathWildcardToRegex(conditionValue).test(nodePath); } catch (e) { console.error("Invalid Path Wildcard for folder path:", conditionValue, e); return false; }
                case FolderMatchType.PATH_REGEX:
                    try { return new RegExp(conditionValue).test(nodePath); } catch (e) { console.error("Invalid Regex for folder path:", conditionValue, e); return false; }
                default: return false;
            }
        } else { // FILE
            const fm = match as FileMatch;
            switch (fm.fileMatchType) {
                case FileMatchType.NAME: return nodeName.toLowerCase().includes(conditionValue.toLowerCase());
                case FileMatchType.SUFFIX: return nodeName.toLowerCase().endsWith(conditionValue.toLowerCase().startsWith('.') ? conditionValue.toLowerCase() : `.${conditionValue.toLowerCase()}`);
                case FileMatchType.WILDCARD: return wildcardToRegex(conditionValue).test(nodeName);
                case FileMatchType.REGEX:
                    try { return new RegExp(conditionValue).test(nodeName); } catch (e) { console.error("Invalid Regex for file name:", conditionValue, e); return false; }
                case FileMatchType.PATH_WILDCARD:
                    try { return pathWildcardToRegex(conditionValue).test(nodePath); } catch (e) { console.error("Invalid Path Wildcard for file path:", conditionValue, e); return false; }
                case FileMatchType.PATH_REGEX:
                    try { return new RegExp(conditionValue).test(nodePath); } catch (e) { console.error("Invalid Regex for file path:", conditionValue, e); return false; }
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

  const applyImportRules = (nodes: FileSystemNode[], rulesetIdToApply: UID | null): FileSystemNode[] => {
    const ruleset = rulesetIdToApply ? rulesets.find(rs => rs.id === rulesetIdToApply && rs.type === RuleType.IMPORT) : null;
    if (!ruleset || ruleset.rules.length === 0) {
        // If no ruleset or no rules, all nodes are included by default (maintaining _fileHandle)
        const includeAll = (originalNodes: FileSystemNode[]): FileSystemNode[] => {
            return originalNodes.map(node => {
                const copiedNode = { ...node }; // Shallow copy to preserve _fileHandle
                if (copiedNode.type === 'directory' && copiedNode.children) {
                    (copiedNode as DirectoryNode).children = includeAll(copiedNode.children);
                }
                return copiedNode;
            });
        };
        return includeAll(nodes);
    }

    const sortedRuleInstances = [...ruleset.rules]
        .filter(ri => ri.enabled)
        .sort((a, b) => a.priority - b.priority);

    const decisionMap = new Map<UID, { included: boolean; reason: string }>();

    function determineNodeDecision(node: FileSystemNode, parentDecision: { included: boolean; reason: string }) {
        let isIncluded = parentDecision.included;
        let reason = parentDecision.reason;
        let ruleMatchedThisNode = false;

        for (const ruleInstance of sortedRuleInstances) {
            const rule = rules.find(r => r.id === ruleInstance.ruleId && r.ruleType === RuleType.IMPORT) as ImportRule | undefined;
            if (!rule) continue;

            if (checkNodeMatchesAny(node, rule.matchIds)) {
                ruleMatchedThisNode = true;
                reason = `规则: ${rule.name}`;
                switch (rule.actionType) {
                    case ImportRuleActionType.IMPORT_FILE:
                        if (node.type === 'file') isIncluded = true;
                        break;
                    case ImportRuleActionType.IMPORT_FOLDER:
                        if (node.type === 'directory') isIncluded = true;
                        break;
                    case ImportRuleActionType.CANCEL_IMPORT_FILE:
                        if (node.type === 'file') isIncluded = false;
                        break;
                    case ImportRuleActionType.CANCEL_IMPORT_FOLDER:
                        if (node.type === 'directory') isIncluded = false;
                        break;
                }
                break;
            }
        }
        
        decisionMap.set(node.id, { included: isIncluded, reason });

        if (node.type === 'directory' && node.children) {
            node.children.forEach(child => {
                determineNodeDecision(child, { included: isIncluded, reason: `父文件夹 (${node.name}) ${isIncluded ? '已导入' : '已排除基于规则: ' + reason}` });
            });
        }
    }

    nodes.forEach(node => determineNodeDecision(node, { included: true, reason: "默认包含 (待规则过滤)" }));

    const filterTree = (nodesToFilter: FileSystemNode[]): FileSystemNode[] => {
      return nodesToFilter
        .map(node => { // node is from the original 'nodes' array (rawNodes)
          const decision = decisionMap.get(node.id);
          const isNodeIncluded = decision ? decision.included : false; // Default to false if no decision (should not happen)

          if (node.type === 'directory' && node.children) {
            const filteredChildren = filterTree(node.children);
            if (isNodeIncluded || filteredChildren.length > 0) {
              return { ...node, children: filteredChildren }; // Shallow copy, preserve _fileHandle
            }
            return null;
          }
          return isNodeIncluded ? { ...node } : null; // Shallow copy, preserve _fileHandle
        })
        .filter(node => node !== null) as FileSystemNode[];
    };
    
    return filterTree(nodes); // Pass original nodes (rawNodes)
  };

  const loadContentForRemainingFiles = async (nodes: FileSystemNode[]): Promise<FileSystemNode[]> => {
    const updatedNodesPromises = nodes.map(async (node) => {
        let updatedNode = { ...node };
        if (updatedNode.type === 'file') {
            const fileNode = updatedNode as FileNode;
            if (fileNode._fileHandle && typeof fileNode.content === 'undefined') {
                try {
                    const file = await (fileNode._fileHandle as FileSystemFileHandle).getFile();
                    const textContent = await file.text();
                    fileNode.content = textContent;
                    fileNode.totalLines = textContent.split('\n').length;
                } catch (e) {
                    console.error(`Error loading content for ${fileNode.path}:`, e);
                    fileNode.content = "[错误：无法加载文件内容]";
                    fileNode.totalLines = 0;
                }
            }
            // Always delete _fileHandle after attempting to load or if not needed for this stage
            // to prevent it from being saved in snapshots if not handled there.
            delete fileNode._fileHandle; 
        } else if (updatedNode.type === 'directory' && updatedNode.children) {
            (updatedNode as DirectoryNode).children = await loadContentForRemainingFiles(updatedNode.children);
        }
        return updatedNode;
    });
    return Promise.all(updatedNodesPromises);
  };


  const importDirectory = async (handles?: FileSystemDirectoryHandle[]) => {
    saveFileTreeSnapshot();
    let rawNodes: FileSystemNode[] = [];
    let idCounter = Date.now();

    const isNoLinesContent = (name: string): boolean => DEFAULT_NO_LINES_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext));

    const processHandle = async (handle: FileSystemHandle, parentId: UID | null, currentPath: string): Promise<FileSystemNode | null> => {
        const itemType = handle.kind as ('file' | 'directory');
        const nodeId = `node-${idCounter++}-${handle.name.replace(/[^a-zA-Z0-9_.-]/g, '')}`;
        const newSegment = handle.name.replace(/^\/+|\/+$/g, '');
        const path = currentPath ? `${currentPath}/${newSegment}` : newSegment;

        if (itemType === 'file') {
            const fileHandle = handle as FileSystemFileHandle;
            const noLines = isNoLinesContent(handle.name);
            let nodeContent: string | undefined = undefined;
            let nodeTotalLines: number | undefined = undefined;
            let nodeLineLimitOverride: LineLimitRule | null = null;
            let tempFileHandleForLaterLoading: FileSystemFileHandle | undefined = undefined;

            if (noLines) {
                nodeContent = "[二进制或非文本文件内容不加载]";
                nodeTotalLines = 0;
                nodeLineLimitOverride = {
                    id: generateId(), name: '默认无内容', description: '二进制/非文本文件默认不导出内容',
                    ruleType: RuleType.LINE_LIMIT, matchIds: [],
                    limitType: LineLimitRuleTypeOption.NO_LINES, params: {}
                };
            } else {
                if (handles && handles.length > 0) { 
                     tempFileHandleForLaterLoading = fileHandle;
                } else { 
                    try {
                        const file = await fileHandle.getFile(); 
                        nodeContent = await file.text();
                        nodeTotalLines = nodeContent.split('\n').length;
                    } catch (e) {
                        nodeContent = "[无法读取模拟文件内容]";
                        nodeTotalLines = 0;
                    }
                }
            }

            return {
                id: nodeId, name: handle.name, type: 'file', path, parentId, selected: false,
                content: nodeContent,
                totalLines: nodeTotalLines,
                lineLimitOverride: nodeLineLimitOverride,
                _fileHandle: tempFileHandleForLaterLoading,
            } as FileNode;
        } else {
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
        const mockIndexTsHandle = { name: "index.ts", kind: 'file', getFile: async () => new File(["console.log('hello from mock index.ts');\n// another line"], "index.ts", {type: "text/typescript"}) } as unknown as FileSystemFileHandle;
        const mockReadmeMdHandle = { name: "README.md", kind: 'file', getFile: async () => new File(["# Mock Project Readme\nThis is a mock project."], "README.md", {type: "text/markdown"}) } as unknown as FileSystemFileHandle;
        const mockSrcDirHandle = { name: "src", kind: 'directory', values: async function*() { yield mockIndexTsHandle; } } as unknown as FileSystemDirectoryHandle;
        const mockRootHandle = { name: "示例项目", kind: 'directory', values: async function*() { yield mockSrcDirHandle; yield mockReadmeMdHandle; } } as unknown as FileSystemDirectoryHandle;

        const rootNode = await processHandle(mockRootHandle, null, "");
        if (rootNode) rawNodes.push(rootNode);
      }
    } catch (err) {
      console.error("目录导入错误:", err);
      rawNodes = [];
    }

    const ruleAppliedTree = applyImportRules(rawNodes, selectedImportRulesetId);
    const treeWithContentLoaded = await loadContentForRemainingFiles(ruleAppliedTree);
    setFileTree(treeWithContentLoaded);
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

  const selectAllDescendantFiles = (dirId: UID, select: boolean) => {
    saveFileTreeSnapshot();
    setFileTree(prevTree => updateDescendantFileSelectionsInTree(prevTree, dirId, select));
  };

  const invertSelectionDescendantFiles = (dirId: UID) => {
    saveFileTreeSnapshot();
    setFileTree(prevTree => updateDescendantFileSelectionsInTree(prevTree, dirId, currentSelected => !currentSelected));
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
      rules: originalRuleset.rules.map(ri => ({ ...ri, id: generateId() })),
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
            const rulesCopy = rs.rules.map(r => ({...r}));
            const ruleIndex = rulesCopy.findIndex(ri => ri.id === ruleInstanceId);
            if (ruleIndex === -1) return rs;

            const targetIndex = direction === 'up' ? ruleIndex - 1 : ruleIndex + 1;
            if (targetIndex < 0 || targetIndex >= rulesCopy.length) return rs;

            const currentPriority = rulesCopy[ruleIndex].priority;
            const targetPriority = rulesCopy[targetIndex].priority;

            if (currentPriority === targetPriority) {
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
            const opsCopy = m.operations.map(o => ({...o}));
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
    // Filter out _fileHandle before stringifying for snapshot
    const cleanTreeForSnapshot = (nodes: FileSystemNode[]): FileSystemNode[] => {
        return nodes.map(node => {
            const { _fileHandle, ...restOfNode } = node as FileNode;
            const cleanNode = { ...restOfNode } as FileSystemNode;
            if (cleanNode.type === 'directory' && cleanNode.children) {
                (cleanNode as DirectoryNode).children = cleanTreeForSnapshot(cleanNode.children);
            }
            return cleanNode;
        });
    };
    const snapshot: AppStateSnapshot = { 
        fileTree: cleanTreeForSnapshot(fileTree), 
        selectedFileIds: getSelectedFileIds(fileTree) 
    };
    setMacroUndoStack(prev => [...prev, snapshot].slice(-10));
    setMacroRedoStack([]);
  }, [fileTree]);

  const executeMacro = (macroId: UID) => {
    const macro = macros.find(m => m.id === macroId);
    if (!macro) return;

    saveMacroSnapshot();

    let currentTree = JSON.parse(JSON.stringify(fileTree)); // Create a working copy
     // Ensure _fileHandles are cleaned from this working copy if they existed before stringify
    const cleanTreeFromWorkingCopy = (nodes: FileSystemNode[]): FileSystemNode[] => {
        return nodes.map(node => {
            const { _fileHandle, ...restOfNode } = node as FileNode;
            const cleanNode = { ...restOfNode } as FileSystemNode;
            if (cleanNode.type === 'directory' && cleanNode.children) {
                (cleanNode as DirectoryNode).children = cleanTreeFromWorkingCopy(cleanNode.children);
            }
            return cleanNode;
        });
    };
    currentTree = cleanTreeFromWorkingCopy(currentTree);


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
      saveMacroSnapshot(); // Save current state to redo before reverting
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


  const applyCompressionRulesToFileContent = (content: string, fileNode: FileNode, rulesetIdToApply: UID | null): string => {
    let currentContent = content;
    const appliedRulesDescriptions: string[] = [];

    const effectiveCompressionOptions: CompressionRuleOptions = {};

    if (fileNode.compressionOverride && Object.keys(fileNode.compressionOverride).length > 0) {
        Object.assign(effectiveCompressionOptions, fileNode.compressionOverride);
        appliedRulesDescriptions.push("文件特定压缩覆盖");
    } else {
        const ruleset = rulesetIdToApply ? rulesets.find(rs => rs.id === rulesetIdToApply && rs.type === RuleType.COMPRESSION) : null;
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
            return !trimmed.startsWith('//') &&
                   !trimmed.startsWith('#') &&
                   !trimmed.startsWith(';') &&
                   !trimmed.startsWith('--') &&
                   !trimmed.startsWith("'") && // VBScript/Basic
                   !trimmed.startsWith('%');  // MATLAB/LaTeX
        }).join('\n');
    }
    if (effectiveCompressionOptions.minify) { /* Minify logic placeholder */ }
    return currentContent;
  };

  const applyLineLimitRulesToFileContent = (content: string, fileNode: FileNode, rulesetIdToApply: UID | null): { limitedContent: string, ruleAppliedInfo: string } => {
    let currentContent = content;
    let ruleAppliedInfo = "";
    let lineLimitRuleToApply: LineLimitRule | null = null;

    if (fileNode.lineLimitOverride) {
        lineLimitRuleToApply = fileNode.lineLimitOverride;
    } else {
        const ruleset = rulesetIdToApply ? rulesets.find(rs => rs.id === rulesetIdToApply && rs.type === RuleType.LINE_LIMIT) : null;
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
                } else {
                     newLines = [];
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
    fileTree, setFileTree, importDirectory, updateNodeSelectionInTree,
    selectAllDescendantFiles, invertSelectionDescendantFiles,
    updateNodeProperties,
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
    exportContent,
    globalSettings: _globalSettings,
    fileTreeUndoStack, fileTreeRedoStack, saveFileTreeSnapshot, undoFileTreeAction, redoFileTreeAction,
    canUndoFileTree: fileTreeUndoStack.length > 0,
    canRedoFileTree: fileTreeRedoStack.length > 0,
    macroUndoStack, macroRedoStack, executeMacro, undoMacroExecution, redoMacroExecution,
    canUndoMacro: macroUndoStack.length > 0,
    canRedoMacro: macroRedoStack.length > 0,
    resetAllPersistedData
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext 必须在 AppProvider 内部使用');
  return context;
};
