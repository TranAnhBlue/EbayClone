import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import {
  FiUser,
  FiShoppingBag,
  FiMessageSquare,
  FiLogOut,
} from "react-icons/fi";
import {
  MdOutlineHistory,
  MdOutlineRateReview,
} from "react-icons/md";
import {
  RiUserSettingsLine,
  RiHomeSmileLine,
  RiShieldLine,
} from "react-icons/ri";
import { FaExchangeAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  resetUserInfo,
  setUserInfo,
  setProducts,
} from "../../../redux/orebiSlice";

const HeaderBottom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ref = useRef(null);

  /* ================= AUTH & REDUX ================= */
  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState?.isAuthenticated || false;

  const chatState = useSelector((state) => state.chat);
  const chatNotifications =
    chatState?.conversations?.reduce(
      (sum, c) => sum + (c.unreadCount || 0),
      0
    ) || 0;

  const cartState = useSelector((state) => state.cart) || {};
  const cartItems = cartState.items || [];
  const cartTotalCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  /* ================= LOCAL STATE ================= */
  const [showUser, setShowUser] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userName, setUserName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:9999";

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      const formatted = res.data.data.map((p) => ({
        ...p,
        name: p.title,
        image: p.image,
      }));
      dispatch(setProducts(formatted));
      setAllProducts(formatted);
    } catch (err) {
      console.error("Fetch products failed", err);
    }
  }, [API_BASE_URL, dispatch]);

  /* ================= FETCH USER ================= */
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return setIsLoggedIn(false);

      const res = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserName(res.data.fullname || res.data.username);
      dispatch(setUserInfo(res.data));
      setIsLoggedIn(true);
    } catch {
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
    }
  }, [API_BASE_URL, dispatch]);

  useEffect(() => {
    fetchProducts();
    if (isLoggedIn) fetchUserData();
  }, [fetchProducts, fetchUserData, isLoggedIn]);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowUser(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const filtered = allProducts.filter(
      (p) =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, allProducts]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
    } catch {}
    localStorage.removeItem("accessToken");
    dispatch(resetUserInfo());
    navigate("/signin");
  };

  const fakeImage = "https://via.placeholder.com/80x80?text=Product";

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* LOGO */}
          <Link to="/" className="text-3xl font-bold">
            <span className="text-red-600">e</span>
            <span className="text-[#3665f3]">b</span>
            <span className="text-yellow-400">a</span>
            <span className="text-green-500">y</span>
          </Link>


          {/* SEARCH */}
          <div className="relative flex-1 mx-10">
            <div className="flex items-center border-2 border-[#3665f3] rounded-full overflow-hidden">
              <input
                className="flex-1 px-5 py-3 outline-none"
                placeholder="Search for anything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="bg-[#3665f3] px-6 py-3 text-white">
                <FaSearch />
              </button>
            </div>

            {searchQuery && filteredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute w-full bg-white mt-2 shadow-xl rounded-lg max-h-96 overflow-y-auto"
              >
                {filteredProducts.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      navigate(`/product/${p._id}`);
                      setSearchQuery("");
                    }}
                    className="flex gap-4 p-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={fakeImage}
                      alt="product"
                      className="w-16 h-16 object-contain"
                    />
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-gray-600">
                        ${p.price?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-6 relative">
            {isAuthenticated && (
              <Link to="/chat" className="relative">
                <FiMessageSquare className="text-xl" />
                {chatNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {chatNotifications}
                  </span>
                )}
              </Link>
            )}

            {/* USER */}
            <div ref={ref} className="relative">
                <div
                  onClick={() => setShowUser(!showUser)}
                  className="cursor-pointer"
                >
                  <FiUser className="text-xl" />
                </div>

                {showUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                  >
                    {isAuthenticated ? (
                      <>
                        {/* HEADER */}
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm text-gray-500">Hello,</p>
                          <p className="font-semibold text-gray-900 truncate">
                            {userName}
                          </p>
                        </div>

                        {/* MENU */}
                        <div className="py-2 text-sm text-gray-800">
                          <Link to="/profile" onClick={() => setShowUser(false)}>
                            <div className="flex items-center gap-3 px-4 h-10 leading-none hover:bg-gray-100">
                              <span className="w-5 h-5 flex items-center justify-center text-gray-600">
                                <RiUserSettingsLine className="text-[18px]" />
                              </span>
                              <span>Profile</span>
                            </div>
                          </Link>

                          <Link to="/order-history" onClick={() => setShowUser(false)}>
                            <div className="flex items-center gap-3 px-4 h-10 leading-none hover:bg-gray-100">
                              <MdOutlineHistory className="text-lg text-gray-600" />
                              <span>Orders</span>
                            </div>
                          </Link>

                          <Link to="/my-reviews" onClick={() => setShowUser(false)}>
                            <div className="flex items-center gap-3 px-4 h-10 leading-none hover:bg-gray-100">
                              <MdOutlineRateReview className="text-lg text-gray-600" />
                              <span>Reviews</span>
                            </div>
                          </Link>

                          <Link to="/disputes" onClick={() => setShowUser(false)}>
                            <div className="flex items-center gap-3 px-4 h-10 leading-none hover:bg-gray-100">
                              <RiShieldLine className="text-lg text-gray-600" />
                              <span>Disputes</span>
                            </div>
                          </Link>

                          <Link to="/return-requests" onClick={() => setShowUser(false)}>
                            <div className="flex items-center gap-3 px-4 h-10 leading-none hover:bg-gray-100">
                              <FaExchangeAlt className="text-lg text-gray-600" />
                              <span>Returns</span>
                            </div>
                          </Link>
                        </div>

                        {/* LOGOUT */}
                        <div className="border-t border-gray-200">
                          <div
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <FiLogOut className="text-lg" />
                            <span className="font-medium">Logout</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-4">
                        <Link
                          to="/signin"
                          className="block bg-[#3665f3] hover:bg-[#2b4fd8] text-white text-center py-2 rounded mb-2"
                          onClick={() => setShowUser(false)}
                        >
                          Sign in
                        </Link>
                        <Link
                          to="/signup"
                          className="block border border-gray-300 text-center py-2 rounded hover:bg-gray-100"
                          onClick={() => setShowUser(false)}
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>


            {/* CART */}
            <Link to="/cart" className="relative">
              <FiShoppingBag className="text-xl" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartTotalCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
