// ================================
// TYPES
// ================================

export interface CurriculumModule {
  month: number;
  title: string;
  description: string;
  topics: string[];
  project: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Program {
  // Basic Info
  slug: string;
  title: string;
  shortTitle: string;
  category: string;

  // Hero Section
  tagline: string;
  description: string;
  overview: string;

  // Course Details
  duration: string;
  mode: string;
  level: string;

  // Students
  prerequisites: string[];
  whoShouldJoin: string[];

  // Website Sections
  highlights: string[];
  learningOutcomes: string[];
  careerRoles: string[];
  tools: string[];
  projects: string[];

  // Extra Sections
  certifications: string[];
  careerSupport: string[];

  // Curriculum
  curriculum: CurriculumModule[];

  // FAQ
  faqs: FAQ[];
}

  // ================================
// PROGRAM DATA
// ================================

export const flagshipPrograms: Program[] = [
  {
    slug: "codeforge",
  
    title: "CodeForge – AI-Powered Software Engineering Program",

shortTitle: "CodeForge",

category: "Software Engineering",

    tagline:
  "Become an AI-Powered Software Engineer by mastering Full Stack Development, AI Coding Tools, Cloud Technologies, and Industry-Ready Product Development.",

  description:
  "CodeForge is TechSkill Hub's flagship AI-Powered Software Engineering Program designed to prepare students for the future of software development. Learn modern programming, full-stack web development, AI-assisted engineering workflows, cloud deployment, and professional software practices while building an impressive portfolio of real-world projects.",
    
  overview:
  "Artificial Intelligence has transformed software development—but it hasn't replaced software engineers. Today's companies hire developers who understand programming fundamentals and know how to leverage AI tools to build better software faster. CodeForge combines strong technical foundations with AI-powered development workflows, industry-standard tools, real-world projects, and career preparation. Students graduate with practical experience, a professional GitHub portfolio, confidence in AI-assisted development, and the skills required to contribute effectively to modern software teams.",

    duration: "9 Months",
  
    mode: "Online & Offline",
  
    level: "Beginner to Advanced",
  
  
    prerequisites: [
      "Basic Computer Knowledge",
      "Laptop (8GB RAM Recommended)",
      "Internet Connection",
      "No Coding Experience Required",
      "Willingness to Learn & Build"
    ],
  
    whoShouldJoin: [
      "12th Pass Students",
      "College Students",
      "Fresh Graduates",
      "Working Professionals",
      "Career Switchers",
      "Freelancers",
      "Entrepreneurs",
      "Anyone Interested in Software Engineering"
    ],
  
  highlights: [
  "AI-Powered Software Engineering Curriculum",
  "Live Interactive Classes",
  "Project-Based Learning",
  "15+ Industry-Level Projects",
  "AI Coding Workflow",
  "Git & GitHub Mastery",
  "Cloud Deployment",
  "Portfolio Development",
  "Resume & LinkedIn Optimization",
  "Mock Technical Interviews",
  "Career Guidance",
  "Industry Recognized Certificate"
],
  
learningOutcomes: [
  "Build Production-Ready Web Applications",
  "Master Full Stack Development",
  "Develop AI-Enabled Applications",
  "Use ChatGPT, Cursor AI & GitHub Copilot Professionally",
  "Deploy Applications to the Cloud",
  "Work with Modern Software Architecture",
  "Build REST APIs",
  "Collaborate using Git & GitHub",
  "Create a Professional Portfolio",
  "Prepare for Technical Interviews",
  "Understand Industry Development Workflows",
  "Become Career Ready"
],
  
careerRoles: [
  "AI Software Engineer",
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "React Developer",
  "Next.js Developer",
  "Node.js Developer",
  "Web Application Developer",
  "Software Consultant"
],
  
tools: [
  "Figma",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Adobe XD",
  "Canva Pro",
  "CorelDRAW",
  "Adobe InDesign",
  "Adobe Lightroom",
  "Adobe Firefly",
  "ChatGPT",
  "Gemini",
  "Claude",
  "Midjourney",
  "Framer",
  "Spline",
  "FigJam",
  "Miro",
  "Notion",
  "Behance",
  "Dribbble",
  "Google Fonts",
  "Material Design",
  "Icons8",
  "Flaticon",
  "LottieFiles",
  "Unsplash",
  "Pexels",
  "Coolors",
  "Zeplin",
  "AI Design Workflows"
],
  
projects: [
  "Professional Portfolio Website",
  "AI Resume Analyzer",
  "AI Customer Support Chatbot",
  "Learning Management System",
  "Hospital Management System",
  "CRM Dashboard",
  "Inventory Management System",
  "E-Commerce Platform",
  "Project Management System",
  "Real-Time Chat Application",
  "Multi-Vendor Marketplace",
  "Final Industry Capstone Project"
],
  
certifications: [
  "TechSkill Hub Program Certificate",
  "AI Productivity Workshop Certificate",
  "Git & GitHub Certificate",
  "Cloud Deployment Certificate",
  "Capstone Project Completion Certificate"
],
  
careerSupport: [
  "Personal Career Roadmap",
  "Resume Building",
  "LinkedIn Profile Optimization",
  "GitHub Portfolio Development",
  "Personal Branding",
  "Communication Skills Training",
  "Mock Technical Interviews",
  "HR Interview Preparation",
  "Career Mentorship",
  "Placement Assistance",
  "Internship Guidance",
  "Freelancing Guidance"
],
 
  
    curriculum: [
      {
          month: 1,
          title: "Digital Foundations & Programming Basics",
          description: "Build a strong foundation in computers, the internet, programming logic, Git, GitHub, and AI-assisted learning.",
          topics: [
            "Computer Fundamentals",
            "Internet & Web",
            "VS Code / Cursor Setup",
            "Git & GitHub",
            "Programming Logic",
            "AI Productivity Tools",
            "HTML Basics",
            "CSS Basics"
          ],
          project: "Professional Portfolio Website"
        },

      {
  month: 2,
  title: "Modern JavaScript",
  description: "Master JavaScript fundamentals and problem-solving techniques.",
  topics: [
    "Variables",
    "Functions",
    "Arrays",
    "Objects",
    "DOM",
    "ES6+",
    "API Fetch",
    "Async JavaScript"
  ],
  project: "Interactive Dashboard"
},

{
  month: 3,
  title: "React Development",
  description: "Build reusable and interactive web applications using React.",
  topics: [
    "Components",
    "Hooks",
    "Routing",
    "Forms",
    "Context API",
    "State Management"
  ],
  project: "Task Management System"
},

{
  month: 4,
  title: "Next.js & AI Coding",
  description: "Develop production-grade applications with Next.js while learning AI-assisted development.",
  topics: [
    "Next.js App Router",
    "Server Components",
    "Authentication",
    "Cursor AI",
    "GitHub Copilot",
    "Prompt Engineering"
  ],
  project: "AI Productivity Application"
},

{
  month: 5,
  title: "Backend Engineering",
  description: "Create scalable backend systems and REST APIs.",
  topics: [
    "Node.js",
    "Express.js",
    "REST APIs",
    "Authentication",
    "JWT",
    "Middleware"
  ],
  project: "Hospital Management Backend"
},

{
  month: 6,
  title: "Database Engineering",
  description: "Learn database design and data management.",
  topics: [
    "MongoDB",
    "PostgreSQL",
    "Database Design",
    "CRUD Operations",
    "Relationships"
  ],
  project: "Inventory Management System"
},

{
  month: 7,
  title: "Cloud & DevOps",
  description: "Deploy and manage applications in production.",
  topics: [
    "Docker Basics",
    "Vercel",
    "Environment Variables",
    "CI/CD Basics",
    "Production Deployment"
  ],
  project: "Deploy Production Application"
},

{
  month: 8,
  title: "Industry Project Sprint",
  description: "Work collaboratively on enterprise-level software.",
  topics: [
    "Software Architecture",
    "Agile",
    "Code Reviews",
    "Team Collaboration"
  ],
  project: "E-Commerce Platform"
},

{
  month: 9,
  title: "Career Accelerator",
  description: "Prepare for internships and software engineering roles.",
  topics: [
    "Resume",
    "LinkedIn",
    "Portfolio",
    "GitHub",
    "Mock Interviews",
    "System Design Basics"
  ],
  project: "Final Industry Capstone Project"
},
    ],
  
    faqs: [
      {
        question: "Do I need coding experience?",
        answer: "No. CodeForge is designed for complete beginners and gradually progresses to advanced software engineering concepts."
      },
      {
        question: "Will AI replace software developers?",
        answer: "AI is transforming software development, but companies increasingly value engineers who can combine strong programming fundamentals with AI tools. CodeForge teaches both technical skills and AI-assisted development workflows."
      },
      {
        question: "Will I build real projects?",
        answer: "Yes. You'll complete multiple portfolio-worthy projects, including AI-enabled applications and a final industry capstone project."
      },
      {
        question: "Do you provide career support?",
        answer: "Yes. We provide career guidance, resume reviews, LinkedIn optimization, GitHub portfolio development, mock interviews, and placement assistance."
      },
      {
        question: "Can I join while studying in college?",
        answer: "Absolutely. The program is designed for college students, fresh graduates, and working professionals."
      },
      {
        question: "Is the program available online and offline?",
        answer: "Yes. You can choose either online or offline learning based on your convenience."
      }
    ]
  },

  // InsightIQ Program
  {
    slug: "insightiq",
  
    title: "InsightIQ – AI-Powered Data Analytics & Business Intelligence Program",
  
    shortTitle: "InsightIQ",
  
    category: "Data Analytics",
  
    tagline:
      "Become a Job-Ready Data Analyst by mastering Excel, SQL, Power BI, Python, Business Intelligence and Generative AI.",
  
    description:
      "InsightIQ is TechSkill Hub's flagship AI-powered Data Analytics program designed to transform beginners into industry-ready Data Analysts. Learn data visualization, business intelligence, SQL, Python, Power BI, Excel and AI-assisted analytics while building real-world dashboards and portfolio projects.",
  
    overview:
      "Modern businesses rely on data for every decision. InsightIQ prepares students to collect, analyze, visualize and communicate business insights using today's most demanded analytics tools. Students graduate with practical experience, a professional analytics portfolio, multiple dashboards and strong business problem-solving skills.",
  
    duration: "9 Months",
  
    mode: "Live Online",
  
    level: "Beginner to Advanced",
  
    prerequisites: [
      "Basic Computer Knowledge",
      "Laptop (8GB RAM Recommended)",
      "Internet Connection",
      "No Analytics Experience Required",
      "Willingness to Learn"
    ],
  
    whoShouldJoin: [
      "12th Pass Students",
      "College Students",
      "Fresh Graduates",
      "Working Professionals",
      "Business Professionals",
      "Career Switchers",
      "Entrepreneurs",
      "Anyone Interested in Data Analytics"
    ],
  
    highlights: [
      "AI-Powered Data Analytics Curriculum",
      "Live Interactive Classes",
      "Real Business Case Studies",
      "20+ Portfolio Projects",
      "Power BI Dashboard Development",
      "Excel Mastery",
      "SQL Training",
      "Python for Analytics",
      "Resume Building",
      "Interview Preparation",
      "Career Mentorship",
      "Placement Assistance"
    ],
  
    learningOutcomes: [
      "Master Microsoft Excel",
      "Analyze Business Data",
      "Create Interactive Dashboards",
      "Use SQL Professionally",
      "Perform Data Cleaning",
      "Visualize Data",
      "Use Python for Analytics",
      "Build Business Reports",
      "Apply AI in Analytics",
      "Present Business Insights",
      "Create Portfolio Projects",
      "Become Job Ready"
    ],
  
    careerRoles: [
      "Data Analyst",
      "Business Analyst",
      "MIS Executive",
      "Reporting Analyst",
      "Power BI Developer",
      "Junior Data Analyst",
      "Business Intelligence Analyst",
      "Operations Analyst",
      "Marketing Analyst",
      "Data Consultant"
    ],
  
    tools: [
      "Microsoft Excel",
      "Power BI",
      "SQL",
      "Python",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "ChatGPT",
      "Gemini",
      "Google Sheets",
      "Canva",
      "Notion",
      "GitHub",
      "Jupyter Notebook",
      "LinkedIn"
    ],
  
    projects: [
      "Student Performance Dashboard",
      "Sales Analytics Dashboard",
      "Retail Dashboard",
      "HR Analytics Dashboard",
      "Financial Dashboard",
      "Marketing Analytics Dashboard",
      "Customer Insights Dashboard",
      "Business Intelligence Report",
      "Python Data Analysis Project",
      "Final Industry Capstone Project"
    ],
  
    certifications: [
      "TechSkill Hub Certificate",
      "Power BI Certificate",
      "Excel Certificate",
      "SQL Certificate",
      "AI Analytics Certificate"
    ],
  
    careerSupport: [
      "Resume Building",
      "LinkedIn Optimization",
      "Portfolio Development",
      "Mock Interviews",
      "Career Mentorship",
      "Internship Assistance",
      "Placement Assistance",
      "Freelancing Guidance",
      "Lifetime Community Access"
    ],
  
    curriculum: [
      {
        month: 1,
        title: "Professional Foundations & Excel Basics",
        description:
          "Build strong Excel fundamentals and understand the role of data analytics.",
        topics: [
          "Growth Mindset",
          "Career Planning",
          "Introduction to Data Analytics",
          "Excel Interface",
          "Data Entry",
          "Formatting",
          "Basic Formulas",
          "Sorting",
          "Filtering",
          "Charts"
        ],
        project: "Student Performance Dashboard"
      },
  
      {
        month: 2,
        title: "Advanced Excel & Reporting",
        description:
          "Master professional Excel functions used by companies.",
        topics: [
          "IF",
          "IFS",
          "SUMIF",
          "COUNTIF",
          "VLOOKUP",
          "XLOOKUP",
          "INDEX MATCH",
          "Conditional Formatting",
          "Data Validation",
          "Advanced Charts",
          "Lookup Applications"
        ],
        project: "Sales Reporting Dashboard"
      },
  
      {
        month: 3,
        title: "Business Analysis & Dashboards",
        description:
          "Create professional dashboards for business decision making.",
        topics: [
          "Pivot Tables",
          "Pivot Charts",
          "Slicers",
          "Timelines",
          "Dynamic Dashboards",
          "KPI Design",
          "Goal Tracking",
          "Storytelling with Data"
        ],
        project: "Executive Dashboard"
      },
  
      {
        month: 4,
        title: "SQL for Data Analytics",
        description:
          "Learn SQL from beginner to advanced for real business databases.",
        topics: [
          "Database Concepts",
          "SELECT",
          "WHERE",
          "ORDER BY",
          "GROUP BY",
          "HAVING",
          "JOINS",
          "Aggregate Functions",
          "CASE Statements"
        ],
        project: "Customer Insights SQL Project"
      },
  
      {
        month: 5,
        title: "Power BI Foundations",
        description:
          "Build interactive dashboards using Microsoft Power BI.",
        topics: [
          "Power BI Interface",
          "Power Query",
          "Data Cleaning",
          "Relationships",
          "Data Modeling",
          "Visualizations",
          "Dashboard Design",
          "Publishing Reports"
        ],
        project: "HR Analytics Dashboard"
      },

      {
        month: 6,
        title: "Advanced Power BI & DAX",
        description:
          "Create enterprise-grade dashboards using DAX and advanced visualization techniques.",
        topics: [
          "DAX Basics",
          "Calculated Columns",
          "Measures",
          "Time Intelligence",
          "KPIs",
          "Bookmarks",
          "Drill Through",
          "Dashboard Optimization"
        ],
        project: "Sales Performance Dashboard"
      },
  
      {
        month: 7,
        title: "Python for Data Analytics",
        description:
          "Analyze business datasets using Python and industry-standard libraries.",
        topics: [
          "Python Basics",
          "Jupyter Notebook",
          "Pandas",
          "NumPy",
          "Data Cleaning",
          "Matplotlib",
          "Seaborn",
          "Exploratory Data Analysis"
        ],
        project: "Customer Analytics Project"
      },
  
      {
        month: 8,
        title: "Generative AI & Business Intelligence",
        description:
          "Leverage AI tools to automate reporting and improve business decision-making.",
        topics: [
          "ChatGPT for Analysts",
          "Prompt Engineering",
          "AI Report Writing",
          "Data Storytelling",
          "Automation",
          "Dashboard Insights",
          "Business Presentations"
        ],
        project: "AI Business Intelligence Dashboard"
      },
  
      {
        month: 9,
        title: "Career Accelerator & Capstone",
        description:
          "Build a complete analytics portfolio and prepare for interviews.",
        topics: [
          "Resume Building",
          "LinkedIn Optimization",
          "Portfolio Development",
          "GitHub",
          "Interview Preparation",
          "Case Studies",
          "Mock Interviews",
          "Personal Branding"
        ],
        project: "Final Industry Capstone Dashboard"
      }
    ],
  
    faqs: [
      {
        question: "Do I need coding experience?",
        answer:
          "No. InsightIQ is designed for complete beginners. We start with Excel fundamentals before progressing to SQL, Power BI, Python and AI."
      },
      {
        question: "Will I learn Power BI from scratch?",
        answer:
          "Yes. The program starts from the basics and progresses to advanced dashboard development using DAX, Power Query and real business datasets."
      },
      {
        question: "Will I learn SQL and Python?",
        answer:
          "Yes. SQL and Python are core components of the curriculum, enabling you to analyze, clean and visualize data professionally."
      },
      {
        question: "How many projects will I build?",
        answer:
          "You'll build multiple portfolio-ready dashboards, business reports, analytics case studies and a final industry capstone project."
      },
      {
        question: "Does the program include AI?",
        answer:
          "Yes. You'll learn how to use ChatGPT and Generative AI to automate reporting, generate insights and improve productivity as a data analyst."
      },
      {
        question: "Do you provide placement support?",
        answer:
          "Yes. Students receive resume reviews, LinkedIn optimization, portfolio guidance, mock interviews, career mentoring and placement assistance."
      }
    ]
  },

  // DesignSphere Program
  {
    slug: "designsphere",
  
    title: "DesignSphere – AI-Powered UI/UX & Creative Design Program",
  
    shortTitle: "DesignSphere",
  
    category: "UI/UX & Creative Design",
  
    tagline:
      "Become a Professional UI/UX Designer by mastering Figma, Adobe Creative Suite, Design Systems, User Research and AI Design Tools.",
  
    description:
      "DesignSphere is TechSkill Hub's flagship UI/UX and Creative Design program designed for students, graduates and professionals who want to build world-class digital products. Learn UI Design, UX Research, Wireframing, Prototyping, Branding, Motion Design and AI-assisted design workflows while creating an outstanding design portfolio.",
  
    overview:
      "Modern companies need designers who can create beautiful, user-friendly digital experiences. DesignSphere teaches design thinking, user psychology, interface design, design systems, AI-powered workflows and portfolio development so students graduate ready for internships and design careers.",
  
    duration: "9 Months",
  
    mode: "Live Online",
  
    level: "Beginner to Advanced",
  
    prerequisites: [
      "Basic Computer Knowledge",
      "Laptop (8GB RAM Recommended)",
      "Internet Connection",
      "No Design Experience Required",
      "Creative Mindset"
    ],
  
    whoShouldJoin: [
      "12th Pass Students",
      "College Students",
      "Fresh Graduates",
      "Working Professionals",
      "Graphic Designers",
      "Career Switchers",
      "Freelancers",
      "Anyone Interested in UI/UX Design"
    ],
  
    highlights: [
      "AI-Powered UI/UX Curriculum",
      "Live Interactive Classes",
      "20+ Portfolio Projects",
      "Real Client Design Projects",
      "Design Systems",
      "Mobile App Design",
      "Website Design",
      "Brand Identity Design",
      "Portfolio Development",
      "Interview Preparation",
      "Career Mentorship",
      "Placement Assistance"
    ],
  
    learningOutcomes: [
      "Master Figma",
      "Create Professional UI Designs",
      "Conduct UX Research",
      "Build Wireframes",
      "Design Interactive Prototypes",
      "Create Design Systems",
      "Use AI Design Tools",
      "Design Mobile Apps",
      "Design Responsive Websites",
      "Present Design Case Studies",
      "Build Portfolio",
      "Become Job Ready"
    ],
  
    careerRoles: [
      "UI Designer",
      "UX Designer",
      "Product Designer",
      "Visual Designer",
      "Graphic Designer",
      "Web Designer",
      "Mobile App Designer",
      "Creative Designer",
      "Brand Designer",
      "Design Consultant"
    ],
  
    tools: [
      "Figma",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Adobe XD",
      "Canva",
      "ChatGPT",
      "Midjourney",
      "Adobe Firefly",
      "Framer",
      "Notion",
      "Miro",
      "FigJam",
      "Spline",
      "Zeplin",
      "Google Fonts",
      "Coolors"
    ],
  
    projects: [
      "Portfolio Website Design",
      "Food Delivery App",
      "Banking Mobile App",
      "Healthcare Dashboard",
      "Travel Booking Website",
      "E-Commerce UI",
      "Learning Platform",
      "Brand Identity Kit",
      "Design System",
      "Final Industry Capstone Project"
    ],
  
    certifications: [
      "TechSkill Hub Certificate",
      "UI Design Certificate",
      "UX Design Certificate",
      "Figma Mastery Certificate",
      "Portfolio Excellence Certificate"
    ],
  
    careerSupport: [
      "Resume Building",
      "LinkedIn Optimization",
      "Portfolio Development",
      "Behance Portfolio",
      "Dribbble Profile Setup",
      "Mock Interviews",
      "Career Mentorship",
      "Freelancing Guidance",
      "Placement Assistance"
    ],
  
    curriculum: [
      {
        month: 1,
        title: "Design Foundations",
        description:
          "Build a strong foundation in visual design principles, creativity and design thinking.",
        topics: [
          "Design Principles",
          "Colour Theory",
          "Typography",
          "Layout & Composition",
          "Visual Hierarchy",
          "Brand Fundamentals",
          "Creative Thinking",
          "Design Process"
        ],
        project: "Brand Identity Mood Board"
      },
    
      {
        month: 2,
        title: "Adobe Photoshop & Canva",
        description:
          "Master image editing, photo manipulation and social media graphic design.",
        topics: [
          "Adobe Photoshop",
          "Photo Editing",
          "Retouching",
          "Poster Design",
          "Banner Design",
          "Social Media Creatives",
          "Canva",
          "Marketing Graphics"
        ],
        project: "Complete Social Media Campaign"
      },
    
      {
        month: 3,
        title: "Adobe Illustrator & Graphic Design",
        description:
          "Create professional vector graphics and branding materials.",
        topics: [
          "Adobe Illustrator",
          "Logo Design",
          "Vector Illustration",
          "Business Cards",
          "Brochure Design",
          "Packaging Design",
          "Brand Identity",
          "Print Graphics"
        ],
        project: "Professional Brand Identity Kit"
      },
    
      {
        month: 4,
        title: "Introduction to UI/UX Design",
        description:
          "Learn how to design digital experiences that are user-friendly and visually appealing.",
        topics: [
          "UI Design",
          "UX Fundamentals",
          "User Research",
          "Wireframing",
          "User Flow",
          "Information Architecture",
          "Design Thinking",
          "Accessibility"
        ],
        project: "Mobile App Wireframe"
      },
    
      {
        month: 5,
        title: "Figma UI Design",
        description:
          "Design responsive websites and mobile applications using Figma.",
        topics: [
          "Figma Interface",
          "Frames",
          "Auto Layout",
          "Components",
          "Variants",
          "Prototyping",
          "Responsive Design",
          "Design Systems"
        ],
        project: "Complete Website UI Design"
      },
    
      {
        month: 6,
        title: "CorelDRAW & Print Media Design",
        description:
          "Master professional print design and production workflows.",
        topics: [
          "CorelDRAW",
          "Magazine Design",
          "Flyers",
          "Packaging",
          "Visiting Cards",
          "Flex & Banner Design",
          "Print Production",
          "Pre-Press Techniques"
        ],
        project: "Corporate Print Branding Package"
      },
    
      {
        month: 7,
        title: "Advanced UI & AI Design",
        description:
          "Leverage AI-powered tools to design faster and create modern digital experiences.",
        topics: [
          "Advanced Figma",
          "ChatGPT for Designers",
          "Adobe Firefly",
          "Midjourney",
          "AI Image Generation",
          "AI Wireframing",
          "Micro Interactions",
          "Design Workflow Automation"
        ],
        project: "AI-Powered SaaS Dashboard Design"
      },
    
      {
        month: 8,
        title: "Portfolio & Client Projects",
        description:
          "Work on real-world client projects while building a professional portfolio.",
        topics: [
          "Client Communication",
          "Design Case Studies",
          "Portfolio Writing",
          "Behance",
          "Dribbble",
          "Presentation Skills",
          "Design Reviews",
          "Revision Workflow"
        ],
        project: "Complete Product Design Case Study"
      },
    
      {
        month: 9,
        title: "Career Accelerator",
        description:
          "Prepare for internships, freelancing and full-time UI/UX & Graphic Design careers.",
        topics: [
          "Resume Building",
          "LinkedIn Optimization",
          "Portfolio Review",
          "Interview Preparation",
          "Freelancing",
          "Client Acquisition",
          "Personal Branding",
          "Career Roadmap"
        ],
        project: "Final Industry Capstone Design Project"
      }
    ],
  
    faqs: [
      {
        question: "Do I need design experience?",
        answer:
          "No. DesignSphere is designed for complete beginners and gradually progresses to advanced UI/UX concepts."
      },
      {
        question: "Will I learn Figma from scratch?",
        answer:
          "Yes. The program starts with the fundamentals and progresses to advanced Figma workflows, components and design systems."
      },
      {
        question: "Will I build a portfolio?",
        answer:
          "Yes. You'll create multiple real-world projects, case studies and a professional portfolio suitable for internships and full-time jobs."
      },
      {
        question: "Does the course include AI tools?",
        answer:
          "Yes. You'll learn ChatGPT, Adobe Firefly, Midjourney and other AI tools to improve design productivity."
      },
      {
        question: "Can I work as a freelancer after this course?",
        answer:
          "Yes. We cover client communication, portfolio creation, pricing strategies and freelancing best practices."
      },
      {
        question: "Do you provide placement support?",
        answer:
          "Yes. Students receive resume reviews, LinkedIn optimization, portfolio guidance, mock interviews, career mentoring and placement assistance."
      }
    ]
  },
  // GrowthX Program
  {
    slug: "growthx",
  
    title: "GrowthX – AI-Powered Business Growth & Entrepreneurship Program",
  
    shortTitle: "GrowthX",
  
    category: "Business Growth, Sales & Entrepreneurship",
  
    tagline:
      "Master Sales, Marketing, Communication, Entrepreneurship, AI and Business Growth to build a successful career or grow your own business.",
  
    description:
      "GrowthX is TechSkill Hub's flagship AI-Powered Business Growth Program designed for students, entrepreneurs, freelancers, professionals and future business leaders. Learn high-income business skills including communication, sales, branding, digital marketing, AI-powered productivity, customer acquisition, entrepreneurship and business strategy through real-world projects, live mentorship and practical implementation.",
  
    overview:
      "Success in today's world requires more than technical knowledge. Companies and startups need professionals who can communicate effectively, sell confidently, build brands, attract customers, leverage AI and drive business growth. GrowthX combines sales psychology, digital marketing, entrepreneurship, leadership, AI tools and practical business execution into one industry-focused program. Students graduate with real-world experience, professional confidence, a strong portfolio and the skills to secure high-growth careers, freelance independently or build their own successful business.",
  
    duration: "9 Months",
  
    mode: "Live Online",
  
    level: "Beginner to Advanced",
  
    prerequisites: [
      "Basic Computer Knowledge",
      "Laptop or Desktop",
      "Internet Connection",
      "No Business Experience Required",
      "Willingness to Learn & Grow"
    ],
  
    whoShouldJoin: [
      "12th Pass Students",
      "College Students",
      "Fresh Graduates",
      "Working Professionals",
      "Entrepreneurs",
      "Startup Founders",
      "Business Owners",
      "Freelancers",
      "Sales Professionals",
      "Marketing Professionals",
      "Career Switchers",
      "Anyone Who Wants Business & Career Growth"
    ],
  
    highlights: [
      "AI-Powered Business Growth Curriculum",
      "Live Interactive Online Classes",
      "Sales & Communication Mastery",
      "Digital Marketing & Branding",
      "Business Strategy & Entrepreneurship",
      "AI Productivity & Automation",
      "Real Business Projects",
      "Client Acquisition Strategies",
      "Business Case Studies",
      "Portfolio Development",
      "Career Mentorship",
      "Placement & Freelancing Guidance",
      "Startup Guidance",
      "Industry Recognized Certificate"
    ],
  
    learningOutcomes: [
      "Communicate with Confidence",
      "Master Professional Sales Skills",
      "Generate Leads & Close Deals",
      "Build Strong Personal & Business Brands",
      "Create Complete Marketing Strategies",
      "Leverage AI for Business Growth",
      "Understand Entrepreneurship & Business Models",
      "Launch & Scale Your Business",
      "Acquire & Retain Customers",
      "Build Professional LinkedIn Presence",
      "Develop Business Growth Strategies",
      "Become Career Ready"
    ],
  
    careerRoles: [
      "Business Development Executive",
      "Sales Executive",
      "Business Consultant",
      "Marketing Executive",
      "Digital Marketing Specialist",
      "Growth Marketing Executive",
      "Brand Strategist",
      "Client Success Manager",
      "Business Analyst",
      "Startup Operations Executive",
      "Entrepreneur",
      "Freelance Business Consultant"
    ],
    
    tools: [
      "ChatGPT",
      "Gemini",
      "Claude",
      "Canva",
      "Notion",
      "Google Workspace",
      "Meta Business Suite",
      "Google Analytics 4",
      "Google Ads",
      "Meta Ads Manager",
      "LinkedIn",
      "HubSpot CRM",
      "Zoho CRM",
      "Mailchimp",
      "Google Business Profile",
      "CapCut",
      "Excel",
      "Power BI",
      "Calendly",
      "WhatsApp Business"
    ],
    
    projects: [
      "Personal Brand Website",
      "Complete SEO Audit",
      "Google Ads Campaign",
      "Meta Ads Campaign",
      "Social Media Content Calendar",
      "Lead Generation Funnel",
      "Landing Page Optimization",
      "Email Marketing Campaign",
      "E-commerce Marketing Strategy",
      "Brand Identity Project",
      "Marketing Analytics Dashboard",
      "Final Client Marketing Campaign"
    ],
    
    certifications: [
      "TechSkill Hub GrowthX Certificate",
      "AI Marketing Fundamentals Certificate",
      "Google Analytics Certificate",
      "Google Ads Certificate",
      "Meta Ads Certificate",
      "SEO & Content Marketing Certificate",
      "Capstone Project Certificate"
    ],
    
    careerSupport: [
      "Career Roadmap",
      "Resume Building",
      "LinkedIn Profile Optimization",
      "Portfolio Development",
      "Personal Branding",
      "Freelancing Guidance",
      "Agency Setup Guidance",
      "Interview Preparation",
      "Mock Interviews",
      "Placement Assistance",
      "Internship Support",
      "Business Growth Mentorship"
    ],
    
    curriculum: [
      {
        month: 1,
        title: "Personal & Professional Foundations",
        description: "Develop confidence, communication habits, professional etiquette and growth mindset.",
        topics: [
          "Growth Mindset",
          "Goal Setting",
          "Time Management",
          "Confidence Building",
          "Professional Etiquette",
          "Public Speaking Basics",
          "Self Discipline",
          "AI Productivity Tools"
        ],
        project: "Personal Growth Blueprint"
      },
    
      {
        month: 2,
        title: "Communication & Influence",
        description: "Master communication skills required in sales, business and leadership.",
        topics: [
          "Verbal Communication",
          "Body Language",
          "Presentation Skills",
          "Storytelling",
          "Active Listening",
          "Business Communication",
          "Email Writing",
          "Negotiation Basics"
        ],
        project: "Business Presentation"
      },
    
      {
        month: 3,
        title: "Sales & Customer Psychology",
        description: "Learn how businesses generate revenue using modern sales techniques.",
        topics: [
          "Sales Psychology",
          "Lead Generation",
          "Prospecting",
          "Sales Funnel",
          "Cold Calling",
          "Closing Techniques",
          "CRM",
          "Customer Relationship Building"
        ],
        project: "Complete Sales Funnel"
      },
    
      {
        month: 4,
        title: "Business & Entrepreneurship",
        description: "Understand how successful businesses are built and scaled.",
        topics: [
          "Business Models",
          "Startup Fundamentals",
          "Value Proposition",
          "Market Research",
          "Pricing",
          "Business Planning",
          "Operations",
          "Financial Basics"
        ],
        project: "Business Plan"
      },
    
      {
        month: 5,
        title: "Digital Marketing",
        description: "Learn how to acquire customers using modern digital channels.",
        topics: [
          "Branding",
          "Social Media Marketing",
          "Content Marketing",
          "Instagram Marketing",
          "Facebook Marketing",
          "SEO Basics",
          "Google Business Profile",
          "Meta Ads Introduction"
        ],
        project: "Digital Marketing Campaign"
      },
    
      {
        month: 6,
        title: "AI for Business Growth",
        description: "Use AI to automate marketing, sales, customer support and business operations.",
        topics: [
          "ChatGPT",
          "Gemini",
          "Claude",
          "AI Prompting",
          "AI Content Creation",
          "AI Sales Scripts",
          "AI Marketing",
          "Business Automation"
        ],
        project: "AI Business Assistant"
      },
    
      {
        month: 7,
        title: "Business Operations & Leadership",
        description: "Learn how to manage people, teams and day-to-day business operations.",
        topics: [
          "Leadership",
          "Team Management",
          "Hiring Basics",
          "Client Management",
          "Business Systems",
          "KPIs",
          "Productivity",
          "Decision Making"
        ],
        project: "Business Operations Dashboard"
      },
    
      {
        month: 8,
        title: "Personal Branding & Client Acquisition",
        description: "Build a strong personal brand and learn to acquire clients consistently.",
        topics: [
          "LinkedIn Branding",
          "Instagram Branding",
          "Portfolio Building",
          "Networking",
          "Freelancing",
          "Proposal Writing",
          "Client Meetings",
          "Business Pitching"
        ],
        project: "Professional Brand Portfolio"
      },
    
      {
        month: 9,
        title: "Career & Business Accelerator",
        description: "Prepare for employment, freelancing or launching your own business.",
        topics: [
          "Resume Building",
          "Interview Preparation",
          "Business Scaling",
          "Investment Basics",
          "Startup Roadmap",
          "Career Planning",
          "Growth Strategy",
          "Capstone Presentation"
        ],
        project: "Launch Your Business / Career Capstone"
      },
    ],
    
    faqs: [
      {
        question: "Who is GrowthX designed for?",
        answer:
          "GrowthX is designed for students, graduates, working professionals, entrepreneurs, freelancers, sales professionals, business owners, and anyone who wants to develop high-income business and career skills."
      },
      {
        question: "Do I need any business or marketing experience?",
        answer:
          "No. GrowthX starts from the fundamentals and gradually advances to professional-level sales, communication, marketing, AI, entrepreneurship, and business growth strategies."
      },
      {
        question: "Is this only a Digital Marketing course?",
        answer:
          "No. Digital Marketing is only one part of GrowthX. The program also covers sales, communication, entrepreneurship, AI-powered business tools, personal branding, client acquisition, business strategy, leadership, and career development."
      },
      {
        question: "Will I learn AI tools during the program?",
        answer:
          "Yes. You'll learn to use AI tools like ChatGPT, Gemini, Claude, Canva AI, and other productivity tools for marketing, sales, business operations, content creation, and automation."
      },
      {
        question: "Will I work on real projects?",
        answer:
          "Absolutely. Every month includes practical assignments and real-world business projects. You'll build marketing campaigns, sales funnels, branding strategies, business plans, AI workflows, and a final capstone project."
      },
      {
        question: "Will this help me start my own business?",
        answer:
          "Yes. GrowthX teaches entrepreneurship, business planning, customer acquisition, sales systems, branding, and growth strategies to help you confidently launch and scale your own business."
      },
      {
        question: "Can this program help me get a job?",
        answer:
          "Yes. Along with business skills, you'll receive resume building, LinkedIn optimization, interview preparation, communication training, portfolio development, and placement assistance."
      },
      {
        question: "Will I receive a certificate after completion?",
        answer:
          "Yes. Students who successfully complete the program and projects receive an industry-recognized TechSkill Hub Certificate of Completion."
      },
      {
        question: "Are live classes and mentor support included?",
        answer:
          "Yes. GrowthX includes live interactive sessions, industry mentor guidance, doubt-solving support, project reviews, and continuous feedback throughout the program."
      },
      {
        question: "What career opportunities can I pursue after GrowthX?",
        answer:
          "Graduates can pursue careers in Sales, Business Development, Digital Marketing, Entrepreneurship, Client Success, Marketing Strategy, Business Consulting, Startup Operations, Growth Marketing, Account Management, or launch their own business or freelance career."
      }
    ],
  }
];