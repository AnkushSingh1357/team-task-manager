require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@taskflow.com' },
    update: {},
    create: { name: 'Alice Admin', email: 'alice@taskflow.com', password: adminPassword },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@taskflow.com' },
    update: {},
    create: { name: 'Bob Member', email: 'bob@taskflow.com', password: adminPassword },
  });

  const carol = await prisma.user.upsert({
    where: { email: 'carol@taskflow.com' },
    update: {},
    create: { name: 'Carol Dev', email: 'carol@taskflow.com', password: adminPassword },
  });

  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesign the company website with a fresh look',
      color: '#6366f1',
      createdBy: alice.id,
      members: {
        create: [
          { userId: alice.id, role: 'ADMIN' },
          { userId: bob.id, role: 'MEMBER' },
          { userId: carol.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Create tasks
  const tasks = [
    { title: 'Setup project repository', status: 'DONE', priority: 'HIGH', assignedTo: alice.id },
    { title: 'Design wireframes', status: 'DONE', priority: 'HIGH', assignedTo: bob.id },
    { title: 'Implement homepage', status: 'IN_PROGRESS', priority: 'HIGH', assignedTo: carol.id },
    { title: 'Write API documentation', status: 'IN_PROGRESS', priority: 'MEDIUM', assignedTo: bob.id },
    { title: 'Set up CI/CD pipeline', status: 'TODO', priority: 'MEDIUM', assignedTo: alice.id },
    { title: 'Write unit tests', status: 'TODO', priority: 'LOW', assignedTo: carol.id, dueDate: new Date(Date.now() - 86400000) },
  ];

  for (const t of tasks) {
    await prisma.task.create({
      data: {
        ...t,
        projectId: project.id,
        createdBy: alice.id,
        dueDate: t.dueDate || new Date(Date.now() + 7 * 86400000),
      },
    });
  }

  console.log('✅ Seed complete!');
  console.log('');
  console.log('Test accounts (password: password123):');
  console.log('  Admin: alice@taskflow.com');
  console.log('  Member: bob@taskflow.com');
  console.log('  Member: carol@taskflow.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
