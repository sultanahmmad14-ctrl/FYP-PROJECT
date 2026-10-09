const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
app.use(cors());
app.use(express.json());

// File upload setup using Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Temporary In-Memory Job Store
const jobs = [
    {
        id: "1",
        title: "Frontend React Developer",
        description: "Looking for a React developer with experience in JavaScript, HTML, CSS, Tailwind CSS, REST APIs, and Git."
    },
    {
        id: "2",
        title: "Python Data Scientist / AI Engineer",
        description: "Required Python Developer skilled in Machine Learning, FastAPI, Scikit-learn, Pandas, NLP, and Data Analysis."
    }
];

// Get All Jobs
app.get('/api/jobs', (req, res) => {
    res.json(jobs);
});

// Post New Job (HR Role)
app.post('/api/jobs', (req, res) => {
    const { title, description } = req.body;
    const newJob = {
        id: (jobs.length + 1).toString(),
        title,
        description
    };
    jobs.push(newJob);
    res.json({ message: "Job posted successfully!", job: newJob });
});

// Apply & Screen Resume using Python AI Service
app.post('/api/apply', upload.single('resume'), async (req, res) => {
    try {
        const { jobId } = req.body;
        const job = jobs.find(j => j.id === jobId);

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Please upload a PDF resume" });
        }

        // Forward PDF & Job Description to Python AI Microservice
        const formData = new FormData();
        formData.append('job_description', job.description);
        formData.append('resume_file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const aiResponse = await axios.post('http://127.0.0.1:8000/analyze-resume', formData, {
            headers: formData.getHeaders(),
        });

        res.json({
            jobTitle: job.title,
            result: aiResponse.data
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to screen resume via AI service" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Node.js Backend running on http://localhost:${PORT}`);
});