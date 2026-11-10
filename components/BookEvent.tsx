
'use client';

import { useState } from 'react';
import posthog from 'posthog-js';

interface BookEventProps {
    eventId: string;
    slug: string;
}

const BookEvent = ({ eventId, slug }: BookEventProps) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Track booking attempt
        posthog.capture('booking_started', {
            event_id: eventId,
            event_slug: slug,
        });

        // Simulate booking submission
        setTimeout(() => {
            posthog.capture('booking_completed', {
                event_id: eventId,
                event_slug: slug,
            });

            setSubmitted(true);
        }, 1000);
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

                    <button type="submit" className="button-submit">
                        Submit
                    </button>
                </form>
            )}
        </div>
    );
};

export default BookEvent;
