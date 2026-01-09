import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }

  if (!req.files || !req.files.resume) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;

  // ✅ Allow image + PDF
  const allowedFormats = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler(
        "Invalid file type. Please upload PDF, PNG, JPEG, or WEBP file.",
        400
      )
    );
  }

  // ✅ Max file size: 2MB
  if (resume.size > 2 * 1024 * 1024) {
    return next(
      new ErrorHandler("Resume size should be less than 2MB.", 400)
    );
  }

  // ✅ Upload to Cloudinary (PDF + Image safe)
  const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath,
    {
      folder: "resumes",
      resource_type: "auto", // 🔥 IMPORTANT
    }
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    return next(
      new ErrorHandler("Failed to upload Resume to Cloudinary", 500)
    );
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;

  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  if (!name || !email || !coverLetter || !phone || !address) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID: {
      user: req.user._id,
      role: "Job Seeker",
    },
    employerID: {
      user: jobDetails.postedBy,
      role: "Employer",
    },
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    status: "Pending",
  });

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);

export const employerUpdateApplicationStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { role, _id: employerId } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["Accepted", "Rejected", "Pending"];
    if (!allowed.includes(status)) {
      return next(new ErrorHandler("Invalid status value", 400));
    }

    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }

    // Ensure only the employer assigned to this application can update it
    if (String(application.employerID.user) !== String(employerId)) {
      return next(new ErrorHandler("Not authorized to update this application", 403));
    }

    application.status = status;
    application.decisionAt = status === "Pending" ? undefined : new Date();
    application.decidedBy = status === "Pending" ? undefined : employerId;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`,
      application,
    });
  }
);
