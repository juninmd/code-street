# 🗺️ Roadmap Estratégico - CodeStreet

Este documento detalha a visão de longo prazo e as metas de curto prazo para a evolução do **CodeStreet**, a exchange definitiva de roadmaps para o ecossistema SaaS.

---

## 📈 Resumo da Trajetória (Milestones)

A evolução do CodeStreet é dividida em quatro fases principais, focadas em estabilidade, inteligência, escalabilidade e integração global.

| Fase | Título | Status | Objetivo |
| :--- | :--- | :--- | :--- |
| **I** | Core & Market Foundation | ✅ 100% | Criar a engine de negociação básica e o PWA. |
| **II** | Sniper Engine & Analytics | 🏃 60% | Implementar IA para análise de ativos (features). |
| **III** | SaaS Scaling & Multitenancy | 🕒 0% | Expandir para múltiplos times e integração de pagamentos. |
| **IV** | Global Ecosystem & API | 🔮 0% | Tornar o CodeStreet o padrão para backlogs públicos. |

---

## 🚀 Fase I: Core & Market Foundation (Concluído ✅)
*Foco na criação da infraestrutura básica para o MVP funcional.*

*   **Infraestrutura Core:**
    *   [x] Arquitetura monorepo com React 19 + Node.js (Express).
    *   [x] Configuração de banco de dados SQLite para transações locais.
*   **Engine Financeira (Jules):**
    *   [x] Lógica de IPO (Initial Price Offering) de features.
    *   [x] Cálculo automático de Underwriting Fee (5%) em cada trade.
    *   [x] Atomicidade nas transações de compra e venda.
*   **Experiência do Usuário (Spark):**
    *   [x] Ticker Tape em tempo real com animações CSS Tailwind v4.
    *   [x] Manifesto PWA e Service Worker para experiência instalável.
    *   [x] Dashboard do Admin para monitoramento de ARR e transações.
*   **Segurança (Sentinel):**
    *   [x] Implementação de scripts de auditoria de dados (`verify_visuals.py`).

---

## 📉 Fase II: Sniper Engine & Analytics (Em Progresso 🏃)
*Foco em inteligência competitiva e fidelidade da simulação de mercado.*

*   **Inteligência de Mercado (Spark):**
    *   [x] Implementação do **Sniper Mode**: Dashboard visual para identificar "gems" (features subvalorizadas).
    *   [ ] Algoritmo de sentimento baseado no histórico de commits e feedbacks.
*   **Engine de Dados (Jules):**
    *   [x] Refinamento dos cálculos de dividendos projetados.
    *   [x] Histórico de preços em gráficos de velas (Candlestick charts) para cada feature.
    *   [x] Dark Pools e Short Selling mechanics.
    *   [x] Opções de Compra e Venda (Calls/Puts) para especulação.
    *   [ ] API de exportação de dados em CSV/JSON para análise externa.
*   **Qualidade Sentinel (Sentinel):**
    *   [ ] Testes de carga para simular 10.000 trades simultâneos.
    *   [ ] Sistema de alertas automáticos para anomalias no mercado.

---

## 🎨 Fase III: SaaS Scaling & UX Avançada (Próximos Passos 🕒)
*Foco na transição de uma ferramenta interna para uma plataforma multi-tenant robusta.*

*   **SaaS Infrastructure (Jules):**
    *   [ ] Implementação de autenticação JWT segura com roles de usuário (Investor, Manager, Admin).
    *   [ ] Suporte a múltiplos workspaces (Times/Empresas diferentes no mesmo DB).
    *   [ ] Assinatura SaaS Multi-tenant (Cobrança por workspace ativo e features listadas).
    *   [ ] Integração de Webhooks para notificações externas (Discord/Slack).
*   **UX Pro (Spark):**
    *   [x] Melhorias PWA: Manifesto standalone com cores temáticas instalável em Android/iOS.
    *   [x] Gamificação e Engajamento: Mystery Crates, Daily Dividends e Mining.
    *   [ ] Suporte nativo a Temas Customizados (Dark, Light, High Contrast).
    *   [ ] App nativo (React Native/Expo) para maior presença em app stores.
    *   [ ] Sistema de notificações Push reais via Firebase Cloud Messaging.
*   **Compliance (Sentinel):**
    *   [ ] Auditoria de segurança externa e testes de penetração.
    *   [ ] Implementação de logs de atividade imutáveis (Hash chain).

---

## 🌐 Fase IV: Real-world Integrations & Future (Futuro 🔮)
*Foco em transformar o CodeStreet na "NASDAQ do Código".*

*   **Ecosystem Integration:**
    *   [ ] Integração profunda com GitHub Actions e Jira para auto-IPO de features baseada em código.
    *   [ ] Gateway de pagamento real (Stripe/PayPal) para monetização direta de roadmaps.
    *   [ ] Mercado de tokens (Crypto/Web3) para liquidez descentralizada de features.
*   **Advanced Analytics:**
    *   [ ] Previsão de entrega de features baseada na volatilidade do mercado.
    *   [ ] Dashboard de ROI para investidores (stakeholders reais da empresa).

---

## 📄 Notas de Versão

*   **V1.0.0 (Atual):** MVP funcional com exchange, PWA e dashboard admin básico.
*   **V1.1.0 (Q2 2024):** Sniper Mode v2 e Gráficos de Histórico.

---

*"Turning code into capital. Buy the future, short the delay."*
