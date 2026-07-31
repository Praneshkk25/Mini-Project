import React, { useState, useEffect } from 'react';

const BACKEND_URL = "http://127.0.0.1:8000";

const DEPT_SIMULATOR_PARAMS = {
    "General Medicine": { num_doctors: 2, arrival_rate: 8.0, service_rate: 5.0 },
    "Cardiology": { num_doctors: 1, arrival_rate: 2.0, service_rate: 3.0 },
    "Pediatrics": { num_doctors: 1, arrival_rate: 4.0, service_rate: 6.0 },
    "Orthopedics": { num_doctors: 1, arrival_rate: 3.0, service_rate: 4.0 },
    "Dermatology": { num_doctors: 1, arrival_rate: 2.0, service_rate: 4.0 }
};

export default function HospitalOps({ llmProvider }) {
    // Queuing States
    const [queuesStatus, setQueuesStatus] = useState({});
    const [queueList, setQueueList] = useState([]);
    const [activeDept, setActiveDept] = useState("General Medicine");
    const [doctorsVal, setDoctorsVal] = useState(2);
    const [arrivalsVal, setArrivalsVal] = useState(8.0);
    const [serviceVal, setServiceVal] = useState(5.0);

    // Triage states
    const [checkinName, setCheckinName] = useState("");
    const [checkinAge, setCheckinAge] = useState("");
    const [checkinGender, setCheckinGender] = useState("Male");
    const [checkinSymptoms, setCheckinSymptoms] = useState("");
    const [triagePrediction, setTriagePrediction] = useState(null);

    // Bed States
    const [beds, setBeds] = useState([]);
    const [bedsSummary, setBedsSummary] = useState({});
    const [bedForecast, setBedForecast] = useState([]);
    const [selectedBed, setSelectedBed] = useState(null);
    const [admitName, setAdmitName] = useState("");
    const [admitAge, setAdmitAge] = useState("");
    const [admitGender, setAdmitGender] = useState("Male");
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);

    // Inventory States
    const [inventory, setInventory] = useState([]);
    const [dispensePatientName, setDispensePatientName] = useState("");
    const [dispenseMedId, setDispenseMedId] = useState("");
    const [dispenseQty, setDispenseQty] = useState(10);
    const [dispenseAlerts, setDispenseAlerts] = useState([]);

    // Fetch live dashboard datasets
    const loadDashboardData = async () => {
        try {
            await Promise.all([
                fetchQueuesStatus(),
                fetchQueueList(),
                fetchBedStatus(),
                fetchBedForecast(),
                fetchInventoryList()
            ]);
        } catch (err) {
            console.error("Dashboard reload failed: ", err);
        }
    };

    // Trigger periodic reloading
    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 6000);
        return () => clearInterval(interval);
    }, []);

    // Sync sliders when department selector changes
    useEffect(() => {
        const defaults = DEPT_SIMULATOR_PARAMS[activeDept] || { num_doctors: 1, arrival_rate: 2, service_rate: 3 };
        setDoctorsVal(defaults.num_doctors);
        setArrivalsVal(defaults.arrival_rate);
        setServiceVal(defaults.service_rate);
    }, [activeDept]);

    // Update backend simulator when sliders shift
    const updateQueueConfig = async (dept, doctors, arrivals, service) => {
        try {
            await fetch(`${BACKEND_URL}/api/queues/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    department: dept,
                    num_doctors: parseInt(doctors),
                    arrival_rate: parseFloat(arrivals),
                    service_rate: parseFloat(service)
                })
            });
            fetchQueuesStatus();
        } catch (err) {
            console.error("Failed to update queue parameters", err);
        }
    };

    const fetchQueuesStatus = async () => {
        const res = await fetch(`${BACKEND_URL}/api/queues/status`);
        if (res.ok) setQueuesStatus(await res.json());
    };

    const fetchQueueList = async () => {
        const res = await fetch(`${BACKEND_URL}/api/queues/list`);
        if (res.ok) setQueueList(await res.json());
    };

    const fetchBedStatus = async () => {
        const res = await fetch(`${BACKEND_URL}/api/beds/status`);
        if (res.ok) {
            const data = await res.json();
            setBeds(data.beds || []);
            setBedsSummary(data.summary || {});
        }
    };

    const fetchBedForecast = async () => {
        const res = await fetch(`${BACKEND_URL}/api/beds/forecast`);
        if (res.ok) {
            const data = await res.json();
            setBedForecast(data.forecast || []);
        }
    };

    const fetchInventoryList = async () => {
        const res = await fetch(`${BACKEND_URL}/api/inventory/list`);
        if (res.ok) {
            const data = await res.json();
            setInventory(data);
            if (data.length > 0 && !dispenseMedId) {
                setDispenseMedId(data[0].id || data[0].name);
            }
        }
    };

    // Register check-in with AI triage analysis
    const testAITriage = async () => {
        if (!checkinSymptoms.trim()) {
            alert("Please enter patient symptoms.");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/queues/triage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symptoms: checkinSymptoms,
                    provider: llmProvider
                })
            });
            if (!res.ok) throw new Error("Triage failed");
            const data = await res.json();
            setTriagePrediction(data);
        } catch (err) {
            alert("AI Triage Analysis failed. Falling back to default General Medicine routing.");
        }
    };

    const submitCheckin = async () => {
        if (!checkinName.trim() || !checkinSymptoms.trim()) {
            alert("Please enter both patient name and symptoms.");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/queues/checkin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient_name: checkinName,
                    patient_age: parseInt(checkinAge) || 30,
                    patient_gender: checkinGender,
                    symptoms: checkinSymptoms,
                    provider: llmProvider
                })
            });

            if (!res.ok) throw new Error("Admission registration failed");
            
            // Reset form
            setCheckinName("");
            setCheckinAge("");
            setCheckinSymptoms("");
            setTriagePrediction(null);
            
            loadDashboardData();
        } catch (err) {
            alert(`Check-in failed: ${err.message}`);
        }
    };

    // Queue Action handlers
    const callPatient = async (ticket) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/queues/call`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticket_number: ticket })
            });
            if (res.ok) loadDashboardData();
        } catch (err) {
            console.error(err);
        }
    };

    const completeConsultation = async (ticket) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/queues/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticket_number: ticket })
            });
            if (res.ok) loadDashboardData();
        } catch (err) {
            console.error(err);
        }
    };

    // Bed allocations
    const handleBedClick = (bed) => {
        if (bed.status === "Occupied") {
            if (window.confirm(`Discharge patient ${bed.patient_name || 'Unknown'} from bed ${bed.bed_number}?`)) {
                dischargePatient(bed.bed_number);
            }
        } else if (bed.status === "Available") {
            setSelectedBed(bed.bed_number);
            setIsAdmitModalOpen(true);
        } else if (bed.status === "Cleaning") {
            if (window.confirm(`Mark bed ${bed.bed_number} as Available now?`)) {
                updateBedStatus(bed.bed_number, "Available");
            }
        } else if (bed.status === "Maintenance") {
            if (window.confirm(`Release bed ${bed.bed_number} from Maintenance to Available?`)) {
                updateBedStatus(bed.bed_number, "Available");
            }
        }
    };

    const submitAdmission = async () => {
        if (!admitName.trim()) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/beds/admit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bed_number: selectedBed,
                    patient_name: admitName,
                    patient_age: parseInt(admitAge) || 35,
                    patient_gender: admitGender
                })
            });

            if (!res.ok) throw new Error("Admission error");
            setIsAdmitModalOpen(false);
            setAdmitName("");
            setAdmitAge("");
            fetchBedStatus();
        } catch (e) {
            alert("Bed allocation failed.");
        }
    };

    const dischargePatient = async (bedNum) => {
        try {
            await fetch(`${BACKEND_URL}/api/beds/discharge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bed_number: bedNum })
            });
            fetchBedStatus();
        } catch (e) {
            console.error(e);
        }
    };

    const updateBedStatus = async (bedNum, status) => {
        try {
            await fetch(`${BACKEND_URL}/api/beds/update-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bed_number: bedNum, status })
            });
            fetchBedStatus();
        } catch (e) {
            console.error(e);
        }
    };

    // Dispensation
    const submitDispensation = async () => {
        if (!dispensePatientName.trim() || !dispenseMedId) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/inventory/dispense`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient_name: dispensePatientName,
                    medicine_id: dispenseMedId,
                    qty: parseInt(dispenseQty) || 1
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Dispensation rejected");
            }
            
            const logs = await res.json();
            
            // Add custom logs alerts
            if (logs.warning) {
                setDispenseAlerts(prev => [
                    { type: "warning", message: logs.warning },
                    ...prev
                ]);
            } else {
                setDispenseAlerts(prev => [
                    { type: "success", message: `Successfully dispensed ${dispenseQty} items of ${logs.name} to ${dispensePatientName}.` },
                    ...prev
                ]);
            }

            setDispensePatientName("");
            fetchInventoryList();
        } catch (e) {
            alert(`Stock depletion: ${e.message}`);
        }
    };

    return (
        <div id="hospital-operations-workspace" className="workspace-panel fade-in">
            {/* 1. OPD Queuing models */}
            <section className="card opd-queuing-section">
                <div className="section-title-bar">
                    <div className="title-left">
                        <span className="badge-icon green">📊</span>
                        <h2>OPD Queuing Models & Live Waiting Times</h2>
                    </div>
                    <p className="subtitle">Calculated using M/M/c queuing theory equations based on arrivals, service times, and consulting doctors.</p>
                </div>

                <div className="dept-queue-grid">
                    {Object.keys(queuesStatus).map(deptKey => {
                        const info = queuesStatus[deptKey];
                        let statusClass = "green";
                        if (info.status === "Busy") statusClass = "yellow";
                        if (info.status.includes("Overloaded")) statusClass = "red";

                        return (
                            <div key={deptKey} className="dept-queue-card card-inner">
                                <div className="dept-header">
                                    <h4>{info.department}</h4>
                                    <span className={`status-dot ${statusClass}`} title={info.status}></span>
                                </div>
                                <div className="dept-stats-row">
                                    <div className="d-stat">
                                        <span className="d-lbl">Doctors (c)</span>
                                        <span className="d-val">{info.active_doctors}</span>
                                    </div>
                                    <div className="d-stat">
                                        <span className="d-lbl">Waiting</span>
                                        <span className="d-val text-accent">{info.actual_waiting_count}</span>
                                    </div>
                                    <div className="d-stat">
                                        <span className="d-lbl">Traffic λ/hr</span>
                                        <span className="d-val">{info.arrival_rate_hr}</span>
                                    </div>
                                </div>
                                <div className="dept-math-highlight">
                                    <div className="math-item">
                                        <span>Utilization (ρ):</span>
                                        <strong>{Math.round(info.utilization * 100)}%</strong>
                                    </div>
                                    <div className="math-item">
                                        <span>Est. Wait Time:</span>
                                        <strong className="text-accent">{info.expected_wait_time_minutes} min</strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Operations Sliders and checkins */}
                <div className="ops-split-grid">
                    <div className="ops-card card-inner">
                        <h3>Quick Patient Check-In & AI Triage</h3>
                        <p className="card-inner-subtitle">Enter symptoms. The AI symptom triage router will auto-determine the department and clinical urgency priority.</p>
                        
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Patient Name</label>
                                    <input 
                                        type="text" 
                                        value={checkinName} 
                                        onChange={(e) => setCheckinName(e.target.value)} 
                                        placeholder="e.g. Karan Malhotra" 
                                        required 
                                    />
                                </div>
                                <div className="form-group-split">
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input 
                                            type="number" 
                                            value={checkinAge} 
                                            onChange={(e) => setCheckinAge(e.target.value)} 
                                            placeholder="45" 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select value={checkinGender} onChange={(e) => setCheckinGender(e.target.value)}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Patient Symptoms (NLP Triage)</label>
                                <textarea 
                                    rows="2" 
                                    value={checkinSymptoms} 
                                    onChange={(e) => setCheckinSymptoms(e.target.value)} 
                                    placeholder="e.g. Sharp pain in chest spreading to left shoulder with shortness of breath..." 
                                    required 
                                />
                            </div>

                            {triagePrediction && (
                                <div className="triage-prediction-preview">
                                    <div className="preview-header">AI Routing Analysis:</div>
                                    <div className="preview-body">
                                        <span className="preview-tag">{triagePrediction.department}</span>
                                        <span className={`preview-tag ${triagePrediction.priority === 'Immediate' ? 'red' : triagePrediction.priority === 'Urgent' ? 'yellow' : ''}`}>
                                            {triagePrediction.priority}
                                        </span>
                                        <p className="preview-reason">{triagePrediction.reason}</p>
                                    </div>
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" onClick={testAITriage} className="btn-secondary">Test AI Triage</button>
                                <button type="button" onClick={submitCheckin} className="btn-accent">Check-In Patient</button>
                            </div>
                        </form>
                    </div>

                    <div className="ops-card card-inner">
                        <h3>Queue Parameters Adjuster (Simulator)</h3>
                        <p className="card-inner-subtitle">Modify parameters in real-time to simulate queuing stress test bottlenecks and check how wait times behave.</p>
                        
                        <div className="form-group">
                            <label>Select Department</label>
                            <select value={activeDept} onChange={(e) => setActiveDept(e.target.value)}>
                                <option value="General Medicine">General Medicine</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Dermatology">Dermatology</option>
                            </select>
                        </div>
                        
                        <div className="simulator-sliders">
                            <div className="slider-group">
                                <div className="slider-label-val">
                                    <span>Active Doctors (c)</span>
                                    <span className="slider-val">{doctorsVal}</span>
                                </div>
                                <input 
                                    type="range" min="1" max="5" 
                                    value={doctorsVal} 
                                    onChange={(e) => {
                                        setDoctorsVal(e.target.value);
                                        updateQueueConfig(activeDept, e.target.value, arrivalsVal, serviceVal);
                                    }} 
                                />
                            </div>
                            
                            <div className="slider-group">
                                <div className="slider-label-val">
                                    <span>Arrival Rate (λ / hr)</span>
                                    <span className="slider-val">{arrivalsVal}</span>
                                </div>
                                <input 
                                    type="range" min="1" max="25" step="0.5" 
                                    value={arrivalsVal} 
                                    onChange={(e) => {
                                        setArrivalsVal(e.target.value);
                                        updateQueueConfig(activeDept, doctorsVal, e.target.value, serviceVal);
                                    }} 
                                />
                            </div>
                            
                            <div className="slider-group">
                                <div className="slider-label-val">
                                    <span>Service Rate (μ / doctor / hr)</span>
                                    <span className="slider-val">{serviceVal}</span>
                                </div>
                                <input 
                                    type="range" min="1" max="15" step="0.5" 
                                    value={serviceVal} 
                                    onChange={(e) => {
                                        setServiceVal(e.target.value);
                                        updateQueueConfig(activeDept, doctorsVal, arrivalsVal, e.target.value);
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Queue list table */}
                <div className="active-patients-table-wrapper">
                    <h3>Live OPD Queue List</h3>
                    <div className="table-container">
                        <table className="ops-table">
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>Patient Name</th>
                                    <th>Department</th>
                                    <th>Priority</th>
                                    <th>Symptoms</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queueList.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center text-muted">No active patients in queue.</td></tr>
                                ) : (
                                    queueList.map(item => (
                                        <tr key={item.ticket_number}>
                                            <td><strong>{item.ticket_number}</strong></td>
                                            <td>{item.patient_name} ({item.patient_age}/{item.patient_gender.charAt(0)})</td>
                                            <td>{item.department}</td>
                                            <td>
                                                <span className={`badge ${item.priority === 'Immediate' ? 'red' : item.priority === 'Urgent' ? 'yellow' : 'green'}`}>
                                                    {item.priority}
                                                </span>
                                            </td>
                                            <td className="text-truncate-2" title={item.symptoms}>{item.symptoms || 'None'}</td>
                                            <td>
                                                <span className={`badge ${item.status === 'In-Consultation' ? 'purple' : 'grey'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>
                                                {item.status === 'Waiting' && (
                                                    <button onClick={() => callPatient(item.ticket_number)} className="btn-primary btn-small">Call Patient</button>
                                                )}
                                                {item.status === 'In-Consultation' && (
                                                    <button onClick={() => completeConsultation(item.ticket_number)} className="btn-accent btn-small">Complete</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* 2. Bed Availability Tracker */}
            <section className="card bed-management-section">
                <div className="section-title-bar">
                    <div className="title-left">
                        <span className="badge-icon blue">🛏️</span>
                        <h2>Real-Time Bed Availability & Patient Admissions</h2>
                    </div>
                    <p className="subtitle">Assign patients to ward beds, manage discharges, and view AI-predicted bed requirements for the next 7 days.</p>
                </div>

                <div className="beds-summary-cards">
                    <div className="card-inner">
                        <span className="d-lbl">Total Capacity</span>
                        <span className="d-val">{bedsSummary.total || 0} Beds</span>
                    </div>
                    <div className="card-inner" style={{ borderLeft: '3px solid var(--success)' }}>
                        <span className="d-lbl">Available</span>
                        <span className="d-val text-success">{bedsSummary.available || 0} Beds</span>
                    </div>
                    <div className="card-inner" style={{ borderLeft: '3px solid var(--danger)' }}>
                        <span className="d-lbl">Occupied</span>
                        <span className="d-val text-accent">{bedsSummary.occupied || 0} Beds</span>
                    </div>
                    <div className="card-inner" style={{ borderLeft: '3px solid var(--accent)' }}>
                        <span className="d-lbl">Cleaning</span>
                        <span className="d-val text-accent">{bedsSummary.cleaning || 0} Beds</span>
                    </div>
                    <div className="card-inner" style={{ borderLeft: '3px solid var(--warning)' }}>
                        <span className="d-lbl">Maintenance</span>
                        <span className="d-val text-warning">{bedsSummary.maintenance || 0} Beds</span>
                    </div>
                </div>

                <div className="beds-layout-grid">
                    <div className="beds-grid-holder">
                        <h3>Ward Bed Status Map</h3>
                        <p className="grid-subtitle">Click on any bed to admit, transfer, discharge patients or set maintenance status.</p>
                        <div className="beds-visual-grid">
                            {beds.map(bed => {
                                const statusClass = bed.status.toLowerCase();
                                return (
                                    <div 
                                        key={bed.bed_number} 
                                        className={`bed-block ${statusClass}`}
                                        onClick={() => handleBedClick(bed)}
                                    >
                                        <span className="bed-icon-v">🛏️</span>
                                        <span className="bed-num-lbl">{bed.bed_number}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Bed Forecast Graph */}
                    <div className="beds-forecast-holder">
                        <h3>AI 7-Day Bed Occupancy Forecast</h3>
                        <p className="grid-subtitle">Predicts upcoming bed shortage alerts based on current occupancy and seasonal admission trends.</p>
                        
                        <div className="forecast-graph-container">
                            <div className="forecast-bars">
                                {bedForecast.map((item, idx) => (
                                    <div key={idx} className="graph-bar-wrapper">
                                        <span className="bar-val-lbl">{item.occupancy_rate}%</span>
                                        <div 
                                            className="graph-bar" 
                                            style={{ height: `${item.occupancy_rate}%` }}
                                            title={`${item.occupancy_rate}% Occupancy`}
                                        ></div>
                                        <span className="bar-day-lbl">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="graph-y-axis">
                                <span>100%</span>
                                <span>50%</span>
                                <span>0%</span>
                            </div>
                        </div>

                        <div className="forecast-alert-box" style={{ background: (bedsSummary.available || 0) < 3 ? 'rgba(239, 68, 68, 0.08)' : '' }}>
                            <div className="alert-icon">⚠️</div>
                            <div className="alert-text">
                                <h4 style={{ color: (bedsSummary.available || 0) < 3 ? 'var(--danger)' : '' }}>
                                    {(bedsSummary.available || 0) < 3 ? 'Bed Shortage Alert: Critical' : 'Bed Capacity Forecast: Stable'}
                                </h4>
                                <p>{(bedsSummary.available || 0) < 3 ? 'Less than 3 beds are available in the facility. Delay elective transfers if possible.' : 'No immediate shortage forecasted. Peak occupancy expected around middle of the week.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Admission Modal */}
            {isAdmitModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>Admit Patient to Bed {selectedBed}</h3>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>Patient Name</label>
                                <input 
                                    type="text" 
                                    value={admitName} 
                                    onChange={(e) => setAdmitName(e.target.value)} 
                                    placeholder="Enter patient name" 
                                    required 
                                />
                            </div>
                            <div className="form-group-split">
                                <div className="form-group">
                                    <label>Age</label>
                                    <input 
                                        type="number" 
                                        value={admitAge} 
                                        onChange={(e) => setAdmitAge(e.target.value)} 
                                        placeholder="Age" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select value={admitGender} onChange={(e) => setAdmitGender(e.target.value)}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsAdmitModalOpen(false)}>Cancel</button>
                                <button type="button" className="btn-accent" onClick={submitAdmission}>Confirm Admission</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Pharmacy Stock & Consumables */}
            <section className="card inventory-section">
                <div className="section-title-bar">
                    <div className="title-left">
                        <span className="badge-icon yellow">💊</span>
                        <h2>Medicine Dispensary & AI Stockout Predictions</h2>
                    </div>
                    <p className="subtitle">Tracks clinical consumables, records patient dispensations, and uses consumption velocities to calculate safety reorders.</p>
                </div>

                <div className="inventory-split-layout">
                    <div className="inventory-table-holder">
                        <h3>Pharmacy Medicine Catalog</h3>
                        <div className="table-container">
                            <table className="ops-table font-small">
                                <thead>
                                    <tr>
                                        <th>Medicine Name</th>
                                        <th>Batch</th>
                                        <th>Stock</th>
                                        <th>Reorder Lvl</th>
                                        <th>Daily Usage (Est)</th>
                                        <th>AI Days left</th>
                                        <th>Stock Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map(item => {
                                        const stockStatus = item.stock <= item.reorder_level ? "Critical" : "Stable";
                                        const isLow = stockStatus === "Critical";
                                        return (
                                            <tr key={item.id}>
                                                <td><strong>{item.name}</strong></td>
                                                <td>{item.batch_no}</td>
                                                <td>{item.stock} {item.unit}</td>
                                                <td>{item.reorder_level} {item.unit}</td>
                                                <td>{item.estimated_daily_usage} / day</td>
                                                <td>
                                                    <span style={{ color: isLow ? 'var(--danger)' : '', fontWeight: isLow ? '800' : '' }}>
                                                        {item.ai_predicted_days_remaining} days
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${isLow ? 'red' : 'green'}`}>
                                                        {stockStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="inventory-dispense-panel card-inner">
                        <h3>Dispense Medicines to Patient</h3>
                        <p className="card-inner-subtitle">Deducts stock automatically, issues logs, and triggers warning alerts if item reaches reorder threshold.</p>
                        
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>Patient Name</label>
                                <input 
                                    type="text" 
                                    value={dispensePatientName} 
                                    onChange={(e) => setDispensePatientName(e.target.value)} 
                                    placeholder="e.g. Karan Malhotra" 
                                    required 
                                />
                            </div>
                            <div className="form-group-split">
                                <div className="form-group">
                                    <label>Select Medicine</label>
                                    <select value={dispenseMedId} onChange={(e) => setDispenseMedId(e.target.value)}>
                                        {inventory.map(item => (
                                            <option key={item.id} value={item.id}>{item.name} ({item.stock} left)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: '0 0 100px' }}>
                                    <label>Quantity</label>
                                    <input 
                                        type="number" 
                                        value={dispenseQty} 
                                        onChange={(e) => setDispenseQty(e.target.value)} 
                                        min="1" 
                                        required 
                                    />
                                </div>
                            </div>
                            <button type="button" onClick={submitDispensation} className="btn-accent width-full margin-top-1">
                                <span>Confirm Dispensation</span>
                            </button>
                        </form>

                        <div className="inventory-alerts-box">
                            {dispenseAlerts.map((alert, i) => (
                                <div key={i} className={`inventory-alert ${alert.type}`}>
                                    <span>{alert.type === 'warning' ? '⚠️' : '✅'}</span>
                                    <span>{alert.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
