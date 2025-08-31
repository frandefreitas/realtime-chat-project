module.exports = {
  ok(res, mensagem = "Operação realizada com sucesso.", dados = {}) {
    return res.status(200).json({ sucesso: true, mensagem, dados });
  },
  created(res, mensagem = "Registro criado com sucesso.", dados = {}) {
    return res.status(201).json({ sucesso: true, mensagem, dados });
  },
  badRequest(res, mensagem = "Requisição inválida.", detalhes = null) {
    const body = { erro: true, mensagem };
    if (detalhes) body.detalhes = detalhes;
    return res.status(400).json(body);
  },
  unauthorized(res, mensagem = "Não autorizado.") {
    return res.status(401).json({ erro: true, mensagem });
  },
  forbidden(res, mensagem = "Acesso negado.") {
    return res.status(403).json({ erro: true, mensagem });
  },
  notFound(res, mensagem = "Recurso não encontrado.") {
    return res.status(404).json({ erro: true, mensagem });
  },
  conflict(res, mensagem = "Conflito: recurso já existe.") {
    return res.status(409).json({ erro: true, mensagem });
  },
  serverError(res, mensagem = "Erro interno do servidor.") {
    return res.status(500).json({ erro: true, mensagem });
  }
};
