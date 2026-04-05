// ============================================
// MinimalPdf.jsx - Minimal Template for PDF Export
// ============================================
// React-PDF version of MinimalTemplate.
// Uses @react-pdf/renderer primitives only.
// ============================================

import { View, Text, Link, StyleSheet } from '@react-pdf/renderer';

function MinimalPdf({ sections, colors }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;
  const palette = {
    bg: colors?.primary || '#0f172a',
    surface: colors?.light || '#1e293b',
    accent: colors?.accent || '#6366f1',
    text: colors?.text || '#f8fafc',
    secondary: '#cbd5f5',
    muted: '#94a3b8',
    border: '#334155',
  };

  const styles = StyleSheet.create({
    page: {
      padding: '36 40',
      fontFamily: 'Helvetica',
      color: palette.secondary,
      fontSize: 10,
      backgroundColor: palette.bg,
    },
    name: {
      fontSize: 18,
      fontWeight: 500,
      color: palette.text,
      letterSpacing: 0.5,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 6,
      fontSize: 9,
      color: palette.muted,
    },
    divider: {
      borderBottom: `1px solid ${palette.border}`,
      marginTop: 14,
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 8,
      textTransform: 'uppercase',
      letterSpacing: 3,
      color: palette.accent,
      marginBottom: 8,
    },
    section: {
      marginBottom: 14,
    },
    bodyText: {
      fontSize: 10,
      color: palette.secondary,
      lineHeight: 1.7,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    role: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: palette.text,
    },
    company: {
      fontSize: 10,
      color: palette.secondary,
    },
    dates: {
      fontSize: 9,
      color: palette.muted,
    },
    bulletItem: {
      flexDirection: 'row',
      marginLeft: 4,
      marginTop: 2,
    },
    bulletDash: {
      width: 10,
      fontSize: 10,
      color: palette.accent,
    },
    bulletText: {
      flex: 1,
      fontSize: 10,
      lineHeight: 1.7,
      color: palette.secondary,
    },
    link: {
      color: palette.accent,
      textDecoration: 'underline',
      fontSize: 9,
    },
    bold: {
      fontFamily: 'Helvetica-Bold',
    },
    light: {
      fontSize: 9,
      color: palette.muted,
    },
  });

  return (
    <View style={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Full Name'}</Text>
        <View style={styles.contactRow}>
          {personalInfo.email && <Text>{personalInfo.email}</Text>}
          {personalInfo.phone && <Text>{personalInfo.phone}</Text>}
          {personalInfo.location && <Text>{personalInfo.location}</Text>}
          {personalInfo.linkedIn && (
            <Link src={personalInfo.linkedIn} style={styles.link}>LinkedIn</Link>
          )}
          {personalInfo.portfolio && (
            <Link src={personalInfo.portfolio} style={styles.link}>Portfolio</Link>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Summary */}
      {summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.bodyText}>{summary}</Text>
        </View>
      ) : null}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <View style={styles.row}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <Text style={styles.role}>{exp.role}</Text>
                  {exp.company && <Text style={styles.company}> — {exp.company}</Text>}
                </View>
                <Text style={styles.dates}>
                  {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}
                  {exp.current ? 'Present' : exp.endDate}
                </Text>
              </View>
              {exp.bullets && exp.bullets.map((bullet, j) => (
                <View key={j} style={styles.bulletItem}>
                  <Text style={styles.bulletDash}>–</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      <View style={styles.divider} />

      {/* Education */}
      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, i) => (
            <View key={i} style={[styles.row, { marginBottom: 4 }]}>
              <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
                <Text style={styles.bold}>{edu.degree}</Text>
                {edu.field && <Text> in {edu.field}</Text>}
                {edu.institution && <Text style={styles.light}> — {edu.institution}</Text>}
                {edu.gpa && <Text style={styles.light}> (GPA: {edu.gpa})</Text>}
              </View>
              <Text style={styles.dates}>
                {edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {skills.technical.length > 0 && (
            <Text style={styles.bodyText}>{skills.technical.join(', ')}</Text>
          )}
          {skills.soft.length > 0 && (
            <Text style={[styles.bodyText, { marginTop: 2 }]}>{skills.soft.join(', ')}</Text>
          )}
          {skills.languages.length > 0 && (
            <Text style={[styles.bodyText, { marginTop: 2 }]}>{skills.languages.join(', ')}</Text>
          )}
        </View>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <View style={styles.section}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
                <Text style={styles.bold}>{proj.name}</Text>
                {proj.link && <Link src={proj.link} style={styles.link}>Link</Link>}
              </View>
              {proj.description && <Text style={{ fontSize: 10, marginTop: 1 }}>{proj.description}</Text>}
              {proj.technologies && proj.technologies.length > 0 && (
                <Text style={[styles.light, { marginTop: 1 }]}>
                  {proj.technologies.join(', ')}
                </Text>
              )}
              {proj.bullets && proj.bullets.map((bullet, j) => (
                <View key={j} style={styles.bulletItem}>
                  <Text style={styles.bulletDash}>–</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <View style={styles.section}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Certifications</Text>
          {certifications.map((cert, i) => (
            <View key={i} style={[styles.row, { marginBottom: 3 }]}>
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <Text style={styles.bold}>{cert.name}</Text>
                {cert.issuer && <Text style={styles.light}> — {cert.issuer}</Text>}
                {cert.link && <Link src={cert.link} style={[styles.link, { marginLeft: 4 }]}>View</Link>}
              </View>
              {cert.date && <Text style={styles.dates}>{cert.date}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default MinimalPdf;
