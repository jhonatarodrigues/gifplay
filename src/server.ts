import app from "./app";
import "./config";
import cron from "node-cron";
import moment from "moment-timezone";

// -- config moment locale
moment.tz.setDefault("America/Sao_Paulo");
moment.locale("pt-br");

cron.schedule("* * * * *", () =>
  console.log("Executando a tarefa a cada 1 minuto")
);

app.listen(8080);
