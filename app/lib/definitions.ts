export interface User {
    uid: string;
    email: string;
    displayName: string;
    organizationId: string;
    role: 'user' | 'admin' | 'owner' | 'master' ;
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