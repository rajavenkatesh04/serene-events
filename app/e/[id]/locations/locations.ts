// File: app/e/[id]/guide/locations.ts

export interface Location {
    id: number;
    // Categories strictly restricted to those found in the document [cite: 8, 11]
    category: 'Registration confirmation & collecting Robes' | 'Seating Plan' | 'Lunch' | 'Parking' | 'Robe Return' | 'Breakfast';
    title: string;
    details: string;
    mapUrl: string;
    latitude: number;
    longitude: number;
}

export const eventLocations: Location[] = [
    // Registration & Robes Collection Venues [cite: 9, 10]
    {
        id: 1,
        category: 'Registration confirmation & collecting Robes',
        title: 'ONLINE Education: MBA',
        details: 'University Building (Ground Floor)',
        mapUrl: 'https://goo.gl/maps/UiT6NSdVieygaavP7',
        latitude: 12.8231,
        longitude: 80.0458,
    },
    {
        id: 2,
        category: 'Registration confirmation & collecting Robes',
        title: 'ONLINE Education: M.C.A., B.B.A., B.C.A., & Diploma',
        details: 'Tech Park 1',
        mapUrl: 'https://goo.gl/maps/GwtWeGXS8LR4oBTP6',
        latitude: 12.8225,
        longitude: 80.0465,
    },
    {
        id: 3,
        category: 'Registration confirmation & collecting Robes',
        title: 'Distance Education: B.Com., B.B.A., M.B.A., M.C.A., M.Com. & M.A',
        details: 'Tech Park 1 ',
        mapUrl: 'https://goo.gl/maps/GwtWeGXS8LR4oBTP6',
        latitude: 12.8225,
        longitude: 80.0465,
    },

    // Breakfast Venue [cite: 11, 12]
    {
        id: 4,
        category: 'Breakfast',
        title: 'Breakfast',
        details: 'Tech Park 1 Ground Floor Canteen',
        mapUrl: 'https://goo.gl/maps/GwtWeGXS8LR4oBTP6',
        latitude: 12.8225,
        longitude: 80.0465,
    },

    // Lunch Venue [cite: 11, 12]
    {
        id: 5,
        category: 'Lunch',
        title: 'Lunch',
        details: 'Sannasi Hostel',
        mapUrl: 'https://maps.app.goo.gl/GAxoaVyLgXdR3VEc8',
        latitude: 12.8208,
        longitude: 80.0448,
    },

    // Parking [cite: 12]
    {
        id: 6,
        category: 'Parking',
        title: 'Car Parking',
        details: 'Play Ground (In front of Dr. T.P Ganesan Auditorium)',
        mapUrl: 'https://goo.gl/maps/A2oZrTT8pBSL1cLfA',
        latitude: 12.8236,
        longitude: 80.0440,
    },

    // Robe Return Points [cite: 11, 12]
    {
        id: 7,
        category: 'Robe Return',
        title: 'University Building (Ground Floor)',
        details: 'Retuning of Convocation Robes',
        mapUrl: 'https://goo.gl/maps/UiT6NSdVieygaavP7',
        latitude: 12.8231,
        longitude: 80.0458,
    },
    {
        id: 8,
        category: 'Robe Return',
        title: 'Tech Park – I',
        details: 'Retuning of Convocation Robes',
        mapUrl: 'https://goo.gl/maps/GwtWeGXS8LR4oBTP6',
        latitude: 12.8225,
        longitude: 80.0465,
    },

    // Seating Plan (Main Venue) [cite: 6]
    {
        id: 9,
        category: 'Seating Plan',
        title: 'Dr. T. P. Ganesan AUDITORIUM',
        details: 'Main Venue',
        mapUrl: 'https://maps.app.goo.gl/PjUThgaPY7DY3NcG9',
        latitude: 12.824976330413575,
        longitude: 80.04667526762744,
    },
];

// Helper function to get locations by category
export const getLocationsByCategory = (category: Location['category']): Location[] => {
    return eventLocations.filter(location => location.category === category);
};

// Helper function to get location by id
export const getLocationById = (id: number): Location | undefined => {
    return eventLocations.find(location => location.id === id);
};

// All categories for filtering (Strictly limited to doc contents)
export const locationCategories: Location['category'][] = [
    'Registration confirmation & collecting Robes',
    'Seating Plan',
    'Breakfast',
    'Lunch',
    'Parking',
    'Robe Return'
];