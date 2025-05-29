
import React, { useState, useEffect } from 'react';
import { MainView, UID } from './types';
import FilesView from './views/FilesView';
import MatchingLibraryView from './views/MatchingLibraryView';
import RulesetsView from './views/RulesetsView';
import MacroOperationsView from './views/MacroOperationsView';
import { useAppContext } from './contexts/AppContext';
import { FOLDER_ICON, LIBRARY_ICON, RULE_ICON, MACRO_ICON } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<MainView>(MainView.FILES);
  const { canUndoMacro, undoMacroExecution, canRedoMacro, redoMacroExecution } = useAppContext();

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (activeView === MainView.FILES) { // Contextual undo/redo for FilesView (e.g. selection changes) is handled within FilesView itself
          // This global one is now for Macro execution undo/redo specifically for FilesView
          if (event.key.toLowerCase() === 'z' && canUndoMacro) {
            undoMacroExecution();
            event.preventDefault();
          } else if (event.key.toLowerCase() === 'y' && canRedoMacro) {
            redoMacroExecution();
            event.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [activeView, canUndoMacro, undoMacroExecution, canRedoMacro, redoMacroExecution]);


  const renderView = () => {
    switch (activeView) {
      case MainView.FILES:
        return <FilesView />;
      case MainView.MATCHING_LIBRARY:
        return <MatchingLibraryView />;
      case MainView.RULESETS:
        return <RulesetsView />;
      case MainView.MACRO_OPERATIONS:
        return <MacroOperationsView />;
      default:
        return <FilesView />;
    }
  };

  const navItems = [
    { view: MainView.FILES, label: '文件', icon: FOLDER_ICON },
    { view: MainView.MATCHING_LIBRARY, label: '匹配库', icon: LIBRARY_ICON },
    { view: MainView.RULESETS, label: '规则集', icon: RULE_ICON },
    { view: MainView.MACRO_OPERATIONS, label: '宏操作', icon: MACRO_ICON },
  ];

  return (
    <div className="flex flex-col h-screen antialiased">
      <header className="bg-slate-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
             {React.cloneElement(FOLDER_ICON, { className: "w-8 h-8 mr-3 text-sky-400"})}
            <h1 className="text-2xl font-semibold tracking-tight">DirectoryX - 目录化工具</h1>
          </div>
        </div>
      </header>
      
      <nav className="bg-slate-700 text-slate-200 shadow">
        <div className="container mx-auto flex">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`flex items-center px-4 py-3 hover:bg-slate-600 hover:text-white transition-colors ${activeView === item.view ? 'bg-sky-600 text-white' : ''}`}
              aria-current={activeView === item.view ? 'page' : undefined}
            >
              {React.cloneElement(item.icon, {className: "w-5 h-5 mr-2"})}
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-grow container mx-auto p-1 sm:p-2 overflow-auto bg-gray-50">
        {renderView()}
      </main>

      <footer className="bg-slate-800 text-gray-400 p-3 text-center text-xs shadow-inner">
        © {new Date().getFullYear()} DirectoryX. Released under the MIT License.
      </footer>
    </div>
  );
};

export default App;
