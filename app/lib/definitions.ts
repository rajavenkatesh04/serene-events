export interface User {
    uid: string;
    email: string;
    displayName: string;
    username: string; // The public, unique @handle for social features
    profilePicUrl?: string;
    organizationId: string;
    role: 'user' | 'admin' | 'owner' | 'master' | 'god';
    attendedEvents: string[];
}

export interface Organisation {
    id: string;
    name: string;
    ownerUid: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
}

export type FirestoreTimestamp = {
    seconds: number;
    nanoseconds: number;
};

// This is the blueprint for a single Event document in Firestore.
export type Event = {
    docId: string;
    id: string;
    title: string;
    description: string;
    ownerUid: string;
    admins: string[];
    createdAt: string | { seconds: number; nanoseconds: number; };
    status: 'scheduled' | 'live' | 'paused' | 'ended' | 'cancelled';
    startsAt: FirestoreTimestamp;
    endsAt: FirestoreTimestamp;
    locationText: string;
    logoUrl?: string;
    bannerUrl?: string;
    feedbackSummary?: FeedbackSummary;
};

type GeoPoint = {
    lat: number;
    lng: number;
};

export type Announcement = {
    id: string;
    authorName: string;
    authorId: string;
    title: string;
    content: string;
    isPinned?: boolean;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };

    // --- UPGRADED LOCATION FIELD for Polygons ---
    location: {
        type: 'pin' | 'polygon'; // The shape type
        name: string;            // The main name, e.g., "Main Stage"
        details: string;         // The text for the pop-up info box

        // For a 'pin', this is the pin's location.
        // For a 'polygon', this is the center point for the map view.
        center: GeoPoint;

        // --- Polygon-specific fields ---
        path?: GeoPoint[];       // An array of vertices that define the shape
        fillColor?: string;      // e.g., '#FF0000' for red
        strokeColor?: string;    // e.g., '#000000' for black
    } | null;

    // --- NEW FIELD for attachments ---
    attachment: {
        url: string;      // The public URL to view/download the file
        path: string;     // The full path in Firebase Storage (e.g., "events/eventId/attachments/file.pdf")
        name: string;     // The original name of the file (e.g., "event-schedule.pdf")
        type: string;     // The file's MIME type (e.g., "application/pdf")
    } | null;
};

export type Invitation = {
    id: string;
    inviteeEmail: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string; // This is an ISO string after we serialized it
    // Add any other fields you might use from the invitation document
};


export interface Poll {
    id: string;
    question: string;
    options: { [optionText: string]: number};
    voters?: string[];
    isPinned?: boolean;
    eventId: string;
    creatorUid: string;
    timeStamp: Date;
}


// Represents a chat room document in Firestore
export interface Chat {
    id: string; // The event's short ID (e.g., "ABCDEF") will be the chat ID
    type: 'event'; // For now, we only have event chats
    participantUids: string[]; // List of all users who have sent a message
    lastMessage?: {
        text: string;
        senderUsername: string;
        timestamp: FirestoreTimestamp;
    };
}

// Represents a message document within a chat's sub-collection
// Why do we store senderUsername and senderProfilePicUrl on every message?
//     This is a common Firestore practice called denormalization.
//     It saves us from having to look up the user's profile for every single message we display, ' + 'which makes the chat load much, much faster.
export interface Message {
    id: string;
    senderUid: string;
    senderUsername: string; // Store username directly for easy display
    senderProfilePicUrl?: string; // Store avatar URL for easy display
    text: string;
    timestamp: FirestoreTimestamp;
}


// Add these new types to your definitions.ts file

export type FeedbackRatingCounts = {
    Excellent: number;
    Good: number;
    Average: number;
    Poor: number;
};

export type FeedbackSummary = {
    totalResponses: number;
    registrationRating: FeedbackRatingCounts;
    communicationRating: FeedbackRatingCounts;
    venueRating: FeedbackRatingCounts;
    pacingRating: FeedbackRatingCounts;
};

// In app/lib/definitions.ts, update the FeedbackResponse type

export type FeedbackResponse = {
    id: string;
    fullName: string;
    email: string;
    registrationId?: string;
    comments?: string;
    submittedAt: FirestoreTimestamp;
    registrationRating?: string;
    communicationRating?: string;
    venueRating?: string;
    pacingRating?: string;
};
