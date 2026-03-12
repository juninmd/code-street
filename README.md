# 📈 CodeStreet - The Feature Futures Exchange (SaaS)

![React 19](https://img.shields.io/badge/frontend-React%2019-blue.svg)
![Node.js](https://img.shields.io/badge/backend-Node.js-green.svg)
![Tailwind CSS v4](https://img.shields.io/badge/UI-Tailwind%20v4-blueviolet.svg)
![PWA](https://img.shields.io/badge/mobile-PWA%20Ready-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**CodeStreet** é a primeira plataforma de roadmap financiada coletivamente que transforma solicitações de recursos em ativos financeiros negociáveis. É um marketplace B2B SaaS onde equipes de produto podem monetizar seu backlog através de uma simulação de mercado de alta fidelidade.

---

## 💎 Visão Geral do Produto

O CodeStreet resolve o problema da priorização de recursos transformando o backlog em um mercado aberto. Em vez de votação simples, os usuários "investem" em recursos que desejam ver implementados. Isso cria um sinal de mercado real para gerentes de produto, onde o capital (mesmo que simulado) dita a urgência e o valor.

### 🌟 Diferenciais Competitivos

*   **Financial Signal for Product:** Substitui o "eu acho" por "o mercado diz".
*   **Predictive Revenue:** Projetar ARR com base no interesse de IPO de novas features.
*   **Crowdsourced Prioritization:** Onde os stakeholders votam com seu orçamento.
*   **Viral Growth Loop:** Incentiva usuários a compartilhar features para aumentar o valor de suas ações.

---

## ✨ Recursos de Elite (V1 MVP)

### 📊 Mercado de Futuros & IPOs
Compre ações em features antes mesmo de serem codificadas. O sistema gerencia o lançamento de novos "Ativos de Código", permitindo que os usuários comprem fatias de valor de uma funcionalidade futura. Dinheiro real, priorização real.

### 🎯 Sniper Mode (AI Analytics)
Utiliza análise de mercado orientada por IA para encontrar ativos (features) subvalorizados. O Sniper Mode analisa o sentimento dos commits, a velocidade de desenvolvimento e a demanda dos usuários para sugerir os melhores investimentos.

### 👑 Executive Dashboard
Painel de receita estilo SaaS para o administrador rastrear a taxa de 5% (Underwriting Fee), o ARR projetado e o AUM (Assets Under Management) total da plataforma.

### 📱 PWA Nativo de Alta Performance
Instalável em Android e iOS para uma experiência de aplicativo nativa fluida. Utiliza Service Workers avançados para garantir que o ticker tape funcione mesmo em conexões instáveis.

### 📉 Live Ticker Tape
Feed em tempo real de atividades de mercado, negociações e flutuações de preços, criando o "FOMO" necessário para impulsionar a participação.

---

## 🛠️ Stack Tecnológica de Próxima Geração

O CodeStreet foi construído para ser rápido, escalável e fácil de manter, utilizando o que há de mais moderno no ecossistema web.

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | [React 19](https://react.dev/) | Utilizando Server Components e melhorias de renderização. |
| **Bundler** | [Vite](https://vite.dev/) | Para um HMR instantâneo e build otimizado. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Engine CSS-first para performance extrema e design tokens. |
| **Backend** | [Node.js](https://nodejs.org/) | Ambiente de execução JavaScript rápido e escalável. |
| **Framework API** | [Express](https://expressjs.com/) | Estrutura minimalista para rotas e middleware. |
| **Database** | [SQLite3](https://sqlite.org/) | Banco de dados local robusto com zero configuração. |
| **PWA** | Vite PWA Plugin | Configuração completa de offline e instalação. |

---

## 🚀 Guia de Início Rápido

### Pré-requisitos

*   **Node.js:** Versão 18.x ou superior (LTS recomendada).
*   **Gerenciador de Pacotes:** `pnpm` (extremamente recomendado para economia de disco e velocidade).

### Instalação

```bash
# Clone este repositório de elite
git clone git@github.com:juninmd/surprise.git

# Entre na fortaleza
cd surprise

# Instale as dependências com velocidade máxima
pnpm install
```

### Executando o Ambiente de Desenvolvimento

Para rodar tanto o frontend quanto o backend simultaneamente em modo watch:

1.  **Iniciar o Backend (API & DB):**
    ```bash
    pnpm server
    ```
    O servidor estará ouvindo na porta `3000`.

2.  **Iniciar o Frontend (Vite):**
    ```bash
    pnpm dev
    ```
    Acesse em `http://localhost:5173`. O Vite faz o proxy automático para a porta 3000.

---

## 📂 Arquitetura do Sistema

```text
surprise/
├── src/                # Core do Frontend React 19
│   ├── components/     # UI Atômica e Shadcn-like
│   ├── hooks/          # Lógica de mercado (useTicker, useMarket)
│   ├── store/          # Gerenciamento de estado (Zustand/Context)
│   └── assets/         # Imagens e ícones otimizados
├── server/             # Motor do Backend
│   ├── routes/         # Definições de API REST
│   ├── db/             # Esquemas e sementes do SQLite
│   └── index.js        # Ponto de entrada Express
├── public/             # Ativos estáticos e manifesto PWA
├── scripts/            # Verificação visual e automação de CI/CD
└── .jules/             # Configurações de agentes e automação local
```

---

## 🔒 Segurança & Governança

O CodeStreet segue rigorosos padrões de segurança para garantir a integridade da simulação:

*   **Integridade Transacional:** Todas as operações de IPO e Trade são atômicas.
*   **Global Fee:** Taxa de 5% (Underwriting Fee) embutida na engine para simular rentabilidade SaaS.
*   **Data Validation:** Validação rigorosa no schema SQLite para evitar injeções e corrupção.
*   **Audit Trail:** Log completo de transações disponível para o Admin no Dashboard.

---

## 🤝 Ecossistema de Contribuição

O projeto CodeStreet é regido pelo padrão **Antigravity**.

1.  Consulte o [AGENTS.md](./AGENTS.md) para entender as personas de desenvolvimento.
2.  Verifique o [ROADMAP.md](./ROADMAP.md) para as prioridades atuais.
3.  Abra uma Issue ou envie um Pull Request seguindo o template.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais detalhes.

---

*"Turning code into capital. Buy the future, short the delay."*
