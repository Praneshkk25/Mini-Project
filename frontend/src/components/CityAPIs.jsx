import React, { useState } from 'react';

const BACKEND_URL = "http://127.0.0.1:8000";
const CITY_API_KEY = "DELHI-GEN-HOSP-04-KEY-2026";

export default function CityAPIs() {
    const [activeEndpoint, setActiveEndpoint] = useState(null);
    const [jsonResponse, setJsonResponse] = useState("// Click an endpoint on the left to request live data...");
    const [loading, setLoading] = useState(false);

    const fetchEndpoint = async (endpoint) => {
        setLoading(true);
        setActiveEndpoint(endpoint);
        setJsonResponse("// Polling central city API registry...");
        
        try {
            const res = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: "GET",
                headers: {
                    "X-City-API-Key": CITY_API_KEY
                }
            });

            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error("403 Forbidden: Invalid state API authentication key.");
                }
                throw new Error(`HTTP Error ${res.status}`);
            }

            const data = await res.json();
            setJsonResponse(JSON.stringify(data, null, 2));
        } catch (err) {
            setJsonResponse(`// API Fetch Failed:\n// ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const clearConsole = () => {
        setActiveEndpoint(null);
        setJsonResponse("// Click an endpoint on the left to request live data...");
    };

    return (
        <section className="card city-wide-integration-section">
            <div className="section-title-bar">
                <div className="title-left">
                    <span className="badge-icon purple">🌐</span>
                    <h2>Delhi State Central Healthcare Integration Hub (APIs)</h2>
                </div>
                <p className="subtitle">Secure, standardized API endpoints that centralize hospital capacity datasets for city-level routing dashboards.</p>
            </div>

            <div className="city-wide-grid">
                <div className="api-links-console">
                    <h3>Available City-Wide API Endpoints</h3>
                    <p className="grid-subtitle">Simulate real polling requests from the state dashboard. Click any endpoint below to inspect the response:</p>
                    
                    <div className="api-endpoints-buttons">
                        <button 
                            className={`api-btn ${activeEndpoint === '/api/city-wide/beds' ? 'active' : ''}`}
                            onClick={() => fetchEndpoint('/api/city-wide/beds')}
                            disabled={loading}
                        >
                            <span className="api-method">GET</span>
                            <span className="api-path">/api/city-wide/beds</span>
                        </button>
                        <button 
                            className={`api-btn ${activeEndpoint === '/api/city-wide/queues' ? 'active' : ''}`}
                            onClick={() => fetchEndpoint('/api/city-wide/queues')}
                            disabled={loading}
                        >
                            <span className="api-method">GET</span>
                            <span className="api-path">/api/city-wide/queues</span>
                        </button>
                        <button 
                            className={`api-btn ${activeEndpoint === '/api/city-wide/emergency-status' ? 'active' : ''}`}
                            onClick={() => fetchEndpoint('/api/city-wide/emergency-status')}
                            disabled={loading}
                        >
                            <span className="api-method">GET</span>
                            <span className="api-path">/api/city-wide/emergency-status</span>
                        </button>
                    </div>
                    
                    <div className="api-key-indicator">
                        <div className="indicator-header">Integration Key (Sent in request header):</div>
                        <code>X-City-API-Key: {CITY_API_KEY}</code>
                    </div>
                </div>

                {/* Right: JSON output viewer */}
                <div className="api-json-viewer card-inner">
                    <div class="json-header">
                        <span>City Hub Response Payload</span>
                        <button className="btn-secondary btn-small" onClick={clearConsole}>Clear</button>
                    </div>
                    <pre><code className="json-output">{jsonResponse}</code></pre>
                </div>
            </div>
        </section>
    );
}
