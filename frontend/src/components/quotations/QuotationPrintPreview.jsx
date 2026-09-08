import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Printer, Download, X, Share2 } from 'lucide-react';
import './QuotationPrintPreview.css';

export const QuotationPrintPreview = ({ quotation, onClose, onShare }) => {
  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="quot-preview-overlay" role="dialog" aria-modal="true">
      {/* Top Toolbar */}
      <div className="quot-preview-toolbar">
        <div>
          <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            Quotation Preview — {quotation.quotationNumber} ({quotation.version})
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
            icon={Printer}
            onClick={handlePrint}
          >
            Print / Save as PDF
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
              info@plsofttech.com • +91 (0) 800-245-7890<br />
              GSTIN: 29ABCDE1234F1Z5
            </p>
          </div>

          <div className="quot-doc-title">
            <h1>Quotation</h1>
            <div className="quot-meta-list">
              <div><strong>Quotation No:</strong> {quotation.quotationNumber}</div>
              <div><strong>Revision:</strong> {quotation.version}</div>
              <div><strong>Date:</strong> {formatDate(quotation.createdDate)}</div>
              <div><strong>Valid Until:</strong> {formatDate(quotation.validUntil)}</div>
            </div>
          </div>
        </div>

        {/* Parties Grid */}
        <div className="quot-parties-grid">
          <div className="party-box">
            <h4>Prepared For (Client):</h4>
            <h3>{quotation.customerName}</h3>
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
              Status: <strong>{quotation.status}</strong>
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
            {quotation.items?.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    {item.description}
                  </div>
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
              <span>{formatCurrency(quotation.subtotal)}</span>
            </div>
            {quotation.discountTotal > 0 && (
              <div className="totals-row">
                <span>Discount Applied:</span>
                <span style={{ color: '#dc2626' }}>-{formatCurrency(quotation.discountTotal)}</span>
              </div>
            )}
            <div className="totals-row">
              <span>Tax (GST 18%):</span>
              <span>+{formatCurrency(quotation.taxTotal)}</span>
            </div>
            <div className="totals-row grand-total">
              <span>Grand Total:</span>
              <span>{formatCurrency(quotation.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="quot-doc-terms">
          <h4>Terms & Conditions:</h4>
          <p>{quotation.terms}</p>
        </div>

        {/* Signatures */}
        <div className="quot-signature-row">
          <div className="signature-block">
            Authorized Signatory<br />
            <strong>PL Soft Tech Solutions</strong>
          </div>
          <div className="signature-block">
            Client Acceptance Signature<br />
            <strong>{quotation.customerName}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
