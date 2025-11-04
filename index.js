const express = require("express")
const promClient = require("prom-client")
const register = promClient.register

const app = express()

const counter = new promClient.Counter({
    name: "requests_total",
    help: "contador de requests",
    labelNames: ["statusCode"]
})

const gauge = new promClient.Gauge({
    name:"requests_gauge",
    help: "exemplo de gauge"
})

app.get("/", (req, res) => {
    counter.labels(200).inc()
    counter.labels(300).inc()
    gauge.set(100*Math.random())
    res.send("Hello Prometheus")
})

app.get("/metrics", async (req, res) =>{
    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
})

app.listen(3000)