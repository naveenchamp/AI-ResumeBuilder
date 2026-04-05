// ============================================
// DashboardPage.jsx - Resume Dashboard
// ============================================

import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { getResumes, deleteResume } from '../../services/resumeService.js';
import { HiTrash, HiClock, HiDocumentText, HiSparkles, HiChartBar, HiSquares2X2, HiPlus } from 'react-icons/hi2';
import TEMPLATES from '../../constants/templates.js';

function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await getResumes();
      setResumes(data);
    } catch (error) {
      toast.error('Failed to load resumes');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
      toast.success('Resume deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
  const scoredResumes = resumes.filter((resume) => resume.atsScore?.overall > 0);
  const averageAts = scoredResumes.length > 0
    ? Math.round(scoredResumes.reduce((total, resume) => total + (resume.atsScore?.overall || 0), 0) / scoredResumes.length)
    : 0;
  const uniqueTemplates = new Set(resumes.map((resume) => resume.templateId)).size;
  const stats = [
    {
      label: 'Total Resumes',
      value: resumes.length,
      note: 'Active resume drafts',
      accent: 'green',
      icon: HiDocumentText,
    },
    {
      label: 'ATS Reviewed',
      value: scoredResumes.length,
      note: 'Scored with AI analysis',
      accent: 'purple',
      icon: HiSparkles,
    },
    {
      label: 'Avg ATS Score',
      value: scoredResumes.length > 0 ? averageAts : '--',
      note: 'Overall dashboard average',
      accent: 'yellow',
      icon: HiChartBar,
    },
    {
      label: 'Templates Used',
      value: uniqueTemplates,
      note: 'Distinct layouts in rotation',
      accent: 'blue',
      icon: HiSquares2X2,
    },
  ];

  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <div className="dashboard-shell">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-copy">
            <h1 className="heading-lg">My Resumes</h1>
            <p className="text-muted mt-xs">
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <div className="dashboard-header-actions">
            <button
              onClick={() => navigate('/')}
              className="button-green"
            >
              <HiPlus />
              New Resume
            </button>
          </div>
        </div>

        {!isLoading && (
          <div className="dashboard-stats">
            {stats.map(({ label, value, note, accent, icon: Icon }) => (
              <div key={label} className={`dashboard-stat-card dashboard-stat-card-${accent}`}>
                <div className="dashboard-stat-header">
                  <span className="dashboard-stat-label">{label}</span>
                  <span className={`dashboard-stat-icon dashboard-stat-icon-${accent}`}>
                    <Icon />
                  </span>
                </div>
                <div className={`dashboard-stat-value dashboard-stat-value-${accent}`}>{value}</div>
                <div className="dashboard-stat-note">{note}</div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex-center" style={{ padding: '80px 0' }}>
            <div className="spinner" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && resumes.length === 0 && (
          <div className="empty-state">
            <div className="icon-circle icon-circle-purple mb-md">
              <HiDocumentText style={{ fontSize: '28px' }} />
            </div>
            <h3 className="heading-sm mb-xs">No resumes yet</h3>
            <p className="text-muted mb-lg">Head to the Home page to create your first AI-powered resume</p>
          </div>
        )}

        {/* Resume Grid */}
        {!isLoading && resumes.length > 0 && (
          <div className="grid-auto">
            {resumes.map((resume) => {
              const template = getTemplate(resume.templateId);
              return (
                <div
                  key={resume._id}
                  onClick={() => navigate(`/builder/${resume._id}`)}
                  className="resume-card"
                >
                  {/* Template color bar */}
                  <div
                    className="resume-card-bar"
                    style={{ background: `linear-gradient(90deg, ${template.colors.primary}, ${template.colors.accent})` }}
                  />
                  <div className="resume-card-body">
                    <div className="flex-between mb-sm">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="heading-sm truncate">{resume.title}</h3>
                        {resume.targetRole && (
                          <p className="text-xs truncate" style={{ marginTop: '2px' }}>{resume.targetRole}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDelete(resume._id, e)}
                        className="btn-icon-sm btn-ghost text-danger"
                        style={{ opacity: 0.4 }}
                      >
                        <HiTrash style={{ fontSize: '14px' }} />
                      </button>
                    </div>

                    {/* ATS Score */}
                    {resume.atsScore?.overall > 0 && (
                      <div className="flex-row items-center gap-sm mb-sm">
                        <HiSparkles style={{ color: 'var(--warning)', fontSize: '14px' }} />
                        <div className="resume-card-score-bar">
                          <div
                            style={{
                              height: '100%',
                              borderRadius: '2px',
                              width: `${resume.atsScore.overall}%`,
                              backgroundColor: resume.atsScore.overall >= 80 ? 'var(--success)'
                                : resume.atsScore.overall >= 60 ? 'var(--warning)'
                                : 'var(--error)',
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{resume.atsScore.overall}</span>
                      </div>
                    )}

                    <div className="flex-between">
                      <div className="flex-row items-center gap-xs">
                        <HiClock style={{ fontSize: '12px', color: 'var(--text-muted)' }} />
                        <span className="text-xs">{formatDate(resume.updatedAt)}</span>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: `${template.colors.accent}22`,
                          color: template.colors.accent,
                          border: `1px solid ${template.colors.accent}33`,
                        }}
                      >
                        {template.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
