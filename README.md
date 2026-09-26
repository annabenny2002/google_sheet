# Issue Tracker ↔ Closed Issues Sync

A Google Apps Script that automatically manages issues between an **Issue Tracker** sheet and a **Closed_Issues** sheet based on the issue status.

## What This Script Does

The script keeps two sheets synchronized:

* **Issue Tracker** – contains active and ongoing issues.
* **Closed_Issues** – stores issues whose status is marked as `Closed`.

### Automatic Issue Movement

* When an issue's **Status** is `Closed` in **Issue Tracker**, the row is moved to **Closed_Issues**.
* If a closed issue is reopened by changing its **Status** to anything other than `Closed`, the row is moved back to **Issue Tracker**.
* Blank rows are ignored.
* The header row from **Issue Tracker** is automatically added to **Closed_Issues** if the latter is empty.

## Features

* Custom **Issue Sync** menu in Google Sheets.
* Option to run the sync using a spreadsheet button.
* Automatically detects the `Status` column.
* Handles both closed and reopened issues.
* Displays a notification showing the number of closed and reopened issues after synchronization.

## Sheet Structure

### Issue Tracker

The column headers are expected to be on **Row 4**.

The sheet must contain a column named:

```text
Status
```

Example:

| Issue ID | Description  | Assigned To | Status |
| -------- | ------------ | ----------- | ------ |
| 001      | Login issue  | John        | Open   |
| 002      | Report error | Alex        | Closed |

### Closed_Issues

The header is stored in **Row 1**.

Closed issues are stored below the header.

## How to Set Up

1. Open your Google Spreadsheet.
2. Go to **Extensions → Apps Script**.
3. Add the script to the Apps Script project.
4. Make sure the spreadsheet contains these two sheets:

   * `Issue Tracker`
   * `Closed_Issues`
5. Make sure the `Issue Tracker` sheet has its headers in **Row 4**.
6. Make sure one of the headers is named `Status`.
7. Save the script.
8. Reload the Google Spreadsheet.

After reloading, an **Issue Sync** menu will appear.

## How to Run

### Using the Custom Menu

Go to:

**Issue Sync → Sync Closed/Reopened Issues**

### Using a Button

A Google Sheets drawing/button can also be assigned to:

```text
runIssueSync
```

Clicking the button will run the synchronization.

## Example Workflow

### Closing an Issue

If an issue in `Issue Tracker` has:

```text
Status = Closed
```

After running the sync, the issue will be moved to:

```text
Closed_Issues
```

### Reopening an Issue

If an issue in `Closed_Issues` has its status changed from:

```text
Closed
```

to:

```text
Open
```

or another non-closed status, the issue will be moved back to:

```text
Issue Tracker
```

## Configuration

The main settings can be changed at the beginning of the script:

```javascript
const TRACKER_SHEET_NAME = 'Issue Tracker';
const CLOSED_SHEET_NAME = 'Closed_Issues';
const HEADER_ROW = 4;
const STATUS_COLUMN_NAME = 'Status';
const CLOSED_STATUS_VALUE = 'Closed';
```

These values can be modified if the spreadsheet structure changes.

## Technologies Used

* Google Apps Script
* JavaScript
* Google Sheets

## Purpose

This automation helps reduce manual movement of issues between active and closed issue sheets and keeps issue tracking more organized.
