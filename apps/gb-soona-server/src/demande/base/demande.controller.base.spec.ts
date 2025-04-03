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
import { DemandeController } from "../demande.controller";
import { DemandeService } from "../demande.service";

const nonExistingId = "nonExistingId";
const existingId = "existingId";
const CREATE_INPUT = {
  agesEnfants: "exampleAgesEnfants",
  apl: 42,
  autresAides: "exampleAutresAides",
  autresCharges: 42,
  createdAt: new Date(),
  dateVisite: new Date(),
  dettes: 42,
  facturesEnergie: 42,
  id: 42,
  loyer: 42,
  natureDettes: "exampleNatureDettes",
  nombreEnfants: 42,
  remarques: "exampleRemarques",
  revenus: 42,
  revenusConjoint: 42,
  situationFamiliale: "exampleSituationFamiliale",
  situationProConjoint: "exampleSituationProConjoint",
  situationProfessionnelle: "exampleSituationProfessionnelle",
  status: "exampleStatus",
  updatedAt: new Date(),
};
const CREATE_RESULT = {
  agesEnfants: "exampleAgesEnfants",
  apl: 42,
  autresAides: "exampleAutresAides",
  autresCharges: 42,
  createdAt: new Date(),
  dateVisite: new Date(),
  dettes: 42,
  facturesEnergie: 42,
  id: 42,
  loyer: 42,
  natureDettes: "exampleNatureDettes",
  nombreEnfants: 42,
  remarques: "exampleRemarques",
  revenus: 42,
  revenusConjoint: 42,
  situationFamiliale: "exampleSituationFamiliale",
  situationProConjoint: "exampleSituationProConjoint",
  situationProfessionnelle: "exampleSituationProfessionnelle",
  status: "exampleStatus",
  updatedAt: new Date(),
};
const FIND_MANY_RESULT = [
  {
    agesEnfants: "exampleAgesEnfants",
    apl: 42,
    autresAides: "exampleAutresAides",
    autresCharges: 42,
    createdAt: new Date(),
    dateVisite: new Date(),
    dettes: 42,
    facturesEnergie: 42,
    id: 42,
    loyer: 42,
    natureDettes: "exampleNatureDettes",
    nombreEnfants: 42,
    remarques: "exampleRemarques",
    revenus: 42,
    revenusConjoint: 42,
    situationFamiliale: "exampleSituationFamiliale",
    situationProConjoint: "exampleSituationProConjoint",
    situationProfessionnelle: "exampleSituationProfessionnelle",
    status: "exampleStatus",
    updatedAt: new Date(),
  },
];
const FIND_ONE_RESULT = {
  agesEnfants: "exampleAgesEnfants",
  apl: 42,
  autresAides: "exampleAutresAides",
  autresCharges: 42,
  createdAt: new Date(),
  dateVisite: new Date(),
  dettes: 42,
  facturesEnergie: 42,
  id: 42,
  loyer: 42,
  natureDettes: "exampleNatureDettes",
  nombreEnfants: 42,
  remarques: "exampleRemarques",
  revenus: 42,
  revenusConjoint: 42,
  situationFamiliale: "exampleSituationFamiliale",
  situationProConjoint: "exampleSituationProConjoint",
  situationProfessionnelle: "exampleSituationProfessionnelle",
  status: "exampleStatus",
  updatedAt: new Date(),
};

const service = {
  createDemande() {
    return CREATE_RESULT;
  },
  demandes: () => FIND_MANY_RESULT,
  demande: ({ where }: { where: { id: string } }) => {
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

describe("Demande", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: DemandeService,
          useValue: service,
        },
      ],
      controllers: [DemandeController],
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

  test("POST /demandes", async () => {
    await request(app.getHttpServer())
      .post("/demandes")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        dateVisite: CREATE_RESULT.dateVisite.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      });
  });

  test("GET /demandes", async () => {
    await request(app.getHttpServer())
      .get("/demandes")
      .expect(HttpStatus.OK)
      .expect([
        {
          ...FIND_MANY_RESULT[0],
          createdAt: FIND_MANY_RESULT[0].createdAt.toISOString(),
          dateVisite: FIND_MANY_RESULT[0].dateVisite.toISOString(),
          updatedAt: FIND_MANY_RESULT[0].updatedAt.toISOString(),
        },
      ]);
  });

  test("GET /demandes/:id non existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/demandes"}/${nonExistingId}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: `No resource was found for {"${"id"}":"${nonExistingId}"}`,
        error: "Not Found",
      });
  });

  test("GET /demandes/:id existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/demandes"}/${existingId}`)
      .expect(HttpStatus.OK)
      .expect({
        ...FIND_ONE_RESULT,
        createdAt: FIND_ONE_RESULT.createdAt.toISOString(),
        dateVisite: FIND_ONE_RESULT.dateVisite.toISOString(),
        updatedAt: FIND_ONE_RESULT.updatedAt.toISOString(),
      });
  });

  test("POST /demandes existing resource", async () => {
    const agent = request(app.getHttpServer());
    await agent
      .post("/demandes")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        dateVisite: CREATE_RESULT.dateVisite.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      })
      .then(function () {
        agent
          .post("/demandes")
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
