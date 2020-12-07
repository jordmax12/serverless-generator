exports.default = {
    version: "3.1",
    services: {
       db: {
          image: "postgres",
          restart: "always",
          environment: {
             POSTGRES_PASSWORD: "root_password"
          }
       }
    }
 }