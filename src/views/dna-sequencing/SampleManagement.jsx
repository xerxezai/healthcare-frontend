import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Modal, Form, Dropdown, Pagination, InputGroup, ProgressBar } from 'react-bootstrap';
import apiClient from '../../services/api';

const getTodayISO = () => new Date().toISOString().slice(0, 10);

const SampleManagement = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [samplesPerPage] = useState(10);

  // New Sample modal
  const [showNewSampleModal, setShowNewSampleModal] = useState(false);
  const [newSampleForm, setNewSampleForm] = useState({
    patient_name: '', patient_id: '', sample_type: 'Blood',
    sequencing_type: 'Whole Genome Sequencing', priority: 'normal',
    collection_date: getTodayISO(), notes: ''
  });
  const [newSampleSubmitting, setNewSampleSubmitting] = useState(false);
  const [newSampleError, setNewSampleError] = useState('');

  // Batch Upload modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [batchError, setBatchError] = useState('');

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/dna-sequencing/api/samples/');
      setSamples(response.data);
      setBackendOnline(true);
    } catch (error) {
      console.error('Failed to fetch samples:', error);
      console.log('Loading demo data for sample management...');
      
      // Demo data when backend is unavailable
      const demoSamples = [
        {
          id: 1,
          sample_id: 'DNA-2024-001',
          patient_name: 'Alice Johnson',
          status: 'Complete',
          priority: 'High',
          sample_type: 'Blood',
          collection_date: '2024-08-01',
          received_date: '2024-08-02',
          analysis_type: 'Whole Genome Sequencing',
          progress: 100,
          quality_score: 98.5,
          notes: 'High quality sample, analysis completed successfully'
        },
        {
          id: 2,
          sample_id: 'DNA-2024-002',
          patient_name: 'Bob Smith',
          status: 'Processing',
          priority: 'Medium',
          sample_type: 'Saliva',
          collection_date: '2024-08-03',
          received_date: '2024-08-04',
          analysis_type: 'Exome Sequencing',
          progress: 65,
          quality_score: null,
          notes: 'Currently in sequencing phase'
        },
        {
          id: 3,
          sample_id: 'DNA-2024-003',
          patient_name: 'Carol Davis',
          status: 'Received',
          priority: 'Low',
          sample_type: 'Tissue',
          collection_date: '2024-08-05',
          received_date: '2024-08-06',
          analysis_type: 'Targeted Panel',
          progress: 15,
          quality_score: null,
          notes: 'Sample received, preparing for extraction'
        },
        {
          id: 4,
          sample_id: 'DNA-2024-004',
          patient_name: 'David Wilson',
          status: 'QC Failed',
          priority: 'High',
          sample_type: 'Blood',
          collection_date: '2024-08-02',
          received_date: '2024-08-03',
          analysis_type: 'Pharmacogenomics',
          progress: 30,
          quality_score: 45.2,
          notes: 'Low DNA yield, requesting new sample'
        },
        {
          id: 5,
          sample_id: 'DNA-2024-005',
          patient_name: 'Eva Martinez',
          status: 'Analysis',
          priority: 'Medium',
          sample_type: 'Blood',
          collection_date: '2024-08-04',
          received_date: '2024-08-05',
          analysis_type: 'Whole Genome Sequencing',
          progress: 85,
          quality_score: 96.8,
          notes: 'Final analysis in progress'
        }
      ];
      
      setSamples(demoSamples);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Received': return 'secondary';
      case 'Processing': return 'warning';
      case 'Sequencing': return 'info';
      case 'Analysis': return 'primary';
      case 'Complete': return 'success';
      case 'QC Failed': return 'danger';
      case 'On Hold': return 'dark';
      default: return 'light';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'Urgent': return 'danger';
      case 'High': return 'warning';
      case 'Normal': return 'info';
      case 'Low': return 'secondary';
      default: return 'light';
    }
  };

  const getProgressVariant = (progress) => {
    if (progress >= 90) return 'success';
    if (progress >= 60) return 'info';
    if (progress >= 30) return 'warning';
    return 'danger';
  };

  // Filter samples based on search term and status
  const filteredSamples = samples.filter(sample => {
    const matchesSearch = sample.sample_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sample.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sample.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastSample = currentPage * samplesPerPage;
  const indexOfFirstSample = indexOfLastSample - samplesPerPage;
  const currentSamples = filteredSamples.slice(indexOfFirstSample, indexOfLastSample);
  const totalPages = Math.ceil(filteredSamples.length / samplesPerPage);

  const handleSampleClick = (sample) => {
    setSelectedSample(sample);
    setShowSampleModal(true);
  };

  // Maps the display labels used by the status-update dropdown to the
  // backend's actual status keys.
  const STATUS_KEY_MAP = {
    'Processing': 'processing',
    'On Hold': 'on_hold',
  };

  const handleStatusUpdate = async (sampleId, newStatusLabel) => {
    const statusKey = STATUS_KEY_MAP[newStatusLabel] || newStatusLabel;
    try {
      const response = await apiClient.post(`/dna-sequencing/api/samples/${sampleId}/status/`, {
        status: statusKey,
      });
      const updated = response.data.sample;
      setSamples(prev => prev.map(sample =>
        sample.id === sampleId ? { ...sample, ...updated } : sample
      ));
    } catch (error) {
      console.error('Failed to update sample status:', error);
      alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleNewSampleChange = (e) => {
    const { name, value } = e.target;
    setNewSampleForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNewSampleSubmit = async (e) => {
    e.preventDefault();
    setNewSampleError('');
    if (!newSampleForm.patient_name.trim()) {
      setNewSampleError('Patient name is required.');
      return;
    }
    setNewSampleSubmitting(true);
    try {
      await apiClient.post('/dna-sequencing/api/samples/register/', newSampleForm);
      setShowNewSampleModal(false);
      setNewSampleForm({
        patient_name: '', patient_id: '', sample_type: 'Blood',
        sequencing_type: 'Whole Genome Sequencing', priority: 'normal',
        collection_date: getTodayISO(), notes: ''
      });
      fetchSamples();
    } catch (error) {
      console.error('Failed to register sample:', error);
      setNewSampleError(error.response?.data?.message || error.message);
    } finally {
      setNewSampleSubmitting(false);
    }
  };

  // Batch Upload: each line is "patient_name, sample_type, sequencing_type, priority"
  const parseBatchText = (text) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [patient_name, sample_type, sequencing_type, priority] = line.split(',').map(v => (v || '').trim());
        return { patient_name, sample_type, sequencing_type, priority: priority || 'normal' };
      });
  };

  const handleBatchFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setBatchText(event.target.result);
    reader.readAsText(file);
  };

  const handleBatchUploadSubmit = async () => {
    setBatchError('');
    setBatchResult(null);
    const entries = parseBatchText(batchText);
    if (entries.length === 0) {
      setBatchError('Add at least one sample line: patient_name, sample_type, sequencing_type, priority');
      return;
    }
    setBatchSubmitting(true);
    try {
      const response = await apiClient.post('/dna-sequencing/api/samples/batch/', { samples: entries });
      setBatchResult(response.data);
      fetchSamples();
      if (response.data.error_count === 0) {
        setBatchText('');
      }
    } catch (error) {
      console.error('Batch upload failed:', error);
      setBatchError(error.response?.data?.message || error.message);
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleDownloadReport = async (sample) => {
    try {
      const response = await apiClient.post('/dna-sequencing/api/export/pdf/', {
        sample_id: sample.sample_id,
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sample.sample_id}_report.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert(`Failed to download report: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading samples...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">🧪 Sample Management</h2>
              <p className="text-muted">Track and manage DNA sequencing samples through the pipeline</p>
            </div>
            <div>
              <Button variant="primary" className="me-2" onClick={() => setShowNewSampleModal(true)}>
                <i className="ri-add-line me-1"></i>New Sample
              </Button>
              <Button variant="outline-success" onClick={() => { setBatchResult(null); setBatchError(''); setShowBatchModal(true); }}>
                <i className="ri-upload-line me-1"></i>Batch Upload
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Sample Statistics Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                  <i className="ri-test-tube-line text-primary fs-4"></i>
                </div>
              </div>
              <h4 className="mb-1">{samples.length}</h4>
              <p className="text-muted mb-0">Total Samples</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="rounded-circle bg-info bg-opacity-10 p-3">
                  <i className="ri-timer-line text-info fs-4"></i>
                </div>
              </div>
              <h4 className="mb-1">{samples.filter(s => s.status === 'Sequencing').length}</h4>
              <p className="text-muted mb-0">In Sequencing</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="rounded-circle bg-success bg-opacity-10 p-3">
                  <i className="ri-check-line text-success fs-4"></i>
                </div>
              </div>
              <h4 className="mb-1">{samples.filter(s => s.status === 'Complete').length}</h4>
              <p className="text-muted mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                  <i className="ri-alert-line text-warning fs-4"></i>
                </div>
              </div>
              <h4 className="mb-1">{samples.filter(s => s.priority === 'Urgent' || s.priority === 'High').length}</h4>
              <p className="text-muted mb-0">High Priority</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="ri-search-line"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by Sample ID, Patient Name, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Received">Received</option>
                <option value="Processing">Processing</option>
                <option value="Sequencing">Sequencing</option>
                <option value="Analysis">Analysis</option>
                <option value="Complete">Complete</option>
                <option value="QC Failed">QC Failed</option>
                <option value="On Hold">On Hold</option>
              </Form.Select>
            </Col>
            <Col md={5} className="text-end">
              <small className="text-muted">
                Showing {currentSamples.length} of {filteredSamples.length} samples
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Samples Table */}
      <Card className="border-0 shadow-sm">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Sample ID</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Platform</th>
                <th>Completion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSamples.map((sample) => (
                <tr key={sample.id} style={{ cursor: 'pointer' }}>
                  <td 
                    onClick={() => handleSampleClick(sample)}
                    className="fw-bold text-primary"
                  >
                    {sample.sample_id}
                  </td>
                  <td onClick={() => handleSampleClick(sample)}>
                    <div>
                      <div className="fw-semibold">{sample.patient_name}</div>
                      <small className="text-muted">{sample.patient_id}</small>
                    </div>
                  </td>
                  <td onClick={() => handleSampleClick(sample)}>
                    <div>
                      <div>{sample.sample_type}</div>
                      <small className="text-muted">{sample.sequencing_type}</small>
                    </div>
                  </td>
                  <td onClick={() => handleSampleClick(sample)}>
                    <Badge bg={getPriorityBadgeVariant(sample.priority)}>
                      {sample.priority}
                    </Badge>
                  </td>
                  <td onClick={() => handleSampleClick(sample)}>
                    <Badge bg={getStatusBadgeVariant(sample.status)}>
                      {sample.status}
                    </Badge>
                  </td>
                  <td onClick={() => handleSampleClick(sample)}>
                    <div style={{ width: '120px' }}>
                      <ProgressBar 
                        variant={getProgressVariant(sample.progress)} 
                        now={sample.progress} 
                        label={`${sample.progress}%`}
                        style={{ height: '20px' }}
                      />
                    </div>
                  </td>
                  <td onClick={() => handleSampleClick(sample)}>
                    <small>{sample.platform}</small>
                  </td>
                  <td onClick={() => handleSampleClick(sample)}>
                    <small>
                      {sample.completion_date || sample.estimated_completion}
                    </small>
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="ri-more-line"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleSampleClick(sample)}>
                          <i className="ri-eye-line me-2"></i>View Details
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(sample.id, 'Processing')}>
                          <i className="ri-play-line me-2"></i>Start Processing
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate(sample.id, 'On Hold')}>
                          <i className="ri-pause-line me-2"></i>Put On Hold
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handleDownloadReport(sample)}>
                          <i className="ri-download-line me-2"></i>Download Report
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer className="d-flex justify-content-center">
            <Pagination>
              <Pagination.First 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1} 
              />
              <Pagination.Prev 
                onClick={() => setCurrentPage(currentPage - 1)} 
                disabled={currentPage === 1} 
              />
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (page === currentPage || 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <Pagination.Ellipsis key={page} />;
                }
                return null;
              })}
              
              <Pagination.Next 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={currentPage === totalPages} 
              />
              <Pagination.Last 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages} 
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Sample Detail Modal */}
      <Modal show={showSampleModal} onHide={() => setShowSampleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-test-tube-line me-2"></i>
            Sample Details: {selectedSample?.sample_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSample && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Patient Information</h6>
                  <p><strong>Name:</strong> {selectedSample.patient_name}</p>
                  <p><strong>Patient ID:</strong> {selectedSample.patient_id}</p>
                  <p><strong>Collection Date:</strong> {selectedSample.collection_date}</p>
                  
                  <h6 className="mt-4">Sample Information</h6>
                  <p><strong>Sample Type:</strong> {selectedSample.sample_type}</p>
                  <p><strong>Priority:</strong> 
                    <Badge bg={getPriorityBadgeVariant(selectedSample.priority)} className="ms-2">
                      {selectedSample.priority}
                    </Badge>
                  </p>
                  <p><strong>Current Status:</strong> 
                    <Badge bg={getStatusBadgeVariant(selectedSample.status)} className="ms-2">
                      {selectedSample.status}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Sequencing Details</h6>
                  <p><strong>Sequencing Type:</strong> {selectedSample.sequencing_type}</p>
                  <p><strong>Platform:</strong> {selectedSample.platform}</p>
                  <p><strong>Technician:</strong> {selectedSample.technician}</p>
                  <p><strong>Estimated Completion:</strong> {selectedSample.estimated_completion}</p>
                  {selectedSample.completion_date && (
                    <p><strong>Actual Completion:</strong> {selectedSample.completion_date}</p>
                  )}
                  
                  <h6 className="mt-4">Progress</h6>
                  <ProgressBar 
                    variant={getProgressVariant(selectedSample.progress)} 
                    now={selectedSample.progress} 
                    label={`${selectedSample.progress}%`}
                    style={{ height: '25px' }}
                  />
                </Col>
              </Row>
              
              {selectedSample.notes && (
                <Row className="mt-4">
                  <Col>
                    <h6>Notes</h6>
                    <Alert variant="info">
                      {selectedSample.notes}
                    </Alert>
                  </Col>
                </Row>
              )}

              {selectedSample.failure_reason && (
                <Row className="mt-3">
                  <Col>
                    <h6>Failure Information</h6>
                    <Alert variant="danger">
                      <strong>Reason:</strong> {selectedSample.failure_reason}
                    </Alert>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowSampleModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            <i className="ri-edit-line me-1"></i>Edit Sample
          </Button>
          {selectedSample?.status === 'Complete' && (
            <Button variant="success" onClick={() => handleDownloadReport(selectedSample)}>
              <i className="ri-download-line me-1"></i>Download Report
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* New Sample Modal */}
      <Modal show={showNewSampleModal} onHide={() => setShowNewSampleModal(false)} centered>
        <Form onSubmit={handleNewSampleSubmit} noValidate>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>
              <i className="ri-add-circle-line me-2 text-primary"></i>New Sample
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-4">
            {newSampleError && (
              <Alert variant="danger" className="d-flex align-items-center">
                <i className="ri-error-warning-line me-2"></i>{newSampleError}
              </Alert>
            )}

            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="ri-user-line me-1"></i>Patient Information
            </h6>
            <Form.Group className="mb-3">
              <Form.Label>
                Patient Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="patient_name"
                placeholder="e.g. Jane Doe"
                value={newSampleForm.patient_name}
                onChange={handleNewSampleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Patient ID</Form.Label>
              <Form.Control
                type="text"
                name="patient_id"
                placeholder="e.g. P-00123 (optional)"
                value={newSampleForm.patient_id}
                onChange={handleNewSampleChange}
              />
            </Form.Group>

            <h6 className="text-uppercase text-muted small fw-bold mb-3">
              <i className="ri-test-tube-line me-1"></i>Sample Details
            </h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sample Type</Form.Label>
                  <Form.Select name="sample_type" value={newSampleForm.sample_type} onChange={handleNewSampleChange}>
                    <option>Blood</option>
                    <option>Saliva</option>
                    <option>Tissue</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sequencing Type</Form.Label>
                  <Form.Select name="sequencing_type" value={newSampleForm.sequencing_type} onChange={handleNewSampleChange}>
                    <option>Whole Genome Sequencing</option>
                    <option>Exome Sequencing</option>
                    <option>Targeted Panel</option>
                    <option>Pharmacogenomics</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select name="priority" value={newSampleForm.priority} onChange={handleNewSampleChange}>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Collection Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="collection_date"
                    value={newSampleForm.collection_date}
                    onChange={handleNewSampleChange}
                  />
                  <Form.Text className="text-muted">Defaults to today.</Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                placeholder="Any additional details about this sample (optional)"
                value={newSampleForm.notes}
                onChange={handleNewSampleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" onClick={() => setShowNewSampleModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={newSampleSubmitting}>
              {newSampleSubmitting ? 'Creating...' : 'Create Sample'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Batch Upload Modal */}
      <Modal show={showBatchModal} onHide={() => setShowBatchModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="ri-upload-line me-2"></i>Batch Upload Samples
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {batchError && <Alert variant="danger">{batchError}</Alert>}
          {batchResult && (
            <Alert variant={batchResult.error_count ? 'warning' : 'success'}>
              {batchResult.created_count} sample(s) created.
              {batchResult.error_count > 0 && (
                <>
                  <br />{batchResult.error_count} row(s) had errors:
                  <ul className="mb-0">
                    {batchResult.errors.map((e, i) => (
                      <li key={i}>Row {e.row}: {e.error}</li>
                    ))}
                  </ul>
                </>
              )}
            </Alert>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Upload a file (one sample per line), or paste below</Form.Label>
            <Form.Control type="file" accept=".csv,.txt" onChange={handleBatchFileChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>
              Samples (one per line: <code>patient_name, sample_type, sequencing_type, priority</code>)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder={'Jane Doe, Blood, Whole Genome Sequencing, high\nJohn Roe, Saliva, Exome Sequencing, normal'}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowBatchModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={handleBatchUploadSubmit} disabled={batchSubmitting}>
            {batchSubmitting ? 'Uploading...' : 'Upload Samples'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SampleManagement;
