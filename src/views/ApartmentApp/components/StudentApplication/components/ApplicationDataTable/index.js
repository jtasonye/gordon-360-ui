import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@material-ui/core/';
import { DateTime } from 'luxon';

/**
 * Renders a card displaying a table of data about the current application
 * @param {Object} props The React component props
 * @param {DateTime} props.dateSubmitted The date the application was submitted
 * @param {DateTime} props.dateModified The date the application was last modified
 * @param {String} props.editorUsername The username of the application's editor
 * @returns {JSX.Element} JSX Element for the data table card
 */
const ApplicationDataTable = ({ dateSubmitted, dateModified, editorUsername, editorEmail }) => {
  function createData(label, value) {
    return { label, value };
  }

  let rows = [
    createData(
      'Last Submitted: ',
      DateTime.fromJSDate(dateSubmitted).toISODate() ?? 'Not yet submitted',
    ),
    createData('Last Modified: ', DateTime.fromJSDate(dateModified).toISODate() ?? 'Not yet saved'),
    createData('Application Editor: ', editorUsername ?? 'None'),
  ];
  if (editorUsername && editorEmail) {
    rows.push(createData('Application Editor Email:', editorEmail ?? 'Unknown'));
  }

  return (
    <Card>
      <CardHeader title="Your Application Details" className="apartment-card-header" />
      <CardContent>
        <TableContainer>
          <Table>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell component="th" scope="row">
                    {row.label}
                  </TableCell>
                  <TableCell align="right">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ApplicationDataTable;
