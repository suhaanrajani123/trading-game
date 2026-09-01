import math

def polar_to_cartesian(cx, cy, r, angle_deg):
    angle_rad = math.radians(angle_deg)
    return cx + r * math.cos(angle_rad), cy + r * math.sin(angle_rad)

def get_spike(cx, cy, r_inner, r_outer, angle_deg, width_deg=15):
    # inner points
    p1 = polar_to_cartesian(cx, cy, r_inner, angle_deg - width_deg/2)
    p2 = polar_to_cartesian(cx, cy, r_outer, angle_deg)
    p3 = polar_to_cartesian(cx, cy, r_inner, angle_deg + width_deg/2)
    return f"M {p1[0]} {p1[1]} L {p2[0]} {p2[1]} L {p3[0]} {p3[1]} Z"

cx, cy = 500, 500
r_circle = 300

svg = f'<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" fill="none">\n'

color = "#4ade80"
stroke_width = 45

svg += f'<defs><mask id="arrow-mask"><rect width="1000" height="1000" fill="white" />'
# The arrow mask to cut out space for the arrow
svg += f'<line x1="200" y1="800" x2="800" y2="200" stroke="black" stroke-width="90" stroke-linecap="round" />'
svg += f'</mask></defs>\n'

# Draw compass spikes
# N=270, S=90, E=0, W=180
# NE=315, SE=45, SW=135, NW=225
for angle in [0, 90, 180, 270]:
    svg += f'  <path d="{get_spike(cx, cy, r_circle, r_circle + 120, angle, 20)}" fill="{color}" />\n'

for angle in [45, 135, 225, 315]:
    # Skip NE (315) and SW (135) because the arrow replaces them
    if angle in [315, 135]:
        continue
    svg += f'  <path d="{get_spike(cx, cy, r_circle, r_circle + 70, angle, 15)}" fill="{color}" />\n'

# Draw the broken circle
svg += f'  <circle cx="{cx}" cy="{cy}" r="{r_circle}" stroke="{color}" stroke-width="{stroke_width}" mask="url(#arrow-mask)" />\n'

# Draw the 'S'
# M 650 350 C 550 250, 350 250, 350 350 C 350 450, 650 550, 650 650 C 650 750, 450 750, 350 650
# Tweak the S path to look like a modern $ sign body
s_path = f"M 630 350 C 550 200, 370 200, 370 350 C 370 480, 630 520, 630 650 C 630 800, 450 800, 370 650"
svg += f'  <path d="{s_path}" stroke="{color}" stroke-width="{stroke_width}" stroke-linecap="round" mask="url(#arrow-mask)" />\n'

# Draw the diagonal arrow (SW to NE)
# SW is 135 degrees, NE is 315 degrees
svg += f'  <line x1="300" y1="700" x2="750" y2="250" stroke="{color}" stroke-width="{stroke_width}" stroke-linecap="round" />\n'

# Arrow head at NE (around x=800, y=200)
# Arrow points at 315 degrees (top-right)
# Base of arrow head
svg += f'  <polygon points="730,170 870,130 830,270" fill="{color}" />\n'

svg += '</svg>'

with open("c:\\Users\\suhaa\\Desktop\\trading-game\\frontend\\public\\logo.svg", "w") as f:
    f.write(svg)

with open("c:\\Users\\suhaa\\Desktop\\trading-game\\frontend\\app\\icon.svg", "w") as f:
    f.write(svg)
