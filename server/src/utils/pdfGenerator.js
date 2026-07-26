import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateInvoicePdf(invoice, profile) {
    const templateId = invoice.templateId || profile?.templateId || 'classic';
    const templatePath = path.join(__dirname, `../templates/invoice-${templateId}.html`);

    let htmlTemplate = '';
    if (profile?.customHtml && profile.customHtml.trim().length > 0) {
        htmlTemplate = profile.customHtml;
    } else if (fs.existsSync(templatePath)) {
        htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    } else {
        const fallbackPath = path.join(__dirname, `../templates/invoice-classic.html`);
        htmlTemplate = fs.readFileSync(fallbackPath, 'utf8');
    }

    const rateDecimals = profile?.rateDecimalPlaces ?? 2;
    const qtyDecimals = profile?.qtyDecimalPlaces ?? 2;

    const formatNum = (val, decimals) => {
        if (val === undefined || val === null || isNaN(val)) return '0.00';
        return Number(val).toLocaleString('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    let totalQty = 0;
    let totalRate = 0;

    const itemsFormatted = invoice.items.map((item, index) => {
        totalQty += item.qty;
        totalRate += item.rate;

        const dec = item.rateDecimalPlaces ?? rateDecimals;
        return {
            ...item.toObject ? item.toObject() : item,
            qtyFormatted: formatNum(item.qty, qtyDecimals),
            rateFormatted: formatNum(item.rate, dec),
            amountFormatted: formatNum(item.amount, 2)
        };
    });

    const isIntraState = invoice.isIntraState;

    const data = {
        invoiceTitle: profile?.invoiceTitle || "TAX INVOICE",
        tableBorderStyle: profile?.tableBorderStyle || "box",
        primaryColor: profile?.primaryColor || "#2d241b",
        showHsn: profile?.showHsn !== false,
        showDescription: profile?.showDescription !== false,
        showBankDetails: profile?.showBankDetails !== false,
        showStamp: profile?.showStamp !== false,
        showSignature: profile?.showSignature !== false,
        customCss: profile?.customCss || "",

        companyName: profile?.companyName || "",
        address: profile?.address || "",
        city: profile?.city || "",
        state: profile?.state || "",
        pincode: profile?.pincode || "",
        phone: profile?.phone || "",
        email: profile?.email || "",
        gstin: profile?.gstin || "",
        taglines: profile?.taglines || [],
        logoUrl: profile?.logoUrl || "",
        stampUrl: profile?.stampUrl || "",
        signatureUrl: profile?.signatureUrl || "",

        bankAccountName: profile?.accountName || profile?.companyName || "",
        bankName: profile?.bankName || "",
        bankBranch: profile?.bankBranch || "",
        bankAccountNo: profile?.accountNo || "",
        bankIfsc: profile?.ifsc || "",
        paymentTerms: invoice.party?.paymentTerms || profile?.defaultPaymentTerms || "30 Days from date of issue",
        packingDetails: invoice.party?.packingDetails || "",
        footerText: profile?.footerText || "This is a computer generated invoice",

        invoiceNo: invoice.invoiceNo,
        date: invoice.date,
        placeOfSupply: invoice.placeOfSupply,
        eWayBillNo: invoice.eWayBillNo || "-",
        noOfCases: invoice.noOfCases || "-",
        transportName: invoice.transportName || "-",

        party: {
            name: invoice.party?.name || "",
            gstin: invoice.party?.gstin || "",
            billingAddress: invoice.party?.billingAddress || "",
            shippingAddress: invoice.party?.shippingAddress || "Same as billing address"
        },

        items: itemsFormatted,
        totalQtyFormatted: formatNum(totalQty, qtyDecimals),
        totalRateFormatted: formatNum(totalRate, rateDecimals),
        subtotalFormatted: formatNum(invoice.subtotal, 2),
        isIntraState,
        halvedGstPct: invoice.items[0]?.gst ? (invoice.items[0].gst / 2) : 9,
        cgstFormatted: formatNum(invoice.cgst, 2),
        sgstFormatted: formatNum(invoice.sgst, 2),
        igstFormatted: formatNum(invoice.igst, 2),
        roundOffFormatted: (invoice.roundOff || 0).toFixed(2),
        totalFormatted: formatNum(invoice.total, 2),
        totalInWords: invoice.totalInWords
    };

    // Render Handlebars style tags
    let html = htmlTemplate;

    // Inject custom CSS if defined
    if (data.customCss) {
        html = html.replace('</head>', `<style>${data.customCss}</style></head>`);
    }

    // Handle taglines loop
    const taglineRegex = /\{\{#each taglines\}\}([\s\S]*?)\{\{\/each\}\}/g;
    html = html.replace(taglineRegex, (_, inner) => {
        return data.taglines.map(tag => inner.replace(/\{\{this\}\}/g, tag)).join('');
    });

    // Handle items loop
    const itemsRegex = /\{\{#each items\}\}([\s\S]*?)\{\{\/each\}\}/g;
    html = html.replace(itemsRegex, (_, inner) => {
        return data.items.map((item, index) => {
            let row = inner;
            row = row.replace(/\{\{addOne @index\}\}/g, index + 1);
            row = row.replace(/\{\{name\}\}/g, item.name || '');
            row = row.replace(/\{\{description\}\}/g, item.description || '-');
            row = row.replace(/\{\{hsn\}\}/g, item.hsn || '');
            row = row.replace(/\{\{qtyFormatted\}\}/g, item.qtyFormatted);
            row = row.replace(/\{\{unit\}\}/g, item.unit || 'NOS');
            row = row.replace(/\{\{rateFormatted\}\}/g, item.rateFormatted);
            row = row.replace(/\{\{gst\}\}/g, item.gst);
            row = row.replace(/\{\{amountFormatted\}\}/g, item.amountFormatted);
            return row;
        }).join('');
    });

    // Handle {{#if isIntraState}} ... {{else}} ... {{/if}}
    const ifIntraRegex = /\{\{#if isIntraState\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
    html = html.replace(ifIntraRegex, (_, trueBlock, falseBlock) => {
        return isIntraState ? trueBlock : falseBlock;
    });

    // Handle simple {{#if key}} ... {{/if}}
    const simpleIfRegex = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    html = html.replace(simpleIfRegex, (_, key, block) => {
        return data[key] ? block : '';
    });

    // Replace all simple variables {{varName}} and {{party.varName}}
    Object.keys(data).forEach(key => {
        if (typeof data[key] !== 'object') {
            const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            html = html.replace(re, data[key] || '');
        }
    });

    if (data.party) {
        Object.keys(data.party).forEach(key => {
            const re = new RegExp(`\\{\\{party\\.${key}\\}\\}`, 'g');
            html = html.replace(re, data.party[key] || '');
        });
    }

    // Launch puppeteer to generate PDF
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
        },
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
}
