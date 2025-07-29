const fs = require('fs');
const { THRESHOLDS } = require('./threslholdConfig');

const lines = fs.readFileSync('full-result.json', 'utf-8').trim().split('\n');
const data = lines.map(line => JSON.parse(line)).filter(d => d.type === 'Point' && d.data.tags?.scenario);

const grouped = {};
const checks = {};

data.forEach(entry => {
  const scenario = entry.data.tags.scenario;
  const metric = entry.metric;
  const value = entry.data.value;

  if (metric === 'checks') {
    const checkName = entry.data.tags.check || 'unknown';
    if (!checks[scenario]) checks[scenario] = { passed: 0, failed: 0, names: new Set() };
    if (value === 1) {
      checks[scenario].passed += 1;
    } else {
      checks[scenario].failed += 1;
    }
    checks[scenario].names.add(checkName);
  } else {
    if (!grouped[scenario]) grouped[scenario] = {};
    if (!grouped[scenario][metric]) grouped[scenario][metric] = [];
    grouped[scenario][metric].push(value);
  }
});

function calcularStats(valores) {
  const n = valores.length;
  const promedio = valores.reduce((a, b) => a + b, 0) / n;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const std = Math.sqrt(valores.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / n);
  return { promedio, min, max, std, n };
}

function formatScenarioName(name) {
  if (name === 'tps_50') return '50 TPS';
  if (name === 'tps_100') return '100 TPS';
  return name;
}

let htmlBody = '';

Object.keys(grouped).forEach(scenario => {
  const metrics = grouped[scenario];
  const checkData = checks[scenario] || { passed: 0, failed: 0, names: new Set() };

  htmlBody += `<section>
    <h2>Escenario: ${formatScenarioName(scenario)}</h2>
    <h3>Estado de verificaciones:</h3>
    <ul>
     <li><strong>Checks ejecutados:</strong> ${Array.from(checkData.names).join(', ')}</li>
      <li><strong>Exitosos:</strong> ${checkData.passed}</li>
      <li><strong>Fallidos:</strong> ${checkData.failed}</li>
    </ul>`;

  htmlBody += `<h3>Resumen de métricas:</h3>
    <table>
      <thead>
        <tr>
          <th>Métrica</th>
          <th>Promedio</th>
          <th>Mínimo</th>
          <th>Máximo</th>
          <th>Max. Aceptable</th>
          <th>Conclusión</th>
        </tr>
      </thead>
      <tbody>`;

  const metricsToShow = ['http_req_duration', 'http_req_waiting', 'http_req_receiving'];
  for (const metric in metrics) {
    if (metricsToShow.includes(metric)) {
      const stats = calcularStats(metrics[metric]);
      let maxValue = 0;
      let customMetricName ='';
      if (metric === 'http_req_duration') {
        maxValue = THRESHOLDS.max_total_request_duration_ms;
        customMetricName = 'Duracion Total de Solicitud';
      }
      if (metric === 'http_req_waiting') {
        maxValue = THRESHOLDS.max_waiting_time_server_response_ms;
        customMetricName = 'Tiempo de espera de respuesta del servidor';
      }
      if (metric === 'http_req_receiving') {
        maxValue = THRESHOLDS.max_receiving_response_time_ms;
        customMetricName = 'Tiempo de recepción de la respuesta';
      }
      const conclusion = stats.promedio > maxValue ? 'No aceptable' : 'Aceptable';

      htmlBody += `<tr>
        <td>${customMetricName}</td>
        <td>${stats.promedio.toFixed(2)}</td>
        <td>${stats.min.toFixed(2)}</td>
        <td>${stats.max.toFixed(2)}</td>
        <td>${maxValue}</td>
        <td>${conclusion}</td>
      </tr>`;
    }
  }

  htmlBody += `</tbody></table><hr></section>`;
});

const finalHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte por Escenario - K6</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f8f8f8; }
    h1 { color: #333; }
    section { margin-bottom: 40px; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Reporte de Rendimiento por Escenario (K6)</h1>
  ${htmlBody}
</body>
</html>
`;

fs.writeFileSync('performance_test_summary.html', finalHTML, 'utf-8');
console.log('Report generated : performance_test_summary.html');