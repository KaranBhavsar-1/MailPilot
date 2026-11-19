
const {
  validateAIResponse,
} = require("./src/validators/validateAIResponse");

const baseResponse = {
  classification: "ASSISTANT",
  confidence: 0.95,
  summary: "Meeting discussion.",
  clientSummary: "A meeting needs to be scheduled.",
  reason: "The conversation contains scheduling information.",
  actionRequired: true,
  priority: "MEDIUM",
  category: "Scheduling",
  suggestedAction: "Confirm the meeting.",
  waitingForResponse: false,
  extractedDates: [],
};

const tests = [
  {
    name: "Valid date with UTC",
    date: {
      label: "Project meeting",
      dateTime: "2026-11-20T14:30:00Z",
      timezone: "UTC",
    },
    expected: true,
  },
  {
    name: "Valid date with India timezone offset",
    date: {
      label: "Client meeting",
      dateTime: "2026-11-20T14:30:00+05:30",
      timezone: "Asia/Kolkata",
    },
    expected: true,
  },
  {
    name: "Invalid date",
    date: {
      label: "Meeting",
      dateTime: "not-a-date",
      timezone: "Asia/Kolkata",
    },
    expected: false,
  },
  {
    name: "Missing timezone offset",
    date: {
      label: "Meeting",
      dateTime: "2026-11-20T14:30:00",
      timezone: "Asia/Kolkata",
    },
    expected: false,
  },
  {
    name: "Invalid timezone",
    date: {
      label: "Meeting",
      dateTime: "2026-11-20T14:30:00Z",
      timezone: "Invalid/Timezone",
    },
    expected: false,
  },
];

tests.forEach((test) => {
  const result = validateAIResponse({
    ...baseResponse,
    extractedDates: [test.date],
  });

  const passed = result.success === test.expected;

  console.log(
    `${passed ? "PASS" : "FAIL"}: ${test.name}`
  );

  if (!passed) {
    console.log(result.errors);
  }
});
