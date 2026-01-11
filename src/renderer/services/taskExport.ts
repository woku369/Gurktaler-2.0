// Task PDF Export Service
import jsPDF from 'jspdf';
import type { Task, Project, ProjectWorkspace } from '@/shared/types';

export const exportTasksToPDF = (
  tasks: Task[],
  projects: Project[],
  options: {
    title?: string;
    groupBy?: 'priority' | 'project' | 'status' | 'none';
    showCompleted?: boolean;
    workspaces?: ProjectWorkspace[];  // Workspace-Support
    filterProject?: string;  // Wenn gesetzt, nur Tasks dieses Projekts
  } = {}
) => {
  const pdf = new jsPDF();
  const {
    title = 'Aufgabenliste',
    groupBy = 'none',
    showCompleted = true,
    workspaces = [],
    filterProject
  } = options;

  let filteredTasks = showCompleted ? tasks : tasks.filter(t => t.status !== 'completed');
  
  // Fonts & Colors
  pdf.setFont('helvetica');
  const primaryColor = [145, 85, 61] as [number, number, number]; // Gurktaler Brown
  
  // Header
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 15, 18);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 15, 27);
  
  let infoX = 120;
  pdf.text(`Anzahl Aufgaben: ${filteredTasks.length}`, infoX, 27);
  
  // Workspace-Info wenn Task zu Projekt mit Workspace gehört
  if (filterProject && workspaces.length > 0) {
    const project = projects.find(p => p.id === filterProject);
    if (project?.workspace_id) {
      const workspace = workspaces.find(w => w.id === project.workspace_id);
      if (workspace) {
        pdf.text(`${workspace.icon || ''} ${workspace.name}`, infoX, 31);
      }
    }
  }
  
  let currentY = 45;
  
  // Gruppierung
  if (groupBy === 'none') {
    currentY = renderTaskList(pdf, filteredTasks, projects, currentY);
  } else {
    const groups = groupTasks(filteredTasks, groupBy, projects);
    
    for (const [groupName, groupTasks] of Object.entries(groups)) {
      // Gruppen-Header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(10, currentY - 5, 190, 8, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(groupName, 12, currentY);
      
      currentY += 10;
      
      currentY = renderTaskList(pdf, groupTasks, projects, currentY);
      currentY += 5;
      
      // Seitenumbruch prüfen
      if (currentY > 260) {
        pdf.addPage();
        currentY = 20;
      }
    }
  }
  
  // Footer
  const pageCount = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Gurktaler 2.0 — Seite ${i} von ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }
  
  // Save
  pdf.save(`aufgaben_${new Date().toISOString().split('T')[0]}.pdf`);
};

function groupTasks(
  tasks: Task[],
  groupBy: 'priority' | 'project' | 'status',
  projects: Project[]
): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    let groupKey: string;
    
    switch (groupBy) {
      case 'priority':
        groupKey = task.priority === 'high' ? '🔴 Hohe Priorität' :
                   task.priority === 'medium' ? '🟡 Mittlere Priorität' :
                   '🟢 Niedrige Priorität';
        break;
      case 'project':
        const project = projects.find(p => p.id === task.project_id);
        groupKey = project ? `📁 ${project.name}` : '📋 Kein Projekt';
        break;
      case 'status':
        groupKey = task.status === 'open' ? '⚪ Offen' :
                   task.status === 'in-progress' ? '🔵 In Arbeit' :
                   '✅ Erledigt';
        break;
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(task);
  });
  
  return groups;
}

function renderTaskList(
  pdf: jsPDF,
  tasks: Task[],
  projects: Project[],
  startY: number
): number {
  let currentY = startY;
  
  tasks.forEach((task, _index) => {
    // Seitenumbruch prüfen
    if (currentY > 260) {
      pdf.addPage();
      currentY = 20;
    }
    
    // Checkbox
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    const checkboxX = 12;
    const checkboxY = currentY - 4;
    pdf.rect(checkboxX, checkboxY, 5, 5);
    
    if (task.status === 'completed') {
      // Checkmark
      pdf.setDrawColor(0, 150, 0);
      pdf.setLineWidth(1);
      pdf.line(checkboxX + 1, checkboxY + 2.5, checkboxX + 2, checkboxY + 4);
      pdf.line(checkboxX + 2, checkboxY + 4, checkboxX + 4.5, checkboxY + 0.5);
    }
    
    // Titel
    pdf.setFontSize(11);
    pdf.setFont('helvetica', task.status === 'completed' ? 'normal' : 'bold');
    pdf.setTextColor(task.status === 'completed' ? 150 : 0, task.status === 'completed' ? 150 : 0, task.status === 'completed' ? 150 : 0);
    
    const titleLines = pdf.splitTextToSize(task.title, 150);
    pdf.text(titleLines, 20, currentY);
    currentY += titleLines.length * 5;
    
    // Details
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    const details: string[] = [];
    
    if (task.assignee) {
      details.push(`👤 ${task.assignee}`);
    }
    
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const isOverdue = dueDate < new Date() && task.status !== 'completed';
      details.push(`📅 ${dueDate.toLocaleDateString('de-DE')}${isOverdue ? ' (überfällig!)' : ''}`);
    }
    
    if (task.project_id) {
      const project = projects.find(p => p.id === task.project_id);
      if (project) {
        details.push(`📁 ${project.name}`);
      }
    }
    
    // Priority Badge
    const priorityText = task.priority === 'high' ? 'Hoch' : 
                        task.priority === 'medium' ? 'Mittel' : 'Niedrig';
    const priorityColor = task.priority === 'high' ? [255, 0, 0] as [number, number, number] :
                         task.priority === 'medium' ? [255, 165, 0] as [number, number, number] :
                         [100, 100, 100] as [number, number, number];
    
    pdf.setFillColor(...priorityColor);
    pdf.rect(170, currentY - 4, 25, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text(priorityText, 182.5, currentY - 0.5, { align: 'center' });
    
    if (details.length > 0) {
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.text(details.join(' • '), 20, currentY);
      currentY += 5;
    }
    
    // Beschreibung
    if (task.description) {
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      const descLines = pdf.splitTextToSize(task.description, 175);
      pdf.text(descLines, 20, currentY);
      currentY += descLines.length * 4;
    }
    
    currentY += 8; // Abstand zwischen Tasks
  });
  
  return currentY;
}
