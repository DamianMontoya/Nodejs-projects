import fs from 'fs';
const data = JSON.parse(fs.readFileSync('response.html', 'utf8'));

const extractedData = data.map(item => {
  return { id: item.id, nombre: item.nombre };
});

const filteredData = extractedData.map(item => ({
  id: item.id.replace(/^id/, ''),
  nombre: item.nombre
}));

fs.writeFileSync('extractedData.json', JSON.stringify(filteredData, null, 2), 'utf8');

