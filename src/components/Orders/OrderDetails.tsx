"use client";
import React, { useState } from "react";

const OrderDetails = ({ orderItem }: any) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitReview = async (productId: string) => {
    try {
      await fetch(`http://localhost:3000/api/review/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      alert("Review submitted!");
    } catch (err) {
      console.log(err);
      alert("Error submitting review");
    }
  };

  return (
    <div className="p-7">
      <h3 className="text-xl font-bold mb-5">Products in this order</h3>

      {orderItem.orderItems.map((item: any) => (
        <div
          key={item.productId}
          className="border p-4 mb-4 rounded-lg flex gap-5 items-center"
        >
          <img src={item.image} className="w-20 h-20 object-cover" />

          <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p>Qty: {item.quantity}</p>
            <p>${item.price}</p>
          </div>

          {/* REVIEW */}
          {orderItem.status === "delivered" && (
            <div className="w-[250px]">
              <select
                className="border p-2 w-full mb-2"
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value="5">⭐⭐⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="2">⭐⭐</option>
                <option value="1">⭐</option>
              </select>

              <textarea
                placeholder="Write review..."
                className="border p-2 w-full mb-2"
                onChange={(e) => setComment(e.target.value)}
              />

              <button
                onClick={() => submitReview(item.productId)}
                className="bg-blue text-white px-4 py-2 rounded"
              >
                Submit Review
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderDetails;
