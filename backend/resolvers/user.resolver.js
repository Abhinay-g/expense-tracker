import { users } from '../dummyData/data.js'
const userResolver = {
    Query: {
        users: () => {
            console.log(users); // Debug log
            return users;
        },
        user:(_,{userId})=>{
            return users.find((el=>el._id===userId))
        }
    },
    Mutation: {}
}

export default userResolver;