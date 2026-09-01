import api from "../api/axios";

export const createOrder = async (
  orderData
) => {
  const response = await api.post(
    "/orders",
    orderData
  );

  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(
    "/orders/my-orders"
  );

  return response.data;
};

export const getOrderById = async (
  orderId
) => {
  const response = await api.get(
    `/orders/${orderId}`
  );

  return response.data;
};

export const cancelMyOrder = async (
  orderId
) => {
  const response = await api.put(
    `/orders/${orderId}/cancel`
  );

  return response.data;
};

export const createRazorpayPaymentOrder =
  async (orderId) => {
    const response = await api.post(
      "/payments/razorpay/create-order",
      {
        orderId,
      }
    );

    return response.data;
  };

export const verifyRazorpayPayment =
  async (paymentData) => {
    const response = await api.post(
      "/payments/razorpay/verify",
      paymentData
    );

    return response.data;
  };

export const cancelPendingRazorpayPayment =
  async (orderId) => {
    const response = await api.put(
      `/payments/razorpay/${orderId}/cancel`
    );

    return response.data;
  };
