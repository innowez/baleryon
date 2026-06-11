export async function openRazorpay({ amount, orderId, name, email, phone }) {
  return new Promise((resolve) => {
    const options = {
      key: process.env.RAZORPAY_SECRET,

      amount,

      currency: "INR",

      order_id: orderId,

      name: "Baleryon",

      prefill: {
        name,
        email,
        contact: phone,
      },

      handler: (response) => {
        resolve(response);
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.open();
  });
}
