
// const { z } = require("zod");

// const CLASSIFICATIONS = [
//   "ASSISTANT",
//   "CLIENT",
//   "NO_REPLY",
//   "REVIEW",
// ];

// const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

// // Validate an extracted date.
// const extractedDateSchema = z.object({
//   label: z.string(),
//   dateTime: z.string().refine(
//     (value) => Number.isFinite(Date.parse(value)),
//     { message: "Invalid dateTime value" }
//   ),
//   timezone: z.string(),
// }).strict();

// // Validate the complete Gemini response.
// const aiResponseSchema = z.object({
//   classification: z.enum(CLASSIFICATIONS),

//   confidence: z.number()
//     .finite()
//     .min(0)
//     .max(1),

//   summary: z.string(),
//   clientSummary: z.string(),
//   reason: z.string(),

//   actionRequired: z.boolean(),

//   priority: z.enum(PRIORITIES),

//   category: z.string(),
//   suggestedAction: z.string(),

//   waitingForResponse: z.boolean(),

//   extractedDates: z.array(extractedDateSchema).default([]),
// }).strict();

// // Safely validate and normalize the response.
// const validateAIResponse = (response) => {
//   const result = aiResponseSchema.safeParse(response);

//   if (!result.success) {
//     return {
//       success: false,
//       data: null,
//       errors: result.error.issues.map((issue) => ({
//         field: issue.path.join("."),
//         message: issue.message,
//       })),
//     };
//   }

//   return {
//     success: true,
//     data: result.data,
//     errors: [],
//   };
// };

// module.exports = {
//   validateAIResponse,
//   aiResponseSchema,
// };



const { z } = require("zod");

const CLASSIFICATIONS = [
  "ASSISTANT",
  "CLIENT",
  "NO_REPLY",
  "REVIEW",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

// Validate that a timezone is a real IANA timezone.
const isValidTimezone = (timezone) => {
  if (timezone === "") return true;

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    });

    return true;
  } catch {
    return false;
  }
};

// Require ISO date-time with an explicit timezone.
// Examples:
// 2026-11-20T14:30:00Z
// 2026-11-20T14:30:00+05:30
const isValidISODateTime = (value) => {
  const isoPattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  if (!isoPattern.test(value)) {
    return false;
  }

  return Number.isFinite(Date.parse(value));
};

// Validate an extracted date.
const extractedDateSchema = z.object({
  label: z.string().trim().min(1).max(200),

  dateTime: z.string().refine(
    isValidISODateTime,
    {
      message:
        "Date must be a valid ISO date-time with an explicit timezone",
    }
  ),

  timezone: z.string().refine(
    isValidTimezone,
    {
      message: "Invalid timezone. Use a valid IANA timezone or an empty string.",
    }
  ),
}).strict();

// Validate the complete Gemini response.
const aiResponseSchema = z.object({
  classification: z.enum(CLASSIFICATIONS),

  confidence: z.number()
    .finite()
    .min(0)
    .max(1),

  summary: z.string(),
  clientSummary: z.string(),
  reason: z.string(),

  actionRequired: z.boolean(),

  priority: z.enum(PRIORITIES),

  category: z.string(),
  suggestedAction: z.string(),

  waitingForResponse: z.boolean(),

  extractedDates: z.array(extractedDateSchema)
    .max(20)
    .default([]),
}).strict();

// Safely validate and normalize the response.
const validateAIResponse = (response) => {
  const result = aiResponseSchema.safeParse(response);

  if (!result.success) {
    return {
      success: false,
      data: null,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  return {
    success: true,
    data: result.data,
    errors: [],
  };
};

module.exports = {
  validateAIResponse,
  aiResponseSchema,
};
