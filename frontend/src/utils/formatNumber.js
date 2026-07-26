export function formatNumber(val, decimals = 2) {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatCurrency(val, decimals = 2) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return `₹${formatNumber(val, decimals)}`;
}
