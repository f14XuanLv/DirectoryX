
import React, { useState, useMemo, useEffect } from 'react';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Modal from '../components/common/Modal';
import Checkbox from '../components/common/Checkbox';
import { useAppContext } from '../contexts/AppContext';
import { UID, RuleType, Ruleset, Rule, RuleInstance, Match, ImportRuleActionType, CompressionRuleOptions, CompressionRuleTypeOption, LineLimitRuleTypeOption, LineLimitParams, ImportRule, CompressionRule, LineLimitRule } from '../types';
import { PLUS_ICON, PENCIL_ICON, TRASH_ICON, ARROW_UP_ICON, ARROW_DOWN_ICON, EYE_ICON, COPY_ICON, X_MARK_ICON } from '../constants';
import Tooltip from '../components/common/Tooltip';
import QueryInput from '../components/common/QueryInput';


interface CreateRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (ruleData: Omit<Rule, 'id' | 'isDefault'>, originalId?: UID) => void;
    initialRule?: Rule | null;
    ruleTypeContext: RuleType; 
}

const CreateRuleModal: React.FC<CreateRuleModalProps> = ({ isOpen, onClose, onSave, initialRule, ruleTypeContext }) => {
    const { matches: allMatches, rules: existingRules } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMatchIds, setSelectedMatchIds] = useState<UID[]>([]);
    const [nameError, setNameError] = useState<string | null>(null);

    const [importActionType, setImportActionType] = useState<ImportRuleActionType | ''>('');
    const [compressionOptions, setCompressionOptions] = useState<CompressionRuleOptions>({});
    const [lineLimitType, setLineLimitType] = useState<LineLimitRuleTypeOption | ''>('');
    const [lineLimitParams, setLineLimitParams] = useState<LineLimitParams>({});
    
    const relevantMatches = useMemo(() => {
        if (ruleTypeContext === RuleType.IMPORT) return allMatches;
        return allMatches.filter(m => m.targetType === '文件');
    }, [allMatches, ruleTypeContext]);

    useEffect(() => {
        if (isOpen) {
            if (initialRule) {
                setName(initialRule.name);
                setDescription(initialRule.description);
                setSelectedMatchIds([...initialRule.matchIds]);
                if (initialRule.ruleType === RuleType.IMPORT) setImportActionType((initialRule as ImportRule).actionType);
                if (initialRule.ruleType === RuleType.COMPRESSION) setCompressionOptions({removeEmptyLines: (initialRule as CompressionRule).removeEmptyLines, removeComments: (initialRule as CompressionRule).removeComments, minify: (initialRule as CompressionRule).minify});
                if (initialRule.ruleType === RuleType.LINE_LIMIT) { setLineLimitType((initialRule as LineLimitRule).limitType); setLineLimitParams({... (initialRule as LineLimitRule).params});}
            } else {
                setName(''); setDescription(''); setSelectedMatchIds([]);
                setImportActionType(''); setCompressionOptions({}); setLineLimitType(''); setLineLimitParams({});
            }
            setNameError(null);
        }
    }, [initialRule, isOpen]);

    const validateName = (currentName: string): boolean => {
        if (!currentName.trim()) { setNameError("规则名称不能为空"); return false; }
        const isDuplicate = existingRules.some(r => r.name.toLowerCase() === currentName.toLowerCase() && r.id !== initialRule?.id);
        if (isDuplicate) { setNameError("规则名称已存在"); return false; }
        setNameError(null);
        return true;
    };
    useEffect(() => { if(name) validateName(name);}, [name, initialRule, existingRules]);

    const handleSubmit = () => {
        if(!validateName(name)) return;
        if(selectedMatchIds.length === 0) { alert("至少选择一个匹配项"); return; }

        let rulePayloadBase = { name, description, ruleType: ruleTypeContext, matchIds: selectedMatchIds };
        let finalRuleData: Omit<Rule, 'id' | 'isDefault'>;
        let specificPayload: any = {};


        switch(ruleTypeContext) {
            case RuleType.IMPORT:
                if (!importActionType) { alert("请选择导入操作类型"); return; }
                specificPayload = { actionType: importActionType as ImportRuleActionType };
                finalRuleData = { ...rulePayloadBase, ruleType: RuleType.IMPORT, ...specificPayload };
                break;
            case RuleType.COMPRESSION:
                if (!compressionOptions.removeEmptyLines && !compressionOptions.removeComments && !compressionOptions.minify) { alert("至少选择一个压缩选项"); return; }
                specificPayload = { ...compressionOptions };
                finalRuleData = { ...rulePayloadBase, ruleType: RuleType.COMPRESSION, ...specificPayload };
                break;
            case RuleType.LINE_LIMIT:
                if (!lineLimitType) { alert("请选择行数限制类型"); return; }
                specificPayload = { limitType: lineLimitType as LineLimitRuleTypeOption, params: lineLimitParams };
                finalRuleData = { ...rulePayloadBase, ruleType: RuleType.LINE_LIMIT, ...specificPayload };
                break;
            default:
                alert("未知的规则类型"); return;
        }
        onSave(finalRuleData, initialRule?.id);
        onClose();
    };

    const toggleMatchSelection = (matchId: UID) => {
        setSelectedMatchIds(prev => prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]);
    };
    
    const importActionOptions = Object.values(ImportRuleActionType).map(val => ({ value: val, label: val }));
    const compressionRuleOptionsList = Object.values(CompressionRuleTypeOption).map(val => ({ value: val, label: val}));
    const lineLimitTypeOptions = Object.values(LineLimitRuleTypeOption).map(val => ({ value: val, label: val }));


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialRule ? "修改规则" : `创建新的${ruleTypeContext}规则`} size="xl">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Input label="规则名称" value={name} onChange={e => setName(e.target.value)} required error={nameError} />
                <TextArea label="描述" value={description} onChange={e => setDescription(e.target.value)} rows={2} />

                {ruleTypeContext === RuleType.IMPORT && (
                    <Select label="导入操作类型" value={importActionType} onChange={e => setImportActionType(e.target.value as ImportRuleActionType)} options={[{value: '', label: '选择操作类型'}, ...importActionOptions]} />
                )}
                {ruleTypeContext === RuleType.COMPRESSION && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">压缩选项</h4>
                        {compressionRuleOptionsList.map(opt => {
                             const key = opt.value as CompressionRuleTypeOption; 
                             let currentOptionKey: keyof CompressionRuleOptions | undefined;
                             if (key === CompressionRuleTypeOption.REMOVE_EMPTY_LINES) currentOptionKey = 'removeEmptyLines';
                             else if (key === CompressionRuleTypeOption.REMOVE_COMMENTS) currentOptionKey = 'removeComments';
                             else if (key === CompressionRuleTypeOption.MINIFY) currentOptionKey = 'minify';

                            return currentOptionKey ? (<Checkbox key={opt.value} label={opt.label} checked={!!compressionOptions[currentOptionKey]} onChange={e => setCompressionOptions(prev => ({...prev, [currentOptionKey!]: e.target.checked}))} containerClassName="mb-1.5"/>) : null;
                        })}
                    </div>
                )}
                {ruleTypeContext === RuleType.LINE_LIMIT && (
                    <div className="space-y-3">
                        <Select label="行数限制类型" value={lineLimitType} onChange={e => setLineLimitType(e.target.value as LineLimitRuleTypeOption)} options={[{value: '', label: '选择限制类型'}, ...lineLimitTypeOptions]} />
                        {lineLimitType === LineLimitRuleTypeOption.HEAD_N && <Input type="number" label="N (头部行数)" value={lineLimitParams.n || ''} onChange={e => setLineLimitParams({...lineLimitParams, n: parseInt(e.target.value) || 0})} />}
                        {lineLimitType === LineLimitRuleTypeOption.TAIL_N && <Input type="number" label="N (尾部行数)" value={lineLimitParams.n || ''} onChange={e => setLineLimitParams({...lineLimitParams, n: parseInt(e.target.value) || 0})} />}
                        {lineLimitType === LineLimitRuleTypeOption.HEAD_M_TAIL_N && (<div className="grid grid-cols-2 gap-x-4"><Input type="number" label="M (头部行数)" value={lineLimitParams.m || ''} onChange={e => setLineLimitParams({...lineLimitParams, m: parseInt(e.target.value) || 0})} /><Input type="number" label="N (尾部行数)" value={lineLimitParams.n || ''} onChange={e => setLineLimitParams({...lineLimitParams, n: parseInt(e.target.value) || 0})} /></div>)}
                        {lineLimitType === LineLimitRuleTypeOption.CUSTOM_RANGE && (<div className="grid grid-cols-2 gap-x-4"><Input type="number" label="起始行 (从1开始)" value={lineLimitParams.start || ''} onChange={e => setLineLimitParams({...lineLimitParams, start: parseInt(e.target.value) || 1})} /><Input type="number" label="结束行" value={lineLimitParams.end || ''} onChange={e => setLineLimitParams({...lineLimitParams, end: parseInt(e.target.value) || undefined})} /></div>)}
                        {lineLimitType === LineLimitRuleTypeOption.RANDOM_N && <Input type="number" label="N (随机行数)" value={lineLimitParams.n || ''} onChange={e => setLineLimitParams({...lineLimitParams, n: parseInt(e.target.value) || 0})} />}
                        {lineLimitType === LineLimitRuleTypeOption.RANDOM_PERCENT && <Input type="number" label="百分比 (%)" value={lineLimitParams.percent || ''} onChange={e => setLineLimitParams({...lineLimitParams, percent: parseInt(e.target.value) || 0})} min="0" max="100" />}
                    </div>
                )}

                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1.5">选择匹配项 (至少一个)</h4>
                    <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1 bg-slate-50">
                        {relevantMatches.length === 0 && <p className="text-xs text-gray-500">没有可用的匹配项。请先在匹配库中创建。</p>}
                        {relevantMatches.map(match => (
                            <Checkbox key={match.id} label={`${match.name} (${match.targetType} - ${match.targetType === '文件夹' ? match.folderMatchType : match.fileMatchType})`} checked={selectedMatchIds.includes(match.id)} onChange={() => toggleMatchSelection(match.id)} />
                        ))}
                    </div>
                </div>
            </div>
             <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
                <Button variant="secondary" onClick={onClose}>取消</Button>
                <Button onClick={handleSubmit}>{initialRule ? "保存更改" : "创建规则"}</Button>
            </div>
        </Modal>
    );
};

interface ReplaceRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReplace: (newRuleId: UID) => void;
    currentRuleName: string;
    compatibleRules: Rule[];
}

const ReplaceRuleModal: React.FC<ReplaceRuleModalProps> = ({ isOpen, onClose, onReplace, currentRuleName, compatibleRules }) => {
    const [selectedNewRuleId, setSelectedNewRuleId] = useState<UID | ''>('');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`替换规则 "${currentRuleName}"`} size="md">
            <p className="text-sm text-gray-600 mb-4">请从下方选择一个兼容的新规则来替换当前规则。</p>
            <Select
                label="选择新规则:"
                value={selectedNewRuleId}
                onChange={e => setSelectedNewRuleId(e.target.value)}
                options={[{ value: '', label: '请选择...' }, ...compatibleRules.map(r => ({ value: r.id, label: r.name }))]}
                containerClassName="mb-4"
            />
            <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="secondary" onClick={onClose}>取消</Button>
                <Button onClick={() => { if (selectedNewRuleId) onReplace(selectedNewRuleId); onClose();}} disabled={!selectedNewRuleId}>确认替换</Button>
            </div>
        </Modal>
    );
};


const RulesetsView: React.FC = () => {
  const { 
    rules, addRule, updateRule, deleteRule, getRuleById,
    rulesets, addRuleset, updateRuleset, deleteRuleset, copyRuleset, getRulesetById,
    addRuleToRuleset, updateRuleInRuleset, removeRuleFromRuleset, replaceRuleInRuleset, reorderRuleInRuleset,
  } = useAppContext();
  
  const [selectedRulesetType, setSelectedRulesetType] = useState<RuleType>(RuleType.IMPORT);
  const [selectedRulesetId, setSelectedRulesetId] = useState<UID | null>(null);
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  
  const [editingRulesetMeta, setEditingRulesetMeta] = useState<{id: UID, name: string, description: string} | null>(null);
  const [ruleLibrarySearchTerm, setRuleLibrarySearchTerm] = useState('');
  const [rulesetListSearchTerm, setRulesetListSearchTerm] = useState('');

  const [isReplaceRuleModalOpen, setIsReplaceRuleModalOpen] = useState(false);
  const [ruleInstanceToReplace, setRuleInstanceToReplace] = useState<RuleInstance | null>(null);

  const filteredRulesets = useMemo(() => 
    rulesets.filter(rs => rs.type === selectedRulesetType && rs.name.toLowerCase().includes(rulesetListSearchTerm.toLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name)), 
  [rulesets, selectedRulesetType, rulesetListSearchTerm]);
  
  const activeRuleset = useMemo(() => selectedRulesetId ? getRulesetById(selectedRulesetId) : null, [selectedRulesetId, getRulesetById]);
  
  const rulesInLibrary = useMemo(() => 
    rules.filter(r => r.ruleType === selectedRulesetType && r.name.toLowerCase().includes(ruleLibrarySearchTerm.toLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name)), 
  [rules, selectedRulesetType, ruleLibrarySearchTerm]);

  // Rule Handlers
  const handleSaveRule = (ruleData: Omit<Rule, 'id' | 'isDefault'>, originalId?: UID) => {
    if (originalId) {
        const currentRule = getRuleById(originalId);
        if(!currentRule) return;
        updateRule({ ...ruleData, id: originalId, isDefault: currentRule.isDefault } as Rule); 
    } else {
        addRule(ruleData);
    }
    setEditingRule(null);
  };
  const openEditRuleModal = (rule: Rule) => { setIsCreateRuleModalOpen(true); setEditingRule(rule); };
  const handleDeleteRuleFromLibrary = (ruleId: UID) => { 
    const rule = getRuleById(ruleId);
    if (!rule) return;
    if (window.confirm(`确定要从规则库中删除规则 "${rule.name}" 吗? 这将同时从所有引用它的规则集中移除。`)) {
        deleteRule(ruleId);
    }
  };

  // Ruleset Handlers
  const handleCreateRuleset = () => {
    const name = `新的${selectedRulesetType}规则集 ${filteredRulesets.length + 1}`;
    const newRs = addRuleset({ name, description: '', type: selectedRulesetType });
    setSelectedRulesetId(newRs.id);
    setEditingRulesetMeta({id: newRs.id, name: newRs.name, description: newRs.description});
  };
  const handleCopyRuleset = (rulesetId: UID) => {
    const newRs = copyRuleset(rulesetId);
    if (newRs) setSelectedRulesetId(newRs.id);
  };
  const handleDeleteRuleset = (rulesetId: UID) => {
    const rs = getRulesetById(rulesetId);
    if (!rs) return;
    if (window.confirm(`确定要删除规则集 "${rs.name}" 吗?`)) {
        deleteRuleset(rulesetId);
        if (selectedRulesetId === rulesetId) setSelectedRulesetId(null);
    }
  };
  const handleUpdateRulesetMeta = () => {
    if(editingRulesetMeta) {
        const currentRs = getRulesetById(editingRulesetMeta.id);
        if (currentRs && (currentRs.name !== editingRulesetMeta.name || currentRs.description !== editingRulesetMeta.description)) {
           updateRuleset({...currentRs, name: editingRulesetMeta.name, description: editingRulesetMeta.description });
        }
        setEditingRulesetMeta(null);
    }
  };
  
  // Rule Instance Handlers
  const handleAddRuleToActiveRuleset = (ruleId: UID) => {
    if (activeRuleset) {
      if (activeRuleset.rules.some(ri => ri.ruleId === ruleId)) {
        alert("此规则已存在于规则集中。"); return;
      }
      addRuleToRuleset(activeRuleset.id, ruleId);
    }
  };
  const openReplaceRuleModal = (ruleInstance: RuleInstance) => {
    setRuleInstanceToReplace(ruleInstance);
    setIsReplaceRuleModalOpen(true);
  };
  const handleConfirmReplaceRule = (newRuleId: UID) => {
    if (activeRuleset && ruleInstanceToReplace) {
        replaceRuleInRuleset(activeRuleset.id, ruleInstanceToReplace.id, newRuleId);
    }
    setRuleInstanceToReplace(null);
  };


  const rulesetTypeOptions = Object.values(RuleType).map(rt => ({ value: rt, label: rt }));

  useEffect(() => { 
    setEditingRulesetMeta(null);
  }, [selectedRulesetId]);


  return (
    <div className="flex flex-col h-full p-1">
      <div className="mb-3 p-3 bg-slate-100 rounded-md shadow-sm border border-slate-200">
        <Select
          label="选择规则集类型:"
          value={selectedRulesetType}
          onChange={e => { setSelectedRulesetType(e.target.value as RuleType); setSelectedRulesetId(null); }}
          options={rulesetTypeOptions}
          containerClassName="max-w-xs"
        />
      </div>

      <div className="flex flex-grow space-x-1 overflow-hidden">
        {/* Left Panel: Rule Library */}
        <div className="w-1/4 border border-gray-200 p-3 overflow-y-auto bg-white rounded-md shadow flex flex-col">
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <h3 className="text-lg font-semibold text-slate-700">{selectedRulesetType} 规则库</h3>
            <Button size="sm" leftIcon={PLUS_ICON} onClick={() => { setEditingRule(null); setIsCreateRuleModalOpen(true); }}>创建规则</Button>
          </div>
          <Input 
            placeholder="搜索规则库..." 
            value={ruleLibrarySearchTerm} 
            onChange={e => setRuleLibrarySearchTerm(e.target.value)} 
            className="mb-3 text-sm flex-shrink-0"
          />
          <ul className="space-y-1.5 flex-grow overflow-y-auto">
            {rulesInLibrary.map(rule => (
                <li key={rule.id} className="p-2.5 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-slate-50">
                    <div className="flex justify-between items-start">
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate" title={rule.name}>{rule.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5" title={rule.description}>{rule.description || '无描述'}</p>
                            {rule.isDefault && <span className="text-xs text-green-600">(默认)</span>}
                        </div>
                        <div className="space-x-0.5 flex-shrink-0 ml-1">
                            <Tooltip text="编辑规则"><Button variant="ghost" size="sm" onClick={()=>openEditRuleModal(rule)}>{React.cloneElement(PENCIL_ICON, {className:"w-4 h-4"})}</Button></Tooltip>
                            <Tooltip text="删除规则"><Button variant="ghost" size="sm" onClick={()=>handleDeleteRuleFromLibrary(rule.id)}>{React.cloneElement(TRASH_ICON, {className:"w-4 h-4 text-red-500"})}</Button></Tooltip>
                        </div>
                    </div>
                     {activeRuleset && !activeRuleset.rules.some(ri => ri.ruleId === rule.id) && (
                        <Button size="sm" variant="ghost" className="text-sky-600 hover:text-sky-700 mt-1 text-xs" onClick={() => handleAddRuleToActiveRuleset(rule.id)}>添加到当前规则集</Button>
                    )}
                </li>
            ))}
            {rulesInLibrary.length === 0 && <p className="text-xs text-gray-400 text-center py-3">此类型规则库为空。</p>}
          </ul>
        </div>

        {/* Middle Panel: Ruleset List */}
        <div className="w-1/4 border border-gray-200 p-3 overflow-y-auto bg-white rounded-md shadow flex flex-col">
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <h3 className="text-lg font-semibold text-slate-700">规则集列表</h3>
            <Button size="sm" leftIcon={PLUS_ICON} onClick={handleCreateRuleset}>创建规则集</Button>
          </div>
          <Input 
            placeholder="搜索规则集..." 
            value={rulesetListSearchTerm} 
            onChange={e => setRulesetListSearchTerm(e.target.value)} 
            className="mb-3 text-sm flex-shrink-0"
           />
          <ul className="space-y-1.5 flex-grow overflow-y-auto">
            {filteredRulesets.map(rs => (
              <li 
                key={rs.id} 
                className={`p-2.5 rounded-md cursor-pointer border ${selectedRulesetId === rs.id ? 'bg-sky-100 ring-2 ring-sky-400 border-sky-400' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-slate-50'}`}
                onClick={() => {setSelectedRulesetId(rs.id); setEditingRulesetMeta({id: rs.id, name: rs.name, description: rs.description });}}
              >
                {editingRulesetMeta?.id === rs.id ? (
                    <div className="space-y-1.5">
                        <Input value={editingRulesetMeta.name} onChange={e => setEditingRulesetMeta({...editingRulesetMeta, name: e.target.value})} className="text-sm py-1" autoFocus onBlur={handleUpdateRulesetMeta}/>
                        <TextArea value={editingRulesetMeta.description} onChange={e => setEditingRulesetMeta({...editingRulesetMeta, description: e.target.value})} rows={1} className="text-xs py-1" onBlur={handleUpdateRulesetMeta}/>
                    </div>
                ) : (
                    <>
                        <span className="font-medium text-sm text-slate-800 block truncate" title={rs.name}>{rs.name}</span>
                        <p className="text-xs text-gray-500 truncate mt-0.5" title={rs.description}>{rs.description || '无描述'}</p>
                    </>
                )}
                <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">规则数量: {rs.rules.length} {rs.isDefault && <span className="text-green-600">(默认)</span>}</p>
                    <div className="space-x-0.5">
                        <Tooltip text="编辑名称/描述"><Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); setEditingRulesetMeta({id: rs.id, name: rs.name, description: rs.description }); setSelectedRulesetId(rs.id);}}>{React.cloneElement(PENCIL_ICON, {className:"w-3.5 h-3.5"})}</Button></Tooltip>
                        <Tooltip text="复制规则集"><Button variant="ghost" size="sm" onClick={(e)=>{e.stopPropagation(); handleCopyRuleset(rs.id)}}>{React.cloneElement(COPY_ICON, {className:"w-3.5 h-3.5"})}</Button></Tooltip>
                        <Tooltip text="删除规则集"><Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); handleDeleteRuleset(rs.id)}}>{React.cloneElement(TRASH_ICON, {className:"w-3.5 h-3.5 text-red-500"})}</Button></Tooltip>
                    </div>
                </div>
              </li>
            ))}
            {filteredRulesets.length === 0 && <p className="text-sm text-gray-400 text-center py-4">未找到此类型的规则集。</p>}
          </ul>
        </div>

        {/* Right Panel: Ruleset Detail */}
        <div className="w-1/2 border border-gray-200 p-3 overflow-y-auto bg-white rounded-md shadow flex flex-col">
          {activeRuleset ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-3 flex-shrink-0">
                <h3 className="text-lg font-semibold text-slate-700 truncate" title={activeRuleset.name}>规则集: {activeRuleset.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3 flex-shrink-0">{activeRuleset.description || "无描述"} {activeRuleset.isDefault && <span className="text-xs text-green-600">(默认规则集，可修改)</span>}</p>
              <p className="text-xs text-gray-500 mb-3 flex-shrink-0">提示：规则按优先级（数字越小越高）顺序应用。</p>
              
              <ul className="space-y-1.5 flex-grow overflow-y-auto">
                {activeRuleset.rules.map((ruleInstance, index) => {
                  const ruleDetails = rules.find(r => r.id === ruleInstance.ruleId);
                  return (
                    <li key={ruleInstance.id} className="flex items-center justify-between p-2.5 border rounded-md hover:bg-slate-50 bg-white">
                      <div className="flex-grow min-w-0">
                         <Checkbox 
                            checked={ruleInstance.enabled} 
                            onChange={e => updateRuleInRuleset(activeRuleset.id, ruleInstance.id, { enabled: e.target.checked })}
                            containerClassName="inline-flex mr-2 items-baseline"
                         />
                        <span className={`font-medium text-sm ${ruleInstance.enabled ? 'text-slate-800' : 'text-gray-400 line-through'}`}>
                          {ruleDetails?.name || '未知规则'}
                        </span>
                        <Input 
                            type="number" 
                            value={ruleInstance.priority} 
                            onChange={e => updateRuleInRuleset(activeRuleset.id, ruleInstance.id, {priority: parseInt(e.target.value) || 0})}
                            className="ml-2 inline-block w-16 text-xs py-0.5 px-1"
                            title="优先级 (数字越小越高)"
                        />
                        <p className="text-xs text-gray-500 truncate mt-0.5 pl-6" title={ruleDetails?.description}>{ruleDetails?.description}</p>
                      </div>
                      <div className="space-x-0.5 flex-shrink-0 ml-1">
                        <Tooltip text="替换规则"><Button variant="ghost" size="sm" onClick={() => openReplaceRuleModal(ruleInstance)}>{React.cloneElement(PENCIL_ICON, {className:"w-4 h-4 text-blue-500"})}</Button></Tooltip>
                        <Tooltip text="上移"><Button variant="ghost" size="sm" onClick={() => reorderRuleInRuleset(activeRuleset.id, ruleInstance.id, 'up')} disabled={index === 0 || ruleInstance.priority === activeRuleset.rules[0].priority}>{React.cloneElement(ARROW_UP_ICON, {className:"w-4 h-4"})}</Button></Tooltip>
                        <Tooltip text="下移"><Button variant="ghost" size="sm" onClick={() => reorderRuleInRuleset(activeRuleset.id, ruleInstance.id, 'down')} disabled={index === activeRuleset.rules.length - 1 || ruleInstance.priority === activeRuleset.rules[activeRuleset.rules.length - 1].priority}>{React.cloneElement(ARROW_DOWN_ICON, {className:"w-4 h-4"})}</Button></Tooltip>
                        <Tooltip text="从规则集移除"><Button variant="ghost" size="sm" onClick={() => removeRuleFromRuleset(activeRuleset.id, ruleInstance.id)}>{React.cloneElement(TRASH_ICON, {className:"w-4 h-4 text-red-500"})}</Button></Tooltip>
                      </div>
                    </li>
                  );
                })}
                {activeRuleset.rules.length === 0 && <p className="text-sm text-gray-400 text-center py-4">此规则集为空。请从左侧规则库中添加规则。</p>}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                {React.cloneElement(EYE_ICON, {className:"w-16 h-16 text-slate-300 mb-4"})}
                <p className="text-slate-500">从中间面板选择一个规则集以查看其包含的规则，</p>
                <p className="text-slate-500">或创建一个新的规则集来组织您的规则。</p>
            </div>
          )}
        </div>
      </div>
      {isCreateRuleModalOpen && 
        <CreateRuleModal 
            isOpen={isCreateRuleModalOpen} 
            onClose={() => { setIsCreateRuleModalOpen(false); setEditingRule(null); }} 
            onSave={handleSaveRule}
            initialRule={editingRule}
            ruleTypeContext={selectedRulesetType}
        />
      }
      {isReplaceRuleModalOpen && ruleInstanceToReplace && activeRuleset &&
        <ReplaceRuleModal
            isOpen={isReplaceRuleModalOpen}
            onClose={() => { setIsReplaceRuleModalOpen(false); setRuleInstanceToReplace(null); }}
            onReplace={handleConfirmReplaceRule}
            currentRuleName={getRuleById(ruleInstanceToReplace.ruleId)?.name || '未知规则'}
            compatibleRules={rulesInLibrary.filter(r => r.id !== ruleInstanceToReplace!.ruleId)} // Exclude current rule
        />
      }
    </div>
  );
};

export default RulesetsView;
