export function convertAmountToWords(amount: number): string {
  if (!amount || isNaN(amount)) return "Zero Rupees Only";

  const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertBelowHundred(n: number): string {
    if (n < 10) return singleDigits[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    return `${tens[ten]} ${singleDigits[unit]}`.trim();
  }

  function convertBelowThousand(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = "";
    if (hundred > 0) {
      str += `${singleDigits[hundred]} Hundred `;
    }
    if (rest > 0) {
      str += convertBelowHundred(rest);
    }
    return str.trim();
  }

  let wholeAmount = Math.floor(amount);
  if (wholeAmount === 0) return "Zero Rupees Only";

  let crore = Math.floor(wholeAmount / 10000000);
  wholeAmount %= 10000000;

  let lakh = Math.floor(wholeAmount / 100000);
  wholeAmount %= 100000;

  let thousand = Math.floor(wholeAmount / 1000);
  let remainder = wholeAmount % 1000;

  let result = "";
  if (crore > 0) result += `${convertBelowHundred(crore)} Crore `;
  if (lakh > 0) result += `${convertBelowHundred(lakh)} Lakh `;
  if (thousand > 0) result += `${convertBelowHundred(thousand)} Thousand `;
  if (remainder > 0) result += `${convertBelowThousand(remainder)} `;

  return `Rupees ${result.trim()} Only`;
}
