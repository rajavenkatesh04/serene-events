// File: app/e/[id]/guide/page.tsx
import { eventLocations } from './locations';
import LocationAccordion from './LocationAccordion';
import { Location } from './locations';

export default function GuidePage() {
    // Group locations by category
    const locationsByCategory = eventLocations.reduce((acc, location) => {
        const category = location.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(location);
        return acc;
    }, {} as Record<string, Location[]>);

    return (
        <div>
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">Event Guide</h2>
                <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                    Find key locations for the convocation ceremony.
                </p>
            </div>
            <LocationAccordion locationsByCategory={locationsByCategory} />
        </div>
    );
}