const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

const {eAdmin} = require("../helpers/eAdmin")

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

// Rotas de Categorias

router.get('/categorias', eAdmin,(req, res) => {
    Categoria.find().then((categorias) => {
        //res.render("admin/categorias", {categorias: categorias})
        if(!req.user){
            res.render('admin/categorias', {categorias: categorias.map(categorias => categorias.toJSON())})    
        } else {
            res.render('admin/categorias', {categorias: categorias.map(categorias => categorias.toJSON()), nome: req.user.nome, admin: req.user.eAdmin})    
        }
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias!" + erro)
        res.redirect("/admin")
    })
})

router.get('/categorias/add', eAdmin,(req, res) => {
    if(!req.user){
        res.render("admin/addCategorias")
    } else {
        res.render("admin/addCategorias", {nome: req.user.nome, admin: req.user.eAdmin})
    }
})

router.post('/categorias/new', eAdmin,(req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(!req.body.url || typeof req.body.url == undefined || req.body.url == null){
        erros.push({texto: "URL não pode ser nula!"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito curto"})
    }

    if(req.body.url.length < 3){
        erros.push({texto: "A URL da categoria está muito curta!"})
    }

    if(erros.length > 0){
        res.render("admin/addCategorias", {erros: erros})
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug,
            url: req.body.url
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria salva com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((erro) => {
            req.flash("error_msg", "Erro ao salvar a categoria!")
        })
    }
})

router.get("/categorias/edit/:id", eAdmin,(req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        //res.render("admin/editCategorias", {categoria: categoria})
        if(!req.user){
            res.render("admin/editCategorias", {categoria: categoria.toJSON()})
        } else {
            res.render("admin/editCategorias", {categoria: categoria.toJSON(), nome: req.user.nome, admin: req.user.eAdmin})
        }
    }).catch((erro) => {
        req.flash("error_msg", "Essa categoria não existe!" + erro)
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", eAdmin,(req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(!req.body.url || typeof req.body.url == undefined || req.body.url == null){
        erros.push({texto: "Url inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito curto"})
    }

    if(req.body.slug.length < 2){
        erros.push({texto: "Slug da categoria muito curto"})
    }

    if(req.body.url.length < 2){
        erros.push({texto: "Url da categoria muito curto"})
    }

    if(erros.length > 0){
        res.render("admin/addCategorias", {erros: erros})
    } else {
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
            categoria.url = req.body.url

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch(() => {
                req.flash("error_msg", "Erro na edição da categoria!" + erro)
                res.redirect("/admin/categorias")
            })
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria!" + erro)
            res.redirect("/admin/categorias")
        })
    }
})

router.post("/categorias/deletar", eAdmin,(req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((erro) => {
        req.flash("error_msg", "Categoria não existe!" + erro)
        res.redirect("/admin/categorias")
    })
})

// Rotas de Postagens

router.get("/postagens", eAdmin,(req, res) => {

    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        if(!req.user){
            res.render("admin/postagens", {postagens: postagens.map(postagens => postagens.toJSON())})
        } else {
            res.render("admin/postagens", {postagens: postagens.map(postagens => postagens.toJSON()), nome: req.user.nome, admin: req.user.eAdmin})
        }
    }).catch((erro) => {
        req.flash("error_msg", "Erro ao exibir as postagens")
        res.redirect("/admin")
    })
    
})

router.get("/postagens/add", eAdmin,(req, res) => {
    Categoria.find().then((categorias) => {
        if(!req.user){
            res.render("admin/addPostagens", {categorias: categorias.map(categorias => categorias.toJSON())})
        } else {
            res.render("admin/addPostagens", {categorias: categorias.map(categorias => categorias.toJSON()), nome: req.user.nome, admin: req.user.eAdmin})
        }
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário!" + erro)
        res.redirect("/admin/categorias")
    })
})

router.post("/postagens/new", eAdmin,(req, res) => {
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida"})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido"})
    }

    if(req.body.titulo.length < 2){
        erros.push({texto: "Título da postagem muito curto"})
    }

    if(req.body.slug.length < 2){
        erros.push({texto: "Slug da postagem muito curto"})
    }

    if(req.body.descricao.length < 2){
        erros.push({texto: "Descrição da postagem muito curto"})
    }

    if(req.body.conteudo.length < 2){
        erros.push({texto: "Conteúdo da postagem muito curto"})
    }

    if(req.body.categoria == "0"){
        erros.push({text: "Nenhuma categoria cadastrada"})
    }

    if(erros.length > 0){
        res.render("admin/addPostagens", {erros: erros})
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((erro) => {
            req.flash("error_msg", "Erro ao cadastrar postagem!" + erro)
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", eAdmin,(req, res) => {
    Postagem.findOne({_id: req.params.id}).then((postagem) => {
        Categoria.find().then((categorias) => {
            if(!req.user){
                res.render("admin/editPostagens", {categorias: categorias.map(categorias => categorias.toJSON()), postagem: postagem.toJSON()})
            } else {
                res.render("admin/editPostagens", {categorias: categorias.map(categorias => categorias.toJSON()), postagem: postagem.toJSON(), nome: req.user.nome, admin: req.user.eAdmin})
            }
        }).catch((erro) => {
            req.flash("error_msg", "Erro ao listar categorias!")
            res.redirect("/admin/postagens")
        })
    }).catch((erro) =>{
        req.flash("error_msg", "Essa postagem não existe!")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", eAdmin,(req, res) => {
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida"})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido"})
    }

    if(req.body.titulo.length < 2){
        erros.push({texto: "Título da postagem muito curto"})
    }

    if(req.body.slug.length < 2){
        erros.push({texto: "Slug da postagem muito curto"})
    }

    if(req.body.descricao.length < 2){
        erros.push({texto: "Descrição da postagem muito curto"})
    }

    if(req.body.conteudo.length < 2){
        erros.push({texto: "Conteúdo da postagem muito curto"})
    }

    if(req.body.categoria == "0"){
        erros.push({text: "Nenhuma categoria cadastrada"})
    }

    if(erros.length > 0){
        res.render("admin/addPostagens", {erros: erros})
    } else {
        Postagem.findOne({_id: req.body.id}).then((postagem) => {
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso!")
                res.redirect("/admin/postagens")
            }).catch(() => {
                req.flash("error_msg", "Erro na edição da postagem!" + erro)
                res.redirect("/admin/postagens")
            })
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao editar a postagem!" + erro)
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/deletar/:id", eAdmin,(req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        //req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((erro) => {
        req.flash("error_msg", "Erro ao deletar postagem!")
        res.redirect("/admin/postagens")
    })
})

module.exports = router