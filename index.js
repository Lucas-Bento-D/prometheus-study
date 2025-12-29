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

const histogram = new promClient.Histogram({
    name: "requests_time_seconds",
    help: "exemplo de tempo de resposta de api - histogram",
    buckets: [.1, .2, .3, .4, .5, .6]
})

const summary = new promClient.Summary({
    name: "requests_time_seconds_summary",
    help: "exemplo summary  de tempo de resposta de api",
    percentiles: [0.5, 0.9, 0.99]
})
app.get("/", (req, res) => {
    counter.labels(200).inc()
    counter.labels(300).inc()
    const random = Math.random()
    gauge.set(random)
    histogram.observe(random)
    summary.observe(random)
    res.send("Hello Prometheus")
})

app.get("/metrics", async (req, res) =>{
    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
})

app.listen(3030)