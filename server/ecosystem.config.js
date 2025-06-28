module.exports = {
    apps: [
        {
            name: "gestor-de-inventario",
            script: "npm",
            args: "run dev",
            env: {
                NODE_ENV: "development",
                ENV_VAR1: "enviromentgit -variable",
            }
        }
    ]
}