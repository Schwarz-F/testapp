# MailChat

MailChat zeigt E-Mail-Verkehr als Chat-Ansicht (ähnlich Messenger):

- **Kontakte mit Namen verknüpfen**
- **Gruppen erstellen und als Broadcast senden**
- **HTML-Inhalte anzeigen (sanitized)**
- **Antwort-Zitate automatisch ausblenden**
- **No-Reply / info@ / Werbe-Mails filterbar**
- **Einstellungsdialog für Polling und Filter**
- **Schnelle Realtime-Aktualisierung + Browser-Benachrichtigungen**
- **Mobile/Desktop-Switch mit dynamischem Label und Zurück-Button**

## Start

```bash
python app.py
```

Dann im Browser öffnen: `http://localhost:8000`

## Hinweise

- Für viele Provider wird ein **App-Passwort** statt normalem Passwort benötigt.
- Zugangsdaten werden lokal in `mailchat.db` gespeichert.
- Für schnellere Synchronisation kann das Polling-Intervall in den Einstellungen reduziert werden.

## Thunderbird Add-on (neu)

Im Ordner `thunderbird-addon/` ist ein Thunderbird-WebExtension-Add-on enthalten, das eine chatartige Ansicht als **linke Sidebar** bereitstellt.

### Funktionen
- Kontoauswahl innerhalb der Sidebar
- Chatliste aus Inbox + Sent (pro Kontakt)
- Verlauf mit vereinfachter Nachrichtendarstellung (Zitat-Teile reduziert)
- Senden direkt aus der Sidebar über Thunderbird Compose-Engine
- Basis-Reply-Threading über `inReplyTo`/`references` auf die letzte Chat-Nachricht

### Add-on lokal laden (Entwicklung)
1. Thunderbird öffnen
2. **Add-ons und Themes** öffnen
3. Zahnrad-Menü → **Add-on aus Datei installieren...**
4. `thunderbird-addon/manifest.json` auswählen (oder das Verzeichnis als XPI packen)

Danach ist die Sidebar **MailChat** über die Thunderbird-Sidebar verfügbar.
