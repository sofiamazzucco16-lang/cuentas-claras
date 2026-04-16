export interface Job {
    id: string;
    name: string;
    primaryRate: string;      // Tarifa principal por hora (ej: "17.00")
    secondaryRate: string;    // Tarifa secundaria opcional (ej: "14.00", dejar vacío si no aplica)
    federalTaxRate: string;   // % Impuesto federal (ej: "10"). Medicare y SS son fijos por ley.
}

export interface Shift {
    id: string;
    date: string;        // YYYY-MM-DD
    startTime: string;   // HH:mm
    endTime: string;     // HH:mm
    breakHours: number;
    totalHours: number;
    hourlyRate?: number; // Tarifa usada en este turno (si hubo múltiples tarifas)
    tips?: number;       // Propinas con tarjeta de crédito
    gratuity?: number;   // Service charge del restaurante
    notes?: string;
}

export interface PayDetails {
    totalHours: number;        // Total horas trabajadas
    regularPay: number;        // Horas × tarifa (sin overtime)
    gratuity: number;          // Service charge total del período
    tips: number;              // Propinas con tarjeta total del período
    grossPay: number;          // regularPay + gratuity + tips
    federalTax: number;        // Impuesto federal (% configurable)
    medicareTax: number;       // 1.45% fijo por ley
    socialSecurityTax: number; // 6.2% fijo por ley
    totalTaxes: number;        // federalTax + medicareTax + socialSecurityTax
    netPay: number;            // grossPay - totalTaxes
}

export interface ParsedShifts {
    jobId?: string;
    shifts: Shift[];
    summary: string;
    payDetails: PayDetails;
}

export interface ReviewData {
    jobId: string;
    shifts: Shift[];
    summary: string;
}
