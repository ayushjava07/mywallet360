import ExcelJS from "exceljs";

const COLORS = {
  accent: "FF0F766E",
  accentLight: "FFE6FFFB",
  credit: "FF059669",
  debit: "FFDC2626",
  heading: "FF172554",
  muted: "FF64748B",
  rule: "FFE2E8F0",
  white: "FFFFFFFF",
};
const RAW_COLUMNS = [
  { header: "Date (UTC)", key: "date", width: 22 },
  { header: "Type", key: "type", width: 20 },
  { header: "Direction", key: "direction", width: 12 },
  { header: "Asset", key: "asset", width: 16 },
  { header: "Amount", key: "amount", width: 24 },
  { header: "From", key: "from", width: 46 },
  { header: "To", key: "to", width: 46 },
  { header: "Status", key: "status", width: 12 },
  { header: "Block", key: "blockNumber", width: 14 },
  { header: "Transaction Hash", key: "hash", width: 70 },
];

function compactAddress(address) {
  return address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "Unknown address";
}

function statementDate(value) {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return { day: value, time: "" };

  return {
    day: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(date),
    time: `${new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).format(date)} UTC`,
  };
}

function styleTableHeader(row) {
  row.font = { bold: true, color: { argb: COLORS.heading } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  row.alignment = { vertical: "middle" };
  row.height = 25;
  row.eachCell((cell) => {
    cell.border = { bottom: { style: "medium", color: { argb: COLORS.rule } } };
  });
}

function addStatementSheet(workbook, report) {
  const sheet = workbook.addWorksheet("Transaction Statement", {
    views: [{ state: "frozen", ySplit: 5 }],
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
      margins: { left: 0.3, right: 0.3, top: 0.45, bottom: 0.45, header: 0.2, footer: 0.2 },
    },
  });
  sheet.columns = [
    { key: "date", width: 19 },
    { key: "details", width: 38 },
    { key: "detailsExtra", width: 28 },
    { key: "type", width: 15 },
    { key: "amount", width: 24 },
  ];
  sheet.mergeCells("A1:A3");
  sheet.getCell("A1").value = "360";
  sheet.getCell("A1").font = { bold: true, size: 20, color: { argb: COLORS.white } };
  sheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.accent } };

  sheet.mergeCells("B1:E1");
  sheet.getCell("B1").value = `Transaction Statement for ${compactAddress(report.address)}`;
  sheet.getCell("B1").font = { bold: true, size: 18, color: { argb: COLORS.heading } };
  sheet.getCell("B1").alignment = { vertical: "bottom" };
  sheet.mergeCells("B2:E2");
  sheet.getCell("B2").value = `${report.from} - ${report.to}  |  ${report.transactions.length} transactions`;
  sheet.getCell("B2").font = { size: 11, color: { argb: COLORS.muted } };
  sheet.mergeCells("B3:E3");
  sheet.getCell("B3").value = report.complete
    ? "Source: BlockAction (BlobLens) | Scan completed"
    : "Source: BlockAction (BlobLens) | Partial report: pagination limit reached";
  sheet.getCell("B3").font = { size: 9, italic: true, color: { argb: report.complete ? COLORS.muted : COLORS.debit } };
  sheet.getRow(1).height = 28;
  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 18;

  sheet.mergeCells("B5:C5");
  sheet.getCell("A5").value = "Date";
  sheet.getCell("B5").value = "Transaction Details";
  sheet.getCell("D5").value = "Type";
  sheet.getCell("E5").value = "Amount";
  styleTableHeader(sheet.getRow(5));

  report.transactions.forEach((transaction, index) => {
    const rowNumber = 6 + index;
    const row = sheet.getRow(rowNumber);
    const date = statementDate(transaction.date);
    const receive = transaction.direction === "receive";
    const counterparty = receive ? transaction.from : transaction.to;
    const color = receive ? COLORS.credit : COLORS.debit;

    sheet.mergeCells(`B${rowNumber}:C${rowNumber}`);
    row.getCell(1).value = {
      richText: [
        { font: { bold: true, size: 10, color: { argb: COLORS.heading } }, text: date.day },
        { font: { size: 9, color: { argb: COLORS.muted } }, text: `\n${date.time}` },
      ],
    };
    row.getCell(2).value = {
      richText: [
        { font: { bold: true, size: 10, color: { argb: COLORS.heading } }, text: `${receive ? "Received from" : "Sent to"} ${compactAddress(counterparty)}` },
        { font: { size: 9, color: { argb: COLORS.muted } }, text: `\n${transaction.type} | ${transaction.status}` },
        { font: { size: 8, color: { argb: COLORS.muted } }, text: `\nTxn: ${transaction.hash}\nBlock: ${transaction.blockNumber}` },
      ],
    };
    row.getCell(4).value = receive ? "CREDIT" : "DEBIT";
    row.getCell(4).font = { bold: true, size: 10, color: { argb: color } };
    row.getCell(5).value = `${receive ? "+" : "-"}${transaction.amount} ${transaction.asset}`;
    row.getCell(5).font = { bold: true, size: 11, color: { argb: color } };
    row.height = 72;
    row.alignment = { vertical: "top", wrapText: true };
    row.eachCell((cell) => {
      cell.border = { bottom: { style: "thin", color: { argb: COLORS.rule } } };
    });
    if (index % 2 === 1) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    }
  });

  sheet.headerFooter.oddFooter = "MyWallet360 transaction statement | Page &P of &N";
  sheet.autoFilter = { from: "A5", to: "E5" };
}

function addRawDataSheet(workbook, report) {
  const sheet = workbook.addWorksheet("Raw Data", {
    views: [{ state: "frozen", ySplit: 1 }],
    autoFilter: { from: "A1", to: "J1" },
  });
  sheet.columns = RAW_COLUMNS;
  sheet.addRows(report.transactions);
  styleTableHeader(sheet.getRow(1));
  sheet.getColumn("blockNumber").numFmt = "0";
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 1) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.accentLight } };
    }
    row.alignment = { vertical: "top" };
  });
}

export async function createTransactionWorkbook(report) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MyWallet360";
  workbook.created = new Date();

  addStatementSheet(workbook, report);
  addRawDataSheet(workbook, report);

  return workbook.xlsx.writeBuffer();
}
