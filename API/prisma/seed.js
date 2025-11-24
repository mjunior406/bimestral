const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed Especialidades
  const specialties = ['Cardiologia', 'Dermatologia', 'Pediatria', 'Clínica Geral'];
  for (const spec of specialties) {
    await prisma.specialty.upsert({
      where: { name: spec },
      update: {},
      create: { name: spec },
    });
  }

  // Seed Cidades
  const cities = [
    { name: 'São Paulo', state: 'SP' },
    { name: 'Apucarana', state: 'PR' },
    { name: 'Rio de Janeiro', state: 'RJ' }
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { name_state: { name: city.name, state: city.state } },
      update: {},
      create: city,
    });
  }
  
  console.log('✅ Banco de dados populado com sucesso!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());