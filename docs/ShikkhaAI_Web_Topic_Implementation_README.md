# ShikkhaAI Web — Topic Availability + Chapter-Aware Exam Implementation

This README explains how to implement the **chapter-aware topic availability workflow** on the web app so the UI can show which topics are currently available for exam generation.

The web app already has a topic mastery screen, a typed analytics model, a React Query hook, and a generic API proxy. The missing work is to connect these pieces to chapter/topic-aware data coming from the backend and RAG layer.

---

## 1) What already exists in the web app

### 1.1 Topic UI is already implemented
The web repo already contains a dedicated topics page and topic components:

- `src/app/(dashboard)/topics/page.tsx`
- `src/app/(dashboard)/topics/components/chapter-accordion.tsx`
- `src/app/(dashboard)/topics/components/subject-card.tsx`
- `src/app/(dashboard)/topics/components/topic-list-tile.tsx`
- `src/app/(dashboard)/topics/components/topics-skeleton.tsx`

The page uses a nested structure of **Subject → Chapter → Topic**, which is the right UI shape for chapter-aware textbooks.

### 1.2 Data fetching already exists
The topic page currently fetches topic mastery data through:

- `src/hooks/use-topics-mastery.ts`

That hook calls:

- `GET /api/proxy/student/{studentId}/topics`

### 1.3 Type definitions already exist
The data shape is already declared in:

- `src/lib/types/analytics.ts`

Important types already present:

- `TopicsMasteryData`
- `MasterySubject`
- `MasteryChapter`
- `MasteryTopic`

These types already match a chapter-aware UI model.

### 1.4 API proxy already exists
All backend requests go through the Next.js proxy route:

- `src/app/api/proxy/[...path]/route.ts`

This proxy:
- reads the `token` cookie,
- forwards the request to the backend API base URL,
- preserves query params,
- works for GET / POST / PUT / DELETE.

So the web app already has the correct proxy architecture for new topic-aware endpoints.

---

## 2) What is missing

The web app is ready to render chapter/topic hierarchy, but the backend response is not yet guaranteed to provide the **textbook-extracted topic structure**.

The missing pieces are:

1. a backend endpoint that returns chapter-aware topics extracted from textbook content,
2. a frontend data contract that matches that endpoint,
3. optional UI updates so the topic screen can distinguish curriculum topics from textbook-derived available topics,
4. optional exam-config integration so the selected topic can be passed into exam generation.

---

## 3) Recommended data model

The web app should eventually support two topic sources:

### 3.1 Curriculum topics
These are the existing curriculum/performance topics already represented by:
- `src/lib/types/analytics.ts` → `TopicsData` and `TopicsMasteryData`

### 3.2 Extracted textbook topics
These come from chapter segmentation and should include:
- `subject`
- `chapter_name`
- `topic_name`
- `topic_order`
- `availability_status`
- `page_start`
- `page_end`
- `source_book_id`
- `source_chapter_id`

The chapter-aware data should fit the existing page structure:
- subject card
- chapter accordion
- topic list tile

---

## 4) Exact file-by-file implementation plan for the web

### 4.1 Update the topic query hook
Modify:

- `src/hooks/use-topics-mastery.ts`

Current behavior:
- fetches `GET /api/proxy/student/{studentId}/topics`

Required changes:
- keep this hook if the backend continues returning the same structure,
- or add a second hook for textbook-derived topic availability, for example:
  - `useAvailableTopics(studentId)`
  - `useChapterTopics(studentId)`

If a new endpoint is introduced, the hook should call it through the proxy route.

### 4.2 Extend the web type definitions
Modify:

- `src/lib/types/analytics.ts`

Add new types if the backend returns a chapter extraction payload, such as:
- `ExtractedTopic`
- `ExtractedChapter`
- `TextbookTopicAvailabilityData`

Keep the existing `TopicsMasteryData` types intact so the current UI does not break.

### 4.3 Update the topics page to show chapter-aware availability
Modify:

- `src/app/(dashboard)/topics/page.tsx`
- `src/app/(dashboard)/topics/components/chapter-accordion.tsx`
- `src/app/(dashboard)/topics/components/topic-list-tile.tsx`

Suggested behavior:
- show a toggle between:
  - curriculum topics
  - textbook-extracted available topics
- preserve the existing chapter accordion layout,
- show a small badge for "available for exam" when the backend marks a topic as eligible,
- optionally disable or gray out unavailable topics.

### 4.4 Keep the proxy route as the single gateway
Modify only if needed:

- `src/app/api/proxy/[...path]/route.ts`

This file is already enough for most backend calls.

Only add a new Next.js route if you need special web-only behavior. Otherwise, keep the generic proxy and let the frontend call the new backend endpoint through it.

### 4.5 Update any exam configuration page that chooses a topic
If the exam configuration screen lets the student select subject/topic before generation, update the related exam files under:

- `src/app/(dashboard)/exam/`

Use the selected chapter/topic in the request payload sent through the proxy route.

### 4.6 Update any frontend constants if the endpoint name changes
If the endpoint path changes, update the API constants or helper utilities under:

- `src/lib/utils/`
- `src/lib/api/`

Keep endpoint naming stable so the hook and UI stay small.

---

## 5) Recommended web flow

### Flow A — view available topics
1. Student opens `src/app/(dashboard)/topics/page.tsx`.
2. `use-topics-mastery.ts` fetches topic data through `src/app/api/proxy/[...path]/route.ts`.
3. The backend returns subject → chapter → topic hierarchy.
4. `chapter-accordion.tsx` expands chapters and shows topic availability.

### Flow B — choose a topic for exam generation
1. Student picks a subject/chapter/topic in the exam screen.
2. The exam page sends the selected topic through the proxy route.
3. The backend and RAG layer use that topic as a retrieval filter.
4. Generated questions stay aligned with the selected chapter section.

### Flow C — future textbook-derived topic browser
1. Backend returns extracted textbook topics with availability metadata.
2. Web converts that into the same nested UI shape.
3. The topic page becomes both a progress dashboard and an exam-entry selector.

---

## 6) What the backend should return to the web app

The web app will be easiest to maintain if the backend returns a stable shape like this:

```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "subject": "Science",
        "total_topics": 12,
        "completed_topics": 4,
        "overall_completion_percentage": 33,
        "chapters": [
          {
            "chapter_name": "Force and Motion",
            "overall_completion_percentage": 50,
            "topics": [
              {
                "id": "topic_1",
                "name": "Types of Force",
                "is_completed": false,
                "is_attempted": true,
                "last_score": 62
              }
            ]
          }
        ]
      }
    ],
    "total_topics": 12,
    "completed_topics": 4
  }
}
```

That shape matches the existing web types in:
- `src/lib/types/analytics.ts`

---

## 7) Minimal implementation order

1. Confirm the backend endpoint shape that the web will consume.
2. Update `src/hooks/use-topics-mastery.ts` or create a new hook for textbook-extracted topics.
3. Extend `src/lib/types/analytics.ts` if a new payload is introduced.
4. Update `src/app/(dashboard)/topics/page.tsx` to display the new availability data.
5. Refine `src/app/(dashboard)/topics/components/chapter-accordion.tsx` and `topic-list-tile.tsx` to show availability state clearly.
6. Keep `src/app/api/proxy/[...path]/route.ts` as the default transport path.
7. Connect the exam screen under `src/app/(dashboard)/exam/` so the selected topic is passed into generation.

---

## 8) Implementation notes

- Do not replace the current topic mastery flow unless the new chapter-aware API is fully stable.
- Prefer a backward-compatible payload so the current topic page continues working during migration.
- Keep the proxy route generic; it is already the cleanest place to forward backend calls.
- The web app already has the right page structure for nested chapter-topic data, so most work is wiring and type updates.
