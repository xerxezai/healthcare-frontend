import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import ProtectedRoute from "../../components/common/ProtectedRoute";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import apiClient from "../../services/api";

//Images
import img11 from "/assets/images/user/11.png"

const SPECIALIZATIONS = [
    ['general', 'General Medicine'], ['emergency', 'Emergency Medicine'], ['internal', 'Internal Medicine'],
    ['family', 'Family Medicine'], ['cardiology', 'Cardiology'], ['pulmonology', 'Pulmonology'],
    ['gastroenterology', 'Gastroenterology'], ['nephrology', 'Nephrology'], ['endocrinology', 'Endocrinology'],
    ['rheumatology', 'Rheumatology'], ['hematology', 'Hematology'], ['oncology', 'Oncology'],
    ['neurology', 'Neurology'], ['psychiatry', 'Psychiatry'], ['geriatrics', 'Geriatrics'],
    ['intensive_care', 'Intensive Care Medicine'],
];

const QUALIFICATIONS = ['MBBS', 'MD', 'DO', 'DNB', 'DM', 'MCh', 'FRCP', 'FACS'];

const AddDoctor = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        license_number: '',
        specialization: 'general',
        qualification: 'MBBS',
        years_experience: '',
        education: '',
        certifications: '',
        hospital_affiliation: '',
        consultation_fee: '',
        is_available_emergency: false,
        bio: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(img11);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProfileImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const validate = () => {
        const next = {};
        if (!formData.first_name.trim()) next.first_name = 'First name is required';
        if (!formData.last_name.trim()) next.last_name = 'Last name is required';
        if (!formData.email.trim()) next.email = 'Email is required';
        if (!formData.password || formData.password.length < 8) next.password = 'Password must be at least 8 characters';
        if (!formData.license_number.trim()) next.license_number = 'License number is required';
        if (!formData.education.trim()) next.education = 'Education is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setSuccess(false);
        if (!validate()) return;

        setSubmitting(true);
        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, value === true ? 'true' : value === false ? 'false' : value);
            });
            if (profileImage) {
                payload.append('profile_picture', profileImage);
            }

            await apiClient.post('/api/medicine/doctors/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess(true);
            setTimeout(() => navigate('/doctor/doctor-list'), 1200);
        } catch (error) {
            setSubmitError(
                error.response?.data?.error ||
                error.response?.data?.detail ||
                'Failed to create doctor. Please check the fields and try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/doctor/doctor-list');
    };

    return (
        <>
            {success && (
                <Alert variant="success">Doctor created successfully. Redirecting to the doctor list...</Alert>
            )}
            {submitError && (
                <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>{submitError}</Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col lg={3}>
                        <Card>
                            <Card.Header className="d-flex justify-content-between">
                                <Card.Header.Title>
                                    <h4 className="card-title">Profile</h4>
                                </Card.Header.Title>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="form-group">
                                    <Container className="d-flex flex-column align-items-center py-5">
                                        <div className="text-center">
                                            <img className="profile-pic img-fluid rounded-circle mb-3" src={previewUrl} alt="profile-pic" style={{ width: "150px", height: "150px", objectFit: "cover" }} />
                                            <div>
                                                <Button type="button" className="btn btn-primary rounded-1" onClick={() => document.getElementById('file-upload').click()}>Profile Upload</Button>
                                                <input id="file-upload" className="d-none" type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} />
                                            </div>
                                        </div>
                                        <div className="mt-3 text-center">
                                            <span>Only .jpg, .png, .jpeg allowed</span>
                                        </div>
                                    </Container>
                                </Form.Group>
                                <Form.Group className="form-group cust-form-input">
                                    <Form.Label className="mb-0">Specialization:</Form.Label>
                                    <Form.Select className="my-2" id="specialization" value={formData.specialization} onChange={handleChange}>
                                        {SPECIALIZATIONS.map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="form-group cust-form-input">
                                    <Form.Label className="mb-0">Qualification:</Form.Label>
                                    <Form.Select className="my-2" id="qualification" value={formData.qualification} onChange={handleChange}>
                                        {QUALIFICATIONS.map((q) => (
                                            <option key={q} value={q}>{q}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="form-group cust-form-input">
                                    <Form.Label htmlFor="years_experience" className="mb-0">Years of Experience:</Form.Label>
                                    <Form.Control type="number" min="0" className="my-2" id="years_experience" placeholder="Years of Experience" value={formData.years_experience} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="form-group cust-form-input">
                                    <Form.Label htmlFor="consultation_fee" className="mb-0">Consultation Fee:</Form.Label>
                                    <Form.Control type="number" min="0" step="0.01" className="my-2" id="consultation_fee" placeholder="Consultation Fee" value={formData.consultation_fee} onChange={handleChange} />
                                </Form.Group>
                                <div className="custom-control custom-checkbox mb-2 d-flex align-items-center gap-2">
                                    <input type="checkbox" className="custom-control-input" id="is_available_emergency" checked={formData.is_available_emergency} onChange={handleChange} />
                                    <label className="custom-control-label mb-0" htmlFor="is_available_emergency">Available for Emergency</label>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={9}>
                        <Card>
                            <Card.Header className="d-flex justify-content-between">
                                <Card.Header.Title>
                                    <h4 className="card-title">Doctor Information</h4>
                                </Card.Header.Title>
                            </Card.Header>
                            <Card.Body>
                                <div className="new-user-info">
                                    <Row className="cust-form-input">
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="first_name" className="mb-0">First Name:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} isInvalid={!!errors.first_name} />
                                            <Form.Control.Feedback type="invalid">{errors.first_name}</Form.Control.Feedback>
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="last_name" className="mb-0">Last Name:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} isInvalid={!!errors.last_name} />
                                            <Form.Control.Feedback type="invalid">{errors.last_name}</Form.Control.Feedback>
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="email" className="mb-0">Email:</Form.Label>
                                            <Form.Control type="email" className="my-2" id="email" placeholder="Email" value={formData.email} onChange={handleChange} isInvalid={!!errors.email} />
                                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="password" className="mb-0">Password:</Form.Label>
                                            <Form.Control type="password" className="my-2" id="password" placeholder="Password (min 8 characters)" value={formData.password} onChange={handleChange} isInvalid={!!errors.password} />
                                            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="license_number" className="mb-0">License Number:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="license_number" placeholder="License Number" value={formData.license_number} onChange={handleChange} isInvalid={!!errors.license_number} />
                                            <Form.Control.Feedback type="invalid">{errors.license_number}</Form.Control.Feedback>
                                        </Col>
                                        <Col md={6} className="form-group">
                                            <Form.Label htmlFor="hospital_affiliation" className="mb-0">Hospital Affiliation:</Form.Label>
                                            <Form.Control type="text" className="my-2" id="hospital_affiliation" placeholder="Hospital Affiliation" value={formData.hospital_affiliation} onChange={handleChange} />
                                        </Col>
                                        <Col sm={12} className="form-group">
                                            <Form.Label htmlFor="education" className="mb-0">Education:</Form.Label>
                                            <Form.Control as="textarea" rows={2} className="my-2" id="education" placeholder="Education history" value={formData.education} onChange={handleChange} isInvalid={!!errors.education} />
                                            <Form.Control.Feedback type="invalid">{errors.education}</Form.Control.Feedback>
                                        </Col>
                                        <Col sm={12} className="form-group">
                                            <Form.Label htmlFor="certifications" className="mb-0">Certifications:</Form.Label>
                                            <Form.Control as="textarea" rows={2} className="my-2" id="certifications" placeholder="Certifications" value={formData.certifications} onChange={handleChange} />
                                        </Col>
                                        <Col sm={12} className="form-group">
                                            <Form.Label htmlFor="bio" className="mb-0">Bio:</Form.Label>
                                            <Form.Control as="textarea" rows={3} className="my-2" id="bio" placeholder="Short bio" value={formData.bio} onChange={handleChange} />
                                        </Col>
                                    </Row>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-danger-subtle" onClick={handleCancel} disabled={submitting}>Cancel</button>
                                        <button type="submit" className="btn btn-primary-subtle" disabled={submitting}>
                                            {submitting ? <><Spinner animation="border" size="sm" className="me-2" />Saving...</> : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

// Wrap the component with protection
const ProtectedAddDoctor = () => {
    return (
        <ProtectedRoute
            permission="canAccessDoctorManagement"
            moduleName="Doctor Management"
        >
            <AddDoctor />
        </ProtectedRoute>
    );
};

export default ProtectedAddDoctor
