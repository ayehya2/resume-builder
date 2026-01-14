const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Mock data for the resume
const mockData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    address: 'New York, NY',
    websites: [
        { name: 'Portfolio', url: 'https://johndoe.com' },
        { name: 'GitHub', url: 'https://github.com/johndoe' }
    ],
    experience: [
        {
            company: 'Tech Solutions Inc.',
            position: 'Senior Software Engineer',
            location: 'San Francisco, CA',
            startDate: 'Jan 2020',
            endDate: 'Present',
            description: '• Led a team of 5 developers to build a scalable microservices architecture.\n• Improved system performance by 40% through code optimization.'
        },
        {
            company: 'Web Apps Co.',
            position: 'Software Developer',
            location: 'Austin, TX',
            startDate: 'Jun 2017',
            endDate: 'Dec 2019',
            description: '• Developed responsive web applications using React and Node.js.\n• Reduced page load time by 25% by implementing lazy loading.'
        }
    ],
    education: [
        {
            institution: 'University of Technology',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            location: 'Boston, MA',
            graduationDate: 'May 2017',
            gpa: '3.8/4.0',
            description: '• Relevant coursework: Algorithms, Data Structures, Web Development.'
        }
    ],
    skills: [
        { category: 'Languages', items: ['JavaScript', 'Python', 'Java', 'C++', 'SQL'] },
        { category: 'Frameworks', items: ['React', 'Node.js', 'Express', 'Django', 'Spring'] }
    ],
    projects: [
        {
            name: 'E-commerce Platform',
            startDate: 'Mar 2021',
            endDate: 'Aug 2021',
            keywords: ['Next.js', 'Tailwind CSS', 'Stripe'],
            description: '• Built a full-stack e-commerce site with user authentication and payment processing.'
        }
    ],
    awards: [
        {
            title: 'Employee of the Month',
            awarder: 'Tech Solutions Inc.',
            date: 'May 2022',
            summary: '• Awarded for outstanding contribution to the core product redesign.'
        }
    ],
    sections: ['profile', 'education', 'work', 'skills', 'projects', 'awards']
};

// Simplified getTemplateStyles from latex.js
function getTemplateStyles(templateId) {
    switch (parseInt(templateId)) {
        case 1: // Classic
            return `
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 40px; color: #000; line-height: 1.5; font-size: 11pt; }
          .header { text-align: center; margin-bottom: 25px; }
          .name { font-size: 24pt; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
          .contact { font-size: 10pt; margin-bottom: 3px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; border-bottom: 2px solid #000; padding-bottom: 2px; }
          .job, .edu-item { margin-bottom: 12px; }
          .company, .institution { font-weight: bold; font-size: 11pt; }
          .position, .degree { font-style: italic; }
          .date, .location { font-size: 10pt; }
          .skill-category { font-weight: bold; display: inline; }
          .skill-items { display: inline; margin-left: 5px; }
        `;
        case 2: // Awesome CV
            return `
          body { font-family: sans-serif; margin: 0; padding: 40px; color: #333; line-height: 1.4; font-size: 10pt; }
          .header { text-align: left; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #2b83ba; }
          .name { font-size: 28pt; font-weight: 300; margin-bottom: 5px; color: #2b83ba; }
          .contact { font-size: 9pt; color: #666; margin-bottom: 2px; }
          .section { margin: 25px 0; }
          .section-title { font-size: 14pt; font-weight: 500; color: #2b83ba; margin-bottom: 10px; text-transform: uppercase; }
          .job, .edu-item { margin-bottom: 15px; padding-left: 15px; border-left: 2px solid #e0e0e0; position: relative; }
          .company, .institution { font-weight: 600; font-size: 11pt; color: #2b83ba; }
          .position, .degree { font-weight: 400; color: #666; }
          .date, .location { font-size: 9pt; color: #888; }
          .skill-category { font-weight: 600; color: #2b83ba; }
        `;
        case 3: // Banking
            return `
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #000; line-height: 1.4; font-size: 10pt; }
          .header { text-align: center; margin-bottom: 25px; padding-bottom: 10px; border-bottom: 1px solid #000; }
          .name { font-size: 20pt; font-weight: bold; margin-bottom: 8px; }
          .contact { font-size: 9pt; margin-bottom: 3px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 11pt; font-weight: bold; margin-bottom: 8px; text-decoration: underline; border-bottom: 1px solid #000; padding-bottom: 2px; }
          .job, .edu-item { margin-bottom: 10px; }
          .company, .institution { font-weight: bold; font-size: 10pt; }
          .date, .location { font-size: 9pt; }
          .skill-category { font-weight: bold; }
        `;
        case 4: // Deedy
            return `
          body { font-family: sans-serif; margin: 0; padding: 40px; color: #333; line-height: 1.3; font-size: 10pt; background: #fff; }
          .header { text-align: left; margin-bottom: 20px; }
          .name { font-size: 32pt; font-weight: 300; margin-bottom: 5px; color: #000; }
          .contact { font-size: 10pt; color: #666; margin-bottom: 2px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 12pt; font-weight: 600; color: #000; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
          .job, .edu-item { margin-bottom: 12px; }
          .company, .institution { font-weight: 600; font-size: 11pt; }
          .position, .degree { font-weight: 400; font-style: italic; }
          .date, .location { font-size: 9pt; color: #666; }
          .skill-category { font-weight: 600; }
        `;
        default:
            return `
          body { font-family: serif; margin: 0; padding: 40px; color: #000; line-height: 1.5; font-size: 11pt; }
          .header { text-align: center; margin-bottom: 25px; }
          .name { font-size: 24pt; font-weight: bold; }
          .section-title { font-size: 12pt; font-weight: bold; border-bottom: 1px solid #000; }
          .job, .edu-item { margin-bottom: 12px; }
        `;
    }
}

function generateHTML(data, templateId) {
    const styles = getTemplateStyles(templateId);
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            ${styles}
            .job-header, .edu-header { display: flex; justify-content: space-between; align-items: baseline; }
            ul { margin: 5px 0; padding-left: 20px; }
            li { margin-bottom: 2px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="name">${data.name}</div>
            <div class="contact">${[data.email, data.phone, data.address, ...(data.websites.map(w => w.name))].join(' • ')}</div>
        </div>
        ${data.sections.map(section => {
        if (section === 'profile') return '';
        if (section === 'work') {
            return `
                <div class="section">
                    <div class="section-title">Experience</div>
                    ${data.experience.map(job => `
                        <div class="job">
                            <div class="job-header">
                                <span class="company">${job.company}</span>
                                <span class="date">${job.startDate} - ${job.endDate}</span>
                            </div>
                            <div class="job-header">
                                <span class="position">${job.position}</span>
                                <span class="location">${job.location}</span>
                            </div>
                            <ul>${job.description.split('\n').map(l => `<li>${l.replace('• ', '')}</li>`).join('')}</ul>
                        </div>
                    `).join('')}
                </div>`;
        }
        if (section === 'education') {
            return `
                <div class="section">
                    <div class="section-title">Education</div>
                    ${data.education.map(edu => `
                        <div class="edu-item">
                            <div class="edu-header">
                                <span class="institution">${edu.institution}</span>
                                <span class="date">${edu.graduationDate}</span>
                            </div>
                            <div class="edu-header">
                                <span class="degree">${edu.degree} in ${edu.field}</span>
                                <span class="location">${edu.location}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        }
        if (section === 'skills') {
            return `
                <div class="section">
                    <div class="section-title">Skills</div>
                    ${data.skills.map(s => `
                        <div><span class="skill-category">${s.category}:</span> ${s.items.join(', ')}</div>
                    `).join('')}
                </div>`;
        }
        return '';
    }).join('')}
    </body>
    </html>`;
}

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1000 });

    const outputDir = path.join(__dirname, 'frontend/public/img/templates');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate previews for templates 1-4
    for (let i = 1; i <= 9; i++) {
        console.log(`Generating preview for template ${i}...`);
        const html = generateHTML(mockData, i);
        await page.setContent(html);
        await page.screenshot({
            path: path.join(outputDir, `template${i}.jpg`),
            type: 'jpeg',
            quality: 80
        });
    }

    await browser.close();
    console.log('All previews generated!');
}

run().catch(console.error);
