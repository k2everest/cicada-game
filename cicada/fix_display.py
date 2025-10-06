import pygame
import sys

"""
Utility to force a 24/32 bpp display surface to avoid 8-bit paletted fallback
on older Windows (e.g. Windows 7) / older SDL drivers that cause grayscale
or wrong colors.

Usage: import cicada.fix_display as fix_display
       fix_display.ensure_truecolor_display(width, height, flags)

The module tries to set a 32-bit display; if that fails, falls back to 24 then default.
Also provides a safe image loader that keeps alpha when present.
"""


def ensure_truecolor_display(size, flags=0, bpp_preference=(32, 24)):
    """Try to set display surface with preferred BPP values.

    size: (width, height)
    flags: pygame display flags (e.g. pygame.RESIZABLE | pygame.DOUBLEBUF)
    bpp_preference: tuple of integers to try in order (default 32 then 24)
    """
    # Initialize display subsystem if not already initialized
    if not pygame.display.get_init():
        pygame.display.init()

    for bpp in bpp_preference:
        try:
            surface = pygame.display.set_mode(size, flags, bpp)
            # verify we actually got requested bpp
            obtained_bpp = surface.get_bitsize()
            if obtained_bpp >= 24:
                return surface
        except Exception:
            # try next bpp
            continue

    # Final fallback: let SDL choose (no explicit bpp)
    return pygame.display.set_mode(size, flags)


def load_image(path):
    """Safe image loader: use convert_alpha() when image has alpha channel,
    otherwise convert() for faster blitting. Avoids accidental palette/8-bit surfaces.
    """
    img = pygame.image.load(path)
    # If the image has per-pixel alpha, convert_alpha keeps it
    try:
        if img.get_alpha() is not None:
            return img.convert_alpha()
        else:
            return img.convert()
    except Exception:
        # As a last resort return the raw surface
        return img
