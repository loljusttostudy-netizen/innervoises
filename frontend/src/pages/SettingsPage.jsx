import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { 
  Trash2, 
  CheckCircle2, 
  Image as ImageIcon, 
  Type, 
  Bold as BoldIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Palette, 
  Box, 
  RefreshCw, 
  Save, 
  Eye,
  Sliders
} from 'lucide-react';
import api from '../context/api.js';
import toast from 'react-hot-toast';

const TABS = ["Company Profile", "Invoice Canvas Designer", "Invoice Defaults", "Bank Details", "Number Formatting"];
const STATES = ["Uttar Pradesh", "Tamil Nadu", "Delhi", "Maharashtra", "Rajasthan", "Bihar", "Gujarat", "Haryana"];

const DEFAULT_CANVA_TEMPLATE = `
<div id="invoice-document" style="padding: 25px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; background: #ffffff; color: #2d241b; line-height: 1.3;">
  <!-- HEADER -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2d241b; padding-bottom: 8px; margin-bottom: 12px;">
    <div style="width: 120px; text-align: center;">
      {{#if logoUrl}}<img src="{{logoUrl}}" style="max-width: 100px; max-height: 70px;" />{{else}}<div contenteditable="true" style="font-weight: bold; font-size: 16px;">{{companyName}}</div>{{/if}}
    </div>
    <div style="text-align: center; flex: 1; padding: 0 10px;">
      <h1 contenteditable="true" style="font-size: 20px; font-weight: bold; margin-bottom: 3px; color: #2d241b;">{{companyName}}</h1>
      <p contenteditable="true" style="font-size: 10.5px; margin-bottom: 2px;">{{address}}, {{city}}, {{state}} {{pincode}}</p>
      <p contenteditable="true" style="font-size: 10.5px; margin-bottom: 2px;">Phone: {{phone}} | Email: {{email}}</p>
      {{#each taglines}}<p contenteditable="true" style="font-weight: 500;">{{this}}</p>{{/each}}
      <p contenteditable="true" style="font-weight: bold; margin-top: 2px;">GSTIN: {{gstin}}</p>
    </div>
    <div contenteditable="true" style="font-size: 22px; font-weight: bold; text-align: right; width: 130px; color: #2d241b;">
      TAX INVOICE
    </div>
  </div>

  <!-- META TABLE -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px;">
    <tr>
      <td style="width: 50%; padding: 4px 6px;"><strong>Invoice Number :</strong> <span contenteditable="true">{{invoiceNo}}</span></td>
      <td style="width: 50%; padding: 4px 6px; text-align: right;"><strong>Invoice Date :</strong> <span contenteditable="true">{{date}}</span></td>
    </tr>
    <tr>
      <td style="padding: 4px 6px;"><strong>Place of Supply :</strong> <span contenteditable="true">{{placeOfSupply}}</span></td>
      <td style="padding: 4px 6px; text-align: right;"><strong>Transport :</strong> <span contenteditable="true">{{transportName}}</span></td>
    </tr>
  </table>

  <!-- ADDRESSES BOX -->
  <div style="display: flex; border: 1.5px solid #2d241b; margin-bottom: 12px;">
    <div style="flex: 1; padding: 8px; border-right: 1.5px solid #2d241b;">
      <h4 contenteditable="true" style="font-size: 11px; font-weight: bold; margin-bottom: 4px; uppercase;">Bill To</h4>
      <p contenteditable="true"><strong>{{party.name}}</strong></p>
      <p contenteditable="true"><strong>GSTIN : {{party.gstin}}</strong></p>
      <p contenteditable="true">{{party.billingAddress}}</p>
    </div>
    <div style="flex: 1; padding: 8px;">
      <h4 contenteditable="true" style="font-size: 11px; font-weight: bold; margin-bottom: 4px; uppercase;">Ship To</h4>
      <p contenteditable="true">{{party.shippingAddress}}</p>
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10.5px;">
    <thead>
      <tr style="border-top: 1.5px solid #2d241b; border-bottom: 1.5px solid #2d241b; background-color: #f7f7fc;">
        <th style="padding: 6px 4px; text-align: center; font-weight: bold; width: 5%;">#</th>
        <th style="padding: 6px 4px; text-align: left; font-weight: bold; width: 30%;">Item Description</th>
        <th style="padding: 6px 4px; text-align: center; font-weight: bold; width: 12%;">HSN/SAC</th>
        <th style="padding: 6px 4px; text-align: right; font-weight: bold; width: 15%;">Qty</th>
        <th style="padding: 6px 4px; text-align: right; font-weight: bold; width: 15%;">Rate (₹)</th>
        <th style="padding: 6px 4px; text-align: right; font-weight: bold; width: 23%;">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 6px 4px; text-align: center;">{{addOne @index}}</td>
        <td style="padding: 6px 4px;"><strong>{{name}}</strong></td>
        <td style="padding: 6px 4px; text-align: center;">{{hsn}}</td>
        <td style="padding: 6px 4px; text-align: right;">{{qtyFormatted}} {{unit}}</td>
        <td style="padding: 6px 4px; text-align: right;">₹{{rateFormatted}}</td>
        <td style="padding: 6px 4px; text-align: right;">₹{{amountFormatted}}</td>
      </tr>
      {{/each}}
      <tr style="border-top: 1.5px solid #2d241b; border-bottom: 1.5px solid #2d241b; font-weight: bold;">
        <td colspan="3" style="padding: 6px 4px;"><strong>SubTotal</strong></td>
        <td style="padding: 6px 4px; text-align: right;"><strong>{{totalQtyFormatted}}</strong></td>
        <td style="padding: 6px 4px; text-align: right;"><strong>₹{{totalRateFormatted}}</strong></td>
        <td style="padding: 6px 4px; text-align: right;"><strong>₹{{subtotalFormatted}}</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- FOOTER & BANK SECTION -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 12px;">
    <div style="width: 48%; font-size: 10.5px;">
      <h4 contenteditable="true" style="font-weight: bold; margin-bottom: 4px;">Bank Details</h4>
      <p contenteditable="true">Name : {{bankAccountName}}</p>
      <p contenteditable="true">IFSC CODE : {{bankIfsc}}</p>
      <p contenteditable="true">Account no : {{bankAccountNo}}</p>
      <p contenteditable="true">Bank : {{bankName}}, {{bankBranch}}</p>
      <p contenteditable="true" style="margin-top: 6px;"><strong>Payment Terms: {{paymentTerms}}</strong></p>
    </div>

    <div style="width: 48%; font-size: 11px;">
      <div style="display: flex; justify-content: space-between; padding: 3px 0;">
        <span>SubTotal</span><span>₹{{subtotalFormatted}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 3px 0;">
        <span>Tax (GST)</span><span>₹{{cgstFormatted}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; font-weight: bold; border-top: 1.5px solid #2d241b; border-bottom: 1.5px solid #2d241b; margin-top: 4px; color: #2d241b;">
        <span>Total Amount</span><span>₹{{totalFormatted}}</span>
      </div>
      <div style="margin-top: 6px; text-align: right; font-size: 10.5px;">
        <div style="font-weight: bold;">Total Amount (in words)</div>
        <div contenteditable="true">{{totalInWords}}</div>
      </div>
    </div>
  </div>

  <!-- STAMP & SIGNATURE -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25px; padding-top: 10px;">
    <div>
      {{#if stampUrl}}<img src="{{stampUrl}}" style="max-width: 90px; max-height: 90px;" />{{/if}}
    </div>
    <div style="text-align: right;">
      <p contenteditable="true" style="font-weight: bold; margin-bottom: 6px;">For {{companyName}}</p>
      {{#if signatureUrl}}<img src="{{signatureUrl}}" style="max-width: 120px; max-height: 60px; display: block; margin-left: auto; margin-bottom: 4px;" />{{/if}}
      <p contenteditable="true" style="font-size: 9px;">Auth. Signatory</p>
    </div>
  </div>

  <div contenteditable="true" style="text-align: center; border-top: 1px solid #2d241b; padding-top: 4px; margin-top: 20px; font-size: 9.5px; font-style: italic;">
    {{footerText}}
  </div>
</div>
`;

export function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("Company Profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTagline, setNewTagline] = useState('');

  // Canva Canvas State
  const canvasRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState("#2d241b");
  const [selectedFontSize, setSelectedFontSize] = useState("11px");
  const [selectedBorderWidth, setSelectedBorderWidth] = useState("1.5px");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/settings/profile');
      setProfile(res.data.data);
    } catch (err) {
      toast.error('Failed to load settings profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let payload = { ...profile };

      // If we are saving canvas customizations
      if (canvasRef.current) {
        payload.customHtml = canvasRef.current.innerHTML;
      }

      const res = await api.put('/settings/profile', payload);
      setProfile(res.data.data);
      toast.success('Settings & Canva Template Saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyColorToSelection = (color) => {
    setSelectedColor(color);
    document.execCommand('foreColor', false, color);
  };

  const handleApplyFontSizeToSelection = (size) => {
    setSelectedFontSize(size);
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      range.surroundContents(span);
    }
  };

  const handleApplyBold = () => {
    document.execCommand('bold', false, null);
  };

  const handleApplyAlign = (align) => {
    if (align === 'left') document.execCommand('justifyLeft', false, null);
    if (align === 'center') document.execCommand('justifyCenter', false, null);
    if (align === 'right') document.execCommand('justifyRight', false, null);
  };

  const handleResetCanvas = () => {
    if (!window.confirm('Reset invoice canvas back to original Classic Canva layout?')) return;
    if (canvasRef.current) {
      canvasRef.current.innerHTML = DEFAULT_CANVA_TEMPLATE;
    }
    setProfile({ ...profile, customHtml: DEFAULT_CANVA_TEMPLATE });
    toast.success('Canvas reset to original layout!');
  };

  const handleUploadImage = async (field, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(field, file);

    const toastId = toast.loading(`Uploading ${field}...`);
    try {
      const res = await api.post(`/settings/profile/${field}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data.data);
      toast.success(`${field} uploaded!`, { id: toastId });
    } catch (err) {
      toast.error(`Upload failed`, { id: toastId });
    }
  };

  const handleDeleteImage = async (field) => {
    if (!window.confirm(`Remove ${field} image?`)) return;
    try {
      const res = await api.delete(`/settings/profile/${field}`);
      setProfile(res.data.data);
      toast.success(`${field} image removed`);
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const handleAddTagline = () => {
    if (!newTagline.trim()) return;
    setProfile({
      ...profile,
      taglines: [...(profile.taglines || []), newTagline.trim()]
    });
    setNewTagline('');
  };

  const handleRemoveTagline = (index) => {
    const updated = [...profile.taglines];
    updated.splice(index, 1);
    setProfile({ ...profile, taglines: updated });
  };

  if (loading || !profile) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-y2k-text border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white border-2 border-y2k-border shadow-y2k p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-y2k-muted">System Preferences</span>
          <h2 className="text-xl font-black text-y2k-text tracking-tight uppercase">Business Profile & Interactive Canvas Designer</h2>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-6 py-2.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k hover:translate-y-[-1px] transition-all disabled:opacity-50 shrink-0"
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Y2K Tab Bar */}
      <div className="flex flex-wrap gap-2 p-1 bg-white border-2 border-y2k-border shadow-y2k-sm w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-bold transition-all border ${
              tab === t 
                ? 'bg-y2k-text text-y2k-bg border-y2k-text shadow-y2k-sm' 
                : 'bg-transparent text-y2k-text border-transparent hover:bg-y2k-bg'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB 1: COMPANY PROFILE */}
      {tab === "Company Profile" && (
        <div className="space-y-6">
          <Card className="grid md:grid-cols-2 gap-4">
            <Field label="Company / Entity Name">
              <Input
                value={profile.companyName || ''}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              />
            </Field>

            <Field label="GSTIN Number">
              <Input
                value={profile.gstin || ''}
                onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
              />
            </Field>

            <Field label="Phone / Mobile">
              <Input
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </Field>

            <Field label="Email Address">
              <Input
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </Field>

            <Field label="Street Address">
              <Input
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-3 gap-2">
              <Field label="City">
                <Input
                  value={profile.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                />
              </Field>

              <Field label="State">
                <Select
                  value={profile.state || 'Delhi'}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  options={STATES}
                />
              </Field>

              <Field label="PIN Code">
                <Input
                  value={profile.pincode || ''}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                />
              </Field>
            </div>
          </Card>

          {/* Taglines */}
          <Card className="space-y-4">
            <h4 className="font-bold text-xs text-y2k-text uppercase tracking-wider">Header Taglines (printed on invoice header)</h4>
            <div className="space-y-3">
              {profile.taglines?.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={t}
                    onChange={(e) => {
                      const updated = [...profile.taglines];
                      updated[idx] = e.target.value;
                      setProfile({ ...profile, taglines: updated });
                    }}
                  />
                  <button
                    onClick={() => handleRemoveTagline(idx)}
                    className="p-2.5 bg-y2k-red/40 hover:bg-y2k-red border border-y2k-redDark text-y2k-redDark transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Input
                value={newTagline}
                onChange={(e) => setNewTagline(e.target.value)}
                placeholder="Add tagline line e.g. Approved Govt Contractor..."
              />
              <button
                onClick={handleAddTagline}
                className="px-4 py-2 bg-y2k-text text-y2k-bg font-bold text-xs border-2 border-y2k-border hover:bg-black transition-colors shrink-0"
              >
                Add Line
              </button>
            </div>
          </Card>

          {/* Branding Images Uploads */}
          <Card className="grid md:grid-cols-3 gap-6">
            {/* LOGO */}
            <div className="space-y-3 text-center md:border-r-2 border-y2k-border md:pr-4">
              <p className="font-bold text-xs text-y2k-text uppercase tracking-wider">Company Logo</p>
              <div className="w-full h-32 border-2 border-dashed border-y2k-border bg-y2k-bg/30 flex items-center justify-center relative overflow-hidden">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo" className="max-h-28 object-contain" />
                ) : (
                  <div className="text-y2k-muted flex flex-col items-center gap-1 text-xs font-medium">
                    <ImageIcon size={24} />
                    <span>No logo uploaded</span>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-2">
                <label className="px-3 py-1.5 bg-y2k-text text-y2k-bg border-2 border-y2k-border text-xs font-bold cursor-pointer hover:bg-black transition-colors">
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadImage('logo', e.target.files[0])}
                  />
                </label>
                {profile.logoUrl && (
                  <button
                    onClick={() => handleDeleteImage('logo')}
                    className="p-1.5 bg-y2k-red/40 hover:bg-y2k-red border border-y2k-redDark text-y2k-redDark transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* STAMP */}
            <div className="space-y-3 text-center md:border-r-2 border-y2k-border md:pr-4">
              <p className="font-bold text-xs text-y2k-text uppercase tracking-wider">Official Stamp / Seal</p>
              <div className="w-full h-32 border-2 border-dashed border-y2k-border bg-y2k-bg/30 flex items-center justify-center relative overflow-hidden">
                {profile.stampUrl ? (
                  <img src={profile.stampUrl} alt="Stamp" className="max-h-28 object-contain" />
                ) : (
                  <div className="text-y2k-muted flex flex-col items-center gap-1 text-xs font-medium">
                    <ImageIcon size={24} />
                    <span>No stamp uploaded</span>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-2">
                <label className="px-3 py-1.5 bg-y2k-text text-y2k-bg border-2 border-y2k-border text-xs font-bold cursor-pointer hover:bg-black transition-colors">
                  Upload Stamp
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadImage('stamp', e.target.files[0])}
                  />
                </label>
                {profile.stampUrl && (
                  <button
                    onClick={() => handleDeleteImage('stamp')}
                    className="p-1.5 bg-y2k-red/40 hover:bg-y2k-red border border-y2k-redDark text-y2k-redDark transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* SIGNATURE */}
            <div className="space-y-3 text-center">
              <p className="font-bold text-xs text-y2k-text uppercase tracking-wider">Authorized Signature</p>
              <div className="w-full h-32 border-2 border-dashed border-y2k-border bg-y2k-bg/30 flex items-center justify-center relative overflow-hidden">
                {profile.signatureUrl ? (
                  <img src={profile.signatureUrl} alt="Signature" className="max-h-28 object-contain" />
                ) : (
                  <div className="text-y2k-muted flex flex-col items-center gap-1 text-xs font-medium">
                    <ImageIcon size={24} />
                    <span>No signature uploaded</span>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-2">
                <label className="px-3 py-1.5 bg-y2k-text text-y2k-bg border-2 border-y2k-border text-xs font-bold cursor-pointer hover:bg-black transition-colors">
                  Upload Signature
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadImage('signature', e.target.files[0])}
                  />
                </label>
                {profile.signatureUrl && (
                  <button
                    onClick={() => handleDeleteImage('signature')}
                    className="p-1.5 bg-y2k-red/40 hover:bg-y2k-red border border-y2k-redDark text-y2k-redDark transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CANVA CANVAS DESIGNER */}
      {tab === "Invoice Canvas Designer" && (
        <div className="space-y-4">
          {/* Canva Top Formatting Toolbar */}
          <div className="sticky top-16 z-30 bg-white border-2 border-y2k-border shadow-y2k p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Bold */}
              <button
                type="button"
                onClick={handleApplyBold}
                className="p-1.5 bg-white border-2 border-y2k-border hover:bg-y2k-bg font-bold text-xs"
                title="Bold Text"
              >
                <BoldIcon size={16} />
              </button>

              {/* Font Size Selector */}
              <div className="flex items-center gap-1 border-2 border-y2k-border px-2 py-1 bg-white">
                <Type size={14} className="text-y2k-muted" />
                <select
                  value={selectedFontSize}
                  onChange={(e) => handleApplyFontSizeToSelection(e.target.value)}
                  className="text-xs font-bold outline-none bg-transparent"
                >
                  {["10px", "11px", "12px", "14px", "16px", "18px", "20px", "24px"].map(sz => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>

              {/* Text Alignments */}
              <div className="flex border-2 border-y2k-border bg-white">
                <button type="button" onClick={() => handleApplyAlign('left')} className="p-1.5 hover:bg-y2k-bg border-r border-y2k-border"><AlignLeft size={14} /></button>
                <button type="button" onClick={() => handleApplyAlign('center')} className="p-1.5 hover:bg-y2k-bg border-r border-y2k-border"><AlignCenter size={14} /></button>
                <button type="button" onClick={() => handleApplyAlign('right')} className="p-1.5 hover:bg-y2k-bg"><AlignRight size={14} /></button>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-1 border-2 border-y2k-border p-1 bg-white">
                <Palette size={14} className="text-y2k-muted ml-1" />
                {[
                  '#2d241b', '#004e74', '#3a5500', '#8b1d24', '#453080', '#000000'
                ].map(hex => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => handleApplyColorToSelection(hex)}
                    style={{ backgroundColor: hex }}
                    className="w-5 h-5 border border-y2k-border hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCanvas}
                className="px-3 py-1.5 bg-y2k-yellow text-y2k-yellowDark font-bold text-xs border-2 border-y2k-yellowDark hover:bg-amber-300 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={14} /> Reset Canvas
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-1.5 bg-y2k-green text-y2k-greenDark font-bold text-xs border-2 border-y2k-greenDark shadow-y2k-sm hover:translate-y-[-1px] transition-all flex items-center gap-1"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>

          <div className="text-xs font-semibold text-y2k-muted flex items-center gap-2 bg-y2k-bg/40 p-2.5 border-2 border-y2k-border">
            <Type size={16} className="text-y2k-text shrink-0" />
            <span>
              <strong>Canva Style Interactive Mode:</strong> Click directly on any text or section below to type, edit headers, format fonts, or change colors!
            </span>
          </div>

          {/* Interactive Document Canvas Sheet */}
          <div className="bg-y2k-gray/40 p-6 md:p-10 border-2 border-y2k-border flex justify-center">
            <div
              className="w-full max-w-[800px] bg-white border-2 border-y2k-border shadow-y2k-lg p-8 min-h-[900px] outline-none"
              contentEditable={false}
            >
              <div
                ref={canvasRef}
                dangerouslySetInnerHTML={{
                  __html: profile.customHtml && profile.customHtml.trim().length > 0
                    ? profile.customHtml
                    : DEFAULT_CANVA_TEMPLATE
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INVOICE DEFAULTS */}
      {tab === "Invoice Defaults" && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <Field label="Default Payment Terms text">
              <Input
                value={profile.defaultPaymentTerms || ''}
                onChange={(e) => setProfile({ ...profile, defaultPaymentTerms: e.target.value })}
                placeholder="e.g. 30 Days from date of issue"
              />
            </Field>

            <Field label="Invoice Footer text">
              <Input
                value={profile.footerText || ''}
                onChange={(e) => setProfile({ ...profile, footerText: e.target.value })}
                placeholder="e.g. This is a computer generated invoice"
              />
            </Field>
          </Card>
        </div>
      )}

      {/* TAB 4: BANK DETAILS */}
      {tab === "Bank Details" && (
        <Card className="grid md:grid-cols-2 gap-4">
          <Field label="Account Holder Name">
            <Input
              value={profile.accountName || ''}
              onChange={(e) => setProfile({ ...profile, accountName: e.target.value })}
              placeholder="e.g. Acme Enterprises"
            />
          </Field>

          <Field label="Bank Name">
            <Input
              value={profile.bankName || ''}
              onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
              placeholder="e.g. HDFC Bank"
            />
          </Field>

          <Field label="Account Number">
            <Input
              value={profile.accountNo || ''}
              onChange={(e) => setProfile({ ...profile, accountNo: e.target.value })}
              placeholder="e.g. 1234567890"
            />
          </Field>

          <Field label="IFSC Code">
            <Input
              value={profile.ifsc || ''}
              onChange={(e) => setProfile({ ...profile, ifsc: e.target.value })}
              placeholder="e.g. HDFC0001234"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Bank Branch & City">
              <Input
                value={profile.bankBranch || ''}
                onChange={(e) => setProfile({ ...profile, bankBranch: e.target.value })}
                placeholder="e.g. Main Branch, MG Road, Mumbai - 400001"
              />
            </Field>
          </div>
        </Card>
      )}

      {/* TAB 5: NUMBER FORMATTING */}
      {tab === "Number Formatting" && (
        <Card className="space-y-6">
          <div>
            <h4 className="font-bold text-xs text-y2k-text uppercase tracking-wider">Configurable Decimal Precision</h4>
            <p className="text-xs text-y2k-muted mt-1 font-medium">
              Set how many decimal places to store and display for rates and quantities across all invoices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Rate Decimal Places (0 - 6)">
              <Select
                value={profile.rateDecimalPlaces ?? 2}
                onChange={(e) => setProfile({ ...profile, rateDecimalPlaces: Number(e.target.value) })}
                options={[0, 1, 2, 3, 4, 5, 6].map(n => ({ label: `${n} Decimal Places (${(69.54321).toFixed(n)})`, value: n }))}
              />
            </Field>

            <Field label="Quantity Decimal Places (0 - 6)">
              <Select
                value={profile.qtyDecimalPlaces ?? 2}
                onChange={(e) => setProfile({ ...profile, qtyDecimalPlaces: Number(e.target.value) })}
                options={[0, 1, 2, 3, 4, 5, 6].map(n => ({ label: `${n} Decimal Places (${(2685.1234).toFixed(n)})`, value: n }))}
              />
            </Field>
          </div>
        </Card>
      )}
    </div>
  );
}
