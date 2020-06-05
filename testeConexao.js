const mongoose = require('mongoose')

// Conectando ao Mongo DB
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/mongoNode", {
    useMongoClient: true
}).then(() => {
    console.log("MongoDB conectado com sucesso!")
}).catch((erro) => {
    console.log("Erro: " + erro)
})

// Models
const UsuarioSchema = mongoose.Schema({
    nome: {
        type: String,
        require: true
    },
    nascimento: {
        type: Date,
        require: true
    },
    tipousuario: {
        type: Number,
        require: true
    },
    cargo: {
        type: String,
        require: true
    },
    descricao: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    senha: {
        type: String,
        require: true
    }
})
// Collection
mongoose.model('usuarios', UsuarioSchema)

const user = mongoose.model('usuarios') 

new user({
    nome: "admin",
    nascimento: new Date(),
    tipousuario: 1,
    cargo: "Analista",
    descricao: "Usuário disponível para testes e iniciação do banco",
    email: "admin@admin.com",
    senha: "admin123456"
}).save().then(() => {
    console.log("Usuario criado com sucesso!")
}).catch((erro) => {
    console.log("Erro: " + erro)
})

  