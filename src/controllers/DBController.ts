import {createConnections} from "typeorm";


class DBController {


  private async connection():Promise<void> {

    const connection = await createConnections([{
        name: "db1Connection",
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "root",
        password: "root",
        database: "gifplay",
        entities: [__dirname + "/src/entity/*{.ts}"],
        synchronize: true
    }, {
        name: "db2Connection",
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "root",
        password: "root",
        database: "gifplay_log",
        entities: [__dirname + "/src/entity/*{.ts}"],
        synchronize: true
    }]);

  }
}

export default new DBController()
