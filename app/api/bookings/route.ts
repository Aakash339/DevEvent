
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database/booking.model";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const { eventId, email } = await req.json();

        if (
            typeof eventId !== "string" ||
            !mongoose.Types.ObjectId.isValid(eventId) ||
            typeof email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            return NextResponse.json(
                { message: "Please provide a valid event ID and email." },
                { status: 400 }
            );
        }

        const booking = await Booking.create({
            eventId,
            email: email.trim().toLowerCase(),
        });

        return NextResponse.json(
            {
                message: "Booking completed successfully!",
                bookingId: booking._id.toString(),
            },
            { status: 201 }
        );
    } catch (error) {
        if (
            error instanceof mongoose.mongo.MongoServerError &&
            error.code === 11000
        ) {
            return NextResponse.json(
                { message: "You have already booked this event with this email." },
                { status: 409 }
            );
        }

        console.error("Booking error:", error);

        return NextResponse.json(
            { message: "Booking failed. Please try again." },
            { status: 500 }
        );
    }
}
