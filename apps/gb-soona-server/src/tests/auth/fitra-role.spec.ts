import { RolesBuilder } from "nest-access-control";
import grants from "../../grants.json";

describe("Role fitra (compte de service Fitra, lecture seule RGPD)", () => {
  const rolesBuilder = new RolesBuilder(grants as any);

  const permission = (resource: string, action: "read" | "create" | "update" | "delete", possession: "any" | "own" = "any") =>
    rolesBuilder.permission({ role: "fitra", resource, action, possession });

  it("peut lire Contact, avec uniquement les attributs minimisés", () => {
    const p = permission("Contact", "read");
    expect(p.granted).toBe(true);

    const contact = {
      id: 1,
      nom: "Bathily",
      prenom: "Salimata",
      telephone: "0600000000",
      email: "s.bathily@example.com",
      adresse: "1 rue des osiers",
      codePostal: 78990,
      ville: "Élancourt",
      numBeneficiaire: "B-1234",
      updatedAt: new Date(),
      // champs sensibles qui ne doivent jamais être exposés à Fitra
      remarques: "confidentiel",
      age: 42,
      dateNaissance: new Date(),
      status: "actif",
    };

    const filtered = p.filter(contact);
    expect(Object.keys(filtered).sort()).toEqual(
      [
        "id",
        "nom",
        "prenom",
        "telephone",
        "email",
        "adresse",
        "codePostal",
        "ville",
        "numBeneficiaire",
        "updatedAt",
      ].sort()
    );
    expect(filtered).not.toHaveProperty("remarques");
    expect(filtered).not.toHaveProperty("age");
    expect(filtered).not.toHaveProperty("dateNaissance");
    expect(filtered).not.toHaveProperty("status");
  });

  it("peut lire Demande, sans jamais exposer revenus/dettes/charges/remarques", () => {
    const p = permission("Demande", "read");
    expect(p.granted).toBe(true);

    const demande = {
      id: 42,
      status: "EnCours",
      categorieDemandeur: "Pauvre",
      situationFamiliale: "marié",
      nombreEnfants: 2,
      nombrePersonnes: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      // champs financiers/sensibles jamais exposés à Fitra
      revenus: 1200,
      dettes: 500,
      autresCharges: 300,
      remarques: "note interne",
      contactId: 1,
    };

    const filtered = p.filter(demande);
    expect(Object.keys(filtered).sort()).toEqual(
      [
        "id",
        "status",
        "categorieDemandeur",
        "situationFamiliale",
        "nombreEnfants",
        "nombrePersonnes",
        "createdAt",
        "updatedAt",
      ].sort()
    );
    expect(filtered).not.toHaveProperty("revenus");
    expect(filtered).not.toHaveProperty("dettes");
    expect(filtered).not.toHaveProperty("autresCharges");
    expect(filtered).not.toHaveProperty("remarques");
    expect(filtered).not.toHaveProperty("contactId");
  });

  it("ne peut faire aucune mutation sur Contact ou Demande", () => {
    expect(permission("Contact", "create").granted).toBe(false);
    expect(permission("Contact", "update").granted).toBe(false);
    expect(permission("Contact", "delete").granted).toBe(false);
    expect(permission("Demande", "create").granted).toBe(false);
    expect(permission("Demande", "update").granted).toBe(false);
    expect(permission("Demande", "delete").granted).toBe(false);
  });

  it("peut lire son propre profil User (login/userInfo) mais pas la liste des autres users", () => {
    expect(permission("User", "read", "own").granted).toBe(true);
    expect(permission("User", "read", "any").granted).toBe(false);
    expect(permission("User", "create").granted).toBe(false);
    expect(permission("User", "update").granted).toBe(false);
    expect(permission("User", "delete").granted).toBe(false);
  });

  it("n'a accès à aucune autre ressource (aides, documents, visites, versements, décisions, activités...)", () => {
    const forbiddenResources = [
      "Aide",
      "Document",
      "Visite",
      "Versement",
      "Decision",
      "DemandeActivity",
      "DemandeStatusHistory",
      "DemandeSituationHistory",
      "DemandeAutreCharge",
      "DemandeDetteDetail",
      "Invitation",
      "WebsiteDemande",
      "TypeDocument",
      "UserNotificationPreference",
    ];

    for (const resource of forbiddenResources) {
      expect(permission(resource, "read").granted).toBe(false);
      expect(permission(resource, "create").granted).toBe(false);
      expect(permission(resource, "update").granted).toBe(false);
      expect(permission(resource, "delete").granted).toBe(false);
    }
  });
});
