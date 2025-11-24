const fastify = require('fastify').default({ logger: true });
const cors = require('@fastify/cors');
const { jsonSchemaTransform, serializerCompiler, validatorCompiler } = require('fastify-type-provider-zod');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');

const prisma = new PrismaClient();

// Configuração do Zod para validação
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Plugins
fastify.register(cors);
fastify.register(require('@fastify/swagger'), {
  openapi: {
    info: { title: 'Cadê meu Médico? API', version: '1.0.0' },
  },
  transform: jsonSchemaTransform,
});
fastify.register(require('@fastify/swagger-ui'), { routePrefix: '/docs' });

// --- SCHEMAS DE VALIDAÇÃO ---
const createDoctorSchema = z.object({
  name: z.string().min(3),
  crm: z.string().min(4),
  specialties: z.array(z.number()).min(1, "Mínimo 1 especialidade"),
  cities: z.array(z.number()).min(1, "Mínimo 1 cidade"),
});

// --- ROTAS ---

// Health Check
fastify.get('/api/v1/health', async () => {
  return { status: 'ok', database: 'connected' };
});

// Listar Especialidades
fastify.get('/api/v1/specialties', async () => {
  return await prisma.specialty.findMany();
});

// Listar Cidades
fastify.get('/api/v1/cities', async () => {
  return await prisma.city.findMany();
});

// LISTAR MÉDICOS (Paginado)
fastify.get('/api/v1/doctors', {
  schema: {
    querystring: z.object({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(10),
    }),
  }
}, async (req) => {
  const { page, limit } = req.query;
  const skip = (page - 1) * limit;

  const [total, doctors] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.findMany({
      skip,
      take: limit,
      include: { specialties: true, cities: true }
    })
  ]);

  return { data: doctors, meta: { page, total, total_pages: Math.ceil(total / limit) } };
});

// BUSCA AVANÇADA
fastify.get('/api/v1/search/doctors', {
  schema: {
    querystring: z.object({
      name: z.string().optional(),
      specialty: z.string().optional(), // Busca por nome da especialidade
      city: z.string().optional(),      // Busca por nome da cidade
    })
  }
}, async (req) => {
  const { name, specialty, city } = req.query;

  const whereClause = {
    AND: [
      name ? { name: { contains: name } } : {},
      specialty ? { specialties: { some: { name: { contains: specialty } } } } : {},
      city ? { cities: { some: { name: { contains: city } } } } : {}
    ]
  };

  return await prisma.doctor.findMany({
    where: whereClause,
    include: { specialties: true, cities: true }
  });
});

// OBTER MÉDICO POR ID
fastify.get('/api/v1/doctors/:id', {
  schema: { params: z.object({ id: z.coerce.number() }) }
}, async (req, reply) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: req.params.id },
    include: { specialties: true, cities: true }
  });

  if (!doctor) return reply.status(404).send({ message: 'Médico não encontrado' });
  return doctor;
});

// CADASTRAR MÉDICO (Admin)
fastify.post('/api/v1/doctors', {
  schema: { body: createDoctorSchema }
}, async (req, reply) => {
  const { name, crm, specialties, cities } = req.body;

  try {
    const doctor = await prisma.doctor.create({
      data: {
        name,
        crm,
        specialties: { connect: specialties.map(id => ({ id })) },
        cities: { connect: cities.map(id => ({ id })) }
      }
    });
    return reply.status(201).send(doctor);
  } catch (error) {
    // Erro P2002 do Prisma é violação de unique constraint (CRM duplicado)
    if (error.code === 'P2002') {
      return reply.status(422).send({ message: 'CRM já cadastrado' });
    }
    return reply.status(500).send(error);
  }
});

// ATUALIZAR MÉDICO (Admin)
fastify.put('/api/v1/doctors/:id', {
  schema: { 
    params: z.object({ id: z.coerce.number() }),
    body: createDoctorSchema 
  }
}, async (req, reply) => {
  const { id } = req.params;
  const { name, crm, specialties, cities } = req.body;

  try {
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        name,
        crm,
        specialties: { set: [], connect: specialties.map(id => ({ id })) }, // Limpa e reconecta
        cities: { set: [], connect: cities.map(id => ({ id })) }
      }
    });
    return doctor;
  } catch (error) {
    if (error.code === 'P2025') return reply.status(404).send({ message: 'Médico não encontrado' });
    return reply.status(500).send(error);
  }
});

// REMOVER MÉDICO (Admin)
fastify.delete('/api/v1/doctors/:id', {
  schema: { params: z.object({ id: z.coerce.number() }) }
}, async (req, reply) => {
  try {
    await prisma.doctor.delete({ where: { id: req.params.id } });
    return reply.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return reply.status(404).send();
    return reply.status(500).send();
  }
});

// Inicialização
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('🚀 Server rodando em http://localhost:3000');
    console.log('📄 Documentação em http://localhost:3000/docs');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();