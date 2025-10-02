const authConfig = {
    secret: process.env.AUTH_SECRET as string, 
    secret_expires_in: process.env.AUTH_SECRET_EXPIRES_IN as string, 
    refresh_secret: process.env.AUTH_REFRESH_SECRET as string, 
    refresh_secret_expires_in: process.env.AUTH_REFRESH_SECRET_EXPIRES_IN as string
}

export default authConfig;