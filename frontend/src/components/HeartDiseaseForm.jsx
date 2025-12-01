import React, { useState } from 'react';
import './HeartDiseaseForm.css';

const HeartDiseaseForm = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '1',
    ap_hi: '',
    ap_lo: '',
    cholesterol: '1',
    gluc: '1',
    smoke: '0',
    alco: '0',
    active: '0',
    weight: '',
    height: '',
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {


      // Parse inputs
      let age = parseFloat(formData.age);
      const heightInMeters = parseFloat(formData.height) / 100;
      const weight = parseFloat(formData.weight);
      let ap_hi = parseFloat(formData.ap_hi);
      let ap_lo = parseFloat(formData.ap_lo);
      const gender = parseFloat(formData.gender);
      const cholesterol = parseFloat(formData.cholesterol);
      const gluc = parseFloat(formData.gluc);
      const smoke = parseFloat(formData.smoke);
      const alco = parseFloat(formData.alco);
      const active = parseFloat(formData.active);

      // Age outlier handling (matching notebook: if age < 39, replace with mean ~53)
      if (age < 39) {
        age = 53;
      }

      // Blood pressure swap (matching notebook preprocessing)
      if (ap_hi < ap_lo) {
        [ap_hi, ap_lo] = [ap_lo, ap_hi];
      }

      // Calculate derived features
      const bmi = weight / (heightInMeters * heightInMeters);
      const pulse_pressure = ap_hi - ap_lo;

      // Prepare features array in the EXACT order expected by the model
      // [age, gender, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active, BMI, pulse_pressure]
      const features = [
        age,
        gender,
        ap_hi,
        ap_lo,
        cholesterol,
        gluc,
        smoke,
        alco,
        active,
        bmi,
        pulse_pressure,
      ];

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Heart Disease Prediction</h2>
      <form onSubmit={handleSubmit} className="heart-form">
        <div className="form-grid">
          <div className="input-group">
            <label>Age (Years)</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} required placeholder="e.g. 50" />
          </div>

          <div className="input-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="1">Female</option>
              <option value="2">Male</option>
            </select>
          </div>

          <div className="input-group">
            <label>Systolic BP (ap_hi)</label>
            <input type="number" name="ap_hi" value={formData.ap_hi} onChange={handleChange} required placeholder="e.g. 120" />
          </div>

          <div className="input-group">
            <label>Diastolic BP (ap_lo)</label>
            <input type="number" name="ap_lo" value={formData.ap_lo} onChange={handleChange} required placeholder="e.g. 80" />
          </div>

          <div className="input-group">
            <label>Cholesterol</label>
            <select name="cholesterol" value={formData.cholesterol} onChange={handleChange}>
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>

          <div className="input-group">
            <label>Glucose</label>
            <select name="gluc" value={formData.gluc} onChange={handleChange}>
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>

          <div className="input-group">
            <label>Smoking</label>
            <select name="smoke" value={formData.smoke} onChange={handleChange}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div className="input-group">
            <label>Alcohol Intake</label>
            <select name="alco" value={formData.alco} onChange={handleChange}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div className="input-group">
            <label>Physical Activity</label>
            <select name="active" value={formData.active} onChange={handleChange}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div className="input-group">
            <label>Weight (kg)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} required placeholder="e.g. 70" />
          </div>

          <div className="input-group">
            <label>Height (cm)</label>
            <input type="number" name="height" value={formData.height} onChange={handleChange} required placeholder="e.g. 175" />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Analyzing...' : 'Predict Risk'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {prediction !== null && (
        <div className={`prediction-result ${prediction === 1 ? 'risk-high' : 'risk-low'}`}>
          <h3>Result</h3>
          <p>
            {prediction === 1
              ? 'High Risk of Cardiovascular Disease detected.'
              : 'Low Risk of Cardiovascular Disease detected.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default HeartDiseaseForm;
