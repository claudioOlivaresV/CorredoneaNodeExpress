import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { PaymentsService } from '../../payments/payments.service';
import { prisma } from '../../config/prismaConfig';
import { ConflictError, NotFoundError } from '../../errors/app.errors';
import { Prisma } from '../../generated/prisma/client';

jest.mock('../../config/prismaConfig', () => ({
  prisma: {
    payments: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('PaymentsService', () => {
  let service: PaymentsService;

  const findUniqueMock = prisma.payments.findUnique as jest.MockedFunction<
    typeof prisma.payments.findUnique
  >;

  const updateMock = prisma.payments.update as jest.MockedFunction<
    typeof prisma.payments.update
  >;

  beforeEach(() => {
    service = new PaymentsService();

    jest.clearAllMocks();
  });

  describe('pay', () => {
    it('debería realizar el pago correctamente', async () => {
      const payment = {
        id: 1,
        contract_id: 10,
        due_date: new Date('2026-09-30'),
        amount: new Prisma.Decimal(400000),
        paid_at: null,
        status: 'PENDING',
        created_at: new Date(),
      };

      const updatedPayment = {
        ...payment,
        paid_at: new Date(),
        status: 'PAID',
      };

      findUniqueMock.mockResolvedValue(payment);

      updateMock.mockResolvedValue(updatedPayment);

      const result = await service.pay(1);

      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(updateMock).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          status: 'PAID',
          paid_at: expect.any(Date),
        },
      });

      expect(result).toEqual({
        id: 1,
        contract_id: 10,
        due_date: updatedPayment.due_date,
        amount: 400000,
        paid_at: updatedPayment.paid_at,
        status: 'PAID',
      });
    });

    it('debería lanzar NotFoundError si el pago no existe', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(service.pay(999)).rejects.toThrow(NotFoundError);

      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });

      expect(updateMock).not.toHaveBeenCalled();
    });

    it('debería lanzar ConflictError si el pago ya fue realizado', async () => {
      const payment = {
        id: 1,
        contract_id: 10,
        due_date: new Date('2026-09-30'),
        amount: new Prisma.Decimal(400000),
        paid_at: new Date('2026-09-30'),
        status: 'PAID',
        created_at: new Date(),
      };

      findUniqueMock.mockResolvedValue(payment);

      await expect(service.pay(1)).rejects.toThrow(ConflictError);

      expect(updateMock).not.toHaveBeenCalled();
    });
  });
});
