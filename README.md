# 🦉 FinançasPro v2.0 — Guia de Instalação Completa

> Versão 2.0 · Planilha Profissional · planilhaprofissional.com

---

## 📁 Estrutura do Repositório

```
financaspro/
├── index.html          ← Landing page de vendas
├── app.html            ← Sistema financeiro principal
├── manifest.json       ← Configuração PWA
├── sw.js               ← Service Worker
├── CNAME               ← financaspro.planilhaprofissional.com
├── Codigo.gs           ← Apps Script (backend) — NÃO vai no GitHub
├── css/app.css         ← Estilos do app
└── js/app.js           ← Lógica completa do app
```

---

## 1. GitHub Pages 

1. Crie o repositório: `github.com/SEU_USUARIO/financaspro`
2. Faça upload de todos os arquivos **exceto** `Codigo.gs`
3. Acesse **Settings → Pages**
4. Source: **Deploy from a branch → main**
5. Custom domain: `financaspro.planilhaprofissional.com`
6. Marque **Enforce HTTPS ✅**

---

## 2. DNS no Hostinger

Acesse o painel DNS da Hostinger e adicione:

| Tipo  | Nome        | Destino                     | TTL  |
|-------|-------------|-----------------------------|------|
| CNAME | financasprov2 | anamazzali.github.io      | 3600 |

---

## 3. Google Apps Script

1. Abra sua **Planilha Financeira** no Google Sheets
2. Vá em **Extensões → Apps Script**
3. Cole o conteúdo de `Codigo.gs` no editor
4. Salve (Ctrl+S)
5. Clique em **Implantar → Nova implantação**
   - Tipo: Aplicativo da Web
   - Executar como: **Eu (seu Gmail)**
   - Quem tem acesso: **Qualquer pessoa**
6. Copie a URL da implantação
7. No `js/app.js`, atualize a constante `SHEETS_URL` com essa URL
8. Faça o commit no GitHub

⚠️ **Para atualizações futuras:** Use sempre "Gerenciar implantações → Lápis → Nova versão" — **NUNCA crie nova implantação** ou a URL mudará.

---

## 4. Planilha de Clientes

Crie uma planilha separada com a aba `📋 Clientes` com estas colunas:

| # | Gmail | Nome | WhatsApp | Pedido Hotmart | Valor Pago | Data Compra | 1º Acesso | Último Acesso | Qtd Acessos | Vencimento | Status | Observações |
|---|-------|------|----------|---------------|-----------|-------------|-----------|--------------|------------|-----------|--------|-------------|

- Copie o **ID da planilha** da URL e atualize `CLIENTES_ID` no `Codigo.gs`
- Para liberar acesso manual: adicione o Gmail na coluna B e "Ativo" na coluna Status

---

## 5. Hotmart Webhook

1. Acesse Hotmart → **Ferramentas → Webhooks**
2. Adicione novo webhook:
   - **URL:** A URL do seu Apps Script
   - **Evento:** `PURCHASE_APPROVED`
   - **Versão API:** `2.0.0`
3. Salve e teste com uma compra de teste

Quando aprovado, o Gmail do comprador é automaticamente adicionado à planilha de clientes com Status "Ativo".

---

## 6. Google Cloud Console (OAuth)

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie ou use o projeto **FinancasPro**
3. APIs e Serviços → **Credenciais → Criar credencial → ID do cliente OAuth**
4. Tipo: **Aplicativo da Web**
5. Origens JavaScript autorizadas:
   - `https://financaspro.planilhaprofissional.com`
   - `https://SEU_USUARIO.github.io`
6. Copie o **Client ID** e atualize em `app.html` (campo `data-client_id`)
7. Vá em **Público-alvo → Publicar app** (para aceitar qualquer Gmail)

---

## 7. Planos disponíveis

| Plano | Preço | Inclui |
|-------|-------|--------|
| Essencial | R$ 97 único | App + suporte e-mail 30 dias |
| Profissional | R$ 147 único | App + atualizações 12 meses + suporte 90 dias + WhatsApp |
| Premium Anual | R$ 197/ano | App + atualizações sempre + suporte prioritário contínuo |

Link de vendas Hotmart: `https://go.hotmart.com/W105603611X`
WhatsApp suporte: +55 66 99238-8026

---

## 8. Checklist mensal de manutenção

- [ ] Verificar clientes com vencimento próximo
- [ ] Conferir webhooks com erro no histórico Hotmart
- [ ] Verificar logs do Apps Script (Execuções)
- [ ] Backup da planilha de clientes

---

*FinançasPro v2.0 · planilhaprofissional.com · Maio 2026*
