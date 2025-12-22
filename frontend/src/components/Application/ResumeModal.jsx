import React from "react";

const ResumeModal = ({ resumeUrl, onClose }) => {
  const isPdf = resumeUrl?.endsWith(".pdf");

  return (
    <div className="resume-modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>

        {isPdf ? (
          <iframe
            src={resumeUrl}
            title="Resume PDF"
            width="100%"
            height="500px"
          />
        ) : (
          <img src={resumeUrl} alt="resume" />
        )}
      </div>
    </div>
  );
};

export default ResumeModal;
