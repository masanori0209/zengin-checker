import React from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import CharsetChecker from './components/CharsetChecker';
import ZenginTable from './components/ZenginTable';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import { useZenginParser } from './hooks/useZenginParser';

const App: React.FC = () => {
  const { parseResult, isLoading, error, parseFile, clearData, updateRecord } = useZenginParser();

  const handleFileUpload = async (file: File) => {
    await parseFile(file);
  };

  return (
    <>
      <ThemeToggle />
      <Header />
      
      <main className="main-content">
        <div className="container">
          <FileUploader
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            error={error}
          />
          
          {parseResult && (
            <>
              <CharsetChecker encodingResult={parseResult.encodingResult} />
              <ZenginTable parseResult={parseResult} onClearData={clearData} onRecordUpdate={updateRecord} />
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default App;
