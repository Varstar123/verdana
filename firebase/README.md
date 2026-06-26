# Firebase (Firestore) — Verdana's database

Auth is **Clerk** (Google sign-in); **Firestore** is the database. The app runs in
demo mode (seeded data) until Firebase is configured.

## Setup

1. Create a Firebase project → add a **Web app** → copy the config.
2. Enable **Firestore Database** (production mode).
3. Add the client config to your env as `NEXT_PUBLIC_FIREBASE_*` (see `.env.example`).
4. For server-side reads, create a **service account** (Project Settings → Service
   accounts → Generate new private key) and set `FIREBASE_PROJECT_ID`,
   `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
5. Publish the security rules in [firestore.rules](firestore.rules)
   (`firebase deploy --only firestore:rules`, or paste into the console).

## Collections

The Firestore document model mirrors `src/lib/types.ts`. Documents are keyed by
the **Clerk user id** where a user is involved.

| Collection | Doc id | Key fields |
| --- | --- | --- |
| `profiles` | clerk userId | `planetId`, `username`, `displayName`, `avatarHue`, `bio`, `country`, `followers`, `following`, `badgeIds[]`, + flat stat fields (`treesPlanted`, `co2OffsetKg`, `plasticRemovedKg`, `donationsUsd`, `volunteerHours`, `recycleKg`, `challengesCompleted`, `lessonsCompleted`, `ecoPoints`, `streakDays`), `ecoScore`, `earthHealth`, `createdAt` |
| `contributions` | auto | `userId`, `type`, `amount`, `co2Kg`, `ecoPoints`, `note`, `createdAt` |
| `follows` | `${followerId}_${followingId}` | `followerId`, `followingId`, `createdAt` |
| `posts` | auto | `authorId`, `body`, `imageUrl`, `hashtags[]`, `likes`, `createdAt` |
| `postComments` | auto | `postId`, `authorId`, `body`, `createdAt` |
| `forumThreads` | auto | `categoryId`, `authorId`, `title`, `body`, `votes`, `createdAt` |
| `forumComments` | auto | `threadId`, `parentId`, `authorId`, `body`, `votes`, `createdAt` |
| `challenges` | auto | `title`, `description`, `type`, `rewardXp`, `rewardCoins`, `activeOn` |
| `challengeCompletions` | `${userId}_${challengeId}` | `userId`, `challengeId`, `completedAt` |

## Where it plugs in

- Server reads: [src/lib/firebase/admin.ts](../src/lib/firebase/admin.ts) →
  used by [src/lib/session.ts](../src/lib/session.ts) (`profiles/{userId}`).
- Client reads/writes: [src/lib/firebase/client.ts](../src/lib/firebase/client.ts).
- Public/demo data still comes from [src/lib/community.ts](../src/lib/community.ts);
  swap those helpers for Firestore queries as the social features land.
