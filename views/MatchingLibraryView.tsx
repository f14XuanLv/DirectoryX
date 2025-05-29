
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import { useAppContext } from '../contexts/AppContext';
import { UID, Match, MatchTargetType, FolderMatchType, FileMatchType, MatchConditionItem, FolderMatch, FileMatch, FileSystemNode, Rule, Operation } from '../types';
import { PLUS_ICON, TRASH_ICON, PENCIL_ICON, EYE_ICON, COPY_ICON, QUESTION_MARK_ICON, X_MARK_ICON } from '../constants';
import QueryInput from '../components/common/QueryInput';
import Tooltip from '../components/common/Tooltip';

interface CreateMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (matchData: Omit<Match, 'id' | 'isDefault'>, originalId?: UID) => void;
    initialMatch?: Match | null; 
}

const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ isOpen, onClose, onSave, initialMatch }) => {
    const { matches: existingMatches } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [targetType, setTargetType] = useState<MatchTargetType>(MatchTargetType.FILE);
    const [folderMatchType, setFolderMatchType] = useState<FolderMatchType | ''>('');
    const [fileMatchType, setFileMatchType] = useState<FileMatchType | ''>('');
    const [conditions, setConditions] = useState<MatchConditionItem[]>([]);
    const [newConditionValue, setNewConditionValue] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    const [showBulkAdd, setShowBulkAdd] = useState(false);
    const [bulkConditions, setBulkConditions] = useState('');


    useEffect(() => {
        if (isOpen) {
            if (initialMatch) {
                setName(initialMatch.name);
                setDescription(initialMatch.description);
                setTargetType(initialMatch.targetType);
                setConditions(initialMatch.conditions.map(c => ({...c}))); 
                if (initialMatch.targetType === MatchTargetType.FOLDER) {
                    setFolderMatchType((initialMatch as FolderMatch).folderMatchType || '');
                    setFileMatchType('');
                } else {
                    setFileMatchType((initialMatch as FileMatch).fileMatchType || '');
                    setFolderMatchType('');
                }
            } else { 
                setName(''); setDescription(''); setTargetType(MatchTargetType.FILE);
                setFolderMatchType(FileMatchType.NAME as unknown as FolderMatchType); 
                setFileMatchType(FileMatchType.NAME); 
                setConditions([{id: `cond-${Date.now()}`, value: ''}]);
            }
            setNameError(null);
            setShowBulkAdd(false);
            setBulkConditions('');
        }
    }, [initialMatch, isOpen]);

    const handleAddCondition = () => {
        if (newConditionValue.trim()) {
            setConditions([...conditions, { id: `cond-${Date.now()}-${Math.random()}`, value: newConditionValue.trim() }]);
            setNewConditionValue('');
        } else if (conditions.length === 0 || conditions[conditions.length -1].value.trim() !== '') {
             setConditions([...conditions, { id: `cond-${Date.now()}-${Math.random()}`, value: '' }]);
        }
    };

    const handleAddBulkConditions = () => {
        const newBulk = bulkConditions.split(',')
            .map(c => c.trim())
            .filter(c => c !== "")
            .map(c_val => ({ id: `cond-${Date.now()}-${Math.random()}-${c_val}`, value: c_val }));
        if (newBulk.length > 0) {
            setConditions(prev => [...prev.filter(pc => pc.value.trim() !== ''), ...newBulk]); // Keep existing non-empty, add new
        }
        setBulkConditions('');
        setShowBulkAdd(false);
    };

    const handleRemoveCondition = (id: UID) => setConditions(conditions.filter(c => c.id !== id));
    const handleUpdateCondition = (id: UID, value: string) => setConditions(conditions.map(c => c.id === id ? {...c, value} : c));

    const convertConditionsToName = () => {
        if (conditions.length > 0) {
            const nameFromConditions = conditions.map(c => c.value).filter(Boolean).join('_').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50);
            if (nameFromConditions) setName(nameFromConditions);
        }
    };

    const validateName = (currentName: string): boolean => {
        if (!currentName.trim()) { setNameError("匹配名称不能为空"); return false; }
        const isDuplicate = existingMatches.some(
            (m) => m.name.toLowerCase() === currentName.toLowerCase() && m.id !== initialMatch?.id
        );
        if (isDuplicate) { setNameError("匹配名称已存在"); return false; }
        setNameError(null);
        return true;
    };
    
    useEffect(() => { if(name) validateName(name); }, [name, initialMatch, existingMatches]);


    const handleSubmit = () => {
        if (!validateName(name)) return;
        if (targetType === MatchTargetType.FOLDER && !folderMatchType) { alert("请选择文件夹匹配类型"); return; }
        if (targetType === MatchTargetType.FILE && !fileMatchType) { alert("请选择文件匹配类型"); return; }
        
        const finalConditions = conditions.filter(c => c.value.trim() !== '');
        if (finalConditions.length === 0) { alert("至少需要一个有效的匹配条件"); return; }

        let matchPayload: Omit<Match, 'id' | 'isDefault'>;

        const commonData = { name, description, targetType, conditions: finalConditions };

        if (targetType === MatchTargetType.FOLDER) {
            matchPayload = { ...commonData, targetType: MatchTargetType.FOLDER, folderMatchType: folderMatchType as FolderMatchType };
        } else { 
            matchPayload = { ...commonData, targetType: MatchTargetType.FILE, fileMatchType: fileMatchType as FileMatchType };
        }
        onSave(matchPayload, initialMatch?.id);
        onClose();
    };
    
    const targetTypeOptions = Object.values(MatchTargetType).map(t => ({value: t, label: t}));
    const folderMatchTypeOptions = Object.values(FolderMatchType).map(t => ({value: t, label: t}));
    const fileMatchTypeOptions = Object.values(FileMatchType).map(t => ({value: t, label: t}));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialMatch ? "修改匹配" : "创建新匹配"} size="lg">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Input label="匹配名称" value={name} onChange={e => setName(e.target.value)} required error={nameError}/>
                <TextArea label="描述" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                <Select label="匹配目标类型" value={targetType} onChange={e => { setTargetType(e.target.value as MatchTargetType); setFileMatchType(FileMatchType.NAME); setFolderMatchType(FolderMatchType.NAME);}} options={targetTypeOptions} />
                {targetType === MatchTargetType.FOLDER && (
                    <Select label="文件夹匹配类型" value={folderMatchType} onChange={e => setFolderMatchType(e.target.value as FolderMatchType)} options={[{value:'', label:'选择类型'}, ...folderMatchTypeOptions]} required/>
                )}
                {targetType === MatchTargetType.FILE && (
                    <Select label="文件匹配类型" value={fileMatchType} onChange={e => setFileMatchType(e.target.value as FileMatchType)} options={[{value:'', label:'选择类型'}, ...fileMatchTypeOptions]} required/>
                )}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-medium text-gray-700">匹配条件 (OR 逻辑)</h4>
                        <Button variant="ghost" size="sm" onClick={convertConditionsToName}>由条件生成名称</Button>
                    </div>
                    {conditions.map((cond, index) => (
                        <div key={cond.id} className="flex items-center space-x-2 mb-1.5">
                            <span className="text-sm text-gray-500 w-6 text-right">{index + 1}.</span>
                            <Input value={cond.value} onChange={e => handleUpdateCondition(cond.id, e.target.value)} className="flex-grow text-sm py-1" placeholder="输入条件值 (例如: *.ts, node_modules, /\\d+/ )"/>
                            <Tooltip text="移除此条件"><Button variant="danger" size="sm" onClick={() => handleRemoveCondition(cond.id)}>{React.cloneElement(TRASH_ICON, {className: "w-4 h-4"})}</Button></Tooltip>
                        </div>
                    ))}
                    <div className="flex items-center space-x-2 mt-2 pl-8">
                        <Input value={newConditionValue} onChange={e => setNewConditionValue(e.target.value)} placeholder="输入新条件值并按Enter或点击按钮" className="flex-grow text-sm py-1" onKeyDown={(e) => {if(e.key === 'Enter') { handleAddCondition(); e.preventDefault();}}}/>
                        <Button size="sm" onClick={handleAddCondition} disabled={!newConditionValue.trim()} leftIcon={PLUS_ICON}>添加</Button>
                    </div>
                     <div className="flex items-center space-x-2 mt-1 pl-8">
                        <Button size="sm" onClick={handleAddCondition} variant="ghost" className="text-sky-600 hover:text-sky-700">添加空条件行</Button>
                        <Button size="sm" onClick={() => setShowBulkAdd(s => !s)} variant="ghost" className="text-sky-600 hover:text-sky-700">
                            {showBulkAdd ? '取消批量添加' : '批量添加条件'}
                        </Button>
                     </div>
                      {showBulkAdd && (
                        <div className="mt-2 pl-8 space-y-2">
                            <TextArea 
                                value={bulkConditions}
                                onChange={e => setBulkConditions(e.target.value)}
                                placeholder="输入多个条件，用英文逗号 (,) 分隔"
                                rows={3}
                                className="text-sm"
                            />
                            <Button size="sm" onClick={handleAddBulkConditions} disabled={!bulkConditions.trim()}>确认批量添加</Button>
                        </div>
                    )}
                </div>
            </div>
             <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
                <Button variant="secondary" onClick={onClose}>取消</Button>
                <Button onClick={handleSubmit}>{initialMatch ? "保存更改" : "创建匹配"}</Button>
            </div>
        </Modal>
    );
};


const MatchingLibraryView: React.FC = () => {
  const { matches, addMatch, updateMatch, deleteMatch, getMatchById, rules, operations, checkNodeAgainstMatchConditions } = useAppContext();
  const [selectedMatchId, setSelectedMatchId] = useState<UID | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [matchTestInput, setMatchTestInput] = useState('');
  const [matchTestResult, setMatchTestResult] = useState<boolean | null>(null);
  const [matchTestNodeType, setMatchTestNodeType] = useState<'file' | 'directory'>('file');


  const selectedMatch = useMemo(() => selectedMatchId ? getMatchById(selectedMatchId) : null, [selectedMatchId, getMatchById]);

  const handleSaveMatch = (matchData: Omit<Match, 'id'|'isDefault'>, originalId?: UID) => {
    if (originalId) { 
        const currentMatch = getMatchById(originalId);
        if (!currentMatch) return; 
        let updatedMatch: Match;
        const commonData = { id: originalId, name: matchData.name, description: matchData.description, conditions: matchData.conditions, isDefault: currentMatch.isDefault };
        if (matchData.targetType === MatchTargetType.FOLDER) {
            updatedMatch = { ...commonData, targetType: MatchTargetType.FOLDER, folderMatchType: (matchData as Omit<FolderMatch, 'id'>).folderMatchType };
        } else { 
            updatedMatch = { ...commonData, targetType: MatchTargetType.FILE, fileMatchType: (matchData as Omit<FileMatch, 'id'>).fileMatchType };
        }
        updateMatch(updatedMatch);
        setSelectedMatchId(updatedMatch.id); 
    } else { 
        const newMatch = addMatch(matchData);
        setSelectedMatchId(newMatch.id);
    }
    setEditingMatch(null);
  };

  const openEditModal = (match: Match) => {
    setEditingMatch(match);
    setIsCreateModalOpen(true);
  };
  
  const handleDeleteMatch = (matchId: UID) => {
    const match = getMatchById(matchId);
    if (!match) return;
    const refs = getReferences(matchId);
    let confirmMessage = `确定要删除匹配 "${match.name}" 吗?`;
    if (refs.total > 0) {
        confirmMessage += `\n\n此匹配被以下规则或操作引用 (删除后引用会失效):`;
        if(refs.ruleRefs.length > 0) confirmMessage += `\n规则: ${refs.ruleRefs.map(r => r.name).join(', ')}`;
        if(refs.opRefs.length > 0) confirmMessage += `\n操作: ${refs.opRefs.map(op => op.name).join(', ')}`;
    }

    if (window.confirm(confirmMessage)) {
        deleteMatch(matchId);
        if (selectedMatchId === matchId) setSelectedMatchId(null);
    }
  };

  const handleCopyMatch = (matchId: UID) => {
    const matchToCopy = getMatchById(matchId);
    if (!matchToCopy) return;
    const newName = `${matchToCopy.name}_复制`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, isDefault, ...restOfMatch } = matchToCopy;
    addMatch({ ...restOfMatch, name: newName, description: `${matchToCopy.description} (复制)`});
  };


  const filteredMatches = matches.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.conditions.some(c => c.value.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => a.name.localeCompare(b.name));

  const getReferences = (matchId: UID) => {
    const ruleRefs: Rule[] = rules.filter(r => r.matchIds.includes(matchId));
    const opRefs: Operation[] = operations.filter(op => op.matchIds.includes(matchId));
    return { ruleRefs, opRefs, total: ruleRefs.length + opRefs.length };
  };

  useEffect(() => { 
    setMatchTestInput('');
    setMatchTestResult(null);
    if (selectedMatch) {
        setMatchTestNodeType(selectedMatch.targetType === MatchTargetType.FOLDER ? 'directory' : 'file');
    }
  }, [selectedMatchId, selectedMatch]);

  const runMatchTest = () => {
    if (!selectedMatch || !matchTestInput.trim()) {
        setMatchTestResult(null);
        return;
    }
    const mockNode: FileSystemNode = {
        id: 'test-node',
        name: matchTestInput.trim(),
        path: `/${matchTestInput.trim()}`,
        parentId: null,
        type: selectedMatch.targetType === MatchTargetType.FOLDER ? 'directory' : 'file',
        children: selectedMatch.targetType === MatchTargetType.FOLDER ? [] : undefined,
    };
    setMatchTestResult(checkNodeAgainstMatchConditions(mockNode, selectedMatch));
  };


  return (
    <div className="flex h-full p-1">
      {/* Left Panel: Match List */}
      <div className="w-1/3 border-r border-gray-200 p-3 overflow-y-auto bg-white rounded-l-md shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-slate-700">匹配库</h2>
          <Button onClick={() => { setEditingMatch(null); setIsCreateModalOpen(true);}} leftIcon={PLUS_ICON} size="sm">创建匹配</Button>
        </div>
        <Input placeholder="搜索名称,描述,条件..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-3 text-sm"/>
        
        <ul className="space-y-1">
          {filteredMatches.map(match => (
            <li 
              key={match.id} 
              className={`p-2.5 rounded-md cursor-pointer hover:bg-slate-100 border ${selectedMatchId === match.id ? 'bg-sky-100 ring-2 ring-sky-400 border-sky-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              onClick={() => setSelectedMatchId(match.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedMatchId(match.id)}}
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow min-w-0">
                    <span className="font-medium text-sm text-slate-800 truncate block" title={match.name}>{match.name}</span>
                    <p className="text-xs text-gray-500 truncate mt-0.5" title={match.description}>{match.description || '无描述'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{match.targetType} - {match.targetType === MatchTargetType.FOLDER ? (match as FolderMatch).folderMatchType : (match as FileMatch).fileMatchType}</p>
                </div>
                <div className="space-x-1 flex-shrink-0 ml-2">
                    <Tooltip text="修改"><Button variant="ghost" size="sm" onClick={(e)=>{e.stopPropagation(); openEditModal(match)}}>{React.cloneElement(PENCIL_ICON, {className:"w-4 h-4"})}</Button></Tooltip>
                    <Tooltip text="复制"><Button variant="ghost" size="sm" onClick={(e)=>{e.stopPropagation(); handleCopyMatch(match.id)}}>{React.cloneElement(COPY_ICON, {className:"w-4 h-4"})}</Button></Tooltip>
                    <Tooltip text="删除"><Button variant="ghost" size="sm" onClick={(e)=>{e.stopPropagation(); handleDeleteMatch(match.id)}}>{React.cloneElement(TRASH_ICON, {className:"w-4 h-4 text-red-500"})}</Button></Tooltip>
                </div>
              </div>
            </li>
          ))}
          {filteredMatches.length === 0 && <p className="text-sm text-gray-400 text-center py-4">没有找到匹配项。</p>}
        </ul>
      </div>

      {/* Right Panel: Match Detail */}
      <div className="w-2/3 p-4 overflow-y-auto bg-white rounded-r-md shadow">
        {selectedMatch ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-1">{selectedMatch.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{selectedMatch.description || '无描述'}</p>
              <div className="flex space-x-2 mb-4">
                <span className="px-2.5 py-1 text-xs font-medium bg-sky-100 text-sky-700 rounded-full">{selectedMatch.targetType}</span>
                <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                    {selectedMatch.targetType === MatchTargetType.FOLDER ? (selectedMatch as FolderMatch).folderMatchType : (selectedMatch as FileMatch).fileMatchType}
                </span>
                 {selectedMatch.isDefault && <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">默认项</span>}
              </div>
            </div>
            
            <div>
                <h4 className="text-md font-semibold text-slate-700 mb-2">匹配条件 (OR 逻辑)</h4>
                {selectedMatch.conditions.length > 0 ? (
                    <ul className="list-disc list-inside pl-1 space-y-1.5">
                        {selectedMatch.conditions.map(cond => <li key={cond.id} className="text-sm text-gray-700 bg-slate-50 p-1.5 rounded-md border border-slate-200">{cond.value}</li>)}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">无匹配条件。</p>
                )}
            </div>

            <div>
                <h4 className="text-md font-semibold text-slate-700 mb-2 flex items-center">
                    匹配测试
                    <Tooltip 
                        text={`输入${selectedMatch.targetType === MatchTargetType.FOLDER ? '文件夹' : '文件'}名称测试。匹配类型: ${selectedMatch.targetType}。匹配方式: ${selectedMatch.targetType === MatchTargetType.FOLDER ? (selectedMatch as FolderMatch).folderMatchType : (selectedMatch as FileMatch).fileMatchType}.`}
                        position="right"
                    >
                       <span className="ml-1.5 cursor-default">{React.cloneElement(QUESTION_MARK_ICON, {className:"w-4 h-4"})}</span>
                    </Tooltip>
                </h4>
                <div className="flex items-center space-x-2">
                    <Input 
                        placeholder={`输入 ${selectedMatch.targetType === MatchTargetType.FOLDER ? '文件夹' : '文件'} 名称进行测试...`} 
                        value={matchTestInput}
                        onChange={e => { setMatchTestInput(e.target.value); setMatchTestResult(null);}} 
                        className="text-sm flex-grow"
                        onKeyDown={(e) => { if(e.key === 'Enter') runMatchTest();}}
                    />
                    <Button onClick={runMatchTest} size="sm">测试</Button>
                </div>
                {matchTestResult !== null && (
                    <p className={`text-sm mt-1.5 px-2 py-1 rounded-md ${matchTestResult ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                       测试结果: <span className="font-semibold">{matchTestResult ? '匹配成功' : '匹配失败'}</span>
                    </p>
                )}
            </div>

            <div>
                <h4 className="text-md font-semibold text-slate-700 mb-2">被引用情况</h4>
                {(() => {
                    const refs = getReferences(selectedMatch.id);
                    if (refs.total === 0) return <p className="text-sm text-gray-500">未被任何规则或操作引用。</p>;
                    
                    const renderRefList = (items: (Rule | Operation)[], typeLabel: string) => (
                        items.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-600">{typeLabel} ({items.length}):</p>
                                <ul className="list-disc list-inside pl-4 text-xs">
                                    {items.map(item => (
                                        <li key={item.id} className="text-gray-500 hover:text-gray-700">
                                            <Tooltip text={item.description || '无描述'} position="right">
                                                <span className="cursor-default">{item.name}</span>
                                            </Tooltip>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    );

                    return (
                        <div className="text-sm space-y-2">
                           <p className="font-medium text-gray-700">总引用数: {refs.total}</p>
                           {renderRefList(refs.ruleRefs, '规则')}
                           {renderRefList(refs.opRefs, '操作')}
                        </div>
                    );
                })()}
            </div>
            <div className="mt-6 pt-4 border-t">
                 <Button onClick={() => openEditModal(selectedMatch)} leftIcon={PENCIL_ICON} variant="secondary">编辑此匹配项</Button>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {React.cloneElement(EYE_ICON, {className:"w-16 h-16 text-slate-300 mb-4"})}
            <p className="text-slate-500">从左侧选择一个匹配项以查看其详细信息，</p>
            <p className="text-slate-500">或创建一个新的匹配规则来定义您的文件/文件夹选择逻辑。</p>
          </div>
        )}
      </div>

      {isCreateModalOpen && 
        <CreateMatchModal 
            isOpen={isCreateModalOpen} 
            onClose={() => { setIsCreateModalOpen(false); setEditingMatch(null); }} 
            onSave={handleSaveMatch}
            initialMatch={editingMatch}
        />
      }
    </div>
  );
};

export default MatchingLibraryView;
