import { verifyToken } from '../config/jwt';
import { Request, Response, NextFunction } from 'express';import checkCompanyModel from '../models/checkCompanyModel'


interface TokenPayload {
    userId: number;
    email: string;
    role: string;
  }

const checkCompany = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const empresa = req.body.id_empresa;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido.' });
    }
    if (!empresa){
        return res.status(401).json({ message: 'Empresa não fornecida.' });
    }
    const token = authHeader.replace('Bearer ', '');
  
    try {
      const payload = verifyToken(token) as TokenPayload;
      const  id_empresa_tb = await checkCompanyModel.findById(payload.userId)
      console.log(id_empresa_tb)
      if(Number(id_empresa_tb)  === Number(empresa)){
          req.user = { id: payload.userId, email: payload.email, role: payload.role };
          next();
      }else{
        return res.status(401).json({ message: 'Empresa inválida.' });
      }
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido.' });
    }
  };

export default checkCompany;