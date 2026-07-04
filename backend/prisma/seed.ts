import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with 170+ jobs...');

  const categories = [
    "Accounting And Finance", "Agriculture", "Architecture And Urban Planning",
    "Beauty And Grooming", "Business And Commerce", "Construction And Civil Engineering",
    "Creative Art And Design", "Customer Service And Care", "Data Mining And Analytics",
    "Documentation And Writing Services", "Entertainment", "Event Management And Organization",
    "Fashion Design", "Food And Drink Preparation Or Service", "Gardening And Landscaping",
    "Health Care", "Horticulture", "Hospitality And Tourism", "Human Resource And Talent Management",
    "Information Technology", "Installation And Maintenance Technician", "Janitorial And Other Office Services",
    "Labor Work And Masonry", "Law", "Livestock And Animal Husbandry", "Logistic And Supply Chain",
    "Manufacturing And Production", "Marketing And Advertisement", "Mechanical And Electrical Engineering",
    "Media And Communication", "Multimedia Content Production", "Pharmaceutical",
    "Project Management And Administration", "Purchasing And Procurement", "Research And Data Analytics",
    "Sales And Promotion", "Secretarial And Office Management", "Security And Safety",
    "Software Design And Development", "Teaching And Tutor", "Training And Consultancy",
    "Training And Mentorship", "Translation And Transcription", "Transportation",
    "Transportation And Delivery", "Veterinary", "Woodwork And Carpentry",
    "Advisory And Consultancy", "Aeronautics And Aerospace", "Broker And Case Closer",
    "Chemical And Biomedical Engineering", "Clothing And Textile", "Environmental And Energy Engineering",
    "Psychiatry, Psychology And Social Work", "Shop And Office Attendant"
  ];

  await Promise.all(
    categories.map(cat => {
      const slug = cat.toLowerCase().replace(/[, ]+/g, '-').replace(/-+$/g, '');
      return prisma.jobCategory.upsert({
        where: { slug },
        update: {},
        create: { slug, label: cat, icon: 'briefcase' }
      });
    })
  );
  console.log(`✅ ${categories.length} categories created`);

  const companies = await Promise.all(
    [
      { name: 'Tech Innovations Ethiopia', email: 'employer1@beleqet.com' },
      { name: 'Digital Solutions Inc', email: 'employer2@beleqet.com' },
      { name: 'Creative Media Co', email: 'employer3@beleqet.com' },
      { name: 'Ethiopian Airlines', email: 'employer4@beleqet.com' },
      { name: 'Dashen Bank', email: 'employer5@beleqet.com' },
      { name: 'St. Paul\'s Hospital', email: 'employer6@beleqet.com' },
      { name: 'DBE Construction', email: 'employer7@beleqet.com' },
      { name: 'Addis Hotels Group', email: 'employer8@beleqet.com' },
      { name: 'Ethiopian Coffee Export', email: 'employer9@beleqet.com' },
      { name: 'Ethio Telecom', email: 'employer10@beleqet.com' },
      { name: 'East Africa Consulting', email: 'employer11@beleqet.com' },
      { name: 'Addis Manufacturing', email: 'employer12@beleqet.com' },
      { name: 'Ethiopian Logistics Ltd', email: 'employer13@beleqet.com' },
      { name: 'Abyssinia IT Services', email: 'employer14@beleqet.com' },
      { name: 'Horn of Africa Education', email: 'employer15@beleqet.com' },
      { name: 'Google Africa', email: 'employer16@beleqet.com' },
      { name: 'Microsoft Development', email: 'employer17@beleqet.com' },
      { name: 'Amazon Web Services', email: 'employer18@beleqet.com' },
      { name: 'Stripe', email: 'employer19@beleqet.com' },
      { name: 'Figma Design', email: 'employer20@beleqet.com' },
    ].map(async (comp) => {
      const user = await prisma.user.upsert({
        where: { email: comp.email },
        update: {},
        create: {
          email: comp.email,
          passwordHash: await bcrypt.hash('password123', 10),
          firstName: comp.name.split(' ')[0],
          lastName: 'Company',
          role: 'EMPLOYER',
          isActive: true,
          emailVerified: true,
        }
      });
      return prisma.company.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          name: comp.name,
          description: `${comp.name} - Leading company`,
          industry: 'Technology',
          size: '100-500',
          location: 'Addis Ababa, Ethiopia',
          website: `https://${comp.name.toLowerCase().replace(/\s+/g, '')}.com`,
          verified: true,
        }
      });
    })
  );
  console.log(`✅ ${companies.length} companies created`);

  const allCategories = await prisma.jobCategory.findMany();
  const categoryMap = new Map(allCategories.map(c => [c.label, c.id]));

  const jobsData = [
    { title: 'Senior Backend Developer', cat: 'Software Design And Development', co: 0, min: 150000, max: 250000 },
    { title: 'Full Stack Developer', cat: 'Software Design And Development', co: 1, min: 120000, max: 200000 },
    { title: 'Frontend Developer (React)', cat: 'Software Design And Development', co: 2, min: 110000, max: 180000 },
    { title: 'DevOps Engineer', cat: 'Software Design And Development', co: 0, min: 130000, max: 220000 },
    { title: 'Mobile App Developer', cat: 'Software Design And Development', co: 1, min: 100000, max: 170000 },
    { title: 'QA Automation Engineer', cat: 'Software Design And Development', co: 0, min: 90000, max: 150000 },
    { title: 'Backend Developer (Python)', cat: 'Software Design And Development', co: 3, min: 110000, max: 150000 },
    { title: 'Frontend Engineer (Vue)', cat: 'Software Design And Development', co: 15, min: 100000, max: 160000 },
    { title: 'Web Developer', cat: 'Software Design And Development', co: 1, min: 50000, max: 100000 },
    { title: 'Cloud Architect', cat: 'Software Design And Development', co: 16, min: 160000, max: 280000 },
    { title: 'Systems Administrator', cat: 'Software Design And Development', co: 2, min: 80000, max: 130000 },
    { title: 'Database Administrator', cat: 'Software Design And Development', co: 15, min: 95000, max: 160000 },
    { title: 'Cybersecurity Specialist', cat: 'Software Design And Development', co: 15, min: 110000, max: 180000 },
    { title: 'Machine Learning Engineer', cat: 'Data Mining And Analytics', co: 0, min: 140000, max: 250000 },
    { title: 'Data Scientist', cat: 'Data Mining And Analytics', co: 15, min: 120000, max: 200000 },
    { title: 'Data Analyst', cat: 'Data Mining And Analytics', co: 12, min: 70000, max: 130000 },
    { title: 'Business Intelligence Analyst', cat: 'Data Mining And Analytics', co: 16, min: 80000, max: 150000 },
    { title: 'IT Support Specialist', cat: 'Information Technology', co: 12, min: 40000, max: 75000 },
    { title: 'Digital Marketing Manager', cat: 'Marketing And Advertisement', co: 2, min: 70000, max: 120000 },
    { title: 'Content Marketing Specialist', cat: 'Marketing And Advertisement', co: 3, min: 50000, max: 90000 },
    { title: 'Social Media Manager', cat: 'Marketing And Advertisement', co: 4, min: 40000, max: 80000 },
    { title: 'SEO Specialist', cat: 'Marketing And Advertisement', co: 5, min: 60000, max: 100000 },
    { title: 'Brand Manager', cat: 'Marketing And Advertisement', co: 6, min: 75000, max: 130000 },
    { title: 'Email Marketing Coordinator', cat: 'Marketing And Advertisement', co: 7, min: 35000, max: 70000 },
    { title: 'Market Research Analyst', cat: 'Marketing And Advertisement', co: 8, min: 55000, max: 95000 },
    { title: 'Advertising Executive', cat: 'Marketing And Advertisement', co: 9, min: 65000, max: 110000 },
    { title: 'Marketing Analyst', cat: 'Marketing And Advertisement', co: 10, min: 45000, max: 85000 },
    { title: 'Growth Marketing Manager', cat: 'Marketing And Advertisement', co: 17, min: 80000, max: 140000 },
    { title: 'Senior Accountant', cat: 'Accounting And Finance', co: 4, min: 80000, max: 140000 },
    { title: 'Financial Analyst', cat: 'Accounting And Finance', co: 5, min: 70000, max: 120000 },
    { title: 'Accountant', cat: 'Accounting And Finance', co: 3, min: 50000, max: 90000 },
    { title: 'Tax Consultant', cat: 'Accounting And Finance', co: 4, min: 75000, max: 130000 },
    { title: 'CFO', cat: 'Accounting And Finance', co: 6, min: 120000, max: 200000 },
    { title: 'Payroll Specialist', cat: 'Accounting And Finance', co: 1, min: 40000, max: 75000 },
    { title: 'Auditor', cat: 'Accounting And Finance', co: 5, min: 65000, max: 110000 },
    { title: 'Budget Analyst', cat: 'Accounting And Finance', co: 4, min: 55000, max: 95000 },
    { title: 'Investment Analyst', cat: 'Accounting And Finance', co: 5, min: 85000, max: 150000 },
    { title: 'Finance Manager', cat: 'Accounting And Finance', co: 4, min: 90000, max: 160000 },
    { title: 'Clinical Nurse', cat: 'Health Care', co: 5, min: 45000, max: 80000 },
    { title: 'Medical Doctor', cat: 'Health Care', co: 5, min: 100000, max: 180000 },
    { title: 'Pharmacist', cat: 'Pharmaceutical', co: 5, min: 65000, max: 110000 },
    { title: 'Laboratory Technician', cat: 'Health Care', co: 5, min: 35000, max: 65000 },
    { title: 'Health Officer', cat: 'Health Care', co: 9, min: 50000, max: 85000 },
    { title: 'Surgeon', cat: 'Health Care', co: 5, min: 150000, max: 250000 },
    { title: 'Radiologist', cat: 'Health Care', co: 5, min: 120000, max: 200000 },
    { title: 'Public Health Officer', cat: 'Health Care', co: 6, min: 55000, max: 95000 },
    { title: 'HR Manager', cat: 'Human Resource And Talent Management', co: 2, min: 75000, max: 130000 },
    { title: 'Office Manager', cat: 'Secretarial And Office Management', co: 3, min: 45000, max: 80000 },
    { title: 'Admin Executive', cat: 'Secretarial And Office Management', co: 4, min: 40000, max: 70000 },
    { title: 'Training Coordinator', cat: 'Training And Consultancy', co: 1, min: 50000, max: 85000 },
    { title: 'Talent Acquisition Specialist', cat: 'Human Resource And Talent Management', co: 2, min: 55000, max: 95000 },
    { title: 'HR Consultant', cat: 'Training And Consultancy', co: 10, min: 70000, max: 125000 },
    { title: 'Payroll Administrator', cat: 'Human Resource And Talent Management', co: 1, min: 35000, max: 65000 },
    { title: 'Employee Relations Officer', cat: 'Human Resource And Talent Management', co: 2, min: 50000, max: 85000 },
    { title: 'Corporate Trainer', cat: 'Training And Mentorship', co: 14, min: 60000, max: 110000 },
    { title: 'Organizational Development Manager', cat: 'Human Resource And Talent Management', co: 2, min: 80000, max: 140000 },
    { title: 'Sales Manager', cat: 'Sales And Promotion', co: 7, min: 70000, max: 130000 },
    { title: 'Business Development Executive', cat: 'Sales And Promotion', co: 8, min: 55000, max: 100000 },
    { title: 'Sales Representative', cat: 'Sales And Promotion', co: 3, min: 35000, max: 75000 },
    { title: 'Account Executive', cat: 'Sales And Promotion', co: 9, min: 60000, max: 110000 },
    { title: 'Business Analyst', cat: 'Business And Commerce', co: 0, min: 65000, max: 120000 },
    { title: 'Procurement Officer', cat: 'Purchasing And Procurement', co: 1, min: 50000, max: 90000 },
    { title: 'Sales Engineer', cat: 'Sales And Promotion', co: 15, min: 70000, max: 130000 },
    { title: 'Key Account Manager', cat: 'Sales And Promotion', co: 17, min: 75000, max: 140000 },
    { title: 'Business Consultant', cat: 'Advisory And Consultancy', co: 10, min: 80000, max: 150000 },
    { title: 'Enterprise Architect', cat: 'Business And Commerce', co: 16, min: 120000, max: 200000 },
    { title: 'Partnership Manager', cat: 'Sales And Promotion', co: 18, min: 70000, max: 125000 },
    { title: 'Territory Manager', cat: 'Sales And Promotion', co: 3, min: 50000, max: 95000 },
    { title: 'Project Manager (Civil)', cat: 'Construction And Civil Engineering', co: 6, min: 100000, max: 150000 },
    { title: 'Site Engineer', cat: 'Construction And Civil Engineering', co: 6, min: 70000, max: 110000 },
    { title: 'Architect', cat: 'Architecture And Urban Planning', co: 6, min: 80000, max: 140000 },
    { title: 'Structural Engineer', cat: 'Construction And Civil Engineering', co: 6, min: 75000, max: 130000 },
    { title: 'Construction Manager', cat: 'Project Management And Administration', co: 6, min: 90000, max: 160000 },
    { title: 'Safety Inspector', cat: 'Security And Safety', co: 6, min: 45000, max: 80000 },
    { title: 'Hotel Manager', cat: 'Hospitality And Tourism', co: 7, min: 90000, max: 140000 },
    { title: 'Chef', cat: 'Food And Drink Preparation Or Service', co: 7, min: 50000, max: 90000 },
    { title: 'Front Desk Manager', cat: 'Hospitality And Tourism', co: 7, min: 40000, max: 75000 },
    { title: 'Event Manager', cat: 'Event Management And Organization', co: 7, min: 55000, max: 100000 },
    { title: 'Housekeeping Supervisor', cat: 'Janitorial And Other Office Services', co: 7, min: 35000, max: 65000 },
    { title: 'Sommelier', cat: 'Food And Drink Preparation Or Service', co: 7, min: 45000, max: 85000 },
    { title: 'Travel Consultant', cat: 'Hospitality And Tourism', co: 7, min: 40000, max: 75000 },
    { title: 'Restaurant Manager', cat: 'Hospitality And Tourism', co: 7, min: 50000, max: 90000 },
    { title: 'Export Manager', cat: 'Agriculture', co: 8, min: 85000, max: 135000 },
    { title: 'Agricultural Engineer', cat: 'Agriculture', co: 8, min: 65000, max: 115000 },
    { title: 'Quality Control Officer', cat: 'Agriculture', co: 8, min: 45000, max: 75000 },
    { title: 'Farm Manager', cat: 'Agriculture', co: 8, min: 55000, max: 100000 },
    { title: 'Livestock Specialist', cat: 'Livestock And Animal Husbandry', co: 8, min: 50000, max: 85000 },
    { title: 'Crop Specialist', cat: 'Agriculture', co: 8, min: 50000, max: 85000 },
    { title: 'Network Engineer', cat: 'Information Technology', co: 9, min: 95000, max: 145000 },
    { title: 'Network Security Specialist', cat: 'Security And Safety', co: 9, min: 100000, max: 170000 },
    { title: 'Technical Support Manager', cat: 'Customer Service And Care', co: 9, min: 60000, max: 110000 },
    { title: 'Customer Support Manager', cat: 'Customer Service And Care', co: 9, min: 50000, max: 85000 },
    { title: 'Call Center Manager', cat: 'Customer Service And Care', co: 9, min: 45000, max: 80000 },
    { title: 'UI/UX Designer', cat: 'Creative Art And Design', co: 0, min: 80000, max: 150000 },
    { title: 'Graphic Designer', cat: 'Creative Art And Design', co: 1, min: 50000, max: 100000 },
    { title: 'Web Designer', cat: 'Creative Art And Design', co: 2, min: 60000, max: 110000 },
    { title: 'Motion Graphics Designer', cat: 'Creative Art And Design', co: 3, min: 70000, max: 130000 },
    { title: 'Art Director', cat: 'Creative Art And Design', co: 4, min: 75000, max: 140000 },
    { title: 'Brand Designer', cat: 'Creative Art And Design', co: 2, min: 65000, max: 120000 },
    { title: 'Product Designer', cat: 'Creative Art And Design', co: 17, min: 85000, max: 150000 },
    { title: 'Illustrator', cat: 'Creative Art And Design', co: 1, min: 55000, max: 105000 },
    { title: 'Video Producer', cat: 'Multimedia Content Production', co: 2, min: 60000, max: 110000 },
    { title: 'Animator', cat: 'Multimedia Content Production', co: 3, min: 65000, max: 125000 },
    { title: 'Supply Chain Manager', cat: 'Logistic And Supply Chain', co: 8, min: 85000, max: 150000 },
    { title: 'Warehouse Supervisor', cat: 'Logistic And Supply Chain', co: 8, min: 45000, max: 80000 },
    { title: 'Logistics Coordinator', cat: 'Logistic And Supply Chain', co: 11, min: 40000, max: 70000 },
    { title: 'Transportation Manager', cat: 'Transportation And Delivery', co: 11, min: 65000, max: 120000 },
    { title: 'Customs Broker', cat: 'Logistic And Supply Chain', co: 11, min: 60000, max: 110000 },
    { title: 'Inventory Manager', cat: 'Logistic And Supply Chain', co: 8, min: 50000, max: 90000 },
    { title: 'Fleet Manager', cat: 'Transportation And Delivery', co: 11, min: 55000, max: 105000 },
    { title: 'Dispatch Coordinator', cat: 'Logistic And Supply Chain', co: 11, min: 35000, max: 65000 },
    { title: 'Customer Service Supervisor', cat: 'Customer Service And Care', co: 9, min: 50000, max: 85000 },
    { title: 'Customer Success Manager', cat: 'Customer Service And Care', co: 17, min: 55000, max: 100000 },
    { title: 'Support Specialist', cat: 'Customer Service And Care', co: 18, min: 35000, max: 65000 },
    { title: 'Quality Assurance Specialist', cat: 'Customer Service And Care', co: 1, min: 40000, max: 75000 },
    { title: 'Complaint Handler', cat: 'Customer Service And Care', co: 9, min: 30000, max: 60000 },
    { title: 'Project Manager', cat: 'Project Management And Administration', co: 6, min: 75000, max: 130000 },
    { title: 'Scrum Master', cat: 'Project Management And Administration', co: 0, min: 70000, max: 120000 },
    { title: 'Product Manager', cat: 'Project Management And Administration', co: 17, min: 85000, max: 150000 },
    { title: 'Program Manager', cat: 'Project Management And Administration', co: 16, min: 80000, max: 145000 },
    { title: 'University Lecturer', cat: 'Teaching And Tutor', co: 14, min: 55000, max: 100000 },
    { title: 'Online Tutor', cat: 'Teaching And Tutor', co: 14, min: 20000, max: 50000 },
    { title: 'Curriculum Developer', cat: 'Training And Consultancy', co: 16, min: 50000, max: 95000 },
    { title: 'Learning & Development Manager', cat: 'Training And Consultancy', co: 2, min: 70000, max: 125000 },
    { title: 'Instructional Designer', cat: 'Training And Consultancy', co: 14, min: 60000, max: 110000 },
    { title: 'Content Creator', cat: 'Media And Communication', co: 2, min: 40000, max: 90000 },
    { title: 'Journalist', cat: 'Media And Communication', co: 11, min: 45000, max: 85000 },
    { title: 'Editor', cat: 'Media And Communication', co: 11, min: 50000, max: 95000 },
    { title: 'Podcast Producer', cat: 'Multimedia Content Production', co: 2, min: 35000, max: 75000 },
    { title: 'Social Media Content Creator', cat: 'Media And Communication', co: 3, min: 40000, max: 80000 },
    { title: 'Production Manager', cat: 'Manufacturing And Production', co: 11, min: 70000, max: 130000 },
    { title: 'Quality Assurance Manager', cat: 'Manufacturing And Production', co: 11, min: 65000, max: 120000 },
    { title: 'Plant Manager', cat: 'Manufacturing And Production', co: 11, min: 90000, max: 160000 },
    { title: 'Industrial Engineer', cat: 'Mechanical And Electrical Engineering', co: 11, min: 75000, max: 135000 },
    { title: 'Maintenance Technician', cat: 'Installation And Maintenance Technician', co: 11, min: 45000, max: 80000 },
    { title: 'Shift Supervisor', cat: 'Manufacturing And Production', co: 11, min: 50000, max: 90000 },
    { title: 'Legal Counsel', cat: 'Law', co: 4, min: 100000, max: 180000 },
    { title: 'Compliance Officer', cat: 'Law', co: 5, min: 70000, max: 130000 },
    { title: 'Contract Manager', cat: 'Law', co: 4, min: 65000, max: 120000 },
    { title: 'Paralegal', cat: 'Law', co: 4, min: 45000, max: 85000 },
    { title: 'Security Manager', cat: 'Security And Safety', co: 6, min: 60000, max: 110000 },
    { title: 'IT Security Officer', cat: 'Security And Safety', co: 12, min: 85000, max: 150000 },
    { title: 'Security Guard Supervisor', cat: 'Security And Safety', co: 7, min: 40000, max: 75000 },
    { title: 'Risk Management Specialist', cat: 'Security And Safety', co: 5, min: 75000, max: 140000 },
    { title: 'Translator', cat: 'Translation And Transcription', co: 0, min: 50000, max: 100000 },
    { title: 'Veterinarian', cat: 'Veterinary', co: 8, min: 80000, max: 150000 },
    { title: 'Carpenter', cat: 'Woodwork And Carpentry', co: 6, min: 35000, max: 70000 },
    { title: 'Landscape Architect', cat: 'Gardening And Landscaping', co: 7, min: 55000, max: 105000 },
    { title: 'Research Scientist', cat: 'Research And Data Analytics', co: 15, min: 100000, max: 180000 },
    { title: 'Energy Engineer', cat: 'Environmental And Energy Engineering', co: 16, min: 110000, max: 190000 },
    { title: 'Fashion Designer', cat: 'Fashion Design', co: 2, min: 60000, max: 120000 },
  ];

  const gapJobsData = [
    // Beauty And Grooming
    { title: 'Senior Hair Stylist', cat: 'Beauty And Grooming', co: 7, min: 25000, max: 55000 },
    { title: 'Makeup Artist', cat: 'Beauty And Grooming', co: 2, min: 20000, max: 45000 },
    { title: 'Spa Therapist', cat: 'Beauty And Grooming', co: 7, min: 22000, max: 48000 },
    { title: 'Barber Shop Manager', cat: 'Beauty And Grooming', co: 3, min: 18000, max: 40000 },
    // Documentation And Writing Services
    { title: 'Technical Writer', cat: 'Documentation And Writing Services', co: 0, min: 55000, max: 95000 },
    { title: 'Document Controller', cat: 'Documentation And Writing Services', co: 6, min: 35000, max: 65000 },
    { title: 'Proposal Writer', cat: 'Documentation And Writing Services', co: 10, min: 45000, max: 85000 },
    { title: 'Grant Writer', cat: 'Documentation And Writing Services', co: 15, min: 40000, max: 75000 },
    // Entertainment
    { title: 'Event MC / Host', cat: 'Entertainment', co: 3, min: 15000, max: 45000 },
    { title: 'Music Producer', cat: 'Entertainment', co: 2, min: 35000, max: 80000 },
    { title: 'Stage Manager', cat: 'Entertainment', co: 7, min: 30000, max: 65000 },
    { title: 'Film Production Assistant', cat: 'Entertainment', co: 3, min: 25000, max: 55000 },
    // Horticulture
    { title: 'Greenhouse Manager', cat: 'Horticulture', co: 8, min: 40000, max: 75000 },
    { title: 'Plant Nursery Supervisor', cat: 'Horticulture', co: 8, min: 30000, max: 60000 },
    { title: 'Horticulturist', cat: 'Horticulture', co: 9, min: 35000, max: 70000 },
    { title: 'Landscape Horticulturist', cat: 'Horticulture', co: 8, min: 38000, max: 72000 },
    // Labor Work And Masonry
    { title: 'Skilled Mason', cat: 'Labor Work And Masonry', co: 6, min: 25000, max: 50000 },
    { title: 'Construction Laborer', cat: 'Labor Work And Masonry', co: 6, min: 15000, max: 35000 },
    { title: 'Bricklayer', cat: 'Labor Work And Masonry', co: 7, min: 22000, max: 45000 },
    { title: 'Tile Setter', cat: 'Labor Work And Masonry', co: 6, min: 24000, max: 48000 },
    // Transportation
    { title: 'Bus Driver', cat: 'Transportation', co: 11, min: 18000, max: 35000 },
    { title: 'Fleet Operations Coordinator', cat: 'Transportation', co: 11, min: 35000, max: 65000 },
    { title: 'Driving Instructor', cat: 'Transportation', co: 13, min: 20000, max: 40000 },
    { title: 'Heavy Truck Driver', cat: 'Transportation', co: 11, min: 22000, max: 42000 },
    // Aeronautics And Aerospace
    { title: 'Aircraft Maintenance Technician', cat: 'Aeronautics And Aerospace', co: 4, min: 80000, max: 140000 },
    { title: 'Aviation Safety Officer', cat: 'Aeronautics And Aerospace', co: 4, min: 90000, max: 150000 },
    { title: 'Flight Operations Coordinator', cat: 'Aeronautics And Aerospace', co: 4, min: 70000, max: 120000 },
    { title: 'Ground Handling Supervisor', cat: 'Aeronautics And Aerospace', co: 4, min: 55000, max: 95000 },
    // Broker And Case Closer
    { title: 'Real Estate Broker', cat: 'Broker And Case Closer', co: 10, min: 45000, max: 120000 },
    { title: 'Insurance Broker', cat: 'Broker And Case Closer', co: 5, min: 50000, max: 110000 },
    { title: 'Claims Case Closer', cat: 'Broker And Case Closer', co: 5, min: 40000, max: 85000 },
    { title: 'Mortgage Loan Officer', cat: 'Broker And Case Closer', co: 5, min: 55000, max: 100000 },
    // Chemical And Biomedical Engineering
    { title: 'Chemical Process Engineer', cat: 'Chemical And Biomedical Engineering', co: 12, min: 85000, max: 150000 },
    { title: 'Biomedical Equipment Technician', cat: 'Chemical And Biomedical Engineering', co: 5, min: 65000, max: 110000 },
    { title: 'Quality Control Chemist', cat: 'Chemical And Biomedical Engineering', co: 12, min: 70000, max: 125000 },
    { title: 'Pharmaceutical Production Engineer', cat: 'Chemical And Biomedical Engineering', co: 5, min: 90000, max: 160000 },
    // Clothing And Textile
    { title: 'Textile Production Supervisor', cat: 'Clothing And Textile', co: 11, min: 40000, max: 75000 },
    { title: 'Garment Pattern Maker', cat: 'Clothing And Textile', co: 2, min: 35000, max: 65000 },
    { title: 'Textile Quality Inspector', cat: 'Clothing And Textile', co: 11, min: 30000, max: 55000 },
    { title: 'Industrial Sewing Machine Operator', cat: 'Clothing And Textile', co: 11, min: 18000, max: 35000 },
    // Psychiatry, Psychology And Social Work
    { title: 'Clinical Psychologist', cat: 'Psychiatry, Psychology And Social Work', co: 5, min: 70000, max: 130000 },
    { title: 'Social Worker', cat: 'Psychiatry, Psychology And Social Work', co: 6, min: 40000, max: 75000 },
    { title: 'School Counselor', cat: 'Psychiatry, Psychology And Social Work', co: 14, min: 45000, max: 85000 },
    { title: 'Mental Health Nurse', cat: 'Psychiatry, Psychology And Social Work', co: 5, min: 50000, max: 90000 },
    // Shop And Office Attendant
    { title: 'Retail Shop Attendant', cat: 'Shop And Office Attendant', co: 9, min: 12000, max: 25000 },
    { title: 'Office Receptionist', cat: 'Shop And Office Attendant', co: 3, min: 15000, max: 30000 },
    { title: 'Supermarket Cashier', cat: 'Shop And Office Attendant', co: 9, min: 12000, max: 22000 },
    { title: 'Store Supervisor', cat: 'Shop And Office Attendant', co: 9, min: 20000, max: 40000 },
  ];

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'HYBRID', 'CONTRACT'] as const;

  async function createJob(job: typeof jobsData[0], index: number) {
    const categoryId = categoryMap.get(job.cat);
    if (!categoryId) return false;

    const exists = await prisma.job.findFirst({
      where: { title: job.title, categoryId },
    });
    if (exists) return false;

    await prisma.job.create({
      data: {
        title: job.title,
        description: `Join ${companies[job.co].name} as a ${job.title}. We are looking for motivated professionals to contribute to our growing team in Ethiopia.`,
        categoryId,
        companyId: companies[job.co].id,
        type: jobTypes[index % jobTypes.length],
        salaryMin: job.min,
        salaryMax: job.max,
        currency: 'ETB',
        location: index % 3 === 0 ? 'Remote' : index % 2 === 0 ? 'Addis Ababa' : 'Bahir Dar',
        status: 'PUBLISHED',
        featured: index % 7 === 0,
      },
    });
    return true;
  }

  let jobCount = 0;
  for (const job of jobsData) {
    const categoryId = categoryMap.get(job.cat);
    if (!categoryId) continue;
    await prisma.job.create({
      data: {
        title: job.title,
        description: `Exciting ${job.title} opportunity`,
        categoryId,
        companyId: companies[job.co].id,
        type: jobTypes[jobCount % jobTypes.length],
        salaryMin: job.min,
        salaryMax: job.max,
        currency: 'ETB',
        location: jobCount % 3 === 0 ? 'Remote' : 'Addis Ababa',
        status: 'PUBLISHED',
        featured: jobCount % 5 === 0,
      }
    });
    jobCount++;
  }

  let gapCount = 0;
  for (let i = 0; i < gapJobsData.length; i++) {
    if (await createJob(gapJobsData[i], jobCount + i)) gapCount++;
  }

  console.log(`✅ ${jobCount} jobs created`);
  console.log(`✅ ${gapCount} gap-filler jobs added (empty categories)`);

  // Freelance categories & gigs
  const freelanceCategories = [
    { slug: 'graphic-design', label: 'Graphic Design', icon: 'palette' },
    { slug: 'web-development', label: 'Web Development', icon: 'code-2' },
    { slug: 'digital-marketing', label: 'Digital Marketing', icon: 'megaphone' },
    { slug: 'video-animation', label: 'Video & Animation', icon: 'clapperboard' },
    { slug: 'writing', label: 'Writing & Translation', icon: 'pen-line' },
  ];

  const freelanceCatRecords = await Promise.all(
    freelanceCategories.map(cat =>
      prisma.freelanceCategory.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );
  console.log(`✅ ${freelanceCatRecords.length} freelance categories created`);

  const freelancer = await prisma.user.upsert({
    where: { email: 'freelancer@beleqet.com' },
    update: {},
    create: {
      email: 'freelancer@beleqet.com',
      passwordHash: await bcrypt.hash('password123', 10),
      firstName: 'Demo',
      lastName: 'Freelancer',
      role: 'FREELANCER',
      isActive: true,
      emailVerified: true,
      skills: ['React', 'Node.js', 'UI Design'],
    },
  });

  const gigsData = [
    { title: 'Build a Company Website', cat: 1, client: 0, min: 50000, max: 120000, days: 30 },
    { title: 'Mobile App UI Design', cat: 0, client: 2, min: 30000, max: 80000, days: 14 },
    { title: 'Social Media Campaign', cat: 2, client: 4, min: 20000, max: 60000, days: 21 },
    { title: 'Product Explainer Video', cat: 3, client: 6, min: 40000, max: 100000, days: 10 },
    { title: 'Technical Blog Writing', cat: 4, client: 8, min: 15000, max: 45000, days: 7 },
    { title: 'E-commerce Platform', cat: 1, client: 10, min: 150000, max: 350000, days: 60 },
    { title: 'Brand Identity Design', cat: 0, client: 12, min: 25000, max: 70000, days: 14 },
    { title: 'SEO Audit & Optimization', cat: 2, client: 14, min: 18000, max: 55000, days: 10 },
    { title: 'Logo Animation', cat: 3, client: 16, min: 12000, max: 35000, days: 5 },
    { title: 'API Documentation', cat: 4, client: 18, min: 10000, max: 30000, days: 7 },
  ];

  for (const gig of gigsData) {
    await prisma.freelanceJob.create({
      data: {
        title: gig.title,
        description: `Looking for a skilled professional to deliver: ${gig.title}.`,
        categoryId: freelanceCatRecords[gig.cat].id,
        clientId: companies[gig.client].userId,
        budgetMin: gig.min,
        budgetMax: gig.max,
        deadlineDays: gig.days,
        skills: ['Communication', 'Quality Delivery'],
        status: 'OPEN',
      },
    });
  }
  console.log(`✅ ${gigsData.length} freelance gigs created`);
  console.log(`✅ Demo freelancer: freelancer@beleqet.com / password123`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
