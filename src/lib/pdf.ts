import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";
import type { Profile } from "@/lib/db/queries/profiles";
import type { InvoiceTemplate } from "@/lib/db/schema/profiles";

function formatDateForPdf(dateStr: string | null): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ============================================================================
// TEMPLATE 1: CLASSIC (Basic)
// Clean, traditional invoice layout with professional appearance
// ============================================================================
function generateClassicTemplate(
  invoice: InvoiceWithDetails,
  profile: Profile | null
): string {
  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px 16px; text-align: center; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
        <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 500; color: #111827; border-bottom: 1px solid #e5e7eb;">$${parseFloat(item.amount).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <div style="padding: 40px; font-family: 'Georgia', 'Times New Roman', serif; width: 800px; background: white;">
      <!-- Header with border bottom -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #1f2937;">
        <div>
          ${profile?.logoUrl ? `<img src="${profile.logoUrl}" alt="Logo" style="max-width: 180px; max-height: 80px; margin-bottom: 12px;" />` : ""}
          <h2 style="font-size: 22px; font-weight: bold; color: #1f2937; margin: 0;">${profile?.companyName || "Your Company"}</h2>
          ${profile?.address ? `<p style="margin: 6px 0 0; font-size: 13px; color: #4b5563; white-space: pre-line;">${profile.address}</p>` : ""}
          ${profile?.phone ? `<p style="margin: 3px 0 0; font-size: 13px; color: #4b5563;">${profile.phone}</p>` : ""}
          ${profile?.email ? `<p style="margin: 3px 0 0; font-size: 13px; color: #4b5563;">${profile.email}</p>` : ""}
        </div>
        <div style="text-align: right;">
          <h1 style="font-size: 36px; font-weight: bold; color: #1f2937; margin: 0; letter-spacing: 2px;">INVOICE</h1>
          <p style="margin: 8px 0 0; font-size: 16px; color: #6b7280;">${invoice.invoiceNumber}</p>
        </div>
      </div>

      <!-- Bill To and Dates -->
      <div style="display: flex; justify-content: space-between; margin: 32px 0;">
        <div>
          <h3 style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Bill To</h3>
          ${
            invoice.client
              ? `
            <div style="margin-top: 10px;">
              <p style="font-weight: 600; color: #1f2937; margin: 0; font-size: 15px;">${invoice.client.name}</p>
              ${invoice.client.company ? `<p style="font-size: 13px; color: #4b5563; margin: 4px 0 0;">${invoice.client.company}</p>` : ""}
              ${invoice.client.address ? `<p style="font-size: 13px; color: #4b5563; margin: 4px 0 0; white-space: pre-line;">${invoice.client.address}</p>` : ""}
              ${invoice.client.email ? `<p style="font-size: 13px; color: #4b5563; margin: 4px 0 0;">${invoice.client.email}</p>` : ""}
              ${invoice.client.phone ? `<p style="font-size: 13px; color: #4b5563; margin: 4px 0 0;">${invoice.client.phone}</p>` : ""}
            </div>
          `
              : `<p style="margin-top: 10px; font-size: 13px; color: #9ca3af;">No client selected</p>`
          }
        </div>
        <div style="text-align: right;">
          <div style="margin-bottom: 12px;">
            <span style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Issue Date</span>
            <p style="margin: 4px 0 0; font-weight: 500; color: #1f2937; font-size: 14px;">${formatDateForPdf(invoice.issueDate)}</p>
          </div>
          ${
            invoice.dueDate
              ? `
            <div>
              <span style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Due Date</span>
              <p style="margin: 4px 0 0; font-weight: 500; color: #1f2937; font-size: 14px;">${formatDateForPdf(invoice.dueDate)}</p>
            </div>
          `
              : ""
          }
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Description</th>
            <th style="width: 80px; padding: 14px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Qty</th>
            <th style="width: 110px; padding: 14px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Rate</th>
            <th style="width: 110px; padding: 14px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-top: 32px;">
        <div style="width: 280px;">
          ${
            invoice.subtotal
              ? `
            <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="color: #6b7280;">Subtotal</span>
              <span style="font-weight: 500; color: #374151;">$${parseFloat(invoice.subtotal).toFixed(2)}</span>
            </div>
          `
              : ""
          }
          ${
            invoice.taxRate && parseFloat(invoice.taxRate) > 0
              ? `
            <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="color: #6b7280;">Tax (${invoice.taxRate}%)</span>
              <span style="font-weight: 500; color: #374151;">$${parseFloat(invoice.taxAmount || "0").toFixed(2)}</span>
            </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; padding: 16px 0 0; margin-top: 8px; border-top: 2px solid #1f2937;">
            <span style="font-weight: 700; color: #1f2937; font-size: 16px;">Total Due</span>
            <span style="font-size: 24px; font-weight: bold; color: #1f2937;">$${parseFloat(invoice.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      ${
        invoice.notes
          ? `
        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <h3 style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Notes</h3>
          <p style="margin-top: 10px; font-size: 13px; color: #4b5563; white-space: pre-line; line-height: 1.6;">${invoice.notes}</p>
        </div>
      `
          : ""
      }
    </div>
  `;
}

// ============================================================================
// TEMPLATE 2: SIMPLE (Basic)
// Minimalist design with essential information only
// ============================================================================
function generateSimpleTemplate(
  invoice: InvoiceWithDetails,
  profile: Profile | null
): string {
  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 10px 0; text-align: right; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">$${parseFloat(item.amount).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <div style="padding: 48px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 800px; background: white;">
      <!-- Minimal Header -->
      <div style="margin-bottom: 48px;">
        ${profile?.logoUrl ? `<img src="${profile.logoUrl}" alt="Logo" style="max-width: 120px; max-height: 60px; margin-bottom: 16px;" />` : ""}
        <h1 style="font-size: 14px; font-weight: 400; color: #888; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Invoice</h1>
        <p style="font-size: 28px; font-weight: 300; color: #111; margin: 8px 0 0;">${invoice.invoiceNumber}</p>
      </div>

      <!-- Two Column Info -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 48px;">
        <div>
          <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0;">From</p>
          <p style="font-size: 15px; color: #111; margin: 8px 0 0; font-weight: 500;">${profile?.companyName || "Your Company"}</p>
          ${profile?.email ? `<p style="font-size: 13px; color: #666; margin: 4px 0 0;">${profile.email}</p>` : ""}
        </div>
        <div style="text-align: right;">
          <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0;">To</p>
          ${
            invoice.client
              ? `
            <p style="font-size: 15px; color: #111; margin: 8px 0 0; font-weight: 500;">${invoice.client.name}</p>
            ${invoice.client.email ? `<p style="font-size: 13px; color: #666; margin: 4px 0 0;">${invoice.client.email}</p>` : ""}
          `
              : `<p style="font-size: 13px; color: #999; margin: 8px 0 0;">No client</p>`
          }
        </div>
      </div>

      <!-- Dates Row -->
      <div style="display: flex; gap: 48px; margin-bottom: 48px; padding: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
        <div>
          <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Date</p>
          <p style="font-size: 14px; color: #111; margin: 6px 0 0;">${formatDateForPdf(invoice.issueDate)}</p>
        </div>
        ${
          invoice.dueDate
            ? `
          <div>
            <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Due</p>
            <p style="font-size: 14px; color: #111; margin: 6px 0 0;">${formatDateForPdf(invoice.dueDate)}</p>
          </div>
        `
            : ""
        }
      </div>

      <!-- Simple Items List -->
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Total -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #111;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Total</span>
          <span style="font-size: 32px; font-weight: 300; color: #111;">$${parseFloat(invoice.total).toFixed(2)}</span>
        </div>
      </div>

      ${
        invoice.notes
          ? `
        <div style="margin-top: 64px;">
          <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Notes</p>
          <p style="font-size: 13px; color: #666; margin: 12px 0 0; line-height: 1.7; white-space: pre-line;">${invoice.notes}</p>
        </div>
      `
          : ""
      }
    </div>
  `;
}

// ============================================================================
// TEMPLATE 3: MODERN (Advanced)
// Bold headers, accent colors, contemporary typography
// ============================================================================
function generateModernTemplate(
  invoice: InvoiceWithDetails,
  profile: Profile | null
): string {
  const accentColor = "#2563eb"; // Blue accent

  const itemsHtml = invoice.items
    .map(
      (item, index) => `
      <tr style="background: ${index % 2 === 0 ? "#f8fafc" : "white"};">
        <td style="padding: 16px 20px; font-size: 14px; color: #1e293b;">${item.description}</td>
        <td style="padding: 16px 20px; text-align: center; font-size: 14px; color: #64748b;">${item.quantity}</td>
        <td style="padding: 16px 20px; text-align: right; font-size: 14px; color: #64748b;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 16px 20px; text-align: right; font-size: 14px; font-weight: 600; color: #1e293b;">$${parseFloat(item.amount).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; width: 800px; background: white;">
      <!-- Colored Header Bar -->
      <div style="background: linear-gradient(135deg, ${accentColor} 0%, #1d4ed8 100%); padding: 40px; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            ${profile?.logoUrl ? `<img src="${profile.logoUrl}" alt="Logo" style="max-width: 160px; max-height: 70px; margin-bottom: 16px; filter: brightness(0) invert(1);" />` : ""}
            <h2 style="font-size: 24px; font-weight: 700; margin: 0;">${profile?.companyName || "Your Company"}</h2>
            ${profile?.email ? `<p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">${profile.email}</p>` : ""}
            ${profile?.phone ? `<p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">${profile.phone}</p>` : ""}
          </div>
          <div style="text-align: right;">
            <p style="font-size: 14px; opacity: 0.8; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Invoice</p>
            <p style="font-size: 32px; font-weight: 700; margin: 8px 0 0;">${invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div style="padding: 40px;">
        <!-- Info Cards Row -->
        <div style="display: flex; gap: 24px; margin-bottom: 40px;">
          <!-- Bill To Card -->
          <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 24px;">
            <p style="font-size: 11px; font-weight: 600; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">Bill To</p>
            ${
              invoice.client
                ? `
              <p style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 12px 0 0;">${invoice.client.name}</p>
              ${invoice.client.company ? `<p style="font-size: 14px; color: #64748b; margin: 4px 0 0;">${invoice.client.company}</p>` : ""}
              ${invoice.client.address ? `<p style="font-size: 14px; color: #64748b; margin: 8px 0 0; white-space: pre-line;">${invoice.client.address}</p>` : ""}
              ${invoice.client.email ? `<p style="font-size: 14px; color: #64748b; margin: 4px 0 0;">${invoice.client.email}</p>` : ""}
            `
                : `<p style="font-size: 14px; color: #94a3b8; margin: 12px 0 0;">No client selected</p>`
            }
          </div>
          <!-- Dates Card -->
          <div style="width: 200px; background: #f8fafc; border-radius: 12px; padding: 24px;">
            <div style="margin-bottom: 20px;">
              <p style="font-size: 11px; font-weight: 600; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">Issue Date</p>
              <p style="font-size: 16px; font-weight: 500; color: #1e293b; margin: 8px 0 0;">${formatDateForPdf(invoice.issueDate)}</p>
            </div>
            ${
              invoice.dueDate
                ? `
              <div>
                <p style="font-size: 11px; font-weight: 600; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">Due Date</p>
                <p style="font-size: 16px; font-weight: 500; color: #1e293b; margin: 8px 0 0;">${formatDateForPdf(invoice.dueDate)}</p>
              </div>
            `
                : ""
            }
          </div>
        </div>

        <!-- Items Table -->
        <div style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #1e293b;">
                <th style="padding: 16px 20px; text-align: left; font-size: 12px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 1px;">Description</th>
                <th style="width: 80px; padding: 16px 20px; text-align: center; font-size: 12px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                <th style="width: 120px; padding: 16px 20px; text-align: right; font-size: 12px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 1px;">Rate</th>
                <th style="width: 120px; padding: 16px 20px; text-align: right; font-size: 12px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-top: 32px;">
          <div style="width: 300px; background: #f8fafc; border-radius: 12px; padding: 24px;">
            ${
              invoice.subtotal
                ? `
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px;">
                <span style="color: #64748b;">Subtotal</span>
                <span style="font-weight: 500; color: #1e293b;">$${parseFloat(invoice.subtotal).toFixed(2)}</span>
              </div>
            `
                : ""
            }
            ${
              invoice.taxRate && parseFloat(invoice.taxRate) > 0
                ? `
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px;">
                <span style="color: #64748b;">Tax (${invoice.taxRate}%)</span>
                <span style="font-weight: 500; color: #1e293b;">$${parseFloat(invoice.taxAmount || "0").toFixed(2)}</span>
              </div>
            `
                : ""
            }
            <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 2px solid ${accentColor};">
              <span style="font-weight: 700; color: #1e293b; font-size: 16px;">Total</span>
              <span style="font-size: 28px; font-weight: 700; color: ${accentColor};">$${parseFloat(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        ${
          invoice.notes
            ? `
          <div style="margin-top: 40px; padding: 24px; background: #fffbeb; border-radius: 12px; border-left: 4px solid #f59e0b;">
            <p style="font-size: 12px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Notes</p>
            <p style="margin: 12px 0 0; font-size: 14px; color: #78350f; line-height: 1.6; white-space: pre-line;">${invoice.notes}</p>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

// ============================================================================
// TEMPLATE 4: PROFESSIONAL (Advanced)
// Corporate style with structured sections, premium look
// ============================================================================
function generateProfessionalTemplate(
  invoice: InvoiceWithDetails,
  profile: Profile | null
): string {
  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 16px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6;">${item.description}</td>
        <td style="padding: 14px 16px; text-align: center; font-size: 13px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">${item.quantity}</td>
        <td style="padding: 14px 16px; text-align: right; font-size: 13px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 14px 16px; text-align: right; font-size: 13px; font-weight: 600; color: #111827; border-bottom: 1px solid #f3f4f6;">$${parseFloat(item.amount).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; width: 800px; background: white;">
      <!-- Professional Header -->
      <div style="display: flex; justify-content: space-between; padding: 40px; background: #fafafa; border-bottom: 3px solid #111827;">
        <div style="display: flex; align-items: center; gap: 20px;">
          ${profile?.logoUrl ? `<img src="${profile.logoUrl}" alt="Logo" style="max-width: 80px; max-height: 80px;" />` : ""}
          <div>
            <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0; letter-spacing: -0.5px;">${profile?.companyName || "Your Company"}</h2>
            ${profile?.address ? `<p style="margin: 6px 0 0; font-size: 12px; color: #6b7280; white-space: pre-line;">${profile.address}</p>` : ""}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; background: #111827; color: white; padding: 8px 20px; border-radius: 4px;">
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0; opacity: 0.8;">Invoice</p>
            <p style="font-size: 18px; font-weight: 700; margin: 4px 0 0;">${invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div style="padding: 40px;">
        <!-- Three Column Info Section -->
        <div style="display: flex; gap: 32px; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #e5e7eb;">
          <!-- From -->
          <div style="flex: 1;">
            <p style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">From</p>
            <div style="margin-top: 12px;">
              <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0;">${profile?.companyName || "Your Company"}</p>
              ${profile?.email ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0;">${profile.email}</p>` : ""}
              ${profile?.phone ? `<p style="font-size: 12px; color: #6b7280; margin: 2px 0 0;">${profile.phone}</p>` : ""}
            </div>
          </div>
          <!-- Bill To -->
          <div style="flex: 1;">
            <p style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">Bill To</p>
            ${
              invoice.client
                ? `
              <div style="margin-top: 12px;">
                <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0;">${invoice.client.name}</p>
                ${invoice.client.company ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0;">${invoice.client.company}</p>` : ""}
                ${invoice.client.email ? `<p style="font-size: 12px; color: #6b7280; margin: 2px 0 0;">${invoice.client.email}</p>` : ""}
                ${invoice.client.phone ? `<p style="font-size: 12px; color: #6b7280; margin: 2px 0 0;">${invoice.client.phone}</p>` : ""}
              </div>
            `
                : `<p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">No client selected</p>`
            }
          </div>
          <!-- Details -->
          <div style="width: 180px;">
            <p style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">Details</p>
            <div style="margin-top: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 11px; color: #6b7280;">Issue Date:</span>
                <span style="font-size: 12px; font-weight: 500; color: #111827;">${formatDateForPdf(invoice.issueDate)}</span>
              </div>
              ${
                invoice.dueDate
                  ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 11px; color: #6b7280;">Due Date:</span>
                  <span style="font-size: 12px; font-weight: 500; color: #111827;">${formatDateForPdf(invoice.dueDate)}</span>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 14px 16px; text-align: left; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb;">Item Description</th>
              <th style="width: 70px; padding: 14px 16px; text-align: center; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="width: 100px; padding: 14px 16px; text-align: right; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
              <th style="width: 100px; padding: 14px 16px; text-align: right; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
          <div style="width: 280px;">
            ${
              invoice.subtotal
                ? `
              <div style="display: flex; justify-content: space-between; padding: 10px 16px; font-size: 13px;">
                <span style="color: #6b7280;">Subtotal</span>
                <span style="color: #374151;">$${parseFloat(invoice.subtotal).toFixed(2)}</span>
              </div>
            `
                : ""
            }
            ${
              invoice.taxRate && parseFloat(invoice.taxRate) > 0
                ? `
              <div style="display: flex; justify-content: space-between; padding: 10px 16px; font-size: 13px;">
                <span style="color: #6b7280;">Tax (${invoice.taxRate}%)</span>
                <span style="color: #374151;">$${parseFloat(invoice.taxAmount || "0").toFixed(2)}</span>
              </div>
            `
                : ""
            }
            <div style="display: flex; justify-content: space-between; padding: 16px; background: #111827; color: white; margin-top: 8px;">
              <span style="font-weight: 600; font-size: 14px;">Amount Due</span>
              <span style="font-size: 22px; font-weight: 700;">$${parseFloat(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        ${
          invoice.notes
            ? `
          <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">Terms & Notes</p>
            <p style="margin: 12px 0 0; font-size: 12px; color: #6b7280; line-height: 1.7; white-space: pre-line;">${invoice.notes}</p>
          </div>
        `
            : ""
        }

        <!-- Footer -->
        <div style="margin-top: 64px; text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 11px; color: #9ca3af; margin: 0;">Thank you for your business</p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// TEMPLATE 5: CREATIVE (Advanced)
// Unique layout with sidebar, creative use of space
// ============================================================================
function generateCreativeTemplate(
  invoice: InvoiceWithDetails,
  profile: Profile | null
): string {
  const primaryColor = "#7c3aed"; // Purple
  const secondaryColor = "#a78bfa";

  const itemsHtml = invoice.items
    .map(
      (item) => `
      <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed #e5e7eb;">
        <div style="flex: 1;">
          <p style="font-size: 14px; color: #1f2937; margin: 0; font-weight: 500;">${item.description}</p>
          <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0;">${item.quantity} × $${parseFloat(item.unitPrice).toFixed(2)}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">$${parseFloat(item.amount).toFixed(2)}</p>
        </div>
      </div>
    `
    )
    .join("");

  return `
    <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; width: 800px; background: white; display: flex;">
      <!-- Left Sidebar -->
      <div style="width: 260px; background: linear-gradient(180deg, ${primaryColor} 0%, #5b21b6 100%); padding: 40px 30px; color: white;">
        <!-- Logo/Company -->
        <div style="margin-bottom: 40px;">
          ${profile?.logoUrl ? `<img src="${profile.logoUrl}" alt="Logo" style="max-width: 120px; max-height: 60px; margin-bottom: 16px; filter: brightness(0) invert(1);" />` : ""}
          <h2 style="font-size: 20px; font-weight: 700; margin: 0;">${profile?.companyName || "Your Company"}</h2>
        </div>

        <!-- Contact Info -->
        <div style="margin-bottom: 40px;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; margin: 0 0 12px;">Contact</p>
          ${profile?.email ? `<p style="font-size: 12px; margin: 0 0 6px; opacity: 0.9;">${profile.email}</p>` : ""}
          ${profile?.phone ? `<p style="font-size: 12px; margin: 0 0 6px; opacity: 0.9;">${profile.phone}</p>` : ""}
          ${profile?.address ? `<p style="font-size: 12px; margin: 0; opacity: 0.9; white-space: pre-line; line-height: 1.5;">${profile.address}</p>` : ""}
        </div>

        <!-- Invoice Details -->
        <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; margin: 0 0 8px;">Invoice No.</p>
          <p style="font-size: 18px; font-weight: 700; margin: 0;">${invoice.invoiceNumber}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; margin: 0 0 6px;">Issue Date</p>
          <p style="font-size: 14px; margin: 0;">${formatDateForPdf(invoice.issueDate)}</p>
        </div>

        ${
          invoice.dueDate
            ? `
          <div>
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; margin: 0 0 6px;">Due Date</p>
            <p style="font-size: 14px; margin: 0;">${formatDateForPdf(invoice.dueDate)}</p>
          </div>
        `
            : ""
        }

        <!-- Total in Sidebar -->
        <div style="margin-top: auto; padding-top: 40px;">
          <div style="background: white; color: ${primaryColor}; border-radius: 12px; padding: 20px; text-align: center;">
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px; color: #6b7280;">Total Due</p>
            <p style="font-size: 28px; font-weight: 800; margin: 0;">$${parseFloat(invoice.total).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div style="flex: 1; padding: 40px;">
        <!-- Header -->
        <div style="margin-bottom: 40px;">
          <h1 style="font-size: 48px; font-weight: 800; color: ${primaryColor}; margin: 0; letter-spacing: -2px;">INVOICE</h1>
        </div>

        <!-- Bill To -->
        <div style="margin-bottom: 40px; padding: 24px; background: #faf5ff; border-radius: 16px; border-left: 4px solid ${primaryColor};">
          <p style="font-size: 10px; font-weight: 600; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">Billed To</p>
          ${
            invoice.client
              ? `
            <p style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0;">${invoice.client.name}</p>
            ${invoice.client.company ? `<p style="font-size: 14px; color: #6b7280; margin: 6px 0 0;">${invoice.client.company}</p>` : ""}
            ${invoice.client.address ? `<p style="font-size: 14px; color: #6b7280; margin: 6px 0 0; white-space: pre-line;">${invoice.client.address}</p>` : ""}
            <div style="margin-top: 12px; display: flex; gap: 24px;">
              ${invoice.client.email ? `<p style="font-size: 13px; color: #6b7280; margin: 0;">${invoice.client.email}</p>` : ""}
              ${invoice.client.phone ? `<p style="font-size: 13px; color: #6b7280; margin: 0;">${invoice.client.phone}</p>` : ""}
            </div>
          `
              : `<p style="font-size: 14px; color: #9ca3af; margin: 0;">No client selected</p>`
          }
        </div>

        <!-- Items -->
        <div style="margin-bottom: 32px;">
          <p style="font-size: 10px; font-weight: 600; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px;">Services</p>
          ${itemsHtml}
        </div>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 260px;">
            ${
              invoice.subtotal
                ? `
              <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 14px;">
                <span style="color: #6b7280;">Subtotal</span>
                <span style="color: #374151;">$${parseFloat(invoice.subtotal).toFixed(2)}</span>
              </div>
            `
                : ""
            }
            ${
              invoice.taxRate && parseFloat(invoice.taxRate) > 0
                ? `
              <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280;">Tax (${invoice.taxRate}%)</span>
                <span style="color: #374151;">$${parseFloat(invoice.taxAmount || "0").toFixed(2)}</span>
              </div>
            `
                : ""
            }
          </div>
        </div>

        ${
          invoice.notes
            ? `
          <div style="margin-top: 48px; padding: 20px; background: #fefce8; border-radius: 12px;">
            <p style="font-size: 10px; font-weight: 600; color: #a16207; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px;">Notes</p>
            <p style="font-size: 13px; color: #713f12; line-height: 1.7; margin: 0; white-space: pre-line;">${invoice.notes}</p>
          </div>
        `
            : ""
        }

        <!-- Thank You -->
        <div style="margin-top: 40px; text-align: center;">
          <p style="font-size: 24px; font-weight: 700; color: ${secondaryColor}; margin: 0;">Thank You!</p>
          <p style="font-size: 13px; color: #9ca3af; margin: 8px 0 0;">We appreciate your business</p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// TEMPLATE SELECTOR
// ============================================================================
function generateInvoiceHtml(
  invoice: InvoiceWithDetails,
  profile: Profile | null,
  template: InvoiceTemplate = "classic"
): string {
  switch (template) {
    case "simple":
      return generateSimpleTemplate(invoice, profile);
    case "modern":
      return generateModernTemplate(invoice, profile);
    case "professional":
      return generateProfessionalTemplate(invoice, profile);
    case "creative":
      return generateCreativeTemplate(invoice, profile);
    case "classic":
    default:
      return generateClassicTemplate(invoice, profile);
  }
}

export async function downloadInvoicePdf(
  invoice: InvoiceWithDetails,
  profile: Profile | null,
  template?: InvoiceTemplate
): Promise<void> {
  // Use the template from profile if not explicitly provided
  const selectedTemplate = template || profile?.invoiceTemplate || "classic";

  // Create a temporary container for rendering
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "white";
  container.innerHTML = generateInvoiceHtml(invoice, profile, selectedTemplate);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

// Export template info for UI
export const invoiceTemplates: { id: InvoiceTemplate; name: string; description: string; category: "basic" | "advanced" }[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional, clean layout with professional styling",
    category: "basic",
  },
  {
    id: "simple",
    name: "Simple",
    description: "Minimalist design focusing on essential information",
    category: "basic",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold headers with blue accent colors and contemporary look",
    category: "advanced",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate style with structured sections and premium appearance",
    category: "advanced",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Unique sidebar layout with purple accent and creative spacing",
    category: "advanced",
  },
];
