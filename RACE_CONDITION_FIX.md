# Race Condition Fix: Multi-Toggle Synchronization

## Problem

Wenn ein Toggle mehrere Tab-Areas gleichzeitig umschaltet und die Animationen unterschiedlich lang dauern, kann ein zweiter Toggle-Klick während der laufenden Animationen zu einem Missmatch führen:

1. Toggle A aktiviert Tab 1 in Area 1 (schnelle Animation, 300ms) und Area 2 (langsame Animation, 2000ms)
2. Nach 500ms wird Toggle B geklickt → aktiviert Tab 2
3. Area 1 ist bereits fertig mit der Animation und wechselt zu Tab 2
4. Area 2 ist noch bei Tab 1 am Animieren und wird übersprungen (`if (!area.isTransitioning)`)
5. **Resultat**: Area 1 zeigt Tab 2, Area 2 zeigt noch Tab 1 → Missmatch!

## Lösung

### 1. Animation Interruption in `switchToTab()`

Statt Areas zu überspringen, die noch `isTransitioning = true` haben, werden jetzt alle laufenden Animationen unterbrochen und der neue Ziel-Tab wird sofort aktiviert:

```javascript
switchToTab(tabId, tabAreaId = null, trigger = null) {
  if (!tabAreaId) {
    // Switch all matching tabs simultaneously
    matchingTabs.forEach(({ tab, area, areaId }) => {
      if (area.isTransitioning) {
        // Area is currently animating - interrupt and switch to new target
        // Kill any in-progress animations
        area.tabs.forEach((t) => {
          if (t.currentTween) {
            t.currentTween.kill();
            t.currentTween = null;
          }
          this.resetElement(t);
        });
        // Reset transition flag and activate new tab
        area.isTransitioning = false;
      }
      this.activateTab(tab, false, area);
    });
  }
}
```

### 2. Entfernung redundanter Animation-Killing-Logik

Die Animation-Interruption-Logik in `activateTab()` wurde entfernt, da sie jetzt zentral in `switchToTab()` gehandhabt wird. Dies verhindert doppelte Cleanup-Operationen.

**Vorher:**

```javascript
activateTab(tab, immediate = false, tabAreaData = null) {
  // Handle rapid tab switching: kill any in-progress animations
  if (tabAreaData.isTransitioning && gsapEnabled) {
    tabs.forEach((t) => {
      if (t.currentTween) {
        t.currentTween.kill();
        t.currentTween = null;
      }
      this.resetElement(t);
    });
  }
  tabAreaData.isTransitioning = true;
}
```

**Nachher:**

```javascript
activateTab(tab, immediate = false, tabAreaData = null) {
  // Mark as transitioning
  tabAreaData.isTransitioning = true;
}
```

## Vorteile

1. **Konsistenz garantiert**: Alle Tab-Areas zeigen immer denselben Tab, auch bei schnellen Toggle-Wechseln
2. **Keine Race Conditions**: Laufende Animationen werden sauber unterbrochen
3. **Bessere UX**: Sofortige Reaktion auf User-Input, keine verzögerten Updates
4. **Sauberer Code**: Zentrale Animation-Interruption-Logik statt verteilter Checks

## Test

Die Datei `test-multi-toggle-race-condition.html` testet das Szenario:

1. Zwei Tab-Areas mit unterschiedlichen Animationsgeschwindigkeiten
2. Rapid Toggle Test: Tab1 → Tab3 → Tab2 mit kurzen Delays
3. Consistency Check: Verifiziert, dass beide Areas und alle Triggers synchron sind

### Test ausführen:

```bash
npm run build
# Öffne test-multi-toggle-race-condition.html im Browser
# Klicke auf "🔥 Rapid Toggle Test"
# Ergebnis sollte "✓ CONSISTENT" sein
```

## Betroffene Dateien

- `src/frontend/tabs.js`:
  - `switchToTab()`: Animation-Interruption-Logik hinzugefügt
  - `activateTab()`: Redundante Animation-Killing-Logik entfernt
- `test-multi-toggle-race-condition.html`: Neuer Test für das Szenario
