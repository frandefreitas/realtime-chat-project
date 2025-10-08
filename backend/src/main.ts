import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  app.setGlobalPrefix('api')

  app.enableCors({
    origin: (o, cb) => cb(null, !o || ['http://localhost:3000','http://127.0.0.1:3000'].includes(o)),
    credentials: true,
  });


  app.connectMicroservice({
    transport: 2,
    options: { servers: [process.env.NATS_URL || 'nats://127.0.0.1:4222'] }
  })

  await app.startAllMicroservices()
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000, '0.0.0.0');
}

bootstrap()
