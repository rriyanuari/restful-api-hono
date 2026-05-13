import { Hono } from "hono"
import { createUsers, getUserById, getUsers, softDeleteUsers, updateUsers } from "./user.controller"

const userRoutes = new Hono()

userRoutes.get('/', getUsers)
userRoutes.get('/:id', getUserById)
userRoutes.post('/', createUsers)
userRoutes.patch('/:id', updateUsers)
userRoutes.delete('/:id', softDeleteUsers)

export default userRoutes