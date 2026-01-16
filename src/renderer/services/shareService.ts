import type { Project, Product, Note } from "@/shared/types";

/**
 * Erstellt einen E-Mail-Betreff und -Body für verschiedene Entitäten
 */
export function createEmailContent(
  entity: Project | Product | Note,
  type: "project" | "product" | "note"
): { subject: string; body: string } {
  let subject = "";
  let body = "";

  if (type === "project") {
    const project = entity as Project;
    subject = `Projekt: ${project.name}`;
    body = `Projekt: ${project.name}\n\n`;
    
    if (project.description) {
      body += `Beschreibung:\n${project.description}\n\n`;
    }
    
    body += `Status: ${getStatusLabel(project.status)}\n`;
    
    if (project.documents && project.documents.length > 0) {
      body += `\nDokumente:\n`;
      project.documents.forEach((doc) => {
        body += `- ${doc.name}\n`;
        if (doc.type === "url") {
          body += `  ${doc.path}\n`;
        }
      });
    }
    
    if (project.timeline?.milestones && project.timeline.milestones.length > 0) {
      body += `\nMeilensteine:\n`;
      project.timeline.milestones.forEach((m) => {
        body += `- ${m.name} (${new Date(m.date).toLocaleDateString("de-DE")})\n`;
      });
    }
  } else if (type === "product") {
    const product = entity as Product;
    subject = `Produkt: ${product.name} v${product.version}`;
    body = `Produkt: ${product.name}\nVersion: ${product.version}\n\n`;
    
    if (product.description) {
      body += `Beschreibung:\n${product.description}\n\n`;
    }
    
    body += `Status: ${getProductStatusLabel(product.status)}\n`;
    
    if (product.alcohol_percentage) {
      body += `Alkoholgehalt: ${product.alcohol_percentage}% vol.\n`;
    }
    
    if (product.container_size) {
      body += `Gebindegröße: ${product.container_size} ml\n`;
    }
    
    if (product.documents && product.documents.length > 0) {
      body += `\nDokumente:\n`;
      product.documents.forEach((doc) => {
        body += `- ${doc.name}\n`;
        if (doc.type === "url") {
          body += `  ${doc.path}\n`;
        }
      });
    }
  } else if (type === "note") {
    const note = entity as Note;
    subject = `Notiz: ${note.title}`;
    body = `Notiz: ${note.title}\n\n`;
    
    body += `${note.content}\n\n`;
    
    if (note.url) {
      body += `Link: ${note.url}\n\n`;
    }
    
    if (note.documents && note.documents.length > 0) {
      body += `\nAnhänge:\n`;
      note.documents.forEach((doc) => {
        body += `- ${doc.name}\n`;
        if (doc.type === "url") {
          body += `  ${doc.path}\n`;
        }
      });
    }
  }

  body += `\n---\nErstellt mit Gurktaler 2.0`;

  return { subject, body };
}

/**
 * Öffnet das E-Mail-Programm mit vorbefülltem Inhalt
 */
export function shareViaEmail(
  entity: Project | Product | Note,
  type: "project" | "product" | "note"
): void {
  const { subject, body } = createEmailContent(entity, type);
  
  // URL-encode für mailto-Link
  const mailtoLink = `mailto:?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  
  // Öffne E-Mail-Client
  window.location.href = mailtoLink;
}

/**
 * Nutzt Web Share API wenn verfügbar (für mobile Geräte)
 */
export async function shareViaWebShare(
  entity: Project | Product | Note,
  type: "project" | "product" | "note"
): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    const { subject, body } = createEmailContent(entity, type);
    
    await navigator.share({
      title: subject,
      text: body,
    });
    
    return true;
  } catch (error) {
    // User hat abgebrochen oder Fehler
    console.error("Share failed:", error);
    return false;
  }
}

/**
 * Universelle Share-Funktion die automatisch die beste Methode wählt
 */
export async function share(
  entity: Project | Product | Note,
  type: "project" | "product" | "note"
): Promise<void> {
  // Versuche zuerst Web Share API (Mobile)
  const sharedViaWebShare = await shareViaWebShare(entity, type);
  
  // Fallback auf E-Mail
  if (!sharedViaWebShare) {
    shareViaEmail(entity, type);
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Aktiv",
    paused: "Pausiert",
    completed: "Abgeschlossen",
    archived: "Archiviert",
  };
  return labels[status] || status;
}

function getProductStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Entwurf",
    testing: "In Test",
    approved: "Freigegeben",
    archived: "Archiviert",
  };
  return labels[status] || status;
}
