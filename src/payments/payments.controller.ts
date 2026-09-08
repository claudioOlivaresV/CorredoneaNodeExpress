import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';

export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  pay = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const payment = await this.paymentsService.pay(id);

    return res.status(200).json(payment);
  };
}
