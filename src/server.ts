import { app } from './app'
import { env } from './env'

app.listen({
    port: env.PORT , 
}).then(() => {
    console.log(`Ouvindo a porta ${env.PORT}`)
})
