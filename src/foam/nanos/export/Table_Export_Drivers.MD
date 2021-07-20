#TableExportDriver
TableExportDriver is a driver we use to query data with projection and output it with TableColumnOutputter.

#TableColumnOutputter
TableColumnOutputter returns String array for array of values. With such arrays of Strings work CSVTableExportDriver.
TableColumnOutputter is extended by GoogleSheetsOutputter and used to output values for GoogleSheets export

#GoogleSheetsBasedExportDriver
Retrieves data with projection and gathers all information that's necesary to populate, format Google Sheets and calls googleSheetsDataExport service to do that.
Both GoogleSheetsExportDriver and PDFGoogleSheetsExportDriver extend GoogleSheetsBasedExportDriver.
They do not do much other then that except for returning link to google sheet that was created and populated with data.
