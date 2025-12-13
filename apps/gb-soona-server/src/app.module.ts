import { RedisModule } from "./redis/redis.module";
import { Module } from "@nestjs/common";
import { AideModule } from "./aide/aide.module";
import { DemandeModule } from "./demande/demande.module";
import { ContactModule } from "./contact/contact.module";
import { UserModule } from "./user/user.module";
import { DocumentModule } from "./document/document.module";
import { UserNotificationPreferenceModule } from "./userNotificationPreference/userNotificationPreference.module";
import { InvitationModule } from "./invitation/invitation.module";
import { WebsiteDemandeModule } from "./websiteDemande/websiteDemande.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SecretsManagerModule } from "./providers/secrets/secretsManager.module";
import { StorageModule } from "./storage/storage.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ServeStaticOptionsService } from "./serveStaticOptions.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { TasksModule } from "./schedules/tasks.module";
import { ScheduleModule } from '@nestjs/schedule'; 
import { ACLModule } from "./auth/acl.module";
import { AuthModule } from "./auth/auth.module";
import { TypeDocumentModule } from "./typeDocument/typeDocument.module";

import { DemandeStatusHistoryModuleBase } from "./demandeStatusHistory/base/demandeStatusHistory.module.base";
import { DemandeActivityModule } from "./demandeActivity/demandeActivity.module";
import { VersementModule } from "./versement/versement.module";
import { VisiteModule } from "./visite/visite.module";
import { TelegramModule } from "./telegram/telegram.module";
import { CommitteeModule } from "./committee/committee.module";

@Module({
  controllers: [],
  imports: [
     ScheduleModule.forRoot(),
    TasksModule, 
    TypeDocumentModule,
    DemandeStatusHistoryModuleBase,
    StorageModule,
    ACLModule,
    AuthModule,
    AideModule,
    DemandeModule,
    ContactModule,
    UserModule,
    DocumentModule,
    UserNotificationPreferenceModule,
    InvitationModule,
    VisiteModule,
    WebsiteDemandeModule,
    DemandeActivityModule,
    HealthModule,
    PrismaModule,
    SecretsManagerModule,
    VersementModule,
    TelegramModule,
    CommitteeModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRootAsync({
      useClass: ServeStaticOptionsService,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => {
        const playground = configService.get("GRAPHQL_PLAYGROUND");
        const introspection = configService.get("GRAPHQL_INTROSPECTION");
        return {
          autoSchemaFile: "schema.graphql",
          uploads: false,
          sortSchema: true,
          playground,
          introspection: playground || introspection,
        };
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    RedisModule,
  ],
  providers: [],
})
export class AppModule {}
