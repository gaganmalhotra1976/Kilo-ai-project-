// Free Consultation Auto-Calculation Logic

// Calculate free consultations based on quote subtotal (before GST)
// Rules:
// - Below ₹3,000 → 1 free consultation (worth ₹500)
// - ₹3,000 to ₹3,999 → 3 free consultations  
// - ₹4,000 to ₹4,999 → 4 free consultations
// - ₹5,000 to ₹5,999 → 5 free consultations
// - Formula above ₹3,000: 3 + (every additional ₹1,000 = 1 more)
// - Maximum cap: 10 free consultations per quote

export function calculateFreeConsultations(subtotal: number): { count: number; value: number } {
  const CONSULTATION_VALUE = 500;
  const MAX_CONSULTATIONS = 10;
  
  let count = 0;
  
  if (subtotal < 3000) {
    count = 1;
  } else if (subtotal < 4000) {
    count = 3;
  } else if (subtotal < 5000) {
    count = 4;
  } else if (subtotal < 6000) {
    count = 5;
  } else {
    // Formula: 3 + (every additional ₹1,000 = 1 more)
    const additionalThousands = Math.floor((subtotal - 3000) / 1000);
    count = 3 + additionalThousands;
  }
  
  // Cap at maximum
  count = Math.min(count, MAX_CONSULTATIONS);
  
  return {
    count,
    value: count * CONSULTATION_VALUE
  };
}

// Format free consultations for display in quote
export function formatFreeConsultationsLineItem(count: number, value: number): object {
  return {
    vaccine: "Free Doctor Consultation",
    description: `Complimentary with this booking (${count} × ₹${500} each)`,
    qty: count,
    unitPrice: 0,
    totalValue: value,
    isFreeConsultation: true
  };
}

// Example usage:
// const { count, value } = calculateFreeConsultations(4500);
// console.log(`Free consultations: ${count}, Value: ₹${value}`);
// Output: Free consultations: 4, Value: ₹2000
