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

const checkCompany =  (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const empresa = req.params.id_empresa;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido.' });
    }
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const payload = verifyToken(token) as TokenPayload;
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
      // - admin e rh podem operar sobre qualquer colaborador DA MESMA EMPRESA
      //   (a checagem de empresa acima garante o escopo);
      // - colaborador comum só pode operar sobre o próprio colaboradorId.
      const GESTORES = ['admin', 'rh'];
      const idColabRequest = req.body?.id_colaborador ?? req.params.id_colaborador;

      if (idColabRequest && !GESTORES.includes(payload.role)) {
        if (Number(idColabRequest) !== payload.colaboradorId) {
          return res.status(403).json({ message: 'id do colaborador incoerente' });
        }
      }

      req.user = { id: payload.userId, email: payload.email, role: payload.role };
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido.' });
    }
  };

export default checkCompany;