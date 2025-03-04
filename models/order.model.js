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
        ref: "Product",
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

    paymentMethod: {
      type: String,
      default: ""
    },

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
      ref: "Address",
    },

    subTotalAmt: {
      type: Number,
      default: 0,
    },

    totolAmt: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "Created",
    },
  },
  { timestamps: true },
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;