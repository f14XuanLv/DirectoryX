
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { useAppContext } from '../contexts/AppContext';
import { 
    FileSystemNode, FileNode, DirectoryNode, UID, RuleType, 
    LineLimitRule, CompressionRuleOptions, LineLimitRuleTypeOption, CompressionRuleTypeOption, 
    ExportType, Ruleset, Macro 
} from '../types';
import { 
    FOLDER_ICON, FILE_ICON, CHEVRON_DOWN_ICON, CHEVRON_RIGHT_ICON, PROPERTIES_ICON, 
    PLAY_ICON, UNDO_ICON, REDO_ICON 
} from '../constants';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Checkbox from '../components/common/Checkbox';
import QueryInput from '../components/common/QueryInput';
import Tooltip from '../components/common/Tooltip';


interface FileSystemTreeItemProps {
  node: FileSystemNode;
  level: number;
  onToggleExpand: (nodeId: UID) => void;
  expandedNodes: Set<UID>;
  onSelectNode: (nodeId: UID, selected: boolean) => void;
  onSelectAllChildren: (nodeId: UID, select: boolean) => void;
  onInvertSelectionChildren: (nodeId: UID) => void;
  onOpenProperties: (node: FileSystemNode) => void;
  highlightedNodeId?: UID;
}

const FileSystemTreeItem: React.FC<FileSystemTreeItemProps> = React.memo(({
  node, level, onToggleExpand, expandedNodes, onSelectNode,
  onSelectAllChildren, onInvertSelectionChildren, onOpenProperties, highlightedNodeId,
}) => {
  const isDirectory = node.type === 'directory';
  const isExpanded = expandedNodes.has(node.id);
  const [showActions, setShowActions] = useState(false);

  const handleToggle = useCallback(() => {
    if (isDirectory) onToggleExpand(node.id);
  }, [isDirectory, node.id, onToggleExpand]);

  const itemBaseClasses = "flex items-center py-1.5 px-2 rounded-md hover:bg-slate-100 transition-colors duration-100 cursor-pointer";
  const highlightedClasses = "bg-sky-100 border border-sky-300";

  return (
    <div id={`treenode-${node.id}`} role="treeitem" aria-expanded={isDirectory ? isExpanded : undefined}>
      <div
        style={{ paddingLeft: `${level * 1.5}rem` }}
        className={`${itemBaseClasses} ${node.id === highlightedNodeId ? highlightedClasses : ''}`}
        onMouseEnter={() => isDirectory && setShowActions(true)}
        onMouseLeave={() => isDirectory && setShowActions(false)}
      >
        {isDirectory && (
          <button onClick={handleToggle} className="mr-1 focus:outline-none text-slate-500 hover:text-slate-700" aria-label={isExpanded ? `折叠 ${node.name}` : `展开 ${node.name}`}>
            {isExpanded ? CHEVRON_DOWN_ICON : CHEVRON_RIGHT_ICON}
          </button>
        )}
        {!isDirectory && <div className="w-4 mr-1"></div>}
        
        <span onClick={handleToggle} className="flex items-center flex-grow truncate">
            {isDirectory ? React.cloneElement(FOLDER_ICON, {className:"w-5 h-5 inline-block mr-1 text-amber-500 flex-shrink-0"}) : React.cloneElement(FILE_ICON, {className:"w-5 h-5 inline-block mr-1 text-sky-500 flex-shrink-0"})}
            <span className="ml-1 truncate">{node.name}</span>
        </span>
        
        <div className="ml-auto flex items-center space-x-1 flex-shrink-0">
            {node.type === 'file' && (
            <Checkbox
                checked={(node as FileNode).selected || false}
                onChange={(e) => onSelectNode(node.id, e.target.checked)}
                className="mr-2"
                aria-label={`选择文件 ${node.name}`}
            />
            )}

            {isDirectory && showActions && (
            <>
                <Tooltip text="全选此文件夹内文件"><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onSelectAllChildren(node.id, true); }}>全选</Button></Tooltip>
                <Tooltip text="全不选此文件夹内文件"><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onSelectAllChildren(node.id, false); }}>不选</Button></Tooltip>
                <Tooltip text="反选此文件夹内文件"><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onInvertSelectionChildren(node.id); }}>反选</Button></Tooltip>
            </>
            )}
            <Tooltip text="属性">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onOpenProperties(node);}} className="text-slate-500 hover:text-slate-700" aria-label={`属性 ${node.name}`}>
                    {React.cloneElement(PROPERTIES_ICON, {className:"w-4 h-4"})}
                </Button>
            </Tooltip>
        </div>
      </div>
      {isDirectory && isExpanded && (
        <div id={`children-${node.id}`} role="group">
            {(node as DirectoryNode).children.map((child) => (
            <FileSystemTreeItem
                key={child.id} node={child} level={level + 1}
                onToggleExpand={onToggleExpand} expandedNodes={expandedNodes}
                onSelectNode={onSelectNode}
                onSelectAllChildren={onSelectAllChildren} onInvertSelectionChildren={onInvertSelectionChildren}
                onOpenProperties={onOpenProperties} highlightedNodeId={highlightedNodeId}
            />
            ))}
        </div>
      )}
    </div>
  );
});
FileSystemTreeItem.displayName = 'FileSystemTreeItem';


interface FilePropertiesModalProps {
  node: FileSystemNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: UID, properties: Partial<Pick<FileSystemNode, 'descriptionOverride' | 'lineLimitOverride' | 'compressionOverride'>>) => void;
}

const compressionTypeToOptionKey: Record<string, keyof CompressionRuleOptions | undefined> = {
  [CompressionRuleTypeOption.REMOVE_EMPTY_LINES]: 'removeEmptyLines',
  [CompressionRuleTypeOption.REMOVE_COMMENTS]: 'removeComments',
  [CompressionRuleTypeOption.MINIFY]: 'minify',
};

const FilePropertiesModal: React.FC<FilePropertiesModalProps> = ({ node, isOpen, onClose, onSave }) => {
  const [description, setDescription] = useState('');
  const [limitType, setLimitType] = useState<LineLimitRuleTypeOption | ''>('');
  const [limitParams, setLimitParams] = useState<LineLimitRule["params"]>({});
  const [calculatedLinesDisplay, setCalculatedLinesDisplay] = useState<string>('');
  const [compressionOpts, setCompressionOpts] = useState<CompressionRuleOptions>({});

  useEffect(() => {
    if (node) {
      setDescription(node.descriptionOverride || '');
      setCalculatedLinesDisplay('');
      if (node.type === 'file') {
        const fileNode = node as FileNode;
        setLimitType(fileNode.lineLimitOverride?.limitType || '');
        setLimitParams(fileNode.lineLimitOverride?.params || {});
        setCompressionOpts(fileNode.compressionOverride || {});
      } else {
        setLimitType(''); setLimitParams({}); setCompressionOpts({});
      }
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    const properties: Partial<Pick<FileSystemNode, 'descriptionOverride' | 'lineLimitOverride' | 'compressionOverride'>> = { descriptionOverride: description };
    if (node.type === 'file') {
      if (limitType) {
        properties.lineLimitOverride = { 
            id: `override-${node.id}-${Date.now()}`, name: `文件特定限制: ${node.name}`, 
            description: `文件 ${node.name} 的行数限制覆盖。`, 
            ruleType: RuleType.LINE_LIMIT, matchIds: [], 
            limitType: limitType, params: limitParams 
        };
      } else {
        properties.lineLimitOverride = null;
      }
      properties.compressionOverride = Object.values(compressionOpts).some(v => v) ? compressionOpts : undefined;
    }
    onSave(node.id, properties);
    onClose();
  };
  
  const calculateTotalLines = () => {
    if(node?.type === 'file') {
        const fileNode = node as FileNode;
        const total = fileNode.totalLines ?? (fileNode.content ? fileNode.content.split('\\n').length : 0);
        setCalculatedLinesDisplay(String(total));
    } else {
        setCalculatedLinesDisplay("不适用");
    }
  };

  const calculateExportLines = () => {
    if (node?.type === 'file' && limitType === LineLimitRuleTypeOption.RANDOM_PERCENT && typeof limitParams.percent === 'number') {
      const fileNode = node as FileNode;
      const total = fileNode.totalLines ?? (fileNode.content ? fileNode.content.split('\\n').length : 0);
      setCalculatedLinesDisplay(String(Math.round(total * (limitParams.percent / 100))));
    } else {
       setCalculatedLinesDisplay(''); 
    }
  };

  const lineLimitOptions = Object.values(LineLimitRuleTypeOption)
    .map(lt => ({ value: lt, label: lt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }));
    
  const compressionOptionsList = Object.values(CompressionRuleTypeOption)
    .map(co => ({ value: co, label: co.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`属性: ${node.name}`} size="lg">
      <div className="space-y-4">
        <TextArea label="描述信息" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="输入描述 (将在合并导出时附加在文件内容开头)" containerClassName="mb-4"/>
        {node.type === 'file' && (
          <>
            <h4 className="text-md font-semibold mt-6 mb-2 pt-4 border-t text-gray-700">行数限制 (覆盖默认)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 items-end">
                <Select label="限制类型" options={[{value: '', label: '无 (使用规则集)'}, ...lineLimitOptions]} value={limitType} onChange={(e) => { setLimitType(e.target.value as LineLimitRuleTypeOption | ''); setLimitParams({}); setCalculatedLinesDisplay(''); }} containerClassName="mb-1"/>
                <Button onClick={calculateTotalLines} variant="secondary" size="sm" className="self-end mb-1 h-9">计算总行数</Button>
            </div>
            {calculatedLinesDisplay && <p className="text-sm text-gray-600 mb-3">总/计算行数: {calculatedLinesDisplay}</p>}

            {limitType === LineLimitRuleTypeOption.HEAD_N && <Input type="number" label="N (头部行数)" value={limitParams.n || ''} onChange={e => setLimitParams({...limitParams, n: parseInt(e.target.value) || undefined})} containerClassName="mb-1" />}
            {limitType === LineLimitRuleTypeOption.TAIL_N && <Input type="number" label="N (尾部行数)" value={limitParams.n || ''} onChange={e => setLimitParams({...limitParams, n: parseInt(e.target.value) || undefined})} containerClassName="mb-1" />}
            {limitType === LineLimitRuleTypeOption.HEAD_M_TAIL_N && (<div className="grid grid-cols-2 gap-x-4 gap-y-1"><Input type="number" label="M (头部行数)" value={limitParams.m || ''} onChange={e => setLimitParams({...limitParams, m: parseInt(e.target.value) || undefined})} /><Input type="number" label="N (尾部行数)" value={limitParams.n || ''} onChange={e => setLimitParams({...limitParams, n: parseInt(e.target.value) || undefined})} /></div>)}
            {limitType === LineLimitRuleTypeOption.CUSTOM_RANGE && (<div className="grid grid-cols-2 gap-x-4 gap-y-1"><Input type="number" label="起始行 (从1开始)" value={limitParams.start || ''} onChange={e => setLimitParams({...limitParams, start: parseInt(e.target.value) || undefined})} /><Input type="number" label="结束行" value={limitParams.end || ''} onChange={e => setLimitParams({...limitParams, end: parseInt(e.target.value) || undefined})} /></div>)}
            {limitType === LineLimitRuleTypeOption.RANDOM_N && <Input type="number" label="N (随机行数)" value={limitParams.n || ''} onChange={e => setLimitParams({...limitParams, n: parseInt(e.target.value) || undefined})} containerClassName="mb-1" />}
            {limitType === LineLimitRuleTypeOption.RANDOM_PERCENT && (<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 items-end"><Input type="number" label="行数百分比 (%)" value={limitParams.percent || ''} onChange={e => setLimitParams({...limitParams, percent: parseInt(e.target.value) || undefined})} min="0" max="100" containerClassName="mb-1"/><Button onClick={calculateExportLines} variant="secondary" size="sm" className="self-end mb-1 h-9">计算导出行数</Button></div>)}

            <h4 className="text-md font-semibold mt-6 mb-2 pt-4 border-t text-gray-700">压缩规则 (覆盖默认)</h4>
            <div className="space-y-2">
                {compressionOptionsList.map(opt => {
                    const key = compressionTypeToOptionKey[opt.value];
                    if (!key) return null;
                    return (<Checkbox key={opt.value} label={opt.label} checked={!!compressionOpts[key]} onChange={e => setCompressionOpts(prev => ({...prev, [key]: e.target.checked}))}/>);
                })}
            </div>
          </>
        )}
      </div>
      <div className="mt-8 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={handleSave}>保存属性</Button>
      </div>
    </Modal>
  );
};


const FilesView: React.FC = () => {
  const { 
    fileTree, importDirectory, 
    updateNodeSelectionInTree, updateNodeProperties, exportContent,
    selectAllDescendantFiles, invertSelectionDescendantFiles, // Use new context methods
    rulesets, macros, executeMacro,
    selectedImportRulesetId, setSelectedImportRulesetId,
    selectedCompressionRulesetId, setSelectedCompressionRulesetId,
    selectedLineLimitRulesetId, setSelectedLineLimitRulesetId,
    undoFileTreeAction, canUndoFileTree, redoFileTreeAction, canRedoFileTree,
    undoMacroExecution, redoMacroExecution, canUndoMacro, canRedoMacro,
  } = useAppContext();

  const [expandedNodes, setExpandedNodes] = useState<Set<UID>>(new Set());
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false);
  const [currentNodeForProperties, setCurrentNodeForProperties] = useState<FileSystemNode | null>(null);
  
  const [showFolderQuery, setShowFolderQuery] = useState(false);
  const [folderSearchTerm, setFolderSearchTerm] = useState('');
  const [folderQueryResults, setFolderQueryResults] = useState<DirectoryNode[]>([]);
  const [currentFolderQueryIndex, setCurrentFolderQueryIndex] = useState(-1);
  const folderQueryInputRef = useRef<HTMLInputElement>(null);
  
  const [showFileQuery, setShowFileQuery] = useState(false);
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [fileQueryResults, setFileQueryResults] = useState<FileNode[]>([]);
  const [currentFileQueryIndex, setCurrentFileQueryIndex] = useState(-1);
  const fileQueryInputRef = useRef<HTMLInputElement>(null);

  const [highlightedNodeId, setHighlightedNodeId] = useState<UID | undefined>(undefined);
  const [importErrorType, setImportErrorType] = useState<'none' | 'crossOrigin' | 'apiUnavailable' | 'generic'>('none');
  const isNewImportRef = useRef(false);


  useEffect(() => {
    if (fileTree.length > 0) {
      if (isNewImportRef.current) { // Only reset if a new import just happened
        const initialExpanded = new Set<UID>();
        fileTree.forEach(node => {
          if (node.type === 'directory') {
            initialExpanded.add(node.id);
          }
        });
        setExpandedNodes(initialExpanded);
        isNewImportRef.current = false; // Reset the flag
      }
      // If not a new import, expandedNodes is preserved.
    } else {
      // If fileTree becomes empty (e.g., project cleared), reset expandedNodes.
      setExpandedNodes(new Set());
    }
  }, [fileTree]); 

  useEffect(() => { 
    const handleKeyDown = (event: KeyboardEvent) => {
        const targetIsInput = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
        if (targetIsInput && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) return; 

        if (event.ctrlKey || event.metaKey) {
            const keyLower = event.key.toLowerCase();
            if (!targetIsInput) { 
                if (event.shiftKey && keyLower === 'f') {
                    event.preventDefault(); setShowFolderQuery(s => !s); setShowFileQuery(false);
                    if (!showFolderQuery) setTimeout(() => folderQueryInputRef.current?.focus(), 0);
                } else if (keyLower === 'f' && !event.shiftKey) {
                    event.preventDefault(); setShowFileQuery(s => !s); setShowFolderQuery(false);
                    if (!showFileQuery) setTimeout(() => fileQueryInputRef.current?.focus(), 0);
                }
            }
            if (keyLower === 'z') {
                 event.preventDefault();
                 if (canUndoMacro) undoMacroExecution(); 
                 else if (canUndoFileTree) undoFileTreeAction();
            } else if (keyLower === 'y') {
                 event.preventDefault();
                 if (canRedoMacro) redoMacroExecution();
                 else if (canRedoFileTree) redoFileTreeAction();
            }
        } else if (event.key === "Escape") {
            if (showFolderQuery) { setShowFolderQuery(false); setFolderSearchTerm(''); }
            if (showFileQuery) { setShowFileQuery(false); setFileSearchTerm(''); }
            if (propertiesModalOpen) setPropertiesModalOpen(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndoFileTree, undoFileTreeAction, canRedoFileTree, redoFileTreeAction, showFolderQuery, showFileQuery, propertiesModalOpen, canUndoMacro, undoMacroExecution, canRedoMacro, redoMacroExecution]);

  const handleToggleExpand = useCallback((nodeId: UID) => {
    setExpandedNodes(prev => { const newSet = new Set(prev); if (newSet.has(nodeId)) newSet.delete(nodeId); else newSet.add(nodeId); return newSet; });
  }, []);

  const expandToNode = useCallback((nodeId: UID) => { 
    const pathIds = new Set<UID>(); let found = false;
    function findPathRecursive(nodes: FileSystemNode[], targetId: UID, currentPath: UID[]): void {
        if (found) return;
        for (const node of nodes) {
            if (node.id === targetId) { currentPath.forEach(id => pathIds.add(id)); found = true; return; }
            if (node.type === 'directory' && node.children) { findPathRecursive(node.children, targetId, [...currentPath, node.id]); if (found) return; }
        }
    }
    findPathRecursive(fileTree, nodeId, []);
    setExpandedNodes(prev => new Set([...Array.from(prev), ...Array.from(pathIds)]));
    setHighlightedNodeId(nodeId);
    setTimeout(() => document.getElementById(`treenode-${nodeId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }, [fileTree]);

  useEffect(() => { 
    if (folderSearchTerm.trim()) {
      const results: DirectoryNode[] = [];
      const searchRecursive = (nodes: FileSystemNode[]) => {
        nodes.forEach(node => {
          if (node.type === 'directory') {
            if (node.name.toLowerCase().includes(folderSearchTerm.toLowerCase().trim())) results.push(node as DirectoryNode);
            if (node.children) searchRecursive(node.children); }}); };
      searchRecursive(fileTree); setFolderQueryResults(results);
      const newIndex = results.length > 0 ? 0 : -1; setCurrentFolderQueryIndex(newIndex);
      if (newIndex !== -1) expandToNode(results[newIndex].id); else setHighlightedNodeId(undefined);
    } else { setFolderQueryResults([]); setCurrentFolderQueryIndex(-1); setHighlightedNodeId(undefined); }
  }, [folderSearchTerm, fileTree, expandToNode]);
  const handleFolderQueryNav = (direction: 'next' | 'prev') => { 
    if (folderQueryResults.length === 0) return; let newIndex = currentFolderQueryIndex;
    if (direction === 'next') newIndex = (currentFolderQueryIndex + 1) % folderQueryResults.length;
    else newIndex = (currentFolderQueryIndex - 1 + folderQueryResults.length) % folderQueryResults.length;
    setCurrentFolderQueryIndex(newIndex); expandToNode(folderQueryResults[newIndex].id);
  };

  useEffect(() => { 
    if (fileSearchTerm.trim()) {
      const results: FileNode[] = [];
      const searchRecursive = (nodes: FileSystemNode[]) => {
        nodes.forEach(node => {
          if (node.type === 'file') { if (node.name.toLowerCase().includes(fileSearchTerm.toLowerCase().trim())) results.push(node as FileNode); }
          else if (node.type === 'directory' && node.children) searchRecursive(node.children); }); };
      searchRecursive(fileTree); setFileQueryResults(results);
      const newIndex = results.length > 0 ? 0 : -1; setCurrentFileQueryIndex(newIndex);
      if (newIndex !== -1) expandToNode(results[newIndex].id); else setHighlightedNodeId(undefined);
    } else { setFileQueryResults([]); setCurrentFileQueryIndex(-1); setHighlightedNodeId(undefined); }
  }, [fileSearchTerm, fileTree, expandToNode]);
  const handleFileQueryNav = (direction: 'next' | 'prev') => { 
    if (fileQueryResults.length === 0) return; let newIndex = currentFileQueryIndex;
    if (direction === 'next') newIndex = (currentFileQueryIndex + 1) % fileQueryResults.length;
    else newIndex = (currentFileQueryIndex - 1 + fileQueryResults.length) % fileQueryResults.length;
    setCurrentFileQueryIndex(newIndex); expandToNode(fileQueryResults[newIndex].id);
  };

  const handleOpenProperties = (node: FileSystemNode) => { setCurrentNodeForProperties(node); setPropertiesModalOpen(true); };
  const handleSaveProperties = (nodeId: UID, properties: Partial<Pick<FileSystemNode, 'descriptionOverride' | 'lineLimitOverride' | 'compressionOverride'>>) => updateNodeProperties(nodeId, properties);
  
  const handleImportDirectory = async () => {
    setImportErrorType('none'); 
    isNewImportRef.current = true; // Signal that a new import is about to happen
    try {
      if (typeof window.showDirectoryPicker !== 'function') {
        console.warn("window.showDirectoryPicker API 不可用。将使用预设的示例项目。");
        setImportErrorType('apiUnavailable');
        await importDirectory(); 
        return;
      }
      const dirHandle = await window.showDirectoryPicker();
      await importDirectory([dirHandle]); 
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log("用户取消了目录选择。");
        isNewImportRef.current = false; // Reset flag if aborted
        return; 
      }
      
      if (err instanceof Error && err.message.includes("Cross origin sub frames aren't allowed to show a file picker")) {
        console.warn("由于环境限制 (例如跨域iframe)，无法打开原生目录选择器。将使用预设的示例项目。");
        setImportErrorType('crossOrigin');
      } else {
        console.error("目录导入错误:", err);
        setImportErrorType('generic');
      }
      
      await importDirectory(); 
    }
    // Note: isNewImportRef.current will be reset by the useEffect after fileTree updates
  };
  
  const handleSelectNode = (nodeId: UID, selected: boolean) => updateNodeSelectionInTree(nodeId, selected);
  
  const handleSelectAllChildren = (dirId: UID, select: boolean) => {
    selectAllDescendantFiles(dirId, select);
  };
  const handleInvertSelectionChildren = (dirId: UID) => {
    invertSelectionDescendantFiles(dirId);
  };

  const rulesetOptions = (type: RuleType) => [
    { value: '', label: '无 (或文件覆盖优先)' },
    ...rulesets.filter(rs => rs.type === type).map(rs => ({ value: rs.id, label: rs.name }))
  ];

  const availableMacros = macros.map(m => ({ value: m.id, label: m.name }));

  const renderFileTreeContent = () => {
    if (fileTree.length === 0) {
        if (importErrorType === 'apiUnavailable') {
            return (
                <div className="text-center py-10 px-6 bg-amber-50 border border-amber-200 rounded-md shadow-sm m-4">
                  <p className="text-amber-700 font-semibold text-lg mb-2">目录选择器不可用</p>
                  <p className="text-gray-700 mb-1">您的浏览器或当前环境不支持直接选择文件夹功能 (<code>showDirectoryPicker</code> API 不可用)。</p>
                  <p className="text-gray-600">已加载一个<strong className="font-medium">示例项目</strong>供您预览工具功能。</p>
                  <p className="text-gray-600 mt-3 text-sm">为了使用您自己的项目，请尝试在支持此 API 的现代浏览器 (如 Chrome, Edge) 的<strong className="font-medium">顶层上下文</strong>中运行此工具 (例如，直接打开HTML文件，而不是在某些在线编辑器的 iframe 中)。</p>
                </div>
            );
        }
        if (importErrorType === 'crossOrigin') {
            return (
                <div className="text-center py-10 px-6 bg-red-50 border border-red-200 rounded-md shadow-sm m-4">
                  <p className="text-red-700 font-semibold text-lg mb-2">目录导入受限 (跨域问题)</p>
                  <p className="text-gray-700 mb-1">由于安全限制 (例如，此应用可能在一个跨域的 iframe 中运行)，无法直接选择您的项目文件夹。</p>
                  <p className="text-gray-600">已加载一个<strong className="font-medium">示例项目</strong>供您预览工具功能。</p>
                  <p className="text-gray-600 mt-3 text-sm">为了导入您自己的项目，请尝试在<strong className="font-medium">顶层浏览器窗口 (非 iframe)</strong> 中运行此工具，或者在<strong className="font-medium">本地环境</strong>中打开它 (例如通过本地Web服务器)。</p>
                </div>
            );
        }
        if (importErrorType === 'generic') {
            return (
                <div className="text-center py-10 px-6 bg-red-50 border border-red-200 rounded-md shadow-sm m-4">
                  <p className="text-red-700 font-semibold text-lg mb-2">目录导入失败</p>
                  <p className="text-gray-700 mb-1">尝试导入目录时发生未知错误。</p>
                  <p className="text-gray-600">已加载一个<strong className="font-medium">示例项目</strong>供您预览工具功能。请检查浏览器控制台获取更多错误详情。</p>
                </div>
            );
        }
        return <p className="text-gray-500 text-center py-10">未导入目录。点击 "导入目录" 开始。</p>;
    }

    return fileTree.map(node => (
        <FileSystemTreeItem 
            key={node.id} node={node} level={0} 
            expandedNodes={expandedNodes} onToggleExpand={handleToggleExpand} 
            onSelectNode={handleSelectNode} 
            onSelectAllChildren={handleSelectAllChildren} 
            onInvertSelectionChildren={handleInvertSelectionChildren} 
            onOpenProperties={handleOpenProperties} 
            highlightedNodeId={highlightedNodeId}
        />
    ));
  };


  return (
    <div className="flex flex-col h-full bg-white shadow-sm rounded-lg">
      <div className="p-3 border-b border-gray-200 bg-slate-50 rounded-t-lg sticky top-0 z-10">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {/* Left Controls */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <Button onClick={handleImportDirectory} variant="primary">导入目录</Button>
            <div className="relative">
                <Button onClick={() => {setShowFolderQuery(s => !s); if(showFileQuery) setShowFileQuery(false); setTimeout(() => folderQueryInputRef.current?.focus(),0);}} variant="secondary">查询文件夹</Button>
                {showFolderQuery && (<div className="absolute top-full mt-1.5 left-0 z-20 w-72 shadow-lg"><QueryInput inputRef={folderQueryInputRef} searchTerm={folderSearchTerm} onSearchTermChange={setFolderSearchTerm} onPrevious={() => handleFolderQueryNav('prev')} onNext={() => handleFolderQueryNav('next')} onClose={() => {setShowFolderQuery(false); setFolderSearchTerm('');}} placeholder="输入文件夹名..." currentMatchIndex={currentFolderQueryIndex} totalMatches={folderQueryResults.length}/></div>)}
            </div>
            <div className="relative">
                <Button onClick={() => {setShowFileQuery(s => !s); if(showFolderQuery) setShowFolderQuery(false); setTimeout(() => fileQueryInputRef.current?.focus(),0);}} variant="secondary">查询文件</Button>
                {showFileQuery && (<div className="absolute top-full mt-1.5 left-0 z-20 w-72 shadow-lg"><QueryInput inputRef={fileQueryInputRef} searchTerm={fileSearchTerm} onSearchTermChange={setFileSearchTerm} onPrevious={() => handleFileQueryNav('prev')} onNext={() => handleFileQueryNav('next')} onClose={() => {setShowFileQuery(false); setFileSearchTerm('');}} placeholder="输入文件名..." currentMatchIndex={currentFileQueryIndex} totalMatches={fileQueryResults.length}/></div>)}
            </div>
            <div className="relative group">
                <Button variant="secondary">导出 ▼</Button>
                <div className="absolute left-0 top-full w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 ease-in-out z-20 invisible group-hover:visible group-focus-within:visible">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                    <a href="#" onClick={(e) => {e.preventDefault(); exportContent(ExportType.MERGE_SELECTED);}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-100" role="menuitem">合并导出选中的文件</a>
                    <a href="#" onClick={(e) => {e.preventDefault(); exportContent(ExportType.SEPARATE_SELECTED);}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-100" role="menuitem">分开导出选中的文件</a>
                    <a href="#" onClick={(e) => {e.preventDefault(); exportContent(ExportType.DIRECTORY_TREE);}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-100" role="menuitem">导出目录树</a>
                    </div>
                </div>
            </div>
          </div>
          {/* Right Controls */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
             <Select label="导入规则集:" value={selectedImportRulesetId || ''} onChange={e => setSelectedImportRulesetId(e.target.value || null)} options={rulesetOptions(RuleType.IMPORT)} containerClassName="min-w-[150px]" className="text-xs p-1"/>
             <Select label="压缩规则集:" value={selectedCompressionRulesetId || ''} onChange={e => setSelectedCompressionRulesetId(e.target.value || null)} options={rulesetOptions(RuleType.COMPRESSION)} containerClassName="min-w-[150px]" className="text-xs p-1"/>
             <Select label="行数限制集:" value={selectedLineLimitRulesetId || ''} onChange={e => setSelectedLineLimitRulesetId(e.target.value || null)} options={rulesetOptions(RuleType.LINE_LIMIT)} containerClassName="min-w-[150px]" className="text-xs p-1"/>
          </div>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* File Tree Area */}
        <div className="flex-grow w-3/4 p-3 overflow-y-auto border-r border-gray-200" role="tree">
          {renderFileTreeContent()}
        </div>

        {/* Macro Operations Panel */}
        <div className="w-1/4 p-3 overflow-y-auto bg-slate-50 border-l border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-slate-700">宏操作</h3>
            <div className="flex items-center space-x-1 mb-4">
                <Button onClick={() => {if(canUndoMacro) undoMacroExecution(); else if (canUndoFileTree) undoFileTreeAction();}} disabled={!canUndoMacro && !canUndoFileTree} leftIcon={React.cloneElement(UNDO_ICON, {className:"w-4 h-4"})} size="sm" variant="secondary" aria-label="撤销 (Ctrl+Z)">撤销</Button>
                <Button onClick={() => {if(canRedoMacro) redoMacroExecution(); else if (canRedoFileTree) redoFileTreeAction();}} disabled={!canRedoMacro && !canRedoFileTree} leftIcon={React.cloneElement(REDO_ICON, {className:"w-4 h-4"})} size="sm" variant="secondary" aria-label="重做 (Ctrl+Y)">重做</Button>
            </div>
            {availableMacros.length === 0 && <p className="text-sm text-gray-500">没有可用的宏。请在“宏操作”界面创建。</p>}
            <ul className="space-y-2">
                {availableMacros.map(macro => (
                    <li key={macro.value} className="flex items-center justify-between p-2 bg-white rounded shadow-sm hover:shadow">
                        <span className="text-sm text-gray-800 truncate" title={macros.find(m=>m.id === macro.value)?.description}>{macro.label}</span>
                        <Tooltip text="执行宏">
                            <Button size="sm" variant="ghost" onClick={() => executeMacro(macro.value)} aria-label={`执行宏 ${macro.label}`}>
                                {React.cloneElement(PLAY_ICON, {className: "w-4 h-4 text-green-600 hover:text-green-700"})}
                            </Button>
                        </Tooltip>
                    </li>
                ))}
            </ul>
        </div>
      </div>
      {propertiesModalOpen && <FilePropertiesModal node={currentNodeForProperties} isOpen={propertiesModalOpen} onClose={() => setPropertiesModalOpen(false)} onSave={handleSaveProperties} />}
    </div>
  );
};

export default FilesView;
