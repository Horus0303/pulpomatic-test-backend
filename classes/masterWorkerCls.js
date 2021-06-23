module.exports = class MasterWorkerCls {
    constructor(config) {
        this.config = config || {}
        this.cluster = this.config.cluster
    }

    upWorker() {
        const worker = this.cluster.fork()
    }

    upDeadWorker() {
        setTimeout(() => {
            this.upWorker()
        }, 300)
    }
}