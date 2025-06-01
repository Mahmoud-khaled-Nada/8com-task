import Joi from 'joi';

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required()
      })
    )
    .min(1)
    .required(),


  shippingAddress: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    addressLine: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required()
  }).required(),

  totalAmount: Joi.number().min(0).required(),

  paymentStatus: Joi.string().valid('Pending', 'Paid', 'Failed').optional(),

  orderStatus: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').optional()
});


export const updateOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string(),
        name: Joi.string(),
        quantity: Joi.number().integer().min(1),
        price: Joi.number().min(0)
      })
    )
    .min(1)
    .optional(),

  totalAmount: Joi.number().min(0).optional(),

  paymentStatus: Joi.string().valid('Pending', 'Paid', 'Failed').optional(),

  orderStatus: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').optional()
});