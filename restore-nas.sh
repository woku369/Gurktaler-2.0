#!/bin/bash
# Gurktaler 2.0 - NAS Restore Script
# Stellt ein Backup wieder her (INTERAKTIV)

BACKUP_BASE="/volume1/Gurktaler/zweipunktnull/backups"
TARGET_PATH="/volume1/Gurktaler/zweipunktnull/database"

echo "📦 Verfügbare Backups:"
echo "═══════════════════════════════════════"

# Liste alle Backups
BACKUPS=($(ls -1dt "$BACKUP_BASE"/backup_* 2>/dev/null))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo "❌ Keine Backups gefunden in: $BACKUP_BASE"
    exit 1
fi

# Zeige Backups
for i in "${!BACKUPS[@]}"; do
    BACKUP_NAME=$(basename "${BACKUPS[$i]}")
    BACKUP_DATE=$(echo "$BACKUP_NAME" | sed 's/backup_//' | sed 's/_/ /')
    BACKUP_SIZE=$(du -sh "${BACKUPS[$i]}" | cut -f1)
    FILE_COUNT=$(find "${BACKUPS[$i]}" -type f | wc -l)
    
    echo "[$i] $BACKUP_NAME"
    echo "    Erstellt: $BACKUP_DATE"
    echo "    Dateien: $FILE_COUNT | Größe: $BACKUP_SIZE"
    echo ""
done

# Wähle Backup
read -p "Welches Backup wiederherstellen? [0-$((${#BACKUPS[@]}-1))] oder 'q' für Abbruch: " SELECTION

if [ "$SELECTION" = "q" ]; then
    echo "Abgebrochen."
    exit 0
fi

SELECTED_BACKUP="${BACKUPS[$SELECTION]}"

if [ ! -d "$SELECTED_BACKUP" ]; then
    echo "❌ Ungültige Auswahl"
    exit 1
fi

echo ""
echo "⚠️  WARNUNG: Aktuelle Daten werden überschrieben!"
read -p "Fortfahren? (ja/nein): " CONFIRM

if [ "$CONFIRM" != "ja" ]; then
    echo "Abgebrochen."
    exit 0
fi

# Sicherheits-Backup
echo ""
echo "💾 Erstelle Sicherheits-Backup der aktuellen Daten..."
SAFETY_BACKUP="$BACKUP_BASE/safety_backup_$(date +"%Y-%m-%d_%H-%M-%S")"
mkdir -p "$SAFETY_BACKUP"
cp -r "$TARGET_PATH"/* "$SAFETY_BACKUP/"
echo "✅ Sicherheits-Backup: $SAFETY_BACKUP"

# Lösche aktuelle Datenbank
echo ""
echo "🗑️  Lösche aktuelle Datenbank..."
rm -rf "$TARGET_PATH"/*

# Stelle Backup wieder her
echo "📥 Stelle Backup wieder her..."
cp -r "$SELECTED_BACKUP"/* "$TARGET_PATH/"

FILE_COUNT=$(find "$TARGET_PATH" -type f | wc -l)

echo ""
echo "✅ Wiederherstellung erfolgreich!"
echo "   Dateien: $FILE_COUNT"
echo "   Von: $(basename "$SELECTED_BACKUP")"
echo "═══════════════════════════════════════"
