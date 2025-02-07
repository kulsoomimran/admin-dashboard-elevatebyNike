export const order = {
  name: "order",
  type: "document",
  title: "Order",
  fields: [
    {
      name: "fullName",
      type: "string",
      title: "Full Name",
    },
    {
      name: "email",
      type: "string",
      title: "Email Address",
    },
    {
      name: "phone",
      type: "string",
      title: "Contact Number",
    },
    {
      name: "address",
      type: "string",
      title: "Address",
    },
    {
      name: "city",
      type: "string",
      title: "City",
    },
    {
      name: "zipCode",
      type: "string",
      title: "Zip Code",
    },
    {
      name: "cartItems",
      type: "array",
      title: "Cart Items",
      of: [{ type: "reference", to: { type: "product" } }]
    },
    {
      name: "totalPrice",
      type: "number",
      title: "Total Price",
    },
    {
      name: "discountedPrice",
      type: "number",
      title: "Discounted Price",
    },
    {
      name: "orderDate",
      type: "datetime",
      title: "Order Date",
    },
    {
      name: "orderStatus",
      type: "string",
      title: "Order Status",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
    }
  ],
};
