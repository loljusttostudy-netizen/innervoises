function numberToWordsIndian(num) {
    if (num === null || num === undefined || isNaN(num)) return "";

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function inWords(n) {
        if (n < 20) return a[n];
        const digit = n % 10;
        return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
    }

    function convert(n) {
        if (n === 0) return "";
        let str = "";

        if (Math.floor(n / 10000000) > 0) {
            str += convert(Math.floor(n / 10000000)) + " Crore ";
            n %= 10000000;
        }
        if (Math.floor(n / 100000) > 0) {
            str += convert(Math.floor(n / 100000)) + " Lakh ";
            n %= 100000;
        }
        if (Math.floor(n / 1000) > 0) {
            str += convert(Math.floor(n / 1000)) + " Thousand ";
            n %= 1000;
        }
        if (Math.floor(n / 100) > 0) {
            str += convert(Math.floor(n / 100)) + " Hundred ";
            n %= 100;
        }
        if (n > 0) {
            str += inWords(n) + " ";
        }
        return str;
    }

    const rounded = Math.round(num * 100) / 100;
    const integerPart = Math.floor(rounded);
    const decimalPart = Math.round((rounded - integerPart) * 100);

    let words = integerPart === 0 ? "Zero" : convert(integerPart).trim();
    words += " Rupees";

    if (decimalPart > 0) {
        words += " and " + inWords(decimalPart).trim() + " Paise";
    }

    return words + " Only";
}

export { numberToWordsIndian };
