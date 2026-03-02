# Analytics Cards Visual Guide

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎯 Performance Dashboard                          [Daily] [Weekly] [Monthly]│
│  Track your visibility, engagement, and bookings in real-time               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   👁️ CARD 1  │  📅 CARD 2   │  ⏰ CARD 3   │  ⭐ CARD 4   │  ❤️ CARD 5   │
│              │              │              │              │              │
│  Profile     │  Total       │  Pending     │  Upcoming    │  Wishlist    │
│  Views       │  Bookings    │  Requests    │  Events      │  Count       │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

## Card 1: Profile Views (Blue Theme)

```
╔═══════════════════════════════════╗
║  👁️                    🟢 Live    ║
║                                   ║
║  1,234                            ║
║  Profile Views                    ║
║  Total all-time visits            ║
╚═══════════════════════════════════╝
```

**Features**:
- Blue gradient background (from-blue-500/20)
- Eye icon in blue circle
- "Live" badge (green, indicating real-time)
- Large number display (4xl font)
- Subtitle explaining metric
- Hover: scales to 105%, enhanced shadow

**Data Source**: `artists.views` (cumulative)
**Filter Impact**: None (always shows total)

---

## Card 2: Total Bookings (Green Theme)

```
╔═══════════════════════════════════╗
║  📅                    ↑ 8        ║
║                                   ║
║  45                               ║
║  Total Bookings                   ║
║  8 this week                      ║
╚═══════════════════════════════════╝
```

**Features**:
- Green gradient background (from-green-500/20)
- Calendar icon in green circle
- Badge shows filtered count with up arrow
- Main number: total bookings
- Subtitle: filtered period breakdown
- Hover: scales to 105%, green shadow glow

**Data Source**: `bookings` table
**Filter Impact**: Badge and subtitle change based on filter
- Daily: "X today"
- Weekly: "X this week"  
- Monthly: "X this month"

---

## Card 3: Pending Requests (Yellow Theme)

```
╔═══════════════════════════════════╗
║  ⏰                  ⚠️ Action    ║
║                                   ║
║  3                                ║
║  Pending Requests                 ║
║  Awaiting your response           ║
╚═══════════════════════════════════╝
```

**Features**:
- Yellow gradient background (from-yellow-500/20)
- Clock icon in yellow circle
- "Action" badge (animated pulse when > 0)
- Urgent visual treatment
- Hover: scales to 105%, yellow shadow glow

**Data Source**: `bookings WHERE status = 'pending'`
**Filter Impact**: None (always current)
**Special**: Badge only shows when count > 0

---

## Card 4: Upcoming Events (Purple Theme)

```
╔═══════════════════════════════════╗
║  ⭐                ✓ Confirmed    ║
║                                   ║
║  5                                ║
║  Upcoming Events                  ║
║  Confirmed bookings ahead         ║
╚═══════════════════════════════════╝
```

**Features**:
- Purple gradient background (from-purple-500/20)
- Star icon in purple circle
- "Confirmed" badge (shows when > 0)
- Future-looking metric
- Hover: scales to 105%, purple shadow glow

**Data Source**: `bookings WHERE status = 'accepted' AND event_date >= NOW()`
**Filter Impact**: None (always future events)
**Special**: Badge only shows when count > 0

---

## Card 5: Wishlist Count (Pink Theme)

```
╔═══════════════════════════════════╗
║  ❤️                 ✨ Popular    ║
║                                   ║
║  67                               ║
║  Wishlist Adds                    ║
║  Users who saved you              ║
╚═══════════════════════════════════╝
```

**Features**:
- Pink gradient background (from-pink-500/20)
- Heart icon in pink circle
- "Popular" badge with sparkles icon
- Engagement metric
- Hover: scales to 105%, pink shadow glow

**Data Source**: `wishlist` table
**Filter Impact**: None (cumulative metric)

---

## Responsive Behavior

### Desktop (lg: 1024px+)
```
[Card 1] [Card 2] [Card 3] [Card 4] [Card 5]
```
5 columns, equal width

### Tablet (md: 768px - 1023px)
```
[Card 1] [Card 2]
[Card 3] [Card 4]
[Card 5]
```
2 columns

### Mobile (< 768px)
```
[Card 1]
[Card 2]
[Card 3]
[Card 4]
[Card 5]
```
1 column, stacked

---

## Filter Tabs Design

```
┌─────────────────────────────────────┐
│  [  Daily  ] [ Weekly ] [ Monthly ] │
└─────────────────────────────────────┘
```

**Active State**: Gradient background (secondary to primary), white text, shadow
**Inactive State**: Gray text, transparent background
**Hover**: Gray background, white text

---

## Color Palette

| Card | Primary Color | Gradient | Border | Icon |
|------|--------------|----------|--------|------|
| Profile Views | Blue | from-blue-500/20 | border-blue-500/30 | text-blue-400 |
| Total Bookings | Green | from-green-500/20 | border-green-500/30 | text-green-400 |
| Pending Requests | Yellow | from-yellow-500/20 | border-yellow-500/30 | text-yellow-400 |
| Upcoming Events | Purple | from-purple-500/20 | border-purple-500/30 | text-purple-400 |
| Wishlist Count | Pink | from-pink-500/20 | border-pink-500/30 | text-pink-400 |

---

## Animation Effects

### Hover Animation
```css
transition: all 0.3s ease
transform: scale(1.05)
box-shadow: 0 20px 60px rgba(color, 0.2)
border-color: rgba(color, 0.5)
```

### Pulse Animation (Pending Requests Badge)
```css
animation: pulse 2s infinite
```

### Badge Transitions
```css
transition: all 0.2s ease
```

---

## Typography Hierarchy

1. **Main Number**: 4xl font, black weight, white color, tracking-tight
2. **Card Title**: sm font, semibold weight, gray-400 color
3. **Subtitle**: xs font, regular weight, gray-500 color
4. **Badge Text**: xs font, bold weight, color-400

---

## Accessibility Features

- High contrast text on backgrounds
- Clear visual hierarchy
- Hover states for interactive feedback
- Semantic HTML structure
- Screen reader friendly labels
- Keyboard navigation support

---

## Performance Metrics Display Examples

### Low Activity Artist
```
Profile Views: 23
Total Bookings: 2 (0 this week)
Pending Requests: 0
Upcoming Events: 1
Wishlist Count: 5
```

### Medium Activity Artist
```
Profile Views: 456
Total Bookings: 18 (3 this week)
Pending Requests: 2
Upcoming Events: 4
Wishlist Count: 34
```

### High Activity Artist
```
Profile Views: 2,847
Total Bookings: 127 (15 this week)
Pending Requests: 8
Upcoming Events: 12
Wishlist Count: 189
```

---

## Integration with Dashboard

The analytics cards section appears at the top of the dashboard, immediately below the header, providing artists with instant visibility into their key performance metrics before scrolling to detailed sections like calendar, pending requests, and recent enquiries.
