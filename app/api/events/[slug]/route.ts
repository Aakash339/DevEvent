import { NextResponse } from "next/server";
import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// Event slugs use a lowercase alphanumeric title slug followed by the 24-char
// hexadecimal MongoDB document ID added by the Event model.
const EVENT_SLUG_PATTERN = /^(?:[a-z0-9]+-)*[a-z0-9]+-[a-f\d]{24}$/;

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;

    if (
      typeof slug !== "string" ||
      slug.trim().length === 0 ||
      slug !== slug.trim() ||
      !EVENT_SLUG_PATTERN.test(slug)
    ) {
      return NextResponse.json(
        { message: "A valid event slug is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const event = await Event.findOne({ slug });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Event fetching failed" },
      { status: 500 },
    );
  }
}
