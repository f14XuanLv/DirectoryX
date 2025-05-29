
import React from 'react';
import Input from './Input';
import Button from './Button';
import { ARROW_UP_ICON, ARROW_DOWN_ICON, X_MARK_ICON } from '../../constants';

interface QueryInputProps<T> {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  placeholder?: string;
  currentMatchIndex?: number;
  totalMatches?: number;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const QueryInput = <T,>({
  searchTerm,
  onSearchTermChange,
  onPrevious,
  onNext,
  onClose,
  placeholder = "搜索...", // Translated default placeholder
  currentMatchIndex,
  totalMatches,
  disabled = false,
  inputRef
}: QueryInputProps<T>): React.ReactNode => {
  return (
    <div className="p-2 bg-slate-100 border border-gray-300 rounded-md shadow">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="mb-2 text-sm"
        disabled={disabled}
        aria-label={placeholder}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button onClick={onPrevious} size="sm" variant="secondary" disabled={disabled || !totalMatches || totalMatches === 0} aria-label="上一个匹配">
            {React.cloneElement(ARROW_UP_ICON, {className:"w-4 h-4"})}
          </Button>
          <Button onClick={onNext} size="sm" variant="secondary" disabled={disabled || !totalMatches || totalMatches === 0} aria-label="下一个匹配">
            {React.cloneElement(ARROW_DOWN_ICON, {className:"w-4 h-4"})}
          </Button>
           {typeof currentMatchIndex === 'number' && typeof totalMatches === 'number' && totalMatches > 0 && (
             <span className="text-xs text-gray-600 px-2 tabular-nums" aria-live="polite">
               {currentMatchIndex + 1} / {totalMatches}
             </span>
           )}
        </div>
        <Button onClick={onClose} size="sm" variant="ghost" aria-label="关闭搜索">
          {React.cloneElement(X_MARK_ICON, {className:"w-4 h-4"})}
        </Button>
      </div>
    </div>
  );
};

export default QueryInput;
