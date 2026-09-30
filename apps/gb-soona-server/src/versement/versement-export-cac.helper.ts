import * as common from "@nestjs/common";
import archiver from "archiver";
import { format } from "date-fns";
import { Response } from "express";
import { join } from "path";
import { PrismaService } from "../prisma/prisma.service";

function sanitizeForPath(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, "-").trim();
}

function csvEscape(value: string | number): string {
  const str = String(value ?? "");
  return /[",;\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function documentEntryName(
  doc: { name?: string | null; contenu: unknown },
  fallback: string
): string {
  const contenu = doc.contenu as { filename?: string } | null;
  const original = contenu?.filename;
  const ext = original?.includes(".") ? original.slice(original.lastIndexOf(".")) : "";
  const base = sanitizeForPath((doc.name || fallback).toString());
  return base.toLowerCase().endsWith(ext.toLowerCase()) || !ext ? base : `${base}${ext}`;
}

// Evite les collisions de noms de fichiers au sein d'un meme dossier
// (ex: deux justificatifs comptables sans nom -> meme nom par defaut).
function uniqueEntryName(usedNames: Set<string>, name: string): string {
  const key = name.toLowerCase();
  if (!usedNames.has(key)) {
    usedNames.add(key);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let i = 2;
  let candidate = `${base} (${i})${ext}`;
  while (usedNames.has(candidate.toLowerCase())) {
    i++;
    candidate = `${base} (${i})${ext}`;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

// Genere le zip "Export CAC" destine au commissaire aux comptes : une ligne
// par versement verse dans versements.csv (colonne "Justificatif" = nom du
// dossier), et un dossier par versement contenant la preuve de virement du
// versement et les justificatifs comptables de l'aide concernee.
export async function generateVersementsExportCac(
  versementIds: number[],
  prisma: PrismaService,
  res: Response
): Promise<void> {
  const versements = await prisma.versement.findMany({
    where: { id: { in: versementIds }, status: "Verse" },
    include: {
      document: true,
      aide: {
        include: {
          contact: { select: { nom: true, prenom: true } },
          documents: true,
        },
      },
    },
    orderBy: { dataVersement: "asc" },
  });

  if (versements.length === 0) {
    throw new common.NotFoundException(
      "Aucun versement versé trouvé pour l'export."
    );
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="export-comptable-${format(new Date(), "dd-MM-yyyy")}.zip"`
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  const usedFolderNames = new Map<string, number>();
  const csvRows: string[] = ["Date;Bénéficiaire;Montant;Statut;Justificatif"];

  for (const versement of versements) {
    const contact = versement.aide?.contact;
    const nomPrenom =
      `${contact?.nom ?? ""} ${contact?.prenom ?? ""}`.trim() || "Bénéficiaire inconnu";
    const dateLabel = format(versement.dataVersement, "dd-MM-yyyy");

    const baseFolder = sanitizeForPath(`${nomPrenom} - ${dateLabel}`);
    const occurrence = usedFolderNames.get(baseFolder) ?? 0;
    usedFolderNames.set(baseFolder, occurrence + 1);
    const folder = occurrence === 0 ? baseFolder : `${baseFolder} (${occurrence + 1})`;

    const usedNamesInFolder = new Set<string>();
    let fileCount = 0;

    if (versement.document?.contenu) {
      const absPath = join(process.cwd(), (versement.document.contenu as { uuid: string }).uuid);
      const entryName = uniqueEntryName(
        usedNamesInFolder,
        documentEntryName(versement.document, "Preuve de virement")
      );
      archive.file(absPath, { name: `${folder}/${entryName}` });
      fileCount++;
    }

    for (const doc of versement.aide?.documents ?? []) {
      if (!doc.contenu) continue;
      const absPath = join(process.cwd(), (doc.contenu as { uuid: string }).uuid);
      const entryName = uniqueEntryName(
        usedNamesInFolder,
        documentEntryName(doc, `Justificatif comptable ${fileCount + 1}`)
      );
      archive.file(absPath, { name: `${folder}/${entryName}` });
      fileCount++;
    }

    if (fileCount === 0) {
      archive.append("Aucun justificatif disponible pour ce versement.", {
        name: `${folder}/aucun-justificatif.txt`,
      });
    }

    csvRows.push(
      [
        dateLabel,
        csvEscape(nomPrenom),
        versement.montant,
        versement.status,
        csvEscape(folder),
      ].join(";")
    );
  }

  // BOM UTF-8 pour un affichage correct des accents dans Excel.
  archive.append("﻿" + csvRows.join("\n"), { name: "versements.csv" });

  await archive.finalize();
}
