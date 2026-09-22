/**
 * Reusable utility to export JSON tabular data to CSV and trigger browser download
 */
export const exportToCsv = (filename, rows, headers) => {
  if (!rows || !rows.length) {
    alert('No records available to export.');
    return;
  }

  // Determine headers if not explicitly passed
  const keys = headers ? headers.map((h) => h.key) : Object.keys(rows[0]);
  const labels = headers ? headers.map((h) => h.label) : keys;

  const csvContent = [
    // Header row
    labels.map((lbl) => `"${String(lbl).replace(/"/g, '""')}"`).join(','),
    // Data rows
    ...rows.map((row) =>
      keys
        .map((key) => {
          let val = row[key];
          if (val === undefined || val === null) val = '';
          if (typeof val === 'object') val = JSON.stringify(val);
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
