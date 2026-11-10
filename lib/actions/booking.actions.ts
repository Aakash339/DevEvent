
"use server";

import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database/booking.model";
import { Types } from "mongoose";

interface CreateBookingParams {
    eventId: string;
    email: string;
}

export async function createBooking({
                                        eventId,
                                        email,
                                    }: CreateBookingParams) {
    try {
        await connectToDatabase();

        if (!Types.ObjectId.isValid(eventId)) {
            throw new Error("Invalid event ID");
        }

        const booking = await Booking.create({
            eventId: new Types.ObjectId(eventId),
            email,
        });

        return {
            success: true,
            bookingId: booking._id.toString(),
        };
    } catch (error) {
        console.error("Booking creation failed:", error);

        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to create booking",
        };
    }
}
