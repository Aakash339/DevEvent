
'use client';

import { useState, type FormEvent } from 'react';
import posthog from 'posthog-js';

interface BookEventProps {
    eventId: string;
    slug: string;
}

const BookEvent = ({ eventId, slug }: BookEventProps) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        posthog.capture('booking_started', {
            event_id: eventId,
            event_slug: slug,
        });

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventId, email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Booking failed.');
            }

            posthog.capture('booking_completed', {
                event_id: eventId,
                event_slug: slug,
            });

            setSubmitted(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong. Please try again.'
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
                        {loading ? 'Booking...' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BookEvent;
