import jsPDF from "jspdf";
import { Project, CapacityUtilization } from "../../shared/types";

export async function exportTimelineToPDF(
  projects: Project[],
  contacts: any[],
  years: number,
  saveToNAS: boolean = false,
  capacityData?: CapacityUtilization
): Promise<{ success: boolean; message: string; filename?: string; url?: string }> {
  try {
  // PDF im Querformat A4
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297; // A4 Querformat
  const pageHeight = 210;
  const margin = 15;
  const chartWidth = pageWidth - 2 * margin;
  const chartHeight = 100; // Reduziert für Projektliste unten

  // Timeline-Berechnung
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // 1. Tag aktueller Monat
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + Math.ceil(years * 12)); // +X Monate
  endDate.setDate(0); // Letzter Tag des vorherigen Monats
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Header
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Projekt-Zeitplanung", margin, margin + 10);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `Erstellt am: ${new Date().toLocaleDateString("de-DE")}`,
    margin,
    margin + 17
  );
  pdf.text(
    `Zeitraum: ${years === 0.5 ? '6 Monate' : years === 1 ? '1 Jahr' : `${years} Jahre`} (${startDate.toLocaleDateString("de-DE", {month: 'short', year: 'numeric'})} - ${endDate.toLocaleDateString("de-DE", {month: 'short', year: 'numeric'})})`,
    margin,
    margin + 23
  );

  // Timeline Header (Quartale)
  const headerY = margin + 35;
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");

  // Kalenderwochen-Grid (zarter Hintergrund)
  pdf.setDrawColor(240, 240, 240); // sehr helles grau
  pdf.setLineWidth(0.1);
  const weekInDays = 7;
  for (let day = 0; day <= totalDays; day += weekInDays) {
    const x = margin + (day / totalDays) * chartWidth;
    pdf.line(x, headerY + 2, x, headerY + chartHeight - 10);
  }

  // Quartalslinien (dunkler und dicker)
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  for (let y = 0; y < years; y++) {
    for (let q = 0; q < 4; q++) {
      const quarterStart = new Date(today.getFullYear() + y, q * 3, 1);
      const daysFromStart = Math.ceil(
        (quarterStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const x = margin + (daysFromStart / totalDays) * chartWidth;

      pdf.text(`Q${q + 1} ${today.getFullYear() + y}`, x, headerY);
      pdf.line(x, headerY + 2, x, headerY + chartHeight - 10);
    }
  }

  // Projekte zeichnen
  const rowHeight = 9; // Engerer Abstand
  const barHeight = 4; // Schmalere Balken
  let currentY = headerY + 15;
  let currentPage = 1;
  const maxYPerPage = pageHeight - 30; // Platz für Footer

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  // Projekte sortieren wie in der App
  const sortedProjects = [...projects]
    .filter((p) => p.timeline?.enabled)
    .sort((a, b) => {
      const orderA = a.timeline?.sortOrder ?? 999;
      const orderB = b.timeline?.sortOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (
        new Date(a.timeline!.startDate).getTime() -
        new Date(b.timeline!.startDate).getTime()
      );
    });

  sortedProjects.forEach((project) => {
    const timeline = project.timeline!;
    const pStart = new Date(timeline.startDate);
    const pEnd = new Date(pStart);
    pEnd.setDate(pEnd.getDate() + timeline.durationWeeks * 7);

    // Berechne X-Position und Breite
    const daysFromStart = Math.ceil(
      (pStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const projectDays = Math.ceil(
      (pEnd.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    const startX = margin + (daysFromStart / totalDays) * chartWidth;
    const width = (projectDays / totalDays) * chartWidth;

    // Projektname ÜBER dem Balken (einzeilig mit Ellipsis)
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    const maxTitleWidth = Math.max(30, width);
    let title = project.name;
    // Kürze Titel wenn zu lang
    const textWidth = pdf.getTextWidth(title);
    if (textWidth > maxTitleWidth) {
      while (pdf.getTextWidth(title + '...') > maxTitleWidth && title.length > 0) {
        title = title.slice(0, -1);
      }
      title = title + '...';
    }
    pdf.text(title, startX, currentY - 2);

    // Farbe basierend auf Status UND Projektfarbe
    let fillColor: [number, number, number];
    if (project.status === "completed") {
      fillColor = [203, 213, 225]; // slate-300
    } else if (project.status === "active") {
      fillColor = [101, 163, 13]; // gurktaler-600
    } else {
      fillColor = [132, 204, 22]; // gurktaler-400
    }

    // Balken-Hintergrund
    pdf.setFillColor(...fillColor);
    pdf.rect(startX, currentY, width, barHeight, "F");

    // Rahmen in Projektfarbe
    if (project.color) {
      const hexToRgb = (hex: string): [number, number, number] => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      };
      const borderColor = hexToRgb(project.color);
      pdf.setDrawColor(...borderColor);
      pdf.setLineWidth(0.8);
      pdf.rect(startX, currentY, width, barHeight, "S");
    }

    // Progress-Balken (dunkleres Overlay)
    const progress = timeline.progress || 0;
    if (progress > 0) {
      if (project.status === "completed") {
        pdf.setFillColor(100, 116, 139); // slate-600
      } else {
        pdf.setFillColor(54, 83, 20); // gurktaler-800
      }
      const progressWidth = (width * progress) / 100;
      pdf.setGState(pdf.GState({ opacity: 0.4 }));
      pdf.rect(startX, currentY, progressWidth, barHeight, "F");
      pdf.setGState(pdf.GState({ opacity: 1.0 }));
    }

    // Dauer & Progress Label
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.text(`${timeline.durationWeeks}w`, startX + 1, currentY + 4);
    if (progress > 0 && width > 12) {
      pdf.text(`${progress}%`, startX + width - 6, currentY + 4);
    }

    // Meilensteine
    timeline.milestones.forEach((milestone) => {
      const mDate = new Date(milestone.date);
      if (mDate < pStart || mDate > pEnd) return;

      const daysFromProjectStart = Math.ceil(
        (mDate.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const milestoneX = startX + (daysFromProjectStart / projectDays) * width;

      // Dreieck für Meilenstein
      pdf.setFillColor(245, 158, 11); // amber-600
      const triangleSize = 2;
      pdf.triangle(
        milestoneX, currentY - 0.5,
        milestoneX - triangleSize, currentY - 0.5 - triangleSize,
        milestoneX + triangleSize, currentY - 0.5 - triangleSize,
        "F"
      );
    });

    // Abhängigkeiten als gestrichelte Linien
    timeline.dependencies.forEach((dep) => {
      const depProject = sortedProjects.find((p) => p.id === dep.projectId);
      if (!depProject || !depProject.timeline) return;

      const depIndex = sortedProjects.indexOf(depProject);
      if (depIndex === -1) return;

      const depTimeline = depProject.timeline;
      const depStart = new Date(depTimeline.startDate);
      const depEnd = new Date(depStart);
      depEnd.setDate(depEnd.getDate() + depTimeline.durationWeeks * 7);

      const depDaysFromStart = Math.ceil(
        (depStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const depProjectDays = Math.ceil(
        (depEnd.getTime() - depStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const depStartX = margin + (depDaysFromStart / totalDays) * chartWidth;
      const depWidth = (depProjectDays / totalDays) * chartWidth;

      const depY = headerY + 10 + depIndex * rowHeight + barHeight / 2;
      const thisY = currentY + barHeight / 2;

      let x1: number, x2: number;
      
      switch (dep.type) {
        case "finish-to-start":
          x1 = depStartX + depWidth;
          x2 = startX;
          break;
        case "start-to-start":
          x1 = depStartX;
          x2 = startX;
          break;
        case "finish-to-finish":
          x1 = depStartX + depWidth;
          x2 = startX + width;
          break;
        case "start-to-finish":
          x1 = depStartX;
          x2 = startX + width;
          break;
        default:
          x1 = depStartX + depWidth;
          x2 = startX;
      }

      // Farbe basierend auf Typ
      if (dep.type === "start-to-start" || dep.type === "finish-to-finish") {
        pdf.setDrawColor(59, 130, 246); // blue-500
      } else {
        pdf.setDrawColor(148, 163, 184); // slate-400
      }
      
      pdf.setLineWidth(0.3);
      // Note: setLineDash nicht verfügbar in jsPDF, Linien durchgezogen
      
      // Linie mit Knick zeichnen
      const midX = (x1 + x2) / 2;
      pdf.line(x1, depY, midX, depY);
      pdf.line(midX, depY, midX, thisY);
      pdf.line(midX, thisY, x2, thisY);
      
      // Pfeilspitze
      const arrowSize = 1;
      const arrowDir = x2 > midX ? 1 : -1;
      pdf.triangle(
        x2, thisY,
        x2 - arrowSize * arrowDir, thisY - arrowSize / 2,
        x2 - arrowSize * arrowDir, thisY + arrowSize / 2,
        "F"
      );
    });

    currentY += rowHeight;
    
    // Seitenumbruch wenn nötig
    if (currentY > maxYPerPage) {
      pdf.addPage();
      currentPage++;
      
      // Header auf neuer Seite wiederholen
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Projekt-Zeitplanung (Seite ${currentPage})`, margin, margin + 10);
      
      // Kalenderwochen-Grid
      pdf.setDrawColor(240, 240, 240);
      pdf.setLineWidth(0.1);
      const weekInDays = 7;
      for (let day = 0; day <= totalDays; day += weekInDays) {
        const x = margin + (day / totalDays) * chartWidth;
        pdf.line(x, headerY + 2, x, maxYPerPage - 10);
      }
      
      // Quartalslinien
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.3);
      for (let y = 0; y < years; y++) {
        for (let q = 0; q < 4; q++) {
          const quarterStart = new Date(today.getFullYear() + y, q * 3, 1);
          const daysFromStart = Math.ceil(
            (quarterStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const x = margin + (daysFromStart / totalDays) * chartWidth;
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.text(`Q${q + 1} ${today.getFullYear() + y}`, x, headerY);
          pdf.line(x, headerY + 2, x, maxYPerPage - 10);
        }
      }
      
      currentY = headerY + 15;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
    }
  });

  // Legende NACH den Projekten (wie in App)
  let legendY = currentY + 10;
  if (legendY > maxYPerPage - 30) {
    pdf.addPage();
    legendY = margin + 20;
  }
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Legende:", margin, legendY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  let legendX = margin;
  const legendSpacing = 28;

  // Zeile 1: Status
  legendX = margin + 18;
  pdf.setFillColor(132, 204, 22);
  pdf.rect(legendX, legendY - 2.5, 4, 2.5, "F");
  pdf.text("Geplant", legendX + 5, legendY);
  legendX += legendSpacing;

  pdf.setFillColor(101, 163, 13);
  pdf.rect(legendX, legendY - 2.5, 4, 2.5, "F");
  pdf.text("In Arbeit", legendX + 5, legendY);
  legendX += legendSpacing;

  pdf.setFillColor(203, 213, 225);
  pdf.rect(legendX, legendY - 2.5, 4, 2.5, "F");
  pdf.text("Abgeschlossen", legendX + 5, legendY);
  legendX += legendSpacing + 15;

  // Meilenstein
  pdf.setFillColor(245, 158, 11);
  pdf.triangle(legendX, legendY, legendX - 1.5, legendY - 2, legendX + 1.5, legendY - 2, "F");
  pdf.text("Meilenstein", legendX + 3, legendY);

  // Zeile 2: Abhängigkeiten
  legendX = margin + 18;
  const legendY2 = legendY + 5;
  
  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.3);
  pdf.line(legendX, legendY2 - 1, legendX + 4, legendY2 - 1);
  pdf.triangle(legendX + 4, legendY2 - 1, legendX + 3, legendY2 - 1.5, legendX + 3, legendY2 - 0.5, "F");
  pdf.text("Finish→Start", legendX + 6, legendY2);
  legendX += legendSpacing + 7;

  pdf.setDrawColor(59, 130, 246);
  pdf.line(legendX, legendY2 - 1, legendX + 4, legendY2 - 1);
  pdf.triangle(legendX + 4, legendY2 - 1, legendX + 3, legendY2 - 1.5, legendX + 3, legendY2 - 0.5, "F");
  pdf.text("Start↔Start", legendX + 6, legendY2);
  legendX += legendSpacing + 5;

  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.5);
  pdf.line(legendX, legendY2 - 1, legendX + 4, legendY2 - 1);
  pdf.triangle(legendX + 4, legendY2 - 1, legendX + 3, legendY2 - 1.5, legendX + 3, legendY2 - 0.5, "F");
  pdf.text("Finish↔Finish", legendX + 6, legendY2);

  // Kapazitätsauslastung (falls aktiviert)
  if (capacityData && capacityData.enabled && capacityData.quarters.length > 0) {
    let capacityY = legendY2 + 15;
    if (capacityY > maxYPerPage - 30) {
      pdf.addPage();
      capacityY = margin + 20;
    }
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Kapazitätsauslastung:", margin, capacityY);
    
    capacityY += 5;
    const barHeight = 8;
    
    // Zeichne quartalsweise Segmente
    for (let y = 0; y < years; y++) {
      for (let q = 0; q < 4; q++) {
        const quarterLabel = `Q${q + 1}/${(today.getFullYear() + y) % 100}`;
        const quarterStart = new Date(today.getFullYear() + y, q * 3, 1);
        const daysFromStart = Math.ceil(
          (quarterStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const quarterDays = 91; // ~3 Monate
        
        const x = margin + (daysFromStart / totalDays) * chartWidth;
        const width = (quarterDays / totalDays) * chartWidth;
        
        // Finde Kapazität für dieses Quartal
        const capacity = capacityData.quarters.find(c => c.quarter === quarterLabel);
        const percentage = capacity?.percentage || 0;
        
        // Berechne Farbintensität (Ocker-Skala: hell bei 0%, dunkel bei 100%)
        if (percentage > 0) {
          const r = Math.round(248 - (percentage / 100) * 109); // 248 -> 139
          const g = Math.round(244 - (percentage / 100) * 133); // 244 -> 111
          const b = Math.round(232 - (percentage / 100) * 161); // 232 -> 71
          pdf.setFillColor(r, g, b);
          pdf.rect(x, capacityY, width, barHeight, "F");
          
          // Text in Balken
          pdf.setFontSize(6);
          pdf.setTextColor(percentage > 50 ? 255 : 0, percentage > 50 ? 255 : 0, percentage > 50 ? 255 : 0);
          pdf.text(`${percentage}%`, x + width / 2 - 3, capacityY + 5);
          pdf.setTextColor(0, 0, 0);
        } else {
          pdf.setFillColor(248, 249, 250);
          pdf.rect(x, capacityY, width, barHeight, "F");
        }
        
        // Rahmen
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.rect(x, capacityY, width, barHeight, "S");
      }
    }
  }

  // Projektliste mit Details - NEUE SEITE
  pdf.addPage();
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Projekt-Details", margin, margin + 10);

  let detailY = margin + 20;
  pdf.setFontSize(9);

  sortedProjects.forEach((project, index) => {
    const timeline = project.timeline!;
    
    // Prüfe Seitenumbruch
    if (detailY > pageHeight - 40) {
      pdf.addPage();
      detailY = margin + 10;
    }

    // Projektnummer und Name
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${index + 1}. ${project.name}`, margin, detailY);
    detailY += 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    // Status
    const statusLabels: Record<string, string> = {
      planned: "Geplant",
      active: "In Arbeit",
      completed: "Abgeschlossen",
      archived: "Archiviert",
      paused: "Pausiert"
    };
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Status: ${statusLabels[project.status] || project.status}`, margin + 5, detailY);
    detailY += 4;

    // Zeitraum
    const pStart = new Date(timeline.startDate);
    const pEnd = new Date(pStart);
    pEnd.setDate(pEnd.getDate() + timeline.durationWeeks * 7);
    pdf.text(
      `Zeitraum: ${pStart.toLocaleDateString("de-DE")} - ${pEnd.toLocaleDateString("de-DE")} (${timeline.durationWeeks} Wochen)`,
      margin + 5,
      detailY
    );
    detailY += 4;

    // Fortschritt
    pdf.text(`Fortschritt: ${timeline.progress || 0}%`, margin + 5, detailY);
    detailY += 4;

    // Team
    if (timeline.team.length > 0) {
      const team = timeline.team
        .map((cId) => contacts.find((c) => c.id === cId)?.name)
        .filter(Boolean)
        .join(", ");
      pdf.text(`Team: ${team}`, margin + 5, detailY);
      detailY += 4;
    }

    // Beschreibung
    if (project.description) {
      pdf.text("Beschreibung:", margin + 5, detailY);
      detailY += 4;
      const lines = pdf.splitTextToSize(project.description, pageWidth - 2 * margin - 10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(lines, margin + 8, detailY);
      detailY += lines.length * 4;
      pdf.setTextColor(60, 60, 60);
    }

    // Meilensteine
    if (timeline.milestones.length > 0) {
      pdf.text(`Meilensteine (${timeline.milestones.length}):`, margin + 5, detailY);
      detailY += 4;
      timeline.milestones.forEach((m) => {
        const mDate = new Date(m.date).toLocaleDateString("de-DE");
        const status = m.completed ? "✓" : "○";
        pdf.text(`  ${status} ${m.name} (${mDate})`, margin + 8, detailY);
        detailY += 3.5;
      });
    }

    // Abhängigkeiten
    if (timeline.dependencies.length > 0) {
      pdf.text("Abhängigkeiten:", margin + 5, detailY);
      detailY += 4;
      timeline.dependencies.forEach((dep) => {
        const depProject = sortedProjects.find((p) => p.id === dep.projectId);
        if (depProject) {
          const typeLabels = {
            "finish-to-start": "→ Start nach Ende von",
            "start-to-start": "⇉ Start parallel mit",
            "finish-to-finish": "⇇ Ende gleichzeitig mit",
            "start-to-finish": "↔ Start mit Ende von"
          };
          pdf.text(`  ${typeLabels[dep.type]} "${depProject.name}"`, margin + 8, detailY);
          detailY += 3.5;
        }
      });
    }

    detailY += 5; // Abstand zum nächsten Projekt
  });

  // Footer - Seitenzahl
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.text(
      `Seite ${i} von ${pageCount}`,
      pageWidth - margin - 20,
      pageHeight - 10
    );
  }

  // Download oder NAS-Speicherung
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5); // 2026-01-06T14-30-45
  const filename = `Projekt-Zeitplanung_${timestamp}.pdf`;
  
  if (saveToNAS) {
    // Als Blob für NAS-Upload
    const pdfBlob = pdf.output('blob');
    const formData = new FormData();
    formData.append('file', pdfBlob, filename);
    
    // Upload zu NAS (via CustomApiStorageProvider baseUrl)
    const provider = (window as any).storageProvider;
    if (provider && 'baseUrl' in provider) {
      const response = await fetch(`${provider.baseUrl}/api/pdf`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: 'PDF erfolgreich auf NAS gespeichert',
          filename: result.filename,
          url: `${provider.baseUrl}/api/pdf/${result.filename}`
        };
      } else {
        throw new Error('NAS-Upload fehlgeschlagen');
      }
    } else {
      throw new Error('NAS-Speicherung nicht verfügbar (Desktop-Modus)');
    }
  } else {
    // Lokaler Download
    pdf.save(filename);
    return {
      success: true,
      message: 'PDF lokal gespeichert',
      filename
    };
  }
  } catch (error) {
    console.error('PDF-Export Fehler:', error);
    return {
      success: false,
      message: `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
    };
  }
}
