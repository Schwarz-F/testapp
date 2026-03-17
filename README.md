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

Im Ordner `thunderbird-addon/` ist ein **vollständig autonomes** Thunderbird-WebExtension-Add-on enthalten.  
Es nutzt **nur interne Thunderbird APIs** (Accounts/Messages/Compose/Tabs) und ist unabhängig von `app.py` oder der Web-Version.

### Funktionen
- Kontoauswahl innerhalb der Sidebar/Tab
- Chatliste aus Inbox + Sent (pro Kontakt)
- Verlauf mit vereinfachter Nachrichtendarstellung (Zitat-Teile reduziert)
- Senden direkt über Thunderbird Compose-Engine
- Basis-Reply-Threading über `inReplyTo`/`references` auf die letzte Chat-Nachricht
- Startbar über mehrere Wege:
  - Thunderbird-Sidebar (MailChat)
  - Add-on-Button Popup ("MailChat als Tab öffnen" / "MailChat Sidebar öffnen")
  - Tastenkürzel `Ctrl+Shift+M` (öffnet MailChat als Tab)

### Add-on lokal laden (Entwicklung)
1. Thunderbird öffnen
2. **Add-ons und Themes** öffnen
3. Zahnrad-Menü → **Add-on aus Datei installieren...**
4. `thunderbird-addon/manifest.json` auswählen (oder das Verzeichnis als XPI packen)

Danach ist die Sidebar **MailChat** über die Thunderbird-Sidebar verfügbar.
