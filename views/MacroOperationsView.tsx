
import React, { useState, useMemo, useEffect } from 'react';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Modal from '../components/common/Modal';
import Checkbox from '../components/common/Checkbox';
import { useAppContext } from '../contexts/AppContext';
import { UID, Macro, Operation, OperationInstance, Match, OperationTargetType, FolderOperationType, FileOperationType, FolderOperation, FileOperation } from '../types';
import { PLUS_ICON, PENCIL_ICON, TRASH_ICON, ARROW_UP_ICON, ARROW_DOWN_ICON, EYE_ICON, COPY_ICON } from '../constants';
import Tooltip from '../components/common/Tooltip';


interface CreateOperationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (opData: Omit<Operation, 'id' | 'isDefault'>, originalId?: UID) => void;
    initialOperation?: Operation | null;
}

const CreateOperationModal: React.FC<CreateOperationModalProps> = ({ isOpen, onClose, onSave, initialOperation }) => {
    const { matches: allMatches, operations: existingOperations } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [targetType, setTargetType] = useState<OperationTargetType>(OperationTargetType.MATCHED_FILE);
    const [folderAction, setFolderAction] = useState<FolderOperationType | ''>('');
    const [fileAction, setFileAction] = useState<FileOperationType | ''>('');
    const [selectedMatchIds, setSelectedMatchIds] = useState<UID[]>([]);
    const [nameError, setNameError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialOperation) {
                setName(initialOperation.name);
                setDescription(initialOperation.description);
                setTargetType(initialOperation.targetType);
                setSelectedMatchIds([...initialOperation.matchIds]);
                if (initialOperation.targetType === OperationTargetType.MATCHED_FOLDER_CONTENT) setFolderAction((initialOperation as FolderOperation).action);
                else setFileAction((initialOperation as FileOperation).action);
            } else {
                setName(''); setDescription(''); setSelectedMatchIds([]);
                setTargetType(OperationTargetType.MATCHED_FILE);
                setFolderAction(''); setFileAction('');
            }
            setNameError(null);
        }
    }, [initialOperation, isOpen]);
    
    const validateName = (currentName: string): boolean => {
        if (!currentName.trim()) { setNameError("操作名称不能为空"); return false; }
        const isDuplicate = existingOperations.some(op => op.name.toLowerCase() === currentName.toLowerCase() && op.id !== initialOperation?.id);
        if (isDuplicate) { setNameError("操作名称已存在"); return false; }
        setNameError(null);
        return true;
    };
    useEffect(() => { if(name) validateName(name);}, [name, initialOperation, existingOperations]);

    const handleSubmit = () => {
        if (!validateName(name)) return;
        if (selectedMatchIds.length === 0) { alert("至少选择一个匹配项"); return; }

        let opPayloadBase = { name, description, targetType, matchIds: selectedMatchIds };
        let finalOpData: Omit<Operation, 'id' | 'isDefault'>;

        if (targetType === OperationTargetType.MATCHED_FOLDER_CONTENT) {
            if (!folderAction) { alert("请选择文件夹操作类型"); return; }
            finalOpData = { ...opPayloadBase, targetType: OperationTargetType.MATCHED_FOLDER_CONTENT, action: folderAction as FolderOperationType };
        } else { // MATCHED_FILE
            if (!fileAction) { alert("请选择文件操作类型"); return; }
            finalOpData = { ...opPayloadBase, targetType: OperationTargetType.MATCHED_FILE, action: fileAction as FileOperationType };
        }
        onSave(finalOpData, initialOperation?.id);
        onClose();
    };
    
    const toggleMatchSelection = (matchId: UID) => {
        setSelectedMatchIds(prev => prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]);
    };

    const operationTargetTypeOptions = Object.values(OperationTargetType).map(val => ({value: val, label: val}));
    const folderOperationTypeOptions = Object.values(FolderOperationType).map(val => ({value: val, label: val}));
    const fileOperationTypeOptions = Object.values(FileOperationType).map(val => ({value: val, label: val}));
    
    const relevantMatches = useMemo(() => {
        if (targetType === OperationTargetType.MATCHED_FOLDER_CONTENT) return allMatches.filter(m => m.targetType === '文件夹');
        return allMatches.filter(m => m.targetType === '文件');
    }, [allMatches, targetType]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialOperation ? "修改操作" : "创建新操作"} size="xl">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Input label="操作名称" value={name} onChange={e => setName(e.target.value)} required error={nameError} />
                <TextArea label="描述" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                <Select label="操作目标类型" value={targetType} onChange={e => { setTargetType(e.target.value as OperationTargetType); setFolderAction(''); setFileAction('');}} options={operationTargetTypeOptions} />

                {targetType === OperationTargetType.MATCHED_FOLDER_CONTENT && (
                    <Select label="文件夹操作" value={folderAction} onChange={e => setFolderAction(e.target.value as FolderOperationType)} options={[{value: '', label: '选择操作'}, ...folderOperationTypeOptions]} />
                )}
                {targetType === OperationTargetType.MATCHED_FILE && (
                    <Select label="文件操作" value={fileAction} onChange={e => setFileAction(e.target.value as FileOperationType)} options={[{value: '', label: '选择操作'}, ...fileOperationTypeOptions]} />
                )}
                
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1.5">选择匹配项 (至少一个)</h4>
                    <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1 bg-slate-50">
                         {relevantMatches.length === 0 && <p className="text-xs text-gray-500">没有与当前操作目标类型匹配的可用匹配项。</p>}
                        {relevantMatches.map(match => (
                            <Checkbox key={match.id} label={`${match.name} (${match.targetType === '文件夹' ? match.folderMatchType : match.fileMatchType})`} checked={selectedMatchIds.includes(match.id)} onChange={() => toggleMatchSelection(match.id)} />
                        ))}
                    </div>
                </div>
            </div>
             <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
                <Button variant="secondary" onClick={onClose}>取消</Button>
                <Button onClick={handleSubmit}>{initialOperation ? "保存更改" : "创建操作"}</Button>
            </div>
        </Modal>
    );
};

interface ReplaceOperationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReplace: (newOperationId: UID) => void;
    currentOperationName: string;
    compatibleOperations: Operation[];
}

const ReplaceOperationModal: React.FC<ReplaceOperationModalProps> = ({ isOpen, onClose, onReplace, currentOperationName, compatibleOperations }) => {
    const [selectedNewOpId, setSelectedNewOpId] = useState<UID | ''>('');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`替换操作 "${currentOperationName}"`} size="md">
            <p className="text-sm text-gray-600 mb-4">请从下方选择一个兼容的新操作来替换当前操作。</p>
            <Select
                label="选择新操作:"
                value={selectedNewOpId}
                onChange={e => setSelectedNewOpId(e.target.value)}
                options={[{ value: '', label: '请选择...' }, ...compatibleOperations.map(op => ({ value: op.id, label: op.name }))]}
                containerClassName="mb-4"
            />
            <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="secondary" onClick={onClose}>取消</Button>
                <Button onClick={() => { if (selectedNewOpId) onReplace(selectedNewOpId); onClose();}} disabled={!selectedNewOpId}>确认替换</Button>
            </div>
        </Modal>
    );
};


const MacroOperationsView: React.FC = () => {
  const { 
    operations, addOperation, updateOperation, deleteOperation, getOperationById,
    macros, addMacro, updateMacro, deleteMacro, copyMacro, getMacroById,
    addOperationToMacro, updateOperationInMacro, removeOperationFromMacro, replaceOperationInMacro, reorderOperationInMacro,
  } = useAppContext();
  
  const [selectedMacroId, setSelectedMacroId] = useState<UID | null>(null);
  const [isCreateOperationModalOpen, setIsCreateOperationModalOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);

  const [editingMacroMeta, setEditingMacroMeta] = useState<{id: UID, name: string, description: string} | null>(null);
  const [operationLibrarySearchTerm, setOperationLibrarySearchTerm] = useState('');
  const [macroListSearchTerm, setMacroListSearchTerm] = useState('');

  const [isReplaceOpModalOpen, setIsReplaceOpModalOpen] = useState(false);
  const [opInstanceToReplace, setOpInstanceToReplace] = useState<OperationInstance | null>(null);


  const activeMacro = useMemo(() => selectedMacroId ? getMacroById(selectedMacroId) : null, [selectedMacroId, getMacroById]);
  
  const sortedOperationsInLibrary = useMemo(() => 
    operations.filter(op => op.name.toLowerCase().includes(operationLibrarySearchTerm.toLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name)), 
  [operations, operationLibrarySearchTerm]);

  const sortedMacros = useMemo(() => 
    macros.filter(m => m.name.toLowerCase().includes(macroListSearchTerm.toLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name)), 
  [macros, macroListSearchTerm]);


  // Operation Handlers
  const handleSaveOperation = (opData: Omit<Operation, 'id' | 'isDefault'>, originalId?: UID) => {
    if (originalId) {
        const currentOp = getOperationById(originalId);
        if(!currentOp) return;
        updateOperation({ ...opData, id: originalId, isDefault: currentOp.isDefault } as Operation);
    } else {
        addOperation(opData);
    }
    setEditingOperation(null);
  };
  const openEditOperationModal = (op: Operation) => { setIsCreateOperationModalOpen(true); setEditingOperation(op); };
  const handleDeleteOperationFromLibrary = (opId: UID) => {
    const op = getOperationById(opId);
    if(!op) return;
    if (window.confirm(`确定要从操作库中删除操作 "${op.name}" 吗? 这将同时从所有引用它的宏中移除。`)) {
        deleteOperation(opId);
    }
  };

  // Macro Handlers
  const handleCreateMacro = () => {
    const name = `新的宏 ${macros.length + 1}`;
    const newMacro = addMacro({ name, description: '' });
    setSelectedMacroId(newMacro.id);
    setEditingMacroMeta({id: newMacro.id, name: newMacro.name, description: newMacro.description});
  };
  const handleCopyMacro = (macroId: UID) => {
    const newMacro = copyMacro(macroId);
    if (newMacro) setSelectedMacroId(newMacro.id);
  };
  const handleDeleteMacro = (macroId: UID) => {
    const macro = getMacroById(macroId);
    if (!macro) return;
    if (window.confirm(`确定要删除宏 "${macro.name}" 吗?`)) {
        deleteMacro(macroId);
        if (selectedMacroId === macroId) setSelectedMacroId(null);
    }
  };
  const handleUpdateMacroMeta = () => {
     if(editingMacroMeta) {
        const currentMacro = getMacroById(editingMacroMeta.id);
        if (currentMacro && (currentMacro.name !== editingMacroMeta.name || currentMacro.description !== editingMacroMeta.description)) {
           updateMacro({...currentMacro, name: editingMacroMeta.name, description: editingMacroMeta.description });
        }
        setEditingMacroMeta(null);
    }
  };

  // Operation Instance Handlers
  const handleAddOperationToActiveMacro = (opId: UID) => {
    if (activeMacro) {
       if (activeMacro.operations.some(oi => oi.operationId === opId)) {
        alert("此操作已存在于宏中。"); return;
      }
      addOperationToMacro(activeMacro.id, opId);
    }
  };
  const openReplaceOpModal = (opInstance: OperationInstance) => {
    setOpInstanceToReplace(opInstance);
    setIsReplaceOpModalOpen(true);
  };
  const handleConfirmReplaceOperation = (newOperationId: UID) => {
    if (activeMacro && opInstanceToReplace) {
      replaceOperationInMacro(activeMacro.id, opInstanceToReplace.id, newOperationId);
    }
    setOpInstanceToReplace(null);
  };
  
  useEffect(() => { 
    setEditingMacroMeta(null);
  }, [selectedMacroId]);


  return (
    <div className="flex h-full p-1">
      {/* Left Panel: Operation Library */}
      <div className="w-1/4 border border-gray-200 p-3 overflow-y-auto bg-white rounded-l-md shadow flex flex-col">
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-700">操作库</h3>
          <Button size="sm" leftIcon={PLUS_ICON} onClick={() => {setEditingOperation(null); setIsCreateOperationModalOpen(true);}}>创建操作</Button>
        </div>
         <Input 
            placeholder="搜索操作库..." 
            value={operationLibrarySearchTerm} 
            onChange={e => setOperationLibrarySearchTerm(e.target.value)} 
            className="mb-3 text-sm flex-shrink-0"
          />
        <ul className="space-y-1.5 flex-grow overflow-y-auto">
            {sortedOperationsInLibrary.map(op => (
                <li key={op.id} className="p-2.5 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-slate-50">
                     <div className="flex justify-between items-start">
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate" title={op.name}>{op.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5" title={op.description}>{op.description || '无描述'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{op.targetType} - {op.targetType === OperationTargetType.MATCHED_FOLDER_CONTENT ? (op as FolderOperation).action : (op as FileOperation).action}</p>
                            {op.isDefault && <span className="text-xs text-green-600">(默认)</span>}
                        </div>
                        <div className="space-x-0.5 flex-shrink-0 ml-1">
                            <Tooltip text="编辑操作"><Button variant="ghost" size="sm" onClick={()=>openEditOperationModal(op)}>{React.cloneElement(PENCIL_ICON, {className:"w-4 h-4"})}</Button></Tooltip>
                            <Tooltip text="删除操作"><Button variant="ghost" size="sm" onClick={()=>handleDeleteOperationFromLibrary(op.id)}>{React.cloneElement(TRASH_ICON, {className:"w-4 h-4 text-red-500"})}</Button></Tooltip>
                        </div>
                    </div>
                    {activeMacro && !activeMacro.operations.some(oi => oi.operationId === op.id) && (
                        <Button size="sm" variant="ghost" className="text-sky-600 hover:text-sky-700 mt-1 text-xs" onClick={() => handleAddOperationToActiveMacro(op.id)}>添加到当前宏</Button>
                    )}
                </li>
            ))}
            {sortedOperationsInLibrary.length === 0 && <p className="text-xs text-gray-400 text-center py-3">操作库为空。</p>}
        </ul>
      </div>

      {/* Middle Panel: Macro List */}
      <div className="w-1/4 border border-gray-200 p-3 overflow-y-auto bg-white shadow mx-1 flex flex-col">
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-700">宏操作列表</h3>
          <Button size="sm" leftIcon={PLUS_ICON} onClick={handleCreateMacro}>创建宏</Button>
        </div>
        <Input 
            placeholder="搜索宏..." 
            value={macroListSearchTerm} 
            onChange={e => setMacroListSearchTerm(e.target.value)} 
            className="mb-3 text-sm flex-shrink-0"
         />
        <ul className="space-y-1.5 flex-grow overflow-y-auto">
          {sortedMacros.map(macro => (
            <li 
              key={macro.id} 
              className={`p-2.5 rounded-md cursor-pointer border ${selectedMacroId === macro.id ? 'bg-sky-100 ring-2 ring-sky-400 border-sky-400' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-slate-50'}`}
              onClick={() => {setSelectedMacroId(macro.id); setEditingMacroMeta({id: macro.id, name: macro.name, description: macro.description });}}
            >
               {editingMacroMeta?.id === macro.id ? (
                    <div className="space-y-1.5">
                        <Input value={editingMacroMeta.name} onChange={e => setEditingMacroMeta({...editingMacroMeta, name: e.target.value})} className="text-sm py-1" autoFocus onBlur={handleUpdateMacroMeta}/>
                        <TextArea value={editingMacroMeta.description} onChange={e => setEditingMacroMeta({...editingMacroMeta, description: e.target.value})} rows={1} className="text-xs py-1" onBlur={handleUpdateMacroMeta}/>
                    </div>
                ) : (
                    <>
                        <span className="font-medium text-sm text-slate-800 block truncate" title={macro.name}>{macro.name}</span>
                        <p className="text-xs text-gray-500 truncate mt-0.5" title={macro.description}>{macro.description || '无描述'}</p>
                    </>
                )}
                <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">操作数量: {macro.operations.length} {macro.isDefault && <span className="text-green-600">(默认)</span>}</p>
                     <div className="space-x-0.5">
                        <Tooltip text="编辑名称/描述"><Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); setEditingMacroMeta({id: macro.id, name: macro.name, description: macro.description }); setSelectedMacroId(macro.id);}}>{React.cloneElement(PENCIL_ICON, {className:"w-3.5 h-3.5"})}</Button></Tooltip>
                        <Tooltip text="复制宏"><Button variant="ghost" size="sm" onClick={(e)=>{e.stopPropagation(); handleCopyMacro(macro.id)}}>{React.cloneElement(COPY_ICON, {className:"w-3.5 h-3.5"})}</Button></Tooltip>
                        <Tooltip text="删除宏"><Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); handleDeleteMacro(macro.id)}}>{React.cloneElement(TRASH_ICON, {className:"w-3.5 h-3.5 text-red-500"})}</Button></Tooltip>
                    </div>
                </div>
            </li>
          ))}
           {sortedMacros.length === 0 && <p className="text-sm text-gray-400 text-center py-4">没有宏操作。</p>}
        </ul>
      </div>

      {/* Right Panel: Macro Detail (List of operations in the macro) */}
      <div className="w-1/2 border border-gray-200 p-3 overflow-y-auto bg-white rounded-r-md shadow flex flex-col">
        {activeMacro ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-700 truncate" title={activeMacro.name}>宏: {activeMacro.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3 flex-shrink-0">{activeMacro.description || "无描述"} {activeMacro.isDefault && <span className="text-xs text-green-600">(默认宏，可修改)</span>}</p>
            <p className="text-xs text-gray-500 mb-3 flex-shrink-0">提示：操作按序号（数字越小越先执行）顺序执行。</p>
            
            <ul className="space-y-1.5 flex-grow overflow-y-auto">
              {activeMacro.operations.map((opInstance, index) => {
                const opDetails = operations.find(op => op.id === opInstance.operationId);
                return (
                  <li key={opInstance.id} className="flex items-center justify-between p-2.5 border rounded-md hover:bg-slate-50 bg-white">
                    <div className="flex-grow min-w-0">
                      <Checkbox 
                        checked={opInstance.enabled} 
                        onChange={e => updateOperationInMacro(activeMacro.id, opInstance.id, { enabled: e.target.checked })}
                        containerClassName="inline-flex mr-2 items-baseline"
                      />
                      <span className={`font-medium text-sm ${opInstance.enabled ? 'text-slate-800' : 'text-gray-400 line-through'}`}>
                        {opDetails?.name || '未知操作'}
                      </span>
                      <Input 
                        type="number" 
                        value={opInstance.sequence} 
                        onChange={e => updateOperationInMacro(activeMacro.id, opInstance.id, {sequence: parseInt(e.target.value) || 0})}
                        className="ml-2 inline-block w-16 text-xs py-0.5 px-1"
                        title="序号 (数字越小越先执行)"
                      />
                       <p className="text-xs text-gray-500 truncate mt-0.5 pl-6" title={opDetails?.description}>{opDetails?.description}</p>
                    </div>
                    <div className="space-x-0.5 flex-shrink-0 ml-1">
                      <Tooltip text="替换操作"><Button variant="ghost" size="sm" onClick={() => openReplaceOpModal(opInstance)}>{React.cloneElement(PENCIL_ICON, {className:"w-4 h-4 text-blue-500"})}</Button></Tooltip>
                      <Tooltip text="上移"><Button variant="ghost" size="sm" onClick={() => reorderOperationInMacro(activeMacro.id, opInstance.id, 'up')} disabled={index === 0 || opInstance.sequence === activeMacro.operations[0].sequence }>{React.cloneElement(ARROW_UP_ICON, {className:"w-4 h-4"})}</Button></Tooltip>
                      <Tooltip text="下移"><Button variant="ghost" size="sm" onClick={() => reorderOperationInMacro(activeMacro.id, opInstance.id, 'down')} disabled={index === activeMacro.operations.length -1 || opInstance.sequence === activeMacro.operations[activeMacro.operations.length - 1].sequence }>{React.cloneElement(ARROW_DOWN_ICON, {className:"w-4 h-4"})}</Button></Tooltip>
                      <Tooltip text="从宏移除"><Button variant="ghost" size="sm" onClick={() => removeOperationFromMacro(activeMacro.id, opInstance.id)}>{React.cloneElement(TRASH_ICON, {className:"w-4 h-4 text-red-500"})}</Button></Tooltip>
                    </div>
                  </li>
                );
              })}
              {activeMacro.operations.length === 0 && <p className="text-sm text-gray-400 text-center py-4">此宏操作为空。请从左侧操作库中添加操作。</p>}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {React.cloneElement(EYE_ICON, {className:"w-16 h-16 text-slate-300 mb-4"})}
            <p className="text-slate-500">从中间面板选择一个宏以查看其包含的操作，</p>
            <p className="text-slate-500">或创建一个新的宏来组合您的自动化操作。</p>
          </div>
        )}
      </div>
      {isCreateOperationModalOpen && 
        <CreateOperationModal 
            isOpen={isCreateOperationModalOpen} 
            onClose={() => { setIsCreateOperationModalOpen(false); setEditingOperation(null); }} 
            onSave={handleSaveOperation}
            initialOperation={editingOperation}
        />
      }
      {isReplaceOpModalOpen && opInstanceToReplace && activeMacro &&
        <ReplaceOperationModal
            isOpen={isReplaceOpModalOpen}
            onClose={() => { setIsReplaceOpModalOpen(false); setOpInstanceToReplace(null);}}
            onReplace={handleConfirmReplaceOperation}
            currentOperationName={getOperationById(opInstanceToReplace.operationId)?.name || '未知操作'}
            compatibleOperations={sortedOperationsInLibrary.filter(op => op.id !== opInstanceToReplace!.operationId)}
        />
      }
    </div>
  );
};

export default MacroOperationsView;
