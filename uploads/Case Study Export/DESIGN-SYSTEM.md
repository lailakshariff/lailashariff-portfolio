# Case Study Overview — Design System

## Typography
- Font family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`
- Monospace (eyebrows/labels/numbers): `'SF Mono', Menlo, Consolas, monospace`, 12–15px, letter-spacing 0.08em, color `#b5b5b5` (or `#c9c9c9` for numbered steps)
- H1 (page title): 44px, weight 600, color `#111`, line-height 1.2
- H2 (section titles): 30–32px, weight 600, color `#111`, line-height 1.3
- Body copy: 18–19px, color `#444`/`#555`, line-height 1.6
- Card copy: 16px, color `#666`, line-height 1.5
- Card titles: 18–20px, weight 600–700, color `#111`
- Stat numbers: 30px, weight 500, color `#111`
- Nav links: 17px; active `#1a1a1a` weight 600, inactive `#c9c9c9`

## Colors
- Background: `#fff`
- Primary text: `#1a1a1a` / `#111`
- Secondary text: `#444`, `#555`, `#666`
- Muted/label text: `#b5b5b5`, `#c9c9c9`, `#888`
- Card background: `#f6f6f7`
- Dividers: `#ececec`
- Hero gradient: `radial-gradient(ellipse 118% 250% at 50% 50%, #ffffff 0%, #faf7fd 38%, #f0e8fa 66%, #e0cdf3 88%, #cfb6ec 100%)`
- Icon strokes: `#8a8a8a`

## Grid & Spacing
- Sidebar: fixed 280px width, padding `48px 0 64px 48px`
- Main content: `flex:1`, max-width 1400px, inner padding `48px 80px 100px 80px`
- Section bottom margins: 48–96px between major sections
- Metadata row: 4-column grid, 32px gap
- Two-column text/image sections: `1.4fr 1fr` or `1fr 1fr`, 64px gap
- Card grids: `repeat(3, 1fr)` or `repeat(2, 1fr)`, 20–24px gap

## Borders & Radius
- Cards: 16–24px border-radius
- Images/image-slots: 12–16px border-radius
- Section divider: 1px solid `#ececec`

## Image Treatment
- Hero banner: full-width, 480px height, `object-fit: contain` inside the gradient band (never cropped)
- Content images: `image-slot` placeholders, rounded corners (12–16px), fixed heights (220–340px depending on section)

## Sidebar Behavior
- Positioned below the hero banner, left-aligned, fixed 280px column
- Vertical nav list, 22px gap between links; one active item (bold, dark), rest muted grey
- "Back to Home" link pinned below nav with left-arrow glyph

## Reusable Layout Patterns
- **Eyebrow label**: monospace, uppercase, small, muted grey — precedes every section heading
- **Stat card**: `#f6f6f7` background, 24px radius, 28px padding, large number + supporting line
- **Principle/feature card**: `#f6f6f7` background, 16–20px radius, image on top, numbered index (`01`, `02`…), title, description
- **Journey timeline**: horizontal row of steps connected by a thin `#ececec` line; active step gets a `#f6f6f7` card background, inactive steps are unstyled and dimmed (`opacity:0.35`)
- **Metric pill**: `#f6f6f7` background, 12px radius, icon + label, used in pairs
