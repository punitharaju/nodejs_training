const http = require('http');
const CustomerDataManagement = require('./customerService');
const CustomerService = require('./customerService');
const customerService = new CustomerDataManagement();
const port = require('./serverConfig');

const server = http.createServer((req, res) => {
  let url = req.url
  let method = req.method

  switch (method) {    
    case "GET":
      if (url === "/customers/v1") {
        customerService.fetchAllCustomers(req, res);
      }
      break;
    case "POST":
      if (url === "/customers/v1") {
        customerService.createCustomer(req, res);
      }
      break;
    case "PUT":
        if (url.startsWith("/customers/v1")) {
            customerService.updateCustomer(req, res);
        }
        break;
    case "DELETE":
        if (url.startsWith("/customers/v1")) {
            customerService.removeCustomer(req, res);
        }
        break;

    default:
      res.writeHead(404, { "Content-type": "text/plain" });
      res.write("Invalid URL");
      res.end();
  }
});

server.listen(port, () => {
    console.log(`listening on port ${port}...`);
});
