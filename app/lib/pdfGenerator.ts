import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction, Organization } from './types';

/**
 * Generate PDF for a party's ledger
 */
export async function generateLedgerPDF(
  organization: Organization,
  transactions: Transaction[],
  currency: string = '₹',
  orgName: string = 'Mudir'
): Promise<void> {
  try {
    const balance = calculateBalance(transactions);
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const html = generateLedgerHTML(
      organization,
      sortedTransactions,
      balance,
      currency,
      orgName
    );

    const { uri } = await Print.printToFileAsync({ html });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${organization.name} - Ledger`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      console.error('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Calculate balance from transactions
 */
function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, transaction) => {
    return transaction.type === 'CREDIT' ? acc - transaction.amount : acc + transaction.amount;
  }, 0);
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generate HTML for ledger PDF
 */
function generateLedgerHTML(
  organization: Organization,
  transactions: Transaction[],
  balance: number,
  currency: string,
  orgName: string
): string {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const transactionRows = transactions
    .map(
      (transaction) => `
    <tr>
      <td>${new Date(transaction.date).toLocaleDateString('en-IN')}</td>
      <td>${transaction.remark || '-'}</td>
      <td class="amount">${
        transaction.type === 'DEBIT' ? formatCurrency(transaction.amount, currency) : '-'
      }</td>
      <td class="amount">${
        transaction.type === 'CREDIT' ? formatCurrency(transaction.amount, currency) : '-'
      }</td>
    </tr>
  `
    )
    .join('');

  const totalCredit = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceText =
    balance > 0
      ? `You will get ${formatCurrency(balance, currency)}`
      : balance < 0
      ? `You will give ${formatCurrency(-balance, currency)}`
      : 'Settled';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Ledger - ${organization.name}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px;
          color: #000;
          line-height: 1.3;
          padding: 0;
        }

        .header {
          margin-bottom: 15px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
        }

        .org-name {
          font-size: 14px;
          font-weight: bold;
          color: #000;
          margin-bottom: 3px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .document-title {
          font-size: 11px;
          color: #000;
          font-weight: bold;
        }

        .info-section {
          margin-bottom: 12px;
        }

        .party-info {
          border: 1px solid #000;
          padding: 8px 10px;
          margin-bottom: 10px;
        }

        .party-name {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          margin-bottom: 4px;
        }

        .party-details {
          color: #000;
          font-size: 9px;
          line-height: 1.4;
        }

        .balance-card {
          border: 1.5px solid #000;
          padding: 8px 10px;
          margin-bottom: 12px;
          background: #fff;
        }

        .balance-label {
          font-size: 9px;
          color: #000;
          margin-bottom: 3px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .balance-amount {
          font-size: 12px;
          font-weight: bold;
          color: #000;
        }

        .table-container {
          page-break-inside: auto;
          margin-bottom: 12px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #000;
          page-break-inside: auto;
        }

        thead {
          display: table-header-group;
        }

        tbody {
          display: table-row-group;
        }

        th {
          padding: 6px 5px;
          text-align: left;
          font-weight: bold;
          color: #000;
          font-size: 9px;
          text-transform: uppercase;
          border-bottom: 1.5px solid #000;
          border-right: 1px solid #000;
          background: #fff;
        }

        th:last-child {
          border-right: none;
        }

        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        td {
          padding: 5px;
          border-bottom: 0.5px solid #ccc;
          border-right: 1px solid #ccc;
          font-size: 9px;
          color: #000;
          vertical-align: top;
        }

        td:last-child {
          border-right: none;
        }

        tbody tr:last-child td {
          border-bottom: 1px solid #000;
        }

        .amount {
          text-align: right;
          font-weight: normal;
          font-family: 'Courier New', monospace;
        }

        .summary {
          border: 1px solid #000;
          padding: 8px 10px;
          margin-top: 10px;
          page-break-inside: avoid;
        }

        .summary-title {
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #000;
          text-transform: uppercase;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 0.5px dotted #666;
          font-size: 9px;
        }

        .summary-row:last-child {
          border-bottom: none;
          padding-top: 6px;
          margin-top: 4px;
          border-top: 1.5px solid #000;
          font-weight: bold;
          font-size: 10px;
        }

        .summary-label {
          color: #000;
        }

        .summary-value {
          font-weight: normal;
          font-family: 'Courier New', monospace;
          color: #000;
        }

        .footer {
          margin-top: 15px;
          padding-top: 8px;
          border-top: 1px solid #000;
          text-align: center;
          color: #666;
          font-size: 8px;
          page-break-inside: avoid;
        }

        .no-transactions {
          text-align: center;
          padding: 20px;
          color: #666;
          font-style: italic;
          font-size: 9px;
        }

        @media print {
          body {
            padding: 0;
          }

          .page-break {
            page-break-before: always;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="org-name">${orgName}</div>
        <div class="document-title">LEDGER STATEMENT</div>
      </div>

      <div class="info-section">
        <div class="party-info">
          <div class="party-name">${organization.name}</div>
          <div class="party-details">
            ${organization.phone ? `<div>Phone: ${organization.phone}</div>` : ''}
            ${organization.email ? `<div>Email: ${organization.email}</div>` : ''}
          </div>
        </div>

        <div class="balance-card">
          <div class="balance-label">Current Balance</div>
          <div class="balance-amount">${balanceText}</div>
        </div>
      </div>

      ${
        transactions.length > 0
          ? `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 12%;">DATE</th>
              <th style="width: 48%;">PARTICULARS</th>
              <th style="width: 20%; text-align: right;">DEBIT</th>
              <th style="width: 20%; text-align: right;">CREDIT</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows}
          </tbody>
        </table>
      </div>

      <div class="summary">
        <div class="summary-title">Summary</div>
        <div class="summary-row">
          <span class="summary-label">Total Debit (You Took)</span>
          <span class="summary-value">${formatCurrency(totalDebit, currency)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total Credit (You Gave)</span>
          <span class="summary-value">${formatCurrency(totalCredit, currency)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Net Balance</span>
          <span class="summary-value">${balanceText}</span>
        </div>
      </div>
      `
          : `
      <div class="no-transactions">
        No transactions found for this party.
      </div>
      `
      }

      <div class="footer">
        Generated on ${currentDate} | ${transactions.length} transaction${
    transactions.length !== 1 ? 's' : ''
  }
      </div>
    </body>
    </html>
  `;
}
