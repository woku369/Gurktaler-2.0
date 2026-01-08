#!/bin/bash
# Gurktaler 2.0 - NAS Backup Script
# Erstellt timestamped Backup der Datenbank

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SOURCE_PATH="/volume1/Gurktaler/zweipunktnull/database"
BACKUP_BASE="/volume1/Gurktaler/zweipunktnull/backups"
BACKUP_PATH="$BACKUP_BASE/backup_$TIMESTAMP"

echo "📦 Gurktaler Backup - $TIMESTAMP"
echo "═══════════════════════════════════════"

# Prüfe ob Quelle existiert
if [ ! -d "$SOURCE_PATH" ]; then
    echo "❌ Fehler: Quellpfad nicht gefunden: $SOURCE_PATH"
    exit 1
fi

# Erstelle Backup-Verzeichnis
mkdir -p "$BACKUP_PATH"

# Kopiere alle Dateien
echo "📋 Kopiere Datenbank-Dateien..."
cp -r "$SOURCE_PATH"/* "$BACKUP_PATH/"

# Zähle Dateien und Größe
FILE_COUNT=$(find "$BACKUP_PATH" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)

echo "✅ Backup erfolgreich!"
echo "   Dateien: $FILE_COUNT"
echo "   Größe: $TOTAL_SIZE"
echo "   Pfad: $BACKUP_PATH"

# Lösche Backups älter als 30 Tage
echo ""
echo "🧹 Lösche alte Backups (älter als 30 Tage)..."
OLD_COUNT=$(find "$BACKUP_BASE" -maxdepth 1 -type d -name "backup_*" -mtime +30 | wc -l)

if [ $OLD_COUNT -gt 0 ]; then
    find "$BACKUP_BASE" -maxdepth 1 -type d -name "backup_*" -mtime +30 -exec rm -rf {} \;
    echo "✅ $OLD_COUNT alte Backups gelöscht"
else
    echo "   Keine alten Backups gefunden"
fi

echo ""
echo "✅ Backup-Vorgang abgeschlossen!"
echo "═══════════════════════════════════════"
