import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { createTransactionWorkbook } from "./reportmaker.js";

test("creates a statement-style Excel report with raw exact amounts", async () => {
  const buffer = await createTransactionWorkbook({
    address: "0x742d35cc6634c0532925a3b844bc454e4438f44e",
    from: "2026-06-01",
    to: "2026-06-11",
    generatedAt: "2026-06-11T00:00:00.000Z",
    complete: true,
    transactions: [{
      date: "2026-06-10 12:00:00",
      type: "ERC-20 transfer",
      direction: "receive",
      asset: "USDC",
      amount: "123456789012345678.123456",
      from: "0xfrom",
      to: "0xto",
      status: "success",
      blockNumber: 123,
      hash: "0xhash",
    }],
  });
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  assert.equal(workbook.getWorksheet("Transaction Statement").getCell("B1").value, "Transaction Statement for 0x742d35...38f44e");
  assert.equal(workbook.getWorksheet("Transaction Statement").getCell("B3").value, "Source: BlockAction (BlobLens) | Scan completed");
  assert.equal(workbook.getWorksheet("Transaction Statement").getCell("D6").value, "CREDIT");
  assert.equal(workbook.getWorksheet("Transaction Statement").getCell("E6").value, "+123456789012345678.123456 USDC");
  assert.equal(workbook.getWorksheet("Raw Data").getCell("E2").value, "123456789012345678.123456");
});
