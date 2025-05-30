import { Contact, Demande } from "@prisma/client";
import { Response } from 'express';
import { capitalizeFirstLetter } from "src/util/misc";
const PDFDocument = require('pdfkit');

function renderSectionTitle(doc: PDFKit.PDFDocument, title: string) {
    const y = doc.y;
    const height = 20;

    doc
      .fillColor('#4B5563')
      .rect(50, y, 500, height)
      .fill();

    doc
      .fillColor('#FFFFFF')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(title, 55, y + 5);

    doc.moveDown(1);
  }

  
  function renderLigneAvecObservation(doc: PDFKit.PDFDocument, label?: string, value?: string, observations?:boolean,type?: string) {


    const xLabel = 50;
    const xObservation = 320;
    const maxWidth = 250;

    const labelText = label ? `${label} :` : '';
    const valueText = type === "montant" ? `${value} €` : value;
    const observationText = label && observations? 'Observation : ' : '';

    // Mesurer la hauteur du bloc gauche
    const leftTextHeight = doc.heightOfString(`${labelText} ${valueText}`, { width: maxWidth });

    const y = doc.y;

    // Texte gauche (label en gras, valeur normale)
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#000');
    doc.text(labelText, xLabel, y, { continued: true });

    doc.font('Helvetica').text(` ${valueText}`, { width: maxWidth });

    // Observation à droite
    doc.font('Helvetica-Oblique').fillColor('#888');
    doc.text(observationText, xObservation, y, { width: maxWidth });

    doc.y = y + leftTextHeight + 4; // Avancer proprement
  }

  export function generateDemandePdf(demande: Demande, contact: Contact, res: Response) {
    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=demande-${demande.id}.pdf`);
    doc.pipe(res);

    doc.fontSize(22).fillColor('#2563EB').text(`Demande N° ${demande.id}`, { align: 'center' }).moveDown(1.5);

    renderSectionTitle(doc, '1. Identité et contact');
    renderLigneAvecObservation(doc, 'Numéro bénéficiaire', contact.id?.toString() ?? '—',false);
    renderLigneAvecObservation(doc, 'Nom', capitalizeFirstLetter(contact.nom),false);
    renderLigneAvecObservation(doc, 'Prénom', capitalizeFirstLetter(contact.prenom),false);
    renderLigneAvecObservation(doc, 'Âge', contact?.age ?(new Date().getFullYear() - contact?.age)?.toString(): '—',false);
    renderLigneAvecObservation(doc, 'Adresse', `${contact.adresse ?? ''} ${contact.codePostal ?? ''} ${contact.ville ?? ''} `,false);
    renderLigneAvecObservation(doc, 'Téléphone', contact.telephone ?? '—',false);
    renderLigneAvecObservation(doc, 'E-mail', contact.email ?? '—',false);

    
    renderSectionTitle(doc, '3. Situation du foyer');
    renderLigneAvecObservation(doc, 'Situation familiale', capitalizeFirstLetter(demande.situationFamiliale),false);
    renderLigneAvecObservation(doc, 'Situation professionnelle', capitalizeFirstLetter(demande.situationProfessionnelle),false);
    if (demande.situationProConjoint)
      renderLigneAvecObservation(doc, 'Situation pro. du conjoint', capitalizeFirstLetter(demande.situationProConjoint),false);
    if (demande.nombreEnfants && demande.nombreEnfants > 0)
      renderLigneAvecObservation(doc, "Nombre d'enfants", demande.nombreEnfants.toString(),false);
    if (demande.agesEnfants)
      renderLigneAvecObservation(doc, 'Âges des enfants', demande.agesEnfants,false);

    renderSectionTitle(doc, '4. Charges');


      
    
    renderLigneAvecObservation(doc, 'Loyer', demande.loyer?.toString() ?? '—', false,"montant");
    renderLigneAvecObservation(doc, 'Factures énergie', demande.facturesEnergie?.toString() ?? '—', false,"montant");
    renderLigneAvecObservation(doc, 'Autres charges', demande.autresCharges?.toString() ?? '—',false, "montant");
    renderLigneAvecObservation(doc, 'Dettes', demande.dettes?.toString() ?? '—', false,"montant");
    renderLigneAvecObservation(doc, 'Nature des dettes', demande.natureDettes ?? '—',false);

    renderSectionTitle(doc, '5. Revenus');
    renderLigneAvecObservation(doc, 'APL', demande.apl?.toString() ?? '—', false,"montant");
    renderLigneAvecObservation(doc, 'Revenus', demande.revenus?.toString() ?? '—', false,"montant");
    renderLigneAvecObservation(doc, 'Revenus conjoint', demande.revenusConjoint?.toString() ?? '—', false,"montant");
    renderLigneAvecObservation(doc, 'Autres aides', demande.autresAides ?? '—', false,"montant");




    /* const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(10).fillColor('#999').text(`Page ${i + 1} / ${range.count}`, 500, 770);
    }
 */
    doc.end();
  }