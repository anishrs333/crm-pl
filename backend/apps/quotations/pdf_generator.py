import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


def generate_quotation_pdf(quotation):
    """
    Generates a professional PDF document for the given Quotation instance.
    Returns a BytesIO buffer containing the PDF binary content.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E293B'),
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold',
        spaceAfter=6
    )
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#334155')
    )
    body_normal = ParagraphStyle(
        'BodyNormal',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569')
    )
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        fontName='Helvetica-Bold',
        textColor=colors.white
    )
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )

    elements = []

    # Header Row with Company Brand & Quotation Info
    company_info = [
        Paragraph("<b>PL SOFT TECH SOLUTIONS</b>", title_style),
        Paragraph("Enterprise Software & CRM Solutions", subtitle_style),
        Paragraph("Email: contact@plsofttech.com | Web: www.plsofttech.com", subtitle_style),
    ]

    quote_meta = [
        Paragraph("<b>QUOTATION</b>", ParagraphStyle('QTitle', parent=title_style, alignment=2, textColor=colors.HexColor('#2563EB'))),
        Paragraph(f"<b>Quote No:</b> {quotation.quote_number}", ParagraphStyle('QRight', parent=body_normal, alignment=2)),
        Paragraph(f"<b>Date:</b> {quotation.created_at.strftime('%Y-%m-%d')}", ParagraphStyle('QRight2', parent=body_normal, alignment=2)),
        Paragraph(f"<b>Valid Until:</b> {quotation.valid_until or 'N/A'}", ParagraphStyle('QRight3', parent=body_normal, alignment=2)),
        Paragraph(f"<b>Status:</b> {quotation.get_status_display()}", ParagraphStyle('QRight4', parent=body_normal, alignment=2)),
    ]

    header_table = Table(
        [[company_info, quote_meta]],
        colWidths=[4.0 * inch, 3.5 * inch]
    )
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))

    elements.append(header_table)
    elements.append(Spacer(1, 12))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=12))

    # Customer & Bill-To Section
    customer = quotation.customer
    customer_details = [
        Paragraph("<b>PREPARED FOR:</b>", section_heading),
        Paragraph(f"<b>{customer.name}</b>", body_bold),
        Paragraph(f"Contact: {customer.contact_person or 'N/A'}", body_normal),
        Paragraph(f"Email: {customer.email or 'N/A'} | Phone: {customer.phone or 'N/A'}", body_normal),
        Paragraph(f"Address: {customer.address or 'N/A'}", body_normal),
    ]
    if customer.gst_number:
        customer_details.append(Paragraph(f"GST No: {customer.gst_number}", body_normal))

    prepared_by = quotation.created_by
    creator_details = [
        Paragraph("<b>PREPARED BY:</b>", section_heading),
        Paragraph(f"<b>{prepared_by.get_full_name() if prepared_by else 'Sales Department'}</b>", body_bold),
        Paragraph(f"Email: {prepared_by.email if prepared_by else 'sales@plsofttech.com'}", body_normal),
        Paragraph(f"Role: {prepared_by.get_role_display() if prepared_by and hasattr(prepared_by, 'get_role_display') else 'Sales Representative'}", body_normal),
    ]

    info_table = Table(
        [[customer_details, creator_details]],
        colWidths=[4.2 * inch, 3.3 * inch]
    )
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))

    elements.append(info_table)
    elements.append(Spacer(1, 16))

    # Quotation Items Table
    elements.append(Paragraph("<b>Line Items</b>", section_heading))

    items_data = [
        [
            Paragraph("<b>#</b>", table_header_style),
            Paragraph("<b>Description</b>", table_header_style),
            Paragraph("<b>Qty</b>", table_header_style),
            Paragraph("<b>Unit Price (₹)</b>", table_header_style),
            Paragraph("<b>Tax Rate (%)</b>", table_header_style),
            Paragraph("<b>Line Total (₹)</b>", table_header_style),
        ]
    ]

    for index, item in enumerate(quotation.items.all(), start=1):
        items_data.append([
            Paragraph(str(index), table_cell_style),
            Paragraph(item.description, table_cell_style),
            Paragraph(str(item.quantity), table_cell_style),
            Paragraph(f"₹{item.unit_price:,.2f}", table_cell_style),
            Paragraph(f"{item.tax_percentage:.2f}%", table_cell_style),
            Paragraph(f"₹{item.line_total:,.2f}", table_cell_style),
        ])

    items_table = Table(
        items_data,
        colWidths=[0.4 * inch, 3.3 * inch, 0.6 * inch, 1.1 * inch, 0.9 * inch, 1.2 * inch]
    )
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))

    elements.append(items_table)
    elements.append(Spacer(1, 12))

    # Summary Totals Section
    totals_data = [
        [Paragraph("<b>Subtotal:</b>", body_bold), Paragraph(f"₹{quotation.subtotal:,.2f}", body_normal)],
        [Paragraph("<b>Tax Amount (GST):</b>", body_bold), Paragraph(f"₹{quotation.tax_amount:,.2f}", body_normal)],
        [Paragraph("<b>Grand Total:</b>", ParagraphStyle('GTotalLabel', parent=body_bold, fontSize=11, textColor=colors.HexColor('#0F172A'))),
         Paragraph(f"<b>₹{quotation.grand_total:,.2f}</b>", ParagraphStyle('GTotalVal', parent=body_bold, fontSize=11, textColor=colors.HexColor('#2563EB')))],
    ]

    totals_table = Table(totals_data, colWidths=[2.2 * inch, 1.5 * inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('LINEABOVE', (0, 2), (1, 2), 1, colors.HexColor('#2563EB')),
    ]))

    wrapper_table = Table([['', totals_table]], colWidths=[3.8 * inch, 3.7 * inch])
    wrapper_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(wrapper_table)
    elements.append(Spacer(1, 16))

    # Terms & Conditions Section
    if quotation.terms_and_conditions:
        elements.append(Paragraph("<b>Terms & Conditions</b>", section_heading))
        elements.append(Paragraph(quotation.terms_and_conditions.replace('\n', '<br/>'), body_normal))
        elements.append(Spacer(1, 10))

    if quotation.notes:
        elements.append(Paragraph("<b>Notes / Remarks</b>", section_heading))
        elements.append(Paragraph(quotation.notes.replace('\n', '<br/>'), body_normal))

    doc.build(elements)
    buffer.seek(0)
    return buffer
