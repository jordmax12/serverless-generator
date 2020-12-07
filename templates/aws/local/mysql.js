const template = (db_name) => {
    return {
        version: "3.1",
        services: {
           'mysql-server': {
              image: "mysql:5.7",
              command: "--default-authentication-plugin=mysql_native_password",
              restart: "always",
              ports: [
                 "3306:3306"
              ],
              expose: [
                 "3306"
              ],
              environment: {
                 MYSQL_ROOT_PASSWORD: "root_password",
                 MYSQL_DATABASE: db_name
              }
           }
        }
    }
}

exports.default  = template;