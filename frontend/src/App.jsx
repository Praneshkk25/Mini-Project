import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import PharmacyConsole from './modules/pharmacy/PharmacyConsole';
import CareCompanion from './components/CareCompanion';

export default function App() {
    const [activeRole, setActiveRole] = useState('dashboard');
    const [llmProvider, setLlmProvider] = useState('qwen');

    const [parsedSummaryEnglish, setParsedSummaryEnglish] = useState(null);
    const [activeLanguage, setActiveLanguage] = useState('English');

    return (
        <Layout activeRole={activeRole} onNavigate={setActiveRole}>
            <PharmacyConsole activeTab={activeRole} onSelectTab={setActiveRole} />

            {/* Floating AI companion */}
            {CareCompanion && (
                <CareCompanion 
                    parsedSummaryEnglish={parsedSummaryEnglish}
                    activeLanguage={activeLanguage}
                />
            )}
        </Layout>
    );
}
