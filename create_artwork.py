"""
Systematic Reverie - Visual Expression
A canvas artwork embodying the philosophy through systematic patterns and subtle misdirection
REFINED VERSION - Museum quality craftsmanship
"""

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import math
import random

# Set seed for reproducible "organic" variations
random.seed(42)

# Register fonts
font_path = r"C:\Users\lafla\.claude\skills\canvas-design\canvas-fonts"
pdfmetrics.registerFont(TTFont('DMMono', f'{font_path}\\DMMono-Regular.ttf'))
pdfmetrics.registerFont(TTFont('WorkSans', f'{font_path}\\WorkSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('GeistMono', f'{font_path}\\GeistMono-Regular.ttf'))
pdfmetrics.registerFont(TTFont('GeistMonoBold', f'{font_path}\\GeistMono-Bold.ttf'))

# Create PDF
pdf_path = r"C:\claude_projects\deke\systematic_reverie.pdf"
c = canvas.Canvas(pdf_path, pagesize=letter)
width, height = letter

# Color palette - faded institutional, archival quality
# Refined for maximum sophistication and coherence
color_primary = (0.15, 0.18, 0.22)      # Deep charcoal slate
color_secondary = (0.48, 0.44, 0.42)    # Muted warm grey
color_accent = (0.72, 0.68, 0.62)       # Soft taupe
color_highlight = (0.88, 0.84, 0.78)    # Pale warm sand
color_background = (0.97, 0.96, 0.94)   # Cream white

# Fill background
c.setFillColorRGB(*color_background)
c.rect(0, 0, width, height, fill=True, stroke=False)

# === REFINED COMPOSITION ===
# More precise margins and breathing room
margin_v = 1.1 * inch
margin_h = 1.0 * inch
work_width = width - (2 * margin_h)
work_height = height - (2 * margin_v)

# === TITLE BLOCK - Top ===
c.setFont('WorkSans', 8)
c.setFillColorRGB(*color_primary)
title_y = height - margin_v + 0.45 * inch
c.drawString(margin_h, title_y, "SYSTEMATIC REVERIE")

# Subtitle with refined spacing
c.setFont('GeistMono', 5.5)
c.setFillColorRGB(*color_secondary)
c.drawString(margin_h, title_y - 0.18 * inch, "Documentation of Directional Shift Patterns")

# Categorical reference - top right with perfect alignment
c.setFont('GeistMono', 5.5)
c.drawRightString(width - margin_h, title_y, "Series I")
c.setFont('GeistMono', 4.8)
c.drawRightString(width - margin_h, title_y - 0.18 * inch, "Vector Studies")

# === MAIN GRID: TRAJECTORY STUDIES ===
# Perfectly calculated grid with optical precision

studies_cols = 4
studies_rows = 5
num_trajectories = studies_cols * studies_rows

# Calculate cell dimensions with precise spacing
cell_width = work_width / studies_cols
cell_height = (work_height - 0.6 * inch) / studies_rows  # Reserve space for bottom annotations

def draw_refined_trajectory(c, center_x, center_y, study_num):
    """
    Draw a single trajectory study with museum-quality precision
    The deke: initial vector (feint) → transition point → final vector (reality)
    """
    # Set consistent randomization per study
    random.seed(42 + study_num)

    # Calculate trajectory within cell bounds
    max_vector_length = min(cell_width, cell_height) * 0.35

    # Initial vector angle and length (the feint)
    initial_angle = random.uniform(20, 160)
    initial_length = random.uniform(0.5, 0.75) * max_vector_length

    # Starting point - slightly offset from center for visual interest
    x_start = center_x + random.uniform(-0.15, 0.15) * cell_width * 0.3
    y_start = center_y + random.uniform(-0.15, 0.15) * cell_height * 0.3

    # End of initial vector
    x_mid = x_start + initial_length * math.cos(math.radians(initial_angle))
    y_mid = y_start + initial_length * math.sin(math.radians(initial_angle))

    # Draw initial vector (the deception) - lighter, dotted
    c.setStrokeColorRGB(*color_secondary)
    c.setLineWidth(0.35)
    c.setDash([1.5, 2.5])
    c.line(x_start, y_start, x_mid, y_mid)

    # Transition point marker - precise small circle
    c.setFillColorRGB(*color_highlight)
    c.setStrokeColorRGB(*color_accent)
    c.setLineWidth(0.25)
    c.circle(x_mid, y_mid, 1.2, fill=True, stroke=True)

    # Final vector (the reality) - direction shift
    # This is the "deke" - a significant angular change
    angle_shift = random.uniform(55, 125)  # Significant misdirection
    final_angle = initial_angle + angle_shift if random.random() > 0.5 else initial_angle - angle_shift
    final_length = random.uniform(0.65, 0.9) * max_vector_length

    # End of final vector
    x_end = x_mid + final_length * math.cos(math.radians(final_angle))
    y_end = y_mid + final_length * math.sin(math.radians(final_angle))

    # Draw final vector - solid, darker, authoritative
    c.setDash([])
    c.setStrokeColorRGB(*color_primary)
    c.setLineWidth(0.7)
    c.line(x_mid, y_mid, x_end, y_end)

    # Endpoint marker - slightly larger, filled
    c.setFillColorRGB(*color_primary)
    c.circle(x_end, y_end, 1.8, fill=True, stroke=False)

    # Origin marker - tiny dot at start
    c.setFillColorRGB(*color_secondary)
    c.circle(x_start, y_start, 0.8, fill=True, stroke=False)

    # Study number annotation - refined positioning
    c.setFont('GeistMono', 5)
    c.setFillColorRGB(*color_secondary)
    label_y = center_y - cell_height * 0.42

    # Ensure label stays within bounds
    label_x = center_x - 8
    c.drawString(label_x, label_y, f"{study_num:02d}")

    # Angle measurement annotation - very small, precise
    actual_angle_shift = abs(final_angle - initial_angle) % 360
    if actual_angle_shift > 180:
        actual_angle_shift = 360 - actual_angle_shift

    c.setFont('GeistMono', 4)
    c.setFillColorRGB(*color_accent)
    # Position angle near transition point, carefully placed
    angle_label_x = x_mid + 3
    angle_label_y = y_mid + 3
    c.drawString(angle_label_x, angle_label_y, f"{actual_angle_shift:.0f}°")

# Draw grid of studies with perfect spacing
study_index = 1
start_y = height - margin_v - 0.2 * inch

for row in range(studies_rows):
    y_center = start_y - (row * cell_height) - (cell_height / 2)

    for col in range(studies_cols):
        x_center = margin_h + (col * cell_width) + (cell_width / 2)

        if study_index <= num_trajectories:
            draw_refined_trajectory(c, x_center, y_center, study_index)
            study_index += 1

# === SUBTLE BACKGROUND LAYER ===
# Extremely refined flow lines suggesting movement field
c.saveState()
c.setStrokeColorRGB(*color_highlight)
c.setLineWidth(0.12)
c.setStrokeAlpha(0.25)

random.seed(100)  # Different seed for background
for i in range(45):
    x_flow = margin_h + random.uniform(0, work_width)
    y_flow = margin_v + random.uniform(0, work_height - 0.6 * inch)
    flow_angle = random.uniform(0, 360)
    flow_length = random.uniform(0.25, 0.65) * inch

    x_flow_end = x_flow + flow_length * math.cos(math.radians(flow_angle))
    y_flow_end = y_flow + flow_length * math.sin(math.radians(flow_angle))

    # Only draw if within bounds
    if (margin_h < x_flow_end < width - margin_h and
        margin_v < y_flow_end < height - margin_v):
        c.line(x_flow, y_flow, x_flow_end, y_flow_end)

c.restoreState()

# === BOTTOM ANNOTATION BLOCK ===
bottom_y = margin_v - 0.4 * inch

# Left annotation - methodology note
c.setFont('GeistMono', 5)
c.setFillColorRGB(*color_secondary)
c.drawString(margin_h, bottom_y, "Systematic documentation of vector transitions")

# Center annotation - sample size
center_text = f"n = {num_trajectories}"
text_width = c.stringWidth(center_text, 'GeistMono', 5)
c.drawString((width - text_width) / 2, bottom_y, center_text)

# Right annotation - angular notation
c.drawRightString(width - margin_h, bottom_y, "Δθ: 55°–125° variable")

# === ARCHIVAL REFERENCE LINE ===
# Very subtle horizontal rule as visual anchor
c.setStrokeColorRGB(*color_highlight)
c.setLineWidth(0.3)
rule_y = bottom_y + 0.25 * inch
c.line(margin_h, rule_y, width - margin_h, rule_y)

# Save PDF
c.save()

print(f"Museum-quality artwork created: {pdf_path}")
print(f"Design philosophy: design_philosophy.md")
print(f"\nConceptual thread: Vector studies documenting directional shift patterns")
print(f"Subtle reference: The 'deke' - hockey's art of misdirection woven into systematic form")
