import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch active jobs from Node.js backend
    axios.get('http://localhost:5000/api/jobs')
      .then(res => {
        setJobs(res.data);
        if (res.data.length > 0) setSelectedJob(res.data[0].id);
      })
      .catch(err => {
        console.error("Backend Error:", err);
        setError("Backend connectivity issue. Please ensure Server is running on Port 5000.");
      });
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) {
      setError("Please select a target position.");
      return;
    }
    if (!file) {
      setError("Please upload a Resume PDF for AI analysis.");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('jobId', selectedJob);
    formData.append('resume', file);

    try {
      const res = await axios.post('http://localhost:5000/api/screen-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "AI Service error. Please verify service status.");
    } finally {
      setLoading(false);
    }
  };

  // Helper color for score visual
  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981'; // Green
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      color: '#334155'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '750px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          padding: '36px 30px',
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            NCBA&E Final Year Project
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Smart AI Resume Screening Engine
          </h1>
        </div>

        {/* Card Body */}
        <div style={{ padding: '36px 40px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid #fecaca',
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Target Job Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#1e293b', marginBottom: '8px' }}>
                Target Job Position
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '15px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
              >
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} — ({job.department || 'Engineering'})
                  </option>
                ))}
              </select>
            </div>

            {/* Resume File Upload Drop Area */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#1e293b', marginBottom: '8px' }}>
                Upload Candidate PDF Resume
              </label>
              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '28px 20px',
                textAlign: 'center',
                backgroundColor: file ? '#f0fdf4' : '#f8fafc',
                borderColor: file ? '#22c55e' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  id="resume-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="resume-upload" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: file ? '#15803d' : '#334155' }}>
                    {file ? file.name : 'Click to Browse PDF Document'}
                  </span>
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {file ? 'File attached and ready for analysis' : 'Supported Format: Adobe PDF (.pdf)'}
                  </p>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Processing...' : 'Execute'}
            </button>
          </form>

          {/* Screening Output Dashboard */}
          {result && (
            <div style={{
              marginTop: '32px',
              padding: '24px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  AI Match Results
                </h3>
                <span style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  TF-IDF NLP Engine
                </span>
              </div>

              <div style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: '1.6' }}>
                <div><strong>Applied Target:</strong> {jobs.find(j => j.id === selectedJob)?.title || selectedJob}</div>
                <div><strong>Candidate File:</strong> {file?.name}</div>
              </div>

              {/* Progress Indicator */}
              <div style={{
                backgroundColor: '#ffffff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>
                    Cosine Similarity Score
                  </span>
                  <span style={{
                    fontSize: '26px',
                    fontWeight: '900',
                    color: getScoreColor(result.match_score)
                  }}>
                    {result.match_score}%
                  </span>
                </div>

                {/* Score Bar */}
                <div style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(result.match_score, 100)}%`,
                    height: '100%',
                    backgroundColor: getScoreColor(result.match_score),
                    transition: 'width 1s ease-in-out'
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;