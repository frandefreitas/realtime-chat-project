# Handlers / Use Case Architecture

Este pacote adiciona handlers (Use Cases) para cada endpoint existente, seguindo o padrão do `iot-infrared-service`:

- Interface comum: `ICommandHandler.execute(command)`
- 1 handler por operação (endpoint)
- Testes unitários por handler (`*.handler.spec.ts`) com TestModule e mocks

## Como integrar (controllers -> handlers)

**Exemplo (AuthController.login):**
```ts
constructor(private readonly loginHandler: LoginHandler) {}

@Post('login')
async login(@Body() dto: LoginDto) {
  return this.loginHandler.execute({ usernameOrEmail: dto.usernameOrEmail, password: dto.password });
}
```

## Como registrar no módulo

No `AuthModule`:
```ts
providers: [
  AuthService,
  LoginHandler,
  LogoutHandler,
  RegisterHandler,
]
```

Faça o equivalente em `UsersModule`, `ChatModule`, `PresenceModule` e `AppModule` para seus handlers.

## Testes
Rode seus testes:
```
npm test
```
ou
```
pnpm test
```
