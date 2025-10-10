// File: app/e/[id]/guide/locations.ts

export interface Location {
    id: number;
    category: 'Registration & Robes' | 'Lunch' | 'Parking' | 'Parents Accommodation' | 'Robe Return';
    title: string;
    details: string;
    mapUrl: string;
    latitude: number;
    longitude: number;
}

export const eventLocations: Location[] = [
    // Registration & Robes Collection Venues
    {
        id: 1,
        category: 'Registration & Robes',
        title: 'Ph.D., First Rank Holders & Select Colleges',
        details: 'Ph.D. (All Programmes), First Rank Holders (All Programmes), SRM College of Pharmacy, SRM College of Physiotherapy, Faculty of Engineering & Technology, School of Bio-Engineering',
        mapUrl: 'https://goo.gl/maps/kuDng8D1P8cL1sjR8',
        latitude: 12.8242,
        longitude: 80.0435,
    },
    {
        id: 2,
        category: 'Registration & Robes',
        title: 'Medical & Health Sciences',
        details: 'SRM Medical College Hospital and Research Centre, SRM Kattankulathur Dental College, SRM School of Public Health, SRM College of Nursing, SRM College of Occupational Therapy - Tech Park I',
        mapUrl: 'https://goo.gl/maps/GwtWeGXS8LR4oBTP6',
        latitude: 12.8225,
        longitude: 80.0465,
    },
    {
        id: 3,
        category: 'Registration & Robes',
        title: 'Management & Science PG Programmes',
        details: 'Faculty of Management - All PG Programmes (Kattankulathur & Vadapalani), Science & Humanities - All PG Programmes (Kattankulathur & Vadapalani) - Medical College Ground Floor',
        mapUrl: 'https://goo.gl/maps/aHeUBdon2nZiuSZK9',
        latitude: 12.8255,
        longitude: 80.0401,
    },
    {
        id: 4,
        category: 'Registration & Robes',
        title: 'Law & Polytechnic',
        details: 'Faculty of Law - Valliammai Polytechnic College (Block I)',
        mapUrl: 'https://maps.app.goo.gl/bCe2gvVn56wmDifu7',
        latitude: 12.8220,
        longitude: 80.0425,
    },
    {
        id: 5,
        category: 'Registration & Robes',
        title: 'Agriculture, Hotel Management & Architecture',
        details: 'Faculty of Agricultural Sciences, SRM Hotel Management (Kattankulathur & Vadapalani) - Architecture Block Ground Floor',
        mapUrl: 'https://goo.gl/maps/WLF98VPYvgCK6Jh58',
        latitude: 12.8238,
        longitude: 80.0442,
    },
    {
        id: 6,
        category: 'Registration & Robes',
        title: 'Management UG Programmes',
        details: 'Faculty of Management - UG All Programmes (Kattankulathur & Vadapalani) - University Building Second Floor',
        mapUrl: 'https://maps.app.goo.gl/PHaupMcfCZqRMSSY6',
        latitude: 12.8231,
        longitude: 80.0459,
    },
    {
        id: 7,
        category: 'Registration & Robes',
        title: 'Science & Humanities UG (Kattankulathur)',
        details: 'Faculty of Science & Humanities - UG All Programmes (Kattankulathur) - University Building Ground Floor',
        mapUrl: 'https://goo.gl/maps/UiT6NSdVieygaavP7',
        latitude: 12.8231,
        longitude: 80.0458,
    },
    {
        id: 8,
        category: 'Registration & Robes',
        title: 'Science & Humanities UG (Vadapalani)',
        details: 'Faculty of Science and Humanities - UG All Programmes (Vadapalani) - Basic Engineering Lab (BEL)',
        mapUrl: 'https://maps.app.goo.gl/TFfgTZy5FxdXb5297',
        latitude: 12.8245,
        longitude: 80.0470,
    },

    // Lunch Venue
    {
        id: 9,
        category: 'Lunch',
        title: 'Lunch for Graduands & Parents',
        details: 'Sannasi Hostel - Available from 11:00 AM to 1:30 PM',
        mapUrl: 'https://maps.app.goo.gl/GAxoaVyLgXdR3VEc8',
        latitude: 12.8208,
        longitude: 80.0448,
    },

    // Parking
    {
        id: 10,
        category: 'Parking',
        title: 'Car Parking',
        details: 'Play Ground (In front of Dr. T.P Ganesan Auditorium)',
        mapUrl: 'https://goo.gl/maps/A2oZrTT8pBSL1cLfA',
        latitude: 12.8236,
        longitude: 80.0440,
    },

    // Parents Accommodation
    {
        id: 11,
        category: 'Parents Accommodation',
        title: 'Tech Park II',
        details: 'Tech Park II - 1st Floor to 10th Floor (except 4th Floor) with Live Stream',
        mapUrl: 'https://maps.app.goo.gl/FjuPtqVBJNKHeGQQ9',
        latitude: 12.8228,
        longitude: 80.0468,
    },
    {
        id: 12,
        category: 'Parents Accommodation',
        title: 'SRM Medical College',
        details: 'Medical College Old Examinations Hall (II Floor) and New Examinations Hall (II Floor) with Live Stream',
        mapUrl: 'https://goo.gl/maps/aHeUBdon2nZiuSZK9',
        latitude: 12.8255,
        longitude: 80.0401,
    },
    {
        id: 13,
        category: 'Parents Accommodation',
        title: 'Tech Park I',
        details: 'Tech Park I with Live Stream arrangements',
        mapUrl: 'https://goo.gl/maps/bj7PxxYXCcmRNvaU7',
        latitude: 12.8225,
        longitude: 80.0465,
    },
    {
        id: 14,
        category: 'Parents Accommodation',
        title: 'Faculty of Management',
        details: 'SRM College of Management with Live Stream',
        mapUrl: 'https://goo.gl/maps/Fm4gSV9UNXPJVsMi6',
        latitude: 12.8240,
        longitude: 80.0455,
    },

    // Robe Return Points
    {
        id: 15,
        category: 'Robe Return',
        title: 'Bio-Engineering Block',
        details: 'Robe return point',
        mapUrl: 'https://goo.gl/maps/kuDng8D1P8cL1sjR8',
        latitude: 12.8242,
        longitude: 80.0435,
    },
    {
        id: 16,
        category: 'Robe Return',
        title: 'SRM Medical College',
        details: 'Robe return point',
        mapUrl: 'https://goo.gl/maps/aHeUBdon2nZiuSZK9',
        latitude: 12.8255,
        longitude: 80.0401,
    }
];

// Helper function to get locations by category
export const getLocationsByCategory = (category: Location['category']): Location[] => {
    return eventLocations.filter(location => location.category === category);
};

// Helper function to get location by id
export const getLocationById = (id: number): Location | undefined => {
    return eventLocations.find(location => location.id === id);
};

// All categories for filtering
export const locationCategories: Location['category'][] = [
    'Registration & Robes',
    'Lunch',
    'Parking',
    'Parents Accommodation',
    'Robe Return'
];