import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";
import { jwtAuthenticator, tokenAuthenticator } from "@nats-io/nats-core";
import { connect } from "@nats-io/transport-node";
import { BrokerClientService } from "./broker-client.service";
import { AppConfig } from "@/config/app-config";

const brokerConnectionProvider = {
  provide: "NATS_CONNECTION",
  useFactory: async (configService: ConfigService<AppConfig, true>) => {
    const servers = configService.get("broker.servers", { infer: true });
    const authToken = configService.get("broker.authToken", { infer: true });
    const userJwt = configService.get("broker.userJwt", { infer: true });
    const userSeed = new TextEncoder().encode(
      configService.get("broker.userSeed", { infer: true }),
    );
    const nodeEnv = configService.get("nodeEnv", { infer: true });
    const clientId = `iot-infrared-service-${nodeEnv}-${process.env.NODE_APP_INSTANCE}`;
    const logger = new Logger("Nats");

    let authenticator: any;
    if (authToken) {
      authenticator = tokenAuthenticator(authToken);
    } else {
      authenticator = jwtAuthenticator(userJwt, userSeed);
    }

    const brokerConnection = await connect({
      name: clientId,
      servers: servers,
      authenticator: authenticator,
      inboxPrefix: `iot-infrared-service._INBOX`,
      debug: false,
      noEcho: nodeEnv !== "test",
      maxReconnectAttempts: -1,
      reconnectTimeWait: 2000,
    });

    (async () => {
      logger.debug(
        { clientId, servers },
        `Broker connected to Nats servers: ${brokerConnection.getServer()} with name ${clientId}`,
      );
      for await (const s of brokerConnection.status()) {
        logger.debug(`Broker ${s.type}: ${servers}`);
      }
    })().then();

    return brokerConnection;
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [brokerConnectionProvider, BrokerClientService],
  exports: [brokerConnectionProvider, BrokerClientService],
})
export class BrokerModule {}
