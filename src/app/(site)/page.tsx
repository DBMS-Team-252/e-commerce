import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | BTL DBMS E-Commerce",
  description: "Xem danh sách sản phẩm",
};

export default function HomePage() {
  redirect("/shop-with-sidebar");
}
