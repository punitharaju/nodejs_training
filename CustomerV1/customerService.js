const { create } = require('domain');
const { get } = require('http');
const customers = require('./customerData');
const errorHandler = require('./errorHandler');

class CustomerDataManagement {
    fetchAllCustomers (request, response) {
        response.writeHead(200, { "Content-Type": "application/json" })
        response.write(JSON.stringify(customers.customersData));
        response.end();
        return;
    }
    async createCustomer(request, response) {
        try {
          await this.bodyParser(request);
          const customer = {
            id: customers.customersData.length + 1,
            name:  request.body.name 
          };
          customers.customersData.push(customer);
          response.writeHead(201, { "Content-Type": "application/json" });
          response.write(JSON.stringify(customer));
          response.end();
          return;
        } catch (err) {
          errorHandler.returnError(response, 400, "Invalid body data was provided");
          return;
        }
    }
    async updateCustomer(request, response) {
        try {
          // Getting url for request stream.
          let url = request.url
         
          // Js string function to split url
          let idQuery = url.split("?")[1]
          let idKey = idQuery.split("=")[0] // index of our DB array which will be id
          let idValue = idQuery.split("=")[1] // Index Value
          
          if (idKey === "id") {
            // Calling bodyParser to get Data from request stream
            await this.bodyParser(request);
            const customer = customers.customersData.find(c => c.id == idValue);
            
            if (!customer) {
                errorHandler.returnError(response, 404, "Customer not found");
                return;
            }
            // Appending Request body into provided index
            customer.name = request.body.name || customer.name;
            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(JSON.stringify(customer));
            response.end();
            return;
          } else {
            errorHandler.returnError(response, 400, "Invalid Query");
            return;
          }
        } catch (err) {
          errorHandler.returnError(response, 400, "Invalid body data was provided");
          return;
        }
      }
      async removeCustomer(request, response) {
        try {
          // Getting url for request stream.
          let url = request.url
         
          // Js string function to split url
          let idQuery = url.split("?")[1]
          let idKey = idQuery.split("=")[0] // index of our DB array which will be id
          let idValue = idQuery.split("=")[1] // Index Value
          
          if (idKey === "id") {
            const customer = customers.customersData.find(c => c.id == idValue);
            if (!customer) {
                errorHandler.returnError(response, 404, "Customer not found");
                return;
            }
            // Appending Request body into provided index
            const index = customers.customersData.indexOf(customer);
            customers.customersData.splice(index, 1);
            response.writeHead(200, { "Content-Type": "application/json" })
            response.write(JSON.stringify(customer))
            response.end();
            return;
          } else {
            errorHandler.returnError(response, 400, "Invalid Query");
            return;
          }
        } catch (err) {
          errorHandler.returnError(response, 400, "Invalid body data was provided");
          return;
        }
      }
    async bodyParser(request) {
        return new Promise((resolve, reject) => {
          let totalChunked = ""
          request
            .on("error", err => {
              console.error(err)
              reject()
            })
            .on("data", chunk => {
              totalChunked += chunk // Data is in chunks, concatenating in totalChunked
            })
            .on("end", () => {
              request.body = JSON.parse(totalChunked) // Adding Parsed Chunked into request.body
              resolve()
            })
        })
    }
}

module.exports = CustomerDataManagement;