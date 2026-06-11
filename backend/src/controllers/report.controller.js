import { isAddress } from "ethers";
import { HttpError } from "../middleware/error.middleware.js";
import { getTransactionReportData } from "../services/etherscan.service.js";
import { createTransactionWorkbook } from "../services/reportmaker.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_REPORT_DAYS = 366;

function parseDate(value) {
  if (!DATE_PATTERN.test(String(value || ""))) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export const downloadTransactionReport = async (req, res, next) => {
  const { address } = req.params;
  const fromDate = parseDate(req.query.from);
  const toDate = parseDate(req.query.to);

  if (!isAddress(address)) {
    next(new HttpError(400, "INVALID_WALLET_ADDRESS", "Enter a valid Ethereum wallet address."));
    return;
  }

  if (!fromDate || !toDate || fromDate > toDate) {
    next(new HttpError(400, "INVALID_REPORT_DATES", "Choose a valid start and end date."));
    return;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (toDate > today) {
    next(new HttpError(400, "FUTURE_REPORT_DATE", "The report end date cannot be in the future."));
    return;
  }

  const reportDays = Math.floor((toDate - fromDate) / 86_400_000) + 1;
  if (reportDays > MAX_REPORT_DAYS) {
    next(new HttpError(400, "REPORT_RANGE_TOO_LARGE", `Choose a date range of ${MAX_REPORT_DAYS} days or less.`));
    return;
  }

  try {
    const report = await getTransactionReportData(address, req.query.from, req.query.to);
    const workbook = await createTransactionWorkbook(report);
    const filename = `mywallet360-${address.slice(0, 8)}-${req.query.from}-to-${req.query.to}.xlsx`;

    res.set({
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    res.send(Buffer.from(workbook));
  } catch (error) {
    next(error);
  }
};
