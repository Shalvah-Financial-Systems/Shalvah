# Shalvah - Sistema de Gestão Financeira para MEI

Sistema frontend desenvolvido em Next.js para gestão financeira de Microempreendedores Individuais (MEI).

## 🚀 Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de UI
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de dados
- **Framer Motion** - Animações
- **Chart.js** - Gráficos
- **Axios** - Requisições HTTP
- **Lucide React** - Ícones

## 🎨 Design

- Design responsivo e minimalista
- Tema em branco e azul
- Mobile-first approach
- Animações suaves com Framer Motion

## 📁 Estrutura do Projeto

```
├── app/
│   ├── login/              # Página de login
│   ├── dashboard/          # Dashboard principal
│   ├── nova-transacao/     # Formulário de nova transação
│   ├── configuracoes/      # Configurações do MEI
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página inicial (redirect)
├── components/
│   ├── ui/                 # Componentes do shadcn/ui
│   ├── Navbar.tsx          # Barra de navegação
│   ├── CardSaldo.tsx       # Cards de saldo, receitas e despesas
│   ├── GraficoFinanceiro.tsx # Gráfico de pizza
│   ├── ListaTransacoes.tsx # Lista de transações
│   └── FormularioTransacao.tsx # Formulário de transação
├── hooks/
│   └── useAuth.tsx         # Hook de autenticação
├── lib/
│   ├── api.ts             # Configuração do Axios
│   └── utils.ts           # Utilitários
├── types/
│   └── index.ts           # Tipos TypeScript
└── middleware.ts          # Middleware de autenticação
```

## 🔧 Instalação e Configuração

1. Clone o repositório:
```bash
git clone <url-do-repo>
cd shalvah
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse no navegador:
```
http://localhost:3000
```

## 🔐 Autenticação

O sistema utiliza autenticação baseada em cookies JWT com o backend NestJS:

- **Endpoint de login**: `POST http://localhost:3000/auth/login`
- **Endpoint de perfil**: `GET http://localhost:3000/auth/profile`
- **Endpoint de logout**: `POST http://localhost:3000/auth/logout`
- **Tipos de usuário**: `ENTERPRISE` | `ADMIN`
- **Proteção de rotas**: Middleware Next.js
- **Persistência**: Cookies HTTP-only gerenciados pelo backend

### Fluxo de Autenticação

1. **Login**: O frontend envia credenciais para `/auth/login`
2. **Cookie**: O backend retorna os dados do usuário e define o token JWT nos cookies
3. **Middleware**: Verifica a presença do token nos cookies para proteger rotas
4. **Perfil**: Busca dados do usuário em `/auth/profile` quando há token nos cookies
5. **Logout**: Remove o cookie de autenticação via `/auth/logout`

### Credenciais de Login

O sistema aceita tanto email quanto CNPJ como identificador de login.

## 🎨 Interface

### Layout
- **Sidebar lateral esquerda**: Navegação moderna e responsiva
- **Área de conteúdo**: Ocupa o espaço restante da tela
- **Design mobile-first**: Menu hambúrguer em dispositivos móveis
- **Animações**: Transições suaves com Framer Motion

### Sidebar Features
- **Colapso**: Permite reduzir a sidebar para economizar espaço
- **Indicador ativo**: Destaque visual da página atual
- **Avatar do usuário**: Dropdown com opções de perfil
- **Responsivo**: Overlay em mobile, fixa em desktop
- Resumo financeiro (saldo, receitas, despesas)
- Gráfico de pizza com distribuição de receitas/despesas
- Lista das últimas transações
- Botões para editar/excluir transações

### Transações
- Formulário para nova transação
- Tipos: Receita ou Despesa
- Categorização automática
- Validação com Zod

### Configurações MEI
- Configuração de faturamento mensal
- Cálculo automático do DAS
- Alertas sobre limites MEI
- Estimativas de impostos

## 📊 Funcionalidades

### Dashboard
- Visão geral do saldo
- Gráficos de receitas e despesas
- Acesso rápido às transações recentes
- Alertas de vencimento de DAS

### Transações
- Criação, edição e exclusão de transações
- Categorias personalizáveis
- Relatórios de receitas e despesas
- Exportação de dados financeiros

### Configurações
- Atualização de dados do perfil
- Alteração de senha
- Configuração de notificações
- Integração com contas bancárias

## 🎯 Recursos Implementados

### UX/UI
- ✅ Design responsivo
- ✅ Animações com Framer Motion
- ✅ Feedback visual nos botões
- ✅ Loading states
- ✅ Toast notifications
- ✅ Ícones do Lucide React

### Funcionalidades
- ✅ Sistema de autenticação completo
- ✅ Dashboard interativo
- ✅ CRUD de transações
- ✅ Cálculo automático do DAS
- ✅ Proteção de rotas
- ✅ Tratamento de erros

### Técnicas
- ✅ TypeScript com tipagem forte
- ✅ Validação de formulários
- ✅ Interceptadores de requisições
- ✅ Middleware de autenticação
- ✅ Componentes reutilizáveis

## 🔄 Integração com Backend

O frontend está preparado para integrar com uma API NestJS que deve fornecer os seguintes endpoints:

```
POST /auth/login          # Login
POST /auth/logout         # Logout
GET  /auth/me            # Dados do usuário logado
GET  /dashboard          # Dados do dashboard
GET  /transactions       # Lista de transações
POST /transactions       # Criar transação
PUT  /transactions/:id   # Editar transação
DELETE /transactions/:id # Excluir transação
GET  /mei-config        # Configurações MEI
PUT  /mei-config        # Atualizar configurações MEI
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deploy

Para fazer o deploy em produção:

```bash
npm run build
npm start
```

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

**Desenvolvido com ❤️ para MEIs**
