# How to Run Signage Automatically on Boot

To make the signage player run automatically when a computer or screen starts, follow these instructions.

## 1. Preparation
Ensure your application is accessible via a URL.
**Auto-Start URL:** `https://signage.antino.ca/?mode=player`

---

## 2. Windows Setup (Chrome Kiosk Mode)
This launches Google Chrome in a dedicated "Kiosk" mode (full screen, no address bar) at startup.

1.  **Create a Shortcut:**
    - Right-click on your Desktop -> **New** -> **Shortcut**.
    - For the location, enter:
      `"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk https://signage.antino.ca/?mode=player`
    - Name it "Signage Player".
2.  **Add to Startup Folder:**
    - Press `Win + R`, type `shell:startup`, and press Enter.
    - Drag your new "Signage Player" shortcut into this folder.
3.  **OS Settings (Recommended):**
    - Disable "Sleep" and "Screen Turn Off" in Power Settings.

---

## 3. Android TV Setup (Kiosk Browser)
Android TV browsers often block autoplay. The best way to bypass this is using a Kiosk app.

1.  **Install App:** Search the Play Store for **"Fully Kiosk Browser"** or **"WallPanel"**.
2.  **Configuration:**
    - **Start URL:** `https://signage.antino.ca/?mode=player`
    - **Web Settings:** Enable "Autoplay videos" (Fully Kiosk handles the "tapping" requirement automatically).
    - **Device Management:** Enable "Start on Boot".

---

## 4. Why this works
- **`?mode=player`**: We programmed the app to skip the management dashboard when this is in the URL.
- **Muted Autoplay**: Modern browsers allow videos to play automatically only if they are muted. Our player starts muted to ensure it never stops waiting for a "tap".
