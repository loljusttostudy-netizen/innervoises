import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function compileInvoiceHtml(invoice, profile, format = 'a4') {
    const validFormats = ['a4', 'a5', '80mm', '58mm'];
    const chosenFormat = validFormats.includes(format?.toLowerCase()) ? format.toLowerCase() : 'a4';

    let htmlTemplate = '';
    const formatTemplatePath = path.join(__dirname, `../templates/invoice-${chosenFormat}.html`);
    const templateId = invoice.templateId || profile?.templateId || 'classic';
    const classicTemplatePath = path.join(__dirname, `../templates/invoice-${templateId}.html`);

    if (profile?.customHtml && profile.customHtml.trim().length > 0 && chosenFormat === 'a4') {
        htmlTemplate = profile.customHtml;
    } else if (fs.existsSync(formatTemplatePath)) {
        htmlTemplate = fs.readFileSync(formatTemplatePath, 'utf8');
    } else if (fs.existsSync(classicTemplatePath)) {
        htmlTemplate = fs.readFileSync(classicTemplatePath, 'utf8');
    } else {
        const fallbackPath = path.join(__dirname, `../templates/invoice-classic.html`);
        if (fs.existsSync(fallbackPath)) {
            htmlTemplate = fs.readFileSync(fallbackPath, 'utf8');
        } else {
            htmlTemplate = `<div style="padding: 20px; font-family: sans-serif;"><h1>TAX INVOICE</h1><p>{{invoiceNo}}</p></div>`;
        }
    }

    // Convert any legacy {{else if ...}} syntax in htmlTemplate to {{else}}
    htmlTemplate = htmlTemplate.replace(/\{\{\s*else\s+if[\s\S]*?\}\}/gi, '{{else}}');

    const cleanField = (val) => {
        if (!val || val === '-' || val.trim() === '') return '';
        return val.trim();
    };

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

    const itemsFormatted = (invoice.items || []).map((item, index) => {
        totalQty += item.qty || 0;
        totalRate += item.rate || 0;

        const dec = item.rateDecimalPlaces ?? rateDecimals;
        return {
            ...item.toObject ? item.toObject() : item,
            qtyFormatted: formatNum(item.qty, qtyDecimals),
            rateFormatted: formatNum(item.rate, dec),
            amountFormatted: formatNum(item.amount, 2)
        };
    });

    const isIntraState = Boolean(invoice.isIntraState);
    const cgstVal = Number(invoice.cgst || 0);
    const sgstVal = Number(invoice.sgst || 0);
    const igstVal = Number(invoice.igst || 0);
    const hasCgstSgst = cgstVal > 0 || sgstVal > 0 || isIntraState;
    const hasIgst = igstVal > 0 || !isIntraState;

    const bankAccountNo = cleanField(profile?.accountNo);
    const bankIfsc = cleanField(profile?.ifsc);
    const showBankDetails = profile?.showBankDetails !== false && Boolean(bankAccountNo || bankIfsc);

    const data = {
        invoiceTitle: profile?.invoiceTitle || "TAX INVOICE",
        tableBorderStyle: profile?.tableBorderStyle || "box",
        primaryColor: profile?.primaryColor || "#2d241b",
        showHsn: profile?.showHsn !== false,
        showDescription: profile?.showDescription !== false,
        showBankDetails,
        showStamp: profile?.showStamp !== false && Boolean(profile?.stampUrl),
        showSignature: profile?.showSignature !== false && Boolean(profile?.signatureUrl),
        customCss: profile?.customCss || "",

        companyName: cleanField(profile?.companyName) || "InnerVoises Billing",
        address: cleanField(profile?.address),
        city: cleanField(profile?.city),
        state: cleanField(profile?.state),
        pincode: cleanField(profile?.pincode),
        phone: cleanField(profile?.phone),
        email: cleanField(profile?.email),
        gstin: cleanField(profile?.gstin),
        taglines: profile?.taglines || [],
        logoUrl: cleanField(profile?.logoUrl),
        stampUrl: cleanField(profile?.stampUrl),
        signatureUrl: cleanField(profile?.signatureUrl),

        bankAccountName: cleanField(profile?.accountName) || cleanField(profile?.companyName),
        bankName: cleanField(profile?.bankName),
        bankBranch: cleanField(profile?.bankBranch),
        bankAccountNo,
        bankIfsc,
        paymentTerms: cleanField(invoice.party?.paymentTerms) || cleanField(profile?.defaultPaymentTerms),
        packingDetails: cleanField(invoice.party?.packingDetails),
        footerText: cleanField(profile?.footerText),

        invoiceNo: invoice.invoiceNo,
        date: invoice.date,
        placeOfSupply: cleanField(invoice.placeOfSupply),
        eWayBillNo: cleanField(invoice.eWayBillNo),
        noOfCases: cleanField(invoice.noOfCases),
        transportName: cleanField(invoice.transportName),

        party: {
            name: cleanField(invoice.party?.name),
            gstin: cleanField(invoice.party?.gstin),
            billingAddress: cleanField(invoice.party?.billingAddress),
            shippingAddress: cleanField(invoice.party?.shippingAddress)
        },

        items: itemsFormatted,
        totalQtyFormatted: formatNum(totalQty, qtyDecimals),
        totalRateFormatted: formatNum(totalRate, rateDecimals),
        subtotalFormatted: formatNum(invoice.subtotal, 2),
        isIntraState,
        hasCgstSgst,
        hasIgst,
        halvedGstPct: (invoice.items && invoice.items[0]?.gst) ? (invoice.items[0].gst / 2) : 9,
        cgstFormatted: formatNum(cgstVal, 2),
        sgstFormatted: formatNum(sgstVal, 2),
        igstFormatted: formatNum(igstVal, 2),
        roundOffFormatted: (invoice.roundOff && invoice.roundOff !== 0) ? invoice.roundOff.toFixed(2) : "",
        totalFormatted: formatNum(invoice.total, 2),
        totalInWords: invoice.totalInWords || ""
    };

    let html = htmlTemplate;

    if (data.customCss) {
        html = html.replace('</head>', `<style>${data.customCss}</style></head>`);
    }

    // Helper: resolve a key like "party.gstin" or "isIntraState" from data
    const resolveKey = (key) => {
        if (key.includes('.')) {
            const parts = key.split('.');
            let val = data;
            for (const p of parts) {
                if (val == null) return undefined;
                val = val[p];
            }
            return val;
        }
        return data[key];
    };

    const isTruthy = (val) => {
        if (val === undefined || val === null) return false;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val !== 0;
        if (typeof val === 'string') return val.trim() !== '' && val !== '-' && val !== '0.00';
        if (Array.isArray(val)) return val.length > 0;
        return Boolean(val);
    };

    // Taglines Loop
    const taglineRegex = /\{\{#each taglines\}\}([\s\S]*?)\{\{\/each\}\}/g;
    html = html.replace(taglineRegex, (_, inner) => {
        return data.taglines.map(tag => inner.replace(/\{\{this\}\}/g, tag)).join('');
    });

    // Items Loop
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
            row = row.replace(/\{\{gst\}\}/g, item.gst || 18);
            row = row.replace(/\{\{amountFormatted\}\}/g, item.amountFormatted);
            return row;
        }).join('');
    });

    // Process all {{#if}}, {{else}}, {{/if}} and {{#unless}}/{{/unless}} blocks
    // by finding matching pairs from innermost out (handles nesting)
    const processConditionals = (text) => {
        let result = text;
        let changed = true;
        let iterations = 0;
        const MAX_ITER = 50;

        while (changed && iterations < MAX_ITER) {
            changed = false;
            iterations++;

            // Process innermost {{#if key}}...{{else}}...{{/if}} (no nested #if inside)
            result = result.replace(
                /\{\{#if\s+([\w.]+)\}\}((?:(?!\{\{#if\s)[\s\S])*?)\{\{else\}\}((?:(?!\{\{#if\s)[\s\S])*?)\{\{\/if\}\}/,
                (_, key, trueBlock, falseBlock) => {
                    changed = true;
                    const val = resolveKey(key);
                    return isTruthy(val) ? trueBlock : falseBlock;
                }
            );

            // Process innermost {{#if key}}...{{/if}} (no else, no nested #if inside)
            result = result.replace(
                /\{\{#if\s+([\w.]+)\}\}((?:(?!\{\{#if\s)[\s\S])*?)\{\{\/if\}\}/,
                (_, key, block) => {
                    changed = true;
                    const val = resolveKey(key);
                    return isTruthy(val) ? block : '';
                }
            );

            // Process innermost {{#unless key}}...{{/unless}}
            result = result.replace(
                /\{\{#unless\s+([\w.]+)\}\}((?:(?!\{\{#unless\s)[\s\S])*?)\{\{\/unless\}\}/,
                (_, key, block) => {
                    changed = true;
                    const val = resolveKey(key);
                    return !isTruthy(val) ? block : '';
                }
            );
        }

        return result;
    };

    html = processConditionals(html);

    // Replace all simple variables {{varName}} and {{party.varName}}
    Object.keys(data).forEach(key => {
        if (typeof data[key] !== 'object') {
            const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            html = html.replace(re, data[key] !== undefined && data[key] !== null ? String(data[key]) : '');
        }
    });

    if (data.party) {
        Object.keys(data.party).forEach(key => {
            const re = new RegExp(`\\{\\{party\\.${key}\\}\\}`, 'g');
            html = html.replace(re, data.party[key] || '');
        });
    }

    return html;
}

export async function generateInvoicePdf(invoice, profile, format = 'a4') {
    const html = compileInvoiceHtml(invoice, profile, format);

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage'
            ]
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const isThermal = ['80mm', '58mm'].includes(format.toLowerCase());
        const pdfOptions = isThermal
            ? {
                width: format.toLowerCase() === '58mm' ? '58mm' : '80mm',
                margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
                printBackground: true
            }
            : {
                format: format.toUpperCase() === 'A5' ? 'A5' : 'A4',
                margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
                printBackground: true
            };

        const pdfBuffer = await page.pdf(pdfOptions);
        await browser.close();
        return { isBuffer: true, data: pdfBuffer };
    } catch (err) {
        console.error('Puppeteer PDF Generation failed:', err);
        return { isBuffer: false, data: html };
    }
}
