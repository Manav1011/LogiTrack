import React, { useRef } from 'react';
import { Parcel, Office, User, PaymentMode } from '../types';
import { X, Printer } from 'lucide-react';

interface ReceiptModalProps {
  parcel: Parcel;
  sourceOffice: Office | undefined;
  destinationOffice: Office | undefined;
  user: User | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ parcel, sourceOffice, destinationOffice, user, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    const content = printRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill of Supply - ${parcel.trackingId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');
            body {
              font-family: 'Courier Prime', 'Courier New', monospace;
              width: 320px;
              margin: 0 auto;
              padding: 10px;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
            }
            .header { text-align: center; font-weight: bold; margin-bottom: 5px; }
            .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
            .title { text-align: center; font-weight: bold; font-size: 14px; margin: 5px 0; }
            .row { display: flex; margin-bottom: 3px; }
            .label { width: 100px; flex-shrink: 0; }
            .val { flex: 1; font-weight: bold; }
            .footer { margin-top: 15px; font-size: 10px; border-top: 1px solid #000; padding-top: 5px; }
            .amount-row { font-size: 14px; margin-top: 8px; font-weight: bold; }
            
            /* Print adjustments */
            @media print {
              body { width: 100%; margin: 0; padding: 0; }
              @page { margin: 0; size: auto; }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const formatDateTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-lg">
          <h3 className="font-bold text-slate-800">Print Preview</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
          {/* Thermal Receipt Preview Area */}
          <div ref={printRef} className="bg-white p-4 shadow-sm w-[300px] font-mono text-xs text-black leading-tight border border-slate-200">
            <div className="header uppercase">
              {sourceOffice?.name || "LOGITRACK OFFICE"}<br />
              {sourceOffice?.city?.toUpperCase()}, {sourceOffice?.code}<br />
              MOB: 9879984646
            </div>
            
            <div className="divider"></div>
            <div className="title">BILL OF SUPPLY</div>
            <div className="divider"></div>

            <div className="row">
              <span className="label">Txn ID</span>
              <span className="val">: {parcel.trackingId.replace('TRK-', '')}</span>
            </div>
            <div className="row">
              <span className="label">Date</span>
              <span className="val">: {formatDate(Date.now())}</span>
            </div>
            <div className="row">
              <span className="label">Booking Dt</span>
              <span className="val">: {formatDateTime(parcel.createdAt)}</span>
            </div>
            
            <div className="row" style={{ marginTop: '5px' }}>
              <span className="label">To Party</span>
              <span className="val">: {parcel.receiverName.toUpperCase()}</span>
            </div>
            <div className="row">
              <span className="label">Phone No.</span>
              <span className="val">: {parcel.receiverPhone}</span>
            </div>
            <div className="row">
              <span className="label">To City</span>
              <span className="val">: {destinationOffice?.name.toUpperCase()}</span>
            </div>

            <div className="row" style={{ marginTop: '5px' }}>
              <span className="label">From Party</span>
              <span className="val">: {parcel.senderName.toUpperCase()}</span>
            </div>
            <div className="row">
              <span className="label">From City</span>
              <span className="val">: {sourceOffice?.city.toUpperCase()}</span>
            </div>

            <div className="row" style={{ marginTop: '5px' }}>
              <span className="label">Des. Of Goods</span>
              <span className="val">: {parcel.quantity} {parcel.type.toUpperCase()}</span>
            </div>
            <div className="row">
              <span className="label">Quantity</span>
              <span className="val">: {parcel.quantity}</span>
            </div>
            
            <div className="row amount-row">
              <span className="label">Amount</span>
              <span className="val">: {parcel.price.toFixed(1)}</span>
            </div>
            <div className="row amount-row">
              <span className="label">Payment</span>
              <span className="val">: {parcel.paymentMode === PaymentMode.SENDER_PAYS ? 'PAID' : 'TO PAY'}</span>
            </div>

            <div className="row" style={{ marginTop: '8px' }}>
              <span className="label">Operator</span>
              <span className="val">: {user?.name.split(' ')[0].toUpperCase() || 'SYS'}</span>
            </div>

            <div className="footer">
              * We are not responsible for any damage or breakage of glass/liquid items.<br/>
              * Claim for more than Rs. 50 requires insurance.<br/>
              * Goods are transported at owner's risk.
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-lg flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800">
            <Printer className="w-4 h-4" /> Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};