
'use client';

import { useState } from "react";
import posthog from "posthog-js";
import { createBooking } from "@/lib/actions/booking.actions";

interface BookEventProps {
    eventId: string;
    slug: string;
}

const BookEvent = ({ eventId, slug }: BookEventProps) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        posthog.capture("booking_started");

        try {
            const result = await createBooking({ eventId, email });

            if (!result.success) {
                throw new Error(result.message);
            }

            posthog.capture("booking_completed");

            posthog.capture("event_booked", {
                eventId,
                slug,
            });

            setSubmitted(true);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Booking failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email address"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="button-submit"
                        disabled={loading}
                    >
                        {loading ? "Booking..." : "Submit"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BookEvent;
