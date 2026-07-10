import { z } from "zod";

const ErrorResponseBase = z.object({
  status: z.number(),
  message: z.string()
});

export const ErrorResponseSchema = z.discriminatedUnion("error_type", [
  ErrorResponseBase.extend({ error_type: z.literal("unknown") }),
  ErrorResponseBase.extend({ error_type: z.literal("unauthenticated") }),
  ErrorResponseBase.extend({ error_type: z.literal("unauthorized") }),
  ErrorResponseBase.extend({ error_type: z.literal("method_not_allowed") }),
  ErrorResponseBase.extend({ error_type: z.literal("server_error") }),
  ErrorResponseBase.extend({ error_type: z.literal("service_unavailable") }),
  ErrorResponseBase.extend({ error_type: z.literal("not_found") }),
  ErrorResponseBase.extend({ error_type: z.literal("conflict") }),
  ErrorResponseBase.extend({ error_type: z.literal("bad_request") }),
  ErrorResponseBase.extend({ error_type: z.literal("too_many_requests") }),
  ErrorResponseBase.extend({
    error_type: z.literal("validation"),
    fieldErrors: z.record(z.string(), z.array(z.string())),
    formErrors: z.array(z.string())
  })
]);

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
