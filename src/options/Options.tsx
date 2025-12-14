import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import type { Profile } from '../shared/types';
import { getProfile, saveProfile, exportProfile, importProfile } from '../shared/storage';

const emptyProfile: Profile = {
  basics: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  location: {
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  },
  links: {
    linkedin: '',
    github: '',
    portfolio: '',
    other: '',
  },
  workExperience: [],
  education: [],
  skills: [],
};

function Options() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const savedProfile = await getProfile();
      if (savedProfile) {
        setProfile(savedProfile);
      }
    } catch (err) {
      showStatus('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await saveProfile(profile);
      showStatus('success', 'Profile saved successfully!');
    } catch (err) {
      showStatus('error', 'Failed to save profile');
    }
  }

  async function handleExport() {
    try {
      const json = await exportProfile();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'job-autofill-profile.json';
      a.click();
      URL.revokeObjectURL(url);
      showStatus('success', 'Profile exported successfully!');
    } catch (err) {
      showStatus('error', 'Failed to export profile');
    }
  }

  async function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await importProfile(text);
        await loadProfile();
        showStatus('success', 'Profile imported successfully!');
      } catch (err) {
        showStatus('error', 'Failed to import profile');
      }
    };
    input.click();
  }

  function showStatus(type: 'success' | 'error', message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  }

  function updateBasics(field: keyof Profile['basics'], value: string) {
    setProfile(prev => ({
      ...prev,
      basics: { ...prev.basics, [field]: value },
    }));
  }

  function updateLocation(field: keyof Profile['location'], value: string) {
    setProfile(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  }

  function updateLinks(field: keyof Profile['links'], value: string) {
    setProfile(prev => ({
      ...prev,
      links: { ...prev.links, [field]: value },
    }));
  }

  function addWorkExperience() {
    setProfile(prev => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { company: '', title: '', startDate: '', endDate: '', location: '', summary: '' },
      ],
    }));
  }

  function removeWorkExperience(index: number) {
    setProfile(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
  }

  function updateWorkExperience(index: number, field: string, value: string) {
    setProfile(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  }

  function addEducation() {
    setProfile(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { school: '', degree: '', field: '', startDate: '', endDate: '' },
      ],
    }));
  }

  function removeEducation(index: number) {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  function updateEducation(index: number, field: string, value: string) {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  }

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Job Autofill Options</h1>
      <p className="subtitle">Set up your profile to autofill job applications</p>

      <div className="section">
        <h2>Basic Information</h2>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={profile.basics.firstName}
              onChange={(e) => updateBasics('firstName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={profile.basics.lastName}
              onChange={(e) => updateBasics('lastName', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profile.basics.email}
              onChange={(e) => updateBasics('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={profile.basics.phone}
              onChange={(e) => updateBasics('phone', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Location</h2>
        <div className="form-group">
          <label>Address Line 1</label>
          <input
            type="text"
            value={profile.location.address1}
            onChange={(e) => updateLocation('address1', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Address Line 2</label>
          <input
            type="text"
            value={profile.location.address2}
            onChange={(e) => updateLocation('address2', e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={profile.location.city}
              onChange={(e) => updateLocation('city', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>State/Province</label>
            <input
              type="text"
              value={profile.location.state}
              onChange={(e) => updateLocation('state', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Zip/Postal Code</label>
            <input
              type="text"
              value={profile.location.zip}
              onChange={(e) => updateLocation('zip', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              value={profile.location.country}
              onChange={(e) => updateLocation('country', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Links</h2>
        <div className="form-row">
          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="url"
              value={profile.links.linkedin}
              onChange={(e) => updateLinks('linkedin', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>GitHub</label>
            <input
              type="url"
              value={profile.links.github}
              onChange={(e) => updateLinks('github', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Portfolio</label>
            <input
              type="url"
              value={profile.links.portfolio}
              onChange={(e) => updateLinks('portfolio', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Other</label>
            <input
              type="url"
              value={profile.links.other}
              onChange={(e) => updateLinks('other', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Work Experience</h2>
        {profile.workExperience.map((exp, index) => (
          <div key={index} className="array-item">
            <div className="form-row">
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date (YYYY-MM)</label>
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Date (YYYY-MM or Present)</label>
                <input
                  type="text"
                  value={exp.endDate}
                  onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Summary</label>
              <textarea
                value={exp.summary}
                onChange={(e) => updateWorkExperience(index, 'summary', e.target.value)}
              />
            </div>
            <button className="remove-btn" onClick={() => removeWorkExperience(index)}>
              Remove
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={addWorkExperience}>
          Add Work Experience
        </button>
      </div>

      <div className="section">
        <h2>Education</h2>
        {profile.education.map((edu, index) => (
          <div key={index} className="array-item">
            <div className="form-row">
              <div className="form-group">
                <label>School</label>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Start Date (YYYY-MM)</label>
                <input
                  type="text"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>End Date (YYYY-MM)</label>
              <input
                type="text"
                value={edu.endDate}
                onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
              />
            </div>
            <button className="remove-btn" onClick={() => removeEducation(index)}>
              Remove
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={addEducation}>
          Add Education
        </button>
      </div>

      <div className="actions">
        <button className="primary-btn" onClick={handleSave}>
          Save Profile
        </button>
        <button className="secondary-btn" onClick={handleExport}>
          Export Profile
        </button>
        <button className="secondary-btn" onClick={handleImport}>
          Import Profile
        </button>
      </div>

      {status && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
