# 💈 Coast Barber Shop — PWA

> Aplicação Web Progressiva (PWA) de alta performance para agendamento, gestão de serviços e controle de acessos da barbearia **Coast Barber Shop**.

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-orange?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-React_%7C_Vite_%7C_Tailwind_%7C_Supabase-000000?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

---

## 📱 Sobre o Projeto

O **Coast Barber Shop PWA** é um ecossistema completo focado em proporcionar uma experiência fluida tanto para os clientes finais quanto para a gestão do estabelecimento. O sistema conta com agendamento online de cortes e barbas, clube de vantagens, vitrine de produtos e um painel administrativo com permissões dinâmicas.

### ✨ Principais Funcionalidades

* **💻 Para o Cliente:**
  * **Agendamento Inteligente:** Escolha de serviço, barbeiro, data e horário em poucos cliques.
  * **Clube de Assinatura:** Sistema de pontos, níveis de fidelidade e vantagens exclusivas.
  * **Loja & Vitrine:** Catálogo interativo de produtos da barbearia.
  * **Perfil do Usuário:** Histórico de agendamentos e acompanhamento de status.

* **🛡️ Para o Admin & Barbeiros (RBAC):**
  * **Painel de Gestão:** Controle total da agenda diária e status de atendimentos.
  * **Controle de Acessos Flexível (RBAC):** Matriz dinâmica de permissões para criar e gerenciar cargos (*Admin, Barbeiro, Recepcionista, Atendente, etc.*).
  * **Gestão de Catálogo:** Cadastro e edição em tempo real de serviços e produtos.

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
| :--- | :--- |
| **Front-end** | React, Vite, TypeScript, Tailwind CSS |
| **Back-end & Database** | Supabase (PostgreSQL, Row Level Security) |
| **Arquitetura de Acesso** | SQL-based RBAC (*Roles & Permissions Matrix*) |
| **CI/CD & Deploy** | GitHub, Vercel |

---

## 🗄️ Arquitetura do Banco de Dados (RBAC)

O projeto utiliza um modelo de **Role-Based Access Control (RBAC)** desacoplado, garantindo segurança extrema via políticas de RLS (*Row Level Security*):
```
[auth.users] ───► [profiles] ───► [roles] ◄─── [role_permissions] ───► [permissions]
```
* **`roles`**: Armazena os cargos do sistema (fixos e customizáveis).
* **`permissions`**: Define ações específicas (*view_agenda, manage_services, manage_roles*).
* **`role_permissions`**: Tabela pivot que mapeia a matriz de permissões ativas para cada cargo.

---

## 🚀 Estrutura do Projeto

```text
├── supabase/
│   └── migrations/        # Scripts SQL e controle de versão do banco
├── src/
│   ├── components/        # Componentes reutilizáveis de UI
│   ├── pages/             # Telas principais (Início, Agendar, Clube, Loja, Perfil)
│   ├── lib/               # Inicialização de clientes (Supabase, etc)
│   └── types/             # Definições de tipos TypeScript e RBAC
└── README.md
```

## ⚙️ Variáveis de Ambiente
Para rodar o projeto localmente ou em ambientes de produção, configure as seguintes chaves no seu arquivo .env:
```code
VITE_SUPABASE_URL=[https://seu-projeto.supabase.co](https://seu-projeto.supabase.co)
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-r2bhjusz)
