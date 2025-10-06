Windows 7 color/grayscale issue (diagnosis & quick fix)

Symptoms
- Game renders in grayscale (black & white) on Windows 7 but looks fine on modern OSes.

Cause
- Older SDL/drivers may choose an 8-bit paletted display surface if the application doesn't
  explicitly request a truecolor BPP (24/32). Paletted modes render wrong colors or grayscale.

Fix
1) Import and call the helper at Pygame initialization (before loading images):
   from cicada import fix_display
   screen = fix_display.ensure_truecolor_display((WIDTH, HEIGHT), flags)

2) Load images using fix_display.load_image(path) instead of pygame.image.load(...)
   to preserve alpha and avoid paletted surfaces.

3) Make sure you don't call pygame.display.set_palette() anywhere.

Testing
- Run on Windows 7 machine (or VM) and confirm colors restored.

Notes
- This fix is defensive: it tries 32-bit, then 24-bit, then falls back to default.
- Keep the changes near the start of your game's main initialization so surfaces
  and images are created using the truecolor display surface.
