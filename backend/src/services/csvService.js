const { Parser } = require('json2csv');

/**
 * Flatten JSON fields for CSV export
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (value === null || value === undefined) {
      flattened[newKey] = '';
    } else if (Array.isArray(value)) {
      // Convert arrays to pipe-separated values
      flattened[newKey] = value
        .map((item) => {
          if (typeof item === 'object') {
            return Object.values(item).join('|');
          }
          return item;
        })
        .join('; ');
    } else if (typeof value === 'object') {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
}

/**
 * Convert single application to CSV format
 */
function applicationToCsv(application) {
  const data = { ...application };

  // Parse JSON fields
  if (typeof data.keluarga_inti === 'string') {
    data.keluarga_inti = JSON.parse(data.keluarga_inti || '[]');
  }
  if (typeof data.keluarga_asal === 'string') {
    data.keluarga_asal = JSON.parse(data.keluarga_asal || '[]');
  }
  if (typeof data.pendidikan === 'string') {
    data.pendidikan = JSON.parse(data.pendidikan || '[]');
  }
  if (typeof data.bahasa === 'string') {
    data.bahasa = JSON.parse(data.bahasa || '[]');
  }
  if (typeof data.pekerjaan === 'string') {
    data.pekerjaan = JSON.parse(data.pekerjaan || '[]');
  }
  if (typeof data.referensi === 'string') {
    data.referensi = JSON.parse(data.referensi || '[]');
  }
  if (typeof data.aktivitas_sosial === 'string') {
    data.aktivitas_sosial = JSON.parse(data.aktivitas_sosial || '[]');
  }

  // Flatten for CSV
  return flattenObject(data);
}

/**
 * Generate CSV string for single application
 */
function generateCsvString(application) {
  const flatData = applicationToCsv(application);
  const fields = Object.keys(flatData);
  const data = [flatData];

  const json2csvParser = new Parser({ fields });
  const csvContent = json2csvParser.parse(data);

  // Add UTF-8 BOM for proper Excel encoding
  return '\ufeff' + csvContent;
}

/**
 * Generate CSV string for multiple applications
 */
function generateBulkCsvString(applications) {
  if (!applications || applications.length === 0) {
    return '\ufeff'; // Just BOM
  }

  const flatData = applications.map(applicationToCsv);
  const fields = flatData.length > 0 ? Object.keys(flatData[0]) : [];

  const json2csvParser = new Parser({ fields });
  const csvContent = json2csvParser.parse(flatData);

  // Add UTF-8 BOM for proper Excel encoding
  return '\ufeff' + csvContent;
}

module.exports = {
  generateCsvString,
  generateBulkCsvString,
  applicationToCsv,
};
