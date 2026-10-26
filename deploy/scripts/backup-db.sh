#!/usr/bin/env bash
# Nightly MySQL dump. Installed as /usr/local/sbin/smiley-backup-db; run by smiley-backup.timer.
# Uses root's unix-socket auth, so no password is stored anywhere.
set -euo pipefail
umask 077

DIR=/var/backups/smiley
KEEP_DAYS=${KEEP_DAYS:-14}
out="$DIR/smiley_face-$(date +%F-%H%M%S).sql.gz"

mysqldump --single-transaction --quick --routines --triggers --events --databases smiley_face \
  | gzip -9 > "$out.partial"
mv "$out.partial" "$out"
find "$DIR" -name 'smiley_face-*.sql.gz' -mtime +"$KEEP_DAYS" -delete
echo "Backup written: $out ($(du -h "$out" | cut -f1))"
