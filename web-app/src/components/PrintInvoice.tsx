import React, { useRef } from 'react';
import { formatNumber } from '../utils/snf';
import { Purchase, Vendor } from '../types';

interface PrintInvoiceProps {
    purchase: Purchase;
    vendor?: Vendor;
    type: 'purchase' | 'sales';
    onClose: () => void;
}

const PrintInvoice: React.FC<PrintInvoiceProps> = ({ purchase, vendor, type, onClose }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const billTitle = type === 'purchase' ? 'BILL OF PURCHASE' : 'BILL OF SALES';
    const billToLabel = type === 'purchase' ? 'Bill To' : 'Sold To';
    
    // Calculate totals
    const totalKg = purchase.lines.reduce((sum, l) => sum + (parseFloat(String(l.kgQty)) || 0), 0);
    const totalLtr = purchase.lines.reduce((sum, l) => sum + (parseFloat(String(l.ltr)) || 0), 0);
    const avgFat = purchase.lines.length > 0 
        ? purchase.lines.reduce((sum, l) => sum + (parseFloat(String(l.fat)) || 0), 0) / purchase.lines.length 
        : 0;
    const avgSnf = purchase.lines.length > 0 
        ? purchase.lines.reduce((sum, l) => sum + (parseFloat(String(l.snf)) || 0), 0) / purchase.lines.length 
        : 0;
    const avgClr = purchase.lines.length > 0 
        ? purchase.lines.reduce((sum, l) => sum + (parseFloat(String(l.clr)) || 0), 0) / purchase.lines.length 
        : 0;

    const handlePrint = () => {
        if (!invoiceRef.current) return;
        
        // Create a print window and inject the invoice HTML with print styles
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to print invoices');
            return;
        }
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${type === 'purchase' ? 'Purchase' : 'Sales'}-Invoice-${purchase.invoiceNo}</title>
                <style>
                    * { margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
                    .invoice-container { padding: 40px; max-width: 900px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .header-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                    .header-text { font-size: 11px; margin-bottom: 3px; }
                    .bill-title { text-align: center; font-size: 14px; font-weight: bold; margin: 20px 0; }
                    .bill-to-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .bill-to-row { font-size: 11px; }
                    .bill-to-label { font-weight: bold; margin-bottom: 5px; }
                    .transport-section { margin-bottom: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
                    .transport-label { font-weight: bold; margin-bottom: 8px; }
                    .transport-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 11px; }
                    .transport-item { margin-bottom: 3px; }
                    .transport-item-label { font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
                    th { padding: 6px; text-align: left; font-weight: bold; border-bottom: 2px solid #000; background: #f5f5f5; }
                    td { padding: 6px; border-bottom: 1px solid #ddd; }
                    th.right, td.right { text-align: right; }
                    th.center, td.center { text-align: center; }
                    tfoot tr { border-top: 2px solid #000; font-weight: bold; background: #f5f5f5; }
                    .summary-section { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .summary-col { font-size: 11px; }
                    .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .summary-row.total { border-top: 2px solid #000; padding-top: 5px; font-weight: bold; }
                    .summary-row.subtotal { border-top: 1px solid #000; padding-top: 5px; }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${invoiceRef.current.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        
        // Trigger print dialog after content loads
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: 8,
                padding: 20,
                maxHeight: '90vh',
                overflow: 'auto',
                width: '95%',
                maxWidth: '900px'
            }}>
                {/* Print Preview */}
                <div ref={invoiceRef} style={{
                    padding: '40px',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '12px',
                    lineHeight: '1.4'
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>LAKSHMI DAIRY PRODUCTS</div>
                        <div style={{ fontSize: '11px', marginBottom: '3px' }}>SF NO 108/1b 109/1c2 PERIAR NAGAR VELLALAPALAYAM POST</div>
                        <div style={{ fontSize: '11px', marginBottom: '3px' }}>POLLACHI T.K COIMBATORE</div>
                        <div style={{ fontSize: '11px', marginBottom: '3px' }}>Phone no.: 7300099951 Email: Support@lakshmidairy.in</div>
                        <div style={{ fontSize: '11px' }}>GSTIN: 33AZCPN1265H1ZL State: 33-Tamil Nadu</div>
                    </div>

                    {/* Bill Title */}
                    <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px' }}>
                        {billTitle}
                    </div>

                    {/* Bill To Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{billToLabel}</div>
                            <div style={{ fontSize: '11px' }}>{vendor?.name || 'N/A'}</div>
                            <div style={{ fontSize: '11px' }}>{vendor?.city || ''} {vendor?.state || ''}</div>
                            <div style={{ fontSize: '11px' }}>Contact No.: {vendor?.mobileNumber || '0'}</div>
                        </div>
                        <div>
                            <div style={{ marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>Invoice No.:</span> {purchase.invoiceNo}
                            </div>
                            <div style={{ marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>Date:</span> {new Date(purchase.date).toLocaleDateString('en-GB')}
                            </div>
                            <div style={{ marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>GSTIN:</span> {vendor?.gstNumber || ''}
                            </div>
                        </div>
                    </div>

                    {/* Transportation Details */}
                    <div style={{ marginBottom: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Transportation Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '11px' }}>
                            <div>
                                <div style={{ marginBottom: '3px' }}><span style={{ fontWeight: 'bold' }}>Tag Number:</span> {purchase.vehicleNumber || ''}</div>
                                <div style={{ marginBottom: '3px' }}><span style={{ fontWeight: 'bold' }}>Vehicle Number:</span> {purchase.vehicleNumber || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ marginBottom: '3px' }}><span style={{ fontWeight: 'bold' }}>Driver name:</span> {purchase.driverName || '0'}</div>
                                <div style={{ marginBottom: '3px' }}><span style={{ fontWeight: 'bold' }}>Delivery Location:</span> {purchase.state || ''}</div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #000', background: '#f5f5f5' }}>
                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold' }}>Item Name</th>
                                <th style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Compartment</th>
                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>Kg / Can</th>
                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>QTY</th>
                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>FAT</th>
                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>SNF</th>
                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>CLR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchase.lines.map((line, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '6px' }}>RAW CHILLED MILK</td>
                                    <td style={{ padding: '6px', textAlign: 'center' }}>{line.compartment}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(line.kgQty, 2)}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(line.ltr, 2)}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(line.fat, 2)}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(line.snf, 2)}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(line.clr, 2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold', background: '#f5f5f5' }}>
                                <td colSpan={2} style={{ padding: '6px' }}>TOTAL</td>
                                <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(totalKg, 2)}</td>
                                <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(totalLtr, 2)}</td>
                                <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(avgFat, 2)}</td>
                                <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(avgSnf, 2)}</td>
                                <td style={{ padding: '6px', textAlign: 'right' }}>{formatNumber(avgClr, 2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Summary Section */}
                    <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div></div>
                        <div style={{ fontSize: '11px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderTop: '1px solid #000', paddingTop: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>Sub Total</span>
                                <span>{formatNumber(totalLtr * 50, 0)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>Round off</span>
                                <span>0.00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderTop: '2px solid #000', paddingTop: '5px', fontWeight: 'bold' }}>
                                <span>Net Amount</span>
                                <span>{formatNumber(totalLtr * 50, 0)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span>Balance</span>
                                <span>{formatNumber(totalLtr * 50, 0)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>Payment Mode</span>
                                <span>CREDIT</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Controls */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <button
                        onClick={handlePrint}
                        style={{
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        🖨️ Print Invoice
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrintInvoice;
