import jsPDF from "jspdf";
import { Project } from "../../shared/types";

export function exportTimelineToPDF(
  projects: Project[],
  contacts: any[],
  years: number
) {
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
  const chartHeight = pageHeight - 80; // Platz für Header/Footer

  // Timeline-Berechnung
  const today = new Date();
  const startDate = new Date(today.getFullYear(), 0, 1);
  const endDate = new Date(today.getFullYear() + years, 11, 31);
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
    `Zeitraum: ${years} ${years === 1 ? "Jahr" : "Jahre"} (${startDate.getFullYear()}-${endDate.getFullYear()})`,
    margin,
    margin + 23
  );

  // Timeline Header (Quartale)
  const headerY = margin + 35;
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");

  for (let y = 0; y < years; y++) {
    for (let q = 0; q < 4; q++) {
      const quarterStart = new Date(today.getFullYear() + y, q * 3, 1);
      const daysFromStart = Math.ceil(
        (quarterStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const x = margin + (daysFromStart / totalDays) * chartWidth;

      pdf.text(`Q${q + 1} ${today.getFullYear() + y}`, x, headerY);

      // Vertikale Linie
      pdf.setDrawColor(200, 200, 200);
      pdf.line(x, headerY + 2, x, headerY + chartHeight - 10);
    }
  }

  // Projekte zeichnen
  const rowHeight = Math.min(15, chartHeight / projects.length);
  const barHeight = 6;
  let currentY = headerY + 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  projects.forEach((project) => {
    if (!project.timeline?.enabled) return;

    const timeline = project.timeline;
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

    // Projektname
    pdf.setTextColor(0, 0, 0);
    pdf.text(project.name, margin, currentY + 4, { maxWidth: 60 });

    // Timeline-Balken
    if (project.status === "completed") {
      pdf.setFillColor(203, 213, 225); // slate-300
    } else if (project.status === "active") {
      pdf.setFillColor(101, 163, 13); // gurktaler-600
    } else {
      pdf.setFillColor(132, 204, 22); // gurktaler-400
    }

    pdf.rect(startX, currentY - 1, width, barHeight, "F");

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
      pdf.rect(startX, currentY - 1, progressWidth, barHeight, "F");
      pdf.setGState(pdf.GState({ opacity: 1.0 }));
    }

    // Dauer & Progress Label
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.text(`${timeline.durationWeeks}w`, startX + 2, currentY + 3);
    if (progress > 0 && width > 15) {
      pdf.text(`${progress}%`, startX + width - 8, currentY + 3);
    }

    // Meilensteine
    timeline.milestones.forEach((milestone) => {
      const mDate = new Date(milestone.date);
      if (mDate < pStart || mDate > pEnd) return;

      const daysFromProjectStart = Math.ceil(
        (mDate.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const milestoneX = startX + (daysFromProjectStart / projectDays) * width;

      // Kreis für Meilenstein
      pdf.setFillColor(245, 158, 11); // amber-600
      pdf.circle(milestoneX, currentY + 2, 1.5, "F");
    });

    // Team-Info
    if (timeline.team.length > 0) {
      const team = timeline.team
        .map((cId) => contacts.find((c) => c.id === cId)?.name)
        .filter(Boolean)
        .join(", ");

      pdf.setFontSize(6);
      pdf.setTextColor(100, 100, 100);
      pdf.text(team, margin, currentY + 9, { maxWidth: 60 });
    }

    currentY += rowHeight;

    // Seitenumbruch wenn nötig
    if (currentY > pageHeight - 40) {
      pdf.addPage();
      currentY = margin + 20;
    }
  });

  // Footer - Legende
  const legendY = pageHeight - 25;
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Legende:", margin, legendY);

  pdf.setFont("helvetica", "normal");
  let legendX = margin + 20;

  // Geplant
  pdf.setFillColor(132, 204, 22);
  pdf.rect(legendX, legendY - 3, 5, 3, "F");
  pdf.text("Geplant", legendX + 7, legendY);
  legendX += 30;

  // In Arbeit
  pdf.setFillColor(101, 163, 13);
  pdf.rect(legendX, legendY - 3, 5, 3, "F");
  pdf.text("In Arbeit", legendX + 7, legendY);
  legendX += 30;

  // Abgeschlossen
  pdf.setFillColor(203, 213, 225);
  pdf.rect(legendX, legendY - 3, 5, 3, "F");
  pdf.text("Abgeschlossen", legendX + 7, legendY);
  legendX += 40;

  // Meilenstein
  pdf.setFillColor(245, 158, 11);
  pdf.circle(legendX + 2.5, legendY - 1, 1.5, "F");
  pdf.text("Meilenstein", legendX + 7, legendY);

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

  // Download
  const filename = `Projekt-Zeitplanung_${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(filename);
}
