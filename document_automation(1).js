/**
 * Issue Tracker <-> Closed_Issues sync
 *
 * - Moves rows with Status = "Closed" from "Issue Tracker" to "Closed_Issues"
 * - Moves rows that are reopened (Status != "Closed") from "Closed_Issues"
 *   back to "Issue Tracker"
 * - Run via the custom menu ("Issue Sync" > "Sync Closed/Reopened Issues")
 *   or via a sheet button assigned to runIssueSync()
 */

const TRACKER_SHEET_NAME = 'Issue Tracker';
const CLOSED_SHEET_NAME = 'Closed_Issues';
const HEADER_ROW = 4;              // row containing column titles in Issue Tracker
const STATUS_COLUMN_NAME = 'Status';
const CLOSED_STATUS_VALUE = 'Closed';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Issue Sync')
    .addItem('Sync Closed/Reopened Issues', 'runIssueSync')
    .addToUi();
}

/** Entry point — call this from a button or the menu. */
function runIssueSync() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const trackerSheet = ss.getSheetByName(TRACKER_SHEET_NAME);
  const closedSheet = ss.getSheetByName(CLOSED_SHEET_NAME);

  if (!trackerSheet || !closedSheet) {
    SpreadsheetApp.getUi().alert(
      'Could not find "' + TRACKER_SHEET_NAME + '" or "' + CLOSED_SHEET_NAME + '" sheet.'
    );
    return;
  }

  const headers = ensureClosedSheetHeaders(trackerSheet, closedSheet);
  const numCols = headers.length;
  const statusColIdx = findStatusColIndex(headers);

  const closedCount = moveClosedToClosedSheet(trackerSheet, closedSheet, statusColIdx, numCols);
  const reopenedCount = moveReopenedToTracker(trackerSheet, closedSheet, statusColIdx, numCols);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    closedCount + ' closed, ' + reopenedCount + ' reopened.', 'Issue sync complete', 5
  );
}

function getHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  return sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0];
}

function findStatusColIndex(headers) {
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim().toLowerCase() === STATUS_COLUMN_NAME.toLowerCase()) {
      return i;
    }
  }
  throw new Error('Could not find a "' + STATUS_COLUMN_NAME + '" column in ' + TRACKER_SHEET_NAME);
}

/** Copies the tracker's header row into Closed_Issues (row 1) if it's empty. */
function ensureClosedSheetHeaders(trackerSheet, closedSheet) {
  const headers = getHeaders(trackerSheet);
  const existing = closedSheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const isEmpty = existing.every(v => v === '' || v === null);
  if (isEmpty) {
    const target = closedSheet.getRange(1, 1, 1, headers.length);
    target.setValues([headers]);
    target.setFontWeight('bold');
    closedSheet.setFrozenRows(1);
  }
  return headers;
}

function isBlankRow(row) {
  return row.every(v => v === '' || v === null);
}

/** Moves Closed rows out of Issue Tracker into Closed_Issues. Returns count moved. */
function moveClosedToClosedSheet(trackerSheet, closedSheet, statusColIdx, numCols) {
  const lastRow = trackerSheet.getLastRow();
  if (lastRow < HEADER_ROW + 1) return 0;

  const dataRange = trackerSheet.getRange(HEADER_ROW + 1, 1, lastRow - HEADER_ROW, numCols);
  const data = dataRange.getValues();

  const rowsToMove = [];
  const rowsToKeep = [];

  data.forEach(row => {
    if (isBlankRow(row)) return;
    const status = String(row[statusColIdx]).trim().toLowerCase();
    if (status === CLOSED_STATUS_VALUE.toLowerCase()) {
      rowsToMove.push(row);
    } else {
      rowsToKeep.push(row);
    }
  });

  if (rowsToMove.length > 0) {
    closedSheet.getRange(closedSheet.getLastRow() + 1, 1, rowsToMove.length, numCols)
      .setValues(rowsToMove);
  }

  dataRange.clearContent();
  if (rowsToKeep.length > 0) {
    trackerSheet.getRange(HEADER_ROW + 1, 1, rowsToKeep.length, numCols).setValues(rowsToKeep);
  }

  return rowsToMove.length;
}

/** Moves reopened rows out of Closed_Issues back into Issue Tracker. Returns count moved. */
function moveReopenedToTracker(trackerSheet, closedSheet, statusColIdx, numCols) {
  const lastRow = closedSheet.getLastRow();
  if (lastRow < 2) return 0; // header only, no data

  const dataRange = closedSheet.getRange(2, 1, lastRow - 1, numCols);
  const data = dataRange.getValues();

  const rowsToMove = [];
  const rowsToKeep = [];

  data.forEach(row => {
    if (isBlankRow(row)) return;
    const status = String(row[statusColIdx]).trim().toLowerCase();
    if (status !== CLOSED_STATUS_VALUE.toLowerCase()) {
      rowsToMove.push(row);
    } else {
      rowsToKeep.push(row);
    }
  });

  if (rowsToMove.length > 0) {
    const trackerLastRow = Math.max(trackerSheet.getLastRow(), HEADER_ROW);
    trackerSheet.getRange(trackerLastRow + 1, 1, rowsToMove.length, numCols).setValues(rowsToMove);
  }

  dataRange.clearContent();
  if (rowsToKeep.length > 0) {
    closedSheet.getRange(2, 1, rowsToKeep.length, numCols).setValues(rowsToKeep);
  }

  return rowsToMove.length;
}
