import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    orderId: {
      type: String,
      required: [true, "Provide orderId"],
      unique: true,
    },

    productId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "product",
      },
    ],

    product_detail: [
      {
        name: String,
        image: Array,
        quantity: Number,
        price: Number,
      },
    ],

    paymentId: {
      type: String,
      default: "",
    },

    payment_status: {
      type: String,
      default: "",
    },

    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
    },

    subTotalAmt: {
      type: Number,
      default: 0,
    },

    totolAmt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;