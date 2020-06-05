// Carregando módulos
const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const mongoose = require("mongoose")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")

require("./models/Postagem")
const Postagem = mongoose.model("postagens")

require("./models/Categoria")
const Categoria = mongoose.model("categorias")

const usuarios = require("./routes/usuario")
const admin = require("./routes/admin")

const passport = require("passport")
require("./config/auth")(passport)
// Config
// Session
app.use(session({
    secret: "nodecourse",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

// Flash
app.use(flash())

//Middleware - para trabalhar com sessões
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
})

// Body-Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

// Mongoose
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/mongoNode", {
    useMongoClient: true
}).then(() => {
    console.log("MongoDB conectado com sucesso!")
}).catch((erro) => {
    console.log("Erro: " + erro)
})
// Public
app.use(express.static(path.join(__dirname, "public")))

app.use((req, res, next) => {
    console.log("Middleware")
    next()
})
// Rotas
app.get("/", (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        if(!req.user) {
            res.render("index", {postagens: postagens.map(postagens => postagens.toJSON())})
        } else {
            res.render("index", {postagens: postagens.map(postagens => postagens.toJSON()), nome: req.user.nome, admin: req.user.eAdmin})
        }
        
        
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem){
            if(!req.user){
                res.render("postagem/index", {postagem: postagem.toJSON()})
            } else {
                res.render("postagem/index", {postagem: postagem.toJSON(), nome: req.user.nome, admin: req.user.eAdmin})
            }
        } else {
            req.flash("error_msg", "Esta postagem não existe!")
            res.redirect("/")
        }
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro interno!")
        res.redirect("/")
    })
})

app.get("/categorias", (req, res) => {
    Categoria.find().then((categorias) => {
        if(!req.user){
            res.render("categorias/index", {categorias: categorias.map(categorias => categorias.toJSON())})
        } else {
            res.render("categorias/index", {categorias: categorias.map(categorias => categorias.toJSON()), nome: req.user.nome, admin: req.user.eAdmin})
        }
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias!")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens) => {
            if(!req.user){
                res.render("categorias/postagens", {postagens: postagens.map(postagens => postagens.toJSON()), categoria: categoria.toJSON()})
            } else {                
                res.render("categorias/postagens", {postagens: postagens.map(postagens => postagens.toJSON()), categoria: categoria.toJSON(), nome: req.user.nome, admin: req.user.eAdmin})
            }
            }).catch((erro) => {
                req.flash("error_msg", "Houve um erro interno ao acessar as postagens dessa categoria!")
                res.redirect("/")
            })
        }else{
            req.flash("error_msg", "Esta categoria não existe!")
            res.redirect("/")
        }
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a categoria!")
        res.redirect("/")
    })
})

app.get("/404", (req, res) => {
    res.send('<h1 class="display-1">Erro 404</h1>')
})

app.use("/admin", admin)
app.use("/usuarios", usuarios)

// Outros
const PORT = 8082
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})