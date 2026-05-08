import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/redux/features/auth-slice";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stickyMenu, setStickyMenu] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const { user, isLoggedIn } = useAppSelector((state) => state.authReducer);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => setStickyMenu(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      dispatch(clearAuth());
      toast.success("Đăng xuất thành công");
      setUserMenuOpen(false);
    } catch {
      // clearAuth đã được gọi trong authApi.logout() dù có lỗi
      dispatch(clearAuth());
      toast.success("Đăng xuất thành công");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop-with-sidebar?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header
      className={`fixed left-0 top-0 w-full z-9999 bg-white transition-all ease-in-out duration-300 ${stickyMenu && "shadow"
        }`}
    >
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        {/* ── Top row ── */}
        <div
          className={`flex flex-col lg:flex-row gap-5 items-end lg:items-center xl:justify-between ease-out duration-200 ${stickyMenu ? "py-4" : "py-6"
            }`}
        >
          {/* Logo + Search */}
          <div className="xl:w-auto flex-col sm:flex-row w-full flex sm:justify-between sm:items-center gap-5 sm:gap-10">
            <Link className="flex-shrink-0" href="/shop-with-sidebar">
              <Image src="/images/logo/logo.svg" alt="Logo" width={219} height={36} />
            </Link>

            {/* Search bar */}
            <div className="max-w-[475px] w-full">
              <form onSubmit={handleSearch}>
                <div className="relative max-w-[400px] w-full">
                  <input
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                    type="search"
                    name="search"
                    id="header-search"
                    placeholder="Tìm kiếm sản phẩm..."
                    autoComplete="off"
                    className="w-full rounded-lg bg-gray-1 border border-gray-3 py-2.5 pl-4 pr-11 outline-none ease-in duration-200 focus:border-blue focus:ring-2 focus:ring-blue/20"
                  />
                  <button
                    id="search-btn"
                    type="submit"
                    aria-label="Search"
                    className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 ease-in duration-200 hover:text-blue"
                  >
                    <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z" fill="" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: User account + Hamburger */}
          <div className="flex w-full lg:w-auto items-center gap-5">
            {/* User account */}
            {isLoggedIn && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 group"
                >
                  {/* Avatar */}
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="hidden sm:block text-left">
                    <span className="block text-2xs text-dark-4 uppercase">Tài khoản</span>
                    <p className="font-medium text-custom-sm text-dark group-hover:text-blue transition-colors truncate max-w-[120px]">
                      {user.name}
                    </p>
                  </div>
                  <svg
                    className={`fill-current text-dark-4 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                  >
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z" fill="" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-3 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-3">
                      <p className="font-semibold text-dark text-sm truncate">{user.name}</p>
                      <p className="text-dark-4 text-xs truncate">{user.email}</p>
                      {user.role === "ADMIN" && (
                        <span className="inline-block mt-1 text-xs bg-blue/10 text-blue px-2 py-0.5 rounded-full font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                    <button
                      id="logout-btn"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin" className="flex items-center gap-2.5 group" id="signin-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 1.25C9.37666 1.25 7.25001 3.37665 7.25001 6C7.25001 8.62335 9.37666 10.75 12 10.75C14.6234 10.75 16.75 8.62335 16.75 6C16.75 3.37665 14.6234 1.25 12 1.25ZM8.75001 6C8.75001 4.20507 10.2051 2.75 12 2.75C13.7949 2.75 15.25 4.20507 15.25 6C15.25 7.79493 13.7949 9.25 12 9.25C10.2051 9.25 8.75001 7.79493 8.75001 6Z" fill="#3C50E0" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 12.25C9.68646 12.25 7.55494 12.7759 5.97546 13.6643C4.4195 14.5396 3.25001 15.8661 3.25001 17.5L3.24995 17.602C3.24882 18.7638 3.2474 20.222 4.52642 21.2635C5.15589 21.7761 6.03649 22.1406 7.22622 22.3815C8.41927 22.6229 9.97424 22.75 12 22.75C14.0258 22.75 15.5808 22.6229 16.7738 22.3815C17.9635 22.1406 18.8441 21.7761 19.4736 21.2635C20.7526 20.222 20.7512 18.7638 20.7501 17.602L20.75 17.5C20.75 15.8661 19.5805 14.5396 18.0246 13.6643C16.4451 12.7759 14.3136 12.25 12 12.25ZM4.75001 17.5C4.75001 16.6487 5.37139 15.7251 6.71085 14.9717C8.02681 14.2315 9.89529 13.75 12 13.75C14.1047 13.75 15.9732 14.2315 17.2892 14.9717C18.6286 15.7251 19.25 16.6487 19.25 17.5C19.25 18.8078 19.2097 19.544 18.5264 20.1004C18.1559 20.4022 17.5365 20.6967 16.4762 20.9113C15.4193 21.1252 13.9742 21.25 12 21.25C10.0258 21.25 8.58075 21.1252 7.5238 20.9113C6.46354 20.6967 5.84413 20.4022 5.4736 20.1004C4.79033 19.544 4.75001 18.8078 4.75001 17.5Z" fill="#3C50E0" />
                </svg>
                <div>
                  <span className="block text-2xs text-dark-4 uppercase">Tài khoản</span>
                  <p className="font-medium text-custom-sm text-dark group-hover:text-blue transition-colors">
                    Đăng nhập
                  </p>
                </div>
              </Link>
            )}

            {/* Hamburger (mobile) */}
            <button
              id="hamburger-toggle"
              aria-label="Toggle navigation"
              className="xl:hidden block"
              onClick={() => setNavigationOpen(!navigationOpen)}
            >
              <span className="block relative cursor-pointer w-5.5 h-5.5">
                <span className="du-block absolute right-0 w-full h-full">
                  <span className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-[0] ${!navigationOpen && "!w-full delay-300"}`}></span>
                  <span className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 ${!navigationOpen && "!w-full delay-400"}`}></span>
                  <span className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 ${!navigationOpen && "!w-full delay-500"}`}></span>
                </span>
                <span className="block absolute right-0 w-full h-full rotate-45">
                  <span className={`block bg-dark rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full ${!navigationOpen && "!h-0 delay-[0]"}`}></span>
                  <span className={`block bg-dark rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 ${!navigationOpen && "!h-0 dealy-200"}`}></span>
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* ── Nav row ── */}
        <div className="border-t border-gray-3">
          <div className="flex items-center justify-between">
            <div
              className={`w-[288px] absolute right-4 top-full xl:static xl:w-auto h-0 xl:h-auto invisible xl:visible xl:flex items-center ${navigationOpen && "!visible bg-white shadow-lg border border-gray-3 !h-auto max-h-[400px] overflow-y-scroll rounded-md p-5"
                }`}
            >
              <nav>
                <ul className="flex xl:items-center flex-col xl:flex-row gap-5 xl:gap-6">
                  <li className="group relative before:w-0 before:h-[3px] before:bg-blue before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full">
                    <Link
                      href="/shop-with-sidebar"
                      className={`hover:text-blue text-custom-sm font-medium text-dark flex ${stickyMenu ? "xl:py-4" : "xl:py-6"}`}
                    >
                      Sản phẩm
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
