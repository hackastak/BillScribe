import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { InvoiceWithDetails } from "@/lib/db/queries/invoices";
import type { Profile } from "@/lib/db/queries/profiles";

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

function generateInvoiceHtml(
  invoice: InvoiceWithDetails,
  profile: Profile | null
): string {
  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; font-size: 14px; color: #111827;">${item.description}</td>
        <td style="padding: 12px 16px; text-align: center; font-size: 14px; color: #4b5563;">${item.quantity}</td>
        <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #4b5563;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 500; color: #111827;">$${parseFloat(item.amount).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <div style="padding: 32px; font-family: system-ui, -apple-system, sans-serif; width: 800px; background: white;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
        <div>
          ${profile?.logoUrl ? `<img src="${profile.logoUrl}" alt="Logo" style="max-width: 200px; max-height: 100px; margin-bottom: 16px;" />` : ""}
          <h2 style="font-size: 20px; font-weight: bold; color: #111827; margin: 0;">${profile?.companyName || "Your Company"}</h2>
          ${profile?.address ? `<p style="margin: 4px 0 0; font-size: 14px; color: #4b5563; white-space: pre-line;">${profile.address}</p>` : ""}
          ${profile?.phone ? `<p style="margin: 2px 0 0; font-size: 14px; color: #4b5563;">${profile.phone}</p>` : ""}
          ${profile?.email ? `<p style="margin: 2px 0 0; font-size: 14px; color: #4b5563;">${profile.email}</p>` : ""}
        </div>
        <div style="text-align: right;">
          <h1 style="font-size: 30px; font-weight: bold; color: #111827; margin: 0;">INVOICE</h1>
          <p style="margin: 8px 0 0; font-size: 18px; font-weight: 500; color: #374151;">${invoice.invoiceNumber}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
        <div>
          <h3 style="font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Bill To</h3>
          ${
            invoice.client
              ? `
            <div style="margin-top: 8px;">
              <p style="font-weight: 500; color: #111827; margin: 0;">${invoice.client.name}</p>
              ${invoice.client.company ? `<p style="font-size: 14px; color: #4b5563; margin: 2px 0 0;">${invoice.client.company}</p>` : ""}
              ${invoice.client.address ? `<p style="font-size: 14px; color: #4b5563; margin: 2px 0 0; white-space: pre-line;">${invoice.client.address}</p>` : ""}
              ${invoice.client.email ? `<p style="font-size: 14px; color: #4b5563; margin: 2px 0 0;">${invoice.client.email}</p>` : ""}
              ${invoice.client.phone ? `<p style="font-size: 14px; color: #4b5563; margin: 2px 0 0;">${invoice.client.phone}</p>` : ""}
            </div>
          `
              : `<p style="margin-top: 8px; font-size: 14px; color: #9ca3af;">No client selected</p>`
          }
        </div>
        <div style="text-align: right;">
          <div>
            <span style="font-size: 14px; color: #6b7280;">Issue Date: </span>
            <span style="font-weight: 500; color: #111827;">${formatDateForPdf(invoice.issueDate)}</span>
          </div>
          ${
            invoice.dueDate
              ? `
            <div style="margin-top: 8px;">
              <span style="font-size: 14px; color: #6b7280;">Due Date: </span>
              <span style="font-weight: 500; color: #111827;">${formatDateForPdf(invoice.dueDate)}</span>
            </div>
          `
              : ""
          }
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 500; color: #4b5563;">Description</th>
            <th style="width: 96px; padding: 12px 16px; text-align: center; font-size: 14px; font-weight: 500; color: #4b5563;">Qty</th>
            <th style="width: 112px; padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 500; color: #4b5563;">Unit Price</th>
            <th style="width: 112px; padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 500; color: #4b5563;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
        <div style="width: 256px;">
          ${
            invoice.subtotal
              ? `
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
              <span style="color: #4b5563;">Subtotal</span>
              <span style="font-weight: 500;">$${parseFloat(invoice.subtotal).toFixed(2)}</span>
            </div>
          `
              : ""
          }
          ${
            invoice.taxRate && parseFloat(invoice.taxRate) > 0
              ? `
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
              <span style="color: #4b5563;">Tax (${invoice.taxRate}%)</span>
              <span style="font-weight: 500;">$${parseFloat(invoice.taxAmount || "0").toFixed(2)}</span>
            </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <span style="font-weight: 600; color: #111827;">Total</span>
            <span style="font-size: 20px; font-weight: bold; color: #111827;">$${parseFloat(invoice.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      ${
        invoice.notes
          ? `
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
          <h3 style="font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Notes</h3>
          <p style="margin-top: 8px; font-size: 14px; color: #4b5563; white-space: pre-line;">${invoice.notes}</p>
        </div>
      `
          : ""
      }
    </div>
  `;
}

export async function downloadInvoicePdf(
  invoice: InvoiceWithDetails,
  profile: Profile | null
): Promise<void> {
  // Create a temporary container for rendering
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "white";
  container.innerHTML = generateInvoiceHtml(invoice, profile);
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
