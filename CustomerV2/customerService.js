const { create } = require('domain');
const { get } = require('http');
const dbConfig = require('./dbConfig');
const errorHandler = require('./errorHandler');

class CustomerDataManagement {
    createconnection () {
        if (dbConfig.connection && dbConfig.connection.state === "authenticated") {
            console.log("Connection already exists...")
            return;
        }
        dbConfig.connection.connect(function(err) {
            if (err) {
                errorHandler.returnError(response, 500, "Error... while creating the connection to database...");
                return;
            }
            console.log("Connection established successfully...")
            return;
        });
    }
    fetchAllCustomers (request, response) {
        this.createconnection();
            dbConfig.connection.query("SELECT * FROM customers", function (err, result, fields) {
              if (err) {
                errorHandler.returnError(response, 400, "Error while reading the data");
                return;
              }
              response.writeHead(200, { "Content-Type": "application/json" })
              response.write(JSON.stringify(result));
              response.end();
              return;
            });
    }
    async createCustomer(request, response) {
        try {
          await this.bodyParser(request);
          this.createconnection();
            var sql = "INSERT INTO customers (first_name, last_name) VALUES ('" + request.body.first_name + "', '" + request.body.last_name +"')";
            dbConfig.connection.query(sql, function (err, result) {
              if (err) {
                  errorHandler.returnError(response, 400, "Error while inserting the data");
                  return;
              }
              response.writeHead(201, { "Content-Type": "text/plain" })
              response.write("1 record inserted");
              response.end();
              return;
            });
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
            this.createconnection();
            dbConfig.connection.query("SELECT * FROM customers WHERE id = " + idValue, function (err, result, fields) {
                if (err) {
                  errorHandler.returnError(response, 400, "Error while reading the data");
                  return;
                }
                if (!result || result.length === 0) {
                    errorHandler.returnError(response, 404, "Customer not found");
                    return;
                }
                const customer = result[0]
                customer.first_name = request.body.first_name || customer.first_name;
                customer.last_name = request.body.last_name || customer.last_name;
                var sql = "UPDATE customers SET first_name = '"+ customer.first_name +"', last_name = '"+ customer.last_name +"' WHERE id = "+ idValue;
                dbConfig.connection.query(sql, function (err, result) {
                    if (err) {
                        errorHandler.returnError(response, 400, "Update failed");
                        return;
                    }
                    response.writeHead(200, { "Content-Type": "application/json" });
                    response.write(JSON.stringify(customer));
                    response.end();
                    return;
                }); 
            });            
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
            this.createconnection();
            dbConfig.connection.query("SELECT * FROM customers WHERE id = " + idValue, function (err, result, fields) {
                if (err) {
                  errorHandler.returnError(response, 400, "Error while reading the data");
                  return;
                }
                if (!result || result.length === 0) {
                    errorHandler.returnError(response, 404, "Customer not found");
                    return;
                }
                var sql = "DELETE FROM customers WHERE id = " + idValue;
                console.log(sql)
                dbConfig.connection.query(sql, function (err, result) {
                    if (err) {
                        errorHandler.returnError(response, 400, "Invalid Query");
                        return;
                    }
                    response.writeHead(200, { "Content-Type": "text/plain" });
                    response.write("Number of records deleted: " + result.affectedRows);
                    response.end();
                    return;
                }); 
            });
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