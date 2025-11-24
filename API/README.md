# Cadê meu Médico? - 

## 👥 Integrantes do Grupo

| RA | Nome Completo | GitHub |
|----|--------------|--------|
| [410031] | [Massayoshi Tatesuzi Junior] | [@mjunior406](https://github.com/mjunior406) |
| [410137] | [Nicolas Gisto Bahia] | [@NicolasGisto](https://github.com/NicolasGisto) |
| [409908] | [Noemi Kaori Taniguchi] | [@NoemiKT](https://github.com/NoemiKT) |
| [409892] | [Mariana Pereira de Andrade] | [](https://github.com/) |

---

## 📋 Descrição

Este projeto consiste em uma **API RESTful** desenvolvida para facilitar a busca de profissionais de saúde. O sistema permite o cadastro administrativo de médicos e oferece uma busca pública avançada para pacientes, filtrando profissionais por **especialidade** e **cidade**, garantindo integridade de dados como CRM único e validação de relacionamentos.

## 🎯 Objetivos Alcançados

- ✅ API REST completa com **CRUD de Médicos**.
- ✅ Sistema de busca avançada (Filtros por Nome, Especialidade e Cidade).
- ✅ Documentação automática via **Swagger / OpenAPI**.
- ✅ Validação robusta de dados de entrada (Zod).
- ✅ Paginação de resultados na listagem de médicos.
- ✅ Seeds de banco de dados (Cidades e Especialidades iniciais).

---

## 🚀 Tecnologias Utilizadas

- **Linguagem**: Node.js (v20+)
- **Framework**: Fastify (v4.26) - Escolhido pela alta performance.
- **Banco de Dados**: SQLite (Desenvolvimento) / Suporte a PostgreSQL.
- **ORM**: Prisma IO (v5.10).
- **Validação**: Zod.
- **Documentação API**: Swagger UI (@fastify/swagger).

---

## 🏗️ Arquitetura

### Diagrama de Arquitetura

> *Nota: O diagrama abaixo representa o fluxo de dados da aplicação.*

![Arquitetura do Sistema](docs/arquitetura.png)

*(Caso a imagem acima não carregue, veja a representação lógica abaixo)*:

```mermaid
graph TD
    Client[Cliente / Frontend] -->|HTTP Request| Fastify[API Gateway / Fastify]
    Fastify -->|Validação| Zod[Schema Validator]
    Fastify -->|Controller| Routes[Rotas da API]
    Routes -->|ORM| Prisma[Prisma Client]
    Prisma -->|SQL| DB[(Banco de Dados)]