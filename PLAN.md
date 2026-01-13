# When2Meet-Style Availability Tool for CodeX

## Overview
Build a When2Meet-style availability scheduling tool that allows club members (especially eboard) to coordinate meeting times. Users can create availability polls and share them with their team or club.

## Features
1. **Create Availability Polls** - Set date range, time slots, poll title/description
2. **Interactive Time Grid** - Click/drag to mark available times (like When2Meet)
3. **View Group Availability** - Heatmap showing overlapping availability
4. **Share via Link** - Each poll gets a unique shareable URL
5. **No Auth Required** - Just enter name to respond (like When2Meet)
6. **Club Association** - Optionally link polls to specific clubs

## Architecture

### Sanity Schemas

**`availabilityPoll.js`** - The poll document:
```
- title (string, required)
- slug (slug from title)
- description (text)
- club (reference to club, optional)
- createdBy (string - name of creator)
- createdByEmail (string - for notifications)
- dates (array of date strings) - which days to show
- startTime (string, e.g., "9:00")
- endTime (string, e.g., "21:00")
- timeSlotMinutes (number, 15/30/60 - slot duration)
- timezone (string)
- responses (array of response objects inline)
- createdAt (datetime)
- expiresAt (datetime, optional)
```

**Response object (embedded in poll):**
```
- name (string)
- email (string, optional)
- availability (array of datetime strings representing available slots)
- submittedAt (datetime)
```

### Routes & Pages

1. **`/schedule`** - Landing page, list of recent/public polls, "Create New" button
2. **`/schedule/new`** - Create a new poll form (client component)
3. **`/schedule/[slug]`** - View/respond to a poll
   - Shows the time grid
   - Enter name → click/drag to mark availability
   - See heatmap of group availability

### API Routes

1. **`/api/schedule/create`** - POST to create new poll in Sanity
2. **`/api/schedule/respond`** - POST to add/update a response to a poll

### Key Components

1. **`TimeGrid.js`** (client) - The interactive availability grid
   - Days as columns, time slots as rows
   - Click/drag to select multiple slots
   - Green = available, empty = unavailable
   - Heatmap mode shows color intensity based on # of people

2. **`PollForm.js`** (client) - Create new poll form
   - Date picker for selecting days
   - Time range selector
   - Optional club association dropdown

3. **`ResponseForm.js`** (client) - Name input + grid interaction

### Design (Neo-brutalist style)

- 2px solid borders everywhere
- `var(--mono)` for headers and labels
- `var(--sans)` for body text
- `var(--accent)` for highlighting selected slots
- Grid cells with clear borders
- Heatmap: light green → dark green based on availability count
- Box shadows on buttons: `4px 4px 0px var(--border-color)`

## File Structure
```
src/
├── app/
│   └── schedule/
│       ├── page.js              # List polls, create button
│       ├── schedule.module.css  # Shared styles
│       ├── new/
│       │   ├── page.js          # Create poll form page
│       │   └── PollForm.js      # Client component
│       └── [slug]/
│           ├── page.js          # View/respond to poll
│           ├── poll.module.css  # Poll-specific styles
│           ├── TimeGrid.js      # Interactive grid component
│           └── ResponseForm.js  # Name + grid wrapper
├── sanity/
│   └── schemaTypes/
│       ├── availabilityPoll.js  # New schema
│       └── index.js             # Register new schema
└── api/
    └── schedule/
        ├── create/route.js      # Create poll endpoint
        └── respond/route.js     # Submit response endpoint
```

## Implementation Steps

1. **Create Sanity schema** (`availabilityPoll.js`)
2. **Register schema** in `index.js`
3. **Build `/schedule` listing page**
4. **Build `/schedule/new` with `PollForm.js`**
5. **Create API route `/api/schedule/create`**
6. **Build `TimeGrid.js` component** (the core interactive piece)
7. **Build `/schedule/[slug]` page with `ResponseForm.js`**
8. **Create API route `/api/schedule/respond`**
9. **Add heatmap visualization mode**
10. **Style everything in neo-brutalist design**

## User Flow

1. **Create Poll:**
   - Go to `/schedule` → Click "Create New"
   - Enter title, select dates, set time range
   - Optionally associate with a club
   - Submit → redirected to poll page with shareable link

2. **Respond to Poll:**
   - Open poll link `/schedule/[slug]`
   - Enter your name
   - Click/drag on grid to mark your available times
   - Submit → see updated group availability heatmap

3. **View Results:**
   - Anyone with link can see the heatmap
   - Darker green = more people available
   - Hover to see who's available at each slot
