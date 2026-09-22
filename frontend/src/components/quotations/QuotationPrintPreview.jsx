import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../common/Button';
import { quotationService } from '../../services/quotationService';
import { Printer, X, Share2, Download } from 'lucide-react';
import './QuotationPrintPreview.css';

export const QuotationPrintPreview = ({ quotation, onClose, onShare }) => {
  const [downloading, setDownloading] = useState(false);
  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const success = await quotationService.downloadPdf(quotation.id, quotation.quotationNumber);
      if (!success) {
        window.print();
      }
    } catch (e) {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const rawItems = Array.isArray(quotation.items) && quotation.items.length > 0
    ? quotation.items
    : [
        {
          name: 'Enterprise CRM Core Platform',
          description: 'Enterprise CRM Core Platform',
          quantity: 1,
          unitPrice: 75000,
          discountPercentage: 0,
          taxPercentage: 18,
          lineTotal: 88500,
        },
      ];

  const processedItems = rawItems.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice ?? item.unit_price ?? 0);
    const disc = Number(item.discountPercentage ?? item.discount_percentage ?? 0);
    const tax = Number(item.taxPercentage ?? item.tax_percentage ?? 18);

    const baseSub = qty * price * (1 - disc / 100);
    const lineTax = baseSub * (tax / 100);
    const lineTotal = Math.round(baseSub + lineTax);

    return {
      ...item,
      name: item.name || item.description || 'Deliverable Item',
      description: item.description || item.name || '',
      quantity: qty,
      unitPrice: price,
      discountPercentage: disc,
      taxPercentage: tax,
      lineSubtotal: baseSub,
      lineTax: lineTax,
      lineTotal: Number(item.lineTotal ?? item.line_total) || lineTotal,
    };
  });

  const calcSubtotal = processedItems.reduce((sum, i) => sum + i.lineSubtotal, 0);
  const calcTaxTotal = processedItems.reduce((sum, i) => sum + i.lineTax, 0);
  const calcGrandTotal = calcSubtotal + calcTaxTotal;

  const displaySubtotal = (Number(quotation.subtotal) > 0) ? Number(quotation.subtotal) : calcSubtotal;
  const displayTaxTotal = (Number(quotation.taxTotal ?? quotation.tax_amount) > 0) ? Number(quotation.taxTotal ?? quotation.tax_amount) : calcTaxTotal;
  const displayGrandTotal = (Number(quotation.grandTotal ?? quotation.grand_total) > 0) ? Number(quotation.grandTotal ?? quotation.grand_total) : calcGrandTotal;

  return (
    <div className="quot-preview-overlay" role="dialog" aria-modal="true">
      {/* Top Toolbar */}
      <div className="quot-preview-toolbar">
        <div>
          <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            Quotation Preview — {quotation.quotationNumber || 'QT-2026-0001'} ({quotation.version || 'v1.0'})
          </strong>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              icon={Share2}
              onClick={() => onShare(quotation)}
            >
              Share Quote
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleDownloadPdf}
            isLoading={downloading}
          >
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={X}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>

      {/* Printable Paper Canvas */}
      <div className="quot-paper" id="quotation-print-area">
        {/* Document Header */}
        <div className="quot-doc-header">
          <div className="quot-company-brand">
            <h2>PL SOFT TECH SOLUTIONS</h2>
            <p>
              CRM & Enterprise Cloud Software Development<br />
              ops@plsofttech.com • Tech Park, Chennai, India<br />
              GSTIN: 33AAAAA0000A1Z5
            </p>
          </div>

          <div className="quot-doc-title">
            <h1>Quotation</h1>
            <div className="quot-meta-list">
              <div><strong>Quotation No:</strong> {quotation.quotationNumber || 'QT-2026-0001'}</div>
              <div><strong>Revision:</strong> {quotation.version || 'v1.0'}</div>
              <div><strong>Date:</strong> {formatDate(quotation.createdDate || new Date().toISOString())}</div>
              <div><strong>Valid Until:</strong> {formatDate(quotation.validUntil || new Date(Date.now() + 30 * 86400000).toISOString())}</div>
            </div>
          </div>
        </div>

        {/* Parties Grid */}
        <div className="quot-parties-grid">
          <div className="party-box">
            <h4>Prepared For (Client):</h4>
            <h3>{quotation.customerName || 'Client'}</h3>
            <p>
              Attn: {quotation.contactPerson || 'Authorized Representative'}<br />
              {quotation.email && <>Email: {quotation.email}<br /></>}
              {quotation.phone && <>Phone: {quotation.phone}<br /></>}
              {quotation.address && <>Address: {quotation.address}</>}
            </p>
          </div>

          <div className="party-box">
            <h4>Prepared By:</h4>
            <h3>PL Soft Tech Solutions</h3>
            <p>
              Account Executive: {quotation.assignedTo || 'Senior Sales Consultant'}<br />
              Project: Customer Relationship Management (CRM) Software<br />
              Status: <strong>{quotation.status || 'Draft'}</strong>
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="quot-doc-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '45%' }}>Item & Description</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Unit Price</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Disc %</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {processedItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                  {item.description && item.description !== item.name && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ textAlign: 'center' }}>{item.discountPercentage || 0}%</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="quot-doc-totals">
          <div className="totals-table">
            <div className="totals-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(displaySubtotal)}</span>
            </div>
            {quotation.discountTotal > 0 && (
              <div className="totals-row">
                <span>Discount Applied:</span>
                <span style={{ color: '#dc2626' }}>-{formatCurrency(quotation.discountTotal)}</span>
              </div>
            )}
            <div className="totals-row">
              <span>Tax (GST 18%):</span>
              <span>+{formatCurrency(displayTaxTotal)}</span>
            </div>
            <div className="totals-row grand-total">
              <span>Grand Total:</span>
              <span>{formatCurrency(displayGrandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="quot-doc-terms">
          <h4>Terms & Conditions:</h4>
          <p>{quotation.terms || '1. 50% advance payment along with official work order.\n2. 30% milestone payment upon UAT release.\n3. 20% on final sign-off & code handover.\n4. Standard 1 year warranty & critical bug fixes included.'}</p>
        </div>

        {/* Signatures */}
        <div className="quot-signature-row">
          <div className="signature-block">
            Authorized Signatory<br />
            <strong>PL Soft Tech Solutions</strong>
          </div>
          <div className="signature-block">
            Client Acceptance Signature<br />
            <strong>{quotation.customerName || 'Client'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
