import { Test } from "@nestjs/testing";
import {
  INestApplication,
  HttpStatus,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import request from "supertest";
import { ACGuard } from "nest-access-control";
import { DefaultAuthGuard } from "../../auth/defaultAuth.guard";
import { ACLModule } from "../../auth/acl.module";
import { AclFilterResponseInterceptor } from "../../interceptors/aclFilterResponse.interceptor";
import { AclValidateRequestInterceptor } from "../../interceptors/aclValidateRequest.interceptor";
import { map } from "rxjs";
import { AideController } from "../aide.controller";
import { AideService } from "../aide.service";

const nonExistingId = "nonExistingId";
const existingId = "existingId";
const CREATE_INPUT = {
  createdAt: new Date(),
  dateAide: new Date(),
  dateExpiration: new Date(),
  id: 42,
  infosCrediteur: "exampleInfosCrediteur",
  montant: 42,
  nombreVersements: 42,
  remarque: "exampleRemarque",
  suspendue: "true",
  updatedAt: new Date(),
};
const CREATE_RESULT = {
  createdAt: new Date(),
  dateAide: new Date(),
  dateExpiration: new Date(),
  id: 42,
  infosCrediteur: "exampleInfosCrediteur",
  montant: 42,
  nombreVersements: 42,
  remarque: "exampleRemarque",
  suspendue: "true",
  updatedAt: new Date(),
};
const FIND_MANY_RESULT = [
  {
    createdAt: new Date(),
    dateAide: new Date(),
    dateExpiration: new Date(),
    id: 42,
    infosCrediteur: "exampleInfosCrediteur",
    montant: 42,
    nombreVersements: 42,
    remarque: "exampleRemarque",
    suspendue: "true",
    updatedAt: new Date(),
  },
];
const FIND_ONE_RESULT = {
  createdAt: new Date(),
  dateAide: new Date(),
  dateExpiration: new Date(),
  id: 42,
  infosCrediteur: "exampleInfosCrediteur",
  montant: 42,
  nombreVersements: 42,
  remarque: "exampleRemarque",
  suspendue: "true",
  updatedAt: new Date(),
};

const service = {
  createAide() {
    return CREATE_RESULT;
  },
  aides: () => FIND_MANY_RESULT,
  aide: ({ where }: { where: { id: string } }) => {
    switch (where.id) {
      case existingId:
        return FIND_ONE_RESULT;
      case nonExistingId:
        return null;
    }
  },
};

const basicAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const argumentHost = context.switchToHttp();
    const request = argumentHost.getRequest();
    request.user = {
      roles: ["user"],
    };
    return true;
  },
};

const acGuard = {
  canActivate: () => {
    return true;
  },
};

const aclFilterResponseInterceptor = {
  intercept: (context: ExecutionContext, next: CallHandler) => {
    return next.handle().pipe(
      map((data) => {
        return data;
      })
    );
  },
};
const aclValidateRequestInterceptor = {
  intercept: (context: ExecutionContext, next: CallHandler) => {
    return next.handle();
  },
};

describe("Aide", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: AideService,
          useValue: service,
        },
      ],
      controllers: [AideController],
      imports: [ACLModule],
    })
      .overrideGuard(DefaultAuthGuard)
      .useValue(basicAuthGuard)
      .overrideGuard(ACGuard)
      .useValue(acGuard)
      .overrideInterceptor(AclFilterResponseInterceptor)
      .useValue(aclFilterResponseInterceptor)
      .overrideInterceptor(AclValidateRequestInterceptor)
      .useValue(aclValidateRequestInterceptor)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test("POST /aides", async () => {
    await request(app.getHttpServer())
      .post("/aides")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        dateAide: CREATE_RESULT.dateAide.toISOString(),
        dateExpiration: CREATE_RESULT.dateExpiration.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      });
  });

  test("GET /aides", async () => {
    await request(app.getHttpServer())
      .get("/aides")
      .expect(HttpStatus.OK)
      .expect([
        {
          ...FIND_MANY_RESULT[0],
          createdAt: FIND_MANY_RESULT[0].createdAt.toISOString(),
          dateAide: FIND_MANY_RESULT[0].dateAide.toISOString(),
          dateExpiration: FIND_MANY_RESULT[0].dateExpiration.toISOString(),
          updatedAt: FIND_MANY_RESULT[0].updatedAt.toISOString(),
        },
      ]);
  });

  test("GET /aides/:id non existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/aides"}/${nonExistingId}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: `No resource was found for {"${"id"}":"${nonExistingId}"}`,
        error: "Not Found",
      });
  });

  test("GET /aides/:id existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/aides"}/${existingId}`)
      .expect(HttpStatus.OK)
      .expect({
        ...FIND_ONE_RESULT,
        createdAt: FIND_ONE_RESULT.createdAt.toISOString(),
        dateAide: FIND_ONE_RESULT.dateAide.toISOString(),
        dateExpiration: FIND_ONE_RESULT.dateExpiration.toISOString(),
        updatedAt: FIND_ONE_RESULT.updatedAt.toISOString(),
      });
  });

  test("POST /aides existing resource", async () => {
    const agent = request(app.getHttpServer());
    await agent
      .post("/aides")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        dateAide: CREATE_RESULT.dateAide.toISOString(),
        dateExpiration: CREATE_RESULT.dateExpiration.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      })
      .then(function () {
        agent
          .post("/aides")
          .send(CREATE_INPUT)
          .expect(HttpStatus.CONFLICT)
          .expect({
            statusCode: HttpStatus.CONFLICT,
          });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
