export const SAMPLE_HTML_REPORT = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif;
      color: #0f172a;
      line-height: 1.65;
      margin: 0;
      padding: 0;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title {
      font-size: 26px;
      font-weight: 700;
      margin: 0;
      color: #0f172a;
    }
    .subtitle {
      font-size: 13px;
      color: #475569;
      margin-top: 4px;
    }
    .meta {
      text-align: right;
      font-size: 12px;
      color: #475569;
    }
    .summary-grid {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-box {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 14px;
      background: #f8fafc;
    }
    .summary-label {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .summary-value {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e1;
      font-weight: 600;
      color: #1e293b;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .num {
      text-align: right;
      font-family: monospace;
    }
    .total-row td {
      font-weight: 700;
      color: #0f172a;
      border-top: 2px solid #0f172a;
      background: #f8fafc;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin: 24px 0 8px 0;
      color: #0f172a;
    }
    .note {
      font-size: 13px;
      color: #475569;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 16px;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">মাসিক বিক্রয় ও বিলিং রিপোর্ট</h1>
      <div class="subtitle">Monthly Billing &amp; Operations Summary — Dhaka Central Unit</div>
    </div>
    <div class="meta">
      <div><strong>Invoice #:</strong> INV-2026-1120</div>
      <div><strong>Date:</strong> 20 November 2026</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-box">
      <div class="summary-label">মোট অর্ডার (Total Orders)</div>
      <div class="summary-value">1,482</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">সফল ডেলিভারি (Fulfilled)</div>
      <div class="summary-value">98.6%</div>
    </div>
    <div class="summary-box">
      <div class="summary-label">মোট আয় (Net Revenue)</div>
      <div class="summary-value">৳ 14,85,200</div>
    </div>
  </div>

  <h2 class="section-title">বিভাগভিত্তিক হিসাব (Line Item Breakdown)</h2>
  <table>
    <thead>
      <tr>
        <th>কোড</th>
        <th>বিবরণ (Description)</th>
        <th class="num">পরিমাণ</th>
        <th class="num">একক মূল্য</th>
        <th class="num">মোট (BDT)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>PRD-01</td>
        <td>এন্টারপ্রাইজ ক্লাউড হোস্টিং প্যাকেজ</td>
        <td class="num">12</td>
        <td class="num">45,000</td>
        <td class="num">5,40,000</td>
      </tr>
      <tr>
        <td>PRD-02</td>
        <td>অটোমেটেড ডকুমেন্ট প্রসেসিং স্যুট</td>
        <td class="num">8</td>
        <td class="num">62,500</td>
        <td class="num">5,00,000</td>
      </tr>
      <tr>
        <td>PRD-03</td>
        <td>ডেডিকেটেড সাপোর্ট ও মেইনটেন্যান্স</td>
        <td class="num">15</td>
        <td class="num">18,000</td>
        <td class="num">2,70,000</td>
      </tr>
      <tr>
        <td>PRD-04</td>
        <td>সিকিউরিটি অডিট ও ব্যাকআপ সার্ভিস</td>
        <td class="num">7</td>
        <td class="num">25,028</td>
        <td class="num">1,75,200</td>
      </tr>
      <tr class="total-row">
        <td colspan="4">সর্বমোট প্রদেয় (Grand Total)</td>
        <td class="num">৳ 14,85,200</td>
      </tr>
    </tbody>
  </table>

  <h2 class="section-title">অপারেশনাল পর্যবেক্ষণ ও পরবর্তী পদক্ষেপ</h2>
  <p>
    চলতি মাসে সকল বিভাগ নির্ধারিত সময়ের আগেই ডেলিভারি লক্ষ্যমাত্রা অর্জন করেছে। স্বয়ংক্রিয় ডকুমেন্ট
    প্রসেসিং ব্যবহারের ফলে প্রতিটি চালান ও রিপোর্ট কয়েক সেকেন্ডের মধ্যে PDF এবং হাই-রেজোলিউশন ছবিতে
    রূপান্তর করে সংরক্ষণ করা সম্ভব হয়েছে।
  </p>
  <p>
    আগামী প্রান্তিকে আরও বড় আকারের ডেটা রিপোর্ট ও ব্যাচ ইনভয়েস প্রক্রিয়াকরণের জন্য একই দ্রুতগতির
    ওয়ার্কফ্লো চালু রাখা হবে। কোনো অতিরিক্ত লগইন বা জটিল সেটআপ ছাড়াই টিমের যেকোনো সদস্য সরাসরি
    HTML ফাইল আপলোড করে তাৎক্ষণিক ZIP আর্কাইভ সংগ্রহ করতে পারবেন।
  </p>

  <div class="note">
    <strong>দ্রষ্টব্য (Note):</strong> এই রিপোর্টটি সরাসরি HTML থেকে স্বয়ংক্রিয়ভাবে PDF ও ছবিতে রূপান্তরিত হয়েছে।
    যেকোনো হিসাব সংক্রান্ত তথ্যের জন্য অ্যাকাউন্টস বিভাগে যোগাযোগ করুন।
  </div>
</body>
</html>`;

/**
 * Generates a realistic 100,000+ character bilingual document so users can verify
 * high-speed massive text conversion right in the browser.
 */
export function generateMassiveSampleText(targetChars = 105_000): string {
  const paragraphs = [
    'আধুনিক ডিজিটাল প্রকাশনা ও ডেটা আর্কাইভিং ব্যবস্থায় বিশাল পরিমাণ টেক্সট এবং HTML ডকুমেন্টকে দ্রুত PDF এবং পৃথক পেজ ছবিতে রূপান্তর করা অত্যন্ত গুরুত্বপূর্ণ। দীর্ঘ প্রতিবেদন, নথি, বইয়ের পাণ্ডুলিপি, আইনি দলিল অথবা লক্ষাধিক অক্ষরের ডেটা লগ একসাথে প্রসেস করার জন্য দ্রুতগতির পেজিনেশন ও হাই-স্পিড রেন্ডারিং প্রয়োজন।',
    'High-throughput document pipelines process hundreds of thousands of characters into crisp, paginated printable layouts without blocking the user interface. Every page maintains balanced margins, clean typography, consistent line height, and automatic page numbering before being bundled into a downloadable PDF and an instant image ZIP archive.',
    'ব্যবহারকারীরা কোনো অ্যাকাউন্ট তৈরি বা লগইন করা ছাড়াই সরাসরি পোর্টালে ফাইল ড্রপ বা বিশাল টেক্সট পেস্ট করে মুহূর্তের মধ্যেই সম্পূর্ণ ছবি-প্যাকড ZIP ফাইল সংগ্রহ করতে পারেন। প্রতিটি পেজ স্পষ্ট রেজোলিউশনে সংরক্ষিত হয় এবং অটোমেটিক ডাউনলোড চালু থাকায় আলাদা কোনো বাটনে চাপ দেওয়ার প্রয়োজন হয় না।',
    'Structured pagination ensures that long continuous paragraphs wrap cleanly across line boundaries and never clip text between adjacent pages. By packing PNG, JPEG, or WebP images using zero-overhead ZIP storage alongside a standards-compliant multi-page PDF binary, total conversion latency stays remarkably low even for large multi-dozen page batches.',
  ];

  const chunks: string[] = [
    'বৃহৎ টেক্সট হাই-স্পিড কনভার্সন রিপোর্ট (100,000+ Characters Stress Test)',
    '====================================================================',
    '',
  ];

  let totalLength = chunks.join('\n').length;
  let sectionIndex = 1;

  while (totalLength < targetChars) {
    const header = `\nঅধ্যায় ${sectionIndex} — ডকুমেন্ট সেকশন ও বিশ্লেষণ (Section #${sectionIndex})`;
    const p1 = paragraphs[(sectionIndex - 1) % paragraphs.length];
    const p2 = paragraphs[sectionIndex % paragraphs.length];
    const block = `${header}\n${p1}\n${p2}\n`;
    chunks.push(block);
    totalLength += block.length;
    sectionIndex++;
  }

  return chunks.join('\n');
}
