/**
 * Universal Sequential Identifier Framework
 * Crayon Box School Web ERP
 *
 * Implements Pillar 1 of the Enterprise Dynamic Architecture.
 * Eliminates static mock IDs (e.g. APP-2026-0001, TKT-101) with standardized, dynamic sequence formatters.
 */

/**
 * Formats a standardized sequential identifier: PREFIX-YEAR-SEQUENCE
 */
export function formatSequentialId(
  prefix: string,
  year: number | string = new Date().getFullYear(),
  sequenceNumber: number,
  padding: number = 4
): string {
  const seq = String(sequenceNumber).padStart(padding, "0");
  return `${prefix}-${year}-${seq}`;
}

export function formatApplicationId(sequenceNumber: number, year: number | string = new Date().getFullYear()): string {
  return formatSequentialId("APP", year, sequenceNumber, 4);
}

export function formatAdmissionNumber(sequenceNumber: number, year: number | string = new Date().getFullYear()): string {
  return formatSequentialId("ADM", year, sequenceNumber, 4);
}

export function formatInvoiceNumber(sequenceNumber: number, year: number | string = new Date().getFullYear()): string {
  return formatSequentialId("INV", year, sequenceNumber, 4);
}

export function formatReceiptNumber(sequenceNumber: number, year: number | string = new Date().getFullYear()): string {
  return formatSequentialId("REC", year, sequenceNumber, 4);
}

export function formatTransferCertificateNumber(
  institutionCode: string = "CBL",
  sequenceNumber: number,
  year: number | string = new Date().getFullYear()
): string {
  const seq = String(sequenceNumber).padStart(4, "0");
  return `TC/${institutionCode}/${year}/${seq}`;
}

export function formatTicketNumber(sequenceNumber: number, year: number | string = new Date().getFullYear()): string {
  return formatSequentialId("TKT", year, sequenceNumber, 4);
}

export function formatPurchaseOrderNumber(sequenceNumber: number, year: number | string = new Date().getFullYear()): string {
  return formatSequentialId("PO", year, sequenceNumber, 4);
}

export function formatVisitorPassNumber(sequenceNumber: number, year: number | string = new Date().getFullYear()): string {
  return formatSequentialId("VIS", year, sequenceNumber, 4);
}

export function formatSurveyNumber(sequenceNumber: number, year: number | string = new Date().getFullYear()): string {
  return formatSequentialId("SURV", year, sequenceNumber, 4);
}
