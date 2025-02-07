"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Swal from "sweetalert2";
import ProtectedRoute from "@/app/components/protectedRoute";

interface Order {
  _id: string;
  fullName: string;
  email: string;
  phone: number;
  address: string;
  city: string;
  zipCode: number;
  totalPrice: number;
  discountedPrice: number;
  orderDate: string;
  orderStatus: string;
  cartItems: { productName: string; image: string }[];
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "order"]{
            _id, fullName, phone, email, address, city, zipCode, totalPrice,
            orderDate, orderStatus, cartItems[]->{ productName, image }
          }`
        );
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filter === "All" ? orders : orders.filter(order => order.orderStatus === filter);

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client.patch(orderId).set({ orderStatus: newStatus }).commit();
      setOrders(prevOrders => prevOrders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order));
      Swal.fire("Success", "Order status updated successfully", "success");
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire("Error", "Something went wrong while updating the status", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <nav className="bg-blue-600 text-white p-4 rounded-lg shadow-md flex justify-between items-center">
          <h2 className="text-lg sm:text-2xl font-bold">Admin Dashboard</h2>
        </nav>

        <div className="mt-6 bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800 text-center">Orders</h2>
          <div className="mb-4 flex justify-between items-center">
            <label className="text-sm sm:text-base font-medium">Filter by Status:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded p-2 text-sm bg-white">
              {['All', 'pending', 'processing', 'delivered', 'cancelled'].map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>

          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                {['ID', 'Customer', 'Actual Price','Discounted Price', 'Order Date', 'Status', 'Actions'].map(header => (
                  <th key={header} className="py-3 px-4 text-left font-semibold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-gray-100 cursor-pointer transition-all" onClick={() => toggleOrderDetails(order._id)}>
                    <td className="py-3 px-4">{order._id}</td>
                    <td className="py-3 px-4">{order.fullName}</td>
                    <td className="py-3 px-4">${order.totalPrice}</td>
                    <td className="py-3 px-4">{order.discountedPrice}</td>
                    <td className="py-3 px-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <select value={order.orderStatus} onChange={e => handleStatusChange(order._id, e.target.value)} className="border rounded p-2 text-sm">
                        {['pending', 'processing', 'delivered', 'cancelled'].map(status => (
                          <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition" onClick={e => { e.stopPropagation(); handleDelete(order._id); }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                  {selectedOrderId === order._id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="p-4">
                        <div className="border-t pt-4">
                          <h3 className="font-semibold text-xl">Order Details</h3>
                          <p><strong>Email:</strong> {order.email}</p>
                          <p><strong>Phone:</strong> {order.phone}</p>
                          <p><strong>Address:</strong> {order.address}</p>
                          <p><strong>City:</strong> {order.city}</p>
                          <p><strong>Zip Code:</strong> {order.zipCode}</p>
                          <h4 className="font-semibold text-lg mt-4">Products</h4>
                          {order.cartItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <Image src={urlFor(item.image).url()} alt={item.productName} width={100} height={100} className="rounded-sm" />
                              <p className="font-semibold">{item.productName}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
