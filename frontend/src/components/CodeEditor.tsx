import { Editor } from '@monaco-editor/react';
import { useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: 'vs-light' | 'vs-dark';
  height?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language = 'python',
  theme = 'vs-dark',
  height = '500px'
}: CodeEditorProps) {
  const [editorTheme, setEditorTheme] = useState<'vs-light' | 'vs-dark'>(theme);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300">
          Language: <span className="font-semibold text-white">{language.toUpperCase()}</span>
        </span>
        <button
          onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'vs-light' : 'vs-dark')}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition"
        >
          {editorTheme === 'vs-dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <Editor
        height={height}
        language={language}
        theme={editorTheme}
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          autoIndent: 'full',
        }}
      />
    </div>
  );
}
