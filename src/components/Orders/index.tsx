"use client";
import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";

export interface OrderItem {
  _id: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  orderItems: {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/order", {
          credentials: "include",
        });

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="p-10">Loading orders...</p>;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[770px]">

        {/* HEADER */}
        {orders.length > 0 && (
          <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex">
            <div className="min-w-[111px]">Order</div>
            <div className="min-w-[175px]">Date</div>
            <div className="min-w-[128px]">Status</div>
            <div className="min-w-[213px]">Products</div>
            <div className="min-w-[113px]">Total</div>
            <div className="min-w-[113px]">Action</div>
          </div>
        )}

        {orders.length === 0 ? (
          <p className="p-10">You don't have any orders</p>
        ) : (
          orders.map((order) => (
            <SingleOrder key={order._id} orderItem={order} smallView={false} />
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;