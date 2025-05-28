import fastity from 'fastify'
import { userRoutes } from './routes/accountsRoutes'
import cors from '@fastify/cors'

export const app = fastity()

app.register(cors)

//Registrando as rotas do servidor
app.register(userRoutes)