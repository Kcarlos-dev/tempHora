import { verifyToken } from '../config/jwt';
import { Request, Response, NextFunction } from 'express';
import checkCompanyModel from '../models/checkCompanyModel'


interface TokenPayload {
    userId: number,
    empresaId: number,
    colaboradorId: number,
    email: string,
    role: string,
    status:string
  }

const checkCompany = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const empresa = req.params.id_empresa;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido.' });
    }
    const token = authHeader.replace('Bearer ', '');

    let payload: TokenPayload;
    try {
      payload = verifyToken(token) as TokenPayload;
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    try {
      if(!payload.status && payload.role != "root"){
        return res.status(403).json({message:'Você não está cadastrado em nenhuma empresa'})
      }
      if(payload.status === "inativo"){
        return res.status(403).json({message:'Você não está em atividade'})
      }
      if(payload.role === "root"){
        req.user = { id: payload.userId, email: payload.email, role: payload.role };
        return next();
      }
      if (!empresa){
          return res.status(403).json({ message: 'Empresa não fornecida.' });
      }

      // A empresa é obrigatória e precisa bater com o token. Checa aqui, sempre,
      // antes de qualquer regra sobre id_colaborador — assim ninguém consegue
      // consultar dados de outra empresa só porque o id_colaborador "bate".
      if(Number(payload.empresaId) !== Number(empresa)){
        return res.status(401).json({ message: 'Empresa inválida.' });
      }

      // Regras de colaborador:
      // - admin e rh podem operar sobre qualquer colaborador DA MESMA EMPRESA;
      // - colaborador comum só pode operar sobre o próprio colaboradorId;
      // - em AMBOS os casos, o colaborador alvo precisa REALMENTE pertencer à
      //   empresa da URL — consulta o banco pra evitar IDOR entre empresas.
      const GESTORES = ['admin', 'rh', 'kiosk'];
      const idColabRequestRaw = req.body?.id_colaborador ?? req.params.id_colaborador;

      if (idColabRequestRaw !== undefined && idColabRequestRaw !== null && idColabRequestRaw !== '') {
        const idColab = Number(idColabRequestRaw);
        if (!Number.isFinite(idColab) || idColab <= 0) {
          return res.status(400).json({ message: 'id_colaborador inválido.' });
        }

        // Coerência com o próprio token (colaborador comum só mexe no próprio id).
        if (!GESTORES.includes(payload.role) && idColab !== payload.colaboradorId) {
          return res.status(403).json({ message: 'id do colaborador incoerente' });
        }

        // Checagem no banco: o colaborador existe e pertence à empresa da URL?
        const empresaDoColab = await checkCompanyModel.findEmpresaByColaboradorId(idColab);
        if (empresaDoColab === null) {
          return res.status(404).json({ message: 'Colaborador não encontrado.' });
        }
        if (empresaDoColab !== Number(empresa)) {
          return res.status(403).json({
            message: 'Colaborador não pertence à empresa informada.',
          });
        }
      }

      req.user = { id: payload.userId, email: payload.email, role: payload.role };
      return next();
    } catch (error) {
      return next(error);
    }
  };

export default checkCompany;