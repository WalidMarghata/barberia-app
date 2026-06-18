# La Barberia Hassan — Site + App

## 1. Rodar no seu computador

Pré-requisito: ter o **Node.js** instalado (versão 18 ou mais nova). Baixe em https://nodejs.org se não tiver.

Abra o terminal dentro desta pasta e rode:

```bash
npm install
npm run dev
```

Isso vai abrir um endereço (algo como `http://localhost:5173`) — abra no navegador pra ver o site rodando.

## 2. Editar o conteúdo

Abra `src/App.jsx`. No topo do arquivo tem:
- `SHOP` → telefone/WhatsApp, Instagram, endereço
- `HOURS` → horários de funcionamento
- `SERVICES` → lista de serviços, preços e duração

Salve o arquivo e a página atualiza sozinha (com `npm run dev` rodando).



O bloqueio de horarios ja reservados usa `localStorage`, ou seja, funciona dentro do mesmo navegador. Para impedir que clientes diferentes peguem o mesmo horario, voce vai precisar de um banco de dados simples no futuro (ex: Supabase, que tambem tem plano gratuito). Por enquanto, a confirmacao real do agendamento acontece pelo WhatsApp, entao funciona bem para o dia a dia.
