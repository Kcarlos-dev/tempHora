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
      if(req.body.id_colaborador){
         if(Number(req.body.id_colaborador) !== payload.colaboradorId){
            return res.status(403).json({message: 'id do colaborador incoerente' })
         }
         req.user = { id: payload.userId, email: payload.email, role: payload.role };
         return next();   
      }
      if(req.params.id_colaborador){
        if(Number(req.params.id_colaborador) !== payload.colaboradorId){
           return res.status(403).json({message: 'id do colaborador incoerente' })
        }
        req.user = { id: payload.userId, email: payload.email, role: payload.role };
        return next();   
     }
      if(Number(payload.empresaId)  === Number(empresa)){
          req.user = { id: payload.userId, email: payload.email, role: payload.role };
          return next();
      }else{
        return res.status(401).json({ message: 'Empresa inválida.' });
      }
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido.' });
    }
  };

export default checkCompany;