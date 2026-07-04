/**
 * Idempotent seed: adds jobs only for categories that currently have 0 listings.
 * Run: npx ts-node prisma/seed-gap-jobs.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const gapJobsData = [
  { title: 'Senior Hair Stylist', cat: 'Beauty And Grooming', co: 7, min: 25000, max: 55000 },
  { title: 'Makeup Artist', cat: 'Beauty And Grooming', co: 2, min: 20000, max: 45000 },
  { title: 'Spa Therapist', cat: 'Beauty And Grooming', co: 7, min: 22000, max: 48000 },
  { title: 'Barber Shop Manager', cat: 'Beauty And Grooming', co: 3, min: 18000, max: 40000 },
  { title: 'Technical Writer', cat: 'Documentation And Writing Services', co: 0, min: 55000, max: 95000 },
  { title: 'Document Controller', cat: 'Documentation And Writing Services', co: 6, min: 35000, max: 65000 },
  { title: 'Proposal Writer', cat: 'Documentation And Writing Services', co: 10, min: 45000, max: 85000 },
  { title: 'Grant Writer', cat: 'Documentation And Writing Services', co: 15, min: 40000, max: 75000 },
  { title: 'Event MC / Host', cat: 'Entertainment', co: 3, min: 15000, max: 45000 },
  { title: 'Music Producer', cat: 'Entertainment', co: 2, min: 35000, max: 80000 },
  { title: 'Stage Manager', cat: 'Entertainment', co: 7, min: 30000, max: 65000 },
  { title: 'Film Production Assistant', cat: 'Entertainment', co: 3, min: 25000, max: 55000 },
  { title: 'Greenhouse Manager', cat: 'Horticulture', co: 8, min: 40000, max: 75000 },
  { title: 'Plant Nursery Supervisor', cat: 'Horticulture', co: 8, min: 30000, max: 60000 },
  { title: 'Horticulturist', cat: 'Horticulture', co: 9, min: 35000, max: 70000 },
  { title: 'Landscape Horticulturist', cat: 'Horticulture', co: 8, min: 38000, max: 72000 },
  { title: 'Skilled Mason', cat: 'Labor Work And Masonry', co: 6, min: 25000, max: 50000 },
  { title: 'Construction Laborer', cat: 'Labor Work And Masonry', co: 6, min: 15000, max: 35000 },
  { title: 'Bricklayer', cat: 'Labor Work And Masonry', co: 7, min: 22000, max: 45000 },
  { title: 'Tile Setter', cat: 'Labor Work And Masonry', co: 6, min: 24000, max: 48000 },
  { title: 'Bus Driver', cat: 'Transportation', co: 11, min: 18000, max: 35000 },
  { title: 'Fleet Operations Coordinator', cat: 'Transportation', co: 11, min: 35000, max: 65000 },
  { title: 'Driving Instructor', cat: 'Transportation', co: 13, min: 20000, max: 40000 },
  { title: 'Heavy Truck Driver', cat: 'Transportation', co: 11, min: 22000, max: 42000 },
  { title: 'Aircraft Maintenance Technician', cat: 'Aeronautics And Aerospace', co: 4, min: 80000, max: 140000 },
  { title: 'Aviation Safety Officer', cat: 'Aeronautics And Aerospace', co: 4, min: 90000, max: 150000 },
  { title: 'Flight Operations Coordinator', cat: 'Aeronautics And Aerospace', co: 4, min: 70000, max: 120000 },
  { title: 'Ground Handling Supervisor', cat: 'Aeronautics And Aerospace', co: 4, min: 55000, max: 95000 },
  { title: 'Real Estate Broker', cat: 'Broker And Case Closer', co: 10, min: 45000, max: 120000 },
  { title: 'Insurance Broker', cat: 'Broker And Case Closer', co: 5, min: 50000, max: 110000 },
  { title: 'Claims Case Closer', cat: 'Broker And Case Closer', co: 5, min: 40000, max: 85000 },
  { title: 'Mortgage Loan Officer', cat: 'Broker And Case Closer', co: 5, min: 55000, max: 100000 },
  { title: 'Chemical Process Engineer', cat: 'Chemical And Biomedical Engineering', co: 12, min: 85000, max: 150000 },
  { title: 'Biomedical Equipment Technician', cat: 'Chemical And Biomedical Engineering', co: 5, min: 65000, max: 110000 },
  { title: 'Quality Control Chemist', cat: 'Chemical And Biomedical Engineering', co: 12, min: 70000, max: 125000 },
  { title: 'Pharmaceutical Production Engineer', cat: 'Chemical And Biomedical Engineering', co: 5, min: 90000, max: 160000 },
  { title: 'Textile Production Supervisor', cat: 'Clothing And Textile', co: 11, min: 40000, max: 75000 },
  { title: 'Garment Pattern Maker', cat: 'Clothing And Textile', co: 2, min: 35000, max: 65000 },
  { title: 'Textile Quality Inspector', cat: 'Clothing And Textile', co: 11, min: 30000, max: 55000 },
  { title: 'Industrial Sewing Machine Operator', cat: 'Clothing And Textile', co: 11, min: 18000, max: 35000 },
  { title: 'Clinical Psychologist', cat: 'Psychiatry, Psychology And Social Work', co: 5, min: 70000, max: 130000 },
  { title: 'Social Worker', cat: 'Psychiatry, Psychology And Social Work', co: 6, min: 40000, max: 75000 },
  { title: 'School Counselor', cat: 'Psychiatry, Psychology And Social Work', co: 14, min: 45000, max: 85000 },
  { title: 'Mental Health Nurse', cat: 'Psychiatry, Psychology And Social Work', co: 5, min: 50000, max: 90000 },
  { title: 'Retail Shop Attendant', cat: 'Shop And Office Attendant', co: 9, min: 12000, max: 25000 },
  { title: 'Office Receptionist', cat: 'Shop And Office Attendant', co: 3, min: 15000, max: 30000 },
  { title: 'Supermarket Cashier', cat: 'Shop And Office Attendant', co: 9, min: 12000, max: 22000 },
  { title: 'Store Supervisor', cat: 'Shop And Office Attendant', co: 9, min: 20000, max: 40000 },
];

const jobTypes = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'HYBRID', 'CONTRACT'] as const;

async function main() {
  const categories = await prisma.jobCategory.findMany();
  const categoryMap = new Map(categories.map((c) => [c.label, c.id]));

  const companies = await prisma.company.findMany({ orderBy: { createdAt: 'asc' } });
  if (companies.length === 0) {
    console.error('No companies found — run prisma:seed first.');
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < gapJobsData.length; i++) {
    const job = gapJobsData[i];
    const categoryId = categoryMap.get(job.cat);
    if (!categoryId) {
      console.warn(`Category not found: ${job.cat}`);
      continue;
    }

    const exists = await prisma.job.findFirst({
      where: { title: job.title, categoryId },
    });
    if (exists) {
      skipped++;
      continue;
    }

    const company = companies[job.co % companies.length];
    await prisma.job.create({
      data: {
        title: job.title,
        description: `Join ${company.name} as a ${job.title}. We are looking for motivated professionals to contribute to our growing team in Ethiopia.`,
        categoryId,
        companyId: company.id,
        type: jobTypes[i % jobTypes.length],
        salaryMin: job.min,
        salaryMax: job.max,
        currency: 'ETB',
        location: i % 3 === 0 ? 'Remote' : i % 2 === 0 ? 'Addis Ababa' : 'Bahir Dar',
        status: 'PUBLISHED',
        featured: i % 7 === 0,
      },
    });
    created++;
  }

  const emptyCategories = await prisma.jobCategory.findMany({
    where: { jobs: { none: {} } },
    select: { label: true },
  });

  console.log(`✅ Created ${created} new jobs (${skipped} already existed)`);
  if (emptyCategories.length > 0) {
    console.log(`⚠️  Categories still empty: ${emptyCategories.map((c) => c.label).join(', ')}`);
  } else {
    console.log('✅ All categories now have at least one job');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
