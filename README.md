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

## 3. Publicar no Vercel (gratuito)

### Opção A — pelo site do Vercel (mais simples, sem usar terminal)

1. Crie uma conta gratuita em https://github.com (se ainda não tiver)
2. Crie um repositório novo no GitHub e suba esta pasta para ele:
   ```bash
   git init
   git add .
   git commit -m "primeira versao do site"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
   git push -u origin main
   ```
3. Crie uma conta gratuita em https://vercel.com (pode entrar direto com a conta do GitHub)
4. No painel do Vercel, clique em "Add New" -> "Project"
5. Escolha o repositorio que voce acabou de subir
6. O Vercel detecta automaticamente que e um projeto Vite — nao precisa mudar nada, so clicar em "Deploy"
7. Em ~1 minuto ele te da um link tipo `seu-projeto.vercel.app` — ja e o site no ar

Depois disso, qualquer alteracao que voce fizer e enviar (`git push`) e publicada automaticamente.

### Opcao B — pelo terminal, sem GitHub

```bash
npm install -g vercel
vercel login
vercel
```

Responda as perguntas (pode aceitar as opcoes padrao). No final ele te da o link do site publicado. Para atualizar depois, rode `vercel --prod` de novo.

## 4. Dominio proprio (opcional)

No painel do projeto no Vercel, em Settings -> Domains, da pra conectar um dominio proprio (ex: `labarberiahassan.it`) gratuitamente — voce so paga o registro do dominio em si.

## Observacao sobre o agendamento

O bloqueio de horarios ja reservados usa `localStorage`, ou seja, funciona dentro do mesmo navegador. Para impedir que clientes diferentes peguem o mesmo horario, voce vai precisar de um banco de dados simples no futuro (ex: Supabase, que tambem tem plano gratuito). Por enquanto, a confirmacao real do agendamento acontece pelo WhatsApp, entao funciona bem para o dia a dia.
