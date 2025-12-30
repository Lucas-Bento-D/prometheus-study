const express = require("express")
const promClient = require("prom-client")
const register = promClient.register

const app = express()
let withoutLoggedUsers = false

const requestsCounter = new promClient.Counter({
    name: "requests_total",
    help: "contador de requests",
    labelNames: ["statusCode"]
})

const usersOnline = new promClient.Gauge({
    name:"users_online",
    help: "usuarios online no momento"
})

const timeReturnRequest = new promClient.Histogram({
    name: "requests_duration_seconds",
    help: "tempo de resposta da API"
})

const summary = new promClient.Summary({
    name: "requests_time_seconds_summary",
    help: "exemplo summary  de tempo de resposta de api",
    percentiles: [0.5, 0.9, 0.99]
})

function randn_bm(min, max, skew) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random() //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random()
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
  
  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0) 
    num = randn_bm(min, max, skew) // resample between 0 and 1 if out of range
  
  else{
    num = Math.pow(num, skew) // Skew
    num *= max - min // Stretch to fill range
    num += min // offset to min
  }
  return num
}

setInterval(()=>{
    const ErrorTax = 5
    const statusCode = (Math.random < ErrorTax/100) ? "500" : "200"
    requestsCounter.labels(statusCode).inc()

    const random = Math.random()
    const loggedUsers = withoutLoggedUsers ? 0 : 500 + Math.round( (50*random) )
    usersOnline.set(loggedUsers)

    const observeTime = randn_bm(0, 3, 4);
    timeReturnRequest.observe(observeTime)


}, 50)

app.get("/", (req, res) => {
    res.send("Hello Prometheus")
})

app.get("/without-logged-users", (req, res) => {
    withoutLoggedUsers = true
    res.send("without Logged Users router")
})
app.get("/logged-users", (req, res) => {
    withoutLoggedUsers = false
    res.send("Logged Users router")
})

app.get("/metrics", async (req, res) =>{
    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
})

app.listen(3030)