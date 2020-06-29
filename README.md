# Spottly

## Fluxo de deploy no firebase

- Buildar o projeto com `npm run build`
- Instalar o firebase tools: `npm i -g firebase-tools`
- Criar pasta `firebase`
- `cd firebase` e `firebase init`
- Escolher a opção `Hosting`
- Escolher o projeto (Crie antes)
- Somente dê enter no diretório public
- Configure **YES** para single page application
- Remover conteúdo inicial que é criado dentro da public: `rm public/*`
- Copiar conteúdo compilado do projeto para dentro da pasta public: `cp -a ../dist/* public/`
- Fazer o deploy do projeto para o firebase hosting: `firebase deploy --only hosting`