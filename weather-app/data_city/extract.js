const fs = require('fs');
const data = JSON.parse(fs.readFileSync('response.html', 'utf8'));

const extractedData = data.map(item => {
  return { id: item.id, nombre: item.nombre };
});

fs.writeFileSync('extractedData.json', JSON.stringify(extractedData, null, 2), 'utf8');
