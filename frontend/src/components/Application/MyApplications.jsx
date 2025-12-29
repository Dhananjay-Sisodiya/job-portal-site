import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModal from "./ResumeModal";

const MyApplications = () => {
  const { user, isAuthorized } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const navigateTo = useNavigate();

  // 🔐 redirect if not authorized
  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
    }
  }, [isAuthorized]);

  // 📡 fetch applications
  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      try {
        const url =
          user.role === "Employer"
            ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/employer/getall`
            : `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/jobseeker/getall`;

        const res = await axios.get(url, { withCredentials: true });
        setApplications(res.data.applications);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load applications");
      }
    };

    fetchApplications();
  }, []);

  

  const deleteApplication = async (id) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/delete/${id}`,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const openModal = (url) => {
    setResumeUrl(url);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setResumeUrl("");
  };

  useEffect(() => {
    if (!user) return;
  })

  return (
    <section className="my_applications page">
      {user.role === "Job Seeker" ? (
        <div className="container">
          <center><h1>My Applications</h1></center>

          {applications.length === 0 ? (
            <center><h4>No Applications Found</h4></center>
          ) : (
            applications.map((element) => (
              <JobSeekerCard
                key={element._id}
                element={element}
                deleteApplication={deleteApplication}
                openModal={openModal}
              />
            ))
          )}
        </div>
      ) : (
        <div className="container">
          <center><h1>Applications From Job Seekers</h1></center>

          {applications.length === 0 ? (
            <center><h4>No Applications Found</h4></center>
          ) : (
            applications.map((element) => (
              <EmployerCard
                key={element._id}
                element={element}
                openModal={openModal}
              />
            ))
          )}
        </div>
      )}

      {modalOpen && (
        <ResumeModal resumeUrl={resumeUrl} onClose={closeModal} />
      )}
    </section>
  );
};

export default MyApplications;

// ---------------- Job Seeker Card ----------------
const JobSeekerCard = ({ element, deleteApplication, openModal }) => {
  return (
    <div className="job_seeker_card">
      <div className="detail">
        <p><span>Name:</span> {element.name}</p>
        <p><span>Email:</span> {element.email}</p>
        <p><span>Phone:</span> {element.phone}</p>
        <p><span>Address:</span> {element.address}</p>
        <p><span>CoverLetter:</span> {element.coverLetter}</p>
      </div>

      <div className="resume">
        <button onClick={() => openModal(element.resume.url)}>
          View Resume
        </button>
      </div>

      <div className="btn_area">
        <button onClick={() => deleteApplication(element._id)}>
          Delete Application
        </button>
      </div>
    </div>
  );
};

// ---------------- Employer Card ----------------
const EmployerCard = ({ element, openModal }) => {
  return (
    <div className="job_seeker_card">
      <div className="detail">
        <p><span>Name:</span> {element.name}</p>
        <p><span>Email:</span> {element.email}</p>
        <p><span>Phone:</span> {element.phone}</p>
        <p><span>Address:</span> {element.address}</p>
        <p><span>CoverLetter:</span> {element.coverLetter}</p>
      </div>

      <div className="resume">
        <button onClick={() => openModal(element.resume.url)}>
          View Resume
        </button>
      </div>
    </div>
  );
};
