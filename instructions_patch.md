How to apply the fix

1) Add the file cicada/fix_display.py to the project (contents provided).
2) In your main initialization file (e.g. main.py, run.py or wherever you call pygame.init() / set_mode),
   replace the direct pygame.display.set_mode(...) call with something like:

   import pygame
   from cicada import fix_display

   pygame.init()
   flags = pygame.RESIZABLE  # or your existing flags
   size = (WIDTH, HEIGHT)
   screen = fix_display.ensure_truecolor_display(size, flags)

3) Replace calls to pygame.image.load(path) that later call convert/convert_alpha with
   fix_display.load_image(path) to ensure images are returned in appropriate formats.

4) Ensure there is no call to pygame.display.set_palette() anywhere in the code.

5) Run and test on Windows 7.
