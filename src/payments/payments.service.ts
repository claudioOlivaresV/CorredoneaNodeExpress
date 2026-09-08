import { prisma } from '../config/prismaConfig';
import { ConflictError, NotFoundError } from '../errors/app.errors';

const PAID = 'PAID';

export class PaymentsService {
  async pay(id: number) {
    const payment = await prisma.payments.findUnique({
      where: {
        id,
      },
    });

    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }

    if (payment.status === PAID) {
      throw new ConflictError('El pago ya fue realizado');
    }

    const updatedPayment = await prisma.payments.update({
      where: {
        id,
      },
      data: {
        status: PAID,
        paid_at: new Date(),
      },
    });

    return {
      id: updatedPayment.id,
      contract_id: updatedPayment.contract_id,
      due_date: updatedPayment.due_date,
      amount: Number(updatedPayment.amount),
      paid_at: updatedPayment.paid_at,
      status: updatedPayment.status,
    };
  }
}
