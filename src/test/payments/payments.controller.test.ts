import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PaymentsController } from '../../payments/payments.controller';
import { PaymentsService } from '../../payments/payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  let paymentsService: {
    pay: jest.MockedFunction<PaymentsService['pay']>;
  };

  beforeEach(() => {
    paymentsService = {
      pay: jest.fn(),
    };

    controller = new PaymentsController(
      paymentsService as unknown as PaymentsService,
    );
  });

  describe('pay', () => {
    it('debería realizar el pago y retornar status 200', async () => {
      const payment = {
        id: 1,
        contract_id: 10,
        due_date: new Date('2026-09-30'),
        amount: 400000,
        paid_at: new Date(),
        status: 'PAID',
      };

      paymentsService.pay.mockResolvedValue(payment);

      const req = {
        params: {
          id: '1',
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.pay(req, res);

      expect(paymentsService.pay).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(payment);
    });

    it('debería propagar el error del service', async () => {
      const error = new Error('Error al realizar el pago');

      paymentsService.pay.mockRejectedValue(error);

      const req = {
        params: {
          id: '1',
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await expect(controller.pay(req, res)).rejects.toThrow(error);

      expect(paymentsService.pay).toHaveBeenCalledWith(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
