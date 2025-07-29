# QA Automation Performance - Challenge (Sergio Silva)

#  Description
This project uses [K6](https://k6.io/) with JavaScript to perform performance testing on HTTP https://dummyjson.com/products/add, measuring key performance metrics such as request duration, server response time, and data receiving time.

# Requirements
- Node.js (v18 or higher) 
- npm (comes with Node.js)
- [k6] (https://grafana.com/docs/k6/latest/set-up/install-k6/) installed globally according to current Operating System.
``` bash
# Example : K6 installation for Windows (using Chocolatey package manager)
choco install k6
```

# Configuration
- Execution parameters are defined inside products-performance-test.js file and can be editted if needed. 
``` bash
BASE_URL = 'https://dummyjson.com';
USERNAME = 'emilys';
PASSWORD = 'emilyspass';
TPS_50_DURATION = '5s';
TPS_100_DURATION = '5s';
```

- Report generation supports custom acceptable value for response metrics inside threslholdConfig.js file can be editted if needed.
``` bash
max_total_request_duration_ms # Acceptable time to complete the entire HTTP request (includes connection, waiting, and response)
max_waiting_time_server_response_ms # Acceptable time the client should wait before receiving a response from the server
max_receiving_response_time_ms # Acceptable time to receive the response data once the server has started sending it
```

# Running Tests
- Tests are run by executing command line:
```bash
k6 run products-performance-test.js --out json=full-result.json
```
- Once the full test is completed full-result.json file is created for optional custom html report generation

# Reports
- A user-friendly report (performance_test_summary.html) can be generated via the command line
```bash
node generate-report.js
``` 
![performance_test_summary.html reference output example](reference\custom-report.png)

**Author:** Sergio Silva 