// frontend/utils/http-errors.js
export function httpStatusToMessage(status) {
  switch (status) {
    case 0:   return 'Sem resposta do servidor. Verifique sua conexão.';
    case 400: return 'Requisição inválida. Confira os dados informados.';
    case 401: return 'Senha inválida ou usuário não autorizado.';
    case 403: return 'Requisição não permitida.';
    case 404: return 'Recurso não encontrado.';
    case 409: return 'Conflito de dados. O registro pode já existir.';
    case 413: return 'Arquivo muito grande. Tente uma imagem menor.';
    case 415: return 'Formato de arquivo não suportado.';
    case 422: return 'Dados inválidos. Corrija os campos destacados.';
    case 429: return 'Muitas tentativas. Aguarde e tente novamente.';
    case 500: return 'Erro interno do servidor. Tente novamente em instantes.';
    case 502:
    case 503:
    case 504: return 'Serviço temporariamente indisponível. Tente mais tarde.';
    default:  return `Erro inesperado (HTTP ${status}).`;
  }
}

export function normalizeError(err) {
  if (!err) return { message: 'Ocorreu um erro desconhecido.' };
  if (err instanceof Response) return { status: err.status, message: httpStatusToMessage(err.status) };
  if (err.response && typeof err.response.status === 'number') {
    const st = err.response.status;
    const msg = (err.response.data && (err.response.data.message || err.response.data.error)) || null;
    return { status: st, message: msg || httpStatusToMessage(st) };
  }
  if (typeof err === 'object' && (err.error || err.message)) {
    return { status: err.status || 0, message: err.error || err.message };
  }
  const msg = String(err && err.message || err) || 'Ocorreu um erro.';
  if (/failed to fetch|network|cors|typeerror/i.test(msg)) {
    return { status: 0, message: 'Falha de rede ou CORS. Verifique sua conexão.' };
  }
  return { message: msg };
}
