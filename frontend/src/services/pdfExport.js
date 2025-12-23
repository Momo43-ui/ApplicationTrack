import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportJobToPDF = (job, etats) => {
  const doc = new jsPDF();
  
  // Configuration
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // En-tête avec couleur
  doc.setFillColor(37, 99, 235); // Bleu
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text(job.entreprise, margin, yPosition + 15);
  
  // Date
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Candidature du ${new Date(job.date).toLocaleDateString('fr-FR')}`, margin, yPosition + 25);
  
  yPosition = 50;

  // État
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('État:', margin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(etats[job.etat]?.label || job.etat, margin + 25, yPosition);
  yPosition += 10;

  // Description du poste
  if (job.annonce) {
    yPosition += 10;
    doc.setFont(undefined, 'bold');
    doc.text('Description du poste:', margin, yPosition);
    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(job.annonce, pageWidth - 2 * margin);
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 10;
  }

  // Informations principales
  const mainInfo = [];
  if (job.type_contrat) mainInfo.push(['Type de contrat', job.type_contrat]);
  if (job.localisation) mainInfo.push(['Localisation', job.localisation]);
  if (job.salaire) mainInfo.push(['Salaire', job.salaire]);
  if (job.rappel_date) {
    mainInfo.push(['Date de rappel', new Date(job.rappel_date).toLocaleDateString('fr-FR')]);
  }

  if (mainInfo.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Information', 'Détails']],
      body: mainInfo,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: margin, right: margin },
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // Contact
  if (job.contact_nom || job.contact_email || job.contact_telephone) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Contact:', margin, yPosition);
    yPosition += 7;

    const contactInfo = [];
    if (job.contact_nom) contactInfo.push(['Nom', job.contact_nom]);
    if (job.contact_email) contactInfo.push(['Email', job.contact_email]);
    if (job.contact_telephone) contactInfo.push(['Téléphone', job.contact_telephone]);

    autoTable(doc, {
      startY: yPosition,
      body: contactInfo,
      theme: 'plain',
      margin: { left: margin, right: margin },
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // Tags
  if (job.tags && job.tags.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Tags:', margin, yPosition);
    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(job.tags.join(', '), margin, yPosition);
    yPosition += 10;
  }

  // Notes
  if (job.notes) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Notes:', margin, yPosition);
    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    const notesLines = doc.splitTextToSize(job.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPosition);
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Télécharger
  const filename = `candidature_${job.entreprise.replace(/\s+/g, '_')}_${job.date}.pdf`;
  doc.save(filename);
};

export const exportAllJobsToPDF = (jobs, etats) => {
  const doc = new jsPDF();
  
  // Configuration
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // En-tête
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('Suivi des candidatures', margin, 25);

  // Statistiques
  let yPosition = 50;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(`Total: ${jobs.length} candidatures`, margin, yPosition);

  const stats = {};
  jobs.forEach(job => {
    stats[job.etat] = (stats[job.etat] || 0) + 1;
  });

  yPosition += 10;
  Object.entries(stats).forEach(([etat, count]) => {
    doc.setFontSize(11);
    doc.text(`  • ${etats[etat]?.label || etat}: ${count}`, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Tableau des candidatures
  const tableData = jobs.map(job => [
    new Date(job.date).toLocaleDateString('fr-FR'),
    job.entreprise,
    job.type_contrat || '-',
    job.localisation || '-',
    etats[job.etat]?.label || job.etat,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Date', 'Entreprise', 'Type', 'Localisation', 'État']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Télécharger
  const filename = `candidatures_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
