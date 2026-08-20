# Quotation Module Specification

## Overview
The Quotation module enables sales representatives and managers to quickly generate, customize, manage, and dispatch formal price quotations and proposals to prospective leads or existing customers.

---

## Key Capabilities

### 1. Quotation Lifecycle
- **Draft**: Quotation created, line items editable.
- **Sent**: Sent to customer via email / link, awaiting response.
- **Approved**: Customer accepted terms and pricing.
- **Rejected**: Customer rejected proposal; reason logged.
- **Expired**: Exceeded validity date without confirmation.

### 2. Line Items & Calculations
- **Item Reference**: Linked to Product / Service catalogue.
- **Unit Price**: Auto-populated from catalogue, with permission-gated override capability.
- **Quantity & Units**: Number of units / hours / license seats.
- **Discounts**: Item-level percentage or fixed discount, plus total order discount.
- **Taxes**: Configurable GST / VAT / Sales Tax calculations.
- **Grand Total**: Real-time computation of Subtotal, Tax Total, Discount Total, and Net Payable.

### 3. Output & Integration
- **PDF Generation**: Standardized branding with company logo, header/footer, terms & conditions.
- **CRM Integration**: Directly linked to an Opportunity / Customer / Lead.
- **Conversion**: Seamless one-click conversion to Sales Order / Invoice upon approval.
