
import mongoose, { type HydratedDocument, type Model, Schema } from "mongoose";

export interface EventFields {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type EventDocument = HydratedDocument<EventFields>;

/** Validates an event date and returns it in YYYY-MM-DD format. */
function normalizeDate(value: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const parsed = dateOnly
      ? new Date(
          Date.UTC(
              Number(dateOnly[1]),
              Number(dateOnly[2]) - 1,
              Number(dateOnly[3]),
          ),
      )
      : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Event date must be a valid date");
  }

  // Keep date-only input stable and store every accepted date as YYYY-MM-DD.
  const isoDate = parsed.toISOString().slice(0, 10);

  if (dateOnly && isoDate !== value.trim()) {
    throw new Error("Event date must be a valid date");
  }

  return isoDate;
}

/** Validates an event time and returns it in 24-hour HH:mm format. */
function normalizeTime(value: string): string {
  const time = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(value.trim());

  if (!time) {
    throw new Error("Event time must use HH:mm or h:mm AM/PM format");
  }

  let hours = Number(time[1]);
  const minutes = Number(time[2]);
  const meridiem = time[3]?.toUpperCase();

  if (
      minutes > 59 ||
      (meridiem ? hours < 1 || hours > 12 : hours > 23)
  ) {
    throw new Error("Event time must be a valid time");
  }

  if (meridiem) {
    hours = (hours % 12) + (meridiem === "PM" ? 12 : 0);
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

const eventSchema = new Schema<EventFields>(
    {
      title: { type: String, required: true, trim: true },
      slug: { type: String, required: true, unique: true, trim: true },
      description: { type: String, required: true, trim: true },
      overview: { type: String, required: true, trim: true },
      image: { type: String, required: true, trim: true },
      venue: { type: String, required: true, trim: true },
      location: { type: String, required: true, trim: true },
      date: { type: String, required: true, trim: true },
      time: { type: String, required: true, trim: true },
      mode: { type: String, required: true, trim: true },
      audience: { type: String, required: true, trim: true },
      agenda: {
        type: [String],
        required: true,
        validate: {
          validator: (items: string[]) => items.length > 0,
          message: "Agenda cannot be empty",
        },
      },
      organizer: { type: String, required: true, trim: true },
      tags: {
        type: [String],
        required: true,
        validate: {
          validator: (items: string[]) => items.length > 0,
          message: "Tags cannot be empty",
        },
      },
    },
    { timestamps: true },
);

eventSchema.index({ slug: 1 }, { unique: true });

const eventWriteOperations: Array<
  "updateOne" | "updateMany" | "findOneAndUpdate" | "replaceOne" | "findOneAndReplace"
> = [
  "updateOne",
  "updateMany",
  "findOneAndUpdate",
  "replaceOne",
  "findOneAndReplace",
];

/** Blocks write methods that bypass event validation, normalization, and slug hooks. */
function requireEventSavePath(): never {
  throw new Error("Load the event and save it to preserve event invariants");
}

eventSchema.pre(eventWriteOperations, requireEventSavePath);
eventSchema.pre("insertMany", requireEventSavePath);
eventSchema.pre("bulkWrite", requireEventSavePath);

/** Prevents deleting events while bookings may still reference them. */
function preventEventDeletion(): never {
  throw new Error("Event deletion is disabled to protect booking references");
}

eventSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], preventEventDeletion);
eventSchema.pre("deleteOne", { document: true, query: false }, preventEventDeletion);

eventSchema.pre(
  "validate",
  /** Generates a unique slug before event validation when needed. */
  function (this: EventDocument) {
  // Let required-field validation handle missing titles.
  if (!this.title) return;

  // Generate the slug before validation, only for new or renamed events.
  if (this.isNew || this.isModified("title")) {
    const baseSlug = this.title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // Append the document ID to prevent collisions and support non-Latin titles.
    this.slug = `${baseSlug || "event"}-${this._id.toString()}`;
  }
  },
);

eventSchema.pre(
  "save",
  /** Validates required event text and normalizes its date and time. */
  function (this: EventDocument) {
  // Trim required text fields so whitespace-only values fail validation.
  const requiredFields: Array<
      | "title"
      | "description"
      | "overview"
      | "image"
      | "venue"
      | "location"
      | "date"
      | "time"
      | "mode"
      | "audience"
      | "organizer"
  > = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];

  for (const field of requiredFields) {
    if (!this[field].trim()) {
      throw new Error(`Event ${field} is required`);
    }
  }

  if (this.agenda.length === 0 || this.agenda.some((item) => !item.trim())) {
    throw new Error("Event agenda must contain non-empty items");
  }

  if (this.tags.length === 0 || this.tags.some((tag) => !tag.trim())) {
    throw new Error("Event tags must contain non-empty items");
  }

  // Store dates and times in predictable, sortable formats.
  this.date = normalizeDate(this.date);
  this.time = normalizeTime(this.time);
  },
);

export const Event: Model<EventFields> =
    (mongoose.models.Event as Model<EventFields> | undefined) ??
    mongoose.model<EventFields>("Event", eventSchema);
