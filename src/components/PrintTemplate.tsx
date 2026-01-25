import { useEffect, useRef } from "react";
import type { Product } from "../types";

interface PrintTemplateProps {
  products: Product[];
  labelHeight: number; // mm
}

export function PrintTemplate({ products, labelHeight }: PrintTemplateProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>In Tem Báo Giá</title>
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
              <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                @page {
                  size: A4;
                  margin: 0;
                }
                
                body {
                  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
                  width: 100%;
                  padding: 3mm 2mm;
                  background: white;
                  color: black;
                  margin: 0;
                }
                
                .print-container {
                  width: 100%;
                  max-width: 100%;
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 0;
                  margin: 0;
                  padding: 0;
                }
                
                .label-item {
                  width: 100%;
                  height: ${labelHeight}mm;
                  border: 2px solid #000;
                  padding: 3mm;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  page-break-inside: avoid;
                  break-inside: avoid;
                  position: relative;
                  margin: 0;
                  box-sizing: border-box;
                }
                
                .label-item:nth-child(odd) {
                  border-right: 1px solid #000;
                }
                
                .label-item:nth-child(even) {
                  border-left: 1px solid #000;
                }
                
                .product-name {
                  font-size: 16pt;
                  font-weight: 700;
                  margin-bottom: 3mm;
                  line-height: 1.3;
                  text-transform: uppercase;
                  color: #000;
                  letter-spacing: 0.5px;
                }
                
                .product-info {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  margin-top: auto;
                  padding-top: 2mm;
                  border-top: 1px solid #000;
                }
                
                .product-unit {
                  font-size: 11pt;
                  color: #000;
                  font-weight: 500;
                }
                
                .product-price {
                  font-size: 18pt;
                  font-weight: 700;
                  color: #000;
                  letter-spacing: 0.5px;
                }
                
                @media print {
                  body {
                    padding: 3mm 2mm;
                    margin: 0;
                    font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
                  }
                  
                  .print-container {
                    width: 100%;
                    max-width: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0;
                  }
                  
                  .label-item {
                    page-break-inside: avoid;
                    break-inside: avoid;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    margin: 0;
                    height: ${labelHeight}mm;
                  }
                  
                  @page {
                    margin: 0;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                ${products.map((product) => {
                  const formatPrice = (price: string) => {
                    const cleaned = price.replace(/[^\d.,]/g, "").replace(",", ".");
                    const num = parseFloat(cleaned);
                    if (isNaN(num)) return price;
                    return new Intl.NumberFormat("vi-VN").format(num);
                  };
                  
                  const escapedName = product.name
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
                  
                  return `
                    <div class="label-item">
                      <div class="product-name">${escapedName}</div>
                      <div class="product-info">
                        <span class="product-unit">${product.unit}</span>
                        <span class="product-price">${formatPrice(product.price)} đ</span>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [products, labelHeight]);

  return (
    <iframe
      id="print-iframe"
      ref={iframeRef}
      style={{ 
        position: "absolute",
        width: "1px",
        height: "1px",
        border: "none",
        opacity: 0,
        pointerEvents: "none"
      }}
      title="Print Template"
    />
  );
}
