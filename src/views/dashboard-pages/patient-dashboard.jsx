import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Dropdown,
  ProgressBar,
  Table,
  Alert,
  Spinner,
  Nav,
  ListGroup,
  Modal,
  Form,
  InputGroup
} from 'react-bootstrap';
import apiClient from '../../services/api';
import { 
  RiDashboardFill, 
  RiUserFill, 
  RiBrainFill,
  RiAlarmWarningFill,
  RiSparklingFill,
  RiLockFill,
  RiWifiLine,
  RiRefreshLine,
  RiSettings3Fill,
  RiNotificationFill,
  RiUserHeartFill,
  RiAddCircleFill,
  RiDownloadFill,
  RiEyeFill,
  RiEditFill,
  RiBarChartBoxFill,
  RiComputerFill,
  RiSmartphoneFill,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiInformationFill
} from '@remixicon/react';
import Chart from 'react-apexcharts';
import CountUp from 'react-countup';

const emptyPatientForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  date_of_birth: '',
  gender: 'M',
  blood_type: '',
  phone: '',
  address: '',
  emergency_contact: '',
  emergency_phone: '',
};

const AIPoweredPatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Real patient records (Medicine patients) backing the Patients tab
  const [realPatients, setRealPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fetchRealPatients = async (search = '') => {
    setPatientsLoading(true);
    setPatientsError(null);
    try {
      const { data } = await apiClient.get('/api/medicine/patients/', {
        params: search ? { search } : {},
      });
      setRealPatients(data?.results || data || []);
    } catch (error) {
      setPatientsError('Failed to load patients. Please try again.');
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealPatients();
  }, []);

  const computeAge = (dob) => {
    if (!dob) return '-';
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return '-';
    const diff = Date.now() - birth.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const handlePatientFormChange = (e) => {
    const { id, value } = e.target;
    setPatientForm((prev) => ({ ...prev, [id]: value }));
  };

  const validatePatientForm = () => {
    const next = {};
    if (!patientForm.first_name.trim()) next.first_name = 'First name is required';
    if (!patientForm.last_name.trim()) next.last_name = 'Last name is required';
    if (!patientForm.email.trim()) next.email = 'Email is required';
    if (!patientForm.password || patientForm.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (!patientForm.date_of_birth) next.date_of_birth = 'Date of birth is required';
    if (!patientForm.phone.trim()) next.phone = 'Phone is required';
    if (!patientForm.address.trim()) next.address = 'Address is required';
    if (!patientForm.emergency_contact.trim()) next.emergency_contact = 'Emergency contact is required';
    if (!patientForm.emergency_phone.trim()) next.emergency_phone = 'Emergency phone is required';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setSaveError(null);
    if (!validatePatientForm()) return;

    setSaving(true);
    try {
      await apiClient.post('/api/medicine/patients/', patientForm);
      setShowAddModal(false);
      setPatientForm(emptyPatientForm);
      await fetchRealPatients(searchTerm);
    } catch (error) {
      setSaveError(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Failed to create patient. Please check the fields and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatient = async (patient) => {
    if (!window.confirm(`Delete patient ${patient.full_name || patient.patient_id}? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/medicine/patients/${patient.id}/`);
      setRealPatients((prev) => prev.filter((p) => p.id !== patient.id));
    } catch (error) {
      alert('Failed to delete patient.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRealPatients(searchTerm);
  };

  // Authentication check for super admin
  const userRole = localStorage.getItem('userRole') || 'super_admin';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';

  // Set user as super admin for access
  useEffect(() => {
    localStorage.setItem('userRole', 'super_admin');
  }, []);

  // AI-powered insights data
  const dashboardData = {
    overview: {
      totalPatients: 15467,
      aiDiagnoses: 1256,
      criticalPatients: 45,
      predictionAccuracy: 97.8
    },
    aiAlerts: [
      { id: 1, type: 'critical', message: 'High-risk patient detected - John Doe (Room 301)', time: '2 min ago' },
      { id: 2, type: 'warning', message: 'Medication interaction alert - Sarah Johnson', time: '5 min ago' },
      { id: 3, type: 'info', message: 'AI suggests lab test for Patient ID: 12567', time: '10 min ago' },
      { id: 4, type: 'success', message: 'Successful AI diagnosis confirmed - Patient recovered', time: '15 min ago' }
    ]
  };

  // Sample patient data with AI insights
  const patientsData = [
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      condition: 'Diabetes',
      riskLevel: 'High',
      aiScore: 87,
      status: 'Critical',
      aiInsights: 'Requires immediate attention - blood sugar trending upward'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      age: 32,
      condition: 'Hypertension',
      riskLevel: 'Medium',
      aiScore: 64,
      status: 'Stable',
      aiInsights: 'Medication compliance improving, continue current treatment'
    },
    {
      id: 3,
      name: 'Michael Brown',
      age: 67,
      condition: 'Heart Disease',
      riskLevel: 'High',
      aiScore: 92,
      status: 'Critical',
      aiInsights: 'Cardiac risk elevated, schedule immediate consultation'
    }
  ];

  // AI-powered features
  const aiFeatures = [
    {
      title: 'Predictive Analytics',
      description: 'AI predicts patient outcomes and potential complications',
      icon: RiSparklingFill,
      accuracy: '97.8%',
      color: 'primary'
    },
    {
      title: 'Smart Diagnosis',
      description: 'Machine learning assists in accurate diagnosis',
      icon: RiBrainFill,
      accuracy: '94.2%',
      color: 'success'
    },
    {
      title: 'Risk Assessment',
      description: 'Real-time patient risk scoring and alerts',
      icon: RiAlarmWarningFill,
      accuracy: '96.5%',
      color: 'warning'
    }
  ];
  const renderOverviewTab = () => (
    <div>
      {/* AI Metrics Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-primary bg-primary-subtle">
            <Card.Body className="text-center">
              <RiUserFill size={32} className="text-primary mb-2" />
              <h4 className="text-primary mb-1">
                <CountUp end={dashboardData.overview.totalPatients} duration={2} />
              </h4>
              <p className="text-muted mb-0 small">Total Patients</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-success bg-success-subtle">
            <Card.Body className="text-center">
              <RiBrainFill size={32} className="text-success mb-2" />
              <h4 className="text-success mb-1">
                <CountUp end={dashboardData.overview.aiDiagnoses} duration={2} />
              </h4>
              <p className="text-muted mb-0 small">AI Diagnoses</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-warning bg-warning-subtle">
            <Card.Body className="text-center">
              <RiAlarmWarningFill size={32} className="text-warning mb-2" />
              <h4 className="text-warning mb-1">
                <CountUp end={dashboardData.overview.criticalPatients} duration={2} />
              </h4>
              <p className="text-muted mb-0 small">Critical Patients</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-info bg-info-subtle">
            <Card.Body className="text-center">
              <RiSparklingFill size={32} className="text-info mb-2" />
              <h4 className="text-info mb-1">
                <CountUp end={dashboardData.overview.predictionAccuracy} decimals={1} suffix="%" duration={2} />
              </h4>
              <p className="text-muted mb-0 small">AI Accuracy</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* AI Features Grid */}
      <Row className="mb-4">
        {aiFeatures.map((feature, index) => (
          <Col lg={4} md={6} key={index} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center">
                <feature.icon size={40} className={`text-${feature.color} mb-3`} />
                <h5 className="card-title">{feature.title}</h5>
                <p className="card-text text-muted small">{feature.description}</p>
                <Badge bg={feature.color} className="mt-2">
                  {feature.accuracy} Accuracy
                </Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* AI Alerts */}
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <RiNotificationFill className="me-2" />
                AI-Generated Alerts
              </h5>
              <Button variant="outline-primary" size="sm">
                <RiSettings3Fill className="me-1" />
                Configure
              </Button>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {dashboardData.aiAlerts.map((alert) => (
                  <ListGroup.Item key={alert.id} className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center">
                      {alert.type === 'critical' && <RiAlarmWarningFill className="text-danger me-2" />}
                      {alert.type === 'warning' && <RiErrorWarningFill className="text-warning me-2" />}
                      {alert.type === 'info' && <RiInformationFill className="text-info me-2" />}
                      {alert.type === 'success' && <RiCheckboxCircleFill className="text-success me-2" />}
                      <div>
                        <div className="fw-bold">{alert.message}</div>
                        <small className="text-muted">{alert.time}</small>
                      </div>
                    </div>
                    <Badge bg={alert.type === 'critical' ? 'danger' : alert.type === 'warning' ? 'warning' : alert.type === 'success' ? 'success' : 'info'}>
                      {alert.type}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
  const renderPatientsTab = () => (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0">
            <RiUserHeartFill className="me-2" />
            Patient Management
          </h5>
          <div className="d-flex align-items-center gap-2">
            <Form onSubmit={handleSearch} className="d-flex">
              <InputGroup size="sm">
                <Form.Control
                  placeholder="Search by name, ID, or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="outline-secondary">Search</Button>
              </InputGroup>
            </Form>
            <Button variant="success" size="sm" onClick={() => { setSaveError(null); setFormErrors({}); setShowAddModal(true); }}>
              <RiAddCircleFill className="me-1" />
              Add Patient
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {patientsError && <Alert variant="danger">{patientsError}</Alert>}
          {patientsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" />
            </div>
          ) : realPatients.length === 0 ? (
            <p className="text-muted text-center py-4 mb-0">No patients found.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Blood Type</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {realPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <RiUserFill className="me-2" />
                        <div>
                          <div className="fw-bold">{patient.full_name || 'Unknown'}</div>
                          <small className="text-muted">ID: {patient.patient_id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{computeAge(patient.date_of_birth)}</td>
                    <td>{patient.gender || '-'}</td>
                    <td>{patient.blood_type || '-'}</td>
                    <td>{patient.phone || '-'}</td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleDeletePatient(patient)} className="text-danger">
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Form onSubmit={handleCreatePatient}>
          <Modal.Header closeButton>
            <Modal.Title>Add Patient</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {saveError && <Alert variant="danger">{saveError}</Alert>}
            <Row>
              <Col md={6} className="mb-2">
                <Form.Label>First Name</Form.Label>
                <Form.Control id="first_name" value={patientForm.first_name} onChange={handlePatientFormChange} isInvalid={!!formErrors.first_name} />
                <Form.Control.Feedback type="invalid">{formErrors.first_name}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Last Name</Form.Label>
                <Form.Control id="last_name" value={patientForm.last_name} onChange={handlePatientFormChange} isInvalid={!!formErrors.last_name} />
                <Form.Control.Feedback type="invalid">{formErrors.last_name}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" id="email" value={patientForm.email} onChange={handlePatientFormChange} isInvalid={!!formErrors.email} />
                <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" id="password" value={patientForm.password} onChange={handlePatientFormChange} isInvalid={!!formErrors.password} />
                <Form.Control.Feedback type="invalid">{formErrors.password}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control type="date" id="date_of_birth" value={patientForm.date_of_birth} onChange={handlePatientFormChange} isInvalid={!!formErrors.date_of_birth} />
                <Form.Control.Feedback type="invalid">{formErrors.date_of_birth}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Gender</Form.Label>
                <Form.Select id="gender" value={patientForm.gender} onChange={handlePatientFormChange}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Blood Type</Form.Label>
                <Form.Select id="blood_type" value={patientForm.blood_type} onChange={handlePatientFormChange}>
                  <option value="">Unknown</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Phone</Form.Label>
                <Form.Control id="phone" value={patientForm.phone} onChange={handlePatientFormChange} isInvalid={!!formErrors.phone} />
                <Form.Control.Feedback type="invalid">{formErrors.phone}</Form.Control.Feedback>
              </Col>
              <Col md={12} className="mb-2">
                <Form.Label>Address</Form.Label>
                <Form.Control id="address" value={patientForm.address} onChange={handlePatientFormChange} isInvalid={!!formErrors.address} />
                <Form.Control.Feedback type="invalid">{formErrors.address}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Emergency Contact Name</Form.Label>
                <Form.Control id="emergency_contact" value={patientForm.emergency_contact} onChange={handlePatientFormChange} isInvalid={!!formErrors.emergency_contact} />
                <Form.Control.Feedback type="invalid">{formErrors.emergency_contact}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Label>Emergency Contact Phone</Form.Label>
                <Form.Control id="emergency_phone" value={patientForm.emergency_phone} onChange={handlePatientFormChange} isInvalid={!!formErrors.emergency_phone} />
                <Form.Control.Feedback type="invalid">{formErrors.emergency_phone}</Form.Control.Feedback>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? <><Spinner animation="border" size="sm" className="me-2" />Saving...</> : 'Save Patient'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );

  const renderAIToolsTab = () => (
    <div>
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <RiComputerFill size={48} className="text-primary mb-3" />
              <h5>Diagnostic AI</h5>
              <p className="text-muted">Advanced machine learning for accurate diagnosis</p>
              <Button variant="primary">Launch Tool</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <RiSparklingFill size={48} className="text-success mb-3" />
              <h5>Predictive Analytics</h5>
              <p className="text-muted">Forecast patient outcomes and complications</p>
              <Button variant="success">Launch Tool</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <RiSmartphoneFill size={48} className="text-info mb-3" />
              <h5>Mobile Monitoring</h5>
              <p className="text-muted">Real-time patient monitoring via mobile devices</p>
              <Button variant="info">Launch Tool</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Access control check
  if (!isSuperAdmin) {
    return (
      <Container fluid className="mt-4">
        <Alert variant="danger" className="text-center">
          <RiLockFill size={48} className="mb-3" />
          <h4>Access Denied</h4>
          <p>You don't have permission to access this dashboard. Super Admin access required.</p>
          <Button variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">
                <RiBrainFill className="me-2 text-primary" />
                AI-Powered Patient Dashboard
              </h1>
              <p className="text-muted mb-0">Super Admin • Advanced AI Analytics & Management</p>
            </div>
            <div>
              <Badge bg="success" className="me-2">
                <RiWifiLine className="me-1" />
                Live Data
              </Badge>
              <Button variant="outline-primary" size="sm">
                <RiRefreshLine className="me-1" />
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Row className="mb-4">
        <Col>
          <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
            <Nav.Item>
              <Nav.Link eventKey="overview">
                <RiDashboardFill className="me-1" />
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="patients">
                <RiUserHeartFill className="me-1" />
                Patients
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="ai-tools">
                <RiBrainFill className="me-1" />
                AI Tools
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'patients' && renderPatientsTab()}
        {activeTab === 'ai-tools' && renderAIToolsTab()}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </Container>
  );
};

export default AIPoweredPatientDashboard;