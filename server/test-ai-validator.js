
const { validateAIResponse } = require("./src/validators/validateAIResponse");

const validResponse = {
  classification: "CLIENT",
  confidence: 0.94,
  summary: "The sender requests budget approval.",
  clientSummary: "Please review and approve the budget.",
  reason: "The client must make the financial decision.",
  actionRequired: true,
  priority: "HIGH",
  category: "Approval",
  suggestedAction: "Review and approve or decline the budget.",
  waitingForResponse: false,
  extractedDates: [],
};

const invalidResponse = {
  ...validResponse,
  classification: "NO-REPLY",
  confidence: 1.5,
};

console.log("VALID RESPONSE:");
console.log(validateAIResponse(validResponse));

console.log("\nINVALID RESPONSE:");
console.log(validateAIResponse(invalidResponse));
