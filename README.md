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


## Definir variáveis de ambiente para as funções do firebase

Executar: 

```bash
  $ firebase functions:config:set spotify.id="xxx"
  $ firebase functions:config:set spotify.secret="xxx"
```

## Testar funções localmente

- Acessar a pasta das funções e declarar o arquivo `.runtimeconfig.json` com as variáveis de ambiente
- Subir o emulador para rodar as funções: `firebase emulators:start --only functions`
- Verificar a porta onde está rodando (geralmente `5001`)
- No cliente, definir antes de chamar o método `httpsCallable` que deve acessar o emulador:
  
  ```js
    this.$firebase.functions().useFunctionsEmulator('http://localhost:xxxx');
  ```