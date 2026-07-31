/**
 * Utility to generate auto-incremented Voucher Numbers
 * Format: VOU-YYYY-XXXX (e.g. VOU-2026-0001)
 */
const generateVoucherNumber = (sequenceNumber) => {
  const currentYear = new Date().getFullYear();
  const paddedSequence = String(sequenceNumber).padStart(4, '0');
  return `VOU-${currentYear}-${paddedSequence}`;
};

module.exports = {
  generateVoucherNumber
};
