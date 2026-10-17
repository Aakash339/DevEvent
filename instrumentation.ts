import { createOnRequestError } from "@posthog/next";

export const onRequestError = createOnRequestError({
  apiKey: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});
