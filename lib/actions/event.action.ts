'use server';

import { Event, type EventFields } from '@/database/event.model';
import connectDB from "@/lib/mongodb";
export const getSimilarEventsBySlug = async (
    slug: string
): Promise<(EventFields & { _id: string })[]> => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug });

        if (!event) return [];

        const similarEvents = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags }
        }).lean();

        return JSON.parse(JSON.stringify(similarEvents));

    } catch {
        return [];
    }
}