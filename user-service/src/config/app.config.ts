const appConfig = {
    host: process.env.APP_HOST as string,
    port: parseInt(process.env.APP_PORT as string),
}

export default appConfig;