import type { UserCredentials, CandidateProfile, Company, Job, Application, Post, Notification } from '../types';

export let mockCompanies: Company[] = [
    { id: 'comp-1', name: 'Innovate Inc.', description: 'A fast-growing startup in the AI space.' },
];

export let mockUsers: UserCredentials[] = [
    {
        id: 'user-candidate-1',
        email: 'candidate@test.com',
        name: 'John Doe',
        role: 'candidate',
        connections: [],
        connectionRequests: [],
    },
    {
        id: 'user-hr-1',
        email: 'hr@test.com',
        name: 'Jane Smith',
        role: 'hr',
        companyId: 'comp-1',
        companyName: 'Innovate Inc.',
        connections: [],
        connectionRequests: [],
    }
];

export let mockProfiles: CandidateProfile[] = [
    {
        userId: 'user-candidate-1',
        name: 'John Doe',
        email: 'candidate@test.com',
        headline: 'Aspiring Software Engineer',
        summary: 'Recent computer science graduate with a passion for developing innovative software solutions. Eager to apply my skills in a challenging and collaborative environment.',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        workExperience: [
            {
                id: 'exp-1',
                title: 'Software Engineer Intern',
                company: 'Tech Solutions LLC',
                startDate: 'May 2023',
                endDate: 'Aug 2023',
                description: 'Assisted in the development of a new web application, focusing on front-end features using React.'
            }
        ],
        education: [
            {
                id: 'edu-1',
                institution: 'State University',
                degree: 'Bachelor of Science',
                fieldOfStudy: 'Computer Science',
                startDate: '2020',
                endDate: '2024'
            }
        ]
    }
];

export let mockJobs: Job[] = [
    {
        id: 'job-1',
        title: 'Frontend Developer',
        description: 'We are looking for a skilled Frontend Developer to join our team. The ideal candidate will have extensive experience with React and modern JavaScript frameworks. Responsibilities include developing user-facing features, building reusable components, and optimizing applications for maximum speed and scalability.',
        skills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
        experience: '2+ years',
        location: 'Remote',
        companyId: 'comp-1',
        companyName: 'Innovate Inc.',
        type: 'Job',
    },
    {
        id: 'job-2',
        title: 'Backend Developer Intern',
        description: 'Join our backend team as an intern and work with cutting-edge technologies. You will be responsible for designing and implementing RESTful APIs, working with our database, and ensuring the performance and reliability of our services. This is a great opportunity to learn from experienced engineers.',
        skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Python'],
        experience: '0-1 years',
        location: 'New York, NY',
        companyId: 'comp-1',
        companyName: 'Innovate Inc.',
        type: 'Internship',
    }
];

export let mockApplications: Application[] = [
    {
        id: 'app-1',
        jobId: 'job-1',
        jobTitle: 'Frontend Developer',
        companyId: 'comp-1',
        companyName: 'Innovate Inc.',
        candidateId: 'user-candidate-1',
        candidateName: 'John Doe',
        profileSnapshot: mockProfiles[0],
        resumeText: `John Doe\nAspiring Software Engineer\n\nSkills: JavaScript, React, Node.js, Python, SQL\n\nExperience:\nSoftware Engineer Intern at Tech Solutions LLC (May 2023 - Aug 2023)\n- Assisted in the development of a new web application, focusing on front-end features using React.\n\nEducation:\nState University - Bachelor of Science in Computer Science (2020-2024)`,
        atsResult: {
            score: 85,
            matched_skills: ['React', 'JavaScript'],
            missing_skills: ['TypeScript', 'CSS'],
            summary: 'A strong candidate with foundational React experience, but lacks specific skills in TypeScript.'
        },
        status: 'Submitted',
        appliedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    }
];

export let mockPosts: Post[] = [
    {
        id: 'post-1',
        authorId: 'user-candidate-1',
        authorName: 'John Doe',
        authorHeadline: 'Aspiring Software Engineer',
        content: 'Excited to start my job search! Looking for opportunities in frontend development. Feel free to connect!',
        createdAt: new Date(),
    }
];

export let mockNotifications: Notification[] = [];
