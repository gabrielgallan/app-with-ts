import fastity from 'fastify'
import { userRoutes } from './routes/accountsRoutes'

export const app = fastity()

//Registrando as rotas do servidor
app.register(userRoutes)