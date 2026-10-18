import mongoose, { type HydratedDocument, type Model, Schema, Types } from "mongoose";
import { Event } from "./event.model";

export interface BookingFields {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

type BookingDocument = HydratedDocument<BookingFields>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<BookingFields>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [emailPattern, "Please provide a valid email address"],
    },
  },
  { timestamps: true },
);

bookingSchema.pre("save", async function (this: BookingDocument) {
  // Validate email here as well so the rule is enforced before every document save.
  if (!emailPattern.test(this.email)) {
    throw new Error("Please provide a valid email address");
  }

  // Check the referenced event at save time to prevent bookings for missing events.
  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error(`Event ${this.eventId.toString()} does not exist`);
  }
});

export const Booking: Model<BookingFields> =
  (mongoose.models.Booking as Model<BookingFields> | undefined) ??
  mongoose.model<BookingFields>("Booking", bookingSchema);
