// components/ai/localResponder.ts
// A tiny, safe, rule-based "assistant" while you have no backend LLM.

export function localRespond(userText: string): string {
  const t = userText.trim().toLowerCase();

  // Basic intent heuristics
  if (!t) return "Could you repeat that?";

  const urgent = /(chest pain|severe bleeding|shortness of breath|unconscious|stroke)/i.test(userText);
  if (urgent) {
    return "This sounds potentially urgent. Please contact emergency services or a clinician immediately.";
  }

  if (/(fever|temperature|cold|cough|flu)/i.test(t)) {
    return "For fever/cold-like symptoms, hydrate, rest, and monitor your temperature. If symptoms persist, worsen, or you have risk factors, consult a clinician.";
  }

  if (/(blood test|cbc|report|lab)/i.test(t)) {
    return "For lab reports, look at reference ranges and trends. I can help you prepare questions for your clinician, but I cannot diagnose.";
  }

  if (/(medicine|dose|prescription|drug)/i.test(t)) {
    return "Medication questions are best confirmed with your clinician or pharmacist. I can provide general education, but I do not prescribe.";
  }

  if (/(diet|nutrition|food|exercise|lifestyle)/i.test(t)) {
    return "Balanced nutrition, adequate sleep, and regular activity usually help. Personalized advice should come from your clinician or dietitian.";
  }

  // Default safe reply
  return "I can provide general health education. For diagnosis or prescriptions, please see a clinician. Tell me more about your symptoms or context.";
}
